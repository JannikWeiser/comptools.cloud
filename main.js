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

// Tools auf- und zuklappen
const tools = [...document.querySelectorAll('.tool-section')];
function setOpen(section, open) {
  section.classList.toggle('is-open', open);
  section.querySelector('.tool-toggle').setAttribute('aria-expanded', open);
}
tools.forEach((section) => {
  section.querySelector('.tool-toggle').addEventListener('click', () => {
    const open = !section.classList.contains('is-open');
    // Immer nur ein Tool offen: die anderen schließen
    if (open) tools.forEach((t) => t !== section && setOpen(t, false));
    setOpen(section, open);
  });
});
// Direktlink wie /#lead-uhr öffnet das passende Tool
function openFromHash() {
  const target = tools.find((t) => '#' + t.id === location.hash);
  if (target) tools.forEach((t) => setOpen(t, t === target));
}
openFromHash();
window.addEventListener('hashchange', openFromHash);

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

// Scroll-Route: Griffe pro Abschnitt, ein Punkt klettert beim Scrollen nach oben
const holdSections = [...document.querySelectorAll('[data-hold]')];
if (holdSections.length) {
  const en = document.documentElement.lang === 'en';
  const route = document.createElement('nav');
  route.className = 'route';
  route.setAttribute('aria-label', en ? 'Page route' : 'Seitenroute');
  route.innerHTML = '<span class="route-line"><i class="route-climbed"></i></span><span class="route-climber"></span>';
  // Leicht unterschiedliche Griff-Formen wie an einer echten Wand
  const shapes = ['62% 38% 55% 45% / 48% 60% 40% 52%', '40% 60% 35% 65% / 60% 40% 60% 40%', '55% 45% 60% 40% / 40% 55% 45% 60%'];
  const stops = holdSections.map((section, i) => {
    const stop = document.createElement('button');
    stop.className = 'route-stop';
    stop.type = 'button';
    stop.style.setProperty('--hold', section.dataset.holdColor || 'var(--c-red)');
    stop.style.setProperty('--shape', shapes[i % shapes.length]);
    stop.style.setProperty('--turn', (i % 2 ? 18 : -14) + 'deg');
    const top = section.hasAttribute('data-hold-top');
    if (top) stop.classList.add('route-top');
    stop.innerHTML = '<i></i><span class="route-label"></span>' + (top ? '<span class="route-flag">Top!</span>' : '');
    stop.querySelector('.route-label').textContent = section.dataset.hold;
    stop.setAttribute('aria-label', section.dataset.hold);
    stop.addEventListener('click', () => {
      if (section.classList.contains('tool-section')) location.hash = '#' + section.id;
      else section.scrollIntoView({ behavior: 'smooth' });
    });
    route.appendChild(stop);
    return { section, stop, at: 0 };
  });
  document.body.appendChild(route);

  let maxScroll = 1;
  const layout = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    stops.forEach((s, i) => {
      // Ein Griff gilt als erreicht, wenn sein Abschnitt im oberen Drittel ankommt
      const top = s.section.getBoundingClientRect().top + scrollY - innerHeight * 0.35;
      s.at = i === 0 ? 0 : s.section.hasAttribute('data-hold-top') ? 1 : Math.min(1, Math.max(0, top / maxScroll));
      // Griffe gleichmäßig über die Route verteilt
      s.stop.style.setProperty('--y', i / (stops.length - 1));
    });
    update();
  };
  const update = () => {
    const p = Math.min(1, Math.max(0, scrollY / maxScroll));
    // Kletterpunkt bewegt sich anteilig zwischen dem letzten und dem nächsten Griff
    let i = 0;
    while (i < stops.length - 2 && p >= stops[i + 1].at) i++;
    const span = stops[i + 1].at - stops[i].at;
    const part = span > 0 ? Math.min(1, Math.max(0, (p - stops[i].at) / span)) : 1;
    route.style.setProperty('--p', (i + part) / (stops.length - 1));
    stops.forEach((s) => s.stop.classList.toggle('reached', p >= s.at - 0.002));
    route.classList.toggle('topped', p > 0.995);
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
  }, { passive: true });
  addEventListener('resize', layout);
  // Auf- und Zuklappen der Tools ändert die Seitenhöhe
  new ResizeObserver(layout).observe(document.body);
  layout();
}

document.getElementById('year').textContent = new Date().getFullYear();
