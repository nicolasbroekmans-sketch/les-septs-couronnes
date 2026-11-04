// Inventaire : ajout, retrait, équipement, consommation. Émet 'inventory:changed' via le bus si fourni.
import { ITEMS } from '../data/items.js';

export const count = (p, id) => p.inventory.find(s => s.id === id)?.qty ?? 0;

export function addItem(p, id, qty = 1, bus) {
  if (!ITEMS[id]) throw new Error(`Objet inconnu : ${id}`);
  const s = p.inventory.find(x => x.id === id);
  s ? (s.qty += qty) : p.inventory.push({ id, qty });
  bus?.emit('inventory:changed', { id, qty });
  return count(p, id);
}

export function removeItem(p, id, qty = 1, bus) {
  const s = p.inventory.find(x => x.id === id);
  if (!s || s.qty < qty) return false;
  s.qty -= qty;
  if (!s.qty) {
    p.inventory.splice(p.inventory.indexOf(s), 1);
    for (const slot of ['weapon', 'armor']) if (p.equipped[slot] === id) p.equipped[slot] = null;
  }
  bus?.emit('inventory:changed', { id, qty: -qty });
  return true;
}

export function equip(p, id, bus) {
  const it = ITEMS[id];
  if (!it || !count(p, id) || !['weapon', 'armor'].includes(it.type)) return false;
  p.equipped[it.type] = id;
  bus?.emit('player:equipped', { slot: it.type, id });
  return true;
}

/** Utilise un consommable. `vitals` = { hp, stamina, maxHp, maxStamina } modifié en place. */
export function consume(p, id, vitals, bus) {
  const it = ITEMS[id];
  if (it?.type !== 'consumable' || !removeItem(p, id, 1, bus)) return false;
  if (it.heal) vitals.hp = Math.min(vitals.maxHp, vitals.hp + it.heal);
  if (it.stamina) vitals.stamina = Math.min(vitals.maxStamina, vitals.stamina + it.stamina);
  return true;
}

export const weight = p => p.inventory.reduce((w, s) => w + (ITEMS[s.id].weight ?? 0) * s.qty, 0);
