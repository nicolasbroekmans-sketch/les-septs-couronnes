// Méthodes « monde » de Game : prologue, grandes batailles, voyages, portes. Mêlées à Game.prototype.
import { createGameState } from '../core/GameState.js';
import { GameCore } from './GameCore.js';
import { wireEvents } from './GameEvents.js';
import { ContractRuntime } from './ContractRuntime.js';
import { BattleRuntime } from './BattleRuntime.js';
import { BATTLES } from '../data/battles.js';
import { REGIONS } from '../data/regions/index.js';
import { derive } from '../player/Stats.js';
import { travelCost } from './Travel.js';
import { audio } from '../audio.js';

export class WorldMethods {
  /** Prologue : un écuyer anonyme dans une bataille de 200 soldats, gagnée d'avance. onDone() → création du personnage. */
  async prologue(onDone) {
    this.stop(); this.clearBattle();
    const state = createGameState({ name: 'Écuyer', sex: 'homme', age: 19, origin: 'couronne', classId: 'guerrier', difficulty: 'facile', appearance: { cloak: '#2a3a5a' } }, 'kingslanding', 7);
    state.explore = true; this.core = new GameCore(state); wireEvents(this); this.contracts = new ContractRuntime(this); this.onPrologueEnd = onDone;
    const b = BATTLES.prologue;
    REGIONS['battle:prologue'] ??= { id: 'battle:prologue', battle: 'prologue', scene: 'battlefield', placeId: 'prologue', name: b.name, region: 'Le Conflans', climate: 'tempere', lawFaction: null, prices: {}, intro: b.desc, npcs: [], groups: [], markers: [], objects: [], rumors: [] };
    await this.enterRegion('battle:prologue');
    this.battle = new BattleRuntime(this, 'prologue');
    this.run();
  }
  /** Grande bataille : champ dédié, retour au point de départ ensuite (victoire ou défaite). */
  async startBattle(id) {
    const b = BATTLES[id]; if (!b || this.battle) return;
    this.ui.closePanel(); this.persistPosition(); this.autosave();
    const rid = 'battle:' + id, p = this.core.state.player;
    REGIONS[rid] ??= { id: rid, battle: id, scene: 'battlefield', placeId: id, name: b.name, region: REGIONS[b.region].region, climate: b.theme === 'neige' ? 'nord' : 'tempere', lawFaction: null, prices: {}, intro: b.desc, npcs: [], groups: [], markers: [], objects: [], rumors: [] };
    this.returnTo = { region: p.region, pos: p.position };
    await this.enterRegion(rid);
    this.battle = new BattleRuntime(this, id);
  }
  async endBattle() {
    const b = this.battle; if (!b || this.leavingBattle) return;
    if (b.def.prologue) { this.clearBattle(); this.ui.battleHud(null); this.stop(); this.ui.showHud(false); return this.onPrologueEnd?.(); }
    this.leavingBattle = true; const back = this.returnTo, p = this.core.state.player;
    if (!b.won) p.hp = Math.max(p.hp, derive(p).maxHp * .4);
    this.clearBattle(); this.ui.battleHud(null);
    await this.enterRegion(back.region, back.pos); this.leavingBattle = false;
  }
  /** Voyage vers un autre lieu de la carte : coût en or et en temps selon la distance. */
  async travel(id) {
    const c = travelCost(this.core.state.player.region, id), p = this.core.state.player;
    if (this.battle || !REGIONS[id] || id === p.region) return false;
    if (p.gold < c.gold) { this.ui.toast(`Le voyage coûte ${c.gold} or (escorte, vivres, passage).`, 'warn'); return false; }
    p.gold -= c.gold; this.ui.closePanel(); this.persistPosition();
    const k = this.core.clock; k.advance(c.hours * 60, REGIONS[id].climate);
    if (k.isNight) k.advance(((32 - k.hour) % 24) * 60, REGIONS[id].climate); // on fait halte la nuit : arrivée au matin
    k.rollWeather(REGIONS[id].climate); p.position = null;
    await this.enterRegion(id);
    this.ui.toast(`Après ${c.hours} h de route, vous arrivez : ${REGIONS[id].name}.`, 'quest');
    return true;
  }
  /** Porte : on passe à l'intérieur (ou dehors), les compagnons suivent. */
  goThrough(door) {
    const P = this.player, t = door.to, f = this.physics;
    P.pos.x = t.x; P.pos.z = t.z; P.pos.y = f.groundAt(t.x, t.z, (t.y ?? f.groundFn(t.x, t.z)) + 2); P.vy = 0;
    if (t.yaw !== undefined) { P.yaw = t.yaw; this.rig.yaw = t.yaw; }
    for (const a of this.followers?.list ?? []) if (a.alive) { a.pos.x = t.x + a.brain.slot.x; a.pos.z = t.z + a.brain.slot.z; a.pos.y = P.pos.y; }
    this.ui.veilFlash?.(); audio.sfx('whoosh', .3, .6);
  }
  clearBattle() { this.battle?.dispose(); this.battle = null; }
}
