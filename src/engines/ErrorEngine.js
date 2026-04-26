import { Parser, Language } from 'web-tree-sitter';

export const ERROR_TYPES = {
  SYNTAX: 'syntax',
  TYPE: 'type',
  NAME: 'name',
  INDENTATION: 'indentation',
  MISSING_COLON: 'missing_colon',
  RUNTIME: 'runtime',
  WARNING: 'warning',
  HINT: 'hint',
  SUCCESS: 'success'
};

export const COLOR_MAP = {
  [ERROR_TYPES.SYNTAX]: '#FF0000',
  [ERROR_TYPES.TYPE]: '#FF5500',
  [ERROR_TYPES.NAME]: '#FFA500',
  [ERROR_TYPES.INDENTATION]: '#FF00FF',
  [ERROR_TYPES.RUNTIME]: '#FF3333',
  [ERROR_TYPES.WARNING]: '#FFFF00',
  [ERROR_TYPES.HINT]: '#00FFFF',
  [ERROR_TYPES.SUCCESS]: '#00FF88',
  'correct': '#00FF00'
};

let parser = null;
let Python = null;
let isInitializing = false;
let initializationFailed = false;

/**
 * Initialize Tree-sitter Parser
 */
export const initParser = async () => {
    if (parser && Python) return true;
    if (isInitializing) return false;

    isInitializing = true;
    try {
        await Parser.init({
            locateFile(scriptName) {
                return `/${scriptName}`;
            }
        });
        parser = new Parser();
        Python = await Language.load('/tree-sitter-python.wasm');
        parser.setLanguage(Python);
        isInitializing = false;
        console.log("Logic Lens: ErrorEngine (Tree-sitter) Initialized.");
        return true;
    } catch (e) {
        console.error("Logic Lens: ErrorEngine failed to initialize Tree-sitter:", e);
        initializationFailed = true;
        isInitializing = false;
        return false;
    }
};

/**
 * Fallback Regex Scanner (Used if Tree-sitter fails to load)
 */
const fallbackScan = (code) => {
    const lines = code.split('\n');
    const errors = [];
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return;

        // Simple colon check
        const blockStarters = ['def', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'class'];
        const firstWord = trimmedLine.split(/\s+/)[0];
        if (blockStarters.includes(firstWord) && !trimmedLine.endsWith(':')) {
            errors.push({
                line: lineNumber,
                column: line.length || 1,
                type: ERROR_TYPES.MISSING_COLON,
                message: `Missing colon (:) at end of ${firstWord} statement.`,
                hint: "Block statements like 'if' or 'def' need a colon at the end."
            });
        }
    });
    return errors;
};

/**
 * Main Scanning Logic
 */
export const scanPythonCode = (code) => {
    if (initializationFailed || !parser) {
        return fallbackScan(code);
    }

    try {
        const tree = parser.parse(code);
        const errors = [];
        const symbolTable = new Set();
        
        // Add built-ins to symbol table
        ['print', 'range', 'len', 'sum', 'min', 'max', 'int', 'str', 'float', 'list', 'dict', 'set', 'bool', 'True', 'False', 'None', 'input', 'enumerate', 'reversed', 'sorted', 'zip', 'any', 'all', 'tuple', 'Exception', 'ValueError', 'IndexError', 'KeyError'].forEach(b => symbolTable.add(b));

        // 0. Prediction: Check for common mistakes before they become errors
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            // Predict missing == in if/while
            if ((trimmed.startsWith('if ') || trimmed.startsWith('while ')) && trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=') && !trimmed.includes('>=') && !trimmed.includes('<=') && !trimmed.includes(' in ')) {
                errors.push({
                    line: idx + 1,
                    column: line.indexOf('=') + 1,
                    type: ERROR_TYPES.WARNING,
                    message: "Potential assignment in condition. Did you mean '=='?",
                    prediction: true,
                    hint: "Use '==' to compare values, '=' to assign values."
                });
            }
        });

        walkTree(tree.rootNode, errors, symbolTable, code);
        
        return errors;
    } catch (e) {
        console.error("Scanning error:", e);
        return [];
    }
};

/**
 * Helper to add all identifiers found within a node to the symbol table
 */
const addIdentifiersToSymbolTable = (node, symbolTable, code) => {
    if (!node) return;
    if (node.type === 'identifier') {
        symbolTable.add(code.substring(node.startIndex, node.endIndex));
    } else {
        for (let i = 0; i < node.childCount; i++) {
            addIdentifiersToSymbolTable(node.child(i), symbolTable, code);
        }
    }
};

/**
 * AST Walker for error detection and scope tracking
 */
const walkTree = (node, errors, symbolTable, code, depth = 0) => {
    // 1. Detection of ERROR nodes (Syntax Errors)
    if (node.type === 'ERROR' || node.isMissing) {
        const start = node.startPosition;
        const end = node.endPosition;
        
        let message = "Invalid syntax.";
        let type = ERROR_TYPES.SYNTAX;
        let hint = "Check your parentheses, colons, or quotes.";

        if (node.isMissing) {
            const missingType = node.type;
            message = `Missing '${missingType}'.`;
            if (missingType === ':') type = ERROR_TYPES.MISSING_COLON;
        }

        // Refine message based on content/context
        const nodeText = code.substring(node.startIndex, node.endIndex);
        if (nodeText.includes("'") || nodeText.includes('"')) {
            message = "Unclosed string or invalid quote usage.";
            hint = "Ensure your quotes match: '...' or \"...\"";
        }

        // Check for missing colon after block starters if not already caught
        const parentText = node.parent ? code.substring(node.parent.startIndex, node.parent.endIndex) : "";
        if (parentText.match(/^(if|for|while|def|class|elif|else|try|except)/) && !parentText.includes(':')) {
             message = "Missing colon (:) at the end of the statement.";
             type = ERROR_TYPES.MISSING_COLON;
        }

        errors.push({
            line: start.row + 1,
            column: start.column + 1,
            endColumn: end.column + 1,
            type: type,
            message: message,
            hint: hint
        });
        return; // Don't walk children of an error node to avoid noise
    }

    // 2. Scope Tracking (Identifiers)
    if (node.type === 'assignment') {
        const left = node.childForFieldName('left');
        addIdentifiersToSymbolTable(left, symbolTable, code);
    }

    if (node.type === 'function_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
            symbolTable.add(code.substring(nameNode.startIndex, nameNode.endIndex));
        }
        
        // Function parameters are also defined in this scope
        const paramsNode = node.childForFieldName('parameters');
        if (paramsNode) {
            for (let i = 0; i < paramsNode.childCount; i++) {
                const child = paramsNode.child(i);
                // Parameters can be direct identifiers or part of default_parameter
                if (child.type === 'identifier') {
                    symbolTable.add(code.substring(child.startIndex, child.endIndex));
                } else if (child.type === 'default_parameter' || child.type === 'typed_parameter') {
                    const idNode = child.childForFieldName('name');
                    if (idNode) symbolTable.add(code.substring(idNode.startIndex, idNode.endIndex));
                }
            }
        }
    }

    if (node.type === 'for_statement') {
        const leftNode = node.childForFieldName('left');
        addIdentifiersToSymbolTable(leftNode, symbolTable, code);
    }

    // 3. Name Error Detection (Undefined Variables)
    if (node.type === 'identifier') {
        const name = code.substring(node.startIndex, node.endIndex);
        const parent = node.parent;
        
        // Only check identifiers that are being READ, not written
        const isUsage = !['assignment', 'function_definition', 'for_statement'].includes(parent.type) || 
                        (parent.type === 'assignment' && parent.childForFieldName('right') === node) ||
                        (parent.type === 'for_statement' && parent.childForFieldName('right') === node);

        if (isUsage && !symbolTable.has(name)) {
            // Check if it's a call or member access that might be valid but we didn't track
            if (parent.type !== 'attribute' || parent.childForFieldName('object') === node) {
                 errors.push({
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column + 1,
                    endColumn: node.endPosition.column + 1,
                    type: ERROR_TYPES.NAME,
                    message: `Name '${name}' is not defined.`,
                    hint: `You used '${name}' but never assigned it a value. Did you mean one of these: ${Array.from(symbolTable).slice(-5).join(', ')}?`
                });
            }
        }
    }

    // Walk children
    for (let i = 0; i < node.childCount; i++) {
        walkTree(node.child(i), errors, symbolTable, code, depth + 1);
    }
};

export const scanJSCode = (code) => {
  const errors = [];
  try {
    new Function(code);
  } catch (e) {
    errors.push({
      line: 1,
      type: ERROR_TYPES.SYNTAX,
      message: e.message
    });
  }
  return errors;
};
