// Geografía de San Petersburgo, la ciudad real de «Резонанс любви».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es la Plaza del Palacio (59.9390, 30.3158).
// Agua, calles, manzanas y parques salen del mapa de OpenStreetMap (© colaboradores de OpenStreetMap), a 4,79 m por píxel:
// img/spb-tierra.png es el campo de distancias tierra/agua (Neva, Fontanka, Moika, canales) y img/spb-suelo.png el suelo;
// js/ciudades/spb-lotes.js pone un edificio cada 16 m donde OSM dibuja edificios (alturas inventadas, todas parejas,
// como en el centro histórico).
export { LOTES, ARBOLES } from './spb-lotes.js';
export const LOTE_W = 15.5;

const LAT0 = 59.9390, LON0 = 30.3158;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111410;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];
const PX0 = 436.670, PY0 = 372.4696, MPX = 4.786121;
const P = (px, py) => [Math.round((px - PX0) * MPX), Math.round((PY0 - py) * MPX)];

const carga = async (f) => { const im = new Image(); im.src = new URL('../../img/' + f, import.meta.url).href; await im.decode(); return im; };
export const SUELO_IMG = await carga('spb-suelo.png');
const TI = await carga('spb-tierra.png');
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
export const MAR_COLOR = [[.20, .34, .44], [.55, .68, .76]]; // el Neva, gris azulado

export const LIMITES = { x0: P(0, 0)[0], x1: P(1024, 0)[0], y0: P(0, 768)[1], y1: P(0, 0)[1] };
export const CALLES_SOLO_ETIQUETA = true;
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];

function xy(lat, lon) { const [x, y] = LL(lat, lon); return { lx: x, ly: y }; }
const BB = (id, nombre, ru, lat, lon) => ({ id, nombre, ru, ...xy(lat, lon), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] });
export const BARRIOS = [
  BB('vasilievski', 'Isla Vasílievski', 'Васильевский остров', 59.9425, 30.2830),
  BB('petrogradka', 'Lado de Petrogrado', 'Петроградская сторона', 59.9535, 30.3000),
  BB('admiralteiski', 'Almirantazgo', 'Адмиралтейский район', 59.9285, 30.3060),
  BB('centro', 'Centro', 'Центральный район', 59.9340, 30.3470),
  BB('liteini', 'Liteini', 'Литейный', 59.9430, 30.3560)
];
export const CALLES = [
  ['Nevski prospekt', 'av', [LL(59.9367, 30.3133), LL(59.9349, 30.3252), LL(59.9336, 30.3370), LL(59.9330, 30.3480), LL(59.9315, 30.3600)], 'Невский проспект'],
  ['Calle Millónnaya', 'c', [LL(59.9405, 30.3160), LL(59.9433, 30.3270)], 'Миллионная улица'],
  ['Calle Vosstániya', 'c', [LL(59.9300, 30.3605), LL(59.9420, 30.3600)], 'улица Восстания'],
  ['Canal Griboédov', 'c', [LL(59.9400, 30.3285), LL(59.9330, 30.3265), LL(59.9300, 30.3200)], 'канал Грибоедова'],
  ['Moika', 'c', [LL(59.9375, 30.3230), LL(59.9340, 30.3110), LL(59.9300, 30.3000)], 'Мойка'],
  ['Fontanka', 'c', [LL(59.9400, 30.3390), LL(59.9330, 30.3420), LL(59.9260, 30.3360)], 'Фонтанка'],
  ['Neva', 'c', [LL(59.9450, 30.3250), LL(59.9420, 30.3080)], 'Нева'],
  ['Gran Neva', 'c', [LL(59.9375, 30.2950), LL(59.9345, 30.2800)], 'Большая Нева']
];
export const VIAS = [], PLAZAS = [], PARQUES = [];
export const BORDES = [
  { texto: 'Golfo de Finlandia ←', ru: '← Финский залив', ...(([x, y]) => ({ x, y }))(P(30, 600)), mar: true },
  { texto: 'Moscú →', ru: 'Москва →', ...(([x, y]) => ({ x, y }))(P(1000, 740)), mar: true }
];
export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0xe2ddd2;
export const MUELLES = [], RESERVAS = [];
export const EXTRAS = ['spb'];
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [500, -400, 2600, 0.98, 0.35], toda: [300, -300, 5200, 0.85, 0.5], cat: [400, -300, 3200, 0.85], previa: [0, 200], lejos: 8000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'San Petersburgo', ru: 'Санкт-Петербург', gen: 'Санкт-Петербурга', dat: 'Санкт-Петербургу' };
export const LEMA = { es: '«Petersburgo rara vez tranquiliza enseguida, pero a veces avisa»', ru: '«Петербург вообще редко успокаивает сразу. Но иногда он предупреждает»' };
export const ALTURA_BASE = 1;
