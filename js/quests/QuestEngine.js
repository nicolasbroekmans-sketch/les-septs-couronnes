// Moteur de quêtes piloté par les données. Une quête = étapes ; une étape = objectifs.
// Une étape `any` se termine au premier objectif accompli (branche). Rien n'est validé sans
// l'événement réel correspondant (dialogue, arrivée, ennemis vaincus, objet possédé…).
import { check } from '../core/Conditions.js';
import { count } from '../player/Inventory.js';
import { applyOutcome } from './QuestRewards.js';

const MATCH = {
  talk: (o, e, p) => e === 'npc:talk' && p.npc === o.npc,
  signal: (o, e, p, id) => e === 'quest:signal' && p.signal === o.signal && (!p.quest || p.quest === id),
  reach: (o, e, p) => e === 'marker:reached' && p.marker === o.marker,
  defeat: (o, e, p) => e === 'npc:defeated' && p.group === o.group,
  interact: (o, e, p) => e === 'object:used' && p.object === o.object
};

export class QuestEngine {
  constructor(game, registry) {
    this.game = game; this.defs = registry;
    for (const ev of ['npc:talk', 'quest:signal', 'marker:reached', 'npc:defeated', 'object:used', 'inventory:changed']) game.bus.on(ev, p => this.handle(ev, p));
    game.bus.on('npc:killed', p => this.checkFail('npc:killed', p));
  }
  get state() { return this.game.state; }
  status(id) { return this.state.quests[id]?.state ?? 'none'; }
  def(id) { const d = this.defs[id]; if (!d) throw new Error('Quête inconnue : ' + id); return d; }
  canStart(id) { return this.status(id) === 'none' && check(this.def(id).requires, this.state); }

  start(id) {
    if (!this.canStart(id)) return false;
    const d = this.def(id);
    this.state.quests[id] = { state: 'active', step: d.start, progress: {}, outcome: null, log: [d.steps[d.start].text] };
    this.game.bus.emit('quest:started', { quest: id, title: d.title });
    this.enter(id, d.start);
    return true;
  }
  enter(id, stepId) {
    const q = this.state.quests[id], step = this.def(id).steps[stepId];
    q.step = stepId; q.progress = {};
    if (step.enter) this.game.effects(step.enter, { source: id });
    this.game.bus.emit('quest:updated', { quest: id, step: stepId, text: step.text });
    this.handle('inventory:changed', {}); // un objet déjà possédé peut valider immédiatement
  }
  objectives(id) {
    const q = this.state.quests[id]; if (q?.state !== 'active') return [];
    return this.def(id).steps[q.step].objectives.map((o, i) => ({ ...o, done: this.done(id, o, i), have: q.progress[i] ?? 0 }));
  }
  done(id, o, i) {
    const q = this.state.quests[id];
    if (o.type === 'collect') return count(this.state.player, o.item) >= (o.count ?? 1);
    return (q.progress[i] ?? 0) >= (o.count ?? 1);
  }

  handle(ev, p) {
    for (const [id, q] of Object.entries(this.state.quests)) {
      if (q.state !== 'active') continue;
      const step = this.def(id).steps[q.step];
      let changed = false;
      step.objectives.forEach((o, i) => {
        if (this.done(id, o, i) && o.type !== 'collect') return;
        if (MATCH[o.type]?.(o, ev, p, id)) { q.progress[i] = (q.progress[i] ?? 0) + 1; changed = true; }
        if (o.type === 'collect' && ev === 'inventory:changed') changed = true;
      });
      if (changed) this.game.bus.emit('quest:progress', { quest: id });
      this.tryAdvance(id);
    }
  }
  tryAdvance(id) {
    const q = this.state.quests[id], d = this.def(id), step = d.steps[q.step];
    const doneIdx = step.objectives.map((o, i) => this.done(id, o, i));
    const finished = step.any ? doneIdx.indexOf(true) : (doneIdx.every(Boolean) ? 0 : -1);
    if (finished < 0) return;
    const o = step.objectives[finished];
    if (o.outcome ?? step.complete) return this.complete(id, o.outcome ?? step.complete);
    const next = o.branch ?? step.next;
    if (!next) throw new Error(`Étape sans suite : ${id}/${q.step}`);
    q.log.push(d.steps[next].text);
    this.enter(id, next);
  }
  complete(id, outcome) {
    const q = this.state.quests[id], d = this.def(id);
    q.state = 'completed'; q.outcome = outcome;
    q.log.push(d.outcomes[outcome].text);
    applyOutcome(this.game, id, d.outcomes[outcome]);
    this.game.bus.emit('quest:completed', { quest: id, title: d.title, outcome });
    return true;
  }
  fail(id, reason) {
    const q = this.state.quests[id]; if (q?.state !== 'active') return;
    q.state = 'failed'; q.log.push(reason);
    if (this.def(id).onFail) this.game.effects(this.def(id).onFail, { source: id });
    this.game.bus.emit('quest:failed', { quest: id, title: this.def(id).title, reason });
  }
  checkFail(ev, p) {
    for (const [id, q] of Object.entries(this.state.quests)) {
      if (q.state !== 'active') continue;
      for (const f of this.def(id).failOn ?? []) if (f.event === ev && f.npc === p.npc) this.fail(id, f.text ?? 'La quête a échoué.');
    }
  }
}
