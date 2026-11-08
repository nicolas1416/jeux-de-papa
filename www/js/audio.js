// Musique générative (aucun fichier audio nécessaire) et effets sonores
'use strict';
const Sound = (() => {
  let ac = null, master, musicBus, sfxBus, verb, timer = null;
  let musicVol = .6, sfxVol = .8;
  let mood = null, step = 0, nextT = 0, chordIdx = 0;

  const MOODS = {
    menu:    { bpm: 66, wave: 'triangle', arp: .35, cut: 1400, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 66]] },
    calm:    { bpm: 70, wave: 'triangle', arp: .4,  cut: 1600, chords: [[52, 56, 59, 63], [49, 52, 56, 59], [45, 52, 56, 61], [47, 51, 54, 57]] },
    mystery: { bpm: 62, wave: 'sawtooth', arp: .3,  cut: 900,  chords: [[50, 53, 57, 60], [46, 50, 53, 57], [43, 50, 55, 59], [45, 52, 57, 60]] },
    bright:  { bpm: 82, wave: 'triangle', arp: .55, cut: 2200, chords: [[48, 52, 55, 59], [50, 54, 57, 60], [45, 52, 55, 60], [43, 50, 55, 59]] },
    dreamy:  { bpm: 72, wave: 'sine',     arp: .5,  cut: 1800, chords: [[52, 56, 59, 63], [49, 52, 56, 59], [45, 52, 56, 61], [47, 51, 54, 57]] },
    night:   { bpm: 58, wave: 'sawtooth', arp: .25, cut: 800,  chords: [[54, 57, 61, 64], [50, 54, 57, 61], [45, 49, 52, 56], [52, 56, 59, 62]] },
    space:   { bpm: 54, wave: 'sine',     arp: .3,  cut: 1200, chords: [[48, 55, 62, 67], [46, 53, 60, 65], [44, 51, 58, 63], [46, 53, 62, 65]] },
  };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function impulse(sec) {
    const len = ac.sampleRate * sec, b = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function init() {
    if (ac) { if (ac.state === 'suspended' && !document.hidden) ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createDynamicsCompressor(); master.connect(ac.destination);
    musicBus = ac.createGain(); sfxBus = ac.createGain();
    verb = ac.createConvolver(); verb.buffer = impulse(3.2);
    const verbOut = ac.createGain(); verbOut.gain.value = .55;
    musicBus.connect(master); musicBus.connect(verb);
    sfxBus.connect(master); sfxBus.connect(verb);
    verb.connect(verbOut); verbOut.connect(master);
    setVolumes(musicVol, sfxVol);
    document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });
  }
  function setVolumes(m, s) {
    musicVol = m; sfxVol = s;
    if (!ac) return;
    musicBus.gain.setTargetAtTime(m * .45, ac.currentTime, .1);
    sfxBus.gain.setTargetAtTime(s * .7, ac.currentTime, .05);
  }

  function voice(freq, t, dur, opt) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = opt.wave || 'sine'; o.frequency.value = freq; if (opt.detune) o.detune.value = opt.detune;
    let node = o;
    if (opt.cut) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opt.cut; f.Q.value = .4; o.connect(f); node = f; }
    node.connect(g); g.connect(opt.bus);
    const a = opt.att || .01, peak = opt.gain || .2;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(0, t + Math.max(a, dur - (opt.rel || .3)), (opt.rel || .3) / 3);
    o.start(t); o.stop(t + dur + (opt.rel || .3) + .2);
  }

  function schedule() {
    if (!ac || !mood) return;
    const M = MOODS[mood], stepDur = 60 / M.bpm / 2;
    while (nextT < ac.currentTime + .6) {
      const t = nextT;
      if (step % 16 === 0) {
        const ch = M.chords[chordIdx % M.chords.length]; chordIdx++;
        const len = stepDur * 16;
        ch.forEach(n => {
          voice(hz(n), t, len, { bus: musicBus, wave: M.wave, cut: M.cut, att: 1.4, rel: 1.6, gain: .045, detune: -6 });
          voice(hz(n), t, len, { bus: musicBus, wave: M.wave, cut: M.cut, att: 1.6, rel: 1.6, gain: .035, detune: 7 });
        });
        voice(hz(ch[0] - 12), t, len * .9, { bus: musicBus, wave: 'sine', att: .3, rel: 1, gain: .12 });
      }
      if (step % 2 === 0 && Math.random() < M.arp) {
        const ch = M.chords[(chordIdx - 1 + M.chords.length) % M.chords.length];
        const n = ch[Math.floor(Math.random() * ch.length)] + (Math.random() < .6 ? 12 : 24);
        voice(hz(n), t, stepDur * 3, { bus: musicBus, wave: 'sine', att: .005, rel: .9, gain: .06 });
        voice(hz(n) * 2.01, t, stepDur, { bus: musicBus, wave: 'sine', att: .003, rel: .3, gain: .012 });
      }
      nextT += stepDur; step++;
    }
  }
  function play(m) {
    init(); if (!ac || mood === m) return;
    mood = m; step = 0; chordIdx = 0; nextT = ac.currentTime + .15;
    if (!timer) timer = setInterval(schedule, 120);
  }
  function stop() { mood = null; }

  // ——— Effets ———
  function found() {
    init(); if (!ac) return; const t = ac.currentTime;
    [[88, 0], [95, .07], [100, .14]].forEach(([n, d]) => {
      voice(hz(n), t + d, .9, { bus: sfxBus, wave: 'sine', att: .004, rel: .8, gain: .16 });
      voice(hz(n) * 2.76, t + d, .4, { bus: sfxBus, wave: 'sine', att: .002, rel: .35, gain: .03 });
    });
    const b = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'highpass'; f.frequency.value = 6000; g.gain.value = .06;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }
  function wrong() {
    init(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(70, t + .18);
    g.gain.setValueAtTime(.28, t); g.gain.exponentialRampToValueAtTime(.001, t + .25);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .3);
  }
  function hint() {
    init(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(1400, t + .45);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .1); g.gain.linearRampToValueAtTime(0, t + .5);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .55);
  }
  function complete() {
    init(); if (!ac) return; const t = ac.currentTime;
    [72, 76, 79, 84, 88, 91].forEach((n, i) => voice(hz(n), t + i * .11, 1.6, { bus: sfxBus, wave: 'triangle', att: .005, rel: 1.4, gain: .11 }));
  }
  function tap() {
    init(); if (!ac) return; const t = ac.currentTime;
    voice(1800, t, .05, { bus: sfxBus, wave: 'sine', att: .002, rel: .05, gain: .05 });
  }
  function jingle() {
    init(); if (!ac) return; const t = ac.currentTime;
    [[72, 0], [76, .14], [79, .28], [84, .42], [79, .62], [84, .76]].forEach(([n, d]) => {
      voice(hz(n), t + d, .35, { bus: sfxBus, wave: 'square', cut: 2600, att: .004, rel: .25, gain: .05 });
      voice(hz(n - 12), t + d, .3, { bus: sfxBus, wave: 'triangle', att: .004, rel: .2, gain: .07 });
    });
  }
  // montée de suspense avant la révélation (plus longue pour les objets rares)
  function riser(sec, strength) {
    init(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(180 + 700 * strength, t + sec);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3000, t + sec);
    lfo.frequency.setValueAtTime(5, t); lfo.frequency.linearRampToValueAtTime(14, t + sec); lg.gain.value = .5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.04 + .04 * strength, t + sec);
    lfo.connect(lg); lg.connect(g.gain); o.connect(f); f.connect(g); g.connect(sfxBus);
    o.start(t); lfo.start(t); o.stop(t + sec + .05); lfo.stop(t + sec + .05);
  }
  function boom(strength) {
    init(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .5);
    g.gain.setValueAtTime(.25 + .2 * strength, t); g.gain.exponentialRampToValueAtTime(.001, t + .7); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .75);
  }
  return { init, play, stop, setVolumes, found, wrong, hint, complete, tap, jingle, riser, boom };
})();
