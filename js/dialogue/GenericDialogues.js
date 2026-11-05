// Nœuds génériques : villageois (rumeurs, demander une pièce), mendiants (aumône), marchand méfiant,
// garde et amende, ennemi qui se rend. Les réactions varient et les PNJ se souviennent.
import { attitude } from '../ai/Memory.js';
import { armyNodes } from './ArmyDialogues.js';
import { book } from '../world/Contracts.js';

const REFUS = ['Ah non, je n’ai pas envie.', 'Va travailler, comme tout le monde !', 'Une pièce ? Et puis quoi encore, une maison ?', 'Les temps sont durs pour tout le monde, l’ami.', 'Je ne donne pas aux inconnus.'];
const DON = ['Bon… tiens, une pièce. Ne la bois pas d’un coup.', 'Tiens. Les Sept voient tout, paraît-il.', 'Une seule, hein. Et file.'];

export function genericNodes(npc, game) {
  const s = game.state, att = attitude(s, npc.id, npc.faction), bounty = s.player.bounty?.[npc.faction] ?? 0, R = game.regionDef;
  const rumors = R?.rumors ?? ['Rien de neuf. Le vent, le froid, les impôts.'];
  const nodes = {
    default: { text: npc.barks ?? ['Le bonjour.', 'Hm ?', 'Que les Sept vous gardent.'] },
    rumor: { text: rumors, options: [{ text: 'Autre chose ?', next: 'rumor' }] },
    coin_yes: { text: DON }, coin_no: { text: REFUS }, coin_again: { text: ['Encore toi ? Je t’ai déjà dit non.', 'Tu ne lâches jamais, toi.'] },
    surrender: {
      text: ['Pitié… je me rends ! Laissez-moi vivre…', 'C’est fini, j’ai jeté mon arme. Ne me tuez pas.'], trade: false,
      options: [
        { text: 'Épargner. Va-t’en, et ne recommence pas.', end: true, effects: [{ npcFlag: { npc: npc.id, flag: 'spared' } }, { relation: { [npc.id]: 40 } }, { memory: { npc: npc.id, type: 'spared_by_player' } }, { xp: 20 }, { karma: 1 }, { signal: [null, 'spared:' + npc.id] }] },
        { text: 'Achever.', end: true, effects: [{ kill: npc.id }, { memory: { npc: npc.id, type: 'executed' } }, { karma: -1 }] }
      ]
    }
  };
  if (npc.role === 'villager' || npc.role === 'guard') {
    nodes.default = { text: npc.barks ?? ['Le bonjour.'], options: [
      { text: 'Quelles sont les nouvelles ?', next: 'rumor' },
      npc.role === 'villager' ? { text: 'Tu n’aurais pas une pièce pour moi ?', when: { not: { memory: 'begged', npc: npc.id } }, chance: .25,
        success: { next: 'coin_yes', effects: [{ gold: 1 }, { memory: { npc: npc.id, type: 'begged' } }] }, failure: { next: 'coin_no', effects: [{ memory: { npc: npc.id, type: 'begged' } }, { relation: { [npc.id]: -3 } }] } } : null,
      npc.role === 'villager' ? { text: 'Tu n’aurais pas une pièce pour moi ?', when: { memory: 'begged', npc: npc.id }, next: 'coin_again' } : null
    ].filter(Boolean) };
  }
  if (npc.role === 'recruiter' || npc.role === 'captain') Object.assign(nodes, armyNodes(npc, game));
  if (npc.role === 'beggar') Object.assign(nodes, {
    default: { text: npc.barks ?? ['Une pièce, par pitié…'], options: [
      { text: 'Donner une pièce.', when: { gold: 1 }, next: 'alms', effects: [{ gold: -1 }, { relation: { [npc.id]: 10 } }, { karma: 1 }, { signal: [null, 'alms'] }] },
      { text: 'Donner dix pièces.', when: { gold: 10 }, next: 'alms_big', effects: [{ gold: -10 }, { relation: { [npc.id]: 25 } }, { karma: 3 }, { rep: { peuple: 2 } }, { signal: [null, 'alms'] }] },
      { text: 'Pourquoi mendies-tu ?', next: 'story' },
      { text: 'Tu as l’air d’en savoir long sur la ville…', when: [{ relationMin: 30, npc: npc.id }, { not: { flag: 'cache:' + npc.id } }], next: 'secret' },
      { text: 'Passer ton chemin.', end: true }] },
    alms: { text: ['Que les Sept vous bénissent, messire !', 'Merci… vous êtes le premier aujourd’hui.', 'Une pièce ! Ce soir, je mange.'] },
    alms_big: { text: ['Dix pièces ?! Je… je ne sais pas quoi dire. Je ne l’oublierai pas.', 'Les dieux vous le rendront, j’en suis sûr.'] },
    story: { text: npc.story ?? ['La guerre a brûlé ma ferme. Depuis, la rue est ma maison.'] },
    secret: { text: 'Pour vous, je parle : il y a une cache de contrebandiers non loin. Prenez ce qu’il y a, avant les autres.', options: [{ text: 'Merci, l’ami.', end: true, effects: [{ flag: 'cache:' + npc.id }, { gold: 35 }, { item: 'onguent' }, { xp: 40 }] }] }
  });
  if (npc.merchant && att === 'mefiant' && !s.player.skills.includes('contacts'))
    nodes.refuse = { text: 'Je ne commerce pas avec vous. Je me souviens de ce que vous avez fait.', trade: false };
  if (npc.role === 'guard' && bounty > 0)
    nodes.bounty = { text: `Halte ! Vous êtes recherché. L’amende est de ${bounty} pièces d’or.`, trade: false,
      options: [{ text: `Payer ${bounty} pièces d’or.`, when: { gold: bounty }, end: true, effects: [{ gold: -bounty }, { payBounty: npc.faction }] },
        { text: 'Jamais !', end: true, effects: [{ hostile: npc.id }] }] };
  const pli = book(s).active.find(c => c.kind === 'deliver' && c.npc === npc.id);
  if (pli) (nodes.default.options ??= []).unshift({ text: 'J’ai un pli pour vous (contrat).', next: 'pli', effects: [{ contract: pli.id }] });
  nodes.pli = { text: ['Ah ! Enfin. Merci, et pas un mot de ceci à quiconque.', 'Parfait. Voilà pour ta peine.'] };
  return nodes;
}
