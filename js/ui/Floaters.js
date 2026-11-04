// Nombres de dégâts et répliques flottantes, projetés depuis la 3D vers l'écran.
import { h } from './dom.js';

export class Floaters {
  constructor(root) { this.root = root; this.items = []; }
  add(actor, text, kind, life = 1.1) {
    const el = h('div.float.' + kind, {}, text);
    this.root.append(el);
    this.items.push({ el, actor, life, t: 0, dx: (Math.random() - .5) * 40, y0: kind === 'bark' ? 2.4 : 1.9 });
  }
  damage(actor, res) {
    if (res.dodged) return this.add(actor, 'Esquive', 'miss');
    if (res.parried) return this.add(actor, 'Parade !', 'parry');
    this.add(actor, (res.crit ? '✦ ' : '') + Math.round(res.amount), (actor.kind === 'player' ? 'hurt' : res.crit ? 'crit' : res.blocked ? 'blocked' : 'dmg'));
  }
  bark(actor, text) { this.add(actor, text, 'bark', 2.6); }
  update(dt, camera) {
    const v = (this.v ??= camera.position.clone());
    for (const it of this.items) {
      it.t += dt;
      v.set(it.actor.pos.x, it.actor.pos.y + it.y0 + it.t * (it.el.classList.contains('bark') ? 0 : .8), it.actor.pos.z).project(camera);
      const vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      it.el.style.opacity = vis ? Math.min(1, (it.life - it.t) * 3) : 0;
      it.el.style.transform = `translate(${(v.x * .5 + .5) * innerWidth + it.dx * it.t}px, ${(-v.y * .5 + .5) * innerHeight}px) translate(-50%, -50%)`;
    }
    this.items = this.items.filter(it => (it.t < it.life) || (it.el.remove(), false));
  }
}
