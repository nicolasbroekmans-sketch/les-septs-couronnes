// Mini-carte (nord en haut, centrée sur le joueur) et boussole avec repère d'objectif.
export class Minimap {
  constructor(canvas, strip) {
    this.cv = canvas; this.g = canvas.getContext('2d'); this.strip = strip; this.marks = [];
    for (let a = 0; a < 360; a += 15) { const s = document.createElement('span'); s.textContent = a % 45 ? '·' : ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][a / 45]; if (a % 90 === 0) s.className = 'c'; strip.append(s); this.marks.push({ s, a }); }
    this.goal = document.createElement('b'); this.goal.className = 'goal'; this.goal.textContent = '◆'; strip.append(this.goal);
  }
  /** Fond statique : collisions et eau de la région. */
  bake(physics, mapMarks, bounds) {
    const b = bounds, s = 1024 / Math.max(b[2] - b[0], b[3] - b[1]);
    const cv = document.createElement('canvas'); cv.width = (b[2] - b[0]) * s; cv.height = (b[3] - b[1]) * s;
    const g = cv.getContext('2d');
    for (const w of mapMarks) { g.fillStyle = w.color; g.fillRect((w.minX - b[0]) * s, (w.minZ - b[1]) * s, (w.maxX - w.minX) * s, (w.maxZ - w.minZ) * s); }
    for (const c of physics.all()) {
      if (c.noMap || c.dynamic) continue;
      const hgt = c.maxY - c.minY;
      g.fillStyle = hgt > 6 ? 'rgba(43,33,22,.9)' : hgt > 1.2 ? 'rgba(90,64,38,.75)' : 'rgba(120,96,60,.35)';
      g.fillRect((c.minX - b[0]) * s, (c.minZ - b[1]) * s, Math.max(1, (c.maxX - c.minX) * s), Math.max(1, (c.maxZ - c.minZ) * s));
    }
    this.base = { cv, s, x0: b[0], z0: b[1] };
  }
  draw(G, targets, camYaw) {
    const m = this.base; if (!m) return;
    const g = this.g, S = this.cv.width, Z = 2.4, P = G.player.pos, tx = x => (x - m.x0) * m.s, tz = z => (z - m.z0) * m.s;
    g.clearRect(0, 0, S, S); g.save(); g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, 7); g.clip();
    g.fillStyle = '#d9c9a0'; g.fillRect(0, 0, S, S);
    g.translate(S / 2, S / 2); g.scale(Z, Z); g.translate(-tx(P.x), -tz(P.z));
    g.drawImage(m.cv, 0, 0);
    for (const a of G.actors) {
      if (a.kind === 'player' || a.hidden || Math.hypot(a.pos.x - P.x, a.pos.z - P.z) > 70) continue;
      g.fillStyle = !a.alive ? '#6a6a6a' : G.hostile(a, G.player) ? '#b0201a' : a.def.merchant ? '#2a6a8a' : '#3b2a14';
      g.beginPath(); g.arc(tx(a.pos.x), tz(a.pos.z), 3.2 / Z, 0, 7); g.fill();
    }
    g.fillStyle = '#c9a227'; g.strokeStyle = '#3b2a14'; g.lineWidth = 1.2 / Z;
    for (const t of targets) { g.save(); g.translate(tx(t.x), tz(t.z)); g.rotate(Math.PI / 4); g.fillRect(-5 / Z, -5 / Z, 10 / Z, 10 / Z); g.strokeRect(-5 / Z, -5 / Z, 10 / Z, 10 / Z); g.restore(); }
    g.restore();
    g.save(); g.translate(S / 2, S / 2); g.rotate(-G.player.yaw);
    g.fillStyle = '#8b0000'; g.strokeStyle = '#f1dc94'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, -14); g.lineTo(9, 10); g.lineTo(0, 5); g.lineTo(-9, 10); g.closePath(); g.fill(); g.stroke(); g.restore();
    // boussole
    const heading = ((-camYaw * 180 / Math.PI) % 360 + 360) % 360, ppd = 2.6, rel = a => ((a - heading + 540) % 360) - 180;
    for (const { s, a } of this.marks) { const d = rel(a); s.style.left = `${d * ppd}px`; s.style.opacity = Math.abs(d) > 75 ? 0 : 1; }
    const t = targets[0];
    if (t) { const a = (Math.atan2(t.x - P.x, -(t.z - P.z)) * 180 / Math.PI + 360) % 360, d = rel(a); this.goal.style.left = `${Math.max(-70, Math.min(70, d)) * ppd}px`; this.goal.style.opacity = 1; }
    else this.goal.style.opacity = 0;
  }
}
