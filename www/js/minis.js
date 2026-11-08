'use strict';
/* ═══════════ Alternance des jeux sur les 100 niveaux ═══════════ */
const GAME_ORDER = ['objets', 'mots', 'candy', 'pendu', 'zip', 'queens', 'uno', 'puissance4', 'tango', 'patches'];
// Jeu de secours si un jeu manquait (aucun pour l’instant)
const GAME_FALLBACK = {};
const GAME_INFO = {
  objets: { name: 'Objets cachés', win: 'Bravo Papa, tu as trouvé tous les objets\u202f!',
    rules: 'Retrouve dans la scène tous les objets de la liste. Touche un objet pour le trouver : il brille et son nom est barré. Pince l’écran ou utilise les loupes pour zoomer. Trois indices sont disponibles.' },
  mots: { name: 'Mots mêlés', win: 'Bravo Papa, tu as trouvé tous les mots mêlés\u202f!',
    rules: 'Retrouve dans la grille tous les mots de la liste. Glisse le doigt de la première à la dernière lettre d’un mot. Beaucoup de mots sont cachés en diagonale, et dans les niveaux avancés ils peuvent aussi être écrits à l’envers. Attention aux fausses pistes : des débuts de mots traînent un peu partout !' },
  pendu: { name: 'Pendu', win: 'Bravo Papa, tu as deviné tous les mots\u202f!',
    rules: 'Devine le mot caché en touchant les lettres du clavier. Chaque mauvaise lettre ajoute un morceau au dessin : au septième, la manche est perdue. Trouve tous les mots de la série pour gagner.' },
  puissance4: { name: 'Puissance 4', win: 'Bravo Papa, tu as aligné quatre jetons\u202f!',
    rules: 'Touche une colonne pour y faire tomber ton jeton rouge. Le premier qui aligne quatre jetons (en ligne, en colonne ou en diagonale) gagne. L’ordinateur joue les jetons jaunes et devient plus malin au fil des niveaux.' },
  candy: { name: 'Bonbons', win: 'Bravo Papa, tu as croqué tous les bonbons\u202f!', rules: 'Bientôt disponible.' },
  uno: { name: 'Uno', win: 'Bravo Papa, tu as battu l’ordinateur au Uno\u202f!', rules: 'Bientôt disponible.' },
};
function gameFor(n) {
  const g = GAME_ORDER[(n - 1) % GAME_ORDER.length];
  return MINIS[g] || g === 'objets' ? g : GAME_FALLBACK[g];
}
let roundOf = n => Math.floor((n - 1) / GAME_ORDER.length);        // 0 à 9 : passage dans ce jeu
let diffOf = n => roundOf(n) / 9;                                   // 0 → 1

/* ═══════════ Sac de papa : 100 objets ═══════════ */
const ANIMALS = [   // les 100 objets du Sac de papa : [emoji, objet, surnom]
  ['💻', 'Ordinateur portable', 'Le Nomade'], ['🖥️', 'Ordinateur de bureau', 'Grosse Tour'], ['⌨️', 'Clavier', 'Tape-Tape'], ['🖱️', 'Souris', 'Clic-Clac'], ['🖨️', 'Imprimante', 'Bourrage Papier'],
  ['💾', 'Disquette', '1,44 Mo'], ['💿', 'CD-ROM', 'Galette Brillante'], ['📀', 'DVD', 'Disque Doré'], ['💽', 'MiniDisc', 'Petit Disque'], ['📱', 'Smartphone', 'Toujours en Main'],
  ['📲', 'Synchronisation', 'Barre de Progression'], ['☎️', 'Téléphone fixe', 'Allô Mamie'], ['📟', 'Bipeur', 'Bip-Bip'], ['📠', 'Fax', 'Crrr-Piiiii'], ['🔋', 'Batterie', '1 % Restant'],
  ['🔌', 'Prise électrique', 'Toujours Branchée'], ['💡', 'Ampoule', 'Idée Lumineuse'], ['🔦', 'Lampe torche', 'Fouille-Câbles'], ['🕹️', 'Joystick', 'Manche à Balai'], ['🎮', 'Manette', 'Pouces Agiles'],
  ['👾', 'Envahisseur', 'Huit-Bits'], ['🤖', 'Robot', 'Bip-Boup'], ['👽', 'Extraterrestre', 'Petit Gris'], ['🛸', 'Soucoupe volante', 'Wi-Fi Galactique'], ['🚀', 'Fusée', 'Décollage Immédiat'],
  ['🛰️', 'Satellite', 'Œil du Ciel'], ['📡', 'Antenne parabolique', 'Capte-Tout'], ['🔭', 'Télescope', 'Chasseur d’Étoiles'], ['🔬', 'Microscope', 'Zoom ×1000'], ['🧪', 'Éprouvette', 'Formule Secrète'],
  ['🧬', 'ADN', 'Code Source du Vivant'], ['⚛️', 'Atome', 'Petit Costaud'], ['🧲', 'Aimant', 'Efface-Disque'], ['🔧', 'Clé à molette', 'Serre-Tout'], ['🔩', 'Boulon', 'Vis Sans Fin'],
  ['🪛', 'Tournevis', 'Démonte-PC'], ['⚙️', 'Engrenage', 'Rouage Malin'], ['🛠️', 'Boîte à outils', 'Bricolo'], ['🔨', 'Marteau', 'Dernier Recours'], ['⚡', 'Éclair', 'Surtension'],
  ['🔐', 'Coffre-fort numérique', 'Mot de Passe 1234'], ['🔑', 'Clé USB', 'Toujours Perdue'], ['🗝️', 'Clé de chiffrement', 'Crypto-Mystère'], ['🛡️', 'Antivirus', 'Garde du Corps'], ['🔥', 'Pare-feu', 'Pas de Passage'],
  ['🧯', 'Extincteur', 'Sauve-Serveur'], ['📷', 'Appareil photo', 'Clic-Souvenir'], ['📹', 'Caméscope', 'Film des Vacances'], ['🎥', 'Caméra', 'Silence, on Tourne'], ['📽️', 'Projecteur', 'Diaporama Infini'],
  ['📺', 'Télévision', 'Zappeuse'], ['📻', 'Radio', 'Grésillements'], ['🎧', 'Casque audio', 'Bulle de Son'], ['🎙️', 'Micro de studio', 'Podcasteur'], ['🔊', 'Enceinte', 'Boum-Boum'],
  ['📼', 'Cassette VHS', 'Rembobine-Moi'], ['🎛️', 'Table de mixage', 'DJ Papa'], ['🎹', 'Clavier MIDI', 'Do Ré Mi'], ['⌚', 'Montre connectée', 'Compte-Pas'], ['⏱️', 'Chronomètre', 'Speedrun'],
  ['⏳', 'Sablier', 'Chargement en Cours'], ['⏰', 'Réveil', 'Snooze Infini'], ['🌐', 'Internet', 'Toile Mondiale'], ['📶', 'Wi-Fi', 'Une Seule Barre'], ['☁️', 'Cloud', 'Stockage Nuageux'],
  ['🔗', 'Lien hypertexte', 'Clique-Moi'], ['📧', 'E-mail', 'Boîte Pleine'], ['💬', 'Messagerie', 'Vu à 23 h 42'], ['🔔', 'Notification', 'Ding-Dong'], ['🔍', 'Moteur de recherche', 'Trouve-Tout'],
  ['📁', 'Dossier', 'Nouveau Dossier (2)'], ['🗑️', 'Corbeille', 'Vider Plus Tard'], ['📋', 'Presse-papiers', 'Ctrl+V'], ['✂️', 'Couper-coller', 'Ctrl+X'], ['📎', 'Trombone', 'Assistant Agaçant'],
  ['📊', 'Tableur', 'Formule Magique'], ['📈', 'Graphique', 'Courbe Qui Monte'], ['💳', 'Carte bancaire', 'Sans Contact'], ['🪙', 'Bitcoin', 'Crypto-Pièce'], ['🧮', 'Boulier', 'Ancêtre de l’Ordi'],
  ['🖲️', 'Trackball', 'Boule Magique'], ['🎲', 'Dé à vingt faces', 'Coup Critique'], ['♟️', 'Échiquier', 'Échec et Mat'], ['🃏', 'Carte à collectionner', 'Joker Rare'], ['🧩', 'Puzzle', 'Pièce Manquante'],
  ['🧙', 'Magicien du code', 'Maître Merlin'], ['🦸', 'Super-héros', 'Cape au Vent'], ['🗡️', 'Épée laser', 'Que la Force'], ['🔮', 'Boule de cristal', 'Prévision Météo'], ['🪄', 'Baguette magique', 'Abracadabra'],
  ['🥽', 'Casque de réalité virtuelle', 'Monde Parallèle'], ['🤓', 'Intello', 'Lunettes Scotchées'], ['☕', 'Café du codeur', 'Carburant'], ['🍕', 'Pizza de la LAN', 'Quatre Fromages'], ['🥤', 'Boisson énergisante', 'Nuit Blanche'],
  ['📦', 'Colis', 'Livré Demain'], ['🧭', 'GPS', 'Recalcul en Cours'], ['📍', 'Géolocalisation', 'Vous Êtes Ici'], ['🚁', 'Drone', 'Vue d’en Haut'], ['🛴', 'Trottinette électrique', 'Zéro Émission']
];
// Objets exclusifs, gagnés seulement avec les séries du défi du jour
const BONUS = [
  ['🎒', 'Sac de papa', 'Le Légendaire'], ['🐛', 'Bug originel', 'Patient Zéro'], ['🧑‍💻', 'Développeur', 'Hello World'], ['🦾', 'Bras robotique', 'Poigne d’Acier'],
  ['🦿', 'Jambe bionique', 'Pas de Géant'], ['🧠', 'Intelligence artificielle', 'Cerveau Numérique'], ['🪐', 'Planète inconnue', 'Erreur 404'], ['🧑‍🚀', 'Astronaute', 'Premier Pas'],
  ['💣', 'Bombe logique', 'Ne Pas Toucher'], ['🏆', 'Trophée platine', '100 % Complété'], ['🗺️', 'Carte au trésor', 'Easter Egg'], ['💎', 'Gemme rare', 'Loot Légendaire']
];
function drawBonus() {
  const dx = dexInit(); dx.bonus = dx.bonus || {};
  const missing = BONUS.map((_, i) => i).filter(i => !dx.bonus[i]);
  if (!missing.length) return -1;
  const b = missing[Math.floor(Math.random() * missing.length)];
  dx.bonus[b] = Date.now(); Save.write(); return b;
}
function bonusCard(i, big) {
  const [e, sp, name] = BONUS[i];
  return `<div class="acard tb${big ? ' ' + (big === true ? 'big' : big) : ''}" data-b="${i}"><span class="aemo">${e}</span><span class="aname">${name}</span><span class="aspec">${sp}</span><span class="atier">Bonus défi</span></div>`;
}
const TIERS = [
  { id: 'normal', name: 'Normal', weight: 60 },
  { id: 'rare', name: 'Rare', weight: 27 },
  { id: 'trare', name: 'Très rare', weight: 10 },
  { id: 'shiny', name: 'Shiny', weight: 3 },
];
// Noms des 25 Shiny, attribués dans l’ordre où ils sont obtenus
const SHINY_NAMES = [
  { n: 'Nicolas' }, { n: 'Clément' }, { n: 'Patrick' }, { n: 'Maman' }, { n: 'Mamie Marcelle' },
  { n: 'Mamie Paulette' }, { n: 'Gérard' }, { n: 'Liloo' }, { n: 'Gilbert' },
  { pre: 'Super', n: 'Nicolas' }, { n: 'Gilbert', adj: ['rapide', 'rapide'] }, { n: 'Clément', adj: ['fainéant', 'fainéante'] },
  { n: 'Patrick', adj: ['informaticien', 'informaticienne'] }, { pre: 'Capitaine', n: 'Maman' }, { n: 'Mamie Marcelle', adj: ['gourmand', 'gourmande'] },
  { n: 'Mamie Paulette', adj: ['farceur', 'farceuse'] }, { n: 'Gérard', adj: ['intrépide', 'intrépide'] }, { pre: 'Princesse', n: 'Liloo' },
  { n: 'Gilbert', adj: ['magnifique', 'magnifique'] }, { n: 'Nicolas', adj: ['bavard', 'bavarde'] }, { pre: 'Professeur', n: 'Clément' },
  { n: 'Patrick', adj: ['bricoleur', 'bricoleuse'] }, { n: 'Maman', adj: ['détective', 'détective'] }, { n: 'Gérard', adj: ['farfelu', 'farfelue'] },
  { n: 'Liloo', adj: ['espiègle', 'espiègle'] },
];
const PERSON_FEM = new Set(['Maman', 'Mamie Marcelle', 'Mamie Paulette', 'Liloo']);
const TITLE_DE = { Capitaine: 'du Capitaine ', Professeur: 'du Professeur ', Princesse: 'de la Princesse ', Super: 'de Super ' };
const FEMININE = new Set(['Souris', 'Imprimante', 'Disquette', 'Synchronisation', 'Batterie', 'Prise électrique', 'Ampoule', 'Lampe torche', 'Manette', 'Soucoupe volante', 'Fusée', 'Antenne parabolique', 'Éprouvette', 'Clé à molette', 'Boîte à outils', 'Clé USB', 'Clé de chiffrement', 'Caméra', 'Télévision', 'Radio', 'Enceinte', 'Cassette VHS', 'Table de mixage', 'Montre connectée', 'Messagerie', 'Notification', 'Corbeille', 'Carte bancaire', 'Carte à collectionner', 'Épée laser', 'Boule de cristal', 'Baguette magique', 'Pizza de la LAN', 'Boisson énergisante', 'Géolocalisation', 'Trottinette électrique']);
const ELISION = new Set(['Ampoule', 'Envahisseur', 'Extraterrestre', 'Antenne parabolique', 'Éprouvette', 'ADN', 'Atome', 'Aimant', 'Engrenage', 'Éclair', 'Antivirus', 'Extincteur', 'Appareil photo', 'Enceinte', 'Internet', 'E-mail', 'Échiquier', 'Épée laser', 'Intello', 'Ordinateur portable', 'Ordinateur de bureau']);
function animalName(i) {
  const dx = Save.d.dex, base = ANIMALS[i][1];
  if (!dx || dx.tier[i] !== 3) return ANIMALS[i][2];
  const order = (dx.shinyOrder || []).concat(ANIMALS.map((_, j) => j).filter(j => dx.tier[j] === 3 && !(dx.shinyOrder || []).includes(j)));
  const k = order.indexOf(i);
  if (k < 0) return base;
  // « L’objet de Prénom » : l’article suit l’objet, le titre et l’adjectif suivent la personne
  const s = SHINY_NAMES[k % SHINY_NAMES.length], fem = FEMININE.has(base), pf = PERSON_FEM.has(s.n);
  const art = ELISION.has(base) ? 'L’' : fem ? 'La ' : 'Le ';
  const who = (s.pre ? (TITLE_DE[s.pre] || 'de ' + s.pre + ' ') : 'de ') + s.n + (s.adj ? (/^[aeiouyéèêîh]/i.test(s.adj[pf ? 1 : 0]) ? ' l’' : pf ? ' la ' : ' le ') + s.adj[pf ? 1 : 0] : '');
  return art + base + ' ' + who;
}
// Rareté de chaque objet : tirée au sort une fois pour toutes, différente pour chaque joueur
function dexInit() {
  if (!Save.d.dex) Save.d.dex = {};
  const dx = Save.d.dex;
  if (!dx.tier || dx.tier.length !== ANIMALS.length) {
    const idx = ANIMALS.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    dx.tier = []; idx.forEach((a, k) => { dx.tier[a] = Math.floor(k / 25); });
    dx.hue = ANIMALS.map(() => Math.floor(60 + Math.random() * 240));
  }
  if (!dx.got) dx.got = {};
  if (!dx.byLevel) dx.byLevel = {};
  if (!dx.shinyOrder) dx.shinyOrder = [];
  Object.keys(dx.got).map(Number).filter(i => dx.tier[i] === 3 && !dx.shinyOrder.includes(i))
    .sort((a, b) => dx.got[a] - dx.got[b]).forEach(i => dx.shinyOrder.push(i));
  Save.write();
  return dx;
}
// Toujours un nouvel objet : d'abord la rareté (tirée au sort), puis l'objet parmi ceux qui manquent
function drawAnimal() {
  const dx = dexInit();
  const missing = ANIMALS.map((_, i) => i).filter(i => dx.got[i] === undefined);
  if (!missing.length) return -1;
  const tiers = TIERS.map((t, k) => ({ k, w: t.weight, list: missing.filter(i => dx.tier[i] === k) })).filter(t => t.list.length);
  let r = Math.random() * tiers.reduce((s, t) => s + t.w, 0), pick = tiers[0];
  for (const t of tiers) { if (r < t.w) { pick = t; break; } r -= t.w; }
  const a = pick.list[Math.floor(Math.random() * pick.list.length)];
  dx.got[a] = Date.now();
  if (dx.tier[a] === 3 && !dx.shinyOrder.includes(a)) dx.shinyOrder.push(a);
  Save.write();
  return a;
}
function animalCard(i, big) {
  const dx = Save.d.dex, t = dx.tier[i], e = ANIMALS[i][0], name = animalName(i);
  const style = t === 3 ? ` style="--hue:${dx.hue[i]}deg"` : '';
  const species = t === 3 ? '' : `<span class="aspec">${ANIMALS[i][1]}</span>`;
  return `<div class="acard t${t}${big ? ' ' + (big === true ? 'big' : big) : ''}"${style} data-a="${i}"><span class="aemo">${e}</span><span class="aname">${name}</span>${species}<span class="atier">${TIERS[t].name}</span></div>`;
}
function renderDex() {
  const dx = dexInit(), box = $('#dex-grid'); box.innerHTML = '';
  const total = Object.keys(dx.got).length;
  $('#dex-count').textContent = total + '/100';
  $('#dex-tiers').innerHTML = TIERS.map((t, k) => {
    const have = ANIMALS.filter((_, i) => dx.tier[i] === k && dx.got[i] !== undefined).length;
    return `<span class="dt t${k}">${t.name}\u00a0: ${have}/25</span>`;
  }).join('');
  ANIMALS.forEach((a, i) => {
    const cell = document.createElement('div'), have = dx.got[i] !== undefined;
    cell.className = 'dcell' + (!have && dexAll ? ' preview' : '') + (have && dx.tier[i] === 3 ? ' shiny' : '');
    const num = '#' + String(i + 1).padStart(3, '0');
    cell.innerHTML = have || dexAll ? animalCard(i) + `<span class="dnum">${num}</span>` + (have ? '' : '<span class="dmiss">À trouver</span>') : `<div class="acard unknown"><span class="aemo">?</span><span class="aname">${num}</span></div>`;
    box.appendChild(cell);
  });
  // Section des objets bonus du défi du jour : cases mystère rouges
  const dxb = dx.bonus || {}, nb = Object.keys(dxb).length;
  const head = document.createElement('div'); head.className = 'dex-sep';
  head.innerHTML = `<h3>Objets bonus des défis</h3><span>${nb}/${BONUS.length} · un objet exclusif tous les 3 jours de défi d’affilée</span>`;
  box.appendChild(head);
  BONUS.forEach((b, i) => {
    const cell = document.createElement('div'); cell.className = 'dcell';
    cell.innerHTML = dxb[i] ? bonusCard(i) + `<span class="dnum">B${String(i + 1).padStart(2, '0')}</span>` : `<div class="acard mystery"><span class="aemo">?</span><span class="aname">B${String(i + 1).padStart(2, '0')}</span></div>`;
    box.appendChild(cell);
  });
}
const dexAll = false;
// Toucher une carte du Sac de papa l’agrandit
$('#dex-grid').addEventListener('click', e => {
  const c = e.target.closest('.acard[data-a], .acard[data-b]'); if (!c) return;
  const isB = c.dataset.b !== undefined, i = +(isB ? c.dataset.b : c.dataset.a), got = isB ? Save.d.dex.bonus[i] : Save.d.dex.got[i];
  Sound.tap();
  $('#zoom-card').innerHTML = (isB ? bonusCard(i, 'zoom') : animalCard(i, 'zoom')) + `<p class="zoom-info">${isB ? 'B' + String(i + 1).padStart(2, '0') : '#' + String(i + 1).padStart(3, '0')} · obtenu le ${new Date(got).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`;
  $('#m-card').classList.add('on');
});
$('#m-card').addEventListener('click', () => { Sound.tap(); $('#m-card').classList.remove('on'); });

/* ═══════════ Hôte des mini-jeux ═══════════ */
let mini = null;
const MiniHost = {
  start(n) {
    this.stop();
    const id = gameFor(n), G = MINIS[id], root = $('#mini-root');
    root.innerHTML = ''; root.className = 'mini mini-' + id;
    $('#x-level').textContent = 'Niveau ' + n;
    $('#x-name').textContent = GAME_INFO[id].name;
    $('#x-stat1').textContent = ''; $('#x-stat2').textContent = '0:00';
    mini = { n, id, G, elapsed: 0, done: false, paused: false, R: mulberry32(n * 9301 + Date.now() % 1000) };
    const api = {
      root, n, d: diffOf(n), round: roundOf(n), R: mini.R,
      stat: t => { $('#x-stat1').textContent = t; },
      tip: (t, w) => tip(t, w),
      win: (stars, stats) => { if (mini.done) return; mini.done = true; setTimeout(() => showVictory({ n, game: id, stars, stats: [{ label: 'Temps', value: fmt(mini.elapsed) }].concat(stats || []) }), 700); },
      lose: (title, text) => { if (mini.done) return; mini.done = true; setTimeout(() => showLose(title, text), 700); },
    };
    show('s-mini');
    Sound.play(['calm', 'bright', 'dreamy', 'mystery'][n % 4]);
    G.start(api);
    maybeShowRules(id);
  },
  stop() { if (mini && mini.G.stop) mini.G.stop(); mini = null; },
};
setInterval(() => {
  if (mini && !mini.done && !paused && current === 's-mini' && !document.hidden) { mini.elapsed += .25; $('#x-stat2').textContent = fmt(mini.elapsed); }
}, 250);

/* ═══════════ Règles ═══════════ */
function showRules(id) {
  $('#rules-title').textContent = GAME_INFO[id].name;
  $('#rules-text').textContent = GAME_INFO[id].rules;
  $('#m-rules').classList.add('on'); paused = true;
}
function maybeShowRules(id) {
  Save.d.seenRules = Save.d.seenRules || {};
  if (!Save.d.seenRules[id]) { Save.d.seenRules[id] = 1; Save.write(); setTimeout(() => showRules(id), 400); }
}
$('#rules-ok').addEventListener('click', () => { Sound.tap(); $('#m-rules').classList.remove('on'); paused = false; dirty = true; });
$('#x-rules').addEventListener('click', () => { Sound.tap(); showRules(mini ? mini.id : 'objets'); });
$('#g-rules').addEventListener('click', () => { Sound.tap(); showRules('objets'); });
$('#x-pause').addEventListener('click', () => { Sound.tap(); if (mini && !mini.done) { paused = true; $('#m-pause').classList.add('on'); } });

/* ═══════════ Défaite ═══════════ */
function showLose(title, text) {
  Sound.wrong();
  $('#lose-title').textContent = title; $('#lose-text').textContent = text;
  $('#m-lose').classList.add('on');
}
$('#lose-retry').addEventListener('click', () => { Sound.tap(); $('#m-lose').classList.remove('on'); startLevel(curLevel); });
$('#lose-quit').addEventListener('click', () => { Sound.tap(); $('#m-lose').classList.remove('on'); leaveGame(); });

/* ═══════════ Les mini-jeux ═══════════ */
const MINIS = {};
const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const WORDS = {
  court: ['CLAVIER', 'SOURIS', 'ECRAN', 'PIXEL', 'ROBOT', 'CODE', 'PUCE', 'WIFI', 'MODEM', 'LASER', 'DRONE', 'CABLE', 'OCTET', 'FICHIER', 'DOSSIER', 'PILOTE', 'CLOUD', 'EMAIL', 'ICONE', 'MENU', 'ONGLET', 'CURSEUR', 'MANETTE', 'CONSOLE', 'AVATAR', 'NIVEAU', 'SCORE', 'ARCADE', 'GEEK', 'PIZZA', 'PRISE', 'FUSEE', 'ALIEN', 'CAMERA', 'CASQUE', 'RESEAU', 'ROUTEUR', 'PAREFEU', 'BINAIRE', 'SERVEUR', 'BOUTON', 'ZOOM', 'BUGS', 'VIRUS', 'PIRATE', 'LOGO', 'SITE', 'BLOG', 'CHAT', 'LIEN'],
  long: ['ORDINATEUR', 'PROCESSEUR', 'IMPRIMANTE', 'ALGORITHME', 'PROGRAMME', 'LOGICIEL', 'MATERIEL', 'INTERNET', 'NAVIGATEUR', 'SAUVEGARDE', 'DISQUETTE', 'SMARTPHONE', 'JOYSTICK', 'ANTIVIRUS', 'ROBOTIQUE', 'ELECTRONIQUE', 'MICROPUCE', 'TELESCOPE', 'ASTRONAUTE', 'MULTIJOUEUR', 'DEVELOPPEUR', 'INFORMATIQUE', 'CYBERESPACE', 'BLUETOOTH', 'CHARGEUR', 'BATTERIE', 'RACCOURCI', 'CORBEILLE', 'TELECHARGER', 'TABLETTE', 'CLIGNOTER', 'PERIPHERIQUE', 'MOTDEPASSE', 'HOLOGRAMME', 'SATELLITE'],
};
const HANG_WORDS = ['ordinateur', 'clavier', 'souris', 'écran', 'processeur', 'logiciel', 'imprimante', 'internet', 'disquette', 'manette', 'console', 'pixel', 'robot', 'satellite', 'télécharger', 'sauvegarde', 'mot de passe', 'navigateur', 'algorithme', 'programme', 'serveur', 'routeur', 'câble', 'batterie', 'chargeur', 'tablette', 'smartphone', 'casque', 'micro', 'webcam', 'antivirus', 'pare-feu', 'corbeille', 'raccourci', 'curseur', 'fichier', 'dossier', 'octet', 'binaire', 'réseau', 'wifi', 'bluetooth', 'électronique', 'informatique', 'développeur', 'multijoueur', 'joystick', 'arcade', 'avatar', 'niveau', 'sauvegarder', 'cyberespace', 'fusée', 'astronaute', 'hologramme', 'pizza', 'geek', 'émoji', 'clé usb', 'carte mère', 'téléphone', 'calculatrice', 'télécommande', 'imprimer', 'redémarrer'];

/* ——— Mots mêlés ——— */
MINIS.mots = {
  start(api) {
    const R = api.R, d = api.d, size = 10 + Math.round(d * 4), nWords = 8 + Math.round(d * 6);
    // diagonales dès le début ; mots à l’envers ensuite, puis dans tous les sens
    const DIAG = [[1, 1], [1, -1]], STRAIGHT = [[1, 0], [0, 1]];
    if (d > .3) { STRAIGHT.push([-1, 0], [0, -1]); }
    if (d > .55) { DIAG.push([-1, -1], [-1, 1]); }
    const pool = WORDS.court.concat(WORDS.long).map(w => w.replace('-', '')).filter(w => w.length >= 4 && w.length <= size);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const words = [];
    const fits = (w, x0, y0, dx, dy) => {
      const x1 = x0 + dx * (w.length - 1), y1 = y0 + dy * (w.length - 1);
      if (x1 < 0 || y1 < 0 || x1 >= size || y1 >= size) return -1;
      let cross = 0; for (let k = 0; k < w.length; k++) { const c = grid[y0 + dy * k][x0 + dx * k]; if (c && c !== w[k]) return -1; if (c) cross++; }
      return cross;
    };
    let diagCount = 0;
    for (const w of pool.slice(0, 60).sort((a, b) => b.length - a.length)) {
      if (words.length >= nWords) break;
      // au moins la moitié des mots en diagonale
      const wantDiag = diagCount < Math.ceil((words.length + 1) * (.5 + d * .2));
      const dirs = wantDiag ? DIAG : STRAIGHT.concat(DIAG);
      let best = null;
      for (let t = 0; t < 260; t++) {
        const [dx, dy] = dirs[Math.floor(R() * dirs.length)], x0 = Math.floor(R() * size), y0 = Math.floor(R() * size);
        const cross = fits(w, x0, y0, dx, dy); if (cross < 0 || cross === w.length) continue;
        // on préfère les mots qui se croisent : la grille devient plus dense et plus piégeuse
        const score = cross * 3 + R();
        if (!best || score > best.score) best = { x0, y0, dx, dy, score };
      }
      if (!best) continue;
      for (let k = 0; k < w.length; k++) grid[best.y0 + best.dy * k][best.x0 + best.dx * k] = w[k];
      if (best.dx && best.dy) diagCount++;
      words.push({ w, found: false });
    }
    // fausses pistes : des débuts de mots semés dans la grille
    const decoys = Math.round(3 + d * 7), ALL = STRAIGHT.concat(DIAG, [[-1, 0], [0, -1], [-1, -1], [-1, 1]]);
    for (let n = 0; n < decoys; n++) {
      const src = words[Math.floor(R() * words.length)].w, frag = src.slice(0, 3 + Math.floor(R() * Math.max(1, src.length - 4)));
      for (let t = 0; t < 80; t++) {
        const [dx, dy] = ALL[Math.floor(R() * ALL.length)], x0 = Math.floor(R() * size), y0 = Math.floor(R() * size);
        const cross = fits(frag, x0, y0, dx, dy); if (cross < 0) continue;
        for (let k = 0; k < frag.length; k++) grid[y0 + dy * k][x0 + dx * k] = frag[k]; break;
      }
    }
    // lettres de remplissage tirées des mots cachés : plus difficile à repérer
    const L = words.map(o => o.w).join('') + 'EEAASSIINNTTRRUULLOO';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!grid[y][x]) grid[y][x] = L[Math.floor(R() * L.length)];
    words.sort((a, b) => a.w.localeCompare(b.w));
    api.root.innerHTML = `<div class="ws-wrap"><div class="ws-grid" style="--n:${size}"></div><ul class="ws-list"></ul></div>`;
    const G = api.root.querySelector('.ws-grid'), UL = api.root.querySelector('.ws-list');
    const cells = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const c = document.createElement('div'); c.className = 'ws-cell'; c.textContent = grid[y][x]; c.dataset.x = x; c.dataset.y = y; G.appendChild(c); cells.push(c); }
    words.forEach(o => { const li = document.createElement('li'); li.className = 'word'; li.textContent = o.w; o.el = li; UL.appendChild(li); });
    const COLORS = ['#e8a33a', '#5ab0a0', '#d86a8a', '#7a8ad8', '#9ac04a', '#d8784a', '#4aa0d8', '#b07ad8', '#d8c04a', '#4ac08a', '#e06060', '#60c0e0'];
    let sel = null, fcount = 0, miss = 0;
    const cellAt = (cx, cy) => { const el = document.elementFromPoint(cx, cy); return el && el.classList.contains('ws-cell') ? el : null; };
    const line = (a, b) => {
      const x0 = +a.dataset.x, y0 = +a.dataset.y, x1 = +b.dataset.x, y1 = +b.dataset.y, dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      const len = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      if (!(x0 === x1 || y0 === y1 || Math.abs(x1 - x0) === Math.abs(y1 - y0))) return null;
      const out = []; for (let k = 0; k <= len; k++) out.push(cells[(y0 + dy * k) * size + x0 + dx * k]); return out;
    };
    const paint = list => { cells.forEach(c => c.classList.remove('sel')); (list || []).forEach(c => c.classList.add('sel')); };
    G.addEventListener('pointerdown', e => { const c = cellAt(e.clientX, e.clientY); if (!c) return; G.setPointerCapture(e.pointerId); sel = { a: c, list: [c] }; paint(sel.list); });
    G.addEventListener('pointermove', e => { if (!sel) return; const c = cellAt(e.clientX, e.clientY); if (!c) return; const l = line(sel.a, c); if (l) { sel.list = l; paint(l); } });
    const end = () => {
      if (!sel) return;
      const s = sel.list.map(c => c.textContent).join(''), r = s.split('').reverse().join('');
      const hit = words.find(o => !o.found && (o.w === s || o.w === r));
      if (hit && sel.list.length > 1) {
        hit.found = true; const col = COLORS[fcount % COLORS.length]; fcount++;
        sel.list.forEach(c => { c.classList.add('hit'); c.style.setProperty('--hc', col); });
        hit.el.classList.add('found', 'flash'); Sound.found();
        api.stat(`${fcount}/${words.length} mots`);
        if (fcount === words.length) { Sound.complete(); api.win(miss <= 2 ? 3 : miss <= 6 ? 2 : 1, [{ label: 'Mots', value: words.length }, { label: 'Erreurs', value: miss }]); }
      } else if (sel.list.length > 1) { miss++; Sound.wrong(); }
      sel = null; paint(null);
    };
    G.addEventListener('pointerup', end); G.addEventListener('pointercancel', end);
    api.stat(`0/${words.length} mots`);
  },
};

/* ——— Pendu ——— */
MINIS.pendu = {
  start(api) {
    const R = api.R, d = api.d, count = 3 + Math.round(d * 2);
    const pool = HANG_WORDS.slice().filter(w => (d < .3 ? w.length <= 8 : d < .7 ? w.length >= 6 : w.length >= 8));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const series = pool.slice(0, count);
    let idx = 0, errs = 0, totalErr = 0, guessed = new Set();
    api.root.innerHTML = `<div class="hm-wrap">
      <svg class="hm-draw" viewBox="0 0 420 520" aria-hidden="true">
        <defs><linearGradient id="hmW" x1="0" x2="1"><stop offset="0" stop-color="#b8804a"/><stop offset="1" stop-color="#8a5a30"/></linearGradient>
        <linearGradient id="hmW2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8a060"/><stop offset="1" stop-color="#a06a38"/></linearGradient></defs>
        <path d="M33 376h22v115h-22z" fill="#8a5a30"/><path d="M55 376l8 -4v115l-8 4z" fill="#6a4020"/><path d="M189 451h22v115h-22z" fill="#8a5a30"/><path d="M211 451l8 -4v115l-8 4z" fill="#6a4020"/><path d="M355 371h22v115h-22z" fill="#8a5a30"/><path d="M377 371l8 -4v115l-8 4z" fill="#6a4020"/><path d="M44 438L200 513L366 433" stroke="#7a4c26" stroke-width="12" fill="none" stroke-linejoin="round"/>
        <polygon points="30,350 200,425 200,451 30,376" fill="#c88a4a"/><polygon points="200,425 380,345 380,371 200,451" fill="#a06a38"/><polygon points="30,350 210,270 380,345 200,425" fill="#f0b878"/>
        <g stroke="rgba(120,70,30,.45)" stroke-width="2"><path d="M72 369L252 289"/><path d="M115 388L295 308"/><path d="M158 406L338 326"/></g><g fill="#5a3a24"><circle cx="68" cy="351" r="2.4"/><circle cx="140" cy="319" r="2.4"/><circle cx="212" cy="287" r="2.4"/><circle cx="111" cy="370" r="2.4"/><circle cx="183" cy="338" r="2.4"/><circle cx="255" cy="306" r="2.4"/><circle cx="153" cy="388" r="2.4"/><circle cx="225" cy="356" r="2.4"/><circle cx="297" cy="324" r="2.4"/><circle cx="196" cy="407" r="2.4"/><circle cx="268" cy="375" r="2.4"/><circle cx="340" cy="343" r="2.4"/></g>
        <g class="hm-p"><path d="M247 311V22h26V311z" fill="url(#hmW)"/><path d="M273 22l9 -5V306l-9 5z" fill="#6a4020"/><path d="M230 317l30 -12l40 14l-30 12z" fill="#7a4c26"/></g><g class="hm-p"><path d="M270 24L158 78l0 22L270 46z" fill="url(#hmW2)"/><path d="M270 24l10 -6L168 72l-10 6z" fill="#e8b878"/></g><g class="hm-p"><path d="M254 142L176 86l10 -12L266 128z" fill="#a06a38"/></g>
        <g class="hm-char" style="transform-origin:180px 96px">
          <path class="hm-p" d="M180 96V149" stroke="#d8c08a" stroke-width="5" stroke-linecap="round"/>
          <ellipse class="hm-shadow" cx="170" cy="363" rx="44" ry="12" fill="rgba(0,0,0,.25)"/>
          <g class="hm-body">
            <path d="M150 316h15v37h-15z M174 316h15v37h-15z" fill="#e2ad88"/>
            <path d="M144 347h24v12h-24z M170 347h24v12h-24z" fill="#3a3c40"/><path d="M144 355h24v4h-24z M170 355h24v4h-24z" fill="#d9442b"/>
            <image href="" x="135" y="150" width="101" height="175"/>
            <g class="hm-p"><path d="M164 162q2-14 17-14q14 0 16 14z" fill="#2f55b5"/><path d="M162 160h40l-4 5h-36z" fill="#1d3a85"/><circle cx="180" cy="149" r="4" fill="none" stroke="#c8ccd4" stroke-width="3"/></g>
            <g class="hm-p hm-sweat"><path d="M206 168q5 9 0 12q-5-3 0-12z" fill="#7ac0f0"/><path d="M156 176q4 7 0 10q-4-3 0-10z" fill="#7ac0f0"/></g>
            <g class="hm-p hm-oh"><text x="208" y="160" font-size="28" font-weight="800" fill="#fff" stroke="#3a2416" stroke-width="1" paint-order="stroke">!!</text></g>
          </g>
        </g>
      </svg>
      <div class="hm-main"><p class="hm-step"></p><div class="hm-word"></div><div class="hm-keys"></div></div></div>`;
    const POUP_SRC = $('#d-poup').getAttribute('src');
    api.root.querySelector('.hm-draw image').setAttribute('href', POUP_SRC);
    const parts = api.root.querySelectorAll('.hm-p'), charEl = api.root.querySelector('.hm-char'), wordEl = api.root.querySelector('.hm-word'), keys = api.root.querySelector('.hm-keys'), step = api.root.querySelector('.hm-step');
    const rows = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];
    rows.forEach(r => { const row = document.createElement('div'); row.className = 'hm-row'; r.split('').forEach(ch => { const b = document.createElement('button'); b.className = 'hm-key'; b.textContent = ch; b.addEventListener('click', () => guess(ch, b)); row.appendChild(b); }); keys.appendChild(row); });
    const render = () => {
      const w = series[idx];
      wordEl.innerHTML = w.split('').map(ch => { const b = strip(ch); if (!/[A-Z]/.test(b)) return `<span class="hm-sep">${ch}</span>`; return `<span class="hm-l">${guessed.has(b) ? ch.toUpperCase() : ''}</span>`; }).join('');
      parts.forEach((p, k) => p.classList.toggle('on', k < errs));
      charEl.classList.toggle('swing', errs >= 5); charEl.classList.toggle('lift', errs >= 7);
      step.textContent = `Mot ${idx + 1} sur ${series.length}`;
      api.stat(`${7 - errs} essais`);
    };
    const nextWord = () => { idx++; errs = 0; guessed = new Set(); keys.querySelectorAll('.hm-key').forEach(k => { k.disabled = false; k.className = 'hm-key'; }); render(); };
    function guess(ch, btn) {
      if (btn.disabled || errs >= 7) return;
      btn.disabled = true; guessed.add(ch);
      const w = strip(series[idx]);
      if (w.includes(ch)) { btn.classList.add('ok'); Sound.tap(); }
      else { btn.classList.add('ko'); errs++; totalErr++; Sound.wrong(); }
      render();
      const done = w.split('').every(c => !/[A-Z]/.test(c) || guessed.has(c));
      if (done) {
        Sound.found(); wordEl.classList.add('win'); charEl.classList.remove('joy'); void charEl.getBBox(); charEl.classList.add('joy');
        setTimeout(() => { wordEl.classList.remove('win'); if (idx + 1 < series.length) nextWord(); else { Sound.complete(); api.win(totalErr <= 3 ? 3 : totalErr <= 8 ? 2 : 1, [{ label: 'Mots', value: series.length }, { label: 'Erreurs', value: totalErr }]); } }, 900);
      } else if (errs >= 7) { api.lose('Perdu, le dessin est complet', `Le mot était « ${series[idx]} ». Retente ta chance !`); }
    }
    render();
  },
};

/* ——— Puissance 4 ——— */
MINIS.puissance4 = {
  start(api) {
    const C = 7, Rw = 6, d = api.d, depth = 1 + Math.round(d * 5), blunder = .35 * (1 - d);
    const B = Array.from({ length: Rw }, () => Array(C).fill(0));
    api.root.innerHTML = `<div class="c4-wrap"><div class="c4-turn"></div><div class="c4-board"></div></div>`;
    const board = api.root.querySelector('.c4-board'), turnEl = api.root.querySelector('.c4-turn');
    const cells = [];
    for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) { const el = document.createElement('div'); el.className = 'c4-cell'; el.dataset.c = c; board.appendChild(el); cells.push(el); }
    let busy = false, moves = 0, over = false;
    const free = c => { for (let r = Rw - 1; r >= 0; r--) if (!B[r][c]) return r; return -1; };
    const winner = b => {
      const L = [[1, 0], [0, 1], [1, 1], [1, -1]];
      for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) { const p = b[r][c]; if (!p) continue;
        for (const [dc, dr] of L) { let k = 1; while (k < 4) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= Rw || cc >= C || cc < 0 || b[rr][cc] !== p) break; k++; } if (k === 4) return p; } }
      return 0;
    };
    const scoreWin = (w, p) => { const me = w.filter(x => x === p).length, op = w.filter(x => x === 3 - p).length, em = w.filter(x => !x).length;
      if (me === 4) return 1000; if (me === 3 && em === 1) return 6; if (me === 2 && em === 2) return 2; if (op === 3 && em === 1) return -5; return 0; };
    const evalB = (b, p) => {
      let s = 0; for (let r = 0; r < Rw; r++) if (b[r][3] === p) s += 3;
      for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const w = []; for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= Rw || cc >= C) break; w.push(b[rr][cc]); }
        if (w.length === 4) s += scoreWin(w, p);
      }
      return s;
    };
    const valid = b => [3, 2, 4, 1, 5, 0, 6].filter(c => !b[0][c]);
    const drop = (b, c, p) => { for (let r = Rw - 1; r >= 0; r--) if (!b[r][c]) { b[r][c] = p; return r; } return -1; };
    const minimax = (b, dep, a, be, max) => {
      const w = winner(b); if (w === 2) return [null, 100000 + dep]; if (w === 1) return [null, -100000 - dep];
      const v = valid(b); if (!v.length) return [null, 0]; if (dep === 0) return [null, evalB(b, 2) - evalB(b, 1)];
      let best = v[0], val = max ? -Infinity : Infinity;
      for (const c of v) { const r = drop(b, c, max ? 2 : 1); const [, s] = minimax(b, dep - 1, a, be, !max); b[r][c] = 0;
        if (max ? s > val : s < val) { val = s; best = c; } if (max) a = Math.max(a, val); else be = Math.min(be, val); if (a >= be) break; }
      return [best, val];
    };
    const place = (c, p) => new Promise(res => {
      const r = drop(B, c, p); const el = cells[r * C + c];
      const disc = document.createElement('span'); disc.className = 'c4-disc p' + p; disc.style.setProperty('--fall', (r + 1) * -100 + '%'); el.appendChild(disc);
      Sound.tap(); setTimeout(res, 320);
    });
    const finish = () => {
      const w = winner(B);
      if (w === 1) { over = true; Sound.complete(); api.win(moves <= 10 ? 3 : moves <= 16 ? 2 : 1, [{ label: 'Coups', value: moves }, { label: 'Niveau IA', value: depth }]); return true; }
      if (w === 2) { over = true; api.lose('L’ordinateur a aligné quatre jetons', 'Pas de chance cette fois. Rejoue pour prendre ta revanche !'); return true; }
      if (!valid(B).length) { over = true; api.lose('Match nul', 'La grille est pleine sans gagnant. Rejoue pour départager !'); return true; }
      return false;
    };
    const setTurn = mine => { turnEl.textContent = mine ? 'À toi de jouer (rouge)' : 'L’ordinateur réfléchit…'; turnEl.classList.toggle('ai', !mine); };
    board.addEventListener('click', async e => {
      const cell = e.target.closest('.c4-cell'); if (!cell || busy || over || paused) return;
      const c = +cell.dataset.c; if (free(c) < 0) return;
      busy = true; moves++; api.stat(`${moves} coups`);
      await place(c, 1); if (finish()) return;
      setTurn(false);
      await new Promise(r => setTimeout(r, 350));
      const v = valid(B); let col = minimax(B, depth, -Infinity, Infinity, true)[0];
      if (Math.random() < blunder) col = v[Math.floor(Math.random() * v.length)];
      await place(col, 2); if (finish()) return;
      setTurn(true); busy = false;
    });
    setTurn(true); api.stat('0 coups');
  },
};
