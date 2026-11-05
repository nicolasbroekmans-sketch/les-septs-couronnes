// Branche les événements du jeu sur l'interface et l'audio (notifications, sons, journal).
import { QUESTS } from '../quests/QuestRegistry.js';
import { ITEMS } from '../data/items.js';
import { audio } from '../audio.js';
import { npcRecord } from '../ai/Memory.js';

export function wireEvents(G) {
  const bus = G.core.bus, ui = G.ui;
  bus.on('quest:started', ({ quest }) => { ui.toast(`Nouvelle quête : ${QUESTS[quest].title}`, 'quest'); audio.sfx('chime', .5); G.trackQuest(quest); });
  bus.on('quest:updated', ({ quest, text }) => { if (G.core.state.quests[quest]?.log.length > 1) ui.toast(`Journal mis à jour — ${QUESTS[quest].title}`, 'quest'); ui.journalHint(text); });
  bus.on('quest:completed', ({ quest }) => { ui.toast(`Quête terminée : ${QUESTS[quest].title}`, 'quest-done'); audio.sfx('chime', .6, .8); G.autosave(); });
  bus.on('quest:failed', ({ title, reason }) => ui.toast(`Quête échouée : ${title}. ${reason}`, 'warn'));
  bus.on('quest:rewards', ({ lines }) => lines.length && ui.toast('Récompenses : ' + lines.join(' · '), 'loot'));
  bus.on('player:levelup', ({ level }) => { ui.toast(`Niveau ${level} ! Points de compétence et d’attribut disponibles (K).`, 'level'); audio.sfx('chime', .7, 1.2); G.refreshPlayerStats(true); });
  bus.on('inventory:changed', ({ id, qty }) => { if (qty > 0 && ITEMS[id].type === 'quest') ui.toast(`Objet de quête : ${ITEMS[id].name}`, 'loot'); ui.refresh(); });
  bus.on('player:equipped', () => G.refreshPlayerStats());
  bus.on('player:skill', () => G.refreshPlayerStats());
  bus.on('player:attr', () => G.refreshPlayerStats());
  bus.on('player:cosmetic', () => G.refreshPlayerStats());
  bus.on('player:upgraded', ({ id, level }) => { ui.toast(`${ITEMS[id].name} amélioré(e) : +${level}`, 'rep'); audio.sfx('anvil', .5); G.refreshPlayerStats(); });
  bus.on('faction:rep', ({ faction, amount }) => Math.abs(amount) >= 3 && ui.toast(`Réputation ${amount > 0 ? '+' : ''}${Math.round(amount)} : ${G.factionName(faction)}`, amount > 0 ? 'rep' : 'warn'));
  bus.on('dialogue:check', ({ ok, label }) => ui.toast(`${label} : ${ok ? 'réussite' : 'échec'}`, ok ? 'rep' : 'warn'));
  bus.on('ui:army', () => setTimeout(() => ui.openArmy(true), 50));
  bus.on('battle:start', ({ id }) => setTimeout(() => G.startBattle(id), 300));
  bus.on('army:recruited', ({ unit, qty }) => { audio.sfx('anvil', .3, 1.1); ui.refresh(); });
  bus.on('ui:trade', ({ npc }) => ui.openTrade(G.region.actors.get(npc)));
  bus.on('player:heal', ({ amount }) => { G.player.fighter.hp = Math.min(G.player.fighter.maxHp, G.player.fighter.hp + amount); });
  bus.on('npc:provoked', ({ npc, group }) => { const a = G.region.actors.get(npc); if (a) a.provoked = true; if (group) G.core.state.world.flags['provoked:' + group] = true; });
  bus.on('npc:execute', ({ npc }) => { const a = G.region.actors.get(npc); if (a?.alive) { a.surrendered = false; a.fighter.takeHit({ amount: 9999 }); G.onDeath(a, null); } });
  bus.on('npc:flag', ({ npc, flag }) => {
    if (flag !== 'spared') return;
    const a = G.region.actors.get(npc); if (!a) return;
    a.surrendered = false; npcRecord(G.core.state, npc).flags.gone = true; G.region.leaving.add(a); a.leaveDir = Math.random() * 6.28;
    G.core.bus.emit('npc:spared', { npc });
  });
  bus.on('crime:theft', ({ caught }) => caught && ui.toast('Pris la main dans le sac ! Le Guet est prévenu.', 'warn'));
  bus.on('world:weather', ({ weather }) => G.setWeather(weather));
  bus.on('world:advance', ({ minutes }) => G.core.clock.advance(minutes, G.region?.def.climate));
}
