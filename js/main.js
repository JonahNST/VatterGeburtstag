'use strict';
// ------------------------------------------------------------------ settings
const GIFT = {
  date: new Date(2027, 0, 7, 17, 0),
  greeting: 'Alles Gute zum Geburtstag, Papa!',
};
const TEACHER = 'Frau Rosmarin';
const FONT_UI = '"Pixelify Sans", monospace';

const LINES = {
  intro: [
    ['papa', 'So, das ist also das Kochstudio … Hier riecht es ja schon richtig gut!'],
    ['papa', 'Ich sollte erst mal die Kursleiterin da vorne begrüßen.'],
    ['info', 'Steuerung: Mit den Pfeiltasten läufst du herum. Mit ENTER sprichst du mit Leuten oder benutzt Dinge.'],
  ],
  teacherFirst: [
    ['teacher', `Ah, hallo und herzlich willkommen in meinem Kochstudio! Ich bin ${TEACHER}, deine Kursleiterin.`],
    ['teacher', 'Oh! Was für große, neugierige Augen du hast. Sehr gut – einem echten Koch entgeht nämlich kein Detail!'],
    ['teacher', 'Aber du bist ein bisschen zu früh dran: Dein Kochkurs findet am 07.01.2027 um 17:00 Uhr statt.'],
    ['teacher', 'Komm dann bitte wieder – mit Hunger und guter Laune im Gepäck!'],
    ['teacher', 'In der Zwischenzeit kannst du ja schon mal Gemüse schnibbeln. Die Tische da vorne gehören ganz dir.'],
    ['teacher', 'Und wenn du schon dabei bist: Stell einen Topf auf den Herd und spül das Geschirr ab. Ein guter Koch hält seine Küche sauber!'],
  ],
  teacherFinal: [
    ['teacher', 'Wow! Gemüse geschnibbelt, Suppe auf dem Herd und das Geschirr glänzt. Du bist ein echtes Naturtalent!'],
    ['teacher', 'Dann ist es jetzt offiziell: Ich erwarte dich am Donnerstag, den 07.01.2027 um 17:00 Uhr zum Kochkurs.'],
    ['teacher', 'Wir gehen auf eine kulinarische Reise in den Orient – rein pflanzlich, mit Hummus, Börek, Baklava und vielem mehr.'],
    ['teacher', 'Bis dahin: Messer schärfen und Appetit mitbringen. Ich freu mich auf dich!'],
  ],
  notYet: [['papa', 'Hmm, bevor ich hier loslege, sollte ich erst mal die Kursleiterin begrüßen.']],
  doneAlready: {
    cut: [['papa', 'Das Gemüse ist schon geschnibbelt. Feinste Arbeit, wenn ich das so sagen darf!']],
    stove: [['papa', 'Die Suppe blubbert fröhlich vor sich hin. Mmmh.']],
    sink: [['papa', 'Alles blitzblank. Hier gibt es nichts mehr zu tun.']],
  },
  afterMini: {
    cut: [['papa', 'Geschafft! Karotte, Zucchini und Lauch – alles in mundgerechten Stücken.']],
    stove: [['papa', 'Die Suppe köchelt. Ich glaube, ich habe Talent!']],
    sink: [['papa', 'Sauberer geht es nicht. Da wird Frau Rosmarin staunen!']],
  },
  things: {
    chalkboard: [['info', 'Auf der Tafel steht: „KOCHKURS – Do 07.01.2027 – 17:00 Uhr“. Daneben eine gemalte Karotte, ein Topf und ein Herz.']],
    fridge: [['papa', 'Der Kühlschrank ist randvoll mit frischem Gemüse. Und … ist das da hinten etwa Schokoladenpudding?']],
    window: [['papa', 'Draußen schneit es ganz leise. Perfektes Wetter für eine heiße Suppe.']],
    range: [['papa', `Der große Profiherd von ${TEACHER}. In dem roten Topf blubbert irgendetwas sehr Leckeres …`]],
    calendar: [['info', 'Ein Kalender. Der 7. Januar 2027 ist dick rot eingekreist: „Kochkurs, 17:00 Uhr!“']],
    shelves: [['papa', 'Gläser voller Nudeln, Linsen und Gewürze. Alles ordentlich beschriftet … na ja, fast alles.']],
    spices: [['papa', 'Paprika, Kurkuma, Oregano, Zimt … das Gewürzregal eines echten Profis.']],
    mixer: [['papa', 'Eine knallrote Küchenmaschine. Die würde sich bei uns zu Hause auch gut machen.']],
    coffee: [['papa', 'Eine Kaffeemaschine. Das wichtigste Küchengerät überhaupt.']],
    books: [['info', 'Kochbücher: „Schnibbeln für Fortgeschrittene“, „Die Suppe und ich“ und „1000 Arten, eine Zwiebel zu schneiden, ohne zu weinen“.']],
    cat: [['info', 'Die Kochschul-Katze Paprika schläft tief und fest. Sie träumt bestimmt von Thunfisch.']],
    apron: [['papa', 'Eine Schürze und eine Kochmütze. Auf dem Zettel daran steht: „Reserviert ab 07.01.2027“.']],
    sacks: [['papa', 'Ein Sack Mehl und ein Netz voller Zwiebeln. Hier wird ordentlich gekocht.']],
    plant: [['papa', 'Eine prächtige Pflanze. Hoffentlich landet die nicht aus Versehen im Topf.']],
  },
};

const COURSE = {
  title: 'Reise in den Orient – Vegan genießen',
  summary: 'Ein rein pflanzliches Menü voller Farben, Düfte und Aromen: Pfannenbrot, Hummus, Fattoush, Shakshuka mit „Tofu-Ei“, Mercimek Köfte, Cigara Börek, Ash Resteh und Baklava-Trifle mit Feigen.',
  address: 'Kochschule Kirschbaum · Kölner Straße 19 · 42119 Wuppertal',
};

// ------------------------------------------------------------------ game
const Game = {
  state: { metTeacher: false, done: { cut: false, stove: false, sink: false }, allDone: false, finale: false },
  mode: 'loading', t: 0, fade: 1, dialog: null, mini: null, confetti: [], playT: 0,

  async start() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    [this.low, this.lctx] = makeCanvas(W, H);
    [this.scene, this.sctx] = makeCanvas(SW, SH);
    Input.init();
    addEventListener('resize', () => this.resize());
    this.resize();
    const [papa, portrait, full] = await Promise.all(['assets/papa_sprite.png', 'assets/papa_portrait.png', 'assets/papa_full.png'].map(loadImage));
    this.portrait = portrait; this.full = full;
    try { await Promise.race([document.fonts.load(`16px ${FONT_UI}`), new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* fallback font */ }
    World.init(papa);
    this.titleSnow = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 10 + Math.random() * 25, s: Math.random() < 0.3 ? 2 : 1 }));
    this.mode = 'title';
    this.canvas.focus();
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      this.update(dt); this.render();
      Input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = Math.floor(W * s) + 'px';
    this.canvas.style.height = Math.floor(H * s) + 'px';
    this.canvas.width = Math.floor(W * s * dpr);
    this.canvas.height = Math.floor(H * s * dpr);
    this.SC = this.canvas.width / W;
  },

  say(lines, then) {
    this.dialog = { lines, i: 0, shown: 0, then, acc: 0 };
    this.mode = 'dialog';
  },

  update(dt) {
    this.t += dt;
    if (Input.hit('mute')) Sound.toggleMute();
    for (const s of this.titleSnow || []) { s.y += s.v * dt; s.x += Math.sin(this.t + s.y * 0.05) * 6 * dt; if (s.y > H) { s.y = -2; s.x = Math.random() * W; } }
    if (this.mode === 'title') {
      if (Input.hit('ok')) {
        Sound.init(); Sound.select();
        this.mode = 'intro'; this.fade = 1;
        World.player.auto = { x: 324, y: 300, done: () => this.say(LINES.intro, () => { this.mode = 'play'; }) };
      }
      return;
    }
    this.fade = Math.max(0, this.fade - dt * 1.5);
    World.teacher.talking = this.mode === 'dialog' && this.dialog && this.dialog.lines[this.dialog.i][0] === 'teacher' && this.dialog.shown < this.dialog.lines[this.dialog.i][1].length;
    if (this.mode === 'intro') { World.update(dt, false); return; }
    if (this.mode === 'play') {
      this.playT += dt;
      World.update(dt, true);
      if (Input.hit('ok')) { const z = World.nearest(); if (z) this.interact(z); }
      return;
    }
    if (this.mode === 'dialog') { World.update(dt, false); this.updateDialog(dt); return; }
    if (this.mode === 'mini') {
      const m = this.mini;
      m.update(dt);
      if (m.finished) {
        m.doneT = (m.doneT || 0) + dt;
        if (m.doneT > 0.6 && Input.hit('ok')) this.closeMini(true);
      } else if (Input.hit('back')) this.closeMini(false);
      return;
    }
    if (this.mode === 'voucher') {
      World.update(dt, false);
      if (Math.random() < dt * 40) this.confetti.push({ x: Math.random() * W, y: -6, vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 50, r: Math.random() * 6, c: ['#e25a4c', '#ffd23f', '#5ccf5c', '#3d8bff', '#f08ad0', '#ffffff'][Math.floor(Math.random() * 6)] });
      for (const c of this.confetti) { c.x += c.vx * dt; c.y += c.vy * dt; c.r += dt * 6; }
      this.confetti = this.confetti.filter(c => c.y < H + 10);
      if (this.t - this.voucherT > 1 && Input.hit('ok')) { this.mode = 'play'; this.confetti = []; }
    }
  },

  updateDialog(dt) {
    const d = this.dialog, [who, text] = d.lines[d.i];
    if (d.shown < text.length) {
      d.acc += dt * 48;
      while (d.acc >= 1 && d.shown < text.length) {
        d.acc -= 1; d.shown++;
        if (d.shown % 3 === 0 && text[d.shown - 1] !== ' ') {
          if (who === 'teacher') Sound.tone(780 + Math.random() * 120, 0.035, { vol: 0.035 });
          else if (who === 'papa') Sound.tone(360 + Math.random() * 60, 0.04, { vol: 0.045 });
          else Sound.blip();
        }
      }
      if (Input.hit('ok')) d.shown = text.length;
    } else if (Input.hit('ok')) {
      Sound.click();
      d.i++; d.shown = 0; d.acc = 0;
      if (d.i >= d.lines.length) {
        this.dialog = null; this.mode = 'play';
        if (d.then) d.then();
      }
    }
  },

  interact(z) {
    const st = this.state;
    if (z.id === 'teacher') {
      if (!st.metTeacher) {
        return this.say(LINES.teacherFirst, () => {
          st.metTeacher = true; Sound.sparkle();
          this.say([['info', 'Neue Aufgaben: Gemüse schnibbeln · Topf auf den Herd stellen · Geschirr abwaschen. Geh zu den Tischen mit dem gelben Ausrufezeichen!']]);
        });
      }
      if (st.allDone && !st.finale) {
        return this.say(LINES.teacherFinal, () => { st.finale = true; this.openVoucher(); });
      }
      if (st.finale) {
        return this.say([['teacher', 'Wir sehen uns am 07.01.2027 um 17:00 Uhr in der Kochschule Kirschbaum! Ich freu mich schon.']], () => this.openVoucher());
      }
      const left = ISLANDS.filter(i => !st.done[i.id]).map(i => ({ cut: 'Gemüse schnibbeln', stove: 'Topf auf den Herd stellen', sink: 'Geschirr abwaschen' })[i.id]);
      return this.say([['teacher', `Na, wie läuft's? Auf deiner Liste steht noch: ${left.join(', ')}. Du schaffst das!`]]);
    }
    if (z.id === 'cut' || z.id === 'stove' || z.id === 'sink') {
      if (!st.metTeacher) return this.say(LINES.notYet);
      if (st.done[z.id]) return this.say(LINES.doneAlready[z.id]);
      return this.openMini(z.id);
    }
    if (z.id === 'clock') {
      const n = new Date(), hh = String(n.getHours()).padStart(2, '0'), mm = String(n.getMinutes()).padStart(2, '0');
      return this.say([['papa', `Die Uhr zeigt ${hh}:${mm} Uhr. Der Kochkurs beginnt am 07.01.2027 um 17:00 Uhr.`]]);
    }
    if (z.id === 'door') {
      if (st.finale) return this.say([['papa', 'Bis zum 07.01.2027 – ich komme wieder! (Du kannst dich aber gerne noch weiter umsehen.)']]);
      return this.say([['papa', 'Ich kann doch jetzt noch nicht gehen – hier gibt es noch etwas zu tun!']]);
    }
    if (z.id === 'cat') Sound.tone(700, 0.35, { type: 'triangle', vol: 0.08, slide: 250 });
    if (LINES.things[z.id]) this.say(LINES.things[z.id]);
  },

  openMini(id) {
    Sound.select();
    this.mini = id === 'cut' ? new CutGame() : id === 'stove' ? new StoveGame(this.state.done.cut) : new SinkGame();
    this.mini.id = id;
    this.mode = 'mini';
  },

  closeMini(success) {
    const id = this.mini.id;
    this.mini = null; this.mode = 'play';
    if (!success) return;
    const st = this.state;
    st.done[id] = true;
    st.allDone = ISLANDS.every(i => st.done[i.id]);
    const lines = [...LINES.afterMini[id]];
    if (st.allDone) lines.push(['info', `Alle Aufgaben erledigt! Sprich nochmal mit ${TEACHER}.`]);
    this.say(lines);
  },

  openVoucher() {
    this.mode = 'voucher'; this.voucherT = this.t; this.confetti = [];
    Sound.fanfare();
  },

  // ---------------------------------------------------------------- rendering
  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (this.mode === 'loading') { ctx.fillStyle = '#1a120d'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); return; }
    const l = this.lctx;
    World.draw(l);
    if (this.mode === 'play') World.drawPrompt(l, World.nearest());
    ctx.drawImage(this.low, 0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.SC, 0, 0, this.SC, 0, 0);
    ctx.imageSmoothingEnabled = false;

    if (this.mode === 'title') return this.drawTitle(ctx);
    if (this.mode === 'play' || (this.mode === 'dialog' && World.player.y <= 236)) this.drawHud(ctx);
    if (this.mode === 'dialog') this.drawDialog(ctx);
    if (this.mode === 'mini') this.drawMini(ctx);
    if (this.mode === 'voucher') this.drawVoucher(ctx);
    if (this.fade > 0) { ctx.fillStyle = `rgba(20,12,8,${this.fade})`; ctx.fillRect(0, 0, W, H); }
  },

  text(ctx, str, x, y, size, col, align = 'left', weight = 400) {
    ctx.font = `${weight} ${size}px ${FONT_UI}`;
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = col; ctx.fillText(str, x, y);
  },

  // Stardew-like wooden frame with parchment inside.
  panel(ctx, x, y, w, h, inner = '#f6e3b4') {
    ctx.fillStyle = '#3b2416'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#b5793f'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = '#d99a55'; ctx.fillRect(x + 2, y + 2, w - 4, 2);
    ctx.fillStyle = '#7a4a24'; ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    ctx.fillStyle = inner; ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
    ctx.fillStyle = 'rgba(160,110,50,0.15)'; ctx.fillRect(x + 6, y + h - 10, w - 12, 4);
  },

  drawTitle(ctx) {
    ctx.fillStyle = 'rgba(20,12,8,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    for (const s of this.titleSnow) ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
    const bob = Math.sin(this.t * 2) * 3;
    ctx.drawImage(this.full, 40, 52 + bob, 210, 255);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(145, 312, 70, 8, 0, 0, Math.PI * 2); ctx.fill();
    this.text(ctx, 'Papas', 446, 92, 34, '#3b2416', 'center', 700);
    this.text(ctx, 'Papas', 444, 89, 34, '#ffd77a', 'center', 700);
    this.text(ctx, 'Kochkurs', 446, 146, 58, '#3b2416', 'center', 700);
    this.text(ctx, 'Kochkurs', 443, 142, 58, '#ffefc2', 'center', 700);
    this.text(ctx, 'Ein kleines Abenteuer in 8 Bit', 444, 176, 16, '#e8c48a', 'center');
    // little pot icon with steam
    const px = 444, py = 214;
    ctx.fillStyle = '#c8392f'; ctx.fillRect(px - 22, py, 44, 22);
    ctx.fillStyle = '#e25a4c'; ctx.fillRect(px - 22, py, 44, 5);
    ctx.fillStyle = '#3b2416'; ctx.fillRect(px - 30, py + 4, 8, 4); ctx.fillRect(px + 22, py + 4, 8, 4); ctx.fillRect(px - 24, py - 3, 48, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 3; i++) ctx.fillRect(px - 12 + i * 10 + Math.round(Math.sin(this.t * 3 + i) * 2), py - 16 - ((this.t * 12 + i * 5) % 12), 3, 6);
    if (Math.floor(this.t * 1.6) % 2 === 0) this.text(ctx, 'Drücke ENTER zum Starten', 444, 280, 20, '#ffffff', 'center', 600);
    this.text(ctx, 'Pfeiltasten: laufen  ·  ENTER: sprechen & benutzen  ·  M: Ton an/aus', W / 2, 344, 12, 'rgba(255,240,210,0.65)', 'center');
  },

  // HUD panels turn see-through while Papa walks behind them.
  hudAlpha(ctx, x, y, w, h) {
    const p = World.player, px = p.x - 28, py = p.y - 66;
    ctx.globalAlpha = px < x + w && px + 56 > x && py < y + h && p.y > y ? 0.3 : 1;
  },

  drawHud(ctx) {
    const st = this.state;
    if (st.metTeacher) {
      const tx = 8, ty = H - 92;
      this.hudAlpha(ctx, tx, ty, 178, 84);
      this.panel(ctx, tx, ty, 178, 84);
      this.text(ctx, 'Aufgaben', tx + 14, ty + 23, 15, '#7a4a24', 'left', 700);
      const tasks = [['cut', 'Gemüse schnibbeln'], ['stove', 'Topf auf den Herd'], ['sink', 'Geschirr abwaschen']];
      tasks.forEach(([id, label], i) => {
        const y = ty + 40 + i * 16, done = st.done[id];
        ctx.fillStyle = '#3b2416'; ctx.fillRect(tx + 14, y - 9, 10, 10);
        ctx.fillStyle = done ? '#5ccf5c' : '#fff6dc'; ctx.fillRect(tx + 15, y - 8, 8, 8);
        this.text(ctx, label, tx + 30, y, 13, done ? '#9a8a6a' : '#3b2416', 'left', 600);
        if (done) { ctx.fillStyle = '#9a8a6a'; ctx.fillRect(tx + 30, y - 4, ctx.measureText(label).width, 1); }
      });
    }
    ctx.globalAlpha = 1;
    if (this.mode === 'play' && this.playT < 25) {
      const a = Math.min(1, (25 - this.playT) / 3);
      ctx.fillStyle = `rgba(30,18,10,${0.6 * a})`; ctx.fillRect(404 - 190, H - 26, 380, 18);
      this.text(ctx, 'Pfeiltasten: laufen  ·  ENTER: sprechen & benutzen  ·  M: Ton', 404, H - 13, 12, `rgba(255,240,210,${a})`, 'center');
    }
    if (Sound.muted) this.text(ctx, '🔇', W - 22, H - 12, 14, '#fff', 'center');
  },

  wrap(ctx, text, maxW, size) {
    ctx.font = `400 ${size}px ${FONT_UI}`;
    const words = text.split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    lines.push(line);
    return lines;
  },

  drawDialog(ctx) {
    const d = this.dialog;
    if (!d) return;
    const [who, text] = d.lines[d.i];
    // move the box to the top when it would cover the player
    const x = 20, w = W - 40, h = 98, y = World.player.y > 236 ? 30 : 254;
    const hasPortrait = who !== 'info';
    this.panel(ctx, x, y, w, h);
    const textW = hasPortrait ? w - 140 : w - 40;
    const lines = this.wrap(ctx, text, textW, 17);
    let left = d.shown;
    lines.forEach((ln, i) => {
      const part = ln.slice(0, Math.max(0, left));
      left -= ln.length + 1;
      this.text(ctx, part, x + 18, y + 30 + i * 22, 17, '#3b2416', 'left', 400);
    });
    if (d.shown >= text.length && Math.floor(this.t * 3) % 2 === 0) {
      ctx.fillStyle = '#c8463a';
      const ax = hasPortrait ? x + w - 128 : x + w - 22, ay = y + h - 20;
      ctx.beginPath(); ctx.moveTo(ax - 6, ay); ctx.lineTo(ax + 6, ay); ctx.lineTo(ax, ay + 7); ctx.fill();
    }
    if (hasPortrait) {
      const px = x + w - 112, py = y + 9;
      ctx.fillStyle = '#7a4a24'; ctx.fillRect(px - 2, py - 2, 96, 84);
      ctx.fillStyle = who === 'teacher' ? '#e9b98a' : '#3a73b8'; ctx.fillRect(px, py, 92, 80);
      if (who === 'papa') ctx.drawImage(this.portrait, 0, 6, 160, 139, px, py, 92, 80);
      else {
        const te = World.teacher, f = World.spr.teacher[(te.talking && Math.floor(this.t * 8) % 2 ? 2 : 0)];
        ctx.drawImage(f, 1, 0, 36, 32, px + 10, py + 2, 72, 64);
        ctx.drawImage(f, 1, 32, 36, 8, px + 10, py + 66, 72, 16);
      }
    }
    const name = who === 'teacher' ? TEACHER : who === 'papa' ? 'Papa' : null;
    if (name) {
      ctx.font = `700 15px ${FONT_UI}`;
      const nw = ctx.measureText(name).width + 24;
      this.panel(ctx, x + 12, y - 22, nw, 28, '#fff2cf');
      this.text(ctx, name, x + 12 + nw / 2, y - 3, 15, '#7a4a24', 'center', 700);
    }
  },

  drawMini(ctx) {
    const m = this.mini;
    ctx.fillStyle = 'rgba(20,12,8,0.55)'; ctx.fillRect(0, 0, W, H);
    const x = 94, y = 10, w = 460, h = 340;
    this.panel(ctx, x, y, w, h);
    this.text(ctx, m.title, W / 2, y + 32, 22, '#3b2416', 'center', 700);
    this.text(ctx, 'ESC: zurück', x + w - 16, y + 28, 11, '#9a7a4a', 'right');
    const s = this.sctx;
    s.clearRect(0, 0, SW, SH);
    m.draw(new Pix(s), s);
    ctx.fillStyle = '#3b2416'; ctx.fillRect(122, y + 42, 404, 244);
    ctx.drawImage(this.scene, 124, y + 44, 400, 240);
    this.text(ctx, m.progress, W / 2, y + 300, 13, '#7a4a24', 'center', 600);
    const lines = this.wrap(ctx, m.hint, w - 40, 14);
    lines.forEach((ln, i) => this.text(ctx, ln, W / 2, y + 318 + i * 14, 14, '#3b2416', 'center'));
    if (m.finished) {
      const a = Math.min(1, m.doneT * 3);
      ctx.fillStyle = `rgba(40,25,15,${0.75 * a})`; ctx.fillRect(124, y + 44, 400, 240);
      ctx.globalAlpha = a;
      this.text(ctx, 'Geschafft!', W / 2, y + 140, 40, '#ffd77a', 'center', 700);
      const ls = this.wrap(ctx, m.doneMsg, 360, 16);
      ls.forEach((ln, i) => this.text(ctx, ln, W / 2, y + 172 + i * 20, 16, '#fff6dc', 'center'));
      if (m.doneT > 0.6 && Math.floor(this.t * 2) % 2 === 0) this.text(ctx, 'ENTER: weiter', W / 2, y + 262, 14, '#ffffff', 'center', 600);
      ctx.globalAlpha = 1;
    }
  },

  drawVoucher(ctx) {
    ctx.fillStyle = 'rgba(20,12,8,0.7)'; ctx.fillRect(0, 0, W, H);
    for (const c of this.confetti) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
      ctx.fillStyle = c.c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore();
    }
    const x = 64, y = 24, w = W - 128, h = H - 48;
    const pop = Math.min(1, (this.t - this.voucherT) * 3);
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.translate(-W / 2, -H / 2);
    ctx.globalAlpha = pop;
    ctx.fillStyle = '#3b2416'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#fff4d6'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#c8463a'; ctx.fillRect(x, y, w, 8); ctx.fillRect(x, y + h - 8, w, 8);
    ctx.strokeStyle = '#d9a45a'; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.strokeRect(x + 14, y + 18, w - 28, h - 36); ctx.setLineDash([]);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = 'rgba(20,12,8,0.7)';
      ctx.beginPath(); ctx.arc(x, y + 30 + i * 42, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w, y + 30 + i * 42, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#3a73b8'; ctx.fillRect(x + 32, y + 48, 128, 128);
    ctx.drawImage(this.portrait, x + 32, y + 48, 128, 128);
    ctx.strokeStyle = '#3b2416'; ctx.lineWidth = 3; ctx.strokeRect(x + 32, y + 48, 128, 128);
    const cx = x + 172 + (w - 190) / 2;
    this.text(ctx, 'GUTSCHEIN', cx, y + 56, 38, '#c8463a', 'center', 700);
    this.text(ctx, 'für einen Kochkurs', cx, y + 78, 16, '#5e3c22', 'center', 600);
    ctx.fillStyle = '#e8c48a'; ctx.fillRect(cx - 120, y + 88, 240, 2);
    this.text(ctx, COURSE.title, cx, y + 112, 17, '#7a2a2a', 'center', 700);
    this.text(ctx, 'Donnerstag, 07.01.2027 · 17:00 Uhr', cx, y + 138, 19, '#3b2416', 'center', 700);
    this.wrap(ctx, COURSE.summary, w - 210, 13).forEach((ln, i) => this.text(ctx, ln, cx, y + 162 + i * 16, 13, '#5e3c22', 'center'));
    ctx.fillStyle = '#e8c48a'; ctx.fillRect(x + 40, y + 226, w - 80, 2);
    this.text(ctx, COURSE.address, W / 2, y + 248, 14, '#3b2416', 'center', 600);
    this.text(ctx, GIFT.greeting, W / 2, y + 280, 20, '#c8463a', 'center', 700);
    ctx.restore();
    if (this.t - this.voucherT > 1 && Math.floor(this.t * 2) % 2 === 0) {
      this.text(ctx, 'ENTER: weiter in der Küche umsehen', W / 2, H - 6, 12, '#fff6dc', 'center', 600);
    }
  },
};

Game.start();
