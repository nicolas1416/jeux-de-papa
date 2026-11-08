// Bibliothèque d'objets : chaque objet est dessiné dans une boîte de -50 à 50.
'use strict';
const TAU = Math.PI * 2;

function LG(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
function RG(c, x0, y0, r0, x1, y1, r1, stops) {
  const g = c.createRadialGradient(x0, y0, r0, x1, y1, r1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
function rrect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
const gold = (c, a, b, d, e) => LG(c, a, b, d, e, ['#fff1c2', '#e3b75a', '#a5741f', '#f0cf7a', '#6b4610']);
const silver = (c, a, b, d, e) => LG(c, a, b, d, e, ['#ffffff', '#c9d0d6', '#7d8790', '#dfe4e8', '#4d555c']);
const wood = (c, a, b, d, e) => LG(c, a, b, d, e, ['#a56a3a', '#6e4220', '#8d5a2e', '#4f2d14']);
function cut(c, fn) {
  c.save(); c.globalCompositeOperation = 'destination-out';
  c.beginPath(); fn(); c.fill(); c.restore();
}
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }
function star(c, x, y, R, r, n) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath();
}

const OBJECTS = [
  { id: 'cle', name: 'Clé', d(c) {
    c.fillStyle = gold(c, -45, -20, 45, 20);
    circ(c, -26, 0, 17); c.fill();
    c.fillRect(-12, -5, 58, 10); c.fillRect(30, 4, 6, 14); c.fillRect(41, 4, 5, 10);
    cut(c, () => c.arc(-26, 0, 8, 0, TAU));
  } },
  { id: 'montre', name: 'Montre à gousset', d(c) {
    c.strokeStyle = '#b8862c'; c.lineWidth = 4; circ(c, 0, -42, 7); c.stroke();
    c.fillStyle = gold(c, -10, -40, 10, -30); c.fillRect(-5, -38, 10, 9);
    c.fillStyle = gold(c, -36, -30, 36, 40); circ(c, 0, 4, 36); c.fill();
    c.fillStyle = RG(c, -8, -6, 2, 0, 4, 32, ['#ffffff', '#eadfc8']); circ(c, 0, 4, 29); c.fill();
    c.strokeStyle = '#3a3226'; c.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; c.beginPath(); c.moveTo(Math.cos(a) * 23, 4 + Math.sin(a) * 23); c.lineTo(Math.cos(a) * 27, 4 + Math.sin(a) * 27); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.moveTo(0, 4); c.lineTo(10, -8); c.moveTo(0, 4); c.lineTo(-4, 22); c.stroke();
  } },
  { id: 'lunettes', name: 'Lunettes', d(c) {
    c.fillStyle = 'rgba(170,210,230,.35)'; circ(c, -22, 0, 18); c.fill(); circ(c, 22, 0, 18); c.fill();
    c.strokeStyle = LG(c, -40, -20, 40, 20, ['#2b2522', '#6b5a4c', '#1c1714']); c.lineWidth = 5;
    circ(c, -22, 0, 18); c.stroke(); circ(c, 22, 0, 18); c.stroke();
    c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(0, -10, 6, -4); c.stroke();
    c.beginPath(); c.moveTo(-40, -3); c.lineTo(-48, -10); c.moveTo(40, -3); c.lineTo(48, -10); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2;
    c.beginPath(); c.arc(-22, 0, 12, 3.6, 4.4); c.stroke(); c.beginPath(); c.arc(22, 0, 12, 3.6, 4.4); c.stroke();
  } },
  { id: 'plume', name: 'Plume', d(c) {
    c.fillStyle = LG(c, -30, 40, 30, -40, ['#2f5866', '#86bcc6', '#eef6f3']);
    c.beginPath(); c.moveTo(-26, 44); c.quadraticCurveTo(-34, -6, 24, -48); c.quadraticCurveTo(28, 6, -18, 40); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,40,50,.35)'; c.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const t = i / 9; c.beginPath(); c.moveTo(-20 + t * 38, 36 - t * 80); c.lineTo(-30 + t * 34, 22 - t * 80); c.stroke(); }
    c.strokeStyle = '#f6f1e3'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-32, 50); c.quadraticCurveTo(-12, 0, 22, -46); c.stroke();
  } },
  { id: 'bougie', name: 'Bougie', d(c) {
    c.fillStyle = RG(c, 0, -32, 2, 0, -30, 22, ['rgba(255,240,180,.9)', 'rgba(255,170,60,.35)', 'rgba(255,140,40,0)']); circ(c, 0, -30, 22); c.fill();
    c.fillStyle = LG(c, -16, 0, 16, 0, ['#d9cdb0', '#fff8e8', '#c9b996']); c.fillRect(-14, -14, 28, 60);
    ell(c, 0, -14, 14, 4); c.fillStyle = '#f2e7cc'; c.fill();
    c.fillStyle = '#ead9b2'; c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-8, 4, -4, 10); c.quadraticCurveTo(-2, 0, -2, -14); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -14); c.lineTo(0, -22); c.stroke();
    c.fillStyle = RG(c, 0, -28, 1, 0, -28, 10, ['#ffffff', '#ffd76a', '#ff8a1c']);
    c.beginPath(); c.moveTo(0, -42); c.quadraticCurveTo(7, -28, 0, -21); c.quadraticCurveTo(-7, -28, 0, -42); c.fill();
  } },
  { id: 'tasse', name: 'Tasse', d(c) {
    ell(c, 0, 30, 44, 11); c.fillStyle = LG(c, 0, 20, 0, 42, ['#ffffff', '#c7ccd2']); c.fill();
    c.strokeStyle = '#e8ecef'; c.lineWidth = 7; c.beginPath(); c.arc(30, 2, 12, -1.3, 1.4); c.stroke();
    c.fillStyle = LG(c, -30, 0, 30, 0, ['#c5cbd1', '#ffffff', '#b6bcc3']);
    c.beginPath(); c.moveTo(-30, -16); c.lineTo(30, -16); c.quadraticCurveTo(28, 24, 0, 26); c.quadraticCurveTo(-28, 24, -30, -16); c.fill();
    ell(c, 0, -16, 30, 8); c.fillStyle = '#e9edf0'; c.fill();
    ell(c, 0, -15, 26, 6); c.fillStyle = RG(c, -6, -16, 1, 0, -15, 26, ['#8a5a36', '#3b2112']); c.fill();
    c.strokeStyle = '#3d6f8e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-28, -6); c.quadraticCurveTo(0, 0, 28, -6); c.stroke();
  } },
  { id: 'livre', name: 'Livre', d(c) {
    c.fillStyle = '#efe6d0'; c.fillRect(-30, -40, 64, 82);
    c.strokeStyle = 'rgba(120,100,70,.4)'; c.lineWidth = 1;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-28 + i, 41 - i); c.lineTo(34 - i, 41 - i); c.stroke(); }
    c.fillStyle = LG(c, -36, 0, 30, 0, ['#4a1d1d', '#8c2f2a', '#5a1f1c']); rrect(c, -36, -44, 64, 82, 3); c.fill();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-36, -44, 9, 82);
    c.strokeStyle = '#d9b25c'; c.lineWidth = 2; c.strokeRect(-20, -32, 40, 56);
    c.fillStyle = '#d9b25c'; c.fillRect(-12, -14, 24, 3); c.fillRect(-8, -8, 16, 2);
  } },
  { id: 'crayon', name: 'Crayon', d(c) {
    c.save(); c.rotate(-0.6);
    c.fillStyle = LG(c, 0, -7, 0, 7, ['#ffd85a', '#f2b51c', '#c98a08']); c.fillRect(-36, -7, 62, 14);
    c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-36, -2, 62, 3);
    c.fillStyle = '#e8c49a'; c.beginPath(); c.moveTo(26, -7); c.lineTo(46, 0); c.lineTo(26, 7); c.fill();
    c.fillStyle = '#2a2a2a'; c.beginPath(); c.moveTo(40, -2.2); c.lineTo(46, 0); c.lineTo(40, 2.2); c.fill();
    c.fillStyle = silver(c, -44, -7, -36, 7); c.fillRect(-44, -7, 9, 14);
    c.fillStyle = LG(c, 0, -7, 0, 7, ['#f6a3a8', '#d76d76']); rrect(c, -54, -7, 12, 14, 3); c.fill();
    c.restore();
  } },
  { id: 'piece', name: 'Pièce', d(c) {
    ell(c, 2, 4, 36, 36); c.fillStyle = '#7a5418'; c.fill();
    circ(c, 0, 0, 36); c.fillStyle = gold(c, -36, -36, 36, 36); c.fill();
    c.strokeStyle = 'rgba(110,70,15,.7)'; c.lineWidth = 2; circ(c, 0, 0, 29); c.stroke();
    star(c, 0, 0, 16, 7, 5); c.fillStyle = gold(c, 16, 16, -16, -16); c.fill();
    c.strokeStyle = 'rgba(110,70,15,.5)'; c.lineWidth = 1; c.stroke();
  } },
  { id: 'bague', name: 'Bague', d(c) {
    c.strokeStyle = gold(c, -30, 0, 30, 0); c.lineWidth = 9; ell(c, 0, 12, 28, 22); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 12, 28, 22, 0, 3.4, 4.6); c.stroke();
    c.fillStyle = gold(c, -10, -20, 10, -10); c.fillRect(-9, -18, 18, 10);
    c.fillStyle = LG(c, -14, -40, 14, -14, ['#e9fbff', '#5fc6e8', '#1b6d9a', '#bdf0ff']);
    c.beginPath(); c.moveTo(-14, -26); c.lineTo(-8, -38); c.lineTo(8, -38); c.lineTo(14, -26); c.lineTo(0, -14); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-14, -26); c.lineTo(14, -26); c.moveTo(-8, -38); c.lineTo(0, -26); c.lineTo(8, -38); c.stroke();
  } },
  { id: 'ciseaux', name: 'Ciseaux', d(c) {
    c.fillStyle = silver(c, -10, -46, 10, 0);
    c.beginPath(); c.moveTo(-3, 4); c.lineTo(-14, -46); c.lineTo(4, -2); c.fill();
    c.beginPath(); c.moveTo(3, 4); c.lineTo(14, -46); c.lineTo(-4, -2); c.fill();
    c.strokeStyle = LG(c, -30, 10, 30, 40, ['#d64545', '#8a1f1f']); c.lineWidth = 7;
    ell(c, -15, 28, 12, 15, 0.4); c.stroke(); ell(c, 15, 28, 12, 15, -0.4); c.stroke();
    c.fillStyle = '#555'; circ(c, 0, 2, 3.5); c.fill();
  } },
  { id: 'loupe', name: 'Loupe', d(c) {
    c.save(); c.rotate(0.7);
    c.fillStyle = wood(c, -6, 20, 6, 50); rrect(c, -6, 22, 12, 30, 5); c.fill();
    c.fillStyle = silver(c, -5, 14, 5, 24); c.fillRect(-5, 14, 10, 10);
    c.restore();
    c.fillStyle = RG(c, -18, -18, 2, -6, -6, 30, ['rgba(255,255,255,.85)', 'rgba(190,225,240,.35)', 'rgba(120,170,200,.45)']); circ(c, -6, -6, 28); c.fill();
    c.strokeStyle = silver(c, -34, -34, 22, 22); c.lineWidth = 7; circ(c, -6, -6, 28); c.stroke();
  } },
  { id: 'ampoule', name: 'Ampoule', d(c) {
    c.fillStyle = RG(c, -8, -18, 2, 0, -10, 32, ['#ffffff', 'rgba(255,240,190,.9)', 'rgba(230,210,150,.6)']);
    c.beginPath(); c.arc(0, -12, 28, Math.PI * 0.8, Math.PI * 0.2); c.lineTo(10, 18); c.lineTo(-10, 18); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,130,80,.6)'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#c47a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, 16); c.lineTo(-5, -8); c.lineTo(0, -14); c.lineTo(5, -8); c.lineTo(5, 16); c.stroke();
    c.fillStyle = silver(c, -12, 18, 12, 40);
    for (let i = 0; i < 4; i++) { rrect(c, -12 + i * .5, 18 + i * 6, 24 - i, 6, 2); c.fill(); }
    c.fillStyle = '#333'; c.beginPath(); c.moveTo(-7, 42); c.lineTo(7, 42); c.lineTo(0, 48); c.fill();
  } },
  { id: 'cadenas', name: 'Cadenas', d(c) {
    c.strokeStyle = silver(c, -20, -40, 20, 0); c.lineWidth = 8;
    c.beginPath(); c.moveTo(-17, 0); c.lineTo(-17, -18); c.arc(0, -18, 17, Math.PI, 0); c.lineTo(17, 0); c.stroke();
    c.fillStyle = gold(c, -30, -4, 30, 44); rrect(c, -30, -4, 60, 48, 7); c.fill();
    c.fillStyle = '#2b1b08'; circ(c, 0, 14, 6); c.fill(); c.fillRect(-2.5, 14, 5, 14);
  } },
  { id: 'boussole', name: 'Boussole', d(c) {
    c.fillStyle = gold(c, -40, -40, 40, 40); circ(c, 0, 0, 40); c.fill();
    c.fillStyle = RG(c, -10, -10, 2, 0, 0, 34, ['#fbf6ea', '#d8cbb0']); circ(c, 0, 0, 33); c.fill();
    c.strokeStyle = '#5a4a36'; c.lineWidth = 1;
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16, l = i % 4 ? 27 : 23; c.beginPath(); c.moveTo(Math.cos(a) * l, Math.sin(a) * l); c.lineTo(Math.cos(a) * 31, Math.sin(a) * 31); c.stroke(); }
    c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(0, -26); c.lineTo(6, 0); c.lineTo(-6, 0); c.fill();
    c.fillStyle = '#e9e4da'; c.beginPath(); c.moveTo(0, 26); c.lineTo(6, 0); c.lineTo(-6, 0); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.stroke();
    c.fillStyle = '#7a5a20'; circ(c, 0, 0, 3); c.fill();
  } },
  { id: 'telephone', name: 'Smartphone', d(c) {
    c.fillStyle = LG(c, -24, -46, 24, 46, ['#4a4f57', '#16191d']); rrect(c, -24, -46, 48, 92, 9); c.fill();
    c.fillStyle = LG(c, -20, -40, 20, 40, ['#3a6fd8', '#8a4fd1', '#e0679b']); rrect(c, -20, -39, 40, 78, 5); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-20, -39); c.lineTo(10, -39); c.lineTo(-20, 10); c.fill();
    c.fillStyle = '#0c0d0f'; circ(c, 0, -34, 2.5); c.fill();
  } },
  { id: 'appareil', name: 'Appareil photo', d(c) {
    c.fillStyle = LG(c, 0, -30, 0, 30, ['#3b3f45', '#15171a']); rrect(c, -46, -22, 92, 52, 8); c.fill();
    c.fillStyle = '#2a2d31'; rrect(c, -20, -32, 30, 14, 4); c.fill();
    c.fillStyle = LG(c, 0, -22, 0, 30, ['#8a6a48', '#5a3f26']); c.fillRect(-46, -8, 92, 30);
    c.fillStyle = silver(c, -26, -20, 26, 32); circ(c, 0, 4, 25); c.fill();
    c.fillStyle = RG(c, -6, -2, 1, 0, 4, 18, ['#6aa9d8', '#152a44', '#05080d']); circ(c, 0, 4, 18); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; circ(c, -6, -3, 4); c.fill();
    c.fillStyle = '#e8e8e8'; c.fillRect(28, -16, 12, 7);
  } },
  { id: 'casque', name: 'Casque audio', d(c) {
    c.strokeStyle = LG(c, -40, -40, 40, 0, ['#2a2d33', '#6b7079', '#2a2d33']); c.lineWidth = 8;
    c.beginPath(); c.arc(0, 4, 36, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.fillStyle = LG(c, -46, 0, -24, 40, ['#55595f', '#1d1f23']); rrect(c, -46, -2, 20, 40, 9); c.fill();
    c.fillStyle = LG(c, 24, 0, 46, 40, ['#55595f', '#1d1f23']); rrect(c, 26, -2, 20, 40, 9); c.fill();
    c.fillStyle = '#c96b2c'; rrect(c, -30, 6, 5, 24, 2); c.fill(); rrect(c, 25, 6, 5, 24, 2); c.fill();
  } },
  { id: 'parapluie', name: 'Parapluie', d(c) {
    c.fillStyle = LG(c, -46, -40, 46, 0, ['#1d3a5c', '#3a6aa0', '#1d3a5c']);
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(-44, -44, 0, -46); c.quadraticCurveTo(44, -44, 46, 0);
    for (let i = 3; i >= 0; i--) { const x1 = -46 + (i + 1) * 23, x0 = -46 + i * 23; c.quadraticCurveTo((x0 + x1) / 2, -9, x0, 0); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(-46 + i * 23, -30, -46 + i * 23, 0); c.stroke(); }
    c.strokeStyle = '#2b2118'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -46); c.lineTo(0, 36); c.arc(-8, 36, 8, 0, Math.PI); c.stroke();
  } },
  { id: 'chapeau', name: 'Chapeau haut-de-forme', d(c) {
    ell(c, 0, 28, 46, 12); c.fillStyle = LG(c, 0, 18, 0, 40, ['#3a3a40', '#121215']); c.fill();
    c.fillStyle = LG(c, -28, 0, 28, 0, ['#18181c', '#45454d', '#18181c']);
    c.beginPath(); c.moveTo(-28, 26); c.lineTo(-26, -36); c.quadraticCurveTo(0, -44, 26, -36); c.lineTo(28, 26); c.quadraticCurveTo(0, 32, -28, 26); c.fill();
    c.fillStyle = '#7a1f2a'; c.beginPath(); c.moveTo(-27.5, 8); c.lineTo(27.5, 8); c.lineTo(28, 20); c.quadraticCurveTo(0, 26, -28, 20); c.fill();
  } },
  { id: 'bouteille', name: 'Bouteille', d(c) {
    c.fillStyle = LG(c, -18, 0, 18, 0, ['#0f3b23', '#2f8a55', '#0b2e1b']);
    c.beginPath(); c.moveTo(-6, -38); c.lineTo(6, -38); c.lineTo(6, -18); c.quadraticCurveTo(18, -12, 18, 0); c.lineTo(18, 44); c.lineTo(-18, 44); c.lineTo(-18, 0); c.quadraticCurveTo(-18, -12, -6, -18); c.closePath(); c.fill();
    c.fillStyle = '#b98a54'; c.fillRect(-5, -48, 10, 12);
    c.fillStyle = '#efe4c8'; c.fillRect(-18, 6, 36, 22);
    c.fillStyle = '#7a2a1e'; c.fillRect(-12, 12, 24, 3); c.fillRect(-8, 19, 16, 2);
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-13, -4, 3, 44);
  } },
  { id: 'verre', name: 'Verre à pied', d(c) {
    c.fillStyle = 'rgba(200,225,240,.35)';
    c.beginPath(); c.moveTo(-22, -42); c.lineTo(22, -42); c.quadraticCurveTo(24, -4, 0, 2); c.quadraticCurveTo(-24, -4, -22, -42); c.fill();
    c.fillStyle = LG(c, 0, -22, 0, 0, ['#9c1b33', '#4d0a18']);
    c.beginPath(); c.moveTo(-22, -22); c.lineTo(22, -22); c.quadraticCurveTo(22, -2, 0, 2); c.quadraticCurveTo(-22, -2, -22, -22); c.fill();
    c.strokeStyle = 'rgba(230,240,250,.8)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-22, -42); c.quadraticCurveTo(-24, -4, 0, 2); c.quadraticCurveTo(24, -4, 22, -42); c.stroke();
    c.beginPath(); c.moveTo(0, 2); c.lineTo(0, 38); c.stroke();
    ell(c, 0, 40, 18, 5); c.fillStyle = 'rgba(210,230,245,.6)'; c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(-14, -36); c.quadraticCurveTo(-16, -18, -10, -10); c.stroke();
  } },
  { id: 'pomme', name: 'Pomme', d(c) {
    c.fillStyle = RG(c, -12, -10, 3, 0, 4, 40, ['#ff8a7a', '#d0232a', '#6e0d12']);
    c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(26, -40, 48, -10, 32, 22); c.bezierCurveTo(22, 44, 6, 40, 0, 34); c.bezierCurveTo(-6, 40, -22, 44, -32, 22); c.bezierCurveTo(-48, -10, -26, -40, 0, -24); c.fill();
    c.strokeStyle = '#4b2e14'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(2, -36, 8, -42); c.stroke();
    c.fillStyle = LG(c, 8, -40, 30, -30, ['#6fbf3c', '#2f7a1a']); c.beginPath(); c.moveTo(6, -36); c.quadraticCurveTo(22, -50, 32, -38); c.quadraticCurveTo(20, -28, 6, -36); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; ell(c, -16, -6, 6, 10, 0.4); c.fill();
  } },
  { id: 'poire', name: 'Poire', d(c) {
    c.fillStyle = RG(c, -10, 10, 3, 0, 12, 40, ['#f6f08a', '#b9c836', '#6b7a14']);
    c.beginPath(); c.moveTo(0, -36); c.bezierCurveTo(14, -36, 12, -10, 24, 4); c.bezierCurveTo(40, 22, 28, 46, 0, 46); c.bezierCurveTo(-28, 46, -40, 22, -24, 4); c.bezierCurveTo(-12, -10, -14, -36, 0, -36); c.fill();
    c.strokeStyle = '#4b2e14'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -34); c.quadraticCurveTo(-2, -44, 4, -50); c.stroke();
    c.fillStyle = 'rgba(140,90,30,.35)'; for (let i = 0; i < 12; i++) { circ(c, -18 + (i * 37 % 36), 8 + (i * 13 % 30), 1.2); c.fill(); }
  } },
  { id: 'champignon', name: 'Champignon', d(c) {
    c.fillStyle = LG(c, -10, 0, 10, 0, ['#d8cdb4', '#fffaf0', '#cfc2a4']);
    c.beginPath(); c.moveTo(-10, 44); c.quadraticCurveTo(-14, 10, -9, -4); c.lineTo(9, -4); c.quadraticCurveTo(14, 10, 10, 44); c.closePath(); c.fill();
    c.fillStyle = RG(c, -14, -28, 4, 0, -12, 48, ['#ff6a4a', '#c81f16', '#6a0a06']);
    c.beginPath(); c.moveTo(-44, -4); c.quadraticCurveTo(-42, -46, 0, -46); c.quadraticCurveTo(42, -46, 44, -4); c.quadraticCurveTo(0, 6, -44, -4); c.fill();
    c.fillStyle = '#fbf3e4'; [[-22, -24, 6], [6, -34, 5], [24, -16, 5], [-4, -14, 4], [-34, -10, 3]].forEach(p => { circ(c, p[0], p[1], p[2]); c.fill(); });
  } },
  { id: 'feuille', name: 'Feuille d’érable', d(c) {
    c.fillStyle = LG(c, -40, -40, 40, 40, ['#f4b23a', '#d9531e', '#8a1d10']);
    c.beginPath();
    const pts = [[0, -46], [8, -26], [22, -34], [18, -14], [44, -18], [34, -2], [42, 6], [18, 10], [22, 24], [4, 18], [0, 30], [-4, 18], [-22, 24], [-18, 10], [-42, 6], [-34, -2], [-44, -18], [-18, -14], [-22, -34], [-8, -26]];
    pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,20,8,.55)'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(0, 46); c.lineTo(0, -40); c.moveTo(0, 8); c.lineTo(36, -14); c.moveTo(0, 8); c.lineTo(-36, -14); c.moveTo(0, 12); c.lineTo(18, 22); c.moveTo(0, 12); c.lineTo(-18, 22); c.stroke();
  } },
  { id: 'fleur', name: 'Fleur', d(c) {
    for (let i = 0; i < 8; i++) {
      c.save(); c.rotate(i * TAU / 8);
      c.fillStyle = LG(c, 0, -8, 0, -42, ['#c2457a', '#f39ac0', '#ffe2ee']); ell(c, 0, -26, 10, 20); c.fill(); c.restore();
    }
    c.fillStyle = RG(c, -3, -3, 1, 0, 0, 12, ['#ffe680', '#e09a12', '#8a4b05']); circ(c, 0, 0, 12); c.fill();
  } },
  { id: 'coquillage', name: 'Coquillage', d(c) {
    c.fillStyle = LG(c, 0, -40, 0, 40, ['#ffe9dc', '#f2b79c', '#c97a5e']);
    c.beginPath(); c.moveTo(0, 38); c.lineTo(-44, -10); c.quadraticCurveTo(-30, -44, 0, -44); c.quadraticCurveTo(30, -44, 44, -10); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,80,55,.55)'; c.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(0, 38); c.quadraticCurveTo(i * 10, -10, i * 13, -42 + Math.abs(i) * 4); c.stroke(); }
    c.fillStyle = '#e7a68a'; c.beginPath(); c.moveTo(-10, 34); c.lineTo(10, 34); c.lineTo(12, 46); c.lineTo(-12, 46); c.fill();
  } },
  { id: 'etoile_mer', name: 'Étoile de mer', d(c) {
    c.fillStyle = RG(c, -6, -6, 2, 0, 0, 46, ['#ffb37a', '#e8622a', '#9a2f10']);
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 16 : 46; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath(); c.lineJoin = 'round'; c.lineWidth = 8; c.strokeStyle = '#d8551f'; c.stroke(); c.fill();
    c.fillStyle = 'rgba(255,235,210,.8)';
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU / 5; for (let j = 1; j < 4; j++) { circ(c, Math.cos(a) * j * 10, Math.sin(a) * j * 10, 2); c.fill(); } }
  } },
  { id: 'papillon', name: 'Papillon', d(c) {
    const wing = (s) => {
      c.fillStyle = RG(c, s * 20, -16, 2, s * 22, -14, 28, ['#bfe9ff', '#2b7fd1', '#0d2550']);
      c.beginPath(); c.moveTo(0, -4); c.bezierCurveTo(s * 20, -46, s * 50, -34, s * 42, -6); c.bezierCurveTo(s * 36, 4, s * 12, 2, 0, 0); c.fill();
      c.fillStyle = RG(c, s * 16, 18, 2, s * 16, 18, 20, ['#ffd27a', '#e07b18', '#5a2a05']);
      c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(s * 30, 4, s * 34, 34, s * 16, 36); c.bezierCurveTo(s * 6, 36, s * 2, 20, 0, 6); c.fill();
      c.fillStyle = '#fff'; circ(c, s * 34, -18, 3); c.fill();
    };
    wing(1); wing(-1);
    c.fillStyle = '#1b130c'; ell(c, 0, 4, 3.5, 22); c.fill();
    c.strokeStyle = '#1b130c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(-6, -32, -12, -36); c.moveTo(0, -16); c.quadraticCurveTo(6, -32, 12, -36); c.stroke();
  } },
  { id: 'poisson', name: 'Poisson', d(c) {
    c.fillStyle = LG(c, 30, 0, 50, 0, ['#e0a020', '#b05a10']);
    c.beginPath(); c.moveTo(28, 0); c.lineTo(48, -20); c.quadraticCurveTo(42, 0, 48, 20); c.closePath(); c.fill();
    c.fillStyle = LG(c, 0, -26, 0, 26, ['#ffd36a', '#f08a1c', '#fff0c8']);
    c.beginPath(); c.moveTo(-44, 0); c.bezierCurveTo(-30, -30, 18, -30, 32, 0); c.bezierCurveTo(18, 30, -30, 30, -44, 0); c.fill();
    c.strokeStyle = 'rgba(160,70,10,.4)'; c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-6 + i * 8, 0, 10, -1, 1); c.stroke(); }
    c.fillStyle = '#fff'; circ(c, -28, -6, 5.5); c.fill(); c.fillStyle = '#111'; circ(c, -29, -6, 3); c.fill();
    c.fillStyle = 'rgba(230,110,20,.8)'; c.beginPath(); c.moveTo(-6, -20); c.quadraticCurveTo(4, -36, 14, -20); c.fill();
  } },
  { id: 'de', name: 'Dé', d(c) {
    c.fillStyle = '#f4f2ee'; c.beginPath(); c.moveTo(0, -42); c.lineTo(38, -22); c.lineTo(0, -2); c.lineTo(-38, -22); c.closePath(); c.fill();
    c.fillStyle = '#d9d5cd'; c.beginPath(); c.moveTo(-38, -22); c.lineTo(0, -2); c.lineTo(0, 44); c.lineTo(-38, 24); c.closePath(); c.fill();
    c.fillStyle = '#bcb6aa'; c.beginPath(); c.moveTo(38, -22); c.lineTo(0, -2); c.lineTo(0, 44); c.lineTo(38, 24); c.closePath(); c.fill();
    c.fillStyle = '#b3141d'; ell(c, 0, -22, 6, 3.4); c.fill();
    c.fillStyle = '#1c1c1c';
    [[-28, -8], [-10, 30]].forEach(p => { ell(c, p[0], p[1], 3, 4, 0.5); c.fill(); });
    [[28, -8], [19, 11], [10, 30]].forEach(p => { ell(c, p[0], p[1], 3, 4, -0.5); c.fill(); });
  } },
  { id: 'carte', name: 'Carte à jouer', d(c) {
    c.save(); c.rotate(0.12);
    c.fillStyle = '#fbfaf6'; rrect(c, -30, -44, 60, 88, 6); c.fill();
    c.strokeStyle = '#cfc9bd'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#c3162a';
    const heart = (x, y, s) => { c.beginPath(); c.moveTo(x, y + s * .9); c.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.3, x, y - s * .4); c.bezierCurveTo(x + s * .6, y - s * 1.3, x + s * 1.6, y - s * .2, x, y + s * .9); c.fill(); };
    heart(0, 2, 16); heart(-20, -22, 5);
    c.font = 'bold 13px serif'; c.fillText('A', -25, -30);
    c.restore();
  } },
  { id: 'pion', name: 'Pion d’échecs', d(c) {
    c.fillStyle = LG(c, -24, 0, 24, 0, ['#1d1612', '#5a463a', '#1d1612']);
    ell(c, 0, 38, 26, 8); c.fill();
    c.fillRect(-24, 28, 48, 10);
    c.beginPath(); c.moveTo(-18, 28); c.quadraticCurveTo(-6, 6, -8, -10); c.lineTo(8, -10); c.quadraticCurveTo(6, 6, 18, 28); c.fill();
    ell(c, 0, -10, 16, 5); c.fill();
    c.fillStyle = RG(c, -6, -32, 2, 0, -26, 16, ['#8a7262', '#3a2c22', '#140e0a']); circ(c, 0, -26, 15); c.fill();
  } },
  { id: 'ancre', name: 'Ancre', d(c) {
    c.strokeStyle = silver(c, -40, -40, 40, 40); c.lineWidth = 8; c.lineCap = 'round';
    circ(c, 0, -38, 7); c.stroke();
    c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 40); c.moveTo(-18, -18); c.lineTo(18, -18); c.stroke();
    c.beginPath(); c.arc(0, 4, 36, 0.35, Math.PI - 0.35); c.stroke();
    c.fillStyle = '#7d8790'; c.beginPath(); c.moveTo(-42, 4); c.lineTo(-30, 22); c.lineTo(-44, 22); c.fill(); c.beginPath(); c.moveTo(42, 4); c.lineTo(30, 22); c.lineTo(44, 22); c.fill();
  } },
  { id: 'couronne', name: 'Couronne', d(c) {
    c.fillStyle = gold(c, -44, -36, 44, 30);
    c.beginPath(); c.moveTo(-42, 26); c.lineTo(-44, -28); c.lineTo(-22, -4); c.lineTo(0, -38); c.lineTo(22, -4); c.lineTo(44, -28); c.lineTo(42, 26); c.closePath(); c.fill();
    c.fillStyle = gold(c, 0, 18, 0, 34); c.fillRect(-42, 18, 84, 12);
    [[-44, -30], [0, -40], [44, -30]].forEach(p => { c.fillStyle = gold(c, p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5); circ(c, p[0], p[1], 5); c.fill(); });
    c.fillStyle = '#c0182c'; circ(c, 0, 4, 6); c.fill(); c.fillStyle = '#1a6fc0'; circ(c, -24, 10, 4.5); c.fill(); circ(c, 24, 10, 4.5); c.fill();
  } },
  { id: 'sablier', name: 'Sablier', d(c) {
    c.fillStyle = 'rgba(210,230,240,.45)';
    c.beginPath(); c.moveTo(-24, -36); c.lineTo(24, -36); c.quadraticCurveTo(22, -8, 3, 0); c.quadraticCurveTo(22, 8, 24, 36); c.lineTo(-24, 36); c.quadraticCurveTo(-22, 8, -3, 0); c.quadraticCurveTo(-22, -8, -24, -36); c.fill();
    c.fillStyle = '#e1b45e'; c.beginPath(); c.moveTo(-16, -16); c.lineTo(16, -16); c.lineTo(2, -2); c.lineTo(-2, -2); c.fill();
    c.beginPath(); c.moveTo(-22, 34); c.quadraticCurveTo(0, 12, 22, 34); c.fill(); c.fillRect(-0.8, -2, 1.6, 30);
    c.fillStyle = wood(c, -32, -48, 32, -36); rrect(c, -32, -46, 64, 10, 3); c.fill(); rrect(c, -32, 36, 64, 10, 3); c.fill();
    c.fillStyle = wood(c, -30, 0, -26, 0); c.fillRect(-30, -36, 4, 72); c.fillRect(26, -36, 4, 72);
  } },
  { id: 'diamant', name: 'Diamant', d(c) {
    const T = -18, B = 40;
    c.fillStyle = LG(c, -40, -30, 40, 40, ['#ffffff', '#9fe3ff', '#3a9fd6', '#d6f6ff']);
    c.beginPath(); c.moveTo(-26, -34); c.lineTo(26, -34); c.lineTo(42, T); c.lineTo(0, B); c.lineTo(-42, T); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(-42, T); c.lineTo(42, T); c.moveTo(-26, -34); c.lineTo(-14, T); c.lineTo(0, -34); c.lineTo(14, T); c.lineTo(26, -34);
    c.moveTo(-14, T); c.lineTo(0, B); c.lineTo(14, T); c.moveTo(-42, T); c.lineTo(0, B); c.stroke();
    c.fillStyle = 'rgba(30,90,140,.25)'; c.beginPath(); c.moveTo(14, T); c.lineTo(42, T); c.lineTo(0, B); c.fill();
  } },
  { id: 'medaillon', name: 'Médaillon', d(c) {
    c.strokeStyle = '#c99a3c'; c.lineWidth = 2; c.setLineDash([3, 2]);
    c.beginPath(); c.moveTo(-30, -48); c.quadraticCurveTo(0, -10, 30, -48); c.stroke(); c.setLineDash([]);
    c.fillStyle = gold(c, -34, -20, 34, 44);
    c.beginPath(); c.moveTo(0, 44); c.bezierCurveTo(-48, 14, -36, -30, 0, -14); c.bezierCurveTo(36, -30, 48, 14, 0, 44); c.fill();
    c.strokeStyle = 'rgba(110,70,15,.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, 34); c.bezierCurveTo(-36, 12, -26, -20, 0, -6); c.bezierCurveTo(26, -20, 36, 12, 0, 34); c.stroke();
    c.fillStyle = gold(c, -5, -24, 5, -14); circ(c, 0, -18, 5); c.fill();
  } },
  { id: 'cle_molette', name: 'Clé à molette', d(c) {
    c.save(); c.rotate(-0.8);
    c.fillStyle = silver(c, 0, -8, 0, 8); rrect(c, -46, -7, 70, 14, 6); c.fill();
    c.fillStyle = silver(c, 20, -22, 46, 22);
    c.beginPath(); c.moveTo(18, -12); c.lineTo(46, -20); c.lineTo(46, -8); c.lineTo(32, -6); c.lineTo(32, 6); c.lineTo(46, 8); c.lineTo(46, 20); c.lineTo(18, 12); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, -30, 0, 8, 3); c.fill();
    c.restore();
  } },
  { id: 'marteau', name: 'Marteau', d(c) {
    c.save(); c.rotate(-0.5);
    c.fillStyle = wood(c, -6, 0, 6, 0); rrect(c, -5, -18, 10, 66, 4); c.fill();
    c.fillStyle = LG(c, 0, -34, 0, -14, ['#9aa3ab', '#3a4048', '#6d757d']);
    c.beginPath(); c.moveTo(-34, -32); c.lineTo(18, -32); c.lineTo(18, -16); c.lineTo(-34, -16); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(18, -32); c.quadraticCurveTo(34, -32, 42, -42); c.lineTo(40, -26); c.quadraticCurveTo(32, -16, 18, -16); c.fill();
    c.restore();
  } },
  { id: 'tournevis', name: 'Tournevis', d(c) {
    c.save(); c.rotate(0.75);
    c.fillStyle = LG(c, 0, -10, 0, 10, ['#ffb24a', '#e05510', '#8a2a04']); rrect(c, -46, -9, 40, 18, 8); c.fill();
    c.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 4; i++) c.fillRect(-40 + i * 8, -9, 2, 18);
    c.fillStyle = silver(c, 0, -3, 0, 3); c.fillRect(-6, -3, 44, 6);
    c.beginPath(); c.moveTo(38, -3); c.lineTo(48, -1); c.lineTo(48, 1); c.lineTo(38, 3); c.fill();
    c.restore();
  } },
  { id: 'ballon', name: 'Ballon', d(c) {
    c.fillStyle = RG(c, -12, -14, 4, 0, 0, 40, ['#ffffff', '#e6e6e6', '#9a9a9a']); circ(c, 0, 0, 40); c.fill();
    c.fillStyle = '#222';
    const pent = (x, y, r, a0) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = a0 + i * TAU / 5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); };
    pent(0, 0, 12, -Math.PI / 2);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5 + Math.PI / 5; pent(Math.cos(a) * 33, Math.sin(a) * 33, 9, a); }
    c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; circ(c, 0, 0, 39.5); c.stroke();
  } },
  { id: 'reveil', name: 'Réveil', d(c) {
    c.fillStyle = silver(c, -40, -46, -14, -26); circ(c, -24, -32, 12); c.fill(); circ(c, 24, -32, 12); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 4; c.beginPath(); c.moveTo(-24, 34); c.lineTo(-32, 46); c.moveTo(24, 34); c.lineTo(32, 46); c.stroke();
    c.fillStyle = LG(c, -36, -30, 36, 40, ['#3fa3a0', '#1b5f5d']); circ(c, 0, 4, 36); c.fill();
    c.fillStyle = RG(c, -8, -4, 2, 0, 4, 28, ['#ffffff', '#e8e2d6']); circ(c, 0, 4, 28); c.fill();
    c.strokeStyle = '#222'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -16); c.moveTo(0, 4); c.lineTo(14, 10); c.stroke();
    c.fillStyle = '#c0392b'; circ(c, 0, 4, 3); c.fill();
  } },
  { id: 'fusee', name: 'Fusée', d(c) {
    c.save(); c.rotate(0.5);
    c.fillStyle = LG(c, -14, 0, 14, 0, ['#b8c0c8', '#ffffff', '#9aa3ab']);
    c.beginPath(); c.moveTo(0, -48); c.quadraticCurveTo(18, -26, 14, 26); c.lineTo(-14, 26); c.quadraticCurveTo(-18, -26, 0, -48); c.fill();
    c.fillStyle = '#c93a2a'; c.beginPath(); c.moveTo(-14, 10); c.lineTo(-28, 36); c.lineTo(-12, 28); c.fill(); c.beginPath(); c.moveTo(14, 10); c.lineTo(28, 36); c.lineTo(12, 28); c.fill();
    c.beginPath(); c.moveTo(0, -48); c.quadraticCurveTo(9, -38, 11, -28); c.lineTo(-11, -28); c.quadraticCurveTo(-9, -38, 0, -48); c.fill();
    c.fillStyle = RG(c, -3, -10, 1, 0, -8, 8, ['#bfe7ff', '#1f5d8c']); circ(c, 0, -8, 7); c.fill();
    c.strokeStyle = '#6b737b'; c.lineWidth = 2; c.stroke();
    c.fillStyle = RG(c, 0, 30, 1, 0, 34, 14, ['#ffffff', '#ffc94a', 'rgba(255,90,20,0)']); ell(c, 0, 38, 9, 14); c.fill();
    c.restore();
  } },
  { id: 'planete', name: 'Planète', d(c) {
    c.strokeStyle = 'rgba(220,190,140,.9)'; c.lineWidth = 5;
    c.beginPath(); c.ellipse(0, 0, 48, 13, -0.35, Math.PI * 0.95, Math.PI * 2.05); c.stroke();
    c.fillStyle = RG(c, -10, -12, 3, 0, 0, 30, ['#ffe2b0', '#d98a3a', '#6a3510']); circ(c, 0, 0, 30); c.fill();
    c.strokeStyle = 'rgba(120,60,20,.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -6, 29, 4, -0.1, 0, Math.PI); c.stroke(); c.beginPath(); c.ellipse(0, 10, 26, 4, -0.1, 0, Math.PI); c.stroke();
    c.strokeStyle = 'rgba(240,215,170,.95)'; c.lineWidth = 5;
    c.beginPath(); c.ellipse(0, 0, 48, 13, -0.35, Math.PI * 0.05, Math.PI * 0.95); c.stroke();
  } },
  { id: 'etoile', name: 'Étoile', d(c) {
    star(c, 0, 4, 46, 19, 5); c.fillStyle = gold(c, -40, -40, 40, 40); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -42); c.lineTo(-11, -11); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,70,10,.3)'; c.beginPath(); c.moveTo(0, 4); c.lineTo(28, 41); c.lineTo(17, 10); c.closePath(); c.fill();
  } },
  { id: 'lune', name: 'Croissant de lune', d(c) {
    c.fillStyle = RG(c, -14, -10, 4, 0, 0, 44, ['#fffbe6', '#e9dfa8', '#9c8e55']);
    c.beginPath(); c.arc(0, 0, 42, 0.6, Math.PI * 2 - 0.6, false); c.arc(20, -4, 32, Math.PI * 2 - 1.1, 1.2, true); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,110,70,.35)'; circ(c, -24, 4, 5); c.fill(); circ(c, -12, 22, 3.5); c.fill(); circ(c, -18, -18, 3); c.fill();
  } },
  { id: 'cactus', name: 'Cactus', d(c) {
    c.fillStyle = LG(c, -20, 30, 20, 30, ['#a4502a', '#d87a48', '#8a3c1c']);
    c.beginPath(); c.moveTo(-20, 22); c.lineTo(20, 22); c.lineTo(15, 48); c.lineTo(-15, 48); c.closePath(); c.fill();
    c.fillRect(-23, 18, 46, 7);
    c.fillStyle = LG(c, -14, 0, 14, 0, ['#2b6a3a', '#5fae5e', '#22552e']);
    rrect(c, -11, -42, 22, 64, 11); c.fill();
    rrect(c, -32, -18, 12, 28, 6); c.fill(); c.fillRect(-26, 2, 16, 8);
    rrect(c, 20, -28, 12, 26, 6); c.fill(); c.fillRect(10, -10, 16, 8);
    c.strokeStyle = 'rgba(255,255,230,.7)'; c.lineWidth = 1;
    for (let i = 0; i < 10; i++) { const y = -36 + i * 6; c.beginPath(); c.moveTo(-11, y); c.lineTo(-15, y - 2); c.moveTo(11, y + 3); c.lineTo(15, y + 1); c.stroke(); }
    c.fillStyle = '#f06a9a'; circ(c, 0, -42, 5); c.fill();
  } },
  { id: 'guitare', name: 'Guitare', d(c) {
    c.save(); c.rotate(0.6);
    c.fillStyle = LG(c, -4, -48, 4, -48, ['#3a2210', '#6b4220']); c.fillRect(-4, -48, 8, 50);
    c.fillStyle = '#2a170a'; rrect(c, -7, -56, 14, 12, 3); c.fill();
    c.fillStyle = RG(c, -6, 14, 4, 0, 18, 34, ['#f2b45e', '#c47524', '#6e3a10']);
    c.beginPath(); c.arc(0, -2, 15, Math.PI * 0.75, Math.PI * 0.25 + TAU * 0); c.arc(0, 26, 22, -0.75, Math.PI + 0.75); c.closePath(); c.fill();
    c.fillStyle = '#2a170a'; circ(c, 0, 4, 7); c.fill(); c.fillRect(-9, 30, 18, 4);
    c.strokeStyle = 'rgba(240,240,240,.7)'; c.lineWidth = .7; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 1.4, -46); c.lineTo(i * 1.4, 32); c.stroke(); }
    c.restore();
  } },
  { id: 'note', name: 'Note de musique', d(c) {
    c.fillStyle = LG(c, -30, -40, 30, 40, ['#3a3f6a', '#12142a']);
    ell(c, -18, 30, 15, 11, -0.4); c.fill(); ell(c, 22, 20, 15, 11, -0.4); c.fill();
    c.fillRect(-6, -36, 6, 66); c.fillRect(34, -46, 6, 66);
    c.beginPath(); c.moveTo(-6, -36); c.lineTo(40, -46); c.lineTo(40, -32); c.lineTo(-6, -22); c.closePath(); c.fill();
  } },
  { id: 'enveloppe', name: 'Enveloppe', d(c) {
    c.fillStyle = LG(c, 0, -30, 0, 30, ['#f6efe0', '#ddd0b4']); c.fillRect(-44, -28, 88, 58);
    c.strokeStyle = 'rgba(120,95,60,.45)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-44, 30); c.lineTo(-6, 2); c.moveTo(44, 30); c.lineTo(6, 2); c.stroke();
    c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-44, -28); c.lineTo(0, 6); c.lineTo(44, -28); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = RG(c, -2, 2, 1, 0, 4, 9, ['#e05050', '#8a1414']); circ(c, 0, 4, 8); c.fill();
  } },
  { id: 'pinceau', name: 'Pinceau', d(c) {
    c.save(); c.rotate(-0.7);
    c.fillStyle = LG(c, 0, -5, 0, 5, ['#2c5aa0', '#163060']); rrect(c, -48, -4, 56, 8, 4); c.fill();
    c.fillStyle = silver(c, 0, -6, 0, 6); c.fillRect(6, -6, 16, 12);
    c.fillStyle = LG(c, 22, 0, 48, 0, ['#4a3020', '#c0392b']);
    c.beginPath(); c.moveTo(22, -6); c.quadraticCurveTo(40, -8, 48, 0); c.quadraticCurveTo(40, 8, 22, 6); c.fill();
    c.restore();
  } },
  { id: 'bonbon', name: 'Bonbon', d(c) {
    c.fillStyle = LG(c, -48, 0, -20, 0, ['#ff9ec8', '#d63a7a']);
    c.beginPath(); c.moveTo(-20, 0); c.lineTo(-46, -16); c.lineTo(-40, 0); c.lineTo(-46, 16); c.fill();
    c.beginPath(); c.moveTo(20, 0); c.lineTo(46, -16); c.lineTo(40, 0); c.lineTo(46, 16); c.fill();
    c.fillStyle = RG(c, -6, -6, 2, 0, 0, 24, ['#ffd1e6', '#e84a8a', '#8a1446']); ell(c, 0, 0, 24, 18); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 12 - 6, -16); c.lineTo(i * 12 + 6, 16); c.stroke(); }
  } },
  { id: 'cerises', name: 'Cerises', d(c) {
    c.strokeStyle = '#4a6a1a'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-16, 18); c.quadraticCurveTo(-6, -20, 8, -40); c.moveTo(18, 22); c.quadraticCurveTo(14, -16, 8, -40); c.stroke();
    c.fillStyle = '#4f9a2a'; c.beginPath(); c.moveTo(8, -40); c.quadraticCurveTo(28, -48, 38, -34); c.quadraticCurveTo(22, -28, 8, -40); c.fill();
    [[-16, 28], [18, 30]].forEach(p => { c.fillStyle = RG(c, p[0] - 5, p[1] - 6, 1, p[0], p[1], 16, ['#ff7a80', '#b0101e', '#4a0208']); circ(c, p[0], p[1], 15); c.fill(); });
  } },
  { id: 'citron', name: 'Citron', d(c) {
    c.fillStyle = RG(c, -12, -10, 3, 0, 0, 44, ['#fffbb0', '#f5d81e', '#a88a06']);
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(-40, -30, 0, -30); c.quadraticCurveTo(40, -30, 46, 0); c.quadraticCurveTo(40, 30, 0, 30); c.quadraticCurveTo(-40, 30, -46, 0); c.fill();
    c.fillStyle = 'rgba(150,120,0,.25)'; for (let i = 0; i < 18; i++) { circ(c, -30 + (i * 23 % 60), -18 + (i * 17 % 36), 1.2); c.fill(); }
  } },
  { id: 'carotte', name: 'Carotte', d(c) {
    c.save(); c.rotate(0.6);
    c.fillStyle = LG(c, -12, 0, 12, 0, ['#c9520a', '#ff8f2a', '#b5460a']);
    c.beginPath(); c.moveTo(-12, -28); c.quadraticCurveTo(0, -32, 12, -28); c.quadraticCurveTo(6, 20, 0, 46); c.quadraticCurveTo(-6, 20, -12, -28); c.fill();
    c.strokeStyle = 'rgba(120,40,0,.4)'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-8 + i, -16 + i * 11); c.lineTo(-2, -14 + i * 11); c.stroke(); }
    c.fillStyle = '#3f8a24'; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(0, -28); c.quadraticCurveTo(i * 16, -44, i * 10, -50); c.quadraticCurveTo(i * 4, -38, 0, -28); c.fill(); }
    c.restore();
  } },
  { id: 'gland', name: 'Gland', d(c) {
    c.fillStyle = RG(c, -6, 10, 2, 0, 12, 30, ['#e0b070', '#a8692a', '#5a3410']);
    c.beginPath(); c.moveTo(-22, -4); c.quadraticCurveTo(-24, 34, 0, 44); c.quadraticCurveTo(24, 34, 22, -4); c.closePath(); c.fill();
    c.fillStyle = LG(c, 0, -26, 0, 0, ['#8a6a44', '#4a3218']);
    c.beginPath(); c.moveTo(-28, 0); c.quadraticCurveTo(-28, -26, 0, -26); c.quadraticCurveTo(28, -26, 28, 0); c.quadraticCurveTo(0, 6, -28, 0); c.fill();
    c.strokeStyle = 'rgba(40,25,10,.5)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-24 + i * 9, -2); c.lineTo(-18 + i * 7, -20); c.stroke(); }
    c.fillStyle = '#4a3218'; c.fillRect(-2, -36, 4, 12);
  } },
  { id: 'cloche', name: 'Cloche', d(c) {
    c.fillStyle = gold(c, -38, -40, 38, 40);
    c.beginPath(); c.moveTo(-40, 28); c.quadraticCurveTo(-26, 18, -24, -10); c.quadraticCurveTo(-22, -40, 0, -40); c.quadraticCurveTo(22, -40, 24, -10); c.quadraticCurveTo(26, 18, 40, 28); c.closePath(); c.fill();
    c.fillStyle = gold(c, 0, 24, 0, 34); ell(c, 0, 28, 40, 6); c.fill();
    c.fillStyle = '#7a5418'; circ(c, 0, 38, 7); c.fill();
    c.strokeStyle = '#a5741f'; c.lineWidth = 4; c.beginPath(); c.arc(0, -42, 6, Math.PI, 0); c.stroke();
  } },
  { id: 'lanterne', name: 'Lanterne', d(c) {
    c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; c.beginPath(); c.arc(0, -40, 9, Math.PI, 0); c.stroke();
    c.fillStyle = '#2b2b2e'; c.beginPath(); c.moveTo(-20, -28); c.lineTo(20, -28); c.lineTo(12, -40); c.lineTo(-12, -40); c.fill();
    c.fillStyle = RG(c, 0, 4, 2, 0, 4, 22, ['#fff6cc', '#ffbf3a', '#b5650a']); c.fillRect(-16, -28, 32, 54);
    c.strokeStyle = '#2b2b2e'; c.lineWidth = 3; c.strokeRect(-16, -28, 32, 54); c.beginPath(); c.moveTo(0, -28); c.lineTo(0, 26); c.stroke();
    c.fillStyle = '#2b2b2e'; c.fillRect(-22, 26, 44, 8);
  } },
  { id: 'bouton', name: 'Bouton', d(c) {
    c.fillStyle = RG(c, -10, -10, 3, 0, 0, 38, ['#9fd0c8', '#2f8a7e', '#0f3d37']); circ(c, 0, 0, 38); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; circ(c, 0, 0, 30); c.stroke();
    c.fillStyle = '#0a2622'; [[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(p => { circ(c, p[0], p[1], 5); c.fill(); });
  } },
  { id: 'trombone', name: 'Trombone', d(c) {
    c.strokeStyle = silver(c, -20, -40, 20, 40); c.lineWidth = 4.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(6, -24); c.lineTo(6, 28); c.arc(-2, 28, 8, 0, Math.PI); c.lineTo(-10, -32); c.arc(2, -32, 12, Math.PI, 0); c.lineTo(14, 38); c.arc(-1, 38, 15, 0, Math.PI); c.lineTo(-16, -6); c.stroke();
  } },
  { id: 'usb', name: 'Clé USB', d(c) {
    c.save(); c.rotate(-0.4);
    c.fillStyle = silver(c, 18, -10, 18, 10); c.fillRect(18, -10, 26, 20);
    c.fillStyle = '#1a1a1a'; c.fillRect(30, -6, 5, 4); c.fillRect(30, 2, 5, 4);
    c.fillStyle = LG(c, 0, -14, 0, 14, ['#e34a4a', '#8a1414']); rrect(c, -40, -14, 60, 28, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-34, -10, 48, 4);
    c.restore();
  } },
  { id: 'manette', name: 'Manette', d(c) {
    c.fillStyle = LG(c, 0, -20, 0, 30, ['#4a4f58', '#16181c']);
    c.beginPath(); c.moveTo(-26, -20); c.lineTo(26, -20); c.quadraticCurveTo(46, -18, 48, 10); c.quadraticCurveTo(50, 32, 36, 32); c.quadraticCurveTo(26, 32, 18, 16); c.lineTo(-18, 16); c.quadraticCurveTo(-26, 32, -36, 32); c.quadraticCurveTo(-50, 32, -48, 10); c.quadraticCurveTo(-46, -18, -26, -20); c.fill();
    c.fillStyle = '#c9ccd2'; c.fillRect(-34, -4, 18, 6); c.fillRect(-28, -10, 6, 18);
    [['#e74c3c', 30, -6], ['#3498db', 22, 2], ['#2ecc71', 38, 2], ['#f1c40f', 30, 10]].forEach(b => { c.fillStyle = b[0]; circ(c, b[1], b[2], 3.6); c.fill(); });
  } },
  { id: 'fer_cheval', name: 'Fer à cheval', d(c) {
    c.strokeStyle = silver(c, -40, -40, 40, 40); c.lineWidth = 14;
    c.lineCap = 'butt'; c.beginPath(); c.arc(0, -2, 30, Math.PI * 0.7, Math.PI * 2.3, false); c.stroke();
    c.fillStyle = '#3a3f44'; for (let i = 0; i < 7; i++) { const a = Math.PI * 0.82 + i * Math.PI * 0.227; circ(c, Math.cos(a) * 30, -2 + Math.sin(a) * 30, 2.4); c.fill(); }
  } },
  { id: 'oeuf', name: 'Œuf', d(c) {
    c.fillStyle = RG(c, -10, -14, 4, 0, 0, 44, ['#ffffff', '#f2e3cc', '#b8a080']);
    c.beginPath(); c.moveTo(0, -42); c.bezierCurveTo(26, -42, 34, 4, 32, 14); c.bezierCurveTo(30, 36, 14, 44, 0, 44); c.bezierCurveTo(-14, 44, -30, 36, -32, 14); c.bezierCurveTo(-34, 4, -26, -42, 0, -42); c.fill();
  } },
  { id: 'globe', name: 'Globe terrestre', d(c) {
    c.fillStyle = wood(c, -20, 40, 20, 48); ell(c, 0, 44, 22, 5); c.fill(); c.fillRect(-3, 30, 6, 12);
    c.strokeStyle = gold(c, -40, -40, 40, 40); c.lineWidth = 3; c.beginPath(); c.arc(0, -4, 38, -2.2, 1.6); c.stroke();
    c.fillStyle = RG(c, -10, -16, 3, 0, -4, 32, ['#9fd8ff', '#2b78c0', '#0d2f5a']); circ(c, 0, -4, 32); c.fill();
    c.fillStyle = '#5aa04a';
    c.beginPath(); c.moveTo(-20, -24); c.quadraticCurveTo(-4, -30, -2, -14); c.quadraticCurveTo(-12, -8, -8, 6); c.quadraticCurveTo(-22, 4, -24, -10); c.fill();
    c.beginPath(); c.moveTo(8, -10); c.quadraticCurveTo(24, -14, 22, 4); c.quadraticCurveTo(14, 18, 6, 12); c.fill();
  } },
  { id: 'fiole', name: 'Fiole', d(c) {
    c.fillStyle = 'rgba(210,235,245,.4)';
    c.beginPath(); c.moveTo(-7, -40); c.lineTo(7, -40); c.lineTo(7, -10); c.lineTo(30, 34); c.quadraticCurveTo(32, 44, 22, 44); c.lineTo(-22, 44); c.quadraticCurveTo(-32, 44, -30, 34); c.lineTo(-7, -10); c.closePath(); c.fill();
    c.fillStyle = LG(c, -30, 10, 30, 44, ['#a0ff7a', '#2aa84a', '#0d5a28']);
    c.beginPath(); c.moveTo(-18, 12); c.lineTo(18, 12); c.lineTo(30, 34); c.quadraticCurveTo(32, 44, 22, 44); c.lineTo(-22, 44); c.quadraticCurveTo(-32, 44, -30, 34); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(230,245,250,.9)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-7, -40); c.lineTo(-7, -10); c.lineTo(-30, 34); c.quadraticCurveTo(-32, 44, -22, 44); c.lineTo(22, 44); c.quadraticCurveTo(32, 44, 30, 34); c.lineTo(7, -10); c.lineTo(7, -40); c.stroke();
    c.fillStyle = '#9a6a3a'; c.fillRect(-8, -48, 16, 10);
    c.fillStyle = 'rgba(255,255,255,.7)'; circ(c, -8, 30, 3); c.fill(); circ(c, 6, 22, 2); c.fill();
  } },
  { id: 'theiere', name: 'Théière', d(c) {
    c.strokeStyle = '#2b4a6a'; c.lineWidth = 5; c.beginPath(); c.arc(34, 2, 14, -1.4, 1.4); c.stroke();
    c.fillStyle = LG(c, -40, 0, -24, 0, ['#2b4a6a', '#4f7aa0']); c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(-40, 0, -48, -18); c.lineTo(-42, -20); c.quadraticCurveTo(-36, -6, -24, -6); c.fill();
    c.fillStyle = RG(c, -10, -8, 4, 0, 6, 40, ['#a8c8e8', '#3a6a96', '#173550']); ell(c, 0, 8, 32, 28); c.fill();
    c.fillStyle = '#2b4a6a'; ell(c, 0, -18, 18, 6); c.fill(); circ(c, 0, -26, 5); c.fill();
    c.strokeStyle = '#e8d08a'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 8, 30, 8, 0, 0, Math.PI); c.stroke();
  } },
  { id: 'cerf_volant', name: 'Cerf-volant', d(c) {
    c.strokeStyle = '#5a4a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(10, 38, -8, 44, 6, 50); c.stroke();
    const q = [['#e84a3a', [0, -44], [30, -6], [0, 0]], ['#f2c12e', [0, -44], [-30, -6], [0, 0]], ['#2a8ad8', [-30, -6], [0, 30], [0, 0]], ['#36b36a', [30, -6], [0, 30], [0, 0]]];
    q.forEach(t => { c.fillStyle = t[0]; c.beginPath(); c.moveTo(...t[1]); c.lineTo(...t[2]); c.lineTo(...t[3]); c.closePath(); c.fill(); });
    c.strokeStyle = 'rgba(40,30,20,.6)'; c.beginPath(); c.moveTo(0, -44); c.lineTo(0, 30); c.moveTo(-30, -6); c.lineTo(30, -6); c.stroke();
  } },
  { id: 'escargot', name: 'Coquille d’escargot', d(c) {
    c.fillStyle = RG(c, -4, -6, 2, 0, 0, 40, ['#f2d2a0', '#b07a3a', '#5a3410']); circ(c, 0, 0, 38); c.fill();
    c.strokeStyle = 'rgba(70,40,10,.65)'; c.lineWidth = 3; c.beginPath();
    for (let a = 0; a < TAU * 2.6; a += 0.1) { const r = 3 + a * 2.1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke();
  } },
  { id: 'brosse', name: 'Peigne', d(c) {
    c.save(); c.rotate(-0.3);
    c.fillStyle = LG(c, 0, -14, 0, 0, ['#c9a06a', '#7a5428']); rrect(c, -46, -16, 92, 14, 5); c.fill();
    for (let i = 0; i < 18; i++) c.fillRect(-44 + i * 5, -4, 3, 22 - (i % 2) * 4);
    c.restore();
  } },
  { id: 'ticket', name: 'Ticket', d(c) {
    c.fillStyle = LG(c, -44, 0, 44, 0, ['#f2c46a', '#e0a23a']);
    c.beginPath(); c.moveTo(-44, -22); c.lineTo(44, -22); c.lineTo(44, -6); c.arc(44, 0, 6, -Math.PI / 2, Math.PI / 2, true); c.lineTo(44, 22); c.lineTo(-44, 22); c.lineTo(-44, 6); c.arc(-44, 0, 6, Math.PI / 2, -Math.PI / 2, true); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,50,10,.5)'; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(22, -20); c.lineTo(22, 20); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#7a3a10'; c.fillRect(-34, -10, 44, 5); c.fillRect(-34, 0, 30, 4); c.fillRect(28, -8, 8, 16);
  } },
];

// Rendu d'un objet en sprite haute définition (220 px, unité x2)
const SPRITE_SIZE = 220;
const spriteCache = new Map();
function getSprite(obj) {
  if (spriteCache.has(obj.id)) return spriteCache.get(obj.id);
  const cv = document.createElement('canvas');
  cv.width = cv.height = SPRITE_SIZE;
  const c = cv.getContext('2d');
  c.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  c.scale(2, 2);
  c.lineJoin = 'round';
  obj.d(c);
  // Modelé : lumière en haut à gauche, ombre en bas à droite
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = LG(c, 0, 0, SPRITE_SIZE, SPRITE_SIZE, ['rgba(255,255,255,.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.28)']);
  c.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  c.globalCompositeOperation = 'source-over';
  spriteCache.set(obj.id, cv);
  return cv;
}

// Sprite placé : rotation, teinte d'ambiance et ombre portée intégrées
function bakePlaced(obj, size, rot, tint, tintAlpha, res, flip) {
  const pad = 1.5;
  const px = Math.ceil(size * pad * res);
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const c = cv.getContext('2d');
  // objet teinté sur un calque temporaire
  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = px;
  const t = tmp.getContext('2d');
  t.translate(px / 2, px / 2);
  t.rotate(rot);
  if (flip) t.scale(-1, 1);
  const s = size * res;
  t.drawImage(getSprite(obj), -s / 2, -s / 2, s, s);
  if (tint && tintAlpha > 0) {
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.globalCompositeOperation = 'source-atop';
    t.globalAlpha = tintAlpha;
    t.fillStyle = tint;
    t.fillRect(0, 0, px, px);
  }
  c.shadowColor = 'rgba(0,0,0,.45)';
  c.shadowBlur = size * res * 0.08;
  c.shadowOffsetX = size * res * 0.035;
  c.shadowOffsetY = size * res * 0.05;
  c.drawImage(tmp, 0, 0);
  return { cv, ext: size * pad };
}
