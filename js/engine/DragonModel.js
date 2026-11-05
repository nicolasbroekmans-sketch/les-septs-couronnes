// Dragon procédural : corps, cou et queue articulés en segments, tête à mâchoire et cornes, deux ailes membraneuses
// qui battent. Le modèle regarde vers +Z. animate(t, flap, open) : battement d'ailes et gueule ouverte (souffle).
import * as THREE from 'three';

export function dragonModel(color = '#2a1a1a') {
  const root = new THREE.Group(), skin = new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .25 }), belly = new THREE.MeshStandardMaterial({ color: '#6a4a32', roughness: .7 });
  const horn = new THREE.MeshStandardMaterial({ color: '#d8ccb0', roughness: .5 }), eye = new THREE.MeshBasicMaterial({ color: '#ffb020' });
  const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  mesh(new THREE.CapsuleGeometry(1.4, 4.5, 6, 12), skin, root).rotation.x = Math.PI / 2;
  mesh(new THREE.CapsuleGeometry(1.1, 3.6, 4, 10), belly, root, 0, -.45, 0).rotation.x = Math.PI / 2;
  // cou (5 segments) puis tête
  let prev = root; const neck = [];
  for (let i = 0; i < 5; i++) { const j = new THREE.Group(); j.position.set(0, i ? .25 : .6, i ? 1.1 : 3); prev.add(j); mesh(new THREE.SphereGeometry(.85 - i * .09, 10, 8), skin, j); neck.push(j); prev = j; }
  const head = new THREE.Group(); head.position.set(0, .2, 1.2); prev.add(head);
  mesh(new THREE.BoxGeometry(1.1, .8, 2), skin, head, 0, 0, .6);
  const jaw = new THREE.Group(); jaw.position.set(0, -.35, -.1); head.add(jaw); mesh(new THREE.BoxGeometry(.95, .25, 1.9), belly, jaw, 0, 0, .9);
  for (const s of [-1, 1]) { mesh(new THREE.ConeGeometry(.15, 1.3, 6), horn, head, s * .4, .55, -.5).rotation.x = -1.1; mesh(new THREE.SphereGeometry(.1, 6, 4), eye, head, s * .45, .2, 1); }
  // queue (8 segments)
  prev = root; const tail = [];
  for (let i = 0; i < 8; i++) { const j = new THREE.Group(); j.position.set(0, 0, i ? -1.1 : -3); prev.add(j); mesh(new THREE.SphereGeometry(.9 - i * .1, 8, 6), skin, j); tail.push(j); prev = j; }
  mesh(new THREE.ConeGeometry(.5, 1.2, 4), horn, prev, 0, 0, -.8).rotation.x = -Math.PI / 2;
  // ailes : os (bras + doigts) et membrane triangulée
  const wings = [];
  const mem = new THREE.MeshStandardMaterial({ color: '#4a2020', roughness: .8, side: THREE.DoubleSide, transparent: true, opacity: .92 });
  for (const s of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(s * 1.1, .9, 1); root.add(w);
    const pts = [0, 0, 0, s * 11, 1.5, -1, s * 9, 0, -5, s * 5, 0, -6.5, 0, 0, -4.5];
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]); g.computeVertexNormals();
    mesh(g, mem, w); mesh(new THREE.CylinderGeometry(.12, .2, 11, 6), skin, w, s * 5.5, .75, -.5).rotation.z = Math.PI / 2;
    wings.push({ w, s });
  }
  for (const s of [-1, 1]) for (const z of [1.8, -1.6]) mesh(new THREE.CapsuleGeometry(.3, 1.4, 3, 6), skin, root, s * .9, -1.6, z);
  root.scale.setScalar(1.15);
  return {
    root, head,
    animate(t, flap = 1, open = 0) {
      for (const { w, s } of wings) w.rotation.z = s * (Math.sin(t * 3.2) * .55 * flap + .1);
      neck.forEach((j, i) => (j.rotation.y = Math.sin(t * 1.3 - i * .4) * .08)); tail.forEach((j, i) => (j.rotation.y = Math.sin(t * 1.6 - i * .5) * .12));
      jaw.rotation.x = open * .6;
    }
  };
}
