// Quête « Personne » (Port-Réal) : un étranger aux yeux de deux couleurs propose de « devenir personne ».
// Aumônes, renoncement au nom, puis un « don » discret au Dieu Multiface. PNJ et textes originaux.
const Q = 'kl_noone';
export default {
  [Q]: {
    title: 'Personne', region: 'kingslanding', giver: 'etranger', category: 'Principale — Le Dieu Multiface',
    desc: 'Un étranger qui paie en pièces de fer affirme que n’importe qui peut devenir personne.', start: 'alms',
    steps: {
      alms: { text: '« Personne ne possède rien. » Donnez l’aumône à trois reprises aux mendiants de Port-Réal (le port, le Septuaire, Culpucier).',
        objectives: [{ type: 'signal', signal: 'alms', count: 3, label: 'Faire l’aumône aux mendiants (3)' }], next: 'name' },
      name: { text: 'Retournez voir l’étranger sur les quais. Il posera une question. Une seule réponse est la bonne.',
        objectives: [{ type: 'signal', signal: 'noone', label: 'Répondre à l’étranger, sur les quais' }], next: 'gift' },
      gift: { text: 'Le Dieu Multiface réclame un nom : Ser Morrec, le collecteur qui saigne Culpucier. Offrez-lui « le don »… sans être vu. Avancez accroupi (C) et frappez avant qu’il ne vous remarque.', any: true,
        objectives: [{ type: 'defeat', group: 'kl_morrec', count: 1, label: 'Offrir le don à Ser Morrec (place de Culpucier)', branch: 'back' },
          { type: 'signal', signal: 'refuse', label: 'Ou : refuser et garder votre nom', outcome: 'refused' }] },
      back: { text: 'C’est fait. Retournez voir l’étranger, sur les quais.', any: true,
        objectives: [{ type: 'signal', signal: 'clean', label: 'Retourner voir l’étranger', outcome: 'faceless' }, { type: 'signal', signal: 'seen', label: '', outcome: 'seen' }] }
    },
    outcomes: {
      faceless: { text: 'Valar dohaeris. Vous n’êtes plus tout à fait quelqu’un.', rewards: [{ removeItem: 'piece_fer' }, { item: 'dague_fer' }, { xp: 320 }, { cosmetic: 'titre_personne' }, { renown: 6 }, { flag: 'sans_visage' }] },
      seen: { text: 'On vous a vu. « Un homme qui est vu n’est pas encore personne. » Mais le don est fait.', rewards: [{ item: 'dague_fer' }, { xp: 160 }] },
      refused: { text: 'Vous gardez votre nom. L’étranger reprend sa pièce sans un mot et disparaît.', rewards: [{ removeItem: 'piece_fer' }, { xp: 60 }, { karma: 1 }] }
    }
  }
};
