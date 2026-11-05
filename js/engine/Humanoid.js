// Le modèle regarde vers +Z : l'entité applique rotation.y = yaw + π (convention du jeu : yaw 0 = −Z).
// Personnage procédural articulé (bassin, torse, tête, bras et jambes à deux segments) et animation
// procédurale : marche/course, attaques légère et lourde, tir à l'arc, parade, esquive, recul, mort, reddition.
import * as THREE from 'three';
import { weaponMesh } from './Weapons3D.js';

const cache = new Map();
const std = (c, o = {}) => { const k = c + JSON.stringify(o); if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? .8, metalness: o.m ?? 0 })); return cache.get(k); };
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 3, 8);
const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const part = (parent, geo, m, y = 0, x = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };

/** look : { skin, hair, tunic, cloak, pants, armor ('cuir'|'maille'|…), beard, female, height, helmet } */
export class Humanoid {
  constructor(look = {}) {
    const s = look.height ?? 1, fem = !!look.female;
    this.root = new THREE.Group(); this.root.scale.setScalar(s);
    const skin = std(look.skin ?? '#d8b49a'), tunic = std(look.tunic ?? '#5a3a2a'), pants = std(look.pants ?? '#3a3028'), boots = std('#2a1d14');
    const T = look.armorTint, armorM = look.armor === 'maille' || look.armor === 'plates' ? std(T ?? '#8a8f96', { m: .85, r: .4 }) : look.armor === 'brigandine' ? std(T ?? '#5a2a20', { r: .6 }) : look.armor === 'cuir' ? std(T ?? '#6a4a30', { r: .7 }) : tunic;
    const J = this.j = {};
    J.hips = joint(this.root, 0, .95, 0);
    part(J.hips, new THREE.BoxGeometry(fem ? .32 : .3, .16, .2), pants, 0);
    J.spine = joint(J.hips, 0, .08, 0);
    part(J.spine, cap(fem ? .15 : .16, .3), armorM, .26).scale.set(fem ? 1.05 : 1.15, 1, .78);
    part(J.spine, new THREE.CylinderGeometry(.19, .17, .12, 10), std('#2a1d14'), .06); // ceinture
    J.head = joint(J.spine, 0, .58, 0);
    part(J.head, new THREE.SphereGeometry(.11, 14, 12), skin, .08).scale.set(.9, 1.08, .98);
    part(J.head, new THREE.SphereGeometry(.118, 12, 8, 0, Math.PI * 2, 0, Math.PI * (fem ? .62 : .45)), std(look.hair ?? '#3a2a1e'), .1).rotation.x = .25;
    if (fem) part(J.head, cap(.07, .22), std(look.hair ?? '#3a2a1e'), -.04, 0, -.06);
    if (look.beard) part(J.head, new THREE.SphereGeometry(.085, 10, 8, 0, Math.PI * 2, Math.PI * .45, Math.PI * .4), std(look.hair ?? '#3a2a1e'), .05, 0, .03);
    if (look.helmet) part(J.head, new THREE.SphereGeometry(.13, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), std('#7a7f86', { m: .9, r: .35 }), .1);
    for (const e of [-1, 1]) part(J.head, new THREE.SphereGeometry(.012, 6, 4), std('#1a1410'), .1, e * .04, .1);
    for (const side of ['L', 'R']) {
      const x = side === 'L' ? -1 : 1;
      const sh = J['sh' + side] = joint(J.spine, x * (fem ? .19 : .22), .46, 0);
      part(sh, cap(.055, .22), armorM, -.15);
      const el = J['el' + side] = joint(sh, 0, -.3, 0);
      part(el, cap(.045, .2), skin, -.13);
      J['hand' + side] = joint(el, 0, -.28, 0);
      part(J['hand' + side], new THREE.SphereGeometry(.045, 8, 6), skin);
      const hp = J['hip' + side] = joint(J.hips, x * .1, -.04, 0);
      part(hp, cap(.075, .32), pants, -.22);
      const kn = J['kn' + side] = joint(hp, 0, -.45, 0);
      part(kn, cap(.06, .3), boots, -.2);
      part(kn, new THREE.BoxGeometry(.1, .07, .22), boots, -.43, 0, .05);
    }
    if (look.cloak) { const c = part(J.spine, new THREE.PlaneGeometry(.5, 1.05, 1, 4), std(look.cloak), .02, 0, -.13); c.material.side = THREE.DoubleSide; c.position.y = -.05; this.cloak = c; }
    this.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
    this.phase = Math.random() * 6; this.pose = {}; this.deadT = 0;
  }
  setWeapon(cls, id) {
    for (const h of [this.j.handR, this.j.handL]) for (const c of [...h.children]) if (c.userData.weapon) h.remove(c);
    if (!cls || cls === 'fist') return;
    const w = weaponMesh(cls, id); w.userData.weapon = true;
    (cls === 'bow' ? this.j.handL : this.j.handR).add(w);
    if (cls !== 'bow') w.rotation.x = -Math.PI / 2; // lame vers l'avant quand le bras pend
    this.weaponCls = cls;
  }
  /** a : { speed, state, t, dur, heavy, dead, surrender, talking, aim } */
  update(dt, a) {
    const T = targetPose(this, dt, a), k = 1 - Math.exp(-(a.state === 'active' ? 30 : 14) * dt), J = this.j;
    for (const [name, rot] of Object.entries(T)) {
      if (name === 'hipsY') { J.hips.position.y += (rot - J.hips.position.y) * k; continue; }
      if (name === 'rootX') { this.root.rotation.x += (rot - this.root.rotation.x) * k; continue; }
      const o = J[name]; o.rotation.x += ((rot[0] ?? 0) - o.rotation.x) * k; o.rotation.y += ((rot[1] ?? 0) - o.rotation.y) * k; o.rotation.z += ((rot[2] ?? 0) - o.rotation.z) * k;
    }
    if (this.cloak) this.cloak.rotation.x = -.1 - Math.min(.6, (a.speed ?? 0) * .08) - Math.sin(this.phase * 2) * .03;
  }
}

function targetPose(h, dt, a) {
  const sp = a.speed ?? 0, run = Math.min(1, sp / 4.5), P = {};
  h.phase += dt * (2 + sp * 1.9);
  const s = Math.sin(h.phase), c = Math.cos(h.phase), swing = .75 * Math.min(1, sp / 2.5);
  Object.assign(P, { hipsY: .95 - Math.abs(c) * .04 * run, rootX: 0, spine: [run * .12, 0, 0], head: [0, 0, 0],
    hipL: [s * swing, 0, 0], hipR: [-s * swing, 0, 0], knL: [Math.max(0, -c) * swing * 1.2, 0, 0], knR: [Math.max(0, c) * swing * 1.2, 0, 0],
    shL: [-s * swing * .8, 0, -.08], shR: [s * swing * .8, 0, .08], elL: [-.25 - run * .5, 0, 0], elR: [-.25 - run * .5, 0, 0] });
  if (sp < .1) { const b = Math.sin(h.phase * .4) * .03; P.spine = [b, 0, 0]; P.shL = [0, 0, -.1]; P.shR = [0, 0, .1]; }
  const st = a.state, u = Math.min(1, (a.t ?? 0) / Math.max(.01, a.dur ?? .3)), ranged = h.weaponCls === 'bow' || h.weaponCls === 'crossbow';
  if (a.talking) { P.shR = [-.4 + Math.sin(h.phase * .7) * .2, 0, .25]; P.elR = [-.9, 0, 0]; }
  if (ranged && (st === 'windup' || st === 'active' || a.aim)) { P.shL = [-1.5 + (a.pitch ?? 0), 0, 0]; P.elL = [0, 0, 0]; P.shR = [-1.45 + (a.pitch ?? 0), 0, -.3 + (st === 'windup' ? -u * .5 : 0)]; P.elR = [-1.2 - (st === 'windup' ? u * .9 : 0), 0, 0]; P.spine = [0, .5, 0]; }
  else if (st === 'windup') { if (h.weaponCls === 'spear') { P.shR = [-.6, 0, .3]; P.elR = [-1.6, 0, 0]; P.spine = [0, .4, 0]; } else if (a.heavy) { P.shR = [-2.6, 0, .2]; P.elR = [-.6, 0, 0]; P.spine = [-.2, .3, 0]; } else { P.shR = [-1.3, 0, -1.1]; P.elR = [-1, 0, 0]; P.spine = [0, .55, 0]; } }
  else if (st === 'active') { if (h.weaponCls === 'spear') { P.shR = [-1.5, 0, 0]; P.elR = [0, 0, 0]; P.spine = [.15, -.2, 0]; } else if (a.heavy) { P.shR = [.2, 0, .1]; P.elR = [-.2, 0, 0]; P.spine = [.45, -.1, 0]; } else { P.shR = [-1.3, 0, .9]; P.elR = [-.3, 0, 0]; P.spine = [.1, -.6, 0]; } }
  else if (st === 'recover') { P.shR = [-.6, 0, .3]; P.elR = [-.6, 0, 0]; }
  else if (st === 'block') { P.shR = [-1.4, 0, .9]; P.elR = [-1.3, 0, 0]; P.shL = [-1.2, 0, -.4]; P.elL = [-1.4, 0, 0]; P.spine = [-.08, 0, 0]; P.hipsY = .9; }
  else if (st === 'dodge') { P.hipsY = .55; P.spine = [.9, 0, 0]; P.hipL = [-1.2, 0, 0]; P.hipR = [-.4, 0, 0]; P.knL = [1.6, 0, 0]; P.knR = [1.6, 0, 0]; P.shL = [-.6, 0, 0]; P.shR = [-.6, 0, 0]; }
  else if (st === 'stagger') { P.spine = [-.4, 0, .1]; P.shL = [-.4, 0, -.7]; P.shR = [-.4, 0, .7]; P.head = [-.3, 0, 0]; }
  if (a.sneak && !a.dead) { P.hipsY -= .18; P.spine[0] += .35; P.knL[0] += .5; P.knR[0] += .5; P.hipL[0] -= .4; P.hipR[0] -= .4; }
  if (a.sit && !a.dead) { P.hipsY = .32; P.hipL = [-1.45, 0, -.1]; P.hipR = [-1.45, 0, .1]; P.knL = [.2, 0, 0]; P.knR = [.3, 0, 0]; P.spine = [-.15, 0, 0]; P.shR = [-.9 + Math.sin(h.phase) * .05, 0, .2]; P.elR = [-1.2, 0, 0]; }
  if (a.surrender) { P.hipsY = .5; P.hipL = [-1.5, 0, 0]; P.hipR = [-1.5, 0, 0]; P.knL = [1.6, 0, 0]; P.knR = [1.6, 0, 0]; P.shL = [-2.8, 0, -.3]; P.shR = [-2.8, 0, .3]; P.elL = [-.3, 0, 0]; P.elR = [-.3, 0, 0]; P.spine = [.1, 0, 0]; P.head = [.3, 0, 0]; }
  if (a.dead) { P.rootX = -Math.PI / 2; P.hipsY = .2; P.shL = [-2.6, 0, -.4]; P.shR = [-2.4, 0, .5]; P.hipL = [.1, 0, 0]; P.hipR = [-.15, 0, 0]; P.knL = [.2, 0, 0]; P.knR = [.3, 0, 0]; P.head = [.2, .3, 0]; }
  return P;
}
