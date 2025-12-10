console.log("🟣 meteo.js CARICATO — versione icone LCARS");

/***************************************************
 *   CONFIG
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/* Testi meteo */
const WEATHER_TEXT = {
  0: "Sereno", 1: "Prevalente sereno",
  2: "Parz. Nuvoloso", 3: "Molto nuvoloso",
  45: "Foschia", 48: "Foschia ghiacciata",
  51: "Pioviggine", 53: "Pioviggine", 55: "Pioviggine intensa",
  61: "Pioggia", 63: "Pioggia", 65: "Pioggia intensa",
  71: "Neve", 73: "Neve", 75: "Neve intensa",
  80: "Rovesci", 81: "Rovesci", 82: "Rovesci forti",
  95: "Temporale", 96: "Temporale", 99: "Temporale forte"
};

/***************************************************
 *   MAPPATURA WEATHERCODE → ICONA CSS
 ***************************************************/
function getIconClass(code) {
  if ([0, 1].includes(code)) return "icon-sun";
  if (code === 45 || code === 48) return "icon-fog";
  if ([2, 3].includes(code)) return "icon-cloud";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-rain";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-storm";

  return "icon-cloud"; // fallback
}

/***************************************************
 *   FETCH METEO
 ***************************************************/
function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then((r) => r.json())
    .then((data) => updateWeather(data))
    .catch((err) => console.error("ERRORE METEO:", err));
}

/***************************************************
 *   TROVA ORA PIÙ VICINA NELLE HOURLY
 ***************************************************/
function findClosestIndex(targetIso, timeArray) {
  let best = -1;
  let bestDiff = Infinity;
  const target = new Date(targetIso).getTime();

  for (let i = 0; i < timeArray.length; i++) {
    const diff = Math.abs(new Date(timeArray[i]).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

/***************************************************
 *   UPDATE UI METEO
 ***************************************************/
function updateWeather(data) {
  if (!data || !data.current_weather) return;

  const cw = data.current_weather;

  // METEO ATTUALE
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  // UMIDITÀ + PIOGGIA
  const idx = findClosestIndex(cw.time, data.hourly.time);

  document.getElementById("weather-humidity").textContent =
    data.hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    data.hourly.precipitation_probability[idx] + "%";

  /***************************************************
   *     PREVISIONI — OGGI + 3 GIORNI
   ***************************************************/
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  const daily = data.daily;

  for (let i = 0; i < 4; i++) {
    const date = new Date(daily.time[i]);

    const label =
      i === 0
        ? "OGGI"
        : date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    const code = daily.weathercode[i];
    const condition = WEATHER_TEXT[code] || "N/D";
    const iconClass = getIconClass(code);

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    grid.innerHTML += `
      <div class="ops-forecast-pill">
          <div class="forecast-icon ${iconClass}"></div>
          <div class="forecast-lines">
              <span class="label">${label}</span>
              <span class="condition">${condition}</span>
          </div>
          <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
    `;
  }
}
