// Edificios y lugares famosos de Sinea modelados en 3D.
// Cada modelo devuelve { g: THREE.Group, r: radio libre de edificios, anim?(t, noche) }.
import * as THREE from './vendor/three.module.js';
import { altura, rio, distLinea, VIAS, RESERVAS, RUTA_BUS } from './mundo.js';
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
    L._h = h + ({ campanario: 44, fortaleza: 34, 'puertas-oeste': 20, 'estacion-chica': 14, glorieta: 11, panaderia: 16, cocheras: 12, hotelito: 18, hogar: 18, faro: 50, 'torre-tv': 200, ayuntamiento: 72, rascacielos: 170, estacion: 34, central: 70, planetario: 38, laberinto: 56, iglesia: 46, molino: 24, aerogenerador: 90, 'torre-agua': 42, museo: 24, hotel: 32, ministerio: 40, obelisco: 26, atracciones: 56 }[L.modelo] || 14);
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
