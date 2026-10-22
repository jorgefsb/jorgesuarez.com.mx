/* Conductor del cursor líquido 1.0.1: un solo dueño del cursor en la página.
   Sigue el nivel de Juice (data-jz-level): off = Nada, subtle = Poquito (puntos),
   full = Mucho (fluido 10 px), hard = Hardcore (fluido 18 px).
   ?cursor=off lo deja sin montar y la estela propia de Juice vuelve a verse. */
(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('cursor') === 'off') return;
  // The released profile validates core, Juega, Hardcore, Moki and all artwork
  // before the Game Feel adapter becomes the sole cursor owner.
  window.papacitoReady = window.PapacitoJuice.mount({
    page: 'home', obstacleSelector: '[data-liquid-obstacle]'
  });
  // Keep the rejection observable to callers without an unhandled rejection.
  window.papacitoReady.catch(function (error) {
    console.error('Papacito Juice no pudo iniciar:', error);
  });
})();
