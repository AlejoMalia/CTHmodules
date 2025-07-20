// pee-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @typedef {object} Constructor - Represents a Human Factor (FH) or Eventual Factor (FE).
 * @property {string} name - Name of the constructor.
 * @property {string} type - "FH" or "FE".
 * @property {number} EVEI - Emotional Valence Integrated value.
 * @property {number} CTH - Contextual Thematic Coherence value.
 * @property {object} [attributes] - Optional specific attributes.
 * @property {number[]} [correlations] - Optional array of correlation values.
 */

/**
 * @typedef {object} PhaseData - Represents a temporal phase within an event.
 * @property {string} name - Name of the phase (e.g., "Before", "Prelude", "During").
 * @property {string} period - Time period description.
 * @property {number} phaseCTH - Contextual Thematic Coherence of the phase.
 * @property {Constructor[]} activeConstructors - Array of constructors active in this phase.
 * @property {string[]} [keyEvents] - Optional array of key events description for this phase.
 * @property {number} [FP_EVEI] - Calculated FP_EVEI for the phase.
 * @property {number} [FP_CTH] - Calculated FP_CTH for the phase.
 * @property {number} [macromargo] - Macromargo value if applicable.
 * @property {number} [micromargo] - Micromargo value if applicable.
 */

/**
 * @typedef {object} TriphasicField - Structure for the Triphasic analysis field.
 * @property {string} eventName - Name of the current event being analyzed.
 * @property {PhaseData} distantPrecursor - Data for the 'Distant Precursor' perspective.
 * @property {PhaseData} nearPrecursor - Data for the 'Near Precursor' perspective.
 * @property {PhaseData} currentState - Data for the 'Current State' perspective.
 */

/**
 * @typedef {object} PentaphasicField - Structure for the Pentaphasic analysis field.
 * @property {string} eventName - Name of the historical event being analyzed.
 * @property {PhaseData} before - Data for the 'Before' phase.
 * @property {PhaseData} prelude - Data for the 'Prelude' phase.
 * @property {PhaseData} during - Data for the 'During' phase.
 * @property {PhaseData} transition - Data for the 'Transition' phase.
 * @property {PhaseData} after - Data for the 'After' phase.
 */

/**
 * @typedef {object} PredictiveFactors - Key metrics used for PEE projection.
 * @property {number} currentCTH - Current Contextual Thematic Coherence of the event/context.
 * @property {number} deltaCTH - Change in CTH (CTH_current - CTH_previous).
 * @property {number} IPD - Index of Disruption Potential.
 * @property {number} VRS - Systemic Resilience Vector.
 * @property {number} actMagnitudeDegree - Degree of Magnitude of the Act (from precursory or current event).
 * @property {Constructor[]} activeConstructors - Constructors active in the current state/phase.
 * @property {object[]} [historicalAnalogues] - Simplified representation of historical patterns for comparison.
 * Each analogue could have properties like `pattern_CTH_delta`, `pattern_IPD_effect`, `pattern_probability`.
 * @property {string[]} [activeRTIs] - Active long-range Routes of Influence.
 */

/**
 * @typedef {object} ProjectedPhase - Represents a future projected phase.
 * @property {string} name - Name of the projected phase (e.g., "Prelude", "During").
 * @property {string} [projectedPeriod] - Estimated time frame for this phase.
 * @property {number} projectedCTH - Projected Contextual Thematic Coherence.
 * @property {number} projectedEVEI - Projected Emotional Valence Integrated.
 * @property {string[]} [keyDevelopments] - Key events or trends expected in this phase.
 */

/**
 * @typedef {object} EventTrajectory - A single possible future trajectory.
 * @property {string} id - Unique identifier for the trajectory.
 * @property {string} description - A brief description of this trajectory.
 * @property {number} estimatedProbability - Probability of this trajectory manifesting (0-1).
 * @property {number} requiredMagnitude - Importance (EVEI/FP/Magnitude) needed to push towards this trajectory.
 * @property {ProjectedPhase[]} projectedPhases - Sequence of projected future phases.
 * @property {string[]} influencedByAnalogues - List of historical analogues influencing this trajectory.
 */

/**
 * Projects a spectrum of possible future trajectories (PEE) for an event.
 *
 * The projection depends on the perceived current phase of the event:
 * - If 'Before', projects Prelude, During, Transition, After.
 * - If 'Prelude', projects During, Transition, After.
 * - If 'During', projects Transition, After.
 *
 * This is a simplified heuristic model for demonstration.
 * Real PEE would involve complex statistical models and large datasets.
 *
 * @param {'Before'|'Prelude'|'During'} currentPerceivedPhase - The current perceived phase of the event.
 * @param {PredictiveFactors} predictiveFactors - Key metrics and contextual data for projection.
 * @returns {EventTrajectory[]} An array representing the spectrum of possible trajectories.
 */
function projectEventualSpectrum(currentPerceivedPhase, predictiveFactors) {
    const trajectories = [];
    const {
        currentCTH,
        deltaCTH,
        IPD,
        VRS,
        actMagnitudeDegree,
        activeConstructors,
        historicalAnalogues = [],
        activeRTIs = []
    } = predictiveFactors;

    // --- Heuristic for trajectory generation (simplified) ---
    // We'll generate a few hypothetical trajectories based on the input factors.
    // The probabilities and magnitudes are illustrative.

    // Base projection for CTH and EVEI, influenced by current state and disruption potential
    const baseProjectedCTH = currentCTH + (deltaCTH * IPD) - (VRS * 0.1);
    const baseProjectedEVEI = activeConstructors.reduce((sum, c) => sum + c.EVEI, 0) / activeConstructors.length + (actMagnitudeDegree * IPD);

    // Filter historical analogues to find potentially relevant patterns
    const relevantAnalogues = historicalAnalogues.filter(ana => {
        // Simple heuristic: analogue is relevant if its IPD effect is somewhat aligned
        // or its pattern_CTH_delta is in the same direction as current deltaCTH
        return (ana.pattern_IPD_effect || 0) * IPD > 0 || (ana.pattern_CTH_delta || 0) * deltaCTH > 0;
    });

    // --- Trajectory 1: "Continuation of Current Trend" ---
    // Assumes current dynamics persist, modulated by resilience and disruption.
    const trajectory1Phases = [];
    let currentProjectionCTH = baseProjectedCTH;
    let currentProjectionEVEI = baseProjectedEVEI;

    const futurePhasesSequence = ['Prelude', 'During', 'Transition', 'After'];
    let startIndex = 0;
    if (currentPerceivedPhase === 'Prelude') startIndex = 1;
    if (currentPerceivedPhase === 'During') startIndex = 2;

    for (let i = startIndex; i < futurePhasesSequence.length; i++) {
        const phaseName = futurePhasesSequence[i];
        currentProjectionCTH = Math.max(0, Math.min(1, currentProjectionCTH * (1 + (IPD * 0.1) - (VRS * 0.05)))); // Modulate CTH
        currentProjectionEVEI = Math.max(-1, Math.min(1, currentProjectionEVEI * (1 + (actMagnitudeDegree * 0.05) - (VRS * 0.02)))); // Modulate EVEI
        trajectory1Phases.push({
            name: phaseName,
            projectedCTH: currentProjectionCTH,
            projectedEVEI: currentProjectionEVEI,
            keyDevelopments: [`Continued trend in ${phaseName}`]
        });
    }

    trajectories.push({
        id: 'T1',
        description: 'Continuation of current dynamics, moderate change.',
        estimatedProbability: Math.max(0.1, 0.5 + (IPD * 0.1) - (VRS * 0.1) + (deltaCTH * 0.05)), // Heuristic probability
        requiredMagnitude: Math.abs(currentProjectionEVEI),
        projectedPhases: trajectory1Phases,
        influencedByAnalogues: relevantAnalogues.map(ana => ana.name || 'Unnamed Analogue')
    });

    // --- Trajectory 2: "Disruptive / High Impact Scenario" ---
    // Higher IPD effect, lower VRS effect.
    if (IPD > 0.5) { // Only if disruption potential is high
        const trajectory2Phases = [];
        let disruptiveProjectionCTH = baseProjectedCTH * (1 + IPD * 0.5); // More volatile CTH
        let disruptiveProjectionEVEI = baseProjectedEVEI * (1 + actMagnitudeDegree * 0.5); // More extreme EVEI

        for (let i = startIndex; i < futurePhasesSequence.length; i++) {
            const phaseName = futurePhasesSequence[i];
            disruptiveProjectionCTH = Math.max(0, Math.min(1, disruptiveProjectionCTH * (1 + IPD * 0.2 - VRS * 0.01)));
            disruptiveProjectionEVEI = Math.max(-1, Math.min(1, disruptiveProjectionEVEI * (1 + actMagnitudeDegree * 0.1 - VRS * 0.01)));
            trajectory2Phases.push({
                name: phaseName,
                projectedCTH: disruptiveProjectionCTH,
                projectedEVEI: disruptiveProjectionEVEI,
                keyDevelopments: [`Disruptive change in ${phaseName}`]
            });
        }
        trajectories.push({
            id: 'T2',
            description: 'Significant disruption leading to high impact.',
            estimatedProbability: Math.max(0.05, (IPD * 0.3) - (VRS * 0.05)), // Higher probability if IPD is high
            requiredMagnitude: Math.abs(disruptiveProjectionEVEI * 2), // Requires more magnitude
            projectedPhases: trajectory2Phases,
            influencedByAnalogues: relevantAnalogues.filter(ana => (ana.pattern_IPD_effect || 0) > 0.5).map(ana => ana.name || 'Unnamed Analogue')
        });
    }

    // --- Trajectory 3: "Stabilization / Low Impact Scenario" ---
    // Higher VRS effect, lower IPD effect.
    if (VRS > 0.5) { // Only if resilience is high
        const trajectory3Phases = [];
        let stableProjectionCTH = baseProjectedCTH * (1 - VRS * 0.3); // More stable CTH
        let stableProjectionEVEI = baseProjectedEVEI * (1 - VRS * 0.2); // More subdued EVEI

        for (let i = startIndex; i < futurePhasesSequence.length; i++) {
            const phaseName = futurePhasesSequence[i];
            stableProjectionCTH = Math.max(0, Math.min(1, stableProjectionCTH * (1 - VRS * 0.1 + IPD * 0.01)));
            stableProjectionEVEI = Math.max(-1, Math.min(1, stableProjectionEVEI * (1 - VRS * 0.05 + actMagnitudeDegree * 0.01)));
            trajectory3Phases.push({
                name: phaseName,
                projectedCTH: stableProjectionCTH,
                projectedEVEI: stableProjectionEVEI,
                keyDevelopments: [`Stabilization in ${phaseName}`]
            });
        }
        trajectories.push({
            id: 'T3',
            description: 'Trend towards stabilization and lower impact.',
            estimatedProbability: Math.max(0.05, (VRS * 0.3) - (IPD * 0.05)), // Higher probability if VRS is high
            requiredMagnitude: Math.abs(stableProjectionEVEI * 0.5), // Requires less magnitude
            projectedPhases: trajectory3Phases,
            influencedByAnalogues: relevantAnalogues.filter(ana => (ana.pattern_IPD_effect || 0) < 0.5).map(ana => ana.name || 'Unnamed Analogue')
        });
    }

    // Ensure probabilities sum to 1 (or are normalized, simplified here)
    const totalProb = trajectories.reduce((sum, t) => sum + t.estimatedProbability, 0);
    if (totalProb > 0) {
        trajectories.forEach(t => t.estimatedProbability /= totalProb);
    }

    return trajectories;
}

module.exports = {
    projectEventualSpectrum,
    // Exporting types for better documentation/autocompletion in consuming modules
    Constructor: {},
    PhaseData: {},
    TriphasicField: {},
    PentaphasicField: {},
    PredictiveFactors: {},
    ProjectedPhase: {},
    EventTrajectory: {}
};