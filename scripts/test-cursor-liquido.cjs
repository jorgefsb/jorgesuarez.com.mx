#!/usr/bin/env node
/* Pruebas del cursor líquido 1.0.1 + Juice 1.2.0 en index.html, en Chromium real.
   Uso: npm run test:cursor  (PLAYWRIGHT_MODULE=<ruta a playwright> si no está instalado en el proyecto).
   Compara texto, ligas e imágenes ES/EN contra la línea base de main (673794f), sirve todo por HTTP
   efímero y deja capturas y video en qa/cursor-liquido/ (ignorado por git).
   No cubre teléfonos físicos: el móvil es emulación de Chromium a 375 px con touch. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const crypto = require('crypto'), assert = require('assert/strict'), { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.join(__dirname, '..');
const out = process.env.CURSOR_TEST_OUTPUT || path.join(root, 'qa', 'cursor-liquido');
const BASE_SHA = '673794ffec82acde800df43ed31b5ded3cb0e592';
const BASE_INDEX_SHA256 = '408c9c7aba875e6dc71061739584af8f98ff7bb601ad78d5ca5ace04190bb5a7';
const GOLDEN_ENGINE = '3d478cc836969c216812c7e479724e0e204bbb76a26df24c2414568883021230';
const VENDOR = 'vfx/cursor-liquido/1.0.1/';
const LAUNCH = { headless: true, ignoreDefaultArgs: ['--hide-scrollbars'],
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
const LEVELS = [['off', 'nada', 'off', 0], ['subtle', 'poquito', 'dots', 0], ['full', 'mucho', 'fluid', 10], ['hard', 'hardcore', 'fluid', 18]];
const results = [];
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const read = (p) => fs.readFileSync(path.join(root, p));

async function test(name, fn) {
  try { const detail = await fn(); results.push({ name, status: 'PASS', detail }); console.log('PASS', name, detail ? JSON.stringify(detail).slice(0, 300) : ''); }
  catch (e) { results.push({ name, status: 'FAIL', detail: String(e.stack || e) }); console.error('FAIL', name, '\n ', e.message); }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.txt': 'text/plain' };
function serve(dir) {
  const missing = [];
  const server = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
    const file = path.join(dir, path.normalize(u));
    if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { missing.push(u); res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(buf);
    });
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, missing, url: 'http://127.0.0.1:' + server.address().port + '/' })));
}

function watch(page) {
  const log = { errors: [], bad: [] };
  page.on('pageerror', (e) => log.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/youtube|ytimg|ERR_/.test(m.text())) log.errors.push(m.text()); });
  page.on('response', (r) => { if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) log.bad.push(r.status() + ' ' + r.url()); });
  return log;
}

// Texto, ligas e imágenes de la página, sin lo que pintan Juice y Moki (sus etiquetas cambian con 1.2.0).
function snapshot() {
  const skip = '.jz-dock,.jz-panel,.juice-sfx,.moki,.moki-count,.moki-party,.jzh-layer,.jzh-debris,.liquid-cursor-layer,.liquid-original-dots,.quest__label';
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll(skip + ',script,iframe').forEach((n) => n.remove());
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const own = (el) => !el.closest(skip);
  return {
    lang: document.documentElement.lang,
    title: document.title,
    description: document.querySelector('meta[name=description]').content,
    text: norm(clone.textContent),
    i18n: [...document.querySelectorAll('[data-es]')].filter(own).map((el) => norm(el.textContent)),
    links: [...document.querySelectorAll('a[href]')].filter(own).map((a) => [a.getAttribute('href'), a.target, a.rel].join(' | ')),
    images: [...document.querySelectorAll('img')].filter(own).map((i) => i.getAttribute('src')),
    forms: [...document.querySelectorAll('form')].map((f) => f.getAttribute('action')),
    nav: [...document.querySelectorAll('.hud__nav a, .quest__flag button')].map((a) => norm(a.textContent))
  };
}

async function open(browser, url, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 800 }, locale: 'es-MX' }, opts));
  const page = await ctx.newPage();
  const log = watch(page);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.JZ && document.querySelector('.jz-dock'));
  if (!url.includes('cursor=off')) await page.evaluate(() => window.papacitoReady);
  await page.waitForTimeout(300);
  return { ctx, page, log };
}

async function setLevel(page, value) {
  await page.evaluate((v) => window.JZ.setLevel(v), value);
  await page.waitForFunction((v) => document.documentElement.getAttribute('data-jz-level') === v, value);
  await page.waitForTimeout(30);
}

// Monta de nuevo con las mismas opciones del conductor: motor nuevo, presupuesto de rendimiento nuevo.
// SwiftShader es lento y el motor se pausa solo (budget-paused) tras varios cuadros lentos; eso es la
// protección de hardware bajo funcionando, no un error.
async function remount(page) {
  await page.evaluate(() => PapacitoJuice.mount({ page: 'home', obstacleSelector: '[data-liquid-obstacle]' }));
}

async function stroke(page, x0, y0, n = 36) {
  for (let i = 0; i < n; i++) { await page.mouse.move(x0 + i * 14, y0 + Math.sin(i / 3) * 60); await page.waitForTimeout(16); }
}

// Pixeles cromáticos que cambiaron entre dos capturas del mismo recorte (PNG via canvas en el navegador).
async function chromaDiff(page, before, after) {
  return page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + src; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const g = c.getContext('2d');
    g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
    g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
    let changed = 0, chromatic = 0, white = 0;
    for (let k = 0; k < da.length; k += 4) {
      const d = Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]);
      if (d < 30) continue; changed++;
      const hi = Math.max(db[k], db[k + 1], db[k + 2]), lo = Math.min(db[k], db[k + 1], db[k + 2]);
      if (hi - lo > 40) chromatic++; if (lo > 225) white++;
    }
    return { pixels: da.length / 4, changed, chromatic, white };
  }, [before.toString('base64'), after.toString('base64')]);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-liquido-'));
  const baseDir = path.join(tmp, 'base'); fs.mkdirSync(baseDir);
  let site, base, browser;
  try {
    // ---------- estáticas ----------
    await test('vendor / motor aprobado intacto (golden sha256) y manifest local', async () => {
      const m = JSON.parse(read(VENDOR + 'manifest.json'));
      assert.equal(sha(read(VENDOR + 'fluid-engine.js')), GOLDEN_ENGINE);
      assert.equal(m.golden_engine_sha256, GOLDEN_ENGINE);
      for (const f of m.files) assert.equal(sha(read(VENDOR + f.path)), f.sha256, f.path);
      const wrapper = read(VENDOR + 'liquid-cursor.js').toString();
      assert.match(wrapper, /version: '1\.0\.1'/);
      return { engine: GOLDEN_ENGINE, files: m.files.map((f) => f.path + ' ' + f.sha256.slice(0, 12)) };
    });
    await test('vendor / juice 1.2.0 byte por byte contra su manifest', async () => {
      const m = JSON.parse(read('juice/1.2.0/manifest.json'));
      assert.equal(m.version, '1.2.0');
      for (const [p, f] of Object.entries(m.files)) assert.equal(sha(read('juice/1.2.0/' + p)), f.sha256, p);
      return { files: Object.keys(m.files).length };
    });
    await test('vendor / el guard falla si se toca un byte del motor', async () => {
      const copy = path.join(tmp, 'guard');
      for (const d of ['scripts', 'brand/0.3', 'juice/1.0.1', 'juice/1.2.0', 'vfx']) fs.cpSync(path.join(root, d), path.join(copy, d), { recursive: true });
      const engine = path.join(copy, VENDOR, 'fluid-engine.js'), buf = fs.readFileSync(engine); buf[100] ^= 1; fs.writeFileSync(engine, buf);
      let code = 0;
      try { execFileSync(process.execPath, [path.join(copy, 'scripts/verify-vendor-sha256.mjs')], { env: Object.assign({}, process.env, { VERIFY_ORIGIN: '0' }), stdio: 'pipe' }); }
      catch (e) { code = e.status; assert.match(String(e.stderr), /fluid-engine\.js/); }
      assert.equal(code, 1);
      return { exit: code };
    });
    await test('fuente / página sin cursor viejo, sin juice 1.0.1 y un solo mount', async () => {
      const html = read('index.html').toString();
      assert(!/id="fluid-canvas"/.test(html)); assert(!/fluid-v2\.js/.test(html)); assert(!/(?:src|href)="juice\/1\.0\.1\//.test(html));
      assert(!/github\.com\/jorgefsb\/cursor-liquido/.test(html));
      assert.match(html, /data-jz-shake="\.jzh-layer"/, 'shake targets only particles, never the full-height main');
      const order = ['juice/1.2.0/juice.js', 'juice/1.2.0/juice-menu.js', 'juice/1.2.0/hardcore/hardcore.js', 'juice/1.2.0/moki/moki.js',
        VENDOR + 'fluid-engine.js', VENDOR + 'engine-adapter.js', VENDOR + 'quality-input-guard.js', VENDOR + 'liquid-cursor.js',
        'vfx/game-feel/1.0.1/game-feel-cursor.js', 'vfx/papacito-juice/1.0.1/papacito-juice.js', 'js/cursor-conductor.js'];
      const at = order.map((s) => html.indexOf('<script src="' + s));
      assert(at.every((i, k) => i > 0 && (k === 0 || i > at[k - 1])), 'orden de scripts ' + at);
      const mounts = ['js/v2.js', 'js/cursor-conductor.js'].map((f) => (read(f).toString().match(/PapacitoJuice\.mount\(/g) || []).length);
      assert.deepEqual(mounts, [0, 1]);
      assert.equal(fs.existsSync(path.join(root, 'vfx/fluid-v2.js')), true, 'el archivo viejo se conserva');
      return { scripts: order.length, mounts };
    });
    await test('fuente / línea base de main intacta (sha256 de index.html en ' + BASE_SHA.slice(0, 7) + ')', async () => {
      const tar = execFileSync('git', ['-C', root, 'archive', BASE_SHA], { maxBuffer: 1 << 30 });
      execFileSync('tar', ['-x', '-C', baseDir], { input: tar });
      assert.equal(sha(fs.readFileSync(path.join(baseDir, 'index.html'))), BASE_INDEX_SHA256);
      return { base: BASE_SHA };
    });

    site = await serve(root); base = await serve(baseDir);
    browser = await chromium.launch(LAUNCH);

    // ---------- contenido ES/EN contra main ----------
    for (const lang of ['es', 'en']) {
      await test('contenido / ' + lang.toUpperCase() + ' igual a main: texto, ligas, imágenes, nav', async () => {
        const snaps = [];
        for (const url of [base.url, site.url]) {
          const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-MX' });
          const page = await ctx.newPage();
          await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(400);
          await page.click('.lang-switcher .' + lang + '-btn'); await page.waitForTimeout(200);
          snaps.push(await page.evaluate(snapshot)); await ctx.close();
        }
        const [a, b] = snaps;
        assert.equal(b.lang, lang);
        for (const k of ['title', 'description', 'text', 'i18n', 'links', 'images', 'forms', 'nav']) assert.deepEqual(b[k], a[k], k);
        fs.writeFileSync(path.join(out, 'snapshot-' + lang + '.json'), JSON.stringify(b, null, 1));
        return { chars: b.text.length, i18n: b.i18n.length, links: b.links.length, images: b.images.length, nav: b.nav.length };
      });
    }

    // ---------- escritorio ----------
    const d = await open(browser, site.url, { recordVideo: { dir: out, size: { width: 1280, height: 800 } } });
    const P = d.page;
    await test('carga / sin errores JS ni 404 propios', async () => {
      await P.waitForTimeout(800);
      assert.deepEqual(d.log.errors, []); assert.deepEqual(d.log.bad, []); assert.deepEqual(site.missing, []);
      return { ok: true };
    });
    await test('perfil / PapacitoJuice 1.0.1 completo: core 1.2.0, sonido, Mucho de arranque, Hardcore con candado, Moki', async () => {
      const v = await P.evaluate(() => ({
        html: ['data-jz-sound', 'data-jz-default', 'data-moki-show', 'data-jz-hard'].map((a) => document.documentElement.getAttribute(a)),
        level: JZ.level, hzh: window.JZH && JZH.version, moki: window.Moki && Moki.version,
        profile: PapacitoJuice.version, page: PapacitoJuice.current.page,
        adapter: GameFeelCursor.version, sameOwner: PapacitoJuice.current.cursor === GameFeelCursor.current && GameFeelCursor.current.cursor === LiquidCursor.current,
        radios: [...document.querySelectorAll('.jz-panel input[name=jz-level]')].map((r) => r.value + (r.disabled ? ':locked' : '')),
        lock: document.querySelector('.jz-hard__lock').textContent
      }));
      assert.deepEqual(v.html, ['on', 'full', '5', null]);
      assert.equal(v.level, 'full'); assert.equal(v.hzh, '1.2.0'); assert.equal(v.moki, '1.2.0');
      assert.equal(v.profile, '1.0.1'); assert.equal(v.adapter, '1.0.1'); assert.equal(v.page, 'home'); assert(v.sameOwner);
      assert.deepEqual(v.radios, ['off', 'subtle', 'full', 'hard:locked']);
      assert.match(v.lock, /Mokis/);
      return v;
    });
    await test('dueño único / un LiquidCursor, dos capas, sin auto-boot del motor ni fluid-v2', async () => {
      const v = await P.evaluate(() => ({
        layers: [...document.querySelectorAll('canvas')].filter((c) => c.dataset.fluid || c.classList.contains('liquid-cursor-layer')).length,
        cursorLayers: document.querySelectorAll('.liquid-cursor-layer').length,
        dotHosts: document.querySelectorAll('.liquid-original-dots').length,
        old: !!document.getElementById('fluid-canvas'), auto: !!window.fluidCursor, v2: typeof window.FluidSimulation,
        owner: document.documentElement.getAttribute('data-game-feel-cursor'), version: LiquidCursor.version,
        source: LiquidCursor.current.stats.source, pe: [...document.querySelectorAll('.liquid-cursor-layer,.liquid-original-dots')].map((c) => getComputedStyle(c).pointerEvents),
        cursor: getComputedStyle(document.body).cursor
      }));
      assert.equal(v.layers, 2); assert.equal(v.cursorLayers, 2); assert.equal(v.dotHosts, 1);
      assert.equal(v.old, false); assert.equal(v.auto, false); assert.equal(v.v2, 'undefined');
      assert.equal(v.owner, 'liquid'); assert.equal(v.version, '1.0.1'); assert.equal(v.source, 'data-jz-level');
      assert(v.pe.every((x) => x === 'none')); assert.notEqual(v.cursor, 'none');
      return v;
    });
    await test('candado / contraste WCAG sobre papel y fondo oscuro', async () => {
      const rows=[];
      for (const sel of ['#home','#journey','#media']) {
        await P.evaluate(s => scrollTo(0,document.querySelector(s).getBoundingClientRect().top+scrollY+150),sel);
        await P.waitForFunction(ground => document.querySelector('.hud').dataset.ground === ground, sel === '#journey' ? 'papel' : 'oscuro');
        await P.waitForTimeout(300);
        await P.click('.hud .jz-lvl');
        const v=await P.evaluate(() => {
          const el=document.querySelector('.jz-hard__lock'), panel=document.querySelector('.jz-panel');
          const fg=getComputedStyle(el).color,bg=getComputedStyle(panel).backgroundColor;
          const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0);
          const a=lum(fg),b=lum(bg);return {fg,bg,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
        });
        assert(v.contrast>=4.5,JSON.stringify(v)); rows.push({section:sel,...v});
        if(sel==='#journey') await P.screenshot({path:path.join(out,'candado-papel.png')});
        await P.keyboard.press('Escape');
      }
      await P.evaluate(()=>scrollTo(0,0)); return rows;
    });
    await test('niveles / menú Juega → Nada, Poquito, Mucho, Hardcore (candado abierto solo en la prueba)', async () => {
      const seen = [];
      await P.click('.hud .jz-lvl');
      await P.waitForSelector('#jz-panel:not([hidden])');
      await P.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); });
      for (const [value, name, layer, radius] of LEVELS) {
        if (await P.locator('#jz-panel').isHidden()) await P.click('.hud .jz-lvl');
        await P.click('#jz-panel input[value="' + value + '"]');
        await P.waitForFunction((n) => LiquidCursor.current.intensity === n, name);
        const s = await P.evaluate(() => LiquidCursor.current.stats);
        assert.equal(s.layer, layer); assert.equal(s.radius, radius);
        if (layer === 'fluid') assert.equal(s.fluid.radius, radius);
        seen.push(value + '=' + name + ':' + layer + ':' + radius);
      }
      await P.keyboard.press('Escape');
      await P.evaluate(() => { document.documentElement.removeAttribute('data-jz-hard'); JZ.paint(); });
      return seen;
    });
    await test('Poquito / puntos originales, sin WebGL corriendo, se limpian solos', async () => {
      await setLevel(P, 'subtle');
      await stroke(P, 200, 420, 10);
      const v = await P.evaluate(() => { const c = LiquidCursor.current; return { alive: c.dots.stats.alive, width: c.dots.dots[0] && getComputedStyle(c.dots.dots[0].dot).width, gl: !!(c.engine && c.engine.raf), hardTrail: document.querySelectorAll('.jzh-t').length }; });
      assert(v.alive > 0); assert.equal(v.width, '7px'); assert.equal(v.gl, false); assert.equal(v.hardTrail, 0);
      await P.waitForTimeout(650);
      assert.equal(await P.evaluate(() => LiquidCursor.current.dots.stats.alive), 0);
      return v;
    });
    for (const [value, name, radius] of [['full', 'mucho', 10], ['hard', 'hardcore', 18]]) {
      await test('fluido / ' + name + ' con mouse real: color localizado, sin lavado blanco, campo finito', async () => {
        await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(200);
        await P.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); });
        await setLevel(P, value); await remount(P);
        const clip = { x: 160, y: 300, width: 640, height: 300 };
        await P.mouse.move(5, 790); await P.waitForTimeout(700);
        const before = await P.screenshot({ clip });
        await stroke(P, 220, 450, 24);
        const after = await P.screenshot({ clip, path: path.join(out, 'desktop-' + name + '-fluido-recorte.png') });
        await P.screenshot({ path: path.join(out, 'desktop-' + name + '.png') });
        const live = await P.evaluate(() => ({ stats: Object.assign({}, LiquidCursor.current.engine.stats), dots: LiquidCursor.current.dots.stats.alive,
          hidden: [...document.querySelectorAll('.jzh-t')].filter((t) => getComputedStyle(t).display !== 'none').length }));
        const diff = await chromaDiff(P, before, after);
        // Campo finito con la misma entrada determinista que usa la suite del demo aprobado (no es benchmark de FPS).
        await remount(P);
        const field = await P.evaluate(() => {
          const e = LiquidCursor.current.engine; e.boot(); e.stop(true); e.collectWalls(); const gl = e.gl, t0 = performance.now(); e.lastTime = 0;
          let chroma = 0, active = 0, neutral = 0, px = 0;
          for (let i = 0; i < 60; i++) {
            e.pending = { x: 260 + Math.sin(i * 0.19) * 95, y: 450 + Math.cos(i * 0.17) * 45, dx: Math.cos(i * 0.19) * 18, dy: -Math.sin(i * 0.17) * 8 };
            e.lastInput = t0 + i * 17; e.frame(t0 + i * 17); cancelAnimationFrame(e.raf); e.raf = 0;
          }
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          const a = new Uint8Array(e.canvas.width * e.canvas.height * 4); gl.readPixels(0, 0, e.canvas.width, e.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, a);
          for (let k = 0; k < a.length; k += 4) { const hi = Math.max(a[k], a[k + 1], a[k + 2]), lo = Math.min(a[k], a[k + 1], a[k + 2]); px++; if (a[k + 3] > 8) { active++; if (hi - lo > 35) chroma++; if (lo > 90 && hi - lo < 14) neutral++; } }
          gl.bindFramebuffer(gl.FRAMEBUFFER, e.dye.read.framebuffer);
          const f = new Float32Array(e.dye.read.width * e.dye.read.height * 4);
          gl.readPixels(0, 0, e.dye.read.width, e.dye.read.height, gl.RGBA, gl.FLOAT, f);
          let bad = 0, peak = 0; for (const x of f) { if (!Number.isFinite(x)) bad++; else peak = Math.max(peak, Math.abs(x)); }
          const error = gl.getError(); e.stop(true);
          return { bad, peak, error, active, chroma, neutral, px, radius: e.options.radius };
        });
        await P.evaluate(() => { document.documentElement.removeAttribute('data-jz-hard'); JZ.paint(); });
        assert(diff.chromatic > 400, 'poco color ' + JSON.stringify(diff) + ' estado ' + live.stats.state);
        assert(diff.changed / diff.pixels < 0.35, 'cambio demasiado grande ' + JSON.stringify(diff));
        assert(diff.white / diff.pixels < 0.005, 'lavado blanco ' + JSON.stringify(diff));
        assert(live.stats.splats > 0 && live.stats.frames > 0); assert.equal(live.stats.radius, radius);
        assert.equal(live.hidden, 0, 'estela de hardcore visible junto al fluido'); assert.equal(live.dots, 0);
        assert.equal(field.bad, 0); assert.equal(field.error, 0); assert(field.peak > 0); assert.equal(field.radius, radius);
        assert(field.chroma > 50 && field.active / field.px < 0.25 && field.neutral / field.px < 0.005, JSON.stringify(field));
        return { diff, live: { state: live.stats.state, splats: live.stats.splats, walls: live.stats.wallCount, quality: live.stats.quality }, field: Object.assign(field, { peak: +field.peak.toFixed(3) }) };
      });
    }
    await test('estela única / en Hardcore la estela .jzh-t de juice existe pero queda oculta', async () => {
      await P.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); });
      await setLevel(P, 'hard');
      let made = 0;
      for (let i = 0; i < 12; i++) { await P.mouse.move(300 + i * 25, 380); await P.waitForTimeout(45); made = Math.max(made, await P.locator('.jzh-t').count()); }
      const visible = await P.evaluate(() => [...document.querySelectorAll('.jzh-t')].filter((t) => getComputedStyle(t).display !== 'none').length);
      // Wait for the actual native-animation cleanup, not a wall-clock guess
      // while software GL and video encoding share the runner.
      await P.waitForFunction(() => document.querySelectorAll('.jzh-t').length === 0, null, { timeout: 3000 });
      const left = await P.locator('.jzh-t').count();
      await P.evaluate(() => { document.documentElement.removeAttribute('data-jz-hard'); JZ.paint(); });
      assert(made > 0, 'hardcore.js no corrió'); assert.equal(visible, 0); assert.equal(left, 0);
      return { made, visible, left };
    });
    await test('obstáculos / HUD, quest, vframes y papel como paredes; scroll y resize', async () => {
      await setLevel(P, 'full');
      const walls = [];
      for (const sel of ['#home', '#journey', '#media']) {
        await P.evaluate((s) => document.querySelector(s).scrollIntoView(), sel); await P.waitForTimeout(400);
        await remount(P);
        walls.push(await P.evaluate(() => { const e = LiquidCursor.current.engine; e.boot(); e.stop(true); e.collectWalls(); return e.stats.wallCount; }));
      }
      // Las mismas superficies que el selector por defecto del motor aprobado.
      const same = await P.evaluate(() => { const def = [...document.querySelectorAll(FluidCursor.defaults.obstacleSelector)], mine = [...document.querySelectorAll('[data-liquid-obstacle]')];
        return def.length === mine.length && def.every((el) => mine.includes(el)); });
      assert(same, 'data-liquid-obstacle no coincide con el selector por defecto del motor');
      const marked = await P.evaluate(() => document.querySelectorAll('[data-liquid-obstacle]').length);
      await P.evaluate(() => scrollTo(0, 0));
      await P.setViewportSize({ width: 1000, height: 700 }); await P.waitForTimeout(400);
      await remount(P); await stroke(P, 120, 420, 10);
      const geo = await P.evaluate(() => { const c = document.querySelector('.liquid-cursor-layer[data-liquid-layer=fluid]').getBoundingClientRect(); const e = LiquidCursor.current.engine; return { w: c.width, h: c.height, iw: innerWidth, ih: innerHeight, sw: e.width, sh: e.height, state: e.stats.state }; });
      await P.setViewportSize({ width: 1280, height: 800 }); await P.waitForTimeout(200);
      assert(walls.every((n) => n >= 2), 'paredes ' + walls); assert.equal(marked, 13);
      assert.equal(geo.w, geo.iw); assert.equal(geo.h, geo.ih); assert.equal(geo.sw, geo.iw); assert.equal(geo.sh, geo.ih);
      return { walls, marked, geo };
    });
    await test('play / barra de progreso avanza con el scroll y Moki del quest visible', async () => {
      await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(300);
      const q0 = await P.evaluate(() => +document.querySelector('[data-quest]').style.getPropertyValue('--q') || 0);
      await P.evaluate(() => scrollTo(0, 2400)); await P.waitForTimeout(700);
      const v = await P.evaluate(() => { const q = document.querySelector('[data-quest]'), m = q.querySelector('.quest__moki').getBoundingClientRect(); return { hidden: q.hidden, q: +q.style.getPropertyValue('--q'), moki: m.width > 0 && m.height > 0 }; });
      assert.equal(v.hidden, false); assert(v.q > q0); assert(v.moki);
      return Object.assign({ q0 }, v);
    });
    await test('moki / 5 escondites de hoy, visibles, sin espejo, sin tapar texto ni botones, quieto en Nada', async () => {
      const found = [];
      for (const spot of await P.evaluate(() => [...document.querySelectorAll('.moki')].map((m) => m.dataset.mokiSpot))) {
        await P.evaluate((s) => document.querySelector('[data-moki-spot="' + s + '"]').scrollIntoView({ block: 'center' }), spot);
        await P.waitForFunction((s) => { const m = document.querySelector('[data-moki-spot="' + s + '"]'), i = m.querySelector('.moki__img'); return m.classList.contains('is-out') && i.complete && i.naturalWidth > 0; }, spot, { timeout: 10000 });
        await P.waitForTimeout(500);
        found.push(await P.evaluate((s) => {
          const m = document.querySelector('[data-moki-spot="' + s + '"]'), img = m.querySelector('.moki__img'), r = img.getBoundingClientRect();
          const clip = m.querySelector('.moki__clip').getBoundingClientRect();
          const vis = { left: Math.max(r.left, clip.left), top: Math.max(r.top, clip.top), right: Math.min(r.right, clip.right), bottom: Math.min(r.bottom, clip.bottom) };
          const hit = [...document.querySelectorAll('a,button,p,h1,h2,h3,li,.btn,.vframe')].filter((el) => !m.contains(el) && !el.contains(m) && !el.closest('.moki,.hud,.quest')).filter((el) => {
            const b = el.getBoundingClientRect(); return b.width && b.height && b.left < vis.right - 1 && b.right > vis.left + 1 && b.top < vis.bottom - 1 && b.bottom > vis.top + 1;
          }).map((el) => el.tagName + '.' + el.className);
          const t = getComputedStyle(img).transform, a = t === 'none' ? 1 : new DOMMatrix(t).a;
          return { spot: s, pose: m.dataset.mokiPose, src: img.getAttribute('src'), visible: vis.bottom - vis.top > 20 && vis.right - vis.left > 20, scaleX: a, hit };
        }, spot));
      }
      await P.screenshot({ path: path.join(out, 'desktop-moki.png') });
      await setLevel(P, 'off');
      const still = await P.evaluate(() => [...document.querySelectorAll('.moki')].every((m) => m.classList.contains('is-still') && !m.getAnimations({ subtree: true }).some((a) => a.playState === 'running')));
      await setLevel(P, 'full');
      const poses = found.map((f) => f.pose);
      assert.equal(found.length, 5); assert.equal(new Set(poses).size, 5, 'poses repetidas');
      for (const f of found) { assert(f.visible, f.spot); assert(f.scaleX > 0, 'espejado ' + f.spot); assert.deepEqual(f.hit, [], 'tapa ' + f.spot); assert(f.src.includes('/juice/1.2.0/moki/moki-'), f.src); }
      assert(still, 'Moki se mueve en Nada');
      assert(!found.some((f) => /amber|brandcade|xzeal/i.test(f.spot)));
      return found.map((f) => f.spot + ':' + f.pose);
    });
    await test('sonido / prendido por defecto, toggle con estado semántico y se respeta al recargar', async () => {
      await P.evaluate(() => scrollTo(0, 0));
      const a = await P.evaluate(() => { const b = document.querySelector('.hud .juice-sfx'); return [b.getAttribute('aria-pressed'), b.getAttribute('aria-label'), b.querySelector('.juice-sfx__label').textContent]; });
      await P.click('.hud .juice-sfx');
      const b = await P.evaluate(() => document.querySelector('.hud .juice-sfx').getAttribute('aria-pressed'));
      await P.reload({ waitUntil: 'load' }); await P.waitForFunction(() => window.JZ);
      const c = await P.evaluate(() => document.querySelector('.hud .juice-sfx').getAttribute('aria-pressed'));
      await P.click('.hud .juice-sfx');
      assert.equal(a[0], 'true'); assert.equal(a[1], a[2]); assert.equal(b, 'false'); assert.equal(c, 'false');
      return { initial: a, toggled: b, reload: c };
    });
    await test('teclado / EN con Enter, Escape cierra Juega, nav ancla', async () => {
      await P.focus('.lang-switcher .en-btn'); await P.keyboard.press('Enter');
      await P.waitForFunction(() => document.documentElement.lang === 'en');
      await P.focus('.hud .jz-lvl'); await P.keyboard.press('Enter');
      const opened = await P.locator('#jz-panel').isVisible();
      await P.keyboard.press('Escape');
      const closed = await P.locator('#jz-panel').isHidden();
      await P.click('.hud__nav a[href="#journey"]');
      await P.waitForFunction(() => Math.abs(document.querySelector('#journey').getBoundingClientRect().top) < 120, null, { timeout: 5000 });
      const hash = await P.evaluate(() => [location.hash, Math.round(document.querySelector('#journey').getBoundingClientRect().top)]);
      await P.focus('.lang-switcher .es-btn'); await P.keyboard.press('Enter');
      assert(opened); assert(closed); assert(Math.abs(hash[1]) < 120, 'ancla ' + hash);
      return { opened, closed, hash };
    });
    await test('ciclo de vida / destroy y remount sin capas duplicadas', async () => {
      const v = await P.evaluate(async () => {
        PapacitoJuice.current.destroy(); const gone = document.querySelectorAll('.liquid-cursor-layer,.liquid-original-dots').length;
        const ownerAfterDestroy=document.documentElement.getAttribute('data-game-feel-cursor');
        const probe=document.createElement('i'); probe.className='jzh-t'; document.body.append(probe);
        const trailAfterDestroy=getComputedStyle(probe).display; probe.remove();
        await PapacitoJuice.mount({ page:'home', obstacleSelector: '[data-liquid-obstacle]' });
        await PapacitoJuice.mount({ page:'home', obstacleSelector: '[data-liquid-obstacle]' });

        return { gone, ownerAfterDestroy, trailAfterDestroy, layers: document.querySelectorAll('.liquid-cursor-layer').length, hosts: document.querySelectorAll('.liquid-original-dots').length, intensity: LiquidCursor.current.intensity };
      });
      await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(300);
      await stroke(P, 300, 400, 12);
      const frames = await P.evaluate(() => LiquidCursor.current.engine.stats.frames);
      assert.equal(v.gone, 0); assert.equal(v.ownerAfterDestroy, null); assert.notEqual(v.trailAfterDestroy, 'none'); assert.equal(v.layers, 2); assert.equal(v.hosts, 1); assert.equal(v.intensity, 'mucho'); assert(frames > 0);
      return Object.assign(v, { frames });
    });
    await test('movimiento reducido / dinámico: juice a Nada, motor destruido, sin animación', async () => {
      await P.emulateMedia({ reducedMotion: 'reduce' }); await P.waitForTimeout(150);
      await stroke(P, 300, 400, 12);
      const v = await P.evaluate(() => ({ level: JZ.level, intensity: LiquidCursor.current.intensity, engine: !!LiquidCursor.current.engine, dots: LiquidCursor.current.dots.stats.alive,
        display: [...document.querySelectorAll('.liquid-cursor-layer')].map((c) => getComputedStyle(c).display),
        running: document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.liquid-original-dots,.jzh-layer')).length }));
      await P.emulateMedia({ reducedMotion: 'no-preference' }); await P.waitForTimeout(150);
      assert.equal(v.level, 'off'); assert.equal(v.intensity, 'nada'); assert.equal(v.engine, false); assert.equal(v.dots, 0);
      assert(v.display.every((x) => x === 'none')); assert.equal(v.running, 0);
      return v;
    });
    await test('carga / sigue sin errores JS ni 404 tras todo el recorrido', async () => {
      assert.deepEqual(d.log.errors, []); assert.deepEqual(d.log.bad, []);
      return { ok: true };
    });
    const video = d.page.video(); await d.ctx.close();
    if (video) fs.renameSync(await video.path(), path.join(out, 'desktop-recorrido.webm'));

    await test('movimiento reducido / inicial: Nada, sin capas activas, Moki quieto', async () => {
      const r = await open(browser, site.url, { reducedMotion: 'reduce' });
      await stroke(r.page, 300, 400, 12);
      const v = await r.page.evaluate(() => ({ level: JZ.level, intensity: LiquidCursor.current.intensity, engine: !!LiquidCursor.current.engine,
        dots: LiquidCursor.current.dots.stats.spawned, still: [...document.querySelectorAll('.moki')].every((m) => m.classList.contains('is-still')),
        radios: [...document.querySelectorAll('.jz-panel input')].every((i) => i.disabled) }));
      await r.ctx.close();
      assert.equal(v.level, 'off'); assert.equal(v.intensity, 'nada'); assert.equal(v.engine, false); assert.equal(v.dots, 0); assert(v.still); assert(v.radios);
      return v;
    });
    await test('rollback / ?cursor=off no monta el cursor y la estela de juice vuelve', async () => {
      const r = await open(browser, site.url + '?cursor=off');
      await r.page.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); JZ.setLevel('hard'); });
      let made = 0, visible = 0;
      for (let i = 0; i < 10; i++) { await r.page.mouse.move(300 + i * 25, 380); await r.page.waitForTimeout(45);
        const c = await r.page.evaluate(() => [document.querySelectorAll('.jzh-t').length, [...document.querySelectorAll('.jzh-t')].filter((t) => getComputedStyle(t).display !== 'none').length]);
        made = Math.max(made, c[0]); visible = Math.max(visible, c[1]); }
      const v = await r.page.evaluate(() => ({ current: LiquidCursor.current, layers: document.querySelectorAll('.liquid-cursor-layer').length, owner: document.documentElement.getAttribute('data-game-feel-cursor') }));
      await r.page.evaluate(() => localStorage.clear());
      assert.deepEqual(r.log.errors, []); await r.ctx.close();
      assert.equal(v.current, null); assert.equal(v.layers, 0); assert.equal(v.owner, null); assert(made > 0); assert(visible > 0);
      return Object.assign(v, { made, visible });
    });

    // ---------- móvil 375 ----------
    const m = await open(browser, site.url, { viewport: { width: 375, height: 760 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
      recordVideo: { dir: out, size: { width: 375, height: 760 } } });
    const M = m.page;
    await test('móvil 375 / sin overflow horizontal en los 4 niveles', async () => {
      await M.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); });
      const widths = [];
      for (const [value] of LEVELS) {
        await setLevel(M, value);
        for (const y of [0, 0.25, 0.5, 0.75, 1]) {
          await M.evaluate((f) => scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight)), y); await M.waitForTimeout(150);
          widths.push(await M.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
        }
      }
      await M.evaluate(() => { document.documentElement.removeAttribute('data-jz-hard'); JZ.paint(); scrollTo(0, 0); });
      await setLevel(M, 'full');
      assert(widths.every(([sw, iw]) => sw <= iw), JSON.stringify(widths));
      return { checks: widths.length, max: Math.max(...widths.map((w) => w[0])) };
    });
    await test('móvil 375 / touch no se previene; idioma, menú y Juega responden al tap', async () => {
      await M.evaluate(() => { window.__prevented = []; for (const t of ['touchstart', 'touchend', 'pointerdown', 'click']) addEventListener(t, (e) => { if (e.defaultPrevented && !e.target.closest('a[lang],.hud__burger')) window.__prevented.push(t); }); });
      await M.tap('.lang-switcher .en-btn'); await M.waitForFunction(() => document.documentElement.lang === 'en');
      await M.tap('.hud__burger'); const burger = await M.getAttribute('.hud__burger', 'aria-expanded');
      await M.tap('.hud__burger');
      const lvl = M.locator('.hud .jz-lvl:visible, .hud .jz-feel:visible').first(); await lvl.tap();
      const panel = await M.locator('#jz-panel').isVisible(); await M.keyboard.press('Escape');
      await M.tap('.lang-switcher .es-btn');
      await M.touchscreen.tap(180, 500);
      const v = await M.evaluate(() => ({ prevented: window.__prevented, coarse: matchMedia('(pointer: coarse)').matches, touch: LiquidCursor.current.stats.touch,
        engine: LiquidCursor.current.engine ? LiquidCursor.current.engine.stats : null }));
      assert.equal(burger, 'true'); assert(panel); assert.deepEqual(v.prevented, []); assert.equal(v.touch, false);
      assert(!v.engine || v.engine.splats === 0, 'el fluido no reacciona al touch');
      await M.screenshot({ path: path.join(out, 'mobile-375.png') });
      return v;
    });
    await test('móvil 375 / sin errores JS ni 404 propios', async () => {
      assert.deepEqual(m.log.errors, []); assert.deepEqual(m.log.bad, []);
      return { ok: true };
    });
    await M.evaluate(() => document.querySelector('.mcard').scrollIntoView({ block: 'center' })); await M.waitForTimeout(2600);
    await M.screenshot({ path: path.join(out, 'mobile-375-moki.png') });
    const mv = M.video(); await m.ctx.close();
    if (mv) fs.renameSync(await mv.path(), path.join(out, 'mobile-recorrido.webm'));
    await test('matriz adicional / 320,390,1440 ES+EN normal y movimiento reducido', async () => {
      const r = await open(browser, site.url);
      const rows = [];
      try {
        for (const width of [320, 390, 1440]) {
          await r.page.setViewportSize({ width, height: 900 });
          for (const lang of ['es', 'en']) {
            await r.page.emulateMedia({ reducedMotion: 'no-preference' });
            await r.page.locator('.lang-switcher .' + lang + '-btn').click();
            await r.page.waitForFunction(l => document.documentElement.lang === l, lang);
            await r.page.evaluate(() => { document.documentElement.setAttribute('data-jz-hard', 'open'); JZ.paint(); });
            for (const [level] of LEVELS) {
              await setLevel(r.page, level);
              const row = await r.page.evaluate(() => ({ sw:document.documentElement.scrollWidth, iw:innerWidth, level:JZ.level, lang:document.documentElement.lang, mainTransform:getComputedStyle(document.querySelector('main')).transform }));
              assert(row.sw <= row.iw, JSON.stringify(row));
              assert.equal(row.mainTransform, 'none', 'Hardcore must not rotate the full-height document');
              rows.push(row);
              if (level === 'full') await r.page.screenshot({ path: path.join(out, 'matrix-' + width + '-' + lang + '-normal.png') });
            }
            await r.page.emulateMedia({ reducedMotion: 'reduce' });
            await r.page.waitForFunction(() => JZ.level === 'off' && LiquidCursor.current.intensity === 'nada' && LiquidCursor.current.engine === null);
            const row = await r.page.evaluate(() => ({ sw:document.documentElement.scrollWidth, iw:innerWidth, level:JZ.level, lang:document.documentElement.lang, reduced:true }));
            assert(row.sw <= row.iw, JSON.stringify(row)); rows.push(row);
            await r.page.screenshot({ path: path.join(out, 'matrix-' + width + '-' + lang + '-reduced.png') });
          }
        }
        assert.deepEqual(r.log.errors, []); assert.deepEqual(r.log.bad, []);
        return { checks:rows.length, rows };
      } finally { await r.ctx.close(); }
    });
    for (const date of ['2026-10-22', '2026-10-23']) {
      for (const width of [1280, 320, 390]) {
        await test('Moki real / ' + date + ' ' + width + 'px: cinco clics desbloquean Hardcore', async () => {
          const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'es-MX', timezoneId: 'America/Mexico_City' });
          await ctx.addInitScript((iso) => {
            const NativeDate = Date, now = new NativeDate(iso + 'T12:00:00-06:00').getTime();
            window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
          }, date);
          const p = await ctx.newPage(), log = watch(p), spots = [];
          try {
            await p.goto(site.url, { waitUntil: 'load' }); await p.evaluate(() => papacitoReady);
            assert.equal(await p.locator('.moki').count(), 5);
            assert.equal(await p.locator('input[value=hard]').isDisabled(), true);
            const ids = await p.locator('.moki').evaluateAll(ms => ms.map(m => m.dataset.mokiSpot));
            for (const id of ids) {
              const m = p.locator('[data-moki-spot="' + id + '"]');
              await m.scrollIntoViewIfNeeded(); await m.focus();
              await p.waitForFunction(id => { const m = document.querySelector('[data-moki-spot="' + id + '"]'); return m.classList.contains('is-out') && m.querySelector('.moki__img').naturalWidth > 0; }, id);
              await p.waitForTimeout(750);
              const info = await m.evaluate(m => {
                const img = m.querySelector('.moki__img'), r = img.getBoundingClientRect(), c = m.querySelector('.moki__clip').getBoundingClientRect();
                const v = { left: Math.max(r.left,c.left,0), top: Math.max(r.top,c.top,0), right: Math.min(r.right,c.right,innerWidth), bottom: Math.min(r.bottom,c.bottom,innerHeight) };
                let hit = null;
                for (const a of [.5,.25,.75]) for (const b of [.5,.25,.75]) {
                  const x = v.left + (v.right-v.left)*a, y = v.top+(v.bottom-v.top)*b;
                  const el = document.elementFromPoint(x,y); if (el && m.contains(el)) hit = {x,y};
                }
                // Layout dimensions exclude the intentional waving rotation;
                // its axis-aligned bounding box is not an image aspect ratio.
                const css = getComputedStyle(img);
                return { id:m.dataset.mokiSpot, pose:m.dataset.mokiPose, width:r.width, height:r.height, ratio:parseFloat(css.width)/parseFloat(css.height), natural:img.naturalWidth/img.naturalHeight, visibleWidth:v.right-v.left, visibleHeight:v.bottom-v.top, hit, top:r.top+scrollY };
              });
              assert(info.visibleWidth > 20 && info.visibleHeight > 20, JSON.stringify(info));
              assert(Math.abs(info.ratio-info.natural) < .03, 'stretched Moki ' + JSON.stringify(info));
              assert(info.hit, 'Moki covered or clipped ' + JSON.stringify(info));
              await p.mouse.click(info.hit.x, info.hit.y);
              await p.waitForFunction(n => Moki.found().length === n, spots.length + 1);
              spots.push(info);
            }
            await p.waitForFunction(() => localStorage.getItem('jz-hard') === '1' && !document.querySelector('input[value=hard]').disabled);
            assert.equal(new Set(spots.map(s => s.pose)).size,5, 'duplicate daily pose');
            await p.screenshot({path:path.join(out,'moki-unlocked-'+date+'-'+width+'.png')});
            assert.deepEqual(log.errors,[]); assert.deepEqual(log.bad,[]);
            return { spots, found:await p.evaluate(() => Moki.found().length), unlocked:true };
          } finally { await ctx.close(); }
        });
      }
    }
    await test('fallback / sin WebGL: perfil completo y navegación sin errores', async () => {
      const ctx = await browser.newContext();
      await ctx.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type,...args) { return /webgl|experimental-webgl/.test(type) ? null : get.call(this,type,...args); }; });
      const p = await ctx.newPage(), log = watch(p);
      try {
        await p.goto(site.url); await p.evaluate(() => papacitoReady); await stroke(p,200,400,12);
        await p.click('.lang-switcher .en-btn'); assert.equal(await p.getAttribute('html','lang'),'en');
        const v = await p.evaluate(() => ({ profile:PapacitoJuice.current.profile.version, stats:LiquidCursor.current.stats }));
        assert.deepEqual(log.errors,[]); assert.deepEqual(log.bad,[]); return v;
      } finally { await ctx.close(); }
    });
    await test('touch / gesto CDP confiable desplaza, cancela y no se previene', async () => {
      const r = await open(browser, site.url, {viewport:{width:390,height:844}, isMobile:true,hasTouch:true});
      try {
        await r.page.evaluate(() => { window.__touch={cancel:0,prevented:0,trusted:0}; for(const type of ['touchmove','pointermove','pointercancel']) addEventListener(type,e=>{ if(e.defaultPrevented) __touch.prevented++; if(e.isTrusted) __touch.trusted++; if(type==='pointercancel') __touch.cancel++; },{passive:true}); });
        const cdp = await r.ctx.newCDPSession(r.page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:700}]});
        for(let y=680;y>=220;y-=20) { await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]}); await r.page.waitForTimeout(16); }
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await r.page.waitForTimeout(500);
        const v = await r.page.evaluate(() => ({...__touch,y:scrollY}));
        assert(v.y>100); assert(v.cancel>0); assert(v.trusted>0); assert.equal(v.prevented,0); assert.deepEqual(r.log.errors,[]); return v;
      } finally { await r.ctx.close(); }
    });
  } finally {
    if (browser) await browser.close();
    for (const s of [site, base]) if (s) await new Promise((ok) => s.server.close(ok));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const report = { generated: new Date().toISOString(), base: BASE_SHA, engine: GOLDEN_ENGINE, chromium: 'playwright swiftshader (sin teléfono físico)', passed: results.length - failed, failed, results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  console.log('\n' + report.passed + ' PASS / ' + failed + ' FAIL · evidencia en qa/cursor-liquido/');
  process.exit(failed ? 1 : 0);
})();
