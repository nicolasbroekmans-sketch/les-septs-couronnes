// Barque en bois procédurale : coque lissée par sections (bordages texturés, intérieur visible), bancs,
// plat-bord et deux avirons articulés (userData.oars) que l'on anime pendant la nage. Proue vers +Z.
import * as THREE from 'three';

let planks = null;
function wood() {
  if (!planks) {
    const t = new THREE.TextureLoader().load('assets/textures/weathered_planks.webp'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    planks = { hull: new THREE.MeshStandardMaterial({ map: t, color: '#a07a58', roughness: .85, side: THREE.DoubleSide }), dark: new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: .8 }) };
  }
  return planks;
}

function hullGeometry(L = 4.2, W = .78, keel = -.38, rim = .36) {
  const S = 16, U = 9, pos = [], uv = [], idx = [];
  for (let i = 0; i <= S; i++) {
    const t = i / S * 2 - 1, w = W * Math.pow(Math.max(.002, 1 - Math.pow(Math.abs(t), 2.2)), .62) + .03, top = rim + .16 * t * t, z = t * L / 2;
    for (let j = 0; j <= U; j++) { const u = j / U * 2 - 1; pos.push(w * u, keel + (top - keel) * Math.pow(Math.abs(u), 1.7) * (1 - .25 * t * t) + .25 * t * t * (1 - Math.abs(u)), z); uv.push(t * 2.2, u * 1.2); }
  }
  for (let i = 0; i < S; i++) for (let j = 0; j < U; j++) { const a = i * (U + 1) + j, b = a + U + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export function rowboatMesh() {
  const M = wood(), g = new THREE.Group(), add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(hullGeometry(), M.hull, 0, 0, 0);
  for (const s of [-1, 1]) { const rimG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([-2.05, -1.3, -.4, .5, 1.3, 2.05].map(z => { const t = z / 2.1; return new THREE.Vector3(s * (.78 * Math.pow(Math.max(.002, 1 - Math.pow(Math.abs(t), 2.2)), .62) + .03), .36 + .16 * t * t, z); })), 20, .045, 5); add(rimG, M.dark, 0, 0, 0); }
  for (const z of [-1, .2, 1.2]) add(new THREE.BoxGeometry(1.35 * (1 - Math.abs(z) * .28), .07, .32), M.dark, 0, .08, z);
  add(new THREE.BoxGeometry(.08, .7, .08), M.dark, 0, .4, 2.08, .5);
  g.userData.oars = [-1, 1].map(s => {
    const pivot = new THREE.Group(); pivot.position.set(s * .8, .42, .15); g.add(pivot);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 2.6, 6), M.dark); shaft.rotation.z = s * Math.PI / 2 * .78; shaft.position.set(s * .75, -.25, 0); pivot.add(shaft);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.5, .04, .16), M.hull); blade.position.set(s * 1.85, -.7, 0); blade.rotation.z = s * .5; pivot.add(blade);
    return pivot;
  });
  g.userData.drivable = 'barque';
  return g;
}
