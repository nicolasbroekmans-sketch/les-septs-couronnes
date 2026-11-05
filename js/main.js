// Point d'entrée : intro → menu principal → création → choix du départ → partie (ou mode découverte).
import { audio } from './audio.js';
import { initAmbience, setReduced, fxState } from './ui/Ambience.js';
import { playIntro, leaveIntro } from './ui/menus/Intro.js';
import { ravens, clouds, clearClouds } from './ui/Transitions.js';
import { mainMenu } from './ui/menus/MainMenu.js';
import { characterCreation } from './ui/menus/CharacterCreation.js';
import { regionSelect } from './ui/menus/RegionSelect.js';
import { loadSettings, saveSettings, settingsForm } from './ui/menus/Settings.js';
import { createMap } from './ui/map/WorldMap.js';
import { createGameState } from './core/GameState.js';
import { SaveManager, memoryStorage } from './core/SaveManager.js';
import { AI_MODE } from './ai/NPCBrain.js';
import { ICONS } from './ui/Icons.js';
import { UI } from './ui/UI.js';
import { $, h } from './ui/dom.js';

const MENU_AMBIENCE = [{ name: 'wind', volume: .35 }, { name: 'fire', volume: .08 }, { name: 'raven', volume: .25, every: [14, 30] }];
const storage = (() => { try { localStorage.setItem('asoiaf-rpg:probe', '1'); localStorage.removeItem('asoiaf-rpg:probe'); return localStorage; } catch { return memoryStorage(); } })();
const settings = loadSettings(storage), saves = new SaveManager(storage);
let game = null;

function applySettings(s) {
  saveSettings(storage, s); setReduced(s.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches);
  AI_MODE.value = s.aiMode; if (window.Howler) Howler.volume(s.volume);
  game?.applySettings(s);
}
const sections = ['#intro', '#menu', '#create', '#map'];
const only = id => sections.forEach(s => $(s).classList.toggle('active', s === id));

// ---------- boutons persistants (icônes SVG) ----------
const mute = $('#mute');
mute.innerHTML = ICONS.soundOn;
mute.addEventListener('click', () => { audio.unlock(); const m = audio.toggleMute(); mute.innerHTML = m ? ICONS.soundOff : ICONS.soundOn; mute.setAttribute('aria-pressed', m); mute.title = m ? 'Activer le son' : 'Couper le son'; });
$('#settings-btn').innerHTML = ICONS.gear;
$('#settings-btn').addEventListener('click', () => openSettings());
const firstGesture = () => { audio.unlock(); if (window.Howler) Howler.volume(settings.volume); if (!game?.running) audio.setAmbience(MENU_AMBIENCE); removeEventListener('pointerdown', firstGesture); removeEventListener('keydown', firstGesture); };
addEventListener('pointerdown', firstGesture); addEventListener('keydown', firstGesture);

function openSettings() {
  const m = $('#modal');
  m.replaceChildren(h('div.panel.small', { role: 'dialog', 'aria-label': 'Paramètres' }, h('div.panel-tabs', {}, h('button.on', { type: 'button' }, 'Paramètres'),
    h('button.panel-close', { type: 'button', 'aria-label': 'Fermer', on: { click: () => m.classList.remove('open') } }, '✕')), h('div.panel-body', {}, settingsForm(settings, applySettings))));
  m.classList.add('open');
}

// ---------- parcours ----------
function toMenu() {
  only('#menu'); fxState.mode = 'embers'; fxState.paused = false; $('#ui').classList.remove('ingame');
  mainMenu({ saves, onNew: newGame, onLoad: loadSlot, onDiscover: discover, onSettings: openSettings });
  audio.music(true);
}
/** Nouvelle partie : prologue (grande bataille gagnée) → « Bienvenue à Westeros » → création du personnage. */
async function newGame() {
  audio.music(false); await clouds('in'); await ensureGame();
  only(null); fxState.paused = true; $('#ui').classList.add('ingame');
  let done = false;
  const next = () => { if (done) return; done = true; ui.skipButton(false); game.stop(); game.clearBattle(); ui.closePanel(); ui.battleHud(null); ui.showHud(false); $('#ui').classList.remove('ingame'); fxState.paused = false; createCharacter(); };
  try { await game.prologue(next); ui.skipButton(true, next); }
  catch (e) { console.warn(e); next(); }
  clearClouds();
}
function createCharacter() {
  only('#create'); fxState.mode = 'dust';
  characterCreation({ onBack: toMenu, onDone: creation => {
    only(null); $('#map').classList.add('active');
    regionSelect({ onBack: toMenu, onPick: region => play(createGameState(creation, region)) });
  } });
}
function loadSlot(slot) {
  try { const s = saves.load(slot); if (s) play(s); }
  catch (e) { game?.ui.toast?.('Sauvegarde illisible : ' + e.message, 'warn'); console.warn(e); }
}
function discover() {
  only('#map'); fxState.mode = 'dust';
  $('#map-title').innerHTML = '<span class="kicker">Mode découverte</span><h2>Westeros &amp; Essos</h2>';
  $('#map-help').textContent = 'Survolez un continent · cliquez pour zoomer · un sceau ouvre l’exploration libre';
  const map = createMap({ mode: 'discover', onLevel: () => {}, onPlace: async p => { await clouds('in'); await ensureGame(); clearClouds(); await game.explore(p); only(null); fxState.paused = true; } });
  map.intro(); ravens();
  $('#map-back').hidden = false;
}
$('#map-back').addEventListener('click', () => { $('#map-back').hidden = true; toMenu(); });

async function ensureGame() {
  if (game) return game;
  const { Game } = await import('./game/Game.js');
  game = new Game(ui, settings, storage);
  ui.attach(game); window.__game = game; // accès de test (scénario de bout en bout)
  game.testMode = /test/.test(location.hash);
  return game;
}
async function play(state) {
  audio.music(false); audio.sfx('whoosh', .5);
  await clouds('in');
  await ensureGame();
  only(null); fxState.paused = true; $('#ui').classList.add('ingame');
  try { await game.start(state); }
  catch (e) { console.warn(e); ui.toast('Impossible de lancer la partie : ' + e.message, 'warn'); toMenu(); }
  clearClouds();
}
const ui = new UI({
  onLoad: slot => { ui.closePanel(); loadSlot(slot); },
  onQuit: () => { ui.closePanel(); game.autosave(); game.stop(); ui.showHud(false); toMenu(); },
  onSettings: applySettings
});

// ---------- démarrage ----------
initAmbience();
applySettings(settings);
playIntro(async () => { audio.unlock(); audio.setAmbience(MENU_AMBIENCE); ravens(); await leaveIntro(); toMenu(); });
// Accès direct pour les tests : index.html#play=winterfell lance une partie de démonstration.
const m = location.hash.match(/^#play=(\w+)/);
if (m) play(createGameState({ name: 'Testeur', sex: 'homme', age: 25, origin: 'nord', classId: 'guerrier', difficulty: 'normal', appearance: {} }, m[1], 7));
