// assets/calendar.js

const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
const DAYS_AHEAD = 7;

document.addEventListener("DOMContentLoaded", () => {
  loadCalendarEvents();
  setInterval(loadCalendarEvents, 15 * 60 * 1000);
});

async function loadCalendarEvents() {
  const container = document.getElementById("events-row");
  if (!container) return;

  container.innerHTML = `<div class="lcars-calendar-loading">CARICAMENTO CALENDARIO…</div>`;

  try {
    const res = await fetch(CALENDAR_URL);
    if (!res.ok) throw new Error(res.status);

    const text = await res.text();
    const events = parseICS(text);

    const now = startOfDay(new Date());
    const end = new Date(now);
    end.setDate(end.getDate() + DAYS_AHEAD);

    const byDay = groupEventsByDay(events, now, end);

    container.innerHTML = "";
    Object.keys(byDay).forEach(dayKey => {
      container.appendChild(renderDay(dayKey, byDay[dayKey]));
    });

  } catch (err) {
    console.error(err);
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

  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "lcars-calendar-empty";
    empty.textContent = "— nessun evento familiare —";
    day.appendChild(empty);
    return day;
  }

  events.forEach(ev => {
    const row = document.createElement("div");
    row.className = "lcars-calendar-event";

    const time = ev.allDay
      ? "—"
      : ev.start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

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

/* ---------- DATA ---------- */

function groupEventsByDay(events, start, end) {
  const map = {};
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = cursor.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).toUpperCase();

    map[key] = [];
    cursor.setDate(cursor.getDate() + 1);
  }

  events.forEach(ev => {
    if (!ev.start) return;
    if (ev.start < start || ev.start > end) return;

    const key = ev.start.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).toUpperCase();

    if (map[key]) map[key].push(ev);
  });

  Object.values(map).forEach(list =>
    list.sort((a, b) => a.start - b.start)
  );

  return map;
}

/* ---------- PARSER ICS ---------- */

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
    else if (line.startsWith("SUMMARY:"))
      current.title = line.substring(8).replace(/\\n/g, " ");
    else if (line.startsWith("DTSTART")) {
      const value = line.split(":")[1];
      current.allDay = line.includes("VALUE=DATE");
      current.start = current.allDay ? parseDate(value) : parseDateTime(value);
    }
  }
  return events;
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

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function escapeHTML(str) {
  return str.replace(/[&<>]/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])
  );
}
