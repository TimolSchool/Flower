const result = document.getElementById("result");
const tip = document.getElementById("tip");
const sky = document.querySelector(".sky");
const clouds = document.querySelectorAll(".cloud");
const astro = document.getElementById("astro");
const stateKey = "flower-care-state-v2";

const defaultState = {
  water: 0,
  sunlight: 0,
  careCount: 0,
  day: 1,
};

let state = loadState();
let sunInterval = null;

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
  if (progress >= 75) return "flower";
  if (progress >= 50) return "bud";
  if (progress >= 25) return "sprout";
  return "seed";
}

function updateMeter(name, value) {
  document.getElementById(`${name}-value`).textContent = `${value}%`;
  document.getElementById(`${name}-bar`).style.width = `${value}%`;
}

function showRain() {
  sky.classList.remove("raining");
  void sky.offsetWidth;
  sky.classList.add("raining");
  window.setTimeout(() => sky.classList.remove("raining"), 1300);
}

function mergeClouds() {
  if (sky.classList.contains("clouds-merged")) return;
  sky.classList.add("clouds-merged");
  const mainCloud = sky.querySelector(".cloud-one");
  mainCloud.style.left = "calc(50% - 3.8rem)";
  mainCloud.style.right = "auto";
  state.water = clamp(state.water + 20);
  state.careCount += 1;
  saveState();
  showRain();
  updateView("Il est important de boire régulièrement");
}

function splitClouds() {
  if (!sky.classList.contains("clouds-merged")) return;
  sky.classList.remove("clouds-merged");
  clouds[0].style.left = "";
  clouds[0].style.right = "";
  clouds[1].style.left = "";
  clouds[1].style.right = "";
  updateView("Les nuages se séparent.");
}

function updateView(message) {
  const health = getHealth();
  const flower = document.getElementById("flower");
  const statusLabel = document.getElementById("status-label");
  const stage = getGrowthStage();
  const status = stage === "flower" ? (health >= 80 ? "Elle rayonne" : "Elle fleurit") : stage === "bud" ? "Le bouton s'ouvre" : stage === "sprout" ? "Une pousse apparaît" : "Une graine attend";

  updateMeter("water", state.water);
  updateMeter("sun", state.sunlight);
  document.getElementById("health").textContent = health;
  document.getElementById("streak").textContent = `${state.careCount} ${state.careCount === 1 ? "soin" : "soins"}`;
  statusLabel.textContent = status;
  document.getElementById("flower-title").textContent = stage === "flower" ? "Bonjour, petite fleur." : stage === "bud" ? "Les pétales se préparent." : stage === "sprout" ? "Une vie prend racine." : "Bonjour, petite graine.";
  flower.dataset.stage = stage;
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
  } else if (stage === "bud") {
    tip.textContent = "Le bouton est presque prêt. Encore un peu d'eau et de lumière.";
  } else if (health >= 80) {
    tip.textContent = "Tout est parfait. Ta fleur est prête à s'épanouir !";
  } else if (state.sunlight < 100) {
    tip.textContent = astro.classList.contains("sun")
      ? "Le soleil recharge la fleur automatiquement."
      : "Déplace la lune pour faire apparaître le soleil.";
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
    const otherCloud = [...clouds].find((candidate) => candidate !== cloud);
    const cloudRect = cloud.getBoundingClientRect();
    const otherRect = otherCloud.getBoundingClientRect();
    const merged = cloudRect.left < otherRect.right && cloudRect.right > otherRect.left;
    if (merged) {
      mergeClouds();
      return;
    }
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
    if (!moved && sky.classList.contains("clouds-merged")) {
      splitClouds();
      return;
    }
    if (!moved) return;

    const otherCloud = [...clouds].find((candidate) => candidate !== cloud);
    const cloudRect = cloud.getBoundingClientRect();
    const otherRect = otherCloud.getBoundingClientRect();
    const merged = cloudRect.left < otherRect.right && cloudRect.right > otherRect.left;
    if (!merged) return;
    mergeClouds();
  });
}

clouds.forEach(moveCloud);

function startSun() {
  if (!astro.classList.contains("sun")) {
    astro.classList.remove("moon");
    astro.classList.add("sun");
    astro.setAttribute("aria-label", "Soleil à déplacer");
    updateView("Ya un grand soleil, on va pique-niquer");
  }
  if (!sunInterval) {
    sunInterval = window.setInterval(() => {
      if (state.sunlight >= 100) return;
      state.sunlight = clamp(state.sunlight + 5);
      saveState();
      updateView();
    }, 1200);
  }
}

function setAstroSide() {
  const astroCenter = astro.offsetLeft + astro.offsetWidth / 2;
  const isSunSide = astroCenter >= sky.clientWidth / 2;
  if (isSunSide) {
    startSun();
    return;
  }
  astro.classList.remove("sun");
  astro.classList.add("moon");
  astro.setAttribute("aria-label", "Lune à déplacer");
  if (sunInterval) {
    window.clearInterval(sunInterval);
    sunInterval = null;
  }
  updateView("La lune veille sur le jardin.");
}

let astroDragging = false;
let astroMoved = false;
let astroStartX = 0;
let astroStartY = 0;
let astroStartLeft = 0;
let astroStartTop = 0;

astro.addEventListener("pointerdown", (event) => {
  astroDragging = true;
  astroMoved = false;
  astroStartX = event.clientX;
  astroStartY = event.clientY;
  astroStartLeft = astro.offsetLeft;
  astroStartTop = astro.offsetTop;
  astro.setPointerCapture(event.pointerId);
  astro.classList.add("is-dragging");
});

astro.addEventListener("pointermove", (event) => {
  if (!astroDragging) return;
  const nextLeft = astroStartLeft + event.clientX - astroStartX;
  const nextTop = astroStartTop + event.clientY - astroStartY;
  const maxLeft = sky.clientWidth - astro.offsetWidth;
  const maxTop = sky.clientHeight - astro.offsetHeight;
  astro.style.left = `${Math.max(0, Math.min(maxLeft, nextLeft))}px`;
  astro.style.top = `${Math.max(0, Math.min(maxTop, nextTop))}px`;
  astro.style.right = "auto";
  astroMoved = Math.abs(event.clientX - astroStartX) > 6 || Math.abs(event.clientY - astroStartY) > 6;
  if (astroMoved) setAstroSide();
});

astro.addEventListener("pointerup", () => {
  if (!astroDragging) return;
  astroDragging = false;
  astro.classList.remove("is-dragging");
  if (!astroMoved) setAstroSide();
});

astro.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startSun();
  }
});

updateView();
