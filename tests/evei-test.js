// evei-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Import the calculateEVEI function
const { calculateEVEI } = require('../evei-calculator'); // Asegúrate de que la ruta sea correcta

console.log("--- Starting EVEI Calculator Tests (with CTH component) ---");

// Test Case 1: Revolución Francesa (Ejemplo 01)
const frenchRevolutionData = {
    name: 'Revolución Francesa',
    CTHIndex: 0.4,   // Estimado en tu ejemplo
    indicatorA: 0.9,
    indicatorB: 0.4,
    indicatorC: 0.95
};
// Cálculo esperado según tu ejemplo: EVEI = (0.4*0.4 + 0.2*0.9 + 0.25*0.4 + 0.35*0.95) / 1.2 = (0.16 + 0.18 + 0.10 + 0.3325) / 1.2 = 0.7725 / 1.2 = 0.64375
try {
    const results = calculateEVEI(frenchRevolutionData);
    console.log(`\n--- Test Case 1: ${frenchRevolutionData.name} ---`);
    console.log(`  CTH: ${frenchRevolutionData.CTHIndex}, A: ${frenchRevolutionData.indicatorA}, B: ${frenchRevolutionData.indicatorB}, C: ${frenchRevolutionData.indicatorC}`);
    console.log(`  Calculated EVEI: ${results.value.toFixed(4)}`);
    console.log(`  Interpretation: ${results.interpretation}`);
    console.log(`  Uncertainty Range: ${results.uncertaintyRange.lower.toFixed(4)} - ${results.uncertaintyRange.upper.toFixed(4)}`);
    if (Math.abs(results.value - 0.6438) < 0.0001) { // Redondeando a 4 decimales
        console.log("  ✅ Expected: ~0.6438 (passed)");
    } else {
        console.log(`  ❌ Expected: ~0.6438, Got: ${results.value.toFixed(4)} (failed)`);
    }
} catch (error) {
    console.error(`\nTest Case 1 Failed for ${frenchRevolutionData.name}:`, error.message);
}

// Test Case 2: Lanzamiento del iPhone (Ejemplo 02)
const iphoneLaunchData = {
    name: 'Lanzamiento del iPhone',
    CTHIndex: 0.7,   // Estimado en tu ejemplo
    indicatorA: 0.85,
    indicatorB: 0.6,
    indicatorC: 0.98
};
// Cálculo esperado según tu ejemplo: EVEI = (0.4*0.7 + 0.2*0.85 + 0.25*0.6 + 0.35*0.98) / 1.2 = (0.28 + 0.17 + 0.15 + 0.343) / 1.2 = 0.943 / 1.2 = 0.785833...
try {
    const results = calculateEVEI(iphoneLaunchData);
    console.log(`\n--- Test Case 2: ${iphoneLaunchData.name} ---`);
    console.log(`  CTH: ${iphoneLaunchData.CTHIndex}, A: ${iphoneLaunchData.indicatorA}, B: ${iphoneLaunchData.indicatorB}, C: ${iphoneLaunchData.indicatorC}`);
    console.log(`  Calculated EVEI: ${results.value.toFixed(4)}`);
    console.log(`  Interpretation: ${results.interpretation}`);
    console.log(`  Uncertainty Range: ${results.uncertaintyRange.lower.toFixed(4)} - ${results.uncertaintyRange.upper.toFixed(4)}`);
    if (Math.abs(results.value - 0.7858) < 0.0001) {
        console.log("  ✅ Expected: ~0.7858 (passed)");
    } else {
        console.log(`  ❌ Expected: ~0.7858, Got: ${results.value.toFixed(4)} (failed)`);
    }
} catch (error) {
    console.error(`\nTest Case 2 Failed for ${iphoneLaunchData.name}:`, error.message);
}

// Test Case 3: Invención de la Imprenta (Ejemplo 03)
const printingPressData = {
    name: 'Invención de la Imprenta',
    CTHIndex: 0.45,  // Estimado en tu ejemplo
    indicatorA: 0.75,
    indicatorB: 0.6,
    indicatorC: 0.99
};
// Cálculo esperado según tu ejemplo: EVEI = (0.4*0.45 + 0.2*0.75 + 0.25*0.6 + 0.35*0.99) / 1.2 = (0.18 + 0.15 + 0.15 + 0.3465) / 1.2 = 0.8265 / 1.2 = 0.68875
try {
    const results = calculateEVEI(printingPressData);
    console.log(`\n--- Test Case 3: ${printingPressData.name} ---`);
    console.log(`  CTH: ${printingPressData.CTHIndex}, A: ${printingPressData.indicatorA}, B: ${printingPressData.indicatorB}, C: ${printingPressData.indicatorC}`);
    console.log(`  Calculated EVEI: ${results.value.toFixed(4)}`);
    console.log(`  Interpretation: ${results.interpretation}`);
    console.log(`  Uncertainty Range: ${results.uncertaintyRange.lower.toFixed(4)} - ${results.uncertaintyRange.upper.toFixed(4)}`);
    if (Math.abs(results.value - 0.6888) < 0.0001) {
        console.log("  ✅ Expected: ~0.6888 (passed)");
    } else {
        console.log(`  ❌ Expected: ~0.6888, Got: ${results.value.toFixed(4)} (failed)`);
    }
} catch (error) {
    console.error(`\nTest Case 3 Failed for ${printingPressData.name}:`, error.message);
}

console.log("\n--- All EVEI Calculator Tests (with CTH component) Complete ---");