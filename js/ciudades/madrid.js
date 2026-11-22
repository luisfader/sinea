// Geografía de Madrid, la ciudad real de «Дикий час: Карнавал раздора».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es la Puerta del Sol (40.41689, -3.70358).
// El suelo (calles, manzanas, parques, el Manzanares) y la ubicación de los edificios salen del mapa de
// OpenStreetMap (© colaboradores de OpenStreetMap): img/madrid-suelo.png es ese mapa reclasificado a 3,64 m por píxel,
// y js/ciudades/madrid-lotes.js tiene un edificio cada 12 m donde OSM dibuja edificios.
export { LOTES, ARBOLES } from './madrid-lotes.js';

const LAT0 = 40.41689, LON0 = -3.70358;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111040;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];
const PX0 = 484.331, PY0 = 408.128, MPX = 3.6386;
const P = (px, py) => [Math.round((px - PX0) * MPX), Math.round((PY0 - py) * MPX)];

// el mapa de suelo, ya cargado (pintarSuelo lo usa como base)
export const SUELO_IMG = await (async () => { const im = new Image(); im.src = new URL('../../img/madrid-suelo.png', import.meta.url).href; await im.decode(); return im; })();
export const LIMITES = { x0: P(0, 0)[0], x1: P(1024, 0)[0], y0: P(0, 800)[1], y1: P(0, 0)[1] };
export const CALLES_SOLO_ETIQUETA = true;

const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];
// el terreno baja hacia el Manzanares, al oeste del Palacio Real
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const relieve = (x, y) => -38 * sst(-850, -1500, x) - 10 * sst(-300, -1300, y) + 6 * sst(600, 1500, x);

export const BARRIOS = [
  { id: 'centro', nombre: 'Centro', ru: 'Центр', lx: 150, ly: -150, alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'austrias', nombre: 'Madrid de los Austrias', ru: 'Мадрид Австрийцев', ...xy(40.4150, -3.7110), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'latina', nombre: 'La Latina', ru: 'Ла-Латина', ...xy(40.4105, -3.7120), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'lavapies', nombre: 'Lavapiés', ru: 'Лавапьес', ...xy(40.4080, -3.7030), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'letras', nombre: 'Barrio de las Letras', ru: 'Литературный квартал', ...xy(40.4145, -3.6980), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'malasana', nombre: 'Malasaña', ru: 'Маласанья', ...xy(40.4255, -3.7035), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'chueca', nombre: 'Chueca', ru: 'Чуэка', ...xy(40.4225, -3.6975), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'salamanca', nombre: 'Salamanca', ru: 'Саламанка', ...xy(40.4260, -3.6835), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] },
  { id: 'retiro', nombre: 'El Retiro', ru: 'Ретиро', ...xy(40.4153, -3.6835), alt: [0, 0], lote: 1, dens: 0, ang: 0, pol: [] }
].map(b => ({ ...b, lx: b.lx ?? b.x, ly: b.ly ?? b.y }));
function xy(lat, lon) { const [x, y] = LL(lat, lon); return { x, y, lx: x, ly: y }; }

// calles (solo para los nombres; el trazado está en el suelo)
export const CALLES = [
  ['Gran Vía', 'av', [P(300, 213), P(372, 262), P(430, 300), P(520, 318), P(640, 342)], 'Гран-Виа'],
  ['Calle de Alcalá', 'av', [P(500, 405), P(600, 370), P(725, 335), P(830, 312), P(1000, 268)], 'улица Алькала'],
  ['Paseo del Prado', 'av', [P(728, 345), P(740, 500), P(762, 680)], 'бульвар Прадо'],
  ['Paseo de Recoletos', 'av', [P(735, 330), P(790, 150)], 'бульвар Реколетос'],
  ['Paseo de la Castellana', 'av', [P(790, 150), P(818, 0)], 'проспект Кастельяна'],
  ['Calle Mayor', 'c', [P(482, 414), P(420, 426), P(330, 455), P(262, 468)], 'улица Майор'],
  ['Calle de Atocha', 'c', [P(458, 452), P(590, 548), P(745, 665)], 'улица Аточа'],
  ['Calle de Toledo', 'c', [P(395, 472), P(360, 590), P(305, 710)], 'улица Толедо'],
  ['Calle de Bailén', 'c', [P(252, 180), P(252, 500)], 'улица Байлен'],
  ['Calle de la Princesa', 'av', [P(285, 190), P(220, 90), P(160, 0)], 'улица Принсеса'],
  ['Calle del Arenal', 'c', [P(488, 405), P(365, 390)], 'улица Ареналь'],
  ['Calle de Preciados', 'c', [P(488, 400), P(432, 312)], 'улица Пресиадос'],
  ['Ronda de Toledo', 'av', [P(300, 712), P(540, 780)], 'Ронда-де-Толедо']
];
export const VIAS = [];
export const PLAZAS = [];
export const PARQUES = [];

export const BORDES = [
  { texto: 'Aeropuerto de Barajas →', ru: 'Аэропорт Барахас →', ...P(1000, 120), mar: true },
  { texto: 'Río Manzanares', ru: 'Река Мансанарес', ...P(40, 470), mar: true },
  { texto: '← Belgrado', ru: '← Белград', ...P(40, 760), mar: true }
].map(b => (b[0] !== undefined ? { texto: b.texto, ru: b.ru, x: b[0], y: b[1], mar: true } : b));

export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0xe2ddd2;
export const MUELLES = [];
export const RESERVAS = [];
export const EXTRAS = [];
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [100, 150, 2100, 0.98, 0.55], toda: [100, 0, 4400, 0.85, 0.5], cat: [100, 0, 2600, 0.85], previa: [0, 200], lejos: 7000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'Madrid', ru: 'Мадрид', gen: 'Мадрида', dat: 'Мадриду' };
export const LEMA = { es: '«¡Madrid, levántate!»', ru: '«Мадрид, вставай!»' };
export const ALTURA_BASE = 20;
