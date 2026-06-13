// DOM Elements
const cardInner = document.getElementById('card-inner');
const convertBtn = document.getElementById('convert-btn');
const generateBtn = document.getElementById('generate-btn');
const subjectInput = document.getElementById('game-subject');
const vibeButtons = document.querySelectorAll('.vibe-btn');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const apiStatus = document.getElementById('api-status');
const frontText = document.getElementById('prompt-text-front');
const backText = document.getElementById('prompt-text-back');

// App State
let isFlipped = false;
let selectedVibe = 'friendly';
let apiKey = localStorage.getItem('gemini_api_key') || '';

// Initialize Key Status on Load
if (apiKey) {
    apiKeyInput.value = '••••••••••••••••';
    apiStatus.textContent = 'Connected';
    apiStatus.className = 'text-green-500 font-bold uppercase';
}

// Save Key Functionality
saveKeyBtn.addEventListener('click', () => {
    const keyVal = apiKeyInput.value.trim();
    if (keyVal && keyVal !== '••••••••••••••••') {
        localStorage.setItem('gemini_api_key', keyVal);
        apiKey = keyVal;
        apiStatus.textContent = 'Connected';
        apiStatus.className = 'text-green-500 font-bold uppercase';
        alert('API Key saved securely to your browser local storage!');
    } else if (!keyVal) {
        localStorage.removeItem('gemini_api_key');
        apiKey = '';
        apiStatus.textContent = 'Disconnected';
        apiStatus.className = 'text-red-500 font-bold uppercase';
    }
});

// Card Flip Animation logic
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

// Vibe Selection Selection
vibeButtons.forEach(button => {
    button.addEventListener('click', () => {
        vibeButtons.forEach(btn => {
            btn.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
            btn.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
        });
        button.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
        button.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-600');
        selectedVibe = button.getAttribute('data-vibe');
    });
});

// Event Listeners for switching view
convertBtn.addEventListener('click', toggleCard);
cardInner.addEventListener('click', toggleCard);

// Core AI Engine Pipeline
async function generatePair() {
    if (!apiKey) {
        alert('Please provide a Google Gemini API Key first.');
        return;
    }

    const currentSubject = subjectInput.value.trim() || 'General Socializing';
    
    // Set UI to loading state
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    // Make sure we present the front (Truth) face first for new generations
    if (isFlipped) toggleCard();
    frontText.textContent = 'Thinking up something good... ✨';
    backText.textContent = 'Preparing your dare... 🎲';

    // Advanced prompt targeting dual structure constraints
    const dynamicPrompt = `You are a creative party game coordinator. Generate exactly one single 'Truth' question and one corresponding 'Dare' action that match each other contextually.
    
    CRITICAL CONTEXTS:
    - Theme/Subject Matter: ${currentSubject}
    - Tone/Intensity/Vibe: ${selectedVibe}

    The Dare must act as a physical challenge or action linked to the theme of the Truth question. Return your answer strictly as a valid minified JSON object containing exactly two fields: "truth" and "dare". Do not add any conversational text or markdown formatting blocks. Just the raw JSON.`;

    try {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: dynamicPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error('API request failed');

        const resultData = await response.json();
        const rawJsonText = resultData.candidates[0].content.parts[0].text;
        const cleanupData = JSON.parse(rawJsonText.trim());

        // Update card interfaces smoothly
        frontText.textContent = cleanupData.truth;
        backText.textContent = cleanupData.dare;

    } catch (error) {
        console.error(error);
        frontText.textContent = 'Oops! Failed to connect to Gemini.';
        backText.textContent = 'Check your API Key or connection rules.';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'New Prompt';
    }
}

generateBtn.addEventListener('click', generatePair);
