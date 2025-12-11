console.log("🟣 meteo.js CORRETTO — icone + font ridotto");

/***************************************************
 *   METEO CONFIG
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/* TESTI METEO */
const WEATHER_TEXT = {
  0: "SERENO",
  1: "SERENO",
  2: "PARZ. NUVOLOSO",
  3: "MOLTO NUVOLOSO",
  45: "FOSCHIA",
  48: "FOSCHIA",
  51: "PIOVIGGINE",
  53: "PIOVIGGINE",
  55: "PIOVIGGINE FORTE",
  61: "PIOGGIA",
  63: "PIOGGIA",
  65: "PIOGGIA FORTE",
  71: "NEVE",
  73: "NEVE",
  75: "NEVE FORTE",
  80: "ROVESCI",
  81: "ROVESCI",
  82: "ROVESCI FORTI",
  95: "TEMPORALE",
  96: "TEMPORALE",
  99: "TEMPORALE"
};

/***************************************************
 *   ICONA METEO (CODICE → CLASSE CSS)
 ***************************************************/
function getIconClass(code) {
  if ([0, 1].includes(code)) return "icon-sun";
  if ([45, 48].includes(code)) return "icon-fog";
  if ([2, 3].includes(code)) return "icon-cloud";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-rain";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-storm";
  return "icon-cloud";
}

/***************************************************
 *   FETCH OPEN-METEO
 ***************************************************/
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
    .catch(err => console.error("ERRORE METEO:", err));
}

/***************************************************
 *   TROVA ORA PIÙ VICINA
 ***************************************************/
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

/***************************************************
 *   UPDATE INTERFACCIA
 ***************************************************/
function updateWeather(data) {
  if (!data.current_weather) return;

  const cw = data.current_weather;

  /* --- METEO ATTUALE --- */
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  const idx = findClosestIndex(cw.time, data.hourly.time);

  document.getElementById("weather-humidity").textContent =
    data.hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    data.hourly.precipitation_probability[idx] + "%";

  /* --- PREVISIONI --- */
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
    const iconClass = getIconClass(code);

    const cond = WEATHER_TEXT[code] || "N/D";
    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    grid.innerHTML += `
      <div class="ops-forecast-pill">
          <div class="forecast-icon ${iconClass}"></div>
          <div class="forecast-text">
              <span class="label">${label}</span>
              <span class="condition">${cond}</span>
          </div>
          <div class="temp">${tmin}° / ${tmax}°</div>
      </div>
    `;
  }
}
