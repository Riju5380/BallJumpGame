document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const bird = document.getElementById('bird');
    const block = document.getElementById('block');
    const hole = document.getElementById('hole');
    const scoreElement = document.querySelector('#score span');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScore = document.getElementById('final-score');
    const jumpButton = document.getElementById('jump-button');
    
    // Make sure jump button is visible on mobile
    if (window.innerWidth <= 768) {
        jumpButton.style.display = 'block';
    }
    
    // Demo elements
    const demoBird = document.getElementById('demo-bird');
    const demoPipe = document.querySelector('.demo-pipe');
    const demoHole = document.querySelector('.demo-hole');
    const demoText1 = document.getElementById('demo-text-1');
    const demoText2 = document.getElementById('demo-text-2');
    const demoText3 = document.getElementById('demo-text-3');

    let jumping = false;
    let gravity = 0.25;
    let score = 0;
    let isGameOver = false;
    let gameStarted = false;
    let birdPos = 100;
    let fallSpeed = 0;

    // Hide the game over screen initially
    gameOverScreen.style.display = 'none';
    block.style.animation = 'none';
    hole.style.animation = 'none';

    // Show demo elements
    function showDemo() {
        demoBird.style.display = 'block';
        demoPipe.style.display = 'block';
        demoHole.style.display = 'block';
        demoText1.style.display = 'block';
        demoText2.style.display = 'block';
        demoText3.style.display = 'block';

        // Position demo elements
        demoBird.style.top = '200px';
        demoPipe.style.right = '200px';
        demoHole.style.right = '200px';
        
        // Position demo hole in the middle of the game
        const gameHeight = game.offsetHeight;
        demoHole.style.top = (gameHeight / 2 - 150) + 'px'; // Center the 300px hole

        // Position demo text
        demoText1.style.top = '50px';
        demoText1.style.left = '50%';
        demoText1.style.transform = 'translateX(-50%)';
        
        demoText2.style.top = '80px';
        demoText2.style.left = '50%';
        demoText2.style.transform = 'translateX(-50%)';
        
        demoText3.style.top = '110px';
        demoText3.style.left = '50%';
        demoText3.style.transform = 'translateX(-50%)';

        // Start demo animations
        demoBird.style.animation = 'demo-jump 1.5s infinite ease-in-out';
        demoPipe.style.animation = 'demo-pipe-move 4s infinite linear';
        demoHole.style.animation = 'demo-pipe-move 4s infinite linear';
        demoText1.style.animation = 'demo-blink 2s infinite';
        demoText2.style.animation = 'demo-blink 2s infinite 0.5s';
        demoText3.style.animation = 'demo-blink 2s infinite 1s';
    }

    function startGame() {
        gameStarted = true;
        startScreen.style.display = 'none';
        block.style.animation = 'block 4s infinite linear';
        hole.style.animation = 'block 4s infinite linear';
        score = 0;
        scoreElement.textContent = score;
        birdPos = 100;
        bird.style.top = birdPos + 'px';
        isGameOver = false;
        
        // No need to manually show the jump button as it's handled by CSS
        
        // Hide demo elements
        demoBird.style.display = 'none';
        demoPipe.style.display = 'none';
        demoHole.style.display = 'none';
        demoText1.style.display = 'none';
        demoText2.style.display = 'none';
        demoText3.style.display = 'none';
        
        gameLoop();
    }

    function jump() {
        if (!gameStarted || isGameOver) return;
        fallSpeed = -7;
        jumping = true;
    }

    function gameLoop() {
        if (isGameOver) return;

        fallSpeed += gravity;
        birdPos += fallSpeed;
        
        // Keep bird within game bounds
        if (birdPos < 0) {
            birdPos = 0;
            fallSpeed = 0;
        }
        if (birdPos > game.offsetHeight - bird.offsetHeight) {
            gameOver();
            return;
        }

        bird.style.top = birdPos + 'px';

        // Collision detection with more forgiving boundaries
        let birdRect = bird.getBoundingClientRect();
        let blockRect = block.getBoundingClientRect();
        let holeRect = hole.getBoundingClientRect();

        // Add some padding to collision detection
        const collisionPadding = 5;
        
        // Check for collision with pipes
        if (
            birdRect.right - collisionPadding > blockRect.left &&
            birdRect.left + collisionPadding < blockRect.right &&
            (birdRect.top + collisionPadding < holeRect.top || 
             birdRect.bottom - collisionPadding > holeRect.bottom)
        ) {
            gameOver();
            return;
        }

        // Score point when passing through hole
        if (blockRect.right < birdRect.left && blockRect.right > birdRect.left - 5) {
            score++;
            scoreElement.textContent = score;
            console.log("Score: " + score); // Debug log for scoring
        }

        requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        isGameOver = true;
        gameStarted = false;
        block.style.animation = 'none';
        hole.style.animation = 'none';
        finalScore.textContent = score;
        gameOverScreen.style.display = 'block';
        
        // No need to hide jump button as it should remain visible
    }

    // Show demo when page loads
    showDemo();

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            jump();
        }
    });

    document.addEventListener('touchstart', (e) => {
        // Only handle touch events that aren't on the jump button
        // This prevents double jumps when pressing the button
        if (e.target !== jumpButton) {
            jump();
        }
    });
    
    document.addEventListener('click', (e) => {
        // Only handle clicks that aren't on the jump button
        // This prevents double jumps when pressing the button
        if (e.target !== jumpButton) {
            jump();
        }
    });
    
    // Add jump button event listener
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        jump();
    });
    
    jumpButton.addEventListener('click', (e) => {
        jump();
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        startGame();
    });

    // Randomize hole position with more forgiving placement
    hole.addEventListener('animationiteration', () => {
        // Get the game container height
        const gameHeight = game.offsetHeight;
        
        // Calculate safe positions based on the actual game height
        // Ensure the hole is always within the visible area
        // The hole height is 300px, so we need to keep it at least 50px from top and bottom
        const minPosition = 50; // 50px from the top
        const maxPosition = gameHeight - 350; // 300px (hole height) + 50px from the bottom
        
        // Generate a random position between min and max
        // This ensures the hole is always within the visible area
        const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition)) + minPosition;
        
        // Set the hole position using absolute top value (not negative)
        hole.style.top = randomPosition + 'px';
        
        // Debug log
        console.log(`Game height: ${gameHeight}, Min: ${minPosition}, Max: ${maxPosition}, Hole position: ${randomPosition}`);
    });
}); 