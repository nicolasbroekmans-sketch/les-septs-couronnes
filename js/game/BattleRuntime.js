// Grande bataille : deux armées (~100 à 200 soldats), ordres du héros (1 charger, 2 tenir, 3 suivre),
// moral et déroute, victoire ou défaite, récompenses et pertes appliquées à l'armée du joueur.
// Prologue : victoire garantie (le héros ne descend pas sous 30 % de vie, l'ennemi finit par rompre).
import { BATTLES } from '../data/battles.js';
import { UNITS } from '../data/units.js';
import { Soldier } from './Soldier.js';
import { SoldierBrain } from '../ai/SoldierBrain.js';
import { CrowdRenderer } from '../engine/CrowdRenderer.js';
import { army, applyLosses } from '../player/Army.js';
import { audio } from '../audio.js';
import { Dragon } from './Dragon.js';

export class BattleRuntime {
  constructor(G, id) {
    Object.assign(this, { G, id, def: BATTLES[id], soldiers: [], order: 'hold', started: false, ended: false, t: 0, routed: { A: false, B: false }, losses: {} });
    this.crowd = new CrowdRenderer(G.scene, 330);
    const yAt = (x, z) => G.physics.groundAt(x, z, G.physics.groundFn(x, z) + 1);
    const add = (u, team, x, z, owner, slotOff) => {
      const s = new Soldier(u, team, x, yAt(x, z), z, team === 'A' ? 0 : Math.PI, owner);
      if (team === 'B' && this.def.enemyHp) s.fighter.hp = s.fighter.maxHp = Math.round(s.fighter.maxHp * this.def.enemyHp);
      s.brain = new SoldierBrain(s, this); s.brain.slot = { x, z }; s.brain.offset = slotOff;
      s.hostileTo = o => G.hostile(s, o);
      this.soldiers.push(s); G.actors.push(s);
    };
    const line = (units, team, z0, dir, owner) => {
      let i = 0, c = 0;
      for (const [u, n] of Object.entries(units)) for (let k = 0; k < n; k++) {
        if (UNITS[u].mounted) { const side = c % 2 ? 1 : -1, r = Math.floor(c++ / 2); add(u, team, side * (24 + (r % 3) * 2.6), z0 + dir * (Math.floor(r / 3) * 3.2 + 2), owner, { x: side * 8, z: 6 }); continue; }
        const row = Math.floor(i / 18), col = i % 18, x = (col - 8.5) * 2.1 + (Math.random() - .5) * .6, z = z0 + dir * (row * 2.4 + (u === 'archer' ? 7 : 0));
        add(u, team, x, z, owner, { x: (col - 8.5) * 1.6, z: 4 + row * 2 }); i++;
      }
    };
    line(army(G.core.state.player).troops, 'A', 30, 1, 'player');
    line(this.def.allies.units, 'A', 20, 1, 'allies');
    line(this.def.enemy.units, 'B', -60, -1, 'enemy');
    this.total = { A: this.count('A'), B: this.count('B') };
    if (this.def.dragon) { this.dragon = new Dragon(G, this); this.ballistas(); setTimeout(() => G.ui.toast('UN DRAGON ! Tant qu’il vole, l’ennemi ne fuira pas. Courez aux trois scorpions derrière vos lignes (E) et tirez quand il pique bas. Esquivez son feu avec V.', 'warn'), 2500); }
    G.ui.battleHud?.(this); G.ui.tutorial?.show('battle');
    G.ui.toast(`${this.def.name} — ${this.total.A} alliés contre ${this.total.B} ennemis. Touches : 1 charger · 2 tenir · 3 me suivre.`, 'quest');
    this.startT = this.def.prologue ? 8 : 12;
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
    if (!this.started && this.t > this.startT) { this.started = true; audio.sfx('raven', .6, .6); this.G.ui.toast('L’ennemi avance ! Ses archers tirent — chargez (1) ou tenez (2) !', 'warn'); }
    for (const k of ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3']) if (this.G.input.hit(k)) this.orderKey(k);
    if (this.def.prologue) this.protect();
    this.crowd.update(this.soldiers, dt);
    const a = this.count('A'), b = this.count('B');
    const dragonUp = this.dragon?.alive; this.dragon?.update(dt); for (const k of [0, 1, 2]) this.cool && (this.cool[k] -= dt);
    if (!this.routed.B && !dragonUp && b <= this.total.B * (this.dragon ? .6 : .3)) { this.routed.B = true; this.G.ui.toast('L’ennemi est en déroute !', 'quest-done'); }
    if (!this.routed.A && !this.def.prologue && a <= this.total.A * .25) { this.routed.A = true; this.G.ui.toast('Vos lignes cèdent !', 'warn'); }
    this.G.ui.battleHud?.(this, a, b);
    if (b === 0 || (this.routed.B && !dragonUp && b <= this.total.B * .12)) this.finish(true);
    else if (!this.def.prologue && (!this.G.player.alive || a <= 1)) this.finish(false);
  }
  /** Prologue : héros protégé, et après 3 minutes l'ennemi rompt quoi qu'il arrive. */
  protect() {
    const f = this.G.player.fighter; f.hp = Math.max(f.hp, f.maxHp * .3);
    if (this.t > 180 && !this.routed.B) { this.routed.B = true; this.G.ui.toast('Les cors sonnent la retraite ennemie : ils fuient !', 'quest-done'); }
  }
  onDeath(s) { if (s.owner === 'player') this.losses[s.unit] = (this.losses[s.unit] ?? 0) + 1; }
  escaped(s) { s.fled = true; s.fighter.go('dead'); s.deadT = 99; }
  finish(win) {
    if (this.ended) return; this.ended = true; this.won = win;
    if (!this.def.prologue) {
      applyLosses(this.G.core.state.player, this.losses);
      if (win) this.G.core.effects(this.def.reward, { source: this.id });
    }
    this.G.core.bus.emit('battle:ended', { id: this.id, win, losses: this.losses });
    audio.sfx('chime', .7, .8);
    this.G.ui.battleResult?.(this, win);
  }
  /** Trois scorpions derrière les lignes alliées : E pour tirer un carreau géant sur le dragon. */
  ballistas() {
    const G = this.G, ctx = G.ctx, wood = ctx.mat('weathered_planks', { uv: 2, color: '#6a4a2a' }), iron = ctx.mat(null, { color: '#3a3a3e', metal: .8, rough: .4 });
    this.cool = [0, 0, 0]; this.spots = [[-26, 46], [0, 50], [26, 46]];
    this.spots.forEach(([x, z], i) => {
      const y = G.physics.groundFn(x, z); ctx.box(1.6, 1, 2.4, x, y, z, wood); ctx.box(4.2, .25, .3, x, y + 1.6, z - .6, wood, { solid: false }); ctx.box(.3, .3, 3, x, y + 1.3, z - .3, iron, { solid: false });
      G.region.def.objects.push({ id: 'scorpion' + i, x, z, r: 2, label: 'Tirer au scorpion sur le dragon', effects: [{ ballista: i }] });
    });
  }
  fireBallista(i) {
    const d = this.dragon, G = this.G; if (!d) return;
    if (!d.alive) return G.ui.toast('Le dragon est à terre. Achevez l’ennemi !', 'info');
    if (this.cool[i] > 0) return G.ui.toast(`Le scorpion se recharge… (${Math.ceil(this.cool[i])} s)`, 'info');
    this.cool[i] = 6; audio.sfx('whoosh', .8, .5);
    const [x, z] = this.spots[i], dist = Math.hypot(d.pos.x - x, d.pos.z - z);
    if (dist > 95) return G.ui.toast('Trop loin ! Attendez que le dragon pique vers vous.', 'warn');
    const hit = Math.random() < (d.low ? .85 : .4);
    if (hit) { d.hurt(380); G.ui.toast(`Carreau en plein vol ! Le dragon rugit (${Math.round(d.hp / 24)} % de vie).`, 'quest'); } else G.ui.toast('Manqué ! Visez quand il pique bas.', 'warn');
  }
  dispose() { this.crowd.dispose(); this.dragon?.dispose(); }
}
