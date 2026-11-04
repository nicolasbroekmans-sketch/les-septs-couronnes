// Une image de jeu : entrées → joueur → PNJ (niveau de détail selon la distance) → combat → région →
// temps du monde → caméra → interface → rendu.
import { audio } from '../audio.js';
import { addXp } from '../player/Progression.js';

export function frame(G, dt) {
  const I = G.input, ui = G.ui;
  G.frameDt = dt;
  if (!G.paused && G.player) {
    if (!ui.modal) G.controller.update(dt);
    if (!ui.modal && I.hit('KeyE')) G.interaction.use();
    G.world.pathBudget = 3;
    for (const a of G.actors) {
      if (a.kind === 'player') continue;
      const far = G.distToPlayer(a) > 90;
      if (far && (a.lodT = (a.lodT ?? 0) + dt) < .5) continue; // PNJ lointains : simulation allégée
      const step = far ? a.lodT : dt; a.lodT = 0;
      if (a.brain && a.alive) { const v = a.brain.update(step, G.world); if (!G.region.leaving.has(a)) a.move(v.x * step, v.z * step, step, G.physics); }
    }
    G.combat.update(dt);
    G.region.update(dt, G.player);
    G.core.clock.advance(dt * (G.settings.timeScale ?? 1), G.region.def.climate);
    G.core.state.stats.playTime += dt;
    discover(G);
    if ((G.autoT += dt) > 120) { G.autoT = 0; G.autosave(); }
    if (G.flashT > 0) { G.flashT -= dt; G.renderer.hitFlash(Math.max(0, G.flashT * 2)); }
  }
  daylight(G);
  for (const a of G.actors) if (G.distToPlayer(a) < 120) a.sync(dt);
  G.rig.update(G.player.pos, G.physics, dt);
  if (G.rig.shake > 0) { G.rig.shake -= dt; G.renderer.camera.position.x += (Math.random() - .5) * G.rig.shake * .3; }
  for (const u of G.env.updaters) u(G.core.state.stats.playTime, dt, G.player);
  const cam = G.renderer.camera, f = G.rig.aim();
  audio.listener(cam.position, f);
  const c = G.interaction.find();
  ui.prompt(c && !ui.modal ? c.label : null);
  ui.hud(G);
  G.renderer.render(dt);
  I.endFrame();
}

function daylight(G) {
  const E = G.env, cfg = E.cfg, k = G.core.clock, dl = k.daylight;
  E.sun.intensity = (cfg.sun?.[1] ?? 2) * dl;
  E.hemi.intensity = (cfg.hemi?.[2] ?? .4) * (.35 + .65 * dl);
  E.scene.backgroundIntensity = (cfg.bg ?? 1) * (.12 + .88 * dl);
  E.scene.environmentIntensity = (cfg.env ?? 1) * (.22 + .78 * dl);
  E.lightBoost = 1 + (1 - dl) * .9;
  const sd = k.sunDir; E.sunDir.set(sd[0], sd[1], sd[2]).normalize();
  E.sun.position.set(G.player.pos.x + E.sunDir.x * 150, G.player.pos.y + E.sunDir.y * 150, G.player.pos.z + E.sunDir.z * 150);
  E.sun.target.position.set(G.player.pos.x, G.player.pos.y, G.player.pos.z);
}

/** Points d'intérêt : fiche de lore + XP d'exploration à la première visite. */
function discover(G) {
  const p = G.player.pos, w = G.core.state.world;
  let near = null;
  for (const poi of G.env.pois) if (Math.hypot(poi.x - p.x, poi.z - p.z) < 6.5 && Math.abs((poi.y ?? p.y) - p.y) < 12) { near = poi; break; }
  if (near && !w.discovered.includes('poi:' + near.id)) {
    w.discovered.push('poi:' + near.id);
    addXp(G.core.state.player, 15, G.core.bus, 'exploration');
    audio.sfx('chime', .4);
    G.ui.toast(`Découverte : ${near.title} (+15 XP)`, 'xp');
  }
  G.ui.lore(near);
}
