// Création d'un personnage à partir des choix du joueur.
import { CLASSES, ORIGINS, DIFFICULTIES, ATTRIBUTES, APTITUDES } from '../data/classes.js';

export const APPEARANCE_DEFAULT = { skin: '#d8b49a', hair: '#3a2a1e', tunic: '#5a3a2a', cloak: '#2a2a2e', beard: false, height: 1 };

/** @returns {string[]} liste d'erreurs (vide si valide) */
export function validateCreation(c) {
  const e = [];
  if (!c.name || c.name.trim().length < 2 || c.name.length > 24) e.push('Le nom doit faire entre 2 et 24 caractères.');
  if (!CLASSES[c.classId]) e.push('Classe inconnue.');
  if (!ORIGINS[c.origin]) e.push('Origine inconnue.');
  if (!DIFFICULTIES[c.difficulty]) e.push('Difficulté inconnue.');
  if (!(c.age >= 16 && c.age <= 70)) e.push('L’âge doit être compris entre 16 et 70 ans.');
  if (!['homme', 'femme'].includes(c.sex)) e.push('Sexe invalide.');
  return e;
}

export function createPlayer(c) {
  const errors = validateCreation(c);
  if (errors.length) throw new Error(errors.join(' '));
  const cls = CLASSES[c.classId], origin = ORIGINS[c.origin];
  const attrs = { ...cls.attrs };
  for (const [k, v] of Object.entries(origin.bonus)) attrs[k] += v;
  if (c.age >= 45) { attrs.intelligence += 1; attrs.agilite -= 1; }
  const apt = Object.fromEntries(Object.keys(APTITUDES).map(k => [k, cls.apt[k] ?? 5]));
  const inventory = [];
  for (const id of cls.items) { const s = inventory.find(x => x.id === id); s ? s.qty++ : inventory.push({ id, qty: 1 }); }
  const weapon = cls.equip.find(id => !['vetements', 'vetements_fins', 'cuir', 'brigandine', 'maille', 'plates'].includes(id));
  const armor = cls.equip.find(id => id !== weapon);
  return {
    name: c.name.trim(), sex: c.sex, age: c.age, origin: c.origin, classId: c.classId, difficulty: c.difficulty,
    backstory: (c.backstory ?? '').slice(0, 400), appearance: { ...APPEARANCE_DEFAULT, ...c.appearance },
    attrs, apt, level: 1, xp: 0, skillPoints: 1 + (cls.bonusPoints ?? 0), attrPoints: 0, skills: [],
    gold: cls.gold, renown: 0, inventory, equipped: { weapon, armor },
    hp: null, stamina: null, region: null, position: null, yaw: 0, bounty: {}
  };
}
export { ATTRIBUTES, APTITUDES };
