'use strict';
/* ═══════════ Bonbons et Uno ═══════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));
function shuf(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

Object.assign(GAME_INFO.candy, { rules: 'Échange deux bonbons voisins (glisse le doigt ou touche-les l’un après l’autre) pour en aligner au moins trois identiques. Quatre alignés font exploser toute la ligne, cinq font disparaître tous les bonbons de cette sorte. Atteins l’objectif de points avant la fin des coups.' });
Object.assign(GAME_INFO.uno, { rules: 'Pose une carte de la même couleur ou du même symbole que la carte du milieu, ou un joker. Si tu ne peux pas jouer, pioche. Les cartes ⊘ et ⇄ font sauter le tour de l’adversaire, +2 et +4 le font piocher. Quand il te reste deux cartes, touche « Uno ! » avant de jouer, sinon pénalité. Le premier qui n’a plus de cartes gagne.' });

/* ——— Bonbons ——— */
MINIS.candy = {
  start(api) {
    const N = 8, R = api.R, d = api.d, types = d < .45 ? 5 : 6;
    const EMO = ['🍬', '🍭', '🍩', '🍪', '🧁', '🍫'];
    const target = Math.round((1400 + d * 3600) / 100) * 100, maxMoves = 24 - Math.round(d * 3);
    let moves = maxMoves, score = 0, busy = false, sel = null, over = false;
    api.root.innerHTML = `<div class="cd-wrap">
      <div class="cd-side"><p class="cd-label">Objectif</p><p class="cd-big">${target}</p><div class="cd-bar"><i></i></div>
      <p class="cd-label">Score</p><p class="cd-big cd-score">0</p><p class="cd-label">Coups restants</p><p class="cd-big cd-moves">${moves}</p></div>
      <div class="cd-board"><div class="cd-combo"></div></div></div>`;
    const board = api.root.querySelector('.cd-board'), comboEl = api.root.querySelector('.cd-combo');
    const grid = Array.from({ length: N }, () => Array(N).fill(null));
    const make = (t, r, c) => { const el = document.createElement('div'); el.className = 'cd-cell'; el.textContent = EMO[t]; const o = { t, el }; el._o = o; board.appendChild(el); setPos(o, r, c); return o; };
    function setPos(o, r, c) { o.el.style.transform = `translate(${c * 100}%, ${r * 100}%)`; }
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      let t; do { t = Math.floor(R() * types); } while ((c >= 2 && grid[r][c - 1].t === t && grid[r][c - 2].t === t) || (r >= 2 && grid[r - 1][c].t === t && grid[r - 2][c].t === t));
      grid[r][c] = make(t, r, c);
    }
    const posOf = o => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] === o) return [r, c]; return null; };
    const runs = () => {
      const out = [];
      for (let r = 0; r < N; r++) { let c = 0; while (c < N) { let k = c; while (k + 1 < N && grid[r][k + 1].t === grid[r][c].t) k++; if (k - c >= 2) out.push({ cells: Array.from({ length: k - c + 1 }, (_, i) => [r, c + i]), h: true, t: grid[r][c].t }); c = k + 1; } }
      for (let c = 0; c < N; c++) { let r = 0; while (r < N) { let k = r; while (k + 1 < N && grid[k + 1][c].t === grid[r][c].t) k++; if (k - r >= 2) out.push({ cells: Array.from({ length: k - r + 1 }, (_, i) => [r + i, c]), h: false, t: grid[r][c].t }); r = k + 1; } }
      return out;
    };
    const swapCells = (a, b) => { const t = grid[a[0]][a[1]]; grid[a[0]][a[1]] = grid[b[0]][b[1]]; grid[b[0]][b[1]] = t; setPos(grid[a[0]][a[1]], a[0], a[1]); setPos(grid[b[0]][b[1]], b[0], b[1]); };
    const hasMoves = () => {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc; if (r2 >= N || c2 >= N) continue;
        const t = grid[r][c]; grid[r][c] = grid[r2][c2]; grid[r2][c2] = t; const ok = runs().length > 0; grid[r2][c2] = grid[r][c]; grid[r][c] = t;
        if (ok) return true;
      }
      return false;
    };
    const update = () => {
      api.root.querySelector('.cd-score').textContent = score; api.root.querySelector('.cd-moves').textContent = moves;
      api.root.querySelector('.cd-bar i').style.width = Math.min(100, score / target * 100) + '%';
      api.stat(`${score} / ${target}`);
    };
    async function resolve() {
      let combo = 0;
      for (;;) {
        const rs = runs(); if (!rs.length) break;
        combo++;
        const kill = new Set(), key = (r, c) => r * N + c;
        rs.forEach(run => {
          run.cells.forEach(([r, c]) => kill.add(key(r, c)));
          if (run.cells.length === 4) { const [r0, c0] = run.cells[0]; for (let i = 0; i < N; i++) kill.add(run.h ? key(r0, i) : key(i, c0)); }
          if (run.cells.length >= 5) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c].t === run.t) kill.add(key(r, c));
        });
        score += kill.size * 10 * combo;
        if (combo >= 4 && typeof Ach !== 'undefined') Ach.unlock('combo4');
        if (combo > 1) { comboEl.textContent = `Combo ×${combo}\u202f!`; comboEl.classList.remove('on'); void comboEl.offsetWidth; comboEl.classList.add('on'); }
        Sound.found();
        kill.forEach(k => grid[Math.floor(k / N)][k % N].el.classList.add('pop'));
        await sleep(230);
        kill.forEach(k => { const r = Math.floor(k / N), c = k % N; grid[r][c].el.remove(); grid[r][c] = null; });
        for (let c = 0; c < N; c++) {
          let w = N - 1;
          for (let r = N - 1; r >= 0; r--) if (grid[r][c]) { const o = grid[r][c]; grid[r][c] = null; grid[w][c] = o; setPos(o, w, c); w--; }
          for (let r = w, k = 1; r >= 0; r--, k++) { const o = make(Math.floor(R() * types), -k, c); grid[r][c] = o; void o.el.offsetWidth; setPos(o, r, c); }
        }
        update();
        await sleep(300);
      }
      if (!hasMoves()) {
        api.tip('Plus aucun coup possible : on mélange\u202f!');
        do { const all = grid.flat().map(o => o.t); shuf(all, R); let i = 0; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { grid[r][c].t = all[i++]; grid[r][c].el.textContent = EMO[grid[r][c].t]; } } while (runs().length || !hasMoves());
      }
    }
    async function trySwap(a, b) {
      if (busy || over || paused) return;
      busy = true; sel = null; board.querySelectorAll('.sel').forEach(e => e.classList.remove('sel'));
      swapCells(a, b); await sleep(200);
      if (!runs().length) { Sound.wrong(); swapCells(a, b); await sleep(200); busy = false; return; }
      moves--; update(); await resolve();
      busy = false;
      if (score >= target) { over = true; Sound.complete(); api.win(moves >= 8 ? 3 : moves >= 3 ? 2 : 1, [{ label: 'Score', value: score }, { label: 'Coups restants', value: moves }]); }
      else if (moves <= 0) { over = true; api.lose('Plus de coups', `Tu as fait ${score} points sur les ${target} demandés. Encore un essai\u202f?`); }
    }
    let start = null;
    board.addEventListener('pointerdown', e => {
      const el = e.target.closest('.cd-cell'); if (!el) return;
      board.setPointerCapture(e.pointerId); start = { o: el._o, x: e.clientX, y: e.clientY, moved: false };
    });
    board.addEventListener('pointermove', e => {
      if (!start || start.moved) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) < 22) return;
      start.moved = true;
      const p = posOf(start.o); if (!p) return;
      const q = Math.abs(dx) > Math.abs(dy) ? [p[0], p[1] + Math.sign(dx)] : [p[0] + Math.sign(dy), p[1]];
      if (q[0] >= 0 && q[0] < N && q[1] >= 0 && q[1] < N) trySwap(p, q);
    });
    board.addEventListener('pointerup', () => {
      if (!start) return; const s = start; start = null; if (s.moved) return;
      const p = posOf(s.o); if (!p) return;
      if (sel) {
        const q = posOf(sel);
        if (q && Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) === 1) { trySwap(q, p); return; }
        sel.el.classList.remove('sel');
      }
      sel = s.o; sel.el.classList.add('sel'); Sound.tap();
    });
    update();
  },
};

/* ——— Uno ——— */
MINIS.uno = {
  start(api) {
    const R = api.R, d = api.d, COLORS = ['r', 'y', 'g', 'b'], CN = { r: 'rouge', y: 'jaune', g: 'vert', b: 'bleu' };
    let deck = [];
    COLORS.forEach(c => { deck.push({ c, v: '0' }); for (let k = 0; k < 2; k++) { for (let n = 1; n <= 9; n++) deck.push({ c, v: String(n) }); ['skip', 'rev', '+2'].forEach(v => deck.push({ c, v })); } });
    for (let k = 0; k < 4; k++) { deck.push({ c: 'w', v: 'wild' }); deck.push({ c: 'w', v: '+4' }); }
    shuf(deck, R);
    const me = deck.splice(0, 7), ai = deck.splice(0, 7);
    let top; do { top = deck.shift(); if (!/^\d$/.test(top.v)) deck.push(top); } while (!/^\d$/.test(top.v));
    const discard = [top]; let color = top.c, turn = 'me', drew = false, saidUno = false, over = false;
    const LBL = { skip: '⊘', rev: '⇄', '+2': '+2', wild: '★', '+4': '+4' };
    const card = (k, extra) => `<div class="uc c-${k.c}${extra || ''}"><span class="uc-oval"></span><b>${LBL[k.v] || k.v}</b><i class="tl">${LBL[k.v] || k.v}</i><i class="br">${LBL[k.v] || k.v}</i></div>`;
    api.root.innerHTML = `<div class="uno">
      <div class="uno-ai"><div class="uno-ai-hand"></div><p class="uno-ai-name">Ordinateur <span class="uno-say"></span></p></div>
      <div class="uno-mid"><button class="uno-draw" aria-label="Piocher"><div class="uc back"></div><span>Piocher</span></button><div class="uno-pile"></div><div class="uno-color"></div></div>
      <div class="uno-bar"><button class="tool uno-btn" disabled>Uno\u202f!</button><p class="uno-msg"></p><button class="tool uno-pass" hidden>Passer</button></div>
      <div class="uno-hand"></div>
      <div class="uno-pick" hidden><p>Choisis une couleur</p><div>${COLORS.map(c => `<button class="uc-pick c-${c}" data-c="${c}" aria-label="${CN[c]}"></button>`).join('')}</div></div></div>`;
    const $r = s => api.root.querySelector(s);
    const draw = (hand, n) => { for (let i = 0; i < n; i++) { if (!deck.length) { const t = discard.pop(); deck = shuf(discard.splice(0), R); discard.push(t); } if (deck.length) hand.push(deck.shift()); } };
    const playable = k => k.c === 'w' || k.c === color || k.v === top.v;
    const sortHand = () => me.sort((a, b) => 'rygbw'.indexOf(a.c) - 'rygbw'.indexOf(b.c) || String(a.v).localeCompare(String(b.v)));
    const msg = t => { $r('.uno-msg').textContent = t; };
    const say = t => { const s = $r('.uno-say'); s.textContent = t; s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); };
    function render() {
      $r('.uno-ai-hand').innerHTML = ai.map(() => '<div class="uc back"></div>').join('');
      $r('.uno-ai-name').firstChild.textContent = `Ordinateur · ${ai.length} carte${ai.length > 1 ? 's' : ''} `;
      $r('.uno-pile').innerHTML = card(top);
      const ce = $r('.uno-color'); ce.className = 'uno-color c-' + color; ce.textContent = 'Couleur : ' + CN[color];
      sortHand();
      const h = $r('.uno-hand'); h.innerHTML = '';
      h.style.setProperty('--n', me.length);
      me.forEach((k, i) => { const w = document.createElement('div'); w.innerHTML = card(k, turn === 'me' && !over && playable(k) && (!drew || i === me.lastDrawn) ? ' ok' : ''); const el = w.firstChild; el._k = k; h.appendChild(el); });
      $r('.uno-btn').disabled = !(turn === 'me' && me.length === 2 && !saidUno);
      $r('.uno-pass').hidden = !(turn === 'me' && drew);
      $r('.uno-draw').disabled = turn !== 'me' || drew;
      api.stat(`${me.length} carte${me.length > 1 ? 's' : ''}`);
    }
    const effects = async (k, who) => {
      const other = who === 'me' ? ai : me, n = k.v === '+2' ? 2 : k.v === '+4' ? 4 : 0;
      if (n) { draw(other, n); msg(who === 'me' ? `L’ordinateur pioche ${n} cartes et passe son tour.` : `Tu pioches ${n} cartes et tu passes ton tour.`); return true; }
      if (k.v === 'skip' || k.v === 'rev') { msg(who === 'me' ? 'L’ordinateur passe son tour.' : 'Tu passes ton tour.'); return true; }
      return false;
    };
    const pickColor = () => new Promise(res => {
      const box = $r('.uno-pick'); box.hidden = false;
      box.onclick = e => { const b = e.target.closest('.uc-pick'); if (!b) return; box.hidden = true; res(b.dataset.c); };
    });
    async function play(k, who) {
      const hand = who === 'me' ? me : ai; hand.splice(hand.indexOf(k), 1);
      top = k; discard.push(k); Sound.tap();
      if (k.c === 'w') {
        if (who === 'me') { render(); color = await pickColor(); }
        else { const cnt = { r: 0, y: 0, g: 0, b: 0 }; ai.forEach(x => { if (x.c !== 'w') cnt[x.c]++; }); color = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; msg(`L’ordinateur choisit le ${CN[color]}.`); }
      } else color = k.c;
      if (who === 'me' && me.length === 1 && !saidUno) {
        if (Math.random() < .5 + d * .5) { say('Contre-Uno\u202f! +2'); draw(me, 2); msg('Tu as oublié de dire « Uno ! » : 2 cartes de pénalité.'); Sound.wrong(); }
      }
      if (who === 'ai' && ai.length === 1) say('Uno\u202f!');
      if (!hand.length) { over = true; render(); if (who === 'me') { Sound.complete(); api.win(ai.length >= 5 ? 3 : ai.length >= 3 ? 2 : 1, [{ label: 'Cartes de l’ordi', value: ai.length }]); } else api.lose('L’ordinateur a gagné', 'Il a posé sa dernière carte. Prends ta revanche\u202f!'); return 'end'; }
      return (await effects(k, who)) ? 'again' : 'next';
    }
    function aiChoose() {
      const opts = ai.filter(playable); if (!opts.length) return null;
      if (Math.random() < .5 * (1 - d)) return opts[Math.floor(Math.random() * opts.length)];
      const cnt = { r: 0, y: 0, g: 0, b: 0 }; ai.forEach(x => { if (x.c !== 'w') cnt[x.c]++; });
      const score = k => (me.length <= 2 && ['+2', '+4', 'skip', 'rev'].includes(k.v) ? 50 : 0) + (k.c === 'w' ? -30 : cnt[k.c] * 3) + (/^\d$/.test(k.v) ? +k.v * .2 : 2);
      return opts.sort((a, b) => score(b) - score(a))[0];
    }
    async function aiTurn() {
      turn = 'ai'; render();
      for (;;) {
        await sleep(800); if (over) return;
        while (paused) await sleep(200);
        let k = aiChoose();
        if (!k) { draw(ai, 1); msg('L’ordinateur pioche une carte.'); render(); await sleep(500); const last = ai[ai.length - 1]; if (playable(last)) k = last; }
        if (!k) break;
        const res = await play(k, 'ai'); render();
        if (res === 'end') return;
        if (res !== 'again') break;
        msg(msgText() + ' L’ordinateur rejoue.');
      }
      turn = 'me'; drew = false; saidUno = false; me.lastDrawn = -1; if (!$r('.uno-msg').textContent) msg('À toi de jouer\u202f!'); render();
    }
    const msgText = () => $r('.uno-msg').textContent;
    async function after(res) {
      render();
      if (res === 'end') return;
      if (res === 'again') { drew = false; saidUno = false; render(); return; }
      msg(''); await aiTurn();
    }
    $r('.uno-hand').addEventListener('click', async e => {
      const el = e.target.closest('.uc'); if (!el || turn !== 'me' || over || paused) return;
      const k = el._k, i = me.indexOf(k);
      if (!playable(k) || (drew && i !== me.lastDrawn)) { el.classList.add('shake'); Sound.wrong(); setTimeout(() => el.classList.remove('shake'), 400); return; }
      turn = 'busy'; msg(''); const res = await play(k, 'me'); turn = res === 'again' ? 'me' : 'busy'; await after(res);
    });
    $r('.uno-draw').addEventListener('click', () => {
      if (turn !== 'me' || drew || over) return;
      draw(me, 1); drew = true; const k = me[me.length - 1]; sortHand(); me.lastDrawn = me.indexOf(k); Sound.tap();
      if (playable(k)) msg('Tu peux jouer la carte piochée, ou passer.'); else msg('Pas de chance, tu passes ton tour.');
      render();
      if (!playable(k)) setTimeout(() => { if (turn === 'me') { turn = 'busy'; after('next'); } }, 900);
    });
    $r('.uno-pass').addEventListener('click', () => { if (turn === 'me' && drew) { turn = 'busy'; after('next'); } });
    $r('.uno-btn').addEventListener('click', () => { saidUno = true; Sound.found(); msg('Uno\u202f! Plus qu’une carte après celle-ci.'); render(); });
    msg('À toi de commencer\u202f!'); render();
  },
};
