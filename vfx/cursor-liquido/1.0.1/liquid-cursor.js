/* Cursor líquido 1.0.1. MIT, (c) 2026 Jorge Suárez. Zero runtime dependencies.
 * Intensities: nada (off), poquito (orange dots, 2D canvas), mucho (fluid
 * 10 px), hardcore (fluid 18 px). Juice contract on <html data-jz-level>:
 * off=nada, subtle=poquito, full=mucho, hard=hardcore.
 * Usage: LiquidCursor.mount({ intensity: 'poquito' }) or
 * LiquidCursor.mount({ followJuice: true }). Load fluid-engine.js first for
 * mucho/hardcore. Poquito never creates a WebGL context.
 */
(function (root) {
  'use strict';
  const INTENSITIES = Object.freeze({
    nada: Object.freeze({ layer: 'off', radius: 0 }),
    poquito: Object.freeze({ layer: 'dots', radius: 0 }),
    mucho: Object.freeze({ layer: 'fluid', radius: 10 }),
    hardcore: Object.freeze({ layer: 'fluid', radius: 18 })
  });
  const JZ_LEVELS = Object.freeze({ off: 'nada', subtle: 'poquito', full: 'mucho', hard: 'hardcore' });
  const SOURCE_ATTRIBUTE = 'data-liquid-intensity';
  const DOTS = Object.freeze({ max: 48, spacing: 7, minSize: 2, maxSize: 4, life: 420, perEvent: 3 });
  const INTERACTIVE = 'a,button,input,select,textarea,label,[contenteditable],iframe,.jz-panel';

  function normalize(value) {
    const key = String(value == null ? '' : value).trim().toLowerCase();
    if (INTENSITIES[key]) return key;
    if (JZ_LEVELS[key]) return JZ_LEVELS[key];
    return null;
  }

  // Original 2D preset: short-lived dots tied to pointer travel. Normal
  // compositing, no shadow or glow, bounded count, RAF only while dots live.
  // Adapted only at the enable/disable boundary from the existing Juice
  // trail: 7px circle, <=1/38ms, 480ms, drop 14px, scale .2, <=29 alive.
  class DotTrail {
    constructor(canvas, options) {
      this.canvas=canvas; this.canvas.style.display='none'; this.options=options;
      this.enabled=false; this.raf=0; this.dots=[]; this.lastSpawn=-Infinity;this.listeners=[];
      this.stats={state:'off',alive:0,spawned:0,frames:0,max:29};
      this.media=root.matchMedia('(prefers-reduced-motion: reduce)');
      this.host=document.createElement('div');this.host.className='liquid-original-dots';
      this.host.setAttribute('aria-hidden','true');
      this.host.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden';
      canvas.parentNode.appendChild(this.host);
      const on=(t,n,f,o)=>{t.addEventListener(n,f,o);this.listeners.push(()=>t.removeEventListener(n,f,o));};
      on(root,'pointermove',e=>this.input(e),{passive:true});
      on(document,'visibilitychange',()=>{if(document.hidden)this.clear();});
      on(document,'scroll',()=>this.clear(),{passive:true,capture:true});
      on(this.media,'change',()=>this.clear());
      on(root,'pointercancel',()=>this.clear(),{passive:true});
    }
    state(){return !this.enabled?'off':this.media.matches?'disabled':this.dots.length?'running':'idle';}
    setEnabled(value){this.enabled=!!value;if(!value)this.clear();this.stats.state=this.state();}
    input(e){
      if(!this.enabled||this.media.matches||document.hidden||e.isPrimary===false)return;
      if(e.pointerType==='touch'&&!this.options.touch)return;
      const now=performance.now();if(now-this.lastSpawn<38||this.dots.length>28)return;
      this.lastSpawn=now;
      const dot=document.createElement('i');dot.className='liquid-original-dot';
      // The original palette is kept for this personal-brand reference.
      const colours=[this.options.color,'#22211F','#F4E8D5'];
      dot.style.cssText='position:absolute;display:block;width:7px;height:7px;border-radius:50%;pointer-events:none;left:'+e.clientX+'px;top:'+e.clientY+'px;background:'+colours[(now/38|0)%3];
      this.host.appendChild(dot);
      const animation=dot.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.85},{transform:'translate(-50%,-50%) translateY(14px) scale(.2)',opacity:0}],{duration:480,easing:'ease-out'});
      const record={dot,animation};this.dots.push(record);this.stats.spawned++;this.stats.alive=this.dots.length;this.stats.state='running';
      animation.onfinish=()=>{dot.remove();this.dots=this.dots.filter(x=>x!==record);this.stats.alive=this.dots.length;this.stats.state=this.state();};
    }
    clear(){for(const {dot,animation} of this.dots){animation.onfinish=null;animation.cancel();dot.remove();}this.dots=[];this.stats.alive=0;this.lastSpawn=-Infinity;this.stats.state=this.state();}
    destroy(){this.enabled=false;this.clear();this.listeners.forEach(f=>f());this.listeners=[];this.host.remove();this.stats.state='destroyed';}
  }

  function layer(kind, container) {
    const c = document.createElement('canvas');
    c.className = 'liquid-cursor-layer';
    c.setAttribute('aria-hidden', 'true');
    c.dataset.liquidLayer = kind;
    // Safety inline: the layer must never take clicks or join layout, even
    // if liquid-cursor.css is missing.
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none';
    container.appendChild(c);
    return c;
  }

  class Instance {
    constructor(options) {
      const doc = document.documentElement;
      this.options = Object.assign({ followJuice: false, touch: false, obstacleSelector: '[data-liquid-obstacle]', container: document.body }, options);
      const css = root.getComputedStyle(doc).getPropertyValue('--liquid-cursor-color').trim();
      this.color = this.options.color || css || '#FF6B35';
      if (this.options.followJuice) this.source = 'data-jz-level';
      else if (this.options.intensity != null) this.source = 'option';
      else if (doc.hasAttribute(SOURCE_ATTRIBUTE)) this.source = SOURCE_ATTRIBUTE;
      else throw new Error('LiquidCursor.mount: pass intensity (nada|poquito|mucho|hardcore), followJuice:true or <html ' + SOURCE_ATTRIBUTE + '>');
      if (this.source === 'option' && !normalize(this.options.intensity)) throw new Error('LiquidCursor.mount: unknown intensity ' + this.options.intensity);
      this.dotCanvas = layer('dots', this.options.container);
      this.fluidCanvas = layer('fluid', this.options.container);
      this.dots = new DotTrail(this.dotCanvas, { color: this.color, touch: !!this.options.touch });
      this.engine = null; this.intensity = 'nada';
      this.motion = root.matchMedia('(prefers-reduced-motion: reduce)');
      this.motionListener = () => {
        if (this.engine) { this.engine.destroy(); this.engine = null; }
        this.apply(this.intensity);
      };
      this.motion.addEventListener('change', this.motionListener);
      if (this.source === 'option') this.setIntensity(this.options.intensity);
      else {
        // Read only. The attribute belongs to Juice or the page, never written here.
        const attr = this.source, sync = () => {
          const value = doc.getAttribute(attr), name = normalize(value);
          this.pendingSource = name == null;
          this.apply(name || (this.options.intensity != null && normalize(this.options.intensity)) || 'nada');
        };
        this.observer = new MutationObserver(sync);
        this.observer.observe(doc, { attributes: true, attributeFilter: [attr] });
        sync();
      }
    }
    setIntensity(value) {
      const name = normalize(value);
      if (!name) throw new Error('LiquidCursor.setIntensity: unknown intensity ' + value);
      return this.apply(name);
    }
    apply(name) {
      if (this.destroyed) return this;
      const spec = INTENSITIES[name];
      this.intensity = name;
      this.dots.setEnabled(spec.layer === 'dots');
      if (spec.layer === 'fluid' && !this.motion.matches) {
        const Engine = root.FluidEngine;
        if (!this.engine && Engine) {
          this.engine = new Engine(this.fluidCanvas, { radius: spec.radius, touch: !!this.options.touch,
            obstacleSelector: this.options.obstacleSelector, observePlay: false });
        }
        if (this.engine) this.engine.setRadius(spec.radius);
      } else if (this.engine) this.engine.setRadius(0);
      return this;
    }
    stop() { this.dots.clear(); if (this.engine) this.engine.stop(true); return this; }
    get stats() {
      const spec = INTENSITIES[this.intensity];
      return { intensity: this.intensity, layer: spec.layer, radius: spec.radius, source: this.source,
        sourcePending: !!this.pendingSource, color: this.color, touch: !!this.options.touch,
        dots: Object.assign({}, this.dots.stats),
        fluid: this.engine ? Object.assign({}, this.engine.stats) : { state: root.FluidEngine ? 'not-created' : 'engine-missing' } };
    }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      if (this.observer) this.observer.disconnect();
      this.motion.removeEventListener('change', this.motionListener);
      this.dots.destroy();
      if (this.engine) this.engine.destroy();
      this.dotCanvas.remove(); this.fluidCanvas.remove();
      if (LiquidCursor.current === this) LiquidCursor.current = null;
    }
  }

  const LiquidCursor = {
    version: '1.0.1',
    intensities: INTENSITIES,
    juiceLevels: JZ_LEVELS,
    normalize,
    current: null,
    // One live instance per page: mounting again replaces the previous one
    // so canvases and listeners never duplicate.
    mount(options) {
      if (LiquidCursor.current) LiquidCursor.current.destroy();
      LiquidCursor.current = new Instance(options || {});
      return LiquidCursor.current;
    },
    DotTrail
  };
  root.LiquidCursor = LiquidCursor;
  if (typeof module !== 'undefined' && module.exports) module.exports = LiquidCursor;
})(typeof window !== 'undefined' ? window : globalThis);
