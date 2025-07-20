// constructor.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * @file constructor.js
 * @description Defines the Constructor class, a fundamental structural unit
 * in the tetrasociohistorical analysis.
 *
 * This module exports the Constructor class.
 * Calculations for EVEI, CTH, intra-phase correlations, and Potential Factor (FP)
 * are expected to be handled by other dedicated modules (e.g., evei-calculator.js,
 * cth-analysis-module.js, evei-cth-extended-analysis.js).
 */

/**
 * Represents a structural unit (historical figure or historical event)
 * in the tetrasociohistorical analysis.
 */
class Constructor {
    /**
     * Initializes a Constructor.
     *
     * Note: EVEI and CTH values are provided directly during instantiation.
     * In a real application, these might be calculated using functions from
     * `evei-calculator.js` and `cth-analysis-module.js` prior to creating
     * a Constructor instance.
     *
     * @param {string} name - Name of the Constructor (e.g., 'Robespierre', 'Storming of the Bastille').
     * @param {string} constructorType - Type of Constructor ('FH' for Human Factor, 'FE' for Eventual Factor).
     * @param {number} evei - Integrated Eventual Emotional Impact (0 to 1).
     * @param {number} cth - Historical Thematic Coherence (0 to 1).
     * @param {string} phase - Temporal phase ('Before', 'Prelude', 'During', 'Transition', 'After').
     * @param {Object<string, number>} [attributes={}] - Specific FH or FE attributes.
     * E.g., for FH {'leadership': 0.8}, for FE {'scale': 0.7, 'duration': 0.1}.
     */
    constructor(name, constructorType, evei, cth, phase, attributes = {}) {
        if (!(evei >= 0 && evei <= 1 && cth >= 0 && cth <= 1)) {
            throw new Error("EVEI and CTH must be in the range of 0 to 1.");
        }
        if (!['FH', 'FE'].includes(constructorType)) {
            throw new Error("Constructor type must be 'FH' or 'FE'.");
        }
        const validPhases = ['Before', 'Prelude', 'During', 'Transition', 'After'];
        if (!validPhases.includes(phase)) {
            throw new Error(`The phase must be one of ${validPhases.join(', ')}.`);
        }

        this.name = name;
        this.constructorType = constructorType;
        this.evei = evei;
        this.cth = cth;
        this.phase = phase;
        this.attributes = attributes;
        this.phaseNumeric = this._getPhaseNumeric(phase); // Numeric representation of the phase
    }

    /**
     * Converts the phase name to a numeric indicator.
     * @param {string} phase - The phase name.
     * @returns {number} The numeric indicator for the phase.
     * @private
     */
    _getPhaseNumeric(phase) {
        const phaseMap = {
            'Before': 1,
            'Prelude': 2,
            'During': 3,
            'Transition': 4,
            'After': 5
        };
        return phaseMap[phase];
    }

    /**
     * Generates the numeric embedding of the Constructor.
     * [EVEI, CTH, FH/FE_attributes (flattened), Numeric_Phase]
     * @returns {number[]} The embedding vector.
     */
    generateEmbedding() {
        let embedding = [this.evei, this.cth];
        // Add FH/FE attributes. For simplicity, assume attributes are numeric.
        for (const key in this.attributes) {
            if (typeof this.attributes[key] === 'number') {
                embedding.push(this.attributes[key]);
            }
        }
        embedding.push(this.phaseNumeric);
        return embedding;
    }

    /**
     * Provides a string representation of the Constructor instance.
     * @returns {string}
     */
    toString() {
        return `Constructor(name='${this.name}', type='${this.constructorType}', EVEI=${this.evei}, CTH=${this.cth}, phase='${this.phase}')`;
    }
}

// Export the Constructor class for use in other modules
module.exports = {
    Constructor
};