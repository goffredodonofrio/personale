console.log("📅 calendar.js — LCARS OPS Calendar LOADED");

// 👉 URL ICS PRIVATO
const ICS_URL =
  "https://calendar.google.com/calendar/ical/36eed2a61qm05b8ubdpbkja2q0%40group.calendar.google.com/private-a9d9527ea97ec363e19fd6fe54298e6f/basic.ics";

// Contenitore pillole
const eventsRow = document.getElementById("events-row");

document.addEventListener("DOMContentLoaded", loadCalendar);

async function loadCalendar() {
  try {
    console.log("📡 Fetching ICS:", ICS_URL);

    const response = await fetch(ICS_URL);
    if (!response.ok) throw new Error("Errore fetch ICS: " + response.status);

    const text = await response.text();
    const events = parseICS(text);

    console.log("📅 Eventi trovati:", events);

    renderEvents(events.slice(0, 6)); // Mostriamo max 6 eventi per scorrimento
  } catch (err) {
    console.error("❌ Errore caricamento calendario:", err);
  }
}

/* ============================================================
   PARSER ICS MINIMALE — Estrae SUMMARY, DTSTART, DTEND
   ============================================================ */
function parseICS(ics) {
  const lines = ics.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      if (line.startsWith("SUMMARY:")) {
        current.summary = line.replace("SUMMARY:", "").trim();
      }
      if (line.startsWith("DTSTART")) {
        current.start = parseICSDate(line);
      }
      if (line.startsWith("DTEND")) {
        current.end = parseICSDate(line);
      }
    }
  }

  // Ordina per data
  return events
    .filter(e => e.start)
    .sort((a, b) => a.start - b.start);
}

/* Converte date ICS (es: 20251218T130000Z) */
function parseICSDate(line) {
  const parts = line.split(":");
  if (parts.length < 2) return null;
  const raw = parts[1].trim();
  return raw.endsWith("Z") ? new Date(raw) : new Date(raw + "Z");
}

/* ============================================================
   RENDER — Crea pillole stile OPS
   ============================================================ */
function renderEvents(events) {
  eventsRow.innerHTML = ""; // Pulisce

  events.forEach(ev => {
    const d = ev.start;
    const day = d.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });

    const time =
      d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) + "";

    const html = `
      <div class="ops-event-pill">
          <div class="ops-event-header">${day}</div>
          <div class="ops-event-title">${ev.summary}</div>
          <div class="ops-event-footer">${time}</div>
      </div>
    `;

    eventsRow.insertAdjacentHTML("beforeend", html);
  });
}
