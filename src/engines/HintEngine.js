import { ERROR_DATABASE } from '../data/ErrorDatabase';

/**
 * Logic Lens Hint Engine (Enhanced)
 * Implements 5-level Socratic hierarchy with escalation based on the Error Database
 */

export const HINT_LEVELS = {
  IMMEDIATE: 1,
  CONTEXT: 2,
  PATTERN: 3,
  SYSTEMIC: 4,
  CONCEPT: 5
};

// State to track student progress per concept
const hintState = {
    errorHistory: [], // Array of { type, conceptId, timestamp, line }
    conceptEscalation: {}, // conceptId -> level
    shownHints: new Set() // unique hint strings to avoid immediate repetition
};

/**
 * Finds the classification for a given error message
 */
const classifyError = (errorMessage, errorType) => {
    const categories = Object.values(ERROR_DATABASE);
    for (const category of categories) {
        for (const [key, meta] of Object.entries(category)) {
            if (meta.triggers.some(t => new RegExp(t, 'i').test(errorMessage))) {
                return { key, ...meta };
            }
        }
    }
    return null;
};

export const generateLayeredHint = (error, currentLevel = 1) => {
    if (!error) return null;

    const classification = classifyError(error.message, error.type);
    if (!classification) return {
        level: currentLevel,
        text: error.hint || `Check line ${error.line}: ${error.message}`
    };

    const hints = classification.hints || [];
    const levelIndex = Math.min(currentLevel - 1, hints.length - 1);
    
    return {
        level: currentLevel,
        text: hints[levelIndex] || hints[0],
        concept: classification.concept,
        explanation: classification.explanation,
        examples: classification.examples,
        quickFix: classification.quickFix
    };
};

/**
 * Pattern Detection: Detect repeated errors
 */
export const trackErrorPattern = (error) => {
    const classification = classifyError(error.message, error.type);
    if (!classification) return null;

    const conceptId = classification.concept.id;
    const now = Date.now();
    
    // Only add to history if it's a NEW error event (different line or different type)
    // to avoid over-counting during rapid typing scans
    const lastError = hintState.errorHistory[hintState.errorHistory.length - 1];
    const isSameAsLast = lastError && 
                         lastError.line === error.line && 
                         lastError.type === classification.key &&
                         (now - lastError.timestamp) < 5000; // Within 5 seconds

    if (!isSameAsLast) {
        hintState.errorHistory.push({
            type: classification.key,
            conceptId: conceptId,
            timestamp: now,
            line: error.line
        });
    }

    // Count recent UNIQUE error events (deduplicated by timestamp window)
    const recentErrors = hintState.errorHistory.filter(e => 
        e.conceptId === conceptId && (now - e.timestamp) < 60000 // Last 60 seconds
    );

    if (recentErrors.length >= 3) {
        return {
            mode: 'intensive',
            message: `You've made ${recentErrors.length} errors related to ${classification.concept.name} recently.`,
            tip: `Key Tip: ${classification.hints[2]}`
        };
    }

    return { mode: 'normal' };
};

export const resetHintState = () => {
    hintState.errorHistory = [];
    hintState.conceptEscalation = {};
    hintState.shownHints.clear();
};
