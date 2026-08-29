(function () {
  'use strict';

  /* ============================================================
     CONFIG — story phases as fractions of total scroll (0..1)
     ============================================================ */
  var PH = {
    introEnd: 0.045,
    wireEnd: 0.15,
    tvRevealEnd: 0.25,
    bzztEnd: 0.28,
    storyStart: 0.28,
    storyEnd: 0.90
  };
  var SCENE_COUNT = 8;

  /* time-of-day colors used for the ambient backlight, keyed by scene index */
  var SCENE_GLOW = [
    [70, 40, 70],    // 0 wake up - dawn violet
    [70, 150, 200],  // 1 morning - sky blue
    [140, 90, 50],   // 2 lunch - cafe amber
    [70, 160, 210],  // 3 adventure - bright blue
    [220, 100, 60],  // 4 golden hour - sunset orange
    [60, 40, 80],    // 5 evening - lamp violet
    [15, 20, 45],    // 6 night - deep navy
    [5, 5, 8]        // 7 credits - black
  ];

  var scrollContainer = document.getElementById('scrollContainer');
  var introTitle = document.getElementById('introTitle');
  var ambientGlow = document.getElementById('ambientGlow');
  var wireLeft = document.getElementById('wireLeft');
  var wireRight = document.getElementById('wireRight');
  var plugLeft = document.getElementById('plugLeft');
  var plugRight = document.getElementById('plugRight');
  var spark = document.getElementById('spark');
  var tvRig = document.getElementById('tvRig');
  var tvLed = document.getElementById('tvLed');
  var crtStatic = document.getElementById('crtStatic');
  var crtBzzt = document.getElementById('crtBzzt');
  var knobChannel = document.getElementById('knobChannel');
  var knobVolume = document.getElementById('knobVolume');
  var timeline = document.getElementById('timeline');
  var timelineFill = document.getElementById('timelineFill');
  var timelineItems = document.querySelectorAll('#timelineList li');
  var clockDigits = document.getElementById('clockDigits');
  var watchAgainBtn = document.getElementById('watchAgainBtn');
  var scenes = document.querySelectorAll('.scene');

  /* ============================================================
     ONE-TIME SETUP — procedurally scatter decorative elements
     ============================================================ */
  function scatter(container, count, factory) {
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) frag.appendChild(factory(i));
    container.appendChild(frag);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  scatter(document.getElementById('dustMotes'), 22, function () {
    var el = document.createElement('span');
    el.style.left = rand(5, 95) + '%';
    el.style.top = rand(10, 70) + '%';
    el.style.setProperty('--mx', rand(-30, 30) + 'px');
    el.style.animationDuration = rand(6, 13) + 's';
    el.style.animationDelay = rand(0, 8) + 's';
    return el;
  });

  scatter(document.getElementById('cloudsLayer'), 5, function (i) {
    var el = document.createElement('span');
    var w = rand(60, 140);
    el.style.width = w + 'px';
    el.style.height = w * 0.4 + 'px';
    el.style.top = rand(5, 45) + '%';
    el.style.animationDuration = rand(30, 55) + 's';
    el.style.animationDelay = -rand(0, 40) + 's';
    return el;
  });

  scatter(document.getElementById('birdsLayer'), 4, function () {
    var el = document.createElement('span');
    el.style.top = rand(10, 40) + '%';
    el.style.animationDuration = rand(10, 18) + 's';
    el.style.animationDelay = -rand(0, 14) + 's';
    return el;
  });

  scatter(document.getElementById('starsLayer'), 60, function () {
    var el = document.createElement('span');
    el.style.left = rand(0, 100) + '%';
    el.style.top = rand(0, 80) + '%';
    el.style.animationDuration = rand(1.5, 4.5) + 's';
    el.style.animationDelay = rand(0, 4) + 's';
    return el;
  });

  scatter(document.getElementById('notesLayer'), 6, function () {
    var el = document.createElement('span');
    el.textContent = Math.random() > 0.5 ? '\u266A' : '\u266B';
    el.style.left = rand(35, 70) + '%';
    el.style.bottom = rand(20, 40) + '%';
    el.style.animationDuration = rand(3, 5) + 's';
    el.style.animationDelay = -rand(0, 5) + 's';
    return el;
  });

  /* ============================================================
     WIRE GEOMETRY — endpoints travel toward the center as t: 0->1
     ============================================================ */
  var WIRE = {
    leftStartX: 250, rightStartX: 750, centerX: 500, meetY: 300, topY: -20
  };

  function updateWires(t) {
    // t in [0,1] across the wire phase
    var lx = WIRE.leftStartX + (WIRE.centerX - 30 - WIRE.leftStartX) * t;
    var rx = WIRE.rightStartX + (WIRE.centerX + 30 - WIRE.rightStartX) * t;
    var ly = WIRE.meetY - 20 * t;
    var ry = WIRE.meetY - 20 * t;

    var dLeft = 'M ' + WIRE.leftStartX + ' ' + WIRE.topY +
      ' C ' + WIRE.leftStartX + ' 150, ' + (lx - 40) + ' ' + (ly - 60) + ', ' + lx + ' ' + ly;
    var dRight = 'M ' + WIRE.rightStartX + ' ' + WIRE.topY +
      ' C ' + WIRE.rightStartX + ' 150, ' + (rx + 40) + ' ' + (ry - 60) + ', ' + rx + ' ' + ry;

    wireLeft.setAttribute('d', dLeft);
    wireRight.setAttribute('d', dRight);
    plugLeft.setAttribute('cx', lx); plugLeft.setAttribute('cy', ly);
    plugRight.setAttribute('cx', rx); plugRight.setAttribute('cy', ry);

    var connected = t >= 0.995;
    plugLeft.style.fill = connected ? '#ffdca0' : '#2a2118';
    plugRight.style.fill = connected ? '#ffdca0' : '#2a2118';
  }

  var sparkTriggered = false;
  function setSpark(active) {
    if (active && !sparkTriggered) {
      spark.classList.add('active');
      sparkTriggered = true;
    } else if (!active && sparkTriggered) {
      spark.classList.remove('active');
      sparkTriggered = false;
    }
  }

  /* ============================================================
     COLOR LERP for ambient glow
     ============================================================ */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function colorAt(sceneFloat) {
    var i = Math.floor(sceneFloat);
    var frac = sceneFloat - i;
    var a = SCENE_GLOW[Math.max(0, Math.min(SCENE_COUNT - 1, i))];
    var b = SCENE_GLOW[Math.max(0, Math.min(SCENE_COUNT - 1, i + 1))];
    return [
      Math.round(lerp(a[0], b[0], frac)),
      Math.round(lerp(a[1], b[1], frac)),
      Math.round(lerp(a[2], b[2], frac))
    ];
  }

  var bzztShown = false;

  /* ============================================================
     MAIN RENDER — called on scroll (rAF-throttled)
     ============================================================ */
  var ticking = false;

  function render() {
    ticking = false;
    var maxScroll = scrollContainer.offsetHeight - window.innerHeight;
    var progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress = Math.max(0, Math.min(1, progress));

    /* --- intro title --- */
    var introT = Math.min(1, progress / PH.introEnd);
    introTitle.style.opacity = String(1 - introT);
    introTitle.style.transform = 'translate(-50%,-50%) translateY(' + (-introT * 30) + 'px)';
    introTitle.style.pointerEvents = introT >= 1 ? 'none' : 'auto';

    /* --- wires --- */
    var wireT = Math.max(0, Math.min(1, progress / PH.wireEnd));
    updateWires(wireT);
    setSpark(wireT >= 0.995);
    tvLed.classList.toggle('on', wireT >= 0.995);

    /* --- TV reveal --- */
    var revealT = Math.max(0, Math.min(1,
      (progress - PH.wireEnd) / (PH.tvRevealEnd - PH.wireEnd)));
    tvRig.style.opacity = String(revealT);
    tvRig.style.transform = 'scale(' + (0.6 + 0.4 * revealT) + ') translateY(' + (40 * (1 - revealT)) + 'px)';
    timeline.style.opacity = String(revealT);

    /* --- CRT boot flicker --- */
    var showStatic = progress >= PH.tvRevealEnd && progress < PH.bzztEnd;
    crtStatic.classList.toggle('active', showStatic);
    if (progress >= PH.tvRevealEnd && progress < PH.bzztEnd) {
      if (!bzztShown) { crtBzzt.classList.remove('active'); void crtBzzt.offsetWidth; crtBzzt.classList.add('active'); bzztShown = true; }
    } else if (progress < PH.tvRevealEnd) {
      bzztShown = false;
      crtBzzt.classList.remove('active');
    }

    /* --- story scenes --- */
    var storyT = Math.max(0, Math.min(1,
      (progress - PH.storyStart) / (PH.storyEnd - PH.storyStart)));
    var sceneFloat = storyT * (SCENE_COUNT - 1);
    if (progress < PH.storyStart) sceneFloat = 0;
    if (progress >= PH.storyEnd) sceneFloat = SCENE_COUNT - 1;

    scenes.forEach(function (sceneEl) {
      var idx = parseInt(sceneEl.getAttribute('data-scene'), 10);
      var dist = Math.abs(sceneFloat - idx);
      var opacity = Math.max(0, 1 - dist * 1.35);
      sceneEl.style.opacity = String(opacity);
      sceneEl.style.zIndex = String(10 - Math.round(dist));
    });

    /* clock digits in scene 1: flips 06:59 -> 07:00 partway through the scene */
    clockDigits.textContent = (progress >= PH.storyStart && sceneFloat > 0.4) ? '07:00' : '06:59';

    /* ambient backlight color */
    var glowProgress = progress < PH.storyStart ? 0 : sceneFloat;
    var c = colorAt(glowProgress);
    ambientGlow.style.background =
      'radial-gradient(circle at 50% 55%, rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',.45), transparent 62%)';

    /* knob rotation reacts to active scene */
    var activeIdx = Math.round(sceneFloat);
    knobChannel.style.transform = 'rotate(' + (activeIdx * 42) + 'deg)';
    knobVolume.style.transform = 'rotate(' + (activeIdx * -30) + 'deg)';

    /* timeline fill + active marker */
    var fillPct = Math.max(0, Math.min(1, (activeIdx) / (SCENE_COUNT - 1))) * 100;
    if (progress < PH.storyStart) fillPct = 0;
    timelineFill.style.setProperty('--fill', fillPct + '%');
    timelineItems.forEach(function (li) {
      var i = parseInt(li.getAttribute('data-index'), 10);
      li.classList.toggle('active', progress >= PH.storyStart && i === activeIdx);
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(render);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ============================================================
     TIMELINE CLICK NAVIGATION
     ============================================================ */
  timelineItems.forEach(function (li) {
    li.querySelector('button').addEventListener('click', function () {
      var idx = parseInt(li.getAttribute('data-index'), 10);
      goToScene(idx);
    });
  });

  watchAgainBtn.addEventListener('click', function () {
    goToScene(0);
  });

  function goToScene(idx) {
    var maxScroll = scrollContainer.offsetHeight - window.innerHeight;
    var t = idx / (SCENE_COUNT - 1);
    var targetProgress = PH.storyStart + t * (PH.storyEnd - PH.storyStart);
    var targetY = targetProgress * maxScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  /* initial paint */
  render();
})();