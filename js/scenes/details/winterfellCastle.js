import { room } from '../places/rooms.js';
// Winterfell, détails du château inspirés de la série : douves gelées, pont-levis, tour de la cloche,
// Premier Donjon, jardins de verre, cryptes, passerelle couverte, écuries, archerie, bannières au loup.
export function winterfellCastle(ctx) {
  const { THREE, mat, props: P } = ctx;
  const stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#c8ccd0' }), dark = mat('castle_wall_slates', { uv: 4, color: '#7d8288' });
  const wood = mat('weathered_planks', { uv: 3, color: '#b09a80' }), roof = mat('grey_roof_tiles', { uv: 3, color: '#d7dde2' });
  // Douves gelées entre les deux enceintes + pont-levis au sud
  const ice = new THREE.MeshStandardMaterial({ color: '#b9d4e0', roughness: .15, metalness: .1 });
  for (const [x, z, w, d] of [[0, -76.6, 100, 6], [0, 16.6, 100, 5], [-46.6, -30, 6, 90], [46.6, -30, 6, 90]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ice); m.rotation.x = -Math.PI / 2; m.position.set(x, .04, z); m.receiveShadow = true; ctx.add(m);
    ctx.mapMark(x - w / 2, z - d / 2, x + w / 2, z + d / 2, '#a9c7d6');
  }
  ctx.box(7, .35, 7, 0, 0, 16.6, wood, { solid: false });
  for (const s of [-1, 1]) { ctx.box(.25, 1, 7, s * 3.4, .35, 16.6, wood); ctx.cyl(.08, 9, s * 3.4, 0, 13.5, mat(null, { color: '#2e2e32', metal: .7 }), { seg: 5, solid: false }); }
  ctx.poi(0, 13, 'Les douves', 'Entre les deux enceintes court un fossé d’eau, gelé neuf mois sur dix. L’été, dit-on, les sources chaudes l’empêchent de prendre — mais l’été est une légende, au Nord.', { color: '#9fc4d6' });
  // Tour de la cloche
  ctx.tower(30, -61, { w: 6, h: 32, mat: stone, roof: mat('grey_roof_tiles', { uv: 2, color: '#8a9298' }), roofH: 9 });
  ctx.box(2.4, 2.4, .3, 30, 24, -57.9, mat(null, { color: '#1a1a1c' }), { solid: false });
  ctx.glow(30, 25.2, -57.7, '#ffcf8a', 1.8);
  // Premier Donjon : tour ronde trapue, gargouilles
  ctx.tower(9, -63, { w: 8, h: 16, mat: dark, round: true });
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; ctx.cone(.4, 1.2, 9 + Math.cos(a) * 4.3, 14.2, -63 + Math.sin(a) * 4.3, mat(null, { color: '#3a3a3e', flat: true }), { seg: 4 }); }
  ctx.poi(9, -57.5, 'Le Premier Donjon', 'La plus vieille pierre de Winterfell. Plus personne n’y vit ; les gargouilles, elles, n’ont jamais quitté leur poste.');
  // Jardins de verre
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe8e0', transparent: true, opacity: .35, roughness: .05, metalness: 0, side: THREE.DoubleSide });
  const gh = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 13), glass); gh.position.set(31, 1.75, -44); ctx.add(gh);
  const ghr = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 13, 12, 1, true, 0, Math.PI), glass); ghr.rotation.set(0, 0, Math.PI / 2); ghr.rotation.y = Math.PI / 2; ghr.position.set(31, 3.5, -44); ctx.add(ghr);
  ctx.collider(27, 0, -50.5, 35, 4, -37.5);
  const plants = []; for (let i = 0; i < 18; i++) plants.push([28.5 + (i % 3) * 2.5, -49 + Math.floor(i / 3) * 2, .35]);
  ctx.trees(plants, 'round', { leaf: '#5a9a3a' });
  ctx.poi(31, -35, 'Les jardins de verre', 'Des serres chauffées par les sources. On y fait pousser des fleurs bleues en plein hiver — et des légumes, plus prosaïquement.', { color: '#8fd08a' });
  // Entrée des cryptes
  ctx.box(5, 4, 3, -2, 0, -38, dark); ctx.box(2.4, 2.8, .2, -2, 0, -36.45, mat(null, { color: '#060606' }), { solid: false });
  ctx.roof(5.4, 1.6, 3.4, -2, 4, -38, roof, { rotY: Math.PI / 2 });
  ctx.torch(-3.6, 2.6, -36.3, { light: true, color: '#8ab0ff' });
  room(ctx, 'crypt', { x: -2, z: -35.2, yaw: Math.PI }, { label: 'Descendre dans les cryptes', wall: 'castle_wall_slates', wallColor: '#5a5e64', floorColor: '#6a6a6a', title: 'Les cryptes de Winterfell', text: 'Rangée après rangée, les Rois de l’Hiver vous regardent passer, une épée de fer sur les genoux, un loup de pierre à leurs pieds. Il fait froid, et le silence pèse plus lourd que la pierre.' });
  ctx.poi(-2, -33.5, 'Les cryptes', 'Sous le château, les Rois de l’Hiver dorment sur leurs trônes de pierre, une épée de fer sur les genoux, pour que leurs esprits restent en place.', { color: '#8ab0ff' });
  // Passerelle couverte entre le Grand Donjon et le Grand Hall
  ctx.box(7.4, .5, 2.6, 7.6, 10, -45, wood, { solid: false }); ctx.box(7.4, 2.4, .2, 7.6, 10.5, -46.2, wood, { solid: false }); ctx.box(7.4, 2.4, .2, 7.6, 10.5, -43.8, wood, { solid: false });
  ctx.roof(3, 1.2, 7.6, 7.6, 12.9, -45, roof, { rotY: Math.PI / 2 });
  // Écuries et enclos (cour est)
  ctx.box(9, 4, 12, 31, 0, -21, wood); ctx.roof(10, 2.6, 13, 31, 4, -21, roof);
  P.fence(26, -14, 36, -14); P.hay(27, -11); P.hay(29, -11.5, .8);
  // Aire d'archerie et cour d'entraînement
  for (let i = 0; i < 3; i++) P.target(-8 + i * 4, -34, 0);
  P.woodpile(-14, -24, .3); P.woodpile(14, -12, 0);
  // Bannières : Grand Donjon, Grand Hall, portes
  for (const x of [-16, -8, 0]) P.banner(x, 16, -42.8, 'stark', 0, 1.6);
  for (const x of [13, 23]) P.banner(x, 9.5, -24.6, 'stark', 0, 1.2);
  for (const s of [-1, 1]) { P.banner(s * 6.5, 15, 29.5, 'stark', 0, 1.4); P.banner(s * 6, 18, 11.5, 'stark', 0, 1.4); }
  P.standard(-6, -14, 'stark'); P.standard(6, -14, 'stark');
  // Charrettes, tonneaux, caisses dans la cour
  P.cart(-12, -14, .4); P.cart(12, 2, -1.2);
  for (const [x, z] of [[19, 2], [20, 3], [-10, 4], [-11, 3], [14, -18], [24, -10]]) P.barrel(x, z);
  for (const [x, z, r] of [[18, 4, .3], [-12, 5, .1], [15, -17, .6], [22, -12, 0]]) P.crate(x, z, 1, r);
}
