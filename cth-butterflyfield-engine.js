/**
 * CTH-BUTTERFLYFIELD-ENGINE.JS - v2.0
 * Full Fusion of: pantimeless-analytic.js + rti-engine.js + butterfly-commander-cth.js + field-commander.js
 * Powerful Engine for Stability Invariance, RTI Metrics, Butterfly Effect Detection, and Temporal Field Control.
 * This engine integrates pantemporal analysis, RTI predictive modeling, causal drift from micro-fluctuations,
 * and tri/penta/supraphasic field synthesis into a single, robust psychohistorical framework.
 * Includes Monte Carlo simulations (25k-50k), overall risk scoring, omega status, safety column recommendations,
 * and actionable narratives.
 * Inspired by Isaac Asimov's Psychohistory and Chaos Theory.
 * Author: Alejo Malia (2026) + Grok Fusion Layer
 */

export class CTHButterflyFieldEngine {
    constructor(data = {}) {
        // Core Metrics from RTI
        this.EVEI = data.event_valuation_structure || 80; // Comprehensive Eventual Valuation Structure
        this.CTH_Series = data.context_series || [0.65, 0.72, 0.81, 0.75, 0.68]; // Tetrasociohistorical Context series across phases
        this.Deltas = data.delta_series || [0.07, 0.09, -0.06, -0.07]; // Delta changes between phases

        // System Modulators from RTI
        this.PCN = data.black_swan_factor || 0.06;  // Percentage of Black Swans (irreducible noise)
        this.ICAP = data.adaptive_capacity || 1.0;  // Institutional Capacity
        this.FCGS = data.global_systemic_factor || 1.0; // Field Commander Global Systemic Factor

        // Event Mechanics from RTI
        this.Action = data.mechanics?.action || 0.45;
        this.Reaction = data.mechanics?.reaction || 0.35;
        this.Result = data.mechanics?.result || 0.20;

        // Butterfly Commander Options
        this.influenceClusters = data.clusters || 24; 
        this.greeks = {
            delta: 0.75, // Sensitivity to narrative change
            gamma: 0.15, // Acceleration in phase transitions
            lambda: 0.10 // RTI drag factor (historical inertia)
        };

        // Field Commander Data
        this.triphasic = data.triphasic || { before: { evei: 0.62, cth: 0.65 }, prelude: { evei: 0.71, cth: 0.72 }, during: { evei: 0.85, cth: 0.81 } };
        this.pentaphasic = data.pentaphasic || { models: [{ name: "Industrial Shift", cth_signature: 0.78 }] }; // Historical patterns
        this.supraphasic = data.supraphasic || { rtis: [{ power: 0.92, persistence: 0.85 }, { power: 0.78, persistence: 0.91 }] }; // Long-range RTIs

        // Pantimeless Threshold
        this.IP_THRESHOLD = 0.90; // Pantemporality threshold (Sigma <= 0.1)

        // Constants for Field Commander
        this.fieldConstants = {
            wBefore: 0.2, wPrelude: 0.3, wDuring: 0.5,  // Triphasic Weights
            alpha: 0.3, beta: 0.2, eta: 0.4  // PEE Modulators
        };

        // Simulation Parameters
        this.nSimDefault = 25000; // Default Monte Carlo simulations
    }

    // ================================================================
    // PANTIMELESS ANALYSIS SECTION (Stability Invariance)
    // ================================================================
    /**
     * Calculates the Pantemporality Index (IP) for a single variable across Before, Prelude, During phases.
     * @param {Array} values - [Value_Before, Value_Prelude, Value_During]
     */
    _calculateIP(values) {
        if (values.length !== 3) throw new Error("Exactly 3 phases required (Before, Prelude, During)");

        const mean = values.reduce((a, b) => a + b) / 3;
        
        // Standard Deviation (Sigma)
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 3;
        const sigma = Math.sqrt(variance);

        // Pantemporality Index (IP = 1 - Sigma)
        const ip = 1 - sigma;

        return {
            ip: parseFloat(ip.toFixed(4)),
            sigma: parseFloat(sigma.toFixed(4)),
            isPantemporal: ip >= this.IP_THRESHOLD,
            stabilityGrade: this._getStabilityGrade(ip)
        };
    }

    _getStabilityGrade(ip) {
        if (ip >= 0.98) return "ABSOLUTE_ANCHOR"; // Total invariant
        if (ip >= 0.90) return "STRUCTURAL_CONSTANT"; // Structural constant
        if (ip >= 0.75) return "TREND_INERTIA"; // Trend inertia
        return "VOLATILE_RHYTHM"; // Transient noise
    }

    /**
     * Analyzes multiple variables to identify the "Invariant Base" of the event.
     * @param {Object} dataset - Dictionary of variables and their values in 3 phases
     */
    _analyzeEventInvariance(dataset) {
        let results = {};
        let anchors = [];

        for (let variable in dataset) {
            const analysis = this._calculateIP(dataset[variable]);
            results[variable] = analysis;

            if (analysis.isPantemporal) {
                anchors.push({
                    name: variable,
                    strength: analysis.ip,
                    grade: analysis.stabilityGrade
                });
            }
        }

        // Global Pantemporality Coherence (GPC)
        const gpc = anchors.length / Object.keys(dataset).length;

        return {
            variable_analysis: results,
            strategic_anchors: anchors,
            global_pantemporal_coherence: gpc.toFixed(3),
            verdict: this._generateVerdict(gpc, anchors.length)
        };
    }

    _generateVerdict(gpc, anchorCount) {
        if (gpc > 0.7) return "SYSTEMIC_IMMUTABILITY"; // The event is shielded by history
        if (anchorCount > 0) return "ANCHORED_EVOLUTION"; // Changes exist, but on a solid base
        return "TOTAL_FLUIDITY"; // Nothing is stable; maximum chaos risk
    }

    // ================================================================
    // RTI ANALYSIS SECTION (Quantitative Historical Metrics)
    // ================================================================
    // IEC: Contextual Stability Index (Standard Deviation Analysis)
    _calculateIEC() {
        const mean = this.CTH_Series.reduce((a, b) => a + b) / this.CTH_Series.length;
        const variance = this.CTH_Series.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.CTH_Series.length;
        return 1 / (1 + Math.sqrt(variance));
    }

    // VVC: Contextual Variation Velocity (Magnitude of Change)
    _calculateVVC() {
        return this.Deltas.map(Math.abs).reduce((a, b) => a + b) / this.Deltas.length;
    }

    // MCE: Event Complexity Mechanics (Entropy of Action/Reaction/Result)
    _calculateMCE() {
        const total = this.Action + this.Reaction + this.Result;
        const p = [this.Action / total, this.Reaction / total, this.Result / total];
        const entropy = -p.reduce((acc, val) => acc + (val > 0 ? val * Math.log(val + 0.001) : 0), 0);
        return entropy / 1.1; // Normalized to CTH scale
    }

    // PPI: Potential Impact Projection (Normalized Interaction)
    _calculatePPI() {
        const normalizedEVEI = this.EVEI / 100;
        const currentCTH = this.CTH_Series[this.CTH_Series.length - 1] / 100;
        return Math.sqrt(normalizedEVEI * currentCTH);
    }

    // DIE: Exponential Influence Detector (The "Mule" Factor)
    _calculateDIE(relevance) {
        const threshold = 0.85;
        return relevance > threshold ? Math.exp(relevance * 0.4) : 1.0;
    }

    // RTI: Influence Traced Route (Causal Linkage Mapping)
    _generateRTI(constructors) {
        return constructors.map((c, i) => ({
            breadcrumb: i + 1,
            identity: c.id,
            impact: (c.evei * c.influence_factor).toFixed(2),
            context_environment: c.cth_at_event
        }));
    }

    // ================================================================
    // BUTTERFLY EFFECT SECTION (Causal Drift Detection)
    // ================================================================
    /**
     * Analyzes how a micro-perturbation (a tweet, rumor, data point)
     * alters the probability that the event follows its Pentaphasic course.
     */
    _analyzeCausalDrift(baseProbability, microFluctuations = [], nSim = 25000) {
        let drifts = [];

        for (let i = 0; i < nSim; i++) {
            let simulatedProb = baseProbability;

            microFluctuations.forEach(f => {
                // The "Flutter": Random impact based on fluctuation scale
                const ripple = (Math.random() - 0.5) * f.scale;
                
                // Apply Delta (Impact) and Gamma (Acceleration to critical mass)
                simulatedProb += ripple * this.greeks.delta;
                simulatedProb += Math.pow(ripple, 2) * this.greeks.gamma;
            });

            // Adjustment by Lambda: RTI inertia slows the deviation
            simulatedProb = (simulatedProb * (1 - this.greeks.lambda)) + (baseProbability * this.greeks.lambda);
            
            drifts.push(Math.max(0, Math.min(1, simulatedProb)));
        }

        drifts.sort((a, b) => a - b);
        const medianDrift = drifts[Math.floor(nSim / 2)];
        const volatility = drifts[Math.floor(nSim * 0.95)] - drifts[Math.floor(nSim * 0.05)];

        return {
            causal_certainty: (medianDrift * 100).toFixed(3) + "%",
            divergence_risk: (volatility * 100).toFixed(3) + "%",
            status: volatility > 0.08 ? "HIGH NARRATIVE VOLATILITY" : "STABLE TRAJECTORY"
        };
    }

    /**
     * Measures the "vibration" in a specific cluster before it becomes news.
     */
    _checkSomaticResonance(clusterID, eveiCurrent, eveiTarget) {
        const gap = Math.abs(eveiCurrent - eveiTarget);
        
        // If GAP is small but acceleration is high, there's a "Butterfly"
        const resonance = gap * this.greeks.gamma;
        
        return {
            cluster: clusterID,
            resonanceLevel: resonance.toFixed(5),
            actionRequired: resonance > 0.04 ? "RECALIBRATE PEE" : "IGNORE NOISE"
        };
    }

    // ================================================================
    // FIELD COMMANDER SECTION (Temporal Field Synthesis)
    // ================================================================
    // 1. TRIPHASIC CORE: The "Consulting" Layer
    _calculateTriphasicIndices() {
        const iEVEI = (this.triphasic.before.evei * this.fieldConstants.wBefore) + 
                      (this.triphasic.prelude.evei * this.fieldConstants.wPrelude) + 
                      (this.triphasic.during.evei * this.fieldConstants.wDuring);
        
        const iCTH = (this.triphasic.before.cth * this.fieldConstants.wBefore) + 
                     (this.triphasic.prelude.cth * this.fieldConstants.wPrelude) + 
                     (this.triphasic.during.cth * this.fieldConstants.wDuring);

        // IP: Index of Pantemporality (Stability across Before, Prelude, During)
        const vals = [this.triphasic.before.cth, this.triphasic.prelude.cth, this.triphasic.during.cth];
        const mean = vals.reduce((a, b) => a + b) / 3;
        const variance = vals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 3;
        const stdDev = Math.sqrt(variance);
        const IP = 1 - stdDev;

        return { iEVEI: iEVEI.toFixed(4), iCTH: iCTH.toFixed(4), IP: IP.toFixed(4) };
    }

    // 2. PENTAPHASIC VALIDATION: The "Database" Layer
    _validateStructuralMatch(currentTriCTH) {
        // Compares the current Triphasic CTH against Pentaphasic historical models
        const match = this.pentaphasic.models.find(m => Math.abs(m.cth_signature - currentTriCTH) < 0.1);
        return match ? match.name : "New Pattern Detected";
    }

    // 3. SUPRAPHASIC MODULATION: The "Macro" Layer
    _calculateSupraEcho() {
        // Sums long-range RTIs (Rutas Trazadas de Influencia)
        return this.supraphasic.rtis.reduce((acc, rti) => acc + (rti.power * rti.persistence), 0).toFixed(4);
    }

    // ================================================================
    // MAIN PROCESS - Full Engine Execution
    // ================================================================
    process(constructors = [], microFluctuations = []) {
        // Pantemporal Analysis
        const pantemporalDataset = { CTH: this.CTH_Series.slice(0,3), EVEI: [this.EVEI/100, this.EVEI/100 * 1.05, this.EVEI/100 * 0.95] }; // Example dataset
        const pantemporal = this._analyzeEventInvariance(pantemporalDataset);

        // RTI Metrics
        const iec = this._calculateIEC();
        const vvc = this._calculateVVC();
        const mce = this._calculateMCE();
        const ppi = this._calculatePPI();
        const die = this._calculateDIE(this.EVEI / 100);
        const rti = this._generateRTI(constructors || [{ id: "Constructor1", evei: 0.82, influence_factor: 1.2, cth_at_event: 0.75 }]);

        // Butterfly Effect
        const causalDrift = this._analyzeCausalDrift(this.EVEI / 100, microFluctuations, this.nSimDefault);
        const somaticResonance = this._checkSomaticResonance("Core_Segment", this.EVEI / 100, (this.EVEI / 100) + 0.05);

        // Field Commander
        const triphasic = this._calculateTriphasicIndices();
        const pentaphasicMatch = this._validateStructuralMatch(parseFloat(triphasic.iCTH));
        const supraEcho = this._calculateSupraEcho();

        // PEE Verdict from Field Commander
        const vBase = 0.5;
        const iCisne = this.PCN;
        const PEE = vBase + 
                    (this.fieldConstants.alpha * parseFloat(triphasic.iEVEI)) + 
                    (this.fieldConstants.beta * parseFloat(triphasic.iCTH)) + 
                    (this.fieldConstants.eta * iCisne) + 
                    (parseFloat(supraEcho) * 0.1);

        // Overall Risk Calculation (Monte Carlo for Risk Aggregation - 20k sims)
        const nSimRisk = 20000;
        let risks = [];
        for (let i = 0; i < nSimRisk; i++) {
            const noise = (Math.random() - 0.5) * this.PCN * 2;
            const simRisk = (1 - iec) * 0.25 + vvc * 0.20 + mce * 0.15 + (1 - ppi) * 0.20 + causalDrift.divergence_risk / 100 * 0.20 + noise;
            risks.push(Math.max(0, Math.min(1, simRisk)));
        }
        risks.sort((a, b) => a - b);
        const overallRisk = risks[Math.floor(nSimRisk / 2)].toFixed(4);

        // Omega Status and Recommendation
        const omegaStatus = parseFloat(overallRisk) > 0.65 ? "SINGULARITY CHAOS DETECTED" : "STABLE PSYCHOHISTORICAL FLOW";
        const recommendation = parseFloat(overallRisk) > 0.65 ? "ACTIVATE SAFETY COLUMN + HEDGE SCENARIOS" : "PROCEED WITH BASE PREDICTION";

        return {
            engine: "CTHButterflyFieldEngine v2.0",
            timestamp: Date.now(),
            pantemporalAnalysis: pantemporal,
            rtiMetrics: {
                IEC: iec.toFixed(3),
                VVC: vvc.toFixed(3),
                MCE: mce.toFixed(3),
                PPI: ppi.toFixed(3),
                DIE: die.toFixed(3),
                RTI: rti
            },
            butterflyEffect: {
                causalDrift: causalDrift,
                somaticResonance: somaticResonance
            },
            fieldCommander: {
                triphasicIndices: triphasic,
                pentaphasicValidation: pentaphasicMatch,
                supraEcho: supraEcho,
                PEEProjection: PEE.toFixed(4),
                verdict: PEE > 0.75 ? "CLIMAX DETECTED" : "EVOLUTIONARY PHASE"
            },
            overallRisk: parseFloat(overallRisk),
            omegaStatus,
            recommendation,
            globalNarrative: "The historical fabric has been analyzed. Stability anchors and chaos butterflies mapped. Trajectory secured."
        };
    }
}

export default CTHButterflyFieldEngine;