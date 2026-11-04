// Façade d'interface utilisée par le jeu : HUD, notifications, dialogues, panneaux, chargement, mort.
import { $, h } from './dom.js';
import { Hud } from './hud/Hud.js';
import { Toasts } from './Toasts.js';
import { Floaters } from './Floaters.js';
import { DialogueView } from './panels/Dialogue.js';
import { Panel } from './panels/Panel.js';
import { tradeTab } from './panels/Trade.js';
import { inventoryTab } from './panels/InventoryTab.js';
import { skillsTab } from './panels/SkillsTab.js';
import { journalTab } from './panels/JournalTab.js';
import { factionsTab } from './panels/FactionsTab.js';
import { pauseTabs } from './menus/PauseMenu.js';

export class UI {
  constructor(handlers) {
    $('#hud').replaceChildren(Hud.markup());
    this.handlers = handlers; this.modals = new Set();
    this.hudView = new Hud(); this.toasts = new Toasts($('#toasts')); this.floaters = new Floaters($('#floaters'));
    this.dlg = new DialogueView(this); this.panel = new Panel(this);
    addEventListener('keydown', e => this.key(e));
    $('#lock-hint').addEventListener('click', () => this.game?.input.lock());
  }
  attach(G) { this.game = G; this.panel.onClose = () => this.lockHint(true); }
  get modal() { return this.modals.size > 0; }
  setModal(name, on) {
    on ? this.modals.add(name) : this.modals.delete(name);
    if (this.game) { this.game.paused = this.modals.has('panel') || this.modals.has('dead'); if (on) this.game.input.unlock(); this.game.input.reset(); }
    this.lockHint(!this.modal);
  }
  key(e) {
    const G = this.game; if (!G?.running || e.target.closest?.('input, textarea, select')) return;
    if (this.modals.has('dialogue') || this.modals.has('dead')) return;
    const tabs = { KeyI: 'inv', KeyK: 'skills', KeyJ: 'journal', KeyL: 'factions', Tab: 'inv' };
    if (tabs[e.code]) { e.preventDefault(); if (this.panel.isOpen && this.panel.active === tabs[e.code]) return this.closePanel(); return this.openCharacter(tabs[e.code]); }
    if (e.code === 'Escape' && this.panel.isOpen) return this.closePanel();
    if (e.code === 'Escape' && !G.input.locked && !this.modal) this.openPause();
  }
  openCharacter(tab = 'inv') { const G = this.game; this.panel.open([inventoryTab(G), skillsTab(G), journalTab(G), factionsTab(G)], tab, 'Personnage'); }
  openPause() { this.panel.open(pauseTabs(this.game, this.handlers), 'pause', 'Pause'); }
  openTrade(actor) { if (actor) this.panel.open([tradeTab(this.game, actor), inventoryTab(this.game)], 'trade', 'Commerce'); }
  closePanel() { this.panel.close(); }
  refresh() { if (this.panel.isOpen && this.panel.active !== 'settings') this.panel.render(); }
  toast(t, k) { this.toasts.push(t, k); }
  damage(actor, res) { this.floaters.damage(actor, res); }
  bark(actor, text) { this.floaters.bark(actor, text); }
  prompt(t) { this.hudView.prompt(t); }
  lore(p) { this.hudView.lore(p); }
  journalHint() {}
  hud(G) { const dt = G.frameDt ?? 1 / 60; this.hudView.update(G, dt); this.floaters.update(dt, G.renderer.camera); }
  dialogue(view, choose, onClose) { this.dlg.open(view, choose, onClose); }
  regionTitle(def) { this.hudView.regionTitle(def); this.hudView.bakeMap(this.game); }
  showHud(on) { this.hudView.show(on); $('#world').classList.toggle('active', on); }
  lockHint(on) { $('#lock-hint').classList.toggle('off', !(on && this.game?.running && !this.modal && !this.game.input.locked)); }
  saved() { const s = $('#saved'); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); }
  loading(v, name, text) {
    const L = $('#loader'); L.classList.toggle('open', v < 1);
    if (name) $('#loader-name').textContent = name; if (text) $('#loader-text').textContent = text;
    $('#loader-bar').style.width = `${Math.round(v * 100)}%`; $('#loader-pct').textContent = `${Math.round(v * 100)} %`;
  }
  gameOver() {
    this.setModal('dead', true);
    const el = $('#dead'), latest = this.game.saves.latest();
    el.replaceChildren(h('div.dead', {}, h('h2', {}, 'Vous êtes mort'), h('p', {}, 'Le chemin s’arrête ici… à moins que les dieux n’en décident autrement.'),
      h('div.actions', {}, h('button.btn-gold', { type: 'button', disabled: !latest, on: { click: () => { this.closeDead(); this.handlers.onLoad(latest.slot); } } }, h('span', {}, 'Charger la dernière sauvegarde')),
        h('button.btn-ui', { type: 'button', on: { click: () => { this.closeDead(); this.game.respawn(); } } }, 'Se relever (−20 % d’or)'))));
    el.classList.add('open');
  }
  closeDead() { $('#dead').classList.remove('open'); this.setModal('dead', false); }
}
