// Repères dans le monde : « ! » au-dessus des PNJ qui proposent une quête, « ? » au-dessus de ceux
// à aller voir, plaques de nom colorées selon l'attitude, et colonne de lumière sur l'objectif suivi.
import * as THREE from 'three';
import { QUESTS } from '../quests/QuestRegistry.js';
import { objectiveTargets } from '../ui/hud/Targets.js';

export function questMarker(G, actor) {
  const q = G.core.quests, s = G.core.state;
  for (const [id, d] of Object.entries(QUESTS)) if (d.giver === actor.id && q.canStart(id)) return '!';
  for (const [id, st] of Object.entries(s.quests)) {
    if (st.state !== 'active') continue;
    for (const o of q.objectives(id)) {
      if (o.done) continue;
      if (o.type === 'talk' && o.npc === actor.id) return '?';
      if (o.type === 'signal' && G.core.dialogue.trees[actor.id]?.entries.some(e => JSON.stringify(e.when).includes(`"${id}"`) && JSON.stringify(e.when).includes(`"${st.step}"`))) return '?';
    }
  }
  return null;
}

export class WorldMarkers {
  constructor(G) {
    this.G = G; this.t = 0;
    const mat = new THREE.MeshBasicMaterial({ color: '#f1c75a', transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 60, 16, 1, true), mat);
    this.beam.visible = false; G.scene.add(this.beam);
  }
  update(dt) {
    const G = this.G; if ((this.t += dt) < .25) return; this.t = 0;
    const P = G.player.pos;
    for (const a of G.actors) {
      if (!a.plate) continue;
      const d = Math.hypot(a.pos.x - P.x, a.pos.z - P.z), hostile = a.alive && G.hostile(a, G.player);
      const mark = a.alive && !hostile ? questMarker(G, a) : null;
      const show = a.alive && !a.hidden && (d < 22 || (mark && d < 60) || (hostile && d < 35));
      const hurt = a.fighter.hp < a.fighter.maxHp, color = hostile ? '#e0503a' : a.surrendered ? '#9fc4d6' : a.def?.follower ? '#9fd06a' : a.def?.merchant ? '#8fd0e8' : '#efe4c9';
      a.plate.set(color, hostile || hurt ? a.fighter.hp / a.fighter.maxHp : null, show, mark, a.def?.title ?? a.def?.roleLabel);
    }
    const t = objectiveTargets(G)[0];
    this.beam.visible = !!t && Math.hypot(t.x - P.x, t.z - P.z) > 8;
    if (t) this.beam.position.set(t.x, G.physics.groundFn(t.x, t.z) + 30, t.z);
  }
}
