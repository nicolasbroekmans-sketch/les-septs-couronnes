// Types de troupes recrutables. power = valeur relative pour l'estimation des forces.
export const UNITS = {
  levee: { name: 'Lanciers de levée', cost: 15, weapon: 'lance', armor: 'cuir', hp: 70, power: 1, tint: '#7a6a4a' },
  archer: { name: 'Archers', cost: 22, weapon: 'arc_court', armor: 'cuir', hp: 55, power: 1.2, tint: '#4a5a3a' },
  homme_armes: { name: 'Hommes d’armes', cost: 45, weapon: 'epee_longue', armor: 'maille', hp: 110, power: 2, minLevel: 3, tint: '#6a6f76' },
  chevalier: { name: 'Chevaliers', cost: 100, weapon: 'epee_chateau', armor: 'plates', hp: 160, power: 3.6, minLevel: 5, minRenown: 15, tint: '#9aa0a8' }
};
