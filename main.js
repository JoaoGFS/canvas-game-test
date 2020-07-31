(function () {
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

const TILE_LENGTH = 20
let canvas = document.getElementById("canvas")
canvas.width = 64 * TILE_LENGTH
canvas.height = 36 * TILE_LENGTH

let frameCounter = 0
let seconds = 0

let context2d = canvas.getContext("2d")

let player = {
    width: 1 * TILE_LENGTH,
    height: 1 * TILE_LENGTH,
    xPosition: 0,
    yPosition: 0,
    xTile: 0,
    yTile: 0,
    xSpeed: 0,
    ySpeed: 0
}

let greenTiles = []
let purpleTiles = []

let deadlyTilesStrings = []
let fruitsTilesStrings = []

let xStart = 31 * TILE_LENGTH
let yStart = canvas.height - player.height

player.xPosition = xStart
player.yPosition = yStart

keys = []

let oldSpeed = 0
let stopGame = false

let isFirstFrame = true

let fruitCounter = 0
let score = 0
let highScore = 0

function update() {
    if (isFirstFrame) {
        console.log("first")
        init()
        isFirstFrame = false
    }

    calculateFramerate()

    handleControls()

    player.xPosition += player.xSpeed
    player.yPosition += player.ySpeed

    player.xTile = player.xPosition / 20
    player.yTile = player.yPosition / 20

    if (tileInContact() == 1) {
        console.log("tileInContact==1")
        fruitCounter++
        if (fruitCounter == 6) {
            score++
            if (score > highScore) {
                highScore = score
            }
            resetLevel()
        }
    }

    if (isOutOfBounds() || tileInContact() == 0) {
        score = 0
        resetLevel()
    }

    context2d.clearRect(0, 0, canvas.width, canvas.height)
    drawPlayer()
    drawEnviroment()

    setStats()
}

function init() {
    initEnviroment()
}

function initEnviroment() {

    determineGreenTilesSpawn()

    determineSpawnPoint()

    determineFruitSpawn()

    console.log(deadlyTilesStrings);

}

function handleControls() {
    let moveSpeed = 5

    if (stopGame && !keys[32]) {
        debugLog("Press space to retry")
        return
    } else {
        stopGame = false
    }

    if (keys[90]) {
        moveSpeed = 3
    }

    if (keys[39]) {
        debugLog("right")
        player.ySpeed = 0
        player.xSpeed = moveSpeed
    } else if (keys[37]) {
        debugLog("left")
        player.ySpeed = 0
        player.xSpeed = moveSpeed * -1
    } else if (keys[38]) {
        debugLog("up")
        player.xSpeed = 0
        player.ySpeed = moveSpeed * -1
    } else if (keys[40]) {
        debugLog("down")
        player.xSpeed = 0
        player.ySpeed = moveSpeed
    }

}

function drawEnviroment() {
    greenTiles.forEach(entity => {
        placeTiles(entity.xCoord, entity.yCoord, entity.width, entity.height, 0)
    });

    purpleTiles.forEach(entity => {
        placeTiles(entity.xCoord, entity.yCoord, 1, 1, 1)
    })
}


function placeTiles(x, y, width, height, type) {
    switch (type) {
        case 0:
            context2d.fillStyle = "green"
            break;
        case 1:
            context2d.fillStyle = "purple"
        default:
            break;
    }
    context2d.fillRect(x * TILE_LENGTH, y * TILE_LENGTH, width * TILE_LENGTH, height * TILE_LENGTH)
}

function drawPlayer() {
    // runs the loop each time
    requestAnimationFrame(update);

    drawGrid()

    context2d.fillStyle = "red"
    context2d.fillRect(player.xPosition, player.yPosition, player.width, player.height)

}

function resetLevel() {
    console.log(`Last tiles (${player.xTile}, ${player.yTile})`)

    player.xPosition = xStart
    player.yPosition = yStart

    player.xSpeed = 0
    player.ySpeed = 0

    stopGame = true
    oldSpeed = 0

    greenTiles = []
    deadlyTilesStrings = []

    purpleTiles = []
    fruitsTilesStrings = []

    fruitCounter = 0

    initEnviroment()
}

function drawGrid() {
    context2d.fillStyle = "black"
    for (let i = TILE_LENGTH; i < canvas.width; i += 20) {
        context2d.fillRect(i, 0, 1, canvas.height)
    }

    for (let i = TILE_LENGTH; i < canvas.height; i += 20) {
        context2d.fillRect(0, i, canvas.width, 1)
    }
}

function tileInContact() {
    let tileType = -1
    let index

    let corners = []
    let x, y

    x = player.xTile
    y = player.yTile
    corners[0] = [Math.floor(x), Math.floor(y)]

    x = (player.xPosition + TILE_LENGTH - 1) / TILE_LENGTH
    y = (player.yPosition + TILE_LENGTH - 1) / TILE_LENGTH
    corners[1] = [Math.floor(x), Math.floor(y)]

    if (deadlyTilesStrings.includes(JSON.stringify(corners[0])) ||
        deadlyTilesStrings.includes(JSON.stringify(corners[1]))) {
        tileType = 0
    } else if (fruitsTilesStrings.includes(JSON.stringify(corners[0])) ||
        fruitsTilesStrings.includes(JSON.stringify(corners[1]))) {

        index = fruitsTilesStrings.indexOf(JSON.stringify(corners[0]))
        if (index == -1) {
            index = fruitsTilesStrings.indexOf(JSON.stringify(corners[1]))
        }

        fruitsTilesStrings.splice(index, 1)
        purpleTiles.splice(index, 1)


        console.log(fruitsTilesStrings)
        console.log(purpleTiles)



        tileType = 1
    }
    return tileType
}

function isOutOfBounds() {
    if (player.xPosition <= 0 ||
        player.xPosition >= canvas.width - player.width ||
        player.yPosition <= 0 ||
        player.yPosition > canvas.height - player.height) {
        return true
    } else {
        return false
    }
}

function determineSpawnPoint() {
    let x, y
    do {
        x = getRandomInt(0, 63)
        y = getRandomInt(0, 35)
    } while (deadlyTilesStrings.includes(JSON.stringify([x, y])));

    player.xPosition = x * TILE_LENGTH
    player.yPosition = y * TILE_LENGTH
}

function determineFruitSpawn() {
    let numberOfFruits = getRandomInt(7, 8)

    for (let i = 0; i < numberOfFruits; i++) {
        let x, y
        do {
            x = getRandomInt(0, 63)
            y = getRandomInt(0, 35)
        } while (deadlyTilesStrings.includes(JSON.stringify([x, y])));

        purpleTiles.push({
            xCoord: x,
            yCoord: y
        })

        if (!fruitsTilesStrings.includes(JSON.stringify([x, y]))) {
            fruitsTilesStrings.push(JSON.stringify([x, y]))
        }

    }
}

function determineGreenTilesSpawn() {
    let numberOfEntities = getRandomInt(18, 36)

    let xCoord, yCoord
    let width, height

    for (let i = 0; i < numberOfEntities; i++) {
        xCoord = getRandomInt(0, 55)
        yCoord = getRandomInt(0, 27)
        width = getRandomInt(1, 8)
        height = getRandomInt(1, 8)
        greenTiles.push({
            xCoord,
            yCoord,
            width,
            height
        })

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (!deadlyTilesStrings.includes(JSON.stringify([xCoord + i, yCoord + j]))) {
                    deadlyTilesStrings.push(JSON.stringify([xCoord + i, yCoord + j]))
                }
            }
        }

    }
}

function calculateFramerate() {
    frameCounter++
    if (seconds != new Date().getSeconds()) {
        document.getElementById("fps").innerHTML = `${frameCounter} fps`
        frameCounter = 0
    }
    seconds = new Date().getSeconds()
}

function debugLog(params) {
    document.getElementById("log").innerHTML = params
}

function setStats() {
    document.getElementById("coords").innerHTML =
        `xPosition: ${player.xPosition}; yPosition: ${player.yPosition}
    <br> xTile: ${Math.floor(player.xTile)}; yTile: ${Math.floor(player.yTile)} 
    <br>xSpeed: ${player.xSpeed}; ySpeed: ${player.ySpeed}`
    document.getElementById("counter").innerHTML = `${fruitCounter} fruits`
    document.getElementById("score").innerHTML = `score: ${score}`
    document.getElementById("high").innerHTML = `high score: ${highScore}`

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.body.addEventListener("keydown", e => {
    keys[e.keyCode] = true
})

document.body.addEventListener("keyup", e => {
    keys[e.keyCode] = false
})

window.addEventListener("load", function () { update(); });
