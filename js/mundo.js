// Geografía de Sinea. Coordenadas en metros: x hacia el este, y hacia el norte.
// Todo lo que se dibuja (relieve, calles, barrios, edificios) sale de aquí.

export const LIMITES = { x0: -4200, x1: 4200, y0: -3000, y1: 3800 };

// Costa: la tierra queda al oeste/norte de esta línea; el mar, al este y al sur.
export const COSTA = [
  [2900, 3800], [2750, 3000], [2600, 2300], [2700, 1800], [3050, 1560], [3020, 1340], [2620, 1250],
  [2300, 1000], [2150, 600], [2110, 220], [2060, -120], [2010, -450], [2160, -700], [2330, -880],
  [2360, -1000], [2200, -1100], [1850, -1170], [1460, -1205], [1100, -1255], [700, -1300], [300, -1275],
  [-100, -1230], [-520, -1300], [-1000, -1480], [-1500, -1640], [-2000, -1760], [-2600, -1820],
  [-3300, -1920], [-4200, -2000]
];
export const TIERRA = [...COSTA, [-4200, 3800]];

// Río Sina, de oeste a este, con su ancho en cada punto
export const RIO = [
  [-4200, 900, 34], [-3200, 820, 36], [-2500, 650, 38], [-1800, 520, 40], [-1100, 560, 42], [-500, 520, 44],
  [0, 460, 46], [400, 400, 48], [800, 330, 50], [1300, 230, 54], [1700, 120, 60], [2120, 40, 80]
];

// Colinas: [x, y, radio, altura]
export const COLINAS = [
  [-1150, -180, 330, 62, 'Colina de los Astrólogos'],
  [-2300, 150, 620, 120, 'Colina del Oeste'],
  [1250, -480, 270, 52, 'Colina de San Michele'],
  [-320, -1010, 260, 32, 'Colina de los Pescadores'],
  [-1500, -1050, 520, 55, ''],
  [-1600, 2300, 950, 48, ''],
  [1900, 2700, 750, 34, ''],
  [2820, 1450, 260, 18, ''],
  [-3200, -900, 800, 90, ''],
  [-3400, 2000, 900, 70, ''],
  [2150, -820, 160, 8, '']
];

// Barrios: polígono, etiqueta y estilo de edificación
// alt: [mín, máx] en metros · lote: tamaño de manzana · ang: giro de la cuadrícula
// techo: 'teja' (tejado a dos aguas) o 'plano' · dens: 0..1 · pal: colores de fachada
const PAL_VIEJO = ['#e9d8b8', '#f1e4c8', '#e2c9a0', '#efd9b0', '#d9b98c', '#f4ead6', '#e8cfae', '#dcc29c'];
const PAL_MOD = ['#d7d9dc', '#c9ced3', '#e3e1dc', '#bfc6cc', '#d9d3c7', '#cfd6db', '#e6e6e3'];
const PAL_PUERTO = ['#c7b8a2', '#b9a98f', '#cfc3ad', '#a99b86', '#d3c7b4'];
export const BARRIOS = [
  { id: 'casco', nombre: 'Casco Antiguo', ru: 'Старый город', lx: 420, ly: -760, alt: [8, 17], lote: 46, ang: 12, techo: 'teja', dens: .93, pal: PAL_VIEJO,
    pol: [[-180, -1150], [300, -1200], [1060, -1190], [1100, -820], [1080, -260], [620, -230], [200, -170], [-170, -380], [-120, -760]] },
  { id: 'puerto', nombre: 'Puerto y Cordeleros', ru: 'Порт и Канатчики', lx: 1380, ly: -880, alt: [7, 15], lote: 62, ang: 3, techo: 'plano', dens: .8, pal: PAL_PUERTO,
    pol: [[1060, -1190], [1820, -1140], [2000, -760], [1960, -420], [1500, -330], [1100, -360], [1100, -820]] },
  { id: 'ensanche', nombre: 'Ensanche', ru: 'Новый город', lx: 820, ly: 40, alt: [14, 30], lote: 78, ang: -7, techo: 'plano', dens: .9, pal: PAL_MOD,
    pol: [[-160, -360], [200, -170], [620, -230], [1080, -260], [1500, -330], [1960, -420], [2040, -60], [1700, 90], [1300, 200], [800, 300], [400, 370], [0, 430], [-120, 120]] },
  { id: 'artesanos', nombre: 'Barrio de los Artesanos', ru: 'Район Ремесленников', lx: -520, ly: -420, alt: [6, 12], lote: 42, ang: 24, techo: 'teja', dens: .92, pal: PAL_VIEJO,
    pol: [[-900, -700], [-120, -760], [-170, -380], [-120, 120], [-860, -60]] },
  { id: 'norte', nombre: 'Orilla Norte', ru: 'Северный берег', lx: 860, ly: 640, alt: [18, 46], lote: 86, ang: 2, techo: 'plano', dens: .9, pal: PAL_MOD,
    pol: [[-250, 560], [400, 450], [800, 380], [1300, 280], [1700, 170], [2110, 120], [2150, 600], [2200, 900], [1300, 1020], [0, 1000]] },
  { id: 'estacion', nombre: 'Los Tulipanes', ru: 'Квартал Тюльпанов', lx: 760, ly: 1420, alt: [9, 20], lote: 74, ang: -4, techo: 'plano', dens: .85, pal: PAL_MOD,
    pol: [[0, 1000], [1300, 1020], [1500, 1350], [1400, 1750], [400, 1750], [300, 1300]] },
  { id: 'locos', nombre: 'Barrio de los Locos', ru: 'Квартал сумасшедших', lx: -560, ly: 1560, alt: [6, 13], lote: 58, ang: 18, techo: 'teja', dens: .78, pal: PAL_VIEJO,
    pol: [[-1100, 1050], [0, 1000], [300, 1300], [400, 1750], [-1000, 1800]] },
  { id: 'amanecer', nombre: 'Barrio del Amanecer', ru: 'Район Рассвета', lx: -820, ly: 820, alt: [10, 24], lote: 80, ang: -12, techo: 'plano', dens: .86, pal: PAL_MOD,
    pol: [[-1900, 640], [-1100, 600], [-250, 560], [0, 1000], [-1100, 1050], [-1900, 1000]] },
  { id: 'este', nombre: 'Barrio Este', ru: 'Восточный квартал', lx: 1750, ly: 820, alt: [10, 24], lote: 82, ang: 10, techo: 'plano', dens: .82, pal: PAL_MOD,
    pol: [[1300, 1020], [2200, 900], [2550, 1250], [2500, 1700], [1500, 1350]] },
  { id: 'oeste', nombre: 'Barrio del Planetario', ru: 'Район Планетария', lx: -1520, ly: 330, alt: [7, 14], lote: 64, ang: -16, techo: 'teja', dens: .8, pal: PAL_VIEJO,
    pol: [[-1950, -650], [-900, -700], [-860, -60], [-120, 120], [0, 430], [-500, 480], [-1100, 520], [-1800, 480], [-1950, 0]] },
  { id: 'pescadores', nombre: 'Los Pescadores', ru: 'Рыбацкий квартал', lx: -560, ly: -1080, alt: [5, 10], lote: 40, ang: 38, techo: 'teja', dens: .88, pal: PAL_VIEJO,
    pol: [[-900, -700], [-120, -760], [-180, -1150], [-520, -1260], [-950, -1420]] },
  { id: 'ricos', nombre: 'Ricos Tristes', ru: 'Грустные Богачи', lx: -1560, ly: -1180, alt: [6, 11], lote: 120, ang: -20, techo: 'teja', dens: .55, pal: ['#f6f1e7', '#efe7d8', '#f8f4ec', '#e9dfcc'],
    pol: [[-2500, -1760], [-1500, -1600], [-950, -1420], [-900, -700], [-1950, -650], [-2600, -900]] },
  { id: 'afueras', nombre: '', lx: 0, ly: 2100, alt: [5, 9], lote: 110, ang: 6, techo: 'teja', dens: .3, pal: PAL_VIEJO,
    pol: [[-1000, 1800], [1400, 1750], [2400, 2000], [2400, 2600], [-1200, 2600]] }
];

// Calles con nombre: [nombre, tipo, puntos]. tipo: 'av' avenida, 'c' calle, 'ca' carretera
export const CALLES = [
  ['Avenida de la Independencia', 'av', [[600, -580], [608, -200], [612, 100], [604, 330], [600, 420], [560, 800], [430, 1080]], 'Проспект Независимости'],
  ['Bulevar Marítimo', 'av', [[-560, -1240], [-100, -1180], [300, -1215], [700, -1235], [1100, -1195], [1460, -1150], [1850, -1110], [2150, -1050], [2290, -950]], 'Приморский бульвар'],
  ['Carretera del Puerto', 'ca', [[2200, -880], [2010, -620], [1960, -300], [2010, 60], [2070, 600], [2240, 980], [2560, 1300], [2560, 2100], [2650, 3000], [2800, 3800]], 'Портовое шоссе'],
  ['Carretera del Norte', 'ca', [[430, 1080], [400, 1600], [380, 2450], [300, 3200], [260, 3800]], 'Северная дорога'],
  ['Avenida del Amanecer', 'av', [[0, 470], [-260, 760], [-620, 1080], [-1000, 1380]], 'Проспект Рассвета'],
  ['Avenida de los Emperadores', 'av', [[-860, -620], [-1180, -840], [-1450, -1040], [-1800, -1260], [-2200, -1500]], 'Проспект Императоров'],
  ['Ronda del Oeste', 'ca', [[-120, 120], [-800, 90], [-1500, 140], [-2000, 150], [-2600, 160], [-3300, 220], [-4200, 300]], 'Западное шоссе'],
  ['Calle de la Colina', 'c', [[330, -760], [60, -690], [-80, -660], [-250, -740]], 'Улица Холма'],
  ['Calle de la Paciencia', 'c', [[400, -540], [240, -430], [120, -330], [-40, -210]], 'Улица Терпения'],
  ['Calle de los Violinistas', 'c', [[80, -120], [300, -150], [560, -190]], 'Улица Скрипачей'],
  ['Calle de los Castaños', 'c', [[-860, -20], [-560, 40], [-260, 70]], 'Улица Каштанов'],
  ['Calle de las Mimosas', 'c', [[300, -1110], [460, -960], [600, -860]], 'Улица Мимоз'],
  ['Calle de los Pescadores', 'c', [[-560, -1220], [-320, -1120], [-140, -980]], 'Улица Рыбаков'],
  ['Calle de las Conchas', 'c', [[-60, -1150], [80, -1020], [200, -930]], 'Улица Ракушек'],
  ['Calle de los Tejedores', 'c', [[40, 430], [60, 120], [80, -120]], 'Улица Ткачей'],
  ['Malecón del Sina', 'c', [[-250, 560], [400, 445], [800, 375], [1300, 275], [1700, 165]], 'Набережная Сины'],
  ['Calle Marítima', 'c', [[900, -1150], [980, -960], [1060, -700], [1120, -420]], 'Морская улица'],
  ['Calle de los Emperadores Viejos', 'c', [[600, -580], [430, -440], [260, -520], [100, -640]], 'Улица Старых Императоров'],
  ['Avenida del Puerto', 'av', [[600, -700], [700, -950], [760, -1180]], 'Портовый проспект'],
  ['Calle de San Michele', 'c', [[680, -720], [900, -640], [1100, -560], [1250, -500]], 'Улица Сан-Микеле'],
  ['Camino del Faro', 'c', [[1850, -1110], [1990, -900], [2160, -760], [2330, -940]], 'Дорога к маяку'],
  ['Calle del Planetario', 'c', [[-250, -100], [-650, -150], [-1000, -180], [-1150, -180]], 'Улица Планетария'],
  ['Avenida del Este', 'av', [[1300, 270], [1550, 650], [1700, 1050], [1900, 1500]], 'Восточный проспект'],
  ['Calle de los Tulipanes', 'c', [[430, 1080], [700, 1250], [1000, 1400]], 'Улица Тюльпанов'],
  ['Camino del Cementerio', 'c', [[-620, 1080], [-1000, 1250], [-1250, 1350]], 'Кладбищенская дорога'],
  ['Calle del Ministerio', 'c', [[612, -300], [930, -330], [1200, -320]], 'Улица Министерства'],
  ['Camino del Cabo', 'c', [[2240, 980], [2600, 1300], [2780, 1450]], 'Дорога на мыс']
];

// Ferrocarril (la estación central está en [320, 1180])
export const VIAS = [
  [[-4200, 1500], [-2600, 1450], [-1300, 1350], [-500, 1270], [0, 1200], [320, 1180], [700, 1200], [1200, 1330], [1700, 1600], [2200, 2100], [2420, 2800], [2560, 3800]]
];

// Plazas (rectángulos pavimentados): [x, y, ancho, alto, giro]
export const PLAZAS = [
  [600, -640, 150, 112, 0], [590, -420, 72, 58, 0], [260, -520, 78, 74, 12], [330, 1080, 150, 70, 0], [1000, -1150, 160, 60, 0]
];

// Parques: polígonos
export const PARQUES = [
  { nombre: 'Parque del Sol', pol: [[-640, 120], [-120, 140], [-100, 420], [-620, 470]] },
  { nombre: 'Parque de la Alegría', pol: [[1720, -1150], [1960, -1110], [1980, -1000], [1740, -980]] },
  { nombre: 'Parque de los Delfines', pol: [[1420, -1200], [1640, -1170], [1650, -1060], [1420, -1080]] },
  { nombre: 'Cementerio Viejo', pol: [[-1380, 1260], [-1110, 1250], [-1110, 1460], [-1390, 1450]], cem: true },
  { nombre: '', pol: [[-1380, -380], [-920, -380], [-920, 30], [-1380, 20]] },
  { nombre: '', pol: [[1100, -640], [1380, -640], [1400, -360], [1120, -380]] },
  { nombre: '', pol: [[-500, -1080], [-200, -1100], [-160, -930], [-460, -900]] }
];

// Lugares fuera del mapa
export const BORDES = [
  { texto: 'Ciudad del Norte ↑', ru: 'Северный город ↑', x: 300, y: 3500 },
  { texto: '← Verdegrad · estación «Nubecita»', ru: '← Вердеград · станция «Облачко»', x: -3800, y: 420 },
  { texto: 'Bahía de Sinea', ru: 'Бухта Синеи', x: 900, y: -1700, mar: true },
  { texto: 'Mar', ru: 'Море', x: 3400, y: 200, mar: true }
];

/* ---------- utilidades geométricas ---------- */

export function dentro(p, pol) {
  let c = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [xi, yi] = pol[i], [xj, yj] = pol[j];
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}

export function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx - px, y = ay + t * dy - py;
  return [Math.sqrt(x * x + y * y), t];
}

export function distLinea(px, py, pts) {
  let m = 1e9;
  for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, distSeg(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])[0]);
  return m;
}

// distancia al río y ancho en ese punto
export function rio(px, py) {
  let m = 1e9, w = 40;
  for (let i = 0; i < RIO.length - 1; i++) {
    const a = RIO[i], b = RIO[i + 1];
    const [d, t] = distSeg(px, py, a[0], a[1], b[0], b[1]);
    if (d < m) { m = d; w = a[2] + (b[2] - a[2]) * t; }
  }
  return [m, w];
}

// distancia con signo a la costa (positiva en tierra)
export function costa(px, py) {
  const d = distLinea(px, py, COSTA);
  return dentro([px, py], TIERRA) ? d : -d;
}

const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ruido suave determinista
function ruido(x, y) {
  return Math.sin(x * 0.0021 + Math.sin(y * 0.0013) * 2.1) * Math.cos(y * 0.0017 - Math.sin(x * 0.0009) * 1.7);
}

// altura del terreno (m). El mar está a 0.
export function altura(x, y) {
  const c = costa(x, y);
  let h = 3 + ruido(x, y) * 1.5;
  for (const [cx, cy, r, a] of COLINAS) {
    const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r);
    h += a * Math.exp(-d2 * 1.6);
  }
  // borde costero: playa y fondo marino
  if (c < 0) return Math.max(-30, -2 + c * 0.06);
  h *= sstep(0, 90, c) * 0.85 + 0.15;
  h = Math.max(h, 0.6 + c * 0.01);
  // cauce del río
  const [dr, w] = rio(x, y);
  if (dr < w * 0.5 + 18) {
    const k = sstep(w * 0.5 + 18, w * 0.5 - 2, dr);
    h = h * (1 - k) + (-3.5) * k;
  }
  return h;
}

export function centroide(pol) {
  let x = 0, y = 0; for (const p of pol) { x += p[0]; y += p[1]; } return [x / pol.length, y / pol.length];
}
