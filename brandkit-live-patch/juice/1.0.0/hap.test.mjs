#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

function chromePath() {
  const cands = [
    process.env.CHROME_PATH,
    '/usr/local/bin/google-chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  for (const p of cands) if (p && existsSync(p)) return p;
}

function playwrightIndex() {
  const cands = [
    join(dir, 'node_modules/playwright/index.js'),
    join(process.cwd(), 'node_modules/playwright/index.js'),
    join(process.cwd(), 'node_modules/playwright-core/index.js')
  ];
  const npx = join(process.env.HOME || '', '.npm/_npx');
  if (existsSync(npx)) {
    for (const id of readdirSync(npx)) {
      cands.push(join(npx, id, 'node_modules/playwright/index.js'));
      cands.push(join(npx, id, 'node_modules/playwright-core/index.js'));
    }
  }
  return cands.find(existsSync);
}

async function loadChromium() {
  for (const spec of ['playwright', 'playwright/index.js', 'playwright-core', 'playwright-core/index.js']) {
    try {
      const mod = await import(spec);
      if (mod.chromium) return mod.chromium;
    } catch (e) {}
  }
  const idx = playwrightIndex();
  if (!idx) return null;
  const mod = await import(pathToFileURL(idx).href);
  return mod.chromium || (mod.default && mod.default.chromium);
}

const chromium = await loadChromium();
const exe = chromePath();
if (!chromium || !exe) {
  console.warn('hap.test: no browser — haptics test did NOT run');
  process.exit(0);
}

const juice = readFileSync(join(dir, 'juice.js'), 'utf8');
const browser = await chromium.launch({ headless: true, executablePath: exe });
const page = await browser.newPage();
await page.addInitScript(() => {
  try { localStorage.setItem('jz-level', 'full'); } catch (e) {}
  window.__vib = [];
  navigator.vibrate = function (p) { window.__vib.push(p); return true; };
});
await page.setContent(
  '<!doctype html><html lang="es"><body>' +
  '<button type="button" class="btn btn--primary" data-jz="jz-tap" id="t">Tap</button>' +
  '<script>' + juice + '</script></body></html>'
);
await page.waitForFunction(() => window.JZ);
await page.evaluate(() => {
  window.__vib = [];
  navigator.vibrate = function (p) { window.__vib.push(p); return true; };
});

async function tap() {
  const box = await page.locator('#t').boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.up();
}

await page.evaluate(() => { window.__vib = []; JZ.setLevel('full'); });
await tap();
const afterTap = await page.evaluate(() => window.__vib.slice());

await page.evaluate(() => { window.__vib = []; JZ.setLevel('off'); });
await tap();
const off = await page.evaluate(() => window.__vib.slice());

await page.evaluate(() => { window.__vib = []; JZ.setLevel('full'); });
await page.locator('#t').focus();
await page.keyboard.down('Tab');
await page.keyboard.up('Tab');
await page.waitForTimeout(30);
await page.evaluate(() => { JZ.play('tap+haptics', document.getElementById('t')); });
const afterTab = await page.evaluate(() => window.__vib.slice());

await page.evaluate(() => { window.__vib = []; });
{
  const box = await page.locator('#t').boundingBox();
  await page.mouse.move(box.x + 6, box.y + 6);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 10 });
  await page.mouse.up();
}
await page.waitForTimeout(30);
await page.evaluate(() => { window.__vib = []; JZ.play('tap+haptics', document.getElementById('t')); });
const afterDrag = await page.evaluate(() => window.__vib.slice());

const afterProg = await page.evaluate(() => {
  window.__vib = [];
  document.getElementById('t').click();
  return window.__vib.slice();
});

await browser.close();

if (!afterTap.length) throw new Error('haptics did not fire after pointerdown + 80ms + pointerup + click');
if (off.length) throw new Error('haptics fired in Off');
if (afterTab.length) throw new Error('haptics fired after Tab then timer');
if (afterDrag.length) throw new Error('haptics fired after drag then timer');
if (afterProg.length) throw new Error('haptics fired from scripted el.click()');
console.log('ok hap', JSON.stringify({ tap: afterTap, tab: afterTab, drag: afterDrag, prog: afterProg }));
