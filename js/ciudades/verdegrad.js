// Geografía de Verdegrad, el pueblo verde de Natalia. Coordenadas en metros: x hacia el este, y hacia el norte.
// (0,0) es el mercado junto al campanario, «el corazón de Verdegrad».
// Fuentes: «Волны любви: Крепость в полумраке», «Нарисованный мир», «Лабиринт забвения», «Onde d'amore», «Город без улыбок».

export const LIMITES = { x0: -1900, x1: 1900, y0: -1500, y1: 1700 };

// Verdegrad no tiene mar: la «costa» queda muy lejos y todo es tierra
const E = 40000;
export const COSTA = [[-E, -E], [E, -E], [E, E], [-E, E], [-E, -E]];
export const TIERRA = COSTA;

// El río, al sur del pueblo, con niebla por las mañanas
export const RIO = [
  [-1900, -430, 30], [-1200, -360, 32], [-600, -300, 34], [0, -270, 36], [500, -290, 36], [1100, -360, 38], [1900, -470, 40]
];
// El arroyo que cruza la calle del Molino y desemboca en el río
export const ARROYO = [[-580, 1700, 6], [-545, 900, 7], [-510, 420, 7], [-485, 140, 8], [-470, -100, 9], [-460, -275, 10]];

export const COLINAS = [
  [430, 340, 280, 26, 'Colina de la fortaleza'],
  [-1300, 1150, 650, 32, ''],
  [1250, 1250, 600, 28, ''],
  [-1500, -1100, 500, 18, ''],
  [1400, -1150, 550, 20, '']
];

const PAL = ['#efe2c4', '#f3ead2', '#e8d3ad', '#f6efdf', '#e3cfa6', '#f0dcc0', '#dfe6d0', '#efe6cf'];
export const BARRIOS = [
  { id: 'centro', nombre: 'Centro', ru: 'Центр', lx: -60, ly: -120, alt: [6, 11], lote: 36, ang: 8, techo: 'teja', dens: .9, pal: PAL,
    pol: [[-330, -230], [330, -230], [380, 40], [120, 70], [60, 260], [-200, 300], [-320, 120]] },
  { id: 'tilos', nombre: 'Los Tilos', ru: 'Липовая', lx: -470, ly: 560, alt: [5, 9], lote: 44, ang: -32, techo: 'teja', dens: .72, pal: PAL,
    pol: [[-320, 120], [-200, 300], [60, 260], [40, 600], [-260, 900], [-700, 820], [-560, 330]] },
  { id: 'jardines', nombre: 'Los Jardines', ru: 'Садовый район', lx: 10, ly: 760, alt: [5, 9], lote: 46, ang: -6, techo: 'teja', dens: .7, pal: PAL,
    pol: [[60, 260], [180, 520], [300, 760], [80, 1000], [-260, 900], [40, 600]] },
  { id: 'molino', nombre: 'Barrio del Molino', ru: 'Мельничная', lx: -760, ly: 250, alt: [5, 9], lote: 40, ang: 4, techo: 'teja', dens: .78, pal: PAL,
    pol: [[-560, 330], [-320, 120], [-330, -230], [-700, -240], [-1040, -120], [-1040, 260], [-700, 420]] },
  { id: 'este', nombre: 'Barrio Este', ru: 'Восточный район', lx: 860, ly: 60, alt: [5, 10], lote: 46, ang: 14, techo: 'teja', dens: .74, pal: PAL,
    pol: [[330, -230], [1000, -290], [1150, 120], [900, 420], [700, 120], [380, 40]] },
  { id: 'estacion', nombre: 'La Estación', ru: 'У станции', lx: 760, ly: -800, alt: [5, 9], lote: 48, ang: -4, techo: 'teja', dens: .6, pal: PAL,
    pol: [[100, -420], [900, -470], [1000, -900], [300, -900], [80, -700]] },
  { id: 'huertas', nombre: '', lx: 0, ly: 1300, alt: [4, 7], lote: 90, ang: 10, techo: 'teja', dens: .28, pal: PAL,
    pol: [[-700, 820], [300, 760], [700, 900], [600, 1500], [-800, 1500]] }
];

export const CALLES = [
  ['Calle de los Tilos', 'av', [[-620, 900], [-430, 560], [-300, 380], [-140, 170], [-30, 40]], 'Липовая улица'],
  ['Calle de los Jardines', 'av', [[260, 980], [190, 560], [150, 260], [70, 40]], 'Садовая улица'],
  ['Calle del Molino', 'c', [[-140, 170], [-400, 140], [-650, 110]], 'Мельничная улица'],
  ['Calle del Oeste', 'c', [[-650, 110], [-860, 100], [-1080, 90]], 'Западная улица'],
  ['Callejón de los Zapateros', 'c', [[-560, 110], [-590, 20], [-640, -80]], 'Сапожный переулок'],
  ['Malecón del río', 'av', [[-900, -290], [-400, -250], [0, -225], [500, -245], [1000, -310]], 'Набережная'],
  ['Camino de la estación', 'av', [[40, -40], [130, -180], [200, -290], [300, -460], [420, -560]], 'Дорога к станции'],
  ['Antiguo camino a Sinea', 'ca', [[-1080, 90], [-1400, 70], [-1900, 40]], 'Старая дорога на Синею'],
  ['Alameda del Parque Viejo', 'c', [[70, 40], [200, 120], [330, 230], [420, 330]], 'Аллея старого парка'],
  ['Calle de la Iglesia', 'c', [[-650, 110], [-690, 60], [-700, -150]], 'Церковная улица'],
  ['Carretera del este', 'ca', [[380, 40], [800, 80], [1300, 140], [1900, 200]], 'Восточное шоссе'],
  ['Carretera del norte', 'ca', [[260, 980], [300, 1300], [340, 1700]], 'Северное шоссе']
];

// La línea de la electrichka, al sur del río; la estación «Nubecita» está en [420, -640]
export const VIAS = [
  [[-1900, -780], [-1000, -730], [-300, -690], [420, -650], [1100, -690], [1900, -770]]
];

export const PLAZAS = [
  [0, 0, 96, 74, 8], [-140, 170, 46, 46, 0], [420, -575, 90, 46, 0]
];

export const PARQUES = [
  { nombre: 'Parque Viejo', pol: [[110, 90], [380, 60], [700, 200], [720, 520], [420, 640], [150, 420]] },
  { nombre: '', pol: [[-600, 30], [-500, 30], [-500, 100], [-600, 100]] }
];
// estanque del Parque Viejo
export const LAGOS = [[230, 220, 55]];

export const BORDES = [
  { texto: '← Antiguo camino a Sinea', ru: '← Старая дорога на Синею', x: -1650, y: 60, ciudad: 'sinea' },
  { texto: 'Electrichka a Sinea →', ru: 'Электричка в Синею →', x: 1600, y: -770, ciudad: 'sinea' },
  { texto: 'Campos de girasoles', ru: 'Поля подсолнухов', x: -1200, y: -1050, mar: true },
  { texto: 'Bosque', ru: 'Лес', x: -1250, y: 1250, mar: true }
];

export const AFUERAS = [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]];
export const MUELLES = [];
export const RESERVAS = [[0, 0, 56], [-140, 170, 30], [430, 340, 135], [420, -600, 70]];
export const EXTRAS = ['tren-girasoles'];
export const VISTA = { inicio: [60, -40, 1700, 0.98, 0.45], toda: [0, 50, 3000, 0.85, 0.35], cat: [0, 50, 2300, 0.85], previa: [0, 200], lejos: 4800, zoomExtra: 1.3 };
export const NOMBRE = { es: 'Verdegrad', ru: 'Вердеград', gen: 'Вердеграда', dat: 'Вердеграду' };
export const LEMA = { es: '«aquí se respira mejor; aquí se puede ser más libre»', ru: '«здесь легче дышать, здесь можно быть свободнее»' };
export const ALTURA_BASE = 4;
