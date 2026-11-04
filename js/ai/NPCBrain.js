// Cerveau d'un PNJ — architecture hybride :
//  machine à états (routine, patrouille, alerte, combat, fuite, reddition) + perception (vue, ouïe, furtivité)
//  + décision tactique par réseau neuronal (ai/Tactics.js) + navigation A* (ai/Steering.js).
import { TacticalBrain, ACTIONS } from './Tactics.js';
import { combatFeatures, act } from './CombatBehavior.js';
import { Steering } from './Steering.js';
import { dist, angleTo } from '../combat/CombatSystem.js';
import WEIGHTS from './tactics-weights.js';

const SHARED = new TacticalBrain(WEIGHTS);
export const AI_MODE = { value: 'nn' }; // 'nn' ou 'utility' (comparaison en jeu, voir Paramètres)

export class NPCBrain {
  constructor(actor, def = {}) {
    Object.assign(this, { actor, def, state: def.patrol ? 'patrol' : 'routine', target: null, action: 'attack', actionT: 0, decideT: Math.random() * .3,
      perceiveT: Math.random() * .25, morale: def.morale ?? .6, aggression: def.aggression ?? .6, callCd: 0, strafe: Math.random() < .5 ? 1 : -1, steer: new Steering(), wp: 0, idleT: 0 });
    this.home = { x: actor.pos.x, z: actor.pos.z };
  }
  /** Renvoie la vitesse souhaitée {x,z} (m/s) ; l'acteur applique le déplacement. */
  update(dt, W) {
    const a = this.actor;
    if (!a.alive || a.surrendered) return { x: 0, z: 0 };
    if (a.talking) { a.faceTo(W.player.pos, dt, 6); return { x: 0, z: 0 }; }
    this.callCd -= dt; this.actionT += dt;
    if ((this.perceiveT -= dt) <= 0) { this.perceiveT = .25; this.perceive(W); }
    if (this.state === 'combat') return this.combat(dt, W);
    if (this.state === 'flee') return this.flee(dt, W);
    if (this.state === 'alert') return this.alert(dt, W);
    return this.routine(dt, W);
  }
  perceive(W) {
    const a = this.actor;
    if (this.state === 'combat' && this.target?.alive && !this.target.surrendered && W.hostile(a, this.target) && dist(a.pos, this.target.pos) < 45) return;
    let best = null, bd = Infinity;
    for (const o of W.actors) {
      if (o === a || !o.alive || o.surrendered || o.hidden || !W.hostile(a, o)) continue;
      const d = dist(a.pos, o.pos), night = W.night ? .6 : 1, stealth = o.kind === 'player' ? W.stealth(o) : 1;
      const sight = (this.def.sight ?? 22) * night * stealth, aware = this.state === 'alert' || this.state === 'combat';
      const heard = d < 3 * stealth || (o.fighter.attacking && d < 9);
      const seen = d < sight && (aware || angleTo(a.pos, a.yaw, o.pos) < 1.2) && W.physics.sees(a.eye, o.eye);
      if ((seen || heard) && d < bd) { bd = d; best = o; }
    }
    if (best) this.engage(best, W);
    else if (this.state === 'combat') { this.state = 'alert'; this.alertPos = this.target ? { ...this.target.pos } : null; this.alertT = 8; this.target = null; this.actor.fighter.block(false); }
  }
  engage(t, W) {
    if (this.state !== 'combat') W.emit('npc:engage', { npc: this.actor.id, target: t.id });
    this.target = t; this.state = 'combat';
  }
  combat(dt, W) {
    const a = this.actor, t = this.target;
    if (!t?.alive || t.surrendered) { this.state = 'alert'; this.alertT = 4; this.target = null; return { x: 0, z: 0 }; }
    if ((this.decideT -= dt) <= 0) {
      this.decideT = .28 + W.rng() * .1;
      const f = combatFeatures(this, W), { action } = SHARED.decide(f, AI_MODE.value, W.rng, .08);
      if (action !== this.action) { this.action = action; this.actionT = 0; }
      if (W.rng() < .15) this.strafe *= -1;
      this.lastFeatures = f;
      const hp = a.fighter.hp / a.fighter.maxHp;
      this.morale = Math.max(0, Math.min(1, this.morale - (hp < .3 ? .02 : 0) - W.fear(a)));
      if (action === 'flee') return this.startFlee(W);
    }
    return act(this, W, dt);
  }
  startFlee(W) {
    const a = this.actor, hp = a.fighter.hp / a.fighter.maxHp;
    if (this.def.canSurrender && hp < .45 && (this.def.surrenderAlways || W.rng() < .6)) { W.surrender(a); return { x: 0, z: 0 }; }
    if (this.def.noFlee) { this.action = 'attack'; return { x: 0, z: 0 }; }
    this.state = 'flee'; this.fleeT = 0; a.fighter.block(false);
    W.emit('npc:flee', { npc: a.id });
    return { x: 0, z: 0 };
  }
  flee(dt, W) {
    const a = this.actor, t = this.target; this.fleeT += dt;
    if (!t || dist(a.pos, t.pos) > 40 || this.fleeT > 14) { W.escaped(a); return { x: 0, z: 0 }; }
    const away = { x: a.pos.x * 2 - t.pos.x, z: a.pos.z * 2 - t.pos.z }, dir = this.steer.dir(a, away, W, dt, .1) ?? { x: 0, z: 0 };
    a.turnTo(Math.atan2(-dir.x, -dir.z), dt, 8);
    return { x: dir.x * 6, z: dir.z * 6 };
  }
  alert(dt, W) {
    if ((this.alertT -= dt) <= 0 || !this.alertPos) { this.state = this.def.patrol ? 'patrol' : 'routine'; return { x: 0, z: 0 }; }
    const dir = this.steer.dir(this.actor, this.alertPos, W, dt, 1.5);
    if (!dir) { this.actor.turnTo(this.actor.yaw + dt * 1.5, dt); return { x: 0, z: 0 }; }
    this.actor.turnTo(Math.atan2(-dir.x, -dir.z), dt, 6);
    return { x: dir.x * 3, z: dir.z * 3 };
  }
  /** Routine quotidienne : emploi du temps (jour/nuit), patrouille ou flânerie autour du point d'attache. */
  routine(dt, W) {
    const a = this.actor, d = this.def;
    let goal = null, speed = 1.6;
    if (d.patrol) { goal = { x: d.patrol[this.wp][0], z: d.patrol[this.wp][1] }; speed = 1.8; }
    else if (d.schedule) {
      const slot = d.schedule.find(s => (s.from < s.to ? W.hour >= s.from && W.hour < s.to : W.hour >= s.from || W.hour < s.to)) ?? d.schedule[0];
      goal = { x: slot.at[0], z: slot.at[1] }; a.hidden = false;
      if (slot.hide && dist(a.pos, goal) < 1.5) { a.hidden = true; return { x: 0, z: 0 }; }
      if (slot.wander && dist(a.pos, goal) < slot.wander) goal = this.wander(dt, goal, slot.wander);
    } else if (d.wander) goal = this.wander(dt, this.home, d.wander);
    if (!goal) return { x: 0, z: 0 };
    const dir = this.steer.dir(a, goal, W, dt, .6);
    if (!dir) { if (d.patrol) this.wp = (this.wp + 1) % d.patrol.length; if (d.face !== undefined) a.turnTo(d.face, dt, 3); return { x: 0, z: 0 }; }
    a.turnTo(Math.atan2(-dir.x, -dir.z), dt, 5);
    return { x: dir.x * speed, z: dir.z * speed };
  }
  wander(dt, center, r) {
    if ((this.idleT -= dt) > 0) return this.wanderGoal ?? null;
    this.idleT = 4 + Math.random() * 6;
    const ang = Math.random() * 6.28, rr = Math.random() * r;
    this.wanderGoal = Math.random() < .35 ? null : { x: center.x + Math.cos(ang) * rr, z: center.z + Math.sin(ang) * rr };
    return this.wanderGoal;
  }
}
export { ACTIONS };
