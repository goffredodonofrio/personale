console.log("🟣 meteo.js — High Precision + SVG Icons Loaded");

// Coordinate Via Rocciamelone 30
const LAT = 45.09934;
const LON = 7.75762;

// ============================
//  SVG ICONS (LCARS style)
// ============================

function iconSVG(type) {
  const stroke = "#000";
  const strokeW = 2;

  const icons = {
    sun: `
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
      </svg>
    `,

    partly: `
      <svg viewBox="0 0 64 64">
        <circle cx="24" cy="24" r="10" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
        <ellipse cx="38" cy="40" rx="16" ry="10" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
      </svg>
    `,

    cloud: `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="38" rx="18" ry="12" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
      </svg>
    `,

    overcast: `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="38" rx="20" ry="13" fill="white" stroke="${stroke}" stroke-width="${strokeW}" opacity="0.7" />
      </svg>
    `,

    fog: `
      <svg viewBox="0 0 64 64">
        <line x1="12" y1="30" x2="52" y2="30" stroke="${stroke}" stroke-width="${strokeW}" />
        <line x1="10" y1="38" x2="54" y2="38" stroke="${stroke}" stroke-width="${strokeW}" />
        <line x1="14" y1="46" x2="50" y2="46" stroke="${stroke}" stroke-width="${strokeW}" />
      </svg>
    `,

    rain: `
      <svg viewBox="0 0 64 64">
        <ellipse cx="30" cy="28" rx="16" ry="10" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
        <line x1="22" y1="40" x2="18" y2="48" stroke="${stroke}" stroke-width="${strokeW}" />
        <line x1="32" y1="40" x2="28" y2="50" stroke="${stroke}" stroke-width="${strokeW}" />
        <line x1="42" y1="40" x2="38" y2="48" stroke="${stroke}" stroke-width="${strokeW}" />
      </svg>
    `,

    snow: `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="28" rx="16" ry="10" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
        <text x="32" y="48" text-anchor="middle" stroke="${stroke}" fill="white" font-size="22">*</text>
      </svg>
    `,

    storm: `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="25" rx="18" ry="12" fill="white" stroke="${stroke}" stroke-width="${strokeW}" />
        <polygon points="26,40 36,40 30,54" fill="white" stroke="${stroke}" stroke-width="${strokeW}"></polygon>
      </svg>
    `
  };

  return icons[type] || icons.cloud;
}

// ============================
//  Weather → Icon mapping 
// ============================

function getIconType(code) {
  if ([0, 1].includes(code)) return "sun";
  if (code === 2) return "partly";
  if (code === 3) return "overcast";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloud";
}

// ============================
//  Weather text dictionary
// ============================

const WEATHER_TEXT = {
  0: "Sereno",
  1: "Prevalente sereno",
  2: "Parzialmente nuvoloso",
  3: "Molto nuvoloso",
  45: "Foschia",
  48: "Foschia ghiacciata",
  51: "Pioviggine",
  53: "Pioviggine",
  55: "Pioviggine intensa",
  61: "Pioggia debole",
  63: "Pioggia",
  65: "Pioggia intensa",
  71: "Neve debole",
  73: "Neve",
  75: "Neve intensa",
  80: "Rovesci",
  81: "Rovesci",
  82: "Rovesci intensi",
  95: "Temporale",
  96: "Temporale con grandine",
  99: "Temporale forte"
};

// ============================
//  LOAD WEATHER
// ============================

document.addEventListener("DOMContentLoaded", loadWeather);

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true` +
    `&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&models=metno,icon_eu` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then(r => r.json())
    .then(updateWeather)
    .catch(err => console.error("❌ Meteo fetch error:", err));
}

function findClosestIndex(targetIso, arr) {
  let best = 0;
  let diff = Infinity;
  const t = new Date(targetIso).getTime();

  arr.forEach((v, i) => {
    const d = Math.abs(new Date(v).getTime() - t);
    if (d < diff) {
      diff = d;
      best = i;
    }
  });

  return best;
}

// ============================
//  UPDATE UI
// ============================

function updateWeather(data) {
  const cw = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  // LIVE METEO
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-humidity").textContent =
    hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    hourly.precipitation_probability[idx] + "%";

  // PREVISIONI
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const d = new Date(daily.time[i]);
    const label =
      i === 0 ? "OGGI" : d.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    const code = daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";
    const iconType = getIconType(code);
    const icon = iconSVG(iconType);

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    grid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="ops-forecast-pill">
        <div class="label">${label}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="condition">${cond}</div>
        <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
      `
    );
  }
}
