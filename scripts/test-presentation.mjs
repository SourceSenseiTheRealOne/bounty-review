import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (file) => (await readFile(path.join(root, file), 'utf8')).replace(/^\uFEFF/, '');

test('current visible identity is Bounty Review', async () => {
  for (const file of [
    'apps/web/src/app/layout.tsx',
    'apps/web/src/components/security-console.tsx',
    'apps/web/src/components/paid-bounties.tsx',
  ]) {
    const content = await read(file);
    assert.match(content, /Bounty Review/);
    assert.doesNotMatch(content, /SomniBounty AI|SOMNIBOUNTY AI/);
  }
});

test('README uses architecture rather than decorative branding or a live-demo claim', async () => {
  const readme = await read('README.md');
  assert.match(readme, /^# Bounty Review/m);
  assert.match(readme, /docs\/architecture\.svg/);
  assert.doesNotMatch(readme, /somnibounty-readme-banner|somnibounty-logo-concept|\[Live demo\]/i);
  assert.match(readme, /hackathon/i);
  assert.match(readme, /not a production audit/i);
});

test('evidence keeps known deployment and dependency limits visible', async () => {
  const evidence = await read('docs/evidence.md');
  assert.match(evidence, /497055778/);
  assert.match(evidence, /1 critical, 8 high, 1 moderate/);
  assert.match(evidence, /0xf920336C3e1A681dBbFBF690D334C60313ab9889/);
  assert.match(evidence, /parity.*not established/i);
});
