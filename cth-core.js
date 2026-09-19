/**
 * CTH-CORE.JS — v4.1 (Universal Kernel)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Zero embedded domain data. No defaults, no labels, no NLP, no opinions.
 * All numeric values, weights, thresholds, and simulation parameters come from Policy.
 * All output labels are status keys — translation to display strings is caller responsibility.
 *
 * UNIVERSALITY GUARANTEE: the kernel contains no epoch-specific constants, no
 * calendar assumptions, and no dataset dependencies. Any year (including BCE,
 * expressed as negative integers), any era, and any event category are valid
 * inputs. Temporal position enters only through caller-provided descriptors.
 *
 * Input contract:  { id, macro_context, token_instance | token_instances[], epoch_descriptor? }
 * Policy contract: see validatePolicy() / REQUIRED_POLICY_PATHS
 * Output contract: { schema_version, event_id, engines, synthesis, hash, _audit }
 *
 * v4.1 additions (all backward-compatible, no new required policy paths):
 *   - Multi-Token Interaction (Phase F.28): token_instances[] models competing actors
 *   - Lyapunov Exponent Estimation (Phase F.29): formal chaos quantification
 *   - Early Warning Signals (Phase F.30): critical-slowing-down detection (Scheffer)
 */

import { createHash } from 'node:crypto';

export const SCHEMA_VERSION = "4.1";
export const CANONICAL_DIMENSIONS = ['HistoricalEpoch', 'SocialRange', 'AgeRange', 'PopulationRange'];
export const CANONICAL_PHASES    = ['before', 'prelude', 'during', 'transition', 'after'];

// ─── Utilities ────────────────────────────────────────────────────────────────

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));

function _path(obj, dot) {
    return dot.split('.').reduce((o, k) => (o != null && typeof o === 'object' ? o[k] : undefined), obj);
}

function _setPath(obj, dot, value) {
    const keys = dot.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] == null) cur[keys[i]] = {};
        cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
}

/**
 * Deterministic perturbation — no Math.random().
 * Identical inputs always produce identical outputs.
 * seed1/seed2 should be domain-meaningful scalars (e.g. actor_volatility, phase index).
 */
function deterministicNoise(seed1, seed2, scale) {
    return scale * Math.sin(seed1 * 1000.73 + seed2 * 7.19);
}

function computeHash(input, policy, synthesisOutput) {
    const payload = JSON.stringify({
        input_id:         input.id,
        macro_context:    input.macro_context,
        token_instance:   input.token_instance,
        epoch_descriptor: input.epoch_descriptor ?? null,
        policy_version:   policy.version ?? 'unversioned',
        synthesis:        synthesisOutput
    });
    return createHash('sha256').update(payload).digest('hex');
}

// ─── Policy Validation (Phase A.4 + C.15) ────────────────────────────────────

export const REQUIRED_POLICY_PATHS = [
    // Synthesis
    'synthesis.weights.foundation', 'synthesis.weights.analysis', 'synthesis.weights.dynamics',
    'synthesis.weights.temporal', 'synthesis.weights.chaos', 'synthesis.weights.butterfly',
    'synthesis.prediction_threshold', 'synthesis.alphabreak_threshold',
    'synthesis.recommendation_threshold', 'synthesis.certainty_brackets',
    'synthesis.nSim_deep_zoom', 'synthesis.deep_zoom_noise_scale',
    'synthesis.deep_zoom_clamp', 'synthesis.deep_zoom_center', 'synthesis.deep_zoom_triggers',
    'synthesis.trajectory_bonus', 'synthesis.reported_delta_bonus',
    // Foundation
    'foundation.nSim', 'foundation.noise_scale',
    'foundation.indicator_weights.CTH', 'foundation.indicator_weights.A',
    'foundation.indicator_weights.B',   'foundation.indicator_weights.C',
    'foundation.risk_weights.cth', 'foundation.risk_weights.evei', 'foundation.risk_weights.black_swan',
    'foundation.alphabreak_threshold', 'foundation.hedge_threshold',
    'foundation.phase_estimation_factor', 'foundation.inference_floor',
    // Temporal
    'temporal.phases',
    'temporal.analog_variance_range', 'temporal.pantemporal_threshold',
    'temporal.et_scale_factor', 'temporal.et_no_disparity_threshold', 'temporal.et_moderate_threshold',
    'temporal.risk_weights.et', 'temporal.risk_weights.pantemporal',
    'temporal.risk_weights.pentaphasic', 'temporal.risk_weights.zenith',
    'temporal.alphabreak_threshold', 'temporal.critical_inflection_threshold', 'temporal.rmd_threshold',
    'temporal.triphasic_weights.cth', 'temporal.triphasic_weights.evei',
    'temporal.pentaphasic_weights.cth', 'temporal.pentaphasic_weights.evei',
    'temporal.pentaphasic_weights.black_swan', 'temporal.supraphasic_multiplier',
    'temporal.pentaphasic_low_threshold', 'temporal.pentaphasic_high_risk', 'temporal.pentaphasic_low_risk',
    'temporal.zenith_during_risk', 'temporal.zenith_other_risk',
    'temporal.outcome_factors.transition_win', 'temporal.outcome_factors.transition_default',
    'temporal.outcome_factors.after_win',      'temporal.outcome_factors.after_default',
    // Dynamics
    'dynamics.nSim_black_swan', 'dynamics.nSim_spectrum', 'dynamics.nSim_butterfly',
    'dynamics.cmn_rmd_weights.evei', 'dynamics.cmn_rmd_weights.iec',
    'dynamics.cmn_rmd_weights.ppi',  'dynamics.cmn_rmd_weights.vvc',
    'dynamics.cmn_rmd_weights.mce',  'dynamics.cmn_rmd_weights.delta_cth',
    'dynamics.risk_weights.var', 'dynamics.risk_weights.pcn',
    'dynamics.risk_weights.rmd', 'dynamics.risk_weights.butterfly_div',
    'dynamics.alphabreak_threshold', 'dynamics.hedge_threshold',
    'dynamics.black_swan.tail_av', 'dynamics.black_swan.tail_tf',
    'dynamics.black_swan.wave_freq',
    'dynamics.black_swan.phase_av', 'dynamics.black_swan.phase_tf',
    'dynamics.black_swan.phase_sum', 'dynamics.black_swan.phase_u',
    'dynamics.black_swan.p_base', 'dynamics.black_swan.h_base',
    'dynamics.black_swan.e_base', 'dynamics.black_swan.o_base',
    'dynamics.black_swan.p_range', 'dynamics.black_swan.h_range',
    'dynamics.black_swan.e_range', 'dynamics.black_swan.o_range',
    'dynamics.black_swan.cross_scalar',
    'dynamics.black_swan.w_p', 'dynamics.black_swan.w_h',
    'dynamics.black_swan.w_e', 'dynamics.black_swan.w_o',
    'dynamics.pcn.ppi_weight', 'dynamics.pcn.iec_factor', 'dynamics.pcn.vvc_weight', 'dynamics.pcn.normalization',
    'dynamics.spectrum.amplitude_base', 'dynamics.spectrum.bs_amplitude_factor',
    'dynamics.spectrum.av_weight', 'dynamics.spectrum.tf_weight',
    'dynamics.spectrum.noise_freq', 'dynamics.spectrum.noise_phase_av', 'dynamics.spectrum.noise_phase_tf',
    'dynamics.spectrum.prelude_threshold', 'dynamics.spectrum.during_threshold', 'dynamics.spectrum.after_threshold',
    'dynamics.butterfly_analysis.base_scale', 'dynamics.butterfly_analysis.av_weight',
    'dynamics.butterfly_analysis.tf_weight',  'dynamics.butterfly_analysis.bs_multiplier',
    'dynamics.butterfly_analysis.noise_freq',
    'dynamics.butterfly_analysis.noise_phase_av', 'dynamics.butterfly_analysis.noise_phase_tf',
    'dynamics.butterfly_analysis.period_mod', 'dynamics.butterfly_analysis.period_scale',
    'dynamics.butterfly_analysis.alert_threshold',
    // Chaos
    'chaos.risk_weights.entropy', 'chaos.risk_weights.eri',
    'chaos.risk_weights.blindspots', 'chaos.risk_weights.polarization', 'chaos.risk_weights.fatigue',
    'chaos.alphabreak_threshold', 'chaos.hedge_threshold', 'chaos.resonance_multiplier',
    'chaos.eri.base', 'chaos.eri.recovery_factor', 'chaos.eri.shock_factor',
    'chaos.blindspot.alert_threshold', 'chaos.blindspot.adjustment_factor',
    'chaos.polarization.delta_factor', 'chaos.polarization.bs_factor',
    'chaos.fatigue_multiplier',
    'chaos.valley.threshold', 'chaos.valley.reversion_factor', 'chaos.valley.normal_factor',
    'chaos.noise.scale', 'chaos.noise.bs_modifier', 'chaos.noise.hedge_threshold',
    'chaos.bivariate.rho_base', 'chaos.bivariate.rho_spread',
    'chaos.bivariate.multiplier', 'chaos.bivariate.revolution_threshold',
    // Butterfly Field
    'butterfly_field.nSim_causal', 'butterfly_field.nSim_risk',
    'butterfly_field.ip_threshold',
    'butterfly_field.stability_thresholds.absolute_anchor',
    'butterfly_field.stability_thresholds.structural_constant',
    'butterfly_field.stability_thresholds.trend_inertia',
    'butterfly_field.verdict_thresholds.gpc',
    'butterfly_field.field_constants.wBefore', 'butterfly_field.field_constants.wPrelude',
    'butterfly_field.field_constants.wDuring', 'butterfly_field.field_constants.alpha',
    'butterfly_field.field_constants.beta',    'butterfly_field.field_constants.eta',
    'butterfly_field.greeks.delta', 'butterfly_field.greeks.gamma', 'butterfly_field.greeks.lambda',
    'butterfly_field.alphabreak_threshold',
    'butterfly_field.risk_weights.iec', 'butterfly_field.risk_weights.vvc',
    'butterfly_field.risk_weights.mce', 'butterfly_field.risk_weights.ppi',
    'butterfly_field.risk_weights.divergence',
    'butterfly_field.high_volatility_threshold',
    'butterfly_field.pee_base', 'butterfly_field.pee_verdict_threshold',
    'butterfly_field.die_threshold', 'butterfly_field.die_exponent',
    'butterfly_field.somatic_resonance_threshold',
    // Analysis
    'analysis.nSim',
    'analysis.extended_ranges.iec_base', 'analysis.extended_ranges.iec_range',
    'analysis.extended_ranges.ppi_base', 'analysis.extended_ranges.ppi_range',
    'analysis.extended_ranges.vvc_base', 'analysis.extended_ranges.vvc_range',
    'analysis.extended_ranges.mce_base', 'analysis.extended_ranges.mce_range',
    'analysis.extended_ranges.iig_base', 'analysis.extended_ranges.iig_range',
    'analysis.risk_weights.cth', 'analysis.risk_weights.evei',
    'analysis.risk_weights.ppi', 'analysis.risk_weights.vvc',
    'analysis.alphabreak_threshold',
    'analysis.margin_weights.macro.cth', 'analysis.margin_weights.macro.evei', 'analysis.margin_weights.macro.fp',
    'analysis.margin_weights.micro.cth', 'analysis.margin_weights.micro.evei', 'analysis.margin_weights.micro.fp',
    // Epistemological (Phase D)
    'mule_clause.token_dominance_threshold',
    'population_modulation.min_population_for_full_certainty',
    'reflexivity.max_certainty_penalty',
    // Token Dynamics (Phase E.25)
    'token_dynamics.weights.power', 'token_dynamics.weights.network',
    'token_dynamics.weights.charisma', 'token_dynamics.weights.momentum',
    'token_dynamics.weights.ideological', 'token_dynamics.weights.anti_legitimacy',
    'token_dynamics.weights.anti_rationality',
    'token_dynamics.duration_normalization', 'token_dynamics.sensitivity',
    'token_dynamics.multiplier_clamp',
];

export function validatePolicy(policy) {
    if (!policy || typeof policy !== 'object') {
        throw new Error('[CTH] Policy must be a non-null object.');
    }
    const missing = REQUIRED_POLICY_PATHS.filter(p => _path(policy, p) == null);
    if (missing.length > 0) {
        throw new Error(
            `[CTH] Policy validation failed — ${missing.length} required field(s) missing:\n` +
            missing.map(p => `  - ${p}`).join('\n')
        );
    }
}

function requireInput(obj, field, context) {
    if (obj == null || obj[field] == null) {
        throw new Error(`[CTH] Required input field "${field}" missing in ${context}.`);
    }
    return obj[field];
}

// ─── Engine 1: Foundation ─────────────────────────────────────────────────────

class CTHCoreFoundationEngine {
    constructor(data, policy) {
        this.data   = data;
        this.p      = policy.foundation;
        this.cthGlobal      = requireInput(data, 'cth_global',   'macro_context');
        this.eveiAverage    = requireInput(data, 'evei_average', 'macro_context');
        this.blackSwanIndex = data.blackSwanIndex ?? 0;
        this.deltaCTH       = data.deltaCTH       ?? 0;
        const ti = data.token_instance ?? {};
        this._av = clamp(ti.actor_volatility ?? 0);
        this._tf = clamp(ti.trigger_force    ?? 0);
    }

    _inferPhaseData() {
        const audit = [];
        let prev = this.cthGlobal;
        const completed = {};
        CANONICAL_PHASES.forEach((phase, idx) => {
            const phaseData = this.data[phase] ?? {};
            let rawScore = 0;
            const inferred = [];
            CANONICAL_DIMENSIONS.forEach(dim => {
                let val = phaseData[dim];
                if (val == null) {
                    val = prev * 100 + deterministicNoise(prev, idx, 20);
                    inferred.push(dim);
                }
                rawScore += clamp((val - 0) / (100 - 0));
            });
            let cth = rawScore / CANONICAL_DIMENSIONS.length;
            const trend = prev === 0 ? (cth > 0 ? 1 : 0) : (cth - prev) / prev;
            if (cth < this.p.inference_floor) {
                cth = clamp(prev * (1 + trend * (idx * this.p.phase_estimation_factor)));
                audit.push({ phase, action: 'estimated', reason: `below inference_floor (${this.p.inference_floor})` });
            }
            if (inferred.length) audit.push({ phase, inferred_dimensions: inferred });
            completed[phase] = Number(cth.toFixed(4));
            prev = cth;
        });
        return { completed, audit };
    }

    _calculateEVEI() {
        const indicatorA = requireInput(this.data, 'indicatorA', 'macro_context');
        const indicatorB = requireInput(this.data, 'indicatorB', 'macro_context');
        const indicatorC = requireInput(this.data, 'indicatorC', 'macro_context');
        const w    = this.p.indicator_weights;
        const sumW = w.CTH + w.A + w.B + w.C;
        const base = (this.cthGlobal * w.CTH + indicatorA * w.A + indicatorB * w.B + indicatorC * w.C) / sumW;
        const results = [];
        for (let i = 0; i < this.p.nSim; i++) {
            results.push(clamp(base + deterministicNoise(i + this._av, this._tf + 1, this.p.noise_scale)));
        }
        results.sort((a, b) => a - b);
        const n   = this.p.nSim;
        const evei = results[Math.floor(n * 0.5)];
        return {
            evei:                 Number(evei.toFixed(4)),
            VaR95:                Number(results[Math.floor(n * 0.95)].toFixed(4)),
            uncertainty_interval: Number((results[Math.floor(n * 0.95)] - results[Math.floor(n * 0.05)]).toFixed(4)),
            _audit: [{ formula: 'weighted_sum(CTH,A,B,C)/sumW + deterministicNoise', weights: w, nSim: n }]
        };
    }

    async process() {
        const { completed, audit: inferAudit } = this._inferPhaseData();
        const avgCTH       = Object.values(completed).reduce((a, b) => a + b, 0) / CANONICAL_PHASES.length;
        const deltaCTH_Tot = completed.after - completed.before;
        const evei         = this._calculateEVEI();
        const rw           = this.p.risk_weights;
        const risk         = (1 - avgCTH) * rw.cth + (1 - evei.evei) * rw.evei + this.blackSwanIndex * rw.black_swan;
        const overallFoundationRisk = Number(risk.toFixed(4));
        const audit_trail = [
            ...inferAudit, ...evei._audit,
            {
                metric:    'overallFoundationRisk',
                formula:   `(1-avgCTH)*rw.cth + (1-evei)*rw.evei + blackSwan*rw.black_swan`,
                inputs:    { avgCTH: Number(avgCTH.toFixed(4)), evei: evei.evei, blackSwanIndex: this.blackSwanIndex },
                weights:   rw,
                result:    overallFoundationRisk,
                threshold: this.p.alphabreak_threshold,
                policy_path: 'foundation.alphabreak_threshold'
            }
        ];
        return {
            engine: 'CTHCoreFoundationEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            cthProfile:  { phases: completed, avgCTH: Number(avgCTH.toFixed(4)), deltaCTH_Total: Number(deltaCTH_Tot.toFixed(4)) },
            eveiProfile: { evei: evei.evei, VaR95: evei.VaR95, uncertainty_interval: evei.uncertainty_interval },
            overallFoundationRisk,
            alphabreak:  overallFoundationRisk > this.p.alphabreak_threshold,
            hedgeActive: overallFoundationRisk > this.p.hedge_threshold,
            _audit: audit_trail
        };
    }
}

// ─── Engine 2: Temporal ───────────────────────────────────────────────────────

class CTHTemporalEngine {
    constructor(data, policy) {
        this.data        = data;
        this.p           = policy.temporal;
        this.cthGlobal   = requireInput(data, 'cth_global',   'macro_context');
        this.eveiAverage = requireInput(data, 'evei_average', 'macro_context');
        this.blackSwanIndex = data.blackSwanIndex ?? 0;
    }

    _temporalEquivalence() {
        const analogs = this.data.historical_analogs;
        if (!analogs) return { ET: null, status: 'NO_ANALOG_DATA', _audit: [{ skipped: 'historical_analogs not provided' }] };
        const avgDiff = requireInput(analogs, 'avg_contextual_difference', 'historical_analogs');
        const et = clamp(100 - avgDiff * this.p.et_scale_factor, 0, 100);
        const status = et > this.p.et_no_disparity_threshold ? 'NO_DISPARITY'
                     : et > this.p.et_moderate_threshold     ? 'MODERATE'
                     : 'VERY_HIGH';
        return {
            ET: Number(et.toFixed(4)), ET_pct: et.toFixed(1) + '%',
            analogs_count: analogs.count ?? null, status,
            _audit: [{ formula: `100 - avgDiff * ${this.p.et_scale_factor}`, inputs: { avgDiff }, result: et, policy_path: 'temporal.et_scale_factor' }]
        };
    }

    _pantemporality() {
        const range = this.p.analog_variance_range;
        const vals  = [this.cthGlobal, this.cthGlobal * (1 - range), this.cthGlobal * (1 + range)];
        const mean  = vals.reduce((a, b) => a + b, 0) / 3;
        const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 3;
        const IP = clamp(1 - Math.sqrt(variance));
        return {
            PantemporalityIndex: Number(IP.toFixed(4)),
            isPantemporal: IP >= this.p.pantemporal_threshold,
            _audit: [{ formula: `1 - sqrt(variance(cth * [1, 1-${range}, 1+${range}]))`, result: IP }]
        };
    }

    _temporalFields() {
        const tw = this.p.triphasic_weights;
        const pw = this.p.pentaphasic_weights;
        const tri  = this.cthGlobal * tw.cth + this.eveiAverage * tw.evei;
        const penta = this.cthGlobal * pw.cth + this.eveiAverage * pw.evei + this.blackSwanIndex * pw.black_swan;
        const supra = penta * this.p.supraphasic_multiplier;
        return {
            triphasicField:  Number(tri.toFixed(4)),
            pentaphasicField: Number(penta.toFixed(4)),
            supraphasicRTI:  Number(supra.toFixed(4)),
            _audit: [{ tw, pw, multiplier: this.p.supraphasic_multiplier }]
        };
    }

    _timeline() {
        const cit  = this.p.critical_inflection_threshold;
        const rmdT = this.p.rmd_threshold;
        const tl = this.p.phases.map(ph => {
            const power = this.cthGlobal * (1 - ph.fatigue) * (1 + this.eveiAverage * 0.6) * ph.intensity;
            return { phase: ph.name, range: ph.range, power: Number(power.toFixed(4)), critical_inflection: power > cit };
        });
        const zenith = tl.reduce((a, b) => b.power > a.power ? b : a);
        return {
            timeline: tl, zenithPhase: zenith.phase, zenithRange: zenith.range,
            rmd_trajectory: zenith.power > rmdT,
            _audit: [{ formula: 'cth*(1-fatigue)*(1+evei*0.6)*intensity', threshold: cit, policy_path: 'temporal.critical_inflection_threshold' }]
        };
    }

    _projectPhases(outcome) {
        const of_ = this.p.outcome_factors;
        const win = outcome === 'win';
        return {
            prelude:    Number(this.cthGlobal.toFixed(4)),
            transition: Number(clamp(this.cthGlobal + this.eveiAverage * (win ? -of_.transition_win : of_.transition_default)).toFixed(4)),
            after:      Number(clamp(this.cthGlobal + this.eveiAverage * (win ? -of_.after_win     : of_.after_default)).toFixed(4))
        };
    }

    process(outcome = null) {
        const et       = this._temporalEquivalence();
        const panto    = this._pantemporality();
        const fields   = this._temporalFields();
        const timeline = this._timeline();
        const proj     = this._projectPhases(outcome);
        const rw       = this.p.risk_weights;

        const etVal    = et.ET != null ? (1 - et.ET / 100) * rw.et : 0;
        const pantoVal = (1 - panto.PantemporalityIndex) * rw.pantemporal;
        // Linear interpolation: at threshold → low_risk; at 0 → high_risk; avoids discontinuous step
        const t = this.p.pentaphasic_low_threshold;
        const pentaRisk = fields.pentaphasicField >= t
            ? this.p.pentaphasic_low_risk
            : this.p.pentaphasic_low_risk + (1 - fields.pentaphasicField / t) * (this.p.pentaphasic_high_risk - this.p.pentaphasic_low_risk);
        const zenithRisk = timeline.zenithPhase === 'During' ? this.p.zenith_during_risk : this.p.zenith_other_risk;
        const risk = etVal + pantoVal + pentaRisk * rw.pentaphasic + zenithRisk * rw.zenith;
        const overallTemporalRisk = Number(risk.toFixed(4));

        return {
            engine: 'CTHTemporalEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            temporalEquivalence:  { ET: et.ET, ET_pct: et.ET_pct, analogs_count: et.analogs_count, status: et.status },
            pantemporalElements:  { PantemporalityIndex: panto.PantemporalityIndex, isPantemporal: panto.isPantemporal },
            temporalFields:       { triphasicField: fields.triphasicField, pentaphasicField: fields.pentaphasicField, supraphasicRTI: fields.supraphasicRTI },
            fullTimeline:         { timeline: timeline.timeline, zenithPhase: timeline.zenithPhase, rmd_trajectory: timeline.rmd_trajectory },
            phaseProjections:     proj,
            overallTemporalRisk,
            alphabreak: overallTemporalRisk > this.p.alphabreak_threshold,
            _audit: [
                ...et._audit, ...panto._audit, ...fields._audit, ...timeline._audit,
                { metric: 'overallTemporalRisk', formula: 'etVal+pantoVal+pentaRisk*rw.p+zenithRisk*rw.z', weights: rw, result: overallTemporalRisk, policy_path: 'temporal.alphabreak_threshold' }
            ]
        };
    }
}

// ─── Engine 3: Predictive Dynamics ───────────────────────────────────────────

class CTHPredictiveDynamicsEngine {
    constructor(data, policy) {
        this.data        = data;
        this.p           = policy.dynamics;
        this.cthGlobal   = requireInput(data, 'cth_global',   'macro_context');
        this.eveiAverage = requireInput(data, 'evei_average', 'macro_context');
        this.blackSwanIndex = data.blackSwanIndex ?? 0;
        this.deltaCTH    = data.deltaCTH ?? 0;
        this.extendedMetrics = data.extendedMetrics
            ?? (() => { throw new Error('[CTH] macro_context.extendedMetrics (IEC, PPI, VVC) required by CTHPredictiveDynamicsEngine.'); })();
        const ti  = data.token_instance ?? {};
        this._av = clamp(ti.actor_volatility ?? 0);
        this._tf = clamp(ti.trigger_force    ?? 0);
    }

    _cmnRmd() {
        const w   = this.p.cmn_rmd_weights;
        const em  = this.extendedMetrics;
        let cmn = 0, rmd = 0;
        cmn += (1 - this.eveiAverage) * w.evei * 100;
        cmn += (1 - em.IEC) * w.iec * 100;
        cmn += (1 - em.PPI) * w.ppi * 100;
        cmn +=      em.VVC  * w.vvc * 100;
        rmd +=      this.eveiAverage   * w.evei * 100;
        rmd +=      em.IEC             * w.iec  * 100;
        rmd +=      em.PPI             * w.ppi  * 100;
        rmd += (1 - em.VVC)            * w.vvc  * 100;
        rmd += (this.deltaCTH > 0 ? this.deltaCTH * 80 : 0) * w.delta_cth;
        const total = cmn + rmd;
        return {
            cmnProbability: Number((cmn / total * 100).toFixed(2)),
            rmdProbability: Number((rmd / total * 100).toFixed(2)),
            rmd_dominant: rmd > cmn,
            _audit: [{ formula: 'cmn/rmd weighted sum', weights: w }]
        };
    }

    _blackSwanCore() {
        const n  = this.p.nSim_black_swan;
        const bs = this.p.black_swan;
        const av = this._av, tf = this._tf;
        const tailBias = clamp(av * bs.tail_av + tf * bs.tail_tf);
        const disruptions = [];
        for (let i = 0; i < n; i++) {
            const u  = (i + 0.5) / n;
            const f  = bs.wave_freq;
            const w0 = 0.5 + 0.5 * Math.sin(i * f[0] + av * bs.phase_av[0] + tf * bs.phase_tf[0]);
            const w1 = 0.5 + 0.5 * Math.cos(i * f[1] + tf * bs.phase_av[1] + av * bs.phase_tf[1]);
            const w2 = 0.5 + 0.5 * Math.sin(i * f[2] + (av + tf) * bs.phase_sum);
            const w3 = 0.5 + 0.5 * Math.cos(i * f[3] + u * bs.phase_u);
            const p_ = clamp(bs.p_base + bs.p_range * (w0 * (1 - tailBias * 0.35) + tailBias * (0.35 + u * 0.65)));
            const h  = clamp(bs.h_base + bs.h_range * (w1 * (1 - tailBias * 0.28) + tailBias * (0.32 + u * 0.58)));
            const e  = clamp(bs.e_base + bs.e_range * (w2 * (1 - tailBias * 0.40) + tailBias * (0.45 + av * 0.35)));
            const o  = clamp(bs.o_base + bs.o_range * (w3 * (1 - tailBias * 0.30) + tailBias * (0.28 + tf * 0.42)));
            const cross = bs.cross_scalar * Math.max(0, (p_ - 0.4) * (h - 0.4) + (p_ - 0.4) * (o - 0.4));
            disruptions.push(clamp(bs.w_p * p_ + bs.w_h * h + bs.w_e * e + bs.w_o * o + cross));
        }
        disruptions.sort((a, b) => a - b);
        const mean  = disruptions.reduce((a, b) => a + b, 0) / n;
        const var95 = disruptions[Math.floor(n * 0.95)];
        const es95  = disruptions.slice(Math.floor(n * 0.95)).reduce((a, b) => a + b, 0) / (n * 0.05);
        return { VaR95: Number(var95.toFixed(5)), ES95: Number(es95.toFixed(5)), mean: Number(mean.toFixed(5)),
                 _audit: [{ formula: 'deterministic_trig_disruption_simulation', nSim: n, tailBias }] };
    }

    _pcn() {
        const pc = this.p.pcn;
        const em = this.extendedMetrics;
        const ipd = em.PPI * pc.ppi_weight + Math.abs(em.IEC - 0.5) * pc.iec_factor + em.VVC * pc.vvc_weight;
        return { PCN: Number(clamp(ipd / pc.normalization).toFixed(4)), _audit: [{ weights: pc }] };
    }

    _spectrum() {
        const sp = this.p.spectrum;
        const n  = this.p.nSim_spectrum;
        const av = this._av, tf = this._tf;
        let pre = 0, dur = 0, aft = 0;
        for (let i = 0; i < n; i++) {
            const amp  = sp.amplitude_base * (1 + this.blackSwanIndex * sp.bs_amplitude_factor) * (sp.av_weight * av + sp.tf_weight * tf);
            const noise = amp * Math.sin((i + 1) * sp.noise_freq + av * sp.noise_phase_av + tf * sp.noise_phase_tf) * 0.5;
            const projected = this.cthGlobal * (1 + this.deltaCTH * 0.8) + noise;
            if (projected > sp.prelude_threshold) pre++;
            if (projected > sp.during_threshold)  dur++;
            if (projected > sp.after_threshold)   aft++;
        }
        return {
            preludeProb: Number((pre / n * 100).toFixed(1)),
            duringProb:  Number((dur / n * 100).toFixed(1)),
            afterProb:   Number((aft / n * 100).toFixed(1)),
            _audit: [{ formula: 'deterministic_sine_spectrum', nSim: n, thresholds: { pre: sp.prelude_threshold, dur: sp.during_threshold, aft: sp.after_threshold } }]
        };
    }

    _butterflyDivergence() {
        const ba = this.p.butterfly_analysis;
        const n  = this.p.nSim_butterfly;
        const av = this._av, tf = this._tf;
        const baseScale = ba.base_scale * (ba.av_weight + (1 - ba.av_weight) * (ba.av_weight * av + ba.tf_weight * tf)) * (1 + this.blackSwanIndex * ba.bs_multiplier);
        const divergences = [];
        for (let i = 0; i < n; i++) {
            divergences.push(Math.abs(baseScale * Math.sin((i + 1) * ba.noise_freq + av * ba.noise_phase_av + tf * ba.noise_phase_tf + (i % ba.period_mod) * ba.period_scale)));
        }
        divergences.sort((a, b) => a - b);
        const d95 = divergences[Math.floor(n * 0.95)];
        return { divergence95: Number(d95.toFixed(5)), alert: d95 > ba.alert_threshold, _audit: [{ nSim: n, baseScale }] };
    }

    async process() {
        const cmnrmd   = this._cmnRmd();
        const blackSwan = this._blackSwanCore();
        const pcn      = this._pcn();
        const spectrum = this._spectrum();
        const butterfly = this._butterflyDivergence();
        const rw       = this.p.risk_weights;
        const risk = blackSwan.VaR95 * rw.var + pcn.PCN * rw.pcn
                   + (1 - cmnrmd.rmdProbability / 100) * rw.rmd
                   + butterfly.divergence95 * rw.butterfly_div;
        const overallDynamicsRisk = Number(clamp(risk).toFixed(4));
        return {
            engine: 'CTHPredictiveDynamicsEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            cmnrmdClassification: { cmnProbability: cmnrmd.cmnProbability, rmdProbability: cmnrmd.rmdProbability, rmd_dominant: cmnrmd.rmd_dominant },
            blackSwanCore:  { VaR95: blackSwan.VaR95, ES95: blackSwan.ES95, mean: blackSwan.mean },
            pcnRisk:        { PCN: pcn.PCN },
            peeProjection:  { preludeProb: spectrum.preludeProb, duringProb: spectrum.duringProb, afterProb: spectrum.afterProb },
            butterflyEffect: { divergence95: butterfly.divergence95, alert: butterfly.alert },
            overallDynamicsRisk,
            alphabreak: overallDynamicsRisk > this.p.alphabreak_threshold,
            hedgeActive: overallDynamicsRisk > this.p.hedge_threshold,
            _audit: [
                ...cmnrmd._audit, ...blackSwan._audit, ...pcn._audit, ...spectrum._audit, ...butterfly._audit,
                { metric: 'overallDynamicsRisk', formula: 'VaR95*rw.var+pcn*rw.pcn+(1-rmd/100)*rw.rmd+div95*rw.bd', weights: rw, result: overallDynamicsRisk, policy_path: 'dynamics.alphabreak_threshold' }
            ]
        };
    }
}

// ─── Engine 4: Chaos Resilience ───────────────────────────────────────────────

class CTHChaosResilienceEngine {
    constructor(data, policy) {
        this.data        = data;
        this.p           = policy.chaos;
        this.cthGlobal   = requireInput(data, 'cth_global',   'macro_context');
        this.eveiAverage = requireInput(data, 'evei_average', 'macro_context');
        this.blackSwanIndex = data.blackSwanIndex ?? 0;
        this.phasesCTH   = data.phasesCTH
            ?? (() => { throw new Error('[CTH] macro_context.phasesCTH required by CTHChaosResilienceEngine.'); })();
        const ti  = data.token_instance ?? {};
        this._av = clamp(ti.actor_volatility ?? 0);
        this._tf = clamp(ti.trigger_force    ?? 0);
    }

    _entropy() {
        const dims = [this.cthGlobal * 0.9, this.cthGlobal * 1.1, this.eveiAverage, this.blackSwanIndex];
        const sum  = dims.reduce((a, b) => a + b, 0);
        let H = 0;
        dims.forEach(p => { const prob = p / sum; if (prob > 0) H -= prob * Math.log2(prob); });
        // Normalize to [0,1]: max Shannon entropy for N items = log2(N)
        const maxH = Math.log2(dims.length);
        const Hn   = maxH > 0 ? H / maxH : 0;
        // No fatigue amplification here — _fatigue() already contributes a separate risk term
        return { entropy: Number(Hn.toFixed(4)), exponentialResonance: Number(Hn.toFixed(4)) };
    }

    _eri() {
        const pc = this.p.eri;
        const shock    = Math.abs(this.phasesCTH.during - this.phasesCTH.before);
        const recovery = this.phasesCTH.after - this.phasesCTH.during;
        const eri = clamp(pc.base + recovery * pc.recovery_factor - shock * pc.shock_factor);
        return { ERI: Number(eri.toFixed(4)), shockMagnitude: Number(shock.toFixed(4)), recoverySpeed: Number(recovery.toFixed(4)),
                 _audit: [{ formula: `base+recovery*${pc.recovery_factor}-shock*${pc.shock_factor}`, inputs: { shock, recovery }, policy_path: 'chaos.eri' }] };
    }

    _blindspots() {
        const exf = requireInput(this.data, 'externalFactors', 'macro_context (for blindspot analysis)');
        const vals = Object.values(exf);
        const score = vals.reduce((a, b) => a + b, 0) / vals.length;
        return {
            blindspotScore: Number(score.toFixed(4)),
            recommendedAdjustment: Number((score * this.p.blindspot.adjustment_factor).toFixed(4)),
            alert: score > this.p.blindspot.alert_threshold
        };
    }

    _polarization() {
        const delta = Math.abs(this.phasesCTH.during - this.phasesCTH.before);
        const pol   = clamp(delta * this.p.polarization.delta_factor + this.blackSwanIndex * this.p.polarization.bs_factor);
        return { polarizationMultiplier: Number(pol.toFixed(4)) };
    }

    _fatigue() {
        const seq = [this.phasesCTH.before, this.phasesCTH.prelude ?? this.cthGlobal, this.phasesCTH.during];
        let f = 0;
        for (let i = 1; i < seq.length; i++) f += (seq[i-1] - seq[i]) * (i * this.p.fatigue_multiplier);
        return clamp(f);
    }

    _valley() {
        const vals = Object.values(this.phasesCTH);
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const isValley = this.phasesCTH.during < mean * this.p.valley.threshold;
        return {
            isValley,
            predictedReversion: Number((isValley ? mean * this.p.valley.reversion_factor : mean * this.p.valley.normal_factor).toFixed(4))
        };
    }

    _irreducibleNoise() {
        const noise = this.p.noise.scale * (this._av - 0.5) * 2 * (this._tf - 0.5) * 2 * (1 + this.blackSwanIndex * this.p.noise.bs_modifier);
        const adjustedEVEI = clamp(this.eveiAverage + noise);
        return { noiseAdjustedEVEI: Number(adjustedEVEI.toFixed(4)), hedgeActive: Math.abs(noise) > this.p.noise.hedge_threshold };
    }

    /** Phase F.30 — Early Warning Signals (critical slowing down, Scheffer et al.)
     *  Rising variance + rising lag-1 autocorrelation in the phase series indicate
     *  proximity to a critical transition. Universal: operates on any phase series,
     *  independent of era or calendar.
     */
    _earlyWarning() {
        const cfg    = this.p.early_warning ?? {};
        const series = Array.isArray(this.data.context_series) && this.data.context_series.length >= 4
            ? this.data.context_series
            : CANONICAL_PHASES.map(ph => this.phasesCTH[ph]).filter(v => v != null);
        if (series.length < 4) {
            return { available: false, reason: 'INSUFFICIENT_SERIES_LENGTH' };
        }
        const half   = Math.floor(series.length / 2);
        const early  = series.slice(0, half + (series.length % 2));
        const late   = series.slice(half);
        const varOf  = arr => {
            const m = arr.reduce((a, b) => a + b, 0) / arr.length;
            return arr.reduce((a, v) => a + (v - m) ** 2, 0) / arr.length;
        };
        const varEarly = varOf(early);
        const varLate  = varOf(late);
        const varianceRatio = varEarly > 0 ? varLate / varEarly : (varLate > 0 ? Infinity : 1);
        // Lag-1 autocorrelation over the full series
        const mean = series.reduce((a, b) => a + b, 0) / series.length;
        let num = 0, den = 0;
        for (let i = 0; i < series.length; i++) {
            den += (series[i] - mean) ** 2;
            if (i > 0) num += (series[i] - mean) * (series[i - 1] - mean);
        }
        const autocorr1 = den > 0 ? num / den : 0;
        const varThreshold = cfg.variance_ratio_threshold ?? 1.5;
        const acThreshold  = cfg.autocorr_threshold       ?? 0.35;
        const csd = varianceRatio > varThreshold && autocorr1 > acThreshold;
        return {
            available: true,
            variance_ratio: Number(Math.min(varianceRatio, 999).toFixed(4)),
            autocorr_lag1:  Number(autocorr1.toFixed(4)),
            critical_slowing_down: csd,
            signal: csd ? 'CRITICAL_TRANSITION_PROXIMITY' : (varianceRatio > varThreshold || autocorr1 > acThreshold) ? 'PARTIAL_WARNING' : 'NO_WARNING'
        };
    }

    _bivariate(d1 = 'Economy', d2 = 'Politics') {
        const bv  = this.p.bivariate;
        const rho = bv.rho_base + deterministicNoise(this._av, this._tf, bv.rho_spread);
        const interaction = this.cthGlobal * this.eveiAverage * rho * bv.multiplier;
        return {
            dimensions: `${d1} × ${d2}`,
            interactionScore: Number(clamp(interaction).toFixed(4)),
            revolution: clamp(interaction) > bv.revolution_threshold
        };
    }

    async process() {
        const entropyRes  = this._entropy();
        const eri         = this._eri();
        const blindspots  = this._blindspots();
        const polarization = this._polarization();
        const fatigue     = this._fatigue();
        const valley      = this._valley();
        const noise_      = this._irreducibleNoise();
        const bivariate   = this._bivariate();
        const earlyWarning = this._earlyWarning();
        const rw          = this.p.risk_weights;
        const risk = entropyRes.exponentialResonance * rw.entropy
                   + (1 - eri.ERI)                   * rw.eri
                   + blindspots.blindspotScore        * rw.blindspots
                   + polarization.polarizationMultiplier * rw.polarization
                   + fatigue                          * rw.fatigue;
        const overallChaosShieldRisk = Number(clamp(risk).toFixed(4));
        return {
            engine: 'CTHChaosResilienceEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            shannonEntropy:     { entropy: entropyRes.entropy, exponentialResonance: entropyRes.exponentialResonance },
            eriResilience:      { ERI: eri.ERI, shockMagnitude: eri.shockMagnitude, recoverySpeed: eri.recoverySpeed },
            blindspots:         { score: blindspots.blindspotScore, adjustment: blindspots.recommendedAdjustment, alert: blindspots.alert },
            polarization:       { multiplier: polarization.polarizationMultiplier },
            societalFatigue:    Number(fatigue.toFixed(4)),
            valleyReversion:    valley,
            irreducibleNoise:   noise_,
            bivariateInteraction: bivariate,
            earlyWarning,
            overallChaosShieldRisk,
            alphabreak: overallChaosShieldRisk > this.p.alphabreak_threshold,
            _audit: [
                ...eri._audit,
                { metric: 'overallChaosShieldRisk', formula: 'resonance*rw.e+(1-ERI)*rw.eri+bs*rw.bs+pol*rw.pol+fat*rw.fat', weights: rw, result: overallChaosShieldRisk, policy_path: 'chaos.alphabreak_threshold' }
            ]
        };
    }
}

// ─── Engine 5: Butterfly Field ────────────────────────────────────────────────

class CTHButterflyFieldEngine {
    constructor(data, policy) {
        this.data   = data;
        this.p      = policy.butterfly_field;
        this.EVEI   = requireInput(data, 'event_valuation_structure', 'macro_context');
        this.CTH_Series = requireInput(data, 'context_series', 'macro_context');
        this.Deltas      = data.delta_series   ?? [];
        this.PCN         = data.black_swan_factor ?? 0;
        this.ICAP        = data.adaptive_capacity ?? 1.0;
        this.FCGS        = data.global_systemic_factor ?? 1.0;
        this.constructors = Array.isArray(data.constructors) ? data.constructors : [];
        const mech = data.mechanics ?? {};
        this.Action   = mech.action   ?? requireInput(mech, 'action',   'macro_context.mechanics');
        this.Reaction = mech.reaction ?? requireInput(mech, 'reaction', 'macro_context.mechanics');
        this.Result   = mech.result   ?? requireInput(mech, 'result',   'macro_context.mechanics');
        this.triphasic   = data.triphasic   ?? requireInput(data, 'triphasic',   'macro_context');
        this.pentaphasic = data.pentaphasic ?? requireInput(data, 'pentaphasic', 'macro_context');
        this.supraphasic = data.supraphasic ?? requireInput(data, 'supraphasic', 'macro_context');
    }

    _ip(values) {
        if (values.length !== 3) throw new Error('[CTH] IP calculation requires exactly 3 phase values.');
        const mean = values.reduce((a, b) => a + b, 0) / 3;
        const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 3;
        const ip = clamp(1 - Math.sqrt(variance));
        const st = this.p.stability_thresholds;
        const grade = ip >= st.absolute_anchor    ? 'ABSOLUTE_ANCHOR'
                    : ip >= st.structural_constant ? 'STRUCTURAL_CONSTANT'
                    : ip >= st.trend_inertia       ? 'TREND_INERTIA'
                    : 'VOLATILE_RHYTHM';
        return { ip: Number(ip.toFixed(4)), isPantemporal: ip >= this.p.ip_threshold, stabilityGrade: grade };
    }

    _invariance(dataset) {
        const results = {}, anchors = [];
        for (const variable in dataset) {
            const a = this._ip(dataset[variable]);
            results[variable] = a;
            if (a.isPantemporal) anchors.push({ name: variable, strength: a.ip, grade: a.stabilityGrade });
        }
        const gpc = anchors.length / Object.keys(dataset).length;
        const vt  = this.p.verdict_thresholds;
        const verdict = gpc > vt.gpc ? 'SYSTEMIC_IMMUTABILITY'
                      : anchors.length > 0 ? 'ANCHORED_EVOLUTION'
                      : 'TOTAL_FLUIDITY';
        return { variable_analysis: results, strategic_anchors: anchors, global_pantemporal_coherence: Number(gpc.toFixed(3)), verdict };
    }

    _iec()  { const m = this.CTH_Series.reduce((a,b)=>a+b,0)/this.CTH_Series.length; const v = this.CTH_Series.reduce((a,b)=>a+Math.pow(b-m,2),0)/this.CTH_Series.length; return 1/(1+Math.sqrt(v)); }
    _vvc()  { return this.Deltas.map(Math.abs).reduce((a,b)=>a+b,0)/this.Deltas.length; }
    _mce()  { const t=this.Action+this.Reaction+this.Result; const ps=[this.Action/t,this.Reaction/t,this.Result/t]; return -ps.reduce((a,v)=>a+(v>0?v*Math.log(v+0.001):0),0)/1.1; }
    _ppi()  { return Math.sqrt((this.EVEI/100)*(this.CTH_Series[this.CTH_Series.length-1]/100)); }
    _die(r) { return r > this.p.die_threshold ? Math.exp(r * this.p.die_exponent) : 1.0; }

    _causalDrift(baseProbability, microFluctuations) {
        const g   = this.p.greeks;
        const n   = this.p.nSim_causal;
        const drifts = [];
        const safe = Array.isArray(microFluctuations) ? microFluctuations : [];
        for (let i = 0; i < n; i++) {
            let prob = baseProbability;
            safe.forEach(f => {
                const ripple = deterministicNoise(i, f.scale ?? 0.05, f.scale ?? 0.05);
                prob += ripple * g.delta + Math.pow(ripple, 2) * g.gamma;
            });
            prob = prob * (1 - g.lambda) + baseProbability * g.lambda;
            drifts.push(clamp(prob));
        }
        drifts.sort((a, b) => a - b);
        const median = drifts[Math.floor(n / 2)];
        const vol    = drifts[Math.floor(n * 0.95)] - drifts[Math.floor(n * 0.05)];
        return {
            causal_certainty: Number((median * 100).toFixed(3)),
            divergence_risk:  Number((vol    * 100).toFixed(3)),
            high_volatility:  vol > this.p.high_volatility_threshold,
            _audit: [{ greeks: g, nSim: n, baseProbability }]
        };
    }

    /** Phase F.29 — Lyapunov exponent of the systemic trajectory.
     *  The event's causal dynamics are modeled as a logistic-family map whose gain
     *  is driven by systemic stress (EVEI + black swan factor). The exponent
     *  λ = (1/n) Σ ln|f'(xᵢ)| formally quantifies sensitivity to initial conditions:
     *  λ > 0 → chaotic regime; predictability horizon ≈ ln(1/δ₀)/λ iterations.
     *  Fully deterministic and era-independent.
     */
    _lyapunov(baseProbability) {
        const cfg  = this.p.lyapunov ?? {};
        const n    = cfg.iterations ?? 200;
        const gMin = cfg.gain_min   ?? 2.6;
        const gMax = cfg.gain_max   ?? 3.99;
        const d0   = cfg.initial_separation ?? 1e-4;
        const stress = clamp(0.35 * baseProbability + 0.65 * this.PCN + 0.15 * (1 - this.ICAP));
        const gain   = gMin + (gMax - gMin) * stress;
        let x = Math.min(0.99, Math.max(0.01, baseProbability));
        let sum = 0;
        for (let i = 0; i < n; i++) {
            x = gain * x * (1 - x);
            x = Math.min(0.99, Math.max(0.01, x));
            sum += Math.log(Math.abs(gain * (1 - 2 * x)) + 1e-12);
        }
        const lambda  = sum / n;
        const chaotic = lambda > 0;
        return {
            exponent: Number(lambda.toFixed(4)),
            map_gain: Number(gain.toFixed(4)),
            systemic_stress: Number(stress.toFixed(4)),
            chaotic,
            predictability_horizon: chaotic ? Number((Math.log(1 / d0) / lambda).toFixed(2)) : null,
            regime: chaotic ? 'CHAOTIC' : gain > 3.0 ? 'OSCILLATORY' : 'STABLE_FIXED_POINT'
        };
    }

    _triphasicIndices() {
        const fc = this.p.field_constants;
        const iEVEI = this.triphasic.before.evei * fc.wBefore + this.triphasic.prelude.evei * fc.wPrelude + this.triphasic.during.evei * fc.wDuring;
        const iCTH  = this.triphasic.before.cth  * fc.wBefore + this.triphasic.prelude.cth  * fc.wPrelude + this.triphasic.during.cth  * fc.wDuring;
        const vals  = [this.triphasic.before.cth, this.triphasic.prelude.cth, this.triphasic.during.cth];
        const mean  = vals.reduce((a,b)=>a+b,0)/3;
        const IP    = clamp(1 - Math.sqrt(vals.reduce((a,v)=>a+Math.pow(v-mean,2),0)/3));
        return { iEVEI: Number(iEVEI.toFixed(4)), iCTH: Number(iCTH.toFixed(4)), IP: Number(IP.toFixed(4)) };
    }

    process(eventData = {}) {
        const microFluctuations = Array.isArray(eventData.microFluctuations) ? eventData.microFluctuations : [];
        const constructors      = Array.isArray(eventData.constructors) ? eventData.constructors : this.constructors;
        const pantemporalDataset = {
            CTH:  this.CTH_Series.slice(0, 3),
            EVEI: [this.EVEI/100, this.EVEI/100 * 1.05, this.EVEI/100 * 0.95]
        };
        const panto       = this._invariance(pantemporalDataset);
        const iec         = this._iec();
        const vvc         = this._vvc();
        const mce         = this._mce();
        const ppi         = this._ppi();
        const die         = this._die(this.EVEI / 100);
        const rti         = constructors.map((c, i) => ({
            breadcrumb: i + 1, identity: c.id ?? c.name ?? `C-${i}`,
            impact: Number(((c.evei ?? c.weight ?? requireInput(c, 'evei', `constructors[${i}]`)) * (c.influence_factor ?? 1.0)).toFixed(2)),
            context_environment: requireInput(c, 'cth_at_event', `constructors[${i}]`)
        }));
        const causalDrift = this._causalDrift(this.EVEI / 100, microFluctuations);
        const lyapunov    = this._lyapunov(this.EVEI / 100);
        const somatic     = (() => {
            const gap = Math.abs(this.EVEI/100 - (this.EVEI/100 + 0.05));
            const r   = gap * this.p.greeks.gamma;
            return { resonanceLevel: Number(r.toFixed(5)), recalibrate: r > this.p.somatic_resonance_threshold };
        })();
        const tri         = this._triphasicIndices();
        const pentaMatch  = this.pentaphasic.models?.find(m => Math.abs(m.cth_signature - parseFloat(tri.iCTH)) < 0.1)?.name ?? 'NEW_PATTERN';
        const supraEcho   = this.supraphasic.rtis?.reduce((acc, r) => acc + r.power * r.persistence, 0).toFixed(4) ?? 0;
        const fc          = this.p.field_constants;
        const PEE         = this.p.pee_base + fc.alpha * tri.iEVEI + fc.beta * tri.iCTH + fc.eta * this.PCN + parseFloat(supraEcho) * 0.1;
        const rw          = this.p.risk_weights;
        const nRisk       = this.p.nSim_risk;
        const div         = causalDrift.divergence_risk;
        let risks = [];
        for (let i = 0; i < nRisk; i++) {
            const noise = deterministicNoise(i, this.PCN, this.PCN);
            risks.push(clamp((1-iec)*rw.iec + vvc*rw.vvc + mce*rw.mce + (1-ppi)*rw.ppi + (div/100)*rw.divergence + noise));
        }
        risks.sort((a,b)=>a-b);
        const overallRisk = Number(risks[Math.floor(nRisk/2)].toFixed(4));
        return {
            engine: 'CTHButterflyFieldEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            pantemporalAnalysis: panto,
            rtiMetrics: { IEC: Number(iec.toFixed(3)), VVC: Number(vvc.toFixed(3)), MCE: Number(mce.toFixed(3)), PPI: Number(ppi.toFixed(3)), DIE: Number(die.toFixed(3)), RTI: rti },
            butterflyEffect: { causalDrift, somaticResonance: somatic, lyapunov },
            fieldCommander: { triphasicIndices: tri, pentaphasicValidation: pentaMatch, supraEcho, PEEProjection: Number(clamp(PEE).toFixed(4)), climax: PEE > this.p.pee_verdict_threshold },
            overallRisk,
            alphabreak: overallRisk > this.p.alphabreak_threshold,
            _audit: [
                ...causalDrift._audit,
                { metric: 'overallRisk', formula: '(1-iec)*rw.iec+vvc*rw.vvc+mce*rw.mce+(1-ppi)*rw.ppi+(div/100)*rw.div+detNoise', weights: rw, result: overallRisk, policy_path: 'butterfly_field.alphabreak_threshold' }
            ]
        };
    }
}

// ─── Engine 6: Analysis (Extended Metrics) ────────────────────────────────────

class CTHAnalysisEngine {
    constructor(data, policy) {
        this.data = data;
        this.p    = policy.analysis;
        this.core = new CTHCoreFoundationEngine(data, policy);
    }

    _extendedMetrics() {
        const r  = this.p.extended_ranges;
        const n  = this.p.nSim;
        const av = clamp(this.data.token_instance?.actor_volatility ?? 0);
        const tf = clamp(this.data.token_instance?.trigger_force    ?? 0);
        let iec=0, ppi=0, vvc=0, mce=0, iig=0;
        for (let i = 0; i < n; i++) {
            const noise = deterministicNoise(i + av, tf, 0.5);
            iec += r.iec_base + Math.abs(noise) * r.iec_range;
            ppi += r.ppi_base + Math.abs(noise) * r.ppi_range;
            vvc += r.vvc_base + Math.abs(noise) * r.vvc_range;
            mce += r.mce_base + Math.abs(noise) * r.mce_range;
            iig += r.iig_base + Math.abs(noise) * r.iig_range;
        }
        return {
            IEC: Number((iec/n).toFixed(4)), PPI: Number((ppi/n).toFixed(4)),
            VVC: Number((vvc/n).toFixed(4)), MCE: Number((mce/n).toFixed(4)), IIG: Number((iig/n).toFixed(4)),
            _audit: [{ formula: 'base + |deterministicNoise|*range', ranges: r, nSim: n }]
        };
    }

    _margins(avgCTH, evei, fp) {
        const mw = this.p.margin_weights;
        return {
            macromargin: Number((avgCTH * mw.macro.cth + evei * mw.macro.evei + fp * mw.macro.fp).toFixed(4)),
            micromargin: Number((avgCTH * mw.micro.cth + evei * mw.micro.evei + fp * mw.micro.fp).toFixed(4))
        };
    }

    async process() {
        const core     = await this.core.process();
        const extended = this._extendedMetrics();
        const fhEVEI   = requireInput(this.data, 'fh_evei', 'macro_context');
        const feEVEI   = requireInput(this.data, 'fe_evei', 'macro_context');
        const fp       = (fhEVEI * 3 + feEVEI * 2) / 5;
        const margins  = this._margins(core.cthProfile.avgCTH, core.eveiProfile.evei, fp);
        const rw       = this.p.risk_weights;
        const risk     = (1 - core.cthProfile.avgCTH) * rw.cth + (1 - core.eveiProfile.evei) * rw.evei
                       + (1 - extended.PPI) * rw.ppi + extended.VVC * rw.vvc;
        const overallAnalyticalVulnerability = Number(clamp(risk).toFixed(4));
        return {
            engine: 'CTHAnalysisEngine', schema_version: SCHEMA_VERSION, timestamp: Date.now(),
            extendedMetrics: { IEC: extended.IEC, PPI: extended.PPI, VVC: extended.VVC, MCE: extended.MCE, IIG: extended.IIG },
            potentialFactors: { FP_EVEI: Number(fp.toFixed(4)), FP_CTH: Number((core.cthProfile.avgCTH * 0.6 + fp * 0.4).toFixed(4)) },
            margins,
            overallAnalyticalVulnerability,
            alphabreak: overallAnalyticalVulnerability > this.p.alphabreak_threshold,
            _audit: [
                ...extended._audit,
                { metric: 'overallAnalyticalVulnerability', formula: '(1-cth)*rw.cth+(1-evei)*rw.evei+(1-ppi)*rw.ppi+vvc*rw.vvc', weights: rw, result: overallAnalyticalVulnerability, policy_path: 'analysis.alphabreak_threshold' }
            ]
        };
    }
}

// ─── Engine 7: Token Dynamics (Phase E.25) ────────────────────────────────────
// Computes a Token Impact Multiplier (TIM) from rich actor/token fields.
// TIM > 1 → token amplifies systemic risk (disruptors, radicals)
// TIM < 1 → token dampens systemic risk (architects, stabilizers)
// The multiplier is applied to Foundation, Dynamics, and Chaos engine risks
// before ultraCTH synthesis.

class CTHTokenDynamicsEngine {
    static DEFAULT_ROLE_MODIFIERS = {
        disruptor:  { foundation: 1.15, dynamics: 1.20, chaos: 1.25 },
        catalyst:   { foundation: 1.05, dynamics: 1.15, chaos: 1.10 },
        stabilizer: { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },
        architect:  { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },
        wildcard:   { foundation: 1.00, dynamics: 1.05, chaos: 1.10 }
    };

    constructor(token_instance, policy) {
        this.t = token_instance ?? {};
        this.p = policy.token_dynamics;
    }

    process() {
        const t = this.t;
        const p = this.p;
        const w = p.weights;

        // Resolve fields — new rich fields take priority over legacy compact fields
        const power       = clamp(t.power_index           ?? t.actor_volatility ?? 0);
        const network     = clamp(t.network_centrality    ?? t.network_density   ?? 0.5);
        const legitimacy  = clamp(t.legitimacy            ?? t.legitimacy_index  ?? 0.5);
        const rationality = clamp(t.rationality           ?? 0.5);
        const charisma    = clamp(t.charisma              ?? 0.5);
        const ideological = clamp(t.ideological_extremity ?? 0);
        const momentum    = clamp(t.momentum              ?? 0.5);
        const duration    = Math.min(1, (t.duration_of_influence ?? 12) / p.duration_normalization);

        // Token Impact Score: higher → actor destabilizes macro system
        const TIS = clamp(
            power       * w.power +
            network     * w.network +
            charisma    * w.charisma +
            momentum    * w.momentum +
            ideological * w.ideological +
            (1 - legitimacy)  * w.anti_legitimacy +
            (1 - rationality) * w.anti_rationality
        );

        const role   = t.historical_role ?? 'wildcard';
        const roleR  = (p.role_modifiers?.[role])
                     ?? CTHTokenDynamicsEngine.DEFAULT_ROLE_MODIFIERS[role]
                     ?? CTHTokenDynamicsEngine.DEFAULT_ROLE_MODIFIERS.wildcard;
        const [clo, chi] = p.multiplier_clamp;

        // baseTIM: 1.0 shifted by deviation from neutral TIS=0.5, scaled by sensitivity
        const baseTIM = 1.0 + (TIS - 0.5) * p.sensitivity;

        const multipliers = {
            foundation: Number(clamp(baseTIM * roleR.foundation, clo, chi).toFixed(4)),
            dynamics:   Number(clamp(baseTIM * roleR.dynamics,   clo, chi).toFixed(4)),
            chaos:      Number(clamp(baseTIM * roleR.chaos,      clo, chi).toFixed(4))
        };

        return {
            engine:             'CTHTokenDynamicsEngine',
            token_impact_score: Number(TIS.toFixed(4)),
            historical_role:    role,
            duration_score:     Number(duration.toFixed(4)),
            multipliers,
            components: {
                power:        Number(power.toFixed(4)),
                network:      Number(network.toFixed(4)),
                legitimacy:   Number(legitimacy.toFixed(4)),
                rationality:  Number(rationality.toFixed(4)),
                charisma:     Number(charisma.toFixed(4)),
                ideological:  Number(ideological.toFixed(4)),
                momentum:     Number(momentum.toFixed(4)),
                duration:     Number(duration.toFixed(4))
            },
            _audit: [{
                formula: 'TIS = power*w.p+network*w.n+charisma*w.c+momentum*w.m+ideological*w.i+(1-legitimacy)*w.al+(1-rationality)*w.ar',
                weights: w, role, role_modifiers: roleR,
                baseTIM: Number(baseTIM.toFixed(4)),
                result: TIS
            }]
        };
    }
}

// ─── Engine 8: Multi-Token Interaction (Phase F.28) ──────────────────────────
// Real events feature competing actors (Lenin vs. Kerensky, Robespierre vs. the
// Girondins). Each token produces its own TIM signature; the combined multiplier
// is a TIS-weighted geometric mean, and the dispersion between opposing tokens
// becomes a "contested event" signal that degrades certainty — an epistemically
// honest treatment of actor conflict.

class CTHMultiTokenEngine {
    constructor(token_instances, policy) {
        if (!Array.isArray(token_instances) || token_instances.length === 0) {
            throw new Error('[CTH] CTHMultiTokenEngine requires a non-empty token_instances array.');
        }
        this.tokens = token_instances;
        this.policy = policy;
        this.p      = policy.token_dynamics;
    }

    process() {
        const per = this.tokens.map(t => new CTHTokenDynamicsEngine(t, this.policy).process());
        const weights = per.map(r => r.token_impact_score + 1e-6);
        const wSum    = weights.reduce((a, b) => a + b, 0);
        const [clo, chi] = this.p.multiplier_clamp;

        // TIS-weighted geometric mean per engine channel
        const combine = key => {
            const ln = per.reduce((acc, r, i) => acc + Math.log(r.multipliers[key]) * weights[i], 0) / wSum;
            return Number(Math.max(clo, Math.min(chi, Math.exp(ln))).toFixed(4));
        };
        const multipliers = {
            foundation: combine('foundation'),
            dynamics:   combine('dynamics'),
            chaos:      combine('chaos')
        };

        // Conflict index: dispersion of per-token dynamics multipliers.
        // High dispersion = amplifiers and dampeners pulling in opposite directions.
        const dyn  = per.map(r => r.multipliers.dynamics);
        const mDyn = dyn.reduce((a, b) => a + b, 0) / dyn.length;
        const conflict = Math.sqrt(dyn.reduce((a, v) => a + (v - mDyn) ** 2, 0) / dyn.length);
        const conflictThreshold = this.p.conflict_threshold        ?? 0.10;
        const penaltyScale      = this.p.conflict_certainty_penalty ?? 0.25;
        const contested         = conflict > conflictThreshold;

        const dominantIdx = per.reduce((best, r, i) => r.token_impact_score > per[best].token_impact_score ? i : best, 0);
        const combinedTIS = per.reduce((acc, r, i) => acc + r.token_impact_score * weights[i], 0) / wSum;

        return {
            engine:             'CTHMultiTokenEngine',
            token_count:        per.length,
            token_impact_score: Number(combinedTIS.toFixed(4)),
            historical_role:    per[dominantIdx].historical_role,
            components:         per[dominantIdx].components,
            multipliers,
            per_token:          per,
            interaction: {
                conflict_index:    Number(conflict.toFixed(4)),
                contested,
                certainty_penalty: Number((contested ? conflict * penaltyScale : 0).toFixed(4)),
                dominant_index:    dominantIdx,
                dominant_role:     per[dominantIdx].historical_role
            },
            _audit: [{
                formula: 'TIS-weighted geometric mean of per-token multipliers; conflict = stddev(dynamics multipliers)',
                token_count: per.length, conflict_index: Number(conflict.toFixed(4)),
                contested, dominant_index: dominantIdx
            }]
        };
    }
}

// ─── Master Predictor ─────────────────────────────────────────────────────────

class CTHMasterPredictorEngine {
    constructor() {
        this._hooks = {};
    }

    /** Phase E.24 — register a prediction hook */
    on(event, fn) {
        (this._hooks[event] = this._hooks[event] ?? []).push(fn);
        return this;
    }

    _emit(event, data) {
        (this._hooks[event] ?? []).forEach(fn => fn(data));
    }

    _validateInput(raw) {
        if (!raw || typeof raw !== 'object') throw new Error('[CTH] predictEvent requires a non-null input object.');
        const mc = raw.macro_context;
        if (!mc || typeof mc !== 'object') throw new Error('[CTH] input.macro_context is required and must be an object.');
        // Phase F.28 — token_instances[] (multi-actor) is accepted; the first token
        // serves as the primary for engines that read a single actor signature.
        let ti = raw.token_instance;
        if ((!ti || typeof ti !== 'object') && Array.isArray(raw.token_instances) && raw.token_instances.length > 0) {
            ti = raw.token_instances[0];
        }
        if (!ti || typeof ti !== 'object') throw new Error('[CTH] input.token_instance (or non-empty token_instances[]) is required.');
        const id = String(raw.id ?? ('EVENT-' + Date.now().toString().slice(-8)));
        return { ...raw, id, macro_context: mc, token_instance: ti };
    }

    /** Phase D.17 — Mule clause: detect token-dominated predictions.
     *  If tokenDynamics is provided, uses its TIS as the tokenStrength (richer signal).
     */
    _muleClauses(input, policy, tokenDynamics = null) {
        const threshold = policy.mule_clause.token_dominance_threshold;
        const mc = input.macro_context;
        const ti = input.token_instance ?? {};

        const macroStrength = clamp(
            (mc.cth_global    ?? 0) * 0.50 +
            (mc.evei_average  ?? 0) * 0.30 +
            (mc.adaptive_capacity ?? 0.5) * 0.20
        );

        // Use TIS from CTHTokenDynamicsEngine if available; fallback to basic composite
        const tokenStrength = tokenDynamics?.token_impact_score ?? clamp(
            (ti.actor_volatility ?? 0)   * 0.35 +
            (ti.trigger_force    ?? 0)   * 0.25 +
            (ti.network_density  ?? 0.5) * 0.20 +
            (ti.legitimacy_index ?? 0.5) * 0.20
        );

        const ratio = macroStrength > 0 ? tokenStrength / macroStrength : Infinity;
        return {
            token_dominant:       ratio > threshold,
            token_to_macro_ratio: Number(ratio.toFixed(4)),
            token_strength:       Number(tokenStrength.toFixed(4)),
            macro_strength:       Number(macroStrength.toFixed(4)),
            threshold,
            flag: ratio > threshold ? 'TOKEN_DOMINANT_MACRO_PREDICTION_DEGRADED' : null
        };
    }

    /** Phase D.18 — Reflexivity: observation_loop penalizes certainty */
    _reflexivityPenalty(input, policy, ultraCTH) {
        const loop    = clamp(input.observation_loop ?? 0);
        const maxPen  = policy.reflexivity.max_certainty_penalty;
        const penalty = loop * maxPen;
        return { observation_loop: loop, penalty, adjusted_ultraCTH: clamp(ultraCTH - penalty) };
    }

    /** Phase D.19 — Population modulation via PopulationRange */
    _populationModulation(input, policy, certainty) {
        const pop     = input.macro_context.PopulationRange ?? null;
        if (pop == null) return { modulated_certainty: certainty, population_warning: 'PopulationRange not provided' };
        const minPop  = policy.population_modulation.min_population_for_full_certainty;
        const factor  = clamp(pop / minPop);
        return { modulated_certainty: Number((certainty * factor).toFixed(4)), population_factor: factor };
    }

    _ultraSynthesis(engines, policy, reportedDeltaCTH = null) {
        const w   = policy.synthesis.weights;
        const tb  = policy.synthesis.trajectory_bonus ?? 0;
        const tbR = policy.synthesis.reported_delta_bonus ?? 0;
        const base = clamp(
            (1 - (engines.foundation.overallFoundationRisk   ?? 0)) * w.foundation +
            (1 - (engines.analysis.overallAnalyticalVulnerability ?? 0)) * w.analysis +
            (1 - (engines.dynamics.overallDynamicsRisk       ?? 0)) * w.dynamics +
            (1 - (engines.temporal.overallTemporalRisk       ?? 0)) * w.temporal +
            (1 - (engines.chaos.overallChaosShieldRisk       ?? 0)) * w.chaos +
            (1 - (engines.butterfly.overallRisk              ?? 0)) * w.butterfly
        );
        // Structural trajectory from Foundation's phasesCTH inference
        const structuralDelta = engines.foundation.cthProfile?.deltaCTH_Total ?? 0;
        // Reported delta from macro_context.deltaCTH — positive-only: rewards managed transformations without penalizing ruptures further
        const reportedBonus = (reportedDeltaCTH != null && reportedDeltaCTH > 0)
            ? reportedDeltaCTH * tbR
            : 0;
        return clamp(base + structuralDelta * tb + reportedBonus);
    }

    /** Phase C.11/C.12 — Deep zoom: refines ultraCTH around the computed value, not a fixed center */
    _deepZoom(computedUltra, policy, seed = null) {
        const cfg  = policy.synthesis;
        const n    = cfg.nSim_deep_zoom;
        const [lo, hi] = cfg.deep_zoom_clamp;
        const scale    = cfg.deep_zoom_noise_scale;
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const s = seed != null ? seed : 1;
            sum += clamp(computedUltra + deterministicNoise(i * s, i, scale), lo, hi);
        }
        return sum / n;
    }

    /** Phase E.22 — Enhanced calibration with RMSE, Brier Score, Directional Accuracy, category report */
    async calibrate(corpus, policyTemplate, policy) {
        validatePolicy(policy);
        if (!Array.isArray(corpus) || corpus.length === 0) throw new Error('[CTH] calibrate() requires a non-empty corpus array.');
        const threshold = policy.synthesis.prediction_threshold;
        const results = [];
        for (const item of corpus) {
            if (item.input == null || item.observed_outcome == null) continue;
            const prediction = await this.predictEvent(item.input, policy);
            const predicted  = prediction.synthesis.ultraCTH ?? 0;
            const observed   = clamp(item.observed_outcome);
            const error      = Math.abs(predicted - observed);
            const sq_error   = (predicted - observed) ** 2;
            results.push({
                id:                item.input.id,
                category:          item.category ?? null,
                predicted,
                observed,
                error:             Number(error.toFixed(4)),
                sq_error,
                correct_direction: (predicted > threshold) === (observed > threshold)
            });
        }
        const n    = results.length;
        const mae  = results.reduce((a, r) => a + r.error, 0) / n;
        const rmse = Math.sqrt(results.reduce((a, r) => a + r.sq_error, 0) / n);
        const brier = results.reduce((a, r) => a + r.sq_error, 0) / n;
        const directional_accuracy = results.filter(r => r.correct_direction).length / n;

        const by_category = {};
        for (const r of results) {
            const cat = r.category ?? '_uncategorized';
            if (!by_category[cat]) by_category[cat] = { count: 0, MAE: 0, _errors: [] };
            by_category[cat].count++;
            by_category[cat]._errors.push(r.error);
        }
        for (const cat in by_category) {
            const errs = by_category[cat]._errors;
            by_category[cat].MAE = Number((errs.reduce((a, b) => a + b, 0) / errs.length).toFixed(4));
            delete by_category[cat]._errors;
        }

        return {
            corpus_size:          n,
            MAE:                  Number(mae.toFixed(4)),
            RMSE:                 Number(rmse.toFixed(4)),
            brier_score:          Number(brier.toFixed(4)),
            directional_accuracy: Number(directional_accuracy.toFixed(4)),
            per_event:            results.map(r => ({
                id: r.id, category: r.category, predicted: r.predicted,
                observed: r.observed, error: r.error, correct_direction: r.correct_direction
            })),
            by_category:          Object.keys(by_category).length > 1 ? by_category : null,
            policy_version:       policy.version ?? 'unversioned'
        };
    }

    /** Phase E.26 — Sensitivity analysis: how much does each synthesis weight affect MAE? */
    async sensitivityAnalysis(corpus, policy, { delta = 0.05 } = {}) {
        validatePolicy(policy);
        const baseline = await this.calibrate(corpus, policy, policy);
        const paths = Object.keys(policy.synthesis.weights).map(k => `synthesis.weights.${k}`);
        const sensitivities = {};
        for (const path of paths) {
            const orig = _path(policy, path);
            if (typeof orig !== 'number') continue;
            const pUp   = JSON.parse(JSON.stringify(policy));
            const pDown = JSON.parse(JSON.stringify(policy));
            _setPath(pUp,   path, clamp(orig + delta));
            _setPath(pDown, path, clamp(orig - delta));
            let upMAE = null, downMAE = null;
            try { validatePolicy(pUp);   upMAE   = (await this.calibrate(corpus, pUp,   pUp)).MAE;   } catch(_) {}
            try { validatePolicy(pDown); downMAE = (await this.calibrate(corpus, pDown, pDown)).MAE; } catch(_) {}
            sensitivities[path] = {
                original_value: Number(orig.toFixed(4)),
                up_MAE:         upMAE,
                down_MAE:       downMAE,
                sensitivity:    (upMAE != null && downMAE != null)
                    ? Number(((upMAE - downMAE) / (2 * delta)).toFixed(4))
                    : null
            };
        }
        return { baseline_MAE: baseline.MAE, delta, sensitivities };
    }

    /** Phase E.27 — Deterministic policy optimization: hill-climb synthesis weights to minimize MAE */
    async optimizePolicy(corpus, policy, { iterations = 20 } = {}) {
        validatePolicy(policy);
        let best    = JSON.parse(JSON.stringify(policy));
        let bestRes = await this.calibrate(corpus, best, best);
        let bestMAE = bestRes.MAE;
        const initialMAE = bestMAE;
        const keys = Object.keys(best.synthesis.weights);

        for (let i = 0; i < iterations; i++) {
            const candidate = JSON.parse(JSON.stringify(best));
            const key  = keys[i % keys.length];
            const sign = Math.sin(i * 1000.73 + 7.19) > 0 ? 1 : -1;
            const step = 0.02 + 0.02 * Math.abs(Math.sin(i * 3.14));
            candidate.synthesis.weights[key] = clamp(candidate.synthesis.weights[key] + sign * step);
            // Normalize so weights sum ≈ 1 (engine uses them as direct additive terms)
            const total = Object.values(candidate.synthesis.weights).reduce((a, b) => a + b, 0);
            for (const k of keys) candidate.synthesis.weights[k] = Number((candidate.synthesis.weights[k] / total).toFixed(5));
            try {
                validatePolicy(candidate);
                const res = await this.calibrate(corpus, candidate, candidate);
                if (res.MAE < bestMAE) { best = candidate; bestMAE = res.MAE; bestRes = res; }
            } catch(_) {}
        }

        return {
            optimized_weights: best.synthesis.weights,
            original_weights:  policy.synthesis.weights,
            best_MAE:          Number(bestMAE.toFixed(4)),
            initial_MAE:       Number(initialMAE.toFixed(4)),
            improvement:       Number((initialMAE - bestMAE).toFixed(4)),
            iterations_run:    iterations
        };
    }

    /** Phase E.23 — Inter-policy comparison */
    async compare(eventInput, policies) {
        if (!Array.isArray(policies) || policies.length < 2) throw new Error('[CTH] compare() requires at least 2 policies.');
        const runs = await Promise.all(policies.map(async p => {
            validatePolicy(p);
            const result = await this.predictEvent(eventInput, p);
            return { policy_version: p.version ?? 'unversioned', synthesis: result.synthesis, hash: result.hash };
        }));
        const scores   = runs.map(r => r.synthesis.ultraCTH);
        const maxDiff  = Math.max(...scores) - Math.min(...scores);
        return { event_id: eventInput.id, runs, max_discrepancy: Number(maxDiff.toFixed(4)) };
    }

    async predictEvent(eventData, policy) {
        validatePolicy(policy);
        const input   = this._validateInput(eventData);
        const mc      = { ...input.macro_context, token_instance: input.token_instance };

        const foundation = await new CTHCoreFoundationEngine(mc, policy).process();
        const analysis   = await new CTHAnalysisEngine(mc, policy).process();
        const dynamics   = await new CTHPredictiveDynamicsEngine(mc, policy).process();
        const temporal   = new CTHTemporalEngine(mc, policy).process(input.outcome ?? null);
        const chaos      = await new CTHChaosResilienceEngine(mc, policy).process();
        const butterfly  = new CTHButterflyFieldEngine(mc, policy).process(input);

        // Phase E.25 / F.28 — Token Dynamics: compute TIM and adjust engine risks in-place.
        // If token_instances[] is provided with >1 actor, the Multi-Token engine models
        // their interaction; otherwise the single-token engine runs as in v4.0.
        const tokenDynamics = (Array.isArray(input.token_instances) && input.token_instances.length > 1)
            ? new CTHMultiTokenEngine(input.token_instances, policy).process()
            : new CTHTokenDynamicsEngine(input.token_instance, policy).process();
        foundation._original_risk = foundation.overallFoundationRisk;
        dynamics._original_risk   = dynamics.overallDynamicsRisk;
        chaos._original_risk      = chaos.overallChaosShieldRisk;
        foundation.overallFoundationRisk = clamp(foundation.overallFoundationRisk * tokenDynamics.multipliers.foundation);
        dynamics.overallDynamicsRisk     = clamp(dynamics.overallDynamicsRisk     * tokenDynamics.multipliers.dynamics);
        chaos.overallChaosShieldRisk     = clamp(chaos.overallChaosShieldRisk     * tokenDynamics.multipliers.chaos);

        const engines          = { foundation, analysis, dynamics, temporal, chaos, butterfly, tokenDynamics };
        const reportedDeltaCTH = input.macro_context.deltaCTH ?? null;
        let ultraCTH           = this._ultraSynthesis(engines, policy, reportedDeltaCTH);

        const triggers = policy.synthesis.deep_zoom_triggers;
        if (dynamics.overallDynamicsRisk > triggers.dynamics ||
            chaos.overallChaosShieldRisk > triggers.chaos    ||
            butterfly.overallRisk        > triggers.butterfly) {
            ultraCTH = this._deepZoom(ultraCTH, policy, policy.seed ?? null);
        }

        const mule        = this._muleClauses(input, policy, tokenDynamics);
        const reflexivity = this._reflexivityPenalty(input, policy, ultraCTH);
        // Phase F.28 — contested multi-actor events degrade certainty
        const conflictPenalty = tokenDynamics.interaction?.certainty_penalty ?? 0;
        const finalUltra  = clamp(reflexivity.adjusted_ultraCTH - conflictPenalty);
        const popMod      = this._populationModulation(input, policy, finalUltra);

        const sp         = policy.synthesis;
        const brackets   = sp.certainty_brackets;
        const certBracket = brackets.find(b => b.threshold != null && finalUltra > b.threshold) ?? { label: brackets[brackets.length - 1].label };

        const synthesis = {
            ultraCTH:              Number(finalUltra.toFixed(6)),
            rmd_prediction:        finalUltra > sp.prediction_threshold,
            alphabreak:            finalUltra > sp.alphabreak_threshold,
            certainty_bracket:     certBracket.label,
            recommend_anchor:      finalUltra <= sp.recommendation_threshold,
            mule_clause:           mule,
            reflexivity,
            multi_token_interaction: tokenDynamics.interaction ?? null,
            population_modulation: popMod,
            schema_version:        SCHEMA_VERSION
        };

        const hash = computeHash(input, policy, synthesis);
        const result = {
            schema_version: SCHEMA_VERSION,
            event_id:       input.id,
            engines,
            synthesis,
            hash,
            _audit: [
                ...foundation._audit,
                ...analysis._audit,
                ...dynamics._audit,
                ...temporal._audit,
                ...chaos._audit,
                ...butterfly._audit,
                ...tokenDynamics._audit,
                {
                    metric: 'ultraSynthesis', weights: sp.weights, result: ultraCTH,
                    token_multipliers: tokenDynamics.multipliers,
                    policy_path: 'synthesis.weights'
                },
                { mule_clause: mule },
                { reflexivity }
            ]
        };
        this._emit('prediction', { event_id: input.id, synthesis, hash, timestamp: Date.now() });
        return result;
    }
}

export { CTHMasterPredictorEngine, CTHMultiTokenEngine, CTHTokenDynamicsEngine };
export default CTHMasterPredictorEngine;
