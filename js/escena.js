// Construcción de la escena 3D de Sinea: relieve, agua, calles, edificios e hitos.
import * as THREE from './vendor/three.module.js';
import {
  LIMITES, COSTA, RIO, BARRIOS, CALLES, VIAS, PLAZAS, PARQUES, AFUERAS, MUELLES, CIUDAD, AFUERAS_HUECO, AFUERAS_COLOR, colorSuelo, zonaArboles, ARBOLES_CALLES, altura, costa, rio, dentro, distLinea, distSeg
} from './mundo.js';

// mundo (x este, y norte) → three (X, Y arriba, Z sur)
export const V = (x, y, h = null) => new THREE.Vector3(x, h === null ? altura(x, y) : h, -y);

function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const W = LIMITES.x1 - LIMITES.x0, H = LIMITES.y1 - LIMITES.y0;

/* ------------------------------------------------------------------ */
/* Textura del suelo: un mapa pintado en un canvas                     */
/* ------------------------------------------------------------------ */
const ANCHO = { av: 22, c: 11, ca: 18, ag: 11 };

export function pintarSuelo(S, minimas) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d');
  // 1) base por muestreo (relieve, playa, vegetación)
  const B = 768, base = document.createElement('canvas'); base.width = base.height = B;
  const bg = base.getContext('2d'), img = bg.createImageData(B, B);
  for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) {
    const x = LIMITES.x0 + (i + .5) / B * W, y = LIMITES.y1 - (j + .5) / B * H;
    const h = altura(x, y), c = costa(x, y);
    const hx = altura(x + 12, y) - h, hy = altura(x, y + 12) - h;
    const luz = Math.max(-1, Math.min(1, (-hx * 0.7 + hy * 0.7) * 0.35));
    let r, gg, b;
    if (c < 0) { const k = Math.min(1, -c / 260); r = 120 - 70 * k; gg = 200 - 70 * k; b = 210 - 40 * k; }
    else if (c < 22) { r = 236; gg = 222; b = 184; }
    else {
      const v = Math.min(1, Math.max(0, (h - 6) / 70));
      r = 214 - 60 * v; gg = 222 - 30 * v; b = 190 - 70 * v;
    }
    if (colorSuelo && c >= 22) { [r, gg, b] = colorSuelo(x, y, h, c); }
    if (CIUDAD === 'verdegrad' && !BARRIOS.some(B => B.nombre && dentro([x, y], B.pol)) && !PARQUES.some(P => dentro([x, y], P.pol)) && h < 22) {
      // campos alrededor del pueblo: girasoles, trigo, huertas y prados
      const a = Math.floor((x + y * 0.35) / 170), bb = Math.floor((y - x * 0.25) / 130);
      const k = Math.abs(Math.sin(a * 12.9898 + bb * 78.233) * 43758.5453) % 1;
      const F = [[226, 196, 74], [214, 200, 130], [176, 204, 120], [150, 186, 104], [198, 214, 150]][Math.floor(k * 5)];
      const surco = (Math.sin((x * 0.8 + y * 0.6) * 0.35) > 0.6) ? 0.93 : 1;
      r = F[0] * surco; gg = F[1] * surco; b = F[2] * surco;
    }
    const [dr, w] = rio(x, y);
    if (c >= 0 && dr < w * 0.5 + 4) { r = 110; gg = 175; b = 200; }
    const o = (j * B + i) * 4;
    img.data[o] = r + luz * 30; img.data[o + 1] = gg + luz * 30; img.data[o + 2] = b + luz * 26; img.data[o + 3] = 255;
  }
  bg.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(base, 0, 0, S, S);

  const px = x => (x - LIMITES.x0) / W * S, py = y => (LIMITES.y1 - y) / H * S, m = S / W;
  const camino = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(px(p[0]), py(p[1])) : g.moveTo(px(p[0]), py(p[1]))); };
  const poli = (pol) => { camino(pol); g.closePath(); };
  // 2) barrios: tono urbano
  for (const b of BARRIOS) {
    poli(b.pol); g.save(); g.clip();
    camino(COSTA.concat([[-4200, 3800], [4200, 3800], [4200, -3000]])); g.closePath(); g.clip();
    g.fillStyle = b.id === 'afueras' ? 'rgba(232,226,208,.55)' : b.id === 'ricos' ? 'rgba(226,232,206,.7)' : 'rgba(236,231,221,.88)';
    g.fillRect(0, 0, S, S);
    // calles menores de la cuadrícula
    g.strokeStyle = '#fbfaf7'; g.lineWidth = Math.max(1, (b.calle || 7) * m); g.lineCap = 'butt';
    const a = b.ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), L = b.lote;
    const [cx, cy] = b.o || cen(b.pol), R = Math.ceil(Math.max(2600, ...b.pol.map(p => Math.hypot(p[0] - cx, p[1] - cy))) / L) * L;
    g.beginPath();
    for (let k = -R; k <= R; k += L) {
      g.moveTo(px(cx + ca * k - sa * -R), py(cy + sa * k + ca * -R)); g.lineTo(px(cx + ca * k - sa * R), py(cy + sa * k + ca * R));
      g.moveTo(px(cx + ca * -R - sa * k), py(cy + sa * -R + ca * k)); g.lineTo(px(cx + ca * R - sa * k), py(cy + sa * R + ca * k));
    }
    g.stroke(); g.restore();
  }
  // 3) parques y plazas
  for (const p of PARQUES) {
    poli(p.pol); g.fillStyle = p.cem ? '#b5c9a6' : '#b9dc9e'; g.fill();
    g.strokeStyle = 'rgba(90,140,80,.35)'; g.lineWidth = 2 * m; g.stroke();
    if (!p.cem) { g.save(); poli(p.pol); g.clip(); g.strokeStyle = 'rgba(245,238,220,.9)'; g.lineWidth = 4 * m;
      const [x0, y0] = cen(p.pol); g.beginPath(); g.arc(px(x0), py(y0), 70 * m, 0, 7); g.moveTo(px(x0 - 400), py(y0)); g.lineTo(px(x0 + 400), py(y0)); g.stroke(); g.restore(); }
  }
  for (const [x, y, w, h, r] of PLAZAS) {
    g.save(); g.translate(px(x), py(y)); g.rotate(-r * Math.PI / 180);
    g.fillStyle = '#e9dfcf'; g.fillRect(-w / 2 * m, -h / 2 * m, w * m, h * m);
    g.strokeStyle = 'rgba(170,150,120,.5)'; g.lineWidth = 1.2 * m;
    for (let k = -w / 2; k <= w / 2; k += 6) { g.beginPath(); g.moveTo(k * m, -h / 2 * m); g.lineTo(k * m, h / 2 * m); g.stroke(); }
    g.restore();
  }
  // 4) vías del tren
  for (const v of VIAS) {
    camino(v); g.strokeStyle = '#a7a39a'; g.lineWidth = 14 * m; g.stroke();
    camino(v); g.strokeStyle = '#6f6b63'; g.lineWidth = 2.2 * m; g.setLineDash([9 * m, 6 * m]); g.stroke(); g.setLineDash([]);
  }
  // 5) calles con nombre: borde y relleno
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const [, t, pts] of CALLES) { camino(pts); g.strokeStyle = t === 'ag' ? '#8fb7c9' : t === 'ca' ? '#d9a75a' : t === 'av' ? '#d2b56f' : '#cfc8bb'; g.lineWidth = (ANCHO[t] + 4) * m; g.stroke(); }
  for (const [, t, pts] of CALLES) { camino(pts); g.strokeStyle = t === 'ag' ? '#7fb8d6' : t === 'ca' ? '#f9c36b' : t === 'av' ? '#fde49a' : '#ffffff'; g.lineWidth = ANCHO[t] * m; g.stroke(); }
  // puertos y muelles
  g.fillStyle = '#cfc6b6';
  for (const [x, y, w, h] of MUELLES) g.fillRect(px(x), py(y + h / 2), w * m, h * m);
  return cv;
}
const cen = (pol) => { let x = 0, y = 0; for (const p of pol) { x += p[0]; y += p[1]; } return [x / pol.length, y / pol.length]; };

/* ------------------------------------------------------------------ */
export function crearTerreno(tex) {
  const SX = 420, SY = Math.round(420 * H / W);
  const geo = new THREE.PlaneGeometry(W, H, SX, SY);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + (LIMITES.x0 + LIMITES.x1) / 2, z = pos.getZ(i) - (LIMITES.y0 + LIMITES.y1) / 2;
    pos.setX(i, x); pos.setZ(i, z); pos.setY(i, altura(x, -z));
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.97, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true; mesh.name = 'terreno';
  return mesh;
}

/* ------------------------------------------------------------------ */
export function crearMar(uniforms) {
  const geo = new THREE.PlaneGeometry(90000, 90000, 1, 1); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: uniforms.uT, uNoche: uniforms.uNoche, uSol: { value: new THREE.Vector3(0.5, 0.6, 0.4).normalize() } }]),
    vertexShader: `
      varying vec3 vP;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix*vec4(position,1.); vP=w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `
      uniform float uT; uniform float uNoche; uniform vec3 uSol; varying vec3 vP;
      #include <fog_pars_fragment>
      void main(){
        vec2 p=vP.xz;
        float a=sin(p.x*.031+uT*1.1)+sin(p.y*.027-uT*.9)+sin((p.x+p.y)*.017+uT*.7)*.8+sin((p.x-p.y)*.063+uT*1.7)*.35;
        vec3 n=normalize(vec3(cos(p.x*.031+uT*1.1)*.031+cos((p.x+p.y)*.017+uT*.7)*.014, 1., cos(p.y*.027-uT*.9)*.027));
        vec3 v=normalize(cameraPosition-vP);
        float fres=pow(1.-max(dot(n,v),0.),3.);
        vec3 dia=mix(vec3(.16,.47,.66),vec3(.55,.78,.9),fres*.8);
        vec3 noc=mix(vec3(.02,.05,.12),vec3(.10,.16,.28),fres);
        vec3 c=mix(dia,noc,uNoche);
        float spec=pow(max(dot(reflect(-uSol,n),v),0.),90.)*(1.-uNoche);
        c+=spec*.6+a*.012;
        gl_FragColor=vec4(c,.86);
        #include <fog_fragment>
      }`
  });
  const m = new THREE.Mesh(geo, mat); m.position.y = 0.2; m.renderOrder = 1;
  // fondo marino profundo fuera del terreno detallado
  const fg = new THREE.PlaneGeometry(90000, 90000); fg.rotateX(-Math.PI / 2);
  const fondo = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x2f6f93 })); fondo.position.y = -31;
  const g = new THREE.Group(); g.add(fondo, m); return g;
}

/* ------------------------------------------------------------------ */
/* Edificios genéricos generados por barrio                            */
/* ------------------------------------------------------------------ */
export function crearEdificios(reservas, uniforms) {
  const r = rnd(7);
  const lotes = [];
  const plazaDentro = (x, y) => PLAZAS.some(([px, py, w, h]) => Math.abs(x - px) < w / 2 + 8 && Math.abs(y - py) < h / 2 + 8);
  const parqueDentro = (x, y) => PARQUES.some(p => dentro([x, y], p.pol));
  const calleCerca = (x, y, marg) => {
    for (const [, t, pts] of CALLES) {
      const w = ANCHO[t] / 2 + marg;
      // prefiltro por caja
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      for (const p of pts) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }
      if (x < minx - w || x > maxx + w || y < miny - w || y > maxy + w) continue;
      if (distLinea(x, y, pts) < w) return true;
    }
    for (const v of VIAS) if (distLinea(x, y, v) < 12 + marg) return true;
    return false;
  };
  for (const b of BARRIOS) {
    const a = b.ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), L = b.lote, calle = b.calle || 7;
    const [cx, cy] = b.o || cen(b.pol);
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (const p of b.pol) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }
    const R = b.o ? Math.ceil(Math.max(...b.pol.map(p => Math.hypot(p[0] - cx, p[1] - cy))) / L) * L : Math.max(maxx - minx, maxy - miny);
    const nl = b.nl || (L > 90 ? 2 : L > 55 ? 3 : 2); // lotes por lado de manzana
    for (let u = -R; u < R; u += L) for (let v = -R; v < R; v += L) {
      const cell = (L - calle) / nl;
      for (let i = 0; i < nl; i++) for (let j = 0; j < nl; j++) {
        if (r() > b.dens) continue;
        if (nl > 3 && i > 0 && i < nl - 1 && j > 0 && j < nl - 1 && r() < 0.7) continue; // patio en el corazón de la manzana
        const lu = u + calle / 2 + cell * (i + .5), lv = v + calle / 2 + cell * (j + .5);
        const x = cx + ca * lu - sa * lv, y = cy + sa * lu + ca * lv;
        if (!dentro([x, y], b.pol)) continue;
        if (costa(x, y) < 18) continue;
        const [dr, w] = rio(x, y); if (dr < w / 2 + 16) continue;
        if (plazaDentro(x, y) || parqueDentro(x, y)) continue;
        if (reservas.some(([rx, ry, rr]) => (x - rx) ** 2 + (y - ry) ** 2 < rr * rr)) continue;
        const fw = cell * (0.62 + r() * 0.3), fd = cell * (0.62 + r() * 0.3);
        if (calleCerca(x, y, Math.max(fw, fd) * 0.55)) continue;
        const h0 = altura(x, y), hs = [altura(x + fw / 2, y), altura(x - fw / 2, y), altura(x, y + fd / 2), altura(x, y - fd / 2)];
        const mn = Math.min(h0, ...hs), mx = Math.max(h0, ...hs);
        if (mx - mn > 9) continue;
        let alto = b.alt[0] + (b.alt[1] - b.alt[0]) * Math.pow(r(), 1.6);
        if (b.id === 'norte' && r() < 0.07) alto *= 2.2; // alguna torre
        if (b.torres && r() < b.torres) alto *= 2.4;
        lotes.push({ x, y, w: fw, d: fd, h: alto, base: mn - 1, ang: a + (r() - .5) * 0.06, techo: b.techo, col: b.pal[(r() * b.pal.length) | 0] });
      }
    }
  }
  // cuerpos
  const caja = new THREE.BoxGeometry(1, 1, 1); caja.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0.02 });
  ventanas(mat, uniforms);
  const cuerpos = new THREE.InstancedMesh(caja, mat, lotes.length);
  const prisma = techoGeo();
  const tejas = lotes.filter(l => l.techo === 'teja');
  const matT = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const techos = new THREE.InstancedMesh(prisma, matT, tejas.length);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), c = new THREE.Color();
  let k = 0;
  lotes.forEach((l, i) => {
    const alto = l.h + (l.base < altura(l.x, l.y) ? altura(l.x, l.y) - l.base : 0);
    Q.setFromAxisAngle(Y, l.ang); P.set(l.x, l.base, -l.y); S.set(l.w, alto, l.d);
    M.compose(P, Q, S); cuerpos.setMatrixAt(i, M);
    c.set(l.col); c.offsetHSL(0, 0, (Math.random() - .5) * 0.05); cuerpos.setColorAt(i, c);
    if (l.techo === 'teja') {
      P.set(l.x, l.base + alto, -l.y); S.set(l.w * 1.06, Math.min(l.w, l.d) * 0.38, l.d * 1.06);
      M.compose(P, Q, S); techos.setMatrixAt(k, M);
      c.setHSL(0.03 + Math.random() * 0.03, 0.55 + Math.random() * 0.15, 0.42 + Math.random() * 0.1); techos.setColorAt(k++, c);
    }
  });
  cuerpos.castShadow = cuerpos.receiveShadow = true; techos.castShadow = techos.receiveShadow = true;
  cuerpos.name = 'edificios';
  const g = new THREE.Group(); g.add(cuerpos, techos); g.userData.n = lotes.length;
  return g;
}

function techoGeo() {
  // prisma triangular de base 1×1 y altura 1, la cumbrera a lo largo de Z
  const g = new THREE.BufferGeometry();
  const v = [-.5, 0, -.5, .5, 0, -.5, 0, 1, -.5, -.5, 0, .5, .5, 0, .5, 0, 1, .5];
  const idx = [0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4, 0, 1, 4, 0, 4, 3];
  const pos = [];
  for (const i of idx) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
}

// Ventanas: de día un leve dibujo de vanos; de noche, algunas encendidas
export function ventanas(mat, uniforms, densidad = 0.55) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uNoche = uniforms.uNoche;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vec4 wpp = vec4(transformed,1.0);\n #ifdef USE_INSTANCING\n wpp = instanceMatrix*wpp;\n #endif\n wpp = modelMatrix*wpp; vWP = wpp.xyz;\n vec3 nnw = objectNormal;\n #ifdef USE_INSTANCING\n nnw = mat3(instanceMatrix)*nnw;\n #endif\n vWN = normalize(mat3(modelMatrix)*nnw);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; varying vec3 vWN; uniform float uNoche;
      float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      if (abs(vWN.y) < 0.5) {
        float u = (abs(vWN.x) > abs(vWN.z)) ? vWP.z : vWP.x;
        vec2 cel = vec2(floor(u/3.4), floor(vWP.y/3.3));
        vec2 f = vec2(fract(u/3.4), fract(vWP.y/3.3));
        float ven = step(.25,f.x)*step(f.x,.75)*step(.3,f.y)*step(f.y,.8)*step(2.5, vWP.y - 0.0);
        diffuseColor.rgb *= 1.0 - ven*0.22*(1.0-uNoche);
        float on = step(${(1 - densidad).toFixed(2)}, hsh(cel + floor(vWP.xz/40.)));
        totalEmissiveRadiance += ven*on*uNoche*vec3(1.0,.78,.45)*1.25;
      }`);
  };
}

/* ------------------------------------------------------------------ */
/* Árboles                                                             */
/* ------------------------------------------------------------------ */
export function crearArboles(reservas) {
  const r = rnd(42), pts = [];
  for (const p of PARQUES) {
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (const q of p.pol) { minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); }
    const n = (maxx - minx) * (maxy - miny) / (p.cem ? 500 : p.den || 260);
    for (let i = 0; i < n; i++) {
      const x = minx + r() * (maxx - minx), y = miny + r() * (maxy - miny);
      if (!dentro([x, y], p.pol) || reservas.some(([rx, ry, rr]) => (x - rx) ** 2 + (y - ry) ** 2 < rr * rr)) continue;
      pts.push([x, y, p.cem ? 1 : 0]);
    }
  }
  // arbolado en avenidas
  // Mendoza: árboles en todas las calles, también en las de la cuadrícula
  const filas = CALLES.filter(c => c[1] === 'av').map(c => c[2]);
  if (ARBOLES_CALLES) for (const b of BARRIOS) {
    if (!b.o) continue;
    const a = b.ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), L = b.lote, [cx, cy] = b.o;
    const us = b.pol.map(p => { const dx = p[0] - cx, dy = p[1] - cy; return [dx * ca + dy * sa, -dx * sa + dy * ca]; });
    const u0 = Math.min(...us.map(q => q[0])), u1 = Math.max(...us.map(q => q[0])), v0 = Math.min(...us.map(q => q[1])), v1 = Math.max(...us.map(q => q[1]));
    const P = (u, v) => [cx + ca * u - sa * v, cy + sa * u + ca * v];
    for (let k = Math.ceil(u0 / L) * L; k <= u1; k += L) filas.push([P(k, v0), P(k, v1)]);
    for (let k = Math.ceil(v0 / L) * L; k <= v1; k += L) filas.push([P(u0, k), P(u1, k)]);
  }
  for (const ptsC of filas) {
    const t = 'av';
    for (let i = 0; i < ptsC.length - 1; i++) {
      const [ax, ay] = ptsC[i], [bx, by] = ptsC[i + 1], L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
      const off = ARBOLES_CALLES ? 9 : 15, paso = ARBOLES_CALLES ? 26 : 16;
      for (let s = 10; s < L; s += paso) for (const sg of [-1, 1]) {
        const x = ax + (bx - ax) * s / L + nx * sg * off, y = ay + (by - ay) * s / L + ny * sg * off;
        if (ARBOLES_CALLES && !BARRIOS.some(b => dentro([x, y], b.pol))) continue;
        if (costa(x, y) > 6 && rio(x, y)[0] > 40 && !PLAZAS.some(([px, py, w, h]) => Math.abs(x - px) < w / 2 && Math.abs(y - py) < h / 2)) pts.push([x, y, 2]);
      }
    }
  }
  // bosquecillos en colinas sin barrio
  for (let i = 0; i < 2600; i++) {
    const x = LIMITES.x0 + r() * W, y = LIMITES.y0 + r() * H;
    if (costa(x, y) < 40 || BARRIOS.some(b => dentro([x, y], b.pol))) continue;
    if (reservas.some(([rx, ry, rr]) => (x - rx) ** 2 + (y - ry) ** 2 < rr * rr)) continue;
    if (zonaArboles) { if (!zonaArboles(x, y) || r() < 0.55) continue; }
    else if (altura(x, y) < 22 && r() < 0.7) continue;
    pts.push([x, y, 3]);
  }
  const copa = new THREE.IcosahedronGeometry(1, 1); copa.translate(0, 1.1, 0);
  const cipres = new THREE.ConeGeometry(.5, 3, 7); cipres.translate(0, 1.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  const a = pts.filter(p => p[2] !== 1), b = pts.filter(p => p[2] === 1);
  const A = new THREE.InstancedMesh(copa, mat, a.length), Bm = new THREE.InstancedMesh(cipres, mat, b.length);
  const M = new THREE.Matrix4(), c = new THREE.Color();
  a.forEach(([x, y, t], i) => {
    const s = t === 3 ? 6 + r() * 6 : t === 2 ? 3.4 + r() * 1.2 : 4 + r() * 3.5;
    M.makeScale(s, s * (0.9 + r() * .4), s).setPosition(x, altura(x, y) - .5, -y); A.setMatrixAt(i, M);
    c.setHSL(0.24 + r() * 0.08, 0.38 + r() * 0.2, t === 3 ? 0.26 + r() * .08 : 0.32 + r() * 0.1); A.setColorAt(i, c);
  });
  b.forEach(([x, y], i) => { const s = 3 + r() * 1.5; M.makeScale(s, s * 2.4, s).setPosition(x, altura(x, y), -y); Bm.setMatrixAt(i, M); c.setHSL(.3, .35, .2); Bm.setColorAt(i, c); });
  A.castShadow = Bm.castShadow = true;
  const g = new THREE.Group(); g.add(A, Bm); return g;
}

/* ------------------------------------------------------------------ */
/* Puentes del río                                                     */
/* ------------------------------------------------------------------ */
export function crearPuentes() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xcdbfa6, roughness: .9 });
  for (const [, t, pts] of CALLES) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay);
      for (let s = 0; s < L; s += 4) {
        const x = ax + (bx - ax) * s / L, y = ay + (by - ay) * s / L, [d, w] = rio(x, y);
        if (d < 1.5) { // cruce
          const ang = Math.atan2(by - ay, bx - ax), largo = w + 60, ancho = ANCHO[t] + 6;
          const tablero = new THREE.Mesh(new THREE.BoxGeometry(largo, 2.2, ancho), mat);
          tablero.position.set(x, 4.2, -y); tablero.rotation.y = ang; tablero.castShadow = tablero.receiveShadow = true; g.add(tablero);
          for (const k of [-1, 0, 1]) {
            const arco = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 8, 10), mat);
            arco.position.set(x + Math.cos(ang) * k * w * 0.3, 0, -(y + Math.sin(ang) * k * w * 0.3)); g.add(arco);
          }
          s += 200;
        }
      }
    }
  }
  return g;
}

/* ------------------------------------------------------------------ */
/* Campo más allá del mapa, para que no se vea el borde del mundo      */
/* ------------------------------------------------------------------ */
export function crearAfueras() {
  const sh = new THREE.Shape();
  AFUERAS.forEach(([x, y], i) => i ? sh.lineTo(x, -y) : sh.moveTo(x, -y)); sh.closePath();
  if (AFUERAS_HUECO) { // la ciudad está rodeada de campo: agujero donde está el terreno detallado
    const h = new THREE.Path(), e = 40, { x0, x1, y0, y1 } = LIMITES;
    h.moveTo(x0 + e, -(y0 + e)); h.lineTo(x0 + e, -(y1 - e)); h.lineTo(x1 - e, -(y1 - e)); h.lineTo(x1 - e, -(y0 + e)); h.closePath();
    sh.holes.push(h);
  }
  const geo = new THREE.ShapeGeometry(sh); geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: AFUERAS_COLOR, roughness: 1, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat); m.position.y = CIUDAD === 'mendoza' ? 29 : CIUDAD === 'verdegrad' ? 3.2 : 1.2;
  return m;
}
