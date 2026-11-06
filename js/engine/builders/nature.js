// Végétation instanciée : pins, cyprès, palmiers, feuillus.
import * as THREE from 'three';
import { firGeometry, trunkGeometry } from './firTree.js';

export function natureBuilders(E, ctx) {
  return {
    trees(list, type = 'pine', o = {}) {
      const n = list.length; if (!n) return;
      if ((type === 'pine' || type === 'round') && !o.procedural) { // arbres réalistes + sous-bois (fougères, souches, rochers moussus, troncs morts)
        const snowy = o.leaf && new THREE.Color(o.leaf).getHSL({}).l < .14;
        list.forEach(([x, z, s = 1], i) => {

          const r = ctx.rand(), dx = (ctx.rand() - .5) * 5, dz = (ctx.rand() - .5) * 5;
          if (o.under === false || E.quality === 'low' || i % (E.quality === 'high' ? 2 : 3)) return;
          if (r < .3 && !snowy) ctx.placeModel('fern_02', x + dx, z + dz, { s: 1 + ctx.rand() });
          else if (r < .42) ctx.placeModel('tree_stump_01', x + dx, z + dz, { s: .8 + ctx.rand() * .5 });
          else if (r < .58) ctx.placeModel('rock_moss_set_01', x + dx, z + dz, { s: .7 + ctx.rand() * .8 });
          else if (r < .66) ctx.placeModel('dead_tree_trunk', x + dx, z + dz, { s: .6 + ctx.rand() * .4 });
          else if (r < .74) ctx.placeModel('namaqualand_boulder_02', x + dx, z + dz, { s: .4 + ctx.rand() * .6 });
          else if (r < .86 && !snowy) ctx.placeModel('nettle_plant', x + dx, z + dz, { s: .8 + ctx.rand() * .6 });
        });
        if (type === 'pine' && E.quality !== 'low') { firs(E, ctx, list, o); return; } // qualité basse : sapins simples (portables, vieux Mac)
        if (type === 'pine') return natureBuilders(E, ctx).trees(list, type, { ...o, procedural: true });
      }
      const trunkM = ctx.mat(null, { color: o.trunk ?? '#4a3726' }), leafM = ctx.mat(null, { color: o.leaf ?? '#2f4a32', flat: true, rough: 1 });
      const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .3, 1, 6).translate(0, .5, 0), trunkM, n);
      const geo = type === 'pine' ? mergeCones() : type === 'cypress' ? new THREE.SphereGeometry(1, 7, 6).scale(.35, 1, .35).translate(0, .5, 0)
        : type === 'palm' ? new THREE.ConeGeometry(1, .3, 9, 1, true).rotateX(Math.PI).translate(0, .9, 0) : new THREE.IcosahedronGeometry(1, 1).translate(0, .6, 0);
      const leaves = new THREE.InstancedMesh(geo, leafM, n);
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), C = new THREE.Color();
      list.forEach(([x, z, s = 1], i) => {
        const y = E.physics.groundFn(x, z), h = (type === 'palm' ? 7 : type === 'cypress' ? 2 : 2.5) * s;
        Q.setFromEuler(new THREE.Euler(type === 'palm' ? (ctx.rand() - .5) * .25 : 0, ctx.rand() * 6, 0));
        trunk.setMatrixAt(i, M.compose(P.set(x, y, z), Q, S.set(s, h, s)));
        const lh = type === 'pine' ? 6 * s : type === 'cypress' ? 7 * s : type === 'palm' ? 2.5 * s : 3.2 * s, lw = type === 'pine' ? 2.2 * s : type === 'palm' ? 3.2 * s : 2 * s;
        leaves.setMatrixAt(i, M.compose(P.set(x, y + (type === 'pine' ? h * .6 : type === 'cypress' ? h * .4 : h * .9), z), Q, S.set(lw, lh, lw)));
        leaves.setColorAt(i, C.set(o.leaf ?? '#2f4a32').offsetHSL(0, 0, (ctx.rand() - .5) * .08));
        ctx.collider(x - .3 * s, y, z - .3 * s, x + .3 * s, y + h, z + .3 * s, { noMap: true });
      });
      trunk.castShadow = leaves.castShadow = true; leaves.receiveShadow = true;
      E.scene.add(trunk, leaves);
    }
  };
}
// Pin à trois étages de branches (plus lisible qu'un simple cône).
function mergeCones() {
  const parts = [[1, .45, 0], [.78, .4, .3], [.55, .35, .58]].map(([r, h, y]) => new THREE.ConeGeometry(r, h, 8).translate(0, y + h / 2, 0));
  const pos = [], idx = []; let off = 0;
  for (const g of parts) { const ng = g.toNonIndexed(); pos.push(...ng.attributes.position.array); for (let i = 0; i < ng.attributes.position.count; i++) idx.push(off + i); off += ng.attributes.position.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
}

/** Forêt de sapins réalistes : deux InstancedMesh (tronc, aiguilles), teinte variable, neige optionnelle. */
function firs(E, ctx, list, o) {
  const n = list.length, bark = ctx.mat('fir_bark', { uv: 1, color: '#8a7a6a' });
  const needles = new THREE.MeshStandardMaterial({ map: ctx.tex('fir_needles'), alphaTest: .42, side: THREE.DoubleSide, roughness: .9, color: '#ffffff' });
  const trunk = new THREE.InstancedMesh(trunkGeometry(), bark, n), crown = new THREE.InstancedMesh(firGeometry(), needles, n);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), C = new THREE.Color(), base = new THREE.Color(o.leaf ?? '#2f4a32').lerp(new THREE.Color('#ffffff'), .55);
  list.forEach(([x, z, s = 1], i) => {
    const y = E.physics.groundFn(x, z) - .1, k = s * (.95 + ctx.rand() * .2);
    Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ctx.rand() * 6.28); M.compose(P.set(x, y, z), Q, S.set(k, k * (.9 + ctx.rand() * .25), k));
    trunk.setMatrixAt(i, M); crown.setMatrixAt(i, M); crown.setColorAt(i, C.copy(base).offsetHSL((ctx.rand() - .5) * .03, 0, (ctx.rand() - .5) * .12));
    ctx.collider(x - .3 * s, y, z - .3 * s, x + .3 * s, y + 8 * s, z + .3 * s, { noMap: true });
  });
  trunk.castShadow = true; crown.castShadow = E.quality === 'high'; for (const m of [trunk, crown]) { m.receiveShadow = true; m.frustumCulled = false; E.scene.add(m); }
}
