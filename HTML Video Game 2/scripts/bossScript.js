const boss = {
    x: canvas.width / 2,
    y: canvas.height - 520,
    width: 600,
    height: 100,
    speedY: 0.05,

    bossHealth: 100,
    lastTimeBossShot: 0,
    shootInterval: 2000,
    laserHitCooldown: 0,
    laserHitDelay: 500, // ms between laser hits

    //Set color and create collision points
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


//Script Logic Suggestions:
// We may want to tie the vulnerable spot to the array values and color in updateBoss, I'm not sure yet
// we run a check for the level stored to determine which series of questions/level we are on from quiz script
// A SUGGESTION

//Initialize which boss

// The First boss
let bossNumber = 0

// Boss Phases in a simple way for the quiz and to slightly change behavior based off of health values

// if (boss.bossHealth >= 100 || boss.bossHealth <= 80) {
//     // set boss speed to 0, stop bullets from the boss
//     // set opacity of quiz html overlay to 1, run the next question in the array
//     // on the condition we got it correct, once the player clicks the next button, we set the quiz opacity back to 0 
//     // we increase the damage the player does temporarily by a small amount on victory, or lower the damage if question is failed  
//     // boss speed and damage set back to normal   
// },

// else if (boss.bossHealth < 80 || boss.bossHealth > 60) {    // set boss speed to 0, stop bullets from the boss
//     // set opacity of quiz html overlay to 1, run the next question in the array  
//     // on the condition we got it correct, once the player clicks the next button, we set the quiz opacity back to 0 
//     // we increase the damage the player does temporarily by a small amount on victory or lower the damage if question is failed   
//     // boss speed and damage set back to normal   
// },

// else if (boss.bossHealth < 59 || boss.bossHealth > 40) {    // set boss speed to 0, stop bullets from the boss
//     // set opacity of quiz html overlay to 1, run the next question in the array  
//     // on the condition we got it correct, once the player clicks the next button, we set the quiz opacity back to 0 
//     // we increase the damage the player does temporarily by a small amount on victory or lower the damage if question is failed    
//     // boss speed and damage increased slightly
// },

// else if (boss.bossHealth < 40 || boss.bossHealth > 20) {    // set boss speed to 0, stop bullets from the boss
//     // set opacity of quiz html overlay to 1, run the next question in the array  
//     // on the condition we got it correct, once the player clicks the next button, we set the quiz opacity back to 0 
//     // we increase the damage the player does temporarily by a small amount on victory or lower the damage if question is failed    
//     // boss speed and damage increased slightly
// },

// else if (boss.bossHealth < 19 || boss.bossHealth > 0) {    // set boss speed to 0, stop bullets from the boss
//     // set opacity of quiz html overlay to 1, run the next question in the array  
//     // on the condition we got it correct, once the player clicks the next button, we set the quiz opacity back to 0 
//     // we increase the damage the player does temporarily by a small amount on victory or lower the damage if question is failed
//     // boss speed and damage increased moderately       
// },

// else {
//     // show boss slain screen/graphic
//     // set opacity of quiz back to 0
//     // bossNumber = +1 
//     // if bossNumber >2 (For 3 bosses total) then reset back to 0
//     // function for debrief using a data-info value or some sort to change which debrief it is , set wrapper display for debrief to block/shown in some way
//     // maybe throw it into a function or conditional that can change the bosses based off of the value of bossNumber (Can probably be used for images, music, and sounds too)
// }

let bossBullets = [];

function updateBoss() {
    //Check gameState
    if (gameState !== "bossState") return;

    //Boss descends
    boss.y += boss.speedY;

    //Boss reaches player
    const lowestBossY = boss.y + 80;
    const playerTop = player.y - player.height / 2;

    if (lowestBossY >= playerTop) {
        gameState = "gameOverState"
    }

    //Hit point logic
    const now = Date.now();

    //Run color timer
    if (now - boss.lastColorChange >= boss.colorInterval) {
        boss.lastColorChange = now;

        const colors = ["red", "blue", "yellow", "green"];
        boss.activeColor = colors[Math.floor(Math.random() * colors.length)];

        //Reset all points
        boss.collisionPoints.forEach(p => {
            p.vulnerable = false;
        });

        //Enable correct point
        boss.collisionPoints.forEach(p => {
            if (p.color === boss.activeColor) {
                p.vulnerable = true;
            }
        });
    }

    //Projectile logic
    if (now - boss.lastTimeBossShot >= boss.shootInterval) {
        boss.lastTimeBossShot = now;

        //Fire from non-vulnerable points
        const validPoints = boss.collisionPoints.filter(p => !p.vulnerable);

        if (validPoints.length > 0) {
            const shooter = validPoints[Math.floor(Math.random() * validPoints.length)];

            const baseX = boss.x + shooter.offsetX;
            const baseY = boss.y + shooter.offsetY;

            //Spreads bullets
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

    //Main boss body
    ctx.fillStyle = "Black";
    ctx.fillRect(boss.x - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height);

    //Satelite points
    boss.collisionPoints.forEach(p => {
        const x = boss.x + p.offsetX;
        const y = boss.y + p.offsetY;

        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);

        //Active color = state
        ctx.fillStyle = p.color;

        //Vulnerability hint
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

