// Assemble l'API `ctx` passée aux fichiers de scène (js/scenes/*.js). Inchangée pour les scènes existantes.
import * as THREE from 'three';
import { basicBuilders } from './builders/basic.js';
import { fortBuilders } from './builders/fort.js';
import { terrainBuilders } from './builders/terrain.js';
import { cityBuilders } from './builders/city.js';
import { natureBuilders } from './builders/nature.js';
import { effectBuilders } from './builders/effects.js';
import { propBuilders } from './builders/props.js';

/** E : environnement de construction { scene, physics, camera, texLoader, gltfLoader, cache, updaters, … } */
export function makeCtx(E) {
  const ctx = { THREE, scene: E.scene, camera: E.camera, engine: E };
  for (const make of [basicBuilders, fortBuilders, terrainBuilders, cityBuilders, natureBuilders, effectBuilders]) Object.assign(ctx, make(E, ctx));
  ctx.props = propBuilders(E, ctx);
  return ctx;
}
