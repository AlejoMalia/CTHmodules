// cth-analysis-module-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import necessary functions and objects from the main module
const { analyzeEventCTH } = require('../cth-analysis-module'); // Using require for Node.js CommonJS modules

// --- USAGE EXAMPLE ---

// Years of the central event (e.g., French Revolution start and end phase)
const eventStartYear = 1789; // Start of the main event (e.g., Taking of the Bastille)
const eventEndYear = 1799;   // End of the main event (e.g., Napoleon's coup ending the Revolution)

// Initial historical data for the event.
// Some data is left as `undefined` or `null` to test inference across 5 periods.
const initialEventData = {
  // 'before' period: e.g., 1777-1787 (10 years before prelude which starts 2 years before 1789)
  before: {
    indicators: {
      gdpPerCapita: undefined, // Missing, to be inferred
      giniIndex: 0.58, // High inequality
      politicalEventsCount: undefined, // Missing, to be inferred
      averageIncome: 140,
      literacyRate: 0.18,
      lifeExpectancy: 37,
      birthRate: 0.036,
      populationDensity: 22,
      urbanizationRate: 0.18,
    },
  },
  // 'prelude' period: e.g., 1788 (2 years immediately before 1789)
  prelude: {
    indicators: {
      gdpPerCapita: 1600, // Pre-revolution economic state
      giniIndex: 0.55,
      politicalEventsCount: 2, // Early unrest
      averageIncome: undefined, // Missing, to be inferred
      literacyRate: 0.20,
      lifeExpectancy: 38,
      birthRate: 0.035,
      populationDensity: 25,
      urbanizationRate: 0.20,
    },
  },
  // 'during' period: 1789-1799 (The duration of the main event)
  during: {
    indicators: {
      gdpPerCapita: 1800, // Growth during early industrialization/revolution
      giniIndex: 0.52, // Slightly improved but still high, maybe volatile
      politicalEventsCount: 5, // Revolutionary events peak
      averageIncome: 250,
      literacyRate: 0.30,
      lifeExpectancy: 40,
      birthRate: 0.030,
      populationDensity: 30,
      urbanizationRate: 0.25,
    },
  },
  // 'transition' period: e.g., 1800 (2 years immediately after 1799)
  transition: {
    indicators: {
      gdpPerCapita: 2000,
      giniIndex: 0.49, // Post-revolution adjustments
      politicalEventsCount: 3, // Napoleonic consolidation
      averageIncome: 300,
      literacyRate: undefined, // Missing, to be inferred
      lifeExpectancy: 41,
      birthRate: 0.029,
      populationDensity: 32,
      urbanizationRate: 0.28,
    },
  },
  // 'after' period: e.g., 1802-1812 (10 years after transition which ends 2 years after 1799)
  after: {
    indicators: {
      gdpPerCapita: 2500,
      giniIndex: undefined, // Missing, to be inferred
      politicalEventsCount: 4,
      averageIncome: 400,
      literacyRate: 0.35,
      lifeExpectancy: 42,
      birthRate: 0.028,
      populationDensity: 35,
      urbanizationRate: 0.30,
    },
  },
};

console.log("--- STARTING CTH ANALYSIS ---");
console.log(`Event Start Year: ${eventStartYear}`);
console.log(`Event End Year: ${eventEndYear}`);

console.log("\n--- INITIAL DATA (Before Inference) ---");
const allPeriods = ['before', 'prelude', 'during', 'transition', 'after'];
allPeriods.forEach(period => {
  logPeriodData(initialEventData[period], period, true);
});

// Perform the complete analysis, including inference
// Call analyzeEventCTH with both start and end years
const analyzedData = analyzeEventCTH(eventStartYear, eventEndYear, initialEventData);

console.log("\n--- CTH ANALYSIS RESULTS (After Inference) ---");
allPeriods.forEach(period => {
  logPeriodData(analyzedData[period], period, false);
});

console.log("\n--- DELTA CTH ANALYSIS ---");
// Calculate Delta CTH between adjacent periods
for (let i = 0; i < allPeriods.length - 1; i++) {
  const p1 = allPeriods[i];
  const p2 = allPeriods[i + 1];
  if (analyzedData[p1].cth !== null && analyzedData[p2].cth !== null) {
    const delta = analyzedData[p2].cth - analyzedData[p1].cth;
    console.log(`ΔCTH (${p1} -> ${p2}): ${delta.toFixed(4)}`);
  } else {
    console.log(`Could not calculate ΔCTH (${p1} -> ${p2}) because one or both CTH values are null.`);
  }
}

// Total Delta CTH (Before -> After)
if (analyzedData.before.cth !== null && analyzedData.before.cth !== undefined &&
    analyzedData.after.cth !== null && analyzedData.after.cth !== undefined) {
    const deltaTotal = analyzedData.after.cth - analyzedData.before.cth;
    console.log(`ΔCTH (Total - Before -> After): ${deltaTotal.toFixed(4)}`);
} else {
    console.log("Could not calculate ΔCTH (Total) because 'before' or 'after' CTH is null.");
}


console.log("\n--- END OF CTH ANALYSIS ---");


// --- UTILITY FUNCTIONS FOR LOGGING ---

function logPeriodData(data, label, showInitial = false) {
  console.log(`\nPeriod: ${label}`);
  if (!showInitial && data.cth !== undefined && data.cth !== null) {
    console.log(`  CTH: ${data.cth.toFixed(4)}`);
  } else if (showInitial) {
    // For initial data, CTH might not have been calculated yet or might be partial
    console.log(`  CTH (pre-inference): ${data.cth ? data.cth.toFixed(4) : 'N/A (calculated after inference)'}`);
  }

  console.log("  Indicators:");
  for (const key in data.indicators) {
    const value = data.indicators[key];
    if (value !== undefined && value !== null) { // Check for null as well
      console.log(`    ${key}: ${value.toFixed(3)}`);
    } else {
      console.log(`    ${key}: UNDEFINED/NULL (Will be filled or inferred)`);
    }
  }
}