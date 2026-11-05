// Rendu de foule : chaque partie du corps est un InstancedMesh partagé par tous les soldats
// (≈ 9 appels de dessin pour 100 combattants). Animation procédurale : marche, frappe, parade, mort.
import * as THREE from 'three';

const PARTS = [ // [nom, géométrie, articulation (x,y,z), décalage depuis l'articulation]
  ['torso', () => new THREE.CapsuleGeometry(.17, .38, 3, 8), [0, 1.3, 0], -0], ['head', () => new THREE.SphereGeometry(.12, 10, 8), [0, 1.74, 0], 0],
  ['helm', () => new THREE.SphereGeometry(.135, 10, 6, 0, Math.PI * 2, 0, Math.PI * .55), [0, 1.76, 0], 0],
  ['armL', () => new THREE.CapsuleGeometry(.05, .5, 2, 6), [-.23, 1.55, 0], -.3], ['armR', () => new THREE.CapsuleGeometry(.05, .5, 2, 6), [.23, 1.55, 0], -.3],
  ['legL', () => new THREE.CapsuleGeometry(.07, .7, 2, 6), [-.1, .92, 0], -.42], ['legR', () => new THREE.CapsuleGeometry(.07, .7, 2, 6), [.1, .92, 0], -.42],
  ['weapon', () => new THREE.BoxGeometry(.05, .05, 1), [.23, 1.55, 0], -.6], ['shield', () => new THREE.CylinderGeometry(.32, .32, .05, 12), [-.3, 1.3, .12], 0]
];
const TEAM = { A: new THREE.Color('#3a5a8a'), B: new THREE.Color('#8a2a1a') };

export class CrowdRenderer {
  constructor(scene, capacity = 160) {
    this.meshes = {}; this.cap = capacity;
    const mats = { torso: new THREE.MeshStandardMaterial({ roughness: .7, metalness: .3 }), head: new THREE.MeshStandardMaterial({ color: '#d8b49a', roughness: .8 }),
      helm: new THREE.MeshStandardMaterial({ color: '#8a8f96', metalness: .85, roughness: .35 }), limb: new THREE.MeshStandardMaterial({ color: '#3a3028', roughness: .9 }),
      weapon: new THREE.MeshStandardMaterial({ color: '#c8ccd2', metalness: .9, roughness: .3 }), shield: new THREE.MeshStandardMaterial({ roughness: .8 }) };
    for (const [name, geo] of PARTS) {
      const mat = mats[name] ?? (name.startsWith('arm') || name.startsWith('leg') ? mats.limb : mats.torso);
      const m = new THREE.InstancedMesh(geo(), mat, capacity); m.count = 0; m.castShadow = true; m.frustumCulled = false;
      if (name === 'torso' || name === 'shield') m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
      scene.add(m); this.meshes[name] = m;
    }
    this.B = new THREE.Matrix4(); this.J = new THREE.Matrix4(); this.R = new THREE.Matrix4(); this.O = new THREE.Matrix4(); this.M = new THREE.Matrix4(); this.c = new THREE.Color();
  }
  update(soldiers, dt) {
    let i = 0;
    for (const s of soldiers) {
      if (i >= this.cap) break;
      if (!s.alive) { s.deadT += dt; if (s.deadT > 25) continue; }
      const f = s.fighter, sp = s.speed; s.phase += dt * (2 + sp * 1.9);
      const sw = Math.sin(s.phase) * .7 * Math.min(1, sp / 2.5);
      let armR = sw * .6, armL = -sw * .6, wpn = -1.2;
      if (f.state === 'windup') { armR = -2.2; wpn = -2; } else if (f.state === 'active') { armR = -.4; wpn = -.6; } else if (f.state === 'block') { armL = -1.3; armR = -1.2; }
      if (f.weapon.ranged && (f.state === 'windup' || f.state === 'active')) { armL = -1.5; armR = -1.5; wpn = -1.5; }
      this.B.makeRotationY(s.yaw + Math.PI).setPosition(s.pos.x, s.pos.y, s.pos.z);
      if (!s.alive) this.B.multiply(this.R.makeRotationX(-Math.PI / 2 * Math.min(1, s.deadT * 3))).multiply(this.O.makeTranslation(0, .15, 0));
      const rot = { armL, armR, legL: sw, legR: -sw, weapon: wpn, torso: 0, head: 0, helm: 0, shield: 0 };
      for (const [name, , j, off] of PARTS) {
        const m = this.meshes[name];
        if (name === 'shield' && s.unit !== 'homme_armes' && s.unit !== 'chevalier') { this.M.makeScale(0, 0, 0); m.setMatrixAt(i, this.M); continue; }
        this.J.makeTranslation(j[0], j[1], j[2]); this.R.makeRotationX(rot[name]);
        this.O.makeTranslation(0, name === 'weapon' ? 0 : off, name === 'weapon' ? -off : 0);
        if (name === 'shield') this.O.makeRotationX(Math.PI / 2);
        m.setMatrixAt(i, this.M.copy(this.B).multiply(this.J).multiply(this.R).multiply(this.O));
        if (m.instanceColor) m.setColorAt(i, this.c.copy(TEAM[s.team]).lerp(this.c.clone().set(s.tint), name === 'shield' ? 0 : .35));
      }
      i++;
    }
    for (const m of Object.values(this.meshes)) { m.count = i; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  }
  dispose() { for (const m of Object.values(this.meshes)) { m.removeFromParent(); m.geometry.dispose(); m.material.dispose?.(); } }
}
