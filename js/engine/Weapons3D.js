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
    case 'bow': {
      add(g, new THREE.TorusGeometry(.55, .015, 4, 16, Math.PI * .9), wood, 0, 0, 0, 0, Math.PI / 2 + Math.PI * .05).rotation.y = Math.PI / 2;
      add(g, new THREE.CylinderGeometry(.003, .003, 1.05, 3), mat('#ddd2b8'), -.18, 0);
      break;
    }
    case 'crossbow': {
      add(g, new THREE.BoxGeometry(.05, .6, .06), wood, 0, -.2);
      add(g, new THREE.BoxGeometry(.6, .03, .03), steel, 0, -.45);
      break;
    }
    default: break;
  }
  return g;
}

/** Flèche pour les projectiles. */
export function arrowMesh() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(.008, .008, .75, 4), mat('#8a6a44'), 0, 0, 0, Math.PI / 2);
  add(g, new THREE.ConeGeometry(.02, .07, 4), mat('#9aa0a6', .8), 0, 0, .4, Math.PI / 2);
  return g;
}
