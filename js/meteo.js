// ================================
//   METEO — versione TESTUALE
// ================================

const LAT = 45.0703;
const LON = 7.6869;

const dayNames = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

document.addEventListener("DOMContentLoaded", loadWeather);

async function loadWeather() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LAT}&longitude=${LON}` +
      `&current_weather=true` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&timezone=Europe%2FRome`;

    console.log("🌤️ Chiamo Open-Meteo:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo: " + res.status);

    const data = await res.json();
    console.log("✅ Meteo ricevuto:", data);

    // ---------------------------
    // METEO ATTUALE
    // ---------------------------
    const current = data.current_weather;
    const daily = data.daily;

    // Temperatura attuale
    const tempEl = document.getElementById("weather-temp");
    if (tempEl && current && typeof current.temperature === "number") {
      tempEl.textContent = Math.round(current.temperature) + "°C";
    }

    // Campi placeholder (non li stiamo leggendo da API)
    const humEl = document.getElementById("weather-humidity");
    if (humEl) humEl.textContent = "--%";

    const rainEl = document.getElementById("weather-rain");
    if (rainEl) rainEl.textContent = "0.0 mm";

    const windEl = document.getElementById("weather-wind");
    if (windEl && current && typeof current.windspeed === "number") {
      windEl.textContent = Math.round(current.windspeed) + " km/h";
    }

    // ---------------------------
    // FORECAST OGGI + 3 GIORNI
    // ---------------------------
    const forecastGrid = document.getElementById("forecast-grid");
    if (!forecastGrid) {
      console.warn("⚠️ Nessun elemento con id 'forecast-grid' trovato");
      return;
    }

    forecastGrid.innerHTML = "";

    // Sicurezza: controlliamo che i vettori esistano
    if (
      !daily ||
      !Array.isArray(daily.time) ||
      !Array.isArray(daily.temperature_2m_max) ||
      !Array.isArray(daily.temperature_2m_min) ||
      !Array.isArray(daily.weathercode)
    ) {
      console.warn("⚠️ Struttura 'daily' inattesa:", daily);
      return;
    }

    // Mostriamo oggi + 3 giorni (max 4 elementi disponibili)
    const daysToShow = Math.min(4, daily.time.length);

    for (let i = 0; i < daysToShow; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr);
      const label = i === 0 ? "OGGI" : dayNames[dateObj.getDay()];

      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);
      const description = weatherDescription(daily.weathercode[i]);

      const card = document.createElement("div");
      card.className = "ops-forecast-day";

      card.innerHTML = `
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-text">${description}</div>
        <div class="ops-forecast-temp">${tMax}° / ${tMin}°</div>
      `;

      forecastGrid.appendChild(card);
    }

  } catch (err) {
    console.error("❌ Errore caricamento meteo:", err);
  }
}

// ================================
//   DESCRIZIONE TESTUALE
// ================================
function weatherDescription(code) {
  if (code === 0) return "SERENO";
  if (code === 1 || code === 2) return "PARZ. NUVOLOSO";
  if (code === 3) return "NUVOLOSO";

  if (code >= 45 && code <= 48) return "NEBBIA";

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "PIOGGIA";

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return "NEVE";

  if (code >= 95) return "TEMPORALE";

  return "N/D";
}
