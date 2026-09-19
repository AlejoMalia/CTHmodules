/**
 * DATASET/INDEX.JS — CTH Framework Universal Historical Dataset API
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Programmatic interface for querying and streaming the pre-calculated CTH dataset.
 * Covers 12,000 historical events and 12,000 historical characters across 6 epochs.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const EPOCH_KEYS = [
    'bronze_and_iron_age',
    'classical_antiquity',
    'medieval',
    'early_modern',
    'modern',
    'contemporary'
];

/**
 * Read and parse JSON file safely
 */
function readJSON(relPath) {
    const fullPath = join(__dirname, relPath);
    if (!existsSync(fullPath)) {
        throw new Error(`[CTH-Dataset] File not found: ${fullPath}`);
    }
    return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

/**
 * Load events and characters for a specific epoch
 * @param {string} epochKey - e.g. 'classical_antiquity', 'medieval'
 * @returns {{ events: Array<object>, characters: Array<object> }}
 */
export function loadEpoch(epochKey) {
    if (!EPOCH_KEYS.includes(epochKey)) {
        throw new Error(`[CTH-Dataset] Unknown epoch: "${epochKey}". Valid epochs: ${EPOCH_KEYS.join(', ')}`);
    }
    const events = readJSON(`epochs/${epochKey}/events.json`);
    const characters = readJSON(`epochs/${epochKey}/characters.json`);
    return { events, characters };
}

/**
 * Get dataset summary statistics
 */
export function getDatasetSummary() {
    return readJSON('master/dataset_summary.json');
}

/**
 * Load all events across all epochs (or filtered)
 * @param {object} [filter]
 * @param {string} [filter.epoch]
 * @param {string} [filter.category]
 * @param {string} [filter.prediction] - 'RMD' or 'CMN'
 * @param {number} [filter.yearMin]
 * @param {number} [filter.yearMax]
 * @param {string} [filter.region]
 * @returns {Array<object>}
 */
export function getEvents(filter = {}) {
    let events = [];
    if (filter.epoch) {
        events = readJSON(`epochs/${filter.epoch}/events.json`);
    } else {
        for (const ep of EPOCH_KEYS) {
            events.push(...readJSON(`epochs/${ep}/events.json`));
        }
    }

    return events.filter(evt => {
        if (filter.category && evt.category !== filter.category) return false;
        if (filter.prediction && evt.prediction !== filter.prediction) return false;
        if (filter.yearMin != null && evt.year < filter.yearMin) return false;
        if (filter.yearMax != null && evt.year > filter.yearMax) return false;
        if (filter.region && !evt.region.toLowerCase().includes(filter.region.toLowerCase())) return false;
        return true;
    });
}

/**
 * Load historical characters (or filtered)
 * @param {object} [filter]
 * @param {string} [filter.epoch]
 * @param {string} [filter.historical_role] - 'architect', 'catalyst', 'stabilizer', 'disruptor', 'wildcard'
 * @param {string} [filter.primary_domain]
 * @param {boolean} [filter.mule_clause_risk]
 * @returns {Array<object>}
 */
export function getCharacters(filter = {}) {
    let chars = [];
    if (filter.epoch) {
        chars = readJSON(`epochs/${filter.epoch}/characters.json`);
    } else {
        for (const ep of EPOCH_KEYS) {
            chars.push(...readJSON(`epochs/${ep}/characters.json`));
        }
    }

    return chars.filter(c => {
        if (filter.historical_role && c.historical_role !== filter.historical_role) return false;
        if (filter.primary_domain && c.primary_domain !== filter.primary_domain) return false;
        if (filter.mule_clause_risk != null && c.mule_clause_risk !== filter.mule_clause_risk) return false;
        return true;
    });
}

/**
 * Get single event by ID
 * @param {string} eventId
 */
export function getEventById(eventId) {
    for (const ep of EPOCH_KEYS) {
        const events = readJSON(`epochs/${ep}/events.json`);
        const found = events.find(e => e.event_id === eventId);
        if (found) return found;
    }
    return null;
}

/**
 * Get single character by ID
 * @param {string} characterId
 */
export function getCharacterById(characterId) {
    for (const ep of EPOCH_KEYS) {
        const chars = readJSON(`epochs/${ep}/characters.json`);
        const found = chars.find(c => c.character_id === characterId);
        if (found) return found;
    }
    return null;
}

export default {
    EPOCH_KEYS,
    loadEpoch,
    getDatasetSummary,
    getEvents,
    getCharacters,
    getEventById,
    getCharacterById
};
