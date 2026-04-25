/**
 * Logic Lens Advanced Pedagogy Engine
 * Handles Dynamic Error Mutation and Refactoring
 */

import { checkOllamaStatus, callOllama } from '../services/LocalMentorService';

const FALLBACK_VARIANTS = {
    'MISSING_COLON': [
        "def start() \n    pass",
        "if x > 10 \n    return True",
        "for i in range(5) \n    print(i)"
    ],
    'INDENTATION': [
        "if True:\nprint('hello')",
        "def func():\nx = 1\nreturn x",
        "while False:\npass"
    ],
    'NAME_ERROR': [
        "x = y + 5",
        "print(result)",
        "return undefined_val * 2"
    ]
};

/**
 * Generate 3 variants of an error based on student's current code
 */
export const getErrorVariants = async (errorType, contextCode) => {
    const isOnline = await checkOllamaStatus();
    
    if (!isOnline) {
        return FALLBACK_VARIANTS[errorType?.toUpperCase()] || [
            "# Fix this:\n" + contextCode.replace(':', ''),
            "# And this:\n" + contextCode.replace('=', '=='),
            "# One more:\n" + contextCode.replace('print', 'prnt')
        ];
    }

    const prompt = `
    Student's code has a ${errorType} error. 
    Code snippet: "${contextCode}"
    
    Generate 3 DIFFERENT simple Python code snippets that have the SAME type of error (${errorType}).
    These must be mutations of the student's original intent or common Python patterns.
    Return ONLY the code snippets separated by "---". No explanation.
    
    Example for MISSING_COLON:
    if x > 5
    ---
    def calculate(n)
    ---
    for i in range(10)
    `;

    try {
        const response = await callOllama(prompt);
        if (!response) throw new Error("No response from Ollama");
        
        const variants = response.split("---").map(v => v.trim()).filter(v => v.length > 0);
        return variants.length >= 3 ? variants.slice(0, 3) : FALLBACK_VARIANTS[errorType] || variants;
    } catch (e) {
        return FALLBACK_VARIANTS[errorType] || [];
    }
};

/**
 * Expert Refactor Suggestions (Template based for now, could be LLM powered later)
 */
export const getRefactorSuggestions = (patternId, userCode) => {
    const suggestions = {
        'calculate_average': [
            {
                type: 'Expert',
                title: 'Using built-in sum() and len()',
                code: "def calculate_average(nums):\n    if not nums: return 0\n    return sum(nums) / len(nums)",
                benefit: "Shorter and more readable using Python's power."
            }
        ]
    };

    return suggestions[patternId] || [{
        type: 'General',
        title: 'Better Naming',
        code: userCode.replace(/x|y|i|j/g, 'item'),
        benefit: "Descriptive names improve code maintainability."
    }];
};
