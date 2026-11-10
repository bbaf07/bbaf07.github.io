// Portfolio interactions: reveals, word highlight, pinned horizontal work scroll,
// method ring, mobile menu. Everything degrades to a readable static page.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => document.body.classList.add('loaded'));

  /* reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('in'));

  /* mobile menu */
  const btn = document.querySelector('[data-menu]');
  const panel = document.querySelector('[data-menu-panel]');
  if (btn && panel) {
    const label = btn.textContent;
    const set = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? (document.documentElement.lang === 'fr' ? 'Fermer' : 'Close') : label; };
    btn.addEventListener('click', () => set(panel.hidden));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
  }

  /* statement: words light up as you scroll */
  const body = document.querySelector('[data-words]');
  let words = [];
  if (body && !reduce) {
    const parts = body.textContent.trim().split(/\s+/);
    body.textContent = '';
    parts.forEach((w, k) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      body.append(s);
      if (k < parts.length - 1) body.append(' ');
    });
    words = [...body.querySelectorAll('.w')];
  }

  /* pinned horizontal scroll for the work section (wide screens only) */
  const hs = document.querySelector('[data-hscroll]');
  const track = hs && hs.querySelector('[data-track]');
  const wide = matchMedia('(min-width: 1000px) and (min-height: 600px)');
  let hsOn = false;
  const setupHS = () => {
    hsOn = !!(hs && track && wide.matches && !reduce);
    root.classList.toggle('hs-on', hsOn);
    if (!hsOn) { if (hs) hs.style.height = ''; if (track) track.style.transform = ''; return; }
    const dist = Math.max(0, track.scrollWidth - track.clientWidth);
    hs.style.height = `${window.innerHeight + dist}px`;
    hs.dataset.dist = dist;
  };

  /* method: active step drives the ring */
  const steps = [...document.querySelectorAll('[data-step]')];
  const dots = [...document.querySelectorAll('[data-dot]')];
  const prog = document.querySelector('.ring-progress');
  const count = document.querySelector('[data-count]');
  const setStep = (i) => {
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k <= i));
    if (prog) prog.style.strokeDashoffset = String(100 - ((i + 1) / Math.max(steps.length, 1)) * 100);
    if (count) count.textContent = String(i + 1).padStart(2, '0');
  };
  if (steps.length) setStep(0);

  /* nav: highlight the section in view */
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const onScroll = () => {
    const vh = window.innerHeight;
    if (words.length) {
      const r = body.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, k) => w.classList.toggle('lit', k < n));
    }
    if (hsOn) {
      const r = hs.getBoundingClientRect();
      const dist = +hs.dataset.dist || 0;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    }
    if (steps.length) {
      let best = 0, bestD = Infinity;
      steps.forEach((s, k) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bestD) { bestD = d; best = k; } });
      setStep(best);
    }
    let cur = -1;
    sections.forEach((s, k) => { if (s.getBoundingClientRect().top < vh * 0.4) cur = k; });
    links.forEach((a, k) => a.classList.toggle('active', k === cur));
  };

  let ticking = false;
  const tick = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } };
  setupHS(); onScroll();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', () => { setupHS(); onScroll(); });
  wide.addEventListener?.('change', () => { setupHS(); onScroll(); });
  window.addEventListener('load', () => { setupHS(); onScroll(); });
})();
