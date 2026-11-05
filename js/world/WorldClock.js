// Temps du monde : 1 seconde réelle = 1 minute de jeu (une journée = 24 minutes).
// Fournit la lumière du jour, la direction du soleil et la météo selon le climat de la région.
import { createRng } from '../core/Random.js';

export const CLIMATES = {
  tempere: { clear: .45, cloudy: .3, rain: .2, fog: .05 },
  nord: { clear: .25, cloudy: .3, snow: .35, fog: .1 },
  desert: { clear: .85, cloudy: .15 },
  glace: { cloudy: .3, snow: .5, fog: .2 },
  chaud: { clear: .7, cloudy: .2, rain: .1 }
};

export class WorldClock {
  constructor(time, bus) { this.time = time; this.bus = bus; this.rng = createRng(time.day * 97 + 13); this.timeScale = 1; }
  get hour() { return (this.time.minutes / 60) % 24; }
  get isNight() { return this.hour >= 20.5 || this.hour < 5.5; }
  /** 0 (nuit noire) à 1 (plein jour). */
  get daylight() { const h = this.hour; return Math.max(.08, Math.min(1, Math.sin(Math.max(0, (h - 5) / 15) * Math.PI) * 1.4)); }
  get sunDir() { const a = ((this.hour - 6) / 12) * Math.PI; return [Math.cos(a) * .8, Math.max(.08, Math.sin(a)), .45]; }
  label() { const h = Math.floor(this.hour), m = Math.floor(this.time.minutes % 60); return `Jour ${this.time.day}, ${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`; }

  advance(minutes, climate = 'tempere') {
    const before = Math.floor(this.time.minutes / 60);
    this.time.minutes += minutes;
    while (this.time.minutes >= 1440) { this.time.minutes -= 1440; this.time.day++; this.bus?.emit('world:newday', { day: this.time.day }); }
    const after = Math.floor(this.time.minutes / 60);
    if (after !== before) {
      this.bus?.emit('world:hour', { hour: after });
      if (after % 3 === 0 || !this.time.weather) this.rollWeather(climate);
    }
  }
  rollWeather(climate) {
    const table = CLIMATES[climate] ?? CLIMATES.tempere;
    let r = this.rng(), w = 'clear';
    for (const [k, p] of Object.entries(table)) { if ((r -= p) <= 0) { w = k; break; } }
    if (w !== this.time.weather) { this.time.weather = w; this.bus?.emit('world:weather', { weather: w }); }
    return w;
  }
}
