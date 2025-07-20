// margins-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { calculateMargins } = require('../margins-calculator'); // Adjust path if necessary
const { calculateEVEI } = require('../evei-calculator'); // These imports might not be strictly needed here if calculateMargins handles them internally, but are good for explicit clarity if debugging.
const { analyzeEventCTH } = require('../cth-analysis-module'); // Same as above.


// --- Define Historical Data for each event with actual indicator values ---
// (Copy this section directly from your constructor-test.js or a centralized data file)

// Data for the Bastille event
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
    indicatorA: 0.7,
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// Data for Robespierre
const robespierreEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 890, giniIndex: 0.61, politicalEventsCount: 18, averageIncome: 130, literacyRate: 0.20, lifeExpectancy: 32, birthRate: 0.038, populationDensity: 23, urbanizationRate: 0.21 } },
    prelude: { indicators: { gdpPerCapita: 870, giniIndex: 0.63, politicalEventsCount: 20, averageIncome: 125, literacyRate: 0.21, lifeExpectancy: 31, birthRate: 0.039, populationDensity: 24, urbanizationRate: 0.22 } },
    during: { indicators: { gdpPerCapita: 800, giniIndex: 0.65, politicalEventsCount: 25, averageIncome: 110, literacyRate: 0.22, lifeExpectancy: 30, birthRate: 0.040, populationDensity: 25, urbanizationRate: 0.23 } }, // Reign of Terror period
    transition: { indicators: { gdpPerCapita: 820, giniIndex: 0.64, politicalEventsCount: 22, averageIncome: 115, literacyRate: 0.23, lifeExpectancy: 31, birthRate: 0.039, populationDensity: 24, urbanizationRate: 0.23 } },
    after: { indicators: { gdpPerCapita: 880, giniIndex: 0.60, politicalEventsCount: 15, averageIncome: 140, literacyRate: 0.25, lifeExpectancy: 33, birthRate: 0.037, populationDensity: 23, urbanizationRate: 0.24 } },
};

const robespierreCompleteEventData = {
    name: 'Fall of Robespierre',
    eventStartYear: 1793,
    eventEndYear: 1794,
    historicalData: robespierreEventHistoricalData,
    indicatorA: 0.5,
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// Data for Louis XVI
const louisXVIEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 950, giniIndex: 0.55, politicalEventsCount: 10, averageIncome: 160, literacyRate: 0.18, lifeExpectancy: 36, birthRate: 0.034, populationDensity: 21, urbanizationRate: 0.20 } },
    prelude: { indicators: { gdpPerCapita: 920, giniIndex: 0.57, politicalEventsCount: 12, averageIncome: 155, literacyRate: 0.19, lifeExpectancy: 35, birthRate: 0.035, populationDensity: 21, urbanizationRate: 0.21 } },
    during: { indicators: { gdpPerCapita: 830, giniIndex: 0.60, politicalEventsCount: 18, averageIncome: 140, literacyRate: 0.20, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 22, urbanizationRate: 0.22 } }, // Period leading to and including his execution
    transition: { indicators: { gdpPerCapita: 850, giniIndex: 0.59, politicalEventsCount: 15, averageIncome: 145, literacyRate: 0.21, lifeExpectancy: 35, birthRate: 0.035, populationDensity: 22, urbanizationRate: 0.23 } },
    after: { indicators: { gdpPerCapita: 900, giniIndex: 0.56, politicalEventsCount: 10, averageIncome: 150, literacyRate: 0.22, lifeExpectancy: 36, birthRate: 0.034, populationDensity: 23, urbanizationRate: 0.24 } },
};

const louisXVICompleteEventData = {
    name: 'Execution of Louis XVI',
    eventStartYear: 1793,
    eventEndYear: 1793,
    historicalData: louisXVIEventHistoricalData,
    indicatorA: 0.9,
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// --- Run the Margins calculation for each event ---

console.log("--- Calculating Macromargins and Micromargins ---");

function runMarginsAnalysis(eventData) {
    console.log(`\n--- Analysis for '${eventData.name}' ---`);
    const result = calculateMargins(eventData); // Renamed function call to calculateMargins

    if (result) {
        console.log(`  Macromargin (sum): ${result.macromargin.toFixed(4)}`);
        console.log(`  Micromargin (sum): ${result.micromargin.toFixed(4)}`);
        console.log(`  Macromargin (%): ${result.macromarginPercentage.toFixed(2)}%`);
        console.log(`  Micromargin (%): ${result.micromarginPercentage.toFixed(2)}%`);
        console.log("  Phase Indices:", result.phaseIndices);
    } else {
        console.error(`  Could not calculate margins for '${eventData.name}'.`);
    }
}

runMarginsAnalysis(bastilleCompleteEventData);
runMarginsAnalysis(robespierreCompleteEventData);
runMarginsAnalysis(louisXVICompleteEventData);

console.log("\n--- End of Margins Calculation ---");