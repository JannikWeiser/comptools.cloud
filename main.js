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

// Wettkampf-Uhr im Hero: Lead-Countdown, Speed-Zeit und Boulder-Rotation im Wechsel, mit passendem Bild
const wallClock = document.querySelector('.wall-clock');
if (wallClock && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const enLang = document.documentElement.lang === 'en';
  const time = wallClock.querySelector('.wc-time');
  const disc = wallClock.querySelector('.wc-disc span');
  const steps = [...wallClock.querySelectorAll('.wc-steps i')];
  const images = [...document.querySelectorAll('.hero-img')];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (name, color, step) => {
    disc.textContent = name;
    wallClock.style.setProperty('--wc-color', color);
    steps.forEach((s, i) => s.classList.toggle('on', i === step));
    images.forEach((img) => img.classList.toggle('is-active', img.dataset.disc === name.toLowerCase()));
    time.classList.remove('red', 'flash');
  };
  const phases = [
    async () => { // Lead: Countdown ab 6:00
      show('Lead', 'var(--c-blue)', 0);
      for (let s = 360; s >= 354; s--) { time.textContent = mmss(s); await wait(1000); }
    },
    async () => { // Speed: Zeit läuft hoch und bleibt rot stehen
      show('Speed', 'var(--c-red)', 1);
      const final = 4.9 + Math.random() * 1.1;
      const t0 = performance.now();
      await new Promise((done) => {
        const id = setInterval(() => {
          const t = (performance.now() - t0) / 1000;
          time.textContent = Math.min(t, final).toFixed(2).replace('.', enLang ? '.' : ',');
          if (t >= final) { clearInterval(id); done(); }
        }, 30);
      });
      time.classList.add('red');
      await wait(2600);
    },
    async () => { // Boulder: Rotation läuft ab, Wechsel blinkt, neue Rotation 4:00
      show('Boulder', 'var(--c-green)', 2);
      for (let s = 5; s >= 0; s--) { time.textContent = mmss(s); await wait(1000); }
      time.textContent = enLang ? 'Rotate' : 'Wechsel';
      time.classList.add('red', 'flash');
      await wait(1600);
      time.classList.remove('red', 'flash');
      time.textContent = '04:00';
      await wait(1400);
    },
  ];
  (async () => {
    for (let i = 0; ; i = (i + 1) % phases.length) await phases[i]();
  })();
}

// Scroll-Route am rechten Rand: Speed, Lead oder Boulder. Ein Kletterer klettert beim Scrollen von Griff zu Griff.
// Doppelklick aufs Logo startet als Easter Egg einen "Run" in einer der drei Disziplinen.
const holdSections = [...document.querySelectorAll('[data-hold]')];
if (holdSections.length) {
  const en = document.documentElement.lang === 'en';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const shapes = {
    speed: '<path d="M12.5 1.5C14.8 7.2 16.8 9.2 22.5 10.2C16.5 13 14.8 15.5 13.2 22.5C10.5 17.5 7.5 15.5 3.2 13.6C7.5 11.5 10.2 7.5 12.5 1.5Z"/><circle cx="3.8" cy="13.6" r="2.5"/>',
    crimp: '<path d="M3 13C3 8.5 7.5 6 12.5 6.5C18 7 21.5 9.5 21 13.5C20.5 17 16 17.5 12 16.5C7.5 15.5 3 16.5 3 13Z"/>',
    jug: '<path d="M4 9.5C6 4.5 17.5 4 20.5 9C22.5 12.5 20 19 15 19.5C11.5 20 11.5 15 9 15.5C5.5 16 2.5 13 4 9.5Z"/>',
    pinch: '<path d="M9 2.5C13.5 2 15.5 6 15 10.5C14.5 14 17.5 17 16 20C14 23 8.5 22 7.5 18C6.5 14.5 9 13 8 9C7.3 6 5.8 3 9 2.5Z"/>',
    volume: '<path d="M2.5 17.5L9.5 3.5L21.5 8.5L19 20.5Z"/><path d="M9.5 3.5L13 13L2.5 17.5M13 13L21.5 8.5M13 13L19 20.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>',
    sloper: '<path d="M2.5 15C3.5 8 8 4.5 13 4.5C18.5 4.5 22 9 21.5 15C21 18.5 17 19.5 12 19.5C7 19.5 2 18.5 2.5 15Z"/>',
  };
  // Je Route: Griffe von unten nach oben als [x (0–1), Drehung, Form, Größe]
  const ROUTES = {
    speed: {
      label: 'Speed', color: '#c8102e',
      holds: [[0.96, 20], [1, -30], [0.62, 140], [0.25, -20], [0.51, 60], [0.69, -110], [0.38, 30], [0.76, 150],
        [0.91, -60], [0.31, 10], [0.53, -140], [0.2, 80], [0.44, -40], [0.51, 120], [0.25, -80], [0.85, 40],
        [0.64, -10], [0.4, 100], [0.88, -50], [0.51, 15]].map(([x, t]) => [x, t, 'speed', 1]),
    },
    lead: {
      label: 'Lead', color: '#1f6fff',
      holds: [[0.55, 10, 'jug', 1.1], [0.3, -20, 'crimp', 0.9], [0.62, 35, 'pinch', 1], [0.42, -10, 'sloper', 1.1],
        [0.75, 25, 'crimp', 0.85], [0.5, -40, 'jug', 1], [0.25, 15, 'pinch', 0.95], [0.6, -15, 'crimp', 0.85],
        [0.82, 40, 'sloper', 1], [0.48, -25, 'jug', 1.05], [0.2, 10, 'crimp', 0.85], [0.45, 30, 'pinch', 1],
        [0.7, -10, 'sloper', 1], [0.4, 20, 'crimp', 0.85], [0.6, -5, 'jug', 1.15]],
      draws: [1, 3, 5, 7, 9, 11, 13],
    },
    boulder: {
      label: 'Boulder', color: '#13923b',
      holds: [[0.3, -10, 'jug', 1.15], [0.62, 20, 'volume', 1.5], [0.4, -30, 'sloper', 1.25], [0.7, 15, 'pinch', 1.1],
        [0.35, 40, 'volume', 1.45], [0.6, -20, 'crimp', 1.05], [0.48, 0, 'jug', 1.3]],
      tags: { 0: 'S', 3: 'Z', 6: 'T' },
    },
  };

  const route = document.createElement('nav');
  route.className = 'route';
  route.setAttribute('aria-label', en ? 'Page route' : 'Seitenroute');
  route.innerHTML = `
    <div class="route-switch" role="group" aria-label="${en ? 'Choose route' : 'Route wählen'}">
      <button type="button" data-route="speed" title="Speed">S</button>
      <button type="button" data-route="lead" title="Lead">L</button>
      <button type="button" data-route="boulder" title="Boulder">B</button>
    </div>
    <div class="route-board" aria-live="polite"></div>
    <div class="route-wall">
      <svg class="route-rope" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg>
      <span class="route-climber" aria-hidden="true">
        <svg viewBox="0 0 24 32">
          <g class="pose-climb"><circle cx="12" cy="5" r="3"/><path d="M12 9v10M12 11 6.5 4.5M12 11l5.5 3.5M12 19l-4 4.5-1 5.5M12 19l4.5 2.5 1.5 4.5"/></g>
          <g class="pose-top"><circle cx="12" cy="7" r="3"/><path d="M12 11v9M12 12.5 7 4.5M12 12.5l5-8M12 20l-3 4.5V30M12 20l3 4.5V30"/></g>
        </svg>
      </span>
    </div>`;
  document.body.appendChild(route);
  const wall = route.querySelector('.route-wall');
  const climber = route.querySelector('.route-climber');
  const rope = route.querySelector('.route-rope polyline');
  const board = route.querySelector('.route-board');

  let current = null;   // aktive Route
  let holds = [];       // Griff-Elemente der aktiven Route
  let draws = [];       // Expressen (nur Lead)
  let stops = [];       // Abschnitte mit Position auf der Route
  let running = false;  // Easter-Egg-Run läuft

  function build(type) {
    current = { type, ...ROUTES[type] };
    route.dataset.route = type;
    route.style.setProperty('--route-color', current.color);
    route.querySelectorAll('.route-switch [data-route]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.route === type));
    wall.querySelectorAll('.route-hold, .route-draw').forEach((el) => el.remove());
    const n = current.holds.length;
    const sectionAt = holdSections.map((_, i) => Math.round(i * (n - 1) / (holdSections.length - 1)));
    holds = current.holds.map(([x, turn, shape, size], k) => {
      const s = sectionAt.indexOf(k);
      const el = document.createElement(s >= 0 ? 'button' : 'span');
      el.className = 'route-hold';
      el.style.cssText = `--x:${x};--y:${k / (n - 1)};--turn:${turn}deg;--size:${size}`;
      el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes[shape]}</svg>`;
      const tag = current.tags && current.tags[k];
      if (tag) el.insertAdjacentHTML('beforeend', `<b class="route-tag">${tag}</b>`);
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
          if (running) return;
          if (section.classList.contains('tool-section')) location.hash = '#' + section.id;
          else section.scrollIntoView({ behavior: 'smooth' });
        });
      }
      wall.insertBefore(el, climber);
      return el;
    });
    // Expressen sitzen leicht versetzt neben ihrem Griff
    draws = (current.draws || []).map((k) => {
      const [x] = current.holds[k];
      const el = document.createElement('span');
      el.className = 'route-draw';
      const dx = x > 0.5 ? -0.32 : 0.32;
      el.style.cssText = `--x:${Math.min(1, Math.max(0, x + dx))};--y:${(k + 0.35) / (n - 1)}`;
      el.innerHTML = '<svg viewBox="0 0 10 22" aria-hidden="true"><path d="M5 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 1 1 0-5ZM5 6.5v8"/><path d="M5 14.5a3 3 0 1 1 0 6 3 3 0 1 1 0-6Z"/></svg>';
      wall.insertBefore(el, climber);
      return { el, k: k + 0.35, x: Math.min(1, Math.max(0, x + dx)) };
    });
    stops = holdSections.map((section, i) => ({ section, y: sectionAt[i] / (n - 1), at: 0 }));
    layout();
  }

  // Zeichnet den Kletterer an Position r (0 = Start, 1 = Top)
  function render(r, { topped = false, falling = false } = {}) {
    const n = current.holds.length;
    const f = Math.min(n - 1, Math.max(0, r * (n - 1)));
    const k = Math.min(n - 2, Math.floor(f));
    const t = f - k;
    const cx = current.holds[k][0] + (current.holds[k + 1][0] - current.holds[k][0]) * t;
    route.style.setProperty('--cx', cx);
    route.style.setProperty('--cy', f / (n - 1));
    holds.forEach((h, j) => h.classList.toggle('reached', j <= f + 0.01));
    climber.classList.toggle('flip', Math.floor(f * 2) % 2 === 1);
    climber.classList.toggle('falling', falling);
    route.classList.toggle('topped', topped);
    // Lead: Expressen unterhalb des Kletterers sind eingehängt, das Seil läuft durch sie zum Kletterer
    if (draws.length) {
      const clipped = draws.filter((d) => d.k <= f + 0.05);
      draws.forEach((d) => d.el.classList.toggle('clipped', d.k <= f + 0.05));
      const pt = (x, y) => `${(x * 100).toFixed(1)},${(1000 - y * 1000).toFixed(1)}`;
      rope.setAttribute('points', [pt(current.holds[0][0], -0.03), ...clipped.map((d) => pt(d.x, d.k / (n - 1))), pt(cx, f / (n - 1))].join(' '));
    } else {
      rope.setAttribute('points', '');
    }
  }

  let maxScroll = 1;
  function layout() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    stops.forEach((s, i) => {
      // Ein Abschnitt gilt als erreicht, wenn er im oberen Drittel ankommt
      const top = s.section.getBoundingClientRect().top + scrollY - innerHeight * 0.35;
      s.at = i === 0 ? 0 : s.section.hasAttribute('data-hold-top') ? 1 : Math.min(1, Math.max(0, top / maxScroll));
    });
    update();
  }
  // Scrollposition auf die Route abbilden: anteilig zwischen dem letzten und dem nächsten Abschnitt
  function update() {
    if (running || !stops.length) return;
    const p = Math.min(1, Math.max(0, scrollY / maxScroll));
    let i = 0;
    while (i < stops.length - 2 && p >= stops[i + 1].at) i++;
    const span = stops[i + 1].at - stops[i].at;
    const part = span > 0 ? Math.min(1, Math.max(0, (p - stops[i].at) / span)) : 1;
    render(stops[i].y + part * (stops[i + 1].y - stops[i].y), { topped: p > 0.995 });
  }

  // Gewählte Route merken (nur im eigenen Browser)
  let chosen = 'speed';
  try { chosen = localStorage.getItem('comptools-route') || 'speed'; } catch (e) { /* ohne Speicher */ }
  if (!ROUTES[chosen]) chosen = 'speed';
  route.querySelectorAll('.route-switch [data-route]').forEach((b) => b.addEventListener('click', () => {
    if (running) return;
    chosen = b.dataset.route;
    try { localStorage.setItem('comptools-route', chosen); } catch (e) { /* ohne Speicher */ }
    build(chosen);
  }));

  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
  }, { passive: true });
  addEventListener('resize', layout);
  new ResizeObserver(layout).observe(document.body); // Auf- und Zuklappen ändert die Seitenhöhe
  build(chosen);

  // ---------- Easter Egg: Runs ----------
  const tween = (from, to, ms, onFrame, ease = (x) => x) => new Promise((done) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      onFrame(from + (to - from) * ease(t), t);
      if (t < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  const easeOut = (x) => 1 - (1 - x) ** 2;
  const showBoard = (html, cls = '') => { board.className = 'route-board show ' + cls; board.innerHTML = html; };

  const runs = {
    async speed() {
      build('speed');
      const total = 4.9 + Math.random() * 0.8;
      showBoard('<small>Speed</small><b>0.00</b>');
      const b = board.querySelector('b');
      await tween(0, 1, total * 1000, (r, t) => { render(r); b.textContent = (t * total).toFixed(2); });
      render(1, { topped: true });
      showBoard(`<small>Speed</small><b>${total.toFixed(2).replace('.', en ? '.' : ',')} s</b>`, 'red');
      await sleep(2600);
    },
    async lead() {
      build('lead');
      const n = current.holds.length;
      const top = Math.random() < 0.5;
      const end = top ? n - 1 : 6 + Math.floor(Math.random() * 7);
      showBoard('<small>Lead</small><b>…</b>');
      const b = board.querySelector('b');
      for (let k = 1; k <= end; k++) {
        await tween((k - 1) / (n - 1), k / (n - 1), 420, (r) => render(r));
        b.textContent = k + 1 + '';
        if (current.draws.includes(k - 1) || current.draws.includes(k)) await sleep(260); // Exe einhängen
      }
      if (top) {
        render(1, { topped: true });
        showBoard('<small>Lead</small><b>Top!</b>', 'red');
      } else {
        // Sturz: ein Stück höher greifen, dann ins Seil fallen bis unter die letzte Exe
        await tween(end / (n - 1), (end + 0.4) / (n - 1), 300, (r) => render(r));
        const lastDraw = Math.max(0, ...current.draws.filter((d) => d + 0.35 <= end).map((d) => d + 0.35));
        await tween((end + 0.4) / (n - 1), Math.max(0, lastDraw - 1.2) / (n - 1), 450, (r) => render(r, { falling: true }), easeOut);
        showBoard(`<small>Lead</small><b>${end + 1}+</b>`);
        render(Math.max(0, lastDraw - 1.2) / (n - 1), { falling: true });
      }
      await sleep(2600);
    },
    async boulder() {
      build('boulder');
      const n = current.holds.length;
      const zone = 3 / (n - 1);
      const attemptsToZone = Math.random() < 0.6 ? 1 : 2;
      const attemptsToTop = attemptsToZone + 1 + Math.floor(Math.random() * 2);
      let zoneAt = 0;
      for (let a = 1; a <= attemptsToTop; a++) {
        showBoard(`<small>Boulder</small><b>${en ? 'Attempt' : 'Versuch'} ${a}</b>`);
        if (a < attemptsToTop) {
          const high = a >= attemptsToZone ? zone + 0.08 + Math.random() * 0.2 : zone * (0.4 + Math.random() * 0.4);
          await tween(0, high, 1200, (r) => render(r));
          if (high >= zone && !zoneAt) zoneAt = a;
          await tween(high, 0, 380, (r) => render(r, { falling: true }), easeOut);
          render(0);
          await sleep(500);
        } else {
          await tween(0, 1, 1700, (r) => render(r));
          if (!zoneAt) zoneAt = a;
          render(1, { topped: true });
          showBoard(`<small>Boulder</small><b>T${a} Z${zoneAt}</b>`, 'red');
        }
      }
      await sleep(2600);
    },
  };
  const order = ['speed', 'lead', 'boulder'];
  let next = Math.floor(Math.random() * order.length);
  async function startRun() {
    if (running || reduceMotion) return;
    running = true;
    route.classList.add('is-running');
    try { await runs[order[next++ % order.length]](); } finally {
      running = false;
      route.classList.remove('is-running');
      board.className = 'route-board';
      build(chosen);
    }
  }
  // Doppelklick (oder Doppeltipp) aufs Logo
  let lastTap = 0;
  document.querySelector('.wordmark')?.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 400) { lastTap = 0; startRun(); } else lastTap = now;
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
