// Script distribution is independent of the website export. Never copy installers
/* global process -- NODE_ENV is replaced by Next.js at build time. */
// into public/ or out/. Set ready=false while a future build URL is unconfirmed.
export const installRelease = Object.freeze({
    version: '0.1.10',
    build: '20261015-6c624972f4c9',
    base: process.env.NODE_ENV === 'development' ? 'https://web.toany.net/ddnsto-install/0.1.10/20261015-6c624972f4c9' : '',
    ready: process.env.NODE_ENV === 'development',
    sha256: {
        shell: '62ceb9fe0f753af5a1a742f7255de284c1583db51a1f49240501841f08f7bc5c',
        powershell: '403288ba109ad9170289d9816fc2e7cb0f06714c1202c3bae806a4864cf3111a',
    },
});
