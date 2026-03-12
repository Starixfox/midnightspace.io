/* ============================================================
   MIDNIGHT SPACE — main.js
   Shared JS: nav, theme toggle, mobile menu, form, scroll FX
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Theme toggle ────────────────────────────────────── */
  const html = document.documentElement;

  // Detect system preference and init
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = systemDark ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);

  function updateThemeToggleIcon(btn, theme) {
    if (!btn) return;
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    btn.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
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

  /* ── 2. Active nav link highlight ──────────────────────── */
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

  /* ── 3. Nav scroll shadow ───────────────────────────────── */
  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    window.addEventListener('scroll', function () {
      siteNav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ── 4. Hamburger / mobile menu ─────────────────────────── */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.classList.toggle('open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on nav link click
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 5. Smooth scroll for in-page anchors ───────────────── */
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

  /* ── 6. Contact form handler ────────────────────────────── */
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var name = contactForm.querySelector('[name="name"]');
      var email = contactForm.querySelector('[name="email"]');
      var valid = true;

      [name, email].forEach(function (field) {
        if (!field || !field.value.trim()) {
          field && field.classList.add('error');
          valid = false;
        } else {
          field && field.classList.remove('error');
        }
      });

      if (!valid) return;

      // Show success state
      contactForm.style.display = 'none';
      formSuccess.classList.add('visible');

      // Scroll to success
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Remove error class on input
    contactForm.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
      });
    });
  }

  /* ── 7. Intersection observer — reveal on scroll ────────── */
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

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── 8. Add error style for invalid form fields ─────────── */
  var style = document.createElement('style');
  style.textContent = '.form-input.error, .form-textarea.error { border-color: #ff6b6b; box-shadow: 0 0 0 3px rgba(255,107,107,0.15); }';
  document.head.appendChild(style);

})();
