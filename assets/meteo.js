console.log("🟦 LCARS METEO — SENSOR OPS ONLINE");

// Coordinate Torino / Via Rocciamelone (più precise)
const LAT = 45.10485;
const LON = 7.76414;

// Dizionario condizioni
const WEATHER_TEXT = {
  0: "Sereno", 1: "Sereno",
  2: "Parz. Nuvoloso",
  3: "Molto Nuvoloso",
  45: "Foschia", 48: "Foschia densa",
  51: "Pioviggine", 53: "Pioviggine", 55: "Pioviggine forte",
  61: "Pioggia", 63: "Pioggia", 65: "Pioggia forte",
  71: "Neve", 73: "Neve", 75: "Neve forte",
  80: "Rovesci", 81: "Rovesci", 82: "Rovesci forti",
  95: "Temporale", 96: "Temporale", 99: "Temporale"
};

// Icone SVG minimal LCARS
function iconSVG(type) {
  switch (type) {
    case "sun": return `
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14"
          fill="white" stroke="black" stroke-width="3"/>
      </svg>`;

    case "cloud": return `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="38" rx="20" ry="12"
          fill="white" stroke="black" stroke-width="3"/>
        <ellipse cx="22" cy="36" rx="14" ry="10"
          fill="white" stroke="black" stroke-width="3"/>
      </svg>`;

    case "fog": return `
      <svg viewBox="0 0 64 64">
        <rect x="10" y="24" width="44" height="6"
          fill="white" stroke="black" stroke-width="2"/>
        <rect x="14" y="34" width="36" height="6"
          fill="white" stroke="black" stroke-width="2"/>
        <rect x="10" y="44" width="44" height="6"
          fill="white" stroke="black" stroke-width="2"/>
      </svg>`;

    case "rain": return `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="28" rx="20" ry="12"
          fill="white" stroke="black" stroke-width="3"/>
        <line x1="20" y1="44" x2="16" y2="56" stroke="black" stroke-width="3"/>
        <line x1="32" y1="44" x2="28" y2="56" stroke="black" stroke-width="3"/>
        <line x1="44" y1="44" x2="40" y2="56" stroke="black" stroke-width="3"/>
      </svg>`;

    case "snow": return `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="28" rx="20" ry="12"
          fill="white" stroke="black" stroke-width="3"/>
        <text x="32" y="52" font-size="22" text-anchor="middle"
          fill="white" stroke="black" stroke-width="2">*</text>
      </svg>`;

    case "storm": return `
      <svg viewBox="0 0 64 64">
        <ellipse cx="32" cy="26" rx="20" ry="12"
          fill="white" stroke="black" stroke-width="3"/>
        <polygon points="28,40 40,40 32,58"
          fill="yellow" stroke="black" stroke-width="3"/>
      </svg>`;
  }
}

// Mappa codice → icona
function getIconType(code) {
  if ([0,1].includes(code)) return "sun";
  if ([2,3].includes(code)) return "cloud";
  if ([45,48].includes(code)) return "fog";
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return "rain";
  if ([71,73,75].includes(code)) return "snow";
  if ([95,96,99].includes(code)) return "storm";
  return "cloud";
}

document.addEventListener("DOMContentLoaded", loadWeather);

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then(r => r.json())
    .then(updateWeather)
    .catch(err => console.error("❌ Meteo error:", err));
}

function findClosestIndex(targetIso, arr) {
  let best = 0;
  let bestDiff = Infinity;
  const target = new Date(targetIso).getTime();

  arr.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  });

  return best;
}

function updateWeather(data) {

  const cw = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  if (!cw || !hourly || !daily) {
    console.error("❌ Dati meteo incompleti", data);
    return;
  }

  // --- METEO ATTUALE ---
  document.getElementById("weather-temp").textContent =
    `${Math.round(cw.temperature)}°C`;

  document.getElementById("weather-wind").textContent =
    `${Math.round(cw.windspeed)} km/h`;

  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-humidity").textContent =
    hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    hourly.precipitation_probability[idx] + "%";

  // --- PREVISIONI ---
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const date = new Date(daily.time[i]);
    const code = daily.weathercode[i];

    const label = i === 0
      ? "OGGI"
      : date.toLocaleDateString("it-IT", { weekday:"short" }).toUpperCase();

    const cond = WEATHER_TEXT[code] || "N/D";

    const icon = iconSVG(getIconType(code));
    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const card = `
      <div class="ops-forecast-pill">
        <div class="label">${label}</div>

        <div class="forecast-icon">
          ${icon}
        </div>

        <div class="condition">${cond.toUpperCase()}</div>
        <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", card);
  }
}
