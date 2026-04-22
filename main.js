/* ============================================================
   MIDNIGHT SPACE - main.js
   Shared JS: nav, mobile menu, scroll fx, fade-in animations
   ============================================================ */
(function () {
  'use strict';

  /* ── Navbar scroll effect ─────────────────────────────── */
  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    window.addEventListener('scroll', function () {
      siteNav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ── Active nav link highlight ────────────────────────── */
  (function highlightNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
      var href = a.getAttribute('href');
      var isHome = (page === '' || page === 'index.html') && (href === 'index.html' || href === './');
      var isMatch = href === page;
      if (isHome || isMatch) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ── Mobile hamburger menu ────────────────────────────── */
  var hamburger = document.querySelector('.hamburger');
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

  /* ── Smooth scroll for anchor links ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Intersection Observer — fade-in animations ────────
     Handles: .fade-in  .fade-in-left  .fade-in-right  .reveal
     All elements start at opacity:0 in CSS and become visible
     when the observer adds the .visible class.
  ────────────────────────────────────────────────────────── */
  var ANIM_SELECTOR = '.fade-in, .fade-in-left, .fade-in-right, .reveal';

  function runObserver() {
    var elements = document.querySelectorAll(ANIM_SELECTOR);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      /* Fallback: just show everything immediately */
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
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* Run observer after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runObserver);
  } else {
    runObserver();
  }

  /* ── Contact form: Formspree success message ─────────── */
  if (/[?&]submitted=1/.test(window.location.search)) {
    var formSuccess = document.getElementById('form-success');
    var cf = document.getElementById('contact-form');
    if (formSuccess) {
      formSuccess.classList.add('visible');
      if (cf) cf.style.display = 'none';
      try { formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
  }

})();
