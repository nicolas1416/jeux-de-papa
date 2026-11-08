'use strict';
/* ═══════════ Écrans et éléments ajoutés ═══════════ */
(function inject() {
  const app = $('#app');
  app.insertAdjacentHTML('beforeend', `
  <section id="s-daily" class="screen">
    <header class="bar">
      <button class="icon" data-back2 aria-label="Retour"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <h2>Défi du jour</h2><span class="bar-stars" id="dl-count"></span>
    </header>
    <div class="daily" id="daily"></div>
  </section>
  <section id="s-ach" class="screen">
    <header class="bar">
      <button class="icon" data-back2 aria-label="Retour"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <h2>Vitrine des succès</h2><span class="bar-stars" id="ach-count"></span>
    </header>
    <div class="ach-grid" id="ach-grid"></div>
  </section>
  <div class="react" id="react" aria-live="polite"><div class="react-face" id="react-face"></div><p class="react-bubble" id="react-text"></p></div>
  <div class="ach-toast" id="ach-toast" aria-live="polite"></div>
  <div class="modal zoom" id="m-egg" role="dialog" aria-modal="true" aria-label="Surprise">
    <div class="zoom-wrap"><img class="egg-photo" id="egg-photo" alt=""><p class="egg-cap" id="egg-cap"></p></div>
    <p class="zoom-hint">Touche n’importe où pour fermer</p>
  </div>`);
  $('#m-dex').insertAdjacentHTML('afterend', `
    <div class="menu-row"><button class="btn" id="m-daily">Défi du jour <span class="badge" id="daily-badge">Nouveau</span></button>
    <button class="btn" id="m-ach">Succès</button></div>`);
  $('#s-menu .brand').insertAdjacentHTML('afterbegin', `<img class="menu-poup" id="menu-poup" src="${$('#d-poup').src}" alt="Papa">`);
  document.querySelectorAll('[data-back2]').forEach(b => b.addEventListener('click', () => { Sound.tap(); show('s-menu'); }));
})();
const todayKey = (dt = new Date()) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const isPlaying = () => (current === 's-game' || current === 's-mini') && !document.querySelector('.modal.on, #reveal.on, #ad.on') && !(mini && mini.done) && !(game && game.done);

/* ═══════════ Papa qui réagit ═══════════ */
function poupFace(expr) {
  const eyes = {
    happy: '<path d="M43 52q4.5-4.5 9 0M67 52q4.5-4.5 9 0" class="pf-l"/>',
    open: '<circle cx="47.5" cy="51.5" r="3.2" class="pf-d"/><circle cx="71.5" cy="51.5" r="3.2" class="pf-d"/><circle cx="48.6" cy="50.3" r="1.1" fill="#fff"/><circle cx="72.6" cy="50.3" r="1.1" fill="#fff"/>',
    stars: '<path d="M47.5 45.5l1.6 3.6 3.9.3-3 2.5.9 3.8-3.4-2-3.4 2 .9-3.8-3-2.5 3.9-.3z" fill="#fff36a" stroke="#a06a00" stroke-width=".6"/><path d="M71.5 45.5l1.6 3.6 3.9.3-3 2.5.9 3.8-3.4-2-3.4 2 .9-3.8-3-2.5 3.9-.3z" fill="#fff36a" stroke="#a06a00" stroke-width=".6"/>',
    wide: '<circle cx="47.5" cy="51.5" r="4.6" fill="#fff" stroke="#2a1d14" stroke-width="1.2"/><circle cx="71.5" cy="51.5" r="4.6" fill="#fff" stroke="#2a1d14" stroke-width="1.2"/><circle cx="47.5" cy="52" r="2.2" class="pf-d"/><circle cx="71.5" cy="52" r="2.2" class="pf-d"/>',
    wink: '<path d="M43 52q4.5-4.5 9 0" class="pf-l"/><circle cx="71.5" cy="51.5" r="3.2" class="pf-d"/><circle cx="72.6" cy="50.3" r="1.1" fill="#fff"/>',
    sad: '<path d="M44 52q3.5 2.6 7 0M68 52q3.5 2.6 7 0" class="pf-l"/>',
  };
  const brows = {
    happy: '<path d="M41 41.5q5-3 11-1M67 40.5q6-2 11 1" class="pf-b"/>',
    up: '<path d="M41 38.5q5-4 11-1.5M67 37q6-2.5 11 1.5" class="pf-b"/>',
    worried: '<path d="M41 41q6-.5 11-4M67 37q5 3.5 11 4" class="pf-b"/>',
    sly: '<path d="M41 41.5q5-3 11-1M67 38.5q6-3 11 2" class="pf-b"/>',
  };
  const mouths = {
    smile: '<path d="M50 67q10 6 20-1" class="pf-m"/>',
    grin: '<path d="M48 65q12 1 24 0q-2 11-12 11t-12-11z" fill="#6a1a1a"/><path d="M49.5 65.6q10.5 .9 21 0l-.6 2.8q-9.9 .8-19.8 0z" fill="#fff"/>',
    o: '<ellipse cx="60" cy="69" rx="4" ry="4.6" fill="#6a1a1a"/>',
    wavy: '<path d="M50 69q3.3-3 6.6 0t6.7 0t6.7 0" class="pf-m"/>',
    smirk: '<path d="M52 68q8 4 16-2.5" class="pf-m"/>',
    frown: '<path d="M51 71q9-5.5 18 0" class="pf-m"/>',
  };
  const E = {
    happy: ['happy', 'happy', 'smile', ''], champion: ['stars', 'up', 'grin', '<text x="88" y="28" font-size="14">✨</text>'],
    oops: ['wide', 'worried', 'wavy', '<path d="M89 36q3 5 0 7q-3-2 0-7z" fill="#7ac0f0"/>'], hint: ['wink', 'sly', 'smirk', '<text x="86" y="30" font-size="13">🔍</text>'],
    sad: ['sad', 'worried', 'frown', '<path d="M46 60q1.5 3 0 5q-1.5-2 0-5z" fill="#7ac0f0"/>'], excited: ['open', 'up', 'o', ''], start: ['open', 'happy', 'grin', ''],
  }[expr] || ['happy', 'happy', 'smile', ''];
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="pfc"><circle cx="60" cy="60" r="58"/></clipPath>
    <linearGradient id="pfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#f06a1a"/></linearGradient></defs>
    <circle cx="60" cy="60" r="58" class="pf-bg"/><g clip-path="url(#pfc)">
    <path d="M6 122q4-32 36-38h36q32 6 36 38z" fill="#d9442b"/>
    <path d="M45 84q15 9 30 0" stroke="#a8301c" stroke-width="2.4" fill="none"/>
    <path d="M43 84l12 38M77 84l-12 38" stroke="#2f55b5" stroke-width="6"/>
    <rect x="50" y="70" width="20" height="15" fill="#e2ad88"/>
    <ellipse cx="35.5" cy="55" rx="4" ry="6.5" fill="#e2ad88"/><ellipse cx="84.5" cy="55" rx="4" ry="6.5" fill="#e2ad88"/>
    <ellipse cx="60" cy="53" rx="25" ry="28" fill="#f0c4a2"/>
    <path d="M36 50q-4-14 2-21l-1-6 5 3 1-7 5 5 4-7 4 6 5-6 3 6 6-3v6l5 1-2 5q5 9 2 19q-2-8-7-12q-9 3-21 2q-12 0-19 5q-3 3-4 5z" fill="#878a8e"/>
    <path d="M44 25l1 6M51 23l-1 7M59 21l1 7M67 22l-2 7M75 27l-3 6" stroke="#5c5f63" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M42 31q8-4 18-3M64 29q7 1 11 5" stroke="#b9bcbf" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M37 38q1-4 3-6M83 38q-1-4-3-6" stroke="#6e7175" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${brows[E[1]]}${eyes[E[0]]}
    <path d="M33 47q27-6 54 0l-1.5 6q-3 7-12.5 7q-8 0-11-5q-2-2.5-4 0q-3 5-11 5q-9.5 0-12.5-7z" fill="url(#pfg)" opacity=".62"/>
    <path d="M33 47q27-6 54 0l-1.5 6q-3 7-12.5 7q-8 0-11-5q-2-2.5-4 0q-3 5-11 5q-9.5 0-12.5-7z" fill="none" stroke="#1f1f22" stroke-width="1.6"/>
    <path d="M33 47q27-6 54 0" stroke="#1f1f22" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M38 50q6-1.5 10 0M66 49.5q6-1 10 .5" stroke="#fff" stroke-width="1.2" fill="none" opacity=".55" stroke-linecap="round"/>
    <path d="M33.5 48l-2.5 3M86.5 48l2.5 3" stroke="#1f1f22" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M58 58q2 5 4.5 0" stroke="#c48a66" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M45 62q-2 5 1 9M75 62q2 5-1 9" stroke="#c48a66" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M52 77q8 3 16 0" stroke="#c48a66" stroke-width="1" fill="none" opacity=".5"/>
    ${mouths[E[2]]}${E[3]}</g></svg>`;
}
const PHRASES = {
  oops: ['Oups, raté\u202f!', 'Aïe aïe aïe…', 'Presque\u202f! Pas par là.', 'Hum… ce n’est pas ça\u202f!'],
  hint: ['Tu chauffes…', 'Regarde bien par ici\u202f!', 'Petit coup de pouce\u202f!'],
  champion: ['Quel champion\u202f!', 'Trop fort\u202f!', 'Incroyable, quelle série\u202f!', 'Tu es en feu\u202f!'],
  start: ['C’est parti\u202f!', 'À nous deux\u202f!', 'Je suis prêt\u202f!', 'On va tout gagner\u202f!'],
  almost: ['Plus qu’un\u202f!', 'On y est presque\u202f!'],
  sad: ['Oh non… On réessaie\u202f?', 'Ce n’est que partie remise\u202f!'],
  undo: ['On revient en arrière\u202f!'], shuffle: ['Hop, on mélange tout\u202f!'],
};
const EXPR = { oops: 'oops', hint: 'hint', champion: 'champion', start: 'start', almost: 'excited', sad: 'sad', undo: 'hint', shuffle: 'excited', dance: 'champion', hello: 'happy', night: 'happy' };
const React = {
  ok: 0, ko: 0, last: 0, timer: 0, pending: null,
  say(kind, text, force) {
    const now = Date.now();
    if (!force && now - this.last < 4500) return;
    this.last = now;
    const el = $('#react'), list = PHRASES[kind];
    $('#react-face').innerHTML = poupFace(EXPR[kind] || 'happy');
    $('#react-text').textContent = text || (list ? list[Math.floor(Math.random() * list.length)] : '');
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(this.timer); this.timer = setTimeout(() => el.classList.remove('on'), 2800);
  },
  success() { this.ko = 0; this.ok++; if (this.ok === 3 || (this.ok > 3 && this.ok % 4 === 0)) this.say('champion'); },
  fail() { this.ok = 0; this.ko++; if (this.ko === 2 || (this.ko > 2 && this.ko % 3 === 0)) this.say('oops'); },
  reset() { this.ok = 0; this.ko = 0; this.last = 0; },
};
(function hookSounds() {
  const f = Sound.found, w = Sound.wrong, h = Sound.hint;
  Sound.found = (...a) => { const p = isPlaying(); f(...a); if (p) { React.success(); if (current === 's-game' && game && game.targets.filter(t => !t.found).length === 1) React.say('almost'); } };
  Sound.wrong = (...a) => { const p = isPlaying(); w(...a); if (p) React.fail(); };
  Sound.hint = (...a) => { const p = isPlaying(); h(...a); if (p) { React.say(React.pending || 'hint', null, true); React.pending = null; } };
  document.addEventListener('click', e => {
    if (e.target.closest('.lk-hint')) React.pending = 'hint';
    else if (e.target.closest('.lk-undo')) React.pending = 'undo';
  }, true);
})();

/* ═══════════ Succès ═══════════ */
const ACH = [
  // Progression
  { id: 'win1', icon: '🎉', name: 'Premier pas', desc: 'Gagner ta première manche.', stat: 'wins', goal: 1 },
  { id: 'win10', icon: '🥉', name: 'Bien lancé', desc: 'Gagner 10 manches.', stat: 'wins', goal: 10 },
  { id: 'win25', icon: '🚀', name: 'Décollage réussi', desc: 'Gagner 25 manches.', stat: 'wins', goal: 25 },
  { id: 'win50', icon: '🥈', name: 'À mi-chemin', desc: 'Gagner 50 manches.', stat: 'wins', goal: 50 },
  { id: 'win75', icon: '🏁', name: 'Dernière ligne droite', desc: 'Gagner 75 manches.', stat: 'wins', goal: 75 },
  { id: 'win100', icon: '🥇', name: 'Centenaire', desc: 'Gagner les 100 manches.', stat: 'wins', goal: 100 },
  // Étoiles et indices
  { id: 'stars50', icon: '⭐', name: 'Chasseur d’étoiles', desc: 'Gagner 50 étoiles.', stat: 'stars', goal: 50 },
  { id: 'stars150', icon: '🌟', name: 'La tête dans les étoiles', desc: 'Gagner 150 étoiles.', stat: 'stars', goal: 150 },
  { id: 'stars300', icon: '🌌', name: 'Galaxie complète', desc: 'Gagner les 300 étoiles.', stat: 'stars', goal: 300 },
  { id: 'perfect10', icon: '💯', name: 'Perfectionniste', desc: 'Gagner 10 manches avec 3 étoiles.', stat: 'perfect', goal: 10 },
  { id: 'perfect50', icon: '🏅', name: 'Zéro bug', desc: 'Gagner 50 manches avec 3 étoiles.', stat: 'perfect', goal: 50 },
  { id: 'nohint10', icon: '🧠', name: 'Sans coup de pouce', desc: 'Gagner 10 manches sans utiliser d’indice.', stat: 'noHint', goal: 10 },
  { id: 'nohint50', icon: '🤖', name: 'Cerveau positronique', desc: 'Gagner 50 manches sans utiliser d’indice.', stat: 'noHint', goal: 50 },
  // Les jeux
  { id: 'allgames', icon: '🎮', name: 'Touche-à-tout', desc: 'Gagner au moins une fois à chacun des 10 jeux.', stat: 'kinds', goal: 10 },
  { id: 'flash', icon: '⚡', name: 'Éclair', desc: 'Finir une scène d’objets cachés en moins d’une minute.' },
  { id: 'mots10', icon: '🔤', name: 'Moteur de recherche', desc: 'Gagner 10 parties de mots mêlés.', stat: 'g_mots', goal: 10 },
  { id: 'pendu5', icon: '🪢', name: 'Sauveur de Papa', desc: 'Gagner 5 parties de pendu.', stat: 'g_pendu', goal: 5 },
  { id: 'combo4', icon: '🍭', name: 'Pluie de bonbons', desc: 'Réussir un combo ×4 aux bonbons.' },
  { id: 'p4', icon: '🔴', name: 'Stratège', desc: 'Battre l’ordinateur au Puissance 4 sans perdre une seule fois dans ce niveau.' },
  { id: 'uno3', icon: '🃏', name: 'Roi du Uno', desc: 'Gagner 3 parties de Uno.', stat: 'uno', goal: 3 },
  { id: 'zip1', icon: '➰', name: 'Fil d’Ariane', desc: 'Réussir ton premier Zip.', stat: 'g_zip', goal: 1 },
  { id: 'zipfast', icon: '⏱️', name: 'Câble à haut débit', desc: 'Finir un Zip en moins de 45 secondes.' },
  { id: 'queens1', icon: '👑', name: 'Couronnement', desc: 'Réussir ton premier Queens.', stat: 'g_queens', goal: 1 },
  { id: 'queens5', icon: '♛', name: 'Le roi des reines', desc: 'Réussir 5 Queens.', stat: 'g_queens', goal: 5 },
  { id: 'tango1', icon: '🌗', name: 'Jour et nuit', desc: 'Réussir ton premier Tango.', stat: 'g_tango', goal: 1 },
  { id: 'tango5', icon: '💃', name: 'Danseur de tango', desc: 'Réussir 5 Tango.', stat: 'g_tango', goal: 5 },
  { id: 'patches1', icon: '🧩', name: 'Patchwork', desc: 'Réussir ton premier Patches.', stat: 'g_patches', goal: 1 },
  { id: 'patchesfast', icon: '🪡', name: 'Couturier express', desc: 'Finir un Patches en moins d’une minute.' },
  { id: 'logic20', icon: '🧮', name: 'Processeur logique', desc: 'Réussir 20 parties de Zip, Queens, Tango ou Patches au total.', stat: 'logic', goal: 20 },
  // Collection
  { id: 'dex10', icon: '🎒', name: 'Premier inventaire', desc: 'Réunir 10 objets dans le Sac de papa.', stat: 'dex', goal: 10 },
  { id: 'dex50', icon: '📖', name: 'Collectionneur', desc: 'Réunir 50 objets dans le Sac de papa.', stat: 'dex', goal: 50 },
  { id: 'dex100', icon: '🏆', name: 'Sac de papa complet', desc: 'Réunir les 100 objets.', stat: 'dex', goal: 100 },
  { id: 'shiny1', icon: '✨', name: 'Premier Shiny', desc: 'Obtenir ton premier Shiny.', stat: 'shiny', goal: 1 },
  { id: 'shiny10', icon: '💎', name: 'Chasseur de Shiny', desc: 'Obtenir 10 Shiny.', stat: 'shiny', goal: 10 },
  { id: 'super1', icon: '🎴', name: 'Carte maîtresse', desc: 'Gagner ta première carte Super Shiny.', stat: 'super', goal: 1 },
  { id: 'super3', icon: '👨‍👩‍👦', name: 'La famille au complet', desc: 'Gagner les 3 cartes Super Shiny.', stat: 'super', goal: 3 },
  { id: 'bonus6', icon: '🎁', name: 'Édition limitée', desc: 'Gagner 6 objets bonus avec les défis du jour.', stat: 'bonus', goal: 6 },
  // Défi du jour
  { id: 'daily1', icon: '📅', name: 'Premier défi', desc: 'Réussir ton premier défi du jour.', stat: 'daily', goal: 1 },
  { id: 'daily3', icon: '🔥', name: 'Fidèle au poste', desc: 'Réussir le défi du jour 3 jours d’affilée.', stat: 'bestStreak', goal: 3 },
  { id: 'daily7', icon: '🗓️', name: 'Une semaine sans bug', desc: 'Réussir le défi du jour 7 jours d’affilée.', stat: 'bestStreak', goal: 7 },
  { id: 'daily10', icon: '📆', name: 'Assidu', desc: 'Réussir 10 défis du jour.', stat: 'daily', goal: 10 },
  { id: 'daily30', icon: '🛰️', name: 'Toujours connecté', desc: 'Réussir 30 défis du jour.', stat: 'daily', goal: 30 },
  // Bêtisiers cachés : une énigme pour chacun
  { id: 'egg_dance', icon: '🕺', secret: true, name: 'Danseur étoile', desc: 'Faire danser Papa dans le menu.', riddle: 'Dans le menu, je souris en silence… mais une petite tape, et j’entre dans la danse.' },
  { id: 'egg_dizzy', icon: '😵‍💫', secret: true, name: 'J’ai le tournis', desc: 'Faire danser Papa 10 fois d’affilée.', riddle: 'Une danse, ça va. Mais si tu insistes dix fois sans me laisser souffler, je vais finir par voir des étoiles.' },
  { id: 'egg_logo', icon: '📸', secret: true, name: 'Coucou la maison', desc: 'Faire apparaître une photo de la maison.', riddle: 'Tape cinq fois sur mon nom, et quelqu’un de la maison viendra te saluer.' },
  { id: 'egg_spin', icon: '🌀', secret: true, name: 'La toupie', desc: 'Faire tourner les objets du Sac de papa.', riddle: 'Dans le Sac de papa, tape trois fois sur son titre : tout le monde fera la toupie.' },
  { id: 'egg_name', icon: '🪪', secret: true, name: 'Je te reconnais\u202f!', desc: 'Prendre le prénom de quelqu’un de la famille comme pseudo.', riddle: 'Prends pour pseudo le prénom d’un Shiny… et quelqu’un te reconnaîtra.' },
  { id: 'egg_root', icon: '🔓', secret: true, name: 'Accès root', desc: 'Prendre « root », « admin » ou « sudo » comme pseudo.', riddle: 'Sur les machines Linux, un seul utilisateur a tous les pouvoirs. Prends son nom comme pseudo.' },
  { id: 'egg_dev', icon: '🛠️', secret: true, name: 'Mode développeur', desc: 'Faire apparaître la zone secrète des réglages.', riddle: 'Comme sur un téléphone Android, tape cinq fois au bon endroit des réglages pour devenir développeur.' },
  { id: 'egg_mute', icon: '🔇', secret: true, name: 'Mode veille', desc: 'Couper la musique et les effets sonores.', riddle: 'Plus un bruit, plus une note : fais taire la machine comme un ordinateur en veille.' },
  { id: 'egg_404', icon: '🚫', secret: true, name: 'Erreur 404', desc: 'Toquer quatre fois au titre des succès.', riddle: 'Dans la salle des trophées, toque quatre fois sur le titre… et trouve le succès introuvable.' },
  { id: 'egg_42', icon: '🌌', secret: true, name: 'La grande question', desc: 'Gagner le niveau 42.', riddle: 'Quelle est la réponse à la grande question sur la vie, l’univers et le reste\u202f? Gagne ce niveau-là.' },
  { id: 'egg_ctrl', icon: '⌨️', secret: true, name: 'Ctrl+Alt+Suppr', desc: 'Perdre trois fois de suite le même niveau.', riddle: 'Quand ça plante trois fois de suite au même endroit, un vrai geek connaît la combinaison magique.' },
  { id: 'egg_night', icon: '🌙', secret: true, name: 'Couche-tard', desc: 'Ouvrir le jeu tard le soir.', riddle: 'Reviens quand la lune est haute, après 22 heures, et regarde bien le menu.' },
  { id: 'egg_morning', icon: '☕', secret: true, name: 'Lève-tôt', desc: 'Ouvrir le jeu avant 7 heures du matin.', riddle: 'Avant même que le café ne coule, entre 5 et 7 heures, viens me dire bonjour.' },
];
function achStats() {
  const S = Save.d, dx = S.dex || {}, st = S.st || {}, dl = S.daily || {}, g = st.games || {};
  const s = {
    wins: Object.keys(S.levels).length, perfect: Object.values(S.levels).filter(l => l.stars === 3).length, stars: totalStars(),
    noHint: st.noHint || 0, uno: g.uno || st.uno || 0, shiny: (dx.shinyOrder || []).length, dex: Object.keys(dx.got || {}).length,
    super: Object.keys(dx.super || {}).length, bonus: Object.keys(dx.bonus || {}).length,
    daily: dl.total || 0, bestStreak: dl.best || 0,
    kinds: GAME_ORDER.filter(k => g[k]).length, logic: ['zip', 'queens', 'tango', 'patches'].reduce((t, k) => t + (g[k] || 0), 0),
  };
  GAME_ORDER.forEach(k => { s['g_' + k] = g[k] || 0; });
  return s;
}
const Ach = {
  queue: [], showing: false,
  has(id) { return !!(Save.d.ach && Save.d.ach[id]); },
  unlock(id) {
    Save.d.ach = Save.d.ach || {};
    if (Save.d.ach[id]) return;
    Save.d.ach[id] = Date.now(); Save.write();
    const a = ACH.find(x => x.id === id); if (!a) return;
    this.queue.push(a); this.next();
  },
  next() {
    if (this.showing || !this.queue.length) return;
    this.showing = true; const a = this.queue.shift(), el = $('#ach-toast');
    el.innerHTML = `<span class="at-medal">${a.icon}</span><span><small>Succès débloqué</small><b>${a.name}</b></span>`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); Sound.tap();
    setTimeout(() => { el.classList.remove('on'); setTimeout(() => { this.showing = false; this.next(); }, 450); }, 3200);
  },
  check() { const s = achStats(); ACH.forEach(a => { if (a.stat && s[a.stat] >= a.goal) this.unlock(a.id); }); },
};
function renderAch() {
  const s = achStats(), box = $('#ach-grid'), got = ACH.filter(a => Ach.has(a.id)).length;
  $('#ach-count').textContent = `${got}/${ACH.length}`;
  box.innerHTML = ACH.map(a => {
    const on = Ach.has(a.id), when = on ? new Date(Save.d.ach[a.id]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
    const prog = !on && a.stat && a.goal > 1 ? `<div class="ach-prog"><i style="width:${Math.min(100, s[a.stat] / a.goal * 100)}%"></i></div><small>${Math.min(s[a.stat], a.goal)} / ${a.goal}</small>` : '';
    const text = on ? a.desc : a.secret ? `<em>Énigme : ${a.riddle}</em>` : a.desc;
    return `<div class="ach ${on ? 'on' : ''} ${a.secret ? 'secret' : ''}"><span class="ach-medal">${on || !a.secret ? a.icon : '?'}</span>
      <div class="ach-txt"><b>${on || !a.secret ? a.name : 'Bêtisier caché'}</b><p>${text}</p>${prog}${on ? `<small class="ach-date">Débloqué le ${when}</small>` : ''}</div></div>`;
  }).join('');
}

/* ═══════════ Défi du jour ═══════════ */
const GAME_ICON = { objets: '🔍', mots: '🔤', candy: '🍬', pendu: '✏️', zip: '➰', queens: '👑', uno: '🃏', puissance4: '🔴', tango: '🌗', patches: '🧩' };
const DAILY_N = 1001;
let daily = null;
function dailyData() { Save.d.daily = Save.d.daily || { days: {}, streak: 0, best: 0, total: 0, last: '' }; return Save.d.daily; }
function dailyGame(key) {
  let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const list = GAME_ORDER.filter(g => g !== 'objets');
  return list[h % list.length];
}
function streakNow() {
  const dl = dailyData(), y = new Date(); y.setDate(y.getDate() - 1);
  return dl.last === todayKey() || dl.last === todayKey(y) ? dl.streak : 0;
}
function renderDaily(note) {
  const dl = dailyData(), key = todayKey(), done = !!dl.days[key], g = dailyGame(key), st = streakNow();
  const toBonus = 3 - (st % 3 === 0 && done ? 3 : st % 3);
  const week = []; for (let k = 6; k >= 0; k--) { const dt = new Date(); dt.setDate(dt.getDate() - k); const kk = todayKey(dt); week.push(`<span class="dl-day ${dl.days[kk] ? 'ok' : ''} ${kk === key ? 'today' : ''}"><small>${dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</small>${dl.days[kk] ? '✓' : dt.getDate()}</span>`); }
  const bonus = Object.entries(dl.days).filter(([, v]) => (v.a >= 0 && v.a !== undefined) || v.b >= 0).sort((a, b) => a[0] < b[0] ? 1 : -1);
  $('#dl-count').textContent = `${dl.total} réussi${dl.total > 1 ? 's' : ''}`;
  $('#daily').innerHTML = `
    ${note ? `<p class="dl-note">${note}</p>` : ''}
    <div class="dl-today ${done ? 'done' : ''}">
      <span class="dl-icon">${GAME_ICON[g]}</span>
      <div><small>Le jeu surprise d’aujourd’hui</small><h3>${GAME_INFO[g].name}</h3>
      <p>${done ? 'Défi réussi\u202f! Reviens demain pour un nouveau jeu surprise.' : 'Réussis-le pour faire grandir ta série.'}</p></div>
      ${done ? '<span class="dl-check">✓</span>' : '<button class="btn primary" id="dl-go">Relever le défi</button>'}
    </div>
    <div class="dl-streak">
      <div class="dl-flame"><span>🔥</span><b>${st}</b><small>jour${st > 1 ? 's' : ''} d’affilée</small></div>
      <div class="dl-bonus"><p>${toBonus === 0 ? 'Objet bonus gagné aujourd’hui\u202f!' : `Encore <b>${toBonus}</b> jour${toBonus > 1 ? 's' : ''} d’affilée pour un <b>objet exclusif</b> du Sac de papa.`}</p>
        <div class="dl-eggs">${[0, 1, 2].map(i => `<span class="${i < (st % 3 === 0 && st && done ? 3 : st % 3) ? 'on' : ''}">🎁</span>`).join('')}</div></div>
    </div>
    <div class="dl-week">${week.join('')}</div>
    <div class="dl-gains"><h4>Objets bonus gagnés grâce aux défis</h4>
      ${bonus.length ? `<div class="dl-cards">${bonus.map(([k, v]) => `<div class="dl-gain">${v.b >= 0 ? bonusCard(v.b) : animalCard(v.a)}<small>${new Date(k).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</small></div>`).join('')}</div>` : '<p class="dl-empty">Aucun pour l’instant : réussis 3 défis d’affilée pour gagner ton premier objet bonus.</p>'}
      <p class="dl-best">Meilleure série : ${dl.best} jour${dl.best > 1 ? 's' : ''} · Défis réussis : ${dl.total}</p></div>
    ${!done && note ? '<button class="btn ghost" id="dl-skip">Plus tard, jouer mon niveau</button>' : ''}`;
  const go = $('#dl-go'); if (go) go.addEventListener('click', () => { Sound.tap(); startDaily(); });
  const sk = $('#dl-skip'); if (sk) sk.addEventListener('click', () => { Sound.tap(); dl.skip = key; Save.write(); startLevel(nextLevel()); });
}
function startDaily() {
  const key = todayKey(); daily = { key, game: dailyGame(key), round: Math.min(9, 1 + Math.floor(Object.keys(Save.d.levels).length / 12)) };
  Sound.init(); closeModals(); paused = false; game = null; curLevel = DAILY_N; adSeenLevel = DAILY_N; React.reset();
  MiniHost.start(DAILY_N);
  $('#x-level').textContent = 'Défi du jour';
  setTimeout(() => { if (isPlaying()) React.say('start', 'Défi du jour : c’est parti\u202f!', true); }, 900);
}
// les mini-jeux savent lancer le défi du jour
const _gameFor = gameFor, _roundOf = roundOf, _diffOf = diffOf;
gameFor = n => n === DAILY_N && daily ? daily.game : _gameFor(n);
roundOf = n => n === DAILY_N && daily ? daily.round : _roundOf(n);
diffOf = n => n === DAILY_N && daily ? daily.round / 9 : _diffOf(n);
const _startLevel = startLevel;
startLevel = n => { if (n === DAILY_N) return startDaily(); daily = null; React.reset(); _startLevel(n); setTimeout(() => { if (isPlaying()) React.say('start', null, true); }, 900); };
const _leaveGame = leaveGame;
leaveGame = () => { if (daily) { closeModals(); MiniHost.stop(); game = null; paused = false; daily = null; show('s-daily'); renderDaily(); return; } _leaveGame(); };

/* ═══════════ Victoire, défaite : suivi des succès et du défi ═══════════ */
const _showVictory = showVictory;
showVictory = o => {
  $('#d-replay').style.display = ''; $('#d-levels').textContent = 'Tous les niveaux';
  if (o.n === DAILY_N && daily) return dailyVictory(o);
  const firstWin = !Save.d.levels[o.n];
  _showVictory(o);
  Save.d.st = Save.d.st || {};
  const st = Save.d.st, sv = o.stats || [];
  const hints = (sv.find(s => s.label === 'Indices') || { value: 0 }).value;
  if (hints === 0) st.noHint = (st.noHint || 0) + 1;
  st.games = st.games || {}; st.games[o.game] = (st.games[o.game] || 0) + 1;
  if (Save.d.lossRun) Save.d.lossRun = null;
  Save.write();
  const t = mini ? mini.elapsed : 999;
  if (o.game === 'objets' && game && game.elapsed < 60) Ach.unlock('flash');
  if (o.game === 'puissance4' && !(Save.d.lostLv && Save.d.lostLv[o.n])) Ach.unlock('p4');
  if (o.game === 'zip' && t < 45) Ach.unlock('zipfast');
  if (o.game === 'patches' && t < 60) Ach.unlock('patchesfast');
  if (o.n === 42) Ach.unlock('egg_42');
  setTimeout(() => Ach.check(), firstWin ? 400 : 0);
  if (firstWin) grantSuper(o.n);
};
function dailyVictory(o) {
  const dl = dailyData(), key = daily.key, already = !!dl.days[key];
  let bonus = -1;
  if (!already) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    dl.streak = dl.last === todayKey(y) ? dl.streak + 1 : 1; dl.last = key; dl.total++; dl.best = Math.max(dl.best, dl.streak);
    let isB = false;
    if (dl.streak % 3 === 0) { bonus = drawBonus(); isB = bonus >= 0; if (!isB) bonus = drawAnimal(); }
    dl.days[key] = isB ? { g: daily.game, b: bonus } : { g: daily.game, a: bonus };
    daily.isB = isB;
    Save.write();
  }
  Sound.complete();
  $('#d-stars').innerHTML = [0, 1, 2].map(i => `<span class="${i < o.stars ? 'on' : ''}" style="animation-delay:${.15 + i * .18}s">★</span>`).join('');
  $('#done-title').textContent = 'Bravo Papa, défi du jour réussi\u202f!';
  $('#d-sub').textContent = `${GAME_INFO[daily.game].name} · série de ${dl.streak} jour${dl.streak > 1 ? 's' : ''} 🔥`;
  $('#d-stats').innerHTML = o.stats.slice(0, 3).map(s => `<div><dt>${s.label}</dt><dd>${s.value}</dd></div>`).join('');
  const rw = $('#d-reward');
  if (bonus >= 0) { rw.innerHTML = '<p class="rw-title">Objet bonus pour ta série\u202f!</p>' + (daily.isB ? bonusCard(bonus, true) : animalCard(bonus, true)); rw.className = 'reward new'; }
  else { const left = 3 - (dl.streak % 3); rw.innerHTML = `<p class="rw-title">Encore ${left} jour${left > 1 ? 's' : ''} d’affilée pour un objet bonus 🎁</p>`; rw.className = 'reward'; }
  const poup = $('#d-poup'); poup.style.animation = 'none'; void poup.offsetWidth; poup.style.animation = '';
  $('#d-next').style.display = 'none'; $('#d-replay').style.display = 'none'; $('#d-levels').textContent = 'Continuer';
  $('#m-done').classList.add('on');
  if (bonus >= 0) showReveal(bonus, daily.isB);
  setTimeout(() => Ach.check(), 400);
}
const _showLose = showLose;
showLose = (t, x) => {
  if (!daily) {
    Save.d.lostLv = Save.d.lostLv || {}; Save.d.lostLv[curLevel] = 1;
    const lr = Save.d.lossRun && Save.d.lossRun.lv === curLevel ? Save.d.lossRun : { lv: curLevel, n: 0 };
    lr.n++; Save.d.lossRun = lr; Save.write();
    if (lr.n >= 3) setTimeout(() => Ach.unlock('egg_ctrl'), 900);
  }
  _showLose(t, x); React.say('sad', null, true);
};

/* ═══════════ Menu : défi du jour avant le niveau, nuit, bêtisiers ═══════════ */
const _refreshMenu = refreshMenu;
refreshMenu = () => {
  _refreshMenu();
  const h = new Date().getHours(), night = h >= 22 || h < 5;
  $('#s-menu').classList.toggle('night', night);
  if (night) { $('#hello').textContent = `Bonne nuit, ${Save.d.pseudo}\u202f! Encore une petite partie\u202f?`; Ach.unlock('egg_night'); }
  if (h >= 5 && h < 7) { $('#hello').textContent = `Déjà debout, ${Save.d.pseudo}\u202f? Le café est prêt ☕`; Ach.unlock('egg_morning'); }
  const dl = dailyData(); $('#daily-badge').hidden = !!dl.days[todayKey()];
};
// « Jouer » propose d’abord le défi du jour, une fois par jour
$('#m-play').addEventListener('click', e => {
  const dl = dailyData(), key = todayKey();
  if (dl.days[key] || dl.skip === key || doneCount() >= LEVELS) return;
  e.stopImmediatePropagation(); Sound.tap(); show('s-daily'); renderDaily('Nouveau jour, nouveau défi\u202f! Commence par le jeu surprise avant ton niveau.');
}, true);
$('#m-daily').addEventListener('click', () => { Sound.tap(); show('s-daily'); renderDaily(); });
$('#m-ach').addEventListener('click', () => { Sound.tap(); show('s-ach'); renderAch(); });
// Bêtisier : faire danser Papa (et lui donner le tournis)
let danceTaps = [];
$('#menu-poup').addEventListener('click', () => {
  const p = $('#menu-poup'); p.classList.remove('dance'); void p.offsetWidth; p.classList.add('dance');
  const now = Date.now(); danceTaps = danceTaps.filter(t => now - t < 8000).concat(now);
  if (danceTaps.length >= 10) { danceTaps = []; Sound.jingle(); React.say('oops', 'Stop, j’ai le tournis\u202f!', true); Ach.unlock('egg_dizzy'); return; }
  Sound.jingle(); React.say('champion', 'Tu veux danser avec moi\u202f?', true); Ach.unlock('egg_dance');
});
// Bêtisier : cinq tapes sur le nom
let logoTaps = [];
$('#s-menu .logo').addEventListener('click', () => {
  const now = Date.now(); logoTaps = logoTaps.filter(t => now - t < 2500).concat(now);
  if (logoTaps.length < 5) return; logoTaps = [];
  const pics = [...document.querySelectorAll('.ad-photo img')], img = pics[Math.floor(Math.random() * pics.length)];
  const CAP = { chat: 'Le chat fait son yoga rien que pour toi\u202f!', chat2: 'Le chat te défie à la boxe\u202f!', chat3: 'Le chat t’observe de très, très près…', transat: 'Une petite pause sur le grand transat\u202f!', chien: 'Le chien t’offre son plus beau sourire\u202f!', poncho: 'Toujours au sec… ou presque\u202f!', atelier: 'Coucou depuis l’atelier\u202f!' };
  $('#egg-photo').src = img.src; $('#egg-cap').textContent = CAP[img.dataset.animal] || 'Coucou\u202f!';
  $('#m-egg').classList.add('on'); Sound.jingle(); Ach.unlock('egg_logo');
});
$('#m-egg').addEventListener('click', () => { Sound.tap(); $('#m-egg').classList.remove('on'); });
// Bouton caché : toucher 5 fois le titre « Réglages » fait apparaître la réinitialisation totale
let setTaps = [], wipeStep = 0;
$('#s-settings .bar h2').addEventListener('click', () => {
  const now = Date.now(); setTaps = setTaps.filter(t => now - t < 3000).concat(now);
  if (setTaps.length < 5) return; setTaps = [];
  $('#wipe-field').hidden = false; wipeStep = 0; $('#set-wipe').textContent = 'Réinitialiser tout le jeu'; Sound.jingle(); Ach.unlock('egg_dev');
  $('#wipe-field').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#m-settings').addEventListener('click', () => { $('#wipe-field').hidden = true; wipeStep = 0; });
$('#set-wipe').addEventListener('click', () => {
  wipeStep++;
  if (wipeStep === 1) { $('#set-wipe').textContent = 'Tu es sûre ? Touche encore'; Sound.tap(); return; }
  if (wipeStep === 2) { $('#set-wipe').textContent = 'Dernière chance : touche une 3e fois pour tout effacer'; Sound.tap(); return; }
  try { localStorage.removeItem(Save.key); } catch (e) { /* stockage indisponible */ }
  location.reload();
});
// Bêtisier : trois tapes sur le titre du Sac de papa
let dexTaps = [];
$('#s-dex .bar h2').addEventListener('click', () => {
  const now = Date.now(); dexTaps = dexTaps.filter(t => now - t < 1500).concat(now);
  if (dexTaps.length < 3) return; dexTaps = [];
  const g = $('#dex-grid'); g.classList.remove('spin'); void g.offsetWidth; g.classList.add('spin'); Sound.jingle(); Ach.unlock('egg_spin');
});
// Bêtisier : un prénom de la famille en pseudo
const FAMILY = ['nicolas', 'clement', 'patrick', 'maman', 'marcelle', 'mamie marcelle', 'paulette', 'mamie paulette', 'gerard', 'liloo', 'gilbert'];
['#pseudo-ok', '#set-pseudo-ok'].forEach(sel => $(sel).addEventListener('click', () => {
  const p = strip(Save.d.pseudo || '').toLowerCase().trim();
  if (['root', 'admin', 'sudo'].includes(p)) { setTimeout(() => { React.say('champion', 'Accès root accordé. Bienvenue, administrateur\u202f!', true); Ach.unlock('egg_root'); }, 600); return; }
  if (FAMILY.includes(p)) { setTimeout(() => { React.say('champion', `Coucou ${Save.d.pseudo}\u202f! Je t’ai reconnu\u202f!`, true); Ach.unlock('egg_name'); }, 600); }
}));

/* ═══════════ Pubs interactives ═══════════ */
const AD_REACT = {
  chat: ['Miaou\u202f! À moi\u202f!', 'Je l’attrape\u202f!', 'Ronron… parfait.'],
  transat: ['Oh, merci\u202f!', 'Je reste encore un peu\u202f!', 'Quelle belle surprise\u202f!'],
  chien: ['Wouf wouf\u202f!', 'Encore, encore\u202f!', 'Regarde mon sourire\u202f!'],
  poncho: ['Ah, enfin un peu de sec\u202f!', 'Bon… d’accord, je souris.', 'Même pas mouillé\u202f!'],
  atelier: ['Parfait pour le chantier\u202f!', 'Ça, c’est du matériel\u202f!', 'Validé par l’atelier\u202f!'],
};
$('.ad-row').insertAdjacentHTML('afterend', '<p class="ad-touch" id="ad-touch">👆 Touche le produit\u202f!</p>');
const _showAd = showAd;
showAd = (n, cb) => { _showAd(n, cb); $('#ad-touch').hidden = false; $('#ad').classList.remove('reacted'); };
$('#ad-visual').addEventListener('click', e => {
  e.stopPropagation();
  const ad = $('#ad'), animal = ad.dataset.animal, vis = $('#ad-visual'), photo = ad.querySelector('.ad-photo img.on');
  if (!photo) return;
  const a = vis.getBoundingClientRect(), b = photo.getBoundingClientRect();
  vis.style.setProperty('--fx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px'); vis.style.setProperty('--fy', (b.top + b.height / 2 - a.top - a.height / 2) + 'px');
  vis.classList.remove('fly'); void vis.offsetWidth; vis.classList.add('fly');
  photo.classList.remove('react-' + animal); void photo.offsetWidth;
  setTimeout(() => {
    photo.classList.add('react-' + animal);
    const lines = AD_REACT[animal] || ['Miam\u202f!']; $('#ad-bubble').textContent = lines[Math.floor(Math.random() * lines.length)];
    const bub = $('#ad-bubble'); bub.style.animation = 'none'; void bub.offsetWidth; bub.style.animation = '';
    Sound.found();
    const fig = ad.querySelector('.ad-photo');
    for (let i = 0; i < 8; i++) { const s = document.createElement('i'); s.className = 'ad-heart'; s.textContent = ({ chat: '🐾', transat: '💛', chien: '🦴', poncho: '💧', atelier: '🔧' })[animal] || '❤️'; s.style.left = 20 + Math.random() * 60 + '%'; s.style.animationDelay = Math.random() * .4 + 's'; fig.appendChild(s); setTimeout(() => s.remove(), 1800); }
  }, 550);
  $('#ad-touch').hidden = true; ad.classList.add('reacted');
});

/* ═══════════ Cartes Super Shiny : niveaux 25, 50 et 75 ═══════════ */
const SUPER = [{ lv: 25, name: 'Clément le Rigolo' }, { lv: 50, name: 'Maman la Maladroite' }, { lv: 75, name: 'Nico le Pro Moto' }];
const superSrc = k => document.querySelector(`#super-imgs img[data-k="${k}"]`).src;
function superCardHTML(k) { return `<div class="super-card"><img src="${superSrc(k)}" alt="Carte Super Shiny ${SUPER[k].name}"><span class="sc-holo"></span></div>`; }
function superData() { dexInit(); Save.d.dex.super = Save.d.dex.super || {}; return Save.d.dex.super; }
let superQueue = [];
function afterReveal() { if (superQueue.length) { const k = superQueue.shift(); setTimeout(() => showReveal(k, 'super'), 350); } }
function grantSuper(n, silent) {
  const k = SUPER.findIndex(s => s.lv === n), sd = superData();
  if (k < 0 || sd[k]) return;
  sd[k] = Date.now(); Save.write();
  if (silent) return;
  superQueue.push(k);
  setTimeout(() => { if (!$('#reveal').classList.contains('on')) afterReveal(); }, 1500);
}
// une partie déjà avancée récupère ses cartes sans animation
SUPER.forEach(s => { if (Save.d.levels[s.lv]) grantSuper(s.lv, true); });
const _renderDexS = renderDex;
renderDex = () => {
  _renderDexS();
  const sd = superData(), box = $('#dex-grid'), n = Object.keys(sd).length;
  const head = document.createElement('div'); head.className = 'dex-sep super-sep';
  head.innerHTML = `<h3>✦ Cartes Super Shiny ✦</h3><span>${n}/3 · à gagner aux niveaux 25, 50 et 75</span>`;
  box.appendChild(head);
  SUPER.forEach((s, k) => {
    const cell = document.createElement('div'); cell.className = 'dcell scell';
    cell.innerHTML = sd[k] ? `<button class="scard" data-s="${k}" aria-label="Carte ${s.name}"><img src="${superSrc(k)}" alt=""><span class="sc-holo"></span></button>`
      : `<div class="scard locked"><span class="sc-q">★</span><span class="sc-lv">Niveau ${s.lv}</span></div>`;
    box.appendChild(cell);
  });
};
$('#dex-grid').addEventListener('click', e => {
  const c = e.target.closest('.scard[data-s]'); if (!c) return;
  const k = +c.dataset.s; Sound.tap();
  $('#zoom-card').innerHTML = superCardHTML(k).replace('super-card', 'super-card zoom') + `<p class="zoom-info">Carte Super Shiny · gagnée au niveau ${SUPER[k].lv} · le ${new Date(superData()[k]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`;
  $('#m-card').classList.add('on');
});

/* ═══════════ Fond flou : un collage des 10 jeux ═══════════ */
paintBackdrop = function () {
  const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 900;
  const c = cv.getContext('2d'), R = mulberry32(Date.now() % 100000);
  c.fillStyle = RG(c, 800, 450, 50, 800, 450, 950, ['#2a4650', '#16232a', '#0d161a']); c.fillRect(0, 0, 1600, 900);
  const rr = (x, y, w, h, r) => { rrect(c, x, y, w, h, r); };
  const emo = (t, x, y, s) => { c.font = `${s}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y); };
  const txt = (t, x, y, s, col, w) => { c.font = `${w || 700} ${s}px 'Chakra Petch', system-ui, sans-serif`; c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y); };
  const W = 380, H = 270;
  const P = {
    objets(w, h) {
      const { bg, fg } = paintScene(nextLevel(), .26); c.drawImage(bg, -w / 2, -h / 2 - 10, w, w / 2 + 20); c.drawImage(fg, -w / 2, -h / 2 - 10, w, w / 2 + 20);
      c.fillStyle = '#16232a'; c.fillRect(-w / 2, h / 2 - 50, w, 50);
      ['Souris', 'Pile', 'Robot', 'Loupe'].forEach((m, i) => { c.fillStyle = 'rgba(237,230,216,.12)'; rr(-w / 2 + 14 + i * 90, h / 2 - 38, 80, 26, 6); c.fill(); txt(m, -w / 2 + 54 + i * 90, h / 2 - 25, 13, '#ede6d8', 500); });
    },
    mots(w, h) {
      c.fillStyle = '#f4ecd8'; rr(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 12); c.fill();
      const L = 'MAISONPLUIECHATBATEAUROSE'; const cols = ['#e8a33a', '#5ab0a0', '#d86a8a'];
      cols.forEach((col, k) => { c.fillStyle = col; rr(-w / 2 + 40, -h / 2 + 40 + k * 64, 220 - k * 40, 30, 15); c.fill(); });
      for (let y = 0; y < 7; y++) for (let x = 0; x < 10; x++) txt(L[(x * 7 + y * 3) % L.length], -w / 2 + 45 + x * 32, -h / 2 + 55 + y * 32, 18, '#2a2018');
    },
    candy(w, h) {
      c.fillStyle = '#2a3a48'; c.fillRect(-w / 2, -h / 2, w, h);
      const E = ['🍬', '🍭', '🍩', '🍪', '🧁', '🍫'];
      for (let y = 0; y < 5; y++) for (let x = 0; x < 7; x++) emo(E[Math.floor(R() * E.length)], -w / 2 + 40 + x * 50, -h / 2 + 38 + y * 50, 34);
    },
    pendu(w, h) {
      c.fillStyle = '#f4ecd8'; c.fillRect(-w / 2, -h / 2, w, h);
      c.strokeStyle = '#6a4424'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-160, 110); c.lineTo(-60, 110); c.moveTo(-130, 110); c.lineTo(-130, -100); c.lineTo(-50, -100); c.lineTo(-50, -80); c.stroke();
      c.strokeStyle = '#2a2018'; c.lineWidth = 5; c.beginPath(); c.arc(-50, -62, 16, 0, TAU); c.moveTo(-50, -46); c.lineTo(-50, 0); c.moveTo(-50, -30); c.lineTo(-70, -10); c.stroke();
      for (let i = 0; i < 6; i++) { c.fillStyle = '#d6ad60'; c.fillRect(10 + i * 26, -10, 20, 4); }
      txt('A', 20, -26, 22, '#2a2018'); txt('E', 98, -26, 22, '#2a2018');
      for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { c.fillStyle = (r + k) % 4 ? '#1d2e36' : '#3a7a4a'; rr(4 + k * 28, 20 + r * 30, 24, 26, 5); c.fill(); }
    },
    zip(w, h) {
      c.fillStyle = '#f4f1ea'; c.fillRect(-w / 2, -h / 2, w, h);
      const n = 6, s = 38, x0 = -n * s / 2, y0 = -n * s / 2;
      c.strokeStyle = '#d8d2c4'; c.lineWidth = 1.5;
      for (let k = 0; k <= n; k++) { c.beginPath(); c.moveTo(x0 + k * s, y0); c.lineTo(x0 + k * s, y0 + n * s); c.moveTo(x0, y0 + k * s); c.lineTo(x0 + n * s, y0 + k * s); c.stroke(); }
      const P = [0, 1, 2, 8, 7, 6, 12, 13, 14, 15, 9, 3, 4, 5, 11, 17, 16, 22, 21, 20];
      c.strokeStyle = '#ff7a3d'; c.lineWidth = 18; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
      P.forEach((i, k) => { const x = x0 + (i % n + .5) * s, y = y0 + (Math.floor(i / n) + .5) * s; k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
      [[0, '1'], [14, '2'], [5, '3'], [20, '4'], [33, '5']].forEach(([i, t]) => { const x = x0 + (i % n + .5) * s, y = y0 + (Math.floor(i / n) + .5) * s; c.fillStyle = '#111'; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); txt(t, x, y + 1, 15, '#fff', 800); });
    },
    queens(w, h) {
      c.fillStyle = '#1d2a33'; c.fillRect(-w / 2, -h / 2, w, h);
      const n = 6, s = 38, x0 = -n * s / 2, y0 = -n * s / 2, COL = ['#f4a58a', '#a9c8f0', '#c3e39a', '#f2d36b', '#d3b3ec', '#93d9d0'];
      const G = '001122001122331122334452334455334455';
      for (let i = 0; i < 36; i++) { c.fillStyle = COL[+G[i]]; c.fillRect(x0 + (i % n) * s, y0 + Math.floor(i / n) * s, s - 1, s - 1); }
      [1, 9, 16, 24, 32].forEach(i => emo('👑', x0 + (i % n + .5) * s, y0 + (Math.floor(i / n) + .5) * s, 24));
      [3, 4, 20].forEach(i => txt('✕', x0 + (i % n + .5) * s, y0 + (Math.floor(i / n) + .5) * s, 16, 'rgba(0,0,0,.4)'));
    },
    tango(w, h) {
      c.fillStyle = '#eef0f4'; c.fillRect(-w / 2, -h / 2, w, h);
      const n = 6, s = 38, x0 = -n * s / 2, y0 = -n * s / 2, V = '120120021012102102201201010212.21021';
      for (let i = 0; i < 36; i++) {
        const x = x0 + (i % n) * s, y = y0 + Math.floor(i / n) * s;
        c.fillStyle = '#fff'; rr(x + 2, y + 2, s - 4, s - 4, 6); c.fill();
        if (V[i] === '1') emo('☀️', x + s / 2, y + s / 2, 22); else if (V[i] === '2') emo('🌙', x + s / 2, y + s / 2, 22);
      }
      txt('=', x0 + 2 * s, y0 + 1.5 * s, 18, '#8a5a10'); txt('×', x0 + 4.5 * s, y0 + 3 * s, 18, '#8a5a10');
    },
    patches(w, h) {
      c.fillStyle = '#f6f4ef'; c.fillRect(-w / 2, -h / 2, w, h);
      const n = 6, s = 38, x0 = -n * s / 2, y0 = -n * s / 2, COL = ['#f4a58a', '#a9c8f0', '#c3e39a', '#f2d36b', '#d3b3ec', '#93d9d0', '#f2b6cf'];
      [[0, 0, 2, 3], [0, 3, 1, 3], [1, 3, 3, 1], [2, 0, 2, 2], [1, 4, 2, 2], [4, 0, 2, 4], [3, 4, 3, 2]].forEach(([r, k, hh, ww], j) => {
        c.fillStyle = COL[j]; rr(x0 + k * s + 2, y0 + r * s + 2, ww * s - 4, hh * s - 4, 6); c.fill();
        txt(String(hh * ww), x0 + (k + .5) * s, y0 + (r + .5) * s, 15, '#1a1a1a', 800);
      });
    },
    uno(w, h) {
      c.fillStyle = '#213846'; c.fillRect(-w / 2, -h / 2, w, h);
      const C = ['#d83a32', '#f0b81a', '#3aa050', '#2a6ad0', '#1a1a1a'], V = ['7', '+2', '3', '⇄', '★'];
      const card = (x, y, a, k) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#fff'; rr(-30, -44, 60, 88, 9); c.fill(); c.fillStyle = C[k]; rr(-26, -40, 52, 80, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, 0, 20, 32, .45, 0, TAU); c.fill(); txt(V[k], 0, 2, 22, k === 4 ? '#1a1a1a' : C[k], 800); c.restore(); };
      for (let i = 0; i < 5; i++) card(-100 + i * 50, 70, (i - 2) * .14, i);
      card(10, -50, .1, 0);
      c.fillStyle = '#1a1a1a'; rr(-110, -94, 60, 88, 9); c.fill(); txt('UNO', -80, -50, 16, '#ffd36a', 800);
    },
    puissance4(w, h) {
      c.fillStyle = '#1a2a40'; c.fillRect(-w / 2, -h / 2, w, h);
      c.fillStyle = '#2e62b8'; rr(-160, -112, 320, 228, 16); c.fill();
      const B = '00000000000000001000002210001212200122110'.split('');
      for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) {
        const v = B[r * 7 + k] || '0';
        c.fillStyle = v === '1' ? '#d8302a' : v === '2' ? '#f0c020' : '#0e1828';
        c.beginPath(); c.arc(-135 + k * 45, -88 + r * 36, 15, 0, TAU); c.fill();
      }
    },
  };
  const order = shuf(Object.keys(P), R);
  order.forEach((id, i) => {
    const row = Math.floor(i / 5), col = i % 5;
    const cx = 160 + col * 320 + (row ? 70 : -30) + (R() - .5) * 40, cy = 225 + row * 450 + (R() - .5) * 50;
    c.save(); c.translate(cx, cy); c.rotate((R() - .5) * .22);
    c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
    c.fillStyle = '#ede6d8'; rr(-W / 2 - 10, -H / 2 - 10, W + 20, H + 20, 18); c.fill();
    c.shadowColor = 'transparent';
    c.save(); rr(-W / 2, -H / 2, W, H, 12); c.clip(); P[id](W, H); c.restore();
    c.restore();
  });
  const bd = $('#backdrop'); bd.width = cv.width; bd.height = cv.height; bd.getContext('2d').drawImage(cv, 0, 0);
};
paintBackdrop();

/* ═══════════ Bêtisiers : mode veille et erreur 404 ═══════════ */
['#set-music', '#set-sfx'].forEach(s => $(s).addEventListener('change', () => { if (Save.d.music === 0 && Save.d.sfx === 0) Ach.unlock('egg_mute'); }));
let achTaps = [];
$('#s-ach .bar h2').addEventListener('click', () => {
  const now = Date.now(); achTaps = achTaps.filter(t => now - t < 2500).concat(now);
  if (achTaps.length < 4) return; achTaps = [];
  React.say('hint', 'Erreur 404 : succès introuvable… sauf celui-ci\u202f!', true); Ach.unlock('egg_404'); setTimeout(renderAch, 300);
});

/* ═══════════ Démarrage ═══════════ */
refreshMenu();
setTimeout(() => Ach.check(), 1200);
