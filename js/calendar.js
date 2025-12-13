// ================================
// LCARS FAMILY CALENDAR — EVENTS ONLY
// ================================

const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
const MAX_DAYS_WITH_EVENTS = 3;

document.addEventListener("DOMContentLoaded", () => {
  loadCalendarEvents();
  setInterval(loadCalendarEvents, 15 * 60 * 1000);
});

async function loadCalendarEvents() {
  const container = document.getElementById("events-row");
  if (!container) return;

  container.innerHTML =
    `<div class="lcars-calendar-loading">CARICAMENTO CALENDARIO…</div>`;

  try {
    const res = await fetch(CALENDAR_URL);
    if (!res.ok) throw new Error(res.status);

    const text = await res.text();
    const events = parseICS(text);

    const grouped = groupEventsByDay(events);

    const daysWithEvents = Object.keys(grouped)
      .sort((a, b) => grouped[a][0].start - grouped[b][0].start)
      .slice(0, MAX_DAYS_WITH_EVENTS);

    container.innerHTML = "";

    daysWithEvents.forEach(dayKey => {
      container.appendChild(renderDay(dayKey, grouped[dayKey]));
    });

    if (daysWithEvents.length === 0) {
      container.innerHTML =
        `<div class="lcars-calendar-empty">NESSUN EVENTO IN CALENDARIO</div>`;
    }

  } catch (err) {
    console.error("Calendar error:", err);
    container.innerHTML =
      `<div class="lcars-calendar-error">CALENDARIO OFFLINE</div>`;
  }
}

/* ================================
   RENDER
================================ */

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

/* ================================
   GROUPING (EVENT DAYS ONLY)
================================ */

function groupEventsByDay(events) {
  const map = {};

  events.forEach(ev => {
    if (!ev.start) return;

    const dayKey = formatDay(startOfDay(ev.start));

    if (!map[dayKey]) map[dayKey] = [];
    map[dayKey].push(ev);
  });

  Object.values(map).forEach(list =>
    list.sort((a, b) => a.start - b.start)
  );

  return map;
}

/* ================================
   ICS PARSER
================================ */

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let raw of lines) {
    const line = raw.trim();

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
  }

  return events;
}

/* ================================
   DATE UTILS
================================ */

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDay(d) {
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).toUpperCase();
}

function parseDate(v) {
  return new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8));
}

function parseDateTime(v) {
  const y = +v.slice(0, 4);
  const m = +v.slice(4, 6) - 1;
  const d = +v.slice(6, 8);
  const h = +v.slice(9, 11);
  const min = +v.slice(11, 13);

  return v.endsWith("Z")
    ? new Date(Date.UTC(y, m, d, h, min))
    : new Date(y, m, d, h, min);
}

function escapeHTML(str = "") {
  return str.replace(/[&<>]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])
  );
}
