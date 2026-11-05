// Vol à la tire (touche F près d'un passant) : chance selon la furtivité, la posture (accroupi), le fait d'être
// dans le dos de la cible et les gardes qui regardent. Réussite : quelques pièces, parfois un objet.
// Échec : la victime crie, s'en souvient, une prime tombe et les gardes proches se lancent à votre poursuite.
import { derive } from '../player/Stats.js';
import { practice } from '../player/Progression.js';
import { addItem } from '../player/Inventory.js';
import { remember, npcRecord } from '../ai/Memory.js';

export const POCKETABLE = ['villager', 'merchant', 'beggar', 'guard', 'priest'];
const PURSE = { villager: [2, 9], merchant: [8, 25], beggar: [0, 2], guard: [4, 14], priest: [3, 10] };
const ITEMS = ['ration', 'onguent', 'sel'];

/** ctx : { sneaking, behind, watchers } → probabilité de réussite (0,05 à 0,9). */
export function pickChance(p, ctx) { return Math.max(.05, Math.min(.9, derive(p).theft + (ctx.sneaking ? .25 : 0) + (ctx.behind ? .15 : 0) - ctx.watchers * .12 - (ctx.role === 'guard' ? .2 : 0))); }

export function pickpocket(core, npc, ctx, rng = Math.random) {
  const { state, bus } = core, p = state.player, rec = npcRecord(state, npc.id);
  if (rec.memory?.some(m => m.type === 'pickpocketed')) return { ok: false, reason: 'Ses poches sont déjà vides… et il se méfie.' };
  const chance = pickChance(p, { ...ctx, role: npc.role });
  if (rng() < chance) {
    const [a, b] = PURSE[npc.role] ?? [1, 6], gold = Math.round(a + rng() * (b - a)), item = rng() < .25 ? ITEMS[Math.floor(rng() * ITEMS.length)] : null;
    p.gold += gold; if (item) addItem(p, item, 1, bus);
    remember(state, npc.id, 'pickpocketed', gold); practice(p, 'furtivite', 3); p.karma = (p.karma ?? 0) - 1;
    bus.emit('player:gold', { amount: gold }); bus.emit('crime:pickpocket', { npc: npc.id, caught: false, gold, item });
    return { ok: true, gold, item, chance };
  }
  remember(state, npc.id, 'caught_pickpocket', 0); rec.relation -= 35;
  const f = ctx.law ?? 'guet'; p.bounty[f] = (p.bounty[f] ?? 0) + 30;
  bus.emit('crime:pickpocket', { npc: npc.id, caught: true, faction: f });
  return { ok: false, caught: true, chance, reason: 'Au voleur ! Au voleur !' };
}
