/* Banderas con juice (1-nov-2026, pedido de Jorge).
   Cuando Moki llega a una bandera nueva en la barra de abajo, la bandera rebota,
   Moki brinca, salen partículas y suena un tintineo (solo si el sonido está prendido).
   Crece con el nivel de juice que elige quien visita:
     Poquito  = chispas y tintineo de 2 notas
     Mucho    = más confeti y un aro
     Hardcore = lluvia de confeti, aro grande, temblor, "¡Bandera!" y fanfarria de 5 notas
   Nada / movimiento reducido = no pasa nada. Cada bandera festeja una sola vez por visita. */
(function () {
  var list = document.querySelector('.quest__flags');
  if (!list || !window.MutationObserver) return;
  var reached = -1, armed = false;

  function highest() {
    var n = -1;
    for (var i = 0; i < list.children.length; i++) if (list.children[i].classList.contains('is-planted')) n = i;
    return n;
  }

  function chime(hard) {
    var jz = window.JZ, a = jz && jz.audio && jz.audio();
    if (!a) return; // sonido apagado: el paquete no devuelve audio
    var notes = hard ? [523, 659, 784, 1047, 1319] : [659, 988], t0 = a.ctx.currentTime;
    notes.forEach(function (f, i) {
      var o = a.ctx.createOscillator(), g = a.ctx.createGain(), s = t0 + i * (hard ? 0.06 : 0.08);
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, s);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.5, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.18);
      o.connect(g); g.connect(a.out); o.start(s); o.stop(s + 0.2);
    });
  }

  // Fuente de confeti hacia ARRIBA: la barra vive pegada al fondo, así que todo sube y cae de regreso.
  var layer = null, css = getComputedStyle(document.documentElement);
  var cols = [css.getPropertyValue('--jz-c1').trim() || '#FF6B35', '#FFB347', css.getPropertyValue('--jz-c3').trim() || '#F4E8D5'];
  function fountain(x, y, n, big) {
    if (!layer) {
      layer = document.createElement('div');
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:59;overflow:hidden';
      document.body.appendChild(layer);
    }
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'), a = -Math.PI / 2 + (Math.random() - 0.5) * (big ? 1.9 : 1.3);
      var v = (big ? 150 : 90) + Math.random() * (big ? 150 : 80), dx = Math.cos(a) * v, up = Math.sin(a) * v;
      var w = 4 + Math.random() * (big ? 7 : 4);
      d.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w.toFixed(0) + 'px;height:' + (w * 0.7).toFixed(0) +
        'px;border-radius:2px;background:' + cols[i % 3];
      layer.appendChild(d);
      var an = d.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1, easing: 'cubic-bezier(.15,.75,.35,1)' },
        { transform: 'translate(' + (dx * 0.6).toFixed(0) + 'px,' + up.toFixed(0) + 'px) rotate(' + (Math.random() * 360 - 180).toFixed(0) + 'deg)', opacity: 1, offset: 0.45, easing: 'ease-in' },
        { transform: 'translate(' + (dx * 0.85).toFixed(0) + 'px,' + (up * 0.6).toFixed(0) + 'px) rotate(' + (Math.random() * 540 - 270).toFixed(0) + 'deg)', opacity: 1, offset: 0.75, easing: 'ease-in' },
        { transform: 'translate(' + dx.toFixed(0) + 'px,' + (up * 0.3).toFixed(0) + 'px) rotate(' + (Math.random() * 720 - 360).toFixed(0) + 'deg)', opacity: 0 }
      ], { duration: (big ? 950 : 750) + Math.random() * 300, easing: 'linear' });
      an.onfinish = (function (el) { return function () { el.remove(); }; })(d);
    }
  }

  function celebrate(li) {
    var jz = window.JZ, fx = window.JZH;
    if (!jz || jz.red() || jz.level === 'off') return;
    var lvl = jz.level, b = li.querySelector('button') || li, r = b.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    chime(lvl === 'hard');
    jz.hop(document.querySelector('.quest__moki'));
    if (b.animate) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.7,1.35)' }, { transform: 'scale(.9,1.1)' }, { transform: 'scale(1)' }],
      { duration: 380, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    fountain(x, y, lvl === 'hard' ? 36 : lvl === 'full' ? 20 : 12, lvl === 'hard');
    if (!fx || lvl === 'subtle') return;
    fx.ring(x, y, lvl === 'hard');
    if (lvl === 'hard') {
      fx.pop(x, y - 10, document.documentElement.lang === 'en' ? 'Flag!' : '¡Bandera!', true);
      fx.shake(1.5);
    }
  }

  new MutationObserver(function () {
    var h = highest();
    if (h > reached) {
      if (armed) celebrate(list.children[h]);
      reached = h;
    }
  }).observe(list, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // Al cargar (o al volver con la página ya scrolleada) no se festeja: solo lo que Moki alcanza caminando.
  setTimeout(function () { reached = Math.max(reached, highest()); armed = true; }, 1200);
})();
