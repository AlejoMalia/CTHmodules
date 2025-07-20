# CTHmodules

![BANNER](docs/banner.png)

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Terms of Use](https://img.shields.io/badge/Terms%20of%20Use-lightgrey.svg)](./WEIGHTS—TERMS_OF_USE.md) [![npm version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://www.npmjs.com/package/cthmodules) [![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/) [![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-red.svg)](CONTRIBUTING.md)

"_You can't connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future._" - Steve Jobs

**CTHmodules** is a modular, open-source framework designed for tetrasociohistorical analysis, centered on the Tetrasociohistorical Context (CTH), a normalized metric (0-1) that quantifies socio-historical context across five temporal phases: *before, prelude, during, transition, and after*.

---

## Introduction: Reimagining Temporal Patterns

My exploration of the historical perception of time reveals a transition from ancient cyclic conceptions towards modern linear frameworks, influenced by thinkers such as *Karl Jaspers* and *Mircea Eliade*, and exemplified by artifacts like the Antikythera Mechanism. This highlights humanity's effort to map recurrent historical phenomena.

Building upon these perspectives, I have developed a theory and measurement system that maintains the cyclic nature of time and the execution of historical events, leveraging their predictive potential through advanced mathematical and computational methods. This system, materialized in **CTHmodules**, analyzes and quantifies past sociohistorical patterns to use them as a database and project a range of eventual bifurcations into the future, marking a significant step towards an analytical paradigm inspired by Isaac Asimov's Psychohistory.
<br>

![BANNER](docs/scheme.png)
<br>

The **Tetrasociohistorical Context (CTH)** is a quantitative index designed to evaluate the historical, social, economic, demographic, and population conditions surrounding an event at a specific moment, providing a measure of the sociohistorical environment in which the event occurs. This index is based on the premise that an event's relevance cannot be fully understood without considering the context in which it develops, as factors like economic stability, social cohesion, demographic dynamics, and population density influence the magnitude of its impact. The CTH is constructed from *four main dimensions*: `Historical epoch (E)`, `Social range (S)`, `age range (A)`, and `Population range (P)`, each represented by specific indicators reflecting environmental conditions.

To calculate the CTH, historical data is collected, including metrics such as **GDP per capita, Gini inequality index, number of relevant political events, average income, literacy rate, life expectancy, birth rate, population density, and urbanization rate**. This data is organized into the four aforementioned dimensions and normalized to ensure each indicator contributes proportionally to the final index.

The CTH is essential because it **encapsulates the structural conditions that affect an event's relevance**. For instance, an event like the announcement of Napoleon Bonaparte's death in 1821 occurred in a context of high political tension (post-Congress of Vienna, monarchical Restoration) and economic inequality, which should be reflected in a high CTH. However, if historical data is incomplete (e.g., missing political events), the system dynamically adjusts the weights to prevent distortions, reducing the contribution of the affected dimension (historical epoch, in this case) and redistributing the weight among the other dimensions.

---

## Repository Structure

The `CTHmodules` repository is structured into several modular JavaScript files, each responsible for a specific aspect of the temporal analysis framework. This modular design ensures clarity, maintainability, and reusability of individual components.

#### 🧬 Core Definitions
**Description:** Establish the basic units of analysis and fundamental metrics.

- 🧩 **`cth-analysis-module.js`**
  - The script is a sophisticated tool for conducting Tetrasociohistorical Context (CTH) analysis, quantifying the socio-historical context of an event across five temporal phases: before, prelude, during, transition, and after. The core function, `analyzeEventCTH`, processes historical indicators (e.g., GDP per capita, literacy rate, population density) across four dimensions—`Historical Epoch`, `Social Range`, `Age Range`, and `Population Range`—normalizing them to a 0-1 scale and computing a weighted CTH score (0-1) per phase.
  - A key feature is its `ΔCTH system`, embedded in the `completeAndInferHistoricalData` function, which calculates the percentage change in CTH between adjacent phases (via `calculatePercentageChange`) and uses these trends to infer missing indicators through interpolation or extrapolation (via `estimateIndicatorValue`).
  - This `ΔCTH` mechanism ensures robust data completion by leveraging contextual trends, complemented by epoch-based reference data and limit enforcement, enabling accurate analysis even with incomplete datasets. By integrating normalization, weighted aggregation, and Delta CTH-driven inference, the module provides a precise, data-driven framework for studying socio-historical dynamics and supporting predictive modeling in complex historical contexts.

- 🧩 **`evei-calculator.js`**
  - The script provides the `calculateEVEI` function, a critical component for computing the `Comprehensive Eventual Valuation Structure (EVEI)` of an event, which quantifies its overall impact within a tetrasociohistorical framework. The function takes an event’s data, including the Tetrasociohistorical Context (CTH) and three custom indicators (A, B, C), all normalized to a 0-1 range, and applies a weighted linear combination using configurable weights (default: 0.4 for CTH, 0.2 for A, 0.25 for B, 0.35 for C).
  - The resulting EVEI value is normalized by the sum of weights to ensure a 0-1 scale, accompanied by an uncertainty range (±10%) and an interpretation categorizing the event’s impact (from "negligible" to "catastrophic or transformative"). This module enables precise, data-driven assessment of an event’s significance, supporting analysts in evaluating its potential socio-historical consequences.

- 🧩 **`constructor.js`**
  - The script defines the `Constructor` class, a cornerstone of tetrasociohistorical analysis, designed to model structural units such as `historical figures (FH)` or `events (FE)` within complex socio-historical frameworks. This class encapsulates critical properties like the Comprehensive Eventual Valuation Structure (EVEI) and Tetrasociohistorical Context (CTH), both normalized between 0 and 1, alongside a temporal phase (e.g., Before, During, After) and customizable attributes specific to the constructor type.
  - It validates inputs rigorously, converts phases to numeric indicators, and generates a numeric embedding vector that integrates EVEI, CTH, attributes, and phase for analytical use. By providing a structured representation of historical entities or events, the Constructor class enables precise, data-driven analysis of their roles and impacts in socio-historical dynamics, serving as a foundational component for broader analytical modules.

#### 🔬 Core Analysis
**Description:** Calculate composite metrics and perform in-depth analysis of events and contexts.

- 🧩 **`evei-cth-extended-analysis.js`**
  - The script implements the `analyzeEventExtended` function, a comprehensive tool for performing an in-depth tetrasociohistorical analysis of an event by integrating Comprehensive Eventual Valuation Structure (EVEI) and Tetrasociohistorical Context (CTH) with a suite of derived metrics.
  - Leveraging the `analyzeEventCTH` and `calculateEVEI` functions from external modules, it calculates CTH values across five temporal phases (before, prelude, during, transition, after) and computes EVEI based on event-specific indicators. The script further derives key metrics: `IEC (Incremental Event Causality)`, `PPI (Predictive Power Index)`, `VVC (Volatility and Vulnerability Coefficient)`, `MCE (Modified CTH Evaluation)`, `IIG (Impact Intensity Gradient)`, `UIR (Unexpected Instability Ratio)`, `PTS (Potential Transformation Scale)`, `RD (Resilience Dynamics)`, `PPIC (Post-Event Progress Index)`, and `deltaCTH_Total`, which quantifies net CTH change.
  - This module provides a robust, data-driven framework for assessing an event’s causality, predictability, volatility, and transformative impact, enabling analysts to understand its socio-historical significance with precision.

- 🧩 **`fp-calculator.js`**
  - The script defines the `calculatePotentialFactors` function, a focused tool for computing the Potential Factors (FP) of a specific temporal phase in a tetrasociohistorical analysis. It processes a phase’s data, comprising `Human Factors (FH)` and `Eventual Factors (FE)`, each with associated Comprehensive Eventual Valuation Structure (EVEI) and Tetrasociohistorical Context (CTH) values.
  - The function aggregates EVEI and CTH values separately for human and eventual factors by summing them, then calculates the total `FP_EVEI` and `FP_CTH` for the phase by combining these aggregates. The output includes the phase name, FP values, and a debug object detailing the individual contributions of FH and FE.
  - This module enables analysts to quantify the potential influence of a phase’s actors and events, providing a clear, data-driven foundation for understanding their collective impact within socio-historical dynamics.

- 🧩 **`margins-calculator.js`**
  - Computes the `Macromargin` and `Micromargin` of historical events within the tetrasociohistorical framework, providing a quantitative assessment of event impact across phases. Utilizing `analyzeEventCTH` and `calculateEVEI` from supporting modules, it calculates phase-specific indices by weighting `CTH`, `EVEI`, and a `FP`, with customizable ratios (default 0.4, 0.4, 0.2).
  - The function `calculateMargins` processes data from `five phases (before, prelude, during, transition, after)`, deriving `Macromargin` from external phases and `Micromargin` from internal phases, offering insights into contextual stability and event magnitude.

#### 🔮 Specialized Predictive & Dynamic Analysis
**Description:** Focus on prediction, risk, event classification, and the modeling of specific dynamics.

- 🧩 **`cmn-rmd-analysis.js`**
  - <small>The code implements a function called `analyzeCMNRMD` that classifies events into two categories: `(CMN)`, associated with outcomes of decline, stagnation, or negative transformation, and `(RMD)`, related to growth, renewal, or positive transformation. The function takes an `extendedAnalysisResults` object with specific metrics `(such as evei, iec, ppi, etc.)` and calculates weighted scores to determine whether an event is CMN or RMD.</small>
  - <small>It uses predefined weights for each metric, normalizes the scores, and classifies the event based on the highest score, providing a probability, associated conditions, timeframe, historical basis, critical events, system state, and consequences. This analysis is useful for evaluating the systemic impact of events in social, economic, or historical contexts, identifying trends towards stability or collapse.</small>

- 🧩 **`cmn-rmd-calculator.js`**
  - The script implements the `calculateCMNRMD` function, a powerful tool for analyzing the trajectory of a current event by comparing it to historical or analogous events. It calculates three key metrics: (CMN), which measures how close the current event is to a radical change threshold; (RMD), which evaluates proximity to a stable or desired outcome; and the Reality Variable, which quantifies uncertainty based on the variability of these comparisons.
  - By leveraging metrics like `Comprehensive Eventual Valuation Structure (EVEI)` and `Tetrasociohistorical Context (CTH)`, the function computes distances to critical and stable states of analogous events using Manhattan distance, consolidates scores through averaging, and assesses uncertainty via the standard deviation of combined scores. This enables a robust assessment of an event’s potential for transformative disruption or stabilization, offering critical insights for strategic decision-making in complex socio-historical contexts.

- 🧩 **`constructor-blackswan-calculator.js`**
  - The script provides a robust suite of functions to identify and quantify the impact of `Black Swan` events or figures within a tetrasociohistorical analysis framework. The core function, `isBlackSwanConstructor`, evaluates whether a constructor (historical figure or event) qualifies as a Black Swan based on stringent criteria: high Comprehensive Eventual Valuation Structure (EVEI > 0.9), high Tetrasociohistorical Context (CTH > 0.8), significant attributes (e.g., leadership or scale > 0.8), and either anomalous correlations or a critical phase (phase CTH > 0.4).
  - Complementary functions include `calculateCorrelationVariability`, which computes the standard deviation of correlation values to measure variability, `calculateBlackSwanInfluence`, which quantifies a Black Swan’s influence using weighted factors (phase CTH, correlation variability, and Black Swan presence), and `predictPhasePotential`, which adjusts a phase’s predictive potential by incorporating Black Swan influence and antifragility. This module empowers analysts to detect disruptive entities and forecast their systemic impact in complex socio-historical contexts.

- 🧩 **`pcn-calculator.js`**
  - This script provides a sophisticated framework for assessing the likelihood of Black Swan events through two key functions: `calculateIPD` and `calculatePCN`.
  - The `calculateIPD` function computes the Disruptive Potential Indicator (IPD) using weighted metrics—Potential Impact Projection (PPI), Contextual Stability Index (IEC), and Contextual Variation Valence (VVC)—with a formula that emphasizes impact and contextual instability (IPD = w_ppi * PPI + w_iec * |IEC - 0.5| + w_vvc * VVC).
  - The `calculatePCN` function then derives the Percentage of Black Swans (PCN) by normalizing the IPD against a maximum possible value (0.875) and scaling it to a percentage, offering a clear probabilistic estimate of Black Swan risk. Accompanied by a detailed interpretation, the output categorizes the risk level (from "no risk" to "extremely high") based on the PCN value, enabling analysts to gauge the potential for highly disruptive, unpredictable events in socio-historical contexts with precision.

- 🧩 **`pee-calculator.js`**
  - The script projects future event trajectories (PEE) within the tetrasociohistorical framework, using `projectEventualSpectrum` to generate probabilistic scenarios based on current `CTH`, `ΔCTH`, `Disruption Potential (IPD)`, and `Systemic Resilience (VRS)`. It incorporates historical analogues and active constructors to model phase-specific outcomes (e.g., Prelude, During, After), offering insights into potential developments and their required magnitudes. This forward-looking tool enhances predictive analysis of socio-historical dynamics.

#### 💈 Temporal & Pattern Visualization
**Description:** Address temporal coherence, equivalence, and the visual representation of patterns.

- 🧩 **`et-calculator.js`**
  - The script implements the `calculateTemporalEquivalence` function, a powerful tool for assessing the `Temporal Equivalence (ET)` of a current event by comparing it to a simulated historical event database. It evaluates how closely the current event’s Comprehensive Eventual Valuation Structure (EVEI) and Tetrasociohistorical Context (CTH) match those of historical analogs, within specified tolerances (default 2.5% for both EVEI and CTH).
  - The function filters analogous events by optional event type (e.g., 'war', 'social') and calculates the ET percentage based on the average absolute CTH difference between the current event and its analogs. The output includes the ET value, the number of analogous events, the average contextual difference, and a detailed interpretation categorizing the degree of contextual disparity (from "no disparity" to "very high"). This module enables analysts to quantify historical similarities, facilitating predictions about the current event’s trajectory based on past dynamics in socio-historical contexts.

- 🧩 **`pantemporal-elements-calculator.js`**
  - Analyzes the consistency of variables across historical phases to identify Pantemporal Elements within the tetrasociohistorical framework. Through `calculatePantemporalityIndex`, it computes the `Pantemporality Index (IP = 1 - σ(X))` based on standard deviation (σ) of values from the Before, Prelude, and During phases, while `identifyPantemporalElement` determines if a variable qualifies as pantemporal (IP ≥ 0.9 by default). This tool quantifies temporal stability and recurrence, enhancing the understanding of enduring socio-historical patterns.

- 🧩 **`pattern10x10-calculator.js`**
  - Is a groundbreaking tool that transforms the tetrasociohistorical framework into a vibrant, data-driven visual odyssey. By mapping critical metrics—`CTH`, `EVEI`, `deltaCTH`, `IEC`, `PPI`, `VVC`, and `MCE`—across a 10x10 grid spanning five temporal phases, it unveils the hidden rhythms of historical events with stunning precision. Powered by `generatePatternGrid`, it normalizes raw data into a mesmerizing color-coded tapestry, using Plasma and Cool scales to highlight coherence, disruption, and emotional valence. With summaries, confidence intervals, and interpretive insights, this module empowers researchers to decode socio-historical patterns and anticipate future dynamics.

- 🧩 **`pattern10x10-calculate-similarity.js`**
  - Visualizes and analyzes historical event patterns within a `10x10 grid framework`, integrating key metrics like the `CTH`, `EVEI`, and `ΔCTH`. Using the `generatePatternGrid` function, it normalizes raw data into a color-coded grid, applying Plasma (warm) and Cool (divergent) color scales to highlight trends and contextual coherence across phases. It provides a summary of normalized values, confidence ranges, and interpretations (e.g., EVEI significance, deltaCTH trends), serving as a diagnostic tool for socio-historical pattern analysis.

- 🧩 **`temporal-analysis-fields-calculator.js`**
  - The script extends the tetrasociohistorical analysis by structuring event data into Triphasic, Pentaphasic, and Supraphasic fields, leveraging the `_analyzeEventSequenceInternal` function to process phase-specific sequences. It integrates metrics like `CTH`, `EVEI`, and `Black Swan potential (PCN)` to assess predictive outcomes, while tracking long-term influences (RTIs) in the Supraphasic field. With functions like `calculateTriphasicField` and `calculatePentaphasicField`, it provides a multi-dimensional view of event evolution and contextual dynamics, enhancing historical analysis.

- 🧩 **`timesequence-analysiscalculator.js`**
  - The code functions as the core analytical engine for processing sequences of historical events within the tetrasociohistorical framework. It calculates key metrics such as the `Comprehensive Eventual Valuation Structure (EVEI)`, `Tetrasociohistorical Context (CTH)`, and `ΔCTH`, while integrating sub-modules (e.g., `cth-analysis-module.js`, `evei-cth-extended-analysis.js`) to standardize raw event data and infer missing values.
  - Through `analyzeEventSequence`, it identifies trends, critical inflection points `(CMN/RMD)`, and contextual coherence across temporal phases, providing a robust foundation for understanding event dynamics.
## Getting Started

To use this project, clone the repository:

```bash
git clone [https://github.com/alejomalia/cthmodules.git](https://github.com/alejomalia/cthmodules.git)
cd cthmodules
```


<small>🗂 **Note:** I have provided comprehensive test examples for all code modules within the `tests` folder to demonstrate their functionality within the tetrasociohistorical framework. Each example, such as `cmn-rmd-analysis-test.js`, is meticulously configured with specific datasets tailored to illustrate the respective module's behavior, including metrics like the Comprehensive Eventual Valuation Structure (EVEI) and Tetrasociohistorical Context (CTH) These examples serve as a practical guide for users to explore the codebase. For enhanced performance and scalability, the mechanics can be optimized by integrating a historical database (e.g., events, figures, dates) or an AI model, offering a pathway to more robust and dynamic analysis.</small>

---

## The Evolutionary Stages:

The development of the `CTHmodules` framework has progressed through distinct *layers*, each building upon the foundational insights of the last, moving from qualitative understanding to quantifiable prediction and meta-analysis.

#### Layer 0: Historical Description and Qualitative Data (2023/2024)

This initial phase focused on establishing the theoretical bedrock and qualitative understanding.
<small>
**Achievements:**
* ✍️ An initial draft was developed, laying down the conceptual foundations of the project and articulating a vision for analyzing historical and social events from a novel, systematic perspective. This preliminary document defined the theoretical principles that would guide subsequent development, focusing on how events shape long-term trajectories.
* 🔄 Initial concepts were introduced to represent repetitive patterns in history using cyclic graphs, exploring ways to visualize the recurrence of social and cultural dynamics. These ideas laid the groundwork for more advanced visual tools in later stages.
* 🤔 A qualitative method was proposed to assess the importance of an event, considering factors such as its influence emotional, social, and contextual. This initial approach sought to capture the intrinsic value of events, providing a starting point for more rigorous analyses.
</small>


#### Layer 1: Quantification - Descriptive Metrics (#01/2025)

This layer marked the transition from qualitative descriptions to a rigorous, quantifiable framework.
<small>
**Achievements:**
* 📊 A mathematical system was consolidated to measure the importance of an event, transforming the initial qualitative method into a precise calculation that allows for assigning numerical values based on multiple dimensions, such as emotional resonance and social impact. This advance marked a milestone in the formalization of the framework.
* 🏛️ A structured method was developed to analyze the historical and social context of an event, identifying the cultural, political, and economic forces surrounding it. This approach allowed for systematically contextualizing events, enriching the analysis with a deep understanding of their environment.
* 📈 Several derived indicators were created to complement the main measurement, allowing for the evaluation of events from additional perspectives, such as their capacity to generate immediate changes or their relevance in broader historical dynamics. These indicators expanded the versatility of the framework, making multidimensional analysis possible.
</small>


#### Layer 2: Visualization - Patterns and Visual Comparisons (#02/2025)

This phase focused on translating complex quantitative data into intuitive and insightful visual representations.
<small>
**Achievements:**
* 🖼️ A graphical tool in the form of a two-dimensional grid (10x10) was designed to organize the quantitative data of events in a clear visual format. This grid allows for identifying patterns, trends, and relationships between events, facilitating the comparison of their characteristics over time.
* 🌐 A method was established to visually represent the complex dynamics of events, making quantitative results more accessible and intuitive. The graphical tool translates numbers into understandable patterns, allowing users to easily detect recurrences or anomalies.
* 🔍 The grid was optimized for use in comparative analyses, allowing for the superposition of data from multiple events to explore similarities and differences. This advance strengthened the framework's capacity to generate visual insights, supporting both theoretical research and practical applications.
</small>

#### Layer 3: Prediction/Projection - Predictive Values and Structures (#03/2025)

This layer concentrated on developing the core predictive capabilities of the CTHmodules system.
<small>
**Achievements:**
* 🎯 A calculation was formulated to determine the minimum threshold necessary for an event to trigger a significant change in its context, whether social, cultural, or political. This method identifies the critical conditions under which an event can alter existing trajectories.
* 🌟 An approach was developed to define the ideal or most stable state an event could reach, providing a reference point for evaluating desired outcomes. This calculation allows for projecting optimal scenarios based on the event's characteristics.
* 🔮 A projection system was created that generates possible future scenarios, using the quantitative and contextual data of the event to model how it might evolve in different temporal horizons. This system produces a range of probable outcomes, from the most likely to the most disruptive.
</small>

#### Layer 4: Predictive Meta-Analysis - The Prelude to Psychohistory (2025)

The most advanced layer, pushing the boundaries towards true psychohistorical analysis.
<small>
**Achievements:**
* 🧠 An innovative approach was introduced that utilizes advanced artificial intelligence models, similar to language processing systems, to analyze events from a computational perspective. This method enriches projections by incorporating large-scale data analysis capabilities.
* 💡 A new indicator was developed to measure latent influences that could amplify an event's impact, identifying underlying factors that are not immediately visible but have the potential to shape its evolution.
* ⚖️ Concepts were created to model active and inactive dynamics affecting an event's behavior. Active dynamics represent forces driving change, while inactive dynamics are present but unactivated elements that could influence the future under certain conditions.
* 🌊 A method was established to analyze highly uncertain disruptive events—those with the potential to generate unpredictable and massive changes. This approach allows these events to be incorporated into projections, preparing them for extreme scenarios.
* 🧭 A temporal framework was formulated that analyzes an event as a trigger for future changes, dividing its evaluation into three temporal perspectives: as a distant precursor, a near precursor, and in its current state. This framework, accompanied by an analytical synthesis system, provides a comprehensive view of the event's predictive potential.
</small>

#### Bibliography

- 📖 Eliade, M. | **The myth of the eternal return**.
- 📖 Jaspers, K. | **Origin and goal of history**.
- 📖 Nassim Nicholas Taleb. | **The Black Swan: The Impact of the Highly Improbable**. 
- 📖 Campbell, J. | **The hero with a thousand faces**.
- 📖 Nietzsche, F. | **Thus spoke Zarathustra**. 
- 📖 Hall, M. P. | **The teachings of all ages**. 
- 📖 Roob, A. | **Alchemy and mysticism**.
- 📖 Tanaka, M., & Saito, T. | **Great visual history of philosophy**. 
- 📖 Postman, N. | **Amusing ourselves to death: Public discourse in the age of show business**. 
---
### Contribute

<small>***CTHmodules** is an open-source project rooted in the tetrasociohistorical framework, dedicated to advancing research and scientific exploration of historical and predictive analysis. Contributions from individuals passionate about scholarly inquiry are warmly welcomed. As a non-commercial endeavor, it prioritizes knowledge dissemination over profit, fostering a collaborative environment for academic and scientific progress.</small>

- [Report issues](https://github.com/your-username/CTHmodules/issues) - Share bugs or suggestions to refine the codebase.
- [Submit pull requests](https://github.com/your-username/CTHmodules/pulls) - Propose enhancements or new features for the community.
- [Star the repository](https://github.com/your-username/CTHmodules) - Show your support and help increase visibility.
- [Support the project](https://github.com/sponsors/your-username) - Contribute financially to sustain development.
- [Explore the code](https://github.com/your-username/CTHmodules/tree/main/src) - Dive into the source and collaborate on innovations.

---

### License
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![Terms of Use](https://img.shields.io/badge/Terms%20of%20Use-lightgrey.svg)](./WEIGHTS—TERMS_OF_USE.md)
<small>This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License (CC BY-NC-SA 4.0).

All mechanisms and mathematical formulas presented herein are part of my scientific research work titled **The Tetrasociohistorical Context, the Temporal Sequence, and the Projection of the Eventual Spectrum**, (El Contexto Tetrasociohistórico, la Secuencia Temporal, y la Proyección del Espectro Eventual) initiated in 2023.
* First edition: 2023
* Second edition: 2024
* Third edition: 2025
* **Latest Registration: May 9, 2025**
* **Registration No.: 2505091695916**
</small>

