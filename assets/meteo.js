console.log("🟣 meteo.js — High Precision Weather Loaded");

// Coordinate precise Via Rocciamelone 30
const LAT = 45.09934;
const LON = 7.75762;

// Dizionario descrizioni
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
  56: "Pioviggine gelata",
  57: "Pioviggine intensa",
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
  99: "Forti temporali"
};

// Icone LCARS custom
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

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true` +
    `&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&models=metno,icon_eu` +  // << precisione MASSIMA per Torino Est
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log("🟢 Dati meteo ricevuti:", data);
      updateWeather(data);
    })
    .catch(err => console.error("❌ Meteo fetch error", err));
}

function findClosestIndex(targetIso, timeArray) {
  let best = -1;
  let bestDiff = Infinity;
  const t = new Date(targetIso).getTime();

  timeArray.forEach((x, i) => {
    const diff = Math.abs(new Date(x).getTime() - t);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
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

  // ---- METEO LIVE ----
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-humidity").textContent =
    hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    hourly.precipitation_probability[idx] + "%";

  // ---- PREVISIONI ----
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const d = new Date(daily.time[i]);

    const label =
      i === 0
        ? "OGGI"
        : d.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    const code = daily.weathercode[i];
    const cond = WEATHER_TEXT[code] || "N/D";
    const icon = getIconClass(code);

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const html = `
      <div class="ops-forecast-pill">
        <div class="label">${label}</div>
        <div class="forecast-icon ${icon}"></div>
        <div class="condition">${cond}</div>
        <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
    `;

    grid.insertAdjacentHTML("beforeend", html);
  }
}
