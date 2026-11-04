// Fenêtre modale à onglets (inventaire, compétences, journal, factions, carte) et fenêtres simples.
import { $, h } from '../dom.js';

export class Panel {
  constructor(ui) { this.ui = ui; this.root = $('#panel'); this.tabs = []; }
  /** tabs : [{ id, label, render(container) }] */
  open(tabs, active = tabs[0].id, title = '') {
    this.tabs = tabs; this.title = title; this.active = active;
    this.ui.setModal('panel', true); this.root.classList.add('open'); this.render();
  }
  render() {
    if (!this.root.classList.contains('open')) return;
    const body = h('div.panel-body');
    this.root.replaceChildren(h('div.panel', { role: 'dialog', 'aria-label': this.title },
      h('div.panel-tabs', { role: 'tablist' }, this.tabs.map(t => h('button' + (t.id === this.active ? '.on' : ''), { type: 'button', role: 'tab', on: { click: () => { this.active = t.id; this.render(); } } }, t.label)),
        h('button.panel-close', { type: 'button', 'aria-label': 'Fermer', on: { click: () => this.close() } }, '✕')), body));
    this.tabs.find(t => t.id === this.active).render(body, () => this.render());
  }
  close() { this.root.classList.remove('open'); this.root.replaceChildren(); this.ui.setModal('panel', false); this.onClose?.(); }
  get isOpen() { return this.root.classList.contains('open'); }
}
