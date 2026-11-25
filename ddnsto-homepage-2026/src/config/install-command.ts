/** Build-time only: unspecified and preview modes use the production service. */
export function buildInstallCommand(mode?: string): string {
  const test = mode === 'test';
  const base = test
    ? 'https://web.toany.net/ddnsto-candidates/20261125-0.3.3-entry-r6/ddnsto'
    : 'https://run.ddnsto.com';
  return `curl -fsSL ${base}/install.sh | sh -s --${test ? ' --env test' : ''} --token '用户令牌'`;
}
