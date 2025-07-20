// pantemporal-elements-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const {
    calculatePantemporalityIndex,
    identifyPantemporalElement
} = require('../pantemporal-elements-calculator'); // Adjust path if necessary

console.log("--- Starting Pantemporal Elements Calculator Tests ---");

// --- Test Case 1: High Pantemporality (Low Variation) ---
console.log("\n--- Test 1: High Pantemporality Example (Values: 0.70, 0.72, 0.71) ---");
const antes1 = 0.70;
const preludio1 = 0.72;
const durante1 = 0.71;

const ip1 = calculatePantemporalityIndex(antes1, preludio1, durante1);
console.log(`  Calculated IP: ${ip1.toFixed(3)}`);

const result1 = identifyPantemporalElement(antes1, preludio1, durante1);
console.log(`  Is Pantemporal: ${result1.isPantemporal}`);
console.log(`  Standard Deviation (σ): ${result1.sigmaX.toFixed(3)}`);
console.log(`  Mean (X̄): ${result1.meanX.toFixed(3)}`);
console.log(`  Threshold (IP_min): ${result1.threshold}`);

// Assertions for Test 1
console.assert(Math.abs(ip1 - 0.992) < 0.001, "Test 1 IP calculation incorrect");
console.assert(result1.isPantemporal === true, "Test 1 Pantemporal identification incorrect");
console.assert(Math.abs(result1.sigmaX - 0.008) < 0.001, "Test 1 sigmaX calculation incorrect");


// --- Test Case 2: Low Pantemporality (High Variation) ---
console.log("\n--- Test 2: Low Pantemporality Example (Values: 0.2, 0.8, 0.4) ---");
const antes2 = 0.2;
const preludio2 = 0.8;
const durante2 = 0.4;

const ip2 = calculatePantemporalityIndex(antes2, preludio2, durante2);
console.log(`  Calculated IP: ${ip2.toFixed(3)}`);

const result2 = identifyPantemporalElement(antes2, preludio2, durante2);
console.log(`  Is Pantemporal: ${result2.isPantemporal}`);
console.log(`  Standard Deviation (σ): ${result2.sigmaX.toFixed(3)}`);
console.log(`  Mean (X̄): ${result2.meanX.toFixed(3)}`);
console.log(`  Threshold (IP_min): ${result2.threshold}`);

// Assertions for Test 2
console.assert(ip2 < 0.9, "Test 2 IP calculation incorrect (expected < 0.9)");
console.assert(result2.isPantemporal === false, "Test 2 Pantemporal identification incorrect");


// --- Test Case 3: Edge Case (Exactly at Threshold) ---
console.log("\n--- Test 3: Edge Case (IP = 0.9, σ = 0.1) ---");
// Values approximated to yield a standard deviation very close to 0.1
// This exact calculation is a bit tricky with simple numbers, but these values demonstrate the threshold.
const antes3 = 0.377; // Approx value
const preludio3 = 0.5;
const durante3 = 0.623; // Approx value

const ip3 = calculatePantemporalityIndex(antes3, preludio3, durante3);
console.log(`  Calculated IP: ${ip3.toFixed(3)}`);

const result3 = identifyPantemporalElement(antes3, preludio3, durante3, 0.9); // Explicitly pass 0.9
console.log(`  Is Pantemporal: ${result3.isPantemporal}`);
console.log(`  Standard Deviation (σ): ${result3.sigmaX.toFixed(3)}`);
console.log(`  Mean (X̄): ${result3.meanX.toFixed(3)}`);
console.log(`  Threshold (IP_min): ${result3.threshold}`);

// Assertions for Test 3
console.assert(Math.abs(result3.sigmaX - 0.1) < 0.001, "Test 3 sigmaX calculation incorrect for threshold test");
console.assert(result3.isPantemporal === true, "Test 3 Pantemporal identification incorrect for threshold case"); // Should be true if very close to 0.1 sigma

// --- Test Case 4: Invalid Input (Non-numeric values) ---
console.log("\n--- Test 4: Invalid Input (Non-numeric values) ---");
try {
    calculatePantemporalityIndex(0.5, "invalid", 0.7);
    console.log("  Test 4 Failed: Expected an error for non-numeric input.");
} catch (error) {
    console.log(`  Test 4 Passed: Caught expected error: ${error.message}`);
    console.assert(error.message === "All phase values must be numbers for Pantemporality Index calculation.", "Test 4 error message incorrect.");
}


console.log("\n--- All Pantemporal Elements Calculator Tests Complete ---");