// Conseils contextuels : chaque conseil s'affiche une seule fois par partie, au bon moment.
import { $, h } from './dom.js';

const TIPS = {
  start: ['Bienvenue !', 'Clique dans le jeu pour diriger la caméra avec la souris. Déplace-toi avec ZQSD (ou WASD), cours avec Maj. Les personnages marqués d’un « ! » doré ont une mission pour toi : approche-toi et appuie sur E. Touche G : guide complet. Touche M : la carte, d’où l’on peut voyager vers toutes les villes et tous les villages du royaume.'],
  quest: ['Ta première mission', 'L’objectif est affiché en haut à droite. Une colonne de lumière dorée et le losange ◆ de la boussole t’indiquent où aller. M ouvre la carte, J le journal.'],
  combat: ['Combat !', 'Clic gauche : attaque (maintenir = attaque lourde qui brise la garde). Clic droit : parer — juste avant l’impact, la parade déséquilibre l’ennemi. Espace : sauter. V : roulade. H : boire un onguent.'],
  loot: ['Butin', 'Un ennemi vaincu laisse souvent de l’or ou des objets : approche-toi du corps et appuie sur E. Un ennemi qui se rend peut être épargné… ou non.'],
  level: ['Niveau supérieur', 'Appuie sur K pour dépenser tes points de compétence, et sur R (ou T, I) pour ouvrir ton inventaire et équiper une meilleure arme ou armure.'],
  merchant: ['Marchands', 'Les noms en bleu sont des marchands. Parle-leur (E) puis « Voyons vos marchandises ». Les forgerons améliorent aussi tes armes et armures.'],
  gift: ['Cadeau mystère !', 'Toutes les 15 minutes de jeu, tu reçois un cadeau : teintures, capes, titres, or… Personnalise ton héros dans le menu Profil (touche P).'],
  army: ['Lever une armée', 'Le recruteur (plaque « Recruteur ») engage des lanciers, des archers et plus tard des chevaliers. Choisis tes compagnons dans l’onglet Armée (touche B). Le capitaine de guerre te confiera les grandes batailles.'],
  battle: ['Grande bataille', 'Touche 1 : tes hommes chargent. 2 : ils tiennent la ligne. 3 : ils te suivent. Quand l’ennemi perd sept hommes sur dix, il fuit. Reste en vie !'],
  beggar: ['Les petites gens', 'Les mendiants et les passants réagissent à ta générosité… et à ton insolence. Ce que tu fais se sait, et ta réputation en dépend.']
};

export class Tutorial {
  constructor() { this.el = $('#tip'); this.queue = []; }
  attach(G) {
    this.G = G; const bus = G.core.bus;
    const on = (ev, key, test = () => true) => bus.on(ev, p => test(p) && this.show(key));
    on('quest:started', 'quest'); on('npc:engage', 'combat', p => p.target === 'player'); on('npc:defeated', 'loot');
    on('player:levelup', 'level'); on('gift:opened', 'gift');
    setTimeout(() => this.show('start'), 1800);
  }
  near(actor) { if (actor?.def.merchant) this.show('merchant'); if (actor?.def.role === 'beggar') this.show('beggar'); if (['recruiter', 'captain'].includes(actor?.def.role)) this.show('army'); }
  show(key) {
    const s = this.G?.core.state; if (!s || s.world.tips?.[key] || this.G.settings.tips === false) return;
    (s.world.tips ??= {})[key] = true;
    this.queue.push(TIPS[key]); if (!this.el.classList.contains('open')) this.next();
  }
  next() {
    const t = this.queue.shift(); if (!t) return this.el.classList.remove('open');
    this.el.replaceChildren(h('span.kicker', {}, 'Conseil'), h('h4', {}, t[0]), h('p', {}, t[1]),
      h('div.tip-actions', {}, h('button', { type: 'button', on: { click: () => this.next() } }, 'Compris'),
        h('button.link', { type: 'button', on: { click: () => { this.G.settings.tips = false; this.queue = []; this.next(); } } }, 'Ne plus afficher')));
    this.el.classList.add('open');
    clearTimeout(this.timer); this.timer = setTimeout(() => this.next(), 16000);
  }
}
