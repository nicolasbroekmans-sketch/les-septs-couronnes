// Mémoire persistante des PNJ : relation avec le joueur, souvenirs datés, drapeaux, vivant ou mort.
export function npcRecord(state, id) {
  return (state.npcs[id] ??= { relation: 0, memory: [], flags: {}, alive: true });
}
export function remember(state, id, type, note = '') {
  const r = npcRecord(state, id);
  r.memory.push({ type, note, day: state.world.time.day });
  if (r.memory.length > 30) r.memory.shift();
  return r;
}
export const recalls = (state, id, type) => !!state.npcs[id]?.memory.some(m => m.type === type);
/** Attitude envers le joueur à partir de la relation, des souvenirs et de la réputation de faction. */
export function attitude(state, id, faction) {
  const r = state.npcs[id], rel = (r?.relation ?? 0) + (state.factions[faction] ?? 0) * .5;
  if (r?.flags.hostile || rel <= -60) return 'hostile';
  if (r?.memory.some(m => ['caught_stealing', 'betrayed', 'robbed'].includes(m.type)) || rel < -15) return 'mefiant';
  return rel >= 30 ? 'amical' : 'neutre';
}
