#!/usr/bin/env node
/* Falla si un sha256 del manifest no coincide con el archivo local
   (y, por defecto, con el origen). No pisa copias: versión nueva = carpeta nueva. */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// pin: commit fijado para manifests de upstream que traen files como objeto y origin sin SHA.
const manifests = [
  { path: join(root, 'brand/0.3/manifest.json') },
  { path: join(root, 'juice/1.0.1/manifest.json') },
  { path: join(root, 'juice/1.2.0/manifest.json'), pin: 'jorgefsb/game-industry-resources@f1b3b9c77a43ffbcbd331bb88420a436614fdbc3' },
  { path: join(root, 'vfx/cursor-liquido/1.0.0/manifest.json') },
  { path: join(root, 'vfx/cursor-liquido/1.0.1/manifest.json') },
  { path: join(root, 'vfx/game-feel/1.0.1/manifest.json') },
  { path: join(root, 'vfx/papacito-juice/1.0.1/manifest.json') },
];
const checkOrigin = process.env.VERIFY_ORIGIN !== '0';
const failures = [];

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function originUrl(file) {
  const origin = file.origin;
  if (/^https?:\/\//.test(origin)) return origin;
  const git = origin.match(/^([^/]+\/[^@]+)@([0-9a-f]{7,40})$/i);
  if (git) {
    return 'https://raw.githubusercontent.com/' + git[1] + '/' + git[2] + '/juice/' + file.version + '/' + file.path;
  }
  throw new Error('origen no es URL ni owner/repo@sha: ' + origin);
}

async function fetchOrigin(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
  return Buffer.from(await res.arrayBuffer());
}

for (const { path: manifestPath, pin } of manifests) {
  const dir = dirname(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const files = Array.isArray(manifest.files) ? manifest.files
    : Object.entries(manifest.files || {}).map(([path, f]) => ({ path, origin: pin, version: manifest.version, sha256: f.sha256 }));
  if (!manifest.version || !files.length) {
    failures.push(manifestPath + ': manifest sin version o files');
    continue;
  }
  if (manifest.golden_engine_sha256 && !files.some((f) => f.sha256 === manifest.golden_engine_sha256)) {
    failures.push(manifestPath + ': ningún archivo coincide con golden_engine_sha256');
  }
  for (const file of files) {
    const label = file.path + ' (' + manifestPath + ')';
    if (!file.origin || !file.version || !file.sha256) {
      failures.push(label + ': falta origin, version o sha256');
      continue;
    }
    const localBuf = await readFile(join(dir, file.path));
    const localHash = sha256(localBuf);
    if (localHash !== file.sha256) {
      failures.push(label + ': local ' + localHash + ' != manifest ' + file.sha256);
    }
    // local: = copia aprobada sin origen público todavía; solo cuenta el hash local.
    if (!checkOrigin || file.origin.startsWith('local:')) continue;
    try {
      const remoteBuf = await fetchOrigin(originUrl(file));
      const remoteHash = sha256(remoteBuf);
      if (remoteHash !== file.sha256) {
        failures.push(
          label + ': origen ' + remoteHash + ' != manifest ' + file.sha256 +
          ' (versión nueva = carpeta nueva, no pises ' + file.version + ')'
        );
      }
    } catch (err) {
      failures.push(label + ': no pude leer el origen: ' + err.message);
    }
  }
}

if (failures.length) {
  console.error('verify-vendor-sha256 FALLÓ:');
  failures.forEach(function (line) { console.error(' - ' + line); });
  process.exit(1);
}
console.log('verify-vendor-sha256 OK (' + manifests.length + ' manifiestos)');
