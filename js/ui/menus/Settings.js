// Paramètres persistants : qualité graphique, son, souris, champ de vision, animations, mode d'IA.
import { h } from '../dom.js';

const KEY = 'asoiaf-settings';
export const DEFAULTS = { quality: 'medium', volume: .8, sensitivity: 1, invertY: false, fov: 70, reduced: false, aiMode: 'nn', timeScale: 1 };

export function loadSettings(storage) {
  try { return { ...DEFAULTS, ...JSON.parse(storage.getItem(KEY) ?? '{}') }; } catch { return { ...DEFAULTS }; }
}
export function saveSettings(storage, s) { try { storage.setItem(KEY, JSON.stringify(s)); } catch { /* stockage indisponible : réglages non mémorisés */ } }

/** Formulaire ; onChange(settings) appelé à chaque modification. */
export function settingsForm(s, onChange) {
  const row = (label, input) => h('label.row', {}, h('span', {}, label), input);
  const set = (k, v) => { s[k] = v; onChange(s); };
  const sel = (k, opts) => h('select', { on: { change: e => set(k, e.target.value) } }, opts.map(([v, l]) => h('option', { value: v, selected: s[k] === v }, l)));
  const range = (k, min, max, step) => h('input', { type: 'range', min, max, step, value: s[k], on: { input: e => set(k, +e.target.value) } });
  const box = k => h('input', { type: 'checkbox', checked: s[k], on: { change: e => set(k, e.target.checked) } });
  return h('div.settings', {},
    row('Qualité graphique', sel('quality', [['low', 'Basse (ordinateurs modestes)'], ['medium', 'Moyenne'], ['high', 'Haute']])),
    row('Volume', range('volume', 0, 1, .05)),
    row('Sensibilité de la souris', range('sensitivity', .3, 2.5, .1)),
    row('Inverser l’axe vertical', box('invertY')),
    row('Champ de vision', range('fov', 55, 95, 1)),
    row('Réduire les animations', box('reduced')),
    row('Vitesse du temps (1 s = n min)', range('timeScale', .5, 4, .5)),
    row('IA tactique des ennemis', sel('aiMode', [['nn', 'Réseau neuronal entraîné'], ['utility', 'IA utilitaire (référence)']])));
}
