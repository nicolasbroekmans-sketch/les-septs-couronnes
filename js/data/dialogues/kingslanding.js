// Dialogues de Port-Réal. Conditions et effets déclaratifs (voir core/Conditions.js et core/Effects.js).
const Q = 'kl_bandits';
export default {
  orwyn: {
    entries: [
      { when: { memory: 'betrayed', npc: 'orwyn' }, node: 'cold' },
      { when: { quest: Q, step: 'back_betray' }, node: 'betray_return' },
      { when: [{ quest: Q, state: 'completed' }, { flag: 'orwyn_thanked', value: false }, { not: { memory: 'suspicious', npc: 'orwyn' } }], node: 'thanks' },
      { when: [{ quest: 'kl_letter', state: 'none' }, { flag: 'unlocked:kl_letter' }], node: 'letter' },
      { when: { quest: Q, state: 'none' }, node: 'offer' },
      { when: { quest: Q, state: 'active' }, node: 'progress' }
    ],
    nodes: {
      default: { text: 'Toiles de Myr, sel, vin de La Treille… Les affaires reprennent, grâce à vous.' },
      cold: { text: 'Je sais ce que vous avez fait sur la route. Disparaissez, ou j’appelle le Guet.', trade: false },
      offer: { text: 'Vous avez l’air de savoir tenir une lame. Trois convois pillés sur la route de l’ouest, {name}. Trois ! Le Guet hausse les épaules. Trouvez ces bandits, et je paierai cent vingt dragons.',
        options: [
          { text: 'J’accepte. Où ont-ils frappé ?', next: 'accepted', effects: [{ startQuest: Q }] },
          { text: 'Cent vingt ? Il faudra une avance.', check: { stat: 'persuade', dc: 35, label: 'Persuasion' },
            success: { next: 'advance', effects: [{ gold: 30 }, { startQuest: Q }] }, failure: { next: 'no_advance' } },
          { text: 'Pas maintenant.', end: true }] },
      advance: { text: 'Hmpf. Trente dragons, et pas un de plus. La charrette est renversée sur la route, à l’ouest de la ville.', bye: true },
      no_advance: { text: 'Une avance ? Je ne paie pas les promesses. Revenez quand vous voudrez travailler.', options: [{ text: 'Soit. J’accepte quand même.', next: 'accepted', effects: [{ startQuest: Q }] }] },
      accepted: { text: 'Prenez la porte des Dieux et la route de l’ouest. Vous verrez la charrette. Les traces partent de là.', bye: true },
      progress: { text: 'Alors, ces bandits ? Chaque jour qui passe me coûte une fortune.', bye: true },
      thanks: { text: 'Le camp est vidé ? Les Sept soient loués ! Voici votre dû, et ma gratitude avec.', options: [{ text: 'Avec plaisir.', end: true, effects: [{ flag: 'orwyn_thanked' }] }] },
      letter: { text: 'J’ai une dernière chose, puisque vous êtes fiable. Portez cette lettre au septon Hallis, devant le Grand Septuaire. Sans l’ouvrir.',
        options: [{ text: 'Je m’en charge.', end: true, effects: [{ item: 'lettre_scellee' }, { startQuest: 'kl_letter' }] }, { text: 'Une autre fois.', end: true }] },
      betray_return: { text: 'Vous revoilà ! Alors, ces bandits ? Je vous vois bien pâle…',
        options: [
          { text: 'Ils ont fui vers le sud. La route est sûre.', check: { stat: 'persuade', dc: 40, label: 'Persuasion' },
            success: { end: true, effects: [{ signal: [Q, 'lie_ok'] }] }, failure: { next: 'caught', effects: [{ signal: [Q, 'exposed'] }] } },
          { text: 'Je… j’ai fait un marché avec eux.', next: 'caught', effects: [{ signal: [Q, 'exposed'] }] }] },
      caught: { text: 'Vous mentez aussi mal que vous trahissez. Sortez de ma boutique.', trade: false }
    }
  },
  nerys: {
    entries: [{ when: { quest: Q, step: 'decide' }, node: 'parley' }],
    nodes: {
      default: { text: 'Dégage, avant que je change d’avis.', trade: false },
      parley: { text: 'Un chien du marchand ? Parle vite, avant que mes Chardons s’ennuient.',
        options: [
          { text: 'Je suis venu vous déloger.', end: true, effects: [{ hostile: 'nerys', group: 'kl_bandits' }] },
          { text: 'Le Guet prépare une descente. Partez tant que vous le pouvez.', check: { stat: 'persuade', dc: 35, label: 'Persuasion' },
            success: { end: true, effects: [{ signal: [Q, 'negotiate'] }, { pacify: 'kl_bandits' }, { xp: 40 }] }, failure: { next: 'laugh' } },
          { text: 'Soixante dragons pour que vous quittiez la route.', when: { gold: 60 }, end: true, effects: [{ gold: -60 }, { signal: [Q, 'negotiate'] }, { pacify: 'kl_bandits' }] },
          { text: 'Je sais quand passe le prochain convoi d’Orwyn. On partage ?', next: 'deal' }] },
      laugh: { text: 'Le Guet ? Ha ! Les gars, on a un comique. Saignez-le.', options: [{ text: 'À vos armes, alors.', end: true, effects: [{ hostile: 'nerys', group: 'kl_bandits' }] }] },
      deal: { text: 'Voilà qui est parler. Quatre-vingt-dix dragons pour toi, et tu n’as jamais vu ce camp.',
        options: [{ text: 'Marché conclu.', end: true, effects: [{ gold: 90 }, { signal: [Q, 'betray'] }, { pacify: 'kl_bandits' }, { rep: { guet: -10 } }, { memory: { npc: 'nerys', type: 'partner' } }] },
          { text: 'Finalement, non.', next: 'parley' }] }
    }
  },
  hallis: {
    entries: [{ when: { quest: 'kl_letter', state: 'completed' }, node: 'after' }],
    nodes: {
      default: { text: ['Que la Mère vous garde, mon enfant.', 'Le Septuaire est ouvert à tous, même aux pécheurs. Surtout aux pécheurs.'] },
      after: { text: 'La lettre d’Orwyn ? Excellente nouvelle… pour certains. Que les Sept vous récompensent — et moi aussi, un peu.' }
    }
  },
  dalla: {
    entries: [],
    nodes: { default: { text: ['Acier de la rue de l’Acier, trempé deux fois. Rien de moins.', 'Vous cherchez une vraie lame ? Vous êtes au bon endroit.'] } }
  },
  bram: {
    entries: [],
    nodes: { default: { text: ['Le Guet a l’œil sur vous. Pas de grabuge dans mes rues.', 'Les bandits de la route ? Pas mon secteur.'] } }
  }
};
