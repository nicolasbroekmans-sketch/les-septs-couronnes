import { advise } from '../../game/Advisor.js';
// Positions des objectifs de la quête suivie (pour la mini-carte, la boussole et la distance affichée).
export function objectiveTargets(G) {
  const id = G.core.state.world.tracked, out = [];
  if (!id || G.core.quests.status(id) !== 'active') { // pas de mission suivie : on désigne la prochaine personne conseillée
    const tip = G.region && advise(G.core, G.region.def).find(a => a.npc || a.at), a = tip?.npc && G.region.actors.get(tip.npc);
    if (a) out.push({ x: a.pos.x, z: a.pos.z, label: tip.title, advice: true });
    else if (tip?.at) out.push({ x: tip.at[0], z: tip.at[1], label: tip.title, advice: true });
    return out;
  }
  const region = G.region, def = region.def;
  for (const o of G.core.quests.objectives(id)) {
    if (o.done) continue;
    if (o.type === 'talk') { const a = region.actors.get(o.npc); if (a) out.push({ x: a.pos.x, z: a.pos.z, label: o.label }); }
    if (o.type === 'reach') { const m = def.markers.find(m => m.id === o.marker); if (m) out.push({ x: m.x, z: m.z, label: o.label }); }
    if (o.type === 'interact') { const ob = def.objects.find(x => x.id === o.object); if (ob) out.push({ x: ob.x, z: ob.z, label: o.label }); }
    if (o.type === 'collect') { const ob = region.objects().find(x => x.effects?.some(e => e.item === o.item)); if (ob) out.push({ x: ob.x, z: ob.z, label: o.label }); }
    if (o.type === 'defeat') for (const a of region.actors.values()) if (a.group === o.group && a.alive && !a.surrendered) { out.push({ x: a.pos.x, z: a.pos.z, label: o.label, enemy: true }); }
    if (o.type === 'signal') { // décisions prises en parlant à quelqu'un : on désigne le PNJ concerné
      for (const a of region.actors.values()) if (a.alive && (a.surrendered || a.def.role === 'quest' || ['nerys', 'orwyn', 'torvald', 'ygra'].includes(a.id)) && G.core.dialogue.trees[a.id]?.entries.some(e => JSON.stringify(e.when).includes(id))) out.push({ x: a.pos.x, z: a.pos.z, label: o.label });
    }
  }
  return out;
}
