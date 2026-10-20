/* Wiki page: articles from i18n "articles", search + category filter, sticky TOC with scroll-spy. */
import { $, $$, t, on, lv, esc } from './core.js';
import { spText, initSpoilers } from './spoiler.js';
import { initReveals } from './fx.js';

const CATS = ['theme', 'symbol', 'trivia', 'link', 'prod'];
let cat = 'all';
let query = '';
let spy = null;

const plain = (html) => html.replace(/<[^>]+>/g, ' ');
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

function mark(text, q) {
  if (!q) return esc(text);
  const i = norm(text).indexOf(q);
  if (i < 0) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
}

function matches(a, q) {
  if (!q) return true;
  const locked = lv() < a.sp;
  const hay = locked ? [a.title, ...(a.tags || [])].join(' ') : [a.title, plain(a.body), ...(a.tags || [])].join(' ');
  return norm(hay).includes(q);
}

function renderChips() {
  const all = t('articles');
  const n = (c) => all.filter((a) => c === 'all' || a.cat === c).length;
  $('#chips').setAttribute('aria-label', t('wiki.label'));
  $('#chips').innerHTML = ['all', ...CATS].map((c) =>
    `<button type="button" class="chip chip--${c}" data-cat="${c}" aria-pressed="${c === cat}">${esc(c === 'all' ? t('wiki.all') : t(`wiki.cats.${c}`))} <span>${n(c)}</span></button>`).join('');
}

function render() {
  const q = norm(query.trim());
  const list = t('articles').filter((a) => (cat === 'all' || a.cat === cat) && matches(a, q));
  const hidden = list.filter((a) => lv() < a.sp).length;
  $('#count').textContent = `${list.length} ${t(list.length === 1 ? 'wiki.count1' : 'wiki.count')}${hidden ? ` · ${hidden} ${t('wiki.hiddenBySp')}` : ''}`;

  $('#toc').innerHTML = list.map((a) =>
    `<li><a href="#w-${a.id}" class="wtoc__a wtoc__a--${a.cat}">${spText(mark(a.title, lv() >= a.sp ? q : ''), a.sp === 2 ? 2 : 0)}</a></li>`).join('');

  $('#articles').innerHTML = list.length ? list.map((a, i) => {
    const title = a.sp === 2 ? spText(mark(a.title, q), 2) : mark(a.title, q);
    const src = a.src ? `<p class="wart__src"><span>${esc(t('wiki.sources'))}:</span> ${a.src.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join(' · ')}</p>` : '';
    const body = `${a.fan ? `<p class="wart__fan">${esc(t('wiki.fanNote'))}</p>` : ''}${a.body}${src}`;
    return `<article class="wart reveal" id="w-${a.id}" style="--d:${Math.min(i, 6) * 50}ms">
      <header class="wart__head">
        <span class="badge badge--${a.cat}">${esc(t(`wiki.cats.${a.cat}`))}</span>
        ${a.sp ? `<span class="badge badge--sp badge--sp${a.sp}">${esc(t(`lv.${a.sp}.name`))}</span>` : ''}
        <h2 class="h3"><a href="#w-${a.id}">${title}</a></h2>
      </header>
      ${a.sp ? `<div class="sp" data-sp="${a.sp}"><div class="sp__body">${body}</div></div>` : `<div class="wart__body">${body}</div>`}
    </article>`;
  }).join('') : `<p class="wiki__none">${esc(t('wiki.none'))}</p>`;

  initSpoilers($('#articles'));
  initReveals($('#articles'));
  watchToc();
}

function watchToc() {
  spy?.disconnect();
  const links = new Map($$('#toc a').map((a) => [a.getAttribute('href').slice(1), a]));
  spy = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(e.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  $$('.wart').forEach((a) => spy.observe(a));
}

export function initWiki() {
  document.title = t('meta.wikiTitle');
  renderChips();
  render();
  const q = $('#q');
  q.addEventListener('input', () => { query = q.value; render(); });
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat;
    $$('#chips [data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input, textarea') && !document.querySelector('dialog[open]')) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && e.target === q) { q.value = ''; query = ''; render(); }
  });
  on('lang', () => { document.title = t('meta.wikiTitle'); renderChips(); render(); });
  on('spoiler', render);
  if (location.hash) requestAnimationFrame(() => $(location.hash)?.scrollIntoView());
}
