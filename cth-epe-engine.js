/**
 * CTH-EPE-ENGINE.JS — CTH Framework v4.2
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Empirical Probabilistic Event Estimation (EPE) & Temporal Projection Engine.
 *
 * Implements EPE calculation using the 12,000-event historical corpus:
 * 1. Search with tolerance band (±2.5% or configurable range) on CTH and EVEI.
 * 2. Strict or weighted property filtering by event domain/category (war, transformation, collapse, etc.).
 * 3. Life-cycle phase detection & distribution (Antecedent, Prelude, During, Transition, Final).
 * 4. Bifurcated Projection (CMN vs RMD):
 *    - Outcome probabilities.
 *    - Typical associated conditions (CTH trajectory shift, drawdown).
 *    - Estimated realization timeframe.
 *    - Immediate triggers vs key inflection points.
 * 5. Advanced Quantitative Indices:
 *    - Exact Temporal Equivalence (ET): mean contextual divergence in %.
 *    - Percentage of Black Swans (PCN) via Disruptive Potential Index (IPD).
 *    - Temporal Echo: cyclical resonances and rotation margin (year/cycle offset).
 *    - Temporal Spectrum: projected trajectory fan and next critical inflection estimate.
 */

import { getEvents } from './dataset/index.js';

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));
const round = (v, d = 4) => Number(Number(v).toFixed(d));

export class CTHEPEEngine {
    constructor(options = {}) {
        this._eventsCache = options.eventsCache ?? null;
    }

    _getEvents() {
        if (!this._eventsCache) {
            this._eventsCache = getEvents();
        }
        return this._eventsCache;
    }

    /**
     * Executes complete EPE calculation for a given event.
     *
     * @param {object} eventData - Event indicators (CTH, EVEI, deltaCTH, category, extendedMetrics, etc.)
     * @param {object} [options]
     * @param {number} [options.toleranceCTH=0.035] - Amplitude range (default ~2.5% - 3.5%)
     * @param {number} [options.toleranceEVEI=0.035] - EVEI amplitude range
     * @param {string} [options.category] - Event category filter ('war', 'collapse', 'transformation', etc.)
     * @param {number} [options.minAnalogs=15] - Minimum analogs threshold before soft window expansion
     * @param {object} [options.policy] - Analytical policy
     */
    calculateEPE(eventData, options = {}) {
        const events = this._getEvents();

        const cthCurrent = Number(eventData.cth_global ?? eventData.macro_context?.cth_global ?? 0.5);
        const eveiCurrent = Number(eventData.evei ?? eventData.macro_context?.evei_average ?? 0.5);
        const deltaCurrent = Number(eventData.delta_cth ?? eventData.macro_context?.deltaCTH ?? 0);
        const category = options.category ?? eventData.category ?? null;
        const currentYear = Number(eventData.year ?? eventData.epoch_descriptor?.year ?? 2026);

        // Extended metrics for PCN / IPD
        const em = eventData.extendedMetrics ?? eventData.macro_context?.extendedMetrics ?? {
            PPI: clamp(Math.sqrt(eveiCurrent * cthCurrent) + 0.15),
            IEC: clamp(1 - (eventData.macro_context?.blackSwanIndex ?? 0.3) * 1.5),
            VVC: clamp((eventData.macro_context?.blackSwanIndex ?? 0.3) * 1.8)
        };

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 1: ANALOG SEARCH WITH TOLERANCE BAND (±2.5% - 4%) & CATEGORY FILTER
        // ─────────────────────────────────────────────────────────────────────────
        let tolCTH = options.toleranceCTH ?? 0.035;
        let tolEVEI = options.toleranceEVEI ?? 0.035;
        const minAnalogs = options.minAnalogs ?? 15;

        let filtered = [];
        let iteration = 0;

        // If strict window yields fewer than minAnalogs, gently expand window up to 5 times
        while (filtered.length < minAnalogs && iteration < 5) {
            filtered = events.filter(e => {
                // Filter 1: Event properties / category (apples to apples)
                if (category && e.category !== category) return false;
                // Filter 2: CTH and EVEI tolerance amplitude
                const diffCTH = Math.abs(e.cth_global - cthCurrent);
                const diffEVEI = Math.abs(e.evei - eveiCurrent);
                return diffCTH <= tolCTH && diffEVEI <= tolEVEI;
            });

            if (filtered.length < minAnalogs) {
                tolCTH += 0.02;
                tolEVEI += 0.02;
                iteration++;
            }
        }

        // If category filter leaves no events, fallback to nearest multidimensional neighbors
        if (filtered.length === 0) {
            filtered = events
                .map(e => ({
                    ...e,
                    _dist: Math.sqrt(Math.pow(e.cth_global - cthCurrent, 2) + Math.pow(e.evei - eveiCurrent, 2))
                }))
                .sort((a, b) => a._dist - b._dist)
                .slice(0, 30);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 2: PHASE DISTRIBUTION (Antecedent, Prelude, During, Transition, Final)
        // ─────────────────────────────────────────────────────────────────────────
        // Map current state to the canonical life-cycle phase of historical precedents
        const phaseScores = {
            before: 0,
            prelude: 0,
            during: 0,
            transition: 0,
            after: 0
        };

        for (const a of filtered) {
            const diffs = {
                before: Math.abs(a.cth_before - cthCurrent),
                prelude: Math.abs(a.cth_prelude - cthCurrent),
                during: Math.abs(a.cth_during - cthCurrent),
                transition: Math.abs(a.cth_transition - cthCurrent),
                after: Math.abs(a.cth_after - cthCurrent)
            };

            let closestPhase = 'during';
            let minDiff = Infinity;
            for (const [ph, d] of Object.entries(diffs)) {
                if (d < minDiff) {
                    minDiff = d;
                    closestPhase = ph;
                }
            }
            phaseScores[closestPhase]++;
        }

        const totalAnalogs = filtered.length;
        const phaseDistribution = {
            antecedent_before_pct: round((phaseScores.before / totalAnalogs) * 100, 1),
            prelude_pct:           round((phaseScores.prelude / totalAnalogs) * 100, 1),
            during_pct:            round((phaseScores.during / totalAnalogs) * 100, 1),
            transition_pct:        round((phaseScores.transition / totalAnalogs) * 100, 1),
            final_after_pct:       round((phaseScores.after / totalAnalogs) * 100, 1)
        };

        // Identify most probable life-cycle phase
        let dominantPhase = 'during';
        let maxPhaseCount = -1;
        for (const [ph, count] of Object.entries(phaseScores)) {
            if (count > maxPhaseCount) {
                maxPhaseCount = count;
                dominantPhase = ph;
            }
        }

        const dominantPhaseLabel = {
            before:     'Antecedent (Before - Latent Baseline)',
            prelude:    'Prelude (Prelude - Early Divergence)',
            during:     'During (During - Acute Shock/Climax)',
            transition: 'Transition (Transition - Recomposition/Response)',
            after:      'Final (After - Systemic Consolidation)'
        }[dominantPhase];

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 3: BIFURCATED PROJECTION (CMN vs RMD)
        // ─────────────────────────────────────────────────────────────────────────
        const cmnAnalogs = filtered.filter(a => a.prediction === 'CMN');
        const rmdAnalogs = filtered.filter(a => a.prediction === 'RMD');

        const pCMN = round((cmnAnalogs.length / totalAnalogs) * 100, 1);
        const pRMD = round((rmdAnalogs.length / totalAnalogs) * 100, 1);

        // Typical conditions associated with CMN
        const cmnAvgDelta = cmnAnalogs.length
            ? round(cmnAnalogs.reduce((acc, a) => acc + a.delta_cth, 0) / cmnAnalogs.length, 3)
            : round(deltaCurrent < 0 ? deltaCurrent : -0.25, 3);
        const cmnAvgDrawdown = cmnAnalogs.length
            ? round(cmnAnalogs.reduce((acc, a) => acc + (a.cth_before - a.cth_during), 0) / cmnAnalogs.length, 3)
            : 0.32;

        // Typical conditions associated with RMD
        const rmdAvgDelta = rmdAnalogs.length
            ? round(rmdAnalogs.reduce((acc, a) => acc + a.delta_cth, 0) / rmdAnalogs.length, 3)
            : round(deltaCurrent > 0 ? deltaCurrent : +0.20, 3);
        const rmdAvgRecovery = rmdAnalogs.length
            ? round(rmdAnalogs.reduce((acc, a) => acc + (a.cth_after - a.cth_during), 0) / rmdAnalogs.length, 3)
            : 0.28;

        // Estimated historical timeframes
        const cmnTimeFrame = category === 'war' ? '3 to 18 months'
                           : category === 'economic' ? '6 to 24 months'
                           : category === 'pandemic' ? '4 to 14 months'
                           : '6 to 18 months';

        const rmdTimeFrame = category === 'war' ? '1 to 3 years'
                           : category === 'technological' ? '2 to 5 years'
                           : category === 'transformation' ? '1 to 4 years'
                           : '1 to 3 years';

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 4: ADVANCED QUANTITATIVE INDICES (ET, PCN, TEMPORAL ECHO, SPECTRUM)
        // ─────────────────────────────────────────────────────────────────────────

        // 1. Temporal Equivalence (ET)
        // ET = Mean(|CTH_i - CTH_actual|) * 100
        const avgAbsDiffCTH = filtered.reduce((acc, a) => acc + Math.abs(a.cth_global - cthCurrent), 0) / totalAnalogs;
        const ET = round(avgAbsDiffCTH * 100, 2);

        // 2. Percentage of Black Swans (PCN)
        // IPD = w_ppi * PPI + w_iec * |IEC - 0.5| + w_vvc * VVC
        const w_ppi = 0.50, w_iec = 0.25, w_vvc = 0.25;
        const IPD = w_ppi * em.PPI + w_iec * Math.abs(em.IEC - 0.5) + w_vvc * em.VVC;
        const PCN = round(clamp((IPD - 0.20) / 1.10) * 22.0 + 3.0, 1);

        // 3. Temporal Echo & Rotation Margin
        const candidateEchoes = filtered
            .map(a => {
                const diffYears = Math.abs(currentYear - a.year);
                return {
                    event_id: a.event_id,
                    name: a.name,
                    year: a.year,
                    epoch: a.epoch,
                    diff_years: diffYears,
                    delta_cth: a.delta_cth,
                    prediction: a.prediction,
                    similarity: round(1 - (Math.abs(a.cth_global - cthCurrent) + Math.abs(a.evei - eveiCurrent)) / 2, 3)
                };
            })
            .sort((a, b) => b.similarity - a.similarity);

        const primaryEcho = candidateEchoes[0] ?? null;
        const secondaryEcho = candidateEchoes[1] ?? null;

        // 4. Temporal Spectrum (Trajectory Fan)
        const timelinePower = [
            { step: 'T+0 (Current)',    cmn_cth: round(cthCurrent), rmd_cth: round(cthCurrent) },
            { step: 'T+1 (Inflection)', cmn_cth: round(clamp(cthCurrent - cmnAvgDrawdown * 0.4)), rmd_cth: round(clamp(cthCurrent + rmdAvgRecovery * 0.3)) },
            { step: 'T+2 (Climax)',     cmn_cth: round(clamp(cthCurrent - cmnAvgDrawdown * 0.85)), rmd_cth: round(clamp(cthCurrent + rmdAvgRecovery * 0.65)) },
            { step: 'T+3 (Outcome)',    cmn_cth: round(clamp(cthCurrent + cmnAvgDelta)), rmd_cth: round(clamp(cthCurrent + rmdAvgDelta)) }
        ];

        return {
            metadata: {
                query_event_id: eventData.id ?? 'EPE-QUERY',
                query_year: currentYear,
                category_filter: category ?? 'ALL_CATEGORIES',
                analogs_analyzed_count: totalAnalogs,
                tolerance_applied: {
                    cth_tolerance: `±${round(tolCTH * 100, 1)}%`,
                    evei_tolerance: `±${round(tolEVEI * 100, 1)}%`
                }
            },
            phase_detection: {
                dominant_phase: dominantPhase,
                dominant_phase_label: dominantPhaseLabel,
                confidence_score: round(maxPhaseCount / totalAnalogs, 3),
                distribution_pct: phaseDistribution
            },
            bifurcated_projection: {
                CMN: {
                    name: 'Systemic Collapse / Decline (CMN)',
                    probability_pct: pCMN,
                    observed_frequency: `${cmnAnalogs.length} of ${totalAnalogs} historical analogs`,
                    typical_conditions: {
                        delta_cth_expected: cmnAvgDelta,
                        drawdown_expected: cmnAvgDrawdown,
                        description: `Typical CTH decline of ${round(Math.abs(cmnAvgDelta) * 100, 1)}% with institutional erosion`
                    },
                    estimated_timeframe: cmnTimeFrame,
                    immediate_triggers: [
                        'Sudden erosion of institutional legitimacy',
                        'Liquidity freeze or acute escalation in critical input costs',
                        'Polarization surge without constitutional shock absorbers'
                    ],
                    systemic_vulnerability: 'High institutional rigidity with low shock absorption capacity'
                },
                RMD: {
                    name: 'Adaptive Renewal / Transformation (RMD)',
                    probability_pct: pRMD,
                    observed_frequency: `${rmdAnalogs.length} of ${totalAnalogs} historical analogs`,
                    typical_conditions: {
                        delta_cth_expected: rmdAvgDelta,
                        recovery_expected: rmdAvgRecovery,
                        description: `Typical CTH increase of +${round(rmdAvgDelta * 100, 1)}% with equilibrium restructuring`
                    },
                    estimated_timeframe: rmdTimeFrame,
                    key_inflection_points: [
                        'Stabilization accord or regulatory framework overhaul',
                        'Emergence of consensus architects or stabilizing leadership',
                        'Deployment of productivity- or cohesion-enhancing innovations'
                    ],
                    systemic_resilience: 'Shock absorption capacity and subsequent socio-institutional recomposition'
                }
            },
            quantitative_indices: {
                temporal_equivalence: {
                    ET_pct: `${ET}%`,
                    status: ET < 5.0 ? 'NO_DISPARITY (Highly equivalent contextual conditions)'
                          : ET < 12.0 ? 'MODERATE (Moderate contextual divergence)'
                          : 'HIGH_DISPARITY (Significant historical divergence)',
                    interpretation: `Contextual difference of ${ET}% relative to the ${totalAnalogs} analyzed historical precedents.`
                },
                black_swan_risk: {
                    PCN_pct: `${PCN}%`,
                    IPD_score: round(IPD, 4),
                    interpretation: `Latent risk of ${PCN}% of an anomalous disruptive outcome outside observed historical patterns.`
                },
                temporal_echo: {
                    primary_echo: primaryEcho ? {
                        event_name: primaryEcho.name,
                        historical_year: primaryEcho.year < 0 ? `${Math.abs(primaryEcho.year)} BCE` : `${primaryEcho.year} CE`,
                        rotation_margin_years: `${primaryEcho.diff_years} years offset`,
                        outcome: primaryEcho.prediction,
                        similarity: `${(primaryEcho.similarity * 100).toFixed(1)}%`
                    } : null,
                    secondary_echo: secondaryEcho ? {
                        event_name: secondaryEcho.name,
                        historical_year: secondaryEcho.year < 0 ? `${Math.abs(secondaryEcho.year)} BCE` : `${secondaryEcho.year} CE`,
                        rotation_margin_years: `${secondaryEcho.diff_years} years offset`,
                        outcome: secondaryEcho.prediction,
                        similarity: `${(secondaryEcho.similarity * 100).toFixed(1)}%`
                    } : null
                },
                temporal_spectrum: {
                    description: 'Projected CTH stability bifurcation fan across 4 sequential milestones',
                    timeline_steps: timelinePower,
                    next_critical_inflection: `Estimated within ${cmnTimeFrame}`
                }
            },
            sample_analogs: filtered.slice(0, 5).map(a => ({
                event_id: a.event_id,
                name: a.name,
                year: a.year,
                epoch: a.epoch,
                category: a.category,
                cth_global: a.cth_global,
                delta_cth: a.delta_cth,
                evei: a.evei,
                prediction: a.prediction
            }))
        };
    }
}

export default CTHEPEEngine;
