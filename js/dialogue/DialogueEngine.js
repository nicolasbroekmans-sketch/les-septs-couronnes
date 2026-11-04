// Moteur de dialogues : arbres déclaratifs, conditions, tests de compétence déterministes, effets.
// Les options génériques (commerce, amende, reddition, au revoir) sont ajoutées selon le rôle du PNJ.
import { check } from '../core/Conditions.js';
import { derive } from '../player/Stats.js';
import { practice } from '../player/Progression.js';
import { attitude } from '../ai/Memory.js';
import { genericNodes } from './GenericDialogues.js';

export class DialogueEngine {
  constructor(game, trees) { this.game = game; this.trees = trees; this.cur = null; }

  /** npc : { id, name, role, faction, merchant, barks, surrendered } */
  open(npc) {
    this.game.bus.emit('npc:talk', { npc: npc.id });
    const tree = this.trees[npc.id] ?? { entries: [], nodes: {} };
    const generic = genericNodes(npc, this.game), nodes = { ...generic, ...tree.nodes };
    const special = tree.entries.find(e => check(e.when, this.game.state))?.node;
    const entry = npc.surrendered ? (tree.surrender ?? 'surrender') : generic.bounty ? 'bounty' : special ?? (generic.refuse ? 'refuse' : 'default');
    this.cur = { npc, nodes, node: entry };
    return this.view();
  }
  close() { this.cur = null; this.game.bus.emit('dialogue:closed', {}); }

  fmt(t) { return t.replaceAll('{name}', this.game.state.player.name); }
  score(c) {
    const p = this.game.state.player;
    return c.stat === 'persuade' ? derive(p).persuade : c.attr ? p.attrs[c.attr] * 10 : p.apt[c.apt] ?? 0;
  }
  options() {
    const { npc, nodes, node } = this.cur, s = this.game.state;
    const opts = (nodes[node].options ?? []).filter(o => check(o.when, s));
    const extra = [];
    if (npc.merchant && nodes[node].trade !== false && attitude(s, npc.id, npc.faction) !== 'hostile') extra.push({ text: 'Voyons vos marchandises.', trade: true });
    if (!opts.some(o => o.end) || nodes[node].bye) extra.push({ text: 'Au revoir.', end: true });
    return [...opts, ...extra];
  }
  view() {
    if (!this.cur) return null;
    const n = this.cur.nodes[this.cur.node];
    const text = typeof n.text === 'function' ? n.text(this.game.state) : n.text;
    return {
      npc: this.cur.npc, text: this.fmt(Array.isArray(text) ? text[Math.floor(Math.random() * text.length)] : text),
      options: this.options().map(o => ({ text: this.fmt(o.text) + (o.check ? ` [${o.check.label} ${o.check.dc}]` : ''), ok: !o.check || this.score(o.check) >= o.check.dc }))
    };
  }
  /** Choisit l'option i ; renvoie la vue suivante, ou null si la conversation se termine. */
  choose(i) {
    const o = this.options()[i]; if (!o) return this.view();
    if (o.trade) { const npc = this.cur.npc; this.close(); this.game.bus.emit('ui:trade', { npc: npc.id }); return null; }
    let branch = o;
    if (o.check) {
      const ok = this.score(o.check) >= o.check.dc;
      branch = ok ? (o.success ?? {}) : (o.failure ?? {});
      if (ok && o.check.stat === 'persuade') practice(this.game.state.player, 'diplomatie', 3);
      this.game.bus.emit('dialogue:check', { ok, label: o.check.label });
    }
    if (o.effects) this.game.effects(o.effects, { source: 'dialogue' });
    if (branch !== o && branch.effects) this.game.effects(branch.effects, { source: 'dialogue' });
    const next = branch.next ?? o.next;
    if (!next || o.end || branch.end) { this.close(); return null; }
    this.cur.node = next;
    return this.view();
  }
}
