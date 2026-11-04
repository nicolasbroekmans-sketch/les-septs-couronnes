// Particules GPU : une boîte de points qui suit la caméra (global) ou reste fixe (émetteur local).
import * as THREE from 'three';

const VS = `uniform float uTime, uSize, uSway, uScale, uLocal; uniform vec3 uCenter, uBox, uVel; attribute float aRand; varying float vA;
void main(){
  vec3 p = position + uVel * uTime * (.6 + .8 * aRand);
  p.x += sin(uTime * 1.3 + aRand * 20.) * uSway; p.z += cos(uTime * 1.1 + aRand * 13.) * uSway;
  vec3 q = mod(p - uCenter + uBox * .5, uBox) - uBox * .5, e = abs(q) / (uBox * .5);
  vA = uLocal > .5 ? (1. - smoothstep(.2, 1., (q.y / uBox.y) + .5)) * (1. - smoothstep(.6, 1., max(e.x, e.z))) : 1. - smoothstep(.75, 1., max(max(e.x, e.y), e.z));
  vec4 mv = modelViewMatrix * vec4(q + uCenter, 1.);
  gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (.5 + aRand) * (uScale / max(.5, -mv.z));
}`;
const FS = `uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(uColor, uOpacity * vA * smoothstep(.5, .1, d)); }`;

export const PRESETS = {
  snow: { color: '#ffffff', size: .09, vel: [0, -1.4, 0], sway: .6, box: [60, 30, 60], count: 6000, opacity: .9 },
  blizzard: { color: '#e8f2ff', size: .07, vel: [7, -3.5, 2], sway: 1.2, box: [50, 30, 50], count: 12000, opacity: .85 },
  ash: { color: '#9a9a9a', size: .08, vel: [.4, -.4, .2], sway: .8, box: [60, 30, 60], count: 2500, opacity: .7 },
  embers: { color: '#ff7a1a', size: .07, vel: [.3, 1.2, .1], sway: .8, box: [50, 30, 50], count: 1200, opacity: 1, add: true },
  dust: { color: '#ffe2a0', size: .05, vel: [.3, .05, .1], sway: .5, box: [40, 16, 40], count: 1500, opacity: .55, add: true },
  petals: { color: '#e86a8a', size: .09, vel: [.8, -.7, .3], sway: 1.1, box: [50, 24, 50], count: 1400, opacity: .9 },
  rain: { color: '#a8b8c8', size: .045, vel: [2, -16, 1], sway: .1, box: [40, 30, 40], count: 9000, opacity: .55 },
  steam: { color: '#f2f5f7', size: 1.6, vel: [.15, 1.1, 0], sway: .5, box: [4, 7, 4], count: 70, opacity: .12 },
  smoke: { color: '#3b3836', size: 4, vel: [.4, 2.2, .2], sway: 1, box: [8, 30, 8], count: 90, opacity: .25 },
  sparks: { color: '#ff9a3a', size: .12, vel: [0, 1.8, 0], sway: .35, box: [2, 4, 2], count: 60, opacity: 1, add: true },
  spray: { color: '#e6f4ff', size: .12, vel: [0, 2.2, 0], sway: .3, box: [1.6, 2.5, 1.6], count: 120, opacity: .6 }
};

export function makePoints(p, local) {
  const n = p.count, pos = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = Math.random() * p.box[0]; pos[i * 3 + 1] = Math.random() * p.box[1]; pos[i * 3 + 2] = Math.random() * p.box[2]; rnd[i] = Math.random(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const m = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: p.add ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: p.size }, uScale: { value: innerHeight * Math.min(devicePixelRatio, 2) * .71 }, uSway: { value: p.sway },
      uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...p.box) }, uVel: { value: new THREE.Vector3(...p.vel) },
      uLocal: { value: local ? 1 : 0 }, uColor: { value: new THREE.Color(p.color) }, uOpacity: { value: p.opacity } }
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; return pts;
}

export function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const glowTex = canvasTex(128, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,220,150,.8)'); r.addColorStop(1, 'rgba(255,120,20,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
export function waterNormals() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), img = g.createImageData(s, s);
  const h = (x, y) => { let v = 0; for (const [a, b, p, k] of [[3, 2, 0, 1], [5, -3, 1.3, .6], [-7, 6, 2.1, .35], [11, 9, .7, .2], [-13, 4, 2.9, .15]]) v += Math.sin((a * x + b * y) / s * 6.2832 + p) * k; return v; };
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = h(x + 1, y) - h(x - 1, y), dy = h(x, y + 1) - h(x, y - 1), n = new THREE.Vector3(-dx * 2, -dy * 2, 1).normalize(), i = (y * s + x) * 4;
    img.data[i] = (n.x * .5 + .5) * 255; img.data[i + 1] = (n.y * .5 + .5) * 255; img.data[i + 2] = (n.z * .5 + .5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
