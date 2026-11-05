// Qui attaque qui : posture des groupes (hostile, pourparlers, pacifié), provocation, réputation,
// primes (crimes) et relations entre factions pour les combats entre PNJ.
import { hostileToPlayer, relation } from '../factions/Reputation.js';
import { attitude } from '../ai/Memory.js';

export function makeHostility(game) {
  const vsPlayer = n => {
    if (n.provoked) return true;
    const st = game.region?.stance(n.group);
    if (st === 'hostile') return true;
    if (st === 'parley' || st === 'pacified') return false;
    const s = game.core.state;
    return hostileToPlayer(s, n.faction) || attitude(s, n.id, n.faction) === 'hostile';
  };
  // Bataille : chaque soldat a un camp (A = héros et alliés, B = ennemis). Compagnons = camp du héros.
  const side = x => x.kind === 'player' || x.def?.follower ? 'A' : x.team;
  return (a, b) => {
    if (a === b || !a.alive || !b.alive || a.surrendered || b.surrendered || a.hidden || b.hidden) return false;
    if (a.team || b.team) return !!side(a) && !!side(b) && side(a) !== side(b);
    if ((a.kind === 'player' || a.def?.follower) && (b.kind === 'player' || b.def?.follower)) return false;
    if (a.kind === 'player' || a.def?.follower) return vsPlayer(b);
    if (b.kind === 'player' || b.def?.follower) return vsPlayer(a);
    if ((a.group && a.group === b.group) || a.faction === b.faction) return false;
    const blocked = ['parley', 'pacified'];
    if (blocked.includes(game.region?.stance(a.group)) || blocked.includes(game.region?.stance(b.group))) return false;
    return relation(a.faction, b.faction) <= -50;
  };
}
