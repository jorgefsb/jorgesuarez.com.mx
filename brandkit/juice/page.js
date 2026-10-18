(() => {
  'use strict';

  function now() {
    const el = document.querySelector('[data-jz-now]');
    if (!el || !window.JZ) return;
    const es = document.documentElement.lang !== 'en';
    const lab = document.querySelector('[data-jz-lab="' + window.JZ.level + '"]');
    el.textContent = (es ? 'Nivel actual: ' : 'Current level: ') + (lab ? lab.textContent : window.JZ.level);
  }

  document.querySelectorAll('[data-set-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.JZ) window.JZ.setLevel(btn.getAttribute('data-set-level'));
      now();
    });
  });

  document.addEventListener('jz:lang', now);
  setTimeout(now, 0);
  new MutationObserver(now).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-jz-level', 'lang']
  });
})();
