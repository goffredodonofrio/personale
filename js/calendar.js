// ======================================
// CALENDAR — FAMILY OPS (LCARS STYLE)
// ======================================

// URL ICS servito via Cloudflare Worker
const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";

// Configurazione
const MAX_EVENTS = 10;      // sicurezza: max eventi totali
const DAYS_AHEAD = 7;       // oggi + prossimi N giorni
const REFRESH_MINUTES = 15; // refresh automatico

// ======================================
// BOOT
// ======================================
document.addEventListener("DOMContentLoaded", () => {
    loadCalendarEvents();
    setInterval(loadCalendarEvents, REFRESH_MINUTES * 60 * 1000);
});

// ======================================
// MAIN
// ======================================
async function loadCalendarEvents() {
    const eventsRow = document.getElementById("events-row");
    if (!eventsRow) return;

    eventsRow.innerHTML =
        `<div style="padding:1rem;color:var(--ld-blue-line);font-size:1rem;">
            CARICAMENTO CALENDARIO…
         </div>`;

    try {
        const res = await fetch(CALENDAR_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const icsText = await res.text();
        const events = parseICS(icsText);

        renderEventsByDay(events, eventsRow);
    } catch (err) {
        console.error("❌ Errore calendario:", err);
        eventsRow.innerHTML =
            `<div style="padding:1rem;color:var(--lcars-red);text-align:center;">
                CALENDARIO OFFLINE
             </div>`;
    }
}

// ======================================
// RENDER — RAGGRUPPATO PER GIORNO
// ======================================
function renderEventsByDay(events, container) {
    container.innerHTML = "";

    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + DAYS_AHEAD);

    // filtra finestra temporale
    const upcoming = events
        .filter(ev => ev.start && ev.start >= now && ev.start <= limit)
        .sort((a, b) => a.start - b.start)
        .slice(0, MAX_EVENTS);

    // raggruppa per giorno
    const map = {};
    upcoming.forEach(ev => {
        const key = dateKey(ev.start);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
    });

    // ciclo giorno per giorno (anche se vuoto)
    for (let i = 0; i <= DAYS_AHEAD; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const key = dateKey(d);
        const label = d.toLocaleDateString("it-IT", {
            weekday: "short",
            day: "2-digit",
            month: "short"
        }).toUpperCase();

        const pill = document.createElement("div");
        pill.className = "ops-event-pill";

        // header giorno
        pill.innerHTML = `<div class="ops-event-day">${label}</div>`;

        // eventi del giorno
        if (!map[key] || map[key].length === 0) {
            pill.innerHTML += `
                <div class="ops-event-main">
                    <span class="ops-event-title">NESSUN EVENTO FAMILIARE</span>
                </div>
            `;
        } else {
            map[key].forEach(ev => {
                const timeStr = ev.allDay
                    ? "TUTTO IL GIORNO"
                    : ev.start.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit"
                      });

                pill.innerHTML += `
                    <div class="ops-event-main">
                        <span class="ops-event-title">${escapeHTML(ev.title)}</span>
                        <span class="ops-event-time">${timeStr}</span>
                    </div>
                `;
            });
        }

        container.appendChild(pill);
    }
}

// ======================================
// PARSER ICS (ROBUSTO, MINIMAL)
// ======================================
function parseICS(icsText) {
    const lines = icsText.split(/\r?\n/);
    const events = [];
    let current = null;

    for (let raw of lines) {
        const line = raw.trim();

        if (line === "BEGIN:VEVENT") {
            current = {};
        } else if (line === "END:VEVENT") {
            if (current && current.start) events.push(current);
            current = null;
        } else if (!current) {
            continue;
        } else if (line.startsWith("SUMMARY:")) {
            current.title = line
                .substring(8)
                .replace(/\\n/g, " ")
                .trim();
        } else if (line.startsWith("DTSTART")) {
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

// ======================================
// DATE HELPERS
// ======================================
function dateKey(date) {
    return date.toISOString().slice(0, 10);
}

function parseDateOnly(yyyymmdd) {
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6)) - 1;
    const d = Number(yyyymmdd.slice(6, 8));
    return new Date(y, m, d);
}

function parseDateTime(dt) {
    const year = Number(dt.slice(0, 4));
    const month = Number(dt.slice(4, 6)) - 1;
    const day = Number(dt.slice(6, 8));
    const hour = Number(dt.slice(9, 11));
    const min = Number(dt.slice(11, 13)) || 0;
    const sec = Number(dt.slice(13, 15)) || 0;

    return dt.endsWith("Z")
        ? new Date(Date.UTC(year, month, day, hour, min, sec))
        : new Date(year, month, day, hour, min, sec);
}

// ======================================
// SAFETY
// ======================================
function escapeHTML(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
