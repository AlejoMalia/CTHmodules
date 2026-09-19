/**
 * CTH-POLICY-VARIANTS.JS — v4.1
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Specialized Policy lenses derived from the v3.1 reference baseline.
 * Each policy tunes synthesis weights, bonuses, and token modifiers for
 * a specific analytical domain. All values are independently auditable.
 *
 * Available policies:
 *   POLICY_GENERAL        — balanced baseline (mirrors EXAMPLE_POLICY_V31_REFERENCE)
 *   POLICY_GEOPOLITICAL   — elevated Chaos/Dynamics/Token for conflict, crisis, war
 *   POLICY_ECONOMIC       — elevated Foundation/Analysis for reforms, fiscal policy
 *   POLICY_TECHNOLOGICAL  — elevated Butterfly/Temporal for tech transitions, paradigm shifts
 *   POLICY_REVOLUTIONARY  — extreme Token sensitivity + Chaos for revolutions, coups
 */

// ── Shared sub-configs (common across all variants unless overridden) ──────────
const _shared_foundation = {
    nSim:        25000,
    noise_scale: 0.08,
    indicator_weights: { CTH: 0.40, A: 0.20, B: 0.25, C: 0.35 },
    risk_weights:      { cth: 0.45, evei: 0.35, black_swan: 0.20 },
    alphabreak_threshold: 0.65,
    hedge_threshold:      0.60,
    phase_estimation_factor: 0.15,
    inference_floor:         0.10
};

const _shared_temporal = {
    phases: [
        { name: "Before",     range: "T-Minus",        fatigue: 0.00, intensity: 0.40 },
        { name: "Prelude",    range: "Warning Zone",   fatigue: 0.05, intensity: 0.60 },
        { name: "During",     range: "Zero-Point",     fatigue: 0.12, intensity: 0.95 },
        { name: "Transition", range: "Diffusion Area", fatigue: 0.22, intensity: 0.75 },
        { name: "Aftermath",  range: "Settlement",     fatigue: 0.38, intensity: 0.55 }
    ],
    analog_variance_range:         0.08,
    pantemporal_threshold:         0.90,
    et_scale_factor:              180,
    et_no_disparity_threshold:     85,
    et_moderate_threshold:         65,
    triphasic_weights:  { cth: 0.60, evei: 0.40 },
    pentaphasic_weights: { cth: 0.55, evei: 0.35, black_swan: 0.10 },
    supraphasic_multiplier:        1.25,
    risk_weights: { et: 0.30, pantemporal: 0.25, pentaphasic: 0.25, zenith: 0.20 },
    alphabreak_threshold:          0.65,
    critical_inflection_threshold: 0.72,
    rmd_threshold:                 0.72,
    pentaphasic_low_threshold:     0.62,
    pentaphasic_high_risk:         0.75,
    pentaphasic_low_risk:          0.18,
    zenith_during_risk:            0.35,
    zenith_other_risk:             0.65,
    outcome_factors: {
        transition_win:     0.18,
        transition_default: 0.28,
        after_win:          0.09,
        after_default:      0.14
    }
};

const _shared_dynamics = {
    nSim_black_swan: 25000,
    nSim_spectrum:   30000,
    nSim_butterfly:  12000,
    cmn_rmd_weights: { evei: 0.25, iec: 0.20, ppi: 0.18, vvc: 0.15, mce: 0.12, delta_cth: 0.10 },
    risk_weights:    { var: 0.40, pcn: 0.25, rmd: 0.20, butterfly_div: 0.15 },
    alphabreak_threshold: 0.68,
    hedge_threshold:      0.65,
    black_swan: {
        tail_av: 0.52, tail_tf: 0.48,
        wave_freq:  [0.00073, 0.00061, 0.00088, 0.00079],
        phase_av:   [4.17, 1.73],
        phase_tf:   [2.91, 5.02],
        phase_sum:  3.14,
        phase_u:    6.2832,
        p_base: 0.20, p_range: 0.60,
        h_base: 0.15, h_range: 0.70,
        e_base: 0.05, e_range: 0.30,
        o_base: 0.10, o_range: 0.50,
        cross_scalar: 0.22,
        w_p: 0.34, w_h: 0.29, w_e: 0.20, w_o: 0.17
    },
    pcn: { ppi_weight: 0.45, iec_factor: 0.30, vvc_weight: 0.25, normalization: 0.875 },
    spectrum: {
        amplitude_base:       0.12,
        bs_amplitude_factor:  1.00,
        av_weight:            0.50,
        tf_weight:            0.50,
        noise_freq:           0.0011,
        noise_phase_av:       6.28,
        noise_phase_tf:       3.77,
        prelude_threshold:    0.78,
        during_threshold:     0.82,
        after_threshold:      0.75
    },
    butterfly_analysis: {
        base_scale:   0.018,
        av_weight:    0.28,
        tf_weight:    0.72,
        bs_multiplier: 1.80,
        noise_freq:   0.00147,
        noise_phase_av: 5.50,
        noise_phase_tf: 4.10,
        period_mod:   17,
        period_scale: 0.011,
        alert_threshold: 0.035
    }
};

const _shared_chaos = {
    risk_weights: { entropy: 0.30, eri: 0.25, blindspots: 0.20, polarization: 0.15, fatigue: 0.10 },
    alphabreak_threshold: 0.75,
    hedge_threshold:      0.70,
    resonance_multiplier: 1.45,
    eri: { base: 0.55, recovery_factor: 1.80, shock_factor: 0.90 },
    blindspot: { alert_threshold: 0.28, adjustment_factor: -0.12 },
    polarization: { delta_factor: 1.20, bs_factor: 0.85 },
    fatigue_multiplier: 1.00,
    valley: { threshold: 0.72, reversion_factor: 1.22, normal_factor: 0.95 },
    noise:  { scale: 0.06, bs_modifier: 0.38, hedge_threshold: 0.04 },
    bivariate: { rho_base: 0.68, rho_spread: 0.24, multiplier: 1.35, revolution_threshold: 0.75 },
    // Phase F.30 — Early Warning Signals (critical slowing down, Scheffer)
    early_warning: { variance_ratio_threshold: 1.5, autocorr_threshold: 0.35 }
};

const _shared_butterfly_field = {
    nSim_causal: 25000,
    nSim_risk:   20000,
    ip_threshold: 0.90,
    stability_thresholds: {
        absolute_anchor:    0.98,
        structural_constant: 0.90,
        trend_inertia:      0.75
    },
    verdict_thresholds: { gpc: 0.70 },
    field_constants: { wBefore: 0.20, wPrelude: 0.30, wDuring: 0.50, alpha: 0.30, beta: 0.20, eta: 0.40 },
    greeks:           { delta: 0.75, gamma: 0.15, lambda: 0.10 },
    alphabreak_threshold: 0.65,
    risk_weights: { iec: 0.25, vvc: 0.20, mce: 0.15, ppi: 0.20, divergence: 0.20 },
    high_volatility_threshold: 0.08,
    pee_base:              0.50,
    pee_verdict_threshold: 0.75,
    die_threshold:         0.85,
    die_exponent:          0.40,
    somatic_resonance_threshold: 0.04,
    // Phase F.29 — Lyapunov exponent estimation (logistic-family surrogate map)
    lyapunov: { iterations: 200, gain_min: 2.6, gain_max: 3.99, initial_separation: 1e-4 }
};

const _shared_analysis = {
    nSim: 15000,
    extended_ranges: {
        iec_base: 0.45, iec_range: 0.35,
        ppi_base: 0.55, ppi_range: 0.40,
        vvc_base: 0.35, vvc_range: 0.30,
        mce_base: 0.60, mce_range: 0.25,
        iig_base: 0.50, iig_range: 0.45
    },
    risk_weights: { cth: 0.30, evei: 0.35, ppi: 0.20, vvc: 0.15 },
    alphabreak_threshold: 0.68,
    margin_weights: {
        macro: { cth: 0.40, evei: 0.40, fp: 0.20 },
        micro: { cth: 0.50, evei: 0.30, fp: 0.20 }
    }
};

const _shared_causal_inheritance = {
    stress_factor:    0.14,
    half_life:        null,
    cth_factor:       0.42,
    evei_factor:      0.38,
    black_swan_factor: 0.28,
    delta_cth_factor:  0.12,
    adaptive_penalty:  0.22
};

const _shared_synthesis_common = {
    nSim_deep_zoom:        50000,
    deep_zoom_noise_scale: 0.04,
    deep_zoom_center:      0.65,
    deep_zoom_clamp:       [0.20, 0.99],
    deep_zoom_triggers: {
        dynamics:  0.78,
        chaos:     0.85,
        butterfly: 0.78
    },
    prediction_threshold:     0.63,
    alphabreak_threshold:     0.73,
    recommendation_threshold: 0.68,
    certainty_brackets: [
        { threshold: 0.70, label: "BRACKET_HIGH" },
        { threshold: 0.63, label: "BRACKET_MEDIUM" },
        { threshold: null, label: "BRACKET_BASE" }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY_GENERAL — balanced baseline
// ─────────────────────────────────────────────────────────────────────────────
export const POLICY_GENERAL = {
    version:     "4.1-general",
    author:      "Alejo Malia",
    domain:      "General socio-historical analysis",
    description: "Balanced baseline. Equal weight across all engines. Suitable for mixed-domain corpora.",
    created_at:  "2026-05-19",

    synthesis: {
        ..._shared_synthesis_common,
        weights: {
            foundation: 0.25,
            analysis:   0.20,
            dynamics:   0.20,
            temporal:   0.20,
            chaos:      0.09,
            butterfly:  0.06
        },
        trajectory_bonus:     0.38,
        reported_delta_bonus: 0.25
    },

    foundation:        _shared_foundation,
    temporal:          _shared_temporal,
    dynamics:          _shared_dynamics,
    chaos:             _shared_chaos,
    butterfly_field:   _shared_butterfly_field,
    analysis:          _shared_analysis,
    causal_inheritance: _shared_causal_inheritance,
    mule_clause:       { token_dominance_threshold: 1.5 },
    reflexivity:       { max_certainty_penalty: 0.10 },
    population_modulation: { min_population_for_full_certainty: 1000000 },

    token_dynamics: {
        weights: {
            power:            0.25,
            network:          0.15,
            charisma:         0.15,
            momentum:         0.15,
            ideological:      0.15,
            anti_legitimacy:  0.10,
            anti_rationality: 0.05
        },
        duration_normalization: 50,
        sensitivity:            0.30,
        multiplier_clamp:       [0.75, 1.25],
        // Phase F.28 — multi-token interaction: contested-event detection
        conflict_threshold:         0.10,
        conflict_certainty_penalty: 0.25,
        role_modifiers: {
            disruptor:  { foundation: 1.15, dynamics: 1.20, chaos: 1.25 },
            catalyst:   { foundation: 1.05, dynamics: 1.15, chaos: 1.10 },
            stabilizer: { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },
            architect:  { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },
            wildcard:   { foundation: 1.00, dynamics: 1.05, chaos: 1.10 }
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY_GEOPOLITICAL — crisis, conflict, war, interstate rivalry
// Elevates Chaos (disorder is primary) and Dynamics (black swan + cascade).
// Token disruptors amplified more — individual actors shift outcomes in crises.
// Lower trajectory bonus — geopolitical events rarely show clean deltaCTH arcs.
// ─────────────────────────────────────────────────────────────────────────────
export const POLICY_GEOPOLITICAL = {
    version:     "4.1-geopolitical",
    author:      "Alejo Malia",
    domain:      "Geopolitical conflict and interstate crisis",
    description: "Higher Chaos/Dynamics weight for conflicts, wars, and diplomatic crises. "
               + "Token disruptors amplified. Lower trajectory bonus (arcs are non-linear).",
    created_at:  "2026-05-19",

    synthesis: {
        ..._shared_synthesis_common,
        weights: {
            foundation: 0.18,
            analysis:   0.12,
            dynamics:   0.25,
            temporal:   0.15,
            chaos:      0.20,
            butterfly:  0.10
        },
        trajectory_bonus:     0.20,
        reported_delta_bonus: 0.10
    },

    foundation:        _shared_foundation,
    temporal:          _shared_temporal,
    dynamics:          _shared_dynamics,
    chaos:             { ..._shared_chaos, alphabreak_threshold: 0.70, hedge_threshold: 0.65 },
    butterfly_field:   _shared_butterfly_field,
    analysis:          _shared_analysis,
    causal_inheritance: _shared_causal_inheritance,
    mule_clause:       { token_dominance_threshold: 1.3 },   // lower → easier to flag dominant actors
    reflexivity:       { max_certainty_penalty: 0.08 },
    population_modulation: { min_population_for_full_certainty: 1000000 },

    token_dynamics: {
        weights: {
            power:            0.30,   // structural power more decisive in conflicts
            network:          0.15,
            charisma:         0.10,
            momentum:         0.18,   // momentum matters more — war winners keep winning
            ideological:      0.12,
            anti_legitimacy:  0.10,
            anti_rationality: 0.05
        },
        duration_normalization: 50,
        sensitivity:            0.35,   // more sensitive — actors swing outcomes harder
        multiplier_clamp:       [0.70, 1.35],
        role_modifiers: {
            disruptor:  { foundation: 1.20, dynamics: 1.30, chaos: 1.35 },   // wars amplify disruptors
            catalyst:   { foundation: 1.08, dynamics: 1.20, chaos: 1.15 },
            stabilizer: { foundation: 0.80, dynamics: 0.82, chaos: 0.72 },
            architect:  { foundation: 0.80, dynamics: 0.82, chaos: 0.72 },
            wildcard:   { foundation: 1.02, dynamics: 1.10, chaos: 1.18 }
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY_ECONOMIC — fiscal reform, monetary policy, structural adjustment
// Elevates Foundation (institutions drive economic outcomes) and Analysis
// (data quality matters more in economic domains).
// Higher trajectory bonus — successful reforms show clear pre/post CTH improvement.
// ─────────────────────────────────────────────────────────────────────────────
export const POLICY_ECONOMIC = {
    version:     "4.1-economic",
    author:      "Alejo Malia",
    domain:      "Economic reform and fiscal/monetary policy",
    description: "Higher Foundation/Analysis weight for economic events. "
               + "Higher trajectory bonus — successful reforms leave a clear structural signature.",
    created_at:  "2026-05-19",

    synthesis: {
        ..._shared_synthesis_common,
        weights: {
            foundation: 0.35,
            analysis:   0.25,
            dynamics:   0.18,
            temporal:   0.12,
            chaos:      0.07,
            butterfly:  0.03
        },
        trajectory_bonus:     0.45,
        reported_delta_bonus: 0.35   // economic reforms show strong deltaCTH signal
    },

    foundation:        { ..._shared_foundation, risk_weights: { cth: 0.50, evei: 0.32, black_swan: 0.18 } },
    temporal:          _shared_temporal,
    dynamics:          _shared_dynamics,
    chaos:             _shared_chaos,
    butterfly_field:   _shared_butterfly_field,
    analysis:          { ..._shared_analysis, risk_weights: { cth: 0.25, evei: 0.30, ppi: 0.25, vvc: 0.20 } },
    causal_inheritance: _shared_causal_inheritance,
    mule_clause:       { token_dominance_threshold: 1.8 },   // higher — economic outcomes are more structural
    reflexivity:       { max_certainty_penalty: 0.12 },
    population_modulation: { min_population_for_full_certainty: 500000 },   // smaller polities can run clean reforms

    token_dynamics: {
        weights: {
            power:            0.20,
            network:          0.20,   // coalition building drives economic reform
            charisma:         0.10,
            momentum:         0.12,
            ideological:      0.18,   // ideological clarity matters (Thatcher, Milei)
            anti_legitimacy:  0.12,
            anti_rationality: 0.08
        },
        duration_normalization: 50,
        sensitivity:            0.25,   // less sensitive — institutions outweigh actors in economics
        multiplier_clamp:       [0.80, 1.20],
        role_modifiers: {
            disruptor:  { foundation: 1.10, dynamics: 1.15, chaos: 1.20 },
            catalyst:   { foundation: 1.05, dynamics: 1.10, chaos: 1.08 },
            stabilizer: { foundation: 0.85, dynamics: 0.88, chaos: 0.80 },
            architect:  { foundation: 0.78, dynamics: 0.82, chaos: 0.70 },   // architects dampen most in economics
            wildcard:   { foundation: 1.02, dynamics: 1.05, chaos: 1.12 }
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY_TECHNOLOGICAL — tech transitions, paradigm shifts, platform disruptions
// Elevates Butterfly (sensitive initial conditions) and Temporal (timing is everything).
// Highest trajectory bonus — tech revolutions show the clearest before/after signature.
// ─────────────────────────────────────────────────────────────────────────────
export const POLICY_TECHNOLOGICAL = {
    version:     "4.1-technological",
    author:      "Alejo Malia",
    domain:      "Technological transition and paradigm shift",
    description: "Higher Butterfly/Temporal weight for tech events. "
               + "Highest trajectory bonus — paradigm shifts leave the strongest structural signature.",
    created_at:  "2026-05-19",

    synthesis: {
        ..._shared_synthesis_common,
        weights: {
            foundation: 0.18,
            analysis:   0.12,
            dynamics:   0.22,
            temporal:   0.26,
            chaos:      0.09,
            butterfly:  0.13
        },
        trajectory_bonus:     0.55,
        reported_delta_bonus: 0.30
    },

    foundation:        _shared_foundation,
    temporal:          {
        ..._shared_temporal,
        // Tech events: prelude phase is critical (R&D, early adoption)
        risk_weights: { et: 0.25, pantemporal: 0.30, pentaphasic: 0.30, zenith: 0.15 }
    },
    dynamics:          _shared_dynamics,
    chaos:             _shared_chaos,
    butterfly_field:   {
        ..._shared_butterfly_field,
        // Butterfly field is more sensitive for tech — small initial conditions matter enormously
        somatic_resonance_threshold: 0.03,
        high_volatility_threshold:   0.06,
        risk_weights: { iec: 0.20, vvc: 0.20, mce: 0.20, ppi: 0.20, divergence: 0.20 }
    },
    analysis:          _shared_analysis,
    causal_inheritance: { ..._shared_causal_inheritance, half_life: 15 },   // tech stress decays faster (15-year half-life)
    mule_clause:       { token_dominance_threshold: 1.6 },
    reflexivity:       { max_certainty_penalty: 0.10 },
    population_modulation: { min_population_for_full_certainty: 100000 },   // tech adopters, not full populations

    token_dynamics: {
        weights: {
            power:            0.15,
            network:          0.25,   // network centrality is decisive in tech (Metcalfe's law)
            charisma:         0.18,   // visionary founders move markets
            momentum:         0.20,   // tech adoption curves are momentum-driven
            ideological:      0.08,
            anti_legitimacy:  0.08,
            anti_rationality: 0.06
        },
        duration_normalization: 20,   // tech cycles shorter than historical cycles
        sensitivity:            0.40,   // most sensitive — tech disruptors reshape entire sectors
        multiplier_clamp:       [0.70, 1.40],
        role_modifiers: {
            disruptor:  { foundation: 1.12, dynamics: 1.25, chaos: 1.20 },
            catalyst:   { foundation: 1.08, dynamics: 1.18, chaos: 1.12 },
            stabilizer: { foundation: 0.85, dynamics: 0.88, chaos: 0.78 },
            architect:  { foundation: 0.80, dynamics: 0.85, chaos: 0.74 },
            wildcard:   { foundation: 1.05, dynamics: 1.12, chaos: 1.15 }
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY_REVOLUTIONARY — revolutions, coups, regime changes, social upheaval
// Maximum Token sensitivity for disruptors — revolutionary actors define outcomes.
// Highest Chaos weight — disorder is the medium, not the exception.
// Lowest trajectory bonus — revolutions rarely show smooth deltaCTH arcs.
// ─────────────────────────────────────────────────────────────────────────────
export const POLICY_REVOLUTIONARY = {
    version:     "4.1-revolutionary",
    author:      "Alejo Malia",
    domain:      "Revolution, coup, and regime change",
    description: "Maximum Token/Chaos sensitivity for revolutionary events. "
               + "Disruptors amplified maximally. Lowest trajectory bonus — ruptures dominate.",
    created_at:  "2026-05-19",

    synthesis: {
        ..._shared_synthesis_common,
        weights: {
            foundation: 0.20,
            analysis:   0.12,
            dynamics:   0.25,
            temporal:   0.20,
            chaos:      0.18,
            butterfly:  0.05
        },
        trajectory_bonus:     0.15,
        reported_delta_bonus: 0.05   // revolutions rarely show positive reported deltaCTH
    },

    foundation:        _shared_foundation,
    temporal:          _shared_temporal,
    dynamics:          _shared_dynamics,
    chaos:             {
        ..._shared_chaos,
        // Revolutions live in chaos — lower thresholds to surface real chaos signal
        alphabreak_threshold: 0.65,
        hedge_threshold:      0.58,
        polarization: { delta_factor: 1.50, bs_factor: 0.90 },   // polarization amplified
        bivariate: { rho_base: 0.72, rho_spread: 0.28, multiplier: 1.55, revolution_threshold: 0.65 }
    },
    butterfly_field:   _shared_butterfly_field,
    analysis:          _shared_analysis,
    causal_inheritance: { ..._shared_causal_inheritance, stress_factor: 0.20 },   // revolution stress spreads harder
    mule_clause:       { token_dominance_threshold: 1.2 },   // very easy to flag — revolutions ARE actor-dominated
    reflexivity:       { max_certainty_penalty: 0.08 },
    population_modulation: { min_population_for_full_certainty: 1000000 },

    token_dynamics: {
        weights: {
            power:            0.22,
            network:          0.15,
            charisma:         0.22,   // charismatic leaders define revolutions (Lenin, Robespierre)
            momentum:         0.18,
            ideological:      0.15,   // ideological clarity drives revolutionary cohesion
            anti_legitimacy:  0.05,
            anti_rationality: 0.03
        },
        duration_normalization: 50,
        sensitivity:            0.45,   // maximum sensitivity — actors dominate revolutionary outcomes
        multiplier_clamp:       [0.65, 1.45],
        role_modifiers: {
            disruptor:  { foundation: 1.20, dynamics: 1.30, chaos: 1.40 },   // maximum amplification
            catalyst:   { foundation: 1.10, dynamics: 1.20, chaos: 1.18 },
            stabilizer: { foundation: 0.78, dynamics: 0.80, chaos: 0.68 },
            architect:  { foundation: 0.78, dynamics: 0.80, chaos: 0.68 },
            wildcard:   { foundation: 1.05, dynamics: 1.12, chaos: 1.20 }
        }
    }
};

export default {
    POLICY_GENERAL,
    POLICY_GEOPOLITICAL,
    POLICY_ECONOMIC,
    POLICY_TECHNOLOGICAL,
    POLICY_REVOLUTIONARY
};
