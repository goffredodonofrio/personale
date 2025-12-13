// ================================
// LCARS CALENDAR — SIMPLE LIST
// ================================

// URL pubblico ICS
const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";

// configurazione
const DAYS_AHEAD = 3; // oggi + 2 giorni

// ================================
// UTILS
// ================================

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDayLabel(date) {
  return date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).toUpperCase();
}

function formatTime(date, allDay) {
  if (allDay) return "Tutto il giorno";
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ================================
// LOAD & RENDER
// ================================

async function loadCalendar() {
  const container = document.getElementById("calendar");
  if (!container) return;

  container.innerHTML = "CARICAMENTO CALENDARIO…";

  try {
    const res = await fetch(CALENDAR_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const icsText = await res.text();
    const events = parseICS(icsText);

    const today = startOfDay(new Date());
    const days = [];

    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    container.innerHTML = "";

    days.forEach(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayEvents = events
        .filter(ev => ev.start && ev.start >= dayStart && ev.start < dayEnd)
        .sort((a, b) => a.start - b.start);

      const block = document.createElement("div");
      block.className = "calendar-day";

      let html = `<h4 class="day-label">${formatDayLabel(day)}</h4>`;

      if (dayEvents.length === 0) {
        html += `<div class="no-events">— nessun evento familiare</div>`;
      } else {
        html += `<ul class="event-list">`;
        dayEvents.forEach(ev => {
          html += `
            <li class="event-line">
              <span class="event-time">${formatTime(ev.start, ev.allDay)}</span>
              <span class="event-sep"> | </span>
              <span class="event-title">${escapeHTML(ev.title || "Evento")}</span>
            </li>
          `;
        });
        html += `</ul>`;
      }

      block.innerHTML = html;
      container.appendChild(block);
    });

  } catch (err) {
    console.error("Errore calendario:", err);
    container.innerHTML = "CALENDARIO OFFLINE";
  }
}

// ================================
// ICS PARSER (robusto)
// ================================

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
      if (current && current.start) events.push(current);
      current = null;
    } 
    else if (!current) continue;

    else if (line.startsWith("SUMMARY:")) {
      current.title = line.substring(8).replace(/\\n/g, " ").trim();
    } 
    else if (line.startsWith("DTSTART")) {
      const parts = line.split(":");
      const meta = parts[0];
      const value = parts[1];

      if (meta.includes("VALUE=DATE")) {
        current.allDay = true;
        current.start = parseDateOnly(value);
      } else {
        current.allDay = false;
        current.start = parseDateTime(value);
      }
    }
  }

  return events;
}

function parseDateOnly(v) {
  const y = Number(v.slice(0, 4));
  const m = Number(v.slice(4, 6)) - 1;
  const d = Number(v.slice(6, 8));
  return new Date(y, m, d);
}

function parseDateTime(v) {
  const y = Number(v.slice(0, 4));
  const m = Number(v.slice(4, 6)) - 1;
  const d = Number(v.slice(6, 8));
  const h = Number(v.slice(9, 11));
  const min = Number(v.slice(11, 13)) || 0;
  const s = Number(v.slice(13, 15)) || 0;

  if (v.endsWith("Z")) {
    return new Date(Date.UTC(y, m, d, h, min, s));
  }
  return new Date(y, m, d, h, min, s);
}

// ================================
// INIT
// ================================

document.addEventListener("DOMContentLoaded", () => {
  loadCalendar();
  setInterval(loadCalendar, 15 * 60 * 1000);
});
