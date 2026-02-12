let blocks = [];
let targets = [];
let dust = [];
const phrase = "cho <3 wan";

// AUDIO VARIABLES
let polySynth;
let notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
let isAudioStarted = false;
let lastJingleTime = 0;
let lastNoteTime = 0;

// MOJI GANG VARIABLES
let mojis = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  rectMode(CENTER);
  angleMode(DEGREES);
  
  for (let i = 0; i < 60; i++) {
    dust.push({
      pos: createVector(random(width), random(height)),
      z: random(1, 5),
      size: random(1, 4),
    });
  }
  
  initBlocks();
  polySynth = new p5.PolySynth();
  initMojis();
}

function initMojis() {
  let isMobile = width < height;
  let mBaseSize = isMobile ? width * 0.12 : 70;
  
  mojis = [
    { pos: createVector(-100, -100), target: createVector(mBaseSize*0.4, mBaseSize*0.4), corner: 'TL', size: mBaseSize, rot: 135, delay: 0 },
    { pos: createVector(width + 100, -100), target: createVector(width - mBaseSize*0.4, mBaseSize*0.4), corner: 'TR', size: mBaseSize*0.9, rot: 225, delay: 25 },
    { pos: createVector(width + 100, height + 100), target: createVector(width - mBaseSize*0.4, height - mBaseSize*0.4), corner: 'BR', size: mBaseSize*1.05, rot: 315, delay: 50 },
    { pos: createVector(-100, height + 100), target: createVector(mBaseSize*0.4, height - mBaseSize*0.4), corner: 'BL', size: mBaseSize*1.1, rot: 45, delay: 75 }
  ];
}

function startAudioOnce() {
  if (!isAudioStarted) {
    userStartAudio().then(() => {
      isAudioStarted = true;
      playSonicSignature();
      playCuteMelody();
    });
  }
}

function mousePressed() { startAudioOnce(); }
function touchStarted() { startAudioOnce(); return false; }

function playSonicSignature() {
  let sigNotes = ['C5', 'B5', 'G6']; 
  let time = 0;
  for (let i = 0; i < sigNotes.length; i++) {
    polySynth.play(sigNotes[i], 0.12, time, 0.1);
    time += 0.08;
  }
}

function playCuteMelody() {
  if (!isAudioStarted) return;
  let note = random(notes);
  polySynth.play(note, 0.06, 0, 0.25);
  let nextNoteIn = random([500, 1000, 1500]);
  setTimeout(playCuteMelody, nextNoteIn);
}

function initBlocks() {
  blocks = [];
  targets = [];
  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textStyle(BOLD);
  pg.textFont('Verdana');

  let fontSize = width / (phrase.length * 0.72); 
  let maxH = height * 0.38;
  if (fontSize > maxH) fontSize = maxH;
  
  pg.textSize(fontSize);
  pg.text(phrase, width / 2, height / 2);
  pg.loadPixels();

  let step = fontSize * 0.085; 
  if (step < 7) step = 7;
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let index = (Math.floor(x) + Math.floor(y) * width) * 4;
      if (pg.pixels[index] > 128) {
        targets.push(createVector(x, y));
      }
    }
  }

  let colors = [color(255, 120, 150), color(100, 210, 255), color(255, 190, 210)];

  for (let i = 0; i < targets.length; i++) {
    blocks.push({
      pos: createVector(random(width), random(height)),
      target: targets[i],
      vel: createVector(random(-5, 5), random(-5, 5)),
      acc: createVector(0, 0),
      size: step * 0.9,
      color: random(colors),
      angle: random(360),
      noiseSeed: random(1000),
      elasticity: random(0.08, 0.12)
    });
  }
}

function draw() {
  setGradient(0, 0, width, height, color(250, 242, 230), color(240, 230, 210));

  let mousePos = getInteractor();

  for (let d of dust) {
    let px = d.pos.x + (mouseX - width/2) * (0.01 * d.z);
    let py = d.pos.y + (mouseY - height/2) * (0.01 * d.z);
    fill(200, 180, 150, 40 / d.z);
    ellipse(px, py, d.size);
  }

  for (let b of blocks) {
    let d = p5.Vector.dist(b.pos, mousePos);
    if (d < 120) {
      let force = p5.Vector.sub(b.pos, mousePos);
      force.setMag(16);
      b.acc.add(force);
      b.angle += 30; 
      if (isAudioStarted && millis() - lastNoteTime > 150 && random(1) < 0.15) {
        polySynth.play(random(notes), 0.03, random(0, 0.1), 0.1);
        lastNoteTime = millis();
      }
      if (isAudioStarted && d < 30 && millis() - lastJingleTime > 4000) {
        playSonicSignature();
        lastJingleTime = millis();
      }
    } else {
      let force = p5.Vector.sub(b.target, b.pos);
      let dist = force.mag();
      if (dist < 10) {
        let wiggle = noise(b.noiseSeed + frameCount * 0.05) * 2 - 1;
        force.add(createVector(wiggle, wiggle));
        b.angle = lerp(b.angle, wiggle * 5, 0.1);
      }
      force.mult(b.elasticity); 
      b.acc.add(force);
    }
    b.vel.add(b.acc);
    b.vel.limit(22);
    b.pos.add(b.vel);
    b.acc.mult(0);
    b.vel.mult(0.84);

    push();
    translate(b.pos.x, b.pos.y);
    rotate(b.angle);
    let shadowOff = p5.Vector.sub(b.pos, mousePos).setMag(4);
    noStroke();
    fill(0, 15);
    rect(shadowOff.x, shadowOff.y, b.size, b.size, 3);
    fill(b.color);
    rect(0, 0, b.size, b.size, 3);
    fill(255, 100);
    rect(-b.size*0.25, -b.size*0.25, b.size*0.2, b.size*0.2, 1);
    pop();
  }

  drawSignature();
  
  for (let m of mojis) {
    drawMoji(m, mousePos);
  }
}

function drawMoji(m, mousePos) {
  // STAGGERED AUTO-POP LOGIC
  let welcomePop = 0;
  let relFrame = frameCount - m.delay;
  
  if (relFrame > 0) {
    if (relFrame < 120) {
      welcomePop = map(relFrame, 0, 60, 0, 1, true); 
    } else if (relFrame < 240) {
      welcomePop = map(relFrame, 180, 240, 1, 0, true);
    }
  }

  let distToCorner = p5.Vector.dist(mousePos, m.target);
  let peekRange = width < height ? 200 : 500;
  let peekFactor = max(welcomePop, map(distToCorner, 0, peekRange, 1, 0, true));
  
  let hidePos;
  if (m.corner === 'TL') hidePos = createVector(-m.size, -m.size);
  if (m.corner === 'TR') hidePos = createVector(width + m.size, -m.size);
  if (m.corner === 'BL') hidePos = createVector(-m.size, height + m.size);
  if (m.corner === 'BR') hidePos = createVector(width + m.size, height + m.size);
  
  m.pos.x = lerp(m.pos.x, lerp(hidePos.x, m.target.x, peekFactor), 0.08);
  m.pos.y = lerp(m.pos.y, lerp(hidePos.y, m.target.y, peekFactor), 0.08);

  push();
  translate(m.pos.x, m.pos.y);
  rotate(m.rot);
  let bounce = sin(frameCount * 0.1 + m.size) * 3;
  translate(0, bounce);
  noStroke();
  fill(255);
  ellipse(0, m.size * 0.4, m.size, m.size);
  ellipse(0, -m.size * 0.2, m.size * 0.8, m.size * 0.8);
  let mouseRel = p5.Vector.sub(mousePos, m.pos);
  mouseRel.rotate(-m.rot);
  mouseRel.limit(m.size * 0.1);
  fill(0);
  let eyeX = m.size * 0.18;
  let eyeY = -m.size * 0.25;
  ellipse(-eyeX + mouseRel.x, eyeY + mouseRel.y, m.size * 0.14, m.size * 0.14);
  ellipse(eyeX + mouseRel.x, eyeY + mouseRel.y, m.size * 0.14, m.size * 0.14);
  fill(255);
  ellipse(-eyeX - 1 + mouseRel.x, eyeY - 1 + mouseRel.y, 2, 2);
  ellipse(eyeX - 1 + mouseRel.x, eyeY - 1 + mouseRel.y, 2, 2);
  pop();
}

function drawSignature() {
  push();
  textAlign(RIGHT, BOTTOM);
  textFont('Verdana');
  textStyle(BOLD);
  textSize(14);
  let sigY = height - 20 + sin(frameCount * 0.05) * 3;
  fill(0, 20);
  text("© CHO | 2024", width - 19, sigY + 1);
  fill(255, 120, 150); 
  text("© CHO | 2024", width - 20, sigY);
  pop();
}

function getInteractor() {
  if (touches.length > 0) return createVector(touches[0].x, touches[0].y);
  return createVector(mouseX, mouseY);
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initMojis();
  initBlocks();
}

function touchMoved() {
  return false;
}
