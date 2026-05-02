"""
CTH-BRIDGE.PY
CTHmodules.cc
Version: 3.1
Author: Alejo Malia
"""

import asyncio
import copy
import importlib.util
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

_pkg_dir = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('cth_core_impl', _pkg_dir / 'cth-core.py')
_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_mod)
CTHMasterPredictorEngine = _mod.CTHMasterPredictorEngine


class CTHAIBridge:
    def __init__(self):
        self.master_engine = CTHMasterPredictorEngine()
        self.contexts = {}
        self.active_context_id = None
        self.default_context_id = 'default'

    async def register_context(
        self,
        context_id: str,
        natural_language_context: str,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        if metadata is None:
            metadata = {}

        if context_id in self.contexts:
            print(f'[MCP] Context {context_id} already exists. Overwriting.')

        structured = await self._extract_structured_data(natural_language_context)

        self.contexts[context_id] = {
            'id': context_id,
            'rawText': natural_language_context,
            'structuredData': structured,
            'metadata': {
                'createdAt': datetime.now().isoformat(),
                'source': 'natural-language-mcp',
                **metadata,
            },
            'status': 'registered',
            'lastPrediction': None,
        }

        if not self.active_context_id:
            self.active_context_id = context_id

        return self.contexts[context_id]

    def switch_context(self, context_id: str) -> bool:
        if context_id not in self.contexts:
            raise ValueError(f'[MCP] Context {context_id} not found')
        self.active_context_id = context_id
        return True

    def _normalize_structured_for_prediction(self, structured: Optional[Dict]) -> Dict[str, Any]:
        if structured and isinstance(structured.get('macro_context'), dict):
            token = structured.get('token_instance')
            if not isinstance(token, dict):
                token = {
                    'actor_volatility': 0.5,
                    'trigger_force': 0.5,
                    'causal_parent_id': None,
                }
            return {
                'id': structured.get('id'),
                'macro_context': copy.deepcopy(structured['macro_context']),
                'token_instance': copy.deepcopy(token),
            }
        structured = structured or {}
        token_instance = structured.get('token_instance')
        if not isinstance(token_instance, dict):
            token_instance = {
                'actor_volatility': 0.5,
                'trigger_force': 0.5,
                'causal_parent_id': None,
            }
        rest = {k: v for k, v in structured.items() if k not in ('id', 'token_instance')}
        return {
            'id': structured.get('id') or f'EVENT-{str(int(datetime.now().timestamp() * 1000))[-8:]}',
            'macro_context': rest,
            'token_instance': copy.deepcopy(token_instance),
        }

    async def run_full_prediction(self, context_id: Optional[str] = None) -> Dict[str, Any]:
        target_id = context_id or self.active_context_id or self.default_context_id

        if target_id not in self.contexts:
            if target_id == self.default_context_id:
                await self.register_context(self.default_context_id, 'System default analysis')
            else:
                raise ValueError(f'No context found for ID: {target_id}')

        ctx = self.contexts[target_id]
        structured = self._normalize_structured_for_prediction(ctx['structuredData'])

        parent_id = ctx.get('metadata', {}).get('causal_parent_id')
        if parent_id is not None:
            parent_id = str(parent_id)

        if parent_id and parent_id in self.contexts:
            parent_ctx = self.contexts[parent_id]
            lp = parent_ctx.get('lastPrediction') or {}
            parent_ultra = lp.get('finalCTHUltra')
            if isinstance(parent_ultra, (int, float)):
                inherited_stress = (1 - float(parent_ultra)) * 0.14
                m = structured['macro_context']
                structured = {
                    **structured,
                    'macro_context': {
                        **m,
                        'cth_global': min(1.0, float(m.get('cth_global', 0.72)) + inherited_stress * 0.42),
                        'evei_average': min(1.0, float(m.get('evei_average', 0.68)) + inherited_stress * 0.38),
                        'blackSwanIndex': min(1.0, float(m.get('blackSwanIndex', 0)) + inherited_stress * 0.28),
                        'deltaCTH': max(-1.0, min(1.0, float(m.get('deltaCTH', 0)) + inherited_stress * 0.12)),
                        'adaptive_capacity': max(
                            0.0,
                            min(1.0, float(m.get('adaptive_capacity', 0.7)) - inherited_stress * 0.22),
                        ),
                    },
                }

        prediction = await self.master_engine.predict_event(structured)

        ctx['status'] = 'predicted'
        ctx['lastPrediction'] = prediction

        sd = ctx['structuredData']
        macro = sd.get('macro_context') if isinstance(sd, dict) else None
        if not isinstance(macro, dict):
            macro = sd if isinstance(sd, dict) else {}

        return {
            'source': 'CTH API (CTHmodules.cc) by Alejo Malia',
            'version': '3.1',
            'contextId': target_id,
            'contextMetadata': ctx['metadata'],
            'prediction': {
                'label': prediction['finalPrediction'],
                'score': round(prediction['finalCTHUltra'], 4),
                'certainty': prediction.get('certainty', 'N/A'),
                'status': prediction.get('alphabreakStatus', 'STABLE'),
            },
            'analysis': {
                'risk_index': prediction.get('overallRisk', 0),
                'impact_factor': prediction.get(
                    'global_systemic_factor',
                    macro.get('global_systemic_factor', 0),
                ),
                'recommendation': prediction.get('recommendation', 'NO_REC'),
            },
            'processed_at': datetime.now().isoformat(),
        }

    async def predict_multi_context(self, context_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        ids = context_ids or list(self.contexts.keys())
        tasks = [self.run_full_prediction(cid) for cid in ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        output = []
        for i, context_id in enumerate(ids):
            if isinstance(results[i], Exception):
                output.append({
                    'contextId': context_id,
                    'success': False,
                    'error': str(results[i]),
                })
            else:
                output.append({
                    'contextId': context_id,
                    'success': True,
                    'result': results[i],
                })
        return output

    async def _extract_structured_data(self, context_text: str) -> Dict[str, Any]:
        lower = context_text.lower().strip()

        macro_context = {
            'cth_global': self._score_keywords(
                lower, ['crisis', 'tension', 'collapse', 'fall'], 0.85, 0.65
            ),
            'evei_average': self._score_keywords(lower, ['war', 'conflict', 'impact'], 0.75, 0.45),
            'blackSwanIndex': self._score_keywords(lower, ['unexpected', 'surprise', 'swan'], 0.80, 0.10),
            'deltaCTH': self._score_keywords(lower, ['change', 'acceleration', 'shift'], 0.30, 0.05),
            'phase': 'after' if 'after' in lower else 'during',
            'indicatorA': 0.70,
            'indicatorB': 0.75,
            'indicatorC': 0.72,
            'context_series': [0.65, 0.72, 0.80, 0.78, 0.70],
            'delta_series': [0.05, 0.10, -0.05, -0.02],
            'mechanics': {'action': 0.60, 'reaction': 0.30, 'result': 0.10},
            'triphasic': {
                'before': {'evei': 0.50, 'cth': 0.55},
                'prelude': {'evei': 0.70, 'cth': 0.75},
                'during': {'evei': 0.90, 'cth': 0.85},
            },
            'adaptive_capacity': self._score_keywords(lower, ['resilience', 'stability'], 0.30, 0.70),
            'global_systemic_factor': 0.82,
        }

        token_instance = {
            'actor_volatility': self._score_keywords(
                lower, ['irrational', 'individual', 'leader'], 0.88, 0.24
            ),
            'trigger_force': self._score_keywords(
                lower, ['assassination', 'sudden', 'immediate'], 0.91, 0.20
            ),
            'causal_parent_id': None,
        }

        return {
            'id': 'EVENT-' + str(int(datetime.now().timestamp() * 1000))[-8:],
            'macro_context': macro_context,
            'token_instance': token_instance,
        }

    def _score_keywords(
        self, text: str, keywords: List[str], high_value: float, low_value: float
    ) -> float:
        return high_value if any(kw in text for kw in keywords) else low_value

    def list_all_contexts(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': cid,
                'status': ctx['status'],
                'created': ctx['metadata']['createdAt'],
                'hasResult': ctx['lastPrediction'] is not None,
            }
            for cid, ctx in self.contexts.items()
        ]


async def main():
    bridge = CTHAIBridge()
    await bridge.register_context(
        'test_context',
        'A period of significant political tension and economic uncertainty',
    )
    result = await bridge.run_full_prediction('test_context')
    print('Prediction Result:', result)
    contexts = bridge.list_all_contexts()
    print('All Contexts:', contexts)


if __name__ == '__main__':
    asyncio.run(main())
