// Tevin's logs:

// Weapon System + Scope & Script Rewrite structure:
// https://chatgpt.com/share/69f77b42-2fa8-83e8-acff-92dbed52ec1e

// Debugging Laser 
// https://chatgpt.com/share/69f77b68-df44-83e8-800e-ce3a32c6e372

// Fixing Damage with Bosses and Crashes & Boss Damage Restructure
// https://claude.ai/share/fe9ca8e4-9d14-49e9-8ec9-214e4d23fd61

// =====================================================
// GLOBAL WEAPON STATE
// =====================================================

const weapons = { active: [] };
let explosions = [];

const droneImg = new Image();
droneImg.src = "assets/images/drone.png";

const bulletFX = [
    "assets/sounds/fx/gun/bullet-shot1.wav",
    "assets/sounds/fx/gun/bullet-shot2.wav",
    "assets/sounds/fx/gun/bullet-shot3.wav",
    "assets/sounds/fx/gun/bullet-shot4.wav",
    "assets/sounds/fx/gun/bullet-shot5.wav",
    "assets/sounds/fx/gun/bullet-shot6.wav",
    "assets/sounds/fx/gun/bullet-shot7.wav"

];

let lastBulletSoundTime = 0;
const bulletSoundDelay = 100; // milliseconds

const laserFX = [
    "assets/sounds/fx/laser/laser1.wav",
    "assets/sounds/fx/laser/laser2.wav",
    "assets/sounds/fx/laser/laser3.wav",
    "assets/sounds/fx/laser/laser4.wav"]

const missileFX = [
    "assets/sounds/fx/missile/missile1.wav",
    "assets/sounds/fx/missile/missile2.wav",
    "assets/sounds/fx/missile/missile3.wav"]

const mineFX = [
    "assets/sounds/fx/mine/mine1.wav",
    "assets/sounds/fx/mine/mine2.wav",
    "assets/sounds/fx/mine/mine3.wav",
    "assets/sounds/fx/mine/mine4.wav"]

const shieldFX = [
    "assets/sounds/fx/shield/shield1.wav",
    "assets/sounds/fx/shield/shield2.wav",
    "assets/sounds/fx/shield/shield3.wav",

];

const soundCooldowns = {};

function playSound(soundArray, key, volume = 1.0, delay = 100) {

    const now = Date.now();

    if (!soundCooldowns[key]) {
        soundCooldowns[key] = 0;
    }

    if (now - soundCooldowns[key] < delay) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * soundArray.length);

    const audio = new Audio(soundArray[randomIndex]);

    audio.volume = volume;

    audio.play().catch(error => {
        console.error("Audio play failed:", error);
    });

    soundCooldowns[key] = now;
}


// =====================================================
// WEAPON CREATION API
// =====================================================

function spawnWeapon(type, data) {
    weapons.active.push({ type, ...data });
}


// =====================================================
// FIRE FUNCTIONS
// =====================================================

// -----------------------------------------------------
// BASIC BULLET (supports Spread Shot)
// -----------------------------------------------------
function fireBullet(x = player.x, y = player.y, angle = player.angle) {

    if (upgrades.spreadShot) {
        const spread = 0.25;
        const angles = [angle - spread, angle, angle + spread];

        angles.forEach(a => {
            spawnWeapon("bullet", {
                x,
                y,
                vx: Math.cos(a) * 4,
                vy: Math.sin(a) * 4,
                damage: 1
            });
        });

    } else {
        const spread = 0.001;
        const angles = [angle - spread, angle, angle + spread];

        angles.forEach(a => {
            spawnWeapon("bullet", {
                x,
                y,
                vx: Math.cos(a) * 4,
                vy: Math.sin(a) * 4,
                damage: 1
            });
        });
    }
    const randomIndex = Math.floor(Math.random() * bulletFX.length);

    const audio = new Audio(bulletFX[randomIndex]);

}


// -----------------------------------------------------
// LASER
// -----------------------------------------------------
function fireLaser() {
    spawnWeapon("laser", {
        x: player.x,
        y: player.y,
        angle: player.angle,
        life: 20,
        damage: 10
    });
}


// -----------------------------------------------------
// MISSILE (Homing)
// -----------------------------------------------------
function fireMissile() {
    spawnWeapon("missile", {
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * 5,
        vy: Math.sin(player.angle) * 5,
        life: 180,
        damage: 50
    });
}


// -----------------------------------------------------
// MINE
// -----------------------------------------------------
function fireMine() {
    spawnWeapon("mine", {
        x: player.x,
        y: player.y,
        radius: 10,
        explodeRadius: 80,
        life: 600,
        damage: 15
    });
}


// =====================================================
// DRONE LOGIC
// =====================================================

function spawnDrone() {
    spawnWeapon("drone", {
        angle: 0,
        radius: 40,
        fireCooldown: 30,
        x: player.x,
        y: player.y - 40
    });
}

function updateDrone(d) {
    // Orbit
    d.angle += 0.05;
    d.x = player.x + Math.cos(d.angle) * d.radius;
    d.y = player.y + Math.sin(d.angle) * d.radius;

    // Fire
    d.fireCooldown--;
    if (d.fireCooldown <= 0) {
        fireDroneBullet(d.x, d.y);
        d.fireCooldown = 60; // 1 shot per second
    }
}

function fireDroneBullet(x, y) {
    spawnWeapon("bullet", {
        type: "bullet",
        x,
        y,
        vx: 0,
        vy: -4,
        damage: 1,
        friendly: true
    });
}


// =====================================================
// MAIN UPDATE LOOP
// =====================================================

function updateWeapons() {

    // Spawn drone ONLY if purchased
    if (upgrades.drone) {
        const hasDrone = weapons.active.some(w => w.type === "drone");
        if (!hasDrone) spawnDrone();
    }

    for (let i = weapons.active.length - 1; i >= 0; i--) {
        const w = weapons.active[i];

        // -----------------------------
        // DRONE
        // -----------------------------
        if (w.type === "drone") {
            updateDrone(w);
            continue;
        }

        // -----------------------------
        // BULLET
        // -----------------------------
        if (w.type === "bullet") {
            w.x += w.vx;
            w.y += w.vy;
            resolveProjectileHits(w, i);
            continue;
        }

        // -----------------------------
        // MISSILE (Homing)
        // -----------------------------
        if (w.type === "missile") {

            let nearestTarget = null;
            let nearestDist = Infinity;

            // Asteroids
            for (let a of asteroids) {
                const d = dist(a.x, a.y, w.x, w.y);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestTarget = { x: a.x, y: a.y };
                }
            }

            // Aliens
            for (let a of aliens) {
                const cx = a.x + a.width / 2;
                const cy = a.y + a.height / 2;
                const d = dist(cx, cy, w.x, w.y);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestTarget = { x: cx, y: cy };
                }
            }

            // Boss
            if (gameState === "bossState" && currentBoss) {
                const d = dist(currentBoss.x, currentBoss.y, w.x, w.y);
                if (d < nearestDist) {
                    nearestTarget = { x: currentBoss.x, y: currentBoss.y };
                }
            }

            // Steer toward target
            if (nearestTarget) {
                const angleToTarget = Math.atan2(nearestTarget.y - w.y, nearestTarget.x - w.x);
                const currentAngle = Math.atan2(w.vy, w.vx);

                let angleDiff = angleToTarget - currentAngle;
                if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                const turnSpeed = 0.08;
                const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed);

                const speed = Math.hypot(w.vx, w.vy);
                w.vx = Math.cos(newAngle) * speed;
                w.vy = Math.sin(newAngle) * speed;
            }

            w.x += w.vx;
            w.y += w.vy;
            w.life--;

            resolveProjectileHits(w, i);

            if (w.life <= 0) weapons.active.splice(i, 1);
            continue;
        }

        // -----------------------------
        // MINE
        // -----------------------------
        if (w.type === "mine") {
            w.life--;
            const triggered = checkMineTrigger(w);
            if (triggered || w.life <= 0) explodeMine(w, i);
            continue;
        }

        // -----------------------------
        // FORCEFIELD
        // -----------------------------
        if (w.type === "forcefield") {
            w.x = player.x;
            w.y = player.y;
            w.life--;

            // Push asteroids
            for (let a of asteroids) {
                const d = dist(a.x, a.y, w.x, w.y);
                if (d < w.radius + a.radius) {
                    const angle = Math.atan2(a.y - w.y, a.x - w.x);
                    a.vx += Math.cos(angle) * 5;
                    a.vy += Math.sin(angle) * 5;
                }
            }

            // Push aliens
            for (let a of aliens) {
                const cx = a.x + a.width / 2;
                const cy = a.y + a.height / 2;
                const d = dist(cx, cy, w.x, w.y);
                if (d < w.radius) {
                    const angle = Math.atan2(cy - w.y, cx - w.x);
                    a.vx += Math.cos(angle) * 5;
                    a.vy += Math.sin(angle) * 5;
                }
            }

            // Block enemy bullets
            for (let j = enemyBullets.length - 1; j >= 0; j--) {
                if (dist(enemyBullets[j].x, enemyBullets[j].y, w.x, w.y) < w.radius) {
                    enemyBullets.splice(j, 1);
                }
            }

            // Block boss bullets (legacy)
            if (typeof boss1Bullets !== "undefined") {
                for (let j = boss1Bullets.length - 1; j >= 0; j--) {
                    if (dist(boss1Bullets[j].x, boss1Bullets[j].y, w.x, w.y) < w.radius) {
                        boss1Bullets.splice(j, 1);
                    }
                }
            }

            if (w.life <= 0) weapons.active.splice(i, 1);
            continue;
        }

        // -----------------------------
        // LASER
        // -----------------------------
        if (w.type === "laser") {
            w.life--;
            resolveLaserHits(w);
            if (w.life <= 0) weapons.active.splice(i, 1);
            continue;
        }
    }
}


// =====================================================
// COLLISION ROUTER
// =====================================================

function resolveProjectileHits(w, index) {

    // Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        if (dist(a.x, a.y, w.x, w.y) < a.radius) {
            explosions.push({
                x: a.x,
                y: a.y,
                radius: 2,
                alpha: 1
            });
            splitAsteroid(a, i, 10);
            weapons.active.splice(index, 1);
            return true;
        }
    }

    // Aliens
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        if (dist(ax, ay, w.x, w.y) < 40) {
            explosions.push({
                x: ax,
                y: ay,
                radius: 2,
                alpha: 1
            });
            damageAlien(i, w.damage || 1);
            weapons.active.splice(index, 1);
            return true;
        }
    }

    // Swarm
    for (let i = swarmEnemies.length - 1; i >= 0; i--) {
        const s = swarmEnemies[i];
        if (dist(s.x + s.width / 2, s.y + s.height / 2, w.x, w.y) < 20) {
            damageSwarm(i, w.damage || 1);
            weapons.active.splice(index, 1);
            return;
        }
    }

    // Turret Drones
    for (let i = turretDrones.length - 1; i >= 0; i--) {
        const t = turretDrones[i];
        if (dist(t.x + t.width / 2, t.y + t.height / 2, w.x, w.y) < 22) {
            damageTurretDrone(i, w.damage || 1);
            weapons.active.splice(index, 1);
            return;
        }
    }

    return false;
}


// =====================================================
// MINE TRIGGER CHECK
// =====================================================

function checkMineTrigger(w) {

    for (let a of asteroids) {
        if (dist(a.x, a.y, w.x, w.y) < a.radius + w.radius) return true;
    }

    for (let a of aliens) {
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        if (dist(ax, ay, w.x, w.y) < 30) return true;
    }

    for (let a of swarmEnemies) {
        const sx = a.x + a.width / 2;
        const sy = a.y + a.height / 2;
        if (dist(sx, sy, w.x, w.y) < 30) return true;
    }

    for (let a of turretDrones) {
        const tx = a.x + a.width / 2;
        const ty = a.y + a.height / 2;
        if (dist(tx, ty, w.x, w.y) < 30) return true;
    }

    if (gameState === "bossState" && currentBoss) {
        const dx = currentBoss.x - w.x;
        const dy = currentBoss.y - w.y;
        if (Math.hypot(dx, dy) < w.explodeRadius) return true;
    }

    return false;
}


// =====================================================
// MINE EXPLOSION
// =====================================================

function explodeMine(w, index) {

    weapons.active.splice(index, 1);

    explosions.push({
        x: w.x,
        y: w.y,
        radius: 10,
        alpha: 1
    });

    playSound(mineFX, "mine", 0.6, 500);

    const R = w.explodeRadius;

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        if (dist(a.x, a.y, w.x, w.y) < R) {
            splitAsteroid(a, i, 40);
        }
    }

    // Aliens — use damageAlien so health and kill counter are tracked
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const ax = a.x + 20;
        const ay = a.y + 20;
        if (dist(ax, ay, w.x, w.y) < R) {
            damageAlien(i, w.damage || 4);
        }
    }

    // Swarm
    for (let i = swarmEnemies.length - 1; i >= 0; i--) {
        const s = swarmEnemies[i];
        if (dist(s.x + s.width / 2, s.y + s.height / 2, w.x, w.y) < R) {
            damageSwarm(i, w.damage || 4);
        }
    }

    // Turret Drones
    for (let i = turretDrones.length - 1; i >= 0; i--) {
        const t = turretDrones[i];
        if (dist(t.x + t.width / 2, t.y + t.height / 2, w.x, w.y) < R) {
            damageTurretDrone(i, w.damage || 4);
        }
    }

    if (gameState === "bossState" && currentBoss && typeof currentBoss.bossHealth !== "undefined") {
        currentBoss.bossHealth -= w.damage || 4;

        if (currentBoss.bossHealth <= 0) {
            gameState = "victoryState";
        }
    }
}


// =====================================================
// LASER DAMAGE
// =====================================================

function resolveLaserHits(l) {

    const cos = Math.cos(l.angle);
    const sin = Math.sin(l.angle);

    // Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        const dx = a.x - l.x;
        const dy = a.y - l.y;
        const dot = dx * cos + dy * sin;
        const perp = Math.abs(dx * sin - dy * cos);

        if (dot > 0 && perp < a.radius) {
            splitAsteroid(a, i, 10);
        }
    }

    // Aliens — use damageAlien so health and kill counter are tracked
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const cx = a.x + a.width / 2;
        const cy = a.y + a.height / 2;

        const dx = cx - l.x;
        const dy = cy - l.y;
        const dot = dx * cos + dy * sin;
        const perp = Math.abs(dx * sin - dy * cos);

        if (dot > 0 && perp < Math.max(a.width, a.height) / 2) {
            damageAlien(i, l.damage || 10);
        }
    }

    // Swarm
    for (let i = swarmEnemies.length - 1; i >= 0; i--) {
        const s = swarmEnemies[i];
        const dx = s.x + s.width / 2 - l.x;
        const dy = s.y + s.height / 2 - l.y;
        const dot = dx * cos + dy * sin;
        const perp = Math.abs(dx * sin - dy * cos);
        if (dot > 0 && perp < s.width / 2) {
            damageSwarm(i, l.damage || 10);
        }
    }

    // Turret Drones
    for (let i = turretDrones.length - 1; i >= 0; i--) {
        const t = turretDrones[i];
        const dx = t.x + t.width / 2 - l.x;
        const dy = t.y + t.height / 2 - l.y;
        const dot = dx * cos + dy * sin;
        const perp = Math.abs(dx * sin - dy * cos);
        if (dot > 0 && perp < t.width / 2) {
            damageTurretDrone(i, l.damage || 10);
        }
    }

    // Boss handled in boss scripts
}


// =====================================================
// EXPLOSIONS
// =====================================================

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.radius += 2;
        e.alpha -= 0.05;

        if (e.alpha <= 0) explosions.splice(i, 1);
    }
}

function drawExplosions() {
    ctx.save();

    for (let e of explosions) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,200,50,${e.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.restore();
}


// =====================================================
// DRAW WEAPONS
// =====================================================

function drawWeapons() {

    for (let w of weapons.active) {

        // DRONE
        if (w.type === "drone") {
            ctx.save();
            ctx.translate(w.x, w.y);
            ctx.drawImage(droneImg, -12, -12, 24, 24);
            ctx.restore();
        }

        // BULLET
        if (w.type === "bullet") {
            ctx.fillStyle = "white";
            ctx.fillRect(w.x - 2, w.y - 6, 4, 8);
        }

        // MISSILE
        if (w.type === "missile") {
            ctx.save();
            ctx.fillStyle = "orange";
            ctx.shadowColor = "rgba(255,150,50,0.8)";
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(w.x, w.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // MINE
        if (w.type === "mine") {
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.shadowColor = "rgba(255,255,100,0.8)";
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // FORCEFIELD
        if (w.type === "forcefield") {

            const alpha = (w.life / 180) * 0.8;
            const pulse = Math.sin(Date.now() / 80) * 4;

            ctx.save();

            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 180, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = "rgba(0, 255, 180, 0.8)";
            ctx.shadowBlur = 20;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius + pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 180, ${alpha * 0.1})`;
            ctx.fill();

            ctx.restore();
        }

        // LASER
        if (w.type === "laser") {

            const alpha = w.life / 20;
            const dx = Math.cos(w.angle);
            const dy = Math.sin(w.angle);
            const length = 1200;

            const gradient = ctx.createLinearGradient(
                w.x, w.y,
                w.x + dx * length,
                w.y + dy * length
            );

            gradient.addColorStop(0, `rgba(0,255,255,${alpha})`);
            gradient.addColorStop(0.5, `rgba(0,180,255,${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(0,120,255,0)`);

            const flicker = 2 + Math.sin(Date.now() * 0.02) * 1.5;

            ctx.save();

            ctx.lineWidth = 12 + flicker;
            ctx.strokeStyle = `rgba(0,200,255,${alpha * 0.15})`;
            ctx.shadowColor = "rgba(0,200,255,0.8)";
            ctx.shadowBlur = 25;

            ctx.beginPath();
            ctx.moveTo(w.x, w.y);
            ctx.lineTo(w.x + dx * length, w.y + dy * length);
            ctx.stroke();

            ctx.lineWidth = 6 + flicker;
            ctx.strokeStyle = gradient;
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(w.x, w.y);
            ctx.lineTo(w.x + dx * length, w.y + dy * length);
            ctx.stroke();

            ctx.restore();
        }
    }
}