/**
 * CTH-VALIDATION.JS — v4.1 (Phase F.34)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Out-of-sample validation suite. v4.0 reported in-sample MAE; v4.1 reports
 * what serious cliodynamics requires:
 *
 *   - leaveOneOut()      — strict LOO cross-validation (train on N-1, predict the held-out event)
 *   - kFold()            — deterministic k-fold cross-validation
 *   - baselines()        — naive/climatology/linear-regression baselines the kernel must beat
 *   - crossEraTransfer() — THE universality test: calibrate on one era, predict another
 *                          (pre/post split year, both directions). If MAE holds across
 *                          the split, pantemporal invariance is DEMONSTRATED, not asserted.
 *   - reliability()      — calibration diagram data (predicted vs observed per bin)
 *   - fullReport()       — everything above in one auditable object
 *
 * All folds and optimizations are deterministic — identical corpus + policy
 * always produce identical validation results.
 */

import CTHMasterPredictorEngine, { validatePolicy } from './cth-core.js';

const _engine = new CTHMasterPredictorEngine();

function _applyWeights(policy, weights) {
    const p = JSON.parse(JSON.stringify(policy));
    p.synthesis.weights = { ...weights };
    return p;
}

function _score(pairs) {
    const n = pairs.length;
    if (n === 0) return { n: 0, MAE: null, RMSE: null, brier: null, directional_accuracy: null };
    const mae   = pairs.reduce((a, r) => a + Math.abs(r.predicted - r.observed), 0) / n;
    const mse   = pairs.reduce((a, r) => a + (r.predicted - r.observed) ** 2, 0) / n;
    const dir   = pairs.filter(r => r.correct_direction).length / n;
    return {
        n,
        MAE:  Number(mae.toFixed(4)),
        RMSE: Number(Math.sqrt(mse).toFixed(4)),
        brier: Number(mse.toFixed(4)),
        directional_accuracy: Number(dir.toFixed(4))
    };
}

async function _predictHoldout(items, policy, affine = null) {
    const threshold = policy.synthesis.prediction_threshold;
    const out = [];
    for (const item of items) {
        const r = await _engine.predictEvent(item.input, policy);
        let predicted = r.synthesis.ultraCTH;
        if (affine) predicted = Math.max(0, Math.min(1, affine.a * predicted + affine.b));
        out.push({
            id: item.input.id, category: item.category ?? null, year: item.year ?? null,
            predicted: Number(predicted.toFixed(4)), observed: item.observed_outcome,
            error: Number(Math.abs(predicted - item.observed_outcome).toFixed(4)),
            correct_direction: (predicted > threshold) === (item.observed_outcome > threshold)
        });
    }
    return out;
}

/** Post-hoc affine recalibration (Platt-scaling analog for a bounded score).
 *  Fitted ONLY on training-fold predictions, applied to held-out events —
 *  strictly out-of-sample. Standard practice in probabilistic forecasting. */
function _fitAffine(pairs) {
    const n  = pairs.length;
    const mx = pairs.reduce((a, p) => a + p.predicted, 0) / n;
    const my = pairs.reduce((a, p) => a + p.observed, 0) / n;
    let num = 0, den = 0;
    for (const p of pairs) { num += (p.predicted - mx) * (p.observed - my); den += (p.predicted - mx) ** 2; }
    const a = den > 1e-12 ? num / den : 1;
    return { a: Number(a.toFixed(4)), b: Number((my - a * mx).toFixed(4)) };
}

/** Optimize weights on the training fold, then fit the recalibration layer on it. */
async function _trainFold(train, policy, optimize_iterations) {
    const opt   = await _engine.optimizePolicy(train, policy, { iterations: optimize_iterations });
    const tuned = _applyWeights(policy, opt.optimized_weights);
    const trainPreds = await _predictHoldout(train, tuned);
    const affine     = _fitAffine(trainPreds);
    return { tuned, affine, train_MAE_raw: _score(trainPreds).MAE };
}

// ─── Leave-One-Out ────────────────────────────────────────────────────────────

export async function leaveOneOut(corpus, policy, { optimize_iterations = 6, verbose = false } = {}) {
    validatePolicy(policy);
    const results = [];
    const raw     = [];
    for (let i = 0; i < corpus.length; i++) {
        const train = corpus.filter((_, j) => j !== i);
        const { tuned, affine } = await _trainFold(train, policy, optimize_iterations);
        const [res]    = await _predictHoldout([corpus[i]], tuned, affine);
        const [resRaw] = await _predictHoldout([corpus[i]], tuned);
        results.push(res);
        raw.push(resRaw);
        if (verbose) console.log(`  LOO ${i + 1}/${corpus.length}  ${res.id}  err=${res.error}`);
    }
    return {
        method: 'LEAVE_ONE_OUT', optimize_iterations,
        out_of_sample: _score(results),
        out_of_sample_uncalibrated: _score(raw),
        per_event: results
    };
}

// ─── K-Fold ───────────────────────────────────────────────────────────────────

export async function kFold(corpus, policy, { k = 5, optimize_iterations = 8 } = {}) {
    validatePolicy(policy);
    // Deterministic fold assignment: index mod k. The corpus is ordered
    // chronologically, so every fold mixes eras — no fold is an era ghetto.
    const folds = Array.from({ length: k }, () => []);
    corpus.forEach((item, i) => folds[i % k].push(item));

    const all = [];
    const per_fold = [];
    for (let f = 0; f < k; f++) {
        const test  = folds[f];
        const train = corpus.filter((_, i) => i % k !== f);
        const { tuned, affine } = await _trainFold(train, policy, optimize_iterations);
        const res   = await _predictHoldout(test, tuned, affine);
        all.push(...res);
        per_fold.push({ fold: f, train_size: train.length, test_size: test.length, ..._score(res) });
    }
    return {
        method: 'K_FOLD', k, optimize_iterations,
        out_of_sample: _score(all),
        per_fold,
        per_event: all
    };
}

// ─── Baselines ────────────────────────────────────────────────────────────────
// The kernel only earns credibility if it beats trivially cheap predictors.

function _linearFit(X, y) {
    // Least squares with intercept via normal equations (Gaussian elimination).
    const rows = X.map(r => [1, ...r]);
    const d = rows[0].length;
    const A = Array.from({ length: d }, () => new Array(d + 1).fill(0));
    for (let i = 0; i < rows.length; i++) {
        for (let a = 0; a < d; a++) {
            for (let b = 0; b < d; b++) A[a][b] += rows[i][a] * rows[i][b];
            A[a][d] += rows[i][a] * y[i];
        }
    }
    for (let col = 0; col < d; col++) {
        let piv = col;
        for (let r = col + 1; r < d; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
        if (Math.abs(A[piv][col]) < 1e-12) continue;
        [A[col], A[piv]] = [A[piv], A[col]];
        for (let r = 0; r < d; r++) {
            if (r === col) continue;
            const f = A[r][col] / A[col][col];
            for (let c = col; c <= d; c++) A[r][c] -= f * A[col][c];
        }
    }
    return A.map((row, i) => Math.abs(row[i]) > 1e-12 ? row[d] / row[i] : 0);
}

const _features = item => [
    item.input.macro_context.cth_global,
    item.input.macro_context.evei_average,
    item.input.macro_context.deltaCTH ?? 0,
    item.input.macro_context.blackSwanIndex ?? 0
];

export function baselines(corpus, { threshold = 0.5 } = {}) {
    const mk = predictFn => {
        const pairs = corpus.map((item, i) => {
            const predicted = Math.max(0, Math.min(1, predictFn(item, i)));
            return {
                predicted, observed: item.observed_outcome,
                correct_direction: (predicted > threshold) === (item.observed_outcome > threshold)
            };
        });
        return _score(pairs);
    };

    // 1) Constant 0.5 — the "shrug" predictor
    const constant = mk(() => 0.5);

    // 2) Climatology — LOO mean of all OTHER observed outcomes
    const total = corpus.reduce((a, c) => a + c.observed_outcome, 0);
    const climatology = mk((item) => (total - item.observed_outcome) / (corpus.length - 1));

    // 3) LOO linear regression on 4 macro features
    const linear = mk((item, i) => {
        const train = corpus.filter((_, j) => j !== i);
        const beta  = _linearFit(train.map(_features), train.map(c => c.observed_outcome));
        const x     = [1, ..._features(item)];
        return x.reduce((a, v, j) => a + v * beta[j], 0);
    });

    return {
        method: 'BASELINES_LOO',
        constant_05: constant,
        climatology,
        linear_regression_4f: linear,
        note: 'CTH must outperform linear_regression_4f out-of-sample to demonstrate value beyond trivial modeling.'
    };
}

// ─── Skill contribution ───────────────────────────────────────────────────────
// Does ultraCTH carry information BEYOND the trivial macro features?
// Standard added-skill test: LOO linear regression with vs without the kernel
// score as an extra feature. If MAE drops, the kernel adds real signal.

export async function skillContribution(corpus, policy, { threshold = null } = {}) {
    validatePolicy(policy);
    const th = threshold ?? policy.synthesis.prediction_threshold;
    const ultra = [];
    for (const item of corpus) {
        const r = await _engine.predictEvent(item.input, policy);
        ultra.push(r.synthesis.ultraCTH);
    }
    const loo = featFn => {
        const pairs = corpus.map((item, i) => {
            const trainIdx = corpus.map((_, j) => j).filter(j => j !== i);
            const beta = _linearFit(trainIdx.map(j => featFn(corpus[j], j)), trainIdx.map(j => corpus[j].observed_outcome));
            const x    = [1, ...featFn(item, i)];
            const predicted = Math.max(0, Math.min(1, x.reduce((a, v, j) => a + v * beta[j], 0)));
            return { predicted, observed: item.observed_outcome,
                     correct_direction: (predicted > th) === (item.observed_outcome > th) };
        });
        return _score(pairs);
    };
    const without = loo(item => _features(item));
    const withCTH = loo((item, i) => [..._features(item), ultra[i]]);
    return {
        method: 'SKILL_CONTRIBUTION_LOO',
        linear_without_kernel: without,
        linear_plus_ultraCTH:  withCTH,
        MAE_improvement: Number((without.MAE - withCTH.MAE).toFixed(4)),
        kernel_adds_skill: withCTH.MAE < without.MAE
    };
}

// ─── Cross-Era Transfer (the universality test) ───────────────────────────────

export async function crossEraTransfer(corpus, policy, { split_year = 1800, optimize_iterations = 10 } = {}) {
    validatePolicy(policy);
    const pre  = corpus.filter(c => c.year <  split_year);
    const post = corpus.filter(c => c.year >= split_year);
    if (pre.length < 3 || post.length < 3) throw new Error('[CTH-Validation] both era partitions need at least 3 events.');

    const run = async (train, test, label) => {
        const { tuned, affine } = await _trainFold(train, policy, optimize_iterations);
        const res        = await _predictHoldout(test, tuned, affine);
        const trainScore = _score(await _predictHoldout(train, tuned, affine));
        return { direction: label, train_size: train.length, test_size: test.length,
                 train_MAE: trainScore.MAE, transfer: _score(res), per_event: res };
    };

    const forward  = await run(pre,  post, `TRAIN<${split_year} → TEST≥${split_year}`);
    const backward = await run(post, pre,  `TRAIN≥${split_year} → TEST<${split_year}`);

    // Invariance ratio: transfer MAE vs own-era train MAE. Close to 1 → the
    // calibrated structure generalizes across eras (pantemporal invariance).
    const ratio = dir => dir.train_MAE > 0 ? Number((dir.transfer.MAE / dir.train_MAE).toFixed(3)) : null;

    return {
        method: 'CROSS_ERA_TRANSFER', split_year,
        forward, backward,
        invariance_ratio: { forward: ratio(forward), backward: ratio(backward) },
        interpretation: 'invariance_ratio ≈ 1 means calibration transfers across eras — pantemporal invariance demonstrated, not asserted.'
    };
}

// ─── Reliability (calibration diagram data) ──────────────────────────────────

export async function reliability(corpus, policy, { bins = 5 } = {}) {
    validatePolicy(policy);
    const pairs = await _predictHoldout(corpus, policy);
    const table = Array.from({ length: bins }, (_, b) => ({
        bin: `${(b / bins).toFixed(1)}–${((b + 1) / bins).toFixed(1)}`,
        count: 0, mean_predicted: 0, mean_observed: 0
    }));
    for (const p of pairs) {
        const b = Math.min(bins - 1, Math.floor(p.predicted * bins));
        table[b].count++;
        table[b].mean_predicted += p.predicted;
        table[b].mean_observed  += p.observed;
    }
    for (const row of table) {
        if (row.count > 0) {
            row.mean_predicted = Number((row.mean_predicted / row.count).toFixed(4));
            row.mean_observed  = Number((row.mean_observed  / row.count).toFixed(4));
            row.calibration_gap = Number(Math.abs(row.mean_predicted - row.mean_observed).toFixed(4));
        }
    }
    const populated = table.filter(r => r.count > 0);
    const ece = populated.reduce((a, r) => a + r.calibration_gap * r.count, 0) / pairs.length;
    return { method: 'RELIABILITY_DIAGRAM', bins: table, expected_calibration_error: Number(ece.toFixed(4)) };
}

// ─── Full report ──────────────────────────────────────────────────────────────

export async function fullReport(corpus, policy, options = {}) {
    const t0 = Date.now();
    const inSample = await _engine.calibrate(corpus, policy, policy);
    const loo      = await leaveOneOut(corpus, policy, options.loo ?? {});
    const folds    = await kFold(corpus, policy, options.kfold ?? {});
    const base     = baselines(corpus, { threshold: policy.synthesis.prediction_threshold });
    const skill    = await skillContribution(corpus, policy);
    const transfer = await crossEraTransfer(corpus, policy, options.transfer ?? {});
    const rel      = await reliability(corpus, policy, options.reliability ?? {});

    const beats = (a, b) => a != null && b != null && a < b;
    return {
        schema_version: '4.1',
        corpus_size: corpus.length,
        span_years: `${Math.min(...corpus.map(c => c.year))} → ${Math.max(...corpus.map(c => c.year))}`,
        policy_version: policy.version ?? 'unversioned',
        in_sample:      { MAE: inSample.MAE, RMSE: inSample.RMSE, brier: inSample.brier_score, directional_accuracy: inSample.directional_accuracy },
        leave_one_out:  loo.out_of_sample,
        k_fold:         { k: folds.k, ...folds.out_of_sample },
        baselines:      base,
        skill_contribution: {
            MAE_improvement:   skill.MAE_improvement,
            kernel_adds_skill: skill.kernel_adds_skill,
            linear_without_kernel_MAE: skill.linear_without_kernel.MAE,
            linear_plus_ultraCTH_MAE:  skill.linear_plus_ultraCTH.MAE
        },
        cross_era_transfer: {
            split_year: transfer.split_year,
            forward_MAE:  transfer.forward.transfer.MAE,
            backward_MAE: transfer.backward.transfer.MAE,
            invariance_ratio: transfer.invariance_ratio
        },
        reliability: { expected_calibration_error: rel.expected_calibration_error },
        verdict: {
            beats_constant:    beats(loo.out_of_sample.MAE, base.constant_05.MAE),
            beats_climatology: beats(loo.out_of_sample.MAE, base.climatology.MAE),
            beats_linear:      beats(loo.out_of_sample.MAE, base.linear_regression_4f.MAE)
        },
        elapsed_ms: Date.now() - t0,
        _detail: { loo, kfold: folds, transfer, reliability: rel }
    };
}

export default { leaveOneOut, kFold, baselines, crossEraTransfer, reliability, fullReport };
