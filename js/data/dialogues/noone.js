// Dialogues de l'étranger à la pièce de fer (quête « Personne »).
const Q = 'kl_noone';
export default {
  etranger: {
    entries: [
      { when: { quest: Q, state: 'none' }, node: 'offer' },
      { when: { quest: Q, step: 'name' }, node: 'who' },
      { when: [{ quest: Q, step: 'back' }, { flag: 'noone_clean' }], node: 'clean' },
      { when: { quest: Q, step: 'back' }, node: 'seen' },
      { when: { quest: Q, step: 'gift' }, node: 'gift' },
      { when: { quest: Q, state: 'active' }, node: 'progress' },
      { when: { flag: 'sans_visage' }, node: 'after' }
    ],
    nodes: {
      default: { text: 'Un homme passe. Un autre homme regarde la mer. Rien de plus.', trade: false },
      offer: { text: 'Valar morghulis. Tous les hommes doivent mourir… et pourtant certains vivent comme s’ils étaient éternels. Vous cherchez autre chose, je le vois. Prenez cette pièce. Si vous voulez devenir personne, il faut d’abord ne plus rien posséder.',
        options: [{ text: 'Je prends la pièce.', end: true, effects: [{ item: 'piece_fer' }, { startQuest: Q }] },
          { text: '« Valar morghulis » ? Qu’est-ce que ça veut dire ?', next: 'explain' }, { text: 'Je n’ai pas de temps pour les énigmes.', end: true }] },
      explain: { text: 'Dans une cité lointaine, au-delà de la mer, un dieu a cent visages. Ceux qui le servent n’en ont aucun. Et la réponse à « valar morghulis », c’est « valar dohaeris » : tous les hommes doivent servir.',
        options: [{ text: 'Je prends la pièce.', end: true, effects: [{ item: 'piece_fer' }, { startQuest: Q }] }] },
      progress: { text: 'Personne ne possède rien. Les pauvres de cette ville attendent ce que vous croyez posséder.', bye: true },
      who: { text: 'Les mains vides, enfin. Alors dites-moi : qui êtes-vous ?',
        options: [{ text: '{name}.', next: 'wrong' }, { text: 'Un voyageur. Un épée à louer.', next: 'wrong' }, { text: 'Personne.', next: 'right', effects: [{ signal: [Q, 'noone'] }] }] },
      wrong: { text: 'Un homme qui a un nom ne peut pas servir le Dieu Multiface. Je repose la question : qui êtes-vous ?', options: [{ text: 'Personne.', next: 'right', effects: [{ signal: [Q, 'noone'] }] }, { text: '{name}. Et ça ne changera pas.', end: true }] },
      right: { text: 'Bien. Alors personne a un don à faire. Ser Morrec, collecteur des impôts, saigne Culpucier jusqu’à l’os. Offrez-lui le don. Que personne ne vous voie.', bye: true },
      gift: { text: 'Le nom est donné. Le don n’est pas encore fait.', options: [{ text: 'Je refuse. Je garde mon nom.', end: true, effects: [{ signal: [Q, 'refuse'] }] }], bye: true },
      clean: { text: 'Personne n’a rien vu. Personne n’a rien fait. Valar dohaeris.', options: [{ text: 'Valar dohaeris.', end: true, effects: [{ signal: [Q, 'clean'] }] }] },
      seen: { text: 'On vous a vu. Un homme qui est vu n’est pas encore personne. Le don est fait, pourtant.', options: [{ text: 'Je ferai mieux.', end: true, effects: [{ signal: [Q, 'seen'] }] }] },
      after: { text: 'Une fille… pardon, une personne. Valar morghulis.', trade: false }
    }
  }
};
