// temporal-analysis-fields-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const {
    calculateTriphasicField,
    calculatePentaphasicField,
    calculateSupraphasicField
} = require('../temporal-analysis-fields-calculator'); // Adjust path if necessary

console.log("--- Starting Temporal Analysis Fields Calculator Tests ---");

// --- 1. Example Data for Testing ---

// Example Constructors
const louisXVI = { name: "Louis XVI", type: "FH", EVEI: -0.6, CTH: 0.8 };
const voltaire = { name: "Voltaire", type: "FH", EVEI: 0.8, CTH: -0.9 };
const economicCrisis = { name: "Economic Crisis", type: "FE", EVEI: -0.9, CTH: -0.3 };
const stormingOfBastille = { name: "Storming of the Bastille", type: "FE", EVEI: 0.9, CTH: 0.8, attributes: { scale: 0.9 } }; // Added scale for example
const robespierre = { name: "Robespierre", type: "FH", EVEI: -0.9, CTH: -0.9, attributes: { leadership: 0.9 } }; // Added leadership

// Example Phase Data (simplified for testing)
const phaseBeforeData = {
    name: "Antes",
    period: "1779 - 1788",
    phaseCTH: 0.2, // Low tension
    activeConstructors: [louisXVI, economicCrisis],
    keyEvents: ["Pre-revolutionary tensions"]
};

const phasePreludioData = {
    name: "Preludio",
    period: "1787 - June 1789",
    phaseCTH: 0.35, // Rising tension
    activeConstructors: [voltaire],
    keyEvents: ["Estates-General convocation"]
};

const phaseDuranteData = {
    name: "Durante",
    period: "July 14, 1789",
    phaseCTH: 0.417, // Critical tension
    activeConstructors: [stormingOfBastille],
    keyEvents: ["Storming of the Bastille"]
};

const phaseTransicionData = {
    name: "Transicion",
    period: "July 15, 1789 - 1791",
    phaseCTH: 0.5, // High but shifting tension
    activeConstructors: [], // Example, could have others
    keyEvents: ["Declaration of Rights of Man"]
};

const phaseDespuesData = {
    name: "Despues",
    period: "1792 - 1802",
    phaseCTH: 0.6, // New context
    activeConstructors: [robespierre],
    keyEvents: ["Reign of Terror", "Rise of Napoleon"]
};

// --- 2. Test calculateTriphasicField ---
console.log("\n--- Calculating Triphasic Field (Current Event Example) ---");
const currentEventName = "Global Climate Crisis";
const triphasicField = calculateTriphasicField(
    currentEventName,
    { // Distant Precursor
        name: "Distant Precursor", period: "Industrial Revolution - 1950s", phaseCTH: 0.1,
        activeConstructors: [{ name: "Early Industrialization", type: "FE", EVEI: 0.1, CTH: 0.05 }],
        keyEvents: ["Rise of Fossil Fuels"]
    },
    { // Near Precursor
        name: "Near Precursor", period: "1980s - 2000s", phaseCTH: 0.3,
        activeConstructors: [{ name: "IPCC Reports", type: "FE", EVEI: 0.7, CTH: 0.4 }],
        keyEvents: ["Kyoto Protocol", "Growing scientific consensus"]
    },
    { // Current State
        name: "Current State", period: "2020s - Present", phaseCTH: 0.7,
        activeConstructors: [{ name: "Extreme Weather Events", type: "FE", EVEI: 0.9, CTH: 0.8 }],
        keyEvents: ["Heatwaves", "Floods", "Policy Debates"]
    }
);
console.log(`  Triphasic Field for "${triphasicField.eventName}":`);
console.log(`    Distant Precursor period: ${triphasicField.distantPrecursor.period}`);
console.log(`    Current State CTH: ${triphasicField.currentState.phaseCTH}`);
console.log(`    Current State Key Events: ${triphasicField.currentState.keyEvents.join(', ')}`);


// --- 3. Test calculatePentaphasicField ---
console.log("\n--- Calculating Pentaphasic Field (French Revolution Example) ---");
const frenchRevolutionDataSet = {
    eventName: "French Revolution (1789)",
    phases: [
        phaseBeforeData,
        phasePreludioData,
        phaseDuranteData,
        phaseTransicionData,
        phaseDespuesData
    ]
};

try {
    const pentaphasicField = calculatePentaphasicField(frenchRevolutionDataSet);
    console.log(`  Pentaphasic Field for "${pentaphasicField.eventName}":`);
    console.log(`    Phase 'Antes' period: ${pentaphasicField.antes.period}`);
    console.log(`    Phase 'Durante' CTH: ${pentaphasicField.durante.phaseCTH}`);
    console.log(`    Phase 'Despues' active constructors: ${pentaphasicField.despues.activeConstructors.map(c => c.name).join(', ')}`);

    // Test case for missing phase
    const incompleteDataSet = {
        eventName: "Incomplete Event",
        phases: [phaseBeforeData, phasePreludioData, phaseDuranteData] // Missing Transition and Despues
    };
    try {
        console.log("\n  Attempting to calculate Pentaphasic Field for incomplete data:");
        calculatePentaphasicField(incompleteDataSet);
    } catch (error) {
        console.log(`    Error caught as expected: ${error.message}`);
    }

} catch (error) {
    console.error(`  Error in Pentaphasic Field calculation: ${error.message}`);
}


// --- 4. Test calculateSupraphasicField ---
console.log("\n--- Calculating Supraphasic Field (French Revolution Long-Term Influence) ---");
const supraphasicField = calculateSupraphasicField(
    "French Revolution (1789)",
    [
        "Spread of republican ideals across Europe",
        "Rise of nationalism as a political force",
        "Influence on Latin American independence movements"
    ],
    [
        { name: "Napoleonic Wars", period: "1803-1815" },
        { name: "Revolutions of 1830 and 1848", period: "1830-1848" }
    ],
    ["Nationalism", "Liberalism", "Secularism"]
);
console.log(`  Supraphasic Field for "${supraphasicField.originatingEventName}":`);
console.log(`    Identified RTIs: ${supraphasicField.identifiedRTIs.length}`);
console.log(`    Influenced Events: ${supraphasicField.influencedEvents.map(e => e.name).join(', ')}`);
console.log(`    Influenced Concepts: ${supraphasicField.influencedConcepts.join(', ')}`);

console.log("\n--- All Temporal Analysis Fields Calculator Tests Complete ---");