'use strict';
// Static background of the cooking studio (floor, walls, back counters).
const C = {
  ink: '#2b1b16',
  floor: ['#c08a52', '#b98349', '#c99459'], seam: '#8a5a32', seamDark: '#704626',
  wall: '#9db58c', wallStripe: '#93ab82', trim: '#7a4f2e', trimLight: '#a06d42', ceiling: '#4a3022',
  tile: '#f1ebdf', grout: '#d3c8b4',
  cab: '#4f8077', cabDark: '#3b6159', cabLight: '#6a9c90', handle: '#e2d2a8',
  top: '#e3bd84', topEdge: '#c49a62', topDark: '#a87e4b',
  steel: '#cdd5da', steelDark: '#97a3ab', steelLight: '#f1f5f7',
  marble: '#efeee9', marbleVein: '#d9d6ce', white: '#fbfaf6',
  sideWall: '#3d2a1f', sideWallLight: '#5b3f2c',
};

function drawWindow(p, x, y, w, h) {
  // glass is filled per frame (night sky + snow); here only the sill and frame shadow
  p.rect(x - 3, y - 3, w + 6, h + 6, '#6f4a2c');
  p.rect(x - 2, y - 2, w + 4, h + 4, '#8d6038');
  p.rect(x, y, w, h, '#1d2a4a');
  p.rect(x - 4, y + h + 1, w + 8, 4, '#a87a4c');
  p.rect(x - 4, y + h + 5, w + 8, 1, '#6f4a2c');
}
function drawWindowFrame(p, x, y, w, h) {
  p.rect(x + w / 2 - 1, y, 2, h, '#8d6038');
  p.rect(x, y + h / 2 - 1, w, 2, '#8d6038');
  p.rect(x, y, w, 2, 'rgba(255,255,255,0.08)');
}

function drawJar(p, x, y, col, lid) {
  p.rect(x, y + 2, 7, 9, C.ink).rect(x + 1, y + 3, 5, 7, col).rect(x + 1, y, 5, 3, lid).rect(x + 2, y + 4, 1, 4, 'rgba(255,255,255,0.45)');
}

function buildBackground() {
  const [cv, ctx] = makeCanvas(W, H);
  const p = new Pix(ctx);
  const r = rng(7);

  // --- wooden plank floor
  for (let y = 72, row = 0; y < H; y += 8, row++) {
    let x = -((row * 37) % 60);
    while (x < W) {
      const len = 40 + Math.floor(r() * 50);
      const col = C.floor[Math.floor(r() * 3)];
      p.rect(x, y, len, 8, col);
      p.rect(x, y + 7, len, 1, C.seam);
      p.rect(x + len - 1, y, 1, 7, C.seamDark);
      for (let k = 0; k < 3; k++) {
        p.rect(x + 3 + Math.floor(r() * (len - 10)), y + 2 + Math.floor(r() * 4), 4 + Math.floor(r() * 6), 1, 'rgba(110,65,30,0.25)');
      }
      x += len;
    }
  }

  // --- big rug in the open area in front of the islands
  const rx = 168, ry = 266, rw = 312, rh = 62;
  p.rect(rx, ry, rw, rh, '#7d2e2a').rect(rx + 3, ry + 3, rw - 6, rh - 6, '#b4473c');
  p.rect(rx + 7, ry + 7, rw - 14, rh - 14, '#7d2e2a').rect(rx + 9, ry + 9, rw - 18, rh - 18, '#d9a45a');
  p.rect(rx + 12, ry + 12, rw - 24, rh - 24, '#b4473c');
  for (let i = 0; i < 9; i++) {
    const cx = rx + 30 + i * 32, cy = ry + rh / 2;
    p.rect(cx - 1, cy - 9, 3, 19, '#e7c37a').rect(cx - 9, cy - 1, 19, 3, '#e7c37a').rect(cx - 3, cy - 3, 7, 7, '#7d2e2a');
  }
  for (let x = rx + 2; x < rx + rw - 2; x += 4) { p.rect(x, ry - 3, 2, 3, '#e8d6b0'); p.rect(x, ry + rh, 2, 3, '#e8d6b0'); }

  // --- back wall
  p.rect(0, 0, W, 72, C.wall);
  for (let x = 4; x < W; x += 12) p.rect(x, 6, 4, 38, C.wallStripe);
  p.rect(0, 0, W, 6, C.ceiling).rect(0, 6, W, 2, '#5f3f2b');
  p.rect(0, 44, W, 4, C.trim).rect(0, 44, W, 1, C.trimLight);
  p.rect(0, 48, W, 26, C.tile);
  for (let y = 48; y < 74; y += 6) p.rect(0, y, W, 1, C.grout);
  for (let y = 48, k = 0; y < 74; y += 6, k++) for (let x = (k % 2) * 6; x < W; x += 12) p.rect(x, y, 1, 6, C.grout);

  // windows
  drawWindow(p, 74, 12, 44, 40);
  drawWindow(p, 534, 12, 44, 40);

  // chalkboard
  const bx = 134, by = 9, bw = 100, bh = 52;
  p.rect(bx - 4, by - 4, bw + 8, bh + 8, '#6b4528').rect(bx - 3, by - 3, bw + 6, bh + 6, '#94653c');
  p.rect(bx, by, bw, bh, '#2f4a3a').rect(bx, by, bw, 2, '#3a5a47');
  p.rect(bx - 2, by + bh + 3, bw + 4, 3, '#94653c');
  p.rect(bx + 70, by + bh, 8, 2, '#f4f1e6').rect(bx + 82, by + bh, 6, 2, '#e9a2a2');
  const chalk = '#eef0e6';
  p.text('KOCHKURS', bx + (bw - textWidth('KOCHKURS', 2)) / 2, by + 5, chalk, 2);
  p.rect(bx + 16, by + 17, bw - 32, 1, 'rgba(238,240,230,0.5)');
  p.text('DO 07.01.2027', bx + (bw - textWidth('DO 07.01.2027')) / 2, by + 22, '#ffd77a');
  p.text('17:00 UHR', bx + (bw - textWidth('17:00 UHR')) / 2, by + 30, '#ffd77a');
  // chalk doodles: carrot, pot, heart
  p.rect(bx + 10, by + 40, 12, 3, '#f2a65a').rect(bx + 8, by + 39, 3, 2, '#9fd27a').rect(bx + 7, by + 41, 2, 1, '#9fd27a');
  p.rect(bx + 40, by + 40, 18, 7, chalk).rect(bx + 41, by + 41, 16, 5, '#2f4a3a').rect(bx + 37, by + 41, 3, 1, chalk).rect(bx + 58, by + 41, 3, 1, chalk);
  p.rect(bx + 44, by + 36, 1, 3, chalk).rect(bx + 49, by + 35, 1, 3, chalk).rect(bx + 54, by + 36, 1, 3, chalk);
  p.text('♥', bx + 80, by + 40, '#f08a8a', 2);

  // utensil rail
  p.rect(244, 18, 34, 2, '#8a8f94');
  p.rect(248, 20, 1, 12, '#6c7277').ellipse(248, 34, 3, 2, '#9aa3a9');            // ladle
  p.rect(258, 20, 1, 9, '#6c7277').ellipse(258, 32, 2, 4, '#c8ced2').ring(258, 32, 2, 4, '#8d969c'); // whisk
  p.rect(268, 20, 1, 10, '#6b4528').rect(266, 30, 5, 6, '#3d3a3a');                // spatula
  p.rect(274, 20, 1, 8, '#6c7277').rect(272, 28, 5, 3, '#c8ced2');

  // extractor hood above the teacher's range
  p.rect(300, 6, 48, 10, C.steelDark).rect(301, 6, 46, 9, C.steel);
  p.rect(290, 16, 68, 22, C.ink).rect(291, 16, 66, 21, C.steel).rect(291, 16, 66, 3, C.steelLight);
  p.rect(291, 34, 66, 3, C.steelDark);
  for (let x = 298; x < 352; x += 6) p.rect(x, 24, 3, 6, C.steelDark);
  p.rect(316, 40, 16, 4, '#ffe9a8');

  // clock frame (hands drawn live)
  p.ellipse(384, 26, 11, 11, '#6b4528').ellipse(384, 26, 9, 9, '#fbf7ea');
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    p.dot(384 + Math.round(Math.sin(a) * 7), 26 - Math.round(Math.cos(a) * 7), '#5a4636');
  }

  // calendar: January 2027 with the 7th circled
  p.rect(404, 12, 28, 34, '#d8d0bf').rect(405, 12, 26, 33, '#fbf8ef').rect(405, 12, 26, 8, '#c8463a');
  p.text('JAN', 405 + (26 - textWidth('JAN')) / 2, 14, '#fff');
  p.text('7', 414, 25, '#2b2b2b', 2);
  p.ring(418, 30, 8, 7, '#d23a2a').ring(418, 30, 9, 8, '#d23a2a');
  p.rect(417, 9, 2, 4, '#555');

  // open shelves with jars and plates
  for (const sy of [24, 44]) { p.rect(440, sy, 80, 3, '#94653c').rect(440, sy + 3, 80, 1, '#5e3c22'); }
  const jars = [['#e9a23b', '#7a4f2e'], ['#c0392b', '#a3a3a3'], ['#7cb342', '#7a4f2e'], ['#f4e3b2', '#c0392b'], ['#8e5a3c', '#a3a3a3']];
  jars.forEach((j, i) => drawJar(p, 444 + i * 15, 13, j[0], j[1]));
  for (let i = 0; i < 4; i++) p.rect(446 + i * 3, 31, 2, 13, i % 2 ? '#e8e4dc' : '#fbfaf6');
  p.rect(466, 34, 14, 10, '#c95d3a').rect(467, 35, 12, 3, '#e37c55');
  drawJar(p, 488, 33, '#5d8aa8', '#7a4f2e'); drawJar(p, 500, 33, '#f2d16b', '#7a4f2e');

  // spice rack next to the right window
  p.rect(598, 20, 30, 28, '#94653c').rect(600, 22, 26, 24, '#6b4528');
  for (let i = 0; i < 2; i++) for (let k = 0; k < 4; k++) {
    p.rect(602 + k * 6, 24 + i * 12, 4, 9, ['#c0392b', '#e9a23b', '#7cb342', '#8e5a3c'][(k + i) % 4]).rect(602 + k * 6, 24 + i * 12, 4, 2, '#ddd');
  }

  // --- side walls and bottom wall with the door
  p.rect(0, 0, 10, H, C.sideWall).rect(9, 0, 2, H, C.sideWallLight);
  p.rect(W - 10, 0, 10, H, C.sideWall).rect(W - 11, 0, 2, H, C.sideWallLight);
  p.rect(0, 346, W, 14, C.sideWall).rect(0, 345, W, 2, C.sideWallLight);
  p.rect(294, 345, 60, 15, '#2a1c14').rect(296, 345, 56, 15, '#3a2a1e');
  p.rect(294, 343, 60, 3, '#8d6038');
  // doormat
  p.rect(298, 322, 52, 20, '#5e4a2e').rect(300, 324, 48, 16, '#8b6d3f');
  p.text('HALLO', 324 - textWidth('HALLO') / 2, 330, '#e8d6b0');

  // --- back counters along the wall (y 66..97)
  p.rect(10, 96, W - 20, 5, 'rgba(60,30,10,0.25)');
  counterRun(p, 60, 288);
  counterRun(p, 360, 628);
  drawRange(p, 288);
  drawFridge(p, 12);
  counterProps(p);
  return cv;
}

function counterRun(p, x0, x1) {
  p.rect(x0, 66, x1 - x0, 13, C.ink).rect(x0, 66, x1 - x0, 12, C.top).rect(x0, 66, x1 - x0, 2, '#f0d3a2');
  p.rect(x0, 78, x1 - x0, 1, C.topDark);
  p.rect(x0, 79, x1 - x0, 18, C.cab);
  for (let x = x0; x < x1; x += 24) {
    p.rect(x, 79, 1, 18, C.cabDark).rect(x + 2, 81, 20, 13, C.cabLight).rect(x + 3, 82, 18, 11, C.cab);
    p.rect(x + 10, 84, 4, 2, C.handle);
  }
  p.rect(x0, 95, x1 - x0, 2, C.cabDark);
}

function drawRange(p, x) {
  p.rect(x, 66, 72, 31, C.ink);
  p.rect(x + 1, 66, 70, 12, '#2e2e33').rect(x + 1, 66, 70, 1, '#55555c');
  for (const bx of [x + 14, x + 34, x + 56]) p.ellipse(bx, 72, 6, 3, '#1c1c20').ring(bx, 72, 6, 3, '#5a5a62');
  p.rect(x + 1, 78, 70, 19, C.steel).rect(x + 1, 78, 70, 4, C.steelDark);
  for (let i = 0; i < 5; i++) p.ellipse(x + 10 + i * 13, 80, 2, 1, '#2b2b30');
  p.rect(x + 12, 84, 48, 11, '#2b2b30').rect(x + 14, 86, 44, 7, '#7a3f22').rect(x + 14, 86, 44, 2, '#b8693a');
  p.rect(x + 16, 83, 40, 1, '#5a5a62');
}

function drawFridge(p, x) {
  p.rect(x, 14, 48, 83, C.ink);
  p.rect(x + 1, 15, 46, 81, '#dfe6ea').rect(x + 1, 15, 46, 2, '#ffffff').rect(x + 44, 15, 3, 81, '#b9c3c9');
  p.rect(x + 1, 45, 46, 2, '#9aa5ad');
  p.rect(x + 38, 22, 3, 18, '#8d969c').rect(x + 38, 52, 3, 26, '#8d969c');
  // fridge magnets + a photo note
  p.rect(x + 8, 20, 12, 14, '#fff6d6').rect(x + 10, 23, 8, 1, '#999').rect(x + 10, 26, 6, 1, '#999').rect(x + 12, 19, 3, 3, '#d23a2a');
  p.rect(x + 24, 26, 5, 5, '#3aa0d2').rect(x + 10, 56, 6, 6, '#f2c94c').rect(x + 22, 62, 7, 4, '#7cb342');
  p.rect(x + 1, 93, 46, 3, '#9aa5ad');
}

function counterProps(p) {
  // herbs on the left window sill area
  for (const [hx, col] of [[78, '#5f9e3a'], [94, '#7cb342'], [110, '#4f8a35']]) {
    p.rect(hx - 4, 62, 9, 8, '#b85b35').rect(hx - 4, 62, 9, 2, '#d47a4f');
    p.ellipse(hx, 57, 5, 5, col).dot(hx - 2, 55, '#9ad46a').dot(hx + 2, 58, '#9ad46a');
  }
  // knife block
  p.rect(140, 56, 10, 14, '#7a4f2e').rect(141, 51, 2, 6, '#333').rect(144, 50, 2, 7, '#333').rect(147, 52, 2, 5, '#333');
  // red stand mixer
  p.rect(160, 54, 22, 6, '#c8392f').rect(160, 54, 22, 2, '#e25a4c').rect(176, 58, 6, 12, '#c8392f');
  p.ellipse(166, 66, 6, 3, C.steel).rect(162, 62, 9, 4, C.steelDark);
  // bread board with a loaf
  p.rect(196, 64, 30, 8, '#c49a62').ellipse(210, 63, 11, 5, '#c98a3c').rect(203, 60, 2, 3, '#e8b46a').rect(209, 59, 2, 3, '#e8b46a').rect(215, 60, 2, 3, '#e8b46a');
  // kettle
  p.ellipse(384, 62, 8, 7, '#d45b3a').rect(378, 54, 12, 2, '#2b2b30').rect(391, 60, 4, 2, '#d45b3a').rect(381, 58, 3, 3, '#f08463');
  // fruit bowl
  p.ellipse(424, 68, 12, 4, '#7a4f2e').ellipse(418, 63, 4, 4, '#e74c3c').ellipse(426, 62, 4, 4, '#f39c12').ellipse(431, 65, 3, 3, '#a3c94a').ellipse(422, 66, 3, 3, '#f1c40f');
  // stacked bowls
  p.rect(452, 64, 16, 6, '#e9e4d8').rect(454, 59, 12, 5, '#d6cfbe').rect(456, 55, 8, 4, '#e9e4d8');
  // coffee machine
  p.rect(494, 46, 18, 26, '#2e2e33').rect(496, 48, 14, 8, '#45454c').rect(500, 60, 6, 6, '#eae4d6').rect(497, 50, 3, 2, '#7cd67c');
  // herbs + oil bottles under right window
  for (const [hx, col] of [[540, '#5f9e3a'], [556, '#7cb342']]) {
    p.rect(hx - 4, 62, 9, 8, '#b85b35').rect(hx - 4, 62, 9, 2, '#d47a4f').ellipse(hx, 57, 5, 5, col);
  }
  p.rect(568, 52, 5, 18, '#b9a64a').rect(569, 49, 3, 4, '#3c3c3c').rect(576, 56, 5, 14, '#7a2a2a').rect(577, 53, 3, 4, '#3c3c3c');
  // towel hanging from the counter
  p.rect(236, 79, 10, 14, '#f4f1e6').rect(236, 83, 10, 2, '#d23a2a').rect(236, 88, 10, 2, '#d23a2a');
}

// Pre-rendered vignette for the cozy evening mood.
function buildVignette() {
  const [cv, ctx] = makeCanvas(W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(40,20,5,0)');
  g.addColorStop(1, 'rgba(40,20,5,0.38)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, rad] of [[132, 230, 90], [324, 230, 90], [516, 230, 90], [324, 150, 120]]) {
    const l = ctx.createRadialGradient(x, y, 0, x, y, rad);
    l.addColorStop(0, 'rgba(255,190,110,0.10)');
    l.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = l; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return cv;
}
