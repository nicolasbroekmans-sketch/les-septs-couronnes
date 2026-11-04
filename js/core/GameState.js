// État complet d'une partie : entièrement sérialisable (sauvegarde = JSON de cet objet).
import { createPlayer } from '../player/Character.js';
import { ORIGINS } from '../data/classes.js';
import { FACTIONS } from '../data/factions.js';
import { derive } from '../player/Stats.js';

export const STATE_VERSION = 1;
export const START_REGIONS = ['kingslanding', 'winterfell', 'wall'];

export function createGameState(creation, region, seed = Date.now() % 1e9) {
  if (!START_REGIONS.includes(region)) throw new Error('Région de départ invalide : ' + region);
  const player = createPlayer(creation);
  const d = derive(player);
  player.hp = d.maxHp; player.stamina = d.maxStamina; player.region = region;
  const factions = Object.fromEntries(Object.keys(FACTIONS).map(f => [f, 0]));
  factions[ORIGINS[player.origin].faction] += 15;
  if (player.classId === 'noble') factions.couronne += 5;
  if (region === 'wall') factions.garde += 10;
  for (const [f, def] of Object.entries(FACTIONS)) if (def.outlaw) factions[f] = -80;
  return {
    version: STATE_VERSION, seed, createdAt: Date.now(),
    player, factions, quests: {}, npcs: {},
    world: { time: { day: 1, minutes: 9 * 60, weather: null }, flags: {}, discovered: [region], events: [] },
    stats: { kills: 0, spared: 0, questsDone: 0, goldEarned: 0, playTime: 0 }
  };
}
