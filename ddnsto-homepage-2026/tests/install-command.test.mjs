import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInstallCommand } from '../src/config/install-command.ts';

for (const mode of [
  undefined,
  '',
  'preview',
  'development',
  'production',
  'unknown',
]) {
  test(`installation defaults to production for ${mode}`, () => {
    assert.equal(
      buildInstallCommand(mode),
      "curl -fsSL https://run.ddnsto.com/install.sh | sh -s -- --token '用户令牌'",
    );
  });
}

test('only explicit test mode selects the reviewed candidate and test business', () => {
  assert.equal(
    buildInstallCommand('test'),
    "curl -fsSL https://web.toany.net/ddnsto-candidates/20261125-0.3.3-entry-r6/ddnsto/install.sh | sh -s -- --env test --token '用户令牌'",
  );
});
