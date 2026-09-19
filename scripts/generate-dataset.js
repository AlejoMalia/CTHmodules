/**
 * SCRIPTS/GENERATE-DATASET.JS — CTH Framework v4.1
 * Author: Alejo Malia | CTHmodules.cc
 *
 * Automated generator for calibrated Tetrasociohistorical (CTH) datasets.
 * Generates 2,000 events and 2,000 historical characters per epoch across 6 canonical epochs
 * (12,000 events + 12,000 characters total).
 *
 * Dimensions:
 * - Historical Epoch (E): GDP per capita, Gini inequality, political event density
 * - Social Range (S): Average income score, literacy rate
 * - Age Range (A): Life expectancy, birth rate
 * - Population Range (P): Population density, urbanization rate
 *
 * Fully calculates:
 * - CTH 5-phase trajectories (before, prelude, during, transition, after)
 * - delta_cth, cth_global, black_swan_index, evei
 * - ultraCTH, prediction (RMD/CMN), certainty_bracket, alphabreak, engine risks
 * - Token Impact Score (TIS), TIM multipliers (foundation, dynamics, chaos), Mule Clause risk
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CTHMasterPredictorEngine, CTHTokenDynamicsEngine } from '../cth-core.js';
import { SnapshotAdapter } from '../cth-data-adapters.js';
import { POLICY_GENERAL } from '../cth-policy-variants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DATASET_DIR = join(ROOT_DIR, 'dataset');

// Simple fast deterministic LCG PRNG for reproducibility
class PRNG {
    constructor(seed = 123456789) {
        this.state = seed;
    }
    next() {
        this.state = (this.state * 1664525 + 1013904223) >>> 0;
        return this.state / 4294967296;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    rangeInt(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
    choice(arr) {
        return arr[this.rangeInt(0, arr.length - 1)];
    }
}

const prng = new PRNG(421337);
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(v) || 0));
const round = (v, d = 4) => Number(Number(v).toFixed(d));

// ─── Epoch Definitions & Cliometric Baselines ────────────────────────────────

const EPOCHS = [
    {
        key: 'bronze_and_iron_age',
        name: 'Bronze & Iron Age',
        yearMin: -3100,
        yearMax: -800,
        civilizations: [
            { name: 'Ancient Egypt', region: 'North Africa / Nile' },
            { name: 'Sumer & Akkad', region: 'Mesopotamia' },
            { name: 'Babylonia', region: 'Mesopotamia' },
            { name: 'Assyrian Empire', region: 'Near East' },
            { name: 'Hittite Empire', region: 'Anatolia' },
            { name: 'Minoan Civilization', region: 'Aegean / Crete' },
            { name: 'Mycenaean Greece', region: 'Aegean' },
            { name: 'Shang Dynasty', region: 'East Asia' },
            { name: 'Western Zhou Dynasty', region: 'East Asia' },
            { name: 'Indus Valley (Late)', region: 'South Asia' },
            { name: 'Vedic Kingdoms', region: 'South Asia' },
            { name: 'Elamite Empire', region: 'Ancient Iran' },
            { name: 'Kingdom of Kush (Kerma/Napata)', region: 'Nubia' },
            { name: 'Phoenician City-States', region: 'Levant' }
        ],
        gdpMin: 400, gdpMax: 780,
        giniMin: 0.35, giniMax: 0.68,
        literacyMin: 1.0, literacyMax: 5.5,
        lifeExpMin: 22.0, lifeExpMax: 30.0,
        birthRateMin: 38.0, birthRateMax: 48.0,
        popDensityMin: 1.5, popDensityMax: 16.0,
        urbanRateMin: 2.0, urbanRateMax: 8.5
    },
    {
        key: 'classical_antiquity',
        name: 'Classical Antiquity',
        yearMin: -800,
        yearMax: 500,
        civilizations: [
            { name: 'Classical Greece (Polis)', region: 'Mediterranean' },
            { name: 'Achaemenid Empire', region: 'Persia / Near East' },
            { name: 'Roman Republic', region: 'Mediterranean' },
            { name: 'Roman Empire (Principate/Dominate)', region: 'Mediterranean / Europe' },
            { name: 'Maurya Empire', region: 'South Asia' },
            { name: 'Qin & Han Dynasties', region: 'East Asia' },
            { name: 'Carthaginian Republic', region: 'Western Mediterranean' },
            { name: 'Ptolemaic Kingdom', region: 'Egypt / Levant' },
            { name: 'Seleucid Empire', region: 'Near East / Central Asia' },
            { name: 'Parthian Empire', region: 'Persia' },
            { name: 'Kushan Empire', region: 'Central & South Asia' },
            { name: 'Sasanian Empire', region: 'Persia' },
            { name: 'Gupta Empire', region: 'South Asia' },
            { name: 'Kingdom of Aksum', region: 'Horn of Africa' }
        ],
        gdpMin: 500, gdpMax: 1250,
        giniMin: 0.38, giniMax: 0.74,
        literacyMin: 5.0, literacyMax: 20.0,
        lifeExpMin: 24.0, lifeExpMax: 35.0,
        birthRateMin: 35.0, birthRateMax: 46.0,
        popDensityMin: 5.0, popDensityMax: 42.0,
        urbanRateMin: 5.0, urbanRateMax: 15.0
    },
    {
        key: 'medieval',
        name: 'Medieval Era',
        yearMin: 500,
        yearMax: 1500,
        civilizations: [
            { name: 'Byzantine Empire', region: 'Eastern Mediterranean' },
            { name: 'Tang Dynasty', region: 'East Asia' },
            { name: 'Song Dynasty', region: 'East Asia' },
            { name: 'Abbasid Caliphate', region: 'Middle East' },
            { name: 'Umayyad Caliphate (Al-Andalus)', region: 'Iberia / North Africa' },
            { name: 'Holy Roman Empire', region: 'Central Europe' },
            { name: 'Kingdom of France', region: 'Western Europe' },
            { name: 'Kingdom of England', region: 'British Isles' },
            { name: 'Mongol Empire / Ilkhanate', region: 'Eurasian Steppe' },
            { name: 'Kievan Rus', region: 'Eastern Europe' },
            { name: 'Mali Empire', region: 'West Africa' },
            { name: 'Khmer Empire', region: 'Southeast Asia' },
            { name: 'Chola Dynasty', region: 'South India' },
            { name: 'Kamakura / Muromachi Japan', region: 'East Asia' },
            { name: 'Classic Maya & Postclassic', region: 'Mesoamerica' }
        ],
        gdpMin: 520, gdpMax: 1350,
        giniMin: 0.40, giniMax: 0.76,
        literacyMin: 4.5, literacyMax: 18.0,
        lifeExpMin: 25.0, lifeExpMax: 36.0,
        birthRateMin: 34.0, birthRateMax: 45.0,
        popDensityMin: 8.0, popDensityMax: 65.0,
        urbanRateMin: 4.5, urbanRateMax: 14.0
    },
    {
        key: 'early_modern',
        name: 'Early Modern Era',
        yearMin: 1500,
        yearMax: 1800,
        civilizations: [
            { name: 'Spanish Empire', region: 'Iberia / Americas' },
            { name: 'British Empire (Early)', region: 'British Isles / Global' },
            { name: 'Kingdom of France (Bourbon)', region: 'Western Europe' },
            { name: 'Ottoman Empire', region: 'Southeast Europe / Near East' },
            { name: 'Mughal Empire', region: 'South Asia' },
            { name: 'Ming & Qing Dynasties', region: 'East Asia' },
            { name: 'Tsardom & Russian Empire', region: 'Northern Eurasia' },
            { name: 'Safavid Empire', region: 'Persia' },
            { name: 'Tokugawa Shogunate', region: 'Japan' },
            { name: 'Dutch Republic', region: 'Northwestern Europe' },
            { name: 'Portuguese Empire', region: 'Atlantic / Indian Ocean' },
            { name: 'Polish-Lithuanian Commonwealth', region: 'Eastern Europe' }
        ],
        gdpMin: 850, gdpMax: 2400,
        giniMin: 0.42, giniMax: 0.78,
        literacyMin: 12.0, literacyMax: 55.0,
        lifeExpMin: 28.0, lifeExpMax: 42.0,
        birthRateMin: 32.0, birthRateMax: 43.0,
        popDensityMin: 18.0, popDensityMax: 95.0,
        urbanRateMin: 8.0, urbanRateMax: 24.0
    },
    {
        key: 'modern',
        name: 'Modern Era',
        yearMin: 1800,
        yearMax: 1945,
        civilizations: [
            { name: 'British Empire (Industrial/Victorian)', region: 'Global' },
            { name: 'United States', region: 'North America' },
            { name: 'French Third Republic', region: 'Western Europe' },
            { name: 'German Empire / Weimar', region: 'Central Europe' },
            { name: 'Russian Empire / USSR', region: 'Eurasia' },
            { name: 'Empire of Japan (Meiji/Imperial)', region: 'East Asia' },
            { name: 'Late Qing & Republic of China', region: 'East Asia' },
            { name: 'Austro-Hungarian Empire', region: 'Central Europe' },
            { name: 'Late Ottoman Empire', region: 'Near East' },
            { name: 'Latin American Republics', region: 'South America' },
            { name: 'Kingdom of Italy', region: 'Southern Europe' }
        ],
        gdpMin: 1400, gdpMax: 7200,
        giniMin: 0.38, giniMax: 0.72,
        literacyMin: 30.0, literacyMax: 88.0,
        lifeExpMin: 35.0, lifeExpMax: 64.0,
        birthRateMin: 22.0, birthRateMax: 38.0,
        popDensityMin: 35.0, popDensityMax: 190.0,
        urbanRateMin: 16.0, urbanRateMax: 58.0
    },
    {
        key: 'contemporary',
        name: 'Contemporary Era',
        yearMin: 1945,
        yearMax: 2026,
        civilizations: [
            { name: 'United States', region: 'North America' },
            { name: 'European Union / Western Europe', region: 'Europe' },
            { name: 'USSR / Russian Federation', region: 'Eurasia' },
            { name: "People's Republic of China", region: 'East Asia' },
            { name: 'Japan', region: 'East Asia' },
            { name: 'Republic of India', region: 'South Asia' },
            { name: 'Latin America (Mercosur/Alliance)', region: 'Latin America' },
            { name: 'Middle East & North Africa (MENA)', region: 'Middle East' },
            { name: 'Sub-Saharan Africa', region: 'Africa' },
            { name: 'Southeast Asia (ASEAN)', region: 'Southeast Asia' },
            { name: 'Global Transnational Institutions', region: 'Global' }
        ],
        gdpMin: 3500, gdpMax: 48000,
        giniMin: 0.26, giniMax: 0.65,
        literacyMin: 65.0, literacyMax: 99.5,
        lifeExpMin: 55.0, lifeExpMax: 84.5,
        birthRateMin: 8.5, birthRateMax: 32.0,
        popDensityMin: 55.0, popDensityMax: 580.0,
        urbanRateMin: 38.0, urbanRateMax: 86.0
    }
];

const CATEGORIES = [
    'transformation',
    'collapse',
    'war',
    'revolution',
    'economic',
    'technological',
    'religious',
    'pandemic'
];

const ROLES = ['architect', 'catalyst', 'stabilizer', 'disruptor', 'wildcard'];
const DOMAINS = ['Political', 'Military', 'Religious', 'Scientific', 'Economic', 'Cultural'];

// Historical action verbs and archetypes for rich name generation
const EVENT_PATTERNS = {
    transformation: [
        'Constitutional Reorganization of', 'Bureaucratic Consolidation of', 'Administrative Codification of',
        'Imperial Unification of', 'Judicial Standard Reform in', 'Agrarian Restructuring of',
        'Treaty System Implementation across', 'Fiscal Modernization in', 'Educational Charter of'
    ],
    collapse: [
        'Institutional Dissolution of', 'Frontier Fragmentation of', 'Dynastic Disintegration of',
        'Palatial Collapse of', 'Fiscal Default Crisis in', 'Territorial Rupture of',
        'Systemic Governance Breakdown in', 'Decentralization Wave across'
    ],
    war: [
        'Frontier Campaign of', 'Succession Conflict of', 'Strategic Siege of',
        'Maritime Hegemony Clash in', 'Continental Standoff of', 'Imperial Annexation War in',
        'Coalition Defense of', 'Borderlands Pacification of'
    ],
    revolution: [
        'Peasant Rebellion against', 'Military Coup d’État in', 'Popular Uprising of',
        'Agrarian Insurgency in', 'Civic Restoration Revolt in', 'Radical Assembly Schism in',
        'Provincial Autonomy Insurgency against'
    ],
    economic: [
        'Grain Market Price Shock across', 'Silver Flotilla Currency Shock in', 'Guild Monopoly Reform in',
        'Maritime Trade Hub Expansion in', 'Canal Infrastructure Boom in', 'Debt Crisis Settlement of',
        'Mercantile Tariff Overhaul across'
    ],
    technological: [
        'Metallurgical Innovation Surge in', 'Astronomical Standardization by', 'Hydraulic Engineering Grid in',
        'Printing & Communications Diffusion in', 'Navigational Instrument Reform in', 'Mechanical Power Harnessing in',
        'Sanitation & Medical Breakthrough in'
    ],
    religious: [
        'Pantheon Reformation of', 'Synod Monotheistic Mandate in', 'Temple Bureaucracy Reorganization of',
        'Orthodoxy & Heresy Trial Wave in', 'Monastic Network Expansion of', 'Secular Legal Separation in'
    ],
    pandemic: [
        'Epidemic Fever Outbreak across', 'Caravan Route Pestilence in', 'Harbor Incursion Sickness in',
        'Agricultural Plague Wave in', 'Respiratory Virulence Wave across', 'Urban Quarantine Emergency in'
    ]
};

const CHARACTER_TITLES = {
    Political: ['Archon', 'Chancellor', 'Prefect', 'Minister', 'Consul', 'Viceroy', 'Governor', 'Senator', 'Vizier'],
    Military: ['General', 'Admiral', 'Marshal', 'Commander', 'Strategos', 'Warlord', 'Centurion', 'Legate'],
    Religious: ['High Priest', 'Patriarch', 'Synod Envoy', 'Cardinal', 'Pontiff', 'Abbess', 'Imam', 'Hierophant'],
    Scientific: ['Astronomer', 'Polymath', 'Arch-Engineer', 'Physician', 'Alchemist', 'Metallurgist', 'Geometer'],
    Economic: ['Merchant Prince', 'Guild Master', 'Treasurer', 'Chamberlain', 'Syndic', 'Mint Overseer', 'Customs Director'],
    Cultural: ['Chronicler', 'Philosopher', 'Poet Laureate', 'Dramatist', 'Rhetorician', 'Scribe', 'Master Sculptor']
};

const NAME_ROOTS = [
    'Alexander', 'Solon', 'Aurelius', 'Theodosius', 'Constantine', 'Justinian', 'Belisarius', 'Leonidas',
    'Khaldun', 'Al-Mansur', 'Harun', 'Tariq', 'Ibn-Sina', 'Saladin', 'Averroes', 'Nizam',
    'Wu', 'Li', 'Zhang', 'Song', 'Zhao', 'Gao', 'Sun', 'Chen', 'Qian', 'Cao',
    'Chandra', 'Ashoka', 'Kautilya', 'Harsha', 'Samudra', 'Vikram', 'Rajaraja', 'Dara',
    'Narmer', 'Imhotep', 'Mentuhotep', 'Thutmose', 'Ramesses', 'Hathor', 'Kheti', 'Seneb',
    'Hattusili', 'Suppiluliuma', 'Telepinu', 'Mursili', 'Labarna', 'Puduhepa',
    'Sargon', 'Rimush', 'Naram-Sin', 'Enheduanna', 'Hammurabi', 'Samsi-Adad', 'Tiglath',
    'Otto', 'Heinrich', 'Friedrich', 'Wilhelm', 'Valdemar', 'Godfrey', 'Baldwin', 'Eleanor',
    'Richelieu', 'Mazarin', 'Colbert', 'Talleyrand', 'Necker', 'Mirabeau', 'Lafayette',
    'Bradford', 'Franklin', 'Hamilton', 'Madison', 'Adams', 'Sherman', 'Sumner', 'Marshall'
];

function generateActorAttributes(role, prng) {
    let power, network, legitimacy, rationality, charisma, ideological, momentum, duration;
    switch (role) {
        case 'architect':
            power = prng.range(0.65, 0.92);
            network = prng.range(0.60, 0.88);
            legitimacy = prng.range(0.68, 0.90);
            rationality = prng.range(0.70, 0.92);
            charisma = prng.range(0.50, 0.78);
            ideological = prng.range(0.18, 0.45);
            momentum = prng.range(0.55, 0.82);
            duration = prng.rangeInt(24, 180);
            break;
        case 'catalyst':
            power = prng.range(0.50, 0.82);
            network = prng.range(0.65, 0.92);
            legitimacy = prng.range(0.45, 0.75);
            rationality = prng.range(0.55, 0.78);
            charisma = prng.range(0.72, 0.95);
            ideological = prng.range(0.45, 0.80);
            momentum = prng.range(0.70, 0.94);
            duration = prng.rangeInt(12, 60);
            break;
        case 'stabilizer':
            power = prng.range(0.58, 0.85);
            network = prng.range(0.55, 0.80);
            legitimacy = prng.range(0.72, 0.94);
            rationality = prng.range(0.68, 0.90);
            charisma = prng.range(0.45, 0.70);
            ideological = prng.range(0.12, 0.35);
            momentum = prng.range(0.40, 0.68);
            duration = prng.rangeInt(36, 240);
            break;
        case 'disruptor':
            power = prng.range(0.60, 0.95);
            network = prng.range(0.50, 0.85);
            legitimacy = prng.range(0.20, 0.52);
            rationality = prng.range(0.32, 0.65);
            charisma = prng.range(0.70, 0.95);
            ideological = prng.range(0.65, 0.95);
            momentum = prng.range(0.72, 0.96);
            duration = prng.rangeInt(6, 48);
            break;
        case 'wildcard':
        default:
            power = prng.range(0.40, 0.90);
            network = prng.range(0.35, 0.85);
            legitimacy = prng.range(0.15, 0.75);
            rationality = prng.range(0.20, 0.80);
            charisma = prng.range(0.20, 0.85);
            ideological = prng.range(0.15, 0.85);
            momentum = prng.range(0.40, 0.90);
            duration = prng.rangeInt(4, 72);
            break;
    }
    return {
        power_index: round(power),
        network_centrality: round(network),
        legitimacy: round(legitimacy),
        rationality: round(rationality),
        charisma: round(charisma),
        ideological_extremity: round(ideological),
        momentum: round(momentum),
        duration_of_influence_months: duration,
        historical_role: role,
        actor_volatility: round(clamp(ideological * 0.5 + (1 - rationality) * 0.5)),
        trigger_force: round(clamp(power * 0.6 + momentum * 0.4))
    };
}

// ─── Main Generator Execution ────────────────────────────────────────────────

async function generateAllDatasets() {
    console.log('================================================================');
    console.log('🚀 CTH FRAMEWORK v4.1 — MASTER DATASET GENERATION');
    console.log('   Target: 2,000 events + 2,000 characters per epoch (6 epochs)');
    console.log('   Total: 12,000 events + 12,000 characters');
    console.log('================================================================\n');

    mkdirSync(DATASET_DIR, { recursive: true });
    mkdirSync(join(DATASET_DIR, 'epochs'), { recursive: true });
    mkdirSync(join(DATASET_DIR, 'master'), { recursive: true });

    const adapter = new SnapshotAdapter();
    const predictor = new CTHMasterPredictorEngine();

    const allEventsMaster = [];
    const allCharactersMaster = [];
    const epochSummaries = [];

    const startTimeTotal = Date.now();

    for (let eIdx = 0; eIdx < EPOCHS.length; eIdx++) {
        const epoch = EPOCHS[eIdx];
        const epochDir = join(DATASET_DIR, 'epochs', epoch.key);
        mkdirSync(epochDir, { recursive: true });

        console.log(`\n⏳ [Epoch ${eIdx + 1}/6] Processing: ${epoch.name} (${epoch.key})`);
        const epochStartTime = Date.now();

        const epochEvents = [];
        const epochCharacters = [];

        // 1. Generate 2,000 Historical Characters for this epoch
        for (let i = 1; i <= 2000; i++) {
            const charId = `CHR-${epoch.key.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`;
            const domain = prng.choice(DOMAINS);
            const title = prng.choice(CHARACTER_TITLES[domain]);
            const rootName = prng.choice(NAME_ROOTS);
            const charName = `${title} ${rootName} of ${prng.choice(epoch.civilizations).name}`;
            const role = prng.choice(ROLES);
            const civ = prng.choice(epoch.civilizations);

            const activeStart = prng.rangeInt(epoch.yearMin, epoch.yearMax - 15);
            const activeEnd = Math.min(epoch.yearMax, activeStart + prng.rangeInt(5, 45));

            const actorAttr = generateActorAttributes(role, prng);

            // Compute Token Impact Score & TIMs with CTHTokenDynamicsEngine
            const tokenResult = new CTHTokenDynamicsEngine(actorAttr, POLICY_GENERAL).process();

            const charObj = {
                character_id: charId,
                name: charName,
                epoch: epoch.key,
                civilization: civ.name,
                region: civ.region,
                active_year_start: activeStart,
                active_year_end: activeEnd,
                primary_domain: domain,
                historical_role: role,
                associated_event_id: `EVT-${epoch.key.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`,
                power_index: actorAttr.power_index,
                network_centrality: actorAttr.network_centrality,
                legitimacy: actorAttr.legitimacy,
                rationality: actorAttr.rationality,
                charisma: actorAttr.charisma,
                ideological_extremity: actorAttr.ideological_extremity,
                momentum: actorAttr.momentum,
                duration_of_influence_months: actorAttr.duration_of_influence_months,
                actor_volatility: actorAttr.actor_volatility,
                trigger_force: actorAttr.trigger_force,
                token_impact_score_tis: tokenResult.token_impact_score,
                tim_foundation: tokenResult.multipliers.foundation,
                tim_dynamics: tokenResult.multipliers.dynamics,
                tim_chaos: tokenResult.multipliers.chaos,
                mule_clause_risk: tokenResult.token_impact_score >= 0.75
            };

            epochCharacters.push(charObj);
            allCharactersMaster.push(charObj);
        }

        // 2. Generate 2,000 Historical Events for this epoch with CTH calculations
        for (let i = 1; i <= 2000; i++) {
            const evtId = `EVT-${epoch.key.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`;
            const category = prng.choice(CATEGORIES);
            const civ = prng.choice(epoch.civilizations);
            const pattern = prng.choice(EVENT_PATTERNS[category]);
            const eventName = `${pattern} ${civ.name}`;
            const year = prng.rangeInt(epoch.yearMin, epoch.yearMax);
            const actor = epochCharacters[i - 1]; // linked character

            // ─── Sub-metrics for E, S, A, P dimensions ───────────────────────
            // 1. Historical Epoch (E)
            const gdpUsd = round(prng.range(epoch.gdpMin, epoch.gdpMax), 1);
            const gini = round(prng.range(epoch.giniMin, epoch.giniMax), 3);
            const polDensity = round(prng.range(0.10, 0.90), 3);
            const normGdp = clamp((gdpUsd - epoch.gdpMin) / (epoch.gdpMax - epoch.gdpMin));
            const scoreE = round(clamp(normGdp * 0.40 + (1 - gini) * 0.30 + (1 - polDensity) * 0.30));

            // 2. Social Range (S)
            const incomeScore = round(prng.range(0.20, 0.85), 3);
            const literacyPct = round(prng.range(epoch.literacyMin, epoch.literacyMax), 1);
            const scoreS = round(clamp(incomeScore * 0.50 + (literacyPct / 100) * 0.50));

            // 3. Age Range (A)
            const lifeExp = round(prng.range(epoch.lifeExpMin, epoch.lifeExpMax), 1);
            const birthRate = round(prng.range(epoch.birthRateMin, epoch.birthRateMax), 1);
            const normLife = clamp((lifeExp - 20) / 65);
            const scoreA = round(clamp(normLife * 0.70 + (birthRate / 50) * 0.30));

            // 4. Population Range (P)
            const popDensity = round(prng.range(epoch.popDensityMin, epoch.popDensityMax), 1);
            const urbanRate = round(prng.range(epoch.urbanRateMin, epoch.urbanRateMax), 1);
            const normPopD = clamp(Math.log10(Math.max(1, popDensity)) / 3.0);
            const scoreP = round(clamp(normPopD * 0.50 + (urbanRate / 100) * 0.50));

            // Base CTH composite
            const baseCTH = (scoreE + scoreS + scoreA + scoreP) / 4.0;

            // Phase Trajectory & DeltaCTH based on category
            let deltaCTH, blackSwan;
            let cthBefore, cthPrelude, cthDuring, cthTransition, cthAfter;

            switch (category) {
                case 'collapse':
                    deltaCTH = round(prng.range(-0.45, -0.18));
                    blackSwan = round(prng.range(0.40, 0.85));
                    cthBefore = round(clamp(baseCTH + prng.range(0.05, 0.15)));
                    cthPrelude = round(clamp(cthBefore - prng.range(0.05, 0.12)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.20, 0.40)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.02, 0.10)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'transformation':
                    deltaCTH = round(prng.range(0.10, 0.35));
                    blackSwan = round(prng.range(0.10, 0.40));
                    cthBefore = round(clamp(baseCTH - prng.range(0.05, 0.12)));
                    cthPrelude = round(clamp(cthBefore + prng.range(0.02, 0.08)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.05, 0.15))); // temporary reorganization dip
                    cthTransition = round(clamp(cthDuring + prng.range(0.12, 0.25)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'war':
                    deltaCTH = round(prng.range(-0.30, 0.15));
                    blackSwan = round(prng.range(0.30, 0.70));
                    cthBefore = round(clamp(baseCTH + prng.range(-0.05, 0.08)));
                    cthPrelude = round(clamp(cthBefore - prng.range(0.04, 0.12)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.15, 0.35)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.05, 0.20)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'revolution':
                    deltaCTH = round(prng.range(-0.35, 0.20));
                    blackSwan = round(prng.range(0.35, 0.80));
                    cthBefore = round(clamp(baseCTH + prng.range(-0.02, 0.10)));
                    cthPrelude = round(clamp(cthBefore - prng.range(0.08, 0.18)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.20, 0.40)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.10, 0.28)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'technological':
                    deltaCTH = round(prng.range(0.12, 0.38));
                    blackSwan = round(prng.range(0.15, 0.50));
                    cthBefore = round(clamp(baseCTH - prng.range(0.04, 0.10)));
                    cthPrelude = round(clamp(cthBefore + prng.range(0.02, 0.06)));
                    cthDuring = round(clamp(cthPrelude + prng.range(0.04, 0.12)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.06, 0.16)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'economic':
                    deltaCTH = round(prng.range(-0.25, 0.20));
                    blackSwan = round(prng.range(0.25, 0.65));
                    cthBefore = round(clamp(baseCTH + prng.range(-0.05, 0.08)));
                    cthPrelude = round(clamp(cthBefore - prng.range(0.02, 0.10)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.10, 0.28)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.05, 0.18)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'pandemic':
                    deltaCTH = round(prng.range(-0.38, 0.05));
                    blackSwan = round(prng.range(0.60, 0.95));
                    cthBefore = round(clamp(baseCTH + prng.range(0.02, 0.10)));
                    cthPrelude = round(clamp(cthBefore - prng.range(0.02, 0.08)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.25, 0.50)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.10, 0.25)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
                case 'religious':
                default:
                    deltaCTH = round(prng.range(-0.15, 0.25));
                    blackSwan = round(prng.range(0.20, 0.55));
                    cthBefore = round(clamp(baseCTH + prng.range(-0.05, 0.05)));
                    cthPrelude = round(clamp(cthBefore + prng.range(-0.04, 0.08)));
                    cthDuring = round(clamp(cthPrelude - prng.range(0.08, 0.20)));
                    cthTransition = round(clamp(cthDuring + prng.range(0.05, 0.18)));
                    cthAfter = round(clamp(cthBefore + deltaCTH));
                    break;
            }

            const cthGlobal = round((cthBefore + cthPrelude + cthDuring + cthTransition + cthAfter) / 5.0);

            // Feed into CTH SnapshotAdapter
            const rawSpec = {
                id: evtId,
                year,
                political_stability: scoreE,
                economic_stability: scoreS,
                social_cohesion: scoreA,
                delta_cth: deltaCTH,
                black_swan: blackSwan,
                phases: {
                    before: cthBefore,
                    prelude: cthPrelude,
                    during: cthDuring,
                    transition: cthTransition,
                    after: cthAfter
                },
                actor: {
                    power_index: actor.power_index,
                    network_centrality: actor.network_centrality,
                    legitimacy: actor.legitimacy,
                    rationality: actor.rationality,
                    charisma: actor.charisma,
                    ideological_extremity: actor.ideological_extremity,
                    momentum: actor.momentum,
                    historical_role: actor.historical_role,
                    duration_of_influence: actor.duration_of_influence_months
                }
            };

            const canonicalInput = adapter.adapt(rawSpec);
            const predictionResult = await predictor.predictEvent(canonicalInput, POLICY_GENERAL);

            const eveiVal = canonicalInput.macro_context.evei_average;
            const synth = predictionResult.synthesis;
            const engines = predictionResult.engines;

            const eventObj = {
                event_id: evtId,
                name: eventName,
                year,
                epoch: epoch.key,
                category,
                region: civ.region,
                civilization: civ.name,
                primary_actor_id: actor.character_id,

                // Dimension E: Historical Epoch
                gdp_per_capita_usd: gdpUsd,
                gini_inequality: gini,
                political_event_density: polDensity,
                historical_epoch_score_E: scoreE,

                // Dimension S: Social Range
                average_income_score: incomeScore,
                literacy_rate_pct: literacyPct,
                social_range_score_S: scoreS,

                // Dimension A: Age Range
                life_expectancy_years: lifeExp,
                birth_rate_per_1000: birthRate,
                age_range_score_A: scoreA,

                // Dimension P: Population Range
                population_density_sqkm: popDensity,
                urbanization_rate_pct: urbanRate,
                population_range_score_P: scoreP,

                // Tetrasociohistorical Trajectory & Indices
                cth_before: cthBefore,
                cth_prelude: cthPrelude,
                cth_during: cthDuring,
                cth_transition: cthTransition,
                cth_after: cthAfter,
                cth_global: cthGlobal,
                delta_cth: deltaCTH,
                black_swan_index: blackSwan,
                evei: eveiVal,

                // Engine Syntheses & Predictions
                ultra_cth: synth.ultraCTH,
                prediction: synth.rmd_prediction ? 'RMD' : 'CMN',
                certainty_bracket: synth.certainty_bracket,
                alphabreak: synth.alphabreak,
                recommend_anchor: synth.recommend_anchor,
                foundation_risk: engines.foundation.overallFoundationRisk,
                dynamics_risk: engines.dynamics.overallDynamicsRisk,
                chaos_risk: engines.chaos.overallChaosShieldRisk,
                temporal_risk: engines.temporal.temporalRisk,
                butterfly_risk: engines.butterfly.overallRisk,
                mule_clause_active: synth.mule_clause.token_dominant
            };

            epochEvents.push(eventObj);
            allEventsMaster.push(eventObj);

            if (i % 500 === 0) {
                process.stdout.write(`    ↳ Calculated ${i}/2000 events in ${epoch.name}...\n`);
            }
        }

        // 3. Write Epoch files (CSV & JSON)
        writeCSV(join(epochDir, 'events.csv'), epochEvents);
        writeJSON(join(epochDir, 'events.json'), epochEvents);

        writeCSV(join(epochDir, 'characters.csv'), epochCharacters);
        writeJSON(join(epochDir, 'characters.json'), epochCharacters);

        const epochDuration = ((Date.now() - epochStartTime) / 1000).toFixed(1);
        console.log(`  ✅ Epoch complete in ${epochDuration}s (saved 2,000 events + 2,000 characters to ${epochDir})`);

        // Compute summary metrics for this epoch
        const rmdCount = epochEvents.filter(e => e.prediction === 'RMD').length;
        const avgUltraCTH = epochEvents.reduce((a, b) => a + b.ultra_cth, 0) / epochEvents.length;
        const avgDeltaCTH = epochEvents.reduce((a, b) => a + b.delta_cth, 0) / epochEvents.length;
        const avgEVEI = epochEvents.reduce((a, b) => a + b.evei, 0) / epochEvents.length;

        epochSummaries.push({
            epoch_key: epoch.key,
            epoch_name: epoch.name,
            year_range: `${epoch.yearMin} to ${epoch.yearMax}`,
            event_count: epochEvents.length,
            character_count: epochCharacters.length,
            rmd_transformations: rmdCount,
            cmn_collapses: epochEvents.length - rmdCount,
            mean_ultra_cth: round(avgUltraCTH),
            mean_delta_cth: round(avgDeltaCTH),
            mean_evei: round(avgEVEI)
        });
    }

    // 4. Write Master Tables (CSV & JSON)
    console.log('\n💾 Writing master unified dataset tables...');
    writeCSV(join(DATASET_DIR, 'master', 'all_events.csv'), allEventsMaster);
    writeCSV(join(DATASET_DIR, 'master', 'all_characters.csv'), allCharactersMaster);

    const summaryReport = {
        title: 'CTH Framework Universal Historical Pre-Calculated Dataset',
        schema_version: '4.1',
        generation_timestamp: new Date().toISOString(),
        total_events: allEventsMaster.length,
        total_characters: allCharactersMaster.length,
        total_epochs: EPOCHS.length,
        epochs: epochSummaries
    };

    writeJSON(join(DATASET_DIR, 'master', 'dataset_summary.json'), summaryReport);

    const totalSeconds = ((Date.now() - startTimeTotal) / 1000).toFixed(1);
    console.log(`\n🎉 SUCCESS! Generated ${allEventsMaster.length} events and ${allCharactersMaster.length} characters in ${totalSeconds}s.`);
    console.log(`   Location: ${DATASET_DIR}`);
}

// ─── CSV & JSON Helpers ──────────────────────────────────────────────────────

function writeCSV(filePath, rows) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(h => {
            const val = row[h];
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(','))
    ].join('\n') + '\n';
    writeFileSync(filePath, csvContent, 'utf-8');
}

function writeJSON(filePath, data) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

generateAllDatasets().catch(err => {
    console.error('❌ Error generating dataset:', err);
    process.exit(1);
});
