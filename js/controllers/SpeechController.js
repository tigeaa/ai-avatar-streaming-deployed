export class SpeechController {
    constructor() {
        this.synth = window.speechSynthesis;
    }

    speak(text, onStart, onEnd) {
        return new Promise((resolve, reject) => {
            if (this.synth.speaking) {
                this.synth.cancel();
            }

            if (text === '') {
                return reject('Text is empty.');
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';

            utterance.onstart = () => {
                if (onStart) onStart();
            };

            utterance.onend = () => {
                if (onEnd) onEnd();
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                if (onEnd) onEnd(); // Ensure talking stops on error
                reject(event);
            };

            // Ensure voices are loaded before speaking
            let voices = this.synth.getVoices();
            if (voices.length > 0) {
                const japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
                if (japaneseVoice) utterance.voice = japaneseVoice;
                this.synth.speak(utterance);
            } else {
                this.synth.onvoiceschanged = () => {
                    voices = this.synth.getVoices();
                    const japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
                    if (japaneseVoice) utterance.voice = japaneseVoice;
                    this.synth.speak(utterance);
                };
            }
        });
    }
}
