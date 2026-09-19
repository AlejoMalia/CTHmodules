/**
 * CTH FULL VALIDATION RUN — v4.1
 * Run: npm run validate
 *
 * Executes the complete out-of-sample validation battery on the universal
 * corpus and writes the auditable report to validation-report.json.
 * Deterministic: identical corpus + policy always reproduce this report.
 */

import { writeFileSync } from 'node:fs';
import { buildUniversalCorpus, CORPUS_SIZE } from '../cth-corpus.js';
import { fullReport } from '../cth-validation.js';
import { POLICY_GENERAL } from '../cth-policy-variants.js';

console.log(`CTH v4.1 validation — universal corpus (${CORPUS_SIZE} events, ~5,100 years)\n`);
const corpus = buildUniversalCorpus();

const report = await fullReport(corpus, POLICY_GENERAL, {
    loo:      { optimize_iterations: 6 },
    kfold:    { k: 5, optimize_iterations: 8 },
    transfer: { split_year: 1800, optimize_iterations: 10 }
});

const { _detail, ...summary } = report;
console.log(JSON.stringify(summary, null, 2));
writeFileSync(new URL('../validation-report.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log('\nfull report → validation-report.json');
