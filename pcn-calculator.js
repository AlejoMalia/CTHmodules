// pcn-calculator.js 
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} EventMetrics - Defines the structure of an event's metrics relevant for PCN.
 * @property {number} PPI - Potential Impact Projection [0, 1]
 * @property {number} IEC - Contextual Stability Index [0, 1]
 * @property {number} VVC - Contextual Variation Valence [0, 1]
 */

// Weights for the Disruptive Potential Indicator (IPD)
const IPD_WEIGHTS = {
    w_ppi: 0.50,
    w_iec: 0.25,
    w_vvc: 0.25
};

// Maximum possible IPD value for normalization (assuming all metrics are 1)
// IPD_max = w_ppi * 1 + w_iec * |1 - 0.5| + w_vvc * 1
// IPD_max = 0.5 * 1 + 0.25 * 0.5 + 0.25 * 1
// IPD_max = 0.5 + 0.125 + 0.25 = 0.875
const IPD_MAX_POSSIBLE = 0.875;

/**
 * Calculates the Disruptive Potential Indicator (IPD) for an event.
 * IPD = w_ppi * PPI + w_iec * |IEC - 0.5| + w_vvc * VVC
 * @param {EventMetrics} metrics - The event's metrics.
 * @returns {number} The calculated IPD value.
 */
function calculateIPD(metrics) {
    const { PPI, IEC, VVC } = metrics;
    const { w_ppi, w_iec, w_vvc } = IPD_WEIGHTS;

    // Calculate |IEC - 0.5|
    const iec_deviation = Math.abs(IEC - 0.5);

    // Calculate IPD
    const IPD = (w_ppi * PPI) + (w_iec * iec_deviation) + (w_vvc * VVC);

    return IPD;
}

/**
 * Calculates the Percentage of Black Swans (PCN) for an event.
 * Uses Method B: PCN = (IPD_actual / IPD_maximum_possible) * 100
 * @param {EventMetrics} metrics - The event's metrics.
 * @returns {object} Object containing PCN value and its interpretation.
 */
function calculatePCN(metrics) {
    const ipd = calculateIPD(metrics);

    // Ensure IPD does not exceed max possible, though it shouldn't if inputs are [0,1]
    const pcn = (ipd / IPD_MAX_POSSIBLE) * 100;

    let interpretation = `Event (PPI=${metrics.PPI.toFixed(1)}, IEC=${metrics.IEC.toFixed(1)}, VVC=${metrics.VVC.toFixed(1)}): `;
    interpretation += `Calculated IPD = ${ipd.toFixed(3)}. `;
    interpretation += `Percentage of Black Swans (PCN): ${pcn.toFixed(0)}%. `;

    if (pcn >= 80) {
        interpretation += "Interpretation: **Extremely high estimated risk of a Black Swan event.** The combination of high impact potential with highly unstable/stable and rapidly changing contexts creates a fertile ground for unforeseen and highly disruptive outcomes.";
    } else if (pcn >= 60) {
        interpretation += "Interpretation: **Very high estimated risk of a Black Swan event.** The context exhibits significant vulnerability to unpredictable, high-impact events.";
    } else if (pcn >= 40) {
        interpretation += "Interpretation: **Moderate to high estimated risk of a Black Swan event.** While not extreme, the conditions suggest a notable potential for unexpected and disruptive developments.";
    } else if (pcn >= 20) {
        interpretation += "Interpretation: **Low to moderate estimated risk of a Black Swan event.** The current context is relatively less prone to highly unpredictable and disruptive outcomes.";
    } else if (pcn > 0) {
        interpretation += "Interpretation: **Very low estimated risk of a Black Swan event.** The context generally aligns with predictable patterns, reducing the likelihood of major unforeseen disruptions.";
    } else {
        interpretation += "Interpretation: **No estimated risk of a Black Swan event** (PCN is 0). This suggests a highly predictable context based on current metrics.";
    }

    return {
        PCN: pcn,
        IPD: ipd,
        interpretation: interpretation
    };
}

module.exports = {
    calculateIPD,
    calculatePCN,
    IPD_WEIGHTS,
    IPD_MAX_POSSIBLE
};