// =======================
// INPUT
// =======================
const keys = {};

document.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (e.code === "Space" && spaceHeldSince === null) {
        spaceHeldSince = Date.now();
    }
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;

    if (e.code === "Space") {
        handleWeaponFire();
    }
});

let spaceHeldSince = null;
const CHARGE_TIME = 1500;

// =======================
// PLAYER UPDATE
// =======================
function updatePlayer() {
    if (!player.active) return;

    if (gameState === "enemyState") {
        if (keys["ArrowLeft"]) player.angle -= player.rotationSpeed;
        if (keys["ArrowRight"]) player.angle += player.rotationSpeed;

        if (keys["ArrowUp"]) {
            player.vx += Math.cos(player.angle) * player.thrustPower;
            player.vy += Math.sin(player.angle) * player.thrustPower;
        }

        if (keys["ArrowDown"]) {
            player.vx -= Math.cos(player.angle) * player.thrustPower * 0.6;
            player.vy -= Math.sin(player.angle) * player.thrustPower * 0.6;
        }

        player.vx *= player.friction;
        player.vy *= player.friction;

        player.x += player.vx;
        player.y += player.vy;

        wrapPlayer(player);

    } else if (gameState === "bossState") {
        if (keys["ArrowLeft"]) player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;

        player.x = Math.max(
            player.width / 2,
            Math.min(canvas.width - player.width / 2, player.x)
        );

        player.vx = 0;
        player.vy = 0;
        player.angle = 0;
    }

    if (player.invincible && Date.now() > player.invincibleStop) {
        player.invincible = false;
    }
}

// =======================
// DRAW PLAYER
// =======================
function drawPlayer() {
    if (!player.active) return;

    if (player.invincible) {
        if (Math.floor(Date.now() / 100) % 2 === 0) return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (gameState === "enemyState") {
        ctx.rotate(player.angle);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
    );

    ctx.restore();

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
        keys["Space"] = false;
    });

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
}


// =======================
// HELPERS
// =======================
function wrapPlayer(p) {
    if (p.x < 0) p.x += canvas.width;
    if (p.x > canvas.width) p.x -= canvas.width;
    if (p.y < 0) p.y += canvas.height;
    if (p.y > canvas.height) p.y -= canvas.height;
}