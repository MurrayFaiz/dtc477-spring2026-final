const boss = {
    x: canvas.width / 2,
    y: canvas.height - 520,
    width: 600,
    height: 100,
    speedY: 0.05,

    bossHealth: 10,
    lastTimeBossShot: 0,
    shootInterval: 2000,
    laserHitCooldown: 0,
    laserHitDelay: 500,

    activeColor: null,
    colorTimer: 0,
    lastColorChange: Date.now(),
    colorInterval: 2000,
    collisionPoints: [
        { offsetX: -240, offsetY: 80, color: "red", vulnerable: false },
        { offsetX: -80, offsetY: 80, color: "blue", vulnerable: false },
        { offsetX: 80, offsetY: 80, color: "yellow", vulnerable: false },
        { offsetX: 240, offsetY: 80, color: "green", vulnerable: false }
    ],
};

let bossNumber = 0;
let bossBullets = [];

function updateBoss() {
    if (gameState !== "bossState") return;

    // Boss descends
    boss.y += boss.speedY;

    // Boss reaches player → game over
    const lowestBossY = boss.y + 80;
    const playerTop = player.y - player.height / 2;
    if (lowestBossY >= playerTop) {
        setGameState("gameOverState");
        return;
    }

    const now = Date.now();

    // Color / vulnerability timer
    if (now - boss.lastColorChange >= boss.colorInterval) {
        boss.lastColorChange = now;

        const colors = ["red", "blue", "yellow", "green"];
        boss.activeColor = colors[Math.floor(Math.random() * colors.length)];

        boss.collisionPoints.forEach(p => p.vulnerable = false);
        boss.collisionPoints.forEach(p => {
            if (p.color === boss.activeColor) p.vulnerable = true;
        });
    }

    // Projectile logic — fire from non-vulnerable points
    if (now - boss.lastTimeBossShot >= boss.shootInterval) {
        boss.lastTimeBossShot = now;

        const validPoints = boss.collisionPoints.filter(p => !p.vulnerable);
        if (validPoints.length > 0) {
            const shooter = validPoints[Math.floor(Math.random() * validPoints.length)];
            const baseX = boss.x + shooter.offsetX;
            const baseY = boss.y + shooter.offsetY;

            const angles = [-0.5, 0, 0.5];
            angles.forEach(angle => {
                bossBullets.push({
                    x: baseX,
                    y: baseY,
                    vx: Math.sin(angle) * 3,
                    vy: 4,
                    size: 6
                });
            });
        }
    }

    // Boss defeated
    if (boss.bossHealth <= 0) {
        boss.bossHealth = 0;
        bossBullets = [];
        setGameState("bossDefeatedState"); // change to your next state
        console.log("Boss defeated!");
    }
}

function updateBossBullets() {
    bossBullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
    });
    bossBullets = bossBullets.filter(b => b.y < canvas.height);
}

function drawBoss() {
    if (gameState !== "bossState") return;

    // Main body
    ctx.fillStyle = "black";
    ctx.fillRect(boss.x - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height);

    // Collision points
    boss.collisionPoints.forEach(p => {
        const x = boss.x + p.offsetX;
        const y = boss.y + p.offsetY;

        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.vulnerable ? 1 : 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function drawBossBullets() {
    ctx.fillStyle = "purple";
    bossBullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
    });
}