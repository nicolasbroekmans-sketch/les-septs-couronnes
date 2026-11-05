// Winterfell, l'intérieur de l'enceinte d'après le plan : jardins de verre (NO), bois sacré et sources chaudes (O),
// tour brisée et cryptes (N), Premier Donjon (NE), salle des gardes, armurerie, maison des hôtes, Grand Donjon
// (centre-est), tour de la bibliothèque, chenil, cuisines, tour du mestre, tour de la cloche, écuries, forge (S),
// septuaire (E), Grand Hall (SE), cour d'honneur au centre.
import { room } from '../places/rooms.js';
import { weirwood } from './weirwood.js';

export function winterfellCastle(ctx) {
  const { THREE, mat, props: P, rand } = ctx;
  const stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 4, color: '#a8acb0' }), dark = mat('old_stone_wall', { normal: 'old_stone_wall_nor', uv: 4, color: '#8a8e92' });
  const slate = mat('grey_roof_01', { uv: 3, color: '#8a929a' }), timber = mat('medieval_wood', { uv: 2, color: '#7a6450' }), win = mat(null, { color: '#1a1612', emissive: '#ff9a3a', ei: .45 });
  const mud = mat('dirt', { uv: 5, color: '#9a8e80', rough: 1 }), cob = mat('mossy_cobblestone', { normal: 'mossy_cobblestone_nor', uv: 4, color: '#a8a8a6' });
  // sols : cour pavée, boue piétinée, chemins
  ctx.box(98, .05, 86, 0, .01, -16, mud, { solid: false, cast: false });
  ctx.box(46, .06, 38, 8, .02, -8, cob, { solid: false, cast: false });
  P.puddles(-14, -26, 30, 12, 18);
  /** Bâtiment de pierre : corps, toit d'ardoise (faîtage dans la longueur), fenêtres éclairées, porte. */
  const B = (x, z, w, d, h, o = {}) => {
    ctx.box(w, h, d, x, 0, z, o.mat ?? stone);
    if (o.roof !== false) ctx.roof(w + .6, o.rh ?? Math.min(w, d) * .55, d + .6, x, h, z, slate, { rotY: w > d ? Math.PI / 2 : 0 });
    const along = w > d, n = Math.floor((along ? w : d) / 3.2);
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) for (let f = 0; f < Math.floor(h / 4); f++) {
      const u = (i - (n - 1) / 2) * 3.2, y = 1.6 + f * 3.6;
      ctx.box(along ? .9 : .2, 1.4, along ? .2 : .9, x + (along ? u : s * (w / 2 + .05)), y, z + (along ? s * (d / 2 + .05) : u), win, { solid: false });
    }
    if (o.door) ctx.box(o.door[2] ? .3 : 1.8, 2.6, o.door[2] ? 1.8 : .3, o.door[0], 0, o.door[1], mat('medieval_wood', { uv: 2, color: '#3a2a1c' }), { solid: false });
    if (o.name) ctx.poi(o.poi?.[0] ?? x, o.poi?.[1] ?? z + d / 2 + 2, o.name, o.text ?? '');
  };
  // --- Nord-ouest : jardins de verre ---
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe8e0', transparent: true, opacity: .32, roughness: .05, side: THREE.DoubleSide });
  const gh = new THREE.Mesh(new THREE.BoxGeometry(16, 3.6, 9), glass); gh.position.set(-36, 1.8, -52); ctx.add(gh);
  const ghr = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 16, 14, 1, true, 0, Math.PI), glass); ghr.rotation.set(0, 0, Math.PI / 2); ghr.position.set(-36, 3.6, -52); ctx.add(ghr);
  ctx.collider(-44, 0, -56.5, -28, 4, -47.5);
  const plants = []; for (let i = 0; i < 24; i++) plants.push([-42 + (i % 6) * 2.4, -55 + Math.floor(i / 6) * 2, .35]); ctx.trees(plants, 'round', { leaf: '#5a9a3a' });
  ctx.poi(-36, -45, 'Les jardins de verre', 'Des serres chauffées par les sources. On y fait pousser des fleurs bleues en plein hiver — et des légumes, plus prosaïquement.', { color: '#8fd08a' });
  // --- Ouest : bois sacré, barral, source chaude ---
  const godswood = []; for (let i = 0; i < 90; i++) { const x = -48 + rand() * 30, z = -44 + rand() * 46; if (Math.hypot(x + 32, z + 22) > 6 && Math.hypot(x + 26, z + 8) > 5.5 && x < -20) godswood.push([x, z, .8 + rand() * .7]); }
  ctx.trees(godswood, 'pine', { leaf: '#2a3c30' });
  weirwood(ctx, -32, -22);
  ctx.poi(-32, -16, 'Le barral', 'Un arbre blanc aux feuilles couleur de sang. Le visage gravé dans son écorce pleure une sève rouge. On ne ment pas devant lui — pas longtemps.', { color: '#ff6a5a' });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshStandardMaterial({ color: '#3b6f6a', roughness: .08, metalness: .2, transparent: true, opacity: .9 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(-26, .06, -8); ctx.add(pool);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; ctx.box(1, .5, 1, -26 + Math.cos(a) * 4.4, 0, -8 + Math.sin(a) * 4.4, dark, { solid: false }); }
  ctx.emitter('steam', -26, 0, -8, { box: [7, 8, 7], count: 90 });
  ctx.poi(-21, -8, 'Les sources chaudes', 'L’eau monte des profondeurs, tiède même au cœur de l’hiver. Les murs du château en sont chauffés, comme un animal qui garde sa chaleur.', { color: '#9fc4d6' });
  // --- Nord : tour brisée, cryptes, salle des gardes ---
  ctx.tower(14, -63, { w: 9, h: 24, mat: dark, round: true });
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; ctx.box(1.6, 1 + rand() * 4.5, 1, 14 + Math.cos(a) * 4, 24, -63 + Math.sin(a) * 4, dark, { rotY: -a, solid: false }); }
  for (let i = 0; i < 10; i++) ctx.box(.6 + rand(), .5 + rand() * .6, .6 + rand(), 10 + rand() * 8, 0, -56 + rand() * 4, dark, { rotY: rand() * 3, solid: false });
  ctx.poi(14, -53, 'La Tour brisée', 'La foudre l’a frappée il y a cent ans ; le feu a dévoré l’étage du haut. Personne ne l’a jamais réparée. Les corbeaux, eux, l’adorent.');
  B(-4, -48, 7, 5, 4, { mat: dark, door: [-4, -45.4] });
  ctx.torch(-6.2, 2.6, -45.3, { light: true, color: '#8ab0ff' });
  room(ctx, 'crypt', { x: -4, z: -43.8, yaw: Math.PI }, { label: 'Descendre dans les cryptes', wall: 'castle_wall_slates', wallColor: '#5a5e64', floorColor: '#6a6a6a', title: 'Les cryptes de Winterfell', text: 'Rangée après rangée, les Rois de l’Hiver vous regardent passer, une épée de fer sur les genoux, un loup de pierre à leurs pieds.' });
  ctx.poi(-4, -41, 'Les cryptes', 'Sous le château, les Rois de l’Hiver dorment sur leurs trônes de pierre, une épée de fer sur les genoux, pour que leurs esprits restent en place.', { color: '#8ab0ff' });
  B(14, -40, 14, 6, 5, { name: 'La salle des gardes', text: 'Des paillasses, des dés, un feu et l’odeur du cuir mouillé. La relève a lieu à chaque cloche.' });
  // --- Nord-est : Premier Donjon (tour ronde trapue, gargouilles) ---
  ctx.tower(34, -46, { w: 13, h: 15, mat: dark, round: true });
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ctx.cone(.45, 1.3, 34 + Math.cos(a) * 6.8, 13.6, -46 + Math.sin(a) * 6.8, mat(null, { color: '#3a3a3e', flat: true }), { seg: 4 }); }
  ctx.poi(34, -38, 'Le Premier Donjon', 'La plus vieille pierre de Winterfell. Plus personne n’y vit ; les gargouilles, elles, n’ont jamais quitté leur poste.');
  // --- Centre : armurerie, maison des hôtes, Grand Donjon, tour de la bibliothèque ---
  B(2, -30, 9, 8, 7, { name: 'L’armurerie', text: 'Râteliers de lances, piles de boucliers au loup, et un maître d’armes qui compte chaque flèche.' });
  P.target(-3, -24, 0); P.target(1, -24, 0);
  B(-10, -20, 12, 7, 6, { mat: timber, name: 'La maison des hôtes', text: 'Les visiteurs de marque y dorment. Les murs sont épais, mais pas assez pour garder un secret.' });
  ctx.tower(26, -24, { w: 18, h: 18, mat: stone, round: true, roof: slate, roofH: 8 });
  ctx.tower(26, -24, { w: 9, h: 31, mat: stone, round: true, roof: slate, roofH: 7 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; for (const y of [5, 10, 15]) ctx.box(.9, 1.6, .25, 26 + Math.cos(a) * 9.05, y, -24 + Math.sin(a) * 9.05, win, { rotY: -a + Math.PI / 2, solid: false }); }
  for (const [x, z] of [[17, -24], [26, -15]]) P.banner(x, 14, z, 'stark', x < 26 ? -Math.PI / 2 : 0, 1.6);
  ctx.poi(18, -14, 'Le Grand Donjon', 'Le cœur de Winterfell : chambres des Stark, salle du lord, et les murs chauffés par l’eau des sources. On dit qu’il n’a jamais froid, même quand tout le Nord gèle.');
  ctx.tower(-12, -6, { w: 6, h: 17, mat: stone, round: true, roof: slate, roofH: 6 });
  ctx.poi(-12, -1, 'La tour de la bibliothèque', 'Des rayonnages jusqu’au toit, des cartes du Nord et des chroniques que personne n’a lues depuis cent ans. Le mestre y monte chaque soir.');
  // --- Sud-ouest : chenil, cuisines, tour du mestre, tour de la cloche, écuries ---
  B(-38, 6, 10, 3.6, 2.6, { mat: timber, name: 'Le chenil', text: 'Les chiens de Winterfell aboient pour tout : la neige, les corbeaux, les inconnus. Surtout les inconnus.' });
  B(-28, 18, 9, 8, 5, { door: [-28, 14] }); ctx.box(1.2, 4, 1.2, -25, 5, 18, dark); ctx.emitter('smoke', -25, 9, 18, { count: 30, opacity: .2, box: [2, 14, 2] });
  ctx.poi(-28, 12, 'Les cuisines', 'Du pain qui cuit à l’aube, des marmites de ragoût, et Gage le cuisinier qui chasse les enfants à coups de louche.');
  ctx.tower(-44, 18, { w: 6, h: 18, mat: stone, roof: slate });
  ctx.poi(-40, 22, 'La tourelle du mestre', 'Au sommet, la roukerie : les corbeaux portent les nouvelles du Nord entier. Le mestre lit les messages avant le lord. Toujours.');
  ctx.tower(-16, 24, { w: 6, h: 26, mat: stone, roof: slate, roofH: 7 });
  ctx.box(2.4, 2.4, .3, -16, 20, 20.8, mat(null, { color: '#1a1a1c' }), { solid: false }); ctx.glow(-16, 21.2, 20.6, '#ffcf8a', 1.8);
  ctx.poi(-16, 18, 'La tour de la cloche', 'Sa cloche annonce les heures, les mariages et les morts. Le jour où elle sonne sans raison, tout le château lève la tête.');
  ctx.box(14, 4, 6, -32, 0, 24, timber); ctx.roof(15, 2.4, 7, -32, 4, 24, mat('thatch_roof_angled', { uv: 3, color: '#c8b090' }), { rotY: Math.PI / 2 });
  P.fence(-40, 19, -24, 19); P.hay(-26, 20.5); P.hay(-37, 20.5, .8);
  ctx.poi(-32, 18, 'Les écuries', 'Les chevaux du Nord sont petits, laineux et têtus. Ils survivent à tout, comme leurs cavaliers.');
  // --- Sud : forge de Torvald ---
  const fx = -2, fz = 22;
  ctx.box(10, 4.5, .5, fx, 0, fz + 3.5, timber); ctx.box(.5, 4.5, 7, fx - 5, 0, fz, timber); ctx.roof(11, 2.2, 8, fx, 4.5, fz, slate);
  ctx.box(3, 1, 2, fx - 2, 0, fz + 1.8, dark);
  const coals = ctx.box(2.4, .2, 1.4, fx - 2, 1, fz + 1.8, mat(null, { color: '#ff5a10', emissive: '#ff4a00', ei: 3 }), { solid: false });
  ctx.fire(fx - 2, 1.1, fz + 1.8, .6, { intensity: 40 }); ctx.update(t => (coals.material.emissiveIntensity = 2.5 + Math.sin(t * 3) * .8));
  ctx.box(.6, .8, 1.1, fx + 1, 0, fz, mat(null, { color: '#2b2b2e', metal: .8, rough: .4 })); P.woodpile(fx + 4, fz + 1, 0);
  ctx.poi(fx, fz - 5, 'La forge', 'Le forgeron dit que l’acier du Nord se trempe dans la neige fondue. C’est faux, mais personne n’a jamais osé le contredire.');
  // --- Est / sud-est : septuaire, Grand Hall ---
  B(36, 0, 7, 9, 5, { mat: mat('rough_plaster_03', { uv: 3, color: '#ece6da' }) }); ctx.cone(.9, 3, 36, 8, 0, mat(null, { color: '#c9a227', metal: .6, rough: .4 }), { seg: 7 });
  ctx.poi(31, 0, 'Le septuaire', 'Bâti pour une dame du Sud qui ne priait pas les arbres. Sept visages sculptés dans le bois ; dehors, le Nord fait semblant de ne pas les voir.');
  B(28, 18, 24, 10, 10, { rh: 6, door: [28, 12.9] });
  for (let x = 18; x <= 38; x += 5) ctx.box(1.2, 8, 1.6, x, 0, 12.4, stone);
  P.banner(23, 8, 12.6, 'stark', 0, 1.4); P.banner(33, 8, 12.6, 'stark', 0, 1.4);
  ctx.torch(25.8, 3, 12.5); ctx.torch(30.2, 3, 12.5, { light: false });
  room(ctx, 'hall', { x: 28, z: 11.4, yaw: 0 }, { label: 'Entrer dans le Grand Hall', banner: 'stark', wall: 'castle_wall_slates', wallColor: '#8d9298', title: 'Le Grand Hall', text: 'Des tables de bois noirci, le feu au fond, les bannières au loup. Ici on mange, on juge et on se souvient.' });
  ctx.poi(28, 9, 'Le Grand Hall', 'Sous ses poutres noircies, on a mangé, juré et pleuré des rois. Les bancs sont usés en creux, à la place exacte où chaque famille s’assoit depuis des siècles.');
  // --- Cour d'honneur : mannequins, charrettes, braseros, étendards ---
  for (let i = 0; i < 4; i++) { ctx.box(.3, 2, .3, 0 + i * 3, 0, -10, timber); ctx.box(1.4, .25, .25, 0 + i * 3, 1.5, -10, timber, { solid: false }); }
  P.standard(4, 4, 'stark'); P.standard(14, -6, 'stark');
  P.cart(-4, 6, .4); P.cart(18, 8, -1.2);
  for (const [x, z] of [[6, 8], [7, 9], [-6, -14], [20, -32], [21, -31]]) P.barrel(x, z);
  for (const [x, z] of [[-6, -12], [-2, 8]]) { ctx.cyl(.5, .9, x, 0, z, dark, { seg: 8 }); ctx.fire(x, .9, z, .4, { intensity: 10 }); }
  ctx.poi(6, -4, 'La cour d’honneur', 'Les cris des écuyers à l’entraînement, le chant de la forge, les chiens : le cœur de Winterfell bat ici.');
}
