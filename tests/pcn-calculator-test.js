// pcn-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { calculateIPD, calculatePCN, IPD_MAX_POSSIBLE } = require('../pcn-calculator');

console.log("--- Starting PCN Calculator Tests ---");

// Helper function for floating-point comparisons
function assertApproxEqual(actual, expected, message, tolerance = 0.01) {
    if (Math.abs(actual - expected) > tolerance) {
        console.error(`Assertion Failed: ${message} - Expected ${expected.toFixed(3)}, Got ${actual.toFixed(3)}`);
        process.exit(1);
    } else {
        console.log(`  ✓ ${message}`);
    }
}

// Helper function for integer comparisons
function assertIntEqual(actual, expected, message) {
    if (actual !== expected) {
        console.error(`Assertion Failed: ${message} - Expected ${expected}, Got ${actual}`);
        process.exit(1);
    } else {
        console.log(`  ✓ ${message}`);
    }
}

// Helper function to validate metrics
function validateMetrics(metrics) {
    const { PPI, IEC, VVC } = metrics;
    if (typeof PPI !== 'number' || PPI < 0 || PPI > 1 ||
        typeof IEC !== 'number' || IEC < 0 || IEC > 1 ||
        typeof VVC !== 'number' || VVC < 0 || VVC > 1) {
        throw new Error('Metrics must be numbers between 0 and 1');
    }
}

// --- Test Case 1: High PCN Scenario ---
console.log("\n--- Test 1: High PCN Scenario ---");
const metrics1 = { PPI: 0.9, IEC: 0.1, VVC: 0.8 };
try {
    validateMetrics(metrics1);
    const result1 = calculatePCN(metrics1);
    const expectedIPD1 = (0.5 * 0.9) + (0.25 * Math.abs(0.1 - 0.5)) + (0.25 * 0.8); // 0.75
    const expectedPCN1 = (expectedIPD1 / IPD_MAX_POSSIBLE) * 100; // 85.714...

    console.log(`  Input: PPI=${metrics1.PPI}, IEC=${metrics1.IEC}, VVC=${metrics1.VVC}`);
    console.log(`  Calculated IPD: ${result1.IPD.toFixed(3)}`);
    console.log(`  PCN: ${result1.PCN.toFixed(0)}%`);
    console.log(`  Interpretation: ${result1.interpretation}`);

    assertApproxEqual(result1.IPD, expectedIPD1, "Test 1 IPD calculation");
    assertIntEqual(parseInt(result1.PCN.toFixed(0)), parseInt(expectedPCN1.toFixed(0)), "Test 1 PCN percentage");
} catch (error) {
    console.error(`  Error in Test 1: ${error.message}`);
    process.exit(1);
}

// --- Test Case 2: Low PCN Scenario ---
console.log("\n--- Test 2: Low PCN Scenario ---");
const metrics2 = { PPI: 0.1, IEC: 0.5, VVC: 0.1 };
try {
    validateMetrics(metrics2);
    const result2 = calculatePCN(metrics2);
    const expectedIPD2 = (0.5 * 0.1) + (0.25 * Math.abs(0.5 - 0.5)) + (0.25 * 0.1); // 0.075
    const expectedPCN2 = (expectedIPD2 / IPD_MAX_POSSIBLE) * 100; // 8.571...

    console.log(`  Input: PPI=${metrics2.PPI}, IEC=${metrics2.IEC}, VVC=${metrics2.VVC}`);
    console.log(`  Calculated IPD: ${result2.IPD.toFixed(3)}`);
    console.log(`  PCN: ${result2.PCN.toFixed(0)}%`);
    console.log(`  Interpretation: ${result2.interpretation}`);

    assertApproxEqual(result2.IPD, expectedIPD2, "Test 2 IPD calculation");
    assertIntEqual(parseInt(result2.PCN.toFixed(0)), parseInt(expectedPCN2.toFixed(0)), "Test 2 PCN percentage");
} catch (error) {
    console.error(`  Error in Test 2: ${error.message}`);
    process.exit(1);
}

// --- Test Case 3: Moderate PCN Scenario ---
console.log("\n--- Test 3: Moderate PCN Scenario ---");
const metrics3 = { PPI: 0.6, IEC: 0.8, VVC: 0.5 };
try {
    validateMetrics(metrics3);
    const result3 = calculatePCN(metrics3);
    const expectedIPD3 = (0.5 * 0.6) + (0.25 * Math.abs(0.8 - 0.5)) + (0.25 * 0.5); // 0.5
    const expectedPCN3 = (expectedIPD3 / IPD_MAX_POSSIBLE) * 100; // 57.142...

    console.log(`  Input: PPI=${metrics3.PPI}, IEC=${metrics3.IEC}, VVC=${metrics3.VVC}`);
    console.log(`  Calculated IPD: ${result3.IPD.toFixed(3)}`);
    console.log(`  PCN: ${result3.PCN.toFixed(0)}%`);
    console.log(`  Interpretation: ${result3.interpretation}`);

    assertApproxEqual(result3.IPD, expectedIPD3, "Test 3 IPD calculation");
    assertIntEqual(parseInt(result3.PCN.toFixed(0)), parseInt(expectedPCN3.toFixed(0)), "Test 3 PCN percentage");
} catch (error) {
    console.error(`  Error in Test 3: ${error.message}`);
    process.exit(1);
}

// --- Test Case 4: Extreme Max PCN Scenario (IEC=0) ---
console.log("\n--- Test 4: Extreme Max PCN Scenario (IEC=0) ---");
const metrics4 = { PPI: 1.0, IEC: 0.0, VVC: 1.0 };
try {
    validateMetrics(metrics4);
    const result4 = calculatePCN(metrics4);
    const expectedIPD4 = (0.5 * 1.0) + (0.25 * Math.abs(0.0 - 0.5)) + (0.25 * 1.0); // 0.875
    const expectedPCN4 = (expectedIPD4 / IPD_MAX_POSSIBLE) * 100; // 100

    console.log(`  Input: PPI=${metrics4.PPI}, IEC=${metrics4.IEC}, VVC=${metrics4.VVC}`);
    console.log(`  Calculated IPD: ${result4.IPD.toFixed(3)}`);
    console.log(`  PCN: ${result4.PCN.toFixed(0)}%`);
    console.log(`  Interpretation: ${result4.interpretation}`);

    assertApproxEqual(result4.IPD, expectedIPD4, "Test 4 IPD calculation");
    assertIntEqual(parseInt(result4.PCN.toFixed(0)), parseInt(expectedPCN4.toFixed(0)), "Test 4 PCN percentage");
} catch (error) {
    console.error(`  Error in Test 4: ${error.message}`);
    process.exit(1);
}

// --- Test Case 5: Extreme Max PCN Scenario (IEC=1) ---
console.log("\n--- Test 5: Extreme Max PCN Scenario (IEC=1) ---");
const metrics5 = { PPI: 1.0, IEC: 1.0, VVC: 1.0 };
try {
    validateMetrics(metrics5);
    const result5 = calculatePCN(metrics5);
    const expectedIPD5 = (0.5 * 1.0) + (0.25 * Math.abs(1.0 - 0.5)) + (0.25 * 1.0); // 0.875
    const expectedPCN5 = (expectedIPD5 / IPD_MAX_POSSIBLE) * 100; // 100

    console.log(`  Input: PPI=${metrics5.PPI}, IEC=${metrics5.IEC}, VVC=${metrics5.VVC}`);
    console.log(`  Calculated IPD: ${result5.IPD.toFixed(3)}`);
    console.log(`  PCN: ${result5.PCN.toFixed(0)}%`);
    console.log(`  Interpretation: ${result5.interpretation}`);

    assertApproxEqual(result5.IPD, expectedIPD5, "Test 5 IPD calculation");
    assertIntEqual(parseInt(result5.PCN.toFixed(0)), parseInt(expectedPCN5.toFixed(0)), "Test 5 PCN percentage");
} catch (error) {
    console.error(`  Error in Test 5: ${error.message}`);
    process.exit(1);
}

console.log("\n--- All PCN Calculator Tests Complete ---");