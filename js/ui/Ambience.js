// Ambiance de l'interface : grain de film, curseur doré, braises/poussière 2D, réduction des animations.
const $ = s => document.querySelector(s);
const body = document.body;
export const M = () => (body.classList.contains('reduced') ? .01 : 1);
export const fxState = { mode: 'embers', paused: false };

export function initAmbience() {
  // grain de film généré
  const c = document.createElement('canvas'); c.width = c.height = 180;
  const g = c.getContext('2d'), d = g.createImageData(180, 180);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
  // curseur doré (masqué pendant la capture du pointeur)
  const cursor = $('#cursor');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const qx = gsap.quickTo(cursor, 'x', { duration: .25, ease: 'power3' }), qy = gsap.quickTo(cursor, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { cursor.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    addEventListener('pointerover', e => cursor.classList.toggle('hover', !!e.target.closest('button, a, [role=button], .seal, select, input')));
    document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
    document.addEventListener('pointerlockchange', () => cursor.classList.toggle('hidden', !!document.pointerLockElement));
  }
  startFx();
}
export function setReduced(on) { body.classList.toggle('reduced', on); }

function startFx() {
  const fx = $('#fx'), fg = fx.getContext('2d');
  let parts = [];
  function fxResize() { fx.width = innerWidth * Math.min(devicePixelRatio, 2); fx.height = innerHeight * Math.min(devicePixelRatio, 2); }
  fxResize(); addEventListener('resize', fxResize);
  function spawnPart(init) {
    const em = fxState.mode === 'embers';
    return { x: Math.random() * fx.width, y: init ? Math.random() * fx.height : fx.height + 10, r: (em ? 1 + Math.random() * 2.2 : .8 + Math.random() * 1.5) * devicePixelRatio,
      vx: (Math.random() - .5) * .4, vy: -(em ? .5 + Math.random() * 1.4 : .15 + Math.random() * .3), life: Math.random() * 6.28, hue: em ? 18 + Math.random() * 25 : 45 };
  }
  const glowSprite = (hue, light) => {
    const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, `hsla(${hue},100%,${light + 25}%,1)`); r.addColorStop(.25, `hsla(${hue},100%,${light}%,.8)`); r.addColorStop(1, `hsla(${hue},100%,50%,0)`);
    g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c;
  };
  const sprites = { embers: [18, 28, 38].map(h => glowSprite(h, 58)), dust: [glowSprite(45, 80)] };
  function fxLoop() {
    requestAnimationFrame(fxLoop);
    const fxMode = fxState.mode;
    if (fxState.paused || fxMode === 'off') { if (parts.length) { parts = []; fg.clearRect(0, 0, fx.width, fx.height); } return; }
    const target = body.classList.contains('reduced') ? 12 : fxMode === 'embers' ? 110 : 45;
    while (parts.length < target) parts.push(spawnPart(parts.length < target / 2));
    if (parts.length > target) parts.length = target;
    fg.clearRect(0, 0, fx.width, fx.height);
    fg.globalCompositeOperation = 'lighter'; fg.globalAlpha = 1;
    for (const p of parts) {
      p.life += .03; p.x += p.vx + Math.sin(p.life) * .5; p.y += p.vy;
      if (p.y < -20) Object.assign(p, spawnPart(false));
      fg.globalAlpha = Math.max(0, (fxMode === 'embers' ? .6 : .3) + Math.sin(p.life * 3) * .3);
      const sp = sprites[fxMode] ?? sprites.dust, img = sp[Math.floor(p.hue) % sp.length], d = p.r * 7;
      fg.drawImage(img, p.x - d / 2, p.y - d / 2, d, d);
    }
  }
  fxLoop();
}
