# Interview Q&A Preparation

## Q1: "How does the real-time error detection work?"
**Answer**: "I implemented a dual-pass detection system. First, I use **Tree-sitter** on the frontend for instant structural analysis (like missing colons or indentation). For deeper logic bugs, I built a Node.js backend that runs **Pyright** via the Language Server Protocol. This allows me to show 'VS Code' quality errors within 300ms of a keystroke."

## Q2: "Why use Pyright instead of building your own parser?"
**Answer**: "In engineering, you shouldn't reinvent the wheel if a professional one exists. Pyright is maintained by Microsoft and is the industry standard. By integrating it, I could focus my time on the **Pedagogical Layer**—transforming those technical errors into Socratic learning hints, which is the core value of Logic Lens."

## Q3: "What is an 'Error Mutation'?"
**Answer**: "It's a feature I designed to stop students from 'memorizing' fixes. When an error is detected, the engine generates three different 'broken' variations of that logic. The student must fix all of them to gain full XP. It forces them to generalize their understanding."

## Q4: "How much of this is actually your code?"
**Answer**: "About 85%. I used external engines for the 'heavy lifting' of parsing and execution (Pyright, Monaco, Pyodide), but the **entire learning logic**, concept mapping database, XP engine, and the UI/UX are 100% my design and implementation."

## Q5: "How do you prevent students from cheating?"
**Answer**: "I built several 'Anti-Vibe' features: I block pasting entirely, detect if they switch tabs to look up solutions, and most importantly, I use an **Understanding Verification Gate** where they must explain their logic in plain English to an AI Mentor before the mission is marked as complete."

## Q6: "What would you add next?"
**Answer**: "I'd implement a **Skill Roadmap** that visualizes the student's mastery over time as a tree, and a **Code Quality Coach** that doesn't just check if the code works, but if it's 'Pythonic' (using list comprehensions, proper naming, etc.)."
