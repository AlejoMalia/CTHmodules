/**
 * CTH-PREDICTION-REGISTRY.JS — v4.1 (Phase F.35)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Pre-registered prediction ledger. The only path from "credible model" to
 * "demonstrated forecaster" runs through predictions that are:
 *   1. PUBLISHED BEFORE the outcome (timestamp + SHA-256 commitment),
 *   2. RESOLVED PUBLICLY against a pre-declared resolution criterion,
 *   3. SCORED with proper scoring rules (Brier, MAE).
 *
 * Every entry commits to { event, policy_version, prediction, resolution
 * criterion, resolution date } via SHA-256 at registration time. Tampering
 * with any field after the fact breaks the commitment hash — the ledger is
 * self-auditing. Registry entries are append-only: resolution ADDS fields,
 * it never mutates the committed prediction.
 *
 * Works with any event, any timescale, any era — the ledger stores what the
 * caller commits, it imposes no domain restrictions.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const REGISTRY_SCHEMA = '4.1';

function _commitmentHash(entry) {
    return createHash('sha256').update(JSON.stringify({
        id:                  entry.id,
        registered_at:       entry.registered_at,
        event_id:            entry.event_id,
        policy_version:      entry.policy_version,
        prediction_hash:     entry.prediction_hash,
        predicted_ultraCTH:  entry.predicted_ultraCTH,
        rmd_prediction:      entry.rmd_prediction,
        certainty_bracket:   entry.certainty_bracket,
        resolution_criterion: entry.resolution_criterion,
        resolution_date:     entry.resolution_date
    })).digest('hex');
}

export class PredictionRegistry {
    /** @param {string|null} filePath — JSON ledger path; null = in-memory only */
    constructor(filePath = null) {
        this.filePath = filePath;
        this.ledger = { schema: REGISTRY_SCHEMA, created_at: null, entries: [] };
        if (filePath && existsSync(filePath)) {
            this.ledger = JSON.parse(readFileSync(filePath, 'utf8'));
        } else {
            this.ledger.created_at = new Date().toISOString();
        }
    }

    _persist() {
        if (this.filePath) writeFileSync(this.filePath, JSON.stringify(this.ledger, null, 2) + '\n');
    }

    /**
     * Pre-register a prediction BEFORE the outcome is known.
     * @param {object} prediction — full result of predictEvent() (uses synthesis + hash)
     * @param {object} meta
     * @param {string} meta.description — human-readable statement of what is predicted
     * @param {string} meta.resolution_criterion — pre-declared, unambiguous resolution rule
     * @param {string} meta.resolution_date — ISO date when the prediction resolves
     * @param {string} [meta.policy_version]
     */
    register(prediction, meta) {
        for (const f of ['description', 'resolution_criterion', 'resolution_date']) {
            if (!meta?.[f]) throw new Error(`[CTH-Registry] meta.${f} is required — predictions without a pre-declared ${f} are not falsifiable.`);
        }
        if (!prediction?.synthesis || !prediction?.hash) {
            throw new Error('[CTH-Registry] register() expects a full predictEvent() result (synthesis + hash).');
        }
        const entry = {
            id:                 `PRED-${this.ledger.entries.length + 1}-${prediction.event_id}`,
            registered_at:      new Date().toISOString(),
            event_id:           prediction.event_id,
            description:        meta.description,
            policy_version:     meta.policy_version ?? 'unversioned',
            prediction_hash:    prediction.hash,
            predicted_ultraCTH: prediction.synthesis.ultraCTH,
            rmd_prediction:     prediction.synthesis.rmd_prediction,
            certainty_bracket:  prediction.synthesis.certainty_bracket,
            resolution_criterion: meta.resolution_criterion,
            resolution_date:    meta.resolution_date,
            status:             'PENDING'
        };
        entry.commitment_hash = _commitmentHash(entry);
        this.ledger.entries.push(entry);
        this._persist();
        return entry;
    }

    /**
     * Resolve a pending prediction with the observed outcome (0–1 per the
     * pre-declared criterion). Appends resolution fields; never mutates the
     * committed prediction.
     */
    resolve(entryId, observed_outcome, { notes = null, resolved_by = null } = {}) {
        const entry = this.ledger.entries.find(e => e.id === entryId);
        if (!entry) throw new Error(`[CTH-Registry] entry ${entryId} not found.`);
        if (entry.status !== 'PENDING') throw new Error(`[CTH-Registry] entry ${entryId} already ${entry.status}.`);
        if (!this.verify(entryId).valid) throw new Error(`[CTH-Registry] entry ${entryId} fails commitment verification — ledger may have been tampered with.`);
        const observed = Math.max(0, Math.min(1, Number(observed_outcome)));
        entry.status       = 'RESOLVED';
        entry.resolved_at  = new Date().toISOString();
        entry.observed_outcome = observed;
        entry.error        = Number(Math.abs(entry.predicted_ultraCTH - observed).toFixed(4));
        entry.brier        = Number(((entry.predicted_ultraCTH - observed) ** 2).toFixed(4));
        if (notes)       entry.resolution_notes = notes;
        if (resolved_by) entry.resolved_by      = resolved_by;
        this._persist();
        return entry;
    }

    /** Verify an entry's commitment hash (or the whole ledger with no arg). */
    verify(entryId = null) {
        const check = e => _commitmentHash(e) === e.commitment_hash;
        if (entryId) {
            const entry = this.ledger.entries.find(e => e.id === entryId);
            if (!entry) throw new Error(`[CTH-Registry] entry ${entryId} not found.`);
            return { id: entryId, valid: check(entry) };
        }
        const results = this.ledger.entries.map(e => ({ id: e.id, valid: check(e) }));
        return { total: results.length, all_valid: results.every(r => r.valid), entries: results };
    }

    /** Aggregate score over resolved predictions — the model's real-world track record. */
    score() {
        const resolved = this.ledger.entries.filter(e => e.status === 'RESOLVED');
        const pending  = this.ledger.entries.filter(e => e.status === 'PENDING');
        if (resolved.length === 0) {
            return { resolved: 0, pending: pending.length, MAE: null, brier: null, note: 'No resolved predictions yet — track record accrues as pre-registered predictions resolve.' };
        }
        return {
            resolved: resolved.length,
            pending:  pending.length,
            MAE:   Number((resolved.reduce((a, e) => a + e.error, 0) / resolved.length).toFixed(4)),
            brier: Number((resolved.reduce((a, e) => a + e.brier, 0) / resolved.length).toFixed(4)),
            directional_accuracy: Number((resolved.filter(e => e.rmd_prediction === (e.observed_outcome > 0.5)).length / resolved.length).toFixed(4)),
            integrity: this.verify()
        };
    }

    list(status = null) {
        return this.ledger.entries.filter(e => status == null || e.status === status);
    }
}

export default PredictionRegistry;
