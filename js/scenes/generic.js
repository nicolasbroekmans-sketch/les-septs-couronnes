// Lieux « légers » : décor procédural + HDRI + ambiance sonore propre à chacun.
import westeros from './light/westeros.js';
import essos from './light/essos.js';
import extras from './places/extras.js';
const C = {
  dragonstone: { hdri: 'wasteland_clouds_puresky', exposure: .9, bg: .7, env: .7, fog: ['#5d6064', .0055], hemi: ['#b8bcc4', '#2a2420', .45], sun: ['#ffd2a8', 1.8, [-.4, .45, .6]], bloom: [.6, .5, .78], tint: '#eef0f2', bounds: [-140, -180, 140, 240], killY: -3 },
  casterly: { hdri: 'belfast_sunset_puresky', exposure: .85, bg: .75, env: 1, fog: ['#c89a70', .0024], hemi: ['#ffd9b0', '#5a3a20', .45], sun: ['#ffb46a', 3.2, [-.8, .3, .2]], bloom: [.35, .5, .9], tint: '#fff0dc', bounds: [-120, -150, 120, 150], skyRot: 2.2 },
  highgarden: { hdri: 'kloppenheim_06_puresky', exposure: 1, bg: 1, env: 1, fog: ['#cfe0e8', .0035], hemi: ['#f4f8ff', '#5c6a3a', .5], sun: ['#fff4dc', 3, [.4, .8, .3]], bloom: [.35, .5, .9], tint: '#fffaf0', bounds: [-130, -150, 130, 130] },
  dorne: { hdri: 'qwantani_noon_puresky', exposure: 1.02, bg: 1.7, env: 1, fog: ['#f0dcc0', .003], hemi: ['#fff4e0', '#a07a5a', .55], sun: ['#fff1d8', 4, [.3, 1, .2]], bloom: [.35, .5, .9], tint: '#fff4e8', bounds: [-100, -120, 100, 120] },
  eyrie: { hdri: 'kloppenheim_06_puresky', exposure: 1.05, bg: 1, env: 1, fog: ['#dfe8f0', .0038], hemi: ['#f0f6ff', '#56606a', .5], sun: ['#ffffff', 3, [.5, .7, .3]], bloom: [.4, .5, .88], tint: '#f6faff', bounds: [-100, -140, 100, 100] },
  pyke: { hdri: 'kloofendal_overcast_puresky', exposure: .95, bg: .55, env: .8, fog: ['#3a4148', .0075], hemi: ['#8a96a2', '#2a2c2e', .9], sun: ['#b8c4d0', 1, [.3, .6, -.5]], bloom: [.6, .5, .7], tint: '#dfe6ee', bounds: [-110, -110, 110, 110], killY: -30 },
  pentos: { hdri: 'belfast_sunset_puresky', exposure: .8, bg: .7, env: .9, fog: ['#d8b090', .0026], hemi: ['#ffe0c0', '#6a4a30', .45], sun: ['#ffbf80', 3, [.7, .3, .4]], bloom: [.3, .5, .92], tint: '#fff2e2', bounds: [-100, -120, 100, 140] },
  vaesdothrak: { hdri: 'kloppenheim_06_puresky', exposure: 1.05, bg: 1, env: 1, fog: ['#d8d6c4', .0028], hemi: ['#fff8e8', '#7a6a40', .55], sun: ['#fff0d0', 3.2, [.6, .55, .3]], bloom: [.35, .5, .9], tint: '#fffaf0', bounds: [-140, -200, 140, 120] },
  qarth: { hdri: 'qwantani_noon_puresky', exposure: 1, bg: 1.6, env: 1, fog: ['#e8b48a', .0035], hemi: ['#ffe8d0', '#a0502a', .5], sun: ['#ffeed8', 4, [.3, .9, .4]], bloom: [.35, .5, .9], tint: '#fff0e4', bounds: [-140, -170, 140, 140] },
  volantis: { hdri: 'qwantani_late_afternoon_puresky', exposure: 1, bg: 1, env: 1, fog: ['#d8c0a0', .0034], hemi: ['#ffe2bc', '#5a4632', .5], sun: ['#ffcc90', 3, [-.5, .4, .5]], bloom: [.4, .5, .88], tint: '#fff1de', bounds: [-140, -140, 140, 140], skyRot: 1 },
  valyria: { hdri: 'wasteland_clouds_puresky', exposure: .8, bg: .45, env: .45, fog: ['#4a3530', .014], hemi: ['#a08070', '#200a05', .45], sun: ['#ff9a6a', 1.2, [.2, .5, .7]], bloom: [.9, .6, .6], tint: '#ffe6dc', bounds: [-100, -100, 100, 100], killY: -25 }
};
export const config = id => C[id];


export async function build(ctx, id) { await B[id](ctx); await extras[id]?.(ctx); }
const B = { ...westeros, ...essos };
