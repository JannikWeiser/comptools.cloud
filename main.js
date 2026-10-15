document.documentElement.classList.add('js');

// Mobiles Menü
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  const en = document.documentElement.lang === 'en';
  toggle.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Menü schließen') : (en ? 'Open menu' : 'Menü öffnen'));
});
nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Einblenden beim Scrollen
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const mmss = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

// Callzone-Mockup: pro Route rücken die Athleten abwechselnd eins weiter (Beispielnamen)
const startLists = [
  ['#14 MÜLLER Jonas', '#15 SCHMID Lukas', '#16 WAGNER Felix', '#17 BECKER Paul', '#18 KOCH Elias', '#19 HOFMANN Ben', '#20 KLEIN Moritz', '#21 WOLF Anton'],
  ['#41 FISCHER Noah', '#42 WEBER Leon', '#43 MEYER Finn', '#44 SCHULZ Emil', '#45 BAUER Jakob', '#46 RICHTER Tim', '#47 LANG Oskar', '#48 KRAUSE Max'],
];
const lanes = [...document.querySelectorAll('.czt-lane')];
const offsets = [0, 3];
function renderLane(i) {
  const names = [0, 1, 2, 3, 4, 5].map((k) => startLists[i][(offsets[i] + k) % startLists[i].length]);
  const [go, next] = lanes[i].querySelectorAll('.czt-ath');
  go.textContent = names[0];
  next.textContent = names[1];
  lanes[i].querySelectorAll('.czt-queue li').forEach((li, k) => { li.textContent = names[k + 2]; });
}
if (lanes.length) {
  lanes.forEach((_, i) => renderLane(i));
  let turn = 0;
  setInterval(() => {
    const i = turn++ % lanes.length;
    offsets[i]++;
    renderLane(i);
  }, 4000);
}

// Lead-Uhr-Mockup: zwei Uhren zählen herunter, bei 0 wird "Neustart" gedrückt
const clocks = [...document.querySelectorAll('.lut-time')].map((el) => ({
  el, left: Number(el.dataset.start), restart: el.closest('.lut-panel').querySelector('.lut-red'),
}));
if (clocks.length) {
  setInterval(() => {
    clocks.forEach((c) => {
      if (c.left > 0) {
        c.left--;
      } else {
        c.left = 6 * 60;
        c.restart.classList.remove('press');
        void c.restart.offsetWidth;
        c.restart.classList.add('press');
      }
      c.el.textContent = mmss(c.left);
      c.el.classList.toggle('is-low', c.left <= 60);
    });
  }, 1000);
}

// TI-Rechner-Mockup (Boulder): Live-Countdown bis zum Wiedereinstieg, Marker wandert über den Ablauf
const timer = document.getElementById('mock-timer');
const now = document.getElementById('tl-now');
if (timer) {
  const total = 5 * 60;
  let left = 4 * 60 + 12;
  const tick = () => {
    timer.textContent = mmss(left);
    if (now) now.style.left = ((total - left) / total) * 100 + '%';
    left = left > 0 ? left - 1 : total;
  };
  tick();
  setInterval(tick, 1000);
}

document.getElementById('year').textContent = new Date().getFullYear();
