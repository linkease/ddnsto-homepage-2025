import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const origin = 'https://web.ddnsto.com';
const output = resolve(process.env.RELEASE_OUTPUT || 'artifacts/releases');
const releaseId = new Date().toISOString().replace(/[:.]/g, '-');
const work = mkdtempSync(join(tmpdir(), 'ddnsto-release-'));
try {
  const result = spawnSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', work],
    {
      env: { ...process.env, SITE_ENV: 'production', SITE_URL: origin },
      encoding: 'utf8',
    },
  );
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  const files = [];
  function walk(dir, prefix = '') {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name),
        rel = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${rel}`);
      if (entry.isDirectory()) walk(path, rel + '/');
      else
        files.push({
          path: rel,
          bytes: readFileSync(path).length,
          sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
        });
    }
  }
  walk(work);
  if (files.some((x) => /^app\//.test(x.path)))
    throw new Error('Release must not own /app/');
  mkdirSync(output, { recursive: true });
  const archive = join(output, `ddnsto-${releaseId}.tar.gz`);
  const packed = spawnSync('tar', ['-C', work, '-czf', archive, '.'], {
    encoding: 'utf8',
  });
  if (packed.status !== 0) throw new Error(packed.stderr);
  const manifest = {
    releaseId,
    origin,
    createdAt: new Date().toISOString(),
    node: process.version,
    lockfileSha256: createHash('sha256')
      .update(readFileSync('package-lock.json'))
      .digest('hex'),
    archiveSha256: createHash('sha256')
      .update(readFileSync(archive))
      .digest('hex'),
    files,
  };
  writeFileSync(
    archive + '.manifest.json',
    JSON.stringify(manifest, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      archive,
      manifest: archive + '.manifest.json',
      files: files.length,
      origin,
      deployed: false,
    }),
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
