'use strict';
// The cooking studio: layout, collisions, player movement and world rendering.
const ISLANDS = [
  { id: 'cut', x: 72, label: 'Schnibbel-Station' },
  { id: 'stove', x: 264, label: 'Herd-Station' },
  { id: 'sink', x: 456, label: 'Spül-Station' },
];
const ISLAND_Y = 210;
const WINDOWS = [[74, 12, 44, 40], [534, 12, 44, 40]];
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const World = {
  t: 0, particles: [], snow: [],
  player: { x: 324, y: 338, face: 'up', walkT: 0, moving: false, stepAcc: 0, auto: null },
  teacher: { x: 324, y: 138, blinkT: 2, talking: false },

  init(papaImg) {
    this.papa = papaImg;
    this.bg = buildBackground();
    this.vignette = buildVignette();
    this.spr = {
      teacher: [teacherSprite(false, false), teacherSprite(true, false), teacherSprite(false, true), teacherSprite(true, true)],
      demo: demoCounterSprite(), shelf: bookshelfSprite(), cat: [catSprite(0), catSprite(1)],
      plantA: plantSprite(3), plantB: plantSprite(8), rack: coatRackSprite(), sacks: sacksSprite(),
      marker: markerSprite(), check: checkSprite(), islands: {},
    };
    for (const isl of ISLANDS) this.spr.islands[isl.id] = [islandSprite(isl.id, false), islandSprite(isl.id, true)];
    this.solids = [
      { x: 0, y: 0, w: W, h: 100 }, { x: 0, y: 0, w: 14, h: H }, { x: W - 14, y: 0, w: 14, h: H }, { x: 0, y: 344, w: W, h: 16 },
      { x: 216, y: 144, w: 216, h: 30 }, { x: 314, y: 128, w: 20, h: 10 },
      ...ISLANDS.map(i => ({ x: i.x, y: 214, w: 120, h: 36 })),
      { x: 14, y: 156, w: 50, h: 18 }, { x: 588, y: 160, w: 38, h: 14 },
      { x: 20, y: 330, w: 24, h: 14 }, { x: 604, y: 330, w: 24, h: 14 },
      { x: 266, y: 334, w: 16, h: 10 }, { x: 600, y: 238, w: 38, h: 16 },
    ];
    // zone = where the player must stand/face; hint = where the key bubble appears
    const z = (id, x, y, w, h, hx, hy) => ({ id, x, y, w, h, hx, hy });
    this.interactables = [
      z('teacher', 286, 108, 76, 84, 324, 66),
      ...ISLANDS.map(i => z(i.id, i.x - 4, 204, 128, 56, i.x + 60, 196)),
      z('chalkboard', 134, 60, 100, 44, 184, 58), z('fridge', 12, 60, 48, 44, 36, 12),
      z('window', 70, 60, 52, 44, 96, 8), z('window', 530, 60, 52, 44, 556, 8),
      z('range', 288, 60, 72, 44, 324, 50), z('clock', 372, 60, 26, 44, 384, 8),
      z('calendar', 400, 60, 34, 44, 418, 8), z('shelves', 440, 60, 80, 44, 480, 8),
      z('spices', 596, 60, 40, 44, 612, 16), z('mixer', 150, 60, 40, 44, 172, 46),
      z('coffee', 486, 60, 30, 44, 503, 40),
      z('books', 14, 106, 50, 72, 38, 106), z('cat', 582, 144, 50, 34, 606, 144),
      z('apron', 258, 284, 32, 64, 273, 284), z('door', 292, 334, 64, 26, 324, 318),
      z('sacks', 594, 216, 46, 42, 618, 216), z('plant', 14, 292, 36, 54, 32, 292), z('plant', 598, 292, 36, 54, 616, 292),
    ];
    for (const [wx, wy, ww, wh] of WINDOWS) {
      for (let i = 0; i < 14; i++) this.snow.push({ wx, wy, ww, wh, x: Math.random() * ww, y: Math.random() * wh, v: 6 + Math.random() * 10, s: Math.random() < 0.3 ? 2 : 1 });
    }
    // starry night sky for the windows
    this.sky = sprite(44, 40, (p, c) => {
      const g = c.createLinearGradient(0, 0, 0, 40);
      g.addColorStop(0, '#141d3c'); g.addColorStop(1, '#3a4a7a');
      c.fillStyle = g; c.fillRect(0, 0, 44, 40);
      const r = rng(4);
      for (let i = 0; i < 12; i++) p.dot(r() * 44, r() * 26, r() < 0.5 ? '#ffffff' : '#bcd0ff');
      p.rect(0, 34, 44, 6, '#e9eef7').rect(0, 33, 10, 1, '#e9eef7').rect(26, 32, 12, 2, '#e9eef7');
      p.rect(30, 22, 4, 12, '#2b3a2a').ellipse(32, 20, 6, 8, '#2f4d3a').rect(28, 14, 3, 2, '#e9eef7').rect(33, 18, 4, 2, '#e9eef7');
    });
  },

  collides(x, y) {
    const b = { x: x - 8, y: y - 5, w: 16, h: 6 };
    return this.solids.some(s => b.x < s.x + s.w && b.x + b.w > s.x && b.y < s.y + s.h && b.y + b.h > s.y);
  },

  update(dt, canMove) {
    this.t += dt;
    const pl = this.player;
    let dx = 0, dy = 0;
    if (pl.auto) {
      const ax = pl.auto.x - pl.x, ay = pl.auto.y - pl.y, d = Math.hypot(ax, ay);
      if (d < 2) { pl.auto.done && pl.auto.done(); pl.auto = null; }
      else { dx = ax / d; dy = ay / d; }
    } else if (canMove) {
      if (Input.down.left) dx -= 1;
      if (Input.down.right) dx += 1;
      if (Input.down.up) dy -= 1;
      if (Input.down.down) dy += 1;
    }
    pl.moving = dx !== 0 || dy !== 0;
    if (pl.moving) {
      if (Math.abs(dx) > Math.abs(dy)) pl.face = dx < 0 ? 'left' : 'right';
      else if (dy !== 0) pl.face = dy < 0 ? 'up' : 'down';
      const len = Math.hypot(dx, dy), sp = 88 * dt;
      const nx = pl.x + dx / len * sp, ny = pl.y + dy / len * sp;
      if (pl.auto || !this.collides(nx, pl.y)) pl.x = nx;
      if (pl.auto || !this.collides(pl.x, ny)) pl.y = ny;
      pl.walkT += dt;
      pl.stepAcc += dt;
      if (pl.stepAcc > 0.26) { pl.stepAcc = 0; Sound.step(); }
    } else {
      pl.walkT = 0;
    }

    const te = this.teacher;
    te.blinkT -= dt;
    if (te.blinkT < -0.12) te.blinkT = 2.5 + Math.random() * 2.5;

    for (const s of this.snow) {
      s.y += s.v * dt; s.x += Math.sin(this.t * 1.3 + s.y * 0.2) * 4 * dt;
      if (s.y > s.wh) { s.y = -2; s.x = Math.random() * s.ww; }
    }
    // steam from the teacher's pot and from a finished soup
    if (Math.random() < dt * 6) this.puff(322, 56);
    if (Game.state.done.stove && Math.random() < dt * 5) this.puff(ISLANDS[1].x + 22, ISLAND_Y + 4);
    if (Math.random() < dt * 0.7) this.particles.push({ x: 622, y: 150, vx: 4, vy: -6, life: 2.2, max: 2.2, kind: 'z' });
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    this.particles = this.particles.filter(p => p.life > 0);
  },

  puff(x, y) {
    this.particles.push({ x: x + (Math.random() - 0.5) * 8, y, vx: (Math.random() - 0.5) * 4, vy: -12 - Math.random() * 6, life: 1.6, max: 1.6, kind: 'steam' });
  },

  probe() {
    const pl = this.player, [fx, fy] = DIRS[pl.face];
    return { x: pl.x + fx * 14, y: pl.y - 3 + fy * 14 };
  },

  // The interactable the player is facing (or standing right next to).
  nearest() {
    const pr = this.probe(), pl = this.player;
    const inside = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    let best = null, bestD = 1e9;
    for (const z of this.interactables) {
      const facing = inside(z, pr.x, pr.y);
      const near = inside({ x: z.x - 4, y: z.y - 4, w: z.w + 8, h: z.h + 8 }, pl.x, pl.y - 3);
      if (!facing && !near) continue;
      const d = Math.hypot(z.x + z.w / 2 - pr.x, z.y + z.h / 2 - pr.y) - (facing ? 1000 : 0);
      if (d < bestD) { bestD = d; best = z; }
    }
    return best;
  },

  drawPlayer(ctx) {
    const pl = this.player, img = this.papa;
    const sx = Math.round(pl.x - 27), sy = Math.round(pl.y - 64);
    ctx.fillStyle = 'rgba(50,25,10,0.28)';
    ctx.beginPath(); ctx.ellipse(Math.round(pl.x), Math.round(pl.y), 15, 4, 0, 0, Math.PI * 2); ctx.fill();
    const ph = pl.moving ? Math.floor(pl.walkT * 9) % 4 : 1;
    const bob = ph % 2 === 1 && pl.moving ? 1 : 0;
    const lUp = ph === 0 ? 3 : 0, rUp = ph === 2 ? 3 : 0;
    const SPLIT = 49, LEGH = img.height - SPLIT;
    ctx.save();
    if (pl.face === 'left') { ctx.translate(sx * 2 + img.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(img, 0, SPLIT, 27, LEGH, sx, sy + SPLIT - lUp, 27, LEGH);
    ctx.drawImage(img, 27, SPLIT, img.width - 27, LEGH, sx + 27, sy + SPLIT - rUp, img.width - 27, LEGH);
    ctx.drawImage(img, 0, 0, img.width, SPLIT, sx, sy + bob, img.width, SPLIT);
    ctx.restore();
  },

  draw(ctx) {
    const p = new Pix(ctx), st = Game.state;
    ctx.drawImage(this.bg, 0, 0);

    for (const [wx, wy, ww, wh] of WINDOWS) {
      ctx.drawImage(this.sky, wx, wy);
      if (wx < 300) p.ellipse(wx + 9, wy + 9, 4, 4, '#fff6d0').ellipse(wx + 11, wy + 8, 3, 3, '#141d3c');
    }
    for (const s of this.snow) p.rect(s.wx + s.x, s.wy + s.y, s.s, s.s, '#ffffff');
    for (const [wx, wy, ww, wh] of WINDOWS) drawWindowFrame(p, wx, wy, ww, wh);

    // live wall clock
    const now = new Date(), hr = (now.getHours() % 12 + now.getMinutes() / 60) / 12 * Math.PI * 2, mn = now.getMinutes() / 60 * Math.PI * 2;
    for (let i = 0; i <= 4; i++) p.dot(384 + Math.round(Math.sin(hr) * i), 26 - Math.round(Math.cos(hr) * i), '#2b1b16');
    for (let i = 0; i <= 6; i++) p.dot(384 + Math.round(Math.sin(mn) * i), 26 - Math.round(Math.cos(mn) * i), '#7a2a2a');

    // the teacher's pot on the big range
    p.rect(311, 58, 22, 12, C.ink).rect(312, 58, 20, 11, '#c8392f').rect(312, 58, 20, 3, '#e25a4c').rect(308, 61, 4, 2, C.ink).rect(332, 61, 4, 2, C.ink);
    p.ellipse(322, 58, 9, 2, '#d9573a');

    const objs = [];
    for (const isl of ISLANDS) objs.push({ y: 250, img: this.spr.islands[isl.id][st.done[isl.id] ? 1 : 0], x: isl.x - 1, iy: ISLAND_Y - 1 });
    objs.push({ y: 174, img: this.spr.demo, x: 215, iy: 137 });
    const te = this.teacher, blink = te.blinkT < 0 ? 1 : 0, talk = te.talking && Math.floor(this.t * 8) % 2 ? 2 : 0;
    objs.push({ y: te.y, img: this.spr.teacher[blink + talk], x: te.x - 19, iy: te.y - 62 });
    objs.push({ y: 174, img: this.spr.shelf, x: 14, iy: 112 });
    objs.push({ y: 174, img: this.spr.cat[Math.floor(this.t * 0.8) % 2], x: 586, iy: 150 });
    objs.push({ y: 344, img: this.spr.plantA, x: 16, iy: 296 });
    objs.push({ y: 344, img: this.spr.plantB, x: 600, iy: 296 });
    objs.push({ y: 342, img: this.spr.rack, x: 262, iy: 288 });
    objs.push({ y: 254, img: this.spr.sacks, x: 598, iy: 222 });
    objs.push({ y: this.player.y, player: true });
    objs.sort((a, b) => a.y - b.y);
    for (const o of objs) o.player ? this.drawPlayer(ctx) : ctx.drawImage(o.img, o.x, o.iy);

    for (const pa of this.particles) {
      const a = pa.life / pa.max;
      if (pa.kind === 'steam') {
        ctx.fillStyle = `rgba(255,255,255,${0.45 * a})`;
        const s = Math.round(3 + (1 - a) * 4);
        ctx.fillRect(Math.round(pa.x - s / 2), Math.round(pa.y), s, s);
      } else if (pa.kind === 'z') {
        p.text('Z', pa.x, pa.y, `rgba(255,255,255,${a})`);
      }
    }

    // quest markers above teacher / stations
    const bounce = Math.round(Math.sin(this.t * 4) * 2);
    if (!st.metTeacher || st.allDone) ctx.drawImage(this.spr.marker, te.x - 5, te.y - 82 + bounce);
    if (st.metTeacher) {
      for (const isl of ISLANDS) {
        if (st.done[isl.id]) ctx.drawImage(this.spr.check, isl.x + 53, ISLAND_Y - 18);
        else ctx.drawImage(this.spr.marker, isl.x + 55, ISLAND_Y - 24 + bounce);
      }
    }

    ctx.drawImage(this.vignette, 0, 0);
  },

  drawPrompt(ctx, z) {
    if (!z) return;
    const p = new Pix(ctx);
    const label = 'ENTER', w = textWidth(label) + 8;
    const x = Math.round(z.hx - w / 2), y = Math.round(z.hy - 14 + Math.sin(this.t * 5));
    p.box(x - 1, y - 1, w + 2, 11, C.ink).box(x, y, w, 9, '#fff6dc');
    p.rect(z.hx - 1, y + 9, 3, 2, C.ink).dot(z.hx, y + 9, '#fff6dc');
    p.text(label, x + 4, y + 2, '#5e3c22');
  },
};
