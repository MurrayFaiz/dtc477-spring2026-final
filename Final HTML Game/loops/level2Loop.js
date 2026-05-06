// Tevin - Adding Audio 
// https://chatgpt.com/share/69f77bf7-db08-83e8-8022-38d8d9db9522

// Tevin - background music Debugging
//https://chatgpt.com/share/69f77c2d-2580-83e8-b4e7-831be22df362

// =====================================================
// LEVEL 2 — Unified Loop (Matches Level 1 Architecture)
// =====================================================

let gameState = "start";
let currentWave = 1;
let requiredKills = 0;
let aliensKilled = 0;
let score = 0;
let level2QuizTriggered = false;
let bgMusic = null;

if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

bgMusic = new Audio('./assets/sounds/music/debrief.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

bgMusic.play().catch(error => {
    console.error("Music failed:", error);
});

const bgImage = new Image();
bgImage.src = "./assets/images/background.png"

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

let currentBoss = null;

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
    startLevel2();
});

document.getElementById("gameOverButton").addEventListener("click", () => {
    window.location.reload();
});

// =====================================================
// START LEVEL
// =====================================================

function startLevel2() {
    level2QuizTriggered = false;
    loadUpgrades();

    // DEBUG LOG
    console.log("=== LOADED UPGRADES ===");
    console.log("upgrades.mine:", upgrades.mine);
    console.log("Global 'mine':", mine);
    console.log("localStorage:", localStorage.getItem("arcade_upgrades"));

    applyUpgradesToPlayer();

    // DEBUG LOG AFTER APPLY
    console.log("=== AFTER APPLY ===");
    console.log("Global 'mine' after apply:", mine);

    mine = !!upgrades.mine;
    console.log("FORCED SYNC: mine =", mine);
    upgrades.spreadShot = false;
    upgrades.drone = false;

    playerInit();
    startWavePhase2();
    gameLoop2();

    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    bgMusic = new Audio('./assets/sounds/music/level-2-enemy.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

    bgMusic.play().catch(error => {
        console.error("Music failed:", error);
    });

    document.getElementById("scoreDisplay").style.display = "inline-block";
    document.getElementById("killDisplay").style.display = "inline-block";
    document.getElementById("playerHealthBarContainer").style.display = "block";
}

// =====================================================
// WAVES
// =====================================================

function startWavePhase2() {
    gameState = "enemyState";
    currentWave = 1;
    aliensKilled = 0;
    score = 0;

    spawnWaveLevel2(currentWave);
}

function spawnWaveLevel2(wave) {
    aliensKilled = 0;
    aliensSpawnedThisWave = 0;
    asteroidsSpawnedThisWave = 0;
    swarmEnemies = [];

    if (wave === 1) { requiredKills = 7; spawnWave2_1(); }
    if (wave === 2) { requiredKills = 15; spawnWave2_2(); }
    if (wave === 3) { requiredKills = 20; spawnWave2_3(); }

    document.getElementById("killDisplay").innerText =
        `Aliens: ${aliensKilled} / ${requiredKills}`;
}

function spawnWave2_1() {
    for (let i = 0; i < 2; i++) spawnAlien();
    for (let i = 0; i < 6; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    alienTrickleTimer = 0; aliensSpawnedThisWave = 1;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 6;
}

function spawnWave2_2() {
    for (let i = 0; i < 5; i++) spawnAlien();
    for (let i = 0; i < 4; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    spawnSwarmGroup();
    alienTrickleTimer = 0; aliensSpawnedThisWave = 3;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 4;
}

function spawnWave2_3() {
    for (let i = 0; i < 8; i++) spawnAlien();
    for (let i = 0; i < 5; i++) spawnAsteroid("large");
    spawnSwarmGroup();
    spawnSwarmGroup();
    spawnSwarmGroup();
    alienTrickleTimer = 0; aliensSpawnedThisWave = 4;
    asteroidTrickleTimer = 0; asteroidsSpawnedThisWave = 5;
}

// =====================================================
// MAIN LOOP
// =====================================================

function gameLoop2() {
    if (gameState === "enemyState" || gameState === "bossState") {
        update2();
        draw2();
        requestAnimationFrame(gameLoop2);
        return;
    }

    if (gameState === "bossIntro") {
        draw2();
        requestAnimationFrame(gameLoop2);
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

function update2() {
    updatePlayer();
    updateWeapons();
    updateExplosions();
    updateHealthPickups();

    if (gameState === "enemyState") {
        updateAsteroids();
        updateAliens();
        updateSwarmEnemies();
        updateEnemyBullets();
        enemyCollisions();
        playerCollisions();

        document.getElementById("scoreDisplay").innerText = "Score: " + score;

        // Alien trickle
        alienTrickleTimer++;

        if (currentWave === 1 && aliensSpawnedThisWave < 7 && alienTrickleTimer > 90) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }
        if (currentWave === 2 && aliensSpawnedThisWave < 15 && alienTrickleTimer > 70) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }
        if (currentWave === 3 && aliensSpawnedThisWave < 20 && alienTrickleTimer > 60) { spawnAlien(); aliensSpawnedThisWave++; alienTrickleTimer = 0; }

        // Asteroid trickle
        asteroidTrickleTimer++;

        if (currentWave === 1 && asteroidsSpawnedThisWave < 6 && asteroidTrickleTimer > 120) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }
        if (currentWave === 2 && asteroidsSpawnedThisWave < 8 && asteroidTrickleTimer > 100) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }
        if (currentWave === 3 && asteroidsSpawnedThisWave < 10 && asteroidTrickleTimer > 90) { spawnAsteroid("large"); asteroidsSpawnedThisWave++; asteroidTrickleTimer = 0; }

        // Wave progression
        if (aliensKilled >= requiredKills) {

            asteroids = [];
            aliens = [];
            swarmEnemies = [];
            enemyBullets = [];
            weapons.active = [];
            explosions = [];

            if (!level2QuizTriggered) {
                level2QuizTriggered = true;

                if (currentWave < 3) {
                    currentWave++;
                    spawnWaveLevel2(currentWave);
                    level2QuizTriggered = false;
                } else {

                    quiz();
                }
            }
        }

    }

    if (gameState === "bossState") {
        updateBoss2();
        updateSwarmEnemies();
        boss2Collisions();
        updateAsteroids();
        updateAliens();
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

function draw2() {
    drawBackgroundCover(ctx, bgImage, canvas);

    if (gameState === "enemyState" || gameState === "bossIntro") {
        drawAsteroids();
        drawAliens();
        drawSwarmEnemies();
        drawTurretDrones();
        drawEnemyBullets();
    }

    if (gameState === "bossState") {
        drawBoss2();
        drawAliens();
        drawSwarmEnemies();
        drawTurretDrones();
        drawAsteroids();
        drawEnemyBullets();
    }

    drawHealthPickups();
    drawPlayer();
    drawWeapons();
    drawExplosions();
}

// =====================================================
// QUIZ — opens quiz then feeds into shop
// =====================================================

function quiz() {
    quizCompleteCallback = showUpgradeOverlay2;
    resetQuiz(1);
    document.getElementById("quizOverlay").style.display = "flex";
}

// =====================================================
// SHOP
// =====================================================

function showUpgradeOverlay2() {
    gameState = "upgradeState";
    document.getElementById("upgradeOverlay").style.display = "flex";
    setupShopUI2();
    document.getElementById("shopMessage").innerText = "";
}

function trySpend2(cost, applyUpgrade) {
    if (score >= cost) {
        score -= cost;

        document.getElementById("scoreDisplay").innerText =
            "Score: " + score;

        const msg = applyUpgrade();

        saveUpgrades();

        document.getElementById("shopMessage").innerText = msg || "";

        // Refresh button labels after purchase
        setupShopUI2();

    } else {
        document.getElementById("shopMessage").innerText =
            "Not enough points!";
    }
}

function setupShopUI2() {

    const btnLaser = document.getElementById("upgradeLaser");
    const btnForcefield = document.getElementById("upgradeForcefield");
    const btnBulletSpeed = document.getElementById("upgradeBulletSpeed");
    const btnHealth = document.getElementById("upgradeHealth");
    const btnMoveSpeed = document.getElementById("upgradeMoveSpeed");

    // =====================================================
    // LASER / MINE PATH
    // =====================================================

    if (!upgrades.mine) {
        btnLaser.innerText = "Mine — Discounted (300)";
    } else if (!upgrades.unlockLaser) {
        btnLaser.innerText = "Laser (250)";
    } else if (!upgrades.spreadShot) {
        btnLaser.innerText = "Spread Shot (1000)";
    } else {
        btnLaser.innerText = "No more Upgrades Left!";
    }

    btnLaser.onclick = () => {

        if (!upgrades.mine) {

            trySpend2(300, () => {
                upgrades.mine = true;
                mine = true;
                return "Mine Obtained! (Discounted)";
            });

        } else if (!upgrades.unlockLaser) {

            trySpend2(500, () => {
                upgrades.unlockLaser = true;
                unlockLaser = true;
                return "Laser Obtained!";
            });

        } else if (!upgrades.spreadShot) {

            trySpend2(1000, () => {
                upgrades.spreadShot = true;
                return "Spread Shot Obtained!";
            });

        } else {
            document.getElementById("shopMessage").innerText =
                "Already purchased!";
        }
    };

    // =====================================================
    // FORCEFIELD PATH
    // =====================================================

    if (!upgrades.unlockForcefield) {
        btnForcefield.innerText = "Forcefield (500)";

    } else if (!upgrades.drone) {
        btnForcefield.innerText = "Drone Companion (1500)";

    } else {
        btnForcefield.innerText = "No more Upgrades Left!";
    }

    btnForcefield.onclick = () => {

        if (!upgrades.unlockForcefield) {

            trySpend2(500, () => {
                upgrades.unlockForcefield = true;
                unlockForcefield = true;

                return "Forcefield Obtained!";
            });

        } else if (!upgrades.drone) {

            trySpend2(1500, () => {
                upgrades.drone = true;

                return "Drone Companion Obtained!";
            });

        } else {
            document.getElementById("shopMessage").innerText =
                "Already purchased!";
        }
    };

    // =====================================================
    // BULLET SPEED PATH
    // =====================================================

    if (!upgrades.bulletSpeedLevel2) {
        btnBulletSpeed.innerText = "Bullet Speed II (500)";

    } else if (!upgrades.bulletSpeedLevel3) {
        btnBulletSpeed.innerText = "Bullet Speed III (1000)";

    } else {
        btnBulletSpeed.innerText = "Bullet Speed MAXED";
    }

    btnBulletSpeed.onclick = () => {

        if (!upgrades.bulletSpeedLevel2) {

            trySpend2(500, () => {

                bulletSpeedBonus += 3;

                upgrades.bulletSpeedBonus = bulletSpeedBonus;
                upgrades.bulletSpeedLevel2 = true;

                return "Bullet Speed II Purchased!";
            });

        } else if (!upgrades.bulletSpeedLevel3) {

            trySpend2(1000, () => {

                bulletSpeedBonus += 5;

                upgrades.bulletSpeedBonus = bulletSpeedBonus;
                upgrades.bulletSpeedLevel3 = true;

                return "Bullet Speed III Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText =
                "Already purchased!";
        }
    };

    // =====================================================
    // HEALTH PATH
    // =====================================================

    if (!upgrades.healthLevel2) {
        btnHealth.innerText = "Max Health II (500)";

    } else if (!upgrades.healthLevel3) {
        btnHealth.innerText = "Max Health III (1000)";

    } else {
        btnHealth.innerText = "Health MAXED";
    }

    btnHealth.onclick = () => {

        if (!upgrades.healthLevel2) {

            trySpend2(500, () => {

                playerMaxHealth += 2;
                player.playerHealth = playerMaxHealth;

                upgrades.playerMaxHealthBonus =
                    playerMaxHealth - 5;

                upgrades.healthLevel2 = true;

                document.getElementById("playerHealthBar").style.width =
                    "100%";

                return "Health II Purchased!";
            });

        } else if (!upgrades.healthLevel3) {

            trySpend2(1000, () => {

                playerMaxHealth += 3;
                player.playerHealth = playerMaxHealth;

                upgrades.playerMaxHealthBonus =
                    playerMaxHealth - 5;

                upgrades.healthLevel3 = true;

                document.getElementById("playerHealthBar").style.width =
                    "100%";

                return "Health III Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText =
                "Already purchased!";
        }
    };

    // =====================================================
    // MOVE SPEED PATH
    // =====================================================

    if (!upgrades.moveSpeedLevel2) {
        btnMoveSpeed.innerText = "Move Speed II (500)";

    } else if (!upgrades.moveSpeedLevel3) {
        btnMoveSpeed.innerText = "Move Speed III (1000)";

    } else {
        btnMoveSpeed.innerText = "Move Speed MAXED";
    }

    btnMoveSpeed.onclick = () => {

        if (!upgrades.moveSpeedLevel2) {

            trySpend2(500, () => {

                playerSpeedBonus += 1;

                player.speed = 4 + playerSpeedBonus;

                upgrades.playerSpeedBonus = playerSpeedBonus;

                upgrades.moveSpeedLevel2 = true;

                return "Move Speed II Purchased!";
            });

        } else if (!upgrades.moveSpeedLevel3) {

            trySpend2(1000, () => {

                playerSpeedBonus += 2;

                player.speed = 4 + playerSpeedBonus;

                upgrades.playerSpeedBonus = playerSpeedBonus;

                upgrades.moveSpeedLevel3 = true;

                return "Move Speed III Purchased!";
            });

        } else {
            document.getElementById("shopMessage").innerText =
                "Already purchased!";
        }
    };

    // =====================================================
    // CONTINUE
    // =====================================================

    document.getElementById("upgradeContinue").onclick = () => {

        document.getElementById("upgradeOverlay").style.display = "none";

        transitionToBoss2();
    };
}

// =====================================================
// BOSS TRANSITION
// =====================================================

function transitionToBoss2() {
    gameState = "bossIntro";
    const bar = document.getElementById("boss2HealthBarContainer");
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    bgMusic = new Audio('./assets/sounds/music/boss-2.mp3');
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

        bar.style.display = "block";
        bar.querySelector(".boss-health-label").innerText = "BOSS 2";

        boss2Init();
        currentBoss = boss2;
        gameState = "bossState";

        gameLoop2();
    }, 600);
}