// We all worked on the code for this in different iterations (Place your chat logs here)

// Tevin's Work:

// Asteroid Split structure/debug
// https://chatgpt.com/share/69f77ab8-4478-83e8-8be5-75383faa2101

// =====================================================
// ASTEROIDS + ALIENS + HEALTH PICKUPS
// =====================================================

// ASTEROID SPRITES
const asteroidLargeImg = new Image();
asteroidLargeImg.src = "assets/images/asteroid_large.png";

const asteroidMediumImg = new Image();
asteroidMediumImg.src = "assets/images/asteroid_medium.png";

const asteroidSmallImg = new Image();
asteroidSmallImg.src = "assets/images/asteroid_small.png";

// ALIEN SPRITE
const alienImg1 = new Image();
alienImg1.src = "assets/images/alien.png";

// SWARM ENEMY SPRITE
const swarmImg = new Image();
swarmImg.src = "assets/images/mind-parasite.gif";

// TURRET DRONE SPRITE
const turretDroneImg = new Image();
turretDroneImg.src = "assets/images/sentinel.png";

let asteroids = [];
let aliens = [];
let healthPickups = [];
let swarmEnemies = [];
let turretDrones = [];

// =====================================================
// ASTEROIDS
// =====================================================

function safeSpawnX() {
    let x;
    do {
        x = Math.random() * canvas.width;
    } while (Math.abs(x - player.x) < 120);
    return x;
}

function spawnAsteroid(size, x = null, y = null) {
    const radius = size === "large" ? 40 : size === "medium" ? 25 : 15;

    asteroids.push({
        x: x ?? safeSpawnX(),
        y: y ?? -80 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.6 + 0.3,
        radius,
        size,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        health: size === "large" ? 30 : size === "medium" ? 15 : 5
    });
}

function updateAsteroids() {
    for (let a of asteroids) {
        a.x += a.vx;
        a.y += a.vy;
        a.angle += a.rotationSpeed;

        if (a.x < -80) a.x = canvas.width + 80;
        if (a.x > canvas.width + 80) a.x = -80;

        if (a.y > canvas.height + 80) {
            a.y = -80;
            a.x = safeSpawnX();
        }
    }
}

function drawAsteroids() {
    for (let a of asteroids) {
        let img =
            a.size === "large" ? asteroidLargeImg :
                a.size === "medium" ? asteroidMediumImg :
                    asteroidSmallImg;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.drawImage(img, -a.radius, -a.radius, a.radius * 2, a.radius * 2);
        ctx.restore();
    }
}

function splitAsteroid(a, index, damage) {
    a.health -= damage;
    if (a.health > 0) return;

    const size = a.size;
    asteroids.splice(index, 1);

    // Score
    score += size === "large" ? 5 : size === "medium" ? 3 : 2;
    document.getElementById("scoreDisplay").innerText = "Score: " + score;

    if (size === "large") {
        spawnAsteroid("medium", a.x, a.y);
        spawnAsteroid("medium", a.x, a.y);
    } else if (size === "medium") {
        spawnAsteroid("small", a.x, a.y);
        spawnAsteroid("small", a.x, a.y);
    } else if (size === "small") {

        // chance to drop health
        if (Math.random() < 0.5) {
            healthPickups.push({
                x: a.x,
                y: a.y - 20,
                vy: 1.2,
                size: 14
            });
        }
    }
}

// =====================================================
// HEALTH PICKUPS
// =====================================================

function updateHealthPickups() {
    for (let p of healthPickups) {
        p.y += p.vy;
    }

    healthPickups = healthPickups.filter(p => p.y < canvas.height + 40);
}

function drawHealthPickups() {
    ctx.fillStyle = "#00ff88";
    for (let p of healthPickups) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =====================================================
// ALIENS
// =====================================================

const ALIEN_MAX_HEALTH = 15;

function spawnAlien() {
    aliens.push({
        x: Math.random() * (canvas.width - 40),
        y: -60 - Math.random() * 40,
        width: 40,
        height: 40,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 0.8 + 0.6,
        shootCooldown: 200 + Math.random() * 120,
        health: ALIEN_MAX_HEALTH
    });
}

function updateAliens() {
    for (let a of aliens) {
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < -a.width) a.x = canvas.width;
        if (a.x > canvas.width) a.x = -a.width;

        if (a.y < 0) {
            a.y = 0;
            a.vy *= -1;
        }
        if (a.y > canvas.height - a.height) {
            a.y = canvas.height - a.height;
            a.vy *= -1;
        }

        // Aimed shooting
        a.shootCooldown--;
        if (a.shootCooldown <= 0) {
            const dx = player.x - (a.x + a.width / 2);
            const dy = player.y - (a.y + a.height / 2);
            const len = Math.hypot(dx, dy);

            enemyBullets.push({
                x: a.x + a.width / 2,
                y: a.y + a.height,
                vx: (dx / len) * 3,
                vy: (dy / len) * 3
            });

            a.shootCooldown = 500 + Math.random() * 250;
        }
    }
}

function drawAliens() {
    for (let a of aliens) {
        ctx.save();
        ctx.translate(a.x + a.width / 2, a.y + a.height / 2);

        const flip = Math.floor(Date.now() / 200) % 2 === 0;
        if (flip) ctx.scale(-1, 1);

        ctx.drawImage(
            alienImg1,
            -a.width / 2,
            -a.height / 2,
            a.width,
            a.height
        );

        ctx.restore();

        // Health bar (only show when damaged)
        if (a.health < ALIEN_MAX_HEALTH) {
            const barW = a.width;
            const barH = 4;
            const barX = a.x;
            const barY = a.y - 8;
            const pct = a.health / ALIEN_MAX_HEALTH;

            ctx.fillStyle = "#333";
            ctx.fillRect(barX, barY, barW, barH);

            ctx.fillStyle = pct > 0.5 ? "#00ff88" : "#ff4444";
            ctx.fillRect(barX, barY, barW * pct, barH);
        }
    }
}

// =====================================================
// ALIEN DAMAGE HANDLER
// =====================================================

function damageAlien(index, damage) {
    const a = aliens[index];
    if (!a) return;

    a.health -= damage;

    if (a.health <= 0) {
        killAlien(index);
    }
}

// =====================================================
// ALIEN DEATH HANDLER
// =====================================================

function killAlien(index) {
    aliens.splice(index, 1);

    score += 35;
    document.getElementById("scoreDisplay").innerText = "Score: " + score;

    aliensKilled++;
    document.getElementById("killDisplay").innerText =
        `Aliens: ${aliensKilled} / ${requiredKills}`;
}

// =====================================================
// SWARM ENEMIES
// Spawns in threes. Slow normally, rushes player
// when within aggroRadius. No shooting — contact damage.
// =====================================================

const SWARM_AGRO_RADIUS = 160;
const SWARM_SLOW_SPEED = 0.8;
const SWARM_FAST_SPEED = 4.2;
const SWARM_MAX_HEALTH = 10;

function spawnSwarmGroup() {
    for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 80;
        swarmEnemies.push({
            x: Math.random() * (canvas.width - 30) + offsetX,
            y: -40 - Math.random() * 40,
            width: 28,
            height: 28,
            vx: (Math.random() - 0.5) * 0.6,
            vy: SWARM_SLOW_SPEED,
            aggroed: false,
            damageCooldown: 0,
            health: SWARM_MAX_HEALTH
        });
    }
}

function updateSwarmEnemies() {
    for (let s of swarmEnemies) {
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        const dx = player.x - cx;
        const dy = player.y - cy;
        const dToPlayer = Math.hypot(dx, dy);

        // Aggro check
        s.aggroed = dToPlayer < SWARM_AGRO_RADIUS;

        if (s.aggroed) {
            // Rush straight toward the player
            s.vx = (dx / dToPlayer) * SWARM_FAST_SPEED;
            s.vy = (dy / dToPlayer) * SWARM_FAST_SPEED;
        } else {
            // Drift slowly downward with mild horizontal wander
            s.vx += (Math.random() - 0.5) * 0.1;
            s.vx = Math.max(-1, Math.min(1, s.vx));
            s.vy = SWARM_SLOW_SPEED;
        }

        s.x += s.vx;
        s.y += s.vy;

        // Wrap horizontally
        if (s.x < -s.width) s.x = canvas.width;
        if (s.x > canvas.width) s.x = -s.width;

        // Reset if it scrolls off the bottom
        if (s.y > canvas.height + 40) {
            s.y = -40;
            s.x = Math.random() * canvas.width;
        }

        // Damage cooldown tick
        if (s.damageCooldown > 0) s.damageCooldown--;
    }
}

function drawSwarmEnemies() {
    for (let s of swarmEnemies) {
        ctx.save();
        ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
        if (s.aggroed) ctx.scale(-1, 1);
        ctx.drawImage(swarmImg, -s.width / 2, -s.height / 2, s.width, s.height);
        ctx.restore();

        // Health bar (only show when damaged)
        if (s.health < SWARM_MAX_HEALTH) {
            const pct = s.health / SWARM_MAX_HEALTH;
            ctx.fillStyle = "#333";
            ctx.fillRect(s.x, s.y - 6, s.width, 3);
            ctx.fillStyle = pct > 0.5 ? "#00ff88" : "#ff4444";
            ctx.fillRect(s.x, s.y - 6, s.width * pct, 3);
        }
    }
}

function damageSwarm(index, damage) {
    const s = swarmEnemies[index];
    if (!s) return;
    s.health -= damage;
    if (s.health <= 0) killSwarm(index);
}

function killSwarm(index) {
    swarmEnemies.splice(index, 1);

    score += 15;
    document.getElementById("scoreDisplay").innerText = "Score: " + score;

    aliensKilled++;
    document.getElementById("killDisplay").innerText =
        `Aliens: ${aliensKilled} / ${requiredKills}`;

    // 25% chance to drop health
    if (Math.random() < 0.25) {
        healthPickups.push({
            x: swarmEnemies[index] ? swarmEnemies[index].x : 0,
            y: swarmEnemies[index] ? swarmEnemies[index].y : 0,
            vy: 1.2,
            size: 14
        });
    }
}

// =====================================================
// TURRET DRONES
// Moves slowly, shoots 4 diagonal bullets at a
// moderate interval. Does not chase the player.
// =====================================================

const TURRET_SHOOT_INTERVAL = 110;
const TURRET_BULLET_SPEED = 2.8;
const TURRET_MAX_HEALTH = 75;

function spawnTurretDrone() {
    turretDrones.push({
        x: Math.random() * (canvas.width - 36),
        y: -50 - Math.random() * 40,
        width: 36,
        height: 36,
        vx: (Math.random() - 0.5) * 0.7,
        vy: Math.random() * 0.4 + 0.3,
        shootCooldown: TURRET_SHOOT_INTERVAL + Math.floor(Math.random() * 60),
        angle: 0,
        health: TURRET_MAX_HEALTH
    });
}

function updateTurretDrones() {
    for (let t of turretDrones) {
        t.x += t.vx;
        t.y += t.vy;

        // Slow rotation for visual effect
        t.angle += 0.01;

        // Wrap horizontally
        if (t.x < -t.width) t.x = canvas.width;
        if (t.x > canvas.width) t.x = -t.width;

        // Reset if off bottom
        if (t.y > canvas.height + 40) {
            t.y = -50;
            t.x = Math.random() * canvas.width;
        }

        // Shoot in 4 diagonal directions
        t.shootCooldown--;
        if (t.shootCooldown <= 0) {
            const cx = t.x + t.width / 2;
            const cy = t.y + t.height / 2;
            const spd = TURRET_BULLET_SPEED;
            const diagonals = [
                { vx: spd, vy: spd },
                { vx: -spd, vy: spd },
                { vx: spd, vy: -spd },
                { vx: -spd, vy: -spd }
            ];

            for (let dir of diagonals) {
                enemyBullets.push({ x: cx, y: cy, vx: dir.vx, vy: dir.vy });
            }

            t.shootCooldown = TURRET_SHOOT_INTERVAL;
        }
    }
}

function drawTurretDrones() {
    for (let t of turretDrones) {
        ctx.save();
        ctx.translate(t.x + t.width / 2, t.y + t.height / 2);
        ctx.rotate(t.angle);
        ctx.drawImage(turretDroneImg, -t.width / 2, -t.height / 2, t.width, t.height);
        ctx.restore();

        // Health bar (only show when damaged)
        if (t.health < TURRET_MAX_HEALTH) {
            const pct = t.health / TURRET_MAX_HEALTH;
            ctx.fillStyle = "#333";
            ctx.fillRect(t.x, t.y - 6, t.width, 3);
            ctx.fillStyle = pct > 0.5 ? "#00ff88" : "#ff4444";
            ctx.fillRect(t.x, t.y - 6, t.width * pct, 3);
        }
    }
}

function damageTurretDrone(index, damage) {
    const t = turretDrones[index];
    if (!t) return;
    t.health -= damage;
    if (t.health <= 0) killTurretDrone(index);
}

function killTurretDrone(index) {
    turretDrones.splice(index, 1);

    score += 20;
    document.getElementById("scoreDisplay").innerText = "Score: " + score;

    aliensKilled++;
    document.getElementById("killDisplay").innerText =
        `Aliens: ${aliensKilled} / ${requiredKills}`;
}