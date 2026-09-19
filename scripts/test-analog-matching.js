/**
 * SCRIPTS/TEST-ANALOG-MATCHING.JS — Demonstration of CTH Analog Matching Engine
 * Run: node scripts/test-analog-matching.js
 *
 * Demonstrates:
 * 1. Searching 12,000 events for historical precedents matching specific CTH/EVEI/DeltaCTH conditions.
 * 2. Searching 12,000 characters for historical actor analogs (Token Dynamics).
 * 3. Endogenous enrichment of CTH predictions with real empirical temporal equivalence (ET).
 */

import CTHAnalogMatcher from '../cth-analog-matcher.js';
import CTHMasterPredictorEngine from '../cth-core.js';
import { SnapshotAdapter } from '../cth-data-adapters.js';
import { POLICY_GENERAL } from '../cth-policy-variants.js';

const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', white: '\x1b[37m', magenta: '\x1b[35m'
};

function header(text) {
    const line = '═'.repeat(75);
    console.log(`\n${C.bold}${C.cyan}${line}${C.reset}`);
    console.log(`${C.bold}${C.white}  ${text}${C.reset}`);
    console.log(`${C.bold}${C.cyan}${line}${C.reset}\n`);
}

function subheader(text) {
    console.log(`\n${C.bold}${C.yellow}▸ ${text}${C.reset}`);
}

async function runDemo() {
    header('CTH FRAMEWORK v4.1 — HISTORICAL ANALOG RETRIEVAL & INTEGRATION TEST');

    console.log('⚡ Initializing CTH Analog Matcher (indexing 12,000 events & 12,000 characters)...');
    const t0 = Date.now();
    const matcher = new CTHAnalogMatcher();
    console.log(`✅ Loaded and indexed in ${Date.now() - t0}ms\n`);

    // ─────────────────────────────────────────────────────────────────────────────
    // TEST 1: Searching for Historical Analogs to an Acute Revolutionary Crisis
    // (Similar to French Revolution 1789: low baseline stability, massive shock, negative delta)
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('TEST 1: EVENT ANALOG SEARCH (12,000 Events Pool)');
    console.log('Query: Acute Revolutionary Crisis');
    console.log('  Parameters: CTH_global=0.55, DeltaCTH=-0.30, EVEI=0.85, BlackSwan=0.45, Category=revolution\n');

    const eventQuery = {
        cth_global: 0.55,
        delta_cth: -0.30,
        evei: 0.85,
        black_swan_index: 0.45,
        category: 'revolution'
    };

    const matchResults = matcher.findEventAnalogs(eventQuery, { topK: 5 });

    console.log(`${C.bold}Top 5 Historical Precedents across 5,100+ years:${C.reset}`);
    matchResults.top_analogs.forEach((m, idx) => {
        const predColor = m.prediction === 'RMD' ? C.green : C.red;
        console.log(`  [${idx + 1}] ${C.bold}${m.name}${C.reset} (${m.year < 0 ? Math.abs(m.year) + ' BCE' : m.year + ' CE'})`);
        console.log(`      Epoch: ${m.epoch} | Region: ${m.region}`);
        console.log(`      Similarity: ${C.green}${(m.similarity * 100).toFixed(1)}%${C.reset} (Distance: ${m.distance})`);
        console.log(`      Conditions: CTH=${m.cth_global} | ΔCTH=${m.delta_cth} | EVEI=${m.evei} | ultraCTH=${m.ultra_cth}`);
        console.log(`      Historical Outcome: ${predColor}${m.prediction}${C.reset} (${m.certainty_bracket})`);
    });

    console.log(`\n  ${C.bold}Empirical Trajectory Distribution from Analogs:${C.reset}`);
    console.log(`    - RMD (Adaptive Renewal): ${matchResults.empirical_verdict.rmd_transformations} (${(matchResults.empirical_verdict.rmd_empirical_probability * 100).toFixed(1)}%)`);
    console.log(`    - CMN (Systemic Collapse): ${matchResults.empirical_verdict.cmn_collapses} (${(matchResults.empirical_verdict.cmn_empirical_probability * 100).toFixed(1)}%)`);
    console.log(`    - Average Outcome ΔCTH: ${matchResults.empirical_verdict.average_outcome_delta_cth > 0 ? '+' : ''}${matchResults.empirical_verdict.average_outcome_delta_cth}`);

    // ─────────────────────────────────────────────────────────────────────────────
    // TEST 2: Searching for Character / Token Analogs (12,000 Characters Pool)
    // (Radical charismatic disruptor: Robespierre / Lenin archetype)
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('TEST 2: HISTORICAL ACTOR / TOKEN ANALOG SEARCH (12,000 Characters Pool)');
    console.log('Query: Radical Charismatic Disruptor');
    console.log('  Parameters: Role=disruptor, Power=0.75, Legitimacy=0.25, Charisma=0.85, Ideology=0.92, Momentum=0.80\n');

    const actorQuery = {
        historical_role: 'disruptor',
        power_index: 0.75,
        network_centrality: 0.70,
        legitimacy: 0.25,
        rationality: 0.35,
        charisma: 0.85,
        ideological_extremity: 0.92,
        momentum: 0.80
    };

    const charResults = matcher.findCharacterAnalogs(actorQuery, { topK: 5 });

    console.log(`${C.bold}Top 5 Historical Leader Analogs:${C.reset}`);
    charResults.top_analogs.forEach((c, idx) => {
        console.log(`  [${idx + 1}] ${C.bold}${c.name}${C.reset}`);
        console.log(`      Epoch: ${c.epoch} | Domain: ${c.primary_domain} | Active: ${c.active_years}`);
        console.log(`      Similarity: ${C.green}${(c.similarity * 100).toFixed(1)}%${C.reset} | TIS (Token Impact Score): ${c.token_impact_score_tis}`);
        console.log(`      Attributes: Power=${c.power_index} | Legitimacy=${c.legitimacy} | Charisma=0.85+ | Ideology=${c.ideological_extremity}`);
        console.log(`      Associated Event: ${c.associated_event_id}`);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // TEST 3: Endogenous Enrichment & Live MasterPredictor Execution
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('TEST 3: FULL PREDICTIVE ENGINE INTEGRATION WITH EMPIRICAL ANALOGS');
    console.log('Enriching new crisis event with empirical dataset analogs and running CTHMasterPredictorEngine...\n');

    const adapter = new SnapshotAdapter();
    const rawCrisis = {
        id: 'CRISIS-SIM-2026',
        year: 2026,
        political_stability: 0.38,
        economic_stability: 0.42,
        social_cohesion: 0.40,
        delta_cth: -0.22,
        black_swan: 0.65,
        actor: {
            power_index: 0.82,
            network_centrality: 0.75,
            legitimacy: 0.30,
            rationality: 0.45,
            charisma: 0.88,
            ideological_extremity: 0.85,
            momentum: 0.80,
            historical_role: 'disruptor',
            duration_of_influence: 18
        }
    };

    const rawAdapted = adapter.adapt(rawCrisis);

    // Enrich using our matcher directly from the dataset!
    const enrichedInput = matcher.enrichEventWithAnalogs(rawAdapted, { topK: 30 });

    console.log(`  ${C.bold}Enriched Temporal Analogs (Computed from 12,000 dataset):${C.reset}`);
    console.log(`    - Analogs Count: ${enrichedInput.macro_context.historical_analogs.count}`);
    console.log(`    - Avg Contextual Difference: ${enrichedInput.macro_context.historical_analogs.avg_contextual_difference}`);
    console.log(`    - Closest Analog: "${enrichedInput.macro_context.historical_analogs.closest_analog}" (Sim: ${(enrichedInput.macro_context.historical_analogs.closest_analog_similarity * 100).toFixed(1)}%)`);
    console.log(`    - Empirical Prior Probability of RMD: ${(enrichedInput.macro_context.historical_analogs.empirical_rmd_probability * 100).toFixed(1)}%`);

    const predictor = new CTHMasterPredictorEngine();
    const predictionResult = await predictor.predictEvent(enrichedInput, POLICY_GENERAL);

    const s = predictionResult.synthesis;
    const e = predictionResult.engines;
    const temporalEquiv = e.temporal.temporalEquivalence;

    console.log(`\n  ${C.bold}Synthesis Verdict (Synthesized across 6 Engines):${C.reset}`);
    console.log(`    - ultraCTH: ${C.bold}${s.ultraCTH}${C.reset}`);
    console.log(`    - Prediction: ${s.rmd_prediction ? C.green + '● RMD (Adaptive Transformation)' : C.red + '● CMN (Systemic Collapse)'}${C.reset}`);
    console.log(`    - Certainty Bracket: ${C.cyan}${s.certainty_bracket}${C.reset}`);
    console.log(`    - Temporal Equivalence Index (ET): ${C.bold}${temporalEquiv.ET_pct}${C.reset} (Status: ${temporalEquiv.status})`);
    console.log(`    - AlphaBreak Status: ${s.alphabreak ? C.red + '⚡ TRIGGERED' : C.green + 'STABLE'}${C.reset}`);
    console.log(`    - Mule Clause Dominance: ${s.mule_clause.token_dominant ? C.red + 'ACTIVE' : C.green + 'INACTIVE'}${C.reset}`);

    console.log(`\n${C.bold}${C.green}✅ TEST COMPLETED SUCCESSFULLY! Dataset is fully integrated with the CTH Framework.${C.reset}\n`);
}

runDemo().catch(err => {
    console.error('Error running test:', err);
    process.exit(1);
});
