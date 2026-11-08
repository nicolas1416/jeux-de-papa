// Améliorations des décors : rendu « peint », objets suspendus, premiers plans flous,
// et trois nouveaux décors de ferme (écurie, grange, cabane du jardinier).
'use strict';

/* ——— Accessoires suspendus (x = centre, y = clou) ——— */
const HANG = {
  rope(S, x, y, s) {
    const c = S.c; c.strokeStyle = '#3a2a1a'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { c.strokeStyle = i % 2 ? '#b8935a' : '#9a7440'; c.lineWidth = 5 * s; ell(c, x, y + 40 * s + i * 2 * s, 28 * s - i * 1.5 * s, 34 * s - i * 2 * s); c.stroke(); }
    c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = 1; ell(c, x, y + 42 * s, 22 * s, 28 * s); c.stroke();
    c.strokeStyle = '#9a7440'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + 10 * s, y + 70 * s); c.quadraticCurveTo(x + 20 * s, y + 100 * s, x + 8 * s, y + 120 * s); c.stroke();
    return 64 * s;
  },
  garlic(S, x, y, s) {
    const c = S.c; c.strokeStyle = '#c8b080'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 110 * s); c.stroke();
    for (let i = 0; i < 9; i++) { const yy = y + 14 * s + i * 11 * s, xx = x + (i % 2 ? 9 : -9) * s; c.fillStyle = RG(c, xx - 3 * s, yy - 3 * s, 1, xx, yy, 10 * s, ['#ffffff', '#ece4d4', '#b8a888']); ell(c, xx, yy, 9 * s, 8 * s); c.fill(); c.strokeStyle = 'rgba(160,130,110,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(xx, yy - 8 * s); c.lineTo(xx, yy + 8 * s); c.stroke(); }
    return 30 * s;
  },
  herbs(S, x, y, s) {
    const c = S.c, R = S.R; c.fillStyle = '#c8a060'; c.fillRect(x - 6 * s, y + 4 * s, 12 * s, 8 * s);
    for (let i = 0; i < 16; i++) { const a = Math.PI / 2 + rnd(R, -.4, .4), l = rnd(R, 40, 80) * s; c.strokeStyle = pick(R, ['#5a7a3a', '#7a9a4a', '#4a6a2a', '#8a9a5a']); c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 10 * s); c.lineTo(x + Math.cos(a) * l, y + 10 * s + Math.sin(a) * l); c.stroke(); leaf(c, x + Math.cos(a) * l, y + 10 * s + Math.sin(a) * l, 10 * s, a, '#7a9a4a', '#3a5a2a'); }
    return 40 * s;
  },
  peppers(S, x, y, s) {
    const c = S.c; c.strokeStyle = '#7a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 100 * s); c.stroke();
    for (let i = 0; i < 12; i++) { const yy = y + 8 * s + i * 8 * s, d = i % 2 ? 1 : -1; c.save(); c.translate(x, yy); c.rotate(d * .9); c.fillStyle = LG(c, 0, -3, 0, 3, ['#ff5a3a', '#c8180a', '#7a0a04']); c.beginPath(); c.moveTo(0, -3 * s); c.quadraticCurveTo(18 * s, -2 * s, 22 * s, 4 * s); c.quadraticCurveTo(12 * s, 3 * s, 0, 3 * s); c.fill(); c.restore(); }
    return 40 * s;
  },
  hat(S, x, y, s) {
    if (S.avoid.has('chapeau')) return HANG.herbs(S, x, y, s);
    const c = S.c; c.fillStyle = LG(c, 0, y, 0, y + 50 * s, ['#8a6a40', '#5a3a1a']);
    ell(c, x, y + 36 * s, 40 * s, 11 * s); c.fill();
    c.beginPath(); c.moveTo(x - 22 * s, y + 34 * s); c.quadraticCurveTo(x - 24 * s, y + 4 * s, x, y + 6 * s); c.quadraticCurveTo(x + 24 * s, y + 4 * s, x + 22 * s, y + 34 * s); c.fill();
    c.fillStyle = '#3a2410'; c.fillRect(x - 22 * s, y + 26 * s, 44 * s, 6 * s);
    return 84 * s;
  },
  tool(S, x, y, s) {
    const c = S.c, R = S.R, k = Math.floor(R() * 3), L = rnd(R, 150, 210) * s;
    c.fillStyle = LG(c, x - 4, 0, x + 4, 0, ['#5a3a1a', '#a87a4a', '#5a3a1a']); c.fillRect(x - 4 * s, y, 8 * s, L);
    c.fillStyle = silver(c, x - 20, y + L, x + 20, y + L + 40);
    if (k === 0) { for (let i = -1; i <= 1; i++) c.fillRect(x + i * 12 * s - 2 * s, y + L - 4 * s, 4 * s, 46 * s); c.fillRect(x - 16 * s, y + L - 6 * s, 32 * s, 6 * s); }
    else if (k === 1) { c.beginPath(); c.moveTo(x - 18 * s, y + L); c.lineTo(x + 18 * s, y + L); c.lineTo(x + 14 * s, y + L + 40 * s); c.quadraticCurveTo(x, y + L + 52 * s, x - 14 * s, y + L + 40 * s); c.closePath(); c.fill(); }
    else { c.fillRect(x - 26 * s, y + L - 4 * s, 52 * s, 6 * s); for (let i = -3; i <= 3; i++) c.fillRect(x + i * 8 * s - 1.5 * s, y + L, 3 * s, 16 * s); }
    return 46 * s;
  },
  basket(S, x, y, s) {
    const c = S.c, w = 56 * s, h = 34 * s;
    c.strokeStyle = '#8a6030'; c.lineWidth = 3 * s; c.beginPath(); c.arc(x, y + 30 * s, 26 * s, Math.PI, 0); c.stroke();
    c.fillStyle = LG(c, 0, y + 30 * s, 0, y + 30 * s + h, ['#d8b070', '#8a6030']); c.beginPath(); c.moveTo(x - w / 2, y + 30 * s); c.lineTo(x + w / 2, y + 30 * s); c.lineTo(x + w * .4, y + 30 * s + h); c.lineTo(x - w * .4, y + 30 * s + h); c.fill();
    c.strokeStyle = 'rgba(80,50,20,.45)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - w / 2, y + 30 * s + h * i / 4); c.lineTo(x + w / 2, y + 30 * s + h * i / 4); c.stroke(); }
    return 64 * s;
  },
  pan(S, x, y, s) {
    const c = S.c; c.fillStyle = '#4a2a14'; c.fillRect(x - 3 * s, y, 6 * s, 50 * s);
    c.fillStyle = RG(c, x - 8 * s, y + 70 * s, 2, x, y + 76 * s, 28 * s, ['#f8b880', '#c8683a', '#6a2a10']); circ(c, x, y + 76 * s, 27 * s); c.fill();
    c.strokeStyle = 'rgba(255,220,180,.5)'; c.lineWidth = 2; circ(c, x, y + 76 * s, 21 * s); c.stroke();
    return 62 * s;
  },
  corn(S, x, y, s) {
    const c = S.c; c.strokeStyle = '#c8a060'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14 * s); c.stroke();
    for (let i = -2; i <= 2; i++) { c.save(); c.translate(x, y + 14 * s); c.rotate(i * .14); c.fillStyle = LG(c, -7 * s, 0, 7 * s, 0, ['#b88a10', '#f8d040', '#c89a18']); ell(c, 0, 50 * s, 7 * s, 34 * s); c.fill(); c.fillStyle = 'rgba(120,80,0,.35)'; for (let k = 0; k < 8; k++) { c.fillRect(-6 * s, 22 * s + k * 7 * s, 12 * s, 1.2); } c.fillStyle = '#d8c890'; c.beginPath(); c.moveTo(0, 14 * s); c.quadraticCurveTo(-14 * s, 30 * s, -8 * s, 70 * s); c.lineTo(-2 * s, 30 * s); c.fill(); c.restore(); }
    return 50 * s;
  },
  bag(S, x, y, s) {
    const c = S.c, col = pick(S.R, ['#a08860', '#7a6a4a', '#8a5a3a']);
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 10 * s, y + 20 * s); c.moveTo(x, y); c.lineTo(x + 10 * s, y + 20 * s); c.stroke();
    c.fillStyle = LG(c, x - 25 * s, 0, x + 25 * s, 0, [shade(col, .6), col, shade(col, .7)]); c.beginPath(); c.moveTo(x - 14 * s, y + 20 * s); c.lineTo(x + 14 * s, y + 20 * s); c.quadraticCurveTo(x + 32 * s, y + 70 * s, x + 18 * s, y + 90 * s); c.lineTo(x - 18 * s, y + 90 * s); c.quadraticCurveTo(x - 32 * s, y + 70 * s, x - 14 * s, y + 20 * s); c.fill();
    return 60 * s;
  },
};
const HANG_SETS = {
  farm: ['rope', 'tool', 'tool', 'garlic', 'herbs', 'hat', 'basket', 'bag', 'corn', 'peppers'],
  kitchen: ['pan', 'pan', 'garlic', 'herbs', 'peppers', 'basket', 'corn'],
  attic: ['rope', 'hat', 'bag', 'basket', 'tool'],
};
function wallHangs(S, x0, x1, y, set, dens) {
  const c = S.c, R = S.R; let x = x0 + rnd(R, 10, 40);
  while (x < x1 - 30) {
    if (R() > (dens || .75)) { x += rnd(R, 40, 90); continue; }
    const s = rnd(R, .8, 1.05), yy = y + rnd(R, -14, 14);
    c.fillStyle = '#2a2a2a'; circ(c, x, yy, 3); c.fill();
    const w = HANG[pick(R, HANG_SETS[set])](S, x, yy, s);
    x += w + rnd(R, 14, 40);
  }
}

/* ——— Accessoires de ferme posés au sol ——— */
Object.assign(P, {
  sack(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 50, 70) * s, h = w * 1.1, col = pick(R, ['#c8b088', '#a8906a', '#d8c4a0']);
    c.fillStyle = LG(c, x, 0, x + w, 0, [shade(col, .6), col, shade(col, 1.1), shade(col, .55)]);
    c.beginPath(); c.moveTo(x + w * .2, y - h); c.quadraticCurveTo(x + w * .5, y - h * 1.08, x + w * .8, y - h); c.quadraticCurveTo(x + w * 1.08, y - h * .4, x + w, y); c.lineTo(x, y); c.quadraticCurveTo(x - w * .08, y - h * .4, x + w * .2, y - h); c.fill();
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x + w * .25, y - h * .82); c.quadraticCurveTo(x + w * .5, y - h * .74, x + w * .75, y - h * .82); c.stroke();
    if (R() < .5) { c.fillStyle = 'rgba(80,40,20,.45)'; c.font = `${12 * s}px serif`; c.fillText('N°' + Math.floor(R() * 9 + 1), x + w * .3, y - h * .35); }
    return w + 4;
  },
  bucket(S, x, y, s) {
    const c = S.c, w = 44 * s, h = 46 * s;
    c.fillStyle = silver(c, x, y - h, x + w, y); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y - h); c.lineTo(x + w * .86, y); c.lineTo(x + w * .14, y); c.fill();
    ell(c, x + w / 2, y - h, w / 2, 6 * s); c.fillStyle = '#4a4a4a'; c.fill();
    c.strokeStyle = '#6a6a6a'; c.lineWidth = 2; c.beginPath(); c.arc(x + w / 2, y - h, w * .48, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(x + 3, y - h * .5); c.lineTo(x + w - 3, y - h * .5); c.stroke();
    return w + 4;
  },
  logs(S, x, y, s) {
    const c = S.c, R = S.R; const n = 3 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const r = rnd(R, 9, 13) * s, lx = x + (i % 3) * 22 * s + (i >= 3 ? 11 * s : 0), ly = y - r - (i >= 3 ? 20 * s : 0); c.fillStyle = LG(c, lx, ly - r, lx + 40 * s, ly + r, ['#8a5a30', '#5a3a1a']); c.fillRect(lx - 30 * s, ly - r, 30 * s, r * 2); c.fillStyle = RG(c, lx, ly, 1, lx, ly, r, ['#e8c890', '#c8985a', '#8a5a2a']); circ(c, lx, ly, r); c.fill(); c.strokeStyle = 'rgba(90,50,20,.5)'; c.lineWidth = 1; circ(c, lx, ly, r * .55); c.stroke(); }
    return 70 * s;
  },
  stones(S, x, y, s) {
    const c = S.c, R = S.R; for (let i = 0; i < 4; i++) { const r = rnd(R, 8, 16) * s; blobPath(c, R, x + i * 16 * s, y - r * .7, r, .4, 8); c.fillStyle = RG(c, x + i * 16 * s - r * .3, y - r, 1, x + i * 16 * s, y - r * .7, r * 1.2, ['#c8c0b0', '#8a8478', '#4a4640']); c.fill(); }
    return 70 * s;
  },
  hay(S, x, y, s) {
    const c = S.c, R = S.R; c.lineWidth = 1.4;
    for (let i = 0; i < 40; i++) { c.strokeStyle = pick(R, ['#e8c060', '#c89a40', '#f0d880', '#a87a30']); const a = rnd(R, -2.6, -.5), l = rnd(R, 10, 34) * s, sx = x + rnd(R, 0, 60) * s; c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    return 64 * s;
  },
  pumpkin(S, x, y, s) {
    const c = S.c, R = S.R, r = rnd(R, 18, 28) * s, col = pick(R, [['#f8a040', '#a84a10'], ['#e8d090', '#9a8040'], ['#8aa060', '#3a5a20']]);
    for (let i = -2; i <= 2; i++) { c.fillStyle = RG(c, x + r + i * r * .3 - r * .2, y - r * 1.1, 1, x + r + i * r * .3, y - r * .8, r * .8, [shade(col[0], 1.2), col[0], col[1]]); ell(c, x + r + i * r * .32, y - r * .8, r * .45, r * .8); c.fill(); }
    c.fillStyle = '#5a4a2a'; c.fillRect(x + r - 2 * s, y - r * 1.75, 4 * s, 8 * s);
    return r * 2 + 6;
  },
  can(S, x, y, s) {
    const c = S.c, w = 40 * s, h = 36 * s;
    c.fillStyle = LG(c, x, 0, x + w, 0, ['#5a6a5a', '#9aaa98', '#4a5a4a']); rrect(c, x, y - h, w, h, 4 * s); c.fill();
    c.strokeStyle = '#5a6a5a'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + w, y - h * .7); c.lineTo(x + w + 26 * s, y - h * 1.3); c.stroke();
    c.beginPath(); c.arc(x + w / 2, y - h, w * .35, Math.PI, 0); c.stroke();
    return w + 30 * s;
  },
});
PROP_SETS.farm = ['sack', 'bucket', 'logs', 'stones', 'hay', 'pumpkin', 'can', 'basket', 'jar', 'box'];
PROP_SETS.shed = ['jar', 'jar', 'can', 'pumpkin', 'basket', 'bottle', 'box', 'plant'];

/* ——— Gros éléments de ferme ——— */
function strawTexture(c, R, x, y, w, h, n) {
  c.lineWidth = 1.3;
  for (let i = 0; i < n; i++) { c.strokeStyle = pick(R, ['rgba(255,230,140,.55)', 'rgba(150,100,30,.45)', 'rgba(240,200,90,.5)', 'rgba(110,70,20,.35)']); const sx = rnd(R, x, x + w), sy = rnd(R, y, y + h), a = rnd(R, -.5, .5) + (R() < .5 ? 0 : Math.PI / 2), l = rnd(R, 6, 22); c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); c.stroke(); }
}
function haybale(S, x, yb, w, h, onFg) {
  const c = onFg ? S.f : S.c, R = S.R;
  c.fillStyle = LG(c, 0, yb - h, 0, yb, ['#f0cc70', '#d0a040', '#9a6a20']); rrect(c, x, yb - h, w, h, 10); c.fill();
  c.fillStyle = LG(c, x, 0, x + w, 0, ['rgba(0,0,0,.25)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.3)']); rrect(c, x, yb - h, w, h, 10); c.fill();
  strawTexture(c, R, x, yb - h, w, h, w * h / 120);
  c.strokeStyle = 'rgba(90,60,20,.8)'; c.lineWidth = 3; [.3, .7].forEach(t => { c.beginPath(); c.moveTo(x + w * t, yb - h); c.lineTo(x + w * t + 4, yb); c.stroke(); });
  for (let i = 0; i < 30; i++) { c.strokeStyle = 'rgba(240,200,100,.8)'; const sx = rnd(R, x, x + w); c.beginPath(); c.moveTo(sx, yb - h + 2); c.lineTo(sx + rnd(R, -8, 8), yb - h - rnd(R, 4, 14)); c.stroke(); }
  if (!onFg) surface(S, x + 10, x + w - 10, yb - h + 4, .9, 'top');
}
function stall(S, x0, x1, yb, h, wood) {
  const c = S.c;
  for (let x = x0; x <= x1; x += 150) { c.fillStyle = LG(c, x, 0, x + 18, 0, [shade(wood, .5), wood, shade(wood, .5)]); c.fillRect(x, yb - h, 18, h); }
  [.15, .5, .85].forEach(t => { const y = yb - h * t; c.fillStyle = LG(c, 0, y - 8, 0, y + 8, [shade(wood, 1.2), shade(wood, .55)]); c.fillRect(x0, y - 8, x1 - x0 + 18, 16); });
  c.strokeStyle = 'rgba(30,30,40,.8)'; c.lineWidth = 4; for (let x = x0 + 20; x < x1; x += 22) { c.beginPath(); c.moveTo(x, yb - h); c.lineTo(x, yb - h - 120); c.stroke(); }
  c.fillStyle = '#2a2a30'; c.fillRect(x0, yb - h - 124, x1 - x0 + 18, 8);
  surface(S, x0 + 20, x1, yb - h - 8, .8, 'rail');
}
function post(S, x, w, wood) { const c = S.c; c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .45), shade(wood, 1.1), wood, shade(wood, .4)]); c.fillRect(x, 0, w, FLOOR + 20); c.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 6; i++) c.fillRect(x + w * .3, 60 + i * 80, 2, 40); }
function openingView(S, x, y, w, h) {
  const c = S.c, R = S.R;
  fillV(c, y, y + h, ['#cfe4f0', '#f4ecd0'], x, x + w);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = '#8aa0b0'; c.beginPath(); c.moveTo(x, y + h * .55); for (let i = 0; i <= 6; i++) c.lineTo(x + w * i / 6, y + h * (.4 + R() * .15)); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
  for (let i = 0; i < 10; i++) { const g = pick(R, GREENS); foliage(c, R, x + rnd(R, 0, w), y + h * rnd(R, .55, .8), rnd(R, 40, 80), 16, [g]); }
  fillV(c, y + h * .78, y + h, ['#a8b860', '#7a8a40'], x, x + w);
  c.restore();
  glow(c, x + w / 2, y + h / 2, Math.max(w, h), 'rgba(255,240,200,.35)');
  S.lights.push([x + w / 2, y + h / 2, w * 1.5]);
}
function lanternHang(S, x, y) {
  if (S.avoid.has('lanterne')) return;
  const c = S.c; c.strokeStyle = '#2a2a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 20); c.lineTo(x, y); c.stroke();
  c.fillStyle = '#2a3a2a'; c.fillRect(x - 12, y, 24, 6); c.fillStyle = RG(c, x, y + 22, 2, x, y + 22, 16, ['#fff6cc', '#ffbf3a', '#8a4a0a']); c.fillRect(x - 10, y + 6, 20, 30); c.fillStyle = '#2a3a2a'; c.fillRect(x - 13, y + 36, 26, 6);
  glow(c, x, y + 22, 90, 'rgba(255,200,110,.6)'); S.lights.push([x, y + 22, 200]);
}

/* ——— Premiers plans flous (profondeur de champ) ——— */
function fgFrame(S, kind, side) {
  // dessiné sur un calque à part, puis flouté en une seule fois (rapide)
  const dst = S.f, tmp = document.createElement('canvas'); tmp.width = dst.canvas.width; tmp.height = dst.canvas.height;
  const f = tmp.getContext('2d'); f.setTransform(dst.getTransform()); f.lineJoin = 'round';
  frameShapes(S, f, kind, side);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.filter = `blur(${Math.max(1, Math.round(tmp.width / 700))}px)`; dst.drawImage(tmp, 0, 0); dst.restore();
}
function frameShapes(S, f, kind, side) {
  const R = S.R, L = side !== 'right', x0 = L ? 0 : W;
  const dir = L ? 1 : -1;
  f.save();
  if (kind === 'hay') {
    f.translate(x0, 0); if (!L) f.scale(-1, 1);
    haybale({ ...S, f, c: f }, -60, H + 30, 300, 230, true);
  } else if (kind === 'plant') {
    for (let i = 0; i < 16; i++) { const g = pick(R, GREENS); leaf(f, x0 + dir * rnd(R, -20, 60), H - rnd(R, 0, 200), rnd(R, 70, 130), (L ? -Math.PI / 2 : -Math.PI / 2) + dir * rnd(R, 0, 1.3), g[0], g[1]); }
  } else if (kind === 'drape') {
    const col = pick(R, ['#7a1a2a', '#2a4a3a', '#5a2a5a', '#8a6a3a']);
    f.fillStyle = LG(f, x0, 0, x0 + dir * 200, 0, [shade(col, .5), col, shade(col, 1.2), shade(col, .6)]);
    f.beginPath(); f.moveTo(x0, 0); f.lineTo(x0 + dir * 260, 0); f.quadraticCurveTo(x0 + dir * 120, 140, x0 + dir * 30, 320); f.lineTo(x0, 330); f.fill();
  } else if (kind === 'beam') {
    f.fillStyle = LG(f, 0, 0, 60, 60, ['#5a3a1a', '#9a6a3a', '#4a2a10']);
    f.translate(x0 + dir * 120, H); f.rotate(dir * -.55); f.fillRect(-26, -900, 52, 1000);
  } else if (kind === 'ladder') {
    f.strokeStyle = '#6a4424'; f.lineWidth = 16; const bx = L ? 150 : W - 150;
    f.beginPath(); f.moveTo(bx - 90 * dir, H + 20); f.lineTo(bx + 40 * dir, -20); f.moveTo(bx + 10 * dir, H + 20); f.lineTo(bx + 140 * dir, -20); f.stroke();
    f.lineWidth = 11; for (let i = 1; i < 9; i++) { const t = i / 9; f.beginPath(); f.moveTo(bx - 90 * dir + t * 130 * dir, H + 20 - t * (H + 40)); f.lineTo(bx + 10 * dir + t * 130 * dir, H + 20 - t * (H + 40)); f.stroke(); }
  }
  f.restore();
}

/* ——— Rendu « peint » : couleurs plus riches, halo lumineux, touches de pinceau ——— */
let brushPattern = null;
function brushTexture(R) {
  if (brushPattern) return brushPattern;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d'); c.lineCap = 'round';
  for (let i = 0; i < 900; i++) {
    const x = R() * 256, y = R() * 256, a = rnd(R, -.6, .6) + (R() < .3 ? Math.PI / 2 : 0), l = rnd(R, 4, 16);
    c.strokeStyle = R() < .5 ? `rgba(255,255,255,${rnd(R, .04, .12)})` : `rgba(0,0,0,${rnd(R, .04, .12)})`; c.lineWidth = rnd(R, 1, 3);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  brushPattern = cv; return cv;
}
function paintify(bg, R) {
  const c = bg.getContext('2d'), w = bg.width, h = bg.height;
  if (!('filter' in c)) return;
  const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
  const t = tmp.getContext('2d'); t.drawImage(bg, 0, 0);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.filter = 'saturate(1.18) contrast(1.06)'; c.drawImage(tmp, 0, 0); c.filter = 'none';
  c.globalCompositeOperation = 'screen'; c.globalAlpha = .22; c.filter = `blur(${Math.round(w / 220)}px) brightness(1.05)`; c.drawImage(tmp, 0, 0); c.filter = 'none';
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = .55; c.fillStyle = c.createPattern(brushTexture(R), 'repeat'); c.fillRect(0, 0, w, h);
  c.restore();
}

/* ——— Trois nouveaux décors de ferme ——— */
const FARM_THEMES = {
  bal: { key: 'ecurie', name: 'Écurie au soleil couchant', mood: 'calm', sw: ['#5a3418', '#e8b060'], paint(S) {
    const c = S.c;
    wall(S, 0, FLOOR, 'planks', '#8a5a34', '#4a2c16'); floor(S, 'cobble', '#a04a30', '#5a2414');
    for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(70 + i * 330, 150, 240, 120); openingView(S, 80 + i * 330, 160, 220, 100); c.strokeStyle = '#3a2410'; c.lineWidth = 8; c.strokeRect(80 + i * 330, 160, 220, 100); c.beginPath(); c.moveTo(190 + i * 330, 160); c.lineTo(190 + i * 330, 260); c.stroke(); }
    stall(S, 40, 1060, FLOOR, 200, '#6a4424');
    wallHangs(S, 40, 1060, 30, 'farm', .85);
    post(S, 1080, 50, '#6a4424'); post(S, 380, 36, '#6a4424');
    haybale(S, 1150, FLOOR + 40, 260, 190); haybale(S, 1200, FLOOR - 150, 200, 150); haybale(S, 480, FLOOR + 60, 260, 150);
    wallHangs(S, 1140, 1580, 60, 'farm', .8); lanternHang(S, 700, 40);
    crate(S, 1420, FLOOR + 60, 160, 130, '#7a5a34', 'farm'); barrel(S, 820, FLOOR + 50, 120, 170, '#6a4020');
    floorZone(S, 120, 1500, FLOOR + 50, H - 30); scatterFloor(S, 'farm', 10);
    rays(c, S.R, 1300, -40, 'rgba(255,220,150,.2)', 6, .6, 1200, Math.PI * .65);
    dust(c, S.R, 220, 0, 0, W, H);
    fgFrame(S, 'hay', 'left'); fgFrame(S, 'ladder', 'right');
  } },
  gare: { key: 'grange', name: 'Grange de la ferme', mood: 'bright', sw: ['#6a3a1a', '#f0c070'], paint(S) {
    const c = S.c, R = S.R;
    wall(S, 0, FLOOR, 'planks', '#9a6a40', '#5a3a1e'); floor(S, 'dirt', '#b08a50', '#7a5a30');
    openingView(S, 1240, 40, 330, 500); c.strokeStyle = '#4a2a14'; c.lineWidth = 16; c.strokeRect(1240, 40, 330, 500);
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = LG(c, 1200, FLOOR, 600, H, ['rgba(255,230,150,.55)', 'rgba(255,220,140,0)']); c.beginPath(); c.moveTo(1240, FLOOR); c.lineTo(1570, FLOOR); c.lineTo(1300, H); c.lineTo(500, H); c.fill(); c.restore();
    for (let i = 0; i < 2; i++) wallShelf(S, 30, 120 + i * 140, 520, '#6a4424', 'shed', .9);
    wallHangs(S, 600, 1200, 40, 'farm', .9);
    table(S, 760, FLOOR + 40, 420, 150, '#7a5030', null, 'shed', .85);
    barrel(S, 40, FLOOR + 60, 160, 220, '#6a4020'); P.sack(S, 220, FLOOR + 70, 1.8); P.sack(S, 330, FLOOR + 60, 1.6);
    commode(S, 1000, FLOOR - 10, 200, 140, '#6a4424', 'farm', .8);
    for (let i = 0; i < 4; i++) P.pumpkin(S, 220 + i * 90, H - 20, 2.4);
    floorZone(S, 200, 1300, FLOOR + 60, H - 30); scatterFloor(S, 'farm', 12);
    dust(c, R, 300, 700, 0, W, H);
    fgFrame(S, 'beam', 'left'); fgFrame(S, 'plant', 'right');
  } },
  labo: { key: 'cabane', name: 'Cabane du jardinier', mood: 'dreamy', sw: ['#7a5a2a', '#f4d890'], paint(S) {
    const c = S.c, R = S.R;
    wall(S, 0, FLOOR, 'planks', '#c08a50', '#7a5028'); floor(S, 'planks', '#a07040', '#5a3a1a');
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(250, 50, 300, 330); openingView(S, 260, 60, 280, 310);
    c.strokeStyle = 'rgba(60,60,60,.5)'; c.lineWidth = 1; for (let k = 0; k < 30; k++) { c.beginPath(); c.moveTo(260 + k * 10, 60); c.lineTo(260 + k * 10 - 60, 370); c.moveTo(260 + k * 10 - 60, 60); c.lineTo(260 + k * 10, 370); c.stroke(); }
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 12; c.strokeRect(260, 60, 280, 310);
    wallShelf(S, 600, 110, 380, '#6a4424', 'shed', .95); wallShelf(S, 600, 250, 380, '#6a4424', 'shed', .9);
    wallHangs(S, 1000, 1560, 30, 'kitchen', .9); wallHangs(S, 40, 240, 40, 'farm', .9); lanternHang(S, 1100, 60);
    table(S, 520, FLOOR + 20, 640, 140, '#8a5a30', null, 'shed', .85);
    crate(S, 1060, FLOOR + 30, 170, 130, '#8a6a40', 'farm'); P.bucket(S, 1250, FLOOR + 40, 2); haybale(S, 1330, FLOOR + 60, 220, 140);
    for (let i = 0; i < 5; i++) P.pumpkin(S, 200 + i * 80, H - 30, 2.2);
    floorZone(S, 100, 1500, FLOOR + 50, H - 30); scatterFloor(S, 'farm', 10);
    rays(c, R, 400, 200, 'rgba(255,240,190,.2)', 7, .7, 1100, Math.PI * .35);
    fgFrame(S, 'beam', 'right'); fgFrame(S, 'plant', 'left');
  } },
};
THEMES.forEach((t, i) => { if (FARM_THEMES[t.key]) THEMES[i] = FARM_THEMES[t.key]; });

// Détails supplémentaires pour les décors existants
const EXTRAS = {
  hall: S => { fgFrame(S, 'drape', 'right'); },
  biblio: S => { fgFrame(S, 'plant', 'right'); },
  salon: S => { fgFrame(S, 'drape', 'left'); },
  curiosites: S => { fgFrame(S, 'plant', 'left'); },
  cuisine: S => { fgFrame(S, 'plant', 'left'); },
  grenier: S => { wallHangs(S, 430, 760, 150, 'attic', .8); fgFrame(S, 'beam', 'right'); },
  atelier: S => { fgFrame(S, 'drape', 'left'); },
  antiquaire: S => { fgFrame(S, 'drape', 'right'); },
  chambre: S => { fgFrame(S, 'plant', 'left'); },
  cave: S => { fgFrame(S, 'beam', 'left'); },
  cafe: S => { fgFrame(S, 'plant', 'right'); },
  serre: S => { fgFrame(S, 'plant', 'left'); },
  terrasse: S => { fgFrame(S, 'plant', 'right'); },
  port: S => { fgFrame(S, 'beam', 'right'); },
  marche: S => { fgFrame(S, 'plant', 'left'); },
  detective: S => { wallHangs(S, 1000, 1060, 120, 'attic', 1); fgFrame(S, 'plant', 'left'); },
  theatre: S => { fgFrame(S, 'drape', 'right'); },
};
THEMES.forEach(t => { const ex = EXTRAS[t.key]; if (ex) { const base = t.paint; t.paint = S => { base(S); ex(S); }; } });
