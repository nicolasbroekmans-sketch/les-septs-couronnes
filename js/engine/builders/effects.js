// Effets : lueurs, torches et feux (lumière vacillante), particules, points d'intérêt, modèles GLTF.
import * as THREE from 'three';
import { makePoints, PRESETS, glowTex } from '../Particles.js';

const reduced = () => document.body.classList.contains('reduced');

export function effectBuilders(E, ctx) {
  return {
    glow(x, y, z, color, size = 1) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      sp.scale.setScalar(size); sp.position.set(x, y, z); E.scene.add(sp); return sp;
    },
    /** Torche : flamme + lumière qui vacille (light:false = flamme seule). Les lumières sont limitées par la qualité. */
    torch(x, y, z, o = {}) {
      ctx.box(.12, .7, .12, x, y - .7, z, ctx.mat(null, { color: '#2a1b10' }), { solid: false, cast: false });
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: o.color ?? '#ffb15a', blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true }));
      const s = o.size ?? 1; fl.scale.set(.9 * s, 1.3 * s, 1); fl.position.set(x, y + .2, z); E.scene.add(fl);
      let light = null;
      if (o.light !== false && E.lights < E.maxLights) {
        E.lights++;
        light = new THREE.PointLight(o.color ?? '#ff9a40', o.intensity ?? 18, o.range ?? 16, 1.6); light.position.set(x, y + .4, z); E.scene.add(light);
        E.nightLights.push(light);
      }
      const ph = ctx.rand() * 10;
      ctx.update(t => { const f = .85 + Math.sin(t * 11 + ph) * .08 + Math.sin(t * 23 + ph * 2) * .06; fl.scale.set(.9 * s * f, 1.3 * s * (2 - f), 1); if (light) light.intensity = (o.intensity ?? 18) * f * E.lightBoost; });
      return fl;
    },
    fire(x, y, z, s = 1, o = {}) {
      const f = ctx.torch(x, y + .1 * s, z, { size: 2.2 * s, intensity: (o.intensity ?? 30) * s, range: 20 * s, light: o.light });
      if (o.sparks !== false) ctx.emitter('sparks', x, y, z, { scale: s });
      return f;
    },
    particles(type, o = {}) {
      const p = { ...PRESETS[type], ...o }; if (reduced()) p.count = Math.floor(p.count * .15);
      if (E.quality === 'low') p.count = Math.floor(p.count * .4);
      const pts = makePoints(p, false);
      ctx.update(t => { pts.material.uniforms.uTime.value = t; pts.material.uniforms.uCenter.value.copy(E.camera.position); });
      E.scene.add(pts); return pts;
    },
    emitter(type, x, y, z, o = {}) {
      const p = { ...PRESETS[type], ...o }, s = o.scale ?? 1; p.box = p.box.map(v => v * s);
      const pts = makePoints(p, true);
      pts.material.uniforms.uCenter.value.set(x, y + p.box[1] / 2, z);
      ctx.update(t => (pts.material.uniforms.uTime.value = t));
      E.scene.add(pts); return pts;
    },
    /** Point d'intérêt lumineux + fiche de lore (XP d'exploration à la première découverte). */
    poi(x, z, title, text, o = {}) {
      const y = o.y ?? E.physics.groundFn(x, z);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, .9, 14, 20, 1, true), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color(o.color ?? '#f1c75a') } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
        fragmentShader: 'uniform float uT; uniform vec3 uC; varying vec2 vUv; void main(){ float a = pow(1. - vUv.y, 2.5) * (.55 + .25 * sin(vUv.y * 30. - uT * 3.)); gl_FragColor = vec4(uC * 1.6, a * .35); }'
      }));
      beam.position.set(x, y + 7, z); E.scene.add(beam);
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(.32), new THREE.MeshStandardMaterial({ color: '#c9a227', emissive: o.color ?? '#f1c75a', emissiveIntensity: 2.2, metalness: .8, roughness: .3 }));
      rune.position.set(x, y + 1.6, z); E.scene.add(rune);
      const g = ctx.glow(x, y + .1, z, o.color ?? '#f1c75a', 3);
      ctx.update(t => { beam.material.uniforms.uT.value = t; rune.rotation.y = t * 1.5; rune.position.y = y + 1.6 + Math.sin(t * 2) * .15; g.material.opacity = .6 + Math.sin(t * 3) * .2; });
      E.pois.push({ x, y, z, title, text, id: o.id ?? title });
    },
    async gltf(name) {
      const key = 'gltf:' + name;
      if (!E.cache.has(key)) E.cache.set(key, E.gltfLoader.loadAsync(`assets/models/${name}.glb`).then(g => g.scene));
      const s = (await E.cache.get(key)).clone(true);
      s.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
      return s;
    }
  };
}
