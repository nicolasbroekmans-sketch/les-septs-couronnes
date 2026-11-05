// Registre de toutes les quêtes, avec validation de structure au chargement.
import kingslanding from '../data/quests/kingslanding.js';
import winterfell from '../data/quests/winterfell.js';
import wall from '../data/quests/wall.js';
import noone from '../data/quests/noone.js';

export const QUESTS = { ...kingslanding, ...winterfell, ...wall, ...noone };

export function validateQuests(quests = QUESTS) {
  const errors = [];
  for (const [id, q] of Object.entries(quests)) {
    if (!q.title || !q.steps?.[q.start]) errors.push(`${id} : titre ou étape de départ manquante`);
    for (const [sid, s] of Object.entries(q.steps ?? {})) {
      if (!s.objectives?.length) errors.push(`${id}/${sid} : aucun objectif`);
      for (const o of s.objectives ?? []) {
        const target = o.branch ?? s.next, out = o.outcome ?? s.complete;
        if (!out && !q.steps[target]) errors.push(`${id}/${sid} : suite introuvable (${target})`);
        if (out && !q.outcomes?.[out]) errors.push(`${id}/${sid} : issue introuvable (${out})`);
      }
    }
  }
  return errors;
}
