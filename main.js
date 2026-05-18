/* ============================================================
   MIDNIGHT SPACE — main.js
   Three.js 3D scene · cinematic interactions · premium polish
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ── 1. Scroll progress bar ─────────────────────────── */
  (function scrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    var fill = document.createElement('div');
    fill.className = 'scroll-progress-fill';
    bar.appendChild(fill);
    document.body.appendChild(bar);

    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ── 2. Custom cursor ──────────────────────────────── */
  if (!coarsePointer) {
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + (mx - 3) + 'px, ' + (my - 3) + 'px)';
    });

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + (rx - 18) + 'px, ' + (ry - 18) + 'px)';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.addEventListener('mousedown', function () { ring.classList.add('click'); });
    document.addEventListener('mouseup',   function () { ring.classList.remove('click'); });

    var hoverSel = 'a, button, .card, .info-card, .sector-tile, .dashboard-row, input, textarea, select, label';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('hover');
    });
  }

  /* ── 3. Navbar scroll effect ─────────────────────────── */
  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    var navTick = false;
    window.addEventListener('scroll', function () {
      if (!navTick) {
        requestAnimationFrame(function () {
          siteNav.classList.toggle('scrolled', window.scrollY > 10);
          navTick = false;
        });
        navTick = true;
      }
    }, { passive: true });
  }

  /* ── 4. Active nav highlight ─────────────────────────── */
  (function highlightNav() {
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      var isHome  = (page === '' || page === 'index.html') && (href === 'index.html' || href === './');
      var isMatch = href === page;
      if (isHome || isMatch) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ── 5. Mobile menu ──────────────────────────────────── */
  var hamburger  = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.classList.toggle('open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 6. Smooth anchor scroll ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || !id) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 7. IntersectionObserver reveal ──────────────────── */
  var REVEAL_SEL = '.fade-in, .fade-in-left, .fade-in-right, .reveal';

  function runReveal() {
    var elements = document.querySelectorAll(REVEAL_SEL);
    if (!elements.length) return;
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ── 8. Number counter ───────────────────────────────── */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    var duration = parseInt(el.getAttribute('data-duration') || '1800', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var format = el.getAttribute('data-format') === 'comma';
    var start = performance.now();

    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = target * eased;
      var display = format ? Math.round(value).toLocaleString('en-US') : Math.round(value).toString();
      el.textContent = prefix + display + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (format ? target.toLocaleString('en-US') : target) + suffix;
    }
    requestAnimationFrame(step);
  }

  function runCounters() {
    var counters = document.querySelectorAll('.counter[data-target]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var seen = new WeakSet();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { obs.observe(c); });
  }

  /* ── 9. Card tilt (subtle 3D) ────────────────────────── */
  function bindTilt() {
    if (coarsePointer || reducedMotion) return;
    var targets = document.querySelectorAll('.card, .info-card, .hero-card, .dashboard-card');
    targets.forEach(function (el) {
      var rx = 0, ry = 0, tx = 0, ty = 0;
      var rect = null;
      var raf = null;

      function onMove(e) {
        if (!rect) rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top)  / rect.height;
        ty = (x - 0.5) * 6;
        tx = -(y - 0.5) * 6;
        if (!raf) raf = requestAnimationFrame(apply);
      }
      function apply() {
        rx += (tx - rx) * 0.15;
        ry += (ty - ry) * 0.15;
        el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) {
          raf = requestAnimationFrame(apply);
        } else {
          raf = null;
        }
      }
      function onLeave() {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(apply);
        setTimeout(function () { rect = null; }, 100);
      }
      function onEnter() { rect = el.getBoundingClientRect(); }

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  /* ── 10. Magnetic buttons ────────────────────────────── */
  function bindMagnetic() {
    if (coarsePointer || reducedMotion) return;
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(function (btn) {
      var rect = null;
      btn.addEventListener('mouseenter', function () { rect = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', function (e) {
        if (!rect) rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px, ' + (y * 0.18 - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        rect = null;
      });
    });
  }

  /* ── 11. Sector-tile cursor spotlight ────────────────── */
  function bindSectorSpotlight() {
    document.querySelectorAll('.sector-tile').forEach(function (tile) {
      tile.addEventListener('mousemove', function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', ((e.clientX - r.left) / r.width)  * 100 + '%');
        tile.style.setProperty('--my', ((e.clientY - r.top)  / r.height) * 100 + '%');
      });
    });
  }

  /* ── 12. Hero H1 line-split — wrap each .line's children
          in a <span> using safe DOM ops (no innerHTML) ──── */
  function prepHeroH1() {
    var h1 = document.querySelector('.hero-h1');
    if (!h1) return;
    Array.prototype.forEach.call(h1.querySelectorAll('.line'), function (line) {
      if (line.querySelector(':scope > span')) return;
      var wrap = document.createElement('span');
      while (line.firstChild) wrap.appendChild(line.firstChild);
      line.appendChild(wrap);
    });
  }

  /* ── 13. Three.js scene — cinematic hero backdrop ───── */
  function buildScene() {
    if (reducedMotion) return;
    var canvas = document.getElementById('scene-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04050a, 0.04);

    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    /* ── Starfield ── */
    var starCount = window.innerWidth < 700 ? 1800 : 3600;
    var starGeom = new THREE.BufferGeometry();
    var positions = new Float32Array(starCount * 3);
    var colors    = new Float32Array(starCount * 3);
    var sizes     = new Float32Array(starCount);
    var cyan  = new THREE.Color(0x9be7ff);
    var gold  = new THREE.Color(0xf0d6a0);
    var white = new THREE.Color(0xffffff);

    for (var i = 0; i < starCount; i++) {
      var r = 18 + Math.random() * 32;
      var theta = Math.random() * Math.PI * 2;
      var phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      var c;
      var rnd = Math.random();
      if (rnd < 0.12) c = gold;
      else if (rnd < 0.34) c = cyan;
      else c = white;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 1.6 + 0.4;
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeom.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    starGeom.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    var starMat = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    var stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    /* ── Inner dense star cluster (close, parallax) ── */
    var nearCount = window.innerWidth < 700 ? 400 : 800;
    var nearGeom = new THREE.BufferGeometry();
    var nearPos = new Float32Array(nearCount * 3);
    var nearCol = new Float32Array(nearCount * 3);

    for (var j = 0; j < nearCount; j++) {
      nearPos[j * 3]     = (Math.random() - 0.5) * 30;
      nearPos[j * 3 + 1] = (Math.random() - 0.5) * 18;
      nearPos[j * 3 + 2] = -Math.random() * 18 - 1;
      var nc = Math.random() < 0.3 ? cyan : white;
      nearCol[j * 3]     = nc.r;
      nearCol[j * 3 + 1] = nc.g;
      nearCol[j * 3 + 2] = nc.b;
    }
    nearGeom.setAttribute('position', new THREE.BufferAttribute(nearPos, 3));
    nearGeom.setAttribute('color',    new THREE.BufferAttribute(nearCol, 3));
    var nearMat = new THREE.PointsMaterial({
      size: 0.09,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var nearStars = new THREE.Points(nearGeom, nearMat);
    scene.add(nearStars);

    /* ── Wireframe globe (signature object) ── */
    var globeGroup = new THREE.Group();
    globeGroup.position.set(2.6, 0.1, 0);
    scene.add(globeGroup);

    var ico = new THREE.IcosahedronGeometry(1.55, 3);
    var edges = new THREE.EdgesGeometry(ico);
    var lineMat = new THREE.LineBasicMaterial({
      color: 0x6fdcff,
      transparent: true,
      opacity: 0.55
    });
    var wireGlobe = new THREE.LineSegments(edges, lineMat);
    globeGroup.add(wireGlobe);

    var innerGeom = new THREE.SphereGeometry(1.35, 48, 48);
    var innerMat = new THREE.MeshBasicMaterial({
      color: 0x0a1838,
      transparent: true,
      opacity: 0.65
    });
    var innerSphere = new THREE.Mesh(innerGeom, innerMat);
    globeGroup.add(innerSphere);

    var haloGeom = new THREE.SphereGeometry(1.62, 32, 32);
    var haloMat = new THREE.MeshBasicMaterial({
      color: 0x5dd7ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    });
    var halo = new THREE.Mesh(haloGeom, haloMat);
    globeGroup.add(halo);

    var ringGeom = new THREE.RingGeometry(2.2, 2.32, 96);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8c98a,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    var goldRing = new THREE.Mesh(ringGeom, ringMat);
    goldRing.rotation.x = Math.PI * 0.32;
    goldRing.rotation.z = Math.PI * 0.08;
    globeGroup.add(goldRing);

    /* Orbiting data points */
    var orbitGroup = new THREE.Group();
    globeGroup.add(orbitGroup);
    var orbitDots = [];
    for (var k = 0; k < 12; k++) {
      var dotGeom = new THREE.SphereGeometry(0.04, 12, 12);
      var dotMat  = new THREE.MeshBasicMaterial({
        color: k % 3 === 0 ? 0xe8c98a : 0x9be7ff,
        transparent: true,
        opacity: 0.9
      });
      var oDot = new THREE.Mesh(dotGeom, dotMat);
      oDot.userData = {
        angle: (k / 12) * Math.PI * 2,
        radius: 2.05 + Math.random() * 0.15,
        speed: 0.15 + Math.random() * 0.25,
        tilt: (Math.random() - 0.5) * 0.6
      };
      orbitGroup.add(oDot);
      orbitDots.push(oDot);
    }

    function layoutGlobe() {
      if (window.innerWidth < 1024) {
        globeGroup.position.set(0, -0.4, 0);
        globeGroup.scale.setScalar(window.innerWidth < 600 ? 0.75 : 0.9);
      } else {
        globeGroup.position.set(2.6, 0.1, 0);
        globeGroup.scale.setScalar(1);
      }
    }
    layoutGlobe();

    var pointerX = 0, pointerY = 0;
    var camX = 0, camY = 0;

    document.addEventListener('mousemove', function (e) {
      pointerX = (e.clientX / window.innerWidth)  - 0.5;
      pointerY = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    var heroEl = document.querySelector('.hero-3d');
    var scrollPct = 0;

    function updateScroll() {
      if (!heroEl) return;
      var h = heroEl.offsetHeight || window.innerHeight;
      scrollPct = Math.min(window.scrollY / h, 1.5);
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    function onResize() {
      var w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      layoutGlobe();
    }
    window.addEventListener('resize', onResize);

    var clock = new THREE.Clock();
    var running = true;
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) clock.start();
    });

    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      var t = clock.getElapsedTime();

      camX += (pointerX * 0.6 - camX) * 0.05;
      camY += (-pointerY * 0.4 - camY) * 0.05;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.position.z = 7 + scrollPct * 5;
      camera.lookAt(0, 0, 0);

      stars.rotation.y = t * 0.012;
      stars.rotation.x = t * 0.006;
      nearStars.rotation.y = -t * 0.02 + pointerX * 0.15;
      nearStars.rotation.x = pointerY * 0.1;

      globeGroup.rotation.y = t * 0.12 + pointerX * 0.5;
      globeGroup.rotation.x = pointerY * 0.25;
      wireGlobe.scale.setScalar(1 + Math.sin(t * 0.9) * 0.012);
      halo.material.opacity = 0.05 + Math.sin(t * 1.4) * 0.025;
      goldRing.rotation.z += 0.0018;

      orbitDots.forEach(function (d) {
        d.userData.angle += d.userData.speed * 0.01;
        d.position.x = Math.cos(d.userData.angle) * d.userData.radius;
        d.position.z = Math.sin(d.userData.angle) * d.userData.radius;
        d.position.y = Math.sin(d.userData.angle * 0.7 + d.userData.tilt) * 0.5;
      });

      var fade = Math.max(0, 1 - scrollPct * 1.1);
      var baseScale = window.innerWidth < 1024 ? (window.innerWidth < 600 ? 0.75 : 0.9) : 1;
      globeGroup.scale.setScalar(baseScale * (0.6 + fade * 0.4));
      lineMat.opacity  = 0.55 * fade;
      innerMat.opacity = 0.65 * fade;
      ringMat.opacity  = 0.4  * fade;
      orbitDots.forEach(function (d) { d.material.opacity = 0.9 * fade; });

      renderer.render(scene, camera);
    }
    tick();
  }

  /* ── 14. Init ────────────────────────────────────────── */
  function init() {
    prepHeroH1();
    runReveal();
    runCounters();
    bindTilt();
    bindMagnetic();
    bindSectorSpotlight();
    buildScene();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── 15. Contact form Formspree success ──────────────── */
  if (/[?&]submitted=1/.test(window.location.search)) {
    document.addEventListener('DOMContentLoaded', function () {
      var formSuccess = document.getElementById('form-success');
      var cf = document.getElementById('contact-form');
      if (formSuccess) {
        formSuccess.classList.add('visible');
        if (cf) cf.style.display = 'none';
        try { formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    });
  }

})();
