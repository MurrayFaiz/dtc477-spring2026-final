// Tevin's Quiz Code
// This started out with solid logic and work behind it, but as the project became more complex it became more heavily vibe coded. 
// It was a good experience to learn how to work with AI to code because it still requires a good amount of work. It just cuts down something that would take weeks or months down
// to something that takes more like 40 or 50 hours to finish (Everything all tied together)

// CHAT LOG:

// Debrief work (Although integrated into the levels & loops, this is the best place to put it as it works together with the quiz script)

// 1. launch an overlay with a combination of text, images, and video
// 2. create a clickable overlay of different text links, but prevent default browser behavior (Which tries to navigate you somewhere or move around the page)
// 3. after clicking the highlighted text, a small text overlay will show
// 4. on hover on a button element, start the mission by closing the overlay, playing a css animation, and starting the game loop for a given level

// Debrief integration, CSS Issues, and Debugging
// https://chatgpt.com/share/69f77b97-aff8-83e8-95f8-c204ef69159b

// Debrief panel logic & help
// https://claude.ai/share/8eed04b5-3c71-4f4f-8646-890cca09dbeb
// https://claude.ai/share/c010af5c-25d3-4d3f-8bc9-493a539c3891
// https://claude.ai/share/6b2dc67c-814a-47f8-8c16-a0cd411de7de

// Quiz Script Work

// JS Mentor Logic
// https://chatgpt.com/share/69ecfd8c-ef50-83e8-8223-88a45d76da6f

// Formatting
// https://claude.ai/share/3f42f837-13af-4547-9884-2fcee9441fb9

// HTML5 Game Mentor Logic Steps
// https://chatgpt.com/share/69ed2786-5944-83e8-b94a-6511b2a025ef

// Generating Code Template
// https://claude.ai/share/fe9ca8e4-9d14-49e9-8ec9-214e4d23fd61

// JS Mentor Debugging/help
// https://chatgpt.com/share/69ed9510-b99c-83e8-ba90-1821edc1c267

// Even more Debugging 
// https://chatgpt.com/share/69f77c4a-3904-83e8-9b20-00d72b51e0d5

// Simplifying the Json Fetch & Randomizing the quiz questions
// https://claude.ai/share/fe9ca8e4-9d14-49e9-8ec9-214e4d23fd61

// CSS Fixes & Fixing the quiz's DOM and overlay not loading correctly
// https://claude.ai/share/fe9ca8e4-9d14-49e9-8ec9-214e4d23fd61

// Logic Steps:
// 1. When the page opens, go get the questions file and store everything in it for later
// 2. Display the start screen of the quiz with a button to begin
// 3. When the user clicks the button for the first time, start the game and load the first level
// 4. Grab the 5 questions in a level, shuffle them randomly, and add them to a pile array
// 5. Draw the top card from the pile array, and and display the four possible answers to the quiz question
// 6. When the user picks an answer, lock all the buttons so the answer cannot be changed, then reveal the correct answer
// 7. Show a next button so that when the user clicks the button, it draws the next card from the pile array.
// 8. repeat steps 5-7 until the array is empty.
// 9. When the pile runs out, move to the next level, repeat step 4 with the next level's set of questions and repeat
// 10. when all the levels are gone, show the user's score
// 11. If the user restarts, wipe everything and go back to step 2.

// Note: this would change to have each round close and open an overlay upon the end of each quiz round instead to streamline and improve the gameplay loop

//         Structure of the code: (An earlier version that is mostly intact but has changed somewhat)

// Structure of the code:

// Initialization
//   - State variables declared (questions, drawPile, score, etc.)
//   - DOMContentLoaded → populate startScreen with Level 1 info
//   - levels[] array defined (name, title, desc per level)
//   - fetch("/data/questions.json") → assigns to questions object
//    ↓
// startOrDraw()  ← triggered by "Begin" button on startScreen
//   - First press: sets score = 0, currentLevelIndex = 0,
//     gameStarted = true, calls loadLevel(0)
//   - Every press: calls generateQuestion()
//    ↓
// loadLevel(index)
//   - Reads questions[level.name] from loaded JSON
//   - Shuffles pool into drawPile via Fisher-Yates shuffle()
//   - Sets levelSize, calls updateHUD()
//    ↓
// generateQuestion()
//   - If drawPile is empty → advanceLevel()
//   - Otherwise: pops currentQuestion, calls renderQuestion()
//    ↓
// renderQuestion()
//   - Hides startScreen/endScreen, shows questionScreen
//   - Populates category, question ID, question text
//   - Resets feedback + nextBtn visibility
//   - Calls buildChoices(), updateHUD(), updateProgress()
//    ↓
// buildChoices()
//   - Dynamically creates A/B/C/D buttons for currentQuestion.choices
//   - Binds each button to handleChoice(index)
//    ↓
// handleChoice(selectedIndex)
//   - Disables all buttons, highlights correct (green) and wrong (red)
//   - Increments totalAnswered; increments score if correct
//   - Displays feedback text
//   - Shows nextBtn ("Next Question →" or "Next Level →")
//    ↓
// nextBtn click → generateQuestion()
//    ↓
// (loops until drawPile is empty)
//    ↓
// advanceLevel()
//   - Increments currentLevelIndex
//   - If past last level → endGame()
//   - Otherwise → loadLevel(newIndex) + showTransition()
//    ↓
// showTransition()
//   - Shows startScreen populated with next level's info
//   - Button press → startOrDraw() → generateQuestion()
//    ↓
// (outer loop repeats for each level)
//    ↓
// endGame()
//   - Shows endScreen with final score / totalAnswered
//   - Sets gameStarted = false
//    ↓
// restartGame()  ← optional, resets all state back to startScreen (Level 1)


// --- State ---
let questions = null;
let currentQuestion = null;
let drawPile = [];
let currentLevelIndex = -1;
let totalAnswered = 0;
let answeredCorrect = 0;
let levelSize = 0;
let gameStarted = false;

// Modify the fetch to enable the button only when ready
fetch("./data/questions.json")
    .then(r => r.json())
    .then(data => {
        questions = data;
        console.log("Questions loaded:", questions);

        // Enable the button now that data is ready
        const btn = document.getElementById("drawBtn");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Begin"; // Ensure text is correct
        }
    })
    .catch(err => {
        console.error("Failed to load questions.json:", err);
        const btn = document.getElementById("drawBtn");
        if (btn) btn.textContent = "Error Loading Questions";
    });

// --- Level definitions ---
const levels = [
    {
        name: "universe",
        title: "The Universe",
        desc: "Five questions on the scale, structure, and deep history of the cosmos."
    },
    {
        name: "gameTheory",
        title: "Game Theory",
        desc: "Five questions on strategic decision-making, cooperation, and feedback."
    },
    {
        name: "fermiParadox",
        title: "The Fermi Paradox",
        desc: "Five questions on the silence of the universe and what it might mean."
    }
];

// --- Set start screen to level 1 on load ---
window.addEventListener("DOMContentLoaded", function () {
    document.getElementById("levelBadge").textContent = "Level 0";
    document.getElementById("levelTitle").textContent = levels[0].title;
    document.getElementById("levelDesc").textContent = levels[0].desc;
});

// --- Load questions JSON ---
fetch("./data/questions.json")
    .then(r => r.json())
    .then(data => {
        questions = data;
        console.log("Questions loaded:", questions);
    })
    .catch(err => console.error("Failed to load questions.json:", err));

// --- Fisher-Yates shuffle ---
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// --- Begin / draw button ---

function startOrDraw() {
    console.log(">>> START OR DRAW CALLED <<<");
    console.log("Index BEFORE:", currentLevelIndex);
    console.log("GameStarted BEFORE:", gameStarted);

    if (!questions) {
        const btn = document.getElementById("drawBtn");
        if (btn) btn.textContent = "Loading...";
        setTimeout(startOrDraw, 500);
        return;
    }

    if (!gameStarted) {
        console.log("Entering start block. Incrementing index.");
        totalAnswered = 0;
        answeredCorrect = 0;
        currentLevelIndex++;
        gameStarted = true;
        console.log("Index AFTER INCREMENT:", currentLevelIndex);
        loadLevel(currentLevelIndex);
    } else {
        console.log("Skipping start block. gameStarted is true.");
    }

    generateQuestion();
}

// --- Shuffle current level's questions into drawPile ---
function loadLevel(index) {
    console.log(">>> LOAD LEVEL CALLED WITH INDEX:", index);
    const level = levels[index];

    if (!level) {
        console.error("ERROR: Invalid level index", index);
        return;
    }

    const pool = questions[level.name];
    console.log("Looking for questions for:", level.name);
    console.log("Pool found?", !!pool);
    console.log("Pool length?", pool ? pool.length : 0);

    if (!pool || pool.length === 0) {
        console.error("ERROR: No questions found for level:", level.name);
        // ALERT YOU SO YOU SEE IT
        alert("Error: No questions found for " + level.name + ". Check JSON keys.");
        return;
    }

    drawPile = shuffle(pool);
    levelSize = pool.length;
    updateHUD();
    console.log("SUCCESS: Loaded", drawPile.length, "questions.");
}

// --- Pop one question from the draw pile ---
function generateQuestion() {
    if (drawPile.length === 0) {
        endGame();
        return;
    }

    currentQuestion = drawPile.pop();
    console.log("Drew:", currentQuestion.id, "| Remaining:", drawPile.length);
    renderQuestion();
}

// --- Render question and choices ---
function renderQuestion() {
    console.log(">>> RENDER QUESTION CALLED <<<");

    // 1. FORCE THE OVERLAY TO BE VISIBLE
    var overlay = document.getElementById("quizOverlay");
    if (overlay) {
        console.log("Forcing overlay to flex");
        overlay.style.display = "flex";
        overlay.style.zIndex = "9999";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.9)"; // Dark background to see it
    }

    // 2. Get Elements
    const startScreen = document.getElementById("startScreen");
    const questionScreen = document.getElementById("questionScreen");
    const endScreen = document.getElementById("endScreen");
    const qCat = document.getElementById("qCategory");
    const qId = document.getElementById("qId");
    const qText = document.getElementById("questionText");
    const choicesContainer = document.getElementById("choicesContainer");
    const feedbackEl = document.getElementById("feedback");
    const nextBtn = document.getElementById("nextBtn");

    // 3. Check for Missing Elements
    if (!startScreen || !questionScreen || !choicesContainer) {
        console.error("CRITICAL: Missing DOM elements!", {
            startScreen: !!startScreen,
            questionScreen: !!questionScreen,
            choicesContainer: !!choicesContainer
        });
        alert("Error: Could not find quiz screen elements in HTML. Check IDs.");
        return;
    }

    // 4. FORCE VISIBILITY OF QUESTION SCREEN
    console.log("Forcing questionScreen visibility");
    startScreen.style.display = "none";
    questionScreen.style.display = "block"; // Try 'flex' if 'block' doesn't work
    questionScreen.style.zIndex = "10000";
    questionScreen.style.position = "relative";
    questionScreen.style.padding = "20px";
    questionScreen.style.maxWidth = "600px";
    questionScreen.style.margin = "100px auto"; // Center it

    endScreen.style.display = "none";

    // 5. Populate Content
    const level = levels[currentLevelIndex];
    if (qCat) qCat.textContent = level.title.toUpperCase();
    if (qId) qId.textContent = currentQuestion.id.toUpperCase();
    if (qText) qText.textContent = currentQuestion.question;

    // 6. Reset Feedback
    if (feedbackEl) {
        feedbackEl.style.display = "none";
        feedbackEl.textContent = "";
        feedbackEl.className = "";
    }
    if (nextBtn) nextBtn.style.display = "block"; // Ensure button is visible

    // 7. Build Choices
    console.log("Building choices...");
    buildChoices();

    // 8. Update HUD
    updateHUD();
    updateProgress();

    console.log("Render complete. Check for RED BOX on screen.");
}

// --- Inject A/B/C/D choice buttons ---
const LABELS = ["A", "B", "C", "D"];

function buildChoices() {
    const container = document.getElementById("choicesContainer");
    container.innerHTML = "";

    currentQuestion.choices.forEach(function (choiceText, index) {
        const btn = document.createElement("button");
        btn.textContent = LABELS[index] + ".  " + choiceText;
        btn.classList.add("choice-btn");
        btn.setAttribute("data-index", index);
        btn.setAttribute("data-label", LABELS[index]);
        btn.onclick = function () { handleChoice(index); };
        container.appendChild(btn);
    });
}

// --- Handle answer selection ---
function handleChoice(selectedIndex) {
    const correctIndex = currentQuestion.correct;
    const buttons = document.querySelectorAll(".choice-btn");
    totalAnswered++;

    buttons.forEach(function (btn) {
        btn.disabled = true;
        const i = parseInt(btn.getAttribute("data-index"));
        if (i === correctIndex) { btn.classList.add("correct"); }
        else if (i === selectedIndex) { btn.classList.add("wrong"); }
    });

    const feedbackEl = document.getElementById("feedback");
    feedbackEl.style.display = "block";

    if (selectedIndex === correctIndex) {
        // Add 500 to the shared game score
        answeredCorrect += 1
        score += 500;
        document.getElementById("scoreDisplay").innerText = "Score: " + score;
        feedbackEl.textContent = "// CORRECT — +500 PTS — BOSS VULNERABILITY IDENTIFIED";
        feedbackEl.className = "feedback-correct";
    } else {
        feedbackEl.textContent = "// INCORRECT — correct answer highlighted above";
        feedbackEl.className = "feedback-wrong";
    }

    const isLastInLevel = drawPile.length === 0;
    const nextBtn = document.getElementById("nextBtn");
    nextBtn.textContent = isLastInLevel ? "View Results →" : "Next Question →";
    nextBtn.style.display = "block";
}

// --- Advance to next level or end ---
function advanceLevel() {
    currentLevelIndex++;

    if (currentLevelIndex >= levels.length) {
        endGame();
        return;
    }

    loadLevel(currentLevelIndex);
    showTransition();
}

// --- Between-level transition card ---
function showTransition() {
    document.getElementById("questionScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";

    const level = levels[currentLevelIndex];
    document.getElementById("levelBadge").textContent = "Level " + (currentLevelIndex + 1);
    document.getElementById("levelTitle").textContent = level.title;
    document.getElementById("levelDesc").textContent = level.desc;
    document.getElementById("drawBtn").textContent = "Begin Level →";
    document.getElementById("drawBtn").disabled = false;
}

// --- End screen — leads into boss fight ---
function endGame() {
    console.log(">>> END GAME CALLED");
    gameStarted = false;
    document.getElementById("questionScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "block";

    // Show final accumulated score
    document.getElementById("endScore").textContent = answeredCorrect + " /5";

    // Swap restart button for boss entry
    const btn = document.getElementById("restartBtn");
    btn.textContent = "PROCEED TO WEAPONS UPGRADE SYSTEM";
    btn.onclick = () => {
        document.getElementById("endScreen").style.display = "none";
        document.getElementById("quizOverlay").style.display = "none";
        if (quizCompleteCallback) {
            quizCompleteCallback();
        }
    };
}

// --- Reset quiz state (called when shop re-opens quiz) ---
function resetQuiz(startIndex = 0) {
    totalAnswered = 0;
    answeredCorrect = 0;
    currentLevelIndex = startIndex - 1; // -1 so startOrDraw increments to startIndex
    gameStarted = false;
    drawPile = [];

    document.getElementById("endScreen").style.display = "none";
    document.getElementById("questionScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";
    document.getElementById("levelBadge").textContent = "Level " + (startIndex + 1);
    document.getElementById("levelTitle").textContent = levels[startIndex].title;
    document.getElementById("levelDesc").textContent = levels[startIndex].desc;
    document.getElementById("drawBtn").textContent = "Begin";
    document.getElementById("drawBtn").disabled = false;

    updateHUD();
    document.getElementById("progressBar").style.width = "0%";
}

window.resetQuiz = resetQuiz;

// --- HUD bar ---
function updateHUD() {
    const levelNum = currentLevelIndex >= 0 ? currentLevelIndex + 1 : "—";
    const catName = currentLevelIndex >= 0 && currentLevelIndex < levels.length
        ? levels[currentLevelIndex].title.toUpperCase()
        : "—";
    const remaining = drawPile.length > 0 ? drawPile.length : "—";

    document.getElementById("hudLevel").textContent = levelNum;
    document.getElementById("hudCategory").textContent = catName;
    document.getElementById("hudRemaining").textContent = remaining;
}

// --- Progress bar (within current level) ---
function updateProgress() {
    if (levelSize === 0) return;
    const answered = levelSize - drawPile.length;
    const pct = (answered / levelSize) * 100;
    document.getElementById("progressBar").style.width = pct + "%";
}