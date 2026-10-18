(() => {
  'use strict';
  const kit = window.BRAND_KIT;
  const labels = {approved:'Aprobado',inherited:'Heredado',proposed:'Propuesto',pending:'Pendiente'};
  const grid = document.getElementById('color-grid');
  const feedback = document.getElementById('feedback');
  let feedbackTimer;
  function announce(message) {
    feedback.textContent = message;
    feedback.classList.add('visible');
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => feedback.classList.remove('visible'), 4500);
  }
  async function copy(value, label) {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      announce(label + ' copiado');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly','');
      area.setAttribute('aria-label','Contenido para copiar');
      area.style.cssText = 'position:fixed;left:12px;top:12px;width:1px;height:1px;opacity:0';
      document.body.append(area); area.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      area.remove();
      if (copied) announce(label + ' copiado');
      else window.prompt('Copia este contenido con el teclado:',value);
    }
  }
  kit.colors.forEach(color => {
    const item = document.createElement('article'); item.className = 'color';
    const swatch = document.createElement('div'); swatch.className = 'swatch'; swatch.style.backgroundColor = color.hex; swatch.setAttribute('aria-hidden','true');
    const row = document.createElement('div'); row.className = 'colorhead';
    const title = document.createElement('h3'); title.textContent = color.name;
    const state = document.createElement('span'); state.className = 'status ' + color.status; state.textContent = labels[color.status];
    row.append(title,state);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copycolor'; button.textContent = color.hex + ' ⧉'; button.setAttribute('aria-label','Copiar color ' + color.name + ' ' + color.hex); button.addEventListener('click',() => copy(color.hex,color.name));
    item.append(swatch,row,button); grid.append(item);
  });
  document.getElementById('copy-tokens').addEventListener('click',() => {
    const value = JSON.stringify({status:'provisional',updated:kit.updated,description:'Base heredada v3 y extensión propuesta. No es un design system final.',colors:Object.fromEntries(kit.colors.map(c => [c.token,{value:c.hex,status:c.status}])),designSystem:kit.designSystem},null,2);
    copy(value,'Tokens con sus estados');
  });
})();

(() => {
  const action = document.getElementById('ds-action');
  const result = document.getElementById('ds-action-result');
  const chip = document.getElementById('ds-chip');
  if (action && result) action.addEventListener('click', () => {
    result.textContent = 'Acción de ejemplo completada. No se guardó ni envió información.';
  });
  if (chip) chip.addEventListener('click', () => {
    const selected = chip.getAttribute('aria-pressed') !== 'true';
    chip.setAttribute('aria-pressed', String(selected));
    chip.textContent = selected ? 'Ejemplo seleccionado' : 'Seleccionar ejemplo';
  });
})();
