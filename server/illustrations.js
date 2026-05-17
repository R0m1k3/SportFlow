const map = {
  'marche-sur-place.png': {
    title: 'Marche sur place',
    cue: 'Genoux bas, respiration calme',
    body: stand({ leftLeg: 'up', rightLeg: 'down', arms: 'walk' }) + arrow(520, 360, 520, 285, 'Monter doucement') + ground()
  },
  'cercles-epaules.png': {
    title: 'Cercles d épaules',
    cue: 'Petits cercles, bras le long du corps',
    body: stand({ arms: 'relaxed' }) + circleArrow(450, 245, 86, 'Petits cercles')
  },
  'cercles-chevilles.png': {
    title: 'Cercles de chevilles',
    cue: 'Appui stable ou assis',
    body: chair(250, 295) + seated({ x: 390, y: 245, leg: 'extended' }) + circleArrow(575, 430, 52, 'Cheville')
  },
  'gainage-mur.png': {
    title: 'Gainage contre un mur',
    cue: 'Corps droit, mains a hauteur poitrine',
    body: wall(660) + plankWall() + line(255, 250, 600, 350, '#e5a85c', 10) + arrow(610, 330, 650, 330, 'Mur')
  },
  'gainage-lateral-simple.png': {
    title: 'Gainage lateral simplifie',
    cue: 'Genoux plies, bassin souleve legerement',
    body: mat() + sidePlank() + arrow(455, 365, 455, 315, 'Bassin')
  },
  'respiration-abdominale.png': {
    title: 'Respiration abdominale',
    cue: 'Expirer en rentrant doucement le ventre',
    body: mat() + lyingKnees() + arrow(445, 345, 405, 345, 'Expirer') + arrow(345, 345, 385, 345, '')
  },
  'talon-glisse.png': {
    title: 'Talon glisse',
    cue: 'Le talon avance puis revient lentement',
    body: mat() + lyingHeelSlide() + arrow(510, 430, 650, 430, 'Glisser')
  },
  'genou-leve-alterne.png': {
    title: 'Genou leve alterne',
    cue: 'Lever un genou sans tirer le dos',
    body: mat() + lyingKneeLift() + arrow(545, 410, 515, 310, 'Lever')
  },
  'velo-appartement.png': {
    title: 'Velo d appartement',
    cue: 'Intensite facile, pouvoir parler',
    body: bike() + seated({ x: 430, y: 185, leg: 'bike' }) + circleArrow(500, 430, 58, 'Pedaler')
  },
  'marche-douce.png': {
    title: 'Marche douce',
    cue: 'Terrain plat, pas souple',
    body: stand({ leftLeg: 'forward', rightLeg: 'back', arms: 'walk' }) + arrow(520, 510, 640, 510, 'Avancer') + ground()
  },
  'tirage-elastique-coude-corps.png': {
    title: 'Tirage elastique coude au corps',
    cue: 'Coudes pres du corps, epaules basses',
    body: anchor(660, 270) + stand({ arms: 'row' }) + elastic(660, 270, 495, 285) + elastic(660, 285, 500, 315) + arrow(525, 300, 455, 300, 'Tirer')
  },
  'rotation-externe-elastique.png': {
    title: 'Rotation externe elastique',
    cue: 'Coude colle au corps, amplitude courte',
    body: anchor(650, 310) + stand({ arms: 'external' }) + elastic(650, 310, 505, 315) + arrow(500, 315, 560, 275, 'Tourner')
  },
  'serrage-omoplates.png': {
    title: 'Serrage des omoplates',
    cue: 'Rapprocher doucement les omoplates',
    body: stand({ back: true, arms: 'relaxed' }) + arrow(360, 270, 425, 270, '') + arrow(540, 270, 475, 270, 'Serrer')
  },
  'curl-biceps-leger.png': {
    title: 'Curl biceps leger',
    cue: 'Coudes fixes, charge tres legere',
    body: stand({ arms: 'curl' }) + bottle(340, 335) + bottle(560, 335) + arrow(545, 360, 545, 295, 'Plier')
  },
  'extension-triceps-elastique-bas.png': {
    title: 'Extension triceps elastique bas',
    cue: 'Coude pres du corps, bras jamais au-dessus',
    body: anchor(645, 455) + seated({ x: 410, y: 210, leg: 'normal', arm: 'triceps' }) + elastic(645, 455, 505, 335) + arrow(505, 335, 530, 390, 'Tendre')
  },
  'pompes-mur.png': {
    title: 'Pompes contre le mur',
    cue: 'Mains hauteur poitrine, mouvement court',
    body: wall(660) + pushWall() + arrow(530, 300, 590, 300, 'Pousser')
  },
  'rowing-bouteille-leger.png': {
    title: 'Rowing bouteille tres legere',
    cue: 'Dos droit, coude vers arriere',
    body: bentRow() + bottle(515, 370) + arrow(520, 360, 440, 300, 'Tirer')
  }
};

export function renderExerciseSvg(filename) {
  const item = map[filename] || map['marche-sur-place.png'];
  return frame(item.title, item.cue, item.body);
}

function frame(title, cue, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640" role="img" aria-label="${esc(title)}">
    <rect width="900" height="640" fill="#edf4f1"/>
    <rect x="42" y="38" width="816" height="564" rx="24" fill="#ffffff"/>
    <text x="450" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#263b3a">${esc(title)}</text>
    <text x="450" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#3f6f68">${esc(cue)}</text>
    ${body}
  </svg>`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}

function head(x = 450, y = 205) {
  return `<circle cx="${x}" cy="${y}" r="34" fill="#3f6f68"/>`;
}

function line(x1, y1, x2, y2, color = '#263b3a', width = 20) {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`;
}

function arrow(x1, y1, x2, y2, label) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const h = 18;
  const p1 = `${x2 + Math.cos(a1) * h} ${y2 + Math.sin(a1) * h}`;
  const p2 = `${x2 + Math.cos(a2) * h} ${y2 + Math.sin(a2) * h}`;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#e5a85c" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M${p1} L${x2} ${y2} L${p2}" stroke="#e5a85c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    ${label ? `<text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) - 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#8a501f">${esc(label)}</text>` : ''}`;
}

function circleArrow(cx, cy, r, label) {
  return `<path d="M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r * 0.7} ${cy + r * 0.7}" stroke="#e5a85c" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M${cx + r * 0.7} ${cy + r * 0.7} l-25 0 l12 22" stroke="#e5a85c" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${cx}" y="${cy + r + 38}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#8a501f">${esc(label)}</text>`;
}

function ground() {
  return `<path d="M210 520 H690" stroke="#d8e0dc" stroke-width="16" stroke-linecap="round"/>`;
}

function mat() {
  return `<rect x="190" y="470" width="520" height="44" rx="22" fill="#dcebe5"/>`;
}

function wall(x) {
  return `<rect x="${x}" y="165" width="28" height="350" rx="8" fill="#d8e0dc"/><text x="${x + 14}" y="545" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#697674">mur</text>`;
}

function anchor(x, y) {
  return `<rect x="${x - 18}" y="${y - 44}" width="36" height="88" rx="8" fill="#d8e0dc"/><circle cx="${x}" cy="${y}" r="10" fill="#3f6f68"/>`;
}

function elastic(x1, y1, x2, y2) {
  return `<path d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1 - 35}, ${(x1 + x2) / 2} ${y2 + 35}, ${x2} ${y2}" stroke="#4f8f86" stroke-width="8" fill="none"/>`;
}

function bottle(x, y) {
  return `<rect x="${x - 14}" y="${y - 30}" width="28" height="70" rx="10" fill="#8fb8d8"/><rect x="${x - 9}" y="${y - 48}" width="18" height="20" rx="5" fill="#6f9fbe"/>`;
}

function chair(x, y) {
  return `<path d="M${x} ${y} h130 v36 h-105 v125" stroke="#697674" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x + 120} ${y + 36} v125" stroke="#697674" stroke-width="16" stroke-linecap="round"/>`;
}

function stand(options = {}) {
  const x = 450;
  const y = 205;
  const arm = options.arms || 'relaxed';
  const legs = {
    up: line(x, 350, x - 55, 460) + line(x, 350, x + 54, 410),
    forward: line(x, 350, x - 88, 500) + line(x, 350, x + 110, 500),
    back: line(x, 350, x - 90, 500) + line(x, 350, x + 55, 500),
    down: line(x, 350, x - 60, 500) + line(x, 350, x + 60, 500)
  };
  const arms = {
    relaxed: line(x, 270, x - 70, 355, '#263b3a', 18) + line(x, 270, x + 70, 355, '#263b3a', 18),
    walk: line(x, 270, x - 85, 320, '#263b3a', 18) + line(x, 270, x + 85, 235, '#263b3a', 18),
    row: line(x, 275, x + 50, 285, '#263b3a', 18) + line(x, 305, x + 55, 315, '#263b3a', 18),
    external: line(x, 285, x + 55, 315, '#263b3a', 18) + line(x + 55, 315, x + 110, 295, '#263b3a', 18),
    curl: line(x, 275, x - 95, 335, '#263b3a', 18) + line(x, 275, x + 95, 335, '#263b3a', 18)
  };
  const torso = options.back
    ? `<path d="M405 260 C430 235 470 235 495 260 V365 H405 Z" fill="#dcebe5" stroke="#263b3a" stroke-width="14" stroke-linejoin="round"/>`
    : line(x, y + 45, x, 350, '#263b3a', 24);
  return head(x, y) + torso + arms[arm] + (legs[options.leftLeg] || legs[options.rightLeg] || legs.down);
}

function seated({ x, y, leg = 'normal', arm = 'normal' }) {
  const legs = leg === 'extended'
    ? line(x, y + 155, x + 145, y + 205) + line(x, y + 155, x - 40, y + 230)
    : leg === 'bike'
      ? line(x, y + 155, x + 70, y + 240) + line(x, y + 155, x - 55, y + 230)
      : line(x, y + 155, x + 70, y + 225) + line(x, y + 155, x - 55, y + 225);
  const arms = arm === 'triceps'
    ? line(x, y + 70, x + 70, y + 115) + line(x + 70, y + 115, x + 95, y + 175)
    : line(x, y + 70, x + 65, y + 125) + line(x, y + 70, x - 60, y + 125);
  return head(x, y) + line(x, y + 40, x, y + 155, '#263b3a', 24) + arms + legs;
}

function plankWall() {
  return head(285, 245) + line(315, 270, 520, 340, '#263b3a', 24) + line(510, 335, 620, 310) + line(510, 350, 620, 365) + line(515, 345, 400, 500) + line(515, 345, 315, 500) + ground();
}

function pushWall() {
  return head(340, 245) + line(370, 270, 520, 350, '#263b3a', 24) + line(500, 340, 625, 285) + line(500, 355, 625, 350) + line(510, 350, 405, 505) + line(510, 350, 315, 505) + ground();
}

function sidePlank() {
  return head(270, 370) + line(305, 385, 500, 385, '#263b3a', 24) + line(335, 410, 280, 470) + line(500, 385, 590, 470) + line(500, 385, 640, 470) + line(340, 385, 340, 470);
}

function lyingKnees() {
  return head(245, 382) + line(280, 395, 470, 395, '#263b3a', 24) + line(465, 395, 545, 340) + line(545, 340, 620, 470) + line(435, 395, 505, 345) + line(505, 345, 565, 470);
}

function lyingHeelSlide() {
  return head(245, 382) + line(280, 395, 455, 395, '#263b3a', 24) + line(450, 395, 530, 470) + line(450, 395, 650, 470);
}

function lyingKneeLift() {
  return head(245, 382) + line(280, 395, 455, 395, '#263b3a', 24) + line(450, 395, 535, 315) + line(535, 315, 590, 415) + line(450, 395, 640, 470);
}

function bike() {
  return `<circle cx="360" cy="440" r="62" fill="none" stroke="#697674" stroke-width="14"/><circle cx="535" cy="440" r="62" fill="none" stroke="#697674" stroke-width="14"/><path d="M360 440 L455 360 L535 440 H430 Z" stroke="#697674" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="M455 360 L455 290 M410 290 H510" stroke="#697674" stroke-width="12" stroke-linecap="round"/>`;
}

function bentRow() {
  return head(360, 245) + line(390, 270, 495, 330, '#263b3a', 24) + line(485, 330, 520, 385) + line(480, 330, 410, 500) + line(500, 335, 590, 500) + line(430, 295, 520, 350) + ground();
}
