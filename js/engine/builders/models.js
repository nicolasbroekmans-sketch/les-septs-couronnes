// Modèles réalistes (Poly Haven, CC0, allégés pour le web) placés par milliers via InstancedMesh.
// ctx.placeModel(nom, x, z, { s, rot, y }) enregistre une position ; ctx.flushModels() charge chaque modèle une fois et
// crée, pour chaque variante (enfant racine du fichier) et chaque sous-maillage, un InstancedMesh. Posé au sol,
// recentré, collision simple. Si un modèle manque, rien ne casse (le décor procédural reste).
import * as THREE from 'three';
import { triplanar } from './triplanar.js';

const DIR = 'assets/models/ph/', BK = 'assets/models/bk/';
/** Maisons BlenderKit (gratuites) : empreinte au sol (m) pour adapter l'échelle à la parcelle. */
export const HOUSE_MODELS = { '0ce7e508': [6.5, 7.6], d1a54956: [9.9, 10.9], fc4211f5: [8.5, 8.7], '7337edd5': [7.5, 7.4], b6d9cd97: [12, 12], '79fa3182': [7.2, 11.1] };
const SOLID = { barrel_03: .4, wine_barrel_01: .5, wooden_crate_01: .45, treasure_chest: .5, WoodenTable_01: .6 }; // le sous-bois ne bloque jamais le passage

export function modelBuilders(E, ctx) {
  const queue = new Map();
  return {
    placeModel(name, x, z, o = {}) { if (!queue.has(name)) queue.set(name, []); queue.get(name).push({ x, z, y: o.y, s: o.s ?? 1, rot: o.rot ?? ctx.rand() * 6.28, sy: o.sy }); },
    async flushModels() {
      const jobs = [...queue.entries()]; queue.clear();
      await Promise.all(jobs.map(async ([name, list]) => {
        let gltf; try { gltf = await E.gltfLoader.loadAsync((HOUSE_MODELS[name] ? BK : DIR) + name + '.glb'); } catch { return; }
        const root = gltf.scene; root.updateMatrixWorld(true);
        let variants = !HOUSE_MODELS[name] && root.children.length > 1 && root.children.every(c => c.children.length || c.isMesh) ? root.children : [root];
        variants = variants.map(v => {
          const box = new THREE.Box3().setFromObject(v), c = box.getCenter(new THREE.Vector3()), fix = new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z), parts = [];
          v.traverse(o => { if (o.isMesh) parts.push({ geo: o.geometry, mat: HOUSE_MODELS[name] ? reskin(ctx, o.material) : tune(o.material), m: fix.clone().multiply(o.matrixWorld) }); });
          return { parts, r: Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2, h: box.max.y - box.min.y };
        });
        const byV = variants.map(() => []);
        list.forEach((p, i) => byV[i % variants.length].push(p));
        const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
        variants.forEach((v, vi) => {
          const pl = byV[vi]; if (!pl.length) return;
          for (const part of v.parts) {
            const im = new THREE.InstancedMesh(part.geo, part.mat, pl.length);
            pl.forEach((p, i) => { const y = p.y ?? E.physics.groundFn(p.x, p.z) - .05; Q.setFromAxisAngle(up, p.rot); im.setMatrixAt(i, M.compose(P.set(p.x, y, p.z), Q, S.set(p.s, p.s * (p.sy ?? 1), p.s)).multiply(part.m)); });
            im.castShadow = E.quality !== 'low' && (E.quality === 'high' || !!SOLID[name]); im.receiveShadow = true; im.frustumCulled = false; E.scene.add(im);
          }
          const k = SOLID[name] ?? (HOUSE_MODELS[name] ? .85 : 0); if (k) for (const p of pl) { const y = p.y ?? E.physics.groundFn(p.x, p.z), r = v.r * k * p.s; ctx.collider(p.x - r, y, p.z - r, p.x + r, y + v.h * p.s * (name.includes('tree') || name.startsWith('fir') ? 1 : .9), p.z + r, { noMap: !!name.match(/fir|tree/) }); }
        });
      }));
    }
  };
}
/** Feuillages : découpe alpha au lieu du mélange (pas de tri, pas de scintillement), deux faces. */
function tune(m) {
  if (m.transparent || m.alphaMode === 'BLEND' || m.map?.format === THREE.RGBAFormat && m.name.match(/twig|leaf|leaves|fern|nettle/i)) { m.transparent = false; m.alphaTest = .5; m.depthWrite = true; m.side = THREE.DoubleSide; }
  m.envMapIntensity = .8; return m;
}

/** Toits et soubassements des maisons importées : textures de toit / pierre projetées, sans dépendre des UV. */
const RESKIN = new Map();
function reskin(ctx, m) {
  const n = (m.name || '').toLowerCase(), key = /roof|cube|shingle/.test(n) ? 'roof' : /stone/.test(n) ? 'stone' : /thatch|straw/.test(n) ? 'thatch' : null;
  if (!key) { m.metalness = 0; return m; }
  if (!RESKIN.has(key)) RESKIN.set(key, key === 'roof' ? triplanar(ctx.tex('grey_roof_01'), '#a89080', .45) : key === 'stone' ? triplanar(ctx.tex('old_stone_wall'), '#c8c4bc', .45) : triplanar(ctx.tex('thatch_roof_angled'), '#e0c8a0', .35));
  return RESKIN.get(key);
}
