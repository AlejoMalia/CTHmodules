"""
CTH JS↔PYTHON PARITY CHECK — v4.1 (Phase F.37)
Run:  node test/run-tests.js  (writes test/parity-fixture.json)
      python3 cth-python/parity_check.py

Loads the canonical fixture produced by the JS kernel and re-runs the SAME
input + policy through the Python kernel. Both implementations use identical
deterministic trigonometric noise, so results must agree within a rounding
tolerance (JS toFixed vs Python round differ only at half-ulp boundaries).

Exit code 0 = parity holds; 1 = divergence detected (with per-field report).
"""

import asyncio
import importlib.util
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(HERE, '..', 'test', 'parity-fixture.json')
TOLERANCE = 5e-3  # rounding-policy differences only; structural divergence is orders larger


def load_core():
    spec = importlib.util.spec_from_file_location('cth_core', os.path.join(HERE, 'cth-core.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    if not os.path.exists(FIXTURE):
        print('parity: fixture not found — run `npm test` first to generate test/parity-fixture.json')
        return 1

    with open(FIXTURE) as f:
        fixture = json.load(f)

    core = load_core()
    engine = core.CTHMasterPredictorEngine()
    result = asyncio.get_event_loop().run_until_complete(
        engine.predict_event(fixture['input'], fixture['policy'])
    )

    py = {
        'ultraCTH':          result['synthesis']['ultraCTH'],
        'foundation_risk':   result['engines']['foundation']['overallFoundationRisk'],
        'dynamics_risk':     result['engines']['dynamics']['overallDynamicsRisk'],
        'chaos_risk':        result['engines']['chaos']['overallChaosShieldRisk'],
        'butterfly_risk':    result['engines']['butterfly']['overallRisk'],
        'token_impact_score': result['engines']['token_dynamics']['token_impact_score'],
        'lyapunov_exponent':  result['engines']['butterfly']['butterflyEffect']['lyapunov']['exponent'],
        'ews_autocorr':       result['engines']['chaos']['earlyWarning']['autocorr_lag1'],
    }
    js = fixture['js_reference']

    print(f"CTH parity check — schema {fixture['schema_version']}, tolerance {TOLERANCE}")
    failures = 0
    for key, js_val in js.items():
        py_val = py.get(key)
        if py_val is None or js_val is None:
            status, diff = 'MISSING', float('nan')
            failures += 1
        else:
            diff = abs(float(js_val) - float(py_val))
            status = 'OK' if diff <= TOLERANCE else 'DIVERGED'
            if status == 'DIVERGED':
                failures += 1
        print(f"  {status:9s} {key:22s} js={js_val}  py={py_val}  |Δ|={diff:.6f}" if not math.isnan(diff)
              else f"  {status:9s} {key:22s} js={js_val}  py={py_val}")

    if failures:
        print(f"\nparity FAILED — {failures} field(s) diverged")
        return 1
    print("\nparity OK — JS and Python kernels agree")
    return 0


if __name__ == '__main__':
    sys.exit(main())
