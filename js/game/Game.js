// Orchestrateur d'une partie : rendu, entrées, région courante, acteurs, sauvegardes, mort.
import { Renderer } from '../engine/Renderer.js';
import { Input } from '../engine/Input.js';
import { CameraRig } from '../engine/CameraRig.js';
import { loadScene } from '../engine/SceneLoader.js';
import { arrowMesh } from '../engine/Weapons3D.js';
import { NavGrid } from '../ai/Pathfinding.js';
import { GameCore } from './GameCore.js';
import { Actor } from './Actor.js';
import { RegionRuntime } from './RegionRuntime.js';
import { WorldMarkers } from './WorldMarkers.js';
import { CombatDirector } from './CombatDirector.js';
import { Interaction } from './Interaction.js';
import { PlayerController } from './PlayerController.js';
import { makeHostility } from './Hostility.js';
import { makeWorld, onDeath, crime } from './WorldRules.js';
import { wireEvents } from './GameEvents.js';
import { frame } from './GameLoop.js';
import { REGIONS } from '../data/regions/index.js';
import { FACTIONS } from '../data/factions.js';
import { derive } from '../player/Stats.js';
import { SaveManager } from '../core/SaveManager.js';
import { createRng } from '../core/Random.js';
import { createGameState } from '../core/GameState.js';
import { audio } from '../audio.js';
import { Humanoid } from '../engine/Humanoid.js';
import { lookFromCosmetics } from '../player/Rewards.js';
import { Followers } from './Followers.js';
import { BattleRuntime } from './BattleRuntime.js';
import { BATTLES } from '../data/battles.js';
import { pardon } from '../factions/Reputation.js';

export class Game {
  constructor(ui, settings, storage) {
    this.ui = ui; this.settings = settings;
    this.renderer = new Renderer(document.getElementById('three'), settings.quality);
    this.input = new Input(this.renderer.canvas); this.rig = new CameraRig(this.renderer.camera);
    this.saves = new SaveManager(storage); this.rng = createRng(Date.now() % 1e9);
    this.hostile = makeHostility(this); this.world = makeWorld(this);
    this.actors = []; this.combat = new CombatDirector(this); this.interaction = new Interaction(this); this.controller = new PlayerController(this);
    this.input.onLock = locked => this.ui.lockHint(!locked && !this.ui.modal && this.running);
    this.applySettings(settings);
  }
  applySettings(s) {
    this.settings = s; this.input.sensitivity = s.sensitivity ?? 1; this.input.invertY = !!s.invertY;
    this.renderer.camera.fov = s.fov ?? 70; this.renderer.camera.updateProjectionMatrix();
    if (s.quality !== this.renderer.quality) this.renderer.setQuality(s.quality);
  }
  get scene() { return this.env?.scene; }
  get physics() { return this.env.physics; }

  /** Démarre (ou reprend) une partie à partir d'un état complet. */
  async start(state) {
    this.stop(); this.clearBattle();
    this.core = new GameCore(state); wireEvents(this); this.ui.startTutorial(this);
    await this.enterRegion(state.player.region, state.player.position);
    this.run();
  }
  run() {
    this.running = true; this.input.enabled = true; this.lastT = performance.now(); this.autoT = 0;
    this.renderer.renderer.setAnimationLoop(() => { const now = performance.now(), dt = Math.min(.05, (now - this.lastT) / 1000); this.lastT = now; if (!this.loadingRegion) frame(this, dt); });
    this.ui.showHud(true); this.ui.lockHint(true);
  }
  /** Prologue : un écuyer anonyme dans une bataille de 200 soldats, gagnée d'avance. onDone() → création du personnage. */
  async prologue(onDone) {
    this.stop(); this.clearBattle();
    const state = createGameState({ name: 'Écuyer', sex: 'homme', age: 19, origin: 'couronne', classId: 'guerrier', difficulty: 'facile', appearance: { cloak: '#2a3a5a' } }, 'kingslanding', 7);
    state.explore = true; this.core = new GameCore(state); wireEvents(this); this.onPrologueEnd = onDone;
    const b = BATTLES.prologue;
    REGIONS['battle:prologue'] ??= { id: 'battle:prologue', battle: 'prologue', scene: 'battlefield', placeId: 'prologue', name: b.name, region: 'Le Conflans', climate: 'tempere', lawFaction: null, prices: {}, intro: b.desc, npcs: [], groups: [], markers: [], objects: [], rumors: [] };
    await this.enterRegion('battle:prologue');
    this.battle = new BattleRuntime(this, 'prologue');
    this.run();
  }
  async enterRegion(id, position = null) {
    const def = REGIONS[id]; if (!def) throw new Error('Région inconnue : ' + id);
    this.ui.loading(0, def.name, def.intro); this.loadingRegion = true;
    this.region?.dispose(); this.combat.clear(); this.actors = [];
    if (this.env) this.renderer.dispose(this.env.scene);
    const { E, ctx } = await loadScene(this.renderer, def.scene, def.placeId ?? def.id, (v, t) => this.ui.loading(v, def.name, t), c => def.build?.(c));
    this.env = E; this.ctx = ctx; this.weatherFx = null;
    def.bounds ??= E.cfg.bounds ?? [-150, -150, 150, 150]; def.spawn ??= E.spawn;
    this.nav = new NavGrid(def.bounds, 1).bake(E.physics.all(), E.physics.groundFn, .45);
    const st = this.core.state, p = st.player;
    if (!def.battle) { p.region = id; if (!st.world.discovered.includes(id)) st.world.discovered.push(id); }
    const sp = position ?? [def.spawn.x, def.spawn.y, def.spawn.z];
    this.player = new Actor({ id: 'player', kind: 'player', name: p.name, faction: 'joueur', x: sp[0], z: sp[2], yaw: position ? p.yaw : def.spawn.yaw, stats: derive(p), weaponId: p.equipped.weapon, hp: p.hp, stamina: p.stamina, look: this.playerLook() });
    this.player.pos.y = E.physics.groundAt(sp[0], sp[2], sp[1] ?? E.physics.groundFn(sp[0], sp[2]) + 1);
    this.player.hostileTo = o => this.hostile(this.player, o);
    this.addActor(this.player); this.rig.yaw = this.player.yaw; this.player.lookKey = JSON.stringify(this.playerLook());
    this.region = new RegionRuntime(this, def); this.region.refresh();
    this.followers = new Followers(this); if (!def.battle && !st.explore) this.followers.spawn();
    this.markers = new WorldMarkers(this);
    this.setWeather(st.world.time.weather ?? this.core.clock.rollWeather(def.climate));
    this.ui.loading(.9, def.name, 'Compilation des shaders…');
    await this.renderer.renderer.compileAsync(E.scene, this.renderer.camera);
    audio.setAmbience(E.ambience);
    this.ui.loading(1, def.name); this.ui.regionTitle(def); this.loadingRegion = false;
    this.autosave();
  }
  playerLook() {
    const a = this.core.state.player.appearance, p = this.core.state.player, c = lookFromCosmetics(p);
    return { ...a, female: p.sex === 'femme', armor: p.equipped.armor, cloak: c.cloak ?? a.cloak, tunic: c.tunic ?? a.tunic, armorTint: c.armorTint };
  }
  refreshPlayerStats(heal = false) {
    const p = this.core.state.player, A = this.player; if (!A) return;
    const d = derive(p), f = A.fighter;
    A.stats = d; f.stats = d; f.maxHp = d.maxHp; f.maxStamina = d.maxStamina;
    if (heal) { f.hp = d.maxHp; f.stamina = d.maxStamina; }
    if (A.weaponId !== p.equipped.weapon) A.setWeapon(p.equipped.weapon);
    const lookKey = JSON.stringify(this.playerLook());
    if (A.lookKey !== lookKey) { // armure ou cosmétique : on reconstruit le modèle
      const m = A.model.root, parent = m.parent; A.lookKey = lookKey;
      parent?.remove(m); A.model = new Humanoid(this.playerLook()); A.model.setWeapon(f.weapon.cls, A.weaponId); parent?.add(A.model.root);
    }
    this.ui.refresh();
  }
  addActor(a) { this.actors.push(a); this.scene.add(a.model.root); }
  removeActor(a) { this.actors.splice(this.actors.indexOf(a), 1); a.dispose(); }
  distToPlayer(a) { const p = a.pos ?? a; return this.player ? Math.hypot(p.x - this.player.pos.x, p.z - this.player.pos.z) : 0; }
  arrowMesh() { return arrowMesh(); }
  onDeath(a, killer) { onDeath(this, a, killer); }
  crime(victim, type) { crime(this, victim, type); }
  factionName(f) { return FACTIONS[f]?.name ?? f; }
  trackQuest(id) { this.core.state.world.tracked = id; this.ui.refresh(); }

  openDialogue(actor) {
    actor.talking = true; this.input.unlock();
    const view = this.core.dialogue.open({ id: actor.id, name: actor.name, role: actor.def.role, faction: actor.faction, merchant: actor.def.merchant, barks: actor.def.barks, surrendered: actor.surrendered });
    this.ui.dialogue(view, i => this.core.dialogue.choose(i), () => { actor.talking = false; this.ui.lockHint(true); });
  }
  setWeather(w) {
    this.weatherFx?.removeFromParent(); this.weatherFx = null;
    const cfg = this.env.cfg, map = { rain: 'rain', snow: 'snow' };
    this.scene.fog.density = cfg.fog[1] * (w === 'fog' ? 2.2 : w === 'rain' || w === 'snow' ? 1.4 : 1);
    if (map[w] && !(cfg.hdri.includes('noon') && w === 'snow')) this.weatherFx = this.ctx.particles(map[w], { count: w === 'rain' ? 6000 : 3000 });
    this.ui.refresh();
  }
  autosave() { if (!this.core || this.battle || this.region?.def.battle || !this.player?.alive || this.core.state.explore) return; this.persistPosition(); this.saves.save('auto', this.core.state, 'Sauvegarde auto'); this.ui.saved?.(); }
  save(slot) { if (this.battle) { this.ui.toast('Impossible de sauvegarder pendant une bataille.', 'warn'); return false; } this.persistPosition(); return this.saves.save(slot, this.core.state, slot); }
  persistPosition() { const p = this.core.state.player, A = this.player; if (A) { p.position = [A.pos.x, A.pos.y, A.pos.z]; p.yaw = A.yaw; p.hp = A.fighter.hp; p.stamina = A.fighter.stamina; } }
  playerDied() { if (this.battle) return this.battle.finish(false); this.input.unlock(); this.ui.gameOver(); }
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
  clearBattle() { this.battle?.dispose(); this.battle = null; }
  async respawn() {
    const s = this.core.state; s.player.gold = Math.floor(s.player.gold * .8); s.player.hp = derive(s.player).maxHp; s.player.position = null;
    pardon(s); this.ui.toast('Vous reprenez connaissance. On vous a soigné ; les gardes ont passé l’éponge.', 'info');
    await this.enterRegion(s.player.region, null);
  }
  /** Mode découverte : un des 16 lieux, sans quêtes ni PNJ, avec un personnage prêt-à-jouer. */
  async explore(place) {
    const id = 'free:' + place.id;
    REGIONS[id] ??= { id, scene: place.scene, placeId: place.id, name: place.name, region: place.region, climate: 'tempere', lawFaction: 'guet', prices: {}, intro: place.mood, npcs: [], groups: [], markers: [], objects: [] };
    const state = createGameState({ name: 'Voyageur', sex: 'homme', age: 30, origin: 'couronne', classId: 'vagabond', difficulty: 'facile', appearance: { cloak: '#3a2a22' } }, 'kingslanding', 1);
    state.player.region = id; state.explore = true;
    await this.start(state);
  }
  pause(on) { this.paused = on; if (on) this.input.unlock(); }
  stop() { this.running = false; this.renderer.renderer.setAnimationLoop(null); this.input.enabled = false; this.input.unlock(); audio.stopAmbience(); }
}
