// Constructeurs de base : textures, matériaux PBR, boîtes / cylindres / cônes / toits avec UV « monde ».
import * as THREE from 'three';

export function basicBuilders(E, ctx) {
  let seed = 1234;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const collider = (minX, minY, minZ, maxX, maxY, maxZ, extra) => E.physics.add({ minX, minY, minZ, maxX, maxY, maxZ, ...extra });
  const colliderFrom = (o, extra) => { const b = new THREE.Box3().setFromObject(o); return collider(b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z, extra); };
  const tex = (name, color = true) => {
    const key = 'tex:' + name + color;
    if (!E.cache.has(key)) {
      const t = E.texLoader.load(`assets/textures/${name}.webp`);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
      if (color) t.colorSpace = THREE.SRGBColorSpace;
      E.cache.set(key, t);
    }
    return E.cache.get(key);
  };
  /** Matériau PBR. uv = mètres par répétition de texture ; instanced = UV monde pour InstancedMesh. */
  const mat = (map, o = {}) => {
    const key = 'mat:' + JSON.stringify([map, o]);
    if (E.cache.has(key)) return E.cache.get(key);
    const m = new THREE.MeshStandardMaterial({
      map: map ? tex(map) : null, normalMap: o.normal ? tex(o.normal, false) : null,
      color: o.color ?? '#ffffff', roughness: o.rough ?? .92, metalness: o.metal ?? 0,
      emissive: o.emissive ?? '#000000', emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide,
      transparent: !!o.opacity, opacity: o.opacity ?? 1, flatShading: !!o.flat
    });
    m.userData.uv = o.uv ?? 4;
    if (o.instanced) {
      m.onBeforeCompile = sh => {
        sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
          #if defined(USE_INSTANCING) && defined(USE_MAP)
            vec3 sc_ = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
            vec3 an_ = abs(normal);
            vMapUv *= (an_.x > .5 ? sc_.zy : (an_.y > .5 ? sc_.xz : sc_.xy)) / ${m.userData.uv.toFixed(2)};
          #endif`);
      };
      m.customProgramCacheKey = () => 'inst' + m.userData.uv;
    }
    E.cache.set(key, m); return m;
  };
  const boxGeo = (w, h, d, uv) => {
    const g = new THREE.BoxGeometry(w, h, d), a = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const j = f * 4 + i; a.setXY(j, a.getX(j) * dims[f][0] / uv, a.getY(j) * dims[f][1] / uv); }
    return g;
  };
  const place = (m, x, y, z, o) => {
    m.position.set(x, y, z); if (o.rotY) m.rotation.y = o.rotY;
    m.castShadow = o.cast ?? true; m.receiveShadow = true; m.userData.merge = o.merge ?? true;
    (o.parent ?? E.scene).add(m); m.updateMatrixWorld();
    if (o.solid ?? true) colliderFrom(m, o.col);
    return m;
  };
  return {
    rand, setSeed: s => (seed = s), tex, mat, boxGeo, place, collider, colliderFrom,
    add: o => (E.scene.add(o), o),
    ground: fn => (E.physics.groundFn = fn),
    spawn: (x, z, yaw = 0, y = null) => (E.spawn = { x, z, yaw, y }),
    update: fn => E.updaters.push(fn),
    sound: (...list) => E.ambience.push(...list),
    mapMark: (minX, minZ, maxX, maxZ, color) => E.mapMarks.push({ minX, minZ, maxX, maxZ, color }),
    box: (w, h, d, x, y, z, m, o = {}) => place(new THREE.Mesh(boxGeo(w, h, d, m.userData.uv ?? 4), m), x, y + h / 2, z, o),
    cyl(r, h, x, y, z, m, o = {}) {
      const g = new THREE.CylinderGeometry(o.rTop ?? r, r, h, o.seg ?? 16, 1, !!o.open);
      const a = g.attributes.uv, uv = m.userData.uv ?? 4; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * 6.28 * r / uv, a.getY(i) * h / uv);
      return place(new THREE.Mesh(g, m), x, y + h / 2, z, o);
    },
    cone: (r, h, x, y, z, m, o = {}) => place(new THREE.Mesh(new THREE.ConeGeometry(r, h, o.seg ?? 4, 1), m), x, y + h / 2, z, { solid: false, ...o, rotY: o.rotY ?? Math.PI / 4 }),
    roof(w, h, d, x, y, z, m, o = {}) {
      const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
      const a = g.attributes.uv, uv = m.userData.uv ?? 4; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) / uv, a.getY(i) / uv);
      if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
      return place(new THREE.Mesh(g, m), x, y, z, { solid: false, ...o });
    }
  };
}
