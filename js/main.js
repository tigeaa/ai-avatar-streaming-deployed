import { setupScene } from './core/ThreeSetup.js';
import { loadAvatar } from './core/AvatarLoader.js';
import { SpeechController } from './controllers/SpeechController.js';
import { AvatarController } from './controllers/AvatarController.js';
import { SettingsManager } from './utils/SettingsManager.js';
import { AIController } from './controllers/AIController.js';

// --- UI Helper Functions ---
const statusDisplay = document.getElementById('status-display');

function showStatus(message, isError = false) {
    statusDisplay.textContent = message;
    statusDisplay.className = isError ? 'error' : 'thinking';
}

function hideStatus() {
    statusDisplay.className = '';
}

// --- Main Application Logic ---
function setupUIEventListeners(settingsManager) {
    const aiServiceSelector = document.getElementById('ai-service');
    const geminiSettings = document.getElementById('gemini-settings');
    const huggingFaceSettings = document.getElementById('huggingface-settings');
    const saveSettingsButton = document.getElementById('save-settings-button');

    aiServiceSelector.addEventListener('change', (event) => {
        const selectedService = event.target.value;
        if (selectedService === 'gemini') {
            geminiSettings.style.display = 'flex';
            huggingFaceSettings.style.display = 'none';
        } else if (selectedService === 'huggingface') {
            geminiSettings.style.display = 'none';
            huggingFaceSettings.style.display = 'flex';
        }
    });

    saveSettingsButton.addEventListener('click', () => {
        settingsManager.saveSettings();
    });
}

async function main() {
    console.log("Application starting...");
    const { scene, camera, renderer, animate, updatables } = setupScene();

    // Instantiate managers and controllers
    const settingsManager = new SettingsManager();
    const speechController = new SpeechController();
    const aiController = new AIController(settingsManager);
    let avatarController;

    // Setup initial UI state and listeners
    setupUIEventListeners(settingsManager);
    settingsManager.loadSettings();

    // Load the avatar
    try {
        const avatar = await loadAvatar(scene);
        avatarController = new AvatarController(avatar);
        updatables.push(avatarController);
    } catch (error) {
        console.error("Failed to load avatar, stopping application.", error);
        showStatus('Failed to load avatar model.', true);
        return;
    }

    // Setup main interaction listener
    const sendButton = document.getElementById('send-button');
    const textInput = document.getElementById('text-input');

    sendButton.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text || !avatarController) return;

        sendButton.disabled = true;
        textInput.value = '';
        showStatus('考え中...');

        try {
            const aiResponse = await aiController.generateResponse(text);
            hideStatus();

            await speechController.speak(
                aiResponse,
                () => avatarController.startTalking(),
                () => avatarController.stopTalking()
            );
        } catch (error) {
            console.error("AI interaction failed:", error);
            showStatus(error.message, true);
        } finally {
            sendButton.disabled = false;
        }
    });

    // Start the animation loop
    animate();

    console.log("Three.js scene setup complete and avatar loaded.");
}

main();
