/**
 * CTH-BRIDGE.JS — v4.1
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Multi-context manager and adapter layer.
 * No NLP, no keyword parsing, no hardcoded defaults.
 *
 * Input comes structured from the caller via an IDataAdapter (Phase B.6).
 * Policy is injected per call (Phase A.4).
 * Causal parent stress decays by half-life (Phase D.20).
 *
 * IDataAdapter contract:
 *   Any object with:
 *     adapt(rawInput): { id, macro_context, token_instance, epoch_descriptor? }
 *   where macro_context must satisfy the engine requirements documented in cth-core.js.
 *
 * Usage:
 *   const bridge = new CTHAIBridge();
 *   await bridge.registerContext('evt-1', structuredData, policy, { adapter: myAdapter });
 *   const result = await bridge.runFullPrediction('evt-1', policy);
 */

import CTHMasterPredictorEngine, { validatePolicy, SCHEMA_VERSION } from './cth-core.js';
import CTHAnalogMatcher from './cth-analog-matcher.js';

let _sharedMatcher = null;
function getSharedMatcher() {
    if (!_sharedMatcher) {
        _sharedMatcher = new CTHAnalogMatcher();
    }
    return _sharedMatcher;
}

// ─── IDataAdapter base (Phase B.6) ────────────────────────────────────────────
// Callers implement this interface. The kernel never touches raw text or external formats.

export class IDataAdapter {
    /**
     * Convert any domain-specific input into the canonical CTH input structure.
     * @param {*} rawInput — anything: CSV row, JSON, LLM output, annotated paper
     * @returns {{ id, macro_context, token_instance, epoch_descriptor? }}
     */
    adapt(rawInput) {
        throw new Error('[CTH] IDataAdapter.adapt() must be implemented by the caller.');
    }
}

/**
 * PassthroughAdapter — use when the caller already provides the canonical structure.
 * No transformation is applied.
 */
export class PassthroughAdapter extends IDataAdapter {
    adapt(rawInput) {
        if (!rawInput.macro_context || typeof rawInput.macro_context !== 'object') {
            throw new Error('[CTH] PassthroughAdapter: input must already contain a macro_context object.');
        }
        return rawInput;
    }
}

// ─── Causal decay (Phase D.20) ────────────────────────────────────────────────

/**
 * Compute the stress inherited from a parent event with temporal decay.
 * half_life is defined in Policy (policy.causal_inheritance.half_life).
 * Units are the same as the temporal distance field in the event (epoch_descriptor.duration_since_parent).
 */
function inheritedStressWithDecay(parentUltra, timeSinceParent, policy) {
    const cfg        = policy.causal_inheritance ?? {};
    const raw_stress = (1 - parentUltra) * (cfg.stress_factor ?? 0.14);
    if (timeSinceParent == null || cfg.half_life == null) {
        return { stress: raw_stress, decayed: false };
    }
    const decay  = Math.pow(0.5, timeSinceParent / cfg.half_life);
    return { stress: raw_stress * decay, decayed: true, decay_factor: Number(decay.toFixed(4)) };
}

function applyInheritedStress(macro_context, stress, policy) {
    const cfg = policy.causal_inheritance ?? {};
    const m   = macro_context;
    return {
        ...m,
        cth_global:        Math.min(1, (m.cth_global        ?? 0) + stress * (cfg.cth_factor        ?? 0.42)),
        evei_average:      Math.min(1, (m.evei_average      ?? 0) + stress * (cfg.evei_factor       ?? 0.38)),
        blackSwanIndex:    Math.min(1, (m.blackSwanIndex    ?? 0) + stress * (cfg.black_swan_factor ?? 0.28)),
        deltaCTH:          Math.max(-1, Math.min(1, (m.deltaCTH ?? 0) + stress * (cfg.delta_cth_factor ?? 0.12))),
        adaptive_capacity: Math.max(0,  Math.min(1, (m.adaptive_capacity ?? 1) - stress * (cfg.adaptive_penalty ?? 0.22)))
    };
}

// ─── Bridge ────────────────────────────────────────────────────────────────────

export class CTHAIBridge {
    constructor() {
        this.masterEngine    = new CTHMasterPredictorEngine();
        this.contexts        = new Map();
        this.activeContextId = null;
    }

    /**
     * Register a context with structured data.
     * If adapter is provided, it is called to transform rawData into canonical form.
     * If omitted, rawData must already be in canonical form (PassthroughAdapter behavior).
     *
     * @param {string} contextId
     * @param {*} rawData
     * @param {object} policy — CTH Policy object (validated on use)
     * @param {object} [options]
     * @param {IDataAdapter} [options.adapter]
     * @param {string|null}  [options.causal_parent_id]
     * @param {number|null}  [options.time_since_parent] — temporal distance from parent event
     * @param {object}       [options.metadata]
     */
    async registerContext(contextId, rawData, policy, options = {}) {
        const { adapter = new PassthroughAdapter(), causal_parent_id = null, time_since_parent = null, metadata = {} } = options;

        if (!(adapter instanceof IDataAdapter) && typeof adapter.adapt !== 'function') {
            throw new Error('[CTH] options.adapter must implement IDataAdapter (must have an adapt() method).');
        }

        const structured = adapter.adapt(rawData);

        if (this.contexts.has(contextId)) {
            console.warn(`[CTH] Context ${contextId} already exists. Overwriting.`);
        }

        this.contexts.set(contextId, {
            id:             contextId,
            structuredData: structured,
            policy,
            causal_parent_id,
            time_since_parent,
            metadata:       { createdAt: new Date().toISOString(), ...metadata },
            status:         'registered',
            lastPrediction: null
        });

        if (!this.activeContextId) this.activeContextId = contextId;
        return this.contexts.get(contextId);
    }

    switchContext(contextId) {
        if (!this.contexts.has(contextId)) throw new Error(`[CTH] Context ${contextId} not found.`);
        this.activeContextId = contextId;
        return true;
    }

    /**
     * Run a full prediction for a registered context.
     * Policy can be overridden per call; otherwise the context's registered policy is used.
     */
    async runFullPrediction(contextId = null, policyOverride = null, options = {}) {
        const targetId = contextId ?? this.activeContextId;
        if (!targetId) throw new Error('[CTH] No contextId specified and no active context set.');
        if (!this.contexts.has(targetId)) throw new Error(`[CTH] Context ${targetId} not found.`);

        const ctx    = this.contexts.get(targetId);
        const policy = policyOverride ?? ctx.policy;
        if (!policy) throw new Error(`[CTH] No Policy provided for context ${targetId}. Pass policy to registerContext or as policyOverride.`);
        validatePolicy(policy);

        let structured = { ...ctx.structuredData };

        // Causal inheritance with temporal decay (Phase D.20)
        const parentId = ctx.causal_parent_id;
        if (parentId && this.contexts.has(parentId)) {
            const parentCtx    = this.contexts.get(parentId);
            const parentUltra  = parentCtx.lastPrediction?.synthesis?.ultraCTH ?? null;
            if (parentUltra != null) {
                const { stress, decayed, decay_factor } = inheritedStressWithDecay(parentUltra, ctx.time_since_parent, policy);
                const inheritedMacro = applyInheritedStress(structured.macro_context, stress, policy);
                structured = { ...structured, macro_context: inheritedMacro };
                structured._causal_inheritance = { parent_id: parentId, stress: Number(stress.toFixed(4)), decayed, decay_factor: decay_factor ?? null };
            }
        }

        // Automatic historical analog matching from pre-calculated dataset if missing
        let matchedAnalogs = null;
        if (!structured.macro_context?.historical_analogs && options.auto_analogs !== false) {
            try {
                const matcher = getSharedMatcher();
                const enrichResult = matcher.findEventAnalogs({
                    cth_global: structured.macro_context.cth_global,
                    delta_cth: structured.macro_context.deltaCTH,
                    evei: structured.macro_context.evei_average,
                    black_swan_index: structured.macro_context.blackSwanIndex,
                    historical_epoch_score_E: structured.macro_context.indicatorA,
                    social_range_score_S: structured.macro_context.indicatorB,
                    age_range_score_A: structured.macro_context.indicatorC,
                    category: structured.category
                }, { topK: options.analogs_top_k ?? 25, excludeId: structured.id });

                structured.macro_context.historical_analogs = {
                    count: enrichResult.analogs_count,
                    avg_contextual_difference: enrichResult.average_distance
                };
                matchedAnalogs = enrichResult;
            } catch (_) {}
        }

        const prediction = await this.masterEngine.predictEvent(structured, policy);

        ctx.status         = 'predicted';
        ctx.lastPrediction = prediction;

        return {
            source:          'CTH API (CTHmodules.cc) by Alejo Malia',
            schema_version:  SCHEMA_VERSION,
            contextId:       targetId,
            contextMetadata: ctx.metadata,
            causal_inheritance: structured._causal_inheritance ?? null,
            historical_analogs: matchedAnalogs ?? structured.macro_context?.historical_analogs ?? null,
            prediction: {
                rmd:              prediction.synthesis.rmd_prediction,
                ultraCTH:         prediction.synthesis.ultraCTH,
                certainty_bracket: prediction.synthesis.certainty_bracket,
                alphabreak:        prediction.synthesis.alphabreak,
                mule_clause:       prediction.synthesis.mule_clause,
                reflexivity:       prediction.synthesis.reflexivity,
                population_modulation: prediction.synthesis.population_modulation,
                recommend_anchor:  prediction.synthesis.recommend_anchor
            },
            engines: {
                foundation_risk:    prediction.engines.foundation.overallFoundationRisk,
                temporal_risk:      prediction.engines.temporal.overallTemporalRisk,
                dynamics_risk:      prediction.engines.dynamics.overallDynamicsRisk,
                chaos_shield_risk:  prediction.engines.chaos.overallChaosShieldRisk,
                butterfly_risk:     prediction.engines.butterfly.overallRisk,
                analytical_vulnerability: prediction.engines.analysis.overallAnalyticalVulnerability,
                token_dynamics: prediction.engines.tokenDynamics
                    ? {
                        token_impact_score: prediction.engines.tokenDynamics.token_impact_score,
                        historical_role:    prediction.engines.tokenDynamics.historical_role,
                        multipliers:        prediction.engines.tokenDynamics.multipliers,
                        components:         prediction.engines.tokenDynamics.components
                      }
                    : null
            },
            hash:         prediction.hash,
            processed_at: new Date().toISOString()
        };
    }

    /** Run predictions for multiple contexts in parallel */
    async predictMultiContext(contextIds = null, policyOverride = null) {
        const ids = contextIds ?? Array.from(this.contexts.keys());
        return Promise.all(ids.map(async id => {
            try {
                return { contextId: id, success: true, result: await this.runFullPrediction(id, policyOverride) };
            } catch (err) {
                return { contextId: id, success: false, error: err.message };
            }
        }));
    }

    listAllContexts() {
        return Array.from(this.contexts.entries()).map(([id, ctx]) => ({
            id,
            status:      ctx.status,
            created:     ctx.metadata.createdAt,
            hasResult:   !!ctx.lastPrediction,
            causal_parent: ctx.causal_parent_id ?? null
        }));
    }

    /** Phase E.24 — register a hook on the underlying engine */
    on(event, fn) {
        this.masterEngine.on(event, fn);
        return this;
    }

    /** Phase E.22 — calibration delegation */
    async calibrate(corpus, policyTemplate, policy) {
        return this.masterEngine.calibrate(corpus, policyTemplate, policy);
    }

    /** Phase E.23 — inter-policy comparison delegation */
    async compare(eventInput, policies) {
        return this.masterEngine.compare(eventInput, policies);
    }

    /** Phase E.26 — sensitivity analysis delegation */
    async sensitivityAnalysis(corpus, policy, options = {}) {
        return this.masterEngine.sensitivityAnalysis(corpus, policy, options);
    }

    /** Phase E.27 — policy optimization delegation */
    async optimizePolicy(corpus, policy, options = {}) {
        return this.masterEngine.optimizePolicy(corpus, policy, options);
    }
}

export default CTHAIBridge;
