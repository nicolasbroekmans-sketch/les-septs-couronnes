// Fenêtre de dialogue : texte du PNJ, options (clic ou touches 1–9), tests de compétence signalés.
import { $, h, esc } from '../dom.js';
import { audio } from '../../audio.js';

export class DialogueView {
  constructor(ui) { this.ui = ui; this.root = $('#dialogue'); this.onKey = e => this.key(e); }
  open(view, choose, onClose) {
    this.choose = choose; this.onClose = onClose; this.ui.setModal('dialogue', true);
    addEventListener('keydown', this.onKey); this.render(view);
  }
  render(v) {
    if (!v) return this.close();
    this.view = v; audio.sfx('parchment', .25);
    this.root.replaceChildren(h('div.dlg', {},
      h('div.dlg-head', {}, h('span.kicker', {}, v.npc.surrendered ? 'Reddition' : (v.npc.role === 'merchant' ? 'Marchand' : v.npc.role === 'guard' ? 'Garde' : 'Rencontre')), h('h3', {}, v.npc.name)),
      h('p.dlg-text', { html: esc(v.text) }),
      h('ol.dlg-opts', {}, v.options.map((o, i) => h('li', {}, h('button' + (o.ok ? '' : '.risky'), { type: 'button', on: { click: () => this.pick(i) } }, h('b', {}, `${i + 1}.`), ' ', o.text))))));
    this.root.classList.add('open');
    this.root.querySelector('button')?.focus({ preventScroll: true });
  }
  pick(i) { this.render(this.choose(i)); }
  key(e) { const n = +e.key; if (n >= 1 && n <= (this.view?.options.length ?? 0)) { e.preventDefault(); this.pick(n - 1); } }
  close() {
    removeEventListener('keydown', this.onKey); this.root.classList.remove('open'); this.root.replaceChildren();
    this.ui.setModal('dialogue', false); this.onClose?.(); this.onClose = null;
  }
}
