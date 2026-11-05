// Modèles 3D procéduraux des armes, accrochés à la main droite (ou gauche pour l'arc).
import * as THREE from 'three';

const M = {};
const mat = (c, metal = 0, rough = .6) => (M[c + metal] ??= new THREE.MeshStandardMaterial({ color: c, metalness: metal, roughness: rough }));
const add = (g, geo, m, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; g.add(o); return o; };

/** Renvoie un Group orienté le long de −Y local (la lame « sort » du poing vers le bas du bras tendu). */
export function weaponMesh(cls, id = '') {
  const g = new THREE.Group(), steel = mat('#c8ccd2', .9, .28), wood = mat('#5a3b22'), leather = mat('#3a2616'), gold = mat('#c9a227', .8, .35);
  const fine = id === 'epee_chateau';
  switch (cls) {
    case 'sword': case 'dagger': {
      const L = cls === 'dagger' ? .32 : fine ? .95 : id === 'epee_courte' ? .7 : .88;
      add(g, new THREE.BoxGeometry(.05, L, .012), fine ? mat('#dfe4ea', 1, .18) : steel, 0, -L / 2 - .12);
      add(g, new THREE.BoxGeometry(.2, .03, .04), fine ? gold : steel, 0, -.11);
      add(g, new THREE.CylinderGeometry(.018, .018, .16, 6), leather, 0, -.02);
      add(g, new THREE.SphereGeometry(.03, 6, 5), fine ? gold : steel, 0, .07);
      break;
    }
    case 'axe': {
      add(g, new THREE.CylinderGeometry(.02, .025, .75, 6), wood, 0, -.3);
      add(g, new THREE.BoxGeometry(.2, .16, .02), steel, .09, -.6);
      break;
    }
    case 'mace': {
      add(g, new THREE.CylinderGeometry(.02, .025, .6, 6), wood, 0, -.25);
      add(g, new THREE.IcosahedronGeometry(.08, 0), steel, 0, -.58);
      break;
    }
    case 'spear': {
      add(g, new THREE.CylinderGeometry(.018, .02, 2.1, 6), wood, 0, -.6);
      add(g, new THREE.ConeGeometry(.04, .25, 4), steel, 0, -1.75, 0, Math.PI);
      break;
    }
    case 'bow': bow(g, id === 'arc_long' ? .78 : .62, wood, leather, steel); break;
    case 'crossbow': {
      add(g, new THREE.BoxGeometry(.05, .6, .06), wood, 0, -.2);
      add(g, new THREE.BoxGeometry(.6, .03, .03), steel, 0, -.45);
      break;
    }
    default: break;
  }
  return g;
}

/** Arc recourbé (repère de la main gauche : +Z = haut quand on vise, −Y = vers la cible, +Y = vers l'archer).
 *  Branches en courbe, poignée gainée de cuir, corde qui se tend (userData.setDraw(0..1)) et flèche encochée. */
function bow(g, H, wood, leather, steel) {
  const pts = [], n = 14;
  for (let i = 0; i <= n; i++) { const t = i / n * 2 - 1, z = t * H, y = .16 * t * t - .06 * Math.pow(Math.abs(t), 6); pts.push(new THREE.Vector3(0, y, z)); }
  const limb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, .016, 6), wood); limb.castShadow = true; g.add(limb);
  add(g, new THREE.CylinderGeometry(.024, .024, .14, 8), leather, 0, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(.014, 6, 4), mat('#d8c8a8'), 0, .1, s * H);
  const tipY = .1, sg = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, tipY, -H, 0, tipY, 0, 0, tipY, H], 3));
  const string = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: '#ece4d0' })); g.add(string);
  const nocked = arrowMesh(); nocked.rotation.set(Math.PI / 2, 0, 0); nocked.visible = false; g.add(nocked);
  g.userData.setDraw = k => {
    const p = sg.attributes.position; p.setY(1, tipY + k * .5); p.needsUpdate = true;
    nocked.visible = k > .02; nocked.position.set(0, tipY + k * .5 - .38, .01);
  };
}

/** Flèche : fût, pointe d'acier, trois plumes, encoche. Orientée le long de +Z (pointe en +Z). */
export function arrowMesh() {
  const g = new THREE.Group(), feather = mat('#e8e0d0'), red = mat('#8b1a10');
  add(g, new THREE.CylinderGeometry(.007, .007, .78, 5), mat('#9a7a50'), 0, 0, 0, Math.PI / 2);
  add(g, new THREE.ConeGeometry(.018, .08, 4), mat('#b8bec6', .85, .3), 0, 0, .43, Math.PI / 2);
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.035, .13), i ? feather : red); f.material.side = THREE.DoubleSide; f.position.set(Math.cos(i * 2.09) * .018, Math.sin(i * 2.09) * .018, -.32); f.rotation.set(Math.PI / 2, 0, i * 2.09); g.add(f); }
  add(g, new THREE.CylinderGeometry(.009, .009, .02, 5), mat('#2a1d14'), 0, 0, -.39, Math.PI / 2);
  return g;
}
