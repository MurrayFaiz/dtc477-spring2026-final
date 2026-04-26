
let gameRunning = false;


let gameState = "enemyState"; //For Tevin: when debreif state is ready, switch it here!
let previousState = null;

function setGameState(newState) {
    gameState = newState;
}
let onStateChange = null;

//Run functions (in order + based on state)
function mainLoop() {
    //Checks previous state
    if (gameState !== previousState) {
        if (onStateChange) {
            onStateChange(gameState);
        }

        //Resets enemies on new loop
        if (gameState === "enemyState") {
            asteroids = [];
            aliens = [];

            for (let i = 0; i < 3; i++) spawnAsteroid();
            for (let i = 0; i < 3; i++) spawnAlien();

            player.active = true;
            player.playerHealth = 100;
            player.x = canvas.width / 2;
        }

        if (gameState === "bossState") {
            boss.bossHealth = 10;
            boss.lastColorChange = Date.now();

            // Reset player for Space Invaders mode
            player.vx = 0;
            player.vy = 0;
            player.angle = 0;

            // Reset player position to bottom center
            player.x = canvas.width / 2;
            player.y = canvas.height - 40;
        }



        if (gameState === "gameOverState") {
            player.active = false;
            bullets = [];
            asteroids = [];
            aliens = [];
            bossBullets = [];
        }

        previousState = gameState;
    }

    //Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, -100, 0, canvas.width * 1.2, canvas.height);

    //Player
    if (gameState === "enemyState" || gameState === "bossState") {
        //Update Player
        updatePlayer();



        //Draw Player + Bullets
        drawPlayer();
        drawWeapons();
        drawExplosions();
        updateWeapons();

        //Check Collision
        playerCollisions();
    }

    //Enemies
    if (gameState === "enemyState") {
        //Update Asteroids & Aliens
        updateAsteroids();
        updateAliens();

        //Draw Asteroids & Aliens
        drawAsteroids();
        drawAliens();

        //Check Asteroid & Alien collision
        enemyCollisions();

        // Check to move to Boss Stage
        if (asteroids.length === 0 && aliens.length === 0) {
            gameState = "bossState";
        }
    } else if (gameState === "bossState") {
        //Update Boss
        updateBoss();
        updateBossBullets();

        //Draw Boss
        drawBoss();
        drawBossBullets();
        bossCollisions();
    } else if (gameState === "gameOverState") {

    }

    requestAnimationFrame(mainLoop);
}

//Run game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        mainLoop();
    }
}

document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startOverlay").style.display = "none";
    startGame();
});
