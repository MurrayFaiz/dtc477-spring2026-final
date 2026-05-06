// =====================================================
// BOSS 2 — TRIANGLE NODE BOSS
// NODES NOW ORBIT / DRIFT INDEPENDENTLY
// =====================================================

const boss2Img = new Image();
boss2Img.src = "assets/images/eye-boss-monster.gif";

let boss2 = null;

// =====================================================
// INIT
// =====================================================

function boss2Init() {

    boss2 = {

        x: canvas.width / 2,
        y: 120,

        width: 120,
        height: 80,

        maxHealth: 500,
        health: 500,

        phaseTime: 0,
        movePhase: 0,

        speed: 1.2,

        fireCooldown: 0,
        burstCooldown: 0,

        summonTimer: 0,
        summonInterval: 900,

        nodes: [

            // TOP NODE
            {
                baseAngle: 0,
                orbitRadius: 42,

                orbitSpeed: 0.02,

                x: 0,
                y: 0,

                r: 14,

                maxHp: 50,
                hp: 50,

                alive: true,

                damageToBoss: 200,

                type: "shield"
            },

            // LEFT NODE
            {
                baseAngle: (Math.PI * 2) / 3,
                orbitRadius: 48,

                orbitSpeed: -0.018,

                x: 0,
                y: 0,

                r: 14,

                maxHp: 50,
                hp: 50,

                alive: true,

                damageToBoss: 150,

                type: "burst"
            },

            // RIGHT NODE
            {
                baseAngle: (Math.PI * 4) / 3,
                orbitRadius: 54,
                orbitSpeed: 0.015,
                x: 0,
                y: 0,
                r: 14,
                maxHp: 50,
                hp: 50,
                alive: true,
                damageToBoss: 150,
                type: "spread"
            }
        ]
    };

    currentBoss = boss2;

    document.getElementById("boss2HealthBarContainer").style.display = "block";

    document.getElementById("boss2HealthBar").style.width = "100%";
}

// =====================================================
// UPDATE
// =====================================================

function updateBoss2() {

    if (!boss2) return;

    boss2.phaseTime++;

    // =================================================
    // MAIN BODY MOVEMENT (Full Screen Traversal)
    // =================================================

    // Calculate a value between -1 and 1 for smooth oscillation
    const oscillation = Math.sin(boss2.phaseTime / 120); // Slower speed for grander movement

    // Define travel range with padding (so boss doesn't touch the very edge)
    const padding = 80;
    const halfWidth = boss2.width / 2;

    const minX = padding + halfWidth;
    const maxX = canvas.width - padding - halfWidth;
    const travelRange = maxX - minX;

    // Map oscillation to the full width
    boss2.x = minX + ((oscillation + 1) / 2) * travelRange;

    // Vertical movement: Keep it relatively high but with slight bobbing
    // You can adjust the 100 (base Y) and 15 (bob amplitude) as needed
    boss2.y = 100 + Math.sin(boss2.phaseTime / 80) * 15;

    // =================================================
    // NODE MOVEMENT (Expanded Radius)
    // =================================================

    boss2.nodes.forEach(node => {
        if (!node.alive) return;

        node.baseAngle += node.orbitSpeed;

        // Organic pulsing movement
        const pulse = Math.sin(boss2.phaseTime * 0.03 + node.baseAngle) * 10;

        // INCREASED BASE RADIUS: Changed from typical 60-80 to 110
        // You can tweak 110 to make them even further out
        const expandedBaseRadius = 110;

        const finalRadius = expandedBaseRadius + pulse;

        node.x = boss2.x + Math.cos(node.baseAngle) * finalRadius;
        node.y = boss2.y + Math.sin(node.baseAngle) * finalRadius;
    });


    // =================================================
    // ATTACKS
    // =================================================

    const spreadNodeAlive =
        boss2.nodes.some(n => n.alive && n.type === "spread");

    const burstNodeAlive =
        boss2.nodes.some(n => n.alive && n.type === "burst");

    if (spreadNodeAlive) {

        if (boss2.fireCooldown <= 0) {

            boss2SpreadShot();

            boss2.fireCooldown = 90;

        } else {

            boss2.fireCooldown--;
        }
    }

    if (burstNodeAlive) {

        if (boss2.burstCooldown <= 0) {

            boss2BurstVolley();

            boss2.burstCooldown = 240;

        } else {

            boss2.burstCooldown--;
        }
    }

    boss2.summonTimer++;
    if (boss2.summonTimer >= boss2.summonInterval) {
        boss2.summonTimer = 0;
        spawnAlien();
        spawnAlien();
        spawnAsteroid("medium");
        spawnSwarmGroup();
    }

    // =================================================
    // HEALTH BAR
    // =================================================

    boss2.health = Math.max(0, boss2.health);

    const pct = boss2.health / boss2.maxHealth;

    document.getElementById("boss2HealthBar").style.width =
        (pct * 100) + "%";

    // =================================================
    // DEATH
    // =================================================

    if (boss2.health <= 0) {

        document.getElementById("boss2HealthBarContainer").style.display = "none";

        boss2 = null;
        currentBoss = null;

        gameState = "victoryState";
    }
}

// =====================================================
// ATTACKS
// =====================================================

function boss2SpreadShot() {

    const spreadNode =
        boss2.nodes.find(n =>
            n.alive &&
            n.type === "spread"
        );

    if (!spreadNode) return;

    const angles = [-0.4, -0.2, 0, 0.2, 0.4];

    angles.forEach(a => {

        enemyBullets.push({

            x: spreadNode.x,
            y: spreadNode.y,

            vx: Math.sin(a) * 3,
            vy: Math.cos(a) * 3,

            size: 5
        });
    });
}

function boss2BurstVolley() {

    const burstNode =
        boss2.nodes.find(n =>
            n.alive &&
            n.type === "burst"
        );

    if (!burstNode) return;

    for (let i = 0; i < 6; i++) {

        enemyBullets.push({

            x: burstNode.x,
            y: burstNode.y,

            vx: 0,
            vy: 4 + i * 0.3,

            size: 4
        });
    }
}

// =====================================================
// DRAW
// =====================================================

function drawBoss2() {

    if (!boss2) return;

    // =================================================
    // BODY
    // =================================================

    ctx.drawImage(
        boss2Img,
        boss2.x - boss2.width / 2,
        boss2.y - boss2.height / 2,
        boss2.width,
        boss2.height
    );

    // =================================================
    // TETHER LINES
    // =================================================

    boss2.nodes.forEach(node => {

        if (!node.alive) return;

        ctx.beginPath();

        ctx.strokeStyle =
            "rgba(255,255,255,0.3)";

        ctx.moveTo(boss2.x, boss2.y);

        ctx.lineTo(node.x, node.y);

        ctx.stroke();
    });

    // =================================================
    // NODES
    // =================================================

    boss2.nodes.forEach(node => {

        if (!node.alive) return;

        ctx.beginPath();

        if (node.type === "shield") {
            ctx.fillStyle = "cyan";
        }

        if (node.type === "burst") {
            ctx.fillStyle = "orange";
        }

        if (node.type === "spread") {
            ctx.fillStyle = "red";
        }

        ctx.arc(
            node.x,
            node.y,
            node.r,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // =================================================
        // NODE HP RING
        // =================================================

        ctx.beginPath();

        ctx.strokeStyle = "white";

        ctx.lineWidth = 2;

        ctx.arc(
            node.x,
            node.y,
            node.r + 4,
            -Math.PI / 2,
            (-Math.PI / 2) +
            ((node.hp / node.maxHp) * Math.PI * 2)
        );

        ctx.stroke();
    });

    // =====================================================
    // BOSS HEALTH BAR
    // =====================================================

    const barWidth = 200;
    const barHeight = 15;

    const barX =
        boss2.x - barWidth / 2;

    const barY =
        boss2.y - (boss2.height / 2) - 32;

    const pct = Math.max(
        0,
        boss2.health / boss2.maxHealth
    );

    // =====================================================
    // BACKGROUND TRACK
    // =====================================================

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.6)";

    ctx.fillRect(
        barX - 1,
        barY - 1,
        barWidth + 2,
        barHeight + 2
    );

    // =====================================================
    // DEPLETED SECTION
    // =====================================================

    ctx.fillStyle = "#550000";

    ctx.fillRect(
        barX,
        barY,
        barWidth,
        barHeight
    );

    // =====================================================
    // ACTIVE HEALTH
    // =====================================================

    const r =
        Math.round(255 * (1 - pct));

    const g =
        Math.round(255 * pct);

    ctx.fillStyle =
        `rgb(${r}, ${g}, 30)`;

    ctx.fillRect(
        barX,
        barY,
        barWidth * pct,
        barHeight
    );

    // =====================================================
    // BORDER
    // =====================================================

    ctx.strokeStyle =
        "rgba(255,255,255,0.4)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        barX,
        barY,
        barWidth,
        barHeight
    );

    // =====================================================
    // LABEL
    // =====================================================

    ctx.fillStyle = "white";

    ctx.font = "bold 11px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "THE GAME MASTER",
        boss2.x,
        barY - 6
    );
}
// =====================================================
// COLLISIONS
// =====================================================

function boss2Collisions() {

    if (!boss2) return;

    for (let i = weapons.active.length - 1; i >= 0; i--) {

        const w = weapons.active[i];

        // =================================================
        // BULLET
        // =================================================

        if (w.type === "bullet") {

            let hitSomething = false;

            for (let node of boss2.nodes) {

                if (!node.alive) continue;

                if (Math.hypot(node.x - w.x, node.y - w.y) < node.r) {

                    node.hp--;
                    weapons.active.splice(i, 1);
                    hitSomething = true;

                    if (node.hp <= 0) {
                        node.alive = false;
                        boss2.health -= node.damageToBoss;
                        explosions.push({ x: node.x, y: node.y, radius: 35, alpha: 1 });
                    }

                    break;
                }
            }

            if (hitSomething) continue;

            const hitBody =
                w.x > boss2.x - boss2.width / 2 &&
                w.x < boss2.x + boss2.width / 2 &&
                w.y > boss2.y - boss2.height / 2 &&
                w.y < boss2.y + boss2.height / 2;

            if (hitBody) {

                weapons.active.splice(i, 1);

                const shieldAlive = boss2.nodes.some(n => n.alive && n.type === "shield");
                boss2.health -= shieldAlive ? 0.25 : 1;
            }
        }

        // =================================================
        // LASER
        // =================================================

        if (w.type === "laser") {

            const cos = Math.cos(w.angle);
            const sin = Math.sin(w.angle);

            for (let node of boss2.nodes) {

                if (!node.alive) continue;

                const dx = node.x - w.x;
                const dy = node.y - w.y;
                const dot = dx * cos + dy * sin;
                const perp = Math.abs(dx * sin - dy * cos);

                if (dot > 0 && perp < node.r) {

                    node.hp -= 0.5;

                    if (node.hp <= 0) {
                        node.alive = false;
                        boss2.health -= node.damageToBoss;
                        explosions.push({ x: node.x, y: node.y, radius: 35, alpha: 1 });
                    }
                }
            }

            // Laser hits body
            const dx = boss2.x - w.x;
            const dy = boss2.y - w.y;
            const dot = dx * cos + dy * sin;
            const perp = Math.abs(dx * sin - dy * cos);

            if (dot > 0 && perp < boss2.width / 2) {
                const shieldAlive = boss2.nodes.some(n => n.alive && n.type === "shield");
                boss2.health -= shieldAlive ? 0.05 : 0.2;
            }
        }

        // =================================================
        // MISSILE
        // =================================================

        if (w.type === "missile") {

            let hit = false;

            for (let node of boss2.nodes) {

                if (!node.alive) continue;

                if (Math.hypot(node.x - w.x, node.y - w.y) < node.r + 10) {

                    node.hp -= 8;
                    explosions.push({ x: w.x, y: w.y, radius: 10, alpha: 1 });
                    weapons.active.splice(i, 1);
                    hit = true;

                    if (node.hp <= 0) {
                        node.alive = false;
                        boss2.health -= node.damageToBoss;
                        explosions.push({ x: node.x, y: node.y, radius: 35, alpha: 1 });
                    }

                    break;
                }
            }

            if (hit) continue;

            const hitBody =
                w.x > boss2.x - boss2.width / 2 &&
                w.x < boss2.x + boss2.width / 2 &&
                w.y > boss2.y - boss2.height / 2 &&
                w.y < boss2.y + boss2.height / 2;

            if (hitBody) {
                const shieldAlive = boss2.nodes.some(n => n.alive && n.type === "shield");
                boss2.health -= shieldAlive ? 5 : w.damage;
                explosions.push({ x: w.x, y: w.y, radius: 10, alpha: 1 });
                weapons.active.splice(i, 1);
            }
        }
    }
}