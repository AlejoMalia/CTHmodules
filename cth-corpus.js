/**
 * CTH-CORPUS.JS — v4.1 (Phase F.33)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Universal calibration corpus: 32 large-scale historical events spanning
 * 5,100+ years — from the unification of Egypt (~3100 BCE) to COVID-19 (2020).
 *
 * UNIVERSALITY: the corpus deliberately covers every macro-era (Bronze Age,
 * Classical Antiquity, Medieval, Early Modern, Modern, Contemporary), every
 * continent, and eight event categories. The kernel is validated against ALL
 * of them with the SAME policy and the SAME math — no epoch receives special
 * treatment. Years are astronomical integers (negative = BCE).
 *
 * Each event is a COMPACT OBSERVABLE SPEC (stability indicators, rupture size,
 * surprise factor, primary actors). Full canonical inputs are expanded through
 * SnapshotAdapter, so EVEI is derived endogenously (Phase F.31) for the whole
 * corpus — no hand-assigned impact values.
 *
 * observed_outcome semantics (0–1): the historiographical-consensus degree to
 * which the system underwent ADAPTIVE TRANSFORMATION (RMD, high) versus
 * SYSTEMIC COLLAPSE (CMN, low), one long cycle after the event. These are
 * calibration targets, independently revisable — cite disagreements as
 * alternative corpora, exactly like alternative Policies.
 */

import { SnapshotAdapter } from './cth-data-adapters.js';

// ── Compact specs ─────────────────────────────────────────────────────────────
// [id, year, category, observed, polStab, ecoStab, socCoh, deltaCTH, blackSwan, obsLoop, actor]

const SPECS = [
    // ─ Bronze & Iron Age ─
    ['EGYPT-UNIFICATION-3100BCE',  -3100, 'transformation', 0.66, 0.48, 0.55, 0.52, +0.22, 0.15, 0.02, { power_index: 0.85, network_centrality: 0.70, legitimacy: 0.72, rationality: 0.65, charisma: 0.70, ideological_extremity: 0.35, momentum: 0.80, historical_role: 'architect',  duration_of_influence: 240, actor_volatility: 0.40, trigger_force: 0.62 }],
    ['AKKADIAN-COLLAPSE-2154BCE',  -2154, 'collapse',       0.30, 0.35, 0.30, 0.40, -0.30, 0.55, 0.01, { power_index: 0.45, network_centrality: 0.40, legitimacy: 0.35, rationality: 0.45, charisma: 0.40, ideological_extremity: 0.30, momentum: 0.30, historical_role: 'wildcard',   duration_of_influence: 60,  actor_volatility: 0.55, trigger_force: 0.60 }],
    ['BRONZE-AGE-COLLAPSE-1177BCE',-1177, 'collapse',       0.22, 0.30, 0.25, 0.35, -0.38, 0.68, 0.01, { power_index: 0.55, network_centrality: 0.45, legitimacy: 0.25, rationality: 0.40, charisma: 0.45, ideological_extremity: 0.40, momentum: 0.65, historical_role: 'disruptor',  duration_of_influence: 80,  actor_volatility: 0.72, trigger_force: 0.78 }],
    // ─ Classical Antiquity ─
    ['SOLON-REFORMS-594BCE',        -594, 'transformation', 0.68, 0.42, 0.45, 0.48, +0.20, 0.12, 0.05, { power_index: 0.60, network_centrality: 0.65, legitimacy: 0.78, rationality: 0.82, charisma: 0.60, ideological_extremity: 0.25, momentum: 0.55, historical_role: 'architect',  duration_of_influence: 30,  actor_volatility: 0.30, trigger_force: 0.48 }],
    ['PERSIAN-WARS-480BCE',         -480, 'war',            0.62, 0.50, 0.48, 0.62, +0.14, 0.42, 0.04, { power_index: 0.70, network_centrality: 0.60, legitimacy: 0.66, rationality: 0.68, charisma: 0.72, ideological_extremity: 0.35, momentum: 0.70, historical_role: 'stabilizer', duration_of_influence: 20,  actor_volatility: 0.45, trigger_force: 0.66 }],
    ['PELOPONNESIAN-WAR-431BCE',    -431, 'war',            0.35, 0.44, 0.40, 0.38, -0.24, 0.30, 0.06, { power_index: 0.62, network_centrality: 0.55, legitimacy: 0.45, rationality: 0.42, charisma: 0.58, ideological_extremity: 0.55, momentum: 0.50, historical_role: 'disruptor',  duration_of_influence: 27,  actor_volatility: 0.60, trigger_force: 0.64 }],
    ['QIN-UNIFICATION-221BCE',      -221, 'transformation', 0.58, 0.52, 0.50, 0.42, +0.18, 0.22, 0.03, { power_index: 0.92, network_centrality: 0.75, legitimacy: 0.48, rationality: 0.66, charisma: 0.55, ideological_extremity: 0.62, momentum: 0.85, historical_role: 'architect',  duration_of_influence: 15,  actor_volatility: 0.58, trigger_force: 0.75 }],
    ['ROMAN-REPUBLIC-CRISIS-49BCE',  -49, 'revolution',     0.45, 0.38, 0.52, 0.40, -0.12, 0.28, 0.08, { power_index: 0.88, network_centrality: 0.82, legitimacy: 0.42, rationality: 0.70, charisma: 0.85, ideological_extremity: 0.45, momentum: 0.82, historical_role: 'disruptor',  duration_of_influence: 5,   actor_volatility: 0.65, trigger_force: 0.80 }],
    ['FALL-OF-ROME-476',             476, 'collapse',       0.28, 0.28, 0.30, 0.32, -0.30, 0.35, 0.03, { power_index: 0.55, network_centrality: 0.48, legitimacy: 0.30, rationality: 0.52, charisma: 0.42, ideological_extremity: 0.35, momentum: 0.60, historical_role: 'disruptor',  duration_of_influence: 25,  actor_volatility: 0.58, trigger_force: 0.62 }],
    // ─ Medieval ─
    ['ISLAMIC-EXPANSION-632',        632, 'transformation', 0.64, 0.45, 0.42, 0.68, +0.26, 0.48, 0.02, { power_index: 0.80, network_centrality: 0.85, legitimacy: 0.82, rationality: 0.62, charisma: 0.92, ideological_extremity: 0.72, momentum: 0.90, historical_role: 'catalyst',   duration_of_influence: 30,  actor_volatility: 0.55, trigger_force: 0.82 }],
    ['AN-LUSHAN-REBELLION-755',      755, 'collapse',       0.30, 0.36, 0.40, 0.35, -0.28, 0.52, 0.02, { power_index: 0.72, network_centrality: 0.60, legitimacy: 0.28, rationality: 0.40, charisma: 0.65, ideological_extremity: 0.58, momentum: 0.72, historical_role: 'disruptor',  duration_of_influence: 8,   actor_volatility: 0.75, trigger_force: 0.78 }],
    ['NORMAN-CONQUEST-1066',        1066, 'transformation', 0.60, 0.50, 0.48, 0.45, +0.12, 0.38, 0.03, { power_index: 0.78, network_centrality: 0.62, legitimacy: 0.50, rationality: 0.72, charisma: 0.60, ideological_extremity: 0.30, momentum: 0.75, historical_role: 'architect',  duration_of_influence: 21,  actor_volatility: 0.48, trigger_force: 0.70 }],
    ['MONGOL-CONQUESTS-1206',       1206, 'war',            0.40, 0.42, 0.38, 0.44, -0.18, 0.60, 0.02, { power_index: 0.95, network_centrality: 0.72, legitimacy: 0.44, rationality: 0.68, charisma: 0.80, ideological_extremity: 0.50, momentum: 0.95, historical_role: 'disruptor',  duration_of_influence: 21,  actor_volatility: 0.70, trigger_force: 0.90 }],
    ['BLACK-DEATH-1347',            1347, 'pandemic',       0.25, 0.40, 0.35, 0.30, -0.36, 0.85, 0.01, { power_index: 0.99, network_centrality: 0.88, legitimacy: 0.05, rationality: 0.05, charisma: 0.05, ideological_extremity: 0.05, momentum: 0.92, historical_role: 'wildcard',   duration_of_influence: 6,   actor_volatility: 0.90, trigger_force: 0.95 }],
    ['FALL-CONSTANTINOPLE-1453',    1453, 'collapse',       0.33, 0.30, 0.32, 0.38, -0.22, 0.30, 0.04, { power_index: 0.82, network_centrality: 0.58, legitimacy: 0.55, rationality: 0.70, charisma: 0.62, ideological_extremity: 0.48, momentum: 0.80, historical_role: 'disruptor',  duration_of_influence: 30,  actor_volatility: 0.52, trigger_force: 0.74 }],
    // ─ Early Modern ─
    ['PROTESTANT-REFORMATION-1517', 1517, 'religious',      0.55, 0.48, 0.50, 0.42, -0.08, 0.42, 0.06, { power_index: 0.55, network_centrality: 0.78, legitimacy: 0.60, rationality: 0.66, charisma: 0.75, ideological_extremity: 0.78, momentum: 0.82, historical_role: 'catalyst',   duration_of_influence: 29,  actor_volatility: 0.62, trigger_force: 0.72 }],
    ['CONQUEST-MEXICO-1519',        1519, 'collapse',       0.20, 0.44, 0.42, 0.46, -0.42, 0.80, 0.02, { power_index: 0.68, network_centrality: 0.55, legitimacy: 0.20, rationality: 0.62, charisma: 0.66, ideological_extremity: 0.60, momentum: 0.85, historical_role: 'disruptor',  duration_of_influence: 3,   actor_volatility: 0.78, trigger_force: 0.88 }],
    ['ENGLISH-CIVIL-WAR-1642',      1642, 'revolution',     0.42, 0.36, 0.44, 0.40, -0.10, 0.32, 0.10, { power_index: 0.70, network_centrality: 0.64, legitimacy: 0.46, rationality: 0.60, charisma: 0.62, ideological_extremity: 0.68, momentum: 0.72, historical_role: 'disruptor',  duration_of_influence: 9,   actor_volatility: 0.64, trigger_force: 0.70 }],
    ['GLORIOUS-REVOLUTION-1688',    1688, 'transformation', 0.70, 0.52, 0.55, 0.50, +0.20, 0.20, 0.08, { power_index: 0.66, network_centrality: 0.72, legitimacy: 0.68, rationality: 0.80, charisma: 0.52, ideological_extremity: 0.28, momentum: 0.62, historical_role: 'architect',  duration_of_influence: 14,  actor_volatility: 0.35, trigger_force: 0.55 }],
    ['INDUSTRIAL-REVOLUTION-1780',  1780, 'technological',  0.68, 0.55, 0.48, 0.46, +0.24, 0.35, 0.05, { power_index: 0.58, network_centrality: 0.70, legitimacy: 0.62, rationality: 0.85, charisma: 0.45, ideological_extremity: 0.22, momentum: 0.88, historical_role: 'catalyst',   duration_of_influence: 70,  actor_volatility: 0.42, trigger_force: 0.68 }],
    ['US-CONSTITUTION-1787',        1787, 'transformation', 0.78, 0.58, 0.52, 0.60, +0.24, 0.12, 0.10, { power_index: 0.62, network_centrality: 0.80, legitimacy: 0.78, rationality: 0.88, charisma: 0.58, ideological_extremity: 0.22, momentum: 0.60, historical_role: 'architect',  duration_of_influence: 40,  actor_volatility: 0.28, trigger_force: 0.45 }],
    ['FRENCH-REVOLUTION-1789',      1789, 'revolution',     0.36, 0.34, 0.30, 0.48, -0.31, 0.42, 0.92, { power_index: 0.72, network_centrality: 0.70, legitimacy: 0.28, rationality: 0.38, charisma: 0.81, ideological_extremity: 0.91, momentum: 0.78, historical_role: 'disruptor',  duration_of_influence: 5,   actor_volatility: 0.78, trigger_force: 0.82 }],
    // ─ Modern ─
    ['HISPANIC-INDEPENDENCE-1810',  1810, 'revolution',     0.48, 0.38, 0.36, 0.50, +0.06, 0.30, 0.15, { power_index: 0.68, network_centrality: 0.66, legitimacy: 0.58, rationality: 0.64, charisma: 0.78, ideological_extremity: 0.55, momentum: 0.74, historical_role: 'catalyst',   duration_of_influence: 15,  actor_volatility: 0.58, trigger_force: 0.72 }],
    ['MEIJI-RESTORATION-1868',      1868, 'transformation', 0.72, 0.55, 0.50, 0.62, +0.26, 0.18, 0.12, { power_index: 0.74, network_centrality: 0.76, legitimacy: 0.80, rationality: 0.84, charisma: 0.60, ideological_extremity: 0.30, momentum: 0.78, historical_role: 'architect',  duration_of_influence: 44,  actor_volatility: 0.32, trigger_force: 0.58 }],
    ['WORLD-WAR-I-1914',            1914, 'war',            0.30, 0.42, 0.48, 0.44, -0.26, 0.55, 0.20, { power_index: 0.70, network_centrality: 0.68, legitimacy: 0.44, rationality: 0.38, charisma: 0.52, ideological_extremity: 0.60, momentum: 0.80, historical_role: 'disruptor',  duration_of_influence: 4,   actor_volatility: 0.72, trigger_force: 0.84 }],
    ['RUSSIAN-REVOLUTION-1917',     1917, 'revolution',     0.33, 0.30, 0.26, 0.42, -0.28, 0.38, 0.88, { power_index: 0.85, network_centrality: 0.78, legitimacy: 0.32, rationality: 0.55, charisma: 0.84, ideological_extremity: 0.92, momentum: 0.86, historical_role: 'disruptor',  duration_of_influence: 7,   actor_volatility: 0.80, trigger_force: 0.85 }],
    ['GREAT-DEPRESSION-1929',       1929, 'economic',       0.38, 0.52, 0.22, 0.48, -0.20, 0.62, 0.25, { power_index: 0.50, network_centrality: 0.72, legitimacy: 0.40, rationality: 0.45, charisma: 0.35, ideological_extremity: 0.30, momentum: 0.68, historical_role: 'wildcard',   duration_of_influence: 10,  actor_volatility: 0.66, trigger_force: 0.74 }],
    // ─ Contemporary ─
    ['INDIAN-INDEPENDENCE-1947',    1947, 'transformation', 0.65, 0.48, 0.42, 0.58, +0.18, 0.25, 0.30, { power_index: 0.60, network_centrality: 0.85, legitimacy: 0.86, rationality: 0.80, charisma: 0.90, ideological_extremity: 0.35, momentum: 0.75, historical_role: 'architect',  duration_of_influence: 30,  actor_volatility: 0.38, trigger_force: 0.60 }],
    ['CHINESE-REVOLUTION-1949',     1949, 'revolution',     0.44, 0.34, 0.30, 0.46, -0.06, 0.32, 0.40, { power_index: 0.88, network_centrality: 0.80, legitimacy: 0.52, rationality: 0.58, charisma: 0.82, ideological_extremity: 0.88, momentum: 0.85, historical_role: 'disruptor',  duration_of_influence: 27,  actor_volatility: 0.70, trigger_force: 0.80 }],
    ['USSR-COLLAPSE-1991',          1991, 'collapse',       0.52, 0.32, 0.28, 0.40, -0.14, 0.48, 0.60, { power_index: 0.65, network_centrality: 0.70, legitimacy: 0.48, rationality: 0.72, charisma: 0.58, ideological_extremity: 0.30, momentum: 0.55, historical_role: 'catalyst',   duration_of_influence: 6,   actor_volatility: 0.55, trigger_force: 0.65 }],
    ['ARAB-SPRING-2011',            2011, 'revolution',     0.35, 0.36, 0.38, 0.44, -0.12, 0.58, 0.75, { power_index: 0.42, network_centrality: 0.88, legitimacy: 0.55, rationality: 0.52, charisma: 0.60, ideological_extremity: 0.58, momentum: 0.85, historical_role: 'catalyst',   duration_of_influence: 2,   actor_volatility: 0.75, trigger_force: 0.78 }],
    ['COVID-19-2020',               2020, 'pandemic',       0.55, 0.55, 0.42, 0.46, -0.10, 0.78, 0.85, { power_index: 0.90, network_centrality: 0.95, legitimacy: 0.05, rationality: 0.05, charisma: 0.05, ideological_extremity: 0.05, momentum: 0.88, historical_role: 'wildcard',   duration_of_influence: 3,   actor_volatility: 0.82, trigger_force: 0.88 }]
];

const _adapter = new SnapshotAdapter();

/** Expand one compact spec into a canonical calibration item. */
export function expandSpec(row) {
    const [id, year, category, observed, pol, eco, soc, delta, bs, obsLoop, actor] = row;
    const input = _adapter.adapt({
        id, year,
        political_stability: pol,
        economic_stability:  eco,
        social_cohesion:     soc,
        delta_cth:           delta,
        black_swan:          bs,
        observation_loop:    obsLoop,
        actor
    });
    return { input, observed_outcome: observed, category, year, era: input.epoch_descriptor.era };
}

/** The full universal corpus, expanded and ready for calibrate()/validation. */
export function buildUniversalCorpus() {
    return SPECS.map(expandSpec);
}

export const CORPUS_SIZE = SPECS.length;
export default buildUniversalCorpus;
