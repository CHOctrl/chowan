let blocks = [];
let targets = [];
const phrase = "cho <3 wan";

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  rectMode(CENTER);
  angleMode(DEGREES);
  
  initBlocks();
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

  // REVERT TO SINGLE LINE (The "Old Version" Layout)
  // Dynamic font sizing to maximize the "cho" prominence
  let fontSize = width / (phrase.length * 0.75); 
  let maxH = height * 0.35;
  if (fontSize > maxH) fontSize = maxH;
  
  pg.textSize(fontSize);
  // Using slightly more space around the "<3" for better readability
  pg.text(phrase, width / 2, height / 2);
  pg.loadPixels();

  // Fine-grain sampling for that beautiful detailed look
  let step = fontSize * 0.09; 
  if (step < 7) step = 7;
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let index = (Math.floor(x) + Math.floor(y) * width) * 4;
      if (pg.pixels[index] > 128) {
        targets.push(createVector(x, y));
      }
    }
  }

  // Refined "Cute" Palette
  let colors = [
    color(255, 120, 150), // Rose
    color(100, 200, 255), // Crystal Blue
    color(255, 180, 200)  // Soft Pink
  ];

  for (let i = 0; i < targets.length; i++) {
    blocks.push({
      pos: createVector(random(width), random(height)),
      target: targets[i],
      vel: createVector(random(-3, 3), random(-3, 3)),
      acc: createVector(0, 0),
      size: step * 0.88,
      color: random(colors),
      angle: random(360),
    });
  }
}

function draw() {
  background(248, 240, 225);
  
  // SUPPORT FOR BOTH MOUSE AND TOUCH (Essential for Vercel/Mobile)
  let interactionX = mouseX;
  let interactionY = mouseY;
  
  if (touches.length > 0) {
    interactionX = touches[0].x;
    interactionY = touches[0].y;
  }
  
  let interactor = createVector(interactionX, interactionY);

  for (let b of blocks) {
    let d = p5.Vector.dist(b.pos, interactor);
    
    if (d < 100) {
      let flee = p5.Vector.sub(b.pos, interactor);
      flee.setMag(12);
      b.acc.add(flee);
      b.angle += 20; 
    } else {
      let arrive = p5.Vector.sub(b.target, b.pos);
      let dist = arrive.mag();
      let speed = map(dist, 0, 200, 0, 15);
      arrive.setMag(speed);
      
      let steer = p5.Vector.sub(arrive, b.vel);
      steer.limit(0.6);
      b.acc.add(steer);
      
      if (dist < 5) b.angle = lerp(b.angle, 0, 0.2);
    }

    b.vel.add(b.acc);
    b.vel.limit(20);
    b.pos.add(b.vel);
    b.acc.mult(0);
    b.vel.mult(0.85);

    push();
    translate(b.pos.x, b.pos.y);
    rotate(b.angle);
    noStroke();
    fill(0, 10);
    rect(2, 2, b.size, b.size, 2); 
    fill(b.color);
    rect(0, 0, b.size, b.size, 2);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initBlocks();
}

// Prevents mobile scrolling while interacting with the art
function touchMoved() {
  return false;
}
