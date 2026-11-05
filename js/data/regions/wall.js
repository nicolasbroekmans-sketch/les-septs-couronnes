// Région de départ : le Mur / Châteaunoir. Tunnel sous le Mur en x = −40 (voir js/scenes/wall.js).
import { look, camp } from './common.js';

const GROVE = [-40, -205];
const crow = o => look({ tunic: '#1e1e20', cloak: '#141416', pants: '#1a1a1a', ...o });
const onPatrol = { quest: 'wall_patrol', step: ['grove', 'ambush', 'choice'] };
export default {
  id: 'wall', scene: 'wall', name: 'Le Mur — Châteaunoir', region: 'Au bord du monde', climate: 'glace', lawFaction: 'garde',
  prices: { weapon: 1.2, armor: 1.2, vivres: 1.5, fourrure: .6, luxe: 1.8, consumable: 1.4 },
  spawn: { x: 22, z: 60, yaw: .1 }, bounds: [-130, -280, 120, 90],
  rumors: ['Frère Aldous cherche une épée pour patrouiller au-delà du Mur. Le tunnel est derrière le réfectoire.', 'La cage monte jusqu\u2019au sommet. Deux cents mètres, un seul câble.', 'Les sauvageons se rassemblent, à ce qu\u2019on dit. Plus nombreux que jamais.', 'L\u2019intendant Corwen vend fourrures et rations — hors de prix, comme tout ici.'],
  intro: 'Châteaunoir. Derrière vous, le Mur : deux cents mètres de glace. Devant vous, des frères en noir qui ne vous font pas encore confiance.',
  npcs: [
    { id: 'wall_recruteur', name: 'Frère Mullin, intendant', role: 'recruiter', faction: 'garde', x: 28, z: 56, yaw: Math.PI / 2, weapon: 'lance', armor: 'cuir', hp: 90, look: crow({ seed: 'mullin' }), ai: {} },
    { id: 'wall_capitaine', name: 'Premier patrouilleur Harlon', role: 'captain', faction: 'garde', x: 16, z: 56, yaw: -Math.PI / 2, weapon: 'epee_longue', armor: 'maille', hp: 150, look: crow({ helmet: true, beard: true, seed: 'harlon' }), ai: {} },
    { id: 'aldous', name: 'Frère Aldous, patrouilleur', role: 'quest', faction: 'garde', x: 14, z: 8, weapon: 'epee_longue', armor: 'maille', hp: 160, when: { not: onPatrol }, look: crow({ female: false, beard: true }), ai: { wander: 2, aggression: .7, morale: .9 } },
    { id: 'aldous', name: 'Frère Aldous, patrouilleur', role: 'quest', faction: 'garde', x: GROVE[0] + 6, z: GROVE[1] + 14, weapon: 'epee_longue', armor: 'maille', hp: 160, when: onPatrol, look: crow({ female: false, beard: true }), ai: { wander: 3, aggression: .8, morale: .95, noFlee: true } },
    { id: 'wall_brother', name: 'Frère Edd le Taiseux', role: 'guard', faction: 'garde', x: GROVE[0] - 4, z: GROVE[1] + 16, weapon: 'lance', armor: 'cuir', hp: 110, when: onPatrol, look: crow(), ai: { wander: 3, aggression: .6, noFlee: true } },
    { id: 'wall_beggar', name: 'Vieux frère manchot', role: 'beggar', faction: 'garde', x: -18, z: 16, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['Quarante ans sur le Mur. Il ne me reste qu’un bras et des histoires.'], ai: {} },
    { id: 'corwen', name: 'Intendant Corwen', role: 'merchant', merchant: true, faction: 'garde', x: 6, z: -15, weapon: 'dague', hp: 60,
      stock: { onguent: 4, ration: 15, fourrure: 6, cuir: 2, maille: 1, arc_long: 1, lance: 1 }, look: crow({ female: false, hair: '#8a8a8a' }), ai: { wander: 2 } },
    { id: 'dunstan', name: 'Dunstan, recrue', role: 'guard', faction: 'garde', x: -10, z: 12, weapon: 'epee_courte', armor: 'cuir', hp: 80, look: crow(), ai: { patrol: [[-14, 12], [14, 12], [14, -8], [-14, -8]] } },
    { id: 'wall_guard', name: 'Sentinelle du tunnel', role: 'guard', faction: 'garde', x: -36, z: -56, yaw: 0, weapon: 'lance', armor: 'maille', hp: 120, look: crow({ helmet: true }), ai: { face: Math.PI / 2 } },
    { id: 'ygra', name: 'Ygra la sauvageonne', role: 'prisoner', faction: 'peuple_libre', group: 'wall_ygra', x: GROVE[0] + 3, z: GROVE[1] - 2, weapon: 'poings', hp: 30, surrendered: true,
      when: { quest: 'wall_patrol', step: 'choice' }, look: look({ female: true, tunic: '#6a5a4a', cloak: '#8a7a6a', hair: '#a04a22' }) },
    { id: 'ygra_cell', name: 'Ygra (prisonnière)', role: 'prisoner', faction: 'peuple_libre', x: -30, z: -12, weapon: 'poings', hp: 30, when: { flag: 'ygra_prisoner' }, look: look({ female: true, tunic: '#6a5a4a', hair: '#a04a22' }),
      barks: ['Tu dors bien, corbeau ? Moi non plus.', 'Un jour, le Mur tombera.'], ai: {} }
  ],
  groups: [
    { id: 'wall_wildlings', faction: 'peuple_libre', stance: 'hostile', when: [{ flag: 'wall_ambush' }, { quest: 'wall_patrol', step: 'ambush' }], loot: { gold: [2, 8], items: ['fourrure', 'ration'] },
      members: [
        { id: 'wall_wild_1', name: 'Sauvageon', weapon: 'hachette', armor: 'cuir', hp: 80, x: GROVE[0] - 14, z: GROVE[1] - 12, look: look({ tunic: '#6a5a4a', cloak: '#8a7a6a' }) },
        { id: 'wall_wild_2', name: 'Sauvageonne à la lance', weapon: 'lance', armor: 'cuir', hp: 75, x: GROVE[0] + 12, z: GROVE[1] - 16, look: look({ female: true, tunic: '#5a4a3a', cloak: '#7a6a5a' }) },
        { id: 'wall_wild_3', name: 'Archer sauvageon', weapon: 'arc_long', armor: 'cuir', hp: 60, x: GROVE[0], z: GROVE[1] - 24, look: look({ tunic: '#4a4a3a', cloak: '#6a6a5a' }) }] }
  ],
  markers: [{ id: 'wall_grove', x: GROVE[0], z: GROVE[1], r: 16, label: 'Bosquet du barral' }],
  objects: [],
  build(ctx) {
    const { mat, THREE } = ctx, g = ctx.engine.groundFn, wood = mat('weathered_planks', { uv: 2, color: '#6a5444' });
    // cadre de bois et torches à l'entrée du tunnel
    for (const s of [-1, 1]) ctx.box(.4, 6, .4, -40 + s * 2.7, 0, -60, wood);
    ctx.box(6, .5, .5, -40, 6, -60, wood, { solid: false });
    ctx.torch(-43.3, 3, -59, { light: true }); ctx.torch(-36.7, 3, -142, { light: true });
    // forêt hantée au-delà du Mur, bosquet du barral et pierres levées
    const pines = [];
    for (let i = 0; i < 260; i++) { const x = -160 + Math.random() * 300, z = -150 - Math.random() * 180; if (Math.hypot(x - GROVE[0], z - GROVE[1]) > 22 && Math.abs(x + 40) > 5) pines.push([x, z, 1 + Math.random() * .8]); }
    ctx.trees(pines, 'pine', { leaf: '#1f2c2a' });
    const bark = new THREE.MeshStandardMaterial({ color: '#ece8df', roughness: .8 }), red = new THREE.MeshStandardMaterial({ color: '#a3150f', emissive: '#3a0505', flatShading: true });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.8, 1.3, 8, 10), bark); trunk.position.set(GROVE[0], 4, GROVE[1]); trunk.castShadow = true; ctx.add(trunk);
    for (let i = 0; i < 18; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + Math.random(), 0), red); const a = Math.random() * 6.28; l.position.set(GROVE[0] + Math.cos(a) * 3, 8 + Math.random() * 2.5, GROVE[1] + Math.sin(a) * 3); ctx.add(l); }
    ctx.collider(GROVE[0] - 1.2, 0, GROVE[1] - 1.2, GROVE[0] + 1.2, 9, GROVE[1] + 1.2);
    const stone = mat('rock_face', { uv: 3, color: '#8a8a88' });
    for (let k = 0; k < 7; k++) { const z = -150 - k * 8; ctx.box(.9, 2 + (k % 3) * .6, .7, -40 + (k % 2 ? 3 : -3), g(-40, z), z, stone); }
    camp(ctx, GROVE[0] + 30, GROVE[1] - 30, { tents: 2, cloth: '#7a6a5a' });
  }
};
