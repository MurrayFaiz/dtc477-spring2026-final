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
        player.angle = 0;
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
}


function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    });
}
