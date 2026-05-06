// --------------------------------------
// JOYSTICK + BUTTON CONTROL SYSTEM
// --------------------------------------

const leftStick = document.getElementById("leftStick");
const rightStick = document.getElementById("rightStick");
const btnA = document.getElementById("btnA");

// Reset both sticks to neutral
function resetSticks() {
    if (!leftStick || !rightStick) return;
    leftStick.className = "small-item stick-neutral";
    rightStick.className = "small-item stick-neutral";
}

// Keydown events
document.addEventListener("keydown", e => {
    if (e.repeat) return;

    // SPACE → button bump
    if (e.code === "Space" && btnA) {
        btnA.classList.remove("bump-animate");
        void btnA.offsetWidth; // restart animation
        btnA.classList.add("bump-animate");
    }

    // LEFT stick only animates
    if (!leftStick) return;

    if (e.code === "ArrowLeft") {
        leftStick.className = "small-item stick-left";
    }
    if (e.code === "ArrowRight") {
        leftStick.className = "small-item stick-right";
    }
    if (e.code === "ArrowUp") {
        leftStick.className = "small-item stick-forward";
    }
    if (e.code === "ArrowDown") {
        leftStick.className = "small-item stick-back";   // NEW
    }
});

// Keyup events
document.addEventListener("keyup", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        resetSticks();
    }
});

// Return to menu
function returnToMenu() {
    const fade = document.getElementById("fadeOut");
    if (fade) fade.classList.add("active");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 600);
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") returnToMenu();
});

const homeBtn = document.getElementById("homeBtn");
if (homeBtn) {
    homeBtn.addEventListener("click", returnToMenu);
}
