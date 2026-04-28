//================
// Asteroid Script
//================

let asteroids = [];

function spawnAsteroid() {
    const edge = Math.random() < 0.5 ? "x" : "y";
    let x = Math.random() * canvas.width;
    let y = Math.random() * (300 - 40) + 40;
    if (edge === "x") x = Math.random() < 0.5 ? 0 : canvas.width;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;

    const stage = "large";
    const baseSize = 40;
    const variation = 5;
    asteroids.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        stage: stage,
        radius: baseSize + (Math.random() * variation * 2 - variation)
    });
}

for (let i = 0; i < 3; i++) spawnAsteroid();
console.log("Astroids:", asteroids);

function wrap(obj) {
    if (obj.x < 0) obj.x += canvas.width;
    if (obj.x > canvas.width) obj.x -= canvas.width;
}

function bounceCircle(obj) {
    if (obj.y - obj.radius < 0) {
        obj.y = obj.radius;
        obj.vy = obj.vy * -1;
    }
    if (obj.y + obj.radius > canvas.height) {
        obj.y = canvas.height - obj.radius;
        obj.vy = obj.vy * -1;
    }
}

function updateAsteroids() {
    asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        wrap(a);
        bounceCircle(a);
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

//=============
// Alien Script
//=============

let aliens = [];

function spawnAlien() {
    let x = Math.random() * canvas.width;
    let y = Math.random() * (300 - 40) + 40;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;

    const baseSize = 20;
    aliens.push({
        x, y,
        width: 40,
        height: 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
    });
}

for (let i = 0; i < 3; i++) spawnAlien();
console.log("Aliens", aliens);

function bounceRect(obj) {
    if (obj.y - obj.height / 2 < 0) {
        obj.y = 0 + obj.height / 2;
        obj.vy *= -1;
    }
    if (obj.y + obj.height / 2 > canvas.height) {
        obj.y = canvas.height - obj.height / 2;
        obj.vy *= -1;
    }

    if (obj.x - obj.width / 2 < 0) {
        obj.x = 0 + obj.width / 2;
        obj.vx *= -1;
    }
    if (obj.x + obj.width / 2 > canvas.width) {
        obj.x = canvas.width - obj.width / 2;
        obj.vx *= -1;
    }
}

function updateAliens() {
    aliens.forEach(atl => {
        atl.x += atl.vx;
        atl.y += atl.vy;
        bounceRect(atl);
    });
}

function drawAliens() {
    ctx.fillStyle = "green";
    aliens.forEach(atl => {
        ctx.fillRect(atl.x, atl.y, atl.width, atl.height);
    });
}