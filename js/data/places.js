// Données de lore (textes originaux). Coordonnées dans le repère SVG 2000×1200.
export const CONTINENTS = {
  westeros: {
    name: 'Westeros', kicker: 'Le continent du couchant',
    quote: '« Sept couronnes, un seul trône, et l’hiver qui attend son heure. »',
    view: [60, 20, 720, 1100]
  },
  essos: {
    name: 'Essos', kicker: 'Les terres du levant',
    quote: '« Au-delà de la mer Étroite, les cités sont plus vieilles que les noms. »',
    view: [800, 180, 1200, 860]
  }
};

const P = (id, c, x, y, name, region, house, climate, mood, scene = 'generic', star = false) =>
  ({ id, continent: c, x, y, name, region, house, climate, mood, scene, star });

export const PLACES = [
  P('winterfell', 'westeros', 400, 300, 'Winterfell', 'Le Nord', 'Stark — le loup gris', 'Neige, pierre grise, sources chaudes',
    'Les murs sont froids, mais l’eau qui court dessous ne gèle jamais.', 'winterfell', true),
  P('wall', 'westeros', 440, 128, 'Le Mur — Châteaunoir', 'Au bord du monde', 'La Garde de Nuit', 'Glace, nuit éternelle, blizzard',
    'Deux cents mètres de glace entre les vivants et ce qui ne dort pas.', 'wall', true),
  P('kingslanding', 'westeros', 565, 760, 'Port-Réal', 'Terres de la Couronne', 'La Couronne', 'Chaleur dorée, vent marin',
    'Chaque ruelle grimpe vers le Donjon Rouge, chaque murmure aussi.', 'kingslanding', true),
  P('dragonstone', 'westeros', 660, 712, 'Peyredragon', 'La Baie de la Néra', 'Targaryen — le dragon tricéphale', 'Roche volcanique, embruns',
    'La pierre se souvient du feu qui l’a façonnée.'),
  P('casterly', 'westeros', 236, 682, 'Castral Roc', 'Les Terres de l’Ouest', 'Lannister — le lion d’or', 'Falaises dorées, couchant',
    'On dit que la montagne a des veines d’or et un cœur de lion.', 'places/casterly'),
  P('highgarden', 'westeros', 330, 880, 'Hautjardin', 'Le Bief', 'Tyrell — la rose d’or', 'Doux, fleuri, ensoleillé',
    'Ici, même les épines sont élégantes.'),
  P('dorne', 'westeros', 590, 1036, 'Jardins Aquatiques', 'Dorne', 'Martell — la lance et le soleil', 'Soleil écrasant, fontaines',
    'L’eau chante dans les patios, et le soleil ne pardonne rien.', 'places/dorne'),
  P('eyrie', 'westeros', 560, 560, 'Les Eyrié', 'Le Val d’Arryn', 'Arryn — le faucon et la lune', 'Altitude, nuages, vent',
    'Le château le plus sûr du royaume : il suffit de ne jamais tomber.', 'places/eyrie'),
  P('pyke', 'westeros', 168, 618, 'Pyk', 'Les Îles de Fer', 'Greyjoy — la seiche dorée', 'Tempête, embruns salés',
    'Des tours sur des rochers, des ponts sur le vide, et la mer en dessous qui attend.'),

  // Villages (lieux originaux) : de quoi se promener entre les grandes cités.
  P('combegivre', 'westeros', 330, 236, 'Combe-Givre', 'Le Nord', 'Vassaux des Stark', 'Neige, pins, fumées de tourbe',
    'Douze maisons, un moulin gelé et une auberge où l’on parle plus de loups que de rois.', 'places/village'),
  P('gue', 'westeros', 468, 622, 'Le Gué-aux-Corbeaux', 'Le Conflans', 'Vassaux des Tully', 'Rivière, prairies, brume',
    'Le village où s’est jouée la grande bataille. On y trouve encore des pointes de flèches dans les champs.', 'places/village'),
  P('portsel', 'westeros', 622, 640, 'Port-Sel', 'Le Val, côte', 'Vassaux des Arryn', 'Embruns, filets, galets',
    'Un port de pêcheurs qui sent le sel et le hareng. Les barques y sont plus vieilles que les pêcheurs.', 'places/village'),
  P('mielbois', 'westeros', 392, 828, 'Mielbois', 'Le Bief', 'Vassaux des Tyrell', 'Vergers, ruches, soleil doux',
    'Des vergers à perte de vue, des ruches et un septon qui bénit le cidre plus souvent que les fidèles.', 'places/village'),
  P('sablerouge', 'westeros', 468, 1004, 'Sablerouge', 'Dorne, désert', 'Vassaux des Martell', 'Dunes rouges, oasis',
    'Une oasis, trois palmiers et un puits que l’on garde mieux qu’un trésor.', 'places/village'),

  P('braavos', 'essos', 905, 375, 'Braavos', 'Cités libres', 'La Banque de Fer', 'Brume marine, canaux',
    'Une cité de cent îles, née d’esclaves en fuite et gardée par un géant de bronze.', 'braavos', true),
  P('pentos', 'essos', 892, 560, 'Pentos', 'Cités libres', 'Les princes marchands', 'Brise tiède, couchant',
    'Les villas blanches regardent la mer comme on compte des pièces.'),
  P('meereen', 'essos', 1290, 712, 'Meereen', 'Baie des Serfs', 'La Harpie', 'Lumière écrasante, poussière',
    'La grande pyramide jette une ombre qui pèse plus que la chaleur.', 'meereen', true),
  P('vaesdothrak', 'essos', 1470, 500, 'Vaes Dothrak', 'La Mer Dothrak', 'Les khalasars', 'Steppe infinie, vent sec',
    'La seule cité où aucune lame ne peut être tirée.'),
  P('qarth', 'essos', 1770, 840, 'Qarth', 'Le Désert Rouge', 'Les Treize', 'Désert, dunes rouges',
    'Trois murailles sculptées, et derrière chacune, un nouveau mensonge.'),
  P('volantis', 'essos', 975, 815, 'Volantis', 'Cités libres', 'Les triarques', 'Chaleur humide, fleuve',
    'Le Mur Noir garde les vieilles familles ; le Long Pont garde tout le reste.'),
  P('valyria', 'essos', 1080, 965, 'Valyria', 'La Mer Fumeuse', 'Aucune — plus personne', 'Brume, fumées, soufre',
    'Elle a régné sur le monde. La fumée est tout ce qui reste de son nom.')
];
