console.log("🟣 meteo.js — LOADED OK");

// ===============================
//   CONFIGURAZIONE METEO
// ===============================
const LAT = 45.0703;
const LON = 7.6869;

// Mappa codice meteo → testo leggibile
const WEATHER_TEXT = {
  0: "Sereno",
  1: "Sereno",
  2: "Parzialmente nuvoloso",
  3: "Molto nuvoloso",
  45: "Foschia",
  48: "Foschia ghiacciata",
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

// Mappa codice meteo → classe icona
function getIconClass(code) {
  if ([0, 1].includes(code)) return "icon-sun";
  if ([2].includes(code)) return "icon-partly";
  if ([3].includes(code)) return "icon-overcast";
  if ([45, 48].includes(code)) return "icon-fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-rain";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-storm";
  return "icon-cloud";
}

document.addEventListener("DOMContentLoaded", loadWeather);

// ===============================
//   FETCH METEO
// ===============================
function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}` +
    `&longitude=${LON}` +
    `&current_weather=true` +
    `&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  console.log("🌍 METEO FETCH URL:", url);

  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log("🟢 DATI METEO ARRIVATI:", data);
      updateWeather(data);
    })
    .catch(err => console.error("❌ Errore fetch meteo:", err));
}

// ===============================
//   TROVA ORA PIÙ VICINA
// ===============================
function findClosestIndex(targetIso, arr) {
  let best = -1;
  let minDiff = Infinity;
  const target = new Date(targetIso).getTime();

  arr.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < minDiff) {
      minDiff = diff;
      best = i;
    }
  });

  return best;
}

// ===============================
//   UPDATE METEO + PREVISIONI
// ===============================
function updateWeather(data) {
  console.log("🔧 updateWeather() avviato");

  const cw = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  if (!cw || !hourly || !daily) {
    console.error("❌ Dati meteo incompleti:", data);
    return;
  }

  // ---------------------------
  //   METEO ATTUALE
  // ---------------------------
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-humidity").textContent =
    hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    hourly.precipitation_probability[idx] + "%";

  // ---------------------------
  //   PREVISIONI 4 GIORNI
  // ---------------------------
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const date = new Date(daily.time[i]);
    const label =
      i === 0 ? "OGGI" : date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    const code = daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";
    const icon = getIconClass(code);

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const card = `
      <div class="ops-forecast-pill" style="text-align:center; padding-top:0.8rem;">
          <div class="forecast-icon ${icon}"></div>
          <div class="label" style="font-weight:700;">${label}</div>
          <div class="condition" style="color:black; font-weight:700; margin-top:0.2rem;">${cond}</div>
          <div class="temp" style="margin-top:0.3rem; font-weight:700;">
            ${tmin}° / ${tmax}°
          </div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", card);
  }

  console.log("✅ updateWeather() completato");
}
