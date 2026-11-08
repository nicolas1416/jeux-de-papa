// Décors procéduraux en paysage (2:1) : pièces chargées façon « objets cachés »
'use strict';
const W = 1600, H = 800, FLOOR = 540, VX = 800, VY = 250;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rnd = (R, a, b) => a + R() * (b - a);
const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/* ——— Outils de dessin ——— */
function fillV(c, y0, y1, stops, x0, x1) { x0 = x0 || 0; x1 = x1 || W; c.fillStyle = LG(c, 0, y0, 0, y1, stops); c.fillRect(x0, y0, x1 - x0, y1 - y0); }
function blobPath(c, R, x, y, r, irr, n) {
  n = n || 12; c.beginPath();
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i * TAU / n, rr = r * (1 + (R() - .5) * irr); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8]); }
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    i ? c.quadraticCurveTo(p[0], p[1], mx, my) : c.moveTo(mx, my);
  }
  c.closePath();
}
function noise(c, alpha, R) {
  const n = document.createElement('canvas'); n.width = n.height = 128;
  const x = n.getContext('2d'), id = x.createImageData(128, 128);
  for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  c.save(); c.globalAlpha = alpha; c.globalCompositeOperation = 'overlay';
  c.fillStyle = c.createPattern(n, 'repeat'); c.fillRect(0, 0, W, H); c.restore();
}
function rays(c, R, x, y, col, n, spread, len, dir) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const a = (dir === undefined ? Math.PI / 2 : dir) + (R() - .5) * spread, w = rnd(R, .02, .05);
    c.fillStyle = LG(c, x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, [col, 'rgba(0,0,0,0)']);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - w) * len, y + Math.sin(a - w) * len); c.lineTo(x + Math.cos(a + w) * len, y + Math.sin(a + w) * len); c.fill();
  }
  c.restore();
}
function glow(c, x, y, r, col) {
  c.save(); c.globalCompositeOperation = 'screen';
  c.fillStyle = RG(c, x, y, 0, x, y, r, [col, 'rgba(0,0,0,0)']); circ(c, x, y, r); c.fill(); c.restore();
}
function dust(c, R, n, x0, y0, x1, y1) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) { c.fillStyle = `rgba(255,236,200,${rnd(R, .1, .5)})`; circ(c, rnd(R, x0, x1), rnd(R, y0, y1), rnd(R, .6, 2.2)); c.fill(); }
  c.restore();
}
function leaf(c, x, y, s, a, c1, c2) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = LG(c, 0, -s * .5, 0, s * .5, [c1, c2]);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * .5, -s * .45, s * 1.1, 0); c.quadraticCurveTo(s * .5, s * .45, 0, 0); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 1.05, 0); c.stroke();
  c.restore();
}
function foliage(c, R, x, y, r, n, greens) {
  for (let i = 0; i < n; i++) {
    const a = rnd(R, -Math.PI, Math.PI), d = rnd(R, 0, r * .6), g = pick(R, greens);
    leaf(c, x + Math.cos(a) * d * .4, y + Math.sin(a) * d * .3, rnd(R, r * .35, r * .7), a, g[0], g[1]);
  }
}
const GREENS = [['#5d8a3a', '#2c4a1a'], ['#7aa04a', '#3a5a20'], ['#4a7a40', '#1f3a1a'], ['#8ab05a', '#4a6a2a']];

/* ——— Accessoires posés sur les surfaces (x = bord gauche, y = bas) ——— */
const MUTED = ['#7a2e2a', '#2e4a6a', '#5a6a2e', '#8a6a2a', '#4a2e5a', '#2e5a4a', '#9a5a3a', '#3a3a4a', '#6a4a3a', '#a08050'];
const P = {
  books(S, x, y, s) {
    const c = S.c, R = S.R; let w = 0; const n = 2 + Math.floor(R() * 6);
    for (let i = 0; i < n; i++) {
      const bw = rnd(R, 7, 14) * s, bh = rnd(R, 44, 70) * s, col = pick(R, MUTED);
      c.fillStyle = LG(c, x + w, 0, x + w + bw, 0, [shade(col, .6), col, shade(col, 1.15), shade(col, .55)]);
      c.fillRect(x + w, y - bh, bw, bh);
      c.fillStyle = 'rgba(220,185,110,.7)'; c.fillRect(x + w + 1, y - bh + 5 * s, bw - 2, 1.5 * s); c.fillRect(x + w + 1, y - 8 * s, bw - 2, 1.5 * s);
      w += bw + .5;
    }
    if (R() < .4) { c.save(); c.translate(x + w + 2, y); c.rotate(-.35); const col = pick(R, MUTED), bh = rnd(R, 50, 66) * s; c.fillStyle = LG(c, 0, 0, 10 * s, 0, [shade(col, .6), col]); c.fillRect(0, -bh, 11 * s, bh); c.restore(); w += 22 * s; }
    return w;
  },
  stack(S, x, y, s) {
    const c = S.c, R = S.R; let yy = y; const n = 2 + Math.floor(R() * 4); let mw = 0;
    for (let i = 0; i < n; i++) {
      const bw = rnd(R, 38, 60) * s, bh = rnd(R, 7, 11) * s, col = pick(R, MUTED), dx = rnd(R, -5, 5) * s;
      c.fillStyle = '#e8dcc0'; c.fillRect(x + dx + 2, yy - bh + 1, bw - 3, bh - 2);
      c.fillStyle = LG(c, 0, yy - bh, 0, yy, [shade(col, 1.2), col, shade(col, .6)]);
      c.fillRect(x + dx, yy - bh, 4 * s, bh); c.fillRect(x + dx, yy - bh, bw, 2 * s); c.fillRect(x + dx, yy - 2 * s, bw, 2 * s);
      yy -= bh; mw = Math.max(mw, bw);
    }
    return mw + 6;
  },
  bottle(S, x, y, s) {
    if (S.avoid.has('bouteille')) return P.jar(S, x, y, s);
    const c = S.c, R = S.R, h = rnd(R, 40, 64) * s, w = h * .28, col = pick(R, ['#1f4a2a', '#4a2a1a', '#2a3a5a', '#6a5a2a', '#3a1a2a']);
    c.fillStyle = LG(c, x, 0, x + w, 0, [shade(col, .7), shade(col, 1.6), col, shade(col, .5)]);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h * .62); c.quadraticCurveTo(x, y - h * .75, x + w * .36, y - h * .8); c.lineTo(x + w * .36, y - h);
    c.lineTo(x + w * .64, y - h); c.lineTo(x + w * .64, y - h * .8); c.quadraticCurveTo(x + w, y - h * .75, x + w, y - h * .62); c.lineTo(x + w, y); c.closePath(); c.fill();
    if (R() < .7) { c.fillStyle = pick(R, ['#e8dcc0', '#d8c8a0', '#c0b090']); c.fillRect(x + 1, y - h * .5, w - 2, h * .22); }
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + w * .2, y - h * .6, w * .12, h * .5);
    return w + 4;
  },
  jar(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 18, 30) * s, h = rnd(R, 22, 40) * s;
    const fill = pick(R, ['#c86a2a', '#7a3a2a', '#d8c070', '#8a9a5a', '#a03a4a', '#5a3a2a']);
    c.fillStyle = LG(c, x, 0, x + w, 0, [shade(fill, .6), fill, shade(fill, 1.2), shade(fill, .5)]); rrect(c, x, y - h, w, h, 4 * s); c.fill();
    c.fillStyle = 'rgba(230,240,240,.25)'; rrect(c, x, y - h, w, h, 4 * s); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x + w * .18, y - h * .85, 2 * s, h * .6);
    c.fillStyle = LG(c, x, 0, x + w, 0, ['#6a4a2a', '#a07a4a', '#5a3a1a']); c.fillRect(x - 1, y - h - 5 * s, w + 2, 6 * s);
    if (R() < .5) { c.fillStyle = '#efe4c8'; c.fillRect(x + 3, y - h * .55, w - 6, h * .25); }
    return w + 3;
  },
  vase(S, x, y, s) {
    const c = S.c, R = S.R, h = rnd(R, 36, 60) * s, w = h * rnd(R, .45, .65), col = pick(R, ['#2a5a7a', '#c8b89a', '#7a3a3a', '#e8e0d0', '#3a6a5a', '#b88a3a']);
    c.fillStyle = LG(c, x, 0, x + w, 0, [shade(col, .55), shade(col, 1.3), col, shade(col, .5)]);
    c.beginPath(); c.moveTo(x + w * .3, y - h); c.lineTo(x + w * .7, y - h); c.quadraticCurveTo(x + w * .6, y - h * .75, x + w, y - h * .45); c.quadraticCurveTo(x + w * 1.05, y - h * .1, x + w * .75, y);
    c.lineTo(x + w * .25, y); c.quadraticCurveTo(x - w * .05, y - h * .1, x, y - h * .45); c.quadraticCurveTo(x + w * .4, y - h * .75, x + w * .3, y - h); c.fill();
    c.strokeStyle = 'rgba(220,190,120,.6)'; c.lineWidth = 1.5 * s; c.beginPath(); c.moveTo(x + 2, y - h * .45); c.lineTo(x + w - 2, y - h * .45); c.stroke();
    if (R() < .5 && !S.avoid.has('fleur')) {
      for (let i = 0; i < 5; i++) { const fx = x + w / 2 + rnd(R, -w * .6, w * .6), fy = y - h - rnd(R, 6, 26) * s; c.strokeStyle = '#3a5a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + w / 2, y - h); c.lineTo(fx, fy); c.stroke(); c.fillStyle = pick(R, ['#e8a0b0', '#f0e0e8', '#d84a5a', '#f0c060', '#b090d0']); circ(c, fx, fy, rnd(R, 3, 6) * s); c.fill(); }
    } else if (R() < .4) foliage(c, R, x + w / 2, y - h - 6 * s, 26 * s, 8, GREENS);
    return w + 5;
  },
  box(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 30, 56) * s, h = rnd(R, 16, 30) * s, col = pick(R, ['#7a5a3a', '#5a3a2a', '#8a2a2a', '#2a4a5a', '#a08060', '#3a2a1a']);
    c.fillStyle = LG(c, 0, y - h, 0, y, [shade(col, 1.3), col, shade(col, .6)]); c.fillRect(x, y - h, w, h);
    c.fillStyle = shade(col, 1.5); c.fillRect(x - 1, y - h - 3 * s, w + 2, 4 * s);
    c.fillStyle = 'rgba(220,180,90,.8)'; c.fillRect(x + w / 2 - 2 * s, y - h * .6, 4 * s, 4 * s);
    if (R() < .4) { c.strokeStyle = 'rgba(210,170,90,.6)'; c.lineWidth = 1; c.strokeRect(x + 3, y - h + 3, w - 6, h - 6); }
    return w + 4;
  },
  plate(S, x, y, s) {
    const c = S.c, R = S.R, r = rnd(R, 16, 26) * s;
    c.fillStyle = '#4a3020'; c.fillRect(x + r - 2, y - 6 * s, 4 * s, 6 * s);
    c.fillStyle = RG(c, x + r * .8, y - r * 1.3, 1, x + r, y - r - 4, r, ['#ffffff', '#e8e4dc', '#b8b0a0']); circ(c, x + r, y - r - 4 * s, r); c.fill();
    c.strokeStyle = pick(R, ['#2a5a9a', '#9a2a2a', '#3a7a5a', '#b08a3a']); c.lineWidth = 2 * s; circ(c, x + r, y - r - 4 * s, r * .75); c.stroke();
    return r * 2 + 4;
  },
  candles(S, x, y, s) {
    if (S.avoid.has('bougie')) return P.box(S, x, y, s);
    const c = S.c, R = S.R, h = rnd(R, 40, 60) * s;
    c.fillStyle = gold(c, x - 8, y - h, x + 8, y); c.fillRect(x + 6 * s, y - h * .7, 4 * s, h * .7); ell(c, x + 8 * s, y - 2, 9 * s, 3 * s); c.fill(); ell(c, x + 8 * s, y - h * .7, 6 * s, 2 * s); c.fill();
    c.fillStyle = '#f2ead6'; c.fillRect(x + 5 * s, y - h, 6 * s, h * .3);
    c.fillStyle = '#ffd36a'; ell(c, x + 8 * s, y - h - 5 * s, 2.5 * s, 5 * s); c.fill();
    S.lights.push([x + 8 * s, y - h - 5 * s, 40 * s]);
    return 18 * s;
  },
  frame(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 24, 38) * s, h = w * rnd(R, 1.1, 1.35);
    c.save(); c.translate(x, y); c.rotate(rnd(R, -.12, .05));
    c.fillStyle = gold(c, 0, -h, w, 0); c.fillRect(0, -h, w, h);
    c.fillStyle = LG(c, 0, -h, 0, 0, [pick(R, ['#8aa0b8', '#c8b8a0', '#a8b890']), pick(R, ['#3a4a3a', '#5a4a3a', '#2a3a4a'])]); c.fillRect(4 * s, -h + 4 * s, w - 8 * s, h - 8 * s);
    c.fillStyle = 'rgba(30,20,10,.5)'; ell(c, w / 2, -h * .45, w * .18, h * .2); c.fill();
    c.restore();
    return w + 6;
  },
  lamp(S, x, y, s) {
    const c = S.c, R = S.R, h = rnd(R, 50, 70) * s, sh = pick(R, ['#e8d0a0', '#2a6a4a', '#c86a4a', '#e8e0d0']);
    c.fillStyle = gold(c, x, y - h, x + 30 * s, y); ell(c, x + 15 * s, y - 2, 12 * s, 3.5 * s); c.fill(); c.fillRect(x + 13.5 * s, y - h * .62, 3 * s, h * .62);
    c.fillStyle = LG(c, x, 0, x + 30 * s, 0, [shade(sh, .7), sh, shade(sh, .6)]);
    c.beginPath(); c.moveTo(x + 6 * s, y - h); c.lineTo(x + 24 * s, y - h); c.lineTo(x + 32 * s, y - h * .6); c.lineTo(x - 2 * s, y - h * .6); c.closePath(); c.fill();
    S.lights.push([x + 15 * s, y - h * .6, 90 * s]);
    return 34 * s;
  },
  plant(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 20, 30) * s, h = w * .9;
    c.fillStyle = LG(c, x, 0, x + w, 0, ['#8a4a2a', '#c87a4a', '#7a3a1a']); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y - h); c.lineTo(x + w * .82, y); c.lineTo(x + w * .18, y); c.fill();
    foliage(c, R, x + w / 2, y - h - 8 * s, 34 * s, 12, GREENS);
    return w + 8;
  },
  bust(S, x, y, s) {
    const c = S.c, h = 52 * s;
    c.fillStyle = LG(c, x, 0, x + 34 * s, 0, ['#9a968c', '#f0ece4', '#b8b4aa']);
    c.fillRect(x + 6 * s, y - 10 * s, 22 * s, 10 * s);
    c.beginPath(); c.moveTo(x, y - 10 * s); c.quadraticCurveTo(x + 17 * s, y - 34 * s, x + 34 * s, y - 10 * s); c.fill();
    c.fillRect(x + 13 * s, y - 34 * s, 8 * s, 8 * s); ell(c, x + 17 * s, y - h + 10 * s, 9 * s, 12 * s); c.fill();
    return 38 * s;
  },
  scrolls(S, x, y, s) {
    const c = S.c, R = S.R; const n = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const yy = y - 5 * s - i * 9 * s, w = rnd(R, 40, 56) * s, dx = rnd(R, -4, 4) * s; c.fillStyle = LG(c, 0, yy - 5 * s, 0, yy + 5 * s, ['#f6ecd0', '#d8c8a0', '#a89870']); rrect(c, x + dx, yy - 4.5 * s, w, 9 * s, 4.5 * s); c.fill(); c.fillStyle = '#8a6a3a'; ell(c, x + dx + w, yy, 2.5 * s, 4.5 * s); c.fill(); }
    return 60 * s;
  },
  bowl(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 40, 54) * s;
    const fr = [['#d8402a', '#7a1010'], ['#f0a020', '#904a00'], ['#9ac040', '#3a6010'], ['#7a2a6a', '#3a0a2a']];
    for (let i = 0; i < 6; i++) { const f = pick(R, fr), fx = x + w * .2 + R() * w * .6, fy = y - 12 * s - R() * 10 * s; c.fillStyle = RG(c, fx - 3, fy - 3, 1, fx, fy, 9 * s, ['#fff0d0', f[0], f[1]]); circ(c, fx, fy, 8 * s); c.fill(); }
    c.fillStyle = LG(c, x, 0, x + w, 0, ['#8a6a4a', '#d8c0a0', '#7a5a3a']); c.beginPath(); c.moveTo(x, y - 14 * s); c.lineTo(x + w, y - 14 * s); c.quadraticCurveTo(x + w * .9, y, x + w * .5, y); c.quadraticCurveTo(x + w * .1, y, x, y - 14 * s); c.fill();
    return w + 4;
  },
  basket(S, x, y, s) {
    const c = S.c, R = S.R, w = rnd(R, 44, 64) * s, h = w * .55;
    c.fillStyle = LG(c, 0, y - h, 0, y, ['#c8a060', '#8a6030']); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y - h); c.lineTo(x + w * .9, y); c.lineTo(x + w * .1, y); c.fill();
    c.strokeStyle = 'rgba(80,50,20,.45)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x + w * .05, y - h * i / 5); c.lineTo(x + w * .95, y - h * i / 5); c.stroke(); }
    for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(x + w * i / 8, y - h); c.lineTo(x + w * (.1 + .8 * i / 8), y); c.stroke(); }
    c.strokeStyle = '#8a6030'; c.lineWidth = 3 * s; c.beginPath(); c.arc(x + w / 2, y - h, w * .35, Math.PI, 0); c.stroke();
    return w + 4;
  },
};
const PROP_SETS = {
  manor: ['books', 'stack', 'vase', 'box', 'frame', 'candles', 'bust', 'plate', 'lamp', 'jar'],
  kitchen: ['jar', 'jar', 'plate', 'bowl', 'basket', 'bottle', 'box', 'vase'],
  study: ['books', 'stack', 'stack', 'scrolls', 'lamp', 'frame', 'box', 'jar'],
  shop: ['vase', 'box', 'frame', 'bust', 'plate', 'candles', 'jar', 'bottle', 'stack', 'basket'],
  cellar: ['bottle', 'bottle', 'jar', 'box', 'candles', 'basket'],
  garden: ['plant', 'plant', 'vase', 'basket', 'jar', 'bowl'],
  lab: ['jar', 'jar', 'bottle', 'stack', 'scrolls', 'box', 'lamp'],
};
function fillSurface(S, s, set, density) {
  const R = S.R, kinds = PROP_SETS[set];
  let x = s.x0 + rnd(R, 0, 14);
  while (x < s.x1 - 24 * s.sc) {
    if (R() > density) { x += rnd(R, 24, 70) * s.sc; continue; }
    const w = P[pick(R, kinds)](S, x, s.y, s.sc);
    x += w + rnd(R, 2, 12) * s.sc;
  }
}
function surface(S, x0, x1, y, sc, kind) { S.surf.push({ x0, x1, y, sc, kind: kind || 'shelf' }); }

/* ——— Murs et sols ——— */
function wall(S, y0, y1, style, a, b) {
  const c = S.c, R = S.R;
  fillV(c, y0, y1, [a, b]);
  c.save();
  if (style === 'stripes') {
    for (let x = 0; x < W; x += 52) { c.fillStyle = 'rgba(255,240,210,.07)'; c.fillRect(x, y0, 24, y1 - y0); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + 24, y0, 2, y1 - y0); }
  } else if (style === 'damask') {
    c.fillStyle = 'rgba(255,235,190,.09)';
    for (let y = y0 + 20; y < y1; y += 64) for (let x = (Math.floor((y - y0) / 64) % 2) * 40; x < W; x += 80) {
      c.beginPath(); c.moveTo(x, y - 22); c.quadraticCurveTo(x + 14, y - 6, x, y + 22); c.quadraticCurveTo(x - 14, y - 6, x, y - 22); c.fill();
      circ(c, x - 12, y, 4); c.fill(); circ(c, x + 12, y, 4); c.fill();
    }
  } else if (style === 'panels') {
    for (let x = 10; x < W; x += 200) { c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 4; c.strokeRect(x, y0 + 30, 180, y1 - y0 - 60); c.strokeStyle = 'rgba(255,220,170,.1)'; c.lineWidth = 2; c.strokeRect(x + 6, y0 + 36, 168, y1 - y0 - 72); }
  } else if (style === 'brick') {
    for (let y = y0, row = 0; y < y1; y += 26, row++) for (let x = (row % 2) * -30; x < W; x += 60) {
      c.fillStyle = R() < .5 ? `rgba(255,200,160,${rnd(R, .03, .1)})` : `rgba(0,0,0,${rnd(R, .03, .12)})`; c.fillRect(x + 2, y + 2, 56, 22);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 58, 24);
    }
  } else if (style === 'tiles') {
    for (let y = y0; y < y1; y += 40) for (let x = 0; x < W; x += 40) { c.fillStyle = `rgba(255,255,255,${rnd(R, 0, .08)})`; c.fillRect(x + 1, y + 1, 38, 38); c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 1.5; c.strokeRect(x, y, 40, 40); }
  } else if (style === 'planks') {
    for (let x = 0; x < W; x += rnd(R, 50, 80)) { c.fillStyle = `rgba(0,0,0,${rnd(R, 0, .15)})`; c.fillRect(x, y0, 60, y1 - y0); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x, y0, 2, y1 - y0); }
    c.strokeStyle = 'rgba(30,15,5,.2)'; c.lineWidth = 1; for (let i = 0; i < 80; i++) { const x = rnd(R, 0, W), y = rnd(R, y0, y1); c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(R, -2, 2), y + rnd(R, 20, 60)); c.stroke(); }
  } else if (style === 'plaster') {
    for (let i = 0; i < 40; i++) { blobPath(c, R, rnd(R, 0, W), rnd(R, y0, y1), rnd(R, 30, 120), .6, 9); c.fillStyle = R() < .5 ? 'rgba(0,0,0,.04)' : 'rgba(255,240,200,.04)'; c.fill(); }
  }
  c.restore();
  fillV(c, y0, y1, ['rgba(0,0,0,.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.25)']);
}
function wainscot(S, y0, y1, a, b) {
  const c = S.c;
  fillV(c, y0, y1, [a, b]);
  for (let x = 14; x < W; x += 160) { c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; c.strokeRect(x, y0 + 16, 140, y1 - y0 - 30); c.strokeStyle = 'rgba(255,255,255,.08)'; c.strokeRect(x + 5, y0 + 21, 130, y1 - y0 - 40); }
  c.fillStyle = shade(a, 1.15); c.fillRect(0, y0 - 6, W, 10); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, y0 + 4, W, 3);
}
function floor(S, style, a, b) {
  const c = S.c, R = S.R, y0 = FLOOR;
  fillV(c, y0, H, [a, b]);
  const xAt = (xb, y) => VX + (xb - VX) * (y - VY) / (H - VY);
  const rowY = k => y0 + (H - y0) * Math.pow(k, 1.5);
  if (style === 'planks' || style === 'parquet') {
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 2;
    for (let i = -30; i <= 30; i++) { const xb = VX + i * 70; c.beginPath(); c.moveTo(xAt(xb, y0), y0); c.lineTo(xb, H); c.stroke(); }
    for (let k = 1; k < 12; k++) { const y = rowY(k / 12); c.globalAlpha = .35; for (let i = -30; i <= 30; i += 2) { const xb = VX + (i + (k % 2)) * 70; c.beginPath(); c.moveTo(xAt(xb, y), y); c.lineTo(xAt(xb + 70, y), y); c.stroke(); } c.globalAlpha = 1; }
    if (style === 'parquet') { c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = LG(c, 0, y0, 0, H, ['rgba(255,240,200,.18)', 'rgba(255,240,200,0)']); c.fillRect(0, y0, W, H - y0); c.restore(); }
  } else if (style === 'checker' || style === 'tiles') {
    const n = 12;
    for (let k = 0; k < n; k++) {
      const ya = rowY(k / n), yb = rowY((k + 1) / n);
      for (let i = -24; i < 24; i++) {
        if (style === 'checker' && Math.abs(i + k) % 2) continue;
        const x0 = VX + i * 110, x1 = x0 + 110;
        c.fillStyle = style === 'checker' ? 'rgba(0,0,0,.55)' : `rgba(0,0,0,${rnd(R, .02, .1)})`;
        c.beginPath(); c.moveTo(xAt(x0, ya), ya); c.lineTo(xAt(x1, ya), ya); c.lineTo(xAt(x1, yb), yb); c.lineTo(xAt(x0, yb), yb); c.fill();
      }
    }
    if (style === 'tiles') { c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.5; for (let i = -24; i <= 24; i++) { c.beginPath(); c.moveTo(xAt(VX + i * 110, y0), y0); c.lineTo(VX + i * 110, H); c.stroke(); } for (let k = 1; k < n; k++) { const y = rowY(k / n); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  } else if (style === 'stone' || style === 'cobble') {
    for (let k = 0; k < 14; k++) { const y = rowY(k / 14) + 4, sc = .4 + k / 14; for (let x = (k % 2) * 30 * sc; x < W; x += 60 * sc) { blobPath(c, R, x, y, (style === 'cobble' ? 22 : 30) * sc, .3, 8); c.fillStyle = R() < .5 ? `rgba(255,240,210,${rnd(R, .04, .12)})` : `rgba(0,0,0,${rnd(R, .04, .14)})`; c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.5; c.stroke(); } }
  } else if (style === 'dirt') {
    for (let i = 0; i < 3000; i++) { c.fillStyle = R() < .5 ? 'rgba(255,240,200,.12)' : 'rgba(40,25,10,.16)'; c.fillRect(rnd(R, 0, W), rnd(R, y0, H), rnd(R, 1, 3), rnd(R, 1, 2)); }
    for (let i = 0; i < 18; i++) { blobPath(c, R, rnd(R, 0, W), rnd(R, y0 + 20, H), rnd(R, 30, 90), .6, 9); c.fillStyle = 'rgba(60,40,20,.08)'; c.fill(); }
  } else if (style === 'carpet') {
    c.strokeStyle = 'rgba(255,230,180,.12)'; c.lineWidth = 2;
    for (let k = 1; k < 10; k++) { const y = rowY(k / 10); for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y - 6); c.lineTo(x + 60, y); c.stroke(); } }
  }
  fillV(c, y0, y0 + 40, ['rgba(0,0,0,.45)', 'rgba(0,0,0,0)']);
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(0, y0 - 3, W, 6);
}
function rug(S, cx, cy, rx, ry, a, b) {
  const c = S.c;
  ell(c, cx, cy, rx, ry); c.fillStyle = RG(c, cx, cy, 5, cx, cy, rx, [a, b]); c.fill();
  c.strokeStyle = 'rgba(230,200,140,.5)'; c.lineWidth = 3; ell(c, cx, cy, rx * .85, ry * .8); c.stroke(); ell(c, cx, cy, rx * .5, ry * .45); c.stroke();
  c.setLineDash([4, 6]); ell(c, cx, cy, rx * .7, ry * .65); c.stroke(); c.setLineDash([]);
}
function floorZone(S, x0, x1, y0, y1) { S.floors.push({ x0, x1, y0: y0 || FLOOR + 30, y1: y1 || H - 20 }); }

/* ——— Mobilier ——— */
function bookcase(S, x, yb, w, h, wood, set, books) {
  const c = S.c, R = S.R;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .55), wood, shade(wood, 1.15), shade(wood, .55)]); c.fillRect(x, yb - h, w, h);
  c.fillStyle = shade(wood, 1.25); c.fillRect(x - 10, yb - h - 16, w + 20, 18); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x - 10, yb - h + 1, w + 20, 3);
  c.fillStyle = shade(wood, .32); c.fillRect(x + 12, yb - h + 12, w - 24, h - 30);
  const n = Math.max(3, Math.round((h - 40) / 92)), sh = (h - 30) / n;
  for (let i = 1; i <= n; i++) {
    const y = yb - h + 12 + i * sh;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 12, y - sh + 2, w - 24, 14);
    const s = { x0: x + 16, x1: x + w - 16, y: y - 8, sc: .85 };
    if (books !== false) {
      let xx = s.x0;
      while (xx < s.x1 - 20) {
        if (R() < .3) { xx += rnd(R, 30, 70); continue; }
        const ww = R() < .75 ? P.books(S, xx, s.y, Math.min(1, (sh - 12) / 72)) : P[pick(R, PROP_SETS[set])](S, xx, s.y, .8);
        xx += ww + rnd(R, 2, 10);
      }
    } else fillSurface(S, s, set, .8);
    c.fillStyle = LG(c, 0, y - 8, 0, y + 4, [shade(wood, 1.3), shade(wood, .7)]); c.fillRect(x + 10, y - 8, w - 20, 12);
    surface(S, s.x0, s.x1, s.y, .82);
  }
  c.fillStyle = shade(wood, .7); c.fillRect(x, yb - 14, w, 14);
}
function vitrine(S, x, yb, w, h, wood, set) {
  bookcase(S, x, yb, w, h, wood, set, false);
  const f = S.f;
  f.save(); f.globalAlpha = .55;
  f.fillStyle = LG(f, x, yb - h, x + w, yb, ['rgba(255,255,255,0)', 'rgba(220,235,240,.28)', 'rgba(255,255,255,0)', 'rgba(220,235,240,.18)', 'rgba(255,255,255,0)']);
  f.fillRect(x + 12, yb - h + 12, w - 24, h - 30);
  f.restore();
  f.strokeStyle = shade(wood, .8); f.lineWidth = 5; f.strokeRect(x + 12, yb - h + 12, (w - 24) / 2, h - 30); f.strokeRect(x + w / 2, yb - h + 12, (w - 24) / 2, h - 30);
}
function commode(S, x, yb, w, h, wood, set, dens) {
  const c = S.c;
  c.fillStyle = LG(c, 0, yb - h, 0, yb, [shade(wood, 1.15), wood, shade(wood, .55)]); c.fillRect(x, yb - h, w, h - 10);
  c.fillStyle = shade(wood, .5); c.fillRect(x + 6, yb - 12, 10, 12); c.fillRect(x + w - 16, yb - 12, 10, 12);
  const nd = Math.max(2, Math.round(h / 45));
  for (let i = 0; i < nd; i++) { const yy = yb - h + 14 + i * (h - 24) / nd; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.strokeRect(x + 10, yy, w - 20, (h - 24) / nd - 6); c.fillStyle = gold(c, 0, yy, 0, yy + 8); circ(c, x + w * .3, yy + (h - 24) / nd / 2 - 3, 4); c.fill(); circ(c, x + w * .7, yy + (h - 24) / nd / 2 - 3, 4); c.fill(); }
  c.fillStyle = LG(c, 0, yb - h - 8, 0, yb - h + 6, [shade(wood, 1.4), shade(wood, .8)]); c.fillRect(x - 8, yb - h - 6, w + 16, 12);
  const s = { x0: x, x1: x + w, y: yb - h - 6, sc: .92 }; fillSurface(S, s, set, dens || .6); surface(S, s.x0, s.x1, s.y, s.sc, 'top');
}
function fireplace(S, x, yb, w, h, stone, set) {
  const c = S.c, R = S.R;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(stone, .6), stone, shade(stone, 1.15), shade(stone, .6)]); c.fillRect(x, yb - h, w, h);
  const ox = x + w * .22, ow = w * .56, oh = h * .62;
  c.fillStyle = '#120a06'; c.beginPath(); c.moveTo(ox, yb); c.lineTo(ox, yb - oh * .7); c.quadraticCurveTo(ox + ow / 2, yb - oh * 1.1, ox + ow, yb - oh * .7); c.lineTo(ox + ow, yb); c.fill();
  for (let i = 0; i < 5; i++) { c.fillStyle = '#4a2a14'; c.save(); c.translate(ox + ow * .25 + i * ow * .12, yb - 12); c.rotate(rnd(R, -.3, .3)); c.fillRect(-30, -6, 60, 12); c.restore(); }
  glow(c, ox + ow / 2, yb - 20, ow * .6, 'rgba(255,140,40,.8)'); glow(c, ox + ow / 2, yb - 14, ow * .25, 'rgba(255,220,120,.9)');
  S.lights.push([ox + ow / 2, yb - 30, 260]);
  c.fillStyle = LG(c, 0, yb - h - 14, 0, yb - h + 8, [shade(stone, 1.35), shade(stone, .75)]); c.fillRect(x - 24, yb - h - 12, w + 48, 18);
  const s = { x0: x - 16, x1: x + w + 16, y: yb - h - 12, sc: .9 }; fillSurface(S, s, set, .65); surface(S, s.x0, s.x1, s.y, s.sc, 'top');
}
function grandClock(S, x, yb, h, wood) {
  const c = S.c, w = h * .2;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .5), wood, shade(wood, .5)]); c.fillRect(x, yb - h, w, h); c.fillRect(x - 6, yb - h - 10, w + 12, 12);
  c.fillStyle = gold(c, x, yb - h + 10, x + w, yb - h + 10 + w); circ(c, x + w / 2, yb - h + w * .7, w * .42); c.fill();
  c.fillStyle = '#f2ead6'; circ(c, x + w / 2, yb - h + w * .7, w * .34); c.fill();
  c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, yb - h + w * .7); c.lineTo(x + w / 2, yb - h + w * .45); c.moveTo(x + w / 2, yb - h + w * .7); c.lineTo(x + w * .68, yb - h + w * .78); c.stroke();
  c.fillStyle = 'rgba(10,6,4,.7)'; c.fillRect(x + w * .2, yb - h * .62, w * .6, h * .42);
  c.fillStyle = gold(c, x, 0, x + w, 0); circ(c, x + w / 2, yb - h * .3, w * .14); c.fill(); c.fillRect(x + w / 2 - 1, yb - h * .6, 2, h * .3);
}
function painting(S, x, y, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 6, y + 8, w, h);
  c.fillStyle = gold(c, x, y, x + w, y + h); c.fillRect(x, y, w, h);
  const ix = x + w * .09, iy = y + h * .09, iw = w * .82, ih = h * .82;
  const kind = Math.floor(R() * 3);
  c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
  if (kind === 0) { c.fillStyle = LG(c, 0, iy, 0, iy + ih, [pick(R, ['#c8d8e0', '#e8c8a0', '#a8b8c8']), '#e8dcc0']); c.fillRect(ix, iy, iw, ih); c.fillStyle = pick(R, ['#5a6a4a', '#4a5a6a', '#7a6a4a']); c.beginPath(); c.moveTo(ix, iy + ih * .7); c.quadraticCurveTo(ix + iw * .3, iy + ih * .4, ix + iw * .6, iy + ih * .62); c.quadraticCurveTo(ix + iw * .8, iy + ih * .5, ix + iw, iy + ih * .6); c.lineTo(ix + iw, iy + ih); c.lineTo(ix, iy + ih); c.fill(); }
  else if (kind === 1) { c.fillStyle = LG(c, 0, iy, 0, iy + ih, ['#3a2a1a', '#1a120a']); c.fillRect(ix, iy, iw, ih); c.fillStyle = '#d8b090'; ell(c, ix + iw / 2, iy + ih * .38, iw * .16, ih * .17); c.fill(); c.fillStyle = pick(R, ['#3a4a6a', '#6a2a2a', '#2a4a3a']); c.beginPath(); c.moveTo(ix + iw * .15, iy + ih); c.quadraticCurveTo(ix + iw / 2, iy + ih * .45, ix + iw * .85, iy + ih); c.fill(); c.fillStyle = '#2a1a10'; ell(c, ix + iw / 2, iy + ih * .27, iw * .17, ih * .1); c.fill(); }
  else { c.fillStyle = LG(c, 0, iy, 0, iy + ih, ['#1a2a3a', '#3a4a5a']); c.fillRect(ix, iy, iw, ih); for (let i = 0; i < 6; i++) { c.fillStyle = pick(R, ['#d84a5a', '#f0d070', '#e8e0f0', '#d880a0']); circ(c, ix + iw * rnd(R, .3, .7), iy + ih * rnd(R, .25, .6), iw * .08); c.fill(); } c.fillStyle = '#8a7050'; c.fillRect(ix + iw * .35, iy + ih * .62, iw * .3, ih * .3); }
  c.restore();
  c.strokeStyle = 'rgba(80,50,10,.5)'; c.lineWidth = 2; c.strokeRect(ix, iy, iw, ih);
}
function gallery(S, x0, x1, y0, y1) {
  const R = S.R;
  for (let k = 0; k < 40; k++) {
    const w = rnd(R, 50, 130), h = w * rnd(R, .7, 1.3), x = rnd(R, x0, x1 - w), y = rnd(R, y0, y1 - h);
    if (y + h > y1 || S.galleryRects.some(r => x < r[2] + 10 && x + w > r[0] - 10 && y < r[3] + 10 && y + h > r[1] - 10)) continue;
    S.galleryRects.push([x, y, x + w, y + h]);
    if (R() < .2) { const c = S.c, r = Math.min(w, h) * .5; c.fillStyle = gold(c, x, y, x + 2 * r, y + 2 * r); circ(c, x + r, y + r, r); c.fill(); c.fillStyle = '#c8bca8'; circ(c, x + r, y + r, r * .8); c.fill(); }
    else painting(S, x, y, w, h);
  }
}
function wallShelf(S, x, y, w, wood, set, dens) {
  const c = S.c;
  const s = { x0: x + 4, x1: x + w - 4, y, sc: .78 }; fillSurface(S, s, set, dens || .8);
  c.fillStyle = LG(c, 0, y, 0, y + 12, [shade(wood, 1.3), shade(wood, .7)]); c.fillRect(x, y, w, 12);
  c.fillStyle = shade(wood, .6); c.beginPath(); c.moveTo(x + 14, y + 12); c.lineTo(x + 30, y + 12); c.lineTo(x + 14, y + 34); c.fill(); c.beginPath(); c.moveTo(x + w - 14, y + 12); c.lineTo(x + w - 30, y + 12); c.lineTo(x + w - 14, y + 34); c.fill();
  surface(S, s.x0, s.x1, y, s.sc);
}
function chandelier(S, x, y, r) {
  const c = S.c, f = S.f;
  c.strokeStyle = '#3a2a14'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y - r * .3); c.stroke();
  c.strokeStyle = gold(c, x - r, y, x + r, y + r * .4); c.lineWidth = 5;
  for (let i = 0; i < 2; i++) { ell(c, x, y + i * r * .25, r * (1 - i * .3), r * .22 * (1 - i * .3)); c.stroke(); }
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .22; c.fillStyle = '#f2ead6'; c.fillRect(px - 3, py - 16, 6, 14); glow(c, px, py - 20, 30, 'rgba(255,220,150,.9)'); }
  for (let i = 0; i < 14; i++) { const a = i * TAU / 14, px = x + Math.cos(a) * r * .8, py = y + r * .2 + Math.sin(a) * r * .15; f.strokeStyle = 'rgba(230,240,255,.5)'; f.lineWidth = 1; f.beginPath(); f.moveTo(px, py); f.lineTo(px, py + 14); f.stroke(); f.fillStyle = 'rgba(240,248,255,.7)'; ell(f, px, py + 17, 2.5, 4); f.fill(); }
  glow(c, x, y, r * 2.2, 'rgba(255,210,140,.35)');
  S.lights.push([x, y, r * 4]);
}
function sconce(S, x, y) {
  const c = S.c;
  c.fillStyle = gold(c, x - 10, y - 10, x + 10, y + 20); c.fillRect(x - 4, y - 6, 8, 26); ell(c, x, y + 20, 12, 4); c.fill();
  c.fillStyle = 'rgba(255,230,180,.9)'; c.beginPath(); c.moveTo(x - 14, y - 4); c.lineTo(x + 14, y - 4); c.lineTo(x + 8, y - 24); c.lineTo(x - 8, y - 24); c.fill();
  glow(c, x, y - 14, 110, 'rgba(255,200,120,.45)'); S.lights.push([x, y - 14, 200]);
}
function windowArch(S, x, y, w, h, sky, frameCol, curtain) {
  const c = S.c, R = S.R, f = S.f;
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x - 14, y - 6, w + 28, h + 22);
  const path = () => { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); };
  c.save(); path(); c.clip();
  fillV(c, y, y + h, sky, x, x + w);
  c.fillStyle = 'rgba(60,90,60,.55)'; for (let i = 0; i < 8; i++) { blobPath(c, R, x + rnd(R, 0, w), y + h * rnd(R, .6, .95), rnd(R, 30, 70), .5, 9); c.fill(); }
  c.restore();
  c.strokeStyle = frameCol; c.lineWidth = 10; path(); c.stroke();
  c.lineWidth = 5; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); for (let k = 1; k < 4; k++) { c.moveTo(x, y + w / 2 + k * (h - w / 2) / 4); c.lineTo(x + w, y + w / 2 + k * (h - w / 2) / 4); } c.stroke();
  c.fillStyle = shade(frameCol, 1.1); c.fillRect(x - 18, y + h, w + 36, 12);
  surface(S, x - 10, x + w + 10, y + h, .8);
  rays(c, R, x + w / 2, y + h * .4, 'rgba(255,240,200,.14)', 6, .7, 900, Math.PI * .62);
  S.lights.push([x + w / 2, y + h / 2, w * 1.4]);
  if (curtain) {
    const drape = (xa, xb) => {
      const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      f.fillStyle = LG(f, lo, 0, hi, 0, [shade(curtain, .45), curtain, shade(curtain, .7), shade(curtain, 1.2), shade(curtain, .5)]);
      const mid = xa + (xb - xa) * .45;
      f.beginPath(); f.moveTo(xa, y - 30); f.lineTo(xb, y - 30); f.quadraticCurveTo(xb, y + h * .35, mid, y + h * .55); f.quadraticCurveTo(xb, y + h * .8, xb, y + h + 60); f.lineTo(xa, y + h + 60); f.closePath(); f.fill();
      f.strokeStyle = 'rgba(0,0,0,.25)'; f.lineWidth = 2;
      for (let k = 1; k < 4; k++) { const xx = xa + (xb - xa) * k / 4; f.beginPath(); f.moveTo(xx, y - 30); f.quadraticCurveTo(xa + (mid - xa) * k / 4, y + h * .55, xx, y + h + 60); f.stroke(); }
      f.fillStyle = gold(f, mid - 10, 0, mid + 10, 0); f.fillRect(Math.min(xa, mid) , y + h * .52, Math.abs(mid - xa) + 6, 8);
    };
    drape(x - 60, x + 50); drape(x + w + 60, x + w - 50);
    f.fillStyle = gold(f, x - 70, y - 40, x + w + 70, y - 30); f.fillRect(x - 70, y - 40, w + 140, 8);
  }
}
function door(S, x, yb, w, h, wood) {
  const c = S.c;
  c.fillStyle = shade(wood, .5); c.fillRect(x - 16, yb - h - 16, w + 32, h + 16);
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .7), wood, shade(wood, .8)]);
  c.beginPath(); c.moveTo(x, yb); c.lineTo(x, yb - h + w / 2); c.arc(x + w / 2, yb - h + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, yb); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w / 2, yb - h + 10); c.lineTo(x + w / 2, yb); c.stroke();
  [[.1, .3], [.55, .3], [.1, .62], [.55, .62]].forEach(p => c.strokeRect(x + w * p[0], yb - h + h * p[1], w * .35, h * .26));
  c.fillStyle = gold(c, x, 0, x + 10, 10); circ(c, x + w * .44, yb - h * .45, 6); c.fill(); circ(c, x + w * .56, yb - h * .45, 6); c.fill();
}
function stairs(S, x, yb, w, h, n, wood, carpet) {
  const c = S.c, f = S.f, sw = w / n, sh = h / n;
  for (let i = 0; i < n; i++) {
    const sx = x + i * sw * .55, sy = yb - i * sh, ex = x + w;
    c.fillStyle = LG(c, 0, sy - sh, 0, sy, [shade(wood, 1.2), shade(wood, .55)]); c.fillRect(sx, sy - sh, ex - sx, sh);
    if (carpet) { c.fillStyle = LG(c, 0, sy - sh, 0, sy, [shade(carpet, 1.2), shade(carpet, .6)]); c.fillRect(sx + (ex - sx) * .3, sy - sh, (ex - sx) * .45, sh); c.fillStyle = gold(c, 0, sy - sh, 0, sy); c.fillRect(sx + (ex - sx) * .3, sy - sh + 2, (ex - sx) * .45, 2); }
    c.fillStyle = shade(wood, 1.4); c.fillRect(sx, sy - sh, ex - sx, 4);
    if (i % 3 === 1) surface(S, sx + 30, ex - 20, sy - sh + 2, .82 - i * .015, 'step');
  }
  const hx0 = x - 10, hy0 = yb - 120, hx1 = x + (n - 1) * sw * .55, hy1 = yb - h - 90;
  f.strokeStyle = shade(wood, .6); f.lineWidth = 9; f.lineCap = 'round';
  f.beginPath(); f.moveTo(hx0, hy0); f.lineTo(hx1, hy1); f.stroke();
  f.lineWidth = 4;
  for (let i = 0; i < n; i++) { const bx = x + i * sw * .55 + 6, by = yb - i * sh - sh, t = (bx - hx0) / (hx1 - hx0); f.beginPath(); f.moveTo(bx, by); f.lineTo(bx, hy0 + t * (hy1 - hy0)); f.stroke(); }
  f.lineCap = 'butt';
  f.fillStyle = LG(f, x - 30, 0, x + 10, 0, [shade(wood, .5), wood, shade(wood, .5)]); f.fillRect(x - 28, yb - 150, 30, 150); f.fillStyle = gold(f, x - 30, yb - 180, x, yb - 150); circ(f, x - 13, yb - 160, 13); f.fill();
}
function table(S, cx, yb, w, h, wood, cloth, set, dens) {
  const c = S.c;
  if (cloth) {
    c.fillStyle = LG(c, cx - w / 2, 0, cx + w / 2, 0, [shade(cloth, .6), cloth, shade(cloth, 1.15), shade(cloth, .6)]);
    c.beginPath(); c.moveTo(cx - w / 2, yb - h); c.lineTo(cx + w / 2, yb - h); c.quadraticCurveTo(cx + w * .55, yb - h * .3, cx + w * .56, yb); c.lineTo(cx - w * .56, yb); c.quadraticCurveTo(cx - w * .55, yb - h * .3, cx - w / 2, yb - h); c.fill();
  } else {
    c.fillStyle = shade(wood, .55); c.fillRect(cx - w * .45, yb - h, 12, h); c.fillRect(cx + w * .45 - 12, yb - h, 12, h);
    c.fillStyle = shade(wood, .7); c.fillRect(cx - w / 2 + 6, yb - h, w - 12, 22);
  }
  c.fillStyle = LG(c, 0, yb - h - 26, 0, yb - h, [shade(wood, 1.25), wood]);
  c.beginPath(); c.moveTo(cx - w / 2 + 30, yb - h - 26); c.lineTo(cx + w / 2 - 30, yb - h - 26); c.lineTo(cx + w / 2, yb - h); c.lineTo(cx - w / 2, yb - h); c.fill();
  c.fillStyle = shade(wood, .6); c.fillRect(cx - w / 2, yb - h, w, 6);
  const s = { x0: cx - w / 2 + 20, x1: cx + w / 2 - 20, y: yb - h - 4, sc: 1.05 }; fillSurface(S, s, set, dens || .5); surface(S, s.x0, s.x1, s.y, s.sc, 'top');
}
function sofa(S, x, yb, w, h, col) {
  const c = S.c;
  c.fillStyle = LG(c, 0, yb - h, 0, yb, [shade(col, 1.1), shade(col, .55)]); rrect(c, x, yb - h, w, h * .6, 20); c.fill();
  c.fillStyle = LG(c, 0, yb - h * .5, 0, yb, [shade(col, 1.25), shade(col, .6)]); rrect(c, x - 10, yb - h * .5, w + 20, h * .42, 14); c.fill();
  rrect(c, x - 26, yb - h * .65, 46, h * .6, 18); c.fill(); rrect(c, x + w - 20, yb - h * .65, 46, h * .6, 18); c.fill();
  c.fillStyle = '#2a1a0a'; c.fillRect(x + 10, yb - 10, 10, 10); c.fillRect(x + w - 20, yb - 10, 10, 10);
  for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + (i + 1) * w / 4, yb - h * .48); c.lineTo(x + (i + 1) * w / 4, yb - h * .1); c.stroke(); }
  for (let i = 0; i < 2; i++) { const px = x + 40 + i * (w - 140), pc = pick(S.R, ['#d8b060', '#6a8aa0', '#c06a6a', '#e8e0d0']); c.fillStyle = LG(c, px, 0, px + 60, 0, [shade(pc, .7), pc, shade(pc, .7)]); rrect(c, px, yb - h * .82, 60, 50, 14); c.fill(); }
  surface(S, x + 10, x + w - 10, yb - h * .48, .95, 'seat');
}
function crate(S, x, yb, w, h, wood, set, dens) {
  const c = S.c;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .7), wood, shade(wood, .6)]); c.fillRect(x, yb - h, w, h);
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x, yb - h * i / 4); c.lineTo(x + w, yb - h * i / 4); c.stroke(); }
  c.strokeStyle = shade(wood, .5); c.lineWidth = 6; c.beginPath(); c.moveTo(x + 4, yb - 4); c.lineTo(x + w - 4, yb - h + 4); c.stroke(); c.strokeRect(x + 3, yb - h + 3, w - 6, h - 6);
  const s = { x0: x + 4, x1: x + w - 4, y: yb - h, sc: .95 }; if (set) fillSurface(S, s, set, dens || .5); surface(S, s.x0, s.x1, s.y, s.sc, 'top');
}
function barrel(S, x, yb, w, h, wood) {
  const c = S.c;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(wood, .45), shade(wood, 1.1), wood, shade(wood, .45)]);
  c.beginPath(); c.moveTo(x + w * .08, yb - h); c.quadraticCurveTo(x - w * .05, yb - h / 2, x + w * .08, yb); c.lineTo(x + w * .92, yb); c.quadraticCurveTo(x + w * 1.05, yb - h / 2, x + w * .92, yb - h); c.fill();
  c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; [.15, .35, .65, .85].forEach(t => { c.beginPath(); c.moveTo(x + w * .03, yb - h * t); c.lineTo(x + w * .97, yb - h * t); c.stroke(); });
  ell(c, x + w / 2, yb - h, w * .42, w * .1); c.fillStyle = shade(wood, .8); c.fill();
  surface(S, x + w * .15, x + w * .85, yb - h, .9, 'top');
}
function suitcase(S, x, yb, w, h, col) {
  const c = S.c;
  c.fillStyle = LG(c, 0, yb - h, 0, yb, [shade(col, 1.2), col, shade(col, .55)]); rrect(c, x, yb - h, w, h, 8); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; rrect(c, x + 4, yb - h + 4, w - 8, h - 8, 6); c.stroke();
  c.fillStyle = '#6a4a2a'; c.fillRect(x + w * .2, yb - h, 8, h); c.fillRect(x + w * .8 - 8, yb - h, 8, h);
  c.fillStyle = gold(c, x, yb - h, x + 10, yb - h + 10); c.fillRect(x + w * .42, yb - h - 6, w * .16, 8);
  surface(S, x + 8, x + w - 8, yb - h, .95, 'top');
}
function plantBig(S, x, yb, h, onFg) {
  const c = onFg ? S.f : S.c, R = S.R, w = h * .35;
  c.fillStyle = LG(c, x - w / 2, 0, x + w / 2, 0, ['#5a3a2a', '#a07050', '#5a3a2a']); c.beginPath(); c.moveTo(x - w / 2, yb - w * .9); c.lineTo(x + w / 2, yb - w * .9); c.lineTo(x + w * .38, yb); c.lineTo(x - w * .38, yb); c.fill();
  for (let i = 0; i < 26; i++) { const a = rnd(R, -Math.PI * .95, -Math.PI * .05), l = rnd(R, h * .35, h * .75), g = pick(R, GREENS); c.strokeStyle = '#3a5a2a'; c.lineWidth = 2; const ex = x + Math.cos(a) * l * .7, ey = yb - w * .9 + Math.sin(a) * l; c.beginPath(); c.moveTo(x, yb - w * .9); c.quadraticCurveTo(x + Math.cos(a) * l * .3, yb - w - l * .5, ex, ey); c.stroke(); leaf(c, ex, ey, rnd(R, 22, 44), a + rnd(R, -.6, .6), g[0], g[1]); }
}
function ivy(S, x, len, onFg) {
  const c = onFg ? S.f : S.c, R = S.R;
  let px = x, py = 0;
  c.strokeStyle = '#3a4a2a'; c.lineWidth = 2;
  for (let i = 0; i < len; i += 18) { const nx = px + rnd(R, -10, 10), ny = py + 18; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); const g = pick(R, GREENS); leaf(c, nx, ny, rnd(R, 10, 18), rnd(R, 0, TAU), g[0], g[1]); px = nx; py = ny; }
}
function armchairFg(S, x, yb, w, h, col) {
  const f = S.f;
  f.fillStyle = LG(f, x, 0, x + w, 0, [shade(col, .5), col, shade(col, 1.15), shade(col, .45)]);
  rrect(f, x, yb - h, w, h, 30); f.fill();
  f.fillStyle = LG(f, 0, yb - h * .5, 0, yb, [shade(col, 1.2), shade(col, .5)]); rrect(f, x - 30, yb - h * .55, 70, h * .55, 26); f.fill(); rrect(f, x + w - 40, yb - h * .55, 70, h * .55, 26); f.fill();
  f.strokeStyle = 'rgba(0,0,0,.25)'; f.lineWidth = 2; for (let i = 1; i < 4; i++) { f.beginPath(); f.moveTo(x + 10, yb - h + i * h * .2); f.lineTo(x + w - 10, yb - h + i * h * .2); f.stroke(); }
}
function scatterFloor(S, set, n) {
  const R = S.R;
  for (let i = 0; i < n * 3; i++) { const z = pick(R, S.floors); if (!z) return; const y = rnd(R, z.y0, z.y1), sc = .8 + (y - FLOOR) / (H - FLOOR) * .45; P[pick(R, PROP_SETS[set])](S, rnd(R, z.x0, z.x1), y, sc); }
}
function hangingLamps(S, xs, y, col) {
  const f = S.f;
  xs.forEach(x => {
    f.strokeStyle = '#2a2a2a'; f.lineWidth = 2; f.beginPath(); f.moveTo(x, 0); f.lineTo(x, y - 30); f.stroke();
    f.fillStyle = LG(f, x - 40, 0, x + 40, 0, [shade(col, .5), col, shade(col, .6)]);
    f.beginPath(); f.moveTo(x - 12, y - 32); f.lineTo(x + 12, y - 32); f.lineTo(x + 42, y); f.lineTo(x - 42, y); f.closePath(); f.fill();
    glow(S.c, x, y + 10, 160, 'rgba(255,215,140,.4)'); S.lights.push([x, y + 10, 260]);
  });
}
function chair(S, x, yb, col, wood) {
  const c = S.c;
  c.fillStyle = shade(wood, .6); c.fillRect(x + 4, yb - 60, 6, 60); c.fillRect(x + 50, yb - 60, 6, 60); c.fillRect(x + 4, yb - 150, 6, 90); c.fillRect(x + 50, yb - 150, 6, 90);
  c.fillStyle = LG(c, 0, yb - 150, 0, yb - 90, [shade(col, 1.2), shade(col, .7)]); rrect(c, x + 2, yb - 150, 56, 60, 14); c.fill();
  c.fillStyle = LG(c, 0, yb - 70, 0, yb - 56, [shade(col, 1.3), shade(col, .6)]); rrect(c, x - 4, yb - 72, 68, 16, 6); c.fill();
}
function fruitCrates(S, x, y, w, R) {
  const c = S.c;
  crate(S, x, y, w, 70, '#9a7040', null);
  const fc = pick(R, [['#e8402a', '#8a1010'], ['#f2a020', '#a85a00'], ['#8ac83a', '#3a7010'], ['#a02a6a', '#4a0a2a'], ['#f2e04a', '#a89000']]);
  for (let k = 0; k < w / 9; k++) { const fx = x + 14 + R() * (w - 28), fy = y - 74 - R() * 18; c.fillStyle = RG(c, fx - 4, fy - 4, 1, fx, fy, 14, ['#fff8e0', fc[0], fc[1]]); circ(c, fx, fy, 12); c.fill(); }
}

/* ——— Les 20 décors ——— */
const THEMES = [
  { key: 'hall', name: 'Hall du manoir', mood: 'mystery', sw: ['#3e5530', '#c9a46a'], paint(S) {
    wall(S, 0, 360, 'damask', '#5f7a4a', '#3e5530'); wainscot(S, 360, FLOOR, '#e0d4b8', '#a89878'); floor(S, 'checker', '#e8e2d4', '#b8b0a0');
    door(S, 60, FLOOR, 200, 400, '#6a4a3a'); gallery(S, 300, 640, 40, 220);
    commode(S, 320, FLOOR, 280, 150, '#5a3a22', 'manor'); grandClock(S, 690, FLOOR, 360, '#4a2a18');
    sconce(S, 290, 250); sconce(S, 640, 250);
    stairs(S, 900, FLOOR, 700, 470, 13, '#5a3a22', '#7a1a2a');
    chandelier(S, 560, 80, 90); rug(S, 520, 680, 360, 70, '#8a2a2a', '#4a1010');
    floorZone(S, 160, 880); scatterFloor(S, 'manor', 8); plantBig(S, 70, H + 20, 330, true);
  } },
  { key: 'biblio', name: 'Bibliothèque aux secrets', mood: 'mystery', sw: ['#3a2716', '#c49a5a'], paint(S) {
    wall(S, 0, FLOOR, 'panels', '#5a3a22', '#3a2414'); floor(S, 'parquet', '#7a4a26', '#3a2210');
    for (let i = 0; i < 4; i++) bookcase(S, 20 + i * 395, FLOOR, 370, 500, '#5a3418', 'study');
    const f = S.f; f.strokeStyle = '#6a4424'; f.lineWidth = 10; f.beginPath(); f.moveTo(1140, 30); f.lineTo(1060, H); f.moveTo(1220, 30); f.lineTo(1150, H); f.stroke(); f.lineWidth = 6; for (let y = 80; y < H; y += 60) { const t = (y - 30) / (H - 30); f.beginPath(); f.moveTo(1140 - 80 * t, y); f.lineTo(1220 - 70 * t, y); f.stroke(); }
    table(S, 700, H - 20, 560, 150, '#6a3a1a', null, 'study', .6); rug(S, 700, 720, 520, 70, '#5a2a2a', '#2a1010');
    armchairFg(S, 60, H + 30, 260, 260, '#6a2a2a'); floorZone(S, 340, 1000, FLOOR + 30, 610); scatterFloor(S, 'study', 6);
    dust(S.c, S.R, 160, 0, 0, W, H);
  } },
  { key: 'salon', name: 'Salon victorien', mood: 'calm', sw: ['#5a1a22', '#e0b880'], paint(S) {
    wall(S, 0, FLOOR, 'stripes', '#7a2a32', '#4a1418'); floor(S, 'parquet', '#8a5a32', '#4a2a14');
    fireplace(S, 560, FLOOR, 440, 330, '#d8ccb4', 'manor'); painting(S, 640, 30, 280, 150);
    windowArch(S, 1180, 70, 280, 400, ['#b8d0e0', '#f0e0c0'], '#e8dcc0', '#2e4a3a');
    sofa(S, 60, FLOOR + 60, 420, 200, '#4a6a5a'); gallery(S, 40, 520, 40, 300);
    commode(S, 1040, FLOOR + 20, 120, 150, '#5a3a22', 'manor', .7);
    table(S, 820, H - 10, 300, 110, '#5a3418', '#e8dcc0', 'manor', .6); rug(S, 700, 690, 520, 80, '#7a4a2a', '#3a1a10');
    floorZone(S, 100, 1500, FLOOR + 40, 680); scatterFloor(S, 'manor', 7); plantBig(S, 1540, H + 20, 300, true);
  } },
  { key: 'curiosites', name: 'Cabinet de curiosités', mood: 'mystery', sw: ['#1e3a40', '#c8a050'], paint(S) {
    wall(S, 0, FLOOR, 'plaster', '#2e5052', '#183032'); floor(S, 'planks', '#5a3a22', '#2a1a0c');
    vitrine(S, 30, FLOOR, 330, 480, '#3a2414', 'shop'); vitrine(S, 1240, FLOOR, 330, 480, '#3a2414', 'shop');
    gallery(S, 380, 1220, 30, 250); wallShelf(S, 400, 290, 380, '#4a2a14', 'shop'); wallShelf(S, 820, 290, 380, '#4a2a14', 'shop');
    commode(S, 420, FLOOR, 760, 170, '#4a2a14', 'shop', .8);
    table(S, 800, H - 10, 560, 120, '#3a2010', '#5a1a2a', 'shop', .7); floorZone(S, 40, 1560); scatterFloor(S, 'shop', 8);
    hangingLamps(S, [600, 1000], 120, '#c8a050');
  } },
  { key: 'cuisine', name: 'Cuisine de la gouvernante', mood: 'bright', sw: ['#5a4a2a', '#f2e4c8'], paint(S) {
    wall(S, 0, 300, 'plaster', '#e8dcc0', '#c8b898'); wall(S, 300, FLOOR, 'tiles', '#cfe0d8', '#9ab8a8'); floor(S, 'tiles', '#a0522d', '#5a2a14');
    for (let i = 0; i < 3; i++) wallShelf(S, 30, 130 + i * 130, 520, '#7a5230', 'kitchen', .9);
    const c = S.c; c.fillStyle = LG(c, 640, 0, 1000, 0, ['#1a1a1a', '#4a4a4a', '#1a1a1a']); c.fillRect(640, 330, 360, 210); c.fillStyle = '#2a2a2a'; c.beginPath(); c.moveTo(600, 330); c.lineTo(1040, 330); c.lineTo(940, 120); c.lineTo(700, 120); c.fill(); glow(c, 820, 470, 90, 'rgba(255,120,40,.5)');
    surface(S, 650, 990, 330, .85, 'top');
    windowArch(S, 1150, 60, 320, 300, ['#a8d0e8', '#f8f0d8'], '#5a3a20', null);
    commode(S, 1080, FLOOR, 480, 150, '#7a5230', 'kitchen', .8);
    table(S, 760, H - 10, 760, 140, '#8a5a30', null, 'kitchen', .75);
    const f = S.f; f.strokeStyle = '#3a3a3a'; f.lineWidth = 6; f.beginPath(); f.moveTo(560, 30); f.lineTo(1100, 30); f.stroke();
    for (let x = 600; x < 1080; x += 80) { f.lineWidth = 2; f.beginPath(); f.moveTo(x, 30); f.lineTo(x, 70); f.stroke(); f.fillStyle = LG(f, x - 30, 0, x + 30, 0, ['#7a3a1a', '#d8884a', '#6a2a10']); ell(f, x, 90, 30, 22); f.fill(); }
    floorZone(S, 30, 1570, FLOOR + 30, 640); scatterFloor(S, 'kitchen', 7);
  } },
  { key: 'grenier', name: 'Grenier aux malles', mood: 'mystery', sw: ['#3a2818', '#d8b080'], paint(S) {
    wall(S, 0, FLOOR, 'planks', '#6a4a2e', '#3a2414'); floor(S, 'planks', '#5a3a20', '#2a1a0c');
    const c = S.c, R = S.R; c.fillStyle = '#f0e0c0'; circ(c, 800, 150, 70); c.fill(); c.strokeStyle = '#2a1a0c'; c.lineWidth = 10; circ(c, 800, 150, 70); c.stroke(); c.beginPath(); c.moveTo(730, 150); c.lineTo(870, 150); c.moveTo(800, 80); c.lineTo(800, 220); c.stroke();
    rays(c, R, 800, 150, 'rgba(255,230,180,.22)', 7, .8, 1100);
    crate(S, 40, FLOOR + 30, 200, 160, '#8a6a40', 'shop'); crate(S, 60, FLOOR - 130, 160, 130, '#7a5a34', 'shop'); suitcase(S, 260, FLOOR + 40, 220, 110, '#5a2a1a'); suitcase(S, 280, FLOOR - 70, 180, 90, '#2a4a5a');
    commode(S, 520, FLOOR, 240, 170, '#5a3a22', 'shop'); crate(S, 1040, FLOOR + 20, 220, 170, '#8a6a40', 'shop'); barrel(S, 1290, FLOOR + 40, 140, 200, '#7a5030'); suitcase(S, 1430, FLOOR + 60, 160, 120, '#6a4a2a');
    for (let i = 0; i < 2; i++) { blobPath(c, R, 880 + i * 120, FLOOR + 20, 90, .3, 10); c.fillStyle = LG(c, 0, FLOOR - 70, 0, FLOOR + 90, ['#ece4d4', '#b8ac98']); c.fill(); surface(S, 820 + i * 120, 940 + i * 120, FLOOR - 50, .9, 'top'); }
    const f = S.f; f.fillStyle = '#1e1208'; f.beginPath(); f.moveTo(800, -60); f.lineTo(-40, 420); f.lineTo(-40, 470); f.lineTo(800, -10); f.lineTo(1640, 470); f.lineTo(1640, 420); f.closePath(); f.fill();
    floorZone(S, 40, 1560, FLOOR + 90, H - 20); scatterFloor(S, 'shop', 12); dust(c, R, 300, 400, 0, 1200, H);
  } },
  { key: 'atelier', name: 'Atelier du peintre', mood: 'dreamy', sw: ['#4a3a2a', '#e8c890'], paint(S) {
    wall(S, 0, FLOOR, 'plaster', '#d8c4a4', '#a8906c'); floor(S, 'planks', '#8a6a4a', '#4a3420');
    const c = S.c, R = S.R; c.fillStyle = LG(c, 0, 0, 0, 220, ['#c8dcec', '#f0e8d8']); c.fillRect(500, 0, 600, 220); c.strokeStyle = '#3a2a1a'; c.lineWidth = 8; for (let x = 500; x <= 1100; x += 100) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 220); c.stroke(); } c.strokeRect(500, 0, 600, 220);
    rays(c, R, 800, 100, 'rgba(255,245,220,.2)', 8, .6, 900);
    for (let i = 0; i < 7; i++) { const w = rnd(R, 120, 220), h = w * rnd(R, .8, 1.2), x = 20 + i * 60, y = FLOOR + 40; c.save(); c.translate(x, y); c.rotate(rnd(R, -.15, -.05)); painting(S, 0, -h, w, h); c.restore(); }
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.beginPath(); c.moveTo(1000, H - 40); c.lineTo(1080, 260); c.lineTo(1160, H - 40); c.moveTo(1080, 260); c.lineTo(1080, H - 10); c.stroke(); painting(S, 960, 290, 240, 190); c.fillStyle = '#6a4a2a'; c.fillRect(950, 480, 260, 12); surface(S, 960, 1200, 480, .9);
    wallShelf(S, 1260, 200, 320, '#6a4a2a', 'shop'); wallShelf(S, 1260, 340, 320, '#6a4a2a', 'shop');
    table(S, 680, H - 10, 520, 130, '#7a5a3a', null, 'lab', .7);
    const f = S.f; f.fillStyle = LG(f, 1300, 600, 1600, 800, ['#e8e0d0', '#b8ac98']); f.beginPath(); f.moveTo(1280, H); f.quadraticCurveTo(1320, 620, 1420, 640); f.quadraticCurveTo(1520, 600, 1600, 650); f.lineTo(1600, H); f.fill();
    for (let i = 0; i < 30; i++) { f.fillStyle = pick(R, ['rgba(200,60,60,.6)', 'rgba(60,90,180,.6)', 'rgba(230,190,60,.6)']); circ(f, rnd(R, 1320, 1590), rnd(R, 660, 790), rnd(R, 2, 6)); f.fill(); }
    floorZone(S, 420, 1250, FLOOR + 30, 630); scatterFloor(S, 'shop', 6);
  } },
  { key: 'antiquaire', name: 'Boutique d’antiquaire', mood: 'mystery', sw: ['#4a1a1a', '#d8a860'], paint(S) {
    wall(S, 0, FLOOR, 'damask', '#6a2424', '#3a1010'); floor(S, 'planks', '#6a4a2a', '#2a1a0c');
    vitrine(S, 20, FLOOR, 300, 500, '#3a2010', 'shop'); bookcase(S, 340, FLOOR, 300, 500, '#3a2010', 'shop', false); bookcase(S, 960, FLOOR, 300, 500, '#3a2010', 'shop', false); vitrine(S, 1280, FLOOR, 300, 500, '#3a2010', 'shop');
    gallery(S, 660, 940, 30, 300); grandClock(S, 760, FLOOR, 220, '#4a2a18');
    commode(S, 380, H - 20, 840, 150, '#4a2a14', 'shop', .85);
    hangingLamps(S, [480, 800, 1120], 130, '#2a5a4a'); floorZone(S, 40, 1560, FLOOR + 20, 600); scatterFloor(S, 'shop', 10);
  } },
  { key: 'chambre', name: 'Chambre Art déco', mood: 'dreamy', sw: ['#2a3a4a', '#e8d0a0'], paint(S) {
    wall(S, 0, FLOOR, 'stripes', '#d8c8a0', '#a8946c'); floor(S, 'carpet', '#5a6a8a', '#2a3450');
    const c = S.c; c.fillStyle = LG(c, 900, 0, 1500, 0, ['#2a3a5a', '#4a5a7a', '#2a3a5a']); c.beginPath(); c.moveTo(900, FLOOR - 40); c.lineTo(900, 180); c.quadraticCurveTo(1200, 80, 1500, 180); c.lineTo(1500, FLOOR - 40); c.fill();
    c.fillStyle = LG(c, 0, 380, 0, 620, ['#f0e8e0', '#b8b0a8']); rrect(c, 860, 360, 680, 220, 20); c.fill(); c.fillStyle = LG(c, 0, 380, 0, 620, ['#8a3a4a', '#4a1a2a']); rrect(c, 980, 420, 580, 200, 16); c.fill();
    [[900, 290], [1100, 290]].forEach(p => { c.fillStyle = LG(c, 0, p[1], 0, p[1] + 80, ['#fffaf0', '#d8d0c4']); rrect(c, p[0], p[1], 170, 80, 26); c.fill(); });
    surface(S, 900, 1520, 400, .9, 'seat');
    commode(S, 740, FLOOR + 30, 130, 120, '#2a1a10', 'manor', .8);
    commode(S, 80, FLOOR, 380, 160, '#3a2414', 'manor', .7); c.fillStyle = gold(c, 120, 80, 420, 360); ell(c, 270, 200, 130, 150); c.fill(); c.fillStyle = LG(c, 140, 80, 400, 360, ['#d8e4ec', '#8a9aa8', '#c8d4dc']); ell(c, 270, 200, 115, 135); c.fill();
    windowArch(S, 520, 70, 180, 330, ['#2a3a6a', '#d88a6a'], '#e8dcc0', '#8a6a8a');
    rug(S, 640, 700, 420, 70, '#c8a060', '#6a4a2a'); floorZone(S, 40, 1560, FLOOR + 80, H - 20); scatterFloor(S, 'manor', 8);
  } },
  { key: 'bal', name: 'Salle de bal', mood: 'dreamy', sw: ['#5a4a3a', '#f0dca0'], paint(S) {
    wall(S, 0, FLOOR, 'plaster', '#e8dcc8', '#b8a888'); floor(S, 'parquet', '#9a6a3a', '#4a2a10');
    const c = S.c;
    for (let i = 0; i < 4; i++) windowArch(S, 140 + i * 380, 90, 200, 360, ['#d8e0f0', '#f8e0c0'], '#f0e8d8', '#7a1a2a');
    for (let i = 0; i < 5; i++) { const x = 20 + i * 380; c.fillStyle = LG(c, x, 0, x + 60, 0, ['#a89c88', '#f4ece0', '#c8bca8']); c.fillRect(x, 20, 60, FLOOR - 20); c.fillStyle = gold(c, x, 0, x + 60, 30); c.fillRect(x - 10, 10, 80, 22); c.fillRect(x - 10, FLOOR - 24, 80, 24); }
    chandelier(S, 400, 70, 80); chandelier(S, 1200, 70, 80);
    for (let i = 0; i < 4; i++) { chair(S, 120 + i * 380, FLOOR + 10, '#8a2a3a', '#e8d8b0'); chair(S, 300 + i * 380, FLOOR + 10, '#8a2a3a', '#e8d8b0'); }
    for (let i = 0; i < 5; i++) plantBig(S, 50 + i * 380, FLOOR + 30, 200, false);
    for (let i = 0; i < 4; i++) { suitcase(S, 180 + i * 380, FLOOR + 70, 110, 50, '#e8dcc0'); }
    for (let i = 0; i < 3; i++) table(S, 300 + i * 500, H - 30, 220, 110, '#e8dcc0', '#f4ece0', 'manor', .7);
    floorZone(S, 40, 1560, FLOOR + 30, 640); scatterFloor(S, 'manor', 8);
  } },
  { key: 'cave', name: 'Cave du château', mood: 'night', sw: ['#2a1a14', '#c88a4a'], paint(S) {
    wall(S, 0, FLOOR, 'brick', '#6a3a2a', '#2a140c'); floor(S, 'stone', '#5a4a3a', '#2a2018');
    const c = S.c;
    for (let a = 0; a < 3; a++) { const x = 100 + a * 500; c.fillStyle = '#140a06'; c.beginPath(); c.moveTo(x, FLOOR); c.lineTo(x, 260); c.arc(x + 180, 260, 180, Math.PI, 0); c.lineTo(x + 360, FLOOR); c.fill(); for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) { const bx = x + 34 + k * 37, by = 300 + r * 38; c.fillStyle = RG(c, bx - 3, by - 3, 1, bx, by, 14, ['#6a8a4a', '#1a2a10', '#0a0a06']); circ(c, bx, by, 13); c.fill(); } }
    for (let i = 0; i < 3; i++) barrel(S, 40 + i * 180, FLOOR + 80, 170, 230, '#6a4020'); for (let i = 0; i < 2; i++) barrel(S, 130 + i * 180, FLOOR - 150, 160, 200, '#5a3418');
    crate(S, 1100, FLOOR + 50, 200, 160, '#7a5a34', 'cellar'); crate(S, 1320, FLOOR + 70, 240, 180, '#6a4a2a', 'cellar'); table(S, 820, H - 10, 340, 140, '#5a3418', null, 'cellar', .8);
    sconce(S, 600, 160); sconce(S, 1100, 160); floorZone(S, 560, 1560, FLOOR + 30, 630); scatterFloor(S, 'cellar', 8);
  } },
  { key: 'theatre', name: 'Coulisses du théâtre', mood: 'night', sw: ['#3a0a14', '#e8b860'], paint(S) {
    wall(S, 0, FLOOR, 'brick', '#3a2a2a', '#1a1010'); floor(S, 'planks', '#5a4030', '#2a1a10');
    const c = S.c, R = S.R, f = S.f;
    c.strokeStyle = '#2a2a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(620, 140); c.lineTo(1060, 140); c.stroke();
    for (let i = 0; i < 9; i++) { const x = 640 + i * 46, col = pick(R, ['#8a1a2a', '#2a4a8a', '#c8a040', '#2a6a4a', '#6a2a6a', '#e8e0d0']); c.fillStyle = LG(c, x, 0, x + 50, 0, [shade(col, .5), col, shade(col, .6)]); c.beginPath(); c.moveTo(x + 22, 150); c.lineTo(x + 50, 180); c.lineTo(x + 56, 420); c.lineTo(x - 6, 420); c.lineTo(x, 180); c.fill(); }
    commode(S, 1120, FLOOR, 400, 160, '#3a2010', 'shop', .9); c.fillStyle = '#1a1a1a'; c.fillRect(1160, 120, 320, 240); c.fillStyle = LG(c, 1170, 130, 1470, 350, ['#c8d0d8', '#6a7a88', '#b8c4cc']); c.fillRect(1180, 140, 280, 200);
    for (let k = 0; k < 8; k++) { glow(c, 1170 + k * 43, 128, 22, 'rgba(255,230,160,.9)'); c.fillStyle = '#fff4d0'; circ(c, 1170 + k * 43, 128, 6); c.fill(); }
    suitcase(S, 650, FLOOR + 60, 260, 130, '#5a2a1a'); suitcase(S, 670, FLOOR - 70, 220, 100, '#2a3a5a'); crate(S, 940, FLOOR + 70, 160, 140, '#6a4a2a', 'shop');
    f.fillStyle = LG(f, 0, 0, 520, 0, ['#4a0a14', '#9a1a2a', '#5a0a14', '#a01a2c', '#4a0a14', '#8a1424']); f.beginPath(); f.moveTo(0, 0); f.lineTo(520, 0); f.quadraticCurveTo(420, 300, 480, H); f.lineTo(0, H); f.fill();
    f.strokeStyle = 'rgba(0,0,0,.3)'; f.lineWidth = 3; for (let x = 60; x < 480; x += 60) { f.beginPath(); f.moveTo(x, 0); f.quadraticCurveTo(x - 30, 400, x + 20, H); f.stroke(); }
    f.strokeStyle = '#b89a6a'; f.lineWidth = 3; for (let i = 0; i < 4; i++) { f.beginPath(); f.moveTo(560 + i * 30, 0); f.lineTo(570 + i * 30, 500 + i * 30); f.stroke(); }
    rays(c, R, 1500, -40, 'rgba(255,240,200,.18)', 4, .3, 1200, Math.PI * .7);
    floorZone(S, 540, 1560, FLOOR + 30, H - 20); scatterFloor(S, 'shop', 10);
  } },
  { key: 'cafe', name: 'Café parisien', mood: 'bright', sw: ['#2a3a2a', '#e8c070'], paint(S) {
    wall(S, 0, 330, 'tiles', '#e8e0c8', '#c8bc9c'); wainscot(S, 330, FLOOR, '#5a3a22', '#2a1a0c'); floor(S, 'checker', '#efe8d8', '#c8c0b0');
    const c = S.c; c.fillStyle = LG(c, 40, 30, 600, 300, ['#c8d4d8', '#6a7a80', '#b8c4c8']); c.fillRect(60, 40, 560, 240); c.strokeStyle = gold(c, 40, 30, 640, 300); c.lineWidth = 12; c.strokeRect(60, 40, 560, 240);
    for (let i = 0; i < 3; i++) wallShelf(S, 680, 80 + i * 90, 520, '#5a3a22', 'cellar', .95);
    c.fillStyle = '#1a2a1a'; c.fillRect(1260, 50, 300, 220); c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.strokeRect(1260, 50, 300, 220); c.fillStyle = 'rgba(240,240,230,.75)'; for (let i = 0; i < 7; i++) c.fillRect(1290, 80 + i * 26, rnd(S.R, 120, 240), 4);
    commode(S, 600, FLOOR + 20, 980, 190, '#6a3a1a', 'kitchen', .7);
    for (let i = 0; i < 2; i++) table(S, 260 + i * 820, H - 10, 260, 120, '#2a2a2a', null, 'kitchen', .7);
    hangingLamps(S, [300, 800, 1300], 90, '#e8dcc0'); floorZone(S, 40, 1560, FLOOR + 30, 640); scatterFloor(S, 'kitchen', 6);
  } },
  { key: 'gare', name: 'Gare sous la verrière', mood: 'night', sw: ['#2a3440', '#d8c49a'], paint(S) {
    const c = S.c; fillV(c, 0, 380, ['#9aaab4', '#d8dcd8']);
    c.strokeStyle = '#2a3038'; c.lineWidth = 9; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(800, 420, 900 - i * 160, 420 - i * 70, 0, Math.PI, TAU); c.stroke(); } c.lineWidth = 3; for (let i = -14; i <= 14; i++) { c.beginPath(); c.moveTo(800, 420); c.lineTo(800 + i * 70, 0); c.stroke(); }
    wall(S, 380, FLOOR, 'brick', '#8a5a3a', '#5a3420');
    c.fillStyle = '#2a2a2e'; circ(c, 800, 300, 80); c.fill(); c.fillStyle = '#efe8d8'; circ(c, 800, 300, 66); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 5; c.beginPath(); c.moveTo(800, 300); c.lineTo(800, 252); c.moveTo(800, 300); c.lineTo(834, 314); c.stroke();
    gallery(S, 60, 640, 400, 520); gallery(S, 960, 1540, 400, 520);
    floor(S, 'stone', '#8a8478', '#4a4640');
    for (let i = 0; i < 3; i++) { const x = 80 + i * 540; c.fillStyle = '#6a4a2a'; for (let k = 0; k < 3; k++) c.fillRect(x, FLOOR - 20 + k * 18, 280, 12); c.fillStyle = '#2a2a2a'; c.fillRect(x, FLOOR + 40, 280, 14); c.fillRect(x + 10, FLOOR + 54, 10, 40); c.fillRect(x + 260, FLOOR + 54, 10, 40); surface(S, x + 10, x + 270, FLOOR + 40, .9, 'seat'); }
    suitcase(S, 400, H - 20, 200, 120, '#5a3a2a'); suitcase(S, 420, H - 140, 160, 100, '#2a4a3a'); suitcase(S, 1200, H - 10, 240, 130, '#7a2a1a'); crate(S, 1460, H - 10, 130, 120, '#7a5a34', 'shop');
    for (const x of [300, 1300]) { c.fillStyle = '#1a1a1a'; c.fillRect(x - 4, 200, 8, FLOOR - 160); glow(c, x, 200, 90, 'rgba(255,220,150,.8)'); S.lights.push([x, 200, 300]); }
    floorZone(S, 40, 1560, FLOOR + 110, H - 20); scatterFloor(S, 'shop', 10);
    for (let i = 0; i < 4; i++) { c.fillStyle = LG(c, 0, 300 + i * 60, 0, 440 + i * 60, ['rgba(230,230,230,0)', 'rgba(230,230,230,.18)', 'rgba(230,230,230,0)']); c.fillRect(0, 300 + i * 60, W, 140); }
  } },
  { key: 'serre', name: 'Serre aux orchidées', mood: 'calm', sw: ['#1a3a2a', '#9ad87a'], paint(S) {
    const c = S.c, R = S.R; fillV(c, 0, FLOOR, ['#cfe4d4', '#8ab89a']);
    c.strokeStyle = 'rgba(250,250,245,.85)'; c.lineWidth = 7; for (let x = 0; x <= W; x += 130) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, FLOOR); c.stroke(); } for (let y = 0; y < FLOOR; y += 140) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    rays(c, R, 400, -100, 'rgba(255,255,230,.22)', 7, .8, 1400);
    for (let i = 0; i < 18; i++) plantBig(S, rnd(R, 0, W), rnd(R, 300, 520), rnd(R, 160, 300), false);
    floor(S, 'tiles', '#8a6a4a', '#4a3420');
    for (let i = 0; i < 2; i++) table(S, 390 + i * 780, FLOOR + 110, 660, 130, '#6a5a4a', null, 'garden', .9);
    const f = S.f; for (let i = 0; i < 4; i++) { const x = 200 + i * 400; f.strokeStyle = '#3a3a3a'; f.lineWidth = 2; f.beginPath(); f.moveTo(x, 0); f.lineTo(x, 80); f.stroke(); plantBig(S, x, 140, 140, true); }
    plantBig(S, 1550, H + 40, 420, true); plantBig(S, 30, H + 40, 380, true);
    floorZone(S, 200, 1400, FLOOR + 140, H - 20); scatterFloor(S, 'garden', 8);
  } },
  { key: 'labo', name: 'Laboratoire du savant', mood: 'space', sw: ['#1e3a40', '#7fc4b8'], paint(S) {
    wall(S, 0, 280, 'plaster', '#b8c8c4', '#8aa09c'); wall(S, 280, FLOOR, 'tiles', '#d8e4e0', '#a8bcb8'); floor(S, 'checker', '#d8d8d0', '#8a8a84');
    const c = S.c, R = S.R; c.fillStyle = '#1a2a24'; c.fillRect(500, 40, 600, 220); c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.strokeRect(500, 40, 600, 220);
    c.strokeStyle = 'rgba(240,240,230,.7)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = rnd(R, 520, 1000), y = rnd(R, 60, 240); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) c.lineTo(x + k * 14, y + rnd(R, -8, 8)); c.stroke(); } circ(c, 900, 140, 50); c.stroke();
    vitrine(S, 20, FLOOR, 340, 480, '#5a5a5a', 'lab'); vitrine(S, 1240, FLOOR, 340, 480, '#5a5a5a', 'lab');
    commode(S, 400, FLOOR, 800, 180, '#3a4a4a', 'lab', .9); wallShelf(S, 520, 300, 560, '#5a5a5a', 'lab');
    table(S, 800, H - 10, 820, 120, '#2a2f33', null, 'lab', .8);
    for (let i = 0; i < 8; i++) glow(c, rnd(R, 100, 1500), rnd(R, 300, 700), 40, 'rgba(120,255,200,.35)');
    floorZone(S, 20, 1580, FLOOR + 30, 630); scatterFloor(S, 'lab', 6);
  } },
  { key: 'terrasse', name: 'Terrasse sur le lac', mood: 'calm', sw: ['#2a4a6a', '#f0d0a0'], paint(S) {
    const c = S.c, R = S.R; fillV(c, 0, 340, ['#8ab0d8', '#f2dcc0']);
    [['#8a9ab4', 230], ['#6a7a90', 270]].forEach(m => { c.fillStyle = m[0]; c.beginPath(); c.moveTo(0, 340); let x = 0; while (x < W) { x += rnd(R, 80, 200); c.lineTo(x, m[1] + rnd(R, -60, 30)); } c.lineTo(W, 360); c.lineTo(0, 360); c.fill(); });
    fillV(c, 330, 460, ['#5a8ab0', '#2a5a7a']); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; for (let i = 0; i < 50; i++) { const x = rnd(R, 0, W), y = rnd(R, 340, 450); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y); c.stroke(); }
    for (let i = 0; i < 10; i++) foliage(c, R, rnd(R, 0, W), rnd(R, 400, 450), 60, 14, GREENS);
    c.fillStyle = LG(c, 0, 440, 0, FLOOR, ['#e8dcc4', '#b8a888']); c.fillRect(0, 440, W, 100); for (let x = 20; x < W; x += 50) { c.fillStyle = LG(c, x, 0, x + 26, 0, ['#c8bca4', '#f4ece0', '#b8ac94']); c.beginPath(); c.moveTo(x + 4, 450); c.quadraticCurveTo(x - 6, 490, x + 6, 530); c.lineTo(x + 20, 530); c.quadraticCurveTo(x + 32, 490, x + 22, 450); c.fill(); }
    c.fillStyle = '#d8ccb4'; c.fillRect(0, 432, W, 16); surface(S, 0, W, 432, .78);
    floor(S, 'planks', '#a07a50', '#5a3a20');
    table(S, 800, H - 30, 520, 130, '#e8e0d0', '#f4ece0', 'kitchen', .8);
    for (let i = 0; i < 5; i++) P.plant(S, 60 + i * 380, FLOOR + 70, 2.2);
    ivy(S, 60, 400, true); ivy(S, 1540, 360, true); const f = S.f; for (let i = 0; i < 30; i++) { const g = pick(R, GREENS); leaf(f, rnd(R, 0, W), rnd(R, 0, 40), rnd(R, 16, 30), rnd(R, 0, TAU), g[0], g[1]); }
    floorZone(S, 40, 1560, FLOOR + 40, H - 20); scatterFloor(S, 'garden', 8);
  } },
  { key: 'port', name: 'Quai du vieux port', mood: 'night', sw: ['#1a2a3a', '#e8a060'], paint(S) {
    const c = S.c, R = S.R; fillV(c, 0, 330, ['#3a4a7a', '#e8906a', '#f0c890']);
    glow(c, 1100, 320, 200, 'rgba(255,200,120,.7)');
    fillV(c, 330, 540, ['#3a5a7a', '#1a2a3a']); for (let i = 0; i < 80; i++) { c.strokeStyle = `rgba(255,200,140,${rnd(R, .1, .4)})`; c.lineWidth = 2; const x = rnd(R, 0, W), y = rnd(R, 340, 530); c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(R, 20, 60), y); c.stroke(); }
    for (let i = 0; i < 3; i++) { const x = 200 + i * 450; c.fillStyle = '#1a1414'; c.beginPath(); c.moveTo(x, 420); c.lineTo(x + 300, 420); c.lineTo(x + 260, 470); c.lineTo(x + 30, 470); c.fill(); c.fillRect(x + 140, 200, 6, 220); c.strokeStyle = '#1a1414'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 143, 200); c.lineTo(x + 20, 418); c.moveTo(x + 143, 200); c.lineTo(x + 290, 418); c.stroke(); }
    floor(S, 'planks', '#6a5038', '#2a1a10');
    crate(S, 40, FLOOR + 60, 200, 180, '#7a5a34', 'cellar'); crate(S, 70, FLOOR - 120, 150, 140, '#6a4a2a', 'cellar'); barrel(S, 260, FLOOR + 80, 150, 210, '#6a4020'); barrel(S, 1180, FLOOR + 70, 150, 200, '#6a4020'); crate(S, 1350, FLOOR + 70, 230, 170, '#7a5a34', 'cellar');
    for (const x of [600, 1000]) { c.fillStyle = '#1a1a1a'; c.fillRect(x - 4, 180, 8, 360); glow(c, x, 180, 100, 'rgba(255,200,120,.85)'); S.lights.push([x, 180, 320]); }
    const f = S.f; f.strokeStyle = '#a08a5a'; f.lineWidth = 5; for (let r = 10; r < 60; r += 7) { ell(f, 760, H - 40, r * 1.6, r * .5); f.stroke(); }
    f.strokeStyle = 'rgba(40,30,20,.6)'; f.lineWidth = 1.5; for (let i = 0; i < 20; i++) { f.beginPath(); f.moveTo(420 + i * 14, H); f.lineTo(500 + i * 10, FLOOR + 20); f.stroke(); f.beginPath(); f.moveTo(420, FLOOR + 30 + i * 12); f.lineTo(700, FLOOR + 40 + i * 12); f.stroke(); }
    floorZone(S, 420, 1560, FLOOR + 30, H - 20); scatterFloor(S, 'cellar', 10);
  } },
  { key: 'marche', name: 'Marché couvert', mood: 'bright', sw: ['#7a3a2a', '#f2d48a'], paint(S) {
    const c = S.c, R = S.R; fillV(c, 0, FLOOR, ['#e8d8bc', '#b89a78']);
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 7; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(800, 420, 1000 - i * 200, 420 - i * 60, 0, Math.PI, TAU); c.stroke(); }
    floor(S, 'cobble', '#9a8a7a', '#5a4a40');
    for (let i = 0; i < 4; i++) {
      const x = 10 + i * 400, a = pick(R, ['#c83a2a', '#2a6a9a', '#3a8a4a', '#d89a2a']);
      for (let s2 = 0; s2 < 8; s2++) { c.fillStyle = s2 % 2 ? a : '#f4ece0'; c.beginPath(); c.moveTo(x + s2 * 48, 150); c.lineTo(x + (s2 + 1) * 48, 150); c.lineTo(x + (s2 + 1) * 48 + 6, 250); c.lineTo(x + s2 * 48 + 6, 250); c.fill(); }
      c.fillStyle = '#5a3a20'; c.fillRect(x, 150, 10, 400); c.fillRect(x + 376, 150, 10, 400);
      wallShelf(S, x + 30, 330, 330, '#6a4a2a', 'kitchen', .95);
      fruitCrates(S, x + 20, FLOOR + 10, 170, R); fruitCrates(S, x + 200, FLOOR + 10, 170, R);
    }
    for (let i = 0; i < 4; i++) P.basket(S, 100 + i * 380, H - 30, 2);
    floorZone(S, 20, 1580, FLOOR + 50, H - 20); scatterFloor(S, 'kitchen', 12);
  } },
  { key: 'detective', name: 'Bureau du détective', mood: 'night', sw: ['#2e241a', '#c89a5a'], paint(S) {
    wall(S, 0, FLOOR, 'panels', '#5a4030', '#2a1c12'); floor(S, 'planks', '#5a3a22', '#2a1a0c');
    const c = S.c, R = S.R; c.fillStyle = LG(c, 0, 40, 0, 360, ['#b08a5a', '#8a6a40']); c.fillRect(420, 40, 560, 320); c.strokeStyle = '#3a2410'; c.lineWidth = 12; c.strokeRect(420, 40, 560, 320);
    const pins = []; for (let i = 0; i < 14; i++) { const x = rnd(R, 440, 900), y = rnd(R, 60, 280); c.save(); c.translate(x, y); c.rotate(rnd(R, -.2, .2)); c.fillStyle = pick(R, ['#f4ecd8', '#e8e0c8', '#f0f0e8']); c.fillRect(0, 0, rnd(R, 50, 80), rnd(R, 40, 70)); c.fillStyle = 'rgba(40,30,20,.5)'; for (let k = 0; k < 4; k++) c.fillRect(6, 10 + k * 9, 36, 2); c.restore(); pins.push([x + 6, y + 4]); c.fillStyle = '#c0282a'; circ(c, x + 6, y + 4, 4); c.fill(); }
    c.strokeStyle = '#c0282a'; c.lineWidth = 1.5; c.beginPath(); pins.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    windowArch(S, 1080, 60, 300, 380, ['#1a2a4a', '#4a5a7a'], '#2a1a10', null); const f = S.f; for (let y = 90; y < 440; y += 22) { f.fillStyle = 'rgba(220,200,160,.75)'; f.fillRect(1074, y, 312, 8); }
    rays(c, R, 1230, 250, 'rgba(255,240,200,.12)', 5, .4, 900, Math.PI * .75);
    commode(S, 30, FLOOR, 330, 360, '#5a4a3a', 'study', .8); commode(S, 1420, FLOOR, 170, 300, '#5a4a3a', 'study', .7);
    table(S, 760, H - 10, 760, 150, '#4a2a14', null, 'study', .85);
    f.strokeStyle = '#2a1a10'; f.lineWidth = 8; f.beginPath(); f.moveTo(1450, H); f.lineTo(1470, 120); f.stroke(); f.fillStyle = '#4a3a2a'; f.beginPath(); f.moveTo(1440, 140); f.quadraticCurveTo(1400, 300, 1420, 500); f.lineTo(1520, 500); f.quadraticCurveTo(1540, 300, 1500, 140); f.fill(); f.fillStyle = '#2a2420'; ell(f, 1470, 120, 46, 14); f.fill(); f.fillRect(1444, 90, 52, 30);
    floorZone(S, 380, 1400, FLOOR + 30, 630); scatterFloor(S, 'study', 8); dust(c, R, 120, 900, 100, 1500, 700);
  } },
];

/* ——— Ambiances ——— */
const GW = 320, GH = 160;
function mk() { const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; return cv; }
function grad(op, a, stops) { const cv = mk(), c = cv.getContext('2d'); c.fillStyle = LG(c, 0, 0, 0, GH, stops); c.fillRect(0, 0, GW, GH); return { cv, op, a }; }
function flat(op, a, col) { const cv = mk(), c = cv.getContext('2d'); c.fillStyle = col; c.fillRect(0, 0, GW, GH); return { cv, op, a }; }
function radial(op, a, fx, fy, fr, col) {
  const cv = mk(), c = cv.getContext('2d'), x = fx * GW, y = fy * GH, r = fr * GW;
  c.fillStyle = RG(c, x, y, 0, x, y, r, [col, col.replace(',1)', ',.25)'), col.replace(',1)', ',0)')]); c.fillRect(0, 0, GW, GH); return { cv, op, a };
}
function vignette(a) { const cv = mk(), c = cv.getContext('2d'); c.save(); c.scale(1, .5); c.fillStyle = RG(c, GW / 2, GH, GW * .22, GW / 2, GH, GW * .64, ['rgba(0,0,0,0)', 'rgba(0,0,0,1)']); c.fillRect(0, 0, GW, GH * 2); c.restore(); return { cv, op: 'source-over', a }; }
function lampLayer(lights) {
  const cv = mk(), c = cv.getContext('2d'), k = GW / W;
  lights.forEach(([x, y, r]) => { c.fillStyle = RG(c, x * k, y * k, 0, x * k, y * k, r * k * 1.6, ['rgba(255,200,130,.9)', 'rgba(255,170,90,.3)', 'rgba(255,160,80,0)']); c.fillRect(0, 0, GW, GH); });
  return { cv, op: 'screen', a: .7 };
}
const AMBIANCES = [
  { name: 'Matin', layers(R) { return [grad('soft-light', .6, ['#ffd0a8', '#f8e0c8', '#a8b8e0']), radial('screen', .3, rnd(R, .2, .8), .15, .7, 'rgba(255,210,170,1)'), vignette(.45)]; } },
  { name: 'Plein jour', layers(R) { return [grad('soft-light', .3, ['#ffffff', '#fff4e0', '#e0d0b0']), radial('screen', .2, rnd(R, .2, .8), .05, .8, 'rgba(255,250,230,1)'), vignette(.35)]; } },
  { name: 'Fin d’après-midi', layers(R) { return [grad('multiply', .38, ['#ffb070', '#e08a70', '#8a5a8a']), radial('screen', .35, R() < .5 ? .1 : .9, .35, .7, 'rgba(255,170,90,1)'), vignette(.55)]; } },
  { name: 'Soirée aux lampes', lamps: true, layers() { return [grad('multiply', .42, ['#3a4a80', '#2a3460', '#1a2040']), vignette(.6)]; } },
  { name: 'Lumière poussiéreuse', layers(R) { return [flat('saturation', .28, '#808080'), grad('soft-light', .5, ['#f0d8a0', '#d8b880', '#8a6a4a']), radial('screen', .28, rnd(R, .3, .7), .1, .6, 'rgba(255,230,180,1)'), vignette(.5)]; } },
];

function levelInfo(n) {
  const t = (n - 1) % THEMES.length, lap = Math.floor((n - 1) / THEMES.length), a = (lap + t * 2) % AMBIANCES.length;
  return { theme: THEMES[t], amb: AMBIANCES[a], ambIndex: a, themeIndex: t };
}

// Peint le décor (fond + premier plan) d'un niveau
function paintScene(n, res, avoid) {
  const { theme } = levelInfo(n);
  const mkc = () => { const cv = document.createElement('canvas'); cv.width = Math.round(W * res); cv.height = Math.round(H * res); return cv; };
  const bg = mkc(), fg = mkc();
  const c = bg.getContext('2d'), f = fg.getContext('2d');
  const R = mulberry32(n * 7919 + 101);
  const li = levelInfo(n), mirror = li.mirror !== undefined ? li.mirror : n % 2 === 0;
  [c, f].forEach(x => { x.scale(res, res); if (mirror) { x.translate(W, 0); x.scale(-1, 1); } x.lineJoin = 'round'; });
  const S = { c, f, R, surf: [], floors: [], lights: [], avoid: avoid || new Set(), galleryRects: [] };
  theme.paint(S);
  if (mirror) {
    S.surf.forEach(s => { const a = W - s.x1, b = W - s.x0; s.x0 = a; s.x1 = b; });
    S.floors.forEach(z => { const a = W - z.x1, b = W - z.x0; z.x0 = a; z.x1 = b; });
    S.lights.forEach(l => { l[0] = W - l[0]; });
  }
  c.setTransform(res, 0, 0, res, 0, 0); f.setTransform(res, 0, 0, res, 0, 0);
  if (typeof paintify === 'function') paintify(bg, R);
  noise(c, .06, R);
  return { bg, fg, S };
}
function gradingFor(n, lights) {
  const { amb } = levelInfo(n);
  const L = amb.layers(mulberry32(n * 31 + 5));
  if (amb.lamps) L.splice(1, 0, lampLayer(lights));
  return L;
}
