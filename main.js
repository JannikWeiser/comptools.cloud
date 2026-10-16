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
    time.classList.remove('red', 'flash', 'word');
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
      time.classList.add('red', 'flash', 'word');
      await wait(1600);
      time.classList.remove('red', 'flash', 'word');
      time.textContent = '04:00';
      await wait(1400);
    },
  ];
  (async () => {
    for (let i = 0; ; i = (i + 1) % phases.length) await phases[i]();
  })();
}

// Kletterer an der rechten Bildschirmkante, im Profil: die Kante ist seine Wand.
// Klettert beim Scrollen nach oben (und beim Zurückscrollen runter); in Pausen chalkt er, oben jubelt er.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.className = 'climber';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <svg viewBox="0 0 40 64">
      <g class="climber-body">
        <path class="climber-far" d=""/>
        <path class="climber-torso" d=""/>
        <circle class="climber-head" cx="26.5" cy="10" r="4.4"/>
        <path class="climber-near" d=""/>
      </g>
    </svg>
    <span class="chalk"><i></i><i></i><i></i><i></i><i></i></span>`;
  document.body.appendChild(el);
  const body = el.querySelector('.climber-body');
  const far = el.querySelector('.climber-far');
  const near = el.querySelector('.climber-near');
  const torso = el.querySelector('.climber-torso');
  const head = el.querySelector('.climber-head');

  const WALL = 38; // x-Position der Bildschirmkante im Bild
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const seg = (a, b, c) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;

  // Arm und Bein zwischen "tief" und "hoch"
  const arm = (t) => ({ hand: mix([WALL, 16], [WALL, 2], t), elbow: mix([33, 25], [33.5, 9], t) });
  const leg = (t) => ({ foot: mix([WALL, 58], [WALL, 46], t), knee: mix([34.5, 47], [31.5, 38], t) });

  // Kletterpose: vordere Hand und hinterer Fuß hoch, dann umgekehrt (diagonal wie beim echten Klettern)
  function climbPose(phase) {
    const a = (1 - Math.cos(phase)) / 2;
    const b = 1 - a;
    const lean = 1.2 * Math.sin(phase);  // Oberkörper pendelt leicht zur Wand und zurück
    return {
      shoulder: [28 + lean * 0.5, 18], hip: [31, 35], head: [26.5 + lean * 0.4, 10],
      nearArm: arm(a), farArm: arm(b), nearLeg: leg(b), farLeg: leg(a),
      bob: 1.1 * Math.sin(phase * 2),
    };
  }
  const topPose = {
    shoulder: [28, 18], hip: [31, 35], head: [26.5, 10],
    nearArm: { hand: [25, 1], elbow: [26.5, 9] }, farArm: { hand: [31, 0.5], elbow: [30.5, 8.5] },
    nearLeg: leg(0), farLeg: leg(0.15), bob: 0,
  };

  function draw(p, chalk = 0) {
    let nearArm = p.nearArm;
    // Chalken: vordere Hand greift hinter den Rücken in den Chalkbag und wieder zurück
    if (chalk > 0) {
      const t = Math.sin(Math.min(1, chalk) * Math.PI);
      nearArm = { hand: mix(p.nearArm.hand, [24, 34], t), elbow: mix(p.nearArm.elbow, [23, 25], t) };
    }
    far.setAttribute('d', seg(p.shoulder, p.farArm.elbow, p.farArm.hand) + seg(p.hip, p.farLeg.knee, p.farLeg.foot));
    near.setAttribute('d', seg(p.shoulder, nearArm.elbow, nearArm.hand) + seg(p.hip, p.nearLeg.knee, p.nearLeg.foot));
    torso.setAttribute('d', `M${p.shoulder[0].toFixed(1)} ${(p.shoulder[1] - 3).toFixed(1)}L${p.hip[0]} ${p.hip[1]}`);
    head.setAttribute('cx', p.head[0].toFixed(1));
    head.setAttribute('cy', p.head[1].toFixed(1));
    body.setAttribute('transform', `translate(0 ${p.bob.toFixed(2)})`);
  }

  let phase = 0, targetPhase = 0;
  let y = 0, targetY = 0;
  let topped = false;
  let idleSince = performance.now();
  let chalkStart = 0;
  let running = false;

  function measure() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    // Von unten (Seitenanfang) bis knapp unter die Kopfzeile (Seitenende)
    const travel = Math.max(0, innerHeight - el.offsetHeight - 110);
    targetY = p * travel;
    targetPhase = reduceMotion ? 0 : scrollY / 120 * Math.PI;
    topped = p > 0.995;
  }

  function frame(now) {
    const ease = reduceMotion ? 1 : 0.18;
    y = lerp(y, targetY, ease);
    phase = lerp(phase, targetPhase, ease);
    el.style.transform = `translateY(${(-y).toFixed(1)}px)`;
    el.classList.toggle('topped', topped);

    let chalk = 0;
    if (!topped && !reduceMotion && now - idleSince > 2500) {
      if (!chalkStart) { chalkStart = now; el.classList.remove('puff'); void el.offsetWidth; el.classList.add('puff'); }
      chalk = (now - chalkStart) / 1400;
      if (chalk >= 1) { chalk = 0; chalkStart = 0; idleSince = now + 4000; } // nächste Chalk-Pause etwas später
    }
    draw(topped ? topPose : climbPose(phase), chalk);

    const moving = Math.abs(targetY - y) > 0.3 || Math.abs(targetPhase - phase) > 0.01 || chalk > 0;
    if (moving) { requestAnimationFrame(frame); return; }
    running = false;
    // Nächste Chalk-Pause einplanen, ohne die Animation dauerhaft laufen zu lassen
    if (!topped && !reduceMotion) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(kick, Math.max(50, idleSince + 2500 - performance.now()));
    }
  }
  let idleTimer = 0;
  function kick() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  addEventListener('scroll', () => { idleSince = performance.now(); chalkStart = 0; measure(); kick(); }, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  new ResizeObserver(() => { measure(); kick(); }).observe(document.body); // Auf- und Zuklappen der Tools
  measure();
  y = targetY; phase = targetPhase;
  kick();
})();

document.getElementById('year').textContent = new Date().getFullYear();
