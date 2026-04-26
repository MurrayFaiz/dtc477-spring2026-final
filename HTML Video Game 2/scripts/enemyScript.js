
// =======================
// ENEMY SCRIPT (CLEAN)
// =======================

// shared arrays
let asteroids = [];
let aliens = [];

// =======================
// ASTEROIDS
// =======================

function spawnAsteroid() {
    const edge = Math.random() < 0.5 ? "x" : "y";

    let x = Math.random() * canvas.width;
    let y = Math.random() * 300 + 40;

    if (edge === "x") x = Math.random() < 0.5 ? 0 : canvas.width;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;

    asteroids.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        stage: "large",
        radius: 40,
        health: 120,
        lastHitTime: 0
    });
}

// -----------------------

function splitAsteroid(a, ai, damage = 10) {
    const now = Date.now();
    if (now - a.lastHitTime < 100) return;
    a.lastHitTime = now;

    const prev = a.health; // ← capture BEFORE damage
    a.health -= damage;

    if (a.stage === "small") {
        if (a.health <= 0) asteroids.splice(ai, 1);
        return;
    }

    const thresholds = { large: 60, medium: 30 };
    const threshold = thresholds[a.stage];

    if (!(prev > threshold && a.health <= threshold)) return;

    asteroids.splice(ai, 1);

    const nextStage = a.stage === "large" ? "medium" : "small";
    const config = {
        medium: { speed: 1.4, size: 24, health: 60 },
        small: { speed: 2.2, size: 12, health: 20 }
    };
    const cfg = config[nextStage];

    for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = cfg.speed + Math.random() * 0.5;
        asteroids.push({
            x: a.x,
            y: a.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            stage: nextStage,
            radius: cfg.size,
            health: cfg.health,
            lastHitTime: 0
        });
    }
}

// -----------------------

function updateAsteroids() {
    for (let a of asteroids) {
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0) a.x += canvas.width;
        if (a.x > canvas.width) a.x -= canvas.width;

        if (a.y < 0) {
            a.y = 0;
            a.vy *= -1;
        }

        if (a.y > canvas.height) {
            a.y = canvas.height;
            a.vy *= -1;
        }
    }
}

function drawAsteroids() {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;

    for (let a of asteroids) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// =======================
// ALIENS
// =======================

function spawnAlien() {
    let x = Math.random() * canvas.width;
    let y = Math.random() * 300 + 40;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;

    aliens.push({
        x,
        y,
        width: 40,
        height: 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    });
}

// -----------------------

function updateAliens() {
    for (let a of aliens) {
        a.x += a.vx;
        a.y += a.vy;

        // bounce X
        if (a.x < 0 || a.x > canvas.width) {
            a.vx *= -1;
        }

        // bounce Y
        if (a.y < 0 || a.y > canvas.height) {
            a.vy *= -1;
        }
    }
}

function drawAliens() {
    ctx.fillStyle = "green";

    for (let a of aliens) {
        ctx.fillRect(a.x, a.y, a.width, a.height);
    }
}

// =======================
// INITIAL SPAWNS
// =======================

for (let i = 0; i < 3; i++) spawnAsteroid();
for (let i = 0; i < 3; i++) spawnAlien();

console.log("Enemies initialized:", asteroids, aliens);