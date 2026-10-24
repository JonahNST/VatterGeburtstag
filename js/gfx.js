'use strict';
// Logical resolution: the world is drawn pixel-exact at this size and scaled up.
const W = 648, H = 360, T = 24;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}

// Small seeded random so textures look the same every time.
function rng(seed) {
  return function () {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 3x5 bitmap font for chalkboards, signs and calendars.
const FONT = (() => {
  const g = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111', 'Ä': '101010101111101', 'Ö': '101010101101010',
    'Ü': '101000101101111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111',
    3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111',
    7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '.': '000000000000010',
    ':': '000010000010000', '-': '000000111000000', '!': '010010010000010', '/': '001001010100100',
    '+': '000010111010000', '♥': '000101111111010', ' ': '000000000000000', ',': '000000000010100',
    '?': '110001010000010', '(': '010100100100010', ')': '010001001001010',
  };
  return g;
})();

class Pix {
  constructor(ctx) { this.c = ctx; }
  rect(x, y, w, h, col) {
    this.c.fillStyle = col;
    this.c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    return this;
  }
  dot(x, y, col) { return this.rect(x, y, 1, 1, col); }
  // Filled ellipse built from horizontal spans (crisp, no anti-aliasing).
  ellipse(cx, cy, rx, ry, col) {
    for (let y = -ry; y <= ry; y++) {
      const t = y / (ry + 0.5);
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t)));
      this.rect(cx - hw, cy + y, hw * 2 + 1, 1, col);
    }
    return this;
  }
  ring(cx, cy, rx, ry, col) {
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      this.dot(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), col);
    }
    return this;
  }
  // Rectangle with 1px cut corners.
  box(x, y, w, h, col) {
    this.rect(x + 1, y, w - 2, h, col);
    this.rect(x, y + 1, w, h - 2, col);
    return this;
  }
  frame(x, y, w, h, col) {
    this.rect(x, y, w, 1, col); this.rect(x, y + h - 1, w, 1, col);
    this.rect(x, y, 1, h, col); this.rect(x + w - 1, y, 1, h, col);
    return this;
  }
  text(str, x, y, col, s = 1) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch] || FONT['?'];
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') this.rect(cx + (i % 3) * s, y + Math.floor(i / 3) * s, s, s, col);
      }
      cx += 4 * s;
    }
    return this;
  }
}
function textWidth(str, s = 1) { return str.length * 4 * s - s; }

// Draws a sprite with a 1px dark outline around its silhouette (Stardew-style).
function outlined(w, h, draw, color = '#2b1b16') {
  const [inner, ix] = makeCanvas(w, h);
  draw(new Pix(ix), ix);
  const [sil, sx] = makeCanvas(w, h);
  sx.drawImage(inner, 0, 0);
  sx.globalCompositeOperation = 'source-in';
  sx.fillStyle = color; sx.fillRect(0, 0, w, h);
  const [out, ox] = makeCanvas(w + 2, h + 2);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) ox.drawImage(sil, dx, dy);
  ox.drawImage(inner, 1, 1);
  return out;
}

function sprite(w, h, draw) {
  const [c, x] = makeCanvas(w, h);
  draw(new Pix(x), x);
  return c;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

// ---------------------------------------------------------------- input
const Input = {
  down: {}, pressed: {},
  map(e) {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case 'Enter': case ' ': case 'e': case 'E': return 'ok';
      case 'Escape': case 'Backspace': return 'back';
      case 'm': case 'M': return 'mute';
    }
    return null;
  },
  press(k) { if (!this.down[k]) this.pressed[k] = true; this.down[k] = true; },
  release(k) { this.down[k] = false; },
  init() {
    addEventListener('keydown', e => {
      const k = this.map(e);
      if (!k) return;
      e.preventDefault();
      if (!e.repeat) this.press(k); else this.down[k] = true;
    });
    addEventListener('keyup', e => { const k = this.map(e); if (k) this.release(k); });
    addEventListener('blur', () => { this.down = {}; });
    document.querySelectorAll('[data-k]').forEach(b => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', e => { e.preventDefault(); this.press(k); });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
        b.addEventListener(ev, () => this.release(k));
      }
    });
  },
  hit(k) { if (this.pressed[k]) { this.pressed[k] = false; return true; } return false; },
  endFrame() { this.pressed = {}; },
};
