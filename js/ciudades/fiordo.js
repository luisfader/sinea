// El fiordo de Sofía y Román: el Nuevo Nordholm y su palacio de hielo, tal como están en «Северная любовь: Восточный ветер»
// (la tercera parte), con lo que ya había en las dos primeras. Coordenadas en metros: x hacia el este, y hacia el norte.
// Mapa imaginado a partir de las novelas:
//  · «Дворец изо льда стоял над фьордом, дома — на холмах, а с востока к ним вела широкая зелёная равнина,
//    открытая, как ладонь» (cap. 5); el foso y después la muralla van «от фьорда до скал»;
//  · el mar queda al oeste («солнце коснулось края моря»), por donde llega en su lote Iván Petróvich;
//  · en el fiordo, la isla de la Guardiana de Piedra (primera parte).
// (0,0) es la plaza del Nuevo Nordholm.

export const LIMITES = { x0: -2600, x1: 2600, y0: -1800, y1: 1800 };

// eje del fiordo, de oeste a este: [x, y, medio ancho]
const EJE = [[-3400, -360, 520], [-2400, -400, 330], [-1700, -420, 240], [-1000, -470, 200], [-300, -480, 190], [400, -420, 180], [1200, -470, 170], [2000, -430, 160], [3400, -520, 150]];
export const ISLA = [-1500, -420, 95];
function distEje(x, y) {
  let m = 1e9, w = 200;
  for (let i = 0; i < EJE.length - 1; i++) {
    const [ax, ay, aw] = EJE[i], [bx, by, bw] = EJE[i + 1], dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l));
    const d = Math.hypot(ax + t * dx - x, ay + t * dy - y);
    if (d < m) { m = d; w = aw + (bw - aw) * t; }
  }
  return [m, w];
}
// distancia con signo a la costa (positiva en tierra)
export function costa(x, y) {
  const [d, w] = distEje(x, y);
  const ondita = Math.sin(x * .011) * 14 + Math.sin(x * .027 + y * .01) * 7;
  const agua = w + ondita - d;                                     // positivo dentro del fiordo
  const mar = (-2350 - x) + Math.sin(y * .004) * 120;               // el mar abierto, al oeste
  const isla = ISLA[2] - Math.hypot(x - ISLA[0], y - ISLA[1]);      // la isla de la Guardiana
  return Math.max(-Math.max(agua, mar), isla);
}
export const COSTA = [[-40000, -40000], [-40001, -40001]];
export const TIERRA = [[-40000, -40000], [40000, -40000], [40000, 40000], [-40000, 40000]];
export const RIO = [[5000, 5000, 1], [5001, 5001, 1]];
// el arroyo que baja de los cerros al fiordo, al oeste del pueblo
export const ARROYO = [[-1100, 1500, 6], [-950, 900, 7], [-900, 400, 8], [-880, -230, 9]];

export const COLINAS = [
  // la roca del palacio, sobre el agua, y las lomas del pueblo
  [-230, -150, 200, 42, 'Roca del palacio'], [150, 250, 360, 26, ''], [-450, 380, 320, 22, ''],
  // la loma del prado (con su único abedul) y la del foso
  [-650, 760, 300, 34, ''], [700, 620, 240, 30, ''],
  // las peñas de los dragones, al nordeste, «hasta las rocas»
  [900, 1450, 420, 150, 'Peñas de los dragones'], [1500, 1550, 500, 190, ''], [2200, 1500, 520, 170, ''], [400, 1650, 380, 120, ''],
  // la otra orilla del fiordo: montañas que caen al agua
  [-2200, -1250, 600, 230, ''], [-1300, -1150, 560, 260, ''], [-400, -1200, 600, 280, ''], [500, -1150, 560, 250, ''], [1400, -1200, 600, 270, ''], [2300, -1150, 560, 240, ''],
  // cerros del oeste y del norte, detrás del bosque
  [-2000, 900, 700, 90, ''], [-1300, 1500, 560, 110, ''], [-2300, 200, 380, 50, '']
];
// la isla: una roca alta en medio del fiordo
export function relieve(x, y) {
  const d = Math.hypot(x - ISLA[0], y - ISLA[1]);
  return d < ISLA[2] ? (1 - d / ISLA[2]) * 34 : 0;
}

const PAL = ['#f3efe6', '#e9e4d8', '#dfe7ec', '#f6f1e4', '#e6dccb', '#d9e3ea'];
export const BARRIOS = [
  { id: 'nordholm', nombre: 'Nuevo Nordholm', ru: 'Новый Нордхольм', lx: 40, ly: 330, alt: [5, 8], lote: 66, ang: 8, techo: 'teja', dens: .2, pal: PAL,
    pol: [[-230, 40], [230, 40], [300, 270], [130, 390], [-160, 370], [-270, 210]] },
  { id: 'puerto', nombre: 'El puertito de Iván Petróvich', ru: 'Порт Ивана Петровича', lx: -1950, ly: -40, alt: [4, 6], lote: 40, ang: -6, techo: 'teja', dens: .4, pal: ['#c9a27a', '#b78d65', '#d8b98f', '#a77c58'],
    pol: [[-2150, -150], [-1820, -170], [-1780, 60], [-2120, 90]] }
];
export const TECHO_HSL = [0.58, 0.45, 0.52]; // «голубые черепичные крыши Нового Нордхольма»

export const CALLES = [
  ['Calle del Palacio', 'av', [[-210, -90], [-120, 10], [0, 0], [120, 60], [260, 160], [400, 260]], 'Дворцовая улица'],
  ['Calle de las Arpas', 'c', [[0, 0], [-120, 180], [-260, 340], [-320, 480]], 'Улица Арф'],
  ['Calle del Puerto', 'c', [[0, 0], [60, -120], [120, -250]], 'Портовая улица'],
  ['Camino del prado', 'ca', [[-260, 340], [-450, 560], [-640, 720]], 'Дорога на луг'],
  ['Camino del este', 'ca', [[400, 260], [560, 380], [700, 520], [1200, 560], [2000, 600], [2600, 620]], 'Восточная дорога'],
  ['Camino del bosque', 'ca', [[-320, 480], [-500, 900], [-700, 1300], [-800, 1700]], 'Лесная дорога'],
  ['Sendero de la costa', 'ca', [[-380, 40], [-800, 0], [-1300, -100], [-1800, -40], [-2150, -40]], 'Береговая тропа']
];
export const VIAS = [];
export const PLAZAS = [[0, 0, 70, 52, 8]];
export const PARQUES = [
  { nombre: 'Huerta del abuelo Torvald', pol: [[300, -130], [520, -150], [560, -20], [330, 0]], den: 0 },
  { nombre: 'Manzanos', pol: [[-330, 520], [-180, 520], [-170, 620], [-320, 640]] }
];
export const LAGOS = [];

export const BORDES = [
  { texto: 'La llanura del este', ru: 'Восточная равнина', x: 1600, y: 300, mar: true },
  { texto: 'Mar', ru: 'Море', x: -2450, y: -800, mar: true },
  { texto: 'Fiordo', ru: 'Фьорд', x: -900, y: -470, mar: true },
  { texto: 'Bosque del norte', ru: 'Северный лес', x: -1600, y: 1100, mar: true },
  { texto: 'Estepa, hacia el este →', ru: 'Степь — на восток →', x: 2450, y: 250 },
  { texto: '↑ Lago Mudo (tres días al norte)', ru: '↑ Немое озеро (три дня на север)', x: -700, y: 1700 }
];

export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const AFUERAS_HUECO = true;
export const AFUERAS_COLOR = 0x9aab86;
export const MUELLES = [];
export const RESERVAS = [[-230, -150, 90], [0, 0, 50], [700, 400, 40]];
export const EXTRAS = ['norte'];
export const MAR_COLOR = [[.10, .24, .30], [.42, .62, .68]];
export const RUTA_BUS = [];
export const VISTA = { inicio: [-80, 60, 2300, 0.98, 0.6], toda: [0, 0, 5600, 0.85, 0.5], cat: [0, 0, 3200, 0.85], previa: [0, 0], lejos: 7600, zoomExtra: 1.7 };
export const NOMBRE = { es: 'el fiordo de Sofía y Román', ru: 'Фьорд Софии и Романа', gen: 'Нового Нордхольма', dat: 'Новому Нордхольму' };
export const LEMA = { es: '«Si el Norte de pronto se vuelve bueno, no preguntes por qué: dale las gracias»', ru: '«Если Север вдруг становится добрым, не спрашивай почему. Просто скажи спасибо»' };
export const ALTURA_BASE = 5;

// Suelo: el verano del viento del este: prados con flores, musgo esmeralda, roca y nieve en las cumbres;
// la tierra cocida del foso; la llanura pisoteada por los nómadas
export function colorSuelo(x, y, h, c) {
  const onda = Math.sin(x * .013 + Math.sin(y * .011) * 2) * 8;
  if (Math.abs(x - 730) < 14 && y > -330 && y < 1260) return [42, 40, 38];                 // el foso: piedra negra cocida por los dragones
  if (h > 150) return [236, 240, 244];                                                    // nieve
  if (h > 80) { const k = Math.min(1, (h - 80) / 70); return [120 + k * 70 + onda, 122 + k * 70 + onda, 118 + k * 74]; } // roca
  if (x > 760 && x < 2500 && y > -250 && y < 1050) return [150 + onda, 152 + onda, 112];  // la llanura pisoteada, más allá del foso
  const flor = (Math.sin(x * .09) * Math.sin(y * .083) > .86) ? 1 : 0;
  return flor ? [228, 214, 120] : [116 + onda, 158 + onda, 92];
}
export function zonaArboles(x, y) {
  if (y > 900 && x < 300) return true;                     // el bosque del norte: abedules enanos y abetos
  if (x < -1200 && y > -150 && y < 900) return Math.sin(x * .01) > -.2;
  return false;
}
