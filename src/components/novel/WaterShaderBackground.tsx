'use client';

import { useEffect, useRef } from 'react';

/* no49 パターン：元の Code Golf シェーダー
   WebGL 2 を優先、未対応時は WebGL 1 + tanh 自前実装 */

const WEBGL2_VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const WEBGL2_FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 r;
uniform float t;
out vec4 outColor;

void main() {
  vec4 FC = vec4(gl_FragCoord.xy, 0.0, 1.0);
  vec4 o = vec4(0.0);
  float z = 0.0, d = 0.0, i = 0.0;

  for(i = 0.0; i++ < 50.0; z += d, o += (.9 + sin(i * .1 - vec4(6., 1., 2., 0.))) / d / d / max(z, 0.01) + d * z / vec4(4., 2., 1., 0.)) {
    vec3 p = z * normalize(FC.rgb * 2. - r.xyx);
    for(d = 0.0; d++ < 9.0;) {
      p += .4 * sin(p.yzx * d - z + t + i) / d + .5;
    }
    d = length(vec4(abs(p.y + p.z * .5), sin(p - z) / 7.)) / (4. + z * z / 1e2);
  }
  o = tanh(o / 2e3);
  vec3 col = mix(vec3(0.04, 0.1, 0.2), vec3(0.12, 0.3, 0.5), clamp(o.rgb * 0.7, 0.0, 1.0));
  col = pow(col, vec3(0.92));
  outColor = vec4(col, 0.25 + o.a * 0.12);
}`;

const WEBGL1_FRAGMENT = `
precision mediump float;
uniform vec2 r;
uniform float t;
varying vec2 vUv;

void main() {
  vec2 FC = vUv * r;
  vec4 o = vec4(0.0);
  float z = 0.0, d = 0.08;

  for(float i = 0.0; i < 50.0; i++) {
    vec3 rd = normalize(vec3(FC * 2.0 - r.xyx));
    vec3 p = z * rd;
    for(float j = 1.0; j <= 9.0; j++) {
      p += 0.4 * sin(p.yzx * j - z + t + i) / j + 0.5;
    }
    d = length(vec4(abs(p.y + p.z * 0.5), sin(p.x - z) / 7.0, sin(p.y - z) / 7.0, sin(p.z - z) / 7.0)) / (4.0 + z * z / 100.0);
    z += d;
    o += (0.9 + sin(i * 0.1 - vec4(6.0, 1.0, 2.0, 0.0))) / (d * d * max(z, 0.01)) + d * z / vec4(4.0, 2.0, 1.0, 0.0);
  }
  vec4 o2 = clamp(o / 2000.0, -20.0, 20.0);
  o = vec4((exp(2.0*o2.x)-1.0)/(exp(2.0*o2.x)+1.0),(exp(2.0*o2.y)-1.0)/(exp(2.0*o2.y)+1.0),(exp(2.0*o2.z)-1.0)/(exp(2.0*o2.z)+1.0),(exp(2.0*o2.w)-1.0)/(exp(2.0*o2.w)+1.0));
  vec3 col = mix(vec3(0.04, 0.1, 0.2), vec3(0.12, 0.3, 0.5), clamp(o.rgb * 0.7, 0.0, 1.0));
  col = pow(col, vec3(0.92));
  gl_FragColor = vec4(col, 0.25 + o.a * 0.12);
}`;

const VERTEX_SOURCE = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

interface WaterShaderBackgroundProps {
  intensity?: number;
  className?: string;
}

export function WaterShaderBackground({
  intensity = 1,
  className = '',
}: WaterShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });

    const useWebGL2 = !!gl;
    if (!gl) {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });
    }
    if (!gl) return;

    const vsSource = useWebGL2 ? WEBGL2_VERTEX : VERTEX_SOURCE;
    const fsSource = useWebGL2 ? WEBGL2_FRAGMENT : WEBGL1_FRAGMENT;

    const createShader = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const rLoc = gl.getUniformLocation(program, 'r');
    const tLoc = gl.getUniformLocation(program, 't');

    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      gl!.useProgram(program);
      gl!.uniform2f(rLoc, gl!.canvas.width, gl!.canvas.height);
      gl!.uniform1f(tLoc, (performance.now() - start) * 0.001);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl!.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full block ${className}`}
      style={{ opacity: intensity }}
      aria-hidden
    />
  );
}
