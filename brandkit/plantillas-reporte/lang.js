(() => {
  'use strict';
  const sw = document.querySelector('.pr-lang');
  if (!sw) return;

  function setLang(lang) {
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    document.querySelectorAll('[data-es]').forEach((el) => {
      if (el.querySelector('[data-es], a[lang]')) return;
      const v = el.getAttribute('data-' + lang);
      if (!v) return;
      if (el.tagName === 'META') el.setAttribute('content', v);
      else el.innerHTML = v;
    });
    sw.querySelectorAll('a[lang]').forEach((a) => {
      a.classList.toggle('pr-lang-on', a.lang === lang);
    });
    try { localStorage.setItem('preferred-lang', lang); } catch (_) {}
  }

  sw.addEventListener('click', (e) => {
    const a = e.target.closest('a[lang]');
    if (!a) return;
    e.preventDefault();
    setLang(a.lang);
  });

  let saved = null;
  try { saved = localStorage.getItem('preferred-lang'); } catch (_) {}
  const urlLang = new URLSearchParams(location.search).get('lang');
  const browser = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  setLang(['es', 'en'].indexOf(urlLang) > -1 ? urlLang : (saved || browser));
})();
