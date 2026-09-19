"""
CTH-BRIDGE.PY — v4.1
Author: Alejo Malia | CTHmodules.cc

Multi-context manager and adapter layer.
No NLP, no keyword parsing, no hardcoded defaults.

Input comes structured from the caller via an IDataAdapter (Phase B.6).
Policy is injected per call (Phase A.4).
Causal parent stress decays by half-life (Phase D.20).

IDataAdapter contract:
  Any class with:
    def adapt(self, raw_input) -> dict
  where the returned dict satisfies the engine input requirements.

Usage:
    from cth_bridge import CTHAIBridge, PassthroughAdapter
    from cth_policy_schema import EXAMPLE_POLICY_V31_REFERENCE as POLICY

    bridge = CTHAIBridge()
    await bridge.register_context('evt-1', structured_data, POLICY, adapter=PassthroughAdapter())
    result = await bridge.run_full_prediction('evt-1')
"""

import asyncio
import copy
import math
import importlib.util
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

# ── dynamic import of cth-core.py ────────────────────────────────────────────
_pkg_dir = Path(__file__).resolve().parent
_spec    = importlib.util.spec_from_file_location('cth_core_impl', _pkg_dir / 'cth-core.py')
_mod     = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_mod)

CTHMasterPredictorEngine = _mod.CTHMasterPredictorEngine
validate_policy          = _mod.validate_policy
SCHEMA_VERSION           = _mod.SCHEMA_VERSION

# ─── IDataAdapter (Phase B.6) ────────────────────────────────────────────────

class IDataAdapter:
    """
    Interface: convert any domain-specific input into canonical CTH structure.
    Implement adapt() in a subclass; the kernel never handles raw formats.
    """
    def adapt(self, raw_input: Any) -> Dict:
        raise NotImplementedError('[CTH] IDataAdapter.adapt() must be implemented by the caller.')


class PassthroughAdapter(IDataAdapter):
    """Use when the caller already provides the canonical structure."""
    def adapt(self, raw_input: Any) -> Dict:
        if not isinstance(raw_input, dict) or not isinstance(raw_input.get('macro_context'), dict):
            raise ValueError('[CTH] PassthroughAdapter: input must already contain a macro_context dict.')
        return raw_input

# ─── Causal decay (Phase D.20) ────────────────────────────────────────────────

def inherited_stress_with_decay(parent_ultra: float, time_since_parent: Optional[float], policy: Dict) -> Dict:
    """
    Compute stress inherited from parent event, optionally decayed by half-life.
    half_life and time_since_parent must be in the same units (caller's responsibility).
    """
    cfg        = policy.get('causal_inheritance', {})
    raw_stress = (1.0 - parent_ultra) * cfg.get('stress_factor', 0.14)
    if time_since_parent is None or cfg.get('half_life') is None:
        return {'stress': raw_stress, 'decayed': False, 'decay_factor': None}
    decay = math.pow(0.5, time_since_parent / cfg['half_life'])
    return {'stress': raw_stress * decay, 'decayed': True, 'decay_factor': round(decay, 4)}


def apply_inherited_stress(macro_context: Dict, stress: float, policy: Dict) -> Dict:
    cfg = policy.get('causal_inheritance', {})
    m   = macro_context
    return {
        **m,
        'cth_global':        min(1.0, float(m.get('cth_global',        0)) + stress * cfg.get('cth_factor',        0.42)),
        'evei_average':      min(1.0, float(m.get('evei_average',      0)) + stress * cfg.get('evei_factor',       0.38)),
        'blackSwanIndex':    min(1.0, float(m.get('blackSwanIndex',    0)) + stress * cfg.get('black_swan_factor', 0.28)),
        'deltaCTH':          max(-1.0, min(1.0, float(m.get('deltaCTH', 0)) + stress * cfg.get('delta_cth_factor', 0.12))),
        'adaptive_capacity': max(0.0,  min(1.0, float(m.get('adaptive_capacity', 1)) - stress * cfg.get('adaptive_penalty', 0.22)))
    }

# ─── Bridge ────────────────────────────────────────────────────────────────────

class CTHAIBridge:
    def __init__(self):
        self.master_engine    = CTHMasterPredictorEngine()
        self.contexts: Dict   = {}
        self.active_context_id: Optional[str] = None

    async def register_context(
        self,
        context_id: str,
        raw_data: Any,
        policy: Dict,
        adapter: Optional[IDataAdapter] = None,
        causal_parent_id: Optional[str] = None,
        time_since_parent: Optional[float] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Register a context with structured data.
        If adapter is None, PassthroughAdapter is used (raw_data must be canonical).

        Parameters
        ----------
        context_id        : unique string identifier for this event
        raw_data          : any format — adapter.adapt() converts it to canonical form
        policy            : CTH Policy dict (validated on use)
        adapter           : IDataAdapter subclass; defaults to PassthroughAdapter
        causal_parent_id  : context_id of parent event for causal inheritance
        time_since_parent : temporal distance from parent (same units as policy.causal_inheritance.half_life)
        metadata          : arbitrary caller metadata stored alongside the context
        """
        if adapter is None:
            adapter = PassthroughAdapter()
        if not callable(getattr(adapter, 'adapt', None)):
            raise TypeError('[CTH] adapter must implement IDataAdapter (must have an adapt() method).')

        structured = adapter.adapt(raw_data)

        if context_id in self.contexts:
            print(f'[CTH] Context {context_id} already exists. Overwriting.')

        self.contexts[context_id] = {
            'id':                context_id,
            'structured_data':   structured,
            'policy':            policy,
            'causal_parent_id':  causal_parent_id,
            'time_since_parent': time_since_parent,
            'metadata':          {'created_at': datetime.now().isoformat(), **(metadata or {})},
            'status':            'registered',
            'last_prediction':   None
        }

        if self.active_context_id is None:
            self.active_context_id = context_id
        return self.contexts[context_id]

    def switch_context(self, context_id: str) -> bool:
        if context_id not in self.contexts:
            raise ValueError(f'[CTH] Context {context_id} not found.')
        self.active_context_id = context_id
        return True

    async def run_full_prediction(
        self,
        context_id: Optional[str] = None,
        policy_override: Optional[Dict] = None
    ) -> Dict:
        """
        Run a full CTH prediction for a registered context.
        policy_override, if provided, takes precedence over the context's registered policy.
        """
        target_id = context_id or self.active_context_id
        if not target_id:
            raise ValueError('[CTH] No context_id specified and no active context set.')
        if target_id not in self.contexts:
            raise ValueError(f'[CTH] Context {target_id} not found.')

        ctx    = self.contexts[target_id]
        policy = policy_override or ctx['policy']
        if policy is None:
            raise ValueError(f'[CTH] No Policy provided for context {target_id}.')
        validate_policy(policy)

        structured = copy.deepcopy(ctx['structured_data'])

        # Causal inheritance with temporal decay (Phase D.20)
        parent_id = ctx['causal_parent_id']
        causal_info = None
        if parent_id and parent_id in self.contexts:
            parent_ctx   = self.contexts[parent_id]
            parent_ultra = (parent_ctx.get('last_prediction') or {}).get('synthesis', {}).get('ultraCTH')
            if isinstance(parent_ultra, (int, float)):
                decay_result = inherited_stress_with_decay(float(parent_ultra), ctx['time_since_parent'], policy)
                stress       = decay_result['stress']
                new_macro    = apply_inherited_stress(structured['macro_context'], stress, policy)
                structured   = {**structured, 'macro_context': new_macro}
                causal_info  = {'parent_id': parent_id, 'stress': round(stress, 4),
                                'decayed': decay_result['decayed'], 'decay_factor': decay_result['decay_factor']}

        prediction = await self.master_engine.predict_event(structured, policy)
        ctx['status']          = 'predicted'
        ctx['last_prediction'] = prediction

        return {
            'source':           'CTH API (CTHmodules.cc) by Alejo Malia',
            'schema_version':   SCHEMA_VERSION,
            'context_id':       target_id,
            'context_metadata': ctx['metadata'],
            'causal_inheritance': causal_info,
            'prediction': {
                'rmd':                prediction['synthesis']['rmd_prediction'],
                'ultraCTH':           prediction['synthesis']['ultraCTH'],
                'certainty_bracket':  prediction['synthesis']['certainty_bracket'],
                'alphabreak':         prediction['synthesis']['alphabreak'],
                'mule_clause':        prediction['synthesis']['mule_clause'],
                'reflexivity':        prediction['synthesis']['reflexivity'],
                'population_modulation': prediction['synthesis']['population_modulation'],
                'recommend_anchor':   prediction['synthesis']['recommend_anchor']
            },
            'engines': {
                'foundation_risk':          prediction['engines']['foundation'].get('overallFoundationRisk'),
                'temporal_risk':            prediction['engines']['temporal'].get('overallTemporalRisk'),
                'dynamics_risk':            prediction['engines']['dynamics'].get('overallDynamicsRisk'),
                'chaos_shield_risk':        prediction['engines']['chaos'].get('overallChaosShieldRisk'),
                'butterfly_risk':           prediction['engines']['butterfly'].get('overallRisk'),
                'analytical_vulnerability': prediction['engines']['analysis'].get('overallAnalyticalVulnerability'),
                'token_dynamics': (lambda td: {
                    'token_impact_score': td.get('token_impact_score'),
                    'historical_role':    td.get('historical_role'),
                    'multipliers':        td.get('multipliers'),
                    'components':         td.get('components')
                } if td else None)(prediction['engines'].get('token_dynamics'))
            },
            'hash':         prediction['hash'],
            'processed_at': datetime.now().isoformat()
        }

    async def predict_multi_context(
        self,
        context_ids: Optional[List[str]] = None,
        policy_override: Optional[Dict] = None
    ) -> List[Dict]:
        """Run predictions for multiple contexts in parallel."""
        ids   = context_ids or list(self.contexts.keys())
        tasks = [self.run_full_prediction(cid, policy_override) for cid in ids]
        raw   = await asyncio.gather(*tasks, return_exceptions=True)
        return [
            {'context_id': cid, 'success': True,  'result': r} if not isinstance(r, Exception)
            else {'context_id': cid, 'success': False, 'error': str(r)}
            for cid, r in zip(ids, raw)
        ]

    def list_all_contexts(self) -> List[Dict]:
        return [
            {'id': cid, 'status': ctx['status'], 'created': ctx['metadata'].get('created_at'),
             'has_result': ctx['last_prediction'] is not None, 'causal_parent': ctx['causal_parent_id']}
            for cid, ctx in self.contexts.items()
        ]

    def on(self, event: str, fn: Callable) -> 'CTHAIBridge':
        """Phase E.24 — register a hook on the underlying engine."""
        self.master_engine.on(event, fn)
        return self

    async def calibrate(self, corpus: List[Dict], policy_template: Dict, policy: Dict) -> Dict:
        """Phase E.22 — calibration delegation."""
        return await self.master_engine.calibrate(corpus, policy_template, policy)

    async def compare(self, event_input: Dict, policies: List[Dict]) -> Dict:
        """Phase E.23 — inter-policy comparison delegation."""
        return await self.master_engine.compare(event_input, policies)

    async def sensitivity_analysis(self, corpus: List[Dict], policy: Dict, delta: float = 0.05) -> Dict:
        """Phase E.26 — sensitivity analysis delegation."""
        return await self.master_engine.sensitivity_analysis(corpus, policy, delta)

    async def optimize_policy(self, corpus: List[Dict], policy: Dict, iterations: int = 20) -> Dict:
        """Phase E.27 — policy optimization delegation."""
        return await self.master_engine.optimize_policy(corpus, policy, iterations)
