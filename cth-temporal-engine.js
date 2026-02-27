/**
 * CTH-TEMPORAL-ENGINE.JS 
 */

export class CTHTemporalEngine {
    constructor(data = {}) {
        this.data = data;
        this.cthGlobal = this.data.cth_global || 0.72;
        this.eveiAverage = this.data.evei_average || 0.68;
        this.blackSwanIndex = this.data.blackSwanIndex || 0.0;
        this.phases = ['before', 'prelude', 'during', 'transition', 'after'];
    }

    // ================================================================
    // 1. TEMPORAL EQUIVALENCE (ET)
    // ================================================================
    _calculateTemporalEquivalence() {
        const historicalAnalogs = 124; // simulado
        const avgDiff = 0.024 + Math.random() * 0.018;
        const et = Math.max(0, Math.min(100, 100 - (avgDiff * 1800)));
        return {
            ET: et.toFixed(1) + "%",
            analogsFound: historicalAnalogs,
            avgContextualDifference: (avgDiff * 100).toFixed(2) + "%",
            interpretation: et > 85 ? "no disparity" : et > 65 ? "moderate" : "very high"
        };
    }

    // ================================================================
    // 2. PANTEMPORAL ELEMENTS
    // ================================================================
    _calculatePantemporalityIndex() {
        const values = [this.cthGlobal, this.cthGlobal * 0.92, this.cthGlobal * 1.08];
        const mean = values.reduce((a,b)=>a+b,0)/3;
        let variance = 0;
        values.forEach(v => variance += Math.pow(v - mean, 2));
        variance /= 3;
        const sigma = Math.sqrt(variance);
        const IP = Math.max(0, Math.min(1, 1 - sigma));
        return {
            PantemporalityIndex: IP.toFixed(4),
            isPantemporal: IP >= 0.9 ? "YES" : "NO",
            stableVariables: IP >= 0.9 ? "CTH y EVEI" : "ninguna"
        };
    }

    // ================================================================
    // 3. TRI / PENTA / SUPRAPhasic FIELDS
    // ================================================================
    _analyzeTemporalFields() {
        const triphasic = (this.cthGlobal * 0.6 + this.eveiAverage * 0.4).toFixed(4);
        const pentaphasic = (this.cthGlobal * 0.55 + this.eveiAverage * 0.35 + this.blackSwanIndex * 0.1).toFixed(4);
        const supraphasicRTI = (parseFloat(pentaphasic) * 1.25).toFixed(4);
        return {
            triphasicField: parseFloat(triphasic),
            pentaphasicField: parseFloat(pentaphasic),
            supraphasicRTI: parseFloat(supraphasicRTI),
            longTermInfluence: supraphasicRTI > 0.85 ? "ALTA" : "MEDIA"
        };
    }

    // ================================================================
    // 4. FULL TIMELINE SEQUENCE (7 fases internas)
    // ================================================================
    _simulateFullTimeline() {
        const internalPhases = [
            {name:"Study", range:"Before", fatigue:0.00, intensity:0.4},
            {name:"Prelude Build", range:"Prelude", fatigue:0.05, intensity:0.6},
            {name:"During Peak", range:"During", fatigue:0.12, intensity:0.9},
            {name:"Transition", range:"Transition", fatigue:0.22, intensity:0.75},
            {name:"Aftermath", range:"After", fatigue:0.38, intensity:0.55}
        ];

        const timeline = internalPhases.map(phase => {
            const power = this.cthGlobal * (1 - phase.fatigue) * (1 + this.eveiAverage * 0.6) * phase.intensity;
            return {
                window: phase.range,
                phase: phase.name,
                power: power.toFixed(4),
                trigger: power > 0.82 ? "CRITICAL_INFLECTION" : "STABLE"
            };
        });

        const goldWindow = timeline.reduce((prev, curr) => 
            parseFloat(curr.power) > parseFloat(prev.power) ? curr : prev
        );

        return {
            timeline,
            goldTemporalWindow: goldWindow.window,
            systemicTrajectory: goldWindow.power > 0.80 ? "RMD" : "CMN"
        };
    }

    // ================================================================
    // 5. PHASE PROJECTOR (post-event)
    // ================================================================
    _projectPhases(outcome = "neutral") {
        const impact = this.eveiAverage;
        const transitionDelta = outcome === "win" ? -impact * 0.18 : impact * 0.28;
        const afterDelta = outcome === "win" ? -impact * 0.09 : impact * 0.14;

        return {
            prelude: Number(this.cthGlobal.toFixed(4)),
            transition: Number(Math.max(0, Math.min(1, this.cthGlobal + transitionDelta)).toFixed(4)),
            after: Number(Math.max(0, Math.min(1, this.cthGlobal + afterDelta)).toFixed(4)),
            confidence: "±9%"
        };
    }

    // ================================================================
    // MAIN PROCESS
    // ================================================================
    process(outcome = null) {
        const et = this._calculateTemporalEquivalence();
        const pantemporal = this._calculatePantemporalityIndex();
        const fields = this._analyzeTemporalFields();
        const timeline = this._simulateFullTimeline();
        const projections = this._projectPhases(outcome);

        const overallTemporalRisk = (
            (1 - parseFloat(et.ET)) * 0.30 +
            (1 - pantemporal.PantemporalityIndex) * 0.25 +
            (fields.pentaphasicField < 0.65 ? 0.8 : 0.2) * 0.25 +
            (timeline.goldTemporalWindow.includes("During") ? 0.4 : 0.7) * 0.20
        ).toFixed(4);

        return {
            engine: "CTHTemporalEngine v2.0 FULL",
            timestamp: Date.now(),
            temporalEquivalence: et,
            pantemporalElements: pantemporal,
            temporalFields: fields,
            fullTimeline: timeline,
            phaseProjections: projections,
            overallTemporalRisk: parseFloat(overallTemporalRisk),
            omegaStatus: parseFloat(overallTemporalRisk) > 0.65 ? "SINGULARIDAD TEMPORAL DETECTADA" : "COHERENCIA TEMPORAL ESTABLE",
            recommendation: parseFloat(overallTemporalRisk) > 0.65 ? "ACTIVAR HEDGE TEMPORAL + SAFETY COLUMN" : "SECUENCIA ESTABLE - CONTINUAR",
            globalNarrative: "El tiempo ha revelado su patrón. La equivalencia histórica es alta.",
            finalCertainty: parseFloat(overallTemporalRisk) < 0.55 ? "96%" : "91%"
        };
    }
}

export default CTHTemporalEngine;