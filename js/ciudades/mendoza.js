// Geografía de Mendoza (Argentina), la ciudad real de «La reina de la Vendimia», «El misterio de los Fader»,
// «Дикий час: Духи гор» y otras novelas. Coordenadas en metros: x hacia el este, y hacia el norte;
// (0,0) es el centro de la Plaza Independencia (-32.88972, -68.84450).
// Fuente de la geometría: OpenStreetMap (© colaboradores de OpenStreetMap, ODbL), consultado en noviembre de 2026
// con Nominatim y Overpass. La cuadrícula del centro está medida sobre los ejes reales de las calles:
// las manzanas miden 122,5 m de eje a eje y la cuadrícula está girada 12,5° (las calles «norte-sur» apuntan al NNE).

const LAT0 = -32.8897243, LON0 = -68.8444983;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110920;
export const LL = (lat, lon) => [Math.round((lon - LON0) * KX), Math.round((lat - LAT0) * KY)];

// cuadrícula: e = cuadras al este del eje de la calle Mitre; n = cuadras al norte del eje de Sarmiento
const P = 122.5, TH = 12.5 * Math.PI / 180, CT = Math.cos(TH), ST = Math.sin(TH);
export const G = (e, n) => [Math.round(e * P * CT + n * P * ST), Math.round(-e * P * ST + n * P * CT)];
const linea = (e0, n0, e1, n1) => [G(e0, n0), G(e1, n1)];

export const LIMITES = { x0: -8000, x1: 10500, y0: -17000, y1: 7500 };

// Mendoza no tiene mar
const E = 60000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;

// El canal Cacique Guaymallén (trazado de OSM en el tramo del centro), junto a la Costanera
const CANAL = [LL(-32.9150, -68.8370), LL(-32.8962638, -68.8332089), LL(-32.8827553, -68.8278551), LL(-32.8803939, -68.827278),
  LL(-32.8766001, -68.8261929), LL(-32.8738981, -68.8203576), LL(-32.8725043, -68.817287), LL(-32.8640, -68.8060)];
export const RIO = [];
export const ARROYO = []; // el canal se pinta como una franja de agua (tipo 'ag' en CALLES)
// Lago del Parque (OSM): alargado, de NNO a SSE; se arma con círculos
const LA = LL(-32.89015, -68.86815), LB = LL(-32.89720, -68.86480);
export const LAGOS = Array.from({ length: 9 }, (_, i) => [Math.round(LA[0] + (LB[0] - LA[0]) * i / 8), Math.round(LA[1] + (LB[1] - LA[1]) * i / 8), i === 0 || i === 8 ? 45 : 62]);

export const COLINAS = [
  [...LL(-32.8889347, -68.8912213), 380, 70, 'Cerro de la Gloria'],
  [-4900, -300, 520, 55, ''],
  [-5600, 3300, 900, 120, 'Cerros del Challao'],
  [-6900, 5200, 1500, 260, 'Cerro Arco'],
  [-7200, -2500, 1400, 200, ''],
  [-7400, -8000, 1500, 180, '']
];

// el piedemonte: el terreno sube hacia la precordillera, al oeste
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function relieve(x, y) {
  let h = Math.max(0, -x - 2500) * 0.022;
  const borde = -5200 + Math.sin(y * 0.0007) * 500 + Math.sin(y * 0.0019) * 220;
  h += sst(borde, borde - 2600, x) * (320 + 140 * Math.sin(y * 0.0011 + 1.3)) * (0.75 + 0.25 * Math.sin(x * 0.004 + y * 0.003));
  return h;
}

const PAL = ['#efe6d6', '#e8dcc6', '#f3ede2', '#e2d6c2', '#ede2cf', '#d9cfc0', '#f1e9dc', '#e6e0d5'];
const PALB = ['#f2e7d3', '#efdcc0', '#e9d4b4', '#f5ecdc', '#e7dcc8', '#f0e0c9'];
const grilla = (e0, n0, e1, n1) => [G(e0, n0), G(e1, n0), G(e1, n1), G(e0, n1)];
export const BARRIOS = [
  { id: 'centro', nombre: 'Microcentro', ru: 'Центр', lx: G(2.5, 1.5)[0], ly: G(2.5, 1.5)[1], alt: [9, 30], torres: 0.05, lote: P, calle: 22, nl: 4, o: [0, 0], ang: -12.5, techo: 'plano', dens: .9, pal: PAL,
    pol: grilla(-4, -6, 9.6, 9) },
  { id: 'civico', nombre: 'Barrio Cívico', ru: 'Гражданский квартал', lx: G(1, -8.6)[0], ly: G(1, -8.6)[1], alt: [8, 24], lote: P, calle: 22, nl: 3, o: [0, 0], ang: -12.5, techo: 'plano', dens: .55, pal: PAL,
    pol: grilla(-4, -11, 9.6, -6) },
  { id: 'quinta', nombre: 'Quinta Sección', ru: 'Пятая секция', lx: G(-8.5, -1.5)[0], ly: G(-8.5, -1.5)[1], alt: [6, 18], lote: P, calle: 22, nl: 4, o: [0, 0], ang: -12.5, techo: 'plano', dens: .82, pal: PAL,
    pol: grilla(-12.6, -9, -4, 4) },
  { id: 'sexta', nombre: 'Sexta Sección', ru: 'Шестая секция', lx: G(-8, 9)[0], ly: G(-8, 9)[1], alt: [5, 14], lote: P, calle: 20, nl: 4, o: [0, 0], ang: -12.5, techo: 'plano', dens: .78, pal: PAL,
    pol: grilla(-12.6, 4, -4, 17) },
  { id: 'primera', nombre: 'Primera Sección', ru: 'Первая секция', lx: G(3.5, 12)[0], ly: G(3.5, 12)[1], alt: [6, 18], lote: P, calle: 20, nl: 4, o: [0, 0], ang: -12.5, techo: 'plano', dens: .8, pal: PAL,
    pol: grilla(-4, 9, 9.5, 17) },
  { id: 'fundacional', nombre: 'Área Fundacional', ru: 'Район основания', lx: LL(-32.8805, -68.8300)[0], ly: LL(-32.8805, -68.8300)[1], alt: [4, 9], lote: 105, calle: 14, nl: 2, ang: -12.5, techo: 'teja', dens: .6, pal: PALB,
    pol: [G(9.6, 9), G(9.6, 17), G(15, 17), G(14, 9)] },
  { id: 'guaymallen', nombre: 'Guaymallén', ru: 'Гуаймальен', lx: 3600, ly: -400, alt: [4, 10], lote: 100, calle: 13, nl: 2, ang: -6, techo: 'plano', dens: .5, pal: PALB,
    pol: [[1500, -4200], [6800, -4400], [7300, 1800], [5200, 2600], [2400, 2200], [1700, 900]] },
  { id: 'godoy', nombre: 'Godoy Cruz', ru: 'Годой-Крус', lx: 600, ly: -4600, alt: [4, 12], lote: 110, calle: 14, nl: 2, ang: -12.5, techo: 'plano', dens: .5, pal: PALB,
    pol: [[-2300, -1500], [1500, -1500], [2200, -4300], [1800, -7400], [-2600, -7600], [-3300, -4000]] },
  { id: 'lasheras', nombre: 'Las Heras', ru: 'Лас-Эрас', lx: 1300, ly: 4300, alt: [4, 10], lote: 105, calle: 13, nl: 2, ang: -10, techo: 'plano', dens: .5, pal: PALB,
    pol: [[-2600, 2300], [2400, 2200], [3600, 4300], [3300, 5600], [800, 6900], [-2300, 6500], [-3300, 4200]] },
  { id: 'dalvian', nombre: 'Dalvian', ru: 'Дальвиан', lx: LL(-32.8675765, -68.888668)[0], ly: LL(-32.8675765, -68.888668)[1], alt: [4, 8], lote: 120, calle: 12, nl: 2, ang: 20, techo: 'teja', dens: .4, pal: PALB,
    pol: [[-4900, 1700], [-3500, 1700], [-3300, 3100], [-4800, 3200]] },
  { id: 'chacras', nombre: 'Chacras de Coria', ru: 'Чакрас-де-Кория', lx: -3500, ly: -10900, alt: [4, 7], lote: 120, calle: 12, nl: 2, ang: -8, techo: 'teja', dens: .42, pal: PALB,
    pol: [[-4600, -9700], [-2500, -9800], [-2300, -11700], [-4500, -11800]] },
  { id: 'drummond', nombre: 'Mayor Drummond', ru: 'Майор-Драммонд', lx: -1700, ly: -13100, alt: [4, 8], lote: 115, calle: 12, nl: 2, ang: -10, techo: 'teja', dens: .45, pal: PALB,
    pol: [[-2700, -12000], [-700, -12000], [-500, -14000], [-2600, -14100]] },
  { id: 'lujan', nombre: 'Luján de Cuyo', ru: 'Лухан-де-Куйо', lx: LL(-33.036, -68.878)[0], ly: LL(-33.036, -68.878)[1], alt: [4, 9], lote: 110, calle: 13, nl: 2, ang: -6, techo: 'teja', dens: .5, pal: PALB,
    pol: [[-4500, -15100], [-1700, -15200], [-1600, -17000], [-4600, -17000]] },
  { id: 'maipu', nombre: 'Maipú', ru: 'Майпу', lx: 5300, ly: -10300, alt: [4, 9], lote: 110, calle: 13, nl: 2, ang: -4, techo: 'plano', dens: .5, pal: PALB,
    pol: [[3900, -9200], [6600, -9300], [6700, -11500], [4000, -11600]] },
  { id: 'dorrego', nombre: '', alt: [4, 8], lote: 105, calle: 13, nl: 2, ang: -8, techo: 'plano', dens: .5, pal: PALB,
    pol: [[1800, -1500], [-300, -1500], [-300, -1750], [1500, -4200], [1800, -4200]] }
];

// Calles reales. Las de la cuadrícula del centro se ubican por su número de cuadra (G).
const N = (n, e0, e1) => linea(e0, n, e1, n), S = (e, n0, n1) => linea(e, n0, e, n1);
export const CALLES = [
  ['Avenida San Martín', 'av', [G(4, 17), G(4, 0), G(4, -27), LL(-32.9600, -68.8560), LL(-33.0052599, -68.8668086), LL(-33.0400, -68.8760)], 'проспект Сан-Мартин'],
  ['Peatonal Sarmiento', 'c', N(0, 1, 4), 'пешеходная улица Сармьенто'],
  ['Sarmiento', 'c', N(0, -13, -1), 'улица Сармьенто'],
  ['Garibaldi', 'c', N(0, 4, 9.6), 'улица Гарибальди'],
  ['Avenida Colón', 'av', N(-4, -4, 10), 'проспект Колон'],
  ['Arístides Villanueva', 'av', N(-4, -13, -4), 'улица Аристидес Вильянуэва'],
  ['Avenida Las Heras', 'av', N(4, -13, 10.5), 'проспект Лас-Эрас'],
  ['Avenida Mitre', 'c', S(0, -11, 17), 'проспект Митре'],
  ['Belgrano', 'av', S(-4, -12, 17), 'улица Бельграно'],
  ['Perú', 'c', S(-3, -9, 17), 'улица Перу'],
  ['25 de Mayo', 'c', S(-2, -9, 14), 'улица 25 Мая'],
  ['Chile', 'c', S(-1, -9, 14), 'улица Чили'],
  ['Patricias Mendocinas', 'c', S(1, -11, 14), 'улица Патрисиас Мендосинас'],
  ['España', 'c', S(2, -11, 14), 'улица Испании'],
  ['9 de Julio', 'c', S(3, -11, 14), 'улица 9 Июля'],
  ['San Juan', 'c', S(5, -9, 14), 'улица Сан-Хуан'],
  ['Rioja', 'c', S(7, -9, 14), 'улица Риоха'],
  ['Paso de los Andes', 'c', S(-10, -10, 17), 'улица Пасо-де-лос-Андес'],
  ['Olascoaga', 'c', S(-7, -10, 17), 'улица Оласкоага'],
  ['Boulogne Sur Mer', 'av', S(-13, -12, 18), 'проспект Булонь-сюр-Мер'],
  ['Rivadavia', 'c', N(-1, -4, 9.6), 'улица Ривадавия'],
  ['Montevideo', 'c', N(-2, -4, 9.6), 'улица Монтевидео'],
  ['San Lorenzo', 'c', N(-3, -4, 9.6), 'улица Сан-Лоренсо'],
  ['Espejo', 'c', N(1, -4, 9.6), 'улица Эспехо'],
  ['Gutiérrez', 'c', N(2, -4, 9.6), 'улица Гутьеррес'],
  ['Necochea', 'c', N(3, -4, 9.6), 'улица Некочеа'],
  ['Avenida Godoy Cruz', 'c', N(6, -13, 9.6), 'проспект Годой-Крус'],
  ['Suipacha', 'c', N(9, -13, 9.5), 'улица Суипача'],
  ['Avenida Pedro Molina', 'c', N(-6, -4, 9.6), 'проспект Педро Молина'],
  ['Avenida Peltier', 'c', N(-8.75, -4, 9.6), 'проспект Пельтье'],
  ['Canal Cacique Guaymallén', 'ag', CANAL, 'канал Касике Гуаймальен'],
  ['Acceso Este (Ruta 7)', 'av', [LL(-32.89601, -68.83308), LL(-32.89730, -68.81836), LL(-32.89804, -68.80957), LL(-32.90025, -68.80298), LL(-32.90394, -68.79639), LL(-32.90726, -68.78540), LL(-32.90874, -68.77837), LL(-32.91280, -68.77441), LL(-32.91649, -68.76848)], 'Восточный въезд (трасса 7)'],
  ['Costanera (Ruta 40)', 'ca', CANAL.map(([x, y]) => [x + 45, y - 10]), 'Костанера (трасса 40)'],
  ['Ruta 40 al aeropuerto', 'ca', [LL(-32.8640, -68.8060), LL(-32.8480, -68.8000), LL(-32.8340, -68.7975)], 'трасса 40 к аэропорту'],
  ['Avenida Carlos Thays', 'c', [LL(-32.8840741, -68.8608492), LL(-32.8835104, -68.8810969), LL(-32.8848769, -68.8845216), LL(-32.8906835, -68.8855106), LL(-32.8990559, -68.8777189), LL(-32.9013093, -68.8648818), LL(-32.8840741, -68.8608492)], 'проспект Карлоса Тэйса']
];
// (las calles menores de la cuadrícula las dibuja escena.js a partir de la cuadrícula de cada barrio: o, lote, ang)
export const VIAS = [];

// Plaza Independencia (4 manzanas) y sus cuatro plazas satélite, a dos cuadras de cada esquina
export const PLAZAS = [
  [0, 0, 226, 226, -12.5],
  [...G(2.5, -2.5), 104, 104, -12.5], [...G(-2.5, -2.5), 104, 104, -12.5], [...G(-2.5, 2.5), 104, 104, -12.5], [...G(2.5, 2.5), 104, 104, -12.5],
  [...LL(-32.8800, -68.8287), 92, 92, -12.5],
  [...LL(-32.9252658, -68.8443509), 110, 110, -12.5],
  [...LL(-32.9863754, -68.8821796), 72, 72, -8]
];

export const PARQUES = [
  { nombre: 'Parque General San Martín', den: 520, pol: [LL(-32.8840741, -68.8608492), LL(-32.8835104, -68.8810969), [-4100, 820], [-4750, 600], [-5000, -300], [-4600, -900],
    LL(-32.8990559, -68.8777189), LL(-32.9013093, -68.8648818)] },
  { nombre: 'Campo Histórico El Plumerillo', pol: [LL(-32.8439678, -68.8197819), LL(-32.8439678, -68.8174814), LL(-32.8422014, -68.8174814), LL(-32.8422014, -68.8197819)] },
  { nombre: 'Parque O\'Higgins', pol: [G(9.7, -3), G(11.6, -3), G(11.4, -7), G(9.7, -7)] },
  // las plazas del centro están llenas de árboles
  { nombre: '', den: 340, pol: grilla(-0.92, -0.92, 0.92, 0.92) },
  ...[[2.5, -2.5], [-2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([e, n]) => ({ nombre: '', den: 300, pol: grilla(e - 0.42, n - 0.42, e + 0.42, n + 0.42) })),
  { nombre: 'Parque Central', pol: [G(5, 10.2), G(8.6, 10.2), G(8.6, 13.4), G(5, 13.4)] },
  // el parque a la francesa de la Casa de Fader, con su laberinto de cipreses («Ladro di cuori 3»)
  { nombre: '', den: 700, pol: [LL(-33.0045, -68.8677), LL(-33.0045, -68.8653), LL(-33.0063, -68.8653), LL(-33.0063, -68.8677)] }
];

export const BORDES = [
  { texto: 'Los Andes · Aconcagua (6961 m) ←', ru: 'Анды · Аконкагуа (6961 м) ←', x: -7300, y: 1500, mar: true },
  { texto: 'Precordillera', ru: 'Предкордильера', x: -6900, y: -5200, mar: true },
  { texto: 'Viñedos de Maipú', ru: 'Виноградники Майпу', x: 7400, y: -6000, mar: true },
  { texto: 'Viñedos de Luján de Cuyo', ru: 'Виноградники Лухан-де-Куйо', x: 900, y: -15200, mar: true },
  { texto: 'Río Mendoza ↓', ru: 'Река Мендоса ↓', x: -1200, y: -16700, mar: true },
  { texto: 'Ruta 7 a San Martín y Buenos Aires →', ru: 'Трасса 7 на Сан-Мартин и Буэнос-Айрес →', x: 9300, y: -1500, mar: true }
];

export const AFUERAS = [[-90000, -90000], [90000, -90000], [90000, 90000], [-90000, 90000]];
export const AFUERAS_COLOR = 0xcdbf97;
export const MUELLES = [];
export const RESERVAS = [[0, 0, 30], ...[[2.5, -2.5], [-2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([e, n]) => [...G(e, n), 14])];
export const EXTRAS = ['andes'];
export const ARBOLES_CALLES = true;

// suelo: viñedos en hileras fuera de la ciudad, monte seco en el piedemonte
const dentroP = (p, pol) => { let c = false; for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) { const [xi, yi] = pol[i], [xj, yj] = pol[j]; if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c; } return c; };
export function colorSuelo(x, y, h) {
  const seco = sst(-2600, -5200, x);
  if (BARRIOS.some(b => dentroP([x, y], b.pol)) || PARQUES.some(p => dentroP([x, y], p.pol))) return [214, 214, 196];
  // fincas: parcelas de viña, olivares y álamos
  const a = Math.floor((x * 0.97 + y * 0.12) / 260), b = Math.floor((y * 0.98 - x * 0.1) / 200);
  const k = Math.abs(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1;
  const F = [[150, 176, 102], [170, 186, 116], [128, 160, 94], [196, 190, 150], [182, 196, 128]][Math.floor(k * 5)];
  const hilera = Math.sin((x * 0.12 + y * 0.016) * (k > 0.5 ? 1 : 0.8)) > 0.2 ? 0.92 : 1;
  const r = F[0] * hilera, g = F[1] * hilera, bb = F[2] * hilera;
  const M = [196 - h * 0.05, 176 - h * 0.06, 140 - h * 0.05]; // monte y piedra de la precordillera
  return [r + (M[0] - r) * seco, g + (M[1] - g) * seco, bb + (M[2] - bb) * seco];
}
export const zonaArboles = (x, y) => x > -3000 && !BARRIOS.some(b => dentroP([x, y], b.pol)) && Math.abs(Math.sin(Math.floor(x / 260) * 7.1 + Math.floor(y / 200) * 3.3)) > 0.85;

export const RUTA_BUS = [];
export const VISTA = { inicio: [-300, -200, 4200, 0.98, 0.62], toda: [600, -4000, 17000, 0.85, 0.5], cat: [-500, 0, 6000, 0.85], previa: [-400, 300], lejos: 26000, zoomExtra: 1.0 };
export const NOMBRE = { es: 'Mendoza', ru: 'Мендоса', gen: 'Мендосы', dat: 'Мендосе' };
export const LEMA = { es: '«tierra del sol y del buen vino»', ru: '«земля солнца и хорошего вина»' };
export const ALTURA_BASE = 30; // por encima del plano de agua, para que no asome a lo lejos
