// assets/lcars.js

// Mappa ID → file audio
const LCARS_SOUNDS = {
  audio1: new Audio("assets/beep1.mp3"),
  audio2: new Audio("assets/beep2.mp3"),
  audio3: new Audio("assets/beep3.mp3"),
  audio4: new Audio("assets/beep4.waw.mp3") // nome file esatto
};

// Impostiamo un volume più soft (puoi alzarlo/abbassarlo)
Object.values(LCARS_SOUNDS).forEach(a => {
  a.volume = 0.6;
});

// Suona solo il beep
function playSound(soundId) {
  const audio = LCARS_SOUNDS[soundId];
  if (!audio) {
    console.warn("LCARS: soundId non trovato:", soundId);
    return;
  }

  // riavvolge per poter risuonare rapidamente
  audio.currentTime = 0;
  audio.play().catch(err => {
    console.warn("LCARS: impossibile riprodurre audio:", err);
  });
}

// Suona il beep e *opzionalmente* fa una redirect
function playSoundAndRedirect(soundId, url) {
  playSound(soundId);

  if (url && url !== "#") {
    // piccolo delay per far sentire il beep prima del cambio pagina
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  }
}

// Scroll to top (usato dal bottone RCM 1821-B a sinistra)
function topFunction() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
