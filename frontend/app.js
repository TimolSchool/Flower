const waterButton = document.getElementById("water-button");
const sunButton = document.getElementById("sun-button");
const result = document.getElementById("result");
const tip = document.getElementById("tip");
const stateKey = "flower-care-state-v2";

const defaultState = {
  water: 0,
  sunlight: 0,
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
  const comfort = state.water >= 40 && state.sunlight >= 40;
  return clamp(Math.round((state.water + state.sunlight) / 2 - balance * 0.35 + (comfort ? 8 : 0)));
}

function getGrowthStage() {
  const progress = Math.min(state.water, state.sunlight);
  if (progress >= 80) return "flower";
  if (progress >= 35) return "sprout";
  return "seed";
}

function updateMeter(name, value) {
  document.getElementById(`${name}-value`).textContent = `${value}%`;
  document.getElementById(`${name}-bar`).style.width = `${value}%`;
}

function updateView(message) {
  const health = getHealth();
  const flower = document.getElementById("flower");
  const sprout = document.getElementById("sprout");
  const seed = document.getElementById("seed");
  const statusLabel = document.getElementById("status-label");
  const stage = getGrowthStage();
  const status = stage === "flower" ? (health >= 80 ? "Elle rayonne" : "Elle fleurit") : stage === "sprout" ? "Une pousse apparaît" : "Une graine attend";

  updateMeter("water", state.water);
  updateMeter("sun", state.sunlight);
  document.getElementById("health").textContent = health;
  document.getElementById("streak").textContent = `${state.careCount} ${state.careCount === 1 ? "soin" : "soins"}`;
  statusLabel.textContent = status;
  document.getElementById("flower-title").textContent = stage === "flower" ? "Bonjour, petite fleur." : stage === "sprout" ? "Une vie prend racine." : "Bonjour, petite graine.";
  flower.dataset.stage = stage;
  sprout.dataset.stage = stage;
  seed.dataset.stage = stage;
  flower.dataset.health = health >= 80 ? "happy" : health < 45 ? "sad" : "steady";

  if (message) {
    result.textContent = message;
    result.className = "result result-pop";
    window.setTimeout(() => result.classList.remove("result-pop"), 400);
  }

  if (state.water === 100 && state.sunlight === 100) {
    tip.textContent = "Les deux jauges sont pleines. Ta fleur est complètement épanouie !";
  } else if (stage === "seed") {
    tip.textContent = "Arrose la graine et offre-lui de la lumière pour réveiller la vie sous la terre.";
  } else if (stage === "sprout") {
    tip.textContent = "La pousse grandit. Continue les deux soins pour faire apparaître les pétales.";
  } else if (health >= 80) {
    tip.textContent = "Tout est parfait. Ta fleur est prête à s'épanouir !";
  } else {
    tip.textContent = "Les deux jauges entre 40% et 85% donnent le meilleur équilibre.";
  }
}

function care(type) {
  if (type === "water") {
    state.water = clamp(state.water + 20);
    updateView("Il est important de boire régulièrement");
  } else {
    state.sunlight = clamp(state.sunlight + 20);
    updateView("Ya un grand soleil, on va pique-niquer");
  }
  state.careCount += 1;
  saveState();
  updateView();
}

waterButton.addEventListener("click", () => care("water"));
sunButton.addEventListener("click", () => care("sun"));
updateView();
