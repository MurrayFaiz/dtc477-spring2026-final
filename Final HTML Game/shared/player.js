// Tevin - Adding Audio 
// https://chatgpt.com/share/69f77bf7-db08-83e8-8022-38d8d9db9522

// Player Dying + Health Glitch/Crashing fix
// https://claude.ai/share/fe9ca8e4-9d14-49e9-8ec9-214e4d23fd61

// =====================================================
// PLAYER + INPUT
// =====================================================

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// PLAYER IMAGE
const playerImg = new Image();
playerImg.src = "assets/images/player.png";

// FIRE RATE (ms) — modified by upgrades
let FIRE_RATE = 250;
// Safety defaults if not defined yet
if (typeof unlockLaser === "undefined") window.unlockLaser = false;
if (typeof unlockForcefield === "undefined") window.unlockForcefield = false;
if (typeof bulletSpeedBonus === "undefined") window.bulletSpeedBonus = 0;
if (typeof playerSpeedBonus === "undefined") window.playerSpeedBonus = 0;
if (typeof playerMaxHealth === "undefined") window.playerMaxHealth = 5;

let lastForcefieldTime = 0;
let lastLaserTime = 0;
let lastMissileTime = 0;
let lastMineTime = 0;
homingMissile = true;

// =====================================================
// PLAYER OBJECT
// =====================================================

const player = {
    x: 325,
    y: 470,
    width: 40,
    height: 40,
    img: playerImg,

    speed: 4,              // modified by playerSpeedBonus
    lastShotTime: 0,

    playerHealth: 50,      // overwritten by playerMaxHealth at init
    invincible: false,
    invincibleStop: 0,
    active: true,

    angle: -Math.PI / 2,
    vx: 0,
    vy: 0,
    rotationSpeed: 0.07,
    thrustPower: 0.30,
    friction: 0.93,

    // =================================================
    // DAMAGE HANDLING (works with pickups)
    // =================================================
    takeDamage(amount) {
        if (this.invincible || !this.active) return;

        this.playerHealth -= amount;

        // Update UI
        const pct = Math.max(0, this.playerHealth / playerMaxHealth);
        document.getElementById("playerHealthBar").style.width = (pct * 100) + "%";

        // Invincibility frames
        this.invincible = true;
        this.invincibleStop = Date.now() + 3000;

        // Death
        if (this.playerHealth <= 0) {
            this.playerHealth = 0;
            this.active = false;
            gameState = "gameOverState";
        }
    },
};

// =====================================================
// PLAYER INIT
// =====================================================

function playerInit() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 40;
    player.vx = 0;
    player.vy = 0;
    player.angle = -Math.PI / 2;

    // Set health to max
    player.playerHealth = playerMaxHealth;
    player.invincible = false;
    player.active = true;

    // Reset UI
    document.getElementById("playerHealthBar").style.width = "100%";
}

// =====================================================
// SHOOTING (WEAPON SYSTEM INTEGRATION)
// =====================================================

document.addEventListener("keydown", e => {
    if (e.code === "Space") e.preventDefault();
    if (!player.active) return;
    if (gameState === "gameOverState") return;

    if (unlockLaser === true && e.code === "KeyL") {
        const now = Date.now();
        if (now - lastLaserTime > 3000) {  // 3 second cooldown
            fireLaser();
            playSound(laserFX, "laser", 1.0, 250);
            lastLaserTime = now;
        }
    }

    // FORCEFIELD
    if (unlockForcefield === true && e.code === "ShiftRight") {
        const now = Date.now();
        if (now - lastForcefieldTime > 5000) {
            spawnWeapon("forcefield", {
                x: player.x,
                y: player.y,
                radius: 60,
                life: 180
            });
            lastForcefieldTime = now;
            playSound(shieldFX, "shield", 0.1, 500);
        }
    }

    if (homingMissile === true && e.code === "KeyJ") {
        console.log("missile key hit");
        const now = Date.now();
        if (now - lastMissileTime > 1500) {
            console.log("missile fired");
            fireMissile();
            playSound(missileFX, "missile", 0.4, 250);
            lastMissileTime = now;
        }
    }

    if (mine === true && e.code === "KeyK") {
        console.log("K pressed")
        const now = Date.now();
        if (now - lastMineTime > 2000) {
            fireMine();
            playSound(mineFX, "mine", 0.6, 500);
            lastMineTime = now;
        }
    }
});

// =====================================================
// PLAYER UPDATE
// =====================================================

function updatePlayer() {
    if (!player.active) return;

    // =================================================
    // ENEMY STATE — ASTEROIDS MODE
    // =================================================
    if (gameState === "enemyState") {

        // ROTATION
        if (keys["ArrowLeft"] || keys["KeyA"]) player.angle -= player.rotationSpeed;
        if (keys["ArrowRight"] || keys["KeyD"]) player.angle += player.rotationSpeed;

        // THRUST
        if (keys["ArrowUp"] || keys["KeyW"]) {
            player.vx += Math.cos(player.angle) * player.thrustPower;
            player.vy += Math.sin(player.angle) * player.thrustPower;
        }

        // REVERSE
        if (keys["ArrowDown"] || keys["KeyS"]) {
            player.vx -= Math.cos(player.angle) * (player.thrustPower * 0.5);
            player.vy -= Math.sin(player.angle) * (player.thrustPower * 0.5);
        }

        // FRICTION
        player.vx *= player.friction;
        player.vy *= player.friction;

        // APPLY MOVEMENT
        player.x += player.vx;
        player.y += player.vy;

        // SCREEN WRAP
        if (player.x < 0) player.x = canvas.width;
        if (player.x > canvas.width) player.x = 0;
        if (player.y < 0) player.y = canvas.height;
        if (player.y > canvas.height) player.y = 0;
    }

    // =================================================
    // BOSS STATE — SPACE INVADERS MODE
    // =================================================
    else if (gameState === "bossState") {

        if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= player.speed;
        if (keys["ArrowRight"] || keys["KeyD"]) player.x += player.speed;

        // Clamp horizontally
        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));

        player.vx = 0;
        player.vy = 0;
        player.angle = -Math.PI / 2;
    }

    // HOLD TO SHOOT
    if (gameState === "enemyState" || gameState === "bossState") {
        const now = Date.now();
        if (keys["Space"] && now - player.lastShotTime > FIRE_RATE) {
            fireBullet();
            playSound(bulletFX, "bullet", .5, 250);
            player.lastShotTime = now;
        }
    }

    // INVINCIBILITY TIMER
    if (player.invincible && Date.now() > player.invincibleStop) {
        player.invincible = false;
    }
}

// =====================================================
// DRAW PLAYER
// =====================================================

function drawPlayer() {
    if (!player.active) return;

    // Blink during invincibility
    if (player.invincible) {
        const blink = Math.floor(Date.now() / 100) % 2;
        if (blink === 0) return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (gameState === "enemyState")
        ctx.rotate(player.angle + Math.PI / 2);

    ctx.drawImage(player.img, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}
