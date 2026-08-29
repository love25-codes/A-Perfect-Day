"use strict";

/* ============================================================
   PART 1 — TV STORY & MAGICAL WORLD
   ============================================================ */

const PH = {
  introEnd: 0.045,
  wireEnd: 0.15,
  tvRevealEnd: 0.25,
  bzztEnd: 0.28,
  storyStart: 0.28,
  storyEnd: 0.90
};

const SCENE_COUNT = 8;

const scrollContainer = document.getElementById("scrollContainer");
const introTitle = document.getElementById("introTitle");

const auroraPrimary = document.getElementById("auroraPrimary");
const auroraSecondary = document.getElementById("auroraSecondary");
const radiantCore = document.getElementById("radiantCore");
const ambientGlow = document.getElementById("ambientGlow");

const wireLeftBase = document.getElementById("wireLeftBase");
const wireRightBase = document.getElementById("wireRightBase");
const wireLeftTexture = document.getElementById("wireLeftTexture");
const wireRightTexture = document.getElementById("wireRightTexture");
const wireLeftHighlight = document.getElementById("wireLeftHighlight");
const wireRightHighlight = document.getElementById("wireRightHighlight");

const wireShadowLeft = document.getElementById("wireShadowLeft");
const wireShadowRight = document.getElementById("wireShadowRight");

const plugLeftGroup = document.getElementById("plugLeftGroup");
const plugRightGroup = document.getElementById("plugRightGroup");

const spark = document.getElementById("spark");
const tvRig = document.getElementById("tvRig");
const tvLed = document.getElementById("tvLed");

const crtStatic = document.getElementById("crtStatic");
const crtBzzt = document.getElementById("crtBzzt");

const knobChannel = document.getElementById("knobChannel");
const knobVolume = document.getElementById("knobVolume");

const timeline = document.getElementById("timeline");
const timelineFill = document.getElementById("timelineFill");
const timelineItems = document.querySelectorAll("#timelineList li");
const scenes = document.querySelectorAll(".scene");
const clockDigits = document.getElementById("clockDigits");


/* ------------------------------------------------------------
   Decorative & Space Dust Particles
   ------------------------------------------------------------ */

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function scatter(container, amount, factory) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < amount; i++) {
    fragment.appendChild(factory(i));
  }
  container.appendChild(fragment);
}

scatter(
  document.getElementById("spaceDust"),
  35,
  () => {
    const el = document.createElement("span");
    const size = random(3, 7);
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.left = random(2, 98) + "%";
    el.style.top = random(5, 95) + "%";
    el.style.animationDuration = random(6, 14) + "s";
    el.style.animationDelay = random(0, 8) + "s";
    return el;
  }
);

scatter(
  document.getElementById("dustMotes"),
  25,
  () => {
    const el = document.createElement("span");
    el.style.left = random(5,95) + "%";
    el.style.top = random(10,70) + "%";
    el.style.animationDelay = random(0,5) + "s";
    return el;
  }
);

scatter(
  document.getElementById("cloudsLayer"),
  6,
  () => {
    const el = document.createElement("span");
    el.style.top = random(5,45) + "%";
    el.style.width = random(60,140) + "px";
    el.style.height = random(25,55) + "px";
    el.style.animationDuration = random(30,55) + "s";
    return el;
  }
);

scatter(
  document.getElementById("birdsLayer"),
  5,
  () => {
    const el = document.createElement("span");
    el.style.top = random(10,40) + "%";
    el.style.left = random(0,80) + "%";
    el.style.animationDelay = random(0,8) + "s";
    return el;
  }
);

scatter(
  document.getElementById("starsLayer"),
  70,
  () => {
    const el = document.createElement("span");
    el.style.left = random(0,100) + "%";
    el.style.top = random(0,80) + "%";
    el.style.animationDelay = random(0,4) + "s";
    return el;
  }
);

scatter(
  document.getElementById("notesLayer"),
  8,
  () => {
    const el = document.createElement("span");
    el.textContent = Math.random() > .5 ? "♪" : "♫";
    el.style.left = random(35,70) + "%";
    el.style.bottom = random(20,40) + "%";
    el.style.animationDelay = random(0,4) + "s";
    return el;
  }
);


/* ------------------------------------------------------------
   Tactile Braided Cable Physics & Plug Motion
   ------------------------------------------------------------ */

const WIRE = {
  leftStartX: 200,
  rightStartX: 800,
  centerX: 500,
  meetY: 300,
  topY: -40
};

function updateWires(t) {
  const lx = WIRE.leftStartX + (WIRE.centerX - 15 - WIRE.leftStartX) * t;
  const rx = WIRE.rightStartX + (WIRE.centerX + 15 - WIRE.rightStartX) * t;

  const sag = (1 - t) * 75;
  const ly = WIRE.meetY + sag;
  const ry = WIRE.meetY + sag;

  const dLeft = `M ${WIRE.leftStartX} ${WIRE.topY} C ${WIRE.leftStartX + 30} 120, ${lx - 110} ${ly + 55}, ${lx - 44} ${ly}`;
  const dRight = `M ${WIRE.rightStartX} ${WIRE.topY} C ${WIRE.rightStartX - 30} 120, ${rx + 110} ${ry + 55}, ${rx + 38} ${ry}`;

  wireShadowLeft.setAttribute("d", dLeft);
  wireShadowRight.setAttribute("d", dRight);

  wireLeftBase.setAttribute("d", dLeft);
  wireRightBase.setAttribute("d", dRight);

  wireLeftTexture.setAttribute("d", dLeft);
  wireRightTexture.setAttribute("d", dRight);

  wireLeftHighlight.setAttribute("d", dLeft);
  wireRightHighlight.setAttribute("d", dRight);

  const angleL = (1 - t) * -16;
  const angleR = (1 - t) * 16;

  plugLeftGroup.setAttribute("transform", `translate(${lx}, ${ly}) rotate(${angleL})`);
  plugRightGroup.setAttribute("transform", `translate(${rx}, ${ry}) rotate(${angleR})`);

  const connected = t >= 0.995;
  plugLeftGroup.classList.toggle("connected", connected);
  plugRightGroup.classList.toggle("connected", connected);
}

let sparkActive = false;

function updateSpark(active) {
  if (active && !sparkActive) {
    spark.classList.add("active");
    sparkActive = true;
  }

  if (!active && sparkActive) {
    spark.classList.remove("active");
    sparkActive = false;
  }
}


/* ------------------------------------------------------------
   Dynamic Magical Background Aurora Color Map
   ------------------------------------------------------------ */

const sceneAtmospheres = [
  { p: [255, 95, 150], s: [140, 60, 255], core: [255, 185, 100] },
  { p: [0, 210, 255],  s: [90, 240, 180], core: [255, 245, 160] },
  { p: [255, 160, 60], s: [255, 90, 110], core: [255, 210, 130] },
  { p: [50, 180, 255], s: [60, 240, 210], core: [255, 230, 170] },
  { p: [255, 70, 50],  s: [255, 190, 40], core: [255, 130, 70]  },
  { p: [180, 60, 255], s: [255, 60, 180], core: [140, 190, 255] },
  { p: [70, 100, 255], s: [130, 60, 255], core: [200, 225, 255] },
  { p: [255, 180, 80], s: [255, 60, 140], core: [255, 215, 130] }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getInterpolatedColors(sceneFloat) {
  const i = Math.floor(sceneFloat);
  const f = sceneFloat - i;
  const a = sceneAtmospheres[Math.max(0, Math.min(sceneAtmospheres.length - 1, i))];
  const b = sceneAtmospheres[Math.max(0, Math.min(sceneAtmospheres.length - 1, i + 1))];

  return {
    p: [
      Math.round(lerp(a.p[0], b.p[0], f)),
      Math.round(lerp(a.p[1], b.p[1], f)),
      Math.round(lerp(a.p[2], b.p[2], f))
    ],
    s: [
      Math.round(lerp(a.s[0], b.s[0], f)),
      Math.round(lerp(a.s[1], b.s[1], f)),
      Math.round(lerp(a.s[2], b.s[2], f))
    ],
    core: [
      Math.round(lerp(a.core[0], b.core[0], f)),
      Math.round(lerp(a.core[1], b.core[1], f)),
      Math.round(lerp(a.core[2], b.core[2], f))
    ]
  };
}

let ticking = false;
let bzztShown = false;

function renderTV() {
  ticking = false;

  const maxScroll = scrollContainer.offsetHeight - window.innerHeight;
  let progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progress = Math.max(0, Math.min(1, progress));

  /* INTRO */
  const introT = Math.min(1, progress / PH.introEnd);
  introTitle.style.opacity = String(1 - introT);
  introTitle.style.transform = `translate(-50%,-50%) translateY(${-introT * 30}px)`;

  /* WIRES */
  const wireT = Math.max(0, Math.min(1, progress / PH.wireEnd));
  updateWires(wireT);
  updateSpark(wireT >= 0.995);
  tvLed.classList.toggle("on", wireT >= 0.995);

  /* TV REVEAL */
  const revealT = Math.max(0, Math.min(1, (progress - PH.wireEnd) / (PH.tvRevealEnd - PH.wireEnd)));
  tvRig.style.opacity = revealT;
  tvRig.style.transform = `scale(${0.6 + 0.4 * revealT}) translateY(${40 * (1 - revealT)}px)`;
  timeline.style.opacity = revealT;

  /* CRT */
  const booting = progress >= PH.tvRevealEnd && progress < PH.bzztEnd;
  crtStatic.classList.toggle("active", booting);

  if (booting && !bzztShown) {
    crtBzzt.classList.remove("active");
    void crtBzzt.offsetWidth;
    crtBzzt.classList.add("active");
    bzztShown = true;
  }

  if (progress < PH.tvRevealEnd) {
    bzztShown = false;
    crtBzzt.classList.remove("active");
  }

  /* STORY PROGRESSION */
  let storyT = Math.max(0, Math.min(1, (progress - PH.storyStart) / (PH.storyEnd - PH.storyStart)));
  let sceneFloat = storyT * (SCENE_COUNT - 1);

  if (progress < PH.storyStart) sceneFloat = 0;
  if (progress >= PH.storyEnd) sceneFloat = SCENE_COUNT - 1;

  scenes.forEach(scene => {
    const index = Number(scene.dataset.scene);
    const distance = Math.abs(sceneFloat - index);
    const opacity = Math.max(0, 1 - distance * 1.35);

    scene.style.opacity = opacity;
    scene.style.zIndex = 10 - Math.round(distance);
  });

  /* CLOCK */
  clockDigits.textContent = sceneFloat > 0.4 ? "07:00" : "06:59";

  /* MAGICAL VIBRANT BACKGROUND UPDATE */
  const colors = getInterpolatedColors(sceneFloat);

  auroraPrimary.style.background = `
    radial-gradient(circle at 30% 40%, rgba(${colors.p[0]}, ${colors.p[1]}, ${colors.p[2]}, 0.55), transparent 60%)
  `;

  auroraSecondary.style.background = `
    radial-gradient(circle at 70% 60%, rgba(${colors.s[0]}, ${colors.s[1]}, ${colors.s[2]}, 0.6), transparent 60%)
  `;

  radiantCore.style.background = `
    radial-gradient(ellipse at center, rgba(${colors.core[0]}, ${colors.core[1]}, ${colors.core[2]}, 0.4) 0%, rgba(${colors.p[0]}, ${colors.p[1]}, ${colors.p[2]}, 0.22) 45%, transparent 75%)
  `;

  ambientGlow.style.background = `
    radial-gradient(circle at 50% 50%, rgba(${colors.core[0]}, ${colors.core[1]}, ${colors.core[2]}, 0.3), transparent 70%)
  `;

  /* KNOBS */
  const activeIndex = Math.round(sceneFloat);
  knobChannel.style.transform = `rotate(${activeIndex * 42}deg)`;
  knobVolume.style.transform = `rotate(${-activeIndex * 30}deg)`;

  /* TIMELINE */
  const fill = Math.max(0, Math.min(1, activeIndex / (SCENE_COUNT - 1))) * 100;
  timelineFill.style.setProperty("--fill", fill + "%");

  timelineItems.forEach(li => {
    const index = Number(li.dataset.index);
    li.classList.toggle("active", index === activeIndex && progress >= PH.storyStart);
  });
}

function requestTVRender() {
  if (!ticking) {
    requestAnimationFrame(renderTV);
    ticking = true;
  }
}

window.addEventListener("scroll", requestTVRender, { passive: true });
window.addEventListener("resize", requestTVRender);

function goToScene(index) {
  const maxScroll = scrollContainer.offsetHeight - window.innerHeight;
  const t = index / (SCENE_COUNT - 1);
  const progress = PH.storyStart + t * (PH.storyEnd - PH.storyStart);

  window.scrollTo({
    top: progress * maxScroll,
    behavior: "smooth"
  });
}

timelineItems.forEach(li => {
  li.querySelector("button").addEventListener("click", () => {
    goToScene(Number(li.dataset.index));
  });
});

document.getElementById("watchAgainBtn").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

renderTV();


/* ============================================================
   PART 2 — DYNAMIC REACTIVE CULINARY ART ENGINE
   ============================================================ */

const dbStep1 = document.getElementById("dbStep1");
const dbPanel = document.getElementById("dbPanel");
const baseLabel1 = document.getElementById("baseLabel1");
const baseLabel2 = document.getElementById("baseLabel2");
const baseChips1 = document.getElementById("baseChips1");
const baseChips2 = document.getElementById("baseChips2");
const toppingGrid = document.getElementById("toppingGrid");
const dbCastBtn = document.getElementById("dbCastBtn");
const stageShell = document.getElementById("stageShell");
const dbPlate = document.getElementById("dbPlate");
const dishArt = document.getElementById("dishArt");
const toppingsLayer = document.getElementById("toppings-layer");
const sparklesLayer = document.getElementById("sparklesLayer");
const steamLayer = document.getElementById("steamLayer");
const dbResult = document.getElementById("dbResult");
const receipt = document.getElementById("receipt");
const handRigL = document.getElementById("handRigL");
const handRigR = document.getElementById("handRigR");
const handLeft = document.getElementById("handLeft");
const handRight = document.getElementById("handRight");

let currentDish = null;
let baseSelections = {};
let toppingCounts = {};
let toppingIndex = 0;
let served = false;


/* ============================================================
   INLINE SVG HANDS
   ============================================================ */

function handSVG(id) {
  return `
  <svg viewBox="0 0 160 210" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skin-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f5d3b3"/>
        <stop offset="55%" stop-color="#e0aa82"/>
        <stop offset="100%" stop-color="#ab7752"/>
      </linearGradient>

      <linearGradient id="cuff-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdf9f0"/>
        <stop offset="100%" stop-color="#cfc3a7"/>
      </linearGradient>
    </defs>

    <rect x="46" y="148" width="72" height="62" rx="15" fill="url(#cuff-${id})"/>
    <rect x="46" y="174" width="72" height="9" fill="#e0b35e" opacity=".75"/>

    <g>
      <path d="M50 168 C40 160 36 140 40 118 C42 104 52 100 58 108 C63 115 62 138 60 158 C59 165 55 169 50 168Z" fill="url(#skin-${id})"/>
      <path d="M66 170 C55 160 52 128 55 100 C57 84 70 80 76 90 C80 98 79 130 76 160 C75 167 71 171 66 170Z" fill="url(#skin-${id})"/>
      <path d="M84 172 C74 163 71 132 75 104 C78 88 91 84 96 94 C100 102 98 132 95 162 C93 169 89 173 84 172Z" fill="url(#skin-${id})"/>
      <path d="M100 174 C92 166 90 146 93 124 C95 111 106 108 110 117 C113 125 112 148 109 164 C108 170 104 175 100 174Z" fill="url(#skin-${id})"/>
    </g>

    <path d="M40 168 C36 178 40 196 58 200 L110 200 C126 198 128 180 116 170 C112 190 106 195 96 194 C88 193 90 182 84 180 C78 178 78 190 68 190 C58 190 60 178 54 174 C48 170 44 166 40 168Z" fill="url(#skin-${id})"/>
    <path d="M42 176 C28 172 16 158 18 144 C19 136 28 133 33 140 C38 147 38 156 46 164 C50 168 48 175 42 176Z" fill="url(#skin-${id})"/>

    <g fill="none" stroke="#784a32" stroke-width="1.3" opacity=".35">
      <path d="M43 128q6 3 11 0"/>
      <path d="M59 118q7 4 13 0"/>
      <path d="M78 120q7 4 12 0"/>
      <path d="M95 136q6 3 11 0"/>
    </g>
  </svg>
  `;
}

handRigL.innerHTML = handSVG("left");
handRigR.innerHTML = handSVG("right");


/* ============================================================
   REACTIVE DISH ART GENERATOR (Updates on Base/Sauce Clicks)
   ============================================================ */

function renderDynamicDishArt() {
  if (!currentDish) return "";

  const sel1 = baseSelections[DISH_DATA[currentDish].bases[0].key];
  const sel2 = baseSelections[DISH_DATA[currentDish].bases[1].key];

  if (currentDish === "pizza") {
    // 1. Crust Styles
    let crustRadius = 104;
    let crustFillGrad = `
      <radialGradient id="dynCrust" cx="40%" cy="35%" r="68%">
        <stop offset="0%" stop-color="#ffdfa4"/>
        <stop offset="60%" stop-color="#e5a24b"/>
        <stop offset="90%" stop-color="#b86923"/>
        <stop offset="100%" stop-color="#733b0a"/>
      </radialGradient>
    `;
    let crustDetails = `
      <g fill="#421f06" opacity="0.65">
        <circle cx="35" cy="75" r="5.5"/><circle cx="58" cy="28" r="4.5"/><circle cx="165" cy="32" r="5.5"/>
        <circle cx="192" cy="100" r="4.5"/><circle cx="178" cy="165" r="5.5"/><circle cx="120" cy="198" r="5"/><circle cx="48" cy="165" r="5.5"/>
      </g>
    `;

    if (sel1 === "Neapolitan Thin") {
      crustRadius = 101;
      crustFillGrad = `
        <radialGradient id="dynCrust" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stop-color="#fedaa2"/>
          <stop offset="65%" stop-color="#cf7f29"/>
          <stop offset="92%" stop-color="#783404"/>
          <stop offset="100%" stop-color="#3b1700"/>
        </radialGradient>
      `;
      crustDetails = `
        <g fill="#210a00" opacity="0.85">
          <ellipse cx="40" cy="70" rx="7" ry="4" transform="rotate(25 40 70)"/>
          <ellipse cx="165" cy="40" rx="8" ry="4" transform="rotate(-30 165 40)"/>
          <circle cx="185" cy="120" r="6"/><circle cx="80" cy="22" r="5"/><circle cx="140" cy="195" r="6"/>
        </g>
      `;
    } else if (sel1 === "Cheesy Stuffed") {
      crustRadius = 108;
      crustFillGrad = `
        <radialGradient id="dynCrust" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fff5cc"/>
          <stop offset="50%" stop-color="#f5ba58"/>
          <stop offset="85%" stop-color="#d9822b"/>
          <stop offset="100%" stop-color="#8a470d"/>
        </radialGradient>
      `;
      crustDetails = `
        <circle cx="110" cy="110" r="102" fill="none" stroke="#fff8dc" stroke-width="6" opacity="0.45" stroke-dasharray="14 10"/>
        <circle cx="110" cy="110" r="99" fill="none" stroke="#e08e24" stroke-width="2" opacity="0.6"/>
      `;
    }

    // 2. Sauce Infusions
    let sauceFill = `
      <radialGradient id="dynSauce" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ff5938"/>
        <stop offset="60%" stop-color="#d92814"/>
        <stop offset="90%" stop-color="#991406"/>
        <stop offset="100%" stop-color="#590600"/>
      </radialGradient>
    `;
    let sauceAccents = `<circle cx="95" cy="70" r="8" fill="#ff7354" opacity="0.45"/><circle cx="140" cy="130" r="10" fill="#ff7354" opacity="0.45"/>`;

    if (sel2 === "White Truffle Cream") {
      sauceFill = `
        <radialGradient id="dynSauce" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#f7eedc"/>
          <stop offset="80%" stop-color="#ded0b4"/>
          <stop offset="100%" stop-color="#998663"/>
        </radialGradient>
      `;
      sauceAccents = `
        <g fill="#423520" opacity="0.4">
          <circle cx="95" cy="70" r="2.5"/><circle cx="130" cy="130" r="3"/><circle cx="80" cy="140" r="2"/><circle cx="140" cy="80" r="2.5"/><circle cx="110" cy="110" r="3"/>
        </g>
      `;
    } else if (sel2 === "Basil Pesto") {
      sauceFill = `
        <radialGradient id="dynSauce" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stop-color="#80c944"/>
          <stop offset="55%" stop-color="#4e991f"/>
          <stop offset="88%" stop-color="#2a660a"/>
          <stop offset="100%" stop-color="#143b02"/>
        </radialGradient>
      `;
      sauceAccents = `
        <g fill="#0e2601" opacity="0.5">
          <circle cx="90" cy="75" r="3"/><circle cx="135" cy="125" r="3.5"/><circle cx="100" cy="145" r="2.5"/><circle cx="75" cy="115" r="3"/>
        </g>
      `;
    }

    return `
    <svg viewBox="0 0 220 220">
      <defs>
        ${crustFillGrad}
        ${sauceFill}
        <radialGradient id="pzCheese" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="#fffce8"/>
          <stop offset="70%" stop-color="#f7dc79"/>
          <stop offset="100%" stop-color="#dfa938"/>
        </radialGradient>
      </defs>

      <!-- Crust Outer -->
      <circle cx="110" cy="110" r="${crustRadius}" fill="url(#dynCrust)"/>
      ${crustDetails}

      <!-- Sauce Bed -->
      <circle cx="110" cy="110" r="84" fill="url(#dynSauce)"/>
      ${sauceAccents}

      <!-- Molten Cheese Pools -->
      <path d="M48 80 Q110 42 172 80 Q152 118 172 148 Q110 182 48 148 Q68 115 48 80Z" fill="url(#pzCheese)" opacity="0.88"/>
      <circle cx="78" cy="78" r="18" fill="url(#pzCheese)"/>
      <circle cx="145" cy="95" r="16" fill="url(#pzCheese)"/>
      <circle cx="106" cy="155" r="18" fill="url(#pzCheese)"/>
      <circle cx="155" cy="155" r="13" fill="url(#pzCheese)"/>
      <circle cx="65" cy="135" r="14" fill="url(#pzCheese)"/>

      <ellipse cx="80" cy="75" rx="10" ry="5" fill="#fff" opacity="0.45" transform="rotate(-15 80 75)"/>
      <ellipse cx="145" cy="92" rx="8" ry="4" fill="#fff" opacity="0.45" transform="rotate(20 145 92)"/>
    </svg>
    `;
  }

  if (currentDish === "cake") {
    // 1. Sponge Types
    let spongeGrad = `
      <linearGradient id="dynSponge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a5332"/><stop offset="50%" stop-color="#69391e"/><stop offset="100%" stop-color="#3d1e0d"/>
      </linearGradient>
    `;
    if (sel1 === "Madagascar Vanilla") {
      spongeGrad = `
        <linearGradient id="dynSponge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff0bd"/><stop offset="50%" stop-color="#f0cb78"/><stop offset="100%" stop-color="#b88937"/>
        </linearGradient>
      `;
    } else if (sel1 === "Matcha Silk") {
      spongeGrad = `
        <linearGradient id="dynSponge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#9ecc5c"/><stop offset="50%" stop-color="#6e9c32"/><stop offset="100%" stop-color="#3f6613"/>
        </linearGradient>
      `;
    }

    // 2. Velvet Frostings
    let frostingGrad = `
      <linearGradient id="dynFrosting" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#fff8ed"/><stop offset="85%" stop-color="#edd9b6"/><stop offset="100%" stop-color="#d6bd94"/>
      </linearGradient>
    `;
    let dripColor = "#edd9b6";
    let sprinkles = `<circle cx="75" cy="75" r="2.5" fill="#f7b731"/><circle cx="105" cy="65" r="2" fill="#eb3b5a"/><circle cx="135" cy="72" r="2.5" fill="#20bf6b"/><circle cx="150" cy="80" r="2" fill="#f7b731"/>`;

    if (sel2 === "Salted Caramel") {
      frostingGrad = `
        <linearGradient id="dynFrosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd580"/><stop offset="40%" stop-color="#f5a331"/><stop offset="85%" stop-color="#c46808"/><stop offset="100%" stop-color="#803d00"/>
        </linearGradient>
      `;
      dripColor = "#b85f06";
      sprinkles = `<circle cx="75" cy="75" r="2.5" fill="#fff" opacity="0.8"/><circle cx="105" cy="65" r="2.5" fill="#fff" opacity="0.8"/><circle cx="135" cy="72" r="2.5" fill="#fff" opacity="0.8"/>`;
    } else if (sel2 === "Earl Grey Ganache") {
      frostingGrad = `
        <linearGradient id="dynFrosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d8c5e6"/><stop offset="40%" stop-color="#9a81b3"/><stop offset="85%" stop-color="#644a80"/><stop offset="100%" stop-color="#3d2854"/>
        </linearGradient>
      `;
      dripColor = "#593e73";
      sprinkles = `<circle cx="75" cy="75" r="2.5" fill="#ffd700"/><circle cx="105" cy="65" r="2.5" fill="#ffd700"/><circle cx="135" cy="72" r="2.5" fill="#ffd700"/>`;
    }

    return `
    <svg viewBox="0 0 220 220">
      <defs>
        ${spongeGrad}
        ${frostingGrad}
        <radialGradient id="cakePlate" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fcf6e8"/><stop offset="70%" stop-color="#dfcfb0"/><stop offset="100%" stop-color="#8a7958"/>
        </radialGradient>
      </defs>

      <!-- Pedestal Stand -->
      <ellipse cx="110" cy="195" rx="80" ry="11" fill="#000" opacity="0.35"/>
      <ellipse cx="110" cy="184" rx="70" ry="12" fill="url(#cakePlate)"/>
      <path d="M75 183 Q110 168 145 183 L135 200 Q110 210 85 200Z" fill="#c4b290"/>

      <!-- Bottom Sponge Tier -->
      <rect x="42" y="122" width="136" height="60" rx="12" fill="url(#dynSponge)"/>
      <path d="M42 122 Q110 104 178 122 Q165 136 178 148 Q110 164 42 148 Q55 136 42 122Z" fill="url(#dynFrosting)"/>

      <!-- Top Sponge Tier -->
      <rect x="56" y="82" width="108" height="46" rx="10" fill="url(#dynSponge)"/>
      <path d="M52 84 Q110 56 168 84 Q155 100 168 112 Q110 128 52 112 Q65 100 52 84Z" fill="url(#dynFrosting)"/>

      <!-- Glossy Drips -->
      <path d="M72 94 Q76 114 72 120 M110 84 Q114 107 110 122 M148 94 Q152 112 148 119" stroke="${dripColor}" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${sprinkles}
    </svg>
    `;
  }

  if (currentDish === "noodles") {
    // 1. Broth Bases
    let brothGrad = `
      <radialGradient id="dynBroth" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffe28a"/><stop offset="50%" stop-color="#e5a83b"/><stop offset="85%" stop-color="#aa6616"/><stop offset="100%" stop-color="#593005"/>
      </radialGradient>
    `;
    if (sel1 === "Smoky Shoyu") {
      brothGrad = `
        <radialGradient id="dynBroth" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#f08b4f"/><stop offset="50%" stop-color="#b84614"/><stop offset="85%" stop-color="#6e1f04"/><stop offset="100%" stop-color="#380a00"/>
        </radialGradient>
      `;
    } else if (sel1 === "Coconut Curry") {
      brothGrad = `
        <radialGradient id="dynBroth" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#ffea75"/><stop offset="50%" stop-color="#ffb81c"/><stop offset="85%" stop-color="#cc7700"/><stop offset="100%" stop-color="#804400"/>
        </radialGradient>
      `;
    }

    // 2. Noodle Styles
    let noodleStroke = "#fff9eb";
    let noodlePaths = `
      <g fill="none" stroke="${noodleStroke}" stroke-width="5" stroke-linecap="round">
        <path d="M42 102 Q64 72 86 102 T132 102 T174 102"/>
        <path d="M44 128 Q66 98 90 128 T136 128 T174 120"/>
        <path d="M60 80 Q80 54 100 80 T142 80"/>
        <path d="M72 144 Q92 116 114 144 T156 138"/>
      </g>
    `;

    if (sel2 === "Silky Udon") {
      noodleStroke = "#ffffff";
      noodlePaths = `
        <g fill="none" stroke="${noodleStroke}" stroke-width="8" stroke-linecap="round">
          <path d="M42 98 Q70 65 98 98 T158 98"/>
          <path d="M48 126 Q80 95 110 126 T170 120"/>
          <path d="M68 80 Q95 56 125 80"/>
          <path d="M74 146 Q106 122 138 146"/>
        </g>
      `;
    } else if (sel2 === "Egg Ribbons") {
      noodleStroke = "#ffd94a";
      noodlePaths = `
        <g fill="none" stroke="${noodleStroke}" stroke-width="6.5" stroke-linecap="round">
          <path d="M38 100 C60 70, 75 120, 100 95 C125 70, 145 120, 175 100"/>
          <path d="M45 125 C70 95, 85 140, 110 115 C135 90, 150 140, 174 122"/>
          <path d="M55 78 C80 55, 95 95, 125 75 C145 60, 155 85, 168 80"/>
        </g>
      `;
    }

    return `
    <svg viewBox="0 0 220 220">
      <defs>
        ${brothGrad}
        <radialGradient id="ramenBowl" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#fffcf5"/><stop offset="60%" stop-color="#e8dac1"/><stop offset="100%" stop-color="#8f7d5e"/>
        </radialGradient>
      </defs>

      <!-- Bowl -->
      <ellipse cx="110" cy="195" rx="80" ry="10" fill="#000" opacity="0.35"/>
      <ellipse cx="110" cy="120" rx="104" ry="86" fill="url(#ramenBowl)"/>

      <!-- Broth -->
      <ellipse cx="110" cy="102" rx="84" ry="68" fill="url(#dynBroth)"/>
      <ellipse cx="82" cy="72" rx="36" ry="14" fill="white" opacity="0.25"/>

      <!-- Noodles -->
      ${noodlePaths}
    </svg>
    `;
  }

  return "";
}


/* ============================================================
   DELIGHTFUL TOPPING ICONS & MARKUP
   ============================================================ */

function icon(svg) {
  return `
    <svg viewBox="0 0 60 60">
      ${svg}
    </svg>
  `;
}

const TOPPINGS = {
  pizza: [
    {
      id: "pepperoni",
      label: "Spiced Pepperoni",
      max: 12,
      icon: icon(`
        <circle cx="30" cy="30" r="23" fill="#c4331e" stroke="#781708" stroke-width="1.5"/>
        <circle cx="23" cy="23" r="3.5" fill="#7a1608"/>
        <circle cx="37" cy="35" r="3" fill="#7a1608"/>
        <circle cx="26" cy="37" r="2.5" fill="#7a1608"/>
        <ellipse cx="28" cy="24" rx="4" ry="2" fill="#fff" opacity="0.3" transform="rotate(-20 28 24)"/>
      `)
    },
    {
      id: "basil",
      label: "Fresh Sweet Basil",
      max: 12,
      icon: icon(`
        <path d="M30 5 C50 15 51 38 30 56 C9 38 10 15 30 5Z" fill="#388e3c"/>
        <path d="M30 9 L30 52" stroke="#1b5e20" stroke-width="2.5"/>
        <path d="M30 22 Q40 18 44 26 M30 34 Q20 30 16 38" stroke="#1b5e20" stroke-width="1.5" fill="none"/>
      `)
    },
    {
      id: "mushroom",
      label: "Charred Truffle Cap",
      max: 10,
      icon: icon(`
        <path d="M10 32 C10 14 50 14 50 32 C50 38 40 38 30 38 C20 38 10 38 10 32Z" fill="#825c38"/>
        <rect x="24" y="35" width="12" height="18" rx="4" fill="#eddcc4"/>
        <ellipse cx="26" cy="22" rx="6" ry="3" fill="#fff" opacity="0.25"/>
      `)
    },
    {
      id: "olive",
      label: "Kalamata Olives",
      max: 14,
      icon: icon(`
        <ellipse cx="30" cy="30" rx="16" ry="19" fill="#291a27"/>
        <ellipse cx="30" cy="30" rx="6" ry="7" fill="#080407"/>
        <ellipse cx="26" cy="23" rx="4" ry="2" fill="#fff" opacity="0.3" transform="rotate(-30 26 23)"/>
      `)
    },
    {
      id: "mozzarella",
      label: "Mozzarella Pearls",
      max: 12,
      icon: icon(`
        <circle cx="23" cy="26" r="13" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
        <circle cx="38" cy="36" r="11" fill="#fffde8"/>
        <circle cx="20" cy="23" r="3" fill="#fff" opacity="0.7"/>
      `)
    }
  ],

  cake: [
    {
      id: "berries",
      label: "Wild Glazed Berries",
      max: 14,
      icon: icon(`
        <circle cx="30" cy="30" r="18" fill="#ba1841"/>
        <circle cx="23" cy="23" r="2.5" fill="#4a0515"/>
        <circle cx="37" cy="25" r="2.5" fill="#4a0515"/>
        <circle cx="31" cy="38" r="2.5" fill="#4a0515"/>
        <ellipse cx="26" cy="22" rx="4" ry="2.5" fill="#fff" opacity="0.55"/>
      `)
    },
    {
      id: "gold",
      label: "24k Edible Gold Leaf",
      max: 8,
      icon: icon(`
        <path d="M10 36 L27 10 L52 22 L36 52 Z" fill="#ffd700"/>
        <path d="M15 34 L30 16" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="28" cy="28" r="3" fill="#fff" opacity="0.8"/>
      `)
    },
    {
      id: "cocoa",
      label: "Belgian Cocoa Curls",
      max: 12,
      icon: icon(`
        <path d="M10 46 C10 24 22 8 36 10 C32 22 34 40 50 45 C36 53 17 53 10 46Z" fill="#422110"/>
        <path d="M16 38 C22 26 30 20 34 16" stroke="#63371f" stroke-width="2" fill="none"/>
      `)
    },
    {
      id: "pistachio",
      label: "Pistachio Praline",
      max: 12,
      icon: icon(`
        <circle cx="20" cy="25" r="6" fill="#7cb342"/>
        <circle cx="36" cy="20" r="5" fill="#9ccc65"/>
        <circle cx="30" cy="39" r="6" fill="#558b2f"/>
        <circle cx="44" cy="35" r="5" fill="#8bc34a"/>
      `)
    }
  ],

  noodles: [
    {
      id: "chashu",
      label: "Seared Chashu Pork",
      max: 8,
      icon: icon(`
        <ellipse cx="30" cy="30" rx="22" ry="16" fill="#c46a39"/>
        <path d="M12 26 Q30 16 48 26 M12 34 Q30 44 48 34" fill="none" stroke="#5c260a" stroke-width="2.5"/>
        <ellipse cx="26" cy="24" rx="5" ry="2" fill="#fff" opacity="0.3"/>
      `)
    },
    {
      id: "egg",
      label: "Ramen Ajitsuke Egg",
      max: 6,
      icon: icon(`
        <path d="M8 32 A22 22 0 0 1 52 32 Z" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
        <path d="M18 32 A12 12 0 0 1 42 32 Z" fill="#ff9100"/>
        <circle cx="27" cy="26" r="3" fill="#fff" opacity="0.6"/>
      `)
    },
    {
      id: "nori",
      label: "Crisp Nori Sheet",
      max: 8,
      icon: icon(`
        <rect x="12" y="12" width="36" height="36" rx="4" fill="#142618"/>
        <path d="M12 20 H48 M12 32 H48" stroke="#2b4731" stroke-width="3"/>
      `)
    },
    {
      id: "scallion",
      label: "Charred Scallions",
      max: 12,
      icon: icon(`
        <circle cx="18" cy="22" r="7" fill="none" stroke="#689f38" stroke-width="3.5"/>
        <circle cx="36" cy="30" r="7" fill="none" stroke="#8bc34a" stroke-width="3.5"/>
        <circle cx="26" cy="44" r="6" fill="none" stroke="#4b7724" stroke-width="3.5"/>
      `)
    }
  ]
};


/* ============================================================
   DISH DATA
   ============================================================ */

const DISH_DATA = {
  pizza: {
    label: "Handcrafted Hearth Pizza",
    bases: [
      {
        key: "crust",
        label: "Crust Style",
        options: ["Classic Sourdough", "Neapolitan Thin", "Cheesy Stuffed"]
      },
      {
        key: "sauce",
        label: "Sauce Infusion",
        options: ["San Marzano Tomato", "White Truffle Cream", "Basil Pesto"]
      }
    ],
    toppings: TOPPINGS.pizza
  },

  cake: {
    label: "Celebration Gateau Cake",
    bases: [
      {
        key: "sponge",
        label: "Sponge Cake",
        options: ["Dark Chocolate", "Madagascar Vanilla", "Matcha Silk"]
      },
      {
        key: "frosting",
        label: "Velvet Frosting",
        options: ["Swiss Buttercream", "Salted Caramel", "Earl Grey Ganache"]
      }
    ],
    toppings: TOPPINGS.cake
  },

  noodles: {
    label: "Artisanal Comfort Noodles",
    bases: [
      {
        key: "broth",
        label: "Broth Base",
        options: ["Rich Tonkotsu", "Smoky Shoyu", "Coconut Curry"]
      },
      {
        key: "noodle",
        label: "Noodle Style",
        options: ["Hand-Pulled Ramen", "Silky Udon", "Egg Ribbons"]
      }
    ],
    toppings: TOPPINGS.noodles
  }
};


/* ============================================================
   DISH SELECTION & FLOW
   ============================================================ */

dbStep1.querySelectorAll(".dish-card").forEach(card => {
  card.addEventListener("click", () => {
    selectDish(card.dataset.dish, card);
  });
});

function selectDish(type, card) {
  currentDish = type;
  baseSelections = {
    [DISH_DATA[type].bases[0].key]: DISH_DATA[type].bases[0].options[0],
    [DISH_DATA[type].bases[1].key]: DISH_DATA[type].bases[1].options[0]
  };
  toppingCounts = {};
  toppingIndex = 0;
  served = false;

  dbStep1.querySelectorAll(".dish-card").forEach(c => {
    c.classList.toggle("selected", c === card);
  });

  dishArt.innerHTML = renderDynamicDishArt();
  dbPlate.style.opacity = "1";
  dbPlate.style.visibility = "visible";
  dbPlate.classList.remove("magic-complete");
  dishArt.classList.remove("magic-complete");

  toppingsLayer.innerHTML = "";
  sparklesLayer.innerHTML = "";
  steamLayer.style.opacity = "0.8";

  renderPanel();
  dbPanel.hidden = false;
  dbCastBtn.hidden = false;
  dbResult.hidden = true;

  updateCastButton();

  setTimeout(() => {
    document.getElementById("stageShell").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 50);
}


/* ============================================================
   PANEL BUILDER
   ============================================================ */

function renderPanel() {
  const data = DISH_DATA[currentDish];

  baseLabel1.textContent = data.bases[0].label;
  baseLabel2.textContent = data.bases[1].label;

  buildBaseOptions(baseChips1, data.bases[0]);
  buildBaseOptions(baseChips2, data.bases[1]);
  buildToppingButtons(data.toppings);
}

function buildBaseOptions(container, group) {
  container.innerHTML = "";

  group.options.forEach((option, idx) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "db-chip";
    button.textContent = option;

    if (baseSelections[group.key] === option) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      container.querySelectorAll(".db-chip").forEach(b => b.classList.remove("selected"));
      button.classList.add("selected");
      baseSelections[group.key] = option;
      
      // Instantly trigger re-render of illustration with new ingredients
      dishArt.innerHTML = renderDynamicDishArt();
      updateCastButton();
    });

    container.appendChild(button);
  });
}

function buildToppingButtons(toppings) {
  toppingGrid.innerHTML = "";

  toppings.forEach(topping => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "topping-btn";
    button.innerHTML = `
      <span class="t-icon">${topping.icon}</span>
      <span>${topping.label}</span>
      <span class="t-count" data-count="${topping.id}">0</span>
    `;

    button.addEventListener("click", () => {
      addTopping(topping, button);
    });

    toppingGrid.appendChild(button);
  });
}


/* ============================================================
   MAGIC BUTTON STATE
   ============================================================ */

function updateCastButton() {
  if (!currentDish) {
    dbCastBtn.disabled = true;
    return;
  }

  const data = DISH_DATA[currentDish];
  const ready = data.bases.every(base => Boolean(baseSelections[base.key]));
  dbCastBtn.disabled = !ready;
}


/* ============================================================
   TOPPING POSITIONING
   ============================================================ */

const TOPPING_RADIUS = {
  pizza: { min: 70, max: 135 },
  cake: { min: 50, max: 105 },
  noodles: { min: 65, max: 120 }
};

function getToppingPosition(index) {
  const bounds = TOPPING_RADIUS[currentDish];
  const goldenAngle = 137.50776;
  const angle = index * goldenAngle * Math.PI / 180;
  const radius = bounds.min + ((index % 9) / 8) * (bounds.max - bounds.min);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    rotation: (index * 47) % 40 - 20
  };
}


/* ============================================================
   ADD TOPPING
   ============================================================ */

function addTopping(topping, button) {
  if (served) return;

  const current = toppingCounts[topping.id] || 0;
  if (current >= topping.max) {
    button.classList.add("maxed");
    return;
  }

  toppingCounts[topping.id] = current + 1;
  const countElement = button.querySelector(".t-count");
  countElement.textContent = toppingCounts[topping.id];

  if (toppingCounts[topping.id] >= topping.max) {
    button.classList.add("maxed");
  }

  const position = getToppingPosition(toppingIndex);
  spawnTopping(topping.icon, position);

  animateHand(position.x < 0 ? "left" : "right");
  toppingIndex++;
}

function spawnTopping(markup, position) {
  const element = document.createElement("div");
  element.className = "topping-item";
  element.innerHTML = markup;

  element.style.setProperty("--offset-x", position.x + "px");
  element.style.setProperty("--offset-y", position.y + "px");
  element.style.setProperty("--rotation", position.rotation + "deg");

  toppingsLayer.appendChild(element);
}


/* ============================================================
   HAND GESTURE
   ============================================================ */

function animateHand(side) {
  const rig = side === "left" ? handRigL : handRigR;
  const anchor = side === "left" ? handLeft : handRight;

  rig.classList.add("magic");
  anchor.style.transform = side === "left" ? "translateX(24px)" : "translateX(-24px)";

  setTimeout(() => {
    rig.classList.remove("magic");
    anchor.style.transform = "";
  }, 500);
}


/* ============================================================
   MAGIC REVEAL
   ============================================================ */

dbCastBtn.addEventListener("click", castMagic);

function castMagic() {
  if (dbCastBtn.disabled || served) return;

  served = true;
  dbCastBtn.disabled = true;

  dbPlate.style.opacity = "1";
  dbPlate.style.visibility = "visible";
  dishArt.style.opacity = "1";
  dishArt.style.visibility = "visible";

  handRigL.classList.add("magic");
  handRigR.classList.add("magic");
  handLeft.style.transform = "translateX(35px)";
  handRight.style.transform = "translateX(-35px)";

  steamLayer.style.opacity = "1";

  setTimeout(createMagicSparkles, 250);

  setTimeout(() => {
    dbPlate.classList.add("magic-complete");
    dishArt.classList.add("magic-complete");
  }, 650);

  setTimeout(() => {
    handRigL.classList.remove("magic");
    handRigR.classList.remove("magic");
    handLeft.style.transform = "";
    handRight.style.transform = "";
  }, 1200);

  setTimeout(() => {
    showReceipt();
  }, 1800);
}


/* ============================================================
   MAGIC SPARKLES
   ============================================================ */

function createMagicSparkles() {
  for (let i = 0; i < 26; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = random(25, 75) + "%";
    sparkle.style.top = random(20, 80) + "%";
    sparkle.style.animationDelay = random(0, 0.7) + "s";

    sparkle.innerHTML = `
      <svg viewBox="0 0 20 20">
        <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z"/>
      </svg>
    `;

    sparklesLayer.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 1800);
  }
}


/* ============================================================
   RECEIPT
   ============================================================ */

function showReceipt() {
  const data = DISH_DATA[currentDish];
  const lines = [];

  data.bases.forEach(base => {
    lines.push({
      qty: "1×",
      name: baseSelections[base.key]
    });
  });

  data.toppings.forEach(topping => {
    const count = toppingCounts[topping.id] || 0;
    if (count > 0) {
      lines.push({
        qty: count + "×",
        name: topping.label
      });
    }
  });

  receipt.innerHTML = `
    <div class="receipt-head">
      <p class="receipt-title">${data.label}</p>
      <p style="margin: 0.3rem 0; font-size: 0.75rem; letter-spacing: 0.1em;">Confectioned with Culinary Radiance</p>
    </div>

    <hr class="receipt-divider">

    ${lines.map(line => `
      <div class="receipt-line">
        <span>${line.qty}</span>
        <span>${line.name}</span>
      </div>
    `).join("")}

    <hr class="receipt-divider">

    <p class="receipt-foot">
      A PERFECT DAY · BON APPÉTIT
    </p>
  `;

  dbResult.hidden = false;
  dbResult.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


/* ============================================================
   MAKE ANOTHER DISH
   ============================================================ */

document.getElementById("dbAnotherBtn").addEventListener("click", () => {
  currentDish = null;
  baseSelections = {};
  toppingCounts = {};
  toppingIndex = 0;
  served = false;

  dbStep1.querySelectorAll(".dish-card").forEach(card => {
    card.classList.remove("selected");
  });

  dbPanel.hidden = true;
  dbCastBtn.hidden = true;
  dbCastBtn.disabled = true;
  dbResult.hidden = true;

  dishArt.innerHTML = "";
  toppingsLayer.innerHTML = "";
  sparklesLayer.innerHTML = "";

  dbPlate.classList.remove("magic-complete");
  dishArt.classList.remove("magic-complete");
  steamLayer.style.opacity = "0";

  window.scrollTo({
    top: document.getElementById("dishBuilder").offsetTop,
    behavior: "smooth"
  });
});


/* ============================================================
   REVEAL TEXT OBSERVER
   ============================================================ */

const revealElements = document.querySelectorAll(".reveal-el");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .15 });

  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("in-view"));
}