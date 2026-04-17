"""
CTH-BRIDGE.PY
CTHmodules.cc
Version: 3.0
Author: Alejo Malia
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from cth_core import CTHMasterPredictorEngine


class CTHAIBridge:
    def __init__(self):
        self.master_engine = CTHMasterPredictorEngine()
        self.contexts = {}
        self.active_context_id = None
        self.default_context_id = 'default'

    async def register_context(self, context_id: str, natural_language_context: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Register a new context with natural language input.
        
        Args:
            context_id: Unique identifier for the context
            natural_language_context: Natural language description of the context
            metadata: Optional metadata dictionary
            
        Returns:
            The registered context data
        """
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
                **metadata
            },
            'status': 'registered',
            'lastPrediction': None
        }
        
        if not self.active_context_id:
            self.active_context_id = context_id
        
        return self.contexts[context_id]

    def switch_context(self, context_id: str) -> bool:
        """
        Switch to a different registered context.
        
        Args:
            context_id: The ID of the context to switch to
            
        Returns:
            True if successful
            
        Raises:
            ValueError: If context not found
        """
        if context_id not in self.contexts:
            raise ValueError(f'[MCP] Context {context_id} not found')
        
        self.active_context_id = context_id
        return True

    async def run_full_prediction(self, context_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run a full prediction on a specific context.
        
        Args:
            context_id: The context ID to predict on. If None, uses active context.
            
        Returns:
            Prediction results with analysis
        """
        target_id = context_id or self.active_context_id or self.default_context_id
        
        if target_id not in self.contexts:
            if target_id == self.default_context_id:
                await self.register_context(self.default_context_id, 'System default analysis')
            else:
                raise ValueError(f'No context found for ID: {target_id}')
        
        ctx = self.contexts[target_id]
        prediction = await self.master_engine.predict_event(ctx['structuredData'])
        
        ctx['status'] = 'predicted'
        ctx['lastPrediction'] = prediction
        
        return {
            'source': 'CTH API (CTHmodules.cc) by Alejo Malia',
            'version': '3.0',
            'contextId': target_id,
            'contextMetadata': ctx['metadata'],
            'prediction': {
                'label': prediction['finalPrediction'],
                'score': round(prediction['finalCTHUltra'], 4),
                'certainty': prediction.get('certainty', 'N/A'),
                'status': prediction.get('alphabreakStatus', 'STABLE')
            },
            'analysis': {
                'risk_index': prediction.get('overallRisk', 0),
                'impact_factor': ctx['structuredData'].get('global_systemic_factor', 0),
                'recommendation': prediction.get('recommendation', 'NO_REC')
            },
            'processed_at': datetime.now().isoformat()
        }

    async def predict_multi_context(self, context_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Run predictions on multiple contexts in parallel.
        
        Args:
            context_ids: List of context IDs to predict. If None, uses all contexts.
            
        Returns:
            List of prediction results for each context
        """
        ids = context_ids or list(self.contexts.keys())
        
        tasks = [self.run_full_prediction(cid) for cid in ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        output = []
        for i, context_id in enumerate(ids):
            if isinstance(results[i], Exception):
                output.append({
                    'contextId': context_id,
                    'success': False,
                    'error': str(results[i])
                })
            else:
                output.append({
                    'contextId': context_id,
                    'success': True,
                    'result': results[i]
                })
        
        return output

    async def _extract_structured_data(self, context_text: str) -> Dict[str, Any]:
        """
        Extract structured data from natural language context.
        
        Args:
            context_text: Natural language text to analyze
            
        Returns:
            Structured data dictionary with CTH metrics
        """
        lower = context_text.lower().strip()
        
        return {
            'id': 'EVENT-' + str(int(datetime.now().timestamp() * 1000))[-8:],
            'cth_global': self._score_keywords(lower, ['crisis', 'tension', 'collapse', 'fall'], 0.85, 0.65),
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
                'during': {'evei': 0.90, 'cth': 0.85}
            },
            'adaptive_capacity': self._score_keywords(lower, ['resilience', 'stability'], 0.30, 0.70),
            'global_systemic_factor': 0.82
        }

    def _score_keywords(self, text: str, keywords: List[str], high_value: float, low_value: float) -> float:
        """
        Score text based on keyword presence.
        
        Args:
            text: Text to analyze
            keywords: List of keywords to search for
            high_value: Score if keyword found
            low_value: Score if keyword not found
            
        Returns:
            Score value
        """
        return high_value if any(kw in text for kw in keywords) else low_value

    def list_all_contexts(self) -> List[Dict[str, Any]]:
        """
        List all registered contexts.
        
        Returns:
            List of context metadata
        """
        return [
            {
                'id': cid,
                'status': ctx['status'],
                'created': ctx['metadata']['createdAt'],
                'hasResult': ctx['lastPrediction'] is not None
            }
            for cid, ctx in self.contexts.items()
        ]


async def main():
    """
    Example usage of the CTHAIBridge
    """
    bridge = CTHAIBridge()
    
    # Register a context
    await bridge.register_context(
        'test_context',
        'A period of significant political tension and economic uncertainty'
    )
    
    # Run prediction
    result = await bridge.run_full_prediction('test_context')
    print('Prediction Result:', result)
    
    # List contexts
    contexts = bridge.list_all_contexts()
    print('All Contexts:', contexts)


if __name__ == '__main__':
    asyncio.run(main())