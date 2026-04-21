function mainLoop() {
    //Update Player
    updatePlayer();
    updateBullets();

    //Update Asteroids
    updateAsteroids();
    updateAliens();

    //Check Collision
    asteroidsCollisions();
    playerCollisions();

    //Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw Player + Bullets
    drawPlayer();
    drawBullets();

    //Draw Asteroids
    drawAsteroids();
    drawAliens();

    requestAnimationFrame(mainLoop);
}

mainLoop();