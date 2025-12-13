// assets/calendar.js

const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
const DAYS_LOOKAHEAD = 3;

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
    const limit = endOfDay(addDays(today, DAYS_LOOKAHEAD));

    // 🔹 filtra SOLO eventi rilevanti
    const validEvents = events.filter(ev =>
      ev.start && ev.end &&
      ev.end >= today &&
      ev.start <= limit
    );

    // 🔹 raggruppa per giorno
    const daysMap = {};

    validEvents.forEach(ev => {
      let cursor = startOfDay(ev.start);
      const last = startOfDay(ev.end);

      while (cursor <= last) {
        if (cursor >= today && cursor <= limit) {
          const key = formatDayLabel(cursor);
          if (!daysMap[key]) daysMap[key] = [];
          daysMap[key].push(ev);
        }
        cursor = addDays(cursor, 1);
      }
    });

    container.innerHTML = "";

    Object.keys(daysMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach(dayLabel => {
        const dayEvents = daysMap[dayLabel]
          .sort((a, b) => a.start - b.start);
        container.appendChild(renderDay(dayLabel, dayEvents));
      });

  } catch (err) {
    console.error("Calendario error:", err);
    container.innerHTML = `<div class="lcars-calendar-error">CALENDARIO OFFLINE</div>`;
  }
}

/* ---------- RENDER ---------- */

function renderDay(label, events) {
  const day = document.createElement("div");
  day.className = "lcars-calendar-day";

  const title = document.createElement("div");
  title.className = "lcars-calendar-date";
  title.textContent = label;
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

/* ---------- PARSER ICS ---------- */

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
        if (!current.end) {
          current.end = endOfDay(current.start);
        }
        events.push(current);
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

      if (current.allDay) {
        const d = parseDate(value);
        current.start = startOfDay(d);
      } else {
        current.start = parseDateTime(value);
      }
    }

    else if (line.startsWith("DTEND")) {
      const value = line.split(":")[1];

      if (current.allDay) {
        const d = parseDate(value);
        current.end = endOfDay(addDays(d, -1));
      } else {
        current.end = parseDateTime(value);
      }
    }
  }

  return events;
}

/* ---------- DATE UTILS ---------- */

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

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatDayLabel(d) {
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).toUpperCase();
}

function escapeHTML(str) {
  return str.replace(/[&<>]/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])
  );
}
