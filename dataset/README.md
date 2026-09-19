# CTH Universal Historical Pre-Calculated Dataset

## 🏛 Overview

This dataset provides a standardized, pre-calculated historical corpus for the **CTH Psychohistorical Framework (v4.1)**. It allows researchers, algorithms, and AI agents to rapidly evaluate historical trajectories, benchmark predictive models, and access civilizational states without having to recalculate raw multi-phase simulations from scratch.

The dataset spans **5,100+ years** of human history across **6 canonical epochs**, containing:
- **12,000 Historical Events** (2,000 per epoch)
- **12,000 Historical Characters / Tokens** (2,000 per epoch)
- Fully calculated **Tetrasociohistorical Dimensions (E, S, A, P)** and sub-metrics
- Fully calculated **CTH Trajectories, DeltaCTH, EVEI, ultraCTH, and Token Dynamics (TIS & TIMs)**

Available in both **CSV** (for columnar analysis in Python/Pandas, R, Excel, SQL) and **JSON** (for native JavaScript/Node.js CTH integration).

---

## 📁 Directory Architecture

```text
dataset/
├── README.md                          # Data dictionary, methodology, and integration guide
├── index.js                           # Node.js query and programmatic loading API
├── master/
│   ├── all_events.csv                 # Master table of all 12,000 events
│   ├── all_characters.csv             # Master table of all 12,000 historical characters
│   └── dataset_summary.json           # Aggregated statistics and epoch breakdowns
└── epochs/
    ├── bronze_and_iron_age/           # Epoch 1: -3100 to -800
    │   ├── events.csv / events.json
    │   └── characters.csv / characters.json
    ├── classical_antiquity/           # Epoch 2: -800 to 500
    │   ├── events.csv / events.json
    │   └── characters.csv / characters.json
    ├── medieval/                      # Epoch 3: 500 to 1500
    │   ├── events.csv / events.json
    │   └── characters.csv / characters.json
    ├── early_modern/                  # Epoch 4: 1500 to 1800
    │   ├── events.csv / events.json
    │   └── characters.csv / characters.json
    ├── modern/                        # Epoch 5: 1800 to 1945
    │   ├── events.csv / events.json
    │   └── characters.csv / characters.json
    └── contemporary/                  # Epoch 6: 1945 to 2026
        ├── events.csv / events.json
        └── characters.csv / characters.json
```

---

## 🌐 The Four Dimensions of CTH (E, S, A, P)

In accordance with the CTH methodology, societal context is measured across four fundamental dimensions, each derived from measurable cliometric indicators:

### 1. Historical Epoch (E)
Evaluates macroeconomic productivity, economic distribution, and institutional shock frequency:
- **`gdp_per_capita_usd`**: Estimated real GDP per capita in constant purchasing-power equivalents.
- **`gini_inequality`**: Gini index (0.0 = total equality, 1.0 = absolute inequality).
- **`political_event_density`**: Normalized frequency of structural political shocks and regime shifts per unit time.
- **`historical_epoch_score_E`**: Normalized dimension score ($E \in [0.0, 1.0]$).

### 2. Social Range (S)
Captures civic capital, human development, and knowledge dissemination:
- **`average_income_score`**: Income proxy scaled relative to epoch subsistence floor ($0.0 - 1.0$).
- **`literacy_rate_pct`**: Estimated adult literacy rate percentage ($0.0\% - 100.0\%$).
- **`social_range_score_S`**: Normalized dimension score ($S \in [0.0, 1.0]$).

### 3. Age Range (A)
Reflects demographic vitality, health security, and generational renewal:
- **`life_expectancy_years`**: Life expectancy at birth in years.
- **`birth_rate_per_1000`**: Crude birth rate per 1,000 individuals.
- **`age_range_score_A`**: Normalized dimension score ($A \in [0.0, 1.0]$).

### 4. Population Range (P)
Measures spatial concentration, urbanization, and scale of social organization:
- **`population_density_sqkm`**: Inhabitants per square kilometer.
- **`urbanization_rate_pct`**: Proportion of population residing in urban agglomerations.
- **`population_range_score_P`**: Normalized dimension score ($P \in [0.0, 1.0]$).

---

## 📊 Pre-Calculated CTH Engine Metrics

Every event in the dataset includes pre-computed outputs from the CTH v4.1 core engines:

| Field | Range | Description |
|---|---|---|
| `cth_before` | 0.0 – 1.0 | Baseline sociohistorical stability before the event |
| `cth_prelude` | 0.0 – 1.0 | Stability during the prelude phase (early structural divergence) |
| `cth_during` | 0.0 – 1.0 | Acute stability during the climax or shock phase |
| `cth_transition` | 0.0 – 1.0 | Stability during the institutional reorganization / transition phase |
| `cth_after` | 0.0 – 1.0 | Consolidated stability post-event |
| `cth_global` | 0.0 – 1.0 | Unweighted mean stability across the 5 canonical phases |
| `delta_cth` | -1.0 – +1.0 | Net trajectory shift ($CTH_{after} - CTH_{before}$) |
| `black_swan_index` | 0.0 – 1.0 | Surprise / exogenous volatility factor |
| `evei` | 0.0 – 1.0 | Event Valuation & Impact index (derived endogenously from drawdown, volatility, trend, and density) |
| `ultra_cth` | 0.0 – 1.0 | Master CTH prediction score synthesized across all 6 analytical engines |
| `prediction` | `RMD` / `CMN` | Verdict: **RMD** (Adaptive Renewal/Transformation) vs **CMN** (Systemic Decline/Collapse) |
| `certainty_bracket` | String | Classification bracket (`BRACKET_DEEP_CONVICTION`, `BRACKET_HIGH`, `BRACKET_BASE`, `BRACKET_UNCERTAIN`) |
| `alphabreak` | Boolean | `true` if structural risk thresholds were breached |
| `foundation_risk` | 0.0 – 1.0 | Composite Foundation Engine risk |
| `dynamics_risk` | 0.0 – 1.0 | Predictive Dynamics Engine risk |
| `chaos_risk` | 0.0 – 1.0 | Chaos & Resilience Shield risk |

---

## 🎭 Historical Characters & Token Dynamics

Each historical character is modeled as an individual causal agent (Token), linked to historical events via `associated_event_id`:

| Field | Range | Description |
|---|---|---|
| `character_id` | String | Unique ID (e.g. `CHR-CLA-0042`) |
| `historical_role` | String | `architect`, `catalyst`, `stabilizer`, `disruptor`, or `wildcard` |
| `power_index` | 0.0 – 1.0 | Institutional, military, or coercive authority |
| `network_centrality` | 0.0 – 1.0 | Centrality in elite and mass alliance graphs |
| `legitimacy` | 0.0 – 1.0 | Institutional and societal recognition |
| `rationality` | 0.0 – 1.0 | Strategic calculation vs ideological fanaticism |
| `charisma` | 0.0 – 1.0 | Mass mobilization potential |
| `ideological_extremity` | 0.0 – 1.0 | Deviation from civilizational equilibrium |
| `momentum` | 0.0 – 1.0 | Social and political acceleration of influence |
| `duration_of_influence_months` | Integer | Duration of peak causal agency in months |
| `token_impact_score_tis` | 0.0 – 1.0 | **TIS**: Overall systemic destabilization weight |
| `tim_foundation` | Multiplier | Token Impact Multiplier on Foundation risk |
| `tim_dynamics` | Multiplier | Token Impact Multiplier on Dynamics risk |
| `tim_chaos` | Multiplier | Token Impact Multiplier on Chaos risk |
| `mule_clause_risk` | Boolean | `true` if actor dominance exceeds macro predictability threshold |

---

## 💻 Programmatic Usage (Node.js API)

```javascript
import { getEvents, getCharacters, loadEpoch, getDatasetSummary } from './dataset/index.js';

// 1. Load an entire epoch (2,000 events + 2,000 characters)
const { events, characters } = loadEpoch('classical_antiquity');
console.log(`Loaded ${events.length} events from Classical Antiquity`);

// 2. Query events filtered by criteria
const transformations = getEvents({
    epoch: 'early_modern',
    category: 'transformation',
    prediction: 'RMD'
});
console.log(`Found ${transformations.length} successful early modern transformations`);

// 3. Inspect high-impact disruptor actors
const disruptors = getCharacters({
    historical_role: 'disruptor',
    mule_clause_risk: true
});
console.log(`Identified ${disruptors.length} high-risk disruptor actors across all eras`);
```

---

## 📈 Regeneration

To regenerate the entire dataset using the deterministic seed:
```bash
npm run generate:dataset
```
