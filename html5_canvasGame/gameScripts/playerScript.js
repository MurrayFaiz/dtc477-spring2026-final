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
    if (Date.now() - player.lastShotTime > 500 && e.code === "Space") {
        bullets.push({
            x: player.x,
            y: player.y - player.height / 2,
            vy: -6
        });
        player.lastShotTime = Date.now()
    }
});
document.addEventListener("keyup", e => {
    if (e.code === "Space");
});

function updatePlayer() {
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));

    if (player.invincible && Date.now() > player.invincibleStop) {
        player.invincible = false;
    }
}

function updateBullets() {
    bullets.forEach(b => b.y += b.vy);
    bullets = bullets.filter(b => b.y > 0);
}

function drawPlayer() {
    if (player.invincible) {
        const blink = Math.floor(Date.now() / 100) % 2;
        if (blink === 0) return;
    }

    ctx.fillStyle = "red";
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

}

function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    });
}
