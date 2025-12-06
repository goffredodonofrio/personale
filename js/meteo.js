console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — VERSIONE TESTUALE (OPEN-METEO)
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

const WEATHER_TEXT = {
  0: "Sereno",
  1: "Prevalente sereno",
  2: "Parzialmente nuvoloso",
  3: "Molto nuvoloso",
  45: "Foschia",
  48: "Foschia ghiacciata",
  51: "Pioviggine leggera",
  53: "Pioviggine",
  55: "Pioviggine intensa",
  56: "Pioviggine gelata",
  57: "Pioviggine gelata intensa",
  61: "Pioggia debole",
  63: "Pioggia",
  65: "Pioggia intensa",
  66: "Pioggia gelata",
  67: "Pioggia gelata intensa",
  71: "Nevicata debole",
  73: "Nevicata",
  75: "Nevicata intensa",
  77: "Neve a granuli",
  80: "Rovesci isolati",
  81: "Rovesci",
  82: "Rovesci intensi",
  85: "Nevischio",
  86: "Nevischio intenso",
  95: "Temporali",
  96: "Temporali con grandine",
  99: "Temporali forti con grandine"
};

function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + LAT +
    "&longitude=" + LON +
    "&current_weather=true" +
    "&forecast_days=5" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relativehumidity_2m_max" +
    "&timezone=Europe%2FRome";

  console.log("🔵 Fetch URL:", url);

  fetch(url)
    .then(function (r) {
      console.log("🟠 Response status:", r.status);
      return r.json();
    })
    .then(function (data) {
      console.log("🟢 updateWeather() chiamata", data);
      updateWeather(data);
    })
    .catch(function (err) {
      console.error("🔴 ERRORE FETCH:", err);
    });
}

function updateWeather(data) {
  if (!data || !data.daily || !data.current_weather) {
    console.error("❌ ERRORE: struttura dati inattesa", data);
    return;
  }

  // -------- METEO ATTUALE --------
  var current = data.current_weather;

  if (typeof current.temperature === "number") {
    document.getElementById("weather-temp").textContent =
      Math.round(current.temperature) + "°C";
  }

  if (typeof current.windspeed === "number") {
    document.getElementById("weather-wind").textContent =
      Math.round(current.windspeed) + " km/h";
  }

  // Umidità max oggi
  var humArr = data.daily.relativehumidity_2m_max;
  var humVal = "--";
  if (humArr && humArr.length > 0 && typeof humArr[0] === "number") {
    humVal = humArr[0];
  }
  document.getElementById("weather-humidity").textContent = humVal + "%";

  // Probabilità pioggia max oggi
  var rainArr = data.daily.precipitation_probability_max;
  var rainVal = "--";
  if (rainArr && rainArr.length > 0 && typeof rainArr[0] === "number") {
    rainVal = rainArr[0];
  }
  document.getElementById("weather-rain").textContent = rainVal + "%";

  // -------- PREVISIONI PROSSIMI 4 GIORNI --------
  var daily = data.daily;
  var grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  // i = 1 → domani, fino a max 4 giorni (controllando di non uscire dall'array)
  for (var i = 1; i <= 4 && i < daily.time.length; i++) {
    var date = new Date(daily.time[i]);
    var label = date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    var code = daily.weathercode[i];
    var text = WEATHER_TEXT[code] || "N/D";

    var tmin = daily.temperature_2m_min[i];
    var tmax = daily.temperature_2m_max[i];

    if (typeof tmin === "number") tmin = Math.round(tmin);
    if (typeof tmax === "number") tmax = Math.round(tmax);

    var card =
      '<div class="ops-forecast-day">' +
        '<div class="ops-forecast-day-label">' + label + '</div>' +
        '<div class="ops-forecast-text">' + text + '</div>' +
        '<div class="ops-forecast-temp">' + tmin + '° / ' + tmax + '°</div>' +
      '</div>';

    grid.innerHTML += card;
  }
}
