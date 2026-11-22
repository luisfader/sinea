// Selector de ciudad: exporta la geografía de la ciudad activa (globalThis.CIUDAD)
// y las utilidades geométricas que usan escena.js, hitos.js y app.js.
import * as SINEA from './ciudades/sinea.js';
import * as VERDEGRAD from './ciudades/verdegrad.js';

export const CIUDAD = globalThis.CIUDAD === 'verdegrad' ? 'verdegrad' : 'sinea';
const C = CIUDAD === 'verdegrad' ? VERDEGRAD : SINEA;
export const ARROYO = C.ARROYO || [], LAGOS = C.LAGOS || [];
export const { LIMITES, COSTA, TIERRA, RIO, COLINAS, BARRIOS, CALLES, VIAS, PLAZAS, PARQUES, BORDES, AFUERAS, MUELLES, RESERVAS, EXTRAS, VISTA, NOMBRE, LEMA, RUTA_BUS } = C;

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
  for (const curso of [RIO, ARROYO]) for (let i = 0; i < curso.length - 1; i++) {
    const a = curso[i], b = curso[i + 1];
    const [d, t] = distSeg(px, py, a[0], a[1], b[0], b[1]);
    if (d < m) { m = d; w = a[2] + (b[2] - a[2]) * t; }
  }
  for (const [x, y, r] of LAGOS) { const d = Math.hypot(px - x, py - y); if (d < m) { m = d; w = r * 2; } }
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
  let h = C.ALTURA_BASE + ruido(x, y) * 1.5;
  for (const [cx, cy, r, a] of COLINAS) {
    const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r);
    h += a * Math.exp(-d2 * 1.6);
  }
  // borde costero: playa y fondo marino
  if (c < 0) return Math.max(-30, -2 + c * 0.06);
  h *= sstep(0, 90, c) * 0.85 + 0.15;
  h = Math.max(h, 0.6 + (CIUDAD === 'sinea' ? c : Math.min(c, 200)) * 0.01);
  // cauce del río
  const [dr, w] = rio(x, y);
  const orilla = Math.min(18, w * 0.9);
  if (dr < w * 0.5 + orilla) {
    const k = sstep(w * 0.5 + orilla, w * 0.5 - 2, dr);
    h = h * (1 - k) + (-3.5) * k;
  }
  return h;
}

export function centroide(pol) {
  let x = 0, y = 0; for (const p of pol) { x += p[0]; y += p[1]; } return [x / pol.length, y / pol.length];
}
