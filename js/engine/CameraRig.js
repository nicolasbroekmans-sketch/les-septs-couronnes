// Caméra à la troisième personne au-dessus de l'épaule, avec zoom et collision contre le décor.
export class CameraRig {
  constructor(camera) { this.camera = camera; this.yaw = 0; this.pitch = -.15; this.dist = 4; this.want = 4; this.shoulder = .45; }
  input(dx, dy, wheel) {
    this.yaw -= dx * .0024; this.pitch = Math.max(-1.25, Math.min(.6, this.pitch - dy * .0024));
    if (wheel) this.want = Math.max(1.8, Math.min(8, this.want + wheel * .6));
  }
  update(target, physics, dt) {
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const pivot = { x: target.x + cy * this.shoulder, y: target.y + 1.65, z: target.z - sy * this.shoulder };
    const back = { x: sy * cp, y: -sp, z: cy * cp };
    const want = { x: pivot.x + back.x * this.want, y: pivot.y + back.y * this.want, z: pivot.z + back.z * this.want };
    const t = physics.raycast(pivot, want, .6);
    const d = Math.max(.6, this.want * t - .25);
    this.dist += (d - this.dist) * Math.min(1, (d < this.dist ? 25 : 5) * dt);
    const c = this.camera;
    c.position.set(pivot.x + back.x * this.dist, pivot.y + back.y * this.dist, pivot.z + back.z * this.dist);
    const gy = physics.groundFn(c.position.x, c.position.z) + .3; if (c.position.y < gy) c.position.y = gy;
    c.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
  /** Direction de visée (vers l'avant de la caméra). */
  aim() { const cp = Math.cos(this.pitch); return { x: -Math.sin(this.yaw) * cp, y: Math.sin(this.pitch), z: -Math.cos(this.yaw) * cp }; }
}
