/**
 * Shared scoring logic for candidate tier, star rating, and vehicle adjustments.
 * Used by both jobRoutes (manual pipeline add) and applyRoutes (public apply).
 */

/**
 * Calculate tier based on score.
 * @param {number} score - Overall score 0-100
 * @returns {'green'|'yellow'|'red'}
 */
function calculateTier(score) {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
}

/**
 * Calculate star rating based on score.
 * @param {number} score - Overall score 0-100
 * @returns {number} Star rating rounded to 1 decimal
 */
function calculateStarRating(score) {
    let rating;
    if (score >= 80) {
        rating = 4.0 + (score - 80) / 20; // 4.0 to 5.0
    } else if (score >= 50) {
        rating = 2.0 + (score - 50) / 30 * 1.9; // 2.0 to 3.9
    } else {
        rating = score / 50 * 1.5; // 0 to 1.5
    }
    return Math.round(rating * 10) / 10;
}

/**
 * Adjust score for vehicle requirement.
 * @param {number} score - Current score
 * @param {string} vehicleStatus - 'has_vehicle', 'no_vehicle', or 'unknown'
 * @param {boolean} vehicleRequired - Whether the job requires a vehicle
 * @returns {number} Adjusted score clamped to 0-100
 */
function adjustScoreForVehicle(score, vehicleStatus, vehicleRequired) {
    if (!vehicleRequired) return score;

    let adjusted = score;
    if (vehicleStatus === 'has_vehicle') {
        adjusted = score + 5;
    } else if (vehicleStatus === 'no_vehicle') {
        adjusted = score - 10;
    }
    return Math.min(100, Math.max(0, adjusted));
}

module.exports = {
    calculateTier,
    calculateStarRating,
    adjustScoreForVehicle
};
