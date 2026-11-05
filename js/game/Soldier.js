// Soldat de bataille : entité légère (pas de modèle individuel, rendu par CrowdRenderer) qui réutilise
// le vrai combattant (Fighter), les dégâts, la physique de déplacement et le cerveau tactique.
import { Fighter } from '../combat/Fighter.js';
import { npcStats } from '../combat/DamageSystem.js';
import { ITEMS } from '../data/items.js';
import { UNITS } from '../data/units.js';
import { Motion } from './Motion.js';

let next = 0;
export class Soldier {
  constructor(unit, team, x, y, z, yaw, owner = null) {
    const u = UNITS[unit], armor = ITEMS[u.armor];
    Object.assign(this, { id: 'soldat' + next++, kind: 'crowd', unit, team, owner, name: u.name, def: {}, faction: team, radius: .38, yaw, vy: 0, speed: 0, onGround: true });
    this.pos = { x, y, z }; this.weaponId = u.weapon; this.tint = u.tint;
    this.stats = { ...npcStats({ hp: u.hp, force: 5 + (u.power > 2 ? 2 : 0), armor: armor.armor }), moveSpeed: armor.speed ?? 1 };
    this.fighter = new Fighter({ maxHp: u.hp, maxStamina: 80, weapon: ITEMS[u.weapon], stats: this.stats });
    this.phase = Math.random() * 6; this.deadT = 0;
  }
  get alive() { return this.fighter.alive; }
  get eye() { return { x: this.pos.x, y: this.pos.y + 1.6, z: this.pos.z }; }
  sync() {}
  dispose() {}
}
Object.assign(Soldier.prototype, Motion);
