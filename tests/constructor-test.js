// constructor-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import necessary modules
const { calculateEVEI } = require('../evei-calculator'); // Adjust path as needed
const { analyzeEventCTH } = require('../cth-analysis-module'); // Assuming CTH is also needed here

// --- HELPER FUNCTION: To combine EVEI and CTH analysis results ---
// This function will encapsulate the logic to run both EVEI and CTH analysis
// for a given event, mimicking the structure expected by calculateCMNRMD later.
function analyzeCompleteEvent(eventData) {
    try {
        const cthAnalysisResult = analyzeEventCTH(
            eventData.eventStartYear,
            eventData.eventEndYear,
            eventData.historicalData
        );

        const eveiAnalysisResult = calculateEVEI(eventData);

        if (!cthAnalysisResult || !cthAnalysisResult.during || !eveiAnalysisResult) {
            console.error(`Incomplete analysis for ${eventData.name}: CTH or EVEI results missing.`);
            return null;
        }

        // Return a structured object containing all analysis results
        return {
            name: eventData.name,
            eveiAnalysis: eveiAnalysisResult,
            cthAnalysis: cthAnalysisResult,
            eventStartYear: eventData.eventStartYear,
            eventEndYear: eventData.eventEndYear,
            // Include criticalPoint and stableState for analogous events if this function
            // were to process them, but for the 'current' event in a constructor test,
            // these are not strictly necessary unless you're also testing CMN/RMD directly here.
        };
    } catch (error) {
        console.error(`Error analyzing event '${eventData.name}': ${error.message}`);
        return null;
    }
}

// --- Define Historical Data for each event with actual indicator values ---

// Data for the Bastille event
const bastilleEventHistoricalData = {
    before: { indicators: { gdpPerCapita: 900, giniIndex: 0.58, politicalEventsCount: 5, averageIncome: 150, literacyRate: 0.15, lifeExpectancy: 35, birthRate: 0.035, populationDensity: 20, urbanizationRate: 0.18 } },
    prelude: { indicators: { gdpPerCapita: 880, giniIndex: 0.60, politicalEventsCount: 8, averageIncome: 140, literacyRate: 0.16, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 21, urbanizationRate: 0.19 } },
    during: { indicators: { gdpPerCapita: 850, giniIndex: 0.62, politicalEventsCount: 15, averageIncome: 130, literacyRate: 0.18, lifeExpectancy: 33, birthRate: 0.037, populationDensity: 22, urbanizationRate: 0.20 } },
    transition: { indicators: { gdpPerCapita: 870, giniIndex: 0.61, politicalEventsCount: 12, averageIncome: 135, literacyRate: 0.19, lifeExpectancy: 34, birthRate: 0.036, populationDensity: 22, urbanizationRate: 0.21 } },
    after: { indicators: { gdpPerCapita: 920, giniIndex: 0.57, politicalEventsCount: 7, averageIncome: 160, literacyRate: 0.20, lifeExpectancy: 36, birthRate: 0.034, populationDensity: 23, urbanizationRate: 0.22 } },
};

const bastilleCompleteEventData = {
    name: 'Toma de la Bastilla', // Add name for better logging
    eventStartYear: 1789,
    eventEndYear: 1789,
    historicalData: bastilleEventHistoricalData,
    indicatorA: 0.7, // These are EVEI-specific
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
    name: 'Caída de Robespierre', // Add name
    eventStartYear: 1793, // Reign of Terror
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
    name: 'Ejecución de Luis XVI', // Add name
    eventStartYear: 1793,
    eventEndYear: 1793,
    historicalData: louisXVIEventHistoricalData,
    indicatorA: 0.9,
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// --- Execute Analysis for each event ---

console.log("--- Starting Individual Event Analysis ---");

// Analyze Bastille
const bastilleAnalysis = analyzeCompleteEvent(bastilleCompleteEventData);
if (bastilleAnalysis) {
    console.log(`\nAnalysis for '${bastilleAnalysis.name}':`);
    console.log(`  EVEI: ${bastilleAnalysis.eveiAnalysis.value.toFixed(4)}`);
    console.log(`  CTH (During): ${bastilleAnalysis.cthAnalysis.during.cth.toFixed(4)}`);
    // Assuming a constructor named TetrasociohistoricalConcept exists and you want to instantiate it
    /*
    const bastilleInstance = new TetrasociohistoricalConcept({
        name: bastilleAnalysis.name,
        type: 'event',
        startYear: bastilleAnalysis.eventStartYear,
        endYear: bastilleAnalysis.eventEndYear,
        cthIndex: bastilleAnalysis.cthAnalysis.during.cth,
        eveiIndex: bastilleAnalysis.eveiAnalysis.value,
    });
    console.log(bastilleInstance);
    */
} else {
    console.error(`Failed to analyze '${bastilleCompleteEventData.name}'.`);
}

// Analyze Robespierre
const robespierreAnalysis = analyzeCompleteEvent(robespierreCompleteEventData);
if (robespierreAnalysis) {
    console.log(`\nAnalysis for '${robespierreAnalysis.name}':`);
    console.log(`  EVEI: ${robespierreAnalysis.eveiAnalysis.value.toFixed(4)}`);
    console.log(`  CTH (During): ${robespierreAnalysis.cthAnalysis.during.cth.toFixed(4)}`);
    // Instantiate constructor for Robespierre
} else {
    console.error(`Failed to analyze '${robespierreCompleteEventData.name}'.`);
}

// Analyze Louis XVI
const louisXVIAnalysis = analyzeCompleteEvent(louisXVICompleteEventData);
if (louisXVIAnalysis) {
    console.log(`\nAnalysis for '${louisXVIAnalysis.name}':`);
    console.log(`  EVEI: ${louisXVIAnalysis.eveiAnalysis.value.toFixed(4)}`);
    console.log(`  CTH (During): ${louisXVIAnalysis.cthAnalysis.during.cth.toFixed(4)}`);
    // Instantiate constructor for Louis XVI
} else {
    console.error(`Failed to analyze '${louisXVICompleteEventData.name}'.`);
}

console.log("\n--- End of Individual Event Analysis ---");