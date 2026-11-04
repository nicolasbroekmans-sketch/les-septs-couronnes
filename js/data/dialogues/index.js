// Regroupe les arbres de dialogue de toutes les régions.
import kingslanding from './kingslanding.js';
import winterfell from './winterfell.js';
import wall from './wall.js';

export const DIALOGUES = { ...kingslanding, ...winterfell, ...wall };
