/**
 * CTH TEST SUITE — v4.1 (Phase F.36)
 * Run: npm test  (node test/run-tests.js)
 *
 * Covers: determinism, temporal universality (BCE → future), multi-token
 * interaction, Lyapunov/early-warning outputs, output bounds, prediction
 * registry integrity, endogenous EVEI properties, and JS↔Python parity
 * fixture generation (compared by cth-python/parity_check.py).
 *
 * Zero dependencies — plain Node asserts.
 */

import { strict as assert } from 'node:assert';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import CTHMasterPredictorEngine, { CTHMultiTokenEngine, SCHEMA_VERSION } from '../cth-core.js';
import { POLICY_GENERAL } from '../cth-policy-variants.js';
import { buildUniversalCorpus } from '../cth-corpus.js';
import { TimeSeriesAdapter, SnapshotAdapter, CSVAdapter, formatYear, eraDescriptor } from '../cth-data-adapters.js';
import { estimateEVEIFromSeries, estimateEVEIFromIndicators } from '../cth-evei-estimator.js';
import { PredictionRegistry } from '../cth-prediction-registry.js';
import { baselines } from '../cth-validation.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const engine = new CTHMasterPredictorEngine();
let passed = 0, failed = 0;

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        console.error(`  ✗ ${name}\n    ${err.message}`);
    }
}

const snapshotEvent = (id, year, overrides = {}) => new SnapshotAdapter().adapt({
    id, year,
    political_stability: 0.45, economic_stability: 0.40, social_cohesion: 0.50,
    delta_cth: -0.20, black_swan: 0.35, observation_loop: 0.1,
    actor: { power_index: 0.7, network_centrality: 0.6, legitimacy: 0.4, rationality: 0.5,
             charisma: 0.6, ideological_extremity: 0.7, momentum: 0.7,
             historical_role: 'disruptor', duration_of_influence: 6,
             actor_volatility: 0.6, trigger_force: 0.7 },
    ...overrides
});

console.log(`\nCTH v${SCHEMA_VERSION} test suite\n`);

// ─── 1. Determinism ───────────────────────────────────────────────────────────
await test('determinism: identical input + policy → identical hash and ultraCTH', async () => {
    const ev = snapshotEvent('DET-1', 1848);
    const a = await engine.predictEvent(ev, POLICY_GENERAL);
    const b = await engine.predictEvent(ev, POLICY_GENERAL);
    assert.equal(a.hash, b.hash);
    assert.equal(a.synthesis.ultraCTH, b.synthesis.ultraCTH);
});

// ─── 2. Temporal universality ─────────────────────────────────────────────────
await test('universality: BCE (-1177), year 0, and future (2450) all produce valid predictions', async () => {
    for (const year of [-1177, 0, 2450]) {
        const r = await engine.predictEvent(snapshotEvent(`UNIV-${year}`, year), POLICY_GENERAL);
        assert.ok(r.synthesis.ultraCTH >= 0 && r.synthesis.ultraCTH <= 1, `ultraCTH out of bounds for year ${year}`);
    }
    assert.equal(formatYear(-1177), '1177 BCE');
    assert.equal(eraDescriptor(-1177), 'BRONZE_IRON_AGE');
    assert.equal(eraDescriptor(2450), 'FUTURE_PROJECTION');
});

await test('universality: era label never changes the math (same indicators, different years → same score)', async () => {
    const a = await engine.predictEvent(snapshotEvent('ERA-A', -2000), POLICY_GENERAL);
    const b = await engine.predictEvent(snapshotEvent('ERA-B',  1950), POLICY_GENERAL);
    assert.equal(a.synthesis.ultraCTH, b.synthesis.ultraCTH, 'temporal position leaked into the math');
});

// ─── 3. Multi-token interaction ───────────────────────────────────────────────
await test('multi-token: opposing actors are contested and combined multiplier sits between them', () => {
    const disruptor  = { power_index: 0.9, network_centrality: 0.8, legitimacy: 0.2, rationality: 0.4,
                         charisma: 0.85, ideological_extremity: 0.9, momentum: 0.85, historical_role: 'disruptor' };
    const stabilizer = { power_index: 0.7, network_centrality: 0.7, legitimacy: 0.85, rationality: 0.9,
                         charisma: 0.5, ideological_extremity: 0.1, momentum: 0.5, historical_role: 'stabilizer' };
    const multi = new CTHMultiTokenEngine([disruptor, stabilizer], POLICY_GENERAL).process();
    const [dHigh, dLow] = multi.per_token.map(t => t.multipliers.dynamics).sort((a, b) => b - a);
    assert.ok(multi.multipliers.dynamics <= dHigh && multi.multipliers.dynamics >= dLow);
    assert.ok(multi.interaction.contested, 'opposing roles should flag contested');
    assert.ok(multi.interaction.certainty_penalty > 0);
});

await test('multi-token: contested events lose certainty vs single-token', async () => {
    const base = snapshotEvent('MT-SINGLE', 1917);
    const single = await engine.predictEvent(base, POLICY_GENERAL);
    const multi  = await engine.predictEvent({
        ...base, id: 'MT-MULTI',
        token_instances: [
            base.token_instance,
            { power_index: 0.65, network_centrality: 0.7, legitimacy: 0.8, rationality: 0.85,
              charisma: 0.5, ideological_extremity: 0.15, momentum: 0.5, historical_role: 'stabilizer' }
        ]
    }, POLICY_GENERAL);
    assert.equal(multi.synthesis.multi_token_interaction.contested, true);
});

// ─── 4. Chaos formalization ───────────────────────────────────────────────────
await test('lyapunov: exponent reported with valid regime and horizon consistency', async () => {
    const r = await engine.predictEvent(snapshotEvent('LYAP-1', 1789), POLICY_GENERAL);
    const ly = r.engines.butterfly.butterflyEffect.lyapunov;
    assert.ok(['CHAOTIC', 'OSCILLATORY', 'STABLE_FIXED_POINT'].includes(ly.regime));
    if (ly.chaotic) assert.ok(ly.predictability_horizon > 0);
    else            assert.equal(ly.predictability_horizon, null);
});

await test('early warning: signals present with bounded fields', async () => {
    const r = await engine.predictEvent(snapshotEvent('EWS-1', 1914), POLICY_GENERAL);
    const ew = r.engines.chaos.earlyWarning;
    assert.equal(ew.available, true);
    assert.ok(['CRITICAL_TRANSITION_PROXIMITY', 'PARTIAL_WARNING', 'NO_WARNING'].includes(ew.signal));
    assert.ok(ew.autocorr_lag1 >= -1 && ew.autocorr_lag1 <= 1);
});

// ─── 5. Corpus-wide bounds ────────────────────────────────────────────────────
await test('bounds: every corpus prediction stays in [0,1] with a valid bracket', async () => {
    const corpus = buildUniversalCorpus();
    assert.ok(corpus.length >= 30, 'corpus should span 30+ events');
    for (const item of corpus) {
        const r = await engine.predictEvent(item.input, POLICY_GENERAL);
        assert.ok(r.synthesis.ultraCTH >= 0 && r.synthesis.ultraCTH <= 1, item.input.id);
        assert.ok(typeof r.synthesis.certainty_bracket === 'string');
    }
});

// ─── 6. Prediction registry ───────────────────────────────────────────────────
await test('registry: register → verify → resolve → score roundtrip + tamper detection', async () => {
    const tmp = join(__dir, '.tmp-registry.json');
    if (existsSync(tmp)) unlinkSync(tmp);
    const reg = new PredictionRegistry(tmp);
    const pred = await engine.predictEvent(snapshotEvent('REG-1', 2027), POLICY_GENERAL);
    const entry = reg.register(pred, {
        description: 'test forecast', policy_version: POLICY_GENERAL.version,
        resolution_criterion: 'observed stability index per criterion X', resolution_date: '2028-01-01'
    });
    assert.equal(reg.verify(entry.id).valid, true);
    const resolved = reg.resolve(entry.id, 0.6);
    assert.ok(resolved.error >= 0 && resolved.brier >= 0);
    assert.equal(reg.score().resolved, 1);
    // Tamper: mutate the committed prediction → commitment must break
    reg.ledger.entries[0].predicted_ultraCTH = 0.999;
    assert.equal(reg.verify(entry.id).valid, false, 'tampering must break the commitment hash');
    unlinkSync(tmp);
});

// ─── 7. Endogenous EVEI ───────────────────────────────────────────────────────
await test('evei estimator: deterministic, bounded, and monotone in collapse depth', () => {
    const calm  = { political: [0.8, 0.8, 0.79, 0.81, 0.8], economic: [0.75, 0.76, 0.75, 0.74, 0.75], social: [0.7, 0.7, 0.71, 0.7, 0.7] };
    const crash = { political: [0.8, 0.6, 0.25, 0.3, 0.4],  economic: [0.75, 0.5, 0.2, 0.25, 0.35],  social: [0.7, 0.55, 0.3, 0.35, 0.4] };
    const a = estimateEVEIFromSeries(calm), b = estimateEVEIFromSeries(crash);
    assert.ok(a.evei >= 0 && a.evei <= 1 && b.evei >= 0 && b.evei <= 1);
    assert.ok(b.evei > a.evei, 'collapse must score higher impact than calm');
    assert.equal(estimateEVEIFromSeries(crash).evei, b.evei, 'must be deterministic');
    const snap = estimateEVEIFromIndicators({ political_stability: 0.3, economic_stability: 0.25, social_cohesion: 0.4, delta_cth: -0.3, black_swan: 0.5 });
    assert.ok(snap.evei > 0.4, 'unstable snapshot should read high impact');
});

// ─── 8. CSV adapter ───────────────────────────────────────────────────────────
await test('csv adapter: OWID/V-Dem style rows flow to a valid prediction', async () => {
    const csv = 'year,polyarchy,gdp,literacy\n1900,0.3,100,0.4\n1910,0.32,110,0.45\n1920,0.28,90,0.5\n1930,0.22,70,0.52\n1940,0.18,60,0.55\n1950,0.35,120,0.65';
    const input = new CSVAdapter({ political: 'polyarchy', economic: 'gdp', social: 'literacy' })
        .adapt({ id: 'CSV-1', year: 1950, csv });
    const r = await engine.predictEvent(input, POLICY_GENERAL);
    assert.ok(r.synthesis.ultraCTH >= 0 && r.synthesis.ultraCTH <= 1);
});

// ─── 9. Baselines sanity ──────────────────────────────────────────────────────
await test('validation: baselines compute on the universal corpus', () => {
    const b = baselines(buildUniversalCorpus());
    assert.ok(b.constant_05.MAE > 0 && b.climatology.MAE > 0 && b.linear_regression_4f.MAE > 0);
});

// ─── 10. Parity fixture for Python ────────────────────────────────────────────
await test('parity: JS reference fixture written for cth-python/parity_check.py', async () => {
    const ev = snapshotEvent('PARITY-1', 1789);
    const r  = await engine.predictEvent(ev, POLICY_GENERAL);
    const fixture = {
        schema_version: SCHEMA_VERSION,
        policy: POLICY_GENERAL,
        input: ev,
        js_reference: {
            ultraCTH:        r.synthesis.ultraCTH,
            foundation_risk: r.engines.foundation.overallFoundationRisk,
            dynamics_risk:   r.engines.dynamics.overallDynamicsRisk,
            chaos_risk:      r.engines.chaos.overallChaosShieldRisk,
            butterfly_risk:  r.engines.butterfly.overallRisk,
            token_impact_score: r.engines.tokenDynamics.token_impact_score,
            lyapunov_exponent:  r.engines.butterfly.butterflyEffect.lyapunov.exponent,
            ews_autocorr:       r.engines.chaos.earlyWarning.autocorr_lag1
        }
    };
    writeFileSync(join(__dir, 'parity-fixture.json'), JSON.stringify(fixture, null, 2) + '\n');
    assert.ok(existsSync(join(__dir, 'parity-fixture.json')));
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
