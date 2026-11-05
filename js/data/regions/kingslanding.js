// Région de départ : Port-Réal. Coordonnées dans le repère de js/scenes/kingslanding.js.
import { look, townsfolk, camp } from './common.js';
import { height } from '../../scenes/kingslanding.js';

const CAMP = [-250, -30];
export default {
  id: 'kingslanding', scene: 'kingslanding', name: 'Port-Réal', region: 'Terres de la Couronne', climate: 'tempere', lawFaction: 'guet',
  prices: { weapon: 1, armor: 1.1, luxe: .9, vivres: 1.15, consumable: 1 },
  spawn: { x: 0, z: 54, yaw: 0 }, bounds: [-320, -200, 200, 120],
  rumors: ['Orwyn Pell, le marchand de la porte de la Rivière, cherche quelqu\u2019un de courageux pour la route de l\u2019ouest.', 'On dit qu\u2019un étranger aux yeux de deux couleurs paie en pièces de fer, près des quais. Il ne dit jamais son nom.', 'Dalla, rue de l\u2019Acier, forge les meilleures lames de la ville — et elle les améliore, si on y met le prix.', 'Les Manteaux d\u2019or ? Plus chers que l\u2019or qu\u2019ils portent.', 'Un collecteur d\u2019impôts, Ser Morrec, rançonne tout Culpucier. Personne n\u2019ose rien dire.', 'Des recruteurs engagent des épées au Fort Rouge. Paraît qu\u2019une guerre se prépare.'],
  intro: 'Port-Réal, an 298. La ville sent le poisson, l’encens et l’ambition. Vous n’avez que quelques pièces et une lame.',
  npcs: [
    { id: 'kl_recruteur', name: 'Sergent Bronn-des-Quais', role: 'recruiter', faction: 'guet', x: 7, z: 50, yaw: Math.PI / 2, weapon: 'lance', armor: 'cuir', hp: 90, look: look({ tunic: '#8a6a2a', cloak: '#c9a227', seed: 'sergent' }), ai: {} },
    { id: 'kl_capitaine', name: 'Capitaine Manfryd des Manteaux d’or', role: 'captain', faction: 'guet', x: -7, z: 50, yaw: -Math.PI / 2, weapon: 'epee_longue', armor: 'maille', hp: 140, look: look({ tunic: '#8a6a2a', cloak: '#c9a227', helmet: true, seed: 'manfryd' }), ai: {} },
    { id: 'kl_beggar_1', name: 'Vieux Tobbin', role: 'beggar', faction: 'peuple', x: -3.5, z: 32, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['J’étais marin, avant. Puis la mer a gardé mes doigts.'], ai: {} },
    { id: 'kl_beggar_2', name: 'Mère Huppe', role: 'beggar', faction: 'peuple', x: -58, z: -28, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['Mes fils sont partis à la guerre du Roi. Aucun n’est revenu.'], ai: {} },
    { id: 'kl_beggar_3', name: 'Petit Pol', role: 'beggar', faction: 'peuple', x: -22, z: -4, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['Mes parents ? Culpucier les a mangés, comme il mange tout le monde.'], ai: {} },
    { id: 'etranger', name: 'L\u2019étranger', role: 'faceless', faction: 'peuple', x: 72, z: 57, yaw: Math.PI, weapon: 'dague', hp: 400, look: look({ female: false, hair: '#a04a22', tunic: '#2a2a30', cloak: '#1a1a1e', beard: false }), ai: { face: Math.PI, noFlee: true } },
    { id: 'orwyn', name: 'Orwyn Pell', role: 'merchant', merchant: true, faction: 'peuple', x: -8, z: 52, yaw: Math.PI / 2, weapon: 'dague', hp: 50,
      stock: { onguent: 6, ration: 10, vin_arbor: 4, sel: 6, epices: 2, cuir: 2, epee_courte: 1, arc_court: 1 }, look: look({ female: false, tunic: '#6a3a5a', beard: true }), ai: { wander: 2 } },
    { id: 'dalla', name: 'Dalla l’armurière', role: 'merchant', merchant: true, smith: true, faction: 'peuple', x: 5, z: 44, yaw: -Math.PI / 2, weapon: 'masse', hp: 70,
      stock: { epee_longue: 2, epee_chateau: 1, masse: 1, hache_guerre: 1, lance: 1, arc_long: 1, arbalete: 1, dague: 2, brigandine: 2, maille: 1, plates: 1 }, look: look({ female: true, tunic: '#3a2a22' }), ai: { wander: 1.5 } },
    { id: 'bram', name: 'Sergent Bram', role: 'guard', faction: 'guet', x: -3, z: 50, weapon: 'lance', armor: 'maille', hp: 110, look: look({ female: false, tunic: '#c9a227', cloak: '#c9a227', helmet: true }),
      ai: { patrol: [[-3, 50], [-3, 12], [3, 12], [3, 50]], aggression: .7, morale: .8 } },
    { id: 'kl_guard_1', name: 'Manteau d’or', role: 'guard', faction: 'guet', x: -20, z: 20, weapon: 'lance', armor: 'maille', hp: 100, look: look({ female: false, tunic: '#c9a227', cloak: '#c9a227', helmet: true }),
      ai: { patrol: [[-20, 20], [-150, 20]], aggression: .7, morale: .8 } },
    { id: 'kl_guard_2', name: 'Manteau d’or', role: 'guard', faction: 'guet', x: -158, z: 24, yaw: Math.PI / 2, weapon: 'epee_longue', armor: 'maille', hp: 100, look: look({ female: false, tunic: '#c9a227', cloak: '#c9a227', helmet: true }), ai: { face: Math.PI / 2 } },
    { id: 'hallis', name: 'Septon Hallis', role: 'priest', faction: 'couronne', x: -68, z: -36, weapon: 'poings', hp: 40, look: look({ female: false, tunic: '#e8e2d4', beard: true, hair: '#cfcfcf' }), ai: { wander: 3 } },
    ...townsfolk('kl_folk', 8, [[0, 40], [2, 28], [-30, 58], [20, 58], [-60, 20], [-2, 0]], [[14, 30], [-14, 36], [-40, 40], [30, 40]],
      ['Les Manteaux d’or ? Des voleurs avec un uniforme.', 'On dit que la Main du Roi est malade…', 'Le pain a encore augmenté.', 'Attention aux coupe-bourses près du port.', 'Les Sept vous gardent, étranger.'])
  ],
  groups: [
    { id: 'kl_morrec', faction: 'couronne', stance: 'neutral', when: { quest: 'kl_noone', state: ['none', 'active'] }, loot: { gold: [30, 60], items: ['vin_arbor'] },
      members: [
        { id: 'morrec', name: 'Ser Morrec, collecteur', weapon: 'epee_courte', armor: 'vetements_fins', hp: 60, x: -22, z: -8, look: look({ female: false, tunic: '#6a1a1a', cloak: '#c9a227', beard: true }), stealthTarget: 'noone_clean', ai: { wander: 3, sight: 14 } },
        { id: 'morrec_1', name: 'Homme de main', weapon: 'gourdin', armor: 'cuir', hp: 70, x: -18, z: -4, ai: { patrol: [[-18, -4], [-27, -4], [-27, -13], [-18, -13]], sight: 16 } },
        { id: 'morrec_2', name: 'Homme de main', weapon: 'hachette', armor: 'cuir', hp: 70, x: -26, z: -12, ai: { wander: 4, sight: 16 } }] },
    { id: 'kl_scouts', faction: 'bandits', when: [{ flag: 'kl_ambush' }, { quest: 'kl_bandits', state: 'active' }], stance: 'hostile', loot: { gold: [4, 14], items: ['onguent'] },
      members: [{ id: 'kl_scout_1', name: 'Guetteur des Chardons', weapon: 'dague', armor: 'cuir', hp: 55, x: -205, z: 34 }, { id: 'kl_scout_2', name: 'Guetteur des Chardons', weapon: 'arc_court', armor: 'cuir', hp: 50, x: -212, z: 8 }] },
    { id: 'kl_bandits', faction: 'bandits', canSurrender: true, loot: { gold: [8, 25], items: ['onguent', 'ration'] },
      stance: [{ when: { quest: 'kl_bandits', step: ['tracks', 'decide'] }, value: 'parley' }, { value: 'hostile' }],
      members: [
        { id: 'nerys', name: 'Nerys Brisecol', leader: true, weapon: 'epee_longue', armor: 'brigandine', hp: 130, x: CAMP[0], z: CAMP[1] + 2, look: look({ female: true, tunic: '#4a3a22', cloak: '#3a2a1a' }), drop: 'insigne_bandit' },
        { id: 'kl_bandit_1', name: 'Chardon', weapon: 'hachette', armor: 'cuir', hp: 70, x: CAMP[0] + 5, z: CAMP[1] - 4 },
        { id: 'kl_bandit_2', name: 'Chardon', weapon: 'gourdin', armor: 'cuir', hp: 70, x: CAMP[0] - 5, z: CAMP[1] - 3 },
        { id: 'kl_bandit_3', name: 'Chardon', weapon: 'epee_courte', armor: 'cuir', hp: 70, x: CAMP[0] + 3, z: CAMP[1] + 6 },
        { id: 'kl_bandit_4', name: 'Archère des Chardons', weapon: 'arc_court', armor: 'cuir', hp: 55, x: CAMP[0] - 8, z: CAMP[1] + 8 }] }
  ],
  markers: [{ id: 'kl_camp', x: CAMP[0], z: CAMP[1], r: 22, label: 'Camp des Chardons' }],
  objects: [{ id: 'kl_wreck', x: -195, z: 20, r: 3, label: 'Examiner la charrette renversée', when: { quest: 'kl_bandits', step: 'wreck' }, model: 'cart',
    effects: [{ xp: 25 }], text: 'Des traces de bottes et de roues filent vers les collines au nord-ouest. Une flèche aux plumes de chardon est fichée dans le bois.' }],
  build(ctx) {
    camp(ctx, CAMP[0], CAMP[1], { tents: 4, gap: Math.PI * .2 });
    // bornes de pierre le long de la route de l'ouest, puis du sentier vers le camp
    const stone = ctx.mat('castle_wall_slates', { uv: 2, color: '#b0a898' });
    for (let x = -170; x > -200; x -= 10) ctx.cyl(.25, 1, x, height(x, 23) - .1, 23, stone, { seg: 6 });
    for (let t = 0; t <= 1; t += .2) { const x = -200 - 45 * t, z = 14 - 34 * t; ctx.cyl(.25, 1, x, height(x, z) - .1, z, stone, { seg: 6 }); }
    ctx.torch(-158, height(-158, 26) + 2.6, 26, { light: true });
  }
};
