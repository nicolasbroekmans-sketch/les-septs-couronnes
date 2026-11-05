// Statistiques dérivées : c'est ici que attributs, aptitudes, talents, équipement et difficulté
// deviennent des nombres utilisés par le combat, le commerce, la furtivité et les dialogues.
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { DIFFICULTIES } from '../data/classes.js';
import { weaponBonus, armorBonus } from '../economy/Upgrades.js';

export function perkFx(p) {
  const fx = {};
  for (const id of p.skills ?? []) for (const [k, v] of Object.entries(SKILLS[id]?.fx ?? {})) fx[k] = (fx[k] ?? 0) + v;
  return fx;
}

export function derive(p) {
  const a = p.attrs, apt = p.apt, fx = perkFx(p), diff = DIFFICULTIES[p.difficulty] ?? DIFFICULTIES.normal;
  const weapon = ITEMS[p.equipped?.weapon] ?? ITEMS.poings, armor = ITEMS[p.equipped?.armor];
  return {
    maxHp: Math.round(60 + a.constitution * 10 + (p.level - 1) * 6 + (fx.hp ?? 0)),
    maxStamina: Math.round(60 + a.endurance * 8 + (p.level - 1) * 3),
    staminaRegen: (14 + a.endurance * 1.2) * (1 + (fx.regen ?? 0)),
    melee: (1 + a.force * .07 + apt.combat / 220) * (1 + (fx.melee ?? 0)) * diff.dealt * weaponBonus(p, p.equipped?.weapon),
    ranged: (1 + a.agilite * .06 + apt.tir / 200) * (1 + (fx.ranged ?? 0)) * diff.dealt * weaponBonus(p, p.equipped?.weapon),
    heavyBonus: fx.heavy ?? 0, cleave: !!fx.cleave, sneak: !!fx.sneak,
    attackSpeed: 1 + a.agilite * .025,
    crit: .03 + a.perception * .008 + (weapon.crit ?? 0),
    block: Math.min(.9, .55 + apt.combat / 400 + (fx.block ?? 0)),
    parryWindow: .18 + (fx.parryWindow ?? 0),
    dodgeCost: Math.max(12, 26 - a.agilite),
    armor: Math.min(.7, (armor?.armor ?? 0) + (armor ? armorBonus(p, p.equipped.armor) : 0)), moveSpeed: armor?.speed ?? 1,
    taken: diff.taken, xpMult: diff.xp * (1 + a.intelligence * .03),
    detection: 1 - (fx.stealth ?? 0) - apt.furtivite / 300,
    persuade: a.charisme * 5 + apt.diplomatie * .6 + (fx.persuade ?? 0),
    buyMult: Math.max(.6, 1 - a.charisme * .015 - apt.commerce / 500 + (fx.buy ?? 0)),
    sellMult: Math.min(.9, .45 + a.charisme * .01 + apt.commerce / 500 + (fx.sell ?? 0)),
    theft: .25 + apt.furtivite / 200 + a.agilite * .02 + (fx.theft ?? 0),
    repMult: 1 + (fx.rep ?? 0), fear: (fx.fear ?? 0), allyDmg: fx.allyDmg ?? 0, withAllies: fx.withAllies ?? 0,
    weapon, weaponId: p.equipped?.weapon ?? 'poings'
  };
}
