// pattern10x10-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { generatePatternGrid, normalize } = require('../pattern10x10-calculator');

console.log("--- Starting Pattern10x10 Calculator Tests ---");

// --- Test Case 1: Event with High Values ---
console.log("\n--- Test 1: Event A (High Values Scenario) ---");
const eventA_metrics = {
    EVEI: 0.9,     // Muy alta significación
    CTH: 0.85,     // Alta coherencia
    deltaCTH: 0.3, // Aumento significativo de coherencia
    IEC: 0.95,     // Contexto muy estable
    PPI: 0.7,      // Potencial de impacto alto
    VVC: 0.1,      // Muy poca variación contextual
    MCE: 0.6,      // Complejidad media
    CTH_Antes: 0.7,
    CTH_Preambulo: 0.78,
    CTH_Durante: 0.85,
    CTH_Transicion: 0.88,
    CTH_Despues: 0.9
};

const reportA = generatePatternGrid(eventA_metrics);

console.log("Grid Output (Visual Check):");
console.log(reportA.grid);
console.log("Summary Output:");
console.log(reportA.summary);
console.log("Interpretation Output:");
console.log(reportA.interpretation);
console.log("Initial Events Output:");
console.log(reportA.initialEvents);

// Basic Assertions for calculated values (you'd add more robust ones in a real testing framework)
// Check if normalized values are within [0,1]
console.assert(reportA.normalizedValues[0][0] >= 0 && reportA.normalizedValues[0][0] <= 1, "Test 1 EVEI normalized value out of range");
// Check if interpretation matches expected for high EVEI
console.assert(reportA.interpretation.includes("EVEI is high"), "Test 1 Interpretation for EVEI is incorrect");
// Check if deltaCTH interpretation matches expected for positive deltaCTH
console.assert(reportA.interpretation.includes("ΔCTH is positive"), "Test 1 Interpretation for deltaCTH is incorrect");

// --- Test Case 2: Event with Low Values ---
console.log("\n--- Test 2: Event B (Low Values Scenario) ---");
const eventB_metrics = {
    EVEI: 0.1,     // Baja significación
    CTH: 0.2,      // Baja coherencia
    deltaCTH: -0.4, // Disminución significativa de coherencia
    IEC: 0.15,     // Contexto inestable
    PPI: 0.2,      // Potencial de impacto bajo
    VVC: 0.8,      // Alta variación contextual
    MCE: 0.9,      // Alta complejidad
    CTH_Antes: 0.25,
    CTH_Preambulo: 0.2,
    CTH_Durante: 0.1,
    CTH_Transicion: 0.18,
    CTH_Despues: 0.22
};

const reportB = generatePatternGrid(eventB_metrics);

console.log("Grid Output (Visual Check):");
console.log(reportB.grid);
console.log("Summary Output:");
console.log(reportB.summary);
console.log("Interpretation Output:");
console.log(reportB.interpretation);
console.log("Initial Events Output:");
console.log(reportB.initialEvents);

// Basic Assertions for calculated values
console.assert(reportB.normalizedValues[0][0] >= 0 && reportB.normalizedValues[0][0] <= 1, "Test 2 EVEI normalized value out of range");
// Check if interpretation matches expected for low EVEI
console.assert(reportB.interpretation.includes("EVEI is low"), "Test 2 Interpretation for EVEI is incorrect");
// Check if deltaCTH interpretation matches expected for negative deltaCTH
console.assert(reportB.interpretation.includes("ΔCTH is negative"), "Test 2 Interpretation for deltaCTH is incorrect");

// --- Test Case 3: Event with Moderate Values ---
console.log("\n--- Test 3: Event C (Moderate Values Scenario) ---");
const eventC_metrics = {
    EVEI: 0.5,
    CTH: 0.5,
    deltaCTH: 0.05, // Relativamente estable
    IEC: 0.5,
    PPI: 0.5,
    VVC: 0.5,
    MCE: 0.5,
    CTH_Antes: 0.5,
    CTH_Preambulo: 0.5,
    CTH_Durante: 0.5,
    CTH_Transicion: 0.5,
    CTH_Despues: 0.5
};

const reportC = generatePatternGrid(eventC_metrics);

console.log("Grid Output (Visual Check):");
console.log(reportC.grid);
console.log("Summary Output:");
console.log(reportC.summary);
console.log("Interpretation Output:");
console.log(reportC.interpretation);
console.log("Initial Events Output:");
console.log(reportC.initialEvents);

// Basic Assertions for calculated values
console.assert(reportC.normalizedValues[0][0] >= 0 && reportC.normalizedValues[0][0] <= 1, "Test 3 EVEI normalized value out of range");
// Check if interpretation matches expected for moderate EVEI
console.assert(reportC.interpretation.includes("EVEI is moderate"), "Test 3 Interpretation for EVEI is incorrect");
// Check if deltaCTH interpretation matches expected for stable deltaCTH
console.assert(reportC.interpretation.includes("ΔCTH is relatively stable"), "Test 3 Interpretation for deltaCTH is incorrect");


console.log("\n--- All Pattern10x10 Calculator Tests Complete ---");