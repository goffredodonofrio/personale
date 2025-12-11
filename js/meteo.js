console.log("🟣 meteo.js — LCARS ICON EDITION FIXED");

// Coordinate Torino
const LAT = 45.0703;
const LON = 7.6869;

// Testi meteo leggibili
const WEATHER_TEXT = {
  0: "Sereno", 1: "Sereno",
  2: "Parz. Nuvoloso", 3: "Molto nuvoloso",
  45: "Foschia", 48: "Foschia",
  51: "Pioviggine", 53: "Pioviggine", 55: "Pioviggine forte",
  61: "Pioggia", 63: "Pioggia", 65: "Pioggia forte",
  71: "Neve", 73: "Neve", 75: "Neve forte",
  80: "Rovesci", 81: "Rovesci", 82: "Rovesci forti",
  95: "Temporale", 96: "Temporale", 99: "Temporale"
};

/* -----------------------------------------------------
   SVG ICONS — totalmente inline, indipendenti dal CSS
------------------------------------------------------ */
function iconSVG(code) {
  if ([0,1].includes(code))
    return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="14" fill="white" stroke="black" stroke-width="3"/></svg>`;

  if ([2,3].includes(code))
    return `<svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="38" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
        <ellipse cx="22" cy="36" rx="14" ry="10" fill="white" stroke="black" stroke-width="3"/>
    </svg>`;

  if ([45,48].includes(code))
    return `<svg viewBox="0 0 64 64">
        <rect x="10" y="24" width="44" height="6" fill="white" stroke="black" stroke-width="2"/>
        <rect x="14" y="34" width="36" height="6" fill="white" stroke="black" stroke-width="2"/>
        <rect x="10" y="44" width="44" height="6" fill="white" stroke="black" stroke-width="2"/>
    </svg>`;

  if ([51,53,55,61,63,65,80,81,82].includes(code))
    return `<svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="28" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
        <line x1="20" y1="44" x2="16" y2="56" stroke="black" stroke-width="3"/>
        <line x1="32" y1="44" x2="28" y2="56" stroke="black" stroke-width="3"/>
        <line x1="44" y1="44" x2="40" y2="56" stroke="black" stroke-width="3"/>
    </svg>`;

  if ([71,73,75].includes(code))
    return `<svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="28" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
        <text x="32" y="52" font-size="22" text-anchor="middle" fill="white" stroke="black" stroke-width="2">*</text>
    </svg>`;

  if ([95,96,99].includes(code))
    return `<svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="26" rx="20" ry="12" fill="white" stroke="black" stroke-width="3"/>
        <polygon points="28,40 40,40 32,58" fill="yellow" stroke="black" stroke-width="3"/>
    </svg>`;

  return "";
}

/* --------------------------- */

document.addEventListener("DOMContentLoaded", loadWeather);

function loadWeather() {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  console.log("🌐 Fetch meteo →", url);

  fetch(url)
    .then(r => r.json())
    .then(updateWeather)
    .catch(err => console.error("❌ Meteo fetch error", err));
}

/* Trova valore hourly più vicino all’ora corrente */
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

  if (!data.current_weather || !data.daily) {
    console.error("❌ Dati meteo incompleti", data);
    return;
  }

  console.log("✅ Meteo ricevuto", data);

  const cw = data.current_weather;

  // METRICHE ATTUALI
  document.getElementById("weather-temp").textContent =
    `${Math.round(cw.temperature)}°C`;

  document.getElementById("weather-wind").textContent =
    `${Math.round(cw.windspeed)} km/h`;

  const idx = findClosestIndex(cw.time, data.hourly.time);

  document.getElementById("weather-humidity").textContent =
    `${data.hourly.relativehumidity_2m[idx]}%`;

  document.getElementById("weather-rain").textContent =
    `${data.hourly.precipitation_probability[idx]}%`;

  // PREVISIONI
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {

    const date = new Date(data.daily.time[i]);
    const code = data.daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";

    const label = (i === 0)
      ? "OGGI"
      : date.toLocaleDateString("it-IT", { weekday:"short" }).toUpperCase();

    const tmin = Math.round(data.daily.temperature_2m_min[i]);
    const tmax = Math.round(data.daily.temperature_2m_max[i]);

    const card = `
      <div class="ops-forecast-pill" style="
          display:flex; flex-direction:column;
          align-items:center; text-align:center;
          padding:1rem 0.5rem; gap:0.3rem;">
          
          <div style="font-weight:700; font-size:1.1rem;">${label}</div>

          <div class="forecast-icon" style="width:60px; height:60px;">
              ${iconSVG(code)}
          </div>

          <div style="font-weight:700; color:black;">${cond}</div>
          <div style="font-weight:700;">${tmin}° / ${tmax}°</div>

      </div>
    `;

    grid.insertAdjacentHTML("beforeend", card);
  }
}
