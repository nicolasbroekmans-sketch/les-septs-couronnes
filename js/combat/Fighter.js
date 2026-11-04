// Machine à états de combat partagée par le joueur et les PNJ.
// États : idle → windup → active (fenêtre de coup) → recover ; block ; dodge ; stagger ; dead.
export class Fighter {
  constructor({ maxHp, maxStamina, hp, stamina, weapon, stats }) {
    Object.assign(this, { maxHp, maxStamina, weapon, stats });
    this.hp = hp ?? maxHp; this.stamina = stamina ?? maxStamina;
    this.state = 'idle'; this.t = 0; this.heavy = false; this.blockT = 0; this.hitIds = new Set();
    this.regenDelay = 0; this.events = [];
  }
  get alive() { return this.state !== 'dead'; }
  get busy() { return ['windup', 'active', 'recover', 'dodge', 'stagger', 'dead'].includes(this.state); }
  get blocking() { return this.state === 'block'; }
  get parrying() { return this.state === 'block' && this.blockT < (this.stats.parryWindow ?? .18); }
  get invulnerable() { return this.state === 'dodge' && this.t > .06 && this.t < .36; }
  get attacking() { return this.state === 'windup' || this.state === 'active'; }
  cost(heavy) { return (this.weapon.stamina ?? 10) * (heavy ? 1.7 : 1); }

  attack(heavy = false) {
    if (this.busy && this.state !== 'block') return false;
    if (this.stamina < this.cost(heavy) * .5) return false;
    this.stamina -= this.cost(heavy); this.regenDelay = .8;
    this.heavy = heavy; this.hitIds.clear();
    this.go('windup');
    return true;
  }
  block(on) {
    if (on && !this.busy && this.state !== 'block' && this.stamina > 5) { this.go('block'); this.blockT = 0; }
    if (!on && this.state === 'block') this.go('idle');
  }
  dodge() {
    if ((this.busy && this.state !== 'block') || this.stamina < (this.stats.dodgeCost ?? 20)) return false;
    this.stamina -= this.stats.dodgeCost ?? 20; this.regenDelay = .6;
    this.go('dodge'); return true;
  }
  stagger(dur = .6) { if (this.alive) { this.go('stagger'); this.dur = dur; } }
  go(state) { this.state = state; this.t = 0; this.events.push(state); }

  phase() { // durées de la phase en cours, accélérées par la vitesse d'attaque
    const w = this.weapon, s = 1 / (this.stats.attackSpeed ?? 1), h = this.heavy ? 1.6 : 1;
    return { windup: w.windup * s * h, active: w.active, recover: w.recover * s * (this.heavy ? 1.3 : 1), dodge: .45, stagger: this.dur ?? .6 }[this.state];
  }

  /** Applique des dégâts déjà calculés. Renvoie true si le coup est fatal. */
  takeHit(res) {
    if (!this.alive) return false;
    if (res.parried) return false;
    this.stamina = Math.max(0, this.stamina - (res.staminaDrain ?? 0));
    if (res.guardBreak || (res.blocked && this.stamina <= 0)) this.stagger(.7);
    this.hp = Math.max(0, this.hp - res.amount);
    if (this.hp <= 0) { this.go('dead'); return true; }
    if (!res.blocked && res.amount > this.maxHp * .18 && this.state !== 'dodge') this.stagger(.35);
    return false;
  }

  update(dt) {
    this.events.length = 0;
    if (!this.alive) return this.events;
    this.t += dt;
    if (this.state === 'block') { this.blockT += dt; this.stamina = Math.max(0, this.stamina - 3 * dt); if (this.stamina <= 0) this.go('idle'); }
    const d = this.phase();
    if (d !== undefined && this.t >= d) {
      const next = { windup: 'active', active: 'recover', recover: 'idle', dodge: 'idle', stagger: 'idle' }[this.state];
      this.go(next);
    }
    this.regenDelay -= dt;
    if (this.regenDelay <= 0 && !this.attacking && this.state !== 'block') this.stamina = Math.min(this.maxStamina, this.stamina + (this.stats.staminaRegen ?? 15) * dt);
    return this.events;
  }
}
