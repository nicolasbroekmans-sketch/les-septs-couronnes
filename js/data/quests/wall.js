// Quêtes du Mur.
export default {
  wall_patrol: {
    title: 'Une nuit au Mur', region: 'wall', giver: 'aldous', category: 'Principale — Garde de Nuit',
    desc: 'Accompagner une patrouille au-delà du Mur.', start: 'muster',
    failOn: [{ event: 'npc:killed', npc: 'aldous', text: 'Frère Aldous est tombé. La patrouille est perdue.' }],
    steps: {
      muster: { text: 'On ne sort pas seul au-delà du Mur. Frère Mullin, l’intendant (près de l’entrée du camp), vous confiera deux patrouilleurs — gratuitement.',
        objectives: [{ type: 'signal', signal: 'muster', label: 'Recruter deux patrouilleurs auprès de Frère Mullin' }], next: 'tunnel' },
      tunnel: { text: 'Vos patrouilleurs vous suivent. Le tunnel sous le Mur est au nord-ouest du camp : suivez la colonne de lumière dorée.',
        objectives: [{ type: 'reach', marker: 'wall_tunnel', label: 'Entrer dans le tunnel sous le Mur' }], next: 'grove' },
      grove: { text: 'De l’autre côté du Mur, marchez droit vers le nord en suivant les pierres levées : Frère Aldous vous attend au barral blanc aux feuilles rouges.',
        objectives: [{ type: 'reach', marker: 'wall_grove', label: 'Rejoindre le bosquet du barral (au-delà du Mur)' }], next: 'ambush' },
      ambush: { text: 'Des sauvageons sortent de la brume ! Défendez la patrouille.', enter: [{ flag: 'wall_ambush' }],
        objectives: [{ type: 'defeat', group: 'wall_wildlings', count: 3, label: 'Repousser les sauvageons' }], next: 'choice' },
      choice: { text: 'Une sauvageonne blessée, Ygra, a jeté sa lance. Que faites-vous d’elle ?', any: true,
        objectives: [
          { type: 'signal', signal: 'free', label: 'La laisser partir', branch: 'back_free' },
          { type: 'signal', signal: 'prisoner', label: 'Ou : la ramener prisonnière', branch: 'back_prisoner' },
          { type: 'signal', signal: 'execute', label: 'Ou : appliquer la loi du Mur', branch: 'back_execute' }] },
      back_free: { text: 'Ygra a disparu entre les arbres. Retournez au camp voir Frère Aldous.', objectives: [{ type: 'talk', npc: 'aldous', label: 'Retourner voir Frère Aldous' }], complete: 'free' },
      back_prisoner: { text: 'Ygra marche devant vous, mains liées. Ramenez-la à Frère Aldous.', objectives: [{ type: 'talk', npc: 'aldous', label: 'Retourner voir Frère Aldous' }], complete: 'prisoner' },
      back_execute: { text: 'C’est fait. Le vent emporte tout. Retournez voir Frère Aldous.', objectives: [{ type: 'talk', npc: 'aldous', label: 'Retourner voir Frère Aldous' }], complete: 'execute' }
    },
    outcomes: {
      free: { text: 'Aldous fronce les sourcils, mais un sauvageon, au loin, se souviendra de vous.', unlocks: ['wall_report'],
        rewards: [{ xp: 170 }, { item: 'carte_sauvageon' }, { rep: { peuple_libre: 25, garde: -6 } }, { relation: { aldous: -10 } }, { memory: { npc: 'aldous', type: 'freed_wildling' } }] },
      prisoner: { text: 'La prisonnière parlera. La Garde vous en est reconnaissante.', unlocks: ['wall_report'],
        rewards: [{ xp: 160 }, { gold: 50 }, { rep: { garde: 20, peuple_libre: -10 } }, { relation: { aldous: 20 } }, { renown: 3 }] },
      execute: { text: 'Aldous ne dit rien. Le Mur se souvient de tout.', unlocks: ['wall_report'],
        rewards: [{ xp: 130 }, { rep: { garde: 10, peuple_libre: -30 } }, { relation: { aldous: 5 } }, { renown: -2 }] }
    }
  },
  wall_report: {
    title: 'Le rapport', region: 'wall', giver: 'aldous', category: 'Principale — Garde de Nuit',
    desc: 'Rendre compte de la patrouille à l’intendant Corwen.', requires: { flag: 'unlocked:wall_report' }, start: 'report',
    steps: { report: { text: 'Allez faire votre rapport à l’intendant Corwen, au réfectoire.', objectives: [{ type: 'talk', npc: 'corwen', label: 'Faire votre rapport à l’intendant Corwen' }], complete: 'done' } },
    outcomes: { done: { text: 'Corwen consigne votre nom dans le registre des patrouilles.', rewards: [{ xp: 80 }, { gold: 40 }, { rep: { garde: 8 } }, { renown: 2 }] } }
  },
  wall_fist: {
    title: 'Le Poing des Premiers Hommes', region: 'wall', giver: 'aldous', category: 'Principale — Garde de Nuit',
    desc: 'Une grande expédition loin au nord du Mur, là où plus aucun frère ne va.', requires: { quest: 'wall_report', state: 'completed' }, start: 'trek',
    steps: {
      trek: { text: 'Traversez le tunnel sous le Mur, puis suivez le sentier de la patrouille vers le nord, à travers la forêt hantée, jusqu’au ruisseau gelé.',
        objectives: [{ type: 'reach', marker: 'wall_creek', label: 'Atteindre le ruisseau gelé (loin au nord)' }], next: 'fist' },
      fist: { text: 'Plus au nord encore, une colline plate couronnée de pierres : le Poing des Premiers Hommes. Montez-y.',
        objectives: [{ type: 'reach', marker: 'wall_fist', label: 'Monter au Poing des Premiers Hommes' }], next: 'cache' },
      cache: { text: 'Le dernier frère parti d’ici parlait d’une cachette sous les pierres, près du vieux feu. Fouillez-la.',
        objectives: [{ type: 'interact', object: 'wall_cache', label: 'Fouiller la cachette sous les pierres' }], next: 'dead' },
      dead: { text: 'Le vent tombe d’un coup. Entre les arbres, des silhouettes pâles aux yeux bleus avancent sans bruit. Le verredragon les blesse mieux que l’acier : tenez le Poing !', enter: [{ flag: 'fist_dead' }],
        objectives: [{ type: 'defeat', group: 'wall_wights', count: 5, label: 'Repousser les morts qui marchent' }], next: 'back' },
      back: { text: 'Personne ne vous croira. Rentrez quand même à Châteaunoir et dites tout à Frère Aldous.', objectives: [{ type: 'talk', npc: 'aldous', label: 'Faire votre rapport à Frère Aldous' }], complete: 'done' }
    },
    outcomes: { done: { text: 'Aldous regarde longtemps la lame noire. « Alors c’est vrai. » Il envoie un corbeau à chaque château du Nord.', rewards: [{ xp: 450 }, { gold: 150 }, { rep: { garde: 30, stark: 10 } }, { renown: 12 }] } }
  }
};
