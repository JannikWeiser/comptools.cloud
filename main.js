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

// Scroll-Route als Speed-Route: 20 Griffe im Zickzack, ein Punkt klettert beim Scrollen von Griff zu Griff
const holdSections = [...document.querySelectorAll('[data-hold]')];
if (holdSections.length) {
  const en = document.documentElement.lang === 'en';
  // Horizontale Lage und Drehung der Griffe, von unten nach oben (angelehnt an die Speed-Normroute)
  const layoutHolds = [
    [0.96, 20], [1, -30], [0.62, 140], [0.25, -20], [0.51, 60], [0.69, -110], [0.38, 30],
    [0.76, 150], [0.91, -60], [0.31, 10], [0.53, -140], [0.2, 80], [0.44, -40],
    [0.51, 120], [0.25, -80], [0.85, 40], [0.64, -10], [0.4, 100], [0.88, -50], [0.51, 15],
  ];
  const n = layoutHolds.length;
  const holdSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 1.5C14.8 7.2 16.8 9.2 22.5 10.2C16.5 13 14.8 15.5 13.2 22.5C10.5 17.5 7.5 15.5 3.2 13.6C7.5 11.5 10.2 7.5 12.5 1.5Z"/><circle cx="3.8" cy="13.6" r="2.5"/></svg>';

  const route = document.createElement('nav');
  route.className = 'route';
  route.setAttribute('aria-label', en ? 'Page route' : 'Seitenroute');
  // Abschnitte sitzen auf gleichmäßig verteilten Griffen
  const sectionAt = holdSections.map((_, i) => Math.round(i * (n - 1) / (holdSections.length - 1)));
  const holds = layoutHolds.map(([x, turn], k) => {
    const s = sectionAt.indexOf(k);
    const el = document.createElement(s >= 0 ? 'button' : 'span');
    el.className = 'route-hold';
    el.style.setProperty('--x', x);
    el.style.setProperty('--y', k / (n - 1));
    el.style.setProperty('--turn', turn + 'deg');
    el.innerHTML = holdSvg;
    if (s >= 0) {
      const section = holdSections[s];
      el.type = 'button';
      el.classList.add('route-stop');
      el.setAttribute('aria-label', section.dataset.hold);
      el.insertAdjacentHTML('beforeend', '<span class="route-label"></span>');
      el.querySelector('.route-label').textContent = section.dataset.hold;
      if (section.hasAttribute('data-hold-top')) {
        el.classList.add('route-top');
        el.insertAdjacentHTML('beforeend', '<span class="route-flag">Top!</span>');
      }
      el.addEventListener('click', () => {
        if (section.classList.contains('tool-section')) location.hash = '#' + section.id;
        else section.scrollIntoView({ behavior: 'smooth' });
      });
    }
    route.appendChild(el);
    return el;
  });
  route.insertAdjacentHTML('beforeend', '<span class="route-climber"></span>');
  document.body.appendChild(route);

  const stops = holdSections.map((section, i) => ({ section, y: sectionAt[i] / (n - 1), at: 0 }));
  let maxScroll = 1;
  const layout = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    stops.forEach((s, i) => {
      // Ein Abschnitt gilt als erreicht, wenn er im oberen Drittel ankommt
      const top = s.section.getBoundingClientRect().top + scrollY - innerHeight * 0.35;
      s.at = i === 0 ? 0 : s.section.hasAttribute('data-hold-top') ? 1 : Math.min(1, Math.max(0, top / maxScroll));
    });
    update();
  };
  const update = () => {
    const p = Math.min(1, Math.max(0, scrollY / maxScroll));
    // Scrollposition auf die Route abbilden: anteilig zwischen dem letzten und dem nächsten Abschnitt
    let i = 0;
    while (i < stops.length - 2 && p >= stops[i + 1].at) i++;
    const span = stops[i + 1].at - stops[i].at;
    const part = span > 0 ? Math.min(1, Math.max(0, (p - stops[i].at) / span)) : 1;
    const r = stops[i].y + part * (stops[i + 1].y - stops[i].y);
    // Kletterpunkt zwischen den beiden umgebenden Griffen platzieren
    const f = r * (n - 1);
    const k = Math.min(n - 2, Math.floor(f));
    const t = f - k;
    route.style.setProperty('--cx', layoutHolds[k][0] + (layoutHolds[k + 1][0] - layoutHolds[k][0]) * t);
    route.style.setProperty('--cy', r);
    holds.forEach((h, j) => h.classList.toggle('reached', j <= f + 0.01));
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
