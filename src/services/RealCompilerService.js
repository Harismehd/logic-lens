import { instrumentCodeForSafety } from '../engines/SafetyEngine';

let pyodideInstance = null;
let pyodidePromise = null;

export const loadPyodide = async () => {
    if (pyodideInstance) return pyodideInstance;
    if (pyodidePromise) return pyodidePromise;

    pyodidePromise = (async () => {
        console.log("[Pyodide] Initialization started...");
        
        // Wait for window.loadPyodide to be available (max 10s)
        let attempts = 0;
        while (!window.loadPyodide && attempts < 20) {
            console.log(`[Pyodide] Waiting for script tag... (Attempt ${attempts + 1})`);
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!window.loadPyodide) {
            console.error("[Pyodide] window.loadPyodide not found after 10s.");
            pyodidePromise = null; // Allow retry
            throw new Error("Python engine script is missing or blocked by your browser.");
        }

        try {
            console.log("[Pyodide] Loading from local public/pyodide/...");
            const pyodide = await window.loadPyodide({
                indexURL: "/pyodide/"
            });
            
            // Set safety limits
            await pyodide.runPythonAsync(`
import sys
sys.setrecursionlimit(500) # Prevents browser-crashing stack overflows
`);

            console.log("[Pyodide] Instance ready.");
            pyodideInstance = pyodide;
            return pyodide;
        } catch (e) {
            console.error("[Pyodide] Load failed:", e);
            pyodidePromise = null;
            throw e;
        }
    })();

    return pyodidePromise;
};

export const executePython = async (code, params = [], inputHistory = []) => {
    const pyodide = await loadPyodide();
    
    // Capture stdout
    let stdout = "";
    pyodide.setStdout({
        batched: (text) => { stdout += text + "\n"; }
    });

    // Mock input() to use our history buffer
    const localInputHistory = Array.isArray(inputHistory) ? [...inputHistory] : [];
    pyodide.globals.set("js_input", (prompt) => {
        if (localInputHistory.length > 0) {
            return localInputHistory.shift();
        }
        // No more inputs in history? Signal that we need one.
        throw new Error(`INPUT_REQUIRED:${prompt || ""}`);
    });

    // Inject the bridge into Python
    await pyodide.runPythonAsync(`
import builtins
import sys

def custom_input(prompt=""):
    # Print prompt to stdout so user sees it in console
    if prompt:
        print(prompt, end="")
    return js_input(prompt)

builtins.input = custom_input
`);

    try {
        // Instrument code for safety (Infinite loop protection)
        const safeCode = instrumentCodeForSafety(code);
        
        // Execute the user code
        await pyodide.runPythonAsync(safeCode);

        // If it's a function mission, find the function and call it
        const funcNameMatch = code.match(/def\s+(\w+)\(/);
        let returnValue = null;
        
        if (funcNameMatch) {
            const funcName = funcNameMatch[1];
            const pythonFunc = pyodide.globals.get(funcName);
            if (pythonFunc) {
                const rawValue = pythonFunc(...params);
                // Convert PyProxy to JS if necessary
                returnValue = (rawValue && typeof rawValue.toJs === 'function') ? rawValue.toJs() : rawValue;
            }
        }

        return {
            success: true,
            stdout: stdout.trim(),
            returnValue,
            error: null
        };
    } catch (e) {
        // Handle our special input required signal
        if (e.message.includes("INPUT_REQUIRED:")) {
            const prompt = e.message.split("INPUT_REQUIRED:")[1].trim();
            return {
                success: true,
                awaitingInput: true,
                prompt: prompt,
                stdout: stdout.trim()
            };
        }

        // Handle Safety Timeout
        if (e.message.includes("SAFETY_ERROR:")) {
            return {
                success: false,
                stdout: stdout.trim(),
                error: { message: "CRITICAL: Infinite loop detected and terminated to save your browser! Check your loop conditions." }
            };
        }

        // Handle Recursion Error
        if (e.message.includes("recursion depth exceeded")) {
            return {
                success: false,
                stdout: stdout.trim(),
                error: { message: "CRITICAL: Recursion Bomb detected! (Stack Overflow). Ensure your recursive function has a base case." }
            };
        }

        // Extract line number from Python traceback
        const lineMatch = e.message.match(/Line (\d+)/i) || e.message.match(/line (\d+)/);
        return {
            success: false,
            stdout: stdout.trim(),
            returnValue: null,
            error: {
                message: e.message,
                line: lineMatch ? parseInt(lineMatch[1]) : null
            }
        };
    }
};

export const runWithTimeout = async (code, params = [], timeoutMs = 5000, inputHistory = []) => {
    // If Pyodide isn't loaded yet, the first call might take longer than timeoutMs
    // Let's ensure it's loaded first without the race timer
    try {
        await loadPyodide();
    } catch (e) {
        return { success: false, error: { message: `Failed to load Python engine: ${e.message}` } };
    }

    return Promise.race([
        executePython(code, params, inputHistory),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Execution timeout – infinite loop detected")), timeoutMs)
        )
    ]);
};
