// Conditions déclaratives (quêtes, dialogues, apparition des PNJ). Données sérialisables, évaluation pure.
import { count } from '../player/Inventory.js';

export function check(cond, state) {
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.every(c => check(c, state));
  if (cond.all) return cond.all.every(c => check(c, state));
  if (cond.any) return cond.any.some(c => check(c, state));
  if (cond.not) return !check(cond.not, state);
  const p = state.player;
  if (cond.quest) {
    const q = state.quests[cond.quest], st = q?.state ?? 'none';
    if (cond.state && (Array.isArray(cond.state) ? !cond.state.includes(st) : cond.state !== st)) return false;
    if (cond.step && (st !== 'active' || (Array.isArray(cond.step) ? !cond.step.includes(q.step) : q.step !== cond.step))) return false;
    if (cond.outcome && q?.outcome !== cond.outcome) return false;
    return true;
  }
  if (cond.memory) return !!state.npcs[cond.npc]?.memory?.some(m => m.type === cond.memory);
  if ('relationMin' in cond) return (state.npcs[cond.npc]?.relation ?? 0) >= cond.relationMin;
  if (cond.flag) return !!state.world.flags[cond.flag] === (cond.value ?? true);
  if (cond.npcFlag) return state.npcs[cond.npc]?.flags?.[cond.npcFlag] === (cond.value ?? true);
  if (cond.dead) return state.npcs[cond.dead]?.alive === false;
  if (cond.item) return count(p, cond.item) >= (cond.qty ?? 1);
  if ('gold' in cond) return p.gold >= cond.gold;
  if ('level' in cond) return p.level >= cond.level;
  if (cond.repMin) return (state.factions[cond.repMin[0]] ?? 0) >= cond.repMin[1];
  if (cond.region) return p.region === cond.region;
  if (cond.night !== undefined) return (state.world.time.minutes / 60 % 24 >= 20 || state.world.time.minutes / 60 % 24 < 6) === cond.night;
  throw new Error('Condition inconnue : ' + JSON.stringify(cond));
}
