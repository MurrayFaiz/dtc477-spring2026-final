// Asteroid Script
let asteroids = [];

function spawnAsteroid() {
    const edge = Math.random() < 0.5 ? "x" : "y";
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    if (edge === "x") x = Math.random() < 0.5 ? 0 : canvas.width;
    else y = Math.random() < 0.5 ? 0 : canvas.height;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;

    const stage = "large";
    const baseSize = 40;
    const variation = 8;
    asteroids.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        stage: stage,
        radius: baseSize + (Math.random() * variation * 2 - variation)
    });
}

for (let i = 0; i < 6; i++) spawnAsteroid();
console.log("Astroids:", asteroids);

function wrap(obj) {
    if (obj.x < 0) obj.x += canvas.width;
    if (obj.x > canvas.width) obj.x -= canvas.width;
    if (obj.y < 0) obj.y += canvas.height;
    if (obj.y > canvas.height) obj.y -= canvas.height;
}

function updateAsteroids() {
    asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        wrap(a);
    });
}

function checkCollisions() {
    let hits = [];

    // Detect collision
    bullets.forEach((b, bi) => {
        asteroids.forEach((a, ai) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (!hits.some(h => h.ai === ai)) {
                hits.push({ bi, ai });
            }
        });
    });

    // Split asteroids
    hits.reverse().forEach(hit => {
        const b = bullets[hit.bi];
        const a = asteroids[hit.ai];

        if (!a || !b) return;

        bullets.splice(hit.bi, 1);
        asteroids.splice(hit.ai, 1);

        if (a.stage !== "small") {
            let nextStage = null;

            if (a.stage === "large") nextStage = "medium";
            else if (a.stage === "medium") nextStage = "small";

            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;

                let baseSpeed = 0;
                let baseSize = 0;

                if (nextStage === "medium") {
                    baseSpeed = 1.2;
                    baseSize = 24
                }
                if (nextStage === "small") {
                    baseSpeed = 1.8;
                    baseSize = 12;
                }

                const speed = baseSpeed + Math.random() * 0.4;
                const radius = baseSize + (Math.random() * 4 - 2);

                asteroids.push({
                    x: a.x,
                    y: a.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    stage: nextStage,
                    radius: radius
                });
            }
        }
    });
}

function drawAsteroids() {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Alien Script