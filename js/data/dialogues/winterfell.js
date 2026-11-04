// Dialogues de Winterfell.
const Q = 'wf_iron';
export default {
  torvald: {
    entries: [
      { when: { memory: 'betrayed', npc: 'torvald' }, node: 'cold' },
      { when: { quest: Q, step: 'back' }, node: 'back' },
      { when: { quest: Q, state: 'none' }, node: 'offer' },
      { when: { quest: Q, state: 'active' }, node: 'progress' },
      { when: [{ quest: 'wf_wolves', state: 'none' }, { flag: 'unlocked:wf_wolves' }], node: 'apprentice' }
    ],
    nodes: {
      default: { text: ['Le fer chante quand il est bien battu. Écoutez.', 'Une lame du Nord ne craint ni le froid ni l’ennemi.'] },
      cold: { text: 'Le fer de la garnison, vendu à un receleur… Prenez la porte.', trade: false },
      offer: { text: 'Vous tombez bien. Des déserteurs m’ont volé une caisse de fer destinée aux armures de la garnison. Ils se cachent dans le Bois-aux-Loups, au nord-ouest. Rapportez-la et je vous paierai, avec la gratitude de Winterfell.',
        options: [{ text: 'Je vous la ramène.', end: true, effects: [{ startQuest: Q }] }, { text: 'Pas pour le moment.', end: true }] },
      progress: { text: 'Le Bois-aux-Loups est au nord-ouest, passé la porte. Méfiez-vous : ce sont des soldats, pas des paysans.', bye: true },
      back: { text: 'Ma caisse ! Vous l’avez ? Posez-la là, que je la voie.',
        options: [{ text: 'La voici, intacte.', end: true, effects: [{ signal: [Q, 'give'] }] },
          { text: 'Je la garde. Ce fer vaut plus que votre récompense.', end: true, effects: [{ signal: [Q, 'keep'] }] }] },
      apprentice: { text: 'J’aurais besoin d’un apprenti. Maege, au bois sacré, connaît tout le monde. Demandez-lui.',
        options: [{ text: 'J’irai la voir.', end: true, effects: [{ startQuest: 'wf_wolves' }] }] }
    }
  },
  wat: {
    surrender: 'surrender_wat',
    entries: [{ when: { npcFlag: 'spared', npc: 'wat' }, node: 'forge' }],
    nodes: {
      surrender_wat: { text: 'Attendez ! Je… je m’appelle Wat. J’ai déserté parce qu’on crevait de faim au fort. Je n’ai tué personne, je le jure !', trade: false,
        options: [{ text: 'Épargner Wat. Rentre chez toi et deviens honnête.', end: true, effects: [{ npcFlag: { npc: 'wat', flag: 'spared' } }, { relation: { wat: 50 } }, { memory: { npc: 'wat', type: 'spared_by_player' } }, { xp: 30 }] },
          { text: 'Achever le déserteur.', end: true, effects: [{ kill: 'wat' }, { rep: { stark: 2 } }] }] },
      forge: { text: 'Vous ! Grâce à vous, j’ai une vie. Torvald m’apprend le métier. Prenez ça, c’est tout ce que j’ai.',
        options: [{ text: 'Merci, Wat.', end: true, when: { not: { flag: 'wat_gift' } }, effects: [{ item: 'onguent', qty: 2 }, { flag: 'wat_gift' }] }] }
    }
  },
  maege: {
    entries: [],
    nodes: { default: { text: ['Le barral voit tout, {name}. Ce que vous faites dans l’ombre, il le sait déjà.', 'Les sources chaudes ne gèlent jamais. Comme la rancune du Nord.'] } }
  },
  hilda: { entries: [], nodes: { default: { text: ['Une ration, une couverture, un onguent ? Le froid ne fait pas crédit.', 'Bienvenue à Winter Town. Essuyez vos bottes.'] } } }
};
