// Esquema del metro de «Призрачный поезд»: la línea del Tren Fantasma (sus vagones, en el orden en que Marcos los recorre)
// y la línea del metro anómalo que aparece en Sinea, hasta la Estación Cero, donde se juntan todas las líneas.
// Los datos (descripciones, capítulos, reseñas, ilustraciones) salen de data/metro/ a través de tools/build.py.
import { CIUDADES, NOVELAS, IDIOMAS, IDIOMAS_RU } from './datos.js?v=13';

const LITMIR = 'https://luisfader.github.io/litmir/#/';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const params = new URLSearchParams(location.search);
let lang = params.get('lang') || (() => { try { return localStorage.getItem('sinea-lang'); } catch (e) { return null; } })() || 'es';
const tr = (es, ru) => lang === 'ru' ? ru : es;
const plural = (n, es1, esN, ru1, ru2, ru5) => {
  if (lang !== 'ru') return n === 1 ? es1 : esN;
  const d = n % 10, c = n % 100; return d === 1 && c !== 11 ? ru1 : d >= 2 && d <= 4 && (c < 12 || c > 14) ? ru2 : ru5;
};
const EST = CIUDADES.metro || [];
const porId = Object.fromEntries(EST.map(L => [L.id, L]));
const nom = (L) => tr(L.nombre, L.nombre_ru || L.nombre), nomOtro = (L) => tr(L.nombre_ru || '', L.nombre);
const tituloNovela = (slug) => { const n = NOVELAS[slug]; return n ? tr(n.es || n.t, n.ru || n.t) : slug === 'el-tren-fantasma' ? tr('El tren fantasma', 'Призрачный поезд (исп.)') : slug; };

const LINEAS = {
  P: { color: '#e0473f', es: 'Línea del Tren Fantasma: los vagones', ru: 'Линия Призрачного поезда: вагоны',
    ids: ['tf-central', 'tf-pasajeros', 'tf-biblioteca', 'tf-piscina', 'tf-mujeres', 'tf-discoteca', 'tf-burocracia', 'tf-confesionario', 'tf-purgatorio', 'tf-juicio', 'tf-cocina', 'tf-cabeza', 'tf-escuela', 'tf-sinea'] },
  A: { color: '#9a6bff', es: 'Línea del metro anómalo', ru: 'Аномальная линия метро',
    ids: ['ma-biblioteca', 'ma-tiempo', 'ma-grito', 'ma-susurro', 'ma-tormenta', 'ma-perdidos', 'ma-mitica', 'ma-graciosa', 'ma-vacia', 'ma-miedo', 'ma-casas', 'ma-eleccion', 'ma-ruido', 'ma-cero'] }
};
// dónde va el nombre de cada estación: [dx, dy, ancla, rotación]
const ETQ = {
  'tf-central': [0, -22, 'start', -32], 'tf-pasajeros': [0, -22, 'start', -32], 'tf-biblioteca': [0, -22, 'start', -32], 'tf-piscina': [0, -22, 'start', -32],
  'tf-mujeres': [0, -22, 'start', -32], 'tf-discoteca': [0, -22, 'start', -32], 'tf-burocracia': [0, -22, 'start', -32], 'tf-confesionario': [0, -22, 'start', -32],
  'tf-purgatorio': [0, -22, 'start', -32], 'tf-juicio': [0, -22, 'start', -32], 'tf-cocina': [22, 4, 'start', 0], 'tf-cabeza': [22, 5, 'start', 0], 'tf-escuela': [22, 5, 'start', 0], 'tf-sinea': [30, 6, 'start', 0],
  'ma-biblioteca': [-22, 5, 'end', 0], 'ma-tiempo': [-22, 5, 'end', 0], 'ma-grito': [4, -20, 'start', -32], 'ma-susurro': [4, -20, 'start', -32], 'ma-tormenta': [4, -20, 'start', -32],
  'ma-perdidos': [4, -20, 'start', -32], 'ma-mitica': [4, -20, 'start', -32], 'ma-graciosa': [22, 5, 'start', 0], 'ma-vacia': [22, 5, 'start', 0], 'ma-miedo': [4, 24, 'start', 32],
  'ma-casas': [4, 24, 'start', 32], 'ma-eleccion': [4, 24, 'start', 32], 'ma-ruido': [4, 24, 'start', 32], 'ma-cero': [-44, 6, 'end', 0]
};
// las líneas que «se cruzan donde no deben» y van todas a la Estación Cero
const FANTASMAS = [
  'M120 150 C 110 360, 160 560, 300 620', 'M1260 600 C 1180 860, 520 860, 300 620',
  'M1000 150 C 820 300, 420 330, 300 620', 'M670 150 C 640 560, 420 600, 300 620', 'M1260 320 C 1060 420, 980 820, 300 620'
];

const SVGNS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, hijos = []) => { const e = document.createElementNS(SVGNS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); for (const h of hijos) e.appendChild(h); return e; };
const svg = el('svg', { xmlns: SVGNS });
$('#esquema').appendChild(svg);
const capa = el('g'); svg.appendChild(capa);
const defs = el('defs'); svg.appendChild(defs);
defs.innerHTML = `<filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="niebla" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/><stop offset="60%" stop-color="#dfe8ff" stop-opacity=".25"/><stop offset="100%" stop-color="#dfe8ff" stop-opacity="0"/></radialGradient>`;

let seleccion = null, trenPath = null, tren = null;
function dibujar() {
  capa.innerHTML = '';
  // retícula tenue de plano técnico
  const ret = el('g', { stroke: '#18233a', 'stroke-width': 1 });
  for (let x = -100; x <= 1700; x += 50) ret.appendChild(el('line', { x1: x, y1: -200, x2: x, y2: 1000 }));
  for (let y = -200; y <= 1000; y += 50) ret.appendChild(el('line', { x1: -100, y1: y, x2: 1700, y2: y }));
  capa.appendChild(ret);
  // zona de la superficie (Sinea) y del subsuelo
  capa.appendChild(el('rect', { x: 40, y: 228, width: 1330, height: 2, fill: '#2a3858' }));
  const t1 = el('text', { x: 50, y: 248, class: 'lbl chico' }); t1.textContent = tr('↓ bajo Sinea: el metro que nunca existió', '↓ под Синеей: метро, которого не было'); capa.appendChild(t1);
  for (const d of FANTASMAS) capa.appendChild(el('path', { d, fill: 'none', stroke: '#6f84a3', 'stroke-width': 2, 'stroke-dasharray': '6 7', opacity: .55 }));
  for (const [k, Ln] of Object.entries(LINEAS)) {
    const pts = Ln.ids.map(id => porId[id]).filter(Boolean).map(L => `${L.x},${L.y}`).join(' ');
    capa.appendChild(el('polyline', { points: pts, fill: 'none', stroke: Ln.color, 'stroke-width': 14, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: .25, filter: 'url(#brillo)' }));
    const pl = el('polyline', { points: pts, fill: 'none', stroke: Ln.color, 'stroke-width': 8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    capa.appendChild(pl);
    if (k === 'P') trenPath = el('path', { d: 'M' + pts.replace(/ /g, ' L'), fill: 'none', stroke: 'none' }), capa.appendChild(trenPath);
  }
  // combinación: el vagón biblioteca y la estación «Biblioteca» (la misma bibliotecaria)
  const a = porId['tf-biblioteca'], b = porId['ma-biblioteca'];
  if (a && b) {
    capa.appendChild(el('rect', { x: a.x - 13, y: a.y, width: 26, height: b.y - a.y, rx: 13, fill: '#0d1320', stroke: '#e9eef7', 'stroke-width': 3 }));
    const tc = el('text', { x: a.x + 20, y: (a.y + b.y) / 2 + 26, class: 'lbl chico' }); tc.textContent = tr('combinación: la misma bibliotecaria', 'пересадка: та же библиотекарша'); capa.appendChild(tc);
  }
  // estaciones
  for (const L of EST) {
    const Ln = LINEAS[L.linea]; if (!Ln) continue;
    const g = el('g', { class: 'est-g' + (seleccion === L.id ? ' sel' : ''), 'data-id': L.id, tabindex: 0, role: 'button' });
    const cero = L.id === 'ma-cero', fin = L.id === 'tf-sinea';
    if (cero) {
      g.appendChild(el('circle', { cx: L.x, cy: L.y, r: 54, fill: 'url(#niebla)' }));
      g.appendChild(el('circle', { class: 'ring', cx: L.x, cy: L.y, r: 26, fill: '#f6f8ff', stroke: '#ffffff', 'stroke-width': 4, filter: 'url(#brillo)' }));
      const z = el('text', { x: L.x, y: L.y + 9, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: '#0d1320', 'font-family': 'Georgia, serif', 'pointer-events': 'none' }); z.textContent = '0'; g.appendChild(z);
    } else {
      g.appendChild(el('circle', { class: 'ring', cx: L.x, cy: L.y, r: fin ? 17 : 12, fill: '#f4f7fb', stroke: Ln.color, 'stroke-width': 5 }));
      const n = el('text', { class: 'num', x: L.x, y: L.y + 4, 'text-anchor': 'middle' }); n.textContent = L.num; g.appendChild(n);
    }
    const [dx, dy, an, rot] = ETQ[L.id] || [18, 5, 'start', 0];
    const t = el('text', { class: 'lbl', x: L.x + dx, y: L.y + dy, 'text-anchor': an, transform: rot ? `rotate(${rot} ${L.x + dx} ${L.y + dy})` : '' });
    t.textContent = nom(L); if (cero) { t.setAttribute('font-size', 19); t.setAttribute('font-weight', 700); }
    g.appendChild(t);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter') abrir(L.id); });
    capa.appendChild(g);
  }
  // el tren fantasma, que va y viene sin horario
  tren = el('g', { filter: 'url(#brillo)', 'pointer-events': 'none' });
  tren.appendChild(el('rect', { x: -26, y: -7, width: 52, height: 14, rx: 7, fill: '#ffe3d6', opacity: .9 }));
  for (let i = -18; i <= 14; i += 10) tren.appendChild(el('rect', { x: i, y: -3, width: 6, height: 5, rx: 1, fill: '#e0473f' }));
  capa.appendChild(tren);
}

// ---------- vista: arrastrar, rueda y pellizco ----------
const TODO = { x: -40, y: -110, w: 1660, h: 1060 };
let vb = { ...TODO }, movido = false;
function ajustar() {
  const r = $('#esquema').getBoundingClientRect(), asp = r.width / r.height;
  let { x, y, w, h } = vb;
  if (w / h > asp) { const nh = w / asp; y -= (nh - h) / 2; h = nh; } else { const nw = h * asp; x -= (nw - w) / 2; w = nw; }
  svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  return { x, y, w, h, r };
}
function verTodo() { vb = { ...TODO }; const m = innerWidth < 720; if (m) vb = { x: 20, y: 40, w: 600, h: 760 }; ajustar(); }
function zoom(f, cx, cy) {
  const v = ajustar(); cx ??= v.r.left + v.r.width / 2; cy ??= v.r.top + v.r.height / 2;
  const px = v.x + (cx - v.r.left) / v.r.width * v.w, py = v.y + (cy - v.r.top) / v.r.height * v.h;
  const nw = Math.max(260, Math.min(2400, vb.w * f)), k = nw / vb.w;
  vb = { x: px - (px - vb.x) * k, y: py - (py - vb.y) * k, w: vb.w * k, h: vb.h * k }; ajustar();
}
const punteros = new Map(); let ini = null;
const caja = $('#esquema');
caja.addEventListener('pointerdown', (e) => { caja.setPointerCapture(e.pointerId); punteros.set(e.pointerId, [e.clientX, e.clientY]); movido = false; ini = { vb: { ...vb }, pts: [...punteros.values()].map(p => [...p]) }; caja.classList.add('arrastrando'); });
caja.addEventListener('pointermove', (e) => {
  if (!punteros.has(e.pointerId)) return; punteros.set(e.pointerId, [e.clientX, e.clientY]);
  const v = ajustar(), esc_ = v.w / v.r.width, ps = [...punteros.values()];
  if (ps.length === 1 && ini.pts.length === 1) {
    const dx = ps[0][0] - ini.pts[0][0], dy = ps[0][1] - ini.pts[0][1]; if (Math.hypot(dx, dy) > 4) movido = true;
    vb = { ...ini.vb, x: ini.vb.x - dx * esc_, y: ini.vb.y - dy * esc_ }; ajustar();
  } else if (ps.length === 2 && ini.pts.length === 2) {
    movido = true;
    const d0 = Math.hypot(ini.pts[0][0] - ini.pts[1][0], ini.pts[0][1] - ini.pts[1][1]), d1 = Math.hypot(ps[0][0] - ps[1][0], ps[0][1] - ps[1][1]);
    vb = { ...ini.vb }; zoom(d0 / d1, (ps[0][0] + ps[1][0]) / 2, (ps[0][1] + ps[1][1]) / 2);
  }
});
const soltar = (e) => {
  if (e.type === 'pointerup' && !movido && punteros.size === 1) { const g = document.elementFromPoint(e.clientX, e.clientY)?.closest('.est-g'); if (g) abrir(g.dataset.id); }
  punteros.delete(e.pointerId); ini = { vb: { ...vb }, pts: [...punteros.values()].map(p => [...p]) }; if (!punteros.size) caja.classList.remove('arrastrando'); };
caja.addEventListener('pointerup', soltar); caja.addEventListener('pointercancel', soltar);
caja.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
$('#z-mas').onclick = () => zoom(1 / 1.3); $('#z-menos').onclick = () => zoom(1.3); $('#z-todo').onclick = verTodo;
addEventListener('resize', ajustar);

// ---------- ficha de la estación ----------
const panel = $('#panel'), cuerpo = $('#panel .cuerpo');
const COL_AV = ['#e8453c', '#1a73e8', '#0f9d58', '#f4b400', '#ab47bc', '#00acc1', '#ff7043', '#5c6bc0', '#8d6e63'];
function estrellas(n) { let h = ''; for (let i = 1; i <= 5; i++) h += `<i class="${n >= i - .25 ? 'll' : n >= i - .75 ? 'md' : ''}">★</i>`; return `<span class="est">${h}</span>`; }
function capitulos(a) {
  return `<div class="caps">${a.c.map(([seg, t]) => `<a class="cap" target="_blank" rel="noopener" href="${LITMIR}${a.n}/${seg}" title="${esc(t)}">${tr('Cap. ', 'Гл. ') + seg}${t ? ' · ' + esc(t) : ''}</a>`).join('')}</div>`;
}
function ficha(a) {
  const n = NOVELAS[a.n] || {};
  return `<div class="nov">${n.p ? `<img class="port" src="${n.p}" alt="" loading="lazy">` : '<div class="port"></div>'}
    <div class="txt"><a class="tn" href="${LITMIR}${a.n}" target="_blank" rel="noopener">${esc(n.t || a.n)}</a>
    <div class="meta">${esc(tr(IDIOMAS[n.l], IDIOMAS_RU[n.l]) || '')}${n.y ? ' · ' + n.y : ''}</div>${capitulos(a)}</div></div>`;
}
function abrir(id) {
  const L = porId[id]; if (!L) return;
  seleccion = id; dibujar(); moverTren(performance.now());
  const Ln = LINEAS[L.linea], tot = L.apar.reduce((s, a) => s + a.c.length, 0);
  const prom = L.res ? L.res.reduce((t, r) => t + r.s, 0) / L.res.length : 0;
  const im = L.img ? `<figure class="foto"><img src="${L.img.src}" alt=""><figcaption>${tr('Ilustración de', 'Иллюстрация:')} <a href="${LITMIR}${L.img.n}/${L.img.c}" target="_blank" rel="noopener">${esc(tituloNovela(L.img.n))}, ${tr('cap.', 'гл.')} ${esc(L.img.c)}</a></figcaption></figure>` : '';
  const res = L.res ? `<h3 id="resenas">${tr('Reseñas de los pasajeros', 'Отзывы пассажиров')} <small>${tr('escritas por los personajes', 'от персонажей')}</small></h3><div class="resenas">${L.res.map(r => {
    const nm = tr(r.a, r.ar || r.a); let h = 0; for (const c of r.a) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return `<div class="res"><div class="av" style="background:${COL_AV[h % COL_AV.length]}">${esc(nm[0])}</div><div><b>${esc(nm)}</b> ${estrellas(r.s)}<p>${esc(tr(r.es, r.ru || r.es))}</p></div></div>`; }).join('')}</div>` : '';
  cuerpo.innerHTML = `${im}
    <div class="cab"><span class="cat" style="--c:${Ln.color}">${esc(tr(Ln.es, Ln.ru))} · ${L.num}</span>
    <h2>${esc(nom(L))}</h2>${nomOtro(L) ? `<div class="otros">${esc(nomOtro(L))}</div>` : ''}</div>
    ${L.res ? `<div class="nota"><b>${prom.toFixed(1).replace('.', ',')}</b> ${estrellas(prom)} <span>(${L.res.length} ${plural(L.res.length, 'reseña', 'reseñas', 'отзыв', 'отзыва', 'отзывов')})</span></div>` : ''}
    <p class="desc">${esc(tr(L.desc, L.desc_ru || L.desc))}</p>
    ${res}
    <h3>${tr('En la novela', 'В романе')} <small>${tot} ${plural(tot, 'capítulo', 'capítulos', 'глава', 'главы', 'глав')}</small></h3>
    ${L.apar.map(ficha).join('')}`;
  panel.classList.add('abierto'); cuerpo.scrollTop = 0;
  history.replaceState(null, '', location.pathname + location.search + '#/lugar/' + id);
}
$('#panel .cerrar').onclick = () => { panel.classList.remove('abierto'); seleccion = null; dibujar(); history.replaceState(null, '', location.pathname + location.search); };

// ---------- textos e idioma ----------
function textos() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-es]').forEach(e => { e.textContent = tr(e.dataset.es, e.dataset.ru); });
  document.querySelectorAll('#barra-metro .idi button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  $('#volver').href = 'index.html?ciudad=sinea' + (lang === 'ru' ? '&lang=ru' : '');
  document.title = tr('Metro del Tren Fantasma · Mapas de los mundos literarios de Robert Fader', 'Метро Призрачного поезда · Карты миров Роберта Фадера');
  $('#leyenda').innerHTML = Object.values(LINEAS).map(Ln => `<div><i style="background:${Ln.color}"></i>${esc(tr(Ln.es, Ln.ru))}</div>`).join('') +
    `<div><i class="fan"></i>${tr('líneas que se cruzan donde no deben: todas van a la Estación Cero', 'линии пересекаются там, где не должны: все ведут к Нулевой станции')}</div>`;
  $('#pie').innerHTML = tr(`<b>Metro del Tren Fantasma</b> · esquema imaginado a partir de «Призрачный поезд» de <a href="${LITMIR}prizrachnyj-poezd" target="_blank" rel="noopener">Robert Fader</a> · tocá una estación · arrastrá para moverte · rueda o dos dedos para el zoom`,
    `<b>Метро Призрачного поезда</b> · схема по роману «Призрачный поезд» <a href="${LITMIR}prizrachnyj-poezd" target="_blank" rel="noopener">Роберта Фадера</a> · нажмите на станцию · тяните, чтобы двигаться · колесо или два пальца — масштаб`);
  dibujar();
  if (seleccion) abrir(seleccion);
}
document.querySelectorAll('#barra-metro .idi button').forEach(b => b.onclick = () => { lang = b.dataset.l; try { localStorage.setItem('sinea-lang', lang); } catch (e) {} textos(); });

// ---------- animación del tren ----------
function moverTren(t) {
  if (!trenPath || !tren) return;
  const L = trenPath.getTotalLength(), ciclo = 38000, f = (t % ciclo) / ciclo, k = f < .5 ? f * 2 : 2 - f * 2;
  const s = k * L, p = trenPath.getPointAtLength(s), q = trenPath.getPointAtLength(Math.min(L, s + 1));
  const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
  tren.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`);
  tren.setAttribute('opacity', (.55 + .45 * Math.abs(Math.sin(t / 1300))).toFixed(2));
}
function bucle(t) { moverTren(t); requestAnimationFrame(bucle); }

textos(); verTodo(); requestAnimationFrame(bucle);
const m = location.hash.match(/^#\/lugar\/(.+)$/); if (m && porId[m[1]]) abrir(m[1]);
window.METRO = { abrir, zoom, verTodo };
