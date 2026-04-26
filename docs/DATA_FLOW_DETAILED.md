# Detailed Data Flow

## Scenario 1: Student types `for i in range(10)` (Missing Colon)

| Step | Component | Action | Result |
| :--- | :--- | :--- | :--- |
| **1** | Monaco Editor | `onKeyDown` event captured. | Debounce timer starts (300ms). |
| **2** | `App.jsx` | Calls `scanPythonCode(code)`. | Sends code to local ErrorEngine. |
| **3** | `ErrorEngine.js` | Parses AST using Tree-sitter. | Detects `missing_colon` on `for_statement`. |
| **4** | `HintEngine.js` | Looks up `missing_colon` in database. | Retrieves "Level 1" Socratic hint. |
| **5** | `App.jsx` | Updates state: `setErrors([...])`. | Re-renders UI with diagnostic cards. |
| **6** | UI View | Red underline appears in editor. | Hint: "What marks the start of a block?" |

---

## Scenario 2: Code Execution Flow

| Step | Component | Action | Result |
| :--- | :--- | :--- | :--- |
| **1** | User | Clicks "Execute Logic" button. | `runCode()` is triggered in `App.jsx`. |
| **2** | `RealCompiler` | Initializes Pyodide WASM. | Python runtime ready in browser. |
| **3** | `App.jsx` | Captures `stdout` and `stderr`. | Prepares to stream logs to console. |
| **4** | `ComparisonEngine`| Compares result with Mission Goal. | Logic check (Success/Fail). |
| **5** | `MasteryEngine` | Updates `localStorage`. | XP bar moves, Level up logic checks. |

---

## Scenario 3: Auto-Complete Flow

1. Student types `tasks.`
2. `Monaco` triggers `provideCompletionItems`.
3. `App.jsx` sends request to `/complete` endpoint on `localhost:5000`.
4. `pyright-service.cjs` analyzes code context.
5. Returns JSON: `[{ label: 'append', detail: 'Method', ... }]`.
6. Monaco shows the dropdown with the suggestions.
