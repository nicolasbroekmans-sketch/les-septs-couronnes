// Dialogues du Mur.
const Q = 'wall_patrol';
export default {
  aldous: {
    entries: [
      { when: { quest: Q, state: 'none' }, node: 'offer' },
      { when: { quest: Q, state: 'active' }, node: 'progress' },
      { when: [{ quest: 'wall_report', state: 'none' }, { flag: 'unlocked:wall_report' }], node: 'report' }
    ],
    nodes: {
      default: { text: ['La nuit est sombre, et le froid ne pardonne pas.', 'Garde ton feu allumé, et ta lame à portée de main.'] },
      offer: { text: 'Toi. Tu n’as pas froid aux yeux, on dirait. Une patrouille part cette nuit au-delà du Mur, jusqu’au bosquet du barral. Il me manque une épée.',
        options: [{ text: 'Je viens avec vous.', end: true, effects: [{ startQuest: Q }, { rep: { garde: 3 } }] }, { text: 'Je ne suis pas encore prêt.', end: true }] },
      progress: { text: 'Le tunnel est au pied du Mur, derrière le réfectoire. Au nord, suis les pierres levées jusqu’au barral.', bye: true },
      report: { text: 'Va voir l’intendant Corwen au réfectoire. Il voudra ton rapport, mot pour mot.',
        options: [{ text: 'J’y vais.', end: true, effects: [{ startQuest: 'wall_report' }] }] }
    }
  },
  ygra: {
    surrender: 'choice',
    entries: [{ when: { quest: Q, step: 'choice' }, node: 'choice' }],
    nodes: {
      choice: { text: 'Alors, corbeau ? Tu vas me tuer comme les autres ? Fais vite, j’ai froid.', trade: false,
        options: [
          { text: 'Pars. Et dis aux tiens que tous les corbeaux ne se ressemblent pas.', end: true, effects: [{ signal: [Q, 'free'] }, { pacify: 'wall_ygra' }, { memory: { npc: 'ygra', type: 'freed' } }] },
          { text: 'Tu viens avec nous à Châteaunoir.', end: true, effects: [{ signal: [Q, 'prisoner'] }, { pacify: 'wall_ygra' }, { flag: 'ygra_prisoner' }] },
          { text: 'La loi du Mur est claire.', end: true, effects: [{ signal: [Q, 'execute'] }, { kill: 'ygra' }] }] }
    }
  },
  corwen: {
    entries: [{ when: { quest: 'wall_report', state: 'completed' }, node: 'after' }],
    nodes: {
      default: { text: ['Des rations, des fourrures, de l’huile. Tout se paie, même ici.', 'Le registre ne ment pas. Les hommes, si.'] },
      after: { text: 'Ton nom est dans le registre. C’est plus que la plupart n’en obtiendront jamais.' }
    }
  },
  dunstan: { entries: [], nodes: { default: { text: ['On m’a dit que le Mur était un honneur. On ne m’a pas parlé du froid.', 'Tu as entendu ? Les cors… non. Juste le vent.'] } } }
};
