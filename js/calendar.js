console.log("🟦 LCARS CALENDAR — ICS EDITION");

document.addEventListener("DOMContentLoaded", loadICSEvents);

const ICS_URL = "https://calendar.google.com/calendar/ical/36eed2a61qm05b8ubdpbkja2q0%40group.calendar.google.com/public/basic.ics";

// ===============================
// 1) SCARICA L'ICS
// ===============================
async function loadICSEvents() {
  try {
    const res = await fetch(ICS_URL);
    const text = await res.text();
    const events = parseICS(text);

    renderEvents(events);
  } catch (e) {
    console.error("❌ Errore caricamento ICS", e);
  }
}

// ===============================
// 2) PARSER ICS SEMPLIFICATO
// ===============================
function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];

  let current = null;

  lines.forEach(l => {
    if (l.startsWith("BEGIN:VEVENT")) {
      current = {};
    } else if (l.startsWith("END:VEVENT")) {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      if (l.startsWith("DTSTART")) current.start = extractDate(l);
      if (l.startsWith("DTEND")) current.end = extractDate(l);
      if (l.startsWith("SUMMARY")) current.title = l.replace("SUMMARY:", "").trim();
    }
  });

  return events
    .filter(ev => ev.start)
    .sort((a, b) => a.start - b.start)
    .slice(0, 6); // Mostriamo i prossimi 6 eventi
}

// Converte "20250112T140000Z" in oggetto Date locale
function extractDate(line) {
  const raw = line.split(":")[1];
  // Gestiamo timezone Z (UTC)
  if (raw.endsWith("Z")) {
    return new Date(raw);
  }
  return new Date(raw);
}

// ===============================
// 3) RENDER LCARS EVENT PILLS
// ===============================
function renderEvents(events) {
  const container = document.getElementById("events-row");
  if (!container) return;

  container.innerHTML = "";

  events.forEach(ev => {
    const start = ev.start;
    const dayLabel = start.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).replace(".", "");

    const time = start.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="ops-event-pill">

          <div class="ops-event-header">
            ${dayLabel} • ${time}
          </div>

          <div class="ops-event-title">
            ${ev.title}
          </div>

          <div class="ops-event-footer">
            ${ev.end ? "fino alle " + ev.end.toLocaleTimeString("it-IT", {hour:"2-digit", minute:"2-digit"}) : ""}
          </div>

      </div>
      `
    );
  });
}
