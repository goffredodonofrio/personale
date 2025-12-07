console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — VERSIONE COMPLETA (OPEN-METEO)
 *   - current_weather: temperatura, vento
 *   - hourly: umidità + prob. pioggia (accurate)
 *   - daily: previsioni 4 giorni
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/* Dizionario testi meteo */
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

/***************************************************
 *  FETCH DATI METEO
 ***************************************************/
function updateWeather(data) {
  if (!data || !data.current_weather || !data.hourly || !data.daily) {
    console.error("❌ Dati meteo incompleti:", data);
    return;
  }

  const cw = data.current_weather;
  const daily = data.daily; // ⬅️ MANCAVA!

  /* METEO ATTUALE — temperatura e vento */
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  /* UMIDITÀ + PROB PIOGGIA (basate su HOURLY) */
  const hourlyTimes = data.hourly.time;
  const idx = findClosestIndex(cw.time, hourlyTimes);

  let humidity = "--";
  let rainProb = "--";

  if (idx !== -1) {
    if (typeof data.hourly.relativehumidity_2m[idx] === "number")
      humidity = data.hourly.relativehumidity_2m[idx];

    if (typeof data.hourly.precipitation_probability[idx] === "number")
      rainProb = data.hourly.precipitation_probability[idx];
  }

  document.getElementById("weather-humidity").textContent = humidity + "%";
  document.getElementById("weather-rain").textContent = rainProb + "%";

  /* ============================================
     PREVISIONI: OGGI + 3 GIORNI SUCCESSIVI
     ============================================ */
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  /* 1️⃣ CARD — OGGI */
  const todayLabel = "OGGI";
  const todayCode = daily.weathercode[0];
  const todayText = WEATHER_TEXT[todayCode] || "N/D";
  const todayMin = Math.round(daily.temperature_2m_min[0]);
  const todayMax = Math.round(daily.temperature_2m_max[0]);

  grid.innerHTML += `
    <div class="ops-forecast-day">
      <div class="ops-forecast-day-label">${todayLabel}</div>
      <div class="ops-forecast-text">${todayText}</div>
      <div class="ops-forecast-temp">${todayMin}° / ${todayMax}°</div>
    </div>
  `;

  /* 2️⃣ CARD — PROSSIMI 3 GIORNI */
  for (let i = 1; i <= 3 && i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const label = date.toLocaleDateString("it-IT", { weekday: "short" })
                      .toUpperCase();

    const code = daily.weathercode[i];
    const text = WEATHER_TEXT[code] || "N/D";

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    grid.innerHTML += `
      <div class="ops-forecast-day">
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-text">${text}</div>
        <div class="ops-forecast-temp">${tmin}° / ${tmax}°</div>
      </div>
    `;
  }
}
