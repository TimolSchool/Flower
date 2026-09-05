const waterButton = document.getElementById("water-button");
const sunButton = document.getElementById("sun-button");
const result = document.getElementById("result");
const tip = document.getElementById("tip");
const stateKey = "flower-care-state";

const defaultState = {
  water: 58,
  sunlight: 66,
  careCount: 0,
  day: 1,
};

let state = loadState();

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(stateKey)) };
  } catch (_error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function getHealth() {
  const balance = Math.abs(state.water - state.sunlight);
  const comfort = state.water >= 40 && state.water <= 85 && state.sunlight >= 40 && state.sunlight <= 85;
  return clamp(Math.round((state.water + state.sunlight) / 2 - balance * 0.35 + (comfort ? 8 : 0)));
}

function updateMeter(name, value) {
  document.getElementById(`${name}-value`).textContent = `${value}%`;
  document.getElementById(`${name}-bar`).style.width = `${value}%`;
}

function updateView(message) {
  const health = getHealth();
  const flower = document.getElementById("flower");
  const statusLabel = document.getElementById("status-label");
  const status = health >= 80 ? "Elle rayonne" : health >= 55 ? "Elle a bonne mine" : "Elle a besoin de toi";

  updateMeter("water", state.water);
  updateMeter("sun", state.sunlight);
  document.getElementById("health").textContent = health;
  document.getElementById("day").textContent = state.day;
  document.getElementById("streak").textContent = `${state.careCount} ${state.careCount === 1 ? "soin" : "soins"}`;
  statusLabel.textContent = status;
  flower.dataset.health = health >= 80 ? "happy" : health < 45 ? "sad" : "steady";

  if (message) {
    result.textContent = message;
    result.className = "result result-pop";
    window.setTimeout(() => result.classList.remove("result-pop"), 400);
  }

  if (state.water > 85) {
    tip.textContent = "La terre est bien humide. Laisse-la respirer avant d'ajouter de l'eau.";
  } else if (state.sunlight > 85) {
    tip.textContent = "Beaucoup de lumière ! Une petite pause à l'ombre lui fera du bien.";
  } else if (health >= 80) {
    tip.textContent = "Tout est parfait. Ta fleur est prête à s'épanouir !";
  } else {
    tip.textContent = "Les deux jauges entre 40% et 85% donnent le meilleur équilibre.";
  }
}

function care(type) {
  if (type === "water") {
    state.water = clamp(state.water + 18);
    state.sunlight = clamp(state.sunlight - 2);
    updateView("Glou glou ! La terre se gorge doucement d'eau.");
  } else {
    state.sunlight = clamp(state.sunlight + 16);
    state.water = clamp(state.water - 3);
    updateView("Les pétales se tournent vers la lumière.");
  }
  state.careCount += 1;
  saveState();
  updateView();
}

waterButton.addEventListener("click", () => care("water"));
sunButton.addEventListener("click", () => care("sun"));
updateView();
