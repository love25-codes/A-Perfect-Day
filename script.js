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
      ? "#ffdca0"
      : "#2a2118";

  plugRight.style.fill =
    connected
      ? "#ffdca0"
      : "#2a2118";
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

const glowColors = [
  [70,40,70],
  [70,150,200],
  [140,90,50],
  [70,160,210],
  [220,100,60],
  [60,40,80],
  [15,20,45],
  [5,5,8]
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
          .45
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
          stop-color="#f0c8a0"/>

        <stop
          offset="55%"
          stop-color="#dba277"/>

        <stop
          offset="100%"
          stop-color="#a9754e"/>

      </linearGradient>

      <linearGradient
        id="cuff-${id}"
        x1="0"
        y1="0"
        x2="0"
        y2="1">

        <stop
          offset="0%"
          stop-color="#ece3d0"/>

        <stop
          offset="100%"
          stop-color="#cbbfa2"/>

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
      fill="#c9a15a"
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
            stop-color="#efc889"/>

          <stop
            offset="60%"
            stop-color="#d9a45c"/>

          <stop
            offset="100%"
            stop-color="#a96829"/>

        </radialGradient>

        <radialGradient
          id="pizzaSauce"
          cx="40%"
          cy="35%"
          r="70%">

          <stop
            offset="0%"
            stop-color="#e0654a"/>

          <stop
            offset="70%"
            stop-color="#c94a35"/>

          <stop
            offset="100%"
            stop-color="#8a2e1f"/>

        </radialGradient>

        <radialGradient
          id="pizzaCheese"
          cx="40%"
          cy="30%"
          r="70%">

          <stop
            offset="0%"
            stop-color="#fff9df"/>

          <stop
            offset="100%"
            stop-color="#edcf76"/>

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
        fill="#9d632b"
        opacity=".55">

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
        opacity=".65"/>


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
            stop-color="#75482c"/>

          <stop
            offset="100%"
            stop-color="#3d2112"/>

        </linearGradient>

        <linearGradient
          id="cakeCream"
          x1="0"
          y1="0"
          x2="0"
          y2="1">

          <stop
            offset="0%"
            stop-color="#fffdf3"/>

          <stop
            offset="100%"
            stop-color="#dfd0b1"/>

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
        fill="#e8dcc4"/>

      <path
        d="
          M70 168
          Q100 155 130 168
          L120 184
          Q100 192 80 184Z
        "
        fill="#d4c5a5"/>


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
        stroke="#d8c9a9"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"/>

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
            stop-color="#f0e3cb"/>

          <stop
            offset="100%"
            stop-color="#9f9175"/>

        </radialGradient>

        <radialGradient
          id="broth"
          cx="40%"
          cy="30%"
          r="75%">

          <stop
            offset="0%"
            stop-color="#e9ca7b"/>

          <stop
            offset="65%"
            stop-color="#c9a15a"/>

          <stop
            offset="100%"
            stop-color="#76592b"/>

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
        opacity=".18"/>


      <!-- noodles -->

      <g
        fill="none"
        stroke="#fff5df"
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

      icon: icon(`
        <circle
          cx="30"
          cy="30"
          r="22"
          fill="#c43d2a"/>

        <circle
          cx="23"
          cy="23"
          r="3"
          fill="#7a2015"/>

        <circle
          cx="37"
          cy="35"
          r="3"
          fill="#7a2015"/>
      `)
    },

    {
      id: "basil",
      label: "Basil Leaves",
      max: 12,

      icon: icon(`
        <path
          d="
            M30 6
            C48 15 49 35 30 54
            C11 35 12 15 30 6Z
          "
          fill="#4f913e"/>

        <path
          d="M30 10L30 50"
          stroke="#275d2b"
          stroke-width="2"/>
      `)
    },

    {
      id: "mushroom",
      label: "Charred Mushrooms",
      max: 10,

      icon: icon(`
        <path
          d="
            M10 30
            C10 13 50 13 50 30
            C50 35 40 35 30 35
            C20 35 10 35 10 30Z
          "
          fill="#8c6745"/>

        <rect
          x="25"
          y="32"
          width="10"
          height="16"
          rx="4"
          fill="#e6d7bd"/>
      `)
    },

    {
      id: "olive",
      label: "Kalamata Olives",
      max: 14,

      icon: icon(`
        <ellipse
          cx="30"
          cy="30"
          rx="14"
          ry="17"
          fill="#241722"/>

        <ellipse
          cx="30"
          cy="30"
          rx="5"
          ry="6"
          fill="#080509"/>
      `)
    },

    {
      id: "mozzarella",
      label: "Mozzarella Pearls",
      max: 12,

      icon: icon(`
        <circle
          cx="23"
          cy="27"
          r="11"
          fill="#fff9e9"/>

        <circle
          cx="38"
          cy="35"
          r="9"
          fill="#eee3c9"/>
      `)
    }

  ],


  cake: [

    {
      id: "berries",
      label: "Wild Berries",
      max: 14,

      icon: icon(`
        <circle
          cx="30"
          cy="30"
          r="16"
          fill="#a52542"/>

        <circle
          cx="23"
          cy="23"
          r="2"
          fill="#4a1020"/>

        <circle
          cx="36"
          cy="25"
          r="2"
          fill="#4a1020"/>

        <circle
          cx="31"
          cy="36"
          r="2"
          fill="#4a1020"/>
      `)
    },

    {
      id: "gold",
      label: "Gold Leaf",
      max: 8,

      icon: icon(`
        <path
          d="
            M10 36
            L27 10
            L51 22
            L36 51
            Z
          "
          fill="#e8b84a"/>

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

      icon: icon(`
        <path
          d="
            M10 45
            C10 25 22 10 35 12
            C31 24 33 40 48 44
            C35 51 17 51 10 45Z
          "
          fill="#4a2918"/>
      `)
    },

    {
      id: "pistachio",
      label: "Pistachio Crumble",
      max: 12,

      icon: icon(`
        <circle cx="20" cy="25" r="5" fill="#89ad55"/>
        <circle cx="34" cy="20" r="4" fill="#a9c96a"/>
        <circle cx="30" cy="37" r="5" fill="#6e913f"/>
        <circle cx="43" cy="34" r="4" fill="#9fc362"/>
      `)
    }

  ],


  noodles: [

    {
      id: "chashu",
      label: "Chashu Pork",
      max: 8,

      icon: icon(`
        <ellipse
          cx="30"
          cy="30"
          rx="20"
          ry="14"
          fill="#b86d43"/>

        <path
          d="
            M13 27
            Q30 18 47 27
            M13 35
            Q30 43 47 35
          "
          fill="none"
          stroke="#633019"
          stroke-width="2"/>
      `)
    },

    {
      id: "egg",
      label: "Ramen Egg",
      max: 6,

      icon: icon(`
        <path
          d="
            M10 31
            A20 20 0 0 1 50 31
            Z
          "
          fill="#fff8e8"/>

        <path
          d="
            M20 31
            A10 10 0 0 1 40 31
            Z
          "
          fill="#e7a229"/>
      `)
    },

    {
      id: "nori",
      label: "Nori Sheet",
      max: 8,

      icon: icon(`
        <rect
          x="14"
          y="14"
          width="32"
          height="32"
          rx="3"
          fill="#16251a"/>

        <path
          d="
            M14 21H46
          "
          stroke="#405340"
          stroke-width="4"/>
      `)
    },

    {
      id: "scallion",
      label: "Charred Scallions",
      max: 12,

      icon: icon(`
        <circle
          cx="18"
          cy="23"
          r="6"
          fill="none"
          stroke="#72a94d"
          stroke-width="3"/>

        <circle
          cx="35"
          cy="31"
          r="6"
          fill="none"
          stroke="#91bf61"
          stroke-width="3"/>

        <circle
          cx="25"
          cy="42"
          r="5"
          fill="none"
          stroke="#568a3c"
          stroke-width="3"/>
      `)
    }

  ]

};


/* ============================================================
   DISH DATA
   ============================================================ */

const DISH_DATA = {

  pizza: {
    label: "Handcrafted Pizza",

    bases: [
      {
        key: "crust",
        label: "Crust",
        options: [
          "Classic Sourdough",
          "Neapolitan Thin",
          "Cheesy Stuffed"
        ]
      },

      {
        key: "sauce",
        label: "Sauce",
        options: [
          "San Marzano Tomato",
          "White Truffle Cream",
          "Basil Pesto"
        ]
      }
    ],

    toppings: TOPPINGS.pizza
  },


  cake: {
    label: "Celebration Cake",

    bases: [
      {
        key: "sponge",
        label: "Sponge",
        options: [
          "Dark Chocolate",
          "Madagascar Vanilla",
          "Matcha"
        ]
      },

      {
        key: "frosting",
        label: "Frosting",
        options: [
          "Swiss Buttercream",
          "Salted Caramel",
          "Earl Grey Ganache"
        ]
      }
    ],

    toppings: TOPPINGS.cake
  },


  noodles: {
    label: "Comfort Noodles",

    bases: [
      {
        key: "broth",
        label: "Broth",
        options: [
          "Rich Tonkotsu",
          "Smoky Shoyu",
          "Coconut Curry"
        ]
      },

      {
        key: "noodle",
        label: "Noodle Style",
        options: [
          "Hand-Pulled Ramen",
          "Silky Udon",
          "Egg Noodles"
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

    button.textContent =
      option;

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
  the center.

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


  return {

    x:
      Math.cos(angle) *
      radius,

    y:
      Math.sin(angle) *
      radius,

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
    i < 22;
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


  data.bases.forEach(
    base => {

      lines.push({
        qty: "1×",
        name:
          baseSelections[
            base.key
          ]
      });

    }
  );


  data.toppings.forEach(
    topping => {

      const count =
        toppingCounts[
          topping.id
        ] || 0;


      if (count > 0) {

        lines.push({
          qty: count + "×",
          name: topping.label
        });

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

        </div>
      `
    ).join("")}

    <hr class="receipt-divider">

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