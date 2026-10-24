'use strict';
// The three station mini-games. Each draws into a 200x120 pixel scene (shown at 2x).
const SW = 200, SH = 120;

class MiniGame {
  constructor() { this.t = 0; this.finished = false; this.fx = []; this.shake = 0; this.pops = []; }
  pop(text, x, y, col = '#ffffff') { this.pops.push({ text, x, y, col, life: 0.8 }); }
  burst(x, y, cols, n = 8, speed = 60) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
      this.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 160, life: 0.5 + Math.random() * 0.4, col: cols[i % cols.length], s: 2 });
    }
  }
  stepFx(dt) {
    this.t += dt;
    this.shake = Math.max(0, this.shake - dt);
    for (const f of this.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; f.life -= dt; }
    this.fx = this.fx.filter(f => f.life > 0);
    for (const q of this.pops) { q.y -= 18 * dt; q.life -= dt; }
    this.pops = this.pops.filter(q => q.life > 0);
  }
  drawFx(p, ctx) {
    for (const f of this.fx) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      p.rect(f.x, f.y, f.s, f.s, f.col);
    }
    ctx.globalAlpha = 1;
    for (const q of this.pops) {
      ctx.globalAlpha = Math.min(1, q.life * 2.5);
      const w = textWidth(q.text, 2);
      p.text(q.text, q.x - w / 2 + 1, q.y + 1, '#2b1b16', 2).text(q.text, q.x - w / 2, q.y, q.col, 2);
    }
    ctx.globalAlpha = 1;
  }
  finish(msg) { this.finished = true; this.doneMsg = msg; Sound.success(); }
}

// ------------------------------------------------------------- Gemüse schnibbeln
class CutGame extends MiniGame {
  constructor() {
    super();
    this.title = 'Gemüse schnibbeln';
    this.veggies = [
      { name: 'Karotte', body: '#ee8a2a', dark: '#c96a14', light: '#f8b06a', inner: '#ffc98a', len: 104, th: 12, greens: '#4f9a2f' },
      { name: 'Zucchini', body: '#4f8a35', dark: '#3a6a26', light: '#78b35a', inner: '#e9f0c4', len: 112, th: 14 },
      { name: 'Lauch', body: '#e6edd0', dark: '#b9c79a', light: '#ffffff', inner: '#f6f8e6', len: 116, th: 12, tip: '#5d9a3c' },
    ];
    this.cuts = 8;
    this.vi = 0; this.bowl = [];
    this.newVeg();
  }
  newVeg() {
    const v = this.veggies[this.vi];
    this.v = v; this.n = 0; this.knifeT = 0; this.slide = -1; this.enter = 1;
    this.vx = 18; this.vy = 58 - v.th / 2;
    const segW = v.len / (this.cuts + 1);
    this.segs = [];
    for (let i = 0; i <= this.cuts; i++) this.segs.push({ x0: i * segW, w: segW, off: 0, target: 0, cut: false });
  }
  get hint() { return this.slide >= 0 ? 'Ab in die Schüssel!' : 'ENTER drücken zum Schneiden – so schnell du willst!'; }
  get progress() { return `${this.v.name}  ${this.n}/${this.cuts}   ·   Gemüse ${Math.min(this.vi + 1, 3)}/3`; }
  nextCutX() { return this.vx + this.v.len - (this.n + 1) * this.v.len / (this.cuts + 1); }
  update(dt) {
    this.stepFx(dt);
    if (this.finished) return;
    this.enter = Math.max(0, this.enter - dt * 3);
    this.knifeT = Math.max(0, this.knifeT - dt);
    for (const s of this.segs) s.off += (s.target - s.off) * Math.min(1, dt * 18);
    if (this.slide >= 0) {
      this.slide += dt * 1.6;
      if (this.slide >= 1) {
        for (let i = 0; i < 9; i++) this.bowl.push({ x: (Math.random() - 0.5) * 22, y: (Math.random() - 0.5) * 6, c: [this.v.body, this.v.inner, this.v.light][i % 3] });
        Sound.whoosh();
        this.vi++;
        if (this.vi >= this.veggies.length) return this.finish('Alles geschnibbelt! Die Schüssel ist voll.');
        this.newVeg();
      }
      return;
    }
    if (Input.hit('ok') && this.enter <= 0 && this.knifeT < 0.05) {
      const cx = this.nextCutX();
      const idx = this.cuts - this.n;
      this.segs[idx].cut = true;
      for (let i = idx; i < this.segs.length; i++) this.segs[i].target += 3;
      this.n++; this.knifeT = 0.11; this.shake = 0.08;
      Sound.chop();
      this.burst(cx, this.vy + this.v.th / 2, [this.v.inner, this.v.body, '#ffffff'], 7, 55);
      if (Math.random() < 0.45) this.pop(['TSCHAK!', 'ZACK!', 'SCHNIPP!', 'HACK!'][Math.floor(Math.random() * 4)], cx, this.vy - 22, '#fff2a8');
      if (this.n >= this.cuts) { this.slide = 0; this.pop('SUPER!', 100, 22, '#9ff29f'); Sound.sparkle(); }
    }
  }
  draw(p, ctx) {
    p.rect(0, 0, SW, SH, '#d9a868');
    for (let x = 0; x < SW; x += 10) p.rect(x, 0, 1, SH, '#c99858');
    p.rect(6, 28, 146, 64, '#7a4f2e').rect(7, 28, 144, 62, '#efcf98').rect(7, 28, 144, 2, '#f8e2b8');
    for (let i = 0; i < 6; i++) p.rect(14 + i * 22, 40 + (i % 3) * 14, 12, 1, '#e2bd82');
    p.ellipse(176, 82, 20, 9, '#2b1b16').ellipse(176, 81, 19, 8, '#e9e4d8').ellipse(176, 80, 15, 5, '#c9c2b2');
    for (const b of this.bowl) p.rect(176 + b.x, 79 + b.y, 3, 2, b.c);
    p.ellipse(176, 84, 18, 3, '#f7f3ea');

    const v = this.v, enterOff = Math.round(-this.enter * 160);
    const slideX = this.slide >= 0 ? this.slide * 150 : 0, slideY = this.slide >= 0 ? Math.sin(this.slide * Math.PI) * -24 + this.slide * 20 : 0;
    const sh = this.shake > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0;
    for (let i = 0; i < this.segs.length; i++) {
      const s = this.segs[i];
      const x = Math.round(this.vx + s.x0 + s.off + enterOff + slideX), y = Math.round(this.vy + slideY + sh);
      const w = Math.ceil(s.w), th = v.th;
      const isTip = i === 0, isEnd = i === this.segs.length - 1;
      ctx.globalAlpha = this.slide > 0.85 ? (1 - this.slide) * 6 : 1;
      p.rect(x, y + th, w, 2, 'rgba(90,50,20,0.25)');
      if (isTip && v.name === 'Karotte') {
        for (let k = 0; k < w; k++) { const hh = Math.round(th * (0.35 + 0.65 * k / w)); p.rect(x + k, y + (th - hh) / 2, 1, hh, v.body); }
      } else {
        p.rect(x, y, w, th, v.body).rect(x, y + 1, w, 2, v.light).rect(x, y + th - 3, w, 2, v.dark);
      }
      if (isTip && v.tip) p.rect(x, y, Math.min(w, 8), th, v.tip);
      if (s.cut) p.rect(x, y, 2, th, v.inner);
      if (isEnd && v.greens) p.rect(x + w, y + 2, 8, 2, v.greens).rect(x + w, y + th - 4, 9, 2, v.greens).rect(x + w, y + 5, 11, 2, '#6db33f');
      if (isEnd && v.tip) for (let k = 0; k < 5; k++) p.rect(x + w, y + 1 + k * 2.4, 4 + (k % 2) * 3, 1, '#b5a37c');
      if (isTip && v.name === 'Zucchini') p.rect(x - 2, y + 4, 3, th - 8, '#6b4528');
      ctx.globalAlpha = 1;
    }
    if (!this.finished && this.slide < 0 && this.enter <= 0) {
      const kx = Math.round(this.nextCutX());
      const down = this.knifeT > 0 ? 1 : 0;
      const ky = down ? this.vy - 6 : this.vy - 32 + Math.round(Math.sin(this.t * 6));
      p.rect(kx - 1, ky + 12, 12, 22 - down * 4, '#2b1b16').rect(kx, ky + 12, 10, 21 - down * 4, '#d7dde1').rect(kx, ky + 12, 3, 21 - down * 4, '#ffffff');
      p.rect(kx + 1, ky - 4, 7, 17, '#2b1b16').rect(kx + 2, ky - 3, 5, 15, '#5e3c22').dot(kx + 4, ky, '#d9c9a3').dot(kx + 4, ky + 6, '#d9c9a3');
      if (!down) for (let y = this.vy - 2; y < this.vy + v.th + 2; y += 3) p.dot(kx, y, 'rgba(255,255,255,0.7)');
    }
    this.drawFx(p, ctx);
  }
}

// ------------------------------------------------------------- Topf auf den Herd
class StoveGame extends MiniGame {
  constructor(hasVeggies) {
    super();
    this.title = 'Topf auf den Herd';
    this.hasVeggies = hasVeggies;
    this.stage = 'place'; this.k = 0; this.heat = 0; this.stir = 0; this.last = null; this.angle = 0;
    this.px = 168; this.py = 62; this.bubbles = []; this.drops = []; this.soup = 0;
  }
  get hint() {
    return {
      place: 'Drücke ENTER, um den Topf auf die Herdplatte zu stellen.',
      heat: 'Halte → für mehr Hitze, ← für weniger. ENTER, wenn der Zeiger im Grünen ist!',
      boil: this.hasVeggies ? 'Dein geschnibbeltes Gemüse plumpst in den Topf …' : 'Ein paar Tomaten aus dem Vorrat plumpsen in den Topf …',
      stir: 'Umrühren! Drücke abwechselnd ← und →',
    }[this.stage] || '';
  }
  get progress() {
    if (this.stage === 'stir') return `Umrühren ${this.stir}/14`;
    if (this.stage === 'heat') return `Hitze ${Math.round(this.heat * 100)} %`;
    return '';
  }
  update(dt) {
    this.stepFx(dt);
    const hot = this.stage === 'boil' || this.stage === 'stir' || this.finished;
    if (hot && Math.random() < dt * 12) this.bubbles.push({ a: Math.random() * 6.28, d: Math.random() * 16, life: 0.5 });
    for (const b of this.bubbles) b.life -= dt;
    this.bubbles = this.bubbles.filter(b => b.life > 0);
    if (hot && Math.random() < dt * 8) this.fx.push({ x: 50 + Math.random() * 30, y: 40, vx: (Math.random() - 0.5) * 6, vy: -18, g: 0, life: 1.2, col: 'rgba(255,255,255,0.5)', s: 3 });
    if (this.finished) return;

    if (this.stage === 'place') {
      if (this.k > 0) {
        this.k += dt * 1.8;
        const e = Math.min(1, this.k);
        this.px = 168 + (64 - 168) * e; this.py = 62 - Math.sin(e * Math.PI) * 26;
        if (this.k >= 1) { this.px = 64; this.py = 62; Sound.clank(); this.shake = 0.12; this.pop('KLONK!', 64, 18, '#e8eef2'); this.stage = 'heat'; }
      } else if (Input.hit('ok')) { this.k = 0.001; Sound.whoosh(); }
    } else if (this.stage === 'heat') {
      if (Input.down.right || Input.down.up) this.heat = Math.min(1, this.heat + dt * 0.5);
      if (Input.down.left || Input.down.down) this.heat = Math.max(0, this.heat - dt * 0.5);
      if (Input.hit('ok')) {
        if (this.heat < 0.6) { Sound.error(); this.pop('ZU KALT!', 100, 18, '#9fd0ff'); this.shake = 0.15; }
        else if (this.heat > 0.8) { Sound.error(); this.pop('ZU HEISS!', 100, 18, '#ff8a6a'); this.shake = 0.25; this.heat = 0.95; }
        else { Sound.select(); this.pop('PERFEKT!', 100, 18, '#9ff29f'); this.stage = 'boil'; this.k = 0; }
      }
    } else if (this.stage === 'boil') {
      this.k += dt;
      if (Math.random() < dt * 10) Sound.bubble();
      if (this.k > 0.3 && this.drops.length < 18 && Math.random() < dt * 30) {
        const cols = this.hasVeggies ? ['#ee8a2a', '#4f8a35', '#e6edd0'] : ['#e0402f', '#c8392f'];
        this.drops.push({ x: 64 + (Math.random() - 0.5) * 22, y: -6, vy: 40, c: cols[this.drops.length % cols.length], tz: 62 + (Math.random() - 0.5) * 12 });
      }
      this.soup = Math.min(1, this.soup + dt * 0.6);
      if (this.k > 2.2) { this.stage = 'stir'; }
    } else if (this.stage === 'stir') {
      for (const key of ['left', 'right']) {
        if (Input.hit(key) && key !== this.last) {
          this.last = key; this.stir++; this.angle += Math.PI / 3.5; Sound.bubble();
          if (this.stir % 4 === 0) this.pop(['RÜHR!', 'BLUBB!', 'MMMH!'][Math.floor(Math.random() * 3)], 64, 14, '#fff2a8');
          if (this.stir >= 14) { this.finish('Mmmh! Eine duftende Gemüsesuppe köchelt vor sich hin.'); Sound.sparkle(); }
        }
      }
    }
    for (const d of this.drops) { if (d.y < d.tz) { d.y += d.vy * dt; d.vy += 200 * dt; if (d.y >= d.tz) { d.y = d.tz; Sound.bubble(); } } }
  }
  draw(p, ctx) {
    const sh = this.shake > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0;
    p.rect(0, 0, SW, SH, C.steel);
    for (let y = 0; y < SH; y += 12) p.rect(0, y, SW, 1, '#c3cbd0');
    p.rect(10 + sh, 10, 112, 100, '#2b1b16').rect(11 + sh, 11, 110, 98, '#26262b').rect(11 + sh, 11, 110, 2, '#4a4a52');
    p.ring(64 + sh, 62, 30, 30, '#4a3a3e').ring(64 + sh, 62, 24, 24, '#3a2e32');
    p.ring(100 + sh, 32, 12, 12, '#4a3a3e').ring(100 + sh, 92, 12, 12, '#4a3a3e');
    // flames around the burner
    if (this.stage !== 'place') {
      const h = this.stage === 'heat' ? this.heat : 0.7;
      const n = Math.round(6 + h * 18);
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + this.t * 0.6, fl = 2 + Math.round(h * 6 * (0.6 + 0.4 * Math.sin(this.t * 20 + i)));
        const fx = 64 + Math.cos(a) * 29 + sh, fy = 62 + Math.sin(a) * 29;
        p.rect(fx - 1, fy - 1, 3, 3, h > 0.8 ? '#ff5a2a' : '#3d8bff');
        p.rect(fx + Math.cos(a) * fl / 2 - 1, fy + Math.sin(a) * fl / 2 - 1, 2, 2, h > 0.8 ? '#ffd23f' : '#9fd0ff');
      }
    }
    // pot (top view)
    const px = Math.round(this.px) + sh, py = Math.round(this.py);
    p.ellipse(px + 2, py + 3, 26, 26, 'rgba(0,0,0,0.25)');
    p.rect(px - 33, py - 3, 8, 6, '#2b1b16').rect(px + 25, py - 3, 8, 6, '#2b1b16');
    p.ellipse(px, py, 26, 26, '#2b1b16').ellipse(px, py, 25, 25, '#9aa5ad').ellipse(px, py, 21, 21, '#c9d1d6');
    const water = this.soup > 0 ? (this.hasVeggies ? '#e0913c' : '#d9573a') : '#8ec0da';
    p.ellipse(px, py, 19, 19, water).ellipse(px - 6, py - 6, 5, 3, 'rgba(255,255,255,0.35)');
    for (const b of this.bubbles) p.ring(px + Math.cos(b.a) * b.d, py + Math.sin(b.a) * b.d, 2, 2, 'rgba(255,255,255,0.7)');
    for (const d of this.drops) {
      const rx = d.x - 64, ry = d.tz - 62, rot = d.y >= d.tz ? this.angle : 0;
      const x = 64 + rx * Math.cos(rot) - ry * Math.sin(rot), y = d.y >= d.tz ? 62 + rx * Math.sin(rot) + ry * Math.cos(rot) : d.y;
      p.rect(x + sh, y, 3, 3, d.c);
    }
    if (this.stage === 'stir' || this.finished) {
      const a = this.angle, sx = px + Math.cos(a) * 12, sy = py + Math.sin(a) * 12;
      p.ellipse(sx, sy, 4, 4, '#b5844a').rect(sx - 1, sy - 34, 3, 32, '#2b1b16').rect(sx, sy - 33, 1, 30, '#d9a868');
    }
    // heat gauge
    if (this.stage === 'heat' || this.stage === 'boil') {
      const gx = 146, gy = 14, gh = 92;
      p.rect(gx - 1, gy - 1, 18, gh + 2, '#2b1b16').rect(gx, gy, 16, gh, '#5a5a62');
      p.rect(gx, gy + gh * (1 - 0.8), 16, gh * 0.2, '#5ccf5c');
      p.rect(gx, gy, 16, gh * 0.2, '#e25a4c');
      const hy = gy + gh * (1 - (this.stage === 'boil' ? 0.7 : this.heat));
      p.rect(gx - 5, hy - 1, 26, 3, '#2b1b16').rect(gx - 4, hy, 24, 1, '#fff2a8');
      p.text('HITZE', gx - 2, gy + gh + 3, '#2b1b16');
    } else if (this.stage === 'place') {
      p.text('TOPF', 152, 96, '#2b1b16');
    }
    this.drawFx(p, ctx);
  }
}

// ------------------------------------------------------------- Geschirr abwaschen
class SinkGame extends MiniGame {
  constructor() {
    super();
    this.title = 'Geschirr abwaschen';
    this.plate = 0; this.total = 3; this.sx = 150; this.sy = 90; this.slide = 0; this.phase = 'in'; this.scrubAcc = 0;
    this.newPlate();
  }
  newPlate() {
    const cols = ['#b5442f', '#7a4a22', '#5a7a2a', '#c96a14'];
    this.spots = [];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + Math.random() * 0.8, d = 10 + Math.random() * 20;
      this.spots.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 4 + Math.random() * 4, c: cols[i % cols.length], amt: 1, seed: Math.random() * 1000 });
    }
    this.phase = 'in'; this.slide = 1;
  }
  get hint() { return this.phase === 'scrub' ? 'Schrubbe die Flecken weg: Schwamm mit den Pfeiltasten bewegen!' : 'Blitzblank!'; }
  get progress() { return `Teller ${Math.min(this.plate + 1, this.total)}/${this.total}   ·   Flecken übrig: ${this.spots.filter(s => s.amt > 0).length}`; }
  update(dt) {
    this.stepFx(dt);
    if (this.finished) return;
    if (this.phase === 'in') { this.slide = Math.max(0, this.slide - dt * 2.5); if (this.slide === 0) this.phase = 'scrub'; return; }
    if (this.phase === 'out') {
      this.slide += dt * 2.5;
      if (this.slide >= 1) {
        this.plate++;
        if (this.plate >= this.total) return this.finish('Blitzblank! Alles sauber und im Abtropfgitter.');
        this.newPlate();
      }
      return;
    }
    let dx = 0, dy = 0;
    if (Input.down.left) dx -= 1;
    if (Input.down.right) dx += 1;
    if (Input.down.up) dy -= 1;
    if (Input.down.down) dy += 1;
    const moving = dx || dy;
    if (moving) {
      const l = Math.hypot(dx, dy);
      this.sx = Math.max(12, Math.min(SW - 12, this.sx + dx / l * 95 * dt));
      this.sy = Math.max(10, Math.min(SH - 10, this.sy + dy / l * 95 * dt));
      if (Math.random() < dt * 25) this.fx.push({ x: this.sx + (Math.random() - 0.5) * 16, y: this.sy + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 10, vy: -8, g: 0, life: 0.6, col: 'rgba(255,255,255,0.85)', s: 2 + Math.round(Math.random()) });
      let scrubbing = false;
      for (const s of this.spots) {
        if (s.amt <= 0) continue;
        if (Math.hypot(100 + s.x - this.sx, 60 + s.y - this.sy) < s.r + 9) {
          s.amt -= dt * 1.5; scrubbing = true;
          if (s.amt <= 0) { s.amt = 0; Sound.click(); this.burst(100 + s.x, 60 + s.y, ['#ffffff', '#d6ecf5'], 6, 40); }
        }
      }
      this.scrubAcc += dt;
      if (scrubbing && this.scrubAcc > 0.1) { this.scrubAcc = 0; Sound.scrub(); }
    }
    if (this.spots.every(s => s.amt <= 0)) {
      this.phase = 'out'; this.slide = 0; Sound.sparkle();
      this.pop(['SAUBER!', 'GLÄNZT!', 'TOP!'][this.plate % 3], 100, 14, '#9ff29f');
      for (let i = 0; i < 10; i++) this.fx.push({ x: 70 + Math.random() * 60, y: 30 + Math.random() * 60, vx: 0, vy: -10, g: 0, life: 0.8, col: '#ffffff', s: 2 });
    }
  }
  draw(p, ctx) {
    p.rect(0, 0, SW, SH, '#7f8b93');
    p.rect(4, 4, SW - 8, SH - 8, '#9ec3d6');
    for (let i = 0; i < 18; i++) {
      const x = (i * 37 + Math.sin(this.t + i) * 4) % (SW - 16) + 8, y = (i * 23) % (SH - 16) + 8;
      p.ring(x, y, 2, 2, 'rgba(255,255,255,0.6)');
    }
    p.rect(4, 4, SW - 8, 3, '#b8d6e4');
    // plate
    const ox = Math.round(100 + (this.phase === 'out' ? this.slide * 160 : -this.slide * 160)), oy = 60;
    p.ellipse(ox + 2, oy + 3, 44, 44, 'rgba(0,40,60,0.25)');
    p.ellipse(ox, oy, 44, 44, '#2b1b16').ellipse(ox, oy, 43, 43, '#fbfaf6').ellipse(ox, oy, 31, 31, '#e9e4d8').ellipse(ox, oy, 29, 29, '#f4f1e8');
    p.ring(ox, oy, 39, 39, '#5d8aa8').ring(ox, oy, 37, 37, '#5d8aa8');
    p.rect(ox - 30, oy - 26, 10, 2, '#ffffff').rect(ox - 33, oy - 22, 4, 2, '#ffffff');
    for (const s of this.spots) {
      if (s.amt <= 0) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.amt));
      const r = rng(Math.floor(s.seed));
      p.ellipse(ox + s.x, oy + s.y, Math.round(s.r), Math.round(s.r * 0.8), s.c);
      for (let k = 0; k < 4; k++) p.rect(ox + s.x + (r() - 0.5) * s.r * 3, oy + s.y + (r() - 0.5) * s.r * 2.4, 2, 2, s.c);
      ctx.globalAlpha = 1;
    }
    if (this.phase === 'scrub') {
      const x = Math.round(this.sx), y = Math.round(this.sy) + (Input.down.left || Input.down.right || Input.down.up || Input.down.down ? Math.round(Math.sin(this.t * 40)) : 0);
      p.rect(x - 10, y - 7, 21, 15, '#2b1b16').rect(x - 9, y - 6, 19, 13, '#f2d14b').rect(x - 9, y - 6, 19, 4, '#5aa84a');
      for (let i = 0; i < 5; i++) p.dot(x - 7 + i * 4, y + 2 + (i % 2) * 2, '#d9b23a');
    }
    this.drawFx(p, ctx);
  }
}
