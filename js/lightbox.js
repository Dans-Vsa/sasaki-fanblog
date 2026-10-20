/* Lightbox: zoom (buttons, wheel, double-click), pan when zoomed, swipe, keyboard, reading mode. */
import { $, t } from './core.js';

const sets = {};
export const registerSet = (name, items) => { sets[name] = items; };

let cur = { set: null, i: 0, scale: 1, x: 0, y: 0, reading: false };
let dlg, item, cap, count, readBtn;

function el() {
  if (dlg) return;
  dlg = $('#lb'); item = $('#lbItem'); cap = $('#lbCap'); count = $('#lbCount'); readBtn = $('[data-lb-act="read"]', dlg);
  bind();
}

function media(it, eager) {
  if (it.html) return it.html;
  return `<img src="${it.src}" alt="${it.cap ? it.cap.replace(/"/g, '&quot;') : ''}" ${it.w ? `width="${it.w}" height="${it.h}"` : ''} ${eager ? '' : 'loading="lazy"'} draggable="false" class="${it.contain ? 'is-art' : ''}">`;
}

function render() {
  const items = sets[cur.set] || [];
  const it = items[cur.i];
  if (!it) return;
  dlg.classList.toggle('is-reading', cur.reading);
  readBtn.setAttribute('aria-pressed', String(cur.reading));
  if (cur.reading) {
    item.innerHTML = items.map((x) => `<figure class="lb__page">${media(x)}<figcaption>${x.cap || ''}</figcaption></figure>`).join('');
    cap.textContent = '';
    count.textContent = `${items.length} ${t('lightbox.of')} ${items.length}`;
    resetZoom();
    item.parentElement.scrollTop = 0;
    return;
  }
  item.innerHTML = media(it, true);
  cap.innerHTML = it.cap || '';
  count.textContent = `${cur.i + 1} ${t('lightbox.of')} ${items.length}`;
  resetZoom();
}

function resetZoom() { cur.scale = 1; cur.x = 0; cur.y = 0; apply(); }
function apply() {
  item.style.transform = cur.reading ? '' : `translate(${cur.x}px, ${cur.y}px) scale(${cur.scale})`;
  dlg.classList.toggle('is-zoomed', cur.scale > 1);
}
function zoom(d) {
  cur.scale = Math.min(4, Math.max(1, +(cur.scale + d).toFixed(2)));
  if (cur.scale === 1) { cur.x = 0; cur.y = 0; }
  apply();
}
function go(d) {
  const n = (sets[cur.set] || []).length;
  if (!n || cur.reading) return;
  cur.i = (cur.i + d + n) % n;
  render();
}

export function openLightbox(set, i = 0, reading = false) {
  el();
  cur = { set, i, scale: 1, x: 0, y: 0, reading };
  render();
  if (!dlg.open) dlg.showModal();
}

function bind() {
  dlg.addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb-act]')?.dataset.lbAct;
    if (act === 'close') dlg.close();
    else if (act === 'prev') go(-1);
    else if (act === 'next') go(1);
    else if (act === 'in') zoom(0.5);
    else if (act === 'out') zoom(-0.5);
    else if (act === 'read') { cur.reading = !cur.reading; render(); }
    else if (e.target === dlg || e.target.classList.contains('lb__stage')) { if (cur.scale === 1) dlg.close(); }
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === '+' || e.key === '=') zoom(0.5);
    else if (e.key === '-') zoom(-0.5);
    else if (e.key.toLowerCase() === 'r') { cur.reading = !cur.reading; render(); }
  });
  const stage = $('.lb__stage', dlg);
  stage.addEventListener('wheel', (e) => {
    if (cur.reading) return;
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.25 : -0.25);
  }, { passive: false });
  stage.addEventListener('dblclick', () => { if (!cur.reading) { cur.scale > 1 ? resetZoom() : zoom(1); } });

  // pointer: pan when zoomed, swipe when not
  let down = null;
  stage.addEventListener('pointerdown', (e) => {
    if (cur.reading || e.target.closest('button')) return;
    down = { x: e.clientX, y: e.clientY, ox: cur.x, oy: cur.y, id: e.pointerId };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!down || cur.scale === 1) return;
    cur.x = down.ox + (e.clientX - down.x);
    cur.y = down.oy + (e.clientY - down.y);
    apply();
  });
  const up = (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (cur.scale === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    down = null;
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', () => { down = null; });
  dlg.addEventListener('close', () => { if (!dlg.open) item.innerHTML = ''; }); // close fires async; skip if reopened
}
