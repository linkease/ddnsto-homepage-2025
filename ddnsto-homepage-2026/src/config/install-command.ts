/** Build-time only: unspecified and preview modes use the production service. */
export function getInstallCommandConfig(mode?: string) {
  const test = mode === 'test';
  const base = test
    ? 'https://web.toany.net/ddnsto-candidates/20261125-0.3.3-entry-r6/ddnsto'
    : 'https://run.ddnsto.com';
  return {
    scriptUrl: `${base}/install.sh`,
    environmentArgs: test ? ' --env test' : '',
  };
}

export function buildInstallCommand(mode?: string): string {
  const { scriptUrl, environmentArgs } = getInstallCommandConfig(mode);
  return `curl -fsSL ${scriptUrl} | sh -s --${environmentArgs} --token '用户令牌'`;
}
