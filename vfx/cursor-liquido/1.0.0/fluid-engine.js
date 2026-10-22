/* Fluid cursor v3. Original site module, no Arcade assets or proprietary code.
 * Incompressible 2D fluid: advection, vorticity confinement, pressure projection.
 * Display normal/shading adapted from Pavel Dobryakov (2017), MIT.
 * Source: github.com/PavelDoGreat/WebGL-Fluid-Simulation; see PAVEL-LICENSE.txt.
 * Public API: new FluidCursor(canvas, options); instance.destroy(); instance.stats.
 * The native pointer and every page interaction remain untouched.
 */
(function (root) {
  'use strict';
  const MAX_WALLS = 12;
  const DEFAULTS = Object.freeze({
    radius: 13, force: 6000, curl: 3, dyeDecay: 3.5, velocityDecay: 2,
    pressureRetention: 0.1, pressureIterations: 20, opacity: 0.82, idleMs: 4500, touch: false,
    colourMode: 'arcade',
    playRadii: Object.freeze({ off: 0, subtle: 10, full: 18 }),
    obstacleSelector: '[data-theme="papel"], [data-fluid-obstacle], .hud, .quest, .vframe',
    // Saturated dye, not brand UI tokens. Jorge requested the multicolour effect.
    palette: ['#783dff', '#d82ce7', '#36b9ed', '#a9df42', '#ff913f']
  });
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function dimensions(width, height, shortSide, cap) {
    const ratio = clamp(width / Math.max(1, height), 1 / 3, 3);
    return ratio >= 1 ? [Math.min(cap, Math.round(shortSide * ratio)), shortSide]
      : [shortSide, Math.min(cap, Math.round(shortSide / ratio))];
  }
  function colourAt(seconds, palette) {
    const p = palette || DEFAULTS.palette;
    const phase = ((seconds / 1.65) % p.length + p.length) % p.length;
    const i = Math.floor(phase), t = phase - i;
    const rgb = hex => [1, 3, 5].map(n => parseInt(hex.slice(n, n + 2), 16) / 255);
    const a = rgb(p[i]), b = rgb(p[(i + 1) % p.length]);
    return a.map((v, k) => v + (b[k] - v) * t);
  }
  function saturatedHue(hue) {
    const k = [0, 4, 2].map(n => (n + hue * 6) % 6);
    return k.map(n => 1 - clamp(Math.min(n, 4 - n), 0, 1));
  }
  function rectangle(rect, width, height) {
    return [clamp(rect.left / width, 0, 1), clamp(1 - rect.bottom / height, 0, 1),
      clamp(rect.right / width, 0, 1), clamp(1 - rect.top / height, 0, 1)];
  }
  function inside(x, y, rects) {
    return rects.some(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]);
  }
  const normalizePlay = value => ['off', 'subtle', 'full'].includes(value) ? value : 'subtle';
  function roundedDistance(x, y, shape) {
    const b=shape.bounds, dx=x-(b[0]+b[2])*.5, dy=y-(b[1]+b[3])*.5;
    const r=shape.radii[dy<0 ? (dx<0?0:1) : (dx<0?3:2)];
    const qx=Math.abs(dx)-(b[2]-b[0])*.5+r, qy=Math.abs(dy)-(b[3]-b[1])*.5+r;
    return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;
  }
  function wallContact(x, y, shape) {
    const b=shape.bounds, dx=x-(b[0]+b[2])*.5, dy=y-(b[1]+b[3])*.5;
    const r=shape.radii[dy<0 ? (dx<0?0:1) : (dx<0?3:2)];
    const qx=Math.abs(dx)-(b[2]-b[0])*.5+r, qy=Math.abs(dy)-(b[3]-b[1])*.5+r;
    let nx=0,ny=0;
    if(qx>0 && qy>0){const l=Math.hypot(qx,qy);nx=qx/l*Math.sign(dx);ny=qy/l*Math.sign(dy);}
    else if(qx>qy)nx=dx<0?-1:1; else ny=dy<0?-1:1;
    const distance=roundedDistance(x,y,shape);
    return {distance, x:x-nx*distance, y:y-ny*distance, nx,ny};
  }
  function findImpact(s, shapes, width, height, reach) {
    const hits=[
      {distance:s.x,x:0,y:s.y,nx:1,ny:0},
      {distance:width-s.x,x:width,y:s.y,nx:-1,ny:0},
      {distance:s.y,x:s.x,y:0,nx:0,ny:1},
      {distance:height-s.y,x:s.x,y:height,nx:0,ny:-1}
    ];
    shapes.forEach((shape,index)=>{
      let hit=wallContact(s.x,s.y,shape);
      if(hit.distance<0){
        const px=s.x-s.dx,py=s.y-s.dy;
        if(roundedDistance(px,py,shape)<=0)return;
        let lo=0,hi=1;
        for(let i=0;i<14;i++){const t=(lo+hi)*.5;
          if(roundedDistance(px+s.dx*t,py+s.dy*t,shape)>0)lo=t;else hi=t;
        }
        hit=wallContact(px+s.dx*lo,py+s.dy*lo,shape);hit.distance=0;
      }
      hits.push(Object.assign(hit,{shape:index}));
    });
    return hits.filter(h=>h.distance>=0 && h.distance<=reach && s.dx*h.nx+s.dy*h.ny<-.05)
      .sort((a,b)=>a.distance-b.distance)[0] || null;
  }
  function cssRadii(el, bounds, style) {
    const w=bounds[2]-bounds[0],h=bounds[3]-bounds[1];
    const scale=Math.min(w/(el.offsetWidth||w),h/(el.offsetHeight||h));
    const values=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius']
      .map(key=>{const parts=style[key].split(/\s+/);return Math.max(0,Math.min(...[parts[0],parts[1]||parts[0]].map((v,i)=>v.endsWith('%')?parseFloat(v)*(i?h:w)/100:parseFloat(v)*scale)))||0;});
    const ratio=Math.min(1,w/Math.max(1,values[0]+values[1]),w/Math.max(1,values[2]+values[3]),h/Math.max(1,values[0]+values[3]),h/Math.max(1,values[1]+values[2]));
    return values.map(v=>v*ratio);
  }
  const VS = `#version 300 es
    in vec2 position;
    out vec2 uv;
    void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
  const COMMON = `#version 300 es
    precision highp float;
    precision highp sampler2D;
    in vec2 uv;
    out vec4 result;
    uniform vec2 texel;
    uniform int wallCount;
    uniform vec2 viewport;
    uniform sampler2D boundary;
    float solid(vec2 p){
      if(p.x<0. || p.y<0. || p.x>1. || p.y>1.) return 1.;
      return step(.5,texture(boundary,p).r);
    }
    vec2 L(){return uv-vec2(texel.x,0.);}
    vec2 R(){return uv+vec2(texel.x,0.);}
    vec2 B(){return uv-vec2(0.,texel.y);}
    vec2 T(){return uv+vec2(0.,texel.y);}
  `;
  const FS = {
    splat: `uniform sampler2D source;
      uniform vec2 point;
      uniform vec3 value;
      uniform float radius;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        vec2 d=(uv-point)*viewport;
        float g=exp(-dot(d,d)/(radius*radius));
        result=vec4(texture(source,uv).xyz+g*value,1.);
      }`,
    advect: `uniform sampler2D source, velocity;
      uniform float dt, decay;
      uniform vec2 velocityTexel;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        vec2 v=texture(velocity,uv).xy;
        vec2 p=uv-dt*v*velocityTexel;
        // Backtraces must not tunnel through a panel into dye on its other side.
        for(int i=1;i<=4;i++){
          if(solid(mix(uv,p,float(i)*.25))>0.) {p=uv;break;}
        }
        result=texture(source,clamp(p,vec2(0.),vec2(1.)))*exp(-decay*dt);
      }`,
    attenuate: `uniform sampler2D source; uniform float factor;
      void main(){result=texture(source,uv)*factor;}`,
    curl: `uniform sampler2D velocity;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        float c=.5*(texture(velocity,R()).y-texture(velocity,L()).y
          -texture(velocity,T()).x+texture(velocity,B()).x);
        result=vec4(c,0.,0.,1.);
      }`,
    vorticity: `uniform sampler2D velocity, rotation;
      uniform float dt, strength;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        float c=texture(rotation,uv).x;
        vec2 n=.5*vec2(abs(texture(rotation,T()).x)-abs(texture(rotation,B()).x),
          abs(texture(rotation,R()).x)-abs(texture(rotation,L()).x));
        n/=length(n)+.0001;
        vec2 v=texture(velocity,uv).xy+dt*strength*c*vec2(n.x,-n.y);
        result=vec4(clamp(v,vec2(-450.),vec2(450.)),0.,1.);
      }`,
    divergence: `uniform sampler2D velocity;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        vec2 c=texture(velocity,uv).xy;
        float l=mix(texture(velocity,L()).x,-c.x,solid(L()));
        float r=mix(texture(velocity,R()).x,-c.x,solid(R()));
        float b=mix(texture(velocity,B()).y,-c.y,solid(B()));
        float t=mix(texture(velocity,T()).y,-c.y,solid(T()));
        result=vec4(.5*(r-l+t-b),0.,0.,1.);
      }`,
    pressure: `uniform sampler2D source, divergence;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        float c=texture(source,uv).x;
        float l=mix(texture(source,L()).x,c,solid(L()));
        float r=mix(texture(source,R()).x,c,solid(R()));
        float b=mix(texture(source,B()).x,c,solid(B()));
        float t=mix(texture(source,T()).x,c,solid(T()));
        result=vec4((l+r+b+t-texture(divergence,uv).x)*.25,0.,0.,1.);
      }`,
    project: `uniform sampler2D source, pressure;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        float c=texture(pressure,uv).x;
        float l=mix(texture(pressure,L()).x,c,solid(L()));
        float r=mix(texture(pressure,R()).x,c,solid(R()));
        float b=mix(texture(pressure,B()).x,c,solid(B()));
        float t=mix(texture(pressure,T()).x,c,solid(T()));
        vec2 v=texture(source,uv).xy-.5*vec2(r-l,t-b);
        if(solid(mix(uv,L(),.5))+solid(mix(uv,R(),.5))>0.) v.x=0.;
        if(solid(mix(uv,T(),.5))+solid(mix(uv,B(),.5))>0.) v.y=0.;
        result=vec4(v,0.,1.);
      }`,
    display: `uniform sampler2D source;
      uniform vec2 dyeTexel;
      uniform float opacity;
      void main(){
        if(solid(uv)>0.){result=vec4(0.);return;}
        vec3 dye=texture(source,uv).rgb;
        float peak=max(dye.r,max(dye.g,dye.b));
        // Tone mapping preserves saturated hues rather than clipping to white.
        vec3 colour=dye/max(peak,.001);
        float dx=length(texture(source,uv+vec2(dyeTexel.x,0.)).rgb)
          -length(texture(source,uv-vec2(dyeTexel.x,0.)).rgb);
        float dy=length(texture(source,uv+vec2(0.,dyeTexel.y)).rgb)
          -length(texture(source,uv-vec2(0.,dyeTexel.y)).rgb);
        vec3 normal=normalize(vec3(dx,dy,length(dyeTexel)));
        colour*=clamp(normal.z+.7,.7,1.);
        float alpha=(1.-exp(-peak*5.5))*opacity;
        // Continuous dye at the native pointer tip. No circular cutout or dark marker.
        result=vec4(colour,alpha);
      }`
  };

  class FluidCursor {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.options = Object.assign({}, DEFAULTS, options);
      this.stats = { state: 'waiting', frames: 0, splats: 0, impacts: 0, wallCount: 0, error: null };
      this.listeners = []; this.resources = []; this.programs = {};
      this.pointer = null; this.pending = null; this.raf = 0; this.destroyed = false;
      this.rects = []; this.shapes = []; this.maskSignature='';
      this.media = root.matchMedia('(prefers-reduced-motion: reduce)');
      this.coarse = root.matchMedia('(pointer: coarse)').matches;
      this.lowPower=this.coarse || !!root.navigator?.connection?.saveData || (root.navigator?.hardwareConcurrency>0 && root.navigator.hardwareConcurrency<=4);
      this.stats.quality=this.lowPower?'economy':'normal';this.slowFrames=0;
      this.canvas.dataset.fluid = 'v3';
      if (this.media.matches || new URLSearchParams(root.location.search).get('fluid') === 'off') {
        this.stats.state = 'disabled'; return;
      }
      const doc=document.documentElement;
      const syncPlay=()=>this.setPlay(doc.getAttribute('data-jz-level') || doc.getAttribute('data-fluid-play') || 'subtle');
      this.setPlay(options && options.play || doc.getAttribute('data-jz-level') || doc.getAttribute('data-fluid-play') || 'subtle');
      this.playObserver=new MutationObserver(syncPlay);
      this.playObserver.observe(doc,{attributes:true,attributeFilter:['data-jz-level','data-fluid-play']});
      this.listeners.push(()=>this.playObserver.disconnect());
      this.listen(root, 'pointermove', e => this.input(e), { passive: true });
      this.listen(root, 'pointerdown', e => this.input(e), { passive: true });
      this.listen(root, 'pointerup', e => { if (e.pointerType === 'touch') this.pointer = null; }, { passive: true });
      this.listen(root, 'pointercancel', () => { this.pointer = null; this.pending = null; }, { passive: true });
      this.listen(document.documentElement, 'pointerleave', () => { this.pointer = null; this.pending = null; }, { passive: true });
      this.listen(root, 'resize', () => { if (this.gl && !this.lost) this.resize(); this.pointer = null; }, { passive: true });
      this.listen(root,'scroll',()=>{this.pending=null;this.pointer=null;if(this.raf)this.stop(true);},{passive:true});
      this.listen(document, 'visibilitychange', () => { if (document.hidden) this.stop(true); });
      this.listen(canvas, 'webglcontextlost', e => {
        e.preventDefault(); this.lost = true; this.stop(false); this.stats.state = 'context-lost';
      });
      this.listen(canvas, 'webglcontextrestored', () => {
        if (this.destroyed) return;
        this.resources = []; this.programs = {}; this.gl = null; this.lost = false;
        this.pointer = null; this.pending = null; this.stats.state = 'waiting';
      });
      this.listen(this.media, 'change', () => {
        this.pointer = null; this.pending = null;
        if (this.media.matches) { this.stop(true); this.stats.state = 'disabled'; }
        else this.stats.state = this.play==='off'?'disabled-play':'waiting';
      });
    }
    setPlay(value) {
      this.play=normalizePlay(value);
      const radii=Object.assign({},DEFAULTS.playRadii,this.options.playRadii);
      this.options.radius=clamp(Number(radii[this.play])||0,0,40);
      this.stats.play=this.play;this.stats.radius=this.options.radius;
      this.pending=null;this.pointer=null;
      if(this.play==='off'){this.stop(true);this.stats.state='disabled-play';}
      else if(this.performancePaused)this.stats.state='budget-paused';
      else if(this.stats.state==='disabled-play')this.stats.state=this.gl?'idle':'waiting';
      return this;
    }
    listen(target, event, fn, options) {
      target.addEventListener(event, fn, options);
      this.listeners.push(() => target.removeEventListener(event, fn, options));
    }
    boot() {
      if (this.gl) return true;
      try {
        const gl = this.canvas.getContext('webgl2', {
          alpha: true, premultipliedAlpha: false, depth: false, stencil: false,
          antialias: false, preserveDrawingBuffer: false, powerPreference: 'low-power'
        });
        if (!gl || !gl.getExtension('EXT_color_buffer_float')) throw new Error('Floating-point WebGL2 unavailable');
        this.gl = gl;
        const compile = (type, source) => {
          const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message);
          }
          return shader;
        };
        const vertex = compile(gl.VERTEX_SHADER, VS);
        this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
        this.buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
        for (const [name, source] of Object.entries(FS)) {
          const fragment = compile(gl.FRAGMENT_SHADER, COMMON + source);
          const program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment);
          gl.bindAttribLocation(program, 0, 'position'); gl.linkProgram(program); gl.deleteShader(fragment);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
          const uniforms = {};
          for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
            const n = gl.getActiveUniform(program, i).name;
            uniforms[n.replace('[0]', '')] = gl.getUniformLocation(program, n);
          }
          this.programs[name] = { program, uniforms };
        }
        gl.deleteShader(vertex);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.disable(gl.BLEND); this.maskTexture=gl.createTexture();this.resize();this.stats.state='ready';return true;
      } catch (error) {
        this.stats.error = error.message; this.stats.state = 'unsupported'; this.destroyGPU(); return false;
      }
    }
    fbo(width, height, linear) {
      const gl = this.gl, texture = gl.createTexture(), framebuffer = gl.createFramebuffer();
      // Track before allocation/validation so partial failures are also reversible.
      const resource = { texture, framebuffer, width, height }; this.resources.push(resource);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete float framebuffer');
      gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return resource;
    }
    pair(width, height, linear) {
      const pair = { read: this.fbo(width, height, linear), write: this.fbo(width, height, linear) };
      pair.swap = () => { [pair.read, pair.write] = [pair.write, pair.read]; }; return pair;
    }
    releaseFields() {
      const gl = this.gl;
      for (const r of this.resources) { gl.deleteTexture(r.texture); gl.deleteFramebuffer(r.framebuffer); }
      this.resources = [];
    }
    resize() {
      const gl = this.gl;
      this.width = Math.max(1, root.innerWidth); this.height = Math.max(1, root.innerHeight);
      const dpr=Math.min(root.devicePixelRatio||1,this.lowPower||this.qualityReduced?1:1.25,
        Math.sqrt((this.qualityReduced?500000:this.lowPower?900000:1800000)/(this.width*this.height)));
      this.canvas.width = Math.round(this.width * dpr); this.canvas.height = Math.round(this.height * dpr);
      this.releaseFields();
      const [w,h]=dimensions(this.width,this.height,this.qualityReduced?64:this.lowPower?80:128,384);
      const [dw,dh]=dimensions(this.width,this.height,this.qualityReduced?192:this.lowPower?256:512,1024);
      this.velocity = this.pair(w, h, true); this.dye = this.pair(dw, dh, true);
      this.pressure = this.pair(w, h, false); this.divergence = this.fbo(w, h, false); this.rotation = this.fbo(w, h, false);
      this.sim=[w,h];this.rects=[];this.shapes=[];this.pointer=null;this.pending=null;this.maskSignature='';this.updateMask();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      this.lastTime = 0;
    }
    updateMask() {
      // Cached geometry: one cheap texture sample in shaders, not 12 rounded
      // distance calculations repeated across every pressure iteration.
      const signature=[this.canvas.width,this.canvas.height,...this.shapes.flatMap(s=>[...s.bounds,...s.radii])].join(',');
      if(signature===this.maskSignature)return;
      this.maskSignature=signature;
      const c=this.maskCanvas || (this.maskCanvas=document.createElement('canvas'));
      if(c.width!==this.canvas.width||c.height!==this.canvas.height){c.width=this.canvas.width;c.height=this.canvas.height;}
      const ctx=c.getContext('2d',{alpha:false});ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
      ctx.setTransform(c.width/this.width,0,0,c.height/this.height,0,0);ctx.fillStyle='#fff';
      for(const shape of this.shapes){const [l,t,r,b]=shape.bounds,[tl,tr,br,bl]=shape.radii;
        ctx.beginPath();ctx.moveTo(l+tl,t);ctx.lineTo(r-tr,t);ctx.arcTo(r,t,r,t+tr,tr);
        ctx.lineTo(r,b-br);ctx.arcTo(r,b,r-br,b,br);ctx.lineTo(l+bl,b);ctx.arcTo(l,b,l,b-bl,bl);
        ctx.lineTo(l,t+tl);ctx.arcTo(l,t,l+tl,t,tl);ctx.closePath();ctx.fill();
      }
      const gl=this.gl;gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
      this.stats.maskUploads=(this.stats.maskUploads||0)+1;
    }
    collectWalls() {
      const rects = [], shapes=[];
      for (const el of document.querySelectorAll(this.options.obstacleSelector)) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.right <= 0 || r.bottom <= 0 || r.left >= this.width || r.top >= this.height) continue;
        const style = root.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        const bounds=[r.left,r.top,r.right,r.bottom];
        const wall=[r.left/this.width,1-r.bottom/this.height,r.right/this.width,1-r.top/this.height];
        if (wall[2] > wall[0] && wall[3] > wall[1]) {
          rects.push(wall);shapes.push({bounds,radii:cssRadii(el,bounds,style)});
        }
        if (rects.length === MAX_WALLS) break;
      }
      this.rects=rects;this.shapes=shapes;this.stats.wallCount=rects.length;this.updateMask();
    }
    input(e) {
      if(this.destroyed||this.lost||this.performancePaused||this.play==='off'||this.media.matches||this.stats.state==='unsupported'||this.stats.state==='failed')return;
      if (e.pointerType === 'touch' && !this.options.touch) return;
      if (e.isPrimary === false) return;
      // Do not emit light over controls, text fields, open menus or embedded media.
      if (e.target && e.target.closest && e.target.closest('a,button,input,select,textarea,[contenteditable],iframe,.jz-panel')) {
        this.pointer = { x: e.clientX, y: e.clientY, time: performance.now(), blocked: true };
        this.pending = null; return;
      }
      if (!this.boot()) return;
      const now = performance.now(), next = { x: e.clientX, y: e.clientY, time: now };
      if (this.pointer && !this.pointer.blocked && now - this.pointer.time < 1000) {
        const dx = next.x - this.pointer.x, dy = next.y - this.pointer.y;
        // Drop discontinuities, never draw a beam from (0,0) or across a new section.
        if (Math.hypot(dx, dy) < Math.max(this.width, this.height) * .4 && Math.hypot(dx, dy) > .3) {
          const p = this.pending;
          this.pending = { x: next.x, y: next.y,
            dx: clamp(dx + (p ? p.dx : 0), -80, 80), dy: clamp(dy + (p ? p.dy : 0), -80, 80) };
        }
      }
      this.pointer = next; this.lastInput = now;
      if (!this.raf) { this.lastTime = 0; this.raf = root.requestAnimationFrame(t => this.frame(t)); }
    }
    pass(name, target, textures, uniforms) {
      const gl = this.gl, p = this.programs[name], u = p.uniforms;
      gl.useProgram(p.program); gl.bindVertexArray(this.vao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.width : this.canvas.width, target ? target.height : this.canvas.height);
      gl.uniform2f(u.texel, 1 / this.sim[0], 1 / this.sim[1]);
      gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
      gl.uniform1i(u.boundary,3);gl.uniform2f(u.viewport,this.width,this.height);
      gl.uniform2f(u.dyeTexel, 1 / this.dye.read.width, 1 / this.dye.read.height);
      let slot = 0;
      for (const [key, field] of Object.entries(textures || {})) {
        gl.activeTexture(gl.TEXTURE0 + slot); gl.bindTexture(gl.TEXTURE_2D, field.texture); gl.uniform1i(u[key], slot++);
      }
      for (const [key, value] of Object.entries(uniforms || {})) {
        if (Array.isArray(value)) gl['uniform' + value.length + 'fv'](u[key], value);
        else gl.uniform1f(u[key], value);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    emit(x, y, dx, dy, colour, amount, radius) {
      const point = [x / this.width, 1 - y / this.height];
      if (this.shapes.some(shape=>roundedDistance(x,y,shape)<=0)) return;
      const common = { point, viewport: [this.width, this.height], radius: radius || this.options.radius };
      this.pass('splat', this.velocity.write, { source: this.velocity.read },
        Object.assign({}, common, { value: [clamp(dx / Math.max(this.width,this.height) * this.options.force, -360, 360), clamp(-dy / Math.max(this.width,this.height) * this.options.force, -360, 360), 0] }));
      this.velocity.swap();
      this.pass('splat', this.dye.write, { source: this.dye.read },
        Object.assign({}, common, { value: colour.map(c => c * amount) })); this.dye.swap(); this.stats.splats++;
    }
    inject(s, time) {
      if (!this.lastColourTime || time-this.lastColourTime>=100) {
        this.arcadeColour=saturatedHue(Math.random()); this.lastColourTime=time;
      }
      const colour = this.options.colourMode==='arcade' ? this.arcadeColour : colourAt(time / 1000, this.options.palette);
      // Frame-bounded deposition prevents event-rate-dependent white accumulation.
      const speed = Math.hypot(s.dx, s.dy), amount = clamp(speed / 45, .08, .38);
      this.emit(s.x, s.y, s.dx, s.dy, colour, amount);
      // Contact uses the same visible rounded outline as GPU masking.
      // No 26px anticipatory box and no 4px displaced collision plane.
      if (time - (this.lastImpact || 0) < 110 || speed < 5) return;
      const hit=findImpact(s,this.shapes,this.width,this.height,Math.min(2,this.options.radius*.2));
      if(!hit)return;
      const kick=clamp(speed*.7,6,22), spread=this.options.radius*.6;
      for(const sign of [-1,1]){
        const sx=clamp(hit.x+hit.nx*.35+hit.ny*spread*sign,.35,this.width-.35);
        const sy=clamp(hit.y+hit.ny*.35-hit.nx*spread*sign,.35,this.height-.35);
        this.emit(sx,sy,hit.nx*kick*.3+hit.ny*kick*sign,
          hit.ny*kick*.3-hit.nx*kick*sign,colour,amount*.6,this.options.radius*.8);
      }
      this.lastImpact=time;this.stats.impacts++;
      this.stats.lastContact={x:hit.x,y:hit.y,nx:hit.nx,ny:hit.ny,shape:hit.shape ?? 'viewport'};
    }
    watchBudget(ms) {
      // Observe delivery cadence, never block the GPU to measure it in production.
      this.slowFrames=ms>(this.qualityReduced?65:45)?this.slowFrames+1:Math.max(0,this.slowFrames-1);
      if(this.slowFrames<(this.qualityReduced?24:12))return true;
      this.slowFrames=0;
      if(!this.qualityReduced){this.qualityReduced=true;this.stats.quality='reduced';if(this.gl)this.resize();return true;}
      this.performancePaused=true;this.stop(true);this.destroyGPU();this.stats.state='budget-paused';return false;
    }
    frame(time) {
      this.raf = 0;
      if (this.destroyed || this.lost || this.performancePaused || document.hidden || this.media.matches) { this.stop(true); return; }
      if (time - this.lastInput > this.options.idleMs) { this.stop(true); return; }
      if(this.lastTime && time-this.lastTime<1000/(this.lowPower||this.qualityReduced?30:60)-.8){
        this.raf = root.requestAnimationFrame(t => this.frame(t)); return;
      }
      try {
        if(this.lastTime && !this.watchBudget(time-this.lastTime))return;
        this.collectWalls();
        const dt = this.lastTime ? clamp((time-this.lastTime)/1000, .001, 1/30) : 1/60; this.lastTime=time;
        if (this.pending) { this.inject(this.pending, time); this.pending = null; }
        const v = this.velocity, p = this.pressure, d = this.dye;
        this.pass('curl', this.rotation, { velocity: v.read });
        this.pass('vorticity', v.write, { velocity: v.read, rotation: this.rotation }, { dt, strength: this.options.curl }); v.swap();
        this.pass('divergence', this.divergence, { velocity: v.read });
        this.pass('attenuate', p.write, { source: p.read }, { factor: this.options.pressureRetention }); p.swap();
        for(let i=0;i<(this.qualityReduced?12:this.options.pressureIterations);i++){
          this.pass('pressure', p.write, { source: p.read, divergence: this.divergence }); p.swap();
        }
        this.pass('project', v.write, { source: v.read, pressure: p.read }); v.swap();
        const velocityTexel = [1/this.sim[0], 1/this.sim[1]];
        this.pass('advect', v.write, { source: v.read, velocity: v.read }, { dt, decay: this.options.velocityDecay, velocityTexel }); v.swap();
        this.pass('advect', d.write, { source: d.read, velocity: v.read }, { dt, decay: this.options.dyeDecay, velocityTexel }); d.swap();
        const pointer=this.pointer ? [this.pointer.x/this.width,1-this.pointer.y/this.height] : [-1,-1];
        this.pass('display', null, { source: d.read }, { pointer, pointerVisible: this.pointer ? 1 : 0,
          viewport: [this.width,this.height], opacity: this.options.opacity });
        this.stats.frames++; this.stats.state='running';
        this.raf = root.requestAnimationFrame(t => this.frame(t));
      } catch (error) { this.stats.error=error.message; this.stats.state='failed'; this.stop(true); this.destroyGPU(); }
    }
    stop(clear) {
      if (this.raf) root.cancelAnimationFrame(this.raf); this.raf=0; this.pending=null; this.lastTime=0;
      if (this.gl && !this.lost && clear) {
        const gl=this.gl; gl.clearColor(0,0,0,0);
        for (const field of this.resources) { gl.bindFramebuffer(gl.FRAMEBUFFER,field.framebuffer); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (this.stats.state==='running') this.stats.state='idle';
    }
    destroyGPU() {
      if (!this.gl) return;
      this.releaseFields();
      for (const p of Object.values(this.programs)) this.gl.deleteProgram(p.program);
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      if(this.maskTexture)this.gl.deleteTexture(this.maskTexture);this.maskTexture=null;
      if(this.maskCanvas){this.maskCanvas.width=1;this.maskCanvas.height=1;this.maskCanvas=null;}
      this.maskSignature='';this.programs={};this.gl=null;
    }
    destroy() {
      this.stop(true); this.destroyGPU(); this.listeners.forEach(fn=>fn()); this.listeners=[];
      this.destroyed=true; this.stats.state='destroyed';
    }
  }
  FluidCursor.defaults=DEFAULTS;
  FluidCursor.math={ dimensions, colourAt, saturatedHue, rectangle, inside, normalizePlay, roundedDistance, wallContact, findImpact };
  root.FluidCursor=FluidCursor;
  if (typeof module !== 'undefined' && module.exports) module.exports=FluidCursor;
  if (typeof document !== 'undefined') {
    const mount=()=>{
      const canvas=document.getElementById('fluid-canvas');
      if (!canvas || root.fluidCursor) return;
      // Touch stays off until Jorge selects that behaviour. Fine pointers work at any width.
      root.fluidCursor=new FluidCursor(canvas);
    };
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
    else mount();
  }
})(typeof window !== 'undefined' ? window : globalThis);
