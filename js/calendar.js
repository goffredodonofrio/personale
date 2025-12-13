// assets/calendar.js

const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
const DAYS_TO_SHOW = 3;
const EXPANSION_DAYS = 14;

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
    const rawEvents = parseICS(text);

    const today = todayKey();
    const maxDate = addDaysKey(today, EXPANSION_DAYS);

    // 1️⃣ espandi ricorrenze
    const expanded = expandRecurringEvents(rawEvents, today, maxDate);

    // 2️⃣ raggruppa per giorno (STRING KEY, non Date)
    const grouped = groupByDay(expanded, today);

    // 3️⃣ mostra SOLO i primi 3 giorni con eventi
    container.innerHTML = "";
    Object.keys(grouped)
      .slice(0, DAYS_TO_SHOW)
      .forEach(dayKey => {
        container.appendChild(renderDay(dayKey, grouped[dayKey]));
      });

  } catch (err) {
    console.error("Calendario error:", err);
    container.innerHTML = `<div class="lcars-calendar-error">CALENDARIO OFFLINE</div>`;
  }
}

/* ---------- RENDER ---------- */

function renderDay(dayKey, events) {
  const day = document.createElement("div");
  day.className = "lcars-calendar-day";

  const title = document.createElement("div");
  title.className = "lcars-calendar-date";
  title.textContent = formatDayLabelFromKey(dayKey);
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

/* ---------- GROUPING ---------- */

function groupByDay(events, todayKeyStr) {
  const map = {};

  events
    .filter(ev => ev.dayKey >= todayKeyStr)
    .sort((a, b) => a.start - b.start)
    .forEach(ev => {
      if (!map[ev.dayKey]) map[ev.dayKey] = [];
      map[ev.dayKey].push(ev);
    });

  return map;
}

/* ---------- RRULE ---------- */

function expandRecurringEvents(events, startKey, endKey) {
  const out = [];

  events.forEach(ev => {
    // evento normale
    if (!ev.rrule) {
      if (ev.dayKey >= startKey && ev.dayKey <= endKey) {
        out.push(ev);
      }
      return;
    }

    // supporto base WEEKLY
    if (!ev.rrule.includes("FREQ=WEEKLY")) return;

    const byDay = ev.rrule.match(/BYDAY=([A-Z]{2})/)?.[1];
    if (!byDay) return;

    const map = { MO:1, TU:2, WE:3, TH:4, FR:5, SA:6, SU:0 };
    const targetDow = map[byDay];

    let cursor = keyToDate(startKey);
    const endDate = keyToDate(endKey);

    while (cursor <= endDate) {
      if (cursor.getDay() === targetDow) {
        out.push({
          title: ev.title,
          allDay: ev.allDay,
          start: ev.allDay
            ? new Date(cursor)
            : new Date(
                cursor.getFullYear(),
                cursor.getMonth(),
                cursor.getDate(),
                ev.start.getHours(),
                ev.start.getMinutes()
              ),
          dayKey: dateToKey(cursor)
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return out;
}

/* ---------- ICS PARSER ---------- */

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();

    if (line === "BEGIN:VEVENT") current = {};
    else if (line === "END:VEVENT") {
      if (current?.dayKey) events.push(current);
      current = null;
    }
    else if (!current) continue;

    else if (line.startsWith("SUMMARY:")) {
      current.title = line.substring(8).replace(/\\n/g, " ");
    }
    else if (line.startsWith("DTSTART")) {
      const value = line.split(":")[1];

      if (line.includes("VALUE=DATE")) {
        // ALL-DAY → chiave di data pura
        current.allDay = true;
        current.dayKey = value;
        current.start = keyToDate(value);
      } else {
        current.allDay = false;
        current.start = parseDateTime(value);
        current.dayKey = dateToKey(current.start);
      }
    }
    else if (line.startsWith("RRULE:")) {
      current.rrule = line.substring(6);
    }
  }

  return events;
}

/* ---------- DATE HELPERS (CHIAVE YYYYMMDD) ---------- */

function todayKey() {
  return dateToKey(new Date());
}

function dateToKey(d) {
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0")
  );
}

function keyToDate(key) {
  return new Date(
    Number(key.slice(0,4)),
    Number(key.slice(4,6)) - 1,
    Number(key.slice(6,8))
  );
}

function addDaysKey(key, days) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + days);
  return dateToKey(d);
}

function formatDayLabelFromKey(key) {
  const d = keyToDate(key);
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).toUpperCase();
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
