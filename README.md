<div align="center">
  <img src="./public/favicon.svg" alt="Logic Lens Logo" width="120" />
  <h1>🧠 Logic Lens</h1>
  <p><strong>The Anti-Vibe-Coding IDE for Serious Learners</strong></p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python" alt="Python" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-ML_Backend-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" /></a>
    <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status" />
  </p>
  <p>
    <em>Stop vibe coding. Start understanding programming.</em>
  </p>
</div>

---

## ⚡ What is Logic Lens?

**Logic Lens** is a state-of-the-art, pedagogically designed Python IDE built to enforce genuine learning. Unlike traditional IDEs or modern AI assistants that simply give you the correct code, Logic Lens detects when you're struggling, identifies the exact nature of your misconception, and guides you through Socratic questioning so you discover the solution yourself.

It combines **sub-50ms local structural analysis** with a **precision Machine Learning backend (Cognis)** to provide keystroke-level, context-aware mentoring.

*No fluff. Just learning.*

---

## 🎯 Unmatched Features

### 🔴 Real-Time Socratic Tooltips (Cognis AI)
- **Keystroke-Level Diagnosis**: A two-pass system analyzes your code instantly (50ms local scan + 150ms AI check) and classifies errors into 20 distinct conceptual categories.
- **Socratic Pedagogy**: Instead of generic `SyntaxError` messages or giving you the answer, a floating glassmorphism tooltip asks targeted questions (e.g., *"What is the difference between `=` and `==` in Python?"*).
- **Expandable Context**: Click the tooltip to reveal the root cause, leading questions, and the next best action.

### 🎓 Deep Pedagogical Enforcement
- **5-Level Hint Hierarchy**: Hints escalate from gentle observations to full explanations automatically based on your struggle patterns.
- **Intensive Mode**: If you make the same conceptual error 3+ times in a minute, the system adapts, penalizes your mastery score, and provides more direct intervention.
- **Understanding Verification**: Fix an error? The system may ask you to explain *why* you changed what you did before letting you move on.

### 🛡️ Anti-Vibe-Coding Telemetry
- **Behavioral Monitoring**: Tracks copy-pasting large blocks of code, excessive tab switching, and abnormal typing speeds to detect academic dishonesty or over-reliance on external AI tools.
- **Self-Learning AI Loop**: Every time you fix, ignore, or dismiss a hint, the outcome is logged. The Cognis model continuously learns which Socratic strategies actually help students learn.
- **Frustration Context**: The AI knows if you've been stuck for 20 minutes and adjust its mentoring tone accordingly.

### 🚀 Autonomous "Lens Agent"
- **Visual Demonstrations**: For deterministic errors, activate the **Lens Agent** to watch the IDE autonomously take control, highlight the faulty line, and type the correction character-by-character—simulating human typing.

### 💻 Professional, In-Browser IDE Experience
- **Zero Server Execution**: Python runs entirely inside your browser via Pyodide (WASM). Your code never leaves your machine. Fast, secure, and offline-capable.
- **Multi-File Projects**: Manage complete projects with a VSCode-style file explorer.
- **Concept Mastery Dashboard**: Track your proficiency across 8 core Python concepts with XP, levels, and badges.

---

## 🎨 Why Logic Lens is Different

| Feature | Logic Lens | VS Code | Replit | Standard AI Tools |
|---------|:---:|:---:|:---:|:---:|
| **Keystroke Socratic Mentoring** | ✅ **YES** | ❌ No | ❌ No | ❌ No |
| **Concept-Specific ML Diagnosis** | ✅ **YES** | ❌ No | ❌ No | ❌ No |
| **Auto-Fixing Visual Agent** | ✅ **YES** | ❌ No | ❌ No | ❌ No |
| **Anti-Vibe-Coding Detection** | ✅ **YES** | ❌ No | ❌ No | ❌ No |
| **In-Browser Execution (WASM)** | ✅ **YES** | ❌ No | ❌ No | ❌ No |
| **Self-Learning Hint Effectiveness** | ✅ **YES** | ❌ No | ❌ No | ❌ No |

**The Philosophy:** Other tools help you write code faster. Logic Lens ensures you actually *understand* what you are writing.

---

## 🛠️ Technology Stack

**Frontend IDE (React 19 / Vite):**
- **Monaco Editor**: Professional-grade editing surface.
- **Framer Motion**: Smooth micro-animations for tooltips and the Lens Agent.
- **Web Tree-sitter**: Instant, WASM-based structural AST parsing.
- **Pyodide**: Full CPython 3.12 execution in the browser.

**Cognis ML Backend (FastAPI):**
- **HistGradientBoosting**: A highly calibrated ensemble model trained on 80,000+ synthetic examples to classify 20 specific Python misconceptions at sub-50ms latency.
- **Grok / Gemini API**: Powers the free-form Socratic mentor chat panel.

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.10+ (for the Cognis ML backend)
- npm or yarn

### 1. Start the Frontend
```bash
# Clone the repository
git clone https://github.com/Harismehd/logic-lens.git
cd logic-lens

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 2. Start the Cognis Backend (Required for ML Diagnostics)
*Note: The FastAPI backend must be running for the AI tooltips and telemetry features to function. Without it, Logic Lens falls back to local Tree-sitter diagnostics.*
```bash
# Navigate to the ML backend directory (assuming it's cloned)
cd path/to/cognis-backend

# Install Python requirements
pip install -r requirements.txt

# Start the FastAPI server (runs on localhost:8000)
uvicorn app:app --reload
```

### 3. Start Coding
1. Open `http://localhost:5173`.
2. Type Python code in the editor (try leaving off a colon or using `=` instead of `==` in an `if` statement).
3. Experience real-time Socratic mentoring!

---

## 👨‍🎓 For Educators & Bootcamps

Logic Lens Pro is designed specifically for Computer Science education:
- **Ensures Genuine Skill Acquisition**: Forces students to think through problems rather than relying on LLMs to write code for them.
- **Deep Analytics**: The Admin Dashboard provides granular insights into student performance, struggle patterns, and behavioral anomalies (like excessive pasting).
- **FERPA-Compliant Execution**: All code execution happens locally in the browser.

---

## 🗺️ Roadmap & Phase Updates

- [x] **Phase 1**: Real-time error detection & Socratic hints
- [x] **Phase 1.5**: Cognis ML integration (20 error types) & Self-Learning Telemetry
- [x] **Phase 2**: Autonomous "Lens Agent" visual fixer
- [x] **Phase 2.5**: Full Mastery Tracking, Anti-Vibe Detection, & Student Dashboards
- [ ] **Phase 3**: Multi-language support (JavaScript, C++)

---

## 📄 License

MIT License - Free to use for education and research.

---

<div align="center">
  <p><strong>Logic Lens</strong> — <em>Built for the next generation of software engineers.</em></p>
</div>ght**, **Monaco Editor**, and **Pyodide**. 

**Logic Lens Pro** — *Built for the next generation of software engineers.*
