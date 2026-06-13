const {
    calculateTier,
    calculateStarRating,
    adjustScoreForVehicle,
    determineGiveThemAChance,
} = require('../services/scoringService');

// ─── calculateTier ───────────────────────────────────────────────────────────

describe('calculateTier', () => {
    describe('green tier (score >= 80)', () => {
        test('score 80 returns green', () => {
            expect(calculateTier(80)).toBe('green');
        });
        test('score 100 returns green', () => {
            expect(calculateTier(100)).toBe('green');
        });
        test('score 95 returns green', () => {
            expect(calculateTier(95)).toBe('green');
        });
    });

    describe('yellow tier (50 <= score < 80)', () => {
        test('score 79 returns yellow', () => {
            expect(calculateTier(79)).toBe('yellow');
        });
        test('score 50 returns yellow', () => {
            expect(calculateTier(50)).toBe('yellow');
        });
        test('score 65 returns yellow', () => {
            expect(calculateTier(65)).toBe('yellow');
        });
    });

    describe('red tier (score < 50)', () => {
        test('score 49 returns red', () => {
            expect(calculateTier(49)).toBe('red');
        });
        test('score 0 returns red', () => {
            expect(calculateTier(0)).toBe('red');
        });
        test('score 25 returns red', () => {
            expect(calculateTier(25)).toBe('red');
        });
    });
});

// ─── calculateStarRating ─────────────────────────────────────────────────────

describe('calculateStarRating', () => {
    test('score 100 returns 5.0', () => {
        expect(calculateStarRating(100)).toBe(5.0);
    });
    test('score 80 returns 4.0', () => {
        expect(calculateStarRating(80)).toBe(4.0);
    });
    test('score 50 returns 2.0', () => {
        expect(calculateStarRating(50)).toBe(2.0);
    });
    test('score 0 returns 0.0', () => {
        expect(calculateStarRating(0)).toBe(0.0);
    });

    test('result is rounded to 1 decimal place', () => {
        const rating = calculateStarRating(55);
        // Check it has at most 1 decimal place
        expect(rating).toBe(Math.round(rating * 10) / 10);
    });

    test('green scores produce rating between 4.0 and 5.0', () => {
        for (const score of [80, 85, 90, 95, 100]) {
            const rating = calculateStarRating(score);
            expect(rating).toBeGreaterThanOrEqual(4.0);
            expect(rating).toBeLessThanOrEqual(5.0);
        }
    });

    test('yellow scores produce rating between 2.0 and 3.9', () => {
        for (const score of [50, 60, 70, 79]) {
            const rating = calculateStarRating(score);
            expect(rating).toBeGreaterThanOrEqual(2.0);
            expect(rating).toBeLessThanOrEqual(3.9);
        }
    });

    test('red scores produce rating between 0 and 1.5', () => {
        for (const score of [0, 10, 25, 49]) {
            const rating = calculateStarRating(score);
            expect(rating).toBeGreaterThanOrEqual(0);
            expect(rating).toBeLessThanOrEqual(1.5);
        }
    });
});

// ─── adjustScoreForVehicle ───────────────────────────────────────────────────

describe('adjustScoreForVehicle', () => {
    describe('vehicle not required', () => {
        test('returns score unchanged when vehicle not required', () => {
            expect(adjustScoreForVehicle(70, 'has_vehicle', false)).toBe(70);
            expect(adjustScoreForVehicle(70, 'no_vehicle', false)).toBe(70);
            expect(adjustScoreForVehicle(70, 'unknown', false)).toBe(70);
        });
    });

    describe('vehicle required', () => {
        test('has_vehicle adds 5 to score', () => {
            expect(adjustScoreForVehicle(70, 'has_vehicle', true)).toBe(75);
        });
        test('no_vehicle subtracts 10 from score', () => {
            expect(adjustScoreForVehicle(70, 'no_vehicle', true)).toBe(60);
        });
        test('unknown status leaves score unchanged', () => {
            expect(adjustScoreForVehicle(70, 'unknown', true)).toBe(70);
        });
    });

    describe('clamping', () => {
        test('score cannot exceed 100', () => {
            expect(adjustScoreForVehicle(98, 'has_vehicle', true)).toBe(100);
            expect(adjustScoreForVehicle(100, 'has_vehicle', true)).toBe(100);
        });
        test('score cannot go below 0', () => {
            expect(adjustScoreForVehicle(5, 'no_vehicle', true)).toBe(0);
            expect(adjustScoreForVehicle(0, 'no_vehicle', true)).toBe(0);
        });
    });
});

// ─── determineGiveThemAChance ────────────────────────────────────────────────

describe('determineGiveThemAChance', () => {
    test('red tier (score < 50) never qualifies, regardless of other factors', () => {
        expect(determineGiveThemAChance({
            score: 49,
            yearsOfExperience: 5,
            requiredYears: 2,
            certificationsScore: 100,
            technicalSkillsScore: 100,
            presentationScore: 100,
            summary: 'promoted to manager, customer service expert'
        })).toBe(false);
    });

    test('limited experience but strong certifications qualifies', () => {
        expect(determineGiveThemAChance({
            score: 60,
            yearsOfExperience: 1,
            requiredYears: 2,
            certificationsScore: 85,
            technicalSkillsScore: 0,
            presentationScore: 0,
            summary: ''
        })).toBe(true);
    });

    test('limited experience with weak certs and skills does not qualify', () => {
        expect(determineGiveThemAChance({
            score: 60,
            yearsOfExperience: 1,
            requiredYears: 2,
            certificationsScore: 50,
            technicalSkillsScore: 50,
            presentationScore: 0,
            summary: ''
        })).toBe(false);
    });

    test('overqualified with high score qualifies', () => {
        expect(determineGiveThemAChance({
            score: 75,
            yearsOfExperience: 10,
            requiredYears: 2,
            certificationsScore: 0,
            technicalSkillsScore: 0,
            presentationScore: 0,
            summary: ''
        })).toBe(true);
    });

    test('overqualified but score below 75 does not qualify on that basis alone', () => {
        expect(determineGiveThemAChance({
            score: 70,
            yearsOfExperience: 10,
            requiredYears: 2,
            certificationsScore: 0,
            technicalSkillsScore: 0,
            presentationScore: 0,
            summary: ''
        })).toBe(false);
    });

    test('transferable background with strong presentation qualifies', () => {
        expect(determineGiveThemAChance({
            score: 55,
            yearsOfExperience: 0,
            requiredYears: 0,
            certificationsScore: 0,
            technicalSkillsScore: 0,
            presentationScore: 75,
            summary: 'Previously worked in customer service before transitioning to HVAC.'
        })).toBe(true);
    });

    test('transferable keywords without strong presentation do not qualify', () => {
        expect(determineGiveThemAChance({
            score: 55,
            yearsOfExperience: 0,
            requiredYears: 0,
            certificationsScore: 0,
            technicalSkillsScore: 0,
            presentationScore: 60,
            summary: 'Previously worked in customer service before transitioning to HVAC.'
        })).toBe(false);
    });

    test('solid yellow-tier candidate with no compensating factors does not qualify', () => {
        expect(determineGiveThemAChance({
            score: 65,
            yearsOfExperience: 2,
            requiredYears: 2,
            certificationsScore: 60,
            technicalSkillsScore: 60,
            presentationScore: 60,
            summary: 'Experienced HVAC technician with solid fundamentals.'
        })).toBe(false);
    });

    test('handles missing optional fields without throwing', () => {
        expect(determineGiveThemAChance({ score: 60 })).toBe(false);
    });
});
