// =====================================================
// BOSS 1 — SIMPLE CIRCLE HITBOX VERSION
// Fully compatible with updated weaponsSystem.js
// =====================================================

const boss1 = {
    x: canvas.width / 2,
    y: 120,
    radius: 60,

    maxHealth: 250,
    bossHealth: 250,

    laserHitCooldown: 0,
    laserHitDelay: 120, // ms between laser damage ticks

    vx: 2,
    vy: 0.5,

    summonTimer: 0,
    summonInterval: 600,
    active: false

};

let boss1Bullets = [];

// =====================================================
// INIT
// =====================================================

function boss1Init() {

    boss1.x = canvas.width / 2;
    boss1.y = 120;

    boss1.bossHealth = boss1.maxHealth;
    boss1.active = true;

    boss1Bullets = [];

    boss1.laserHitCooldown = 0;

    // =====================================================
    // SHOW HEALTH BAR CONTAINER
    // =====================================================

    const bossBarContainer =
        document.getElementById("boss1HealthContainer");

    const bossBar =
        document.getElementById("boss1HealthBar");

    if (bossBarContainer) {
        bossBarContainer.style.display = "block";
    }

    if (bossBar) {
        bossBar.style.width = "100%";
    }
}

// =====================================================
// UPDATE
// =====================================================

function updateBoss1() {

    if (!boss1.active) return;

    // =====================================================
    // MOVEMENT
    // =====================================================

    boss1.x += boss1.vx;

    if (
        boss1.x < boss1.radius ||
        boss1.x > canvas.width - boss1.radius
    ) {
        boss1.vx *= -1;
    }

    // =====================================================
    // FIRE BULLETS
    // =====================================================

    if (Math.random() < 0.03) {

        boss1Bullets.push({
            x: boss1.x,
            y: boss1.y + boss1.radius,
            vx: (Math.random() - 0.5) * 2,
            vy: 4
        });
    }

    // =====================================================
    // UPDATE BOSS BULLETS
    // =====================================================

    for (let b of boss1Bullets) {

        b.x += b.vx;
        b.y += b.vy;
    }

    boss1Bullets =
        boss1Bullets.filter(b => b.y < canvas.height);

    // =====================================================
    // LASER COOLDOWN
    // =====================================================

    if (boss1.laserHitCooldown > 0) {
        boss1.laserHitCooldown -= 16;
    }

    // =====================================================
    // UPDATE HEALTH BAR
    // =====================================================

    const bossBar =
        document.getElementById("boss1HealthBar");

    if (bossBar) {

        const pct = Math.max(
            0,
            boss1.bossHealth / boss1.maxHealth
        );

        bossBar.style.width = (pct * 100) + "%";
    }

    // Summon enemies periodically
    boss1.summonTimer++;
    if (boss1.summonTimer >= boss1.summonInterval) {
        boss1.summonTimer = 0;
        spawnAlien();
        spawnAlien();
        spawnAsteroid("medium");
    }

    // =====================================================
    // DEATH CHECK
    // =====================================================

    if (boss1.bossHealth <= 0) {

        boss1.active = false;

        // Hide health bar when boss dies
        const bossBarContainer =
            document.getElementById("boss1HealthContainer");

        if (bossBarContainer) {
            bossBarContainer.style.display = "none";
        }

        gameState = "victoryState";
    }
}

// =====================================================
// COLLISIONS (Simple Circle Hitbox)
// =====================================================

function boss1Collisions() {
    if (!boss1.active) return;

    const bx = boss1.x;
    const by = boss1.y;
    const br = boss1.radius;

    // PLAYER WEAPONS
    for (let i = weapons.active.length - 1; i >= 0; i--) {
        const w = weapons.active[i];

        // Distance from weapon to boss center
        const d = Math.hypot(w.x - bx, w.y - by);

        if (d < br) {

            // LASER — continuous damage
            if (w.type === "laser") {
                if (boss1.laserHitCooldown <= 0) {
                    boss1.bossHealth -= w.damage || 20;
                    boss1.laserHitCooldown = boss1.laserHitDelay;
                }
            }

            // MISSILE
            else if (w.type === "missile") {
                boss1.bossHealth -= Math.floor((w.damage || 10) * 0.3);
                weapons.active.splice(i, 1);
            }

            // MINE — handled in explodeMine()
            else if (w.type === "mine") {
                // do nothing here
            }

            // LIGHTNING — handled in lightning tick
            else if (w.type === "lightning") {
                // do nothing here
            }

            // BULLET or default
            else {
                boss1.bossHealth -= w.damage || 5;
                weapons.active.splice(i, 1);
            }

            // Death check
            if (boss1.bossHealth <= 0) {
                boss1.active = false;
                gameState = "victoryState";
            }
        }
    }

    // BOSS BULLETS → PLAYER
    for (let i = boss1Bullets.length - 1; i >= 0; i--) {
        const b = boss1Bullets[i];
        if (Math.hypot(b.x - player.x, b.y - player.y) < 20) {
            boss1Bullets.splice(i, 1);
            player.takeDamage(1);
        }
    }
}

// =====================================================
// DRAW
// =====================================================

// Load boss image
const boss1Img = new Image();
boss1Img.src = "assets/images/boss1.png"; // <-- use your actual path

function drawBoss1() {
    if (!boss1.active) return;

    const size = boss1.radius * 2;

    ctx.save();

    // Draw sprite centered on boss
    ctx.drawImage(
        boss1Img,
        boss1.x - boss1.radius,
        boss1.y - boss1.radius,
        size,
        size
    );

    ctx.restore();

    // =====================================================
    // BOSS HEALTH BAR (drawn on canvas above sprite)
    // =====================================================

    const barWidth = 160;
    const barHeight = 14;
    const barX = boss1.x - barWidth / 2;
    const barY = boss1.y - boss1.radius - 28;
    const pct = Math.max(0, boss1.bossHealth / boss1.maxHealth);

    // Background track
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Red depleted section
    ctx.fillStyle = "#550000";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Active health — green → yellow → red based on pct
    const r = Math.round(255 * (1 - pct));
    const g = Math.round(255 * pct);
    ctx.fillStyle = `rgb(${r}, ${g}, 30)`;
    ctx.fillRect(barX, barY, barWidth * pct, barHeight);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Label
    ctx.fillStyle = "white";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PATROL SHIP CENTRAL COMMAND", boss1.x, barY - 5);

    // Draw boss bullets
    ctx.fillStyle = "red";
    for (let b of boss1Bullets) {
        ctx.fillRect(b.x - 3, b.y - 6, 6, 12);
    }
}
