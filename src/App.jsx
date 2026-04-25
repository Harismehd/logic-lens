import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Editor from '@monaco-editor/react';
import WelcomeOverlay from './components/WelcomeOverlay';
import { matchRequirement } from './services/PatternEngine';
import { getLocalMentorResponse } from './services/LocalMentorService';
import { compareLogic } from './services/ComparisonEngine';
import { executePython, runWithTimeout as runPythonWithTimeout } from './services/RealCompilerService';
import { scanPythonCode, COLOR_MAP, ERROR_TYPES } from './engines/ErrorEngine';
import { Terminal, Send, Lightbulb, AlertCircle, CheckCircle, Flame, Play, MessageSquare, History, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { analyzeSafety, runWithTimeout } from './engines/SafetyEngine';
import { getErrorVariants, getRefactorSuggestions } from './engines/AdvancedPedagogy';

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [requirement, setRequirement] = useState("");
  const [activePattern, setActivePattern] = useState(null);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState([]);
  const [hints, setHints] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Anti-Vibe State
  const [isPasting, setIsPasting] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  const [typingSpeedAlert, setTypingSpeedAlert] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [tabHiddenTime, setTabHiddenTime] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainLine, setExplainLine] = useState("");
  const [explainAnswer, setExplainAnswer] = useState("");
  const [mentorQuestion, setMentorQuestion] = useState("");
  
  // Pedagogy & Safety
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [mutationChallenge, setMutationChallenge] = useState(null);
  const [refactorOptions, setRefactorOptions] = useState([]);
  const [showRefactor, setShowRefactor] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const sparkTimerRef = useRef(null);
  const autoRunTimerRef = useRef(null);
  const [inputHistory, setInputHistory] = useState([]);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [currentInputPrompt, setCurrentInputPrompt] = useState("");
  const [tempInputValue, setTempInputValue] = useState("");

  const [mentorChat, setMentorChat] = useState([]);
  const [mentorStatus, setMentorStatus] = useState('checking');
  const [pythonStatus, setPythonStatus] = useState('loading');
  const [isExecuting, setIsExecuting] = useState(false);

  const editorRef = useRef(null);

  // 0. Initialize ErrorEngine & Mentor Status
  useEffect(() => {
    const init = async () => {
      console.log("[App] Initializing engines...");
      const { initParser } = await import('./engines/ErrorEngine');
      await initParser();
      
      const { loadPyodide } = await import('./services/RealCompilerService');
      loadPyodide()
        .then(() => setPythonStatus('ready'))
        .catch(e => {
            console.error("[App] Pyodide pre-load failed:", e);
            setPythonStatus('error');
        });

      const { checkMentorStatus } = await import('./services/LocalMentorService');
      const isOnline = await checkMentorStatus();
      setMentorStatus(isOnline ? 'online' : 'offline');
    };
    init();

    // Poll status every 30s
    const interval = setInterval(async () => {
        const { checkMentorStatus } = await import('./services/LocalMentorService');
        const isOnline = await checkMentorStatus();
        setMentorStatus(isOnline ? 'online' : 'offline');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAskMentor = async (e) => {
    if (e) e.preventDefault();
    if (!mentorQuestion.trim()) return;

    // Show a temporary "Thinking..." message
    const tempId = `mentor-${Date.now()}`;
    setMentorChat(prev => [...prev, { id: tempId, q: mentorQuestion, a: "Logic Mentor is thinking..." }]);
    
    const { getLocalMentorResponse } = await import('./services/LocalMentorService');
    const response = await getLocalMentorResponse(code, mentorQuestion, errors, activePattern);
    
    setMentorChat(prev => prev.map(chat => chat.id === tempId ? { ...chat, a: response } : chat));
    setMentorQuestion("");
  };

  const handleExplainSubmit = async () => {
    const { verifyExplanation } = await import('./services/LocalMentorService');
    setMentorChat(prev => [...prev, { id: `verify-${Date.now()}`, q: `Explanation for: ${explainLine}`, a: "Verifying your understanding..." }]);
    
    const verification = await verifyExplanation(explainLine, explainAnswer);
    
    if (verification.isCorrect) {
        setIsExplaining(false);
        handleSuccess();
        setMentorChat(prev => [...prev, { id: `success-${Date.now()}`, q: "System", a: verification.feedback }]);
    } else {
        alert(verification.feedback);
        setMentorChat(prev => [...prev, { id: `fail-${Date.now()}`, q: "System", a: verification.feedback }]);
    }
  };

  const handleInputSubmit = (e) => {
    if (e) e.preventDefault();
    if (!tempInputValue.trim() && tempInputValue !== "0") return;
    
    const newVal = tempInputValue;
    setTempInputValue("");
    setIsInputModalOpen(false);
    
    // Add to history and re-run
    const newHistory = [...inputHistory, newVal];
    setInputHistory(newHistory);
    runCode(newHistory); 
  };

  const triggerMutationChallenge = async () => {
    if (errors.length === 0) {
        alert("You need a structural issue to generate mutations. Try making a mistake first!");
        return;
    }
    const err = errors[0];
    setConsoleLogs(prev => [...prev, { type: 'system', message: "Generating logic mutations for your error..." }]);
    const variants = await getErrorVariants(err.type, code);
    setMutationChallenge({ type: err.type, variants });
  };

  // 1. Tab Switching Detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabHiddenTime(Date.now());
      } else {
        const diff = (Date.now() - tabHiddenTime) / 1000;
        if (diff > 10) {
          setIsTabHidden(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tabHiddenTime]);

  // 2. Typing Speed Monitor
  const charCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const checkTypingSpeed = (value) => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const charsAdded = value.length - (code ? code.length : 0);
    
    if (charsAdded > 0) {
      charCountRef.current += charsAdded;
    }

    if (elapsed > 8) {
      const speed = charCountRef.current; // chars in last 8s
      if (speed > 100) {
        setTypingSpeedAlert(true);
        setTimeout(() => setTypingSpeedAlert(false), 3000);
      }
      charCountRef.current = 0;
      startTimeRef.current = now;
    }
  };

  const handleRequirementSubmit = (e) => {
    e.preventDefault();
    if (!requirement.trim()) return;
    const pattern = matchRequirement(requirement);
    setActivePattern(pattern);
    if (!code || pattern.dynamic) {
        setCode(pattern.push_start);
    }
    setErrors([]);
    setInputHistory([]);
    setConsoleLogs([{ type: 'system', message: `Mission Deployed: ${pattern.title}` }]);
  };

  const updateMarkers = (currentErrors) => {
    if (editorRef.current) {
        const monaco = window.monaco;
        if (!monaco) return;
        const model = editorRef.current.getModel();
        const markers = currentErrors.map(err => ({
            startLineNumber: err.line,
            startColumn: err.column || 1,
            endLineNumber: err.line,
            endColumn: err.endColumn || (err.column ? err.column + 1 : 100),
            message: err.message,
            severity: monaco.MarkerSeverity.Error
        }));
        monaco.editor.setModelMarkers(model, "owner", markers);
    }
  };

  const handleEditorChange = (value) => {
    try {
        if (isPasting) return;
        checkTypingSpeed(value);
        setCode(value);
        setLastTypingTime(Date.now());
        
        // Safety Analysis
        const warnings = analyzeSafety(value);
        setSafetyWarnings(warnings);
        setInputHistory([]); // Reset input on code change

        // Debounced Error Scanning
        const currentErrors = scanPythonCode(value);
        setErrors(currentErrors);
        updateMarkers(currentErrors);

        // Auto-run logic (FIXED: run regardless of errors)
        if (autoRun) {
            if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
            autoRunTimerRef.current = setTimeout(() => {
                runCode(); 
            }, 1000);
        }
    } catch (e) {
        console.error("Editor change error:", e);
    }
  };

  const insertBoilerplate = (type) => {
      const templates = {
          'function': `def ${activePattern?.id || 'my_function'}(numbers):\n    # Logic here\n    pass`,
          'loop': "for num in numbers:\n    ",
          'if': "if not numbers:\n    return 0",
          'average': "return sum(numbers) / len(numbers)"
      };
      setCode(prev => prev + (templates[type] || ""));
      setShowSpark(false);
  };

  const runCode = async (historyOverride = null) => {
    const currentHistory = Array.isArray(historyOverride) ? historyOverride : inputHistory;
    console.log("[App] runCode triggered. Active Pattern:", activePattern?.id, "History:", currentHistory);
    if (!activePattern) {
        setConsoleLogs(prev => [...prev, { type: 'error', message: "Mission required: Deploy a mission from Mission Control first!" }]);
        return;
    }
    
    if (isExecuting) {
        console.warn("[App] Already executing, skipping...");
        return;
    }

    setIsExecuting(true);
    setConsoleLogs(prev => [...prev, { type: 'system', message: "Initializing Real Python Environment..." }]);
    
    try {
        console.log("[App] Running code:", code.substring(0, 50) + "...");
        // Dynamic parameter extraction from sample_input
        let testParams = [];
        if (activePattern.dynamic) {
            testParams = []; // No predefined parameters for custom missions
        } else {
            try {
                const inputVal = activePattern.sample_input;
                if (inputVal.startsWith('[')) {
                    testParams = [JSON.parse(inputVal.replace(/'/g, '"'))];
                } else if (inputVal.startsWith("'") || inputVal.startsWith('"')) {
                    testParams = [inputVal.slice(1, -1)];
                } else {
                    testParams = [Number(inputVal)];
                }
            } catch (e) {
                console.error("Param parse error:", e);
                testParams = [[10, 20, 30]]; // fallback
            }
        }

        const result = await runPythonWithTimeout(code, testParams, 5000, currentHistory);
        
        if (result.success) {
            if (result.awaitingInput) {
                setConsoleLogs(prev => {
                    // Only add stdout if it's not empty and different from last
                    const newLogs = [...prev];
                    if (result.stdout && (!prev.length || prev[prev.length-1].message !== result.stdout)) {
                        newLogs.push({ type: 'system', message: result.stdout });
                    }
                    return newLogs;
                });
                setCurrentInputPrompt(result.prompt || "Input required:");
                setIsInputModalOpen(true);
                return;
            }

            setConsoleLogs(prev => [...prev, { type: 'success', message: "Execution Successful." }]);
            if (result.stdout) {
                setConsoleLogs(prev => [...prev, { type: 'system', message: result.stdout }]);
            }
            if (result.returnValue !== undefined) {
                setConsoleLogs(prev => [...prev, { type: 'system', message: `Return Value: ${result.returnValue}` }]);
            }

            // Logic Comparison (Only for template missions)
            if (!activePattern.dynamic) {
                const comparison = await compareLogic(code, activePattern, result.returnValue);
                if (comparison.passed) {
                    setConsoleLogs(prev => [...prev, { type: 'success', message: comparison.message }]);
                    setRefactorOptions(getRefactorSuggestions(activePattern.id, code));
                    setShowRefactor(true);
                    triggerExplainMode();
                } else {
                    setConsoleLogs(prev => [...prev, { type: 'error', message: `Logic Mismatch: ${comparison.message}` }]);
                }
            } else {
                setConsoleLogs(prev => [...prev, { type: 'success', message: "Mission results verified against your goal." }]);
                triggerExplainMode();
            }
        } else {
            setConsoleLogs(prev => [...prev, { type: 'error', message: `Python Error: ${result.error.message}` }]);
            
            // Problem 4 & 6 Fix: Feed execution errors back into the markers/mentor
            if (result.error.message.includes("SyntaxError")) {
                const lineMatch = result.error.message.match(/line (\d+)/);
                const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
                const newErr = {
                    line: lineNum,
                    type: ERROR_TYPES.SYNTAX,
                    message: `Execution Error: ${result.error.message.split('\n').pop()}`
                };
                setErrors(prev => [...prev, newErr]);
                updateMarkers([...errors, newErr]);
            }
        }
    } catch (e) {
        console.error("[App] Execution error:", e);
        setConsoleLogs(prev => [...prev, { type: 'error', message: `Execution Error: ${e.message}` }]);
    } finally {
        setIsExecuting(false);
    }
  };

  const triggerExplainMode = () => {
    const lines = code.split('\n').filter(l => l.trim().length > 10);
    if (lines.length > 0) {
        setExplainLine(lines[Math.floor(Math.random() * lines.length)]);
        setIsExplaining(true);
    } else {
        handleSuccess();
    }
  };


  const handleSuccess = () => {
    setShowConfetti(true);
    setConsoleLogs(prev => [...prev, { type: 'success', message: "MISSION COMPLETE! Your understanding is verified." }]);
    setTimeout(() => setShowConfetti(false), 5000);
  };



  const onPaste = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPasting(true);
    setTimeout(() => setIsPasting(false), 4000);
  };

  return (
    <div className="app-scroll-container">
      <div className="app-container">
      {showConfetti && <Confetti />}
      
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay onStart={() => setShowWelcome(false)} />}
        {isTabHidden && (
            <div className="overlay animate-shake">
                <AlertCircle size={64} color="var(--clr-warning)" />
                <h2>Stay Focused!</h2>
                <p>Were you looking at something else? Learning happens here.</p>
                <button className="button-primary" style={{marginTop: 20}} onClick={() => setIsTabHidden(false)}>I'm Back</button>
            </div>
        )}
        {isPasting && (
            <div className="overlay animate-shake">
                <AlertCircle size={64} color="var(--clr-err-syntax)" />
                <h2>No Pasting Allowed!</h2>
                <p>Typing builds muscle memory. Type your logic manually.</p>
            </div>
        )}
        {typingSpeedAlert && (
             <div className="overlay" style={{background: 'rgba(255,165,0,0.8)'}}>
                <Flame size={64} color="white" />
                <h2>Too Fast!</h2>
                <p>Did you copy that? Type slowly and think about each line.</p>
            </div>
        )}
        {isExplaining && (
            <div className="overlay">
                <Lightbulb size={64} color="var(--clr-hint)" />
                <h2>Knowledge Verification</h2>
                <p>Explain what this line does in your own words:</p>
                <div style={{background: '#000', padding: 20, borderRadius: 8, margin: '20px 0', width: '100%', maxWidth: 500}}>
                    <code style={{color: 'var(--clr-success)'}}>{explainLine}</code>
                </div>
                <textarea 
                    placeholder="Type your explanation here (min 15 chars)..."
                    value={explainAnswer}
                    onChange={(e) => setExplainAnswer(e.target.value)}
                    style={{maxWidth: 500}}
                />
                <button className="button-primary" style={{marginTop: 20}} onClick={handleExplainSubmit}>Verify & Complete</button>
            </div>
        )}
        {mutationChallenge && (
            <div className="overlay">
                <Zap size={64} color="var(--clr-warning)" />
                <h2>Error Mutation Challenge</h2>
                <p>To master this concept, fix these 3 variations of the same error:</p>
                <div className="mutation-grid">
                    {mutationChallenge.variants.map((v, i) => (
                        <div key={i} className="mutation-card">
                            <pre>{v}</pre>
                            <button className="button-primary-sm" onClick={() => {
                                setCode(v);
                                setMutationChallenge(null);
                            }}>Fix This</button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {isInputModalOpen && (
            <div className="overlay animate-pop">
                <Terminal size={64} color="var(--clr-accent)" />
                <h2>Program Input Required</h2>
                <p>{currentInputPrompt}</p>
                <form onSubmit={handleInputSubmit} style={{width: '100%', maxWidth: 400}}>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Enter value..."
                        value={tempInputValue}
                        onChange={(e) => setTempInputValue(e.target.value)}
                        className="input-field-premium"
                    />
                    <button type="submit" className="button-primary" style={{marginTop: 20, width: '100%'}}>
                        Send to Program <Send size={16} />
                    </button>
                </form>
            </div>
        )}
      </AnimatePresence>

      <header className="app-header glass-panel">
        <div className="logo">
          <Flame className="logo-icon" size={24} />
          <span>Logic Lens Compiler</span>
        </div>
        <div className="header-status">
            <div className={`status-indicator ${pythonStatus === 'ready' ? 'online' : pythonStatus === 'error' ? 'offline' : 'checking'}`}>
                <Play size={10} fill="currentColor" />
                <span>PY ENGINE: {pythonStatus.toUpperCase()}</span>
            </div>
        </div>
      </header>

      <main className="app-main">
        {/* Left: Mission Control */}
        <div className="panel-left glass-panel">
          <section>
            <div className="section-header">
              <Terminal size={18} />
              <h2>Mission Control</h2>
            </div>
            <form onSubmit={handleRequirementSubmit}>
              <textarea 
                placeholder="Declare your logic goal (e.g. Find the maximum value in a list)"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                style={{height: 100}}
              />
              <button type="submit" className="button-primary" style={{marginTop: 10, width: '100%'}}>
                Deploy Mission <Send size={16} />
              </button>
            </form>
            {activePattern && (
                <div style={{marginTop: 20, padding: 15, background: 'rgba(0,255,136,0.1)', borderRadius: 8, border: '1px solid var(--clr-success)'}}>
                    <h3 style={{fontSize: '0.9rem', color: 'var(--clr-success)'}}>Active Mission:</h3>
                    <p style={{fontSize: '1.1rem', fontWeight: 700}}>{activePattern.title}</p>
                </div>
            )}
          </section>

          <section className="hints-container">
            <div className="section-header">
              <Lightbulb size={18} />
              <h2>Socratic Guidance</h2>
            </div>
            {errors.length > 0 ? (
                <>
                {errors.map((err, i) => (
                    <div key={`err-${i}`} className="hint-item error">
                        <AlertCircle size={16} />
                        <span>Line {err.line}: {err.message}</span>
                    </div>
                ))}
                <button 
                    className="button-primary-sm" 
                    style={{marginTop: 10, width: '100%', background: 'var(--clr-warning)', color: 'black'}}
                    onClick={triggerMutationChallenge}
                >
                    <Zap size={14} /> Challenge Me: Fix 3 Variants
                </button>
                </>
            ) : (
                <div className="hint-item success">
                    <CheckCircle size={16} />
                    <span>No structural issues detected. Ready to execute.</span>
                </div>
            )}
            {mentorChat.slice(-1).map((msg) => (
                <div key={msg.id} className="hint-item" style={{borderColor: 'var(--clr-hint)'}}>
                    <MessageSquare size={16} />
                    <div>
                        <strong style={{display: 'block', fontSize: '0.7rem'}}>MENTOR RESPONSE:</strong>
                        {msg.a}
                    </div>
                </div>
            ))}
            {safetyWarnings.map((w, i) => (
                <div key={`safe-${i}`} className="hint-item" style={{borderColor: 'var(--clr-warning)', background: 'rgba(255,165,0,0.1)'}}>
                    <ShieldCheck size={16} color="var(--clr-warning)" />
                    <span style={{color: 'var(--clr-warning)'}}>{w.message}</span>
                </div>
            ))}
          </section>
        </div>

        {/* Center: Editor */}
        <div className="panel-center glass-panel">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              window.monaco = monaco;

              // Logic Spark: Completion Provider
              monaco.languages.registerCompletionItemProvider('python', {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };
                    const suggestions = [
                        {
                            label: 'def',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'def ${1:function_name}(${2:params}):\n    ${3:# logic here}\n    pass',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Function structure',
                            range: range
                        },
                        {
                            label: 'for',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'For loop pattern',
                            range: range
                        },
                        {
                            label: 'if',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'if ${1:condition}:\n    ${2:pass}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'If condition',
                            range: range
                        },
                        {
                            label: 'while',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'while ${1:condition}:\n    ${2:pass}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'While loop',
                            range: range
                        },
                        {
                            label: 'try',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:pass}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Try/Except block',
                            range: range
                        }
                    ];
                    return { suggestions: suggestions };
                }
              });

              // Intercept paste at the DOM level
              const container = editor.getContainerDomNode();
              container.addEventListener('paste', onPaste, true);
            }}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: "on",
              lineNumbersMinChars: 3,
              fontFamily: "'Fira Code', 'Courier New', monospace",
            }}
          />
          <div className="editor-controls">
            <div className="auto-run-toggle">
              <input 
                type="checkbox" 
                id="autoRun" 
                checked={autoRun} 
                onChange={(e) => setAutoRun(e.target.checked)} 
              />
              <label htmlFor="autoRun">Auto-Compile (Idle 1s)</label>
            </div>
            <button 
              className={`button-primary button-big-run ${isExecuting ? 'loading' : ''}`} 
              onClick={runCode}
              disabled={isExecuting}
            >
              {isExecuting ? "Executing..." : "Execute Logic"} <Play size={20} fill={isExecuting ? "gray" : "black"} />
            </button>
          </div>
        </div>

        {/* Right: Console & Mentor */}
        <div className="panel-right glass-panel">
          <section style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
            <div className="section-header">
              <Terminal size={18} />
              <h2>Logic Console</h2>
            </div>
            <div className="console-area">
                {consoleLogs.map((log, i) => (
                    <div key={`log-${i}`} style={{color: log.type === 'error' ? 'var(--clr-err-syntax)' : log.type === 'success' ? 'var(--clr-success)' : 'var(--text-main)', marginBottom: 5}}>
                        {log.type === 'system' ? '> ' : ''}{log.message}
                    </div>
                ))}
                {refactorOptions.length > 0 && (
                    <div className="refactor-panel-container">
                        {!showRefactor ? (
                            <button className="show-refactor-btn" onClick={() => setShowRefactor(true)}>
                                <Sparkles size={14} /> Show Expert Suggestions
                            </button>
                        ) : (
                            <div className="refactor-panel">
                                <div className="refactor-header">
                                    <h4 style={{color: 'var(--accent)', margin: 0}}>Expert Refactor Suggestions:</h4>
                                    <button className="close-refactor-btn" onClick={() => setShowRefactor(false)}>×</button>
                                </div>
                                {refactorOptions.map((opt, i) => (
                                    <div key={i} className="refactor-card">
                                        <strong>{opt.title} ({opt.type})</strong>
                                        <pre>{opt.code}</pre>
                                        <p>{opt.benefit}</p>
                                        <button className="button-primary-sm" onClick={() => {
                                            setCode(opt.code);
                                            setShowRefactor(false);
                                        }}>Apply Refactor</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
          </section>

          <section className="mentor-section">
            <div className="section-header">
              <MessageSquare size={18} />
              <h2>AI Logic Mentor</h2>
              <div className={`status-indicator ${mentorStatus}`} title={`Mentor is ${mentorStatus}`}>
                {mentorStatus === 'online' ? <Zap size={12} fill="currentColor" /> : <ShieldCheck size={12} />}
                <span>{mentorStatus.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="mentor-history">
                {mentorChat.map(chat => (
                    <div key={chat.id} className="chat-bubble">
                        <div className="chat-q">Q: {chat.q}</div>
                        <div className="chat-a">{chat.a}</div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAskMentor} className="mentor-input-container">
                <input 
                    type="text" 
                    placeholder="Ask about your code..."
                    value={mentorQuestion}
                    onChange={(e) => setMentorQuestion(e.target.value)}
                />
                <button type="submit" className="button-primary-sm">
                    <Send size={14} />
                </button>
            </form>
          </section>

          <section>
            <div className="section-header">
              <History size={18} />
              <h2>History</h2>
            </div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-dim)'}}>
                Completed: 0 Missions
            </div>
          </section>
        </div>
      </main>
    </div>
    </div>
  );
};

export default App;
