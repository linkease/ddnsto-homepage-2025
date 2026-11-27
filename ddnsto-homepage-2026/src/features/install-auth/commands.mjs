/** Quote only the token argument; never interpolate credentials into script bodies. */
export function buildInstallCommand(template, token, windows = false) {
  if (
    typeof token !== 'string' ||
    !token.trim() ||
    token.length > 512 ||
    /[\u0000-\u001f\u007f]/.test(token)
  ) {
    throw new Error('设备令牌格式异常，请重新获取');
  }
  const quoted = windows
    ? "'" + token.replaceAll("'", "''") + "'"
    : "'" + token.replaceAll("'", "'\"'\"'") + "'";
  if (!template.includes("'token'"))
    throw new Error('安装命令模板缺少令牌参数');
  return template.replaceAll("'token'", () => quoted);
}
