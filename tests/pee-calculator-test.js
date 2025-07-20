// pee-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { projectEventualSpectrum } = require('../pee-calculator'); // Adjust path if necessary

console.log("--- Starting PEE Calculator Tests ---");

// --- 1. Example Predictive Factors (Inputs) ---

// Example Constructors active in the 'Current State' / 'Antes' phase
const activeConstructorsExample = [
    { name: "Popular Dissatisfaction", type: "FE", EVEI: -0.7, CTH: 0.6 },
    { name: "Political Leader X", type: "FH", EVEI: 0.5, CTH: 0.7 },
];

const predictiveFactors1 = {
    currentCTH: 0.4,
    deltaCTH: 0.1, // Slight increase in tension
    IPD: 0.6,      // Moderate disruption potential
    VRS: 0.3,      // Low resilience
    actMagnitudeDegree: 0.7, // Current act has moderate magnitude
    activeConstructors: activeConstructorsExample,
    historicalAnalogues: [
        { name: "1917 Russian Revolution", pattern_CTH_delta: 0.2, pattern_IPD_effect: 0.8 },
        { name: "1848 Revolutions", pattern_CTH_delta: 0.1, pattern_IPD_effect: 0.6 }
    ],
    activeRTIs: ["Economic inequality", "Technological disruption"]
};

const predictiveFactors2_HighVRS = {
    currentCTH: 0.3,
    deltaCTH: 0.05, // Slight increase
    IPD: 0.2,      // Low disruption potential
    VRS: 0.8,      // High resilience
    actMagnitudeDegree: 0.3, // Low magnitude
    activeConstructors: activeConstructorsExample,
    historicalAnalogues: [],
    activeRTIs: []
};

// --- 2. Test Cases ---

console.log("\n--- Test 1: Projecting from 'Antes' phase (Moderate Disruption) ---");
const peeResult1 = projectEventualSpectrum('Antes', predictiveFactors1);
console.log(`  Number of trajectories: ${peeResult1.length}`);
peeResult1.forEach(traj => {
    console.log(`    Trajectory ID: ${traj.id}`);
    console.log(`      Description: ${traj.description}`);
    console.log(`      Probability: ${traj.estimatedProbability.toFixed(3)}`);
    console.log(`      Req. Magnitude: ${traj.requiredMagnitude.toFixed(2)}`);
    console.log(`      Projected Phases (${traj.projectedPhases.length}):`);
    traj.projectedPhases.forEach(p => {
        console.log(`        - ${p.name}: CTH=${p.projectedCTH.toFixed(2)}, EVEI=${p.projectedEVEI.toFixed(2)}`);
    });
    if (traj.influencedByAnalogues.length > 0) {
        console.log(`      Influenced by Analogues: ${traj.influencedByAnalogues.join(', ')}`);
    }
});

console.log("\n--- Test 2: Projecting from 'Durante' phase (High Resilience) ---");
const peeResult2 = projectEventualSpectrum('Durante', predictiveFactors2_HighVRS);
console.log(`  Number of trajectories: ${peeResult2.length}`);
peeResult2.forEach(traj => {
    console.log(`    Trajectory ID: ${traj.id}`);
    console.log(`      Description: ${traj.description}`);
    console.log(`      Probability: ${traj.estimatedProbability.toFixed(3)}`);
    console.log(`      Req. Magnitude: ${traj.requiredMagnitude.toFixed(2)}`);
    console.log(`      Projected Phases (${traj.projectedPhases.length}):`);
    traj.projectedPhases.forEach(p => {
        console.log(`        - ${p.name}: CTH=${p.projectedCTH.toFixed(2)}, EVEI=${p.projectedEVEI.toFixed(2)}`);
    });
    if (traj.influencedByAnalogues.length > 0) {
        console.log(`      Influenced by Analogues: ${traj.influencedByAnalogues.join(', ')}`);
    }
});

console.log("\n--- All PEE Calculator Tests Complete ---");