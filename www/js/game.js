'use strict';
const RES = 1.6;             // résolution interne des scènes
const LEVELS = 100;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
// Objets jamais demandés : ils se confondraient avec le décor (livres des bibliothèques)
const NEVER_TARGET = new Set(['livre']);

/* ——— Sauvegarde ——— */
const Save = {
  key: 'papa-save-v1', d: null,
  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.key)); } catch (e) { this.d = null; }
    this.d = Object.assign({ pseudo: '', unlocked: 1, levels: {}, music: .6, sfx: .8 }, this.d || {});
    // Les niveaux s’ouvrent un par un : seul le niveau qui suit la dernière manche gagnée d’affilée est accessible
    let k = 0; while (k < LEVELS && this.d.levels[k + 1]) k++;
    delete this.d.testUnlock;
    this.d.unlocked = Math.min(LEVELS, k + 1);
    return this.d;
  },
  write() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { /* stockage indisponible */ } },
};
const totalStars = () => Object.values(Save.d.levels).reduce((s, l) => s + (l.stars || 0), 0);
const doneCount = () => Object.keys(Save.d.levels).length;
function nextLevel() {
  for (let n = 1; n <= Save.d.unlocked; n++) if (!Save.d.levels[n]) return n;
  return Math.min(Save.d.unlocked, LEVELS);
}
const fmt = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ——— Écrans ——— */
let current = '';
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  current = id;
  $('#backdrop').classList.toggle('dim', id === 's-game');
  if (id === 's-menu') refreshMenu();
  if (id === 's-levels') renderLevels();
  if (id === 's-settings') refreshSettings();
  if (id === 's-dex') renderDex();
  if (id !== 's-game') Sound.play('menu');
}
function paintBackdrop() {
  const n = nextLevel();
  const { bg, fg, S } = paintScene(n, .3);
  const c = bg.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(fg, 0, 0);
  gradingFor(n, S.lights).forEach(L => { c.globalCompositeOperation = L.op; c.globalAlpha = L.a; c.drawImage(L.cv, 0, 0, bg.width, bg.height); });
  const bd = $('#backdrop');
  bd.width = bg.width; bd.height = bg.height;
  bd.getContext('2d').drawImage(bg, 0, 0);
}

/* ——— Pseudo ——— */
function validPseudo(v) {
  v = v.trim();
  if (v.length < 2) return [null, 'Ton pseudo doit faire au moins 2 caractères.'];
  if (v.length > 16) return [null, 'Ton pseudo doit faire 16 caractères au maximum.'];
  return [v, ''];
}
$('#pseudo-ok').addEventListener('click', () => {
  Sound.init();
  const [v, err] = validPseudo($('#pseudo-in').value);
  $('#pseudo-err').textContent = err;
  if (!v) return;
  $('#pseudo-in').blur();
  Save.d.pseudo = v; Save.write(); Sound.tap(); show('s-menu');
});
$('#pseudo-in').addEventListener('keydown', e => { if (e.key === 'Enter') $('#pseudo-ok').click(); });
// Le champ remonte en haut de l'écran pour rester visible au-dessus du clavier
$('#pseudo-in').addEventListener('focus', () => { $('#s-pseudo').classList.add('typing'); setTimeout(() => window.scrollTo(0, 0), 50); });
$('#pseudo-in').addEventListener('blur', () => setTimeout(() => $('#s-pseudo').classList.remove('typing'), 150));
$('#set-pseudo').addEventListener('focus', e => setTimeout(() => e.target.scrollIntoView({ block: 'start', behavior: 'smooth' }), 300));

/* ——— Menu ——— */
function refreshMenu() {
  const h = new Date().getHours();
  $('#hello').textContent = (h >= 5 && h < 18 ? 'Bonjour, ' : 'Bonsoir, ') + Save.d.pseudo;
  const done = doneCount(), all = done >= LEVELS;
  $('#m-play-sub').textContent = all ? 'Toutes les scènes sont terminées' : 'Niveau ' + nextLevel();
  $('#m-progress').textContent = done === 0 ? 'Dix jeux et cent objets t’attendent.' : `${done} scène${done > 1 ? 's' : ''} sur 100 terminée${done > 1 ? 's' : ''}, ${totalStars()} étoiles gagnées.`;
}
$('#m-play').addEventListener('click', () => { Sound.tap(); doneCount() >= LEVELS ? show('s-levels') : startLevel(nextLevel()); });
$('#m-levels').addEventListener('click', () => { Sound.tap(); show('s-levels'); });
$('#m-settings').addEventListener('click', () => { Sound.tap(); show('s-settings'); });
$('#m-dex').addEventListener('click', () => { Sound.tap(); show('s-dex'); });
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { Sound.tap(); show('s-menu'); }));

/* ——— Liste des niveaux ——— */
const LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function renderLevels() {
  const box = $('#levels'); box.innerHTML = '';
  $('#lv-stars').textContent = '★ ' + totalStars() + '/300';
  const nx = nextLevel();
  for (let ch = 0; ch < 5; ch++) {
    const head = document.createElement('div'); head.className = 'chapter';
    head.innerHTML = `<h3>Chapitre ${ch + 1}</h3><span>Niveaux ${ch * 20 + 1} à ${ch * 20 + 20}</span>`;
    box.appendChild(head);
    const grid = document.createElement('div'); grid.className = 'grid'; box.appendChild(grid);
    for (let n = ch * 20 + 1; n <= ch * 20 + 20; n++) {
      const info = levelInfo(n), b = document.createElement('button'), rec = Save.d.levels[n];
      b.className = 'tile' + (n === nx && !rec ? ' next' : '');
      b.style.background = `linear-gradient(150deg, ${info.theme.sw[1]}, ${info.theme.sw[0]})`;
      b.setAttribute('aria-label', `Niveau ${n}, ${info.theme.name}`);
      if (n > Save.d.unlocked) { b.disabled = true; b.innerHTML = `<span class="num">${n}</span>${LOCK}`; }
      else {
        const s = rec ? rec.stars : 0;
        const gid = gameFor(n), ico = typeof GAME_ICON !== 'undefined' ? GAME_ICON[gid] || '' : '';
        if (rec) b.classList.add('done');
        b.innerHTML = `<span class="gi">${ico}</span><span class="num">${n}</span><span class="gm">${GAME_INFO[gid].name}</span><span class="st">${'★'.repeat(s)}<i>${'★'.repeat(3 - s)}</i></span>`;
        b.addEventListener('click', () => { Sound.tap(); startLevel(n); });
      }
      grid.appendChild(b);
    }
  }
  requestAnimationFrame(() => { const t = box.querySelector('.tile.next'); if (t) t.scrollIntoView({ block: 'center' }); });
}

/* ——— Réglages ——— */
let resetArmed = false;
function refreshSettings() {
  $('#set-pseudo').value = Save.d.pseudo;
  $('#set-music').value = Math.round(Save.d.music * 100);
  $('#set-sfx').value = Math.round(Save.d.sfx * 100);
  $('#set-err').textContent = '';
  resetArmed = false; $('#set-reset').textContent = 'Effacer la progression';
}
$('#set-pseudo-ok').addEventListener('click', () => {
  const [v, err] = validPseudo($('#set-pseudo').value);
  $('#set-err').style.color = err ? '' : 'var(--muted)';
  $('#set-err').textContent = err || 'Pseudo enregistré.';
  if (v) { Save.d.pseudo = v; Save.write(); Sound.tap(); $('#set-pseudo').blur(); }
});
['music', 'sfx'].forEach(k => $('#set-' + k).addEventListener('input', e => {
  Save.d[k] = e.target.value / 100; Save.write(); Sound.setVolumes(Save.d.music, Save.d.sfx);
}));
$('#set-reset').addEventListener('click', () => {
  if (!resetArmed) { resetArmed = true; $('#set-reset').textContent = 'Toucher encore pour confirmer'; return; }
  Save.d.levels = {}; Save.d.unlocked = 1; Save.write();
  resetArmed = false; $('#set-reset').textContent = 'Progression effacée';
  paintBackdrop();
});

/* ——— Construction d'un niveau ——— */
function shuffle(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Couleur moyenne du décor sous un objet : sert à le fondre dans la scène
// Les pixels sont lus une seule fois par niveau (lecture rapide sur tablette)
function snapshot(cv) { return { w: cv.width, h: cv.height, d: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data }; }
function px(snap, x, y) {
  const ix = Math.max(0, Math.min(snap.w - 1, Math.round(x * RES))), iy = Math.max(0, Math.min(snap.h - 1, Math.round(y * RES)));
  return (iy * snap.w + ix) * 4;
}
function sampleColor(snap, x, y, r) {
  let rr = 0, gg = 0, bb = 0, n = 0;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const k = px(snap, x + i * r * .4, y + j * r * .4); rr += snap.d[k]; gg += snap.d[k + 1]; bb += snap.d[k + 2]; n++; }
  return `rgb(${Math.round(rr / n)},${Math.round(gg / n)},${Math.round(bb / n)})`;
}
function fgCover(snap, x, y, r) {
  let a = 0;
  [[0, 0], [-.3, 0], [.3, 0], [0, -.3], [0, .3]].forEach(([dx, dy]) => { a += snap.d[px(snap, x + dx * r * 2, y + dy * r * 2) + 3]; });
  return a / 5 / 255;
}
// Cache partiellement un objet (feuilles, tissu, papier ou livres posés devant)
function occlude(f, R, x, y, sz) {
  const a = rnd(R, 0, TAU), ox = x + Math.cos(a) * sz * .48, oy = y + Math.abs(Math.sin(a)) * sz * .3 + sz * .1;
  const kind = Math.floor(R() * 4);
  f.save();
  if (kind === 0) { for (let i = 0; i < 6; i++) { const g = pick(R, GREENS); leaf(f, ox + rnd(R, -sz * .2, sz * .2), oy + rnd(R, -sz * .2, sz * .2), sz * rnd(R, .3, .5), a + Math.PI + rnd(R, -.8, .8), g[0], g[1]); } }
  else if (kind === 1) { const col = pick(R, ['#8a2a2a', '#2a4a6a', '#c8b89a', '#4a6a3a', '#6a4a7a']); f.fillStyle = LG(f, ox - sz * .4, 0, ox + sz * .4, 0, [shade(col, .5), col, shade(col, 1.2), shade(col, .6)]); f.beginPath(); f.moveTo(ox - sz * .45, oy - sz * .2); f.quadraticCurveTo(ox, oy - sz * .4, ox + sz * .45, oy - sz * .15); f.quadraticCurveTo(ox + sz * .5, oy + sz * .3, ox + sz * .3, oy + sz * .45); f.lineTo(ox - sz * .35, oy + sz * .45); f.quadraticCurveTo(ox - sz * .55, oy + sz * .1, ox - sz * .45, oy - sz * .2); f.fill(); }
  else if (kind === 2) { f.translate(ox, oy); f.rotate(rnd(R, -.6, .6)); f.fillStyle = LG(f, 0, -sz * .3, 0, sz * .3, ['#f4ecd8', '#d8ccb0']); f.fillRect(-sz * .3, -sz * .25, sz * .6, sz * .5); f.fillStyle = 'rgba(60,40,20,.35)'; for (let k = 0; k < 4; k++) f.fillRect(-sz * .22, -sz * .15 + k * sz * .09, sz * .4, sz * .025); }
  else { let yy = y + sz * .5; for (let k = 0; k < 3; k++) { const col = pick(R, MUTED), bw = sz * rnd(R, .5, .7), bh = sz * .13, bx = x + (R() - .5) * sz * .3 - bw / 2 + Math.cos(a) * sz * .2; f.fillStyle = '#e8dcc0'; f.fillRect(bx + 2, yy - bh, bw - 4, bh); f.fillStyle = LG(f, 0, yy - bh, 0, yy, [shade(col, 1.2), col, shade(col, .6)]); f.fillRect(bx, yy - bh, bw * .08, bh); f.fillRect(bx, yy - bh, bw, bh * .2); f.fillRect(bx, yy - bh * .2, bw, bh * .2); yy -= bh; } }
  f.restore();
}

function buildLevel(n) {
  const info = levelInfo(n), d = (n - 1) / (LEVELS - 1), R = mulberry32(n * 104729 + 7);
  const count = 18 + Math.min(6, Math.floor(d * 7));            // 18 à 24 objets
  const pool = shuffle(OBJECTS.slice(), R);
  const tdefs = pool.filter(o => !NEVER_TARGET.has(o.id)).slice(0, count);
  const tids = new Set(tdefs.map(o => o.id));
  const ddefs = pool.filter(o => !tids.has(o.id));
  const { bg, fg, S } = paintScene(n, RES, tids);
  const bc = bg.getContext('2d'), fc = fg.getContext('2d');
  bc.setTransform(RES, 0, 0, RES, 0, 0); fc.setTransform(RES, 0, 0, RES, 0, 0);
  const bgSnap = snapshot(bg), fgSnap = snapshot(fg);
  const placed = [];
  const surfW = S.surf.map(s => Math.max(0, s.x1 - s.x0) * (s.kind === 'step' || s.kind === 'rail' ? .3 : 1)), totW = surfW.reduce((a, b) => a + b, 0);
  const spot = base => {
    const r = R();
    if ((r < .78 || !S.floors.length) && totW > 0) {
      let k = R() * totW, i = 0; while (k > surfW[i] && i < surfW.length - 1) { k -= surfW[i]; i++; }
      const s = S.surf[i], sz = base * s.sc;
      if (s.x1 - s.x0 < sz) return null;
      return { x: rnd(R, s.x0 + sz / 2, s.x1 - sz / 2), y: s.y - sz * .42, sz, upright: true };
    }
    const z = pick(R, S.floors), y = rnd(R, z.y0, z.y1), sz = base * (.85 + (y - FLOOR) / (H - FLOOR) * .4);
    return { x: rnd(R, z.x0 + sz / 2, z.x1 - sz / 2), y, sz, upright: false };
  };
  const findSpot = (base, isTarget, relax) => {
    for (let k = 0; k < 90; k++) {
      const p = spot(base);
      if (!p || p.x < p.sz / 2 || p.x > W - p.sz / 2 || p.y < p.sz / 2 || p.y > H - p.sz / 2) continue;
      const ok = placed.every(q => {
        const dd = Math.hypot(q.x - p.x, q.y - p.y);
        const f = relax ? .5 : 1;
        if (isTarget || q.target) return dd > (q.sz + p.sz) * (isTarget && q.target ? .55 : .48) * f;
        return dd > (q.sz + p.sz) * .28 * f;
      });
      if (!ok) continue;
      if (fgCover(fgSnap, p.x, p.y, p.sz / 2) > .45) continue;
      return p;
    }
    return null;
  };
  // Leurres : objets absents de la liste, mêlés au décor
  const nd = Math.round(lerp(40, 110, d));
  for (let i = 0; i < nd; i++) {
    const o = ddefs[i % ddefs.length], p = findSpot(lerp(60, 38, d) * rnd(R, .8, 1.25), false);
    if (!p) continue;
    p.target = false; placed.push(p);
    const rot = (R() - .5) * (p.upright ? lerp(.4, 1, d) : lerp(1.5, 3, d));
    const b = bakePlaced(o, p.sz, rot, sampleColor(bgSnap, p.x, p.y, p.sz / 2), lerp(.18, .42, d), RES, R() < .3);
    bc.drawImage(b.cv, p.x - b.ext / 2, p.y - b.ext / 2, b.ext, b.ext);
    if (R() < lerp(.05, .3, d)) occlude(bc, R, p.x, p.y, p.sz);
  }
  // Objets à trouver
  const targets = [];
  tdefs.forEach(o => {
    const base = lerp(66, 36, d) * rnd(R, .85, 1.2);
    let p = findSpot(base, true) || findSpot(base, true, true);
    if (!p) { const sz = lerp(66, 36, d); p = { x: rnd(R, sz, W - sz), y: rnd(R, sz, H - sz), sz, upright: true }; }
    p.target = true; placed.push(p);
    const rot = (R() - .5) * (p.upright ? lerp(.3, .9, d) : lerp(1, 3, d));
    const b = bakePlaced(o, p.sz, rot, sampleColor(bgSnap, p.x, p.y, p.sz / 2), lerp(.15, .42, d) * rnd(R, .8, 1.2), RES, o.id !== 'carte' && R() < .3);
    targets.push({ obj: o, x: p.x, y: p.y, size: p.sz, spr: b.cv, ext: b.ext, found: false, el: null });
  });
  // Certains objets sont partiellement cachés par un élément de premier plan
  targets.forEach(t => { if (R() < lerp(.12, .5, d)) occlude(fc, R, t.x, t.y, t.size); });
  const grading = gradingFor(n, S.lights);
  return { n, info, bg, fg, targets, grading, miss: 0, hints: 3, hintsUsed: 0, elapsed: 0, done: false, recentMiss: [] };
}

/* ——— Vue : zoom et déplacement ——— */
const cv = $('#cv'), ctx = cv.getContext('2d'), stage = $('#stage');
const view = { s: 1, fit: 1, zoom: 1, ox: 0, oy: 0, cw: 1, ch: 1, dpr: 1 };
let game = null, dirty = true, paused = false;
const effects = [];
let hint = null;

function resize() {
  const r = stage.getBoundingClientRect();
  if (!r.width || !r.height) return;
  view.cw = r.width; view.ch = r.height; view.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(r.width * view.dpr); cv.height = Math.round(r.height * view.dpr);
  const contain = Math.min(view.cw / W, view.ch / H), cover = Math.max(view.cw / W, view.ch / H);
  view.fit = Math.min(cover, contain * 1.08);
  view.s = view.fit * view.zoom; clampView(); dirty = true;
}
function clampView() {
  const sw = W * view.s, sh = H * view.s;
  view.ox = sw <= view.cw ? (view.cw - sw) / 2 : clamp(view.ox, view.cw - sw, 0);
  view.oy = sh <= view.ch ? (view.ch - sh) / 2 : clamp(view.oy, view.ch - sh, 0);
  updateZoomButtons();
}
function updateZoomButtons() {
  $('#g-zout').disabled = view.zoom <= 1.01; $('#g-fit').disabled = view.zoom <= 1.01; $('#g-zin').disabled = view.zoom >= 3.99;
}
function setZoom(z, px, py) {
  z = clamp(z, 1, 4);
  const wx = (px - view.ox) / view.s, wy = (py - view.oy) / view.s;
  view.zoom = z; view.s = view.fit * z;
  view.ox = px - wx * view.s; view.oy = py - wy * view.s;
  clampView(); dirty = true;
}
// Zoom animé pour les boutons
let zoomAnim = null;
function animateZoom(z) {
  z = clamp(z, 1, 4);
  zoomAnim = { from: view.zoom, to: z, t0: performance.now() };
}
function fitView() { view.zoom = 1; view.s = view.fit; clampView(); dirty = true; }
window.addEventListener('resize', () => { if (game) resize(); });
$('#g-zin').addEventListener('click', () => { Sound.tap(); animateZoom(view.zoom * 1.6); });
$('#g-zout').addEventListener('click', () => { Sound.tap(); animateZoom(view.zoom / 1.6); });
$('#g-fit').addEventListener('click', () => { Sound.tap(); animateZoom(1); });

/* ——— Gestes ——— */
const ptrs = new Map();
let gesture = null;
const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  const p = local(e); ptrs.set(e.pointerId, p); zoomAnim = null;
  if (ptrs.size === 1) gesture = { type: 'tap', sx: p.x, sy: p.y, t: performance.now(), lx: p.x, ly: p.y };
  else if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    gesture = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: view.zoom, wx: (mx - view.ox) / view.s, wy: (my - view.oy) / view.s };
  }
});
cv.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId) || !gesture) return;
  const p = local(e); ptrs.set(e.pointerId, p);
  if (gesture.type === 'pinch' && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dd = Math.hypot(a.x - b.x, a.y - b.y);
    view.zoom = clamp(gesture.z0 * dd / gesture.d0, 1, 4); view.s = view.fit * view.zoom;
    view.ox = mx - gesture.wx * view.s; view.oy = my - gesture.wy * view.s; clampView(); dirty = true;
  } else if (gesture.type === 'tap' || gesture.type === 'pan') {
    if (gesture.type === 'tap' && Math.hypot(p.x - gesture.sx, p.y - gesture.sy) > 10) gesture.type = 'pan';
    if (gesture.type === 'pan') { view.ox += p.x - gesture.lx; view.oy += p.y - gesture.ly; clampView(); dirty = true; }
    gesture.lx = p.x; gesture.ly = p.y;
  }
});
function endPtr(e) {
  if (!ptrs.has(e.pointerId)) return;
  const p = local(e); ptrs.delete(e.pointerId);
  if (gesture && gesture.type === 'tap' && e.type === 'pointerup' && performance.now() - gesture.t < 600) onTap(p.x, p.y);
  if (ptrs.size === 0) gesture = null;
  else if (gesture && gesture.type === 'pinch') { const q = [...ptrs.values()][0]; gesture = { type: 'pan', lx: q.x, ly: q.y }; }
}
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); setZoom(view.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), p.x, p.y); }, { passive: false });

/* ——— Messages ——— */
let tipTimer = 0;
function tip(text, warn, ms) {
  const el = $('#g-tip'); el.textContent = text; el.classList.toggle('warn', !!warn); el.classList.add('on');
  clearTimeout(tipTimer); tipTimer = setTimeout(() => el.classList.remove('on'), ms || 3200);
}

/* ——— Toucher un objet ——— */
function onTap(px, py) {
  if (!game || game.done || paused) return;
  const wx = (px - view.ox) / view.s, wy = (py - view.oy) / view.s;
  if (wx < 0 || wy < 0 || wx > W || wy > H) return;
  let best = null, bd = Infinity;
  for (const t of game.targets) {
    if (t.found) continue;
    const dd = Math.hypot(t.x - wx, t.y - wy), tol = t.size * .5 + 10 / view.s;
    if (dd < tol && dd < bd) { best = t; bd = dd; }
  }
  if (best) foundTarget(best); else missAt(wx, wy);
}
function foundTarget(t) {
  t.found = true;
  const sparks = Array.from({ length: 16 }, (_, i) => ({ a: i * TAU / 16 + Math.random() * .3, v: .6 + Math.random() * .8, r: .5 + Math.random() * .7 }));
  effects.push({ type: 'found', t0: performance.now(), t, sparks });
  if (hint && hint.t === t) clearHint();
  Sound.found();
  try { navigator.vibrate && navigator.vibrate(18); } catch (e) { /* ignoré */ }
  t.el.classList.add('found', 'flash');
  t.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  updateCount();
  if (game.targets.every(x => x.found)) { game.done = true; setTimeout(levelComplete, 1300); }
  dirty = true;
}
function missAt(x, y) {
  game.miss++;
  effects.push({ type: 'miss', t0: performance.now(), x, y });
  Sound.wrong();
  const now = performance.now();
  game.recentMiss = game.recentMiss.filter(t => now - t < 2500).concat(now);
  if (game.recentMiss.length >= 4) tip('Prends ton temps : chaque erreur compte.', true);
  dirty = true;
}
function updateCount() {
  const f = game.targets.filter(t => t.found).length;
  $('#g-count').textContent = f + '/' + game.targets.length;
}

/* ——— Indices ——— */
function useHint() {
  if (!game || game.done || paused || game.hints <= 0 || hint) return;
  const left = game.targets.filter(t => !t.found);
  if (!left.length) return;
  const t = left[Math.floor(Math.random() * left.length)];
  game.hints--; game.hintsUsed++;
  $('#g-hints').textContent = game.hints; $('#g-hint').disabled = game.hints <= 0;
  hint = { t, until: performance.now() + 3800 };
  t.el.classList.add('hinted'); t.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (view.zoom > 1) { view.ox = view.cw / 2 - t.x * view.s; view.oy = view.ch / 2 - t.y * view.s; clampView(); }
  Sound.hint(); dirty = true;
}
function clearHint() { if (hint && hint.t.el) hint.t.el.classList.remove('hinted'); hint = null; dirty = true; }
$('#g-hint').addEventListener('click', useHint);

/* ——— Rendu ——— */
function draw(now) {
  const c = ctx, k = view.dpr;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#0d161a'; c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(k * view.s, 0, 0, k * view.s, k * view.ox, k * view.oy);
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(game.bg, 0, 0, W, H);
  for (const t of game.targets) if (!t.found) c.drawImage(t.spr, t.x - t.ext / 2, t.y - t.ext / 2, t.ext, t.ext);
  c.drawImage(game.fg, 0, 0, W, H);
  c.save();
  c.beginPath(); c.rect(0, 0, W, H); c.clip();
  for (const L of game.grading) { c.globalCompositeOperation = L.op; c.globalAlpha = L.a; c.drawImage(L.cv, 0, 0, W, H); }
  c.restore();

  if (hint) {
    if (now > hint.until) clearHint();
    else {
      const t = hint.t, p = (now % 1200) / 1200, r = t.size * (.9 + .12 * Math.sin(p * TAU)) * 1.7;
      c.save();
      c.fillStyle = 'rgba(5,10,14,.55)';
      c.beginPath(); c.rect(0, 0, W, H); c.arc(t.x, t.y, r, 0, TAU, true); c.fill();
      c.strokeStyle = 'rgba(243,217,154,.9)'; c.lineWidth = 2.5 / view.s; c.setLineDash([10 / view.s, 8 / view.s]);
      c.lineDashOffset = -p * 36 / view.s; circ(c, t.x, t.y, r); c.stroke();
      c.restore();
    }
  }

  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    if (e.type === 'found') {
      const p = (now - e.t0) / 1150;
      if (p >= 1) { effects.splice(i, 1); continue; }
      const t = e.t, ease = 1 - Math.pow(1 - p, 3);
      c.save();
      c.globalCompositeOperation = 'screen';
      const hr = t.size * (.8 + ease * 1.1);
      c.globalAlpha = (1 - p) * .9;
      c.fillStyle = RG(c, t.x, t.y, 0, t.x, t.y, hr, ['rgba(255,240,190,1)', 'rgba(243,200,110,.45)', 'rgba(243,200,110,0)']);
      circ(c, t.x, t.y, hr); c.fill();
      c.restore();
      const sc = 1 + ease * .6, ex = t.ext * sc, dy = ease * t.size * .3;
      c.save();
      c.globalAlpha = Math.max(0, 1 - p * p);
      c.shadowColor = 'rgba(255,215,130,1)'; c.shadowBlur = 28 * k;
      c.drawImage(t.spr, t.x - ex / 2, t.y - ex / 2 - dy, ex, ex);
      c.shadowBlur = 0; c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55 * (1 - p);
      c.drawImage(t.spr, t.x - ex / 2, t.y - ex / 2 - dy, ex, ex);
      c.restore();
      c.save();
      c.strokeStyle = `rgba(243,217,154,${1 - p})`; c.lineWidth = 3 / view.s;
      circ(c, t.x, t.y, t.size * (.5 + ease * 1.1)); c.stroke();
      c.fillStyle = `rgba(255,236,180,${1 - p})`;
      for (const s of e.sparks) {
        const dd = t.size * (.4 + ease * s.v * 1.4), x = t.x + Math.cos(s.a) * dd, y = t.y + Math.sin(s.a) * dd, z = t.size * .08 * s.r * (1 - p);
        c.beginPath(); c.moveTo(x, y - z * 2); c.lineTo(x + z * .5, y - z * .5); c.lineTo(x + z * 2, y); c.lineTo(x + z * .5, y + z * .5);
        c.lineTo(x, y + z * 2); c.lineTo(x - z * .5, y + z * .5); c.lineTo(x - z * 2, y); c.lineTo(x - z * .5, y - z * .5); c.closePath(); c.fill();
      }
      c.restore();
    } else if (e.type === 'miss') {
      const p = (now - e.t0) / 450;
      if (p >= 1) { effects.splice(i, 1); continue; }
      const r = (14 + p * 18) / view.s;
      c.save(); c.strokeStyle = `rgba(224,122,107,${1 - p})`; c.lineWidth = 2.5 / view.s;
      circ(c, e.x, e.y, r); c.stroke();
      const q = 6 / view.s; c.beginPath(); c.moveTo(e.x - q, e.y - q); c.lineTo(e.x + q, e.y + q); c.moveTo(e.x + q, e.y - q); c.lineTo(e.x - q, e.y + q); c.stroke();
      c.restore();
    }
  }
}
function loop(now) {
  requestAnimationFrame(loop);
  if (!game || current !== 's-game') return;
  if (zoomAnim) {
    const p = Math.min(1, (now - zoomAnim.t0) / 260), e = 1 - Math.pow(1 - p, 3);
    setZoom(lerp(zoomAnim.from, zoomAnim.to, e), view.cw / 2, view.ch / 2);
    if (p >= 1) zoomAnim = null;
  }
  if (!dirty && !effects.length && !hint) return;
  dirty = false; draw(now);
}
requestAnimationFrame(loop);

/* ——— Chrono ——— */
let lastTick = performance.now();
setInterval(() => {
  const now = performance.now(), dt = (now - lastTick) / 1000; lastTick = now;
  if (game && !game.done && !paused && current === 's-game' && !document.hidden) {
    game.elapsed += dt; $('#g-time').textContent = fmt(game.elapsed);
  }
}, 250);

/* ——— Déroulé d'un niveau ——— */
let curLevel = 1, adSeenLevel = 0;
function startLevel(n) {
  Sound.init();
  closeModals(); paused = false; effects.length = 0; hint = null; zoomAnim = null;
  game = null; curLevel = n; adSeenLevel = 0;
  MiniHost.stop();
  if (gameFor(n) !== 'objets') { MiniHost.start(n); return; }
  show('s-game');
  maybeShowRules('objets');
  $('#loading').classList.add('on');
  const info = levelInfo(n);
  $('#g-level').textContent = 'Niveau ' + n;
  $('#g-theme').textContent = info.theme.name + ', ' + info.amb.name.toLowerCase();
  $('#g-time').textContent = '0:00'; $('#words').innerHTML = '';
  Sound.play(info.theme.mood);
  setTimeout(() => {
    game = buildLevel(n);
    const ul = $('#words');
    [...game.targets].sort((a, b) => a.obj.name.localeCompare(b.obj.name, 'fr')).forEach(t => {
      const li = document.createElement('li'); li.className = 'word'; li.textContent = t.obj.name; t.el = li; ul.appendChild(li);
    });
    $('#g-hints').textContent = game.hints; $('#g-hint').disabled = false;
    updateCount();
    view.zoom = 1; resize(); fitView();
    $('#loading').classList.remove('on');
    lastTick = performance.now();
    if (n <= 3) tip('Pince l’écran ou touche les loupes pour zoomer.', false, 4500);
  }, 40);
}

function levelComplete() {
  if (!game) return;
  const g = game;
  const stars = (g.hintsUsed === 0 && g.miss <= 3) ? 3 : (g.hintsUsed <= 1 && g.miss <= 8) ? 2 : 1;
  showVictory({ n: g.n, game: 'objets', stars, sub: g.info.theme.name, stats: [{ label: 'Temps', value: fmt(g.elapsed) }, { label: 'Erreurs', value: g.miss }, { label: 'Indices', value: g.hintsUsed }] });
}
// Écran de victoire commun à tous les jeux : étoiles, danse, récompense du Sac de papa
function showVictory({ n, game: gid, stars, sub, stats }) {
  const prev = Save.d.levels[n], first = !prev;
  Save.d.levels[n] = { stars: Math.max(stars, prev ? prev.stars : 0) };
  Save.d.unlocked = Math.max(Save.d.unlocked, Math.min(LEVELS, n + 1));
  Save.write();
  Sound.complete();
  $('#d-stars').innerHTML = [0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${.15 + i * .18}s">★</span>`).join('');
  $('#done-title').textContent = GAME_INFO[gid].win;
  $('#d-sub').textContent = sub || GAME_INFO[gid].name;
  $('#d-stats').innerHTML = stats.slice(0, 3).map(s => `<div><dt>${s.label}</dt><dd>${s.value}</dd></div>`).join('');
  // récompense : un nouvel objet à la première victoire du niveau
  const dx = dexInit(), rw = $('#d-reward');
  let a = dx.byLevel[n];
  if (first || a === undefined) { a = drawAnimal(); if (a >= 0) { dx.byLevel[n] = a; Save.write(); } }
  if (a >= 0 && a !== undefined) {
    rw.innerHTML = `<p class="rw-title">${first ? 'Nouvel objet pour le Sac de papa\u202f!' : 'Objet gagné dans ce niveau'}</p>` + animalCard(a, true);
    rw.className = 'reward' + (first ? ' new' : '') + (dx.tier[a] === 3 ? ' shiny' : '');
  } else rw.innerHTML = '';
  const poup = $('#d-poup'); poup.style.animation = 'none'; void poup.offsetWidth; poup.style.animation = '';
  const conf = $('#d-confetti'); conf.innerHTML = '';
  const cols = ['#f3d99a', '#d6ad60', '#e07a6b', '#8fc1c9', '#ede6d8', '#9ad87a'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length];
    p.style.animationDuration = (2.2 + Math.random() * 2.2) + 's'; p.style.animationDelay = (Math.random() * 1.2) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    conf.appendChild(p);
  }
  $('#d-next').style.display = n < LEVELS ? '' : 'none';
  $('#m-done').classList.add('on');
  if (first && a >= 0) showReveal(a);
}
// Grande animation : l’objet gagné sort de son œuf
function showReveal(a, bonus) {
  const sup = bonus === 'super', el = $('#reveal'), t = sup ? 3 : bonus ? 2 : Save.d.dex.tier[a], pop = [900, 1300, 1900, 2600][t];
  el.dataset.tier = t; el.classList.toggle('bonus', bonus === true); el.classList.toggle('super', sup);
  $('#rv-card').innerHTML = sup ? superCardHTML(a) : bonus ? bonusCard(a) : animalCard(a);
  $('#rv-title').textContent = sup ? 'Carte Super Shiny débloquée\u202f!' : bonus ? 'Objet exclusif du défi\u202f!' : t === 3 ? 'Incroyable, un Shiny\u202f!' : t === 2 ? 'Waouh, un objet très rare\u202f!' : t === 1 ? 'Un objet rare\u202f!' : 'Nouvel objet\u202f!';
  $('#rv-tier').textContent = sup ? '✦ Super Shiny ✦' : bonus ? '♦ Bonus défi ♦' : t === 3 ? '✦ Shiny ✦' : TIERS[t].name;
  // étincelles : plus nombreuses et en plusieurs vagues pour les raretés
  const sp = $('#rv-sparks'); sp.innerHTML = '';
  const count = [20, 34, 56, 90][t], waves = [1, 1, 2, 3][t], rainbow = ['#ff8a8a', '#ffd36a', '#9ad87a', '#6ac0f0', '#c08af0', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    s.style.setProperty('--a', Math.random() * 360 + 'deg'); s.style.setProperty('--d', -(120 + Math.random() * (200 + 120 * t)) + 'px');
    s.style.setProperty('--dl', (Math.floor(Math.random() * waves) * .45 + Math.random() * .3) + 's');
    s.style.setProperty('--sz', (8 + Math.random() * (6 + 4 * t)) + 'px');
    if (t === 3) s.style.setProperty('--sc', rainbow[i % rainbow.length]);
    sp.appendChild(s);
  }
  // pluie d’étoiles pour les très rares et les Shiny
  const rain = $('#rv-rain'); rain.innerHTML = '';
  if (t >= 2) for (let i = 0; i < (t === 3 ? 46 : 18); i++) {
    const s = document.createElement('i'); s.textContent = '✦';
    s.style.left = Math.random() * 100 + '%'; s.style.setProperty('--sz', (12 + Math.random() * 20) + 'px');
    s.style.setProperty('--du', (2.5 + Math.random() * 2.5) + 's'); s.style.setProperty('--dl', Math.random() * 2.5 + 's');
    s.style.setProperty('--sc', t === 3 ? rainbow[i % rainbow.length] : bonus ? '#ff9a9a' : '#d8b8ff'); rain.appendChild(s);
  }
  // l’objet apparaît en relief, flotte en tournant doucement, puis va se poser sur sa carte
  const idle = sup ? 0 : [1300, 1600, 2000, 2600][t], emoji = sup ? '' : bonus ? BONUS[a][0] : ANIMALS[a][0];
  el.style.setProperty('--idle', idle / 1000 + 's');
  const fig = $('#rv-fig'); fig.className = 'rv-fig'; fig.style.removeProperty('--tx'); fig.style.removeProperty('--ty'); fig.style.removeProperty('--ts');
  fig.style.setProperty('--hue', (!bonus && t === 3 ? Save.d.dex.hue[a] : 0) + 'deg'); fig.classList.toggle('shiny', !bonus && t === 3);
  fig.querySelector('.rv-fig-in').innerHTML = Array.from({ length: 12 }, (_, k) => `<span style="transform:translateZ(${-k * 1.6}px)${k ? `;filter:brightness(${(.62 - k * .02).toFixed(2)})` : ''}">${emoji}</span>`).join('');
  $('#rv-card').classList.remove('landed');
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  el.dataset.ready = '0'; setTimeout(() => { el.dataset.ready = '1'; }, pop + idle + 900);
  setTimeout(() => {
    if (!el.classList.contains('on') || sup) return;
    const target = $('#rv-card .aemo'); if (!target) return;
    const ra = target.getBoundingClientRect(), rb = fig.getBoundingClientRect();
    fig.style.setProperty('--tx', (ra.left + ra.width / 2 - rb.left - rb.width / 2) + 'px');
    fig.style.setProperty('--ty', (ra.top + ra.height / 2 - rb.top - rb.height / 2) + 'px');
    fig.style.setProperty('--ts', Math.max(.2, ra.height / rb.height * 1.15).toFixed(3));
    fig.classList.add('fly'); Sound.tap();
    setTimeout(() => { $('#rv-card').classList.add('landed'); fig.classList.add('gone'); Sound.found(); }, 680);
  }, pop + idle);
  if (t >= 1) Sound.riser(pop / 1000, t / 3);
  setTimeout(() => {
    if (t >= 1) Sound.boom(t / 3);
    if (t === 3) { Sound.jingle(); setTimeout(() => Sound.complete(), 700); }
    else if (t === 2) Sound.complete(); else Sound.found();
    try { if (t >= 2 && navigator.vibrate) navigator.vibrate(t === 3 ? [60, 40, 120, 40, 200] : [60, 40, 100]); } catch (e) { /* ignoré */ }
  }, pop);
}
function closeReveal() { const el = $('#reveal'); if (el.dataset.ready !== '1') return; el.classList.remove('on'); if (typeof afterReveal === 'function') afterReveal(); }
$('#rv-ok').addEventListener('click', e => { e.stopPropagation(); Sound.tap(); closeReveal(); });
$('#reveal').addEventListener('click', () => closeReveal());
$('#d-next').addEventListener('click', () => { Sound.tap(); afterWin(() => startLevel(curLevel + 1)); });
$('#d-replay').addEventListener('click', () => { Sound.tap(); afterWin(() => startLevel(curLevel)); });
$('#d-levels').addEventListener('click', () => { Sound.tap(); afterWin(() => leaveGame()); });

/* ——— Publicités de la maison : toutes les 3 manches gagnées ——— */
const ADS = {
  chat: [
    { brand: 'Ronron Fitness', product: 'Tapis de yoga Paisley Zen', slogan: '« La posture du chat… inventée par un chat. »', visual: '🧘', price: '19,90 €', bubble: 'Et on s’étiiiiire…', small: 'Souplesse non garantie pour les humains.' },
    { brand: 'Ronron Fitness', product: 'Brin d’herbe Pro Boxing', slogan: '« Huit rounds, zéro défaite. »', visual: '🥊', price: 'Nouveau !', bubble: 'Approche si tu l’oses !', small: 'Aucun brin d’herbe n’a survécu au test.', photo: 'chat2' },
    { brand: 'Ronron Fitness', product: 'Appareil photo Gros Plan 3000', slogan: '« Mon meilleur profil ? Tous. »', visual: '📸', price: '−20 %', bubble: 'Tu as vu mes yeux ?', small: 'Moustaches non retouchées.', photo: 'chat3' },
    { brand: 'Ronron Fitness', product: 'Couette Sieste Intégrale', slogan: '« Seize heures de sommeil par jour, enfin avec style. »', visual: '😴', price: '4,99 €', bubble: 'Ne pas déranger.', small: 'Les poils sont offerts.' },
  ],
  transat: [
    { brand: 'Sieste & Sommets', product: 'Transat Géant XXL', slogan: '« Assez grand pour tout le peloton. »', visual: '🪑', price: '89 €', bubble: 'Moi, je ne bouge plus d’ici !', small: 'Montage par deux cyclistes minimum.' },
    { brand: 'Sieste & Sommets', product: 'Maillot jaune de la sieste', slogan: '« Le seul maillot jaune qui se gagne assis. »', visual: '💛', price: 'Édition limitée', bubble: 'Première au classement de la pause !', small: 'Aucun col à grimper. Promis.' },
    { brand: 'Sieste & Sommets', product: 'Sac à dos Jungle Fleurie', slogan: '« Assorti à toutes les chemises, surtout les fleuries. »', visual: '🎒', price: '24,90 €', bubble: 'Mon sac, je le garde sur moi !', small: 'Fleurs garanties sans arrosage.' },
    { brand: 'Sieste & Sommets', product: 'Lunettes Vue Panoramique', slogan: '« Pour ne rien rater de l’arrivée… même de très loin. »', visual: '👓', price: '39 €', bubble: 'Je les vois arriver !', small: 'Coureurs non inclus. Montagnes offertes.' },
  ],
  chien: [
    { brand: 'Wouf & Compagnie', product: 'Dentifrice Sourire en Coin', slogan: '« Pour un sourire unique… et un peu de travers. »', visual: '🪥', price: '3,49 €', bubble: 'Cheeeese !', small: 'Effet garanti sur toutes les photos de famille.' },
    { brand: 'Wouf & Compagnie', product: 'Coussin Mauve Grand Confort', slogan: '« Le fauteuil du jardin est à moi. Point. »', visual: '🛋️', price: '−25 %', bubble: 'Réservé. Circulez.', small: 'Les humains peuvent prendre la chaise en plastique.' },
    { brand: 'Wouf & Compagnie', product: 'Croquettes Bonne Humeur', slogan: '« Le secret de ma grimace légendaire. »', visual: '🦴', price: '4,99 €', bubble: 'J’ai entendu un paquet s’ouvrir ?', small: 'Ne pas confondre avec les croquettes du chat.' },
    { brand: 'Wouf & Compagnie', product: 'Balle Turbo Rebond', slogan: '« Lance-la, je la ramène… peut-être. »', visual: '🎾', price: 'Nouveau !', bubble: 'Encore ! Encore !', small: 'Sieste obligatoire après usage.' },
  ],
  poncho: [
    { brand: 'Imper’Mouillé', product: 'Poncho Ultra-Étanche', slogan: '« Pour sortir de l’attraction aussi sec qu’au départ. Enfin, presque. »', visual: '🌧️', price: '2,50 €', bubble: 'Pourquoi je suis tout mouillé ?', small: 'Bonne humeur non incluse.' },
    { brand: 'Imper’Mouillé', product: 'Kit Sourire de file d’attente', slogan: '« Quarante-cinq minutes de queue, zéro bouderie. »', visual: '😁', price: '−50 %', bubble: 'Je ne boude pas, je réfléchis.', small: 'Mode d’emploi à lire pendant l’attente.' },
    { brand: 'Imper’Mouillé', product: 'Coupe-file Express', slogan: '« Moins d’attente, plus d’éclaboussures. »', visual: '🎟️', price: '19,90 €', bubble: 'On y retourne ?', small: 'Valable jusqu’à la sortie.' },
    { brand: 'Imper’Mouillé', product: 'Sèche-cheveux de poche', slogan: '« Pour retrouver sa coiffure après le grand plouf. »', visual: '💨', price: 'Nouveau !', bubble: 'Quelqu’un a une serviette ?', small: 'Piles non incluses. Coiffure non plus.' },
  ],
  atelier: [
    { brand: 'Chantier Chic', product: 'Gilet Orange Haute Visibilité', slogan: '« Repérable à trois kilomètres, même dans le brouillard. »', visual: '🦺', price: '12,90 €', bubble: 'Vous me voyez bien, là ?', small: 'Coloris unique : très, très orange.' },
    { brand: 'Chantier Chic', product: 'Lunettes Rondes Intello', slogan: '« Pour avoir l’air de tout savoir sur le pont roulant. »', visual: '👓', price: '−30 %', bubble: 'Je vérifie juste un petit truc.', small: 'Effet professeur garanti.' },
    { brand: 'Chantier Chic', product: 'Casquette Anti-Courant d’air', slogan: '« Indispensable sous les grands hangars. »', visual: '🧢', price: '9,90 €', bubble: 'Elle ne me quitte jamais !', small: 'Visière orientable vers le haut pour les selfies.' },
    { brand: 'Chantier Chic', product: 'Pont roulant télécommandé', slogan: '« Soulever dix tonnes d’une seule main. »', visual: '🏗️', price: 'Sur devis', bubble: 'Attention, ça passe au-dessus !', small: 'Formation CACES non fournie.' },
  ],
};
const AD_ORDER = ['chat', 'transat', 'chien', 'poncho', 'atelier'];
let adCb = null, adTimer = 0;
function showAd(n, cb) {
  const k = n / 3 - 1, animal = AD_ORDER[k % AD_ORDER.length], a = ADS[animal][Math.floor(k / AD_ORDER.length) % ADS[animal].length];
  const el = $('#ad'), photo = a.photo || animal;
  el.dataset.animal = animal;
  el.querySelectorAll('.ad-photo img').forEach(img => img.classList.toggle('on', img.dataset.animal === photo));
  ['brand', 'product', 'slogan', 'visual', 'price', 'bubble', 'small'].forEach(f => { $('#ad-' + f).textContent = a[f]; });
  $('#ad-price').classList.toggle('long', a.price.length > 8);
  el.classList.remove('on', 'can-close'); void el.offsetWidth; el.classList.add('on');
  Sound.jingle();
  let c = 3; $('#ad-count').textContent = c; adCb = cb;
  clearInterval(adTimer);
  adTimer = setInterval(() => {
    c--;
    if (c <= 0) { clearInterval(adTimer); el.classList.add('can-close'); $('#ad-x').focus(); }
    else $('#ad-count').textContent = c;
  }, 1000);
}
function closeAd() {
  const el = $('#ad');
  if (!el.classList.contains('can-close')) return;
  el.classList.remove('on'); const cb = adCb; adCb = null; if (cb) cb();
}
$('#ad-x').addEventListener('click', () => { Sound.tap(); closeAd(); });
function afterWin(fn) {
  if (curLevel % 3 === 0 && adSeenLevel !== curLevel) { adSeenLevel = curLevel; $('#m-done').classList.remove('on'); showAd(curLevel, fn); }
  else fn();
}

/* ——— Pause ——— */
function closeModals() { document.querySelectorAll('.modal, #reveal').forEach(m => m.classList.remove('on')); }
function pause() { if (current === 's-mini') { if (!mini || mini.done) return; } else if (!game || game.done) return; paused = true; $('#m-pause').classList.add('on'); }
function resume() { paused = false; closeModals(); lastTick = performance.now(); dirty = true; }
function leaveGame() { closeModals(); MiniHost.stop(); game = null; paused = false; effects.length = 0; hint = null; paintBackdrop(); show('s-levels'); }
$('#g-pause').addEventListener('click', () => { Sound.tap(); pause(); });
$('#p-resume').addEventListener('click', () => { Sound.tap(); resume(); });
$('#p-restart').addEventListener('click', () => { Sound.tap(); startLevel(curLevel); });
$('#p-quit').addEventListener('click', () => { Sound.tap(); leaveGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (current === 's-game' || current === 's-mini')) pause(); });

/* ——— Bouton retour Android ——— */
function capApp() {
  const C = window.Capacitor;
  if (!C || !(C.isNativePlatform && C.isNativePlatform())) return null;
  return (C.Plugins && C.Plugins.App) || (C.registerPlugin && C.registerPlugin('App')) || null;
}
function onBack() {
  if ($('#reveal').classList.contains('on')) return closeReveal();
  if ($('#ad').classList.contains('on')) return closeAd();
  if ($('#m-done').classList.contains('on')) return afterWin(() => leaveGame());
  const zm = document.querySelector('#m-card.on, #m-egg.on'); if (zm) { zm.classList.remove('on'); return; }
  if ($('#m-rules').classList.contains('on')) return $('#rules-ok').click();
  if ($('#m-lose').classList.contains('on')) return $('#lose-quit').click();
  if ($('#m-pause').classList.contains('on')) return resume();
  if (current === 's-game' || current === 's-mini') return pause();
  if (['s-levels', 's-settings', 's-dex', 's-daily', 's-ach'].includes(current)) return show('s-menu');
  const App = capApp();
  if (App && App.exitApp) App.exitApp();
}
try {
  const App = capApp();
  if (App) {
    App.addListener('backButton', onBack);
    App.addListener('pause', () => { if (current === 's-game' || current === 's-mini') pause(); });
  }
} catch (e) { /* hors application */ }
window.addEventListener('keydown', e => { if (e.key === 'Escape') onBack(); });

/* ——— Démarrage ——— */
Save.load();
Sound.setVolumes(Save.d.music, Save.d.sfx);
paintBackdrop();
document.addEventListener('pointerdown', function first() { Sound.init(); Sound.play(current === 's-game' && game ? game.info.theme.mood : 'menu'); }, { once: true });
show(Save.d.pseudo ? 's-menu' : 's-pseudo');
