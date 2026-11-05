// Conseiller : « que faire maintenant ? ». Logique pure (état + région + quêtes) → étapes concrètes classées,
// avec le personnage ou le lieu à rejoindre. Laisse de la place à l'exploration : il propose, il n'impose pas.
import { QUESTS } from '../quests/QuestRegistry.js';
import { BATTLES } from '../data/battles.js';
import { check } from '../core/Conditions.js';
import { xpForLevel } from '../player/Progression.js';
import { troopCount } from '../player/Army.js';

/** @returns [{ title, text, npc?, kind }] du plus urgent au moins urgent. */
export function advise(core, region) {
  const s = core.state, p = s.player, out = [], npcName = id => region?.npcs?.find(n => n.id === id)?.name ?? id;
  const tracked = s.world.tracked;
  if (tracked && s.quests[tracked]?.state === 'active') {
    const q = QUESTS[tracked], step = q.steps[s.quests[tracked].step];
    out.push({ kind: 'quest', title: q.title, text: step.text });
  }
  for (const c of s.world.contracts?.active ?? []) if (c.region === p.region) out.push({ kind: 'contract', title: 'Contrat : ' + c.title, text: c.kind === 'hunt' ? `Vainquez les brigands (${c.have}/${c.count}) : suivez la colonne de lumière.` : c.kind === 'deliver' ? `Remettez le pli à ${c.npcName} (parlez-lui).` : `Apportez ${c.qty} × ${c.item} au tableau des contrats.`, npc: c.kind === 'deliver' ? c.npc : null, at: c.kind === 'hunt' ? c.at : null });
  for (const [id, q] of Object.entries(QUESTS)) if (q.region === p.region && core.quests.canStart(id)) out.push({ kind: 'offer', title: 'Une mission vous attend', text: `${npcName(q.giver)} a une mission pour vous (« ! » doré au-dessus de sa tête) : « ${q.title} ».`, npc: q.giver });
  for (const [id, b] of Object.entries(BATTLES)) {
    if (b.region !== p.region || b.prologue || s.world.flags['won:' + id]) continue;
    const missing = [];
    for (const c of b.requires) if (!check(c, s)) missing.push(c.level ? `atteindre le niveau ${c.level} (il vous manque ${xpForLevel(p.level) - p.xp} XP pour le prochain niveau)` : `terminer la mission « ${QUESTS[c.quest]?.title} »`);
    const captain = region?.npcs?.find(n => n.role === 'captain'), recruiter = region?.npcs?.find(n => n.role === 'recruiter');
    if (missing.length) out.push({ kind: 'battle', title: b.name, text: `Pour débloquer cette grande bataille : ${missing.join(' et ')}.` });
    else if (troopCount(p) < 8 && recruiter) out.push({ kind: 'battle', title: 'Levez une armée', text: `${b.name} est prête, mais vous n’avez que ${troopCount(p)} homme(s). Engagez-en au moins 8 auprès de ${recruiter.name} (touche B pour voir votre armée).`, npc: recruiter.id });
    else if (captain) out.push({ kind: 'battle', title: b.name, text: `Tout est prêt ! Parlez à ${captain.name} et choisissez « je suis prêt ». En bataille : 2 pour tenir, puis 1 pour charger.`, npc: captain.id });
  }
  if (p.gold < 30) out.push({ kind: 'gold', title: 'Besoin d’or ?', text: 'Consultez le tableau des contrats près de l’entrée du lieu, vendez votre butin aux marchands, ou fouillez les ennemis vaincus (E).' });
  out.push({ kind: 'explore', title: 'Explorer', text: 'Visitez les lieux marqués sur la carte (M) pour gagner de l’expérience, ou voyagez vers une autre ville : chaque lieu a ses habitants, ses marchands et ses secrets.' });
  return out;
}
