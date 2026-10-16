(() => {
  'use strict';
  const sw = document.querySelector('.iv-lang');
  if (!sw) return;

  const statusEn = {Aprobado:'Approved',Heredado:'Inherited',Propuesto:'Proposed',Pendiente:'Pending'};
  const statusEs = {Approved:'Aprobado',Inherited:'Heredado',Proposed:'Propuesto',Pending:'Pendiente'};

  function setLang(lang) {
    const code = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = code;
    document.querySelectorAll('[data-es]').forEach((el) => {
      if (el.querySelector('[data-es], a[lang]')) return;
      const v = el.getAttribute('data-' + code);
      if (!v) return;
      if (el.tagName === 'META') el.setAttribute('content', v);
      else if (el.tagName === 'TITLE') document.title = v;
      else el.innerHTML = v;
    });
    document.querySelectorAll('[data-en-alt]').forEach((el) => {
      const v = code === 'en' ? el.getAttribute('data-en-alt') : el.getAttribute('data-es-alt') || el.getAttribute('alt');
      if (v) el.setAttribute('alt', v);
    });
    document.querySelectorAll('[data-en-aria-label]').forEach((el) => {
      const v = code === 'en' ? el.getAttribute('data-en-aria-label') : el.getAttribute('data-es-aria-label') || el.getAttribute('aria-label');
      if (v) el.setAttribute('aria-label', v);
    });
    document.querySelectorAll('.color').forEach((item) => {
      const title = item.querySelector('h3');
      const hexBtn = item.querySelector('.copycolor');
      if (!title || !window.BRAND_KIT) return;
      const color = window.BRAND_KIT.colors.find((c) => c.hex === (hexBtn && hexBtn.textContent || '').slice(0, 7));
      if (!color) return;
      title.textContent = code === 'en' && color.name_en ? color.name_en : color.name;
    });
    document.querySelectorAll('.status').forEach((el) => {
      if (el.hasAttribute('data-es')) return;
      const map = code === 'en' ? statusEn : statusEs;
      if (map[el.textContent.trim()]) el.textContent = map[el.textContent.trim()];
    });
    sw.querySelectorAll('a[lang]').forEach((a) => {
      a.classList.toggle('iv-lang-on', a.lang === code);
      if (a.lang === code) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    try { localStorage.setItem('preferred-lang', code); } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('lang', code);
    history.replaceState(null, '', url);
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
