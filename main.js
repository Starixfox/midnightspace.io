/* ============================================================
 MIDNIGHT SPACE — main.js
 Shared JS: nav, theme toggle, mobile menu, scroll FX
 ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
 // ── Scroll reveal ───────────────────────────────────────────
 const revealEls = document.querySelectorAll('.reveal');
 if ('IntersectionObserver' in window && revealEls.length > 0) {
  const observer = new IntersectionObserver(
   entries => {
    entries.forEach(entry => {
     if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
     }
    });
   },
   { threshold: 0.12 }
  );
  revealEls.forEach(el => observer.observe(el));
 } else {
  revealEls.forEach(el => el.classList.add('visible'));
 }

 // ── Starfield background ───────────────────────────────────
 initStarfield();

 // ── Mobile menu ────────────────────────────────────────────
 const hamburger = document.querySelector('.hamburger');
 const mobileMenu = document.getElementById('mobile-menu');
 if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
   const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
   hamburger.setAttribute('aria-expanded', String(!isOpen));
   hamburger.classList.toggle('is-open', !isOpen);
   mobileMenu.classList.toggle('is-open', !isOpen);
  });
 }

 // ── Count-up animation ─────────────────────────────────────
 initCountUp();
});

function initStarfield() {
 const canvas = document.getElementById('starfield-canvas');
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width, height, stars;

 function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  const count = Math.floor((width * height) / 8000);
  stars = Array.from({ length: count }, () => ({
   x: Math.random() * width,
   y: Math.random() * height,
   r: Math.random() * 1.2 + 0.3,
   twinkle: Math.random() * Math.PI * 2
  }));
 }

 function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  stars.forEach(s => {
   const alpha = 0.3 + 0.3 * Math.sin(s.twinkle);
   ctx.globalAlpha = alpha;
   ctx.beginPath();
   ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
   ctx.fill();
   s.twinkle += 0.02;
  });
  ctx.globalAlpha = 1;
 }

 function loop() {
  if (prefersReducedMotion) {
   draw();
   return;
  }
  draw();
  requestAnimationFrame(loop);
 }

 resize();
 loop();
 window.addEventListener('resize', resize);
}

function initCountUp() {
 const els = document.querySelectorAll('[data-countup]');
 if (!els.length) return;
 const duration = 900;
 els.forEach(el => {
  const target = Number(el.getAttribute('data-target'));
  if (!Number.isFinite(target)) return;
  const isCurrency = el.textContent.trim().startsWith('$');
  const start = performance.now();
  const initialText = el.textContent.trim();

  function tick(now) {
   const progress = Math.min(1, (now - start) / duration);
   const value = Math.floor(target * progress);
   if (isCurrency) {
    if (target >= 1_000_000_000) {
     el.textContent = '$' + (target / 1_000_000_000 * progress).toFixed(1) + 'B';
    } else {
     el.textContent = '$' + value.toLocaleString();
    }
   } else {
    el.textContent = value.toLocaleString();
   }
   if (progress < 1) requestAnimationFrame(tick);
   else el.textContent = initialText;
  }
  requestAnimationFrame(tick);
 });
}
