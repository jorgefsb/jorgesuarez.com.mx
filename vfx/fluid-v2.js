/* 
 * FLUID SIMULATION V2 - "Neon Liquid Smoke" 
 * Senior Creative Technologist Implementation
 * Developed for JorgeSuarez.com.mx
 */

'use strict';

const FluidSimulation = (() => {
    // Configuration & Physics Constants
    const CONFIG = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 0.96, // Faster decay for a clean look
        VELOCITY_DISSIPATION: 0.98,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30, // Viscosity/vorticity effect
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLOR_SPEED: 0.002, // Velocity of the RGB cycle
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0, a: 0 },
        TRANSPARENT: true
    };

    let canvas, gl, ext;
    let pointers = [];
    let splatStack = [];

    // Shader Source Code (GLSL)
    const SHADERS = {
        vertex: `
            precision highp float;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;
            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `,
        splat: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `,
        advect: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
                float decay = 1.0 + dissipation * dt;
                gl_FragColor = result / decay;
            }
        `,
        divergence: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;
                vec2 C = texture2D(uVelocity, vUv).xy;
                if (vL.x < 0.0) { L = -C.x; }
                if (vR.x > 1.0) { R = -C.x; }
                if (vT.y > 1.0) { T = -C.y; }
                if (vB.y < 0.0) { B = -C.y; }
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `,
        pressure: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                float C = texture2D(uPressure, vUv).x;
                float divergence = texture2D(uDivergence, vUv).x;
                float pressure = (L + R + B + T - divergence) * 0.25;
                gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
            }
        `,
        gradientSubtract: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity.x -= 0.5 * (R - L);
                velocity.y -= 0.5 * (T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `,
        display: `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTexture;
            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a);
            }
        `
    };

    function init(canvasElement) {
        // 1. Mobile & Resize Safety Check
        if (window.innerWidth < 768 || 'ontouchstart' in window) {
            console.log("Fluid Simulation V2: Mobile detection. Effect disabled for performance.");
            return;
        }

        canvas = canvasElement;
        const { gl: ctx, ext: extensions } = getWebGLContext(canvas);
        gl = ctx;
        ext = extensions;

        applyStyles();
        setupEvents();
        initFramebuffers();
        requestAnimationFrame(update);
    }

    function applyStyles() {
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '9999';
        canvas.style.pointerEvents = 'none';

        resize();
    }

    function getWebGLContext(canvas) {
        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        let gl = canvas.getContext('webgl2', params);
        const isWebGL2 = !!gl;
        if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

        let halfFloat = isWebGL2 ? gl.HALF_FLOAT : gl.getExtension('OES_texture_half_float').HALF_FLOAT_OES;
        gl.getExtension('EXT_color_buffer_float');
        gl.getExtension('OES_texture_float_linear');

        return { gl, ext: { halfFloatTexType: halfFloat, formatRGBA: isWebGL2 ? { internalFormat: gl.RGBA16F, format: gl.RGBA } : { internalFormat: gl.RGBA, format: gl.RGBA }, formatRG: isWebGL2 ? { internalFormat: gl.RG16F, format: gl.RG } : { internalFormat: gl.RGBA, format: gl.RGBA }, formatR: isWebGL2 ? { internalFormat: gl.R16F, format: gl.RED } : { internalFormat: gl.RGBA, format: gl.RGBA } } };
    }

    class Program {
        constructor(vsSource, fsSource) {
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.compileShader(gl.VERTEX_SHADER, vsSource));
            gl.attachShader(this.program, this.compileShader(gl.FRAGMENT_SHADER, fsSource));
            gl.linkProgram(this.program);
            this.uniforms = {};
            const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                const name = gl.getActiveUniform(this.program, i).name;
                this.uniforms[name] = gl.getUniformLocation(this.program, name);
            }
        }
        compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }
        bind() { gl.useProgram(this.program); }
    }

    // Program Instances
    let advectProg, divergenceProg, pressureProg, gradSubProg, splatProg, displayProg;

    function initFramebuffers() {
        advectProg = new Program(SHADERS.vertex, SHADERS.advect);
        divergenceProg = new Program(SHADERS.vertex, SHADERS.divergence);
        pressureProg = new Program(SHADERS.vertex, SHADERS.pressure);
        gradSubProg = new Program(SHADERS.vertex, SHADERS.gradientSubtract);
        splatProg = new Program(SHADERS.vertex, SHADERS.splat);
        displayProg = new Program(SHADERS.vertex, SHADERS.display);

        // Quad Buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        resizeResources();
    }

    let dye, velocity, divergence, pressure;
    function resizeResources() {
        const w = CONFIG.SIM_RESOLUTION;
        const h = Math.round(w * (canvas.height / canvas.width));
        const dw = CONFIG.DYE_RESOLUTION;
        const dh = Math.round(dw * (canvas.height / canvas.width));

        dye = createDoubleFBO(dw, dh, ext.formatRGBA);
        velocity = createDoubleFBO(w, h, ext.formatRG);
        divergence = createFBO(w, h, ext.formatR);
        pressure = createDoubleFBO(w, h, ext.formatR);
    }

    function createFBO(w, h, fmt) {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, ext.halfFloatTexType, null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        return { texture, fbo, width: w, height: h, attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
    }

    function createDoubleFBO(w, h, fmt) {
        let f1 = createFBO(w, h, fmt), f2 = createFBO(w, h, fmt);
        return { width: w, height: h, get read() { return f1; }, get write() { return f2; }, swap() { [f1, f2] = [f2, f1]; } };
    }

    function setupEvents() {
        let lastX = 0, lastY = 0;
        window.addEventListener('mousemove', e => {
            const dx = (e.clientX - lastX) * 10;
            const dy = (e.clientY - lastY) * 10;
            lastX = e.clientX; lastY = e.clientY;

            // Neon RGB Cycle based on time
            const time = performance.now() * CONFIG.COLOR_SPEED;
            const r = Math.sin(time) * 0.5 + 0.5;
            const g = Math.sin(time + 2) * 0.5 + 0.5;
            const b = Math.sin(time + 4) * 0.5 + 0.5;

            splatStack.push({ x: e.clientX, y: e.clientY, dx, dy, color: { r, g, b } });
        });
        window.addEventListener('resize', resize);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) resizeResources();
    }

    const blit = (target) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    function update() {
        const dt = 0.016;

        // 1. Advection
        gl.viewport(0, 0, velocity.width, velocity.height);
        advectProg.bind();
        gl.uniform2f(advectProg.uniforms.texelSize, 1.0 / velocity.width, 1.0 / velocity.height);
        gl.uniform1i(advectProg.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectProg.uniforms.uSource, velocity.read.attach(0));
        gl.uniform1f(advectProg.uniforms.dt, dt);
        gl.uniform1f(advectProg.uniforms.dissipation, CONFIG.VELOCITY_DISSIPATION);
        blit(velocity.write.fbo); velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(advectProg.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectProg.uniforms.dissipation, CONFIG.DENSITY_DISSIPATION);
        blit(dye.write.fbo); dye.swap();

        // 2. Input (Splats)
        while (splatStack.length > 0) {
            const s = splatStack.pop();
            splat(s.x, s.y, s.dx, s.dy, s.color);
        }

        // 3. Pressure & Divergence
        gl.viewport(0, 0, velocity.width, velocity.height);
        divergenceProg.bind();
        gl.uniform2f(divergenceProg.uniforms.texelSize, 1.0 / velocity.width, 1.0 / velocity.height);
        gl.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence.fbo);

        pressureProg.bind();
        gl.uniform2f(pressureProg.uniforms.texelSize, 1.0 / velocity.width, 1.0 / velocity.height);
        gl.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write.fbo); pressure.swap();
        }

        gradSubProg.bind();
        gl.uniform1i(gradSubProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradSubProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write.fbo); velocity.swap();

        // 4. Draw
        render();
        requestAnimationFrame(update);
    }

    function splat(x, y, dx, dy, color) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        splatProg.bind();
        gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProg.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
        gl.uniform3f(splatProg.uniforms.color, dx, -dy, 1.0);
        gl.uniform1f(splatProg.uniforms.radius, CONFIG.SPLAT_RADIUS / 100);
        blit(velocity.write.fbo); velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
        blit(dye.write.fbo); dye.swap();
    }

    function render() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        displayProg.bind();
        gl.uniform1i(displayProg.uniforms.uTexture, dye.read.attach(0));
        blit(null);
    }

    return { init };
})();

// Auto-initialize if the canvas exists
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fluid-canvas');
    if (canvas) FluidSimulation.init(canvas);
});
