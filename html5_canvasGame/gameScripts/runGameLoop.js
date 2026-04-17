function mainLoop() {
    //Update Player
    updatePlayer();
    updateBullets();

    //Update Asteroids
    updateAsteroids();

    //Check Collision
    checkCollisions();

    //Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw Player + Bullets
    drawPlayer();
    drawBullets();

    //Draw Asteroids
    drawAsteroids();

    requestAnimationFrame(mainLoop);
}

mainLoop();