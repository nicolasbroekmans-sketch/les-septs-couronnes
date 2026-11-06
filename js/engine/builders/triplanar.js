// Matériau « triplanaire » : la texture est projetée selon les axes du monde (pas besoin d'UV), ce qui permet
// de réhabiller proprement les toits et soubassements de modèles importés dont les textures cuites sont ratées.
import * as THREE from 'three';

export function triplanar(tex, color = '#ffffff', scale = .5, rough = .9) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.tTri = { value: tex }; sh.uniforms.uTriScale = { value: scale };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTriP; varying vec3 vTriN;').replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
      mat4 triM = modelMatrix;
      #ifdef USE_INSTANCING
        triM = modelMatrix * instanceMatrix;
      #endif
      vTriP = (triM * vec4(transformed, 1.0)).xyz; vTriN = normalize(mat3(triM) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tTri; uniform float uTriScale; varying vec3 vTriP; varying vec3 vTriN;').replace('#include <map_fragment>', `
      vec3 bw = pow(abs(vTriN), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
      vec3 tx = texture2D(tTri, vTriP.zy * uTriScale).rgb, ty = texture2D(tTri, vTriP.xz * uTriScale).rgb, tz = texture2D(tTri, vTriP.xy * uTriScale).rgb;
      diffuseColor.rgb *= tx * bw.x + ty * bw.y + tz * bw.z;`);
  };
  m.customProgramCacheKey = () => 'triplanar';
  return m;
}
