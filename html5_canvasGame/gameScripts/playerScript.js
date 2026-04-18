const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 40,
    height: 10,
    speed: 4,
    lastShotTime: 0
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
}

function updateBullets() {
    bullets.forEach(b => b.y += b.vy);
    bullets = bullets.filter(b => b.y > 0);
}

function drawPlayer() {
    ctx.fillStyle = "white";
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 8);
    });
}
