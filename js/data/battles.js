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
  finale: {
    name: 'La bataille des Sept Couronnes', finale: true, dragon: true, region: 'kingslanding', theme: 'plaine', hdri: 'belfast_sunset_puresky',
    desc: 'Un prétendant venu d’au-delà de la mer marche sur Port-Réal avec la plus grande armée du siècle — et un dragon. Tout ce que vous avez bâti se joue ici.',
    requires: [{ level: 6 }, { flag: 'won:bataille_route' }, { flag: 'won:bataille_bois' }, { flag: 'won:bataille_mur' }], enemyHp: .9,
    enemy: { faction: 'targaryen', name: 'L’ost du Prétendant', units: { levee: 48, archer: 26, homme_armes: 30, cavalier: 16 } },
    allies: { faction: 'couronne', name: 'Les armées des Sept Couronnes', units: { levee: 40, archer: 26, homme_armes: 22, cavalier: 14 } },
    reward: [{ gold: 2000 }, { xp: 3000 }, { renown: 60 }, { rep: { couronne: 40, stark: 20, garde: 20, guet: 30 } }, { flag: 'won:finale' }]
  },
  bataille_route: {
    name: 'La bataille de la route royale', region: 'kingslanding', theme: 'plaine', hdri: 'qwantani_late_afternoon_puresky',
    desc: 'Les Chardons ont rallié trois bandes de pillards. Ils marchent sur la porte des Dieux.',
    requires: [{ level: 3 }, { quest: 'kl_bandits', state: 'completed' }],
    enemyHp: .75,
    enemy: { faction: 'bandits', name: 'Horde des Chardons', units: { levee: 22, archer: 8, homme_armes: 6 } },
    allies: { faction: 'guet', name: 'Manteaux d’or', units: { levee: 16, archer: 8, homme_armes: 6 } },
    reward: [{ gold: 400 }, { xp: 600 }, { renown: 15 }, { rep: { guet: 25, couronne: 15 } }, { cosmetic: 'cape_doree' }, { flag: 'won:bataille_route' }]
  },
  bataille_bois: {
    name: 'La bataille du Bois-aux-Loups', region: 'winterfell', theme: 'neige', hdri: 'kloofendal_overcast_puresky',
    desc: 'Des pillards des Îles de Fer ont remonté la rivière et brûlent les fermes au nord de Winter Town.',
    requires: [{ level: 3 }, { quest: 'wf_iron', state: 'completed' }],
    enemyHp: .75,
    enemy: { faction: 'greyjoy', name: 'Pillards fer-nés', units: { levee: 22, archer: 8, homme_armes: 6 } },
    allies: { faction: 'stark', name: 'Garnison de Winterfell', units: { levee: 16, archer: 8, homme_armes: 6 } },
    reward: [{ gold: 350 }, { xp: 600 }, { renown: 15 }, { rep: { stark: 30 } }, { cosmetic: 'cape_fourrure' }, { flag: 'won:bataille_bois' }]
  },
  bataille_mur: {
    name: 'L’assaut de Châteaunoir', region: 'wall', theme: 'neige', hdri: 'qwantani_night_puresky',
    desc: 'Le Peuple libre a franchi le Mur par un passage oublié. Châteaunoir doit tenir jusqu’à l’aube.',
    requires: [{ level: 3 }, { quest: 'wall_patrol', state: 'completed' }],
    enemyHp: .75,
    enemy: { faction: 'peuple_libre', name: 'Bande de sauvageons', units: { levee: 24, archer: 8, homme_armes: 4 } },
    allies: { faction: 'garde', name: 'Frères de la Garde de Nuit', units: { levee: 14, archer: 10, homme_armes: 6 } },
    reward: [{ gold: 250 }, { xp: 650 }, { renown: 18 }, { rep: { garde: 30 } }, { cosmetic: 'cape_nuit' }, { flag: 'won:bataille_mur' }]
  }
};
