/* Spoiler filter: censor-ink covers on [data-sp] blocks.
   Markup: <div class="sp" data-sp="1|2"><div class="sp__body">...</div></div>
   Level 1 blocks: click "wipe the ink". Level 2 blocks (twist/ending): press and hold. */
import { $, $$, t, on, lv, reduced, sfx } from './core.js';

const HOLD_MS = 1200;
const revealed = new Set(); // per-block reveals; cleared whenever the global level changes

function buildCover(el) {
  const need = Number(el.dataset.sp);
  const cover = document.createElement('div');
  cover.className = 'sp__cover';
  cover.innerHTML = `
    <span class="sp__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="sp__stamp" aria-hidden="true"></span>
    <span class="sp__tag"></span>
    ${need === 2
      ? `<button type="button" class="sp__btn sp__btn--hold"><span class="sp__ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="sp__ring-fill" cx="18" cy="18" r="15"/></svg><i class="sp__bullet"></i></span><span class="sp__btn-label"></span></button><span class="sp__hint"></span>`
      : `<button type="button" class="sp__btn"><span class="sp__btn-label"></span></button>`}`;
  el.appendChild(cover);
  const btn = $('.sp__btn', cover);
  if (need === 2) bindHold(btn, () => reveal(el));
  else btn.addEventListener('click', () => reveal(el));
}

function bindHold(btn, done) {
  let timer = null;
  const start = (e) => {
    if (timer || (e.type === 'keydown' && e.repeat)) return;
    if (e.type === 'keydown') e.preventDefault();
    btn.classList.add('is-holding');
    btn.style.setProperty('--hold', `${HOLD_MS}ms`);
    timer = setTimeout(() => { timer = null; btn.classList.remove('is-holding'); done(); }, HOLD_MS);
  };
  const stop = () => { clearTimeout(timer); timer = null; btn.classList.remove('is-holding'); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') start(e); });
  btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  btn.addEventListener('click', (e) => e.preventDefault()); // a plain click is not enough
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

function reveal(el) {
  revealed.add(el);
  sfx(Number(el.dataset.sp) === 2 ? 'freeze' : 'tick');
  el.classList.add('is-wiping');
  setTimeout(() => {
    el.classList.remove('is-wiping');
    render(el);
    const body = $('.sp__body', el);
    if (body) { body.setAttribute('tabindex', '-1'); body.focus({ preventScroll: true }); }
  }, reduced ? 0 : 520);
}

function render(el) {
  const need = Number(el.dataset.sp);
  const locked = lv() < need && !revealed.has(el);
  el.classList.toggle('is-locked', locked);
  el.dataset.need = String(need);
  const body = $('.sp__body', el);
  if (body) {
    body.inert = locked;
    body.setAttribute('aria-hidden', String(locked));
  }
  const cover = $('.sp__cover', el);
  if (!cover) return;
  cover.hidden = !locked;
  $('.sp__stamp', cover).textContent = t('censor.stamp');
  $('.sp__tag', cover).textContent = need === 2 ? t('censor.lv2') : t('censor.lv1');
  const btn = $('.sp__btn', cover);
  $('.sp__btn-label', btn).textContent = need === 2 ? t('censor.hold') : t('censor.reveal');
  btn.setAttribute('aria-label', need === 2 ? `${t('censor.hold')}. ${t('censor.holdHint')}` : t('censor.revealAria'));
  const hint = $('.sp__hint', cover);
  if (hint) hint.textContent = t('censor.locked');
}

/** Inline helper for JS-rendered text: returns html for text or a redaction bar. */
export function spText(text, need) {
  if (lv() >= need) return text;
  const len = Math.max(6, Math.min(28, Math.round(String(text).replace(/<[^>]+>/g, '').length / 2)));
  return `<span class="redact" style="--len:${len}ch"><span class="sr-only">${t('censor.redacted')}</span></span>`;
}

export function initSpoilers(root = document) {
  $$('[data-sp]', root).forEach((el) => { if (!$('.sp__cover', el)) buildCover(el); render(el); });
}

export function renderSpoilers(root = document) {
  $$('[data-sp]', root).forEach(render);
}

on('spoiler', () => { revealed.clear(); renderSpoilers(); });
on('lang', () => renderSpoilers());
