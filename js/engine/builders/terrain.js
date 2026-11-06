// Terrain déformé et plans d'eau (réfléchissants avec Water de Three.js, ou animés simples).
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function terrainBuilders(E, ctx) {
  return {
    terrain(o) {
      const size = o.size ?? 600, seg = o.seg ?? 160, g = new THREE.PlaneGeometry(size, size, seg, seg);
      g.rotateX(-Math.PI / 2);
      const p = g.attributes.position, uv = g.attributes.uv, k = size / (o.mat.userData.uv ?? 4);
      for (let i = 0; i < p.count; i++) { p.setY(i, o.height(p.getX(i) + (o.x ?? 0), p.getZ(i) + (o.z ?? 0))); uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); }
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, o.splat ? splat(ctx, o.mat, o.splat) : o.mat); m.position.set(o.x ?? 0, 0, o.z ?? 0); m.receiveShadow = true; E.scene.add(m);
      if (o.walk !== false) E.physics.groundFn = o.height;
      return m;
    },
    water(o = {}) {
      const w = o.w ?? 2000, d = o.d ?? 2000, geo = new THREE.PlaneGeometry(w, d);
      let m;
      if (o.reflect && E.quality !== 'low') {
        m = new Water(geo, { textureWidth: 512, textureHeight: 512, waterNormals: E.waterNormals, sunDirection: E.sunDir.clone(), sunColor: o.sun ?? '#ffffff', waterColor: o.color ?? '#1d3b48', distortionScale: o.distortion ?? 2.2, fog: true });
        m.material.uniforms.size.value = o.scale ?? 2;
        ctx.update((t, dt) => (m.material.uniforms.time.value += dt * (o.speed ?? .6)));
      } else {
        const nm = E.waterNormals.clone(); nm.repeat.set(w / 12, d / 12);
        m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: o.color ?? '#1d3b48', roughness: .08, metalness: .2, normalMap: nm, normalScale: new THREE.Vector2(.6, .6), transparent: true, opacity: o.opacity ?? .92 }));
        ctx.update(t => nm.offset.set(t * .015, t * .01));
      }
      m.rotation.x = -Math.PI / 2; m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0); E.scene.add(m);
      E.waters?.push({ y: m.position.y, x0: m.position.x - w / 2, x1: m.position.x + w / 2, z0: m.position.z - d / 2, z1: m.position.z + d / 2 });
      ctx.mapMark(m.position.x - w / 2, m.position.z - d / 2, m.position.x + w / 2, m.position.z + d / 2, '#8fa7a6');
      return m;
    }
  };
}

/** Terrain multi-textures : roche dans les pentes, neige en altitude, variation de teinte anti-répétition. */
function splat(ctx, base, o) {
  const m = base.clone(), slope = ctx.tex(o.slope ?? 'rocky_terrain_02'), high = o.high ? ctx.tex(o.high) : null;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { tSlope: { value: slope }, tHigh: { value: high ?? slope }, highY: { value: o.highY ?? 1e5 }, sTint: { value: new THREE.Color(o.slopeTint ?? '#ffffff') }, sScale: { value: o.scale ?? 7 } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying vec3 vWNorm;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vWNorm = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying vec3 vWNorm; uniform sampler2D tSlope; uniform sampler2D tHigh; uniform float highY; uniform vec3 sTint; uniform float sScale;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec2 suv = vWPos.xz / sScale;
        float var = texture2D(tSlope, vWPos.xz / 97.0).g;
        diffuseColor.rgb *= 0.82 + 0.36 * var;
        float sl = 1.0 - smoothstep(0.62, 0.86, vWNorm.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, texture2D(tSlope, suv).rgb * sTint, sl);
        float hi = smoothstep(highY, highY + 10.0, vWPos.y + var * 6.0) * (1.0 - sl * 0.8);
        diffuseColor.rgb = mix(diffuseColor.rgb, texture2D(tHigh, suv * 0.8).rgb, hi);`);
  };
  m.customProgramCacheKey = () => 'splat' + (o.slope ?? '') + (o.high ?? '');
  return m;
}
