'use strict';
// All sounds are synthesized with WebAudio, no audio files needed.
const Sound = {
  ctx: null, master: null, sfx: null, music: null, muted: false,

  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.7; this.sfx.connect(this.master);
    this.music = this.ctx.createGain(); this.music.gain.value = 0.16; this.music.connect(this.master);
    this.startMusic();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
  },

  tone(freq, dur, o = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.linearRampToValueAtTime(Math.max(20, freq + o.slide), t + dur);
    const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || this.sfx);
    osc.start(t); osc.stop(t + dur + 0.02);
  },

  noise(dur, o = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass'; f.frequency.value = o.freq || 1200; f.Q.value = o.q || 1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || this.sfx);
    src.start(t); src.stop(t + dur + 0.02);
  },

  blip() { this.tone(620 + Math.random() * 90, 0.035, { type: 'square', vol: 0.035 }); },
  step() { this.noise(0.035, { vol: 0.05, freq: 500, q: 0.7 }); },
  select() { this.tone(660, 0.06, { vol: 0.08 }); this.tone(990, 0.08, { vol: 0.08, delay: 0.05 }); },
  chop() {
    this.noise(0.06, { vol: 0.4, freq: 3200, filter: 'highpass' });
    this.tone(150, 0.08, { type: 'triangle', vol: 0.4, slide: -90 });
  },
  clank() {
    this.tone(523, 0.25, { type: 'triangle', vol: 0.18 });
    this.tone(1046, 0.18, { type: 'square', vol: 0.04 });
    this.noise(0.05, { vol: 0.2, freq: 4000 });
  },
  bubble() { this.tone(260 + Math.random() * 260, 0.07, { type: 'sine', vol: 0.12, slide: 420 }); },
  scrub() { this.noise(0.07, { vol: 0.07, freq: 2600 + Math.random() * 1500, q: 2 }); },
  whoosh() { this.noise(0.25, { vol: 0.12, freq: 900, q: 0.6 }); },
  click() { this.tone(1400, 0.02, { vol: 0.06 }); },
  error() { this.tone(180, 0.18, { type: 'sawtooth', vol: 0.08, slide: -60 }); },
  sparkle() {
    [1568, 2093, 2637].forEach((f, i) => this.tone(f, 0.12, { type: 'triangle', vol: 0.07, delay: i * 0.06 }));
  },
  success() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, { type: 'square', vol: 0.07, delay: i * 0.09 }));
    this.tone(1046, 0.5, { type: 'triangle', vol: 0.12, delay: 0.36 });
  },
  fanfare() {
    const n = [[523, 0], [523, .12], [523, .24], [659, .36], [784, .6], [659, .84], [784, .96], [1046, 1.2]];
    n.forEach(([f, d]) => this.tone(f, 0.22, { type: 'square', vol: 0.08, delay: d }));
    this.tone(1046, 0.9, { type: 'triangle', vol: 0.14, delay: 1.2 });
    [262, 330, 392].forEach(f => this.tone(f, 1.6, { type: 'triangle', vol: 0.06, delay: 1.2 }));
  },

  // Cozy little chiptune loop (C – Am – F – G).
  startMusic() {
    const mel = [
      72, 76, 79, 76, 74, 72, 74, 76, 72, 0, 69, 72, 76, 0, 74, 72,
      69, 72, 77, 76, 74, 72, 69, 0, 71, 74, 79, 77, 76, 74, 71, 74,
      76, 79, 84, 79, 76, 74, 72, 0, 69, 72, 76, 74, 72, 69, 72, 74,
      77, 76, 74, 72, 69, 72, 74, 77, 79, 77, 76, 74, 71, 0, 67, 0,
    ];
    const bass = [48, 55, 52, 55, 45, 52, 48, 52, 41, 48, 45, 48, 43, 50, 47, 50];
    const stepDur = 60 / 92 / 2;
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    let step = 0, next = this.ctx.currentTime + 0.2;
    setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      while (next < this.ctx.currentTime + 0.15) {
        const delay = next - this.ctx.currentTime;
        const m = mel[step % mel.length];
        if (m) this.tone(midi(m), stepDur * 0.9, { type: 'square', vol: 0.05, delay, dest: this.music });
        if (step % 2 === 0) {
          const b = bass[(step / 2) % bass.length];
          this.tone(midi(b), stepDur * 1.8, { type: 'triangle', vol: 0.22, delay, dest: this.music });
        }
        if (step % 4 === 2) this.noise(0.03, { vol: 0.04, freq: 7000, filter: 'highpass', delay, dest: this.music });
        step++; next += stepDur;
      }
    }, 30);
  },
};
