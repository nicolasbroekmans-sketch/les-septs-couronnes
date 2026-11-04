// Petits utilitaires DOM sans framework.
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
/** h('div.cls#id', { attrs, on: { click } }, ...children) */
export function h(spec, props = {}, ...children) {
  const [, tag = 'div', rest = ''] = spec.match(/^([a-z0-9]+)?(.*)$/i);
  const el = document.createElement(tag || 'div');
  for (const part of rest.match(/[.#][^.#]+/g) ?? []) part[0] === '.' ? el.classList.add(part.slice(1)) : (el.id = part.slice(1));
  for (const [k, v] of Object.entries(props ?? {})) {
    if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function show(el, on = true) { el.classList.toggle('open', on); el.setAttribute('aria-hidden', on ? 'false' : 'true'); }
