// pattern10x10-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

// npm install chalk
const chalk = require('chalk');

/**
 * @typedef {object} MetricsData
 * @property {number} EVEI - Estructura de Valoración Eventual Integral [0, 1]
 * @property {number} CTH - Índice de Coherencia Temática Histórica [0, 1]
 * @property {number} deltaCTH - Variación de CTH [-0.5, 0.5]
 * @property {number} IEC - Índice de Estabilidad Contextual [0, 1]
 * @property {number} PPI - Proyección Potencial de Impacto [0, 1]
 * @property {number} VVC - Valence de Variación Contextual [0, 1]
 * @property {number} MCE - Mecánica de Complejidad Eventual [0, 1]
 * @property {number} CTH_Antes - CTH de la fase 'Antes' [0, 1]
 * @property {number} CTH_Preambulo - CTH de la fase 'Preámbulo' [0, 1]
 * @property {number} CTH_Durante - CTH de la fase 'Durante' [0, 1]
 * @property {number} CTH_Transicion - CTH de la fase 'Transicion' [0, 1]
 * @property {number} CTH_Despues - CTH de la fase 'Despues' [0, 1]
 */

/**
 * Mapeo de la cuadrícula 10x10 a métricas o fases.
 * Cada elemento es una clave que se buscará en 'normalizedData'.
 * 'EMPTY' indica una celda vacía o de relleno.
 */
const GRID_LAYOUT_MAP = [
    ['EVEI', 'EVEI', 'CTH', 'CTH', 'CTH_Antes', 'CTH_Preambulo', 'CTH_Durante', 'CTH_Transicion', 'CTH_Despues', 'deltaCTH'],
    ['EVEI', 'EVEI', 'CTH', 'CTH', 'IEC', 'IEC', 'PPI', 'PPI', 'VVC', 'MCE'],
    ['EVEI', 'EVEI', 'CTH', 'CTH', 'IEC', 'IEC', 'PPI', 'PPI', 'VVC', 'MCE'],
    ['CTH_Antes', 'CTH_Preambulo', 'CTH_Durante', 'CTH_Transicion', 'CTH_Despues', 'deltaCTH', 'deltaCTH', 'MCE', 'MCE', 'VVC'],
    ['IEC', 'IEC', 'PPI', 'PPI', 'VVC', 'VVC', 'MCE', 'MCE', 'EVEI', 'CTH'],
    ['VVC', 'VVC', 'MCE', 'MCE', 'EVEI', 'EVEI', 'CTH', 'CTH', 'IEC', 'IEC'],
    ['PPI', 'PPI', 'CTH_Antes', 'CTH_Preambulo', 'CTH_Durante', 'CTH_Transicion', 'CTH_Despues', 'deltaCTH', 'deltaCTH', 'VVC'],
    ['deltaCTH', 'deltaCTH', 'IEC', 'IEC', 'PPI', 'PPI', 'VVC', 'VVC', 'MCE', 'MCE'],
    ['CTH', 'CTH', 'EVEI', 'EVEI', 'CTH_Antes', 'CTH_Preambulo', 'CTH_Durante', 'CTH_Transicion', 'CTH_Despues', 'deltaCTH'],
    ['MCE', 'MCE', 'VVC', 'VVC', 'IEC', 'IEC', 'PPI', 'PPI', 'EVEI', 'CTH']
];

/**
 * Normaliza un valor a un rango [0, 1].
 * @param {number} value - Valor crudo.
 * @param {number} min - Valor mínimo esperado.
 * @param {number} max - Valor máximo esperado.
 * @returns {number} Valor normalizado.
 */
function normalize(value, min, max) {
    if (min === max) return 0.5; // Evitar división por cero
    return (value - min) / (max - min);
}

/**
 * Genera un objeto de estilo chalk.bgRgb() para una escala de colores tipo 'Plasma' (cálida).
 * De púrpura a amarillo.
 * @param {number} normalizedValue - Valor normalizado entre 0 y 1.
 * @returns {function} Un método chalk para aplicar el color de fondo.
 */
function getPlasmaColorFunction(normalizedValue) {
    const r = Math.round(Math.min(255, normalizedValue * 255 * 1.5));
    const g = Math.round(Math.min(255, normalizedValue * 255 * 1.2));
    const b = Math.round(Math.max(0, 255 - normalizedValue * 255 * 1.5));
    return chalk.bgRgb(r, g, b);
}

/**
 * Genera un objeto de estilo chalk.bgRgb() para una escala de colores tipo 'Cool' (fría).
 * De verde/rojo (negativos) a azul (positivos), pasando por el centro.
 * @param {number} normalizedValue - Valor normalizado entre 0 y 1.
 * @returns {function} Un método chalk para aplicar el color de fondo.
 */
function getCoolColorFunction(normalizedValue) {
    let r, g, b;
    if (normalizedValue < 0.5) {
        r = Math.round(255 * (1 - normalizedValue * 2));
        g = Math.round(255 * (normalizedValue * 2));
        b = 0;
    } else {
        r = 0;
        g = Math.round(255 * (1 - (normalizedValue - 0.5) * 2));
        b = Math.round(255 * ((normalizedValue - 0.5) * 2));
    }
    return chalk.bgRgb(r, g, b);
}

/**
 * Función para simular el modo de mezcla 'multiply' en colores RGB.
 * @param {number[]} rgb1 - Array [R, G, B] del primer color.
 * @param {number[]} rgb2 - Array [R, G, B] del segundo color.
 * @returns {number[]} Array [R, G, B] del color mezclado.
 */
function mixColorsMultiply(rgb1, rgb2) {
    const r = Math.round((rgb1[0] / 255) * (rgb2[0] / 255) * 255);
    const g = Math.round((rgb1[1] / 255) * (rgb2[1] / 255) * 255);
    const b = Math.round((rgb1[2] / 255) * (rgb2[2] / 255) * 255);
    return [r, g, b];
}

/**
 * Genera la representación visual de la cuadrícula 10x10 en la terminal.
 * @param {MetricsData} rawMetrics - Objeto con todas las métricas en sus rangos crudos.
 * @returns {object} Un objeto con la cadena de texto de la cuadrícula coloreada, valores normalizados, y resúmenes.
 */
function generatePatternGrid(rawMetrics) {
    // 1. Normalizar todas las métricas a sus rangos definidos
    const normalizedData = {
        EVEI: normalize(rawMetrics.EVEI, 0, 1),
        CTH: normalize(rawMetrics.CTH, 0, 1),
        deltaCTH: normalize(rawMetrics.deltaCTH, -0.5, 0.5), // Rango especial
        IEC: normalize(rawMetrics.IEC, 0, 1),
        PPI: normalize(rawMetrics.PPI, 0, 1),
        VVC: normalize(rawMetrics.VVC, 0, 1),
        MCE: normalize(rawMetrics.MCE, 0, 1),
        CTH_Antes: normalize(rawMetrics.CTH_Antes, 0, 1),
        CTH_Preambulo: normalize(rawMetrics.CTH_Preambulo, 0, 1),
        CTH_Durante: normalize(rawMetrics.CTH_Durante, 0, 1),
        CTH_Transicion: normalize(rawMetrics.CTH_Transicion, 0, 1),
        CTH_Despues: normalize(rawMetrics.CTH_Despues, 0, 1),
    };

    let gridOutput = '';
    const renderedGridValues = []; // Para almacenar los valores normalizados de cada celda

    for (let i = 0; i < 10; i++) {
        let row = '';
        const rowValues = [];
        for (let j = 0; j < 10; j++) {
            const metricKey = GRID_LAYOUT_MAP[i][j];
            let cellValue = 0; // Valor por defecto
            let colorFunction; // Para almacenar la función de color (e.g., chalk.bgRgb(r,g,b))

            // Obtener el valor normalizado de la métrica para la celda
            if (metricKey in normalizedData) {
                cellValue = normalizedData[metricKey];
            }

            rowValues.push(cellValue); // Almacenar el valor normalizado

            // Obtener la función de color adecuada
            if (metricKey === 'deltaCTH') {
                colorFunction = getCoolColorFunction(cellValue);
            } else {
                colorFunction = getPlasmaColorFunction(cellValue);
            }

            // Aplicar la función de color a dos espacios para la celda
            row += colorFunction('  ');
        }
        gridOutput += row + '\n';
        renderedGridValues.push(rowValues);
    }

    // 2. Generar Valores Resumidos (Porcentajes y Rangos de Confianza)
    // Los rangos de confianza son ejemplos estáticos aquí, en una app real provendrían de cálculos.
    const summary = {
        EVEI: {
            value: (normalizedData.EVEI * 100).toFixed(1),
            confidence: '65%-75%',
            colorFn: getPlasmaColorFunction(normalizedData.EVEI) // Store the function
        },
        CTH: {
            value: (normalizedData.CTH * 100).toFixed(1),
            confidence: '80%-90%',
            colorFn: getPlasmaColorFunction(normalizedData.CTH) // Store the function
        },
        deltaCTH: {
            value: ((rawMetrics.deltaCTH + 0.5) * 100).toFixed(1), // Convertir a % del rango [-0.5, 0.5]
            confidence: '10%-20%',
            colorFn: getCoolColorFunction(normalizedData.deltaCTH) // Store the function
        },
        IEC: {
            value: (normalizedData.IEC * 100).toFixed(1),
            confidence: '70%-80%',
            colorFn: getPlasmaColorFunction(normalizedData.IEC)
        },
        PPI: {
            value: (normalizedData.PPI * 100).toFixed(1),
            confidence: '50%-60%',
            colorFn: getPlasmaColorFunction(normalizedData.PPI)
        },
        VVC: {
            value: (normalizedData.VVC * 100).toFixed(1),
            confidence: '30%-40%',
            colorFn: getPlasmaColorFunction(normalizedData.VVC)
        },
        MCE: {
            value: (normalizedData.MCE * 100).toFixed(1),
            confidence: '45%-55%',
            colorFn: getPlasmaColorFunction(normalizedData.MCE)
        }
    };

    let summaryOutput = '\n--- Summary of Key Metrics ---\n';
    for (const key in summary) {
        const item = summary[key];
        // Now use item.colorFn to apply the color to the key name
        summaryOutput += `${item.colorFn(key)}: ${item.value}% (Confidence: ${item.confidence})\n`;
    }

    // 3. Generar Interpretación del Análisis
    let interpretationOutput = '\n--- Analysis Interpretation ---\n';
    if (normalizedData.EVEI < 0.3) {
        interpretationOutput += "EVEI is low, indicating limited intrinsic significance of the event.\n";
    } else if (normalizedData.EVEI > 0.7) {
        interpretationOutput += "EVEI is high, suggesting significant intrinsic importance and emotional charge.\n";
    } else {
        interpretationOutput += "EVEI is moderate, implying balanced significance.\n";
    }

    if (rawMetrics.deltaCTH > 0.1) {
        interpretationOutput += "ΔCTH is positive, indicating an increase in thematic coherence over time.\n";
    } else if (rawMetrics.deltaCTH < -0.1) {
        interpretationOutput += "ΔCTH is negative, suggesting a decrease in thematic coherence or rising conflict.\n";
    } else {
        interpretationOutput += "ΔCTH is relatively stable, indicating consistent thematic coherence.\n";
    }

    // Ejemplo de Eventos Iniciales (esto provendría de tu análisis de datos)
    const initialEventsOutput = '\n--- Initial Events/Triggers ---\n' +
                                '1. Socio-economic disparity escalations.\n' +
                                '2. Emergence of new communication technologies.\n' +
                                '3. Shift in political leadership paradigms.\n';


    return {
        grid: gridOutput,
        normalizedValues: renderedGridValues, // Exportar para cálculo de similitud
        summary: summaryOutput,
        interpretation: interpretationOutput,
        initialEvents: initialEventsOutput
    };
}

module.exports = {
    generatePatternGrid,
    normalize,
    GRID_LAYOUT_MAP // Exportar para que el calculador de similitud pueda usar el mismo mapeo
};