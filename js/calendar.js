// assets/calendar.js

// URL ICS pubblico del calendario Google
const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";

// Configurazione base
const MAX_EVENTS = 5;          // quante pill mostrare
const DAYS_AHEAD = 7;          // finestra di giorni futuri

async function loadCalendarEvents() {
    const eventsRow = document.getElementById("events-row");
    if (!eventsRow) return;

    eventsRow.innerHTML = '<div style="padding:1rem;color:var(--ld-blue-line);font-size:1rem;">CARICAMENTO CALENDARIO…</div>';

    try {
        const res = await fetch(CALENDAR_URL);
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }

        const icsText = await res.text();
        const events = parseICS(icsText);

        const now = new Date();
        const limit = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

        const upcoming = events
            .filter(ev => ev.start && ev.start >= now && ev.start <= limit)
            .sort((a, b) => a.start - b.start)
            .slice(0, MAX_EVENTS);

        eventsRow.innerHTML = "";

        if (upcoming.length === 0) {
            eventsRow.innerHTML = '<div style="padding:1rem;color:var(--ld-blue-line);text-align:center;font-size:1.1rem;">Nessun evento imminente</div>';
            return;
        }

        upcoming.forEach(ev => {
            const pill = document.createElement("div");
            pill.className = "ops-event-pill";

            const dayStr = ev.start.toLocaleDateString("it-IT", {
                weekday: "short",
                day: "2-digit",
                month: "short"
            });

            const timeStr = ev.allDay
                ? "Tutto il giorno"
                : ev.start.toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit"
                  });

            pill.innerHTML = `
                <div class="ops-event-header">${dayStr}</div>
                <div class="ops-event-title">${escapeHTML(ev.title || "Evento")}</div>
                <div class="ops-event-footer">${timeStr}</div>
            `;

            eventsRow.appendChild(pill);
        });
    } catch (err) {
        console.error("Errore caricamento calendario:", err);
        eventsRow.innerHTML = '<div style="padding:1rem;color:var(--lcars-red);text-align:center;">CALENDARIO OFFLINE</div>';
    }
}

/**
 * Parsing molto semplice di un file ICS:
 * estrae SUMMARY, DTSTART, (opzionale) DTSTART;VALUE=DATE per eventi "all day".
 */
function parseICS(icsText) {
    const lines = icsText.split(/\r?\n/);
    const events = [];
    let current = null;

    for (let raw of lines) {
        const line = raw.trim();

        if (line === "BEGIN:VEVENT") {
            current = {};
        } else if (line === "END:VEVENT") {
            if (current && current.start) {
                events.push(current);
            }
            current = null;
        } else if (!current) {
            continue;
        } else if (line.startsWith("SUMMARY:")) {
            current.title = line.substring("SUMMARY:".length).replace(/\\n/g, " ").trim();
        } else if (line.startsWith("DTSTART")) {
            // Gestisce formati tipici Google Calendar: 
            // DTSTART:20251210T150000Z
            // DTSTART;TZID=Europe/Rome:20251210T160000
            // DTSTART;VALUE=DATE:20251210
            const parts = line.split(":");
            const meta = parts[0]; // es. "DTSTART;TZID=Europe/Rome" o "DTSTART;VALUE=DATE"
            const value = parts[1];

            if (meta.includes("VALUE=DATE")) {
                // evento "all day"
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

function parseDateOnly(yyyymmdd) {
    // yyyyMMdd → Date locale a mezzanotte
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6)) - 1;
    const d = Number(yyyymmdd.slice(6, 8));
    return new Date(y, m, d);
}

function parseDateTime(dt) {
    // Gestisce sia con "Z" (UTC) che senza (assunto locale)
    // Esempi: 20251210T150000Z, 20251210T160000
    const year = Number(dt.slice(0, 4));
    const month = Number(dt.slice(4, 6)) - 1;
    const day = Number(dt.slice(6, 8));
    const hour = Number(dt.slice(9, 11));
    const min = Number(dt.slice(11, 13)) || 0;
    const sec = Number(dt.slice(13, 15)) || 0;

    if (dt.endsWith("Z")) {
        return new Date(Date.UTC(year, month, day, hour, min, sec));
    } else {
        return new Date(year, month, day, hour, min, sec);
    }
}

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Primo caricamento + refresh periodico
document.addEventListener("DOMContentLoaded", () => {
    loadCalendarEvents();
    setInterval(loadCalendarEvents, 15 * 60 * 1000); // ogni 15 minuti
});
