// Fabrique de personnages : modèle réaliste dès que la bibliothèque est chargée, sinon le personnage procédural.
import { Humanoid } from '../Humanoid.js';
import { RealHumanoid } from './RealHumanoid.js';
import { LIB } from './library.js';
export { loadCharacters } from './library.js';

export function makeHumanoid(look = {}) {
  if (LIB.ready) try { return new RealHumanoid(look); } catch (e) { console.warn('Personnage réaliste impossible :', e.message); }
  return new Humanoid(look);
}
