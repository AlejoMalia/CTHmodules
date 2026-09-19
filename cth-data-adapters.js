/**
 * CTH-DATA-ADAPTERS.JS — v4.1 (Phase F.32)
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Concrete IDataAdapter implementations. v4.0 shipped the interface; v4.1 ships
 * working adapters so structured real-world data (OWID / V-Dem / Seshat-style
 * time series, CSV exports) flows into the kernel without manual translation.
 *
 * UNIVERSAL TEMPORAL CONTRACT:
 *   - Years are plain integers on the astronomical axis: negative = BCE
 *     (e.g. -1177 = 1177 BCE), 0 is valid, future years are valid.
 *   - No adapter contains epoch-specific constants. Era labels are derived
 *     descriptors, never inputs to any formula.
 *   - Any event, any year, any epoch: same pipeline, same math.
 */

import { IDataAdapter } from './cth-bridge.js';
import { estimateEVEIFromSeries, estimateEVEIFromIndicators } from './cth-evei-estimator.js';

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));

// ─── Universal year handling ──────────────────────────────────────────────────

/** Format an astronomical year as a human label. Pure display; never used in math. */
export function formatYear(year) {
    if (!Number.isFinite(year)) throw new Error('[CTH-Adapter] year must be a finite number.');
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

/** Derived era descriptor — informational only, never enters any formula. */
export function eraDescriptor(year) {
    if (year < -3000) return 'PREHISTORIC_OR_EARLY_BRONZE';
    if (year < -800)  return 'BRONZE_IRON_AGE';
    if (year < 500)   return 'CLASSICAL_ANTIQUITY';
    if (year < 1500)  return 'MEDIEVAL';
    if (year < 1800)  return 'EARLY_MODERN';
    if (year < 1945)  return 'MODERN';
    if (year <= new Date().getFullYear()) return 'CONTEMPORARY';
    return 'FUTURE_PROJECTION';
}

// ─── Phase reconstruction from a series ──────────────────────────────────────

/** Map an arbitrary-length normalized series onto the five canonical phases. */
function seriesToPhases(series) {
    const s = series.map(v => clamp(v));
    const pick = frac => s[Math.min(s.length - 1, Math.round(frac * (s.length - 1)))];
    return {
        before:     Number(pick(0.00).toFixed(4)),
        prelude:    Number(pick(0.25).toFixed(4)),
        during:     Number(pick(0.50).toFixed(4)),
        transition: Number(pick(0.75).toFixed(4)),
        after:      Number(pick(1.00).toFixed(4))
    };
}

// ─── TimeSeriesAdapter ────────────────────────────────────────────────────────

/**
 * Converts multi-channel normalized time series into a full canonical CTH input.
 * Designed for OWID / V-Dem / Seshat-style exports after column normalization.
 *
 * rawInput contract:
 * {
 *   id: string,
 *   year: integer (negative = BCE),
 *   series: {
 *     political:   number[] (0–1, ≥5 points),   // e.g. V-Dem polyarchy, Seshat gov. quality
 *     economic:    number[] (0–1, ≥5 points),   // e.g. normalized GDP pc / price stability
 *     social:      number[] (0–1, ≥5 points),   // e.g. literacy, cohesion proxies
 *     demographic: number[] (0–1, optional),    // e.g. normalized population trajectory
 *     event_density: number[] (0–1, optional)   // political event density
 *   },
 *   actor?: token_instance fields (or actors?: token_instance[]),
 *   observation_loop?: number,
 *   population?: number
 * }
 */
export class TimeSeriesAdapter extends IDataAdapter {
    adapt(raw) {
        if (!raw || typeof raw !== 'object') throw new Error('[CTH-Adapter] rawInput must be an object.');
        const { id, year, series } = raw;
        if (id == null)   throw new Error('[CTH-Adapter] rawInput.id is required.');
        if (!Number.isFinite(year)) throw new Error('[CTH-Adapter] rawInput.year must be a finite integer (negative = BCE).');
        for (const key of ['political', 'economic', 'social']) {
            if (!Array.isArray(series?.[key]) || series[key].length < 5) {
                throw new Error(`[CTH-Adapter] series.${key} must have at least 5 normalized points.`);
            }
        }

        const pol = series.political.map(v => clamp(v));
        const eco = series.economic.map(v => clamp(v));
        const soc = series.social.map(v => clamp(v));
        const composite = pol.map((v, i) => (v + eco[Math.min(i, eco.length - 1)] + soc[Math.min(i, soc.length - 1)]) / 3);

        const phases   = seriesToPhases(composite);
        const eveiEst  = estimateEVEIFromSeries(series);
        const cthGlobal = composite.reduce((a, b) => a + b, 0) / composite.length;
        const deltaCTH  = phases.after - phases.before;
        const deltas    = composite.slice(1).map((v, i) => Number((v - composite[i]).toFixed(4)));
        const blackSwan = clamp(eveiEst.components.volatility * 2.2 + eveiEst.components.drawdown * 0.8);

        const last  = arr => arr[arr.length - 1];
        const meanOf = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

        const macro_context = {
            cth_global:     Number(cthGlobal.toFixed(4)),
            evei_average:   eveiEst.evei,
            blackSwanIndex: Number(blackSwan.toFixed(4)),
            deltaCTH:       Number(deltaCTH.toFixed(4)),
            indicatorA:     Number(meanOf(pol).toFixed(4)),
            indicatorB:     Number(meanOf(eco).toFixed(4)),
            indicatorC:     Number(meanOf(soc).toFixed(4)),
            extendedMetrics: {
                IEC: Number(clamp(1 - eveiEst.components.volatility * 3).toFixed(4)),
                PPI: Number(clamp(Math.sqrt(eveiEst.evei * cthGlobal) + 0.15).toFixed(4)),
                VVC: Number(clamp(eveiEst.components.volatility * 4).toFixed(4))
            },
            phasesCTH: phases,
            externalFactors: raw.external_factors ?? { unobserved_context: 0.5 },
            event_valuation_structure: Number((eveiEst.evei * 100).toFixed(1)),
            context_series: [phases.before, phases.prelude, phases.during, phases.transition, phases.after],
            delta_series:   deltas.length >= 2 ? deltas : [deltaCTH / 2, deltaCTH / 2],
            black_swan_factor: Number(blackSwan.toFixed(4)),
            adaptive_capacity: Number(clamp(phases.after >= phases.during ? 0.5 + (phases.after - phases.during) : 0.5 - (phases.during - phases.after)).toFixed(4)),
            mechanics: (() => {
                // Action/reaction/result shares from where movement concentrates in the series
                const drop = Math.max(0.05, phases.before - phases.during);
                const rec  = Math.max(0.05, phases.after - phases.during);
                const rem  = Math.max(0.05, 1 - drop - rec);
                const t    = drop + rec + rem;
                return { action: Number((drop / t).toFixed(4)), reaction: Number((rec / t).toFixed(4)), result: Number((rem / t).toFixed(4)) };
            })(),
            triphasic: {
                before:  { evei: Number(clamp(eveiEst.evei * 0.6).toFixed(4)),  cth: phases.before },
                prelude: { evei: Number(clamp(eveiEst.evei * 0.8).toFixed(4)),  cth: phases.prelude },
                during:  { evei: eveiEst.evei,                                  cth: phases.during }
            },
            pentaphasic: { models: raw.pentaphasic_models ?? [] },
            supraphasic: { rtis: raw.supraphasic_rtis ?? [{ power: eveiEst.evei, persistence: Number(clamp(1 - eveiEst.components.volatility * 2).toFixed(4)) }] },
            fh_evei: eveiEst.evei,
            fe_evei: Number(clamp(eveiEst.evei * 0.92).toFixed(4)),
            historical_analogs: raw.historical_analogs ?? null,
            constructors: raw.constructors ?? [],
            PopulationRange: raw.population ?? null
        };
        if (raw.historical_analogs == null) delete macro_context.historical_analogs;

        const out = {
            id: String(id),
            macro_context,
            epoch_descriptor: {
                year,
                year_label: formatYear(year),
                era: eraDescriptor(year),
                axis: 'ASTRONOMICAL_YEAR' // negative = BCE; no calendar assumptions
            },
            observation_loop: raw.observation_loop ?? 0,
            _adapter_audit: {
                adapter: 'TimeSeriesAdapter', schema: '4.1',
                evei_method: eveiEst.method, evei_components: eveiEst.components,
                universality: 'year axis unbounded; era label is descriptive only'
            }
        };
        if (Array.isArray(raw.actors) && raw.actors.length > 0) {
            out.token_instances = raw.actors;
            out.token_instance  = raw.actors[0];
        } else {
            out.token_instance = raw.actor ?? {
                actor_volatility: Number(clamp(eveiEst.components.volatility * 3).toFixed(4)),
                trigger_force:    Number(clamp(eveiEst.components.drawdown * 2).toFixed(4)),
                historical_role:  'wildcard'
            };
        }
        return out;
    }
}

// ─── CSVAdapter ───────────────────────────────────────────────────────────────

/**
 * Parses a CSV export (OWID/V-Dem style: one row per time step) and delegates
 * to TimeSeriesAdapter. Column mapping is caller-defined; values are min-max
 * normalized per column so any unit system works — universality preserved.
 *
 * usage:
 *   new CSVAdapter({ political: 'vdem_polyarchy', economic: 'gdp_pc', social: 'literacy' })
 *       .adapt({ id, year, csv: '...' })
 */
export class CSVAdapter extends IDataAdapter {
    constructor(columnMap) {
        super();
        if (!columnMap?.political || !columnMap?.economic || !columnMap?.social) {
            throw new Error('[CTH-Adapter] CSVAdapter requires a columnMap with political, economic, social keys.');
        }
        this.columnMap = columnMap;
        this._inner = new TimeSeriesAdapter();
    }

    static parse(csvText) {
        const lines  = String(csvText).trim().split(/\r?\n/).filter(l => l.trim() !== '');
        if (lines.length < 2) throw new Error('[CTH-Adapter] CSV must contain a header and at least one row.');
        const header = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const cells = line.split(',').map(c => c.trim());
            return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
        });
    }

    static normalizeColumn(rows, column) {
        const vals = rows.map(r => Number(r[column])).filter(v => Number.isFinite(v));
        if (vals.length < 5) throw new Error(`[CTH-Adapter] column "${column}" needs at least 5 numeric rows.`);
        const min = Math.min(...vals), max = Math.max(...vals);
        return max > min ? vals.map(v => (v - min) / (max - min)) : vals.map(() => 0.5);
    }

    adapt(raw) {
        if (!raw?.csv) throw new Error('[CTH-Adapter] rawInput.csv is required for CSVAdapter.');
        const rows = CSVAdapter.parse(raw.csv);
        const series = {
            political: CSVAdapter.normalizeColumn(rows, this.columnMap.political),
            economic:  CSVAdapter.normalizeColumn(rows, this.columnMap.economic),
            social:    CSVAdapter.normalizeColumn(rows, this.columnMap.social)
        };
        if (this.columnMap.event_density) series.event_density = CSVAdapter.normalizeColumn(rows, this.columnMap.event_density);
        return this._inner.adapt({ ...raw, series });
    }
}

// ─── SnapshotAdapter ──────────────────────────────────────────────────────────

/**
 * Minimal-input adapter for events where only snapshot indicators exist
 * (common for ancient/poorly documented events — universality means the
 * pipeline degrades gracefully with data scarcity, it does not refuse).
 *
 * rawInput: { id, year, political_stability, economic_stability, social_cohesion,
 *             delta_cth?, black_swan?, phases?, actor?/actors?, population? }
 */
export class SnapshotAdapter extends IDataAdapter {
    adapt(raw) {
        const est = estimateEVEIFromIndicators(raw);
        const base = clamp((clamp(raw.political_stability) + clamp(raw.economic_stability) + clamp(raw.social_cohesion)) / 3);
        const d    = raw.delta_cth ?? 0;
        // Reconstruct a plausible 5-point trajectory around the snapshot when phases are absent
        const phases = raw.phases ?? {
            before:     Number(clamp(base - Math.min(0, d) * 0.2 + Math.abs(d) * 0.35).toFixed(4)),
            prelude:    Number(clamp(base + Math.abs(d) * 0.15).toFixed(4)),
            during:     Number(clamp(base - Math.abs(d) * 0.45).toFixed(4)),
            transition: Number(clamp(base - Math.abs(d) * 0.15 + Math.max(0, d) * 0.3).toFixed(4)),
            after:      Number(clamp(base + d).toFixed(4))
        };
        const seriesRaw = {
            id: raw.id, year: raw.year,
            series: {
                political: [phases.before, phases.prelude, phases.during, phases.transition, phases.after],
                economic:  [phases.before, phases.prelude, phases.during, phases.transition, phases.after].map(v => clamp(v * (0.9 + clamp(raw.economic_stability) * 0.2))),
                social:    [phases.before, phases.prelude, phases.during, phases.transition, phases.after].map(v => clamp(v * (0.9 + clamp(raw.social_cohesion) * 0.2)))
            },
            actor: raw.actor, actors: raw.actors,
            observation_loop: raw.observation_loop, population: raw.population,
            external_factors: raw.external_factors, historical_analogs: raw.historical_analogs,
            constructors: raw.constructors
        };
        const out = new TimeSeriesAdapter().adapt(seriesRaw);
        // Snapshot EVEI is the more direct estimate here — override series-derived value
        out.macro_context.evei_average = est.evei;
        out.macro_context.fh_evei      = est.evei;
        out.macro_context.fe_evei      = Number(clamp(est.evei * 0.92).toFixed(4));
        out.macro_context.event_valuation_structure = Number((est.evei * 100).toFixed(1));
        out.macro_context.blackSwanIndex = clamp(raw.black_swan ?? out.macro_context.blackSwanIndex);
        out._adapter_audit = { ...out._adapter_audit, adapter: 'SnapshotAdapter', evei_method: est.method, evei_components: est.components };
        return out;
    }
}

export default { TimeSeriesAdapter, CSVAdapter, SnapshotAdapter, formatYear, eraDescriptor };
