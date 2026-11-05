// Région en cours : fait apparaître/disparaître PNJ et groupes selon l'état du monde, gère marqueurs,
// objets interactifs et butin. Les conditions sont déclaratives (core/Conditions.js).
import { check } from '../core/Conditions.js';
import { Actor } from './Actor.js';
import { NPCBrain } from '../ai/NPCBrain.js';
import { npcStats } from '../combat/DamageSystem.js';
import { ITEMS } from '../data/items.js';
import { npcRecord } from '../ai/Memory.js';

const ROLES = { merchant: 'Marchand', guard: 'Garde', quest: 'A besoin d\u2019aide', priest: 'Religieux', beggar: 'Mendiant', recruiter: 'Recruteur', captain: 'Capitaine de guerre', faceless: '???' };

export class RegionRuntime {
  constructor(game, def) {
    this.game = game; this.def = def; this.actors = new Map(); this.inside = new Set(); this.loot = []; this.leaving = new Set();
    const refresh = () => this.refresh(), bus = game.core.bus;
    this.unsub = ['quest:updated', 'quest:completed', 'quest:started', 'world:flag', 'npc:flag'].map(ev => bus.on(ev, refresh));
    this.unsub.push(bus.on('group:pacified', ({ group }) => { game.core.state.world.flags['pacified:' + group] = true; this.dismiss(group); }));
  }
  get state() { return this.game.core.state; }
  stance(groupId) {
    if (!groupId) return null;
    if (this.state.world.flags['pacified:' + groupId]) return 'pacified';
    if (this.state.world.flags['provoked:' + groupId]) return 'hostile';
    const g = this.def.groups.find(x => x.id === groupId); if (!g) return null;
    if (typeof g.stance === 'string') return g.stance;
    return g.stance.find(s => check(s.when, this.state))?.value ?? 'hostile';
  }
  /** Liste des définitions de PNJ qui devraient être présents maintenant. */
  wanted() {
    const s = this.state, out = [];
    for (const n of this.def.npcs) if (check(n.when, s) && npcRecord(s, n.id).alive && !this.state.npcs[n.id]?.flags.gone) out.push(n);
    for (const g of this.def.groups) {
      if (!check(g.when, s) || s.world.flags['pacified:' + g.id]) continue;
      for (const m of g.members) { const r = npcRecord(s, m.id); if (r.alive && !r.flags.spared && !r.flags.gone) out.push({ ...m, faction: g.faction, group: g.id, role: 'enemy', ai: { canSurrender: g.canSurrender, ...m.ai }, loot: g.loot }); }
    }
    return out;
  }
  spawn(n) {
    const armor = ITEMS[n.armor]?.armor ?? 0, stats = { ...npcStats({ hp: n.hp ?? 60, force: n.force ?? 5, armor }), moveSpeed: ITEMS[n.armor]?.speed ?? 1 };
    const y = this.game.physics.groundAt(n.x, n.z, this.game.physics.groundFn(n.x, n.z) + 1);
    const a = new Actor({ id: n.id, kind: 'npc', name: n.name, faction: n.faction, group: n.group, def: n, x: n.x, y, z: n.z, yaw: n.yaw ?? 0, stats, weaponId: n.weapon ?? 'poings',
      look: { ...n.look, armor: n.armor, cloak: n.look?.cloak } });
    a.brain = new NPCBrain(a, n.ai ?? {}); a.surrendered = !!n.surrendered;
    n.roleLabel ??= ROLES[n.role];
    a.hostileTo = o => this.game.hostile(a, o);
    this.actors.set(n.id, a); this.game.addActor(a);
    return a;
  }
  refresh() {
    const want = this.wanted(), ids = new Set(want.map(n => n.id));
    for (const n of want) {
      const cur = this.actors.get(n.id);
      if (!cur) { this.spawn(n); continue; }
      if (cur.def !== n && !cur.brain?.target) { // variante (ex. Aldous au camp → au bosquet)
        if (this.game.distToPlayer(cur) > 30 || this.game.distToPlayer(n) > 30) { this.remove(n.id); this.spawn(n); }
        else { cur.def = n; cur.brain.home = { x: n.x, z: n.z }; }
      }
    }
    for (const [id, a] of this.actors) if (!ids.has(id) && !a.def.extra && a.alive && !a.surrendered && a.brain?.state !== 'combat') this.remove(id);
  }
  remove(id) { const a = this.actors.get(id); if (!a) return; this.actors.delete(id); this.game.removeActor(a); }
  /** Les membres d'un groupe pacifié quittent les lieux. */
  dismiss(group) {
    for (const a of this.actors.values()) if (a.group === group && a.alive) { a.surrendered = false; a.provoked = false; this.leaving.add(a); a.brain.state = 'routine'; a.brain.def = { wander: 0 }; a.leaveDir = Math.random() * 6.28; }
  }
  /** Points de passage de quête + départ des PNJ pacifiés. */
  update(dt, player) {
    for (const m of this.def.markers) {
      if (!check(m.when, this.state)) continue;
      const inside = Math.hypot(player.pos.x - m.x, player.pos.z - m.z) < m.r;
      if (inside && !this.inside.has(m.id)) { this.inside.add(m.id); this.game.core.bus.emit('marker:reached', { marker: m.id }); }
      if (!inside) this.inside.delete(m.id);
    }
    for (const a of this.leaving) {
      a.move(Math.cos(a.leaveDir) * 3 * dt, Math.sin(a.leaveDir) * 3 * dt, dt, this.game.physics); a.turnTo(Math.atan2(-Math.cos(a.leaveDir), -Math.sin(a.leaveDir)), dt);
      if (this.game.distToPlayer(a) > 45) { npcRecord(this.state, a.id).flags.gone = true; this.leaving.delete(a); this.remove(a.id); }
    }
  }
  /** Objets interactifs actifs. */
  objects() { return this.def.objects.filter(o => check(o.when, this.state) && !(o.once && this.state.world.flags['used:' + o.id])); }
  useObject(o) {
    if (o.once) this.state.world.flags['used:' + o.id] = true;
    this.game.core.effects(o.effects ?? [], { source: o.id });
    this.game.core.bus.emit('object:used', { object: o.id });
    return o.text ?? null;
  }
  dropLoot(a) {
    const l = a.def.loot; if (!l && !a.def.drop) return;
    const rng = this.game.rng, gold = l ? Math.round(l.gold[0] + rng() * (l.gold[1] - l.gold[0])) : 0;
    const items = (l?.items ?? []).filter(() => rng() < .45); if (a.def.drop) items.push(a.def.drop);
    if (a.weaponId !== 'poings' && rng() < .35) items.push(a.weaponId);
    this.loot.push({ id: 'loot:' + a.id, x: a.pos.x, z: a.pos.z, gold, items, name: a.name });
  }
  takeLoot(l) {
    this.loot.splice(this.loot.indexOf(l), 1);
    const fx = [{ gold: l.gold }, ...l.items.map(id => ({ item: id }))].filter(e => e.gold !== 0);
    this.game.core.effects(fx, { source: 'loot' });
    return [l.gold ? `${l.gold} pièces d’or` : null, ...l.items.map(id => ITEMS[id].name)].filter(Boolean).join(', ') || 'rien';
  }
  dispose() { this.unsub.forEach(u => u()); for (const id of [...this.actors.keys()]) this.remove(id); }
}
