let ship
this.shots = []
let invaders = []

function setup() {
    createCanvas(500, 500)
    ship = new Ship()
    for (let i = 0; i < 5; i++) {
        invaders.push(new Invader(createVector(map(i, 0, 4, 100, width - 100), 100)))
    }
    frameRate(50)
}

function draw() {
    background(20)
    update()
    show()
}

function update() {
    invaders.forEach(i => i.update())
    shots.forEach(s => s.update(invaders))
    ship.update()

    invaders = invaders.filter(i => i.alive)
    shots = shots.filter(s => s.alive)
}

function show() {
    invaders.forEach(i => i.show())
    shots.forEach(s => s.show())
    ship.show()
}

function keyReleased() {
    if (keyCode == 32 || keyCode == UP_ARROW) {
        ship.shoot()
    }
}

class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 35)
    }

    show() {
        strokeWeight(1)
        stroke(255, 0, 0)
        fill(255, 240, 240)
        push()
        translate(this.pos.x, this.pos.y)
        ellipse(0, 0, 20, 40)
        ellipse(- 10, 20, 10, 20)
        ellipse(10, 20, 10, 20)
        pop()
    }

    update() {
        let vel = createVector(0, 0)
        if (keyIsDown(LEFT_ARROW)) vel.add(-1, 0)
        if (keyIsDown(RIGHT_ARROW)) vel.add(1, 0)
        ship.pos.add(vel)
        ship.pos.x = constrain(ship.pos.x, 0, width)
    }

    shoot() {
        shots.push(new Shot(this.pos.copy().add(0, -20)))
    }
}

class Shot {
    constructor(pos) {
        this.pos = pos
        this.r = 2
        this.vel = createVector(0, -5)
        this.alive = true
    }

    show() {
        noStroke()
        fill(255)
        ellipse(this.pos.x, this.pos.y, 2 * this.r, 2 * this.r)
    }

    hit() {
        this.alive = false
    }

    update(invaders) {
        this.pos.add(this.vel)
        this.alive = this.pos.y > 0
        invaders.forEach(i => {
            if (i.pos.dist(this.pos) < this.r + i.r) {
                this.hit()
                i.hit()
            }
        })
    }
}

class Invader {
    constructor(pos) {
        this.pos = pos
        this.r = 20
        this.wobble = 5
        this.alive = true
        this.rotateDivisor = random(30, 90)
    }

    update() {
        this.wobble = (this.wobble + 1) % 20
    }

    show() {
        strokeWeight(4)
        stroke(0, 100, 0)
        fill(0, 200, 0)
        let w = this.wobble > 10 ? 15 - this.wobble : this.wobble - 5
        push()
        translate(this.pos.x, this.pos.y)
        rotate(frameCount / this.rotateDivisor + this.rotateDivisor)
        ellipse(0, 0, 2 * this.r + w, 2 * this.r - w)
        pop();
    }

    hit() {
        this.alive = false
    }
}
