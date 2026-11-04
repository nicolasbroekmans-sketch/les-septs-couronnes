// Bot de test injecté dans la page : il joue avec les MÊMES entrées qu'un joueur (touches, clics,
// orientation de la caméra) — il n'appelle jamais directement le combat ni les quêtes.
// Pour contourner les obstacles, il s'appuie sur la grille de navigation A* du jeu (comme les PNJ).
window.__bot = {
  goal: null, mode: 'idle', log: [], path: null, pathT: 0,
  steer(G, x, z) {
    const P = G.player.pos, now = performance.now();
    if (G.nav.clear(P, { x, z })) { this.path = null; return { x, z }; }
    if (!this.path || now - this.pathT > 1500) { this.path = G.nav.find(P, { x, z }); this.pathT = now; this.path?.shift(); }
    while (this.path?.length > 1 && Math.hypot(this.path[0].x - P.x, this.path[0].z - P.z) < 1) this.path.shift();
    return this.path?.[0] ?? { x, z };
  },
  tick() {
    const G = window.__game; if (!G?.running || !G.player) return;
    const I = G.input, P = G.player.pos, keys = I.keys;
    keys.delete('KeyW'); keys.delete('ShiftLeft');
    if (this.mode === 'walk' && this.goal) {
      const d = Math.hypot(this.goal.x - P.x, this.goal.z - P.z);
      if (d < (this.goal.r ?? 1.5)) { this.mode = 'idle'; return; }
      const w = this.steer(G, this.goal.x, this.goal.z);
      G.rig.yaw = Math.atan2(-(w.x - P.x), -(w.z - P.z)); keys.add('KeyW'); if (d > 6) keys.add('ShiftLeft');
    }
    if (this.mode === 'fight') {
      const foes = G.actors.filter(a => a !== G.player && a.alive && G.hostile(G.player, a) && a.brain?.state !== 'flee');
      const t = foes.sort((a, b) => Math.hypot(a.pos.x - P.x, a.pos.z - P.z) - Math.hypot(b.pos.x - P.x, b.pos.z - P.z))[0];
      if (!t) { this.mode = 'idle'; return; }
      const d = Math.hypot(t.pos.x - P.x, t.pos.z - P.z), f = G.player.fighter;
      if (d > 1.9) { const w = this.steer(G, t.pos.x, t.pos.z); G.rig.yaw = Math.atan2(-(w.x - P.x), -(w.z - P.z)); keys.add('KeyW'); if (d > 6) keys.add('ShiftLeft'); }
      else G.rig.yaw = Math.atan2(-(t.pos.x - P.x), -(t.pos.z - P.z));
      if (f.hp < f.maxHp * .35 && G.core.state.player.inventory.some(s => s.id === 'onguent')) I.pressed.add('KeyH');
      if (t.fighter.attacking && d < 2.6 && f.stamina > 30 && Math.random() < .5) I.buttons.add(2); else I.buttons.delete(2);
      if (d < 2.3 && !f.busy && f.state !== 'block') { I.clicked.add(0); I.released.add(0); }
    }
  }
};
(function loop() { try { window.__bot.tick(); } catch (e) { window.__bot.log.push(String(e)); } requestAnimationFrame(loop); })();
