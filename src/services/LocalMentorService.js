/**
 * Logic Lens Mentor Service
 * Powered by Google Gemini Pro
 */
// Groq API implementation
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL_NAME = "llama-3.3-70b-versatile"; 
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const OFFLINE_EXPLANATIONS = {
    'indentation': "Python uses indentation to group code. Ensure all lines in a block have 4 spaces.",
    'missing_colon': "A colon (:) starts a new block. Add it after 'if', 'def', 'for', etc.",
    'syntax': "The grammar of your code is incorrect. Look for typos or missing symbols.",
    'name': "You are using a name (variable/function) that hasn't been defined yet."
};

/**
 * Check if Gemini is configured and accessible
 */
export const callGemini = async (prompt) => {
    if (!API_KEY) return null;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[MentorService] Groq API Error:", JSON.stringify(errorData, null, 2));
            if (response.status === 429) return "ERROR_RATE_LIMIT";
            return null;
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error("[MentorService] Network Error:", e);
        return null;
    }
};

/**
 * Socratic Mentor Logic
 */
export const getLocalMentorResponse = async (code, query, errors, activePattern) => {
    const isOnline = await checkMentorStatus();
    
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

    const response = await callGemini(prompt);
    
    if (response === "ERROR_RATE_LIMIT") {
        return "I'm receiving too many requests right now. Take a deep breath, review your code again, and try asking me in 30 seconds!";
    }
    
    return response || getOfflineResponse(code, query, errors, activePattern);
};

/**
 * Verify Student Explanation (used in Explain Mode)
 */
export const verifyExplanation = async (codeLine, studentExplanation) => {
    const isOnline = await checkMentorStatus();
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
    - Provide a pedagogical score from 0 to 100 based on accuracy and depth.
    - Feedback should be constructive and encouraging.
    - If correct, explain WHY it's correct (e.g., "Spot on! You've correctly identified that this line concatenates strings.").
    - If incorrect, ask a Socratic question to guide them.
    
    Respond STRICTLY in JSON format:
    { "isCorrect": boolean, "score": number, "feedback": "string" }
    `;

    const response = await callGemini(prompt);
    
    if (response === "ERROR_RATE_LIMIT") {
        return { isCorrect: true, score: 85, feedback: "You're moving fast! I'm hitting a rate limit, but your explanation looks good enough for now. Keep going!" };
    }

    try {
        const jsonMatch = response.match(/\{.*\}/s);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        return {
            isCorrect: parsed.score >= 70,
            score: parsed.score || 0,
            feedback: parsed.feedback || (parsed.isCorrect ? "Correct! Great job." : "Not quite. Can you elaborate?")
        };
    } catch (e) {
        const isLongEnough = studentExplanation.length > 20;
        return { 
            isCorrect: isLongEnough, 
            score: isLongEnough ? 75 : 40,
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
        return `[Standard Guidance] I notice an issue on line ${err.line}: ${err.message}. ${reason}`;
    }
    if (q.includes("wrong") || q.includes("help")) {
        return "Your syntax looks good! Focus on the mission logic and what you're trying to achieve step-by-step.";
    }
    return "I'm currently focused on helping you fix specific errors. Try running your code to see if it behaves as expected!";
};

// Backward Compatibility Aliases
export const checkMentorStatus = async () => {
    return !!API_KEY;
};
export const checkOllamaStatus = checkMentorStatus;
export const callOllama = callGemini;
