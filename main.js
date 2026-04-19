/* ============================================================
   MIDNIGHT SPACE - main.js
   Shared JS: nav, theme toggle, mobile menu, form, scroll FX
   ============================================================ */
(function () {
  'use strict';

  const html = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = systemDark ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);

  function updateThemeToggleIcon(btn, theme) {
    if (!btn) return;
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    btn.innerHTML = theme === 'dark' ? '' : '';
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    updateThemeToggleIcon(btn, currentTheme);
    btn.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
        updateThemeToggleIcon(b, currentTheme);
      });
    });
  });

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

  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    window.addEventListener('scroll', function () {
      siteNav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

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
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

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

  /* Contact form uses NATIVE HTML submit to Formspree. No AJAX. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () { field.classList.remove('error'); });
    });
  }

  if (/[?&]submitted=1/.test(window.location.search)) {
    var formSuccess = document.getElementById('form-success');
    var cf = document.getElementById('contact-form');
    if (formSuccess) {
      formSuccess.classList.add('visible');
      if (cf) cf.style.display = 'none';
      try { formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  var style = document.createElement('style');
  style.textContent = '.form-input.error, .form-textarea.error { border-color: #ff6b6b; box-shadow: 0 0 0 3px rgba(255,107,107,0.15); }';
  document.head.appendChild(style);
})();
