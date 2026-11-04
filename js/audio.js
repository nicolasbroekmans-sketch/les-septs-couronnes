// Gestion audio (Howler.js). Les sons ne sont créés qu'après un geste utilisateur
// pour respecter la politique d'autoplay des navigateurs.
const SRC = n => [`assets/audio/${n}.mp3`];
const cache = new Map();
let unlocked = false, muted = false;
let music = null, ambience = [];

function howl(name, opts = {}) {
  if (!unlocked || !window.Howl) return null;
  const key = name + (opts.loop ? ':loop' : '');
  if (!cache.has(key)) cache.set(key, new Howl({ src: SRC(name), loop: !!opts.loop, volume: 1, preload: true }));
  return cache.get(key);
}

export const audio = {
  unlock() {
    if (unlocked || !window.Howler) return;
    unlocked = true;
    Howler.mute(muted);
  },
  get muted() { return muted; },
  toggleMute() { muted = !muted; if (window.Howler) Howler.mute(muted); return muted; },

  sfx(name, volume = 0.6, rate = 1) {
    const h = howl(name); if (!h) return;
    const id = h.play(); h.volume(volume, id); h.rate(rate, id);
  },

  music(on = true) {
    if (!unlocked) return;
    if (!music) { music = howl('music', { loop: true }); music.volume(0); music.play(); }
    music.fade(music.volume(), on ? 0.35 : 0.12, 2000);
  },

  /** Ambiance d'un lieu : liste de pistes { name, volume, pos?:[x,y,z], every?:[min,max] } */
  setAmbience(list = []) {
    this.stopAmbience();
    if (!unlocked) return;
    for (const a of list) {
      const loop = !a.every;
      const h = howl(a.name, { loop }); if (!h) continue;
      const entry = { h, a, id: null, timer: null };
      const start = () => {
        const id = h.play();
        if (a.pos) {
          h.pos(a.pos[0], a.pos[1], a.pos[2], id);
          h.pannerAttr({ panningModel: 'HRTF', distanceModel: 'inverse', refDistance: a.ref ?? 6, rolloffFactor: a.rolloff ?? 1.2, maxDistance: 400 }, id);
        }
        h.volume(loop ? 0 : (a.volume ?? .6) * (0.7 + Math.random() * .3), id);
        if (loop) h.fade(0, a.volume ?? .5, 2500, id);
        if (a.rate) h.rate(a.rate * (loop ? 1 : 0.9 + Math.random() * .2), id);
        return id;
      };
      if (loop) entry.id = start();
      else {
        const tick = () => {
          if (a.randomPos) { const r = a.randomPos; a.pos = [r[0] + (Math.random() - .5) * r[3], r[1], r[2] + (Math.random() - .5) * r[3]]; }
          start(); entry.timer = setTimeout(tick, (a.every[0] + Math.random() * (a.every[1] - a.every[0])) * 1000);
        };
        entry.timer = setTimeout(tick, 600 + Math.random() * 2500);
      }
      ambience.push(entry);
    }
  },

  stopAmbience() {
    for (const e of ambience) {
      clearTimeout(e.timer);
      if (e.id != null) { const { h, id } = e; h.fade(h.volume(id), 0, 800, id); setTimeout(() => h.stop(id), 850); }
    }
    ambience = [];
  },

  /** Met à jour la position / orientation de l'auditeur (son spatialisé). */
  listener(p, f) {
    if (!unlocked || !window.Howler || !Howler.ctx) return;
    Howler.pos(p.x, p.y, p.z);
    Howler.orientation(f.x, f.y, f.z, 0, 1, 0);
  },

  resetListener() { if (unlocked && Howler.ctx) { Howler.pos(0, 0, 0); Howler.orientation(0, 0, -1, 0, 1, 0); } }
};
