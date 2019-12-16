let increment = 0.01;
let scale = 50;
let cols, rows;
let zoffset = 0;
let particles = [];

let forcefield = [];

let font = "Source Sans Pro", fontSize, titleSize;

let poem = ['h',
            'e',
            'l',
            'p',
            'm',
            'e',
            'i have nothing',
            'do you see that?',
            'but',
            'what',
            'where are these coming from',
            'these salty cliffs',
            'these synapses',
            'stalagmites',
            'they sing to the ocean',
            'all at once',
            'i remember the sea now',
            'hello!',
            '(hello)',
            '(hello)',
            'my brain is full with echoes',
            ' '
];

let credits = [
              'the sound of loss',
              'created by lydia and geordie',
              'reload to read again'

];

let poemIndex = -1;
let creditsIndex = 0;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scale);
  rows = floor(height / scale);

  fontSize = width/30;
  titleSize = width/20;

  forcefield = new Array(cols * rows);


  textFont(font);
  textAlign(CENTER, CENTER);

}

function draw() {
  createCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scale);
  rows = floor(height / scale);

  let yoffset = 0;
  for (let y = 0; y < rows; y++) {
    let xoffset = 0;
    for (let x = 0; x < cols; x++) {
      let index = (y + x * width) * 4;

      let C = noise(xoffset,yoffset,zoffset) * 255;

      pixels[index + 0] = C;
      pixels[index + 1] = C;
      pixels[index + 2] = C;
      pixels[index + 3] = 255;
      xoffset += increment;

      colorMode(HSB);
      fill(C, 100, 40);
      stroke(C, 100, 40);
      rect(x*scale, y*scale, scale, scale);
      stroke(255);
      index = x + y * cols;
      forcefield[index] = C;

    }
    yoffset += increment;

    zoffset += 0.0001;
  }

  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].follow(forcefield);
    particles[i].show();
    particles[i].join(i, particles, 600);

  }

  if (poemIndex >= 0 && poemIndex < poem.length) {
    fontSize = width/30;
    textSize(fontSize);
    fill(255);
    strokeWeight(1);
    let x = particles[poemIndex].position.x;
    let y = particles[poemIndex].position.y;
    let twidth = textWidth(poem[poemIndex]);
    if (x + twidth/2 > width) particles[poemIndex].position.x = twidth/2;
    if (x - twidth/2 < 0) particles[poemIndex].position.x = width - twidth/2;
    if (y + fontSize/2 > height) particles[poemIndex].position.y = fontSize/2;
    if (y - fontSize/2 < 0) particles[poemIndex].position.y = height - fontSize/2;
    text(poem[poemIndex], particles[poemIndex].position.x, particles[poemIndex].position.y);
  }
  else if (poemIndex > 0){
    titleSize = width/20;
    textSize(titleSize);
    fill(255);
    strokeWeight(1);
    text(credits[creditsIndex], width/2, height/2);
  }
}

function mousePressed() {

  if (poemIndex < poem.length){
    poemIndex++;
    particles[poemIndex] = new Particle();
    textSize(fontSize);
    fill(255);
    text(poem[poemIndex], particles[poemIndex].position.x, particles[poemIndex].position.y);
  }
  else if (creditsIndex < credits.length - 1 && poemIndex > 0) {
    creditsIndex++;
    textSize(titleSize);
    fill(255);
    text(credits[creditsIndex], width/2, height/2);
  }
}
