// Niveau 1 : titre gravé lettre par lettre en or, sous-titre, bouton Entrer.
import { M } from '../Ambience.js';

export function playIntro(onEnter) {
  const title = document.getElementById('title');
  title.innerHTML = title.textContent.split(' ').map(w => `<span class="w">${[...w].map(c => `<span class="ch" aria-hidden="true">${c}</span>`).join('')}</span>`).join(' ');
  const chars = title.querySelectorAll('.ch');
  const tl = gsap.timeline({ delay: .6 * M() })
    .to(chars, { clipPath: 'inset(0 0 0% 0)', duration: .9 * M(), stagger: .11 * M(), ease: 'power2.out' })
    .fromTo(chars, { filter: 'brightness(2.2)' }, { filter: 'brightness(1)', duration: 1.2 * M(), stagger: .11 * M(), ease: 'power1.out' }, 0)
    .to('.rule', { opacity: 1, duration: .8 * M() }, '-=.4')
    .to('#subtitle', { opacity: 1, letterSpacing: '.45em', duration: 1.2 * M(), ease: 'power2.out' }, '-=.4')
    .to('#enter', { opacity: 1, duration: .8 * M() }, '-=.5')
    .to('.intro-hint', { opacity: 1, duration: .8 * M() }, '-=.4');
  gsap.to(title, { filter: 'drop-shadow(0 0 28px rgba(201,162,39,.6))', duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 4 });
  document.getElementById('enter').addEventListener('click', () => { tl.progress(1); onEnter(); }, { once: true });
}
export function leaveIntro() {
  const el = document.getElementById('intro');
  return gsap.to(el, { scale: 1.2, filter: 'blur(8px)', autoAlpha: 0, duration: 1.1 * M(), ease: 'power2.in', onComplete: () => el.classList.remove('active') });
}
