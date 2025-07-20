// cth-analysis-module.js
// Seldon - Alejo Malia - 2025.
// License: "CC-BY-NC-SA-4.0".

/**
 * This JavaScript module, `cth-analysis-module.js`, is engineered to conduct a **Tetrasociohistorical Context (CTH) analysis** of an event.
 * It quantitatively assesses the sociohistorical context across distinct temporal phases—specifically, *before*, *prelude*, *during*, *transition*, and *after* a pivotal event—by leveraging a suite of diverse historical indicators.
 * A significant advancement within this module is its innovative methodology for **inferring missing historical data**, which operates by analyzing CTH trends in conjunction with predefined historical epoch references.
 * The module normalizes these indicators to a uniform scale (0-1), grouping them into four dimensions: Historical Epoch, Social Range, Age Range, and Population Range.
 * The final CTH score, a weighted aggregate of these normalized dimensions, provides a comprehensive numerical representation (0-1) of the prevailing sociohistorical context, thereby offering a robust tool for quantitative historical analysis, data gap management, and the study of temporal sociohistorical dynamics.
 */

// --- CONFIGURATION AND REFERENCE DATA ---

/**
 * Default weights for CTH dimensions.
 * These weights determine the relative importance of each dimension in the overall CTH score.
 */
const DEFAULT_CTH_WEIGHTS = {
    w_e: 0.4, // Historical Epoch (e.g., GDP, Gini, Political Events)
    w_s: 0.3, // Social Range (e.g., Average Income, Literacy Rate)
    w_a: 0.15, // Age Range (e.g., Life Expectancy, Birth Rate)
    w_p: 0.15, // Population Range (e.g., Population Density, Urbanization Rate)
};

/**
 * Limits for indicator normalization and validation.
 * These define the expected minimum and maximum values for each indicator
 * to normalize them to a 0-1 scale. Values outside these limits will be clamped.
 */
const INDICATOR_LIMITS = {
    gdpPerCapita: { min: 500, max: 30000 },
    giniIndex: { min: 0.2, max: 0.7 },
    politicalEventsCount: { min: 0, max: 15 }, // Events per year/period
    averageIncome: { min: 100, max: 15000 },
    literacyRate: { min: 0.05, max: 1 }, // 5% to 100%
    lifeExpectancy: { min: 25, max: 85 },
    birthRate: { min: 0.005, max: 0.06 }, // 0.5% to 6%
    populationDensity: { min: 1, max: 2000 },
    urbanizationRate: { min: 0.05, max: 1 }, // 5% to 100%
};

/**
 * Approximate data sets for each predefined historical epoch.
 * These serve as reference data for inferring missing indicators when no other data is available.
 * Values are examples and can be adjusted according to the desired granularity and historical accuracy of your theory.
 */
const EPOCH_DATA_REFERENCE = {
    'antiquity': {
        startYear: -3000, endYear: 500,
        gdpPerCapita: 700, giniIndex: 0.6, politicalEventsCount: 5,
        averageIncome: 100, literacyRate: 0.1, lifeExpectancy: 30, birthRate: 0.04,
        populationDensity: 5, urbanizationRate: 0.1,
    },
    'middleAges': {
        startYear: 501, endYear: 1500,
        gdpPerCapita: 900, giniIndex: 0.55, politicalEventsCount: 7,
        averageIncome: 200, literacyRate: 0.15, lifeExpectancy: 35, birthRate: 0.035,
        populationDensity: 10, urbanizationRate: 0.15,
    },
    'earlyModern': {
        startYear: 1501, endYear: 1800,
        gdpPerCapita: 1500, giniIndex: 0.5, politicalEventsCount: 8,
        averageIncome: 300, literacyRate: 0.25, lifeExpectancy: 40, birthRate: 0.03,
        populationDensity: 20, urbanizationRate: 0.25,
    },
    'industrialRevolution': {
        startYear: 1801, endYear: 1900,
        gdpPerCapita: 3000, giniIndex: 0.48, politicalEventsCount: 10,
        averageIncome: 600, literacyRate: 0.4, lifeExpectancy: 45, birthRate: 0.025,
        populationDensity: 50, urbanizationRate: 0.4,
    },
    '20thCenturyEarly': {
        startYear: 1901, endYear: 1950,
        gdpPerCapita: 7000, giniIndex: 0.45, politicalEventsCount: 12,
        averageIncome: 1500, literacyRate: 0.7, lifeExpectancy: 55, birthRate: 0.02,
        populationDensity: 100, urbanizationRate: 0.6,
    },
    '20thCenturyLate': {
        startYear: 1951, endYear: 2000,
        gdpPerCapita: 15000, giniIndex: 0.4, politicalEventsCount: 10,
        averageIncome: 4000, literacyRate: 0.85, lifeExpectancy: 70, birthRate: 0.015,
        populationDensity: 200, urbanizationRate: 0.75,
    },
    'contemporary': {
        startYear: 2001, endYear: 2025,
        gdpPerCapita: 25000, giniIndex: 0.35, politicalEventsCount: 8,
        averageIncome: 8000, literacyRate: 0.95, lifeExpectancy: 78, birthRate: 0.01,
        populationDensity: 300, urbanizationRate: 0.85,
    },
};

// --- HELPER FUNCTIONS ---

/**
 * Normalizes an indicator to a 0 to 1 range based on predefined limits.
 * If the value is null or undefined, returns 0 (does not contribute to the normalized sum).
 * Values outside the min/max range are clamped.
 * @param {number | undefined | null} value - Indicator value.
 * @param {number} min - Expected minimum value for the indicator.
 * @param {number} max - Expected maximum value for the indicator.
 * @returns {number} Normalized value between 0 and 1.
 */
function normalizeIndicator(value, min, max) {
    if (value === undefined || value === null || typeof value !== 'number' || isNaN(value)) {
        // console.warn(`Warning: Invalid or missing indicator value (${value}). Normalizing to 0.`);
        return 0; // Invalid or missing values are treated as 0 for normalization purposes
    }
    const clampedValue = Math.max(min, Math.min(max, value));
    // Avoid division by zero if min === max (though unlikely with these limits)
    if (max - min === 0) return 0;
    return (clampedValue - min) / (max - min);
}

/**
 * Applies predefined limits to an inferred indicator value to maintain reasonableness.
 * This is crucial after inference to ensure values are within expected real-world bounds.
 * @param {string} indicatorName - Name of the indicator (to get predefined limits).
 * @param {number} value - Value to limit.
 * @returns {number} Value adjusted within its predefined limits.
 */
function applyLimits(indicatorName, value) {
    const limits = INDICATOR_LIMITS[indicatorName];
    if (limits && typeof value === 'number' && !isNaN(value)) {
        return Math.max(limits.min, Math.min(limits.max, value));
    }
    // If limits not found or value is invalid, return original value or a default
    // console.warn(`Warning: No limits defined for ${indicatorName} or invalid value (${value}). Returning original value.`);
    return value; // Return original if no limits or value is invalid
}

/**
 * Gets reference epoch data closest to a given year.
 * Used for initial filling of missing historical data.
 * @param {number} year - The year for which epoch data is sought.
 * @returns {object} The reference indicators for the epoch or default values if no matching epoch is found.
 */
function getEpochDataForYear(year) {
    for (const key in EPOCH_DATA_REFERENCE) {
        const epoch = EPOCH_DATA_REFERENCE[key];
        if (year >= epoch.startYear && year <= epoch.endYear) {
            const { startYear, endYear, ...indicators } = epoch; // Exclude startYear/endYear from indicators
            return indicators;
        }
    }
    // Fallback if year doesn't fit any defined epoch
    // console.warn(`Warning: Year ${year} does not fit any defined epoch. Using fallback default data.`);
    return {
        gdpPerCapita: 10000,
        giniIndex: 0.45,
        politicalEventsCount: 8,
        averageIncome: 3000,
        literacyRate: 0.7,
        lifeExpectancy: 60,
        birthRate: 0.02,
        populationDensity: 100,
        urbanizationRate: 0.5,
    };
}

/**
 * Calculates the Tetrasociohistorical Context (CTH) for a set of indicators.
 * Includes normalization logic and dynamic weight adjustment based on available indicators.
 * @param {object} indicators - Historical indicators for a period.
 * @param {object} [customWeights] - Optional: custom weights for dimensions (w_e, w_s, w_a, w_p).
 * @returns {number} The CTH value (0 to 1), or 0 if indicators are invalid or missing.
 */
function calculateCTHFromIndicators(indicators, customWeights) {
    // Use custom weights if provided, otherwise use defaults
    const { w_e, w_s, w_a, w_p } = customWeights || DEFAULT_CTH_WEIGHTS;

    // Validate indicators object
    if (!indicators || typeof indicators !== 'object') {
        // console.warn("Indicators is undefined or not an object in calculateCTHFromIndicators. Returning 0.");
        return 0; // Cannot calculate CTH without valid indicators
    }

    // Normalization and calculation of each dimension (E, S, A, P)
    // Each dimension is an average of its normalized constituent indicators.
    // We count how many valid indicators contribute to each dimension to average correctly.

    // Historical Epoch (E_val)
    const gdpNorm = normalizeIndicator(indicators.gdpPerCapita, INDICATOR_LIMITS.gdpPerCapita.min, INDICATOR_LIMITS.gdpPerCapita.max);
    const giniNorm = normalizeIndicator(indicators.giniIndex, INDICATOR_LIMITS.giniIndex.min, INDICATOR_LIMITS.giniIndex.max);
    const eventsNorm = normalizeIndicator(indicators.politicalEventsCount, INDICATOR_LIMITS.politicalEventsCount.min, INDICATOR_LIMITS.politicalEventsCount.max);
    const e_values = [gdpNorm, giniNorm, eventsNorm].filter(val => typeof val === 'number' && !isNaN(val));
    const E_val = e_values.length > 0 ? e_values.reduce((sum, val) => sum + val, 0) / e_values.length : 0;

    // Social Range (S_val)
    const incomeNorm = normalizeIndicator(indicators.averageIncome, INDICATOR_LIMITS.averageIncome.min, INDICATOR_LIMITS.averageIncome.max);
    const literacyNorm = normalizeIndicator(indicators.literacyRate, INDICATOR_LIMITS.literacyRate.min, INDICATOR_LIMITS.literacyRate.max);
    const s_values = [incomeNorm, literacyNorm].filter(val => typeof val === 'number' && !isNaN(val));
    const S_val = s_values.length > 0 ? s_values.reduce((sum, val) => sum + val, 0) / s_values.length : 0;

    // Age Range (A_val)
    const lifeExpectancyNorm = normalizeIndicator(indicators.lifeExpectancy, INDICATOR_LIMITS.lifeExpectancy.min, INDICATOR_LIMITS.lifeExpectancy.max);
    const birthRateNorm = normalizeIndicator(indicators.birthRate, INDICATOR_LIMITS.birthRate.min, INDICATOR_LIMITS.birthRate.max);
    const a_values = [lifeExpectancyNorm, birthRateNorm].filter(val => typeof val === 'number' && !isNaN(val));
    const A_val = a_values.length > 0 ? a_values.reduce((sum, val) => sum + val, 0) / a_values.length : 0;

    // Population Range (P_val)
    const densityNorm = normalizeIndicator(indicators.populationDensity, INDICATOR_LIMITS.populationDensity.min, INDICATOR_LIMITS.populationDensity.max);
    const urbanizationNorm = normalizeIndicator(indicators.urbanizationRate, INDICATOR_LIMITS.urbanizationRate.min, INDICATOR_LIMITS.urbanizationRate.max);
    const p_values = [densityNorm, urbanizationNorm].filter(val => typeof val === 'number' && !isNaN(val));
    const P_val = p_values.length > 0 ? p_values.reduce((sum, val) => sum + val, 0) / p_values.length : 0;

    // Combine dimensions using their weights
    const weightedSum = (w_e * E_val) + (w_s * S_val) + (w_a * A_val) + (w_p * P_val);
    const totalWeight = w_e + w_s + w_a + w_p;

    let cth = 0;
    if (totalWeight > 0) {
        cth = weightedSum / totalWeight;
    } else {
        // console.warn("Warning: Total CTH dimension weights sum to zero. CTH set to 0.");
        cth = 0; // Avoid division by zero if all weights are zero
    }

    // Ensure final CTH is within 0 and 1
    return Math.max(0, Math.min(1, cth));
}

// --- MISSING DATA INFERENCE WITH DELTA CTH ---

/**
 * Estimates a missing indicator value using an approximate rule of three
 * based on the CTH trend in adjacent periods.
 * This function assumes a direct linear relationship between CTH change and indicator change.
 *
 * @param {number} knownValue - The known indicator value in an adjacent period.
 * @param {number} deltaCTHPercentage - The percentage change of CTH between periods (e.g., 0.05 for 5% increase).
 * @param {number} trendRelation - A factor indicating how strongly indicator change correlates with CTH change.
 * (e.g., 1 for direct proportionality, 0.5 for half proportionality).
 * @param {'forward' | 'backward'} direction - 'forward' if inferring the value for a later period,
 * 'backward' if inferring for an earlier period.
 * @returns {number} The estimated indicator value.
 */
function estimateIndicatorValue(knownValue, deltaCTHPercentage, trendRelation, direction) {
    if (typeof knownValue !== 'number' || isNaN(knownValue) || knownValue < 0) {
        // console.warn(`Warning: Invalid knownValue (${knownValue}) for indicator estimation. Returning 0.`);
        return 0;
    }
    if (typeof deltaCTHPercentage !== 'number' || isNaN(deltaCTHPercentage)) {
        // console.warn(`Warning: Invalid deltaCTHPercentage (${deltaCTHPercentage}) for indicator estimation. Assuming 0 change.`);
        deltaCTHPercentage = 0;
    }
    if (typeof trendRelation !== 'number' || isNaN(trendRelation) || trendRelation < 0) {
        // console.warn(`Warning: Invalid trendRelation (${trendRelation}) for indicator estimation. Assuming 1.`);
        trendRelation = 1;
    }

    const estimatedChangeFactor = deltaCTHPercentage * trendRelation;

    if (direction === 'forward') {
        return knownValue * (1 + estimatedChangeFactor);
    } else { // 'backward'
        // Avoid division by zero or very small numbers if (1 + estimatedChangeFactor) is near zero
        if ((1 + estimatedChangeFactor) === 0) {
            // console.warn("Warning: Denominator for backward inference is zero. Returning knownValue.");
            return knownValue; // Or handle as an error/specific default
        }
        return knownValue / (1 + estimatedChangeFactor);
    }
}

/**
 * Calculates the percentage change between two values.
 * @param {number | undefined | null} val1 - Initial value.
 * @param {number | undefined | null} val2 - Final value.
 * @returns {number} Percentage change (e.g., 0.1 for 10% increase, -0.05 for 5% decrease). Returns 0 if val1 is zero or invalid.
 */
function calculatePercentageChange(val1, val2) {
    if (typeof val1 !== 'number' || isNaN(val1) || val1 === 0) {
        // console.warn(`Warning: Invalid or zero initial value (${val1}) for percentage change. Returning 0.`);
        return 0; // Cannot calculate percentage change from zero or invalid initial value
    }
    if (typeof val2 !== 'number' || isNaN(val2)) {
        // console.warn(`Warning: Invalid final value (${val2}) for percentage change. Returning 0.`);
        return 0;
    }
    return (val2 - val1) / val1;
}

/**
 * Completes missing data in historical indicators for each period
 * using a multi-step inference process:
 * 1. Fill completely missing periods/indicators with reference epoch data.
 * 2. Recalculate CTH for all periods based on currently available data.
 * 3. Use Delta CTH trends to estimate remaining missing indicators, prioritizing interpolation over extrapolation.
 * 4. Apply predefined limits to all inferred values to maintain reasonableness.
 * 5. Recalculate final CTH for all periods with the now complete and inferred data.
 *
 * @param {object} temporalData - Object containing data (CTH and indicators) for 'before', 'prelude', 'during', 'transition', and 'after'.
 * This object will be modified in place.
 * @param {number} eventStartYear - The start year of the main event.
 * @param {number} eventEndYear - The end year of the main event (same as startYear for instantaneous events).
 */
function completeAndInferHistoricalData(temporalData, eventStartYear, eventEndYear) {
    if (!temporalData || typeof temporalData !== 'object') {
        throw new Error("temporalData is undefined or not an object in completeAndInferHistoricalData.");
    }

    const periods = ['before', 'prelude', 'during', 'transition', 'after'];
    const allIndicatorNames = [
        'gdpPerCapita', 'giniIndex', 'politicalEventsCount', 'averageIncome',
        'literacyRate', 'lifeExpectancy', 'birthRate', 'populationDensity', 'urbanizationRate'
    ];

    // Ensure all period objects and their indicators sub-objects exist
    for (const period of periods) {
        temporalData[period] = temporalData[period] || {};
        temporalData[period].indicators = temporalData[period].indicators || {};
    }

    // --- Step 1: Fill in completely missing data with reference epoch data ---
    // This provides a baseline for all indicators if no data is provided at all.
    for (const period of periods) {
        let periodYear;
        // Assign a representative year for each phase to fetch epoch data
        switch (period) {
            case 'before':      periodYear = eventStartYear - 12; break; // ~10-15 years before event
            case 'prelude':     periodYear = eventStartYear - 1;  break; // Just before the event
            case 'during':      periodYear = Math.floor((eventStartYear + eventEndYear) / 2); break; // Middle of the event
            case 'transition':  periodYear = eventEndYear + 1;    break; // Just after the event
            case 'after':       periodYear = eventEndYear + 12;   break; // ~10-15 years after event
            default:            periodYear = eventStartYear;
        }
        const epochData = getEpochDataForYear(periodYear);

        for (const indicatorName of allIndicatorNames) {
            // Only fill if the indicator is completely missing (undefined or null)
            if (temporalData[period].indicators[indicatorName] === undefined || temporalData[period].indicators[indicatorName] === null) {
                temporalData[period].indicators[indicatorName] = epochData[indicatorName];
            }
        }
    }

    // --- Step 2: Recalculate CTH for all periods with the now "filled-in" data ---
    // This CTH is used to calculate Delta CTHs for the next inference step.
    for (const period of periods) {
        temporalData[period].cth = calculateCTHFromIndicators(temporalData[period].indicators);
    }

    // Prepare delta CTHs for inference (percentage change between adjacent CTHs)
    const deltaCTHs = {};
    for (let i = 0; i < periods.length - 1; i++) {
        const p1 = periods[i];
        const p2 = periods[i + 1];
        if (temporalData[p1].cth !== undefined && temporalData[p2].cth !== undefined) {
            deltaCTHs[`${p1}_${p2}_Pct`] = calculatePercentageChange(temporalData[p1].cth, temporalData[p2].cth);
        } else {
            deltaCTHs[`${p1}_${p2}_Pct`] = 0; // Default to 0 if CTH is missing for a delta calculation
        }
    }

    // --- Step 3: Iterate over indicators and apply ΔCTH inference for remaining missing values ---
    // This step refines values that might still be missing or were filled by epoch data
    // but can be better inferred from adjacent CTH trends.
    // We iterate multiple times to allow inference to propagate (e.g., if 'prelude' is inferred from 'before',
    // then 'during' can be inferred from 'prelude' in a subsequent pass).
    const maxInferencePasses = 3; // Number of passes to allow propagation
    for (let pass = 0; pass < maxInferencePasses; pass++) {
        for (let i = 0; i < periods.length; i++) {
            const currentPeriod = periods[i];
            for (const indicatorName of allIndicatorNames) {
                // Only attempt inference if the indicator is still missing
                if (temporalData[currentPeriod].indicators[indicatorName] === undefined || temporalData[currentPeriod].indicators[indicatorName] === null) {
                    let inferredValue = null;
                    const prevPeriod = periods[i - 1];
                    const nextPeriod = periods[i + 1];

                    const hasPrevData = prevPeriod && (temporalData[prevPeriod].indicators[indicatorName] !== undefined && temporalData[prevPeriod].indicators[indicatorName] !== null);
                    const hasNextData = nextPeriod && (temporalData[nextPeriod].indicators[indicatorName] !== undefined && temporalData[nextPeriod].indicators[indicatorName] !== null);

                    // Prioritize interpolation (if both previous and next data exist)
                    if (hasPrevData && hasNextData) {
                        // Simple linear interpolation
                        inferredValue = (temporalData[prevPeriod].indicators[indicatorName] + temporalData[nextPeriod].indicators[indicatorName]) / 2;
                    }
                    // Then, try extrapolation from previous data using CTH trend
                    else if (hasPrevData) {
                        const deltaCTH_PrevCurrent_Pct = deltaCTHs[`${prevPeriod}_${currentPeriod}_Pct`];
                        // Assumed trendRelation: how much indicator changes for a 1% CTH change.
                        // This is a conceptual parameter that needs calibration.
                        const assumedTrendRelation = 1; // Example: 1% CTH change -> 1% indicator change
                        if (deltaCTH_PrevCurrent_Pct !== 0) { // Only infer if there's a CTH trend
                            inferredValue = estimateIndicatorValue(temporalData[prevPeriod].indicators[indicatorName], deltaCTH_PrevCurrent_Pct, assumedTrendRelation, 'forward');
                        }
                    }
                    // Lastly, try extrapolation from next data using CTH trend (backward)
                    else if (hasNextData) {
                        const deltaCTH_CurrentNext_Pct = deltaCTHs[`${currentPeriod}_${nextPeriod}_Pct`];
                        const assumedTrendRelation = 1;
                        if (deltaCTH_CurrentNext_Pct !== 0) { // Only infer if there's a CTH trend
                            inferredValue = estimateIndicatorValue(temporalData[nextPeriod].indicators[indicatorName], deltaCTH_CurrentNext_Pct, assumedTrendRelation, 'backward');
                        }
                    }

                    // If a value was inferred, apply limits and assign it
                    if (inferredValue !== null) {
                        temporalData[currentPeriod].indicators[indicatorName] = applyLimits(indicatorName, inferredValue);
                    }
                }
            }
        }
    }

    // --- Step 4: Apply limits to ALL indicators (even those initially provided) ---
    // This ensures all values used for final CTH calculation are within reasonable bounds.
    for (const period of periods) {
        for (const indicatorName of allIndicatorNames) {
            if (temporalData[period].indicators[indicatorName] !== undefined && temporalData[period].indicators[indicatorName] !== null) {
                temporalData[period].indicators[indicatorName] = applyLimits(indicatorName, temporalData[period].indicators[indicatorName]);
            }
        }
    }

    // --- Step 5: Recalculate CTH for all periods with the now complete and inferred data ---
    // This is the final CTH calculation based on the most complete dataset.
    for (const period of periods) {
        temporalData[period].cth = calculateCTHFromIndicators(temporalData[period].indicators);
    }
};

// --- UNIFIED CTH ANALYSIS MAIN FUNCTION ---

/**
 * Performs a complete CTH analysis for an event, including initial data preparation and inference,
 * across five distinct temporal granularities.
 *
 * @param {number} eventStartYear - The starting year of the main event.
 * @param {number} eventEndYear - The ending year of the main event.
 * @param {object} initialHistoricalData - The initial historical data object, potentially with missing indicators.
 * Expected structure:
 * {
 * before?: { indicators: { [indicatorName: string]: number } },
 * prelude?: { indicators: { [indicatorName: string]: number } },
 * during?: { indicators: { [indicatorName: string]: number } },
 * transition?: { indicators: { [indicatorName: string]: number } },
 * after?: { indicators: { [indicatorName: string]: number } }
 * }
 * @returns {object} TemporalAnalysisData object with CTH and completed indicators for each of the five periods.
 * Returns null if critical initial data is missing.
 */
exports.analyzeEventCTH = function(eventStartYear, eventEndYear, initialHistoricalData) {
    // Validate inputs
    if (typeof eventStartYear !== 'number' || isNaN(eventStartYear) || typeof eventEndYear !== 'number' || isNaN(eventEndYear)) {
        // console.error("Error: eventStartYear and eventEndYear must be valid numbers in analyzeEventCTH.");
        return null; // Return null on critical error
    }
    if (eventStartYear > eventEndYear) {
        // console.error("Error: eventStartYear cannot be greater than eventEndYear in analyzeEventCTH.");
        return null; // Return null on critical error
    }
    if (!initialHistoricalData || typeof initialHistoricalData !== 'object') {
        // console.error("Error: initialHistoricalData is undefined or not an object in analyzeEventCTH.");
        return null; // Return null on critical error
    }

    // Create a deep copy of the initial data to avoid modifying the original object passed in
    const temporalData = {
        before: { indicators: initialHistoricalData.before?.indicators ? { ...initialHistoricalData.before.indicators } : {} },
        prelude: { indicators: initialHistoricalData.prelude?.indicators ? { ...initialHistoricalData.prelude.indicators } : {} },
        during: { indicators: initialHistoricalData.during?.indicators ? { ...initialHistoricalData.during.indicators } : {} },
        transition: { indicators: initialHistoricalData.transition?.indicators ? { ...initialHistoricalData.transition.indicators } : {} },
        after: { indicators: initialHistoricalData.after?.indicators ? { ...initialHistoricalData.after.indicators } : {} },
    };

    // Call the data completion and inference logic
    completeAndInferHistoricalData(temporalData, eventStartYear, eventEndYear);

    // Return the processed temporal data with CTH values for each period
    return temporalData;
};

// Export internal helper functions if needed for testing or external use
// (Note: EPOCH_DATA_REFERENCE is now internal to this module, not exported directly)
exports.getEpochDataForYear = getEpochDataForYear; // Re-export if needed externally
exports.calculateCTHFromIndicators = calculateCTHFromIndicators; // Re-export if needed externally
exports.completeAndInferHistoricalData = completeAndInferHistoricalData; // Re-export if needed externally