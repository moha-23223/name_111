const homeScreen = document.getElementById('home-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const customSettingsScreen = document.getElementById('custom-settings-screen');
const gameScreen = document.getElementById('game-screen');
const grid = document.getElementById('grid');
const movesLeft = document.getElementById('moves-left');
const currentMove = document.getElementById('current-move');
const resultMessage = document.getElementById('result-message');
const playButton = document.getElementById('play-button');
const settingsButton = document.getElementById('settings-button');
const exitButton = document.getElementById('exit-button');
const easyButton = document.getElementById('easy-button');
const normalButton = document.getElementById('normal-button');
const hardButton = document.getElementById('hard-button');
const customizeButton = document.getElementById('customize-button');
const applySettingsButton = document.getElementById('apply-settings-button');
const startGameButton = document.getElementById('start-game-button');
const restartButton = document.getElementById('restart-button');
const soundButton = document.getElementById('sound-button');
const languageToggle = document.getElementById('language-toggle');
const simplicityValue = document.getElementById('simplicity-value');
const movesValue = document.getElementById('moves-value');
const speedValue = document.getElementById('speed-value');
const helpButton = document.getElementById('help-button');
const instructionsScreen = document.getElementById('instructions-screen');
const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');
const page3 = document.getElementById('page-3');

let dots = [];
let flyPosition = { row: 0, col: 0 };
let targetPosition = { row: 0, col: 0 };
let gameState = 'start';
let totalMoves = 8;
let currentMoveCount = 0;
let moveDelay = 1000;
let soundOn = true;
let gridSize = 4;
let autoMoveInterval = null;
let isMoving = false;
let currentLanguage = 'ru';
let moveQueue = [];
let flyVisible = true;
let difficulty = 5;
let flySpeed = 1.0;

const translations = {
    en: {
        title: "Fly 2.0",
        play: "Play",
        settings: "Settings",
        exit: "Exit",
        chooseDifficulty: "Choose Difficulty",
        easy: "Easy",
        normal: "Normal",
        hard: "Hard",
        customize: "Customize",
        settingsTitle: "Settings",
        simplicity: "Simplicity:",
        moves: "Numbers:",
        speed: "Fly Speed:",
        applySettings: "Apply",
        movesLeft: "Moves Left: ",
        currentMove: "Current Turn: ",
        startGame: "Start",
        restart: "Restart",
        soundOn: "🔊",
        soundOff: "🔇",
        languageToggle: "RU / EN",
        correct: "Correct!",
        incorrect: "Incorrect!",
    },
    ru: {
        title: "مуха 2.0",
        play: "Играть",
        settings: "Настройки",
        exit: "Выход",
        chooseDifficulty: "Выберите сложность",
        easy: "Легко",
        normal: "Нормально",
        hard: "Сложно",
        customize: "Настроить",
        settingsTitle: "Настройки",
        simplicity: "Простота:",
        moves: "Числа:",
        speed: "Скорость мухи:",
        applySettings: "Применить",
        movesLeft: "Осталось ходов: ",
        currentMove: "Текущий ход: ",
        startGame: "Начать",
        restart: "Рестарт",
        soundOn: "🔊",
        soundOff: "🔇",
        languageToggle: "RU / EN",
        correct: "Верно!",
        incorrect: "Неверно!",
    }
};

document.getElementById('scorm-welcome-screen').style.display = 'block';
document.getElementById('home-screen').style.display = 'none';
document.getElementById('difficulty-screen').style.display = 'none';
document.getElementById('custom-settings-screen').style.display = 'none';
document.getElementById('game-screen').style.display = 'none';

document.getElementById('start-game').addEventListener('click', function() {
    document.getElementById('scorm-welcome-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
});

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    updateLanguage();
    localStorage.setItem('flyGameLanguage', currentLanguage);
}

function updateLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('title').textContent = t.title;
    playButton.textContent = t.play;
    settingsButton.textContent = t.settings;
    exitButton.textContent = t.exit;
    document.getElementById('choose-difficulty').textContent = t.chooseDifficulty;
    easyButton.textContent = t.easy;
    normalButton.textContent = t.normal;
    hardButton.textContent = t.hard;
    customizeButton.textContent = t.customize;
    document.getElementById('settings-title').textContent = t.settingsTitle;
    document.getElementById('simplicity-label').textContent = t.simplicity;
    document.getElementById('moves-label').textContent = t.moves;
    document.getElementById('speed-label').textContent = t.speed;
    applySettingsButton.textContent = t.applySettings;
    movesLeft.textContent = `${t.movesLeft}${totalMoves - currentMoveCount}`;
    currentMove.textContent = t.currentMove;
    startGameButton.textContent = t.startGame;
    restartButton.textContent = t.restart;
    soundButton.textContent = soundOn ? t.soundOn : t.soundOff;
    languageToggle.textContent = t.languageToggle;
    document.getElementById('back-button').textContent = currentLanguage === 'en' ? 'Back' : 'Назад';
    document.getElementById('back-to-difficulty').textContent = currentLanguage === 'en' ? 'Back' : 'Назад';
    resultMessage.textContent = '';
}

function setRandomTargetPosition() {
    let newRow, newCol;
    do {
        newRow = Math.floor(Math.random() * gridSize);
        newCol = Math.floor(Math.random() * gridSize);
    } while (newRow === flyPosition.row && newCol === flyPosition.col);
    targetPosition = { row: newRow, col: newCol };
}

function createGrid(size, difficultyLevel) {
    grid.innerHTML = '';
    dots = [];
    grid.className = 'grid';
    grid.classList.add(`grid-${difficultyLevel}`);
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell);
            dots.push(cell);
        }
    }

    const centerRow = Math.floor(size / 2);
    const centerCol = Math.floor(size / 2);
    flyPosition = { row: centerRow, col: centerCol };
    setRandomTargetPosition();
    flyVisible = true;
    updateTarget();
    updateFly();
}

function updateTarget() {
    dots.forEach(cell => {
        const isTargetCell = cell.dataset.row == targetPosition.row && cell.dataset.col == targetPosition.col;
        if (!isTargetCell) {
            cell.innerHTML = cell.innerHTML.includes('fly-game') ? cell.innerHTML : '';
        }
    });

    const targetCell = dots[targetPosition.row * gridSize + targetPosition.col];
    const existingContent = targetCell.innerHTML.includes('fly-game') ? targetCell.innerHTML : '';
    targetCell.innerHTML = '<div class="target"></div>' + existingContent;
}

function updateFly() {
    dots.forEach(cell => {
        const isTargetCell = cell.dataset.row == targetPosition.row && cell.dataset.col == targetPosition.col;
        if (!isTargetCell) {
            cell.innerHTML = cell.innerHTML.includes('target') ? cell.innerHTML : '';
        }
        cell.classList.remove('fly', 'correct-cell', 'incorrect-cell');
    });

    if (flyVisible) {
        const flyCell = dots[flyPosition.row * gridSize + flyPosition.col];
        const flyHTML = `<div class="fly-game"><img src="fly2.png" alt="Fly"></div>`;
        const existingContent = flyCell.innerHTML.includes('target') ? flyCell.innerHTML : '';
        flyCell.innerHTML = flyHTML + existingContent;
        flyCell.classList.add('fly');
    }
}

let expectedFinalPosition = null; // global

async function calculateRandomPath() {
    try {
        const steps = totalMoves;
        const response = await fetch(`http://localhost:8000/fly_route/?steps=${steps}`);
        const data = await response.json();

        moveQueue = data.directions.map(dir => dir.toLowerCase());
        flyPosition = {
            row: data.initial_position[0],
            col: data.initial_position[1]
        };
        expectedFinalPosition = {
            row: data.final_position[0],
            col: data.final_position[1]
        };

        currentMoveCount = 0;
        flyVisible = true;
        gameState = 'playing';
        isMoving = true;

        updateFly();
        executeNextMove();
    } catch (error) {
        console.error("Error fetching path:", error);
    }
}



function moveStepByStep() {
    if (isMoving || gameState !== 'playing') return;

    isMoving = true;
    startGameButton.style.display = 'none';
    calculateRandomPath();

function executeNextMove() {
        if (gameState !== 'playing' || moveQueue.length === 0) {
            flyVisible = false;
            updateFly();
            checkTarget();
            isMoving = false;
            return;
        }

        const nextMove = moveQueue.shift();
        const prevPosition = {...flyPosition };

        switch (nextMove) {
            case 'up':
                if (flyPosition.row > 0) flyPosition.row--;
                break;
            case 'down':
                if (flyPosition.row < gridSize - 1) flyPosition.row++;
                break;
            case 'left':
                if (flyPosition.col > 0) flyPosition.col--;
                break;
            case 'right':
                if (flyPosition.col < gridSize - 1) flyPosition.col++;
                break;
        }

        currentMoveCount++;
        movesLeft.textContent = `${translations[currentLanguage].movesLeft}${totalMoves - currentMoveCount}`;
        currentMove.textContent = `${translations[currentLanguage].currentMove}${nextMove} ${currentMoveCount}`;
        if (!soundOn) currentMove.style.display = 'block';

        updateFly();
        setTimeout(executeNextMove, moveDelay);
    }

    executeNextMove();
}

function checkTarget() {
    flyVisible = true;
    updateFly();

    const flyCell = dots[flyPosition.row * gridSize + flyPosition.col];
    const t = translations[currentLanguage];

    // Just compare with already stored final position from the backend
    if (
        flyPosition.row === expectedFinalPosition.row &&
        flyPosition.col === expectedFinalPosition.col
    ) {
        flyCell.classList.add('correct-cell');
        resultMessage.textContent = t.correct;

        currentScore += 10;

        // Update backend score
        fetch('http://127.0.0.1:8000/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ score: currentScore })
        });

        setRandomTargetPosition();  // or reset logic
        updateTarget();
    } else {
        flyCell.classList.add('incorrect-cell');
        resultMessage.textContent = t.incorrect;
        totalMoves--;
        movesLeft.textContent = `${t.movesLeft}${totalMoves}`;
    }

    resultMessage.style.display = 'block';
    restartButton.style.display = 'block';

    if (totalMoves <= 0) {
        gameState = 'ended';
    }
}



function handleCellClick(event) {}

function toggleSound() {
    soundOn = !soundOn;
    const t = translations[currentLanguage];
    soundButton.textContent = soundOn ? t.soundOn : t.soundOff;
    currentMove.style.display = soundOn ? 'none' : 'block';
    localStorage.setItem('flyGameSound', soundOn);
}

async function startGame(difficultyLevel) {
    try {
        // 1. Set difficulty on the backend
        await fetch(`http://127.0.0.1:8000/difficulty/${difficultyLevel}`, {
            method: 'POST'
        });

        // 2. Start the game on backend
        const response = await fetch('http://127.0.0.1:8000/play', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to start game from backend');
        }

        const data = await response.json();
        console.log("Game path from backend:", data.path);

        // 3. Frontend logic to begin game UI
        gameState = 'playing';
        currentMoveCount = 0;
        flyVisible = true;
        isMoving = false;
        moveQueue = [];

        createGrid(gridSize, difficultyLevel);
        movesLeft.textContent = `${translations[currentLanguage].movesLeft}${totalMoves}`;
        currentMove.textContent = translations[currentLanguage].currentMove;
        currentMove.style.display = soundOn ? 'none' : 'block';
        resultMessage.style.display = 'none';
        startGameButton.style.display = 'block';
        restartButton.style.display = 'none';

        difficultyScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        // 4. Use the backend-provided path (if needed)
        const path = data.path;
        // You can now use `path.route`, `path.directions`, `path.audio_urls`, etc.
        // Example:
        moveQueue = [...path.directions]; // or route, if you want to move based on grid positions

    } catch (error) {
        console.error("Error starting game:", error);
    }
}


function restartGame() {
    let difficultyLevel;
    switch (gridSize) {
        case 3:
            difficultyLevel = 'easy';
            break;
        case 4:
            difficultyLevel = 'normal';
            break;
        case 5:
            difficultyLevel = 'hard';
            break;
    }
    startGame(difficultyLevel);
}

function showInstructions() {
    instructionsScreen.style.display = 'flex';
    page1.style.display = 'block';
    page2.style.display = 'none';
    page3.style.display = 'none';
}

function hideInstructions() {
    instructionsScreen.style.display = 'none';
    page1.style.display = 'none';
    page2.style.display = 'none';
    page3.style.display = 'none';
}

page1.querySelector('.next-page').addEventListener('click', () => {
    page1.style.display = 'none';
    page2.style.display = 'block';
});

page2.querySelector('.next-page').addEventListener('click', () => {
    page2.style.display = 'none';
    page3.style.display = 'block';
});

page2.querySelector('.prev-page').addEventListener('click', () => {
    page2.style.display = 'none';
    page1.style.display = 'block';
});

page3.querySelector('.prev-page').addEventListener('click', () => {
    page3.style.display = 'none';
    page2.style.display = 'block';
});

document.querySelectorAll('.close-instructions').forEach(button => {
    button.addEventListener('click', hideInstructions);
});

function showDifficultyScreen() {
    homeScreen.style.display = 'none';
    difficultyScreen.style.display = 'block';
}

function showCustomSettingsScreen() {
    difficultyScreen.style.display = 'none';
    customSettingsScreen.style.display = 'block';
}

async function setDifficulty(level) {
    // Local difficulty variables
    switch (level) {
        case 'easy':
            difficulty = 3;
            totalMoves = 5;
            flySpeed = 0.5;
            gridSize = 3;
            break;
        case 'normal':
            difficulty = 5;
            totalMoves = 8;
            flySpeed = 1.0;
            gridSize = 4;
            break;
        case 'hard':
            difficulty = 7;
            totalMoves = 12;
            flySpeed = 1.5;
            gridSize = 5;
            break;
    }

    moveDelay = 1000 / flySpeed;

    const backendUrl = "http://127.0.0.1:8000"; // Adjust if needed

    try {
        // 1. Set difficulty on the backend
        const difficultyResponse = await fetch(`${backendUrl}/difficulty/${level}`, {
            method: 'POST'
        });

        if (!difficultyResponse.ok) {
            const errText = await difficultyResponse.text();
            throw new Error(`Difficulty error: ${errText}`);
        }

        // 2. Start the game and get path
        const playResponse = await fetch(`${backendUrl}/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!playResponse.ok) {
            const errText = await playResponse.text();
            throw new Error(`Play error: ${errText}`);
        }

        const gameData = await playResponse.json();

        console.log("Game path from backend:", gameData.path);

        // 3. Now start the frontend part
        gameState = 'playing';
        currentMoveCount = 0;
        flyVisible = true;
        isMoving = false;
        moveQueue = gameData.path.directions; // Get movement directions
        flyRoute = gameData.path.route;        // Optional: raw positions
        flyAudio = gameData.path.audio_urls;   // Optional: play these in sync

        createGrid(gridSize, level);
        movesLeft.textContent = `${translations[currentLanguage].movesLeft}${totalMoves}`;
        currentMove.textContent = translations[currentLanguage].currentMove;
        currentMove.style.display = soundOn ? 'none' : 'block';
        resultMessage.style.display = 'none';
        startGameButton.style.display = 'block';
        restartButton.style.display = 'none';

        difficultyScreen.style.display = 'none';
        gameScreen.style.display = 'block';

    } catch (error) {
        console.error("Error setting difficulty or starting game:", error);
        alert("Error starting game. Check console for details.");
    }
}


function cancelDifficulty() {
    difficultyScreen.style.display = 'none';
    homeScreen.style.display = 'block';
}

function backToDifficulty() {
    gameScreen.style.display = 'none';
    difficultyScreen.style.display = 'block';
}

function applyCustomSettings() {
    difficulty = parseInt(simplicityValue.textContent);
    totalMoves = parseInt(movesValue.textContent);
    flySpeed = parseFloat(speedValue.textContent);
    moveDelay = 1000 / flySpeed;
    gridSize = totalMoves > 10 ? 5 : totalMoves > 5 ? 4 : 3;
    let difficultyLevel = gridSize === 3 ? 'easy' : gridSize === 4 ? 'normal' : 'hard';
    startGame(difficultyLevel);
}

function updateSettingsValues() {
    document.querySelectorAll('.setting-controls').forEach(control => {
        const decreaseBtn = control.querySelector('.decrease');
        const increaseBtn = control.querySelector('.increase');
        const valueSpan = control.querySelector('span');

        decreaseBtn.addEventListener('click', () => {
            let value;
            if (valueSpan.id === 'speed-value') {
                value = parseFloat(valueSpan.textContent);
                value = Math.max(0.1, value - 0.1);
                valueSpan.textContent = value.toFixed(1);
            } else {
                value = parseInt(valueSpan.textContent);
                value = Math.max(1, value - 1);
                valueSpan.textContent = value;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let value;
            if (valueSpan.id === 'speed-value') {
                value = parseFloat(valueSpan.textContent);
                value = Math.min(2.0, value + 0.1);
                valueSpan.textContent = value.toFixed(1);
            } else {
                value = parseInt(valueSpan.textContent);
                value = Math.min(10, value + 1);
                valueSpan.textContent = value;
            }
        });
    });
}

function loadSavedSettings() {
    const savedLanguage = localStorage.getItem('flyGameLanguage');
    if (savedLanguage) currentLanguage = savedLanguage;

    soundOn = localStorage.getItem('flyGameSound') !== 'false';
    soundButton.textContent = soundOn ? translations[currentLanguage].soundOn : translations[currentLanguage].soundOff;

    updateLanguage();
}

playButton.addEventListener('click', showDifficultyScreen);
settingsButton.addEventListener('click', showCustomSettingsScreen);
exitButton.addEventListener('click', () => window.close());
customizeButton.addEventListener('click', showCustomSettingsScreen);
applySettingsButton.addEventListener('click', applyCustomSettings);
startGameButton.addEventListener('click', moveStepByStep);
restartButton.addEventListener('click', restartGame);
soundButton.addEventListener('click', toggleSound);
languageToggle.addEventListener('click', toggleLanguage);
helpButton.addEventListener('click', showInstructions);

document.getElementById('back-button').addEventListener('click', () => {
    difficultyScreen.style.display = 'none';
    homeScreen.style.display = 'block';
});

document.getElementById('easy-button').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('easy-button').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    cancelDifficulty();
});

document.getElementById('normal-button').addEventListener('click', () => setDifficulty('normal'));
document.getElementById('normal-button').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    cancelDifficulty();
});

document.getElementById('hard-button').addEventListener('click', () => setDifficulty('hard'));
document.getElementById('hard-button').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    cancelDifficulty();
});

document.getElementById('back-to-difficulty').addEventListener('click', backToDifficulty);

loadSavedSettings();