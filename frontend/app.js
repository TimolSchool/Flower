const result = document.getElementById("result");
const tip = document.getElementById("tip");
const sky = document.querySelector(".sky");
const clouds = document.querySelectorAll(".cloud");
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
  } else if (state.sunlight < 100) {
    tip.textContent = "Déplace les nuages pour laisser entrer la lumière du soleil.";
  } else {
    tip.textContent = "Les deux jauges entre 40% et 85% donnent le meilleur équilibre.";
  }
}

function moveCloud(cloud) {
  let dragging = false;
  let moved = false;
  let sunlightGranted = false;
  let startX = 0;
  let startLeft = 0;

  cloud.addEventListener("pointerdown", (event) => {
    dragging = true;
    moved = false;
    sunlightGranted = false;
    startX = event.clientX;
    startLeft = cloud.offsetLeft;
    cloud.setPointerCapture(event.pointerId);
    cloud.classList.add("is-dragging");
  });

  cloud.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const nextLeft = startLeft + event.clientX - startX;
    const maxLeft = sky.clientWidth - cloud.offsetWidth;
    const boundedLeft = Math.max(0, Math.min(maxLeft, nextLeft));
    if (Math.abs(nextLeft - startLeft) > 8) moved = true;
    cloud.style.left = `${boundedLeft}px`;
    cloud.style.right = "auto";

    const cloudCenter = boundedLeft + cloud.offsetWidth / 2;
    const flowerCenter = sky.clientWidth / 2;
    const isOverFlower = Math.abs(cloudCenter - flowerCenter) < sky.clientWidth * 0.18;
    if (moved && !isOverFlower && !sunlightGranted) {
      sunlightGranted = true;
      state.sunlight = clamp(state.sunlight + 20);
      state.careCount += 1;
      saveState();
      updateView("Ya un grand soleil, on va pique-niquer");
    }
  });

  cloud.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    cloud.classList.remove("is-dragging");
    if (!moved) return;
    if (!moved) {
      state.water = clamp(state.water + 20);
      state.careCount += 1;
      saveState();
      updateView("Il est important de boire régulièrement");
      return;
    }
  });
}

clouds.forEach(moveCloud);

updateView();
