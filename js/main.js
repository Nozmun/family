/* =============================================================
   ZATZ PARTNERS — Main JS
   ============================================================= */

/* --- Loader --------------------------------------------------- */
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader?.classList.add('done'), 1500);
});

/* --- Custom Cursor (desktop only) ----------------------------- */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-follower');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function follow() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll('a, button, select, .mtag').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
  });
}

/* --- Navigation scroll state ---------------------------------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 48);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* --- Mobile menu ---------------------------------------------- */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
});

/* --- Hero staggered entrance ---------------------------------- */
function initHero() {
  const heroBg = document.querySelector('.hero__bg-img');
  if (heroBg) requestAnimationFrame(() => heroBg.classList.add('is-loaded'));

  const schedule = [
    ['.hero__eyebrow',   200],
    ['.hero__line:nth-child(1)', 320],
    ['.hero__line:nth-child(2)', 460],
    ['.hero__line:nth-child(3)', 590],
    ['.hero__sub',       760],
    ['.hero__cta-row',   920],
    ['#hero-search',    1080],
  ];

  schedule.forEach(([sel, delay]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    setTimeout(() => el.classList.add('is-in'), delay);
  });
}
initHero();

/* --- Scroll-reveal (IntersectionObserver) --------------------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseFloat(entry.target.dataset.delay || 0) * 1000;
    setTimeout(() => entry.target.classList.add('is-revealed'), delay);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

/* --- Counter animation ---------------------------------------- */
function runCounter(el) {
  const end      = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const t0       = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * end);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = end;
  };
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.counter').forEach(runCounter);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.25 });

document.querySelectorAll('.stats, .about__badge').forEach(el => counterObs.observe(el));

/* --- Parallax (subtle, on elements with data-parallax) -------- */
const parallaxPairs = [
  { el: document.querySelector('.about__img'),          speed: 0.12 },
  { el: document.querySelector('.international__bg'),   speed: 0.18 },
  { el: document.querySelector('.hero__bg-img'),        speed: 0.25 },
].filter(p => p.el);

function applyParallax() {
  parallaxPairs.forEach(({ el, speed }) => {
    const section = el.closest('section') || el.parentElement;
    const rect    = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const mid    = rect.top + rect.height / 2 - window.innerHeight / 2;
    el.style.transform = `translateY(${mid * speed}px)`;
  });
}
window.addEventListener('scroll', applyParallax, { passive: true });
applyParallax();

/* --- Card tilt (subtle 3-D on service cards) ------------------ */
document.querySelectorAll('.s-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 7;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 7;
    card.style.transform = `perspective(900px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* --- Marquee pause on hover ----------------------------------- */
const marqueeRow = document.querySelector('.marquee__row');
marqueeRow?.closest('.marquee')?.addEventListener('mouseenter', () => {
  marqueeRow.style.animationPlayState = 'paused';
});
marqueeRow?.closest('.marquee')?.addEventListener('mouseleave', () => {
  marqueeRow.style.animationPlayState = '';
});

/* --- Smooth anchor scroll for hash links ---------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
