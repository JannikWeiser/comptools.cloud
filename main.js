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

// Kletterer an der rechten Bildschirmkante, im Profil: die Kante ist seine Wand.
// Klettert beim Scrollen nach oben. Am Top jubelt er, hängt das Seil ein, wird abgelassen und winkt unten.
// Scrollt man danach wieder nach unten, klettert er die Route von vorn.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.className = 'climber';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <svg viewBox="0 0 40 64">
      <g class="climber-body">
        <path class="climber-far" d=""/>
        <rect class="climber-bag" x="0" y="0" width="3.8" height="4.6" rx="1.4"/>
        <path class="climber-torso" d=""/>
        <path class="climber-harness" d=""/>
        <circle class="climber-head" cx="26.5" cy="10" r="4.6"/>
        <path class="climber-near" d=""/>
      </g>
    </svg>
    <span class="chalk"><i></i><i></i><i></i><i></i><i></i></span>`;
  const rope = document.createElement('div');
  rope.className = 'climber-rope';
  rope.setAttribute('aria-hidden', 'true');
  rope.innerHTML = '<span class="rope-anchor"></span><span class="rope-line"></span>';
  document.body.append(rope, el);
  const body = el.querySelector('.climber-body');
  const far = el.querySelector('.climber-far');
  const near = el.querySelector('.climber-near');
  const torso = el.querySelector('.climber-torso');
  const harness = el.querySelector('.climber-harness');
  const bag = el.querySelector('.climber-bag');
  const head = el.querySelector('.climber-head');

  const WALL = 38; // x-Position der Bildschirmkante im Bild
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const f = (n) => n.toFixed(1);
  const seg = (a, b, c) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}`;
  // Schuh: kurzes, kräftiges Stück, die Spitze zeigt zur Wand
  const shoe = (foot) => `M${f(foot[0] - 3.4)} ${f(foot[1] + 0.9)}L${f(foot[0] + 0.3)} ${f(foot[1] - 0.2)}`;

  // ---------- Posen ----------
  const arm = (t) => ({ hand: mix([WALL, 16], [WALL, 2], t), elbow: mix([33, 25], [33.5, 9], t) });
  const leg = (t) => ({ foot: mix([WALL - 0.5, 58], [WALL - 0.5, 46], t), knee: mix([34.5, 47], [31.5, 38], t) });

  // Klettern: vordere Hand und hinterer Fuß hoch, dann umgekehrt (diagonal wie beim echten Klettern)
  function climbPose(phase) {
    const a = (1 - Math.cos(phase)) / 2;
    const b = 1 - a;
    const lean = 1.2 * Math.sin(phase);
    return {
      shoulder: [28 + lean * 0.5, 18], hip: [31, 35], head: [26.5 + lean * 0.4, 10],
      nearArm: arm(a), farArm: arm(b), nearLeg: leg(b), farLeg: leg(a),
      bob: 1.1 * Math.sin(phase * 2),
    };
  }
  // Jubel am Top
  function topPose(t) {
    const w = Math.sin(t * 9) * 1.5;
    return {
      shoulder: [28, 18], hip: [31, 35], head: [26.5, 10],
      nearArm: { hand: [24 + w, 1], elbow: [26 + w * 0.4, 9] }, farArm: { hand: [31 - w, 0.5], elbow: [30.5, 8.5] },
      nearLeg: leg(0), farLeg: leg(0.2), bob: -Math.abs(Math.sin(t * 9)) * 1.5,
    };
  }
  // Ablassen: sitzt im Gurt, Füße laufen an der Wand nach unten, Hände halten das Seil
  function lowerPose(step) {
    const a = (1 - Math.cos(step)) / 2;
    return {
      shoulder: [23.5, 20], hip: [27, 36], head: [21.5, 12.5],
      nearArm: { hand: [27.5, 15], elbow: [24.5, 24] }, farArm: { hand: [27.5, 11], elbow: [25, 19] },
      nearLeg: { foot: [WALL - 0.5, 42 + 4 * a], knee: [33, 31 + 2 * a] },
      farLeg: { foot: [WALL - 0.5, 46 - 4 * a], knee: [33.5, 35 - 2 * a] },
      bob: 0.6 * Math.sin(step * 2),
    };
  }
  // Unten: steht und winkt
  function standPose(t, wave) {
    const w = wave ? Math.sin(t * 10) * 2.5 : 0;
    return {
      shoulder: [27, 18], hip: [28.5, 36], head: [26, 10],
      nearArm: wave ? { hand: [20 + w, 3], elbow: [22 + w * 0.3, 11] } : { hand: [25.5, 33], elbow: [24.5, 26] },
      farArm: { hand: [31, 33], elbow: [31, 26] },
      nearLeg: { foot: [26, 62], knee: [27.5, 49] }, farLeg: { foot: [31.5, 62], knee: [30.5, 49] },
      bob: 0,
    };
  }

  // Chalken: Hand zum Chalkbag, zweimal eintauchen, zurück an den Griff
  function chalkArm(armPose, hip, c) {
    const into = [hip[0] - 5, hip[1] - 2.2];
    const elbowBack = [hip[0] - 9, hip[1] - 11];
    let k, dip = 0;
    if (c < 0.3) k = easeInOut(c / 0.3);
    else if (c < 0.72) { k = 1; dip = 1.6 * Math.sin(((c - 0.3) / 0.42) * Math.PI * 4); }
    else k = 1 - easeInOut((c - 0.72) / 0.28);
    return { hand: mix(armPose.hand, [into[0], into[1] + dip], k), elbow: mix(armPose.elbow, elbowBack, k) };
  }

  function draw(p, chalk = 0, chalkHand = 'near') {
    let nearArm = p.nearArm, farArm = p.farArm;
    if (chalk > 0) {
      if (chalkHand === 'near') nearArm = chalkArm(p.nearArm, p.hip, chalk);
      else farArm = chalkArm(p.farArm, p.hip, chalk);
    }
    far.setAttribute('d', seg(p.shoulder, farArm.elbow, farArm.hand) + seg(p.hip, p.farLeg.knee, p.farLeg.foot) + shoe(p.farLeg.foot));
    near.setAttribute('d', seg(p.shoulder, nearArm.elbow, nearArm.hand) + seg(p.hip, p.nearLeg.knee, p.nearLeg.foot) + shoe(p.nearLeg.foot));
    torso.setAttribute('d', `M${f(p.shoulder[0])} ${f(p.shoulder[1] - 3)}L${f(p.hip[0])} ${f(p.hip[1])}`);
    harness.setAttribute('d', `M${f(p.hip[0] - 3.2)} ${f(p.hip[1] - 1.6)}L${f(p.hip[0] + 2.6)} ${f(p.hip[1] - 2.4)}`);
    bag.setAttribute('x', f(p.hip[0] - 7));
    bag.setAttribute('y', f(p.hip[1] - 4.5));
    head.setAttribute('cx', f(p.head[0]));
    head.setAttribute('cy', f(p.head[1]));
    body.setAttribute('transform', `translate(0 ${p.bob.toFixed(2)})`);
  }

  // ---------- Ablauf ----------
  const TOP_MS = 1300, DROP_MS = 450, LOWER_MS = 3400, WAVE_MS = 2000;
  let state = 'climb';        // climb → top → lower → landed → ground → (beim Runterscrollen) climb
  let stateAt = performance.now();
  let base = 0;               // ab welcher Scrollposition die aktuelle Route beginnt
  let lastP = 0;
  let travel = 0, rel = 0;
  let phase = 0, targetPhase = 0;
  let y = 0, targetY = 0;
  let lowerFrom = 0;
  const CHALK_DELAY = 1200, CHALK_MS = 1900, CHALK_REPEAT = 3200;
  let idleSince = performance.now();
  let chalkStart = 0;
  let chalkHand = 'near';
  let puffed = false;
  let running = false;
  let idleTimer = 0;

  const setState = (s) => { state = s; stateAt = performance.now(); };

  function measure() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = clamp01(scrollY / max);
    // Von unten bis knapp unter die Kopfzeile
    travel = Math.max(0, innerHeight - el.offsetHeight - 110);
    // Nach dem Ablassen: Beim nächsten Runterscrollen beginnt eine neue Route ab der aktuellen Stelle
    if ((state === 'ground' || state === 'landed') && p > lastP + 0.001 && lastP < 0.99) {
      base = lastP;
      setState('climb');
    }
    if (state === 'climb' && p < base) base = p;
    rel = base >= 0.995 ? 0 : clamp01((p - base) / (1 - base));
    targetY = rel * travel;
    targetPhase = reduceMotion ? 0 : scrollY / 120 * Math.PI;
    lastP = p;
  }

  function placeRope() {
    // Seil von der Exe oben an der Kante bis zum Gurt des Kletterers
    const box = el.getBoundingClientRect();
    const harnessY = box.top + box.height * (34 / 64);
    rope.style.setProperty('--rope-right', `${(box.width * (40 - 27.5) / 40).toFixed(1)}px`);
    rope.style.setProperty('--rope-length', `${Math.max(0, harnessY - rope.getBoundingClientRect().top).toFixed(1)}px`);
  }

  function frame(now) {
    const t = now - stateAt;
    let pose, chalk = 0, animating = false;

    if (state === 'climb') {
      const ease = reduceMotion ? 1 : 0.18;
      y = lerp(y, targetY, ease);
      phase = lerp(phase, targetPhase, ease);
      // Solange nicht gescrollt wird: regelmäßig chalken, abwechselnd mit beiden Händen
      if (!reduceMotion && now - idleSince > CHALK_DELAY && rel < 0.995) {
        if (!chalkStart) { chalkStart = now; puffed = false; }
        chalk = (now - chalkStart) / CHALK_MS;
        if (chalk > 0.72 && !puffed) { puffed = true; el.classList.remove('puff'); void el.offsetWidth; el.classList.add('puff'); }
        if (chalk >= 1) {
          chalk = 0; chalkStart = 0;
          chalkHand = chalkHand === 'near' ? 'far' : 'near';
          idleSince = now - CHALK_DELAY + CHALK_REPEAT; // nächstes Chalken nach einer kurzen Pause
        }
      }
      pose = climbPose(phase);
      animating = Math.abs(targetY - y) > 0.3 || Math.abs(targetPhase - phase) > 0.01 || chalk > 0;
      if (rel > 0.995 && Math.abs(y - travel) < 1.5) {
        if (reduceMotion) pose = topPose(0); else { setState('top'); animating = true; }
      }
    } else if (state === 'top') {
      pose = topPose(t / 1000);
      animating = true;
      if (t > TOP_MS) { lowerFrom = y; rope.classList.add('show'); setState('lower'); }
    } else if (state === 'lower') {
      // Zuerst fällt das Seil, dann geht es nach unten
      const k = easeInOut(clamp01((t - DROP_MS) / LOWER_MS));
      y = lowerFrom * (1 - k);
      pose = lowerPose((lowerFrom - y) / 9);
      animating = true;
      if (t > DROP_MS + LOWER_MS) { y = 0; rope.classList.remove('show'); setState('landed'); }
    } else if (state === 'landed') {
      pose = standPose(t / 1000, true);
      animating = true;
      if (t > WAVE_MS) setState('ground');
    } else {
      y = 0;
      pose = standPose(0, false);
    }

    el.style.transform = `translateY(${(-y).toFixed(1)}px)`;
    el.classList.toggle('is-lowering', state === 'lower');
    if (state === 'lower') placeRope();
    draw(pose, chalk, chalkHand);

    if (animating) { requestAnimationFrame(frame); return; }
    running = false;
    // Nächste Chalk-Pause einplanen, ohne die Animation dauerhaft laufen zu lassen
    if (state === 'climb' && rel < 0.995 && !reduceMotion) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(kick, Math.max(50, idleSince + CHALK_DELAY - performance.now()));
    }
  }
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
