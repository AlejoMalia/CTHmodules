// ET-calculator.js 
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} EventMetrics - Defines the structure of an event's metrics.
 * @property {number} EVEI - Eventual Integral Valuation Structure [0, 1]
 * @property {number} CTH - Historical Thematic Coherence Index [0, 1]
 * @property {string} [type] - Event type (e.g., 'war', 'scientific'), optional for filtering.
 */

/**
 * Simulates a historical event database.
 * In a real system, this would be a persistent database.
 * Each event has an ID, metrics, and (optionally) a type.
 * Values are hypothetical examples for demonstration purposes.
 */
const HISTORICAL_EVENTS_DB = [
    // Initial sample events (close to EVEI=0.8, CTH=0.7)
    { id: 'H_A01', EVEI: 0.81, CTH: 0.72, type: 'social' },
    { id: 'H_A02', EVEI: 0.79, CTH: 0.68, type: 'political' },
    { id: 'H_A03', EVEI: 0.82, CTH: 0.75, type: 'scientific' },
    { id: 'H_A04', EVEI: 0.78, CTH: 0.65, type: 'social' },
    { id: 'H_A05', EVEI: 0.80, CTH: 0.70, type: 'political' },
    { id: 'H_A06', EVEI: 0.83, CTH: 0.73, type: 'war' },
    { id: 'H_A07', EVEI: 0.77, CTH: 0.69, type: 'social' },
    { id: 'H_A08', EVEI: 0.80, CTH: 0.71, type: 'economic' },
    { id: 'H_A09', EVEI: 0.79, CTH: 0.67, type: 'scientific' },
    { id: 'H_A10', EVEI: 0.81, CTH: 0.74, type: 'war' },

    // --- New events to make tests more robust for type filtering and more análogos ---

    // More war events close to EVEI 0.8 / CTH 0.7
    { id: 'H_B11', EVEI: 0.80, CTH: 0.70, type: 'war' },
    { id: 'H_B12', EVEI: 0.79, CTH: 0.71, type: 'war' },
    { id: 'H_B13', EVEI: 0.82, CTH: 0.69, type: 'war' },
    { id: 'H_B14', EVEI: 0.81, CTH: 0.68, type: 'war' },
    { id: 'H_B15', EVEI: 0.78, CTH: 0.72, type: 'war' },
    { id: 'H_B16', EVEI: 0.80, CTH: 0.67, type: 'war' },


    // Events with low EVEI/CTH to be found by Test 2
    { id: 'H_C01', EVEI: 0.12, CTH: 0.15, type: 'social' },
    { id: 'H_C02', EVEI: 0.08, CTH: 0.09, type: 'political' },
    { id: 'H_C03', EVEI: 0.11, CTH: 0.13, type: 'economic' },

    // A variety of other events for a larger simulated DB
    { id: 'H_D21', EVEI: 0.5, CTH: 0.5, type: 'social' },
    { id: 'H_D22', EVEI: 0.9, CTH: 0.2, type: 'political' },
    { id: 'H_D23', EVEI: 0.3, CTH: 0.8, type: 'scientific' },
    { id: 'H_D24', EVEI: 0.65, CTH: 0.40, type: 'economic' },
    { id: 'H_D25', EVEI: 0.70, CTH: 0.60, type: 'social' },
    { id: 'H_D26', EVEI: 0.45, CTH: 0.85, type: 'scientific' },
    { id: 'H_D27', EVEI: 0.92, CTH: 0.35, type: 'war' },
    { id: 'H_D28', EVEI: 0.25, CTH: 0.90, type: 'political' },
    // You can add many more events here to simulate a truly large historical DB
];

/**
 * Calculates the Temporal Equivalence (ET) for a current event.
 * @param {EventMetrics} currentEvent - Metrics of the current event.
 * @param {object} options - Calculation options.
 * @param {EventMetrics[]} [options.historicalDB=HISTORICAL_EVENTS_DB] - Historical event database.
 * @param {number} [options.toleranceEVEI=0.025] - Tolerance for EVEI (e.g., 2.5% of 0-1 range).
 * @param {number} [options.toleranceCTH=0.025] - Tolerance for CTH (e.g., 2.5% of 0-1 range).
 * @param {string} [options.eventTypeFilter] - Filters analogous events by type (optional).
 * @returns {object} Object with ET value, number of analogous events found, and interpretation.
 */
function calculateTemporalEquivalence(currentEvent, options = {}) {
    const {
        historicalDB = HISTORICAL_EVENTS_DB,
        toleranceEVEI = 0.025, // 2.5% of 1 (0-1 range)
        toleranceCTH = 0.025, // 2.5% of 1 (0-1 range)
        eventTypeFilter
    } = options;

    const { EVEI: current_EVEI, CTH: current_CTH } = currentEvent;

    // 1. Identify Analogous Events
    const analogousEvents = historicalDB.filter(event => {
        const isEVEISimilar = Math.abs(event.EVEI - current_EVEI) <= toleranceEVEI;
        const isCTHSimilar = Math.abs(event.CTH - current_CTH) <= toleranceCTH;
        const isTypeMatching = eventTypeFilter ? event.type === eventTypeFilter : true;

        return isEVEISimilar && isCTHSimilar && isTypeMatching;
    });

    if (analogousEvents.length === 0) {
        return {
            ET: 0,
            numAnalogous: 0,
            avgContextualDifference: 0,
            interpretation: "No analogous historical events were identified within the specified tolerances."
        };
    }

    // 2. Measure Individual Contextual Difference (using CTH)
    let sumContextualDifferences = 0;
    analogousEvents.forEach(event => {
        sumContextualDifferences += Math.abs(event.CTH - current_CTH);
    });

    const avgContextualDifference = sumContextualDifferences / analogousEvents.length;

    // 3. Calculate ET Percentage
    // Since CTH range is 1 (from 0 to 1), normalization is direct.
    const ET_percentage = avgContextualDifference * 100;

    // 4. Generate Interpretation
    let interpretation = `Current Event (EVEI=${current_EVEI.toFixed(1)}, CTH=${current_CTH.toFixed(1)}): `;
    interpretation += `Identified ${analogousEvents.length} analogous historical events `;
    if (eventTypeFilter) {
        interpretation += `of type '${eventTypeFilter}' `;
    }
    interpretation += `with EVEI ≈ ${current_EVEI.toFixed(1)} and CTH ≈ ${current_CTH.toFixed(1)}. `;
    interpretation += `The average absolute difference between the CTH of these analogs and the current CTH (${current_CTH.toFixed(1)}) is ${avgContextualDifference.toFixed(2)}. `;
    interpretation += `Temporal Equivalence (ET): ${ET_percentage.toFixed(0)}% (compared to ${analogousEvents.length} analogous historical events). `;

    if (ET_percentage >= 50) {
        interpretation += "Interpretation: **There is a very high average contextual disparity**, indicating that differences in background conditions, despite similar EVEI/CTH, can very significantly alter the expected dynamics or trajectory of the current event compared to its past analogs.";
    } else if (ET_percentage >= 25) {
        interpretation += "Interpretation: **There is a significant average contextual disparity**, indicating that differences in background conditions, despite similar EVEI/CTH, can significantly alter the expected dynamics or trajectory of the current event compared to its past analogs.";
    } else if (ET_percentage > 0) {
        interpretation += "Interpretation: **There is a moderate or low average contextual disparity**, suggesting that background conditions are relatively comparable with historical analogs, allowing for better extrapolation of past dynamics.";
    } else {
        interpretation += "Interpretation: **No contextual disparity found**, implying high equivalence in background conditions with historical analogs, which could facilitate more direct extrapolation of past dynamics.";
    }

    return {
        ET: ET_percentage,
        numAnalogous: analogousEvents.length,
        avgContextualDifference: avgContextualDifference,
        interpretation: interpretation
    };
}

module.exports = {
    calculateTemporalEquivalence,
    HISTORICAL_EVENTS_DB // Export the DB in case it needs to be expanded or tested
};