# File Breakdown: The Engine Room

This document explains the role of every critical file in the Logic Lens Pro ecosystem.

## 1. `src/App.jsx`
- **Location**: `src/App.jsx`
- **Role**: The Central Nervous System. It manages the global state (code, errors, mastery) and coordinates all other services.
- **Key Functions**: `handleEditorChange`, `runCode`, `handleUpdateMastery`.
- **Dependencies**: Monaco Editor, ErrorEngine, RealCompilerService.
- **My Understanding**: It's the "brain" that hears the student's typing and decides which engine to call and what to show on screen.

## 2. `src/engines/ErrorEngine.js`
- **Location**: `src/engines/ErrorEngine.js`
- **Role**: Immediate Syntax Guardian. Uses Tree-sitter (WASM) to parse code into an AST (Abstract Syntax Tree) to find missing colons or indentation issues.
- **Key Functions**: `scanPythonCode`, `walkTree`.
- **Snippet**:
  ```javascript
  if (node.type === 'for_statement') {
      const leftNode = node.childForFieldName('left');
      addIdentifiersToSymbolTable(leftNode, symbolTable, code);
  }
  ```
- **My Understanding**: It builds a map of the code's structure to catch errors that basic text search would miss.

## 3. `src/engines/AdvancedPedagogy.js`
- **Location**: `src/engines/AdvancedPedagogy.js`
- **Role**: The "Challenge Generator". It creates intentional error variations (mutations) to test if a student actually understands a concept.
- **Key Functions**: `getErrorVariants`, `getRefactorSuggestions`.
- **My Understanding**: It's the "drill sergeant" that makes sure you didn't just get lucky with one fix.

## 4. `src/services/LocalMentorService.js`
- **Location**: `src/services/LocalMentorService.js`
- **Role**: The Socratic Tutor. Uses AI (or local logic fallback) to ask questions instead of giving answers.
- **Key Functions**: `getLocalMentorResponse`, `verifyExplanation`.
- **My Understanding**: This is the "Verification Gate" that stops students from moving on until they explain their code.

## 5. `src/services/RealCompilerService.js`
- **Location**: `src/services/RealCompilerService.js`
- **Role**: The Execution Heart. Loads Pyodide (Python in WASM) to run code safely in the browser.
- **Key Functions**: `loadPyodide`, `runWithTimeout`.
- **My Understanding**: It turns the browser into a real Python terminal.

## 6. `pyright-service.cjs`
- **Location**: Project Root
- **Role**: The Heavyweight Analyst. A Node.js backend that runs Microsoft Pyright to find deep semantic bugs.
- **My Understanding**: It provides "VS Code level" intelligence to our web app.

## 7. `src/App.css`
- **Location**: `src/App.css`
- **Role**: The Visual Identity. Implements the Pro-grade, dark-themed, glassmorphism design system.
- **My Understanding**: It makes the tool feel like a premium piece of software, not a cheap tutorial.
