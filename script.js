// 遊戲設置
let gameSettings = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

// 遊戲狀態
let gameState = {
    board: [],
    mineLocations: [],
    rows: 0,
    cols: 0,
    mines: 0,
    minesLeft: 0,
    revealedCells: 0,
    totalCells: 0,
    gameStarted: false,
    gameOver: false,
    timer: 0,
    timerInterval: null,
    firstClick: true
};

// 音效元素
const clickSound = document.getElementById('click-sound');
const explosionSound = document.getElementById('explosion-sound');
const victorySound = document.getElementById('victory-sound');
const backgroundMusic = new Audio('sounds/background_music.mp3');

// DOM 元素
const gameMenu = document.getElementById('game-menu');
const gameContainer = document.getElementById('game-container');
const gameBoard = document.getElementById('game-board');
const gameOver = document.getElementById('game-over');
const minesCount = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const resultMessage = document.getElementById('result-message');
const finalTime = document.getElementById('final-time');

// 難度按鈕事件監聽
document.getElementById('beginner').addEventListener('click', () => startGame('beginner'));
document.getElementById('intermediate').addEventListener('click', () => startGame('intermediate'));
document.getElementById('expert').addEventListener('click', () => startGame('expert'));
document.getElementById('restart-btn').addEventListener('click', showMenu);
document.getElementById('play-again-btn').addEventListener('click', showMenu);

// 開始遊戲
function startGame(difficulty) {
    // 設置遊戲參數
    gameState.rows = gameSettings[difficulty].rows;
    gameState.cols = gameSettings[difficulty].cols;
    gameState.mines = gameSettings[difficulty].mines;
    gameState.minesLeft = gameState.mines;
    gameState.totalCells = gameState.rows * gameState.cols;
    gameState.revealedCells = 0;
    gameState.gameStarted = true;
    gameState.gameOver = false;
    gameState.firstClick = true;
    gameState.timer = 0;
    
    // 更新 UI
    minesCount.textContent = gameState.minesLeft;
    timerElement.textContent = '0';
    
    // 顯示遊戲區域
    gameMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameOver.classList.add('hidden');
    
    // 播放背景音樂
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // 設置適當的音量
    backgroundMusic.play().catch(error => {
        console.log('背景音樂播放失敗:', error);
    });
    
    // 創建遊戲板
    createBoard();
}

// 創建遊戲板
function createBoard() {
    // 清空遊戲板
    gameBoard.innerHTML = '';
    gameState.board = [];
    
    // 設置 CSS 變數以控制網格列數
    gameBoard.style.setProperty('--cols', gameState.cols);
    
    // 創建格子
    for (let row = 0; row < gameState.rows; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < gameState.cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 添加點擊事件
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            
            // 添加觸控事件（長按標記地雷）
            let touchTimeout;
            cell.addEventListener('touchstart', function(e) {
                touchTimeout = setTimeout(function() {
                    e.preventDefault();
                    handleRightClick(e);
                }, 500);
            });
            
            cell.addEventListener('touchend', function() {
                clearTimeout(touchTimeout);
            });
            
            cell.addEventListener('touchmove', function() {
                clearTimeout(touchTimeout);
            });
            
            // 添加到遊戲板
            gameBoard.appendChild(cell);
            
            // 初始化格子狀態
            gameState.board[row][col] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                element: cell
            };
        }
    }
}

// 生成地雷
function generateMines(firstRow, firstCol) {
    gameState.mineLocations = [];
    
    // 確保首次點擊不是地雷
    const safeArea = [];
    for (let r = Math.max(0, firstRow - 1); r <= Math.min(gameState.rows - 1, firstRow + 1); r++) {
        for (let c = Math.max(0, firstCol - 1); c <= Math.min(gameState.cols - 1, firstCol + 1); c++) {
            safeArea.push(`${r},${c}`);
        }
    }
    
    // 隨機放置地雷
    let minesPlaced = 0;
    while (minesPlaced < gameState.mines) {
        const row = Math.floor(Math.random() * gameState.rows);
        const col = Math.floor(Math.random() * gameState.cols);
        const key = `${row},${col}`;
        
        // 確保不在安全區域內且不重複放置
        if (!safeArea.includes(key) && !gameState.mineLocations.includes(key)) {
            gameState.mineLocations.push(key);
            gameState.board[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // 計算每個格子周圍的地雷數
    calculateNeighborMines();
}

// 計算每個格子周圍的地雷數
function calculateNeighborMines() {
    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            if (gameState.board[row][col].isMine) continue;
            
            let count = 0;
            // 檢查周圍8個格子
            for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    if (gameState.board[r][c].isMine) count++;
                }
            }
            
            gameState.board[row][col].neighborMines = count;
        }
    }
}

// 處理格子點擊
function handleCellClick(e) {
    if (gameState.gameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // 如果已標記或已揭開，不做任何操作
    if (cell.isFlagged || cell.isRevealed) return;
    
    // 首次點擊
    if (gameState.firstClick) {
        gameState.firstClick = false;
        generateMines(row, col);
        startTimer();
    }
    
    // 播放點擊音效
    playSound(clickSound);
    
    // 如果點到地雷，遊戲結束
    if (cell.isMine) {
        revealMines();
        endGame(false);
        return;
    }
    
    // 揭開格子
    revealCell(row, col);
    
    // 檢查是否獲勝
    checkWin();
}

// 處理右鍵點擊（標記地雷）
function handleRightClick(e) {
    e.preventDefault();
    
    if (gameState.gameOver || gameState.firstClick) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // 如果已揭開，不做任何操作
    if (cell.isRevealed) return;
    
    // 切換標記狀態
    cell.isFlagged = !cell.isFlagged;
    cell.element.classList.toggle('flagged');
    
    // 更新剩餘地雷數
    gameState.minesLeft += cell.isFlagged ? -1 : 1;
    minesCount.textContent = gameState.minesLeft;
    
    // 播放點擊音效
    playSound(clickSound);
}

// 揭開格子
function revealCell(row, col) {
    const cell = gameState.board[row][col];
    
    // 如果已揭開或已標記，不做任何操作
    if (cell.isRevealed || cell.isFlagged) return;
    
    // 標記為已揭開
    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    gameState.revealedCells++;
    
    // 如果周圍有地雷，顯示數字
    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.dataset.number = cell.neighborMines;
    } else {
        // 如果周圍沒有地雷，自動揭開周圍的格子
        for (let r = Math.max(0, row - 1); r <= Math.min(gameState.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gameState.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                revealCell(r, c);
            }
        }
    }
}

// 揭開所有地雷
function revealMines() {
    // 播放爆炸音效
    playSound(explosionSound);
    
    for (const location of gameState.mineLocations) {
        const [row, col] = location.split(',').map(Number);
        const cell = gameState.board[row][col];
        
        cell.element.classList.add('revealed', 'mine');
        cell.element.textContent = '💣';
    }
}

// 檢查是否獲勝
function checkWin() {
    if (gameState.revealedCells === gameState.totalCells - gameState.mines) {
        endGame(true);
    }
}

// 結束遊戲
function endGame(isWin) {
    gameState.gameOver = true;
    stopTimer();
    
    // 停止背景音樂
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    
    // 更新結果訊息
    resultMessage.textContent = isWin ? '恭喜你獲勝了！' : '很遺憾，你踩到地雷了！';
    finalTime.textContent = gameState.timer;
    
    // 播放音效
    if (isWin) {
        playSound(victorySound);
    }
    
    // 顯示結果畫面
    setTimeout(() => {
        gameContainer.classList.add('hidden');
        gameOver.classList.remove('hidden');
    }, 1500);
}

// 開始計時
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerElement.textContent = gameState.timer;
    }, 1000);
}

// 停止計時
function stopTimer() {
    clearInterval(gameState.timerInterval);
}

// 返回主菜單
function showMenu() {
    stopTimer();
    gameContainer.classList.add('hidden');
    gameOver.classList.add('hidden');
    gameMenu.classList.remove('hidden');
}

// 播放音效
function playSound(sound) {
    // 重置音效以便重複播放
    sound.currentTime = 0;
    sound.play().catch(error => {
        // 處理瀏覽器可能阻止自動播放的情況
        console.log('音效播放失敗:', error);
    });
}

// 防止右鍵菜單
gameBoard.addEventListener('contextmenu', e => e.preventDefault());

// 添加觸控支援
document.addEventListener('touchstart', function() {
    // 空函數，用於啟用觸控事件
}, false);