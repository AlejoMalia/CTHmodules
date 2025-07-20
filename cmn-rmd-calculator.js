// CMN-RMD-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * Calculates the CMN (Change Minimum Necessary), RMD (Result Maximum Desired),
 * and Reality Variable for a current event, using analogous events as reference.
 *
 * CMN represents the current event's proximity to a radical change threshold,
 * inferred from analogous events' critical points. Lower value means closer to CMN.
 * RMD represents the current event's proximity to a stable/desired state,
 * inferred from analogous events' stable outcomes. Lower value means closer to RMD.
 * Reality Variable measures the consistency (or inconsistency) of these inferences
 * across different analogous events. Higher value means more uncertainty/malleability.
 *
 * @param {object} currentEventMetrics - Metrics and analysis of the current event (e.g., French Revolution).
 * Must contain: { name: string, eveiAnalysis: { value: number }, cthAnalysis: { during: { cth: number } }, ... }
 * @param {Array<object>} analogousEventsMetrics - Array of metrics and analysis of analogous events.
 * Each object must contain: {
 * name: string,
 * eveiAnalysis: { value: number },
 * cthAnalysis: { during: { cth: number } },
 * criticalPoint: { evei: number, cth: number }, // EVEI/CTH values at the analogue's radical change point
 * stableState: { evei: number, cth: number }    // EVEI/CTH values at the analogue's stable outcome
 * }
 * @returns {object} Object with consolidated CMN, RMD, and Reality Variable for the current event.
 */
function calculateCMNRMD(currentEventMetrics, analogousEventsMetrics) {
    if (!currentEventMetrics || !analogousEventsMetrics || analogousEventsMetrics.length === 0) {
        throw new Error("Current event metrics and at least one analogous event are required for CMN-RMD calculation.");
    }

    const currentEVEI = currentEventMetrics.eveiAnalysis.value;
    const currentCTHDuring = currentEventMetrics.cthAnalysis.during.cth;

    const cmnScoresPerAnalogue = []; // Scores for current event's proximity to CMN (per analogue)
    const rmdScoresPerAnalogue = []; // Scores for current event's proximity to RMD (per analogue)
    const combinedScoresForRV = [];  // Combined scores to measure dispersion for Reality Variable

    analogousEventsMetrics.forEach(analogue => {
        // Ensure analogues have critical and stable points defined
        if (!analogue.criticalPoint || !analogue.stableState) {
            console.warn(`Analogue '${analogue.name}' does not have 'criticalPoint' or 'stableState' defined. Skipping this analogue.`);
            return;
        }

        const analogueCriticalEVEI = analogue.criticalPoint.evei;
        const analogueCriticalCTH = analogue.criticalPoint.cth;
        const analogueStableEVEI = analogue.stableState.evei;
        const analogueStableCTH = analogue.stableState.cth;

        // --- CALCULATION OF CMN & RMD FOR THE CURRENT EVENT, BASED ON ANALOGUES ---
        // Here, we interpret CMN/RMD as a "proximity" or "distance" of the current event
        // to the observed thresholds/states of the analogous events.
        // A value CLOSER TO ZERO implies better fulfillment/closer proximity.

        // CMN Score: How close the current event's EVEI/CTH are to the analogue's "radical change point"
        // Using Manhattan distance (sum of absolute differences) as a simple proximity metric.
        // A LOWER score here means the current event is 'closer' to its CMN, according to this analogue.
        const cmnScore = Math.abs(currentEVEI - analogueCriticalEVEI) + Math.abs(currentCTHDuring - analogueCriticalCTH);
        cmnScoresPerAnalogue.push(cmnScore);

        // RMD Score: How close the current event's EVEI/CTH are to the analogue's "stable/desired state"
        // A LOWER score here means the current event is 'closer' to its RMD, according to this analogue.
        const rmdScore = Math.abs(currentEVEI - analogueStableEVEI) + Math.abs(currentCTHDuring - analogueStableCTH);
        rmdScoresPerAnalogue.push(rmdScore);

        // Combined score for Reality Variable: sum of CMN and RMD scores for each analogue comparison.
        // The dispersion of these combined scores will indicate the Reality Variable.
        const combinedScoreForRV = cmnScore + rmdScore;
        combinedScoresForRV.push(combinedScoreForRV);
    });

    if (cmnScoresPerAnalogue.length === 0) {
        throw new Error("No valid analogous events with critical/stable points defined for calculation.");
    }

    // --- CONSOLIDATION OF CMN, RMD, and REALITY VARIABLE CALCULATION ---

    // Consolidate CMN and RMD (using the average as a "central tendency")
    // A lower average CMN/RMD implies the current event is, on average, closer to
    // the change/stable thresholds observed in the analogues.
    const consolidatedCMN = cmnScoresPerAnalogue.reduce((sum, val) => sum + val, 0) / cmnScoresPerAnalogue.length;
    const consolidatedRMD = rmdScoresPerAnalogue.reduce((sum, val) => sum + val, 0) / rmdScoresPerAnalogue.length;

    // Reality Variable (RV): Based on the dispersion (variance/standard deviation) of the combined scores.
    // Higher dispersion implies analogous events provide widely differing signals about the current event's CMN/RMD,
    // indicating higher uncertainty (high Reality Variable).
    const meanCombinedScoreForRV = combinedScoresForRV.reduce((sum, val) => sum + val, 0) / combinedScoresForRV.length;
    const varianceForRV = combinedScoresForRV.reduce((sum, val) => sum + Math.pow(val - meanCombinedScoreForRV, 2), 0) / combinedScoresForRV.length;
    const realityVariable = Math.sqrt(varianceForRV); // Standard deviation

    return {
        eventName: currentEventMetrics.name,
        // Consolidated CMN: A LOWER value indicates the current event is, on average,
        // closer to the radical change thresholds of the analogous events.
        consolidatedCMN: consolidatedCMN,
        // Consolidated RMD: A LOWER value indicates the current event is, on average,
        // closer to the stable/optimal states of the analogous events.
        consolidatedRMD: consolidatedRMD, // Corrected this assignment
        // Reality Variable: A HIGHER value indicates greater uncertainty
        // in the event's trajectory due to the diversity of the analogues' signals.
        realityVariable: realityVariable
    };
}

module.exports = {
    calculateCMNRMD
};