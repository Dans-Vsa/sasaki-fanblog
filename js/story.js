/* Story page: renders data-driven sections and runs the scroll story. */
import { $, $$, t, on, lv, reduced, clamp, sfx, esc } from './core.js';
import { spText, initSpoilers } from './spoiler.js';
import { initReveals } from './fx.js';
import { IMG, VIDEOS, CHARS, COVERS, PANELS, GALLERY, LINKS, WORLD } from './data.js';
import { openLightbox, registerSet } from './lightbox.js';

const CREDIT_ANIME = '© 藤本タツキ／集英社・「藤本タツキ 17-26」製作委員会';
const CREDIT_MANGA = '© Tatsuki Fujimoto / Shueisha';
const abs = (f) => new URL(IMG + f, location.href).href; // for url() inside custom properties

/* =========================================================
   Render (re-run on language / spoiler change)
   ========================================================= */
function renderAll() {
  renderHeroMeta();
  renderCards();
  renderRelations();
  renderTabs();
  renderManga();
  renderAnime();
  renderTimeline();
  renderWorld();
  renderRail();
  renderCaps();
  registerSets();
  initSpoilers();
  initReveals();
}

function renderHeroMeta() {
  $('#heroMeta').innerHTML = t('hero.meta').map((m) => `<li>${esc(m)}</li>`).join('');
}

/* ---------- characters ---------- */
let openChar = null;
function factList(facts) {
  return facts.map((f) => `<li class="${lv() < f.sp ? 'is-red' : ''}">${spText(esc(f.t), f.sp)}</li>`).join('');
}

function renderCards() {
  const flipped = new Set($$('.card.is-flipped').map((c) => c.dataset.id));
  $('#cards').innerHTML = t('chars').map((c, i) => {
    const d = CHARS[c.id];
    return `
    <li class="card reveal ${flipped.has(c.id) ? 'is-flipped' : ''}" data-id="${c.id}" style="--d:${i * 90}ms">
      <div class="card__inner">
        <div class="card__face card__front" style="--bg:url('${abs(d.bg)}')">
          <img class="card__img" src="${IMG}${d.img}" width="825" height="1100" loading="lazy" decoding="async" alt="${esc(c.name)}">
          <div class="card__id">
            <span class="card__no">No. 0${i + 1}</span>
            <h3 class="card__name">${esc(c.name)}</h3>
            <p class="card__jp" lang="ja">${d.jp}</p>
            <p class="card__role">${esc(c.role)}</p>
          </div>
        </div>
        <div class="card__face card__back">
          <img class="card__icon" src="${IMG}${d.icon}" width="90" height="90" loading="lazy" alt="">
          <p class="card__front-txt">${esc(c.front)}</p>
          <ul class="facts">${factList(c.facts.slice(0, 3))}</ul>
          <p class="card__cv"><span>${t('cast.cv')}</span> <span lang="ja">${d.cv[0]}</span> · ${d.cv[1]}</p>
          <button type="button" class="btn-ghost btn-ghost--sm card__more" data-char="${c.id}">${t('cast.more')}</button>
        </div>
      </div>
      <button type="button" class="card__flip" aria-pressed="${flipped.has(c.id)}" aria-label="${esc(t('cast.flip'))}: ${esc(c.name)}">↻</button>
    </li>`;
  }).join('');
  if (openChar) fillCharDialog(openChar);
}

function fillCharDialog(id) {
  const c = t('chars').find((x) => x.id === id);
  const d = CHARS[id];
  $('#charDlg').innerHTML = `
    <div class="char-dlg__card">
      <div class="char-dlg__art" style="--bg:url('${abs(d.bg)}')"><img src="${IMG}${d.img}" width="825" height="1100" alt="${esc(c.name)}"></div>
      <div class="char-dlg__body">
        <p class="eyebrow">${esc(c.role)}</p>
        <h3 class="h2" id="charDlgTitle">${esc(c.name)} <span lang="ja" class="char-dlg__jp">${d.jp}</span></h3>
        <p>${esc(c.front)}</p>
        <ul class="facts facts--lg">${factList(c.facts)}</ul>
        <dl class="kv kv--sm">
          <div><dt>${t('cast.cv')}</dt><dd><span lang="ja">${d.cv[0]}</span> (${d.cv[1]})</dd></div>
          <div><dt>${t('cast.cvEn')}</dt><dd>${d.cvEn}</dd></div>
        </dl>
        <p class="small muted">${CREDIT_ANIME}</p>
        <form method="dialog"><button class="btn-ghost btn-ghost--sm" autofocus>${t('cast.close')}</button></form>
      </div>
    </div>`;
}

function bindCards() {
  const dlg = $('#charDlg');
  $('#cards').addEventListener('click', (e) => {
    const more = e.target.closest('.card__more');
    if (more) { openChar = more.dataset.char; fillCharDialog(openChar); dlg.showModal(); sfx('tick'); return; }
    const card = e.target.closest('.card');
    if (!card) return;
    const flipBtn = $('.card__flip', card);
    const on = !card.classList.contains('is-flipped');
    card.classList.toggle('is-flipped', on);
    flipBtn.setAttribute('aria-pressed', String(on));
  });
  dlg.addEventListener('close', () => { openChar = null; });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click
}

/* ---------- relationship map ---------- */
const NODES = { kawaguchi: [50, 15], sasaki: [16, 66], kuwano: [84, 66] };
function renderRelations() {
  const chars = Object.fromEntries(t('chars').map((c) => [c.id, c]));
  let paths = '', labels = '';
  t('rel').forEach((r, i) => {
    const [x1, y1] = NODES[r.from], [x2, y2] = NODES[r.to];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const k = 9; // curve offset: reversed pairs bow to opposite sides
    const cx = mx - (dy / len) * k, cy = my + (dx / len) * k;
    const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
    const locked = lv() < r.sp;
    paths += `<path class="rel__edge ${locked ? 'is-locked' : ''} rel__edge--${r.sp}" d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" marker-end="url(#arrow${locked ? 'L' : ''})"/>`;
    labels += `<span class="rel__label ${locked ? 'is-locked' : ''}" style="left:${lx}%;top:${(ly / 80) * 100}%">${spText(esc(r.t), r.sp)}</span>`;
  });
  const nodes = Object.entries(NODES).map(([id, [x, y]]) => `
    <button type="button" class="rel__node" style="left:${x}%;top:${(y / 80) * 100}%" data-char="${id}">
      <img src="${IMG}${CHARS[id].icon}" width="90" height="90" alt="" loading="lazy"><span>${esc(chars[id].name)}</span>
    </button>`).join('');
  $('#relMap').innerHTML = `
    <svg viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker>
        <marker id="arrowL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker>
      </defs>${paths}</svg>${labels}${nodes}`;
}

function bindRelations() {
  $('#relMap').addEventListener('click', (e) => {
    const n = e.target.closest('.rel__node');
    if (!n) return;
    openChar = n.dataset.char; fillCharDialog(openChar); $('#charDlg').showModal();
  });
}

/* ---------- trailer player ---------- */
let vidIndex = 0, playing = false, tcTimer = null;
function renderTabs() {
  $('.player__tabs').innerHTML = t('trailer.tabs').map((name, i) =>
    `<button type="button" role="tab" class="ptab" aria-selected="${i === vidIndex}" data-i="${i}">${esc(name)}</button>`).join('');
  setPoster();
}
function setPoster() {
  const v = VIDEOS[vidIndex];
  const img = $('.player__poster');
  img.src = IMG + v.thumbSm;
  img.srcset = `${IMG}${v.thumbSm} 800w, ${IMG}${v.thumb} 1280w`;
  img.sizes = '(max-width: 900px) 100vw, 1100px';
  $('.pbtn--link').href = `https://www.youtube.com/watch?v=${v.id}`;
}
function stopVideo() {
  const f = $('.player__frame iframe');
  if (f) f.remove();
  playing = false;
  clearInterval(tcTimer);
  $('#player').classList.remove('is-playing');
  $('[data-act="stop"]').disabled = true;
  $('.player__tc').textContent = '00:00:00:00';
}
function playVideo() {
  stopVideo();
  const v = VIDEOS[vidIndex];
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`;
  f.title = `${t('trailer.player')}: ${t('trailer.tabs')[vidIndex]}`;
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.referrerPolicy = 'strict-origin-when-cross-origin';
  $('.player__frame').appendChild(f);
  playing = true;
  $('#player').classList.add('is-playing');
  $('[data-act="stop"]').disabled = false;
  sfx('shot');
  const t0 = performance.now();
  tcTimer = setInterval(() => {
    const s = (performance.now() - t0) / 1000;
    const p = (n) => String(Math.floor(n)).padStart(2, '0');
    $('.player__tc').textContent = `00:${p(s / 60)}:${p(s % 60)}:${p((s * 24) % 24)}`;
  }, 1000 / 12);
}
function setTheater(onState) {
  document.body.classList.toggle('is-theater', onState);
  $('#player').classList.toggle('is-theater', onState);
  const b = $('[data-act="theater"] span');
  b.dataset.i18n = onState ? 'trailer.theaterOff' : 'trailer.theater';
  b.textContent = t(b.dataset.i18n);
  $('[data-act="theater"]').setAttribute('aria-pressed', String(onState));
  if (onState) $('#player').scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
}
function bindPlayer() {
  const player = $('#player');
  player.addEventListener('click', (e) => {
    const tab = e.target.closest('.ptab');
    if (tab) { vidIndex = Number(tab.dataset.i); stopVideo(); renderTabs(); return; }
    if (e.target.closest('.player__play')) return playVideo();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'stop') stopVideo();
    if (act === 'theater') setTheater(!player.classList.contains('is-theater'));
    if (act === 'fs') {
      const fr = $('.player__frame');
      if (document.fullscreenElement) document.exitFullscreen();
      else fr.requestFullscreen?.().catch(() => {});
    }
  });
  $('.player__tabs').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    vidIndex = (vidIndex + (e.key === 'ArrowRight' ? 1 : -1) + VIDEOS.length) % VIDEOS.length;
    stopVideo(); renderTabs(); $(`.ptab[data-i="${vidIndex}"]`).focus();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && player.classList.contains('is-theater')) setTheater(false); });
  // leaving the section stops theater mode
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && player.classList.contains('is-theater')) setTheater(false); }).observe(player);
}

/* ---------- manga ---------- */
function renderManga() {
  $('#mangaInfo').innerHTML = t('manga.rows').map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('');
  $('#mangaVols').innerHTML = t('manga.vols').map((v) => `<li><b>${v.title}</b><span>${esc(v.meta)}</span></li>`).join('');
  $('#mangaToc').innerHTML = t('manga.toc').map(([n, name, y]) =>
    `<li class="${n === '02' ? 'is-here' : ''}"><span class="toc-list__n">${n}</span><span>${esc(name)}</span><span class="toc-list__y">${y}</span>${n === '02' ? `<em>${esc(t('manga.here'))}</em>` : ''}</li>`).join('');
  $('#covers').innerHTML = COVERS.map((c, i) => `
    <li>${c.src
      ? `<button type="button" class="zoomable cover" data-lb="covers" data-i="${i}"><img src="${IMG}${c.sm || c.src}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async" alt="${esc(t('manga.covers')[i])}"></button>`
      : `<div class="cover cover--empty"><span>${esc(t('manga.slotEmpty'))}</span></div>`}
      <p class="small muted">${esc(t('manga.covers')[i])}</p></li>`).join('');
  $('#strip').innerHTML = t('manga.panels').map((p, i) => {
    const locked = lv() < p.sp;
    return `<li><button type="button" class="panel ${locked ? 'is-locked' : ''} panel--${i}" data-lb="panels" data-i="${i}">
      ${PANELS[i].src && !locked ? `<img src="${IMG}${PANELS[i].src}" alt="${esc(p.cap)}" loading="lazy">` : panelArt(p, i, locked)}
    </button></li>`;
  }).join('');
  const L = [LINKS.jumpPlus, LINKS.viz, LINKS.shueisha];
  $('#legal').innerHTML = t('manga.legal').map(([name, sub], i) =>
    `<li><a href="${L[i]}" target="_blank" rel="noopener"><b>${esc(name)} ↗</b><span>${esc(sub)}</span></a></li>`).join('');
}

/** Storyboard frame drawn in CSS: narration box + SFX, no copied art. */
function panelArt(p, i, locked) {
  return `<span class="panel__art" aria-hidden="true">${p.sfx ? `<span class="panel__sfx" lang="ja">${locked ? '' : p.sfx}</span>` : ''}</span>
    <span class="panel__no">${String(i + 1).padStart(2, '0')}</span>
    <span class="panel__cap">${spText(esc(p.cap), p.sp)}</span>
    <span class="panel__slot">${esc(p.slot)} · ${esc(t('manga.slotEmpty'))}</span>`;
}

/* ---------- anime ---------- */
function renderAnime() {
  $('#staff tbody').innerHTML = t('anime.staff').map(([role, jp, ro]) =>
    `<tr><th scope="row">${esc(role)}</th><td><span lang="ja">${jp}</span><small>${esc(ro)}</small></td></tr>`).join('');
  const head = t('anime.castHead');
  $('#castTbl thead').innerHTML = `<tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr>`;
  $('#castTbl tbody').innerHTML = t('chars').map((c) => {
    const d = CHARS[c.id];
    return `<tr><th scope="row">${esc(c.name)}</th><td><span lang="ja">${d.cv[0]}</span><small>${d.cv[1]}</small></td><td>${d.cvEn}</td></tr>`;
  }).join('');
  $('#release').innerHTML = t('anime.release').map(([d, txt]) => `<li><time>${esc(d)}</time><span>${esc(txt)}</span></li>`).join('');
  $('#primeLink').href = LINKS.prime;
  $('#officialLink').href = LINKS.official;
  $('#gallery').innerHTML = GALLERY.map((g, i) => `
    <li class="${g.contain ? 'is-art' : ''} ${i === 0 ? 'is-tall' : ''}"><button type="button" class="zoomable" data-lb="gallery" data-i="${i}">
      <img src="${IMG}${g.sm || g.src}" width="${g.w}" height="${g.h}" loading="lazy" decoding="async" alt="${esc(t('anime.gallery')[i])}">
      <span class="gallery__cap">${esc(t('anime.gallery')[i])}</span></button></li>`).join('');
}

function bindCompare() {
  const cmp = $('#cmp'), range = $('.cmp__range', cmp);
  const set = () => cmp.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', set);
  set();
}

/* ---------- production timeline ---------- */
function renderTimeline() {
  $('#tl').innerHTML = t('timeline.items').map(([d, txt], i) =>
    `<li class="reveal" style="--d:${i * 70}ms"><time>${esc(d)}</time><p>${esc(txt)}</p></li>`).join('');
}

/* ---------- Fujimoto world ---------- */
function renderWorld() {
  $('#worldCards').innerHTML = t('world.cards').map(([name, desc], i) => {
    const w = WORLD[i];
    return `<li class="reveal" style="--d:${i * 80}ms"><a class="wcard" href="${w.url}" style="--tone:${w.tone}">
      <span class="wcard__mark" aria-hidden="true">${w.img ? `<img src="${IMG}${w.img}" alt="" loading="lazy" width="400" height="630">` : `<b>${w.mark}</b>`}</span>
      <span class="wcard__body"><b>${esc(name)}</b><span>${esc(desc)}</span><em>${esc(t('world.open'))} ↗</em></span></a></li>`;
  }).join('');
}

/* ---------- lightbox sets ---------- */
function registerSets() {
  registerSet('covers', COVERS.map((c, i) => c.src ? { src: IMG + c.src, cap: `${t('manga.covers')[i]} ${CREDIT_MANGA}`, w: c.w, h: c.h } : null).filter(Boolean));
  registerSet('gallery', GALLERY.map((g, i) => ({ src: IMG + g.src, cap: `${t('anime.gallery')[i]} · ${CREDIT_ANIME}`, w: g.w, h: g.h, contain: g.contain })));
  registerSet('panels', t('manga.panels').map((p, i) => {
    const locked = lv() < p.sp;
    return PANELS[i].src && !locked
      ? { src: IMG + PANELS[i].src, cap: p.cap }
      : { html: `<div class="panel panel--big ${locked ? 'is-locked' : ''} panel--${i}">${panelArt(p, i, locked)}</div>`, cap: locked ? t('censor.locked') : p.cap };
  }));
}

function bindZoomables() {
  document.addEventListener('click', (e) => {
    const z = e.target.closest('[data-lb]');
    if (!z || !z.matches('button')) return;
    openLightbox(z.dataset.lb, Number(z.dataset.i));
  });
  $('#openReader').addEventListener('click', () => openLightbox('panels', 0, true));
}

/* =========================================================
   Scroll story: beats, rail, freeze scrubber
   ========================================================= */
let beats = [];
function renderRail() {
  const list = t('rail.beats');
  $('.rail__list').innerHTML = list.map((b, i) => {
    const sec = $(`[data-beat="${i}"]`);
    return `<li><a href="#${sec.id}" class="rail__beat" data-i="${i}"><i aria-hidden="true"></i><span>${spText(esc(b.t), b.sp)}</span></a></li>`;
  }).join('');
}

function measure() {
  beats = $$('[data-beat]').map((s) => s.getBoundingClientRect().top + scrollY);
}

const freeze = { el: null, p: -1, cap: -1, shot: false, stopped: false, width: 0 };
const CAP_AT = [0.02, 0.2, 0.42, 0.66, 0.86];

function renderCaps() {
  const caps = t('act3.caps');
  $('#freezeCaps').innerHTML = caps.map((c, i) =>
    `<li class="${reduced || i <= freeze.cap ? 'is-on' : ''}">${spText(esc(c.t), c.sp)}</li>`).join('');
}

function updateFreeze() {
  const el = freeze.el;
  const r = el.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight));
  if (Math.abs(p - freeze.p) < 0.0005) return;
  freeze.p = p;
  const STOP = 0.86;
  const q = clamp(p / STOP);
  const pos = 1 - (1 - q) ** 3;                 // decelerating flight
  const vel = 350 * (1 - q) ** 2;
  const time = 0.0125 * (1 - (1 - q) ** 5);     // time crawls as it nears the palm
  el.style.setProperty('--p', p.toFixed(4));
  el.style.setProperty('--pos', pos.toFixed(4));
  el.style.setProperty('--x', `${(pos * freeze.width).toFixed(1)}px`);
  el.style.setProperty('--spin', `${(time * 120000).toFixed(0)}deg`);
  el.classList.toggle('is-stopped', p >= STOP);
  const hud = $('#hud');
  $('[data-k="time"]', hud).textContent = `${time.toFixed(4)} s`;
  $('[data-k="vel"]', hud).textContent = `${vel.toFixed(vel < 10 ? 1 : 0)} m/s`;
  $('[data-k="dist"]', hud).textContent = `${(pos * 4.2).toFixed(2)} m`;
  $('[data-k="frame"]', hud).textContent = String(Math.round(p * 240)).padStart(4, '0');
  const cap = CAP_AT.reduce((a, at, i) => (p >= at ? i : a), -1);
  if (cap !== freeze.cap) {
    freeze.cap = cap;
    $$('#freezeCaps li').forEach((li, i) => { li.classList.toggle('is-on', i <= cap); li.classList.toggle('is-now', i === cap); });
    if (cap >= 0) sfx('tick');
  }
  if (p > 0.02 && !freeze.shot) { freeze.shot = true; sfx('shot'); }
  if (p < 0.01) freeze.shot = false;
  if (p >= STOP && !freeze.stopped) { freeze.stopped = true; sfx('freeze'); }
  if (p < STOP) freeze.stopped = false;
}

function updateRail() {
  if (!beats.length) return;
  const y = scrollY + innerHeight * 0.35;
  let i = 0;
  while (i < beats.length - 1 && y >= beats[i + 1]) i++;
  const next = beats[i + 1] ?? document.documentElement.scrollHeight;
  const frac = clamp((y - beats[i]) / (next - beats[i]));
  const prog = clamp((i + (i === beats.length - 1 ? 0 : frac)) / (beats.length - 1));
  const rail = $('#rail');
  rail.style.setProperty('--prog', prog.toFixed(4));
  if (rail.dataset.now !== String(i)) {
    rail.dataset.now = String(i);
    document.body.dataset.beat = String(i);
    $$('.rail__beat', rail).forEach((a, k) => {
      a.classList.toggle('is-past', k < i);
      if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateRail();
    if (!reduced) updateFreeze();
  });
}

function initScroll() {
  freeze.el = $('#act3');
  if (reduced) freeze.el.classList.add('is-static', 'is-stopped');
  if (reduced) { // static final frame: show the readout at rest
    const hud = $('#hud');
    $('[data-k="time"]', hud).textContent = '0.0125 s';
    $('[data-k="vel"]', hud).textContent = '0.0 m/s';
    $('[data-k="dist"]', hud).textContent = '4.20 m';
    $('[data-k="frame"]', hud).textContent = '0240';
  }
  const sizeFreeze = () => {
    const stage = $('.freeze__stage');
    freeze.width = stage.clientWidth * (innerWidth < 900 ? 0.42 : 0.62); // keep in sync with .freeze__stop left
    freeze.p = -1;
  };
  sizeFreeze();
  measure();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeFreeze(); measure(); onScroll(); });
  addEventListener('load', () => { measure(); onScroll(); });
  new ResizeObserver(() => { measure(); onScroll(); }).observe($('#main'));
  onScroll();

  // Act II: muzzle flash once when it enters
  const act2 = $('#act2');
  new IntersectionObserver((es) => {
    if (es[0].isIntersecting && !act2.classList.contains('is-fired')) {
      act2.classList.add('is-fired');
      sfx('shot');
    }
  }, { threshold: 0.35 }).observe(act2);
}

/* =========================================================
   Boot
   ========================================================= */
export function initStory() {
  renderAll();
  bindCards();
  bindRelations();
  bindPlayer();
  bindCompare();
  bindZoomables();
  initScroll();
  on('lang', renderAll);
  on('spoiler', () => { renderAll(); measure(); });
}
