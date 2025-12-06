// ================================
//   METEO — RCM 1821-B
//   Torino (default)
// ================================

const LAT = 45.0703;
const LON = 7.6869;

const dayNames = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

async function loadWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo");
    const data = await res.json();

    const current = data.current_weather;
    const daily = data.daily;

    // ========================
    //   METEO ATTUALE
    // ========================
    document.getElementById("weather-temp").textContent =
      Math.round(current.temperature) + "°C";

    document.getElementById("weather-humidity").textContent = "--%"; // opzionale
    document.getElementById("weather-rain").textContent = "0.0 mm"; // opzionale

    // FIX DEL TUO ERRORE QUI:
    document.getElementById("weather-wind").textContent =
      Math.round(current.windspeed) + " km/h";

    // ========================
    //   PREVISIONI 4 GIORNI
    // ========================
    const forecastGrid = document.getElementById("forecast-grid");
    forecastGrid.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr);
      const label = i === 0 ? "OGGI" : dayNames[dateObj.getDay()];

      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);

      const iconHTML = getWeatherIcon(daily.weathercode[i]);

      const card = document.createElement("div");
      card.className = "ops-forecast-day";

      card.innerHTML = `
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-icon">${iconHTML}</div>
        <div class="ops-forecast-temp">${tMax}° / ${tMin}°</div>
      `;

      forecastGrid.appendChild(card);
    }
  } catch (err) {
    console.error("Errore caricamento meteo:", err);
  }
}

// ================================
//  MAPPING METEO → Weather Icons
// ================================
function getWeatherIcon(code) {
  // Sereno
  if (code === 0) return `<i class="wi wi-day-sunny"></i>`;

  // Poco nuvoloso / variabile
  if (code === 1 || code === 2) return `<i class="wi wi-day-cloudy"></i>`;

  // Nuvoloso
  if (code === 3) return `<i class="wi wi-cloudy"></i>`;

  // Pioggia
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return `<i class="wi wi-rain"></i>`;

  // Neve
  if (code >= 71 && code <= 77) return `<i class="wi wi-snow"></i>`;

  // Temporale
  if (code >= 95) return `<i class="wi wi-thunderstorm"></i>`;

  // Fallback LCARS
  return `<span style="font-size:2rem;">▪️</span>`;
}

document.addEventListener("DOMContentLoaded", loadWeather);
