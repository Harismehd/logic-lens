# Ownership Breakdown: Honesty & Transparency

| Component | Your % | External % | Your Contribution |
| :--- | :---: | :---: | :--- |
| **Error Detection** | 80% | 20% | Built the bridge between Pyright (Ext) and Socratic UI. Created the concept mapping database. |
| **Execution Engine**| 70% | 30% | Integrated Pyodide (Ext). Wrote the timeout safety and multi-input history logic. |
| **Auto-Complete** | 75% | 25% | Wired Monaco (Ext) to the Pyright LSP backend. Custom rendering for suggestions. |
| **Verification Gate**| 100%| 0% | Entirely original logic for forcing students to explain code before completion. |
| **Error Mutations** | 90% | 10% | Developed the mutation algorithms. Used Tree-sitter for AST traversal. |
| **Socratic Hints**  | 95% | 5% | Hand-crafted 5 levels of pedagogical hints for over 100 error types. |
| **UI/UX Design**    | 100%| 0% | All CSS, Layout, Color Theory, and Gamification UI. |
| **Mastery Engine**  | 100%| 0% | Built the XP/Level system and persistence layer. |

## Rationale
- **The 15-20% External**: I leveraged industry-standard tools (Pyright, Monaco, Pyodide) because building a professional Python type-checker from scratch would take years. 
- **The 80-100% Yours**: My value is in the **Pedagogy Layer**. I took raw technical tools and transformed them into a teaching environment. No other IDE "talks back" to the student or forces them to prove their understanding.
