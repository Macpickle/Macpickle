// ── Dark Mode ──
(function () {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var prefersDark = false;
    try { prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateToggleIcon(next);
}

function updateToggleIcon(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
}

// ── Mobile Menu ──
function toggleMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    var btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;
    var isOpen = menu.classList.contains('open');
    if (isOpen) {
        closeMobileMenu();
    } else {
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        btn.setAttribute('aria-label', 'Close menu');
    }
}

function closeMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    var btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', 'Open menu');
}

// Close mobile menu on resize to desktop
window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) closeMobileMenu();
}, { passive: true });

// ── Preloader ──
document.addEventListener('DOMContentLoaded', function () {
    var preloader = document.getElementById('preloader');
    var preloaderText = document.getElementById('preloader-text');
    var savedTheme = document.documentElement.getAttribute('data-theme');
    updateToggleIcon(savedTheme);

    if (typeof gsap === 'undefined') {
        if (preloader) preloader.style.display = 'none';
        initReveal();
        return;
    }

    gsap.set(preloaderText, { yPercent: 60, opacity: 0, scale: 0.9, filter: 'blur(6px)' });

    gsap.timeline({ delay: 0.2 })
        .to(preloaderText, {
            yPercent: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
            duration: 0.5, ease: 'back.out(1.5)'
        })
        .to(preloaderText, {
            yPercent: -60, opacity: 0, scale: 1.1, filter: 'blur(6px)',
            duration: 0.35, ease: 'back.in(1.2)'
        }, '+=0.6')
        .to(preloader, {
            yPercent: 100, duration: 0.5, ease: 'power3.inOut',
            onComplete: function () { preloader.style.display = 'none'; initReveal(); }
        }, '-=0.2');
});

// ── Scroll Reveal ──
function initReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (typeof gsap === 'undefined') {
        reveals.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
        return;
    }

    gsap.set(reveals, { y: 30, opacity: 0 });

    // Hero elements (immediate)
    var heroReveals = document.querySelectorAll('#about .reveal');
    heroReveals.forEach(function (el, i) {
        gsap.to(el, { y: 0, opacity: 1, duration: 0.8, delay: i * 0.15, ease: 'power2.out' });
    });

    // Scroll-triggered
    var scrollReveals = Array.from(reveals).filter(function (el) { return !el.closest('#about'); });
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    gsap.to(entry.target, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        scrollReveals.forEach(function (el) { observer.observe(el); });
    } else {
        // Fallback for no IntersectionObserver
        scrollReveals.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    }

    // Skill bars
    animateSkillBars();
}

// ── Skill Bar Animation ──
function animateSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-fill');
    if (!('IntersectionObserver' in window)) {
        bars.forEach(function (bar) { bar.style.width = bar.getAttribute('data-width'); });
        return;
    }
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var target = entry.target.getAttribute('data-width');
                entry.target.style.width = target;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    bars.forEach(function (bar) { observer.observe(bar); });
}

// ── Navbar shadow on scroll ──
window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('shadow-sm', window.scrollY > 50);
}, { passive: true });

// ── Close mobile menu on clicking a link (handled inline too, but backup) ──
document.addEventListener('click', function (e) {
    var link = e.target.closest('.mobile-menu-link');
    if (link) closeMobileMenu();
});

// ── Close mobile menu on Escape key ──
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
});
