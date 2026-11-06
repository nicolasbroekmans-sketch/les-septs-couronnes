// Équipement accroché aux personnages réalistes : cape (avec blason de la maison) et casque de fer.
import * as THREE from 'three';
import { bannerTexture, HOUSES } from '../builders/sigils.js';

const cache = new Map();
/** Cape : pivot en haut du dos (la rotation x la fait voler vers l'arrière), arrondie, blason au dos. */
export function makeCloak(look) {
  const pivot = new THREE.Group();
  const geo = new THREE.CylinderGeometry(.24, .38, 1.12, 14, 4, true, Math.PI - .95, 1.9).translate(0, -.56, .14);
  const key = 'cloak' + look.cloak; if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color: look.cloak, roughness: .95, side: THREE.DoubleSide }));
  const c = new THREE.Mesh(geo, cache.get(key)); c.castShadow = true; pivot.add(c);
  const H = HOUSES[look.house];
  if (H) {
    const k = 'sig' + look.house; if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ map: bannerTexture(...H), roughness: .9, transparent: true, alphaTest: .1 }));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.3, .42), cache.get(k)); s.position.set(0, -.45, -.245); s.rotation.y = Math.PI; pivot.add(s);
  }
  return pivot;
}

/** Casque de fer à nasal, posé par-dessus la coiffe. */
export function makeHelm() {
  if (!cache.has('helm')) cache.set('helm', new THREE.MeshStandardMaterial({ color: '#7a7f86', metalness: .9, roughness: .35 }));
  const m = cache.get('helm'), g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.142, 18, 10, 0, Math.PI * 2, 0, Math.PI * .52), m); cap.scale.set(1, 1.08, 1.12); g.add(cap);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.142, .012, 6, 22), m); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.12, 1); g.add(rim);
  const nasal = new THREE.Mesh(new THREE.BoxGeometry(.026, .1, .02), m); nasal.position.set(0, -.04, .158); g.add(nasal);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
