// Scénario de bout en bout (navigateur réel, Playwright) — boucle de jeu complète :
// menu → création → choix de Winterfell → quête acceptée → voyage → combat contre des PNJ IA →
// objet récupéré → récompense → compétence apprise → sauvegarde → rechargement → reprise.
// Usage : servir le projet (python -m http.server 8765) puis  node tests/e2e/rpg-flow.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.URL ?? 'http://localhost:8765/', BOT = readFileSync(new URL('./bot.js', import.meta.url), 'utf8');
const steps = []; const ok = (name, cond, info = '') => { steps.push([cond ? 'OK ' : 'ÉCHEC', name, info]); console.log(cond ? '  ✔' : '  ✘', name, info); if (!cond) throw new Error(name); };

const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
await page.addInitScript(() => localStorage.setItem('asoiaf-settings', JSON.stringify({ quality: 'low', reduced: true })));
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
const G = fn => page.evaluate(fn);
const until = async (fn, ms = 60000, label = '') => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(500); } throw new Error('Délai dépassé : ' + label); };
const tp = (x, z) => G(`(() => { const g = __game, p = g.player; p.pos.x = ${x}; p.pos.z = ${z}; p.pos.y = g.physics.groundAt(${x}, ${z}, g.physics.groundFn(${x}, ${z}) + 1); })()`);
const walk = async (x, z, r = 1.5, ms = 90000) => { await G(`__bot.goal = { x: ${x}, z: ${z}, r: ${r} }; __bot.mode = 'walk'`); await until(`__bot.mode === 'idle'`, ms, `marche vers ${x},${z}`); };
const toNpc = async id => { const [x, z] = await G(`(() => { const a = __game.actors.find(a => a.id === '${id}'); return [a.pos.x, a.pos.z]; })()`); await walk(x, z, 1.8); };
const press = async code => { await G(`__game.input.pressed.add('${code}')`); await page.waitForTimeout(400); };
const option = async frag => { await page.locator('#dialogue button', { hasText: frag }).first().click(); await page.waitForTimeout(500); };

try {
  console.log('1. Menu, création du personnage, choix du départ');
  await page.goto(BASE + '#test');
  await G('gsap.ticker.lagSmoothing(0)');
  await page.click('#enter'); await until(`document.querySelector('#menu').classList.contains('active')`, 30000, 'menu');
  await page.click('text=Nouvelle partie', { timeout: 60000 });
  await until(`document.querySelector('#skip-prologue') && window.__game?.battle`, 240000, 'prologue (bataille d’ouverture)');
  ok('Prologue : grande bataille lancée', await G(`__game.actors.filter(a => a.kind === 'crowd').length >= 190`));
  await page.click('#skip-prologue');
  await until(`document.querySelector('#create').classList.contains('active')`, 30000, 'création');
  await page.fill('#create input[type=text]', 'Aelor Mainferme');
  await page.click('.class-card[data-id=guerrier]');
  await page.selectOption('#create select', 'nord');
  await page.click('text=Choisir mon point de départ');
  await until(`document.querySelector('#map').classList.contains('zoomed') && document.querySelectorAll('.seal[visibility=visible]').length === 3`, 60000, 'carte de départ');
  await page.waitForTimeout(1500);
  for (let i = 0; i < 6 && !(await G(`document.querySelector('#start-card').classList.contains('open')`)); i++) {
    await page.locator('.seal[aria-label^="Winterfell"] .wax').click({ force: true }).catch(() => {});
    await until(`document.querySelector('#start-card').classList.contains('open')`, 20000, 'fiche de départ').catch(() => {});
  }
  await until(`document.querySelector('#start-card').classList.contains('open')`, 5000, 'fiche de départ');
  await page.click('text=Commencer à Winterfell', { timeout: 60000 });
  await until('window.__game?.running', 240000, 'chargement de Winterfell');
  ok('Partie lancée à Winterfell', await G(`__game.region.def.id === 'winterfell' && __game.core.state.player.name === 'Aelor Mainferme'`));
  await page.addScriptTag({ content: BOT });

  console.log('2. Parler au forgeron et accepter la quête');
  await tp(6, 10); await toNpc('torvald');
  await until(`document.querySelector('#prompt').textContent.includes('Torvald')`, 60000, 'invite E');
  await press('KeyE'); await until(`document.querySelector('#dialogue').classList.contains('open')`, 60000, 'dialogue');
  await option('Je vous la ramène');
  ok('Quête « Le fer volé » acceptée', await G(`__game.core.quests.status('wf_iron') === 'active'`));

  console.log('3. Voyage vers le camp des déserteurs et combat');
  await tp(-105, -28); await walk(-105, -50, 2);
  ok('Camp trouvé (étape suivante)', await G(`__game.core.state.quests.wf_iron.step === 'recover'`));
  const gold0 = await G('__game.core.state.player.gold');
  await G(`__bot.mode = 'fight'`);
  await until(`!__game.actors.some(a => a !== __game.player && a.alive && __game.hostile(__game.player, a)) || !__game.player.alive`, 600000, 'fin du combat');
  ok('Le joueur a survécu au combat', await G('__game.player.alive'), await G(`'PV ' + Math.round(__game.player.fighter.hp)`));
  const fight = await G(`JSON.stringify({ morts: __game.actors.filter(a => a.group === 'wf_deserters' && !a.alive).length, rendus: __game.actors.filter(a => a.surrendered).map(a => a.name), vaincus: __game.actors.filter(a => a.group === 'wf_deserters' && a.defeated).length })`);
  ok('Déserteurs vaincus par le combat réel (tués, rendus ou en fuite)', JSON.parse(fight).vaincus >= 2, fight);
  const wat = await G(`!!__game.actors.find(a => a.id === 'wat' && a.surrendered)`);
  if (wat) {
    const w = await G(`(() => { const a = __game.actors.find(a => a.id === 'wat'); return [a.pos.x, a.pos.z]; })()`);
    await walk(w[0], w[1], 1.8); await press('KeyE'); await until(`document.querySelector('#dialogue').classList.contains('open')`, 60000, 'reddition');
    await option('Épargner Wat');
    ok('Wat s’est rendu et a été épargné', await G(`__game.core.state.npcs.wat.flags.spared === true`));
  }
  console.log('4. Récupérer la caisse');
  await walk(-103, -65.5, 1);
  // un ennemi rendu peut passer devant la caisse : si E ouvre son dialogue, on le referme et on réessaie
  for (let i = 0; i < 4 && !(await G(`__game.core.state.player.inventory.some(s => s.id === 'caisse_fer')`)); i++) {
    await until(`document.querySelector('#prompt').textContent.includes('caisse')`, 60000, 'invite caisse');
    await press('KeyE');
    if (await G(`document.querySelector('#dialogue').classList.contains('open')`)) { await G(`document.querySelector('#dialogue button:last-of-type')?.click()`); await page.waitForTimeout(600); }
  }
  ok('Caisse récupérée, étape « retour »', await G(`__game.core.state.player.inventory.some(s => s.id === 'caisse_fer') && __game.core.state.quests.wf_iron.step === 'back'`));

  console.log('5. Retour chez Torvald et récompense');
  await tp(6, 10); await toNpc('torvald');
  await until(`document.querySelector('#prompt').textContent.includes('Torvald')`, 60000, 'invite E');
  await press('KeyE'); await until(`document.querySelector('#dialogue').classList.contains('open')`, 60000, 'dialogue');
  await option('La voici');
  const st = await G(`JSON.stringify({ q: __game.core.quests.status('wf_iron'), gold: __game.core.state.player.gold, lvl: __game.core.state.player.level, sp: __game.core.state.player.skillPoints, stark: __game.core.state.factions.stark })`);
  const S = JSON.parse(st);
  ok('Quête terminée avec or, XP et réputation', S.q === 'completed' && S.gold >= gold0 + 90 && S.stark > 15, st);
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(800);
  await G(`document.querySelector('#dialogue').classList.contains('open') && document.querySelector('#dialogue button:last-child')?.click()`);

  console.log('6. Apprendre une compétence');
  await page.keyboard.press('KeyK');
  await until(`document.querySelector('.skill.can button')`, 30000, 'arbre de compétences');
  const before = await G('__game.core.state.player.skills.length');
  await page.locator('.skill.can button').first().click(); await page.waitForTimeout(500);
  ok('Compétence apprise', await G('__game.core.state.player.skills.length') === before + 1, await G('__game.core.state.player.skills.join()'));
  await page.keyboard.press('Escape');
  await until(`!document.querySelector('#panel').classList.contains('open')`, 30000, 'fermeture du panneau');

  console.log('7. Sauvegarder, recharger la page, reprendre');
  for (let i = 0; i < 4 && !(await G(`document.querySelector('#panel').classList.contains('open')`)); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(1500); }
  await page.click('.panel-tabs button:has-text("Sauvegarder")', { timeout: 60000 });
  await page.locator('.slots li', { hasText: 'Emplacement 1' }).locator('button').click(); await page.waitForTimeout(600);
  const snap = await G(`JSON.stringify({ skills: __game.core.state.player.skills, gold: __game.core.state.player.gold, q: __game.core.state.quests.wf_iron.state, pos: __game.player.pos })`);
  await page.goto(BASE + '?reload=1#test'); await G('gsap.ticker.lagSmoothing(0)');
  ok('Page réellement rechargée (nouvelle instance du jeu)', await G('!window.__game'));
  await page.click('#enter'); await until(`document.querySelector('#menu').classList.contains('active')`, 30000, 'menu');
  await page.click('text=Charger une partie', { timeout: 60000 }); await page.click('.slot:has-text("Emplacement 1")', { timeout: 60000 });
  await until('window.__game?.running', 240000, 'rechargement');
  const after = await G(`JSON.stringify({ skills: __game.core.state.player.skills, gold: __game.core.state.player.gold, q: __game.core.state.quests.wf_iron.state, pos: __game.player.pos })`);
  const A = JSON.parse(after), B = JSON.parse(snap);
  ok('Partie reprise à l’identique', JSON.stringify(A.skills) === JSON.stringify(B.skills) && A.gold === B.gold && A.q === 'completed' && Math.hypot(A.pos.x - B.pos.x, A.pos.z - B.pos.z) < 1, after);
  ok('Aucune erreur JavaScript pendant la partie', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  console.log('ÉCHEC :', e.message, '\nErreurs page :', errors.slice(0, 5));
  await page.screenshot({ path: process.env.SHOT ?? 'e2e-failure.png' }).catch(() => {});
  process.exitCode = 1;
} finally {
  await page.screenshot({ path: process.env.SHOT_END ?? 'e2e-end.png' }).catch(() => {});
  await browser.close();
  console.log('\nRésumé :', steps.filter(s => s[0] === 'OK ').length, '/', steps.length, 'étapes réussies');
}
