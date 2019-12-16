
function Particle () {
  this.position = createVector(random(width),random(height));
  this.velocity = createVector(0, 0);
  this.acceleration = createVector(0, 0);
  this.maxspeed = 2;
  this.colour = 255;
  this.white = true;
  this.fadeSpeed = 0.2;

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;

    if (this.colour > 0 && this.white) this.colour -= this.fadeSpeed;
    if (this.colour < 255 && !this.white) this.colour += this.fadeSpeed;
    if (this.colour <= 0 && this.white) this.white = false;
    if (this.colour >= 255 && !this.white) this.white = true;

  }

  this.follow = function(vectors) {
    let x = floor(this.position.x / scale);
    let y = floor(this.position.y / scale);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }

  this.applyForce = function(force) {
    this.acceleration.add(force);
  }

  this.show = function() {
    stroke(this.colour);
    strokeWeight(1);
    point(this.position.x, this.position.y);
  }
}
