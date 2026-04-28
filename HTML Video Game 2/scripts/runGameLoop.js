//Check Stage of Game

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
            player.playerHealth = 5;
            player.x = canvas.width / 2;
        }

<<<<<<< Updated upstream
if (gameState === "bossState") {
    boss.bossHealth = 10;
    boss.lastColorChange = Date.now();

    // Reset player for Space Invaders mode
    player.vx = 0;
    player.vy = 0;
    player.angle = 0;
=======
        if (gameState === "bossState") {
            boss.bossHealth = 100;
            boss.lastColorChange = Date.now();

            // Reset player for Space Invaders mode
            player.vx = 0;
            player.vy = 0;
            player.angle = -Math.PI / 2;
>>>>>>> Stashed changes

    // Reset player position to bottom center
    player.x = canvas.width / 2;
    player.y = canvas.height - 40;
}



        if (gameState === "gameOverState") {
            const weapons = { active: [] };
            let explosions = [];
            player.active = false;
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
<<<<<<< Updated upstream
        updateBullets();

        //Draw Player + Bullets
        drawPlayer();
        drawBullets();
=======

        //Draw Player + Bullets
        drawPlayer();
        drawWeapons();
        drawDamageNumbers();
        drawExplosions();
        updateWeapons();
        updateDamageNumbers();

>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

        //Check Boss collision
        bossCollisions();
=======
>>>>>>> Stashed changes
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
