'use strict';
// Procedurally drawn pixel sprites: teacher, workstations and room props.

function teacherSprite(blink, talk) {
  return outlined(36, 62, p => {
    const skin = '#f2c39b', skinD = '#e0a77d', hat = '#fbfbf8', hatD = '#dedcd2', hair = '#7a3b22';
    const jacket = '#f7f5ef', jacketD = '#dcd8cc';
    p.rect(11, 53, 6, 6, '#3c3a4a').rect(19, 53, 6, 6, '#3c3a4a');
    p.rect(10, 58, 7, 3, '#2b2220').rect(19, 58, 7, 3, '#2b2220');
    p.rect(4, 32, 6, 16, jacket).rect(4, 32, 2, 16, jacketD).rect(26, 32, 6, 16, jacket).rect(30, 32, 2, 16, jacketD);
    p.rect(5, 47, 5, 4, skin).rect(26, 47, 5, 4, skin);
    p.rect(8, 31, 20, 23, jacket).rect(8, 31, 2, 23, jacketD).rect(26, 31, 2, 23, jacketD);
    p.rect(10, 40, 16, 15, '#c8553d').rect(10, 40, 16, 2, '#e0715a').rect(14, 46, 8, 5, '#a8432f');
    p.rect(9, 38, 18, 2, '#a8432f');
    p.dot(13, 36, '#b9b2a2').dot(22, 36, '#b9b2a2');
    p.ellipse(18, 22, 10, 8, hair);
    p.rect(8, 22, 4, 10, hair).rect(24, 22, 4, 10, hair);
    p.rect(16, 28, 4, 4, skinD);
    p.ellipse(18, 23, 7, 7, skin);
    p.rect(13, 31, 10, 2, '#d64f3c').rect(15, 33, 6, 2, '#d64f3c').rect(17, 35, 2, 1, '#d64f3c');
    p.rect(11, 15, 14, 3, hair).rect(11, 17, 4, 2, hair).rect(21, 17, 3, 2, hair);
    p.ellipse(12, 7, 5, 5, hat).ellipse(24, 7, 5, 5, hat).ellipse(18, 5, 6, 5, hat);
    p.rect(10, 10, 16, 7, hat).rect(10, 15, 16, 2, hatD).rect(23, 4, 2, 6, hatD).rect(15, 2, 3, 1, '#ffffff');
    if (blink) {
      p.rect(13, 23, 3, 1, '#3b2416').rect(20, 23, 3, 1, '#3b2416');
    } else {
      p.rect(14, 22, 2, 3, '#3b2416').rect(20, 22, 2, 3, '#3b2416').dot(14, 22, '#ffffff').dot(20, 22, '#ffffff');
    }
    p.rect(11, 26, 2, 1, '#f29a8a').rect(23, 26, 2, 1, '#f29a8a');
    if (talk) p.rect(16, 27, 4, 2, '#8a2f2a').rect(17, 28, 2, 1, '#e0715a');
    else p.rect(16, 27, 4, 1, '#b55a4a').dot(15, 26, '#b55a4a').dot(20, 26, '#b55a4a');
  });
}

function cabinetFront(p, w, y, h) {
  p.rect(0, y, w, h, C.cab);
  for (let x = 0; x < w; x += 24) {
    p.rect(x, y, 1, h, C.cabDark).rect(x + 2, y + 2, 20, h - 7, C.cabLight).rect(x + 3, y + 3, 18, h - 9, C.cab);
    p.rect(x + 10, y + 6, 4, 2, C.handle);
  }
  p.rect(0, y + h - 3, w, 3, C.cabDark);
}

function chopBits(p, cx, cy, rx, ry, seed) {
  const r = rng(seed);
  const cols = ['#ee8a2a', '#4f8a35', '#e0402f', '#f2c230', '#7cb342'];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    p.rect(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 2, 1 + Math.round(r()), cols[i % cols.length]);
  }
}

// kind: 'cut' | 'stove' | 'sink'; done: whether the task has been completed
function islandSprite(kind, done) {
  return outlined(120, 40, p => {
    if (kind === 'cut') {
      p.rect(0, 0, 120, 18, '#d9a868').rect(0, 0, 120, 2, '#ecc287').rect(0, 16, 120, 2, '#b5844a');
      for (let x = 7; x < 120; x += 8) p.rect(x, 2, 1, 14, '#c99858');
      p.rect(12, 3, 42, 12, '#7a4f2e').rect(13, 3, 40, 11, '#efcf98').rect(13, 3, 40, 1, '#f8e2b8');
      if (!done) {
        p.rect(19, 7, 20, 3, '#ee8a2a').rect(17, 8, 2, 1, '#ee8a2a').rect(22, 7, 1, 1, '#c96a14').rect(30, 9, 1, 1, '#c96a14');
        p.rect(39, 6, 4, 1, '#6db33f').rect(39, 10, 4, 1, '#6db33f').rect(39, 7, 5, 3, '#4f9a2f');
        p.ellipse(88, 7, 4, 3, '#e0402f').dot(88, 4, '#4f9a2f').dot(86, 6, '#f2806f');
        p.ellipse(100, 8, 4, 4, '#f2c230').rect(100, 3, 1, 2, '#4f9a2f').dot(98, 6, '#f8de7a');
        p.rect(80, 12, 18, 3, '#4f8a35').rect(80, 12, 18, 1, '#6aa84f');
        p.ellipse(110, 9, 3, 3, '#c9a0d6').dot(110, 5, '#7cb342');
      } else {
        chopBits(p, 30, 9, 12, 3, 3);
        p.ellipse(96, 9, 14, 6, '#e9e4d8').ellipse(96, 8, 11, 4, '#f7f3ea');
        chopBits(p, 96, 8, 9, 3, 11);
      }
      p.rect(58, 9, 15, 2, '#d7dde1').rect(58, 9, 15, 1, '#ffffff').rect(73, 8, 8, 4, '#3b2a20');
      cabinetFront(p, 120, 18, 22);
    } else if (kind === 'stove') {
      p.rect(0, 0, 120, 18, C.steel).rect(0, 0, 120, 2, C.steelLight).rect(0, 16, 120, 2, C.steelDark);
      p.rect(6, 2, 60, 14, '#26262b').rect(6, 2, 60, 1, '#4a4a52');
      for (const bx of [21, 51]) p.ellipse(bx, 9, 9, 4, '#1b1b1f').ring(bx, 9, 9, 4, '#55333a');
      if (done) {
        p.ring(21, 9, 10, 5, '#ff7a3a');
        p.ellipse(21, 8, 10, 6, '#8d969c').ellipse(21, 8, 8, 4, '#e08a3c').rect(9, 7, 2, 2, '#6c7277').rect(31, 7, 2, 2, '#6c7277');
        chopBits(p, 21, 8, 6, 2, 21);
      } else {
        p.ellipse(92, 8, 10, 6, '#8d969c').ellipse(92, 8, 8, 4, '#4a5258').rect(80, 7, 2, 2, '#6c7277').rect(102, 7, 2, 2, '#6c7277');
        p.ellipse(92, 9, 6, 2, '#3a4045');
      }
      p.rect(108, 4, 2, 10, '#b5844a').ellipse(109, 13, 2, 2, '#b5844a');
      cabinetFront(p, 120, 18, 22);
      for (let i = 0; i < 4; i++) p.ellipse(10 + i * 10, 21, 2, 1, '#2b2b30');
    } else {
      p.rect(0, 0, 120, 18, '#dcd7cc').rect(0, 0, 120, 2, '#eeeae2').rect(0, 16, 120, 2, '#bdb6a8');
      p.rect(32, 2, 42, 14, C.steelDark).rect(34, 3, 38, 12, '#7f8b93').rect(34, 3, 38, 2, '#69757d');
      p.ellipse(53, 10, 2, 1, '#4a5258');
      if (done) p.rect(35, 6, 36, 8, '#9ec3d6').rect(38, 7, 6, 1, '#d6ecf5').rect(55, 10, 8, 1, '#d6ecf5');
      p.rect(51, 0, 4, 4, C.steelLight).rect(52, 3, 2, 4, '#9aa5ad');
      p.rect(14, 6, 9, 6, '#f2d14b').rect(14, 6, 9, 2, '#5aa84a');
      if (!done) {
        for (const [px, py] of [[92, 10], [95, 7], [90, 5]]) {
          p.ellipse(px, py, 10, 4, '#fbfaf6').ellipse(px, py, 7, 2, '#e9e4d8');
          p.rect(px - 4, py - 1, 3, 2, '#8a5a2b').rect(px + 2, py, 2, 1, '#b5442f');
        }
      } else {
        p.rect(82, 4, 32, 11, '#9aa5ad').rect(83, 5, 30, 9, '#c9d1d6');
        for (let i = 0; i < 5; i++) p.rect(85 + i * 6, 1, 3, 12, '#fbfaf6').rect(86 + i * 6, 2, 1, 9, '#ffffff');
      }
      cabinetFront(p, 120, 18, 22);
    }
  });
}

function demoCounterSprite() {
  return outlined(216, 36, p => {
    p.rect(0, 0, 216, 16, C.marble).rect(0, 0, 216, 2, '#ffffff').rect(0, 14, 216, 2, '#cfccc4');
    const r = rng(5);
    for (let i = 0; i < 14; i++) {
      let x = r() * 216, y = r() * 12 + 2;
      for (let k = 0; k < 8; k++) { p.dot(x, y, C.marbleVein); x += 1; y += r() < 0.5 ? 0 : (r() < 0.5 ? -1 : 1); y = Math.max(2, Math.min(13, y)); }
    }
    p.rect(0, 16, 216, 20, '#8a5a35');
    for (let x = 0; x < 216; x += 27) p.rect(x, 16, 1, 20, '#6b4528').rect(x + 3, 19, 21, 13, '#9c6a40').rect(x + 4, 20, 19, 11, '#8a5a35');
    p.rect(0, 33, 216, 3, '#5e3c22');
    // plaque on the front
    const label = 'KURSLEITUNG';
    p.rect(78, 20, textWidth(label) + 8, 11, '#3b2a1e').rect(79, 21, textWidth(label) + 6, 9, '#e7c37a');
    p.text(label, 82, 23, '#5e3c22');
    // props on the counter top
    p.ellipse(34, 7, 15, 6, '#e9e4d8').ellipse(34, 6, 12, 4, '#7cb342');
    for (const [dx, dy, c] of [[-6, 5, '#e0402f'], [3, 4, '#e0402f'], [-1, 7, '#f2c230'], [7, 7, '#ee8a2a'], [-8, 7, '#ffffff']]) p.rect(34 + dx, dy, 3, 2, c);
    p.rect(62, 2, 30, 12, '#a8743f').rect(63, 3, 28, 10, '#c98a3c');
    for (let i = 0; i < 6; i++) p.ellipse(67 + i * 4.5, 7 + (i % 2) * 2, 2, 2, ['#e0402f', '#ee8a2a', '#7cb342', '#f2c230', '#c9a0d6', '#4f8a35'][i]);
    p.rect(140, 3, 26, 11, '#8d969c').rect(141, 4, 24, 9, '#eef2f4').rect(152, 4, 2, 9, '#cfd5d9');
    for (let i = 0; i < 3; i++) { p.rect(143, 6 + i * 2, 7, 1, '#9aa5ad'); p.rect(156, 6 + i * 2, 7, 1, '#9aa5ad'); }
    p.ellipse(190, 9, 5, 3, '#d4af37').ellipse(190, 7, 3, 2, '#f0d264').dot(190, 4, '#d4af37');
    p.rect(110, 4, 18, 8, '#efcf98').ellipse(116, 8, 3, 3, '#f4e3b2').ellipse(122, 8, 3, 3, '#c9a0d6');
  });
}

function bookshelfSprite() {
  return outlined(48, 60, p => {
    p.rect(0, 0, 48, 60, '#6b4528').rect(0, 0, 48, 4, '#94653c');
    const r = rng(9);
    const cols = ['#c0392b', '#2e86ab', '#e9a23b', '#4f8a35', '#8e44ad', '#f4f1e6', '#d35400'];
    for (const sy of [5, 23, 41]) {
      p.rect(2, sy, 44, 16, '#3d2817');
      let x = 3;
      while (x < 44) {
        const bw = 3 + Math.floor(r() * 3), bh = 10 + Math.floor(r() * 5);
        if (x + bw > 45) break;
        p.rect(x, sy + 16 - bh, bw, bh, cols[Math.floor(r() * cols.length)]).rect(x, sy + 18 - bh, bw, 1, 'rgba(255,255,255,0.35)');
        x += bw + (r() < 0.2 ? 2 : 0);
      }
      p.rect(0, sy + 16, 48, 2, '#94653c');
    }
  });
}

function catSprite(breath) {
  return outlined(40, 22, p => {
    p.ellipse(20, 13, 19, 8, '#a8743f');
    for (let x = 4; x < 38; x += 4) p.rect(x, 12, 1, 7, '#8a5a2b');
    p.ellipse(20, 11, 15, 5, '#c0504d');
    p.rect(8, 12, 14, 2, '#e8933a').rect(7, 11, 3, 2, '#e8933a');
    p.ellipse(18, 9 - breath, 10, 4 + breath, '#e8933a');
    for (const sx of [12, 16, 20]) p.rect(sx, 6 - breath, 1, 5, '#c46f24');
    p.ellipse(28, 9, 5, 4, '#e8933a');
    p.rect(24, 4, 2, 2, '#e8933a').rect(31, 4, 2, 2, '#e8933a').dot(25, 5, '#f4b07a').dot(31, 5, '#f4b07a');
    p.rect(25, 9, 2, 1, '#5a3b26').rect(29, 9, 2, 1, '#5a3b26').dot(28, 11, '#e88a8a');
  });
}

function plantSprite(seed) {
  return outlined(30, 46, p => {
    const r = rng(seed);
    const greens = ['#3f7a2e', '#4f8a35', '#6aa84f'];
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.6, d = 6 + r() * 7;
      p.ellipse(15 + Math.cos(a) * d, 18 + Math.sin(a) * d, 5, 4, greens[i % 3]);
    }
    p.ellipse(15, 16, 5, 4, '#8cc66a');
    p.rect(8, 30, 14, 15, '#c66b3d').rect(7, 28, 16, 4, '#d98454').rect(9, 33, 2, 10, '#e0956a');
  });
}

function coatRackSprite() {
  return outlined(22, 52, p => {
    p.rect(10, 6, 2, 44, '#6b4528').ellipse(11, 49, 8, 2, '#5e3c22');
    p.rect(5, 8, 12, 2, '#6b4528');
    p.rect(4, 11, 14, 22, '#c8553d').rect(4, 11, 14, 2, '#e0715a').rect(7, 22, 8, 6, '#a8432f').rect(3, 10, 2, 4, '#a8432f').rect(17, 10, 2, 4, '#a8432f');
    p.ellipse(11, 3, 5, 3, '#fbfbf8').rect(7, 4, 9, 3, '#fbfbf8').rect(7, 6, 9, 1, '#dedcd2');
  });
}

function sacksSprite() {
  return outlined(40, 30, p => {
    p.ellipse(11, 18, 10, 11, '#efe6d0').rect(8, 5, 6, 3, '#c9b99a').rect(9, 3, 4, 2, '#efe6d0');
    p.text('MEHL', 4, 16, '#a8743f');
    p.ellipse(29, 21, 9, 8, '#d9c9a3').rect(27, 11, 5, 3, '#b5a37c');
    for (const [x, y] of [[25, 18], [31, 20], [28, 24]]) p.ellipse(x, y, 2, 2, '#c9a0d6');
  });
}

// Small "!" quest marker and a key-hint bubble.
function markerSprite() {
  return outlined(8, 14, p => {
    p.rect(2, 0, 4, 9, '#ffd23f').rect(2, 0, 4, 1, '#fff2a8').rect(2, 11, 4, 3, '#ffd23f');
  });
}
function checkSprite() {
  return outlined(12, 10, p => {
    p.rect(0, 5, 3, 3, '#5ccf5c').rect(2, 7, 3, 3, '#5ccf5c').rect(4, 5, 3, 3, '#5ccf5c').rect(6, 3, 3, 3, '#5ccf5c').rect(8, 1, 3, 3, '#5ccf5c').rect(10, 0, 2, 2, '#5ccf5c');
  });
}
