// margins-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { calculateEVEI } = require('./evei-calculator'); // Ensure the path is correct
const { analyzeEventCTH } = require('./cth-analysis-module'); // Ensure the path is correct

/**
 * Calculates the Macromargin and Micromargin of a historical event.
 *
 * @param {object} eventData - Object containing the complete event data.
 * @param {string} eventData.name - Name of the event.
 * @param {number} eventData.eventStartYear - Start year of the event.
 * @param {number} eventData.eventEndYear - End year of the event.
 * @param {object} eventData.historicalData - Historical data of the event by phases (before, prelude, during, transition, after).
 * @param {object} eventData.historicalData.before.indicators - Indicators for the 'before' phase.
 * @param {object} eventData.historicalData.prelude.indicators - Indicators for the 'prelude' phase.
 * @param {object} eventData.historicalData.during.indicators - Indicators for the 'during' phase.
 * @param {object} eventData.historicalData.transition.indicators - Indicators for the 'transition' phase.
 * @param {object} eventData.historicalData.after.indicators - Indicators for the 'after' phase.
 * @param {number} eventData.indicatorA - Indicator A for EVEI calculation.
 * @param {number} eventData.indicatorB - Indicator B for EVEI calculation.
 * @param {number} eventData.indicatorC - Indicator C for EVEI calculation.
 * @param {object} [weights] - Optional weights for EVEI, CTH, and FP (Weighting Factor) contribution.
 * @param {number} [weights.evei=0.4] - Default weight for EVEI.
 * @param {number} [weights.cth=0.4] - Default weight for CTH.
 * @param {number} [weights.fp=0.2] - Default weight for the Weighting Factor (FP). The sum of weights must be 1.
 * @returns {object|null} An object with Macromargin, Micromargin, and phase indices, or null if calculation fails.
 */
function calculateMargins(eventData, weights = {}) {
    const defaultWeights = { evei: 0.4, cth: 0.4, fp: 0.2 };
    const effectiveWeights = { ...defaultWeights, ...weights };

    // Validate that the sum of weights is approximately 1
    const sumWeights = effectiveWeights.evei + effectiveWeights.cth + effectiveWeights.fp;
    if (Math.abs(sumWeights - 1) > 0.001) {
        console.error("Error: The sum of EVEI, CTH, and FP weights must be approximately 1.");
        return null;
    }

    let cthResults;
    try {
        cthResults = analyzeEventCTH(eventData.eventStartYear, eventData.eventEndYear, eventData.historicalData);
        if (!cthResults) {
            console.error("Error: analyzeEventCTH could not calculate results.");
            return null;
        }
    } catch (error) {
        console.error("Error running analyzeEventCTH:", error.message);
        return null;
    }

    let eveiResults;
    try {
        eveiResults = calculateEVEI(eventData);
        if (!eveiResults) {
            console.error("Error: calculateEVEI could not calculate results.");
            return null;
        }
    } catch (error) {
        console.error("Error running calculateEVEI:", error.message);
        return null;
    }

    // We use the general event EVEI for all phases for simplicity.
    // If a phase-specific EVEI is desired, calculateEVEI or its input needs adjustment.
    const eventEVEI = eveiResults.value;

    const phaseIndices = {};

    // Helper to calculate I_phase
    // FP (Weighting Factor) can be a constant value or derived from the data itself.
    // For this example, we'll set it as a simple constant, or you can pass it in eventData
    // if it's specific to each phase/event.
    const calculatePhaseIndex = (cthValue, phaseType) => {
        // You could define FP more elaborately. For example, if an external factor
        // indicates the "potential for change" or "potential for stability" in that phase.
        // For this example, we'll use a simple FP based on the idea that
        // internal phases have a higher FP for change, and external phases for stability.
        let fpValue = 0;
        if (['before', 'after'].includes(phaseType)) {
            fpValue = 0.5; // Example: External phases with a stability FP
        } else if (['prelude', 'during', 'transition'].includes(phaseType)) {
            fpValue = 0.5; // Example: Internal phases with a change FP
        }

        return (effectiveWeights.evei * eventEVEI) +
               (effectiveWeights.cth * cthValue) +
               (effectiveWeights.fp * fpValue);
    };

    // Calculate Phase Index (I_phase) for each phase
    if (cthResults.before && cthResults.before.cth !== undefined) {
        phaseIndices.before = calculatePhaseIndex(cthResults.before.cth, 'before');
    }
    if (cthResults.prelude && cthResults.prelude.cth !== undefined) {
        phaseIndices.prelude = calculatePhaseIndex(cthResults.prelude.cth, 'prelude');
    }
    if (cthResults.during && cthResults.during.cth !== undefined) {
        phaseIndices.during = calculatePhaseIndex(cthResults.during.cth, 'during');
    }
    if (cthResults.transition && cthResults.transition.cth !== undefined) {
        phaseIndices.transition = calculatePhaseIndex(cthResults.transition.cth, 'transition');
    }
    if (cthResults.after && cthResults.after.cth !== undefined) {
        phaseIndices.after = calculatePhaseIndex(cthResults.after.cth, 'after');
    }

    // Calculate Macromargin and Micromargin
    // Macromargin: External phases (Before, After)
    const macromarginSum = (phaseIndices.before || 0) + (phaseIndices.after || 0);

    // Micromargin: Internal phases (Prelude, During, Transition)
    const micromarginSum = (phaseIndices.prelude || 0) + (phaseIndices.during || 0) + (phaseIndices.transition || 0);

    const totalMarginSum = macromarginSum + micromarginSum;

    if (totalMarginSum === 0) {
        console.warn("Warning: Total margin sum is zero, percentages cannot be calculated.");
        return {
            macromargin: 0,
            micromargin: 0,
            macromarginPercentage: 0,
            micromarginPercentage: 0,
            phaseIndices: phaseIndices
        };
    }

    const macromarginPercentage = (macromarginSum / totalMarginSum) * 100;
    const micromarginPercentage = (micromarginSum / totalMarginSum) * 100;

    return {
        macromargin: macromarginSum,
        micromargin: micromarginSum,
        macromarginPercentage: macromarginPercentage,
        micromarginPercentage: micromarginPercentage,
        phaseIndices: phaseIndices // For detailed inspection
    };
}

module.exports = { calculateMargins };