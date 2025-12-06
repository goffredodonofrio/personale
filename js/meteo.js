// assets/meteo.js

const LAT = 45.0703;
const LON = 7.6869;

async function loadWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo");

    const data = await res.json();

    // -----------------------------
    // METEO ATTUALE
    // -----------------------------
    const current = data.current_weather;
    const daily = data.daily;

    document.getElementById("weather-temp").textContent =
      Math.round(current.temperature) + "°C";
    document.getElementById("weather-humidity").textContent = "--%";
    document.getElementById("weather-rain").textContent = "0.0 mm";
    document.getElementById("weather-wind").textContent =
      Math.round(current.windspeed) + " km/h";

    // -----------------------------
    // FORECAST OGGI + 3 GIORNI
    // -----------------------------
    const forecastGrid = document.getElementById("forecast-grid");
    forecastGrid.innerHTML = "";

    const daysToShow = 4;
    const dayNames = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(daily.time[i] + "T00:00:00");
      const label = i === 0 ? "OGGI" : dayNames[date.getDay()];

      const icon = getWeatherIcon(daily.weathercode[i]);
      const maxT = Math.round(daily.temperature_2m_max[i]);
      const minT = Math.round(daily.temperature_2m_min[i]);

      const div = document.createElement("div");
      div.className = "ops-forecast-day";

      div.innerHTML = `
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-icon">${icon}</div>
        <div class="ops-forecast-temp">${maxT}° / ${minT}°</div>
      `;

      forecastGrid.appendChild(div);
    }

  } catch (err) {
    console.error("Errore caricamento meteo:", err);
  }
}

// ICON SET stile LCARS minimal
function getWeatherIcon(code) {
  if (code === 0) return "●";             // clear (amber dot)
  if (code === 1 || code === 2) return "◐"; // partly cloudy
  if (code === 3) return "▭";             // cloudy block
  if (code >= 51 && code <= 82) return "☍"; // rain/drizzle
  if (code >= 95) return "⚡";             // storm
  if (code >= 71 && code <= 77) return "✶"; // snow
  return "■";                              // default LCARS shape
}

document.addEventListener("DOMContentLoaded", loadWeather);
