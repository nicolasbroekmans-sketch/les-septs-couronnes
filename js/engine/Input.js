// Entrées : clavier (positions physiques → ZQSD et WASD), souris (capture du pointeur), molette, tactile minimal.
export class Input {
  constructor(canvas) {
    this.canvas = canvas; this.keys = new Set(); this.pressed = new Set(); this.buttons = new Set(); this.clicked = new Set(); this.released = new Set();
    this.dx = 0; this.dy = 0; this.wheel = 0; this.enabled = false; this.sensitivity = 1; this.invertY = false;
    this.touch = { look: null, move: false };
    addEventListener('keydown', e => {
      if (!this.enabled || e.target.closest?.('input, textarea')) return;
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => { this.keys.clear(); this.buttons.clear(); });
    canvas.addEventListener('mousedown', e => { if (!this.enabled) return; if (!this.locked) this.lock(); else { this.buttons.add(e.button); this.clicked.add(e.button); } });
    addEventListener('mouseup', e => { if (this.buttons.delete(e.button)) this.released.add(e.button); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('mousemove', e => { if (this.locked) { this.dx += e.movementX * this.sensitivity; this.dy += e.movementY * this.sensitivity * (this.invertY ? -1 : 1); } });
    canvas.addEventListener('wheel', e => { this.wheel += Math.sign(e.deltaY); }, { passive: true });
    document.addEventListener('pointerlockchange', () => this.onLock?.(this.locked));
    canvas.addEventListener('touchstart', e => { const t = e.touches[0]; this.touch.look = [t.clientX, t.clientY]; this.touch.move = e.touches.length > 1; }, { passive: true });
    canvas.addEventListener('touchmove', e => { const t = e.touches[0], l = this.touch.look; if (l) { this.dx += (t.clientX - l[0]) * 1.5; this.dy += (t.clientY - l[1]) * 1.5; this.touch.look = [t.clientX, t.clientY]; } this.touch.move = e.touches.length > 1; }, { passive: true });
    canvas.addEventListener('touchend', e => { this.touch.move = e.touches.length > 1; if (!e.touches.length) this.touch.look = null; });
  }
  get locked() { return document.pointerLockElement === this.canvas; }
  lock() { this.canvas.requestPointerLock?.()?.catch?.(() => {}); }
  unlock() { if (this.locked) document.exitPointerLock(); }
  down(...codes) { return codes.some(c => this.keys.has(c)); }
  hit(code) { return this.pressed.has(code); }
  /** À appeler en fin d'image : vide les événements ponctuels. */
  endFrame() { this.pressed.clear(); this.clicked.clear(); this.released.clear(); this.dx = this.dy = 0; this.wheel = 0; }
  reset() { this.keys.clear(); this.buttons.clear(); this.endFrame(); }
}
