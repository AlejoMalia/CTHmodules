// pattern10x10-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { generatePatternGrid } = require('../pattern10x10-calculator');
const { generateSimilarityReport } = require('../pattern10x10-calculate-similarity');

console.log("--- Starting Pattern Grid Generation and Similarity Calculation ---");

// --- Datos de ejemplo para el Evento A ---
const eventA_metrics = {
    EVEI: 0.75, // Alta significación
    CTH: 0.8,   // Alta coherencia
    deltaCTH: 0.1, // Ligero aumento de coherencia
    IEC: 0.9,   // Contexto muy estable
    PPI: 0.6,   // Potencial de impacto moderado
    VVC: 0.2,   // Poca variación contextual
    MCE: 0.5,   // Complejidad media
    CTH_Antes: 0.7,
    CTH_Preambulo: 0.75,
    CTH_Durante: 0.8,
    CTH_Transicion: 0.78,
    CTH_Despues: 0.82
};

// --- Generar la cuadrícula para el Evento A ---
console.log("\n--- Pattern Grid for Event A ---");
const eventA_report = generatePatternGrid(eventA_metrics);
console.log(eventA_report.grid);
console.log(eventA_report.summary);
console.log(eventA_report.interpretation);
console.log(eventA_report.initialEvents);


// --- Datos de ejemplo para el Evento B (para comparación) ---
const eventB_metrics = {
    EVEI: 0.2,  // Baja significación
    CTH: 0.4,   // Baja coherencia
    deltaCTH: -0.3, // Disminución de coherencia
    IEC: 0.3,   // Contexto inestable
    PPI: 0.8,   // Alto potencial de impacto (pese a baja coherencia)
    VVC: 0.7,   // Alta variación contextual
    MCE: 0.9,   // Muy alta complejidad
    CTH_Antes: 0.3,
    CTH_Preambulo: 0.35,
    CTH_Durante: 0.4,
    CTH_Transicion: 0.45,
    CTH_Despues: 0.5
};

// --- Generar la cuadrícula para el Evento B (opcional, solo para verla) ---
console.log("\n--- Pattern Grid for Event B ---");
const eventB_report = generatePatternGrid(eventB_metrics);
console.log(eventB_report.grid);
console.log(eventB_report.summary);
// ... y así sucesivamente si quieres ver el informe completo de B


// --- Calcular y mostrar la similitud entre Evento A y Evento B ---
console.log("\n--- Comparing Event A and Event B ---");
const similarityReport = generateSimilarityReport(eventA_report.normalizedValues, eventB_report.normalizedValues);
console.log(similarityReport);

console.log("\n--- All Operations Complete ---");