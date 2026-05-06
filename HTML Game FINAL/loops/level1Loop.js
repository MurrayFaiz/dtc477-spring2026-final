// =====================================================
// LEVEL 1 — Unified Loop 
// =====================================================

let gameState = "start";
let currentWave = 1;
let requiredKills = 0;
let aliensKilled = 0;
let score = 0;
let bgMusic = null;

let kills = 0;
let totalEnemies = 0;
let currentBoss = null;

// Reset music if needed
if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// DO NOT autoplay here — Chrome blocks it
bgMusic = new Audio('./assets/sounds/music/debrief.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

// Load background image
const bgImage = new Image();
bgImage.src = "assets/images/background.png";

function drawBackgroundCover(ctx, img, canvas) {
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Timers
let alienTrickleTimer = 0;
let aliensSpawnedThisWave = 0;
let asteroidTrickleTimer = 0;
let asteroidsSpawnedThisWave = 0;

// =====================================================
// START BUTTON
// =====================================================

document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startOverlay").style.display = "none";

    // Music is allowed here (user interaction)
    bgMusic.pause();
    bgMusic = new Audio('./assets/sounds/music/level-1-enemy.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    bgMusic.play().catch(err => console.log("Music failed:", err));

    startLevel1();
});

document.getElementById("gameOverButton").addEventListener("click", () => {
    window.location.reload();
});

// =====================================================
// START LEVEL
// =====================================================

function startLevel1() {

    applyUpgradesToPlayer();

    playerInit();
    startWavePhase1();
    gameLoop1();

    document.getElementById("playerHealthBarContainer").style.display = "block";
}

// =====================================================
// WAVES
// =====================================================

function startWavePhase1() {
    gameState = "enemyState";
    currentWave = 1;
    aliensKilled = 0;
    score = 0;

    totalEnemies = 0;

    spawnWaveLevel1(currentWave);
}

function spawnWaveLevel1(wave) {
    aliensKilled = 0;
    aliensSpawnedThisWave = 0;
    asteroidsSpawnedThisWave = 0;

    if (wave === 1) { requiredKills = 5; spawnWave1(); }
    if (wave === 2) { requiredKills = 10; spawnWave2(); }
    if (wave === 3) { requiredKills = 15; spawnWave3(); }
}

function spawnWave1() {
    for (let i = 0; i < 2; i++) spawnAlien();
    for (let i = 0; i < 6; i++) spawnAsteroid("large");
    alienTrickleTimer = 0; aliensSpawnedThisWave = 2;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 6;
}

function spawnWave2() {
    for (let i = 0; i < 5; i++) spawnAlien();
    for (let i = 0; i < 4; i++) spawnAsteroid("large");
    alienTrickleTimer = 0; aliensSpawnedThisWave = 5;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 4;
}

function spawnWave3() {
    for (let i = 0; i < 8; i++) spawnAlien();
    for (let i = 0; i < 5; i++) spawnAsteroid("large");
    alienTrickleTimer = 0; aliensSpawnedThisWave = 8;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 5;
}

// =====================================================
// MAIN LOOP
// =====================================================

function gameLoop1() {
    if (gameState === "enemyState" || gameState === "bossState") {
        update1();
        draw1();
        drawHUD();
        requestAnimationFrame(gameLoop1);
        return;
    }

    if (gameState === "bossIntro") {
        draw1();
        drawHUD();
        requestAnimationFrame(gameLoop1);
        return;
    }

    if (gameState === "victoryState") {
        document.getElementById("victoryOverlay").style.display = "flex";
        return;
    }

    if (gameState === "gameOverState") {
        document.getElementById("gameOverOverlay").style.display = "flex";
        return;
    }
}

// =====================================================
// UPDATE
// =====================================================

function update1() {
    updatePlayer();
    updateWeapons();
    updateExplosions();
    updateHealthPickups();

    if (gameState === "enemyState") {
        updateAsteroids();
        updateAliens();
        updateSwarmEnemies();
        updateTurretDrones();
        updateEnemyBullets();
        enemyCollisions();
        playerCollisions();

        // Alien trickle
        alienTrickleTimer++;

        if (currentWave === 1 && aliensSpawnedThisWave < 5 && alienTrickleTimer > 90) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }
        if (currentWave === 2 && aliensSpawnedThisWave < 15 && alienTrickleTimer > 70) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }
        if (currentWave === 3 && aliensSpawnedThisWave < 20 && alienTrickleTimer > 120) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }

        // Asteroid trickle
        asteroidTrickleTimer++;

        if (currentWave === 1 && asteroidsSpawnedThisWave < 6 && asteroidTrickleTimer > 120) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }
        if (currentWave === 2 && asteroidsSpawnedThisWave < 8 && asteroidTrickleTimer > 100) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }
        if (currentWave === 3 && asteroidsSpawnedThisWave < 10 && asteroidTrickleTimer > 90) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }

        // Wave progression
        if (aliensKilled >= requiredKills) {

            asteroids = [];
            aliens = [];
            enemyBullets = [];
            weapons.active = [];
            explosions = [];

            if (currentWave < 3) {
                currentWave++;
                spawnWaveLevel1(currentWave);
            } else {
                showUpgradeOverlay1();
            }
        }
    }

    if (gameState === "bossState") {
        updateBoss1();
        updateAliens();
        updateSwarmEnemies();
        updateTurretDrones();
        updateAsteroids();
        boss1Collisions();
        playerCollisions();
        updateEnemyBullets();
    }
}

// =====================================================
// HEALTH PICKUPS
// =====================================================

function updateHealthPickups() {
    for (let p of healthPickups) p.y += p.vy;
    healthPickups = healthPickups.filter(p => p.y < canvas.height + 40);
}

// =====================================================
// DRAW
// =====================================================

function draw1() {
    drawBackgroundCover(ctx, bgImage, canvas);

    if (gameState === "enemyState" || gameState === "bossIntro") {
        drawAsteroids();
        drawAliens();
        drawEnemyBullets();
    }

    if (gameState === "bossState") {
        drawBoss1();
        drawAliens();
        drawAsteroids();
        drawEnemyBullets();
    }

    drawHealthPickups();
    drawPlayer();
    drawWeapons();
    drawExplosions();
}

// =====================================================
// CANVAS HUD
// =====================================================

function drawHUD() {
    ctx.save();
    ctx.font = "20px 'Orbitron', monospace";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;

    ctx.strokeText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Score: ${score}`, 20, 30);

    ctx.strokeText(`Enemies: ${aliensKilled} / ${requiredKills}`, 20, 60);
    ctx.fillText(`Enemies: ${aliensKilled} / ${requiredKills}`, 20, 60);

    ctx.restore();
}

// =====================================================
// SHOP 
// =====================================================

function showUpgradeOverlay1() {
    gameState = "upgradeState";
    document.getElementById("upgradeOverlay").style.display = "flex";
    setupShopUI1();
    document.getElementById("shopMessage").innerText = "";
}

function trySpend1(cost, applyUpgrade) {
    if (score >= cost) {
        score -= cost;
        const msg = applyUpgrade();
        saveUpgrades();
        document.getElementById("shopMessage").innerText = msg || "";
    } else {
        document.getElementById("shopMessage").innerText = "Not enough points!";
    }
}

function setupShopUI1() {

    document.getElementById("upgradeLaser").onclick = () => {

        if (upgrades.mine === true) {
            document.getElementById("shopMessage").innerText = "Already purchased!";
            return;
        }

        trySpend1(400, () => {
            upgrades.mine = true;
            mine = true;
            return "Mine Obtained!";
        });
    };

    const mineBtn = document.getElementById("upgradeLaser");
    mineBtn.innerText = upgrades.mine ? "Mine — Already Purchased" : "Mine (400)";

    document.getElementById("upgradeForcefield").onclick = () => {

        if (upgrades.unlockForcefield === true) {
            document.getElementById("shopMessage").innerText = "Already purchased!";
            return;
        }

        trySpend1(1000, () => {
            upgrades.unlockForcefield = true;
            unlockForcefield = true;
            return "Forcefield Obtained!";
        });
    };

    document.getElementById("upgradeBulletSpeed").onclick = () => {
        if (upgrades.bulletSpeedBonus > 0) {
            document.getElementById("shopMessage").innerText = "Already purchased!";
            return;
        }
        trySpend1(500, () => {
            bulletSpeedBonus += 5;
            upgrades.bulletSpeedBonus = bulletSpeedBonus;
            document.getElementById("upgradeBulletSpeed").disabled = true;
            return "Bullet Speed upgraded!";
        });
    };

    document.getElementById("upgradeHealth").onclick = () => {
        if (upgrades.playerMaxHealthBonus > 0) {
            document.getElementById("shopMessage").innerText = "Already purchased!";
            return;
        }
        trySpend1(500, () => {
            playerMaxHealth += 5;
            player.playerHealth = playerMaxHealth;
            upgrades.playerMaxHealthBonus = playerMaxHealth - 5;
            document.getElementById("playerHealthBar").style.width = "100%";
            document.getElementById("upgradeHealth").disabled = true;
            return "Health upgraded!";
        });
    };

    document.getElementById("upgradeMoveSpeed").onclick = () => {
        if (upgrades.playerSpeedBonus > 0) {
            document.getElementById("shopMessage").innerText = "Already purchased!";
            return;
        }
        trySpend1(500, () => {
            playerSpeedBonus += 3;
            player.speed = 4 + playerSpeedBonus;
            upgrades.playerSpeedBonus = playerSpeedBonus;
            document.getElementById("upgradeMoveSpeed").disabled = true;
            return "Movement Speed upgraded!";
        });
    };
};

document.getElementById("upgradeContinue").onclick = () => {
    document.getElementById("upgradeOverlay").style.display = "none";
    transitionToBoss1();
};

// =====================================================
// BOSS TRANSITION
// =====================================================

function transitionToBoss1() {
    gameState = "bossIntro";

    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    bgMusic = new Audio('./assets/sounds/music/boss-1.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;

    bgMusic.play().catch(error => {
        console.error("Music failed:", error);
    });

    const wrapper = document.getElementById("gameWrapper");
    wrapper.classList.add("shake");

    asteroids = [];
    aliens = [];
    enemyBullets = [];
    weapons.active = [];
    explosions = [];

    setTimeout(() => {
        wrapper.classList.remove("shake");

        player.x = canvas.width / 2;
        player.y = canvas.height - 40;
        player.vx = 0;
        player.vy = 0;
        player.angle = 0;

        document.getElementById("boss1HealthBarContainer").style.display = "block";

        boss1Init();
        currentBoss = boss1;
        gameState = "bossState";

        gameLoop1();
    }, 600);
}
