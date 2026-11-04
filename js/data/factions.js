// Factions — an 298 après la Conquête, peu avant la mort de la Main du Roi : les grandes maisons
// sont en place, aucun personnage canonique n'est joué (PNJ originaux uniquement).
export const FACTIONS = {
  couronne: { name: 'La Couronne (Baratheon)', seat: 'Port-Réal', color: '#c9a227' },
  guet: { name: 'Le Guet de Port-Réal', seat: 'Port-Réal', color: '#c9a227' },
  stark: { name: 'Maison Stark', seat: 'Winterfell', color: '#9fa7ad' },
  lannister: { name: 'Maison Lannister', seat: 'Castral Roc', color: '#8b0000' },
  tyrell: { name: 'Maison Tyrell', seat: 'Hautjardin', color: '#4f7a3a' },
  martell: { name: 'Maison Martell', seat: 'Lancehélion', color: '#d97a2a' },
  greyjoy: { name: 'Maison Greyjoy', seat: 'Pyk', color: '#2a2a2e' },
  arryn: { name: 'Maison Arryn', seat: 'Les Eyrié', color: '#5a7aa8' },
  tully: { name: 'Maison Tully', seat: 'Vivesaigues', color: '#3a5a9a' },
  targaryen: { name: 'Fidèles Targaryen (en exil)', seat: 'Essos', color: '#6a1010' },
  garde: { name: 'La Garde de Nuit', seat: 'Châteaunoir', color: '#1a1a1a' },
  peuple_libre: { name: 'Le Peuple libre', seat: 'Au-delà du Mur', color: '#7a8a9a' },
  banque: { name: 'La Banque de Fer', seat: 'Braavos', color: '#6a6a72' },
  bandits: { name: 'Les Chardons (bandits)', seat: '—', color: '#5a4030', outlaw: true },
  deserteurs: { name: 'Déserteurs', seat: '—', color: '#5a5040', outlaw: true },
  peuple: { name: 'Petites gens', seat: '—', color: '#a08a6a' }
};
// Relations entre factions (−100 à 100) ; absentes = 0. Symétriques.
export const RELATIONS = [
  ['couronne', 'guet', 90], ['couronne', 'lannister', 60], ['couronne', 'stark', 40], ['couronne', 'targaryen', -90],
  ['stark', 'garde', 60], ['stark', 'tully', 70], ['stark', 'arryn', 50], ['stark', 'lannister', -10],
  ['lannister', 'tyrell', 10], ['greyjoy', 'stark', -30], ['garde', 'peuple_libre', -70],
  ['bandits', 'guet', -90], ['bandits', 'couronne', -80], ['deserteurs', 'stark', -80], ['deserteurs', 'garde', -60]
];
export const RANKS = [[-60, 'Ennemi juré'], [-25, 'Hostile'], [-5, 'Méfiant'], [15, 'Neutre'], [40, 'Amical'], [70, 'Allié'], [101, 'Honoré']];
