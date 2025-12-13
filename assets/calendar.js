const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
const DAYS_TO_SHOW = 3;
const LOOKAHEAD_DAYS = 14;

document.addEventListener("DOMContentLoaded", () => {
  loadCalendarEvents();
  setInterval(loadCalendarEvents, 15 * 60 * 1000);
});

async function loadCalendarEvents() {
  const container = document.getElementById("events-row");
  if (!container) return;

  container.innerHTML = `<div class="lcars-calendar-loading">CARICAMENTO CALENDARIO…</div>`;

  try {
    const res = await fetch(CALENDAR_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);

    const text = await res.text();
    const events = parseICS(text);

    const today = startOfDay(new Date());
    const endLimit = endOfDay(addDays(today, LOOKAHEAD_DAYS));

    // espandi eventi per giorno
    const eventsByDay = {};

    events.forEach(ev => {
      if (!ev.start) return;

      const start = startOfDay(ev.start);
      const end = ev.end ? startOfDay(ev.end) : start;

      let cursor = new Date(start);
      while (cursor <= end && cursor <= endLimit) {
        if (cursor >= today) {
          const key = dayKey(cursor);
          if (!eventsByDay[key]) eventsByDay[key] = [];
          eventsByDay[key].push(ev);
        }
        cursor = addDays(cursor, 1);
      }
    });

    // ordina i giorni
    const orderedDays = Object.keys(eventsByDay)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(0, DAYS_TO_SHOW);

    container.innerHTML = "";

    orderedDays.forEach(key => {
      const dayDate = new Date(key);
      const dayEvents = eventsByDay[key]
        .sort((a, b) => (a.start || 0) - (b.start || 0));
      container.appendChild(renderDay(dayDate, dayEvents));
    });

  } catch (err) {
    console.error("Calendar error:", err);
    container.innerHTML = `<div class="lcars-calendar-error">CALENDARIO OFFLINE</div>`;
  }
}

/* ---------- RENDER ---------- */

function renderDay(date, events) {
  const day = document.createElement("div");
  day.className = "lcars-calendar-day";

  const title = document.createElement("div");
  title.className = "lcars-calendar-date";
  title.textContent = formatDayLabel(date);
  day.appendChild(title);

  events.forEach(ev => {
    const row = document.createElement("div");
    row.className = "lcars-calendar-event";

    const time = ev.allDay
      ? "—"
      : ev.start.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit"
        });

    row.innerHTML = `
      <span class="lcars-dot">•</span>
      <span class="lcars-time">${time}</span>
      <span class="lcars-sep">|</span>
      <span class="lcars-title">${escapeHTML(ev.title)}</span>
    `;

    day.appendChild(row);
  });

  return day;
}

/* ---------- ICS PARSER ---------- */

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let raw of lines) {
    const line = raw.trim();

    if (line === "BEGIN:VEVENT") {
      current = {};
    }
    else if (line === "END:VEVENT") {
      if (current?.start) {
        expandEvent(current).forEach(e => events.push(e));
      }
      current = null;
    }
    else if (!current) continue;

    else if (line.startsWith("SUMMARY:")) {
      current.title = line.substring(8).replace(/\\n/g, " ");
    }
    else if (line.startsWith("DTSTART")) {
      const value = line.split(":")[1];
      current.allDay = line.includes("VALUE=DATE");
      current.start = current.allDay
        ? startOfDay(parseDate(value))
        : parseDateTime(value);
    }
    else if (line.startsWith("DTEND")) {
      const value = line.split(":")[1];
      current.end = current.allDay
        ? endOfDay(parseDate(value))
        : parseDateTime(value);
    }
    else if (line.startsWith("RRULE:")) {
      current.rrule = line.substring(6);
    }
  }

  return events;
}

/* ---------- RRULE (solo ciò che serve) ---------- */

function expandEvent(ev) {
  if (!ev.rrule) return [ev];

  const rule = parseRRule(ev.rrule);
  if (rule.freq !== "WEEKLY" || !rule.byDay) return [ev];

  const out = [];
  const today = startOfDay(new Date());
  const limit = addDays(today, LOOKAHEAD_DAYS);

  let cursor = startOfDay(ev.start);

  while (cursor <= limit) {
    if (cursor >= today && rule.byDay.includes(cursor.getDay())) {
      out.push({
        ...ev,
        start: new Date(cursor),
        end: ev.end
      });
    }
    cursor = addDays(cursor, 1);
  }

  return out;
}

function parseRRule(str) {
  const parts = {};
  str.split(";").forEach(p => {
    const [k, v] = p.split("=");
    parts[k] = v;
  });

  return {
    freq: parts.FREQ,
    byDay: parts.BYDAY
      ? parts.BYDAY.split(",").map(d =>
          ["SU","MO","TU","WE","TH","FR","SA"].indexOf(d)
        )
      : null
  };
}

/* ---------- DATE UTILS ---------- */

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function dayKey(d) {
  return startOfDay(d).toISOString().slice(0, 10);
}

function formatDayLabel(d) {
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).toUpperCase();
}

function parseDate(v) {
  return new Date(+v.slice(0,4), +v.slice(4,6)-1, +v.slice(6,8));
}

function parseDateTime(v) {
  const y = +v.slice(0,4);
  const m = +v.slice(4,6)-1;
  const d = +v.slice(6,8);
  const h = +v.slice(9,11);
  const min = +v.slice(11,13);
  return v.endsWith("Z")
    ? new Date(Date.UTC(y,m,d,h,min))
    : new Date(y,m,d,h,min);
}

function escapeHTML(str) {
  return str.replace(/[&<>]/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])
  );
}
