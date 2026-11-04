// Chargement d'un lieu : module de scène, ciel HDRI, lumières, construction procédurale, fusion statique.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Physics } from './Physics.js';
import { makeCtx } from './SceneContext.js';
import { QUALITY } from './Renderer.js';

/** extraBuild(ctx) : construction propre au gameplay (camps, accessoires de quête…) après la scène. */
export async function loadScene(R, sceneName, placeId, progress = () => {}, extraBuild = null) {
  progress(.03, 'Les mestres déroulent les plans…');
  const mod = await import(`../scenes/${sceneName}.js`);
  const cfg = typeof mod.config === 'function' ? mod.config(placeId) : mod.config;
  const scene = new THREE.Scene(), physics = new Physics();
  let done = true, wake = null;
  const manager = new THREE.LoadingManager();
  manager.onStart = () => (done = false);
  manager.onLoad = () => { done = true; wake?.(); };
  manager.onProgress = (_, l, t) => progress(.05 + .55 * l / t, 'On taille la pierre et le bois…');
  const E = {
    scene, physics, camera: R.camera, cfg, cache: new Map(), updaters: [], pois: [], mapMarks: [], ambience: [], nightLights: [],
    texLoader: new THREE.TextureLoader(manager), gltfLoader: new GLTFLoader(manager), waterNormals: R.waterNormals,
    quality: R.quality, maxLights: QUALITY[R.quality].maxLights, lights: 0, lightBoost: 1, spawn: { x: 0, z: 0, yaw: 0, y: null },
    get groundFn() { return physics.groundFn; }
  };
  const hdr = await new RGBELoader(manager).loadAsync(`assets/hdri/${cfg.hdri}.hdr`);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = hdr;
  scene.environment = R.pmrem.fromEquirectangular(hdr).texture;
  scene.backgroundIntensity = cfg.bg ?? 1; scene.environmentIntensity = cfg.env ?? 1;
  if (cfg.skyRot) { scene.backgroundRotation.y = cfg.skyRot; scene.environmentRotation.y = cfg.skyRot; }
  scene.fog = new THREE.FogExp2(cfg.fog[0], cfg.fog[1]);
  R.renderer.toneMappingExposure = cfg.exposure ?? 1;
  E.hemi = new THREE.HemisphereLight(cfg.hemi?.[0] ?? '#ffffff', cfg.hemi?.[1] ?? '#444444', cfg.hemi?.[2] ?? .4);
  const sun = E.sun = new THREE.DirectionalLight(cfg.sun?.[0] ?? '#fff', cfg.sun?.[1] ?? 2);
  E.sunDir = new THREE.Vector3(...(cfg.sun?.[2] ?? [.5, .8, .3])).normalize();
  sun.castShadow = true; sun.shadow.mapSize.setScalar(QUALITY[R.quality].shadows);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 400 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .04; sun.shadow.radius = 4;
  scene.add(E.hemi, sun, sun.target);
  progress(.1, 'On taille la pierre et le bois…');
  const ctx = makeCtx(E);
  await mod.build(ctx, placeId);
  if (extraBuild) await extraBuild(ctx);
  if (!done) await new Promise(r => (wake = r));
  progress(.7, 'On allume les torches…');
  mergeStatic(scene);
  R.setupPost(scene, cfg);
  return { E, ctx, cfg };
}

/** Fusionne la géométrie statique par matériau : beaucoup moins de draw calls. */
export function mergeStatic(scene) {
  const groups = new Map(), victims = [];
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o.isMesh || !o.userData.merge || !o.geometry.index) return;
    const key = o.material.uuid + (o.castShadow ? 's' : '');
    if (!groups.has(key)) groups.set(key, { mat: o.material, cast: o.castShadow, geos: [] });
    groups.get(key).geos.push(o.geometry.clone().applyMatrix4(o.matrixWorld)); victims.push(o);
  });
  victims.forEach(o => { o.parent.remove(o); o.geometry.dispose(); });
  for (const { mat, cast, geos } of groups.values()) {
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.castShadow = cast; m.receiveShadow = true; scene.add(m);
    geos.forEach(g => g.dispose());
  }
}
