/* Papacito Juice 1.0.1. MIT, (c) 2026 Jorge Suárez. Code only: Moki artwork
 * and the personal brand are not licensed by this file.
 * Personal-brand profile of Game Feel. A Papacito Juice page always has juice
 * 1.2.0 (core, Juega menu, Hardcore), authorized Moki 1.2.0 with its artwork,
 * and Cursor líquido through the generic GameFeelCursor adapter.
 * mount() checks all of that first and changes nothing when something is
 * missing. It never sets the level, the sound choice or the Hardcore unlock,
 * and it never touches Moki: Moki stays still in Nada and keeps its daily
 * hide and seek.
 * Usage: await PapacitoJuice.mount() or await PapacitoJuice.mount({ page: 'home' }).
 */
(function (root) {
  'use strict';
  const PROFILE = Object.freeze({
    name: 'papacito-juice',
    version: '1.0.1',
    juice: '1.2.0',
    mascot: 'Moki',
    // Page configuration lives in <html>, before juice.js runs.
    sound: 'on',
    start: Object.freeze({ home: 'full', page: 'subtle' }),
    colors: Object.freeze({ c1: '#FF6B35', c2: '#FFA500', c3: '#F4E8D5' })
  });
  // Every file moki.js 1.2.0 can request: rendered poses, the back view it
  // flips to, the counter badge and the celebration dance.
  const ARTWORK = ['asoma', 'bandera', 'compu', 'espalda', 'frente', 'jugando', 'lado', 'parado', 'parche', 'saluda', 'tres-cuartos', 'verifica'];
  const OWN_OPTIONS = ['page', 'gameFeel'];

  function fail(message) {
    throw new Error('PapacitoJuice.mount: ' + message);
  }

  function checkPage(page) {
    const doc = document.documentElement;
    const expected = PROFILE.start[page];
    if (!expected) fail('unknown page "' + page + '", use "home" or "page"');
    const start = doc.getAttribute('data-jz-default') === 'full' ? 'full' : 'subtle';
    if (start !== expected) {
      fail('a "' + page + '" page starts in ' + expected + ': ' + (expected === 'full' ? 'add' : 'remove') + ' <html data-jz-default="full"> before juice.js');
    }
    if (doc.getAttribute('data-jz-sound') !== PROFILE.sound) {
      fail('the profile starts with sound on: add <html data-jz-sound="on"> (visitors can still mute)');
    }
  }

  function checkRuntime(gameFeel) {
    if (!root.JZ || typeof root.JZ.level !== 'string') fail('juice.js 1.2.0 is not loaded (window.JZ)');
    if (!document.querySelector('.jz-dock')) fail('juice-menu.js 1.2.0 did not create the Juega menu (.jz-dock)');
    if (!root.JZH || root.JZH.version !== PROFILE.juice) fail('hardcore/hardcore.js 1.2.0 is not loaded (window.JZH)');
    const moki = root.Moki;
    if (!moki || moki.version !== PROFILE.juice) {
      fail('authorized Moki 1.2.0 is not installed (moki/moki.js). Papacito Juice always includes Moki. For a page without Moki use GameFeelCursor from game-feel.');
    }
    if (!moki.poses().length) fail('Moki has no hide spots on this page: add [data-moki] spots (arriba, saluda, cuelga, asoma)');
    if (!gameFeel || typeof gameFeel.mount !== 'function') fail('game-feel-cursor.js is not loaded (window.GameFeelCursor)');
  }

  // The artwork folder is the one moki.js resolved for its rendered images.
  async function checkArtwork() {
    const img = document.querySelector('.moki .moki__img');
    const base = img.src.replace(/[^/]*$/, '');
    const missing = [];
    await Promise.all(ARTWORK.map(async pose => {
      const probe = new Image();
      probe.src = base + 'moki-' + pose + '.webp';
      try { await probe.decode(); } catch { missing.push('moki-' + pose + '.webp'); }
    }));
    if (missing.length) {
      fail('Moki artwork is missing or unreadable: ' + missing.sort().join(', ') + '. Install the authorized files from juice 1.2.0 (npm run setup).');
    }
  }

  let current = null;

  async function mount(options) {
    const opts = Object.assign({ page: 'page' }, options);
    const gameFeel = opts.gameFeel || root.GameFeelCursor;
    checkPage(opts.page);
    checkRuntime(gameFeel);
    await checkArtwork();
    if (current) current.destroy();

    const cursorOptions = {};
    for (const key of Object.keys(opts)) if (!OWN_OPTIONS.includes(key)) cursorOptions[key] = opts[key];
    // Same generic adapter, always following Juega.
    const cursor = gameFeel.mount(Object.assign(cursorOptions, { followJuice: true, requireJuice: true }));
    let done = false;
    const handle = {
      profile: PROFILE,
      page: opts.page,
      cursor,
      get poses() { return root.Moki.poses(); },
      destroy() {
        if (done) return;
        done = true;
        cursor.destroy();
        if (current === handle) current = null;
      }
    };
    current = handle;
    return handle;
  }

  root.PapacitoJuice = {
    version: PROFILE.version,
    profile: PROFILE,
    artwork: ARTWORK,
    get current() { return current; },
    mount
  };
})(window);
