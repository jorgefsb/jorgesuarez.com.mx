/* JorgeSuarez.com.mx v2.0: HUD, idioma, riel de Moki y montaje de scroll-craft.
   El motor vive en engine/scrollcraft.js y no se modifica. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 860px)').matches;

  /* 1. Actos marcados data-small="flow" no caben pineados en pantallas chicas:
        pasan a lectura normal con entrada suave, mismo contenido. */
  if (small) {
    document.querySelectorAll('[data-small="flow"]').forEach(function (sec) {
      sec.removeAttribute('data-sc-act');
      sec.removeAttribute('data-sc-span');
      sec.classList.add('is-flow');
      sec.querySelectorAll('[data-sc-cue]').forEach(function (el) {
        el.removeAttribute('data-sc-cue');
        el.setAttribute('data-sc-in', '');
      });
    });
  }

  /* 2. Marquesina de testimonios: se duplica para el loop, la copia no se lee. */
  if (!reduce) document.querySelectorAll('[data-marquee] .marquee__track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      track.appendChild(c);
    });
  });

  /* 3. Idioma: mismo sistema que el v1 (data-es / data-en). */
  var onLang = [];
  var sw = document.querySelector('.lang-switcher');
  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (!v) return;
      if (el.tagName === 'META') el.setAttribute('content', v);
      else el.innerHTML = v;
    });
    sw.querySelectorAll('a[lang]').forEach(function (a) { a.classList.toggle('active', a.lang === lang); });
    try { localStorage.setItem('preferred-lang', lang); } catch (_) {}
    onLang.forEach(function (fn) { fn(); });
  }
  sw.addEventListener('click', function (e) {
    var a = e.target.closest('a[lang]');
    if (a) { e.preventDefault(); setLang(a.lang); }
  });
  var saved = null;
  try { saved = localStorage.getItem('preferred-lang'); } catch (_) {}
  var urlLang = new URLSearchParams(location.search).get('lang');
  var browser = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  setLang(['es', 'en'].indexOf(urlLang) > -1 ? urlLang : (saved || browser));

  /* 4. Motor. */
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  /* 5. HUD. */
  var hud = document.querySelector('[data-hud]');
  var burger = hud.querySelector('.hud__burger');
  var nav = document.getElementById('hud-nav');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (window.JZ) {
      window.JZ.press(burger);
      window.JZ.snd('tap');
      if (open) {
        setTimeout(function () { window.JZ.stagger(nav, 'menu'); }, 0);
      }
    }
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  });

  /* 6. Firma: Moki camina por el riel y planta una bandera por capítulo. */
  var quest = document.querySelector('[data-quest]');
  var flagsEl = quest.querySelector('.quest__flags');
  var mokiSlot = quest.querySelector('.quest__moki-slot') || quest.querySelector('.quest__moki');
  var track = quest.querySelector('.quest__track');
  var label = quest.querySelector('.quest__label');
  var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
  var flags = [], buttons = [], marks = [];
  var current = -1, started = false, scrolled = null;
  var max = 1, trackW = 0;
  var announceT = 0, walkT = 0, lastY = window.scrollY;

  function titleOf(sec) {
    var h = sec.querySelector('h1, h2');
    if (!h) return '';
    // Título corto opcional para la barra de banderas: data-quest-es / data-quest-en
    var corto = h.getAttribute('data-quest-' + (document.documentElement.lang === 'en' ? 'en' : 'es'));
    return corto || h.textContent.replace(/\s+/g, ' ').trim();
  }

  chapters.forEach(function (_, i) {
    var li = document.createElement('li');
    li.className = 'quest__flag';
    var b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', function () {
      var y = marks[i] + (i === 0 ? 0 : 2);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
    li.appendChild(b);
    flagsEl.appendChild(li);
    flags.push(li);
    buttons.push(b);
  });

  function relabel() {
    chapters.forEach(function (sec, i) {
      var t = titleOf(sec);
      buttons[i].setAttribute('aria-label', t);
      buttons[i].title = t;
    });
    if (current > -1) label.textContent = titleOf(chapters[current]);
  }
  onLang.push(relabel);

  function measure() {
    max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    trackW = track.getBoundingClientRect().width;
    marks = chapters.map(function (sec) {
      return Math.min(max, sec.getBoundingClientRect().top + window.scrollY);
    });
    marks.forEach(function (y, i) { flags[i].style.left = (y / max * 100) + '%'; });
    update();
  }

  function update() {
    var y = window.scrollY;
    var q = Math.min(1, Math.max(0, y / max));
    quest.style.setProperty('--q', q.toFixed(4));
    quest.style.setProperty('--qx', (q * trackW).toFixed(1) + 'px');

    var probe = y + window.innerHeight * 0.4;
    var idx = 0;
    marks.forEach(function (m, i) { if (probe >= m) idx = i; });
    if (q > 0.985) idx = chapters.length - 1;
    var moved = y > 4;
    if (idx !== current || moved !== started) {
      started = moved;
      quest.classList.toggle('is-started', moved);
      flags.forEach(function (f, i) { f.classList.toggle('is-planted', i <= idx && (idx > 0 || moved)); });
    }
    if (idx !== current) {
      current = idx;
      label.textContent = titleOf(chapters[idx]);
      if (y > 4) {
        quest.classList.add('is-announcing');
        clearTimeout(announceT);
        announceT = setTimeout(function () { quest.classList.remove('is-announcing'); }, 1700);
      }
      var id = chapters[idx].id;
      nav.querySelectorAll('a').forEach(function (a) {
        a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false');
      });
      hud.dataset.ground = chapters[idx].getAttribute('data-theme') === 'papel' ? 'papel' : 'oscuro';
    }
    if (q > 0.985) quest.classList.add('is-done');
    else if (q < 0.95) quest.classList.remove('is-done');

    if ((y > 24) !== scrolled) { scrolled = y > 24; hud.classList.toggle('is-scrolled', scrolled); }

    if (!reduce) {
      var dy = y - lastY;
      var tilt = Math.max(-8, Math.min(8, dy * 0.25));
      mokiSlot.style.setProperty('--tilt', tilt.toFixed(1) + 'deg');
      if (Math.abs(dy) > 0.5) {
        quest.classList.add('is-walking');
        clearTimeout(walkT);
        walkT = setTimeout(function () {
          quest.classList.remove('is-walking');
          mokiSlot.style.setProperty('--tilt', '0deg');
        }, 180);
      }
    }
    lastY = y;
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  var sizing = false;
  window.addEventListener('resize', function () {
    if (sizing) return;
    sizing = true;
    requestAnimationFrame(function () { sizing = false; measure(); });
  });
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  relabel();
  measure();
  quest.hidden = false;

  var foot = document.querySelector('.foot');
  if (foot && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      quest.classList.toggle('is-foot-in', entries[0].isIntersecting);
    }).observe(foot);
  }

  /* 7. Lo último: 6 publicaciones con imagen desde el muro en vivo (lógica del v1).
        Si el muro no responde, la sección se queda oculta. */
  (function initLatest() {
    var section = document.getElementById('lo-ultimo');
    var grid = document.getElementById('latest-grid');
    if (!section || !grid || !window.fetch) return;
    var host = location.hostname;
    if (host !== 'jorgesuarez.com.mx' && host !== 'www.jorgesuarez.com.mx') return;
    var API = 'https://muro.jorgesuarez.com.mx';
    var NAMES = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', threads: 'Threads', bluesky: 'Bluesky' };
    var items = [];
    var esc = function (v) { return String(v || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var ago = function (iso, lang) {
      var m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
      var es = lang !== 'en';
      if (m < 60) return es ? 'hace ' + Math.max(m, 1) + ' min' : Math.max(m, 1) + ' min ago';
      var h = Math.round(m / 60);
      if (h < 24) return es ? 'hace ' + h + ' h' : h + ' h ago';
      var d = Math.round(h / 24);
      return es ? (d === 1 ? 'ayer' : 'hace ' + d + ' días') : (d === 1 ? 'yesterday' : d + ' days ago');
    };
    var render = function () {
      var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
      grid.innerHTML = items.map(function (p) {
        return '<a class="latest-card" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          '<img src="' + API + '/img?u=' + encodeURIComponent(p.image) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' +
          '<div class="latest-body"><div class="latest-meta"><b>' + (NAMES[p.network] || esc(p.network)) + '</b> · ' + ago(p.date, lang) + '</div>' +
          '<p class="latest-text">' + esc((p.text || '').replace(/\s*https?:\/\/\S+/g, '')) + '</p></div></a>';
      }).join('');
    };
    var load = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    load(function () { fetch(API + '/api/posts?limit=24')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        var posts = (d.posts || []).filter(function (p) { return p.image && p.source === 'own'; });
        var seen = {};
        items = posts.filter(function (p) { if (seen[p.network]) return false; seen[p.network] = 1; return true; }).slice(0, 6);
        if (items.length < 6) items = items.concat(posts.filter(function (p) { return items.indexOf(p) < 0; }).slice(0, 6 - items.length));
        if (!items.length) return;
        render();
        section.hidden = false;
        onLang.push(render);
        measure();
      })
      .catch(function () {}); });
  })();

  /* 8. Videos: miniatura enmarcada; al dar clic se reproduce ahí mismo. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.vframe__play');
    if (!b) return;
    var id = b.getAttribute('data-yt');
    if (!id) {
      if (window.JZ) window.JZ.play('jz-error', b);
      return;
    }
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + id + (id.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
    f.title = b.getAttribute('data-title');
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    b.replaceWith(f);
  });

  /* 9. Juice 1.0.1: squash, partículas naranja, Moki. Sonido apagado por defecto (paquete). */
  (function bindJuice() {
    var jz = window.JZ;
    if (!jz) return;
    jz.feedback('jz-cta', [
      { fx: 'press' }, { fx: 'flash' }, { fx: 'ripple' },
      { fx: 'burst' }, { fx: 'moki-hop' }, { fx: 'tap' }
    ]);
    onLang.push(function () { jz.paint(); });
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    document.addEventListener('pointermove', function (e) {
      if (!fine || jz.red() || e.pointerType === 'touch') return;
      jz.look(e.target);
    }, { passive: true });
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('.juice-sfx, .jz-lvl, .jz-feel, [data-jz], .hud__burger')) return;
      var live = t.closest('[data-jz-moki]');
      if (live) { jz.snd('tap'); jz.hop(live); return; }
      var sq = t.closest('.btn, .social, .lang-switcher a, .row__cta, .tag--link');
      if (sq) jz.press(sq);
    });
  })();
})();

/* Menús del header (Laboratorio y Conecta): abren y cierran su submenú; Escape o clic afuera los cierran. */
(function () {
  var grps = Array.prototype.slice.call(document.querySelectorAll('.hud__grp'));
  if (!grps.length) return;
  function set(grp, open) {
    grp.classList.toggle('is-open', open);
    grp.querySelector('.hud__grpbtn').setAttribute('aria-expanded', String(open));
  }
  grps.forEach(function (grp) {
    grp.querySelector('.hud__grpbtn').addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !grp.classList.contains('is-open');
      grps.forEach(function (g) { set(g, g === grp ? open : false); });
    });
    grp.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(grp, false); }); });
  });
  document.addEventListener('click', function (e) { grps.forEach(function (g) { if (!g.contains(e.target)) set(g, false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') grps.forEach(function (g) { set(g, false); }); });
})();

/* Tablero «Alcance de la marca» (9-nov-2026): lee data/alcance.json, pinta las letras
   y las hace girar como tablero de estación la primera vez que se ve. Sin datos, se queda lo que ya trae el HTML. */
(function () {
  var fb = document.querySelector('[data-flapboard]');
  if (!fb) return;
  var board = fb.querySelector('[data-fb-board]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,';
  var MES = { es: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'], en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] };
  var data = null, played = false;
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'es'; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function cells(text, from) {
    return text.split('').map(function (c, i) {
      return '<span class="fb__c' + (c === ' ' ? ' fb__c--b' : '') + (i >= from && c !== ' ' ? ' fb__c--n' : '') + '">' + c + '</span>';
    }).join('');
  }
  function render() {
    if (!data) return;
    var L = lang(), lbl = L === 'en' ? 'FOLLOWERS ' : 'SEGUIDORES ';
    var html = '<div class="fb__row fb__row--total" aria-hidden="true">' + cells(lbl + fmt(data.seguidores_total), lbl.length) + '</div>';
    html += '<div class="fb__cols" aria-hidden="true"><span>' + (L === 'en' ? 'Network' : 'Red') + '</span><span>' + (L === 'en' ? 'Followers' : 'Seguidores') + '</span></div>';
    data.redes.forEach(function (r, i) {
      var v = fmt(r.seguidores), name = r.red.toUpperCase(), w = 21;
      var t = (name + new Array(w).join(' ')).slice(0, w - v.length) + v;
      html += '<div class="fb__row' + (i >= 3 ? ' fb__row--extra' : '') + '" aria-hidden="true">' + cells(t, w - v.length) + '</div>';
    });
    board.innerHTML = html;
    var d = (data.corte || '').split('-');
    var dateEl = fb.querySelector('[data-fb-date]');
    if (d.length === 3 && dateEl) {
      var m = MES[L][Number(d[1]) - 1], dd = Number(d[2]);
      dateEl.textContent = L === 'en' ? 'As of ' + m + ' ' + dd + ', ' + d[0] : 'Corte: ' + dd + ' ' + m + ' ' + d[0];
    }
    var sr = fb.querySelector('[data-fb-sr]');
    if (sr) sr.textContent = fmt(data.seguidores_total) + (L === 'en' ? ' followers across ' : ' seguidores en ') + data.perfiles + (L === 'en' ? ' profiles. ' : ' perfiles. ') +
      data.redes.map(function (r) { return r.red + ': ' + fmt(r.seguidores); }).join('; ') + '.';
  }
  function play() {
    if (reduce) return;
    Array.prototype.forEach.call(board.querySelectorAll('.fb__row'), function (row, r) {
      Array.prototype.forEach.call(row.children, function (c, i) {
        var target = c.textContent;
        if (target === ' ') return;
        var steps = 6 + Math.floor(Math.random() * 9), start = (CH.indexOf(target) - steps + CH.length) % CH.length, k = 0;
        c.textContent = ' ';
        setTimeout(function tick() {
          c.textContent = CH[(start + k) % CH.length];
          c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
          if (k++ < steps) setTimeout(tick, 60); else c.textContent = target;
        }, r * 130 + i * 34);
      });
    });
  }
  fetch('data/alcance.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j && j.redes) { data = j; if (!played) render(); } }).catch(function () {});
  new MutationObserver(function () { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !played) { played = true; io.disconnect(); play(); }
    }, { threshold: .5 });
    io.observe(board);
  }
})();
