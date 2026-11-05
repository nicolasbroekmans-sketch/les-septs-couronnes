// Herbe : touffes de brins (triangles à dégradé de couleur) instanciées par milliers, qui ondulent au vent
// dans le shader. Un seul appel de dessin ; densité réduite en qualité basse (Mac et portables).
import * as THREE from 'three';

function tuft() {
  const pos = [], col = [], c0 = new THREE.Color('#4a5e2a'), c1 = new THREE.Color('#c4d68a');
  for (let i = 0; i < 9; i++) {
    const a = i / 6 * Math.PI + Math.random() * .4, r = .12 + Math.random() * .12, h = .35 + Math.random() * .35, lean = (Math.random() - .5) * .25;
    const dx = Math.cos(a) * .05, dz = Math.sin(a) * .05, ox = Math.cos(a + 1.6) * r * .4, oz = Math.sin(a + 1.6) * r * .4;
    pos.push(ox - dx, 0, oz - dz, ox + dx, 0, oz + dz, ox + lean, h, oz + lean * .5);
    col.push(...c0.toArray(), ...c0.toArray(), ...c1.toArray());
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return g;
}

export function grassBuilders(E, ctx) {
  return {
    /** o : { area: [x0, z0, x1, z1], count, tint, avoid(x, z), maxSlope } */
    grass(o) {
      const [x0, z0, x1, z1] = o.area, q = { low: .35, medium: .7, high: 1 }[E.quality] ?? .7, n = Math.round((o.count ?? 12000) * q);
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, color: o.tint ?? '#ffffff' }), time = { value: 0 };
      mat.onBeforeCompile = sh => {
        sh.uniforms.uTime = time;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', `#include <begin_vertex>
          vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
          float w = sin(uTime * 1.7 + ip.x * 0.31 + ip.z * 0.23) * 0.08 + sin(uTime * 3.1 + ip.x * 0.9) * 0.03;
          transformed.x += w * position.y * 2.0; transformed.z += w * position.y;`);
      };
      const m = new THREE.InstancedMesh(tuft(), mat, n), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), f = E.physics.groundFn;
      let k = 0;
      for (let i = 0; i < n * 3 && k < n; i++) {
        const x = x0 + ctx.rand() * (x1 - x0), z = z0 + ctx.rand() * (z1 - z0);
        if (o.avoid?.(x, z)) continue;
        const y = f(x, z), sl = Math.abs(f(x + 1, z) - y) + Math.abs(f(x, z + 1) - y); if (sl > (o.maxSlope ?? .6)) continue;
        Q.setFromAxisAngle(up, ctx.rand() * 6.28); const s = .7 + ctx.rand() * .9;
        m.setMatrixAt(k++, M.compose(P.set(x, y - .02, z), Q, S.set(s, s * (.8 + ctx.rand() * .6), s)));
      }
      m.count = k; m.receiveShadow = true; m.frustumCulled = false; E.scene.add(m);
      ctx.update((t, dt) => (time.value += dt));
      return m;
    }
  };
}
