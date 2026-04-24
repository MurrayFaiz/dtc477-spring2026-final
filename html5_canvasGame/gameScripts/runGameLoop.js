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
    ctx.drawImage(bgImage, -100, 0, canvas.width * 1.2, canvas.height);

    //Draw Player + Bullets
    drawPlayer();
    drawBullets();

    //Draw Asteroids
    drawAsteroids();
    drawAliens();


    requestAnimationFrame(mainLoop);
}

mainLoop();