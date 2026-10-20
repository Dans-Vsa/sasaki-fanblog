/* Visual effects: intro, reveal-on-scroll, panel shatter, bullet holes + shockwave on click. */
import { $, $$, reduced, sfx, t } from './core.js';

/* ---------- reveals & shatter transitions ---------- */
export function initReveals(root = document) {
  const els = $$('.reveal, .shatter', root).filter((el) => !el.dataset.watched);
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  els.forEach((el) => { el.dataset.watched = '1'; io.observe(el); });
}

/* ---------- bullet holes + shockwave ---------- */
const MAX_HOLES = 12;
export function initHoles() {
  const layer = document.createElement('div');
  layer.className = 'holes';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('input, textarea, select, iframe, dialog, .lb, .cmp, .no-holes')) return;
    const x = e.pageX, y = e.pageY;
    const hole = document.createElement('i');
    hole.className = 'hole';
    hole.style.cssText = `left:${x}px;top:${y}px;--r:${Math.round(Math.random() * 360)}deg`;
    layer.appendChild(hole);
    if (!reduced) {
      const ring = document.createElement('i');
      ring.className = 'ripple';
      ring.style.cssText = `left:${x}px;top:${y}px`;
      layer.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove());
    }
    sfx('thud');
    setTimeout(() => hole.classList.add('is-fading'), 6000);
    setTimeout(() => hole.remove(), 7000);
    const holes = $$('.hole', layer);
    if (holes.length > MAX_HOLES) holes[0].remove();
  });
}

/* ---------- intro: frame counter, shot, split ---------- */
export function runIntro() {
  const intro = $('#intro');
  if (!intro) return Promise.resolve();
  let seen = false;
  try { seen = sessionStorage.getItem('sasaki-intro') === '1'; } catch { /* ignore */ }
  if (reduced || seen) { intro.remove(); return Promise.resolve(); }
  try { sessionStorage.setItem('sasaki-intro', '1'); } catch { /* ignore */ }

  document.documentElement.classList.add('intro-on');
  $('.intro__line', intro).textContent = t('intro.line');
  $('.intro__skip', intro).textContent = t('intro.skip');
  const counter = $('.intro__frame', intro);
  return new Promise((resolve) => {
    let raf, done = false;
    const start = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      intro.classList.add('is-out');
      document.documentElement.classList.remove('intro-on');
      setTimeout(() => { intro.remove(); resolve(); }, 900);
    };
    const tick = (now) => {
      const el = now - start;
      counter.textContent = String(Math.min(24, Math.floor(el / 60))).padStart(4, '0');
      if (el > 1500 && !intro.classList.contains('is-shot')) { intro.classList.add('is-shot'); sfx('shot'); }
      if (el > 2300) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    $('.intro__skip', intro).addEventListener('click', finish);
    addEventListener('keydown', function k(e) { if (e.key === 'Escape') { removeEventListener('keydown', k); finish(); } });
  });
}
