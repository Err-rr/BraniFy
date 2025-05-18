// Initialize particle effects
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size between 2 and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 20}s`;

        // Random color shade
        const hue = Math.random() * 20;
        particle.style.backgroundColor = `hsla(${350 + hue}, 100%, 50%, ${Math.random() * 0.3 + 0.2})`;

        particlesContainer.appendChild(particle);
    }
}

createParticles();

// Navigation and screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show selected screen
    document.getElementById(screenId).classList.add('active');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.querySelector(`.nav-link[data-screen="${screenId}"]`).classList.add('active');
}

// Set up navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = link.getAttribute('data-screen');
        showScreen(screenId);
    });
});

// Flashcard functionality
const flashcard = document.getElementById('current-card');
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

// Toast notification functionality
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize storage for flashcards
let decks = JSON.parse(localStorage.getItem('flashcard-decks')) || [];
let currentDeckIndex = -1;
let currentCardIndex = -1;

// Create/Add card functionality
const addCardBtn = document.getElementById('add-card-btn');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const clearBtn = document.getElementById('clear-btn');
const saveDeckBtn = document.getElementById('save-deck-btn');
const deckNameInput = document.getElementById('deck-name');

clearBtn.addEventListener('click', () => {
    questionInput.value = '';
    answerInput.value = '';
});

addCardBtn.addEventListener('click', () => {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    const deckName = deckNameInput.value.trim();

    if (!question || !answer) {
        showToast('Please fill in both question and answer fields');
        return;
    }

    if (!deckName) {
        showToast('Please enter a deck name');
        return;
    }

    // Find or create the deck
    let deckIndex = decks.findIndex(d => d.name === deckName);

    if (deckIndex === -1) {
        // Create new deck
        decks.push({
            name: deckName,
            cards: []
        });
        deckIndex = decks.length - 1;
    }

    // Add card to the deck
    decks[deckIndex].cards.push({
        question,
        answer,
        mastered: false,
        lastReviewed: null
    });

    // Save to localStorage
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));

    // Clear inputs
    questionInput.value = '';
    answerInput.value = '';

    showToast('Card added successfully!');
    updateDecksList();
    updateStats();
});

saveDeckBtn.addEventListener('click', () => {
    const deckName = deckNameInput.value.trim();

    if (!deckName) {
        showToast('Please enter a deck name');
        return;
    }

    // Check if deck exists
    const deckExists = decks.some(d => d.name === deckName);

    if (!deckExists) {
        showToast('No cards have been added to this deck yet');
        return;
    }

    showToast('Deck saved successfully!');
    showScreen('decks');
});

// Generate cards from topic (mock functionality)
const generateBtn = document.getElementById('generate-btn');
const topicInput = document.getElementById('topic-input');

generateBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();

    if (!topic) {
        showToast('Please enter a topic');
        return;
    }

    // Simulate AI generating cards
    showToast('Generating cards for: ' + topic);

    // Mock data for demonstration
    setTimeout(() => {
        const mockQuestions = [
            {
                question: `What is the definition of ${topic}?`,
                answer: `This is a sample definition of ${topic} generated by AI.`
            },
            {
                question: `What are the key principles of ${topic}?`,
                answer: `The key principles include understanding the fundamentals, applying the concepts, and mastering the techniques.`
            },
            {
                question: `Who is considered the founder of ${topic}?`,
                answer: `Several notable figures contributed to the development of ${topic}, but it's widely attributed to historical experts in the field.`
            }
        ];

        // Fill the form with the first generated question
        questionInput.value = mockQuestions[0].question;
        answerInput.value = mockQuestions[0].answer;

        showToast('Cards generated! Add them to your deck.');
    }, 1500);
});

// Study functionality
const dontKnowBtn = document.getElementById('dont-know-btn');
const knowBtn = document.getElementById('know-btn');
const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const progressFill = document.getElementById('progress-fill');
const progressCount = document.getElementById('progress-count');
const progressPercent = document.getElementById('progress-percent');
const responseButtons = document.getElementById('response-buttons');

function loadDeck(deckIndex) {
    if (deckIndex >= 0 && deckIndex < decks.length) {
        currentDeckIndex = deckIndex;
        currentCardIndex = 0;

        if (decks[currentDeckIndex].cards.length > 0) {
            loadCard(currentCardIndex);
            responseButtons.style.display = 'flex';
            updateProgress();
        } else {
            questionText.textContent = "This deck has no cards";
            answerText.textContent = "Add cards to start studying";
            responseButtons.style.display = 'none';
        }
    }
}

function loadCard(cardIndex) {
    if (currentDeckIndex >= 0 && cardIndex >= 0 && cardIndex < decks[currentDeckIndex].cards.length) {
        const card = decks[currentDeckIndex].cards[cardIndex];
        questionText.textContent = card.question;
        answerText.textContent = card.answer;

        // Reset card to front face
        flashcard.classList.remove('flipped');
    }
}

dontKnowBtn.addEventListener('click', () => {
    if (currentDeckIndex >= 0 && currentCardIndex >= 0) {
        const card = decks[currentDeckIndex].cards[currentCardIndex];
        card.mastered = false;
        card.lastReviewed = new Date().toISOString();

        goToNextCard();
    }
});

knowBtn.addEventListener('click', () => {
    if (currentDeckIndex >= 0 && currentCardIndex >= 0) {
        const card = decks[currentDeckIndex].cards[currentCardIndex];
        card.mastered = true;
        card.lastReviewed = new Date().toISOString();

        goToNextCard();
    }
});

function goToNextCard() {
    currentCardIndex++;

    if (currentCardIndex >= decks[currentDeckIndex].cards.length) {
        // End of deck
        currentCardIndex = 0;
        showToast('Deck completed! Starting again...');
    }

    loadCard(currentCardIndex);
    updateProgress();

    // Save to localStorage
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));
    updateStats();
}

function updateProgress() {
    if (currentDeckIndex >= 0) {
        const totalCards = decks[currentDeckIndex].cards.length;
        const progress = ((currentCardIndex / totalCards) * 100).toFixed(0);

        progressFill.style.width = `${progress}%`;
        progressCount.textContent = `${currentCardIndex}/${totalCards}`;
        progressPercent.textContent = `${progress}%`;
    }
}

// Update decks list
function updateDecksList() {
    const decksListContainer = document.getElementById('decks-list-container');
    const emptyDecks = document.getElementById('empty-decks');

    // Clear current list
    decksListContainer.innerHTML = '';

    if (decks.length === 0) {
        emptyDecks.style.display = 'block';
        return;
    }

    emptyDecks.style.display = 'none';

    // Add each deck to the list
    decks.forEach((deck, index) => {
        const deckItem = document.createElement('li');
        deckItem.className = 'card-item';

        deckItem.innerHTML = `
                    <div class="card-item-content">
                        <div class="card-item-question">${deck.name}</div>
                        <div class="card-item-answer">${deck.cards.length} cards</div>
                    </div>
                    <div class="card-item-actions">
                        <button class="btn-icon study-deck" data-index="${index}">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="btn-icon delete-deck" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

        decksListContainer.appendChild(deckItem);
    });

    // Add event listeners
    document.querySelectorAll('.study-deck').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deckIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            loadDeck(deckIndex);
            showScreen('study');
        });
    });

    document.querySelectorAll('.delete-deck').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deckIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            deleteDeck(deckIndex);
        });
    });
}

function deleteDeck(deckIndex) {
    if (deckIndex >= 0 && deckIndex < decks.length) {
        const deckName = decks[deckIndex].name;
        decks.splice(deckIndex, 1);

        // Save to localStorage
        localStorage.setItem('flashcard-decks', JSON.stringify(decks));

        showToast(`Deck "${deckName}" deleted`);
        updateDecksList();
        updateStats();
    }
}

// Update stats
function updateStats() {
    const totalCardsElement = document.getElementById('total-cards');
    const masteredCardsElement = document.getElementById('mastered-cards');
    const learningCardsElement = document.getElementById('learning-cards');

    let totalCards = 0;
    let masteredCards = 0;

    decks.forEach(deck => {
        totalCards += deck.cards.length;
        masteredCards += deck.cards.filter(card => card.mastered).length;
    });

    totalCardsElement.textContent = totalCards;
    masteredCardsElement.textContent = masteredCards;
    learningCardsElement.textContent = totalCards - masteredCards;
}

// Initialize app
updateDecksList();
updateStats();

// Initialize background animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Original background animations (if any)
    initBackgroundCircles();
    initBackgroundLines();
    initParticles();

    // New background animations
    initHexGrid();
    initMatrixRain();
    initNebulaClouds();
    initCircuits();
    initEnergyWaves();
});

// Original animations (example implementations)
function initBackgroundCircles() {
    const bgAnimation = document.querySelector('.bg-animation');
    for (let i = 0; i < 5; i++) {
        const circle = document.createElement('div');
        circle.classList.add('bg-circle');
        circle.style.width = Math.random() * 600 + 300 + 'px';
        circle.style.height = circle.style.width;
        circle.style.left = Math.random() * 100 + '%';
        circle.style.top = Math.random() * 100 + '%';
        circle.style.animationDelay = Math.random() * 5 + 's';
        bgAnimation.appendChild(circle);
    }
}

function initBackgroundLines() {
    const bgLines = document.querySelector('.bg-lines');
    for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.classList.add('bg-line');
        line.style.left = Math.random() * 100 + '%';
        line.style.height = Math.random() * 50 + 30 + '%';
        line.style.animationDuration = Math.random() * 10 + 5 + 's';
        line.style.animationDelay = Math.random() * 5 + 's';
        bgLines.appendChild(line);
    }
}

function initParticles() {
    const particles = document.querySelector('.particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.backgroundColor = `rgba(255, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.random() * 0.5 + 0.2})`;
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particles.appendChild(particle);
    }
}

//  animations
function initHexGrid() {
    const hexGrid = document.querySelector('.hex-grid');
    const cols = Math.ceil(window.innerWidth / 70);
    const rows = Math.ceil(window.innerHeight / 40);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const hex = document.createElement('div');
            hex.classList.add('hex');

            // Offset every other row for honeycomb pattern
            let xPos = j * 70;
            if (i % 2 === 1) {
                xPos += 35;
            }

            hex.style.left = xPos + 'px';
            hex.style.top = i * 40 + 'px';
            hex.style.animationDelay = (Math.random() * 5) + 's';
            hexGrid.appendChild(hex);
        }
    }
}

function initMatrixRain() {
    const matrixRain = document.querySelector('.matrix-rain');
    const charWidth = 12; // approximate width of a character
    const columns = Math.ceil(window.innerWidth / charWidth);

    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.classList.add('matrix-column');
        column.style.left = i * charWidth + 'px';

        // Generate random matrix characters (using binary, hex, and other symbols)
        let columnText = '';
        const charCount = Math.floor(Math.random() * 20) + 10;
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノマミムメモヤユヨラリルレロワヲンABCDEF!@#$%^&*(){}[]<>';

        for (let j = 0; j < charCount; j++) {
            columnText += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        column.textContent = columnText;
        column.style.setProperty('--drop-speed', Math.random() * 10 + 5 + 's');
        column.style.animationDelay = Math.random() * 10 + 's';
        matrixRain.appendChild(column);
    }
}

function initNebulaClouds() {
    const nebula = document.querySelector('.nebula');

    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('nebula-cloud');

        // Create random sized clouds
        const size = Math.random() * 800 + 400;
        cloud.style.width = size + 'px';
        cloud.style.height = size + 'px';
        cloud.style.left = Math.random() * 100 + '%';
        cloud.style.top = Math.random() * 100 + '%';
        cloud.style.animationDelay = (i * 2) + 's';

        nebula.appendChild(cloud);
    }
}

function initCircuits() {
    const circuitContainer = document.querySelector('.circuit-container');

    // Create 15 horizontal circuit lines
    for (let i = 0; i < 15; i++) {
        const circuit = document.createElement('div');
        circuit.classList.add('circuit', 'circuit-horizontal');

        const y = Math.random() * 100;
        const width = Math.random() * 300 + 50;
        const x = Math.random() * (100 - (width / window.innerWidth * 100));

        circuit.style.top = y + '%';
        circuit.style.left = x + '%';
        circuit.style.width = width + 'px';
        circuit.style.animationDelay = Math.random() * 4 + 's';

        circuitContainer.appendChild(circuit);

        // Add 1-3 nodes to each horizontal line
        const nodeCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < nodeCount; j++) {
            const node = document.createElement('div');
            node.classList.add('circuit-node');

            // Position nodes along the line
            const nodeX = (width * (j + 1)) / (nodeCount + 1);
            node.style.left = nodeX + 'px';
            node.style.top = '-1.5px'; // Center on the line
            node.style.animationDelay = Math.random() * 2 + 's';

            circuit.appendChild(node);
        }
    }

    // Create 15 vertical circuit lines
    for (let i = 0; i < 15; i++) {
        const circuit = document.createElement('div');
        circuit.classList.add('circuit', 'circuit-vertical');

        const x = Math.random() * 100;
        const height = Math.random() * 300 + 50;
        const y = Math.random() * (100 - (height / window.innerHeight * 100));

        circuit.style.left = x + '%';
        circuit.style.top = y + '%';
        circuit.style.height = height + 'px';
        circuit.style.animationDelay = Math.random() * 4 + 's';

        circuitContainer.appendChild(circuit);

        // Add 1-3 nodes to each vertical line
        const nodeCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < nodeCount; j++) {
            const node = document.createElement('div');
            node.classList.add('circuit-node');

            // Position nodes along the line
            const nodeY = (height * (j + 1)) / (nodeCount + 1);
            node.style.top = nodeY + 'px';
            node.style.left = '-1.5px'; // Center on the line
            node.style.animationDelay = Math.random() * 2 + 's';

            circuit.appendChild(node);
        }
    }
}

function initEnergyWaves() {
    const energyWaves = document.querySelector('.energy-waves');

    // Create 5 wave emitters
    for (let i = 0; i < 5; i++) {
        const emitterX = Math.random() * 100;
        const emitterY = Math.random() * 100;

        // Each emitter creates a new wave every few seconds
        createRecurringWaves(energyWaves, emitterX, emitterY);
    }
}

function createRecurringWaves(container, originX, originY) {
    // Create a new wave
    const wave = document.createElement('div');
    wave.classList.add('wave');
    wave.style.left = originX + '%';
    wave.style.top = originY + '%';
    container.appendChild(wave);

    // Remove the wave after animation completes
    setTimeout(() => {
        wave.remove();
    }, 6000);

    // Create a new wave from the same origin point
    setTimeout(() => {
        createRecurringWaves(container, originX, originY);
    }, Math.random() * 3000 + 2000);
}

// Window resize handler to refresh animations when window size changes
window.addEventListener('resize', debounce(function () {
    // Clear existing animations
    document.querySelector('.hex-grid').innerHTML = '';
    document.querySelector('.matrix-rain').innerHTML = '';

    // Reinitialize animations that depend on window size
    initHexGrid();
    initMatrixRain();
}, 250));

// Debounce function to limit resize event frequency
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
