// ================================
//   METEO — RCM 1821-B
//   Open-Meteo API + Icone LCARS
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

    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo");

    const data = await res.json();

    const current = data.current_weather;
    const daily = data.daily;

    // ============================
    // METEO ATTUALE
    // ============================
    document.getElementById("weather-temp").textContent =
      Math.round(current.temperature) + "°C";

    document.getElementById("weather-humidity").textContent = "--%";
    document.getElementById("weather-rain").textContent = "0.0 mm";

    // FIX: questa riga prima era sbagliata
    document.getElementById("weather-wind").textContent =
      Math.round(current.windspeed) + " km/h";

    // ============================
    // PREVISIONI — OGGI + 3 GIORNI
    // ============================
    const forecastGrid = document.getElementById("forecast-grid");
    forecastGrid.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr);

      const label = i === 0 ? "OGGI" : dayNames[dateObj.getDay()];
      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);
      const iconChar = lcarsIconFromCode(daily.weathercode[i]);

      const card = document.createElement("div");
      card.className = "ops-forecast-day";

      card.innerHTML = `
        <div class="ops-forecast-day-label">${label}</div>
        <div class="ops-forecast-icon">${iconChar}</div>
        <div class="ops-forecast-temp">${tMax}° / ${tMin}°</div>
      `;

      forecastGrid.appendChild(card);
    }
  } catch (err) {
    console.error("Errore caricamento meteo:", err);
  }
}

// ================================
//  ICON MAPPING → simboli LCARS
// ================================
function lcarsIconFromCode(code) {
  // 0: sereno
  if (code === 0) return "☀️";      

  // 1–2: poco nuvoloso / variabile
  if (code === 1 || code === 2) return "🌤️";  

  // 3: coperto
  if (code === 3) return "⛅️";      

  // 45–48: nebbia
  if (code >= 45 && code <= 48) return "🌫️";  

  // 51–67, 80–82: pioggia
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "🌨️";                    

  // 71–77, 85–86: neve
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return "❄️";                    

  // 95–99: temporali
  if (code >= 95) return "🌩️🌩️";      

  return "■"; 
}
