// Plaque au-dessus d'un personnage : nom (couleur selon l'attitude) + barre de vie (en combat).
import * as THREE from 'three';

export class Nameplate {
  constructor(name) {
    this.c = document.createElement('canvas'); this.c.width = 256; this.c.height = 64;
    this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex, depthWrite: false, transparent: true, fog: false }));
    this.sprite.scale.set(1.6, .4, 1); this.sprite.position.y = 2.25; this.sprite.renderOrder = 10;
    this.name = name; this.key = '';
  }
  /** color : '#e8dcc0' neutre, '#d04a3a' hostile, '#9fd06a' allié ; hp : 0–1 ou null */
  set(color, hp, show = true) {
    this.sprite.visible = show;
    const key = color + (hp === null ? '' : Math.round(hp * 40));
    if (!show || key === this.key) return;
    this.key = key;
    const g = this.c.getContext('2d'); g.clearRect(0, 0, 256, 64);
    g.font = '600 24px Cinzel, serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.85)';
    g.strokeText(this.name, 128, 26); g.fillStyle = color; g.fillText(this.name, 128, 26);
    if (hp !== null) {
      g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(48, 38, 160, 12);
      g.fillStyle = hp > .5 ? '#c9a227' : hp > .25 ? '#d07a2a' : '#c0302a'; g.fillRect(50, 40, 156 * Math.max(0, hp), 8);
    }
    this.tex.needsUpdate = true;
  }
  dispose() { this.tex.dispose(); this.sprite.material.dispose(); }
}
