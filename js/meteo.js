console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — VERSIONE COMPLETA (OPEN-METEO)
 *   Daily = previsioni 4 giorni
 *   Hourly = umidità + prob. pioggia AFFIDABILI
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

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

function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + LAT +
    "&longitude=" + LON +
    "&current_weather=true" +
    "&forecast_days=5" +
    "&hourly=relativehumidity_2m,precipitation_probability" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min" +
    "&timezone=Europe%2FRome";

  console.log("🔵 Fetch URL:", url);

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      console.log("🟢 Meteo ricevuto:", data);
      updateWeather(data);
    })
    .catch(function (err) {
      console.error("🔴 ERRORE FETCH:", err);
    });
}

function updateWeather(data) {
  if (!data || !data.current_weather || !data.daily || !data.hourly) {
    console.error("❌ Struttura dati incompleta", data);
    return;
  }

  /* ---------------------------
     METEO ATTUALE
  ---------------------------- */
  var cw = data.current_weather;

  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  /* ---------------------------
     UMIDITÀ + PROB PIOGGIA (hourly)
     → Massima affidabilità
  ---------------------------- */
  var times = data.hourly.time;
  var nowIso = cw.time;        // formato ISO
  var idx = times.indexOf(nowIso);

  console.log("⏱ Index orario:", idx, nowIso);

  var humidity = "--";
  var rainProb = "--";

  if (idx !== -1) {
    var humArr = data.hourly.relativehumidity_2m;
    var rainArr = data.hourly.precipitation_probability;

    if (humArr && typeof humArr[idx] === "number") humidity = humArr[idx];
    if (rainArr && typeof rainArr[idx] === "number") rainProb = rainArr[idx];
  }

  document.getElementById("weather-humidity").textContent = humidity + "%";
  document.getElementById("weather-rain").textContent = rainProb + "%";

  /* ---------------------------
     PREVISIONI PROSSIMI 4 GIORNI
  ---------------------------- */
  var daily = data.daily;
  var grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (var i = 1; i <= 4 && i < daily.time.length; i++) {
    var date = new Date(daily.time[i]);
    var label = date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    var code = daily.weathercode[i];
    var text = WEATHER_TEXT[code] || "N/D";

    var tmin = Math.round(daily.temperature_2m_min[i]);
    var tmax = Math.round(daily.temperature_2m_max[i]);

    grid.innerHTML +=
      '<div class="ops-forecast-day">' +
        '<div class="ops-forecast-day-label">' + label + '</div>' +
        '<div class="ops-forecast-text">' + text + '</div>' +
        '<div class="ops-forecast-temp">' + tmin + '° / ' + tmax + '°</div>' +
      '</div>';
  }
}
