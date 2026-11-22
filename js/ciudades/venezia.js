// Geografía de Venecia, la ciudad real de «Maschera di Venezia» / «Венецианская маска».
// Coordenadas en metros: x hacia el este, y hacia el norte; (0,0) es el centro de la Piazza San Marco (45.43416, 12.33845).
// La forma de las islas y de los canales grandes sale de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL):
// una máscara tierra/agua de 6,7 m por píxel, guardada como campo de distancias en img/venezia-tierra.png
// (128 = la orilla; cada paso = 2 m; más claro = tierra adentro). Los lugares van con coordenadas reales.

const LAT0 = 45.43416, LON0 = 12.33845;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 111135;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];

// campo de distancias tierra/agua (se carga antes de construir la escena)
const PX0 = 393.3616, PY0 = 431.2915, MPX = 6.70475;
let SDF = null, SW = 0, SH = 0;
{
  const img = new Image(); img.src = new URL('../../img/venezia-tierra.png', import.meta.url).href;
  await img.decode();
  SW = img.naturalWidth; SH = img.naturalHeight;
  const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, SW, SH).data; SDF = new Float32Array(SW * SH);
  for (let i = 0; i < SW * SH; i++) SDF[i] = (d[i * 4] - 128) * 2;
}
export function costa(x, y) {
  const fx = PX0 + x / MPX - .5, fy = PY0 - y / MPX - .5;
  const i = Math.floor(fx), j = Math.floor(fy);
  if (i < 0 || j < 0 || i >= SW - 1 || j >= SH - 1) return -250;
  const u = fx - i, v = fy - j, k = j * SW + i;
  return (SDF[k] * (1 - u) + SDF[k + 1] * u) * (1 - v) + (SDF[k + SW] * (1 - u) + SDF[k + SW + 1] * u) * v;
}
// la ciudad está apenas sobre el agua: suelo plano a 1,4 m, fondo de la laguna poco profundo
export function alturaFn(x, y) {
  const c = costa(x, y);
  if (c < 0) return Math.max(-7, -1.2 + c * 0.05);
  return 0.9 + Math.min(c, 2) * 0.25;
}
export const PLAYA = 0, MARGEN_AGUA = 7, AGUA_ENCIMA = true;
export const MAR_COLOR = [[.17, .44, .47], [.50, .74, .74]]; // la laguna, verde azulada

export const LIMITES = { x0: -2600, x1: 4200, y0: -2250, y1: 2880 };
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;
export const RIO = [], ARROYO = [], LAGOS = [], COLINAS = [];

// El Canal Grande (eje de OSM): lo recorren las góndolas y el vaporetto
export const CANAL_GRANDE = [[12.3162176, 45.4419053], [12.3176537, 45.440985], [12.3195238, 45.4388226], [12.3225949, 45.4410737], [12.3264299, 45.4422915],
  [12.3290752, 45.4423233], [12.331651, 45.4415914], [12.3353658, 45.4397181], [12.3361951, 45.4383758], [12.333602, 45.4367182], [12.3272522, 45.4346225],
  [12.3276872, 45.4324276], [12.3307248, 45.4312474], [12.3406602, 45.4314278]].map(([lon, lat]) => LL(lat, lon));

const PAL = ['#e9c9a3', '#d99b7a', '#efd9b4', '#c97f62', '#e7b98d', '#f1e2c6', '#d8a27e', '#e3c08f', '#b86a52', '#f0d5a8'];
const PALM = ['#e6c49d', '#cf9574', '#a9c3c9', '#e9d7b8', '#c66d5a', '#8fb1b5'];
const B = (id, nombre, ru, lx, ly, pol, o = {}) => ({ id, nombre, ru, lx, ly, alt: [9, 18], lote: 30, calle: 4, nl: 2, relleno: 0.86, ang: -18, techo: 'teja', dens: .93, pal: PAL, pol, ...o });
export const BARRIOS = [
  B('cannaregio', 'Cannaregio', 'Каннареджо', ...LL(45.4440, 12.3290), [[-2050, 1500], [-1200, 1500], [-300, 1300], [500, 1100], [1000, 700], [1000, 400], [0, 640], [-900, 760], [-1650, 900], [-2050, 1050]], { ang: -24 }),
  B('santacroce', 'Santa Croce', 'Санта-Кроче', ...LL(45.4400, 12.3225), [[-2100, 1000], [-1650, 900], [-900, 760], [-1100, 300], [-1700, 250], [-2100, 450]], { ang: -10 }),
  B('sanpolo', 'San Polo', 'Сан-Поло', ...LL(45.4378, 12.3290), [[-900, 760], [0, 640], [-200, 330], [-500, 160], [-1100, 300]], { ang: -30 }),
  B('sanmarco', 'San Marco', 'Сан-Марко', ...LL(45.4352, 12.3340), [[-500, 160], [-200, 330], [0, 640], [400, 600], [400, 100], [80, -40], [-400, -10]], { ang: -14 }),
  B('castello', 'Castello', 'Кастелло', ...LL(45.4362, 12.3480), [[400, 100], [400, 600], [1000, 700], [1800, 650], [2600, 300], [2950, -200], [2700, -800], [2100, -700], [1200, -230], [600, -60]], { ang: -20 }),
  B('dorsoduro', 'Dorsoduro', 'Дорсодуро', ...LL(45.4315, 12.3255), [[-2100, 450], [-1700, 250], [-1100, 300], [-500, 160], [-400, -10], [-50, -270], [-700, -420], [-1500, -330], [-2200, -200]], { ang: -8 }),
  B('giudecca', 'Giudecca', 'Джудекка', ...LL(45.4265, 12.3230), [[-2300, -560], [-500, -640], [100, -760], [100, -1000], [-800, -1150], [-2400, -1050]], { ang: -6, dens: .7 }),
  B('murano', 'Murano', 'Мурано', ...LL(45.4565, 12.3530), [[600, 2050], [2400, 2050], [2600, 2880], [600, 2880]], { ang: 10, dens: .62, pal: PALM }),
  B('lido', 'Lido', 'Лидо', ...LL(45.4130, 12.3700), [[2300, -2250], [4200, -2250], [4200, 120], [3300, 0]], { ang: 40, dens: .45, alt: [6, 14], techo: 'plano', pal: ['#f1ead8', '#e8dcc2', '#dfe6e8', '#f4efe2'] }),
  B('tronchetto', '', '', 0, 0, [[-2600, 600], [-2100, 1050], [-2050, 450], [-2200, -200], [-2600, -150]], { techo: 'plano', dens: .35, alt: [6, 14], pal: ['#d9d6cf', '#cfc9bd', '#e2ded6'] })
];
export const CALLES = [];
export const VIAS = [];

// Piazza San Marco y la Piazzetta (sin edificios encima)
export const PLAZAS = [[...LL(45.43425, 12.33780), 175, 70, -11], [...LL(45.43375, 12.33960), 45, 90, -11], [...LL(45.43765, 12.32990), 110, 70, -20]];
export const PARQUES = [
  { nombre: 'Giardini', den: 160, pol: [LL(45.4300, 12.3530), LL(45.4296, 12.3600), LL(45.4268, 12.3615), LL(45.4276, 12.3540)] },
  { nombre: 'Parco delle Rimembranze', den: 160, pol: [LL(45.4285, 12.3628), LL(45.4280, 12.3672), LL(45.4255, 12.3678), LL(45.4262, 12.3630)] },
  { nombre: 'San Michele', cem: true, pol: [LL(45.4481, 12.3436), LL(45.4478, 12.3482), LL(45.4449, 12.3480), LL(45.4450, 12.3436)] }
];

export const BORDES = [
  { texto: 'Canal Grande', ru: 'Большой канал', ...xy(45.4395, 12.3268), mar: true },
  { texto: 'Canale della Giudecca', ru: 'Канал Джудекка', ...xy(45.4280, 12.3260), mar: true },
  { texto: 'Bacino di San Marco', ru: 'Бассейн Сан-Марко', ...xy(45.4305, 12.3430), mar: true },
  { texto: 'Laguna di Venezia', ru: 'Венецианская лагуна', ...xy(45.4520, 12.3150), mar: true },
  { texto: 'Laguna di Venezia', ru: 'Венецианская лагуна', ...xy(45.4190, 12.3300), mar: true },
  { texto: 'Isola di San Giorgio Maggiore', ru: 'Остров Сан-Джорджо-Маджоре', ...xy(45.4280, 12.3440), mar: true },
  { texto: 'Ponte della Libertà → Mestre', ru: 'Мост Свободы → Местре', ...xy(45.4505, 12.3080), mar: true },
  { texto: '← Firenze, Roma', ru: '← Флоренция, Рим', ...xy(45.4220, 12.3075), mar: true }
];
function xy(lat, lon) { const [x, y] = LL(lat, lon); return { x, y }; }

export const AFUERAS = [];
export const AFUERAS_HUECO = false;
export const MUELLES = [];
export const RESERVAS = [];
export const EXTRAS = ['gondolas'];
export const colorSuelo = (x, y, h, c) => { const k = Math.sin(x * 0.9) * Math.sin(y * 0.8) * 6; return [228 + k, 218 + k, 200 + k]; };
export const zonaArboles = () => false;
export const RUTA_BUS = [];
export const VISTA = { inicio: [150, 250, 2300, 0.98, 0.9], toda: [700, 300, 6200, 0.85, 0.5], cat: [200, 300, 3000, 0.85], previa: [0, 300], lejos: 9000, zoomExtra: 1.6 };
export const NOMBRE = { es: 'Venecia', ru: 'Венеция', gen: 'Венеции', dat: 'Венеции' };
export const LEMA = { es: '«solo l\'omo dal cuor neto pol \'rivar a la Maschera»', ru: '«только человек с чистым сердцем может дойти до Маски»' };
export const ALTURA_BASE = 1;
