console.log("🟣 meteo.js — LCARS METEO v3");

// Coordinate Torino
const LAT = 45.0703;
const LON = 7.6869;

// Testi condizioni meteo
const WEATHER_TEXT = {
  0: "Sereno",
  1: "Sereno",
  2: "Parz. Nuvoloso",
  3: "Molto Nuvoloso",
  45: "Foschia",
  48: "Foschia",
  51: "Pioviggine",
  53: "Pioviggine",
  55: "Pioviggine forte",
  61: "Pioggia",
  63: "Pioggia",
  65: "Pioggia forte",
  71: "Neve",
  73: "Neve",
  75: "Neve forte",
  80: "Rovesci",
  81: "Rovesci",
  82: "Rovesci forti",
  95: "Temporale",
  96: "Temporale",
  99: "Temporale forte",
};

// =============================
//  ICON SET (SVG stile LCARS)
// =============================

const ICONS = {
  sun: `
    <svg viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="10" fill="white" stroke="black" stroke-width="2"/>
      <line x1="25" y1="5"  x2="25" y2="15" stroke="black" stroke-width="2"/>
      <line x1="25" y1="35" x2="25" y2="45" stroke="black" stroke-width="2"/>
      <line x1="5"  y1="25" x2="15" y2="25" stroke="black" stroke-width="2"/>
      <line x1="35" y1="25" x2="45" y2="25" stroke="black" stroke-width="2"/>
    </svg>
  `,
  cloud: `
    <svg viewBox="0 0 50 50">
      <path d="M10 30 a10 10 0 0 1 20 0 h10 a8 8 0 0 1 0 16 h-30 a8 8 0 0 1 0 -16z"
        fill="white" stroke="black" stroke-width="2"/>
    </svg>
  `,
  fog: `
    <svg viewBox="0 0 50 50">
      <line x1="5" y1="18" x2="45" y2="18" stroke="black" stroke-width="3"/>
      <line x1="5" y1="26" x2="45" y2="26" stroke="black" stroke-width="3"/>
      <line x1="5" y1="34" x2="45" y2="34" stroke="black" stroke-width="3"/>
    </svg>
  `,
  rain: `
    <svg viewBox="0 0 50 50">
      <path d="M10 25 a10 10 0 0 1 20 0 h10 a8 8 0 0 1 0 14 h-30 a8 8 0 0 1 0 -14z"
        fill="white" stroke="black" stroke-width="2"/>
      <line x1="18" y1="40" x2="15" y2="47" stroke="black" stroke-width="3"/>
      <line x1="28" y1="40" x2="25" y2="47" stroke="black" stroke-width="3"/>
      <line x1="38" y1="40" x2="35" y2="47" stroke="black" stroke-width="3"/>
    </svg>
  `,
  snow: `
    <svg viewBox="0 0 50 50">
      <text x="25" y="32" text-anchor="middle" font-size="28" fill="white" stroke="black" stroke-width="1">✳</text>
    </svg>
  `,
  storm: `
    <svg viewBox="0 0 50 50">
      <polygon points="22,5 30,20 24,20 32,40 20,25 26,25"
        fill="yellow" stroke="black" stroke-width="2"/>
    </svg>
  `
};

// Mappa i codici meteo → icona corretta
function getIconSvg(code) {
  if ([0, 1].includes(code)) return ICONS.sun;
  if ([2, 3].includes(code)) return ICONS.cloud;
  if ([45, 48].includes(code)) return ICONS.fog;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return ICONS.rain;
  if ([71, 73, 75].includes(code)) return ICONS.snow;
  if ([95, 96, 99].includes(code)) return ICONS.storm;
  return ICONS.cloud;
}

// =============================
//     FETCH DATI METEO
// =============================

document.addEventListener("DOMContentLoaded", loadWeather);

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}` +
    `&longitude=${LON}` +
    `&current_weather=true` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=5` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then(r => r.json())
    .then(data => updateWeather(data))
    .catch(err => console.error("❌ Meteo fetch error:", err));
}

// Trova indice orario più vicino all’attuale
function findClosestIndex(targetIso, arr) {
  let best = 0;
  let bestDiff = Infinity;
  const target = new Date(targetIso).getTime();

  arr.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });

  return best;
}

// =============================
//      RENDER METEO
// =============================

function updateWeather(data) {
  const cw = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  // --- METEO ATTUALE (parte destra) ---
  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-temp").textContent =
    `${Math.round(cw.temperature)}°C`;

  document.getElementById("weather-wind").textContent =
    `${Math.round(cw.windspeed)} km/h`;

  document.getElementById("weather-humidity").textContent =
    `${hourly.relativehumidity_2m[idx]}%`;

  document.getElementById("weather-rain").textContent =
    `${hourly.precipitation_probability[idx]}%`;

  // --- PREVISIONI ---
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const label =
      i === 0
        ? "OGGI"
        : new Date(daily.time[i])
            .toLocaleDateString("it-IT", { weekday: "short" })
            .toUpperCase();

    const code = daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const iconSvg = getIconSvg(code);

    const card = `
      <div class="ops-forecast-pill">
          <div class="label">${label}</div>
          <div class="forecast-icon">${iconSvg}</div>
          <div class="condition">${cond}</div>
          <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", card);
  }
}
