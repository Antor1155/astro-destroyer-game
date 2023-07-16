window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 800

    ctx.strokeStyle = "white"
    ctx.lineWidth = 3

    class Earth {
        constructor(game, x, y) {
            this.game = game
            this.x = x
            this.y = y
            this.radius = 410

            this.image = document.getElementById("earth")
            this.spriteWidth = 1000
            this.spriteHeight = 1000
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.angle = 0
            this.va = 0.001
        }

        draw(context) {
            context.save()
            context.translate(this.x, this.y)
            context.rotate(this.angle)

            context.drawImage(this.image, -this.spriteWidth * 0.5, -this.spriteHeight * 0.5, this.width, this.height)
            context.restore()
            // if(this.game.debug){
            context.beginPath()
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            context.stroke()
            // }
        }

        update() {
            this.angle += this.va
        }
    }


    class Asteroid {
        constructor(game) {
            this.game = game
            this.radius = 75
            this.x = Math.random() * this.game.width
            this.y = -this.radius
            this.image = document.getElementById("asteroid")
            this.spriteWidth = 150
            this.spriteHeight = 155
            this.speed = Math.random() * 1.4 + 0.1
            this.free = true
            this.angle = 0
            this.va = Math.random() * 0.02 - 0.01
        }
        draw(context) {
            if (!this.free) {
                if (this.game.debug) {
                    context.beginPath()
                    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
                    context.stroke()
                }

                context.save()
                context.translate(this.x, this.y)
                context.rotate(this.angle)

                context.drawImage(this.image, -this.spriteWidth * 0.5, -this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight)
                context.restore()
            }
        }
        update() {
            this.angle += this.va
            if (!this.free) {
                this.y += this.speed
                if (this.y > this.game.height + this.radius) {
                    this.reset()
                }

                // check collision with player
                // if (this.y > 300) {
                //     this.blast()
                // }

                // check collision with earch
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, this.game.earth)

                if (collision) {
                    this.blast()
                }
            }
        }

        blast() {
            this.game.explosion.push(new Explosion(this.game, this.x, this.y + 50))
            // added offset here as fire only works in earth
            this.reset()
        }

        smoke() {
            this.game.explosion.push(new Smoke(this.game, this.x, this.y))
            this.reset()
        }

        reset() {
            this.free = true
        }

        start() {
            this.free = false
            this.x = Math.random() * this.game.width
            this.y = -this.radius
        }
    }

    class Smoke {
        constructor(game, x, y) {
            this.game = game
            this.x = x
            this.y = y

            this.image = document.getElementById("smoke")
            this.spriteWidth = 171
            this.spriteHeight = 250
            this.spriteX = 0
            this.spriteY = 0
            this.frameX = this.x - this.spriteWidth * 0.5
            this.frameY = this.y - this.spriteHeight * 0.5

            this.timer = 0
            this.frame = 7
            this.interval = 500 / this.frame

            this.finished = false

        }

        draw(context) {
            if (this.game.debug) {
                context.beginPath()
                context.arc(this.x, this.y, 100, 0, Math.PI * 2)
                context.fill()
            }

            context.drawImage(this.image, this.spriteX * this.spriteWidth, this.spriteY * this.spriteWidth, this.spriteWidth, this.spriteHeight, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight)
        }

        update(deltaTime) {
            if (this.timer > this.interval) {
                if (this.spriteX < this.frame - 1) {
                    this.spriteX++
                } else {
                    this.finished = true
                    this.game.explosion = this.game.explosion.filter(exp => !exp.finished)
                }
                this.timer = 0
            } else {
                this.timer += deltaTime
            }
        }
    }


    class Explosion {
        constructor(game, x, y) {
            this.game = game
            this.x = x
            this.y = y

            this.image = document.getElementById("explosions")
            this.spriteWidth = 256
            this.spriteHeight = 256
            this.spriteX = 0
            this.spriteY = 0
            this.frameX = this.x - this.spriteWidth * 0.5
            this.frameY = this.y - this.spriteHeight * 0.5

            this.timer = 0
            this.frame = 48
            this.interval = 1000 / this.frame

            this.finished = false

        }

        draw(context) {
            if (this.game.debug) {
                context.beginPath()
                context.arc(this.x, this.y, 100, 0, Math.PI * 2)
                context.fill()
            }

            context.drawImage(this.image, this.spriteX * this.spriteWidth, this.spriteY * this.spriteWidth, this.spriteWidth, this.spriteHeight, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight)
        }

        update(deltaTime) {
            if (this.timer > this.interval) {
                if (this.spriteX < 7) {
                    this.spriteX++
                } else if (this.spriteY < 5) {
                    this.spriteY++
                    this.spriteX = 0
                } else {
                    this.finished = true
                    this.game.explosion = this.game.explosion.filter(exp => !exp.finished)
                }
                this.timer = 0
            } else {
                this.timer += deltaTime
            }
        }
    }


    class Game {
        constructor(width, height) {
            this.width = width
            this.height = height
            this.asteroidPool = []
            this.max = 30
            this.asteroidTimer = 0
            this.asteroidInterval = 1000

            this.earth = new Earth(this, this.width * 0.5, this.height + 200)

            this.debug = true

            this.explosion = [new Smoke(this, 300, 400)]
            this.createAsteroidPool()
        }

        createAsteroidPool() {
            for (let i = 0; i < this.max; i++) {
                this.asteroidPool.push(new Asteroid(this))
            }
        }

        getElement() {
            for (let i = 0; i < this.asteroidPool.length; i++) {
                if (this.asteroidPool[i].free) {
                    return this.asteroidPool[i]
                }
            }
        }

        checkCollision(a, b) {
            const dx = a.x - b.x
            const dy = a.y - b.y

            const distance = Math.hypot(dy, dx)
            const sumOfRadii = a.radius + b.radius

            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        }

        render(context, deltaTime) {
            // create asteroid periodically 
            if (this.asteroidTimer > this.asteroidInterval) {
                // create new asteroid
                const asteroid = this.getElement()
                if (asteroid) asteroid.start()

                this.asteroidTimer = 0
            } else {
                this.asteroidTimer += deltaTime
            }

            const allObjects = [this.earth, ...this.asteroidPool, ...this.explosion]

            allObjects.forEach(obj => {
                obj.draw(context)
                obj.update(deltaTime)
            })



        }
    }

    const game = new Game(canvas.width, canvas.height)

    let lastTime = 0
    function animation(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(ctx, deltaTime)
        requestAnimationFrame(animation)
    }

    animation(0)
})