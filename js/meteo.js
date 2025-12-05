// assets/meteo.js

async function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast"
    + "?latitude=45.0705"
    + "&longitude=7.6868"
    + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain"
    + "&daily=temperature_2m_max,weathercode"
    + "&timezone=Europe%2FRome";

  console.log("[meteo.js] Chiamo:", url);

  try {
    const res = await fetch(url);
    const data = await res.json();

    /* -------------------------
       METEO ATTUALE
    --------------------------*/
    const cur = data.current;
    if (cur) {
      document.getElementById("weather-temp").textContent =
        Math.round(cur.temperature_2m) + "°C";

      document.getElementById("weather-humidity").textContent =
        Math.round(cur.relative_humidity_2m) + "%";

      document.getElementById("weather-wind").textContent =
        Math.round(cur.wind_speed_10m) + " km/h";

      document.getElementById("weather-rain").textContent =
        (cur.rain ?? 0).toFixed(1) + " mm";
    }

    /* -------------------------
       PREVISIONI 3 GIORNI
    --------------------------*/
    const days = data.daily.time;
    const temps = data.daily.temperature_2m_max;
    const codes = data.daily.weathercode;

    const ICONS = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌧️",
      61: "🌧️",
      63: "🌧️",
      65: "🌧️",
      71: "❄️",
      73: "❄️",
      75: "❄️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️"
    };

    for (let i = 1; i <= 3; i++) {
      const date = new Date(days[i]);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

      document.getElementById(`fc-day-${i}`).textContent = dayName;
      document.getElementById(`fc-temp-${i}`).textContent =
        Math.round(temps[i]) + "°C";
      document.getElementById(`fc-icon-${i}`).textContent =
        ICONS[codes[i]] || "🌤️";
    }

  } catch (err) {
    console.error("[meteo.js] Errore meteo:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadWeather();
  setInterval(loadWeather, 300000); // update ogni 5 minuti
});
