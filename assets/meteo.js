/***************************************************
 *   METEO — VERSIONE TESTUALE (OPEN-METEO)
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

// Mappa weathercode → descrizione testuale
const WEATHER_TEXT = {
  0: "Sereno",
  1: "Prevalente sereno",
  2: "Parzialmente nuvoloso",
  3: "Molto nuvoloso",
  
  // Fog — ADDOLCITE
  45: "Foschia",
  48: "Foschia ghiacciata",

  // Drizzle
  51: "Pioviggine leggera",
  53: "Pioviggine",
  55: "Pioviggine intensa",

  // Freezing drizzle
  56: "Pioviggine gelata",
  57: "Pioviggine gelata intensa",

  // Rain
  61: "Pioggia debole",
  63: "Pioggia",
  65: "Pioggia intensa",

  // Freezing rain
  66: "Pioggia gelata",
  67: "Pioggia gelata intensa",

  // Snow
  71: "Nevicata debole",
  73: "Nevicata",
  75: "Nevicata intensa",

  77: "Neve a granuli",

  // Showers
  80: "Rovesci isolati",
  81: "Rovesci",
  82: "Rovesci intensi",

  // Snow showers
  85: "Nevischio",
  86: "Nevischio intenso",

  // Thunderstorms
  95: "Temporali",
  96: "Temporali con grandine",
  99: "Temporali forti con grandine"
};

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}&longitude=${LON}` +
    `&current_weather=true` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then(r => r.json())
    .then(data => updateWeather(data))
    .catch(err => console.error("Errore meteo:", err));
}

function updateWeather(data) {
  /* METEO ATTUALE */
  document.getElementById("weather-temp").textContent =
    Math.round(data.current_weather.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(data.current_weather.windspeed) + " km/h";

  // Open-Meteo non dà l'umidità nell'endpoint base → metto placeholder o la estraiamo da "hourly"
  document.getElementById("weather-humidity").textContent = "--%";

  document.getElementById("weather-rain").textContent = "-- mm";

  /* PREVISIONI PROSSIMI GIORNI */
  const daily = data.daily;
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  daily.time.forEach((day, i) => {
    if (i === 0) return; // evita il "giorno corrente"

    const date = new Date(day);
    const label = date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    const code = daily.weathercode[i];
    const text = WEATHER_TEXT[code] || "N/D";

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const card = `
      <div class="ops-forecast-day">
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-text">${text}</div>
        <div class="ops-forecast-temp">${tmin}° / ${tmax}°</div>
      </div>
    `;

    grid.innerHTML += card;
  });
}
