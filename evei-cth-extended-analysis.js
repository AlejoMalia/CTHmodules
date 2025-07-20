// evei-cth-extended-analysis.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import necessary modules
const { analyzeEventCTH } = require('./cth-analysis-module'); // Assuming this path
const { calculateEVEI } = require('./evei-calculator'); // Assuming this path

// --- HELPER FUNCTIONS ---

/**
 * Calculates the Incremental Event Causality (IEC).
 * This metric evaluates the degree to which an event is a direct cause of observed changes
 * in the socio-historical context (CTH). It considers the magnitude and direction of CTH
 * change immediately following the event.
 *
 * Formula: IEC = CTH_change_post_event / CTH_volatility_pre_event
 * (Simplified, assuming CTH_change_post_event = CTH_transition - CTH_prelude)
 *
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthTransition - CTH value during the transition phase.
 * @param {number} cthDuring - CTH value during the event itself.
 * @returns {number} IEC value (0 to 1), or 0 if inputs are invalid.
 */
function calculateIEC(cthPrelude, cthTransition, cthDuring) {
    // Validate inputs
    if (typeof cthPrelude !== 'number' || isNaN(cthPrelude) ||
        typeof cthTransition !== 'number' || isNaN(cthTransition) ||
        typeof cthDuring !== 'number' || isNaN(cthDuring)) {
        // console.warn("Invalid input for calculateIEC. Returning 0.");
        return 0;
    }

    // Assuming causality is more evident if transition is significantly different from prelude
    // and if the event itself represents a significant point.
    // This is a conceptual simplification. Real IEC would require more complex modeling.
    const cthChange = Math.abs(cthTransition - cthPrelude);
    const cthVolatility = Math.max(cthPrelude, cthDuring, cthTransition) - Math.min(cthPrelude, cthDuring, cthTransition);

    let iec = 0;
    // Avoid division by zero
    if (cthVolatility > 0) {
        iec = cthChange / cthVolatility;
    } else if (cthChange > 0) { // If volatility is 0 but there was a change, it implies high causality
        iec = 1;
    }

    return parseFloat(Math.max(0, Math.min(1, iec)).toFixed(4));
}

/**
 * Calculates the Predictive Power Index (PPI).
 * This metric assesses how well the pre-event CTH and event properties (action, reaction, result)
 * predict the post-event CTH. A high PPI suggests that the event dynamics were largely predictable
 * given the initial context.
 *
 * Formula: PPI = 1 - (abs(CTH_after - CTH_predicted) / MAX_CTH_DIFF)
 * (Simplified, assuming CTH_predicted is influenced by action/reaction/result)
 *
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @param {number} actionValue - Normalized value (0-1) representing proactive measures.
 * @param {number} reactionValue - Normalized value (0-1) representing reactive responses.
 * @param {number} resultValue - Normalized value (0-1) representing the immediate outcome.
 * @returns {number} PPI value (0 to 1), or 0 if inputs are invalid.
 */
function calculatePPI(cthPrelude, cthAfter, actionValue, reactionValue, resultValue) {
    // Validate inputs
    if (typeof cthPrelude !== 'number' || isNaN(cthPrelude) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter) ||
        typeof actionValue !== 'number' || isNaN(actionValue) ||
        typeof reactionValue !== 'number' || isNaN(reactionValue) ||
        typeof resultValue !== 'number' || isNaN(resultValue)) {
        // console.warn("Invalid input for calculatePPI. Returning 0.");
        return 0;
    }

    // Simplistic prediction model: CTH_after is influenced by prelude CTH and event values.
    // This is a highly simplified model. A real predictive model would be more complex.
    const cthPredicted = (cthPrelude + actionValue + reactionValue + resultValue) / 4; // Arbitrary average

    const MAX_CTH_DIFF = 1.0; // Max possible difference between CTH values (0 to 1)

    let ppi = 0;
    if (MAX_CTH_DIFF > 0) {
        ppi = 1 - (Math.abs(cthAfter - cthPredicted) / MAX_CTH_DIFF);
    } else { // Should not happen if CTH is normalized 0-1
        ppi = 0;
    }

    return parseFloat(Math.max(0, Math.min(1, ppi)).toFixed(4));
}

/**
 * Calculates the Volatility and Vulnerability Coefficient (VVC).
 * This metric assesses the inherent instability of the socio-historical system during the event,
 * and its susceptibility to significant negative shifts.
 *
 * Formula: VVC = (CTH_during_std_dev + CTH_risk_factors) / 2
 * (Simplified, using a proxy for std dev and risk factors)
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthDuring - CTH value during the event phase.
 * @param {number} cthTransition - CTH value during the transition phase.
 * @returns {number} VVC value (0 to 1), or 0 if inputs are invalid.
 */
function calculateVVC(cthBefore, cthPrelude, cthDuring, cthTransition) {
    // Validate inputs
    if (typeof cthBefore !== 'number' || isNaN(cthBefore) ||
        typeof cthPrelude !== 'number' || isNaN(cthPrelude) ||
        typeof cthDuring !== 'number' || isNaN(cthDuring) ||
        typeof cthTransition !== 'number' || isNaN(cthTransition)) {
        // console.warn("Invalid input for calculateVVC. Returning 0.");
        return 0;
    }

    // Proxy for standard deviation: range of CTH values
    const cthValues = [cthBefore, cthPrelude, cthDuring, cthTransition];
    const cthRange = Math.max(...cthValues) - Math.min(...cthValues);

    // Conceptual risk factors (e.g., higher range indicates higher volatility/vulnerability)
    // This is a highly simplified interpretation of "risk factors".
    const riskFactor = cthRange; // Using range as a simple risk proxy

    let vvc = (cthRange + riskFactor) / 2; // Arbitrary average for conceptual VVC

    return parseFloat(Math.max(0, Math.min(1, vvc)).toFixed(4));
}

/**
 * Calculates the Modified CTH Evaluation (MCE).
 * MCE measures the net change in CTH from the "before" to the "after" phase,
 * providing an overall assessment of the event's long-term impact on the socio-historical context.
 *
 * Formula: MCE = (CTH_after - CTH_before + 1) / 2 (Normalized to 0-1)
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @returns {number} MCE value (0 to 1), or 0 if inputs are invalid.
 */
function calculateMCE(cthBefore, cthAfter) {
    // Validate inputs
    if (typeof cthBefore !== 'number' || isNaN(cthBefore) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter)) {
        // console.warn("Invalid input for calculateMCE. Returning 0.");
        return 0;
    }

    // Normalize (CTH_after - CTH_before) from [-1, 1] to [0, 1]
    const mce = (cthAfter - cthBefore + 1) / 2;
    return parseFloat(Math.max(0, Math.min(1, mce)).toFixed(4));
}

/**
 * Calculates the Impact Intensity Gradient (IIG).
 * This metric assesses the severity and abruptness of changes caused by the event.
 * It's derived from the difference between the maximum and minimum CTH values
 * observed during the event's influence.
 *
 * Formula: IIG = (Max_CTH - Min_CTH) / Max_possible_CTH_range
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthDuring - CTH value during the event phase.
 * @param {number} cthTransition - CTH value during the transition phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @param {object} [weights] - Optional, but not used in this simplified version.
 * @returns {number} IIG value (0 to 1), or 0 if inputs are invalid.
 */
function calculateIIG(cthBefore, cthPrelude, cthDuring, cthTransition, cthAfter, weights = {}) {
    const cths = [cthBefore, cthPrelude, cthDuring, cthTransition, cthAfter].filter(val => typeof val === 'number' && !isNaN(val));

    if (cths.length === 0) {
        // console.warn("No valid CTH values for IIG calculation. Returning 0.");
        return 0;
    }

    const maxCTH = Math.max(...cths);
    const minCTH = Math.min(...cths);
    const range = maxCTH - minCTH;

    const maxPossibleRange = 1.0; // CTH is normalized 0-1

    let iig = 0;
    if (maxPossibleRange > 0) {
        iig = range / maxPossibleRange;
    }
    return parseFloat(Math.max(0, Math.min(1, iig)).toFixed(4));
}

/**
 * Calculates the Unexpected Instability Ratio (UIR).
 * This metric quantifies the degree of surprise or unpredictability of the event's impact.
 * It's derived by comparing the observed CTH change to the expected CTH change.
 *
 * Formula: UIR = abs(Observed_Change - Expected_Change) / Max_Possible_Change
 * (Simplified, using CTH_prelude vs CTH_during for observed, and a simple expected value)
 *
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthDuring - CTH value during the event phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @param {object} [weights] - Optional, but not used in this simplified version.
 * @returns {number} UIR value (0 to 1), or 0 if inputs are invalid.
 */
function calculateUIR(cthPrelude, cthDuring, cthAfter, weights = {}) {
    if (typeof cthPrelude !== 'number' || isNaN(cthPrelude) ||
        typeof cthDuring !== 'number' || isNaN(cthDuring) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter)) {
        // console.warn("Invalid input for UIR calculation. Returning 0.");
        return 0;
    }

    const observedChange = cthDuring - cthPrelude; // Change from prelude to during
    const expectedChange = (cthAfter - cthPrelude) / 2; // Simplistic expected change (mid-point from prelude to after)

    const maxPossibleChange = 1.0; // Max CTH difference is 1 (e.g., 0 to 1 or 1 to 0)

    let uir = 0;
    if (maxPossibleChange > 0) {
        uir = Math.abs(observedChange - expectedChange) / maxPossibleChange;
    }
    return parseFloat(Math.max(0, Math.min(1, uir)).toFixed(4));
}

/**
 * Calculates the Potential Transformation Scale (PTS).
 * This metric assesses the inherent capacity of the event to drive fundamental, long-term shifts
 * in the socio-historical system. It considers the overall CTH trajectory.
 *
 * Formula: PTS = (CTH_after + CTH_transition - CTH_before - CTH_prelude) / 2
 * (Normalized, conceptual; higher values mean more transformative potential)
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthPrelude - CTH value during the prelude phase.
 * @param {number} cthTransition - CTH value during the transition phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @returns {number} PTS value (0 to 1), or 0 if inputs are invalid.
 */
function calculatePTS(cthBefore, cthPrelude, cthTransition, cthAfter) {
    if (typeof cthBefore !== 'number' || isNaN(cthBefore) ||
        typeof cthPrelude !== 'number' || isNaN(cthPrelude) ||
        typeof cthTransition !== 'number' || isNaN(cthTransition) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter)) {
        // console.warn("Invalid input for PTS calculation. Returning 0.");
        return 0;
    }

    // This formula aims to capture a net positive (or negative) long-term shift.
    // The range of (CTH_after + CTH_transition - CTH_before - CTH_prelude) is -2 to 2.
    // Normalize it to 0-1 by adding 2 and dividing by 4.
    const pts = (cthAfter + cthTransition - cthBefore - cthPrelude + 2) / 4;
    return parseFloat(Math.max(0, Math.min(1, pts)).toFixed(4));
}

/**
 * Calculates the Resilience Dynamics (RD).
 * This metric measures the system's ability to absorb shocks and adapt to the changes
 * brought about by the event, returning to a stable (possibly new) state.
 *
 * Formula: RD = (CTH_after - CTH_during) / (CTH_before - CTH_during + epsilon)
 * (Simplified to show recovery from "during" to "after" relative to initial shock from "before" to "during")
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthDuring - CTH value during the event phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @returns {number} RD value (0 to 1), or 0 if inputs are invalid or no shock occurred.
 */
function calculateRD(cthBefore, cthDuring, cthAfter) {
    if (typeof cthBefore !== 'number' || isNaN(cthBefore) ||
        typeof cthDuring !== 'number' || isNaN(cthDuring) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter)) {
        // console.warn("Invalid input for RD calculation. Returning 0.");
        return 0;
    }

    const shockMagnitude = Math.abs(cthBefore - cthDuring);
    const recoveryMagnitude = Math.abs(cthAfter - cthDuring);

    let rd = 0;
    const epsilon = 1e-6; // Small value to prevent division by zero

    if (shockMagnitude > epsilon) {
        rd = 1 - (recoveryMagnitude / shockMagnitude); // Lower recoveryMagnitude relative to shock means higher resilience (closer to original)
        // Adjust if it implies adapting to a new state rather than returning to old.
        // For simplicity, a value closer to 1 means the system returned/adapted well.
    } else {
        rd = 1; // If no shock, assume full resilience
    }
    // Normalize to 0-1 scale. This simple formula can go negative if recovery is greater than shock.
    // A more complex RD would consider if 'after' is a desired state.
    return parseFloat(Math.max(0, Math.min(1, rd)).toFixed(4));
}

/**
 * Calculates the Post-Event Progress Index (PPIC).
 * This metric measures the degree of positive progression or improvement in the socio-historical context
 * after the event has concluded, relative to its initial state.
 *
 * Formula: PPIC = (CTH_after - CTH_before + 1) / 2
 * (Normalized to 0-1, similar to MCE, but explicitly focusing on 'progress')
 *
 * @param {number} cthBefore - CTH value during the before phase.
 * @param {number} cthAfter - CTH value during the after phase.
 * @returns {number} PPIC value (0 to 1), or 0 if inputs are invalid.
 */
function calculatePPIC(cthBefore, cthAfter) {
    if (typeof cthBefore !== 'number' || isNaN(cthBefore) ||
        typeof cthAfter !== 'number' || isNaN(cthAfter)) {
        // console.warn("Invalid input for PPIC calculation. Returning 0.");
        return 0;
    }

    // Normalize CTH_after - CTH_before from [-1, 1] to [0, 1]
    const ppic = (cthAfter - cthBefore + 1) / 2;
    return parseFloat(Math.max(0, Math.min(1, ppic)).toFixed(4));
}

// --- MAIN EXTENDED ANALYSIS FUNCTION ---

/**
 * Performs an extended analysis of an event, including CTH, EVEI, and other derived metrics.
 *
 * @param {object} eventData - The complete event data object, including historicalData,
 * indicatorA, indicatorB, indicatorC, name, eventStartYear, eventEndYear.
 * @param {number} actionValue - Normalized value (0-1) for 'Action'.
 * @param {number} reactionValue - Normalized value (0-1) for 'Reaction'.
 * @param {number} resultValue - Normalized value (0-1) for 'Result'.
 * @param {number} cthAscendingValue - A hypothetical value indicating a general trend or desired CTH trajectory (0-1).
 * Used for `deltaCTH_Total` calculation (e.g., if current CTH is "ascending" towards this value).
 * @returns {object} An object containing the extended analysis results, including CTH, EVEI, IEC, PPI, VVC, MCE, IIG, UIR, PTS, RD, PPIC.
 */
function analyzeEventExtended(eventData, actionValue, reactionValue, resultValue, cthAscendingValue) {
    // Validate primary eventData structure
    if (!eventData || typeof eventData !== 'object' ||
        !eventData.historicalData || typeof eventData.historicalData !== 'object' ||
        typeof eventData.eventStartYear !== 'number' || isNaN(eventData.eventStartYear) ||
        typeof eventData.eventEndYear !== 'number' || isNaN(eventData.eventEndYear)) {
        console.error("analyzeEventExtended: Invalid or incomplete eventData provided.");
        throw new Error("Invalid or incomplete eventData for extended analysis.");
    }

    // Validate actionValue, reactionValue, resultValue, cthAscendingValue
    const validateMetric = (value, name) => {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 1) {
            // console.warn(`Warning: ${name} (${value}) is not a valid number between 0 and 1. Clamping to [0,1].`);
            return Math.max(0, Math.min(1, value)); // Clamp to valid range
        }
        return value;
    };

    const validatedActionValue = validateMetric(actionValue, 'actionValue');
    const validatedReactionValue = validateMetric(reactionValue, 'reactionValue');
    const validatedResultValue = validateMetric(resultValue, 'resultValue');
    const validatedCthAscendingValue = validateMetric(cthAscendingValue, 'cthAscendingValue');

    let temporalData = null;
    try {
        // Step 1: Perform CTH analysis and data inference
        temporalData = analyzeEventCTH(
            eventData.eventStartYear,
            eventData.eventEndYear,
            eventData.historicalData
        );
        if (!temporalData) {
            throw new Error("CTH analysis returned null (due to invalid input to analyzeEventCTH).");
        }
    } catch (cthError) {
        console.error(`Error during CTH analysis for ${eventData.name}:`, cthError.message);
        throw cthError; // Re-throw to indicate critical failure
    }

    // Extract CTH values for the different phases
    const cthBefore = temporalData.before.cth;
    const cthPrelude = temporalData.prelude.cth;
    const cthDuring = temporalData.during.cth;
    const cthTransition = temporalData.transition.cth;
    const cthAfter = temporalData.after.cth;

    // --- Calculate Derived Metrics ---
    let eveiResult = { value: 0.0, interpretation: "Error during EVEI calculation." };
    try {
        // **IMPORTANT CORRECTION HERE**: Pass the entire eventData object
        // as calculateEVEI now expects to read indicatorA, B, C from it.
        eveiResult = calculateEVEI(eventData);
    } catch (e) {
        console.error(`Error calculating EVEI for ${eventData.name}:`, e.message);
    }

    const iec = calculateIEC(cthPrelude, cthTransition, cthDuring);
    const ppi = calculatePPI(cthPrelude, cthAfter, validatedActionValue, validatedReactionValue, validatedResultValue);
    const vvc = calculateVVC(cthBefore, cthPrelude, cthDuring, cthTransition);
    const mce = calculateMCE(cthBefore, cthAfter);
    const iig = calculateIIG(cthBefore, cthPrelude, cthDuring, cthTransition, cthAfter);
    const uir = calculateUIR(cthPrelude, cthDuring, cthAfter);
    const pts = calculatePTS(cthBefore, cthPrelude, cthTransition, cthAfter);
    const rd = calculateRD(cthBefore, cthDuring, cthAfter);
    const ppic = calculatePPIC(cthBefore, cthAfter);

    // Calculate deltaCTH_Total (conceptual metric)
    // This could represent the change from the initial state (before) towards some 'ascending' target,
    // or simply the net change over the entire event span.
    // For simplicity, let's use net change from 'before' to 'after'.
    const deltaCTH_Total = parseFloat(Math.max(0, Math.min(1, Math.abs(cthAfter - cthBefore))).toFixed(4));


    // Construct the extended analysis results object
    const extendedAnalysisResults = {
        cthAnalysis: {
            before: cthBefore,
            prelude: cthPrelude,
            during: cthDuring,
            transition: cthTransition,
            after: cthAfter,
        },
        evei: eveiResult.value, // EVEI value
        iec: iec,
        ppi: ppi,
        vvc: vvc,
        mce: mce,
        deltaCTH_Total: deltaCTH_Total,
        iig: iig,
        uir: uir,
        pts: pts,
        rd: rd,
        ppic: ppic,
        // Include event metadata for context
        eventName: eventData.name,
        eventStartYear: eventData.eventStartYear,
        eventEndYear: eventData.eventEndYear,
        // Add interpretation for EVEI
        eveiInterpretation: eveiResult.interpretation,
        // Additional derived values or indicators could be added here
    };

    return extendedAnalysisResults;
}

module.exports = {
    analyzeEventExtended,
    // Export individual calculation functions if they need to be tested or used separately
    calculateIEC,
    calculatePPI,
    calculateVVC,
    calculateMCE,
    calculateIIG,
    calculateUIR,
    calculatePTS,
    calculateRD,
    calculatePPIC
};