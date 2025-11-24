// script.js - Completed interactions & animations for Putri Arum Silviana portfolio

/* ========== Utilities ========== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Respect reduced motion preference */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== Typing animation (Hero) ========== */
const typingTexts = [
  "Passionate Web Developer.",
  "UI/UX Enthusiast.",
  "Digital Solution Explorer."
];
const typingEl = $('#typingText');
const cursorEl = $('#heroCursor');

let ti = 0, ci = 0;
const typingSpeed = 60, erasingSpeed = 30, betweenDelay = 1000;

function startTyping() {
  if (!typingEl || prefersReduced) {
    // If reduced motion, just show first text
    if (typingEl) typingEl.textContent = typingTexts[0];
    if (cursorEl) cursorEl.style.display = 'none';
    return;
  }

  function type() {
    const current = typingTexts[ti];
    if (ci < current.length) {
      typingEl.textContent += current.charAt(ci);
      ci++;
      setTimeout(type, typingSpeed + Math.random() * 25);
    } else {
      setTimeout(erase, betweenDelay + 200);
    }
  }
  function erase() {
    const current = typingTexts[ti];
    if (ci > 0) {
      typingEl.textContent = current.substring(0, ci - 1);
      ci--;
      setTimeout(erase, erasingSpeed + Math.random() * 12);
    } else {
      ti = (ti + 1) % typingTexts.length;
      setTimeout(type, 420);
    }
  }

  setTimeout(type, 700);
}

/* ========== Intersection-based reveal & progress animation ========== */
const revealEls = $$('[data-reveal]');
const progressEls = $$('.progress');
const timelineItems = $$('.timeline-item');

// IntersectionObserver options
const revealOpts = { root: null, rootMargin: '0px', threshold: 0.14 };
const progressOpts = { root: null, rootMargin: '0px', threshold: 0.18 };
const sectionObsOpts = { root: null, rootMargin: '0px', threshold: 0.5 };

function onReveal(entries, obs) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      obs.unobserve(entry.target);
    }
  });
}
function onProgress(entries, obs) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const bar = el.querySelector('span');
      const percent = parseInt(el.getAttribute('data-percent') || '0', 10);
      if (bar) {
        // Small stagger per element
        setTimeout(() => { bar.style.width = percent + '%'; }, 120);
      }
      obs.unobserve(el);
    }
  });
}

if (!prefersReduced && 'IntersectionObserver' in window) {
  const revealer = new IntersectionObserver(onReveal, revealOpts);
  revealEls.forEach(e => revealer.observe(e));

  const progObs = new IntersectionObserver(onProgress, progressOpts);
  progressEls.forEach(p => progObs.observe(p));

  const timelineObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('show');
        timelineObs.unobserve(en.target);
      }
    });
  }, progressOpts);
  timelineItems.forEach(t => timelineObs.observe(t));
} else {
  // Fallback: show everything immediately
  revealEls.forEach(e => e.classList.add('show'));
  timelineItems.forEach(t => t.classList.add('show'));
  progressEls.forEach(p => {
    const bar = p.querySelector('span');
    if (bar) bar.style.width = p.getAttribute('data-percent') + '%';
  });
}

/* ========== Simple tilt effect for project cards ========== */
const tiltEls = $$('[data-tilt]');
tiltEls.forEach(el => {
  // For reduced motion, skip tilt
  if (prefersReduced) return;
  let rect = null;
  el.addEventListener('mousemove', (ev) => {
    rect = rect || el.getBoundingClientRect();
    const px = (ev.clientX - rect.left) / rect.width;
    const py = (ev.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    rect = null;
  });
  // Touch devices: no tilt (avoid interfering)
});

/* ========== Navbar behavior: active link, smooth scroll, shrink on scroll, mobile menu ========== */
const navLinks = $$('nav.main-nav a');
const sections = navLinks.map(a => {
  const href = a.getAttribute('href');
  return href && href.startsWith('#') ? document.querySelector(href) : null;
}).filter(Boolean);

function smoothScrollTo(targetEl) {
  if (!targetEl) return;
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) smoothScrollTo(target);
      // close mobile nav if open
      closeMobileNav();
    }
  });
});

// Active link using IntersectionObserver
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, sectionObsOpts);
  sections.forEach(sec => sectionObserver.observe(sec));
} else {
  // Fallback: on scroll update
  window.addEventListener('scroll', () => {
    const pos = window.scrollY + (window.innerHeight * 0.35);
    sections.forEach((sec, i) => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (pos >= top && pos < bottom) {
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[i].classList.add('active');
      }
    });
  }, { passive: true });
}

// Shrink / elevate navbar on scroll
const navWrap = $('#navWrap');
function onNavbarScroll() {
  if (!navWrap) return;
  if (window.scrollY > 24) {
    navWrap.classList.add('scrolled');
  } else {
    navWrap.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', onNavbarScroll, { passive: true });

/* Mobile hamburger menu */
const hamburger = $('#hamburger');
const mainNav = $('nav.main-nav');

function openMobileNav() {
  if (!mainNav) return;
  // Toggle by setting inline style for small screens
  if (window.innerWidth < 980) {
    mainNav.style.display = 'block';
    mainNav.style.position = 'absolute';
    mainNav.style.right = '14px';
    mainNav.style.top = (navWrap.getBoundingClientRect().bottom + window.scrollY + 8) + 'px';
    mainNav.style.background = 'var(--glass)';
    mainNav.style.padding = '10px';
    mainNav.style.borderRadius = '10px';
    mainNav.style.boxShadow = 'var(--shadow-soft)';
    mainNav.style.zIndex = 120;
    mainNav.setAttribute('data-open', 'true');
    document.addEventListener('click', onDocClickCloseNav);
  }
}

function closeMobileNav() {
  if (!mainNav) return;
  mainNav.style.display = '';
  mainNav.style.position = '';
  mainNav.style.right = '';
  mainNav.style.top = '';
  mainNav.style.background = '';
  mainNav.style.padding = '';
  mainNav.style.borderRadius = '';
  mainNav.style.boxShadow = '';
  mainNav.style.zIndex = '';
  mainNav.removeAttribute('data-open');
  document.removeEventListener('click', onDocClickCloseNav);
}

function toggleMobileNav(e) {
  e.stopPropagation();
  if (!mainNav) return;
  if (mainNav.getAttribute('data-open') === 'true') closeMobileNav();
  else openMobileNav();
}
function onDocClickCloseNav(e) {
  if (!mainNav) return;
  if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) closeMobileNav();
}
if (hamburger) {
  hamburger.addEventListener('click', toggleMobileNav);
  // Show hamburger only on small screens (in case CSS didn't)
  function updateHamburgerVisibility() {
    if (window.innerWidth < 980) hamburger.style.display = 'inline-flex';
    else {
      hamburger.style.display = 'none';
      // ensure nav visible in desktop
      closeMobileNav();
    }
  }
  updateHamburgerVisibility();
  window.addEventListener('resize', updateHamburgerVisibility);
}

/* ========== Theme toggle (light/dark) with localStorage ======== */
const themeToggle = $('#themeToggle');
const root = document.documentElement;
const THEME_KEY = 'pa_theme_pref';

function applyTheme(theme) {
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  if (theme === 'dark') themeToggle && (themeToggle.innerHTML = '<i class="fa-regular fa-sun"></i>');
  else themeToggle && (themeToggle.innerHTML = '<i class="fa-regular fa-moon"></i>');
  if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}
(function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) applyTheme(stored);
  else {
    // follow system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/* ========== CTA and contact form handling ========== */
const downloadCVBtn = $('#downloadCVBtn');
if (downloadCVBtn) {
  downloadCVBtn.addEventListener('click', () => {
    // Replace with real CV file/link when ready
    const url = 'https://drive.google.com/file/d/PUTRI_ARUM_CV_ID/view';
    window.open(url, '_blank');
  });
}

const contactBtn = $('#contactBtn');
if (contactBtn) contactBtn.addEventListener('click', () => smoothScrollTo($('#contact')));

const contactForm = $('#contactForm') || $('#contactForm'); // ensure reference
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    // Basic validation
    if (!name || !email || !message) {
      showToast('Mohon lengkapi semua kolom sebelum mengirim.', { type: 'warning' });
      return;
    }

    // In real app: send to server or email API
    showToast('Terima kasih! Pesan Anda telah terkirim.', { type: 'success' });
    contactForm.reset();
  });
}

/* ========== Small toast helper ========== */
function showToast(text, { duration = 3500, type = 'info' } = {}) {
  const id = 'pa-toast';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    Object.assign(el.style, {
      position: 'fixed',
      right: '18px',
      bottom: '20px',
      zIndex: 9999,
      minWidth: '240px',
      padding: '10px 14px',
      borderRadius: '10px',
      color: '#06243b',
      fontWeight: 700,
      boxShadow: '0 8px 30px rgba(2,10,35,0.12)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.06)',
      transform: 'translateY(8px)',
      opacity: '0',
      transition: 'all .32s cubic-bezier(.2,.9,.3,1)'
    });
    document.body.appendChild(el);
  }
  el.textContent = text;
  // styling per type
  if (type === 'success') {
    el.style.background = 'linear-gradient(90deg, rgba(43,123,211,0.12), rgba(255,209,102,0.08))';
    el.style.color = '#082043';
  } else if (type === 'warning') {
    el.style.background = 'linear-gradient(90deg, rgba(255,209,102,0.12), rgba(43,123,211,0.04))';
    el.style.color = '#18232b';
  } else {
    el.style.background = 'linear-gradient(90deg, rgba(43,123,211,0.06), rgba(255,209,102,0.04))';
    el.style.color = '#082043';
  }

  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
  });
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.transform = 'translateY(8px)';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 320);
  }, duration);
}

/* ========== Accessibility: reduce motion adjustments already handled above ========== */

/* ========== Misc initializations ========== */
window.addEventListener('DOMContentLoaded', () => {
  startTyping();
  // set year in footer if present
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // initial reveal run (for browsers without IntersectionObserver it was handled above)
  if (!prefersReduced && 'IntersectionObserver' in window) {
    // no-op: IntersectionObserver will reveal items on scroll/load
  } else {
    // ensure any progress bars show
    progressEls.forEach(p => {
      const bar = p.querySelector('span');
      if (bar) bar.style.width = p.getAttribute('data-percent') + '%';
    });
  }
});

/* ========== Performance: throttle resize events ========== */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Close mobile nav if switching to desktop
    if (window.innerWidth >= 980) closeMobileNav();
  }, 120);
});

/* ========== End of script.js ========= */