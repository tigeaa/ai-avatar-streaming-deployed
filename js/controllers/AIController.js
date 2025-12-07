export class AIController {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }

    async generateResponse(prompt) {
        const settings = this.settingsManager.getSettings();
        const { aiService } = settings;

        if (aiService === 'gemini') {
            return this._fetchGeminiResponse(prompt, settings.geminiApiKey);
        } else if (aiService === 'huggingface') {
            return this._fetchHuggingFaceResponse(prompt, settings.hfApiKey, settings.hfModelUrl);
        } else {
            throw new Error('Invalid AI service selected.');
        }
    }

    async _fetchGeminiResponse(prompt, apiKey) {
        if (!apiKey) throw new Error('Gemini API key is missing.');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API Error: ${errorData.error.message}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Failed to fetch Gemini response:', error);
            throw error;
        }
    }

    async _fetchHuggingFaceResponse(prompt, apiKey, modelUrl) {
        if (!apiKey) throw new Error('Hugging Face API key is missing.');
        if (!modelUrl) throw new Error('Hugging Face model URL is missing.');

        try {
            const response = await fetch(modelUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputs: prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            // The response structure can vary. We assume the main generated text is in `generated_text`.
            return data[0].generated_text || 'No response text found.';
        } catch (error) {
            console.error('Failed to fetch Hugging Face response:', error);
            throw error;
        }
    }
}
