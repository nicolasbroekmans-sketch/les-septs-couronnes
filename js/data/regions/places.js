// Régions générées pour tous les lieux de la carte (hors Port-Réal, Winterfell, le Mur qui ont leurs quêtes) :
// habitants, marchand, gardes de la maison locale, mendiant, recruteur. Les positions sont relatives au point
// d'arrivée du lieu et résolues au chargement (localize), une fois la scène construite.
import { PLACES } from '../places.js';
import { look, townsfolk } from './common.js';

const LAW = { dragonstone: 'targaryen', casterly: 'lannister', highgarden: 'tyrell', dorne: 'martell', eyrie: 'arryn', pyke: 'greyjoy', braavos: 'banque', pentos: 'banque', volantis: 'banque', meereen: 'peuple', vaesdothrak: 'peuple', qarth: 'banque', valyria: 'peuple',
  combegivre: 'stark', gue: 'tully', portsel: 'arryn', mielbois: 'tyrell', sablerouge: 'martell' };
const CLIMATE = { combegivre: 'nord', eyrie: 'tempere', pyke: 'tempere', dorne: 'desert', sablerouge: 'desert', qarth: 'desert', meereen: 'desert', vaesdothrak: 'tempere', valyria: 'tempere' };
const COLORS = { lannister: '#8b0000', tyrell: '#3f6a34', martell: '#d97a2a', arryn: '#5a7aa8', greyjoy: '#1e1e22', targaryen: '#3a0a0a', stark: '#5a5f66', tully: '#3a5a9a', banque: '#4a4a52', peuple: '#6a5a3a' };
const LINES = ['Le bonjour, voyageur.', 'Belle journée… pour l’instant.', 'Tu n’es pas d’ici, toi.', 'Méfie-toi des routes à la nuit tombée.'];

export function placeRegion(p) {
  const law = LAW[p.id] ?? 'peuple', c = COLORS[law] ?? '#6a5a3a', guard = o => look({ tunic: c, cloak: c, ...o });
  const rel = [
    { id: p.id + '_marchand', name: 'Marchande du coin', role: 'merchant', merchant: true, faction: 'peuple', dx: 5, dz: -6, weapon: 'dague', hp: 60, stock: { onguent: 5, ration: 12, fourrure: 3, cuir: 2, maille: 1, epee_longue: 1, arc_court: 1 }, look: look({ female: true }), barks: ['Approche, approche ! Des vivres, des onguents, du cuir.', 'Tout est frais. Enfin, presque tout.'], ai: { wander: 2 } },
    { id: p.id + '_garde1', name: 'Garde', role: 'guard', faction: law, dx: -4, dz: -12, weapon: 'lance', armor: 'maille', hp: 110, look: guard({ helmet: true }), ai: { wander: 3 } },
    { id: p.id + '_garde2', name: 'Garde', role: 'guard', faction: law, dx: 4, dz: -14, weapon: 'epee_longue', armor: 'maille', hp: 110, look: guard({ helmet: true }), ai: { patrol: [[-12, -8], [12, -8], [12, -24], [-12, -24]] } },
    { id: p.id + '_mendiant', name: 'Mendiant', role: 'beggar', faction: 'peuple', dx: -3, dz: -3, weapon: 'poings', hp: 30, sit: true, look: look({ tunic: '#4a4036', pants: '#3a3028' }), story: ['La guerre m’a pris ma terre. L’hiver prendra le reste.'], ai: {} },
    { id: p.id + '_recruteur', name: 'Sergent recruteur', role: 'recruiter', faction: law, dx: 7, dz: 2, yaw: Math.PI / 2, weapon: 'lance', armor: 'cuir', hp: 90, look: guard({}), ai: {} },
    ...townsfolk(p.id, 6, [[-6, -16], [6, -20], [0, -26]], [[-6, -16], [6, -20]], LINES)
  ];
  return {
    id: p.id, scene: p.scene === 'generic' ? 'generic' : p.scene, placeId: p.id, name: p.name, region: p.region, climate: CLIMATE[p.id] ?? 'tempere', lawFaction: law,
    prices: {}, intro: p.mood, npcs: rel, groups: [], markers: [], objects: [], rumors: [p.mood, 'On dit que les routes sont plus sûres depuis la bataille du Gué-aux-Corbeaux.', 'Le recruteur paie bien ceux qui savent tenir une lance.'],
    localize(def, sp) { if (def.localized) return; def.localized = true; for (const n of def.npcs) { n.x = sp.x + (n.dx ?? n.x); n.z = sp.z + (n.dz ?? n.z); if (n.ai?.patrol) n.ai.patrol = n.ai.patrol.map(([x, z]) => [sp.x + x, sp.z + z]); if (n.ai?.schedule) for (const s of n.ai.schedule) s.at = [sp.x + s.at[0], sp.z + s.at[1]]; } }
  };
}
export const placeRegions = ids => Object.fromEntries(PLACES.filter(p => !ids.includes(p.id)).map(p => [p.id, placeRegion(p)]));
