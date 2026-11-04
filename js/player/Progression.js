// Expérience, niveaux, points de compétence et progression des aptitudes par l'usage.
import { SKILLS } from '../data/skills.js';
import { derive } from './Stats.js';

export const xpForLevel = lvl => Math.round(100 * Math.pow(lvl, 1.5));

/** Ajoute de l'XP (multiplicateurs inclus) et gère les montées de niveau. Renvoie le nombre de niveaux gagnés. */
export function addXp(p, base, bus, source = '') {
  const amount = Math.round(base * derive(p).xpMult);
  p.xp += amount;
  let gained = 0;
  while (p.xp >= xpForLevel(p.level)) {
    p.xp -= xpForLevel(p.level); p.level++; gained++;
    p.skillPoints += 1; p.attrPoints += 1;
  }
  bus?.emit('player:xp', { amount, source });
  if (gained) bus?.emit('player:levelup', { level: p.level });
  return gained;
}

export function canLearn(p, id) {
  const s = SKILLS[id];
  if (!s || p.skills.includes(id)) return false;
  return p.skillPoints >= s.cost && (s.req ?? []).every(r => p.skills.includes(r));
}

export function learn(p, id, bus) {
  if (!canLearn(p, id)) return false;
  p.skillPoints -= SKILLS[id].cost; p.skills.push(id);
  bus?.emit('player:skill', { id });
  return true;
}

export function raiseAttribute(p, attr, bus) {
  if (p.attrPoints < 1 || !(attr in p.attrs) || p.attrs[attr] >= 12) return false;
  p.attrs[attr]++; p.attrPoints--;
  bus?.emit('player:attr', { attr });
  return true;
}

/** Les aptitudes progressent en les utilisant (rendement décroissant). */
export function practice(p, apt, amount = 1) {
  if (!(apt in p.apt)) return;
  p.apt[apt] = Math.min(100, p.apt[apt] + amount * (1 - p.apt[apt] / 120));
}
