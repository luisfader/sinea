// Geografía de Belgrado, la ciudad real de «Дикий час» / «Дивљи час».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es la calle Knez Mihailova (44.8170, 20.4573).
// Agua (el Sava y el Danubio), calles, manzanas y parques salen del mapa de OpenStreetMap (© colaboradores de OpenStreetMap), a 6,78 m por píxel:
// img/bg-tierra.png es el campo de distancias tierra/agua (Neva, Fontanka, Moika, canales) y img/bg-suelo.png el suelo;
// js/ciudades/bg-lotes.js pone un edificio cada 16 m donde OSM dibuja edificios (alturas inventadas, todas parejas,
// como en el centro histórico).
export { LOTES, ARBOLES } from './bg-lotes.js';
export const LOTE_W = 15;

const LAT0 = 44.8170, LON0 = 20.4573;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111140;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];
const PX0 = 520.820, PY0 = 382.6124, MPX = 6.777687;
const P = (px, py) => [Math.round((px - PX0) * MPX), Math.round((PY0 - py) * MPX)];

const carga = async (f) => { const im = new Image(); im.src = new URL('../../img/' + f, import.meta.url).href; await im.decode(); return im; };
export const SUELO_IMG = await carga('bg-suelo.png');
const TI = await carga('bg-tierra.png');
const SW = TI.naturalWidth, SH = TI.naturalHeight, SDF = new Float32Array(SW * SH);
{ const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH; const g = cv.getContext('2d'); g.drawImage(TI, 0, 0);
  const d = g.getImageData(0, 0, SW, SH).data; for (let i = 0; i < SW * SH; i++) SDF[i] = (d[i * 4] - 128) * 2; }
export function costa(x, y) {
  const fx = PX0 + x / MPX - .5, fy = PY0 - y / MPX - .5, i = Math.floor(fx), j = Math.floor(fy);
  if (i < 0 || j < 0 || i >= SW - 1 || j >= SH - 1) return 40;
  const u = fx - i, v = fy - j, k = j * SW + i;
  return (SDF[k] * (1 - u) + SDF[k + 1] * u) * (1 - v) + (SDF[k + SW] * (1 - u) + SDF[k + SW + 1] * u) * v;
}
export function alturaFn(x, y) { const c = costa(x, y); return c < 0 ? Math.max(-8, -1.5 + c * .06) : 2.2 + Math.min(c, 3) * .3; }
export const PLAYA = 0, MARGEN_AGUA = 6;
export const MAR_COLOR = [[.22, .40, .44], [.56, .72, .74]]; // el Sava y el Danubio

export const LIMITES = { x0: P(0, 0)[0], x1: P(1024, 0)[0], y0: P(0, 768)[1], y1: P(0, 0)[1] };
export const CALLES_SOLO_ETIQUETA = true;
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];

function xy(lat, lon) { const [x, y] = LL(lat, lon); return { lx: x, ly: y }; }
const BB = (id, nombre, ru, lat, lon) => ({ id, nombre, ru, ...xy(lat, lon), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] });
export const BARRIOS = [
  BB('stari', 'Ciudad Vieja (Stari grad)', 'Старый город', 44.8195, 20.4620),
  BB('dorcol', 'Dorćol', 'Дорчол', 44.8240, 20.4650),
  BB('vracar', 'Vračar', 'Врачар', 44.7995, 20.4750),
  BB('savamala', 'Savamala', 'Савамала', 44.8110, 20.4520),
  BB('novi', 'Nuevo Belgrado', 'Новый Белград', 44.8130, 20.4170),
  BB('zemun', 'hacia Zemun', 'к Земуну', 44.8340, 20.4180)
];
export const CALLES = [
  ['Knez Mihailova', 'c', [LL(44.8163, 20.4602), LL(44.8180, 20.4555), LL(44.8205, 20.4525)], 'Кнез-Михайлова'],
  ['Kneza Miloša', 'av', [LL(44.8115, 20.4605), LL(44.8030, 20.4590), LL(44.7960, 20.4560)], 'улица Кнеза Милоша'],
  ['Bulevar kralja Aleksandra', 'av', [LL(44.8115, 20.4650), LL(44.8060, 20.4760), LL(44.8010, 20.4880)], 'бульвар Короля Александра'],
  ['Sava', 'c', [LL(44.8250, 20.4420), LL(44.8150, 20.4450), LL(44.8040, 20.4400)], 'Сава'],
  ['Danubio', 'c', [LL(44.8300, 20.4400), LL(44.8300, 20.4700), LL(44.8240, 20.4950)], 'Дунай']
];
export const VIAS = [], PLAZAS = [], PARQUES = [];
export const BORDES = [
  { texto: 'Avala ↓ (16 km)', ru: 'Авала ↓ (16 км)', ...(([x, y]) => ({ x, y }))(P(700, 760)), mar: true },
  { texto: 'Zemun ←', ru: '← Земун', ...(([x, y]) => ({ x, y }))(P(30, 60)), mar: true }
];
export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0xe2ddd2;
export const MUELLES = [], RESERVAS = [];
export const EXTRAS = [];
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [-100, 300, 2600, 0.98, 0.6], toda: [0, -300, 6500, 0.85, 0.5], cat: [0, 0, 3600, 0.85], previa: [0, 200], lejos: 10000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'Belgrado', ru: 'Белград', gen: 'Белграда', dat: 'Белграду' };
export const LEMA = { es: '«Belgrado no quiere a los débiles»', ru: '«Белград не любит слабых»' };
export const ALTURA_BASE = 1;
