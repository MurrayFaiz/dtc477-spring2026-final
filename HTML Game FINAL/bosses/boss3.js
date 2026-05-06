// =====================================================
// BOSS 3 — FINAL BOSS (CLEAN VERSION)
// =====================================================

const boss3Img = new Image();
boss3Img.src = "assets/images/ship-boss.gif";

let boss3 = null;

// =====================================================
// INIT
// =====================================================

function boss3Init() {

    boss3 = {
        x: canvas.width / 2,
        y: 110,
        width: 130,
        height: 90,

        maxHealth: 500,
        health: 500,

        active: true,

        shieldHp: 20,
        shieldMax: 20,
        shieldRegenDelay: 1300,
        shieldRegenTimer: 0,
        shieldRegenRate: 0.1,

        phase: 1,
        timer: 0,

        coreExposed: false,

        summonTimer: 0,
        summonInterval: 1200,

        ringCooldown: 200,
        laserCooldown: 260,
        meteorCooldown: 220
    };

    currentBoss = boss3;

    const bar = document.getElementById("boss3HealthBar");
    if (bar) bar.style.width = "100%";
}

// =====================================================
// UPDATE
// =====================================================

function updateBoss3() {

    if (!boss3 || !boss3.active) return;

    boss3.timer++;

    // Phase change
    if (boss3.health < boss3.maxHealth * 0.6) {
        boss3.phase = 2;
    }

    // --- MOVEMENT WITH BOUNDARY CLAMPING ---

    // Calculate intended position based on sine wave
    let intendedX = boss3.x;
    let intendedY = boss3.y;

    if (boss3.phase === 1) {
        intendedX += Math.sin(boss3.timer / 80) * 1.5;
        // Y stays constant in phase 1
    } else {
        intendedX += Math.sin(boss3.timer / 70) * 1.8;
        intendedY = 110 + Math.sin(boss3.timer / 60) * 10;
    }

    // Apply Clamping
    // Ensure boss stays within canvas, accounting for its width/height
    const halfWidth = boss3.width / 2;
    const halfHeight = boss3.height / 2;

    // Clamp X
    if (intendedX < halfWidth) intendedX = halfWidth;
    if (intendedX > canvas.width - halfWidth) intendedX = canvas.width - halfWidth;

    // Clamp Y
    if (intendedY < halfHeight) intendedY = halfHeight;
    if (intendedY > canvas.height - halfHeight) intendedY = canvas.height - halfHeight;

    // Update boss position
    boss3.x = intendedX;
    boss3.y = intendedY;

    // =================================================
    // MOVEMENT ACROSS FULL CANVAS
    // =================================================

    // Calculate a value between -1 and 1
    const oscillation = Math.sin(boss3.timer / 100); // Slower speed for smoother travel

    // Define the travel range (leave some padding from edges)
    const padding = 100;
    const minX = padding + (boss3.width / 2);
    const maxX = canvas.width - padding - (boss3.width / 2);
    const travelRange = maxX - minX;

    // Map the oscillation (-1 to 1) to the travel range (minX to maxX)
    // Formula: min + ((oscillation + 1) / 2) * range
    boss3.x = minX + ((oscillation + 1) / 2) * travelRange;

    // Vertical movement (optional, keeps it near the top)
    if (boss3.phase === 2) {
        boss3.y = 110 + Math.sin(boss3.timer / 60) * 10;
    } else {
        boss3.y = 110; // Stay steady in Phase 1
    }

    // =================================================
    // SUMMON SYSTEM
    // =================================================

    boss3.summonTimer++;

    if (boss3.summonTimer >= boss3.summonInterval) {
        boss3.summonTimer = 0;
        spawnAlien();
        spawnAlien();
        spawnSwarmGroup();
        spawnSwarmGroup();
        spawnTurretDrone();
        spawnTurretDrone();
        spawnAsteroid("medium");
    }

    // =================================================
    // ATTACKS
    // =================================================

    if (--boss3.ringCooldown <= 0) {
        boss3BulletRing();
        boss3.ringCooldown = 200;
    }

    if (--boss3.laserCooldown <= 0) {
        boss3LaserSweep();
        boss3.laserCooldown = 260;
    }

    if (--boss3.meteorCooldown <= 0) {
        boss3MeteorDrop();
        boss3.meteorCooldown = 220;
    }

    // =================================================
    // HEALTH BAR UI
    // =================================================

    const bar = document.getElementById("boss3HealthBar");
    if (bar) {
        const pct = Math.max(0, boss3.health / boss3.maxHealth);
        bar.style.width = (pct * 100) + "%";
    }

    // =================================================
    // SHIELD REGENERATION SYSTEM
    // =================================================

    if (boss3.shieldHp < boss3.shieldMax) {

        boss3.shieldRegenTimer++;

        if (boss3.shieldRegenTimer >= boss3.shieldRegenDelay) {

            boss3.shieldHp += boss3.shieldRegenRate;

            if (boss3.shieldHp > boss3.shieldMax) {
                boss3.shieldHp = boss3.shieldMax;
            }
        }

    } else {
        boss3.shieldRegenTimer = 0;
    }

    // =================================================
    // DEATH
    // =================================================

    if (boss3.health <= 0) {
        boss3.active = false;
        currentBoss = null;
        gameState = "victoryState";
    }
}

// =====================================================
// ATTACKS
// =====================================================

function boss3BulletRing() {

    const count = 16;

    for (let i = 0; i < count; i++) {

        const angle = (Math.PI * 2 * i) / count;

        enemyBullets.push({
            x: boss3.x,
            y: boss3.y,
            vx: Math.cos(angle) * 2.2,
            vy: Math.sin(angle) * 2.2,
            size: 4
        });
    }
}

function boss3LaserSweep() {

    boss3.coreExposed = true;

    setTimeout(() => {
        if (boss3) boss3.coreExposed = false;
    }, 1500);

    const dir = Math.random() < 0.5 ? -1 : 1;

    for (let i = 0; i < 12; i++) {

        enemyBullets.push({
            x: dir < 0 ? canvas.width : 0,
            y: 80 + i * 25,
            vx: dir * -4,
            vy: 0,
            size: 6
        });
    }
}

function boss3MeteorDrop() {

    for (let i = 0; i < 4; i++) {

        spawnAsteroid(
            "medium",
            Math.random() * canvas.width,
            -20
        );
    }
}

// =====================================================
// DRAW
// =====================================================

function drawBoss3() {

    if (!boss3 || !boss3.active) return;

    ctx.save();
    ctx.translate(boss3.x, boss3.y);

    ctx.drawImage(
        boss3Img,
        -boss3.width / 2,
        -boss3.height / 2,
        boss3.width,
        boss3.height
    );

    // =================================================
    // SHIELD (VISUAL HP + REGEN FEEDBACK)
    // =================================================

    if (boss3.shieldHp > 0) {

        const pct = boss3.shieldHp / boss3.shieldMax;

        ctx.beginPath();

        // Color shifts based on shield strength
        const r = Math.round(80 + (175 * (1 - pct)));   // gets redder when weak
        const g = Math.round(200 * pct + 30);          // stronger = more blue/green
        const alpha = 0.25 + (pct * 0.6);              // fades when weak

        ctx.strokeStyle = `rgba(${r}, ${g}, 255, ${alpha})`;

        // Thickness shows strength
        ctx.lineWidth = 3 + (pct * 5);

        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();

        // =================================================
        // REGEN VISUAL INDICATOR (ONLY WHEN RECHARGING)
        // =================================================

        if (boss3.shieldRegenTimer > 0 && pct < 1) {

            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
            ctx.lineWidth = 2;

            // subtle outer pulse ring
            ctx.arc(0, 0, 78 + Math.sin(Date.now() / 100) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // =================================================
    // CORE
    // =================================================

    if (boss3.coreExposed) {

        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // =================================================
    // HEALTH BAR (CANVAS)
    // =================================================

    const barWidth = 220;
    const barHeight = 16;

    // relative to boss center (since we're already translated)
    const barX = -barWidth / 2;
    const barY = -boss3.height / 2 - 34;

    const pct = Math.max(0, boss3.health / boss3.maxHealth);

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Empty bar
    ctx.fillStyle = "#550000";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const r = Math.round(255 * (1 - pct));
    const g = Math.round(255 * pct);

    ctx.fillStyle = `rgb(${r},${g},30)`;
    ctx.fillRect(barX, barY, barWidth * pct, barHeight);

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Label (also relative!)
    ctx.fillStyle = "white";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
        "CENTRAL FLEET OVERSEER",
        0,                 // center of boss (NOT boss.x)
        barY - 6
    );

    ctx.restore();
}

// =====================================================
// COLLISIONS
// =====================================================

function boss3Collisions() {

    if (!boss3 || !boss3.active) return;

    for (let i = weapons.active.length - 1; i >= 0; i--) {

        const w = weapons.active[i];

        const dx = boss3.x - w.x;
        const dy = boss3.y - w.y;
        const dist = Math.hypot(dx, dy);

        // SHIELD
        if (boss3.shieldHp > 0 && dist < 70) {
            boss3.shieldHp--;
            weapons.active.splice(i, 1);
            continue;
        }

        // CORE
        if (boss3.coreExposed && dist < 18) {
            boss3.health -= 3;
            weapons.active.splice(i, 1);
            continue;
        }

        // BODY
        if (
            w.x > boss3.x - boss3.width / 2 &&
            w.x < boss3.x + boss3.width / 2 &&
            w.y > boss3.y - boss3.height / 2 &&
            w.y < boss3.y + boss3.height / 2
        ) {
            boss3.health -= 1;
            weapons.active.splice(i, 1);
        }
    }
}