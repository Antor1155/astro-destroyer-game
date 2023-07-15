window.addEventListener("load", function(){
    const canvas = document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 800

    ctx.strokeStyle = "white"
    ctx.lineWidth = 3


    class Asteroid{
        constructor(game){
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
        draw(context){
            if(!this.free){
                // context.beginPath()
                // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
                // context.stroke()
                context.save()
                context.translate(this.x, this.y)
                context.rotate(this.angle)

                context.drawImage(this.image, -this.spriteWidth * 0.5, -this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight)
                context.restore()
            }
        }
        update(){
            this.angle += this.va
            if(!this.free){
                this.y += this.speed
                if(this.y > this.game.height + this.radius){
                    this.reset()
                }
            }
        }
        reset(){
            this.free = true 
        }
        start(){
            this.free = false
            this.x = Math.random() * this.game.width
            this.y = -this.radius
        }
    }

    class Explosion{
        constructor(game, x, y){
            this.game = game
            this.x = x
            this.y = y
            this.image()
        }

        draw(){
            
        }
    }

    class Game{
        constructor(width, height){
            this.width = width
            this.height = height
            this.asteroidPool = []
            this.max = 30
            this.asteroidTimer = 0
            this.asteroidInterval = 1000

            this.createAsteroidPool()
        }

        createAsteroidPool(){
            for(let i = 0; i < this.max; i++){
                this.asteroidPool.push(new Asteroid(this))
            }
        }

        getElement(){
            for (let i = 0; i < this.asteroidPool.length; i++){
                if (this.asteroidPool[i].free){
                    return this.asteroidPool[i]
                }
            }
        }

        render(context, deltaTime){
            // create asteroid periodically 
            if (this.asteroidTimer > this.asteroidInterval){
                // create new asteroid
                const asteroid = this.getElement()
                if (asteroid) asteroid.start()

                this.asteroidTimer = 0
            } else {
                this.asteroidTimer += deltaTime
            }

            this.asteroidPool.forEach(asteroid =>{
               asteroid.draw(context)
               asteroid.update()
           })
        }
    }

    const game = new Game(canvas.width, canvas.height)

    let lastTime = 0
    function animation(timeStamp){
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(ctx, deltaTime)
        requestAnimationFrame(animation)
    }

    animation(0)
})