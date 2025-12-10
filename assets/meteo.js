console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — OPEN-METEO COMPLETO
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/* TESTI METEO */
const WEATHER_TEXT = {
  0: "Sereno", 1: "Prevalente sereno", 2: "Parzialmente nuvoloso", 3: "Molto nuvoloso",
  45: "Foschia", 48: "Foschia ghiacciata",
  51: "Pioviggine leggera", 53: "Pioviggine", 55: "Pioviggine intensa",
  56: "Pioviggine gelata", 57: "Pioviggine gelata intensa",
  61: "Pioggia debole", 63: "Pioggia", 65: "Pioggia intensa",
  66: "Pioggia gelata", 67: "Pioggia gelata intensa",
  71: "Nevicata debole", 73: "Nevicata", 75: "Nevicata intensa",
  77: "Neve a granuli",
  80: "Rovesci isolati", 81: "Rovesci", 82: "Rovesci intensi",
  85: "Nevischio", 86: "Nevischio intenso",
  95: "Temporali", 96: "Temporali con grandine", 99: "Temporali forti con grandine"
};

/* ICONE LCARS-STYLE */
const WEATHER_ICON = {
  0: "◎", 1: "◎",
  2: "◉",
  3: "●",
  45: "≋", 48: "≋",
  51: "☂", 53: "☂", 55: "☂",
  61: "☂", 63: "☂", 65: "☂",
  66: "☂", 67: "☂",
  71: "✳", 73: "✳", 75: "✳", 77: "✳",
  80: "☂", 81: "☂", 82: "☂",
  85: "✳", 86: "✳",
  95: "⚡", 96: "⚡", 99: "⚡"
};

/***************************************************
 *  FETCH METEO
 ***************************************************/
function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${LAT}&longitude=${LON}` +
    "&current_weather=true" +
    "&forecast_days=5" +
    "&hourly=relativehumidity_2m,precipitation_probability" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min" +
    "&timezone=Europe%2FRome";

  fetch(url)
    .then(r => r.json())
    .then(data => updateWeather(data))
    .catch(err => console.error("❌ ERRORE METEO:", err));
}

/***************************************************
 *  TROVA ORA PIÙ VICINA PER HOURLY
 ***************************************************/
function findClosestIndex(targetIso, timeArray) {
  let best = -1;
  let diffBest = Infinity;
  const target = new Date(targetIso).getTime();

  timeArray.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < diffBest) {
      diffBest = diff;
      best = i;
    }
  });

  return best;
}

/***************************************************
 *  UPDATE UI
 ***************************************************/
function updateWeather(data) {
  if (!data?.current_weather || !data?.hourly || !data?.daily) {
    console.error("❌ Dati meteo incompleti");
    return;
  }

  const cw = data.current_weather;

  /* ----- METEO ATTUALE ----- */
  document.getElementById("weather-temp").textContent =
    `${Math.round(cw.temperature)}°C`;

  document.getElementById("weather-wind").textContent =
    `${Math.round(cw.windspeed)} km/h`;

  /* HOURLY */
  const idx = findClosestIndex(cw.time, data.hourly.time);
  const humidity = data.hourly.relativehumidity_2m[idx] ?? "--";
  const rainProb = data.hourly.precipitation_probability[idx] ?? "--";

  document.getElementById("weather-humidity").textContent = `${humidity}%`;
  document.getElementById("weather-rain").textContent = `${rainProb}%`;

  /* ----- PREVISIONI ----- */
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";
  const daily = data.daily;

  /* OGGI */
  addForecastPill(grid, "OGGI", daily.weathercode[0], daily.temperature_2m_min[0], daily.temperature_2m_max[0]);

  /* PROSSIMI 2 GIORNI */
  for (let i = 1; i <= 2; i++) {
    if (!daily.time[i]) continue;
    const label = new Date(daily.time[i])
      .toLocaleDateString("it-IT", { weekday: "short" })
      .toUpperCase();

    addForecastPill(grid, label, daily.weathercode[i], daily.temperature_2m_min[i], daily.temperature_2m_max[i]);
  }
}

/***************************************************
 *  CREA UNA SINGOLA PILL METEO (con icona)
 ***************************************************/
function addForecastPill(grid, label, code, tmin, tmax) {
  const text = WEATHER_TEXT[code] || "N/D";
  const icon = WEATHER_ICON[code] || "·";

  grid.innerHTML += `
    <div class="ops-forecast-pill">
        <span class="icon">${icon}</span>
        <span class="label">${label}</span>
        <span class="condition">${text}</span>
        <span class="temp">${tmin}° / ${tmax}°</span>
    </div>
  `;
}
