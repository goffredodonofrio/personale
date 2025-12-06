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

for (let i = 0; i < 4; i++) {
  const dateStr = daily.time[i];
  const dateObj = new Date(dateStr);
  const label = i === 0 ? "OGGI" : dayNames[dateObj.getDay()];

  const tMax = Math.round(daily.temperature_2m_max[i]);
  const tMin = Math.round(daily.temperature_2m_min[i]);
  const icon = getWeatherIcon(daily.weathercode[i]);

  const div = document.createElement("div");
  div.className = "ops-forecast-day";

  div.innerHTML = `
      <div class="ops-forecast-day-label">${label}</div>
      <div class="ops-forecast-icon">${icon}</div>
      <div class="ops-forecast-temp">${tMax}° / ${tMin}°</div>
  `;

  forecastGrid.appendChild(div);
}

  } catch (err) {
    console.error("Errore caricamento meteo:", err);
  }
}

// ICON SET stile LCARS minimal
function getWeatherIcon(code) {
  if (code === 0) return "●";             // Sole pieno LCARS
  if (code === 1) return "◔";             // Poco nuvoloso
  if (code === 2) return "◑";             // Parzialmente nuvoloso
  if (code === 3) return "▣";             // Nuvoloso
  if (code >= 51 && code <= 67) return "☍"; // Pioggia LCARS
  if (code >= 71 && code <= 77) return "✶"; // Neve
  if (code >= 80 && code <= 82) return "≋"; // Rovesci
  if (code >= 95) return "⚡";             // Temporale
  return "■";                             // Default LCARS minimal
}

.ops-forecast-icon {
    font-size: 2.4rem;
    color: var(--lcars-mauve);
    margin: 0.4rem 0 0.6rem;
}

document.addEventListener("DOMContentLoaded", loadWeather);
