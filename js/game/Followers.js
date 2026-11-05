// Compagnons du héros dans les régions : apparition autour de lui, rattrapage s'ils sont trop loin,
// perte définitive (retirée de l'armée) s'ils tombent au combat.
import { Actor } from './Actor.js';
import { FollowerBrain } from '../ai/FollowerBrain.js';
import { npcStats } from '../combat/DamageSystem.js';
import { ITEMS } from '../data/items.js';
import { UNITS } from '../data/units.js';
import { army, applyLosses } from '../player/Army.js';

const SLOTS = [{ x: -1.8, z: 2.2 }, { x: 1.8, z: 2.2 }, { x: -3, z: 4 }, { x: 3, z: 4 }];
const BARKS = ['À vos ordres.', 'Je vous couvre.', 'On est avec vous, chef.', 'Dites où frapper.'];

export class Followers {
  constructor(G) { this.G = G; this.list = []; }
  spawn() {
    const G = this.G, p = G.core.state.player, P = G.player.pos;
    army(p).followers.forEach((unit, i) => {
      const u = UNITS[unit], armor = ITEMS[u.armor], sl = SLOTS[i % 4], x = P.x + sl.x, z = P.z + sl.z;
      const def = { follower: true, unit, role: 'companion', roleLabel: 'Compagnon', title: u.name, barks: BARKS };
      const a = new Actor({ id: 'compagnon' + i, kind: 'npc', name: u.name.replace(/s$/, '').replace(/s /, ' '), faction: 'joueur', def, x, z, yaw: G.player.yaw,
        stats: { ...npcStats({ hp: u.hp + p.level * 6, force: 6, armor: armor.armor }), moveSpeed: armor.speed ?? 1 }, weaponId: u.weapon,
        look: { armor: u.armor, cloak: p.appearance.cloak ?? '#3a2a22', tunic: u.tint, helmet: true, seed: 'f' + i } });
      a.pos.y = G.physics.groundAt(x, z, G.physics.groundFn(x, z) + 1);
      a.brain = new FollowerBrain(a, sl); a.hostileTo = o => G.hostile(a, o);
      G.addActor(a); this.list.push(a);
    });
  }
  update() {
    const G = this.G, P = G.player.pos;
    for (const a of this.list) if (a.alive && a.brain.state !== 'combat' && Math.hypot(a.pos.x - P.x, a.pos.z - P.z) > 40) {
      a.pos.x = P.x + a.brain.slot.x; a.pos.z = P.z + a.brain.slot.z; a.pos.y = G.physics.groundAt(a.pos.x, a.pos.z, P.y + 2);
    }
  }
  onDeath(a) {
    const G = this.G; applyLosses(G.core.state.player, { [a.def.unit]: 1 });
    G.ui.toast(`${a.name}, votre compagnon, est tombé au combat.`, 'warn');
  }
}
