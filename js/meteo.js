console.log("🟣 meteo.js CARICATO");

/***************************************************
 *   METEO — OPEN-METEO COMPLETO (Torino)
 ***************************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/***************************************************
 *  DIZIONARI: Testi + Icone (emoji per ora)
 ***************************************************/
const WEATHER_TEXT = {
  0: "Sereno", 1: "Sereno", 2: "Parzialmente nuvoloso", 3: "Nuvoloso",
  45: "Foschia", 48: "Foschia ghiacciata",
  51: "Pioviggine", 53: "Pioviggine", 55: "Pioviggine intensa",
  56: "Ghiacciata", 57: "Ghiacciata forte",
  61: "Pioggia", 63: "Pioggia", 65: "Pioggia forte",
  71: "Neve", 73: "Neve", 75: "Neve intensa",
  77: "Neve tonda",
  80: "Rovesci", 81: "Rovesci", 82: "Rovesci intensi",
  85: "Nevischio", 86: "Nevischio forte",
  95: "Temporale", 96: "Temporale", 99: "Temporale forte"
};

const WEATHER_ICON = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  56: "🌧️",
  57: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  77: "❄️",
  80: "🌦️",
  81: "🌦️",
  82: "🌧️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️"
};


/***************************************************
 *  CARICA DATI METEO
 ***************************************************/
function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${LAT}&longitude=${LON}` +
    "&current_weather=true" +
    "&hourly=relativehumidity_2m,precipitation_probability" +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min" +
    "&forecast_days=5&timezone=Europe%2FRome";

  console.log("🔵 Fetch URL:", url);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("🟢 Meteo ricevuto:", data);
      updateWeather(data);
    })
    .catch(err => console.error("🔴 ERRORE FETCH METEO:", err));
}


/***************************************************
 *  TROVA L’ORA PIÙ VICINA (per umidità e pioggia)
 ***************************************************/
function findClosestIndex(targetIso, array) {
  let best = 0;
  let bestDiff = Infinity;
  const target = new Date(targetIso).getTime();

  array.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });

  return best;
}


/***************************************************
 *  AGGIORNA L’INTERFACCIA
 ***************************************************/
function updateWeather(data) {
  if (!data?.current_weather || !data?.hourly || !data?.daily) {
    console.error("❌ Dati meteo incompleti:", data);
    return;
  }

  const cw = data.current_weather;

  /* === METEO ATTUALE === */
  document.getElementById("weather-temp").textContent =
    Math.round(cw.temperature) + "°C";

  document.getElementById("weather-wind").textContent =
    Math.round(cw.windspeed) + " km/h";

  /* Umidità + prob. pioggia */
  const idx = findClosestIndex(cw.time, data.hourly.time);

  const humidity = data.hourly.relativehumidity_2m[idx] ?? "--";
  const rainProb = data.hourly.precipitation_probability[idx] ?? "--";

  document.getElementById("weather-humidity").textContent = humidity + "%";
  document.getElementById("weather-rain").textContent = rainProb + "%";


  /* === PREVISIONI GIORNI SUCCESSIVI (oggi + 2 futuri) === */
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = ""; // pulizia

  const daily = data.daily;

  /* OGGI */
  addForecastPill(grid,
    "OGGI",
    daily.weathercode[0],
    daily.temperature_2m_min[0],
    daily.temperature_2m_max[0]
  );

  /* GIORNI SUCCESSIVI — SOLO 2 */
  for (let i = 1; i <= 2; i++) {
    if (!daily.time[i]) continue;

    const date = new Date(daily.time[i]);
    const label = date.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();

    addForecastPill(grid,
      label,
      daily.weathercode[i],
      daily.temperature_2m_min[i],
      daily.temperature_2m_max[i]
    );
  }
}


/***************************************************
 *  CREA UNA PREVISIONE (pill blu con icona grande)
 ***************************************************/
function addForecastPill(grid, label, code, tmin, tmax) {
  const icon = WEATHER_ICON[code] || "❓";
  const text = WEATHER_TEXT[code] || "N/D";

  grid.innerHTML += `
    <div class="ops-forecast-pill" style="
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        padding:1rem 1.4rem;
    ">

        <!-- ICONA GRANDE -->
        <div style="font-size:2.2rem; margin-bottom:0.4rem; line-height:1;">
            ${icon}
        </div>

        <!-- TESTO MULTILINEA -->
        <div style="font-size:0.95rem; text-transform:uppercase; line-height:1.25;">
            <span style="font-weight:700; color:white;">${label}</span><br>
            <span style="font-weight:700; color:black;">${text}</span><br>
            <span style="font-weight:700; color:white;">${tmin}° / ${tmax}°</span>
        </div>

    </div>
  `;
}
