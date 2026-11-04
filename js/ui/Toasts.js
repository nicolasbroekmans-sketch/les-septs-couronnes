// Notifications empilées (quêtes, butin, réputation, avertissements) et cris des PNJ.
import { h } from './dom.js';

export class Toasts {
  constructor(root) { this.root = root; }
  push(text, kind = 'info', ms = 4200) {
    const t = h('div.toast.' + kind, { role: 'status' }, text);
    this.root.prepend(t);
    while (this.root.children.length > 5) this.root.lastChild.remove();
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, ms);
  }
}
