/**
 * Logic Lens Comparison Engine
 * Verified Real Python Output Comparison
 */

export const compareLogic = async (userCode, pattern, actualResult) => {
    const results = {
        passed: false,
        tier: '',
        message: '',
        diff: null
    };

    // Tier 1: Real Output Comparison
    // actualResult is passed from RealCompilerService execution
    const expected = pattern.sample_output;
    
    // Loose comparison for numbers/strings
    const actualStr = String(actualResult).trim();
    const expectedStr = String(expected).trim();

    if (actualStr === expectedStr || Number(actualStr) === Number(expectedStr)) {
        results.passed = true;
        results.tier = 'Output';
        results.message = 'Logic verified! Output matches mission requirements.';
        return results;
    }

    // Tier 2: Structural Verification (Regex based for offline stability)
    const hasRequiredStructure = verifyStructure(userCode, pattern.id);
    if (hasRequiredStructure) {
        results.tier = 'Structural';
        results.message = 'Logic structure is correct, but your return value is off. Double check your calculation.';
        results.diff = { expected, actual: actualResult };
        return results;
    }

    results.tier = 'Trace';
    results.message = 'The output doesn\'t match and the structure seems off.';
    results.diff = { expected, actual: actualResult };
    
    return results;
};

const verifyStructure = (code, patternId) => {
    const structures = {
        'calculate_average': [/def\s+calculate_average/, /return/, /\/|sum|len/],
        'find_largest': [/def\s+find_largest/, /return/, />|max/]
    };
    
    const requirements = structures[patternId] || [/def/, /return/];
    return requirements.every(regex => regex.test(code));
};
