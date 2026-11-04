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
      const m = new THREE.Mesh(g, o.mat); m.position.set(o.x ?? 0, 0, o.z ?? 0); m.receiveShadow = true; E.scene.add(m);
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
      ctx.mapMark(m.position.x - w / 2, m.position.z - d / 2, m.position.x + w / 2, m.position.z + d / 2, '#8fa7a6');
      return m;
    }
  };
}
