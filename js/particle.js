
function Particle () {
  this.position = createVector(random(width),random(height));
  this.velocity = createVector(0, 0);
  this.acceleration = createVector(0, 0);
  this.maxspeed = 0.5;
  this.colour = 255;
  this.white = true;
  this.fadeSpeed = 0.05;

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;

  }

  this.follow = function(vectors) {
    let x = floor(this.position.x / scale);
    let y = floor(this.position.y / scale);
    let index = x + y * cols;
    let force = createVector(0,0);

    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        if (index + j + i * cols >= 0) {
          let f = forcefield[index + j + i * cols];
          if (f > forcefield[index]) {
            force.add(createVector(j,i).mult((f-forcefield[index])));
          }
        }
      }
    }
    this.applyForce(force);
  }

  this.applyForce = function(force) {
    this.acceleration.add(force);
  }

  this.show = function() {
    stroke(255);
    strokeWeight(5);
    point(this.position.x, this.position.y);
  }

  this.join = function(index, particles, maxDist) {
    for (var i = index+1; i < particles.length; i++) {
      d = dist(this.position.x,this.position.y,particles[i].position.x,particles[i].position.y);
      if (d < maxDist) {
        stroke(255);
        strokeWeight(2);
        line(this.position.x,this.position.y,particles[i].position.x,particles[i].position.y)
      }
    }
  }
}
