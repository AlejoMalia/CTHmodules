/**
 * historical-demo.js
 * Ejecutar: node historical-demo.js
 *
 * Cuatro eventos históricos reales procesados con CTH v4.1.
 * Muestra: predicciones individuales, cadena causal con decaimiento,
 * cláusula Mule, y comparación inter-policy.
 */

import { CTHAIBridge, PassthroughAdapter } from './cth-bridge.js';
import POLICY from './cth-policy-schema.js';
import { POLICY_GENERAL, POLICY_GEOPOLITICAL, POLICY_ECONOMIC, POLICY_TECHNOLOGICAL, POLICY_REVOLUTIONARY } from './cth-policy-variants.js';

// ─── Helpers de display ───────────────────────────────────────────────────────

const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', white: '\x1b[37m'
};

function header(text) {
    const line = '─'.repeat(70);
    console.log(`\n${C.bold}${C.cyan}${line}${C.reset}`);
    console.log(`${C.bold}${C.white}  ${text}${C.reset}`);
    console.log(`${C.bold}${C.cyan}${line}${C.reset}\n`);
}

function section(text) {
    console.log(`${C.bold}${C.yellow}▸ ${text}${C.reset}`);
}

function kv(label, value, color = C.white) {
    const pad = label.padEnd(32, ' ');
    console.log(`  ${C.dim}${pad}${C.reset}${color}${value}${C.reset}`);
}

function printPrediction(name, result) {
    const s  = result.prediction;
    const e  = result.engines;
    const ml = s.mule_clause;

    section(name);

    // Resultado principal
    const rmdColor   = s.rmd ? C.green  : C.red;
    const abColor    = s.alphabreak ? C.red : C.green;
    kv('Predicción (RMD/CMN)',    s.rmd ? '● RMD — Renovación/Transformación' : '● CMN — Declive/Estancamiento', rmdColor);
    kv('ultraCTH',               s.ultraCTH.toFixed(6), s.ultraCTH > 0.82 ? C.green : C.yellow);
    kv('Certeza (bracket)',      s.certainty_bracket,  C.cyan);
    kv('Alphabreak total',       s.alphabreak ? '⚡ SÍ' : '— No', abColor);
    kv('Anchor recomendado',     s.recommend_anchor ? '🔒 Activar' : '— No necesario', s.recommend_anchor ? C.yellow : C.green);

    // Motores
    console.log('');
    kv('Riesgo Fundación',       e.foundation_risk?.toFixed(4) ?? 'n/a',    e.foundation_risk > 0.68 ? C.red : C.green);
    kv('Riesgo Temporal',        e.temporal_risk?.toFixed(4)   ?? 'n/a',    e.temporal_risk   > 0.65 ? C.red : C.green);
    kv('Riesgo Dinámico',        e.dynamics_risk?.toFixed(4)   ?? 'n/a',    e.dynamics_risk   > 0.68 ? C.red : C.green);
    kv('Riesgo Caos/Resiliencia',e.chaos_shield_risk?.toFixed(4) ?? 'n/a', e.chaos_shield_risk > 0.68 ? C.red : C.green);
    kv('Riesgo Mariposa',        e.butterfly_risk?.toFixed(4)  ?? 'n/a',    e.butterfly_risk  > 0.65 ? C.red : C.green);
    kv('Vulnerabilidad Análisis',e.analytical_vulnerability?.toFixed(4) ?? 'n/a', e.analytical_vulnerability > 0.68 ? C.red : C.green);

    // Trajectory signal
    const trajDelta = result.engines?.foundation?.cthProfile?.deltaCTH_Total;
    if (trajDelta != null) {
        const trajColor = trajDelta > 0 ? C.green : C.red;
        kv('Trayectoria CTH (Δtotal)', `${trajDelta > 0 ? '+' : ''}${trajDelta.toFixed(4)}  (bonus ${trajDelta > 0 ? '+' : ''}${(trajDelta * 0.38).toFixed(4)})`, trajColor);
    }

    // Token Dynamics Engine
    console.log('');
    const td = e.token_dynamics;
    if (td) {
        const roleColor = { disruptor: C.red, catalyst: C.yellow, stabilizer: C.green, architect: C.green, wildcard: C.yellow }[td.historical_role] ?? C.white;
        kv('Token rol histórico',  td.historical_role.toUpperCase(), roleColor);
        kv('Token Impact Score',   td.token_impact_score.toFixed(4), td.token_impact_score > 0.6 ? C.red : td.token_impact_score < 0.4 ? C.green : C.yellow);
        kv('TIM Foundation',       `×${td.multipliers.foundation}`, td.multipliers.foundation > 1 ? C.red : C.green);
        kv('TIM Dynamics',         `×${td.multipliers.dynamics}`,   td.multipliers.dynamics   > 1 ? C.red : C.green);
        kv('TIM Chaos',            `×${td.multipliers.chaos}`,      td.multipliers.chaos      > 1 ? C.red : C.green);
    }

    // Cláusula Mule
    console.log('');
    if (ml.token_dominant) {
        kv('⚠  Cláusula Mule', `ACTIVA — ratio token/macro: ${ml.token_to_macro_ratio}`, C.red);
        kv('   Causa', 'Actor individual domina el sistema. Predicción macro degradada.', C.red);
    } else {
        kv('Cláusula Mule',    `— Inactiva (ratio ${ml.token_to_macro_ratio})`, C.dim);
    }

    // Reflexividad
    if (s.reflexivity.observation_loop > 0) {
        kv('Penalización reflexividad', `−${s.reflexivity.penalty.toFixed(4)} (loop=${s.reflexivity.observation_loop})`, C.yellow);
    }

    // Herencia causal
    if (result.causal_inheritance) {
        const ci = result.causal_inheritance;
        kv('Herencia causal',   `stress=${ci.stress} | decaído=${ci.decayed} | factor_decay=${ci.decay_factor ?? '—'}`, C.magenta);
    }

    kv('Hash (primeros 20)',  result.hash.slice(0, 20) + '...', C.dim);
    console.log('');
}

// ─── Policy alternativo: enfoque sociológico ──────────────────────────────────
// Pondera más el caos/resiliencia y menos la fundación estructural.
// Representa una escuela de análisis que prioriza la cohesión social.

const POLICY_SOCIOLOGICAL = {
    ...POLICY,
    version: 'sociological-v1',
    synthesis: {
        ...POLICY.synthesis,
        weights: {
            foundation:  0.10,   // menos peso a la base estructural
            analysis:    0.12,
            dynamics:    0.20,
            temporal:    0.22,
            chaos:       0.24,   // el caos/resiliencia es el eje
            butterfly:   0.12
        }
    }
};

// ─── Datos históricos ─────────────────────────────────────────────────────────

const FRENCH_REVOLUTION_1789 = {
    id: 'REV-FRANCE-1789',
    macro_context: {
        // Indicadores sistémicos
        cth_global:      0.58,   // sistema frágil — crisis fiscal, Estates-General
        evei_average:    0.87,   // impacto máximo — transformación total del orden
        blackSwanIndex:  0.42,   // radicalización del Terror no anticipada
        deltaCTH:       -0.31,   // caída brusca de cohesión histórica
        indicatorA:      0.45,   // estabilidad política: muy baja (quiebra del Estado)
        indicatorB:      0.38,   // estabilidad económica: crítica (bancarrota real)
        indicatorC:      0.62,   // cohesión social: media (hay movimiento organizado)

        // Métricas extendidas
        extendedMetrics: {
            IEC: 0.28,   // cohesión institucional extremadamente baja
            PPI: 0.74,   // poder predictivo alto — los signos eran claros
            VVC: 0.71    // volatilidad de valor alta — los ideales cambian cada mes
        },

        // Fases de CTH a lo largo del evento
        phasesCTH: {
            before:     0.76,   // Ancien Régime — superficie estable
            prelude:    0.65,   // convocatoria Estates-General — grietas visibles
            during:     0.28,   // Terror — colapso institucional
            transition: 0.41,   // Termidor — recomposición violenta
            after:      0.55    // Consulado napoleónico — nueva estabilidad
        },

        // Factores externos (inputs para blindspot detector)
        externalFactors: {
            american_revolution_inspiration: 0.45,
            fiscal_crisis_royal:             0.88,
            famine_1788:                     0.71,
            enlightenment_ideology:          0.62
        },

        // Butterfly Field Engine
        event_valuation_structure: 95,   // EVEI 0-100
        context_series: [0.76, 0.71, 0.58, 0.28, 0.55],
        delta_series:   [-0.05, -0.13, -0.30, 0.27],
        black_swan_factor: 0.42,
        mechanics: { action: 0.65, reaction: 0.28, result: 0.07 },

        triphasic: {
            before:  { evei: 0.55, cth: 0.76 },
            prelude: { evei: 0.72, cth: 0.65 },
            during:  { evei: 0.95, cth: 0.28 }
        },
        pentaphasic: {
            models: [{ name: 'Feudal Collapse Pattern', cth_signature: 0.30 }]
        },
        supraphasic: {
            rtis: [
                { power: 0.92, persistence: 0.88 },  // influencia ilustrada
                { power: 0.78, persistence: 0.94 }   // momentum económico
            ]
        },

        // Analysis Engine
        fh_evei: 0.89,   // EVEI histórico factual
        fe_evei: 0.82,   // EVEI estructural estimado

        // Temporal Engine
        historical_analogs: {
            count: 47,
            avg_contextual_difference: 0.082   // distancia contextual media con análogos
        },

        // Constructores (actores-token relevantes)
        constructors: [
            { name: 'Maximilien Robespierre', evei: 0.85, influence_factor: 1.40, cth_at_event: 0.28 },
            { name: 'Napoleon Bonaparte',      evei: 0.91, influence_factor: 1.60, cth_at_event: 0.55 },
            { name: 'Tercer Estado',           evei: 0.72, influence_factor: 1.20, cth_at_event: 0.45 }
        ]
    },
    token_instance: {
        // Legacy compact fields (backward compat)
        actor_volatility:      0.78,
        trigger_force:         0.82,
        // Rich token fields (Phase E.25)
        power_index:           0.72,   // Robespierre: poder real durante el Terror
        network_centrality:    0.70,   // red jacobina
        legitimacy:            0.28,   // legitimidad muy baja — el Terror la destruyó
        rationality:           0.38,   // ideológicamente impulsado, errático
        charisma:              0.81,   // orador extraordinario
        ideological_extremity: 0.91,   // extremismo revolucionario máximo
        historical_role:       'disruptor',
        momentum:              0.78,   // en ascenso durante el Terror
        duration_of_influence: 5,      // meses de influencia peak (Terror)
        causal_parent_id:      null
    },
    observation_loop: 0.92
};

// ─────────────────────────────────────────────────────────────────────────────

const RUSSIAN_REVOLUTION_1917 = {
    id: 'REV-RUSSIA-1917',
    macro_context: {
        cth_global:      0.52,
        evei_average:    0.85,
        blackSwanIndex:  0.38,   // Lenin regresa en tren sellado — parcialmente inesperado
        deltaCTH:       -0.28,
        indicatorA:      0.41,   // Rusia zarista — estado institucional colapsado por WWI
        indicatorB:      0.35,   // economía destruida por guerra
        indicatorC:      0.58,

        extendedMetrics: { IEC: 0.31, PPI: 0.68, VVC: 0.74 },

        phasesCTH: {
            before:     0.68,   // Rusia tardía zarista — estabilidad superficial
            prelude:    0.55,   // Febrero 1917 — primera revolución
            during:     0.31,   // Octubre 1917 — toma bolchevique
            transition: 0.38,   // Guerra Civil
            after:      0.51    // NEP y consolidación soviética
        },
        externalFactors: {
            wwi_exhaustion:            0.91,
            february_revolution_shock: 0.75,
            german_financing_lenin:    0.48,
            food_crisis:               0.82
        },

        event_valuation_structure: 92,
        context_series: [0.68, 0.62, 0.52, 0.31, 0.51],
        delta_series:   [-0.06, -0.10, -0.21, 0.20],
        black_swan_factor: 0.38,
        mechanics: { action: 0.58, reaction: 0.31, result: 0.11 },

        triphasic: {
            before:  { evei: 0.51, cth: 0.68 },
            prelude: { evei: 0.71, cth: 0.55 },
            during:  { evei: 0.92, cth: 0.31 }
        },
        pentaphasic: {
            models: [{ name: 'Feudal Collapse Pattern', cth_signature: 0.31 }]
        },
        supraphasic: {
            rtis: [
                { power: 0.88, persistence: 0.85 },
                { power: 0.71, persistence: 0.92 }
            ]
        },

        fh_evei: 0.87,
        fe_evei: 0.79,

        historical_analogs: {
            count: 38,
            avg_contextual_difference: 0.071
        },

        constructors: [
            { name: 'Vladimir Lenin',    evei: 0.91, influence_factor: 1.70, cth_at_event: 0.31 },
            { name: 'Leon Trotsky',      evei: 0.82, influence_factor: 1.45, cth_at_event: 0.35 },
            { name: 'Partido Bolchevique', evei: 0.75, influence_factor: 1.30, cth_at_event: 0.38 }
        ]
    },
    token_instance: {
        actor_volatility:      0.88,
        trigger_force:         0.91,
        power_index:           0.88,   // Lenin: dominancia total del partido
        network_centrality:    0.84,   // bolcheviques: red disciplinada y centralizada
        legitimacy:            0.22,   // legitimidad mínima — golpe de Estado
        rationality:           0.74,   // Lenin era estratégico y frío, muy racional
        charisma:              0.83,
        ideological_extremity: 0.92,   // marxismo-leninismo dogmático
        historical_role:       'disruptor',
        momentum:              0.91,   // impulso creciente 1917–1920
        duration_of_influence: 7,      // años (1917–1924)
        causal_parent_id:      null
    },
    observation_loop: 0.71
};

// ─────────────────────────────────────────────────────────────────────────────

const BLACK_DEATH_1347 = {
    id: 'PANDEMIC-BLACK-DEATH-1347',
    macro_context: {
        cth_global:      0.44,   // Europa medieval — golpe demográfico sin precedentes
        evei_average:    0.93,   // 30-60% de mortalidad europea
        blackSwanIndex:  0.91,   // evento completamente no anticipado
        deltaCTH:       -0.38,
        indicatorA:      0.52,   // estabilidad política: media (instituciones sobreviven)
        indicatorB:      0.40,   // economía: colapso de mano de obra
        indicatorC:      0.35,   // cohesión social: quiebra (flagelantes, pogromos)

        extendedMetrics: { IEC: 0.38, PPI: 0.52, VVC: 0.85 },

        phasesCTH: {
            before:     0.72,   // Europa medieval estable
            prelude:    0.61,   // llegada a Sicilia — alarma temprana
            during:     0.22,   // fase pandémica — colapso
            transition: 0.35,   // recurrencias — inestabilidad crónica
            after:      0.55    // paradoja: supervivientes mejor pagados, proto-renacimiento
        },
        externalFactors: {
            trade_routes_spread:    0.88,
            medical_ignorance:      0.95,
            church_credibility_loss: 0.72,
            mongol_empire_carrier:  0.61
        },

        event_valuation_structure: 98,   // máximo impacto estructural
        context_series: [0.72, 0.65, 0.44, 0.22, 0.55],
        delta_series:   [-0.07, -0.21, -0.22, 0.33],
        black_swan_factor: 0.91,
        mechanics: { action: 0.12, reaction: 0.71, result: 0.17 },   // evento pasivo — reacción social es lo que importa

        triphasic: {
            before:  { evei: 0.45, cth: 0.72 },
            prelude: { evei: 0.68, cth: 0.61 },
            during:  { evei: 0.98, cth: 0.22 }
        },
        pentaphasic: {
            models: [{ name: 'Demographic Collapse Pattern', cth_signature: 0.25 }]
        },
        supraphasic: {
            rtis: [{ power: 0.85, persistence: 0.91 }]
        },

        fh_evei: 0.95,
        fe_evei: 0.88,

        historical_analogs: {
            count: 12,   // pocos análogos — evento único en escala
            avg_contextual_difference: 0.155
        },

        constructors: [
            { name: 'Yersinia pestis (agente)',  evei: 0.99, influence_factor: 2.00, cth_at_event: 0.22 },
            { name: 'Rutas comerciales genovesas', evei: 0.71, influence_factor: 1.30, cth_at_event: 0.44 }
        ]
    },
    token_instance: {
        actor_volatility:      0.05,
        trigger_force:         0.95,
        power_index:           0.02,   // la bacteria no tiene "poder" social
        network_centrality:    0.01,
        legitimacy:            0.00,
        rationality:           0.00,
        charisma:              0.00,
        ideological_extremity: 0.00,
        historical_role:       'wildcard',   // catástrofe sin agencia intencional
        momentum:              0.88,         // la pandemia se propagaba rápido
        duration_of_influence: 4,            // años de fase aguda (1347–1351)
        causal_parent_id:      null
    },
    observation_loop: 0.18
};

// ─────────────────────────────────────────────────────────────────────────────

const FALL_OF_ROME_410_476 = {
    id: 'FALL-WESTERN-ROME-410-476',
    macro_context: {
        cth_global:      0.41,   // declive institucional acumulado durante siglos
        evei_average:    0.79,   // transformación civilizatoria — no instantánea
        blackSwanIndex:  0.28,   // parcialmente predecible (crisis del s.III, migraciones)
        deltaCTH:       -0.22,
        indicatorA:      0.38,   // autoridad imperial: fragmentada, múltiples usurpadores
        indicatorB:      0.45,   // economía: devaluación, comercio reducido
        indicatorC:      0.52,   // cohesión: legiones aún funcionan, pero con foederati

        extendedMetrics: { IEC: 0.42, PPI: 0.61, VVC: 0.58 },

        phasesCTH: {
            before:     0.78,   // Alto Imperio — Pax Romana
            prelude:    0.62,   // Crisis del siglo III — primera fractura
            during:     0.38,   // Saqueo 410, deposición 476
            transition: 0.34,   // reinos germánicos emergentes
            after:      0.41    // Bizancio hereda, Occidente fragmentado
        },
        externalFactors: {
            hunnic_pressure:       0.81,
            internal_usurpations:  0.74,
            mercenary_army_drift:  0.68,
            christian_church_shift: 0.45
        },

        event_valuation_structure: 84,
        context_series: [0.78, 0.68, 0.52, 0.38, 0.41],
        delta_series:   [-0.10, -0.16, -0.14, 0.03],
        black_swan_factor: 0.28,
        mechanics: { action: 0.35, reaction: 0.42, result: 0.23 },

        triphasic: {
            before:  { evei: 0.42, cth: 0.78 },
            prelude: { evei: 0.61, cth: 0.62 },
            during:  { evei: 0.84, cth: 0.38 }
        },
        pentaphasic: {
            models: [{ name: 'Imperial Overextension Pattern', cth_signature: 0.40 }]
        },
        supraphasic: {
            rtis: [
                { power: 0.71, persistence: 0.95 },   // legado institucional largo
                { power: 0.62, persistence: 0.88 }
            ]
        },

        fh_evei: 0.81,
        fe_evei: 0.75,

        historical_analogs: {
            count: 23,
            avg_contextual_difference: 0.118
        },

        constructors: [
            { name: 'Odoacro (deposición final)',  evei: 0.68, influence_factor: 1.20, cth_at_event: 0.38 },
            { name: 'Atila (presión externa)',     evei: 0.82, influence_factor: 1.50, cth_at_event: 0.41 },
            { name: 'Estilicón (defensa tardía)',  evei: 0.61, influence_factor: 1.10, cth_at_event: 0.45 }
        ]
    },
    token_instance: {
        actor_volatility:      0.35,
        trigger_force:         0.48,
        power_index:           0.42,   // Odoacro: poder regional, no imperial
        network_centrality:    0.38,   // foederati: redes dispersas
        legitimacy:            0.52,   // alguna legitimidad dentro del ejército
        rationality:           0.61,
        charisma:              0.44,
        ideological_extremity: 0.28,   // no hubo ideología radical — declive gradual
        historical_role:       'catalyst',   // aceleró un colapso ya en marcha
        momentum:              0.48,
        duration_of_influence: 66,     // años (410–476) — proceso largo
        causal_parent_id:      null
    },
    observation_loop: 0.08
};

// ─── Eventos de contraste: transformaciones gestionadas ───────────────────────
// Estos eventos representan el polo opuesto: cambio dirigido, baja fractura.
// El modelo debe producir ultraCTH alto → RMD.

const AMERICAN_CONSTITUTIONAL_CONVENTION_1787 = {
    id: 'USA-CONSTITUTIONAL-CONVENTION-1787',
    macro_context: {
        // El CTH es moderado-alto y SUBE durante el proceso (inversion de patrón)
        cth_global:      0.71,
        evei_average:    0.68,   // impacto alto pero no catastrófico
        blackSwanIndex:  0.19,   // el proceso constitucional era anticipado
        deltaCTH:        0.14,   // delta positivo — el sistema cohesiona, no colapsa
        indicatorA:      0.66,   // estabilidad política: alta (Convención legítima)
        indicatorB:      0.59,   // economía: limitada pero funcional post-Confederación
        indicatorC:      0.72,   // cohesión social: alta dentro de los Framers

        extendedMetrics: { IEC: 0.68, PPI: 0.71, VVC: 0.35 },

        // Patrón ascendente — el CTH SUBE durante el proceso (raro, muy positivo)
        phasesCTH: {
            before:     0.52,   // Artículos de la Confederación — debilidad institucional
            prelude:    0.61,   // debate Annapolis → llamado a Convención
            during:     0.70,   // Philadelphia — máxima cohesión constitucional
            transition: 0.73,   // proceso de ratificación — tensión pero funcional
            after:      0.78    // Constitución ratificada — nueva estabilidad institucional
        },

        externalFactors: {
            shays_rebellion_pressure: 0.55,   // amenaza moderada que aceleró el proceso
            british_trade_rivalry:    0.41,
            enlightenment_philosophy: 0.68,
            colonial_legal_tradition: 0.74
        },

        event_valuation_structure: 72,
        context_series: [0.52, 0.61, 0.70, 0.73, 0.78],
        delta_series:   [0.09, 0.09, 0.03, 0.05],   // deltas positivos
        black_swan_factor: 0.19,
        mechanics: { action: 0.72, reaction: 0.18, result: 0.10 },   // acción deliberada domina

        triphasic: {
            before:  { evei: 0.38, cth: 0.52 },
            prelude: { evei: 0.52, cth: 0.61 },
            during:  { evei: 0.74, cth: 0.70 }
        },
        pentaphasic: {
            models: [{ name: 'Institutional Consolidation Pattern', cth_signature: 0.72 }]
        },
        supraphasic: {
            rtis: [
                { power: 0.68, persistence: 0.92 },   // federalismo como RTI duradero
                { power: 0.61, persistence: 0.88 }
            ]
        },

        fh_evei: 0.70,
        fe_evei: 0.66,

        historical_analogs: {
            count: 31,   // varios análogos: Gloriosa 1688, Suiza 1291, etc.
            avg_contextual_difference: 0.092
        },

        constructors: [
            { name: 'James Madison',     evei: 0.81, influence_factor: 1.50, cth_at_event: 0.70 },
            { name: 'Alexander Hamilton', evei: 0.74, influence_factor: 1.35, cth_at_event: 0.73 },
            { name: 'Benjamin Franklin', evei: 0.69, influence_factor: 1.20, cth_at_event: 0.70 }
        ],
        adaptive_capacity: 0.75   // alta capacidad adaptativa — el sistema fue diseñado con mecanismos de enmienda
    },
    token_instance: {
        actor_volatility:      0.38,
        trigger_force:         0.55,
        // Rich fields
        power_index:           0.72,   // Madison, Hamilton: poder institucional alto
        network_centrality:    0.82,   // red de Framers muy conectada (cartas, Federalist Papers)
        legitimacy:            0.91,   // máxima legitimidad — representantes electos
        rationality:           0.92,   // Madison: uno de los más racionales en la historia política
        charisma:              0.68,
        ideological_extremity: 0.22,   // moderados, buscan consenso, no extremismo
        historical_role:       'architect',   // diseñaron explícitamente el sistema
        momentum:              0.68,
        duration_of_influence: 10,     // años de impacto constitucional directo
        // Legacy (used by mule clause fallback)
        network_density:       0.81,
        legitimacy_index:      0.88,
        causal_parent_id:      null
    },
    observation_loop: 0.42
};

// ─────────────────────────────────────────────────────────────────────────────

const MEIJI_RESTORATION_1868 = {
    id: 'MEIJI-RESTORATION-1868',
    macro_context: {
        cth_global:      0.68,
        evei_average:    0.73,
        blackSwanIndex:  0.27,   // la presión occidental era anticipada desde Perry 1853
        deltaCTH:        0.11,   // ligero delta positivo — modernización dirigida
        indicatorA:      0.62,   // poder imperial restaurado — autoridad clara
        indicatorB:      0.55,   // economía en transición acelerada
        indicatorC:      0.60,   // cohesión: tensión con samurai pero consenso en élites

        extendedMetrics: { IEC: 0.64, PPI: 0.68, VVC: 0.42 },

        // Patrón con caída mínima y recuperación rápida
        phasesCTH: {
            before:     0.62,   // Japón Tokugawa — estabilidad artificial bajo sakoku
            prelude:    0.55,   // crisis post-Perry — cuestionamiento del Shogunato
            during:     0.63,   // restauración Meiji — tensión pero dirección clara
            transition: 0.70,   // reformas institucionales (educación, ejército, industria)
            after:      0.78    // Japón moderno — nueva estabilidad de alta coherencia
        },

        externalFactors: {
            western_imperialist_pressure: 0.71,
            commodore_perry_shock:        0.65,
            unequal_treaties:             0.68,
            chinese_defeat_1842:          0.55   // la caída de China como aviso
        },

        event_valuation_structure: 77,
        context_series: [0.62, 0.58, 0.63, 0.70, 0.78],
        delta_series:   [-0.04, 0.05, 0.07, 0.08],   // caída mínima, recuperación fuerte
        black_swan_factor: 0.27,
        mechanics: { action: 0.68, reaction: 0.24, result: 0.08 },

        triphasic: {
            before:  { evei: 0.42, cth: 0.62 },
            prelude: { evei: 0.60, cth: 0.55 },
            during:  { evei: 0.75, cth: 0.63 }
        },
        pentaphasic: {
            models: [{ name: 'Directed Modernization Pattern', cth_signature: 0.68 }]
        },
        supraphasic: {
            rtis: [
                { power: 0.74, persistence: 0.91 },   // imperialismo como RTI externo
                { power: 0.69, persistence: 0.88 }
            ]
        },

        fh_evei: 0.75,
        fe_evei: 0.69,

        historical_analogs: {
            count: 19,
            avg_contextual_difference: 0.108
        },

        constructors: [
            { name: 'Emperador Meiji',     evei: 0.72, influence_factor: 1.30, cth_at_event: 0.63 },
            { name: 'Okubo Toshimichi',   evei: 0.68, influence_factor: 1.25, cth_at_event: 0.70 },
            { name: 'Yamagata Aritomo',   evei: 0.64, influence_factor: 1.15, cth_at_event: 0.70 }
        ],
        adaptive_capacity: 0.78   // alta: el sistema Meiji fue explícitamente diseñado para adaptarse al Oeste
    },
    token_instance: {
        actor_volatility:      0.33,
        trigger_force:         0.52,
        // Rich fields
        power_index:           0.70,   // oligarcas Meiji: poder real sobre el proceso
        network_centrality:    0.75,   // red muy cohesionada entre reformadores
        legitimacy:            0.87,   // legitimidad imperial: altísima en cultura japonesa
        rationality:           0.84,   // Okubo, Yamagata: pragmáticos, no ideólogos
        charisma:              0.62,
        ideological_extremity: 0.32,   // modernizadores pragmáticos, no fanáticos
        historical_role:       'architect',   // diseño deliberado del Japón moderno
        momentum:              0.74,
        duration_of_influence: 45,     // años (1868–1912, era Meiji)
        // Legacy
        network_density:       0.74,
        legitimacy_index:      0.82,
        causal_parent_id:      null
    },
    observation_loop: 0.38
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    header('CTHmodules v4.1 — Demo con Datos Históricos Reales');

    const bridge = new CTHAIBridge();
    const adapter = new PassthroughAdapter();

    // Política con decaimiento causal (half_life = 50 años)
    const POLICY_WITH_DECAY = {
        ...POLICY,
        version: 'reference-with-decay-50y',
        causal_inheritance: {
            ...POLICY.causal_inheritance,
            half_life: 50   // en años — mismo estudio de caso que los eventos
        }
    };

    // ── Registrar todos los eventos ──────────────────────────────────────────

    await bridge.registerContext('REV-FRANCE-1789',           FRENCH_REVOLUTION_1789,              POLICY_WITH_DECAY, { adapter });
    await bridge.registerContext('PANDEMIC-BLACK-DEATH-1347', BLACK_DEATH_1347,                    POLICY,            { adapter });
    await bridge.registerContext('FALL-WESTERN-ROME-410-476', FALL_OF_ROME_410_476,                POLICY,            { adapter });
    await bridge.registerContext('USA-CONSTITUTIONAL-1787',   AMERICAN_CONSTITUTIONAL_CONVENTION_1787, POLICY,        { adapter });
    await bridge.registerContext('MEIJI-RESTORATION-1868',    MEIJI_RESTORATION_1868,              POLICY,            { adapter });

    // Revolución Rusa como hija causal de la Francesa (128 años después)
    await bridge.registerContext('REV-RUSSIA-1917', RUSSIAN_REVOLUTION_1917, POLICY_WITH_DECAY, {
        adapter,
        causal_parent_id:  'REV-FRANCE-1789',
        time_since_parent: 128
    });

    // ── Hook: registrar cada predicción ─────────────────────────────────────
    const predictions_log = [];
    bridge.on('prediction', ({ event_id, synthesis, hash }) => {
        predictions_log.push({ event_id, ultraCTH: synthesis.ultraCTH, hash: hash.slice(0, 12) });
    });

    // ── 1. Revolución Francesa ────────────────────────────────────────────────
    header('1 / 6  —  Revolución Francesa (1789) — Crisis ruptura');
    const r_france = await bridge.runFullPrediction('REV-FRANCE-1789');
    printPrediction('Revolución Francesa 1789', r_france);

    // ── 2. Muerte Negra ──────────────────────────────────────────────────────
    header('2 / 6  —  Muerte Negra (1347–1351) — Colapso demográfico');
    const r_plague = await bridge.runFullPrediction('PANDEMIC-BLACK-DEATH-1347');
    printPrediction('Muerte Negra 1347', r_plague);

    // ── 3. Caída de Roma ─────────────────────────────────────────────────────
    header('3 / 6  —  Caída del Imperio Romano Occidental (410–476) — Declive estructural');
    const r_rome = await bridge.runFullPrediction('FALL-WESTERN-ROME-410-476');
    printPrediction('Caída de Roma 410–476', r_rome);

    // ── 4. Revolución Rusa (herencia causal) ─────────────────────────────────
    header('4 / 6  —  Revolución Rusa (1917) — Cadena causal desde 1789');
    const r_russia = await bridge.runFullPrediction('REV-RUSSIA-1917');
    printPrediction('Revolución Rusa 1917', r_russia);
    if (r_russia.causal_inheritance) {
        const ci = r_russia.causal_inheritance;
        section('Anatomía del decaimiento causal');
        kv('Evento padre',          'Revolución Francesa 1789', C.magenta);
        kv('Distancia temporal',    '128 años', C.white);
        kv('Half-life configurado', '50 años (policy.causal_inheritance.half_life)', C.white);
        kv('Factor de decaimiento', `2^(-128/50) ≈ ${ci.decay_factor}`, C.cyan);
        kv('Stress heredado final', ci.stress.toFixed(4), C.yellow);
        console.log('');
    }

    // ── 5. Convención Constitucional americana ───────────────────────────────
    header('5 / 6  —  Convención Constitucional Americana (1787) — Transformación gestionada');
    const r_usa = await bridge.runFullPrediction('USA-CONSTITUTIONAL-1787');
    printPrediction('Convención Constitucional 1787', r_usa);

    // ── 6. Restauración Meiji ────────────────────────────────────────────────
    header('6 / 6  —  Restauración Meiji (1868) — Modernización dirigida');
    const r_meiji = await bridge.runFullPrediction('MEIJI-RESTORATION-1868');
    printPrediction('Restauración Meiji 1868', r_meiji);

    // ── 7. Calibración con corpus parcial ────────────────────────────────────
    header('Calibración — calibrate() sobre corpus de 3 eventos con outcome conocido');
    section('Los outcomes observados son los ultraCTH "reales" según valoración histórica');
    console.log('');

    const CALIBRATION_CORPUS = [
        { input: { ...FRENCH_REVOLUTION_1789, id: 'cal-france' },                        observed_outcome: 0.38, category: 'revolution' },
        { input: { ...RUSSIAN_REVOLUTION_1917, id: 'cal-russia' },                        observed_outcome: 0.35, category: 'revolution' },
        { input: { ...AMERICAN_CONSTITUTIONAL_CONVENTION_1787, id: 'cal-usa' },           observed_outcome: 0.78, category: 'transformation' },
        { input: { ...MEIJI_RESTORATION_1868, id: 'cal-meiji' },                          observed_outcome: 0.72, category: 'transformation' },
        { input: { ...FALL_OF_ROME_410_476, id: 'cal-rome' },                             observed_outcome: 0.41, category: 'decline' }
    ];

    try {
        const calibResult = await bridge.calibrate(CALIBRATION_CORPUS, POLICY, POLICY);
        section('Error de predicción por evento:');
        for (const r of calibResult.per_event) {
            const errColor = r.error > 0.15 ? C.red : r.error > 0.08 ? C.yellow : C.green;
            const dirStr   = r.correct_direction ? `${C.green}✓ dir${C.reset}` : `${C.red}✗ dir${C.reset}`;
            kv(`  ${r.id}`, `pred=${r.predicted.toFixed(4)}  obs=${r.observed}  err=${r.error.toFixed(4)}  ${dirStr}`, errColor);
        }
        console.log('');
        kv('  MAE',                  calibResult.MAE.toFixed(4),                  calibResult.MAE   > 0.15 ? C.red : C.green);
        kv('  RMSE',                 calibResult.RMSE.toFixed(4),                 calibResult.RMSE  > 0.18 ? C.red : C.green);
        kv('  Brier Score',          calibResult.brier_score.toFixed(4),          calibResult.brier_score > 0.05 ? C.yellow : C.green);
        kv('  Directional Accuracy', `${(calibResult.directional_accuracy*100).toFixed(1)}%`, calibResult.directional_accuracy < 0.6 ? C.red : C.green);
        if (calibResult.by_category) {
            console.log('');
            section('Por categoría:');
            for (const [cat, stats] of Object.entries(calibResult.by_category)) {
                kv(`  ${cat}`, `n=${stats.count}  MAE=${stats.MAE}`, stats.MAE > 0.15 ? C.red : C.yellow);
            }
        }
        console.log('');
    } catch(e) {
        console.log(`  ${C.red}Error en calibración: ${e.message}${C.reset}\n`);
    }

    // ── 8. Sensitivity Analysis — qué pesos de synthesis afectan más el MAE ────
    header('Sensitivity Analysis — impacto de cada peso en synthesis.weights sobre el MAE');
    try {
        const sens = await bridge.sensitivityAnalysis(CALIBRATION_CORPUS, POLICY, { delta: 0.05 });
        kv('  MAE baseline', sens.baseline_MAE.toFixed(4), C.white);
        kv('  delta aplicado', `±${sens.delta}`, C.dim);
        console.log('');
        // Sort by absolute sensitivity
        const sorted = Object.entries(sens.sensitivities).sort((a, b) => Math.abs(b[1].sensitivity ?? 0) - Math.abs(a[1].sensitivity ?? 0));
        for (const [path, data] of sorted) {
            const shortPath = path.replace('synthesis.weights.', '');
            const sens_val  = data.sensitivity ?? 0;
            const sensColor = Math.abs(sens_val) > 0.1 ? C.red : Math.abs(sens_val) > 0.03 ? C.yellow : C.green;
            kv(`  ${shortPath.padEnd(12)}`, `val=${data.original_value.toFixed(3)}  sensitividad=${sens_val > 0 ? '+' : ''}${sens_val?.toFixed(4) ?? '—'}`, sensColor);
        }
        console.log(`\n  ${C.dim}Sensitividad positiva → subir el peso empeora el MAE (sobrepesa esa dimensión).${C.reset}`);
        console.log(`  ${C.dim}Sensitividad negativa → subir el peso mejora el MAE.${C.reset}\n`);
    } catch(e) {
        console.log(`  ${C.red}Error en sensitivity: ${e.message}${C.reset}\n`);
    }

    // ── 9. Optimización automática de policy ────────────────────────────────────
    header('Policy Optimization — hill-climbing sobre synthesis.weights (20 iteraciones)');
    try {
        const optResult = await bridge.optimizePolicy(CALIBRATION_CORPUS, POLICY, { iterations: 20 });
        kv('  MAE inicial',    optResult.initial_MAE.toFixed(4), C.white);
        kv('  MAE optimizado', optResult.best_MAE.toFixed(4),    optResult.best_MAE < optResult.initial_MAE ? C.green : C.yellow);
        kv('  Mejora',         optResult.improvement > 0 ? `−${optResult.improvement.toFixed(4)}` : '0 (mínimo local)', optResult.improvement > 0 ? C.green : C.dim);
        console.log('');
        section('Pesos optimizados vs originales:');
        const orig = optResult.original_weights;
        const opt  = optResult.optimized_weights;
        for (const key of Object.keys(orig)) {
            const diff = opt[key] - orig[key];
            const diffStr = `${diff > 0 ? '+' : ''}${diff.toFixed(4)}`;
            const color   = Math.abs(diff) > 0.02 ? C.yellow : C.dim;
            kv(`  ${key.padEnd(12)}`, `${orig[key].toFixed(4)} → ${opt[key].toFixed(4)}  (${diffStr})`, color);
        }
        console.log('');
    } catch(e) {
        console.log(`  ${C.red}Error en optimización: ${e.message}${C.reset}\n`);
    }

    // ── 10. Comparación inter-policy: Referencia vs Sociológico ──────────────
    header('Comparación inter-policy — Rev. Francesa: framework estructural vs sociológico');
    try {
        const comparison = await bridge.compare(FRENCH_REVOLUTION_1789, [POLICY, POLICY_SOCIOLOGICAL]);
        for (const run of comparison.runs) {
            kv(`  Policy: ${run.policy_version}`, `ultraCTH = ${run.synthesis.ultraCTH.toFixed(6)}   hash[:12] = ${run.hash.slice(0,12)}`, C.white);
        }
        const discColor = comparison.max_discrepancy > 0.05 ? C.red : C.green;
        kv('\n  Discrepancia máxima',
           `${comparison.max_discrepancy.toFixed(4)} ${comparison.max_discrepancy > 0.05 ? '← desacuerdo significativo entre escuelas' : '← frameworks alineados'}`, discColor);
        console.log('');
    } catch(e) {
        console.log(`  ${C.red}Error en comparación: ${e.message}${C.reset}\n`);
    }

    // ── 11. Tabla comparativa final — 6 eventos ──────────────────────────────
    header('Tabla comparativa — 6 eventos (CMN → RMD)');
    const all_events = [
        { name: 'Rev. Rusa 1917',           r: r_russia, tipo: 'Ruptura causal' },
        { name: 'Rev. Francesa 1789',       r: r_france, tipo: 'Ruptura'        },
        { name: 'Muerte Negra 1347',        r: r_plague, tipo: 'Colapso demo.'  },
        { name: 'Caída de Roma 476',        r: r_rome,   tipo: 'Declive struct.' },
        { name: 'Conv. Constitucional 1787',r: r_usa,    tipo: 'Transformación' },
        { name: 'Restauración Meiji 1868',  r: r_meiji,  tipo: 'Modernización'  }
    ].sort((a, b) => a.r.prediction.ultraCTH - b.r.prediction.ultraCTH);

    const colW = 26;
    const hdr = ['Evento'.padEnd(colW), 'Tipo'.padEnd(16), 'ultraCTH'.padEnd(10), 'RMD'.padEnd(6), 'Rol Token'.padEnd(12), 'TIS'.padEnd(6), 'Mule'].join('  ');
    console.log(`  ${C.bold}${C.white}${hdr}${C.reset}`);
    console.log(`  ${'─'.repeat(98)}`);

    for (const { name, r, tipo } of all_events) {
        const s       = r.prediction;
        const td      = r.engines?.token_dynamics;
        const rmdStr  = s.rmd ? `${C.green}● RMD${C.reset}` : `${C.red}● CMN${C.reset}`;
        const muleStr = s.mule_clause.token_dominant ? `${C.red}⚠ SÍ${C.reset}` : `${C.dim}—${C.reset}`;
        const ultraColor  = s.ultraCTH > 0.65 ? C.green : s.ultraCTH > 0.50 ? C.yellow : C.red;
        const roleColor   = { disruptor: C.red, catalyst: C.yellow, stabilizer: C.green, architect: C.green, wildcard: C.yellow }[td?.historical_role] ?? C.white;
        const roleStr     = td?.historical_role?.padEnd(12) ?? '—'.padEnd(12);
        const tisStr      = td ? td.token_impact_score.toFixed(3) : '—';
        console.log(`  ${name.padEnd(colW)}  ${tipo.padEnd(16)}  ${ultraColor}${s.ultraCTH.toFixed(6)}${C.reset}${''.padEnd(2)}  ${rmdStr.padEnd(14)}  ${roleColor}${roleStr}${C.reset}  ${tisStr}  ${muleStr}`);
    }
    console.log('');

    // Log de hashes
    console.log(`  ${C.dim}Hashes de predicción (SHA-256 verificable):${C.reset}`);
    for (const entry of predictions_log.slice(0, 6)) {
        console.log(`  ${C.dim}${entry.event_id.padEnd(40)} ultraCTH=${entry.ultraCTH.toFixed(4)}  hash=${entry.hash}...${C.reset}`);
    }
    console.log('');

    // ── 12. Matriz multi-policy — 3 eventos × 4 políticas especializadas ─────────
    header('Matriz Multi-Policy — mismo evento, diferentes lentes analíticos');
    section('3 eventos analizados con las 4 policies especializadas de cth-policy-variants.js');
    console.log('');

    const MULTI_POLICY_EVENTS = [
        { id: 'mp-usa',   label: 'Conv. Constitucional 1787', data: AMERICAN_CONSTITUTIONAL_CONVENTION_1787 },
        { id: 'mp-france',label: 'Rev. Francesa 1789',        data: FRENCH_REVOLUTION_1789 },
        { id: 'mp-meiji', label: 'Restauración Meiji 1868',   data: MEIJI_RESTORATION_1868 }
    ];

    const VARIANT_POLICIES = [
        { key: 'General',        policy: POLICY_GENERAL },
        { key: 'Geopolítico',    policy: POLICY_GEOPOLITICAL },
        { key: 'Económico',      policy: POLICY_ECONOMIC },
        { key: 'Tecnológico',    policy: POLICY_TECHNOLOGICAL },
        { key: 'Revolucionario', policy: POLICY_REVOLUTIONARY }
    ];

    // Bridge dedicado para la matriz (sin contextos previos)
    const mpBridge = new CTHAIBridge();

    // Cabecera de la tabla
    const policyColW = 13;
    const eventColW  = 28;
    const mpHdr = ['Evento'.padEnd(eventColW), ...VARIANT_POLICIES.map(p => p.key.padEnd(policyColW))].join('  ');
    console.log(`  ${C.bold}${C.white}${mpHdr}${C.reset}`);
    console.log(`  ${'─'.repeat(eventColW + 2 + VARIANT_POLICIES.length * (policyColW + 2))}`);

    for (const evt of MULTI_POLICY_EVENTS) {
        const scores = [];
        for (const vp of VARIANT_POLICIES) {
            // Registrar con id único por (evento × policy)
            const ctxId = `${evt.id}-${vp.key}`;
            await mpBridge.registerContext(ctxId, evt.data, vp.policy, { adapter });
            const res = await mpBridge.runFullPrediction(ctxId, vp.policy);
            scores.push(res.prediction.ultraCTH);
        }
        const row = scores.map((s, i) => {
            const color = s > 0.65 ? C.green : s > 0.50 ? C.yellow : C.red;
            const rmd   = s > VARIANT_POLICIES[i].policy.synthesis.prediction_threshold ? '●' : '○';
            return `${color}${rmd}${s.toFixed(4)}${C.reset}`.padEnd(policyColW + 14);
        });
        console.log(`  ${evt.label.padEnd(eventColW)}  ${row.join('  ')}`);
    }

    console.log('');
    console.log(`  ${C.dim}● = RMD (ultraCTH > threshold)   ○ = CMN${C.reset}`);
    console.log(`  ${C.dim}Cada policy puede cambiar el veredicto — el mismo evento bajo distinto lente analítico.${C.reset}\n`);

    console.log(`${C.bold}${C.cyan}${'─'.repeat(70)}${C.reset}`);
    console.log(`${C.bold}  Para cambiar los valores: editá los objetos históricos en este archivo.`);
    console.log(`  Para cambiar los pesos: editá cth-policy-schema.js o creá tu propio Policy.${C.reset}`);
    console.log(`${C.bold}${C.cyan}${'─'.repeat(70)}${C.reset}\n`);
}

main().catch(err => {
    console.error('\x1b[31m[ERROR]\x1b[0m', err.message);
    process.exit(1);
});
