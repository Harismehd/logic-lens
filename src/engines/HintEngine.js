/**
 * Logic Lens Hint Engine
 * Implements 5-level Socratic hierarchy with escalation
 */

export const HINT_LEVELS = {
  STRUCTURAL: 1,
  LOCATIONAL: 2,
  CONCEPTUAL: 3,
  PATTERN: 4,
  DIRECT_PUSH: 5
};

// State to track student progress per concept
const hintState = {
    errorCounts: {}, // conceptKey -> count
    shownHints: new Set() // unique hint strings
};

export const generateHint = (error, conceptKey = 'default') => {
  if (!error) return null;

  // Track error frequency to escalate level
  hintState.errorCounts[conceptKey] = (hintState.errorCounts[conceptKey] || 0) + 1;
  const level = Math.min(hintState.errorCounts[conceptKey], 5);

  const hints = {
    [HINT_LEVELS.STRUCTURAL]: `Check line ${error.line}. The structure looks incomplete here.`,
    
    [HINT_LEVELS.LOCATIONAL]: `Focus on the very end of line ${error.line}. Python is strict about block delimiters.`,
    
    [HINT_LEVELS.CONCEPTUAL]: error.message.includes('colon') 
        ? "Concept: In Python, colons (:) act like doorways into blocks of code."
        : "Concept: Python relies on indentation and specific symbols to group logic.",
    
    [HINT_LEVELS.PATTERN]: error.message.includes('colon')
        ? "Pattern check: Does your definition look like 'def name():'?"
        : "Pattern check: Are you following the standard Python syntax for this statement?",
    
    [HINT_LEVELS.DIRECT_PUSH]: error.message.includes('colon')
        ? "Action: Place a colon ':' at the end of line " + error.line
        : "Action: Verify the syntax on line " + error.line + " exactly matches Python standards."
  };

  const hintText = hints[level] || hints[HINT_LEVELS.STRUCTURAL];
  
  // Ensure we don't repeat the same hint in a row if possible
  if (hintState.shownHints.has(hintText) && level < 5) {
      return generateHint(error, conceptKey); // Recursive attempt to find next if state allowed
  }

  hintState.shownHints.add(hintText);
  return hintText;
};

export const resetHintState = () => {
    hintState.errorCounts = {};
    hintState.shownHints.clear();
};
