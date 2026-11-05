// Le Grand Septuaire de Baelor : base heptagonale en marbre blanc à colonnes engagées, galerie d'arcades, tambour
// percé de fenêtres, grand dôme côtelé gris-bleu, lanterne et cristal au sommet, sept tours fines à flèches,
// portique à colonnes et grand escalier vers la place. D'après l'image de référence (vue de la ville depuis le nord).
export function greatSept(ctx, sx, sz, sy) {
  const { THREE, mat, props: P } = ctx;
  const marble = mat('marble_01', { uv: 6, color: '#f2eee6' }), dark = mat(null, { color: '#2a2622', emissive: '#ffcf8a', ei: .25 });
  const domeM = new THREE.MeshStandardMaterial({ color: '#9aa6ae', metalness: .35, roughness: .45 }), gold = mat(null, { color: '#d8b850', metal: .8, rough: .3 });
  // socle et terrasse
  ctx.cyl(26, 1.5, sx, sy - 1.4, sz, marble, { seg: 7 });
  ctx.cyl(21, 13, sx, sy, sz, marble, { seg: 7 });
  for (let i = 0; i < 21; i++) { const a = i / 21 * 6.28; ctx.cyl(.7, 12, sx + Math.cos(a) * 21.4, sy, sz + Math.sin(a) * 21.4, marble, { seg: 8, solid: false }); }
  for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * 6.28; ctx.box(2.2, 4.5, .3, sx + Math.cos(a) * 21.2, sy + 5, sz + Math.sin(a) * 21.2, dark, { rotY: -a + Math.PI / 2, solid: false }); }
  ctx.cyl(22, 1.2, sx, sy + 13, sz, marble, { seg: 7, solid: false });
  // tambour à fenêtres, dôme côtelé, lanterne
  ctx.cyl(15, 7, sx, sy + 14, sz, marble, { seg: 28 });
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; ctx.box(1.2, 3.6, .3, sx + Math.cos(a) * 15.05, sy + 15.5, sz + Math.sin(a) * 15.05, dark, { rotY: -a + Math.PI / 2, solid: false }); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(15.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.scale.y = 1.15; dome.position.set(sx, sy + 21, sz); dome.castShadow = true; ctx.add(dome);
  for (let i = 0; i < 16; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(15.6, .22, 5, 24, Math.PI / 2), marble); rib.position.set(sx, sy + 21, sz); rib.rotation.set(0, i / 16 * 6.28, Math.PI / 2); rib.scale.set(1.15, 1, 1); ctx.add(rib); }
  ctx.cyl(3, 4, sx, sy + 38.5, sz, marble, { seg: 12, solid: false }); ctx.cone(3.4, 3, sx, sy + 42.5, sz, domeM, { seg: 12, rotY: 0 });
  const crys = ctx.glow(sx, sy + 47, sz, '#fff2c0', 4); ctx.cone(.5, 2.6, sx, sy + 45.5, sz, gold, { seg: 6 });
  ctx.update(t => (crys.material.opacity = .7 + Math.sin(t * 1.5) * .3));
  // sept tours fines
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28 + Math.PI / 14, x = sx + Math.cos(a) * 23, z = sz + Math.sin(a) * 23;
    ctx.cyl(2.6, 30, x, sy - 1, z, marble, { seg: 12 }); ctx.cyl(3, 1, x, sy + 13, z, marble, { seg: 12, solid: false }); ctx.cyl(3, 1, x, sy + 24, z, marble, { seg: 12, solid: false });
    for (let k = 0; k < 4; k++) ctx.box(.6, 2.2, .3, x + Math.cos(k * 1.57) * 2.62, sy + 26, z + Math.sin(k * 1.57) * 2.62, dark, { rotY: -k * 1.57 + Math.PI / 2, solid: false });
    ctx.cone(2.9, 9, x, sy + 29, z, domeM, { seg: 12, rotY: 0 }); ctx.cone(.25, 2, x, sy + 38, z, gold, { seg: 5 });
  }
  // portique (vers le sud, la place) et escalier
  const pz = sz + 22;
  for (let k = -3; k <= 3; k++) ctx.cyl(.8, 11, sx + k * 3.2, sy, pz + 3, marble, { seg: 10 });
  ctx.box(23, 1.6, 6, sx, sy + 11, pz + 2, marble, { solid: false });
  ctx.roof(24, 3.4, 6.6, sx, sy + 12.6, pz + 2, marble);
  for (let k = 0; k < 6; k++) ctx.box(26 - k * .4, .3 * (k + 1), 1, sx, sy - 1.7, pz + 10 - k, marble, { cast: false });
  for (const s of [-1, 1]) P.banner(sx + s * 6, sy + 9, pz + 5.6, 'baratheon', 0, 1.5);
  ctx.poi(sx, pz + 13, 'Le Grand Septuaire de Baelor', 'Sept tours, sept voix, un seul dôme de marbre. Les cloches y sonnent pour les mariages et pour les morts ; les habitants reconnaissent les deux sans regarder.', { color: '#fff2c0' });
  ctx.collider(sx - 12, sy, pz - 1, sx + 12, sy + 12, pz + 1);
}
