function enemyCollisions() {
    // Handled by resolveProjectileHits and resolveLaserHits in the weapon script
}

function playerCollisions() {
    if (!player || !player.active) return;
    if (player.invincible) return;
    // Skip all damage if force field is active
    if (weapons.active.some(w => w.type === "forcefield")) return;
    const playerRadius = (player.width + player.height) / 4;

    // Asteroids
    asteroids.forEach(a => {
        if (!a) return;
        const dx = a.x - player.x;
        const dy = a.y - player.y;
        if (Math.hypot(dx, dy) < playerRadius + a.radius) {
            player.takeDamage(15);
        }
    });

    // Aliens
    aliens.forEach(a => {
        if (!a) return;
        const dx = (a.x + a.width / 2) - player.x;
        const dy = (a.y + a.height / 2) - player.y;
        if (Math.hypot(dx, dy) < playerRadius + Math.max(a.width, a.height) / 2) {
            player.takeDamage(10);
        }
    });

    // Boss bullets
    if (typeof bossBullets !== "undefined") {
        for (let i = bossBullets.length - 1; i >= 0; i--) {
            const b = bossBullets[i];
            if (!b) continue;
            const dx = b.x - player.x;
            const dy = b.y - player.y;
            if (Math.hypot(dx, dy) < playerRadius + b.size) {
                player.takeDamage(20);
                bossBullets.splice(i, 1);
            }
        }
    }

    // Death check
    if (player.playerHealth <= 0) {
        setGameState("gameOverState");
        console.log("Mission Failed!");
    }
}