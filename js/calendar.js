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

    const today = startOfDay(new Date());
    const expansionEnd = endOfDay(addDays(today, EXPANSION_DAYS));

    // 1️⃣ espandi ricorrenze
    const expanded = expandRecurringEvents(rawEvents, today, expansionEnd);

    // 2️⃣ raggruppa per giorno
    const byDay = groupByDay(expanded, today);

    // 3️⃣ prendi SOLO i primi 3 giorni con eventi
    container.innerHTML = "";
    Object.keys(byDay)
      .slice(0, DAYS_TO_SHOW)
      .forEach(dayKey => {
        container.appendChild(renderDay(dayKey, byDay[dayKey]));
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

/* ---------- GROUPING ---------- */

function groupByDay(events, startDay) {
  const map = {};

  events
    .filter(ev => ev.start >= startDay)
    .sort((a, b) => a.start - b.start)
    .forEach(ev => {
      const key = formatDayLabel(ev.start);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });

  return map;
}

/* ---------- RRULE EXPANSION ---------- */

function expandRecurringEvents(events, start, end) {
  const out = [];

  events.forEach(ev => {
    if (!ev.rrule) {
      if (ev.start <= end) out.push(ev);
      return;
    }

    // supporto base: FREQ=WEEKLY;BYDAY=MO
    const rule = ev.rrule;
    if (!rule.includes("FREQ=WEEKLY")) return;

    const byDayMatch = rule.match(/BYDAY=([A-Z]{2})/);
    if (!byDayMatch) return;

    const dayMap = { MO:1, TU:2, WE:3, TH:4, FR:5, SA:6, SU:0 };
    const targetDow = dayMap[byDayMatch[1]];

    let cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getDay() === targetDow) {
        const occ = {
          title: ev.title,
          allDay: ev.allDay,
          start: new Date(
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate(),
            ev.start.getHours(),
            ev.start.getMinutes()
          )
        };
        out.push(occ);
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
      if (current?.start) events.push(current);
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
        ? parseDate(value)
        : parseDateTime(value);
    }
    else if (line.startsWith("RRULE:")) {
      current.rrule = line.substring(6);
    }
  }

  return events;
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
    ({ "&":"&amp;",
