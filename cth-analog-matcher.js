/**
 * CTH-ANALOG-MATCHER.JS — CTH Framework v4.1
 * Author: Alejo Malia | CTHmodules.cc
 *
 * High-performance Historical Analog Search & Matching Engine.
 * Searches across the pre-calculated 12,000 events and 12,000 historical characters
 * in dataset/ to identify historical precedents sharing identical or near-identical
 * Tetrasociohistorical (CTH, EVEI, deltaCTH, E/S/A/P) conditions.
 *
 * Capabilities:
 * 1. findEventAnalogs(query, options): Top-K event matching with weighted Euclidean distance.
 * 2. findCharacterAnalogs(query, options): Top-K historical token matching across 8 attributes.
 * 3. enrichEventWithAnalogs(event, options): Endogenously populates macro_context.historical_analogs
 *    for automatic integration with CTHTemporalEngine.
 * 4. crossEraBenchmark(query, options): Compares how similar conditions unfolded across different epochs.
 */

import { getEvents, getCharacters, EPOCH_KEYS } from './dataset/index.js';

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));
const round = (v, d = 4) => Number(Number(v).toFixed(d));

// Default balanced feature weights for event analog distance
export const DEFAULT_EVENT_WEIGHTS = {
    // 4 CTH Dimensions
    historical_epoch_score_E: 1.0,
    social_range_score_S: 1.0,
    age_range_score_A: 0.8,
    population_range_score_P: 0.8,
    // Macro Kinetic Indices
    cth_global: 2.0,
    delta_cth: 2.2,
    evei: 2.5,
    black_swan_index: 1.5
};

// Default weights for historical character (token) distance
export const DEFAULT_CHARACTER_WEIGHTS = {
    power_index: 1.5,
    network_centrality: 1.2,
    legitimacy: 1.4,
    rationality: 1.2,
    charisma: 1.4,
    ideological_extremity: 1.8,
    momentum: 1.2,
    token_impact_score_tis: 2.0
};

export class CTHAnalogMatcher {
    /**
     * @param {object} [options]
     * @param {Array<object>} [options.eventsCache] - Pre-loaded events cache
     * @param {Array<object>} [options.charactersCache] - Pre-loaded characters cache
     */
    constructor(options = {}) {
        this._eventsCache = options.eventsCache ?? null;
        this._charactersCache = options.charactersCache ?? null;
    }

    _getEvents() {
        if (!this._eventsCache) {
            this._eventsCache = getEvents();
        }
        return this._eventsCache;
    }

    _getCharacters() {
        if (!this._charactersCache) {
            this._charactersCache = getCharacters();
        }
        return this._charactersCache;
    }

    /**
     * Calculate normalized distance between a query event and a candidate event
     */
    calculateEventDistance(query, candidate, weights = DEFAULT_EVENT_WEIGHTS) {
        let sumSq = 0;
        let sumW = 0;

        for (const [key, w] of Object.entries(weights)) {
            const qVal = query[key] ?? query.macro_context?.[key] ?? 0.5;
            const cVal = candidate[key] ?? 0.5;
            const diff = qVal - cVal;
            sumSq += w * (diff * diff);
            sumW += w;
        }

        const distance = Math.sqrt(sumSq / sumW);
        // Similarity score in [0, 1] where 1 = exact match
        const similarity = Math.max(0, 1 - distance);
        return { distance: round(distance), similarity: round(similarity) };
    }

    /**
     * Search the 12,000-event database for the closest historical analogs
     * @param {object} query - Event object or indicator profile
     * @param {object} [options]
     * @param {number} [options.topK=10] - Number of top matches to return
     * @param {string} [options.excludeId] - ID of query event to exclude self
     * @param {string} [options.filterEpoch] - Limit search to specific epoch
     * @param {string} [options.filterCategory] - Limit search to specific category (war, collapse, etc.)
     * @param {string} [options.excludeEpoch] - Exclude query's own epoch (for pure cross-era transfer)
     * @param {object} [options.weights] - Custom feature weights
     */
    findEventAnalogs(query, options = {}) {
        const topK = options.topK ?? 10;
        const weights = { ...DEFAULT_EVENT_WEIGHTS, ...options.weights };
        const events = this._getEvents();

        const matches = [];

        for (const candidate of events) {
            if (options.excludeId && candidate.event_id === options.excludeId) continue;
            if (options.filterEpoch && candidate.epoch !== options.filterEpoch) continue;
            if (options.excludeEpoch && candidate.epoch === options.excludeEpoch) continue;
            if (options.filterCategory && candidate.category !== options.filterCategory) continue;

            const { distance, similarity } = this.calculateEventDistance(query, candidate, weights);
            matches.push({
                event: candidate,
                distance,
                similarity
            });
        }

        // Sort ascending by distance (descending by similarity)
        matches.sort((a, b) => a.distance - b.distance);
        const topMatches = matches.slice(0, topK);

        // Aggregate statistics of the nearest analogs
        const avgDistance = topMatches.reduce((acc, m) => acc + m.distance, 0) / (topMatches.length || 1);
        const avgSimilarity = topMatches.reduce((acc, m) => acc + m.similarity, 0) / (topMatches.length || 1);
        const rmdCount = topMatches.filter(m => m.event.prediction === 'RMD').length;
        const cmnCount = topMatches.length - rmdCount;
        const rmdProbability = topMatches.length ? round(rmdCount / topMatches.length) : 0.5;
        const avgPostDeltaCTH = topMatches.reduce((acc, m) => acc + m.event.delta_cth, 0) / (topMatches.length || 1);

        // Epoch distribution among analogs
        const epochDistribution = {};
        for (const m of topMatches) {
            epochDistribution[m.event.epoch] = (epochDistribution[m.event.epoch] || 0) + 1;
        }

        return {
            query_summary: {
                cth_global: query.cth_global ?? query.macro_context?.cth_global,
                delta_cth: query.delta_cth ?? query.macro_context?.deltaCTH,
                evei: query.evei ?? query.macro_context?.evei_average,
                category: query.category ?? 'unspecified'
            },
            analogs_count: topMatches.length,
            average_distance: round(avgDistance),
            average_similarity: round(avgSimilarity),
            empirical_verdict: {
                rmd_transformations: rmdCount,
                cmn_collapses: cmnCount,
                rmd_empirical_probability: rmdProbability,
                cmn_empirical_probability: round(1 - rmdProbability),
                average_outcome_delta_cth: round(avgPostDeltaCTH)
            },
            epoch_distribution: epochDistribution,
            top_analogs: topMatches.map(m => ({
                event_id: m.event.event_id,
                name: m.event.name,
                year: m.event.year,
                epoch: m.event.epoch,
                category: m.event.category,
                region: m.event.region,
                similarity: m.similarity,
                distance: m.distance,
                cth_global: m.event.cth_global,
                delta_cth: m.event.delta_cth,
                evei: m.event.evei,
                ultra_cth: m.event.ultra_cth,
                prediction: m.event.prediction,
                certainty_bracket: m.event.certainty_bracket,
                primary_actor_id: m.event.primary_actor_id
            }))
        };
    }

    /**
     * Search the 12,000-character database for closest historical actor analogs
     * @param {object} queryActor - Actor attributes object
     * @param {object} [options]
     * @param {number} [options.topK=10]
     * @param {string} [options.excludeId]
     * @param {string} [options.filterRole]
     * @param {string} [options.filterDomain]
     */
    findCharacterAnalogs(queryActor, options = {}) {
        const topK = options.topK ?? 10;
        const weights = { ...DEFAULT_CHARACTER_WEIGHTS, ...options.weights };
        const characters = this._getCharacters();

        const matches = [];

        for (const candidate of characters) {
            if (options.excludeId && candidate.character_id === options.excludeId) continue;
            if (options.filterRole && candidate.historical_role !== options.filterRole) continue;
            if (options.filterDomain && candidate.primary_domain !== options.filterDomain) continue;

            let sumSq = 0;
            let sumW = 0;

            for (const [key, w] of Object.entries(weights)) {
                const qVal = queryActor[key] ?? 0.5;
                const cVal = candidate[key] ?? 0.5;
                const diff = qVal - cVal;
                sumSq += w * (diff * diff);
                sumW += w;
            }

            const distance = Math.sqrt(sumSq / sumW);
            const similarity = Math.max(0, 1 - distance);

            matches.push({
                character: candidate,
                distance: round(distance),
                similarity: round(similarity)
            });
        }

        matches.sort((a, b) => a.distance - b.distance);
        const topMatches = matches.slice(0, topK);

        return {
            query_role: queryActor.historical_role ?? 'unspecified',
            analogs_count: topMatches.length,
            average_similarity: round(topMatches.reduce((a, b) => a + b.similarity, 0) / (topMatches.length || 1)),
            top_analogs: topMatches.map(m => ({
                character_id: m.character.character_id,
                name: m.character.name,
                epoch: m.character.epoch,
                historical_role: m.character.historical_role,
                primary_domain: m.character.primary_domain,
                active_years: `${m.character.active_year_start} to ${m.character.active_year_end}`,
                similarity: m.similarity,
                distance: m.distance,
                token_impact_score_tis: m.character.token_impact_score_tis,
                power_index: m.character.power_index,
                legitimacy: m.character.legitimacy,
                ideological_extremity: m.character.ideological_extremity,
                associated_event_id: m.character.associated_event_id
            }))
        };
    }

    /**
     * Enriches a canonical CTH event input with empirical historical analogs
     * directly into macro_context.historical_analogs, replacing guesswork with
     * real dataset matching for the CTHTemporalEngine!
     *
     * @param {object} canonicalInput - Canonical event input for CTHMasterPredictorEngine
     * @param {object} [options]
     * @returns {object} - Enriched canonical input ready for predictEvent()
     */
    enrichEventWithAnalogs(canonicalInput, options = {}) {
        const mc = canonicalInput.macro_context ?? {};
        const query = {
            cth_global: mc.cth_global,
            delta_cth: mc.deltaCTH,
            evei: mc.evei_average,
            black_swan_index: mc.blackSwanIndex,
            historical_epoch_score_E: mc.indicatorA,
            social_range_score_S: mc.indicatorB,
            age_range_score_A: mc.indicatorC,
            category: canonicalInput.category
        };

        const results = this.findEventAnalogs(query, {
            topK: options.topK ?? 25,
            excludeId: canonicalInput.id
        });

        const enriched = JSON.parse(JSON.stringify(canonicalInput));
        enriched.macro_context.historical_analogs = {
            count: results.analogs_count,
            avg_contextual_difference: results.average_distance,
            empirical_rmd_probability: results.empirical_verdict.rmd_empirical_probability,
            closest_analog: results.top_analogs[0]?.name ?? 'None',
            closest_analog_id: results.top_analogs[0]?.event_id ?? null,
            closest_analog_similarity: results.top_analogs[0]?.similarity ?? null
        };

        return enriched;
    }
}

export default CTHAnalogMatcher;
