console.log("🟦 LCARS CALENDAR — ONLINE");

document.addEventListener("DOMContentLoaded", loadEvents);

// 📌 Per ora: eventi statici. Poi li colleghiamo a Google Calendar o JSON GitHub.
const EVENTS = [
  {
    date: "2025-12-11",
    time: "14:30",
    title: "PALESTRA",
    duration: "1h"
  },
  {
    date: "2025-12-11",
    time: "18:00",
    title: "RIUNIONE COMO TV",
    duration: "2h"
  },
  {
    date: "2025-12-12",
    time: "09:00",
    title: "MATCH ANALYSIS",
    duration: "90 min"
  },
  {
    date: "2025-12-12",
    time: "21:00",
    title: "COMO 1907 — LIVE OPS",
    duration: "3h"
  }
];

function loadEvents() {
  const container = document.getElementById("events-row");
  if (!container) return;

  container.innerHTML = "";

  EVENTS.forEach(ev => {
    const day = new Date(ev.date).toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).replace(".", "");

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="ops-event-pill">
          
          <div class="ops-event-header">
            ${day} • ${ev.time}
          </div>

          <div class="ops-event-title">
            ${ev.title}
          </div>

          <div class="ops-event-footer">
            durata: ${ev.duration}
          </div>

      </div>
      `
    );
  });
}
