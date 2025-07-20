// constructor-blackswan-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} ConstructorAttributes
 * @property {number} EVEI - Emotional Valence Integrated value.
 * @property {number} CTH - Contextual Thematic Coherence value.
 * @property {number} [FE_scale] - Impact scale for Eventual Factor (FE).
 * @property {number} [FH_leadership] - Leadership/radicalism for Human Factor (FH).
 * @property {number[]} [correlations] - Array of correlation values with other constructors.
 * @property {number} phaseCTH - CTH of the current phase.
 * @property {boolean} isPhaseCritical - Indicates if the phase is considered critical (e.g., CTH > 0.4).
 */

/**
 * @typedef {object} ConstructorData
 * @property {string} name - Name of the Constructor (e.g., "Toma de la Bastilla").
 * @property {string} type - Type of constructor ("FH" for Human Factor, "FE" for Eventual Factor).
 * @property {number} EVEI - Emotional Valence Integrated value.
 * @property {number} CTH - Contextual Thematic Coherence value.
 * @property {number} [FE_attributes] - Specific attribute for FE (e.g., scale).
 * @property {number} [FH_attributes] - Specific attribute for FH (e.g., leadership).
 * @property {number[]} relatedCorrelations - Array of correlation values with other relevant constructors.
 * @property {boolean} isAnomalousCorrelation - True if any related correlation is anomalous (e.g., >0.8 or <0.3).
 */


/**
 * Determines if a given Constructor is a Black Swan based on defined criteria.
 *
 * Criteria proposed: (EVEI > 0.9) AND (CTH > 0.8) AND (FH/FE_attributes > 0.8) AND (Correlacion_anomala OR Fase_critica)
 *
 * @param {ConstructorData} constructor - The constructor object to evaluate.
 * @param {number} phaseCTH - The CTH value of the current phase.
 * @returns {boolean} True if the constructor is classified as a Black Swan, false otherwise.
 */
function isBlackSwanConstructor(constructor, phaseCTH) {
    const { EVEI, CTH, type, FE_attributes, FH_attributes, relatedCorrelations, isAnomalousCorrelation } = constructor;

    const EVEI_high = EVEI > 0.9;
    const CTH_high = CTH > 0.8;

    let attributes_disruptive = false;
    if (type === "FE" && FE_attributes !== undefined) {
        attributes_disruptive = FE_attributes > 0.8;
    } else if (type === "FH" && FH_attributes !== undefined) {
        attributes_disruptive = FH_attributes > 0.8;
    } else {
        // If attributes are not defined for the given type, we might need a default or error.
        // For simplicity, let's assume if they aren't provided, this part of the criterion fails.
        attributes_disruptive = false;
    }

    // A critical phase is defined by CTH > 0.4 based on your description (e.g., Durante CTH = 0.417)
    const is_phase_critical = phaseCTH > 0.4;

    // Check for anomalous correlations: either high (>0.8) or low (<0.3)
    // This `isAnomalousCorrelation` should ideally be pre-calculated based on a full correlation matrix,
    // but for this function, it's an explicit input to simplify.
    const has_anomalous_correlation = isAnomalousCorrelation;

    // Main Black Swan criterion
    return EVEI_high && CTH_high && attributes_disruptive && (has_anomalous_correlation || is_phase_critical);
}

/**
 * Calculates the variability of correlations (V_corr) for a given set of correlation values.
 * This is a simplified standard deviation calculation.
 *
 * @param {number[]} correlations - An array of correlation values.
 * @returns {number} The standard deviation of the correlations.
 */
function calculateCorrelationVariability(correlations) {
    if (!correlations || correlations.length < 2) {
        return 0; // Not enough data to calculate variability
    }
    const mean = correlations.reduce((sum, val) => sum + val, 0) / correlations.length;
    const squaredDifferences = correlations.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / (correlations.length - 1);
    return Math.sqrt(variance);
}


/**
 * Calculates the influence factor of a Black Swan (I_cisne).
 * I_cisne = w_f * F_CTH + w_v * V_corr + w_c * C_cisne
 *
 * @param {number} F_CTH - The CTH factor of the phase (could be the phase's CTH or derived).
 * @param {number} V_corr - The variability (standard deviation) of relevant correlations for the Black Swan.
 * @param {number} C_cisne - Binary indicator (1 if a Black Swan is present, 0 otherwise).
 * @param {object} [weights] - Optional weights {w_f, w_v, w_c}. Defaults to {0.5, 0.3, 0.2}.
 * @returns {number} The calculated Black Swan influence (I_cisne).
 */
function calculateBlackSwanInfluence(F_CTH, V_corr, C_cisne, weights = { w_f: 0.5, w_v: 0.3, w_c: 0.2 }) {
    return (weights.w_f * F_CTH) + (weights.w_v * V_corr) + (weights.w_c * C_cisne);
}

/**
 * Modifies the predictive formula (P_fase) to incorporate Black Swan influence.
 * P_fase = FP_fase + alpha * I_cisne + beta * S_antifragil
 *
 * @param {number} FP_fase - Potential Factors for the phase.
 * @param {number} I_cisne - Black Swan influence factor.
 * @param {number} S_antifragil - Antifragility score (assumed to be calculated elsewhere).
 * @param {number} [alpha=0.2] - Weight for I_cisne.
 * @param {number} [beta=0.1] - Weight for S_antifragil.
 * @returns {number} The adjusted phase prediction (P_fase).
 */
function predictPhasePotential(FP_fase, I_cisne, S_antifragil, alpha = 0.2, beta = 0.1) {
    return FP_fase + (alpha * I_cisne) + (beta * S_antifragil);
}


module.exports = {
    isBlackSwanConstructor,
    calculateCorrelationVariability,
    calculateBlackSwanInfluence,
    predictPhasePotential
};