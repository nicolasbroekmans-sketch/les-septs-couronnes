// Aperçu 3D du personnage pendant la création (petit rendu indépendant).
import * as THREE from 'three';
import { Humanoid } from '../../engine/Humanoid.js';
import { ITEMS } from '../../data/items.js';

export class CreationPreview {
  constructor(canvas) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.r.setPixelRatio(Math.min(devicePixelRatio, 2)); this.r.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene = new THREE.Scene(); this.cam = new THREE.PerspectiveCamera(30, 1, .1, 20); this.cam.position.set(0, 1.25, 4.6); this.cam.lookAt(0, .95, 0);
    this.scene.add(new THREE.HemisphereLight('#fff1d8', '#2a1a10', 1.4));
    const key = new THREE.DirectionalLight('#ffd9a0', 2.2); key.position.set(2, 3, 3); this.scene.add(key);
    const rim = new THREE.DirectionalLight('#9fc4d6', 1.2); rim.position.set(-3, 2, -2); this.scene.add(rim);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(.8, 32), new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: .9 })); disc.rotation.x = -Math.PI / 2; this.scene.add(disc);
    this.t = 0; this.loop = () => this.frame(); this.raf = requestAnimationFrame(this.loop);
  }
  set(look, weaponId) {
    this.h?.root.removeFromParent();
    this.h = new Humanoid(look); this.h.setWeapon(ITEMS[weaponId]?.cls, weaponId); this.scene.add(this.h.root);
  }
  frame() {
    if ((this.skip = !this.skip)) { this.raf = requestAnimationFrame(this.loop); return; } // ~30 i/s suffisent pour un aperçu
    const c = this.r.domElement, w = c.clientWidth, hgt = c.clientHeight;
    if (c.width !== Math.floor(w * this.r.getPixelRatio())) { this.r.setSize(w, hgt, false); this.cam.aspect = w / hgt; this.cam.updateProjectionMatrix(); }
    this.t += 1 / 30;
    if (this.h) { this.h.root.rotation.y = Math.sin(this.t * .5) * .7; this.h.update(1 / 30, { speed: 0 }); }
    this.r.render(this.scene, this.cam);
    this.raf = requestAnimationFrame(this.loop);
  }
  dispose() { cancelAnimationFrame(this.raf); this.r.dispose(); this.r.forceContextLoss(); }
}
