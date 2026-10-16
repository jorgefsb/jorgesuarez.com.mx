/* Idioma data-es/data-en, HUD y menú. Cero JS para animar a Moki. */
(function () {
  'use strict';

  var sw = document.querySelector('.lang-switcher');
  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (!v) return;
      if (el.tagName === 'META') el.setAttribute('content', v);
      else el.innerHTML = v;
    });
    if (sw) {
      sw.querySelectorAll('a[lang]').forEach(function (a) {
        a.classList.toggle('active', a.lang === lang);
      });
    }
    try { localStorage.setItem('preferred-lang', lang); } catch (_) {}
  }
  if (sw) {
    sw.addEventListener('click', function (e) {
      var a = e.target.closest('a[lang]');
      if (a) { e.preventDefault(); setLang(a.lang); }
    });
  }
  var saved = null;
  try { saved = localStorage.getItem('preferred-lang'); } catch (_) {}
  var urlLang = new URLSearchParams(location.search).get('lang');
  var browser = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  setLang(['es', 'en'].indexOf(urlLang) > -1 ? urlLang : (saved || browser));

  var hud = document.querySelector('[data-hud]');
  var burger = hud && hud.querySelector('.hud__burger');
  var nav = document.getElementById('hud-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }
  if (hud) {
    var onScroll = function () {
      hud.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
