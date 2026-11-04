// Audit statique du projet : limite de lignes, imports résolus, exports existants, dépendances circulaires.
// Usage : node tools/audit.mjs   (code de sortie ≠ 0 en cas de problème)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..'), LIMIT = 200;
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = [...walk(join(ROOT, 'js')), ...walk(join(ROOT, 'css')), ...walk(join(ROOT, 'tests')), ...walk(join(ROOT, 'tools'))].filter(f => /\.(m?js|css)$/.test(f));
const problems = [], warnings = [];
const GENERATED = ['js/ai/tactics-weights.js'];

// 1. Limite de lignes
for (const f of files) {
  const rel = relative(ROOT, f), n = readFileSync(f, 'utf8').split('\n').length;
  if (n > LIMIT && !GENERATED.includes(rel)) problems.push(`${rel} : ${n} lignes (> ${LIMIT})`);
}
// 2. Imports et exports
const exportsOf = new Map(), graph = new Map();
const parseExports = src => {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let|var)\s+([^;]+)/g)) for (const d of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=/g)) names.add(d[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) for (const part of m[1].split(',')) { const n = part.trim().split(/\s+as\s+/).pop().trim(); if (n) names.add(n); }
  if (/export\s+default/.test(src)) names.add('default');
  return names;
};
const jsFiles = files.filter(f => /\.m?js$/.test(f));
for (const f of jsFiles) exportsOf.set(f, parseExports(readFileSync(f, 'utf8')));
for (const f of jsFiles) {
  const src = readFileSync(f, 'utf8'), deps = [];
  for (const m of src.matchAll(/import\s+([^;'"]*?)\s+from\s+['"](\.[^'"]+)['"]/g)) {
    const target = resolve(dirname(f), m[2]);
    if (!existsSync(target)) { problems.push(`${relative(ROOT, f)} : import introuvable ${m[2]}`); continue; }
    deps.push(target);
    const spec = m[1].trim(), named = spec.match(/\{([^}]*)\}/);
    const want = named ? named[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean) : [];
    if (/^[A-Za-z_$][\w$]*\s*(,|$)/.test(spec)) want.push('default');
    for (const w of want) if (!exportsOf.get(target)?.has(w)) problems.push(`${relative(ROOT, f)} : « ${w} » n'est pas exporté par ${m[2]}`);
  }
  for (const m of src.matchAll(/import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) if (!existsSync(resolve(dirname(f), m[1]))) problems.push(`${relative(ROOT, f)} : import dynamique introuvable ${m[1]}`);
  graph.set(f, deps);
}
// 3. Cycles (DFS)
const state = new Map(), stack = [];
const dfs = f => {
  state.set(f, 1); stack.push(f);
  for (const d of graph.get(f) ?? []) {
    if (state.get(d) === 1) { const cyc = stack.slice(stack.indexOf(d)).concat(d).map(x => relative(ROOT, x)); problems.push('Dépendance circulaire : ' + cyc.join(' → ')); }
    else if (!state.get(d)) dfs(d);
  }
  state.set(f, 2); stack.pop();
};
for (const f of jsFiles) if (!state.get(f)) dfs(f);
// 4. Ressources référencées par les scènes et régions
for (const f of jsFiles) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/hdri:\s*'([\w-]+)'/g)) if (!existsSync(join(ROOT, 'assets/hdri', m[1] + '.hdr'))) problems.push(`${relative(ROOT, f)} : HDRI manquant ${m[1]}`);
  for (const m of src.matchAll(/mat\('([\w-]+)'/g)) if (!existsSync(join(ROOT, 'assets/textures', m[1] + '.webp'))) problems.push(`${relative(ROOT, f)} : texture manquante ${m[1]}`);
  for (const m of src.matchAll(/gltf\('([\w-]+)'\)/g)) if (!existsSync(join(ROOT, 'assets/models', m[1] + '.glb'))) problems.push(`${relative(ROOT, f)} : modèle manquant ${m[1]}`);
}
const total = jsFiles.reduce((s, f) => s + readFileSync(f, 'utf8').split('\n').length, 0);
console.log(`Audit : ${files.length} fichiers (${jsFiles.length} JS, ${total} lignes JS), limite ${LIMIT} lignes/fichier.`);
if (problems.length) { console.log(`\n${problems.length} problème(s) :\n - ` + problems.join('\n - ')); process.exit(1); }
console.log('Aucun problème : lignes, imports, exports, cycles et ressources OK.');
