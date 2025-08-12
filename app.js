/**
 * Farcaster 2048 Mini App
 * Complete game implementation with Farcaster integration
 */

class Game2048 {
    constructor() {
        // Game state
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048Score') || '0');
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
        
        // Touch handling variables
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        this.init();
    }
    
    init() {
        // Initialize the game board grid cells
        this.createGrid();
        
        // Start a new game
        this.newGame();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update best score display
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    createGrid() {
        // Create the visual grid cells (background)
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gameBoard.appendChild(cell);
        }
    }
    
    newGame() {
        // Reset game state
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.hasWon = false;
        
        // Clear tiles
        this.tileContainer.innerHTML = '';
        
        // Add two initial tiles
        this.addNewTile();
        this.addNewTile();
        
        // Update display
        this.updateDisplay();
        
        // Hide modal if shown
        this.gameOverModal.classList.add('hidden');
    }
    
    addNewTile() {
        // Find empty cells
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        // Choose random empty cell
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 90% chance of 2, 10% chance of 4
        const value = Math.random() < 0.9 ? 2 : 4;
        this.board[randomCell.row][randomCell.col] = value;
        
        // Create tile element with animation
        this.createTileElement(randomCell.row, randomCell.col, value, true);
        
        return true;
    }
    
    createTileElement(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}${isNew ? ' new' : ''}`;
        tile.textContent = value;
        
        // Calculate position
        const size = (100 / this.size);
        tile.style.left = `${col * size}%`;
        tile.style.top = `${row * size}%`;
        
        this.tileContainer.appendChild(tile);
        
        // Remove animation class after animation completes
        if (isNew) {
            setTimeout(() => tile.classList.remove('new'), 200);
        }
    }
    
    updateDisplay() {
        // Update score
        this.scoreElement.textContent = this.score;
        
        // Update best score if needed
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('best2048Score', this.bestScore.toString());
        }
        
        // Redraw all tiles
        this.tileContainer.innerHTML = '';
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== 0) {
                    this.createTileElement(row, col, this.board[row][col]);
                }
            }
        }
    }
    
    move(direction) {
        if (this.isGameOver) return;
        
        const previousBoard = this.board.map(row => [...row]);
        let moved = false;
        
        // Rotate board to always process left-to-right
        const rotated = this.rotateBoard(direction);
        
        // Process each row
        for (let row = 0; row < this.size; row++) {
            const processed = this.processRow(rotated[row]);
            if (JSON.stringify(processed) !== JSON.stringify(rotated[row])) {
                moved = true;
            }
            rotated[row] = processed;
        }
        
        // Rotate back
        this.board = this.rotateBack(rotated, direction);
        
        if (moved) {
            // Add new tile after move
            setTimeout(() => {
                this.addNewTile();
                this.updateDisplay();
                
                // Check for game over or win
                if (this.checkWin()) {
                    this.showGameOver(true);
                } else if (this.checkGameOver()) {
                    this.showGameOver(false);
                }
            }, 150);
            
            this.updateDisplay();
        }
    }
    
    processRow(row) {
        // Remove zeros and shift left
        let newRow = row.filter(val => val !== 0);
        
        // Merge adjacent equal tiles
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                this.score += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        
        // Pad with zeros
        while (newRow.length < this.size) {
            newRow.push(0);
        }
        
        return newRow;
    }
    
    rotateBoard(direction) {
        const rotated = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        switch (direction) {
            case 'left':
                return this.board.map(row => [...row]);
            
            case 'right':
                return this.board.map(row => [...row].reverse()).map(row => {
                    const processed = row;
                    return processed.reverse();
                });
            
            case 'up':
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        rotated[row][col] = this.board[col][row];
                    }
                }
                return rotated;
            
            case 'down':
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        rotated[row][col] = this.board[this.size - 1 - col][row];
                    }
                }
                return rotated;
        }
    }
    
    rotateBack(board, direction) {
        const rotated = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        switch (direction) {
            case 'left':
                return board;
            
            case 'right':
                return board.map(row => {
                    const processed = [...row].reverse();
                    return processed.reverse();
                });
            
            case 'up':
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        rotated[row][col] = board[col][row];
                    }
                }
                return rotated;
            
            case 'down':
                for (let row = 0; row < this.size; row++) {
                    for (let col = 0; col < this.size; col++) {
                        rotated[row][col] = board[col][this.size - 1 - row];
                    }
                }
                return rotated;
        }
    }
    
    checkWin() {
        // Check if any tile is 2048
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 2048 && !this.hasWon) {
                    this.hasWon = true;
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) return false;
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.board[row][col];
                
                // Check right neighbor
                if (col < this.size - 1 && this.board[row][col + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < this.size - 1 && this.board[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        this.isGameOver = true;
        return true;
    }
    
    getHighestTile() {
        let highest = 0;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                highest = Math.max(highest, this.board[row][col]);
            }
        }
        return highest;
    }
    
    showGameOver(won) {
        const modal = this.gameOverModal;
        const title = document.getElementById('game-over-title');
        const finalScore = document.getElementById('final-score');
        const highestTile = document.getElementById('highest-tile');
        
        title.textContent = won ? 'You Win!' : 'Game Over!';
        finalScore.textContent = this.score;
        highestTile.textContent = this.getHighestTile();
        
        modal.classList.remove('hidden');
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.move('left');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.move('right');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.move('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.move('down');
            }
        });
        
        // Touch controls for mobile
        this.gameBoard.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });
        
        this.gameBoard.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            
            this.handleSwipe();
        });
        
        // Button controls
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        
        // Farcaster share button
        this.shareFarcasterBtn.addEventListener('click', () => this.shareToFarcaster());
    }
    
    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.move('right');
                } else {
                    // Final fallback: show message for manual copying
                    const textArea = document.createElement('textarea');
                    textArea.value = message;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    statusElement.textContent = '✓ Score copied to clipboard!';
                    statusElement.classList.add('success');
                }
            }
        } catch (error) {
            console.error('Share failed:', error);
            statusElement.textContent = '✗ Share failed. Please try again.';
            statusElement.classList.add('error');
        }
        
        // Hide status after 3 seconds
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});this.move('left');
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        }
        
        // Reset touch positions
        this.touchStartX = 0;
        this.touchStartY = 0;
    }
    
    async shareToFarcaster() {
        const score = this.score;
        const highestTile = this.getHighestTile();
        const message = `🎮 I scored ${score} points in Farcaster 2048! My highest tile was ${highestTile}. Can you beat me? Play at ${window.location.href}`;
        
        const statusElement = document.getElementById('share-status');
        statusElement.classList.remove('hidden', 'success', 'error');
        
        try {
            // Check if we're in a Farcaster client (Warpcast)
            if (window.parent !== window) {
                // Try to post via Farcaster client API
                // NOTE: Replace this with actual Farcaster SDK/API call
                // For production, you'd use the Farcaster Connect SDK or Warpcast API
                
                /**
                 * MOCK FARCASTER API CALL
                 * In production, replace with:
                 * 
                 * const farcasterClient = new FarcasterClient();
                 * await farcasterClient.cast({
                 *   text: message,
                 *   embeds: [{
                 *     url: window.location.href
                 *   }]
                 * });
                 */
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // For demo: attempt to communicate with parent frame
                window.parent.postMessage({
                    type: 'farcaster-share',
                    data: {
                        text: message,
                        embeds: [{ url: window.location.href }]
                    }
                }, '*');
                
                statusElement.textContent = '✓ Posted to Farcaster!';
                statusElement.classList.add('success');
            } else {
                // Fallback: Use Web Share API or copy to clipboard
                if (navigator.share) {
                    await navigator.share({
                        title: 'Farcaster 2048 Score',
                        text: message,
                        url: window.location.href
                    });
                    
                    statusElement.textContent = '✓ Shared successfully!';
                    statusElement.classList.add('success');
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(message);
                    
                    statusElement.textContent = '✓ Score copied to clipboard!';
                    statusElement.classList.add('success');
                } else {
                    
