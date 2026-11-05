// Grande bataille : deux armées (~100 soldats), ordres du héros (1 charger, 2 tenir, 3 suivre),
// moral et déroute, victoire ou défaite, récompenses et pertes appliquées à l'armée du joueur.
import { BATTLES } from '../data/battles.js';
import { Soldier } from './Soldier.js';
import { SoldierBrain } from '../ai/SoldierBrain.js';
import { CrowdRenderer } from '../engine/CrowdRenderer.js';
import { army, applyLosses } from '../player/Army.js';
import { audio } from '../audio.js';

export class BattleRuntime {
  constructor(G, id) {
    Object.assign(this, { G, id, def: BATTLES[id], soldiers: [], order: 'hold', started: false, ended: false, t: 0, routed: { A: false, B: false }, losses: {} });
    this.crowd = new CrowdRenderer(G.scene, 170);
    const yAt = (x, z) => G.physics.groundAt(x, z, G.physics.groundFn(x, z) + 1);
    const line = (units, team, z0, dir, owner) => {
      let i = 0;
      for (const [u, n] of Object.entries(units)) for (let k = 0; k < n; k++, i++) {
        const row = Math.floor(i / 16), col = i % 16, x = (col - 7.5) * 2.2 + (Math.random() - .5) * .6, z = z0 + dir * (row * 2.4 + (u === 'archer' ? 6 : 0));
        const s = new Soldier(u, team, x, yAt(x, z), z, dir > 0 ? 0 : Math.PI, owner);
        s.brain = new SoldierBrain(s, this); s.brain.slot = { x, z }; s.brain.offset = { x: (col - 7.5) * 1.6, z: 4 + row * 2 };
        s.hostileTo = o => G.hostile(s, o);
        this.soldiers.push(s); G.actors.push(s);
      }
    };
    line(army(G.core.state.player).troops, 'A', 30, 1, 'player');
    line(this.def.allies.units, 'A', 20, 1, 'allies');
    line(this.def.enemy.units, 'B', -60, -1, 'enemy');
    this.total = { A: this.count('A'), B: this.count('B') };
    G.ui.battleHud?.(this); G.ui.tutorial?.show('battle');
    G.ui.toast(`${this.def.name} — ${this.total.A} alliés contre ${this.total.B} ennemis. Touches : 1 charger · 2 tenir · 3 me suivre.`, 'quest');
    setTimeout(() => { this.started = true; audio.sfx('raven', .6, .6); G.ui.toast('L’ennemi avance !', 'warn'); }, 12000);
  }
  count(team) { return this.soldiers.filter(s => s.team === team && s.alive && !s.fled).length + (team === 'A' && this.G.player.alive ? 1 : 0); }
  orderKey(code) {
    const o = { Digit1: 'charge', Numpad1: 'charge', Digit2: 'hold', Numpad2: 'hold', Digit3: 'follow', Numpad3: 'follow' }[code];
    if (!o) return;
    this.order = o; if (o === 'charge') this.started = true;
    this.G.ui.toast({ charge: 'Chargez !', hold: 'Tenez la position !', follow: 'Avec moi !' }[o], 'level');
    audio.sfx('anvil', .3, .6);
  }
  update(dt) {
    if (this.ended) return;
    this.t += dt;
    for (const k of ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3']) if (this.G.input.hit(k)) this.orderKey(k);
    this.crowd.update(this.soldiers, dt);
    const a = this.count('A'), b = this.count('B');
    if (!this.routed.B && b <= this.total.B * .3) { this.routed.B = true; this.G.ui.toast('L’ennemi est en déroute !', 'quest-done'); }
    if (!this.routed.A && a <= this.total.A * .25) { this.routed.A = true; this.G.ui.toast('Vos lignes cèdent !', 'warn'); }
    this.G.ui.battleHud?.(this, a, b);
    if (b === 0 || (this.routed.B && b <= this.total.B * .12)) this.finish(true);
    else if (!this.G.player.alive || a <= 1) this.finish(false);
  }
  onDeath(s) { if (s.owner === 'player') this.losses[s.unit] = (this.losses[s.unit] ?? 0) + 1; }
  escaped(s) { s.fled = true; s.fighter.go('dead'); s.deadT = 99; }
  finish(win) {
    if (this.ended) return; this.ended = true; this.won = win;
    const s = this.G.core.state; applyLosses(s.player, this.losses);
    if (win) this.G.core.effects(this.def.reward, { source: this.id });
    this.G.core.bus.emit('battle:ended', { id: this.id, win, losses: this.losses });
    this.G.ui.battleResult?.(this, win);
  }
  dispose() { this.crowd.dispose(); }
}
