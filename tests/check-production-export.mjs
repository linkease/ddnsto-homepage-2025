import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(process.argv[2] || 'out');
const home = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(!home.includes('href="/install'), 'production homepage exposes debug install');
assert.ok(home.includes('guide-markdown'), 'original guide panel is missing');
assert.ok(home.includes('href="/app/#/devices"'), 'original console destination is missing');
assert.ok(!existsSync(join(root, 'install.html')), 'debug route exported as install.html');
assert.ok(!existsSync(join(root, 'install/index.html')), 'debug route exported as install/index.html');
const scan = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) scan(path);
        else if (/\.(?:html|js|json|txt)$/.test(entry.name)) {
            assert.ok(!readFileSync(path, 'utf8').includes('ddnsto-install'), `test installer address leaked into ${path}`);
        }
    }
};
scan(root);
console.log('PASS production export: original homepage, no debug route or installer addresses');
