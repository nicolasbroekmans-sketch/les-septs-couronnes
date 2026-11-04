// Nœuds génériques : bavardage, marchand méfiant, garde et amende, ennemi qui se rend.
import { attitude } from '../ai/Memory.js';

export function genericNodes(npc, game) {
  const s = game.state, att = attitude(s, npc.id, npc.faction), bounty = s.player.bounty?.[npc.faction] ?? 0;
  const nodes = {
    default: { text: npc.barks ?? ['Le bonjour.', 'Hm ?', 'Que les Sept vous gardent.'] },
    surrender: {
      text: ['Pitié… je me rends ! Laissez-moi vivre…', 'C’est fini, j’ai jeté mon arme. Ne me tuez pas.'], trade: false,
      options: [
        { text: 'Épargner. Va-t’en, et ne recommence pas.', end: true, effects: [{ npcFlag: { npc: npc.id, flag: 'spared' } }, { relation: { [npc.id]: 40 } }, { memory: { npc: npc.id, type: 'spared_by_player' } }, { xp: 20 }, { signal: [null, 'spared:' + npc.id] }] },
        { text: 'Achever.', end: true, effects: [{ kill: npc.id }, { memory: { npc: npc.id, type: 'executed' } }] }
      ]
    }
  };
  if (npc.merchant && att === 'mefiant' && !s.player.skills.includes('contacts'))
    nodes.refuse = { text: 'Je ne commerce pas avec vous. Je me souviens de ce que vous avez fait.', trade: false };
  if (npc.role === 'guard' && bounty > 0)
    nodes.bounty = { text: `Halte ! Vous êtes recherché. L’amende est de ${bounty} pièces d’or.`, trade: false,
      options: [{ text: `Payer ${bounty} pièces d’or.`, when: { gold: bounty }, end: true, effects: [{ gold: -bounty }, { payBounty: npc.faction }] },
        { text: 'Jamais !', end: true, effects: [{ hostile: npc.id }] }] };
  return nodes;
}
