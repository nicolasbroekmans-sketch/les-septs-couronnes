// Rendu : WebGL, ombres, post-traitement (clamp anti-NaN → bloom → vignette → sortie ACES), qualité réglable.
// Correctif du « carré noir » : une valeur HDR infinie/NaN (soleil de l'HDRI, reflets) contaminait le flou
// du bloom. La passe SAFE la neutralise et plafonne la luminance AVANT le bloom.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { waterNormals } from './Particles.js';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }';
export const SAFE = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || c.r > 6e4 || c.g > 6e4 || c.b > 6e4) c.rgb = vec3(0.);
      gl_FragColor = vec4(min(c.rgb, vec3(24.)), 1.); }` };
const GRADE = { uniforms: { tDiffuse: { value: null }, uTint: { value: new THREE.Color(1, 1, 1) }, uVig: { value: .9 }, uHit: { value: 0 } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 uTint; uniform float uVig, uHit; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float r = length(vUv - .5) * 1.25, v = smoothstep(.85, .25, r);
      c.rgb *= mix(1. - uVig * .55, 1., v); c.rgb *= uTint; c.rgb = mix(c.rgb, vec3(.6, 0., 0.), uHit * smoothstep(.2, .8, r)); gl_FragColor = c; }` };

// Étalonnage « fantasy sombre » après le tone mapping : couleurs désaturées, contraste, ombres froides,
// hautes lumières chaudes (torches), léger grain et vignette — le rendu des images de référence.
const LOOK = { uniforms: { tDiffuse: { value: null }, uSat: { value: .8 }, uCon: { value: 1.12 }, uTime: { value: 0 }, uGrain: { value: .035 } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uSat, uCon, uTime, uGrain; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(.299, .587, .114));
      c = mix(vec3(l), c, uSat);
      c = (c - .5) * uCon + .5;
      c += vec3(-.012, .0, .028) * (1. - smoothstep(0., .45, l));
      c += vec3(.03, .012, -.02) * smoothstep(.55, 1., l);
      c += (h(vUv * 917.) - .5) * uGrain;
      gl_FragColor = vec4(clamp(c, 0., 1.), 1.); }` };

export const QUALITY = {
  low: { ratio: 1, shadows: 1024, bloom: false, maxLights: 3, msaa: 0 },
  medium: { ratio: 1.5, shadows: 2048, bloom: true, maxLights: 6, msaa: 2 },
  high: { ratio: 2, shadows: 2048, bloom: true, maxLights: 10, msaa: 4 }
};

export class Renderer {
  constructor(container, quality = 'medium') {
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(r.domElement);
    this.canvas = r.domElement;
    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .1, 2600);
    this.camera.rotation.order = 'YXZ';
    this.pmrem = new THREE.PMREMGenerator(r);
    this.waterNormals = waterNormals();
    this.setQuality(quality);
    addEventListener('resize', () => this.resize());
  }
  setQuality(q) {
    this.quality = QUALITY[q] ? q : 'medium'; const Q = QUALITY[this.quality];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, Q.ratio)); this.renderer.setSize(innerWidth, innerHeight);
    if (this.scene) this.setupPost(this.scene, this.cfg);
  }
  setupPost(scene, cfg) {
    this.scene = scene; this.cfg = cfg;
    const Q = QUALITY[this.quality], w = innerWidth, h = innerHeight;
    this.composer?.dispose();
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: Q.msaa });
    const c = this.composer = new EffectComposer(this.renderer, rt);
    c.setPixelRatio(this.renderer.getPixelRatio()); c.setSize(w, h);
    c.addPass(new RenderPass(scene, this.camera));
    c.addPass(new ShaderPass(SAFE));
    if (Q.bloom) c.addPass(this.bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), cfg.bloom?.[0] ?? .45, cfg.bloom?.[1] ?? .5, cfg.bloom?.[2] ?? .85));
    this.grade = new ShaderPass(GRADE); this.grade.uniforms.uTint.value.set(cfg.tint ?? '#ffffff'); c.addPass(this.grade);
    c.addPass(new OutputPass());
    this.look = new ShaderPass(LOOK); this.look.uniforms.uSat.value = cfg.sat ?? .8; this.look.uniforms.uCon.value = cfg.contrast ?? 1.12; c.addPass(this.look);
  }
  hitFlash(v) { if (this.grade) this.grade.uniforms.uHit.value = v; }
  resize() {
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight); this.composer?.setSize(innerWidth, innerHeight);
  }
  render(dt) { if (this.look) this.look.uniforms.uTime.value = (this.look.uniforms.uTime.value + dt) % 100; this.composer ? this.composer.render(dt) : this.renderer.render(this.scene, this.camera); }
  dispose(scene) {
    scene?.traverse(o => {
      o.geometry?.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!m) return; for (const k in m) if (m[k]?.isTexture && m[k] !== this.waterNormals) m[k].dispose(); m.dispose(); });
    });
    scene?.background?.dispose?.(); scene?.environment?.dispose?.();
    this.composer?.dispose(); this.composer = null; this.scene = null;
    this.renderer.renderLists.dispose();
  }
}
