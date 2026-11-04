// Interaction contextuelle (touche E) : parler, épargner, fouiller un corps, examiner ou prendre un objet.
import { dist, angleTo } from '../combat/CombatSystem.js';

export class Interaction {
  constructor(game) { this.game = game; this.current = null; }
  find() {
    const G = this.game, p = G.player, out = [];
    if (!p?.alive) return null;
    for (const a of G.actors) {
      if (a === p || !a.alive || a.hidden || a.brain?.state === 'flee') continue;
      if (!a.surrendered && G.hostile(a, p)) continue;
      const d = dist(a.pos, p.pos); if (d < 3.5) out.push({ kind: 'npc', ref: a, d, label: a.surrendered ? `Décider du sort de ${a.name}` : `Parler à ${a.name}` });
    }
    for (const o of G.region?.objects() ?? []) { const d = Math.hypot(o.x - p.pos.x, o.z - p.pos.z); if (d < (o.r ?? 2) + 1) out.push({ kind: 'object', ref: o, d, label: o.label }); }
    for (const l of G.region?.loot ?? []) { const d = Math.hypot(l.x - p.pos.x, l.z - p.pos.z); if (d < 2.4) out.push({ kind: 'loot', ref: l, d, label: `Fouiller le corps de ${l.name}` }); }
    // préférence pour ce qui est devant le joueur
    for (const c of out) { const pos = c.ref.pos ?? c.ref; c.score = c.d + angleTo(p.pos, p.yaw, pos) * 1.2; }
    out.sort((a, b) => a.score - b.score);
    return (this.current = out[0] ?? null);
  }
  use() {
    const c = this.current, G = this.game; if (!c) return;
    if (c.kind === 'npc') return G.openDialogue(c.ref);
    if (c.kind === 'object') { const txt = G.region.useObject(c.ref); if (txt) G.ui.toast(txt, 'lore'); return; }
    if (c.kind === 'loot') G.ui.toast('Butin : ' + G.region.takeLoot(c.ref), 'loot');
  }
}
