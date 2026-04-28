const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 40,
    height: 10,

    speed: 4,
    lastShotTime: 0,

    playerHealth: 5,
    invincible: false,
    invincibleStop: 0,

    active: true,
angle: 0,
vx: 0,
vy: 0,
rotationSpeed: 0.07,
thrustPower: 0.15,
friction: 0.99,

    takeDamage(amount) {
        if (this.invincible) return;

        this.playerHealth -= amount;

        this.invincible = true;
        this.invincibleStop = Date.now() + 3000;

        if (this.playerHealth <= 0) {
            this.playerHealth = 0;
            console.log("You died. GAME OVER");
        }
    },
};

let bullets = [];

document.addEventListener("keydown", e => {
    if (Date.now() - player.lastShotTime > 300 && e.code === "Space") {

        if (gameState === "enemyState") {
            // ASTEROIDS MODE — shoot in facing direction
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(player.angle) * 8,
                vy: Math.sin(player.angle) * 8
            });

        } else {
            // BOSS MODE — shoot straight up
            bullets.push({
                x: player.x,
                y: player.y - player.height / 2,
                vx: 0,
                vy: -6
            });
        }

        player.lastShotTime = Date.now();
    }
});


function updatePlayer() {
    if (!player.active) return;

    if (gameState === "enemyState") {
        // ASTEROIDS MODE

        // Rotate ship
        if (keys["ArrowLeft"])  player.angle -= player.rotationSpeed;
        if (keys["ArrowRight"]) player.angle += player.rotationSpeed;

        // Thrust forward
        if (keys["ArrowUp"]) {
            player.vx += Math.cos(player.angle) * player.thrustPower;
            player.vy += Math.sin(player.angle) * player.thrustPower;
        }

        // Apply friction
        player.vx *= player.friction;
        player.vy *= player.friction;

        // Move player
        player.x += player.vx;
        player.y += player.vy;

        // Screen wrap
        if (player.x < 0) player.x += canvas.width;
        if (player.x > canvas.width) player.x -= canvas.width;
        if (player.y < 0) player.y += canvas.height;
        if (player.y > canvas.height) player.y -= canvas.height;

    } else if (gameState === "bossState") {
        // SPACE INVADERS MODE

        if (keys["ArrowLeft"])  player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        // Clamp to screen
        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));

        // Reset drifting
        player.vx = 0;
        player.vy = 0;
        player.angle = -Math.PI / 2;
    }

    // Invincibility timer
    if (player.invincible && Date.now() > player.invincibleStop) {
        player.invincible = false;
    }
}


function updateBullets() {
    bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
    });

    // Remove bullets off screen
    bullets = bullets.filter(b =>
        b.x >= 0 && b.x <= canvas.width &&
        b.y >= 0 && b.y <= canvas.height
    );
}


function drawPlayer() {
    if (!player.active) return;

    if (player.invincible) {
        const blink = Math.floor(Date.now() / 100) % 2;
        if (blink === 0) return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (gameState === "enemyState") {
        ctx.rotate(player.angle);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

    ctx.restore();
<<<<<<< Updated upstream
=======

    // Force field visual
    const ff = weapons.active.find(w => w.type === "forcefield");
    if (ff) {
        const alpha = (ff.life / 180) * 0.8;
        const pulse = Math.sin(Date.now() / 80) * 4;

        ctx.save();

        ctx.beginPath();
        ctx.arc(player.x, player.y, ff.radius + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 180, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(0, 255, 180, 0.8)";
        ctx.shadowBlur = 20;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(player.x, player.y, ff.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 180, ${alpha * 0.1})`;
        ctx.fill();

        ctx.restore();
    }
}

// =======================
// WEAPON FIRE LOGIC
// =======================
function handleWeaponFire() {
    const held = Date.now() - (spaceHeldSince || 0);
    spaceHeldSince = null;

    const angle = player.angle;

    // ---------------- TAP → BULLETS
    if (held < 500) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                spawnWeapon("bullet", {
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4
                });
            }, i * 300);
        }
    }

    // ---------------- MISSILE
    else if (held < 900) {
        spawnWeapon("missile", {
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            life: 180
        });
    }

    // ---------------- MINE
    else if (held < 1400) {
        spawnWeapon("mine", {
            x: player.x,
            y: player.y,
            radius: 10,
            explodeRadius: 80,
            life: 600
        });
    }

    else if (held < 1650) {
        console.log("spawning forcefield");
        spawnWeapon("forcefield", {
            x: player.x,
            y: player.y,
            radius: 80,
            life: 180
        });
    }

    // ---------------- LASER
    else if (held < 2000 && held < 2500) {
        spawnWeapon("laser", {
            x: player.x,
            y: player.y,
            angle,
            life: 30
        });
    }
    // ---------------- LIGHTNING
    else {
        spawnWeapon("lightning", {
            x: player.x,
            y: player.y,
            radius: 150,  // AOE range
            life: 30,
            bolts: []
        });
    }


    window.addEventListener("blur", () => {
        spaceHeldSince = null;
        for (let key in keys) keys[key] = false;
    });

    if (spaceHeldSince !== null) {
        const progress = Math.min((Date.now() - spaceHeldSince) / CHARGE_TIME, 1);

        // Interpolate color based on progress
        let color;
        if (progress < 0.4) {
            color = "rgba(0, 200, 255, "; // blue — bullet range
        } else if (progress < 0.7) {
            color = "rgba(255, 165, 0, ";  // orange — missile range
        } else if (progress < 0.9) {
            color = "rgba(255, 50, 50, ";  // red — mine range
        } else {
            color = "rgba(180, 0, 255, ";  // purple — laser range
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(player.x - 20, player.y - 22, 40, 4); // background track
        ctx.fillStyle = color + "0.9)";
        ctx.fillRect(player.x - 20, player.y - 22, 40 * progress, 4); // fill
    }
>>>>>>> Stashed changes
}


function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    });
}
