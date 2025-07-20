// fp-calculator-test.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

const { calculatePotentialFactors } = require('../fp-calculator'); // Adjust path if necessary

console.log("--- Starting FP Calculator Tests ---");

// --- Example Data for the Storming of the Bastille by phases ---

// PHASE: BEFORE (1779 - 1788)
const phaseBefore = {
    name: "BEFORE",
    humanFactors: [
        { name: "Louis XVI", EVEI: -0.6, CTH: +0.8 },
        { name: "Marie Antoinette", EVEI: -0.7, CTH: +0.7 },
        { name: "Enlightenment Intellectuals (Voltaire, Rousseau)", EVEI: +0.8, CTH: -0.9 },
        { name: "Privileged Nobles", EVEI: -0.4, CTH: +0.9 }
    ],
    eventFactors: [
        { name: "Economic crisis and famines", EVEI: -0.9, CTH: -0.3 },
        { name: "American Revolutionary War", EVEI: +0.6, CTH: -0.6 },
        { name: "Convocations and suspensions of the Estates-General", EVEI: -0.5, CTH: -0.1 }
    ]
};

// PHASE: PRELUDE (1787 - June 1789)
const phasePrelude = {
    name: "PRELUDE",
    humanFactors: [
        { name: "Radical Orators in the National Assembly (Mirabeau)", EVEI: +0.7, CTH: -0.8 },
        { name: "Members of the Third Estate", EVEI: +0.6, CTH: -0.5 },
        { name: "Army sectors sympathetic to the people", EVEI: +0.3, CTH: -0.2 }
    ],
    eventFactors: [
        { name: "Tennis Court Oath", EVEI: +0.8, CTH: -0.7 },
        { name: "Popular mobilization in Paris", EVEI: +0.7, CTH: -0.6 },
        { name: "Dismissal of popular ministers (Necker)", EVEI: -0.6, CTH: -0.3 }
    ]
};

// PHASE: DURING (July 14, 1789)
const phaseDuring = {
    name: "DURING",
    humanFactors: [
        { name: "Mob assaulting the Bastille", EVEI: +0.9, CTH: -0.9 },
        { name: "Bastille Guard", EVEI: -0.8, CTH: +0.7 },
        { name: "Leaders of the mob", EVEI: +0.7, CTH: -0.8 }
    ],
    eventFactors: [
        { name: "Assault on Les Invalides for weapons", EVEI: +0.7, CTH: -0.6 },
        { name: "Failed negotiations with the Governor of the Bastille", EVEI: -0.4, CTH: -0.1 },
        { name: "Storming of the Bastille and its immediate consequences", EVEI: +0.9, CTH: -0.9 }
    ]
};

// PHASE: TRANSITION (July 15, 1789 - 1791)
const phaseTransition = {
    name: "TRANSITION",
    humanFactors: [
        { name: "Bourgeoisie leading the National Constituent Assembly", EVEI: +0.5, CTH: -0.3 },
        { name: "King Louis XVI accepting the tricolor cockade", EVEI: -0.3, CTH: -0.1 },
        { name: "Radical sectors calling for more changes", EVEI: +0.6, CTH: -0.7 }
    ],
    eventFactors: [
        { name: "Creation of the National Guard", EVEI: +0.7, CTH: -0.5 },
        { name: "Declaration of the Rights of Man and of the Citizen", EVEI: +0.9, CTH: -0.9 },
        { name: "March on Versailles", EVEI: +0.8, CTH: -0.7 }
    ]
};

// PHASE: AFTER (1792 - 1802)
const phaseAfter = {
    name: "AFTER",
    humanFactors: [
        { name: "Radical revolutionary leaders (Robespierre)", EVEI: -0.9, CTH: -0.9 },
        { name: "European monarchs reacting", EVEI: -0.7, CTH: +0.6 },
        { name: "Napoleon Bonaparte (emerging)", EVEI: +0.8, CTH: -0.4 }
    ],
    eventFactors: [
        { name: "Declaration of war on Austria", EVEI: -0.8, CTH: -0.6 },
        { name: "The Terror", EVEI: -0.9, CTH: -0.9 },
        { name: "Rise of Napoleon", EVEI: +0.7, CTH: -0.5 }
    ]
};

// --- Helper function to run and display results for a phase ---
function runPhaseAnalysis(phaseData, expectedEVEI, expectedCTH) {
    console.log(`\n--- Analyzing Phase: ${phaseData.name} ---`);
    try {
        const results = calculatePotentialFactors(phaseData);

        // Display Human Factors
        if (phaseData.humanFactors.length > 0) {
            console.log("  --- Human Factors ---");
            phaseData.humanFactors.forEach(factor => {
                console.log(`    ${factor.name}: EVEI: ${factor.EVEI.toFixed(1)}, CTH: ${factor.CTH.toFixed(1)}`);
            });
        }

        // Display Event Factors
        if (phaseData.eventFactors.length > 0) {
            console.log("  --- Event Factors ---");
            phaseData.eventFactors.forEach(factor => {
                console.log(`    ${factor.name}: EVEI: ${factor.EVEI.toFixed(1)}, CTH: ${factor.CTH.toFixed(1)}`);
            });
        }

        console.log(`\n  FP_EVEI_${phaseData.name}: ${results.FP_EVEI.toFixed(2)}`);
        console.log(`  FP_CTH_${phaseData.name}: ${results.FP_CTH.toFixed(2)}`);

        // Assertions (kept for testing logic, but success message removed from console output)
        let passed = true;
        if (Math.abs(results.FP_EVEI - expectedEVEI) > 0.001) {
            console.log(`  EVEI Mismatch: Expected ${expectedEVEI.toFixed(2)}, Got ${results.FP_EVEI.toFixed(2)}`);
            passed = false;
        }
        if (Math.abs(results.FP_CTH - expectedCTH) > 0.001) {
            console.log(`  CTH Mismatch: Expected ${expectedCTH.toFixed(2)}, Got ${results.FP_CTH.toFixed(2)}`);
            passed = false;
        }

        // Only log failure, not success
        if (!passed) {
            console.log(`  Test FAILED for ${phaseData.name}.`);
        }

    } catch (error) {
        console.error(`  An error occurred during analysis for ${phaseData.name}:`, error.message);
    }
}

// --- Run analysis for each phase ---

// PHASE: BEFORE
runPhaseAnalysis(phaseBefore, -1.7, 0.5); 

// PHASE: PRELUDE 
runPhaseAnalysis(phasePrelude, 2.5, -3.1);

// PHASE: DURING
runPhaseAnalysis(phaseDuring, 2.0, -2.6);

// PHASE: TRANSITION 
runPhaseAnalysis(phaseTransition, 3.2, -3.2);

// PHASE: AFTER
runPhaseAnalysis(phaseAfter, -1.8, -2.7);

console.log("\n--- All FP Calculator Tests Complete ---");