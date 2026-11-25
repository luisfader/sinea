// Geografía de Londres, la ciudad real de «El misterio de los Fader: Operación Londres».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es el Big Ben (51.50073, -0.12463).
// Agua (el Támesis y los lagos), calles, manzanas y parques salen del mapa de OpenStreetMap (© colaboradores de OpenStreetMap), a 5,95 m por píxel:
// img/londres-tierra.png es el campo de distancias tierra/agua e img/londres-suelo.png el suelo;
// js/ciudades/londres-lotes.js pone un edificio cada 24 m donde OSM dibuja edificios (alturas inventadas).
export { LOTES, ARBOLES } from './londres-lotes.js';
export const LOTE_W = 20;

const LAT0 = 51.50073, LON0 = -0.12463;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111250;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];
const PX0 = 1107.9553, PY0 = 661.9750, MPX = 5.947801;
const P = (px, py) => [Math.round((px - PX0) * MPX), Math.round((PY0 - py) * MPX)];

const carga = async (f) => { const im = new Image(); im.src = new URL('../../img/' + f, import.meta.url).href; await im.decode(); return im; };
export const SUELO_IMG = await carga('londres-suelo.png');
const TI = await carga('londres-tierra.png');
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
export const MAR_COLOR = [[.30, .38, .40], [.58, .66, .68]]; // el Támesis, gris verdoso

export const LIMITES = { x0: P(0, 0)[0], x1: P(1536, 0)[0], y0: P(0, 1024)[1], y1: P(0, 0)[1] };
export const CALLES_SOLO_ETIQUETA = true;
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];

function xy(lat, lon) { const [x, y] = LL(lat, lon); return { lx: x, ly: y }; }
const BB = (id, nombre, ru, lat, lon) => ({ id, nombre, ru, ...xy(lat, lon), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] });
export const BARRIOS = [
  BB('westminster', 'Westminster', 'Вестминстер', 51.4990, -0.1340),
  BB('pimlico', 'Pimlico', 'Пимлико', 51.4895, -0.1395),
  BB('belgravia', 'Belgravia', 'Белгравия', 51.4975, -0.1540),
  BB('mayfair', 'Mayfair', 'Мейфэр', 51.5100, -0.1480),
  BB('soho', 'Soho', 'Сохо', 51.5135, -0.1335),
  BB('bloomsbury', 'Bloomsbury', 'Блумсбери', 51.5215, -0.1260),
  BB('covent', 'Covent Garden', 'Ковент-Гарден', 51.5120, -0.1225),
  BB('notting', 'Notting Hill', 'Ноттинг-Хилл', 51.5120, -0.2010),
  BB('kensington', 'Kensington', 'Кенсингтон', 51.5000, -0.1930),
  BB('chelsea', 'Chelsea', 'Челси', 51.4875, -0.1690),
  BB('knightsbridge', 'Knightsbridge', 'Найтсбридж', 51.5010, -0.1640),
  BB('marylebone', 'Marylebone', 'Марилебон', 51.5205, -0.1560),
  BB('bayswater', 'Bayswater', 'Бейсуотер', 51.5125, -0.1880),
  BB('southbank', 'South Bank', 'Саут-Бэнк', 51.5055, -0.1150),
  BB('lambeth', 'Lambeth', 'Ламбет', 51.4945, -0.1180)
];
export const CALLES = [
  ['Támesis (River Thames)', 'c', [LL(51.4835, -0.1500), LL(51.4870, -0.1260), LL(51.4960, -0.1225), LL(51.5060, -0.1200), LL(51.5100, -0.1100)], 'Темза'],
  ['Victoria Embankment', 'av', [LL(51.5010, -0.1235), LL(51.5060, -0.1205), LL(51.5100, -0.1150)], 'Набережная Виктории'],
  ['Portobello Road', 'c', [LL(51.5200, -0.2090), LL(51.5160, -0.2050), LL(51.5110, -0.2020)], 'Портобелло-роуд'],
  ['Notting Hill Gate', 'av', [LL(51.5092, -0.2030), LL(51.5089, -0.1940)], 'Ноттинг-Хилл-Гейт'],
  ['The Mall', 'av', [LL(51.5019, -0.1405), LL(51.5055, -0.1300)], 'Мэлл'],
  ['Belgrave Square', 'c', [LL(51.4998, -0.1572), LL(51.4980, -0.1540)], 'Белгрейв-сквер']
];
export const VIAS = [], PLAZAS = [], PARQUES = [];
export const BORDES = [];
export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0xdcd8d0;
export const MUELLES = [], RESERVAS = [];
export const EXTRAS = ['aston-martin'];
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [-1300, -150, 3400, 0.98, 0.6], toda: [-2000, 700, 8500, 0.85, 0.5], cat: [-1500, 300, 4600, 0.85], previa: [-1300, -150], lejos: 12000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'Londres', ru: 'Лондон', gen: 'Лондона', dat: 'Лондону' };
export const LEMA = { es: '«Tengan cuidado con la niebla. Aquí esconde muchas cosas»', ru: '«Осторожнее с туманом. Он здесь многое прячет»' };
export const ALTURA_BASE = 1;
export const TECHO_HSL = [0.58, 0.07, 0.40]; // tejados de pizarra gris
