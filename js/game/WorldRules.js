// Règles du monde partagées : interface fournie aux cerveaux des PNJ, reddition, fuite, mort, crimes.
import { dist } from '../combat/CombatSystem.js';
import { derive } from '../player/Stats.js';
import { addXp } from '../player/Progression.js';
import { changeRep } from '../factions/Reputation.js';
import { remember, npcRecord } from '../ai/Memory.js';

export function makeWorld(G) {
  return {
    get actors() { return G.actors; }, get physics() { return G.physics; }, get nav() { return G.nav; }, get player() { return G.player; },
    get hour() { return G.core.clock.hour; }, get night() { return G.core.clock.isNight; },
    pathBudget: 3, rng: G.rng, hostile: (a, b) => G.hostile(a, b), emit: (t, p) => G.core.bus.emit(t, p),
    stealth: p => (p.sneaking ? .45 : 1) * derive(G.core.state.player).detection,
    fear: a => (G.player && dist(a.pos, G.player.pos) < 8 ? derive(G.core.state.player).fear * .02 : 0),
    alertAllies(a, t) { for (const o of G.actors) if (o !== a && o.brain && o.alive && !o.surrendered && dist(o.pos, a.pos) < 30 && !G.hostile(o, a) && G.hostile(o, t)) o.brain.engage(t, this); G.ui.bark(a, 'À moi ! À l’aide !'); },
    surrender: a => surrender(G, a), escaped: a => escaped(G, a)
  };
}

function defeated(G, a) {
  if (a.defeated) return; a.defeated = true;
  if (a.group) G.core.bus.emit('npc:defeated', { group: a.group, npc: a.id });
}
export function surrender(G, a) {
  a.surrendered = true; a.fighter.block(false); a.brain.state = 'routine'; a.brain.target = null;
  defeated(G, a); G.core.state.stats.spared++;
  G.ui.bark(a, 'Pitié ! Je me rends !'); G.ui.toast(`${a.name} se rend. Approchez-vous (E) pour décider de son sort.`, 'info');
}
export function escaped(G, a) {
  defeated(G, a); npcRecord(G.core.state, a.id).flags.gone = true;
  G.region.remove(a.id); G.ui.toast(`${a.name} a pris la fuite.`, 'info');
}
export function onDeath(G, a, killer) {
  if (a.kind === 'player') return G.playerDied();
  defeated(G, a);
  if (a.def.stealthTarget) G.core.effects([{ flag: a.def.stealthTarget, value: !!a.ambushed && !a.seen }]);
  G.core.bus.emit('npc:killed', { npc: a.id, group: a.group });
  G.region.dropLoot(a);
  if (killer?.kind === 'player') {
    const xp = Math.round(15 + a.fighter.maxHp / 4);
    addXp(G.core.state.player, xp, G.core.bus, 'combat');
    G.ui.toast(`${a.name} est vaincu. +${xp} XP`, 'xp');
  }
  for (const o of G.actors) if (o.brain && o.alive && o.group && o.group === a.group) o.brain.morale = Math.max(0, o.brain.morale - .15);
}
/** Agression d'un PNJ non hostile : provocation, témoins, prime, réputation. */
export function crime(G, victim, type) {
  const s = G.core.state, law = G.region.def.lawFaction, witnesses = G.actors.filter(o => o.brain && o.alive && o !== victim && o.faction === law && dist(o.pos, victim.pos) < 30 && G.physics.sees(o.eye, victim.eye));
  remember(s, victim.id, 'attacked_by_player', type); npcRecord(s, victim.id).relation -= 50;
  if (witnesses.length) victim.seen = true;
  if (victim.faction === law || witnesses.length) {
    const fine = type === 'meurtre' ? 150 : 50;
    s.player.bounty[law] = (s.player.bounty[law] ?? 0) + fine;
    changeRep(s, law, type === 'meurtre' ? -15 : -5, G.core.bus);
    G.ui.toast(`Crime (${type}) ! Le Guet vous recherche : prime de ${s.player.bounty[law]} or.`, 'warn');
    for (const w of witnesses) w.brain.engage(G.player, G.world);
  }
}
