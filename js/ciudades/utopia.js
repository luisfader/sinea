// «Наша Утопия», la fortaleza de Robert en «Предчувствие». Coordenadas en metros: x hacia el este, y hacia el norte.
// (0,0) es la torre principal. Fuente principal: «Предчувствие», cap. 4: «un fuerte pentagonal de color turquesa
// sobre una colina empinada, con dos anillos de murallas, torres cilíndricas de vigía en el anillo exterior
// y, en el centro, la torre principal junto a la plaza central».

export const LIMITES = { x0: -2200, x1: 2200, y0: -1700, y1: 1700 };

// El mar queda al oeste: de ahí salen los tanques-robot de las «Herederas» («Предчувствие 2.3»)
export const COSTA = [
  [-1780, 4000], [-1820, 1700], [-1760, 1100], [-1880, 500], [-1830, -100], [-1950, -700], [-1900, -1200], [-2010, -1700], [-2100, -4000]
];
export const TIERRA = [...COSTA, [6000, -4000], [6000, 4000]];

// Sin río: es tierra seca. Un hilo de agua imperceptible para que las funciones no fallen.
export const RIO = [[5000, 5000, 1], [5001, 5001, 1]];
export const ARROYO = [];

// Pentágono: circunradio de cada anillo de murallas
export const R_EXT = 190, R_INT = 120;
export const pent = (r, a0 = 90) => [0, 1, 2, 3, 4].map(i => { const a = (a0 + i * 72) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; });

// La colina empinada de cima plana (meseta) y unas dunas en el desierto
export const COLINAS = [
  [0, 0, 340, 52, 'Colina de la fortaleza', 'meseta'],
  [-1300, -1250, 300, 16, ''], [-900, -1450, 240, 12, ''], [1250, -1300, 320, 18, ''], [1600, 1250, 450, 26, ''],
  [-1200, 1300, 380, 22, ''], [1500, -300, 260, 10, ''], [-600, -1550, 200, 9, '']
];

const PAL = ['#d9cfbd', '#cfc4ae', '#e3dac8', '#c8bba2', '#bfd9d4', '#d2c8b4', '#a9d1cb'];
// Barrios: el interior del anillo interior y cinco franjas entre los dos anillos (así no tocan las murallas)
const franja = (i) => { const a = pent(172, 90), b = pent(136, 90), j = (i + 1) % 5, m = .12;
  const lerp = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
  return [lerp(a[i], a[j], m), lerp(a[i], a[j], 1 - m), lerp(b[i], b[j], 1 - m), lerp(b[i], b[j], m)]; };
export const BARRIOS = [
  { id: 'interior', nombre: '', lx: 0, ly: 0, alt: [5, 9], lote: 22, ang: 0, techo: 'plano', dens: .62, pal: PAL, pol: pent(102, 90) },
  ...[0, 1, 2, 3, 4].map(i => ({ id: 'anillo' + i, nombre: '', lx: 0, ly: 0, alt: [4, 7], lote: 18, ang: 90 + i * 72 + 36, techo: 'plano', dens: .55, pal: PAL, pol: franja(i) }))
];

export const CALLES = [
  ['Camino de la Puerta', 'av', [[146, -48], [230, -70], [300, -40], [360, -120], [440, -90], [560, -160], [800, -200], [1200, -260], [2200, -300]], 'Дорога к воротам'],
  ['Calle de la Plaza', 'c', [[140, -45], [70, -30], [0, -25]], 'Площадная улица'],
  ['Huella del búnker', 'ca', [[360, -120], [0, -520], [-500, -800], [-1100, -1100]], 'Колея к бункеру'],
  ['Huella del desierto', 'ca', [[560, -160], [800, -600], [1000, -1150]], 'Пустынная колея'],
  ['Camino de los túneles', 'c', [[440, -90], [520, 40], [560, 90]], 'Дорога к туннелям'],
  ['Senda del mar', 'ca', [[-300, 260], [-800, 200], [-1400, -100], [-1840, -300]], 'Тропа к морю'],
  ['Senda del cementerio', 'c', [[230, -70], [100, -300], [-200, -330], [-330, 50], [-380, 210]], 'Кладбищенская тропа']
];
export const VIAS = [];

export const PLAZAS = [[0, -28, 50, 34, 0], [146, -48, 30, 30, -18]];
export const PARQUES = [
  { nombre: 'Jardines', pol: [[-95, 118], [-25, 128], [-25, 160], [-90, 150]] },
  { nombre: '', pol: [[25, 128], [95, 118], [90, 150], [25, 160]] }
];
export const LAGOS = [];

export const BORDES = [
  { texto: 'Montañas del este · campamento de refugiados →', ru: 'Горы на востоке · лагерь беженцев →', x: 1950, y: 200 },
  { texto: 'Mar', ru: 'Море', x: -2050, y: 600, mar: true },
  { texto: 'Desierto', ru: 'Пустыня', x: -400, y: -1350, mar: true },
  { texto: 'Valle', ru: 'Долина', x: 650, y: 650, mar: true }
];

// campo más allá del mapa (sin cubrir el mar del oeste)
export const AFUERAS = [[-1880, 1690], [-1850, 40000], [40000, 40000], [40000, -40000], [-2000, -40000], [-1995, -1690], [2190, -1690], [2190, 1690]];
export const AFUERAS_HUECO = false;
export const AFUERAS_COLOR = 0xd9c79c;
export const MUELLES = [];
export const RESERVAS = [[0, 0, 32], [0, -28, 30], [146, -48, 24]];
export const EXTRAS = ['drones-gaviota'];
export const RUTA_BUS = [];
export const VISTA = { inicio: [0, -20, 900, 0.95, 0.75], toda: [0, -100, 3400, 0.85, 0.5], cat: [0, 0, 700, 0.85], previa: [0, -200], lejos: 5000, zoomExtra: 2.1 };
export const NOMBRE = { es: 'Nuestra Utopía', ru: 'Наша Утопия', gen: 'Нашей Утопии', dat: 'Нашей Утопии' };
export const LEMA = { es: '«Existe, y yo la voy a construir»', ru: '«Она есть, и я её построю!»' };
export const ALTURA_BASE = 3;
export const TIPO = 'fortaleza';

// Suelo: valle verde alrededor de la colina, desierto más allá
export function colorSuelo(x, y, h, c) {
  const d = Math.hypot(x - 100, y + 50);
  const k = Math.max(0, Math.min(1, (d - 700) / 450));
  const verde = [170, 196, 128], arena = [224, 200, 150];
  const onda = Math.sin(x * 0.02 + Math.sin(y * 0.013) * 3) * 6;
  return [verde[0] + (arena[0] - verde[0]) * k + onda * k, verde[1] + (arena[1] - verde[1]) * k + onda * k, verde[2] + (arena[2] - verde[2]) * k];
}
// Árboles solo en el valle
export function zonaArboles(x, y) { return Math.hypot(x - 100, y + 50) < 850 && Math.hypot(x, y) > 330; }
