// Sapin réaliste et léger : tronc texturé (écorce) + verticilles de « cartes » d'aiguilles (photo Poly Haven, CC0,
// détourée en transparence). ~180 triangles par arbre : des milliers d'arbres instanciés restent fluides.
import * as THREE from 'three';

export function firGeometry() {
  const pos = [], uv = [], idx = [];
  const quad = (a, b, c, d) => { const o = pos.length / 3; pos.push(...a, ...b, ...c, ...d); uv.push(0, 1, 1, 1, 1, 0, 0, 0); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  const layers = 16;
  for (let k = 0; k < layers; k++) {
    const t = k / (layers - 1), y = 1 + t * 7.6, r = 2.6 * (1 - t) ** .9 + .4, n = k < 12 ? 9 : 6, droop = .45 * r, w = r * 1.25;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * .9, ca = Math.cos(a), sa = Math.sin(a), px = -sa, pz = ca;
      const inner = [ca * .1, y + .15, sa * .1], outer = [ca * r, y - droop, sa * r];
      quad([inner[0] - px * w * .3, inner[1], inner[2] - pz * w * .3], [inner[0] + px * w * .3, inner[1], inner[2] + pz * w * .3],
        [outer[0] + px * w * .6, outer[1], outer[2] + pz * w * .6], [outer[0] - px * w * .6, outer[1], outer[2] - pz * w * .6]);
    }
  }
  for (const a of [0, Math.PI / 2]) { const ca = Math.cos(a) * .7, sa = Math.sin(a) * .7; quad([-ca, 9.4, -sa], [ca, 9.4, sa], [ca, 7.4, sa], [-ca, 7.4, -sa]); } // cime
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // normales orientées vers le haut et vers l'extérieur : éclairage doux, pas de faces noires
  const nrm = g.attributes.normal, p = g.attributes.position;
  for (let i = 0; i < nrm.count; i++) { const x = p.getX(i), z = p.getZ(i), l = Math.hypot(x, z) || 1; nrm.setXYZ(i, x / l * .6, .8, z / l * .6); }
  return g;
}
export const trunkGeometry = () => new THREE.CylinderGeometry(.05, .22, 7.4, 6).translate(0, 3.7, 0);
