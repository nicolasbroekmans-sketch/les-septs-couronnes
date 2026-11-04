// Quêtes de Port-Réal. Textes originaux ; PNJ originaux.
export default {
  kl_bandits: {
    title: 'Les bandits de la route royale', region: 'kingslanding', giver: 'orwyn', category: 'Secondaire',
    desc: 'Les convois d’Orwyn Pell sont pillés sur la route de l’ouest.',
    start: 'wreck', failOn: [{ event: 'npc:killed', npc: 'orwyn', text: 'Orwyn Pell est mort. Personne ne paiera pour la route.' }],
    steps: {
      wreck: { text: 'Orwyn Pell a perdu trois convois. Examinez la charrette renversée sur la route, à l’ouest de la ville.',
        objectives: [{ type: 'interact', object: 'kl_wreck', label: 'Examiner la charrette renversée (ouest)' }], next: 'tracks' },
      tracks: { text: 'Des traces de bottes et de roues filent vers les collines. Suivez-les jusqu’au repaire des bandits.', enter: [{ flag: 'kl_ambush' }],
        objectives: [{ type: 'reach', marker: 'kl_camp', label: 'Trouver le camp des bandits' }], next: 'decide' },
      decide: { text: 'Les Chardons tiennent le camp. Leur cheffe, Nerys Brisecol, attend de voir ce que vous voulez : vous pouvez combattre, négocier… ou proposer un marché.', any: true,
        objectives: [
          { type: 'defeat', group: 'kl_bandits', count: 4, label: 'Vaincre les Chardons', branch: 'back_fight' },
          { type: 'signal', signal: 'negotiate', label: 'Ou : négocier leur départ avec Nerys', branch: 'back_peace' },
          { type: 'signal', signal: 'betray', label: 'Ou : trahir le marchand', branch: 'back_betray' }] },
      back_fight: { text: 'Le camp est tombé. Rapportez la nouvelle à Orwyn Pell, à la porte de la Rivière.', objectives: [{ type: 'talk', npc: 'orwyn', label: 'Retourner voir Orwyn Pell' }], complete: 'fight' },
      back_peace: { text: 'Les Chardons ont promis de quitter la route. Prévenez Orwyn Pell.', objectives: [{ type: 'talk', npc: 'orwyn', label: 'Retourner voir Orwyn Pell' }], complete: 'peace' },
      back_betray: { text: 'Vous avez partagé le butin des Chardons. Reste à savoir ce que vous direz à Orwyn…', any: true,
        objectives: [{ type: 'signal', signal: 'lie_ok', label: 'Convaincre Orwyn que la route est sûre', outcome: 'betray_hidden' },
          { type: 'signal', signal: 'exposed', label: '', outcome: 'betray_exposed' }] }
    },
    outcomes: {
      fight: { text: 'Orwyn a payé, et la route de l’ouest respire à nouveau.', unlocks: ['kl_letter'],
        rewards: [{ gold: 120 }, { xp: 160 }, { rep: { guet: 12, couronne: 5 } }, { relation: { orwyn: 25 } }, { renown: 5 }] },
      peace: { text: 'Sans un seul mort, la route est sûre. Orwyn n’en revient pas.', unlocks: ['kl_letter'],
        rewards: [{ gold: 90 }, { xp: 180 }, { rep: { guet: 6 } }, { relation: { orwyn: 20 } }, { renown: 4 }] },
      betray_hidden: { text: 'Orwyn vous a cru. Les Chardons continueront ailleurs, avec votre bénédiction.',
        rewards: [{ gold: 40 }, { xp: 100 }, { memory: { npc: 'orwyn', type: 'suspicious' } }] },
      betray_exposed: { text: 'Orwyn a compris. Il ne vous fera plus jamais confiance.',
        rewards: [{ xp: 60 }, { relation: { orwyn: -60 } }, { memory: { npc: 'orwyn', type: 'betrayed' } }, { rep: { guet: -20 } }] }
    }
  },
  kl_letter: {
    title: 'Le sceau du marchand', region: 'kingslanding', giver: 'orwyn', category: 'Secondaire',
    desc: 'Porter une lettre scellée au septon Hallis, au Grand Septuaire.', requires: { flag: 'unlocked:kl_letter' }, start: 'deliver',
    steps: { deliver: { text: 'Portez la lettre scellée d’Orwyn au septon Hallis, devant le Grand Septuaire.', objectives: [{ type: 'talk', npc: 'hallis', label: 'Remettre la lettre au septon Hallis' }], complete: 'done' } },
    outcomes: { done: { text: 'La lettre est arrivée. Le septon sourit d’un air entendu.', rewards: [{ removeItem: 'lettre_scellee' }, { gold: 60 }, { xp: 90 }, { rep: { couronne: 6 } }, { relation: { hallis: 15, orwyn: 10 } }] } }
  }
};
