/**
 * CTH-EVEI-ESTIMATOR.JS — v4.1 (Phase F.31)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Endogenous EVEI estimation. In v4.0 the Event Valuation & Impact index (EVEI)
 * was an analyst-assigned input. This module derives it from OBSERVABLE metrics,
 * removing the largest source of analyst subjectivity from the pipeline.
 *
 * UNIVERSAL BY DESIGN: the estimator consumes dimensionless normalized series
 * and indicators. It carries no calendar, no epoch constants, no dataset
 * dependency — the same formulas apply to the Bronze Age Collapse (-1177),
 * the Fall of Rome (476), or a 21st-century crisis.
 *
 * Two entry points:
 *   estimateEVEIFromSeries({ political, economic, social, event_density? })
 *       — time series (any length ≥ 3, any era, values normalized 0–1)
 *   estimateEVEIFromIndicators({ political_stability, economic_stability,
 *                                social_cohesion, delta_cth?, black_swan? })
 *       — snapshot indicators when series are unavailable
 *
 * Both are deterministic and fully audited.
 */

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));

function _stats(series) {
    const n    = series.length;
    const mean = series.reduce((a, b) => a + b, 0) / n;
    const variance = series.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
    // Linear trend via least squares over index positions (era-independent:
    // only relative ordering matters, never absolute dates)
    const xMean = (n - 1) / 2;
    let num = 0, den = 0;
    series.forEach((v, i) => { num += (i - xMean) * (v - mean); den += (i - xMean) ** 2; });
    const trend = den > 0 ? num / den : 0;
    // Max drawdown: worst peak-to-trough collapse in the window
    let peak = series[0], maxDrawdown = 0;
    for (const v of series) {
        if (v > peak) peak = v;
        else maxDrawdown = Math.max(maxDrawdown, peak - v);
    }
    return { mean, volatility: Math.sqrt(variance), trend, maxDrawdown };
}

/**
 * Estimate EVEI from normalized time series.
 * EVEI measures event impact: high when the system shows deep drawdowns,
 * high volatility, strong negative trends, and elevated event density.
 *
 * @param {object} series
 * @param {number[]} series.political  — political stability series (0–1)
 * @param {number[]} series.economic   — economic stability series (0–1)
 * @param {number[]} series.social     — social cohesion series (0–1)
 * @param {number[]} [series.event_density] — optional political event density series (0–1)
 * @param {object} [weights] — override component weights (defaults sum to 1)
 */
export function estimateEVEIFromSeries(series, weights = {}) {
    const required = ['political', 'economic', 'social'];
    for (const key of required) {
        if (!Array.isArray(series?.[key]) || series[key].length < 3) {
            throw new Error(`[CTH-EVEI] series.${key} must be an array with at least 3 normalized values.`);
        }
    }
    const w = {
        drawdown:   weights.drawdown   ?? 0.35,
        volatility: weights.volatility ?? 0.25,
        trend:      weights.trend      ?? 0.20,
        level:      weights.level      ?? 0.12,
        density:    weights.density    ?? 0.08
    };

    const channels = required.map(key => ({ key, ..._stats(series[key].map(v => clamp(v))) }));
    const agg = {
        drawdown:   channels.reduce((a, c) => a + c.maxDrawdown, 0) / channels.length,
        volatility: channels.reduce((a, c) => a + c.volatility,  0) / channels.length,
        // Negative trends raise impact; positive trends reduce it
        trend:      channels.reduce((a, c) => a + clamp(0.5 - c.trend * 5), 0) / channels.length,
        // Low absolute stability level raises impact
        level:      channels.reduce((a, c) => a + (1 - c.mean), 0) / channels.length,
        density:    Array.isArray(series.event_density) && series.event_density.length > 0
            ? series.event_density.reduce((a, b) => a + clamp(b), 0) / series.event_density.length
            : 0.5 // neutral when unobserved — weight is small by design
    };

    // Drawdown and volatility are rescaled: a 0.5 drawdown on a 0–1 index is catastrophic
    const evei = clamp(
        clamp(agg.drawdown * 2.0)   * w.drawdown +
        clamp(agg.volatility * 3.0) * w.volatility +
        agg.trend                   * w.trend +
        agg.level                   * w.level +
        agg.density                 * w.density
    );

    return {
        evei: Number(evei.toFixed(4)),
        method: 'ENDOGENOUS_SERIES',
        components: {
            drawdown:   Number(agg.drawdown.toFixed(4)),
            volatility: Number(agg.volatility.toFixed(4)),
            trend_impact: Number(agg.trend.toFixed(4)),
            instability_level: Number(agg.level.toFixed(4)),
            event_density: Number(agg.density.toFixed(4))
        },
        per_channel: Object.fromEntries(channels.map(c => [c.key, {
            mean: Number(c.mean.toFixed(4)), volatility: Number(c.volatility.toFixed(4)),
            trend: Number(c.trend.toFixed(4)), max_drawdown: Number(c.maxDrawdown.toFixed(4))
        }])),
        _audit: [{
            formula: 'evei = clamp(2·drawdown)·w.d + clamp(3·volatility)·w.v + trendImpact·w.t + (1-level)·w.l + density·w.e',
            weights: w,
            deterministic: true,
            era_independent: true
        }]
    };
}

/**
 * Estimate EVEI from snapshot indicators when no series exist.
 * Same observability principle: inputs are measured stability indicators,
 * not analyst opinions about "impact".
 */
export function estimateEVEIFromIndicators({ political_stability, economic_stability, social_cohesion, delta_cth = 0, black_swan = 0 }, weights = {}) {
    for (const [name, v] of Object.entries({ political_stability, economic_stability, social_cohesion })) {
        if (v == null || Number.isNaN(Number(v))) throw new Error(`[CTH-EVEI] indicator "${name}" is required.`);
    }
    const w = {
        instability: weights.instability ?? 0.45,
        rupture:     weights.rupture     ?? 0.30,
        surprise:    weights.surprise    ?? 0.25
    };
    const instability = 1 - (clamp(political_stability) + clamp(economic_stability) + clamp(social_cohesion)) / 3;
    const rupture     = clamp(Math.abs(delta_cth) * 1.8);
    const surprise    = clamp(black_swan);
    const evei = clamp(instability * w.instability + rupture * w.rupture + surprise * w.surprise + 0.18);
    return {
        evei: Number(evei.toFixed(4)),
        method: 'ENDOGENOUS_INDICATORS',
        components: {
            instability: Number(instability.toFixed(4)),
            rupture:     Number(rupture.toFixed(4)),
            surprise:    Number(surprise.toFixed(4))
        },
        _audit: [{
            formula: 'evei = clamp(instability·w.i + |ΔCTH|·1.8·w.r + blackSwan·w.s + 0.18)',
            weights: w, deterministic: true, era_independent: true
        }]
    };
}

export default { estimateEVEIFromSeries, estimateEVEIFromIndicators };
