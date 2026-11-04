// Quêtes de Winterfell.
export default {
  wf_iron: {
    title: 'Le fer volé', region: 'winterfell', giver: 'torvald', category: 'Faction — Stark',
    desc: 'Des déserteurs ont volé le fer destiné aux armures de la garnison.', start: 'find',
    failOn: [{ event: 'npc:killed', npc: 'torvald', text: 'Le forgeron est mort.' }],
    steps: {
      find: { text: 'Une caisse de fer forgé a été volée par des déserteurs cachés dans le Bois-aux-Loups, au nord-ouest des remparts.',
        objectives: [{ type: 'reach', marker: 'wf_camp', label: 'Trouver le camp des déserteurs (nord-ouest)' }], next: 'recover' },
      recover: { text: 'Les déserteurs gardent la caisse dans leur camp. Reprenez-la, par la force s’il le faut.',
        objectives: [{ type: 'collect', item: 'caisse_fer', count: 1, label: 'Récupérer la caisse de fer' }], next: 'back' },
      back: { text: 'Rapportez la caisse à Torvald, à la forge de Winterfell. Ou gardez-la : le fer se vend bien.', any: true,
        objectives: [{ type: 'signal', signal: 'give', label: 'Rendre la caisse à Torvald', outcome: 'returned' },
          { type: 'signal', signal: 'keep', label: 'Ou : garder le fer pour vous', outcome: 'kept' }] }
    },
    outcomes: {
      returned: { text: 'Torvald a son fer, et Winterfell vous doit une fière chandelle.', unlocks: ['wf_wolves'],
        rewards: [{ removeItem: 'caisse_fer' }, { gold: 90 }, { xp: 160 }, { rep: { stark: 15 } }, { relation: { torvald: 30 } }, { renown: 4 }] },
      kept: { text: 'Vous avez vendu le fer à un receleur. Torvald ne l’oubliera pas.',
        rewards: [{ removeItem: 'caisse_fer' }, { gold: 160 }, { xp: 80 }, { rep: { stark: -15 } }, { relation: { torvald: -45 } }, { memory: { npc: 'torvald', type: 'betrayed' } }] }
    }
  },
  wf_wolves: {
    title: 'Un nouvel apprenti', region: 'winterfell', giver: 'torvald', category: 'Secondaire',
    desc: 'Torvald cherche quelqu’un de confiance pour l’aider à la forge.', requires: { flag: 'unlocked:wf_wolves' }, start: 'ask',
    steps: { ask: { text: 'Parlez à la gardienne du bois sacré, Maege : elle connaît tout le monde à Winter Town.', objectives: [{ type: 'talk', npc: 'maege', label: 'Parler à Maege, dans le bois sacré' }], complete: 'done' } },
    outcomes: { done: { text: 'Maege enverra son neveu à la forge.', rewards: [{ xp: 70 }, { gold: 30 }, { relation: { torvald: 10, maege: 10 } }] } }
  }
};
