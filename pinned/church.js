// Church: one shared Orthodox church, opened from the board sidebar.
// Everyone in the church sees each other (presence only: no chat, no typing).
// The lectern opens a Bible reader with search, a book browser and text size.
// Loaded by app.js, which passes in the signed-in person, the live API and a way back.

const CH_KEY = { mute: "pinned.fxMuted", ambient: "pinned.churchAmbient", bible: "pinned.churchBible", size: "pinned.churchTextSize", music: "pinned.churchMusic", musicVol: "pinned.churchMusicVol", track: "pinned.churchTrack" };
const chGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const chSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const chEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

// ---------------------------------------------------------------- sound
// All sound is made with the Web Audio API. Nothing loads from files.
let chAudio = null;
function chCtx() {
  if (chGet(CH_KEY.mute, false) === true) return null;
  try {
    if (!chAudio) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; chAudio = new C(); }
    if (chAudio.state === "suspended") chAudio.resume().catch(() => {});
    return chAudio;
  } catch { return null; }
}
// A door: a filtered wood creak that sweeps up (opening) or down (closing), then a soft thud.
function chDoor(opening, volume = 1) {
  const a = chCtx(); if (!a) return;
  try {
    const t = a.currentTime, len = Math.floor(a.sampleRate * 0.9);
    const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * 0.6;
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 7;
    bp.frequency.setValueAtTime(opening ? 320 : 820, t);
    bp.frequency.linearRampToValueAtTime(opening ? 900 : 260, t + 0.8);
    const g = a.createGain(); g.gain.value = 0.3 * volume;
    src.connect(bp).connect(g).connect(a.destination); src.start(t);
    const o = a.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(120, t + 0.8); o.frequency.exponentialRampToValueAtTime(42, t + 1.12);
    const og = a.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.8);
    og.gain.exponentialRampToValueAtTime(0.38 * volume, t + 0.84);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(og).connect(a.destination); o.start(t + 0.8); o.stop(t + 1.25);
  } catch { /* audio blocked: visuals still work */ }
}
// Ambient church tone: a quiet hum with a soft bell now and then. Off by default.
let chAmbientTimer = 0, chHum = null;
function chAmbientOn() {
  const a = chCtx(); if (!a || chHum) return;
  try {
    const g = a.createGain(); g.gain.value = 0.012;
    const o = a.createOscillator(); o.type = "sine"; o.frequency.value = 110;
    o.connect(g).connect(a.destination); o.start();
    chHum = { o, g };
    const bell = () => {
      const c = chCtx(); if (!c || !chHum) return;
      const t = c.currentTime, b = c.createOscillator(), bg = c.createGain();
      b.type = "sine"; b.frequency.value = 660;
      bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.06, t + 0.02); bg.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
      b.connect(bg).connect(c.destination); b.start(t); b.stop(t + 3.6);
    };
    chAmbientTimer = setInterval(() => { if (Math.random() < 0.5) bell(); }, 9000);
  } catch { /* ignore */ }
}
function chAmbientOff() {
  clearInterval(chAmbientTimer); chAmbientTimer = 0;
  if (chHum) { try { chHum.o.stop(); } catch { /* already stopped */ } chHum = null; }
}


// ---------------------------------------------------------------- choir music
// Generated in the browser: soft, slow chords sung by layered detuned voices with a vowel filter and a long hall reverb.
// No recordings are used, so there is no licence to check.
// Original pieces. Each has a slow chord cycle and a solo melody line (one note per chord), in a modal, chant-like sound.
const CH_TRACKS = [
  { name: "Vespers", every: 12, chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], melody: [76, 72, 79, 74] },   // Am F C G
  { name: "Liturgy", every: 13, chords: [[50, 53, 57], [58, 62, 65], [53, 57, 60], [57, 60, 64]], melody: [74, 70, 72, 69] }, // Dm Bb F C
  { name: "Dawn", every: 14, chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], melody: [72, 69, 77, 79] },   // C Am F G
];
const chMidi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let chMus = { on: false, master: null, verb: null, groups: [], timer: 0, step: 0, track: 0, vol: 0.35 };
try { chMus.vol = Math.min(1, Math.max(0, chGet(CH_KEY.musicVol, 35) / 100)); chMus.track = chGet(CH_KEY.track, 0) % CH_TRACKS.length; } catch { /* defaults */ }

function chHall(a) {
  // a soft 4-second hall impulse made from decaying noise
  const len = Math.floor(a.sampleRate * 4), buf = a.createBuffer(2, len, a.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  const conv = a.createConvolver(); conv.buffer = buf; return conv;
}
function chVoiceGroup(a, dest, chord, level) {
  // one chord sung by three detuned "voices" (a vowel-like filter on a soft saw)
  const out = a.createGain(); out.gain.value = 0;
  const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.4;
  const formant = a.createBiquadFilter(); formant.type = "bandpass"; formant.frequency.value = 820; formant.Q.value = 1.6;
  lp.connect(formant).connect(out).connect(dest);
  const nodes = [];
  for (const n of chord) for (const det of [-6, 0, 6]) {
    const o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = chMidi(n); o.detune.value = det;
    const g = a.createGain(); g.gain.value = 0.18 / chord.length / 1.5;
    const vib = a.createOscillator(); vib.frequency.value = 4.6 + Math.random() * 0.8;
    const vg = a.createGain(); vg.gain.value = 3; vib.connect(vg).connect(o.detune);
    o.connect(g).connect(lp); o.start(); vib.start();
    nodes.push(o, vib);
  }
  out.gain.linearRampToValueAtTime(level, a.currentTime + 2.8); // slow swell in
  return { out, nodes };
}
// A solo voice on the melody: a soft sine with a triangle for warmth and a slow vibrato.
function chMelody(a, dest, midi, dur) {
  const out = a.createGain(); out.gain.value = 0;
  const o1 = a.createOscillator(); o1.type = "sine"; o1.frequency.value = chMidi(midi);
  const o2 = a.createOscillator(); o2.type = "triangle"; o2.frequency.value = chMidi(midi);
  const g2 = a.createGain(); g2.gain.value = 0.35;
  const vib = a.createOscillator(); vib.frequency.value = 5.2;
  const vg = a.createGain(); vg.gain.value = 9;
  vib.connect(vg); vg.connect(o1.detune); vg.connect(o2.detune);
  o1.connect(out); o2.connect(g2).connect(out); out.connect(dest);
  const t = a.currentTime;
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.14, t + 1.6);
  out.gain.setValueAtTime(0.14, t + Math.max(2, dur - 2.6)); out.gain.linearRampToValueAtTime(0, t + dur);
  for (const n of [o1, o2, vib]) { n.start(t); n.stop(t + dur + 0.1); }
}
// The censer's chain clinks as it swings, with a soft hiss of incense.
function chCensorClink() {
  if (!chMus.on) return;
  const a = chCtx(); if (!a) return;
  try {
    const t = a.currentTime;
    for (const f of [2310, 3150, 4480]) {
      const o = a.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1);
    }
    const len = Math.floor(a.sampleRate * 1.4), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * 0.5;
    const src = a.createBufferSource(); src.buffer = buf;
    const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
    const g = a.createGain(); g.gain.value = 0.035;
    src.connect(hp).connect(g).connect(a.destination); src.start(t + 0.15);
  } catch { /* audio blocked */ }
}

function chMusicPlayChord() {
  const a = chMus.master && chMus.master.context; if (!a || !chMus.on) return;
  const tr = CH_TRACKS[chMus.track], chord = tr.chords[chMus.step % tr.chords.length];
  if (!chMus.bus) return;
  chMus.step++;
  const now = a.currentTime;
  for (const g of chMus.groups) { // fade the old chord out, then stop it
    g.out.gain.cancelScheduledValues(now); g.out.gain.setValueAtTime(g.out.gain.value, now); g.out.gain.linearRampToValueAtTime(0, now + 3.2);
    setTimeout(() => g.nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }), 3500);
  }
  chMus.groups = [chVoiceGroup(a, chMus.bus, chord, 1)];
  const dur = CH_TRACKS[chMus.track].every;
  chMelody(a, chMus.bus, tr.melody[(chMus.step - 1) % tr.melody.length], dur);
}
function chMusicStart() {
  if (chMus.on) return;
  const a = chCtx(); if (!a) return;
  try {
    // voices -> bus -> master -> speakers, and bus -> hall reverb -> wet -> master (no loops)
    chMus.bus = a.createGain();
    chMus.verb = chHall(a);
    const wet = a.createGain(); wet.gain.value = 0.6;
    chMus.master = a.createGain(); chMus.master.gain.value = 0;
    chMus.master.connect(a.destination);
    chMus.bus.connect(chMus.master);
    chMus.bus.connect(chMus.verb); chMus.verb.connect(wet).connect(chMus.master);
    chMus.master.gain.linearRampToValueAtTime(chMus.vol * 0.22, a.currentTime + 2);
    chMus.on = true;
    chMusicPlayChord();
    chMus.timer = setInterval(chMusicPlayChord, CH_TRACKS[chMus.track].every * 1000);
    // The censer clinks each time the swing reaches the end of a stroke, so sound matches motion.
    chMus.onSwing = (e) => { if (e.target && e.target.classList && e.target.classList.contains("ch-swing")) chCensorClink(); };
    document.addEventListener("animationiteration", chMus.onSwing);
  } catch { chMus.on = false; }
  chMusicUi();
}
function chMusicStop() {
  if (!chMus.on) return;
  chMus.on = false; clearInterval(chMus.timer); chMus.timer = 0;
  if (chMus.onSwing) { document.removeEventListener("animationiteration", chMus.onSwing); chMus.onSwing = null; }
  const m = chMus.master, a = m && m.context;
  if (a && m) {
    m.gain.cancelScheduledValues(a.currentTime); m.gain.setValueAtTime(m.gain.value, a.currentTime);
    m.gain.linearRampToValueAtTime(0, a.currentTime + 1.5);
    const groups = chMus.groups; chMus.groups = [];
    const bus = chMus.bus, verb = chMus.verb;
    setTimeout(() => {
      groups.forEach((g) => g.nodes.forEach((n) => { try { n.stop(); } catch { /* ok */ } }));
      try { m.disconnect(); if (bus) bus.disconnect(); if (verb) verb.disconnect(); } catch { /* ok */ }
    }, 1700);
  }
  chMus.master = null; chMus.verb = null; chMus.bus = null;
  chMusicUi();
}
function chMusicSetVol(v) {
  chMus.vol = Math.min(1, Math.max(0, v / 100));
  chSet(CH_KEY.musicVol, Math.round(v));
  if (chMus.on && chMus.master) chMus.master.gain.setTargetAtTime(chMus.vol * 0.22, chMus.master.context.currentTime, 0.08);
}
function chMusicNextTrack() {
  chMus.track = (chMus.track + 1) % CH_TRACKS.length; chMus.step = 0;
  chSet(CH_KEY.track, chMus.track);
  if (chMus.on) { chMusicStop(); chMusicStart(); }
  chMusicUi();
}
function chMusicUi() {
  if (!chRoot) return;
  const b = chRoot.querySelector("#chMusicBtn"), t = chRoot.querySelector("#chTrack");
  if (b) { b.setAttribute("aria-pressed", String(chMus.on)); b.textContent = chMus.on ? "♪ Music on" : "♪ Music off"; }
  if (t) t.textContent = CH_TRACKS[chMus.track].name;
}

// ---------------------------------------------------------------- scene
const VB_W = 400, VB_H = 700;
// The scene is wider than the church: the nave sits in the middle (x from SC_X) and walls and pillars fill the sides.
const SC_X = 350, SC_W = 1100;
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
const PEWS = [
  { id: "L0", x: 26, y: 382 }, { id: "L1", x: 26, y: 438 }, { id: "L2", x: 26, y: 494 }, { id: "L3", x: 26, y: 550 },
  { id: "R0", x: 244, y: 382 }, { id: "R1", x: 244, y: 438 }, { id: "R2", x: 244, y: 494 }, { id: "R3", x: 244, y: 550 },
];
const PEW_W = 130, PEW_H = 34;
const BACK_ROW = { y: 636 }; // standing place at the back, near the door
const ICON_KINDS = [
  { label: "Christ", robe: "#7a1f2b", halo: true, book: true },
  { label: "Theotokos", robe: "#2a3d8f", halo: true, child: true },
  { label: "John the Baptist", robe: "#6b4a1e", halo: true },
  { label: "Saint Nicholas", robe: "#2f6b4e", halo: true, staff: true },
  { label: "Saint Sergius", robe: "#7a1f2b", halo: true },
];
// Original icon art: flat gold-backed figures. Nothing copied from a real icon.
function chIcon(x, y, w, h, kind) {
  const cx = x + w / 2;
  const face = `<ellipse cx="${cx}" cy="${y + h * 0.36}" rx="${w * 0.14}" ry="${h * 0.12}" fill="#e9c9a0"/>`;
  const halo = kind.halo ? `<circle cx="${cx}" cy="${y + h * 0.34}" r="${w * 0.24}" fill="none" stroke="#f6d77a" stroke-width="2.4"/>` : "";
  const robe = `<path d="M${cx - w * 0.32} ${y + h * 0.95} L${cx - w * 0.2} ${y + h * 0.5} Q${cx} ${y + h * 0.44} ${cx + w * 0.2} ${y + h * 0.5} L${cx + w * 0.32} ${y + h * 0.95} Z" fill="${kind.robe}"/>`;
  const extra = [
    kind.book ? `<rect x="${cx - w * 0.2}" y="${y + h * 0.6}" width="${w * 0.4}" height="${h * 0.14}" fill="#f2e6c2" stroke="#b8862b" stroke-width="1"/>` : "",
    kind.child ? `<circle cx="${cx}" cy="${y + h * 0.7}" r="${w * 0.08}" fill="#e9c9a0"/>` : "",
    kind.staff ? `<line x1="${cx + w * 0.3}" y1="${y + h * 0.4}" x2="${cx + w * 0.3}" y2="${y + h * 0.95}" stroke="#d9b45b" stroke-width="2"/>` : "",
  ].join("");
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d9a63a" stroke="#8a5a14" stroke-width="2"/>
    <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2" fill="#1d3d7a"/>
    ${halo}${robe}${face}${extra}
  </g>`;
}

// Scene art. The nave sits in the middle (x from SC_X); walls, columns and windows fill the sides.
// Two depth layers: the far walls and the near nave move by different amounts when the pointer moves (see chParallax).
// The outer group places the nave; the inner group is the depth layer (CSS transforms would override a transform attribute).
const CH_NAVE = (body) => `<g transform="translate(${SC_X} 0)"><g class="ch-near">${body}</g></g>`;
const CH_FAR = (body) => `<g class="ch-far">${body}</g>`;

function chDefs() {
  let tess = "";
  for (let i = 0; i < 6; i++) tess += `<rect x="${i * 8}" y="${i % 2 * 4}" width="4" height="4" fill="#fff3c4" opacity="${0.12 + (i % 3) * 0.05}"/>`;
  return `<defs>
    <radialGradient id="chGold" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#ffe7a0"/><stop offset=".55" stop-color="#d9a63a"/><stop offset="1" stop-color="#7a4f12"/></radialGradient>
    <pattern id="chTess" width="8" height="8" patternUnits="userSpaceOnUse">${tess}</pattern>
    <linearGradient id="chMarble" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8b5a64"/><stop offset=".3" stop-color="#e6c7c0"/><stop offset=".55" stop-color="#b58088"/><stop offset=".8" stop-color="#f0dcd4"/><stop offset="1" stop-color="#7d4b57"/></linearGradient>
    <linearGradient id="chGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e4fa8"/><stop offset=".45" stop-color="#7a2a6a"/><stop offset=".75" stop-color="#2f8a5a"/><stop offset="1" stop-color="#d9a63a"/></linearGradient>
    <linearGradient id="chCarpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a0f1f"/><stop offset="1" stop-color="#9a1b29"/></linearGradient>
    <pattern id="chCarpetTex" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#8a1424"/>
      <path d="M0 2.5 H10 M0 7.5 H10" stroke="#5e0c18" stroke-width="1" opacity=".55"/>
      <path d="M2.5 0 V10 M7.5 0 V10" stroke="#b02a3a" stroke-width=".6" opacity=".35"/>
      <rect x="4.5" y="4.5" width="1" height="1" fill="#d9a63a" opacity=".5"/>
    </pattern>
    <linearGradient id="chVault" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15286b"/><stop offset="1" stop-color="#2d3f8f"/></linearGradient>
    <linearGradient id="chFresco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c48a"/><stop offset="1" stop-color="#6f5a2f"/></linearGradient>
    <linearGradient id="chWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f1a24"/><stop offset=".5" stop-color="#3a3038"/><stop offset="1" stop-color="#2a2222"/></linearGradient>
    <linearGradient id="chWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b3f1f"/><stop offset=".5" stop-color="#8a5a2e"/><stop offset="1" stop-color="#5a3418"/></linearGradient>
    <radialGradient id="chGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    ${chMosaic()}
  </defs>`;
}
// Floor tile pattern: cream, red and gold diamonds.
function chMosaic() {
  return `<pattern id="chTile" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#f2e6c2"/>
      <path d="M14 2 L26 14 L14 26 L2 14 Z" fill="#9c2a2a"/>
      <path d="M14 8 L20 14 L14 20 L8 14 Z" fill="#d9a63a"/>
    </pattern>`;
}
// Gilded ornament band with a dotted pattern.
function chBand(x1, y, x2) {
  return `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="7" fill="#c99a3c" stroke="#7a4f12" stroke-width="1"/><line x1="${x1}" y1="${y + 3.5}" x2="${x2}" y2="${y + 3.5}" stroke="#f6d77a" stroke-width="1" stroke-dasharray="3 4" opacity=".8"/>`;
}
function chMarbleColumn(x, w) {
  return `<rect x="${x}" y="70" width="${w}" height="${VB_H - 90}" fill="url(#chMarble)" stroke="#5a3a44" stroke-width="1"/>
    <rect x="${x - 8}" y="56" width="${w + 16}" height="16" rx="2" fill="#d9a63a" stroke="#7a4f12"/>
    <rect x="${x - 10}" y="${VB_H - 22}" width="${w + 20}" height="22" fill="#b58a46" stroke="#5a3a1a"/>`;
}
function chWindowArch(x, y, w, h) {
  const r = w / 2;
  return `<path d="M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z" fill="url(#chGlass)" stroke="#d9a63a" stroke-width="4"/>
    <line x1="${x + r}" y1="${y + 6}" x2="${x + r}" y2="${y + h}" stroke="#f6d77a" stroke-width="2" opacity=".7"/>
    <line x1="${x + 4}" y1="${y + h * 0.55}" x2="${x + w - 4}" y2="${y + h * 0.55}" stroke="#f6d77a" stroke-width="2" opacity=".7"/>
    <circle cx="${x + r}" cy="${y + r * 0.9}" r="${r * 0.38}" fill="none" stroke="#f6d77a" stroke-width="2.4"/>`;
}
function chChandelier(cx, len, r) {
  let lights = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, x = cx + Math.cos(a) * r, y = len + Math.sin(a) * r * 0.32;
    lights += `<rect x="${x - 2}" y="${y - 10}" width="4" height="10" fill="#f4eee0"/><ellipse class="ch-flame" cx="${x}" cy="${y - 12}" rx="2.4" ry="4.5" fill="#ffd27a"/>`;
  }
  return `<line x1="${cx}" y1="0" x2="${cx}" y2="${len}" stroke="#7a4f12" stroke-width="1.5"/>
    <ellipse cx="${cx}" cy="${len}" rx="${r}" ry="${r * 0.32}" fill="none" stroke="#c99a3c" stroke-width="5"/>
    <circle cx="${cx}" cy="${len + 4}" r="${r * 1.3}" fill="url(#chGlow)" class="ch-glow"/>${lights}`;
}
// Fresco panel: a painted field with a row of gilded medallions.
function chFresco(x, y, w, h) {
  let med = "";
  const n = 2;
  for (let i = 0; i < n; i++) med += chIcon(x + 10 + i * ((w - 20) / n), y + 16, (w - 20) / n - 8, h - 40, ICON_KINDS[(i + Math.floor(x)) % ICON_KINDS.length]);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#chFresco)" stroke="#7a4f12" stroke-width="2"/>
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#f6d77a" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/>${med}`;
}
// The Theotokos (Orans): arms raised, Child on her breast, gold halo, on a gold apse.
function chOrans(cx, cy, s) {
  return `<circle cx="${cx}" cy="${cy - s * 0.25}" r="${s * 0.62}" fill="#f6d77a" stroke="#7a4f12" stroke-width="2"/>
    <path d="M${cx - s * 0.95} ${cy + s * 1.7} Q${cx - s * 1.05} ${cy + s * 0.2} ${cx - s * 0.42} ${cy - s * 0.05} L${cx + s * 0.42} ${cy - s * 0.05} Q${cx + s * 1.05} ${cy + s * 0.2} ${cx + s * 0.95} ${cy + s * 1.7} Z" fill="#5a1426" stroke="#2a0a14"/>
    <path d="M${cx - s * 0.5} ${cy + s * 0.05} Q${cx - s * 1.5} ${cy - s * 0.2} ${cx - s * 1.4} ${cy - s * 0.9} L${cx - s * 1.1} ${cy - s * 0.85} Q${cx - s * 1.2} ${cy - s * 0.2} ${cx - s * 0.2} ${cy + s * 0.2} Z" fill="#5a1426" stroke="#2a0a14"/>
    <path d="M${cx + s * 0.5} ${cy + s * 0.05} Q${cx + s * 1.5} ${cy - s * 0.2} ${cx + s * 1.4} ${cy - s * 0.9} L${cx + s * 1.1} ${cy - s * 0.85} Q${cx + s * 1.2} ${cy - s * 0.2} ${cx + s * 0.2} ${cy + s * 0.2} Z" fill="#5a1426" stroke="#2a0a14"/>
    <ellipse cx="${cx}" cy="${cy - s * 0.3}" rx="${s * 0.3}" ry="${s * 0.36}" fill="#e9c9a0"/>
    <path d="M${cx - s * 0.42} ${cy - s * 0.42} Q${cx} ${cy - s * 0.95} ${cx + s * 0.42} ${cy - s * 0.42} L${cx + s * 0.38} ${cy + s * 0.05} L${cx - s * 0.38} ${cy + s * 0.05} Z" fill="#1d3d7a" opacity=".92"/>
    <circle cx="${cx}" cy="${cy + s * 0.55}" r="${s * 0.22}" fill="#f2d8b0" stroke="#7a4f12"/>
    <circle cx="${cx}" cy="${cy + s * 0.55}" r="${s * 0.34}" fill="none" stroke="#f6d77a" stroke-width="1.5"/>`;
}
function chApse() {
  return `<path d="M26 330 L26 250 A174 174 0 0 1 374 250 L374 330 Z" fill="url(#chGold)" stroke="#7a4f12" stroke-width="3"/>
    <path d="M26 330 L26 250 A174 174 0 0 1 374 250 L374 330 Z" fill="url(#chTess)" opacity=".5"/>
    <path d="M44 320 L44 250 A156 156 0 0 1 356 250 L356 320" fill="none" stroke="#f6d77a" stroke-width="2" stroke-dasharray="4 5"/>
    <path d="M26 250 A174 174 0 0 1 374 250" fill="none" stroke="#7a4f12" stroke-width="5"/>
    ${chOrans(200, 124, 36)}
    <text x="200" y="170" text-anchor="middle" font-size="11" font-family="serif" fill="#5a1426" font-weight="700">ΜΡ ΘΥ</text>`;
}
function chVaultAngels() {
  let out = "";
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 60;
    out += `<circle cx="${x}" cy="34" r="14" fill="#1d3d7a" stroke="#d9a63a" stroke-width="2"/><circle cx="${x}" cy="34" r="10" fill="none" stroke="#f6d77a" stroke-width="1" stroke-dasharray="2 2"/><circle cx="${x}" cy="34" r="5" fill="#f2d8b0"/>`;
  }
  return out;
}
// Three-tier iconostasis: gilded frame, icon rows, royal doors with an arch.
function chIconostasisArt() {
  let top = "", mid = "";
  for (let i = 0; i < 5; i++) top += chIcon(70 + i * 52, 214, 44, 46, ICON_KINDS[i % ICON_KINDS.length]);
  for (const x of [62, 110, 262, 310]) mid += chIcon(x, 270, 46, 60, ICON_KINDS[(x / 10) % ICON_KINDS.length | 0]);
  return `<rect x="46" y="190" width="308" height="144" fill="url(#chGold)" stroke="#7a4f12" stroke-width="2"/>
    <rect x="46" y="186" width="308" height="10" fill="#f6d77a" stroke="#7a4f12"/>
    ${chBand(46, 204, 354)}
    ${top}${mid}
    <rect x="104" y="262" width="8" height="70" fill="#f6d77a" stroke="#7a4f12"/><rect x="288" y="262" width="8" height="70" fill="#f6d77a" stroke="#7a4f12"/>
    <path d="M168 334 L168 278 Q200 246 232 278 L232 334 Z" fill="#9c2a2a" stroke="#f1d27a" stroke-width="3"/>
    <line x1="200" y1="262" x2="200" y2="330" stroke="#f1d27a" stroke-width="1.5"/>
    <circle cx="200" cy="300" r="5" fill="#f1d27a"/>
    <rect x="193" y="170" width="14" height="24" fill="#d9a63a" stroke="#7a4f12"/><rect x="186" y="178" width="28" height="5" fill="#d9a63a" stroke="#7a4f12"/>`;
}
function chCandleStands() {
  let out = "";
  for (const x of [120, 280]) out += `<rect x="${x - 2}" y="326" width="4" height="34" fill="#c99a3c"/><rect x="${x - 7}" y="356" width="14" height="5" fill="#7a4f12"/><rect x="${x - 3}" y="314" width="6" height="14" fill="#f4eee0"/><ellipse class="ch-flame" cx="${x}" cy="311" rx="3.2" ry="6" fill="#ffd27a"/>`;
  return out;
}
function chCandles() {
  let out = "";
  for (const x of [14, 386]) for (const y of [236, 300, 364]) {
    out += `<rect x="${x - 2.5}" y="${y}" width="5" height="22" fill="#f4eee0"/><ellipse class="ch-flame" cx="${x}" cy="${y - 4}" rx="3" ry="6" fill="#ffd27a"/>`;
  }
  return out;
}
function chPerspective() {
  let out = "";
  for (const x of [-120, -40, 40, 120, 280, 360, 440, 520]) out += `<line x1="200" y1="330" x2="${x}" y2="700" stroke="#fff3c4" stroke-width="1" opacity=".08"/>`;
  return out;
}
function chCarpetArt() {
  return `<path d="M168 330 L232 330 L268 700 L132 700 Z" fill="#8a1424" stroke="#f6d77a" stroke-width="2" stroke-dasharray="6 6"/>
    <path d="M168 330 L232 330 L268 700 L132 700 Z" fill="url(#chCarpetTex)"/>`;
}
// The analogion (lectern) at the centre of the nave, with an open book and a small lamp.
function chLectern() {
  return `<g class="ch-lectern-art">
    <rect x="176" y="346" width="48" height="8" rx="2" fill="#7a4f12"/>
    <rect x="195" y="318" width="10" height="30" fill="#7a4f12"/>
    <path d="M170 306 L199 300 L199 316 L170 322 Z" fill="#f2e6c2" stroke="#b8862b"/>
    <path d="M201 300 L230 306 L230 322 L201 316 Z" fill="#f2e6c2" stroke="#b8862b"/>
    <rect x="197" y="296" width="6" height="8" fill="#d9a63a"/>
    <path d="M200 262 Q196 268 200 274 Q204 268 200 262 Z" fill="#ffd27a" class="ch-flame"/>
  </g>`;
}
// A deacon walks slowly down the centre aisle and back, swinging a censer. Incense rises from it.
function chCenser() {
  let smoke = "";
  for (let i = 0; i < 6; i++) {
    const dx = (i % 2 ? 6 : -6) + (i - 3) * 2;
    smoke += `<circle class="ch-smoke" style="animation-delay:${(i * 0.55).toFixed(2)}s;--dx:${dx}px" cx="222" cy="404" r="${5 + (i % 3) * 2}" fill="#e8e4ef"/>`;
  }
  return `<g class="ch-walker">
    <path d="M186 370 L214 370 L222 428 L178 428 Z" fill="#f4eee0" stroke="#7a4f12" stroke-width="1.2"/>
    <path d="M192 368 L208 368 L210 384 L190 384 Z" fill="#9c2a2a" opacity=".9"/>
    <path d="M196 372 L204 372 L206 428 L194 428 Z" fill="#d9a63a" opacity=".55"/>
    <circle cx="200" cy="356" r="9" fill="#e9c9a0" stroke="#7a4f12" stroke-width=".8"/>
    <path d="M190 352 Q200 340 210 352 L209 357 L191 357 Z" fill="#3a2412"/>
    <line x1="208" y1="372" x2="222" y2="392" stroke="#f4eee0" stroke-width="5" stroke-linecap="round"/>
    <g class="ch-swing">
      <line x1="222" y1="392" x2="222" y2="404" stroke="#c99a3c" stroke-width="1.2"/>
      <line x1="218" y1="392" x2="216" y2="404" stroke="#c99a3c" stroke-width="1"/>
      <line x1="226" y1="392" x2="228" y2="404" stroke="#c99a3c" stroke-width="1"/>
      <path d="M214 404 L230 404 Q230 416 222 416 Q214 416 214 404 Z" fill="#d9a63a" stroke="#7a4f12" stroke-width="1"/>
      <line x1="210" y1="404" x2="234" y2="404" stroke="#7a4f12" stroke-width="1.5"/>
    </g>
    ${smoke}
  </g>`;
}
// Side walls (far layer): marble columns, frescoes and stained-glass windows, mirrored around the nave.
function chSideWalls() {
  let out = "";
  for (let y = 0; y < VB_H; y += 22) out += `<line x1="0" y1="${y}" x2="${SC_W}" y2="${y}" stroke="#000" stroke-opacity=".18"/>`;
  for (let i = 0; i < SC_W; i += 60) out += `<line x1="${i}" y1="0" x2="${i}" y2="${VB_H}" stroke="#000" stroke-opacity=".1"/>`;
  out += `<rect x="0" y="330" width="${SC_W}" height="370" fill="#2d2118" opacity=".7"/>`;
  const cols = [40, 150, 300];
  for (const x of cols) out += chMarbleColumn(x, 26) + chMarbleColumn(SC_W - x - 26, 26);
  out += chFresco(190, 130, 96, 200) + chFresco(SC_W - 286, 130, 96, 200);
  out += chWindowArch(78, 60, 70, 180) + chWindowArch(SC_W - 148, 60, 70, 180);
  out += chChandelier(SC_W / 2 - 300, 60, 36) + chChandelier(SC_W / 2 + 300, 60, 36);
  return out;
}
function chSvg() {
  return `<svg class="ch-svg" viewBox="0 0 ${SC_W} ${VB_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    ${chDefs()}
    <rect width="${SC_W}" height="${VB_H}" fill="url(#chWall)"/>
    ${CH_FAR(chSideWalls())}
    ${CH_NAVE(`
      <path d="M0 0 L400 0 L400 76 Q200 -4 0 76 Z" fill="url(#chVault)"/>
      ${chVaultAngels()}
      ${chPerspective()}
      <rect x="0" y="330" width="400" height="370" fill="#4a2f22" opacity=".25"/>
      ${chApse()}
      ${chIconostasisArt()}
      ${chCandleStands()}
      ${chMosaicFloor()}
      ${chCarpetArt()}
      <path d="M26 326 L374 326" stroke="#f6d77a" stroke-width="2" opacity=".35"/>
      ${chLampsArt()}
      ${chLectern()}
      ${chCenser()}
      ${PEWS.map((p) => `<rect class="ch-pewart" x="${p.x}" y="${p.y}" width="${PEW_W}" height="${PEW_H}" rx="4" fill="url(#chWood)" stroke="#3a2412"/>`).join("")}
      <rect x="164" y="660" width="72" height="40" fill="#3a2412" stroke="#d9a63a" stroke-width="2" class="ch-door-art"/>
    `)}
  </svg>`;
}
function chMosaicFloor() {
  return `<path d="M26 330 L374 330 L400 700 L0 700 Z" fill="url(#chTile)" opacity=".6"/>`;
}
function chLampsArt() {
  return [110, 290].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="34" stroke="#7a4f12" stroke-width="1.5"/>
    <circle cx="${x}" cy="54" r="58" fill="url(#chGlow)" class="ch-glow"/>
    <path d="M${x - 12} 40 Q${x} 36 ${x + 12} 40 L${x + 9} 58 Q${x} 64 ${x - 9} 58 Z" fill="#c99a3c" stroke="#7a4f12"/>
    <ellipse class="ch-flame" cx="${x}" cy="50" rx="4" ry="6" fill="#ffe2a0"/>`).join("");
}

// ---------------------------------------------------------------- the church screen
let chBoardId = "room";
let chLastAct = 0, chIsAway = false, chIdleT = 0;
const CH_IDLE_MS = 5 * 60 * 1000;   // five minutes with no touch or key = away
function chTouch() { chLastAct = Date.now(); if (chIsAway && chLive) { chIsAway = false; chLive.track({ away: false }); } }
let chMsgs = [], chLastSent = 0, chUnread = 0, chPanel = null;
let chRoot = null, chOpen = false, chLive = null, chMe = null, chApi = null, chPushed = false, chSeat = null;
let chPeople = {}, chSynced = false, chOnLeave = () => {}, chBoardEl = null;
const CH_BIBLE = { manifest: null, data: new Map(), tr: null, book: 0, chap: 1, view: "books", sel: null, token: 0, sheet: null };

function chBuildRoot() {
  const root = document.createElement("section");
  root.id = "churchScreen"; root.className = "screen church"; root.hidden = true;
  root.setAttribute("aria-label", "Church");
  root.innerHTML = `
    <header class="ch-bar">
      <button class="ch-back" id="chBack" type="button">‹ Back to my room</button>
      <button class="ch-bible-top" id="chBibleTop" type="button" aria-label="Open the Bible">📖 Bible</button>
      <span class="ch-count" id="chCount" aria-live="polite"></span>
    </header>
    <div class="ch-stage" id="chStage"><div class="ch-scene">
      ${chSvg()}
      <div class="ch-pews" id="chPews">
        ${PEWS.map((p) => `<button class="ch-pew" type="button" data-pew="${p.id}" style="left:${pct(p.x + SC_X, SC_W)};top:${pct(p.y, VB_H)};width:${pct(PEW_W, SC_W)};height:${pct(PEW_H + 14, VB_H)}" aria-label="Sit in pew ${p.id[0] === "L" ? "left" : "right"} ${Number(p.id[1]) + 1}"></button>`).join("")}
        <button class="ch-pew ch-back-row" type="button" data-pew="back" style="left:${pct(SC_X + 120, SC_W)};top:${pct(BACK_ROW.y, VB_H)};width:${pct(160, SC_W)};height:${pct(40, VB_H)}" aria-label="Stand at the back"></button>
        <button class="ch-lectern" type="button" id="chLectern" style="left:${pct(SC_X + 160, SC_W)};top:${pct(290, VB_H)};width:${pct(80, SC_W)};height:${pct(66, VB_H)}" aria-label="Open the Bible"><span class="ch-lbl">Bible</span></button>
        <button class="ch-door-tap" type="button" id="chDoor" aria-label="Back to my room" style="left:${pct(SC_X + 164, SC_W)};top:${pct(660, VB_H)};width:${pct(72, SC_W)};height:${pct(40, VB_H)}"></button>
      </div>
      <div class="ch-people" id="chPeople" aria-live="polite"></div>
    </div></div>
    <p class="ch-hint" id="chHint">Tap a pew to sit, tap the lectern to read the Bible. Everyone here can see you.</p>
    <div class="ch-dockwrap">
      <div class="ch-dock" id="chDock">
        <div class="ch-faces" id="chFaces" aria-hidden="true"></div>
        <button class="ch-dock-btn" id="chWhoBtn" type="button" aria-expanded="false" aria-controls="chRoster"><i class="ch-live-dot" aria-hidden="true"></i><span id="chWhoTxt">Only you</span><span class="ch-caret" aria-hidden="true">▴</span></button>
        <button class="ch-dock-btn" id="chChatBtn" type="button" aria-expanded="false" aria-controls="chChat">💬 Chat <span class="ch-badge" id="chBadge" hidden>0</span></button>
      </div>
      <div class="ch-wave" id="chWave" role="status" aria-live="polite" hidden></div>
      <section class="ch-panel" id="chRoster" hidden aria-label="Who is in the church">
        <button class="ch-grab" type="button" aria-label="Slide down to close"></button>
        <header class="ch-panel-head"><div><h2>In the church</h2><div class="ch-panel-sub" id="chRosterCount"></div></div><button class="ch-x" id="chRosterClose" type="button" aria-label="Close">✕</button></header>
        <div class="ch-mine">
          <div class="ch-moods" role="group" aria-label="Your mood">${CH_MOODS.map((m) => `<button type="button" class="ch-mood" data-mood="${m.id}" aria-pressed="false">${m.emoji} ${m.label}</button>`).join("")}</div>
          <button class="ch-tool" type="button" id="chCandleBtn" aria-pressed="false">🕯 Light a candle</button>
        </div>
        <ul class="ch-roster-list" id="chRosterList"></ul>
      </section>
      <section class="ch-panel" id="chChat" hidden aria-label="Church chat">
        <button class="ch-grab" type="button" aria-label="Slide down to close"></button>
        <header class="ch-panel-head"><div><h2>Church chat</h2><div class="ch-panel-sub" id="chChatCount"></div></div><button class="ch-x" id="chChatClose" type="button" aria-label="Close">✕</button></header>
        <div class="ch-msgs" id="chMsgs" aria-live="polite"></div>
        <form class="ch-chat-form" id="chForm" autocomplete="off"><input id="chInput" maxlength="200" placeholder="Say something kind…" aria-label="Message to the church"><button type="submit">Send</button></form>
      </section>
    </div>
    <div class="ch-tools">
      <button class="ch-tool" type="button" id="chBibleBtn">📖 Bible</button>
      <button class="ch-tool" type="button" id="chMusicBtn" aria-pressed="false">♪ Music off</button>
      <button class="ch-tool" type="button" id="chTrack">Vespers</button>
      <label class="ch-vol">Volume <input type="range" id="chVol" min="0" max="100" step="1" aria-label="Music volume"></label>
      <label class="ch-toggle"><input type="checkbox" id="chAmbient"> Hum and bells</label>
    </div>`;
  document.body.appendChild(root);
  return root;
}

function chPaintPeople() {
  const box = chRoot && chRoot.querySelector("#chPeople"); if (!box) return;
  const entries = Object.entries(chPeople).filter(([, p]) => p);
  const seated = {};
  const html = entries.map(([id, p]) => {
    const key = p.seat && PEWS.some((x) => x.id === p.seat) ? p.seat : "back";
    const n = (seated[key] = (seated[key] || 0) + 1) - 1;
    const pew = PEWS.find((x) => x.id === key);
    const left = pew ? pct(SC_X + pew.x + 14 + n * 28, SC_W) : pct(SC_X + 120 + (n % 6) * 26 + (Math.floor(n / 6) * 6), SC_W);
    const top = pew ? pct(pew.y - 16, VB_H) : pct(BACK_ROW.y + (Math.floor(n / 6)) * 6, VB_H);
    const me = id === chMe.id;
    const name = me ? "You" : (p.name || "Visitor");
    return `<div class="ch-person${me ? " me" : ""}${p.away ? " away" : ""}" style="left:${left};top:${top};--pc:${chEsc(p.color || "#c2410c")}" data-id="${chEsc(id)}" role="img" aria-label="${chEsc(name)}${pew ? ", sitting" : ", standing"}">
      <span class="ch-fig" aria-hidden="true"></span>${p.candle ? '<span class="ch-candle" aria-hidden="true"></span>' : ""}${CH_MOODS.find((m) => m.id === p.mood) ? `<span class="ch-mood-tag" aria-hidden="true">${CH_MOODS.find((m) => m.id === p.mood).emoji}</span>` : ""}<span class="ch-name">${chEsc(name)}</span></div>`;
  }).join("");
  box.innerHTML = html;
  const count = entries.length;
  const cEl = chRoot.querySelector("#chCount");
  if (cEl) cEl.textContent = count === 1 ? "Only you are here" : `${count} people here`;
  chPaintFoot(entries);
}

// ---------------------------------------------------------------- congregation dock, roster and chat (soy-v76)
function CH_SEAT_NAME(id) {
  const pew = id && PEWS.find((x) => x.id === id);
  return pew ? `${pew.id[0] === "L" ? "Left" : "Right"} pew ${Number(pew.id[1]) + 1}` : "Standing at the back";
}
function chOrdered(entries) {
  return [...entries].sort(([a], [b]) => (a === chMe.id ? -1 : b === chMe.id ? 1 : 0));
}
const CH_MOODS = [
  { id: "grateful", emoji: "🙏", label: "Grateful" },
  { id: "peaceful", emoji: "🕊", label: "Peaceful" },
  { id: "joyful", emoji: "🎶", label: "Joyful" },
  { id: "reflective", emoji: "💭", label: "Reflective" },
  { id: "hopeful", emoji: "🌅", label: "Hopeful" },
];
const CH_WAVE_GAP = 30000;   // one wave per person every 30 seconds
const chWaves = {};          // target id -> when we last waved to them
let chMood = "", chCandle = false, chWaveT = 0, chBannerT = 0;
function chWaveWait(id) { return Date.now() - (chWaves[id] || 0) < CH_WAVE_GAP; }
function chRefreshRoster() { if (chRoot) chPaintFoot(Object.entries(chPeople).filter(([, p]) => p)); }
function chOnPoke(m) {
  if (!m || !chRoot || !chMe || m.to !== chMe.id) return;
  const box = chRoot.querySelector("#chWave");
  box.textContent = `${String(m.name || "Someone").slice(0, 30)} waved to you 👋`;
  box.hidden = false;
  clearTimeout(chBannerT); chBannerT = setTimeout(() => { box.hidden = true; }, 4000);
  try { if (navigator.vibrate) navigator.vibrate([80, 60, 80]); } catch { /* not supported */ }
}
function chSendWave(id) {
  if (!chLive || !chMe || !id || chWaveWait(id)) return;
  chWaves[id] = Date.now();
  try { chLive.poke({ to: id, from: chMe.id, name: chMe.name }); } catch { /* channel closed */ }
  chRefreshRoster();
  clearTimeout(chWaveT); chWaveT = setTimeout(chRefreshRoster, CH_WAVE_GAP + 50);
}
function chSetMood(id) {
  chMood = chMood === id ? "" : id;
  chPaintMine();
  if (chLive) chLive.track({ mood: chMood });
}
function chSetCandle(on) {
  chCandle = on;
  chPaintMine();
  if (chLive) chLive.track({ candle: chCandle });
}
function chPaintMine() {
  if (!chRoot) return;
  chRoot.querySelectorAll(".ch-mood").forEach((b) => {
    const on = b.dataset.mood === chMood;
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
  });
  const c = chRoot.querySelector("#chCandleBtn");
  c.classList.toggle("on", chCandle); c.setAttribute("aria-pressed", String(chCandle));
  c.textContent = chCandle ? "🕯 Put out candle" : "🕯 Light a candle";
}
function chPaintFoot(entries) {
  if (!chRoot) return;
  const ordered = chOrdered(entries);
  const n = ordered.length;
  const label = n === 1 ? "Only you" : `${n} online`;
  chRoot.querySelector("#chFaces").innerHTML = ordered.slice(0, 6).map(([id, p]) =>
    `<span class="ch-face${id === chMe.id ? " me" : ""}" title="${chEsc(id === chMe.id ? "You" : p.name || "Visitor")}" style="--pc:${chEsc(p.color || "#c2410c")}"><i class="ch-live-dot" aria-hidden="true"></i></span>`
  ).join("") + (n > 6 ? `<span class="ch-face more">+${n - 6}</span>` : "");
  chRoot.querySelector("#chWhoTxt").textContent = label;
  chRoot.querySelector("#chRosterCount").textContent = label;
  chRoot.querySelector("#chChatCount").textContent = `${n} here`;
  chRoot.querySelector("#chRosterList").innerHTML = ordered.map(([id, p]) => {
    const me = id === chMe.id;
    const name = me ? "You" : (p.name || "Visitor");
    const mood = CH_MOODS.find((m) => m.id === p.mood);
    const waited = !me && chWaveWait(id);
    const candle = p.candle ? ' <span class="ch-row-candle" aria-label="candle lit">🕯</span>' : "";
    const where = CH_SEAT_NAME(p.seat) + (mood ? " · " + mood.emoji + " " + mood.label : "");
    const wave = me ? "" : `<button class="ch-wave-btn" type="button" data-wave="${chEsc(id)}"${waited ? " disabled" : ""}>${waited ? "Waved" : "Wave"}</button>`;
    return `<li class="ch-row${me ? " me" : ""}"><span class="ch-face" style="--pc:${chEsc(p.color || "#c2410c")}"></span><span class="ch-row-main"><span class="ch-row-name">${chEsc(name)}${candle}</span><span class="ch-row-where">${chEsc(where)}</span></span><span class="ch-row-online${p.away ? " away" : ""}"><i class="ch-live-dot" aria-hidden="true"></i>${p.away ? "Away" : "Online"}</span>${wave}</li>`;
  }).join("") || `<li class="ch-row-empty">Only you are here.</li>`;
}
const CH_SHEET = () => window.matchMedia("(max-width: 600px)").matches;
function chSetPanel(el, on) {
  clearTimeout(el._t);
  if (on) { el.classList.remove("sheet-out"); el.hidden = false; return; }
  if (el.hidden) return;
  if (CH_SHEET()) {
    el.classList.add("sheet-out");
    el._t = setTimeout(() => { el.hidden = true; el.classList.remove("sheet-out"); }, 240);
  } else el.hidden = true;
}
function chShowPanel(which) {
  if (!chRoot) return;
  chPanel = which;
  chSetPanel(chRoot.querySelector("#chRoster"), which === "who");
  chSetPanel(chRoot.querySelector("#chChat"), which === "chat");
  chRoot.querySelector("#chWhoBtn").setAttribute("aria-expanded", String(which === "who"));
  chRoot.querySelector("#chChatBtn").setAttribute("aria-expanded", String(which === "chat"));
  if (which === "chat") {
    chUnread = 0; chPaintBadge(); chRenderMsgs();
    setTimeout(() => { const i = chRoot && chRoot.querySelector("#chInput"); if (i && chPanel === "chat") i.focus({ preventScroll: true }); }, 0);
  }
}
function chToggle(which) { chShowPanel(chPanel === which ? null : which); }
function chPaintBadge() {
  const b = chRoot && chRoot.querySelector("#chBadge"); if (!b) return;
  b.textContent = chUnread > 99 ? "99+" : String(chUnread); b.hidden = chUnread === 0;
}
function chKey(e) { if (chOpen && chPanel && e.key === "Escape") { e.preventDefault(); chShowPanel(null); } }
function chOnChat(m) {
  if (!m || typeof m.text !== "string" || !m.text.trim()) return;
  chMsgs.push({ from: String(m.from || ""), name: String(m.name || "Visitor"), color: m.color, text: m.text.slice(0, 200), t: m.t || Date.now() });
  if (chMsgs.length > 80) chMsgs.shift();
  if (!chRoot) return;
  if (chPanel !== "chat") { chUnread++; chPaintBadge(); }
  chRenderMsgs();
}
function chRenderMsgs() {
  const box = chRoot && chRoot.querySelector("#chMsgs"); if (!box) return;
  box.innerHTML = chMsgs.length
    ? chMsgs.map((m) => {
        const mine = m.from === chMe.id;
        return `<div class="ch-chatmsg${mine ? " me" : ""}"><span class="ch-msg-who" style="--pc:${chEsc(m.color || "#c2410c")}">${mine ? "You" : chEsc(m.name)}</span><span class="ch-msg-text">${chEsc(m.text)}</span></div>`;
      }).join("")
    : `<p class="ch-msgs-empty">Quiet, as a church should be. Say something kind.</p>`;
  box.scrollTop = box.scrollHeight;
}
function chSend(raw) {
  const text = String(raw || "").trim().slice(0, 200);
  if (!text || !chLive || !chMe) return;
  const now = Date.now();
  if (now - chLastSent < 700) return; // gentle flood guard
  chLastSent = now;
  const m = { from: chMe.id, name: chMe.name, color: chMe.color, text, t: now };
  chMsgs.push(m); if (chMsgs.length > 80) chMsgs.shift();
  chRenderMsgs();
  try { chLive.say(m); } catch { /* channel closed */ }
}

// Depth: pointer or finger movement shifts the far walls and the near nave by different amounts.
function chParallax(stage) {
  if (reducedMotion()) return;
  const set = (x) => {
    const r = stage.getBoundingClientRect();
    const px = Math.max(-1, Math.min(1, ((x - r.left) / r.width) * 2 - 1));
    stage.style.setProperty("--px", px.toFixed(3));
  };
  stage.addEventListener("pointermove", (e) => set(e.clientX));
  stage.addEventListener("pointerleave", () => stage.style.setProperty("--px", "0"));
}
function chSetSeatLabels() {
  if (!chRoot) return;
  chRoot.querySelectorAll(".ch-pew[data-pew]").forEach((b) => {
    const id = b.dataset.pew;
    const mine = chSeat === id;
    b.classList.toggle("mine", mine);
    b.setAttribute("aria-pressed", String(mine));
  });
}

function chSit(id) {
  chSeat = chSeat === id ? null : id;
  chSetSeatLabels();
  if (chLive) chLive.track({ seat: chSeat });
}

// Presence: name, colour and seat are the only things shared. Nothing about the room they came from.
function chOnPresence(map) {
  const prev = chPeople;
  chPeople = {};
  for (const [id, p] of Object.entries(map || {})) {
    if (!p) continue;
    chPeople[id] = { name: p.name, color: p.color, seat: p.seat || null, away: !!p.away, mood: p.mood || "", candle: !!p.candle };
  }
  // Door sounds for others coming and going (quiet). Skip the first sync so opening the church is silent.
  if (chSynced) {
    const others = (m) => Object.keys(m).filter((k) => k !== chMe.id);
    const came = others(chPeople).some((k) => !(k in prev));
    const went = others(prev).some((k) => !(k in chPeople));
    if (came) chDoor(true, 0.35);
    else if (went) chDoor(false, 0.35);
  }
  chSynced = true;
  chPaintPeople();
}

function chPresenceSet() { // used when the screen opens
  const ok = !!chApi && typeof chApi.church === "function";
  return ok;
}

// ---------------------------------------------------------------- open and close
function openChurch({ me, api, boardEl, onLeave, boardId }) {
  if (chOpen) return;
  chBoardId = boardId || "room";
  chMe = me; chApi = api; chOnLeave = onLeave || (() => {}); chBoardEl = boardEl || null;
  if (!chPresenceSet()) { console.warn("church: live API missing"); return; }
  if (!chRoot) {
    chRoot = chBuildRoot();
    chRoot.querySelector("#chBack").addEventListener("click", () => chLeave(true));
    chRoot.querySelector("#chDoor").addEventListener("click", () => chLeave(true));
    chRoot.querySelector("#chLectern").addEventListener("click", () => openBible());
    chRoot.querySelector("#chBibleTop").addEventListener("click", () => openBible());
    chRoot.querySelector("#chBibleBtn").addEventListener("click", () => openBible());
    chRoot.querySelector("#chMusicBtn").addEventListener("click", () => {
      if (chMus.on) { chSet(CH_KEY.music, false); chMusicStop(); }
      else { chSet(CH_KEY.music, true); chMusicStart(); }
    });
    chRoot.querySelector("#chTrack").addEventListener("click", () => chMusicNextTrack());
    const vol = chRoot.querySelector("#chVol");
    vol.value = Math.round(chMus.vol * 100);
    vol.addEventListener("input", () => chMusicSetVol(Number(vol.value)));
    chRoot.querySelectorAll(".ch-pew[data-pew]").forEach((b) => b.addEventListener("click", () => chSit(b.dataset.pew)));
    chParallax(chRoot.querySelector("#chStage"));
    chRoot.querySelector("#chWhoBtn").addEventListener("click", () => chToggle("who"));
    chRoot.querySelector("#chChatBtn").addEventListener("click", () => chToggle("chat"));
    chRoot.querySelector("#chChatClose").addEventListener("click", () => chShowPanel(null));
    chRoot.querySelector("#chRosterClose").addEventListener("click", () => chShowPanel(null));
    chRoot.querySelectorAll(".ch-mood").forEach((b) => b.addEventListener("click", () => chSetMood(b.dataset.mood)));
    chRoot.querySelector("#chCandleBtn").addEventListener("click", () => chSetCandle(!chCandle));
    chRoot.querySelector("#chRosterList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-wave]"); if (b) chSendWave(b.dataset.wave);
    });
    chRoot.querySelectorAll(".ch-grab").forEach((g) => {
      let y0 = null;
      g.addEventListener("pointerdown", (e) => { y0 = e.clientY; try { g.setPointerCapture(e.pointerId); } catch { /* ok */ } });
      g.addEventListener("pointerup", (e) => {
        if (y0 === null) return;
        const dy = e.clientY - y0; y0 = null;
        if (dy > 30 || Math.abs(dy) < 10) chShowPanel(null); // swipe down or tap closes the sheet
      });
    });
    chRoot.querySelector("#chForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const i = chRoot.querySelector("#chInput"); chSend(i.value); i.value = "";
    });
    document.addEventListener("keydown", chKey);
    const amb = chRoot.querySelector("#chAmbient");
    amb.checked = chGet(CH_KEY.ambient, false) === true;
    amb.addEventListener("change", () => {
      chSet(CH_KEY.ambient, amb.checked);
      if (amb.checked && chOpen) chAmbientOn(); else chAmbientOff();
    });
  }
  chOpen = true; chSynced = false; chPeople = {}; chSeat = null;
  chMsgs = []; chUnread = 0; chShowPanel(null); chPaintMine();
  if (chBoardEl) chBoardEl.hidden = true;
  chRoot.hidden = false;
  chSetSeatLabels();
  chPaintPeople();
  try { history.pushState({ pinnedChurch: 1 }, ""); chPushed = true; } catch { chPushed = false; }
  chDoor(true);
  chRoot.classList.remove("closing"); chRoot.classList.add("opening");
  setTimeout(() => chRoot && chRoot.classList.remove("opening"), 1400);
  chLive = chApi.church(chMe, { onPresence: chOnPresence, onChat: chOnChat, onPoke: chOnPoke }, chBoardId);
  chLive.track({ name: chMe.name, color: chMe.color, seat: null, away: false, mood: chMood, candle: chCandle });
  chLastAct = Date.now(); chIsAway = false;
  ["pointerdown", "pointermove", "keydown"].forEach((t) => chRoot.addEventListener(t, chTouch, { passive: true }));
  clearInterval(chIdleT);
  chIdleT = setInterval(() => {
    if (!chIsAway && chLive && Date.now() - chLastAct > CH_IDLE_MS) { chIsAway = true; chLive.track({ away: true }); }
  }, 15000);
  if (chGet(CH_KEY.ambient, false) === true) chAmbientOn();
  if (chGet(CH_KEY.music, true) === true) chMusicStart(); else chMusicUi();
  chRoot.querySelector("#chBack").focus({ preventScroll: true });
}

function chLeave(fromUi) {
  if (!chOpen) return;
  if (fromUi && chPushed) { chPushed = false; try { history.back(); } catch { /* ignore */ } }
  else chPushed = false;
  chDoor(false);
  chRoot.classList.remove("opening"); chRoot.classList.add("closing");
  setTimeout(() => chRoot && chRoot.classList.remove("closing"), 1400);
  chOpen = false;
  chAmbientOff();
  chMusicStop();
  chCloseBible();
  try { if (chLive && chLive.close) chLive.close(); } catch { /* channel already closed */ }
  chLive = null; chPeople = {}; chSeat = null; chCandle = false;
  chShowPanel(null); chMsgs = [];
  clearInterval(chIdleT); chIdleT = 0; chIsAway = false;
  chRoot.hidden = true;
  if (chBoardEl) chBoardEl.hidden = false;
  chOnLeave();
}

// Browser back also goes to the board, never out of the app.
addEventListener("popstate", () => { if (chOpen) chLeave(false); });

// ---------------------------------------------------------------- Bible
const CH_ALIAS = { jn: "john", jhn: "john", ps: "psalms", psa: "psalms", rom: "romans", gen: "genesis", mt: "matthew", mk: "mark", lk: "luke", rev: "revelation" };
const CH_SIZES = { s: "Small", m: "Medium", l: "Large" };

async function chManifest() {
  if (CH_BIBLE.manifest) return CH_BIBLE.manifest;
  const res = await fetch("bible/manifest.json");
  if (!res.ok) throw new Error("manifest");
  CH_BIBLE.manifest = await res.json();
  return CH_BIBLE.manifest;
}
function chIncluded(m) { return m.translations.filter((t) => t.status === "included"); }

async function chLoadTr(entry) {
  if (CH_BIBLE.data.has(entry.id)) return CH_BIBLE.data.get(entry.id);
  const res = await fetch(entry.file);
  if (!res.ok) throw new Error("file");
  if (!("DecompressionStream" in window)) throw new Error("This browser can't open the Bible text yet.");
  const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const doc = JSON.parse(text);
  CH_BIBLE.data.set(entry.id, doc);
  return doc;
}

function chNorm(s) { return String(s).toLowerCase().replace(/[.’']/g, "").replace(/\s+/g, " ").trim(); }
function chFindBook(doc, key) {
  const k = chNorm(key);
  const alias = CH_ALIAS[k] || k;
  let idx = doc.books.findIndex((b) => chNorm(b.name) === alias || chNorm(b.abbr) === alias);
  if (idx < 0 && alias.length >= 2) idx = doc.books.findIndex((b) => chNorm(b.name).startsWith(alias));
  return idx;
}
// "John 3:16", "Jn 3:16", "1 Cor 13", "Ps 23:1-4", "Genesis 1"
function chParseRef(q, doc) {
  const m = q.trim().match(/^(.+?)\s+(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?$/u);
  if (!m) return null;
  const bi = chFindBook(doc, m[1]); if (bi < 0) return null;
  const chap = Number(m[2]);
  if (chap < 1 || chap > doc.books[bi].chapters.length) return null;
  return { bi, chap, from: m[3] ? Number(m[3]) : null, to: m[4] ? Number(m[4]) : (m[3] ? Number(m[3]) : null) };
}

async function openBible() {
  const sheet = chBuildSheet();
  sheet.hidden = false;
  CH_BIBLE.sheet = sheet;
  const back = sheet.querySelector(".ch-sheet-close"); if (back) back.focus();
  try {
    const m = await chManifest();
    const list = chIncluded(m);
    const savedId = chGet(CH_KEY.bible, null);
    const entry = list.find((t) => t.id === savedId) || list[0];
    await chSelectTr(entry.id, true);
  } catch (e) {
    chSheetMsg("The Bible could not load. Check your connection and try again.");
  }
}

function chCloseBible() {
  if (!CH_BIBLE.sheet) return;
  CH_BIBLE.token++;
  CH_BIBLE.sheet.remove(); CH_BIBLE.sheet = null;
  // return focus to the lectern so keyboard users land back in the church
  const l = chRoot && chRoot.querySelector("#chLectern"); if (l && chOpen) l.focus({ preventScroll: true });
}

function chBuildSheet() {
  if (CH_BIBLE.sheet) CH_BIBLE.sheet.remove();
  const size = chGet(CH_KEY.size, "m");
  const el = document.createElement("section");
  el.className = `ch-sheet sz-${size}`; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "chSheetTitle");
  el.innerHTML = `
    <header class="ch-sheet-bar">
      <h2 id="chSheetTitle" class="ch-sheet-title">Bible</h2>
      <button type="button" class="ch-sheet-close" aria-label="Close the Bible">Close</button>
    </header>
    <div class="ch-sheet-controls">
      <label class="ch-field"><span>Language</span><select id="chLang"></select></label>
      <label class="ch-field"><span>Translation</span><select id="chTr"></select></label>
      <div class="ch-size" role="group" aria-label="Text size">
        ${["s", "m", "l"].map((k) => `<button type="button" data-size="${k}" aria-pressed="${k === size}" class="${k === size ? "on" : ""}" aria-label="${CH_SIZES[k]} text">A<small>${k === "s" ? "−" : k === "m" ? "" : "+"}</small></button>`).join("")}
      </div>
    </div>
    <form class="ch-search" id="chSearch" role="search">
      <input id="chQuery" type="search" placeholder="Reference (John 3:16) or a word" aria-label="Search the Bible by reference or word" autocomplete="off" enterkeyhint="search">
      <button type="submit" class="ch-go">Search</button>
    </form>
    <nav class="ch-crumbs" id="chCrumbs" aria-label="Where you are"></nav>
    <div class="ch-body" id="chBody" tabindex="-1"></div>
    <p class="ch-foot" id="chFoot"></p>`;
  document.body.appendChild(el);

  el.querySelector(".ch-sheet-close").addEventListener("click", () => chCloseBible());
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); chCloseBible(); return; }
    if (e.key === "Tab") { // keep focus inside the sheet
      const f = [...el.querySelectorAll("button, input, select, [tabindex]")].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  el.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.size; chSet(CH_KEY.size, k);
    el.className = `ch-sheet sz-${k}`;
    el.querySelectorAll("[data-size]").forEach((x) => { x.setAttribute("aria-pressed", String(x === b)); x.classList.toggle("on", x === b); });
  }));
  el.querySelector("#chSearch").addEventListener("submit", (e) => { e.preventDefault(); chRunSearch(el.querySelector("#chQuery").value); });
  el.querySelector("#chLang").addEventListener("change", (e) => {
    const first = chIncluded(CH_BIBLE.manifest).find((t) => t.language === e.target.value);
    if (first) chSelectTr(first.id);
  });
  el.querySelector("#chTr").addEventListener("change", (e) => chSelectTr(e.target.value));
  return el;
}

function chSheetMsg(text) {
  const b = CH_BIBLE.sheet && CH_BIBLE.sheet.querySelector("#chBody");
  if (b) b.innerHTML = `<p class="ch-msg">${chEsc(text)}</p>`;
}

async function chSelectTr(id, first = false) {
  const m = await chManifest();
  const list = chIncluded(m);
  const entry = list.find((t) => t.id === id) || list[0];
  CH_BIBLE.tr = entry.id;
  chSet(CH_KEY.bible, entry.id);
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const langs = [...new Set(list.map((t) => t.language))];
  sheet.querySelector("#chLang").innerHTML = langs.map((l) => `<option ${l === entry.language ? "selected" : ""}>${chEsc(l)}</option>`).join("");
  sheet.querySelector("#chTr").innerHTML = list.filter((t) => t.language === entry.language)
    .map((t) => `<option value="${chEsc(t.id)}" ${t.id === entry.id ? "selected" : ""}>${chEsc(t.name)}</option>`).join("");
  sheet.querySelector("#chTitle, #chSheetTitle").textContent = entry.name;
  sheet.querySelector("#chFoot").textContent = `${entry.name} · ${entry.language} · ${entry.year || ""}. ${entry.licence}`.replace(/\s+/g, " ").trim();
  CH_BIBLE.view = "books";
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<p class="ch-msg">Loading ${chEsc(entry.name)}…</p>`;
  const token = ++CH_BIBLE.token;
  try {
    const doc = await chLoadTr(entry);
    if (token !== CH_BIBLE.token && !first) return;
    CH_BIBLE.doc = doc;
    chShowBooks();
  } catch (err) {
    chSheetMsg(err && err.message ? err.message : "This translation could not load.");
  }
}

function chCrumbs(parts) {
  const c = CH_BIBLE.sheet && CH_BIBLE.sheet.querySelector("#chCrumbs"); if (!c) return;
  c.innerHTML = parts.map((p, i) => p.go ? `<button type="button" data-i="${i}">${chEsc(p.label)}</button>` : `<span>${chEsc(p.label)}</span>`).join(" › ");
  c.querySelectorAll("button").forEach((b) => { const p = parts[Number(b.dataset.i)]; b.addEventListener("click", p.go); });
}

function chShowBooks() {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  CH_BIBLE.view = "books";
  chCrumbs([{ label: "Books" }]);
  const doc = CH_BIBLE.doc;
  const group = (t, label) => `<h3 class="ch-h">${label}</h3><div class="ch-grid books">${doc.books.map((b, i) => b.testament === t ? `<button type="button" data-b="${i}">${chEsc(b.name)}<small>${b.chapters.length}</small></button>` : "").join("")}</div>`;
  const body = sheet.querySelector("#chBody");
  body.innerHTML = group("OT", "Old Testament") + group("NT", "New Testament");
  body.scrollTop = 0;
  body.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => chShowChapters(Number(b.dataset.b))));
}

function chShowChapters(bi) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const book = CH_BIBLE.doc.books[bi];
  CH_BIBLE.view = "chapters"; CH_BIBLE.book = bi;
  chCrumbs([{ label: "Books", go: () => chShowBooks() }, { label: book.name }]);
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<h3 class="ch-h">${chEsc(book.name)}</h3><div class="ch-grid chaps">${book.chapters.map((_, i) => `<button type="button" data-c="${i + 1}">${i + 1}</button>`).join("")}</div>`;
  body.scrollTop = 0;
  body.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => chShowChapter(bi, Number(b.dataset.c))));
}

function chShowChapter(bi, chap, highlight = null) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const doc = CH_BIBLE.doc, book = doc.books[bi];
  if (chap < 1 || chap > book.chapters.length) return;
  CH_BIBLE.view = "reader"; CH_BIBLE.book = bi; CH_BIBLE.chap = chap; CH_BIBLE.sel = null;
  chCrumbs([{ label: "Books", go: () => chShowBooks() }, { label: book.name, go: () => chShowChapters(bi) }, { label: String(chap) }]);
  const verses = book.chapters[chap - 1];
  const body = sheet.querySelector("#chBody");
  const prevOk = chap > 1, nextOk = chap < book.chapters.length;
  body.innerHTML = `
    <div class="ch-readhead"><h3 class="ch-h">${chEsc(book.name)} ${chap}</h3></div>
    <div class="ch-verses" id="chVerses">${verses.map((t, i) => `<span class="ch-v" data-v="${i + 1}" id="v${i + 1}"><sup>${i + 1}</sup> ${chEsc(t)}</span> `).join("")}</div>
    <div class="ch-selbar" id="chSelBar" hidden><span id="chSelRef"></span><button type="button" id="chCopy">Copy reference</button></div>
    <div class="ch-pager">
      <button type="button" id="chPrev" ${prevOk ? "" : "disabled"}>‹ Previous chapter</button>
      <button type="button" id="chNext" ${nextOk ? "" : "disabled"}>Next chapter ›</button>
    </div>`;
  body.scrollTop = 0;
  body.querySelectorAll(".ch-v").forEach((v) => v.addEventListener("click", () => chSelectVerse(Number(v.dataset.v))));
  body.querySelector("#chPrev").addEventListener("click", () => chShowChapter(bi, chap - 1));
  body.querySelector("#chNext").addEventListener("click", () => chShowChapter(bi, chap + 1));
  body.querySelector("#chCopy").addEventListener("click", () => chCopyRef());
  if (highlight) {
    const hv = body.querySelector(`#v${highlight.from || 1}`);
    if (hv) { hv.classList.add("hit"); hv.scrollIntoView({ block: "center" }); }
  }
  // swipe left / right to change chapter
  let x0 = null;
  body.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
  body.ontouchend = (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) < 70) return;
    if (dx < 0 && nextOk) chShowChapter(bi, chap + 1);
    if (dx > 0 && prevOk) chShowChapter(bi, chap - 1);
  };
}

function chSelectVerse(n) {
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  const book = CH_BIBLE.doc.books[CH_BIBLE.book];
  CH_BIBLE.sel = n;
  sheet.querySelectorAll(".ch-v").forEach((v) => v.classList.toggle("sel", Number(v.dataset.v) === n));
  const bar = sheet.querySelector("#chSelBar");
  bar.hidden = false;
  sheet.querySelector("#chSelRef").textContent = `${book.name} ${CH_BIBLE.chap}:${n}`;
}

async function chCopyRef() {
  const sheet = CH_BIBLE.sheet; if (!sheet || !CH_BIBLE.sel) return;
  const book = CH_BIBLE.doc.books[CH_BIBLE.book];
  const text = `${book.name} ${CH_BIBLE.chap}:${CH_BIBLE.sel}`;
  try { await navigator.clipboard.writeText(text); sheet.querySelector("#chCopy").textContent = "Copied"; }
  catch { sheet.querySelector("#chCopy").textContent = text; }
}

// Search: references jump to the chapter; words list matching verses (up to 100), scanned in small steps.
async function chRunSearch(raw) {
  const q = String(raw || "").trim();
  if (!q || !CH_BIBLE.doc) return;
  const doc = CH_BIBLE.doc;
  const token = ++CH_BIBLE.token;
  const ref = chParseRef(q, doc);
  if (ref) {
    chShowChapter(ref.bi, ref.chap, { from: ref.from });
    return;
  }
  const sheet = CH_BIBLE.sheet; if (!sheet) return;
  CH_BIBLE.view = "results";
  chCrumbs([{ label: `Results for “${q.slice(0, 40)}”` }]);
  const body = sheet.querySelector("#chBody");
  body.innerHTML = `<p class="ch-msg">Searching…</p>`;
  const needle = chNorm(q);
  const words = needle.split(" ").filter(Boolean);
  const hits = [];
  let scanned = 0;
  outer: for (let bi = 0; bi < doc.books.length; bi++) {
    const b = doc.books[bi];
    for (let ci = 0; ci < b.chapters.length; ci++) {
      const vs = b.chapters[ci];
      for (let vi = 0; vi < vs.length; vi++) {
        const t = vs[vi];
        scanned++;
        const low = chNorm(t);
        if (words.every((w) => low.includes(w))) {
          hits.push({ bi, ci: ci + 1, vi: vi + 1, t });
          if (hits.length >= 100) break outer;
        }
        if (scanned % 2500 === 0) {
          await new Promise((r) => setTimeout(r, 0));
          if (token !== CH_BIBLE.token) return;
        }
      }
    }
  }
  if (token !== CH_BIBLE.token) return;
  if (!hits.length) { body.innerHTML = `<p class="ch-msg">No verses found for “${chEsc(q)}”.</p>`; return; }
  const hl = (t) => {
    let out = chEsc(t);
    for (const w of words) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), (m) => `<b>${m}</b>`);
    return out;
  };
  body.innerHTML = `<p class="ch-msg">${hits.length}${hits.length >= 100 ? "+" : ""} verse${hits.length === 1 ? "" : "s"}</p>` +
    hits.map((h) => `<button type="button" class="ch-hit" data-bi="${h.bi}" data-c="${h.ci}" data-v="${h.vi}"><span class="ch-hit-ref">${chEsc(doc.books[h.bi].name)} ${h.ci}:${h.vi}</span>${hl(h.t)}</button>`).join("");
  body.querySelectorAll(".ch-hit").forEach((b) => b.addEventListener("click", () => chShowChapter(Number(b.dataset.bi), Number(b.dataset.c), { from: Number(b.dataset.v) })));
}

// ---------------------------------------------------------------- export
export { openChurch };
export function churchIsOpen() { return chOpen; }
