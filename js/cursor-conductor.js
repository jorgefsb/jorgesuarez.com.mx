/* Conductor del cursor líquido 1.0.1: un solo dueño del cursor en la página.
   Sigue el nivel de Juice (data-jz-level): off = Nada, subtle = Poquito (puntos),
   full = Mucho (fluido 10 px), hard = Hardcore (fluido 18 px).
   ?cursor=off lo deja sin montar y la estela propia de Juice vuelve a verse. */
(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('cursor') === 'off') return;
  window.LiquidCursor.mount({ followJuice: true, obstacleSelector: '[data-liquid-obstacle]' });
  document.documentElement.setAttribute('data-liquid-cursor', 'on');
})();
