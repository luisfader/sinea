// Geografía de Praga, la ciudad real de «Podzemní tajemství», «Ostrovy nad Prahou», «Předtucha» y «La reina de la Vendimia».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es la Plaza de la Ciudad Vieja (50.0875, 14.4213).
// Agua (el Moldava), calles, manzanas y parques salen del mapa de OpenStreetMap (© colaboradores de OpenStreetMap), a 6,13 m por píxel:
// img/praga-tierra.png es el campo de distancias tierra/agua e img/praga-suelo.png el suelo;
// js/ciudades/praga-lotes.js pone un edificio cada 24 m donde OSM dibuja edificios (alturas inventadas).
export { LOTES, ARBOLES } from './praga-lotes.js';
export const LOTE_W = 20;

const LAT0 = 50.0875, LON0 = 14.4213;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111230;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];
const PX0 = 596.3230, PY0 = 600.8582, MPX = 6.130412;
const P = (px, py) => [Math.round((px - PX0) * MPX), Math.round((PY0 - py) * MPX)];

const carga = async (f) => { const im = new Image(); im.src = new URL('../../img/' + f, import.meta.url).href; await im.decode(); return im; };
export const SUELO_IMG = await carga('praga-suelo.png');
const TI = await carga('praga-tierra.png');
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
export const MAR_COLOR = [[.24, .40, .46], [.56, .70, .74]]; // el Moldava (Vltava)

export const LIMITES = { x0: P(0, 0)[0], x1: P(1536, 0)[0], y0: P(0, 1280)[1], y1: P(0, 0)[1] };
export const CALLES_SOLO_ETIQUETA = true;
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];

function xy(lat, lon) { const [x, y] = LL(lat, lon); return { lx: x, ly: y }; }
const BB = (id, nombre, ru, lat, lon) => ({ id, nombre, ru, ...xy(lat, lon), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] });
export const BARRIOS = [
  BB('stare', 'Ciudad Vieja (Staré Město)', 'Старый город (Старе-Место)', 50.0870, 14.4195),
  BB('mala', 'Malá Strana', 'Мала-Страна', 50.0878, 14.4035),
  BB('hradcany', 'Hradčany', 'Градчаны', 50.0905, 14.3935),
  BB('josefov', 'Josefov', 'Йозефов', 50.0902, 14.4185),
  BB('nove', 'Ciudad Nueva (Nové Město)', 'Новый город (Нове-Место)', 50.0790, 14.4230),
  BB('vinohrady', 'Vinohrady', 'Винограды', 50.0755, 14.4420),
  BB('zizkov', 'Žižkov', 'Жижков', 50.0850, 14.4560),
  BB('karlin', 'Karlín', 'Карлин', 50.0935, 14.4520),
  BB('holesovice', 'Holešovice', 'Голешовице', 50.1030, 14.4380),
  BB('letna', 'Letná', 'Летна', 50.0985, 14.4200),
  BB('smichov', 'Smíchov', 'Смихов', 50.0720, 14.4040),
  BB('vysehrad', 'Vyšehrad', 'Вышеград', 50.0625, 14.4220)
];
export const CALLES = [
  ['Vltava (Moldava)', 'c', [LL(50.1005, 14.4150), LL(50.0930, 14.4130), LL(50.0820, 14.4120), LL(50.0700, 14.4140)], 'Влтава'],
  ['Václavské náměstí', 'av', [LL(50.0838, 14.4256), LL(50.0811, 14.4280), LL(50.0795, 14.4302)], 'Вацлавская площадь'],
  ['Nerudova', 'c', [LL(50.0880, 14.4025), LL(50.0885, 14.3995)], 'Нерудова'],
  ['Vinohradská', 'av', [LL(50.0790, 14.4340), LL(50.0775, 14.4500), LL(50.0770, 14.4660)], 'Виноградская']
];
export const VIAS = [], PLAZAS = [], PARQUES = [];
export const BORDES = [
  { texto: 'Karlštejn ↙ (28 km)', ru: 'Карлштейн ↙ (28 км)', ...(([x, y]) => ({ x, y }))(P(80, 1240)), mar: true }
];
export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0xe2ddd2;
export const MUELLES = [], RESERVAS = [];
export const EXTRAS = ['ostrovy'];
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [-650, 150, 2900, 0.98, 0.6], toda: [600, -300, 8500, 0.85, 0.5], cat: [0, 0, 4200, 0.85], previa: [-600, 150], lejos: 12000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'Praga', ru: 'Прага', gen: 'Праги', dat: 'Праге' };
export const LEMA = { es: '«En Praga nada es casualidad»', ru: '«В Праге ничего не бывает случайно»' };
export const ALTURA_BASE = 1;
