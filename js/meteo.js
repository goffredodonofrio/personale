// assets/meteo.js

async function loadWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast"
    + "?latitude=45.0705"
    + "&longitude=7.6868"
    + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,rain"
    + "&timezone=Europe%2FRome";

  console.log("[meteo.js] Chiamo:", url);

  try {
    const res  = await fetch(url);
    console.log("[meteo.js] Status:", res.status);
    const data = await res.json();
    console.log("[meteo.js] DATA:", data);

    const cur = data.current;
    if (!cur) {
      console.log("[meteo.js] Nessun current nel JSON");
      return;
    }

    // 🔹 TEMPERATURA
    if (cur.temperature_2m != null) {
      const el = document.getElementById("weather-temp");
      if (el) el.textContent = Math.round(cur.temperature_2m) + "°C";
    }

    // 🔹 UMIDITÀ
    if (cur.relative_humidity_2m != null) {
      const el = document.getElementById("weather-humidity");
      if (el) el.textContent = Math.round(cur.relative_humidity_2m) + "%";
    }

    // 🔹 VENTO
    if (cur.wind_speed_10m != null) {
      const el = document.getElementById("weather-wind");
      if (el) el.textContent = Math.round(cur.wind_speed_10m) + " km/h";
    }

    // 🔹 PIOGGIA (mm)
    const rain = cur.rain ?? cur.precipitation;
    if (rain != null) {
      const el = document.getElementById("weather-rain");
      if (el) el.textContent = rain.toFixed(1) + " mm";
    }

  } catch (err) {
    console.error("[meteo.js] Errore meteo:", err);
  }
}

// Avvio quando il DOM è pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("[meteo.js] DOMContentLoaded, avvio loadWeather()");
  loadWeather();
  setInterval(loadWeather, 300000); // ogni 5 minuti
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("Meteo JS caricato, avvio loadWeather()");
    loadWeather();
    setInterval(loadWeather, 300000);
});