// Interaction contextuelle (touche E) : parler, épargner, fouiller un corps, examiner ou prendre un objet.
import { dist, angleTo } from '../combat/CombatSystem.js';
import { pickpocket, pickChance, POCKETABLE } from '../economy/Pickpocket.js';

export class Interaction {
  constructor(game) { this.game = game; this.current = null; }
  find() {
    const G = this.game, p = G.player, out = [];
    if (!p?.alive) return null;
    for (const a of G.actors) {
      if (a === p || a.kind === 'crowd' || !a.alive || a.hidden || a.brain?.state === 'flee') continue;
      if (!a.surrendered && G.hostile(a, p)) continue;
      const d = dist(a.pos, p.pos); if (d < 3.5) out.push({ kind: 'npc', ref: a, d, label: a.surrendered ? `Décider du sort de ${a.name}` : `Parler à ${a.name}${this.canPick(a) ? ` · <kbd>F</kbd> voler (${Math.round(pickChance(G.core.state.player, this.pickCtx(a)) * 100)} %)` : ''}` });
    }
    for (const o of G.region?.objects() ?? []) { const d = Math.hypot(o.x - p.pos.x, o.z - p.pos.z); if (d < (o.r ?? 2) + 1) out.push({ kind: 'object', ref: o, d, label: o.label }); }
    for (const dr of G.env?.doors ?? []) { const d = Math.hypot(dr.x - p.pos.x, dr.z - p.pos.z); if (d < 2.2 && Math.abs((dr.to.y ?? p.pos.y) - p.pos.y) < 400) out.push({ kind: 'door', ref: dr, d: d - 1, label: dr.label }); }
    for (const l of G.region?.loot ?? []) { const d = Math.hypot(l.x - p.pos.x, l.z - p.pos.z); if (d < 2.4) out.push({ kind: 'loot', ref: l, d, label: `Fouiller le corps de ${l.name}` }); }
    // préférence pour ce qui est devant le joueur
    for (const c of out) { const pos = c.ref.pos ?? c.ref; c.score = c.d + angleTo(p.pos, p.yaw, pos) * 1.2 - (c.kind === 'object' ? 1.5 : 0); }
    out.sort((a, b) => a.score - b.score);
    return (this.current = out[0] ?? null);
  }
  canPick(a) { return POCKETABLE.includes(a.def.role) && !a.surrendered && !a.def.follower && !this.game.battle; }
  pickCtx(a) {
    const G = this.game, p = G.player, law = G.region.def.lawFaction;
    const watchers = G.actors.filter(o => o !== a && o.alive && o.def?.role === 'guard' && o.faction === law && dist(o.pos, p.pos) < 15 && angleTo(o.pos, o.yaw, p.pos) < 1.3).length;
    return { sneaking: !!p.sneaking, behind: angleTo(a.pos, a.yaw, p.pos) > 1.9, watchers, law };
  }
  /** Touche F : vol à la tire sur le passant visé. */
  pick() {
    const c = this.current, G = this.game; if (c?.kind !== 'npc' || !this.canPick(c.ref)) return;
    const a = c.ref, r = pickpocket(G.core, { id: a.id, role: a.def.role }, this.pickCtx(a), G.rng);
    if (r.ok) return G.ui.toast(`Vol réussi : +${r.gold} or${r.item ? ' et un objet' : ''}. Personne n’a rien vu… pour l’instant.`, 'loot');
    if (!r.caught) return G.ui.toast(r.reason, 'info');
    G.ui.bark(a, 'Au voleur ! À la garde !'); G.ui.toast('Pris sur le fait ! Les gardes vous poursuivent — fuyez loin, ou payez votre amende à un garde.', 'warn');
    for (const o of G.actors) if (o.alive && o.def?.role === 'guard' && o.faction === G.region.def.lawFaction && dist(o.pos, a.pos) < 40) { o.provoked = true; o.brain?.engage(G.player, G.world); setTimeout(() => (o.provoked = false), 90000); }
  }
  use() {
    const c = this.current, G = this.game; if (!c) return;
    if (c.kind === 'npc') return G.openDialogue(c.ref);
    if (c.kind === 'object') { const txt = G.region.useObject(c.ref); if (txt) G.ui.toast(txt, 'lore'); return; }
    if (c.kind === 'door') return G.goThrough(c.ref);
    if (c.kind === 'loot') G.ui.toast('Butin : ' + G.region.takeLoot(c.ref), 'loot');
  }
}
