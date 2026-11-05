// Contrats en jeu : tableau près de l'entrée de chaque lieu, brigands des chasses placés autour, remises.
import { book, onDefeated, turnIn } from '../world/Contracts.js';
import { npcRecord } from '../ai/Memory.js';

export class ContractRuntime {
  constructor(G) {
    this.G = G; const bus = G.core.bus;
    bus.on('npc:defeated', ({ group }) => { const c = group && onDefeated(G.core.state, group); if (c && c.have >= c.count) this.pay(c.id); });
    bus.on('contract:done', c => G.ui.toast(`Contrat rempli : « ${c.title} » — +${c.reward} or, +${c.xp} XP.`, 'quest-done'));
  }
  pay(id) { return turnIn(this.G.core, id); }
  enter(def) {
    const G = this.G; if (!def.lawFaction || def.battle || G.core.state.explore) return;
    const s = def.spawn, x = s.x - 6, z = s.z - 5, { ctx } = G, y = G.physics.groundFn(x, z), wood = ctx.mat('weathered_planks', { uv: 2, color: '#7a5a3a' });
    for (const k of [-1, 1]) ctx.box(.15, 2.4, .15, x + k * .9, y, z, wood);
    ctx.box(2.1, 1.2, .1, x, y + 1.1, z, wood, { solid: false });
    for (let i = 0; i < 4; i++) ctx.box(.34, .44, .02, x - .6 + i * .4, y + 1.5 - (i % 2) * .4, z + .06, ctx.mat(null, { color: '#efe4c9' }), { solid: false });
    ctx.roof(2.6, .5, .6, x, y + 2.4, z, wood, { rotY: 0 });
    if (!def.objects.some(o => o.id === 'board')) def.objects.push({ id: 'board', x, z, r: 1.6, label: 'Consulter le tableau des contrats', effects: [{ openContracts: true }] });
    for (const c of book(G.core.state).active) if (c.kind === 'hunt' && c.region === def.id && c.have < c.count) this.spawnHunt(def, c);
  }
  /** Brigands d'une chasse : à 60–90 m de l'entrée, dans les limites du lieu. */
  spawnHunt(def, c) {
    const G = this.G, [x0, z0, x1, z1] = def.bounds, s = def.spawn;
    if (!c.at) { const a = G.rng() * 6.28, r = 60 + G.rng() * 30; c.at = [Math.max(x0 + 10, Math.min(x1 - 10, s.x + Math.cos(a) * r)), Math.max(z0 + 10, Math.min(z1 - 10, s.z + Math.sin(a) * r))]; }
    for (let i = 0; i < c.count; i++) {
      const id = `contract_${c.id}_${i}`; if (npcRecord(G.core.state, id).alive === false || G.region.actors.has(id)) continue;
      const a = G.region.spawn({ id, name: 'Brigand', role: 'enemy', extra: true, faction: 'bandits', group: 'contract_' + c.id, x: c.at[0] + (i - 1) * 2.5, z: c.at[1] + (i % 2) * 2, weapon: ['hachette', 'epee_courte', 'lance'][i % 3], armor: 'cuir', hp: 55 + G.core.state.player.level * 6,
        loot: { gold: [3, 10], items: ['ration', 'fourrure'] }, look: { tunic: '#4a3a2a', cloak: '#3a2a1a' }, ai: { canSurrender: true, aggression: .6, wander: 5 } });
      a.brain.def = { ...a.brain.def, canSurrender: true };
    }
  }
}
