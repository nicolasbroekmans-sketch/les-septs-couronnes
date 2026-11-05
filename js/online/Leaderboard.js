// Pseudos uniques et classement. En ligne : fonctions SQL Supabase (claim_pseudo, submit_score, vue leaderboard),
// chaque pseudo est protégé par un jeton secret gardé dans ce navigateur. Hors ligne : classement local.
import { ONLINE } from './config.js';

export const PSEUDO_RE = /^[\p{L}\p{N}_ -]{3,20}$/u;
export const online = () => !!(ONLINE.url && ONLINE.anonKey);
const KEY = 'asoiaf-online';

export function identity(storage) { try { return JSON.parse(storage.getItem(KEY)) ?? {}; } catch { return {}; } }
const saveId = (storage, id) => storage.setItem(KEY, JSON.stringify(id));
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');

async function rpc(fn, body, fetchImpl = fetch) {
  const r = await fetchImpl(`${ONLINE.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ONLINE.anonKey, Authorization: `Bearer ${ONLINE.anonKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Serveur : ${r.status}`);
  return r.json();
}

/** Réserve un pseudo. Renvoie { ok, reason }. Un pseudo déjà pris (sans tenir compte des majuscules) est refusé. */
export async function claimPseudo(storage, pseudo, fetchImpl = fetch) {
  pseudo = pseudo.trim();
  if (!PSEUDO_RE.test(pseudo)) return { ok: false, reason: '3 à 20 caractères : lettres, chiffres, espace, tiret ou _.' };
  const id = identity(storage);
  if (id.pseudo?.toLowerCase() === pseudo.toLowerCase()) return { ok: true };
  if (!online()) {
    const local = localBoard(storage);
    if (local.some(e => e.pseudo.toLowerCase() === pseudo.toLowerCase() && e.pseudo !== id.pseudo)) return { ok: false, reason: 'Ce pseudo est déjà pris.' };
    saveId(storage, { pseudo, token: id.token ?? token() }); return { ok: true, local: true };
  }
  const t = token(), ok = await rpc('claim_pseudo', { p_pseudo: pseudo, p_token: t }, fetchImpl);
  if (!ok) return { ok: false, reason: 'Ce pseudo est déjà pris par un autre joueur.' };
  saveId(storage, { pseudo, token: t }); return { ok: true };
}

export const scoreOf = s => ({ level: s.player.level, renown: s.player.renown, kills: s.stats.kills, quests: s.stats.questsDone, playtime: Math.round(s.stats.playTime) });

/** Envoie le score du héros (niveau, renommée, victoires, quêtes, temps de jeu) sous le pseudo réservé. */
export async function submitScore(storage, state, fetchImpl = fetch) {
  const id = identity(storage); if (!id.pseudo) return false;
  const sc = scoreOf(state);
  if (!online()) { const b = localBoard(storage).filter(e => e.pseudo !== id.pseudo); b.push({ pseudo: id.pseudo, ...sc }); storage.setItem(KEY + ':board', JSON.stringify(b)); return true; }
  return rpc('submit_score', { p_pseudo: id.pseudo, p_token: id.token, p_level: sc.level, p_renown: sc.renown, p_kills: sc.kills, p_quests: sc.quests, p_playtime: sc.playtime }, fetchImpl);
}

export function localBoard(storage) { try { return JSON.parse(storage.getItem(KEY + ':board')) ?? []; } catch { return []; } }
export const rank = list => [...list].sort((a, b) => b.level - a.level || b.renown - a.renown || b.kills - a.kills).slice(0, 50);

/** Les 50 meilleurs (niveau, puis renommée, puis victoires). */
export async function top(storage, fetchImpl = fetch) {
  if (!online()) return rank(localBoard(storage));
  const r = await fetchImpl(`${ONLINE.url}/rest/v1/leaderboard?select=pseudo,level,renown,kills,quests&order=level.desc,renown.desc,kills.desc&limit=50`, { headers: { apikey: ONLINE.anonKey, Authorization: `Bearer ${ONLINE.anonKey}` } });
  if (!r.ok) throw new Error(`Serveur : ${r.status}`);
  return r.json();
}
