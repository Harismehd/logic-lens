# Feature Explanations: How It Works

![Pedagogy Loop](pedagogy_visual_1777150494818.png)

## Feature: Real-Time Error Detection
- **How it works**: Every keystroke triggers a "Scan" pipeline. First, the local Tree-sitter parser checks for structural issues. Then, an HTTP request is sent to the Pyright backend for semantic validation.
- **Ownership**: **80%** (Integrated the professional Pyright engine into a custom UI diagnostics pipeline).
- **Why it matters**: Students get instant feedback, preventing "Error Accumulation" where they write 50 lines before realizing line 1 was wrong.

## Feature: Understanding Verification Gate
- **How it works**: After solving a mission, the system randomly selects a line of code and asks the student to explain it in natural language.
- **Ownership**: **100%** (Developed the entire verification logic and the prompt-engineering for the mentor).
- **Why it matters**: It kills "Vibe Coding". You can't just copy-paste; you have to prove you know *why* the code works.

## Feature: Error Mutation Challenges
- **How it works**: When a student makes a specific error (e.g., missing a colon), the engine generates 3 "Broken" variations of their code. The student must fix all three to "Master" the concept.
- **Ownership**: **90%** (Built the variant generation algorithm using AST manipulation).
- **Why it matters**: It builds deep conceptual understanding by showing the same mistake in different contexts.

## Feature: Anti-Vibe Protections
- **Paste Blocking**: Prevents `Ctrl+V` to force muscle memory.
- **Tab-Switch Detection**: Warns if the student stays away for too long (likely looking up answers).
- **Ownership**: **100%** (Custom browser event listeners).
- **Why it matters**: Protects the student from their own shortcuts.

## Feature: Socratic Guidance
- **How it works**: Instead of saying "You missed a colon," the system asks "What symbol is required at the end of an 'if' statement in Python?"
- **Ownership**: **95%** (Mapped 100+ error patterns to layered Socratic hints).
- **Why it matters**: It forces the brain to retrieve information rather than just reading it.
