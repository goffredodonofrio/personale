console.log("🟣 meteo.js — LCARS ICON EDITION");

// Coordinate Torino
const LAT = 45.0703;
const LON = 7.6869;

// Testi meteo
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

// Mappa codice → classe icona
function getIconClass(code) {
  if ([0, 1].includes(code)) return "icon-sun";
  if ([45, 48].includes(code)) return "icon-fog";
  if ([2, 3].includes(code)) return "icon-cloud";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-rain";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-storm";
  return "icon-cloud";
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
    .catch(err => console.error("❌ Meteo fetch error", err));
}

// Trova ora più vicina
function findClosestIndex(targetIso, arr) {
  let best = 0;
  let diff = Infinity;
  const t = new Date(targetIso).getTime();
  arr.forEach((x, i) => {
    const d = Math.abs(new Date(x).getTime() - t);
    if (d < diff) { diff = d; best = i; }
  });
  return best;
}

function updateWeather(data) {
  if (!data.current_weather) return;

  const cw = data.current_weather;

  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  // HUMID + RAIN
  const idx = findClosestIndex(cw.time, data.hourly.time);

  document.getElementById("weather-humidity").textContent =
    data.hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    data.hourly.precipitation_probability[idx] + "%";

  // === PREVISIONI Giorno 0–3 ===
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const label =
      i === 0
        ? "OGGI"
        : new Date(data.daily.time[i])
            .toLocaleDateString("it-IT", { weekday: "short" })
            .toUpperCase();

    const code = data.daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";
    const icon = getIconClass(code);

    const tmin = Math.round(data.daily.temperature_2m_min[i]);
    const tmax = Math.round(data.daily.temperature_2m_max[i]);

    // CARD COMPATIBILE LCARS
    const html = `
      <div class="ops-forecast-pill" style="display:flex; flex-direction:column; align-items:center; padding:0.8rem;">

          <div class="forecast-icon ${icon}" style="font-size:2.4rem; margin-bottom:0.2rem;"></div>

          <div style="text-align:center; line-height:1.1;">
              <div style="font-weight:700;">${label}</div>
              <div style="font-size:0.9rem; color:black; font-weight:700;">${cond}</div>
          </div>

          <div style="margin-top:0.35rem; font-size:0.95rem; font-weight:700;">
              ${tmin}° / ${tmax}°
          </div>

      </div>
    `;

    grid.insertAdjacentHTML("beforeend", html);
  }
}
