// Sinea 3D — aplicación principal
import * as THREE from './vendor/three.module.js';
import { MapControls } from './vendor/MapControls.js';
import { LIMITES, BARRIOS, CALLES, BORDES, EXTRAS, VISTA, NOMBRE, LEMA, CIUDAD, altura } from './mundo.js';
import { pintarSuelo, crearTerreno, crearMar, crearEdificios, crearArboles, crearPuentes, crearAfueras } from './escena.js';
import { construirHitos, crearDelfines, crearTrenFantasma, crearAutobus, crearDrones, crearAndes, crearGondolas } from './hitos.js';
import { CIUDADES, NOVELAS, IDIOMAS, IDIOMAS_RU } from './datos.js';
const LUGARES = CIUDADES[CIUDAD];
// Lugares fuera del mapa (Potrerillos, el Aconcagua…): se ponen en el borde, en su dirección real, con la distancia
for (const L of LUGARES) {
  const { x0, x1, y0, y1 } = LIMITES, m = 260;
  if (L.x > x0 + m && L.x < x1 - m && L.y > y0 + m && L.y < y1 - m) continue;
  L.lejos = Math.round(Math.hypot(L.x, L.y) / 1000);
  const k = Math.min(...[[L.x, x0 + m], [L.x, x1 - m], [L.y, y0 + m], [L.y, y1 - m]].map(([v, b]) => (v * b > 0 ? b / v : Infinity)));
  L.x = Math.round(L.x * k); L.y = Math.round(L.y * k); L.modelo = 'ninguno';
}

/* ---------------- idioma ---------------- */
let lang = (new URLSearchParams(location.search).get('lang') || (() => { try { return localStorage.getItem('sinea-lang'); } catch (e) { return null; } })() || (navigator.language || '').slice(0, 2)) === 'ru' ? 'ru' : 'es';
const tr = (es, ru) => lang === 'ru' ? ru : es;
const plural = (n, es1, esN, r1, r2, r5) => {
  if (lang !== 'ru') return n === 1 ? es1 : esN;
  const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? r1 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? r2 : r5;
};
const nomL = (L) => tr(L.nombre, L.nombre_ru || L.nombre);
const descL = (L) => tr(L.desc, L.desc_ru || L.desc);
const cir = /[А-Яа-яЁё]/;
const otrosL = (L) => lang === 'ru' ? [L.nombre, ...(L.otros || []).filter(o => !cir.test(o))] : (L.otros || []);

const LITMIR = 'https://luisfader.github.io/litmir/#/';
const FADERPEDIA = () => `https://luisfader.github.io/faderpedia/#/${lang}/a/`;
const FP = { 'faro-ael': 'ael', 'parque-delfines': 'ael', ministerio: 'ministerio-sentimientos', 'tren-fantasma': 'tren-fantasma', 'estacion-central': 'tren-fantasma',
  brecha: 'brecha', 'taller-geppetto': 'risatomat', 'rincon-suspiros': 'subconsciente', 'plaza-dante': 'sinea-ciudad', ayuntamiento: 'octavio-grande',
  'calle-castanos': 'marcos', 'calle-violinistas': 'vasili', 'central-electrica': 'brecha', 'estacion-cero': 'tren-fantasma', 'cafe-centro': 'olas' };
const CAT = {
  monumento: ['Monumento', '#d24f3f', 'Памятник'], plaza: ['Plaza', '#b57a2c', 'Площадь'], cafe: ['Café', '#c2456b', 'Кафе'], edificio: ['Edificio', '#5b6fb5', 'Здание'],
  transporte: ['Transporte', '#2f7fb8', 'Транспорт'], parque: ['Parque', '#3d9a53', 'Парк'], barrio: ['Barrio', '#7d6b5c', 'Район'], calle: ['Calle', '#8a7a6a', 'Улица'], misterio: ['Misterio', '#7a4fc4', 'Тайна'],
  casa: ['Casa de personaje', '#e0672b', 'Дом персонажа'], restaurante: ['Restaurante y café', '#d9822b', 'Ресторан и кафе'], tienda: ['Tienda', '#0f8f86', 'Магазин']
};
const ICONO = {
  monumento: '<path d="M12 2l2.6 6.3 6.4.5-4.9 4.2 1.5 6.4L12 16l-5.6 3.4 1.5-6.4L3 8.8l6.4-.5z"/>',
  plaza: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  cafe: '<path d="M4 8h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM16 9h2a2.5 2.5 0 010 5h-2"/>',
  edificio: '<path d="M5 21V5l7-3 7 3v16h-5v-5h-4v5z"/>',
  transporte: '<path d="M6 3h12a2 2 0 012 2v10a3 3 0 01-3 3l2 3H7l2-3a3 3 0 01-3-3V5a2 2 0 012-2zm1 3v5h10V6z"/>',
  parque: '<path d="M12 2l6 9h-3l4 6H5l4-6H6zM11 17h2v5h-2z"/>',
  barrio: '<circle cx="12" cy="12" r="6"/>', calle: '<circle cx="12" cy="12" r="6"/>',
  misterio: '<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/>',
  casa: '<path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z"/>',
  restaurante: '<path d="M7 2h2v7a2 2 0 01-1 1.7V22H6V10.7A2 2 0 015 9V2h2v6h0V2zm8 0c2 0 3 2.5 3 6s-1 4-2 4v10h-2V2z"/>',
  tienda: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2h-2V6a1 1 0 00-2 0v2z"/>'
};
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------------ */
const lienzo = $('#mapa');
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, logarithmicDepthBuffer: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

const escena = new THREE.Scene();
const CIELO_DIA = new THREE.Color(0xbfd9ea), CIELO_NOCHE = new THREE.Color(0x0b1424);
escena.background = CIELO_DIA.clone();
escena.fog = new THREE.Fog(CIELO_DIA.clone(), 4000, 16000);
const camara = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 3, EXTRAS.includes('andes') ? 150000 : 40000);

const U = { uT: { value: 0 }, uNoche: { value: 0 } };
const sol = new THREE.DirectionalLight(0xfff2dc, 2.6);
sol.castShadow = true; const SM = innerWidth < 800 ? 2048 : 4096; sol.shadow.mapSize.set(SM, SM);
const sc = sol.shadow.camera; sc.left = sc.bottom = -900; sc.right = sc.top = 900; sc.near = 10; sc.far = 6000; sol.shadow.bias = -0.0004; sol.shadow.normalBias = 1.2;
escena.add(sol, sol.target);
const cielo = new THREE.HemisphereLight(0xdfeeff, 0xcbb894, 1.25); escena.add(cielo);

const progreso = (es, ru) => { $('#carga p').textContent = tr(es, ru || es); };
const espera = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

let hitos, delf, tren, edificios, autobus, gond;
async function construir() {
  progreso('Pintando el mapa…', 'Рисуем карту…'); await espera();
  const S = renderer.capabilities.maxTextureSize >= 8192 && innerWidth > 900 ? 8192 : 4096;
  const tex = new THREE.CanvasTexture(pintarSuelo(S));
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  progreso('Levantando colinas…', 'Поднимаем холмы…'); await espera();
  escena.add(crearTerreno(tex));
  escena.add(crearMar(U)); escena.add(crearAfueras());
  progreso('Construyendo los edificios famosos…', 'Строим знаменитые здания…'); await espera();
  hitos = construirHitos(LUGARES, U); escena.add(hitos.grupo);
  progreso('Construyendo la ciudad…', 'Строим город…'); await espera();
  edificios = crearEdificios(hitos.reservas, U); escena.add(edificios);
  progreso('Plantando árboles…', 'Сажаем деревья…'); await espera();
  escena.add(crearArboles(hitos.reservas)); escena.add(crearPuentes());
  if (EXTRAS.includes('delfines')) { delf = crearDelfines(); escena.add(delf.g); }
  if (EXTRAS.includes('tren-fantasma')) { tren = crearTrenFantasma(); escena.add(tren.g); }
  if (EXTRAS.includes('drones-gaviota')) { delf = crearDrones(); escena.add(delf.g); }
  if (EXTRAS.includes('autobus-7')) { autobus = crearAutobus(); escena.add(autobus.g); }
  if (EXTRAS.includes('andes')) escena.add(crearAndes());
  if (EXTRAS.includes('gondolas')) { gond = crearGondolas(); escena.add(gond.g); }
  if (EXTRAS.includes('tren-girasoles')) { tren = crearTrenFantasma({ fantasma: false, vagones: 5, s0: 200, s1: 3900, vel: 22 }); escena.add(tren.g); }
}

/* ------------------------------------------------------------------ */
const controles = new MapControls(camara, renderer.domElement);
controles.enableDamping = true; controles.dampingFactor = 0.09;
controles.zoomToCursor = true; controles.screenSpacePanning = false;
controles.minDistance = 40; controles.maxDistance = VISTA.lejos; controles.maxPolarAngle = 1.36;
controles.zoomSpeed = 1.3;

function vistaInicial() {
  controles.target.set(VISTA.previa[0], 0, VISTA.previa[1]);
  camara.position.set(VISTA.previa[0] - 1300, VISTA.lejos * .28, VISTA.previa[1] + VISTA.lejos * .35);
  controles.update();
}

// límites de la cámara
function limitar() {
  const t = controles.target;
  t.x = Math.max(LIMITES.x0 + 300, Math.min(LIMITES.x1 - 300, t.x));
  t.z = Math.max(-LIMITES.y1 + 300, Math.min(-LIMITES.y0 - 300, t.z));
  t.y = Math.max(0, altura(t.x, -t.z));
  const hc = Math.max(0, altura(camara.position.x, -camara.position.z)) + 12;
  if (camara.position.y < hc) camara.position.y = hc;
}

// vuelo suave hacia un punto
let vuelo = null;
function volar(x, y, dist = 520, polar = 0.95, azim = null, ms = 1400) {
  const h = Math.max(0, altura(x, y));
  const t0 = controles.target.clone(), p0 = camara.position.clone();
  const t1 = new THREE.Vector3(x, h, -y);
  const off = p0.clone().sub(t0);
  const sph = new THREE.Spherical().setFromVector3(off);
  sph.radius = dist; sph.phi = polar; if (azim !== null) sph.theta = azim;
  const p1 = t1.clone().add(new THREE.Vector3().setFromSpherical(sph));
  // con el panel abierto, correr el punto hacia la derecha para que quede en el centro de lo visible
  if (panel.classList.contains('abierto') && innerWidth > 720) {
    const mpp = 2 * dist * Math.tan(camara.fov * Math.PI / 360) / innerHeight;
    const der = new THREE.Vector3(Math.cos(sph.theta), 0, -Math.sin(sph.theta)).multiplyScalar(-204 * mpp);
    t1.add(der); p1.add(der);
  } else if (panel.classList.contains('abierto')) {
    const mpp = 2 * dist * Math.tan(camara.fov * Math.PI / 360) / innerHeight;
    const atras = new THREE.Vector3(Math.sin(sph.theta), 0, Math.cos(sph.theta)).multiplyScalar(innerHeight * 0.22 * mpp / Math.max(.35, Math.cos(sph.phi)));
    t1.add(atras); p1.add(atras);
  }
  vuelo = { t0, p0, t1, p1, ini: performance.now(), ms };
}
function pasoVuelo(now) {
  if (!vuelo) return;
  let k = Math.min(1, (now - vuelo.ini) / vuelo.ms); const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  // arco: se aleja un poco a mitad de camino
  const d = vuelo.t0.distanceTo(vuelo.t1), arco = Math.sin(Math.PI * e) * Math.min(1200, d * .35);
  controles.target.lerpVectors(vuelo.t0, vuelo.t1, e);
  camara.position.lerpVectors(vuelo.p0, vuelo.p1, e); camara.position.y += arco;
  if (k >= 1) vuelo = null;
}
controles.addEventListener('start', () => { vuelo = null; });

/* ------------------------------------------------------------------ */
/* Etiquetas                                                           */
/* ------------------------------------------------------------------ */
const capa = $('#etiquetas');
const peso = (L) => L.apar.reduce((s, a) => s + a.c.length, 0);
const ETQ = [];
for (const L of LUGARES) {
  const el = document.createElement('button');
  const [nom, col] = CAT[L.cat] || CAT.edificio;
  const soloTexto = L.cat === 'barrio' || L.cat === 'calle';
  el.className = 'pin' + (soloTexto ? ' texto' : '');
  el.style.setProperty('--c', col);
  el.innerHTML = (soloTexto ? '' : `<span class="ic"><svg viewBox="0 0 24 24">${ICONO[L.cat] || ICONO.edificio}</svg></span>`) + `<span class="nm"></span>`;
  el.addEventListener('click', (e) => { e.stopPropagation(); abrirLugar(L.id, true); });
  capa.appendChild(el);
  const p = peso(L);
  ETQ.push({ el, L, texto: () => nomL(L).replace(/ \(.*\)$/, '') + (L.lejos ? ` · ${L.lejos} km →` : ''), titulo: () => nomL(L), imp: Math.log2(2 + p) + (L.cat === 'monumento' ? 2.2 : L.cat === 'plaza' ? 1.4 : 0) + (L.id === 'plaza-dante' || L.id === 'faro-ael' ? 3 : 0) + (L.cat === 'casa' ? 2.4 : 0) + (L.res ? 0.8 : 0), w: 0, h: 0, tipo: 'lugar' });
}
for (const b of BARRIOS) if (b.nombre) {
  const el = document.createElement('div'); el.className = 'barrio'; capa.appendChild(el);
  ETQ.push({ el, texto: () => tr(b.nombre, b.ru || b.nombre), x: b.lx, y: b.ly, imp: 3.5, tipo: 'barrio' });
}
for (const b of BORDES) {
  const el = document.createElement(b.ciudad ? 'a' : 'div'); el.className = b.mar ? 'mar' : 'borde' + (b.ciudad ? ' enlace' : ''); capa.appendChild(el);
  if (b.ciudad) el.addEventListener('click', (e) => { e.preventDefault(); irCiudad(b.ciudad); });
  ETQ.push({ el, texto: () => tr(b.texto, b.ru || b.texto), x: b.x, y: b.y, imp: 9, tipo: b.mar ? 'mar' : 'borde' });
}
for (const [nombre, t, pts, nru] of CALLES) {
  // segmento más largo
  let best = 0, bi = 0; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); if (l > best) { best = l; bi = i; } }
  const a = pts[bi], b = pts[bi + 1];
  const el = document.createElement('div'); el.className = 'calle ' + t; capa.appendChild(el);
  ETQ.push({ el, texto: () => tr(nombre, nru || nombre), x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, a, b, imp: t === 'c' ? 1 : 2, tipo: 'calle', largo: best });
}

const vp = new THREE.Vector3(), vp2 = new THREE.Vector3();
let siguiendo = false;
const marcaBus = document.createElement('button'); marcaBus.className = 'pin bus'; marcaBus.style.setProperty('--c', '#2f6fbf');
marcaBus.innerHTML = `<span class="ic"><svg viewBox="0 0 24 24">${ICONO.transporte}</svg></span><span class="nm"></span><span class="bip"></span>`;
marcaBus.style.display = 'none'; capa.appendChild(marcaBus);
marcaBus.addEventListener('click', (e) => { e.stopPropagation(); abrirLugar('vg-autobus-7', false); siguiendo = true; volar(autobus.estado.x, autobus.estado.y, 260, 1.0, null, 900); });
controles.addEventListener('start', () => { siguiendo = false; });
let filtro = null, filtroIds = null, seleccion = null;
function proyectar(x, y, h, out) {
  vp.set(x, h, -y).project(camara);
  out.x = (vp.x + 1) / 2 * innerWidth; out.y = (1 - vp.y) / 2 * innerHeight; out.z = vp.z; return out;
}
function marcaAutobus() {
  if (!autobus) return;
  const o = proyectar(autobus.estado.x, autobus.estado.y, altura(autobus.estado.x, autobus.estado.y) + 9, {});
  const vis = o.z < 1 && o.x > -50 && o.x < innerWidth + 50 && o.y > -50 && o.y < innerHeight + 50;
  marcaBus.style.display = vis ? '' : 'none'; if (!vis) return;
  marcaBus.style.transform = `translate(${o.x - 13}px,${o.y - 30}px)`;
  marcaBus.querySelector('.nm').textContent = tr('Autobús n.º 7', 'Автобус № 7') + (autobus.estado.parada ? ' · ' + tr('parada', 'остановка') : '');
  const bip = marcaBus.querySelector('.bip');
  bip.textContent = autobus.estado.bocina ? tr('¡pi-pip! · buenos días, hija', 'би-бип! · доброе утро, дочка') : '';
  bip.style.display = autobus.estado.bocina ? '' : 'none';
}
function etiquetas() {
  const dist = camara.position.distanceTo(controles.target);
  const zoom = Math.log2(9000 / dist) + (VISTA.zoomExtra || 0); // 0 lejos … 7 cerca
  const ocupados = [];
  const choca = (r) => ocupados.some(o => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y);
  const o = {};
  const orden = ETQ.slice().sort((A, B) => (B.sel ? 99 : 0) + B.imp - (A.sel ? 99 : 0) - A.imp);
  for (const E of orden) {
    let x, y, h;
    if (E.tipo === 'lugar') { x = E.L.x; y = E.L.y; h = (E.L._h ?? 10); }
    else { x = E.x; y = E.y; h = Math.max(0, altura(x, y)) + 2; }
    proyectar(x, y, h, o);
    let visible = o.z < 1 && o.x > -100 && o.x < innerWidth + 100 && o.y > -40 && o.y < innerHeight + 40;
    const enFiltro = !filtro || (E.tipo === 'lugar' && (filtroIds ? filtroIds.has(E.L.id) : E.L.apar.some(a => filtro.has(a.n))));
    if (E.tipo === 'lugar') {
      const umbral = 6.4 - zoom * 1.25;
      E.sel = seleccion === E.L.id;
      visible = visible && (E.sel || (filtro ? enFiltro : E.imp > umbral) || (filtro && enFiltro));
      E.el.classList.toggle('sel', E.sel);
      E.el.classList.toggle('apagado', !!filtro && !enFiltro);
      if (filtro && !enFiltro) visible = visible && zoom > 4.2 && E.imp > umbral;
    } else if (E.tipo === 'barrio') visible = visible && zoom > .9 && zoom < 4.3;
    else if (E.tipo === 'calle') {
      visible = visible && zoom > (E.imp > 1 ? 3.1 : 3.9);
      if (visible) { // orientar a lo largo de la calle
        const pa = proyectar(E.a[0], E.a[1], 2, {}), pb = proyectar(E.b[0], E.b[1], 2, {});
        let ang = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        const lenPx = Math.hypot(pb.x - pa.x, pb.y - pa.y);
        if (lenPx < E.el.offsetWidth * 0.9 + 20) visible = false;
        E.ang = ang;
      }
    } else if (E.tipo === 'mar' || E.tipo === 'borde') visible = visible && zoom < 3.5;
    if (visible) {
      const w = E.w || (E.w = E.el.offsetWidth || 120), hh = E.hh || (E.hh = E.el.offsetHeight || 24);
      const r = E.tipo === 'lugar' ? { x: o.x - 14, y: o.y - hh, w: w, h: hh } : { x: o.x - w / 2, y: o.y - hh / 2, w, h: hh };
      if (E.tipo !== 'calle' && !E.sel && choca(r)) visible = false;
      else if (E.tipo !== 'calle') ocupados.push(r);
    }
    if (visible) {
      E.el.style.display = '';
      if (E.tipo === 'calle') E.el.style.transform = `translate(${o.x}px,${o.y}px) translate(-50%,-50%) rotate(${E.ang}deg)`;
      else if (E.tipo === 'lugar') E.el.style.transform = `translate(${o.x - 13}px,${o.y - 30}px)`;
      else E.el.style.transform = `translate(${o.x}px,${o.y}px) translate(-50%,-50%)`;
      E.el.style.zIndex = E.sel ? 1000 : Math.round(E.imp * 10);
    } else E.el.style.display = 'none';
  }
}

/* ------------------------------------------------------------------ */
/* Panel lateral                                                       */
/* ------------------------------------------------------------------ */
const panel = $('#panel'), cuerpo = $('#panel .cuerpo');
function tituloNovela(slug) { const n = NOVELAS[slug]; return n ? tr(n.es, n.ru || n.t) : slug; }
function capitulos(a, max = 6) {
  const n = NOVELAS[a.n];
  const chips = a.c.map(([seg, t]) => `<a class="cap" target="_blank" rel="noopener" href="${LITMIR}${a.n}/${seg}" title="${esc(t)}">${seg.startsWith('extra') ? '✦' : tr('Cap. ', 'Гл. ') + seg}${t ? ' · ' + esc(t) : ''}</a>`);
  const mas = chips.length > max ? `<button class="mas">+ ${chips.length - max} ${tr('capítulos más', 'ещё')}</button>` : '';
  return `<div class="caps">${chips.slice(0, max).join('')}${chips.length > max ? `<span class="ocultos">${chips.slice(max).join('')}</span>` : ''}${mas}</div>`;
}
function fichaNovela(a) {
  const n = NOVELAS[a.n] || {};
  const princ = tituloNovela(a.n), orig = n.t && n.t !== princ ? `<i>${esc(n.t)}</i> · ` : '';
  return `<div class="nov">
    ${n.p ? `<img class="port" src="${n.p}" alt="" loading="lazy">` : '<div class="port"></div>'}
    <div class="txt"><a class="tn" href="${LITMIR}${a.n}" target="_blank" rel="noopener">${esc(princ)}</a>
    <div class="meta">${orig}${esc(tr(IDIOMAS[n.l], IDIOMAS_RU[n.l]) || n.l || '')}${n.y ? ' · ' + n.y : ''} · <button class="lnk" data-filtro="${a.n}">${tr('ver sus lugares en el mapa', 'места на карте')}</button></div>
    ${capitulos(a)}</div></div>`;
}
const promedio = (L) => L.res.reduce((t, r) => t + r.s, 0) / L.res.length;
function estrellas(n) { let h = ''; for (let i = 1; i <= 5; i++) h += `<i class="${n >= i - .25 ? 'll' : n >= i - .75 ? 'md' : ''}">★</i>`; return `<span class="est">${h}</span>`; }
const COL_AV = ['#e8453c', '#1a73e8', '#0f9d58', '#f4b400', '#ab47bc', '#00acc1', '#ff7043', '#5c6bc0', '#8d6e63'];
function resenasHTML(L) {
  if (!L.res) return '';
  const items = L.res.map(r => { const nom = tr(r.a, r.ar || r.a); let h = 0; for (const c of r.a) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const resp = /^(Respuesta del propietario|Ответ владельца)/.test(r.es);
    return `<div class="res${resp ? ' resp' : ''}"><div class="av" style="background:${COL_AV[h % COL_AV.length]}">${esc(nom[0])}</div><div><b>${esc(nom)}</b>${resp ? '' : ` ${estrellas(r.s)}`}<p>${esc(tr(r.es, r.ru || r.es))}</p></div></div>`; }).join('');
  return `<h3 id="resenas">${tr('Reseñas de los vecinos', 'Отзывы жителей')} <small>${tr('escritas por los personajes', 'от персонажей')}</small></h3><div class="resenas">${items}</div>`;
}
function abrirLugar(id, mover = false) {
  const L = LUGARES.find(l => l.id === id); if (!L) return;
  seleccion = id;
  const [cnEs, col, cnRu] = CAT[L.cat] || CAT.edificio, cn = tr(cnEs, cnRu);
  const total = peso(L);
  const im = L.img ? `<figure class="foto"><img src="${L.img.src}" alt=""><figcaption>${tr('Ilustración de', 'Иллюстрация:')} <a href="${LITMIR}${L.img.n}/${L.img.c}" target="_blank" rel="noopener">${esc(tituloNovela(L.img.n))}, ${tr('cap.', 'гл.')} ${esc(L.img.c)}</a></figcaption></figure>` : '';
  cuerpo.innerHTML = `${im}
    <div class="cab"><span class="cat" style="--c:${col}">${esc(cn)}</span>
    <h2>${esc(nomL(L))}</h2>
    ${otrosL(L).length ? `<div class="otros">${otrosL(L).map(esc).join(' · ')}</div>` : ''}</div>
    <div class="acciones"><button data-acc="volar">${tr('Acercarse', 'Приблизить')}</button><button data-acc="girar">${tr('Dar la vuelta', 'Облететь')}</button><button data-acc="link">${tr('Copiar enlace', 'Скопировать ссылку')}</button>${FP[L.id] ? `<a href="${FADERPEDIA()}${FP[L.id]}" target="_blank" rel="noopener">${tr('Faderpedia', 'Фадерпедия')}</a>` : ''}</div>
    ${L.res ? `<div class="nota" data-ir="1"><b>${promedio(L).toFixed(1).replace('.', lang === 'ru' ? ',' : ',')}</b> ${estrellas(promedio(L))} <span>(${L.res.length} ${plural(L.res.length, 'reseña', 'reseñas', 'отзыв', 'отзыва', 'отзывов')})</span></div>` : ''}
    ${L.lejos ? `<p class="lejos">${tr(`Queda a unos ${L.lejos} km del centro, fuera del mapa: el marcador está en el borde, en la dirección en que hay que ir.`, `Это примерно в ${L.lejos} км от центра, за пределами карты: метка стоит на краю, в той стороне, куда нужно ехать.`)}</p>` : ''}
    <p class="desc">${esc(descL(L))}</p>
    ${resenasHTML(L)}
    ${L.apar.length ? `<h3>${lang === 'ru' ? `Встречается в ${L.apar.length} ${plural(L.apar.length, '', '', 'романе', 'романах', 'романах')}` : `Aparece en ${L.apar.length === 1 ? 'una novela' : L.apar.length + ' novelas'}`} <small>${total} ${plural(total, 'capítulo', 'capítulos', 'глава', 'главы', 'глав')}</small></h3>
    ${L.apar.map(fichaNovela).join('')}` : `<p class="vacio">${tr('Este lugar no aparece en el texto de las novelas.', 'Этого места нет в тексте романов.')}</p>`}`;
  panel.classList.add('abierto'); panel.scrollTop = 0; cuerpo.scrollTop = 0;
  if (id === 'vg-autobus-7' && autobus) { siguiendo = true; if (mover) volar(autobus.estado.x, autobus.estado.y, 260, 1.0, null, 900); }
  else if (mover) volar(L.x, L.y, distanciaPara(L), 0.98);
  cuerpo.querySelector('[data-acc=volar]').onclick = () => volar(L.x, L.y, distanciaPara(L), 0.98);
  cuerpo.querySelector('[data-acc=girar]').onclick = () => { volar(L.x, L.y, distanciaPara(L), 1.05); orbita = performance.now(); };
  cuerpo.querySelector('[data-acc=link]').onclick = (e) => { navigator.clipboard?.writeText(location.href); e.target.textContent = tr('Enlace copiado', 'Ссылка скопирована'); };
  history.replaceState(null, '', urlCon('#/lugar/' + id));
}
const distanciaPara = (L) => ({ 'torre-tv': 700, laberinto: 700, 'colina-oeste': 900, 'rio-sina': 1400, 'barrio-ricos': 900, 'estacion-central': 520, brecha: 700 }[L.modelo] || { barrio: 900, calle: 520 }[L.cat] || 380);
let orbita = 0;
function cerrarPanel() { panel.classList.remove('abierto'); seleccion = null; if (!filtro) history.replaceState(null, '', urlCon('#/')); }
$('#panel .cerrar').onclick = cerrarPanel;
cuerpo.addEventListener('click', (e) => {
  const b = e.target.closest('.mas'); if (b) { b.parentElement.classList.add('todo'); b.remove(); }
  if (e.target.closest('[data-ir]')) cuerpo.querySelector('#resenas')?.scrollIntoView({ behavior: 'smooth' });
  const f = e.target.closest('[data-filtro]'); if (f) aplicarFiltro(f.dataset.filtro, true);
  const l = e.target.closest('[data-lugar]'); if (l) abrirLugar(l.dataset.lugar, true);
});

const pN = (P) => tr(P[0], P[3]), pD = (P) => tr(P[2], P[4]);
const PERSONAJES = {
  vasili: ['El detective Vasili', ['opasnoe-svidanie', 'almaznyj-dozhd', 'chi-ha-visto-sasha', 'el-tren', 'strateg'], 'Detective privado: «Una cita peligrosa», «Lluvia de diamantes», «¿Quién ha visto a Sasha?», «El tren», «El estratega»…', 'Детектив Василий', 'Частный детектив: «Опасное свидание», «Алмазный дождь», «Кто видел Сашу?», «Поезд», «Стратег»…'],
  sasha: ['Sasha, la que oye', ['golos', 'la-voix', 'chi-ha-visto-sasha', 'almaznyj-dozhd'], 'La oficinista que escuchó al delfín Ael y hoy dirige el Centro de Anomalías del faro.', 'Саша, которая слышит', 'Офисная работница, услышавшая дельфина Аэля, а теперь — глава Центра аномалий на маяке.'],
  marcos: ['Marcos y Alicia', ['el-tren-fantasma', 'prizrachnyj-poezd', 'il-treno-fantasma', 'znak', 'bezumie-v-poezde'], 'El detective que no cree en las estrellas y la astróloga que lo hace subir al tren fantasma.', 'Марк и Алисия', 'Детектив, который не верит в звёзды, и астролог, из-за которой он садится в призрачный поезд.'],
  irina: ['Irina, la psicóloga', ['mashina-snov'], '«La máquina de los sueños»: los cuatro jinetes, la cita en la Fucsia, el viejo faro.', 'Ирина, психолог', '«Машина снов»: четыре всадника, свидание в «Фуксии», старый маяк.'],
  franco: ['Franco y Chiara', ['grustnyj-gorod', 'la-citta-triste'], 'Los que devolvieron la risa a la ciudad triste.', 'Франко и Кьяра', 'Те, кто вернул смех грустному городу.'],
  natalia: ['Luis, Natalia y el zorro', ['volny-lyubvi', 'ondas-de-amor', 'onde-d-amore', 'volny-lyubvi-gorod-bez-ulybok', 'volny-lyubvi-narisovannyj-mir', 'volny-lyubvi-krepost', 'volny-lyubvi-labirint-zabveniya', 'onde-d-amore-3'], '«Ondas de amor»: el dibujo del zorro, la torre, las ondas rosas y turquesas.', 'Луис, Наталья и лис', '«Волны любви»: рисунок лиса, башня, розовые и бирюзовые волны.'],
  alessio: ['Alessio, Laura y Tatiana', ['pokhititel-serdec-portret-osnovatelya', 'la-chica-del-retrato'], '«Ladrón de corazones» y «La chica del retrato».', 'Алессио, Лаура и Татьяна', '«Похититель сердец» и «Девушка с портрета».'],
  fabrizio: ['Fabrizio y Lucía', ['tikhaya-lyubov', 'ti-amo-in-silenzio'], '«Amor en silencio»: la carrera al faro del verano de 1997.', 'Фабрицио и Лючия', '«Тихая любовь»: гонка к маяку летом 1997 года.']
};

/* ------------------------------------------------------------------ */
/* Filtro por novela y recorrido                                       */
/* ------------------------------------------------------------------ */
let ruta = null;
const sel = $('#novela');
const usadas = Object.keys(NOVELAS).map(s => [s, LUGARES.filter(L => L.apar.some(a => a.n === s)).length]).filter(x => x[1] > 0).sort((a, b) => tituloNovela(a[0]).localeCompare(tituloNovela(b[0]), 'es'));
function llenarSelect() {
  const v = sel.value;
  const us = usadas.slice().sort((a, b) => tituloNovela(a[0]).localeCompare(tituloNovela(b[0]), lang));
  sel.innerHTML = `<option value="">${tr('Todas las novelas y personajes', 'Все романы и персонажи')}</option><optgroup label="${tr('En la ciudad', 'В городе')}"><option value="c:casa">${tr('Casas de los personajes', 'Дома персонажей')}</option><option value="c:res">${tr('Lugares con reseñas', 'Места с отзывами')}</option></optgroup><optgroup label="${tr('Personajes', 'Персонажи')}">` + Object.entries(PERSONAJES).filter(([k, p]) => LUGARES.some(L => L.apar.some(a => p[1].includes(a.n)))).map(([k, p]) => `<option value="p:${k}">${esc(pN(p))}</option>`).join('') + `</optgroup><optgroup label="${tr('Novelas', 'Романы')}">` + us.map(([s, n]) => `<option value="${s}">${esc(tituloNovela(s))} (${n})</option>`).join('') + '</optgroup>';
  sel.value = v;
}
sel.onchange = () => aplicarFiltro(sel.value || null, true);

let filtroActual = null;
function aplicarFiltro(slug, mover) {
  if (ruta) { escena.remove(ruta); ruta.geometry.dispose(); ruta = null; }
  sel.value = slug || '';
  if (!slug) { filtroActual = null; filtro = null; filtroIds = null; if (!seleccion) history.replaceState(null, '', urlCon('#/')); $('#recorrido').hidden = true; return; }
  filtroIds = null;
  if (slug.startsWith('p:')) return filtroPersonaje(slug.slice(2), mover);
  if (slug.startsWith('c:')) return filtroCategoria(slug.slice(2), mover);
  const n = NOVELAS[slug];
  const fam = new Set([slug, ...Object.values(n.tr || {}).filter(s => NOVELAS[s])]);
  filtro = fam;
  // orden de aparición: primer capítulo en que se menciona
  const lugares = LUGARES.map(L => { const a = L.apar.find(a => a.n === slug); return a ? { L, c: Math.min(...a.c.map(c => parseInt(c[0]) || 999)), a } : null; }).filter(Boolean).sort((a, b) => a.c - b.c);
  // panel con el recorrido
  cuerpo.innerHTML = `<div class="cab nv">${n.p ? `<img class="portg" src="${n.p}" alt="">` : ''}<div><span class="cat" style="--c:#444">${tr('Recorrido', 'Маршрут')}</span><h2>${esc(tituloNovela(slug))}</h2><div class="otros">${n.t !== tituloNovela(slug) ? esc(n.t) + ' · ' : ''}${esc(tr(IDIOMAS[n.l], IDIOMAS_RU[n.l]) || '')}${n.y ? ' · ' + n.y : ''}</div>
    <div class="acciones"><a href="${LITMIR}${slug}" target="_blank" rel="noopener">${tr('Leer en LitFader', 'Читать на ЛитФадере')}</a><button data-filtro="">${tr('Quitar filtro', 'Снять фильтр')}</button></div></div></div>
    <p class="desc">${tr(`Los lugares de ${NOMBRE.es} por los que pasa la novela, en el orden en que aparecen.`, `Места ${NOMBRE.gen}, через которые проходит роман, в порядке появления.`)}</p>
    <ol class="lista">${lugares.map(({ L, c, a }) => `<li><button data-lugar="${L.id}"><b>${esc(nomL(L))}</b><span>${tr('desde el cap.', 'с главы')} ${c} · ${a.c.length} ${tr('cap.', 'гл.')}</span></button></li>`).join('')}</ol>`;
  panel.classList.add('abierto'); seleccion = null;
  $('#recorrido').hidden = false; $('#recorrido span').textContent = tituloNovela(slug); filtroActual = slug;
  history.replaceState(null, '', urlCon('#/novela/' + slug));
  // línea del recorrido
  if (lugares.length > 1) {
    const pts = [];
    for (let i = 0; i < lugares.length - 1; i++) {
      const A = lugares[i].L, B = lugares[i + 1].L;
      for (let k = 0; k <= 24; k++) { const x = A.x + (B.x - A.x) * k / 24, y = A.y + (B.y - A.y) * k / 24; pts.push(new THREE.Vector3(x, Math.max(0, altura(x, y)) + 30 + Math.sin(k / 24 * Math.PI) * 60, -y)); }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    ruta = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0xe8453c, dashSize: 26, gapSize: 16, transparent: true, opacity: .9, depthTest: false }));
    ruta.computeLineDistances(); ruta.renderOrder = 5; escena.add(ruta);
  }
  if (mover && lugares.length) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; lugares.forEach(({ L }) => { x0 = Math.min(x0, L.x); x1 = Math.max(x1, L.x); y0 = Math.min(y0, L.y); y1 = Math.max(y1, L.y); });
    volar((x0 + x1) / 2, (y0 + y1) / 2, Math.max(900, Math.max(x1 - x0, y1 - y0) * 1.25), 0.8);
  }
}
$('#recorrido button').onclick = () => aplicarFiltro(null);

function filtroCategoria(k, mover) {
  const lugares = LUGARES.filter(L => k === 'casa' ? L.cat === 'casa' : !!L.res).sort((a, b) => k === 'res' ? b.res.length - a.res.length : 0);
  filtro = new Set(); filtroIds = new Set(lugares.map(L => L.id));
  const tit = k === 'casa' ? tr('Casas de los personajes', 'Дома персонажей') : tr('Lugares con reseñas', 'Места с отзывами');
  cuerpo.innerHTML = `<div class="cab"><span class="cat" style="--c:#e0672b">${tr('En la ciudad', 'В городе')}</span><h2>${esc(tit)}</h2>
    <div class="acciones"><button data-filtro="">${tr('Quitar filtro', 'Снять фильтр')}</button></div></div>
    <ol class="lista">${lugares.map(L => `<li><button data-lugar="${L.id}"><b>${esc(nomL(L))}</b><span>${L.res ? promedio(L).toFixed(1) + ' ★ · ' + L.res.length + ' ' + plural(L.res.length, 'reseña', 'reseñas', 'отзыв', 'отзыва', 'отзывов') : esc(tr(CAT[L.cat][0], CAT[L.cat][2]))}</span></button></li>`).join('')}</ol>`;
  panel.classList.add('abierto'); seleccion = null; filtroActual = 'c:' + k;
  $('#recorrido').hidden = false; $('#recorrido span').textContent = tit;
  history.replaceState(null, '', urlCon('#/'));
  if (mover) volar(...VISTA.cat);
}
function filtroPersonaje(k, mover) {
  const P = PERSONAJES[k]; if (!P) return;
  filtro = new Set(P[1]);
  const lugares = LUGARES.map(L => { const ap = L.apar.filter(a => filtro.has(a.n)); return ap.length ? { L, ap, n: ap.reduce((s, a) => s + a.c.length, 0) } : null; }).filter(Boolean).sort((a, b) => b.n - a.n);
  cuerpo.innerHTML = `<div class="cab"><span class="cat" style="--c:#444">${tr('Personaje', 'Персонаж')}</span><h2>${esc(pN(P))}</h2><div class="otros">${esc(pD(P))}</div>
    <div class="acciones"><button data-filtro="">${tr('Quitar filtro', 'Снять фильтр')}</button></div></div>
    <p class="desc">${tr(`Los lugares de ${NOMBRE.es} por los que pasa, ordenados por cuántas veces aparecen en sus novelas.`, `Места ${NOMBRE.gen}, где бывает герой, — по тому, как часто они встречаются в его романах.`)}</p>
    <ol class="lista">${lugares.map(({ L, ap, n }) => `<li><button data-lugar="${L.id}"><b>${esc(nomL(L))}</b><span>${ap.map(a => esc(tituloNovela(a.n))).join(' · ')} · ${n} ${tr('cap.', 'гл.')}</span></button></li>`).join('')}</ol>`;
  panel.classList.add('abierto'); seleccion = null;
  $('#recorrido').hidden = false; $('#recorrido span').textContent = pN(P); filtroActual = 'p:' + k;
  history.replaceState(null, '', urlCon('#/personaje/' + k));
  if (mover && lugares.length) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; lugares.forEach(({ L }) => { x0 = Math.min(x0, L.x); x1 = Math.max(x1, L.x); y0 = Math.min(y0, L.y); y1 = Math.max(y1, L.y); });
    volar((x0 + x1) / 2, (y0 + y1) / 2, Math.max(900, Math.max(x1 - x0, y1 - y0) * 1.2), 0.8);
  }
}

/* ------------------------------------------------------------------ */
/* Búsqueda                                                            */
/* ------------------------------------------------------------------ */
const bus = $('#buscar'), res = $('#resultados');
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
bus.addEventListener('input', () => {
  const q = norm(bus.value.trim()); if (!q) { res.hidden = true; return; }
  const lug = LUGARES.map(L => {
    const nom = norm(L.nombre + ' ' + (L.nombre_ru || '') + ' ' + (L.otros || []).join(' ')); const d = norm(descL(L) + ' ' + (L.res || []).map(r => r.a + ' ' + r.ar + ' ' + tr(r.es, r.ru)).join(' '));
    const s = nom.includes(q) ? 3 : d.includes(q) ? 1 : 0; return [s, L];
  }).filter(x => x[0]).sort((a, b) => b[0] - a[0] || peso(b[1]) - peso(a[1])).slice(0, 8);
  const nov = Object.entries(NOVELAS).filter(([s, n]) => norm(n.es + ' ' + n.t + ' ' + (n.ru || '')).includes(q)).slice(0, 5);
  const calles = CALLES.filter(c => norm(c[0] + ' ' + (c[3] || '')).includes(q)).slice(0, 3);
  const pers = Object.entries(PERSONAJES).filter(([k, p]) => norm(p[0] + ' ' + p[3] + ' ' + k).includes(q) || (q === 'vasily' && k === 'vasili'));
  res.innerHTML = pers.map(([k, p]) => `<button data-personaje="${k}"><svg viewBox="0 0 24 24" style="fill:#e8453c"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0z"/></svg><span><b>${esc(pN(p))}</b><small>${tr('Personaje · ver sus lugares', 'Персонаж · его места')}</small></span></button>`).join('') + lug.map(([s, L]) => `<button data-lugar="${L.id}"><svg viewBox="0 0 24 24" style="fill:${(CAT[L.cat] || CAT.edificio)[1]}">${ICONO[L.cat] || ''}</svg><span><b>${esc(nomL(L))}</b><small>${s === 1 ? esc(fragmento(descL(L), q)) : esc(tr((CAT[L.cat] || [''])[0], (CAT[L.cat] || ['', '', ''])[2]))}</small></span></button>`).join('')
    + nov.map(([s, n]) => `<button data-novela="${s}"><svg viewBox="0 0 24 24" style="fill:#444"><path d="M5 3h11a3 3 0 013 3v15H8a3 3 0 01-3-3z"/></svg><span><b>${esc(tituloNovela(s))}</b><small>${tr('Novela · ver su recorrido', 'Роман · маршрут по городу')}</small></span></button>`).join('')
    + calles.map(c => `<button data-calle="${esc(c[0])}"><svg viewBox="0 0 24 24" style="fill:#999"><path d="M10 2h4v20h-4z"/></svg><span><b>${esc(tr(c[0], c[3] || c[0]))}</b><small>${tr('Calle', 'Улица')}</small></span></button>`).join('')
    || `<div class="nada">${tr(`Nada con ese nombre en ${NOMBRE.es}… todavía.`, 'Здесь такого пока нет…')}</div>`;
  res.hidden = false;
});
function fragmento(t, q) { const i = norm(t).indexOf(q); return (i > 30 ? '…' : '') + t.slice(Math.max(0, i - 30), i + 50) + '…'; }
res.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.lugar) abrirLugar(b.dataset.lugar, true);
  if (b.dataset.novela) aplicarFiltro(b.dataset.novela, true);
  if (b.dataset.personaje) aplicarFiltro('p:' + b.dataset.personaje, true);
  if (b.dataset.calle) { const c = CALLES.find(c => c[0] === b.dataset.calle); const p = c[2][Math.floor(c[2].length / 2)]; volar(p[0], p[1], 500, .9); }
  res.hidden = true; bus.blur();
});
bus.addEventListener('keydown', (e) => { if (e.key === 'Enter') res.querySelector('button')?.click(); if (e.key === 'Escape') { res.hidden = true; bus.blur(); } });
addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== bus) { e.preventDefault(); bus.focus(); } });

/* ------------------------------------------------------------------ */
/* Controles de la interfaz                                            */
/* ------------------------------------------------------------------ */
let noche = 0, nocheObj = 0;
$('#b-noche').onclick = () => { nocheObj = nocheObj ? 0 : 1; $('#b-noche').classList.toggle('on', !!nocheObj); $('#b-noche').title = nocheObj ? tr('Hacer de día', 'Сделать день') : tr('Hacer de noche', 'Сделать ночь'); };
$('#b-mas').onclick = () => zoomPaso(0.6);
$('#b-menos').onclick = () => zoomPaso(1.6);
function zoomPaso(f) { const off = camara.position.clone().sub(controles.target); const l = THREE.MathUtils.clamp(off.length() * f, controles.minDistance, controles.maxDistance); vuelo = { t0: controles.target.clone(), t1: controles.target.clone(), p0: camara.position.clone(), p1: controles.target.clone().add(off.setLength(l)), ini: performance.now(), ms: 450 }; }
$('#b-norte').onclick = () => { const t = controles.target; volar(t.x, -t.z, camara.position.distanceTo(t), new THREE.Spherical().setFromVector3(camara.position.clone().sub(t)).phi, 0, 700); };
$('#b-3d').onclick = () => {
  const t = controles.target, sph = new THREE.Spherical().setFromVector3(camara.position.clone().sub(t));
  const plano = sph.phi < 0.2; volar(t.x, -t.z, sph.radius, plano ? 0.95 : 0.01, null, 800);
  $('#b-3d').textContent = plano ? '2D' : '3D';
};
$('#b-casa').onclick = () => { volar(...VISTA.toda); };

// clic sobre el mapa: lugar más cercano al punto
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
let abajo = null;
lienzo.addEventListener('pointerdown', (e) => { abajo = [e.clientX, e.clientY]; });
lienzo.addEventListener('pointerup', (e) => {
  if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 5) return;
  res.hidden = true;
  mouse.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mouse, camara);
  const hit = ray.intersectObjects([escena.getObjectByName('terreno'), hitos.grupo], true)[0]; if (!hit) return;
  const x = hit.point.x, y = -hit.point.z;
  let best = null, bd = 1e9; for (const L of LUGARES) { const d = Math.hypot(L.x - x, L.y - y); if (d < bd) { bd = d; best = L; } }
  const lim = camara.position.distanceTo(controles.target) * 0.06 + 25;
  if (best && bd < lim) abrirLugar(best.id, false);
});
lienzo.addEventListener('dblclick', (e) => {
  mouse.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mouse, camara);
  const hit = ray.intersectObject(escena.getObjectByName('terreno'))[0]; if (!hit) return;
  const off = camara.position.clone().sub(controles.target);
  volar(hit.point.x, -hit.point.z, Math.max(controles.minDistance, off.length() * .5), new THREE.Spherical().setFromVector3(off).phi, null, 600);
});

addEventListener('resize', () => { camara.aspect = innerWidth / innerHeight; camara.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); ETQ.forEach(E => E.w = 0); });

/* ------------------------------------------------------------------ */
const brujula = $('#b-norte svg');
const T0 = performance.now();
function cuadro() {
  const now = performance.now(), t = (now - T0) / 1000;
  pasoVuelo(now);
  if (orbita) { if (now - orbita > 1500 && !vuelo) { const off = camara.position.clone().sub(controles.target); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.004); camara.position.copy(controles.target).add(off); } if (now - orbita > 18000) orbita = 0; }
  controles.update(); limitar();
  noche += (nocheObj - noche) * 0.04; if (Math.abs(noche - nocheObj) < .002) noche = nocheObj;
  U.uT.value = t; U.uNoche.value = noche; document.body.classList.toggle('noche', noche > .5);
  escena.background.copy(CIELO_DIA).lerp(CIELO_NOCHE, noche); escena.fog.color.copy(escena.background);
  const d = camara.position.distanceTo(controles.target);
  escena.fog.near = d * 0.8 + 200; escena.fog.far = d * 2.7 + 2500;
  sol.intensity = 2.6 * (1 - noche) + 0.15 * noche; sol.color.setHSL(0.1, 0.6 - noche * .3, 0.9 - noche * .2);
  cielo.intensity = 1.25 * (1 - noche) + 0.55 * noche; cielo.color.setHSL(0.58, 0.5, 0.9 - noche * .55);
  renderer.toneMappingExposure = 1.05 - noche * 0.2;
  // la sombra sigue a la cámara
  const T = controles.target, ext = THREE.MathUtils.clamp(d * 0.9, 300, 2600);
  sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.updateProjectionMatrix();
  sol.position.set(T.x + 1400, T.y + 2600, T.z + 900); sol.target.position.copy(T);
  if (hitos) hitos.anims.forEach(f => f(t, noche));
  if (delf) delf.anim(t); if (tren) tren.anim(t, noche); if (gond) gond.anim(t, noche);
  if (autobus) {
    autobus.anim(t, noche);
    if (siguiendo) { const h = altura(autobus.estado.x, autobus.estado.y); const nt = new THREE.Vector3(autobus.estado.x, h, -autobus.estado.y); const d = nt.sub(controles.target).multiplyScalar(.08); controles.target.add(d); camara.position.add(d); }
  }
  const az = Math.atan2(camara.position.x - T.x, camara.position.z - T.z);
  brujula.style.transform = `rotate(${az * 180 / Math.PI}deg)`;
  renderer.render(escena, camara);
  etiquetas(); marcaAutobus();
  requestAnimationFrame(cuadro);
}

/* ------------------------------------------------------------------ */
/* Cambio de idioma                                                    */
/* ------------------------------------------------------------------ */
function urlCon(hash) {
  const q = new URLSearchParams(); if (CIUDAD !== 'sinea') q.set('ciudad', CIUDAD); if (lang === 'ru') q.set('lang', 'ru');
  const qs = q.toString(); return location.pathname.replace(/(verdegrad|utopia|mendoza|venezia)\.html$/, 'index.html') + (qs ? '?' + qs : '') + hash;
}
function irCiudad(c) { const q = new URLSearchParams(); if (c !== 'sinea') q.set('ciudad', c); if (lang === 'ru') q.set('lang', 'ru'); location.href = location.pathname.replace(/(verdegrad|utopia|mendoza|venezia)\.html$/, 'index.html') + (q.toString() ? '?' + q : ''); }
document.querySelectorAll('#ciudad button').forEach(b => { b.classList.toggle('on', b.dataset.c === CIUDAD); b.onclick = () => { if (b.dataset.c !== CIUDAD) irCiudad(b.dataset.c); }; });
const ESTATICO = [
  ['#buscar', 'placeholder', `Buscar en ${NOMBRE.es}: un lugar, una novela, un personaje…`, `Поиск по ${NOMBRE.dat}: место, роман, персонаж…`],
  ['#novela', 'aria-label', 'Filtrar por novela', 'Фильтр по роману'],
  ['#b-norte', 'title', 'Mirar al norte', 'На север'], ['#b-3d', 'title', 'Vista 2D / 3D', 'Вид 2D / 3D'],
  ['#b-noche', 'title', 'Hacer de noche', 'Сделать ночь'], ['#b-casa', 'title', 'Ver toda la ciudad', 'Весь город'],
  ['#b-mas', 'title', 'Acercar', 'Приблизить'], ['#b-menos', 'title', 'Alejar', 'Отдалить'],
  ['#panel .cerrar', 'title', 'Cerrar', 'Закрыть'], ['#recorrido button', 'title', 'Quitar filtro', 'Снять фильтр'],
  ['#recorrido b', 'text', 'Recorrido:', 'Маршрут:'],
  ['#carga .sub', 'text', LEMA.es, LEMA.ru],
  ['#pie', 'html', `<b>${NOMBRE.es}</b> · ${CIUDAD === 'sinea' ? 'la ciudad' : CIUDAD === 'utopia' ? 'la fortaleza' : CIUDAD === 'mendoza' || CIUDAD === 'venezia' ? 'la ciudad real' : 'un pueblo'} de las novelas de <a href="https://luisfader.github.io/litmir/" target="_blank" rel="noopener">Robert Fader</a>${CIUDAD === 'mendoza' || CIUDAD === 'venezia' ? ' · mapa: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' : ''} · <a href="https://luisfader.github.io/faderpedia/" target="_blank" rel="noopener">Faderpedia</a> · <span class="ayuda">arrastrá para moverte · clic derecho o dos dedos para girar · rueda para el zoom</span>`,
    `<b>${NOMBRE.ru}</b> · ${CIUDAD === 'sinea' ? 'город' : CIUDAD === 'utopia' ? 'крепость' : CIUDAD === 'mendoza' || CIUDAD === 'venezia' ? 'настоящий город' : 'городок'} из романов <a href="https://luisfader.github.io/litmir/" target="_blank" rel="noopener">Роберта Фадера</a>${CIUDAD === 'mendoza' || CIUDAD === 'venezia' ? ' · карта: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' : ''} · <a href="https://luisfader.github.io/faderpedia/" target="_blank" rel="noopener">Фадерпедия</a> · <span class="ayuda">тяните, чтобы двигаться · правая кнопка или два пальца — поворот · колесо — масштаб</span>`]
];
function ponerIdioma(l, refrescar = true) {
  lang = l === 'ru' ? 'ru' : 'es';
  try { localStorage.setItem('sinea-lang', lang); } catch (e) {}
  document.documentElement.lang = lang;
  document.title = tr(`Mapas de los mundos literarios de Robert Fader · ${NOMBRE.es}`, `Карты миров Роберта Фадера · ${NOMBRE.ru}`);
  $('#carga .titulo-mapas').textContent = tr('Mapas de los mundos literarios de Robert Fader', 'Карты миров Роберта Фадера');
  $('#carga .logo').textContent = tr(NOMBRE.es, NOMBRE.ru);
  document.querySelectorAll('#ciudad button').forEach(b => b.textContent = tr(b.dataset.es, b.dataset.ru));
  for (const [q, at, es, ru] of ESTATICO) { const el = $(q); if (!el) continue; const v = tr(es, ru); if (at === 'text') el.textContent = v; else if (at === 'html') el.innerHTML = v; else el.setAttribute(at, v); }
  document.querySelectorAll('#idioma button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  for (const E of ETQ) { const t = E.texto(); const nm = E.el.querySelector('.nm'); (nm || E.el).textContent = t; if (E.titulo) E.el.title = E.titulo(); E.w = 0; E.hh = 0; }
  llenarSelect();
  if (!refrescar) return;
  if (bus.value) bus.dispatchEvent(new Event('input'));
  if (seleccion) abrirLugar(seleccion, false);
  else if (filtroActual) aplicarFiltro(filtroActual, false);
  else history.replaceState(null, '', urlCon(location.hash || '#/'));
  const ab = panel.classList.contains('abierto'); if (!seleccion && !filtroActual && ab) cerrarPanel();
}
document.querySelectorAll('#idioma button').forEach(b => b.onclick = () => ponerIdioma(b.dataset.l));
ponerIdioma(lang, false);

/* ------------------------------------------------------------------ */
function ruta0() {
  const m = location.hash.match(/^#\/(lugar|novela|personaje)\/([\w-]+)/);
  if (m && m[1] === 'personaje' && PERSONAJES[m[2]]) { aplicarFiltro('p:' + m[2], true); return true; }
  if (m && m[1] === 'lugar') { abrirLugar(m[2], true); return true; }
  if (m && m[1] === 'novela' && NOVELAS[m[2]]) { aplicarFiltro(m[2], true); return true; }
  return false;
}
addEventListener('hashchange', ruta0);

(async () => {
  vistaInicial();
  try { await construir(); }
  catch (e) { console.error(e); progreso('Error: ' + e.message); return; }
  $('#carga').classList.add('fuera');
  cuadro();
  if (!ruta0()) setTimeout(() => volar(...VISTA.inicio, 3200), 400);
  window.SINEA = { escena, camara, controles, volar, abrirLugar, aplicarFiltro, noche: (v) => { nocheObj = v; noche = v; }, n: edificios.userData.n };
})();
