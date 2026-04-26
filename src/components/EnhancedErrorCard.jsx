import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lightbulb, BookOpen, Wrench, ChevronRight, Zap, RefreshCw } from 'lucide-react';

const EnhancedErrorCard = ({ error, layeredHint, onApplyFix, onAskMentor, onChallenge }) => {
    const [level, setLevel] = useState(1);
    
    if (!error) return null;

    const isCritical = error.type === 'syntax' || error.type === 'missing_colon';
    const isWarning = error.prediction || error.type === 'warning';

    const handleNextLevel = () => {
        if (level < 5) setLevel(level + 1);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`enhanced-error-card ${isCritical ? 'critical' : isWarning ? 'warning' : 'info'}`}
        >
            <div className="error-header">
                <div className="error-title">
                    {isCritical ? <AlertCircle size={18} color="#FF4444" /> : <Zap size={18} color="#FFBB00" />}
                    <span>{error.message}</span>
                </div>
                <span className="error-line">Line {error.line}</span>
            </div>

            {layeredHint && (
                <div className="error-body">
                    <div className="concept-tag">
                        <BookOpen size={14} />
                        <span>CONCEPT: {layeredHint.concept?.name || "General Syntax"}</span>
                    </div>

                    <p className="explanation">{layeredHint.explanation}</p>

                    <div className="hint-stepper">
                        <div className="hint-content">
                            <Lightbulb size={16} className="hint-icon" />
                            <span>{layeredHint.text}</span>
                        </div>
                        {level < 5 && (
                            <button className="why-button" onClick={handleNextLevel}>
                                Why? <ChevronRight size={14} />
                            </button>
                        )}
                    </div>

                    {layeredHint.examples && level >= 3 && (
                        <div className="example-box">
                            <div className="example-item">
                                <span className="label wrong">Current:</span>
                                <code>{layeredHint.examples[0].wrong}</code>
                            </div>
                            <div className="example-item">
                                <span className="label right">Should be:</span>
                                <code>{layeredHint.examples[0].right}</code>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="error-actions">
                {layeredHint?.quickFix && (
                    <button className="action-chip fix" onClick={() => onApplyFix(error, layeredHint)}>
                        <Wrench size={14} /> Apply Fix
                    </button>
                )}
                <button className="action-chip learn" onClick={() => window.open(`https://docs.python.org/3/tutorial/`, '_blank')}>
                    <BookOpen size={14} /> Learn
                </button>
                <button className="action-chip challenge" onClick={() => onChallenge(error)}>
                    <Zap size={14} /> Challenge
                </button>
                <button className="action-chip mentor" onClick={() => onAskMentor(error)}>
                    <RefreshCw size={14} /> Ask Mentor
                </button>
            </div>
        </motion.div>
    );
};

export default EnhancedErrorCard;
