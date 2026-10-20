/* Shared chrome: header (nav, spoiler, language, sound), spoiler gate dialog, footer.
   Rendered into <div id="chrome-top"> / <div id="chrome-bottom"> on every page. */
import { $, $$, t, on, lv, level, setLevel, setLang, lang, soundOn, setSound, spoilerChosen, applyDom, sfx } from './core.js';
import { WORLD, LINKS } from './data.js';

const crosshair = `<svg class="ico-cross" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 1v6M12 17v6M1 12h6M17 12h6"/><circle cx="12" cy="12" r="1.4" class="dot"/></svg>`;

export function renderChrome(page) {
  const base = page === 'wiki' ? 'index.html' : '';
  const link = (hash, key) => `<a href="${base}#${hash}" data-i18n="nav.${key}"></a>`;
  $('#chrome-top').outerHTML = `
  <a class="skip" href="#main" data-i18n="skip"></a>
  <header class="top" id="top">
    <a class="brand" href="${base || '#'}${base ? '' : 'hero'}" data-i18n-attr="aria-label:nav.brandAria">
      ${crosshair}<span class="brand__jp" lang="ja">佐々木くんが銃弾<b>止</b>めた</span><span class="brand__en">Sasaki</span>
    </a>
    <nav class="nav" id="nav" data-i18n-attr="aria-label:nav.label">
      <ol class="nav__acts">
        <li>${link('act1', 'act1')}</li><li>${link('act2', 'act2')}</li><li>${link('act3', 'act3')}</li><li>${link('act4', 'act4')}</li>
      </ol>
      <ul class="nav__refs">
        <li>${link('cast', 'cast')}</li><li>${link('manga', 'manga')}</li><li>${link('anime', 'anime')}</li>
        <li><a href="wiki.html" data-i18n="nav.wiki" ${page === 'wiki' ? 'aria-current="page"' : ''}></a></li>
        <li class="nav__world">
          <button type="button" class="nav__world-btn" aria-expanded="false" aria-controls="worldPop"><span data-i18n="nav.world"></span> <span aria-hidden="true">▾</span></button>
          <ul class="world-pop" id="worldPop" hidden>
            ${WORLD.map((w, i) => `<li><a href="${w.url}" data-i18n="world.cards.${i}.0"></a></li>`).join('')}
          </ul>
        </li>
      </ul>
    </nav>
    <div class="tools">
      <button type="button" class="tool tool--spoiler" id="spoilerBtn" aria-haspopup="dialog" aria-controls="gate">
        <span class="tool__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="tool__label"><span class="tool__pre"><span data-i18n="tools.spoiler"></span>: </span><b id="spoilerName"></b></span>
      </button>
      <div class="lang" role="group" data-i18n-attr="aria-label:tools.lang">
        <button type="button" data-lang="id" aria-pressed="false">ID</button><button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
      <button type="button" class="tool tool--sound" id="soundBtn" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/><path class="mute" d="M16 9l6 6M22 9l-6 6"/></svg>
        <span class="sr-only" id="soundLabel"></span>
      </button>
      <button type="button" class="tool tool--menu" id="menuBtn" aria-expanded="false" aria-controls="nav"><span class="burger" aria-hidden="true"><i></i><i></i></span><span class="sr-only" data-i18n="nav.menu"></span></button>
    </div>
  </header>

  <dialog class="gate" id="gate" aria-labelledby="gateTitle">
    <form method="dialog" class="gate__card">
      <p class="eyebrow" data-i18n="gate.kicker"></p>
      <h2 id="gateTitle" data-i18n="gate.title"></h2>
      <p class="gate__lede" data-i18n="gate.lede"></p>
      <div class="gate__opts">
        ${[0, 1, 2].map((n) => `
        <button value="${n}" class="gate__opt gate__opt--${n}">
          <span class="gate__meter" aria-hidden="true">${[0, 1, 2].map((k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>
          <b data-i18n="lv.${n}.name"></b>
          <span data-i18n="lv.${n}.desc"></span>
        </button>`).join('')}
      </div>
      <p class="gate__note" data-i18n="gate.note"></p>
    </form>
  </dialog>`;

  $('#chrome-bottom').outerHTML = `
  <footer class="foot">
    <div class="wrap foot__grid">
      <div>
        <p class="foot__brand"><span lang="ja">佐々木くんが銃弾<b>止</b>めた</span><br><span>Sasaki Stopped a Bullet · fan blog</span></p>
        <p class="foot__made" data-i18n="footer.made"></p>
      </div>
      <div>
        <p class="eyebrow" data-i18n="footer.support"></p>
        <ul class="foot__links">
          <li><a href="${LINKS.jumpPlus}" target="_blank" rel="noopener">Shōnen Jump+ ↗</a></li>
          <li><a href="${LINKS.viz}" target="_blank" rel="noopener">VIZ Media ↗</a></li>
          <li><a href="${LINKS.shueisha}" target="_blank" rel="noopener">Shueisha ↗</a></li>
          <li><a href="${LINKS.official}" target="_blank" rel="noopener" data-i18n="anime.official"></a></li>
        </ul>
      </div>
      <div>
        <p class="eyebrow" data-i18n="nav.world"></p>
        <ul class="foot__links">
          ${WORLD.map((w, i) => `<li><a href="${w.url}" data-i18n="world.cards.${i}.0"></a></li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="wrap foot__legal">
      <p data-i18n="footer.fan"></p>
      <p data-i18n="footer.credits"></p>
      <p data-i18n="footer.sources"></p>
      <a class="foot__top" href="#top" data-i18n="footer.top"></a>
    </div>
  </footer>`;

  bind();
}

function bind() {
  const gate = $('#gate');
  $('#spoilerBtn').addEventListener('click', () => gate.showModal());
  gate.addEventListener('close', () => {
    const v = gate.returnValue;
    if (v !== '' && v != null) setLevel(Number(v));
    else if (!spoilerChosen()) setLevel(0); // dismissed with Esc: safest level
  });

  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }));

  const sb = $('#soundBtn');
  sb.addEventListener('click', () => { setSound(!soundOn); if (soundOn) sfx('tick'); });

  // mobile menu
  const menuBtn = $('#menuBtn'), nav = $('#nav');
  const closeMenu = () => { menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); };
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    $('.sr-only', menuBtn).textContent = t(open ? 'nav.close' : 'nav.menu');
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });

  // Fujimoto world popover
  const wb = $('.nav__world-btn'), pop = $('#worldPop');
  const setPop = (open) => { wb.setAttribute('aria-expanded', String(open)); pop.hidden = !open; };
  wb.addEventListener('click', () => setPop(pop.hidden));
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav__world')) setPop(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setPop(false); closeMenu(); }
  });

  // solid header after scrolling past the first screen
  const top = $('#top');
  const onScroll = () => top.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  syncTools();
  on('spoiler', syncTools);
  on('lang', syncTools);
  on('sound', syncTools);
}

function syncTools() {
  $('#spoilerName').textContent = t(`lv.${lv()}.short`);
  $('#spoilerBtn').dataset.level = String(lv());
  $$('.gate__opt').forEach((o) => o.setAttribute('aria-current', String(level >= 0 && Number(o.value) === lv())));
  const sb = $('#soundBtn');
  sb.setAttribute('aria-pressed', String(soundOn));
  sb.classList.toggle('is-on', soundOn);
  $('#soundLabel').textContent = t(soundOn ? 'tools.soundOn' : 'tools.soundOff');
  sb.title = t(soundOn ? 'tools.soundOn' : 'tools.soundOff');
}

/** First visit: open the gate (after the intro, if any). */
export function askSpoilerIfNeeded() {
  if (!spoilerChosen()) $('#gate').showModal();
}

export { applyDom };
