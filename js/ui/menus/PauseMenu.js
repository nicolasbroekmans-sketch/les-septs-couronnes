// Menu de pause : reprendre, sauvegarder (3 emplacements), charger, paramètres, menu principal.
import { h } from '../dom.js';
import { settingsForm } from './Settings.js';

export function pauseTabs(G, { onLoad, onQuit, onSettings }) {
  const slotList = (mode, rerender) => h('ul.slots', {}, ['1', '2', '3', 'auto'].filter(s => mode === 'load' || s !== 'auto').map(slot => {
    const meta = G.saves.list().find(m => m.slot === slot);
    return h('li', {}, h('div', {}, h('b', {}, slot === 'auto' ? 'Sauvegarde automatique' : `Emplacement ${slot}`),
      h('span', {}, meta ? `${meta.name}, niveau ${meta.level} — ${meta.region} — jour ${meta.day} — ${new Date(meta.savedAt).toLocaleString('fr-FR')}` : 'Vide')),
      mode === 'save' ? h('button', { type: 'button', on: { click: () => { G.save(slot); G.ui.toast('Partie sauvegardée.', 'rep'); rerender(); } } }, meta ? 'Écraser' : 'Sauvegarder')
        : h('button', { type: 'button', disabled: !meta, on: { click: () => onLoad(slot) } }, 'Charger'));
  }));
  return [
    { id: 'pause', label: 'Pause', render: el => el.append(h('div.pause', {}, h('h3', {}, 'Le temps s’est arrêté.'),
      h('p.sub', {}, 'Commandes : ZQSD / WASD ou flèches · souris : caméra · clic gauche : attaque (maintenir = lourde) · clic droit : parer · Espace : sauter · V : esquive · Maj : courir · C : furtivité · E : interagir · H : se soigner · molette : zoom.'),
      h('div.actions', {}, h('button.btn-gold', { type: 'button', on: { click: () => G.ui.closePanel() } }, h('span', {}, 'Reprendre')),
        h('button.btn-ui', { type: 'button', on: { click: onQuit } }, 'Sauvegarder et quitter vers le menu')))) },
    { id: 'save', label: 'Sauvegarder', render: (el, rr) => el.append(slotList('save', rr)) },
    { id: 'load', label: 'Charger', render: (el, rr) => el.append(slotList('load', rr)) },
    { id: 'settings', label: 'Paramètres', render: el => el.append(settingsForm(G.settings, onSettings)) }
  ];
}
