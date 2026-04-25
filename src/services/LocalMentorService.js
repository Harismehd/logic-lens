/**
 * Logic Lens Local Mentor Service
 * Powered by Ollama + Mistral 7B (Socratic Edition)
 */

const OLLAMA_URL = "http://localhost:3001/api/ollama/generate";
const TIMEOUT_MS = 5000;
let CURRENT_MODEL = "mistral"; // Default, will be updated by checkOllamaStatus

const OFFLINE_EXPLANATIONS = {
    'indentation': "Python uses indentation to group code. Ensure all lines in a block have 4 spaces.",
    'missing_colon': "A colon (:) starts a new block. Add it after 'if', 'def', 'for', etc.",
    'syntax': "The grammar of your code is incorrect. Look for typos or missing symbols.",
    'name': "You are using a name (variable/function) that hasn't been defined yet."
};

/**
 * Check if Ollama is accessible
 */
export const checkOllamaStatus = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        const response = await fetch("http://localhost:3001/api/ollama/tags", {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.models && data.models.length > 0) {
                const hasMistral = data.models.some(m => m.name.includes("mistral"));
                if (!hasMistral) {
                    CURRENT_MODEL = data.models[0].name;
                } else {
                    CURRENT_MODEL = "mistral";
                }
                return true;
            }
        }
        return false;
    } catch (e) {
        console.warn("Ollama status check failed or timed out:", e.name === 'AbortError' ? 'Timeout' : e.message);
        return false;
    }
};

export const getCurrentModel = () => CURRENT_MODEL;

/**
 * Generic caller for Ollama
 */
export const callOllama = async (prompt) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: CURRENT_MODEL,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.7 }
            })
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        return data.response;
    } catch (e) {
        console.error("Ollama connection error or timeout:", e.name === 'AbortError' ? 'Timeout' : e.message);
        return null;
    }
};

/**
 * Socratic Mentor Logic
 */
export const getLocalMentorResponse = async (code, query, errors, activePattern) => {
    const isOnline = await checkOllamaStatus();
    
    if (!isOnline) {
        return getOfflineResponse(code, query, errors, activePattern);
    }

    const errorContext = errors.length > 0 
        ? `The student has these errors: ${JSON.stringify(errors)}`
        : "The code has no syntax errors.";

    const prompt = `
    You are a Socratic programming mentor for a student using the "Logic Lens" compiler.
    Your goal is to guide them to the answer without giving the solution.
    
    STUDENT CODE:
    \`\`\`python
    ${code}
    \`\`\`
    
    CONTEXT:
    ${errorContext}
    Mission: ${activePattern ? activePattern.title : "General Practice"}
    
    STUDENT QUESTION: "${query}"
    
    INSTRUCTIONS:
    - Analyze their ACTUAL code and variables.
    - If there are errors, guide them to fix the errors first.
    - Use Socratic questioning.
    - Reference specific lines or variables.
    - Be encouraging but firm on logic.
    - Keep it concise (max 3-4 sentences).
    
    MENTOR RESPONSE:`;

    const response = await callOllama(prompt);
    return response || getOfflineResponse(code, query, errors, activePattern);
};

/**
 * Verify Student Explanation (used in Explain Mode)
 */
export const verifyExplanation = async (codeLine, studentExplanation) => {
    const isOnline = await checkOllamaStatus();
    if (!isOnline) {
        const isLongEnough = studentExplanation.trim().length > 20;
        return { 
            isCorrect: isLongEnough, 
            feedback: isLongEnough 
                ? "Your explanation looks solid! You've grasped the core logic of this line." 
                : "Could you be a bit more specific? Explain exactly what's happening to the variables in this line." 
        };
    }

    const prompt = `
    Analyze this student's explanation of a specific line of Python code.
    
    LINE: "${codeLine}"
    EXPLANATION: "${studentExplanation}"
    
    INSTRUCTIONS:
    - If accurate, return isCorrect: true.
    - If vague or incorrect, return isCorrect: false.
    - Feedback should be one clear, encouraging sentence.
    - If correct, confirm their logic (e.g., "Spot on! You've correctly identified that this line concatenates strings.").
    - If incorrect, ask a Socratic question to guide them (e.g., "Think about what happens to the result of the addition. Where is it stored?").
    
    Respond ONLY in JSON:
    { "isCorrect": boolean, "feedback": "string" }
    `;

    const response = await callOllama(prompt);
    try {
        const jsonMatch = response.match(/\{.*\}/s);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        return {
            isCorrect: !!parsed.isCorrect,
            feedback: parsed.feedback || (parsed.isCorrect ? "Correct! Great job." : "Not quite. Can you elaborate?")
        };
    } catch (e) {
        const isLongEnough = studentExplanation.length > 20;
        return { 
            isCorrect: isLongEnough, 
            feedback: isLongEnough 
                ? "Excellent explanation. You've clearly understood how this logic functions."
                : "I'd like a bit more detail. What exactly is this line doing with the data?"
        };
    }
};

/**
 * Fallback Offline Logic
 */
const getOfflineResponse = (code, query, errors, activePattern) => {
    const q = query.toLowerCase();
    if (errors.length > 0) {
        const err = errors[0];
        const reason = OFFLINE_EXPLANATIONS[err.type] || err.message;
        return `[Offline Mode] I notice an issue on line ${err.line}: ${err.message}. ${reason}`;
    }
    if (q.includes("wrong") || q.includes("help")) {
        return "[Offline Mode] Your syntax looks good! Focus on the mission logic.";
    }
    return "[Offline Mode] I'm currently offline. Ask about specific errors or syntax keywords.";
};
