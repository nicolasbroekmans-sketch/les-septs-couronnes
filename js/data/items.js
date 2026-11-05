// Objets : armes (vrais paramètres de combat), armures, consommables, marchandises, objets de quête.
// windup / active / recover en secondes ; reach en mètres ; armor = part des dégâts absorbée.
const W = (name, cls, dmg, reach, windup, active, recover, stamina, value, o = {}) =>
  ({ name, type: 'weapon', cls, dmg, reach, windup, active, recover, stamina, heavy: 1.8, value, weight: o.weight ?? 3, ...o });
const AR = (name, armor, value, weight, speed = 1) => ({ name, type: 'armor', armor, value, weight, speed });

export const ITEMS = {
  poings: W('Poings', 'fist', 4, 1.3, .18, .1, .25, 6, 0),
  dague: W('Dague', 'dagger', 9, 1.5, .14, .1, .22, 8, 25, { weight: 1, crit: .1 }),
  gourdin: W('Gourdin', 'mace', 10, 1.8, .3, .12, .35, 12, 12),
  hachette: W('Hachette', 'axe', 12, 1.8, .28, .12, .35, 12, 20),
  epee_courte: W('Épée courte', 'sword', 13, 2, .24, .12, .3, 11, 60),
  epee_longue: W('Épée longue', 'sword', 17, 2.3, .3, .14, .34, 14, 140),
  epee_chateau: W('Épée en acier de château', 'sword', 23, 2.4, .28, .14, .32, 14, 420),
  hache_guerre: W('Hache de guerre', 'axe', 25, 2.3, .42, .14, .45, 20, 260, { weight: 6, heavy: 2 }),
  masse: W('Masse d’armes', 'mace', 21, 2.1, .38, .14, .4, 18, 200, { weight: 5, armorPierce: .5 }),
  dague_fer: W('Dague de fer sans visage', 'dagger', 15, 1.6, .12, .1, .2, 7, 380, { weight: 1, crit: .22 }),
  lance: W('Lance', 'spear', 18, 3, .32, .14, .36, 14, 120, { weight: 4 }),
  arc_court: W('Arc court', 'bow', 14, 40, .55, .05, .35, 8, 70, { ranged: { speed: 38 }, weight: 1 }),
  arc_long: W('Arc long', 'bow', 21, 60, .8, .05, .4, 10, 240, { ranged: { speed: 52 }, weight: 2 }),
  arbalete: W('Arbalète', 'crossbow', 28, 50, 1.1, .05, .6, 6, 300, { ranged: { speed: 60 }, weight: 4 }),

  vetements: AR('Vêtements de laine', .02, 5, 1),
  vetements_fins: AR('Pourpoint de soie', .05, 90, 1),
  cuir: AR('Armure de cuir', .14, 45, 4),
  brigandine: AR('Brigandine', .24, 120, 8, .97),
  maille: AR('Cotte de mailles', .34, 300, 12, .93),
  plates: AR('Armure de plates', .48, 900, 20, .86),

  onguent: { name: 'Onguent du mestre', type: 'consumable', heal: 45, value: 20, weight: .2 },
  ration: { name: 'Ration de voyage', type: 'consumable', heal: 15, stamina: 30, value: 6, weight: .5 },
  vin_arbor: { name: 'Vin de La Treille', type: 'goods', value: 30, weight: 1, cat: 'luxe' },
  sel: { name: 'Sac de sel', type: 'goods', value: 12, weight: 2, cat: 'vivres' },
  fourrure: { name: 'Fourrure de loup', type: 'goods', value: 25, weight: 2, cat: 'fourrure' },
  epices: { name: 'Épices de Qarth', type: 'goods', value: 55, weight: .5, cat: 'luxe' },

  insigne_bandit: { name: 'Insigne des Chardons', type: 'quest', value: 0, weight: .1 },
  lettre_scellee: { name: 'Lettre scellée', type: 'quest', value: 0, weight: .1 },
  caisse_fer: { name: 'Caisse de fer forgé', type: 'quest', value: 0, weight: 6 },
  piece_fer: { name: 'Pièce de fer', type: 'quest', value: 0, weight: .05 },
  carte_sauvageon: { name: 'Carte des sentiers du Nord', type: 'quest', value: 0, weight: .1 }
};
export const item = id => ITEMS[id];
