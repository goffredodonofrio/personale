console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — OPEN-METEO API
 *   - current_weather → temperatura, vento
 *   - hourly → umidità + probabilità pioggia
 *   - daily → oggi + 3 giorni
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/* Dizionario testi meteo */
const WEATHER_TEXT = {
  0: "Sereno", 1: "Prevalente sereno", 2: "Parzialmente nuvoloso", 3: "Molto nuvoloso",
  45: "Foschia", 48: "Foschia ghiacciata",
  51: "Pioviggine leggera", 53: "Pioviggine", 55: "Pioviggine intensa",
  56: "Pioggia gelata leggera", 57: "Pioggia gelata",
  61: "Pioggia debole", 63: "Pioggia", 65: "Pioggia intensa",
  66: "Rovescio gelato", 67: "Rovescio gelato forte",
  71: "Neve leggera", 73: "Neve", 75: "Neve intensa",
  77: "Neve a granuli",
  80: "Rovesci isolati", 81: "Rovesci", 82: "Rovesci intensi",
  85: "Nevischio", 86: "Nevischio intenso",
  95: "Temporali", 96: "Temporali con grandine", 99: "Temporali forti con grandine"
};

/***************************************************
 *  FETCH DATI METEO
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

  console.log("🔵 Fetch URL:", url);

  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      console.log("🟢 Meteo ricevuto:", data);
      updateWeather(data);
    })
    .catch((err) => console.error("🔴 ERRORE FETCH:", err));
}

/***************************************************
 *  TROVA L’ORA PIÙ VICINA NEGLI HOURLY
 ***************************************************/
function findClosestIndex(targetIso, timeArray) {
  let bestIdx = -1;
  let bestDiff = Infinity;
  const targetMs = new Date(targetIso).getTime();

  for (let i = 0; i < timeArray.length; i++) {
    const diff = Math.abs(new Date(timeArray[i]).getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/***************************************************
 *  AGGIORNA LA UI METEO
 ***************************************************/
function updateWeather(data) {
  if (!data?.current_weather || !data?.hourly || !data?.daily) {
    console.error("❌ Dati meteo incompleti:", data);
    return;
  }

  const cw = data.current_weather;

  /* ============================
     METEO ATTUALE
     ============================ */
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  /* UMIDITÀ + PROB PIOGGIA */
  const idx = findClosestIndex(cw.time, data.hourly.time);

  const humidity = data.hourly.relativehumidity_2m[idx] ?? "--";
  const rainProb = data.hourly.precipitation_probability[idx] ?? "--";

  document.getElementById("weather-humidity").textContent = humidity + "%";
  document.getElementById("weather-rain").textContent = rainProb + "%";

  /* ============================
     PREVISIONI OGGI + 3 GIORNI
     ============================ */
  const daily = data.daily;
  const grid = document.getElementById("forecast-grid");

  grid.innerHTML = ""; // pulizia

  /* ---- OGGI ---- */
  addForecastPill(
    grid,
    "OGGI",
    daily.weathercode[0],
    daily.temperature_2m_min[0],
    daily.temperature_2m_max[0]
  );

  /* ---- PROSSIMI 3 GIORNI ---- */
  for (let i = 1; i <= 3 && i < daily.time.length; i++) {
    const label = new Date(daily.time[i])
      .toLocaleDateString("it-IT", { weekday: "short" })
      .toUpperCase();

    addForecastPill(
      grid,
      label,
      daily.weathercode[i],
      daily.temperature_2m_min[i],
      daily.temperature_2m_max[i]
    );
  }

  console.log("✅ Previsioni aggiornate");
}

/***************************************************
 *  CREA UNA PILLOLA PREVISIONE
 ***************************************************/
function addForecastPill(grid, label, code, tmin, tmax) {
  const text = WEATHER_TEXT[code] || "N/D";
  const pill = document.createElement("div");

  pill.className = "ops-forecast-pill";
  pill.innerHTML = `
      <span class="label">${label}</span>
      <span class="condition">${text}</span>
      <span class="temp">${Math.round(tmin)}° / ${Math.round(tmax)}°</span>
  `;

  grid.appendChild(pill);
}
