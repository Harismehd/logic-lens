import { PATTERNS } from '../data/patterns';

export const matchRequirement = (input) => {
    const text = input.toLowerCase();
    
    // Find patterns where at least one keyword is present
    const matches = PATTERNS.filter(pattern => 
        pattern.keywords.some(keyword => text.includes(keyword))
    );

    if (matches.length > 0) {
        // Simple ranking: pattern with most keyword matches wins
        return matches.sort((a, b) => {
            const aMatches = a.keywords.filter(k => text.includes(k)).length;
            const bMatches = b.keywords.filter(k => text.includes(k)).length;
            return bMatches - aMatches;
        })[0];
    }

    // Problem 1 Fix: Always accept any mission
    return {
        id: "dynamic_mission",
        title: input,
        push_start: "# Start your code here\n",
        sample_input: "[]",
        sample_output: "",
        dynamic: true
    };
};
