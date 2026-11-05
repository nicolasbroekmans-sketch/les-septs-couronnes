import { castleBlack } from './details/castleBlack.js';

// LE MUR — paroi de glace de 200 m (shader translucide), Châteaunoir, escalier en zigzag, cage d'ascenseur, aurores.
export const config = {
  hdri: 'qwantani_night_puresky', exposure: 1.35, bg: 1.1, env: 1.2,
  fog: ['#24324a', .0042], hemi: ['#8fa8c8', '#2a3240', 1.1], sun: ['#b9d0ec', 1.8, [.25, .75, .6]],
  bloom: [.75, .6, .7], tint: '#dbe8ff', bounds: [-120, -110, 120, 90], killY: -60
};

const ICE_VS = `
varying vec3 vW; varying vec3 vN; varying float vD;
#include <fog_pars_vertex>
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
void main(){
  vec3 p = position;
  vec4 w0 = modelMatrix * vec4(p, 1.);
  float d = 0.;
  if (normal.z > .5) { d = n(w0.xy * vec2(.06, .02)) * 2.6 + n(w0.xy * .25) * .5; p.z -= d; }
  vD = d;
  vec4 w = modelMatrix * vec4(p, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const ICE_FS = `
uniform float uTime; varying vec3 vW; varying vec3 vN; varying float vD;
#include <fog_pars_fragment>
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
void main(){
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1. - max(dot(V, vN), 0.), 2.5);
  float streak = n(vec2(vW.x * .07, vW.y * .01)) * .65 + n(vec2(vW.x * .4, vW.y * .04)) * .35;
  float layer = smoothstep(.4, .6, n(vec2(vW.x * .01, vW.y * .08)));
  vec3 deep = vec3(.05, .16, .26), mid = vec3(.30, .56, .72), hi = vec3(.82, .94, 1.);
  vec3 c = mix(deep, mid, streak * .8 + vD * .15);
  c = mix(c, hi, layer * .35 + fres * .6 + smoothstep(170., 200., vW.y) * .7);
  c += vec3(.25, .45, .55) * pow(streak, 6.) * 1.4;                      // reflets internes
  c += vec3(.4, .9, .7) * .05 * (sin(uTime * .3 + vW.x * .02) * .5 + .5); // reflet d'aurore
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
const AURORA_FS = `
uniform float uTime; varying vec2 vUv;
float h(float x){ return fract(sin(x * 91.7) * 4375.5); }
void main(){
  float x = vUv.x * 6.;
  float wave = sin(x * 2.1 + uTime * .25) * .08 + sin(x * 5.3 - uTime * .4) * .04;
  float band = smoothstep(.0, .25, vUv.y - .25 - wave) * (1. - smoothstep(.3, 1., vUv.y - wave));
  float rays = .55 + .45 * sin(vUv.x * 160. + sin(vUv.x * 9. + uTime) * 4.);
  vec3 col = mix(vec3(.15, 1., .55), vec3(.5, .3, 1.), smoothstep(.4, .9, vUv.y));
  float a = band * rays * smoothstep(0., .15, vUv.x) * smoothstep(1., .85, vUv.x);
  gl_FragColor = vec4(col * a * .9, a * .55);
}`;

/** Sol : Châteaunoir au sud, tunnel plat, puis collines boisées jusqu'au Poing des Premiers Hommes (40, −470). */
export function wallHeight(x, z) {
  if (z > -55) return Math.sin(x * .04) * Math.cos(z * .05) * 1.5 * Math.min(1, Math.max(0, (Math.hypot(x, z - 10) - 60) / 40));
  const k = Math.min(1, Math.max(0, (-150 - z) / 50)), d = Math.hypot(x - 40, z + 470);
  return k * (Math.sin(x * .03) * Math.cos(z * .025) * 4 + Math.sin(x * .011 + z * .007) * 3 + 3) + 22 * Math.min(1, Math.max(0, (48 - d) / 18));
}

export async function build(ctx) {
  const { THREE, mat, rand } = ctx;
  const snow = mat('snow_02', { uv: 6, color: '#c9d6e4', rough: .8 });
  const stone = mat('castle_wall_slates', { normal: 'castle_wall_slates_nor', uv: 5, color: '#8f969e' });
  const wood = mat('weathered_planks', { uv: 3, color: '#8d7660' });
  const roofM = mat('grey_roof_tiles', { uv: 3, color: '#c5ced6' });
  ctx.terrain({ size: 1200, seg: 220, height: wallHeight, mat: snow, splat: { slope: 'rocky_terrain_02', slopeTint: '#c8ccd0' } });

  // La paroi de glace
  const ice = new THREE.ShaderMaterial({ vertexShader: ICE_VS, fragmentShader: ICE_FS, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]) });
  const WZ = -60, WH = 200, WT = 80;
  // Trois blocs pour ménager le tunnel (x = TX, 5 m de large, 6 m de haut) qui mène au-delà du Mur.
  const TX = -40, TW = 2.5, TH = 6;
  for (const [x0, x1, y0] of [[-450, TX - TW, 0], [TX + TW, 450, 0], [TX - TW, TX + TW, TH]]) {
    const w = x1 - x0, h = WH - y0, m = new THREE.Mesh(new THREE.BoxGeometry(w, h, WT, Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 3.3)), 1), ice);
    m.position.set((x0 + x1) / 2, y0 + h / 2, WZ - WT / 2); ctx.add(m);
    ctx.collider(x0, y0, WZ - WT, x1, WH, WZ - .3);
  }
  ctx.mapMark(-450, WZ - WT, 450, WZ, '#a9c7d6');
  ctx.update(t => (ice.uniforms.uTime.value = t));
  // parapet de bois sur le sommet
  for (let x = -60; x <= 60; x += 3) ctx.box(.3, 1.2, .3, x, WH, WZ - 1, wood, { col: { noMap: true } });
  ctx.box(124, .2, .2, 0, WH + 1, WZ - 1, wood, { solid: false });

  // Aurores boréales au-dessus du Mur
  const aur = new THREE.ShaderMaterial({ fragmentShader: AURORA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }', uniforms: { uTime: { value: 0 } } });
  for (let i = 0; i < 2; i++) {
    const g = new THREE.PlaneGeometry(1600, 380, 80, 1), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * .004 + i) * 120);
    const a = new THREE.Mesh(g, aur); a.position.set(i * 200 - 100, 420 + i * 60, -520 - i * 160); a.rotation.x = .25; ctx.add(a);
  }
  ctx.update(t => (aur.uniforms.uTime.value = t));

  // Escalier de bois en zigzag contre la paroi
  let x = 18, y = 0;
  const lanes = [WZ + 1.6, WZ + 4.2];
  for (let f = 0; f < 9; f++) {
    const dir = f % 2 ? 'O' : 'E', z = lanes[f % 2];
    const end = ctx.stairs(x, y, z, { dir, n: 12, rise: .4, run: .6, w: 2.6, mat: wood });
    const lx = end.x + (dir === 'E' ? 1.3 : -1.3);
    ctx.box(2.6, .3, 5.2, lx, end.y - .3, WZ + 2.9, wood);
    ctx.box(.15, 1.1, 5.2, lx + (dir === 'E' ? 1.3 : -1.3), end.y, WZ + 2.9, wood);
    if (f % 2 === 0) ctx.torch(lx, end.y + 1.4, WZ + 4.5, { light: f < 3, color: '#ffa860' });
    x = end.x; y = end.y;
  }
  ctx.poi(16, WZ + 7, 'L’escalier en zigzag', 'Des marches de bois clouées à même la glace. Les frères noirs les montent en silence ; une seule parole de trop, et le vent l’emporte avec vous.');

  // Cage d'ascenseur : montez dedans et attendez
  const cx = -22, cz = WZ + 3.2, cage = new THREE.Group();
  const iron = mat(null, { color: '#2b2d31', metal: .8, rough: .5 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(4, .3, 4), wood.clone()); floor.position.y = -.15; cage.add(floor);
  for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(.12, 3, .12), iron); bar.position.set(a * .97, 1.5, b * .97); cage.add(bar); }
  for (const yy of [1.1, 3]) for (const [w, d, px, pz] of [[4, .1, 0, 2], [4, .1, 0, -2], [.1, 4, 2, 0]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, .1, d), iron); r.position.set(px * .97, yy, pz * .97); cage.add(r); }
  cage.position.set(cx, 0, cz); cage.traverse(o => (o.castShadow = true)); ctx.add(cage);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1, 5), mat(null, { color: '#4a3b2a' })); rope.position.set(cx, 0, cz); ctx.add(rope);
  ctx.box(6, 3, 8, cx - 7, WH, WZ - 6, wood); // treuil au sommet
  ctx.box(4, .3, 1.6, cx, WH - .3, WZ + .7, wood); // passerelle cage → sommet
  const plat = ctx.collider(cx - 2, -.3, cz - 2, cx + 2, 0, cz + 2, { noMap: true });
  const rail = [ctx.collider(cx - 2.1, 0, cz + 1.9, cx + 2.1, 1.2, cz + 2.1, { noMap: true }), ctx.collider(cx + 1.9, 0, cz - 2.1, cx + 2.1, 1.2, cz + 2.1, { noMap: true })];
  let cy = 0, target = 0, wait = 0;
  ctx.update((t, dt, E) => {
    const on = Math.abs(E.pos.x - cx) < 1.9 && Math.abs(E.pos.z - cz) < 1.9 && Math.abs(E.pos.y - cy) < .6;
    if (on && cy === target) { wait += dt; if (wait > 1.2) { target = cy < 1 ? WH : 0; wait = 0; } } else if (!on) wait = 0;
    if (cy !== target) { const s = 9 * dt * Math.sign(target - cy); cy = Math.abs(target - cy) < Math.abs(s) ? target : cy + s; }
    cage.position.y = cy; plat.minY = cy - .3; plat.maxY = cy; rail.forEach(r => { r.minY = cy; r.maxY = cy + 1.2; });
    rope.position.y = (cy + WH) / 2 + 2; rope.scale.y = Math.max(.1, WH - cy);
  });
  ctx.poi(cx + 4, cz + 3, 'La cage', 'Montez dans la cage et attendez : le treuil vous hisse au sommet. Deux cents mètres de vide, et un seul câble de chanvre goudronné.', { color: '#9fc4d6' });
  ctx.poi(cx, WZ - 14, 'Le sommet du Mur', 'Au nord, la forêt hantée s’étend jusqu’au bout de la nuit. Au sud, les feux de Châteaunoir ressemblent à des braises oubliées.', { y: WH, color: '#9fc4d6' });

  // Châteaunoir : tours de pierre, réfectoire, baraquements en bois
  ctx.tower(-50, -20, { w: 12, h: 24, mat: stone, round: true });
  ctx.tower(40, -30, { w: 9, h: 18, mat: stone, roof: roofM });
  ctx.box(28, 8, 12, 0, 0, -25, stone); ctx.roof(13, 5, 29, 0, 8, -25, roofM, { rotY: Math.PI / 2 });
  ctx.box(10, 5, 26, -35, 0, 10, wood); ctx.roof(11, 3.5, 27, -35, 5, 10, roofM);
  ctx.box(10, 5, 22, 35, 0, 10, wood); ctx.roof(11, 3.5, 23, 35, 5, 10, roofM);
  ctx.box(18, 6, 10, 0, 0, 36, wood); ctx.roof(11, 3.5, 19, 0, 6, 36, roofM, { rotY: Math.PI / 2 });
  ctx.poi(0, -15, 'Le réfectoire', 'Du pain dur, de la bière tiède et la chaleur de cent hommes qui ne parlent plus de leur passé. On y entre étranger ; on en sort frère.');
  for (let i = 0; i < 5; i++) { ctx.box(.3, 2, .3, -8 + i * 4, 0, 10, wood); ctx.box(1.2, .25, .25, -8 + i * 4, 1.4, 10, wood, { solid: false }); }
  for (const [bx, bz] of [[-12, 0], [12, 0], [0, 22]]) { ctx.box(1.2, 1, 1.2, bx, 0, bz, stone); ctx.fire(bx, 1, bz, .7); }
  for (const [tx, tz] of [[-8, -19], [8, -19], [-30, -3], [30, -3]]) ctx.torch(tx, 3, tz, { light: false });
  const pines = []; for (let i = 0; i < 200; i++) { const a = rand() * Math.PI, r = 90 + rand() * 180; pines.push([Math.cos(a) * r * 1.4, Math.sin(a) * r, 1 + rand()]); }
  ctx.trees(pines, 'pine', { leaf: '#1f2c2a' });

  castleBlack(ctx);
  ctx.particles('blizzard');
  ctx.spawn(22, 62, .12);
  ctx.sound({ name: 'blizzard', volume: .65 }, { name: 'fire', volume: .6, pos: [0, 1, 22], ref: 3 }, { name: 'raven', volume: .45, every: [10, 20], randomPos: [0, 30, -30, 60], ref: 12 });
}
