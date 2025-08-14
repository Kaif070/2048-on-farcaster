/**
 * Farcaster 2048 Mini App - Fixed Version with Memory Storage
 */

class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        // Use memory storage instead of localStorage for compatibility
        this.bestScore = this.getBestScore();
        this.size = 4;
        this.isGameOver = false;
        this.hasWon = false;

        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.shareFarcasterBtn = document.getElementById('share-farcaster-btn');
        this.statusElement = document.getElementById('share-status');

        // Touch vars
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;

        this.init();
    }

    // Memory-based storage methods
    getBestScore() {
        try {
            return parseInt(localStorage.getItem('best2048Score') || '0');
        } catch (e) {
            // Fallback to memory storage if localStorage isn't available
            return window._game2048BestScore || 0;
        }
    }

    setBestScore(score) {
        try {
            localStorage.setItem('best2048Score', score.toString());
        } catch (e) {
            // Fallback to memory storage
            window._game2048BestScore = score;
        }
    }

    init() {
        this.createGrid();
        this.newGame();
        this.setupEventListeners();
        this.bestScoreElement.textContent = this.bestScore;
        
        // Call ready after game is initialized
        this.callFarcasterReady();
    }

    callFarcasterReady() {
        // Multiple attempts to call ready
        const readyMethods = [
            () => window.sdk?.actions?.ready(),
            () => window.farcaster?.actions?.ready(),
            () => window.farcaster?.mini?.actions?.ready(),
            () => window.__warpcast__?.miniApp?.actions?.ready(),
            () => window.actions?.ready(),
            () => window.FarcasterSDK?.actions?.ready()
        ];

        let readyCalled = false;
        
        for (const method of readyMethods) {
            try {
                if (typeof method === 'function' && method()) {
                    console.log('Farcaster ready called successfully');
                    readyCalled = true;
                    break;
                }
            } catch (e) {
                // Continue to next method
            }
        }

        // Fallback postMessage
        if (!readyCalled) {
            try {
                window.parent?.postMessage({ type: 'mini-app:ready' }, '*');
                window.parent?.postMessage({ type: 'farcaster-mini-app-ready' }, '*');
            } catch (e) {
                console.log('PostMessage ready fallback attempted');
            }
        }
    }

    createGrid() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gameBoard.appendChild(cell);
        }
    }

    newGame() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.hasWon = false;
        this.tileContainer.innerHTML = '';
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
        this.gameOverModal.classList.add('hidden');
    }

    addNewTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) emptyCells.push({ row: r, col: c });
            }
        }
        if (!emptyCells.length) return false;
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.board[randomCell.row][randomCell.col] = value;
        this.createTileElement(randomCell.row, randomCell.col, value, true);
        return true;
    }

    createTileElement(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}${isNew ? ' new' : ''}`;
        tile.textContent = value;
        const size = (100 / this.size);
        tile.style.left = `${col * size}%`;
        tile.style.top = `${row * size}%`;
        this.tileContainer.appendChild(tile);
        if (isNew) setTimeout(() => tile.classList.remove('new'), 200);
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            this.setBestScore(this.bestScore);
        }
        this.tileContainer.innerHTML = '';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] !== 0) {
                    this.createTileElement(r, c, this.board[r][c]);
                }
            }
        }
    }

    move(direction) {
        if (this.isGameOver) return;
        let moved = false;
        const rotated = this.rotateBoard(direction);
        for (let r = 0; r < this.size; r++) {
            const processed = this.processRow(rotated[r]);
            if (JSON.stringify(processed) !== JSON.stringify(rotated[r])) moved = true;
            rotated[r] = processed;
        }
        this.board = this.rotateBack(rotated, direction);
        if (moved) {
            setTimeout(() => {
                this.addNewTile();
                this.updateDisplay();
                if (this.checkWin()) this.showGameOver(true);
                else if (this.checkGameOver()) this.showGameOver(false);
            }, 150);
            this.updateDisplay();
        }
    }

    processRow(row) {
        let newRow = row.filter(val => val !== 0);
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                this.score += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        while (newRow.length < this.size) newRow.push(0);
        return newRow;
    }

    rotateBoard(direction) {
        const rotated = Array(this.size).fill().map(() => Array(this.size).fill(0));
        if (direction === 'left') return this.board.map(row => [...row]);
        if (direction === 'right') return this.board.map(row => [...row].reverse());
        if (direction === 'up') {
            for (let r = 0; r < this.size; r++)
                for (let c = 0; c < this.size; c++)
                    rotated[r][c] = this.board[c][r];
            return rotated;
        }
        if (direction === 'down') {
            for (let r = 0; r < this.size; r++)
                for (let c = 0; c < this.size; c++)
                    rotated[r][c] = this.board[this.size - 1 - c][r];
            return rotated;
        }
    }

    rotateBack(board, direction) {
        const rotated = Array(this.size).fill().map(() => Array(this.size).fill(0));
        if (direction === 'left') return board;
        if (direction === 'right') return board.map(row => [...row].reverse());
        if (direction === 'up') {
            for (let r = 0; r < this.size; r++)
                for (let c = 0; c < this.size; c++)
                    rotated[r][c] = board[c][r];
            return rotated;
        }
        if (direction === 'down') {
            for (let r = 0; r < this.size; r++)
                for (let c = 0; c < this.size; c++)
                    rotated[r][c] = board[c][this.size - 1 - r];
            return rotated;
        }
    }

    checkWin() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                if (this.board[r][c] === 2048 && !this.hasWon) {
                    this.hasWon = true;
                    return true;
                }
        return false;
    }

    checkGameOver() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                if (this.board[r][c] === 0) return false;
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++) {
                const current = this.board[r][c];
                if (c < this.size - 1 && this.board[r][c + 1] === current) return false;
                if (r < this.size - 1 && this.board[r + 1][c] === current) return false;
            }
        this.isGameOver = true;
        return true;
    }

    getHighestTile() {
        let highest = 0;
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                highest = Math.max(highest, this.board[r][c]);
        return highest;
    }

    showGameOver(won) {
        const title = document.getElementById('game-over-title');
        const finalScore = document.getElementById('final-score');
        const highestTile = document.getElementById('highest-tile');
        title.textContent = won ? 'You Win!' : 'Game Over!';
        finalScore.textContent = this.score;
        highestTile.textContent = this.getHighestTile();
        this.gameOverModal.classList.remove('hidden');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.move('left'); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); this.move('right'); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); this.move('up'); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); this.move('down'); }
        });

        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe();
        });

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        this.shareFarcasterBtn.addEventListener('click', () => this.shareToFarcaster());
    }

    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) this.move('right');
                else this.move('left');
            }
        } else {
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) this.move('down');
                else this.move('up');
            }
        }
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    async shareToFarcaster() {
        const score = this.score;
        const highestTile = this.getHighestTile();
        const message = `🎮 I scored ${score} points in Farcaster 2048! My highest tile was ${highestTile}. Can you beat me? Play at ${window.location.href}`;
        
        this.statusElement.classList.remove('hidden', 'success', 'error');
        
        try {
            // Try Farcaster SDK first
            if (window.sdk?.actions?.share) {
                await window.sdk.actions.share({
                    text: message,
                    embeds: [{ url: window.location.href }]
                });
                this.statusElement.textContent = '✓ Posted to Farcaster!';
                this.statusElement.classList.add('success');
                return;
            }

            // Try Farcaster parent window communication
            if (window.parent !== window) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.parent.postMessage({
                    type: 'farcaster-share',
                    data: { text: message, embeds: [{ url: window.location.href }] }
                }, '*');
                this.statusElement.textContent = '✓ Posted to Farcaster!';
                this.statusElement.classList.add('success');
            } else if (navigator.share) {
                await navigator.share({ 
                    title: 'Farcaster 2048 Score', 
                    text: message, 
                    url: window.location.href 
                });
                this.statusElement.textContent = '✓ Shared successfully!';
                this.statusElement.classList.add('success');
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(message);
                this.statusElement.textContent = '✓ Score copied to clipboard!';
                this.statusElement.classList.add('success');
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = message;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.statusElement.textContent = '✓ Score copied to clipboard!';
                this.statusElement.classList.add('success');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.statusElement.textContent = '✗ Share failed. Please try again.';
            this.statusElement.classList.add('error');
        }
        
        setTimeout(() => { 
            this.statusElement.classList.add('hidden'); 
        }, 3000);
    }
}

// Boot game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});

// Additional ready call after game is loaded
window.addEventListener('load', () => {
    // Final attempt to call ready
    setTimeout(() => {
        try {
            if (window.sdk?.actions?.ready && typeof window.sdk.actions.ready === 'function') {
                window.sdk.actions.ready();
                console.log('Final ready call attempted');
            }
        } catch (e) {
            console.log('Final ready call failed:', e);
        }
    }, 500);
});
