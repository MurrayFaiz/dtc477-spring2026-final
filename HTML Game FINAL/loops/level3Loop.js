// =====================================================
// LEVEL 3 GAME LOOP + WAVES + FINAL SHOP + FINAL BOSS
// =====================================================

let gameState = "start";
let currentWave = 1;
let requiredKills = 0;
let aliensKilled = 0;
let score = 0;
let currentBoss = null;
let bgMusic = null;


// SPAWN TIMERS
let alienTrickleTimer = 0;
let aliensSpawnedThisWave = 0;
let asteroidTrickleTimer = 0;
let asteroidsSpawnedThisWave = 0;

// Reset music if needed
if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// Prepare debrief music (do NOT autoplay)
bgMusic = new Audio('./assets/sounds/music/debrief.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

// Background image
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


// START BUTTON
document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startOverlay").style.display = "none";

    // Switch to level 3 enemy music on user interaction
    bgMusic.pause();
    bgMusic = new Audio('./assets/sounds/music/level-3-enemy.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(err => console.log("Music failed:", err));

    startLevel3();
});

// GAME OVER BUTTON
document.getElementById("gameOverButton").addEventListener("click", () => {
    window.location.reload();
});

// =====================================================
// START LEVEL 3
// =====================================================

function startLevel3() {
    loadUpgrades();
    applyUpgradesToPlayer();
    mine = !!upgrades.mine;

    playerInit();
    startWavePhase3();
    gameLoop3();

    document.getElementById("playerHealthBarContainer").style.display = "block";
}

// =====================================================
// START WAVES
// =====================================================

function startWavePhase3() {
    gameState = "enemyState";
    currentWave = 1;
    aliensKilled = 0;
    score = 0;

    spawnWave3Level(currentWave);
}

// =====================================================
// SPAWN WAVES
// =====================================================

function spawnWave3Level(wave) {
    aliensKilled = 0;
    aliensSpawnedThisWave = 0;
    asteroidsSpawnedThisWave = 0;
    swarmEnemies = [];
    turretDrones = [];

    if (wave === 1) { requiredKills = 5;  spawnWave3_1(); }
    if (wave === 2) { requiredKills = 10; spawnWave3_2(); }
    if (wave === 3) { requiredKills = 15; spawnWave3_3(); }
}

function spawnWave3_1() {
    for (let i = 0; i < 1; i++) spawnAlien();
    for (let i = 0; i < 4; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    spawnTurretDrone();

    alienTrickleTimer = 0;
    aliensSpawnedThisWave = 1;

    asteroidTrickleTimer = 0;
    asteroidsSpawnedThisWave = 4;
}

function spawnWave3_2() {
    for (let i = 0; i < 3; i++) spawnAlien();
    for (let i = 0; i < 4; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    spawnTurretDrone();
    spawnTurretDrone();

    alienTrickleTimer = 0;
    aliensSpawnedThisWave = 3;

    asteroidTrickleTimer = 0;
    asteroidsSpawnedThisWave = 4;
}

function spawnWave3_3() {
    for (let i = 0; i < 5; i++) spawnAlien();
    for (let i = 0; i < 5; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    spawnSwarmGroup();
    spawnTurretDrone();
    spawnTurretDrone();
    spawnTurretDrone();

    alienTrickleTimer = 0;
    aliensSpawnedThisWave = 5;

    asteroidTrickleTimer = 0;
    asteroidsSpawnedThisWave = 5;
}

// =====================================================
// MAIN LOOP
// =====================================================

function gameLoop3() {
    if (gameState === "enemyState" || gameState === "bossState") {
        update3();
        draw3();
        drawHUD();
        requestAnimationFrame(gameLoop3);
    } else if (gameState === "bossIntro") {
        draw3();
        drawHUD();
        requestAnimationFrame(gameLoop3);
    } else {
        if (gameState === "victoryState") {
            const overlay = document.getElementById("victoryOverlay");
            overlay.style.display = "flex";
        }
        if (gameState === "gameOverState") {
            document.getElementById("gameOverOverlay").style.display = "flex";
        }
    }
}

// =====================================================
// UPDATE
// =====================================================

function update3() {
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

        // TRICKLE ALIENS
        alienTrickleTimer++;

        if (currentWave === 1 && aliensSpawnedThisWave < 3 && alienTrickleTimer > 120) {
            spawnAlien();
            aliensSpawnedThisWave++;
            alienTrickleTimer = 0;
        }

        if (currentWave === 2 && aliensSpawnedThisWave < 7 && alienTrickleTimer > 90) {
            spawnAlien();
            aliensSpawnedThisWave++;
            alienTrickleTimer = 0;
        }

        if (currentWave === 3 && aliensSpawnedThisWave < 12 && alienTrickleTimer > 70) {
            spawnAlien();
            aliensSpawnedThisWave++;
            alienTrickleTimer = 0;
        }

        // ASTEROID TRICKLE
        asteroidTrickleTimer++;

        if (currentWave === 1 && asteroidsSpawnedThisWave < 6 && asteroidTrickleTimer > 120) {
            spawnAsteroid("large");
            asteroidsSpawnedThisWave++;
            asteroidTrickleTimer = 0;
        }

        if (currentWave === 2 && asteroidsSpawnedThisWave < 8 && asteroidTrickleTimer > 100) {
            spawnAsteroid("large");
            asteroidsSpawnedThisWave++;
            asteroidTrickleTimer = 0;
        }

        if (currentWave === 3 && asteroidsSpawnedThisWave < 10 && asteroidTrickleTimer > 90) {
            spawnAsteroid("large");
            asteroidsSpawnedThisWave++;
            asteroidTrickleTimer = 0;
        }

        // WAVE PROGRESSION
        if (aliensKilled >= requiredKills) {

            asteroids = [];
            aliens = [];
            swarmEnemies = [];
            turretDrones = [];
            enemyBullets = [];
            weapons.active = [];
            explosions = [];

            if (currentWave < 3) {
                currentWave++;
                spawnWave3Level(currentWave);
            } else {
                // Final shop before final boss
                showUpgradeOverlay3();
            }
        }

    } else if (gameState === "bossState") {
        updateBoss3();
        updateAliens();
        updateSwarmEnemies();
        updateTurretDrones();
        updateAsteroids();
        boss3Collisions();
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

function draw3() {
    drawBackgroundCover(ctx, bgImage, canvas);


    if (gameState === "enemyState" || gameState === "bossIntro") {
        drawAsteroids();
        drawAliens();
        drawSwarmEnemies();
        drawTurretDrones();
        drawEnemyBullets();
    }

    if (gameState === "bossState") {
        drawAsteroids();
        drawAliens();
        drawSwarmEnemies();
        drawTurretDrones();
        drawBoss3();
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

    // Score
    ctx.strokeText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Score: ${score}`, 20, 30);

    // Aliens killed / required
    ctx.strokeText(`Aliens: ${aliensKilled} / ${requiredKills}`, 20, 60);
    ctx.fillText(`Aliens: ${aliensKilled} / ${requiredKills}`, 20, 60);

    ctx.restore();
}

// =====================================================
// FINAL UPGRADE SHOP 
// =====================================================

function showUpgradeOverlay3() {
    gameState = "upgradeState";
    document.getElementById("upgradeOverlay").style.display = "flex";
    setupShopUI3();
    document.getElementById("shopMessage").innerText = "";
}

function trySpend3(cost, applyUpgrade) {
    if (score >= cost) {
        score -= cost;

        const msg = applyUpgrade();
        saveUpgrades();

        document.getElementById("shopMessage").innerText = msg || "";
        setupShopUI3();
    } else {
        document.getElementById("shopMessage").innerText = "Not enough points!";
    }
}

function setupShopUI3() {

    const btnLaser = document.getElementById("upgradeLaser");
    const btnForcefield = document.getElementById("upgradeForcefield");
    const btnBulletSpeed = document.getElementById("upgradeBulletSpeed");
    const btnHealth = document.getElementById("upgradeHealth");
    const btnMoveSpeed = document.getElementById("upgradeMoveSpeed");

    [btnLaser, btnForcefield, btnBulletSpeed, btnHealth, btnMoveSpeed]
        .forEach(b => {
            b.style.display = "inline-block";
            b.onclick = null;
        });

    // LASER PATH
    if (!upgrades.unlockLaser) {
        btnLaser.innerText = "Homing Missile (750)";
    } else if (!upgrades.laserDamageLevel2) {
        btnLaser.innerText = "Laser Damage II (500)";
    } else if (!upgrades.laserDamageLevel3) {
        btnLaser.innerText = "Laser Damage III (1000)";
    } else {
        btnLaser.innerText = "Laser Path MAXED";
    }

    btnLaser.onclick = () => {

        if (!upgrades.unlockLaser && !upgrades.homingMissile) {

            trySpend3(750, () => {
                upgrades.homingMissile = true;
                return "Homing Missile Obtained!";
            });

        } else if (upgrades.unlockLaser && !upgrades.laserDamageLevel2) {

            trySpend3(500, () => {
                upgrades.laserDamageLevel = (upgrades.laserDamageLevel || 1) + 1;
                upgrades.laserDamageLevel2 = true;
                return "Laser Damage II Purchased!";
            });

        } else if (upgrades.unlockLaser && !upgrades.laserDamageLevel3) {

            trySpend3(1000, () => {
                upgrades.laserDamageLevel += 1;
                upgrades.laserDamageLevel3 = true;
                return "Laser Damage III Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText = "Already purchased!";
        }
    };

    // FORCEFIELD PATH
    if (!upgrades.unlockForcefield) {
        btnForcefield.innerText = "Forcefield (250)";
    } else if (!upgrades.mine) {
        btnForcefield.innerText = "Mine (750)";
    } else if (!upgrades.forcefieldRecharge2) {
        btnForcefield.innerText = "Forcefield Recharge II (500)";
    } else {
        btnForcefield.innerText = "Defense Path MAXED";
    }

    btnForcefield.onclick = () => {

        if (!upgrades.unlockForcefield) {

            trySpend3(250, () => {
                unlockForcefield = true;
                upgrades.unlockForcefield = true;
                return "Forcefield Obtained!";
            });

        } else if (!upgrades.mine) {

            trySpend3(750, () => {
                upgrades.mine = true;
                return "Mine Obtained!";
            });

        } else if (!upgrades.forcefieldRecharge2) {

            trySpend3(500, () => {
                upgrades.forcefieldRecharge2 = true;
                return "Forcefield Recharge Improved!";
            });

        } else {
            document.getElementById("shopMessage").innerText = "Already purchased!";
        }
    };

    // BULLET SPEED PATH
    if (!upgrades.bulletSpeedLevel3) {
        btnBulletSpeed.innerText = "Bullet Speed III (500)";
    } else if (!upgrades.bulletSpeedLevel4) {
        btnBulletSpeed.innerText = "Bullet Speed IV (1000)";
    } else {
        btnBulletSpeed.innerText = "Bullet Speed MAXED";
    }

    btnBulletSpeed.onclick = () => {

        if (!upgrades.bulletSpeedLevel3) {

            trySpend3(500, () => {
                bulletSpeedBonus += 5;
                upgrades.bulletSpeedBonus = bulletSpeedBonus;
                upgrades.bulletSpeedLevel3 = true;
                return "Bullet Speed III Purchased!";
            });

        } else if (!upgrades.bulletSpeedLevel4) {

            trySpend3(1000, () => {
                bulletSpeedBonus += 5;
                upgrades.bulletSpeedBonus = bulletSpeedBonus;
                upgrades.bulletSpeedLevel4 = true;
                return "Bullet Speed IV Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText = "Already purchased!";
        }
    };

    // HEALTH PATH
    if (!upgrades.healthLevel3) {
        btnHealth.innerText = "Max Health III (300)";
    } else if (!upgrades.healthLevel4) {
        btnHealth.innerText = "Max Health IV (600)";
    } else {
        btnHealth.innerText = "Health MAXED";
    }

    btnHealth.onclick = () => {

        if (!upgrades.healthLevel3) {

            trySpend3(300, () => {
                playerMaxHealth += 2;
                player.playerHealth = playerMaxHealth;
                upgrades.playerMaxHealthBonus = playerMaxHealth - 5;
                upgrades.healthLevel3 = true;
                document.getElementById("playerHealthBar").style.width = "100%";
                return "Health III Purchased!";
            });

        } else if (!upgrades.healthLevel4) {

            trySpend3(600, () => {
                playerMaxHealth += 3;
                player.playerHealth = playerMaxHealth;
                upgrades.playerMaxHealthBonus = playerMaxHealth - 5;
                upgrades.healthLevel4 = true;
                document.getElementById("playerHealthBar").style.width = "100%";
                return "Health IV Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText = "Already purchased!";
        }
    };

    // MOVE SPEED PATH
    if (!upgrades.moveSpeedLevel3) {
        btnMoveSpeed.innerText = "Move Speed III (300)";
    } else if (!upgrades.moveSpeedLevel4) {
        btnMoveSpeed.innerText = "Move Speed IV (600)";
    } else {
        btnMoveSpeed.innerText = "Move Speed MAXED";
    }

    btnMoveSpeed.onclick = () => {

        if (!upgrades.moveSpeedLevel3) {

            trySpend3(300, () => {
                playerSpeedBonus += 1;
                player.speed = 4 + playerSpeedBonus;
                upgrades.playerSpeedBonus = playerSpeedBonus;
                upgrades.moveSpeedLevel3 = true;
                return "Move Speed III Purchased!";
            });

        } else if (!upgrades.moveSpeedLevel4) {

            trySpend3(600, () => {
                playerSpeedBonus += 2;
                player.speed = 4 + playerSpeedBonus;
                upgrades.playerSpeedBonus = playerSpeedBonus;
                upgrades.moveSpeedLevel4 = true;
                return "Move Speed IV Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText = "Already purchased!";
        }
    };

    // CONTINUE → FINAL BOSS
    document.getElementById("upgradeContinue").onclick = () => {
        document.getElementById("upgradeOverlay").style.display = "none";
        transitionToBoss3();
    };
}

// =====================================================
// FINAL BOSS TRANSITION
// =====================================================

function transitionToBoss3() {
    gameState = "bossIntro";

    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    bgMusic = new Audio('./assets/sounds/music/boss-3.mp3');
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

        document.getElementById("boss3HealthBarContainer").style.display = "block";

        boss3Init();
        currentBoss = boss3;
        gameState = "bossState";

        gameLoop3();
    }, 600);
}
