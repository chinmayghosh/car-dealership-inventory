#!/usr/bin/env node
/**
 * Runs the backend (Jest) and frontend (Vitest) suites with coverage and
 * writes the results to TEST_REPORT.md at the repository root.
 *
 * Usage (from the repo root, after installing both packages):
 *   node scripts/generate-test-report.mjs
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');

function run(cwd, args) {
  // A single command string (args are fixed literals above) so `npx` resolves on Windows too.
  const result = spawnSync(`npx ${args.join(' ')}`, { cwd: join(root, cwd), encoding: 'utf8', shell: true });
  return { ok: result.status === 0, output: stripAnsi(`${result.stdout}\n${result.stderr}`) };
}

/** Pulls the coverage table (the block of lines containing "|") out of the output. */
const coverageTable = (output) =>
  output
    .split('\n')
    .filter((line) => line.includes('|') && !line.includes('>'))
    .join('\n');

const summary = (output) =>
  output
    .split('\n')
    .filter((line) => /^(Statements|Branches|Functions|Lines)\s+:/.test(line.trim()))
    .map((line) => line.trim())
    .join('\n');

/** Jest verbose output: "PASS tests/x.test.ts", then indented describe blocks and "√ test" lines. */
function backendTests(output) {
  const lines = [];
  for (const raw of output.split('\n')) {
    const line = raw.replace(/\s+\(\d+ ms\)$/, '');
    if (/^(PASS|FAIL) /.test(line)) lines.push(`\n**${line.slice(5)}** ${line.startsWith('PASS') ? '✅' : '❌'}`);
    else if (/^\s+(√|✓|✔)/.test(line)) lines.push(`- ✅ ${line.trim().slice(2)}`);
    else if (/^\s+(×|✕|✗)/.test(line)) lines.push(`- ❌ ${line.trim().slice(2)}`);
  }
  return lines.join('\n');
}

/** Vitest verbose output: " ✓ src/file.test.ts > describe > test 3ms". */
function frontendTests(output) {
  const byFile = new Map();
  for (const raw of output.split('\n')) {
    const match = raw.match(/^\s*(✓|×)\s+(\S+\.test\.tsx?)\s+>\s+(.*?)(\s+\d+ms)?$/);
    if (!match) continue;
    const [, mark, file, name] = match;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(`- ${mark === '✓' ? '✅' : '❌'} ${name}`);
  }
  return [...byFile].map(([file, tests]) => `\n**${file}**\n${tests.join('\n')}`).join('\n');
}

/** Extracts "<passed> passed of <total>" from either runner's summary line. */
function totals(output, regex) {
  const match = output.match(regex);
  return match ? `${match[1]} passed of ${match[2]}` : '(not found)';
}

console.log('Running backend tests…');
const backend = run('backend', ['jest', '--runInBand', '--coverage', '--verbose', '--coverageReporters=text', '--coverageReporters=text-summary']);
console.log('Running frontend tests…');
const frontend = run('frontend', ['vitest', 'run', '--coverage', '--reporter=verbose', '--coverage.reporter=text', '--coverage.reporter=text-summary']);

const report = `# Test Report

Generated on ${new Date().toISOString().slice(0, 10)} with \`node scripts/generate-test-report.mjs\`.

| Suite | Runner | Result | Status |
| --- | --- | --- | --- |
| Backend (API, services, middleware) | Jest + Supertest against a real SQLite test database | ${totals(backend.output, /Tests:\s+(\d+) passed, (\d+) total/)} | ${backend.ok ? '✅ passing' : '❌ failing'} |
| Frontend (components, pages, API client) | Vitest + React Testing Library (jsdom) | ${totals(frontend.output, /Tests\s+(\d+) passed \((\d+)\)/)} | ${frontend.ok ? '✅ passing' : '❌ failing'} |

## Backend

### Coverage summary

\`\`\`
${summary(backend.output)}
\`\`\`

### Coverage by file

\`\`\`
${coverageTable(backend.output)}
\`\`\`

### Test cases
${backendTests(backend.output)}

## Frontend

### Coverage summary

\`\`\`
${summary(frontend.output)}
\`\`\`

### Coverage by file

\`\`\`
${coverageTable(frontend.output)}
\`\`\`

### Test cases
${frontendTests(frontend.output)}
`;

writeFileSync(join(root, 'TEST_REPORT.md'), report);
console.log(`Wrote TEST_REPORT.md (backend ${backend.ok ? 'passing' : 'FAILING'}, frontend ${frontend.ok ? 'passing' : 'FAILING'}).`);
process.exitCode = backend.ok && frontend.ok ? 0 : 1;
