// Contrôle du personnage joueur à la troisième personne : déplacement relatif à la caméra, course,
// furtivité, esquive, attaques légère/lourde (clic court/maintenu), parade (clic droit), tir, soin rapide.
import { consume } from '../player/Inventory.js';
import { derive } from '../player/Stats.js';
import { dist, angleTo } from '../combat/CombatSystem.js';

const HEAVY_HOLD = .32;

export class PlayerController {
  constructor(game) { this.game = game; this.holdT = -1; this.dodgeDir = { x: 0, z: 0 }; this.sneak = false; }
  /** Anti-blocage : retour au dernier point sûr si l'on tombe (eau, trou) ; dégagement si coincé dans un décor. */
  safety(dt) {
    const G = this.game, A = G.player, P = G.physics, p = A.pos, killY = G.env.cfg.killY ?? -40;
    if (A.onGround && p.y > killY + 2 && !P.solidAt(p.x, p.y + 1, p.z) && (this.safeT = (this.safeT ?? 0) + dt) > .5) { this.safeT = 0; this.safe = { x: p.x, y: p.y, z: p.z }; }
    const fell = p.y < killY || p.y < P.groundFn(p.x, p.z) - 6;
    if (fell && this.safe) { Object.assign(p, this.safe); A.vy = 0; G.ui.toast('Vous remontez sur la terre ferme.', 'info'); return; }
    if (!P.solidAt(p.x, p.y + 1, p.z)) return;
    for (let r = .8; r < 12; r += .6) for (let a = 0; a < 6.28; a += .4) {
      const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r, y = P.groundAt(x, z, p.y + 1.5);
      if (!P.solidAt(x, y + 1, z) && Math.abs(y - p.y) < 3) { p.x = x; p.z = z; p.y = y; return; }
    }
  }
  update(dt) {
    const G = this.game, I = G.input, A = G.player, f = A.fighter, rig = G.rig;
    rig.input(I.dx, I.dy, I.wheel);
    if (!A.alive) return;
    if (G.boats?.active) return G.boats.drive(dt);
    const st = G.core.state.player, d = derive(st);
    // déplacement relatif à la caméra
    let mx = (I.down('KeyD', 'ArrowRight') ? 1 : 0) - (I.down('KeyA', 'ArrowLeft') ? 1 : 0);
    let mz = (I.down('KeyS', 'ArrowDown') ? 1 : 0) - (I.down('KeyW', 'ArrowUp') ? 1 : 0) - (I.touch.move ? 1 : 0);
    const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    const s = Math.sin(rig.yaw), c = Math.cos(rig.yaw), wx = mx * c + mz * s, wz = -mx * s + mz * c;
    if (I.hit('KeyC')) this.sneak = !this.sneak;
    const run = I.down('ShiftLeft', 'ShiftRight') && f.stamina > 5 && len > 0 && !this.sneak;
    if (run) { f.stamina -= 9 * dt; f.regenDelay = .4; }
    let speed = (run ? 7.4 : this.sneak ? 2.2 : 4.2) * d.moveSpeed;
    if (f.blocking) speed *= .45; if (f.attacking) speed *= .25; if (f.state === 'recover' || f.state === 'stagger') speed *= .3;
    if (I.hit('Space') && A.onGround && f.state !== 'dodge') { A.vy = 7.2; A.onGround = false; f.stamina = Math.max(0, f.stamina - 4); }
    if (I.hit('KeyV', 'AltLeft', 'AltRight') && f.dodge()) { this.dodgeDir = len > 0 ? { x: wx, z: wz } : { x: Math.sin(A.yaw), z: Math.cos(A.yaw) }; }
    let vx = wx * speed, vz = wz * speed;
    if (f.state === 'dodge') { const k = f.t < .35 ? 8 : 2; vx = this.dodgeDir.x * k; vz = this.dodgeDir.z * k; }
    A.move(vx * dt, vz * dt, dt, G.physics);
    this.safety(dt);
    A.sneaking = this.sneak; A.aiming = f.weapon.ranged && (this.holdT >= 0 || f.attacking); A.pitch = rig.pitch; A.drawK = f.weapon.ranged && this.holdT >= 0 ? Math.min(1, this.holdT / .6) : 0;
    // combat
    const ui = G.ui.modal;
    if (!ui && (I.locked || G.testMode)) {
      if (I.clicked.has(0)) this.holdT = 0;
      if (this.holdT >= 0) {
        this.holdT += dt;
        const release = I.released.has(0);
        if (f.weapon.ranged) { if (release) { f.attack(false); this.holdT = -1; } }
        else if (this.holdT >= HEAVY_HOLD) { f.attack(true); this.holdT = -1; }
        else if (release) { f.attack(false); this.holdT = -1; }
      }
      f.block(I.buttons.has(2));
      if (I.hit('KeyH')) this.heal(st);
    }
    // orientation : vers la cible proche en combat, sinon vers la caméra (visée) ou le mouvement
    const engaged = f.attacking || f.blocking || A.aiming;
    if (engaged) {
      const t = this.softTarget();
      A.turnTo(t ? Math.atan2(-(t.pos.x - A.pos.x), -(t.pos.z - A.pos.z)) : rig.yaw, dt, 16);
    } else if (len > 0 && f.state !== 'dodge') A.turnTo(Math.atan2(-wx, -wz), dt, 10);
    st.hp = f.hp; st.stamina = f.stamina;
  }
  softTarget() {
    const G = this.game, A = G.player;
    if (A.fighter.weapon.ranged) return null;
    let best = null, bd = 4.5;
    for (const o of G.actors) {
      if (o === A || !o.alive || !G.hostile(A, o)) continue;
      const d = dist(A.pos, o.pos); if (d < bd && angleTo(A.pos, G.rig.yaw, o.pos) < 1.2) { bd = d; best = o; }
    }
    return best;
  }
  heal(st) {
    const f = this.game.player.fighter, v = { hp: f.hp, maxHp: f.maxHp, stamina: f.stamina, maxStamina: f.maxStamina };
    const id = ['onguent', 'ration'].find(i => st.inventory.some(s => s.id === i));
    if (!id || f.hp >= f.maxHp) return this.game.ui.toast(id ? 'Vous êtes déjà en pleine santé.' : 'Aucun soin dans votre sac.', 'warn');
    consume(st, id, v, this.game.core.bus); f.hp = v.hp; f.stamina = v.stamina;
    this.game.ui.toast(`Vous utilisez : ${id === 'onguent' ? 'Onguent du mestre' : 'Ration de voyage'}.`, 'info');
  }
}
