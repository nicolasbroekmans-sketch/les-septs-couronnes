// Application des récompenses et conséquences d'une issue de quête (or, XP, objets, réputation,
// relations, souvenirs, drapeaux, quêtes débloquées). Les effets passent par core/Effects.js.
export function applyOutcome(game, questId, outcome) {
  const lines = game.effects(outcome.rewards ?? [], { source: questId });
  for (const q of outcome.unlocks ?? []) game.state.world.flags['unlocked:' + q] = true;
  game.bus.emit('quest:rewards', { quest: questId, lines });
  return lines;
}
