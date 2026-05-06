// =====================================================
// COLLISIONS
// =====================================================

let enemyBullets = [];
const ASTEROID_HITBOX_SCALE = 0.75;

// Distance utility
function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}

// =====================================================
// PLAYER COLLISIONS
// =====================================================

function playerCollisions() {
    if (!player.active) return;

    const px = player.x;
    const py = player.y;

    // ASTEROIDS
    for (let a of asteroids) {
        if (dist(a.x, a.y, px, py) < a.radius * ASTEROID_HITBOX_SCALE + 20) {
            player.takeDamage(1);
        }
    }

    // ALIEN BULLETS
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (dist(b.x, b.y, px, py) < 20) {
            enemyBullets.splice(i, 1);
            player.takeDamage(1);
        }
    }

    // ALIENS
    for (let a of aliens) {
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        if (dist(ax, ay, px, py) < 30) {
            player.takeDamage(1);
        }
    }

    // SWARM ENEMIES
    let swarmDamageThisFrame = 0;
    for (let i = swarmEnemies.length - 1; i >= 0; i--) {
        const s = swarmEnemies[i];
        if (dist(s.x + s.width / 2, s.y + s.height / 2, px, py) < 24 && s.damageCooldown === 0) {
            swarmDamageThisFrame++;
            s.damageCooldown = 45;
        }
    }
    if (swarmDamageThisFrame > 0) {
        player.takeDamage(swarmDamageThisFrame);
    }

    // HEALTH PICKUPS 
    for (let i = healthPickups.length - 1; i >= 0; i--) {
        const p = healthPickups[i];
        if (dist(p.x, p.y, px, py) < 30) {

            // Heal player
            player.playerHealth = Math.min(player.playerHealth + 1, playerMaxHealth);

            // Update UI bar only (this element exists)
            const percent = (player.playerHealth / playerMaxHealth) * 100;
            document.getElementById("playerHealthBar").style.width = percent + "%";

            healthPickups.splice(i, 1);
        }
    }
}

// =====================================================
// ENEMY COLLISIONS (WEAPONS)
// =====================================================

function enemyCollisions() {
    // ALIENS
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;

        for (let w of weapons.active) {
            if (dist(ax, ay, w.x, w.y) < 25) {
                damageAlien(i, w.damage || 1);
                break;
            }
        }
    }

    // SWARM ENEMIES
    for (let i = swarmEnemies.length - 1; i >= 0; i--) {
        const s = swarmEnemies[i];
        const sx = s.x + s.width / 2;
        const sy = s.y + s.height / 2;

        for (let w of weapons.active) {
            if (dist(sx, sy, w.x, w.y) < 20) {
                damageSwarm(i, w.damage || 1);
                break;
            }
        }
    }

    // TURRET DRONES
    for (let i = turretDrones.length - 1; i >= 0; i--) {
        const t = turretDrones[i];
        const tx = t.x + t.width / 2;
        const ty = t.y + t.height / 2;

        for (let w of weapons.active) {
            if (dist(tx, ty, w.x, w.y) < 22) {
                damageTurretDrone(i, w.damage || 1);
                break;
            }
        }
    }
}

// =====================================================
// ENEMY BULLETS
// =====================================================

function updateEnemyBullets() {
    for (let b of enemyBullets) {
        b.x += b.vx;
        b.y += b.vy;
    }

    enemyBullets = enemyBullets.filter(b =>
        b.x >= 0 && b.x <= canvas.width &&
        b.y >= 0 && b.y <= canvas.height
    );
}

function drawEnemyBullets() {
    ctx.fillStyle = "red";
    for (let b of enemyBullets) {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    }
}
