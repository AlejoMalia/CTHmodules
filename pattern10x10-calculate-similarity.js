// pattern10x10-calculate-similarity.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// Importación para colores ANSI en la terminal
const chalk = require('chalk');

/**
 * Calcula la diferencia absoluta celda por celda entre dos cuadrículas normalizadas.
 * Asume que ambas cuadrículas tienen la misma estructura (10x10).
 * @param {number[][]} gridA_normalizedValues - Matriz 10x10 de valores normalizados del Evento A.
 * @param {number[][]} gridB_normalizedValues - Matriz 10x10 de valores normalizados del Evento B.
 * @returns {number[][]} Matriz 10x10 de diferencias absolutas [0, 1].
 */
function calculateCellDifferences(gridA_normalizedValues, gridB_normalizedValues) {
    const differences = [];
    for (let i = 0; i < 10; i++) {
        const rowDiffs = [];
        for (let j = 0; j < 10; j++) {
            const valA = gridA_normalizedValues[i][j];
            const valB = gridB_normalizedValues[i][j];
            rowDiffs.push(Math.abs(valA - valB));
        }
        differences.push(rowDiffs);
    }
    return differences;
}

/**
 * Calcula el porcentaje de similitud global entre dos cuadrículas.
 * Similitud Global (%) = 100 * (1 - (∑ Diferencia_i,j / Número total de celdas))
 * @param {number[][]} cellDifferencesMatrix - Matriz 10x10 de diferencias absolutas por celda.
 * @param {number} totalCells - Número total de celdas en la cuadrícula (por defecto 100 para 10x10).
 * @returns {number} Porcentaje de similitud global [0, 100].
 */
function calculateGlobalSimilarity(cellDifferencesMatrix, totalCells = 100) {
    let sumDifferences = 0;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            sumDifferences += cellDifferencesMatrix[i][j];
        }
    }
    return 100 * (1 - (sumDifferences / totalCells));
}

/**
 * Genera una escala de colores para representar la similitud/diferencia.
 * Verde oscuro (diferencia ~ 0) a Rojo oscuro (diferencia ~ 1).
 * @param {number} differenceValue - Valor de diferencia [0, 1].
 * @returns {string} Código de color ANSI para el fondo de la celda.
 */
function interpolateSimilarityColor(differenceValue) {
    // 0 = verde (alta similitud), 1 = rojo (baja similitud)
    const r = Math.round(differenceValue * 255);
    const g = Math.round((1 - differenceValue) * 255);
    const b = 0; // Mantener el azul bajo para un espectro rojo-verde

    return chalk.bgRgb(r, g, b)('  '); // Dos espacios para hacer la celda visible
}

/**
 * Genera una representación visual de la matriz de similitud y el porcentaje global.
 * @param {number[][]} gridA_normalizedValues - Valores normalizados del Evento A.
 * @param {number[][]} gridB_normalizedValues - Valores normalizados del Evento B.
 * @returns {string} La cadena de texto con la representación visual de la similitud.
 */
function generateSimilarityReport(gridA_normalizedValues, gridB_normalizedValues) {
    const cellDifferences = calculateCellDifferences(gridA_normalizedValues, gridB_normalizedValues);
    const globalSimilarity = calculateGlobalSimilarity(cellDifferences);

    let reportOutput = '\n--- Similarity Report ---\n';
    reportOutput += `Global Similarity: ${chalk.bold(globalSimilarity.toFixed(2))}% \n\n`;

    reportOutput += 'Similarity Matrix (Green = High Similarity, Red = Low Similarity):\n';
    for (let i = 0; i < 10; i++) {
        let row = '';
        for (let j = 0; j < 10; j++) {
            row += interpolateSimilarityColor(cellDifferences[i][j]);
        }
        reportOutput += row + '\n';
    }

    return reportOutput;
}

module.exports = {
    calculateCellDifferences,
    calculateGlobalSimilarity,
    generateSimilarityReport
};