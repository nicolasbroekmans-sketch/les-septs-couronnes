// Acteur (joueur ou PNJ) : position, physique de déplacement, combattant, modèle animé, plaque de nom.
import { Fighter } from '../combat/Fighter.js';
import { makeHumanoid } from '../engine/characters/index.js';
import { Nameplate } from '../engine/Nameplate.js';
import { ITEMS } from '../data/items.js';
import { Motion } from './Motion.js';

export class Actor {
  constructor(o) {
    Object.assign(this, { id: o.id, kind: o.kind, name: o.name, faction: o.faction ?? 'peuple', group: o.group ?? null, def: o.def ?? {}, radius: .38 });
    this.pos = { x: o.x, y: o.y ?? 0, z: o.z }; this.yaw = o.yaw ?? 0; this.vy = 0; this.onGround = true;
    this.stats = o.stats; this.weaponId = o.weaponId ?? 'poings';
    this.fighter = new Fighter({ maxHp: o.stats.maxHp, maxStamina: o.stats.maxStamina, hp: o.hp, stamina: o.stamina, weapon: ITEMS[this.weaponId] ?? ITEMS.poings, stats: o.stats });
    this.model = makeHumanoid(o.look ?? {});
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
  sync(dt) {
    const r = this.model.root, f = this.fighter;
    r.position.set(this.pos.x, this.pos.y, this.pos.z); r.rotation.y = this.yaw + Math.PI; r.visible = !this.hidden;
    this.model.update(dt, { speed: this.speed, state: f.state, t: f.t, dur: f.phase(), heavy: f.heavy, dead: !f.alive, surrender: this.surrendered, talking: this.talking, aim: this.aiming, draw: this.drawK, pitch: this.pitch, sneak: this.sneaking, air: !this.onGround && this.vy > -12, sit: this.def.sit && this.speed < .2 && !this.talking });
  }
  dispose() { this.plate?.dispose(); this.model.root.removeFromParent(); }
}
Object.assign(Actor.prototype, Motion);
