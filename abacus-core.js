/* \u73e0\u5fc3\u7b97\u6838\u5fc3\uff1a\u7b97\u76d8\u7ec4\u4ef6\u3001\u53e3\u8bc0\u5224\u5b9a\u3001\u51fa\u9898\u5668\u3001\u95ea\u7b97\u3001\u6570\u5b57\u952e\u76d8\u3001\u5b58\u50a8
   \u7b97\u76d8\u4e3a 1 \u4e0a\u73e0 + 4 \u4e0b\u73e0\uff08\u73b0\u4ee3\u73e0\u5fc3\u7b97\u901a\u7528\u76d8\u5f0f\uff09\u3002 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CN = ['\u96f6', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d'];
  const PLACE = ['\u4e2a', '\u5341', '\u767e', '\u5343', '\u4e07', '\u5341\u4e07', '\u767e\u4e07', '\u5343\u4e07'];

  /* ---------- \u5b58\u50a8\uff08\u5931\u8d25\u65f6\u9759\u9ed8\uff09 ---------- */
  function store(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* \u5ffd\u7565 */ }
  }

  /* ---------- \u58f0\u97f3\uff1a\u62e8\u73e0\u7684\u8f7b\u54cd ---------- */
  let ctx = null;
  let muted = store('zsx-muted', false);
  function tick(freq) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq || 1800;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } catch (e) { /* \u65e0\u97f3\u9891 */ }
  }
  function chime(ok) {
    if (muted) return;
    tick(ok ? 1320 : 260);
    if (ok) setTimeout(() => tick(1760), 90);
  }
  function setMuted(m) { muted = m; save('zsx-muted', m); }

  /* ---------- \u7b97\u76d8\u7ec4\u4ef6 ---------- */
  const RW = 46, TOP = 12, BEAM_Y = 76, BEAM_H = 8, BOT = 214, H = 228;
  const BR = 11; // \u73e0\u5b50\u534a\u9ad8

  function abacus(host, opts) {
    opts = Object.assign({ rods: 5, interactive: true, labels: true, onChange: null }, opts || {});
    const n = opts.rods;
    const W = n * RW + 24;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H + (opts.labels ? 22 : 0)}`);
    svg.setAttribute('class', 'zsx-abacus');
    svg.setAttribute('role', 'img');
    const state = Array.from({ length: n }, () => ({ up: 0, top: false })); // up: \u4e0b\u73e0\u9760\u6881\u6570, top: \u4e0a\u73e0\u9760\u6881
    const beads = [];

    const el = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
    };
    // \u6846
    el('rect', { x: 2, y: 2, width: W - 4, height: H - 4, rx: 10, class: 'ab-frame' });
    el('rect', { x: 10, y: TOP - 2, width: W - 20, height: BOT - TOP + 4, rx: 4, class: 'ab-well' });
    // \u6863
    for (let i = 0; i < n; i++) {
      const x = 12 + RW / 2 + i * RW;
      el('line', { x1: x, y1: TOP, x2: x, y2: BOT, class: 'ab-rod' });
    }
    el('rect', { x: 10, y: BEAM_Y, width: W - 20, height: BEAM_H, class: 'ab-beam' });
    // \u5b9a\u4f4d\u70b9\uff1a\u4ece\u4e2a\u4f4d\u8d77\u6bcf\u4e09\u6863
    for (let i = 0; i < n; i++) {
      const fromRight = n - 1 - i;
      if (fromRight % 3 === 0) {
        el('circle', { cx: 12 + RW / 2 + i * RW, cy: BEAM_Y + BEAM_H / 2, r: 2.2, class: 'ab-dot' });
      }
    }
    // \u73e0
    for (let i = 0; i < n; i++) {
      const x = 12 + RW / 2 + i * RW;
      const rodBeads = [];
      for (let k = 0; k < 5; k++) {
        const g = el('g', { class: 'ab-bead' + (k === 0 ? ' ab-heaven' : ''), 'data-rod': i, 'data-k': k });
        el('ellipse', { cx: 0, cy: 0, rx: 19, ry: BR, class: 'ab-bead-body' }, g);
        el('ellipse', { cx: -4, cy: -4, rx: 9, ry: 3.2, class: 'ab-bead-shine' }, g);
        el('line', { x1: -19, y1: 0, x2: 19, y2: 0, class: 'ab-bead-seam' }, g);
        g.style.transform = `translate(${x}px, 0px)`;
        rodBeads.push(g);
      }
      beads.push(rodBeads);
      if (opts.labels) {
        const fromRight = n - 1 - i;
        const t = el('text', { x, y: H + 15, class: 'ab-label', 'text-anchor': 'middle' });
        t.textContent = PLACE[fromRight] || '';
      }
    }

    function yFor(k, s) {
      if (k === 0) return s.top ? BEAM_Y - BR - 1 : TOP + BR + 2;
      const i = k - 1; // 0 = \u6700\u9760\u6881
      const active = i < s.up;
      return active ? BEAM_Y + BEAM_H + BR + 1 + i * (2 * BR) : BOT - BR - 2 - (3 - i) * (2 * BR);
    }
    function render() {
      for (let i = 0; i < n; i++) {
        const x = 12 + RW / 2 + i * RW;
        for (let k = 0; k < 5; k++) {
          const g = beads[i][k];
          g.style.transform = `translate(${x}px, ${yFor(k, state[i])}px)`;
          const on = k === 0 ? state[i].top : (k - 1) < state[i].up;
          g.classList.toggle('on', on);
        }
      }
      svg.setAttribute('aria-label', '\u7b97\u76d8\u663e\u793a ' + value());
    }
    function digit(i) { return (state[i].top ? 5 : 0) + state[i].up; }
    function value() {
      let v = 0;
      for (let i = 0; i < n; i++) v = v * 10 + digit(i);
      return v;
    }
    function set(v) {
      v = Math.max(0, Math.floor(v));
      for (let i = n - 1; i >= 0; i--) {
        const d = v % 10; v = Math.floor(v / 10);
        state[i].top = d >= 5; state[i].up = d % 5;
      }
      render();
    }
    function onTap(e) {
      const g = e.target.closest('.ab-bead');
      if (!g) return;
      e.preventDefault();
      const i = +g.dataset.rod, k = +g.dataset.k, s = state[i];
      if (k === 0) s.top = !s.top;
      else {
        const idx = k - 1;
        s.up = idx < s.up ? idx : idx + 1;
      }
      tick(k === 0 ? 1500 : 1900);
      render();
      if (opts.onChange) opts.onChange(value());
    }
    if (opts.interactive) {
      svg.classList.add('interactive');
      svg.addEventListener('pointerdown', onTap);
    }
    host.appendChild(svg);
    render();
    return {
      svg, set, value, digit,
      clear() { set(0); if (opts.onChange) opts.onChange(0); },
      mark(i, on) { // \u9ad8\u4eae\u67d0\u4e00\u6863
        beads[i].forEach(b => b.classList.toggle('focus', !!on));
      },
      setInteractive(on) { svg.classList.toggle('interactive', on); opts.interactive = on; svg.style.pointerEvents = on ? '' : 'none'; },
    };
  }

  /* ---------- \u53e3\u8bc0\u5224\u5b9a ---------- */
  // \u5bf9\u4e00\u4e2a\u6863\u4e0a\u7684\u6570\u5b57 a \u8fdb\u884c +b \u6216 -b\uff08b \u4e3a 1..9\uff09\uff0c\u8fd4\u56de\u6240\u7528\u65b9\u6cd5
  // direct \u76f4\u52a0/\u76f4\u51cf\uff1bfive \u4e94\u7684\u8865\u6570\uff1bten \u5341\u7684\u8865\u6570\uff1bmix \u7834\u4e94\u8fdb\u5341/\u9000\u5341\u8865\u4e94
  function methodOf(a, b, op) {
    const la = a % 5, ua = a >= 5;
    const lb = b % 5, ub = b >= 5;
    if (op === '+') {
      if (a + b < 10) {
        if ((!ub || !ua) && la + lb <= 4) return 'direct';
        return 'five';
      }
      const c = 10 - b;
      if (c < 5 && ua && la < c) return 'mix';
      return 'ten';
    } else {
      if (a - b >= 0) {
        if ((!ub || ua) && la >= lb) return 'direct';
        return 'five';
      }
      const c = 10 - b;
      if (c < 5 && !ua && la + c >= 5) return 'mix';
      return 'ten';
    }
  }
  const METHOD_NAME = { direct: '\u76f4\u63a5\u62e8', five: '\u4e94\u7684\u8865\u6570', ten: '\u5341\u7684\u8865\u6570', mix: op => (op === '+' ? '\u7834\u4e94\u8fdb\u5341' : '\u9000\u5341\u8865\u4e94') };
  function methodName(m, op) { const v = METHOD_NAME[m]; return typeof v === 'function' ? v(op) : v; }

  // \u8fd4\u56de\u8be5\u6b65\u7684\u53e3\u8bc0\uff08\u4f20\u7edf\u4e5d\u4e5d\u52a0\u51cf\u53e3\u8bc0\uff09
  function rhyme(a, b, op) {
    const m = methodOf(a, b, op), B = CN[b];
    if (op === '+') {
      if (m === 'direct') return b >= 5 ? (b === 5 ? '\u4e94\u4e0a\u4e94' : `${B}\u4e0a${B}`) : `${B}\u4e0a${B}`;
      if (m === 'five') return `${B}\u4e0b\u4e94\u53bb${CN[5 - b]}`;
      if (m === 'ten') return `${B}\u53bb${CN[10 - b]}\u8fdb\u4e00`;
      return `${B}\u4e0a${CN[b - 5]}\u53bb\u4e94\u8fdb\u4e00`;
    } else {
      if (m === 'direct') return `${B}\u53bb${B}`;
      if (m === 'five') return `${B}\u4e0a${CN[5 - b]}\u53bb\u4e94`;
      if (m === 'ten') return `${B}\u9000\u4e00\u8fd8${CN[10 - b]}`;
      return `${B}\u9000\u4e00\u8fd8\u4e94\u53bb${CN[b - 5]}`;
    }
  }
  // \u7528\u767d\u8bdd\u89e3\u91ca\u8be5\u6b65\u600e\u4e48\u62e8
  function explain(a, b, op) {
    const m = methodOf(a, b, op);
    if (op === '+') {
      if (m === 'direct') return `\u76f4\u63a5\u62e8\u4e0a ${b}`;
      if (m === 'five') return `\u4e0b\u73e0\u4e0d\u591f\uff1a\u62e8\u4e0b\u4e0a\u73e0(+5)\uff0c\u518d\u53bb\u6389 ${5 - b} \u9897\u4e0b\u73e0(\u2212${5 - b})\u3002\u56e0\u4e3a ${b} = 5 \u2212 ${5 - b}`;
      if (m === 'ten') return `\u672c\u6863\u653e\u4e0d\u4e0b\uff1a\u672c\u6863\u53bb ${10 - b}\uff0c\u5de6\u8fb9\u4e00\u6863\u8fdb 1\u3002\u56e0\u4e3a ${b} = 10 \u2212 ${10 - b}`;
      return `\u8981\u53bb ${10 - b} \u4f46\u4e0b\u73e0\u4e0d\u591f\uff1a\u672c\u6863\u62e8\u4e0a ${b - 5} \u9897\u4e0b\u73e0\u3001\u62e8\u8d70\u4e0a\u73e0\uff0c\u518d\u5411\u5de6\u8fdb 1`;
    } else {
      if (m === 'direct') return `\u76f4\u63a5\u62e8\u53bb ${b}`;
      if (m === 'five') return `\u4e0b\u73e0\u4e0d\u591f\u51cf\uff1a\u62e8\u4e0a ${5 - b} \u9897\u4e0b\u73e0\uff0c\u518d\u62e8\u8d70\u4e0a\u73e0(\u22125)\u3002\u56e0\u4e3a ${b} = 5 \u2212 ${5 - b}`;
      if (m === 'ten') return `\u672c\u6863\u4e0d\u591f\u51cf\uff1a\u5de6\u8fb9\u4e00\u6863\u9000 1\uff08\u501f 10\uff09\uff0c\u672c\u6863\u8fd8 ${10 - b}\u3002\u56e0\u4e3a ${b} = 10 \u2212 ${10 - b}`;
      return `\u5de6\u8fb9\u9000 1\uff0c\u672c\u6863\u8fd8 ${10 - b} \u4f46\u9700\u8981\u51d1\u4e94\uff1a\u62e8\u4e0b\u4e0a\u73e0(+5)\uff0c\u518d\u53bb\u6389 ${b - 5} \u9897\u4e0b\u73e0`;
    }
  }

  // \u628a\u4e00\u6b65\u52a0\u51cf\u62c6\u6210\u62e8\u73e0\u7684\u4e2d\u95f4\u72b6\u6001\uff08\u7528\u4e8e\u6f14\u793a\u52a8\u753b\uff09
  function microSteps(v, b, op) {
    const m = methodOf(v % 10, b, op);
    if (op === '+') {
      if (m === 'direct') return b > 5 ? [v + 5, v + b] : [v + b];
      if (m === 'five') return [v + 5, v + b];
      if (m === 'ten') return [v - (10 - b), v + b];
      return [v + (b - 5), v + (b - 5) - 5, v + b];
    }
    if (m === 'direct') return b > 5 ? [v - 5, v - b] : [v - b];
    if (m === 'five') return [v + (5 - b), v - b];
    if (m === 'ten') return [v - 10, v - b];
    return [v - 10, v - 5, v - b];
  }

  /* ---------- \u51fa\u9898 ---------- */
  const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function nDigit(d) { return d <= 1 ? rnd(1, 9) : rnd(Math.pow(10, d - 1), Math.pow(10, d) - 1); }

  // \u4e24\u6863\u4e0a\u7684\u8fde\u7eed\u52a0\u51cf\uff0c\u9650\u5b9a\u4e2a\u4f4d\u6240\u7528\u65b9\u6cd5\uff1bfocus \u4e2d\u7684\u65b9\u6cd5\u81f3\u5c11\u5360\u4e00\u534a
  function genChain(opts) {
    opts = Object.assign({ steps: 5, methods: ['direct'], focus: null, ops: ['+', '-'], max: 99 }, opts);
    const focus = opts.focus || opts.methods;
    for (let tries = 0; tries < 400; tries++) {
      let v = rnd(0, Math.min(opts.max, 9)), start = v;
      const seq = [];
      let focused = 0, guard = 0;
      const need = Math.ceil(opts.steps / 2);
      while (seq.length < opts.steps && guard++ < 300) {
        const op = pick(opts.ops), b = rnd(1, 9);
        const nv = op === '+' ? v + b : v - b;
        if (nv < 0 || nv > opts.max) continue;
        const m = methodOf(v % 10, b, op);
        if (!opts.methods.includes(m)) continue;
        if (op === '+' && m !== 'direct' && m !== 'five' && Math.floor(v / 10) % 10 === 9) continue;
        const mustFocus = need - focused >= opts.steps - seq.length || Math.random() < 0.6;
        if (mustFocus && !focus.includes(m)) continue;
        if (focus.includes(m)) focused++;
        seq.push({ op, b, from: v, to: nv, m });
        v = nv;
      }
      if (seq.length === opts.steps) return { start, seq, answer: v };
    }
    return { start: 0, seq: [{ op: '+', b: 1, from: 0, to: 1, m: 'direct' }], answer: 1 };
  }

  // \u591a\u4f4d\u6570\u8fde\u52a0\u51cf\uff1adigits \u4f4d\u6570\uff0cterms \u9879\u6570\uff1b\u4fdd\u8bc1\u4e2d\u95f4\u7ed3\u679c\u4e0d\u4e3a\u8d1f
  function genMulti(digits, terms, allowSub) {
    const nums = [];
    let sum = 0;
    for (let i = 0; i < terms; i++) {
      let x = nDigit(digits), op = '+';
      if (i > 0 && allowSub && Math.random() < 0.4 && sum - x >= 0) op = '-';
      sum = op === '+' ? sum + x : sum - x;
      nums.push(op === '+' ? x : -x);
    }
    return { nums, answer: sum };
  }
  function genMul(da, db) {
    const a = nDigit(da), b = nDigit(db);
    return { a, b, answer: a * b };
  }
  function fmtTerm(x, first) { return (first ? (x < 0 ? '\u2212' : '') : (x < 0 ? '\u2212 ' : '+ ')) + Math.abs(x); }

  /* ---------- \u95ea\u7b97 ---------- */
  function flash(el, nums, ms, gap) {
    gap = gap == null ? Math.max(120, ms * 0.25) : gap;
    return new Promise(resolve => {
      let i = 0;
      const step = () => {
        if (i >= nums.length) { el.textContent = '?'; el.classList.add('ask'); resolve(); return; }
        el.classList.remove('ask');
        const x = nums[i];
        el.textContent = (i > 0 && x < 0 ? '\u2212' : '') + Math.abs(x);
        el.classList.toggle('neg', x < 0);
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        tick(x < 0 ? 900 : 1200);
        i++;
        setTimeout(() => { el.textContent = ''; setTimeout(step, gap); }, ms);
      };
      el.textContent = ''; setTimeout(step, 400);
    });
  }

  /* ---------- \u6570\u5b57\u952e\u76d8\uff08\u624b\u673a\u4e0a\u6bd4\u7cfb\u7edf\u952e\u76d8\u66f4\u5feb\uff09 ---------- */
  function keypad(host, onSubmit, opts) {
    opts = opts || {};
    let buf = '';
    host.classList.add('zsx-kp');
    host.innerHTML = '';
    const disp = document.createElement('div');
    disp.className = 'kp-display';
    disp.setAttribute('aria-live', 'polite');
    host.appendChild(disp);
    const grid = document.createElement('div');
    grid.className = 'kp-grid';
    host.appendChild(grid);
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '\u232b', '0', '\u2713'];
    keys.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = k;
      b.className = k === '\u2713' ? 'kp-ok' : k === '\u232b' ? 'kp-del' : '';
      b.setAttribute('aria-label', k === '\u2713' ? '\u786e\u8ba4' : k === '\u232b' ? '\u5220\u9664' : k);
      b.addEventListener('click', () => press(k));
      grid.appendChild(b);
    });
    function show() { disp.textContent = buf || (opts.placeholder || '\u8f93\u5165\u7b54\u6848'); disp.classList.toggle('empty', !buf); }
    function press(k) {
      if (k === '\u232b') buf = buf.slice(0, -1);
      else if (k === '\u2713') { if (buf) { const v = buf; buf = ''; show(); onSubmit(+v); } return; }
      else if (buf.length < 12) buf += k;
      tick(2400);
      show();
    }
    const onKey = e => {
      if (!host.isConnected || host.offsetParent === null) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('\u232b');
      else if (e.key === 'Enter') press('\u2713');
    };
    document.addEventListener('keydown', onKey);
    show();
    return { clear() { buf = ''; show(); }, destroy() { document.removeEventListener('keydown', onKey); } };
  }

  window.ZSX = {
    abacus, methodOf, methodName, rhyme, explain, microSteps, genChain, genMulti, genMul, fmtTerm,
    flash, keypad, store, save, tick, chime, setMuted, isMuted: () => muted,
    rnd, pick, nDigit, CN, PLACE,
  };
})();
