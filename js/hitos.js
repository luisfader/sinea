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
    L._h = h + ({ cervantes: 36, debod: 14, 'torre-madrid': 144, 'oso-madrono': 10, 'plaza-mayor': 26, cebada: 20, 'biblioteca-nacional': 28, colon: 52, 'banco-espana': 38, metro: 8, 'campanile-sm': 98, 'basilica-sm': 42, ducale: 34, 'ponte-sospiri': 14, rialto: 16, salute: 62, 'san-giorgio': 76, arsenale: 32, anfiteatro: 24, 'monumento-andes': 40, ruinas: 14, bodega: 20, aeropuerto: 42, santuario: 46, huertas: 8, invernadero: 12, 'utopia-fortaleza': 82, 'muro-cantor': 22, salon: 16, acacia: 14, 'taller-motos': 12, bunker: 10, campanario: 44, fortaleza: 34, 'puertas-oeste': 20, 'estacion-chica': 14, glorieta: 11, panaderia: 16, cocheras: 12, hotelito: 18, hogar: 18, faro: 50, 'torre-tv': 200, ayuntamiento: 72, rascacielos: 170, estacion: 34, central: 70, planetario: 38, laberinto: 56, iglesia: 46, molino: 24, aerogenerador: 90, 'torre-agua': 42, museo: 24, hotel: 32, ministerio: 40, obelisco: 26, atracciones: 56 }[L.modelo] || 14);
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
