// et-calculator-test.js 
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { calculateTemporalEquivalence } = require('../et-calculator'); // Adjust path if ET-calculator.js is elsewhere

console.log("--- Starting ET Calculator Test ---");

// --- Test Case 1: Event with values close to analogs in DB ---
console.log("\n--- Test 1: Current Event Close to Analogs (EVEI=0.8, CTH=0.7) ---");
const currentEvent1 = { EVEI: 0.8, CTH: 0.7 };
const result1 = calculateTemporalEquivalence(currentEvent1);
console.log(`ET: ${result1.ET.toFixed(0)}%`);
console.log(`Analogous events found: ${result1.numAnalogous}`);
console.log(result1.interpretation);

// --- Test Case 2: Event that finds analogs with specific low EVEI/CTH ---
console.log("\n--- Test 2: Current Event with Low Values (EVEI=0.1, CTH=0.1) ---");
const currentEvent2 = { EVEI: 0.1, CTH: 0.1 };
const result2 = calculateTemporalEquivalence(currentEvent2);
console.log(`ET: ${result2.ET.toFixed(0)}%`);
console.log(`Analogous events found: ${result2.numAnalogous}`);
console.log(result2.interpretation);

// --- Test Case 3: Filtering by event type ---
console.log("\n--- Test 3: Current Event with Type Filter (EVEI=0.8, CTH=0.7, Type='war') ---");
const currentEvent3 = { EVEI: 0.8, CTH: 0.7 }; // Type is used in filter option, not in event metrics
const result3 = calculateTemporalEquivalence(currentEvent3, { eventTypeFilter: 'war' });
console.log(`ET: ${result3.ET.toFixed(0)}%`);
console.log(`Analogous events found: ${result3.numAnalogous}`);
console.log(result3.interpretation);

// --- Test Case 4: Event with moderate values, expecting moderate disparity ---
console.log("\n--- Test 4: Current Event with Moderate Values (EVEI=0.5, CTH=0.5) ---");
const currentEvent4 = { EVEI: 0.5, CTH: 0.5 };
const result4 = calculateTemporalEquivalence(currentEvent4);
console.log(`ET: ${result4.ET.toFixed(0)}%`);
console.log(`Analogous events found: ${result4.numAnalogous}`);
console.log(result4.interpretation);


console.log("\n--- All ET Calculator Tests Complete ---");