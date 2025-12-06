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
  3: "Coperto",
  45: "Nebbia",
  48: "Brina / Nebbia ghiacciata",
  51: "Pioviggine leggera",
  53: "Pioviggine",
  55: "Pioviggine intensa",
  56: "Pioggia gelata leggera",
  57: "Pioggia gelata",
  61: "Pioggia leggera",
  63: "Pioggia moderata",
  65: "Pioggia intensa",
  66: "Rovescio gelato",
  67: "Rovescio gelato forte",
  71: "Neve leggera",
  73: "Neve",
  75: "Neve intensa",
  77: "Granelli di neve",
  80: "Rovesci leggeri",
  81: "Rovesci",
  82: "Rovesci forti",
  85: "Nevischio",
  86: "Nevischio intenso",
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
