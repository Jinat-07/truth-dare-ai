// DOM Elements
const cardInner = document.getElementById('card-inner');
const convertBtn = document.getElementById('convert-btn');
const generateBtn = document.getElementById('generate-btn');
const subjectInput = document.getElementById('game-subject');
const vibeButtons = document.querySelectorAll('.vibe-btn');

// App State
let isFlipped = false;
let selectedVibe = 'friendly';

// 1. Card Flip Animation logic
function toggleCard() {
    isFlipped = !isFlipped;
    if (isFlipped) {
        cardInner.classList.add('rotate-y-180');
        convertBtn.textContent = 'Convert to Truth';
    } else {
        cardInner.classList.remove('rotate-y-180');
        convertBtn.textContent = 'Convert to Dare';
    }
}

// 2. Vibe Selection logic (handles visual switching)
vibeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active styling from all buttons
        vibeButtons.forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
            btn.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
        });

        // Add active styling to clicked button
        button.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
        button.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-600');
        
        // Update state
        selectedVibe = button.getAttribute('data-vibe');
    });
});

// Event Listeners
convertBtn.addEventListener('click', toggleCard);
cardInner.addEventListener('click', toggleCard);

// Placeholder event listener for generation
generateBtn.addEventListener('click', () => {
    const currentSubject = subjectInput.value.trim() || 'General';
    alert(`Ready to generate a "${selectedVibe}" prompt for context: "${currentSubject}"!`);
});
