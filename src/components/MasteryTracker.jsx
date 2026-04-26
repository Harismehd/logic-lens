import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target } from 'lucide-react';
import { getMastery, getBadgeLabel } from '../services/MasteryEngine';

const MasteryTracker = ({ data }) => {
    const mastery = data || getMastery();

    return (
        <div className="mastery-tracker glass-panel">
            <div className="mastery-header">
                <Trophy size={20} color="#FFD700" />
                <h2>Mastery Progress</h2>
                <div className="level-badge">LVL {mastery.level}</div>
            </div>

            <div className="xp-bar-container">
                <div className="xp-label">XP: {mastery.xp} / {mastery.level * 100}</div>
                <div className="xp-bar">
                    <motion.div 
                        className="xp-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (mastery.xp / (mastery.level * 100)) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="concepts-grid">
                {Object.entries(mastery.concepts).map(([id, stats]) => (
                    <div key={id} className="concept-stat">
                        <div className="concept-info">
                            <span className="concept-name">{id.replace(/_/g, ' ')}</span>
                            <span className="concept-score">{stats.score}%</span>
                        </div>
                        <div className="score-bar">
                            <motion.div 
                                className="score-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.score}%` }}
                                style={{ background: stats.score > 80 ? 'var(--clr-success)' : 'var(--clr-accent)' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {mastery.badges.length > 0 && (
                <div className="badges-section">
                    <h3>Badges Earned</h3>
                    <div className="badges-list">
                        {mastery.badges.map(badge => (
                            <div key={badge} className="badge-item" title={getBadgeLabel(badge)}>
                                <Star size={16} fill="#FFD700" color="#FFD700" />
                                <span>{getBadgeLabel(badge)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasteryTracker;
