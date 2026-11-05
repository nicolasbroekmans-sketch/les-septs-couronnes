// Guide du joueur : objectif actuel expliqué, commandes, fonctionnement des systèmes.
import { h } from '../dom.js';
import { QUESTS } from '../../quests/QuestRegistry.js';
import { objectiveTargets } from '../hud/Targets.js';
import { advise } from '../../game/Advisor.js';

export const direction = (dx, dz) => ['au nord', 'au nord-est', 'à l’est', 'au sud-est', 'au sud', 'au sud-ouest', 'à l’ouest', 'au nord-ouest'][Math.round(((Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360) / 45) % 8];

const SECTIONS = [
  ['Se déplacer', 'ZQSD ou WASD (ou les flèches), souris pour la caméra, Maj pour courir, C pour avancer discrètement, molette pour le zoom.'],
  ['Parler et agir', 'Approche-toi d’un personnage ou d’un objet : une invite « E » apparaît. Les « ! » dorés proposent une mission ; les « ? » bleus attendent ta visite pour la suite.'],
  ['Combattre', 'Clic gauche : attaque légère. Maintenir : attaque lourde (brise la garde). Clic droit : parer. Espace : sauter. V : roulade (invulnérable un instant). Surveille ton endurance (barre dorée). H : soin.'],
  ['Progresser', 'Missions, combats et découvertes rapportent de l’expérience. À chaque niveau : un point de compétence (K) et un point d’attribut (R → fiche). Les aptitudes progressent en les pratiquant.'],
  ['S’équiper', 'R, T ou I : inventaire. Achète chez les marchands (nom bleu), fais améliorer tes armes et armures chez les forgerons, récupère le butin des ennemis (E sur un corps).'],
  ['Réputation', 'L : factions et personnes rencontrées. Voler, mentir ou trahir a des conséquences : les gens s’en souviennent.'],
  ['Armée', 'Les recruteurs engagent des hommes (B pour voir ton armée, « Compagnon + » pour qu’ils te suivent). Le capitaine de guerre lance les grandes batailles : il te dit ce qu’il te manque. En bataille : 2 tenir, 1 charger, 3 me suivre.'],
  ['Perdu ?', 'Touche F1 ou bouton « ? Que faire » en haut à droite : les prochaines étapes conseillées. M : carte et voyages vers toutes les villes.'],
  ['Cadeaux et profil', 'Toutes les 15 minutes de jeu, un cadeau mystère. P : profil (teintures, capes, titres, blason).'],
  ['Sauvegarder', 'Échap : pause, sauvegarde et chargement. Le jeu sauvegarde aussi automatiquement.']
];

export function guideTab(G) {
  return { id: 'guide', label: 'Guide', render(el) {
    const s = G.core.state, id = s.world.tracked, P = G.player.pos;
    let now = h('ol.help-list', {}, advise(G.core, G.region.def).slice(0, 4).map(t => h('li', {}, h('div', {}, h('b', {}, t.title), h('p', {}, t.text)))));
    if (id && s.quests[id]?.state === 'active') {
      const q = QUESTS[id], t = objectiveTargets(G)[0], step = q.steps[s.quests[id].step];
      now = h('div.guide-now', {}, h('span.kicker', {}, q.category), h('h4', {}, q.title), h('p', {}, step.text),
        h('ul', {}, G.core.quests.objectives(id).filter(o => o.label).map(o => h('li' + (o.done ? '.done' : ''), {}, o.label))),
        t ? h('p.where', {}, `◆ À ${Math.round(Math.hypot(t.x - P.x, t.z - P.z))} m, ${direction(t.x - P.x, t.z - P.z)}. Suis la colonne de lumière dorée ou le losange de la boussole.`) : null);
    }
    el.append(h('div.cols', {}, h('section', {}, h('h4', {}, 'Ton objectif'), now), h('section', {}, h('h4', {}, 'Comment jouer'), h('dl.guide', {}, SECTIONS.flatMap(([a, b]) => [h('dt', {}, a), h('dd', {}, b)])))));
  } };
}
