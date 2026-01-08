 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/assets/meteo.js b/assets/meteo.js
index 411765310c425d3686d175971d0f8945b8463f07..afc6171d4f1db5955da0b45f698e09fc76fd3801 100644
--- a/assets/meteo.js
+++ b/assets/meteo.js
@@ -1,150 +1,173 @@
 console.log("🟣 meteo.js — LCARS ICON EDITION FINAL");
 
 // Coordinate Torino
 const LAT = 45.0703;
 const LON = 7.6869;
 
 /* -----------------------------------------------------
    SVG ICONS — inline, indipendenti dal CSS
 ------------------------------------------------------ */
 function iconSVG(code) {
+  const frame = `
+    <rect x="6" y="6" width="52" height="52" rx="18"
+      fill="none" stroke="black" stroke-width="3"/>
+  `;
+
+  if ([0, 1].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <circle cx="32" cy="30" r="10" fill="currentColor" stroke="black" stroke-width="3"/>
+        <rect x="28" y="44" width="8" height="10" rx="4" class="accent" stroke="black" stroke-width="2"/>
+      </svg>
+    `;
+  }
+
+  if ([2, 3].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <rect x="12" y="30" width="40" height="16" rx="8" fill="currentColor" stroke="black" stroke-width="3"/>
+        <rect x="18" y="22" width="28" height="14" rx="7" fill="currentColor" stroke="black" stroke-width="3"/>
+      </svg>
+    `;
+  }
+
+  if ([45, 48].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <rect x="10" y="24" width="44" height="10" rx="5" fill="currentColor" stroke="black" stroke-width="3"/>
+        <rect x="16" y="38" width="32" height="10" rx="5" class="accent" stroke="black" stroke-width="2"/>
+        <rect x="20" y="50" width="24" height="6" rx="3" class="accent" stroke="black" stroke-width="2"/>
+      </svg>
+    `;
+  }
+
+  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <rect x="12" y="22" width="40" height="16" rx="8" fill="currentColor" stroke="black" stroke-width="3"/>
+        <rect x="18" y="40" width="6" height="14" rx="3" class="accent" stroke="black" stroke-width="2"/>
+        <rect x="30" y="40" width="6" height="14" rx="3" class="accent" stroke="black" stroke-width="2"/>
+        <rect x="42" y="40" width="6" height="14" rx="3" class="accent" stroke="black" stroke-width="2"/>
+      </svg>
+    `;
+  }
+
+  if ([71, 73, 75].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <rect x="12" y="22" width="40" height="16" rx="8" fill="currentColor" stroke="black" stroke-width="3"/>
+        <rect x="26" y="42" width="12" height="12" rx="3" class="accent" stroke="black" stroke-width="2"/>
+      </svg>
+    `;
+  }
 
-  if ([0,1].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <circle cx="32" cy="32" r="14" fill="white" stroke="black" stroke-width="3"/>
-    </svg>`;
-
-  if ([2,3].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <ellipse cx="32" cy="38" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
-      <ellipse cx="22" cy="36" rx="14" ry="10" fill="white" stroke="black" stroke-width="3"/>
-    </svg>`;
-
-  if ([45,48].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <rect x="10" y="24" width="44" height="6" fill="white" stroke="black" stroke-width="2"/>
-      <rect x="14" y="34" width="36" height="6" fill="white" stroke="black" stroke-width="2"/>
-      <rect x="10" y="44" width="44" height="6" fill="white" stroke="black" stroke-width="2"/>
-    </svg>`;
-
-  if ([51,53,55,61,63,65,80,81,82].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <ellipse cx="32" cy="28" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
-      <line x1="20" y1="44" x2="16" y2="56" stroke="black" stroke-width="3"/>
-      <line x1="32" y1="44" x2="28" y2="56" stroke="black" stroke-width="3"/>
-      <line x1="44" y1="44" x2="40" y2="56" stroke="black" stroke-width="3"/>
-    </svg>`;
-
-  if ([71,73,75].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <ellipse cx="32" cy="28" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
-      <text x="32" y="52" font-size="22" text-anchor="middle"
-            fill="white" stroke="black" stroke-width="2">*</text>
-    </svg>`;
-
-  if ([95,96,99].includes(code))
-    return `<svg viewBox="0 0 64 64">
-      <ellipse cx="32" cy="26" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
-      <polygon points="28,40 40,40 32,58"
-               fill="yellow" stroke="black" stroke-width="3"/>
-    </svg>`;
+  if ([95, 96, 99].includes(code)) {
+    return `
+      <svg viewBox="0 0 64 64" aria-hidden="true">
+        ${frame}
+        <rect x="12" y="18" width="40" height="14" rx="7" fill="currentColor" stroke="black" stroke-width="3"/>
+        <polygon points="28,36 40,36 32,58" class="accent" stroke="black" stroke-width="2"/>
+        <rect x="12" y="34" width="40" height="6" rx="3" class="accent" stroke="black" stroke-width="2"/>
+      </svg>
+    `;
+  }
 
   return "";
 }
 
 /* ----------------------------------------------------- */
 
 document.addEventListener("DOMContentLoaded", loadWeather);
 
 function loadWeather() {
 
   const url =
     `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
     `&current_weather=true&forecast_days=7` +
     `&hourly=relativehumidity_2m,precipitation_probability` +
     `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
     `&timezone=Europe%2FRome`;
 
   fetch(url)
     .then(r => r.json())
     .then(updateWeather)
     .catch(err => console.error("❌ Meteo fetch error", err));
 }
 
 /* hourly più vicino all’ora corrente */
 function findClosestIndex(targetIso, arr) {
   let best = 0;
   let min = Infinity;
   const target = new Date(targetIso).getTime();
 
   arr.forEach((x, i) => {
     const d = Math.abs(new Date(x).getTime() - target);
     if (d < min) { min = d; best = i; }
   });
 
   return best;
 }
 
 function updateWeather(data) {
 
   if (!data.current_weather || !data.daily) return;
 
   const cw = data.current_weather;
 
-  // Metriche attuali
-  document.getElementById("weather-temp").textContent =
-    `${Math.round(cw.temperature)}°C`;
+  // Metriche attuali (se presenti)
+  const tempEl = document.getElementById("weather-temp");
+  if (tempEl) {
+    tempEl.textContent = `${Math.round(cw.temperature)}°C`;
+  }
 
-  document.getElementById("weather-wind").textContent =
-    `${Math.round(cw.windspeed)} km/h`;
+  const windEl = document.getElementById("weather-wind");
+  if (windEl) {
+    windEl.textContent = `${Math.round(cw.windspeed)} km/h`;
+  }
 
   const idx = findClosestIndex(cw.time, data.hourly.time);
 
-  document.getElementById("weather-humidity").textContent =
-    `${data.hourly.relativehumidity_2m[idx]}%`;
+  const humidityEl = document.getElementById("weather-humidity");
+  if (humidityEl) {
+    humidityEl.textContent = `${data.hourly.relativehumidity_2m[idx]}%`;
+  }
 
-  document.getElementById("weather-rain").textContent =
-    `${data.hourly.precipitation_probability[idx]}%`;
+  const rainEl = document.getElementById("weather-rain");
+  if (rainEl) {
+    rainEl.textContent = `${data.hourly.precipitation_probability[idx]}%`;
+  }
 
   // Previsioni 7 giorni
   const grid = document.getElementById("forecast-grid");
   grid.innerHTML = "";
 
   for (let i = 0; i < 7; i++) {
 
     const date = new Date(data.daily.time[i]);
     const code = data.daily.weathercode[i];
 
     const label = (i === 0)
       ? "OGGI"
       : date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();
 
     const tmin = Math.round(data.daily.temperature_2m_min[i]);
     const tmax = Math.round(data.daily.temperature_2m_max[i]);
 
     const card = `
-      <div class="ops-forecast-pill" style="
-        display:flex;
-        flex-direction:column;
-        align-items:center;
-        text-align:center;
-        padding:1rem 0.5rem;
-        gap:0.35rem;">
-
-        <div style="font-weight:700; font-size:1.05rem;">
-          ${label}
-        </div>
-
-        <div class="forecast-icon" style="width:60px; height:60px;">
+      <div class="ops-forecast-pill">
+        <div class="forecast-day">${label}</div>
+        <div class="forecast-icon">
           ${iconSVG(code)}
         </div>
-
-        <div style="font-weight:700;">
-          ${tmin}° / ${tmax}°
-        </div>
+        <div class="forecast-temp">${tmin}° / ${tmax}°</div>
       </div>
     `;
 
     grid.insertAdjacentHTML("beforeend", card);
   }
 }
 
EOF
)
