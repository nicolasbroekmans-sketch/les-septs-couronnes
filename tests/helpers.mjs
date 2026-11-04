// Outils partagés par les tests.
import { createGameState } from '../js/core/GameState.js';
import { GameCore } from '../js/game/GameCore.js';

export const CREATION = { name: 'Aelor', sex: 'homme', age: 25, origin: 'nord', classId: 'guerrier', difficulty: 'normal', appearance: {} };
export function newGame(region = 'winterfell', over = {}) {
  return new GameCore(createGameState({ ...CREATION, ...over }, region, 42));
}
/** Ouvre un dialogue et choisit successivement les options dont le texte contient chaque fragment. */
export function talk(game, npc, ...choices) {
  let v = game.dialogue.open({ id: npc, name: npc, faction: 'peuple', ...(typeof npc === 'object' ? npc : {}) });
  for (const frag of choices) {
    const i = v.options.findIndex(o => o.text.includes(frag));
    if (i < 0) throw new Error(`Option « ${frag} » introuvable chez ${npc}. Options : ${v.options.map(o => o.text).join(' | ')}`);
    v = game.dialogue.choose(i);
  }
  return v;
}
