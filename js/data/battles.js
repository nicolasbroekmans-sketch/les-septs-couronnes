// Grandes batailles (milieu de jeu) : ~100 combattants. Débloquées par le niveau et la quête principale de la région.
export const BATTLES = {
  prologue: {
    name: 'La bataille du Gué-aux-Corbeaux', prologue: true, region: 'prologue', theme: 'plaine', hdri: 'belfast_sunset_puresky',
    desc: 'Un seigneur félon s’est soulevé contre le Trône de fer. Vous n’êtes qu’un écuyer dans l’ost du roi — mais ce soir, on se souviendra de vous.',
    requires: [], enemyHp: .7,
    enemy: { faction: 'bandits', name: 'L’ost du seigneur félon', units: { levee: 45, archer: 25, homme_armes: 22, cavalier: 8 } },
    allies: { faction: 'couronne', name: 'L’ost du roi', units: { levee: 38, archer: 25, homme_armes: 22, cavalier: 15 } },
    reward: []
  },
  bataille_route: {
    name: 'La bataille de la route royale', region: 'kingslanding', theme: 'plaine', hdri: 'qwantani_late_afternoon_puresky',
    desc: 'Les Chardons ont rallié trois bandes de pillards. Ils marchent sur la porte des Dieux.',
    requires: [{ level: 3 }, { quest: 'kl_bandits', state: 'completed' }],
    enemy: { faction: 'bandits', name: 'Horde des Chardons', units: { levee: 26, archer: 12, homme_armes: 10 } },
    allies: { faction: 'guet', name: 'Manteaux d’or', units: { levee: 12, archer: 6 } },
    reward: [{ gold: 400 }, { xp: 600 }, { renown: 15 }, { rep: { guet: 25, couronne: 15 } }, { cosmetic: 'cape_doree' }, { flag: 'won:bataille_route' }]
  },
  bataille_bois: {
    name: 'La bataille du Bois-aux-Loups', region: 'winterfell', theme: 'neige', hdri: 'kloofendal_overcast_puresky',
    desc: 'Des pillards des Îles de Fer ont remonté la rivière et brûlent les fermes au nord de Winter Town.',
    requires: [{ level: 3 }, { quest: 'wf_iron', state: 'completed' }],
    enemy: { faction: 'greyjoy', name: 'Pillards fer-nés', units: { levee: 24, archer: 10, homme_armes: 14 } },
    allies: { faction: 'stark', name: 'Garnison de Winterfell', units: { levee: 10, archer: 8, homme_armes: 4 } },
    reward: [{ gold: 350 }, { xp: 600 }, { renown: 15 }, { rep: { stark: 30 } }, { cosmetic: 'cape_fourrure' }, { flag: 'won:bataille_bois' }]
  },
  bataille_mur: {
    name: 'L’assaut de Châteaunoir', region: 'wall', theme: 'neige', hdri: 'qwantani_night_puresky',
    desc: 'Le Peuple libre a franchi le Mur par un passage oublié. Châteaunoir doit tenir jusqu’à l’aube.',
    requires: [{ level: 3 }, { quest: 'wall_patrol', state: 'completed' }],
    enemy: { faction: 'peuple_libre', name: 'Bande de sauvageons', units: { levee: 30, archer: 14, homme_armes: 6 } },
    allies: { faction: 'garde', name: 'Frères de la Garde de Nuit', units: { levee: 10, archer: 10, homme_armes: 4 } },
    reward: [{ gold: 250 }, { xp: 650 }, { renown: 18 }, { rep: { garde: 30 } }, { cosmetic: 'cape_nuit' }, { flag: 'won:bataille_mur' }]
  }
};
