// Région de départ : Winterfell. Coordonnées dans le repère de js/scenes/winterfell.js.
import { look, townsfolk, camp } from './common.js';

const CAMP = [-105, -62];
const stark = o => look({ tunic: '#5a5f66', cloak: '#3a3a3e', ...o });
export default {
  id: 'winterfell', scene: 'winterfell', name: 'Winterfell', region: 'Le Nord', climate: 'nord', lawFaction: 'stark',
  prices: { weapon: .95, armor: 1, luxe: 1.3, vivres: 1.1, fourrure: .7, consumable: 1.1 },
  spawn: { x: 0, z: 118, yaw: 0 }, bounds: [-160, -140, 130, 185],
  rumors: ['Torvald le forgeron s\u2019arrache les cheveux : des déserteurs lui ont volé du fer. Ils se cachent dans le Bois-aux-Loups, au nord-ouest.', 'Les sources chaudes du bois sacré ne gèlent jamais. Maege dit que les anciens dieux y dorment.', 'Le Nord se souvient. Surtout des dettes.', 'Torvald peut renforcer ta lame et ton armure, si tu as de quoi payer.', 'On recrute des hommes d\u2019armes à la porte de Winter Town.'],
  intro: 'Winter Town, au pied des remparts de Winterfell. Le froid mord, la neige tombe. Ici, on juge un homme à ses actes.',
  npcs: [
    { id: 'wf_recruteur', name: 'Halvard le recruteur', role: 'recruiter', faction: 'stark', x: 9, z: 124, yaw: Math.PI / 2, weapon: 'lance', armor: 'cuir', hp: 90, look: stark({ seed: 'halvard' }), ai: {} },
    { id: 'wf_capitaine', name: 'Capitaine Rodrik Neigefort', role: 'captain', faction: 'stark', x: -9, z: 124, yaw: -Math.PI / 2, weapon: 'epee_longue', armor: 'maille', hp: 140, look: stark({ helmet: true, seed: 'rodrik' }), ai: {} },
    { id: 'wf_beggar_1', name: 'Vieil Edrick', role: 'beggar', faction: 'peuple', x: -6, z: 82, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['J’ai combattu pour le Roi Robert. On m’a donné une jambe de bois et un merci.'], ai: {} },
    { id: 'wf_beggar_2', name: 'Brienne la Glaneuse', role: 'beggar', faction: 'peuple', x: 12, z: 104, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['L’hiver dernier a pris ma ferme. Celui-ci prendra peut-être le reste.'], ai: {} },
    { id: 'torvald', name: 'Torvald le forgeron', role: 'merchant', merchant: true, smith: true, faction: 'stark', x: 23, z: 0, yaw: Math.PI, weapon: 'masse', hp: 90,
      stock: { epee_longue: 2, hache_guerre: 1, masse: 1, lance: 1, dague: 2, cuir: 2, brigandine: 1, maille: 1, arc_long: 1 }, look: look({ female: false, beard: true, tunic: '#3a2a22' }), ai: { wander: 1.5 } },
    { id: 'hilda', name: 'Hilda l’aubergiste', role: 'merchant', merchant: true, faction: 'peuple', x: 6, z: 64, weapon: 'poings', hp: 50,
      stock: { onguent: 5, ration: 12, fourrure: 3, vin_arbor: 1, sel: 4 }, look: look({ female: true, tunic: '#6a4a3a' }), ai: { wander: 3 } },
    { id: 'maege', name: 'Maege, gardienne du bois sacré', role: 'priest', faction: 'stark', x: -20, z: -17, weapon: 'poings', hp: 50, look: look({ female: true, hair: '#d8d8d8', tunic: '#3a4a3a', cloak: '#2a3a2a' }), ai: { wander: 4 } },
    { id: 'wf_guard_1', name: 'Garde de Winterfell', role: 'guard', faction: 'stark', x: -5, z: 30, yaw: Math.PI, weapon: 'lance', armor: 'maille', hp: 110, look: stark({ helmet: true }), ai: { face: Math.PI } },
    { id: 'wf_guard_2', name: 'Garde de Winterfell', role: 'guard', faction: 'stark', x: 5, z: 30, yaw: Math.PI, weapon: 'epee_longue', armor: 'maille', hp: 110, look: stark({ helmet: true }), ai: { face: Math.PI } },
    { id: 'wf_guard_3', name: 'Patrouilleur', role: 'guard', faction: 'stark', x: 0, z: -10, weapon: 'epee_longue', armor: 'brigandine', hp: 100, look: stark(), ai: { patrol: [[-10, -12], [12, -12], [12, -30], [-10, -30]] } },
    { id: 'wat', name: 'Wat, apprenti forgeron', role: 'villager', faction: 'stark', x: 20, z: 3, weapon: 'poings', hp: 50, when: [{ npcFlag: 'spared', npc: 'wat' }, { quest: 'wf_iron', state: 'completed' }], look: look({ female: false, tunic: '#4a3a2a', seed: 'wat' }), ai: { wander: 2 } },
    ...townsfolk('wf_folk', 8, [[0, 70], [-20, 90], [20, 100], [0, 45], [-12, 0]], [[-30, 80], [30, 70], [15, 110], [-25, 110]],
      ['Le Nord se souvient.', 'L’hiver vient, comme ils disent là-haut.', 'Des déserteurs rôdent dans le Bois-aux-Loups.', 'Les sources chaudes ? Un miracle des anciens dieux.', 'Couvrez-vous, étranger, vous allez geler.'])
  ],
  groups: [
    { id: 'wf_deserters', faction: 'deserteurs', canSurrender: true, stance: 'hostile', when: { quest: 'wf_iron', state: ['none', 'active'] }, loot: { gold: [6, 18], items: ['ration', 'fourrure'] },
      members: [
        { id: 'wf_des_chef', name: 'Ulf le Déserteur', leader: true, weapon: 'epee_longue', armor: 'brigandine', hp: 100, x: CAMP[0], z: CAMP[1] + 3, look: look({ female: false, beard: true, tunic: '#4a4a44', cloak: '#2a2a2a' }), ai: { noFlee: true } },
        { id: 'wat', name: 'Wat', weapon: 'gourdin', armor: 'cuir', hp: 60, x: CAMP[0] + 5, z: CAMP[1] - 2, look: look({ female: false, tunic: '#4a3a2a', seed: 'wat' }), ai: { canSurrender: true, surrenderAlways: true, morale: .2 } },
        { id: 'wf_des_3', name: 'Déserteur archer', weapon: 'arc_court', armor: 'cuir', hp: 60, x: CAMP[0] - 7, z: CAMP[1] + 7 }] }
  ],
  markers: [{ id: 'wf_camp', x: CAMP[0], z: CAMP[1], r: 22, label: 'Camp des déserteurs' }],
  objects: [{ id: 'wf_crate', x: CAMP[0] + 2, z: CAMP[1] - 5, r: 2.5, label: 'Prendre la caisse de fer', once: true, model: 'crate',
    when: { quest: 'wf_iron', state: 'active' }, effects: [{ item: 'caisse_fer' }], text: 'Lourde, frappée du loup des Stark. Le fer de la garnison.' }],
  build(ctx) {
    camp(ctx, CAMP[0], CAMP[1], { tents: 3, cloth: '#5a5448', gap: Math.PI * .1 });
    const pines = [];
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, r = 18 + Math.random() * 30; pines.push([CAMP[0] + Math.cos(a) * r, CAMP[1] + Math.sin(a) * r, 1 + Math.random() * .6]); }
    ctx.trees(pines.filter(([x, z]) => Math.abs(z - CAMP[1] + 18) > 4 || x < CAMP[0] - 5), 'pine', { leaf: '#2c3f33' });
  }
};
