/* ========================================================
   MIDNIGHT SPACE — script.js
   Scroll animations, navbar, hamburger, smooth scroll
   ======================================================== */

/* ── Intersection Observer — Fade-in animations ────────── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right')
  .forEach(el => fadeObserver.observe(el));

/* ── Navbar scroll effect ──────────────────────────────── */
const nav = document.querySelector('.site-nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
}, { passive: true });

/* ── Mobile hamburger toggle ───────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu?.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  // Animate hamburger spans
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile menu when a link is clicked
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    const spans = hamburger?.querySelectorAll('span');
    if (spans) {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
});

/* ── Smooth scroll for anchor links ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Active nav link highlighter ───────────────────────── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── Contact form validation ─────────────────────────────
   (present on contact.html but harmless on other pages)   */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name    = this.elements['name']?.value.trim();
    const email   = this.elements['email']?.value.trim();
    const message = this.elements['message']?.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      showFormMsg('Please fill in all required fields.', false);
      return;
    }
    if (!emailRe.test(email)) {
      showFormMsg('Please enter a valid email address.', false);
      return;
    }

    // Success state
    showFormMsg('Message received — we will be in touch shortly.', true);
    this.reset();
  });
}

function showFormMsg(msg, success) {
  let el = document.getElementById('form-msg');
  if (!el) {
    el = document.createElement('p');
    el.id = 'form-msg';
    el.style.cssText = 'margin-top:1rem;font-size:0.9rem;padding:0.75rem 1rem;border-radius:8px;font-weight:500;';
    contactForm.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = success
    ? 'rgba(0,200,100,0.1)' : 'rgba(255,59,59,0.1)';
  el.style.color  = success ? '#00c864' : '#ff5959';
  el.style.border = success
    ? '1px solid rgba(0,200,100,0.3)' : '1px solid rgba(255,59,59,0.3)';
}
