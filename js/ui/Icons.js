// Icônes SVG inline (remplacent les emojis, rendus différemment selon les systèmes).
const svg = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export const ICONS = {
  soundOn: svg('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>'),
  soundOff: svg('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>'),
  motion: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  sword: svg('<path d="M14.5 3H21v6.5L9 21.5 2.5 15z" /><path d="M6 13l5 5M3 21l3-3"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
  scroll: svg('<path d="M6 4h11a3 3 0 0 1 0 6H8v8a2 2 0 1 1-4 0V6a2 2 0 0 1 2-2z"/><path d="M11 13h6M11 16h4"/>'),
  coin: svg('<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9.5c0-1 1.3-2 3-2s3 .8 3 2-1.2 1.7-3 2-3 1-3 2.2 1.3 2 3 2 3-1 3-2"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>'),
  rain: svg('<path d="M7 15a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3 3 0 0 1-1 6z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>'),
  snow: svg('<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>'),
  fog: svg('<path d="M3 9h14M5 13h16M3 17h12"/>'),
  cloud: svg('<path d="M7 18a4 4 0 1 1 1-7.9A5 5 0 0 1 18 12a3 3 0 0 1-1 6z"/>')
};
