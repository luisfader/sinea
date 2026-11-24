// La Atlántida de «Звёздный роман». Coordenadas en metros: x hacia el este, y hacia el norte.
// Es un mapa imaginado a partir de la novela, que junta sus dos mundos:
//  · al oeste, la Tierra: la aldea de Laura entre manzanos, el bosque donde cayó la estrella, el río
//    y, sobre un promontorio alto junto al mar, el viejo faro en ruinas (caps. 1–16);
//  · al este, cruzando el mar, la Atlántida del cap. 18: «torres de piedra blanca y de cristal, como
//    enormes caracolas brillantes, bajo un cielo turquesa». La novela no dibuja su planta; los anillos
//    de tierra y agua siguen la Atlántida de Platón, y la cúpula recuerda que está «bajo la masa del océano».
// (0,0) es el medio del mar entre los dos mundos.

export const LIMITES = { x0: -2400, x1: 2600, y0: -1800, y1: 1800 };

// centro de la Atlántida y sus anillos [radio interior, radio exterior] de tierra
export const AX = 1500, AY = -100;
const ANILLOS = [[0, 190], [270, 430], [510, 700]];
// la costa de la Tierra (de norte a sur), con el promontorio del faro
export const COSTA = [
  [-560, 4000], [-560, 1800], [-610, 1300], [-520, 1000], [-430, 820], [-470, 640], [-600, 520], [-650, 300],
  [-560, 60], [-640, -250], [-600, -620], [-700, -1000], [-660, -1400], [-720, -1800], [-720, -4000]
];
export const TIERRA = [...COSTA, [-40000, -4000], [-40000, 4000]];

function distSegL(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(ax + t * dx - px, ay + t * dy - py);
}
function dentroL(p, pol) {
  let c = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [xi, yi] = pol[i], [xj, yj] = pol[j];
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
// distancia con signo a la costa (positiva en tierra): la Tierra al oeste y los anillos de la Atlántida
export function costa(x, y) {
  let m = 1e9;
  for (let i = 0; i < COSTA.length - 1; i++) m = Math.min(m, distSegL(x, y, COSTA[i][0], COSTA[i][1], COSTA[i + 1][0], COSTA[i + 1][1]));
  const dT = dentroL([x, y], TIERRA) ? m : -m;
  const r = Math.hypot(x - AX, y - AY);
  let dA = -1e9;
  for (const [a, b] of ANILLOS) dA = Math.max(dA, Math.min(a ? r - a : 1e9, b - r));
  // el gran canal que entra desde el oeste hasta la isla central
  const canal = Math.min(30 - Math.abs(y - AY), r - 190, AX - x);
  dA = Math.min(dA, -canal);
  return Math.max(dT, dA);
}

// el río de la aldea, que baja del bosque al mar
export const RIO = [[-2400, 1150, 14], [-1900, 1000, 16], [-1450, 900, 18], [-1100, 980, 20], [-800, 1080, 22], [-600, 1200, 26]];
export const ARROYO = [];

export const COLINAS = [
  [-680, 700, 260, 46, 'Promontorio del faro'],
  [-1250, 1500, 600, 30, ''], [-2000, 1350, 500, 26, ''], [-1150, 450, 420, 14, ''], [-2100, -1300, 650, 22, ''], [-1300, -1350, 500, 16, '']
];

const PAL_ALDEA = ['#e9d8b8', '#d9c09a', '#efe3c8', '#c9a77f', '#e3cfa6', '#d8c7a8'];
const PAL_ATL = ['#f4f8fb', '#e6f3f6', '#dff1f3', '#f8f5ee', '#cfeef0', '#e9f6fb', '#bfe6ee'];
// sectores de un anillo de la Atlántida (sin tocar el canal)
const sector = (a, b, i, n) => {
  const pts = [], a0 = Math.PI + .11 + i * (2 * Math.PI - .22) / n, a1 = Math.PI + .11 + (i + 1) * (2 * Math.PI - .22) / n - .05;
  for (let k = 0; k <= 4; k++) { const t = a0 + (a1 - a0) * k / 4; pts.push([AX + Math.cos(t) * b, AY + Math.sin(t) * b]); }
  for (let k = 4; k >= 0; k--) { const t = a0 + (a1 - a0) * k / 4; pts.push([AX + Math.cos(t) * a, AY + Math.sin(t) * a]); }
  return pts;
};
export const BARRIOS = [
  { id: 'aldea', nombre: 'La aldea de Laura', ru: 'Деревня Лауры', lx: -1750, ly: -250, alt: [4, 6], lote: 80, ang: 6, techo: 'teja', dens: .2, pal: PAL_ALDEA,
    pol: [[-2150, -620], [-1350, -560], [-1250, -150], [-1500, 80], [-2050, 40], [-2250, -250]] },
  ...[0, 1, 2, 3, 4, 5].map(i => ({ id: 'medio' + i, nombre: i === 2 ? 'Anillo medio' : '', ru: i === 2 ? 'Средний круг' : '', lx: AX, ly: AY + 350, alt: [8, 18], lote: 30, ang: 0, techo: 'plano', dens: .55, pal: PAL_ATL, pol: sector(290, 410, i, 6) })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ id: 'ext' + i, nombre: i === 3 ? 'Anillo exterior' : '', ru: i === 3 ? 'Внешний круг' : '', lx: AX, ly: AY + 600, alt: [6, 14], lote: 34, ang: 0, techo: 'plano', dens: .5, pal: PAL_ATL, pol: sector(530, 680, i, 8) }))
];

export const CALLES = [
  ['Calle del pueblo', 'c', [[-2200, -300], [-1900, -320], [-1600, -280], [-1350, -250]], 'Деревенская улица'],
  ['Sendero de los recolectores', 'ca', [[-1350, -250], [-1250, 0], [-1180, 250], [-1100, 350]], 'Тропа грибников'],
  ['Sendero al faro', 'ca', [[-1100, 350], [-950, 520], [-820, 640], [-720, 700]], 'Тропа к маяку'],
  ['Camino abandonado', 'ca', [[-1600, -280], [-1700, 300], [-1600, 900], [-1500, 1700]], 'Заброшенная дорога'],
  ['Gran canal', 'c', [[AX - 700, AY], [AX - 200, AY]], 'Большой канал']
];
export const VIAS = [];
export const PLAZAS = [[-1720, -300, 60, 40, 4]];
export const PARQUES = [
  { nombre: 'Huertos de manzanos', pol: [[-2100, -560], [-1800, -560], [-1800, -420], [-2100, -420]] }
];
export const LAGOS = [];

export const BORDES = [
  { texto: 'Bosque', ru: 'Лес', x: -1500, y: 600, mar: true },
  { texto: 'La Tierra', ru: 'Земля', x: -1900, y: 1550, mar: true },
  { texto: 'Mar', ru: 'Море', x: 200, y: -1300, mar: true },
  { texto: 'Atlántida, bajo el océano', ru: 'Атлантида под толщей океана', x: AX, y: AY - 900, mar: true },
  { texto: '← Ciudad', ru: '← Город', x: -2300, y: -300 }
];

// campo más allá del mapa, solo del lado de la Tierra
export const AFUERAS = [[-40000, -40000], [-720, -40000], [-720, -1790], [-2390, -1790], [-2390, 1790], [-560, 1790], [-560, 40000], [-40000, 40000]];
export const AFUERAS_HUECO = false;
export const MUELLES = [];
export const RESERVAS = [[AX, AY, 120], [-1750, -350, 30], [-680, 700, 60]];
export const EXTRAS = ['cupula-atlantida'];
export const MAR_COLOR = [[.10, .42, .52], [.40, .80, .86]];
export const RUTA_BUS = [];
export const VISTA = { inicio: [-200, -50, 3600, 0.95, 0.55], toda: [100, 0, 5200, 0.85, 0.5], cat: [0, 0, 3600, 0.85], previa: [0, 0], lejos: 7000, zoomExtra: 1.5 };
export const NOMBRE = { es: 'Atlántida', ru: 'Атлантида', gen: 'Атлантиды', dat: 'Атлантиде' };
export const LEMA = { es: '«En cualquiera de los dos mundos, volvemos siempre el uno al otro»', ru: '«В каком бы из двух миров мы ни оказались, мы возвращаемся друг к другу»' };
export const ALTURA_BASE = 3;

// Suelo: prados y bosque en la Tierra; piedra blanca y jardines en la Atlántida
export function colorSuelo(x, y, h, c) {
  if (x > 300) {
    const r = Math.hypot(x - AX, y - AY), onda = Math.sin(r * .05) * 6;
    return [228 + onda, 238 + onda, 236 + onda];
  }
  const bosque = Math.max(0, Math.min(1, (y + 150) / 500)) * Math.max(0, Math.min(1, (x + 2300) / 300));
  const onda = Math.sin(x * .013 + Math.sin(y * .011) * 2) * 7;
  return [178 - bosque * 70 + onda, 198 - bosque * 50 + onda, 128 - bosque * 40];
}
// el bosque al norte y al este de la aldea
export function zonaArboles(x, y) {
  if (x > -560) return false;
  if (x > -1450 && x < -1250 && y < 0) return false;
  return y > -100 && !(Math.hypot(x + 680, y - 700) < 120) && !(Math.hypot(x + 1100, y - 350) < 60);
}
