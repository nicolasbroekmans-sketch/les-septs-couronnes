// Arbres de compétences : chaque talent a un effet réel lu par player/Stats.js ou par les systèmes concernés.
export const TREES = {
  combat: 'Combat', survie: 'Survie', commerce: 'Commerce', diplomatie: 'Diplomatie', commandement: 'Commandement', furtivite: 'Furtivité'
};
export const SKILLS = {
  lame_aiguisee: { tree: 'combat', name: 'Lame aiguisée', desc: '+15 % de dégâts au corps à corps.', cost: 1, fx: { melee: .15 } },
  garde_de_fer: { tree: 'combat', name: 'Garde de fer', desc: '+20 % d’efficacité de parade, fenêtre de parade parfaite allongée.', cost: 1, req: ['lame_aiguisee'], fx: { block: .2, parryWindow: .08 } },
  tourbillon: { tree: 'combat', name: 'Tourbillon', desc: 'L’attaque lourde touche tous les ennemis devant vous (+20 % dégâts).', cost: 2, req: ['garde_de_fer'], fx: { cleave: 1, heavy: .2 } },
  peau_dure: { tree: 'survie', name: 'Peau dure', desc: '+25 points de vie maximum.', cost: 1, fx: { hp: 25 } },
  second_souffle: { tree: 'survie', name: 'Second souffle', desc: '+30 % de récupération d’endurance.', cost: 1, req: ['peau_dure'], fx: { regen: .3 } },
  chasseur: { tree: 'survie', name: 'Chasseur', desc: '+20 % de dégâts à distance.', cost: 1, fx: { ranged: .2 } },
  marchandage: { tree: 'commerce', name: 'Marchandage', desc: 'Achat −10 %, vente +10 %.', cost: 1, fx: { buy: -.1, sell: .1 } },
  oeil_expert: { tree: 'commerce', name: 'Œil d’expert', desc: 'Vente +15 % supplémentaires.', cost: 1, req: ['marchandage'], fx: { sell: .15 } },
  contacts: { tree: 'commerce', name: 'Contacts', desc: 'Achat −10 % supplémentaires, les marchands méfiants acceptent de commercer.', cost: 2, req: ['oeil_expert'], fx: { buy: -.1, forgiven: 1 } },
  langue_argent: { tree: 'diplomatie', name: 'Langue d’argent', desc: '+10 aux tests de persuasion.', cost: 1, fx: { persuade: 10 } },
  renommee: { tree: 'diplomatie', name: 'Renommée', desc: '+25 % de réputation gagnée.', cost: 1, req: ['langue_argent'], fx: { rep: .25 } },
  intimidation: { tree: 'diplomatie', name: 'Intimidation', desc: '+10 aux tests de persuasion, les ennemis se rendent plus vite.', cost: 2, req: ['renommee'], fx: { persuade: 10, fear: .2 } },
  meneur: { tree: 'commandement', name: 'Meneur', desc: 'Le moral des ennemis baisse plus vite face à vous.', cost: 1, fx: { fear: .2 } },
  cri_ralliement: { tree: 'commandement', name: 'Cri de ralliement', desc: 'Les alliés proches infligent +20 % de dégâts.', cost: 1, req: ['meneur'], fx: { allyDmg: .2 } },
  tacticien: { tree: 'commandement', name: 'Tacticien', desc: '+10 % de dégâts quand un allié combat à vos côtés.', cost: 1, req: ['cri_ralliement'], fx: { withAllies: .1 } },
  pas_de_loup: { tree: 'furtivite', name: 'Pas de loup', desc: '−30 % de distance de détection.', cost: 1, fx: { stealth: .3 } },
  coup_dos: { tree: 'furtivite', name: 'Coup dans le dos', desc: 'Dégâts ×2 sur une cible qui ne vous a pas repéré.', cost: 1, req: ['pas_de_loup'], fx: { sneak: 1 } },
  doigts_agiles: { tree: 'furtivite', name: 'Doigts agiles', desc: '+25 % de chances de réussir un vol.', cost: 1, fx: { theft: .25 } }
};
