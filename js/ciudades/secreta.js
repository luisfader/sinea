// La Ciudad Secreta de la novela del mismo nombre. Coordenadas en metros: x hacia el este, y hacia el norte.
// Fuente: «La ciudad secreta», cap. 3: «En el techo hay cristales grandes que dan una luz dorada, como la luz del sol.
// Hay casas blancas, torres altas, jardines y fuentes. En las calles hay mercados con frutas, flores y ropa de muchos colores».
// La ciudad está «debajo de la tierra, dentro de las montañas»: acá se ve como un valle cerrado por un anillo de picos,
// con los cristales del techo flotando encima. Al sureste, afuera, el pueblito de Martín con su parque; un camino
// sube una hora entre los árboles hasta la roca de la llave. (0,0) es la plaza central.

export const LIMITES = { x0: -2000, x1: 2200, y0: -1800, y1: 1500 };

const E = 40000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [[5000, 5000, 1], [5001, 5001, 1]];
export const ARROYO = [];

// el anillo de montañas que esconde la ciudad (con una abertura falsa: la entrada es por la roca, al sureste)
const R_MONTE = 1000;
export const COLINAS = [
  ...Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return [Math.cos(a) * R_MONTE, Math.sin(a) * R_MONTE * .85, 360 + (i % 3) * 60, 150 + (i * 37 % 70), '']; }),
  [-1700, 1200, 500, 120, ''], [1800, 1100, 520, 110, ''], [-1700, -1300, 480, 100, ''], [600, -1500, 380, 60, '']
];
// el fondo del valle, plano, para las casas
export function relieve(x, y) {
  const d = Math.hypot(x, y / .85);
  return d < 700 ? -(1 - d / 700) * 2 : 0;
}

const PAL = ['#fbf8f1', '#f4efe4', '#fffdf7', '#efe8d8', '#f7f1e3', '#ece4d2'];
const PAL_PUEBLO = ['#e7d3b0', '#d9bf98', '#efe0c4', '#cfae86', '#e2cda8'];
export const BARRIOS = [
  { id: 'norte', nombre: '', lx: 0, ly: 380, alt: [8, 16], lote: 36, ang: 0, techo: 'plano', dens: .62, pal: PAL, pol: [[-520, 120], [-120, 90], [140, 100], [520, 160], [430, 460], [80, 560], [-360, 480]] },
  { id: 'oeste', nombre: '', lx: -420, ly: -60, alt: [7, 14], lote: 36, ang: 20, techo: 'plano', dens: .6, pal: PAL, pol: [[-620, -340], [-110, -190], [-120, 60], [-560, 90], [-680, -120]] },
  { id: 'este', nombre: '', lx: 400, ly: -80, alt: [7, 14], lote: 36, ang: -20, techo: 'plano', dens: .6, pal: PAL, pol: [[110, -160], [480, -320], [620, -100], [560, 120], [140, 60]] },
  { id: 'sur', nombre: '', lx: 0, ly: -420, alt: [6, 12], lote: 38, ang: 0, techo: 'plano', dens: .5, pal: PAL, pol: [[-460, -360], [-90, -220], [100, -220], [420, -380], [220, -560], [-260, -560]] },
  { id: 'pueblo', nombre: 'El pueblo de Martín', ru: 'Городок Мартина', lx: 1500, ly: -1050, alt: [6, 10], lote: 44, ang: 8, techo: 'teja', dens: .7, pal: PAL_PUEBLO,
    pol: [[1150, -1450], [2100, -1500], [2150, -800], [1700, -720], [1250, -850]] }
];

export const CALLES = [
  ['Calle del Mercado', 'av', [[0, 0], [-160, 120], [-380, 260]], 'Рыночная улица'],
  ['Calle de las Torres', 'c', [[0, 0], [-260, -60], [-540, -120]], 'Улица Башен'],
  ['Calle de las Fuentes', 'c', [[0, 0], [260, -60], [520, -40]], 'Улица Фонтанов'],
  ['Calle de la Puerta', 'av', [[0, 0], [150, -160], [330, -330], [470, -450]], 'Улица Ворот'],
  ['Calle de los Jardines', 'c', [[0, 0], [100, 220], [200, 440]], 'Садовая улица'],
  ['Túneles', 'ca', [[470, -450], [600, -560], [720, -680]], 'Туннели'],
  ['Camino de la montaña', 'ca', [[1300, -1000], [1150, -900], [1000, -820], [860, -760], [760, -720]], 'Горная тропа'],
  ['Calle Mayor', 'av', [[1250, -1150], [1600, -1120], [2050, -1100]], 'Главная улица']
];
export const VIAS = [];
export const PLAZAS = [[0, 0, 110, 90, 0], [-300, 210, 60, 40, 30], [1500, -1180, 50, 40, 0]];
export const PARQUES = [
  { nombre: 'Jardines', pol: [[-420, -260], [-200, -230], [-200, -120], [-430, -150]] },
  { nombre: '', pol: [[230, 220], [380, 240], [360, 360], [210, 340]] },
  { nombre: 'Parque', pol: [[1300, -1350], [1480, -1340], [1480, -1230], [1300, -1240]] }
];
// fuentes
export const LAGOS = [[-310, -190, 18], [300, 290, 14], [60, -110, 10]];

export const BORDES = [
  { texto: 'Montañas', ru: 'Горы', x: -1150, y: 900, mar: true },
  { texto: 'Bajo la tierra, dentro de las montañas', ru: 'Под землёй, внутри гор', x: 0, y: 760, mar: true },
  { texto: 'La superficie', ru: 'Поверхность', x: 1700, y: -650, mar: true }
];

export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_COLOR = 0x9a9180;
export const MUELLES = [];
export const RESERVAS = [[0, 0, 70], [-180, -230, 30], [250, 260, 30], [470, -450, 40]];
export const EXTRAS = ['cristales-techo'];
export const RUTA_BUS = [];
export const VISTA = { inicio: [150, -200, 1900, 0.95, 0.6], toda: [100, -150, 4300, 0.85, 0.5], cat: [0, 0, 2400, 0.85], previa: [0, 0], lejos: 6000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'la Ciudad Secreta', ru: 'Тайный город', gen: 'Тайного города', dat: 'Тайному городу' };
export const LEMA = { es: '«Esta es nuestra historia. Y la vamos a escribir juntos»', ru: '«Это наша история. И мы напишем её вместе»' };
export const ALTURA_BASE = 6;

// Suelo: piedra clara y jardines dentro del valle; roca y pinos en las montañas; prados abajo, en el pueblo
export function colorSuelo(x, y, h, c) {
  const d = Math.hypot(x, y / .85), onda = Math.sin(x * .02 + Math.sin(y * .017) * 2) * 6;
  if (d < 680) return [236 + onda, 228 + onda, 210 + onda];
  const roca = Math.max(0, Math.min(1, (h - 40) / 90));
  return [112 + roca * 20 + onda, 134 - roca * 20 + onda, 84 + roca * 16];
}
export function zonaArboles(x, y) {
  const d = Math.hypot(x, y / .85);
  return d > 760 && d < 1500 && !(x > 1150 && y < -700);
}
