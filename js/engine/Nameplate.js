// Plaque au-dessus d'un personnage : repère de quête (! ou ?), nom coloré selon l'attitude,
// rôle (marchand, garde…) et barre de vie en combat.
import * as THREE from 'three';

export class Nameplate {
  constructor(name) {
    this.c = document.createElement('canvas'); this.c.width = 256; this.c.height = 128;
    this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex, depthWrite: false, depthTest: false, transparent: true, fog: false }));
    this.sprite.scale.set(1.8, .9, 1); this.sprite.position.y = 2.55; this.sprite.renderOrder = 10; this.sprite.visible = false;
    this.name = name; this.key = '';
  }
  /** color : couleur du nom ; hp : 0–1 ou null ; mark : '!' | '?' | null ; sub : rôle affiché sous le nom */
  set(color, hp, show = true, mark = null, sub = null) {
    this.sprite.visible = show;
    const key = [color, hp === null ? '' : Math.round(hp * 40), mark, sub].join('|');
    if (!show || key === this.key) return;
    this.key = key;
    const g = this.c.getContext('2d'); g.clearRect(0, 0, 256, 128);
    if (mark) {
      g.font = '900 52px Cinzel, serif'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#2a1608';
      g.strokeText(mark, 128, 46); g.fillStyle = mark === '!' ? '#ffd040' : '#9fe0ff'; g.fillText(mark, 128, 46);
    }
    g.font = '600 22px Cinzel, serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.85)';
    g.strokeText(this.name, 128, 76); g.fillStyle = color; g.fillText(this.name, 128, 76);
    if (sub) { g.font = 'italic 16px "IM Fell English", serif'; g.strokeText(sub, 128, 96); g.fillStyle = '#d8c8a0'; g.fillText(sub, 128, 96); }
    if (hp !== null) {
      g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(48, 104, 160, 12);
      g.fillStyle = hp > .5 ? '#c9a227' : hp > .25 ? '#d07a2a' : '#c0302a'; g.fillRect(50, 106, 156 * Math.max(0, hp), 8);
    }
    this.tex.needsUpdate = true;
  }
  dispose() { this.tex.dispose(); this.sprite.material.dispose(); }
}
