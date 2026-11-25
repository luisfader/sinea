// Edificios y lugares famosos de Sinea modelados en 3D.
// Cada modelo devuelve { g: THREE.Group, r: radio libre de edificios, anim?(t, noche) }.
import * as THREE from './vendor/three.module.js';
import { altura, rio, distLinea, costa, VIAS, RESERVAS, RUTA_BUS, CANAL_GRANDE } from './mundo.js';
import { ventanas } from './escena.js';

const mats = {};
function M(color, o = {}) {
  const k = color + JSON.stringify(o);
  return mats[k] || (mats[k] = new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o }));
}
function caja(w, h, d, color, x = 0, y = 0, z = 0, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'object' ? color : M(color, o));
  m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m;
}
function cil(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 24, o) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'object' ? color : M(color, o));
  m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m;
}
function esfera(r, color, x = 0, y = 0, z = 0, o, s = [24, 16, 0, Math.PI * 2, 0, Math.PI]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ...s), typeof color === 'object' ? color : M(color, o));
  m.position.set(x, y, z); m.castShadow = true; return m;
}
function luz(color, inten, dist, x, y, z) { const l = new THREE.PointLight(color, inten, dist, 1.6); l.position.set(x, y, z); return l; }
const brillo = (c) => new THREE.MeshBasicMaterial({ color: c });

/* -------------------------- modelos ----------------------------- */
// cruz ortodoxa de ocho puntas: travesaño corto arriba (el titulus), el principal y el inclinado abajo
function cruzOrtodoxa(h, mat) {
  const g = new THREE.Group(), t = h * .07;
  g.add(caja(t, h, t, mat, 0, 0, 0));
  g.add(caja(h * .3, t, t, mat, 0, h * .84, 0));
  g.add(caja(h * .56, t * 1.1, t, mat, 0, h * .66, 0));
  const b = caja(h * .36, t, t, mat, 0, 0, 0); b.position.y = h * .2; b.rotation.z = -.38; g.add(b);
  g.add(esfera(t * .9, mat, 0, h, 0));
  return g;
}

const MODELOS = {
  faro(u) {
    const g = new THREE.Group();
    // muelle desde la punta
    const mu = caja(8, 2, 150, 0x9a948a, 0, -1, 0); mu.rotation.y = Math.atan2(-110, -80); mu.position.set(-55, -1, -40); g.add(mu);
    g.add(cil(14, 17, 6, 0x8c8478, 0, -3));
    const blanco = M(0xf5f1ea), rojo = M(0xc9302c);
    const tramos = [[0, 9, 6.2, 5.6, blanco], [9, 6, 5.6, 5.2, rojo], [15, 9, 5.2, 4.7, blanco], [24, 6, 4.7, 4.3, rojo], [30, 8, 4.3, 4.0, blanco]];
    for (const [y, h, rb, rt, m] of tramos) g.add(cil(rt, rb, h, m, 0, y + 3));
    g.add(cil(6, 6, 1, 0x333333, 0, 41));
    g.add(new THREE.Mesh(new THREE.TorusGeometry(5.6, .25, 6, 28), M(0x222222)).translateY(43.2).rotateX(Math.PI / 2));
    const lint = cil(3.4, 3.4, 5, new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffd76a, emissiveIntensity: .6, transparent: true, opacity: .85 }), 0, 42);
    g.add(lint); g.add(esfera(3.8, 0xc9302c, 0, 47, 0, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    // haz giratorio
    const haz = new THREE.Group(); haz.position.y = 44.5;
    const hm = new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(28, 900, 24, 1, true), hm); c.rotation.z = s * Math.PI / 2; c.position.x = s * 450; haz.add(c); }
    g.add(haz);
    const pl = luz(0xffe2a0, 0, 900, 0, 44, 0); g.add(pl);
    return { g, r: 40, anim(t, n) { haz.rotation.y = t * 0.55; hm.opacity = 0.05 + 0.22 * n; lint.material.emissiveIntensity = .6 + 2.6 * n; pl.intensity = 60000 * n; } };
  },
  'torre-tv'() {
    const g = new THREE.Group();
    g.add(caja(46, 14, 30, 0xa5a49f));
    const acero = M(0xd9d9d6, { metalness: .5, roughness: .45 }), rojo = M(0xd23b2a);
    const pat = [[0, 110, 10, 1.3], [110, 40, 4, 0.9]];
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.4, 120, 6), acero);
      p.position.set(Math.cos(a) * 7, 72, Math.sin(a) * 7); p.lookAt(0, 140, 0); p.rotateX(Math.PI / 2); g.add(p);
    }
    for (let y = 26; y < 130; y += 14) g.add(new THREE.Mesh(new THREE.TorusGeometry(12 - y * 0.06, .5, 4, 4), acero).translateY(y).rotateX(Math.PI / 2).rotateZ(Math.PI / 4));
    g.add(cil(7, 7, 8, 0xeeeeee, 0, 100)); g.add(cil(7.4, 7.4, 1.6, rojo, 0, 108));
    g.add(cil(1.2, 1.8, 70, acero, 0, 128));
    for (let y = 140; y < 196; y += 12) g.add(cil(1.5, 1.5, 4, y % 24 ? rojo : M(0xffffff), 0, y));
    const roja = esfera(2.4, brillo(0xff2a1a), 0, 199, 0); g.add(roja);
    const pl = luz(0xff3020, 0, 400, 0, 199, 0); g.add(pl);
    return { g, r: 30, anim(t, n) { const on = (Math.sin(t * 3) > 0.2) ? 1 : 0.15; roja.material.color.setRGB(on, on * .15, on * .08); pl.intensity = 9000 * on * n; } };
  },
  ayuntamiento(u) {
    const g = new THREE.Group();
    const pied = M(0xe8d5ae), teja = M(0xa8513a);
    g.add(caja(96, 20, 38, pied, 0, 0, 0));
    for (let i = -4; i <= 4; i++) g.add(caja(3, 9, 3, 0xd9c49b, i * 10.5, 0, -20));
    const tejado = new THREE.Mesh(prismaGeo(), teja); tejado.scale.set(40, 8, 98); tejado.rotation.y = Math.PI / 2; tejado.position.y = 20; tejado.castShadow = true; g.add(tejado);
    g.add(caja(24, 1.2, 6, 0x6b5b45, 0, 13, -21.5)); // balcón
    g.add(caja(15, 52, 15, pied, 0, 0, 2));
    const esferaM = new THREE.MeshStandardMaterial({ color: 0xfffbea, emissive: 0xfff2c4, emissiveIntensity: .2 });
    const reloj = new THREE.Group(); reloj.position.set(0, 44, 2);
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Mesh(new THREE.CircleGeometry(5, 32), esferaM); const a = i * Math.PI / 2;
      c.position.set(Math.sin(a) * 7.6, 0, Math.cos(a) * 7.6 * -1); c.rotation.y = a + Math.PI; reloj.add(c);
      const ag = new THREE.Mesh(new THREE.BoxGeometry(.5, 4, .2), M(0x222222)); ag.position.copy(c.position).multiplyScalar(1.02); ag.rotation.y = a + Math.PI; ag.name = 'aguja'; reloj.add(ag);
    }
    g.add(reloj);
    g.add(new THREE.Mesh(new THREE.ConeGeometry(11.5, 18, 4), teja).translateY(61).rotateY(Math.PI / 4));
    g.add(cil(.25, .25, 6, 0x333333, 0, 70, 2));
    const banderas = []; for (const s of [-1, 1]) { const b = caja(.3, 12, .3, 0x444444, s * 40, 20, -18); g.add(b); const f = caja(6, 3.5, .2, s < 0 ? 0x2a6fbb : 0xf2c230, s * 40 + 3, 28.5, -18); g.add(f); banderas.push(f); }
    g.rotation.y = 0;
    return { g, r: 60, anim(t, n) { esferaM.emissiveIntensity = .2 + 1.6 * n; reloj.children.filter(o => o.name === 'aguja').forEach(a => a.rotation.z = t * 0.05); banderas.forEach((f, i) => f.rotation.y = Math.sin(t * 2 + i) * .25); } };
  },
  'plaza-dante'() {
    const g = new THREE.Group();
    const marmol = M(0xf4f2ee, { roughness: .5 });
    g.add(cil(13, 14, 1.4, 0xd8cfc0)); g.add(cil(12, 12, .4, new THREE.MeshStandardMaterial({ color: 0x5fb3d6, roughness: .1, metalness: .2 }), 0, 1.2));
    g.add(cil(3, 3.6, 4, marmol, 0, 1)); g.add(cil(1.2, 1.8, 3.6, marmol, 0, 5));
    const fig = new THREE.Group(); fig.position.y = 8.6; fig.scale.setScalar(1.6);
    fig.add(cil(1.1, 1.5, 3.2, marmol, 0, 0)); fig.add(cil(.6, 1.05, 1.6, marmol, 0, 3.2)); fig.add(esfera(.62, marmol, 0, 5.3, 0));
    const bra = caja(.45, 2.2, .45, marmol, .9, 2.4, 0); bra.rotation.z = -.5; fig.add(bra);
    const libro = caja(.9, .2, 1.2, 0xd9cfbf, 1.6, 4.1, 0); fig.add(libro);
    g.add(fig);
    // chorros
    const agua = new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: .55 });
    const chorros = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const c = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, 4, 6), agua); c.position.set(Math.cos(a) * 6, 3, Math.sin(a) * 6); c.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(c); chorros.push(c); }
    // farolas y bancos
    for (const [x, z] of [[-60, -40], [60, -40], [-60, 40], [60, 40], [0, -48], [0, 48], [-70, 0], [70, 0]]) {
      g.add(cil(.2, .3, 6, 0x2c2c2c, x, 0, z)); const f = esfera(.7, new THREE.MeshStandardMaterial({ color: 0xfff1c6, emissive: 0xffd27a, emissiveIntensity: 0 }), x, 6.3, z); f.name = 'farol'; g.add(f);
    }
    return { g, r: 70, anim(t, n) { chorros.forEach((c, i) => c.scale.y = .8 + Math.sin(t * 4 + i) * .2); g.children.forEach(o => { if (o.name === 'farol') o.material.emissiveIntensity = 3 * n; }); } };
  },
  obelisco() {
    const g = new THREE.Group();
    g.add(caja(8, 3, 8, 0x3a3a3f)); const ob = new THREE.Mesh(new THREE.CylinderGeometry(.4, 2.3, 22, 4), M(0x1b1b20, { roughness: .25, metalness: .3 }));
    ob.position.y = 14; ob.rotation.y = Math.PI / 4; ob.castShadow = true; g.add(ob);
    // campanario en la esquina
    const c = new THREE.Group(); c.position.set(34, 0, -30);
    c.add(caja(8, 30, 8, 0xe3d0a8)); c.add(caja(8.4, 6, 8.4, M(0xe3d0a8, { transparent: true, opacity: 1 }), 0, 30)); c.add(new THREE.Mesh(new THREE.ConeGeometry(6.5, 10, 4), M(0xa8513a)).translateY(41).rotateY(Math.PI / 4));
    const camp = esfera(1.6, 0xb68a2c, 0, 32.5, 0); c.add(camp); g.add(c);
    return { g, r: 46, anim(t) { camp.rotation.x = Math.sin(t * 1.3) * .3; } };
  },
  planetario() {
    const g = new THREE.Group();
    g.add(cil(26, 27, 9, 0xe9e2d2)); g.add(cil(23, 23, 2, 0xd8cdb4, 0, 9));
    const cobre = M(0x6fa58a, { metalness: .4, roughness: .45 }); // cobre con pátina
    g.add(esfera(22, cobre, 0, 10, 0, {}, [40, 20, 0, Math.PI * 2, 0, Math.PI / 2]));
    g.add(cil(1.2, 1.2, 4, 0xe9e2d2, 0, 31)); g.add(esfera(1.6, 0xd4af37, 0, 36, 0));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(cil(.9, .9, 9, 0xf2ede2, Math.cos(a) * 27.5, 0, Math.sin(a) * 27.5, 10)); }
    return { g, r: 46 };
  },
  estacion() {
    const g = new THREE.Group();
    g.add(caja(170, 14, 34, 0xdcc9a8));
    const bg = new THREE.CylinderGeometry(20, 20, 160, 24, 1, true, 0, Math.PI); bg.rotateZ(Math.PI / 2);
    const bov = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color: 0x8fb2c4, metalness: .3, roughness: .3, side: THREE.DoubleSide }));
    bov.position.y = 14; bov.castShadow = true; g.add(bov);
    g.add(caja(26, 30, 12, 0xd2bb93, 0, 0, -22));
    const reloj = new THREE.Mesh(new THREE.CircleGeometry(4, 28), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2c4, emissiveIntensity: .1 })); reloj.position.set(0, 24, -28.1); reloj.rotation.y = Math.PI; g.add(reloj);
    for (const z of [26, 40, 54]) g.add(caja(180, 1, 5, 0xbdb6aa, 0, 0, z));
    return { g, r: 95, anim(t, n) { reloj.material.emissiveIntensity = .1 + 1.5 * n; } };
  },
  museo() {
    const g = new THREE.Group(), bl = M(0xf6f4ef, { roughness: .55 });
    g.add(caja(70, 3, 46, 0xe6e2da)); g.add(caja(62, 16, 38, bl, 0, 3, 4));
    for (let i = -3; i <= 3; i++) g.add(cil(1.3, 1.5, 15, bl, i * 8.5, 3, -19));
    const fr = new THREE.Mesh(new THREE.CylinderGeometry(.01, 1, 1, 3), bl); fr.scale.set(36, 8, 4); fr.rotation.set(Math.PI / 2, 0, 0); fr.rotation.z = Math.PI; fr.position.set(0, 21.5, -18);
    const pr = new THREE.Mesh(prismaGeo(), bl); pr.scale.set(62, 8, 8); pr.position.set(0, 18.5, -18); pr.rotation.y = Math.PI / 2; g.add(pr);
    for (let i = 0; i < 5; i++) g.add(caja(40 - i * 4, .8, 3, 0xe6e2da, 0, i * .8, -24 - i * 1.5));
    return { g, r: 45 };
  },
  central(u) {
    const g = new THREE.Group(), lad = M(0x9a5a44, { roughness: .95 });
    const nave = new THREE.Mesh(new THREE.BoxGeometry(90, 26, 44), new THREE.MeshStandardMaterial({ color: 0x9a5a44, roughness: .95 }));
    ventanas(nave.material, u, 0.95); nave.position.y = 13; nave.castShadow = nave.receiveShadow = true; g.add(nave);
    g.add(caja(40, 18, 30, lad, -50, 0, 10));
    for (const x of [-20, 6, 32]) { g.add(cil(3.4, 4.6, 66, 0x8d5440, x, 0, 12, 16)); g.add(cil(3.6, 3.6, 2, 0xe6e0d8, x, 60, 12)); }
    const humo = []; for (let i = 0; i < 6; i++) { const s = esfera(5, new THREE.MeshStandardMaterial({ color: 0xe9e9e9, transparent: true, opacity: .35 }), -20, 70 + i * 8, 12); humo.push(s); g.add(s); }
    return { g, r: 70, anim(t, n) { humo.forEach((s, i) => { const k = (t * .12 + i / 6) % 1; s.position.set(-20 + k * 20, 66 + k * 60, 12); s.scale.setScalar(.6 + k * 2); s.material.opacity = .35 * (1 - k) * (0.4 + n); }); } };
  },
  molino() {
    const g = new THREE.Group();
    g.add(cil(4.5, 7, 16, 0xe9e0cd)); g.add(new THREE.Mesh(new THREE.ConeGeometry(5.4, 6, 16), M(0x6c4b33)).translateY(19));
    const aspas = new THREE.Group(); aspas.position.set(0, 16, -6.2);
    for (let i = 0; i < 4; i++) { const a = caja(2.4, 13, .2, 0xd8cfbb, 0, 0, 0); a.position.set(0, 0, 0); a.geometry.translate(0, 6.5, 0); a.rotation.z = i * Math.PI / 2; aspas.add(a); }
    g.add(aspas);
    return { g, r: 18, anim(t) { aspas.rotation.z = t * .9; } };
  },
  aerogenerador() {
    const g = new THREE.Group();
    g.add(cil(1.1, 2, 62, 0xf3f3f3)); g.add(caja(3, 3, 7, 0xf3f3f3, 0, 61, 1));
    const rot = new THREE.Group(); rot.position.set(0, 62.5, -3);
    for (let i = 0; i < 3; i++) { const p = caja(1.6, 26, .3, 0xffffff); p.geometry.translate(0, 13, 0); p.position.set(0, 0, 0); p.rotation.z = i * Math.PI * 2 / 3; rot.add(p); }
    g.add(rot); return { g, r: 14, anim(t) { rot.rotation.z = t * 1.4; } };
  },
  'torre-agua'(u) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .78; g.add(cil(.6, .6, 26, 0x8a8a8a, Math.cos(a) * 6, 0, Math.sin(a) * 6, 6)); }
    g.add(cil(8, 8, 10, 0xb9b4a8, 0, 26)); g.add(new THREE.Mesh(new THREE.ConeGeometry(8.5, 4, 24), M(0x7d7a73)).translateY(38));
    const neon = luz(0x50a8ff, 0, 160, 0, 41, 0); g.add(neon);
    return { g, r: 16, anim(t, n) { neon.intensity = n * (Math.sin(t * .7) > .6 ? 4000 : 0); } };
  },
  iglesia() {
    const g = new THREE.Group(), p = M(0xefe5d0);
    g.add(caja(16, 14, 36, p)); const t = new THREE.Mesh(prismaGeo(), M(0xa8513a)); t.scale.set(17, 7, 37); t.position.y = 14; g.add(t);
    g.add(caja(8, 30, 8, p, 0, 0, -20)); g.add(new THREE.Mesh(new THREE.ConeGeometry(6, 12, 4), M(0x5c6f78)).translateY(36).translateZ(-20).rotateY(Math.PI / 4));
    const veleta = caja(.2, 1.4, 3, 0x222222, 0, 43, -20); g.add(veleta);
    return { g, r: 30, anim(t) { veleta.rotation.y = 1.2; } };
  },
  rascacielos(u) {
    const g = new THREE.Group();
    const vid = new THREE.MeshStandardMaterial({ color: 0x7fa6c4, metalness: .6, roughness: .2 }); ventanas(vid, u, .7);
    const t = new THREE.Mesh(new THREE.BoxGeometry(32, 150, 32), vid); t.position.y = 75; t.castShadow = true; g.add(t);
    g.add(caja(26, 14, 26, 0x5d7f99, 0, 150)); g.add(cil(.6, .6, 22, 0xcccccc, 0, 164));
    const rest = new THREE.Mesh(new THREE.BoxGeometry(33, 6, 33), new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: 0xffc773, emissiveIntensity: 0 })); rest.position.y = 146; g.add(rest);
    return { g, r: 34, anim(t, n) { rest.material.emissiveIntensity = 1.5 * n; } };
  },
  hotel(u) {
    const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xf7f1e6, roughness: .7 }); ventanas(m, u, .6);
    const b = new THREE.Mesh(new THREE.BoxGeometry(64, 30, 22), m); b.position.y = 15; b.castShadow = b.receiveShadow = true; g.add(b);
    for (let y = 5; y < 30; y += 3.4) g.add(caja(65, .5, 2.2, 0xd8cfbf, 0, y, -11.5));
    g.add(caja(66, 2, 24, 0x2f5d73, 0, 30));
    return { g, r: 36 };
  },
  ministerio() {
    const g = new THREE.Group();
    g.add(caja(110, 34, 70, 0x8d9196)); g.add(caja(90, 6, 50, 0x7b8085, 0, 34));
    for (const [x, z] of [[-55, -35], [55, -35], [-55, 35], [55, 35]]) { const cam = caja(1.2, 1.2, 2.2, 0x111111, x, 31, z); g.add(cam); }
    g.add(caja(16, 10, 2, 0x3b3f44, 0, 0, -35.5));
    return { g, r: 64 };
  },
  puerto() {
    const g = new THREE.Group();
    for (const [x, rot] of [[-120, 0], [140, .4]]) {
      const gr = new THREE.Group(); gr.position.set(x, 0, 70); gr.rotation.y = rot;
      for (const [a, b] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) gr.add(caja(1, 30, 1, 0xd2442e, a, 0, b));
      gr.add(caja(12, 3, 12, 0xd2442e, 0, 30)); const brazo = caja(2, 2, 60, 0xd2442e, 0, 33, 20); gr.add(brazo); g.add(gr);
    }
    const barcos = [];
    const colores = [0xffffff, 0x2a6fbb, 0xe6b33a, 0xc9302c, 0xffffff, 0x2e8a6b];
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Group(); b.position.set(-260 + i * 62, -0.2, 150 + (i % 3) * 22);
      const casco = caja(7, 3, 20, colores[i % 6]); b.add(casco); b.add(caja(5, 3, 7, 0xffffff, 0, 3, 2)); if (i % 2) b.add(cil(.15, .15, 14, 0xdddddd, 0, 3, -3, 6));
      b.rotation.y = (i % 2 ? .1 : -.08); g.add(b); barcos.push(b);
    }
    return { g, r: 0, anim(t) { barcos.forEach((b, i) => { b.position.y = Math.sin(t * 1.3 + i) * .35 - .2; b.rotation.z = Math.sin(t + i) * .03; }); } };
  },
  atracciones() {
    const g = new THREE.Group();
    const rueda = new THREE.Group(); rueda.position.set(0, 30, 0);
    rueda.add(new THREE.Mesh(new THREE.TorusGeometry(24, .7, 6, 48), M(0xf0f0f0)));
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const r = caja(.4, 24, .4, 0xdddddd); r.geometry.translate(0, -12, 0); r.position.set(0, 0, 0); r.rotation.z = a; rueda.add(r);
      const c = caja(2.6, 2.6, 2.6, [0xe94e4e, 0x4ea5e9, 0xf2c230, 0x5fc27a][i % 4]); c.position.set(Math.cos(a) * 24, Math.sin(a) * 24 - 1.3, 0); c.name = 'cab'; rueda.add(c); }
    g.add(rueda); for (const s of [-1, 1]) { const p = caja(1.2, 32, 1.2, 0xcccccc, 0, 0, s * 3); p.rotation.x = s * .12; g.add(p); }
    const luces = new THREE.Mesh(new THREE.TorusGeometry(24.8, .35, 4, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })); rueda.add(luces);
    return { g, r: 30, anim(t, n) { rueda.rotation.z = t * .05; rueda.children.forEach(c => { if (c.name === 'cab') c.rotation.z = -rueda.rotation.z; }); luces.material.color.setHSL((t * .05) % 1, .9, .55 * n); } };
  },
  delfinario() {
    const g = new THREE.Group();
    g.add(cil(30, 30, 1.5, 0xdedad0)); g.add(cil(26, 26, .3, new THREE.MeshStandardMaterial({ color: 0x2fa6c9, roughness: .1 }), 0, 1.5));
    for (let i = 0; i < 6; i++) { const a = Math.PI * (.15 + i * .14); g.add(caja(10, 3 + i % 3, 5, 0x3b78a8, Math.cos(a) * 36, 0, Math.sin(a) * 36)); }
    return { g, r: 44 };
  },
  muelle() {
    const g = new THREE.Group(), mad = M(0x5b4a3b, { roughness: 1 });
    for (let i = 0; i < 14; i++) { if (i === 9 || i === 11) continue; g.add(caja(10, 1, 9, mad, 0, 1.8, 60 + i * 9)); g.add(cil(.5, .5, 5, mad, -4, -3, 60 + i * 9)); g.add(cil(.5, .5, 5, mad, 4, -3, 60 + i * 9)); }
    g.add(cil(.15, .2, 6, 0x333333, 0, 2, 40));
    return { g, r: 10 };
  },
  laberinto() {
    const g = new THREE.Group();
    const vidrio = new THREE.MeshStandardMaterial({ color: 0x5ab8ff, transparent: true, opacity: .45, metalness: .2, roughness: .1, emissive: 0x2a6fff, emissiveIntensity: .15 });
    const r = (s => () => ((s = (s * 16807) % 2147483647) / 2147483647))(11);
    for (let k = 1; k <= 5; k++) {
      const R = k * 18, n = 26 + k * 6;
      for (let i = 0; i < n; i++) { if (r() < .18) continue; const a = i / n * Math.PI * 2; const w = new THREE.Mesh(new THREE.BoxGeometry(2 * Math.PI * R / n, 5, .6), vidrio); w.position.set(Math.cos(a) * R, 2.5, Math.sin(a) * R); w.rotation.y = -a + Math.PI / 2; g.add(w); }
      for (let i = 0; i < 4; i++) { const a = r() * Math.PI * 2; const w = new THREE.Mesh(new THREE.BoxGeometry(.6, 5, 18), vidrio); w.position.set(Math.cos(a) * (R + 9), 2.5, Math.sin(a) * (R + 9)); w.rotation.y = -a; g.add(w); }
    }
    const luna = esfera(9, new THREE.MeshStandardMaterial({ color: 0xfaf6e0, emissive: 0xfff3c0, emissiveIntensity: .35 }), 0, 46, 0); g.add(luna);
    for (const s of [-1, 1]) g.add(cil(.4, .4, 38, 0x777777, s * 8, 0, 0, 6));
    return { g, r: 110, anim(t, n) { luna.material.emissiveIntensity = .35 + 1.8 * n; vidrio.emissiveIntensity = .15 + .6 * n; luna.position.y = 46 + Math.sin(t * .5) * 1.5; } };
  },
  brecha() {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: 0x1a0d2b, transparent: true, opacity: .55, depthWrite: false });
    const disco = new THREE.Mesh(new THREE.RingGeometry(4, 60, 64, 1, 0, Math.PI * 2), m); disco.rotation.x = -Math.PI / 2; disco.position.y = 0.6; g.add(disco);
    const esp = new THREE.Mesh(new THREE.TorusGeometry(30, 1.2, 6, 64, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: 0x8a5cff, transparent: true, opacity: .5 })); esp.rotation.x = -Math.PI / 2; esp.position.y = 0.8; g.add(esp);
    return { g, r: 0, anim(t, n) { esp.rotation.z = t * .4; esp.material.opacity = .25 + .35 * n; } };
  },
  'casa-amarilla'() { const g = new THREE.Group(); g.add(caja(12, 8, 10, 0xf2cf4a)); const t = new THREE.Mesh(prismaGeo(), M(0xb2553a)); t.scale.set(13, 4, 11); t.position.y = 8; g.add(t); g.add(caja(2, 3, .3, 0x4f7c4f, 0, 0, -5.2)); return { g, r: 14 }; },
  taller() { const g = new THREE.Group(); g.add(caja(16, 9, 12, 0xe0c9a2)); const t = new THREE.Mesh(prismaGeo(), M(0xa8513a)); t.scale.set(17, 5, 13); t.position.y = 9; g.add(t); for (const x of [-5, 0, 5]) g.add(caja(2.4, 2.4, .3, 0x2f8a45, x, 4, -6.2)); g.add(caja(3, 5, .3, 0x6b4a2f, 0, 0, -6.2)); return { g, r: 14 }; },
  cafe() { const g = new THREE.Group(); g.add(caja(10, 4, 1.5, 0xc94b5c, 0, 3.2, -6)); for (const x of [-3, 0, 3]) { g.add(cil(.8, .8, .1, 0xffffff, x, 1, -9)); g.add(cil(.08, .08, 1, 0x333333, x, 0, -9, 6)); } return { g, r: 8 }; },
  mercado() { const g = new THREE.Group(); g.add(caja(50, 8, 30, 0xd9c7a2)); const t = new THREE.Mesh(prismaGeo(), M(0x9c7c5a)); t.scale.set(52, 8, 32); t.position.y = 8; g.add(t); return { g, r: 32 }; },
  galpon() { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { g.add(caja(26, 9, 60, 0xb8b0a1, i * 30 - 30)); const tg = new THREE.CylinderGeometry(13, 13, 60, 16, 1, false, 0, Math.PI); tg.rotateZ(Math.PI / 2); tg.rotateY(Math.PI / 2); const t = new THREE.Mesh(tg, M(0x8c8c88)); t.position.set(i * 30 - 30, 9, 0); t.castShadow = true; g.add(t); } return { g, r: 56 }; },
  villa() {
    const g = new THREE.Group(); g.add(caja(30, 10, 18, 0xf8f4ec)); g.add(caja(34, 1, 22, 0xd9cfbf, 0, 10));
    const inv = new THREE.Mesh(new THREE.BoxGeometry(50, 9, 14), new THREE.MeshStandardMaterial({ color: 0xbfe6d6, transparent: true, opacity: .5, metalness: .3, roughness: .1 })); inv.position.set(-260, altura(-1710, -1520) - altura(-1450, -1050) + 4.5, 470); g.add(inv);
    g.add(esfera(7, new THREE.MeshStandardMaterial({ color: 0xbfe6d6, transparent: true, opacity: .5 }), -260, altura(-1710, -1520) - altura(-1450, -1050) + 9, 470, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    g.add(cil(9, 9, .3, new THREE.MeshStandardMaterial({ color: 0x46b3d9 }), 30, 0, 10));
    return { g, r: 30 };
  },
  tunel() { const g = new THREE.Group(); const arco = new THREE.Mesh(new THREE.TorusGeometry(9, 2.5, 8, 16, Math.PI), M(0x9c958a)); arco.position.set(240, 0, 0); arco.rotation.y = Math.PI / 2; arco.position.y = altura(-2010, 150) - altura(-2250, 150); g.add(arco); return { g, r: 0 }; },
  atalaya() { const g = new THREE.Group(), p = M(0xb7a98e, { roughness: 1 }); g.add(caja(10, 22, 10, p)); for (let i = -1; i <= 1; i++) for (const s of [-1, 1]) g.add(caja(2, 2, 2, p, i * 4, 22, s * 4)); g.add(caja(60, 8, 4, p, -35, 0, 0)); g.add(caja(4, 8, 50, p, 0, 0, 30)); return { g, r: 20 }; },
  biblioteca(u) { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xe8ddc7 }); ventanas(m, u, .9); const b = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 20), m); b.position.y = 7; b.castShadow = true; g.add(b); g.add(esfera(8, M(0x55707c, { metalness: .3 }), 0, 14, 0, {}, [24, 12, 0, Math.PI * 2, 0, Math.PI / 2])); return { g, r: 20 }; },
  observatorio() { const g = new THREE.Group(); g.add(cil(6, 6.5, 14, 0xe6ddc8)); g.add(esfera(6, M(0xc9cfd2, { metalness: .5 }), 0, 14, 0, {}, [20, 10, 0, Math.PI * 2, 0, Math.PI / 2])); return { g, r: 12 }; },
  puertas() { const g = new THREE.Group(), p = M(0x8f8a80); g.add(caja(2, 9, 2, p, -6)); g.add(caja(2, 9, 2, p, 6)); g.add(caja(14, 2, 2, p, 0, 9)); g.add(caja(.4, 1, 10, 0x222222, -3, 0, 0)); return { g, r: 10 }; },
  redondo(u) { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xf2f2ee }); const c = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 30, 40), m); c.position.y = 15; c.castShadow = true; g.add(c); const vm = new THREE.MeshStandardMaterial({ color: 0x31475a, emissive: 0xffd28a, emissiveIntensity: 0 }); for (let k = 0; k < 3; k++) for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const o = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), vm); o.position.set(Math.cos(a) * 22.05, 7 + k * 8, Math.sin(a) * 22.05); o.lookAt(Math.cos(a) * 40, 7 + k * 8, Math.sin(a) * 40); g.add(o); } return { g, r: 28, anim(t, n) { vm.emissiveIntensity = n * 1.2; } }; },
  monobloc() { // monobloc de barrio: bloque de tres pisos con balcones, escalera y un patio con árboles
    const g = new THREE.Group(), pared = M(0xece4d6), vid = M(0x9cc9e6), bal = M(0x8a8f96);
    g.add(caja(40, .4, 26, 0xb9c49a));
    g.add(caja(30, 12, 11, pared, 0, 0, -3)); g.add(caja(31, .8, 12, 0xb6aea2, 0, 12, -3));
    for (let p = 0; p < 3; p++) for (let i = 0; i < 6; i++) {
      const x = -12.5 + i * 5; g.add(caja(2.4, 2, .3, vid, x, 1.2 + p * 3.8, 2.6));
      if (p > 0) g.add(caja(3.6, .3, 1.4, bal, x, .9 + p * 3.8, 3.2));
    }
    g.add(caja(4, 12.6, 3, 0xd8cfc0, 0, 0, 3.6)); g.add(caja(2, 2.6, .3, 0x5a3a28, 0, 0, 5.2)); // escalera
    g.add(caja(1.2, 2, 1.2, 0x1a5fa8, 11, 12.8, -3)); // tanque de agua
    for (const [x, z] of [[-16, 9], [16, 9], [-8, 11]]) { g.add(cil(.4, .5, 3, 0x6b4a2f, x, 0, z, 6)); g.add(esfera(2.2, 0x6c9a4c, x, 4.4, z)); }
    return { g, r: 22 };
  },
  hogar() {
    const g = new THREE.Group();
    g.add(caja(14, 11, 11, 0xf3c98b)); const t = new THREE.Mesh(prismaGeo(), M(0xb5482f)); t.scale.set(15, 5.5, 12); t.position.y = 11; t.castShadow = true; g.add(t);
    g.add(caja(1.6, 4, 1.6, 0x8a3b28, 4, 12, 2)); g.add(caja(2.4, 3.6, .3, 0x2f6b4a, 0, 0, -5.6));
    for (const x of [-4.5, 4.5]) { g.add(caja(2.2, 2, .3, 0x9cc9e6, x, 6.5, -5.6)); g.add(caja(2.2, 2, .3, 0x9cc9e6, x, 2, -5.6)); }
    g.add(caja(4, .4, 1.4, 0x6b4a2f, 0, 6, -6.2)); // balcón
    return { g, r: 15 };
  },
  carrito() {
    const g = new THREE.Group();
    g.add(caja(3.2, 1.6, 1.8, 0x7ec8e8, 0, .7)); g.add(caja(3.3, .2, 1.9, 0xffffff, 0, 2.3));
    for (const x of [-1.2, 1.2]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.45, .12, 6, 14), M(0x333333)); r.position.set(x, .45, -.95); g.add(r); }
    g.add(cil(.06, .06, 2.6, 0xdddddd, 0, 2.4));
    const somb = new THREE.Group(); somb.position.y = 5;
    for (let i = 0; i < 8; i++) { const seg = new THREE.Mesh(new THREE.ConeGeometry(2.4, .9, 3, 1, true, i * Math.PI / 4, Math.PI / 4), M(i % 2 ? 0xffffff : 0xe8453c, { side: THREE.DoubleSide })); somb.add(seg); }
    g.add(somb); g.scale.setScalar(1.6);
    return { g, r: 0, anim(t) { somb.rotation.y = Math.sin(t * .8) * .05; } };
  },
  campanario() {
    const g = new THREE.Group(), p = M(0xe9dcc0);
    g.add(caja(9, 26, 9, p)); g.add(caja(10, 1, 10, 0xcbb894, 0, 26));
    for (const [x, z] of [[-3.6, -3.6], [3.6, -3.6], [-3.6, 3.6], [3.6, 3.6]]) g.add(caja(1.6, 6, 1.6, p, x, 27, z));
    const camp = esfera(1.8, 0xb68a2c, 0, 30.5, 0); g.add(camp);
    g.add(new THREE.Mesh(new THREE.ConeGeometry(7.4, 9, 4), M(0x4f7a8a, { metalness: .3 })).translateY(37.5).rotateY(Math.PI / 4));
    g.add(cil(.12, .12, 4, 0x333333, 0, 42));
    const pal = []; for (let i = 0; i < 9; i++) { const b = caja(.6, .3, .9, 0x9a9a9a, 0, 0, 0); g.add(b); pal.push(b); }
    return { g, r: 12, anim(t) { camp.rotation.x = Math.sin(t * 1.1) * .25; pal.forEach((b, i) => { const a = t * .4 + i * .7; b.position.set(Math.cos(a) * (10 + i), 34 + Math.sin(a * 2) * 3, Math.sin(a) * (10 + i)); b.rotation.y = -a; }); } };
  },
  fortaleza() {
    const g = new THREE.Group();
    const val = new THREE.Mesh(new THREE.TorusGeometry(105, 9, 8, 48), M(0x7fa25a, { roughness: 1 })); val.rotation.x = Math.PI / 2; val.scale.z = .5; val.position.y = 1; val.receiveShadow = true; g.add(val);
    const val2 = new THREE.Mesh(new THREE.TorusGeometry(70, 6, 8, 40), M(0x86a862, { roughness: 1 })); val2.rotation.x = Math.PI / 2; val2.scale.z = .5; g.add(val2);
    // la empalizada y las torres que despiertan en la penumbra
    const fm = new THREE.MeshStandardMaterial({ color: 0xc9a46a, emissive: 0xffc86b, emissiveIntensity: 0, transparent: true, opacity: .16, depthWrite: false });
    const n = 64;
    for (let i = 0; i < n; i++) { if (i === 12 || i === 13) continue; const a = i / n * Math.PI * 2; const tr = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.1, 11, 6), fm); tr.position.set(Math.cos(a) * 105, 9.5, Math.sin(a) * 105); g.add(tr); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .2; const to = new THREE.Group(); to.position.set(Math.cos(a) * 105, 4, Math.sin(a) * 105);
      to.add(new THREE.Mesh(new THREE.BoxGeometry(8, 20, 8), fm).translateY(10)); to.add(new THREE.Mesh(new THREE.ConeGeometry(7, 7, 4), fm).translateY(23.5).rotateY(Math.PI / 4)); g.add(to); }
    const puerta = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 4), fm); puerta.position.set(Math.cos(12.5 / n * Math.PI * 2) * 105, 8, Math.sin(12.5 / n * Math.PI * 2) * 105); puerta.rotation.y = -12.5 / n * Math.PI * 2; g.add(puerta);
    const luzF = luz(0xffc070, 0, 500, 0, 30, 0); g.add(luzF);
    return { g, r: 125, anim(t, n2) { fm.opacity = .16 + .5 * n2 * (0.85 + .15 * Math.sin(t * 1.5)); fm.emissiveIntensity = 1.3 * n2; luzF.intensity = 5000 * n2; } };
  },
  'puertas-oeste'() {
    const g = new THREE.Group(), p = M(0xb2a68e, { roughness: 1 }), hiedra = M(0x4f7d3a, { roughness: 1 });
    for (const z of [-7, 7]) { g.add(cil(3.2, 3.6, 13, p, 0, 0, z, 10)); g.add(new THREE.Mesh(new THREE.ConeGeometry(3.6, 4, 10), p).translateY(15).translateZ(z));
      for (let i = 0; i < 9; i++) g.add(esfera(1.3 + (i % 3) * .4, hiedra, Math.sin(i * 2.3) * 2.8, 2 + i * 1.2, z + Math.cos(i * 1.7) * 2.6)); }
    const arco = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1.3, 6, 16, Math.PI), p); arco.rotation.y = Math.PI / 2; arco.position.y = 9; g.add(arco);
    return { g, r: 14 };
  },
  'estacion-chica'() {
    const g = new THREE.Group(), b = M(0xf7f3ea);
    g.add(caja(34, 8, 14, b)); const t = new THREE.Mesh(prismaGeo(), M(0x8a5a44)); t.scale.set(15, 4, 35); t.rotation.y = Math.PI / 2; t.position.y = 8; g.add(t);
    for (let i = -2; i <= 2; i++) g.add(cil(.6, .7, 7, b, i * 4, 0, -7.6, 10));
    g.add(caja(36, .6, 4, 0xe6e0d4, 0, 7, -8.8));
    const rel = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2c4, emissiveIntensity: .1 })); rel.position.set(0, 10, -9.2); rel.rotation.y = Math.PI; g.add(rel);
    for (const z of [-22, -40]) g.add(caja(120, .8, 5, 0xc9c2b4, 0, 0, z));
    // pasarela sobre las vías
    g.add(caja(3, 1, 30, 0x9aa3ad, 40, 7, -30)); for (const z of [-16, -44]) g.add(caja(3, 8, 3, 0x9aa3ad, 40, 0, z));
    return { g, r: 40, anim(t, n) { rel.material.emissiveIntensity = .1 + 1.5 * n; } };
  },
  glorieta() {
    const g = new THREE.Group(), bl = M(0xffffff);
    g.add(cil(7, 7.5, 1.2, 0xd9cfbf)); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(cil(.25, .25, 5, bl, Math.cos(a) * 6.3, 1.2, Math.sin(a) * 6.3, 8)); }
    g.add(new THREE.Mesh(new THREE.ConeGeometry(8, 3.5, 8), M(0x5d8a6b)).translateY(8));
    const notas = []; for (let i = 0; i < 4; i++) { const nt = esfera(.5, new THREE.MeshBasicMaterial({ color: 0xffd76a }), 0, 0, 0); nt.visible = false; g.add(nt); notas.push(nt); }
    return { g, r: 10, anim(t, n) { notas.forEach((nt, i) => { const k = (t * .3 + i / 4) % 1; nt.visible = true; nt.position.set(Math.sin(k * 6 + i) * 3, 4 + k * 14, Math.cos(k * 5 + i) * 3); nt.scale.setScalar(1 - k * .7); }); } };
  },
  panaderia() {
    const g = new THREE.Group();
    g.add(caja(12, 7, 10, 0xf0d9b5)); const t = new THREE.Mesh(prismaGeo(), M(0xa8513a)); t.scale.set(13, 4, 11); t.position.y = 7; g.add(t);
    g.add(caja(1.6, 4, 1.6, 0x8a3b28, 3.5, 8, 2));
    const vent = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, .3), new THREE.MeshStandardMaterial({ color: 0xffe2a0, emissive: 0xffc35a, emissiveIntensity: .3 })); vent.position.set(0, 2.5, -5.1); g.add(vent);
    const humo = []; for (let i = 0; i < 5; i++) { const h = esfera(1.2, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .4 }), 3.5, 13, 2); humo.push(h); g.add(h); }
    return { g, r: 10, anim(t, n) { vent.material.emissiveIntensity = .3 + 1.6 * n; humo.forEach((h, i) => { const k = (t * .18 + i / 5) % 1; h.position.set(3.5 + k * 4, 12.5 + k * 16, 2 - k * 2); h.scale.setScalar(.6 + k * 2.2); h.material.opacity = .4 * (1 - k); }); } };
  },
  cocheras() {
    const g = new THREE.Group();
    g.add(caja(30, 7, 18, 0xbdb6a6)); const tg = new THREE.CylinderGeometry(9, 9, 30, 14, 1, false, 0, Math.PI); tg.rotateZ(Math.PI / 2); const tt = new THREE.Mesh(tg, M(0x8c8c88)); tt.position.y = 7; tt.scale.y = .45; g.add(tt);
    return { g, r: 22 };
  },
  fuente() {
    const g = new THREE.Group();
    g.add(cil(5, 5.5, 1.1, 0xd8cfc0)); g.add(cil(4.6, 4.6, .3, new THREE.MeshStandardMaterial({ color: 0x5fb3d6, roughness: .1 }), 0, .9));
    g.add(cil(.7, 1, 3, 0xd8cfc0, 0, 1)); g.add(cil(2, 1.2, .6, 0xd8cfc0, 0, 3.6));
    const ch = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: .45 })); ch.position.y = 5; ch.rotation.x = Math.PI; g.add(ch);
    return { g, r: 0, anim(t) { ch.scale.y = .9 + Math.sin(t * 5) * .1; } };
  },
  hotelito(u) {
    const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xf2e6cf }); ventanas(m, u, .6);
    const b = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 14), m); b.position.y = 6; b.castShadow = true; g.add(b);
    const t = new THREE.Mesh(prismaGeo(), M(0x9c4a33)); t.scale.set(31, 5, 15); t.rotation.y = Math.PI / 2; t.scale.set(15, 5, 31); t.position.y = 12; g.add(t);
    return { g, r: 20 };
  },
  'utopia-fortaleza'() {
    const g = new THREE.Group();
    const turq = M(0x3fb3a5, { roughness: .6 }), turqO = M(0x2c8c82, { roughness: .6 }), orn = M(0xe8d9a8, { metalness: .3, roughness: .4 });
    const pent = (r, a0 = 90) => [0, 1, 2, 3, 4].map(i => { const a = (a0 + i * 72) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; });
    const muro = (A, B, alto, grosor, mat, hueco) => {
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      const tramo = (k0, k1) => { const l = (k1 - k0) * L, cx = A[0] + dx * (k0 + k1) / 2, cy = A[1] + dy * (k0 + k1) / 2;
        const w = new THREE.Mesh(new THREE.BoxGeometry(l, alto, grosor), mat); w.position.set(cx, alto / 2, -cy); w.rotation.y = ang; w.castShadow = w.receiveShadow = true; g.add(w);
        for (let s2 = 2; s2 < l - 1; s2 += 4) { const c = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, grosor + .2), mat); const k = k0 + (s2 / L); c.position.set(A[0] + dx * k, alto + .8, -(A[1] + dy * k)); c.rotation.y = ang; g.add(c); } };
      if (hueco) { tramo(0, .42); tramo(.58, 1); } else tramo(0, 1);
    };
    const torre = (x, y, r, alto, mat, techo = true) => {
      const t = new THREE.Group(); t.position.set(x, 0, -y);
      t.add(cil(r, r * 1.08, alto, mat)); t.add(new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, .35, 6, 24), orn).translateY(alto * .55).rotateX(Math.PI / 2));
      t.add(new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, .35, 6, 24), orn).translateY(alto * .85).rotateX(Math.PI / 2));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const v = caja(.6, 2.6, .3, 0x1d2b2a, Math.cos(a) * r * 1.01, alto * .62, Math.sin(a) * r * 1.01); v.rotation.y = -a + Math.PI / 2; t.add(v); }
      t.add(cil(r * 1.18, r * 1.18, 1.2, mat, 0, alto));
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; t.add(caja(1.1, 1.4, 1.1, mat, Math.cos(a) * r * 1.1, alto + 1.2, Math.sin(a) * r * 1.1)); }
      if (techo) t.add(new THREE.Mesh(new THREE.ConeGeometry(r * 1.05, r * 1.5, 16), M(0x2a6f68)).translateY(alto + 2.6 + r * .75));
      g.add(t); return t;
    };
    const E = pent(190), I = pent(120);
    for (let i = 0; i < 5; i++) {
      muro(E[i], E[(i + 1) % 5], 12, 4.5, turq, i === 4); // el lado 4 (entre los vértices de 18° y 90°… ) lleva la puerta
      muro(I[i], I[(i + 1) % 5], 9, 3.5, turq, i === 4);
      torre(E[i][0], E[i][1], 6.5, 22, turqO); torre(I[i][0], I[i][1], 4.2, 15, turqO);
    }
    // torre sur (la de Martin), a mitad del lado sur del anillo exterior
    const S = [(E[2][0] + E[3][0]) / 2, (E[2][1] + E[3][1]) / 2]; torre(S[0], S[1], 5.5, 20, turqO);
    // puerta: a mitad del lado entre E[4] (18°) y E[0] (90°)… se coloca en el lado este (342°)
    const P = [Math.cos(-18 * Math.PI / 180) * 154, Math.sin(-18 * Math.PI / 180) * 154];
    const pu = new THREE.Group(); pu.position.set(P[0], 0, -P[1]); pu.rotation.y = 18 * Math.PI / 180;
    for (const z of [-7, 7]) { const t = cil(4.5, 4.8, 18, turqO, 0, 0, z, 16); pu.add(t); pu.add(new THREE.Mesh(new THREE.ConeGeometry(5, 6, 16), M(0x2a6f68)).translateY(21).translateZ(z)); }
    pu.add(caja(4.5, 4, 10, turq, 0, 11, 0)); pu.add(caja(1, 8, 9, M(0x6b4a2f), 1.5, 0, 0));
    g.add(pu);
    // torre principal: más alta y esbelta, con el mirador arriba
    const tp = torre(0, 10, 7, 58, turq, false);
    tp.add(cil(10, 10, 1.4, M(0xd9e6e3), 0, 58)); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; tp.add(cil(.15, .15, 2.2, 0x333333, Math.cos(a) * 9.6, 59.4, Math.sin(a) * 9.6, 4)); }
    tp.add(cil(4, 6, 6, turqO, 0, 59.4)); tp.add(new THREE.Mesh(new THREE.ConeGeometry(4.8, 8, 16), M(0x2a6f68)).translateY(69.4));
    tp.add(cil(.15, .15, 9, 0xdddddd, 0, 73, 0, 6));
    const bandera = caja(5, 3, .2, 0x3fd0c0, 2.5, 79, 0); tp.add(bandera);
    const faroles = []; for (const [x, y] of [...E, ...I, S, [0, 10]]) { const f = esfera(.9, new THREE.MeshStandardMaterial({ color: 0xfff1c6, emissive: 0xffd27a, emissiveIntensity: 0 }), x, (x === 0 && y === 10) ? 61 : 24, -y); g.add(f); faroles.push(f); }
    return { g, r: 0, anim(t, n) { bandera.rotation.y = Math.sin(t * 2) * .3; faroles.forEach(f => f.material.emissiveIntensity = 3 * n); } };
  },
  'muro-cantor'() {
    // «La pared de Luis»: una caracola de acero delante del muro sur, abierta hacia el este, con cientos de placas
    const g = new THREE.Group(), placas = [];
    const acero = M(0x6d7377, { metalness: .6, roughness: .5 });
    const cols = [0xffd36b, 0xff6b5b, 0xf8b4c8, 0x3fd0c0, 0x9b8cff, 0xffa64d, 0x8fe388];
    for (let i = 0; i <= 36; i++) {
      const k = i / 36, a = Math.PI * .52 + k * Math.PI * .96, R = 50 - Math.abs(k - .5) * 16; // curva abierta hacia el este
      const x = Math.cos(a) * R + 26, z = Math.sin(a) * R * .5;
      const alto = 10 + Math.sin(k * Math.PI) * 9;
      const pos = new THREE.Mesh(new THREE.BoxGeometry(.6, alto, .6), acero); pos.position.set(x, alto / 2, z); g.add(pos);
      for (let j = 0; j < Math.floor(alto / 2.2); j++) {
        const pm = new THREE.MeshStandardMaterial({ color: [0xb08d57, 0xc9a26b, 0x9e9e9e, 0xd4af37][(i + j) % 4], metalness: .7, roughness: .35, emissive: cols[(i * 7 + j * 3) % cols.length], emissiveIntensity: 0 });
        const p = new THREE.Mesh(j % 3 ? new THREE.BoxGeometry(2.6, 1.8, .2) : new THREE.CylinderGeometry(1, 1, .2, 12), pm);
        if (!(j % 3)) p.rotation.x = Math.PI / 2;
        p.position.set(x + Math.cos(a + Math.PI) * .6, 1.4 + j * 2.2, z + Math.sin(a + Math.PI) * .3); p.rotation.y = -a + Math.PI / 2; g.add(p); placas.push(p);
      }
    }
    return { g, r: 0, anim(t, n) { placas.forEach((p, i) => { p.material.emissiveIntensity = (.12 + .9 * n) * (0.55 + 0.45 * Math.sin(t * 1.7 + i * .37)); }); } };
  },
  bunker() {
    const g = new THREE.Group(), hor = M(0x8d8a80, { roughness: 1 });
    const loma = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd6bf8e, { roughness: 1 })); loma.scale.y = .4; g.add(loma);
    g.add(caja(6, 4.5, 3, hor, 0, 0, -12)); g.add(caja(3, 3.4, .3, M(0x7a4a2a, { metalness: .4 }), .4, 0, -13.6));
    g.add(cil(.5, .5, 4, 0x555555, 4, 4, -2, 8));
    const coche = new THREE.Group(); coche.position.set(-10, 0, -18); coche.rotation.y = .4; coche.rotation.z = .08;
    coche.add(caja(4, 1.4, 2, 0xbfc6cc, 0, .4)); coche.add(caja(2.4, 1, 1.9, 0x9fb3bf, -.2, 1.8)); g.add(coche); // el Peugeot hundido en la arena
    return { g, r: 0 };
  },
  tumba() {
    const g = new THREE.Group();
    const fosa = new THREE.Mesh(new THREE.BoxGeometry(2.4, .3, 5), new THREE.MeshStandardMaterial({ color: 0x3b2f22 })); fosa.position.y = .1; g.add(fosa);
    const tierra = new THREE.Mesh(new THREE.SphereGeometry(2.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xc9ad7c)); tierra.position.set(3.2, 0, 0); tierra.scale.set(1, .45, 1.6); g.add(tierra);
    const cruz = new THREE.Group(); cruz.position.set(0, 0, -3.4); cruz.add(caja(.35, 3, .35, 0x6b4a2f)); cruz.add(caja(1.8, .3, .35, 0x6b4a2f, 0, 2)); cruz.rotation.z = .25; g.add(cruz);
    return { g, r: 0 };
  },
  'boca-tunel'() {
    const g = new THREE.Group(), p = M(0x8e8678, { roughness: 1 });
    const arco = new THREE.Mesh(new THREE.TorusGeometry(6, 1.8, 8, 16, Math.PI), p); arco.position.y = 0; g.add(arco);
    const negro = new THREE.Mesh(new THREE.CircleGeometry(5.2, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0b0b0b })); negro.position.z = -.3; g.add(negro);
    g.rotation.y = -Math.PI / 2;
    return { g, r: 0 };
  },
  tanques() {
    const g = new THREE.Group(), oxido = M(0x6b4a33, { metalness: .5, roughness: .8 });
    for (let k = 0; k < 3; k++) {
      const t = new THREE.Group(); t.position.set(k * 26 - 26, 0, k % 2 ? 14 : -8); t.rotation.set(0, k * 1.3, k === 1 ? .35 : 0);
      t.add(caja(9, 3, 6, oxido, 0, 2)); t.add(cil(1.8, 2.2, 1.6, oxido, 0, 5)); t.add(cil(.35, .35, 7, oxido, 3.5, 5.6).rotateZ(Math.PI / 2));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const pata = caja(.6, 5, .6, oxido, Math.cos(a) * 5.5, 0, Math.sin(a) * 4); pata.rotation.z = Math.cos(a) * .7; pata.rotation.x = -Math.sin(a) * .7; t.add(pata); }
      g.add(t);
    }
    return { g, r: 0 };
  },
  cementerio() {
    const g = new THREE.Group(), p = M(0xbdb7aa);
    for (let i = 0; i < 28; i++) { const x = (i % 7) * 7 - 21, z = Math.floor(i / 7) * 8 - 12; const c = new THREE.Group(); c.position.set(x + Math.sin(i) * 1.2, 0, z); c.add(caja(.4, 2.4, .4, p)); c.add(caja(1.4, .35, .4, p, 0, 1.6)); g.add(c); }
    for (const [x, z] of [[-28, -18], [28, -18], [-28, 20], [28, 20]]) g.add(caja(1, 1.6, 1, p, x, 0, z));
    return { g, r: 0 };
  },
  acacia() {
    const g = new THREE.Group();
    g.add(cil(.9, 1.3, 7, 0x6b4a2f)); const copa = M(0x7a9e4e, { roughness: 1, flatShading: true });
    for (const [x, y, z, r] of [[0, 9, 0, 6], [3.5, 8, 2, 4], [-3.5, 8.5, -1.5, 4.5], [1, 10.5, -3, 4]]) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), copa); c.position.set(x, y, z); c.scale.y = .55; c.castShadow = true; g.add(c); }
    const pied = M(0xd8d2c6, { roughness: .6 });
    g.add(caja(2.4, 1.6, 2.4, pied, 5, 0, 3)); const fig = new THREE.Group(); fig.position.set(5, 1.6, 3);
    fig.add(cil(.55, .7, 2.2, pied)); fig.add(esfera(.45, pied, 0, 2.7, 0)); g.add(fig);
    return { g, r: 9 };
  },
  'taller-motos'() {
    const g = new THREE.Group();
    g.add(caja(16, 6, 10, 0xb9b1a0)); const tg = new THREE.CylinderGeometry(5, 5, 16, 12, 1, false, 0, Math.PI); tg.rotateZ(Math.PI / 2); const t = new THREE.Mesh(tg, M(0x8c8c88)); t.position.y = 6; t.scale.y = .5; g.add(t);
    const moto = new THREE.Group(); moto.add(caja(2.4, .7, .6, 0xd23b2a)); for (const x of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.45, .15, 6, 12), M(0x222222)); r.position.set(x, -.3, 0); moto.add(r); }
    moto.add(caja(.6, .2, 2.6, 0x9aa3ad, 0, .2, 0));
    g.add(moto);
    return { g, r: 12, anim(t) { const a = t * .5; moto.position.set(Math.cos(a) * 18, 14 + Math.sin(t * 1.3) * 2, Math.sin(a) * 18); moto.rotation.y = -a; } };
  },
  salon() {
    const g = new THREE.Group(); g.add(caja(26, 10, 16, 0xd2c8b4)); const t = new THREE.Mesh(prismaGeo(), M(0x2c8c82)); t.scale.set(17, 5, 27); t.rotation.y = Math.PI / 2; t.position.y = 10; g.add(t);
    const ant = []; for (const x of [-9, -3, 3, 9]) { const f = esfera(.6, new THREE.MeshStandardMaterial({ color: 0xffb35a, emissive: 0xff8a1a, emissiveIntensity: 0 }), x, 7, -8.4); g.add(f); ant.push(f); }
    return { g, r: 16, anim(t, n) { ant.forEach((f, i) => f.material.emissiveIntensity = (.5 + 2.5 * n) * (0.8 + .2 * Math.sin(t * 9 + i))); } };
  },
  huertas() {
    // canteros de verduras en el valle: surcos de colores, caminitos, un tanque de agua y un espantapájaros
    const g = new THREE.Group();
    const verdes = [0x5f9e3a, 0x7cb342, 0x8fbf4d, 0x4e8a34, 0xa5c75a, 0x6aa84f, 0xc7b24a, 0x9c6b3e];
    const tierra = M(0x7a5a3a, { roughness: 1 });
    for (let c = 0; c < 4; c++) for (let f = 0; f < 3; f++) {
      const px = (c - 1.5) * 42, pz = (f - 1) * 38, col = verdes[(c * 3 + f) % verdes.length];
      g.add(caja(36, .25, 32, tierra, px, -.05, pz));
      const planta = M(col, { roughness: 1, flatShading: true });
      for (let r = 0; r < 7; r++) {
        const fila = new THREE.Mesh(new THREE.BoxGeometry(33, .9 + (r % 2) * .3, 1.8), planta);
        fila.position.set(px, .55, pz - 13 + r * 4.3); fila.castShadow = true; g.add(fila);
        if ((c + f) % 3 === 0) for (let k = 0; k < 6; k++) { const ca = new THREE.Mesh(new THREE.SphereGeometry(.7, 6, 4), M(k % 2 ? 0xe07b2a : 0xd94b3b)); ca.position.set(px - 14 + k * 5.5, 1.1, pz - 13 + r * 4.3); g.add(ca); }
      }
    }
    const tanque = cil(4, 4, 6, 0x6f8fa0, 95, 0, -10, 16); g.add(tanque);
    const esp = new THREE.Group(); esp.position.set(-20, 0, 2);
    esp.add(caja(.3, 4, .3, 0x6b4a2f)); esp.add(caja(3.4, .3, .3, 0x6b4a2f, 0, 2.8)); esp.add(esfera(.6, 0xe8d9a8, 0, 4.3, 0)); esp.add(cil(.1, .9, .7, 0x8a6a2a, 0, 4.7, 0, 8));
    esp.add(caja(1.4, 1.6, .6, 0x3f6fb5, 0, 2.2, 0)); g.add(esp);
    const carretilla = caja(1.6, .7, 1, 0x9e9e9e, 30, .3, 22); g.add(carretilla);
    return { g, r: 95, anim(t) { esp.rotation.y = Math.sin(t * .4) * .15; } };
  },
  invernadero() {
    const g = new THREE.Group();
    const vidrio = new THREE.MeshStandardMaterial({ color: 0xcdeee6, transparent: true, opacity: .38, metalness: .2, roughness: .05, emissive: 0x7dffb0, emissiveIntensity: 0, side: THREE.DoubleSide, depthWrite: false });
    const bg = new THREE.CylinderGeometry(7, 7, 38, 20, 1, true, 0, Math.PI); bg.rotateZ(Math.PI / 2);
    const boveda = new THREE.Mesh(bg, vidrio); boveda.position.y = 1.2; g.add(boveda);
    const marco = M(0xe9eef2, { metalness: .5, roughness: .4 });
    for (let x = -19; x <= 19; x += 4.75) { const arco = new THREE.Mesh(new THREE.TorusGeometry(7, .15, 4, 20, Math.PI), marco); arco.position.set(x, 1.2, 0); arco.rotation.y = Math.PI / 2; g.add(arco); }
    g.add(caja(38.4, 1.2, 14.4, marco, 0, 0, 0));
    for (const z of [-7.1, 7.1]) { const tapa = new THREE.Mesh(new THREE.CircleGeometry(7, 20, 0, Math.PI), vidrio); tapa.position.set(z > 0 ? 19 : -19, 1.2, 0); tapa.rotation.y = Math.PI / 2; g.add(tapa); }
    const hojas = [0x3f8f3a, 0x5aa846, 0x2e7d32, 0x7cb342];
    for (let i = 0; i < 36; i++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(.9 + (i % 3) * .35, 0), M(hojas[i % 4], { flatShading: true }));
      p.position.set(-16 + (i % 12) * 2.9, 1.9 + (i % 2) * .4, -3.5 + Math.floor(i / 12) * 3.5); g.add(p);
      if (i % 4 === 0) { const f = new THREE.Mesh(new THREE.SphereGeometry(.35, 6, 4), M(i % 8 ? 0xd94b3b : 0xffd23f)); f.position.copy(p.position).add(new THREE.Vector3(.4, .6, .2)); g.add(f); } }
    const luzI = luz(0xb8ffcf, 0, 60, 0, 6, 0); g.add(luzI);
    return { g, r: 22, anim(t, n) { vidrio.emissiveIntensity = .45 * n; luzI.intensity = 900 * n; } };
  },
  puente() { return { g: new THREE.Group(), r: 0 }; },
  casa() { return { g: new THREE.Group(), r: 0 }; },
  plaza() { return { g: new THREE.Group(), r: 34 }; },
  parque() { return { g: new THREE.Group(), r: 0 }; },
  ninguno() { return { g: new THREE.Group(), r: 0 }; },
  fantasma() {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: 0x9be8c9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const a = new THREE.Mesh(new THREE.TorusGeometry(10, .8, 8, 40), m); a.rotation.x = -Math.PI / 2; a.position.y = 1; g.add(a);
    return { g, r: 0, anim(t, n) { m.opacity = (0.15 + 0.35 * n) * (0.6 + 0.4 * Math.sin(t * 2)); a.scale.setScalar(1 + .15 * Math.sin(t * 1.3)); } };
  },
  // ---- Mendoza ----
  anfiteatro() { // Teatro Griego Frank Romero Day: gradas en semicírculo contra el cerro y el escenario abajo
    const g = new THREE.Group(), piedra = M(0xcfc4b0), gris = M(0xb7ad9c);
    const perfil = [new THREE.Vector2(30, -1)];
    for (let i = 0; i < 14; i++) { const r = 32 + i * 6, h = i * 1.8; perfil.push(new THREE.Vector2(r, h + 1.8), new THREE.Vector2(r + 6, h + 1.8)); }
    perfil.push(new THREE.Vector2(116, -2));
    const gradas = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40, 0, Math.PI), M(0xcfc4b0, { side: THREE.DoubleSide })); gradas.position.set(18, 0, 0); gradas.castShadow = gradas.receiveShadow = true; g.add(gradas);
    for (let i = 2; i < 14; i += 3) { const p = new THREE.Mesh(new THREE.TorusGeometry(32 + i * 6, .5, 4, 40, Math.PI), gris); p.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); p.position.set(18, i * 1.8 + 1.9, 0); g.add(p); }
    g.add(cil(30, 30, 1.6, 0x9a8f7e, 18, -.4, 0, 40));
    g.add(caja(26, 3, 70, 0x6f5d4c, -12, 0, 0)); g.add(caja(4, 14, 74, 0x4b3f35, -26, 0, 0));
    const luces = []; for (const z of [-55, 55]) { g.add(cil(.8, .8, 34, 0x777777, 30, 0, z, 8)); const f = caja(5, 2.5, 2.5, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0c0, emissiveIntensity: .1 }), 30, 34, z); g.add(f); luces.push(f); }
    return { g, r: 115, anim(t, n) { for (const f of luces) f.material.emissiveIntensity = .1 + 2.5 * n; } };
  },
  'monumento-andes'() { // Monumento al Ejército de los Andes, en la cima del Cerro de la Gloria
    const g = new THREE.Group(), piedra = M(0xa79f92), bronce = M(0x6f5a3a, { metalness: .5, roughness: .45 });
    g.add(caja(34, 3, 24, 0x9d968a)); g.add(caja(26, 4, 16, piedra, 0, 3)); g.add(caja(12, 18, 9, piedra, 0, 7));
    g.add(caja(16, 3, 8, bronce, 0, 25)); // San Martín a caballo
    g.add(caja(3, 7, 3, bronce, 0, 28)); g.add(esfera(1.6, bronce, 0, 36.4));
    g.add(caja(2.2, 9, 2.2, bronce, 5, 28)); g.add(caja(.5, 6, 6, bronce, 5, 34)); // la Libertad con las cadenas rotas
    for (const [x, z] of [[-11, 9], [11, 9], [-11, -9], [11, -9]]) { g.add(caja(3, 6, 3, bronce, x, 7, z)); g.add(cil(.6, .6, 6, 0x3a3a3a, x * 1.3, 3, z * 1.3, 8)); }
    return { g, r: 45 };
  },
  ruinas() { // Ruinas de San Francisco: arcos rotos de adobe y ladrillo
    const g = new THREE.Group(), adobe = M(0xb98f6a), ladrillo = M(0x9c6a4c);
    g.add(caja(60, .6, 36, 0xc9b79a));
    for (let i = 0; i < 5; i++) { const x = -22 + i * 11, h = [9, 13, 6, 11, 4][i]; g.add(caja(3, h, 3, i % 2 ? adobe : ladrillo, x, 0, -12)); g.add(caja(3, h * .7, 3, adobe, x, 0, 12)); }
    for (let i = 0; i < 3; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1.3, 6, 12, Math.PI * (i === 1 ? .55 : 1)), ladrillo); a.position.set(-16.5 + i * 22, 9, -12); g.add(a); }
    g.add(caja(26, 7, 2.5, adobe, 8, 0, 18)); g.add(caja(14, 4, 2.5, ladrillo, -20, 0, 18));
    return { g, r: 45 };
  },
  usina() { // Ruinas de Fader: la usina hidroeléctrica de Cacheuta de Carlos (Karl) Fader, destruida por el aluvión de 1934
    const g = new THREE.Group(), horm = M(0xa9a39a), horm2 = M(0x8d877e), oxido = M(0x8a4b2a), maleza = M(0x6f8a4a);
    g.add(caja(90, .8, 60, 0xb7a98f));
    // sala de máquinas: muros rotos, sin techo
    g.add(caja(46, 16, 2.5, horm, -6, 0, -14)); g.add(caja(30, 11, 2.5, horm, -14, 0, 14)); g.add(caja(8, 6, 2.5, horm2, 12, 0, 14));
    g.add(caja(2.5, 14, 28, horm, -29, 0, 0)); g.add(caja(2.5, 7, 12, horm2, 17, 0, -7));
    for (let i = 0; i < 4; i++) g.add(caja(3, [18, 12, 15, 8][i], 3, horm2, -24 + i * 13, 0, 0)); // pilares
    g.add(caja(26, 1.6, 3, horm, -17, 17, 0)); // viga que quedó colgando
    const viga = caja(18, 1.4, 2.6, horm2, 4, 9, 0); viga.rotation.z = -.5; g.add(viga);
    // ventanales vacíos en el muro del fondo
    for (let i = 0; i < 4; i++) g.add(caja(5, 6, 3, 0x3b3833, -22 + i * 10, 6, -14));
    // turbinas semienterradas y caños de hierro retorcido
    for (let i = 0; i < 3; i++) { const t = cil(4, 4, 3.5, oxido, -18 + i * 11, 0, 4); t.rotation.x = Math.PI / 2; t.position.y = 2.6; g.add(t); }
    const tubo = cil(1.8, 1.8, 70, oxido, -40, 0, -40, 12); tubo.rotation.set(0, 0, 0); tubo.rotation.x = 1.0; tubo.rotation.z = .25; tubo.position.set(-46, 14, -40); g.add(tubo);
    const roto = cil(1.8, 1.8, 16, oxido, 0, 0, 0, 12); roto.rotation.z = 1.2; roto.position.set(26, 3, -20); g.add(roto);
    // maleza y piedras del aluvión
    for (let i = 0; i < 18; i++) { const a = i * 2.39; g.add(esfera(2 + (i % 3), i % 2 ? maleza : 0x9d927f, Math.cos(a) * (30 + i), 1, Math.sin(a) * (22 + i * .6))); }
    // la placa de bronce: «Karl Fader, 1933. Für die Zukunft»
    g.add(caja(3, 2, .4, brillo(0xb08d3c), -6, 5, -12.4));
    return { g, r: 60 };
  },
  bodega() { // bodega con nave de techo a dos aguas, toneles y viñas en hileras
    const g = new THREE.Group();
    g.add(caja(46, 9, 20, 0xe9dcc2)); const t = new THREE.Mesh(prismaGeo(), M(0x9a4e34)); t.scale.set(48, 6, 22); t.position.y = 9; g.add(t);
    g.add(caja(16, 12, 14, 0xd9c7a6, 26, 0, 4)); g.add(caja(8, 5, 1, 0x5a3b22, 0, 0, -10.2));
    for (let i = 0; i < 6; i++) { const b = cil(1.6, 1.6, 3.2, 0x7a4a26, -16 + i * 3.6, 0, -14, 14); b.rotation.x = Math.PI / 2; b.position.y = 1.6; g.add(b); }
    const vid = M(0x5f8f3e);
    for (let i = 0; i < 16; i++) g.add(caja(1.6, 1.8, 90, vid, -70 + i * 6, 0, 30));
    for (let i = 0; i < 16; i++) g.add(caja(1.6, 1.8, 70, vid, 22 + i * 6, 0, -48));
    return { g, r: 60 };
  },
  aeropuerto() { // terminal, torre de control y la pista norte-sur
    const g = new THREE.Group();
    g.add(caja(150, 14, 46, 0xd8dde2)); g.add(caja(150, 2, 52, 0x8ea2b4, 0, 14));
    for (let i = 0; i < 6; i++) g.add(caja(4, 4, 22, 0xb9c2ca, -60 + i * 24, 4, 34));
    g.add(cil(4, 5, 38, 0xe8e8e8, -100, 0, -10, 12)); g.add(cil(9, 7, 7, 0x6fa3c7, -100, 38, -10, 12));
    const pista = new THREE.Mesh(new THREE.BoxGeometry(48, .6, 2800), M(0x55595e)); pista.position.set(330, .3, -300); pista.receiveShadow = true; g.add(pista);
    const raya = new THREE.Mesh(new THREE.BoxGeometry(1.2, .7, 2700), brillo(0xf2f2f2)); raya.position.set(330, .35, -300); g.add(raya);
    g.add(caja(20, .5, 260, 0x6b6f74, 180, 0, 40));
    const avion = new THREE.Group(); avion.add(caja(36, 4, 4, 0xf4f4f4)); avion.add(caja(6, .6, 34, 0xf4f4f4, 2, 1.4)); avion.add(caja(3, 5, .6, 0x2d6fb6, -16, 2)); avion.position.set(90, 0, 60); g.add(avion);
    return { g, r: 120, anim(t) { const k = (t * 0.035) % 1; avion.position.set(330, k < .5 ? .4 : .4 + (k - .5) * 900, 1100 - k * 2600); avion.rotation.set(0, Math.PI / 2, k < .5 ? 0 : -.18); } };
  },
  santuario() { // Santuario de la Virgen de Lourdes del Challao
    const g = new THREE.Group();
    g.add(caja(16, 12, 32, 0xece4d6)); const t = new THREE.Mesh(prismaGeo(), M(0x8d8a86)); t.scale.set(17, 7, 33); t.position.y = 12; g.add(t);
    g.add(caja(7, 30, 7, 0xe7dfd0, 0, 0, -18)); g.add(new THREE.Mesh(new THREE.ConeGeometry(5.2, 10, 4), M(0x8d8a86)).translateY(35).translateZ(-18).rotateY(Math.PI / 4));
    g.add(caja(.8, 6, .8, 0x444444, 0, 40, -18)); g.add(caja(3.2, .8, .8, 0x444444, 0, 43, -18));
    g.add(caja(26, .6, 16, 0xd8cdb8, 0, 0, 24));
    return { g, r: 38 };
  },
  // ---- Venecia ----
  'campanile-sm'() { // el Campanile de San Marco: ladrillo, celda de campanas blanca, cubo y pirámide verde, el ángel dorado
    const g = new THREE.Group(), lad = M(0xb5674a), piedra = M(0xeee6d6);
    g.add(caja(12, 50, 12, lad)); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.add(caja(2.2, 46, .6, M(0xa45b40), Math.cos(a) * 6.1, 2, Math.sin(a) * 6.1).rotateY(a)); }
    g.add(caja(12.6, 2, 12.6, piedra, 0, 50)); g.add(caja(11, 9, 11, piedra, 0, 52));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; for (const d of [-3, 0, 3]) g.add(caja(1.6, 6, .4, 0x2d2a26, Math.cos(a) * 5.6 - Math.sin(a) * d, 53.2, Math.sin(a) * 5.6 + Math.cos(a) * d).rotateY(a)); }
    g.add(caja(12, 2, 12, piedra, 0, 61)); g.add(caja(10, 8, 10, lad, 0, 63));
    const pir = new THREE.Mesh(new THREE.ConeGeometry(7.4, 22, 4), M(0x6f9f86, { metalness: .3, roughness: .5 })); pir.position.y = 82; pir.rotation.y = Math.PI / 4; g.add(pir);
    g.add(esfera(1.2, M(0xd8b04a, { metalness: .8, roughness: .3 }), 0, 94)); g.add(caja(.8, 3, .8, M(0xd8b04a, { metalness: .8, roughness: .3 }), 0, 94.5));
    return { g, r: 12 };
  },
  'basilica-sm'() { // la Basílica: cinco cúpulas de plomo sobre cruz griega, fachada con arcos dorados
    const g = new THREE.Group(), m = M(0xe7dccb), plomo = M(0x9da3a6, { metalness: .4, roughness: .45 }), oro = M(0xd4aa48, { metalness: .7, roughness: .35 });
    g.add(caja(52, 22, 30, m)); g.add(caja(30, 22, 62, m));
    for (const [x, z, r] of [[0, 0, 7.5], [-17, 0, 6], [17, 0, 6], [0, -20, 6], [0, 20, 6]]) {
      g.add(cil(r * .85, r * .85, 5, m, x, 22, z, 16)); g.add(esfera(r, plomo, x, 27, z, {}, [18, 10, 0, Math.PI * 2, 0, Math.PI / 2]));
      g.add(caja(.6, 4, .6, oro, x, 27 + r, z)); g.add(esfera(.9, oro, x, 27.5 + r + 3.2, z));
    }
    for (let i = -2; i <= 2; i++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 1.2, 16, 1, false, 0, Math.PI), oro); a.rotation.set(Math.PI / 2, 0, Math.PI / 2); a.position.set(-26.3, 15, i * 6); g.add(a); }
    g.add(caja(1.4, 3, 1.4, oro, -26.5, 22, 0));
    return { g, r: 34 };
  },
  ducale() { // el Palacio Ducal: logia blanca abajo, muro de rombos rosados arriba
    const g = new THREE.Group(), blanco = M(0xf1ebe0), rosa = M(0xe6b9a8);
    g.add(caja(70, 8, 4, blanco, 0, 0, 34)); g.add(caja(4, 8, 70, blanco, 34, 0, 0));
    for (let i = -8; i <= 8; i++) { g.add(caja(1.2, 7, 1.2, 0xe9e2d4, i * 4, 0, 36.5)); g.add(caja(1.2, 7, 1.2, 0xe9e2d4, 36.5, 0, i * 4)); }
    g.add(caja(74, 6, 74, blanco, 0, 8)); g.add(caja(74, 12, 74, rosa, 0, 14));
    g.add(caja(52, 26, 52, 0xd9c8b4, 0, 0, 0));
    for (let i = -6; i <= 6; i++) { g.add(caja(1.6, 1.6, .4, blanco, i * 5.5, 26, 37.2)); g.add(caja(.4, 1.6, 1.6, blanco, 37.2, 26, i * 5.5)); }
    const t = new THREE.Mesh(prismaGeo(), M(0xb0674c)); t.scale.set(74, 5, 74); t.position.y = 26; g.add(t);
    g.rotation.y = -0.19;
    return { g, r: 44 };
  },
  'ponte-sospiri'() { // el Puente de los Suspiros, cerrado y de piedra blanca, sobre el Rio di Palazzo
    const g = new THREE.Group(), p = M(0xf0ece2);
    g.add(caja(4.5, 4, 11, p, 0, 6)); const a = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 4.5, 20, 1, false, -Math.PI / 2, Math.PI), p); a.rotation.z = Math.PI / 2; a.position.y = 9.4; a.scale.set(1, 1, .3); g.add(a);
    g.add(caja(1, 1.2, 1.6, 0x4a4a52, 2.3, 7.5, -2)); g.add(caja(1, 1.2, 1.6, 0x4a4a52, 2.3, 7.5, 2));
    g.rotation.y = -0.19;
    return { g, r: 6 };
  },
  rialto() { // el puente de Rialto: un solo arco de piedra con tiendas encima
    const g = new THREE.Group(), p = M(0xefe7d6);
    const arco = new THREE.Mesh(new THREE.TorusGeometry(15, 2.4, 8, 24, Math.PI), p); arco.scale.set(1.55, .55, 9); arco.position.y = -1; g.add(arco);
    for (const z of [-7, 7]) for (let i = -3; i <= 3; i++) { const h = 7.5 - Math.abs(i) * 1.6; g.add(caja(4.6, 4, 3, i % 2 ? 0xe9dcc4 : 0xf2e8d6, i * 4.8, h, z * .75)); const t = new THREE.Mesh(prismaGeo(), M(0xb1603f)); t.scale.set(4.8, 1.6, 3.4); t.position.set(i * 4.8, h + 4, z * .75); g.add(t); }
    g.add(caja(8, 4, 20, p, 0, 7.5)); const t = new THREE.Mesh(prismaGeo(), M(0xb1603f)); t.scale.set(9, 3, 21); t.position.y = 11.5; t.rotation.y = Math.PI / 2; g.add(t);
    g.rotation.y = 0.95;
    return { g, r: 16 };
  },
  salute() { // Santa Maria della Salute: octógono blanco, gran cúpula con volutas y linterna
    const g = new THREE.Group(), b = M(0xf3eee4), plomo = M(0xb7bcc0, { metalness: .3, roughness: .5 });
    g.add(cil(26, 26, 22, b, 0, 0, 0, 8)); g.add(cil(18, 20, 10, b, 0, 22, 0, 8));
    g.add(esfera(18.5, plomo, 0, 32, 0, {}, [24, 12, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(3.5, 3.5, 6, b, 0, 50, 0, 12)); g.add(esfera(3.6, plomo, 0, 56, 0, {}, [12, 8, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(caja(.6, 3, .6, 0x777777, 0, 59));
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.add(esfera(3.2, b, Math.cos(a) * 21, 23, Math.sin(a) * 21)); }
    g.add(cil(10, 10, 14, b, 34, 0, 0, 16)); g.add(esfera(10, plomo, 34, 14, 0, {}, [18, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    for (const z of [-11, 11]) g.add(cil(2.4, 2.4, 26, b, 46, 0, z, 10));
    g.add(caja(16, 2, 30, 0xe8e1d4, -28, 0, 0)); g.add(caja(10, 16, 18, b, -24, 0, 0));
    g.rotation.y = 0.1;
    return { g, r: 40 };
  },
  'san-giorgio'() { // San Giorgio Maggiore: fachada blanca de Palladio, cúpula y campanile puntiagudo
    const g = new THREE.Group(), b = M(0xf5f1e8);
    g.add(caja(26, 22, 60, b)); g.add(caja(44, 18, 22, b, 0, 0, 6));
    const t = new THREE.Mesh(prismaGeo(), M(0xb87256)); t.scale.set(28, 7, 62); t.position.y = 22; t.rotation.y = 0; g.add(t);
    g.add(cil(9, 9, 6, b, 0, 22, 8, 16)); g.add(esfera(9, M(0xa9adb0, { metalness: .3 }), 0, 28, 8, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    for (const x of [-9, -3, 3, 9]) g.add(cil(1.2, 1.2, 20, b, x, 0, -31, 10));
    const fr = new THREE.Mesh(prismaGeo(), b); fr.scale.set(24, 6, 2); fr.position.set(0, 20, -31); g.add(fr);
    g.add(caja(8, 52, 8, 0xd4a07e, -22, 0, 28)); g.add(caja(8.6, 7, 8.6, b, -22, 52, 28));
    const pu = new THREE.Mesh(new THREE.ConeGeometry(5.4, 18, 8), M(0x6f9f86, { metalness: .3 })); pu.position.set(-22, 68, 28); g.add(pu);
    g.add(caja(40, 12, 50, 0xe6dccb, 34, 0, 20));
    g.rotation.y = Math.PI / 2 - 0.15;
    return { g, r: 45 };
  },
  arsenale() { // la Porta Magna del Arsenal: dos torres almenadas sobre el canal y los leones de piedra
    const g = new THREE.Group(), lad = M(0xb6694c), p = M(0xece4d4);
    for (const x of [-14, 14]) { g.add(caja(10, 26, 10, lad, x, 0, 0)); for (let i = -1; i <= 1; i++) for (const s of [-1, 1]) { g.add(caja(2.2, 2.6, 1.4, lad, x + i * 3.6, 26, s * 4.3)); g.add(caja(1.4, 2.6, 2.2, lad, x + s * 4.3, 26, i * 3.6)); } }
    g.add(caja(18, 6, 4, lad, 0, 16, 0));
    g.add(caja(10, 12, 3, p, -26, 0, -12)); const fr = new THREE.Mesh(prismaGeo(), p); fr.scale.set(10, 3, 3); fr.position.set(-26, 12, -12); g.add(fr);
    for (const x of [-34, -38, -18]) { g.add(caja(2.8, 1.6, 1.2, p, x, 0, -15)); g.add(caja(2.2, 2.4, 1.4, 0xd9cfbd, x, 1.6, -15)); }
    g.add(caja(140, 9, 6, lad, 70, 0, -4)); g.add(caja(6, 9, 120, lad, 140, 0, 56));
    return { g, r: 30 };
  },
  // ---- Madrid ----
  cervantes() { // Monumento a Cervantes en la Plaza de España, con Don Quijote y Sancho a caballo delante
    const g = new THREE.Group(), piedra = M(0xd8cdb8), bronce = M(0x5d5a42, { metalness: .5, roughness: .45 });
    g.add(caja(36, 1.5, 22, 0xcfc3ad)); g.add(caja(16, 7, 10, piedra, 0, 1.5)); g.add(caja(9, 16, 7, piedra, 0, 8.5));
    g.add(caja(5, 6, 5, piedra, 0, 24.5)); g.add(esfera(3, M(0x4f7fb8), 0, 33.5, 0));
    g.add(caja(2.4, 4, 2, bronce, 0, 9, 4.2)); g.add(esfera(.9, bronce, 0, 13.8, 4.2)); // Cervantes sentado
    g.add(caja(4.5, 2.2, 1.6, bronce, -3, 1.5, 9)); g.add(caja(1, 3.6, .8, bronce, -3, 3.7, 9)); // Don Quijote en Rocinante
    g.add(caja(3, 1.8, 1.6, bronce, 3, 1.5, 9)); g.add(caja(1.2, 2.2, 1, bronce, 3, 3.3, 9)); // Sancho en el burro
    g.add(caja(30, .8, 6, 0x8fb7c9, 0, 0, 15));
    return { g, r: 26 };
  },
  debod() { // el Templo de Debod: el santuario egipcio, dos puertas de piedra y el estanque
    const g = new THREE.Group(), p = M(0xd9c39a);
    g.add(caja(70, .6, 26, 0x9fc3cf, 0, .2, 0));
    g.add(caja(16, 9, 12, p, -26, 0, 0)); g.add(caja(17, 1.6, 13, 0xcbb289, -26, 9, 0));
    for (const x of [6, 22]) { g.add(caja(2.6, 8, 3, p, x, 0, -3)); g.add(caja(2.6, 8, 3, p, x, 0, 3)); g.add(caja(2.8, 1.8, 9, p, x, 8, 0)); }
    return { g, r: 34 };
  },
  'torre-madrid'() { // la Torre de Madrid, 142 m sobre la Plaza de España
    const g = new THREE.Group(), c = M(0xe7e1d4), v = M(0x8aa3b5, { roughness: .3, metalness: .2 });
    g.add(caja(46, 16, 40, c)); g.add(caja(30, 110, 22, c, 0, 16)); g.add(caja(20, 16, 16, c, 0, 126));
    for (let y = 22; y < 124; y += 4) g.add(caja(30.4, 1.2, 22.4, v, 0, y));
    return { g, r: 26 };
  },
  'oso-madrono'() { // el Oso y el Madroño de la Puerta del Sol
    const g = new THREE.Group(), bronce = M(0x5d4a35, { metalness: .5, roughness: .45 });
    g.add(caja(3, 2, 3, 0xc9bda8)); g.add(cil(.35, .45, 5, bronce, .8, 2, 0, 8));
    g.add(esfera(2.2, M(0x3e6b3a), .8, 7.5, 0)); g.add(esfera(1.2, bronce, -.6, 3.6, 0)); g.add(esfera(.7, bronce, -.4, 5, .2));
    return { g, r: 6 };
  },
  'plaza-mayor'() { // la Plaza Mayor: rectángulo cerrado de fachadas rojas con nueve arcos y el rey Felipe III en el centro
    const g = new THREE.Group(), roja = M(0xa8573f), pizarra = M(0x4b4f57);
    const W = 129, D = 94, A = 14, H = 20;
    for (const [w, d, x, z] of [[W, A, 0, -D / 2 + A / 2], [W, A, 0, D / 2 - A / 2], [A, D, -W / 2 + A / 2, 0], [A, D, W / 2 - A / 2, 0]]) {
      g.add(caja(w, H, d, roja, x, 0, z)); const t = new THREE.Mesh(prismaGeo(), pizarra); t.scale.set(w, 4, d); t.position.set(x, H, z); if (d > w) t.rotation.y = 0; g.add(t);
    }
    for (const x of [-12, 12]) { g.add(caja(6, 30, 6, roja, x, 0, -D / 2 + A / 2)); const c = new THREE.Mesh(new THREE.ConeGeometry(4.2, 10, 4), pizarra); c.position.set(x, 35, -D / 2 + A / 2); c.rotation.y = Math.PI / 4; g.add(c); }
    g.add(caja(4, 4, 2, 0xc9bda8)); g.add(caja(3, 2, 1, M(0x5d5a42, { metalness: .5 }), 0, 4)); g.add(caja(.8, 2.4, .8, M(0x5d5a42, { metalness: .5 }), 0, 6));
    g.rotation.y = 0.12;
    return { g, r: 74 };
  },
  cebada() { // el Mercado de la Cebada, con su techo ondulado de cúpulas
    const g = new THREE.Group();
    g.add(caja(80, 9, 56, 0xd8d2c4));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.add(esfera(10, M(0x8a96a0, { metalness: .4 }), -30 + i * 20, 9, -18 + j * 18, {}, [14, 6, 0, Math.PI * 2, 0, Math.PI / 2]));
    return { g, r: 44 };
  },
  'biblioteca-nacional'() { // la Biblioteca Nacional, sobre el Paseo de Recoletos
    const g = new THREE.Group(), p = M(0xe9e1d0);
    g.add(caja(36, 24, 150, p)); g.add(caja(60, 20, 30, p, 20, 0, 0)); g.add(caja(8, 3, 34, 0xd8cdb8, -21, 0, 0));
    for (let i = -3; i <= 3; i++) g.add(cil(1.3, 1.3, 16, p, -22, 4, i * 4, 10));
    const fr = new THREE.Mesh(prismaGeo(), p); fr.scale.set(3, 6, 30); fr.position.set(-22, 20, 0); g.add(fr);
    g.add(caja(50, .5, 150, 0xd9d0bd, 30, 0, 0));
    return { g, r: 50 };
  },
  colon() { // la Plaza de Colón: la columna del navegante y la gran bandera de España
    const g = new THREE.Group(), p = M(0xe0d6c3);
    g.add(caja(8, 6, 8, p)); g.add(cil(1.8, 2.2, 22, p, 0, 6, 0, 12)); g.add(caja(3, 3, 3, p, 0, 28)); g.add(caja(1.2, 4, 1.2, M(0xd8d0bf), 0, 31));
    g.add(cil(.4, .4, 50, 0x888888, 30, 0, 10, 8));
    const bandera = new THREE.Group(); bandera.position.set(30, 44, 10);
    const geo = new THREE.PlaneGeometry(21, 14, 12, 4); geo.translate(10.5, -7, 0);
    const col = []; const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const yy = pos.getY(i); const c = yy > -3.5 || yy < -10.5 ? [0.78, 0.07, 0.12] : [0.98, 0.76, 0.0]; col.push(...c); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const fl = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .8 })); bandera.add(fl); g.add(bandera);
    const base = geo.attributes.position.array.slice();
    return { g, r: 30, anim(t) { const a = pos.array; for (let i = 0; i < pos.count; i++) { const x = base[i * 3]; a[i * 3 + 2] = Math.sin(x * .45 - t * 3) * x * .06; } pos.needsUpdate = true; } };
  },
  'banco-espana'() { // el Banco de España, en la esquina de Cibeles, con la fuente de la diosa delante
    const g = new THREE.Group(), p = M(0xe8dfcd);
    g.add(caja(90, 22, 30, p, 0, 0, -10)); g.add(caja(30, 22, 80, p, 30, 0, 15)); g.add(cil(9, 9, 26, p, 40, 0, -20, 16));
    g.add(esfera(9, M(0x6e8a7e, { metalness: .4 }), 40, 26, -20, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    g.add(cil(9, 9, 1, 0x9fc3cf, 85, 0, -40, 20)); g.add(caja(3, 3, 5, M(0xe9e3d6), 85, 1, -40)); g.add(esfera(1, M(0xe9e3d6), 85, 5.5, -40));
    return { g, r: 52 };
  },
  metro() { // una boca del metro de Madrid, con su rombo rojo
    const g = new THREE.Group();
    g.add(caja(6, .6, 10, 0x9a948a)); g.add(cil(.15, .15, 4, 0x777777, 3.5, 0, 5, 6));
    const r = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, .2), new THREE.MeshStandardMaterial({ color: 0xd8262e, emissive: 0x6a0a0a })); r.position.set(3.5, 4.4, 5); r.rotation.z = Math.PI / 4; g.add(r);
    return { g, r: 6 };
  },
  fundador() { // Luis Fader, fundador de Sinea: de bronce, sentado en un banco, con el cuaderno abierto en una página en blanco
    const g = new THREE.Group(), bronce = M(0x6b5636, { metalness: .55, roughness: .4 }), piedra = M(0xcfc6b6);
    g.add(caja(7, .6, 4.2, piedra)); g.add(caja(4.6, .35, 1.4, bronce, 0, 1.25, 0)); g.add(caja(4.6, 1.3, .25, bronce, 0, 1.6, -.6));
    for (const x of [-2, 2]) g.add(caja(.3, 1.25, 1.2, bronce, x, .6, 0));
    const p = new THREE.Group(); p.position.set(-.6, 1.6, 0);
    p.add(caja(.8, .5, 1.3, bronce, 0, 0, .25)); for (const z of [-.25, .25]) p.add(caja(.32, 1.3, .32, bronce, z, -1.25, .85));
    p.add(caja(.9, 1.6, .55, bronce, 0, .95, -.2)); p.add(esfera(.36, bronce, 0, 2.15, -.15));
    const libreta = caja(.55, .05, .4, 0xe9e2cf, .35, .9, .45); libreta.rotation.x = -.6; p.add(libreta);
    p.rotation.y = 0; g.add(p);
    const flores = [0xd9475e, 0xf0c84a, 0xffffff, 0xb05fc9, 0xe8733a];
    for (let i = 0; i < 14; i++) { const a = -0.3 + i * 0.27, r = 3 + (i % 3) * .35; g.add(esfera(.22, M(flores[i % 5]), Math.cos(a) * r * .9, .75, Math.sin(a) * r * .55 + 1.1)); }
    for (let i = 0; i < 5; i++) g.add(caja(.4, .02, .3, 0xfff8dc, -1.6 + i * .8, .62, 1.7));
    g.rotation.y = Math.PI * .85; g.scale.setScalar(2.3);
    const o = new THREE.Group(); o.add(cil(11, 11.5, .5, 0xd8cfc0)); o.add(g);
    return { g: o, r: 12 };
  },
  // ---- San Petersburgo ----
  singer() { // la Casa Singer: esquina con torre, cúpula de vidrio y el globo encima
    const g = new THREE.Group(), f = M(0x9a8f86), v = M(0x6f8f9a, { roughness: .25, metalness: .3 });
    g.add(caja(40, 26, 24, f, -8, 0, 0)); g.add(caja(24, 26, 40, f, 0, 0, -8));
    g.add(cil(9, 9, 34, f, 6, 0, 6, 16)); g.add(cil(7.5, 9, 6, 0xb7c9cf, 6, 34, 6, 16));
    g.add(esfera(7, v, 6, 40, 6, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(.8, .8, 4, 0x4f6a52, 6, 47, 6, 8));
    const globo = esfera(2.8, M(0xcfe6ef, { roughness: .1, metalness: .4, transparent: true, opacity: .8 }), 6, 52.5, 6); g.add(globo);
    g.add(caja(.6, 2, .6, 0x2f6a4a, 6, 49, 9)); g.add(caja(.6, 2, .6, 0x2f6a4a, 6, 49, 3));
    for (let y = 4; y < 26; y += 4.4) { g.add(caja(40.4, 2.6, .4, 0x7aa2b0, -8, y, 12.1)); g.add(caja(.4, 2.6, 40.4, 0x7aa2b0, 12.1, y, -8)); }
    return { g, r: 26, anim(t) { globo.rotation.y = t * .4; } };
  },
  atlantes() { // los atlantes del Nuevo Ermitage, en la calle Millónnaya
    const g = new THREE.Group(), gris = M(0x6f6a66, { roughness: .6 });
    g.add(caja(24, 14, 6, 0xd8cdb8, 0, 0, -4)); g.add(caja(24, 1.4, 9, 0xcfc4ae, 0, 14, -2.5));
    for (const x of [-7.5, -2.5, 2.5, 7.5]) { g.add(caja(1.6, 1.2, 1.6, gris, x, 0, 0)); g.add(caja(1.3, 5.5, 1.1, gris, x, 1.2, 0)); g.add(caja(2.2, 3.5, 1.3, gris, x, 6.7, 0)); g.add(esfera(.7, gris, x, 10.7, .2)); g.add(caja(.6, 3.2, .6, gris, x - .9, 10.4, 0)); g.add(caja(.6, 3.2, .6, gris, x + .9, 10.4, 0)); }
    return { g, r: 14 };
  },
  'columna-alejandro'() { // la Columna de Alejandro en la Plaza del Palacio
    const g = new THREE.Group(), granito = M(0xa0605a, { roughness: .4 });
    g.add(caja(8, 4.5, 8, granito)); g.add(caja(6.4, 1.2, 6.4, 0x8a8a8a, 0, 4.5)); g.add(cil(1.9, 2.3, 30, granito, 0, 5.7, 0, 16));
    g.add(caja(4.2, 3, 4.2, M(0x6a6a5a, { metalness: .6 }), 0, 35.7)); g.add(cil(.9, 1.2, 4, M(0xd4aa48, { metalness: .7, roughness: .35 }), 0, 38.7, 0, 8)); g.add(esfera(.6, M(0xd4aa48, { metalness: .7 }), 0, 43.2, 0)); g.add(caja(.3, 3, 1.6, M(0xd4aa48, { metalness: .7 }), 0, 41.8, 0));
    return { g, r: 8 };
  },
  ermitazh() { // el Palacio de Invierno (Ermitage): verde y blanco, con columnas y estatuas en el techo
    const g = new THREE.Group(), verde = M(0x7fb8a2), blanco = M(0xf2efe6), oro = M(0xd4aa48, { metalness: .7, roughness: .35 });
    const W = 200, D = 150, A = 34, H = 24;
    for (const [w, d, x, z] of [[W, A, 0, -D / 2 + A / 2], [W, A, 0, D / 2 - A / 2], [A, D, -W / 2 + A / 2, 0], [A, D, W / 2 - A / 2, 0]]) {
      g.add(caja(w, H, d, verde, x, 0, z)); g.add(caja(w + .4, 1.4, d + .4, blanco, x, 9, z)); g.add(caja(w + .4, 1.6, d + .4, blanco, x, H - 1.6, z));
      const n = Math.round(Math.max(w, d) / 11); for (let i = 0; i < n; i++) { const k = -Math.max(w, d) / 2 + (i + .5) * Math.max(w, d) / n;
        if (w > d) for (const s of [-1, 1]) g.add(caja(.9, H - 4, .9, blanco, x + k, 2, z + s * (d / 2 + .3)));
        else for (const s of [-1, 1]) g.add(caja(.9, H - 4, .9, blanco, x + s * (w / 2 + .3), 2, z + k));
        if (i % 2 === 0) g.add(caja(.7, 2.2, .7, oro, w > d ? x + k : x + (w / 2), H, w > d ? z + d / 2 : z + k)); }
    }
    g.add(caja(W - 2 * A, 1, D - 2 * A, 0xd9d3c5, 0, 0, 0));
    for (const [w, d, x, z] of [[W, A, 0, -D / 2 + A / 2], [W, A, 0, D / 2 - A / 2], [A, D, -W / 2 + A / 2, 0], [A, D, W / 2 - A / 2, 0]]) g.add(caja(w - 1, 3, d - 1, 0x8a9a92, x, H, z));
    return { g, r: 110 };
  },
  esfinges() { // las esfinges egipcias del muelle de la Universidad, frente al Neva
    const g = new THREE.Group(), p = M(0x9c8a72, { roughness: .5 });
    g.add(caja(34, 1.5, 14, 0xa7a29a)); for (const s of [-1, 1]) g.add(caja(6, 1.2, 10, 0xb3aea6, 0, 1.5, s * 9));
    for (const x of [-12, 12]) { g.add(caja(3.2, 2.2, 7, 0xb9a4c0, x, 1.5, 0)); g.add(caja(2.6, 2.2, 6, p, x, 3.7, 0)); g.add(caja(2.4, 3.4, 2.4, p, x, 4.6, -2.4)); g.add(caja(3, 1.4, 1.6, 0x6d7ea0, x, 7.4, -2.4)); }
    return { g, r: 18 };
  },
  grifones() { // el Puente del Banco: pasarela sobre el canal Griboédov y los cuatro grifos de alas doradas
    const g = new THREE.Group(), negro = M(0x2a2a2a, { metalness: .3 }), oro = M(0xd4aa48, { metalness: .8, roughness: .3 });
    g.add(caja(2.2, .4, 26, 0x8a7f72, 0, 1.4, 0)); for (const s of [-1, 1]) g.add(caja(.15, 1, 26, negro, s * 1.1, 1.8, 0));
    const alas = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const q = new THREE.Group(); q.position.set(sx * 1.8, 0, sz * 13);
      q.add(caja(1.6, 2.2, 1.6, 0x9a9087)); q.add(caja(1.1, 1.2, 2.2, negro, 0, 2.2, 0)); q.add(esfera(.45, negro, 0, 3.6, sz * -1)); q.add(caja(.3, .5, .6, oro, 0, 3.5, sz * -1.5));
      const a = new THREE.Group(); a.position.set(0, 3.2, 0); a.add(caja(.15, 1.8, 1.6, oro, sx * .6, .9, 0)); q.add(a); alas.push(a);
      g.add(q);
    }
    return { g, r: 14, anim(t) { alas.forEach((a, i) => a.rotation.x = Math.sin(t * 1.5 + i) * .12); } };
  },
  isaakiy() { // la Catedral de San Isaac: columnatas, la gran cúpula dorada y cuatro campanarios
    const g = new THREE.Group(), p = M(0xc8bfae), oro = M(0xd9ae4c, { metalness: .8, roughness: .3 }), col = M(0x8a4f48);
    g.add(caja(70, 34, 50, p)); for (const [x, z, w, d] of [[-38, 0, 6, 34], [38, 0, 6, 34], [0, -28, 34, 6], [0, 28, 34, 6]]) { g.add(caja(w, 30, d, col, x, 0, z)); const fr = new THREE.Mesh(prismaGeo(), p); fr.scale.set(w > d ? w + 2 : 8, 8, w > d ? 8 : d + 2); fr.position.set(x, 30, z); if (d > w) fr.rotation.y = Math.PI / 2; g.add(fr); }
    g.add(cil(15, 15, 18, p, 0, 34, 0, 24)); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(cil(.8, .8, 16, col, Math.cos(a) * 16.5, 35, Math.sin(a) * 16.5, 6)); }
    g.add(esfera(15, oro, 0, 52, 0, {}, [24, 12, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(3, 3, 8, p, 0, 66, 0, 12)); g.add(esfera(3.2, oro, 0, 74, 0, {}, [12, 6, 0, Math.PI * 2, 0, Math.PI / 2])); { const c = cruzOrtodoxa(11, M(0xf2c75a, { metalness: .85, roughness: .25, emissive: 0x3a2a00 })); c.position.y = 77; g.add(c); }
    for (const [x, z] of [[-28, -18], [28, -18], [-28, 18], [28, 18]]) { g.add(cil(3.4, 3.4, 8, p, x, 34, z, 12)); g.add(esfera(3.4, oro, x, 42, z, {}, [12, 6, 0, Math.PI * 2, 0, Math.PI / 2])); const c = cruzOrtodoxa(4.5, oro); c.position.set(x, 45.2, z); g.add(c); }
    return { g, r: 46 };
  },
  anichkov() { // el Puente Anichkov sobre el Fontanka, con los cuatro domadores de caballos
    const g = new THREE.Group(), bronce = M(0x3f3a33, { metalness: .5, roughness: .45 });
    g.add(caja(38, 1.2, 40, 0x9a9087, 0, .5, 0)); for (const s of [-1, 1]) g.add(caja(.4, 1.2, 40, 0x6f6a66, s * 19, 1.7, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const q = new THREE.Group(); q.position.set(sx * 16, 1.7, sz * 22);
      q.add(caja(4, 3, 7, 0xa79f92)); q.add(caja(2.4, 2.6, 5.5, bronce, 0, 3, 0)); { const cab = caja(1.2, 2.4, 1.3, bronce, 0, 5.2, sz * -2.5); cab.rotation.x = sz * .5; q.add(cab); } q.add(caja(.8, 2.6, .8, bronce, sx * 1.6, 3, sz * 2.4)); q.add(esfera(.4, bronce, sx * 1.6, 6, sz * 2.4)); g.add(q); }
    return { g, r: 26 };
  },
  'museo-ruso'() { // el Museo Ruso (Palacio Mijáilovski): amarillo y blanco, con pórtico de columnas; en la novela se eleva sobre la ciudad
    const g = new THREE.Group(), am = M(0xe9c96f), bl = M(0xf3efe5);
    g.add(caja(120, 20, 26, am)); g.add(caja(24, 20, 70, am, -60, 0, 22)); g.add(caja(24, 20, 70, am, 60, 0, 22));
    for (let i = -4; i <= 4; i++) g.add(cil(1, 1, 16, bl, i * 3, 4, 14, 8)); g.add(caja(30, 4, 6, bl, 0, 20, 14)); const fr = new THREE.Mesh(prismaGeo(), bl); fr.scale.set(30, 6, 6); fr.position.set(0, 24, 14); g.add(fr);
    g.add(caja(121, 1.2, 27, bl, 0, 19, 0));
    return { g, r: 70 };
  },
  mariinski() { // el Teatro Mariinski, verde menta
    const g = new THREE.Group(), v = M(0x9fd0bf), bl = M(0xf3efe5);
    g.add(caja(70, 24, 100, v)); g.add(caja(71, 1.4, 101, bl, 0, 11)); g.add(caja(40, 30, 40, v, 0, 0, -10)); g.add(caja(20, 10, 20, bl, -36, 0, 30));
    g.add(esfera(10, M(0x8a96a0, { metalness: .4 }), 0, 30, -10, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    return { g, r: 56 };
  },
  'puente-palacio'() { // el Puente del Palacio sobre el Neva: de noche se abre, como en la cita de Luis y Natalia
    const g = new THREE.Group(), azul = M(0x4a6070, { metalness: .4 }), gr = M(0x9a9087);
    const L = 250;
    g.add(caja(28, 4, 90, gr, 0, 0, -L / 2 + 45)); g.add(caja(28, 4, 90, gr, 0, 0, L / 2 - 45));
    const ha = new THREE.Group(), hb = new THREE.Group(); ha.position.set(0, 4, -L / 2 + 90); hb.position.set(0, 4, L / 2 - 90);
    ha.add(caja(24, 2, 35, azul, 0, 0, 17.5)); hb.add(caja(24, 2, 35, azul, 0, 0, -17.5)); g.add(ha, hb);
    for (const z of [-L / 2 + 90, L / 2 - 90]) for (const x of [-13, 13]) g.add(cil(.25, .25, 6, 0x333333, x, 4, z, 6));
    return { g, r: 30, anim(t, n) { const a = n * 1.1; ha.rotation.x = -a; hb.rotation.x = a; } };
  },
  poceluev() { // el Puente de los Besos (Potselúev) sobre el Moika, con sus faroles
    const g = new THREE.Group(), p = M(0xb4aca0);
    const arco = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 32, 20, 1, false, -Math.PI / 2, Math.PI), p); arco.rotation.x = Math.PI / 2; arco.rotation.z = Math.PI / 2; arco.scale.set(1, .22, 1); g.add(arco);
    const luces = []; for (const x of [-10, 10]) for (const z of [-14, 14]) { g.add(cil(.25, .3, 4, 0x2a2a2a, x, 2.6, z, 6)); const l = esfera(.6, new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffd88a, emissiveIntensity: .2 }), x, 6.8, z); g.add(l); luces.push(l); }
    g.rotation.y = Math.PI / 2;
    return { g, r: 18, anim(t, n) { for (const l of luces) l.material.emissiveIntensity = .2 + 2.4 * n; } };
  },
  // ---- Belgrado ----
  pobednik() { // el «Vencedor» de Meštrović sobre su columna, en el borde de Kalemegdan, y un trozo de muralla
    const g = new THREE.Group(), p = M(0xd8d0c0), b = M(0x4e5a4c, { metalness: .5, roughness: .45 }), lad = M(0xb79a78);
    g.add(caja(10, 2, 10, p)); g.add(cil(1.6, 1.9, 14, p, 0, 2, 0, 16)); g.add(caja(4, 1.2, 4, p, 0, 16));
    g.add(caja(1.2, 3.6, .9, b, 0, 17.2, 0)); g.add(esfera(.55, b, 0, 21.4, 0)); g.add(caja(.4, 2.6, .4, b, .9, 18.6, 0)); g.add(esfera(.45, b, 1.2, 21.2, .3)); // el halcón en la mano
    g.add(caja(.4, 3, .3, b, -.8, 18, 0)); // la espada
    for (let i = 0; i < 7; i++) g.add(caja(14, 7, 5, lad, -40 + i * 12, 0, 22 + Math.sin(i) * 4));
    for (let i = 0; i < 14; i++) g.add(caja(2, 1.6, 5, lad, -45 + i * 6.5, 7, 22 + Math.sin(i / 2) * 4));
    return { g, r: 22 };
  },
  nebojsa() { // la torre Nebojša: torre redonda de piedra con techo cónico, junto al Danubio
    const g = new THREE.Group(), p = M(0xc9b89a);
    g.add(cil(9, 10, 24, p, 0, 0, 0, 20)); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.add(caja(1.2, 2, .4, 0x2b2b2b, Math.cos(a) * 9.4, 16, Math.sin(a) * 9.4).rotateY(-a)); }
    const t = new THREE.Mesh(new THREE.ConeGeometry(10.5, 8, 20), M(0x8a5a3a)); t.position.y = 28; g.add(t);
    g.add(caja(30, 5, 4, p, -18, 0, 6));
    return { g, r: 14 };
  },
  'knez-mihailo'() { // el monumento ecuestre al príncipe Mihailo en la Plaza de la República, con el Museo Nacional detrás
    const g = new THREE.Group(), p = M(0xd9d0be), b = M(0x3c4a3c, { metalness: .5, roughness: .45 });
    g.add(caja(9, 5, 5, p)); g.add(caja(7, 2.6, 2, b, 0, 5, 0)); g.add(caja(1.6, 2.2, 1.6, b, 2.8, 7, 0)); g.add(caja(1, 2.4, 1, b, -.4, 7.6, 0)); g.add(esfera(.5, b, -.4, 10.4, 0));
    for (const x of [-3, -1, 1, 3]) g.add(caja(.7, 2.6, .7, b, x * .9, 2.4, x > 0 ? .8 : -.8));
    g.add(caja(70, 20, 40, 0xe3dac8, -10, 0, -60)); const c = cil(9, 9, 6, 0xe3dac8, -10, 20, -60, 16); g.add(c); g.add(esfera(9, M(0x6f8f86, { metalness: .4 }), -10, 26, -60, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2]));
    return { g, r: 40 };
  },
  'ruina-bombas'() { // el edificio del Estado Mayor bombardeado en 1999: bloques de piedra rojiza con el centro hundido
    const g = new THREE.Group(), r = M(0xa8644c), gr = M(0x7a7066);
    g.add(caja(40, 30, 22, r, -32, 0, 0)); g.add(caja(26, 22, 22, r, -6, 0, 0)); g.add(caja(16, 9, 22, gr, 14, 0, 0)); g.add(caja(24, 26, 22, r, 36, 0, 0));
    for (let i = 0; i < 9; i++) g.add(caja(3 + (i % 3), 2 + (i % 4), 3, gr, 6 + i * 2.5, 9 + (i % 3) * 2, -6 + (i % 5) * 3));
    for (let y = 4; y < 28; y += 5) for (let x = -50; x < -14; x += 5) g.add(caja(2, 2.6, .3, 0x2a2a2a, x, y, 11.1));
    return { g, r: 52 };
  },
  'hram-sava'() { // el templo de San Sava: mármol blanco, cúpula verde, cuatro torres y la gran cruz ortodoxa dorada
    const g = new THREE.Group(), bl = M(0xf1eee6), verde = M(0x6f9a86, { metalness: .4, roughness: .45 }), oro = M(0xf2c75a, { metalness: .85, roughness: .25, emissive: 0x3a2a00 });
    g.add(caja(72, 30, 72, bl)); for (const [x, z] of [[0, -40], [0, 40], [-40, 0], [40, 0]]) { g.add(caja(x ? 12 : 44, 26, x ? 44 : 12, bl, x, 0, z)); g.add(esfera(x ? 6 : 22, verde, x * 1.08, 26, z * 1.08, {}, [16, 8, 0, Math.PI * 2, 0, Math.PI / 2])); }
    g.add(cil(26, 26, 14, bl, 0, 30, 0, 32)); g.add(esfera(26, verde, 0, 44, 0, {}, [32, 14, 0, Math.PI * 2, 0, Math.PI / 2]));
    g.add(cil(4, 4, 6, bl, 0, 70, 0, 12)); g.add(esfera(4.2, oro, 0, 76, 0, {}, [12, 6, 0, Math.PI * 2, 0, Math.PI / 2]));
    { const c = cruzOrtodoxa(13, oro); c.position.y = 80; g.add(c); }
    for (const [x, z] of [[-34, -34], [34, -34], [-34, 34], [34, 34]]) { g.add(cil(5, 5, 40, bl, x, 0, z, 12)); g.add(esfera(5.4, verde, x, 40, z, {}, [12, 6, 0, Math.PI * 2, 0, Math.PI / 2])); const c = cruzOrtodoxa(5, oro); c.position.set(x, 45, z); g.add(c); }
    return { g, r: 54 };
  },
  'puente-branko'() { // el Puente Branko sobre el Sava
    const g = new THREE.Group(), gr = M(0x8d9298, { metalness: .3 });
    g.add(caja(28, 3, 450, gr, 0, 14, 0)); for (const z of [-150, -50, 50, 150]) g.add(caja(8, 14, 10, 0x9a948a, 0, 0, z));
    for (const s of [-1, 1]) g.add(caja(.4, 1.2, 450, 0x333333, s * 14, 17, 0));
    g.rotation.y = Math.PI / 2;
    return { g, r: 30 };
  },
  'karluv-most'() { // el Puente de Carlos: 16 arcos de piedra arenisca, 30 estatuas oscuras y las torres góticas de cada orilla
    const g = new THREE.Group(), pie = M(0xb9ac93), osc = M(0x4b4640), techo = M(0x3d3f44);
    const Lm = 520, w = 10;
    g.add(caja(Lm, 2.2, w, pie, 0, 8, 0)); // tablero
    for (const s of [-1, 1]) g.add(caja(Lm, 1.4, .8, pie, 0, 10.2, s * (w / 2 - .4))); // parapetos
    for (let i = 0; i < 15; i++) { const x = -Lm / 2 + 30 + i * 32.5; g.add(caja(6, 8, w + 2, pie, x, 0, 0)); const a = cil(0, 3, 3, pie, x, 8, w / 2 + 1.5, 6); a.rotation.x = Math.PI / 2; } // pilares
    for (let i = 0; i < 15; i++) { const x = -Lm / 2 + 30 + i * 32.5; for (const s of [-1, 1]) { g.add(caja(1.6, 1.6, 1.6, pie, x, 10.4, s * (w / 2 - .6))); g.add(cil(.5, .7, 3.6, osc, x, 12, s * (w / 2 - .6), 6)); g.add(esfera(.55, osc, x, 16, s * (w / 2 - .6))); } }
    const torre = (x, h, ancho) => { g.add(caja(ancho, h, ancho, 0x6d655a, x, 0, 0)); g.add(caja(ancho * .9, 3.2, w - .5, 0x2b2620, x, 8, 0)); const t = new THREE.Mesh(new THREE.ConeGeometry(ancho * .72, h * .45, 4), techo); t.rotation.y = Math.PI / 4; t.position.set(x, h + h * .225, 0); g.add(t); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.2, 6, 6), techo); p.position.set(x + dx * ancho * .45, h + 3, dz * ancho * .45); g.add(p); } };
    torre(-Lm / 2 - 6, 30, 14); // torre de la Ciudad Vieja
    torre(Lm / 2 + 6, 32, 14); g.add(caja(10, 22, 10, 0x6d655a, Lm / 2 + 8, 0, 13)); // las dos torres de Malá Strana
    { const t = new THREE.Mesh(new THREE.ConeGeometry(6.5, 9, 4), techo); t.rotation.y = Math.PI / 4; t.position.set(Lm / 2 + 8, 26.5, 13); g.add(t); }
    // farolas
    for (let i = 0; i < 12; i++) { const x = -Lm / 2 + 45 + i * 40; g.add(cil(.15, .15, 5, 0x222222, x, 10, 3.6, 5)); g.add(esfera(.45, brillo(0xffd58a), x, 15.2, 3.6)); }
    g.rotation.y = Math.atan2(68, -524);
    return { g, r: 40 };
  },
  'hrad-praga'() { // el Castillo de Praga y la catedral de San Vito sobre la colina
    const g = new THREE.Group(), pal = M(0xe8e1cf), techo = M(0xa04a32), cat = M(0x8c8378), verde = M(0x5f8f7c, { metalness: .3, roughness: .5 }), oro = M(0xf2c75a, { metalness: .8, roughness: .3 });
    g.add(caja(380, 3, 120, 0xcfc6b3, -20, 0, 0));
    for (const [x, z, w, d] of [[-150, -40, 120, 22], [-150, 40, 120, 22], [-205, 0, 22, 100], [70, -48, 150, 22], [70, 48, 160, 20], [150, 0, 22, 96], [-90, 0, 18, 80]]) { g.add(caja(w, 18, d, pal, x, 0, z)); const t = new THREE.Mesh(prismaGeo(), techo); t.scale.set(w, 6, d); t.position.set(x, 18, z); if (d > w) { t.rotation.y = Math.PI / 2; t.scale.set(d, 6, w); } g.add(t); }
    // catedral: nave alta, contrafuertes, ábside, torre principal y las dos agujas de la fachada oeste
    g.add(caja(110, 34, 30, cat, 0, 0, 0)); { const t = new THREE.Mesh(prismaGeo(), M(0x4d4a47)); t.scale.set(112, 14, 32); t.position.y = 34; g.add(t); }
    for (let i = 0; i < 8; i++) for (const s of [-1, 1]) g.add(caja(3, 26, 6, cat, -44 + i * 12, 0, s * 18));
    g.add(cil(16, 16, 30, cat, 55, 0, 0, 12));
    g.add(caja(16, 70, 16, cat, 10, 0, 22)); g.add(esfera(8, verde, 10, 70, 22, {}, [12, 8, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(3, 4, 10, verde, 10, 76, 22, 8)); g.add(esfera(2, oro, 10, 88, 22));
    for (const z of [-10, 10]) { g.add(caja(10, 50, 10, cat, -58, 0, z)); const a = new THREE.Mesh(new THREE.ConeGeometry(5.5, 34, 8), M(0x4d4a47)); a.position.set(-58, 67, z); g.add(a); }
    // San Jorge: dos torres blancas y fachada roja
    g.add(caja(36, 16, 18, 0xb2553e, 95, 0, 15)); for (const x of [104, 112]) { g.add(caja(6, 30, 6, 0xf1ece0, x, 0, 6)); const a = new THREE.Mesh(new THREE.ConeGeometry(4, 8, 4), techo); a.position.set(x, 34, 6); g.add(a); }
    // Daliborka y la Torre Blanca
    g.add(cil(7, 7, 24, 0xd9cfbc, 175, 0, 50, 12)); { const a = new THREE.Mesh(new THREE.ConeGeometry(8, 10, 12), techo); a.position.set(175, 29, 50); g.add(a); }
    return { g, r: 150 };
  },
  tyn() { // la Plaza de la Ciudad Vieja: la iglesia de Týn, la torre del Ayuntamiento con el reloj astronómico y el monumento a Jan Hus
    const g = new THREE.Group(), gris = M(0x6a655d), techo = M(0x33302d), oro = M(0xe9c25a, { metalness: .8, roughness: .3 });
    // Týn, al este (detrás de una fila de casas)
    g.add(caja(26, 30, 50, 0xb9b0a0, 110, 0, -5)); { const t = new THREE.Mesh(prismaGeo(), techo); t.scale.set(28, 16, 52); t.rotation.y = Math.PI / 2; t.scale.set(52, 16, 28); t.position.set(110, 30, -5); g.add(t); }
    for (const z of [-16, 10]) { g.add(caja(12, 50, 12, gris, 92, 0, z)); const a = new THREE.Mesh(new THREE.ConeGeometry(7.5, 30, 8), techo); a.position.set(92, 65, z); g.add(a); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.2, 9, 6), techo); p.position.set(92 + dx * 5, 55, z + dz * 5); g.add(p); } g.add(esfera(1.2, oro, 92, 81, z)); }
    g.add(caja(10, 18, 44, 0xe7d9bd, 78, 0, -3)); // casas delante (la escuela de Týn)
    // Ayuntamiento y su torre con el reloj astronómico (orloj)
    g.add(caja(40, 18, 22, 0xe1d7c2, -60, 0, 60)); { const t = new THREE.Mesh(prismaGeo(), M(0x8e3e2c)); t.scale.set(40, 7, 22); t.position.set(-60, 18, 60); g.add(t); }
    g.add(caja(11, 66, 11, 0x8a7f70, -38, 0, 52)); { const a = new THREE.Mesh(new THREE.ConeGeometry(7, 12, 4), techo); a.rotation.y = Math.PI / 4; a.position.set(-38, 72, 52); g.add(a); }
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6, 6), techo); p.position.set(-38 + dx * 6, 69, 52 + dz * 6); g.add(p); }
    const orloj = cil(3.4, 3.4, .5, brillo(0x2d5d8c), -38, 22, 57.9, 24); orloj.rotation.x = Math.PI / 2; g.add(orloj);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(3.4, .35, 6, 24), oro); anillo.position.set(-38, 22, 58.3); g.add(anillo);
    const aguja = caja(.4, 3, .2, oro, -38, 22, 58.5); g.add(aguja);
    // Jan Hus en el centro de la plaza
    g.add(caja(16, 3, 9, 0x7f7a70, 10, 0, 0)); g.add(caja(3, 6, 3, M(0x3f5b4f), 10, 3, 0)); for (let i = 0; i < 5; i++) g.add(cil(.8, 1, 4, M(0x3f5b4f), 2 + i * 4, 3, 2.5, 6));
    return { g, r: 70, anim(t) { aguja.rotation.z = -t * .5; } };
  },
  petrin() { // la torre mirador de Petřín: una pequeña Torre Eiffel de hierro sobre la colina
    const g = new THREE.Group(), hierro = M(0x6a5f52, { metalness: .5, roughness: .5 }), H = 60;
    const pata = (a) => { const b = 7, t = 1.6; const p = new THREE.Vector3(Math.cos(a) * b, 0, Math.sin(a) * b), q = new THREE.Vector3(Math.cos(a) * t, H, Math.sin(a) * t); const l = p.distanceTo(q); const m = new THREE.Mesh(new THREE.BoxGeometry(.8, l, .8), hierro); m.position.copy(p).add(q).multiplyScalar(.5); m.lookAt(q); m.rotateX(Math.PI / 2); g.add(m); };
    for (let i = 0; i < 8; i++) pata(i * Math.PI / 4 + Math.PI / 8);
    for (let k = 1; k < 7; k++) { const y = k * 9, r = 7 - (7 - 1.6) * y / H; const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .35, 4, 8), hierro); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
    g.add(cil(3.6, 3.6, 3, hierro, 0, 51, 0, 8)); g.add(cil(2.6, 2.6, 2.6, hierro, 0, 60, 0, 8)); g.add(cil(.3, .3, 8, 0x222222, 0, 62, 0, 4));
    g.add(cil(6, 6, 4, 0xe2d6bd, 0, 0, 0, 8)); // el pabellón de la base
    return { g, r: 18 };
  },
  vysehrad() { // Vyšehrad: la basílica de San Pedro y San Pablo, con sus dos agujas oscuras, sobre la roca y las murallas
    const g = new THREE.Group(), piedra = M(0xa59b88), osc = M(0x2f3a35), verde = M(0x5a7d6b, { metalness: .3 });
    g.add(caja(70, 26, 26, piedra, 0, 0, 0)); { const t = new THREE.Mesh(prismaGeo(), verde); t.scale.set(72, 10, 28); t.position.y = 26; g.add(t); }
    for (const z of [-7, 7]) { g.add(caja(9, 44, 9, piedra, -38, 0, z)); const a = new THREE.Mesh(new THREE.ConeGeometry(5.5, 26, 8), osc); a.position.set(-38, 57, z); g.add(a); }
    g.add(cil(12, 12, 22, piedra, 38, 0, 0, 12));
    // murallas en zigzag con baluartes
    const mur = M(0x8b7f6b);
    for (const [x, z, w, d] of [[-60, 70, 160, 6], [70, 40, 6, 120], [-140, 10, 6, 120], [-60, -60, 160, 6]]) g.add(caja(w, 10, d, mur, x, 0, z));
    return { g, r: 90 };
  },
  zizkov() { // la torre de televisión de Žižkov: tres columnas, cabinas y la antena (en «Předtucha», ya sin los bebés de plástico)
    const g = new THREE.Group(), gris = M(0xb9bec4, { metalness: .4, roughness: .4 }), osc = M(0x5c6168, { metalness: .5 });
    const cols = [[0, 0, 6.5, 216], [-11, 6, 4.2, 134], [11, 6, 4.2, 134]];
    for (const [x, z, r, h] of cols) g.add(cil(r, r, h, gris, x, 0, z, 16));
    g.add(caja(26, 6, 14, gris, 0, 0, 4));
    for (const [y, w] of [[63, 22], [93, 26], [130, 18]]) { g.add(caja(w, 10, 12, osc, 0, y, 4)); g.add(caja(w + .2, 2, 12.2, brillo(0x9fd3ff), 0, y + 4, 4)); }
    g.add(cil(1.4, 1.4, 20, gris, 0, 216, 0, 8));
    const luz = esfera(1.3, brillo(0xff3030), 0, 237, 0); g.add(luz);
    return { g, r: 30, anim(t) { luz.visible = Math.sin(t * 3) > 0; } };
  },
  mikulas() { // San Nicolás de Malá Strana: la gran cúpula verde y el campanario
    const g = new THREE.Group(), bl = M(0xefe6d2), verde = M(0x5c8c78, { metalness: .35, roughness: .45 });
    g.add(caja(60, 26, 34, bl)); { const t = new THREE.Mesh(prismaGeo(), M(0x6d8a7b)); t.scale.set(62, 9, 36); t.position.y = 26; g.add(t); }
    g.add(cil(13, 13, 14, bl, 16, 26, 0, 16)); g.add(esfera(13, verde, 16, 40, 0, {}, [16, 10, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(2.5, 2.5, 8, verde, 16, 52, 0, 8));
    g.add(caja(10, 52, 10, bl, 40, 0, 10)); g.add(esfera(6, verde, 40, 52, 10, {}, [12, 8, 0, Math.PI * 2, 0, Math.PI / 2])); g.add(cil(1.5, 2.5, 10, verde, 40, 57, 10, 8));
    return { g, r: 40 };
  },
  'faro-ruina'() { // el viejo faro en ruinas de «Звёздный роман»: torre de piedra rota, signos dorados y el cristal azul bajo la cúpula
    const g = new THREE.Group(), piedra = M(0x9b9488), osc = M(0x6f6a62), oro = brillo(0xf5c35a), azul = brillo(0x6fc8ff);
    g.add(cil(9, 11, 4, osc, 0, 0, 0, 16));
    g.add(cil(6.5, 8.5, 34, piedra, 0, 4, 0, 14));
    for (let i = 0; i < 6; i++) { const a = i * 1.05; g.add(caja(1.6, 3, .5, 0x2b2a28, Math.cos(a) * 7.6, 10 + (i % 3) * 8, Math.sin(a) * 7.6)); }
    // la linterna rota: medio anillo de pilares y la cúpula partida
    g.add(cil(7, 7, 1.4, osc, 0, 38, 0, 14));
    for (let i = 0; i < 5; i++) { const a = i * .9; g.add(caja(.8, 6 - (i % 2) * 2, .8, osc, Math.cos(a) * 5.5, 39.4, Math.sin(a) * 5.5)); }
    g.add(esfera(5.6, osc, 0, 45, 0, {}, [12, 8, 0, Math.PI * 1.2, 0, Math.PI / 2]));
    const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(1.8), azul); cristal.position.set(0, 42, 0); g.add(cristal);
    // signos dorados que aparecieron en las paredes
    for (let i = 0; i < 10; i++) { const a = i * .63; g.add(caja(.4, 1.6, .3, oro, Math.cos(a) * 8.2, 8 + (i * 7 % 22), Math.sin(a) * 8.2)); }
    // piedras caídas del pedazo que explotó
    for (let i = 0; i < 7; i++) g.add(caja(2 + i % 3, 1.5, 2, piedra, -14 + i * 4.5, 0, 12 + (i % 2) * 4));
    return { g, r: 26, anim(t) { cristal.rotation.y = t * .8; cristal.position.y = 42 + Math.sin(t * 1.5) * .4; } };
  },
  'piedra-negra'() { // la estrella caída: piedra negra con vetas azules en un círculo quemado
    const g = new THREE.Group();
    const quemado = cil(26, 26, .3, 0x2c2620, 0, 0, 0, 24); g.add(quemado);
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 0), M(0x16171c, { metalness: .6, roughness: .25 })); p.position.y = 3.5; p.scale.set(1.3, .8, 1); g.add(p);
    for (let i = 0; i < 5; i++) { const v = caja(.3, .3, 6, brillo(0x4fa8ff), 0, 3.5 + (i - 2) * .9, 0); v.rotation.y = i * .7; g.add(v); }
    for (let i = 0; i < 9; i++) { const a = i * .7; const r = caja(.5, .5, 9, 0x3a3027, Math.cos(a) * 15, .3, Math.sin(a) * 15); r.rotation.y = a; g.add(r); }
    return { g, r: 26 };
  },
  'templo-corazon'() { // el templo central de la Atlántida con el Corazón del Mundo flotando, golden
    const g = new THREE.Group(), bl = M(0xf6f8fa, { roughness: .35 }), cristal = new THREE.MeshStandardMaterial({ color: 0xbfefff, transparent: true, opacity: .55, metalness: .3, roughness: .05 });
    g.add(cil(70, 80, 6, bl, 0, 0, 0, 32));
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.add(cil(2.2, 2.6, 34, bl, Math.cos(a) * 52, 6, Math.sin(a) * 52, 10)); }
    g.add(new THREE.Mesh(new THREE.TorusGeometry(52, 3, 6, 40), bl)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; g.children[g.children.length - 1].position.y = 41;
    const cup = esfera(50, cristal, 0, 42, 0, {}, [32, 16, 0, Math.PI * 2, 0, Math.PI / 2]); g.add(cup);
    const nucleo = new THREE.Mesh(new THREE.IcosahedronGeometry(11, 1), new THREE.MeshStandardMaterial({ color: 0xffd36a, emissive: 0xffb02e, emissiveIntensity: 1.4, flatShading: true })); nucleo.position.y = 52; g.add(nucleo);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(18, .8, 6, 40), brillo(0xffe28a)); halo.position.y = 52; g.add(halo);
    return { g, r: 90, anim(t) { nucleo.rotation.y = t * .4; nucleo.rotation.x = t * .2; nucleo.position.y = 52 + Math.sin(t) * 2; halo.rotation.x = Math.PI / 2 + Math.sin(t * .5) * .4; halo.rotation.y = t * .3; } };
  },
  'torres-caracola'() { // torres de piedra blanca y de cristal «como enormes caracolas brillantes»
    const g = new THREE.Group(), bl = M(0xf3f6f8, { roughness: .3 }), cr = new THREE.MeshStandardMaterial({ color: 0x9fe3f0, transparent: true, opacity: .7, metalness: .4, roughness: .05 });
    const caracola = (x, z, h, r, mat) => { const q = new THREE.Group(); const n = 9; for (let k = 0; k < n; k++) { const t = k / n; const c = new THREE.Mesh(new THREE.ConeGeometry(r * (1 - t * .85), h / n * 1.8, 10), mat); c.position.y = h * t + h / n; c.rotation.y = k * .6; c.position.x = Math.cos(k * 1.3) * r * .15 * (1 - t); q.add(c); } q.position.set(x, 0, z); g.add(q); };
    caracola(0, 0, 90, 14, bl); caracola(30, 18, 64, 10, cr); caracola(-28, 14, 70, 11, bl); caracola(10, -32, 54, 9, cr); caracola(-12, -20, 40, 8, bl);
    return { g, r: 50 };
  },
  'portal-azul'() { // el portal de luz azul, «una puerta tranquila de luz»
    const g = new THREE.Group(), anillo = new THREE.Mesh(new THREE.TorusGeometry(14, 1.6, 10, 48), new THREE.MeshStandardMaterial({ color: 0x8fd8ff, emissive: 0x3aa8ff, emissiveIntensity: 1.5 }));
    anillo.position.y = 17; anillo.rotation.y = Math.PI / 2; g.add(anillo);
    const velo = new THREE.Mesh(new THREE.CircleGeometry(13, 40), new THREE.MeshBasicMaterial({ color: 0x9fe6ff, transparent: true, opacity: .45, side: THREE.DoubleSide })); velo.position.y = 17; velo.rotation.y = Math.PI / 2; g.add(velo);
    g.add(cil(16, 18, 1.5, M(0xeef4f6), 0, 0, 0, 24));
    return { g, r: 22, anim(t) { velo.material.opacity = .35 + Math.sin(t * 2) * .12; anillo.rotation.x = Math.sin(t * .7) * .05; } };
  },
  'nave-enemiga'() { // la nave de los que destruyeron la Atlántida, escondida en las nubes sobre el mar
    const g = new THREE.Group(), osc = M(0x22252d, { metalness: .7, roughness: .35 }), rojo = brillo(0xff3b3b);
    const casco = new THREE.Mesh(new THREE.ConeGeometry(36, 150, 6), osc); casco.rotation.z = Math.PI / 2; casco.scale.set(1, 1, .45); casco.position.y = 300; g.add(casco);
    for (const s of [-1, 1]) { const ala = caja(60, 3, 30, osc, 25, 296, s * 30); ala.rotation.x = s * .25; g.add(ala); g.add(esfera(2.4, rojo, 50, 296, s * 42)); }
    g.add(caja(30, 12, 18, osc, 40, 312, 0));
    for (let i = 0; i < 4; i++) g.add(esfera(1.8, rojo, -40 + i * 22, 292, 0));
    const nube = new THREE.MeshBasicMaterial({ color: 0xf2f4f8, transparent: true, opacity: .55, depthWrite: false });
    for (let i = 0; i < 9; i++) g.add(esfera(26 + (i % 3) * 10, nube, -90 + i * 24, 285 + (i % 2) * 14, (i % 3 - 1) * 26));
    return { g, r: 0, anim(t) { g.position.y = Math.sin(t * .4) * 6; } };
  },
  'roca-llave'() { // la roca muy grande de la entrada, con el agujero de la llave y la puerta secreta
    const g = new THREE.Group(), roca = new THREE.MeshStandardMaterial({ color: 0x8d8579, roughness: 1, flatShading: true });
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(16, 1), roca); r.position.y = 11; r.scale.set(1.3, 1, 1); g.add(r);
    g.add(caja(6, 9, 1, 0x2a2016, 0, 0, 13.5)); // la puerta que aparece cuando la roca se mueve
    g.add(esfera(.6, brillo(0xf2c75a), 4, 7, 14.6));
    for (const s of [-1, 1]) { g.add(cil(.25, .25, 3, 0x3a2b1c, s * 5, 5, 14, 5)); g.add(esfera(.7, brillo(0xffa040), s * 5, 8.4, 14)); }
    return { g, r: 22 };
  },
  'torre-bandera'() { // la torre más alta de la Ciudad Secreta: desde ahí Carlos mueve la bandera roja
    const g = new THREE.Group(), bl = M(0xfbf7ee);
    g.add(cil(7, 8, 60, bl, 0, 0, 0, 16));
    for (let k = 1; k < 5; k++) g.add(cil(8.4, 8.4, 1, M(0xe6dcc6), 0, k * 12, 0, 16));
    g.add(cil(9, 9, 3, bl, 0, 60, 0, 16)); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.add(caja(1.4, 2.5, 1.4, bl, Math.cos(a) * 8.4, 63, Math.sin(a) * 8.4)); }
    const tejado = new THREE.Mesh(new THREE.ConeGeometry(8, 14, 16), M(0xd8b96a, { metalness: .5, roughness: .4 })); tejado.position.y = 70; g.add(tejado);
    g.add(cil(.25, .25, 10, 0x333333, 5, 63, 0, 5));
    const bandera = caja(5, 3, .2, M(0xd8262b), 7.5, 70, 0); g.add(bandera);
    return { g, r: 16, anim(t) { bandera.rotation.y = Math.sin(t * 6) * .35; } };
  },
  'mesas-trampa'() { // la plaza central: el lugar alto de Julián y las mesas largas con pan, queso, fruta y vino dulce
    const g = new THREE.Group(), madera = M(0x8a5a32), piedra = M(0xe9e0cc);
    g.add(cil(9, 10, 2.5, piedra, 0, 0, 0, 16)); g.add(cil(5, 6, 2.5, piedra, 0, 2.5, 0, 16));
    for (let f = 0; f < 3; f++) {
      const z = -22 + f * 22; g.add(caja(36, .5, 3.4, madera, 0, 2.2, z));
      for (const x of [-16, 0, 16]) g.add(caja(.5, 2.2, 3, madera, x, 0, z));
      for (let i = 0; i < 10; i++) { const x = -16 + i * 3.5; g.add(cil(.25, .3, 1.1, i % 2 ? M(0x5b1222) : M(0x2f5a2a), x, 2.7, z + .6, 6)); g.add(esfera(.45, i % 3 ? M(0xe8b04a) : M(0xd8442b), x + 1.2, 2.9, z - .7)); }
    }
    return { g, r: 40 };
  },
  'palacio-hielo'() { // el palacio de hielo de Sofía y Román sobre el fiordo: galerías, torres con agujas y la torre de la cúpula
    const g = new THREE.Group();
    const hielo = new THREE.MeshPhysicalMaterial({ color: 0xcfeefa, transparent: true, opacity: .78, roughness: .08, metalness: .05, clearcoat: 1, emissive: 0x16384a, emissiveIntensity: .25 });
    const hielo2 = new THREE.MeshPhysicalMaterial({ color: 0xe9f8ff, transparent: true, opacity: .9, roughness: .15, clearcoat: 1 });
    const azul = new THREE.MeshStandardMaterial({ color: 0x8fd0ff, emissive: 0x2a7fd0, emissiveIntensity: .5, transparent: true, opacity: .85 });
    g.add(caja(110, 6, 70, hielo2, 0, 0, 0));
    g.add(caja(80, 26, 34, hielo, 0, 6, 0));                      // el cuerpo con la sala de música
    for (const s of [-1, 1]) g.add(caja(26, 18, 60, hielo, s * 46, 6, 6)); // alas
    g.add(caja(70, 10, 6, hielo2, 0, 32, -17));                   // galería sobre el fiordo
    for (let i = 0; i < 8; i++) g.add(cil(1.2, 1.2, 10, hielo2, -32 + i * 9, 32, -19, 8));
    // la gran ventana del norte, que mira a la llanura blanca
    g.add(caja(16, 14, .6, azul, 0, 12, 17.4));
    const torre = (x, z, h, r, punta) => { g.add(cil(r, r * 1.08, h, hielo, x, 6, z, 12)); const a = new THREE.Mesh(new THREE.ConeGeometry(r * 1.15, punta, 12), hielo2); a.position.set(x, 6 + h + punta / 2, z); g.add(a); };
    torre(-46, -26, 34, 6, 22); torre(46, -26, 30, 6, 20); torre(-46, 34, 28, 5, 18); torre(46, 34, 26, 5, 18); torre(-20, 18, 40, 4, 16); torre(24, 18, 36, 4, 16);
    // la torre más alta, con la cúpula transparente de donde salió el fénix
    g.add(cil(9, 10, 58, hielo, 0, 6, -4, 16));
    g.add(esfera(10, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: 0, clearcoat: 1 }), 0, 64, -4, {}, [24, 12, 0, Math.PI * 2, 0, Math.PI / 2]));
    const brillo1 = esfera(2.2, brillo(0xbfe8ff), 0, 68, -4); g.add(brillo1);
    // escalinata de hielo hacia el muelle
    for (let i = 0; i < 8; i++) g.add(caja(18, 1.4, 4, hielo2, 0, -i * 1.8, -38 - i * 4));
    return { g, r: 70, anim(t, n) { brillo1.scale.setScalar(1 + Math.sin(t * 1.4) * .25); hielo.emissiveIntensity = .25 + n * .6; } };
  },
  'isla-guardiana'() { // la Guardiana de Piedra sobre su isla negra, con las manos abiertas
    const g = new THREE.Group(), piedra = M(0x6c6a66), osc = M(0x45443f);
    g.add(caja(10, 6, 8, osc, 0, 0, 0));
    g.add(cil(3.6, 5, 16, piedra, 0, 6, 0, 10));               // falda
    g.add(cil(2.6, 3.4, 9, piedra, 0, 22, 0, 10));             // torso
    g.add(esfera(2.4, piedra, 0, 33, 0));                     // cabeza
    for (const s of [-1, 1]) { const b = caja(8, 1.6, 1.6, piedra, s * 5.5, 28, 1); b.rotation.z = s * .5; g.add(b); }
    g.add(esfera(1.3, brillo(0xffd27a), 0, 24, 3)); // la luz dorada que salió de la montaña
    return { g, r: 0 };
  },
  'muralla-norte'() { // la muralla clara que va «del fiordo a las rocas», con su campanario y la campana de cobre
    const g = new THREE.Group(), piedra = M(0xd9dde0), hielo = new THREE.MeshPhysicalMaterial({ color: 0xd8f2ff, transparent: true, opacity: .85, roughness: .1, clearcoat: 1 }), cobre = M(0xb87333, { metalness: .7, roughness: .35 });
    const L0 = -850, L1 = 700; // de la orilla del fiordo a las peñas (relativo al marcador)
    g.add(caja(8, 9, L1 - L0, piedra, 0, 0, -(L0 + L1) / 2));
    for (let z = L0; z <= L1; z += 22) g.add(caja(8.6, 1.6, 6, piedra, 0, 9, -z));       // almenas
    for (let z = L0 + 40; z < L1; z += 180) { g.add(cil(7, 7.5, 16, piedra, 0, 0, -z, 12)); const c = new THREE.Mesh(new THREE.ConeGeometry(8, 8, 12), hielo); c.position.set(0, 20, -z); g.add(c); }
    // las líneas de notas y arpas que Román hizo aparecer en la piedra
    for (let k = 0; k < 5; k++) g.add(caja(.4, .3, L1 - L0, brillo(0x9fd6ff), -4.3, 3 + k * .9, -(L0 + L1) / 2));
    // el campanario, la torre más alta, con la campana que sonará sola si vuelve el viento cálido
    g.add(cil(8, 9, 34, piedra, 0, 0, 0, 12)); g.add(caja(12, 7, 12, piedra, 0, 34, 0));
    const campana = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3, 4, 16, 1, true), cobre); campana.position.set(0, 37, 0); g.add(campana);
    const t = new THREE.Mesh(new THREE.ConeGeometry(9, 12, 12), hielo); t.position.set(0, 47, 0); g.add(t);
    return { g, r: 0 };
  },
  campamento() { // el campamento abandonado de los nómadas en la llanura: tiendas de cuero, banderas de crin, fogatas apagadas
    const g = new THREE.Group(), cuero = M(0x8a7a62), cuero2 = M(0x6e604d);
    for (let i = 0; i < 46; i++) { const a = i * 2.39, r = 20 + Math.sqrt(i) * 34; const x = Math.cos(a) * r, z = Math.sin(a) * r * .8;
      const t = new THREE.Mesh(new THREE.ConeGeometry(5 + (i % 3), 7 + (i % 2) * 2, 8), i % 2 ? cuero : cuero2); t.position.set(x, 3.5, z); t.rotation.z = (i % 5 - 2) * .08; g.add(t); }
    for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(cil(.2, .2, 12, 0x3a2e22, Math.cos(a) * 120, 0, Math.sin(a) * 90, 5)); g.add(caja(3, 2, .1, M(0x2a2420), Math.cos(a) * 120 + 1.5, 10, Math.sin(a) * 90)); }
    return { g, r: 0 };
  },
  'condor-acceso'() { // el Cóndor del Acceso Este: cóndor realista de Cardona sobre el cóndor abstracto de hormigón
    const g = new THREE.Group(), horm = M(0xd8d2c6), negro = M(0x26262a, { roughness: .6 }), blanco = M(0xf2efe8);
    g.add(cil(16, 17, 1.2, 0x9fb07a, 0, 0, 0, 24)); // el predio con césped
    g.add(caja(10, 3, 6, horm, 0, 1.2)); // pedestal
    // el cóndor abstracto: dos planos inclinados de hormigón como alas
    for (const sx of [-1, 1]) { const a = caja(14, 2.4, 5, horm, sx * 6, 7, 0); a.rotation.z = sx * .55; g.add(a); }
    g.add(caja(4, 9, 4.5, horm, 0, 4.2));
    // el cóndor realista posado arriba, con las alas abiertas
    const cuerpo = esfera(2.6, negro, 0, 15.5); cuerpo.scale.set(1, .9, 1.7); g.add(cuerpo);
    g.add(esfera(1.5, blanco, 0, 16.6, 3.2)); // collar blanco
    const cab = esfera(1.1, 0x7a4a3c, 0, 17.4, 4.6); g.add(cab);
    g.add(caja(.6, .5, 1.3, 0xd9c6a0, 0, 17.1, 5.8));
    for (const sx of [-1, 1]) {
      const ala = caja(13, .6, 4.6, negro, sx * 7.6, 16.4, -.3); ala.rotation.z = sx * .16; g.add(ala);
      const pl = caja(4.5, .62, 4.2, blanco, sx * 5.2, 16.5, .1); pl.rotation.z = sx * .16; g.add(pl);
      for (let i = 0; i < 4; i++) { const pd = caja(2.6, .4, .8, negro, sx * (14.6 + i * .2), 17.6 + i * .15, -2 + i * 1.3); pd.rotation.z = sx * .35; g.add(pd); }
    }
    return { g, r: 22 };
  },
  terminal() { // la Terminal del Sol: nave larga de techo curvo y dársenas con micros
    const g = new THREE.Group();
    g.add(caja(150, .5, 70, 0xb9b3a8));
    g.add(caja(130, 9, 26, 0xe2ddd2, 0, 0, -14));
    const bg = new THREE.CylinderGeometry(15, 15, 132, 20, 1, true, 0, Math.PI); bg.rotateZ(Math.PI / 2);
    const techo = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color: 0xb8c4cc, metalness: .35, roughness: .4, side: THREE.DoubleSide }));
    techo.scale.y = .35; techo.position.set(0, 9, -14); techo.castShadow = true; g.add(techo);
    g.add(caja(132, 1, 18, 0x8f969c, 0, 8, 14)); // alero de las dársenas
    for (let i = 0; i < 12; i++) g.add(cil(.5, .5, 8, 0x6c737a, -60 + i * 11, 0, 21, 6));
    const col = [0xc8372d, 0x2f6fb5, 0xe8b23a, 0x3c8a4e, 0xf0f0f0, 0x7a3e9d];
    for (let i = 0; i < 9; i++) { const c = col[i % col.length]; g.add(caja(4, 4.2, 14, c, -52 + i * 13, 0, 27)); g.add(caja(4.1, 1.1, 13, 0x2a3440, -52 + i * 13, 2.4, 27)); }
    g.add(caja(26, 3, .6, 0x1f5f9c, 0, 11, -.6)); // cartel «Terminal del Sol»
    return { g, r: 75 };
  },
  'big-ben'() { // el Palacio de Westminster junto al Támesis, con la torre Elizabeth (Big Ben) en la punta norte
    const g = new THREE.Group(), pie = M(0xc9b48a), osc = M(0x8f7a55), techo = M(0x5d6670), oro = M(0xd9b44a, { metalness: .6, roughness: .35 });
    g.add(caja(70, 2, 270, 0xb8ad98, -10, 0, 135));
    g.add(caja(46, 26, 250, pie, -8, 0, 140)); { const t = new THREE.Mesh(prismaGeo(), techo); t.scale.set(250, 9, 46); t.rotation.y = Math.PI / 2; t.position.set(-8, 26, 140); g.add(t); }
    for (let i = 0; i < 22; i++) { g.add(caja(1.4, 30, 1.4, osc, 15.6, 0, 22 + i * 11)); const a = new THREE.Mesh(new THREE.ConeGeometry(1.2, 6, 4), osc); a.position.set(15.6, 33, 22 + i * 11); g.add(a); }
    for (let i = 0; i < 22; i++) g.add(caja(.4, 14, 5, brillo(0x2a3138), 15.2, 8, 22 + i * 11 + 5));
    g.add(caja(20, 40, 20, pie, -20, 0, 120)); { const c = new THREE.Mesh(new THREE.ConeGeometry(12, 26, 8), techo); c.position.set(-20, 53, 120); g.add(c); } // torre central
    g.add(caja(26, 82, 26, pie, -14, 0, 262)); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(cil(1.6, 1.6, 12, osc, -14 + dx * 12, 82, 262 + dz * 12, 6)); // torre Victoria
    // la torre Elizabeth: fuste, esferas del reloj en las cuatro caras, campanario y aguja
    g.add(caja(12, 56, 12, pie, 0, 0, 0)); g.add(caja(14, 10, 14, osc, 0, 56, 0));
    for (const [rx, x, z] of [[0, 0, 7.1], [0, 0, -7.1], [Math.PI / 2, 7.1, 0], [Math.PI / 2, -7.1, 0]]) { const c = new THREE.Mesh(new THREE.CircleGeometry(4.6, 24), brillo(0xf3ecd2)); c.position.set(x, 61, z); c.rotation.y = rx + (z < 0 || x < 0 ? Math.PI : 0); g.add(c); }
    g.add(caja(12, 8, 12, pie, 0, 66, 0)); g.add(caja(9, 6, 9, osc, 0, 74, 0));
    const ag = new THREE.Mesh(new THREE.ConeGeometry(6.6, 18, 4), techo); ag.rotation.y = Math.PI / 4; ag.position.set(0, 89, 0); g.add(ag); g.add(esfera(.9, oro, 0, 99, 0));
    return { g, r: 60 };
  },
  buckingham() { // el palacio de Buckingham con el Victoria Memorial delante, donde la furgoneta quedó abandonada
    const g = new THREE.Group(), pie = M(0xe4dccb), techo = M(0x8a8f92), oro = M(0xe2bb4a, { metalness: .7, roughness: .3 }), roja = M(0xb3262b);
    g.add(caja(150, 24, 34, pie, 0, 0, 0)); g.add(caja(34, 24, 120, pie, -58, 0, 0)); g.add(caja(34, 24, 120, pie, 58, 0, 0)); g.add(caja(150, 24, 30, pie, 0, 0, -48));
    for (let i = 0; i < 6; i++) g.add(cil(1.3, 1.3, 16, pie, -25 + i * 10, 5, 18, 10)); g.add(caja(62, 6, 4, pie, 0, 21, 18)); { const fr = new THREE.Mesh(prismaGeo(), M(0xd8cfbd)); fr.scale.set(40, 6, 5); fr.position.set(0, 27, 18); g.add(fr); }
    for (let i = 0; i < 18; i++) for (let f = 0; f < 3; f++) g.add(caja(3.2, 4.2, .4, brillo(0x2b2e33), -68 + i * 8, 3 + f * 7, 17.3));
    g.add(cil(.4, .4, 18, 0x555555, 0, 30, 0, 6)); g.add(caja(8, 5, .3, roja, 4, 42, 0));
    g.rotation.y = -Math.PI / 2; // la fachada mira al este, hacia el Mall
    const mem = new THREE.Group(); mem.add(cil(22, 24, 3, 0xd9d3c4, 0, 0, 0, 24)); mem.add(caja(10, 16, 10, 0xece6d8, 0, 3, 0)); mem.add(cil(3, 4, 8, 0xece6d8, 0, 19, 0, 8)); mem.add(esfera(2.6, oro, 0, 29, 0));
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; mem.add(esfera(.8, 0xc0352f, Math.cos(a) * 30, 1.6, Math.sin(a) * 30)); mem.add(cil(.25, .25, 2.2, 0x101010, Math.cos(a) * 30, 0, Math.sin(a) * 30, 5)); } // la guardia
    mem.position.set(120, 0, 0); g.add(mem);
    return { g, r: 70 };
  },
  'residencia-belgrave'() { // la residencia del embajador argentino: casa de estuco blanco con pórtico, bandera y el jardín del ventanal
    const g = new THREE.Group(), blanco = M(0xf2efe8), gris = M(0x6d7278), celeste = M(0x75aadb), sol = M(0xf2c14e, { emissive: 0x6b4a00 });
    g.add(caja(46, 22, 26, blanco, 0, 0, 0)); g.add(caja(47, 1.2, 27, 0xdcd6ca, 0, 22, 0)); g.add(caja(44, 4, 24, gris, 0, 23.2, 0));
    for (let f = 0; f < 4; f++) for (let i = 0; i < 7; i++) g.add(caja(2.6, f ? 3.2 : 4.4, .4, f === 1 ? brillo(0xffe2a8) : brillo(0x3a3f45), -18 + i * 6, 2 + f * 5.2, 13.2));
    for (let i = 0; i < 4; i++) g.add(cil(.8, .8, 9, blanco, -6 + i * 4, 0, 16, 10)); g.add(caja(16, 1.4, 6, blanco, 0, 9, 15.5));
    g.add(cil(.25, .25, 12, 0x444444, 0, 27, 0, 6));
    g.add(caja(.2, 1.4, 6, celeste, 0, 37, 3)); g.add(caja(.2, 1.4, 6, M(0xffffff), 0, 35.6, 3)); g.add(caja(.2, 1.4, 6, celeste, 0, 34.2, 3)); g.add(esfera(.45, sol, .15, 36.3, 3));
    g.add(caja(46, .4, 22, 0x86a96a, 0, 0, -24)); g.add(caja(10, 7, .3, brillo(0x9bc0d8), 0, 1, -13.2)); // el jardín y el ventanal por donde salieron los cuadros
    for (const [x, z] of [[-16, -28], [14, -30], [-4, -34]]) { g.add(cil(.4, .5, 3, 0x6b4a2f, x, 0, z, 6)); g.add(esfera(3, 0x5f8f4c, x, 5, z)); }
    return { g, r: 30 };
  },
  'amber-brush'() { // The Amber Brush: café de esquina verde botella con letrero dorado, el estudio arriba y el sótano de la caldera
    const g = new THREE.Group(), verde = M(0x1f4a35), ladr = M(0xb9a68a), oro = M(0xd9ad3c, { metalness: .6, roughness: .35, emissive: 0x3d2a00 });
    g.add(caja(18, 13, 14, ladr, 0, 4, 0)); g.add(caja(18.4, 4.2, 14.4, verde, 0, 0, 0));
    g.add(caja(12, 1.1, .3, oro, 0, 4.4, 7.3)); g.add(caja(.3, 1.1, 9, oro, 9.3, 4.4, 0));
    for (const [x, z, ry] of [[-4, 7.25, 0], [3, 7.25, 0], [9.25, -2, Math.PI / 2]]) { const v = caja(4, 2.6, .2, brillo(0xffc979), x, .7, z); v.rotation.y = ry; g.add(v); }
    for (let f = 0; f < 2; f++) for (let i = 0; i < 3; i++) g.add(caja(2.4, 2.8, .2, f ? brillo(0x343b40) : brillo(0xf1d7a2), -5 + i * 5, 6.2 + f * 5, 7.1));
    g.add(caja(19, .6, 15, 0x4a4f55, 0, 17, 0)); g.add(cil(.6, .6, 3, 0x7a5a48, 6, 17.6, -3, 8));
    // el caballete en la vereda y la boina mostaza de Lucy en el perchero de la puerta
    g.add(cil(.12, .12, 4, 0x6b4a2f, -9, 0, 9, 4)); g.add(caja(2.2, 1.6, .15, M(0xfaf6ea), -9, 2.4, 9.1));
    g.scale.setScalar(1.6);
    return { g, r: 26 };
  },
  'faders-relics'() { // Fader's Relics en Portobello Road: casas de colores, la tienda de antigüedades y los puestos
    const g = new THREE.Group(), cols = [0xe9a3b8, 0x9fd0e0, 0xf3dd8a, 0xb6d8a8, 0xd9c2ea, 0xf2b98a];
    cols.forEach((c, i) => { g.add(caja(7.6, 12 + (i % 2) * 1.5, 12, c, -22 + i * 8, 0, 0)); g.add(caja(7.8, .5, 12.2, 0xf4f1ea, -22 + i * 8, 12 + (i % 2) * 1.5, 0)); for (let f = 0; f < 2; f++) g.add(caja(2.2, 2.4, .2, brillo(f ? 0x3b4248 : 0xf3dcab), -22 + i * 8, 5 + f * 3.8, 6.1)); });
    g.add(caja(7.8, 3.6, .3, M(0x3a2a20), -6, 0, 6.2)); g.add(caja(6.6, .9, .3, M(0xd8b04a, { emissive: 0x3a2a00 }), -6, 3.7, 6.3)); // la vidriera y el cartel
    for (let i = 0; i < 5; i++) { const x = -20 + i * 9, aw = [0xc0392b, 0x2e6da4, 0x2f8a52, 0xd9a400, 0x7b3f9d][i]; g.add(caja(4, 1.4, 2.2, 0x8a6a4a, x, 0, 11)); g.add(caja(4.4, .2, 2.8, aw, x, 2.6, 11)); for (const dx of [-2, 2]) g.add(cil(.08, .08, 2.6, 0x333333, x + dx, 0, 12.2, 4)); }
    g.scale.setScalar(1.4);
    return { g, r: 36 };
  },
  'lucy-caballete'() { // la orilla del Támesis donde Lucy pinta retratos: caballete, banco y faroles de delfines
    const g = new THREE.Group(), mostaza = M(0xc9962e), negro = M(0x1d1d1f);
    for (const dx of [-.8, .8]) { const p = cil(.07, .07, 3.4, 0x6b4a2f, dx, 0, 0, 4); p.rotation.z = dx * -.12; g.add(p); }
    g.add(caja(2.4, 1.8, .1, M(0xfdfbf3), 0, 1.8, .15)); g.add(caja(2.2, .5, .12, M(0x5f7fb8), 0, 2.1, .2)); g.add(caja(2.2, .3, .12, M(0x7d5aa6), 0, 2.6, .2));
    g.add(cil(.35, .45, 1.5, mostaza, 1.8, 0, .8, 8)); g.add(esfera(.32, M(0xf2d5bf), 1.8, 1.8, .8)); g.add(cil(.36, .36, .12, negro, 1.8, 2.05, .8, 10));
    g.add(caja(3, .5, .8, 0x4b3a2a, -3.5, .4, 1));
    for (const x of [-8, 8]) { g.add(cil(.15, .22, 4.5, 0x2a3a35, x, 0, -1.5, 6)); g.add(esfera(.45, brillo(0xffe2a0), x, 4.8, -1.5)); }
    return { g, r: 6 };
  },
  'iglesia-cotswolds'() { // «el castillo»: iglesia normanda de piedra color miel con el ala fortificada y la torre almenada, entre robles
    const g = new THREE.Group(), miel = M(0xc9a66b), osc = M(0x6f5a3c);
    g.add(caja(34, 12, 14, miel, 0, 0, 0)); { const t = new THREE.Mesh(prismaGeo(), M(0x6d6458)); t.scale.set(34, 6, 15); t.position.set(0, 12, 0); g.add(t); }
    g.add(cil(7, 7, 11, miel, 17, 0, 0, 12));
    g.add(caja(16, 15, 22, miel, -24, 0, 4)); for (let i = 0; i < 6; i++) g.add(caja(2, 2, 2, miel, -31 + i * 2.8, 15, -7)); // el ala del siglo XVII
    g.add(caja(10, 26, 10, miel, -36, 0, -6)); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) g.add(caja(2, 2.4, 2, miel, -36 + dx * 4, 26, -6 + dz * 4));
    for (let i = 0; i < 4; i++) g.add(caja(.6, 3, 1.2, brillo(0xffd28a), -16.8, 4 + (i % 2) * 5, -2 + i * 3));
    for (let i = 0; i < 9; i++) g.add(caja(1, 1.5 + (i % 3) * .3, .3, M(0x8a8f86), 6 + (i % 3) * 4, 0, 12 + Math.floor(i / 3) * 4)); // lápidas con musgo
    for (let i = 0; i < 9; i++) { const a = i * .7, r = 46 + (i % 3) * 8; g.add(cil(.8, 1.1, 6, 0x5a4330, Math.cos(a) * r, 0, Math.sin(a) * r, 6)); g.add(esfera(7 + (i % 2) * 2, 0x4f6e3a, Math.cos(a) * r, 11, Math.sin(a) * r)); }
    return { g, r: 50 };
  },
  'puerta-alcala'() { // la Puerta de Alcalá de Sabatini (1778): cinco vanos, tres arcos y dos adintelados, con el ático y los trofeos
    const g = new THREE.Group(), gran = M(0xd9cfbd), osc = M(0xb5a990);
    g.add(caja(46, 1, 12, 0xbdb3a1, 0, 0, 0));
    for (let i = 0; i < 6; i++) g.add(caja(3.4, 15, 8, gran, -20 + i * 8, 1, 0));
    for (let i = 0; i < 5; i++) { const x = -16 + i * 8; if (i > 0 && i < 4) { const ar = new THREE.Mesh(new THREE.TorusGeometry(2.4, .7, 6, 12, Math.PI), osc); ar.position.set(x, 11, 4.1); g.add(ar); const b = ar.clone(); b.position.z = -4.1; g.add(b); } }
    g.add(caja(44, 4, 8.4, gran, 0, 16, 0)); g.add(caja(16, 5, 8, gran, 0, 20, 0)); g.add(caja(46, .8, 9, osc, 0, 15.8, 0));
    for (const x of [-18, -6, 6, 18]) g.add(esfera(1.2, osc, x, 21, 0));
    g.add(caja(8, 3, 3, osc, 0, 25, 0));
    return { g, r: 26 };
  },
  cibeles() { // la fuente de Cibeles: la diosa en su carro tirado por dos leones
    const g = new THREE.Group(), marm = M(0xe8e2d6), agua = new THREE.MeshStandardMaterial({ color: 0x7fb7d4, roughness: .15, metalness: .1 });
    g.add(cil(16, 17, 1.4, marm, 0, 0, 0, 28)); g.add(cil(15, 15, .3, agua, 0, 1.2, 0, 28));
    g.add(caja(8, 3, 5, marm, 0, 1.2, 0)); g.add(caja(5, 4, 4, marm, 1, 4.2, 0));
    const diosa = cil(.9, 1.4, 4, marm, 1.5, 8.2, 0, 10); g.add(diosa); g.add(esfera(.8, marm, 1.5, 12.8, 0)); g.add(cil(.9, .7, .8, M(0xcfc6b4), 1.5, 13.3, 0, 8));
    for (const z of [-1.5, 1.5]) { const le = caja(5, 2.6, 1.6, marm, -5, 3.2, z); g.add(le); g.add(esfera(1.2, marm, -7.6, 6.2, z)); }
    for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) g.add(cil(.1, .25, 3.5, new THREE.MeshBasicMaterial({ color: 0xd6eefa, transparent: true, opacity: .6 }), x * 9, 1.4, z * 9, 6));
    return { g, r: 18 };
  },
  'palacio-cristal'() { // el Palacio de Cristal del Retiro (1887): pabellón de hierro y vidrio junto a su estanque
    const g = new THREE.Group(), vid = new THREE.MeshStandardMaterial({ color: 0xcfe6ef, transparent: true, opacity: .45, metalness: .3, roughness: .1 }), hierro = M(0x3b4a52);
    g.add(caja(60, .3, 46, 0x6f9a5a, 0, 0, 0)); g.add(caja(34, .4, 12, new THREE.MeshStandardMaterial({ color: 0x5c93ad, roughness: .15 }), 0, .1, 20));
    g.add(caja(34, 1.6, 20, M(0xd8c9a8), 0, 0, -4)); g.add(caja(32, 9, 18, vid, 0, 1.6, -4)); g.add(caja(16, 6, 22, vid, 0, 10.6, -4));
    const cup = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), vid); cup.position.set(0, 16.6, -4); g.add(cup);
    for (let i = 0; i <= 8; i++) g.add(caja(.3, 10.6, .3, hierro, -16 + i * 4, 1.6, 5)); g.add(caja(32.4, .4, .4, hierro, 0, 10.6, 5));
    return { g, r: 30 };
  },
  'tren-fantasma'() { return { g: new THREE.Group(), r: 0 }; }
};

function prismaGeo() {
  const g = new THREE.BufferGeometry();
  const v = [-.5, 0, -.5, .5, 0, -.5, 0, 1, -.5, -.5, 0, .5, .5, 0, .5, 0, 1, .5];
  const idx = [0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4, 0, 1, 4, 0, 4, 3], pos = [];
  for (const i of idx) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
}

export function construirHitos(lugares, u) {
  const grupo = new THREE.Group(), anims = [], reservas = [];
  for (const L of lugares) {
    const f = MODELOS[L.modelo] || MODELOS.ninguno;
    const m = f(u);
    const h = L.modelo === 'brecha' ? 0 : Math.max(altura(L.x, L.y), L.modelo === 'faro' ? 2 : 0);
    m.g.position.set(L.x, h, -L.y);
    grupo.add(m.g);
    if (m.anim) anims.push(m.anim);
    if (m.r) reservas.push([L.x, L.y, m.r]);
    L._h = h + ({ pobednik: 24, nebojsa: 33, 'knez-mihailo': 12, 'ruina-bombas': 32, 'hram-sava': 95, 'puente-branko': 18, singer: 55, atlantes: 16, 'columna-alejandro': 45, ermitazh: 28, esfinges: 9, grifones: 6, isaakiy: 90, anichkov: 8, 'museo-ruso': 26, mariinski: 42, 'puente-palacio': 8, poceluev: 8, fundador: 12, cervantes: 36, debod: 14, 'torre-madrid': 144, 'oso-madrono': 10, 'plaza-mayor': 26, cebada: 20, 'biblioteca-nacional': 28, colon: 52, 'banco-espana': 38, metro: 8, 'campanile-sm': 98, 'basilica-sm': 42, ducale: 34, 'ponte-sospiri': 14, rialto: 16, salute: 62, 'san-giorgio': 76, arsenale: 32, anfiteatro: 24, 'monumento-andes': 40, ruinas: 14, usina: 20, 'puerta-alcala': 28, cibeles: 15, 'palacio-cristal': 24, 'big-ben': 100, buckingham: 34, 'residencia-belgrave': 34, 'amber-brush': 32, 'faders-relics': 22, 'lucy-caballete': 6, 'iglesia-cotswolds': 30, 'condor-acceso': 20, terminal: 16, monobloc: 16, 'palacio-hielo': 72, 'isla-guardiana': 36, 'muralla-norte': 50, campamento: 12, 'faro-ruina': 50, 'piedra-negra': 10, 'templo-corazon': 96, 'torres-caracola': 96, 'portal-azul': 34, 'nave-enemiga': 330, 'roca-llave': 28, 'torre-bandera': 80, 'mesas-trampa': 10, 'karluv-most': 22, 'hrad-praga': 92, tyn: 82, petrin: 64, vysehrad: 60, zizkov: 230, mikulas: 62, bodega: 20, aeropuerto: 42, santuario: 46, huertas: 8, invernadero: 12, 'utopia-fortaleza': 82, 'muro-cantor': 22, salon: 16, acacia: 14, 'taller-motos': 12, bunker: 10, campanario: 44, fortaleza: 34, 'puertas-oeste': 20, 'estacion-chica': 14, glorieta: 11, panaderia: 16, cocheras: 12, hotelito: 18, hogar: 18, faro: 50, 'torre-tv': 200, ayuntamiento: 72, rascacielos: 170, estacion: 34, central: 70, planetario: 38, laberinto: 56, iglesia: 46, molino: 24, aerogenerador: 90, 'torre-agua': 42, museo: 24, hotel: 32, ministerio: 40, obelisco: 26, atracciones: 56 }[L.modelo] || 14);
  }
  // reserva extra: la plaza Dante entera y el puerto
  reservas.push(...RESERVAS);
  return { grupo, anims, reservas };
}

/* --------------------------- extras ----------------------------- */

// Delfines que saltan entre el parque marino y el faro
export function crearDelfines() {
  const g = new THREE.Group(), lista = [];
  const cuerpo = new THREE.CapsuleGeometry(1, 4.5, 6, 12); cuerpo.rotateZ(Math.PI / 2);
  const aleta = new THREE.ConeGeometry(.6, 1.6, 4); aleta.translate(0, 1.6, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c93a6, roughness: .35, metalness: .2 });
  const plata = new THREE.MeshStandardMaterial({ color: 0xdfe8ef, roughness: .2, metalness: .6, emissive: 0x334455 });
  const centros = [[2100, -1300], [2250, -1250], [1900, -1350], [2450, -1150], [1700, -1300]];
  centros.forEach(([x, y], i) => {
    const d = new THREE.Group(); const c = new THREE.Mesh(cuerpo, i === 0 ? plata : mat); d.add(c); d.add(new THREE.Mesh(aleta, i === 0 ? plata : mat));
    const s = i === 0 ? 2.2 : 1.6; d.scale.setScalar(s); g.add(d); lista.push({ d, x, y, f: i * 1.7, r: 18 + i * 4 });
  });
  return { g, anim(t) { for (const o of lista) { const k = ((t * .45 + o.f) % 3.2) / 3.2; const sal = k < .35 ? Math.sin(k / .35 * Math.PI) : 0; const a = t * .2 + o.f; o.d.position.set(o.x + Math.cos(a) * o.r, -2 + sal * 9, -(o.y + Math.sin(a) * o.r)); o.d.rotation.y = -a - Math.PI / 2; o.d.rotation.z = (k < .35 ? Math.cos(k / .35 * Math.PI) * .9 : 0); o.d.visible = k < .4; } } };
}

// El tren fantasma: aparece de noche y recorre las vías junto al barrio de los locos
export function crearTrenFantasma(o = {}) {
  const g = new THREE.Group(), vias = VIAS[0];
  const fantasma = o.fantasma !== false;
  const mat = fantasma ? new THREE.MeshStandardMaterial({ color: 0x8fe0c0, emissive: 0x3cffb0, emissiveIntensity: .7, transparent: true, opacity: 0, depthWrite: false })
    : new THREE.MeshStandardMaterial({ color: o.color || 0xf2c230, roughness: .6 });
  const vagones = [];
  const nV = o.vagones || 7;
  for (let i = 0; i < nV; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 4.2), i === 0 && !fantasma ? new THREE.MeshStandardMaterial({ color: 0x2f6b4a }) : mat); v.castShadow = !fantasma; g.add(v);
    if (!fantasma && i) for (let k = -1; k <= 1; k++) { const f = new THREE.Mesh(new THREE.CircleGeometry(1.5, 12), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0x6b4a00 })); f.position.set(k * 5, .5, 2.15); v.add(f); const f2 = f.clone(); f2.position.z = -2.15; f2.rotation.y = Math.PI; v.add(f2); }
    vagones.push(v); }
  // longitudes
  const L = [0]; for (let i = 1; i < vias.length; i++) L.push(L[i - 1] + Math.hypot(vias[i][0] - vias[i - 1][0], vias[i][1] - vias[i - 1][1]));
  const punto = (s) => { s = Math.max(0, Math.min(L[L.length - 1] - 1, s)); let i = 1; while (L[i] < s) i++; const k = (s - L[i - 1]) / (L[i] - L[i - 1]); const a = vias[i - 1], b = vias[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  const s0 = o.s0 ?? 1900, s1 = o.s1 ?? 5200, vel = o.vel || 35; // por defecto: del barrio de los Locos a la estación
  return { g, anim(t, n) {
    if (fantasma) mat.opacity = Math.max(0, n - .3) * .8 * (0.75 + .25 * Math.sin(t * 7));
    const s = s0 + ((t * vel) % (s1 - s0));
    vagones.forEach((v, i) => { const [x, y, a] = punto(s - i * 20); v.position.set(x, altura(x, y) + 3.5 + Math.sin(t * 2 + i) * .4, -y); v.rotation.y = a; });
    g.visible = fantasma ? n > .35 : true;
  } };
}

// El autobús n.º 7 de Víctor: azul, viejo, con una abolladura en el ala izquierda. Nunca deja de andar.
export function crearAutobus() {
  const g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
  const azul = new THREE.MeshStandardMaterial({ color: 0x2f6fbf, roughness: .55, metalness: .1 });
  const caj = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 3.2), azul); caj.position.y = 2.1; caj.castShadow = true; cuerpo.add(caj);
  const vid = new THREE.MeshStandardMaterial({ color: 0xcfe6f7, roughness: .2, emissive: 0xffd58a, emissiveIntensity: 0 });
  const vent = new THREE.Mesh(new THREE.BoxGeometry(10.4, 1.1, 3.25), vid); vent.position.y = 2.7; cuerpo.add(vent);
  const techo = new THREE.Mesh(new THREE.BoxGeometry(10.8, .3, 3), new THREE.MeshStandardMaterial({ color: 0xe9eef2 })); techo.position.y = 3.85; cuerpo.add(techo);
  const abolladura = new THREE.Mesh(new THREE.SphereGeometry(.7, 8, 6), new THREE.MeshStandardMaterial({ color: 0x24589a })); abolladura.position.set(3.6, 1.4, 1.45); abolladura.scale.set(1.4, .7, .25); cuerpo.add(abolladura);
  const cartel = new THREE.Mesh(new THREE.BoxGeometry(.1, .7, 1.4), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2b0, emissiveIntensity: .4 })); cartel.position.set(5.52, 3.2, 0); cuerpo.add(cartel);
  const ruedas = [];
  for (const x of [-3.6, 3.4]) for (const z of [-1.55, 1.55]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .4, 14), new THREE.MeshStandardMaterial({ color: 0x1d1d1d })); r.rotation.x = Math.PI / 2; r.position.set(x, .62, z); cuerpo.add(r); ruedas.push(r); }
  const faro = new THREE.MeshStandardMaterial({ color: 0xfff6d0, emissive: 0xffe9a0, emissiveIntensity: .2 });
  for (const z of [-1.1, 1.1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(.3, 12), faro); f.position.set(5.53, 1.2, z); f.rotation.y = Math.PI / 2; cuerpo.add(f); }
  const luzBus = new THREE.SpotLight(0xffe9b0, 0, 90, .5, .6, 1.2); luzBus.position.set(5.6, 1.4, 0); luzBus.target.position.set(30, -2, 0); cuerpo.add(luzBus, luzBus.target);
  g.scale.setScalar(1.25);

  // recorrido: longitudes acumuladas
  const P = RUTA_BUS.map(p => ({ x: p[0], y: p[1], o: p[2] || {} }));
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  L.push(L[L.length - 1] + Math.hypot(P[0].x - P[P.length - 1].x, P[0].y - P[P.length - 1].y)); // vuelve al inicio
  const total = L[L.length - 1], VEL = 11; // m/s, al paso tranquilo de Verdegrad
  const paradas = P.map((p, i) => [L[i], p.o.p || 0, p.o]).filter(x => x[1] || x[2].b);
  const pausaTotal = paradas.reduce((t, x) => t + x[1], 0), ciclo = total / VEL + pausaTotal;
  const punto = (s) => {
    s = ((s % total) + total) % total; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const a = P[i - 1], b = P[i % P.length], k = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, Math.atan2(b.y - a.y, b.x - a.x)];
  };
  let ang = 0;
  const estado = { x: P[0].x, y: P[0].y, bocina: false, parada: '' };
  return { g, estado, anim(t, n) {
    // tiempo dentro del ciclo → distancia recorrida, descontando las paradas
    let tc = t % ciclo, s = 0, quieto = '';
    for (const [d, pausa, o] of paradas) {
      const llegar = d / VEL;
      if (tc < llegar) break;
      if (tc < llegar + pausa) { quieto = o.n || ''; tc = llegar; break; }
      tc -= pausa;
    }
    s = tc * VEL;
    const [x, y, a] = punto(s), [x2, y2] = punto(s + 6);
    let da = Math.atan2(y2 - y, x2 - x) - ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; ang += da * .12;
    g.position.set(x, altura(x, y) + .15, -y); g.rotation.y = ang;
    cuerpo.position.y = quieto ? 0 : Math.sin(t * 9) * .04;
    if (!quieto) ruedas.forEach(r => r.rotation.y = s * .8);
    const bz = paradas.find(p => p[2].b && Math.abs(s - p[0]) < 30);
    estado.x = x; estado.y = y; estado.parada = quieto; estado.bocina = !!bz;
    vid.emissiveIntensity = .9 * n; faro.emissiveIntensity = .2 + 2.5 * n; luzBus.intensity = 2500 * n;
  } };
}

// Los drones-gaviota que sobrevuelan la fortaleza en «Предчувствие 2»
export function crearDrones() {
  const g = new THREE.Group(), lista = [];
  const mat = new THREE.MeshStandardMaterial({ color: 0xe9eef2, metalness: .5, roughness: .3 });
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Group();
    const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(.5, 1.6, 4, 8), mat); cuerpo.rotation.z = Math.PI / 2; d.add(cuerpo);
    const alas = []; for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.BoxGeometry(.8, .1, 3.2), mat); a.position.z = s * 1.7; d.add(a); alas.push(a); }
    const roja = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); roja.position.set(.9, .1, 0); d.add(roja);
    d.scale.setScalar(2.2); g.add(d); lista.push({ d, alas, roja, f: i * 1.6, r: 120 + i * 45, h: 95 + i * 12 });
  }
  return { g, anim(t) { for (const o of lista) { const a = t * .12 + o.f; o.d.position.set(Math.cos(a) * o.r, o.h + Math.sin(t * .6 + o.f) * 6, Math.sin(a) * o.r); o.d.rotation.y = -a; o.alas.forEach((al, i) => al.rotation.x = Math.sin(t * 6 + o.f) * .35 * (i ? 1 : -1)); o.roja.visible = Math.sin(t * 4 + o.f) > 0; } } };
}

// La cordillera de los Andes al oeste de Mendoza: siempre visible en el horizonte (sin niebla).
// Las distancias están acortadas para que entren en la vista; el Aconcagua va en su dirección real (ONO).
export function crearAndes() {
  const g = new THREE.Group();
  const roca = new THREE.MeshLambertMaterial({ color: 0x8f8a96, fog: true, flatShading: true });
  const nieve = new THREE.MeshLambertMaterial({ color: 0xf4f6fa, fog: true, flatShading: true });
  const lejos = new THREE.MeshLambertMaterial({ color: 0xa9adc0, fog: true, flatShading: true });
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const monte = (x, y, h, ancho, mat, conNieve = true) => {
    const geo = new THREE.ConeGeometry(ancho, h, 7, 3); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const yy = p.getY(i); if (yy < h / 2 - 1) { p.setX(i, p.getX(i) * (0.8 + r() * 0.45)); p.setZ(i, p.getZ(i) * (0.8 + r() * 0.45)); p.setY(i, yy + (r() - .5) * h * 0.08); } }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); m.position.set(x, h / 2 - 60, -y); g.add(m);
    if (conNieve) { const c = new THREE.Mesh(new THREE.ConeGeometry(ancho * 0.36, h * 0.36, 7, 1), nieve); c.position.set(x, h - h * 0.18 - 60 + 2, -y); c.rotation.y = r(); g.add(c); }
  };
  // primer cordón (Cordón del Plata y precordillera alta)
  for (let i = 0; i < 26; i++) { const y = -30000 + i * 2500 + r() * 900; monte(-13500 - r() * 4000, y, 1800 + r() * 1500, 3000 + r() * 1800, roca, r() > .45); }
  // cordillera principal, más lejos y azulada
  for (let i = 0; i < 22; i++) { const y = -40000 + i * 3800 + r() * 1500; monte(-24000 - r() * 6000, y, 3600 + r() * 1500, 5000 + r() * 2200, lejos); }
  // el Aconcagua (6961 m), en su dirección real desde la plaza Independencia
  const d = Math.hypot(-109500, 26200), k = 33000 / d; monte(-109500 * k, 26200 * k, 6000, 7500, lejos);
  // el Tupungato, al sudoeste
  const d2 = Math.hypot(-86100, -51800), k2 = 32000 / d2; monte(-86100 * k2, -51800 * k2, 5400, 7000, lejos);
  return g;
}

// Venecia: góndolas negras y un vaporetto que recorren el Canal Grande, y góndolas amarradas frente a la Piazzetta
export function crearGondolas() {
  const g = new THREE.Group(), lista = [];
  const negro = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .4, metalness: .2 });
  const rojo = new THREE.MeshStandardMaterial({ color: 0x8a2230, roughness: .6 }), metal = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: .8, roughness: .3 });
  const gondola = () => {
    const o = new THREE.Group();
    const casco = new THREE.Mesh(new THREE.CapsuleGeometry(.7, 9, 4, 10), negro); casco.rotation.z = Math.PI / 2; casco.scale.set(1, 1, .9); casco.position.y = .25; o.add(casco);
    const proa = new THREE.Mesh(new THREE.BoxGeometry(.25, 1.6, .9), metal); proa.position.set(5.2, 1.1, 0); o.add(proa);
    const asiento = new THREE.Mesh(new THREE.BoxGeometry(1.6, .5, 1), rojo); asiento.position.set(-.5, .8, 0); o.add(asiento);
    const gond = new THREE.Group(); gond.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .25, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 })));
    const rayas = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .25, 6), new THREE.MeshStandardMaterial({ color: 0x1d3f8a })); rayas.position.y = .2; gond.add(rayas);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe0b08c })); cab.position.y = .9; gond.add(cab);
    const remo = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 4, 4), new THREE.MeshStandardMaterial({ color: 0x8a6a45 })); remo.rotation.z = .5; remo.position.set(-.8, .2, .6); gond.add(remo);
    gond.position.set(-4, 1.6, .2); o.add(gond); o.scale.setScalar(1.4); return o;
  };
  const vaporetto = () => {
    const o = new THREE.Group();
    const casco = new THREE.Mesh(new THREE.BoxGeometry(22, 1.6, 5), new THREE.MeshStandardMaterial({ color: 0xf2f2ee })); casco.position.y = .6; o.add(casco);
    const franja = new THREE.Mesh(new THREE.BoxGeometry(22.1, .5, 5.05), new THREE.MeshStandardMaterial({ color: 0xe9b62e })); franja.position.y = .3; o.add(franja);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 4.2), new THREE.MeshStandardMaterial({ color: 0xe8e8e2, emissive: 0xffd58a, emissiveIntensity: 0 })); cab.position.set(-1, 2.5, 0); o.add(cab);
    const pil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x3a3a3a })); pil.position.set(6.6, 2.4, 0); o.add(pil);
    o.userData.cab = cab; return o;
  };
  const P = CANAL_GRANDE, L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = L[L.length - 1];
  const punto = (s) => { s = ((s % total) + total) % total; let i = 1; while (L[i] < s) i++; const k = (s - L[i - 1]) / (L[i] - L[i - 1]); const a = P[i - 1], b = P[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  let sem = 3; const r = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 16; i++) { const o = gondola(); g.add(o); lista.push({ o, s0: r() * total, v: (r() < .5 ? 1 : -1) * (1.1 + r() * .9), lado: (r() - .5) * 22, f: r() * 6 }); }
  for (let i = 0; i < 2; i++) { const o = vaporetto(); g.add(o); lista.push({ o, s0: i * total / 2, v: i ? -5 : 5, lado: i ? 9 : -9, f: 0, vap: true }); }
  // amarradas frente a la Piazzetta, sobre el Bacino
  const amarre = [];
  for (let i = 0; i < 9; i++) { const o = gondola(); const x = 40 + i * 9; let y = -60; while (costa(x, y) > -5 && y > -400) y -= 4; y -= (i % 2) * 2; o.position.set(x, .2, -y); o.rotation.y = Math.PI / 2 + .19; g.add(o); amarre.push({ o, f: i }); }
  return { g, anim(t, n) {
    for (const q of lista) {
      const [x, y, a] = punto(q.s0 + t * q.v), nx = -Math.sin(a), ny = Math.cos(a);
      q.o.position.set(x + nx * q.lado, .2 + Math.sin(t * 1.6 + q.f) * .12, -(y + ny * q.lado));
      q.o.rotation.y = a + (q.v < 0 ? Math.PI : 0);
      if (q.vap) q.o.userData.cab.material.emissiveIntensity = 1.4 * n;
    }
    for (const q of amarre) { q.o.position.y = .2 + Math.sin(t * 1.3 + q.f) * .15; q.o.rotation.z = Math.sin(t * 1.1 + q.f) * .04; }
  } };
}

// «Ostrovy nad Prahou»: las cinco islas de piedra de Černoboh, con castillos negros, flotando sobre Praga;
// de cada una baja una cadena con luz azul que bebe la fuerza de uno de los cinco corazones de la ciudad
export function crearOstrovy(anclas) {
  const g = new THREE.Group(), lista = [];
  const roca = new THREE.MeshStandardMaterial({ color: 0x6b5d50, roughness: .95, flatShading: true });
  const pasto = new THREE.MeshStandardMaterial({ color: 0x5f7d48, roughness: .9, flatShading: true });
  const negro = new THREE.MeshStandardMaterial({ color: 0x1b1c22, roughness: .7 });
  const azul = new THREE.MeshStandardMaterial({ color: 0x1f4f9a, emissive: 0x3a8cff, emissiveIntensity: 1.2, metalness: .6, roughness: .3 });
  const agua = new THREE.MeshBasicMaterial({ color: 0xcfe7ff, transparent: true, opacity: .55 });
  const eslabon = new THREE.TorusGeometry(5, 1.5, 6, 10), alma = new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: .55 });
  anclas.forEach((L, i) => {
    const isla = new THREE.Group();
    const R = 70 + (i % 3) * 14;
    const cono = new THREE.Mesh(new THREE.ConeGeometry(R, R * 1.5, 9, 3), roca); cono.rotation.x = Math.PI; cono.position.y = -R * .75; isla.add(cono);
    const tapa = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R, 8, 9), pasto); tapa.position.y = 4; isla.add(tapa);
    // el castillo negro: muralla, torre del homenaje y torres puntiagudas
    isla.add(caja(R * .9, 22, R * .7, negro, 0, 8, 0));
    isla.add(caja(R * .32, 58, R * .32, negro, -R * .12, 8, -R * .05));
    for (const [dx, dz, h] of [[-.42, -.32, 40], [.42, -.32, 34], [-.42, .32, 36], [.42, .32, 44], [.1, -.1, 72]]) {
      isla.add(cil(5, 5, h, negro, dx * R, 8, dz * R, 8));
      const p = new THREE.Mesh(new THREE.ConeGeometry(7, 20, 8), negro); p.position.set(dx * R, 8 + h + 10, dz * R); isla.add(p);
    }
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + i; isla.add(esfera(6 + (k % 3) * 3, pasto, Math.cos(a) * R * .75, 10, Math.sin(a) * R * .75)); }
    const cascada = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), agua); cascada.position.set(R * .95, -55, 0); cascada.rotation.y = Math.PI / 2; isla.add(cascada);
    const alto = 420 + i * 35, ox = (i % 2 ? 1 : -1) * 90, oz = (i % 3 - 1) * 70;
    isla.position.set(L.x + ox, alto, -L.y + oz); g.add(isla);
    // la cadena: eslabones alternados desde el fondo de la isla hasta el corazón
    const ini = new THREE.Vector3(L.x + ox, alto - R * 1.4, -L.y + oz), fin = new THREE.Vector3(L.x, (L._h || 20) * .4, -L.y);
    const n = Math.floor(ini.distanceTo(fin) / 8.6), cad = new THREE.InstancedMesh(eslabon, azul, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), dir = fin.clone().sub(ini).normalize();
    const base = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    for (let k = 0; k < n; k++) {
      const p = ini.clone().lerp(fin, k / (n - 1));
      q.copy(base).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), k % 2 ? Math.PI / 2 : 0)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
      m.compose(p, q, new THREE.Vector3(1, 1.5, 1)); cad.setMatrixAt(k, m);
    }
    g.add(cad);
    // un hilo de luz por dentro, para que la cadena se vea también de lejos
    const largo = ini.distanceTo(fin), hilo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, largo, 6), alma);
    hilo.position.copy(ini).lerp(fin, .5); hilo.quaternion.copy(base); g.add(hilo);
    lista.push({ isla, y0: alto, f: i * 1.3 });
  });
  return { g, anim(t) { for (const o of lista) { o.isla.position.y = o.y0 + Math.sin(t * .35 + o.f) * 4; o.isla.rotation.y = Math.sin(t * .08 + o.f) * .03; } } };
}

// «Звёздный роман»: la cúpula de agua sobre la Atlántida, que vive «bajo la masa del océano»
export function crearCupulaAtlantida(x, y) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x8fe0ec, transparent: true, opacity: .16, roughness: .05, metalness: .1, side: THREE.DoubleSide, depthWrite: false });
  const cup = new THREE.Mesh(new THREE.SphereGeometry(760, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  cup.scale.y = .42; cup.position.set(x, 0, -y); g.add(cup);
  const borde = new THREE.Mesh(new THREE.TorusGeometry(760, 4, 6, 96), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: .5 }));
  borde.rotation.x = Math.PI / 2; borde.position.set(x, 1, -y); g.add(borde);
  return { g, anim(t) { mat.opacity = .14 + Math.sin(t * .5) * .03; } };
}
// «La ciudad secreta»: los cristales grandes del techo, que dan una luz dorada como la del sol
export function crearCristalesTecho() {
  const g = new THREE.Group(), lista = [];
  const mat = new THREE.MeshStandardMaterial({ color: 0xfff1b8, emissive: 0xffc94a, emissiveIntensity: 1.1, transparent: true, opacity: .85, flatShading: true });
  for (let i = 0; i < 38; i++) {
    const a = i * 2.399, r = 60 + Math.sqrt(i / 38) * 620;
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(10 + (i % 4) * 6, 0), mat);
    c.scale.y = 2.4; c.position.set(Math.cos(a) * r, 230 + (i % 5) * 14, -Math.sin(a) * r * .85); c.rotation.z = Math.PI; g.add(c); lista.push([c, i]);
  }
  const luz = new THREE.PointLight(0xffd27a, 1.2, 1800, 1.2); luz.position.set(0, 260, 0); g.add(luz);
  return { g, anim(t, noche) { for (const [c, i] of lista) c.rotation.y = t * .1 + i; mat.emissiveIntensity = noche ? 1.6 : 1.1; } };
}

// «Северная любовь 3»: los animales que llegaron con el viento del este y la aurora boreal sobre el fiordo
export function crearNorte(altura) {
  const g = new THREE.Group(), anim = [];
  const M_ = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, flatShading: true, ...o });
  const h = (x, y) => Math.max(0, altura(x, y));
  const cuadrupedo = (col, L, alto, cabeza = .3) => { const q = new THREE.Group(), m = M_(col);
    q.add(caja(L, alto * .45, L * .38, m, 0, alto * .5, 0));
    for (const [dx, dz] of [[-.35, -.13], [.35, -.13], [-.35, .13], [.35, .13]]) q.add(caja(L * .1, alto * .55, L * .1, m, dx * L, 0, dz * L));
    q.add(caja(L * cabeza, alto * .3, L * .22, m, L * .55, alto * .78, 0)); return q; };
  // el alce blanco, el Rey de las Nieves, con astas como la copa de un árbol
  const alce = cuadrupedo(0xf4f6f8, 5, 4.6); for (let i = 0; i < 7; i++) { const a = caja(.25, 2.6, .25, M_(0xe8eef4), 2.9, 5, (i - 3) * .55); a.rotation.x = (i - 3) * .3; alce.add(a); }
  alce.scale.setScalar(2.2); alce.position.set(560, h(560, 820), -820); g.add(alce);
  // el jabalí de cerdas de oro, Fueguito
  const jab = cuadrupedo(0x5a4330, 3.2, 2.2); jab.add(caja(2.6, .5, .4, new THREE.MeshStandardMaterial({ color: 0xffc94a, emissive: 0xffa020, emissiveIntensity: .9 }), 0, 2.2, 0));
  jab.scale.setScalar(2); jab.position.set(600, h(600, -60), 60); g.add(jab);
  // las dos gatas grises, del tamaño de un caballo
  for (const [x, y] of [[230, 330], [270, 300]]) { const c = cuadrupedo(0x8f949a, 3.4, 2.6, .26); c.scale.setScalar(1.7); c.position.set(x, h(x, y), -y); c.rotation.y = x * .01; g.add(c); }
  // los unicornios en el borde del bosque
  for (let i = 0; i < 4; i++) { const x = -420 - i * 40, y = 920 + (i % 2) * 30; const u = cuadrupedo(0xf7f7ff, 3.6, 3.6); u.add(new THREE.Mesh(new THREE.ConeGeometry(.15, 1.4, 6), M_(0xfff0a0, { emissive: 0xfff0a0, emissiveIntensity: .6 }))); u.children[u.children.length - 1].position.set(2.4, 3.9, 0); u.children[u.children.length - 1].rotation.z = -1;
    u.scale.setScalar(1.6); u.position.set(x, h(x, y), -y); u.rotation.y = i; g.add(u); }
  // la zorra que enciende la aurora con la cola
  const zorra = cuadrupedo(0xd8692a, 1.6, 1.1); zorra.add(caja(1.2, .35, .35, M_(0xffffff), -1.1, .9, 0)); zorra.scale.setScalar(2.4); g.add(zorra);
  const chispas = []; for (let i = 0; i < 14; i++) { const c = esfera(.6, new THREE.MeshBasicMaterial({ color: i % 2 ? 0x7dffb0 : 0xff9ad8, transparent: true }), 0, 0, 0); g.add(c); chispas.push(c); }
  // el águila enorme que da vueltas sobre el palacio
  const aguila = new THREE.Group(); aguila.add(caja(4, 1.2, 1.4, M_(0x4a3a2a))); for (const s of [-1, 1]) { const al = caja(1.6, .3, 9, M_(0x5a4632), 0, 0, s * 5); aguila.add(al); }
  aguila.scale.setScalar(2.4); g.add(aguila);
  // los dos cuervos, Pensamiento y Memoria, en la torre más alta del palacio
  for (const s of [-1, 1]) { const c = new THREE.Group(); c.add(caja(1.4, .8, .7, M_(0x111111))); c.add(caja(.5, .5, .5, M_(0x111111), .8, .5, 0)); c.position.set(-230 + s * 3, h(-230, -150) + 74, 150 + 4); g.add(c); }
  // la ballena del puerto y la serpiente de mar del fiordo
  const ballena = new THREE.Mesh(new THREE.SphereGeometry(6, 14, 8), M_(0x3c4a56, { metalness: .4, roughness: .3 })); ballena.scale.set(3.4, .8, 1.1); g.add(ballena);
  const chorro = new THREE.Mesh(new THREE.ConeGeometry(2, 12, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: .55 })); g.add(chorro);
  const serp = []; for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(7, 2.2, 8, 16, Math.PI), M_(0x1d3b3a, { metalness: .5, roughness: .3 })); g.add(t); serp.push(t); }
  // los dragones de escamas de nácar sobre sus peñas
  const dragones = [];
  for (let i = 0; i < 3; i++) { const d = new THREE.Group(), m = M_(i % 2 ? 0xd9d2f0 : 0xc8e6e0, { metalness: .5, roughness: .25 });
    d.add(caja(9, 3, 3, m)); d.add(caja(4, 2, 2, m, 6, 1.6, 0)); d.add(caja(8, .6, 1.4, m, -8, 0, 0));
    for (const s of [-1, 1]) { const al = caja(5, .4, 11, m, 0, 1, s * 6.5); al.rotation.x = s * .3; d.add(al); }
    d.scale.setScalar(2.2); g.add(d); dragones.push({ d, f: i * 2.1 }); }
  // la aurora boreal: cintas verdes, lilas y doradas
  const aurora = []; const colores = [0x6dffa8, 0xb48cff, 0x6dd8ff, 0xffd27a];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.PlaneGeometry(5200, 380, 80, 1), pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) { const x = pos.getX(k); pos.setZ(k, Math.sin(x * .0016 + i) * 420); }
    const mat = new THREE.MeshBasicMaterial({ color: colores[i], transparent: true, opacity: .0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const m = new THREE.Mesh(geo, mat); m.position.set(0, 420 + i * 70, -1900 - i * 220); g.add(m); aurora.push(m);
  }
  const anim_ = (t, noche) => {
    alce.position.x = 560 + Math.sin(t * .03) * 140; alce.position.y = h(alce.position.x, 820); alce.rotation.y = Math.cos(t * .03) > 0 ? Math.PI : 0;
    jab.position.x = 600 + Math.sin(t * .05) * 90; jab.position.y = h(jab.position.x, -60);
    const zx = 1300 + Math.sin(t * .08) * 700, zy = 420 + Math.sin(t * .13) * 260; zorra.position.set(zx, h(zx, zy), -zy); zorra.rotation.y = Math.cos(t * .08) > 0 ? Math.PI : 0;
    chispas.forEach((c, i) => { const k = ((t * .9 + i / 14) % 1); c.position.set(zx - Math.cos(t * .08) * 8, h(zx, zy) + 3 + k * 60, -zy + Math.sin(i) * 4); c.material.opacity = 1 - k; });
    aguila.position.set(-230 + Math.cos(t * .12) * 380, 260 + Math.sin(t * .3) * 20, 150 + Math.sin(t * .12) * 380); aguila.rotation.y = -t * .12;
    const bx = -40 + Math.sin(t * .05) * 260; ballena.position.set(bx, -1 + Math.sin(t * .6), 470 + Math.cos(t * .05) * 40); ballena.rotation.y = Math.cos(t * .05) > 0 ? 0 : Math.PI;
    chorro.position.set(bx, 6, 470 + Math.cos(t * .05) * 40); chorro.visible = Math.sin(t * .7) > .6;
    serp.forEach((s, i) => { const x = -700 + i * 18 + Math.sin(t * .1) * 60; s.position.set(x, -2 + Math.sin(t * .8 + i) * 2, 470 + Math.sin(i) * 3); s.rotation.y = Math.PI / 2; });
    dragones.forEach(({ d, f }, i) => { const a = t * .07 + f; d.position.set(1500 + Math.cos(a) * 520, 420 + Math.sin(t * .4 + f) * 30, -1450 + Math.sin(a) * 260); d.rotation.y = -a - Math.PI / 2; });
    aurora.forEach((m, i) => { m.material.opacity = noche * (.22 + Math.sin(t * .4 + i) * .08) + (1 - noche) * .035; m.position.x = Math.sin(t * .05 + i) * 200; });
  };
  return { g, anim: anim_ };
}

// «Operación Londres»: el Aston Martin DB5 plateado que Lucy dibujó en la pared, volando sobre Pimlico, el Támesis y el Big Ben hacia el oeste;
// y los autobuses rojos de dos pisos de Notting Hill Gate, entre los que Luis perdió a la moto
export function crearLondres() {
  const g = new THREE.Group();
  const auto = new THREE.Group(), plata = new THREE.MeshStandardMaterial({ color: 0xc9ced3, metalness: .85, roughness: .25 });
  const luzOro = new THREE.MeshBasicMaterial({ color: 0xffc94a, transparent: true, opacity: .85 });
  auto.add(caja(4.6, 1, 1.8, plata, 0, .4, 0)); auto.add(caja(2.2, .8, 1.6, plata, -.3, 1.4, 0)); auto.add(caja(2, .65, 1.62, brillo(0x2b3440), -.3, 1.45, 0));
  for (const x of [-1.5, 1.5]) for (const z of [-.95, .95]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.42, .14, 8, 16), luzOro); r.position.set(x, .4, z); auto.add(r); const ala = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .5), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .45, side: THREE.DoubleSide })); ala.position.set(x - .6, .2, z * 1.35); ala.rotation.x = Math.PI / 2; auto.add(ala); }
  for (const z of [-.6, .6]) auto.add(esfera(.16, brillo(0xfff2c0), 2.32, .6, z));
  auto.scale.setScalar(13); g.add(auto);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(40, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: .12, depthWrite: false })); g.add(halo);
  const estela = [], polvo = new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: .7, depthWrite: false });
  for (let i = 0; i < 26; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(5, 6, 4), polvo.clone()); g.add(p); estela.push(p); }
  const ruta = new THREE.CatmullRomCurve3([[-1065, -1138], [-300, -950], [150, -300], [40, 120], [-700, 520], [-2400, 380], [-4300, -150], [-3100, -1150], [-1900, -1350]].map(([x, y]) => new THREE.Vector3(x, 0, -y)), true);
  // autobuses de dos pisos, de ida y vuelta por Notting Hill Gate, Bayswater Road y Oxford Street
  const linea = [[-5431, 931], [-3900, 1030], [-2451, 1176], [-2382, 1365], [-441, 1699]], buses = [], roja = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: .5 });
  const LL = [0]; for (let i = 1; i < linea.length; i++) LL.push(LL[i - 1] + Math.hypot(linea[i][0] - linea[i - 1][0], linea[i][1] - linea[i - 1][1]));
  for (let k = 0; k < 7; k++) { const b = new THREE.Group(); b.add(caja(11, 4.4, 2.6, roja, 0, .5, 0)); for (const y of [1.6, 3.6]) b.add(caja(10.4, .9, 2.65, brillo(0x2a3138), 0, y, 0)); b.scale.setScalar(1.6); g.add(b); buses.push({ b, s0: k * LL[LL.length - 1] / 7, dir: k % 2 ? 1 : -1 }); }
  const enLinea = (s) => { const T = LL[LL.length - 1]; s = ((s % (2 * T)) + 2 * T) % (2 * T); if (s > T) s = 2 * T - s; let i = 1; while (i < LL.length - 1 && LL[i] < s) i++; const a = linea[i - 1], b = linea[i], k = (s - LL[i - 1]) / (LL[i] - LL[i - 1]); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  return { g, anim(t, n) {
    const u = (t * .006) % 1, p = ruta.getPointAt(u), q = ruta.getPointAt((u + .002) % 1), alto = 110 + Math.sin(t * .7) * 8;
    auto.position.set(p.x, alto, p.z); auto.lookAt(q.x, alto, q.z); auto.rotateY(-Math.PI / 2); auto.rotation.z += Math.sin(t * 1.3) * .05;
    halo.position.copy(auto.position); halo.material.opacity = .14 + .3 * n;
    estela.forEach((e, i) => { const v = ruta.getPointAt(((u - (i + 1) * .0016) % 1 + 1) % 1); e.position.set(v.x, alto - i * .4, v.z); e.material.opacity = .6 * (1 - i / estela.length); e.scale.setScalar(1 - i / estela.length * .7); });
    for (const o of buses) { const [x, y, a] = enLinea(o.s0 + t * 9 * o.dir); o.b.position.set(x, altura(x, y) + .2, -y); o.b.rotation.y = a; }
  } };
}
