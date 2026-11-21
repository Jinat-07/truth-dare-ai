// ==========================================
// GOOGLE APPS SCRIPT GROQ RELAY ENDPOINT
// ==========================================
const GROQ_PROXY_URL = "https://script.google.com/macros/s/AKfycbz3X0rajyTiy0-9qMlkEdaJiv-od4T5ktulvA2EXXw2IWU-hrduzksEqoqqc5Q620REeQ/exec";

// ==========================================
// DOM ELEMENTS
// ==========================================
const cardInner = document.getElementById("card-inner");
const convertBtn = document.getElementById("convert-btn");
const convertBtnLabel = document.getElementById("convert-btn-label");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const copyBtnLabel = document.getElementById("copy-btn-label");

const subjectInput = document.getElementById("game-subject");
const presetChips = document.querySelectorAll(".preset-chip");
const vibeButtons = document.querySelectorAll(".vibe-btn");

const frontText = document.getElementById("prompt-text-front");
const backText = document.getElementById("prompt-text-back");

const tabGenerate = document.getElementById("tab-generate");
const tabConvert = document.getElementById("tab-convert");
const panelGenerate = document.getElementById("panel-generate");
const panelConvert = document.getElementById("panel-convert");

const sourceTypeButtons = document.querySelectorAll(".source-type-btn");
const customPromptInput = document.getElementById("custom-prompt-input");
const customConvertBtn = document.getElementById("custom-convert-btn");

const historySection = document.getElementById("history-section");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const toast = document.getElementById("toast");

// ==========================================
// APPLICATION STATE
// ==========================================
let isFlipped = false; // false = Truth (Front), true = Dare (Back)
let selectedVibe = "friendly";
let customSourceType = "truth"; // "truth" or "dare"
let recentPrompts = [];
let sessionHistory = [];

// ==========================================
// UI HELPERS
// ==========================================
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");
    setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
    }, 3000);
}

function setCardSide(showDare) {
    isFlipped = showDare;
    if (isFlipped) {
        cardInner.classList.add("rotate-y-180");
        convertBtnLabel.textContent = "Convert to Truth";
    } else {
        cardInner.classList.remove("rotate-y-180");
        convertBtnLabel.textContent = "Convert to Dare";
    }
}

function toggleCard() {
    setCardSide(!isFlipped);
}

convertBtn.addEventListener("click", toggleCard);
cardInner.addEventListener("click", toggleCard);

// Mode Switcher
tabGenerate.addEventListener("click", () => {
    tabGenerate.className = "mode-tab py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-white text-blue-600 shadow-sm transition-all";
    tabConvert.className = "mode-tab py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all";
    panelGenerate.classList.remove("hidden");
    panelConvert.classList.add("hidden");
});

tabConvert.addEventListener("click", () => {
    tabConvert.className = "mode-tab py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-white text-amber-600 shadow-sm transition-all";
    tabGenerate.className = "mode-tab py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all";
    panelConvert.classList.remove("hidden");
    panelGenerate.classList.add("hidden");
});

// Preset Subject Chips
presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
        subjectInput.value = chip.getAttribute("data-topic");
        subjectInput.focus();
    });
});

// Vibe Selection
vibeButtons.forEach(button => {
    button.addEventListener("click", () => {
        vibeButtons.forEach(btn => {
            btn.className = "vibe-btn py-2.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all";
        });
        button.className = "vibe-btn py-2.5 px-3 rounded-xl text-xs font-semibold border-2 border-blue-600 bg-blue-50/80 text-blue-700 flex items-center justify-center gap-1.5 transition-all";
        selectedVibe = button.getAttribute("data-vibe");
    });
});

// Custom Converter Source Selector
sourceTypeButtons.forEach(button => {
    button.addEventListener("click", () => {
        sourceTypeButtons.forEach(btn => {
            btn.className = "source-type-btn py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all";
        });
        customSourceType = button.getAttribute("data-source");
        if (customSourceType === "truth") {
            button.className = "source-type-btn py-2 px-3 rounded-xl text-xs font-semibold border-2 border-blue-600 bg-blue-50 text-blue-700 transition-all";
            customPromptInput.placeholder = "e.g., Who was your first crush in school?";
        } else {
            button.className = "source-type-btn py-2 px-3 rounded-xl text-xs font-semibold border-2 border-amber-500 bg-amber-50 text-amber-700 transition-all";
            customPromptInput.placeholder = "e.g., Let the person to your left send a text from your phone.";
        }
    });
});

// Copy Card Text
copyBtn.addEventListener("click", async () => {
    const activeLabel = isFlipped ? "DARE" : "TRUTH";
    const activeText = isFlipped ? backText.textContent.trim() : frontText.textContent.trim();
    try {
        await navigator.clipboard.writeText(`${activeLabel}: ${activeText}`);
        copyBtnLabel.textContent = "Copied!";
        showToast(`${activeLabel} copied to clipboard!`);
        setTimeout(() => {
            copyBtnLabel.textContent = "Copy Card";
        }, 1800);
    } catch {
        showToast("Could not copy text.");
    }
});

// Session History
function addToHistory(truth, dare, label) {
    sessionHistory.unshift({ truth, dare, label });
    if (sessionHistory.length > 6) sessionHistory.pop();
    renderHistory();
}

function renderHistory() {
    if (sessionHistory.length === 0) {
        historySection.classList.add("hidden");
        return;
    }
    historySection.classList.remove("hidden");
    historyList.innerHTML = "";

    sessionHistory.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center justify-between gap-3 group";
        btn.innerHTML = `
            <div class="truncate">
                <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mr-1.5">${item.label}</span>
                <span class="text-xs font-medium text-slate-700 group-hover:text-blue-700">${item.truth}</span>
            </div>
            <span class="text-[11px] font-semibold text-blue-600 shrink-0">Load →</span>
        `;
        btn.addEventListener("click", () => {
            frontText.textContent = item.truth;
            backText.textContent = item.dare;
            setCardSide(false);
            showToast("Loaded previous round");
        });
        historyList.appendChild(btn);
    });
}

clearHistoryBtn.addEventListener("click", () => {
    sessionHistory = [];
    renderHistory();
});

// ==========================================
// JSONP GROQ RELAY (IMMUNE TO CORS & BRAVE BLOCKS)
// ==========================================
function callGroqBackend(systemPrompt, userPrompt) {
    return new Promise((resolve, reject) => {
        if (!GROQ_PROXY_URL.startsWith("https://script.google.com/")) {
            reject(new Error("Paste your Google Apps Script /exec URL into line 4 of app.js."));
            return;
        }

        const callbackName = "__groqCb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
        const script = document.createElement("script");

        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error("Request timed out. Check your internet or Apps Script URL."));
        }, 15000);

        function cleanup() {
            clearTimeout(timeoutId);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function (data) {
            cleanup();
            try {
                if (!data) {
                    reject(new Error("Empty response from server."));
                    return;
                }
                if (data.error) {
                    reject(new Error(data.error.message || "Groq API error."));
                    return;
                }
                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                    reject(new Error("No AI text returned."));
                    return;
                }
                const jsonMatch = content.trim().match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    reject(new Error("Invalid JSON format from AI."));
                    return;
                }
                const parsed = JSON.parse(jsonMatch[0]);
                if (!parsed.truth || !parsed.dare) {
                    reject(new Error("Missing truth/dare fields."));
                    return;
                }
                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        };

        script.onerror = function () {
            cleanup();
            reject(new Error("Apps Script blocked: set 'Who has access' to 'Anyone' and use the /exec URL."));
        };

        const url = `${GROQ_PROXY_URL}?callback=${callbackName}&system=${encodeURIComponent(systemPrompt)}&user=${encodeURIComponent(userPrompt)}&_t=${Date.now()}`;
        script.src = url;
        document.body.appendChild(script);
    });
}

// ==========================================
// 1. GENERATE SUBJECT-BASED TRUTH & DARE
// ==========================================
async function generatePair() {
    const subject = subjectInput.value.trim() || "Friends Hanging Out";

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> <span>Generating with Groq AI...</span>`;

    setCardSide(false);
    frontText.textContent = "Groq AI is crafting a custom Truth... ✨";
    backText.textContent = "Groq AI is pairing a matching Dare... 🎲";

    const avoidClause = recentPrompts.length > 0
        ? `Avoid repeating these recent prompts: ${recentPrompts.slice(-6).join(" | ")}.`
        : "";

    const systemPrompt = `You are a sharp, creative party game designer. Generate one engaging, original 'Truth' question and one tightly linked 'Dare' challenge on the exact same theme so players can switch between them.
Rules:
- Specific to the subject and intensity level, never generic.
- 1-2 punchy sentences each, natural and playable in person.
- Safe and non-harmful.
- Output strictly valid JSON with keys "truth" and "dare".`;

    const userPrompt = `Subject/Topic: "${subject}", Vibe/Intensity: "${selectedVibe}". ${avoidClause}`;

    try {
        const result = await callGroqBackend(systemPrompt, userPrompt);
        frontText.textContent = result.truth;
        backText.textContent = result.dare;

        recentPrompts.push(result.truth);
        addToHistory(result.truth, result.dare, subject);
    } catch (error) {
        console.error(error);
        frontText.textContent = `AI Error: ${error.message}`;
        backText.textContent = `AI Error: ${error.message}`;
        showToast(error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>Generate Truth & Dare</span>`;
    }
}

// ==========================================
// 2. CONVERT CUSTOM TRUTH <-> DARE
// ==========================================
async function convertCustomPrompt() {
    const userText = customPromptInput.value.trim();
    if (!userText) {
        showToast("Please type a Truth or Dare first!");
        customPromptInput.focus();
        return;
    }

    customConvertBtn.disabled = true;
    customConvertBtn.textContent = "Converting with Groq AI...";

    const targetSideIsDare = customSourceType === "truth";

    if (targetSideIsDare) {
        frontText.textContent = userText;
        backText.textContent = "Converting your Truth into a matching Dare... 🔄";
        setCardSide(true);
    } else {
        backText.textContent = userText;
        frontText.textContent = "Converting your Dare into a matching Truth... 🔄";
        setCardSide(false);
    }

    const systemPrompt = `You are a clever Truth or Dare converter. Given a Truth, create an equivalent, actionable Dare on the exact same subject. Given a Dare, create a revealing Truth question on the exact same subject. Keep it 1-2 punchy sentences and safe. Output strictly valid JSON: {"truth": "...", "dare": "..."}`;

    const userPrompt = customSourceType === "truth"
        ? `Original Truth: "${userText}". Keep "truth" identical and generate a matching "dare".`
        : `Original Dare: "${userText}". Keep "dare" identical and generate a matching "truth".`;

    try {
        const result = await callGroqBackend(systemPrompt, userPrompt);
        const finalTruth = customSourceType === "truth" ? userText : result.truth;
        const finalDare = customSourceType === "dare" ? userText : result.dare;

        frontText.textContent = finalTruth;
        backText.textContent = finalDare;
        addToHistory(finalTruth, finalDare, "Converted");
    } catch (error) {
        console.error(error);
        if (targetSideIsDare) backText.textContent = `AI Error: ${error.message}`;
        else frontText.textContent = `AI Error: ${error.message}`;
        showToast(error.message);
    } finally {
        customConvertBtn.disabled = false;
        customConvertBtn.textContent = "Convert & Flip Card";
    }
}

generateBtn.addEventListener("click", generatePair);
customConvertBtn.addEventListener("click", convertCustomPrompt);
