// evei-cth-extended-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import the module containing the analyzeEventExtended function
const { analyzeEventExtended } = require('../evei-cth-extended-analysis'); // Adjust path as necessary
const { EPOCH_DATA_REFERENCE } = require('../cth-analysis-module'); // Assuming epoch data is exported from cth-analysis-module

// --- Define Historical Data for various events ---
// These hypothetical historical data objects are crucial for CTH calculation and inference.

// Data for the French Revolution (Example 01)
const frenchRevolutionEventData = {
    name: 'French Revolution',
    eventStartYear: 1789,
    eventEndYear: 1799, // Revolution period
    historicalData: {
        before: { indicators: { gdpPerCapita: 1000, giniIndex: 0.55, politicalEventsCount: 5, averageIncome: 150, literacyRate: 0.20, lifeExpectancy: 35, birthRate: 0.035, populationDensity: 20, urbanizationRate: 0.18 } },
        prelude: { indicators: { gdpPerCapita: 950, giniIndex: 0.58, politicalEventsCount: 10, averageIncome: 140, literacyRate: 0.22, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 21, urbanizationRate: 0.19 } },
        during: { indicators: { gdpPerCapita: 800, giniIndex: 0.65, politicalEventsCount: 20, averageIncome: 100, literacyRate: 0.25, lifeExpectancy: 30, birthRate: 0.038, populationDensity: 22, urbanizationRate: 0.20 } },
        transition: { indicators: { gdpPerCapita: 850, giniIndex: 0.62, politicalEventsCount: 15, averageIncome: 110, literacyRate: 0.28, lifeExpectancy: 32, birthRate: 0.037, populationDensity: 23, urbanizationRate: 0.21 } },
        after: { indicators: { gdpPerCapita: 900, giniIndex: 0.60, politicalEventsCount: 8, averageIncome: 120, literacyRate: 0.30, lifeExpectancy: 33, birthRate: 0.035, populationDensity: 24, urbanizationRate: 0.22 } },
    },
    // These are the specific event indicators A, B, C for EVEI calculation
    indicatorA: 0.9, // High impact magnitude (revolutionary change)
    indicatorB: 0.8, // Wide scope of affected areas (all of France, spread to Europe)
    indicatorC: 0.7, // High public perception/media coverage (symbolic event)
};

// Data for the iPhone Launch (Example 02)
const iphoneLaunchEventData = {
    name: 'iPhone Launch',
    eventStartYear: 2007,
    eventEndYear: 2007,
    historicalData: {
        before: { indicators: { gdpPerCapita: 28000, giniIndex: 0.38, politicalEventsCount: 2, averageIncome: 7000, literacyRate: 0.98, lifeExpectancy: 75, birthRate: 0.012, populationDensity: 200, urbanizationRate: 0.80 } },
        prelude: { indicators: { gdpPerCapita: 29000, giniIndex: 0.37, politicalEventsCount: 2, averageIncome: 7200, literacyRate: 0.98, lifeExpectancy: 76, birthRate: 0.011, populationDensity: 205, urbanizationRate: 0.81 } },
        during: { indicators: { gdpPerCapita: 30000, giniIndex: 0.36, politicalEventsCount: 3, averageIncome: 7500, literacyRate: 0.99, lifeExpectancy: 76, birthRate: 0.010, populationDensity: 210, urbanizationRate: 0.82 } },
        transition: { indicators: { gdpPerCapita: 31000, giniIndex: 0.35, politicalEventsCount: 2, averageIncome: 7800, literacyRate: 0.99, lifeExpectancy: 77, birthRate: 0.009, populationDensity: 215, urbanizationRate: 0.83 } },
        after: { indicators: { gdpPerCapita: 32000, giniIndex: 0.34, politicalEventsCount: 2, averageIncome: 8000, literacyRate: 0.99, lifeExpectancy: 78, birthRate: 0.009, populationDensity: 220, urbanizationRate: 0.84 } },
    },
    indicatorA: 0.6, // Moderate-high direct impact (tech, consumption)
    indicatorB: 0.9, // Very wide scope (global, communication, lifestyle)
    indicatorC: 0.7, // High public perception/media (revolutionary product)
};

// Data for the Invention of the Printing Press (Example 03)
const printingPressEventData = {
    name: 'Invention of the Printing Press',
    eventStartYear: 1440,
    eventEndYear: 1450, // Development and early adoption
    historicalData: {
        before: { indicators: { gdpPerCapita: 900, giniIndex: 0.55, politicalEventsCount: 4, averageIncome: 180, literacyRate: 0.10, lifeExpectancy: 30, birthRate: 0.040, populationDensity: 10, urbanizationRate: 0.12 } },
        prelude: { indicators: { gdpPerCapita: 920, giniIndex: 0.54, politicalEventsCount: 5, averageIncome: 185, literacyRate: 0.11, lifeExpectancy: 31, birthRate: 0.039, populationDensity: 11, urbanizationRate: 0.13 } },
        during: { indicators: { gdpPerCapita: 950, giniIndex: 0.53, politicalEventsCount: 6, averageIncome: 190, literacyRate: 0.13, lifeExpectancy: 32, birthRate: 0.038, populationDensity: 12, urbanizationRate: 0.14 } },
        transition: { indicators: { gdpPerCapita: 1000, giniIndex: 0.52, politicalEventsCount: 5, averageIncome: 200, literacyRate: 0.15, lifeExpectancy: 33, birthRate: 0.037, populationDensity: 13, urbanizationRate: 0.15 } },
        after: { indicators: { gdpPerCapita: 1050, giniIndex: 0.50, politicalEventsCount: 4, averageIncome: 210, literacyRate: 0.18, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 14, urbanizationRate: 0.16 } },
    },
    indicatorA: 0.5, // Moderate direct impact (slow initial spread)
    indicatorB: 0.7, // Wide scope (information dissemination)
    indicatorC: 0.8, // High long-term cultural perception/impact
};

// --- Helper function to run analysis and print results ---
function runExtendedAnalysis(eventData, actionValue, reactionValue, resultValue, cthAscendingValue) {
    console.log(`\n--- Example: ${eventData.name} (Year: ${eventData.eventStartYear}) ---`);
    try {
        const results = analyzeEventExtended(eventData, actionValue, reactionValue, resultValue, cthAscendingValue);

        console.log("Extended Analysis Results:");
        console.log(`  CTH (Before Event): ${results.cthAnalysis.before.toFixed(4)}`);
        console.log(`  CTH (Prelude): ${results.cthAnalysis.prelude.toFixed(4)}`);
        console.log(`  CTH (During Event): ${results.cthAnalysis.during.toFixed(4)}`);
        console.log(`  CTH (Transition): ${results.cthAnalysis.transition.toFixed(4)}`);
        console.log(`  CTH (After Event): ${results.cthAnalysis.after.toFixed(4)}`);
        console.log(`  EVEI: ${results.evei.toFixed(4)} - ${results.eveiInterpretation}`);
        console.log(`  IEC (Incremental Event Causality): ${results.iec.toFixed(4)}`);
        console.log(`  PPI (Predictive Power Index): ${results.ppi.toFixed(4)}`);
        console.log(`  VVC (Volatility and Vulnerability Coefficient): ${results.vvc.toFixed(4)}`);
        console.log(`  MCE (Modified CTH Evaluation): ${results.mce.toFixed(4)}`);
        console.log(`  Delta CTH Total (Absolute Change): ${results.deltaCTH_Total.toFixed(4)}`);
        console.log(`  IIG (Impact Intensity Gradient): ${results.iig.toFixed(4)}`);
        console.log(`  UIR (Unexpected Instability Ratio): ${results.uir.toFixed(4)}`);
        console.log(`  PTS (Potential Transformation Scale): ${results.pts.toFixed(4)}`);
        console.log(`  RD (Resilience Dynamics): ${results.rd.toFixed(4)}`);
        console.log(`  PPIC (Post-Event Progress Index): ${results.ppic.toFixed(4)}`);

    } catch (error) {
        console.error(`An unexpected error occurred during EVEI calculation for ${eventData.name}:`, error.message);
    }
}

// --- Run analysis for each example event ---

console.log("--- Starting EVEI Test Cases ---");

// Example 01: French Revolution
runExtendedAnalysis(
    frenchRevolutionEventData,
    0.6, // actionValue (e.g., proactive reforms attempted)
    0.3, // reactionValue (e.g., governmental repression, public uprising)
    0.1, // resultValue (e.g., immediate fall of monarchy)
    0.5  // cthAscendingValue (hypothetical, e.g., desired progressive trajectory)
);

// Example 02: iPhone Launch
runExtendedAnalysis(
    iphoneLaunchEventData,
    0.9, // actionValue (e.g., product development, marketing)
    0.8, // reactionValue (e.g., consumer adoption, competitor response)
    0.9, // resultValue (e.g., immediate market shift)
    0.9  // cthAscendingValue (hypothetical, e.g., continuous technological advancement)
);

// Example 03: Invention of the Printing Press
runExtendedAnalysis(
    printingPressEventData,
    0.4, // actionValue (e.g., invention itself, early production)
    0.5, // reactionValue (e.g., slow adoption, some resistance)
    0.6, // resultValue (e.g., gradual spread of knowledge)
    0.7  // cthAscendingValue (hypothetical, e.g., increasing literacy and information access)
);

console.log("\n--- All EVEI-CTH Extended Test Cases Complete ---");