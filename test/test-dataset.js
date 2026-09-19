/**
 * TEST/TEST-DATASET.JS — Validation suite for CTH dataset
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Verifies completeness, schema conformity, numerical bounds,
 * and API functionality for the 12,000 events and 12,000 characters.
 */

import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    EPOCH_KEYS,
    loadEpoch,
    getDatasetSummary,
    getEvents,
    getCharacters,
    getEventById,
    getCharacterById
} from '../dataset/index.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const DATASET_DIR = join(ROOT, 'dataset');

let passed = 0;
let failed = 0;

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

console.log('\nCTH Pre-Calculated Dataset Validation Suite\n');

// 1. Structure & Epochs
await test('structure: all 6 canonical epochs defined and accessible', () => {
    assert.equal(EPOCH_KEYS.length, 6);
    assert.deepEqual(EPOCH_KEYS, [
        'bronze_and_iron_age',
        'classical_antiquity',
        'medieval',
        'early_modern',
        'modern',
        'contemporary'
    ]);
});

// 2. Master summary
await test('master: dataset_summary.json exists with 12,000 events & 12,000 characters', () => {
    const summary = getDatasetSummary();
    assert.equal(summary.total_events, 12000);
    assert.equal(summary.total_characters, 12000);
    assert.equal(summary.total_epochs, 6);
    assert.equal(summary.epochs.length, 6);
});

// 3. Master files exist
await test('master: all_events.csv and all_characters.csv exist and non-empty', () => {
    const eventsCsvPath = join(DATASET_DIR, 'master', 'all_events.csv');
    const charsCsvPath = join(DATASET_DIR, 'master', 'all_characters.csv');
    assert.ok(existsSync(eventsCsvPath), 'all_events.csv missing');
    assert.ok(existsSync(charsCsvPath), 'all_characters.csv missing');

    const evLines = readFileSync(eventsCsvPath, 'utf-8').trim().split('\n');
    const chLines = readFileSync(charsCsvPath, 'utf-8').trim().split('\n');
    assert.equal(evLines.length, 12001, 'all_events.csv must have header + 12,000 rows');
    assert.equal(chLines.length, 12001, 'all_characters.csv must have header + 12,000 rows');
});

// 4. Per-epoch integrity
for (const epoch of EPOCH_KEYS) {
    await test(`epoch [${epoch}]: exactly 2,000 events and 2,000 characters`, () => {
        const { events, characters } = loadEpoch(epoch);
        assert.equal(events.length, 2000, `Events count mismatch for ${epoch}`);
        assert.equal(characters.length, 2000, `Characters count mismatch for ${epoch}`);
    });
}

// 5. Numerical bounds for Dimensions E, S, A, P and CTH metrics
await test('metrics: sub-metrics and E, S, A, P dimensions in valid [0, 1] range', () => {
    const sample = getEvents({ epoch: 'classical_antiquity' });
    for (const ev of sample.slice(0, 100)) {
        assert.ok(ev.historical_epoch_score_E >= 0 && ev.historical_epoch_score_E <= 1, 'E score out of bounds');
        assert.ok(ev.social_range_score_S >= 0 && ev.social_range_score_S <= 1, 'S score out of bounds');
        assert.ok(ev.age_range_score_A >= 0 && ev.age_range_score_A <= 1, 'A score out of bounds');
        assert.ok(ev.population_range_score_P >= 0 && ev.population_range_score_P <= 1, 'P score out of bounds');
        assert.ok(ev.cth_global >= 0 && ev.cth_global <= 1, 'cth_global out of bounds');
        assert.ok(ev.evei >= 0 && ev.evei <= 1, 'evei out of bounds');
        assert.ok(ev.ultra_cth >= 0 && ev.ultra_cth <= 1, 'ultra_cth out of bounds');
        assert.ok(['RMD', 'CMN'].includes(ev.prediction), 'prediction invalid');
        assert.ok(ev.delta_cth >= -1 && ev.delta_cth <= 1, 'delta_cth out of bounds');
    }
});

// 6. Token Dynamics and Actor metrics
await test('tokens: TIS, TIM multipliers, and roles valid', () => {
    const chars = getCharacters({ epoch: 'medieval' });
    for (const ch of chars.slice(0, 100)) {
        assert.ok(ch.token_impact_score_tis >= 0 && ch.token_impact_score_tis <= 1, 'TIS out of bounds');
        assert.ok(['architect', 'catalyst', 'stabilizer', 'disruptor', 'wildcard'].includes(ch.historical_role));
        assert.ok(ch.tim_foundation > 0, 'tim_foundation invalid');
        assert.ok(ch.tim_dynamics > 0, 'tim_dynamics invalid');
        assert.ok(ch.tim_chaos > 0, 'tim_chaos invalid');
    }
});

// 7. API Filtering & Querying
await test('api: query filtering works correctly', () => {
    const transformations = getEvents({
        epoch: 'early_modern',
        category: 'transformation',
        prediction: 'RMD'
    });
    assert.ok(transformations.length > 0, 'Should find transformations');
    for (const t of transformations) {
        assert.equal(t.epoch, 'early_modern');
        assert.equal(t.category, 'transformation');
        assert.equal(t.prediction, 'RMD');
    }

    const firstEvt = transformations[0];
    const retrieved = getEventById(firstEvt.event_id);
    assert.equal(retrieved.event_id, firstEvt.event_id);

    const char = getCharacterById(firstEvt.primary_actor_id);
    assert.ok(char != null, 'Primary actor should be found');
    assert.equal(char.character_id, firstEvt.primary_actor_id);
});

console.log(`\nDataset Tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
