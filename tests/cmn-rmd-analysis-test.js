// cmn-rmd-analysis-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import the necessary modules
const { analyzeCMNRMD } = require('../cmn-rmd-analysis'); // Path to the CMN/RMD analysis module
const { analyzeEventExtended } = require('../evei-cth-extended-analysis'); // Path to your extended analysis module

// --- Define Historical Data for various events ---
// These are the same hypothetical historical data objects used in evei-cth-extended-analysis-test.js
// and were previously provided by you.

// Data for the Bastille event (High Change / Disruption)
const bastilleEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 900, giniIndex: 0.58, politicalEventsCount: 5, averageIncome: 150, literacyRate: 0.15, lifeExpectancy: 35, birthRate: 0.035, populationDensity: 20, urbanizationRate: 0.18 } },
    prelude: { indicators: { gdpPerCapita: 880, giniIndex: 0.60, politicalEventsCount: 8, averageIncome: 140, literacyRate: 0.16, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 21, urbanizationRate: 0.19 } },
    during: { indicators: { gdpPerCapita: 850, giniIndex: 0.62, politicalEventsCount: 15, averageIncome: 130, literacyRate: 0.18, lifeExpectancy: 33, birthRate: 0.037, populationDensity: 22, urbanizationRate: 0.20 } },
    transition: { indicators: { gdpPerCapita: 870, giniIndex: 0.61, politicalEventsCount: 12, averageIncome: 135, literacyRate: 0.19, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 22, urbanizationRate: 0.21 } },
    after: { indicators: { gdpPerCapita: 920, giniIndex: 0.57, politicalEventsCount: 7, averageIncome: 160, literacyRate: 0.20, lifeExpectancy: 36, birthRate: 0.034, populationDensity: 23, urbanizationRate: 0.22 } },
};

const bastilleCompleteEventData = {
    name: 'Storming of the Bastille',
    eventStartYear: 1789,
    eventEndYear: 1789,
    historicalData: bastilleEventHistoricalData,
    indicatorA: 0.7, // High significance for EVEI
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// Data for an example of a "Stable Period" or "Gradual Change"
const gradualChangeEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 1000, giniIndex: 0.40, politicalEventsCount: 2, averageIncome: 200, literacyRate: 0.60, lifeExpectancy: 60, birthRate: 0.015, populationDensity: 50, urbanizationRate: 0.70 } },
    prelude: { indicators: { gdpPerCapita: 1010, giniIndex: 0.39, politicalEventsCount: 3, averageIncome: 205, literacyRate: 0.61, lifeExpectancy: 61, birthRate: 0.014, populationDensity: 51, urbanizationRate: 0.71 } },
    during: { indicators: { gdpPerCapita: 1020, giniIndex: 0.38, politicalEventsCount: 4, averageIncome: 210, literacyRate: 0.62, lifeExpectancy: 62, birthRate: 0.013, populationDensity: 52, urbanizationRate: 0.72 } },
    transition: { indicators: { gdpPerCapita: 1030, giniIndex: 0.37, politicalEventsCount: 3, averageIncome: 215, literacyRate: 0.63, lifeExpectancy: 63, birthRate: 0.012, populationDensity: 53, urbanizationRate: 0.73 } },
    after: { indicators: { gdpPerCapita: 1040, giniIndex: 0.36, politicalEventsCount: 2, averageIncome: 220, literacyRate: 0.64, lifeExpectancy: 64, birthRate: 0.011, populationDensity: 54, urbanizationRate: 0.74 } },
};

const gradualCompleteEventData = {
    name: 'Economic Liberalization Period (Gradual Change)',
    eventStartYear: 1980,
    eventEndYear: 1990,
    historicalData: gradualChangeEventHistoricalData,
    indicatorA: 0.3, // Lower significance, more stable for EVEI
    indicatorB: 0.7,
    indicatorC: 0.6,
};

// Data for a "Crisis/Collapse" type event
const crisisEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 1200, giniIndex: 0.30, politicalEventsCount: 1, averageIncome: 250, literacyRate: 0.80, lifeExpectancy: 70, birthRate: 0.010, populationDensity: 70, urbanizationRate: 0.85 } },
    prelude: { indicators: { gdpPerCapita: 1150, giniIndex: 0.32, politicalEventsCount: 5, averageIncome: 230, literacyRate: 0.78, lifeExpectancy: 69, birthRate: 0.011, populationDensity: 69, urbanizationRate: 0.84 } },
    during: { indicators: { gdpPerCapita: 800, giniIndex: 0.50, politicalEventsCount: 20, averageIncome: 150, literacyRate: 0.70, lifeExpectancy: 65, birthRate: 0.015, populationDensity: 65, urbanizationRate: 0.80 } },
    transition: { indicators: { gdpPerCapita: 850, giniIndex: 0.48, politicalEventsCount: 15, averageIncome: 160, literacyRate: 0.72, lifeExpectancy: 66, birthRate: 0.014, populationDensity: 66, urbanizationRate: 0.81 } },
    after: { indicators: { gdpPerCapita: 900, giniIndex: 0.45, politicalEventsCount: 10, averageIncome: 170, literacyRate: 0.75, lifeExpectancy: 67, birthRate: 0.013, populationDensity: 67, urbanizationRate: 0.82 } },
};

const crisisCompleteEventData = {
    name: 'Major Economic Crisis',
    eventStartYear: 2008,
    eventEndYear: 2009,
    historicalData: crisisEventHistoricalData,
    indicatorA: 0.8, // High significance for EVEI
    indicatorB: 0.2,
    indicatorC: 0.3,
};


// --- Helper function to run full analysis and print CMN/RMD table ---
function runFullCMNRMDAnalysis(eventData, actionValue, reactionValue, resultValue, cthAscendingValue) {
    console.log(`\n--- Running CMN/RMD Analysis for: ${eventData.name} ---`);
    try {
        // First, get the extended analysis results from evei-cth-extended-analysis
        const extendedResults = analyzeEventExtended(
            eventData,
            actionValue,
            reactionValue,
            resultValue,
            cthAscendingValue
        );

        if (!extendedResults) {
            console.error(`  Extended analysis failed for ${eventData.name}. Cannot perform CMN/RMD analysis.`);
            return;
        }

        // Then, use the extended results to get CMN/RMD analysis
        const cmnRMDAnalysis = analyzeCMNRMD(extendedResults);

        console.log(`  Overall Classification: ${cmnRMDAnalysis.classification}`);
        console.log("\n  --- CMN/RMD Table ---");
        console.log(`  Category             | CMN (Negative Outcome)                                        | RMD (Positive Outcome)`);
        console.log(`  ---------------------|---------------------------------------------------------------|---------------------------------------------------------------`);
        // Determine which probability is "main" based on the classification
        const cmnProbDisplay = (cmnRMDAnalysis.classification === 'CMN' || cmnRMDAnalysis.classification === 'Neutral/Balanced') ?
                                cmnRMDAnalysis.probability.mainPercentage.toFixed(4) :
                                cmnRMDAnalysis.probability.complementaryPercentage.toFixed(4);
        const rmdProbDisplay = (cmnRMDAnalysis.classification === 'RMD' || cmnRMDAnalysis.classification === 'Neutral/Balanced') ?
                                cmnRMDAnalysis.probability.mainPercentage.toFixed(4) :
                                cmnRMDAnalysis.probability.complementaryPercentage.toFixed(4);

        console.log(`  Probability          | ${cmnProbDisplay.padEnd(61)} | ${rmdProbDisplay}`);
        console.log(`  Conditions Associated| ${cmnRMDAnalysis.associatedConditions.cmn.padEnd(61)} | ${cmnRMDAnalysis.associatedConditions.rmd}`);
        console.log(`  Timeframe            | ${cmnRMDAnalysis.timeframe.cmn.padEnd(61)} | ${cmnRMDAnalysis.timeframe.rmd}`);
        console.log(`  Historical Basis     | ${cmnRMDAnalysis.historicalBasis.cmn.padEnd(61)} | ${cmnRMDAnalysis.historicalBasis.rmd}`);
        console.log(`  Critical Events      | ${cmnRMDAnalysis.criticalEvents.cmn.padEnd(61)} | ${cmnRMDAnalysis.criticalEvents.rmd}`);
        console.log(`  System State         | ${cmnRMDAnalysis.systemState.cmn.padEnd(61)} | ${cmnRMDAnalysis.systemState.rmd}`);
        console.log(`  Key Points           | ${cmnRMDAnalysis.keyPoints.cmn.padEnd(61)} | ${cmnRMDAnalysis.keyPoints.rmd}`);
        console.log(`  Consequences         | ${cmnRMDAnalysis.consequences.cmn.padEnd(61)} | ${cmnRMDAnalysis.consequences.rmd}`);
        console.log(`  ---------------------|---------------------------------------------------------------|---------------------------------------------------------------`);


    } catch (error) {
        console.error(`  An error occurred during CMN/RMD analysis for ${eventData.name}:`, error.message);
    }
}

// --- Run analysis for each event ---

console.log("--- Starting Comprehensive CMN/RMD Analysis Test ---");

// Bastille Event
runFullCMNRMDAnalysis(
    bastilleCompleteEventData,
    0.6, // actionValue
    0.3, // reactionValue
    0.1, // resultValue
    0.8  // cthAscendingValue (Hypothetical value for 'ascending' CTH)
);

// Gradual Change Event
runFullCMNRMDAnalysis(
    gradualCompleteEventData,
    0.2, // actionValue
    0.5, // reactionValue
    0.3, // resultValue
    0.9  // cthAscendingValue - higher for stable periods
);

// Crisis Event
runFullCMNRMDAnalysis(
    crisisCompleteEventData,
    0.7, // actionValue
    0.2, // reactionValue
    0.1, // resultValue
    0.4  // cthAscendingValue - lower for unstable periods
);

console.log("\n--- All Comprehensive CMN/RMD Analyses Tests Complete ---");