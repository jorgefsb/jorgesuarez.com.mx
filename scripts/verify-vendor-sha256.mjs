#!/usr/bin/env node
/* Falla si un sha256 del manifest no coincide con el archivo local
   (y, por defecto, con el origen). No pisa copias: versión nueva = carpeta nueva. */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifests = [
  join(root, 'brand/0.3/manifest.json'),
  join(root, 'juice/1.0.1/manifest.json'),
  join(root, 'juice/1.2.0/manifest.json'),
];
/* Desde juice 1.1.0 el manifest trae files como objeto {ruta: {sha256}} y un origin sin commit.
   Aquí se fija el commit del repo canónico del que se copió cada versión. */
const PIN = {
  '1.2.0': 'jorgefsb/game-industry-resources@1c56fa425555fca00e33b7907b32ab28c9336dbb',
};
function normalize(manifest) {
  if (Array.isArray(manifest.files)) return manifest;
  const origin = PIN[manifest.version];
  return {
    version: manifest.version,
    files: Object.entries(manifest.files || {}).map(([path, f]) => ({ path, sha256: f.sha256, version: manifest.version, origin })),
  };
}
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

for (const manifestPath of manifests) {
  const dir = dirname(manifestPath);
  const manifest = normalize(JSON.parse(await readFile(manifestPath, 'utf8')));
  if (!manifest.version || !Array.isArray(manifest.files) || !manifest.files.length) {
    failures.push(manifestPath + ': manifest sin version o files');
    continue;
  }
  for (const file of manifest.files) {
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
    if (!checkOrigin) continue;
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
