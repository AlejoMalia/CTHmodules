/**
 * CTH-ANALYSIS-ENGINE.JS 
 */

import CTHCoreFoundationEngine from './cth-core-foundation-engine.js';

export class CTHAnalysisEngine {
    constructor(data = {}) {
        this.data = data;
        this.core = new CTHCoreFoundationEngine(data);
    }

    _calculateExtendedMetrics() {
        const nSim = 15000;
        let iec = 0, ppi = 0, vvc = 0, mce = 0, iig = 0;
        for (let i = 0; i < nSim; i++) {
            iec += 0.45 + Math.random() * 0.35;
            ppi += 0.55 + Math.random() * 0.40;
            vvc += 0.35 + Math.random() * 0.30;
            mce += 0.60 + Math.random() * 0.25;
            iig += 0.50 + Math.random() * 0.45;
        }
        return {
            IEC: Number((iec / nSim).toFixed(4)),
            PPI: Number((ppi / nSim).toFixed(4)),
            VVC: Number((vvc / nSim).toFixed(4)),
            MCE: Number((mce / nSim).toFixed(4)),
            IIG: Number((iig / nSim).toFixed(4))
        };
    }

    _calculatePotentialFactors() {
        const fhEVEI = (this.data.fh_evei || 0.75) * 3; // 3 human factors example
        const feEVEI = (this.data.fe_evei || 0.68) * 2;
        const fpEVEI = (fhEVEI + feEVEI) / 5;
        return {
            FP_EVEI: Number(fpEVEI.toFixed(4)),
            FP_CTH: Number(((this.data.cth_global || 0.72) * 0.6 + fpEVEI * 0.4).toFixed(4))
        };
    }

    _calculateMargins() {
        const cth = this.data.cth_global || 0.72;
        const evei = this.data.evei_average || 0.68;
        const fp = 0.71;
        const macromargin = (cth * 0.4 + evei * 0.4 + fp * 0.2).toFixed(4);
        const micromargin = (cth * 0.5 + evei * 0.3 + fp * 0.2).toFixed(4);
        return { macromargin: parseFloat(macromargin), micromargin: parseFloat(micromargin) };
    }

    async process() {
        const core = await this.core.process();
        const extended = this._calculateExtendedMetrics();
        const fp = this._calculatePotentialFactors();
        const margins = this._calculateMargins();

        const overallAnalyticalVulnerability = (
            (1 - core.cthProfile.avgCTH) * 0.30 +
            (1 - core.eveiProfile.evei) * 0.35 +
            (1 - extended.PPI) * 0.20 +
            (extended.VVC) * 0.15
        ).toFixed(4);

        return {
            engine: "CTHAnalysisEngine v2.0 FULL",
            extendedMetrics: extended,
            potentialFactors: fp,
            margins: margins,
            overallAnalyticalVulnerability: parseFloat(overallAnalyticalVulnerability),
            alertLevel: parseFloat(overallAnalyticalVulnerability) > 0.68 ? "CRITICAL METRIC ZONES DETECTED" : "ANALYSIS STABLE",
            recommendation: "Usar macromargin para proyecciones macro-históricas"
        };
    }
}

export default CTHAnalysisEngine;