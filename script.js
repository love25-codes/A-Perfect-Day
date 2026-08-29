"use strict";

/* ============================================================
   PART 1
   TV STORY
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

const scrollContainer =
  document.getElementById("scrollContainer");

const introTitle =
  document.getElementById("introTitle");

const ambientGlow =
  document.getElementById("ambientGlow");

const wireLeft =
  document.getElementById("wireLeft");

const wireRight =
  document.getElementById("wireRight");

const plugLeft =
  document.getElementById("plugLeft");

const plugRight =
  document.getElementById("plugRight");

const spark =
  document.getElementById("spark");

const tvRig =
  document.getElementById("tvRig");

const tvLed =
  document.getElementById("tvLed");

const crtStatic =
  document.getElementById("crtStatic");

const crtBzzt =
  document.getElementById("crtBzzt");

const knobChannel =
  document.getElementById("knobChannel");

const knobVolume =
  document.getElementById("knobVolume");

const timeline =
  document.getElementById("timeline");

const timelineFill =
  document.getElementById("timelineFill");

const timelineItems =
  document.querySelectorAll("#timelineList li");

const scenes =
  document.querySelectorAll(".scene");

const clockDigits =
  document.getElementById("clockDigits");


/* ------------------------------------------------------------
   Decorative particles
   ------------------------------------------------------------ */

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function scatter(container, amount, factory) {

  if (!container) return;

  const fragment =
    document.createDocumentFragment();

  for (let i = 0; i < amount; i++) {
    fragment.appendChild(factory(i));
  }

  container.appendChild(fragment);
}


scatter(
  document.getElementById("dustMotes"),
  25,
  () => {

    const el =
      document.createElement("span");

    el.style.left =
      random(5,95) + "%";

    el.style.top =
      random(10,70) + "%";

    el.style.animationDelay =
      random(0,5) + "s";

    return el;
  }
);


scatter(
  document.getElementById("cloudsLayer"),
  6,
  () => {

    const el =
      document.createElement("span");

    el.style.top =
      random(5,45) + "%";

    el.style.width =
      random(60,140) + "px";

    el.style.height =
      random(25,55) + "px";

    el.style.animationDuration =
      random(30,55) + "s";

    return el;
  }
);


scatter(
  document.getElementById("birdsLayer"),
  5,
  () => {

    const el =
      document.createElement("span");

    el.style.top =
      random(10,40) + "%";

    el.style.left =
      random(0,80) + "%";

    el.style.animationDelay =
      random(0,8) + "s";

    return el;
  }
);


scatter(
  document.getElementById("starsLayer"),
  70,
  () => {

    const el =
      document.createElement("span");

    el.style.left =
      random(0,100) + "%";

    el.style.top =
      random(0,80) + "%";

    el.style.animationDelay =
      random(0,4) + "s";

    return el;
  }
);


scatter(
  document.getElementById("notesLayer"),
  8,
  () => {

    const el =
      document.createElement("span");

    el.textContent =
      Math.random() > .5
        ? "♪"
        : "♫";

    el.style.left =
      random(35,70) + "%";

    el.style.bottom =
      random(20,40) + "%";

    el.style.animationDelay =
      random(0,4) + "s";

    return el;
  }
);


/* ------------------------------------------------------------
   Wires
   ------------------------------------------------------------ */

const WIRE = {
  leftStartX: 250,
  rightStartX: 750,
  centerX: 500,
  meetY: 300,
  topY: -20
};

function updateWires(t) {

  const lx =
    WIRE.leftStartX +
    (WIRE.centerX - 30 - WIRE.leftStartX) * t;

  const rx =
    WIRE.rightStartX +
    (WIRE.centerX + 30 - WIRE.rightStartX) * t;

  const ly =
    WIRE.meetY - 20 * t;

  const ry =
    WIRE.meetY - 20 * t;

  wireLeft.setAttribute(
    "d",
    `
      M ${WIRE.leftStartX} ${WIRE.topY}
      C ${WIRE.leftStartX} 150,
        ${lx - 40} ${ly - 60},
        ${lx} ${ly}
    `
  );

  wireRight.setAttribute(
    "d",
    `
      M ${WIRE.rightStartX} ${WIRE.topY}
      C ${WIRE.rightStartX} 150,
        ${rx + 40} ${ry - 60},
        ${rx} ${ry}
    `
  );

  plugLeft.setAttribute("cx", lx);
  plugLeft.setAttribute("cy", ly);

  plugRight.setAttribute("cx", rx);
  plugRight.setAttribute("cy", ry);

  const connected = t >= .995;

  plugLeft.style.fill =
    connected
      ? "#ffe6ad"
      : "#2a2118";

  plugRight.style.fill =
    connected
      ? "#ffe6ad"
      : "#2a2118";

  plugLeft.style.filter =
    connected
      ? "drop-shadow(0 0 8px #ffcf6b)"
      : "none";

  plugRight.style.filter =
    connected
      ? "drop-shadow(0 0 8px #ffcf6b)"
      : "none";
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
   TV rendering
   ------------------------------------------------------------ */

/* Brighter, more saturated ambient colors matching the new sky palette */
const glowColors = [
  [147,65,127],
  [47,158,224],
  [138,74,46],
  [47,143,224],
  [194,46,110],
  [88,44,110],
  [26,33,96],
  [8,8,16]
];

function lerp(a,b,t) {
  return a + (b-a) * t;
}

function getGlow(sceneFloat) {

  const i =
    Math.floor(sceneFloat);

  const f =
    sceneFloat - i;

  const a =
    glowColors[
      Math.max(
        0,
        Math.min(
          glowColors.length-1,
          i
        )
      )
    ];

  const b =
    glowColors[
      Math.max(
        0,
        Math.min(
          glowColors.length-1,
          i+1
        )
      )
    ];

  return [
    Math.round(lerp(a[0],b[0],f)),
    Math.round(lerp(a[1],b[1],f)),
    Math.round(lerp(a[2],b[2],f))
  ];
}


let ticking = false;
let bzztShown = false;

function renderTV() {

  ticking = false;

  const maxScroll =
    scrollContainer.offsetHeight -
    window.innerHeight;

  let progress =
    maxScroll > 0
      ? window.scrollY / maxScroll
      : 0;

  progress =
    Math.max(
      0,
      Math.min(1,progress)
    );


  /* INTRO */

  const introT =
    Math.min(
      1,
      progress / PH.introEnd
    );

  introTitle.style.opacity =
    String(1-introT);

  introTitle.style.transform =
    `
      translate(-50%,-50%)
      translateY(${-introT*30}px)
    `;


  /* WIRES */

  const wireT =
    Math.max(
      0,
      Math.min(
        1,
        progress / PH.wireEnd
      )
    );

  updateWires(wireT);

  updateSpark(
    wireT >= .995
  );

  tvLed.classList.toggle(
    "on",
    wireT >= .995
  );


  /* TV REVEAL */

  const revealT =
    Math.max(
      0,
      Math.min(
        1,
        (progress-PH.wireEnd) /
        (PH.tvRevealEnd-PH.wireEnd)
      )
    );

  tvRig.style.opacity =
    revealT;

  tvRig.style.transform =
    `
      scale(${.6+.4*revealT})
      translateY(${40*(1-revealT)}px)
    `;

  timeline.style.opacity =
    revealT;


  /* CRT */

  const booting =
    progress >= PH.tvRevealEnd &&
    progress < PH.bzztEnd;

  crtStatic.classList.toggle(
    "active",
    booting
  );

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


  /* STORY */

  let storyT =
    Math.max(
      0,
      Math.min(
        1,
        (progress-PH.storyStart) /
        (PH.storyEnd-PH.storyStart)
      )
    );

  let sceneFloat =
    storyT *
    (SCENE_COUNT-1);

  if (progress < PH.storyStart)
    sceneFloat = 0;

  if (progress >= PH.storyEnd)
    sceneFloat = SCENE_COUNT-1;


  scenes.forEach(scene => {

    const index =
      Number(
        scene.dataset.scene
      );

    const distance =
      Math.abs(
        sceneFloat-index
      );

    const opacity =
      Math.max(
        0,
        1-distance*1.35
      );

    scene.style.opacity =
      opacity;

    scene.style.zIndex =
      10-Math.round(distance);
  });


  /* CLOCK */

  clockDigits.textContent =
    sceneFloat > .4
      ? "07:00"
      : "06:59";


  /* AMBIENT */

  const c =
    getGlow(sceneFloat);

  ambientGlow.style.background =
    `
      radial-gradient(
        circle at 50% 55%,
        rgba(
          ${c[0]},
          ${c[1]},
          ${c[2]},
          .5
        ),
        transparent 62%
      )
    `;


  /* KNOBS */

  const activeIndex =
    Math.round(sceneFloat);

  knobChannel.style.transform =
    `rotate(${activeIndex*42}deg)`;

  knobVolume.style.transform =
    `rotate(${-activeIndex*30}deg)`;


  /* TIMELINE */

  const fill =
    Math.max(
      0,
      Math.min(
        1,
        activeIndex/(SCENE_COUNT-1)
      )
    ) * 100;

  timelineFill.style.setProperty(
    "--fill",
    fill + "%"
  );

  timelineItems.forEach(li => {

    const index =
      Number(li.dataset.index);

    li.classList.toggle(
      "active",
      index === activeIndex &&
      progress >= PH.storyStart
    );
  });
}


function requestTVRender() {

  if (!ticking) {

    requestAnimationFrame(
      renderTV
    );

    ticking = true;
  }
}

window.addEventListener(
  "scroll",
  requestTVRender,
  { passive:true }
);

window.addEventListener(
  "resize",
  requestTVRender
);


/* ------------------------------------------------------------
   Timeline navigation
   ------------------------------------------------------------ */

function goToScene(index) {

  const maxScroll =
    scrollContainer.offsetHeight -
    window.innerHeight;

  const t =
    index /
    (SCENE_COUNT-1);

  const progress =
    PH.storyStart +
    t *
    (PH.storyEnd-PH.storyStart);

  window.scrollTo({
    top: progress*maxScroll,
    behavior: "smooth"
  });
}


timelineItems.forEach(li => {

  li.querySelector("button")
    .addEventListener(
      "click",
      () => {
        goToScene(
          Number(li.dataset.index)
        );
      }
    );
});


document
  .getElementById("watchAgainBtn")
  .addEventListener(
    "click",
    () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );


renderTV();


/* ============================================================
   PART 2
   CULINARY BUILDER
   ============================================================ */

const dbStep1 =
  document.getElementById("dbStep1");

const dbPanel =
  document.getElementById("dbPanel");

const baseLabel1 =
  document.getElementById("baseLabel1");

const baseLabel2 =
  document.getElementById("baseLabel2");

const baseChips1 =
  document.getElementById("baseChips1");

const baseChips2 =
  document.getElementById("baseChips2");

const toppingGrid =
  document.getElementById("toppingGrid");

const dbCastBtn =
  document.getElementById("dbCastBtn");

const stageShell =
  document.getElementById("stageShell");

const dbPlate =
  document.getElementById("dbPlate");

const dishArt =
  document.getElementById("dishArt");

const toppingsLayer =
  document.getElementById("toppings-layer");

const sparklesLayer =
  document.getElementById("sparklesLayer");

const steamLayer =
  document.getElementById("steamLayer");

const dbResult =
  document.getElementById("dbResult");

const receipt =
  document.getElementById("receipt");

const handRigL =
  document.getElementById("handRigL");

const handRigR =
  document.getElementById("handRigR");

const handLeft =
  document.getElementById("handLeft");

const handRight =
  document.getElementById("handRight");


let currentDish = null;

let baseSelections = {};

let toppingCounts = {};

let toppingIndex = 0;

let served = false;

/* Warm, energetic colors the magic sparkles cycle through */
const SPARKLE_COLORS = [
  "#ffb636",
  "#ff3f9e",
  "#33e6d6",
  "#ffe066",
  "#c6ff4d"
];


/* ============================================================
   INLINE SVG HANDS
   ============================================================ */

function handSVG(id) {

  return `
  <svg
    viewBox="0 0 160 210"
    xmlns="http://www.w3.org/2000/svg">

    <defs>

      <linearGradient
        id="skin-${id}"
        x1="0"
        y1="0"
        x2="1"
        y2="1">

        <stop
          offset="0%"
          stop-color="#f6d2a6"/>

        <stop
          offset="55%"
          stop-color="#e2ab7c"/>

        <stop
          offset="100%"
          stop-color="#b17d52"/>

      </linearGradient>

      <linearGradient
        id="cuff-${id}"
        x1="0"
        y1="0"
        x2="0"
        y2="1">

        <stop
          offset="0%"
          stop-color="#fff6e6"/>

        <stop
          offset="100%"
          stop-color="#ecdcb8"/>

      </linearGradient>

    </defs>


    <!-- sleeve -->

    <rect
      x="48"
      y="150"
      width="68"
      height="60"
      rx="14"
      fill="url(#cuff-${id})"/>

    <rect
      x="48"
      y="176"
      width="68"
      height="8"
      fill="#ffcf6b"
      opacity=".65"/>


    <!-- fingers -->

    <g>

      <path
        d="
          M50 168
          C40 160 36 140 40 118
          C42 104 52 100 58 108
          C63 115 62 138 60 158
          C59 165 55 169 50 168Z
        "
        fill="url(#skin-${id})"/>

      <path
        d="
          M66 170
          C55 160 52 128 55 100
          C57 84 70 80 76 90
          C80 98 79 130 76 160
          C75 167 71 171 66 170Z
        "
        fill="url(#skin-${id})"/>

      <path
        d="
          M84 172
          C74 163 71 132 75 104
          C78 88 91 84 96 94
          C100 102 98 132 95 162
          C93 169 89 173 84 172Z
        "
        fill="url(#skin-${id})"/>

      <path
        d="
          M100 174
          C92 166 90 146 93 124
          C95 111 106 108 110 117
          C113 125 112 148 109 164
          C108 170 104 175 100 174Z
        "
        fill="url(#skin-${id})"/>

    </g>


    <!-- palm -->

    <path
      d="
        M40 168
        C36 178 40 196 58 200
        L110 200
        C126 198 128 180 116 170
        C112 190 106 195 96 194
        C88 193 90 182 84 180
        C78 178 78 190 68 190
        C58 190 60 178 54 174
        C48 170 44 166 40 168Z
      "
      fill="url(#skin-${id})"/>


    <!-- thumb -->

    <path
      d="
        M42 176
        C28 172 16 158 18 144
        C19 136 28 133 33 140
        C38 147 38 156 46 164
        C50 168 48 175 42 176Z
      "
      fill="url(#skin-${id})"/>


    <!-- fingers details -->

    <g
      fill="none"
      stroke="#784a32"
      stroke-width="1.3"
      opacity=".35">

      <path d="M43 128q6 3 11 0"/>
      <path d="M59 118q7 4 13 0"/>
      <path d="M78 120q7 4 12 0"/>
      <path d="M95 136q6 3 11 0"/>

    </g>

  </svg>
  `;
}


handRigL.innerHTML =
  handSVG("left");

handRigR.innerHTML =
  handSVG("right");


/* ============================================================
   DISH SVG ART
   ============================================================ */

const DISH_ART = {

  pizza() {

    return `
    <svg viewBox="0 0 200 200">

      <defs>

        <radialGradient
          id="pizzaCrust"
          cx="35%"
          cy="30%"
          r="75%">

          <stop
            offset="0%"
            stop-color="#ffdd9e"/>

          <stop
            offset="60%"
            stop-color="#eeae5c"/>

          <stop
            offset="100%"
            stop-color="#b9711f"/>

        </radialGradient>

        <radialGradient
          id="pizzaSauce"
          cx="40%"
          cy="35%"
          r="70%">

          <stop
            offset="0%"
            stop-color="#ff7a52"/>

          <stop
            offset="70%"
            stop-color="#e2472f"/>

          <stop
            offset="100%"
            stop-color="#9e2915"/>

        </radialGradient>

        <radialGradient
          id="pizzaCheese"
          cx="40%"
          cy="30%"
          r="70%">

          <stop
            offset="0%"
            stop-color="#fffbe4"/>

          <stop
            offset="100%"
            stop-color="#ffdd82"/>

        </radialGradient>

      </defs>


      <!-- thick Neapolitan crust -->

      <circle
        cx="100"
        cy="100"
        r="96"
        fill="url(#pizzaCrust)"/>


      <!-- blister marks -->

      <g
        fill="#a3641f"
        opacity=".6">

        <circle cx="30" cy="70" r="5"/>
        <circle cx="52" cy="25" r="4"/>
        <circle cx="150" cy="28" r="5"/>
        <circle cx="174" cy="92" r="4"/>
        <circle cx="160" cy="150" r="5"/>
        <circle cx="110" cy="180" r="4"/>
        <circle cx="40" cy="150" r="5"/>

      </g>


      <!-- sauce -->

      <circle
        cx="100"
        cy="100"
        r="77"
        fill="url(#pizzaSauce)"/>


      <!-- bubbly cheese -->

      <path
        d="
          M40 70
          Q100 40 160 70
          Q140 100 160 130
          Q100 160 40 130
          Q60 100 40 70Z
        "
        fill="url(#pizzaCheese)"
        opacity=".7"/>


      <circle
        cx="70"
        cy="70"
        r="17"
        fill="url(#pizzaCheese)"/>

      <circle
        cx="132"
        cy="86"
        r="13"
        fill="url(#pizzaCheese)"/>

      <circle
        cx="96"
        cy="140"
        r="15"
        fill="url(#pizzaCheese)"/>

      <circle
        cx="140"
        cy="140"
        r="11"
        fill="url(#pizzaCheese)"/>


      <!-- glossy oil sheen -->

      <ellipse
        cx="75"
        cy="60"
        rx="30"
        ry="12"
        fill="#fff"
        opacity=".18"/>

    </svg>
    `;
  },


  cake() {

    return `
    <svg viewBox="0 0 200 200">

      <defs>

        <linearGradient
          id="cakeSponge"
          x1="0"
          y1="0"
          x2="0"
          y2="1">

          <stop
            offset="0%"
            stop-color="#8a5230"/>

          <stop
            offset="100%"
            stop-color="#4a2814"/>

        </linearGradient>

        <linearGradient
          id="cakeCream"
          x1="0"
          y1="0"
          x2="0"
          y2="1">

          <stop
            offset="0%"
            stop-color="#ffffff"/>

          <stop
            offset="100%"
            stop-color="#f0e2c0"/>

        </linearGradient>

      </defs>


      <!-- pedestal -->

      <ellipse
        cx="100"
        cy="180"
        rx="72"
        ry="9"
        fill="#000"
        opacity=".3"/>

      <ellipse
        cx="100"
        cy="169"
        rx="62"
        ry="10"
        fill="#fff2d8"/>

      <path
        d="
          M70 168
          Q100 155 130 168
          L120 184
          Q100 192 80 184Z
        "
        fill="#e8d6ae"/>


      <!-- bottom tier -->

      <rect
        x="38"
        y="112"
        width="124"
        height="55"
        rx="10"
        fill="url(#cakeSponge)"/>


      <!-- cream layer -->

      <path
        d="
          M38 112
          Q100 96 162 112
          Q150 124 162 135
          Q100 150 38 135
          Q50 124 38 112
        "
        fill="url(#cakeCream)"/>


      <!-- top tier -->

      <rect
        x="50"
        y="76"
        width="100"
        height="42"
        rx="9"
        fill="url(#cakeSponge)"/>


      <!-- frosting -->

      <path
        d="
          M46 78
          Q100 52 154 78
          Q142 92 154 104
          Q100 119 46 104
          Q58 92 46 78
        "
        fill="url(#cakeCream)"/>


      <!-- frosting drips -->

      <path
        d="
          M65 87
          Q69 105 65 110
          M100 77
          Q104 98 100 111
          M135 87
          Q139 102 135 109
        "
        stroke="#e8d8b4"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"/>


      <!-- glossy highlight -->

      <ellipse
        cx="80"
        cy="60"
        rx="26"
        ry="8"
        fill="#fff"
        opacity=".5"/>

    </svg>
    `;
  },


  noodles() {

    return `
    <svg viewBox="0 0 200 200">

      <defs>

        <radialGradient
          id="bowl"
          cx="40%"
          cy="30%"
          r="75%">

          <stop
            offset="0%"
            stop-color="#f7ecd4"/>

          <stop
            offset="100%"
            stop-color="#a89670"/>

        </radialGradient>

        <radialGradient
          id="broth"
          cx="40%"
          cy="30%"
          r="75%">

          <stop
            offset="0%"
            stop-color="#ffdf94"/>

          <stop
            offset="65%"
            stop-color="#e8b444"/>

          <stop
            offset="100%"
            stop-color="#8a621f"/>

        </radialGradient>

      </defs>


      <!-- bowl -->

      <ellipse
        cx="100"
        cy="108"
        rx="94"
        ry="78"
        fill="url(#bowl)"/>


      <!-- broth -->

      <ellipse
        cx="100"
        cy="92"
        rx="76"
        ry="62"
        fill="url(#broth)"/>


      <!-- broth shine -->

      <ellipse
        cx="75"
        cy="65"
        rx="32"
        ry="12"
        fill="white"
        opacity=".28"/>


      <!-- noodles -->

      <g
        fill="none"
        stroke="#fff8e4"
        stroke-width="5"
        stroke-linecap="round">

        <path
          d="M38 92 Q58 65 78 92 T120 92 T158 92"/>

        <path
          d="M40 115 Q60 88 82 115 T124 115 T158 108"/>

        <path
          d="M55 72 Q72 48 90 72 T128 72"/>

        <path
          d="M65 130 Q84 105 103 130 T140 124"/>

      </g>

    </svg>
    `;
  }

};


/* ============================================================
   TOPPING ICONS
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
      label: "Pepperoni",
      max: 12,
      price: 0.75,

      icon: icon(`
        <circle
          cx="30"
          cy="30"
          r="22"
          fill="#e2472f"/>

        <circle
          cx="23"
          cy="23"
          r="3"
          fill="#8f2515"/>

        <circle
          cx="37"
          cy="35"
          r="3"
          fill="#8f2515"/>
      `)
    },

    {
      id: "basil",
      label: "Basil Leaves",
      max: 12,
      price: 0.5,

      icon: icon(`
        <path
          d="
            M30 6
            C48 15 49 35 30 54
            C11 35 12 15 30 6Z
          "
          fill="#5cb84a"/>

        <path
          d="M30 10L30 50"
          stroke="#2c7a30"
          stroke-width="2"/>
      `)
    },

    {
      id: "mushroom",
      label: "Charred Mushrooms",
      max: 10,
      price: 0.6,

      icon: icon(`
        <path
          d="
            M10 30
            C10 13 50 13 50 30
            C50 35 40 35 30 35
            C20 35 10 35 10 30Z
          "
          fill="#a17b52"/>

        <rect
          x="25"
          y="32"
          width="10"
          height="16"
          rx="4"
          fill="#f0e2c4"/>
      `)
    },

    {
      id: "olive",
      label: "Kalamata Olives",
      max: 14,
      price: 0.5,

      icon: icon(`
        <ellipse
          cx="30"
          cy="30"
          rx="14"
          ry="17"
          fill="#3a1f38"/>

        <ellipse
          cx="30"
          cy="30"
          rx="5"
          ry="6"
          fill="#120a12"/>
      `)
    },

    {
      id: "mozzarella",
      label: "Mozzarella Pearls",
      max: 12,
      price: 0.65,

      icon: icon(`
        <circle
          cx="23"
          cy="27"
          r="11"
          fill="#fffdf0"/>

        <circle
          cx="38"
          cy="35"
          r="9"
          fill="#fff2d2"/>
      `)
    }

  ],


  cake: [

    {
      id: "berries",
      label: "Wild Berries",
      max: 14,
      price: 0.8,

      icon: icon(`
        <circle
          cx="30"
          cy="30"
          r="16"
          fill="#ff3f6f"/>

        <circle
          cx="23"
          cy="23"
          r="2"
          fill="#6a1030"/>

        <circle
          cx="36"
          cy="25"
          r="2"
          fill="#6a1030"/>

        <circle
          cx="31"
          cy="36"
          r="2"
          fill="#6a1030"/>
      `)
    },

    {
      id: "gold",
      label: "Gold Leaf",
      max: 8,
      price: 1.5,

      icon: icon(`
        <path
          d="
            M10 36
            L27 10
            L51 22
            L36 51
            Z
          "
          fill="#ffcf6b"/>

        <path
          d="M15 34L30 16"
          stroke="#fff4b5"
          stroke-width="2"/>
      `)
    },

    {
      id: "cocoa",
      label: "Shaved Cocoa",
      max: 12,
      price: 0.55,

      icon: icon(`
        <path
          d="
            M10 45
            C10 25 22 10 35 12
            C31 24 33 40 48 44
            C35 51 17 51 10 45Z
          "
          fill="#5c3420"/>
      `)
    },

    {
      id: "pistachio",
      label: "Pistachio Crumble",
      max: 12,
      price: 0.7,

      icon: icon(`
        <circle cx="20" cy="25" r="5" fill="#9fce5e"/>
        <circle cx="34" cy="20" r="4" fill="#c6ff4d"/>
        <circle cx="30" cy="37" r="5" fill="#7fae44"/>
        <circle cx="43" cy="34" r="4" fill="#b4e35c"/>
      `)
    }

  ],


  noodles: [

    {
      id: "chashu",
      label: "Chashu Pork",
      max: 8,
      price: 0.9,

      icon: icon(`
        <ellipse
          cx="30"
          cy="30"
          rx="20"
          ry="14"
          fill="#d1854f"/>

        <path
          d="
            M13 27
            Q30 18 47 27
            M13 35
            Q30 43 47 35
          "
          fill="none"
          stroke="#79401f"
          stroke-width="2"/>
      `)
    },

    {
      id: "egg",
      label: "Ramen Egg",
      max: 6,
      price: 0.6,

      icon: icon(`
        <path
          d="
            M10 31
            A20 20 0 0 1 50 31
            Z
          "
          fill="#fffaf0"/>

        <path
          d="
            M20 31
            A10 10 0 0 1 40 31
            Z
          "
          fill="#ff9d2e"/>
      `)
    },

    {
      id: "nori",
      label: "Nori Sheet",
      max: 8,
      price: 0.4,

      icon: icon(`
        <rect
          x="14"
          y="14"
          width="32"
          height="32"
          rx="3"
          fill="#1c3320"/>

        <path
          d="
            M14 21H46
          "
          stroke="#4a6b48"
          stroke-width="4"/>
      `)
    },

    {
      id: "scallion",
      label: "Charred Scallions",
      max: 12,
      price: 0.35,

      icon: icon(`
        <circle
          cx="18"
          cy="23"
          r="6"
          fill="none"
          stroke="#8fd85a"
          stroke-width="3"/>

        <circle
          cx="35"
          cy="31"
          r="6"
          fill="none"
          stroke="#b0f070"
          stroke-width="3"/>

        <circle
          cx="25"
          cy="42"
          r="5"
          fill="none"
          stroke="#6ab048"
          stroke-width="3"/>
      `)
    }

  ]

};


/* ============================================================
   DISH DATA — options now carry a realistic price
   ============================================================ */

const DISH_DATA = {

  pizza: {
    label: "Handcrafted Pizza",
    basePrice: 9.5,

    bases: [
      {
        key: "crust",
        label: "Crust",
        options: [
          { name: "Classic Sourdough", price: 0 },
          { name: "Neapolitan Thin", price: 0.5 },
          { name: "Cheesy Stuffed", price: 1.75 }
        ]
      },

      {
        key: "sauce",
        label: "Sauce",
        options: [
          { name: "San Marzano Tomato", price: 0 },
          { name: "White Truffle Cream", price: 2 },
          { name: "Basil Pesto", price: 1.25 }
        ]
      }
    ],

    toppings: TOPPINGS.pizza
  },


  cake: {
    label: "Celebration Cake",
    basePrice: 14,

    bases: [
      {
        key: "sponge",
        label: "Sponge",
        options: [
          { name: "Dark Chocolate", price: 0 },
          { name: "Madagascar Vanilla", price: 0.5 },
          { name: "Matcha", price: 1.25 }
        ]
      },

      {
        key: "frosting",
        label: "Frosting",
        options: [
          { name: "Swiss Buttercream", price: 0 },
          { name: "Salted Caramel", price: 1 },
          { name: "Earl Grey Ganache", price: 1.5 }
        ]
      }
    ],

    toppings: TOPPINGS.cake
  },


  noodles: {
    label: "Comfort Noodles",
    basePrice: 11,

    bases: [
      {
        key: "broth",
        label: "Broth",
        options: [
          { name: "Rich Tonkotsu", price: 0 },
          { name: "Smoky Shoyu", price: 0 },
          { name: "Coconut Curry", price: 1 }
        ]
      },

      {
        key: "noodle",
        label: "Noodle Style",
        options: [
          { name: "Hand-Pulled Ramen", price: 0 },
          { name: "Silky Udon", price: 0.5 },
          { name: "Egg Noodles", price: 0.5 }
        ]
      }
    ],

    toppings: TOPPINGS.noodles
  }

};


/* ============================================================
   DISH SELECTION
   ============================================================ */

dbStep1
  .querySelectorAll(".dish-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        selectDish(
          card.dataset.dish,
          card
        );

      }
    );

  });


function selectDish(type, card) {

  currentDish = type;

  baseSelections = {};

  toppingCounts = {};

  toppingIndex = 0;

  served = false;


  /* Highlight card */

  dbStep1
    .querySelectorAll(".dish-card")
    .forEach(c => {

      c.classList.toggle(
        "selected",
        c === card
      );

    });


  /* ========================================================
     CRITICAL FIX #1
     IMMEDIATELY INJECT BASE DISH SVG
     ======================================================== */

  dishArt.innerHTML =
    DISH_ART[type]();


  /* ========================================================
     CRITICAL FIX #2
     NEVER HIDE THE PLATE
     ======================================================== */

  dbPlate.style.opacity = "1";

  dbPlate.style.visibility =
    "visible";


  dbPlate.classList.remove(
    "magic-complete"
  );

  dishArt.classList.remove(
    "magic-complete"
  );


  /* Clear toppings */

  toppingsLayer.innerHTML = "";

  sparklesLayer.innerHTML = "";


  /* Steam visible around food */

  steamLayer.style.opacity =
    "0.75";


  /* Panel */

  renderPanel();


  dbPanel.hidden = false;

  dbCastBtn.hidden = false;

  dbResult.hidden = true;


  updateCastButton();


  /* Scroll stage into view */

  setTimeout(() => {

    document
      .getElementById("stageShell")
      .scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

  }, 50);

}


/* ============================================================
   PANEL
   ============================================================ */

function formatPrice(value) {

  return "$" + value.toFixed(2);

}


function renderPanel() {

  const data =
    DISH_DATA[currentDish];


  baseLabel1.textContent =
    data.bases[0].label;

  baseLabel2.textContent =
    data.bases[1].label;


  buildBaseOptions(
    baseChips1,
    data.bases[0]
  );

  buildBaseOptions(
    baseChips2,
    data.bases[1]
  );

  buildToppingButtons(
    data.toppings
  );
}


function buildBaseOptions(
  container,
  group
) {

  container.innerHTML = "";

  group.options.forEach(option => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "db-chip";

    button.innerHTML = `
      ${option.name}
      ${
        option.price > 0
          ? `<span class="chip-price">+${formatPrice(option.price)}</span>`
          : ""
      }
    `;

    button.addEventListener(
      "click",
      () => {

        container
          .querySelectorAll(".db-chip")
          .forEach(
            b => b.classList.remove(
              "selected"
            )
          );

        button.classList.add(
          "selected"
        );

        baseSelections[group.key] =
          option;

        updateCastButton();

      }
    );

    container.appendChild(
      button
    );

  });
}


function buildToppingButtons(toppings) {

  toppingGrid.innerHTML = "";

  toppings.forEach(topping => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "topping-btn";

    button.innerHTML = `

      <span class="t-icon">
        ${topping.icon}
      </span>

      <span>
        ${topping.label}
        <span class="t-price">${formatPrice(topping.price)}</span>
      </span>

      <span
        class="t-count"
        data-count="${topping.id}">
        0
      </span>

    `;

    button.addEventListener(
      "click",
      () => {
        addTopping(
          topping,
          button
        );
      }
    );

    toppingGrid.appendChild(
      button
    );

  });
}


/* ============================================================
   MAGIC BUTTON STATE
   ============================================================ */

function updateCastButton() {

  if (!currentDish) {

    dbCastBtn.disabled =
      true;

    return;
  }

  const data =
    DISH_DATA[currentDish];

  const ready =
    data.bases.every(
      base =>
        Boolean(
          baseSelections[
            base.key
          ]
        )
    );

  dbCastBtn.disabled =
    !ready;
}


/* ============================================================
   TOPPING POSITIONING
   ============================================================ */

const TOPPING_RADIUS = {

  pizza: {
    min: 65,
    max: 125
  },

  cake: {
    min: 45,
    max: 95
  },

  noodles: {
    min: 60,
    max: 110
  }

};


/*
  This creates a deterministic spiral around
  the center, with a touch of organic jitter
  so scattered toppings never look perfectly
  mechanical.

  Every topping remains inside the plate.
*/

function getToppingPosition(index) {

  const bounds =
    TOPPING_RADIUS[currentDish];

  const goldenAngle =
    137.50776;

  const angle =
    index *
    goldenAngle *
    Math.PI / 180;

  const radius =
    bounds.min +
    (
      (index % 9) / 8
    ) *
    (
      bounds.max -
      bounds.min
    );

  /* small deterministic jitter, seeded by index,
     keeps the scatter looking hand-placed */
  const jitterX =
    Math.sin(index * 12.9898) * 6;

  const jitterY =
    Math.cos(index * 78.233) * 6;


  return {

    x:
      Math.cos(angle) *
      radius +
      jitterX,

    y:
      Math.sin(angle) *
      radius +
      jitterY,

    rotation:
      (
        index * 47
      ) % 40 - 20

  };

}


/* ============================================================
   ADD TOPPING
   ============================================================ */

function addTopping(
  topping,
  button
) {

  if (served)
    return;


  const current =
    toppingCounts[
      topping.id
    ] || 0;


  if (current >= topping.max) {

    button.classList.add(
      "maxed"
    );

    return;
  }


  toppingCounts[
    topping.id
  ] =
    current + 1;


  const countElement =
    button.querySelector(
      ".t-count"
    );

  countElement.textContent =
    toppingCounts[
      topping.id
    ];


  if (
    toppingCounts[topping.id] >=
    topping.max
  ) {

    button.classList.add(
      "maxed"
    );
  }


  const position =
    getToppingPosition(
      toppingIndex
    );


  spawnTopping(
    topping.icon,
    position
  );


  animateHand(
    position.x < 0
      ? "left"
      : "right"
  );


  /* a little physical "clink" so the plate
     feels like it's actually being loaded */

  dbPlate.classList.remove("bump");

  void dbPlate.offsetWidth;

  dbPlate.classList.add("bump");


  toppingIndex++;
}


/* ============================================================
   SPAWN TOPPING
   ============================================================ */

function spawnTopping(
  markup,
  position
) {

  const element =
    document.createElement("div");

  element.className =
    "topping-item";


  element.innerHTML =
    markup;


  element.style.setProperty(
    "--offset-x",
    position.x + "px"
  );

  element.style.setProperty(
    "--offset-y",
    position.y + "px"
  );

  element.style.setProperty(
    "--rotation",
    position.rotation + "deg"
  );


  toppingsLayer.appendChild(
    element
  );

}


/* ============================================================
   HAND GESTURE
   ============================================================ */

function animateHand(side) {

  const rig =
    side === "left"
      ? handRigL
      : handRigR;


  const anchor =
    side === "left"
      ? handLeft
      : handRight;


  rig.classList.add(
    "magic"
  );

  anchor.style.transform =
    side === "left"
      ? "translateX(20px)"
      : "translateX(-20px)";


  setTimeout(() => {

    rig.classList.remove(
      "magic"
    );

    anchor.style.transform =
      "";

  }, 500);

}


/* ============================================================
   MAGIC REVEAL
   ============================================================ */

dbCastBtn.addEventListener(
  "click",
  castMagic
);


function castMagic() {

  if (
    dbCastBtn.disabled ||
    served
  )
    return;


  served = true;

  dbCastBtn.disabled =
    true;


  /*
    CRITICAL:
    plate and dish NEVER become
    opacity 0 / display none.
  */

  dbPlate.style.opacity =
    "1";

  dbPlate.style.visibility =
    "visible";

  dishArt.style.opacity =
    "1";

  dishArt.style.visibility =
    "visible";


  /* Hands come in */

  handRigL.classList.add(
    "magic"
  );

  handRigR.classList.add(
    "magic"
  );


  handLeft.style.transform =
    "translateX(35px)";

  handRight.style.transform =
    "translateX(-35px)";


  /* Steam */

  steamLayer.style.opacity =
    "1";


  /* Sparkles */

  setTimeout(
    createMagicSparkles,
    250
  );


  /* Golden finish */

  setTimeout(() => {

    dbPlate.classList.add(
      "magic-complete"
    );

    dishArt.classList.add(
      "magic-complete"
    );

  }, 650);


  /* Hands leave */

  setTimeout(() => {

    handRigL.classList.remove(
      "magic"
    );

    handRigR.classList.remove(
      "magic"
    );

    handLeft.style.transform =
      "";

    handRight.style.transform =
      "";

  }, 1200);


  /* Receipt */

  setTimeout(() => {

    showReceipt();

  }, 1800);

}


/* ============================================================
   MAGIC SPARKLES
   ============================================================ */

function createMagicSparkles() {

  for (
    let i = 0;
    i < 26;
    i++
  ) {

    const sparkle =
      document.createElement(
        "span"
      );

    sparkle.className =
      "sparkle";


    sparkle.style.left =
      random(30,70) + "%";

    sparkle.style.top =
      random(25,75) + "%";


    sparkle.style.animationDelay =
      random(0,.6) + "s";

    sparkle.style.color =
      SPARKLE_COLORS[
        Math.floor(
          random(0, SPARKLE_COLORS.length)
        )
      ];


    sparkle.innerHTML = `

      <svg viewBox="0 0 20 20">

        <path
          d="
            M10 0
            L12.5 7.5
            L20 10
            L12.5 12.5
            L10 20
            L7.5 12.5
            L0 10
            L7.5 7.5
            Z
          "/>

      </svg>

    `;


    sparklesLayer.appendChild(
      sparkle
    );


    setTimeout(() => {

      sparkle.remove();

    }, 1800);

  }

}


/* ============================================================
   RECEIPT
   ============================================================ */

function showReceipt() {

  const data =
    DISH_DATA[currentDish];


  const lines = [];

  let total = data.basePrice;


  lines.push({
    qty: "1×",
    name: data.label,
    price: data.basePrice
  });


  data.bases.forEach(
    base => {

      const selection =
        baseSelections[
          base.key
        ];

      lines.push({
        qty: "—",
        name: selection.name,
        price: selection.price
      });

      total += selection.price;

    }
  );


  data.toppings.forEach(
    topping => {

      const count =
        toppingCounts[
          topping.id
        ] || 0;


      if (count > 0) {

        const lineTotal =
          count * topping.price;

        lines.push({
          qty: count + "×",
          name: topping.label,
          price: lineTotal
        });

        total += lineTotal;

      }

    }
  );


  receipt.innerHTML = `

    <div class="receipt-head">

      <p class="receipt-title">
        ${data.label}
      </p>

      <p>
        prepared with care
      </p>

    </div>

    <hr class="receipt-divider">

    ${lines.map(
      line => `
        <div class="receipt-line">

          <span>
            ${line.qty}
          </span>

          <span>
            ${line.name}
          </span>

          <span>
            ${
              line.price > 0
                ? formatPrice(line.price)
                : "incl."
            }
          </span>

        </div>
      `
    ).join("")}

    <hr class="receipt-divider">

    <div class="receipt-line receipt-total">

      <span></span>

      <span>
        Total
      </span>

      <span>
        ${formatPrice(total)}
      </span>

    </div>

    <div class="receipt-stamp-wrap">

      <span class="receipt-stamp">
        ✓ Fresh
      </span>

    </div>

    <p class="receipt-foot">
      A PERFECT DAY · BON APPÉTIT
    </p>

  `;


  dbResult.hidden =
    false;


  dbResult.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* ============================================================
   MAKE ANOTHER DISH
   ============================================================ */

document
  .getElementById("dbAnotherBtn")
  .addEventListener(
    "click",
    () => {

      currentDish = null;

      baseSelections = {};

      toppingCounts = {};

      toppingIndex = 0;

      served = false;


      dbStep1
        .querySelectorAll(
          ".dish-card"
        )
        .forEach(card => {

          card.classList.remove(
            "selected"
          );

        });


      dbPanel.hidden =
        true;

      dbCastBtn.hidden =
        true;

      dbCastBtn.disabled =
        true;

      dbResult.hidden =
        true;


      dishArt.innerHTML =
        "";

      toppingsLayer.innerHTML =
        "";

      sparklesLayer.innerHTML =
        "";

      dbPlate.classList.remove(
        "magic-complete"
      );

      dishArt.classList.remove(
        "magic-complete"
      );


      steamLayer.style.opacity =
        "0";


      window.scrollTo({
        top:
          document.getElementById(
            "dishBuilder"
          ).offsetTop,
        behavior: "smooth"
      });

    }
  );


/* ============================================================
   REVEAL TEXT
   ============================================================ */

const revealElements =
  document.querySelectorAll(
    ".reveal-el"
  );


if (
  "IntersectionObserver"
  in window
) {

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "in-view"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: .15
      }
    );


  revealElements.forEach(
    element =>
      observer.observe(
        element
      )
  );

} else {

  revealElements.forEach(
    element =>
      element.classList.add(
        "in-view"
      )
  );

}