// Bibliothèque des personnages réalistes (Quaternius, CC0) : 6 morphologies/tenues riggées sur le même squelette
// (65 os, type mannequin UE) et 38 animations partagées. Chargée une fois ; tant qu'elle ne l'est pas, le jeu
// retombe sur le personnage procédural.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const DIR = 'assets/chars/', IDS = ['m_peasant_a', 'm_peasant_b', 'm_ranger', 'f_peasant_a', 'f_peasant_b', 'f_ranger'];
export const LIB = { ready: false, models: {}, clips: {}, bind: {} };
let pending = null;

export function loadCharacters() {
  if (pending) return pending;
  const L = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/'));
  pending = (async () => {
    const [anims, ...models] = await Promise.all([L.loadAsync(DIR + 'anims.glb'), ...IDS.map(id => L.loadAsync(DIR + id + '.glb'))]);
    for (const c of anims.animations) LIB.clips[c.name] = c;
    IDS.forEach((id, i) => { LIB.models[id] = models[i].scene; LIB.bind[id] = bindFrames(models[i].scene); });
    LIB.ready = true;
  })().catch(e => { console.warn('Personnages réalistes indisponibles :', e.message); pending = Promise.resolve(); });
  return pending;
}

/** Repères des os en pose de liaison (monde), pour accrocher armes, cape et casque sans dépendre des axes des os. */
function bindFrames(scene) {
  scene.updateMatrixWorld(true);
  const out = {}; scene.traverse(o => { if (o.isBone) out[o.name] = o.matrixWorld.clone(); });
  scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  return out;
}

/** Choix de la tenue d'après l'apparence : armure → rôdeur (cuir, épaulière), sinon paysan ; coiffure selon le style. */
export function variantFor(look = {}) {
  const fem = !!look.female, armored = !!look.armor || !!look.helmet;
  if (armored) return fem ? 'f_ranger' : 'm_ranger';
  if (fem) return ['court', 'queue', 'tresse'].includes(look.hairStyle) ? 'f_peasant_b' : 'f_peasant_a';
  return look.beard ? 'm_peasant_a' : 'm_peasant_b';
}

const mats = new Map(), BASE_SKIN = new THREE.Color('#d8b49a');
/** Teintes : vêtements mêlés à la couleur de la tunique, cheveux colorés, peau ajustée au teint choisi. */
export function tinted(m, look) {
  const n = m.name || '', kind = /Hair/.test(n) ? 'hair' : /Eyes/.test(n) ? 'eyes' : /Superhero|Regular/.test(n) ? 'skin' : 'cloth';
  const want = kind === 'hair' ? look.hair ?? '#3a2a1e' : kind === 'skin' ? look.skin ?? '#d8b49a' : kind === 'cloth' ? (look.armorTint ?? look.tunic ?? null) : '#ffffff';
  const key = n + '|' + want; if (mats.has(key)) return mats.get(key);
  if (want === null) return m;
  const c = m.clone(), w = new THREE.Color(want);
  if (kind === 'hair') c.color.copy(w).multiplyScalar(1.6);
  else if (kind === 'skin') c.color.setRGB(clamp(w.r / BASE_SKIN.r), clamp(w.g / BASE_SKIN.g), clamp(w.b / BASE_SKIN.b));
  else if (kind === 'cloth') recolor(c, w);
  if (kind !== 'eyes') c.envMapIntensity = .7;
  mats.set(key, c); return c;
}
/** Vêtements : la texture est en partie ramenée à sa luminance puis teintée (couleur de la maison, de la faction). */
function recolor(m, tint) {
  m.onBeforeCompile = sh => {
    sh.uniforms.uTint = { value: tint };
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uTint;').replace('#include <map_fragment>', `#include <map_fragment>
      float lum = dot(diffuseColor.rgb, vec3(.3, .59, .11)); diffuseColor.rgb = mix(diffuseColor.rgb, lum * uTint * 2.4, .62);`);
  };
  m.customProgramCacheKey = () => 'tissu';
}
const clamp = v => Math.min(1.25, Math.max(.35, v));
