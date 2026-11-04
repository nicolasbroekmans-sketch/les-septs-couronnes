// Suivi de chemin : ligne droite si la voie est libre, sinon chemin A* (budget limité par image).
export class Steering {
  constructor() { this.path = null; this.goal = null; this.age = 0; }
  /** Renvoie la direction normalisée {x,z} vers `goal`, ou null si arrivé (à `stop` mètres). */
  dir(actor, goal, W, dt, stop = .5) {
    const dx = goal.x - actor.pos.x, dz = goal.z - actor.pos.z, d = Math.hypot(dx, dz);
    if (d <= stop) { this.path = null; return null; }
    this.age += dt;
    if (!W.nav || W.nav.clear(actor.pos, goal)) { this.path = null; return { x: dx / d, z: dz / d, d }; }
    const moved = !this.goal || Math.hypot(this.goal.x - goal.x, this.goal.z - goal.z) > 3;
    if ((!this.path || moved || this.age > 2) && W.pathBudget > 0) {
      W.pathBudget--; this.age = 0; this.goal = { ...goal };
      this.path = W.nav.find(actor.pos, goal);
      if (this.path) this.path.shift();
    }
    if (!this.path?.length) return { x: dx / d, z: dz / d, d };
    let p = this.path[0];
    while (this.path.length > 1 && Math.hypot(p.x - actor.pos.x, p.z - actor.pos.z) < .8) { this.path.shift(); p = this.path[0]; }
    const px = p.x - actor.pos.x, pz = p.z - actor.pos.z, pd = Math.hypot(px, pz) || 1;
    return { x: px / pd, z: pz / pd, d };
  }
}
