"""
CTH-CORE.PY — v4.1 (Universal Kernel)
Author: Alejo Malia | CTHmodules.cc

Zero embedded domain data. No defaults, no labels, no NLP, no opinions.
All numeric values, weights, thresholds, and simulation parameters come from Policy.
All output labels are status keys — translation to display strings is caller responsibility.

Input contract:  { id, macro_context, token_instance, epoch_descriptor? }
Policy contract: see validate_policy() / REQUIRED_POLICY_PATHS
Output contract: { schema_version, event_id, engines, synthesis, hash, _audit }
"""

import math
import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

SCHEMA_VERSION = "4.1"
CANONICAL_DIMENSIONS = ['HistoricalEpoch', 'SocialRange', 'AgeRange', 'PopulationRange']
CANONICAL_PHASES     = ['before', 'prelude', 'during', 'transition', 'after']

# ─── Utilities ────────────────────────────────────────────────────────────────

def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    try:
        return max(lo, min(hi, float(v)))
    except (TypeError, ValueError):
        return lo

def _path(obj: Any, dot: str) -> Any:
    for key in dot.split('.'):
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj

def _set_path(obj: Any, dot: str, value: Any) -> None:
    keys = dot.split('.')
    for key in keys[:-1]:
        if not isinstance(obj.get(key), dict):
            obj[key] = {}
        obj = obj[key]
    obj[keys[-1]] = value

def deterministic_noise(seed1: float, seed2: float, scale: float) -> float:
    """Deterministic perturbation — no random.random(). Identical inputs → identical output."""
    return scale * math.sin(seed1 * 1000.73 + seed2 * 7.19)

def compute_hash(input_data: Dict, policy: Dict, synthesis_output: Dict) -> str:
    payload = json.dumps({
        'input_id':         input_data.get('id'),
        'macro_context':    input_data.get('macro_context'),
        'token_instance':   input_data.get('token_instance'),
        'epoch_descriptor': input_data.get('epoch_descriptor'),
        'policy_version':   policy.get('version', 'unversioned'),
        'synthesis':        synthesis_output
    }, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()

# ─── Policy Validation ────────────────────────────────────────────────────────

REQUIRED_POLICY_PATHS = [
    'synthesis.weights.foundation', 'synthesis.weights.analysis', 'synthesis.weights.dynamics',
    'synthesis.weights.temporal', 'synthesis.weights.chaos', 'synthesis.weights.butterfly',
    'synthesis.prediction_threshold', 'synthesis.alphabreak_threshold',
    'synthesis.recommendation_threshold', 'synthesis.certainty_brackets',
    'synthesis.nSim_deep_zoom', 'synthesis.deep_zoom_noise_scale',
    'synthesis.deep_zoom_clamp', 'synthesis.deep_zoom_center', 'synthesis.deep_zoom_triggers',
    'foundation.nSim', 'foundation.noise_scale',
    'foundation.indicator_weights.CTH', 'foundation.indicator_weights.A',
    'foundation.indicator_weights.B',   'foundation.indicator_weights.C',
    'foundation.risk_weights.cth', 'foundation.risk_weights.evei', 'foundation.risk_weights.black_swan',
    'foundation.alphabreak_threshold', 'foundation.hedge_threshold',
    'foundation.phase_estimation_factor', 'foundation.inference_floor',
    'temporal.phases',
    'temporal.analog_variance_range', 'temporal.pantemporal_threshold',
    'temporal.et_scale_factor', 'temporal.et_no_disparity_threshold', 'temporal.et_moderate_threshold',
    'temporal.risk_weights.et', 'temporal.risk_weights.pantemporal',
    'temporal.risk_weights.pentaphasic', 'temporal.risk_weights.zenith',
    'temporal.alphabreak_threshold', 'temporal.critical_inflection_threshold', 'temporal.rmd_threshold',
    'temporal.triphasic_weights.cth', 'temporal.triphasic_weights.evei',
    'temporal.pentaphasic_weights.cth', 'temporal.pentaphasic_weights.evei',
    'temporal.pentaphasic_weights.black_swan', 'temporal.supraphasic_multiplier',
    'temporal.pentaphasic_low_threshold', 'temporal.pentaphasic_high_risk', 'temporal.pentaphasic_low_risk',
    'temporal.zenith_during_risk', 'temporal.zenith_other_risk',
    'temporal.outcome_factors.transition_win', 'temporal.outcome_factors.transition_default',
    'temporal.outcome_factors.after_win',      'temporal.outcome_factors.after_default',
    'dynamics.nSim_black_swan', 'dynamics.nSim_spectrum', 'dynamics.nSim_butterfly',
    'dynamics.cmn_rmd_weights.evei', 'dynamics.cmn_rmd_weights.iec',
    'dynamics.cmn_rmd_weights.ppi',  'dynamics.cmn_rmd_weights.vvc',
    'dynamics.cmn_rmd_weights.mce',  'dynamics.cmn_rmd_weights.delta_cth',
    'dynamics.risk_weights.var', 'dynamics.risk_weights.pcn',
    'dynamics.risk_weights.rmd', 'dynamics.risk_weights.butterfly_div',
    'dynamics.alphabreak_threshold', 'dynamics.hedge_threshold',
    'dynamics.black_swan.tail_av', 'dynamics.black_swan.tail_tf',
    'dynamics.black_swan.wave_freq',
    'dynamics.black_swan.phase_av', 'dynamics.black_swan.phase_tf',
    'dynamics.black_swan.phase_sum', 'dynamics.black_swan.phase_u',
    'dynamics.black_swan.p_base', 'dynamics.black_swan.h_base',
    'dynamics.black_swan.e_base', 'dynamics.black_swan.o_base',
    'dynamics.black_swan.p_range', 'dynamics.black_swan.h_range',
    'dynamics.black_swan.e_range', 'dynamics.black_swan.o_range',
    'dynamics.black_swan.cross_scalar',
    'dynamics.black_swan.w_p', 'dynamics.black_swan.w_h',
    'dynamics.black_swan.w_e', 'dynamics.black_swan.w_o',
    'dynamics.pcn.ppi_weight', 'dynamics.pcn.iec_factor', 'dynamics.pcn.vvc_weight', 'dynamics.pcn.normalization',
    'dynamics.spectrum.amplitude_base', 'dynamics.spectrum.bs_amplitude_factor',
    'dynamics.spectrum.av_weight', 'dynamics.spectrum.tf_weight',
    'dynamics.spectrum.noise_freq', 'dynamics.spectrum.noise_phase_av', 'dynamics.spectrum.noise_phase_tf',
    'dynamics.spectrum.prelude_threshold', 'dynamics.spectrum.during_threshold', 'dynamics.spectrum.after_threshold',
    'dynamics.butterfly_analysis.base_scale', 'dynamics.butterfly_analysis.av_weight',
    'dynamics.butterfly_analysis.tf_weight',  'dynamics.butterfly_analysis.bs_multiplier',
    'dynamics.butterfly_analysis.noise_freq',
    'dynamics.butterfly_analysis.noise_phase_av', 'dynamics.butterfly_analysis.noise_phase_tf',
    'dynamics.butterfly_analysis.period_mod', 'dynamics.butterfly_analysis.period_scale',
    'dynamics.butterfly_analysis.alert_threshold',
    'chaos.risk_weights.entropy', 'chaos.risk_weights.eri',
    'chaos.risk_weights.blindspots', 'chaos.risk_weights.polarization', 'chaos.risk_weights.fatigue',
    'chaos.alphabreak_threshold', 'chaos.hedge_threshold', 'chaos.resonance_multiplier',
    'chaos.eri.base', 'chaos.eri.recovery_factor', 'chaos.eri.shock_factor',
    'chaos.blindspot.alert_threshold', 'chaos.blindspot.adjustment_factor',
    'chaos.polarization.delta_factor', 'chaos.polarization.bs_factor',
    'chaos.fatigue_multiplier',
    'chaos.valley.threshold', 'chaos.valley.reversion_factor', 'chaos.valley.normal_factor',
    'chaos.noise.scale', 'chaos.noise.bs_modifier', 'chaos.noise.hedge_threshold',
    'chaos.bivariate.rho_base', 'chaos.bivariate.rho_spread',
    'chaos.bivariate.multiplier', 'chaos.bivariate.revolution_threshold',
    'butterfly_field.nSim_causal', 'butterfly_field.nSim_risk',
    'butterfly_field.ip_threshold',
    'butterfly_field.stability_thresholds.absolute_anchor',
    'butterfly_field.stability_thresholds.structural_constant',
    'butterfly_field.stability_thresholds.trend_inertia',
    'butterfly_field.verdict_thresholds.gpc',
    'butterfly_field.field_constants.wBefore', 'butterfly_field.field_constants.wPrelude',
    'butterfly_field.field_constants.wDuring', 'butterfly_field.field_constants.alpha',
    'butterfly_field.field_constants.beta',    'butterfly_field.field_constants.eta',
    'butterfly_field.greeks.delta', 'butterfly_field.greeks.gamma', 'butterfly_field.greeks.lambda',
    'butterfly_field.alphabreak_threshold',
    'butterfly_field.risk_weights.iec', 'butterfly_field.risk_weights.vvc',
    'butterfly_field.risk_weights.mce', 'butterfly_field.risk_weights.ppi',
    'butterfly_field.risk_weights.divergence',
    'butterfly_field.high_volatility_threshold',
    'butterfly_field.pee_base', 'butterfly_field.pee_verdict_threshold',
    'butterfly_field.die_threshold', 'butterfly_field.die_exponent',
    'butterfly_field.somatic_resonance_threshold',
    'analysis.nSim',
    'analysis.extended_ranges.iec_base', 'analysis.extended_ranges.iec_range',
    'analysis.extended_ranges.ppi_base', 'analysis.extended_ranges.ppi_range',
    'analysis.extended_ranges.vvc_base', 'analysis.extended_ranges.vvc_range',
    'analysis.extended_ranges.mce_base', 'analysis.extended_ranges.mce_range',
    'analysis.extended_ranges.iig_base', 'analysis.extended_ranges.iig_range',
    'analysis.risk_weights.cth', 'analysis.risk_weights.evei',
    'analysis.risk_weights.ppi', 'analysis.risk_weights.vvc',
    'analysis.alphabreak_threshold',
    'analysis.margin_weights.macro.cth', 'analysis.margin_weights.macro.evei', 'analysis.margin_weights.macro.fp',
    'analysis.margin_weights.micro.cth', 'analysis.margin_weights.micro.evei', 'analysis.margin_weights.micro.fp',
    'mule_clause.token_dominance_threshold',
    'population_modulation.min_population_for_full_certainty',
    'reflexivity.max_certainty_penalty',
    'synthesis.trajectory_bonus', 'synthesis.reported_delta_bonus',
    'token_dynamics.weights.power', 'token_dynamics.weights.network',
    'token_dynamics.weights.charisma', 'token_dynamics.weights.momentum',
    'token_dynamics.weights.ideological', 'token_dynamics.weights.anti_legitimacy',
    'token_dynamics.weights.anti_rationality',
    'token_dynamics.duration_normalization', 'token_dynamics.sensitivity',
    'token_dynamics.multiplier_clamp',
]

def validate_policy(policy: Dict) -> None:
    if not isinstance(policy, dict):
        raise ValueError('[CTH] Policy must be a non-null dict.')
    missing = [p for p in REQUIRED_POLICY_PATHS if _path(policy, p) is None]
    if missing:
        raise ValueError(
            f'[CTH] Policy validation failed — {len(missing)} required field(s) missing:\n' +
            '\n'.join(f'  - {p}' for p in missing)
        )

def require_input(obj: Dict, field: str, context: str) -> Any:
    if obj is None or field not in obj or obj[field] is None:
        raise ValueError(f'[CTH] Required input field "{field}" missing in {context}.')
    return obj[field]

# ─── Engine 1: Foundation ─────────────────────────────────────────────────────

class CTHCoreFoundationEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data = data
        self.p    = policy['foundation']
        self.cth_global      = require_input(data, 'cth_global',   'macro_context')
        self.evei_average    = require_input(data, 'evei_average', 'macro_context')
        self.black_swan_index = float(data.get('blackSwanIndex', 0))
        self.delta_cth       = float(data.get('deltaCTH', 0))
        ti = data.get('token_instance') if isinstance(data.get('token_instance'), dict) else {}
        self._av = clamp(ti.get('actor_volatility', 0))
        self._tf = clamp(ti.get('trigger_force', 0))

    def _infer_phase_data(self) -> Tuple[Dict, List]:
        audit, prev = [], self.cth_global
        completed = {}
        for idx, phase in enumerate(CANONICAL_PHASES):
            phase_data = self.data.get(phase, {})
            raw_score, inferred = 0.0, []
            for dim in CANONICAL_DIMENSIONS:
                val = phase_data.get(dim)
                if val is None:
                    val = prev * 100 + deterministic_noise(prev, idx, 20)
                    inferred.append(dim)
                raw_score += clamp((val - 0) / 100)
            cth = raw_score / len(CANONICAL_DIMENSIONS)
            trend = (cth - prev) / prev if prev != 0 else (1.0 if cth > 0 else 0.0)
            if cth < self.p['inference_floor']:
                cth = clamp(prev * (1 + trend * (idx * self.p['phase_estimation_factor'])))
                audit.append({'phase': phase, 'action': 'estimated', 'reason': f'below inference_floor ({self.p["inference_floor"]})'})
            if inferred:
                audit.append({'phase': phase, 'inferred_dimensions': inferred})
            completed[phase] = round(cth, 4)
            prev = cth
        return completed, audit

    def _calculate_evei(self) -> Dict:
        indicator_a = require_input(self.data, 'indicatorA', 'macro_context')
        indicator_b = require_input(self.data, 'indicatorB', 'macro_context')
        indicator_c = require_input(self.data, 'indicatorC', 'macro_context')
        w    = self.p['indicator_weights']
        sum_w = w['CTH'] + w['A'] + w['B'] + w['C']
        base = (self.cth_global * w['CTH'] + indicator_a * w['A'] + indicator_b * w['B'] + indicator_c * w['C']) / sum_w
        results = sorted(
            clamp(base + deterministic_noise(i + self._av, self._tf + 1, self.p['noise_scale']))
            for i in range(self.p['nSim'])
        )
        n = self.p['nSim']
        evei  = results[n // 2]
        var95 = results[int(n * 0.95)]
        p05   = results[int(n * 0.05)]
        return {
            'evei':                 round(evei, 4),
            'VaR95':                round(var95, 4),
            'uncertainty_interval': round(var95 - p05, 4),
            '_audit': [{'formula': 'weighted_sum(CTH,A,B,C)/sumW+deterministicNoise', 'weights': w, 'nSim': n}]
        }

    async def process(self) -> Dict:
        completed, infer_audit = self._infer_phase_data()
        avg_cth      = sum(completed.values()) / len(CANONICAL_PHASES)
        delta_total  = completed['after'] - completed['before']
        evei         = self._calculate_evei()
        rw           = self.p['risk_weights']
        risk         = (1 - avg_cth) * rw['cth'] + (1 - evei['evei']) * rw['evei'] + self.black_swan_index * rw['black_swan']
        overall_risk = round(clamp(risk), 4)
        audit_trail  = infer_audit + evei['_audit'] + [{
            'metric':    'overallFoundationRisk',
            'formula':   '(1-avgCTH)*rw.cth+(1-evei)*rw.evei+bs*rw.bs',
            'inputs':    {'avgCTH': round(avg_cth, 4), 'evei': evei['evei'], 'blackSwanIndex': self.black_swan_index},
            'weights':   rw, 'result': overall_risk,
            'threshold': self.p['alphabreak_threshold'], 'policy_path': 'foundation.alphabreak_threshold'
        }]
        return {
            'engine': 'CTHCoreFoundationEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'cthProfile':  {'phases': completed, 'avgCTH': round(avg_cth, 4), 'deltaCTH_Total': round(delta_total, 4)},
            'eveiProfile': {'evei': evei['evei'], 'VaR95': evei['VaR95'], 'uncertainty_interval': evei['uncertainty_interval']},
            'overallFoundationRisk': overall_risk,
            'alphabreak':  overall_risk > self.p['alphabreak_threshold'],
            'hedgeActive': overall_risk > self.p['hedge_threshold'],
            '_audit': audit_trail
        }

# ─── Engine 2: Temporal ───────────────────────────────────────────────────────

class CTHTemporalEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data         = data
        self.p            = policy['temporal']
        self.cth_global   = require_input(data, 'cth_global',   'macro_context')
        self.evei_average = require_input(data, 'evei_average', 'macro_context')
        self.black_swan_index = float(data.get('blackSwanIndex', 0))

    def _temporal_equivalence(self) -> Dict:
        analogs = self.data.get('historical_analogs')
        if analogs is None:
            return {'ET': None, 'ET_pct': None, 'analogs_count': None, 'status': 'NO_ANALOG_DATA',
                    '_audit': [{'skipped': 'historical_analogs not provided'}]}
        avg_diff = require_input(analogs, 'avg_contextual_difference', 'historical_analogs')
        et = clamp(100 - avg_diff * self.p['et_scale_factor'], 0, 100)
        status = ('NO_DISPARITY' if et > self.p['et_no_disparity_threshold']
                  else 'MODERATE' if et > self.p['et_moderate_threshold'] else 'VERY_HIGH')
        return {
            'ET': round(et, 4), 'ET_pct': f"{round(et, 1)}%",
            'analogs_count': analogs.get('count'), 'status': status,
            '_audit': [{'formula': f'100 - avgDiff * {self.p["et_scale_factor"]}', 'inputs': {'avg_diff': avg_diff}, 'result': et}]
        }

    def _pantemporality(self) -> Dict:
        r    = self.p['analog_variance_range']
        vals = [self.cth_global, self.cth_global * (1 - r), self.cth_global * (1 + r)]
        mean = sum(vals) / 3
        var  = sum((v - mean) ** 2 for v in vals) / 3
        ip   = clamp(1 - math.sqrt(var))
        return {
            'PantemporalityIndex': round(ip, 4),
            'isPantemporal': ip >= self.p['pantemporal_threshold'],
            '_audit': [{'formula': f'1-sqrt(variance(cth*[1,1-{r},1+{r}]))', 'result': ip}]
        }

    def _temporal_fields(self) -> Dict:
        tw   = self.p['triphasic_weights']
        pw   = self.p['pentaphasic_weights']
        tri  = self.cth_global * tw['cth'] + self.evei_average * tw['evei']
        penta = self.cth_global * pw['cth'] + self.evei_average * pw['evei'] + self.black_swan_index * pw['black_swan']
        supra = penta * self.p['supraphasic_multiplier']
        return {
            'triphasicField':  round(tri,   4),
            'pentaphasicField': round(penta, 4),
            'supraphasicRTI':  round(supra,  4),
            '_audit': [{'tw': tw, 'pw': pw, 'multiplier': self.p['supraphasic_multiplier']}]
        }

    def _timeline(self) -> Dict:
        cit  = self.p['critical_inflection_threshold']
        rmd_t = self.p['rmd_threshold']
        tl = []
        for ph in self.p['phases']:
            power = self.cth_global * (1 - ph['fatigue']) * (1 + self.evei_average * 0.6) * ph['intensity']
            tl.append({'phase': ph['name'], 'range': ph['range'], 'power': round(power, 4), 'critical_inflection': power > cit})
        zenith = max(tl, key=lambda x: x['power'])
        return {
            'timeline': tl, 'zenithPhase': zenith['phase'], 'zenithRange': zenith['range'],
            'rmd_trajectory': zenith['power'] > rmd_t,
            '_audit': [{'formula': 'cth*(1-fatigue)*(1+evei*0.6)*intensity', 'threshold': cit, 'policy_path': 'temporal.critical_inflection_threshold'}]
        }

    def _project_phases(self, outcome: Optional[str]) -> Dict:
        of_ = self.p['outcome_factors']
        win = outcome == 'win'
        return {
            'prelude':    round(self.cth_global, 4),
            'transition': round(clamp(self.cth_global + self.evei_average * (-of_['transition_win'] if win else of_['transition_default'])), 4),
            'after':      round(clamp(self.cth_global + self.evei_average * (-of_['after_win']      if win else of_['after_default'])),      4),
        }

    def process(self, outcome: Optional[str] = None) -> Dict:
        et      = self._temporal_equivalence()
        panto   = self._pantemporality()
        fields  = self._temporal_fields()
        timeline = self._timeline()
        proj    = self._project_phases(outcome)
        rw      = self.p['risk_weights']
        et_val  = (1 - et['ET'] / 100) * rw['et'] if et['ET'] is not None else 0
        t = self.p['pentaphasic_low_threshold']
        if fields['pentaphasicField'] >= t:
            penta_risk = self.p['pentaphasic_low_risk']
        else:
            penta_risk = self.p['pentaphasic_low_risk'] + (1 - fields['pentaphasicField'] / t) * (self.p['pentaphasic_high_risk'] - self.p['pentaphasic_low_risk'])
        zenith_risk = self.p['zenith_during_risk'] if timeline['zenithPhase'] == 'During' else self.p['zenith_other_risk']
        risk = et_val + (1 - panto['PantemporalityIndex']) * rw['pantemporal'] + penta_risk * rw['pentaphasic'] + zenith_risk * rw['zenith']
        overall_risk = round(clamp(risk), 4)
        return {
            'engine': 'CTHTemporalEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'temporalEquivalence':  {'ET': et['ET'], 'ET_pct': et['ET_pct'], 'analogs_count': et['analogs_count'], 'status': et['status']},
            'pantemporalElements':  {'PantemporalityIndex': panto['PantemporalityIndex'], 'isPantemporal': panto['isPantemporal']},
            'temporalFields':       {'triphasicField': fields['triphasicField'], 'pentaphasicField': fields['pentaphasicField'], 'supraphasicRTI': fields['supraphasicRTI']},
            'fullTimeline':         {'timeline': timeline['timeline'], 'zenithPhase': timeline['zenithPhase'], 'rmd_trajectory': timeline['rmd_trajectory']},
            'phaseProjections':     proj,
            'overallTemporalRisk':  overall_risk,
            'alphabreak': overall_risk > self.p['alphabreak_threshold'],
            '_audit': et['_audit'] + panto['_audit'] + fields['_audit'] + timeline['_audit'] + [
                {'metric': 'overallTemporalRisk', 'weights': rw, 'result': overall_risk, 'policy_path': 'temporal.alphabreak_threshold'}
            ]
        }

# ─── Engine 3: Predictive Dynamics ───────────────────────────────────────────

class CTHPredictiveDynamicsEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data         = data
        self.p            = policy['dynamics']
        self.cth_global   = require_input(data, 'cth_global',   'macro_context')
        self.evei_average = require_input(data, 'evei_average', 'macro_context')
        self.black_swan_index = float(data.get('blackSwanIndex', 0))
        self.delta_cth    = float(data.get('deltaCTH', 0))
        self.extended_metrics = data.get('extendedMetrics') or (_ for _ in ()).throw(
            ValueError('[CTH] macro_context.extendedMetrics (IEC, PPI, VVC) required by CTHPredictiveDynamicsEngine.')
        ) if 'extendedMetrics' not in data or data['extendedMetrics'] is None else data['extendedMetrics']
        ti       = data.get('token_instance') if isinstance(data.get('token_instance'), dict) else {}
        self._av = clamp(ti.get('actor_volatility', 0))
        self._tf = clamp(ti.get('trigger_force', 0))

    def __init__(self, data: Dict, policy: Dict):
        self.data         = data
        self.p            = policy['dynamics']
        self.cth_global   = require_input(data, 'cth_global',   'macro_context')
        self.evei_average = require_input(data, 'evei_average', 'macro_context')
        self.black_swan_index = float(data.get('blackSwanIndex', 0))
        self.delta_cth    = float(data.get('deltaCTH', 0))
        if 'extendedMetrics' not in data or data.get('extendedMetrics') is None:
            raise ValueError('[CTH] macro_context.extendedMetrics (IEC, PPI, VVC) required by CTHPredictiveDynamicsEngine.')
        self.extended_metrics = data['extendedMetrics']
        ti       = data.get('token_instance') if isinstance(data.get('token_instance'), dict) else {}
        self._av = clamp(ti.get('actor_volatility', 0))
        self._tf = clamp(ti.get('trigger_force', 0))

    def _cmn_rmd(self) -> Dict:
        w  = self.p['cmn_rmd_weights']
        em = self.extended_metrics
        cmn = ((1 - self.evei_average) * w['evei'] + (1 - em['IEC']) * w['iec'] +
               (1 - em['PPI']) * w['ppi'] + em['VVC'] * w['vvc']) * 100
        rmd = (self.evei_average * w['evei'] + em['IEC'] * w['iec'] + em['PPI'] * w['ppi'] +
               (1 - em['VVC']) * w['vvc']) * 100
        rmd += (self.delta_cth * 80 if self.delta_cth > 0 else 0) * w['delta_cth']
        total = cmn + rmd
        return {
            'cmnProbability': round((cmn / total) * 100, 2) if total else 50,
            'rmdProbability': round((rmd / total) * 100, 2) if total else 50,
            'rmd_dominant':   rmd > cmn,
            '_audit': [{'formula': 'cmn/rmd weighted sum', 'weights': w}]
        }

    def _black_swan_core(self) -> Dict:
        n  = self.p['nSim_black_swan']
        bs = self.p['black_swan']
        av, tf = self._av, self._tf
        tail_bias = clamp(av * bs['tail_av'] + tf * bs['tail_tf'])
        f = bs['wave_freq']
        disruptions = []
        for i in range(n):
            u  = (i + 0.5) / n
            w0 = 0.5 + 0.5 * math.sin(i * f[0] + av * bs['phase_av'][0] + tf * bs['phase_tf'][0])
            w1 = 0.5 + 0.5 * math.cos(i * f[1] + tf * bs['phase_av'][1] + av * bs['phase_tf'][1])
            w2 = 0.5 + 0.5 * math.sin(i * f[2] + (av + tf) * bs['phase_sum'])
            w3 = 0.5 + 0.5 * math.cos(i * f[3] + u * bs['phase_u'])
            p_ = clamp(bs['p_base'] + bs['p_range'] * (w0 * (1 - tail_bias * 0.35) + tail_bias * (0.35 + u * 0.65)))
            h  = clamp(bs['h_base'] + bs['h_range'] * (w1 * (1 - tail_bias * 0.28) + tail_bias * (0.32 + u * 0.58)))
            e  = clamp(bs['e_base'] + bs['e_range'] * (w2 * (1 - tail_bias * 0.40) + tail_bias * (0.45 + av * 0.35)))
            o  = clamp(bs['o_base'] + bs['o_range'] * (w3 * (1 - tail_bias * 0.30) + tail_bias * (0.28 + tf * 0.42)))
            cross = bs['cross_scalar'] * max(0, (p_ - 0.4) * (h - 0.4) + (p_ - 0.4) * (o - 0.4))
            disruptions.append(clamp(bs['w_p'] * p_ + bs['w_h'] * h + bs['w_e'] * e + bs['w_o'] * o + cross))
        disruptions.sort()
        mean  = sum(disruptions) / n
        var95 = disruptions[int(n * 0.95)]
        es95  = sum(disruptions[int(n * 0.95):]) / (n * 0.05)
        return {'VaR95': round(var95, 5), 'ES95': round(es95, 5), 'mean': round(mean, 5),
                '_audit': [{'formula': 'deterministic_trig_disruption_simulation', 'nSim': n, 'tail_bias': tail_bias}]}

    def _pcn(self) -> Dict:
        pc = self.p['pcn']
        em = self.extended_metrics
        ipd = em['PPI'] * pc['ppi_weight'] + abs(em['IEC'] - 0.5) * pc['iec_factor'] + em['VVC'] * pc['vvc_weight']
        return {'PCN': round(clamp(ipd / pc['normalization']), 4), '_audit': [{'weights': pc}]}

    def _spectrum(self) -> Dict:
        sp = self.p['spectrum']
        n  = self.p['nSim_spectrum']
        av, tf = self._av, self._tf
        pre = dur = aft = 0
        for i in range(n):
            amp  = sp['amplitude_base'] * (1 + self.black_swan_index * sp['bs_amplitude_factor']) * (sp['av_weight'] * av + sp['tf_weight'] * tf)
            noise = amp * math.sin((i + 1) * sp['noise_freq'] + av * sp['noise_phase_av'] + tf * sp['noise_phase_tf']) * 0.5
            proj = self.cth_global * (1 + self.delta_cth * 0.8) + noise
            if proj > sp['prelude_threshold']: pre += 1
            if proj > sp['during_threshold']:  dur += 1
            if proj > sp['after_threshold']:   aft += 1
        return {
            'preludeProb': round(pre / n * 100, 1),
            'duringProb':  round(dur / n * 100, 1),
            'afterProb':   round(aft / n * 100, 1),
            '_audit': [{'formula': 'deterministic_sine_spectrum', 'nSim': n}]
        }

    def _butterfly_divergence(self) -> Dict:
        ba = self.p['butterfly_analysis']
        n  = self.p['nSim_butterfly']
        av, tf = self._av, self._tf
        base_scale = ba['base_scale'] * (ba['av_weight'] + (1 - ba['av_weight']) * (ba['av_weight'] * av + ba['tf_weight'] * tf)) * (1 + self.black_swan_index * ba['bs_multiplier'])
        divs = sorted(
            abs(base_scale * math.sin((i + 1) * ba['noise_freq'] + av * ba['noise_phase_av'] + tf * ba['noise_phase_tf'] + (i % ba['period_mod']) * ba['period_scale']))
            for i in range(n)
        )
        d95 = divs[int(n * 0.95)]
        return {'divergence95': round(d95, 5), 'alert': d95 > ba['alert_threshold'],
                '_audit': [{'nSim': n, 'base_scale': base_scale}]}

    async def process(self) -> Dict:
        cmn_rmd  = self._cmn_rmd()
        black_swan = self._black_swan_core()
        pcn      = self._pcn()
        spectrum = self._spectrum()
        butterfly = self._butterfly_divergence()
        rw       = self.p['risk_weights']
        risk = (black_swan['VaR95'] * rw['var'] + pcn['PCN'] * rw['pcn'] +
                (1 - cmn_rmd['rmdProbability'] / 100) * rw['rmd'] + butterfly['divergence95'] * rw['butterfly_div'])
        overall_risk = round(clamp(risk), 4)
        return {
            'engine': 'CTHPredictiveDynamicsEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'cmnrmdClassification': {'cmnProbability': cmn_rmd['cmnProbability'], 'rmdProbability': cmn_rmd['rmdProbability'], 'rmd_dominant': cmn_rmd['rmd_dominant']},
            'blackSwanCore':  {'VaR95': black_swan['VaR95'], 'ES95': black_swan['ES95'], 'mean': black_swan['mean']},
            'pcnRisk':        {'PCN': pcn['PCN']},
            'peeProjection':  {'preludeProb': spectrum['preludeProb'], 'duringProb': spectrum['duringProb'], 'afterProb': spectrum['afterProb']},
            'butterflyEffect': {'divergence95': butterfly['divergence95'], 'alert': butterfly['alert']},
            'overallDynamicsRisk': overall_risk,
            'alphabreak': overall_risk > self.p['alphabreak_threshold'],
            'hedgeActive': overall_risk > self.p['hedge_threshold'],
            '_audit': cmn_rmd['_audit'] + black_swan['_audit'] + pcn['_audit'] + spectrum['_audit'] + butterfly['_audit'] + [
                {'metric': 'overallDynamicsRisk', 'formula': 'VaR95*rw.v+pcn*rw.p+(1-rmd/100)*rw.r+div95*rw.b', 'weights': rw, 'result': overall_risk, 'policy_path': 'dynamics.alphabreak_threshold'}
            ]
        }

# ─── Engine 4: Chaos Resilience ───────────────────────────────────────────────

class CTHChaosResilienceEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data         = data
        self.p            = policy['chaos']
        self.cth_global   = require_input(data, 'cth_global',   'macro_context')
        self.evei_average = require_input(data, 'evei_average', 'macro_context')
        self.black_swan_index = float(data.get('blackSwanIndex', 0))
        if 'phasesCTH' not in data or data.get('phasesCTH') is None:
            raise ValueError('[CTH] macro_context.phasesCTH required by CTHChaosResilienceEngine.')
        self.phases_cth = data['phasesCTH']
        ti       = data.get('token_instance') if isinstance(data.get('token_instance'), dict) else {}
        self._av = clamp(ti.get('actor_volatility', 0))
        self._tf = clamp(ti.get('trigger_force', 0))

    def _fatigue(self) -> float:
        seq = [self.phases_cth['before'], self.phases_cth.get('prelude', self.cth_global), self.phases_cth['during']]
        f = 0.0
        for i in range(1, len(seq)):
            f += (seq[i-1] - seq[i]) * (i * self.p['fatigue_multiplier'])
        return clamp(f)

    def _entropy_resonance(self) -> Dict:
        dims = [self.cth_global * 0.9, self.cth_global * 1.1, self.evei_average, self.black_swan_index]
        total = sum(dims)
        H = -sum((p / total) * math.log2(p / total) for p in dims if p > 0 and total > 0)
        # Normalize to [0,1]: max Shannon entropy for N items = log2(N)
        max_h = math.log2(len(dims))
        hn    = H / max_h if max_h > 0 else 0.0
        # No fatigue amplification — _fatigue() already contributes a separate risk term
        return {'entropy': round(hn, 4), 'exponentialResonance': round(hn, 4)}

    def _eri(self) -> Dict:
        pc       = self.p['eri']
        shock    = abs(self.phases_cth['during'] - self.phases_cth['before'])
        recovery = self.phases_cth['after'] - self.phases_cth['during']
        eri      = clamp(pc['base'] + recovery * pc['recovery_factor'] - shock * pc['shock_factor'])
        return {'ERI': round(eri, 4), 'shockMagnitude': round(shock, 4), 'recoverySpeed': round(recovery, 4),
                '_audit': [{'formula': f'base+recovery*{pc["recovery_factor"]}-shock*{pc["shock_factor"]}', 'policy_path': 'chaos.eri'}]}

    def _blindspots(self) -> Dict:
        exf   = require_input(self.data, 'externalFactors', 'macro_context (blindspot analysis)')
        vals  = list(exf.values())
        score = sum(vals) / len(vals)
        return {'blindspotScore': round(score, 4),
                'recommendedAdjustment': round(score * self.p['blindspot']['adjustment_factor'], 4),
                'alert': score > self.p['blindspot']['alert_threshold']}

    def _polarization(self) -> Dict:
        delta = abs(self.phases_cth['during'] - self.phases_cth['before'])
        pol   = clamp(delta * self.p['polarization']['delta_factor'] + self.black_swan_index * self.p['polarization']['bs_factor'])
        return {'polarizationMultiplier': round(pol, 4)}

    def _valley(self) -> Dict:
        vals   = list(self.phases_cth.values())
        mean   = sum(vals) / len(vals)
        is_valley = self.phases_cth['during'] < mean * self.p['valley']['threshold']
        rev    = mean * (self.p['valley']['reversion_factor'] if is_valley else self.p['valley']['normal_factor'])
        return {'isValley': is_valley, 'predictedReversion': round(rev, 4)}

    def _irreducible_noise(self) -> Dict:
        noise = self.p['noise']['scale'] * (self._av - 0.5) * 2 * (self._tf - 0.5) * 2 * (1 + self.black_swan_index * self.p['noise']['bs_modifier'])
        return {'noiseAdjustedEVEI': round(clamp(self.evei_average + noise), 4), 'hedgeActive': abs(noise) > self.p['noise']['hedge_threshold']}

    def _early_warning(self) -> Dict:
        """Phase F.30 — Early Warning Signals (critical slowing down, Scheffer et al.)."""
        cfg    = self.p.get('early_warning', {})
        series = self.data.get('context_series')
        if not (isinstance(series, list) and len(series) >= 4):
            series = [self.phases_cth.get(ph) for ph in CANONICAL_PHASES if self.phases_cth.get(ph) is not None]
        if len(series) < 4:
            return {'available': False, 'reason': 'INSUFFICIENT_SERIES_LENGTH'}
        half  = len(series) // 2
        early = series[:half + (len(series) % 2)]
        late  = series[half:]
        def var_of(arr):
            m = sum(arr) / len(arr)
            return sum((v - m) ** 2 for v in arr) / len(arr)
        var_early = var_of(early)
        var_late  = var_of(late)
        variance_ratio = (var_late / var_early) if var_early > 0 else (float('inf') if var_late > 0 else 1.0)
        mean = sum(series) / len(series)
        num = den = 0.0
        for i, v in enumerate(series):
            den += (v - mean) ** 2
            if i > 0:
                num += (v - mean) * (series[i - 1] - mean)
        autocorr1 = num / den if den > 0 else 0.0
        var_t = cfg.get('variance_ratio_threshold', 1.5)
        ac_t  = cfg.get('autocorr_threshold', 0.35)
        csd = variance_ratio > var_t and autocorr1 > ac_t
        signal = ('CRITICAL_TRANSITION_PROXIMITY' if csd
                  else 'PARTIAL_WARNING' if (variance_ratio > var_t or autocorr1 > ac_t)
                  else 'NO_WARNING')
        return {'available': True, 'variance_ratio': round(min(variance_ratio, 999), 4),
                'autocorr_lag1': round(autocorr1, 4), 'critical_slowing_down': csd, 'signal': signal}

    def _bivariate(self, d1='Economy', d2='Politics') -> Dict:
        bv  = self.p['bivariate']
        rho = bv['rho_base'] + deterministic_noise(self._av, self._tf, bv['rho_spread'])
        interaction = clamp(self.cth_global * self.evei_average * rho * bv['multiplier'])
        return {'dimensions': f"{d1} × {d2}", 'interactionScore': round(interaction, 4), 'revolution': interaction > bv['revolution_threshold']}

    async def process(self) -> Dict:
        entropy_res  = self._entropy_resonance()
        eri          = self._eri()
        blindspots   = self._blindspots()
        polarization = self._polarization()
        fatigue      = self._fatigue()
        valley       = self._valley()
        noise_       = self._irreducible_noise()
        bivariate    = self._bivariate()
        early_warning = self._early_warning()
        rw           = self.p['risk_weights']
        risk = (entropy_res['exponentialResonance'] * rw['entropy'] + (1 - eri['ERI']) * rw['eri'] +
                blindspots['blindspotScore'] * rw['blindspots'] + polarization['polarizationMultiplier'] * rw['polarization'] + fatigue * rw['fatigue'])
        overall_risk = round(clamp(risk), 4)
        return {
            'engine': 'CTHChaosResilienceEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'shannonEntropy':     {'entropy': entropy_res['entropy'], 'exponentialResonance': entropy_res['exponentialResonance']},
            'eriResilience':      {'ERI': eri['ERI'], 'shockMagnitude': eri['shockMagnitude'], 'recoverySpeed': eri['recoverySpeed']},
            'blindspots':         {'score': blindspots['blindspotScore'], 'adjustment': blindspots['recommendedAdjustment'], 'alert': blindspots['alert']},
            'polarization':       {'multiplier': polarization['polarizationMultiplier']},
            'societalFatigue':    round(fatigue, 4),
            'valleyReversion':    valley,
            'irreducibleNoise':   noise_,
            'bivariateInteraction': bivariate,
            'earlyWarning':       early_warning,
            'overallChaosShieldRisk': overall_risk,
            'alphabreak': overall_risk > self.p['alphabreak_threshold'],
            '_audit': eri['_audit'] + [
                {'metric': 'overallChaosShieldRisk', 'weights': rw, 'result': overall_risk, 'policy_path': 'chaos.alphabreak_threshold'}
            ]
        }

# ─── Engine 5: Butterfly Field ────────────────────────────────────────────────

class CTHButterflyFieldEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data   = data
        self.p      = policy['butterfly_field']
        self.EVEI        = require_input(data, 'event_valuation_structure', 'macro_context')
        self.CTH_Series  = require_input(data, 'context_series',           'macro_context')
        self.Deltas      = data.get('delta_series', [])
        self.PCN         = float(data.get('black_swan_factor', 0))
        self.constructors = data.get('constructors', []) if isinstance(data.get('constructors'), list) else []
        mech = data.get('mechanics', {})
        self.Action   = require_input(mech, 'action',   'macro_context.mechanics')
        self.Reaction = require_input(mech, 'reaction', 'macro_context.mechanics')
        self.Result   = require_input(mech, 'result',   'macro_context.mechanics')
        self.triphasic   = require_input(data, 'triphasic',   'macro_context')
        self.pentaphasic = require_input(data, 'pentaphasic', 'macro_context')
        self.supraphasic = require_input(data, 'supraphasic', 'macro_context')

    def _ip(self, values: List[float]) -> Dict:
        if len(values) != 3:
            raise ValueError('[CTH] IP calculation requires exactly 3 phase values.')
        mean = sum(values) / 3
        var  = sum((v - mean) ** 2 for v in values) / 3
        ip   = clamp(1 - math.sqrt(var))
        st   = self.p['stability_thresholds']
        grade = ('ABSOLUTE_ANCHOR'    if ip >= st['absolute_anchor']
                 else 'STRUCTURAL_CONSTANT' if ip >= st['structural_constant']
                 else 'TREND_INERTIA' if ip >= st['trend_inertia']
                 else 'VOLATILE_RHYTHM')
        return {'ip': round(ip, 4), 'isPantemporal': ip >= self.p['ip_threshold'], 'stabilityGrade': grade}

    def _invariance(self, dataset: Dict) -> Dict:
        results, anchors = {}, []
        for var, vals in dataset.items():
            a = self._ip(vals)
            results[var] = a
            if a['isPantemporal']:
                anchors.append({'name': var, 'strength': a['ip'], 'grade': a['stabilityGrade']})
        gpc = len(anchors) / len(dataset) if dataset else 0
        vt  = self.p['verdict_thresholds']
        verdict = ('SYSTEMIC_IMMUTABILITY' if gpc > vt['gpc']
                   else 'ANCHORED_EVOLUTION' if anchors else 'TOTAL_FLUIDITY')
        return {'variable_analysis': results, 'strategic_anchors': anchors,
                'global_pantemporal_coherence': round(gpc, 3), 'verdict': verdict}

    def _iec(self):
        m = sum(self.CTH_Series) / len(self.CTH_Series)
        v = sum((b - m) ** 2 for b in self.CTH_Series) / len(self.CTH_Series)
        return 1 / (1 + math.sqrt(v))
    def _vvc(self): return sum(abs(d) for d in self.Deltas) / len(self.Deltas) if self.Deltas else 0
    def _mce(self):
        t = self.Action + self.Reaction + self.Result
        if t == 0: return 0
        ps = [self.Action/t, self.Reaction/t, self.Result/t]
        return -sum(v * math.log(v + 0.001) for v in ps if v > 0) / 1.1
    def _ppi(self): return math.sqrt((self.EVEI/100) * (self.CTH_Series[-1]/100)) if self.CTH_Series else 0
    def _die(self, r): return math.exp(r * self.p['die_exponent']) if r > self.p['die_threshold'] else 1.0

    def _causal_drift(self, base_prob: float, micro_fluctuations: List) -> Dict:
        g = self.p['greeks']
        n = self.p['nSim_causal']
        safe = micro_fluctuations if isinstance(micro_fluctuations, list) else []
        drifts = []
        for i in range(n):
            prob = base_prob
            for f in safe:
                ripple = deterministic_noise(i, f.get('scale', 0.05), f.get('scale', 0.05))
                prob += ripple * g['delta'] + (ripple ** 2) * g['gamma']
            prob = prob * (1 - g['lambda']) + base_prob * g['lambda']
            drifts.append(clamp(prob))
        drifts.sort()
        median = drifts[n // 2]
        vol    = drifts[int(n * 0.95)] - drifts[int(n * 0.05)]
        return {'causal_certainty': round(median * 100, 3), 'divergence_risk': round(vol * 100, 3),
                'high_volatility': vol > self.p['high_volatility_threshold'],
                '_audit': [{'greeks': g, 'nSim': n, 'base_prob': base_prob}]}

    def _lyapunov(self, base_probability: float) -> Dict:
        """Phase F.29 — Lyapunov exponent of the systemic trajectory (logistic-family map)."""
        cfg   = self.p.get('lyapunov', {})
        n     = cfg.get('iterations', 200)
        g_min = cfg.get('gain_min', 2.6)
        g_max = cfg.get('gain_max', 3.99)
        d0    = cfg.get('initial_separation', 1e-4)
        icap  = float(self.data.get('adaptive_capacity', 1.0))
        stress = clamp(0.35 * base_probability + 0.65 * self.PCN + 0.15 * (1 - icap))
        gain   = g_min + (g_max - g_min) * stress
        x = min(0.99, max(0.01, base_probability))
        total = 0.0
        for _ in range(n):
            x = gain * x * (1 - x)
            x = min(0.99, max(0.01, x))
            total += math.log(abs(gain * (1 - 2 * x)) + 1e-12)
        lam = total / n
        chaotic = lam > 0
        return {'exponent': round(lam, 4), 'map_gain': round(gain, 4),
                'systemic_stress': round(stress, 4), 'chaotic': chaotic,
                'predictability_horizon': round(math.log(1 / d0) / lam, 2) if chaotic else None,
                'regime': 'CHAOTIC' if chaotic else ('OSCILLATORY' if gain > 3.0 else 'STABLE_FIXED_POINT')}

    def _triphasic_indices(self) -> Dict:
        fc   = self.p['field_constants']
        i_evei = self.triphasic['before']['evei']*fc['wBefore'] + self.triphasic['prelude']['evei']*fc['wPrelude'] + self.triphasic['during']['evei']*fc['wDuring']
        i_cth  = self.triphasic['before']['cth'] *fc['wBefore'] + self.triphasic['prelude']['cth'] *fc['wPrelude'] + self.triphasic['during']['cth'] *fc['wDuring']
        vals   = [self.triphasic['before']['cth'], self.triphasic['prelude']['cth'], self.triphasic['during']['cth']]
        mean   = sum(vals) / 3
        ip     = clamp(1 - math.sqrt(sum((v - mean)**2 for v in vals) / 3))
        return {'iEVEI': round(i_evei, 4), 'iCTH': round(i_cth, 4), 'IP': round(ip, 4)}

    async def process(self, event_data: Optional[Dict] = None) -> Dict:
        if event_data is None: event_data = {}
        micro = event_data.get('microFluctuations', []) if isinstance(event_data.get('microFluctuations'), list) else []
        constructors = event_data.get('constructors', self.constructors) if isinstance(event_data.get('constructors'), list) else self.constructors
        panto = self._invariance({'CTH': self.CTH_Series[:3], 'EVEI': [self.EVEI/100, self.EVEI/100*1.05, self.EVEI/100*0.95]})
        iec  = self._iec()
        vvc  = self._vvc()
        mce  = self._mce()
        ppi  = self._ppi()
        die  = self._die(self.EVEI / 100)
        rti  = [{'breadcrumb': i+1, 'identity': c.get('id', c.get('name', f'C-{i}')),
                 'impact': round((require_input(c, 'evei', f'constructors[{i}]') if 'evei' not in c else c['evei']) * c.get('influence_factor', 1.0), 2),
                 'context_environment': require_input(c, 'cth_at_event', f'constructors[{i}]')}
                for i, c in enumerate(constructors)]
        drift = self._causal_drift(self.EVEI / 100, micro)
        lyapunov = self._lyapunov(self.EVEI / 100)
        somatic_gap = abs(self.EVEI/100 - (self.EVEI/100 + 0.05))
        somatic = {'resonanceLevel': round(somatic_gap * self.p['greeks']['gamma'], 5),
                   'recalibrate': somatic_gap * self.p['greeks']['gamma'] > self.p['somatic_resonance_threshold']}
        tri  = self._triphasic_indices()
        penta_match = next((m['name'] for m in self.pentaphasic.get('models', []) if abs(m.get('cth_signature', 0) - tri['iCTH']) < 0.1), 'NEW_PATTERN')
        supra_echo  = sum(r.get('power', 0) * r.get('persistence', 0) for r in self.supraphasic.get('rtis', []))
        fc   = self.p['field_constants']
        PEE  = self.p['pee_base'] + fc['alpha'] * tri['iEVEI'] + fc['beta'] * tri['iCTH'] + fc['eta'] * self.PCN + supra_echo * 0.1
        rw   = self.p['risk_weights']
        n_risk = self.p['nSim_risk']
        div  = drift['divergence_risk']
        risks = sorted(
            clamp((1-iec)*rw['iec'] + vvc*rw['vvc'] + mce*rw['mce'] + (1-ppi)*rw['ppi'] + (div/100)*rw['divergence'] + deterministic_noise(i, self.PCN, self.PCN))
            for i in range(n_risk)
        )
        overall_risk = round(risks[n_risk // 2], 4)
        return {
            'engine': 'CTHButterflyFieldEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'pantemporalAnalysis': panto,
            'rtiMetrics': {'IEC': round(iec, 3), 'VVC': round(vvc, 3), 'MCE': round(mce, 3), 'PPI': round(ppi, 3), 'DIE': round(die, 3), 'RTI': rti},
            'butterflyEffect': {'causalDrift': drift, 'somaticResonance': somatic, 'lyapunov': lyapunov},
            'fieldCommander': {'triphasicIndices': tri, 'pentaphasicValidation': penta_match, 'supraEcho': round(supra_echo, 4), 'PEEProjection': round(clamp(PEE), 4), 'climax': PEE > self.p['pee_verdict_threshold']},
            'overallRisk': overall_risk,
            'alphabreak': overall_risk > self.p['alphabreak_threshold'],
            '_audit': drift['_audit'] + [
                {'metric': 'overallRisk', 'weights': rw, 'result': overall_risk, 'policy_path': 'butterfly_field.alphabreak_threshold'}
            ]
        }

# ─── Engine 6: Analysis ───────────────────────────────────────────────────────

class CTHAnalysisEngine:
    def __init__(self, data: Dict, policy: Dict):
        self.data = data
        self.p    = policy['analysis']
        self.core = CTHCoreFoundationEngine(data, policy)

    def _extended_metrics(self) -> Dict:
        r  = self.p['extended_ranges']
        n  = self.p['nSim']
        av = clamp(self.data.get('token_instance', {}).get('actor_volatility', 0) if isinstance(self.data.get('token_instance'), dict) else 0)
        tf = clamp(self.data.get('token_instance', {}).get('trigger_force', 0)    if isinstance(self.data.get('token_instance'), dict) else 0)
        acc = {'iec': 0.0, 'ppi': 0.0, 'vvc': 0.0, 'mce': 0.0, 'iig': 0.0}
        for i in range(n):
            noise = abs(deterministic_noise(i + av, tf, 0.5))
            acc['iec'] += r['iec_base'] + noise * r['iec_range']
            acc['ppi'] += r['ppi_base'] + noise * r['ppi_range']
            acc['vvc'] += r['vvc_base'] + noise * r['vvc_range']
            acc['mce'] += r['mce_base'] + noise * r['mce_range']
            acc['iig'] += r['iig_base'] + noise * r['iig_range']
        return {k.upper(): round(v / n, 4) for k, v in acc.items()} | \
               {'_audit': [{'formula': 'base + |deterministicNoise|*range', 'ranges': r, 'nSim': n}]}

    async def process(self) -> Dict:
        core     = await self.core.process()
        extended = self._extended_metrics()
        fh_evei  = require_input(self.data, 'fh_evei', 'macro_context')
        fe_evei  = require_input(self.data, 'fe_evei', 'macro_context')
        fp       = (fh_evei * 3 + fe_evei * 2) / 5
        mw       = self.p['margin_weights']
        avg_cth  = core['cthProfile']['avgCTH']
        evei_val = core['eveiProfile']['evei']
        margins  = {
            'macromargin': round(avg_cth * mw['macro']['cth'] + evei_val * mw['macro']['evei'] + fp * mw['macro']['fp'], 4),
            'micromargin': round(avg_cth * mw['micro']['cth'] + evei_val * mw['micro']['evei'] + fp * mw['micro']['fp'], 4)
        }
        rw   = self.p['risk_weights']
        risk = (1-avg_cth)*rw['cth'] + (1-evei_val)*rw['evei'] + (1-extended['PPI'])*rw['ppi'] + extended['VVC']*rw['vvc']
        overall_risk = round(clamp(risk), 4)
        return {
            'engine': 'CTHAnalysisEngine', 'schema_version': SCHEMA_VERSION,
            'timestamp': int(datetime.now().timestamp() * 1000),
            'extendedMetrics': {k: extended[k] for k in ('IEC', 'PPI', 'VVC', 'MCE', 'IIG')},
            'potentialFactors': {'FP_EVEI': round(fp, 4), 'FP_CTH': round(avg_cth * 0.6 + fp * 0.4, 4)},
            'margins': margins,
            'overallAnalyticalVulnerability': overall_risk,
            'alphabreak': overall_risk > self.p['alphabreak_threshold'],
            '_audit': extended['_audit'] + [
                {'metric': 'overallAnalyticalVulnerability', 'weights': rw, 'result': overall_risk, 'policy_path': 'analysis.alphabreak_threshold'}
            ]
        }

# ─── Token Dynamics Engine (Phase E.25) ──────────────────────────────────────

class CTHTokenDynamicsEngine:
    """
    Computes a Token Impact Score (TIS) and per-engine Token Impact Multiplier (TIM)
    from the token_instance fields. TIM > 1 amplifies risk (disruptors); TIM < 1 dampens (architects).
    Applied multiplicatively to Foundation/Dynamics/Chaos risks before ultraCTH synthesis.
    """
    DEFAULT_ROLE_MODIFIERS: Dict = {
        'disruptor':  {'foundation': 1.15, 'dynamics': 1.20, 'chaos': 1.25},
        'catalyst':   {'foundation': 1.05, 'dynamics': 1.15, 'chaos': 1.10},
        'stabilizer': {'foundation': 0.82, 'dynamics': 0.85, 'chaos': 0.76},
        'architect':  {'foundation': 0.82, 'dynamics': 0.85, 'chaos': 0.76},
        'wildcard':   {'foundation': 1.00, 'dynamics': 1.05, 'chaos': 1.10}
    }

    def __init__(self, token_instance: Optional[Dict], policy: Dict):
        self.ti  = token_instance or {}
        self.cfg = policy['token_dynamics']

    def process(self) -> Dict:
        ti  = self.ti
        cfg = self.cfg
        w   = cfg['weights']

        power       = clamp(float(ti.get('power_index',           ti.get('actor_volatility',  0))))
        network     = clamp(float(ti.get('network_centrality',    ti.get('network_density',   0.5))))
        legitimacy  = clamp(float(ti.get('legitimacy',            ti.get('legitimacy_index',  0.5))))
        rationality = clamp(float(ti.get('rationality',           0.5)))
        charisma    = clamp(float(ti.get('charisma',              0.5)))
        ideological = clamp(float(ti.get('ideological_extremity', 0)))
        momentum    = clamp(float(ti.get('momentum',              0.5)))
        duration_raw   = float(ti.get('duration_of_influence', 12))
        duration_score = clamp(duration_raw / cfg['duration_normalization'])

        tis = clamp(
            power       * w['power']            +
            network     * w['network']           +
            charisma    * w['charisma']          +
            momentum    * w['momentum']          +
            ideological * w['ideological']       +
            (1.0 - legitimacy)  * w['anti_legitimacy']  +
            (1.0 - rationality) * w['anti_rationality']
        )

        base_tim  = 1.0 + (tis - 0.5) * cfg['sensitivity']
        lo, hi    = cfg['multiplier_clamp']
        role      = (ti.get('historical_role') or 'wildcard').lower()
        role_mods = cfg.get('role_modifiers', self.DEFAULT_ROLE_MODIFIERS)
        mod       = role_mods.get(role, role_mods.get('wildcard', {'foundation': 1.0, 'dynamics': 1.0, 'chaos': 1.0}))

        tim_foundation = clamp(base_tim * mod['foundation'], lo, hi)
        tim_dynamics   = clamp(base_tim * mod['dynamics'],   lo, hi)
        tim_chaos      = clamp(base_tim * mod['chaos'],      lo, hi)

        return {
            'engine':             'CTHTokenDynamicsEngine',
            'token_impact_score': round(tis, 4),
            'historical_role':    role,
            'duration_score':     round(duration_score, 4),
            'multipliers': {
                'foundation': round(tim_foundation, 4),
                'dynamics':   round(tim_dynamics,   4),
                'chaos':      round(tim_chaos,      4)
            },
            'components': {
                'power':          round(power,       4),
                'network':        round(network,     4),
                'legitimacy':     round(legitimacy,  4),
                'rationality':    round(rationality, 4),
                'charisma':       round(charisma,    4),
                'ideological':    round(ideological, 4),
                'momentum':       round(momentum,    4),
                'duration_score': round(duration_score, 4)
            },
            '_audit': [{'formula': 'TIS=power*w.p+network*w.n+charisma*w.c+momentum*w.m+ideological*w.i+(1-leg)*w.al+(1-rat)*w.ar',
                        'weights': w, 'tis': round(tis, 4), 'base_tim': round(base_tim, 4)}]
        }

# ─── Engine 8: Multi-Token Interaction (Phase F.28) ──────────────────────────

class CTHMultiTokenEngine:
    """Models competing actors. Combined multiplier = TIS-weighted geometric mean;
    dispersion between opposing tokens becomes a contested-event certainty penalty."""

    def __init__(self, token_instances: List[Dict], policy: Dict):
        if not isinstance(token_instances, list) or len(token_instances) == 0:
            raise ValueError('[CTH] CTHMultiTokenEngine requires a non-empty token_instances list.')
        self.tokens = token_instances
        self.policy = policy
        self.cfg    = policy['token_dynamics']

    def process(self) -> Dict:
        per     = [CTHTokenDynamicsEngine(t, self.policy).process() for t in self.tokens]
        weights = [r['token_impact_score'] + 1e-6 for r in per]
        w_sum   = sum(weights)
        lo, hi  = self.cfg['multiplier_clamp']

        def combine(key):
            ln = sum(math.log(r['multipliers'][key]) * weights[i] for i, r in enumerate(per)) / w_sum
            return round(max(lo, min(hi, math.exp(ln))), 4)

        multipliers = {'foundation': combine('foundation'), 'dynamics': combine('dynamics'), 'chaos': combine('chaos')}

        dyn   = [r['multipliers']['dynamics'] for r in per]
        m_dyn = sum(dyn) / len(dyn)
        conflict = math.sqrt(sum((v - m_dyn) ** 2 for v in dyn) / len(dyn))
        conflict_threshold = self.cfg.get('conflict_threshold', 0.10)
        penalty_scale      = self.cfg.get('conflict_certainty_penalty', 0.25)
        contested          = conflict > conflict_threshold

        dominant_idx = max(range(len(per)), key=lambda i: per[i]['token_impact_score'])
        combined_tis = sum(r['token_impact_score'] * weights[i] for i, r in enumerate(per)) / w_sum

        return {
            'engine':             'CTHMultiTokenEngine',
            'token_count':        len(per),
            'token_impact_score': round(combined_tis, 4),
            'historical_role':    per[dominant_idx]['historical_role'],
            'components':         per[dominant_idx]['components'],
            'multipliers':        multipliers,
            'per_token':          per,
            'interaction': {
                'conflict_index':    round(conflict, 4),
                'contested':         contested,
                'certainty_penalty': round(conflict * penalty_scale if contested else 0, 4),
                'dominant_index':    dominant_idx,
                'dominant_role':     per[dominant_idx]['historical_role']
            },
            '_audit': [{'formula': 'TIS-weighted geometric mean of per-token multipliers; conflict = stddev(dynamics multipliers)',
                        'token_count': len(per), 'conflict_index': round(conflict, 4),
                        'contested': contested, 'dominant_index': dominant_idx}]
        }

# ─── Master Predictor ─────────────────────────────────────────────────────────

class CTHMasterPredictorEngine:
    def __init__(self):
        self._hooks: Dict[str, List] = {}

    def on(self, event: str, fn) -> 'CTHMasterPredictorEngine':
        self._hooks.setdefault(event, []).append(fn)
        return self

    def _emit(self, event: str, data: Any) -> None:
        for fn in self._hooks.get(event, []):
            fn(data)

    def _validate_input(self, raw: Optional[Dict]) -> Dict:
        if not isinstance(raw, dict):
            raise ValueError('[CTH] predict_event requires a non-null dict input.')
        mc = raw.get('macro_context')
        if not isinstance(mc, dict):
            raise ValueError('[CTH] input.macro_context is required and must be a dict.')
        ti = raw.get('token_instance')
        if not isinstance(ti, dict):
            tis_list = raw.get('token_instances')
            if isinstance(tis_list, list) and len(tis_list) > 0 and isinstance(tis_list[0], dict):
                ti = tis_list[0]
            else:
                raise ValueError('[CTH] input.token_instance (or non-empty token_instances[]) is required.')
        event_id = str(raw.get('id') or f'EVENT-{str(int(datetime.now().timestamp()*1000))[-8:]}')
        return {**raw, 'id': event_id, 'macro_context': mc, 'token_instance': ti}

    def _mule_clause(self, input_data: Dict, policy: Dict, token_dynamics: Optional[Dict] = None) -> Dict:
        threshold = policy['mule_clause']['token_dominance_threshold']
        mc        = input_data.get('macro_context', {})
        ti        = input_data.get('token_instance', {})
        macro_s   = clamp(float(mc.get('cth_global', 0)) * 0.50 + float(mc.get('evei_average', 0)) * 0.30 + float(mc.get('adaptive_capacity', 0.5)) * 0.20)
        if token_dynamics is not None:
            token_s = clamp(float(token_dynamics.get('token_impact_score', 0)))
        else:
            token_s = clamp(float(ti.get('actor_volatility', 0)) * 0.35 + float(ti.get('trigger_force', 0)) * 0.25 +
                            float(ti.get('network_density', 0)) * 0.20 + (1 - float(ti.get('legitimacy_index', 1))) * 0.20)
        ratio = token_s / macro_s if macro_s > 0 else float('inf')
        return {'token_dominant': ratio > threshold, 'token_to_macro_ratio': round(ratio, 4),
                'threshold': threshold, 'flag': 'TOKEN_DOMINANT_MACRO_PREDICTION_DEGRADED' if ratio > threshold else None}

    def _reflexivity_penalty(self, input_data: Dict, policy: Dict, ultra_cth: float) -> Dict:
        loop    = clamp(float(input_data.get('observation_loop', 0)))
        max_pen = policy['reflexivity']['max_certainty_penalty']
        penalty = loop * max_pen
        return {'observation_loop': loop, 'penalty': penalty, 'adjusted_ultraCTH': clamp(ultra_cth - penalty)}

    def _population_modulation(self, input_data: Dict, policy: Dict, certainty: float) -> Dict:
        pop     = input_data.get('macro_context', {}).get('PopulationRange')
        if pop is None:
            return {'modulated_certainty': certainty, 'population_warning': 'PopulationRange not provided'}
        min_pop = policy['population_modulation']['min_population_for_full_certainty']
        factor  = clamp(float(pop) / min_pop)
        return {'modulated_certainty': round(certainty * factor, 4), 'population_factor': factor}

    def _ultra_synthesis(self, engines: Dict, policy: Dict, reported_delta_cth: Optional[float] = None) -> float:
        w    = policy['synthesis']['weights']
        tb   = policy['synthesis'].get('trajectory_bonus', 0)
        tb_r = policy['synthesis'].get('reported_delta_bonus', 0)
        base = clamp(
            (1 - (engines['foundation'].get('overallFoundationRisk',       0) or 0)) * w['foundation'] +
            (1 - (engines['analysis'].get('overallAnalyticalVulnerability', 0) or 0)) * w['analysis']  +
            (1 - (engines['dynamics'].get('overallDynamicsRisk',            0) or 0)) * w['dynamics']  +
            (1 - (engines['temporal'].get('overallTemporalRisk',            0) or 0)) * w['temporal']  +
            (1 - (engines['chaos'].get('overallChaosShieldRisk',            0) or 0)) * w['chaos']     +
            (1 - (engines['butterfly'].get('overallRisk',                   0) or 0)) * w['butterfly']
        )
        structural_delta = (engines['foundation'].get('cthProfile') or {}).get('deltaCTH_Total', 0) or 0
        reported_bonus   = (reported_delta_cth * tb_r) if (reported_delta_cth is not None and reported_delta_cth > 0) else 0
        return clamp(base + structural_delta * tb + reported_bonus)

    def _deep_zoom(self, computed_ultra: float, policy: Dict, seed: Optional[float] = None) -> float:
        cfg    = policy['synthesis']
        n      = cfg['nSim_deep_zoom']
        lo, hi = cfg['deep_zoom_clamp']
        scale  = cfg['deep_zoom_noise_scale']
        s      = seed if seed is not None else 1.0
        total  = sum(clamp(computed_ultra + deterministic_noise(i * s, i, scale), lo, hi) for i in range(n))
        return total / n

    async def calibrate(self, corpus: List[Dict], policy_template: Dict, policy: Dict) -> Dict:
        validate_policy(policy)
        if not corpus:
            raise ValueError('[CTH] calibrate() requires a non-empty corpus list.')
        results = []
        for item in corpus:
            if item.get('input') is None or item.get('observed_outcome') is None:
                continue
            pred      = await self.predict_event(item['input'], policy)
            predicted = pred['synthesis'].get('ultraCTH', 0) or 0
            observed  = clamp(float(item['observed_outcome']))
            error     = abs(predicted - observed)
            rmd_pred  = pred['synthesis'].get('rmd_prediction', False)
            rmd_obs   = observed > policy['synthesis']['prediction_threshold']
            results.append({
                'id':                item['input'].get('id'),
                'predicted':         round(predicted, 6),
                'observed':          observed,
                'error':             round(error, 6),
                'correct_direction': rmd_pred == rmd_obs,
                'category':          item.get('category')
            })

        if not results:
            return {'corpus_size': len(corpus), 'MAE': None, 'RMSE': None, 'brier_score': None,
                    'directional_accuracy': None, 'per_event': [], 'by_category': {}, 'policy_version': policy.get('version')}

        n     = len(results)
        mae   = sum(r['error'] for r in results) / n
        rmse  = math.sqrt(sum(r['error'] ** 2 for r in results) / n)
        brier = sum((r['predicted'] - r['observed']) ** 2 for r in results) / n
        dir_acc = sum(1 for r in results if r['correct_direction']) / n

        by_cat: Dict[str, Dict] = {}
        for r in results:
            cat = r.get('category') or 'uncategorized'
            by_cat.setdefault(cat, {'errors': [], 'count': 0})
            by_cat[cat]['errors'].append(r['error'])
            by_cat[cat]['count'] += 1
        by_category_out = {
            cat: {'count': v['count'], 'MAE': round(sum(v['errors']) / v['count'], 4)}
            for cat, v in by_cat.items()
        }

        return {
            'corpus_size':          len(corpus),
            'MAE':                  round(mae,   4),
            'RMSE':                 round(rmse,  4),
            'brier_score':          round(brier, 6),
            'directional_accuracy': round(dir_acc, 4),
            'per_event':            results,
            'by_category':          by_category_out,
            'policy_version':       policy.get('version', 'unversioned')
        }

    async def sensitivity_analysis(self, corpus: List[Dict], policy: Dict, delta: float = 0.05) -> Dict:
        """Phase E.26 — measure MAE sensitivity to each synthesis weight perturbation."""
        import copy
        validate_policy(policy)

        async def _mae(p: Dict) -> float:
            errors = []
            for item in corpus:
                if item.get('input') is None or item.get('observed_outcome') is None:
                    continue
                try:
                    pred = await self.predict_event(item['input'], p)
                    errors.append(abs((pred['synthesis'].get('ultraCTH') or 0) - clamp(float(item['observed_outcome']))))
                except Exception:
                    pass
            return sum(errors) / len(errors) if errors else float('nan')

        baseline_mae = await _mae(policy)
        weight_keys  = list(policy['synthesis']['weights'].keys())
        sensitivities: Dict = {}

        for key in weight_keys:
            up_policy   = copy.deepcopy(policy)
            down_policy = copy.deepcopy(policy)
            original    = policy['synthesis']['weights'][key]
            up_policy['synthesis']['weights'][key]   = original + delta
            down_policy['synthesis']['weights'][key] = max(0.0, original - delta)
            up_mae   = await _mae(up_policy)
            down_mae = await _mae(down_policy)
            sensitivity = (up_mae - down_mae) / (2 * delta) if delta != 0 else 0
            sensitivities[f'synthesis.weights.{key}'] = {
                'original_value': original,
                'up_MAE':    round(up_mae,    4),
                'down_MAE':  round(down_mae,  4),
                'sensitivity': round(sensitivity, 4)
            }

        return {'baseline_MAE': round(baseline_mae, 4), 'delta': delta, 'sensitivities': sensitivities}

    async def optimize_policy(self, corpus: List[Dict], policy: Dict, iterations: int = 20) -> Dict:
        """Phase E.27 — deterministic hill-climbing over synthesis weights to minimize MAE."""
        import copy
        validate_policy(policy)

        async def _mae(p: Dict) -> float:
            errors = []
            for item in corpus:
                if item.get('input') is None or item.get('observed_outcome') is None:
                    continue
                try:
                    pred = await self.predict_event(item['input'], p)
                    errors.append(abs((pred['synthesis'].get('ultraCTH') or 0) - clamp(float(item['observed_outcome']))))
                except Exception:
                    pass
            return sum(errors) / len(errors) if errors else float('nan')

        best_policy = copy.deepcopy(policy)
        best_mae    = await _mae(best_policy)
        initial_mae = best_mae
        weight_keys = list(policy['synthesis']['weights'].keys())

        for i in range(iterations):
            candidate = copy.deepcopy(best_policy)
            key       = weight_keys[i % len(weight_keys)]
            direction = 1 if math.sin(i * 1000.73 + 7.19) > 0 else -1
            delta     = 0.02
            candidate['synthesis']['weights'][key] = max(0.01, candidate['synthesis']['weights'][key] + direction * delta)
            total = sum(candidate['synthesis']['weights'].values())
            if total > 0:
                for k in weight_keys:
                    candidate['synthesis']['weights'][k] /= total
            candidate_mae = await _mae(candidate)
            if candidate_mae < best_mae:
                best_mae    = candidate_mae
                best_policy = candidate

        return {
            'optimized_weights': {k: round(v, 6) for k, v in best_policy['synthesis']['weights'].items()},
            'original_weights':  {k: round(v, 6) for k, v in policy['synthesis']['weights'].items()},
            'best_MAE':    round(best_mae,    4),
            'initial_MAE': round(initial_mae, 4),
            'improvement': round(initial_mae - best_mae, 4),
            'iterations_run': iterations
        }

    async def compare(self, event_input: Dict, policies: List[Dict]) -> Dict:
        if len(policies) < 2:
            raise ValueError('[CTH] compare() requires at least 2 policies.')
        runs = []
        for p in policies:
            validate_policy(p)
            result = await self.predict_event(event_input, p)
            runs.append({'policy_version': p.get('version', 'unversioned'), 'synthesis': result['synthesis'], 'hash': result['hash']})
        scores   = [r['synthesis']['ultraCTH'] for r in runs]
        max_diff = max(scores) - min(scores)
        return {'event_id': event_input.get('id'), 'runs': runs, 'max_discrepancy': round(max_diff, 4)}

    async def predict_event(self, event_data: Optional[Dict], policy: Dict) -> Dict:
        validate_policy(policy)
        input_data = self._validate_input(event_data)
        mc = {**input_data['macro_context'], 'token_instance': input_data['token_instance']}

        foundation = await CTHCoreFoundationEngine(mc, policy).process()
        analysis   = await CTHAnalysisEngine(mc, policy).process()
        dynamics   = await CTHPredictiveDynamicsEngine(mc, policy).process()
        temporal   = CTHTemporalEngine(mc, policy).process(input_data.get('outcome'))
        chaos      = await CTHChaosResilienceEngine(mc, policy).process()
        butterfly  = await CTHButterflyFieldEngine(mc, policy).process(input_data)

        # Token Dynamics (Phase E.25 / F.28): multi-actor interaction when token_instances[] provided
        tis_list = input_data.get('token_instances')
        if isinstance(tis_list, list) and len(tis_list) > 1:
            token_dynamics = CTHMultiTokenEngine(tis_list, policy).process()
        else:
            token_dynamics = CTHTokenDynamicsEngine(input_data.get('token_instance'), policy).process()

        # Apply TIM in-place before ultraCTH synthesis
        foundation['_original_risk'] = foundation['overallFoundationRisk']
        dynamics['_original_risk']   = dynamics['overallDynamicsRisk']
        chaos['_original_risk']      = chaos['overallChaosShieldRisk']
        foundation['overallFoundationRisk'] = clamp(foundation['overallFoundationRisk'] * token_dynamics['multipliers']['foundation'])
        dynamics['overallDynamicsRisk']     = clamp(dynamics['overallDynamicsRisk']     * token_dynamics['multipliers']['dynamics'])
        chaos['overallChaosShieldRisk']     = clamp(chaos['overallChaosShieldRisk']     * token_dynamics['multipliers']['chaos'])

        engines   = {'foundation': foundation, 'analysis': analysis, 'dynamics': dynamics,
                     'temporal': temporal, 'chaos': chaos, 'butterfly': butterfly, 'token_dynamics': token_dynamics}

        reported_delta_cth = input_data['macro_context'].get('deltaCTH')
        ultra_cth = self._ultra_synthesis(engines, policy, reported_delta_cth)

        tr = policy['synthesis']['deep_zoom_triggers']
        if (dynamics.get('overallDynamicsRisk', 0) > tr['dynamics'] or
                chaos.get('overallChaosShieldRisk', 0) > tr['chaos'] or
                butterfly.get('overallRisk', 0) > tr['butterfly']):
            ultra_cth = self._deep_zoom(ultra_cth, policy, policy.get('seed'))

        mule        = self._mule_clause(input_data, policy, token_dynamics)
        reflexivity = self._reflexivity_penalty(input_data, policy, ultra_cth)
        # Phase F.28 — contested multi-actor events degrade certainty
        conflict_penalty = (token_dynamics.get('interaction') or {}).get('certainty_penalty', 0)
        final_ultra = clamp(reflexivity['adjusted_ultraCTH'] - conflict_penalty)
        pop_mod     = self._population_modulation(input_data, policy, final_ultra)

        sp       = policy['synthesis']
        brackets = sp['certainty_brackets']
        bracket  = next((b for b in brackets if b.get('threshold') is not None and final_ultra > b['threshold']),
                        brackets[-1])

        synthesis = {
            'ultraCTH':              round(final_ultra, 6),
            'rmd_prediction':        final_ultra > sp['prediction_threshold'],
            'alphabreak':            final_ultra > sp['alphabreak_threshold'],
            'certainty_bracket':     bracket['label'],
            'recommend_anchor':      final_ultra <= sp['recommendation_threshold'],
            'mule_clause':           mule,
            'reflexivity':           reflexivity,
            'multi_token_interaction': token_dynamics.get('interaction'),
            'population_modulation': pop_mod,
            'schema_version':        SCHEMA_VERSION
        }

        hash_val = compute_hash(input_data, policy, synthesis)
        audit    = (foundation['_audit'] + analysis['_audit'] + dynamics['_audit'] +
                    temporal['_audit'] + chaos['_audit'] + butterfly['_audit'] +
                    [{'metric': 'ultraSynthesis', 'weights': sp['weights'], 'result': ultra_cth},
                     {'mule_clause': mule}, {'reflexivity': reflexivity}])

        result = {'schema_version': SCHEMA_VERSION, 'event_id': input_data['id'],
                  'engines': engines, 'synthesis': synthesis, 'hash': hash_val, '_audit': audit}
        self._emit('prediction', {'event_id': input_data['id'], 'synthesis': synthesis, 'hash': hash_val,
                                  'timestamp': int(datetime.now().timestamp() * 1000)})
        return result
