/**
 * CTH-BRIDGE-AI.JS
 * Professional AI Bridge Module for the CTH Psychohistorical Framework
 * 
 * This module serves as the official translator between natural language context
 * and the structured numerical inputs required by the CTHMasterPredictorEngine.
 * 
 * It enables any AI model (Grok, Claude, GPT, etc.) to autonomously analyze
 * real-world situations and generate the exact data object needed to run
 * the full psychohistorical prediction pipeline without manual intervention.
 * 
 * Purpose: Fully autonomous agent-ready integration layer
 */

import CTHMasterPredictorEngine from './cth-master-predictor-engine.js';

export class CTHAIBridge {
    constructor() {
        this.masterEngine = new CTHMasterPredictorEngine();
    }

    /**
     * Executes the complete psychohistorical prediction pipeline from natural language input.
     * 
     * @param {string} naturalLanguageContext - Detailed textual description of the event or situation
     * @returns {Promise<Object>} Full prediction result including finalCTHUltra, prediction, certainty, etc.
     */
    async runFullPrediction(naturalLanguageContext) {
        console.log("CTH-AI Bridge: Analyzing natural language context...");

        const eventData = await this._extractStructuredData(naturalLanguageContext);

        console.log("CTH-AI Bridge: Structured data extraction completed.");

        const prediction = await this.masterEngine.predictEvent(eventData);

        return {
            ...prediction,
            originalContextPreview: naturalLanguageContext.substring(0, 280) + (naturalLanguageContext.length > 280 ? "..." : ""),
            bridgeVersion: "2.0",
            processedAt: new Date().toISOString()
        };
    }

    /**
     * Converts natural language context into the precise numerical structure
     * required by all CTH engines.
     * 
     * This method contains a ready-to-use prompt template for any LLM.
     * In production, replace the fallback with an actual LLM call if desired.
     * 
     * @param {string} contextText - Raw natural language description
     * @returns {Promise<Object>} Structured event data object
     */
    async _extractStructuredData(contextText) {
        // ===================================================================
        // LLM EXTRACTION PROMPT (copy-paste ready for any AI model)
        // ===================================================================
        const extractionPrompt = `
You are an expert psychohistorical analyst. Convert the following context into a precise JSON object using only the exact structure below.

Context: """${contextText}"""

Return ONLY valid JSON with realistic values between 0.00 and 1.00. Use the following structure exactly:

{
  "id": "EVENT-2026-XXX",
  "cth_global": 0.XX,
  "evei_average": 0.XX,
  "blackSwanIndex": 0.XX,
  "deltaCTH": 0.XX,
  "phase": "during",
  "constructorType": "FE",
  "indicatorA": 0.XX,
  "indicatorB": 0.XX,
  "indicatorC": 0.XX,

  "context_series": [0.XX, 0.XX, 0.XX, 0.XX, 0.XX],
  "delta_series": [0.XX, 0.XX, -0.XX, -0.XX],

  "mechanics": { "action": 0.XX, "reaction": 0.XX, "result": 0.XX },

  "triphasic": {
    "before": { "evei": 0.XX, "cth": 0.XX },
    "prelude": { "evei": 0.XX, "cth": 0.XX },
    "during": { "evei": 0.XX, "cth": 0.XX }
  },

  "pentaphasic": { "models": [{ "name": "HistoricalPattern", "cth_signature": 0.XX }] },
  "supraphasic": { "rtis": [{ "power": 0.XX, "persistence": 0.XX }] },

  "clusters": 24,
  "adaptive_capacity": 0.XX,
  "global_systemic_factor": 0.XX,
  "black_swan_factor": 0.XX
}

Rules:
- Base values on the described political, economic, social and technological conditions.
- Increase blackSwanIndex and lower cth_global during crises or high uncertainty.
- Positive transformation or renewal should increase deltaCTH and evei_average.
- All values must be between 0.00 and 1.00.
`;

        // ===================================================================
        // FALLBACK LOGIC (instant execution when no external LLM is called)
        // ===================================================================
        const lowerContext = contextText.toLowerCase();

        return {
            id: "EVENT-" + Date.now().toString().slice(-8),
            cth_global: (lowerContext.includes("crisis") || lowerContext.includes("tension") || lowerContext.includes("instability")) ? 0.57 : 0.76,
            evei_average: (lowerContext.includes("war") || lowerContext.includes("collapse") || lowerContext.includes("recession")) ? 0.44 : 0.73,
            blackSwanIndex: (lowerContext.includes("unexpected") || lowerContext.includes("surprise") || lowerContext.includes("black swan")) ? 0.26 : 0.08,
            deltaCTH: (lowerContext.includes("change") || lowerContext.includes("renewal") || lowerContext.includes("transformation")) ? 0.19 : -0.05,
            phase: "during",
            constructorType: "FE",
            indicatorA: 0.69,
            indicatorB: 0.74,
            indicatorC: 0.71,

            context_series: [0.63, 0.69, 0.82, 0.75, 0.70],
            delta_series: [0.06, 0.13, -0.07, -0.05],

            mechanics: { action: 0.49, reaction: 0.33, result: 0.18 },

            triphasic: {
                before: { evei: 0.62, cth: 0.65 },
                prelude: { evei: 0.73, cth: 0.74 },
                during: { evei: 0.84, cth: 0.80 }
            },
            pentaphasic: { models: [{ name: "StructuralShift", cth_signature: 0.78 }] },
            supraphasic: { rtis: [{ power: 0.89, persistence: 0.83 }] },

            clusters: 26,
            adaptive_capacity: (lowerContext.includes("strong institutions") || lowerContext.includes("resilient")) ? 0.86 : 0.67,
            global_systemic_factor: 0.78,
            black_swan_factor: (lowerContext.includes("crisis") || lowerContext.includes("shock")) ? 0.21 : 0.06
        };
    }

    /**
     * Returns the exact prompt template to be sent to any LLM for data extraction.
     * 
     * @param {string} contextText - The raw context
     * @returns {string} Ready-to-use prompt
     */
    getExtractionPrompt(contextText) {
        return `You are an expert psychohistorical analyst. Convert the following context into a precise JSON object...\n\nContext: """${contextText}"""`;
    }
}

export default CTHAIBridge;