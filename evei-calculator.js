// evei-calculator.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * Calcula la Estructura de Valoración Eventual Integral (EVEI) de un evento.
 *
 * @param {object} eventData - Objeto que contiene los datos del evento.
 * @param {number} eventData.CTHIndex - El valor del Índice del Contexto Tetrasociohistórico para el evento.
 * @param {number} eventData.indicatorA - Valor del Indicador A del evento (0 a 1).
 * @param {number} eventData.indicatorB - Valor del Indicador B del evento (0 a 1).
 * @param {number} eventData.indicatorC - Valor del Indicador C del evento (0 a 1).
 * @param {object} [weights] - Pesos opcionales para cada componente. Si no se proporcionan, se usan los predeterminados.
 * @param {number} [weights.wCTH=0.4] - Peso para el CTHIndex.
 * @param {number} [weights.wA=0.2] - Peso para el Indicador A.
 * @param {number} [weights.wB=0.25] - Peso para el Indicador B.
 * @param {number} [weights.wC=0.35] - Peso para el Indicador C.
 * @returns {object} Un objeto que contiene el valor EVEI, su rango de incertidumbre y su interpretación.
 */
function calculateEVEI(eventData, weights) {
  const defaultWeights = {
      wCTH: 0.4,
      wA: 0.2,
      wB: 0.25,
      wC: 0.35,
  };

  const actualWeights = { ...defaultWeights, ...weights };

  // Asegurarse de que los indicadores estén en el rango [0, 1] y manejar valores nulos/indefinidos
  const CTHIndex = Math.max(0, Math.min(1, eventData.CTHIndex || 0));
  const indicatorA = Math.max(0, Math.min(1, eventData.indicatorA || 0));
  const indicatorB = Math.max(0, Math.min(1, eventData.indicatorB || 0));
  const indicatorC = Math.max(0, Math.min(1, eventData.indicatorC || 0));

  // Aplicar la fórmula EVEI
  const eveiValue =
      (actualWeights.wCTH * CTHIndex) +
      (actualWeights.wA * indicatorA) +
      (actualWeights.wB * indicatorB) +
      (actualWeights.wC * indicatorC);

  // Normalizar el EVEI si la suma de los pesos es diferente de 1 (tu fórmula no lo requiere si los pesos suman 1)
  // En tu caso, 0.4 + 0.2 + 0.25 + 0.35 = 1.2. Así que no es una "suma ponderada" estricta en el sentido de que los pesos sumen 1
  // sino una combinación lineal directa. Si quieres que el EVEI esté siempre entre 0 y 1, necesitarías dividir por la suma de los pesos.
  // Asumiendo que quieres el valor raw de la suma:
  let finalEVEI = eveiValue;

  // Si quieres que el EVEI final esté en el rango [0, 1], normaliza dividiendo por la suma de los pesos.
  // La suma de tus pesos es 0.4 + 0.2 + 0.25 + 0.35 = 1.2
  const sumOfWeights = actualWeights.wCTH + actualWeights.wA + actualWeights.wB + actualWeights.wC;
  if (sumOfWeights !== 0) { // Evitar división por cero
      finalEVEI = eveiValue / sumOfWeights;
  }


  // Calcular el rango de incertidumbre (±10%)
  const lowerBound = finalEVEI * 0.9;
  const upperBound = finalEVEI * 1.1;

  // Interpretación del EVEI
  let interpretation = "";
  if (finalEVEI >= 0.8) {
      interpretation = "Extremely high impact event, potentially catastrophic or transformative.";
  } else if (finalEVEI >= 0.6) {
      interpretation = "High impact event, significant consequences expected.";
  } else if (finalEVEI >= 0.4) {
      interpretation = "Moderate impact event, noticeable but manageable consequences.";
  } else if (finalEVEI >= 0.2) {
      interpretation = "Low impact event, minor consequences.";
  } else {
      interpretation = "Very low or negligible impact event.";
  }

  return {
      value: finalEVEI,
      interpretation: interpretation,
      uncertaintyRange: {
          lower: lowerBound,
          upper: upperBound
      }
  };
}

module.exports = {
  calculateEVEI
};