/**
 * Logic Lens Safety Engine
 * Handles Execution Security, Timeouts, and Static Analysis
 */

export const analyzeSafety = (code) => {
    const issues = [];
    
    // 1. Infinite While Loop Predictor
    if (code.includes('while')) {
        const whileBlocks = code.match(/while\s+([^:]+):[\s\S]+?(?=\ndef|if|while|for|$)/g);
        if (whileBlocks) {
            whileBlocks.forEach(block => {
                const condition = block.match(/while\s+([^:]+):/)[1];
                
                // Check if loop variable exists and is modified
                const loopVarMatch = condition.match(/([a-zA-Z_]\w*)\s*(<|>|<=|>=|!=)/);
                if (loopVarMatch) {
                    const loopVar = loopVarMatch[1];
                    const modificationRegex = new RegExp(`${loopVar}\\s*([+\\-*/%]=|=)|${loopVar}\\+\\+|${loopVar}--`);
                    if (!modificationRegex.test(block)) {
                        issues.push({
                            type: 'INFINITE_LOOP_PREDICTION',
                            message: `⚠️ Potential infinite loop: '${loopVar}' never changes inside while loop.`
                        });
                    }
                }

                if (condition.includes('True') || condition.includes('1 == 1')) {
                    // Check if there's a break inside (very basic check)
                    if (!code.includes('break')) {
                        issues.push({
                            type: 'INFINITE_LOOP',
                            message: "⚠️ Warning: Potential infinite loop detected (while True). Ensure you have a 'break' condition."
                        });
                    }
                }
            });
        }
    }

    // 2. Dead For Loop
    if (code.includes('range(0, 0)') || code.includes('range(1, 0)')) {
        issues.push({
            type: 'DEAD_LOOP',
            message: "⚠️ Warning: This loop will never execute (range start is >= end)."
        });
    }

    // 3. Recursion without Base Case (Very basic)
    const funcMatch = code.match(/def\s+(\w+)\(([^)]*)\):/);
    if (funcMatch) {
        const funcName = funcMatch[1];
        if (code.includes(`${funcName}(`) && !code.includes('if')) {
            issues.push({
                type: 'RECURSION_RISK',
                message: "⚠️ Warning: Recursive call detected without an 'if' base case. This may cause a stack overflow."
            });
        }
    }

    return issues;
};

export const instrumentCodeForSafety = (code) => {
    // 1. Inject safety header
    const safetyHeader = [
        "import time",
        "_start_time = time.time()",
        "_iter_count = 0",
        "def _check_safety():",
        "    global _iter_count",
        "    _iter_count += 1",
        "    if _iter_count % 1000 == 0:",
        "        if time.time() - _start_time > 3:",
        "            raise Exception('SAFETY_ERROR: Execution timeout (possible infinite loop)')",
        ""
    ].join('\n');

    // 2. Inject heartbeat into every loop
    const lines = code.split('\n');
    const instrumentedLines = [];
    
    for (let line of lines) {
        instrumentedLines.push(line);
        const trimmed = line.trim();
        // Detect loop starts (while/for ending in colon)
        if ((trimmed.startsWith('while ') || trimmed.startsWith('for ')) && trimmed.endsWith(':')) {
            const indent = line.match(/^\s*/)[0];
            instrumentedLines.push(`${indent}    _check_safety()`);
        }
    }

    return safetyHeader + instrumentedLines.join('\n');
};

export const runWithTimeout = async (task, timeoutMs = 5000) => {
    return Promise.race([
        task(),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Infinite loop detected or code too slow.")), timeoutMs)
        )
    ]);
};
