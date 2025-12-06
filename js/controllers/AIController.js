export class AIController {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        // System prompt for the AI persona
        this.systemPrompt = `あなたは物理ノートで学習するユーザーを見守るAIパートナーです。 ユーザーの思考が停止した際（時間経過時）に声をかけますが、絶対にすぐに答えを教えないでください。 『進み具合はどう？』『問題の意味はわかった？』など、状況を探る質問や、思考を促すヒントを小出しにしてください。 口調は親しみやすく、短文（1〜2文）で話しかけてください。`;
        this.history = [];
    }

    /**
     * Generates a response from the selected AI service for a user's direct chat message.
     * @param {string} prompt - The user's message.
     * @returns {Promise<string>} The AI's response.
     */
    async generateResponse(prompt) {
        this.history.push({ role: "user", parts: [{ text: prompt }] });
        const responseText = await this._fetchGeminiResponseWithHistory();
        this.history.push({ role: "model", parts: [{ text: responseText }] });
        return responseText;
    }

    /**
     * Generates a response for when the study timer fires.
     * @param {string} problemText - The problem the user is working on.
     * @param {number} duration - The duration in seconds that has passed.
     * @returns {Promise<string>} The AI's intervention message.
     */
    async generateIntervention(problemText, duration) {
        const interventionPrompt = `【システム報告】
ユーザーが以下の問題に取り組み始めてから、${duration}秒が経過しましたが、完了ボタンが押されていません。
沈黙が続いています。ユーザーの状況を気遣い、思考を再開させるための短い声かけを行ってください。(答えは言わないこと)

【対象の問題】
${problemText}`;
        this.history.push({ role: "user", parts: [{ text: interventionPrompt }] });
        const responseText = await this._fetchGeminiResponseWithHistory();
        this.history.push({ role: "model", parts: [{ text: responseText }] });
        return responseText;
    }

    /**
     * Generates a response for when the user completes the problem.
     * @returns {Promise<string>} The AI's celebratory message.
     */
    async generateCompletionMessage() {
        const completionPrompt = `【システム報告】
ユーザーが問題を解き終わりました！一緒に喜び、労いの言葉をかけてください。`;
        this.history.push({ role: "user", parts: [{ text: completionPrompt }] });
        const responseText = await this._fetchGeminiResponseWithHistory();
        this.history.push({ role: "model", parts: [{ text: responseText }] });
        return responseText;
    }

    /**
     * Main fetch logic for Gemini, now including conversation history.
     */
    async _fetchGeminiResponseWithHistory() {
        const settings = this.settingsManager.getSettings();
        const apiKey = settings.geminiApiKey;

        if (!apiKey) throw new Error('Gemini API key is missing.');

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: this.history,
                    systemInstruction: { parts: [{ text: this.systemPrompt }] },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API Error: ${errorData.error.message}`);
            }

            const data = await response.json();
            // Prune history if it gets too long
            if (this.history.length > 10) {
                this.history = this.history.slice(this.history.length - 8);
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Failed to fetch Gemini response:', error);
            throw error;
        }
    }

    // Note: HuggingFace logic is kept separate as it doesn't support system prompts or history in the same way.
    // We will focus on Gemini for the study mode features.
    async _fetchHuggingFaceResponse(prompt, apiKey, modelUrl) {
        if (!apiKey) throw new Error('Hugging Face API key is missing.');
        if (!modelUrl) throw new Error('Hugging Face model URL is missing.');

        try {
            const response = await fetch(modelUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data[0].generated_text || 'No response text found.';
        } catch (error) {
            console.error('Failed to fetch Hugging Face response:', error);
            throw error;
        }
    }
}
