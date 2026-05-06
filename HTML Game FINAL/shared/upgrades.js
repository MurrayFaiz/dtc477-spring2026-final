// =====================================================
// GLOBAL UPGRADE STATE
// =====================================================

let upgrades = {
    unlockLaser: false,
    unlockForcefield: false,
    spreadShot: false,
    drone: false,
    homingMissile: true,
    mine: false,
    bulletSpeedBonus: 0,
    playerSpeedBonus: 0,
    playerMaxHealthBonus: 0,
    laserDamageLevel: 1
};

// Legacy globals used in player.js and shops
let unlockLaser = false;
let unlockForcefield = false;
let homingMissile = true;
let mine = false;
let bulletSpeedBonus = 0;
let playerSpeedBonus = 0;
let playerMaxHealth = 5; // base, will be adjusted
// player.playerHealth will be set after playerInit()


// =====================================================
// LOAD / SAVE UPGRADES (LOCALSTORAGE)
// =====================================================

function loadUpgrades() {
    try {
        const raw = localStorage.getItem("arcade_upgrades");
        if (!raw) return;

        const data = JSON.parse(raw);
        upgrades = { ...upgrades, ...data };

        // sync legacy globals
        unlockLaser = !!upgrades.unlockLaser;
        unlockForcefield = !!upgrades.unlockForcefield;
        bulletSpeedBonus = upgrades.bulletSpeedBonus || 0;
        playerSpeedBonus = upgrades.playerSpeedBonus || 0;
        playerMaxHealth = 5 + (upgrades.playerMaxHealthBonus || 0);

    } catch (e) {
        console.warn("Failed to load upgrades:", e);
    }
}

function saveUpgrades() {
    try {
        localStorage.setItem("arcade_upgrades", JSON.stringify(upgrades));
    } catch (e) {
        console.warn("Failed to save upgrades:", e);
    }
}


// =====================================================
// APPLY UPGRADES TO PLAYER
// =====================================================
// upgrades.js - applyUpgradesToPlayer() function

function applyUpgradesToPlayer() {
    if (!window.player) return;

    // Health
    playerMaxHealth = 5 + (upgrades.playerMaxHealthBonus || 0);
    player.playerHealth = playerMaxHealth;

    // Speed
    playerSpeedBonus = upgrades.playerSpeedBonus || 0;
    player.speed = 4 + playerSpeedBonus;

    // Bullet speed
    bulletSpeedBonus = upgrades.bulletSpeedBonus || 0;

    // Unlocks - FIX: Use correct property names
    unlockLaser = !!upgrades.unlockLaser;
    unlockForcefield = !!upgrades.unlockForcefield;
    homingMissile = !!upgrades.homingMissile;

    // FIX: Changed from upgrades.unlockMine to upgrades.mine
    mine = !!upgrades.mine;

    // Optional: Also sync if you have unlockMine as a separate global
    if (typeof unlockMine !== 'undefined') {
        unlockMine = !!upgrades.mine;
    }
}

