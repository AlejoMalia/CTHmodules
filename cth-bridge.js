/**
 * CTH-BRIDGE.JS
 * CTHmodules.cc
 * Version: 3.0
 * Author: Alejo Malia
 */

import CTHMasterPredictorEngine from './cth-core.js';

export class CTHAIBridge {
    constructor() {
        this.masterEngine = new CTHMasterPredictorEngine();
        this.contexts = new Map();
        this.activeContextId = null;
        this.defaultContextId = "default";
    }

    async registerContext(contextId, naturalLanguageContext, metadata = {}) {
        if (this.contexts.has(contextId)) {
            console.warn(`[MCP] Context ${contextId} already exists. Overwriting.`);
        }

        const structured = await this._extractStructuredData(naturalLanguageContext);
        
        this.contexts.set(contextId, {
            id: contextId,
            rawText: naturalLanguageContext,
            structuredData: structured,
            metadata: {
                createdAt: new Date().toISOString(),
                source: "natural-language-mcp",
                ...metadata
            },
            status: "registered",
            lastPrediction: null
        });

        if (!this.activeContextId) {
            this.activeContextId = contextId;
        }

        return this.contexts.get(contextId);
    }

    switchContext(contextId) {
        if (!this.contexts.has(contextId)) {
            throw new Error(`[MCP] Context ${contextId} not found`);
        }
        this.activeContextId = contextId;
        return true;
    }

    async runFullPrediction(contextId = null) {
        const targetId = contextId || this.activeContextId || this.defaultContextId;
        
        if (!this.contexts.has(targetId)) {
            if (targetId === this.defaultContextId) {
                await this.registerContext(this.defaultContextId, "System default analysis");
            } else {
                throw new Error(`No context found for ID: ${targetId}`);
            }
        }

        const ctx = this.contexts.get(targetId);
        const prediction = await this.masterEngine.predictEvent(ctx.structuredData);

        ctx.status = "predicted";
        ctx.lastPrediction = prediction;

        return {
            source: "CTH API (CTHmodules.cc) by Alejo Malia",
            version: "3.0",
            contextId: targetId,
            contextMetadata: ctx.metadata,
            prediction: {
                label: prediction.finalPrediction,
                score: parseFloat(prediction.finalCTHUltra.toFixed(4)),
                certainty: prediction.certainty || "N/A",
                status: prediction.alphabreakStatus || "STABLE"
            },
            analysis: {
                risk_index: prediction.overallRisk || 0,
                impact_factor: prediction.global_systemic_factor || 0,
                recommendation: prediction.recommendation || "NO_REC"
            },
            processed_at: new Date().toISOString()
        };
    }

    async predictMultiContext(contextIds = null) {
        const ids = contextIds || Array.from(this.contexts.keys());
        
        const promises = ids.map(async id => {
            try {
                const result = await this.runFullPrediction(id);
                return { contextId: id, success: true, result };
            } catch (err) {
                return { contextId: id, success: false, error: err.message };
            }
        });

        return Promise.all(promises);
    }

    async _extractStructuredData(contextText) {
        const lower = contextText.toLowerCase().trim();

        return {
            id: "EVENT-" + Date.now().toString().slice(-8),
            cth_global: this._scoreKeywords(lower, ["crisis", "tension", "collapse", "fall"], 0.85, 0.65),
            evei_average: this._scoreKeywords(lower, ["war", "conflict", "impact"], 0.75, 0.45),
            blackSwanIndex: this._scoreKeywords(lower, ["unexpected", "surprise", "swan"], 0.80, 0.10),
            deltaCTH: this._scoreKeywords(lower, ["change", "acceleration", "shift"], 0.30, 0.05),
            phase: lower.includes("after") ? "after" : "during",
            indicatorA: 0.70,
            indicatorB: 0.75,
            indicatorC: 0.72,
            context_series: [0.65, 0.72, 0.80, 0.78, 0.70],
            delta_series: [0.05, 0.10, -0.05, -0.02],
            mechanics: { action: 0.60, reaction: 0.30, result: 0.10 },
            triphasic: {
                before: { evei: 0.50, cth: 0.55 },
                prelude: { evei: 0.70, cth: 0.75 },
                during: { evei: 0.90, cth: 0.85 }
            },
            adaptive_capacity: this._scoreKeywords(lower, ["resilience", "stability"], 0.30, 0.70),
            global_systemic_factor: 0.82
        };
    }

    _scoreKeywords(text, keywords, highValue, lowValue) {
        return keywords.some(kw => text.includes(kw)) ? highValue : lowValue;
    }

    listAllContexts() {
        return Array.from(this.contexts.entries()).map(([id, data]) => ({
            id,
            status: data.status,
            created: data.metadata.createdAt,
            hasResult: !!data.lastPrediction
        }));
    }
}

export default CTHAIBridge;