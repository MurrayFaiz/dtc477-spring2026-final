function asteroidsCollisions() {
    let asteroidHits = [];

    // Detect collision
    bullets.forEach((b, bi) => {
        asteroids.forEach((a, ai) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < a.radius && !asteroidHits.some(h => h.ai === ai)) {
                asteroidHits.push({ bi, ai });
            }
        });

        aliens.forEach((atl, atli) => {
            const dx = atl.x - b.x;
            const dy = atl.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < Math.max(atl.height, atl.width)) {
                bullets.splice(bi, 1);
                aliens.splice(atli, 1);
            }
        });
    });

    // Split asteroids
    asteroidHits.reverse().forEach(hit => {
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


function playerCollisions() {
    const playerRadius = (player.width + player.height) / 4

    asteroids.forEach(a => {
        const dx = a.x - player.x;
        const dy = a.y - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist < playerRadius + a.radius) {
            player.takeDamage(1);
        }
    });
}