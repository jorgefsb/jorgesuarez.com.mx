/* Game Feel cursor adapter 1.0.1. MIT, (c) 2026 Jorge Suárez.
 * Connects an existing Cursor líquido build (window.LiquidCursor) to the
 * Juice level on <html data-jz-level>: off=nada, subtle=poquito,
 * full=mucho (10 px), hard=hardcore (18 px).
 * It never writes the level, the sound choice, achievements or a mascot.
 * While mounted it marks <html data-game-feel-cursor="liquid"> so that
 * game-feel-cursor.css hides the older Hardcore pointer trail (.jzh-t).
 * destroy() puts back whatever value that attribute had before.
 * Usage: GameFeelCursor.mount() or GameFeelCursor.mount({ cursor: LiquidCursor }).
 */
(function (root) {
  'use strict';
  const ATTRIBUTE = 'data-game-feel-cursor';
  const OWNER = 'liquid';
  const LEVELS = Object.freeze({ off: 'nada', subtle: 'poquito', full: 'mucho', hard: 'hardcore' });
  const RADII = Object.freeze({ nada: 0, poquito: 0, mucho: 10, hardcore: 18 });
  const OWN_OPTIONS = ['cursor', 'requireJuice'];

  // The cursor build must speak the same four levels with the same radii.
  // A different mapping (or a fifth level) is a version mismatch, not a fallback.
  function checkCursor(cursor) {
    if (!cursor || typeof cursor.mount !== 'function') {
      throw new Error('GameFeelCursor.mount: load cursor-liquido.js first or pass options.cursor (the LiquidCursor global)');
    }
    for (const level of Object.keys(LEVELS)) {
      const name = LEVELS[level];
      const spec = cursor.intensities && cursor.intensities[name];
      if (!cursor.juiceLevels || cursor.juiceLevels[level] !== name || !spec || spec.radius !== RADII[name]) {
        throw new Error('GameFeelCursor.mount: this LiquidCursor build does not map ' + level + ' to ' + name + ' (' + RADII[name] + ' px)');
      }
    }
  }

  function checkJuice(required) {
    const jz = root.JZ;
    if (!jz) {
      if (required) throw new Error('GameFeelCursor.mount: requireJuice is set but juice.js (window.JZ) is not loaded');
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(LEVELS, jz.level)) {
      throw new Error('GameFeelCursor.mount: unknown Juice level ' + jz.level + '; expected off, subtle, full or hard');
    }
  }

  // True when game-feel-cursor.css is active for the marked page.
  function legacyTrailHidden() {
    const probe = document.createElement('i');
    probe.className = 'jzh-t';
    document.body.appendChild(probe);
    const hidden = root.getComputedStyle(probe).display === 'none';
    probe.remove();
    return hidden;
  }

  let current = null;

  function mount(options) {
    const opts = Object.assign({ followJuice: true, requireJuice: false }, options);
    const cursor = opts.cursor || root.LiquidCursor;
    checkCursor(cursor);
    checkJuice(opts.requireJuice);
    if (current) current.destroy();

    const doc = document.documentElement;
    const had = doc.hasAttribute(ATTRIBUTE);
    const previous = doc.getAttribute(ATTRIBUTE);
    // Only undo our own mark: if someone else changed it meanwhile, it is theirs.
    const restore = () => {
      if (doc.getAttribute(ATTRIBUTE) !== OWNER) return;
      if (had) doc.setAttribute(ATTRIBUTE, previous);
      else doc.removeAttribute(ATTRIBUTE);
    };
    doc.setAttribute(ATTRIBUTE, OWNER);
    if (!legacyTrailHidden()) {
      restore();
      throw new Error('GameFeelCursor.mount: game-feel-cursor.css is not loaded, the older Hardcore trail would draw a second trail');
    }

    const cursorOptions = {};
    for (const key of Object.keys(opts)) if (!OWN_OPTIONS.includes(key)) cursorOptions[key] = opts[key];
    let instance;
    try {
      instance = cursor.mount(cursorOptions);
    } catch (error) {
      restore();
      throw error;
    }

    let done = false;
    const handle = {
      cursor: instance,
      get destroyed() { return !!instance.destroyed; },
      get stats() {
        return Object.assign({ owner: doc.getAttribute(ATTRIBUTE), juiceLevel: doc.getAttribute('data-jz-level') }, instance.stats);
      },
      destroy() {
        if (done) return;
        done = true;
        instance.destroy();
        restore();
        if (current === handle) current = null;
      }
    };
    current = handle;
    return handle;
  }

  root.GameFeelCursor = {
    version: '1.0.1',
    attribute: ATTRIBUTE,
    levels: LEVELS,
    radii: RADII,
    get current() { return current; },
    mount
  };
})(window);
