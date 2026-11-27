import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildInstallCommand } from '../src/features/install-auth/commands.mjs';

test('POSIX quoting preserves credential as one literal argument', () => {
  const token = 'fixture\' $HOME $(false); `false` " \\ $&';
  // Only printf runs; no installation or network operation.
  const command = buildInstallCommand("printf '%s' 'token'", token);
  const result = spawnSync('sh', ['-c', command], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, token);
});
test('PowerShell uses single-quoted literals and doubled quotes', () => {
  assert.equal(
    buildInstallCommand("installer -Token 'token'", "a'b$&", true),
    "installer -Token 'a''b$&'",
  );
});
test('invalid credentials and missing placeholders are rejected', () => {
  for (const token of ['', ' ', null, 'x\ny', 'x\u0000y', 'x'.repeat(513)])
    assert.throws(() => buildInstallCommand("installer 'token'", token));
  assert.throws(() => buildInstallCommand('installer', 'fixture'));
});
