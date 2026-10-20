/* Core: helpers, i18n (JSON), spoiler level, sound. Shared by every page. */

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(pointer: fine)').matches;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ---------- tiny event bus ---------- */
const listeners = {};
export const on = (ev, fn) => (listeners[ev] ||= []).push(fn);
const emit = (ev, ...a) => (listeners[ev] || []).forEach((fn) => fn(...a));

/* ---------- i18n ---------- */
const LANGS = ['id', 'en'];
const cache = {};
let dict = {};
export let lang = 'id';

function detectLang() {
  const saved = store.get('sasaki-lang', null);
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase());
  return nav.some((l) => l.startsWith('id') || l.startsWith('ms')) ? 'id' : 'en';
}

async function load(l) {
  if (!cache[l]) cache[l] = fetch(`i18n/${l}.json`).then((r) => { if (!r.ok) throw new Error(`i18n ${l}: ${r.status}`); return r.json(); });
  return cache[l];
}

/** t('a.b.0.c') walks the current dictionary; returns '' if missing. */
export function t(key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict) ?? '';
}

/** Fill every [data-i18n] (innerHTML) and [data-i18n-attr="attr:key;attr:key"]. */
export function applyDom(root = document) {
  $$('[data-i18n]', root).forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  $$('[data-i18n-attr]', root).forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
}

export async function setLang(l) {
  lang = LANGS.includes(l) ? l : 'id';
  dict = await load(lang);
  load(lang === 'id' ? 'en' : 'id').catch(() => {}); // warm the other language
  document.documentElement.lang = lang;
  store.set('sasaki-lang', lang);
  const wiki = document.body.dataset.page === 'wiki';
  document.title = t(wiki ? 'meta.wikiTitle' : 'meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(wiki ? 'meta.wikiDesc' : 'meta.desc'));
  applyDom();
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  emit('lang', lang);
}

export const initLang = () => setLang(detectLang());

/* ---------- spoiler level: 0 none, 1 light, 2 full. -1 = not chosen yet ---------- */
export let level = Number(store.get('sasaki-spoiler', -1));
export const spoilerChosen = () => level >= 0;
export const lv = () => Math.max(0, level);

export function setLevel(n) {
  level = clamp(Number(n), 0, 2);
  store.set('sasaki-spoiler', level);
  document.body.dataset.spoiler = String(level);
  emit('spoiler', level);
}

/* ---------- sound (WebAudio synth, default off) ---------- */
let ctx = null;
export let soundOn = store.get('sasaki-sound', '0') === '1';

export function setSound(onState) {
  soundOn = !!onState;
  store.set('sasaki-sound', soundOn ? '1' : '0');
  if (soundOn && !ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  emit('sound', soundOn);
}

function noiseBuffer(sec) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
  return buf;
}

/** sfx('shot' | 'tick' | 'freeze' | 'thud') */
export function sfx(kind) {
  if (!soundOn || !ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.connect(ctx.destination);
  if (kind === 'shot' || kind === 'thud') {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(kind === 'shot' ? 0.35 : 0.12);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = kind === 'shot' ? 2400 : 900;
    out.gain.setValueAtTime(kind === 'shot' ? 0.5 : 0.25, now);
    src.connect(f).connect(out); src.start(now);
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    o.connect(g).connect(ctx.destination); o.start(now); o.stop(now + 0.3);
  } else if (kind === 'tick') {
    const o = ctx.createOscillator();
    o.type = 'square'; o.frequency.value = 1800;
    out.gain.setValueAtTime(0.04, now); out.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    o.connect(out); o.start(now); o.stop(now + 0.05);
  } else if (kind === 'freeze') {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(1.4);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(3000, now); f.frequency.exponentialRampToValueAtTime(120, now + 1.3);
    out.gain.setValueAtTime(0.35, now);
    src.connect(f).connect(out); src.start(now);
  }
}

/* ---------- misc ---------- */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Run fn once when el enters the viewport. */
export function onceVisible(el, fn, rootMargin = '200px') {
  if (!('IntersectionObserver' in window)) return fn();
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin });
  io.observe(el);
}
