// Déplacement partagé (acteurs complets et soldats légers) : collisions, marches, gravité, rotation.
const GRAVITY = 24;

export const Motion = {
  /** Déplacement d'un vecteur (m) avec collisions, marches, gravité. */
  move(dx, dz, dt, physics) {
    const n = Math.ceil(Math.hypot(dx, dz) / .25) || 1;
    for (let i = 0; i < n; i++) { this.pos.x += dx / n; this.pos.z += dz / n; physics.collide(this.pos, this.pos.y, this.radius); }
    const g = physics.groundAt(this.pos.x, this.pos.z, this.pos.y), near = this.pos.y - g < .45 && this.vy <= 0;
    this.vy -= GRAVITY * dt; this.pos.y += this.vy * dt;
    if (this.pos.y <= g || near) { this.pos.y = g; this.vy = 0; this.onGround = true; } else this.onGround = false;
    this.speed = this.speed * .8 + (Math.hypot(dx, dz) / Math.max(dt, 1e-4)) * .2;
  },
  turnTo(yaw, dt, rate = 10) {
    let d = yaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, rate * dt);
  },
  faceTo(p, dt, rate = 10) { this.turnTo(Math.atan2(-(p.x - this.pos.x), -(p.z - this.pos.z)), dt, rate); }
};
