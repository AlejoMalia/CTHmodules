// cmn-rmd-analysis.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * Categorizes an event as a Critical Mass Negation (CMN) or Regenerative Mass Dynamics (RMD) event
 * based on a comprehensive set of extended analysis results.
 *
 * CMN events are characterized by outcomes that lead to systemic decline, stagnation, or negative transformation.
 * RMD events are characterized by outcomes that lead to systemic growth, renewal, or positive transformation.
 *
 * The classification is determined by comparing weighted scores derived from various metrics.
 *
 * @param {object} extendedAnalysisResults - An object containing the output from `analyzeEventExtended`.
 * Expected metrics: evei, iec, ppi, vvc, mce, deltaCTH_Total, iig, uir, pts, rd, ppic.
 * @returns {object} An object containing the classification (CMN/RMD), probability, and associated characteristics.
 */
function analyzeCMNRMD(extendedAnalysisResults) {
    if (!extendedAnalysisResults || typeof extendedAnalysisResults !== 'object') {
        throw new Error("Missing or invalid extendedAnalysisResults for CMN/RMD analysis.");
    }

    // Extracting and validating all required metrics
    // Ensure all metrics are numbers. If any is missing or invalid, treat as 0 or throw error.
    const metrics = [
        'evei', 'iec', 'ppi', 'vvc', 'mce', 'deltaCTH_Total',
        'iig', 'uir', 'pts', 'rd', 'ppic'
    ];

    const validatedMetrics = {};
    for (const metric of metrics) {
        let value = extendedAnalysisResults[metric];
        if (typeof value !== 'number' || isNaN(value)) {
            // Log a warning for missing/invalid metrics, but proceed by coercing to 0
            // This allows the analysis to continue even if one metric is problematic,
            // but the results will reflect the missing data.
            console.warn(`CMN/RMD Analysis Warning: Missing or invalid metric '${metric}' in extendedAnalysisResults. Coercing to 0.`);
            value = 0;
        }
        validatedMetrics[metric] = parseFloat(value); // Ensure it's a float for calculations
    }

    const { evei, iec, ppi, vvc, mce, deltaCTH_Total, iig, uir, pts, rd, ppic } = validatedMetrics;

    // --- Define Weights for CMN and RMD contributions ---
    // These weights reflect the conceptual importance of each metric
    // in determining a CMN or RMD outcome. These are illustrative and
    // would ideally be calibrated with historical data.

    // Weights for CMN (Critical Mass Negation - negative outcomes)
    const cmnWeights = {
        evei: 0.2,   // High EVEI (Velocity/Impact) contributes to instability
        iec: -0.1,   // High IEC (Causality) reduces unpredictability, less CMN if event is controlled
        ppi: -0.3,   // High PPI (Predictability) suggests less chaotic/negative drift (less CMN)
        vvc: 0.3,    // High VVC (Volatility/Vulnerability) strongly points to CMN
        mce: -0.2,   // High MCE (overall positive CTH shift) reduces CMN
        deltaCTH_Total: 0.1, // Significant total CTH change can be negative if direction is down
        iig: 0.2,    // High IIG (Impact Intensity) points to significant disruption, often negative
        uir: 0.2,    // High UIR (Unexpected Instability) strongly points to CMN
        pts: -0.1,   // High PTS (Transformation Scale) might be RMD, so less CMN
        rd: -0.2,    // High RD (Resilience) reduces CMN risk
        ppic: -0.2,  // High PPIC (Post-Event Progress) reduces CMN
    };

    // Weights for RMD (Regenerative Mass Dynamics - positive outcomes)
    const rmdWeights = {
        evei: 0.1,   // EVEI can also contribute to positive transformation if managed
        iec: 0.2,    // High IEC (Causality) can be positive if cause is beneficial
        ppi: 0.3,    // High PPI (Predictability) is good for RMD
        vvc: -0.2,   // High VVC (Volatility) is bad for RMD
        mce: 0.3,    // High MCE (overall positive CTH shift) strongly points to RMD
        deltaCTH_Total: 0.15, // Significant total CTH change can be positive
        iig: -0.1,   // High IIG (Impact Intensity) can be negative if disruptive (less RMD)
        uir: -0.1,   // High UIR (Unexpected Instability) is bad for RMD
        pts: 0.25,   // High PTS (Transformation Scale) is good for RMD
        rd: 0.3,     // High RD (Resilience) strongly points to RMD
        ppic: 0.25,  // High PPIC (Post-Event Progress) strongly points to RMD
    };

    // --- Calculate CMN and RMD Scores ---
    let cmnScore = 0;
    let rmdScore = 0;

    for (const metric of metrics) {
        cmnScore += validatedMetrics[metric] * cmnWeights[metric];
        rmdScore += validatedMetrics[metric] * rmdWeights[metric];
    }

    // Normalize scores to be between 0 and 1 (or another meaningful range)
    // These normalization factors are illustrative.
    // They should be derived from expected maximum/minimum possible scores.
    const maxPossibleScore = 1.0; // Assuming max contribution of any metric is 1 * its weight
    const minPossibleScore = -1.0; // Assuming min contribution of any metric is 0 * its weight, or negative weight * 1
    // More accurate normalization might require knowing the true min/max aggregated scores
    // For now, let's just clamp and scale
    cmnScore = parseFloat(Math.max(0, Math.min(1, (cmnScore - minPossibleScore) / (maxPossibleScore - minPossibleScore))).toFixed(4));
    rmdScore = parseFloat(Math.max(0, Math.min(1, (rmdScore - minPossibleScore) / (maxPossibleScore - minPossibleScore))).toFixed(4));


    // --- Classification ---
    let classification;
    let mainPercentage;
    let complementaryPercentage;

    if (rmdScore > cmnScore) {
        classification = 'RMD';
        mainPercentage = rmdScore;
        complementaryPercentage = 1 - cmnScore; // Simple complement based on CMN score
    } else if (cmnScore > rmdScore) {
        classification = 'CMN';
        mainPercentage = cmnScore;
        complementaryPercentage = 1 - rmdScore; // Simple complement based on RMD score
    } else {
        classification = 'Neutral/Balanced';
        mainPercentage = cmnScore; // Or rmdScore, as they are equal
        complementaryPercentage = 1 - cmnScore;
    }

    // Ensure percentages are within 0-1 range
    mainPercentage = parseFloat(Math.max(0, Math.min(1, mainPercentage)).toFixed(4));
    complementaryPercentage = parseFloat(Math.max(0, Math.min(1, complementaryPercentage)).toFixed(4));

    // --- Associated Conditions / Characteristics ---
    // These are conceptual descriptions based on the metrics.
    // They would be refined based on the event's actual classification.
    const conditions = {
        cmn: '',
        rmd: ''
    };
    const timeframe = {
        cmn: 'Long-term decline, difficult recovery, potential stagnation or collapse.',
        rmd: 'Long-term growth, sustainable development, rapid recovery from setbacks.'
    };
    const historicalBasis = {
        cmn: 'Analogous to historical periods of social entropy, crises, or regressions.',
        rmd: 'Analogous to periods of renaissance, technological leaps, or social flourishing.'
    };
    const criticalEvents = {
        cmn: 'Cascading failures, unaddressed grievances, systemic shocks leading to breakdown.',
        rmd: 'Catalytic innovations, adaptive reforms, collective problem-solving initiatives.'
    };
    const systemState = {
        cmn: 'Fragile, rigid, high internal friction, prone to collapse, increasing entropy.',
        rmd: 'Flexible, adaptive, low internal friction, resilient, decreasing entropy.'
    };
    const keyPoints = {
        cmn: 'High volatility (VVC), low predictability (PPI), significant negative overall CTH shift (MCE).',
        rmd: 'High predictability (PPI), strong resilience (RD), significant positive overall CTH shift (MCE), high potential transformation (PTS).'
    };
    const consequences = {
        cmn: 'Societal disintegration, economic depression, loss of institutional trust, increased conflict.',
        rmd: 'Enhanced societal cohesion, economic prosperity, strengthened institutions, reduced conflict potential.'
    };


    if (classification === 'CMN') {
        conditions.cmn = 'High volatility, low predictability, significant negative socio-historical shift. Uncontrolled event dynamics.';
        conditions.rmd = 'Weak resilience, limited capacity for positive transformation.';
    } else if (classification === 'RMD') {
        conditions.cmn = 'Low volatility, high predictability, strong capacity for positive socio-historical shift.';
        conditions.rmd = 'High resilience, adaptive capacity, beneficial event dynamics.';
    } else { // Neutral/Balanced
        conditions.cmn = 'Mixed signals, balanced forces of disruption and regeneration.';
        conditions.rmd = 'Mixed signals, balanced forces of disruption and regeneration.';
    }


    return {
        classification: classification,
        probability: {
            mainPercentage: mainPercentage,
            complementaryPercentage: complementaryPercentage,
        },
        associatedConditions: conditions,
        timeframe: timeframe,
        historicalBasis: historicalBasis,
        criticalEvents: criticalEvents,
        systemState: systemState,
        keyPoints: keyPoints,
        consequences: consequences,
    };
}

module.exports = {
    analyzeCMNRMD,
};