// Personnage réaliste animé (même interface que Humanoid : root, setWeapon, update). Le modèle regarde vers +Z.
// Animations jouées par un AnimationMixer, avec fondus entre les états : déplacement (marche, course, sprint),
// combat (attaques légères alternées, lourde, parade, esquive, recul, mort), tir à l'arc, assis, accroupi, saut,
// discussion, reddition. Les armes, la cape et le casque sont accrochés aux os.
import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { weaponMesh } from '../Weapons3D.js';
import { LIB, variantFor, tinted } from './library.js';
import { makeCloak, makeHelm } from './gear.js';

const V = new THREE.Vector3(), V2 = new THREE.Vector3(), M = new THREE.Matrix4();
const LOOPS = new Set(['Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Sitting_Idle_Loop', 'Crouch_Fwd_Loop', 'Crouch_Idle_Loop', 'Jump_Loop', 'Idle_Talking_Loop', 'Pistol_Aim_Neutral', 'Swim_Fwd_Loop', 'Swim_Idle_Loop', 'Driving_Loop', 'Sword_Idle', 'Idle_Shield_Loop', 'Fixing_Kneeling']);
const MELEE = { light: ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C'], heavy: ['Sword_Attack'], spear: ['Melee_Hook'], fist: ['Punch_Jab'] };

export class RealHumanoid {
  constructor(look = {}) {
    this.id = variantFor(look); this.look = look;
    this.root = new THREE.Group(); this.root.scale.setScalar(look.height ?? 1);
    this.obj = clone(LIB.models[this.id]); this.root.add(this.obj);
    this.bones = {}; this.obj.traverse(o => { if (o.isBone) this.bones[o.name] = o; if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(m => tinted(m, look)) : tinted(o.material, look); });
    this.mixer = new THREE.AnimationMixer(this.obj); this.actions = {}; this.cur = null; this.atk = 0; this.prevState = 'idle';
    const B = LIB.bind[this.id], pos = n => V2.setFromMatrixPosition(B[n]).clone();
    if (look.cloak) { const sh = pos('upperarm_l').add(pos('upperarm_r')).multiplyScalar(.5), sp = pos('spine_03'); this.cloak = makeCloak(look); this.mount('spine_03', new THREE.Vector3(0, sh.y + .04, sp.z - .12)).add(this.cloak); }
    if (look.helmet) this.mount('Head', pos('Head').add(V.set(0, .12, .01))).add(makeHelm());
    this.play('Idle_Loop', 0);
  }
  /** Groupe fixé à un os, placé (en pose de liaison) au point donné du modèle, axes alignés sur le modèle. */
  mount(bone, at, quat = new THREE.Quaternion()) {
    const g = new THREE.Group(), b = this.bones[bone];
    M.compose(at, quat, V.set(1, 1, 1)).premultiply(LIB.bind[this.id][bone].clone().invert()).decompose(g.position, g.quaternion, g.scale);
    b.add(g); return g;
  }
  /** Repère de prise en main : lame (−Y de l'arme) le long du pouce, perpendiculaire à l'avant-bras. */
  grip(side) {
    const B = LIB.bind[this.id], p = n => new THREE.Vector3().setFromMatrixPosition(B[n + '_' + side]);
    const hand = p('hand'), fwd = p('middle_01').sub(hand).normalize(), thumb = p('thumb_01').sub(hand);
    const blade = thumb.addScaledVector(fwd, -thumb.dot(fwd)).normalize(), y = blade.clone().negate(), x = new THREE.Vector3().crossVectors(y, fwd).normalize(), z = new THREE.Vector3().crossVectors(x, y);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    return this.mount('hand_' + side, hand.addScaledVector(fwd, .07), q);
  }
  setWeapon(cls, id) {
    for (const g of [this.gripR, this.gripL]) g?.removeFromParent();
    this.gripR = this.gripL = this.bowMesh = null; this.weaponCls = cls;
    if (!cls || cls === 'fist') return;
    const w = weaponMesh(cls, id);
    if (cls === 'bow') { this.gripL = this.grip('l'); this.gripL.add(w); this.bowMesh = w; } else { this.gripR = this.grip('r'); this.gripR.add(w); }
  }
  clip(name) { return LIB.clips[name]; }
  play(name, fade = .18, ts = 1, once = false, restart = false) {
    let a = this.actions[name];
    if (!a) { const c = this.clip(name); if (!c) return; a = this.actions[name] = this.mixer.clipAction(c); }
    a.timeScale = ts;
    if (this.cur === a && !restart) return;
    a.reset(); a.setLoop(once || !LOOPS.has(name) ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = true; a.enabled = true;
    if (this.cur && fade > 0) a.crossFadeFrom(this.cur, fade, false); a.play();
    this.cur = a; this.curName = name;
  }
  /** a : { speed, state, t, dur, heavy, dead, surrender, talking, aim, draw, sneak, air, sit, swim, boat } */
  update(dt, a) {
    const st = a.state, sp = a.speed ?? 0, ranged = this.weaponCls === 'bow' || this.weaponCls === 'crossbow', entered = st !== this.prevState;
    this.prevState = st;
    if (a.dead) this.play('Death01', .2, 1.1);
    else if (a.surrender) this.play('Fixing_Kneeling', .3);
    else if (a.boat) this.play('Driving_Loop', .3, sp > .5 ? 1.4 : .6);
    else if (a.swim) this.play(sp > .3 ? 'Swim_Fwd_Loop' : 'Swim_Idle_Loop', .3);
    else if (st === 'dodge') { if (entered) this.play('Roll', .08, 1.5, true, true); }
    else if (st === 'stagger') { if (entered) this.play(Math.random() < .5 ? 'Hit_Chest' : 'Hit_Knockback', .08, 1.3, true, true); }
    else if (ranged && (a.aim || st === 'windup' || st === 'active')) this.play('Pistol_Aim_Neutral', .15);
    else if (st === 'windup' || st === 'active' || st === 'recover') {
      if (st === 'windup' && entered) {
        const set = this.weaponCls === 'spear' ? MELEE.spear : !this.weaponCls || this.weaponCls === 'fist' ? MELEE.fist : a.heavy ? MELEE.heavy : MELEE.light;
        const name = set[this.atk++ % set.length], c = this.clip(name);
        this.play(name, .06, c ? THREE.MathUtils.clamp(c.duration * .42 / Math.max(.08, a.dur ?? .3), .8, 2.4) : 1, true, true);
      }
    }
    else if (st === 'block') this.play('Sword_Block', .1, 1, true);
    else if (a.air) this.play('Jump_Loop', .15);
    else if (a.sit) this.play('Sitting_Idle_Loop', .3);
    else if (a.sneak) this.play(sp > .3 ? 'Crouch_Fwd_Loop' : 'Crouch_Idle_Loop', .2, Math.max(.6, sp / 1.6));
    else if (sp > 5.2) this.play('Sprint_Loop', .2, sp / 6.5);
    else if (sp > 2.4) this.play('Jog_Fwd_Loop', .2, sp / 3.8);
    else if (sp > .15) this.play('Walk_Loop', .2, Math.max(.55, sp / 1.5));
    else this.play(a.talking ? 'Idle_Talking_Loop' : 'Idle_Loop', .25);
    this.mixer.update(dt);
    if (this.bowMesh) { const u = Math.min(1, (a.t ?? 0) / Math.max(.01, a.dur ?? .3)); this.bowMesh.userData.setDraw?.(a.draw > 0 ? a.draw : st === 'windup' ? u : 0); }
    if (this.cloak) { const back = a.dead ? 0 : a.sit ? .9 : .12 + Math.min(.7, sp * .13); this.cloak.rotation.x += (back - this.cloak.rotation.x) * Math.min(1, dt * 8); }
  }
}
