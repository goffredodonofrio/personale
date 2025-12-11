console.log("🗓 calendar.js CARICATO");

// URL ICS
const ICS_URL =
  "https://calendar.google.com/calendar/ical/36eed2a61qm05b8ubdpbkja2q0%40group.calendar.google.com/public/basic.ics";

// Proxy per evitare problemi CORS
const PROXY = "https://corsproxy.io/?";

// Contenitore HTML
const eventsRow = document.getElementById("events-row");

// ===============================
//  FETCH + PARSE ICS
// ===============================
async function loadCalendar() {
  try {
    console.log("📡 Fetch ICS…");

    const res = await fetch(PROXY + ICS_URL);
    const text = await res.text();

    const events = parseICS(text);

    console.log("🟢 Eventi trovati:", events.length);

    renderEvents(events.slice(0, 6)); // primi 6 eventi

  } catch (err) {
    console.error("❌ ERRORE CALENDARIO:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCalendar);

// ===============================
//  PARSER ICS super leggero
// ===============================
function parseICS(icsText) {
  const events = [];
  const blocks = icsText.split("BEGIN:VEVENT");

  blocks.forEach(block => {
    if (!block.includes("DTSTART")) return;

    const start = extract(block, "DTSTART");
    const end = extract(block, "DTEND");
    const summary = extract(block, "SUMMARY");

    if (!start) return;

    events.push({
      start: parseDate(start),
      end: parseDate(end),
      title: summary || "Senza titolo"
    });
  });

  return events.sort((a, b) => a.start - b.start);
}

function extract(str, key) {
  const line = str.split("\n").find(x => x.startsWith(key));
  if (!line) return null;
  return line.split(":")[1].trim();
}

function parseDate(raw) {
  // Formati ICS: 20250101T140000Z o 20250101
  if (raw.includes("T")) {
    return new Date(raw);
  } else {
    return new Date(raw.substring(0, 4), raw.substring(4, 6) - 1, raw.substring(6, 8));
  }
}

// ===============================
//  RENDER in stile LCARS OPS
// ===============================
function renderEvents(events) {
  eventsRow.innerHTML = "";

  events.forEach(ev => {
    const d = ev.start;

    const day = d.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();
    const date = d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

    const html = `
      <div class="ops-event-pill">
        <div class="ops-event-header">${day} // ${date}</div>
        <div class="ops-event-title">${ev.title}</div>
        <div class="ops-event-footer">${time}</div>
      </div>
    `;

    eventsRow.insertAdjacentHTML("beforeend", html);
  });
}
