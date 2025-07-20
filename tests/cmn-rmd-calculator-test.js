// CMN-RMD-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import necessary modules
const { calculateCMNRMD } = require('../cmn-rmd-calculator'); // Ensure this path is correct
const { calculateEVEI } = require('../evei-calculator');       // Ensure this path is correct
const { analyzeEventCTH } = require('../cth-analysis-module'); // Ensure this path is correct

// --- Simulated Historical Data for Events ---

// Data for the French Revolution (Current Event)
const frenchRevolutionHistoricalData = {
    before: {
        indicators: {
            gdpPerCapita: 950, giniIndex: 0.55, politicalEventsCount: 8, averageIncome: 150,
            literacyRate: 0.2, lifeExpectancy: 38, birthRate: 0.035, populationDensity: 25, urbanizationRate: 0.2
        }
    },
    prelude: {
        indicators: {
            gdpPerCapita: 1000, giniIndex: 0.53, politicalEventsCount: 7, averageIncome: 200,
            literacyRate: 0.25, lifeExpectancy: 39, birthRate: 0.032, populationDensity: 28, urbanizationRate: 0.22
        }
    },
    during: {
        indicators: {
            gdpPerCapita: 1050, giniIndex: 0.52, politicalEventsCount: 5, averageIncome: 250,
            literacyRate: 0.3, lifeExpectancy: 40, birthRate: 0.03, populationDensity: 30, urbanizationRate: 0.25
        }
    },
    transition: {
        indicators: {
            gdpPerCapita: 1080, giniIndex: 0.5, politicalEventsCount: 4, averageIncome: 300,
            literacyRate: 0.32, lifeExpectancy: 41, birthRate: 0.029, populationDensity: 33, urbanizationRate: 0.28
        }
    },
    after: {
        indicators: {
            gdpPerCapita: 1100, giniIndex: 0.49, politicalEventsCount: 4, averageIncome: 400,
            literacyRate: 0.35, lifeExpectancy: 42, birthRate: 0.028, populationDensity: 35, urbanizationRate: 0.3
        }
    }
};

// Complete object for French Revolution (input for calculateEVEI and CTH)
const frenchRevolutionEventData = {
    name: 'French Revolution',
    eventStartYear: 1789,
    eventEndYear: 1799,
    historicalData: frenchRevolutionHistoricalData,
    indicatorA: 0.7, // Conceptual indicators A, B, C for EVEI
    indicatorB: 0.5,
    indicatorC: 0.5,
};

// Data for American Revolution (Analogous Event 1)
const americanRevolutionHistoricalData = {
    before: {
        indicators: {
            gdpPerCapita: 800, giniIndex: 0.6, politicalEventsCount: 10, averageIncome: 100,
            literacyRate: 0.15, lifeExpectancy: 35, birthRate: 0.038, populationDensity: 15, urbanizationRate: 0.1
        }
    },
    prelude: {
        indicators: {
            gdpPerCapita: 850, giniIndex: 0.58, politicalEventsCount: 9, averageIncome: 120,
            literacyRate: 0.18, lifeExpectancy: 36, birthRate: 0.037, populationDensity: 18, urbanizationRate: 0.12
        }
    },
    during: {
        indicators: {
            gdpPerCapita: 900, giniIndex: 0.56, politicalEventsCount: 7, averageIncome: 150,
            literacyRate: 0.2, lifeExpectancy: 37, birthRate: 0.036, populationDensity: 20, urbanizationRate: 0.15
        }
    },
    transition: {
        indicators: {
            gdpPerCapita: 920, giniIndex: 0.55, politicalEventsCount: 6, averageIncome: 160,
            literacyRate: 0.22, lifeExpectancy: 38, birthRate: 0.035, populationDensity: 21, urbanizationRate: 0.16
        }
    },
    after: {
        indicators: {
            gdpPerCapita: 950, giniIndex: 0.53, politicalEventsCount: 5, averageIncome: 180,
            literacyRate: 0.25, lifeExpectancy: 39, birthRate: 0.034, populationDensity: 23, urbanizationRate: 0.18
        }
    }
};

const americanRevolutionEventData = {
    name: 'American Revolution',
    eventStartYear: 1775,
    eventEndYear: 1783,
    historicalData: americanRevolutionHistoricalData,
    indicatorA: 0.6, indicatorB: 0.7, indicatorC: 0.8,
    // ADDED: Critical and Stable points observed in this analogue
    // These values would typically be derived from detailed historical analysis of the analogue.
    criticalPoint: { evei: 0.55, cth: 0.28 }, // EVEI/CTH just before its radical change point
    stableState: { evei: 0.40, cth: 0.23 }   // EVEI/CTH at its subsequent stable state
};

// Data for the Russian Revolution (Analogous Event 2)
const russianRevolutionHistoricalData = {
    before: {
        indicators: {
            gdpPerCapita: 1200, giniIndex: 0.65, politicalEventsCount: 15, averageIncome: 180,
            literacyRate: 0.3, lifeExpectancy: 30, birthRate: 0.04, populationDensity: 30, urbanizationRate: 0.2
        }
    },
    prelude: {
        indicators: {
            gdpPerCapita: 1150, giniIndex: 0.67, politicalEventsCount: 18, averageIncome: 170,
            literacyRate: 0.28, lifeExpectancy: 29, birthRate: 0.041, populationDensity: 32, urbanizationRate: 0.21
        }
    },
    during: {
        indicators: {
            gdpPerCapita: 1000, giniIndex: 0.7, politicalEventsCount: 25, averageIncome: 150,
            literacyRate: 0.25, lifeExpectancy: 28, birthRate: 0.042, populationDensity: 35, urbanizationRate: 0.23
        }
    },
    transition: {
        indicators: {
            gdpPerCapita: 1050, giniIndex: 0.68, politicalEventsCount: 20, averageIncome: 160,
            literacyRate: 0.27, lifeExpectancy: 29, birthRate: 0.041, populationDensity: 37, urbanizationRate: 0.24
        }
    },
    after: {
        indicators: {
            gdpPerCapita: 1300, giniIndex: 0.62, politicalEventsCount: 12, averageIncome: 200,
            literacyRate: 0.35, lifeExpectancy: 32, birthRate: 0.038, populationDensity: 40, urbanizationRate: 0.28
        }
    }
};

const russianRevolutionEventData = {
    name: 'Russian Revolution',
    eventStartYear: 1917,
    eventEndYear: 1923,
    historicalData: russianRevolutionHistoricalData,
    indicatorA: 0.9, indicatorB: 0.8, indicatorC: 0.7,
    // ADDED: Critical and Stable points observed in this analogue
    criticalPoint: { evei: 0.70, cth: 0.35 }, // EVEI/CTH just before its radical change point
    stableState: { evei: 0.50, cth: 0.30 }   // EVEI/CTH at its subsequent stable state
};


// --- START OF CONCEPTUAL TEST ---
console.log("\n--- STARTING CONCEPTUAL TEST for CMN-RMD-calculator.js ---");
console.log("Using simulated data for 'French Revolution' and analogous historical events.");

let currentEventMetrics;
try {
    // 1. Analyze the current event (French Revolution) to get EVEI and CTH
    const cthAnalysisResult = analyzeEventCTH(
        frenchRevolutionEventData.eventStartYear,
        frenchRevolutionEventData.eventEndYear,
        frenchRevolutionEventData.historicalData
    );

    const eveiAnalysisResult = calculateEVEI(frenchRevolutionEventData);

    // Crucial check: Ensure results are not null
    if (!cthAnalysisResult || !cthAnalysisResult.during || !eveiAnalysisResult) {
        throw new Error("Could not get complete CTH or EVEI analysis for the current event.");
    }

    currentEventMetrics = {
        name: frenchRevolutionEventData.name,
        eveiAnalysis: eveiAnalysisResult, // The complete EVEI result object
        cthAnalysis: cthAnalysisResult,   // The complete CTH result object
        eventStartYear: frenchRevolutionEventData.eventStartYear,
        eventEndYear: frenchRevolutionEventData.eventEndYear
    };
    console.log(`\nSuccessful analysis of '${currentEventMetrics.name}'.`);
    console.log(`  EVEI: ${currentEventMetrics.eveiAnalysis.value.toFixed(4)}`);
    console.log(`  CTH (During): ${currentEventMetrics.cthAnalysis.during.cth.toFixed(4)}`);

} catch (error) {
    console.error("\n--- ERROR DURING MAIN EVENT ANALYSIS ---");
    console.error(`Error message: ${error.message}`);
    process.exit(1); // Exit test if crucial setup fails
}

// 2. Define and process analogous events to get their EVEI and CTH
const analogousEventsRaw = [
    americanRevolutionEventData,
    russianRevolutionEventData,
    // Add more analogous events here to inform the calculation
];

const processedAnalogousEvents = analogousEventsRaw.map(event => {
    try {
        const cthResult = analyzeEventCTH(event.eventStartYear, event.eventEndYear, event.historicalData);
        const eveiResult = calculateEVEI(event);

        if (!cthResult || !cthResult.during || !eveiResult) {
            console.warn(`Skipping analogous event '${event.name}' due to incomplete CTH or EVEI analysis.`);
            return null; // Return null or skip this event
        }

        return {
            name: event.name,
            eveiAnalysis: eveiResult,
            cthAnalysis: cthResult,
            eventStartYear: event.eventStartYear,
            eventEndYear: event.eventEndYear,
            criticalPoint: event.criticalPoint, // Pass through critical points
            stableState: event.stableState      // Pass through stable states
        };
    } catch (error) {
        console.error(`Error processing analogous event '${event.name}': ${error.message}`);
        return null;
    }
}).filter(Boolean); // Filter out any null results

// --- Consolidated CMN-RMD and Reality Variable Calculation ---
if (currentEventMetrics && processedAnalogousEvents.length > 0) {
    try {
        // The calculateCMNRMD function now returns a consolidated result for the current event
        const finalEventAnalysis = calculateCMNRMD(currentEventMetrics, processedAnalogousEvents);

        console.log("\n--- Final Event Analysis Result ---");
        console.log(`Consolidated Analysis for: '${finalEventAnalysis.eventName}'`);
        console.log(`  Consolidated CMN (Proximity to Change Thresholds): ${finalEventAnalysis.consolidatedCMN.toFixed(4)}`);
        console.log(`  Consolidated RMD (Proximity to Stable Outcomes): ${finalEventAnalysis.consolidatedRMD.toFixed(4)}`);
        console.log(`  Reality Variable (Uncertainty/Malleability): ${finalEventAnalysis.realityVariable.toFixed(4)}`);
        console.log("\nNote: These values consolidate information from analogous events for the main event.");

        console.log("\n--- INTERPRETATION GUIDE (Based on Current Model Logic) ---");
        console.log(`  Consolidated CMN: A LOWER value means the current event is, on average, closer to the conditions that led to radical change in the analogous events.`);
        console.log(`  Consolidated RMD: A LOWER value means the current event is, on average, closer to the characteristics of the stable/desired outcomes observed in the analogous events.`);
        console.log(`  Reality Variable: A HIGHER value indicates greater uncertainty or malleability in the event's future trajectory, as the analogous events provide more diverse signals.`);

    } catch (error) {
        console.error("\n--- ERROR DURING CMN-RMD AND REALITY VARIABLE CALCULATION ---");
        console.error(`Error message: ${error.message}`);
    }
} else {
    console.error("\n--- CMN-RMD AND REALITY VARIABLE CALCULATION SKIPPED ---");
    console.error("Missing current event metrics or no valid analogous events found for comparison.");
}

console.log("\n--- END OF CONCEPTUAL TEST ---");
console.log("Note: This test uses simulated data and functions. For real-world calculations, a robust historical database and an 'findAnalogousEvents' function are required.");