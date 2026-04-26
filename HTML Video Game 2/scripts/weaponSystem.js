// =====================================================
// GLOBAL STATE
// =====================================================

const weapons = { active: [] };
let explosions = [];

// =====================================================
// PLAYER
// =====================================================

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 40,
    height: 10,

    speed: 10,
    lastShotTime: 0,

    playerHealth: 50,
    invincible: false,
    invincibleStop: 0,

    active: true,
    angle: 0,
    vx: 0,
    vy: 0,
    rotationSpeed: 0.07,
    thrustPower: 0.15,
    friction: 0.95,

    takeDamage(amount) {
        if (this.invincible) return;
        this.playerHealth -= amount;
        this.invincible = true;
        this.invincibleStop = Date.now() + 3000;
        if (this.playerHealth <= 0) {
            this.playerHealth = 0;
            setGameState("gameOverState");
        }
    }
};

// =====================================================
// WEAPON CREATION API
// =====================================================

function spawnWeapon(type, data) {
    weapons.active.push({ type, ...data });
}

// =====================================================
// FIRE FUNCTIONS
// =====================================================

function fireBullet() {
    spawnWeapon("bullet", {
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * 4,
        vy: Math.sin(player.angle) * 4
    });
}

function fireMissile() {
    spawnWeapon("missile", {
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * 5,
        vy: Math.sin(player.angle) * 5,
        life: 180
    });
}

function fireMine() {
    spawnWeapon("mine", {
        x: player.x,
        y: player.y,
        radius: 10,
        explodeRadius: 80,
        life: 600
    });
}

function fireLaser() {
    spawnWeapon("laser", {
        x: player.x,
        y: player.y,
        angle: player.angle,
        life: 20
    });
}

// =====================================================
// MAIN UPDATE LOOP FOR WEAPONS
// =====================================================

function updateWeapons() {
    for (let i = weapons.active.length - 1; i >= 0; i--) {
        const w = weapons.active[i];

        // BULLET
        if (w.type === "bullet") {
            w.x += w.vx;
            w.y += w.vy;
            resolveProjectileHits(w, i);
        }

        // MISSILE
        if (w.type === "missile") {

            // Find nearest target
            let nearestTarget = null;
            let nearestDist = Infinity;

            for (let a of asteroids) {
                const d = dist(a.x, a.y, w.x, w.y);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestTarget = { x: a.x, y: a.y };
                }
            }

            for (let a of aliens) {
                const d = dist(a.x + a.width / 2, a.y + a.height / 2, w.x, w.y);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestTarget = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
                }
            }

            if (gameState === "bossState" && boss) {
                const d = dist(boss.x, boss.y, w.x, w.y);
                if (d < nearestDist) {
                    nearestTarget = { x: boss.x, y: boss.y };
                }
            }

            // Steer toward target
            if (nearestTarget) {
                const angleToTarget = Math.atan2(nearestTarget.y - w.y, nearestTarget.x - w.x);
                const currentAngle = Math.atan2(w.vy, w.vx);

                // Find shortest turn direction
                let angleDiff = angleToTarget - currentAngle;
                if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                const turnSpeed = 0.08; // higher = tighter turning
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
        }

        // MINE
        if (w.type === "mine") {
            w.life--;
            let triggered = checkMineTrigger(w);
            if (triggered || w.life <= 0) explodeMine(w, i);
        }

        // FORCE FIELD
        if (w.type === "forcefield") {
            w.x = player.x;
            w.y = player.y;
            w.life--;

            for (let a of asteroids) {
                const d = dist(a.x, a.y, w.x, w.y);
                if (d < w.radius + a.radius) {
                    const angle = Math.atan2(a.y - w.y, a.x - w.x);
                    a.vx += Math.cos(angle) * 2;
                    a.vy += Math.sin(angle) * 2;
                }
            }

            for (let a of aliens) {
                const ax = a.x + a.width / 2;
                const ay = a.y + a.height / 2;
                const d = dist(ax, ay, w.x, w.y);
                if (d < w.radius) {
                    const angle = Math.atan2(ay - w.y, ax - w.x);
                    a.vx += Math.cos(angle) * 2;
                    a.vy += Math.sin(angle) * 2;
                }
            }

            if (typeof bossBullets !== "undefined") {
                for (let i = bossBullets.length - 1; i >= 0; i--) {
                    if (dist(bossBullets[i].x, bossBullets[i].y, w.x, w.y) < w.radius) {
                        bossBullets.splice(i, 1);
                    }
                }
            }

            if (w.life <= 0) weapons.active.splice(i, 1);
        }

        // LIGHTNING
        if (w.type === "lightning") {
            w.life--;

            // Damage enemies in range every few frames
            if (w.life % 6 === 0) {
                for (let i = asteroids.length - 1; i >= 0; i--) {
                    const a = asteroids[i];
                    if (dist(a.x, a.y, w.x, w.y) < w.radius) {
                        splitAsteroid(a, i, 15);
                    }
                }

                for (let i = aliens.length - 1; i >= 0; i--) {
                    const a = aliens[i];
                    if (dist(a.x + a.width / 2, a.y + a.height / 2, w.x, w.y) < w.radius) {
                        aliens.splice(i, 1);
                    }
                }

                if (gameState === "bossState" && boss) {
                    const now = Date.now();
                    if (now - boss.laserHitCooldown >= boss.laserHitDelay) {
                        for (let p of boss.collisionPoints) {
                            if (!p.vulnerable) continue;
                            const px = boss.x + p.offsetX;
                            const py = boss.y + p.offsetY;
                            if (dist(px, py, w.x, w.y) < w.radius) {
                                boss.bossHealth -= 5;
                                boss.laserHitCooldown = now;
                            }
                        }
                    }
                }
            }

            // Regenerate bolts each frame for flickering effect
            w.bolts = [];
            const boltCount = 8;
            for (let i = 0; i < boltCount; i++) {
                const angle = (i / boltCount) * Math.PI * 2 + Math.random() * 0.4;
                const length = w.radius * (0.6 + Math.random() * 0.4);
                const segments = 5;
                const points = [{ x: w.x, y: w.y }];

                for (let s = 1; s <= segments; s++) {
                    const t = s / segments;
                    const jitter = (Math.random() - 0.5) * 20;
                    points.push({
                        x: w.x + Math.cos(angle) * length * t + jitter,
                        y: w.y + Math.sin(angle) * length * t + jitter
                    });
                }
                w.bolts.push(points);
            }

            if (w.life <= 0) weapons.active.splice(i, 1);
        }

        // LASER
        if (w.type === "laser") {
            w.life--;
            resolveLaserHits(w);
            if (w.life <= 0) weapons.active.splice(i, 1);
        }


    }
}

// =====================================================
// COLLISION ROUTER
// =====================================================

function resolveProjectileHits(w, index) {

    // ASTEROIDS
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        if (dist(a.x, a.y, w.x, w.y) < a.radius) {
            console.log("asteroid hit, health:", a.health);
            splitAsteroid(a, i, 10);
            weapons.active.splice(index, 1);
            return;
        }
    }

    // ALIENS
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        if (dist(ax, ay, w.x, w.y) < 20) {
            aliens.splice(i, 1);
            weapons.active.splice(index, 1);
            return;
        }
    }

    // BOSS
    if (gameState === "bossState" && boss) {
        for (let p of boss.collisionPoints) {
            const px = boss.x + p.offsetX;
            const py = boss.y + p.offsetY;
            if (dist(px, py, w.x, w.y) < 20) {
                boss.bossHealth -= p.vulnerable ? 25 : 8;
                weapons.active.splice(index, 1);
                return;
            }
        }
    }
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

    if (gameState === "bossState" && boss) {
        for (let p of boss.collisionPoints) {
            const px = boss.x + p.offsetX;
            const py = boss.y + p.offsetY;
            if (dist(px, py, w.x, w.y) < w.explodeRadius) return true;
        }
    }

    return false;
}

// =====================================================
// MINE EXPLOSION
// =====================================================

function explodeMine(w, index) {
    weapons.active.splice(index, 1);

    explosions.push({ x: w.x, y: w.y, radius: 10, alpha: 1 });

    const R = w.explodeRadius;

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        if (dist(a.x, a.y, w.x, w.y) < R) splitAsteroid(a, i, 40);
    }

    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        if (dist(a.x + 20, a.y + 20, w.x, w.y) < R) aliens.splice(i, 1);
    }

    if (gameState === "bossState" && boss) {
        for (let p of boss.collisionPoints) {
            const px = boss.x + p.offsetX;
            const py = boss.y + p.offsetY;
            if (dist(px, py, w.x, w.y) < R) {
                boss.bossHealth -= p.vulnerable ? 25 : 8;
            }
        }
    }
}

// =====================================================
// LASER SYSTEM
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
        if (dot > 0 && perp < a.radius) splitAsteroid(a, i, 10);
    }

    // Aliens
    for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        const dx = (a.x + a.width / 2) - l.x;
        const dy = (a.y + a.height / 2) - l.y;
        const dot = dx * cos + dy * sin;
        const perp = Math.abs(dx * sin - dy * cos);
        if (dot > 0 && perp < Math.max(a.width, a.height) / 2) aliens.splice(i, 1);
    }

    // Boss
    if (gameState === "bossState" && boss) {
        const now = Date.now();
        if (now - boss.laserHitCooldown >= boss.laserHitDelay) {
            for (let p of boss.collisionPoints) {
                if (!p.vulnerable) continue;
                const px = boss.x + p.offsetX;
                const py = boss.y + p.offsetY;
                const dx = px - l.x;
                const dy = py - l.y;
                const dot = dx * cos + dy * sin;
                const perp = Math.abs(dx * sin - dy * cos);
                if (dot > 0 && perp < 24) {
                    boss.bossHealth -= 5;
                    boss.laserHitCooldown = now;
                }
            }
        }
    }
}

// =====================================================
// EXPLOSIONS
// =====================================================

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.radius += 6;
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
    console.log("active weapons:", weapons.active.map(w => w.type));
    // Charge bar — outside the loop
    if (spaceHeldSince !== null) {
        const progress = Math.min((Date.now() - spaceHeldSince) / CHARGE_TIME, 3);
        let color;
        if (progress < 0.33) {
            color = "rgba(0, 200, 255, ";
        } else if (progress >= 0.33 && progress < 0.55) {
            color = "rgba(255, 165, 0, ";
        } else if (progress >= 0.55 && progress < .85) {
            color = "rgba(255, 255, 0, ";
        } else if (progress >= 0.85 && progress < 1.05) {
            color = "rgba(0, 128, 128, ";
        } else if (progress >= 1.05 && progress < 1.4) {
            color = "rgba(  0, 0, 255, ";

        } else {
            color = "rgba(128, 0, 128, ";
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(player.x - 20, player.y - 22, 40, 4);
        ctx.fillStyle = color + "0.9)";
        ctx.fillRect(player.x - 20, player.y - 22, 40 * progress, 4);
    }

    for (let w of weapons.active) {

        // BULLET
        if (w.type === "bullet") {
            ctx.fillStyle = "white";
            ctx.fillRect(w.x - 2, w.y - 6, 4, 8);
        }

        // MISSILE
        if (w.type === "missile") {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(w.x, w.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // MINE
        if (w.type === "mine") {
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // FORCE FIELD
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
        // LIGHTNING
        if (w.type === "lightning") {
            const alpha = w.life / 30;

            ctx.save();

            // Draw range circle
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 100, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw bolts
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(180, 100, 255, 1)";
            ctx.shadowBlur = 10;

            for (let bolt of w.bolts) {
                ctx.beginPath();
                ctx.moveTo(bolt[0].x, bolt[0].y);
                for (let j = 1; j < bolt.length; j++) {
                    ctx.lineTo(bolt[j].x, bolt[j].y);
                }
                ctx.strokeStyle = `rgba(200, 150, 255, ${alpha})`;
                ctx.stroke();
            }

            ctx.restore();
        }
        // LASER
        if (w.type === "laser") {
            const alpha = w.life / 20;
            ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(w.x, w.y);
            ctx.lineTo(
                w.x + Math.cos(w.angle) * 1000,
                w.y + Math.sin(w.angle) * 1000
            );
            ctx.stroke();
        }
    }
}

// =====================================================
// UTILITY
// =====================================================

function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}