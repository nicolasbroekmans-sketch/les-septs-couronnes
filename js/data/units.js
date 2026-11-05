// Types de troupes recrutables. power = valeur relative pour l'estimation des forces.
export const UNITS = {
  levee: { name: 'Lanciers de levée', cost: 15, weapon: 'lance', armor: 'cuir', hp: 70, power: 1, tint: '#7a6a4a' },
  archer: { name: 'Archers', cost: 22, weapon: 'arc_court', armor: 'cuir', hp: 55, power: 1.2, tint: '#4a5a3a' },
  homme_armes: { name: 'Hommes d’armes', cost: 45, weapon: 'epee_longue', armor: 'maille', hp: 110, power: 2, minLevel: 3, tint: '#6a6f76' },
  cavalier: { name: 'Cavaliers', cost: 80, weapon: 'lance', armor: 'maille', hp: 150, power: 3, minLevel: 4, mounted: true, tint: '#6a5a4a' },
  patrouilleur: { name: 'Patrouilleurs de la Garde', cost: 12, weapon: 'epee_longue', armor: 'cuir', hp: 90, power: 1.5, tint: '#1e1e20' },
  chevalier: { name: 'Chevaliers', cost: 100, weapon: 'epee_chateau', armor: 'plates', hp: 160, power: 3.6, minLevel: 5, minRenown: 15, tint: '#9aa0a8' }
};
