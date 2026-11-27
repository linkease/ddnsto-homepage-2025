import QRCode from 'qrcode';
import { createInstallAuthApi } from '../src/features/install-auth/api';
import { InstallAuthSession } from '../src/features/install-auth/session';

const status = document.querySelector<HTMLElement>('#status')!;
const qr = document.querySelector<HTMLImageElement>('#qr')!;
let version = 0;
const session = new InstallAuthSession(createInstallAuthApi(), (state) => {
  const current = ++version;
  qr.hidden = true;
  qr.removeAttribute('src');
  status.dataset.phase = state.phase;
  const labels = {
    loading: '正在检查登录状态并获取二维码…',
    scanning: '请使用微信扫码确认账号。',
    syncing: '正在确认登录并读取设备令牌…',
    authenticated: '登录成功，已取得设备令牌（不显示原文）。',
    cancelled: '已取消，本页令牌已清除。',
    expired: '二维码已过期，请刷新二维码。',
    error: state.phase === 'error' ? state.message : '',
  };
  status.textContent = labels[state.phase];
  if (state.phase === 'scanning') {
    void QRCode.toDataURL(state.qrValue, {
      margin: 2,
      width: 224,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (current !== version) return;
        qr.src = url;
        qr.hidden = false;
      })
      .catch(() => {
        if (current !== version) return;
        session.cancel();
        status.textContent = '二维码绘制失败，请重试。';
      });
  }
});
document.querySelector('#start')!.addEventListener('click', () => {
  void session.start();
});
document
  .querySelector('#cancel')!
  .addEventListener('click', () => session.cancel());
window.addEventListener('pagehide', () => session.cancel());
