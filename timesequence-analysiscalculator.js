// timesequence-analysiscalculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// This module serves as the core analytical engine for Temporal Analysis Fields.
// It integrates detailed time-sequence analysis (from timesequence-analysiscalculator.js logic)
// into the broader Triphasic, Pentaphasic, and Supraphasic field structures.
// By doing so, it provides a comprehensive, multi-dimensional view of event dynamics
// and field evolution over time, allowing for the quantification of trends,
// identification of critical inflection points (CMN/RMD), assessment of Black Swan potential (PCN),
// and a deeper understanding of contextual coherence (CTH) across event chains within defined fields.


// Import all necessary calculator modules
const eveiCalculator = require('./evei-calculator.js');
const cthAnalysisModule = require('./cth-analysis-module.js');
const eveiCthExtendedAnalysis = require('./evei-cth-extended-analysis.js');
const eventConstructor = require('./constructor.js'); // Assuming 'constructor.js' handles event data formatting
const cmnRmdCalculator = require('./cmn-rmd-calculator.js');
const marginsCalculator = require('./margins-calculator.js');

/**
 * @typedef {object} RawEventData - Raw input data for an event before processing.
 * @property {string} id - Unique identifier for the event.
 * @property {string} date - ISO date string of the event.
 * @property {object} rawMetrics - Other raw data points required by sub-calculators.
 */

/**
 * @typedef {object} AnalyzedEvent - Structure for a single event after full analysis.
 * @property {string} id
 * @property {string} date
 * @property {number} EVEI
 * @property {number} CTH
 * @property {number} deltaCTH // Calculated based on sequence
 * @property {object} extendedEVEICTHAnalysis // Results from evei-cth-extended-analysis
 * @property {object} cmnRmdResults
 * @property {object} marginResults
 * // ... other computed metrics
 */

/**
 * Analyzes a sequence of events to provide a comprehensive breakdown of metrics.
 * @param {RawEventData[]} rawEventSequence - An ordered array of raw event data.
 * @returns {object} An object containing the full analysis of the sequence.
 */
function analyzeEventSequence(rawEventSequence) {
    if (!rawEventSequence || rawEventSequence.length < 1) {
        console.warn("Warning: No event sequence provided for analysis.");
        return { analyzedSequence: [], summary: "No events to analyze." };
    }

    const analyzedSequence = [];
    let previousEventMetrics = null; // To calculate deltaCTH, etc.

    for (let i = 0; i < rawEventSequence.length; i++) {
        const rawEvent = rawEventSequence[i];

        // Step 1: Standardize event data (if constructor.js is for this purpose)
        const eventData = eventConstructor.constructEventObject(rawEvent); // Assuming such a function exists

        // Step 2: Calculate core metrics (EVEI, CTH)
        const evei = eveiCalculator.calculateEVEI(eventData);
        const cth = cthAnalysisModule.calculateCTH(eventData); // Assuming CTH can be calculated per event

        // Initialize current event's metrics
        const currentEventMetrics = {
            id: eventData.id,
            date: eventData.date,
            EVEI: evei,
            CTH: cth,
            deltaCTH: null, // To be calculated
            extendedEVEICTHAnalysis: null,
            cmnRmdResults: null,
            marginResults: null,
            // ... other metrics
        };

        // Step 3: Calculate Delta CTH (requires a previous event)
        if (previousEventMetrics) {
            // Assuming deltaCTH can be derived from current and previous CTH
            currentEventMetrics.deltaCTH = cthAnalysisModule.calculateDeltaCTH(cth, previousEventMetrics.CTH);
        }

        // Step 4: Perform Extended EVEI-CTH Analysis
        currentEventMetrics.extendedEVEICTHAnalysis = eveiCthExtendedAnalysis.analyzeEVEICTH(evei, cth);

        // Step 5: Calculate CMN and RMD (might depend on context of previous events)
        currentEventMetrics.cmnRmdResults = cmnRmdCalculator.calculateCMNRMD(currentEventMetrics, previousEventMetrics);

        // Step 6: Calculate Margins
        currentEventMetrics.marginResults = marginsCalculator.calculateMargin(currentEventMetrics); // Simplified for example

        analyzedSequence.push(currentEventMetrics);
        previousEventMetrics = currentEventMetrics; // Set current as previous for next iteration
    }

    // After processing all events, perform any sequence-level summaries or interpretations
    const sequenceSummary = generateSequenceSummary(analyzedSequence);

    return {
        analyzedSequence: analyzedSequence,
        summary: sequenceSummary,
    };
}

/**
 * Generates a summary for the entire analyzed event sequence.
 * This is a placeholder and would contain more complex logic in a real scenario.
 * @param {AnalyzedEvent[]} sequence - The array of fully analyzed events.
 * @returns {string} A summary of the sequence.
 */
function generateSequenceSummary(sequence) {
    if (sequence.length === 0) return "No events analyzed.";
    // Example: Find average EVEI or CTH trend
    const avgEVEI = sequence.reduce((sum, e) => sum + e.EVEI, 0) / sequence.length;
    const avgCTH = sequence.reduce((sum, e) => sum + e.CTH, 0) / sequence.length;
    return `Sequence analysis complete. Average EVEI: ${avgEVEI.toFixed(2)}, Average CTH: ${avgCTH.toFixed(2)}.`;
}


module.exports = {
    analyzeEventSequence
};