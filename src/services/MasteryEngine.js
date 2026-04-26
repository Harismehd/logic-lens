/**
 * Mastery Engine
 * Tracks student progress across concepts and manages gamification
 */

const STORAGE_KEY = 'logic_lens_mastery';

const defaultMastery = {
    concepts: {
        code_block_syntax: { score: 0, attempts: 0, fixes: 0 },
        indentation: { score: 0, attempts: 0, fixes: 0 },
        variable_declaration: { score: 0, attempts: 0, fixes: 0 },
        data_types: { score: 0, attempts: 0, fixes: 0 },
        comparison_vs_assignment: { score: 0, attempts: 0, fixes: 0 }
    },
    badges: [],
    level: 1,
    xp: 0
};

export const getMastery = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return defaultMastery;
        const parsed = JSON.parse(saved);
        // Ensure all concepts exist (migration)
        const concepts = { ...defaultMastery.concepts, ...parsed.concepts };
        return { ...defaultMastery, ...parsed, concepts };
    } catch (e) {
        console.error("Mastery Load Error:", e);
        return defaultMastery;
    }
};

export const updateMastery = (conceptId, wasFixedAuto) => {
    const mastery = getMastery();
    if (!mastery.concepts) mastery.concepts = defaultMastery.concepts;
    if (!mastery.concepts[conceptId]) {
        mastery.concepts[conceptId] = { score: 0, attempts: 0, fixes: 0 };
    }

    const concept = mastery.concepts[conceptId];
    concept.attempts += 1;
    
    if (wasFixedAuto) {
        concept.fixes += 1;
        concept.score = Math.min(100, concept.score + 5);
        mastery.xp += 10;
    } else {
        // Manual fix gives more points
        concept.score = Math.min(100, concept.score + 15);
        mastery.xp += 30;
    }

    // Check for level up
    const nextLevelXp = mastery.level * 100;
    if (mastery.xp >= nextLevelXp) {
        mastery.level += 1;
        mastery.xp = mastery.xp - nextLevelXp;
    }

    // Check for badges
    if (concept.score === 100 && !mastery.badges.includes(`${conceptId}_master`)) {
        mastery.badges.push(`${conceptId}_master`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery));
    return mastery;
};

export const getBadgeLabel = (badgeId) => {
    const labels = {
        code_block_syntax_master: "Colon Master",
        indentation_master: "Alignment Artist",
        variable_declaration_master: "Name Ninja",
        data_types_master: "Type Titan",
        comparison_vs_assignment_master: "Equality Expert"
    };
    return labels[badgeId] || badgeId;
};
