// DOM Elements
const cardInner = document.getElementById('card-inner');
const convertBtn = document.getElementById('convert-btn');

// State tracking: false means Truth (front), true means Dare (back)
let isFlipped = false;

// Function to handle the flip animation and button text update
function toggleCard() {
    isFlipped = !isFlipped;
    
    if (isFlipped) {
        // Flip to the back (Dare)
        cardInner.classList.add('rotate-y-180');
        convertBtn.textContent = 'Convert to Truth';
    } else {
        // Flip to the front (Truth)
        cardInner.classList.remove('rotate-y-180');
        convertBtn.textContent = 'Convert to Dare';
    }
}

// Event Listener for the Convert button
convertBtn.addEventListener('click', toggleCard);

// Optional: Allow clicking the card itself to flip it too
cardInner.addEventListener('click', toggleCard);
