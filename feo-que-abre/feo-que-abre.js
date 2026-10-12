(() => {
  const STORAGE_KEY = 'feo-que-abre:v1';
  const CHECKS = ['button', 'enemy', 'death', 'outside', 'twenty'];
  const COPY = {
    es: {
      choose: 'Elige un build y arranca el cronómetro al hacer doble clic.',
      running: 'Cronómetro corriendo. Marca la primera muerte cuando ocurra.',
      stopped: (name, time) => `${name}: primera muerte en ${time}.`,
      saved: 'Resultado copiado. Listo para compartir.',
      copyError: 'El portapapeles está bloqueado. El resultado quedó seleccionado; copia con ⌘C o Ctrl+C.',
      copied: 'Resultado de prueba · El feo que abre',
      build: (id) => `BUILD ${id.toUpperCase()}`,
      bootFirst: 'ABRE PRIMERO',
      selected: 'EN PRUEBA',
      markFirst: 'Marcar que abre primero',
      clearFirst: 'Quitar marca de primero',
      select: 'Elegir para probar',
      selectedButton: 'Build seleccionado',
      checks: (count) => `${count} / 5 listas`,
      checksDone: 'Pre-vuelo completo',
      queueMinus: 'Quitar una persona',
      queuePlus: 'Sumar una persona',
      queueLine: 'personas en la fila',
      noFirst: 'Sin registrar',
      noTime: '—',
      checklistTitle: 'Pre-vuelo',
      yes: 'sí',
      no: 'no',
      timeLabel: 'primera muerte',
      firstLabel: 'abrió primero',
      queueLabel: 'personas que se formaron'
    },
    en: {
      choose: 'Choose a build and start the clock on double-click.',
      running: 'Clock running. Mark the first death when it happens.',
      stopped: (name, time) => `${name}: first death in ${time}.`,
      saved: 'Result copied. Ready to share.',
      copyError: 'Clipboard access is blocked. The result is selected; copy it with ⌘C or Ctrl+C.',
      copied: 'Playtest result · The ugly build that boots',
      build: (id) => `BUILD ${id.toUpperCase()}`,
      bootFirst: 'BOOTS FIRST',
      selected: 'TESTING',
      markFirst: 'Mark as first to boot',
      clearFirst: 'Clear first-to-boot mark',
      select: 'Select to test',
      selectedButton: 'Selected build',
      checks: (count) => `${count} / 5 ready`,
      checksDone: 'Pre-flight complete',
      queueMinus: 'Remove one player',
      queuePlus: 'Add one player',
      queueLine: 'players in line',
      noFirst: 'Not recorded',
      noTime: '—',
      checklistTitle: 'Pre-flight',
      yes: 'yes',
      no: 'no',
      timeLabel: 'first death',
      firstLabel: 'booted first',
      queueLabel: 'players who lined up'
    }
  };

  const freshState = () => ({
    checks: Object.fromEntries(CHECKS.map(key => [key, false])),
    activeBuild: 'a',
    firstBoot: null,
    queue: 0,
    builds: {
      a: { name: 'Build A', seconds: null },
      b: { name: 'Build B', seconds: null }
    }
  });

  let state = freshState();
  let lang = 'es';
  let timerStartedAt = null;
  let timerInterval = null;
  let elapsed = 0;
  let lastRecorded = null;
  let copyBlocked = false;
  let copyMessageTimeout = null;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && typeof stored === 'object') {
      state = {
        ...freshState(),
        ...stored,
        checks: { ...freshState().checks, ...(stored.checks || {}) },
        builds: {
          a: { ...freshState().builds.a, ...(stored.builds?.a || {}) },
          b: { ...freshState().builds.b, ...(stored.builds?.b || {}) }
        }
      };
      if (!['a', 'b'].includes(state.activeBuild)) state.activeBuild = 'a';
      if (state.firstBoot && !['a', 'b'].includes(state.firstBoot)) state.firstBoot = null;
      if (!Number.isFinite(state.queue) || state.queue < 0) state.queue = 0;
    }
  } catch (_) {
    state = freshState();
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const dictionary = () => COPY[lang];
  const translate = (es, en) => lang === 'es' ? es : en;

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function applyLanguage(nextLang, savePreference = true) {
    lang = nextLang === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    $$('[data-es]').forEach(element => {
      const translated = element.getAttribute(`data-${lang}`);
      if (translated === null) return;
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translated;
      } else if (element.tagName === 'META') {
        element.setAttribute('content', translated);
      } else {
        element.innerHTML = translated;
      }
    });
    $$('.lang-switcher .es-btn').forEach(link => link.classList.toggle('active', lang === 'es'));
    $$('.lang-switcher .en-btn').forEach(link => link.classList.toggle('active', lang === 'en'));
    $$('[data-es-aria]').forEach(element => element.setAttribute('aria-label', element.getAttribute(`data-${lang}-aria`)));
    if (savePreference) {
      try { localStorage.setItem('preferred-lang', lang); } catch (_) {}
    }
    render();
  }

  function formatTime(milliseconds) {
    const tenths = Math.floor(milliseconds / 100) % 10;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${tenths}`;
  }

  function formatSaved(seconds) {
    return seconds === null || !Number.isFinite(seconds) ? dictionary().noTime : formatTime(seconds * 1000);
  }

  function renderTimer() {
    const display = $('#timer-display');
    if (display) display.textContent = formatTime(elapsed);
  }

  function render() {
    const words = dictionary();
    const checked = CHECKS.filter(key => state.checks[key]).length;
    $('#check-progress').textContent = words.checks(checked);
    $('#check-progress-bar').style.width = `${checked / CHECKS.length * 100}%`;
    $('.feo-progress-track').setAttribute('aria-valuenow', String(checked));
    $$('[data-check]').forEach(input => {
      input.checked = Boolean(state.checks[input.dataset.check]);
      input.closest('.feo-check-row').classList.toggle('is-checked', input.checked);
    });

    ['a', 'b'].forEach(id => {
      const card = $(`[data-build-card="${id}"]`);
      const nameInput = $(`[data-build-name="${id}"]`);
      if (document.activeElement !== nameInput) nameInput.value = state.builds[id].name;
      const isFirst = state.firstBoot === id;
      const badge = $(`[data-build-badge="${id}"]`);
      card.classList.toggle('is-active', state.activeBuild === id);
      card.classList.toggle('is-first', isFirst);
      badge.hidden = !isFirst;
      badge.textContent = words.bootFirst;
      $(`[data-build-time="${id}"]`).textContent = formatSaved(state.builds[id].seconds);
      const selectButton = $(`[data-select-build="${id}"]`);
      selectButton.disabled = timerStartedAt !== null;
      selectButton.querySelector('span').textContent = state.activeBuild === id ? words.selectedButton : words.select;
      const firstButton = $(`[data-mark-first="${id}"]`);
      firstButton.setAttribute('aria-pressed', String(isFirst));
      firstButton.querySelector('span').textContent = isFirst ? words.clearFirst : words.markFirst;
    });

    $('#active-build-label').textContent = (state.builds[state.activeBuild].name || words.build(state.activeBuild)).toLocaleUpperCase(lang === 'es' ? 'es-MX' : 'en-US');
    $('#start-timer').disabled = timerStartedAt !== null;
    $('#stop-timer').disabled = timerStartedAt === null;
    $('#timer-status').textContent = timerStartedAt !== null ? words.running : (lastRecorded ? words.stopped(lastRecorded.name, lastRecorded.time) : words.choose);
    $('#queue-count').textContent = String(state.queue);
    $('#queue-minus').disabled = state.queue === 0;
    $('#queue-minus').setAttribute('aria-label', words.queueMinus);
    $('#queue-plus').setAttribute('aria-label', words.queuePlus);
    $('#queue-label').textContent = words.queueLine;
    if (copyBlocked) {
      $('#copy-status').textContent = words.copyError;
      if (!$('#copy-fallback').hidden) $('#copy-text').value = makeResult();
    }
    renderTimer();
  }

  function startTimer() {
    if (timerStartedAt !== null) return;
    elapsed = 0;
    lastRecorded = null;
    $('#copy-fallback').hidden = true;
    timerStartedAt = performance.now();
    $('#timer-status').textContent = dictionary().running;
    timerInterval = window.setInterval(() => {
      elapsed = performance.now() - timerStartedAt;
      renderTimer();
    }, 50);
    render();
  }

  function stopTimer() {
    if (timerStartedAt === null) return;
    elapsed = Math.round((performance.now() - timerStartedAt) / 100) * 100;
    window.clearInterval(timerInterval);
    timerStartedAt = null;
    timerInterval = null;
    const seconds = Math.round(elapsed / 100) / 10;
    const build = state.builds[state.activeBuild];
    build.seconds = seconds;
    lastRecorded = { name: build.name || dictionary().build(state.activeBuild), time: formatTime(elapsed) };
    save();
    render();
  }

  function makeResult() {
    const words = dictionary();
    const complete = CHECKS.filter(key => state.checks[key]).length;
    const firstName = state.firstBoot ? (state.builds[state.firstBoot].name || words.build(state.firstBoot)) : words.noFirst;
    const lines = [
      `${words.copied}`,
      `${words.checklistTitle}: ${complete}/5`,
      `${words.firstLabel}: ${firstName}`,
      ...['a', 'b'].map(id => `${state.builds[id].name || words.build(id)} — ${words.timeLabel}: ${formatSaved(state.builds[id].seconds)}${state.firstBoot === id ? ` · ${words.firstLabel}` : ''}`),
      `${words.queueLabel}: ${state.queue}`
    ];
    return lines.join('\n');
  }

  async function copyResult() {
    const text = makeResult();
    const status = $('#copy-status');
    const fallback = $('#copy-fallback');
    fallback.hidden = true;
    copyBlocked = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand('copy');
        helper.remove();
        if (!copied) throw new Error('Copy command unavailable');
      }
      status.textContent = dictionary().saved;
    } catch (_) {
      copyBlocked = true;
      status.textContent = dictionary().copyError;
      $('#copy-text').value = text;
      fallback.hidden = false;
      $('#copy-text').focus();
      $('#copy-text').select();
    }
    window.clearTimeout(copyMessageTimeout);
    copyMessageTimeout = window.setTimeout(() => { status.textContent = ''; }, 6500);
  }

  function init() {
    const preferred = (() => { try { return localStorage.getItem('preferred-lang'); } catch (_) { return null; } })();
    const fromUrl = new URLSearchParams(location.search).get('lang');
    applyLanguage(['es', 'en'].includes(fromUrl) ? fromUrl : (preferred === 'en' ? 'en' : 'es'), false);

    $$('.lang-switcher .es-btn').forEach(link => link.addEventListener('click', event => { event.preventDefault(); applyLanguage('es'); }));
    $$('.lang-switcher .en-btn').forEach(link => link.addEventListener('click', event => { event.preventDefault(); applyLanguage('en'); }));
    $$('[data-check]').forEach(input => input.addEventListener('change', () => {
      state.checks[input.dataset.check] = input.checked;
      save();
      render();
    }));
    $$('[data-build-name]').forEach(input => input.addEventListener('input', () => {
      state.builds[input.dataset.buildName].name = input.value.trimStart();
      save();
      $('#active-build-label').textContent = (state.builds[state.activeBuild].name || dictionary().build(state.activeBuild)).toLocaleUpperCase(lang === 'es' ? 'es-MX' : 'en-US');
    }));
    $$('[data-select-build]').forEach(button => button.addEventListener('click', () => {
      if (timerStartedAt !== null) return;
      state.activeBuild = button.dataset.selectBuild;
      save();
      render();
    }));
    $$('[data-mark-first]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.markFirst;
      state.firstBoot = state.firstBoot === id ? null : id;
      save();
      render();
    }));
    $('#start-timer').addEventListener('click', startTimer);
    $('#stop-timer').addEventListener('click', stopTimer);
    $('#queue-minus').addEventListener('click', () => { state.queue = Math.max(0, state.queue - 1); save(); render(); });
    $('#queue-plus').addEventListener('click', () => { state.queue += 1; save(); render(); });
    $('#copy-result').addEventListener('click', copyResult);
    render();
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
