"use client";

import { useEffect, useRef } from "react";

const vertexSource = `#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;

const fragmentSource = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform float uReduced;
out vec4 fragColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 4; i++) { value += amplitude * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p * 1.45; amplitude *= 0.5; }
  return value;
}
void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
  float motion = uTime * (1.0 - uReduced) * 0.035;
  vec2 warped = uv * 0.72 + vec2(motion, -motion * 0.6);
  warped += vec2(fbm(warped * 1.15 + motion), fbm(warped * 1.15 - motion)) * 0.34;
  float cloud = smoothstep(0.32, 0.82, fbm(warped * 1.7 + uProgress * 1.2));
  float halo = exp(-2.2 * length(uv + vec2(0.0, 0.08)));
  vec3 gold = vec3(0.83, 0.55, 0.18);
  vec3 blue = vec3(0.06, 0.18, 0.34);
  vec3 color = mix(blue, gold, cloud * 0.22 + halo * 0.08);
  float vignette = smoothstep(1.45, 0.15, length(uv));
  fragColor = vec4(color * cloud * vignette * 0.28, cloud * vignette * 0.42);
}`;

export function ShaderAtmosphere({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ progress, reducedMotion });

  useEffect(() => { stateRef.current = { progress, reducedMotion }; }, [progress, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { alpha: true, antialias: false });
    if (!canvas || !gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Shader unavailable");
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
      return shader;
    };
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "uResolution");
    const time = gl.getUniformLocation(program, "uTime");
    const shaderProgress = gl.getUniformLocation(program, "uProgress");
    const reduced = gl.getUniformLocation(program, "uReduced");
    let frame = 0;
    const resize = () => { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(1.5, window.devicePixelRatio || 1); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
    const draw = (now: number) => { const state = stateRef.current; gl.useProgram(program); gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform1f(time, now * 0.001); gl.uniform1f(shaderProgress, state.progress); gl.uniform1f(reduced, state.reducedMotion ? 1 : 0); gl.drawArrays(gl.TRIANGLES, 0, 6); if (!state.reducedMotion) frame = requestAnimationFrame(draw); };
    resize(); window.addEventListener("resize", resize); frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); gl.deleteProgram(program); };
  }, []);

  return <canvas ref={canvasRef} className="koa-shader-atmosphere" aria-hidden="true" />;
}

export default ShaderAtmosphere;
