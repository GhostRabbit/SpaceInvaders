let ship
let shots = []
let invaders = []
let gameOn = true
let explosions = []


function setup() {
    createCanvas(500, 500)
    ship = new Ship()
    for (let i = 0; i < 5; i++) {
        invaders.push(new Invader(createVector(map(i, 0, 4, 100, width - 100), 50)))
        invaders.push(new Invader(createVector(map(i, 0, 4, 100, width - 100), 100)))
        invaders.push(new Invader(createVector(map(i, 0, 4, 100, width - 100), 150)))
        invaders.push(new Invader(createVector(map(i, 0, 4, 100, width - 100), 200)))
    }
    frameRate(60)
}

function draw() {
    background(20)
    update()
    show()
}

function update() {
    if (gameOn) {
        explosions.forEach(e => e.update())
        invaders.forEach(i => i.update())
        shots.forEach(s => s.update())
        ship.update()

        checkForCollisions()
    }
}

function checkForCollisions() {
    explosions = explosions.filter(e => e.alive)
    shots.forEach(shot =>
        invaders
            .filter(invader => invader.collides(shot))
            .map(invader => {
                invader.hit()
                shot.hit()
            }))
    invaders = invaders.filter(i => i.alive)
    shots = shots.filter(i => i.alive)

    invaders
        .filter(invader => ship.alive && invader.attacks(ship))
        .map(invader => {
            ship.attacked()
            invader.hit()
        })
}

function show() {
    explosions.forEach(e => e.show())
    invaders.forEach(i => i.show())
    shots.forEach(s => s.show())
    ship.show()
    if (!gameOn) {
        textAlign(CENTER, CENTER)
        textSize(64)
        noStroke()
        fill(255, 0, 0)
        text("GAME OVER", width / 2, height / 2)
    }
}

function keyReleased() {
    if (keyCode == 32 || keyCode == UP_ARROW) {
        ship.shoot()
    }
}

class MainPart {
    constructor(pos) {
        this.pos = pos
        this.vel = createVector(0, 0)
        this.angle = 0
        this.avel = 0
    }
    update() {
        this.pos.add(this.vel)
        this.angle += this.avel
    }

    show() {
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        stroke(70, 70, 255)
        fill(50, 50, 240)
        ellipse(0, 0, 20, 40)
        pop()
    }
}

class LegPart {
    constructor(pos) {
        this.pos = pos
        this.vel = createVector(0, 0)
        this.angle = 0
        this.avel = 0
    }
    update() {
        this.pos.add(this.vel)
        this.angle += this.avel
    }

    show() {
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        stroke(255, 255, 50)
        fill(240, 240, 0)
        ellipse(0, 0, 10, 20)
        pop()
    }
}

class Ship {
    constructor() {
        this.pos = createVector(width / 2, height - 35)
        this.hp = 10
        this.alive = true
        this.parts = [
            new MainPart(createVector(0, 0)),
            new LegPart(createVector(10, 20)),
            new LegPart(createVector(-10, 20))
        ]
    }

    show() {
        strokeWeight(2)
        push()
        translate(this.pos.x, this.pos.y)
        this.parts.forEach(p => p.show())
        pop()
    }

    update() {
        let vel = createVector(0, 0)
        if (this.alive) {
            if (keyIsDown(LEFT_ARROW)) vel.add(-1, 0)
            if (keyIsDown(RIGHT_ARROW)) vel.add(1, 0)
        }
        this.pos.add(vel)
        this.pos.x = constrain(this.pos.x, 0, width)
        this.parts.forEach(p => p.update())
    }

    shoot() {
        if (this.alive)
            shots.push(new Shot(this.pos.copy().add(0, -20)))
    }

    explode() {
        if (this.alive) {
            this.parts.forEach(p => {
                p.vel = p5.Vector.random2D()
                p.vel.y = -abs(p.vel.y)
                p.avel = random(-0.1, 0.1)
            })
            setTimeout(_ => gameOn = false, 3000)
        }
    }

    attacked() {
        this.hp -= 2
        if (this.hp <= 0) {
            this.explode()
            this.alive = false
        }
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

    update() {
        this.pos.add(this.vel)
        this.alive = this.pos.y > 0
    }
}

class Invader {
    constructor(pos) {
        this.pos = pos
        this.r = 20
        this.wobble = 0
        this.offsetDir = [createVector(1, 0), createVector(0, 1), createVector(-1, 0), createVector(0, 1)]
        this.offsetDirIndex = 0
        this.offsetCounter = 25 / 2
        this.alive = true
        this.rotateDivisor = random(30, 90) * random([-1, 1])
    }

    update() {
        this.wobble = (this.wobble + 1) % 20
        if (this.pos.y > width - 100) {
            let dir = p5.Vector.sub(ship.pos, this.pos).normalize()
            this.pos.add(dir)
        } else {
            if (this.offsetCounter++ > 25) {
                this.offsetCounter = 0
                this.offsetDirIndex = (this.offsetDirIndex + 1) % this.offsetDir.length
            }
            this.pos.add(this.offsetDir[this.offsetDirIndex])
        }
    }

    show() {
        strokeWeight(4)
        stroke(0, 200, 0)
        fill(0, 100, 0)
        let w = this.wobble > 10 ? 15 - this.wobble : this.wobble - 5
        push()
        translate(this.pos.x, this.pos.y)
        rotate(frameCount / this.rotateDivisor + this.rotateDivisor)
        ellipse(0, 0, 2 * this.r + w, 2 * this.r - w)
        pop();
    }

    collides(shot) {
        return this.pos.dist(shot.pos) < shot.r + this.r
    }

    hit() {
        this.alive = false
        explosions.push(new Explosion(this.pos))
    }

    attacks(ship) {
        return this.pos.dist(ship.pos) < this.r
    }
}

class Explosion {
    constructor(pos) {
        this.parts = new Array(5).fill(0).map(_ => {
            return {
                pos: pos.copy(),
                vel: p5.Vector.random2D()
            }
        })
        this.life = 60
        this.alive = true
    }

    update() {
        if (this.life-- == 0) {
            this.alive = false;
        }

        this.parts.forEach(p => {
            p.vel.y += 0.03
            p.pos.add(p.vel)
        })
    }

    show() {
        stroke(255, 0, 0)
        fill(255, 150, 0)
        this.parts.forEach(p => {
            ellipse(p.pos.x, p.pos.y, 10, 10)
        })

    }
}
