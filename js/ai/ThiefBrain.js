// Tire-laine : flâne, repère le héros, s'approche l'air de rien, lui subtilise quelques pièces puis détale.
// Rattrapé (frappé, rendu ou tué), il rend l'or volé. S'il s'échappe, l'or est perdu.
import { NPCBrain } from './NPCBrain.js';

export class ThiefBrain extends NPCBrain {
  constructor(actor, G) { super(actor, { wander: 6, morale: .2, aggression: .2, canSurrender: true, surrenderAlways: true }); this.G = G; this.cool = 25 + Math.random() * 40; }
  routine(dt, W) {
    const a = this.actor, P = W.player;
    if (a.stolen || !P?.alive || (this.cool -= dt) > 0 || P.fighter.attacking || this.G.ui.modal) return super.routine(dt, W);
    const d = Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z);
    if (d > 24) return super.routine(dt, W);
    if (d < 1.3) return this.lift(W);
    const dir = this.steer.dir(a, P.pos, W, dt, 1) ?? { x: 0, z: 0 };
    a.turnTo(Math.atan2(-dir.x, -dir.z), dt, 6);
    return { x: dir.x * 3.1, z: dir.z * 3.1 };
  }
  lift(W) {
    const p = this.G.core.state.player, gold = Math.min(p.gold, 4 + Math.floor(Math.random() * 10));
    if (gold <= 0) { this.cool = 120; return { x: 0, z: 0 }; }
    p.gold -= gold; this.actor.stolen = gold;
    this.G.ui.bark(this.actor, 'Pardon, m’sieur…'); this.G.ui.toast(`Un tire-laine vous a volé ${gold} or ! Rattrapez-le et frappez-le pour récupérer votre bourse.`, 'warn');
    this.target = W.player; this.state = 'flee'; this.fleeT = 0;
    return { x: 0, z: 0 };
  }
}
