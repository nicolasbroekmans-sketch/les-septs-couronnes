// Acteur (joueur ou PNJ) : position, physique de déplacement, combattant, modèle animé, plaque de nom.
import { Fighter } from '../combat/Fighter.js';
import { Humanoid } from '../engine/Humanoid.js';
import { Nameplate } from '../engine/Nameplate.js';
import { ITEMS } from '../data/items.js';

const GRAVITY = 24;

export class Actor {
  constructor(o) {
    Object.assign(this, { id: o.id, kind: o.kind, name: o.name, faction: o.faction ?? 'peuple', group: o.group ?? null, def: o.def ?? {}, radius: .38 });
    this.pos = { x: o.x, y: o.y ?? 0, z: o.z }; this.yaw = o.yaw ?? 0; this.vy = 0; this.onGround = true;
    this.stats = o.stats; this.weaponId = o.weaponId ?? 'poings';
    this.fighter = new Fighter({ maxHp: o.stats.maxHp, maxStamina: o.stats.maxStamina, hp: o.hp, stamina: o.stamina, weapon: ITEMS[this.weaponId] ?? ITEMS.poings, stats: o.stats });
    this.model = new Humanoid(o.look ?? {});
    this.model.setWeapon(this.fighter.weapon.cls, this.weaponId);
    this.plate = o.kind === 'npc' ? new Nameplate(o.name) : null;
    if (this.plate) this.model.root.add(this.plate.sprite);
    this.speed = 0; this.moveIntent = { x: 0, z: 0 }; this.surrendered = false; this.provoked = false; this.talking = false; this.hidden = false;
  }
  get alive() { return this.fighter.alive; }
  get eye() { return { x: this.pos.x, y: this.pos.y + 1.6, z: this.pos.z }; }
  setWeapon(id) {
    this.weaponId = id ?? 'poings';
    this.fighter.weapon = ITEMS[this.weaponId] ?? ITEMS.poings;
    this.model.setWeapon(this.fighter.weapon.cls, this.weaponId);
  }
  /** Déplacement d'un vecteur (m) avec collisions, marches, gravité. */
  move(dx, dz, dt, physics) {
    const n = Math.ceil(Math.hypot(dx, dz) / .25) || 1;
    for (let i = 0; i < n; i++) { this.pos.x += dx / n; this.pos.z += dz / n; physics.collide(this.pos, this.pos.y, this.radius); }
    const g = physics.groundAt(this.pos.x, this.pos.z, this.pos.y), near = this.pos.y - g < .45 && this.vy <= 0;
    this.vy -= GRAVITY * dt; this.pos.y += this.vy * dt;
    if (this.pos.y <= g || near) { this.pos.y = g; this.vy = 0; this.onGround = true; } else this.onGround = false;
    this.speed = this.speed * .8 + (Math.hypot(dx, dz) / Math.max(dt, 1e-4)) * .2;
  }
  turnTo(yaw, dt, rate = 10) {
    let d = yaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, rate * dt);
  }
  faceTo(p, dt, rate = 10) { this.turnTo(Math.atan2(-(p.x - this.pos.x), -(p.z - this.pos.z)), dt, rate); }
  sync(dt) {
    const r = this.model.root, f = this.fighter;
    r.position.set(this.pos.x, this.pos.y, this.pos.z); r.rotation.y = this.yaw + Math.PI; r.visible = !this.hidden;
    this.model.update(dt, { speed: this.speed, state: f.state, t: f.t, dur: f.phase(), heavy: f.heavy, dead: !f.alive, surrender: this.surrendered, talking: this.talking, aim: this.aiming, pitch: this.pitch, sneak: this.sneaking });
  }
  dispose() { this.plate?.dispose(); this.model.root.removeFromParent(); }
}
