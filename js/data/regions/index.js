// Régions jouables : les trois régions de départ (avec quêtes) et tous les autres lieux de la carte (générés).
import kingslanding from './kingslanding.js';
import winterfell from './winterfell.js';
import wall from './wall.js';
import { placeRegions } from './places.js';

const STORY = { kingslanding, winterfell, wall };
export const REGIONS = { ...STORY, ...placeRegions(Object.keys(STORY)) };
