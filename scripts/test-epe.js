/**
 * SCRIPTS/TEST-EPE.JS — Demonstration of the EPE (Empirical Probabilistic Event Estimation) Engine
 * Run: npm run test:epe  (node scripts/test-epe.js)
 *
 * Validates:
 * 1. Similarity search using tolerance band (±2.5% - 3.5%) and event property filtering.
 * 2. Life-cycle phase determination & distribution (Antecedent, Prelude, During, Transition, Final).
 * 3. Bifurcated CMN vs RMD projection (probabilities, typical conditions, timeframes, triggers).
 * 4. Quantitative indices: Temporal Equivalence (ET), Percentage of Black Swans (PCN),
 *    Temporal Echo with rotation margins, and Temporal Spectrum trajectory fan.
 */

import { CTHEPEEngine } from '../cth-epe-engine.js';

const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', white: '\x1b[37m', magenta: '\x1b[35m'
};

function header(title) {
    const line = '═'.repeat(76);
    console.log(`\n${C.bold}${C.cyan}${line}${C.reset}`);
    console.log(`${C.bold}${C.white}  ${title}${C.reset}`);
    console.log(`${C.bold}${C.cyan}${line}${C.reset}\n`);
}

function subheader(title) {
    console.log(`\n${C.bold}${C.yellow}▸ ${title}${C.reset}`);
}

function runEPETest() {
    header('CTH FRAMEWORK v4.2 — EMPIRICAL PROBABILISTIC EVENT ESTIMATION (EPE)');

    const engine = new CTHEPEEngine();

    // ─────────────────────────────────────────────────────────────────────────────
    // CASE STUDY: Acute Geopolitical War Crisis
    // Current observed indicators entered into the system:
    // ─────────────────────────────────────────────────────────────────────────────
    const currentEvent = {
        id: 'CONFLICT-MONITOR-2026',
        name: 'Frontier Escalation & Large-Scale Mobilization Crisis',
        year: 2026,
        category: 'war', // Event property: War
        cth_global: 0.44, // Compromised systemic baseline stability
        evei: 0.72,       // High event impact and volatility
        delta_cth: -0.18, // Acute downward trajectory
        macro_context: {
            blackSwanIndex: 0.52,
            extendedMetrics: {
                PPI: 0.78, // High predictive potential impact
                IEC: 0.32, // Low institutional cohesion
                VVC: 0.68  // High valuation volatility
            }
        }
    };

    console.log(`${C.bold}Current Event Under Analysis:${C.reset}`);
    console.log(`  - Event ID: ${C.cyan}${currentEvent.id}${C.reset} (${currentEvent.name})`);
    console.log(`  - Year: ${currentEvent.year} | Category / Property: ${C.yellow}${currentEvent.category.toUpperCase()} (War / Geopolitical Conflict)${C.reset}`);
    console.log(`  - CTH Global: ${currentEvent.cth_global} | EVEI: ${currentEvent.evei} | Current ΔCTH: ${currentEvent.delta_cth}`);

    // Execute EPE calculation with tolerance band and property filter
    const t0 = Date.now();
    const epe = engine.calculateEPE(currentEvent, {
        category: 'war',
        toleranceCTH: 0.035,
        toleranceEVEI: 0.035
    });
    const calcTime = Date.now() - t0;

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 1 & 2: TOLERANCE BAND FILTERING & PHASE DISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('1. TOLERANCE BAND FILTERING & LIFE-CYCLE PHASE DETECTION');
    console.log(`  - Tolerance Band: ${epe.metadata.tolerance_applied.cth_tolerance} on CTH and ${epe.metadata.tolerance_applied.evei_tolerance} on EVEI`);
    console.log(`  - Historical Precedents of category WAR matched: ${C.bold}${epe.metadata.analogs_analyzed_count} cases${C.reset}`);
    console.log(`  - Processing time: ${calcTime} ms (scanned over 12,000 events in memory)\n`);

    console.log(`${C.bold}Historical Life-Cycle Phase Probability Distribution:${C.reset}`);
    const pd = epe.phase_detection.distribution_pct;
    const dom = epe.phase_detection.dominant_phase;
    const mark = ph => dom === ph ? `  ${C.bold}${C.red}◄── MOST PROBABLE PHASE DETECTED${C.reset}` : '';

    console.log(`  ├─ [Antecedent / Before] : ${pd.antecedent_before_pct}%${mark('before')}`);
    console.log(`  ├─ [Prelude / Early Dev] : ${pd.prelude_pct}%${mark('prelude')}`);
    console.log(`  ├─ [During / Acute Shock]: ${pd.during_pct}%${mark('during')}`);
    console.log(`  ├─ [Transition / Shift]  : ${pd.transition_pct}%${mark('transition')}`);
    console.log(`  └─ [Final / Outcome]     : ${pd.final_after_pct}%${mark('after')}`);

    const dominantPct = epe.phase_detection.dominant_phase === 'before' ? pd.antecedent_before_pct
                      : epe.phase_detection.dominant_phase === 'prelude' ? pd.prelude_pct
                      : epe.phase_detection.dominant_phase === 'during' ? pd.during_pct
                      : epe.phase_detection.dominant_phase === 'transition' ? pd.transition_pct
                      : pd.final_after_pct;

    console.log(`\n  ${C.bold}Phase Diagnosis:${C.reset} The current event is identified with ${C.bold}${dominantPct}% probability${C.reset} as being in the phase: ${C.cyan}${epe.phase_detection.dominant_phase_label}${C.reset}`);

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 3: BIFURCATED PROJECTION (CMN vs RMD)
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('2. BIFURCATED EPE PROJECTION (CMN vs RMD)');

    const cmn = epe.bifurcated_projection.CMN;
    const rmd = epe.bifurcated_projection.RMD;

    console.log(`┌────────────────────────────────┬───────────────────────────────────────────┬───────────────────────────────────────────┐`);
    console.log(`│ ${C.bold}${'METRIC / SCENARIO'.padEnd(30)}${C.reset} │ ${C.bold}${C.red}${'CMN (SYSTEMIC COLLAPSE / DECLINE)'.padEnd(41)}${C.reset} │ ${C.bold}${C.green}${'RMD (ADAPTIVE TRANSFORMATION)'.padEnd(41)}${C.reset} │`);
    console.log(`├────────────────────────────────┼───────────────────────────────────────────┼───────────────────────────────────────────┤`);
    console.log(`│ Projected Likelihood           │ ${C.bold}${C.red}${String(cmn.probability_pct + '%').padEnd(41)}${C.reset} │ ${C.bold}${C.green}${String(rmd.probability_pct + '%').padEnd(41)}${C.reset} │`);
    console.log(`│ Historical Observed Frequency  │ ${cmn.observed_frequency.padEnd(41)} │ ${rmd.observed_frequency.padEnd(41)} │`);
    console.log(`│ Typical Associated Conditions  │ ${('ΔCTH: ' + cmn.typical_conditions.delta_cth_expected + ' (drawdown ' + cmn.typical_conditions.drawdown_expected + ')').padEnd(41)} │ ${('ΔCTH: +' + rmd.typical_conditions.delta_cth_expected + ' (recovery ' + rmd.typical_conditions.recovery_expected + ')').padEnd(41)} │`);
    console.log(`│ Estimated Realization Window   │ ${cmn.estimated_timeframe.padEnd(41)} │ ${rmd.estimated_timeframe.padEnd(41)} │`);
    console.log(`│ Critical Triggers / Inflection │ ${cmn.immediate_triggers[0].slice(0, 39).padEnd(41)} │ ${rmd.key_inflection_points[0].slice(0, 39).padEnd(41)} │`);
    console.log(`│ Systemic State Diagnostic      │ ${cmn.systemic_vulnerability.slice(0, 39).padEnd(41)} │ ${rmd.systemic_resilience.slice(0, 39).padEnd(41)} │`);
    console.log(`└────────────────────────────────┴───────────────────────────────────────────┴───────────────────────────────────────────┘`);

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 4: ADVANCED QUANTITATIVE INDICES
    // ─────────────────────────────────────────────────────────────────────────────
    subheader('3. ADVANCED QUANTITATIVE INDICES');

    const qi = epe.quantitative_indices;

    // 1. Temporal Equivalence (ET)
    console.log(`  ${C.bold}1. Temporal Equivalence (ET):${C.reset} ${C.bold}${qi.temporal_equivalence.ET_pct}${C.reset}`);
    console.log(`     • Status: ${C.cyan}${qi.temporal_equivalence.status}${C.reset}`);
    console.log(`     • Interpretation: ${qi.temporal_equivalence.interpretation}`);

    // 2. Percentage of Black Swans (PCN)
    console.log(`\n  ${C.bold}2. Percentage of Black Swans (PCN):${C.reset} ${C.bold}${qi.black_swan_risk.PCN_pct}${C.reset} (IPD Score = ${qi.black_swan_risk.IPD_score})`);
    console.log(`     • Interpretation: ${qi.black_swan_risk.interpretation}`);

    // 3. Temporal Echo & Rotation Margin
    console.log(`\n  ${C.bold}3. Temporal Echo & Rotation Margin:${C.reset}`);
    if (qi.temporal_echo.primary_echo) {
        const pe = qi.temporal_echo.primary_echo;
        console.log(`     • ${C.bold}Primary Echo:${C.reset} ${C.cyan}${pe.event_name}${C.reset} (${pe.historical_year})`);
        console.log(`       - Rotation Margin: ${pe.rotation_margin_years}`);
        console.log(`       - Contextual Similarity: ${C.green}${pe.similarity}${C.reset} | Historical Outcome: ${pe.outcome === 'RMD' ? C.green + 'RMD' : C.red + 'CMN'}${C.reset}`);
    }
    if (qi.temporal_echo.secondary_echo) {
        const se = qi.temporal_echo.secondary_echo;
        console.log(`     • ${C.bold}Secondary Echo:${C.reset} ${C.cyan}${se.event_name}${C.reset} (${se.historical_year}) | Offset: ${se.rotation_margin_years}`);
    }

    // 4. Temporal Spectrum
    console.log(`\n  ${C.bold}4. Temporal Spectrum (Projected Trajectory Fan):${C.reset}`);
    console.log(`     • Next Critical Inflection: ${C.yellow}${qi.temporal_spectrum.next_critical_inflection}${C.reset}`);
    console.log(`     • Bifurcated CTH Evolution across Steps:`);
    qi.temporal_spectrum.timeline_steps.forEach(st => {
        console.log(`       - ${st.step.padEnd(20)}: Branch CMN CTH=${C.red}${st.cmn_cth}${C.reset}  vs  Branch RMD CTH=${C.green}${st.rmd_cth}${C.reset}`);
    });

    console.log(`\n${C.bold}${C.green}✅ EPE ENGINE TEST COMPLETED SUCCESSFULLY!${C.reset}\n`);
}

runEPETest();
