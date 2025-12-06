// assets/meteo.js

// Torino (modifica se vuoi altre coordinate)
const LAT = 45.0703;
const LON = 7.6869;

// Chiamata a Open-Meteo: current + 4 giorni di forecast
async function loadWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo");

    const data = await res.json();

    // --- METEO ATTUALE (pillole) ---
    const current = data.current_weather;
    const daily = data.daily;

    // temperatura attuale
    document.getElementById("weather-temp").textContent =
      Math.round(current.temperature) + "°C";

    // uso alcune info approssimate per umidità / pioggia / vento.
    // Se vuoi dati più precisi, possiamo aggiungere altri parametri daily.
    // Qui metto placeholder semplici:
    document.getElementById("weather-humidity").textContent = "--%";
    document.getElementById("weather-rain").textContent = "0.0 mm";
    document.getElementById("weather-wind").textContent =
      Math.round(current.windspeed) + " km/h";

    // --- FORECAST OGGI + PROSSIMI 3 GIORNI ---
    const forecastGrid = document.getElementById("forecast-grid");
    forecastGrid.innerHTML = "";

    const daysToShow = 4; // oggi + 3
    const dayNames = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

    for (let i = 0; i < daysToShow; i++) {
      const dateStr = daily.time[i]; // "2025-12-06"
      const dateObj = new Date(dateStr + "T00:00:00");
      const dayLabel = dayNames[dateObj.getDay()];

      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);
      const code = daily.weathercode[i];
      const icon = getWeatherIcon(code);

      const div = document.createElement("div");
      div.className = "ops-forecast-day";

      div.innerHTML = `
        <div class="ops-forecast-day-label">${i === 0 ? "OGGI" : dayLabel}</div>
        <div class="ops-forecast-icon">${icon}</div>
        <div class="ops-forecast-temp">
          <span class="ops-forecast-temp-max">${tMax}°</span> /
          <span class="ops-forecast-temp-min">${tMin}°</span>
        </div>
      `;

      forecastGrid.appendChild(div);
    }
  } catch (err) {
    console.error("Errore caricamento meteo:", err);
  }
}

// mapping codice → “icona” (testuale/emoji super semplice)
function getWeatherIcon(code) {
  // Codici Open-Meteo (semplificati)
  if (code === 0) return "☀️";                   // clear
  if (code === 1 || code === 2) return "🌤️";     // mostly clear
  if (code === 3) return "☁️";                   // cloudy
  if (code >= 51 && code <= 67) return "🌧️";     // drizzle / rain
  if (code >= 71 && code <= 77) return "❄️";     // snow
  if (code >= 80 && code <= 82) return "🌦️";     // rain showers
  if (code >= 95) return "⛈️";                   // thunderstorm
  return "▫️";
}

function lcarsIcon(condition) {
  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "●";          // sole pieno
  if (condition.includes("cloud")) return "▭";         // nuvoloso
  if (condition.includes("part")) return "◐";          // parzialmente nuvoloso
  if (condition.includes("rain")) return "☍";          // pioggia stilizzata
  if (condition.includes("storm")) return "⚡";         // temporale
  if (condition.includes("snow")) return "✶";          // neve
  if (condition.includes("fog")) return "≡";           // nebbia

  return "■"; // default LCARS
}
// avvia meteo al load
document.addEventListener("DOMContentLoaded", loadWeather);


document.getElementById(`fc-day-${i}`).textContent = dayShort;
document.getElementById(`fc-icon-${i}`).textContent = lcarsIcon(desc);
document.getElementById(`fc-temp-${i}`).textContent = `${tmax}° / ${tmin}°`;
