// Port-Réal, les lieux de la série et des livres : les sept portes, le Donjon Rouge (Donjon de Maegor et ses douves
// à piques, tour de la Blanche Épée, donjon des cuisines, bois sacré, escalier serpentin, promenade des Traîtres),
// les rues (Voie du Roi, Voie des Dieux, le Hook, rue de la Soie, rue de la Farine, rue des Sœurs, Ruelle de l'Ombre,
// Coude-Pisse, Chemin Boueux), les places (Poissonniers, Savetiers), la Guilde des Alchimistes, la boutique de
// Tobho Mott, la maison de Chataya, les trois collines ; dans la baie de la Néra : la grande chaîne, Peyredragon
// et Lamarck à l'horizon, barques de pêche ; au nord, le Bois-du-Roi.
import { height } from './klTerrain.js';

export function kingslandingLore(ctx, [kx, kz, ky]) {
  const { THREE, mat, props: P, rand } = ctx;
  const red = mat('castle_brick_02_red', { uv: 4, color: '#c46a52' }), white = mat('marble_01', { uv: 4, color: '#f0ece4' }), iron = mat(null, { color: '#2e2e32', metal: .8, rough: .45 });
  const plaster = mat('rough_plaster_03', { uv: 3, color: '#ecd8b8' }), Y = (x, z) => height(x, z);
  // --- les sept portes ---
  for (let z = -168; z < 56; z += 22) { if (Math.abs(z + 11 + 120) < 12 || Math.abs(z + 11 + 60) < 12) continue; const y = Math.min(Y(168, z), Y(168, z + 22)) - 3; ctx.wall(168, z, 168, Math.min(56, z + 22), { h: Y(168, z + 11) - y + 9, t: 3, y, mat: red, outward: [1, 0] }); }
  const gate = (x, z, vert, name, txt, house) => {
    const y = Y(x, z) - 2; for (const s of [-1, 1]) ctx.tower(x + (vert ? 0 : s * 8), z + (vert ? s * 8 : 0), { w: 7, h: 16, y, mat: red, round: true });
    ctx.box(vert ? 3 : 12, 4, vert ? 12 : 3, x, y + 9, z, red, { solid: false });
    for (let k = -2; k <= 2; k++) ctx.box(vert ? .5 : .15, 4, vert ? .15 : .5, x + (vert ? 0 : k * 1.4), y + 5, z + (vert ? k * 1.4 : 0), iron, { solid: false });
    for (const s of [-1, 1]) P.banner(x + (vert ? 1.8 * Math.sign(x) : s * 8), y + 14, z + (vert ? s * 8 : 3.6), house, vert ? Math.sign(x) * Math.PI / 2 : 0, 1.3);
    ctx.poi(x - (vert ? 8 * Math.sign(x) : 0), z + (vert ? 0 : 8), name, txt);
  };
  gate(168, -120, true, 'La porte du Dragon', 'La porte de l’est, au pied de la colline de Rhaenys. Les Targaryen y faisaient passer leurs dragons pour qu’ils chassent dans les plaines.', 'targaryen');
  gate(168, -60, true, 'La porte du Lion', 'Elle ouvre vers l’est et la route de la côte. Les Lannister y ont fait sculpter un lion ; les Baratheon ne l’ont jamais fait gratter.', 'lannister');
  gate(-165, -90, true, 'La porte du Roi', 'Par ici entrent les cortèges royaux revenant du Bois-du-Roi, les chiens en tête et les lords en retard.', 'baratheon');
  ctx.poi(-12, 64, 'La porte de la Gadoue', 'La porte de la Rivière, que tout le monde appelle porte de la Gadoue. Les quais, les poissonnières, les marins ivres : ici arrive tout ce qui vient par la mer.', { color: '#9fc4d6' });
  ctx.poi(-150, -10, 'La caserne des manteaux d’or', 'Près de la porte de Fer, le Guet de la ville a sa caserne. Deux mille hommes en manteau doré — dont la moitié sait se battre.');
  // --- le Donjon Rouge ---
  const mx = kx + 22, mz = kz - 8, my = Y(mx, mz) - 4;
  ctx.box(11, 26, 11, mx, my, mz, red); for (const [dx, dz] of [[-5, -5], [5, -5], [5, 5], [-5, 5]]) ctx.cyl(1.8, 30, mx + dx, my, mz + dz, red, { seg: 10 });
  for (let k = 0; k < 28; k++) { const a = k / 28 * 6.28; ctx.cone(.25, 1.6, mx + Math.cos(a) * 8.5, my + 3, mz + Math.sin(a) * 8.5, iron, { seg: 4, solid: false }); }
  ctx.box(2.4, .4, 4, mx - 7, my + 4, mz, mat('medieval_wood', { uv: 2, color: '#5a3a22' }), { solid: false });
  ctx.poi(mx - 10, mz + 6, 'Le Donjon de Maegor', 'Un château dans le château, entouré d’une douve sèche hérissée de piques de fer. Le pont-levis ne s’abaisse que pour la famille royale.', { y: my + 4 });
  ctx.cyl(3.4, 30, kx - 24, ky - 6, kz + 18, white, { seg: 16 }); ctx.cone(3.8, 6, kx - 24, ky + 24, kz + 18, mat(null, { color: '#d8d0c0' }), { seg: 16, rotY: 0 });
  ctx.poi(kx - 18, kz + 24, 'La tour de la Blanche Épée', 'Quatre étages pour la Garde Royale, et au rez-de-chaussée le Livre Blanc, où chaque chevalier de l’ordre a son histoire — jusqu’à la dernière ligne.', { y: ky });
  ctx.box(9, 14, 9, kx - 22, ky - 4, kz - 6, red); ctx.emitter('smoke', kx - 22, ky + 12, kz - 6, { count: 24, opacity: .2, box: [3, 14, 3] });
  ctx.poi(kx - 22, kz + 1, 'Le donjon des cuisines', 'Fours, broches et marmites : on y nourrit mille bouches par jour. Les servantes en savent plus sur la Cour que le Grand Mestre.', { y: ky });
  const gw = []; for (let k = 0; k < 14; k++) gw.push([kx + 4 + rand() * 14, kz + 16 + rand() * 8, .7 + rand() * .3]); ctx.trees(gw, 'round', { leaf: '#3a5a2a' });
  ctx.poi(kx + 10, kz + 26, 'Le bois sacré du Donjon Rouge', 'Un chêne immense en guise d’arbre-cœur, des ormes, de la mousse. Les Stark de passage y prient ; les Lannister, jamais.', { y: ky });
  ctx.poi(kx + 30, kz - 22, 'L’escalier serpentin', 'Un escalier en colimaçon qui relie la cour aux appartements. On y croise tout le monde, et on n’y dit rien.', { y: ky });
  ctx.poi(kx - 30, kz - 24, 'La promenade des Traîtres', 'Le chemin de ronde où l’on exposait les têtes des traîtres sur des piques. Les corbeaux du Donjon Rouge sont les mieux nourris du royaume.', { y: ky + 14 });
  // --- les collines ---
  ctx.poi(95, 40, 'La colline d’Aegon', 'La plus haute des trois collines. Aegon le Conquérant y planta son étendard en débarquant ; son fils y bâtit le Donjon Rouge.', { color: '#ff9a7a' });
  ctx.poi(-70, -96, 'La colline de Visenya', 'La colline de la sœur aînée du Conquérant. Le Grand Septuaire de Baelor y domine la ville.');
  ctx.poi(95, -88, 'La colline de Rhaenys', 'La colline de la sœur cadette. Sous le dôme effondré de la Fosse aux Dragons, les derniers dragons ont dépéri, enchaînés.');
  // --- rues et places ---
  for (const [x, z, n, t] of [
    [60, 30, 'La Voie du Roi', 'L’avenue droite qui monte du centre de la ville jusqu’aux portes du Donjon Rouge.'],
    [45, -132, 'La Voie des Dieux', 'Elle relie le Grand Septuaire à la porte des Dieux. Les processions des Sept l’empruntent à chaque fête.'],
    [40, 48, 'Le Hook', 'La longue rue courbe qui grimpe de la porte de la Rivière jusqu’à la colline d’Aegon. Tout le commerce de la ville y passe, ou presque.'],
    [-104, 8, 'La rue de la Farine', 'Des boulangeries, des fours à pain et des tourtes de pigeon. Les gamins y volent des miches chaudes et brûlent leurs doigts.'],
    [-58, -84, 'La rue des Sœurs', 'Elle descend du Grand Septuaire vers la ville. Les septas y marchent en file, les yeux baissés.'],
    [-8, -62, 'La Ruelle de l’Ombre', 'Une ruelle si étroite que le soleil n’y descend jamais. On y vend des philtres, des poisons et des secrets.'],
    [-36, -20, 'Le Coude-Pisse', 'Le nom dit tout. Au cœur de Culpucier, les rigoles charrient ce que la ville ne veut plus voir.'],
    [-66, 48, 'Le Chemin Boueux', 'Il longe les quais. Boue, cordages, poissons écrasés : on y marche vite, la main sur sa bourse.'],
    [20, -42, 'La place des Savetiers', 'Des échoppes de cordonniers et de bourreliers. On y entend les crieurs annoncer les nouvelles du royaume.']
  ]) ctx.poi(x, z, n, t);
  // rue de la Soie : lanternes rouges, maison de Chataya
  const lamp = mat(null, { color: '#ff5a3a', emissive: '#ff3a1a', ei: 2 });
  for (let k = 0; k < 12; k++) ctx.cyl(.25, .5, -96 + k * 3, Y(-96 + k * 3, -26) + 3.2, -26 + (k % 2) * 1.2, lamp, { seg: 6, solid: false });
  ctx.poi(-82, -30, 'La rue de la Soie', 'Lanternes rouges et rideaux de soie. Les maisons de plaisir de Port-Réal y rivalisent de discrétion — et de prix.', { color: '#ff7a6a' });
  ctx.poi(-90, -38, 'La maison de Chataya', 'La plus élégante de la rue de la Soie. Chataya vient des îles d’Été ; elle sait tout, ne dit rien, et fait payer les deux.');
  ctx.poi(-62, 22, 'La boutique de Tobho Mott', 'Le maître armurier de la rue de l’Acier. Il sait retravailler l’acier valyrien — un secret que seuls trois hommes au monde partagent.', { color: '#ff8a4a' });
  // place des Poissonniers
  for (let k = 0; k < 6; k++) { P.stall(-96 + k * 5, 54, 0, ['#3a6a8a', '#6a6a6a', '#8a5a3a'][k % 3]); P.barrel(-94 + k * 5, 57); }
  ctx.poi(-84, 48, 'La place des Poissonniers', 'Harengs, anguilles, crabes de la baie. Les poissonnières crient plus fort que les mouettes, et elles ont toujours le dernier mot.');
  // Guilde des Alchimistes : dôme sombre, lueur verte du feu grégeois
  const gx = -112, gz = -60, gy = Y(gx, gz);
  ctx.box(18, 9, 14, gx, gy, gz, mat('old_stone_wall', { uv: 3, color: '#5a5650' }));
  const dm = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2a3a2a', metalness: .4, roughness: .5 })); dm.position.set(gx, gy + 9, gz); ctx.add(dm);
  const fire = ctx.glow(gx, gy + 3, gz + 7.2, '#5aff6a', 3); ctx.update(t => (fire.material.opacity = .45 + Math.sin(t * 2.3) * .25));
  ctx.poi(gx, gz + 10, 'La Guilde des Alchimistes', 'Les pyromanciens y fabriquent la substance : le feu grégeois, vert comme une mauvaise lune. Une jarre peut brûler une rue ; une cave, une ville.', { color: '#5aff6a' });
  ctx.poi(-12, -12, 'L’échoppe du brouet', 'Dans Culpucier, on vend du « brouet brun » à la louche : du ragoût dont il vaut mieux ne pas connaître la viande.');
  // linge tendu au-dessus des ruelles de Culpucier
  const cloth = ['#d8d0c0', '#a85a4a', '#5a7a9a', '#c8b070'];
  for (let k = 0; k < 10; k++) { const x = -40 + (k % 5) * 8, z = -18 + Math.floor(k / 5) * 10, y = Y(x, z) + 5.5; ctx.box(.04, .04, 7, x, y, z, iron, { solid: false }); for (let j = 0; j < 4; j++) ctx.box(.8, 1, .05, x, y - .5, z - 2.5 + j * 1.6, mat(null, { color: cloth[(k + j) % 4], rough: 1, side: THREE.DoubleSide }), { solid: false, cast: false }); }
  // --- la baie de la Néra ---
  for (const z of [22, 66]) ctx.tower(-200, z, { w: 7, h: 14, y: Y(-200, z) - 1, mat: red, round: true });
  for (let k = 0; k < 40; k++) ctx.box(.5, .5, 1.1, -200, .25 + Math.sin(k / 39 * Math.PI) * -.2, 24 + k * 1.05, iron, { solid: false, rotY: k % 2 ? 0 : Math.PI / 2 });
  ctx.poi(-194, 44, 'La grande chaîne', 'Une chaîne de fer tendue entre deux tours à l’embouchure de la Néra. Relevée d’un coup, elle enferme une flotte entière dans le fleuve — et le feu grégeois fait le reste.', { color: '#9fc4d6' });
  const rock = mat('volcanic_rock_tiles', { uv: 10, color: '#3a3a3c' });
  ctx.cone(70, 110, 420, -8, 620, rock, { seg: 9, solid: false }); ctx.box(40, 24, 30, 420, 70, 610, rock, { solid: false });
  ctx.cone(60, 30, -380, -6, 560, mat('grass_ground', { uv: 8, color: '#5a6a4a' }), { seg: 10, solid: false });
  ctx.poi(60, 76, 'La baie de la Néra', 'Par temps clair, on devine Peyredragon à l’horizon, fumant sur son île, et la Lamarck des Velaryon. Les galères royales mouillent au large ; les barques de pêche, partout.', { color: '#6aa0c8' });
  // barques de pêche avec voiles
  const sail = mat(null, { color: '#d8ccb0', rough: 1, side: THREE.DoubleSide }), hull = mat('medieval_wood', { uv: 2, color: '#5a4630' });
  for (let k = 0; k < 10; k++) { const x = -120 + k * 30 + rand() * 10, z = 90 + rand() * 60, g = new THREE.Group(); g.position.set(x, -.5, z); g.rotation.y = rand() * 6;
    const hb = new THREE.Mesh(new THREE.BoxGeometry(1.8, .8, 5), hull), mast = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 5), hull), sl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3), sail);
    mast.position.y = 2.6; sl.position.set(0, 2.8, .4); sl.rotation.y = Math.PI / 2; g.add(hb, mast, sl); ctx.add(g); ctx.update(t => { g.position.y = -.5 + Math.sin(t * .9 + k) * .15; g.rotation.z = Math.sin(t * .6 + k) * .05; }); }
  // --- le Bois-du-Roi au nord des remparts ---
  const kw = []; for (let k = 0; k < 260; k++) kw.push([-200 + rand() * 400, -185 - rand() * 120, 1 + rand() * .8]); ctx.trees(kw, 'round', { leaf: '#3a4a2a' });
  ctx.poi(0, -180, 'Le Bois-du-Roi', 'La forêt royale, au nord de la ville. Le roi y chasse le cerf et le sanglier ; les hors-la-loi, le voyageur.', { color: '#8fb070' });
}
