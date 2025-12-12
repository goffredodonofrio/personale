console.log("🟢 calendar.js CARICATO");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 DOM pronto — calendar.js");
});

// ===============================
// CONFIG
// ===============================
const ICS_URL =
  "https://calendar.google.com/calendar/ical/36eed2a61qm05b8ubdpbkja2q0%40group.calendar.google.com/public/basic.ics";

const MAX_EVENTS = 7;            // quanti eventi mostrare
const LOOKAHEAD_DAYS = 7;        // oggi + prossimi N giorni

// ===============================
document.addEventListener("DOMContentLoaded", loadCalendar);

// ===============================
// FETCH & PARSE
// ===============================
async function loadCalendar() {
  try {
    console.log("🌐 Fetch calendario →", ICS_URL);
    const res = await fetch(ICS_URL, { cache: "no-store" });
    const text = await res.text();
    const events = parseICS(text);
    renderEvents(events);
  } catch (err) {
    console.error("❌ Errore calendario:", err);
  }
}

// ===============================
// PARSER ICS (minimal & robusto)
// ===============================
function parseICS(icsText) {
  const lines = icsText.split(/\r?\n/);
  const events = [];

  let current = null;

  lines.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
    }

    if (current) {
      if (line.startsWith("DTSTART")) {
        current.start = parseICSDate(line);
      }

      if (line.startsWith("DTEND")) {
        current.end = parseICSDate(line);
      }

      if (line.startsWith("SUMMARY")) {
        current.title = line.replace("SUMMARY:", "").trim();
      }
    }

    if (line.startsWith("END:VEVENT") && current) {
      events.push(current);
      current = null;
    }
  });

  return filterAndSortEvents(events);
}

// ===============================
// DATE PARSER ICS → Date
// ===============================
function parseICSDate(line) {
  // DTSTART;VALUE=DATE:20251212
  // DTSTART:20251212T183000
  const value = line.split(":")[1];

  if (!value) return null;

  // All-day
  if (value.length === 8) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }

  // Timed
  const y = value.slice(0, 4);
  const m = value.slice(4, 6);
  const d = value.slice(6, 8);
  const h = value.slice(9, 11);
  const min = value.slice(11, 13);

  return new Date(`${y}-${m}-${d}T${h}:${min}:00`);
}

// ===============================
// FILTER + SORT
// ===============================
function filterAndSortEvents(events) {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + LOOKAHEAD_DAYS);

  return events
    .filter(e => e.start && e.start >= now && e.start <= limit)
    .sort((a, b) => a.start - b.start)
    .slice(0, MAX_EVENTS);
}

// ===============================
// RENDER LCARS OPS
// ===============================
function renderEvents(events) {
  const row = document.getElementById("events-row");
  if (!row) return;

  row.innerHTML = "";

  if (events.length === 0) {
    row.innerHTML = `<div style="opacity:.6">Nessun evento imminente</div>`;
    return;
  }

  events.forEach(ev => {
    const date = ev.start;

    const dayLabel = date
      .toLocaleDateString("it-IT", { weekday: "short", day: "2-digit" })
      .toUpperCase();

    const isAllDay =
      date.getHours() === 0 && date.getMinutes() === 0;

    const timeLabel = isAllDay
      ? "TUTTO IL GIORNO"
      : date.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit"
        });

    const card = `
      <div class="ops-event-pill">
        <div class="ops-event-header">${dayLabel}</div>
        <div class="ops-event-title">${timeLabel}</div>
        <div class="ops-event-footer">${ev.title || "Evento"}</div>
      </div>
    `;

    row.insertAdjacentHTML("beforeend", card);
  });
}
