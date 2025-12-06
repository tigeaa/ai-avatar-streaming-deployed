const StudyState = {
    IDLE: 'IDLE',
    STUDYING: 'STUDYING',
    INTERVENING: 'INTERVENING', // When AI is talking or waiting for response
};

export class StudyModeController {
    constructor() {
        this.state = StudyState.IDLE;
        this.timerId = null;
        this.onInterventionRequired = null; // Callback for when the timer fires
    }

    /**
     * Starts a new study session.
     * @param {number} duration - The timer duration in seconds.
     * @param {string} problemText - The text of the problem the user is working on.
     */
    startStudySession(duration, problemText) {
        if (this.state !== StudyState.IDLE) {
            console.warn('Cannot start a new session while already in one.');
            return;
        }

        console.log(`Starting study session for ${duration} seconds.`);
        this.state = StudyState.STUDYING;
        this.clearTimer(); // Clear any existing timer just in case

        this.timerId = setTimeout(() => {
            if (this.state === StudyState.STUDYING) {
                console.log('Timer fired. Intervention required.');
                this.state = StudyState.INTERVENING;
                if (this.onInterventionRequired) {
                    this.onInterventionRequired(problemText, duration);
                }
            }
        }, duration * 1000);
    }

    /**
     * Completes the current study session and stops the timer.
     */
    completeStudySession() {
        if (this.state === StudyState.IDLE) return;

        console.log('Study session completed by user.');
        this.clearTimer();
        this.state = StudyState.IDLE;
    }

    /**
     * Resets the application to its initial idle state.
     * Can be called after an intervention is handled.
     */
    resetToIdle() {
        this.clearTimer();
        this.state = StudyState.IDLE;
        console.log('State reset to IDLE.');
    }

    /**
     * Safely clears the timeout.
     */
    clearTimer() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Sets the callback function for when the timer fires.
     * @param {function} callback - The function to call.
     */
    setOnInterventionRequired(callback) {
        this.onInterventionRequired = callback;
    }

    getState() {
        return this.state;
    }
}
