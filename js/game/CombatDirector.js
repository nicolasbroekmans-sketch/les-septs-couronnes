// Orchestration du combat : met à jour tous les combattants, résout les coups et les flèches,
// applique les conséquences (dégâts affichés, sons, crimes, morale, mort, expérience).
import { resolveMelee } from '../combat/CombatSystem.js';
import { Projectiles } from '../combat/Projectiles.js';
import { practice } from '../player/Progression.js';
import { audio } from '../audio.js';

export class CombatDirector {
  constructor(game) { this.game = game; this.proj = new Projectiles(); this.meshes = new Map(); }
  update(dt) {
    const G = this.game;
    for (const a of G.actors) {
      const ev = a.fighter.update(dt);
      if (ev.includes('windup') && !a.fighter.weapon.ranged && G.distToPlayer(a) < 25) audio.sfx('whoosh', a.kind === 'player' ? .25 : .12, a.fighter.heavy ? .8 : 1.6);
      if (ev.includes('active') && a.fighter.weapon.ranged) this.shoot(a);
      if (a.fighter.state === 'active' && !a.fighter.weapon.ranged) for (const h of resolveMelee(a, G.actors, G.rng)) this.onHit(h);
    }
    const P = G.physics;
    for (const h of this.proj.update(dt, G.actors, { groundAt: (x, z) => P.groundFn(x, z), solidAt: (x, y, z) => P.solidAt(x, y, z) }, G.rng)) this.onHit(h);
    this.syncArrows();
  }
  shoot(a) {
    const G = this.game, from = { x: a.pos.x, y: a.pos.y + 1.45, z: a.pos.z };
    let dir;
    if (a.kind === 'player') dir = G.rig.aim();
    else {
      const t = a.brain?.target; if (!t) return;
      const d = Math.hypot(t.pos.x - from.x, t.pos.z - from.z), err = .02 + d * .0025, lift = d * d * .0034;
      dir = { x: t.pos.x - from.x + (G.rng() - .5) * err * d, y: t.pos.y + 1.2 - from.y + lift + (G.rng() - .5) * err * d, z: t.pos.z - from.z + (G.rng() - .5) * err * d };
      const l = Math.hypot(dir.x, dir.y, dir.z); dir = { x: dir.x / l, y: dir.y / l, z: dir.z / l };
    }
    from.x += dir.x * .6; from.z += dir.z * .6;
    this.proj.fire(a, from, dir);
    if (G.distToPlayer(a) < 30) audio.sfx('whoosh', .3, 2.2);
  }
  onHit(h) {
    const G = this.game, { attacker: A, target: T, res } = h, wasHostile = G.hostile(A, T) || T.provoked;
    G.ui.damage(T, res);
    if (res.dodged) return;
    if (res.parried || res.blocked) audio.sfx('anvil', res.parried ? .5 : .25, res.parried ? 1.3 : 1.7); else audio.sfx('seal', .4, .7 + G.rng() * .3);
    if (T.kind === 'player') { G.renderer.hitFlash(Math.min(1, res.amount / 30)); G.flashT = .35; G.rig.shake = .25; }
    if (A.kind === 'player') {
      practice(G.core.state.player, A.fighter.weapon.ranged ? 'tir' : 'combat', res.amount > 0 ? .5 : .2);
      if (!wasHostile) G.crime(T, h.killed ? 'meurtre' : 'agression');
      T.provoked = true;
      if (T.group) G.core.state.world.flags['provoked:' + T.group] = true;
    }
    if (T.brain && !h.killed && T.brain.state !== 'combat' && !T.surrendered) T.brain.engage(A, G.world);
    if (T.brain) T.brain.morale = Math.max(0, T.brain.morale - res.amount / T.fighter.maxHp * .4);
    if (h.killed) G.onDeath(T, A);
  }
  syncArrows() {
    const G = this.game, alive = new Set(this.proj.list);
    for (const p of this.proj.list) {
      let m = this.meshes.get(p);
      if (!m) { m = G.arrowMesh(); this.meshes.set(p, m); G.scene.add(m); }
      m.position.set(p.pos.x, p.pos.y, p.pos.z);
      if (!p.stuck) m.lookAt(p.pos.x + p.vel.x, p.pos.y + p.vel.y, p.pos.z + p.vel.z);
      if (p.hit) m.visible = false;
    }
    for (const [p, m] of this.meshes) if (!alive.has(p)) { m.removeFromParent(); this.meshes.delete(p); }
  }
  clear() { for (const m of this.meshes.values()) m.removeFromParent(); this.meshes.clear(); this.proj.list = []; }
}
