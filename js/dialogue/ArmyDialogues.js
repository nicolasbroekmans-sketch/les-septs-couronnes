// Recruteur (engager des hommes) et capitaine de guerre (lancer les grandes batailles de la région).
import { BATTLES } from '../data/battles.js';
import { UNITS } from '../data/units.js';

export function armyNodes(npc, game) {
  const region = game.state.player.region, nodes = {};
  if (npc.role === 'recruiter') Object.assign(nodes, {
    default: { text: ['Tu cherches des bras ? J’ai des gars solides, et ils ne coûtent pas cher… enfin, pas trop.', 'Des lances, des arcs, des épées. Tout se loue, l’ami.'], options: [
      { text: 'Je veux engager des hommes.', end: true, effects: [{ openArmy: true }] },
      { text: 'Que proposes-tu ?', next: 'prices' }, { text: 'À quoi me serviraient-ils ?', next: 'why' }] },
    prices: { text: [Object.values(UNITS).map(u => `${u.name} : ${u.cost} or`).join(' · ') + '. Les meilleurs ne suivent que les gens connus.'], options: [{ text: 'Montre-moi.', end: true, effects: [{ openArmy: true }] }] },
    why: { text: ['Deux ou trois t’accompagnent partout comme compagnons. Les autres attendent au camp : quand viendra la vraie bataille, ils seront en première ligne. Parle au capitaine.'], options: [{ text: 'Compris.', next: 'default' }] }
  });
  if (npc.role === 'captain') {
    const list = Object.entries(BATTLES).filter(([, b]) => b.region === region);
    nodes.default = { text: ['Les éclaireurs ne parlent que de ça : ça va saigner. Il me faut quelqu’un pour mener les hommes.', 'Un vrai chef ne compte pas ses ennemis. Il compte ses lances.'], options: [
      ...list.map(([id, b]) => ({ text: `${b.name} : je suis prêt.`, when: b.requires, end: true, effects: [{ startBattle: id }] })),
      ...list.map(([id, b]) => ({ text: `${b.name} : de quoi s’agit-il ?`, next: 'brief_' + id })),
      { text: 'Comment commander ?', next: 'orders' }] };
    for (const [id, b] of list) nodes['brief_' + id] = { text: [`${b.desc} En face : ${b.enemy.name}. Je fournis ${Object.values(b.allies.units).reduce((a, c) => a + c, 0)} hommes ; à toi d’amener les tiens. Reviens quand tu auras le niveau ${b.requires.find(c => c.level)?.level ?? 1} et que la région sera sûre.`], options: [{ text: 'Je reviendrai.', next: 'default' }] };
    nodes.orders = { text: ['Sur le champ, touche 1 : on charge. 2 : on tient la ligne. 3 : tout le monde sur toi. Si l’ennemi perd sept hommes sur dix, il fuit. Si c’est nous… ne pense même pas à ça.'], options: [{ text: 'Bien.', next: 'default' }] };
  }
  return nodes;
}
