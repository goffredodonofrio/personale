console.log("🟣 LCARS CityPulse meteo.js CARICATO");

/**********************************************
 * CONFIG
 **********************************************/
const LAT = 45.0703;
const LON = 7.6869;

document.addEventListener("DOMContentLoaded", loadWeather);

/**********************************************
 * DESCRIZIONI TESTUALI
 **********************************************/
const WEATHER_TEXT = {
    0: "Sereno",
    1: "Prevalente sereno",
    2: "Parzialmente nuvoloso",
    3: "Molto nuvoloso",
    45: "Foschia",
    48: "Foschia ghiacciata",
    51: "Pioviggine leggera",
    53: "Pioviggine",
    55: "Pioviggine intensa",
    56: "Pioviggine gelata",
    57: "Pioviggine gelata intensa",
    61: "Pioggia debole",
    63: "Pioggia",
    65: "Pioggia intensa",
    66: "Pioggia gelata",
    67: "Pioggia gelata intensa",
    71: "Nevicata debole",
    73: "Nevicata",
    75: "Nevicata intensa",
    77: "Neve a granuli",
    80: "Rovesci isolati",
    81: "Rovesci",
    82: "Rovesci intensi",
    85: "Nevischio",
    86: "Nevischio intenso",
    95: "Temporali",
    96: "Temporali con grandine",
    99: "Temporali forti con grandine"
};

/**********************************************
 * ICON SET (SVG INLINE)
 **********************************************/
const ICONS = {
    sun: `<svg class="weather-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
        </svg>`,

    cloud: `<svg class="weather-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        </svg>`,

    rain: `<svg class="weather-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="8" y1="13" x2="8" y2="21"></line>
              <line x1="12" y1="15" x2="12" y2="23"></line>
              <line x1="16" y1="13" x2="16" y2="21"></line>
              <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
        </svg>`,

    snow: `<svg class="weather-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v20M5 5l14 14M5 19l14-14"></path>
        </svg>`,

    fog: `<svg class="weather-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="16" x2="21" y2="16"></line>
              <line x1="3" y1="8" x2="21" y2="8"></line>
        </svg>`
};

/**********************************************
 * FETCH METEO
 **********************************************/
function loadWeather() {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&current_weather=true&forecast_days=5` +
        `&hourly=relativehumidity_2m,precipitation_probability` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
        `&timezone=Europe%2FRome`;

    console.log("🌐 Meteo URL:", url);

    fetch(url)
        .then(r => r.json())
        .then(data => {
            console.log("🟢 Meteo:", data);
            updateWeather(data);
        })
        .catch(err => console.error("🔴 Errore meteo:", err));
}

/**********************************************
 * TROVA ORA PIÙ VICINA NEGLI HOURLY
 **********************************************/
function findClosestIndex(targetIso, timeArray) {
    let bestIdx = 0;
    let bestDiff = Infinity;
    const targetMs = new Date(targetIso).getTime();

    timeArray.forEach((t, i) => {
        const diff = Math.abs(new Date(t).getTime() - targetMs);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = i;
        }
    });

    return bestIdx;
}

/**********************************************
 * GENERA OVERLAY METEO (pioggia/neve/foschia)
 **********************************************/
function applyWeatherOverlay(code) {
    const panel = document.querySelector(".ops-panel");
    let overlay = document.querySelector(".weather-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "weather-overlay";
        panel.appendChild(overlay);
    }

    overlay.innerHTML = "";

    if (code >= 61 && code <= 67) {
        // 🌧 Pioggia
        for (let i = 0; i < 60; i++) {
            const drop = document.createElement("div");
            drop.className = "rain-drop";
            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDuration = (0.6 + Math.random()).toFixed(2) + "s";
            overlay.appendChild(drop);
        }
    } else if (code >= 71 && code <= 77) {
        // ❄ Neve
        for (let i = 0; i < 40; i++) {
            const flake = document.createElement("div");
            flake.className = "snow-flake";
            flake.style.left = Math.random() * 100 + "%";
            flake.style.animationDuration = (3 + Math.random() * 2).toFixed(2) + "s";
            overlay.appendChild(flake);
        }
    } else if (code === 45 || code === 48) {
        // 🌫 Foschia
        overlay.style.backdropFilter = "blur(3px)";
    } else {
        overlay.style.backdropFilter = "none";
    }
}

/**********************************************
 * SELEZIONA ICONA GIUSTA
 **********************************************/
function getWeatherIcon(code) {
    if (code === 0 || code === 1) return ICONS.sun;
    if (code === 2 || code === 3) return ICONS.cloud;
    if (code >= 61 && code <= 67) return ICONS.rain;
    if (code >= 71 && code <= 86) return ICONS.snow;
    if (code === 45 || code === 48) return ICONS.fog;

    return ICONS.cloud;
}

/**********************************************
 * AGGIORNA INTERFACCIA
 **********************************************/
function updateWeather(data) {
    const cw = data.current_weather;
    const daily = data.daily;

    /* METEO ATTUALE */
    document.getElementById("weather-temp").textContent =
        Math.round(cw.temperature) + "°C";
    document.getElementById("weather-wind").textContent =
        Math.round(cw.windspeed) + " km/h";

    /* UMIDITÀ + PROB PIOGGIA */
    const idx = findClosestIndex(cw.time, data.hourly.time);
    document.getElementById("weather-humidity").textContent =
        data.hourly.relativehumidity_2m[idx] + "%";
    document.getElementById("weather-rain").textContent =
        data.hourly.precipitation_probability[idx] + "%";

    /* MODALITÀ GIORNO/NOTTE */
    const hour = new Date().getHours();
    const panel = document.querySelector(".ops-panel");
    panel.classList.toggle("night-mode", hour >= 18 || hour < 7);
    panel.classList.toggle("day-mode", hour >= 7 && hour < 18);

    /* OVERLAY METEO */
    applyWeatherOverlay(cw.weathercode);

    /* FORECAST */
    const grid = document.getElementById("forecast-grid");
    grid.innerHTML = "";

    /* OGGI */
    const tc = daily.weathercode[0];
    grid.innerHTML += `
        <div class="ops-forecast-day">
            <div class="ops-forecast-day-label">OGGI</div>
            ${getWeatherIcon(tc)}
            <div class="ops-forecast-description">${WEATHER_TEXT[tc]}</div>
            <div class="ops-forecast-temp">${Math.round(daily.temperature_2m_min[0])}° / 
                                            ${Math.round(daily.temperature_2m_max[0])}°</div>
        </div>
    `;

    /* PROSSIMI 3 GIORNI */
    for (let i = 1; i <= 3; i++) {
        const code = daily.weathercode[i];
        const label = new Date(daily.time[i])
            .toLocaleDateString("it-IT", { weekday: "short" })
            .toUpperCase();

        grid.innerHTML += `
            <div class="ops-forecast-day">
                <div class="ops-forecast-day-label">${label}</div>
                ${getWeatherIcon(code)}
                <div class="ops-forecast-description">${WEATHER_TEXT[code]}</div>
                <div class="ops-forecast-temp">${Math.round(daily.temperature_2m_min[i])}° /
                                                ${Math.round(daily.temperature_2m_max[i])}°</div>
            </div>
        `;
    }
}
