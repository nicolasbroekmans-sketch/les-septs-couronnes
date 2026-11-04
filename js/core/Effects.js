// Effets déclaratifs (récompenses, conséquences, options de dialogue). `game` fournit l'état, le bus
// et les services (quêtes, réputation) : aucune dépendance circulaire entre modules.
import { addItem, removeItem } from '../player/Inventory.js';
import { addXp } from '../player/Progression.js';
import { changeRep } from '../factions/Reputation.js';
import { npcRecord, remember } from '../ai/Memory.js';

export function apply(effects, game, ctx = {}) {
  const { state, bus } = game, p = state.player, out = [];
  for (const e of [effects].flat().filter(Boolean)) {
    if ('gold' in e) { p.gold = Math.max(0, p.gold + e.gold); bus.emit('player:gold', { amount: e.gold }); out.push(`${e.gold > 0 ? '+' : ''}${e.gold} or`); }
    if ('xp' in e) { addXp(p, e.xp, bus, ctx.source); out.push(`+${e.xp} XP`); }
    if (e.item) { addItem(p, e.item, e.qty ?? 1, bus); }
    if (e.removeItem) removeItem(p, e.removeItem, e.qty ?? 1, bus);
    if (e.rep) for (const [f, v] of Object.entries(e.rep)) changeRep(state, f, v, bus);
    if (e.relation) for (const [n, v] of Object.entries(e.relation)) { npcRecord(state, n).relation += v; bus.emit('npc:relation', { npc: n, value: v }); }
    if (e.memory) remember(state, e.memory.npc, e.memory.type, e.memory.note);
    if (e.flag) { state.world.flags[e.flag] = e.value ?? true; bus.emit('world:flag', { flag: e.flag }); }
    if (e.npcFlag) { npcRecord(state, e.npcFlag.npc).flags[e.npcFlag.flag] = e.npcFlag.value ?? true; bus.emit('npc:flag', e.npcFlag); }
    if ('renown' in e) p.renown += e.renown;
    if (e.startQuest) game.quests.start(e.startQuest);
    if (e.signal) bus.emit('quest:signal', { quest: e.signal[0], signal: e.signal[1] });
    if (e.hostile) bus.emit('npc:provoked', { npc: e.hostile, group: e.group });
    if (e.kill) bus.emit('npc:execute', { npc: e.kill });
    if (e.payBounty) { delete p.bounty[e.payBounty]; bus.emit('player:bounty', { faction: e.payBounty, value: 0 }); }
    if (e.pacify) bus.emit('group:pacified', { group: e.pacify });
    if (e.trade) bus.emit('ui:trade', { npc: e.trade });
    if (e.heal) bus.emit('player:heal', { amount: e.heal });
    if (e.advanceTime) bus.emit('world:advance', { minutes: e.advanceTime });
  }
  return out;
}
