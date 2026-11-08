'use strict';
/* ═══════════ Univers geek pour les objets cachés : nouveaux objets et nouveaux décors ═══════════ */

/* ——— 1. Les objets : on retire ceux de l’ancien univers et on ajoute des objets geek ——— */
const OLD_OBJECTS = new Set(['montre', 'plume', 'bougie', 'bague', 'parapluie', 'chapeau', 'verre', 'poire', 'champignon', 'feuille', 'fleur', 'coquillage',
  'etoile_mer', 'papillon', 'poisson', 'ancre', 'couronne', 'medaillon', 'gland', 'carotte', 'cloche', 'lanterne', 'fer_cheval', 'oeuf', 'theiere',
  'cerf_volant', 'escargot', 'brosse', 'cerises', 'citron', 'bouton', 'ballon']);
for (let i = OBJECTS.length - 1; i >= 0; i--) if (OLD_OBJECTS.has(OBJECTS[i].id)) OBJECTS.splice(i, 1);

const pixels = (c, rows, size, colors) => {
  const h = rows.length, w = rows[0].length;
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { c.fillStyle = colors[ch]; c.fillRect((x - w / 2) * size, (y - h / 2) * size, size + .4, size + .4); } }));
};
OBJECTS.push(
  { id: 'souris', name: 'Souris', d(c) {
    c.strokeStyle = '#2a2d33'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -32); c.bezierCurveTo(0, -46, 26, -40, 34, -50); c.stroke();
    c.fillStyle = LG(c, -22, -30, 22, 42, ['#f6f8fa', '#c8ced4', '#7f8892']); ell(c, 0, 8, 23, 36); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -27); c.lineTo(0, -2); c.moveTo(-22, -3); c.quadraticCurveTo(0, 4, 22, -3); c.stroke();
    c.fillStyle = '#3a3f46'; rrect(c, -3.5, -21, 7, 13, 3); c.fill();
  } },
  { id: 'disquette', name: 'Disquette', d(c) {
    c.fillStyle = LG(c, -40, -40, 40, 40, ['#4a7ae0', '#1d3f8a']);
    c.beginPath(); c.moveTo(-40, -40); c.lineTo(31, -40); c.lineTo(40, -31); c.lineTo(40, 40); c.lineTo(-40, 40); c.closePath(); c.fill();
    c.fillStyle = silver(c, -20, -40, 20, -10); c.fillRect(-20, -40, 40, 28); c.fillStyle = '#1d3f8a'; c.fillRect(5, -36, 9, 20);
    c.fillStyle = '#f4f1e8'; c.fillRect(-30, -2, 60, 38);
    c.strokeStyle = 'rgba(30,60,140,.5)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-24, 9 + i * 9); c.lineTo(24, 9 + i * 9); c.stroke(); }
  } },
  { id: 'cd', name: 'CD', d(c) {
    c.fillStyle = silver(c, -42, -42, 42, 42); circ(c, 0, 0, 42); c.fill();
    c.save(); c.globalAlpha = .5; c.fillStyle = LG(c, -40, -40, 40, 40, ['#ff9ad8', '#9ad8ff', '#c8ff9a', '#ffe89a', '#d89aff']); circ(c, 0, 0, 42); c.fill(); c.restore();
    c.fillStyle = 'rgba(255,255,255,.65)'; circ(c, 0, 0, 15); c.fill();
    cut(c, () => c.arc(0, 0, 7, 0, TAU));
  } },
  { id: 'pile', name: 'Pile', d(c) {
    c.save(); c.rotate(-.5);
    c.fillStyle = LG(c, 0, -14, 0, 14, ['#4a4a4a', '#111', '#2a2a2a']); rrect(c, -40, -14, 60, 28, 4); c.fill();
    c.fillStyle = gold(c, 0, -14, 0, 14); rrect(c, 16, -14, 24, 28, 4); c.fill();
    c.fillStyle = silver(c, 0, -6, 0, 6); c.fillRect(40, -6, 6, 12);
    c.fillStyle = '#fff'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+', 28, 1);
    c.restore();
  } },
  { id: 'puce', name: 'Puce électronique', d(c) {
    c.fillStyle = silver(c, -40, -40, 40, 40);
    for (let i = 0; i < 6; i++) { const p = -25 + i * 10; c.fillRect(p - 2.5, -42, 5, 10); c.fillRect(p - 2.5, 32, 5, 10); c.fillRect(-42, p - 2.5, 10, 5); c.fillRect(32, p - 2.5, 10, 5); }
    c.fillStyle = LG(c, -32, -32, 32, 32, ['#3a3f48', '#14171c']); rrect(c, -33, -33, 66, 66, 5); c.fill();
    c.strokeStyle = 'rgba(180,200,210,.35)'; c.lineWidth = 1.5; rrect(c, -22, -22, 44, 44, 3); c.stroke();
    c.fillStyle = 'rgba(200,215,225,.6)'; circ(c, -24, -24, 3); c.fill();
  } },
  { id: 'carte_sd', name: 'Carte SD', d(c) {
    c.fillStyle = LG(c, -28, -40, 28, 40, ['#3a4250', '#14181e']);
    c.beginPath(); c.moveTo(-28, -40); c.lineTo(14, -40); c.lineTo(28, -26); c.lineTo(28, 40); c.lineTo(-28, 40); c.closePath(); c.fill();
    c.fillStyle = gold(c, 0, -40, 0, -24); for (let i = 0; i < 5; i++) c.fillRect(-22 + i * 9, -36, 6, 14);
    c.fillStyle = '#38c8f5'; c.font = 'bold 24px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SD', 0, 12);
  } },
  { id: 'cartouche', name: 'Cartouche de jeu', d(c) {
    c.fillStyle = LG(c, -34, -42, 34, 42, ['#c8c8cc', '#8a8a92']); c.beginPath(); c.moveTo(-34, -42); c.lineTo(34, -42); c.lineTo(34, 30); c.lineTo(26, 42); c.lineTo(-34, 42); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 4; i++) c.fillRect(-24 + i * 14, -38, 8, 4);
    c.fillStyle = LG(c, -24, -26, 24, 24, ['#ff6a3d', '#c8287a']); rrect(c, -25, -28, 50, 46, 4); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText('GAME', 0, 0);
  } },
  { id: 'cassette', name: 'Cassette audio', d(c) {
    c.fillStyle = LG(c, 0, -28, 0, 28, ['#3a3a40', '#16161a']); rrect(c, -46, -28, 92, 56, 5); c.fill();
    c.fillStyle = '#f2d36b'; rrect(c, -38, -22, 76, 30, 3); c.fill();
    c.fillStyle = '#222'; rrect(c, -24, -12, 48, 14, 7); c.fill();
    c.fillStyle = '#e8e8e8'; circ(c, -14, -5, 5); c.fill(); circ(c, 14, -5, 5); c.fill();
    c.fillStyle = '#2a2a30'; c.beginPath(); c.moveTo(-26, 28); c.lineTo(-20, 14); c.lineTo(20, 14); c.lineTo(26, 28); c.fill();
  } },
  { id: 'touche', name: 'Touche de clavier', d(c) {
    c.fillStyle = '#5a6068'; rrect(c, -36, -32, 72, 70, 10); c.fill();
    c.fillStyle = LG(c, -30, -36, 30, 30, ['#f4f6f8', '#c8ced6']); rrect(c, -30, -38, 60, 58, 9); c.fill();
    c.fillStyle = '#2a2f36'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A', 0, -9);
  } },
  { id: 'robot', name: 'Robot', d(c) {
    c.strokeStyle = '#7a8088'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -42); c.stroke();
    c.fillStyle = '#ff4fa8'; circ(c, 0, -44, 6); c.fill();
    c.fillStyle = silver(c, -36, -30, 36, 36); rrect(c, -36, -30, 72, 64, 12); c.fill();
    c.fillStyle = silver(c, -46, -8, -36, 12); c.fillRect(-46, -8, 10, 20); c.fillRect(36, -8, 10, 20);
    c.fillStyle = '#12161c'; rrect(c, -27, -20, 54, 26, 8); c.fill();
    c.fillStyle = '#38c8f5'; circ(c, -12, -7, 6); c.fill(); circ(c, 12, -7, 6); c.fill();
    c.fillStyle = '#4a4f56'; for (let i = 0; i < 5; i++) c.fillRect(-18 + i * 8, 16, 5, 10);
  } },
  { id: 'invader', name: 'Space Invader', d(c) {
    pixels(c, ['..x.....x..', '...x...x...', '..xxxxxxx..', '.xx.xxx.xx.', 'xxxxxxxxxxx', 'x.xxxxxxx.x', 'x.x.....x.x', '...xx.xx...'], 8.5, { x: '#39e58c' });
  } },
  { id: 'canette', name: 'Canette de soda', d(c) {
    c.fillStyle = LG(c, -22, 0, 22, 0, ['#8a1010', '#e8302a', '#ff8a7a', '#c81a1a', '#6a0a0a']); rrect(c, -22, -38, 44, 80, 6); c.fill();
    c.fillStyle = silver(c, -22, -44, 22, -36); ell(c, 0, -38, 21, 6); c.fill();
    c.fillStyle = silver(c, -22, 38, 22, 44); c.fillRect(-20, 36, 40, 6);
    c.fillStyle = '#fff'; c.save(); c.translate(0, 4); c.rotate(-.3); c.fillRect(-18, -4, 36, 8); c.restore();
  } },
  { id: 'pizza', name: 'Part de pizza', d(c) {
    c.fillStyle = '#c8803a'; c.beginPath(); c.moveTo(-40, -32); c.quadraticCurveTo(0, -48, 40, -32); c.lineTo(40, -22); c.quadraticCurveTo(0, -36, -40, -22); c.fill();
    c.fillStyle = LG(c, 0, -30, 0, 44, ['#ffd84a', '#f2b030']); c.beginPath(); c.moveTo(-40, -24); c.quadraticCurveTo(0, -38, 40, -24); c.lineTo(0, 44); c.closePath(); c.fill();
    c.fillStyle = '#c8302a'; [[-14, -14], [12, -12], [0, 8], [-4, -26], [20, -26]].forEach(([x, y]) => { circ(c, x, y, 7); c.fill(); });
  } },
  { id: 'donut', name: 'Donut', d(c) {
    c.fillStyle = '#d89a5a'; circ(c, 0, 4, 40); c.fill();
    c.fillStyle = LG(c, -36, -36, 36, 36, ['#ffb6d8', '#ff6aa8']); blobPath(c, mulberry32(7), 0, 0, 36, .18, 14); c.fill();
    const col = ['#fff', '#39e58c', '#38c8f5', '#ffd36a']; const R = mulberry32(3);
    for (let i = 0; i < 18; i++) { const a = R() * TAU, r = 18 + R() * 14; c.save(); c.translate(Math.cos(a) * r, Math.sin(a) * r * .8); c.rotate(R() * 3); c.fillStyle = col[i % 4]; c.fillRect(-4, -1.5, 8, 3); c.restore(); }
    cut(c, () => c.arc(0, 2, 12, 0, TAU));
  } },
  { id: 'cable_usb', name: 'Câble USB', d(c) {
    c.strokeStyle = '#2a2d33'; c.lineWidth = 6; c.beginPath(); c.moveTo(-42, 40); c.bezierCurveTo(-40, 0, 10, 30, 0, 4); c.stroke();
    c.save(); c.translate(6, -10); c.rotate(.5);
    c.fillStyle = LG(c, -12, 0, 12, 0, ['#2a2d33', '#5a5f66', '#2a2d33']); rrect(c, -12, -6, 24, 34, 5); c.fill();
    c.fillStyle = silver(c, -9, -30, 9, -6); c.fillRect(-9, -30, 18, 26);
    c.fillStyle = '#1a1a1a'; c.fillRect(-4, -26, 3, 4); c.fillRect(1, -26, 3, 4);
    c.restore();
  } },
  { id: 'prise', name: 'Prise électrique', d(c) {
    c.strokeStyle = '#e8e8ea'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 26); c.bezierCurveTo(0, 44, -30, 30, -42, 46); c.stroke();
    c.fillStyle = LG(c, -26, -20, 26, 26, ['#ffffff', '#c8ccd2']); circ(c, 0, 0, 27); c.fill();
    c.fillStyle = silver(c, -12, -46, 12, -26); c.fillRect(-13, -46, 7, 22); c.fillRect(6, -46, 7, 22);
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2; circ(c, 0, 0, 20); c.stroke();
  } },
  { id: 'resistance', name: 'Résistance', d(c) {
    c.strokeStyle = silver(c, -46, 0, 46, 0); c.lineWidth = 3; c.beginPath(); c.moveTo(-48, 0); c.lineTo(48, 0); c.stroke();
    c.fillStyle = LG(c, 0, -12, 0, 12, ['#f0dcb0', '#c8a878']); rrect(c, -26, -12, 52, 24, 10); c.fill();
    ['#6a3a1a', '#1a1a1a', '#e8302a', '#d8b040'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-16 + i * 9 + (i === 3 ? 6 : 0), -12, 5, 24); });
  } },
  { id: 'led', name: 'LED', d(c) {
    c.strokeStyle = silver(c, -10, 0, 10, 0); c.lineWidth = 3; c.beginPath(); c.moveTo(-7, 14); c.lineTo(-7, 46); c.moveTo(7, 14); c.lineTo(7, 38); c.stroke();
    c.fillStyle = RG(c, -6, -18, 2, 0, -6, 26, ['#ffd0d0', '#ff3a3a', '#a00a0a']); c.beginPath(); c.moveTo(-16, 14); c.lineTo(-16, -14); c.arc(0, -14, 16, Math.PI, 0); c.lineTo(16, 14); c.closePath(); c.fill();
    c.fillStyle = '#c81a1a'; c.fillRect(-19, 10, 38, 6);
  } },
  { id: 'engrenage', name: 'Engrenage', d(c) {
    c.fillStyle = silver(c, -44, -44, 44, 44); c.beginPath();
    for (let i = 0; i < 20; i++) { const a = i * TAU / 20, r = i % 2 ? 31 : 42; c.lineTo(Math.cos(a - .12) * r, Math.sin(a - .12) * r); c.lineTo(Math.cos(a + .12) * r, Math.sin(a + .12) * r); }
    c.closePath(); c.fill(); cut(c, () => c.arc(0, 0, 13, 0, TAU));
  } },
  { id: 'd20', name: 'Dé à 20 faces', d(c) {
    const p = a => [Math.cos(a) * 42, Math.sin(a) * 42], pts = [...Array(6)].map((_, i) => p(-Math.PI / 2 + i * TAU / 6));
    c.fillStyle = LG(c, -40, -40, 40, 40, ['#c08aff', '#6a2ab8']); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; const t = [[0, 26], [-23, -13], [23, -13]];
    c.beginPath(); t.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke();
    c.beginPath(); [[0, 0, 0, 1], [2, 1, 1, 2], [4, 2, 2, 0]].forEach(([k, a]) => { c.moveTo(pts[k][0], pts[k][1]); c.lineTo(t[a][0], t[a][1]); }); c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('20', 0, 3);
  } },
  { id: 'sabre', name: 'Sabre laser', d(c) {
    c.save(); c.rotate(-.7);
    c.fillStyle = RG(c, 0, -14, 2, 0, -14, 40, ['rgba(140,240,255,.9)', 'rgba(56,200,245,.25)', 'rgba(56,200,245,0)']); rrect(c, -12, -58, 24, 66, 12); c.fill();
    c.fillStyle = '#e8fbff'; rrect(c, -4, -52, 8, 56, 4); c.fill();
    c.fillStyle = silver(c, -7, 0, 7, 0); c.fillRect(-7, 4, 14, 44);
    c.fillStyle = '#1a1a1a'; for (let i = 0; i < 4; i++) c.fillRect(-7, 18 + i * 6, 14, 3);
    c.restore();
  } },
  { id: 'coeur_pixel', name: 'Cœur pixel', d(c) {
    pixels(c, ['.xx...xx.', 'xwxx.xxxx', 'xxxxxxxxx', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..', '...xxx...', '....x....'], 9.5, { x: '#ff3a5a', w: '#ffd0da' });
  } },
  { id: 'telecommande', name: 'Télécommande', d(c) {
    c.save(); c.rotate(.4);
    c.fillStyle = LG(c, -14, 0, 14, 0, ['#1a1c20', '#3a3e46', '#1a1c20']); rrect(c, -15, -46, 30, 92, 12); c.fill();
    c.fillStyle = '#e8302a'; circ(c, 0, -34, 5); c.fill();
    c.fillStyle = '#6a7078'; for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { circ(c, -8 + k * 8, -16 + r * 10, 2.8); c.fill(); }
    c.fillStyle = '#38c8f5'; circ(c, 0, 30, 6); c.fill();
    c.restore();
  } },
  { id: 'smartwatch', name: 'Montre connectée', d(c) {
    c.fillStyle = '#2a2d33'; rrect(c, -14, -48, 28, 96, 8); c.fill();
    c.fillStyle = silver(c, -26, -26, 26, 26); rrect(c, -26, -28, 52, 56, 12); c.fill();
    c.fillStyle = '#0b1218'; rrect(c, -21, -23, 42, 46, 9); c.fill();
    c.fillStyle = '#39e58c'; c.font = 'bold 15px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('12:42', 0, 0);
  } },
  { id: 'console', name: 'Console portable', d(c) {
    c.fillStyle = LG(c, -30, -44, 30, 44, ['#d8d8dc', '#a8a8b0']); rrect(c, -30, -46, 60, 92, 8); c.fill();
    c.fillStyle = '#4a4f5a'; rrect(c, -24, -38, 48, 38, 4); c.fill();
    c.fillStyle = '#9ac83a'; c.fillRect(-18, -32, 36, 26);
    c.fillStyle = '#2a2d33'; c.fillRect(-21, 14, 16, 5); c.fillRect(-15.5, 8.5, 5, 16);
    c.fillStyle = '#a8205a'; circ(c, 12, 18, 5); c.fill(); circ(c, 22, 12, 5); c.fill();
  } },
  { id: 'rubik', name: 'Rubik’s Cube', d(c) {
    const C = ['#e8302a', '#39e58c', '#38c8f5', '#ffd36a', '#ff8a2a', '#ffffff'], R = mulberry32(11);
    const face = (o, u, v) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x = o[0] + u[0] * i + v[0] * j, y = o[1] + u[1] * i + v[1] * j; c.fillStyle = '#111'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + u[0], y + u[1]); c.lineTo(x + u[0] + v[0], y + u[1] + v[1]); c.lineTo(x + v[0], y + v[1]); c.closePath(); c.fill(); c.fillStyle = C[Math.floor(R() * 6)]; c.beginPath(); const s = .12; c.moveTo(x + (u[0] + v[0]) * s, y + (u[1] + v[1]) * s); c.lineTo(x + u[0] * (1 - s) + v[0] * s, y + u[1] * (1 - s) + v[1] * s); c.lineTo(x + (u[0] + v[0]) * (1 - s), y + (u[1] + v[1]) * (1 - s)); c.lineTo(x + u[0] * s + v[0] * (1 - s), y + u[1] * s + v[1] * (1 - s)); c.closePath(); c.fill(); } };
    face([-40, -22], [13.3, -7], [13.3, 7]); face([-40, -22], [13.3, 7], [0, 15]); face([0, 0], [13.3, -7], [0, 15]);
  } },
  { id: 'postit', name: 'Post-it', d(c) {
    c.fillStyle = LG(c, -38, -38, 38, 38, ['#fff47a', '#ffd84a']); c.beginPath(); c.moveTo(-38, -38); c.lineTo(38, -38); c.lineTo(38, 22); c.lineTo(22, 38); c.lineTo(-38, 38); c.closePath(); c.fill();
    c.fillStyle = '#e8b830'; c.beginPath(); c.moveTo(38, 22); c.lineTo(22, 22); c.lineTo(22, 38); c.fill();
    c.strokeStyle = '#3a4aa0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-26, -18); c.bezierCurveTo(-10, -26, 0, -10, 20, -20); c.moveTo(-26, 0); c.bezierCurveTo(-12, -6, 4, 8, 16, -2); c.moveTo(-26, 18); c.lineTo(4, 16); c.stroke();
  } },
  { id: 'calculatrice', name: 'Calculatrice', d(c) {
    c.fillStyle = LG(c, -30, -44, 30, 44, ['#3a3f48', '#16191e']); rrect(c, -30, -44, 60, 88, 7); c.fill();
    c.fillStyle = '#b8c8a8'; c.fillRect(-22, -36, 44, 18); c.fillStyle = '#2a3a2a'; c.font = 'bold 13px monospace'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('1337', 19, -27);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.fillStyle = k === 3 ? '#ff8a2a' : '#6a707a'; rrect(c, -22 + k * 11.5, -10 + r * 12.5, 9, 9, 2); c.fill(); }
  } },
  { id: 'routeur', name: 'Routeur Wi-Fi', d(c) {
    c.strokeStyle = '#2a2d33'; c.lineWidth = 5; c.beginPath(); c.moveTo(-26, 4); c.lineTo(-34, -44); c.moveTo(26, 4); c.lineTo(34, -44); c.stroke();
    c.fillStyle = LG(c, 0, 0, 0, 30, ['#f2f4f6', '#b8bec6']); rrect(c, -44, 2, 88, 30, 6); c.fill();
    ['#39e58c', '#39e58c', '#38c8f5', '#ffd36a'].forEach((col, i) => { c.fillStyle = col; circ(c, -24 + i * 12, 17, 3); c.fill(); });
    c.strokeStyle = 'rgba(56,200,245,.8)'; c.lineWidth = 3; [10, 18].forEach(r => { c.beginPath(); c.arc(0, -16, r, -Math.PI * .8, -Math.PI * .2); c.stroke(); });
  } }
);
// noms un peu plus geek pour certains objets restants
const RENAME = { pomme: 'Pomme croquée', de: 'Dé à six faces', carte: 'Carte à collectionner', piece: 'Pièce d’or', diamant: 'Gemme rare', fiole: 'Potion' };
OBJECTS.forEach(o => { if (RENAME[o.id]) o.name = RENAME[o.id]; });

/* ——— 2. Accessoires des décors geek ——— */
const NEONS = ['#39e58c', '#38c8f5', '#ff4fa8', '#ffd36a', '#b46cff'];
Object.assign(P, {
  gamebox(S, x, y, s) {
    const c = S.c, R = S.R, n = 3 + Math.floor(R() * 5); let w = 0;
    for (let i = 0; i < n; i++) { const bw = rnd(R, 8, 11) * s, bh = rnd(R, 52, 60) * s, col = pick(R, ['#1d4fa8', '#1a8a3a', '#c8282a', '#e8e8ea', '#2a2a30', '#7a2ab8']); c.fillStyle = LG(c, x + w, 0, x + w + bw, 0, [shade(col, .7), col, shade(col, .6)]); c.fillRect(x + w, y - bh, bw, bh); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x + w + 2 * s, y - bh + 6 * s, bw - 4 * s, 3 * s); w += bw + 1; }
    return w;
  },
  figurine(S, x, y, s) {
    const c = S.c, R = S.R, col = pick(R, NEONS), h = rnd(R, 34, 48) * s;
    c.fillStyle = '#1a1a1a'; c.fillRect(x, y - 6 * s, 26 * s, 6 * s);
    c.fillStyle = LG(c, x, 0, x + 26 * s, 0, [shade(col, .6), col, shade(col, .7)]); rrect(c, x + 5 * s, y - h, 16 * s, h - 6 * s, 5 * s); c.fill();
    circ(c, x + 13 * s, y - h - 7 * s, 9 * s); c.fill();
    c.fillStyle = '#111'; circ(c, x + 10 * s, y - h - 8 * s, 1.8 * s); c.fill(); circ(c, x + 16 * s, y - h - 8 * s, 1.8 * s); c.fill();
    return 28 * s;
  },
  cans(S, x, y, s) {
    const c = S.c, R = S.R, n = 1 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const col = pick(R, ['#c81a1a', '#1a5ac8', '#e8e8ea', '#39b54a', '#1a1a1a']); c.fillStyle = LG(c, x + i * 18 * s, 0, x + i * 18 * s + 16 * s, 0, [shade(col, .55), col, shade(col, 1.25), shade(col, .55)]); c.fillRect(x + i * 18 * s, y - 30 * s, 16 * s, 30 * s); c.fillStyle = silver(c, 0, y - 32 * s, 0, y - 28 * s); c.fillRect(x + i * 18 * s, y - 32 * s, 16 * s, 3 * s); }
    return n * 18 * s;
  },
  speaker(S, x, y, s) {
    const c = S.c, w = 34 * s, h = 54 * s;
    c.fillStyle = LG(c, x, 0, x + w, 0, ['#1a1c20', '#34383e', '#1a1c20']); rrect(c, x, y - h, w, h, 4 * s); c.fill();
    c.fillStyle = '#0a0b0d'; circ(c, x + w / 2, y - h * .34, 10 * s); c.fill(); circ(c, x + w / 2, y - h * .76, 5 * s); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.15)'; c.lineWidth = 1.5; circ(c, x + w / 2, y - h * .34, 6 * s); c.stroke();
    return w + 2;
  },
  router(S, x, y, s) {
    const c = S.c, R = S.R, w = 56 * s;
    c.strokeStyle = '#222'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x + 8 * s, y - 14 * s); c.lineTo(x + 2 * s, y - 44 * s); c.moveTo(x + w - 8 * s, y - 14 * s); c.lineTo(x + w - 2 * s, y - 44 * s); c.stroke();
    c.fillStyle = LG(c, 0, y - 16 * s, 0, y, ['#3a3e46', '#16181c']); rrect(c, x, y - 16 * s, w, 16 * s, 4 * s); c.fill();
    for (let i = 0; i < 5; i++) { c.fillStyle = R() < .7 ? '#39e58c' : '#ffd36a'; circ(c, x + 10 * s + i * 9 * s, y - 8 * s, 2 * s); c.fill(); }
    glow(c, x + w / 2, y - 8 * s, 30 * s, 'rgba(57,229,140,.25)');
    return w + 4;
  },
  cdstack(S, x, y, s) {
    const c = S.c, R = S.R, n = 4 + Math.floor(R() * 6);
    for (let i = 0; i < n; i++) { c.fillStyle = pick(R, ['#d8dce2', '#2a2d33', '#c8a8f0', '#a8d8f0']); c.fillRect(x + rnd(R, -2, 2) * s, y - (i + 1) * 5 * s, 44 * s, 4.5 * s); }
    return 46 * s;
  },
  scope(S, x, y, s) {
    const c = S.c, w = 70 * s, h = 46 * s;
    c.fillStyle = LG(c, 0, y - h, 0, y, ['#4a5058', '#22262c']); rrect(c, x, y - h, w, h, 4 * s); c.fill();
    c.fillStyle = '#0a1a10'; c.fillRect(x + 6 * s, y - h + 6 * s, 36 * s, 28 * s);
    c.strokeStyle = '#39e58c'; c.lineWidth = 2 * s; c.beginPath(); for (let k = 0; k <= 36; k++) { const xx = x + 6 * s + k * s, yy = y - h + 20 * s + Math.sin(k / 3) * 8 * s; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
    c.fillStyle = '#8a9098'; for (let i = 0; i < 4; i++) { circ(c, x + 52 * s + (i % 2) * 9 * s, y - h + 12 * s + Math.floor(i / 2) * 14 * s, 3.5 * s); c.fill(); }
    glow(c, x + 24 * s, y - h + 20 * s, 40 * s, 'rgba(57,229,140,.25)');
    return w + 4;
  },
  laptop(S, x, y, s) {
    const c = S.c, w = 90 * s;
    c.fillStyle = '#2a2d33'; c.beginPath(); c.moveTo(x + 6 * s, y - 56 * s); c.lineTo(x + w - 6 * s, y - 56 * s); c.lineTo(x + w - 10 * s, y - 6 * s); c.lineTo(x + 10 * s, y - 6 * s); c.fill();
    c.fillStyle = LG(c, 0, y - 52 * s, 0, y - 10 * s, ['#123a5a', '#0a1a2a']); c.fillRect(x + 12 * s, y - 51 * s, w - 24 * s, 40 * s);
    const R = S.R; for (let i = 0; i < 6; i++) { c.fillStyle = pick(R, NEONS); c.fillRect(x + 16 * s + rnd(R, 0, 10) * s, y - 46 * s + i * 6 * s, rnd(R, 14, 44) * s, 2.5 * s); }
    c.fillStyle = silver(c, x, y - 6 * s, x + w, y); c.fillRect(x - 4 * s, y - 7 * s, w + 8 * s, 7 * s);
    glow(c, x + w / 2, y - 30 * s, 70 * s, 'rgba(56,200,245,.22)');
    return w + 6;
  },
});
Object.assign(PROP_SETS, {
  geek: ['gamebox', 'gamebox', 'figurine', 'figurine', 'books', 'cans', 'speaker', 'router', 'cdstack', 'box', 'plant', 'lamp'],
  tech: ['router', 'scope', 'box', 'jar', 'cdstack', 'speaker', 'books', 'cans', 'laptop', 'bottle'],
  retro: ['gamebox', 'figurine', 'cdstack', 'cans', 'box', 'speaker', 'figurine'],
});

/* ——— 3. Éléments de décor ——— */
function geekWall(S, y0, y1, style, a, b) {
  const c = S.c, R = S.R;
  fillV(c, y0, y1, [a, b]);
  c.save();
  if (style === 'circuit') {
    c.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      let x = rnd(R, 0, W), y = rnd(R, y0, y1); c.strokeStyle = `rgba(56,200,245,${rnd(R, .05, .14)})`; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { if (R() < .5) x += rnd(R, -120, 120); else y += rnd(R, -80, 80); c.lineTo(x, y); }
      c.stroke(); c.fillStyle = 'rgba(56,200,245,.2)'; circ(c, x, y, 4); c.fill();
    }
  } else if (style === 'acoustic') {
    for (let y = y0; y < y1; y += 60) for (let x = 0; x < W; x += 60) { const d = ((x + y) / 60) % 2; c.fillStyle = `rgba(0,0,0,${d ? .22 : .06})`; c.fillRect(x + 2, y + 2, 56, 56); c.strokeStyle = 'rgba(255,255,255,.04)'; c.strokeRect(x + 6, y + 6, 48, 48); }
  } else if (style === 'concrete') {
    for (let i = 0; i < 50; i++) { blobPath(c, R, rnd(R, 0, W), rnd(R, y0, y1), rnd(R, 30, 110), .6, 9); c.fillStyle = R() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)'; c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = y0 + 60; y < y1; y += 120) for (let x = 80; x < W; x += 160) { circ(c, x, y, 4); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let y = y0 + 120; y < y1; y += 120) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  }
  c.restore();
  fillV(c, y0, y1, ['rgba(0,0,0,.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.25)']);
}
function ledStrip(S, y, col) {
  const c = S.c; c.fillStyle = col; c.fillRect(0, y, W, 4);
  c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = LG(c, 0, y - 40, 0, y + 90, ['rgba(0,0,0,0)', col.replace(')', ',.35)').replace('rgb', 'rgba'), 'rgba(0,0,0,0)']); c.fillRect(0, y - 40, W, 130); c.restore();
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function neonSign(S, x, y, text, col, size) {
  const c = S.c;
  c.save(); c.font = `800 ${size}px 'Oxanium', 'Arial Black', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = col; c.shadowBlur = size * .6; c.fillStyle = col; c.fillText(text, x, y); c.shadowBlur = size * .25; c.fillStyle = '#ffffff'; c.globalAlpha = .7; c.fillText(text, x, y); c.restore();
  glow(c, x, y, size * 3, hexA(col, .3)); S.lights.push([x, y, size * 4]);
}
function poster(S, x, y, w, h, kind) {
  const c = S.c, R = S.R;
  c.fillStyle = '#0d0f12'; c.fillRect(x - 6, y - 6, w + 12, h + 12);
  if (kind === 'invader') { c.fillStyle = '#10142a'; c.fillRect(x, y, w, h); c.save(); c.translate(x + w / 2, y + h * .42); pixels(c, ['..x.....x..', '...x...x...', '..xxxxxxx..', '.xx.xxx.xx.', 'xxxxxxxxxxx', 'x.xxxxxxx.x', 'x.x.....x.x', '...xx.xx...'], w / 14, { x: '#39e58c' }); c.restore(); c.fillStyle = '#ff4fa8'; c.font = `bold ${w / 8}px monospace`; c.textAlign = 'center'; c.fillText('PLAYER 1', x + w / 2, y + h * .85); }
  else if (kind === 'sunset') { c.fillStyle = LG(c, 0, y, 0, y + h, ['#1a0a3a', '#a02a8a', '#ff8a3a']); c.fillRect(x, y, w, h); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(x + w / 2, y + h * .62, w * .28, Math.PI, 0); c.fill(); c.fillStyle = '#1a0a3a'; for (let i = 0; i < 5; i++) c.fillRect(x, y + h * .5 + i * 9, w, 3 + i); c.strokeStyle = '#ff4fa8'; c.lineWidth = 1.5; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(x + w / 2 + i * 6, y + h * .64); c.lineTo(x + w / 2 + i * 30, y + h); c.stroke(); } }
  else if (kind === 'code') { c.fillStyle = '#0b1218'; c.fillRect(x, y, w, h); c.font = `bold ${w / 9}px monospace`; c.textAlign = 'left'; c.fillStyle = '#39e58c'; c.fillText('> hello', x + 10, y + h * .3); c.fillStyle = '#38c8f5'; c.fillText('  world', x + 10, y + h * .48); c.fillStyle = '#ff4fa8'; c.fillText('_', x + 10, y + h * .68); }
  else { c.fillStyle = LG(c, 0, y, 0, y + h, ['#0a1430', '#1a3a6a']); c.fillRect(x, y, w, h); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,.7)'; circ(c, x + rnd(R, 4, w - 4), y + rnd(R, 4, h - 4), rnd(R, .6, 1.8)); c.fill(); } c.save(); c.translate(x + w / 2, y + h * .55); c.rotate(-.6); c.fillStyle = '#e8e8ea'; c.beginPath(); c.moveTo(0, -h * .3); c.quadraticCurveTo(w * .12, -h * .1, w * .1, h * .15); c.lineTo(-w * .1, h * .15); c.quadraticCurveTo(-w * .12, -h * .1, 0, -h * .3); c.fill(); c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(-w * .07, h * .15); c.lineTo(0, h * .32); c.lineTo(w * .07, h * .15); c.fill(); c.restore(); }
}
function monitor(S, x, yb, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = '#1a1c20'; c.fillRect(x + w / 2 - 8, yb - 34, 16, 30); c.fillRect(x + w / 2 - 40, yb - 8, 80, 8);
  c.fillStyle = '#0d0f12'; rrect(c, x, yb - h - 30, w, h, 6); c.fill();
  c.fillStyle = LG(c, 0, yb - h - 24, 0, yb - 36, ['#0f2238', '#071018']); c.fillRect(x + 7, yb - h - 23, w - 14, h - 14);
  c.font = `bold ${Math.round(h / 13)}px monospace`;
  for (let i = 0, yy = yb - h - 12; yy < yb - 42; i++, yy += h / 11) { const ind = Math.floor(R() * 3) * 14; c.fillStyle = pick(R, NEONS); c.globalAlpha = .85; c.fillRect(x + 16 + ind, yy, rnd(R, 20, w * .55), h / 26); c.globalAlpha = 1; }
  glow(c, x + w / 2, yb - h / 2 - 30, w * .9, 'rgba(56,200,245,.22)'); S.lights.push([x + w / 2, yb - h / 2 - 30, w * 1.2]);
}
function pcTower(S, x, yb, w, h) {
  const c = S.c;
  c.fillStyle = LG(c, x, 0, x + w, 0, ['#0d0f12', '#22262c', '#0d0f12']); rrect(c, x, yb - h, w, h, 6); c.fill();
  c.fillStyle = 'rgba(56,200,245,.08)'; c.fillRect(x + 10, yb - h + 12, w - 20, h - 40);
  for (let i = 0; i < 3; i++) { const cy = yb - h + 50 + i * (h - 80) / 3, col = NEONS[i % 3]; c.strokeStyle = col; c.lineWidth = 4; circ(c, x + w / 2, cy, w * .28); c.stroke(); glow(c, x + w / 2, cy, w * .6, hexA(col, .35)); }
  surface(S, x + 6, x + w - 6, yb - h, .85, 'top');
}
function desk(S, cx, yb, w, h, top, set, dens) {
  const c = S.c;
  c.fillStyle = '#121418'; c.fillRect(cx - w / 2 + 14, yb - h, 14, h); c.fillRect(cx + w / 2 - 28, yb - h, 14, h);
  c.fillStyle = LG(c, 0, yb - h - 4, 0, yb - h + 18, [shade(top, 1.35), shade(top, .7)]); c.fillRect(cx - w / 2, yb - h - 4, w, 20);
  c.fillStyle = hexA('#38c8f5', .5); c.fillRect(cx - w / 2, yb - h + 15, w, 3);
  const s = { x0: cx - w / 2 + 16, x1: cx + w / 2 - 16, y: yb - h - 4, sc: .95 };
  if (set) fillSurface(S, s, set, dens || .4); surface(S, s.x0, s.x1, s.y, s.sc, 'top');
}
function keyboardDesk(S, x, y, w) {
  const c = S.c; c.fillStyle = '#1a1c20'; rrect(c, x, y - 12, w, 12, 3); c.fill();
  for (let i = 0; i < w / 9 - 1; i++) { c.fillStyle = NEONS[i % 5]; c.globalAlpha = .55; c.fillRect(x + 4 + i * 9, y - 9, 6, 3); c.globalAlpha = 1; }
}
function rack(S, x, yb, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = LG(c, x, 0, x + w, 0, ['#0a0b0d', '#25292f', '#0a0b0d']); c.fillRect(x, yb - h, w, h);
  for (let y = yb - h + 16; y < yb - 30; y += 26) {
    c.fillStyle = R() < .5 ? '#16181c' : '#1e2126'; c.fillRect(x + 10, y, w - 20, 22);
    c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 8; k++) c.fillRect(x + 16 + k * 6, y + 5, 3, 12);
    for (let k = 0; k < 4; k++) { if (R() < .3) continue; const col = pick(R, ['#39e58c', '#39e58c', '#38c8f5', '#ffd36a', '#ff4fa8']); c.fillStyle = col; circ(c, x + w - 24 - k * 10, y + 11, 2.6); c.fill(); }
  }
  glow(c, x + w / 2, yb - h / 2, w * 1.1, 'rgba(56,200,245,.12)');
  surface(S, x + 6, x + w - 6, yb - h, .85, 'top');
}
function cableTray(S, y) {
  const c = S.c, R = S.R; c.fillStyle = '#3a3f46'; c.fillRect(0, y, W, 14); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(0, y + 14, W, 4);
  for (let i = 0; i < 26; i++) { const x0 = rnd(R, 0, W), x1 = x0 + rnd(R, -90, 90), d = rnd(R, 30, 110); c.strokeStyle = pick(R, ['#1d4fa8', '#c8282a', '#e8c020', '#2a2a2a', '#39b54a']); c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y + 14); c.quadraticCurveTo((x0 + x1) / 2, y + 14 + d, x1, y + 14); c.stroke(); }
}
function tubeLights(S, xs, y) {
  const f = S.f; xs.forEach(x => { f.fillStyle = '#d8e8f0'; f.fillRect(x - 110, y, 220, 10); f.fillStyle = '#4a5058'; f.fillRect(x - 116, y - 6, 232, 8); glow(S.c, x, y + 20, 260, 'rgba(200,235,255,.28)'); S.lights.push([x, y + 30, 320]); });
}
function cables(S, n) {
  const c = S.c, R = S.R; for (let i = 0; i < n; i++) { const x0 = rnd(R, 100, W - 100), y0 = FLOOR + rnd(R, 10, 60), x1 = x0 + rnd(R, -300, 300), y1 = H - rnd(R, 10, 80); c.strokeStyle = pick(R, ['#16181c', '#2a2d33', '#1d3f8a', '#8a1a1a']); c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + rnd(R, -150, 150), y0 + 60, x1 + rnd(R, -150, 150), y1 - 60, x1, y1); c.stroke(); }
}
function windowCity(S, x, y, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = '#0d0f12'; c.fillRect(x - 10, y - 10, w + 20, h + 20);
  c.fillStyle = LG(c, 0, y, 0, y + h, ['#0a0f2a', '#2a1a4a', '#5a2a5a']); c.fillRect(x, y, w, h);
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,.6)'; circ(c, x + rnd(R, 0, w), y + rnd(R, 0, h * .4), rnd(R, .5, 1.4)); c.fill(); }
  let bx = x; while (bx < x + w) { const bw = rnd(R, 30, 70), bh = rnd(R, h * .3, h * .75); c.fillStyle = pick(R, ['#0a0c14', '#11141e', '#161a26']); c.fillRect(bx, y + h - bh, bw, bh); for (let wy = y + h - bh + 8; wy < y + h - 6; wy += 12) for (let wx = bx + 5; wx < bx + bw - 6; wx += 10) if (R() < .35) { c.fillStyle = pick(R, ['#ffd36a', '#ffe8a8', '#38c8f5']); c.fillRect(wx, wy, 4, 5); } bx += bw + 2; }
  c.strokeStyle = '#1a1c20'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
  surface(S, x - 10, x + w + 10, y + h + 10, .8);
}
function arcade(S, x, yb, w, h, col, title) {
  const c = S.c, R = S.R;
  c.fillStyle = LG(c, x, 0, x + w, 0, [shade(col, .35), shade(col, .8), shade(col, .35)]); c.beginPath(); c.moveTo(x, yb); c.lineTo(x, yb - h); c.lineTo(x + w, yb - h); c.lineTo(x + w, yb); c.closePath(); c.fill();
  c.fillStyle = '#0a0b0d'; c.fillRect(x + 12, yb - h + 12, w - 24, 40);
  c.save(); c.font = `800 ${Math.round(w / 7.5)}px 'Oxanium', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = col; c.shadowBlur = 14; c.fillStyle = col; c.fillText(title, x + w / 2, yb - h + 33); c.restore();
  c.fillStyle = '#05060a'; c.fillRect(x + 18, yb - h + 64, w - 36, h * .38);
  for (let i = 0; i < 9; i++) { c.fillStyle = pick(R, NEONS); c.fillRect(x + 26 + rnd(R, 0, w - 60), yb - h + 70 + rnd(R, 0, h * .33), rnd(R, 6, 14), rnd(R, 6, 10)); }
  glow(c, x + w / 2, yb - h + 64 + h * .19, w * .9, hexA(col, .3)); S.lights.push([x + w / 2, yb - h + 80, w * 1.4]);
  const py = yb - h + 72 + h * .38;
  c.fillStyle = shade(col, .55); c.beginPath(); c.moveTo(x + 6, py); c.lineTo(x + w - 6, py); c.lineTo(x + w + 6, py + 34); c.lineTo(x - 6, py + 34); c.fill();
  c.fillStyle = '#111'; c.fillRect(x + w * .25 - 2, py + 6, 4, 14); c.fillStyle = '#e8302a'; circ(c, x + w * .25, py + 6, 7); c.fill();
  ['#ffd36a', '#38c8f5', '#39e58c'].forEach((b, i) => { c.fillStyle = b; circ(c, x + w * .55 + i * 16, py + 16, 5.5); c.fill(); });
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + w * .3, yb - 90, w * .4, 40); c.fillStyle = '#ffd36a'; c.fillRect(x + w * .45, yb - 80, w * .1, 20);
  surface(S, x + 8, x + w - 8, yb - h, .75, 'top');
}
function bigTV(S, x, y, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = '#0a0b0d'; rrect(c, x - 10, y - 10, w + 20, h + 20, 8); c.fill();
  c.fillStyle = LG(c, 0, y, 0, y + h, ['#3a8ae8', '#a8e0ff']); c.fillRect(x, y, w, h);
  c.fillStyle = '#3aa84a'; c.fillRect(x, y + h * .72, w, h * .28);
  c.fillStyle = '#8a5a2a'; for (let i = 0; i < 6; i++) c.fillRect(x + w * (.1 + i * .14), y + h * .6, w * .08, h * .12);
  c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { ell(c, x + w * (.2 + i * .3), y + h * .2, w * .07, h * .05); c.fill(); }
  c.fillStyle = '#e8302a'; c.fillRect(x + w * .3, y + h * .52, w * .05, h * .08); c.fillStyle = '#ffd36a'; c.font = `bold ${h / 10}px monospace`; c.fillText('1-UP', x + 14, y + h / 10 + 6);
  glow(c, x + w / 2, y + h / 2, w * .8, 'rgba(120,200,255,.25)'); S.lights.push([x + w / 2, y + h / 2, w]);
}
function beanbag(S, x, yb, w, h, col) {
  const c = S.c; c.fillStyle = RG(c, x + w * .4, yb - h * .7, 10, x + w / 2, yb - h / 2, w * .7, [shade(col, 1.3), col, shade(col, .5)]);
  c.beginPath(); c.moveTo(x, yb); c.quadraticCurveTo(x - 10, yb - h * .8, x + w * .45, yb - h); c.quadraticCurveTo(x + w + 10, yb - h * .9, x + w, yb); c.closePath(); c.fill();
  surface(S, x + w * .2, x + w * .8, yb - h * .7, .95, 'seat');
}
function pegboard(S, x, y, w, h) {
  const c = S.c, R = S.R;
  c.fillStyle = '#c8a878'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(0,0,0,.35)';
  for (let yy = y + 12; yy < y + h; yy += 20) for (let xx = x + 12; xx < x + w; xx += 20) { circ(c, xx, yy, 2.2); c.fill(); }
  for (let tx = x + 30; tx < x + w - 30; tx += rnd(R, 50, 80)) {
    const k = Math.floor(R() * 4), ty = y + rnd(R, 20, 60); c.fillStyle = silver(c, tx - 10, ty, tx + 10, ty + 80);
    if (k === 0) { c.fillRect(tx - 4, ty, 8, 70); circ(c, tx, ty, 12); c.fill(); }
    else if (k === 1) { c.fillStyle = '#c8282a'; c.fillRect(tx - 6, ty + 30, 12, 50); c.fillStyle = silver(c, tx - 4, ty, tx + 4, ty + 30); c.fillRect(tx - 2, ty, 4, 32); }
    else if (k === 2) { c.strokeStyle = '#2a2d33'; c.lineWidth = 6; c.beginPath(); c.moveTo(tx - 10, ty + 70); c.lineTo(tx, ty); c.lineTo(tx + 10, ty + 70); c.stroke(); }
    else { c.strokeStyle = pick(R, ['#1d4fa8', '#c8282a', '#e8c020']); c.lineWidth = 5; for (let i = 0; i < 4; i++) { ell(c, tx, ty + 30, 18 - i * 2, 26 - i * 2); c.stroke(); } }
  }
}
function garageDoor(S, x, y, w, h) {
  const c = S.c; c.fillStyle = LG(c, 0, y, 0, y + h, ['#9aa0a8', '#5a6068']); c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let yy = y + 40; yy < y + h; yy += 46) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
  c.fillStyle = LG(c, 0, y + 50, 0, y + 90, ['#a8d0e8', '#e8f4fa']); for (let i = 0; i < 4; i++) c.fillRect(x + 20 + i * (w - 40) / 4, y + 50, (w - 40) / 4 - 14, 34);
  c.fillStyle = '#e8c020'; for (let i = 0; i < w; i += 40) c.fillRect(x + i, y + h - 10, 20, 10);
}

/* ——— 4. Les cinq décors geek ——— */
const GEEK_THEMES = [
  { key: 'dev', name: 'Bureau du développeur', mood: 'night', sw: ['#141b2a', '#38c8f5'], paint(S) {
    geekWall(S, 0, FLOOR, 'circuit', '#24304a', '#121828'); floor(S, 'carpet', '#3a3f4a', '#1a1d24'); ledStrip(S, 8, 'rgb(56,200,245)');
    poster(S, 70, 60, 150, 190, 'invader'); poster(S, 250, 80, 130, 160, 'code');
    wallShelf(S, 40, 330, 400, '#2a2f3a', 'geek', .9); wallShelf(S, 40, 200 + 230, 400, '#2a2f3a', 'geek', .85);
    windowCity(S, 1230, 60, 300, 260); commode(S, 1220, FLOOR + 30, 320, 140, '#22262e', 'geek', .7);
    desk(S, 800, FLOOR + 50, 720, 160, '#2a2a30', 'geek', .35);
    monitor(S, 500, FLOOR - 110, 200, 130); monitor(S, 710, FLOOR - 110, 250, 160); monitor(S, 970, FLOOR - 110, 190, 120);
    keyboardDesk(S, 720, FLOOR - 112, 160);
    pcTower(S, 1070, FLOOR + 60, 110, 230);
    rug(S, 780, 700, 420, 60, '#1d3a5a', '#0a1420');
    floorZone(S, 120, 1500, FLOOR + 60, H - 30); cables(S, 6); scatterFloor(S, 'geek', 5);
    plantBig(S, 70, H + 20, 300, true); fgFrame(S, 'plant', 'right');
  } },
  { key: 'serveurs', name: 'Salle des serveurs', mood: 'space', sw: ['#15191d', '#39e58c'], paint(S) {
    geekWall(S, 0, FLOOR, 'concrete', '#2c333a', '#14181c'); floor(S, 'tiles', '#3a4048', '#1a1e24');
    cableTray(S, 40);
    for (let i = 0; i < 3; i++) rack(S, 40 + i * 190, FLOOR + 30, 170, 470);
    for (let i = 0; i < 3; i++) rack(S, 1010 + i * 190, FLOOR + 30, 170, 470);
    desk(S, 800, FLOOR + 50, 340, 150, '#3a3f46', 'tech', .7);
    tubeLights(S, [400, 1200], 92);
    crate(S, 640, FLOOR + 110, 120, 80, '#3a4048', 'tech', .7); crate(S, 860, FLOOR + 120, 150, 70, '#3a4048', 'tech', .6);
    floorZone(S, 80, 1520, FLOOR + 60, H - 30); cables(S, 8); scatterFloor(S, 'tech', 6);
    fgFrame(S, 'beam', 'left');
  } },
  { key: 'garage', name: 'Garage-atelier électronique', mood: 'bright', sw: ['#4a2a1e', '#ffd36a'], paint(S) {
    wall(S, 0, FLOOR, 'brick', '#7a4a3a', '#4a2a1e'); floor(S, 'tiles', '#6a6a66', '#3a3a38');
    pegboard(S, 60, 60, 520, 250);
    desk(S, 360, FLOOR + 40, 640, 160, '#8a6a4a', 'tech', .75);
    wallShelf(S, 650, 120, 380, '#5a4a3a', 'tech', .9); wallShelf(S, 650, 270, 380, '#5a4a3a', 'tech', .9);
    garageDoor(S, 1100, 40, 470, FLOOR - 40);
    crate(S, 1120, FLOOR + 60, 170, 130, '#7a5a34', 'tech'); barrel(S, 1320, FLOOR + 60, 120, 170, '#3a5a7a');
    commode(S, 700, FLOOR + 20, 320, 140, '#c8282a', 'tech', .7);
    hangingLamps(S, [330, 870], 100, '#d8d0b0');
    floorZone(S, 120, 1500, FLOOR + 60, H - 30); cables(S, 4); scatterFloor(S, 'tech', 6);
    fgFrame(S, 'beam', 'right');
  } },
  { key: 'arcade', name: 'Salle d’arcade rétro', mood: 'mystery', sw: ['#120a24', '#ff4fa8'], paint(S) {
    geekWall(S, 0, FLOOR, 'acoustic', '#24163e', '#0e0818'); floor(S, 'carpet', '#2a1a4a', '#100820');
    const c = S.c, R = S.R; for (let i = 0; i < 90; i++) { c.fillStyle = pick(R, NEONS); c.globalAlpha = .35; circ(c, rnd(R, 0, W), rnd(R, FLOOR + 10, H), rnd(R, 2, 6)); c.fill(); c.globalAlpha = 1; }
    neonSign(S, 420, 70, 'ARCADE', '#ff4fa8', 64); neonSign(S, 1180, 70, 'GAME OVER', '#38c8f5', 46); ledStrip(S, 132, 'rgb(180,108,255)');
    const cols = ['#ff4fa8', '#38c8f5', '#39e58c', '#ffd36a', '#b46cff'], titles = ['PAC', 'SPACE', 'KONG', 'RACE', 'NINJA'];
    for (let i = 0; i < 5; i++) arcade(S, 70 + i * 300, FLOOR + 40, 210, 380, cols[i], titles[i]);
    table(S, 800, H - 10, 300, 110, '#2a2a3a', null, 'retro', .7);
    floorZone(S, 80, 1520, FLOOR + 60, H - 30); scatterFloor(S, 'retro', 5);
    fgFrame(S, 'plant', 'left');
  } },
  { key: 'salon', name: 'Salon gaming de Papa', mood: 'calm', sw: ['#17131f', '#b46cff'], paint(S) {
    geekWall(S, 0, FLOOR, 'acoustic', '#2c2440', '#15111e'); floor(S, 'parquet', '#6a4a32', '#2e1e12'); ledStrip(S, 10, 'rgb(255,79,168)');
    bookcase(S, 40, FLOOR, 360, 480, '#2a2430', 'geek', false);
    bigTV(S, 530, 80, 540, 300);
    commode(S, 500, FLOOR + 20, 600, 120, '#1e1e24', 'geek', .7);
    windowCity(S, 1230, 60, 300, 280);
    rug(S, 700, 690, 480, 70, '#3a2a5a', '#120a24');
    sofa(S, 960, H - 10, 520, 200, '#3a4a6a'); beanbag(S, 330, H - 20, 220, 150, '#ff4fa8');
    floorZone(S, 120, 900, FLOOR + 60, H - 40); cables(S, 3); scatterFloor(S, 'geek', 6);
    plantBig(S, 1540, H + 20, 300, true);
  } },
];
const GEEK_AMBIANCES = [
  { name: 'lueur des écrans', layers(R) { return [grad('soft-light', .45, ['#a8d8ff', '#c8e0ff', '#6a8ad8']), radial('screen', .25, rnd(R, .3, .7), .4, .6, 'rgba(120,200,255,1)'), vignette(.5)]; } },
  { name: 'nuit blanche', lamps: true, layers() { return [grad('multiply', .42, ['#3a4a80', '#2a3460', '#1a2040']), vignette(.6)]; } },
  { name: 'plein jour', layers(R) { return [grad('soft-light', .3, ['#ffffff', '#f4f8ff', '#d8e0f0']), radial('screen', .2, rnd(R, .2, .8), .05, .8, 'rgba(255,250,240,1)'), vignette(.35)]; } },
  { name: 'néons de minuit', layers(R) { return [grad('multiply', .3, ['#5a3a9a', '#3a2a6a', '#1a1040']), radial('screen', .3, .2, .5, .5, 'rgba(255,79,168,1)'), radial('screen', .25, .8, .5, .5, 'rgba(56,200,245,1)'), vignette(.55)]; } },
  { name: 'fin de journée', layers(R) { return [grad('multiply', .3, ['#ffb070', '#e08a70', '#8a5a8a']), radial('screen', .3, R() < .5 ? .1 : .9, .35, .7, 'rgba(255,170,90,1)'), vignette(.5)]; } },
];
THEMES.length = 0; GEEK_THEMES.forEach(t => THEMES.push(t));
AMBIANCES.length = 0; GEEK_AMBIANCES.forEach(a => AMBIANCES.push(a));
// Les 10 niveaux d’objets cachés (1, 11, 21…) parcourent les 5 décors deux fois, avec une autre lumière et en miroir la seconde fois
levelInfo = n => {
  const k = Math.floor((n - 1) / 10), t = k % THEMES.length, a = (t + (k >= THEMES.length ? 2 : 0)) % AMBIANCES.length;
  return { theme: THEMES[t], amb: AMBIANCES[a], ambIndex: a, themeIndex: t, mirror: k >= THEMES.length };
};
