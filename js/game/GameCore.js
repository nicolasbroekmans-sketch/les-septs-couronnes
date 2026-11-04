// Noyau logique d'une partie, sans rendu : état + bus + quêtes + dialogues + horloge.
// Utilisé tel quel par le jeu (game/Game.js) et par les tests d'intégration dans Node.
import { EventBus } from '../core/EventBus.js';
import { apply } from '../core/Effects.js';
import { QuestEngine } from '../quests/QuestEngine.js';
import { QUESTS } from '../quests/QuestRegistry.js';
import { DialogueEngine } from '../dialogue/DialogueEngine.js';
import { DIALOGUES } from '../data/dialogues/index.js';
import { WorldClock } from '../world/WorldClock.js';
import { npcRecord } from '../ai/Memory.js';

export class GameCore {
  constructor(state) {
    this.state = state;
    this.bus = new EventBus();
    this.quests = new QuestEngine(this, QUESTS);
    this.dialogue = new DialogueEngine(this, DIALOGUES);
    this.clock = new WorldClock(state.world.time, this.bus);
    this.bus.on('quest:completed', () => this.state.stats.questsDone++);
    this.bus.on('player:gold', ({ amount }) => { if (amount > 0) this.state.stats.goldEarned += amount; });
    this.bus.on('npc:killed', ({ npc }) => { npcRecord(state, npc).alive = false; state.stats.kills++; });
    this.bus.on('npc:spared', () => state.stats.spared++);
  }
  effects(list, ctx) { return apply(list, this, ctx); }
}
