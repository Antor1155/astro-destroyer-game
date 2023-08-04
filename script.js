window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    canvas.width = 400
    canvas.height = 800

    ctx.strokeStyle = "white"
    ctx.lineWidth = 3
    ctx.font = "40px 'VT323'"

    // handle mobile display and desktop display
    const innerHeight = window.innerHeight
    const innerWidth = window.innerWidth

    if (innerHeight > innerWidth){
        // in portrait scale with width ratio 
        const difference = innerWidth - canvas.width
        const newWidth = canvas.width + difference
        let ratio = (newWidth / canvas.width).toFixed(2)

        // when width is okay but height is more than display 
        while((canvas.height * ratio) > innerHeight){
            ratio -= 0.01
        }

        canvas.style.transform = `translate(-50%, -50%) scale(${ratio})`

    } else{
        // in landscape, scale with height ratio 
        const difference = innerHeight - canvas.height
        const newHeight = canvas.height + difference
        const ratio = (newHeight / canvas.height).toFixed(2)

        canvas.style.transform = `translate(-50%, -50%) scale(${ratio})`
    }
    
    canvas.style.display = "block"
    
    class Rocket{
        constructor(game){
            this.game = game
            this.x = this.game.width * 0.5
            this.y = this.game.height * 0.5
            this.image = document.getElementById("rocket")
            this.width = 150
            this.height = 150

            this.moveable = false

            this.interval = 700
            this.timer = 0

            this.scaler = .5

            this.game.canvas.addEventListener("mousedown", (e)=>{
                this.moveable = true
                this.x = e.offsetX
                this.y = e.offsetY
            })
            this.game.canvas.addEventListener("mouseup", ()=>{
                this.moveable = false
            })
            this.game.canvas.addEventListener('mousemove', e =>{
                if(this.moveable){
                    this.x = e.offsetX
                    this.y = e.offsetY
                }
            })
        }

        draw(context) {
            context.save()
            context.drawImage(this.image, this.x-this.width * 0.5, this.y, this.width, this.height)

            if(this.game.debug){
            context.beginPath()
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            context.stroke()
            context.fillStyle = "blue"
            context.fill()
            }

            context.restore()
        }

        update(deltaTime){
            if (this.timer > this.interval){
                this.scaler  = -(this.scaler)
                this.timer = 0

            } else {
                this.width += this.scaler
                this.height += this.scaler
                this.timer += deltaTime
                console.log(this.timer)
            }

        }
    }

    class Bullet{
        constructor(game){
            this.game = game
            this.x = this.game.width * 0.5
            this.y = this.game.height * 0.5
            this.radius = 15

            this.timer = 0
            this.interval = 100

            this.game.canvas.addEventListener("mousedown", e =>{
               this.x = e.offsetX
               this.y = e.offsetY
            })
        }

        draw(context){
            if (this.game.debug){
                context.save()
                context.beginPath()
                context.arc(this.x, this.y, this.radius, 0, Math.PI* 2)
                context.fillStyle = "red"
                context.fill()
                context.restore()
            }
        }

        update(deltaTime){
            if (this.timer > this.interval){
                this.x = this.game.width * 0.5
                this.y = this.game.height

                this.timer = 0
            } else {
                this.timer += deltaTime
            }

        }
    }

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
            if(this.game.debug){
            context.beginPath()
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            context.stroke()
            }
        }

        update() {
            this.angle += this.va
        }
    }


    class Asteroid {
        constructor(game) {
            this.game = game
            this.x = Math.random() * this.game.width
            this.y = -this.radius
            this.image = document.getElementById("asteroid")
            this.offsetSize = -50
            this.radius = 75 + this.offsetSize / 2
            this.spriteWidth = 150 + this.offsetSize
            this.spriteHeight = 155 + this.offsetSize
            
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

                context.drawImage(this.image, -this.spriteWidth * 0.5, -this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight )
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

                // check collision with bullet
                if(this.game.checkCollision(this.game.bullet, this)){
                    this.smoke()
                    if(!this.game.gameFinished) this.game.score++
                }

                // check collision with earch
                if (this.game.checkCollision(this, this.game.earth)) {
                    this.blast()
                    if(!this.game.gameFinished) this.game.damage++
                }
            }
        }

        blast() {
            this.game.explosion.push(new Explosion(this.game, this.x, this.y + this.radius / 2))
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
        constructor(canvas) {
            this.canvas = canvas
            this.width = canvas.width
            this.height = canvas.height
            this.asteroidPool = []
            this.max = 30
            this.asteroidTimer = 0
            this.asteroidInterval = 1000

            this.earth = new Earth(this, this.width * 0.5, this.height + 250)

            this.bullet = new Bullet(this)
            this.rocket = new Rocket(this)

            this.debug = false

            this.score = 0
            this.damage = 0
            this.winningScore = 30
            this.loosingScore = 500
            this.gameFinished = false

            this.explosion = [new Smoke(this, 300, 400)]
            this.createAsteroidPool()

            window.addEventListener("keypress", e =>{
                if (e.key.toLowerCase() === "d"){
                    this.debug = !this.debug
                }
            })

            
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

            return (distance < sumOfRadii)
        }

        scoreBoard(context){
            context.save()
            context.fillStyle = "White"
            context.fillText("Score: " + this.score , 10, 50)
            context.fillStyle = "red"
            context.fillText("Damage: " + this.damage , 230, 50)
            context.restore()
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

            const allObjects = [this.earth, ...this.asteroidPool, ...this.explosion, this.bullet, this.rocket]

            allObjects.forEach(obj => {
                obj.draw(context)
                obj.update(deltaTime)
            })

            this.scoreBoard(context)

            if(this.score >= this.winningScore || this.damage >= this.loosingScore){
                this.gameFinished = true
            }
        }

        reset(){
            this.score = 0
            this.damage = 0
            this.asteroidPool = []
            this.createAsteroidPool()
            this.explosion = []
            game.gameFinished = false
        }
    }

    const game = new Game(canvas)

    const startBtn = this.document.getElementById("start")
    const instruction = this.document.getElementById("instruction")
    const title = this.document.getElementById("title")

    let lastTime = 0
    function animation(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(ctx, deltaTime)

        if (!game.gameFinished) {
            requestAnimationFrame(animation)
        } else {
            handleGameOver(game.score < game.winningScore)
            game.reset()
        }
    }

    instruction.style.height = `${innerHeight}px`

    startBtn.addEventListener("click", () =>{
        instruction.style.display = "none"
        animation(lastTime)
    })

    //under construction 
    instruction.style.display = "none"
    animation(lastTime)

    function handleGameOver(loose){
        instruction.style.display = "flex"
        if(loose){
            title.innerText = "Looser ??"
        } else{
            title.innerText = "Hero !!"
        }
    }
})