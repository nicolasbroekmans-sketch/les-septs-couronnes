// Création du personnage : identité, origine, classe, difficulté, apparence (aperçu 3D), histoire.
import { $, h } from '../dom.js';
import { CLASSES, ORIGINS, DIFFICULTIES, ATTRIBUTES } from '../../data/classes.js';
import { validateCreation, APPEARANCE_DEFAULT } from '../../player/Character.js';
import { CreationPreview } from './CreationPreview.js';

const SKINS = ['#f0d4bc', '#e6c4a8', '#d8b49a', '#c4987a', '#a87a5a', '#8a5e42', '#5e3e2a'];
const HAIRS = ['#1e1612', '#3a2a1e', '#5a3a22', '#8a6a3a', '#c8a870', '#a04a22', '#9a9a9a'];
const TUNICS = ['#5a3a2a', '#3a4a5a', '#4a5a3a', '#6a2a2a', '#5a5f66', '#6a5a3a', '#2a2a2e'];
const STORIES = {
  guerrier: 'Ancien homme d’armes d’un seigneur tombé au combat, je vends mon épée à qui la paie.',
  archer: 'Braconnier dans les forêts royales, j’ai fui avant que les gardes ne me pendent.',
  voleur: 'Né dans les ruelles, j’ai appris à compter les pièces… dans la bourse des autres.',
  marchand: 'Fils de drapier, j’ai hérité d’une charrette, de dettes et d’une ambition sans limites.',
  noble: 'Dernier héritier d’une maison ruinée par la Rébellion, je veux rendre son nom à ma famille.',
  vagabond: 'Je ne me souviens pas d’où je viens. La route est ma seule maison.'
};

export function characterCreation({ onDone, onBack }) {
  const root = $('#create'), c = { name: '', sex: 'homme', age: 24, origin: 'couronne', classId: 'guerrier', difficulty: 'normal', backstory: STORIES.guerrier, appearance: { ...APPEARANCE_DEFAULT } };
  const canvas = h('canvas.preview', { 'aria-label': 'Aperçu du personnage' }), errors = h('p.errors', { role: 'alert' });
  const stats = h('ul.attrs.mini'), story = h('textarea', { rows: 4, maxlength: 400, on: { input: e => (c.backstory = e.target.value) } });
  let preview;
  const refresh = () => {
    const cls = CLASSES[c.classId], a = { ...cls.attrs }; for (const [k, v] of Object.entries(ORIGINS[c.origin].bonus)) a[k] += v;
    stats.replaceChildren(...Object.entries(ATTRIBUTES).map(([k, l]) => h('li', {}, h('span', {}, l), h('b', {}, a[k]))));
    preview?.set({ ...c.appearance, female: c.sex === 'femme', armor: cls.equip[1] }, cls.equip[0]);
    root.querySelectorAll('.class-card').forEach(el => el.classList.toggle('on', el.dataset.id === c.classId));
  };
  const swatches = (key, colors) => h('div.swatches', {}, colors.map(col => h('button.sw', { type: 'button', style: { background: col }, 'aria-label': col, on: { click: e => { c.appearance[key] = col; e.target.parentNode.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', b === e.target)); refresh(); } } })));
  const field = (label, input) => h('label.row', {}, h('span', {}, label), input);
  const select = (key, table, fmt = v => v.name) => h('select', { on: { change: e => { c[key] = e.target.value; refresh(); } } }, Object.entries(table).map(([k, v]) => h('option', { value: k, selected: c[key] === k }, fmt(v))));
  story.value = c.backstory;
  root.replaceChildren(h('div.create', {},
    h('header', {}, h('button.btn-ui', { type: 'button', on: { click: () => { preview?.dispose(); onBack(); } } }, '← Retour'), h('h2', {}, 'Création du personnage')),
    h('div.create-grid', {},
      h('section.form', {},
        field('Nom', h('input', { type: 'text', maxlength: 24, placeholder: 'Ex. Aelor Mainferme', autocomplete: 'off', on: { input: e => (c.name = e.target.value) } })),
        field('Sexe', h('div.radio', {}, ['homme', 'femme'].map(s => h('label', {}, h('input', { type: 'radio', name: 'sex', value: s, checked: c.sex === s, on: { change: () => { c.sex = s; refresh(); } } }), s === 'homme' ? 'Homme' : 'Femme')))),
        field('Âge', h('input', { type: 'number', min: 16, max: 70, value: c.age, on: { input: e => (c.age = +e.target.value) } })),
        field('Origine', select('origin', ORIGINS, o => `${o.name} (+1 ${Object.keys(o.bonus)[0]})`)),
        field('Difficulté', select('difficulty', DIFFICULTIES)),
        h('h4', {}, 'Classe de départ'),
        h('div.classes', {}, Object.entries(CLASSES).map(([id, cl]) => h('button.class-card', { type: 'button', 'data-id': id, on: { click: () => { c.classId = id; story.value = c.backstory = STORIES[id]; refresh(); } } }, h('b', {}, cl.name), h('small', {}, cl.desc)))),
        h('h4', {}, 'Histoire personnelle'), story),
      h('section.look', {}, canvas, h('h4', {}, 'Attributs de départ'), stats,
        h('h4', {}, 'Apparence'), field('Peau', swatches('skin', SKINS)), field('Cheveux', swatches('hair', HAIRS)), field('Tunique', swatches('tunic', TUNICS)),
        field('Barbe', h('input', { type: 'checkbox', on: { change: e => { c.appearance.beard = e.target.checked; refresh(); } } })),
        field('Taille', h('input', { type: 'range', min: .9, max: 1.1, step: .01, value: 1, on: { input: e => { c.appearance.height = +e.target.value; refresh(); } } })))),
    h('footer', {}, errors, h('button.btn-gold', { type: 'button', on: { click: () => {
      const e = validateCreation(c); errors.textContent = e.join(' ');
      if (!e.length) { preview?.dispose(); onDone({ ...c, appearance: { ...c.appearance } }); }
    } } }, h('span', {}, 'Choisir mon point de départ')))));
  root.classList.add('active');
  try { preview = new CreationPreview(canvas); } catch { canvas.replaceWith(h('p.sub', {}, 'Aperçu 3D indisponible (WebGL).')); }
  refresh();
  root.querySelector('input')?.focus();
}
