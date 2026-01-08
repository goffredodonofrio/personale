 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/assets/calendar.js b/assets/calendar.js
index 34ec952a5b1bcbd6f26cfb49f8533253f0283f7e..615b738df295a056a6a56da128876441e55a4519 100644
--- a/assets/calendar.js
+++ b/assets/calendar.js
@@ -1,110 +1,116 @@
 // assets/calendar.js — CALENDAR V1 (CONGELATA)
 
 const CALENDAR_URL = "https://calendar.goffredo-donofrio.workers.dev/";
-const DAYS_TO_SHOW = 3;      // quanti giorni con eventi mostrare
+const DAYS_TO_SHOW = 5;      // quanti giorni mostrare (anche senza eventi)
 const EXPANSION_DAYS = 14;   // finestra massima per cercare eventi futuri
 const MAX_PAST_DAYS = 60;    // limite sicurezza ricorrenze vecchie
 
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
     const res = await fetch(CALENDAR_URL, { cache: "no-store" });
     if (!res.ok) throw new Error(res.status);
 
     const text = await res.text();
     const rawEvents = parseICS(text);
 
     const todayKeyStr = todayKey();
     const maxKeyStr = addDaysKey(todayKeyStr, EXPANSION_DAYS);
 
     // 1️⃣ espandi eventi (normali + ricorrenti)
     const expandedEvents = expandRecurringEvents(
       rawEvents,
       todayKeyStr,
       maxKeyStr
     );
 
     // 2️⃣ raggruppa per giorno (da oggi in avanti)
     const grouped = groupByDay(expandedEvents, todayKeyStr);
 
-    // 3️⃣ renderizza SOLO i primi 3 giorni con eventi
+    // 3️⃣ renderizza i prossimi N giorni (anche senza eventi)
     container.innerHTML = "";
 
-    Object.keys(grouped)
-      .sort()
-      .slice(0, DAYS_TO_SHOW)
-      .forEach(dayKey => {
-        container.appendChild(renderDay(dayKey, grouped[dayKey]));
-      });
+    for (let i = 0; i < DAYS_TO_SHOW; i++) {
+      const dayKey = addDaysKey(todayKeyStr, i);
+      const events = grouped[dayKey] || [];
+      container.appendChild(renderDay(dayKey, events));
+    }
 
   } catch (err) {
     console.error("Calendario error:", err);
     container.innerHTML =
       `<div class="lcars-calendar-error">CALENDARIO OFFLINE</div>`;
   }
 }
 
 /* =========================================================
    RENDER
    ========================================================= */
 
 function renderDay(dayKey, events) {
   const dayBlock = document.createElement("div");
   dayBlock.className = "lcars-day-block";
 
   /* HEADER */
   const header = document.createElement("div");
   header.className = "lcars-day-header";
 
   const dot = document.createElement("div");
   dot.className = "lcars-day-dot";
 
   const title = document.createElement("div");
   title.textContent = formatDayLabelFromKey(dayKey);
 
   header.appendChild(dot);
   header.appendChild(title);
 
   /* BAR */
   const bar = document.createElement("div");
   bar.className = "lcars-day-bar";
 
   /* EVENTS */
   const eventsWrap = document.createElement("div");
   eventsWrap.className = "lcars-day-events";
 
+  if (events.length === 0) {
+    const empty = document.createElement("div");
+    empty.className = "lcars-day-empty";
+    empty.textContent = "NESSUN EVENTO";
+    eventsWrap.appendChild(empty);
+  }
+
   events.forEach(ev => {
     const row = document.createElement("div");
     row.className = "lcars-day-event";
 
     const time = document.createElement("span");
     time.className = "event-time";
     time.textContent = ev.allDay
       ? "—"
       : ev.start.toLocaleTimeString("it-IT", {
           hour: "2-digit",
           minute: "2-digit"
         });
 
     const sep = document.createElement("span");
     sep.className = "event-sep";
     sep.textContent = "|";
 
     const title = document.createElement("span");
     title.className = "event-title";
     title.textContent = ev.title;
 
     const dot = document.createElement("span");
     dot.className = "event-dot";
     dot.textContent = "•";
 
 
EOF
)
