// Sauvegardes : emplacements manuels + sauvegarde auto, versionnées avec migrations.
// Le stockage est injectable (localStorage dans le navigateur, Map en mémoire pour les tests).
import { STATE_VERSION } from './GameState.js';

const PREFIX = 'asoiaf-rpg:';
// Migrations : clé = version de départ, fonction qui transforme l'état vers la version suivante.
export const MIGRATIONS = {
  0: s => { s.stats ??= { kills: 0, spared: 0, questsDone: 0, goldEarned: 0, playTime: 0 }; s.player.bounty ??= {}; s.version = 1; return s; }
};

export function memoryStorage() {
  const m = new Map();
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i], get length() { return m.size; } };
}

export class SaveManager {
  constructor(storage) { this.storage = storage; }
  save(slot, state, label = '') {
    const data = { meta: { slot, label, savedAt: Date.now(), version: STATE_VERSION, name: state.player.name, level: state.player.level, region: state.player.region, day: state.world.time.day }, state };
    const json = JSON.stringify(data);
    this.storage.setItem(PREFIX + slot, json);
    const check = JSON.parse(this.storage.getItem(PREFIX + slot)); // relecture : jamais de sauvegarde silencieusement corrompue
    if (check.meta.savedAt !== data.meta.savedAt) throw new Error('Échec de vérification de la sauvegarde');
    return data.meta;
  }
  load(slot) {
    const raw = this.storage.getItem(PREFIX + slot);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return migrate(data.state);
  }
  list() {
    const out = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k?.startsWith(PREFIX)) { try { const meta = JSON.parse(this.storage.getItem(k))?.meta; if (meta) out.push(meta); } catch { /* emplacement illisible ignoré */ } }
    }
    return out.sort((a, b) => b.savedAt - a.savedAt);
  }
  remove(slot) { this.storage.removeItem(PREFIX + slot); }
  latest() { return this.list()[0] ?? null; }
}

export function migrate(state) {
  let v = state.version ?? 0;
  if (v > STATE_VERSION) throw new Error(`Sauvegarde d’une version plus récente (${v}).`);
  while (v < STATE_VERSION) { state = MIGRATIONS[v](state); v = state.version; }
  return state;
}
