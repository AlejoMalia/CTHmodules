// fp-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} FactorDetail
 * @property {string} name - Name of the historical figure or event.
 * @property {number} EVEI - EVEI value of the factor.
 * @property {number} CTH - CTH value of the factor.
 */

/**
 * @typedef {object} PhaseData
 * @property {string} name - Name of the temporal phase (e.g., "BEFORE", "PRELUDE").
 * @property {FactorDetail[]} humanFactors - Array of objects representing the Human Factors in this phase.
 * @property {FactorDetail[]} eventFactors - Array of objects representing the Eventual Factors in this phase.
 */

/**
 * Calculates the Potential Factors (FP) for a specific temporal phase of an event.
 *
 * @param {PhaseData} phaseData - Object containing the data for the temporal phase.
 * @returns {object} An object with the calculated FP for EVEI and CTH of the phase.
 */
function calculatePotentialFactors(phaseData) {
    // 1. Aggregation by Human Factor (FH)
    let sumEVEI_FH_phase = 0;
    let sumCTH_FH_phase = 0;
    phaseData.humanFactors.forEach(factor => {
        sumEVEI_FH_phase += factor.EVEI;
        sumCTH_FH_phase += factor.CTH;
    });

    // 2. Aggregation by Eventual Factor (FE)
    let sumEVEI_FE_phase = 0;
    let sumCTH_FE_phase = 0;
    phaseData.eventFactors.forEach(factor => {
        sumEVEI_FE_phase += factor.EVEI;
        sumCTH_FE_phase += factor.CTH;
    });

    // 3. Calculate Potential Factors (FP) for the phase
    // Following the provided examples, it's a direct sum of the aggregations.
    const FP_EVEI_phase = sumEVEI_FH_phase + sumEVEI_FE_phase;
    const FP_CTH_phase = sumCTH_FH_phase + sumCTH_FE_phase;

    return {
        phaseName: phaseData.name,
        FP_EVEI: FP_EVEI_phase,
        FP_CTH: FP_CTH_phase,
        // Optional: Can add aggregated sums for debugging/visualization
        _debug: {
            sumEVEI_FH: sumEVEI_FH_phase,
            sumCTH_FH: sumCTH_FH_phase,
            sumEVEI_FE: sumEVEI_FE_phase,
            sumCTH_FE: sumCTH_FE_phase,
        }
    };
}

module.exports = {
    calculatePotentialFactors
};