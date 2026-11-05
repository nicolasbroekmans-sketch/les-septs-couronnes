// Le dragon de la bataille finale : tourne au-dessus du champ, puis pique sur vos lignes (ou sur vous) en crachant
// le feu. On l'abat avec les scorpions (E près d'une baliste), les flèches du héros et les archers alliés.
import * as THREE from 'three';
import { dragonModel } from '../engine/DragonModel.js';
import { audio } from '../audio.js';

export const DRAGON_HP = 2400;
export class Dragon {
  constructor(G, battle) {
    Object.assign(this, { G, battle, hp: DRAGON_HP, alive: true, state: 'circle', t: 0, ang: 0, nextDive: 18, tick: 0, pos: new THREE.Vector3(0, 40, -20) });
    this.m = dragonModel(); G.scene.add(this.m.root);
    this.flames = new THREE.InstancedMesh(new THREE.SphereGeometry(.7, 6, 5), new THREE.MeshBasicMaterial({ color: '#ff7a20', transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), 90);
    this.flames.frustumCulled = false; this.parts = []; G.scene.add(this.flames); this.M = new THREE.Matrix4(); this.head = new THREE.Vector3();
  }
  get low() { return this.state === 'dive' && this.pos.y < 24; }
  update(dt) {
    this.t += dt; const m = this.m.root;
    if (!this.alive) { if (this.pos.y > this.G.physics.groundFn(this.pos.x, this.pos.z) + 1.5) { this.pos.y -= dt * 14; m.rotation.z += dt * 1.2; } m.position.copy(this.pos); this.burn(dt, false); return; }
    let dir;
    if (this.state === 'circle') {
      this.ang += dt * .22; const p = new THREE.Vector3(Math.cos(this.ang) * 55, 40, -20 + Math.sin(this.ang) * 45);
      dir = p.clone().sub(this.pos); this.pos.lerp(p, Math.min(1, dt * 1.5));
      if ((this.nextDive -= dt) <= 0) this.dive();
    } else {
      const u = Math.min(1, (this.t - this.t0) / 6.5), from = this.from, to = this.to;
      const prev = this.pos.clone(); this.pos.set(from.x + (to.x - from.x) * u, 10 + 30 * Math.pow(Math.abs(u - .5) * 2, 1.6), from.z + (to.z - from.z) * u); dir = this.pos.clone().sub(prev);
      this.breath = u > .3 && u < .72;
      if (u >= 1) { this.state = 'circle'; this.nextDive = 12 + Math.random() * 6; this.breath = false; }
    }
    if (dir && dir.lengthSq() > 1e-6) m.rotation.y = Math.atan2(dir.x, dir.z);
    m.position.copy(this.pos); m.rotation.x = this.state === 'dive' ? (this.pos.y > 20 ? .25 : -.1) : 0;
    this.m.animate(this.t, this.state === 'dive' ? .5 : 1, this.breath ? 1 : 0);
    this.burn(dt, this.breath);
    if (this.low) { const archers = this.battle.soldiers.filter(s => s.team === 'A' && s.alive && s.fighter.weapon.ranged).length; this.hurt(dt * archers * 1.1); }
    for (const p of this.G.combat.proj.list) if (!p.dragonHit && !p.stuck && p.owner?.kind === 'player' && this.pos.distanceTo(p.pos) < 5.5) { p.dragonHit = true; p.stuck = true; this.hurt(45); this.G.ui.toast('Flèche dans le cuir du dragon !', 'xp'); }
  }
  dive() {
    const G = this.G, A = this.battle.soldiers.filter(s => s.team === 'A' && s.alive), tgt = Math.random() < .35 || !A.length ? G.player : A[Math.floor(Math.random() * A.length)];
    const dx = tgt.pos.x - this.pos.x, dz = tgt.pos.z - this.pos.z, l = Math.hypot(dx, dz) || 1;
    this.from = this.pos.clone(); this.to = new THREE.Vector3(tgt.pos.x + dx / l * 50, 0, tgt.pos.z + dz / l * 50); this.state = 'dive'; this.t0 = this.t;
    audio.sfx('volcano', .8, .6); G.ui.toast(tgt === G.player ? 'Le dragon fond sur VOUS ! Esquivez (V) !' : 'Le dragon pique sur vos lignes !', 'warn');
  }
  /** Souffle : particules de feu sous la gueule, dégâts au sol aux alliés et au héros. */
  burn(dt, on) {
    const G = this.G; this.m.head.getWorldPosition(this.head);
    if (on) for (let i = 0; i < 4; i++) this.parts.push({ p: this.head.clone(), v: new THREE.Vector3(Math.sin(this.m.root.rotation.y) * 14 + (Math.random() - .5) * 6, -18 - Math.random() * 6, Math.cos(this.m.root.rotation.y) * 14 + (Math.random() - .5) * 6), life: .9 });
    this.parts = this.parts.filter(q => (q.life -= dt) > 0).slice(-90);
    this.parts.forEach((q, i) => { q.p.addScaledVector(q.v, dt); const g = G.physics.groundFn(q.p.x, q.p.z); if (q.p.y < g) { q.p.y = g + .3; q.v.multiplyScalar(.3); } this.M.makeScale(1 + (1 - q.life) * 2.5, 1 + (1 - q.life) * 2.5, 1 + (1 - q.life) * 2.5).setPosition(q.p); this.flames.setMatrixAt(i, this.M); });
    this.flames.count = this.parts.length; this.flames.instanceMatrix.needsUpdate = true;
    if (!on || (this.tick += dt) < .3) return; this.tick = 0;
    const gx = this.head.x + Math.sin(this.m.root.rotation.y) * 6, gz = this.head.z + Math.cos(this.m.root.rotation.y) * 6;
    for (const a of G.actors) if (a.alive && (a.team === 'A' || a.kind === 'player' || a.def?.follower) && Math.hypot(a.pos.x - gx, a.pos.z - gz) < 7.5 && a.fighter.state !== 'dodge') {
      if (a.fighter.takeHit({ amount: a.kind === 'player' ? 18 : 30 })) G.onDeath(a, null);
      else if (a.kind === 'player') { G.renderer.hitFlash(.6); G.flashT = .35; }
    }
  }
  hurt(n) {
    if (!this.alive) return; this.hp -= n;
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.breath = false; audio.sfx('volcano', 1, .4); this.G.ui.toast('LE DRAGON S’ÉCRASE ! L’ennemi perd courage — chargez (1) !', 'quest-done'); }
  }
  dispose() { this.m.root.removeFromParent(); this.flames.removeFromParent(); }
}
