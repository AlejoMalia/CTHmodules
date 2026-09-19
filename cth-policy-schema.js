/**
 * CTH-POLICY-SCHEMA.JS — v4.1
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Canonical Policy publication format (Phase E.21).
 *
 * A Policy is a self-contained, versioned, citable object that encodes
 * every numeric assumption the kernel will apply during analysis.
 * Two analysts using the same kernel but different Policies produce
 * independently auditable, comparable results.
 *
 * This file ships ONLY an example Policy derived from the original v3.1
 * hardcoded values. It is a reference starting point, not a prescription.
 * Override any value to change analytic behavior without touching the kernel.
 *
 * To publish your Policy:
 *   1. Set version, author, domain, and description.
 *   2. Adjust values to your domain/calibration.
 *   3. Distribute this object as a JSON file or module.
 *   Consumers cite it as: policy.author + "@" + policy.version
 */

export const EXAMPLE_POLICY_V31_REFERENCE = {

    // ── Identity ────────────────────────────────────────────────────────────────
    version:     "3.1-reference",
    author:      "Alejo Malia",
    domain:      "General socio-historical analysis",
    description: "Reference policy derived from CTH v3.1 hardcoded values. "
               + "Use as a calibration baseline. Not validated against any corpus.",
    created_at:  "2026-05-17",

    // ── Synthesis (Master Predictor) ────────────────────────────────────────────
    synthesis: {
        weights: {
            foundation: 0.25,   // raised — structural stability is the primary signal
            analysis:   0.20,   // raised
            dynamics:   0.20,   // raised
            temporal:   0.20,   // raised
            chaos:      0.09,   // lowered — prevents chaos from dominating synthesis
            butterfly:  0.06    // lowered
        },
        // Trajectory signal: rewards rising-CTH events, penalizes collapsing ones.
        // Applied as: ultraCTH += deltaCTH_Total * trajectory_bonus (clamped [0,1]).
        // deltaCTH_Total = phasesCTH.after − phasesCTH.before (Foundation engine).
        // Positive → managed transformations get bonus; negative → ruptures get penalty.
        trajectory_bonus:         0.38,
        reported_delta_bonus:     0.25,   // positive macro_context.deltaCTH only → rewards managed transformations without penalizing ruptures
        prediction_threshold:     0.63,   // ultraCTH > this → rmd_prediction: true
        alphabreak_threshold:     0.73,   // ultraCTH > this → full alphabreak status
        recommendation_threshold: 0.68,   // ultraCTH ≤ this → recommend_anchor: true
        certainty_brackets: [
            { threshold: 0.70, label: "BRACKET_HIGH" },
            { threshold: 0.63, label: "BRACKET_MEDIUM" },
            { threshold: null, label: "BRACKET_BASE" }
        ],
        nSim_deep_zoom:        50000,
        deep_zoom_noise_scale: 0.04,
        deep_zoom_center:      0.65,   // fallback center aligned with new prediction_threshold
        deep_zoom_clamp:       [0.20, 0.99],
        deep_zoom_triggers: {
            dynamics:  0.78,   // raised — only trigger for genuinely extreme dynamics
            chaos:     0.85,   // raised — avoids constant triggering on high-chaos events
            butterfly: 0.78
        }
    },

    // ── Foundation Engine ───────────────────────────────────────────────────────
    foundation: {
        nSim:        25000,
        noise_scale: 0.08,
        indicator_weights: { CTH: 0.40, A: 0.20, B: 0.25, C: 0.35 },
        // Higher cth weight rewards events with structural cohesion; lower black_swan weight
        // reduces over-penalization of events that were predictable/managed
        risk_weights:      { cth: 0.45, evei: 0.35, black_swan: 0.20 },
        alphabreak_threshold: 0.65,
        hedge_threshold:      0.60,
        phase_estimation_factor: 0.15,
        inference_floor:         0.10
    },

    // ── Temporal Engine ─────────────────────────────────────────────────────────
    temporal: {
        phases: [
            { name: "Before",     range: "T-Minus",         fatigue: 0.00, intensity: 0.40 },
            { name: "Prelude",    range: "Warning Zone",    fatigue: 0.05, intensity: 0.60 },
            { name: "During",     range: "Zero-Point",      fatigue: 0.12, intensity: 0.95 },
            { name: "Transition", range: "Diffusion Area",  fatigue: 0.22, intensity: 0.75 },
            { name: "Aftermath",  range: "Settlement",      fatigue: 0.38, intensity: 0.55 }
        ],
        analog_variance_range:      0.08,
        pantemporal_threshold:      0.90,
        // Fixed: was 1800, which forced ET=0 for all events with avgDiff > 0.056
        // Now 180 → meaningful ET range (60–90) for typical analog differences (0.07–0.16)
        et_scale_factor:           180,
        et_no_disparity_threshold:  85,
        et_moderate_threshold:      65,
        triphasic_weights:  { cth: 0.60, evei: 0.40 },
        pentaphasic_weights: { cth: 0.55, evei: 0.35, black_swan: 0.10 },
        supraphasic_multiplier:     1.25,
        risk_weights: { et: 0.30, pantemporal: 0.25, pentaphasic: 0.25, zenith: 0.20 },
        alphabreak_threshold:       0.65,
        critical_inflection_threshold: 0.72,   // lowered from 0.82
        rmd_threshold:              0.72,       // lowered from 0.80
        pentaphasic_low_threshold:  0.62,       // slightly lowered from 0.65
        pentaphasic_high_risk:      0.75,       // softened from 0.80 (step now continuous via interpolation)
        pentaphasic_low_risk:       0.18,       // slightly lower floor
        zenith_during_risk:         0.35,       // lowered from 0.40 — During is intense but expected
        zenith_other_risk:          0.65,       // lowered from 0.70
        outcome_factors: {
            transition_win:     0.18,
            transition_default: 0.28,
            after_win:          0.09,
            after_default:      0.14
        }
    },

    // ── Predictive Dynamics Engine ───────────────────────────────────────────────
    dynamics: {
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
            phase_u:    6.2832,        // 2π
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
    },

    // ── Chaos Resilience Engine ──────────────────────────────────────────────────
    chaos: {
        risk_weights: { entropy: 0.30, eri: 0.25, blindspots: 0.20, polarization: 0.15, fatigue: 0.10 },
        alphabreak_threshold: 0.75,   // raised from 0.68
        hedge_threshold:      0.70,   // raised from 0.65
        resonance_multiplier: 1.45,   // now unused (entropy no longer amplifies fatigue)
        eri: { base: 0.55, recovery_factor: 1.80, shock_factor: 0.90 },
        blindspot: { alert_threshold: 0.28, adjustment_factor: -0.12 },
        polarization: { delta_factor: 1.20, bs_factor: 0.85 },   // lowered: prevents saturation on typical historical events
        fatigue_multiplier: 1.00,   // lowered from 1.35: i=2 term was dominating
        valley: { threshold: 0.72, reversion_factor: 1.22, normal_factor: 0.95 },
        noise:  { scale: 0.06, bs_modifier: 0.38, hedge_threshold: 0.04 },
        bivariate: { rho_base: 0.68, rho_spread: 0.24, multiplier: 1.35, revolution_threshold: 0.75 }
    },

    // ── Butterfly Field Engine ───────────────────────────────────────────────────
    butterfly_field: {
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
        somatic_resonance_threshold: 0.04
    },

    // ── Analysis Engine ──────────────────────────────────────────────────────────
    analysis: {
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
    },

    // ── Causal Inheritance (Phase D.20) ─────────────────────────────────────────
    // half_life is in the same units as epoch_descriptor.duration_since_parent
    causal_inheritance: {
        stress_factor:    0.14,
        half_life:        null,    // null = no decay (flat inheritance, legacy behavior)
        cth_factor:       0.42,
        evei_factor:      0.38,
        black_swan_factor: 0.28,
        delta_cth_factor:  0.12,
        adaptive_penalty:  0.22
    },

    // ── Mule Clause (Phase D.17) ────────────────────────────────────────────────
    // token_strength = actor_volatility*0.35 + trigger_force*0.25 + network_density*0.20 + legitimacy_index*0.20
    // macro_strength = cth_global*0.50 + evei_average*0.30 + adaptive_capacity*0.20
    mule_clause: {
        token_dominance_threshold: 1.5   // ratio of token_strength/macro_strength above this → flag
    },

    // ── Reflexivity (Phase D.18) ────────────────────────────────────────────────
    reflexivity: {
        max_certainty_penalty: 0.10   // observation_loop=1.0 → subtract this from ultraCTH
    },

    // ── Population Modulation (Phase D.19) ──────────────────────────────────────
    population_modulation: {
        min_population_for_full_certainty: 1000000   // below this → certainty scales proportionally
    },

    // ── Token Dynamics Engine (Phase E.25) ──────────────────────────────────────
    // Controls how individual actor/token fields translate into a Token Impact Multiplier (TIM).
    // TIM > 1 → actor amplifies systemic risk (disruptors, radicals)
    // TIM < 1 → actor dampens systemic risk (architects, stabilizers)
    // The TIM is applied multiplicatively to Foundation, Dynamics, and Chaos engine risks
    // before ultraCTH synthesis. This allows a Napoleon-type actor to push CMN even when
    // macro indicators look moderate, and a Madison-type architect to support RMD.
    token_dynamics: {
        weights: {
            power:            0.25,   // structural power of the actor
            network:          0.15,   // connectivity within the relevant network
            charisma:         0.15,   // personal mobilization capacity
            momentum:         0.15,   // growing vs. waning influence trajectory
            ideological:      0.15,   // extremity of ideological position (polarizes outcomes)
            anti_legitimacy:  0.10,   // low legitimacy → more disruptive (1 - legitimacy)
            anti_rationality: 0.05    // low rationality → more erratic (1 - rationality)
        },
        duration_normalization: 50,   // years — duration_of_influence is divided by this
        sensitivity:            0.30, // (TIS - 0.5) * sensitivity → TIM offset from 1.0
        multiplier_clamp: [0.75, 1.25],
        // Per-role modifiers applied multiplicatively to baseTIM before clamping.
        // disruptor: amplifies risk across the board
        // architect/stabilizer: dampens risk — deliberate, legitimate, rational actors
        // catalyst: amplifies dynamics but less so foundation (accelerates existing trends)
        // wildcard: slight amplification of chaos only
        role_modifiers: {
            disruptor:  { foundation: 1.15, dynamics: 1.20, chaos: 1.25 },
            catalyst:   { foundation: 1.05, dynamics: 1.15, chaos: 1.10 },
            stabilizer: { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },   // tightened — deliberate/legitimate actors
            architect:  { foundation: 0.82, dynamics: 0.85, chaos: 0.76 },   // tightened — rational design events
            wildcard:   { foundation: 1.00, dynamics: 1.05, chaos: 1.10 }
        }
    }
};

export default EXAMPLE_POLICY_V31_REFERENCE;
