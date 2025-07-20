// pantemporal-elements-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} PhaseValue
 * @property {string} name - Name of the phase (e.g., "Antes", "Preludio", "Durante").
 * @property {number} value - The quantified value of the variable for this phase, typically normalized [0, 1].
 */

/**
 * Calculates the standard deviation for a set of three values.
 *
 * @param {number} valAntes - The value of the variable in the 'Antes' phase.
 * @param {number} valPreludio - The value of the variable in the 'Preludio' phase.
 * @param {number} valDurante - The value of the variable in the 'Durante' phase.
 * @returns {number} The standard deviation.
 */
function calculateStandardDeviation(valAntes, valPreludio, valDurante) {
    const values = [valAntes, valPreludio, valDurante];
    const mean = (valAntes + valPreludio + valDurante) / 3;
    const sumOfSquaredDifferences = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return Math.sqrt(sumOfSquaredDifferences / 3);
}

/**
 * Calculates the Pantemporality Index (IP) for a variable across three phases.
 * IP = 1 - σ(X)
 * Where X = {X_Antes, X_Preludio, X_Durante}
 *
 * @param {number} valAntes - The value of the variable in the 'Antes' phase.
 * @param {number} valPreludio - The value of the variable in the 'Preludio' phase.
 * @param {number} valDurante - The value of the variable in the 'Durante' phase.
 * @returns {number} The Pantemporality Index (IP).
 */
function calculatePantemporalityIndex(valAntes, valPreludio, valDurante) {
    if (typeof valAntes !== 'number' || typeof valPreludio !== 'number' || typeof valDurante !== 'number') {
        throw new Error("All phase values must be numbers for Pantemporality Index calculation.");
    }
    // Ensure values are within a reasonable normalized range if they were intended to be [0,1]
    // This is a soft check, actual normalization should happen at data collection.
    if (valAntes < 0 || valAntes > 1 || valPreludio < 0 || valPreludio > 1 || valDurante < 0 || valDurante > 1) {
        console.warn("Pantemporality Index calculation received values outside the typical [0, 1] normalized range. Results might be less interpretable if not normalized.");
    }

    const sigmaX = calculateStandardDeviation(valAntes, valPreludio, valDurante);
    return 1 - sigmaX;
}

/**
 * Determines if a variable is a Pantemporal Element based on its Pantemporality Index (IP).
 * A variable is considered pantemporal if IP >= IP_min.
 *
 * @param {number} valAntes - The value of the variable in the 'Antes' phase.
 * @param {number} valPreludio - The value of the variable in the 'Preludio' phase.
 * @param {number} valDurante - The value of the variable in the 'Durante' phase.
 * @param {number} [ipMin=0.9] - The minimum IP threshold for a variable to be considered pantemporal.
 * @returns {{isPantemporal: boolean, IP: number, sigmaX: number, meanX: number}} An object indicating if it's pantemporal, its IP, standard deviation, and mean.
 */
function identifyPantemporalElement(valAntes, valPreludio, valDurante, ipMin = 0.9) {
    const IP = calculatePantemporalityIndex(valAntes, valPreludio, valDurante);
    const sigmaX = calculateStandardDeviation(valAntes, valPreludio, valDurante);
    const meanX = (valAntes + valPreludio + valDurante) / 3;

    return {
        isPantemporal: IP >= ipMin,
        IP: IP,
        sigmaX: sigmaX,
        meanX: meanX,
        threshold: ipMin // Include threshold for clarity in output
    };
}

module.exports = {
    calculatePantemporalityIndex,
    identifyPantemporalElement,
    // Exporting types for documentation
    PhaseValue: {}
};