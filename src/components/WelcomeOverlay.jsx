import React, { useState, useEffect } from 'react';
import { welcomes, getTimeBasedGreeting } from '../data/welcomes';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeOverlay = ({ onStart, userName = "Coder" }) => {
  const [greeting, setGreeting] = useState("");
  const [message, setMessage] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setMessage(welcomes[Math.floor(Math.random() * welcomes.length)]);
    
    // Fetch streak from local storage
    const savedStreak = localStorage.getItem('llc_streak') || 0;
    setStreak(parseInt(savedStreak));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="welcome-overlay"
    >
      <div className="welcome-content glass-panel">
        <div className="welcome-header">
          <Zap className="accent-icon" size={32} />
          <h1>Logic Lens Compiler</h1>
        </div>

        <div className="welcome-body">
          <h2 className="greeting">{userName}, {greeting}</h2>
          <p className="motivational">"{message}"</p>
          
          <div className="stats-row">
            <div className="stat-card">
              <Trophy size={20} />
              <span>{streak} Day Streak</span>
            </div>
            <div className="stat-card">
              <Sparkles size={20} />
              <span>Rank: Novice</span>
            </div>
          </div>

          <div className="challenge-box">
            <h3>Today's Micro-Challenge</h3>
            <p>Master the syntax of conditional logic. 0 errors is the goal.</p>
          </div>
        </div>

        <button className="button-primary start-btn" onClick={onStart}>
          Initialize Session
        </button>
      </div>

    </motion.div>
  );
};

export default WelcomeOverlay;
