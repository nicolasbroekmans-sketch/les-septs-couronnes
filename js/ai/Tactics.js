// Décision tactique des PNJ en combat. Architecture hybride :
//  - utilityScores : IA utilitaire écrite à la main (référence lisible, sert aussi d'enseignant) ;
//  - TacticalBrain : réseau neuronal entraîné (tools/train-tactics.mjs), avec repli sur l'utilitaire.
// La décision n'est prise que toutes les ~0,3 s par PNJ en combat, jamais à chaque image.
import { MLP, argmax } from './NeuralModel.js';

export const ACTIONS = ['attack', 'retreat', 'dodge', 'defend', 'flee', 'call', 'switch'];
export const FEATURES = ['distance', 'selfHp', 'selfStamina', 'targetHp', 'allies', 'enemies', 'threat', 'ranged', 'morale', 'aggression', 'targetBlocking'];

/** Entrées normalisées dans [0, 1]. */
export function features(s) {
  const reach = s.ranged ? 14 : (s.reach ?? 2);
  return [
    Math.min(1, s.distance / (reach * 3)), s.hp, s.stamina, s.targetHp,
    Math.min(1, s.allies / 4), Math.min(1, s.enemies / 4), s.threat ? 1 : 0, s.ranged ? 1 : 0,
    s.morale, s.aggression, s.targetBlocking ? 1 : 0
  ];
}

export function utilityScores(f) {
  const [d, hp, st, thp, al, en, threat, ranged, morale, aggr, tblock] = f;
  const close = 1 - d, inRange = ranged ? (d > .15 && d < .7 ? 1 : 0) : (d < .38 ? 1 : 0);
  return [
    aggr * .5 + inRange * .7 + st * .35 - tblock * .35 * (1 - ranged) + (1 - thp) * .25 + (close * .2) * (1 - ranged) - (hp < .3 ? .6 * (1 - morale) : 0) - threat * .5,
    ranged * (d < .15 ? .9 : 0) + (st < .2 ? .55 : 0) + (hp < .3 ? .2 : 0),
    threat * (st > .3 ? .85 : 0) * (d < .4 ? 1 : 0),
    threat * .6 + (st < .35 && d < .4 ? .25 : 0) - ranged * .5,
    (hp < .22 ? 1 : 0) * (1 - morale) * 1.3 + Math.max(0, en - al - .25) * .4,
    (hp < .6 && al < .25 ? .35 : 0) * (1 - aggr * .5),
    (en > .25 && thp > .85 && hp > .5 ? .2 : 0)
  ];
}

export class TacticalBrain {
  constructor(weights) { this.model = weights ? MLP.from(weights) : null; }
  /** mode : 'nn' (réseau) ou 'utility'. Renvoie { action, probs }. */
  decide(f, mode = 'nn', rng = Math.random, temperature = 0) {
    const probs = mode === 'nn' && this.model ? this.model.predict(f) : softmaxScores(utilityScores(f));
    let i = argmax(probs);
    if (temperature > 0 && rng() < temperature) { // exploration légère : rend les PNJ moins prévisibles
      let r = rng(), acc = 0; for (let k = 0; k < probs.length; k++) { acc += probs[k]; if (r <= acc) { i = k; break; } }
    }
    return { action: ACTIONS[i], probs };
  }
}
const softmaxScores = v => { const e = v.map(x => Math.exp(x * 4)), s = e.reduce((a, b) => a + b, 0); return e.map(x => x / s); };
