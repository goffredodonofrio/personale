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
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}` +
    `&longitude=${LON}` +
    `&current_weather=true` +
    `&forecast_days=5` +
    `&hourly=relativehumidity_2m,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&timezone=Europe%2FRome`;

  console.log("🌍 METEO — URL:", url);

  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log("🟢 METEO DATI:", data);
      updateWeather(data);
    })
    .catch(err => {
      console.error("❌ Meteo fetch error:", err);
      alert("Errore nel meteo (vedi console): " + err);
    });
}
