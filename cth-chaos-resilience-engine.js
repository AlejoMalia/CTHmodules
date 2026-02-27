/**
 * CTH-CHAOS-RESILIENCE-ENGINE.JS 
 */

export class CTHChaosResilienceEngine {
    constructor(data = {}) {
        this.data = data;
        this.cthGlobal = this.data.cth_global || 0.72;
        this.eveiAverage = this.data.evei_average || 0.68;
        this.blackSwanIndex = this.data.blackSwanIndex || 0.0;
        this.deltaCTH = this.data.deltaCTH || 0.0;
        this.phasesCTH = this.data.phasesCTH || { before: 0.65, during: 0.81, after: 0.58 };
    }

    // ================================================================
    // 1. SHANNON ENTROPY + EXPONENTIAL RESONANCE (Seldon Engine)
    // ================================================================
    _calculateShannonEntropy() {
        const dimensions = [this.cthGlobal * 0.9, this.cthGlobal * 1.1, this.eveiAverage, this.blackSwanIndex];
        const sum = dimensions.reduce((a,b)=>a+b,0);
        let entropy = 0;
        dimensions.forEach(p => {
            const prob = p / sum;
            if (prob > 0) entropy -= prob * Math.log2(prob);
        });
        return Number(entropy.toFixed(4));
    }

    _detectExponentialResonance() {
        const entropy = this._calculateShannonEntropy();
        const fatigue = this._calculateSocietalFatigue();
        const resonance = entropy * (1 + fatigue * 1.45);
        return {
            entropy,
            exponentialResonance: resonance.toFixed(4),
            weakestNode: resonance > 2.8 ? "POLITICS" : resonance > 2.2 ? "ECONOMY" : "SOCIETY"
        };
    }

    // ================================================================
    // 2. ERI - CIVILIZATIONAL RESILIENCE INDEX
    // ================================================================
    _calculateERI() {
        const shock = Math.abs(this.phasesCTH.during - this.phasesCTH.before);
        const recoverySpeed = this.phasesCTH.after - this.phasesCTH.during;
        const eri = Math.max(0, Math.min(1, 0.55 + recoverySpeed * 1.8 - shock * 0.9));
        return {
            ERI: eri.toFixed(4),
            shockMagnitude: shock.toFixed(4),
            recoverySpeed: recoverySpeed.toFixed(4),
            verdict: eri > 0.75 ? "STRONG RECOVERY" : eri > 0.45 ? "FRÁGIL" : "COLLAPSE RISK"
        };
    }

    // ================================================================
    // 3. BLINDSPOTS + DARK POOLS
    // ================================================================
    _detectBlindSpots() {
        const externalFactors = this.data.externalFactors || { climate: 0.22, media: 0.18, corruption: 0.31 };
        let blindspotScore = 0;
        Object.values(externalFactors).forEach(v => blindspotScore += v);
        blindspotScore /= Object.keys(externalFactors).length;
        return {
            blindspotScore: blindspotScore.toFixed(4),
            recommendedAdjustment: (blindspotScore * -0.12).toFixed(4),
            alert: blindspotScore > 0.28 ? "EXTERNAL DISTORTIONS DETECTED" : "BLINDSPOTS CONTROLADOS"
        };
    }

    // ================================================================
    // 4. POLARIZATION INTENSITY + SOCIETAL FATIGUE
    // ================================================================
    _applyPolarizationIntensity() {
        const rivalryDelta = Math.abs(this.phasesCTH.during - this.phasesCTH.before);
        const polarization = Math.min(1, rivalryDelta * 2.4 + this.blackSwanIndex * 1.1);
        return {
            polarizationMultiplier: polarization.toFixed(4),
            volatilityAmplified: (polarization * 100).toFixed(1) + "%"
        };
    }

    _calculateSocietalFatigue() {
        const seq = [this.phasesCTH.before, this.phasesCTH.prelude || 0.68, this.phasesCTH.during];
        let fatigue = 0;
        for (let i = 1; i < seq.length; i++) {
            fatigue += (seq[i-1] - seq[i]) * (i * 1.35);
        }
        return Math.max(0, Math.min(1, fatigue));
    }

    // ================================================================
    // 5. ANTI-VALLEY + IRREDUCIBLE NOISE (6%)
    // ================================================================
    _detectValleyAndReversion() {
        const meanCTH = Object.values(this.phasesCTH).reduce((a,b)=>a+b,0) / Object.keys(this.phasesCTH).length;
        const valley = this.phasesCTH.during < meanCTH * 0.72;
        const reversion = valley ? meanCTH * 1.22 : meanCTH * 0.95;
        return {
            isValley: valley,
            predictedReversion: reversion.toFixed(4),
            confidence: valley ? "82%" : "94%"
        };
    }

    _applyIrreducibleNoise() {
        const noise = 0.06 * (Math.random() - 0.5) * 2;
        const adjustedEVEI = Math.max(0, Math.min(1, this.eveiAverage + noise));
        return {
            noiseAdjustedEVEI: adjustedEVEI.toFixed(4),
            hedgingRecommendation: noise > 0.04 ? "ACTIVAR SAFETY COLUMN" : "NO HEDGE NEEDED"
        };
    }

    // ================================================================
    // 6. BIVARIATE INTERACTION ENGINE
    // ================================================================
    _analyzeBivariate(d1 = "Economy", d2 = "Politics") {
        const rho = 0.68 + Math.random() * 0.24;
        const interaction = this.cthGlobal * this.eveiAverage * rho * 1.35;
        return {
            dimensions: `${d1} × ${d2}`,
            interactionScore: interaction.toFixed(4),
            phenomenon: interaction > 0.82 ? "REVOLUTION / RENAISSANCE" : "STABLE"
        };
    }

    // ================================================================
    // MAIN PROCESS
    // ================================================================
    async process() {
        const entropyRes = this._detectExponentialResonance();
        const eri = this._calculateERI();
        const blindspots = this._detectBlindSpots();
        const polarization = this._applyPolarizationIntensity();
        const fatigue = this._calculateSocietalFatigue();
        const valley = this._detectValleyAndReversion();
        const noise = this._applyIrreducibleNoise();
        const bivariate = this._analyzeBivariate();

        const overallChaosShieldRisk = (
            entropyRes.exponentialResonance * 0.30 +
            (1 - parseFloat(eri.ERI)) * 0.25 +
            parseFloat(blindspots.blindspotScore) * 0.20 +
            polarization.polarizationMultiplier * 0.15 +
            fatigue * 0.10
        ).toFixed(4);

        return {
            engine: "CTHChaosResilienceEngine v2.0 FULL",
            timestamp: Date.now(),
            shannonEntropy: entropyRes,
            eriResilience: eri,
            blindspots: blindspots,
            polarization: polarization,
            societalFatigue: fatigue.toFixed(4),
            valleyReversion: valley,
            irreducibleNoise: noise,
            bivariateInteraction: bivariate,
            overallChaosShieldRisk: parseFloat(overallChaosShieldRisk),
            omegaStatus: parseFloat(overallChaosShieldRisk) > 0.68 ? "EXPONENTIAL RESONANCE CRÍTICA - SINGULARIDAD CAÓTICA" : "RESILIENCIA ACTIVA",
            counterFrequencyNeeded: parseFloat(overallChaosShieldRisk) > 0.68 ? "1.42 Hz" : "0.00 Hz",
            alert: parseFloat(overallChaosShieldRisk) > 0.68 ? "ACTIVAR PROTOCOLO SELDON" : "SISTEMA ESTABLE",
            globalNarrative: "El caos ha sido medido. La resiliencia civilizatoria está calibrada.",
            recommendation: parseFloat(overallChaosShieldRisk) > 0.65 ? "ACTIVAR SAFETY COLUMN + HEDGE TOTAL" : "MONITOREO NORMAL"
        };
    }
}

export default CTHChaosResilienceEngine;