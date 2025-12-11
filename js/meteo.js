console.log("🟣 meteo.js — FIX fallback icons");

const LAT = 45.0703;
const LON = 7.6869;

// Testi meteo
const WEATHER_TEXT = {
  0: "Sereno",
  1: "Sereno",
  2: "Parz. nuvoloso",
  3: "Molto nuvoloso",
  45: "Foschia",
  48: "Foschia ghiacciata",
  51: "Pioviggine",
  53: "Pioviggine",
  55: "Pioviggine forte",
  61: "Pioggia",
  63: "Pioggia",
  65: "Pioggia forte",
  71: "Neve",
  73: "Neve",
  75: "Neve forte",
  80: "Rovesci",
  81: "Rovesci",
  82: "Rovesci forti",
  95: "Temporale",
  96: "Temporale",
  99: "Temporale forte",
};

// Restituisce SEMPRE una classe icona valida
function getIconClass(code) {
  if (!code && code !== 0) return "icon-cloud";

  if ([0, 1].includes(code)) return "icon-sun";
  if ([2].includes(code)) return "icon-partly";
  if ([3].includes(code)) return "icon-overcast";
  if ([45, 48].includes(code)) return "icon-fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-rain";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-storm";

  return "icon-cloud";
}

document.addEventListener("DOMContentLoaded", loadWeather);

function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&longitude=${LON}&current_weather=true&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  fetch(url)
    .then((r) => r.json())
    .then((data) => updateWeather(data))
    .catch((err) => console.error("❌ Meteo fetch error", err));
}

function findClosestIndex(targetIso, arr) {
  let best = -1,
    bestDiff = Infinity;
  const t = new Date(targetIso).getTime();

  arr.forEach((x, i) => {
    const diff = Math.abs(new Date(x).getTime() - t);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });

  return best;
}

function updateWeather(data) {
  const cw = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  console.log("DAILY:", daily.weathercode);

  // METEO ATTUALE
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  const idx = findClosestIndex(cw.time, hourly.time);

  document.getElementById("weather-humidity").textContent =
    hourly.relativehumidity_2m[idx] + "%";

  document.getElementById("weather-rain").textContent =
    hourly.precipitation_probability[idx] + "%";

  // === PREVISIONI =======================================
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const label =
      i === 0
        ? "OGGI"
        : new Date(daily.time[i])
            .toLocaleDateString("it-IT", { weekday: "short" })
            .toUpperCase();

    const code = daily.weathercode?.[i] ?? null;
    const condition = WEATHER_TEXT[code] || "N/D";
    const iconClass = getIconClass(code);

    const tmin = Math.round(daily.temperature_2m_min[i]);
    const tmax = Math.round(daily.temperature_2m_max[i]);

    const html = `
      <div class="ops-forecast-pill"
           style="display:flex; flex-direction:column; align-items:center;
                  justify-content:center; padding: 1rem 0.5rem; gap:0.2rem;">

          <div style="font-size:1.05rem; font-weight:700;">${label}</div>

          <div class="forecast-icon ${iconClass}"></div>

          <div style="font-weight:700; color:black;">${condition}</div>

          <div style="font-weight:700; font-size:1rem;">
              ${tmin}° / ${tmax}°
          </div>

      </div>
    `;

    grid.insertAdjacentHTML("beforeend", html);
  }
}
