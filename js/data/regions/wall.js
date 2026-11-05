// Région de départ : le Mur / Châteaunoir. Tunnel sous le Mur en x = −40 (voir js/scenes/wall.js).
import { look, camp } from './common.js';

const GROVE = [-40, -205];
const crow = o => look({ tunic: '#1e1e20', cloak: '#141416', pants: '#1a1a1a', house: 'garde', ...o });
const onPatrol = { quest: 'wall_patrol', step: ['tunnel', 'grove', 'ambush', 'choice'] };
const FIST = [40, -470], CREEK = [-12, -330];
/** Sentier de la patrouille : tunnel → bosquet → ruisseau gelé → Poing des Premiers Hommes. */
const pathX = z => z > -205 ? -40 : z > -330 ? -40 + (-205 - z) / 125 * 28 : -12 + (-330 - z) / 140 * 52;
const wight = (id, name, x, z, weapon) => ({ id, name, weapon, hp: 75, x, z, look: look({ skin: '#b8c4cc', eyes: '#7ad0ff', hair: '#d8dcdc', tunic: '#3a3a3a', cloak: '#2a2c30', pants: '#2a2a2a' }), ai: { noFlee: true, aggression: .95, morale: 1 } });
export default {
  id: 'wall', scene: 'wall', name: 'Le Mur — Châteaunoir', region: 'Au bord du monde', climate: 'glace', lawFaction: 'garde',
  prices: { weapon: 1.2, armor: 1.2, vivres: 1.5, fourrure: .6, luxe: 1.8, consumable: 1.4 },
  spawn: { x: 22, z: 60, yaw: .1 }, bounds: [-170, -540, 160, 90],
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
    { id: 'wall_wights', faction: 'morts', stance: 'hostile', when: [{ flag: 'fist_dead' }, { quest: 'wall_fist', step: 'dead' }], loot: { gold: [0, 4], items: ['fourrure'] },
      members: [wight('wight_1', 'Mort qui marche', FIST[0] - 14, FIST[1] - 20, 'hachette'), wight('wight_2', 'Mort qui marche', FIST[0] + 16, FIST[1] - 18, 'poings'), wight('wight_3', 'Ancien frère, mort', FIST[0] - 22, FIST[1] + 4, 'epee_longue'),
        wight('wight_4', 'Mort qui marche', FIST[0] + 22, FIST[1] + 6, 'lance'), wight('wight_5', 'Sauvageonne morte', FIST[0], FIST[1] - 30, 'hachette')] },
    { id: 'wall_wildlings', faction: 'peuple_libre', stance: 'hostile', when: [{ flag: 'wall_ambush' }, { quest: 'wall_patrol', step: 'ambush' }], loot: { gold: [2, 8], items: ['fourrure', 'ration'] },
      members: [
        { id: 'wall_wild_1', name: 'Sauvageon', weapon: 'hachette', armor: 'cuir', hp: 80, x: GROVE[0] - 14, z: GROVE[1] - 12, look: look({ tunic: '#6a5a4a', cloak: '#8a7a6a' }) },
        { id: 'wall_wild_2', name: 'Sauvageonne à la lance', weapon: 'lance', armor: 'cuir', hp: 75, x: GROVE[0] + 12, z: GROVE[1] - 16, look: look({ female: true, tunic: '#5a4a3a', cloak: '#7a6a5a' }) },
        { id: 'wall_wild_3', name: 'Archer sauvageon', weapon: 'arc_long', armor: 'cuir', hp: 60, x: GROVE[0], z: GROVE[1] - 24, look: look({ tunic: '#4a4a3a', cloak: '#6a6a5a' }) }] }
  ],
  markers: [{ id: 'wall_grove', x: GROVE[0], z: GROVE[1], r: 16, label: 'Bosquet du barral' }, { id: 'wall_tunnel', x: -40, z: -64, r: 7, label: 'Tunnel sous le Mur' },
    { id: 'wall_creek', x: CREEK[0], z: CREEK[1], r: 12, label: 'Le ruisseau gelé' }, { id: 'wall_fist', x: FIST[0], z: FIST[1], r: 20, label: 'Le Poing des Premiers Hommes' }],
  objects: [{ id: 'wall_cache', x: FIST[0] + 4, z: FIST[1] - 6, r: 2.2, label: 'Fouiller sous les pierres', once: true, when: { quest: 'wall_fist', step: 'cache' },
    effects: [{ item: 'dague_verre_dragon' }, { item: 'onguent', qty: 2 }], text: 'Sous une pierre plate, un manteau de la Garde enroulé autour de lames noires et brillantes : du verredragon. Quelqu’un les a cachées ici… et n’est jamais revenu.' }],
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
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.8, 1.3, 8, 10), bark); trunk.position.set(GROVE[0], g(GROVE[0], GROVE[1]) + 4, GROVE[1]); trunk.castShadow = true; ctx.add(trunk);
    for (let i = 0; i < 18; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + Math.random(), 0), red); const a = Math.random() * 6.28; l.position.set(GROVE[0] + Math.cos(a) * 3, g(GROVE[0], GROVE[1]) + 8 + Math.random() * 2.5, GROVE[1] + Math.sin(a) * 3); ctx.add(l); }
    ctx.collider(GROVE[0] - 1.2, 0, GROVE[1] - 1.2, GROVE[0] + 1.2, 20, GROVE[1] + 1.2);
    const stone = mat('rock_face', { uv: 3, color: '#8a8a88' });
    for (let k = 0; k < 7; k++) { const z = -150 - k * 8; ctx.box(.9, 2 + (k % 3) * .6, .7, -40 + (k % 2 ? 3 : -3), g(-40, z), z, stone); }
    camp(ctx, GROVE[0] + 30, GROVE[1] - 30, { tents: 2, cloth: '#7a6a5a' });
    // la forêt hantée, dense, jusqu'au Poing ; le sentier reste dégagé
    const deep = [];
    for (let i = 0; i < 1100; i++) { const x = -165 + Math.random() * 320, z = -150 - Math.random() * 385; if (Math.abs(x - pathX(z)) > 6 && Math.hypot(x - FIST[0], z - FIST[1]) > 36 && Math.hypot(x - GROVE[0], z - GROVE[1]) > 22 && Math.hypot(x - CREEK[0], z - CREEK[1]) > 10) deep.push([x, z, .9 + Math.random() * .9]); }
    ctx.trees(deep, 'pine', { leaf: '#1c2a26' });
    // le ruisseau gelé et le Poing : anneau de vieilles pierres sur la colline plate
    const ice = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), new THREE.MeshStandardMaterial({ color: '#a8c8d8', roughness: .1 })); ice.rotation.x = -Math.PI / 2; ice.rotation.z = .6; ice.position.set(CREEK[0], g(CREEK[0], CREEK[1]) + .06, CREEK[1]); ctx.add(ice);
    const fy = g(FIST[0], FIST[1]);
    for (let i = 0; i < 46; i++) { const a = i / 46 * 6.28; if (i % 9 === 0) continue; const sx = FIST[0] + Math.cos(a) * 26, sz = FIST[1] + Math.sin(a) * 26; ctx.box(1.6 + Math.random(), 1 + Math.random() * 1.4, 1.2, sx, g(sx, sz) - .4, sz, stone, { rotY: -a }); }
    for (let i = 0; i < 6; i++) ctx.box(.8, .5, .8, FIST[0] + 4 + (i % 3) * .9, fy, FIST[1] - 6 + Math.floor(i / 3) * .9, stone, { solid: false });
    ctx.fire(FIST[0] - 6, fy + .2, FIST[1] + 4, .6);
    ctx.poi(FIST[0], FIST[1] + 12, 'Le Poing des Premiers Hommes', 'Une colline plate couronnée d’un anneau de pierres plus vieilles que le Mur. Les Premiers Hommes y ont combattu quelque chose. Le vent y siffle comme une plainte.', { color: '#a8c8e0' });
    ctx.poi(CREEK[0], CREEK[1] + 8, 'Le ruisseau gelé', 'L’eau ne coule plus, même en été. Sur la glace, des traces de pas nus. Pas d’animal. Pas d’homme, non plus.');
  }
};
