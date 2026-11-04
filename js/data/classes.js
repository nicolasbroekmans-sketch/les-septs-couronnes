// Classes de départ : attributs (1–10), aptitudes (0–100), équipement et bourse initiale.
// Aucune compétence n'est verrouillée : la classe ne fait que donner une avance.
export const ATTRIBUTES = {
  constitution: 'Santé', endurance: 'Endurance', force: 'Force', agilite: 'Agilité',
  intelligence: 'Intelligence', charisme: 'Charisme', perception: 'Perception'
};
export const APTITUDES = {
  combat: 'Combat', tir: 'Tir', diplomatie: 'Diplomatie', commerce: 'Commerce',
  furtivite: 'Furtivité', survie: 'Survie', commandement: 'Commandement'
};
const A = (constitution, endurance, force, agilite, intelligence, charisme, perception) =>
  ({ constitution, endurance, force, agilite, intelligence, charisme, perception });

export const CLASSES = {
  guerrier: { name: 'Guerrier', desc: 'Robuste et redoutable au corps à corps.', attrs: A(7, 6, 7, 5, 3, 4, 4),
    apt: { combat: 30, survie: 10 }, items: ['epee_longue', 'brigandine', 'onguent', 'onguent'], equip: ['epee_longue', 'brigandine'], gold: 30 },
  archer: { name: 'Archer', desc: 'Précis à distance, vif et observateur.', attrs: A(5, 6, 4, 7, 4, 4, 7),
    apt: { tir: 30, survie: 15 }, items: ['arc_court', 'dague', 'cuir', 'onguent'], equip: ['arc_court', 'cuir'], gold: 35 },
  voleur: { name: 'Voleur', desc: 'Furtif, agile, à l’aise dans les ruelles.', attrs: A(5, 6, 4, 7, 5, 5, 6),
    apt: { furtivite: 30, commerce: 10 }, items: ['dague', 'cuir', 'onguent'], equip: ['dague', 'cuir'], gold: 45 },
  marchand: { name: 'Marchand', desc: 'Négociateur né, la bourse bien remplie.', attrs: A(5, 5, 4, 4, 7, 7, 5),
    apt: { commerce: 35, diplomatie: 15 }, items: ['gourdin', 'vetements', 'vin_arbor', 'onguent'], equip: ['gourdin', 'vetements'], gold: 160 },
  noble: { name: 'Noble déchu', desc: 'Un nom sans terres, mais un sens aigu de la politique.', attrs: A(5, 5, 5, 5, 6, 7, 5),
    apt: { diplomatie: 35, combat: 10 }, items: ['epee_courte', 'vetements_fins', 'onguent'], equip: ['epee_courte', 'vetements_fins'], gold: 80 },
  vagabond: { name: 'Vagabond', desc: 'Polyvalent, endurci par la route. Un point de compétence en plus.', attrs: A(6, 6, 5, 5, 5, 5, 5),
    apt: { survie: 20, combat: 10, tir: 10 }, items: ['hachette', 'cuir', 'onguent', 'ration'], equip: ['hachette', 'cuir'], gold: 25, bonusPoints: 1 }
};

export const ORIGINS = {
  nord: { name: 'Le Nord', bonus: { constitution: 1 }, faction: 'stark' },
  couronne: { name: 'Terres de la Couronne', bonus: { charisme: 1 }, faction: 'guet' },
  bief: { name: 'Le Bief', bonus: { charisme: 1 }, faction: 'tyrell' },
  ouest: { name: 'Les Terres de l’Ouest', bonus: { force: 1 }, faction: 'lannister' },
  conflans: { name: 'Le Conflans', bonus: { endurance: 1 }, faction: 'tully' },
  dorne: { name: 'Dorne', bonus: { agilite: 1 }, faction: 'martell' },
  fer: { name: 'Les Îles de Fer', bonus: { force: 1 }, faction: 'greyjoy' },
  essos: { name: 'Les Cités libres', bonus: { intelligence: 1 }, faction: 'banque' }
};

export const DIFFICULTIES = {
  facile: { name: 'Écuyer (facile)', taken: .6, dealt: 1.25, xp: 1.2 },
  normal: { name: 'Chevalier (normal)', taken: 1, dealt: 1, xp: 1 },
  difficile: { name: 'Seigneur (difficile)', taken: 1.4, dealt: .85, xp: .9 },
  legende: { name: 'Légende (impitoyable)', taken: 1.9, dealt: .75, xp: .85 }
};
