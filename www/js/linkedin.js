'use strict';
/* ═══════════ Jeux de logique façon LinkedIn : Zip, Queens, Tango, Patches ═══════════ */
Object.assign(GAME_INFO, {
  zip: { name: 'Zip', win: 'Bravo Papa, tu as tracé le chemin parfait\u202f!',
    rules: 'Pars du 1 et trace un seul chemin en glissant le doigt de case en case (pas en diagonale). Passe par les nombres dans l’ordre et remplis toutes les cases de la grille. Les traits épais sont des murs infranchissables. Pour revenir en arrière, repasse sur ton chemin ou touche une case déjà tracée.' },
  queens: { name: 'Queens', win: 'Bravo Papa, toutes les reines sont à leur place\u202f!',
    rules: 'Place une reine 👑 dans chaque ligne, chaque colonne et chaque zone de couleur. Deux reines ne peuvent jamais se toucher, même en diagonale. Touche une case une fois pour y mettre une croix ✕ (aide-mémoire), deux fois pour poser une reine.' },
  tango: { name: 'Tango', win: 'Bravo Papa, le jour et la nuit sont en équilibre\u202f!',
    rules: 'Remplis la grille de soleils ☀️ et de lunes 🌙. Chaque ligne et chaque colonne contient autant de soleils que de lunes, et jamais plus de deux symboles identiques côte à côte. Le signe = relie deux cases identiques, le signe × deux cases différentes. Touche une case pour changer son symbole.' },
  patches: { name: 'Patches', win: 'Bravo Papa, le patchwork est parfait\u202f!',
    rules: 'Découpe toute la grille en rectangles. Chaque rectangle contient exactement un nombre, qui donne le nombre de cases du rectangle. L’icône indique sa forme : ■ carré, ▬ plus large que haut, ▮ plus haut que large. Glisse le doigt d’un coin à l’autre pour tracer un rectangle, touche-le pour l’effacer.' },
});

/* ——— Outils communs ——— */
const LK = {
  rnd: (R, n) => Math.floor(R() * n),
  shuffle(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  // Plateau commun : grille à gauche, objectif et boutons à droite
  shell(api, id, goal) {
    api.root.innerHTML = `<div class="lk lk-${id}"><div class="lk-board"></div>
      <div class="lk-side"><p class="lk-goal">${goal}</p><p class="lk-msg" aria-live="polite"></p>
      <div class="lk-tools"><button class="btn lk-hint">💡 Indice</button><button class="btn ghost lk-undo">↶ Annuler</button><button class="btn ghost lk-clear">⌫ Tout effacer</button></div></div></div>`;
    const q = s => api.root.querySelector(s);
    return { board: q('.lk-board'), msg: q('.lk-msg'), hint: q('.lk-hint'), undo: q('.lk-undo'), clear: q('.lk-clear') };
  },
  say(ui, t, bad) { ui.msg.textContent = t || ''; ui.msg.classList.toggle('bad', !!bad); },
  stars: h => h === 0 ? 3 : h === 1 ? 2 : 1,
  // Indique la case sous le doigt, même quand on glisse
  cellAt(board, e) {
    const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest('[data-i]');
    return c && board.contains(c) ? +c.dataset.i : -1;
  },
};

/* ═══════════ Queens ═══════════ */
const QUEEN_COLORS = ['#f4a58a', '#a9c8f0', '#c3e39a', '#f2d36b', '#d3b3ec', '#93d9d0', '#f2b6cf', '#d8c3a5', '#b9bec7', '#f7c58c'];
function queensSolve(N, reg, limit) {
  const sols = [], cols = new Array(N).fill(false), regs = new Array(N).fill(false), p = [];
  (function go(r) {
    if (sols.length >= limit) return;
    if (r === N) { sols.push(p.slice()); return; }
    for (let c = 0; c < N; c++) {
      const g = reg[r * N + c];
      if (cols[c] || regs[g] || (r > 0 && Math.abs(p[r - 1] - c) < 2)) continue;
      cols[c] = regs[g] = true; p[r] = c; go(r + 1); cols[c] = regs[g] = false;
    }
  })(0);
  return { count: sols.length, sol: sols[0], sols };
}
function queensGen(N, R) {
  const nb = i => { const r = Math.floor(i / N), c = i % N, o = []; if (r > 0) o.push(i - N); if (r < N - 1) o.push(i + N); if (c > 0) o.push(i - 1); if (c < N - 1) o.push(i + 1); return o; };
  const connected = (reg, g) => {
    const all = []; for (let i = 0; i < N * N; i++) if (reg[i] === g) all.push(i);
    if (!all.length) return false; const seen = new Set([all[0]]), st = [all[0]];
    while (st.length) { const i = st.pop(); nb(i).forEach(j => { if (reg[j] === g && !seen.has(j)) { seen.add(j); st.push(j); } }); }
    return seen.size === all.length;
  };
  for (let tries = 0; tries < 300; tries++) {
    // reines placées au hasard sans se toucher
    const p = [];
    const place = r => { if (r === N) return true; for (const c of LK.shuffle([...Array(N).keys()], R)) { if (p.includes(c) || (r > 0 && Math.abs(p[r - 1] - c) < 2)) continue; p[r] = c; if (place(r + 1)) return true; } p.length = r; return false; };
    if (!place(0)) continue;
    // chaque zone de couleur pousse à partir de sa reine
    const reg = new Array(N * N).fill(-1), seed = new Set();
    p.forEach((c, r) => { reg[r * N + c] = r; seed.add(r * N + c); });
    let left = N * N - N;
    while (left > 0) {
      const g = LK.rnd(R, N), opts = [];
      for (let i = 0; i < N * N; i++) if (reg[i] === g) nb(i).forEach(j => { if (reg[j] < 0) opts.push(j); });
      if (!opts.length) continue;
      reg[opts[LK.rnd(R, opts.length)]] = g; left--;
    }
    // tant qu’il existe une autre solution, on déplace une case de zone pour la casser
    for (let it = 0; it < 120; it++) {
      const s = queensSolve(N, reg, 2);
      if (s.count === 1) return { N, reg, sol: p.slice() };
      const alt = s.sols.find(x => x.some((c, r) => c !== p[r]));
      let fixed = false;
      for (const r of LK.shuffle([...Array(N).keys()].filter(r => alt[r] !== p[r]), R)) {
        const x = r * N + alt[r], g = reg[x]; if (seed.has(x)) continue;
        for (const h of LK.shuffle([...new Set(nb(x).map(j => reg[j]))].filter(h => h !== g), R)) {
          reg[x] = h; if (connected(reg, g)) { fixed = true; break; } reg[x] = g;
        }
        if (fixed) break;
      }
      if (!fixed) break;
    }
  }
  return null;
}
MINIS.queens = {
  start(api) {
    const R = api.R, N = Math.min(9, 5 + Math.round(api.d * 4));
    let P = null; for (let n = N; n >= 5 && !P; n--) P = queensGen(n, R);
    const n = P.N, reg = P.reg, sol = P.sol;
    const ui = LK.shell(api, 'queens', `Pose <b>${n} reines</b> : une par ligne, par colonne et par couleur, sans qu’elles se touchent.`);
    const st = new Array(n * n).fill(0), lock = new Set(), hist = []; // 0 vide, 1 croix, 2 reine
    let hints = 0, over = false;
    ui.board.style.setProperty('--n', n);
    ui.board.innerHTML = '<div class="lk-grid"></div>';
    const grid = ui.board.firstChild, cells = [];
    for (let i = 0; i < n * n; i++) {
      const r = Math.floor(i / n), c = i % n, b = document.createElement('button');
      b.className = 'lk-cell qn-cell'; b.dataset.i = i; b.style.background = QUEEN_COLORS[reg[i] % QUEEN_COLORS.length];
      if (c < n - 1 && reg[i] !== reg[i + 1]) b.classList.add('wr');
      if (r < n - 1 && reg[i] !== reg[i + n]) b.classList.add('wb');
      grid.appendChild(b); cells.push(b);
    }
    const queens = () => st.map((v, i) => v === 2 ? i : -1).filter(i => i >= 0);
    function conflicts() {
      const q = queens(), bad = new Set();
      for (let a = 0; a < q.length; a++) for (let b = a + 1; b < q.length; b++) {
        const ra = Math.floor(q[a] / n), ca = q[a] % n, rb = Math.floor(q[b] / n), cb = q[b] % n;
        if (ra === rb || ca === cb || reg[q[a]] === reg[q[b]] || (Math.abs(ra - rb) < 2 && Math.abs(ca - cb) < 2)) { bad.add(q[a]); bad.add(q[b]); }
      }
      return bad;
    }
    function draw() {
      const bad = conflicts();
      cells.forEach((b, i) => {
        b.textContent = st[i] === 2 ? '👑' : st[i] === 1 ? '✕' : '';
        b.classList.toggle('q', st[i] === 2); b.classList.toggle('x', st[i] === 1);
        b.classList.toggle('bad', bad.has(i)); b.classList.toggle('lock', lock.has(i));
      });
      api.stat(`${queens().length}/${n} reines`);
      return bad;
    }
    function check(prevBad) {
      const bad = draw(), q = queens();
      if (bad.size > prevBad) { Sound.wrong(); LK.say(ui, 'Deux reines se gênent : regarde les cases en rouge.', true); }
      else LK.say(ui, '');
      if (q.length === n && !bad.size) { over = true; Sound.complete(); LK.say(ui, 'Parfait\u202f!'); api.win(LK.stars(hints), [{ label: 'Indices', value: hints }, { label: 'Grille', value: `${n}×${n}` }]); }
    }
    function set(i, v) { if (lock.has(i) || st[i] === v) return; hist.push([i, st[i]]); st[i] = v; }
    // un toucher fait défiler vide → croix → reine ; glisser pose des croix
    let drag = null;
    grid.addEventListener('pointerdown', e => {
      if (over) return; const i = LK.cellAt(grid, e); if (i < 0 || lock.has(i)) return;
      e.preventDefault(); drag = { start: i, moved: false, mark: st[i] === 0 ? 1 : null };
    });
    grid.addEventListener('pointermove', e => {
      if (!drag || drag.mark === null) return; const i = LK.cellAt(grid, e);
      if (i < 0 || (i === drag.start && !drag.moved)) return;
      if (!drag.moved) { drag.moved = true; set(drag.start, 1); }
      if (st[i] === 0) { set(i, 1); draw(); }
    });
    window.addEventListener('pointerup', MINIS.queens._up = () => {
      if (!drag) return; const d = drag; drag = null;
      if (d.moved) { Sound.tap(); draw(); return; }
      const prev = conflicts().size, v = (st[d.start] + 1) % 3; set(d.start, v);
      if (v === 2) { const bad = conflicts(); if (!bad.size || bad.size <= prev) Sound.found(); } else Sound.tap();
      check(prev);
    });
    ui.hint.addEventListener('click', () => {
      if (over) return;
      let rr = sol.findIndex((c, k) => st[k * n + c] !== 2);
      if (rr < 0) rr = sol.findIndex((c, k) => !lock.has(k * n + c)); if (rr < 0) return;
      const i = rr * n + sol[rr];
      for (let k = 0; k < n * n; k++) if (st[k] === 2 && !lock.has(k) && (Math.floor(k / n) === rr || k % n === sol[rr] || reg[k] === reg[i])) st[k] = 0;
      st[i] = 2; lock.add(i); hints++; Sound.hint();
      cells[i].classList.remove('hinted'); void cells[i].offsetWidth; cells[i].classList.add('hinted');
      check(conflicts().size);
    });
    ui.undo.addEventListener('click', () => { if (over || !hist.length) return; const [i, v] = hist.pop(); if (!lock.has(i)) st[i] = v; Sound.tap(); draw(); LK.say(ui, ''); });
    ui.clear.addEventListener('click', () => { if (over) return; for (let i = 0; i < n * n; i++) if (!lock.has(i)) st[i] = 0; hist.length = 0; Sound.tap(); draw(); LK.say(ui, ''); });
    draw();
  },
  stop() { if (MINIS.queens._up) window.removeEventListener('pointerup', MINIS.queens._up); },
};

/* ═══════════ Tango ═══════════ */
const TG = 6;
function tangoOk(g, i, cons) {
  // vérifie la case i par rapport à ce qui est déjà rempli
  const r = Math.floor(i / TG), c = i % TG, v = g[i];
  let a = 0, b = 0, ra = 0, rb = 0;
  for (let k = 0; k < TG; k++) { const x = g[r * TG + k]; if (x === 1) a++; else if (x === 2) b++; const y = g[k * TG + c]; if (y === 1) ra++; else if (y === 2) rb++; }
  if (a > 3 || b > 3 || ra > 3 || rb > 3) return false;
  const same = (p, q) => g[p] === v && g[q] === v;
  if (c >= 2 && same(i - 1, i - 2)) return false; if (c >= 1 && c <= 4 && same(i - 1, i + 1)) return false; if (c <= 3 && same(i + 1, i + 2)) return false;
  if (r >= 2 && same(i - TG, i - 2 * TG)) return false; if (r >= 1 && r <= 4 && same(i - TG, i + TG)) return false; if (r <= 3 && same(i + TG, i + 2 * TG)) return false;
  for (const [p, q, eq] of cons[i] || []) { const o = g[p === i ? q : p]; if (o && (eq ? o !== v : o === v)) return false; }
  return true;
}
function tangoSolve(givens, consList, limit, R) {
  const cons = {}; consList.forEach(k => { (cons[k[0]] = cons[k[0]] || []).push(k); (cons[k[1]] = cons[k[1]] || []).push(k); });
  const g = givens.slice(); let count = 0, sol = null;
  (function go(i) {
    if (count >= limit) return;
    if (i === TG * TG) { count++; if (!sol) sol = g.slice(); return; }
    if (givens[i]) { if (tangoOk(g, i, cons)) go(i + 1); return; }
    const order = R && R() < .5 ? [2, 1] : [1, 2];
    for (const v of order) { g[i] = v; if (tangoOk(g, i, cons)) go(i + 1); g[i] = 0; }
  })(0);
  return { count, sol };
}
function tangoGen(d, R) {
  const full = tangoSolve(new Array(TG * TG).fill(0), [], 1, R).sol;
  const edges = [];
  for (let i = 0; i < TG * TG; i++) { if (i % TG < TG - 1) edges.push([i, i + 1]); if (i < TG * (TG - 1)) edges.push([i, i + TG]); }
  const cons = LK.shuffle(edges, R).slice(0, 5 + LK.rnd(R, 5)).map(([p, q]) => [p, q, full[p] === full[q]]);
  const giv = full.slice(), target = Math.round(13 - d * 9);
  let left = TG * TG;
  for (const i of LK.shuffle([...Array(TG * TG).keys()], R)) {
    if (left <= target) break;
    const v = giv[i]; giv[i] = 0;
    if (tangoSolve(giv, cons, 2).count !== 1) giv[i] = v; else left--;
  }
  return { full, giv, cons };
}
MINIS.tango = {
  start(api) {
    const R = api.R, P = tangoGen(api.d, R), N = TG;
    const ui = LK.shell(api, 'tango', 'Autant de <b>☀️</b> que de <b>🌙</b> par ligne et par colonne, jamais trois identiques à la suite.');
    const g = P.giv.slice(), lock = new Set(P.giv.map((v, i) => v ? i : -1).filter(i => i >= 0)), hist = [];
    let hints = 0, over = false;
    ui.board.style.setProperty('--n', N);
    ui.board.innerHTML = '<div class="lk-grid"></div>';
    const grid = ui.board.firstChild, cells = [];
    for (let i = 0; i < N * N; i++) { const b = document.createElement('button'); b.className = 'lk-cell tg-cell'; b.dataset.i = i; grid.appendChild(b); cells.push(b); }
    P.cons.forEach(([p, q, eq]) => {
      const s = document.createElement('span'), r = Math.floor(p / N), c = p % N, hor = q === p + 1;
      s.className = 'tg-sign'; s.textContent = eq ? '=' : '×';
      s.style.left = `calc(${(c + (hor ? 1 : .5)) / N * 100}%)`; s.style.top = `calc(${(r + (hor ? .5 : 1)) / N * 100}%)`;
      grid.appendChild(s);
    });
    const SYM = ['', '☀️', '🌙'];
    function errors() {
      const bad = new Set(), line = idx => {
        const v = idx.map(i => g[i]);
        if (v.filter(x => x === 1).length > 3 || v.filter(x => x === 2).length > 3) idx.forEach(i => g[i] && bad.add(i));
        for (let k = 0; k + 2 < idx.length; k++) if (v[k] && v[k] === v[k + 1] && v[k] === v[k + 2]) [0, 1, 2].forEach(o => bad.add(idx[k + o]));
      };
      for (let r = 0; r < N; r++) { line([...Array(N).keys()].map(c => r * N + c)); line([...Array(N).keys()].map(c => c * N + r)); }
      P.cons.forEach(([p, q, eq]) => { if (g[p] && g[q] && (eq ? g[p] !== g[q] : g[p] === g[q])) { bad.add(p); bad.add(q); } });
      return bad;
    }
    function draw() {
      const bad = errors();
      cells.forEach((b, i) => { b.textContent = SYM[g[i]]; b.classList.toggle('lock', lock.has(i)); b.classList.toggle('bad', bad.has(i)); });
      api.stat(`${g.filter(Boolean).length}/${N * N} cases`);
      return bad;
    }
    function after(prev) {
      const bad = draw();
      if (bad.size > prev) { Sound.wrong(); LK.say(ui, 'Une règle n’est pas respectée : regarde les cases en rouge.', true); } else LK.say(ui, '');
      if (g.every(Boolean) && !bad.size) { over = true; Sound.complete(); LK.say(ui, 'Équilibre parfait\u202f!'); api.win(LK.stars(hints), [{ label: 'Indices', value: hints }]); }
      else if (!bad.size && bad.size === prev) {
        // une ligne ou une colonne complète et juste : petit encouragement
        for (let r = 0; r < N; r++) {
          const row = [...Array(N).keys()].map(c => g[r * N + c]), col = [...Array(N).keys()].map(c => g[c * N + r]);
          if (row.every(Boolean) && row.filter(x => x === 1).length === 3 && hist.length && Math.floor(hist[hist.length - 1][0] / N) === r) { Sound.found(); break; }
          if (col.every(Boolean) && col.filter(x => x === 1).length === 3 && hist.length && hist[hist.length - 1][0] % N === r) { Sound.found(); break; }
        }
      }
    }
    grid.addEventListener('click', e => {
      const c = e.target.closest('[data-i]'); if (!c || over) return; const i = +c.dataset.i; if (lock.has(i)) return;
      const prev = errors().size; hist.push([i, g[i]]); g[i] = (g[i] + 1) % 3; Sound.tap(); after(prev);
    });
    ui.hint.addEventListener('click', () => {
      if (over) return;
      const wrong = [...Array(N * N).keys()].filter(i => !lock.has(i) && g[i] && g[i] !== P.full[i]);
      const empty = [...Array(N * N).keys()].filter(i => !lock.has(i) && !g[i]);
      const pick = wrong.length ? wrong[0] : empty.length ? empty[LK.rnd(R, empty.length)] : -1; if (pick < 0) return;
      g[pick] = P.full[pick]; lock.add(pick); hints++; Sound.hint();
      cells[pick].classList.remove('hinted'); void cells[pick].offsetWidth; cells[pick].classList.add('hinted');
      after(errors().size);
    });
    ui.undo.addEventListener('click', () => { if (over || !hist.length) return; const [i, v] = hist.pop(); if (!lock.has(i)) g[i] = v; Sound.tap(); draw(); LK.say(ui, ''); });
    ui.clear.addEventListener('click', () => { if (over) return; for (let i = 0; i < N * N; i++) if (!lock.has(i)) g[i] = 0; hist.length = 0; Sound.tap(); draw(); LK.say(ui, ''); });
    draw();
  },
};

/* ═══════════ Zip ═══════════ */
function zipPath(N, R) {
  // chemin passant par toutes les cases, mélangé par « backbite »
  let path = [];
  for (let r = 0; r < N; r++) for (let k = 0; k < N; k++) path.push(r * N + (r % 2 ? N - 1 - k : k));
  const nb = i => { const r = Math.floor(i / N), c = i % N, o = []; if (r > 0) o.push(i - N); if (r < N - 1) o.push(i + N); if (c > 0) o.push(i - 1); if (c < N - 1) o.push(i + 1); return o; };
  const L = path.length;
  for (let it = 0; it < N * N * 60; it++) {
    if (R() < .5) path.reverse();
    const end = path[L - 1], opts = nb(end).filter(x => x !== path[L - 2]);
    const x = opts[LK.rnd(R, opts.length)], j = path.indexOf(x);
    path = path.slice(0, j + 1).concat(path.slice(j + 1).reverse());
  }
  return path;
}
MINIS.zip = {
  start(api) {
    const R = api.R, d = api.d, N = Math.min(8, 5 + Math.round(d * 3)), sol = zipPath(N, R), L = N * N;
    const K = Math.max(5, Math.min(14, Math.round(L * (.32 - .17 * d))));
    const idx = LK.shuffle([...Array(L - 2).keys()].map(k => k + 1), R).slice(0, K - 2).sort((a, b) => a - b);
    const marks = [0].concat(idx, [L - 1]), num = new Array(L).fill(0);
    marks.forEach((k, m) => { num[sol[k]] = m + 1; });
    // murs entre des cases voisines que le chemin ne relie pas
    const walls = new Set(), wkey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
    if (d > .3) {
      const link = new Set(); for (let k = 1; k < L; k++) link.add(wkey(sol[k - 1], sol[k]));
      const cand = []; for (let i = 0; i < L; i++) { if (i % N < N - 1 && !link.has(wkey(i, i + 1))) cand.push([i, i + 1]); if (i < L - N && !link.has(wkey(i, i + N))) cand.push([i, i + N]); }
      LK.shuffle(cand, R).slice(0, Math.round(d * N * 1.2)).forEach(([a, b]) => walls.add(wkey(a, b)));
    }
    const ui = LK.shell(api, 'zip', `Relie les nombres de <b>1 à ${K}</b> dans l’ordre en passant par <b>toutes les cases</b>.`);
    ui.board.style.setProperty('--n', N);
    ui.board.innerHTML = '<div class="lk-grid"><svg class="zp-line" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline/></svg></div>';
    const grid = ui.board.firstChild, line = grid.querySelector('polyline'), cells = [];
    for (let i = 0; i < L; i++) {
      const b = document.createElement('div'); b.className = 'lk-cell zp-cell'; b.dataset.i = i;
      if (i % N < N - 1 && walls.has(wkey(i, i + 1))) b.classList.add('wr');
      if (i < L - N && walls.has(wkey(i, i + N))) b.classList.add('wb');
      if (num[i]) b.innerHTML = `<span class="zp-num">${num[i]}</span>`;
      grid.appendChild(b); cells.push(b);
    }
    let path = [], hints = 0, over = false;
    const hist = [];
    const nextNum = () => path.reduce((m, i) => num[i] ? Math.max(m, num[i]) : m, 0) + 1;
    const adj = (a, b) => { const ra = Math.floor(a / N), rb = Math.floor(b / N); return (Math.abs(a - b) === 1 && ra === rb || Math.abs(a - b) === N) && !walls.has(wkey(a, b)); };
    function draw() {
      const on = new Set(path);
      cells.forEach((b, i) => { b.classList.toggle('on', on.has(i)); b.classList.toggle('head', i === path[path.length - 1]); });
      const pt = i => `${(i % N + .5) / N * 100},${(Math.floor(i / N) + .5) / N * 100}`;
      line.setAttribute('points', path.map(pt).join(' '));
      api.stat(`${path.length}/${L} cases`);
    }
    function finish() {
      if (path.length === L && num[path[L - 1]] === K) { over = true; Sound.complete(); LK.say(ui, 'Chemin parfait\u202f!'); api.win(LK.stars(hints), [{ label: 'Indices', value: hints }, { label: 'Grille', value: `${N}×${N}` }]); }
      else if (path.length === L) LK.say(ui, `Toutes les cases sont remplies, mais le chemin doit finir sur le ${K}.`, true);
    }
    function extend(i) {
      const last = path[path.length - 1];
      if (path.length >= 2 && i === path[path.length - 2]) { path.pop(); draw(); return true; }
      if (path.includes(i) || !adj(last, i)) return false;
      if (num[i] && num[i] !== nextNum()) { Sound.wrong(); LK.say(ui, `Il faut d’abord passer par le ${nextNum()}.`, true); return false; }
      path.push(i); LK.say(ui, '');
      if (num[i]) Sound.found(); draw(); finish(); return true;
    }
    let drawing = false;
    grid.addEventListener('pointerdown', e => {
      if (over) return; const i = LK.cellAt(grid, e); if (i < 0) return; e.preventDefault();
      hist.push(path.slice());
      if (!path.length) { if (num[i] !== 1) { LK.say(ui, 'Commence sur la case 1.', true); Sound.wrong(); return; } path = [i]; Sound.tap(); }
      else if (path.includes(i)) { path = path.slice(0, path.indexOf(i) + 1); Sound.tap(); }
      else if (!extend(i)) return;
      drawing = true; draw();
    });
    grid.addEventListener('pointermove', e => {
      if (!drawing || over) return; const i = LK.cellAt(grid, e);
      if (i < 0 || i === path[path.length - 1]) return; extend(i);
    });
    window.addEventListener('pointerup', MINIS.zip._up = () => { drawing = false; });
    ui.hint.addEventListener('click', () => {
      if (over) return; hist.push(path.slice());
      let k = 0; while (k < path.length && path[k] === sol[k]) k++;
      path = sol.slice(0, Math.min(L, Math.max(k, 1) + 3)); hints++; Sound.hint();
      const h = cells[path[path.length - 1]]; h.classList.remove('hinted'); void h.offsetWidth; h.classList.add('hinted');
      LK.say(ui, ''); draw(); finish();
    });
    ui.undo.addEventListener('click', () => { if (over || !hist.length) return; path = hist.pop(); Sound.tap(); LK.say(ui, ''); draw(); });
    ui.clear.addEventListener('click', () => { if (over) return; hist.push(path.slice()); path = []; Sound.tap(); LK.say(ui, ''); draw(); });
    draw();
  },
  stop() { if (MINIS.zip._up) window.removeEventListener('pointerup', MINIS.zip._up); },
};

/* ═══════════ Patches ═══════════ */
const PATCH_COLORS = ['#f4a58a', '#a9c8f0', '#c3e39a', '#f2d36b', '#d3b3ec', '#93d9d0', '#f2b6cf', '#d8c3a5', '#f7c58c', '#b5d7f5', '#e3e39a', '#c9b8f0'];
const shapeOf = (h, w) => h === w ? 'sq' : w > h ? 'wide' : 'tall';
function patchesSolve(N, clues, limit) {
  // pour chaque indice : tous les rectangles possibles de la bonne taille
  const at = new Map(clues.map((k, j) => [k.i, j]));
  const cand = clues.map(k => {
    const out = [], r0 = Math.floor(k.i / N), c0 = k.i % N;
    for (let h = 1; h <= N; h++) {
      if (k.a % h) continue; const w = k.a / h; if (w > N) continue;
      if (k.shape && shapeOf(h, w) !== k.shape) continue;
      for (let r = r0 - h + 1; r <= r0; r++) for (let c = c0 - w + 1; c <= c0; c++) {
        if (r < 0 || c < 0 || r + h > N || c + w > N) continue;
        let ok = true; const cells = [];
        for (let y = r; y < r + h && ok; y++) for (let x = c; x < c + w; x++) { const i = y * N + x; if (i !== k.i && at.has(i)) { ok = false; break; } cells.push(i); }
        if (ok) out.push({ r, c, h, w, cells });
      }
    }
    return out;
  });
  const order = clues.map((_, j) => j).sort((a, b) => cand[a].length - cand[b].length);
  const used = new Uint8Array(N * N), pick = []; let count = 0, sol = null;
  (function go(k) {
    if (count >= limit) return;
    if (k === order.length) { count++; if (!sol) sol = pick.slice(); return; }
    const j = order[k];
    for (const rc of cand[j]) {
      if (rc.cells.some(i => used[i])) continue;
      rc.cells.forEach(i => { used[i] = 1; }); pick[j] = rc; go(k + 1); rc.cells.forEach(i => { used[i] = 0; });
    }
  })(0);
  return { count, sol };
}
function patchesGen(N, d, R) {
  for (let tries = 0; tries < 600; tries++) {
    const id = new Array(N * N).fill(-1), rects = [];
    for (let i = 0; i < N * N; i++) {
      if (id[i] >= 0) continue;
      const r = Math.floor(i / N), c = i % N, opts = [];
      for (let h = 1; r + h <= N; h++) for (let w = 1; c + w <= N; w++) {
        let free = true; for (let y = r; y < r + h && free; y++) for (let x = c; x < c + w; x++) if (id[y * N + x] >= 0) { free = false; break; }
        if (!free) break;
        const a = h * w; if (a >= 2 && a <= 8) opts.push([h, w]);
      }
      const [h, w] = opts.length ? opts[LK.rnd(R, opts.length)] : [1, 1];
      for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) id[y * N + x] = rects.length;
      rects.push({ r, c, h, w });
    }
    if (rects.filter(x => x.h * x.w === 1).length > 1) continue;
    const clues = rects.map(x => ({ i: (x.r + LK.rnd(R, x.h)) * N + x.c + LK.rnd(R, x.w), a: x.h * x.w, shape: shapeOf(x.h, x.w) }));
    const s = patchesSolve(N, clues, 2); if (s.count !== 1) continue;
    // on retire des formes tant que la solution reste unique
    let hide = Math.round(clues.length * (.15 + .6 * d));
    for (const j of LK.shuffle(clues.map((_, j) => j), R)) {
      if (hide <= 0) break; const sh = clues[j].shape; clues[j].shape = null;
      if (patchesSolve(N, clues, 2).count !== 1) clues[j].shape = sh; else hide--;
    }
    return { N, clues, sol: patchesSolve(N, clues, 1).sol };
  }
  return null;
}
MINIS.patches = {
  start(api) {
    const R = api.R, d = api.d; let P = null;
    for (let N = Math.min(8, 5 + Math.round(d * 3)); N >= 4 && !P; N--) P = patchesGen(N, d, R);
    const N = P.N, clues = P.clues, clueAt = new Map(clues.map((k, j) => [k.i, j]));
    const ui = LK.shell(api, 'patches', `Découpe la grille en <b>${clues.length} rectangles</b> : un nombre par rectangle, égal à sa taille.`);
    ui.board.style.setProperty('--n', N);
    ui.board.innerHTML = '<div class="lk-grid"><div class="pt-layer"></div></div>';
    const grid = ui.board.firstChild, layer = grid.firstChild, cells = [];
    const ICON = { sq: '■', wide: '▬', tall: '▮' };
    for (let i = 0; i < N * N; i++) {
      const b = document.createElement('div'); b.className = 'lk-cell pt-cell'; b.dataset.i = i;
      const j = clueAt.get(i);
      if (j !== undefined) b.innerHTML = `<span class="pt-clue" style="--c:${PATCH_COLORS[j % PATCH_COLORS.length]}"><b>${clues[j].a}</b>${clues[j].shape ? `<i>${ICON[clues[j].shape]}</i>` : ''}</span>`;
      grid.appendChild(b); cells.push(b);
    }
    let rects = [], hints = 0, over = false; const hist = [];
    const cellsOf = x => { const o = []; for (let y = x.r; y < x.r + x.h; y++) for (let k = x.c; k < x.c + x.w; k++) o.push(y * N + k); return o; };
    const overlap = (a, b) => a.r < b.r + b.h && b.r < a.r + a.h && a.c < b.c + b.w && b.c < a.c + a.w;
    function judge(x) {
      const inside = cellsOf(x).map(i => clueAt.get(i)).filter(j => j !== undefined);
      if (inside.length !== 1) return -1; const k = clues[inside[0]];
      return k.a === x.h * x.w && (!k.shape || k.shape === shapeOf(x.h, x.w)) ? inside[0] : -1;
    }
    function draw(preview) {
      layer.innerHTML = rects.concat(preview ? [preview] : []).map((x, n) => {
        const j = judge(x), col = j >= 0 ? PATCH_COLORS[j % PATCH_COLORS.length] : '#8a9aa6';
        return `<div class="pt-rect ${j < 0 ? 'bad' : ''} ${x === preview ? 'pre' : ''} ${x.lock ? 'lock' : ''}" style="--c:${col};left:${x.c / N * 100}%;top:${x.r / N * 100}%;width:${x.w / N * 100}%;height:${x.h / N * 100}%"></div>`;
      }).join('');
      const cov = rects.reduce((s, x) => s + x.h * x.w, 0);
      api.stat(`${rects.filter(x => judge(x) >= 0).length}/${clues.length} rectangles`);
      return cov;
    }
    function finish() {
      const cov = draw();
      if (cov === N * N && rects.every(x => judge(x) >= 0)) { over = true; Sound.complete(); LK.say(ui, 'Patchwork parfait\u202f!'); api.win(LK.stars(hints), [{ label: 'Indices', value: hints }, { label: 'Grille', value: `${N}×${N}` }]); }
    }
    function add(x) {
      hist.push(rects.slice()); rects = rects.filter(y => !overlap(x, y)); rects.push(x);
      if (judge(x) >= 0) { Sound.found(); LK.say(ui, ''); }
      else { const n = cellsOf(x).filter(i => clueAt.has(i)).length; Sound.wrong(); LK.say(ui, n === 0 ? 'Ce rectangle ne contient aucun nombre.' : n > 1 ? 'Un rectangle ne peut contenir qu’un seul nombre.' : 'La taille ou la forme ne correspond pas au nombre.', true); }
      finish();
    }
    let a = -1, cur = null;
    const box = (p, q) => { const r1 = Math.floor(p / N), c1 = p % N, r2 = Math.floor(q / N), c2 = q % N; return { r: Math.min(r1, r2), c: Math.min(c1, c2), h: Math.abs(r1 - r2) + 1, w: Math.abs(c1 - c2) + 1 }; };
    grid.addEventListener('pointerdown', e => { if (over) return; const i = LK.cellAt(grid, e); if (i < 0) return; e.preventDefault(); a = i; cur = box(i, i); draw(cur); });
    grid.addEventListener('pointermove', e => { if (a < 0) return; const i = LK.cellAt(grid, e); if (i < 0) return; cur = box(a, i); draw(cur); });
    window.addEventListener('pointerup', MINIS.patches._up = () => {
      if (a < 0) return; const x = cur; a = -1; cur = null;
      if (x.h * x.w === 1) {
        // un simple toucher : efface le rectangle touché, ou pose un 1×1
        const hit = rects.find(y => !y.lock && x.r >= y.r && x.r < y.r + y.h && x.c >= y.c && x.c < y.c + y.w);
        if (hit) { hist.push(rects.slice()); rects = rects.filter(y => y !== hit); Sound.tap(); LK.say(ui, ''); draw(); return; }
        if (!clueAt.has(x.r * N + x.c) || clues[clueAt.get(x.r * N + x.c)].a !== 1) { draw(); return; }
      }
      add(x);
    });
    ui.hint.addEventListener('click', () => {
      if (over) return;
      const miss = P.sol.map((s, j) => j).filter(j => !rects.some(y => y.r === P.sol[j].r && y.c === P.sol[j].c && y.h === P.sol[j].h && y.w === P.sol[j].w));
      if (!miss.length) return; const s = P.sol[miss[LK.rnd(R, miss.length)]];
      hist.push(rects.slice()); rects = rects.filter(y => !overlap(s, y)); rects.push({ r: s.r, c: s.c, h: s.h, w: s.w, lock: true });
      hints++; Sound.hint(); LK.say(ui, ''); finish();
    });
    ui.undo.addEventListener('click', () => { if (over || !hist.length) return; rects = hist.pop(); Sound.tap(); LK.say(ui, ''); draw(); });
    ui.clear.addEventListener('click', () => { if (over) return; hist.push(rects.slice()); rects = rects.filter(y => y.lock); Sound.tap(); LK.say(ui, ''); draw(); });
    draw();
  },
  stop() { if (MINIS.patches._up) window.removeEventListener('pointerup', MINIS.patches._up); },
};
