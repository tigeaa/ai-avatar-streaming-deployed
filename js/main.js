import { setupScene } from './core/ThreeSetup.js';
import { loadAvatar } from './core/AvatarLoader.js';
import { SpeechController } from './controllers/SpeechController.js';
import { AvatarController } from './controllers/AvatarController.js';
import { SettingsManager } from './utils/SettingsManager.js';
import { AIController } from './controllers/AIController.js';
import { StudyModeController } from './controllers/StudyModeController.js';

// --- DOM Elements ---
const statusDisplay = document.getElementById('status-display');
const startStudyButton = document.getElementById('start-study-button');
const completeStudyButton = document.getElementById('complete-study-button');
const problemInput = document.getElementById('problem-input');
const timerDurationInput = document.getElementById('timer-duration');
const sendButton = document.getElementById('send-button');
const textInput = document.getElementById('text-input');

// --- UI Helper Functions ---
function showStatus(message, isError = false) {
    statusDisplay.textContent = message;
    statusDisplay.className = isError ? 'error' : 'thinking';
}

function hideStatus() {
    statusDisplay.className = '';
}

function updateStudyUI(state) {
    if (state === 'STUDYING') {
        startStudyButton.textContent = '勉強中...';
        startStudyButton.disabled = true;
        completeStudyButton.style.display = 'inline-block';
        problemInput.disabled = true;
        timerDurationInput.disabled = true;
    } else { // IDLE or other states
        startStudyButton.textContent = '勉強をはじめる';
        startStudyButton.disabled = false;
        completeStudyButton.style.display = 'none';
        problemInput.disabled = false;
        timerDurationInput.disabled = false;
    }
}

// --- Main Application Logic ---
function setupSettingsUI(settingsManager) {
    document.getElementById('save-settings-button').addEventListener('click', () => {
        settingsManager.saveSettings();
    });

    document.getElementById('ai-service').addEventListener('change', (event) => {
        const selected = event.target.value;
        document.getElementById('gemini-settings').style.display = selected === 'gemini' ? 'flex' : 'none';
        document.getElementById('huggingface-settings').style.display = selected === 'huggingface' ? 'flex' : 'none';
    });
}

async function speak(speechController, avatarController, text) {
    await speechController.speak(
        text,
        () => avatarController.startTalking(),
        () => avatarController.stopTalking()
    );
}

async function main() {
    console.log("Application starting...");
    const { scene, animate, updatables } = setupScene();

    const settingsManager = new SettingsManager();
    const speechController = new SpeechController();
    const aiController = new AIController(settingsManager);
    const studyController = new StudyModeController();
    let avatarController;

    setupSettingsUI(settingsManager);
    settingsManager.loadSettings();

    try {
        const avatar = await loadAvatar(scene);
        avatarController = new AvatarController(avatar);
        updatables.push(avatarController);
    } catch (error) {
        console.error("Failed to load avatar", error);
        showStatus('アバターの読み込みに失敗しました。', true);
        return;
    }

    // --- Event Listeners ---
    startStudyButton.addEventListener('click', () => {
        const problemText = problemInput.value.trim();
        if (!problemText) {
            alert('まず問題を入力してください。');
            return;
        }
        const duration = parseInt(timerDurationInput.value, 10);
        studyController.startStudySession(duration, problemText);
        updateStudyUI('STUDYING');
    });

    completeStudyButton.addEventListener('click', async () => {
        studyController.completeStudySession();
        updateStudyUI('IDLE');
        showStatus('AIが賞賛を生成中...');
        try {
            const message = await aiController.generateCompletionMessage();
            await speak(speechController, avatarController, message);
        } catch (e) {
            showStatus(e.message, true);
        } finally {
            hideStatus();
        }
    });

    sendButton.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text || !avatarController) return;

        sendButton.disabled = true;
        textInput.value = '';
        showStatus('考え中...');

        try {
            const aiResponse = await aiController.generateResponse(text);
            await speak(speechController, avatarController, aiResponse);
        } catch (error) {
            showStatus(error.message, true);
        } finally {
            hideStatus();
            sendButton.disabled = false;
        }
    });

    // Setup the callback for the study timer
    studyController.setOnInterventionRequired(async (problemText, duration) => {
        showStatus('AIが声かけを準備中...');
        try {
            const message = await aiController.generateIntervention(problemText, duration);
            await speak(speechController, avatarController, message);
            // After intervention, stop the timer to prevent it from firing again,
            // but keep the state as STUDYING until the user clicks "complete".
            studyController.clearTimer();

        } catch (e) {
            showStatus(e.message, true);
        } finally {
            hideStatus();
        }
    });

    animate();
    console.log("Application ready.");
}

main();
