let increment = 0.05;
let scale = 10;
let cols, rows;
let font = "Georgia", fontSize, titleSize;

let zoffset = 0;

let particles = [];

let vectors = [];

let title = "Make Me";

let poem = ['this moment is a poisoned glance',
            'slowly creeping',
            'sharp glass-shards of dissatisfaction',
            'this fugitive glimpse',
            'haunts enough for a lifetime',
            'spectral painted black-rimmed eyes; thwarted fire',
            'in search of promised beauty',
            'now she swears',
            'that if she dares, this failure will be the last of its kind',
            'never again will she endure a powdery mask',
            'of pitiable imperfection',
            'because she could pose true threat',
            'if that face shrugged away its smudged desires',
            'she asserts her defiant choice',
            '(an excellent dissembling)',
            'asserts: beneath the camouflage does lie in wait',
            'the real me',
            'the book said about',
            'the soul shining through one\'s body',
            'so she pulls her gaze from the deliquescent mirror -',
            'if this was her soul she didn\'t want it',
            ' ',
            'created by lydia and geordie',
            'reload to read again'
          ];
let poemIndex = 0;


function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  fontSize = height/15;
  titleSize = height/10;
  cols = floor(width / scale);
  rows = floor(height / scale);

  vectors = new Array(cols * rows);

  for (let i = 0; i < cols*rows/10; i++) {
    particles[i] = new Particle();
  }
  background(0);

  textFont(font);
  textSize(titleSize);
  textAlign(CENTER,CENTER);

  fill(255);
  text(title,width*0.5,height*0.45);
}

function draw() {
  var yoffset = 0;
  for (let y = 0; y < rows; y++) {
    let xoffset = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoffset, yoffset, zoffset) * TWO_PI * 2;
      let vector = p5.Vector.fromAngle(angle);
      vector.setMag(2);
      vectors[index] = vector;
      xoffset += increment;
      stroke(0);
    }
    yoffset += increment;

    zoffset += 0.0005;
  }
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(vectors);
    particles[i].update();
    particles[i].show();
  }
}

function mousePressed() {
  if (poemIndex < poem.length){
    textSize(fontSize);
    fill(0);
    stroke(0);
    rect(0,height*0.8,width,height*0.1)
    fill(255);
    text(poem[poemIndex], width*0.5, height*0.85);
    poemIndex++;
  }

}
