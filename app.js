// Game State
let gameState = {
    players: [],
    turnOrder: 'fixed',
    currentPlayerIndex: 0,
    currentTurnStartTime: null,
    playerTimes: {},
    totalGameTime: 0,
    isPaused: false,
    pauseStartTime: null,
    totalPauseTime: 0,
    gameStartTime: null,
    turnHistory: []
};

// Timer intervals
let turnTimerInterval = null;
let pauseTimerInterval = null;

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Setup Screen Functions
function initializeSetup() {
    document.getElementById('add-player').addEventListener('click', addPlayerInput);
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Initialize remove buttons for default players
    updateRemoveButtons();
    
    // Add event listeners to existing player inputs
    document.querySelectorAll('.player-name').forEach(input => {
        input.addEventListener('input', updateRemoveButtons);
    });
}

function addPlayerInput() {
    const playerList = document.getElementById('player-list');
    const playerCount = playerList.children.length;
    
    const playerInput = document.createElement('div');
    playerInput.className = 'player-input';
    playerInput.innerHTML = `
        <input type="text" placeholder="Player ${playerCount + 1}" class="player-name" data-player-index="${playerCount}">
        <button class="remove-player" aria-label="Remove player">×</button>
    `;
    
    playerList.appendChild(playerInput);
    
    // Add event listeners
    const input = playerInput.querySelector('.player-name');
    const removeBtn = playerInput.querySelector('.remove-player');
    
    input.addEventListener('input', updateRemoveButtons);
    removeBtn.addEventListener('click', () => removePlayerInput(playerInput));
    
    updateRemoveButtons();
    input.focus();
}

function removePlayerInput(playerElement) {
    playerElement.remove();
    updatePlayerPlaceholders();
    updateRemoveButtons();
}

function updatePlayerPlaceholders() {
    const inputs = document.querySelectorAll('.player-name');
    inputs.forEach((input, index) => {
        input.placeholder = `Player ${index + 1}`;
        input.dataset.playerIndex = index;
    });
}

function updateRemoveButtons() {
    const playerInputs = document.querySelectorAll('.player-input');
    const hasMoreThanTwo = playerInputs.length > 2;
    
    playerInputs.forEach((playerInput, index) => {
        const removeBtn = playerInput.querySelector('.remove-player');
        if (!removeBtn.hasEventListener) {
            removeBtn.addEventListener('click', () => removePlayerInput(playerInput));
            removeBtn.hasEventListener = true;
        }
        removeBtn.style.display = hasMoreThanTwo ? 'block' : 'none';
    });
}

function getPlayers() {
    const playerInputs = document.querySelectorAll('.player-name');
    const players = [];
    
    playerInputs.forEach((input, index) => {
        const name = input.value.trim() || input.placeholder;
        players.push({ name, index });
    });
    
    return players;
}

function startGame() {
    const players = getPlayers();
    if (players.length < 2) {
        alert('Please enter at least 2 players');
        return;
    }
    
    // Initialize game state
    gameState.players = players;
    gameState.turnOrder = document.querySelector('input[name="turn-order"]:checked').value;
    gameState.currentPlayerIndex = 0;
    gameState.gameStartTime = Date.now();
    
    // Initialize player times
    players.forEach(player => {
        gameState.playerTimes[player.name] = 0;
    });
    
    // Start the game
    showScreen('game-screen');
    startTurn();
}

// Game Screen Functions
function initializeGame() {
    document.getElementById('next-player').addEventListener('click', nextPlayer);
    document.getElementById('pause-game').addEventListener('click', pauseGame);
    document.getElementById('resume-game').addEventListener('click', resumeGame);
    document.getElementById('end-game').addEventListener('click', endGame);
}

function startTurn() {
    gameState.currentTurnStartTime = Date.now();
    updateCurrentPlayerDisplay();
    startTurnTimer();
}

function updateCurrentPlayerDisplay() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('current-player-name').textContent = currentPlayer.name;
}

function startTurnTimer() {
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    
    turnTimerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            const elapsed = Date.now() - gameState.currentTurnStartTime;
            updateTimerDisplay('turn-timer', elapsed);
        }
    }, 100);
}

function updateTimerDisplay(elementId, milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById(elementId).textContent = display;
}

function nextPlayer() {
    if (gameState.isPaused) return;
    
    // Record turn time
    const turnTime = Date.now() - gameState.currentTurnStartTime;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    gameState.playerTimes[currentPlayer.name] += turnTime;
    
    // Add to turn history
    gameState.turnHistory.push({
        player: currentPlayer.name,
        duration: turnTime,
        timestamp: Date.now()
    });
    
    // Update total game time
    gameState.totalGameTime += turnTime;
    
    // Update percentages
    updatePlayerPercentages();
    
    // Move to next player based on turn order
    if (gameState.turnOrder === 'fixed' || gameState.turnOrder === 'round') {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    } else if (gameState.turnOrder === 'flexible') {
        // For MVP, just cycle through - later we'll add player selection
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }
    
    // Start new turn
    startTurn();
}

function updatePlayerPercentages() {
    const percentagesDiv = document.getElementById('player-percentages');
    percentagesDiv.innerHTML = '';
    
    gameState.players.forEach(player => {
        const time = gameState.playerTimes[player.name];
        const percentage = gameState.totalGameTime > 0 ? (time / gameState.totalGameTime * 100).toFixed(1) : 0;
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-percentage';
        playerDiv.innerHTML = `
            <div class="name">${player.name}</div>
            <div class="stats">
                <span>${minutes}:${seconds.toString().padStart(2, '0')}</span>
                <div class="percentage-bar">
                    <div class="percentage-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${percentage}%</span>
            </div>
        `;
        
        percentagesDiv.appendChild(playerDiv);
    });
}

function pauseGame() {
    gameState.isPaused = true;
    gameState.pauseStartTime = Date.now();
    
    // Stop turn timer
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    
    // Show pause overlay
    document.getElementById('pause-overlay').style.display = 'flex';
    
    // Start pause timer
    pauseTimerInterval = setInterval(() => {
        const elapsed = Date.now() - gameState.pauseStartTime;
        updateTimerDisplay('pause-timer', elapsed);
    }, 100);
}

function resumeGame() {
    const pauseDuration = Date.now() - gameState.pauseStartTime;
    gameState.totalPauseTime += pauseDuration;
    gameState.isPaused = false;
    
    // Hide pause overlay
    document.getElementById('pause-overlay').style.display = 'none';
    
    // Stop pause timer
    if (pauseTimerInterval) clearInterval(pauseTimerInterval);
    
    // Resume turn timer
    startTurnTimer();
}

function endGame() {
    // Stop any active turn
    if (!gameState.isPaused) {
        const turnTime = Date.now() - gameState.currentTurnStartTime;
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        gameState.playerTimes[currentPlayer.name] += turnTime;
        gameState.totalGameTime += turnTime;
    }
    
    // Stop timers
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    if (pauseTimerInterval) clearInterval(pauseTimerInterval);
    
    // Save game to history
    saveGameToHistory();
    
    // Show summary
    showSummary();
}

// Summary Screen Functions
function showSummary() {
    showScreen('summary-screen');
    
    const summaryContent = document.getElementById('summary-content');
    const totalMinutes = Math.floor(gameState.totalGameTime / 60000);
    const totalSeconds = Math.floor((gameState.totalGameTime % 60000) / 1000);
    
    let html = `
        <div class="summary-stat">
            <h3>Total Game Time</h3>
            <div class="total-time">${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}</div>
        </div>
        
        <div class="summary-stat">
            <h3>Player Times</h3>
    `;
    
    // Sort players by time
    const sortedPlayers = [...gameState.players].sort((a, b) => 
        gameState.playerTimes[b.name] - gameState.playerTimes[a.name]
    );
    
    sortedPlayers.forEach(player => {
        const time = gameState.playerTimes[player.name];
        const percentage = (time / gameState.totalGameTime * 100).toFixed(1);
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        
        html += `
            <div class="player-summary">
                <span>${player.name}</span>
                <span>${minutes}:${seconds.toString().padStart(2, '0')} (${percentage}%)</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (gameState.totalPauseTime > 0) {
        const pauseMinutes = Math.floor(gameState.totalPauseTime / 60000);
        const pauseSeconds = Math.floor((gameState.totalPauseTime % 60000) / 1000);
        html += `
            <div class="summary-stat">
                <h3>Admin Time</h3>
                <div>${pauseMinutes}:${pauseSeconds.toString().padStart(2, '0')}</div>
            </div>
        `;
    }
    
    summaryContent.innerHTML = html;
}

function initializeSummary() {
    document.getElementById('new-game').addEventListener('click', () => {
        resetGame();
        showScreen('setup-screen');
    });
    
    document.getElementById('view-history').addEventListener('click', () => {
        showHistory();
    });
}

// History Functions
function saveGameToHistory() {
    const gameData = {
        id: Date.now(),
        date: new Date().toISOString(),
        players: gameState.players.map(p => p.name),
        totalTime: gameState.totalGameTime,
        playerTimes: { ...gameState.playerTimes },
        pauseTime: gameState.totalPauseTime,
        turnOrder: gameState.turnOrder,
        turnHistory: [...gameState.turnHistory]
    };
    
    // Get existing history
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    
    // Add new game
    history.unshift(gameData);
    
    // Keep only last 50 games
    if (history.length > 50) {
        history.length = 50;
    }
    
    // Save back to localStorage
    localStorage.setItem('gameHistory', JSON.stringify(history));
}

function showHistory() {
    showScreen('history-screen');
    
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p>No games recorded yet.</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach(game => {
        const date = new Date(game.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const totalMinutes = Math.floor(game.totalTime / 60000);
        const totalSeconds = Math.floor((game.totalTime % 60000) / 1000);
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-date">${dateStr}</div>
            <div class="history-players">${game.players.join(', ')}</div>
            <div class="history-duration">Duration: ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}</div>
        `;
        
        historyItem.addEventListener('click', () => showGameDetails(game));
        historyList.appendChild(historyItem);
    });
}

function showGameDetails(game) {
    // For MVP, just show in an alert - later we can create a dedicated detail view
    let details = `Game from ${new Date(game.date).toLocaleString()}\n\n`;
    details += `Players: ${game.players.join(', ')}\n`;
    details += `Turn Order: ${game.turnOrder}\n\n`;
    
    Object.entries(game.playerTimes).forEach(([player, time]) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const percentage = (time / game.totalTime * 100).toFixed(1);
        details += `${player}: ${minutes}:${seconds.toString().padStart(2, '0')} (${percentage}%)\n`;
    });
    
    alert(details);
}

function initializeHistory() {
    document.getElementById('back-to-setup').addEventListener('click', () => {
        showScreen('setup-screen');
    });
}

// Reset game state
function resetGame() {
    gameState = {
        players: [],
        turnOrder: 'fixed',
        currentPlayerIndex: 0,
        currentTurnStartTime: null,
        playerTimes: {},
        totalGameTime: 0,
        isPaused: false,
        pauseStartTime: null,
        totalPauseTime: 0,
        gameStartTime: null,
        turnHistory: []
    };
    
    // Clear timers
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    if (pauseTimerInterval) clearInterval(pauseTimerInterval);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeSetup();
    initializeGame();
    initializeSummary();
    initializeHistory();
    
    // Show setup screen by default
    showScreen('setup-screen');
});