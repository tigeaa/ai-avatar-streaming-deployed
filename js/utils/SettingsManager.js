export class SettingsManager {
    constructor() {
        // DOM elements
        this.aiServiceSelect = document.getElementById('ai-service');
        this.geminiApiKeyInput = document.getElementById('gemini-api-key');
        this.hfApiKeyInput = document.getElementById('hf-api-key');
        this.hfModelUrlInput = document.getElementById('hf-model-url');
        this.saveButton = document.getElementById('save-settings-button');
    }

    /**
     * Loads settings from localStorage and populates the UI fields.
     */
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('aiAvatarSettings')) || {};

        if (settings.aiService) {
            this.aiServiceSelect.value = settings.aiService;
        }
        if (settings.geminiApiKey) {
            this.geminiApiKeyInput.value = settings.geminiApiKey;
        }
        if (settings.hfApiKey) {
            this.hfApiKeyInput.value = settings.hfApiKey;
        }
        if (settings.hfModelUrl) {
            this.hfModelUrlInput.value = settings.hfModelUrl;
        }

        // Trigger change event to show/hide correct settings panel on load
        this.aiServiceSelect.dispatchEvent(new Event('change'));
    }

    /**
     * Saves the current UI settings to localStorage and provides visual feedback.
     */
    saveSettings() {
        const settings = {
            aiService: this.aiServiceSelect.value,
            geminiApiKey: this.geminiApiKeyInput.value,
            hfApiKey: this.hfApiKeyInput.value,
            hfModelUrl: this.hfModelUrlInput.value,
        };

        localStorage.setItem('aiAvatarSettings', JSON.stringify(settings));

        // Provide non-blocking feedback
        const originalButtonText = this.saveButton.textContent;
        this.saveButton.textContent = 'Saved!';
        this.saveButton.style.backgroundColor = '#218838'; // Darker green

        setTimeout(() => {
            this.saveButton.textContent = originalButtonText;
            this.saveButton.style.backgroundColor = '#28a745'; // Original green
        }, 1500);
    }

    /**
     * Gets the current settings from the UI.
     * @returns {object} The current settings.
     */
    getSettings() {
        return {
            aiService: this.aiServiceSelect.value,
            geminiApiKey: this.geminiApiKeyInput.value,
            hfApiKey: this.hfApiKeyInput.value,
            hfModelUrl: this.hfModelUrlInput.value,
        };
    }
}
