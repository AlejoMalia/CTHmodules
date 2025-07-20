// temporal-analysis-fields-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import all necessary calculator modules
// Make sure these paths are correct relative to this file.
const eveiCalculator = require('./evei-calculator.js');
const cthAnalysisModule = require('./cth-analysis-module.js');
const eveiCthExtendedAnalysis = require('./evei-cth-extended-analysis.js');
const eventConstructor = require('./constructor.js'); // Assumed to handle raw event data structuring
const cmnRmdCalculator = require('./cmn-rmd-calculator.js');
const marginsCalculator = require('./margins-calculator.js');
const pcnCalculator = require('./pcn-calculator.js'); // Assuming you want PCN here as well

/**
 * @typedef {object} Constructor - Represents a Human Factor (FH) or Eventual Factor (FE).
 * @property {string} name - Name of the constructor (e.g., "Louis XVI", "Storming of the Bastille").
 * @property {string} type - "FH" or "FE".
 * @property {number} EVEI - Emotional Valence Integrated value.
 * @property {number} CTH - Contextual Thematic Coherence value.
 * @property {object} [attributes] - Optional specific attributes (e.g., { leadership: 0.8 } for FH, { scale: 0.9 } for FE).
 * @property {number[]} [correlations] - Optional array of correlation values with other constructors.
 */

/**
 * @typedef {object} RawEventData - Raw input data for an event before processing. This is what you'd feed into an analysis.
 * @property {string} id - Unique identifier for the event (e.g., "BastilleFall_1789").
 * @property {string} name - Display name of the event.
 * @property {string} date - ISO date string of the event (e.g., "1789-07-14").
 * @property {object} rawMetrics - Other raw data points required by sub-calculators (e.g., { politicalInstability: 0.7, socialTension: 0.8 }).
 */

/**
 * @typedef {object} AnalyzedEvent - Structure for a single event after full analysis by timesequence-analysiscalculator logic.
 * @property {string} id
 * @property {string} name
 * @property {string} date
 * @property {number} EVEI
 * @property {number} CTH
 * @property {number} [deltaCTH] - Calculated based on sequence (can be null for first event).
 * @property {object} [extendedEVEICTHAnalysis] - Results from evei-cth-extended-analysis.
 * @property {object} [cmnRmdResults]
 * @property {object} [marginResults]
 * @property {object} [pcnResults] - Results from pcn-calculator.js
 * // ... other computed metrics
 */

/**
 * @typedef {object} PhaseData - Represents a temporal phase within an event or field analysis.
 * @property {string} name - Name of the phase (e.g., "BEFORE", "PRELUDE", "DURING").
 * @property {string} period - Time period description (e.g., "1787 - June 1789").
 * @property {number} phaseCTH - Contextual Thematic Coherence of the phase.
 * @property {Constructor[]} activeConstructors - Array of constructors active in this phase.
 * @property {string[]} [keyEvents] - Optional array of key events description for this phase.
 * @property {number} [FP_EVEI] - Calculated FP_EVEI for the phase.
 * @property {number} [FP_CTH] - Calculated FP_CTH for the phase.
 * @property {number} [macromargo] - Macromargo value if applicable.
 * @property {number} [micromargo] - Micromargo value if applicable.
 * @property {RawEventData[]} [rawEventsInPhase] - Raw events specifically contributing to this phase.
 * @property {AnalyzedEvent[]} [analyzedEventSequence] - The detailed analysis of events within this phase.
 */

/**
 * @typedef {object} EventDataSet - A comprehensive dataset for an event, usually historical.
 * @property {string} eventName - The main name of the historical event.
 * @property {PhaseData[]} phases - Array of PhaseData for all phases.
 * @property {object} [overallMetrics] - Optional overall event metrics (e.g., total DeltaCTH).
 * @property {AnalyzedEvent[]} [fullAnalyzedSequence] - The entire sequence of events analyzed from start to finish.
 */

/**
 * @typedef {object} TriphasicField - Structure for the Triphasic analysis field.
 * @property {string} eventName - Name of the current event being analyzed.
 * @property {PhaseData} distantPrecursor - Data for the 'Distant Precursor' perspective, potentially including its analyzed event sequence.
 * @property {PhaseData} nearPrecursor - Data for the 'Near Precursor' perspective, potentially including its analyzed event sequence.
 * @property {PhaseData} currentState - Data for the 'Current State' perspective, potentially including its analyzed event sequence.
 * @property {string} description - General description of the Triphasic Field.
 */

/**
 * @typedef {object} PentaphasicField - Structure for the Pentaphasic analysis field.
 * @property {string} eventName - Name of the historical event being analyzed.
 * @property {PhaseData} antes - Data for the 'Antes' phase, potentially including its analyzed event sequence.
 * @property {PhaseData} preludio - Data for the 'Preludio' phase, potentially including its analyzed event sequence.
 * @property {PhaseData} durante - Data for the 'Durante' phase, potentially including its analyzed event sequence.
 * @property {PhaseData} transicion - Data for the 'Transicion' phase, potentially including its analyzed event sequence.
 * @property {PhaseData} despues - Data for the 'Despues' phase, potentially including its analyzed event sequence.
 * @property {string} description - General description of the Pentaphasic Field.
 * @property {AnalyzedEvent[]} [fullAnalyzedSequence] - The entire sequence of events analyzed for this historical event.
 */

/**
 * @typedef {object} SupraphasicField - Structure for the Supraphasic analysis field.
 * @property {string} originatingEventName - Name of the historical event whose long-term influence is being tracked.
 * @property {string} description - General description of the Supraphasic Field.
 * @property {string[]} identifiedRTIs - Array of descriptions of long-term Routes of Influence (RTIs).
 * @property {object[]} influencedEvents - Array of objects describing events/developments influenced (e.g., { name: "Napoleonic Wars", period: "1803-1815" }).
 * @property {string[]} [influencedConcepts] - Optional array of concepts influenced (e.g., "nationalism", "liberalism").
 */

// --- Centralized Sequence Analysis Logic (from timesequence-analysiscalculator.js) ---

/**
 * Analyzes a sequence of events to provide a comprehensive breakdown of metrics.
 * This function is now internal to temporal-analysis-fields-calculator.js or called by its public functions.
 * @param {RawEventData[]} rawEventSequence - An ordered array of raw event data.
 * @returns {AnalyzedEvent[]} An array of fully analyzed events.
 */
function _analyzeEventSequenceInternal(rawEventSequence) {
    if (!rawEventSequence || rawEventSequence.length < 1) {
        return [];
    }

    const analyzedSequence = [];
    let previousEventMetrics = null;

    for (let i = 0; i < rawEventSequence.length; i++) {
        const rawEvent = rawEventSequence[i];

        // 1. Standardize event data (if constructor.js is for this purpose)
        // Assumes eventConstructor.constructEventObject creates a basic structured event.
        const eventData = eventConstructor.constructEventObject(rawEvent);

        // 2. Calculate core metrics (EVEI, CTH).
        // These calls assume the specific calculation functions are available in their respective modules.
        const evei = eveiCalculator.calculateEVEI(eventData);
        const cth = cthAnalysisModule.calculateCTH(eventData);

        // Initialize current event's metrics
        const currentEventMetrics = {
            id: eventData.id,
            name: eventData.name, // Added for better readability
            date: eventData.date,
            EVEI: evei,
            CTH: cth,
            deltaCTH: null,
            extendedEVEICTHAnalysis: null,
            cmnRmdResults: null,
            marginResults: null,
            pcnResults: null, // New field for PCN
            // ... potentially other raw/processed data from eventData
        };

        // 3. Calculate Delta CTH (requires a previous event)
        if (previousEventMetrics) {
            currentEventMetrics.deltaCTH = cthAnalysisModule.calculateDeltaCTH(cth, previousEventMetrics.CTH);
        }

        // 4. Perform Extended EVEI-CTH Analysis
        currentEventMetrics.extendedEVEICTHAnalysis = eveiCthExtendedAnalysis.analyzeEVEICTH({ EVEI: evei, CTH: cth });

        // 5. Calculate CMN and RMD (might depend on context of previous events)
        // Assuming CMN/RMD needs current and optionally previous event metrics
        currentEventMetrics.cmnRmdResults = cmnRmdCalculator.calculateCMNRMD(currentEventMetrics, previousEventMetrics);

        // 6. Calculate Margins
        // Assuming calculateMargin takes current event metrics
        currentEventMetrics.marginResults = marginsCalculator.calculateMargin(currentEventMetrics);

        // 7. Calculate PCN (Percentage of Black Swans)
        // Assumes pcnCalculator.calculatePCN takes { PPI, IEC, VVC }
        // You'll need to map 'rawMetrics' from rawEventData to these PCN inputs.
        // For demonstration, let's assume rawMetrics directly contains these.
        if (rawEvent.rawMetrics && typeof pcnCalculator.calculatePCN === 'function') {
            currentEventMetrics.pcnResults = pcnCalculator.calculatePCN({
                PPI: rawEvent.rawMetrics.PPI, // Assumed to be in rawMetrics
                IEC: rawEvent.rawMetrics.IEC, // Assumed to be in rawMetrics
                VVC: rawEvent.rawMetrics.VVC  // Assumed to be in rawMetrics
            });
        }


        analyzedSequence.push(currentEventMetrics);
        previousEventMetrics = currentEventMetrics; // Set current as previous for next iteration
    }

    return analyzedSequence;
}

// --- Field Assembly Functions (Modified to leverage sequence analysis) ---

/**
 * Assembles the data for a Triphasic Field analysis of a current event,
 * now including detailed temporal sequence analysis for each phase.
 *
 * @param {string} eventName - The name of the current event.
 * @param {PhaseData} distantPrecursorData - Data for the 'Distant Precursor' perspective, with raw events.
 * @param {PhaseData} nearPrecursorData - Data for the 'Near Precursor' perspective, with raw events.
 * @param {PhaseData} currentStateData - Data for the 'Current State' perspective, with raw events.
 * @returns {TriphasicField} The structured Triphasic Field with integrated sequence analysis.
 */
function calculateTriphasicField(eventName, distantPrecursorData, nearPrecursorData, currentStateData) {

    // Analyze event sequences within each phase
    if (distantPrecursorData.rawEventsInPhase) {
        distantPrecursorData.analyzedEventSequence = _analyzeEventSequenceInternal(distantPrecursorData.rawEventsInPhase);
    }
    if (nearPrecursorData.rawEventsInPhase) {
        nearPrecursorData.analyzedEventSequence = _analyzeEventSequenceInternal(nearPrecursorData.rawEventsInPhase);
    }
    if (currentStateData.rawEventsInPhase) {
        currentStateData.analyzedEventSequence = _analyzeEventSequenceInternal(currentStateData.rawEventsInPhase);
    }

    return {
        eventName: eventName,
        description: `Triphasic analysis of ${eventName}: Focuses on current or ongoing events to assess predictive potential, with detailed sequence metrics.`,
        distantPrecursor: distantPrecursorData,
        nearPrecursor: nearPrecursorData,
        currentState: currentStateData,
    };
}

/**
 * Assembles the data for a Pentaphasic Field analysis of a historical event,
 * now including detailed temporal sequence analysis for each phase and the overall event.
 * This function expects a pre-structured EventDataSet, now potentially with raw events per phase.
 *
 * @param {EventDataSet} historicalEventData - The complete dataset for a historical event with all 5 phases, potentially containing raw events.
 * @returns {PentaphasicField} The structured Pentaphasic Field with integrated sequence analysis.
 * @throws {Error} If not all 5 required phases are present in the historicalEventData.
 */
function calculatePentaphasicField(historicalEventData) {
    const requiredPhases = ["Antes", "Preludio", "Durante", "Transicion", "Despues"];
    const phasesMap = new Map(historicalEventData.phases.map(p => [p.name, p]));

    for (const phaseName of requiredPhases) {
        if (!phasesMap.has(phaseName)) {
            throw new Error(`Missing required phase '${phaseName}' for Pentaphasic Field calculation.`);
        }
    }

    // Analyze event sequences within each phase
    const pentaphasicField = {
        eventName: historicalEventData.eventName,
        description: `Pentaphasic analysis of ${historicalEventData.eventName}: Detailed breakdown for historical events, with integrated sequence metrics.`,
        antes: phasesMap.get("Antes"),
        preludio: phasesMap.get("Preludio"),
        durante: phasesMap.get("Durante"),
        transicion: phasesMap.get("Transicion"),
        despues: phasesMap.get("Despues"),
    };

    let fullEventRawSequence = [];

    // Iterate through phases, analyze their sequences, and build a full event sequence
    for (const phase of historicalEventData.phases) {
        if (phase.rawEventsInPhase && phase.rawEventsInPhase.length > 0) {
            phase.analyzedEventSequence = _analyzeEventSequenceInternal(phase.rawEventsInPhase);
            fullEventRawSequence = fullEventRawSequence.concat(phase.rawEventsInPhase);
        }
    }

    // Optionally, analyze the full historical event sequence as a whole
    if (fullEventRawSequence.length > 0) {
        // Ensure the full sequence is sorted by date before analysis
        fullEventRawSequence.sort((a, b) => new Date(a.date) - new Date(b.date));
        pentaphasicField.fullAnalyzedSequence = _analyzeEventSequenceInternal(fullEventRawSequence);
        // You could also add overall metrics derived from fullAnalyzedSequence here
        // e.g., pentaphasicField.overallMetrics = summarizeSequence(pentaphasicField.fullAnalyzedSequence);
    }

    return pentaphasicField;
}

/**
 * Assembles the data for a Supraphasic Field analysis of long-term influences.
 * This function doesn't directly use sequence analysis *of the originating event* here,
 * but the influenced events themselves could be analyzed by _analyzeEventSequenceInternal
 * if their raw data is available. This part remains largely conceptual based on current definition.
 *
 * @param {string} originatingEventName - The name of the historical event from which influences originate.
 * @param {string[]} identifiedRTIs - Array of descriptions of the long-term Routes of Influence.
 * @param {object[]} influencedEvents - Array of objects describing events/developments influenced.
 * @param {string[]} [influencedConcepts=[]] - Optional array of concepts influenced.
 * @returns {SupraphasicField} The structured Supraphasic Field.
 */
function calculateSupraphasicField(originatingEventName, identifiedRTIs, influencedEvents, influencedConcepts = []) {
    // If 'influencedEvents' also contained raw data for their own sequences,
    // you could extend this to analyze each influenced event's internal sequence.
    // E.g., influencedEvents.forEach(event => event.analyzedSequence = _analyzeEventSequenceInternal(event.rawEvents));

    return {
        originatingEventName: originatingEventName,
        description: `Supraphasic analysis of ${originatingEventName}: Tracking long-term influences (RTIs) beyond the event's immediate phases.`,
        identifiedRTIs: identifiedRTIs,
        influencedEvents: influencedEvents,
        influencedConcepts: influencedConcepts,
    };
}

module.exports = {
    calculateTriphasicField,
    calculatePentaphasicField,
    calculateSupraphasicField,
    // Exporting types for better documentation/autocompletion in consuming modules
    PhaseData: {}, // Placeholder for JSDoc type export
    Constructor: {}, // Placeholder for JSDoc type export
    EventDataSet: {},
    TriphasicField: {},
    PentaphasicField: {},
    SupraphasicField: {}
};