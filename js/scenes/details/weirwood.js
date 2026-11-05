// Barral : tronc blanc torsadé, visage gravé qui pleure une sève rouge, frondaison rouge, pétales.
export function weirwood(ctx, x, z) {
  const { THREE } = ctx;
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#ece8df'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(120,110,100,${Math.random() * .25})`; g.lineWidth = 1 + Math.random() * 2; const px = Math.random() * 256; g.beginPath(); g.moveTo(px, 0); g.bezierCurveTo(px + 10, 150, px - 10, 350, px + 5, 512); g.stroke(); }
  const fx = 96; // visage
  g.fillStyle = '#3a1410';
  g.beginPath(); g.ellipse(fx - 18, 250, 11, 6, -.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(fx + 18, 250, 11, 6, .3, 0, 7); g.fill();
  g.beginPath(); g.moveTo(fx - 20, 320); g.quadraticCurveTo(fx, 300, fx + 20, 320); g.quadraticCurveTo(fx, 335, fx - 20, 320); g.fill();
  g.strokeStyle = '#8b0000'; g.lineWidth = 4; [[fx - 18, 256], [fx + 18, 256]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, b); g.bezierCurveTo(a - 2, b + 40, a + 3, b + 70, a, b + 110); g.stroke(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.CylinderGeometry(.9, 1.4, 7, 24, 12);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = y * .18, px = p.getX(i), pz = p.getZ(i); p.setXYZ(i, px * Math.cos(a) - pz * Math.sin(a) + Math.sin(y * .8) * .15, y, px * Math.sin(a) + pz * Math.cos(a)); }
  geo.computeVertexNormals();
  const bark = new THREE.MeshStandardMaterial({ map: t, roughness: .8 });
  const trunk = new THREE.Mesh(geo, bark); trunk.position.set(x, 3.5, z); trunk.rotation.y = Math.PI * .2; trunk.castShadow = true; ctx.add(trunk);
  ctx.collider(x - 1.2, 0, z - 1.2, x + 1.2, 8, z + 1.2);
  const branchM = new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: .8 });
  const leafM = new THREE.MeshStandardMaterial({ color: '#a3150f', emissive: '#4a0505', roughness: .7, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28, b = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, 4.5, 6), branchM);
    b.position.set(x + Math.cos(a) * 1.6, 7.6, z + Math.sin(a) * 1.6); b.rotation.set(Math.sin(a) * .8, 0, -Math.cos(a) * .8); b.castShadow = true; ctx.add(b);
  }
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), leafM, 40), M = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * 6.28, r = Math.random() * 4.2, s = .9 + Math.random() * 1.1;
    M.makeRotationY(Math.random() * 6).setPosition(x + Math.cos(a) * r, 8.2 + Math.random() * 2.6, z + Math.sin(a) * r); M.scale(new THREE.Vector3(s, s * .7, s)); leaves.setMatrixAt(i, M);
  }
  leaves.castShadow = true; ctx.add(leaves);
  ctx.emitter('petals', x, 2, z, { box: [10, 9, 10], count: 60, vel: [.3, -.6, .2], color: '#b01a12', local: true, opacity: .9, size: .12 });
}
