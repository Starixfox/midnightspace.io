/* ============================================================
   MIDNIGHT SPACE — main.js
   Shared JS: nav, mobile menu, scroll FX, starfield
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Improved Scroll Reveal
    const revealEls = document.querySelectorAll('[data-reveal], .reveal');
    if ('IntersectionObserver' in window && revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible', 'visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        
        revealEls.forEach(el => revealObserver.observe(el));
    }

    // 2. Count-up Numbers for Stats
    const countEls = document.querySelectorAll('.stat-number');
    if ('IntersectionObserver' in window && countEls.length > 0) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endText = target.innerText.replace(/[^0-9.]/g, '');
                    const end = parseFloat(endText);
                    if (!isNaN(end)) {
                        animateCount(target, 0, end, 2000);
                    }
                    countObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        countEls.forEach(el => countObserver.observe(el));
    }

    // 3. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!isOpen));
            hamburger.classList.toggle('is-open');
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open');
        });
    }

    // 4. Starfield Background
    initStarfield();
});

function animateCount(el, start, end, duration) {
    let startTimestamp = null;
    const finalSymbol = el.innerText.includes('+') ? '+' : '';
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        el.innerText = current.toLocaleString() + finalSymbol;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function setCanvasSize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create stars
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.5,
            velocity: Math.random() * 0.05 + 0.02
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y -= star.velocity;
            if (star.y < 0) star.y = h;
        });
        requestAnimationFrame(draw);
    }
    draw();
}
