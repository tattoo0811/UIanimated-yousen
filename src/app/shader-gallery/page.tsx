'use client';

import React, { useEffect, useRef, useState } from 'react';

// 頂点シェーダー（共通）
const vsSource = `#version 300 es
in vec4 position;
void main() {
    gl_Position = position;
}`;

// ========================================
// サンプルシェーダー集（五行）
// ========================================
const shaders: Record<string, { name: string; element: string; desc: string; code: string }> = {
    water: {
        name: "壬水 — 大海",
        element: "水",
        desc: "大河。絶え間ない波の流動と深い青のグラデーション。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);
    float z = 0.0, d = 0.0, i = 0.0;

    for (i = 0.0; i++ < 50.0; z += d,
         o += (0.9 + sin(i * 0.1 - vec4(6, 1, 2, 0))) / d / d / z + d * z / vec4(4, 2, 1, 0)) {
        vec3 p = z * normalize(FC.rgb * 2.0 - r.xyx);
        for (d = 0.0; d++ < 9.0;) {
            p += 0.4 * sin(p.yzx * d - z + t + i) / d + 0.5;
        }
        d = length(vec4(abs(p.y + p.z * 0.5), sin(p - z) / 7.0)) / (4.0 + z * z / 100.0);
    }
    o = tanh(o / 2000.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    fire: {
        name: "丙火 — 太陽",
        element: "火",
        desc: "複数のコアを回転させ、積層された光で形成される赤い球体。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec2 FC = gl_FragCoord.xy;
    vec2 baseP = (FC * 2.0 - r) / min(r.x, r.y);
    vec3 finalColor = vec3(0.0);
    float layers = 10.0;

    for (float i = 0.0; i < layers; i++) {
        float surge = sin(t * 0.25 + i * 0.5) * sin(t * 0.1 - i * 0.2);
        float shake = smoothstep(0.4, 0.9, abs(surge));
        float waveDir = sign(surge);
        float angle = (i / layers) * 3.14159265;
        vec2 p = baseP * rot(angle + t * 0.015 + shake * waveDir * 0.15);
        p.x += sin(p.y * 3.0 + t * 0.6) * 0.1 * shake;
        float tilt = 0.6 + 0.2 * sin(t * 0.06 + i * 2.0);
        tilt += shake * 0.1 * sin(t * 1.5);
        p.y /= tilt;

        float l = length(p) - 0.7;
        float a = atan(p.y, p.x) + t * 0.1 + i;
        float ray = cos(a * 20.0);
        float width = pow(abs(ray), 4.0);
        vec4 o = tanh(0.4 * (0.6 + vec4(-p.x, -p.y, p.x, p.y))
                 * dot(p, cos(t * 0.13 + vec2(0, 1.5) + i))
                 / (length(vec2(l * 3.5, width - 0.2)) + 0.05));
        vec3 layerColor = abs(o.rgb);

        vec3 baseTint = mix(vec3(1.0, 0.15, 0.02), vec3(1.0, 0.6, 0.05), abs(sin(i * 0.5 + t * 0.03)));
        vec3 posTint = vec3(0.0);
        float orangeLight = smoothstep(-0.5, 1.0, dot(baseP, normalize(vec2(1.0, 1.0))));
        posTint += vec3(1.0, 0.5, 0.0) * orangeLight;
        float cyanLight = smoothstep(-0.5, 1.0, dot(baseP, normalize(vec2(-1.0, -0.8))));
        posTint += vec3(1.0, 0.1, 0.05) * cyanLight;
        float centerGlow = 1.0 - smoothstep(0.0, 0.8, length(baseP));
        posTint += vec3(1.0, 0.8, 0.3) * centerGlow * 1.5;

        layerColor *= (baseTint * 0.5 + posTint * 0.8);
        layerColor *= 2.0;
        finalColor += layerColor * 0.3;
    }

    float sphereMask = smoothstep(1.1, 0.4, length(baseP));
    finalColor *= sphereMask;
    finalColor = pow(finalColor, vec3(1.3));
    outColor = vec4(finalColor, 1.0);
}`
    },

    fire_corona: {
        name: "丙火 — 日冕（コロナ）",
        element: "火",
        desc: "NEURAL CORE技法を応用した太陽コロナ。8層のtanh光芒が彩層・プロミネンスと共に脈動する。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec2 FC = gl_FragCoord.xy;
    vec2 p = (FC * 2.0 - r) / r.y;

    float len = length(p);
    float sunR = 0.28;
    float l = len - sunR;
    float a = atan(p.y, p.x);

    // === Multi-layer corona (NEURAL CORE adaptation) ===
    vec4 o = vec4(0.0);
    for (float i = 0.0; i < 8.0; i++) {
        float ai = a + t * (0.04 + i * 0.015) + i * 0.7;
        float fi = 5.0 + i * 2.0;
        float wobble = sin(ai * 2.0 + t * 0.2) * 0.012 * (i + 1.0);
        float li = l + wobble;

        float radial = min(li * 3.0, li) * 5.0;
        float angular = cos(ai * fi + sin(t * 0.25 + i * 1.2) * 0.4) - 0.86;
        float d = length(vec2(radial, angular));

        o += tanh(
            (0.2 + i * 0.015)
            * (0.7 + vec4(-p.x, -p.y, p.x, p.y))
            * dot(p, cos(t * 0.08 + vec2(0.0, 1.8) + i * 0.4))
            / (d + 0.008)
        ) * (1.0 - i * 0.09);
    }

    // Fire color mapping
    vec3 corona = vec3(
        abs(o.r) * 1.0 + abs(o.b) * 0.5 + abs(o.g) * 0.2,
        abs(o.g) * 0.35 + abs(o.r) * 0.15 + abs(o.a) * 0.08,
        abs(o.b) * 0.04 + abs(o.a) * 0.02
    ) * 0.55;
    corona *= smoothstep(-0.01, 0.06, l);

    // === Solar disk ===
    float disk = smoothstep(0.008, -0.008, l);
    vec3 diskCol = mix(
        vec3(1.0, 0.55, 0.08),
        vec3(1.0, 0.98, 0.9),
        smoothstep(sunR, 0.0, len)
    );
    diskCol *= 0.75 + 0.25 * (1.0 - len * len / (sunR * sunR));

    // === Chromosphere ===
    float chromo = exp(-l * l * 1200.0) * (1.0 - disk * 0.4);
    vec3 chromoCol = vec3(1.0, 0.1, 0.02) * chromo * 2.5;

    // === Prominences ===
    float prom = 0.0;
    for (float i = 0.0; i < 3.0; i++) {
        float pa = a - i * 2.094 - t * 0.025;
        float arcH = 0.1 + 0.05 * sin(t * 0.12 + i * 2.5);
        float pr = l - arcH * pow(max(0.0, sin(pa * 1.5)), 2.0);
        prom += smoothstep(0.05, 0.005, abs(pr)) * smoothstep(0.35, 0.0, l) * 0.3;
    }

    // === Composite ===
    vec3 col = corona + chromoCol + vec3(1.0, 0.2, 0.02) * prom;
    col = mix(col, diskCol, disk);
    col += vec3(0.008, 0.001, 0.0) / (len * 0.25 + 0.15);

    outColor = vec4(col, 1.0);
}`
    },

    fire_rays: {
        name: "丙午 — 中天の烈光",
        element: "火",
        desc: "No.43 比和(火×火)。NEURAL COREの数学美を純火に昇華。南の王の光芒が最大強度で放射する。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec2 FC = gl_FragCoord.xy;
    vec2 p = (FC * 2.0 - r) / r.y;

    float l = length(p) - 0.5;
    float a = atan(p.y, p.x) + t * 0.25;

    // Layer 1: Primary corona rays (8-fold)
    vec4 o = tanh(
        0.35 * (0.7 + vec4(-p.x, -p.y, p.x, p.y))
        * dot(p, cos(t * 0.12 + vec2(0, 2)))
        / length(vec2(min(l * 4.0, l) * 4.0, cos(a * 8.0) - 0.9))
    );

    // Layer 2: Secondary rays (12-fold, offset)
    float l2 = length(p) - 0.45;
    float a2 = atan(p.y, p.x) + t * 0.18 + 0.3;
    o += tanh(
        0.2 * (0.6 + vec4(-p.y, p.x, -p.x, p.y))
        * dot(p, cos(t * 0.08 + vec2(1.5, 0.5)))
        / length(vec2(min(l2 * 3.5, l2) * 4.5, cos(a2 * 12.0) - 0.88))
    ) * 0.6;

    // Layer 3: Fine detail (20-fold, subtle)
    float l3 = length(p) - 0.55;
    float a3 = atan(p.y, p.x) + t * 0.1 - 0.5;
    o += tanh(
        0.15 * (0.5 + vec4(p.y, -p.x, p.x, -p.y))
        * dot(p, cos(t * 0.06 + vec2(0.8, 2.5)))
        / length(vec2(min(l3 * 3.0, l3) * 5.0, cos(a3 * 20.0) - 0.92))
    ) * 0.3;

    // Fire color remapping
    vec3 col = vec3(
        abs(o.r) * 1.2 + abs(o.b) * 0.6 + abs(o.g) * 0.15,
        abs(o.g) * 0.4 + abs(o.r) * 0.12 + abs(o.a) * 0.08,
        abs(o.b) * 0.05 + abs(o.a) * 0.02
    );

    // Center warmth
    float centerGlow = exp(-length(p) * 2.0) * 0.15;
    col += vec3(1.0, 0.6, 0.1) * centerGlow;

    outColor = vec4(col, 1.0);
}`
    },

    fire_lantern: {
        name: "丁火 — 灯火",
        element: "火",
        desc: "陰火の本質。Domain Warpingが織りなす揺らめく暖色の中に、ほのかな明かりが呼吸する。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    float t = u_time;

    // === Domain Warping: organic, living warmth ===
    vec2 q = vec2(
        fbm(uv * 1.8 + vec2(0.0, t * 0.04)),
        fbm(uv * 1.8 + vec2(5.2, 1.3) + t * 0.035)
    );
    vec2 r2 = vec2(
        fbm(uv * 1.8 + 4.0 * q + vec2(1.7, 9.2) + t * 0.055),
        fbm(uv * 1.8 + 4.0 * q + vec2(8.3, 2.8) + t * 0.045)
    );
    float f = fbm(uv * 1.8 + 4.0 * r2);

    // Warm amber palette (丁 = yin fire, gentle)
    vec3 col = mix(vec3(0.015, 0.005, 0.002), vec3(0.25, 0.08, 0.01), f);
    col = mix(col, vec3(0.8, 0.4, 0.06), f * f * 1.6);
    col = mix(col, vec3(1.0, 0.82, 0.45), pow(f, 5.0) * 0.35);

    // === Breathing center glow ===
    float breath = 0.85 + 0.15 * sin(t * 0.4 + sin(t * 0.17) * 0.5);
    float glow = exp(-length(uv + vec2(0.0, 0.1)) * 1.5) * breath;
    col += vec3(0.9, 0.5, 0.12) * glow * 0.35;

    // === Upward warmth drift ===
    float drift = noise(vec2(uv.x * 4.0, uv.y * 2.0 - t * 0.6));
    float driftMask = smoothstep(0.25, 0.0, abs(uv.x))
                    * smoothstep(0.6, -0.2, uv.y)
                    * smoothstep(-0.3, 0.1, uv.y);
    col += vec3(1.0, 0.65, 0.15) * drift * driftMask * 0.12;

    // === Floating embers ===
    for (float i = 0.0; i < 6.0; i++) {
        vec2 ep = vec2(
            sin(i * 3.7 + t * 0.12 + sin(t * 0.05 + i)) * 0.35,
            mod(i * 0.3 + t * 0.06 + sin(i * 2.1) * 0.2, 2.0) - 1.0
        );
        float ember = smoothstep(0.015, 0.0, length(uv - ep));
        float flicker = 0.4 + 0.6 * sin(t * 1.5 + i * 4.7);
        col += vec3(1.0, 0.55, 0.08) * ember * flicker * 0.3;
    }

    // Warm vignette (darkness beyond the light)
    float vig = 1.0 - 0.45 * length(uv * 0.85);
    col *= max(0.0, vig);
    col = pow(col, vec3(0.95));

    outColor = vec4(col, 1.0);
}`
    },

    wood: {
        name: "甲木 — 大樹",
        element: "木",
        desc: "月下の大樹。空間セル毎に異なる風位相を持ち、葉群が独立して揺れる。落葉が風に舞う。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    float t = u_time;

    // === Wind ===
    float wind = sin(t * 0.3) * 0.4 + sin(t * 0.7) * 0.2;
    float gust = sin(t * 2.0) * 0.15 * smoothstep(0.3, 0.9, sin(t * 0.5));
    float totalWind = wind + gust;

    // === Night Sky ===
    vec3 sky = mix(vec3(0.01, 0.015, 0.05), vec3(0.03, 0.05, 0.1), uv.y * 0.5 + 0.5);
    float stars = pow(hash(floor(uv * 200.0)), 30.0);
    sky += stars * 0.4;
    vec2 moonPos = vec2(0.55, 0.72);
    float moonDist = length(uv - moonPos);
    sky += vec3(0.7, 0.75, 0.6) * smoothstep(0.07, 0.05, moonDist);
    sky += vec3(0.15, 0.18, 0.1) * exp(-moonDist * 3.5);

    // === Trunk (bends with wind, more at top) ===
    float bend = totalWind * smoothstep(-0.8, 0.4, uv.y) * 0.04;
    float trunkX = uv.x - bend;
    float trunkW = mix(0.065, 0.012, smoothstep(-0.75, 0.3, uv.y));
    float trunk = smoothstep(trunkW, trunkW - 0.01, abs(trunkX));
    trunk *= smoothstep(-0.85, -0.7, uv.y) * smoothstep(0.35, 0.15, uv.y);
    float bark = fbm(vec2(trunkX * 30.0, uv.y * 6.0));
    vec3 trunkCol = mix(vec3(0.1, 0.06, 0.02), vec3(0.2, 0.11, 0.04), bark);

    // === Branches ===
    float branchLayer = 0.0;
    for (float i = 0.0; i < 6.0; i++) {
        float y0 = -0.15 + i * 0.1;
        float dir = mod(i, 2.0) == 0.0 ? 1.0 : -1.0;
        float bBend = totalWind * smoothstep(y0, y0 + 0.3, uv.y) * (0.02 + i * 0.004);
        vec2 bp = uv - vec2(bBend, y0);
        bp *= rot(dir * (0.3 + i * 0.04));
        float bw = 0.018 - bp.x * dir * 0.025;
        float b = smoothstep(max(bw, 0.003), max(bw - 0.007, 0.0), abs(bp.y));
        b *= smoothstep(0.0, 0.02, bp.x * dir);
        b *= smoothstep(0.3, 0.05, bp.x * dir);
        branchLayer += b * 0.4;
    }

    // === Leaf Canopy (per-cell wind phase = independent sway) ===
    vec2 canopyCenter = vec2(bend * 0.5, 0.32);
    float canopyMask = smoothstep(0.55, 0.12, length((uv - canopyCenter) * vec2(0.8, 1.0)));

    // Each spatial cell has its own wind phase
    vec2 cellId = floor(uv * 12.0);
    float cellPhase = hash(cellId) * 6.283;
    float cellWind = sin(t * 0.8 + cellPhase) * 0.015
                   + sin(t * 1.4 + cellPhase * 0.7) * 0.008
                   + totalWind * 0.025;
    float cellVert = sin(t * 0.6 + cellPhase * 1.3) * 0.005;

    vec2 swayedUV = uv + vec2(cellWind, cellVert) * smoothstep(-0.2, 0.5, uv.y);
    float leafNoise = fbm(swayedUV * 8.0 + vec2(t * 0.05, 0.0));
    float leafDetail = fbm(swayedUV * 18.0 + t * 0.08);
    float leaves = canopyMask * (leafNoise * 0.7 + leafDetail * 0.3);
    leaves = smoothstep(0.2, 0.55, leaves);

    vec3 leafCol = mix(vec3(0.05, 0.2, 0.04), vec3(0.18, 0.48, 0.1), leafNoise);
    leafCol += vec3(0.06, 0.08, 0.03) * smoothstep(0.2, 0.6, uv.y) * canopyMask;
    float depthDark = smoothstep(0.35, 0.1, length(uv - canopyCenter));
    leafCol *= 0.7 + 0.3 * (1.0 - depthDark);
    float dapple = noise(uv * 12.0 + t * 0.2) * noise(uv * 6.0 - t * 0.1);
    leafCol += vec3(0.08, 0.12, 0.02) * dapple * canopyMask;

    // === Falling Leaves ===
    vec3 fallingCol = vec3(0.0);
    for (float i = 0.0; i < 4.0; i++) {
        float fy = mod(-t * (0.05 + i * 0.015) - i * 0.5, 2.2) - 0.9;
        float fx = sin(t * 0.35 + i * 2.5) * 0.25 + sin(fy * 2.5 + i) * 0.1;
        vec2 lp = uv - vec2(fx, fy);
        lp *= rot(t * 1.2 + i * 2.8);
        float fl = smoothstep(0.01, 0.003, length(lp * vec2(1.0, 2.5)));
        fallingCol += mix(vec3(0.2, 0.3, 0.05), vec3(0.4, 0.25, 0.04), sin(i * 2.0) * 0.5 + 0.5) * fl * 0.5;
    }

    // === Ground ===
    float ground = smoothstep(-0.65, -0.7, uv.y);
    vec3 groundCol = mix(vec3(0.012, 0.025, 0.008), vec3(0.025, 0.04, 0.015), fbm(uv * vec2(10.0, 5.0)));

    // === Composite ===
    vec3 col = sky;
    col = mix(col, groundCol, ground);
    col = mix(col, trunkCol, max(trunk, branchLayer));
    col = mix(col, leafCol, leaves);
    col += fallingCol;

    outColor = vec4(col, 1.0);
}`
    },

    earth: {
        name: "戊土 — 大地",
        element: "土",
        desc: "地層と岩肌。fbmノイズによる有機的な大地のテクスチャ。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    float t = u_time;

    float layers = 0.0;
    for (float i = 0.0; i < 8.0; i++) {
        float y = uv.y * 15.0 + i * 1.5;
        float n = noise(vec2(uv.x * 3.0 + i * 2.0, t * 0.05));
        layers += smoothstep(0.02, 0.0, abs(sin(y + n * 3.0))) * 0.15;
    }

    float rock = fbm(uv * 8.0 + t * 0.02);
    float detail = fbm(uv * 20.0 + t * 0.01) * 0.3;

    vec3 baseColor = mix(
        vec3(0.3, 0.18, 0.08),
        vec3(0.55, 0.4, 0.22),
        rock
    );
    baseColor += layers * vec3(0.3, 0.2, 0.1);
    baseColor += detail * vec3(0.15, 0.1, 0.05);

    float glow = smoothstep(0.9, 0.0, length(uv)) * 0.2;
    baseColor += vec3(0.6, 0.4, 0.15) * glow;

    float cracks = smoothstep(0.01, 0.0, abs(fbm(uv * 12.0) - 0.5));
    baseColor -= cracks * 0.1;

    outColor = vec4(baseColor, 1.0);
}`
    },

    metal: {
        name: "庚金 — 鍛鉄",
        element: "金",
        desc: "Aggressiveフィードバックループが生む鍛え上げられた鉄の干渉紋。特異点が刃の稜線となり、時変スパークルが鋼の煌めきを放つ。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec2 FC = gl_FragCoord.xy;
    vec2 uv = (FC * 2.0 - r) / min(r.x, r.y);

    // === AGGRESSIVE NESTED-SIN FEEDBACK ===
    // Self-reinforcing sin waves: each iteration warps space
    // based on the previous result, creating complex interference
    vec2 v = uv * 2.0;
    vec4 o = vec4(0.0);

    for (float i = 1.0; i < 10.0; i++) {
        // Core feedback: v.yx swap creates rotational complexity
        v += sin(v.yx * i * 2.0 + i + t * 2.0) / (i * 0.5);
        // Color accumulates at singularities (where v→0) = sharp metal edges
        o += (cos(i + vec4(0, 1, 2, 3)) + 1.0) / 6.0 / (length(v) + 0.08);
    }

    // === METALLIC COLOR REMAPPING ===
    vec3 raw = o.rgb;
    float lum = dot(raw, vec3(0.299, 0.587, 0.114));

    // Steel base: gunmetal dark → bright polished silver
    vec3 steel = mix(
        vec3(0.10, 0.11, 0.16),
        vec3(0.78, 0.80, 0.88),
        clamp(lum * 0.55, 0.0, 1.0)
    );

    // Preserve interference as cool iridescence (庚金 = autumn, cold)
    vec3 iri = (raw - lum) * 0.18;
    iri = vec3(
        iri.r * 0.3 + iri.b * 0.15,
        iri.g * 0.35 + iri.b * 0.1,
        iri.b * 0.75 + iri.r * 0.25
    );
    vec3 col = steel + iri;

    // Forge glow at high-intensity peaks
    float peak = smoothstep(0.5, 1.0, lum);
    col += vec3(0.5, 0.28, 0.08) * peak * 0.35;

    // === FACET HIGHLIGHTS ===
    float facet = abs(sin(v.x * 6.0)) * abs(cos(v.y * 6.0));
    col += vec3(0.12, 0.13, 0.18) * pow(facet, 2.0);

    // === DYNAMIC SPARKLE (time-varying specular catches) ===
    for (float i = 0.0; i < 4.0; i++) {
        vec2 sp = uv * (50.0 + i * 35.0);
        float phase = floor(t * (1.5 + i * 0.4));
        float s = pow(hash(floor(sp) + phase + i * 7.13), 22.0);
        col += vec3(1.0, 0.96, 0.88) * s * 2.5;
    }

    // === BRUSHED-METAL ANISOTROPY ===
    float brushed = pow(max(0.0, sin(v.x * 28.0 + t * 0.25)), 10.0);
    col += vec3(0.85, 0.87, 0.95) * brushed * 0.1;

    // Metallic rim + vignette
    float dist = length(uv);
    float rim = smoothstep(0.5, 1.35, dist);
    col *= 1.0 - rim * 0.85;
    col += vec3(0.25, 0.22, 0.38) * rim * (1.0 - rim) * 2.2;

    // Metallic contrast curve
    col = pow(max(col, vec3(0.0)), vec3(0.88));

    outColor = vec4(col, 1.0);
}`
    },

    // ========================================
    // 追加シェーダー集
    // ========================================

    candle: {
        name: "丁火 — 蝋燭",
        element: "火",
        desc: "蝋燭の炎。揺らめく芯から立ち上る暖かい光が空間を歪ませる。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    for (float i = 0.0, z = 0.0, d = 0.0, j = 0.0; i++ < 50.0; o += (sin(z / 3.0 + vec4(7, 2, 3, 0)) + 1.1) / d) {
        vec3 p = z * normalize(FC.rgb * 2.0 - r.xyy);
        p.z += 5.0 + cos(t);
        float cy = p.y * 0.5;
        p.xz *= mat2(cos(t + cy + vec4(0, 33, 11, 0))) / max(p.y * 0.1 + 1.0, 0.1);
        for (j = 2.0; j < 15.0; j /= 0.6)
            p += cos((p.yzx - vec3(t, 0, 0) / 0.1) * j + t) / j;
        z += d = 0.01 + abs(length(p.xz) + p.y * 0.3 - 0.5) / 7.0;
    }
    o = tanh(o / 1000.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    falls: {
        name: "壬水 — 瀑布",
        element: "水",
        desc: "滝のような水の流れ。力強く落下する水流と霧が織りなす壮大な光景。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);
    vec3 x = vec3(0.0), c = vec3(0.0), p = vec3(0.0);
    x.x += 9.0;

    for (float i = 0.0, z = 0.0, f = 0.0; i++ < 50.0;
         p = mix(c, p, 0.3),
         z += f = 0.2 * (abs(p.z + p.x + 16.0 + tanh(p.y) / 0.1) + sin(p.x - p.z + t + t) + 1.0),
         o += (cos(p.x * 0.2 + f + vec4(6, 1, 2, 0)) + 2.0) / f / z) {
        c = z * normalize(FC.rgb * 2.0 - r.xyy);
        p = c;
        p.y *= f = 0.3;
        for (f = 0.3; f++ < 5.0; )
            p += cos(p.yzx * f + i + z + x * t) / f;
    }
    o = tanh(o / 30.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    fire_candle: {
        name: "丁火 — 強焔",
        element: "火",
        desc: "丁火で少しだけ強めの蝋燭。火柱が揺らめきながら上昇し、温かい光を放射する。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

// Simplex-like 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    vec2 p = (FC.xy * 2.0 - r) / r.y;
    vec2 R = vec2(0.0);
    p *= 1.0 - vec2(0.5 * p.y, 0.5 / (1.0 + p * p));
    p.y -= t;
    float F = 11.0, N = 0.0, d = 0.0;
    for (R.x = F; F < 50.0; F *= 1.2) {
        p += 0.4 * sin(F * dot(p, sin(++R)) + 6.0 * t) * cos(R) / F;
    }
    N = snoise2D(p * 4.0);
    d = length(p + vec2(0, t + 0.5)) / 0.3 - ++N;
    N += snoise2D(p * 8.0);
    o = tanh(++N / (0.5 - 0.1 * N + max(d / 0.1, -d) * abs(d) / 0.3) / vec4(1, 3, 9, 1));
    outColor = vec4(o.rgb, 1.0);
}`
    },

    horizon: {
        name: "丙火 — 夜明け",
        element: "火",
        desc: "夜明けの光。地平線から昇る太陽が空を赤く染め、壮大な黎明を描く。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    vec3 c = vec3(0.0), p = vec3(0.0);
    for (float i = 0.0, z = 0.1, f = 0.0; i++ < 100.0; o += vec4(9, 4, 2, 0) / f / length(c.xy / z)) {
        p = z * normalize(FC.rgb * 2.0 - r.xyy);
        c = p;
        for (p.x *= f = 0.6; f++ < 9.0; )
            p += sin(p.yzx * f + 0.5 * z - t / 4.0) / f;
        z += f = 0.03 + 0.1 * max(f = 6.0 - 0.2 * z + min(f = (p + c).y, -f * 0.2), -f * 0.6);
    }
    o = tanh(o * o / 9e8);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    moon: {
        name: "月 — 休息",
        element: "水",
        desc: "静寂の月光。丙が休息を必要とする時に現れる、幽玄な月と星空の風景。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    for (float i = 0.0, z = 0.0, d = 0.0, f = 0.0; i++ < 100.0;
         o += vec4(4, 6, 8.0 + z, 0) / f - min(z * 0.001 + z, 0.0) / exp(d * d / 0.1)) {
        vec3 p = z * (FC.rgb * 2.0 - r.xyy) / r.y;
        vec3 c = p;
        p.z += 8.0;
        c.z *= 3.0;
        for (f = 1.0; f++ < 9.0; )
            c += sin(c.yzx * f + z + t * 0.5) / f;
        z += min(f = 0.1 + abs(0.2 * c.y + abs(p.y + 0.8)),
                 d = max(length(p) - 3.0, 0.9 - length(p - vec3(-1, 1, 3)))) / 7.0;
    }
    o = tanh(o / 2000.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    lanterns: {
        name: "丁火 — 灯篭",
        element: "火",
        desc: "宙に浮かぶランタンの群れ。暗闇の中で暖かい光が揺れ、幻想的な夜景を照らす。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    vec3 s = normalize(FC.rgb * 2.1 - r.xyx);
    vec3 p = vec3(0.0), v = vec3(0.0), c = s / s.y;
    v.y++;
    for (float i = 0.0, d = 0.0, z = 0.0; i++ < 30.0;
         o += (9.0 - cos(p.y / 0.2) / (0.1 + d)) / d / z) {
        p = s * z + v;
        p.z -= t;
        p.y -= d = min(p.y + p.y < 0.0 ? p.y + p.y : 0.0, 0.0);
        p += 0.03 * sin(length(c - 2.0) / 0.1) * d;
        p += p * v - sin(p.zxy * 0.6 - t * 0.2);
        z += d = 0.01 + 0.6 * abs(length(sin(p) - v) - 0.1);
    }
    o = tanh(vec4(9, 3, 1, 0) * o / 6000.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    angel: {
        name: "丙火 — 天火",
        element: "火",
        desc: "強い炎。回転する炎の渦が螺旋を描き、天を穿つような激しい火柱を生み出す。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

void main() {
    vec2 r = u_resolution;
    float t = u_time;
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);

    for (float i = 0.0, z = 0.0, d = 0.0, j = 0.0; i++ < 50.0;
         o += (sin(z + vec4(2, 3, 4, 0)) + 1.1) / d) {
        vec3 p = z * normalize(FC.rgb * 2.0 - r.xyy);
        p.z += 6.0;
        p.xz *= mat2(cos(p.y * 0.5 + vec4(0, 33, 11, 0)));
        for (j = 1.0; j < 9.0; j /= 0.8)
            p += cos((p.yzx - t * vec3(3, 1, 0)) * j) / j;
        z += d = 0.01 + abs(length(p.xz) - 0.5) / 9.0;
    }
    o = tanh(o / 1000.0);
    outColor = vec4(o.rgb, 1.0);
}`
    },

    mudwater: {
        name: "己土 — 泥流",
        element: "土",
        desc: "有機的に流動する泥水。Domain Warpingが生む複雑なパターンが大地の力を可視化する。",
        code: `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

mat2 rot(float a) {
    return mat2(sin(a), cos(a), -cos(a), sin(a));
}

float noise(vec2 x) {
    return smoothstep(0.0, 1.0, sin(1.5 * x.x) * sin(1.5 * x.y));
}

float fbm(vec2 p) {
    mat2 m = rot(0.4);
    float f = 0.0;
    f += 0.500000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.02;
    f += 0.250000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.03;
    f += 0.125000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.01;
    f += 0.015625 * (0.5 + 0.5 * noise(p));
    return f / 0.96875;
}

float pattern(vec2 p, out vec2 q, out vec2 rr, float t) {
    q.x = fbm(2.0 * p + vec2(0.0, 0.0) + 2.0 * t);
    q.y = fbm(1.5 * p + vec2(5.2, 1.3) + 1.0 * t);

    rr.x = fbm(p + 4.0 * q + vec2(1.7, 9.2) + sin(t) + 0.9 * sin(30.0 * length(q)));
    rr.y = fbm(p + 8.0 * q + vec2(8.3, 2.8) + cos(t) + 0.9 * sin(20.0 * length(q)));

    return fbm(p + 7.0 * rr * rot(t));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.xy * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 q, rr;
    vec3 col1 = vec3(0.9, 0.7, 0.5);
    vec3 col2 = vec3(0.3, 0.5, 0.4);
    vec3 c;

    float f = pattern(uv, q, rr, 0.1 * u_time);

    c = mix(col1, vec3(0.0), pow(smoothstep(0.0, 0.9, f), 2.0));
    c += col2 * pow(smoothstep(0.0, 0.8, dot(q, rr) * 0.6), 3.0) * 1.5;
    c *= pow(dot(q, rr) + 0.3, 3.0);
    c *= f * 1.5;

    outColor = vec4(c, 1.0);
}`
    },

    ocean_deep: {
        name: "壬水 — 深海",
        element: "水",
        desc: "海の底。ボロノイコースティクスと気泡が織りなす幻想的な深海。",
        code: `#version 300 es
// Original shader — no external code used
// Technique: Voronoi caustics + SDF bubbles + volumetric light
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

// Original hash using golden ratio constants
float h21(vec2 p) {
    return fract(sin(dot(p, vec2(41.73, 89.17))) * 2847.31);
}

// Voronoi distance for caustic patterns
float voronoi(vec2 p) {
    vec2 g = floor(p);
    vec2 f = fract(p);
    float md = 8.0;
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
        vec2 n = vec2(float(i), float(j));
        vec2 o = vec2(h21(g + n), h21(g + n + 71.3));
        o = 0.5 + 0.5 * sin(u_time * 0.6 + 6.2831 * o);
        float d = length(n + o - f);
        md = min(md, d);
    }
    return md;
}

// Original value noise
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h21(i), b = h21(i + vec2(1, 0));
    float c = h21(i + vec2(0, 1)), d = h21(i + vec2(1, 1));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// fbm for volumetric shafts
float vfbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p = m * p * 2.1;
        a *= 0.45;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
    float t = u_time;

    // Deep sea base color (depth gradient)
    float depth = uv.y * 0.5 + 0.5;
    vec3 deepCol = mix(vec3(0.0, 0.02, 0.06), vec3(0.02, 0.08, 0.18), depth);

    // Caustic layer 1 (large, slow)
    float caust1 = voronoi(uv * 4.0 + vec2(t * 0.08, t * 0.05));
    caust1 = pow(1.0 - caust1, 3.0);

    // Caustic layer 2 (fine, faster)
    float caust2 = voronoi(uv * 8.0 + vec2(-t * 0.12, t * 0.07));
    caust2 = pow(1.0 - caust2, 4.0);

    // Combine caustics with depth fade
    float caustMask = smoothstep(-0.5, 0.4, uv.y);
    vec3 caustCol = vec3(0.15, 0.5, 0.6) * caust1 * 0.4
                  + vec3(0.1, 0.35, 0.55) * caust2 * 0.25;
    deepCol += caustCol * caustMask;

    // Volumetric light shafts (original implementation)
    float shaftAngle = -0.25;
    vec2 shaftUV = vec2(
        uv.x * cos(shaftAngle) - uv.y * sin(shaftAngle),
        uv.x * sin(shaftAngle) + uv.y * cos(shaftAngle)
    );
    float shaft = vfbm(vec2(shaftUV.x * 3.0 + 100.0 + t * 0.04, shaftUV.y * 0.8));
    shaft *= smoothstep(-0.3, 0.5, uv.y); // fade with depth
    shaft *= smoothstep(0.8, 0.0, abs(uv.x + 0.15)); // horizontal mask
    deepCol += vec3(0.2, 0.4, 0.35) * shaft * shaft * 0.8;

    // SDF bubbles (original parametric)
    for (float i = 0.0; i < 8.0; i++) {
        float seed = i * 7.31;
        float bx = sin(seed * 1.7 + t * 0.2) * 0.4 + sin(seed) * 0.2;
        float by = mod(seed * 0.37 - t * (0.04 + h21(vec2(seed)) * 0.03), 2.0) - 1.0;
        vec2 bp = uv - vec2(bx, by);
        float bSize = 0.006 + h21(vec2(seed, 1.0)) * 0.012;
        float bDist = length(bp) - bSize;

        // Bubble body
        float bubble = smoothstep(0.003, 0.0, abs(bDist));
        // Specular highlight
        float spec = smoothstep(bSize * 0.6, 0.0, length(bp - vec2(-bSize * 0.3, bSize * 0.3)));

        deepCol += vec3(0.15, 0.3, 0.35) * bubble * 0.5;
        deepCol += vec3(0.5, 0.7, 0.8) * spec * 0.3;
    }

    // Floating particles
    for (float i = 0.0; i < 12.0; i++) {
        float ps = i * 3.79;
        vec2 pp = vec2(
            sin(ps * 2.1 + t * 0.1) * 0.6,
            mod(ps * 0.29 - t * 0.02, 2.4) - 1.2
        );
        float pDot = smoothstep(0.004, 0.0, length(uv - pp));
        float pFlicker = 0.5 + 0.5 * sin(t * 2.0 + ps * 5.0);
        deepCol += vec3(0.2, 0.4, 0.5) * pDot * pFlicker * 0.4;
    }

    // Blue vignette
    float vig = 1.0 - 0.5 * length(uv * 1.2);
    deepCol *= max(vig, 0.2);

    // Gamma correction
    deepCol = pow(clamp(deepCol, 0.0, 1.0), vec3(0.9));
    outColor = vec4(deepCol, 1.0);
}`
    },

    ocean: {
        name: "壬水 — 大洋",
        element: "水",
        desc: "広大な海。Gerstner波と独自大気散乱で描く水平線の風景。",
        code: `#version 300 es
// Original shader — no external code used
// Technique: Summed Gerstner waves + custom atmosphere + Fresnel reflection
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

// Gerstner wave: physically-based surface wave model
// Returns displacement.xz (horizontal) and .y (vertical)
vec3 gerstnerWave(vec2 pos, vec2 dir, float steepness, float wlen, float spd) {
    float k = 6.2831 / wlen;
    float phase = k * (dot(dir, pos) - spd * u_time);
    float a = steepness / k;
    return vec3(dir.x * a * cos(phase), a * sin(phase), dir.y * a * cos(phase));
}

// Sum multiple Gerstner waves for realistic ocean surface
float oceanHeight(vec2 pos) {
    vec3 disp = vec3(0.0);
    disp += gerstnerWave(pos, normalize(vec2(1.0, 0.3)), 0.15, 4.0, 1.2);
    disp += gerstnerWave(pos, normalize(vec2(-0.4, 1.0)), 0.12, 2.5, 0.9);
    disp += gerstnerWave(pos, normalize(vec2(0.7, -0.5)), 0.08, 1.8, 1.5);
    disp += gerstnerWave(pos, normalize(vec2(-0.2, -0.8)), 0.06, 1.2, 1.1);
    disp += gerstnerWave(pos, normalize(vec2(0.9, 0.7)), 0.04, 0.8, 1.8);
    return disp.y;
}

// Finite-difference surface normal
vec3 oceanNormal(vec2 pos, float eps) {
    float hC = oceanHeight(pos);
    float hR = oceanHeight(pos + vec2(eps, 0.0));
    float hU = oceanHeight(pos + vec2(0.0, eps));
    return normalize(vec3(hC - hR, eps, hC - hU));
}

// Independent atmosphere model based on Rayleigh principles
vec3 skyColor(vec3 rd, vec3 sunDir) {
    float horizon = 1.0 / (max(rd.y, 0.02) + 0.15);
    float sunDot = max(dot(rd, sunDir), 0.0);

    // Rayleigh-inspired sky gradient
    vec3 blue = vec3(0.22, 0.45, 0.85) * horizon * 0.12;
    // Mie-inspired sun halo
    float mie = pow(sunDot, 6.0) * 0.3;
    // Sun disk
    float sunDisk = pow(sunDot, 800.0) * 180.0;

    vec3 sunTint = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.5, 0.2),
                       1.0 / (sunDir.y * 8.0 + 1.5));
    return blue + sunTint * (mie + sunDisk);
}

void main() {
    vec2 uv = ((gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0)
             * vec2(u_resolution.x / u_resolution.y, 1.0);

    // Camera: auto-rotating, tilted down
    float camA = u_time * 0.06;
    float sa = sin(camA), ca = cos(camA);
    vec3 ray = normalize(vec3(uv.x, uv.y, 1.6));
    ray = vec3(ca * ray.x + sa * ray.z, ray.y, -sa * ray.x + ca * ray.z);
    float tilt = -0.28;
    float sT = sin(tilt), cT = cos(tilt);
    ray = vec3(ray.x, cT * ray.y - sT * ray.z, sT * ray.y + cT * ray.z);

    // Sun direction (slowly moving)
    vec3 sunDir = normalize(vec3(-0.1, 0.45 + 0.4 * sin(u_time * 0.15 + 2.0), 0.6));

    // Sky above horizon
    if (ray.y >= 0.0) {
        vec3 sky = skyColor(ray, sunDir);
        // Simple HDR tonemap
        sky = sky / (1.0 + sky);
        sky = pow(sky, vec3(0.45));
        outColor = vec4(sky, 1.0);
        return;
    }

    // Ray-plane intersection with ocean surface (y=0)
    vec3 camPos = vec3(u_time * 0.15, 1.4, 0.0);
    float tHit = -camPos.y / ray.y;
    vec2 hitXZ = camPos.xz + ray.xz * tHit;

    // Surface normal from Gerstner waves
    float distFade = min(1.0, 3.0 / tHit);
    vec3 N = oceanNormal(hitXZ, 0.02);
    N = mix(vec3(0.0, 1.0, 0.0), N, distFade);

    // Fresnel (Schlick approximation)
    float cosTheta = max(dot(-ray, N), 0.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 5.0);

    // Reflection color
    vec3 refl = reflect(ray, N);
    refl.y = abs(refl.y);
    vec3 reflCol = skyColor(refl, sunDir);

    // Subsurface scattering color
    vec3 scatter = vec3(0.0, 0.04, 0.09) * (1.0 + oceanHeight(hitXZ) * 0.5);

    // Final water color
    vec3 waterCol = fresnel * reflCol + (1.0 - fresnel) * scatter;

    // Distance fog towards horizon
    float fogFactor = 1.0 - exp(-tHit * 0.008);
    vec3 fogCol = skyColor(vec3(ray.x, 0.01, ray.z), sunDir) * 0.5;
    waterCol = mix(waterCol, fogCol, fogFactor);

    // Tonemap
    waterCol = waterCol / (1.0 + waterCol);
    waterCol = pow(waterCol, vec3(0.45));
    outColor = vec4(waterCol, 1.0);
}`
    },

    starship: {
        name: "丙火 — 流星",
        element: "火",
        desc: "流星群。個々の流星が軌跡を描きながら宇宙を駆ける壮大な火の表現。",
        code: `#version 300 es
// Original shader — no external code used
// Technique: Hash-based meteor trajectories + glow trails
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

// Original hash
float mHash(float n) { return fract(sin(n * 73.137) * 43758.5); }
vec2 mHash2(float n) { return vec2(mHash(n), mHash(n + 37.91)); }

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    float t = u_time;

    // Star field background
    vec3 col = vec3(0.0);
    vec2 starGrid = floor(uv * 80.0);
    float starBright = pow(mHash(dot(starGrid, vec2(13.7, 91.3))), 28.0);
    float starTwinkle = 0.5 + 0.5 * sin(t * 3.0 + mHash(starGrid.x + starGrid.y * 77.0) * 20.0);
    col += starBright * starTwinkle * 0.6;

    // Background nebula glow
    float nebula = sin(uv.x * 1.5 + t * 0.02) * cos(uv.y * 2.0 - t * 0.01) * 0.5 + 0.5;
    col += vec3(0.02, 0.01, 0.04) * nebula;

    // Meteors: each has unique trajectory, speed, color
    for (float i = 0.0; i < 24.0; i++) {
        vec2 seed = mHash2(i * 17.31);
        float speed = 0.4 + seed.x * 0.8;
        float angle = -0.6 - seed.y * 0.5; // falling angle
        vec2 dir = vec2(cos(angle), sin(angle));

        // Meteor origin cycles periodically
        float cycle = mod(t * speed + seed.x * 10.0, 4.0);
        vec2 origin = vec2(
            mix(-1.5, 1.5, mHash(i * 3.71)),
            mix(0.3, 1.2, mHash(i * 5.13))
        );
        vec2 pos = origin + dir * cycle;

        // Distance from UV to meteor trail line segment
        vec2 toUV = uv - pos;
        float proj = clamp(dot(toUV, -dir), 0.0, 0.5 + seed.y * 0.3); // trail length
        vec2 closest = pos - dir * (-proj); // oops fix
        vec2 nearPt = uv - (pos + dir * (-proj));
        float dist = length(uv - (pos - dir * proj));

        // Head glow
        float headGlow = exp(-dist * dist * 800.0);

        // Trail fade along length
        float trailDist = length(uv - (pos - dir * proj * 0.5));
        float trail = exp(-trailDist * trailDist * 200.0) * (1.0 - proj / 0.8);

        // Meteor color (warm: white → orange → red)
        float warmth = seed.x;
        vec3 mCol = mix(
            vec3(1.0, 0.85, 0.6),
            vec3(1.0, 0.4, 0.1),
            warmth
        );

        // Flicker
        float flicker = 0.7 + 0.3 * sin(t * 8.0 + i * 11.0);

        // Visibility mask (only during active part of cycle)
        float vis = smoothstep(0.0, 0.3, cycle) * smoothstep(3.5, 2.5, cycle);

        col += mCol * (headGlow * 2.0 + trail * 0.8) * flicker * vis;
    }

    // Slight vignette
    col *= 1.0 - 0.3 * length(uv * 0.7);

    outColor = vec4(col, 1.0);
}`
    },

    singularity_gold: {
        name: "辛金 — 黄金渦",
        element: "金",
        desc: "渦巻く特異点。対数螺旋の降着円盤が光を歪める黄金の輝き。",
        code: `#version 300 es
// Original shader — no external code used
// Technique: Log-spiral accretion disk + gravitational lensing + fbm turbulence
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float gHash(vec2 p) {
    return fract(sin(dot(p, vec2(61.7, 157.3))) * 3791.74);
}

float gNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(gHash(i), gHash(i + vec2(1, 0)), f.x),
        mix(gHash(i + vec2(0, 1)), gHash(i + vec2(1, 1)), f.x), f.y);
}

float gFbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(0.87, 0.48, -0.48, 0.87);
    for (int i = 0; i < 5; i++) {
        v += a * gNoise(p);
        p = m * p * 2.15;
        a *= 0.48;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    float t = u_time;

    // Polar coordinates
    float r = length(uv);
    float theta = atan(uv.y, uv.x);

    // Gravitational lensing distortion (original formula)
    float schwarz = 0.12; // event horizon radius
    float lensR = r + schwarz * schwarz / (r + 0.01);
    float lensTheta = theta + 0.3 / (r + 0.05);

    // Log-spiral accretion disk
    float spiral = sin(log(lensR + 0.5) * 6.0 - lensTheta * 3.0 + t * 0.8);
    float spiral2 = sin(log(lensR + 0.3) * 4.0 + lensTheta * 2.0 - t * 0.5);

    // Disk shape: ring with falloff
    float diskMask = exp(-pow(r - 0.55, 2.0) * 8.0) + exp(-pow(r - 0.35, 2.0) * 12.0) * 0.5;
    diskMask *= smoothstep(schwarz, schwarz + 0.08, r); // fade at event horizon

    // Turbulence in the disk
    vec2 turbUV = vec2(lensTheta * 2.0 + t * 0.2, lensR * 5.0);
    float turb = gFbm(turbUV * 2.0);

    // Combine disk features
    float disk = (spiral * 0.5 + spiral2 * 0.3 + turb * 0.4) * diskMask;
    disk = max(disk, 0.0);

    // Gold color palette
    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.78, 0.3) * disk * 1.5;
    col += vec3(1.0, 0.55, 0.1) * pow(disk, 2.0) * 2.0;
    col += vec3(1.0, 0.95, 0.7) * pow(disk, 5.0) * 3.0;

    // Black hole center (event horizon)
    float hole = smoothstep(schwarz + 0.02, schwarz - 0.01, r);
    col *= 1.0 - hole;

    // Gravitational glow around event horizon
    float edgeGlow = exp(-pow(r - schwarz, 2.0) * 300.0);
    col += vec3(1.0, 0.7, 0.2) * edgeGlow * 0.8;

    // Relativistic jet (faint vertical beam)
    float jet = exp(-uv.x * uv.x * 200.0) * smoothstep(0.2, 0.8, abs(uv.y));
    col += vec3(0.6, 0.5, 0.3) * jet * 0.15;

    // Background stars
    vec2 sg = floor(uv * 60.0);
    float star = pow(gHash(sg), 30.0) * 0.3;
    col += star * (1.0 - diskMask * 2.0);

    // Tonemap
    col = col / (1.0 + col);
    col = pow(col, vec3(0.85));
    outColor = vec4(col, 1.0);
}`
    },

    cold_lake: {
        name: "癸水 — 寒湖",
        element: "水",
        desc: "冬の湖。微小波紋が映す静寂な空と薄氷の光。",
        code: `#version 300 es
// Original shader — no external code used
// Technique: Planar ray intersection + micro-ripple normal map + winter atmosphere
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float lHash(vec2 p) {
    return fract(sin(dot(p, vec2(53.71, 117.93))) * 4519.37);
}

float lNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(lHash(i), lHash(i + vec2(1, 0)), f.x),
        mix(lHash(i + vec2(0, 1)), lHash(i + vec2(1, 1)), f.x), f.y);
}

float lFbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(0.82, 0.57, -0.57, 0.82);
    for (int i = 0; i < 5; i++) {
        v += a * lNoise(p);
        p = m * p * 2.05;
        a *= 0.5;
    }
    return v;
}

// Winter sky dome
vec3 winterSky(vec3 rd) {
    float y = rd.y * 0.5 + 0.5;
    // Overcast winter gradient
    vec3 low = vec3(0.55, 0.58, 0.65);
    vec3 high = vec3(0.35, 0.40, 0.52);
    vec3 sky = mix(low, high, y);

    // Pale sun through clouds
    vec3 sunDir = normalize(vec3(0.4, 0.25, 0.6));
    float sunDot = max(dot(rd, sunDir), 0.0);
    sky += vec3(0.3, 0.28, 0.25) * pow(sunDot, 16.0);
    sky += vec3(0.8, 0.75, 0.7) * pow(sunDot, 200.0) * 2.0;

    // Cloud layer
    if (rd.y > 0.0) {
        vec2 cloudUV = rd.xz / (rd.y + 0.15) * 2.0;
        float cloud = lFbm(cloudUV + u_time * 0.01);
        sky = mix(sky, vec3(0.7, 0.72, 0.75), cloud * 0.4);
    }

    return sky;
}

// Distant treeline silhouette
vec3 treeline(vec3 rd) {
    if (rd.y > 0.05 || rd.y < -0.02) return winterSky(rd);
    float x = atan(rd.x, rd.z) * 3.0;
    float treeH = 0.02 + 0.015 * lNoise(vec2(x * 5.0, 0.0))
                + 0.008 * lNoise(vec2(x * 15.0, 1.0));
    float tree = smoothstep(treeH, treeH - 0.005, rd.y);
    vec3 treeCol = vec3(0.08, 0.1, 0.08);
    return mix(winterSky(rd), treeCol, tree);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y;
    float t = u_time;

    // Camera: slowly rotating, looking slightly down
    float camA = t * 0.08;
    float sa = sin(camA), ca = cos(camA);
    vec3 rd = normalize(vec3(uv.x, uv.y + 0.1, 1.5));
    rd = vec3(ca * rd.x + sa * rd.z, rd.y, -sa * rd.x + ca * rd.z);

    vec3 col = treeline(rd);

    // Lake surface at y = 0
    if (rd.y < 0.0) {
        vec3 camPos = vec3(0.0, 0.6, 0.0);
        float tHit = -camPos.y / rd.y;
        vec2 hitXZ = camPos.xz + rd.xz * tHit;

        // Micro-ripple normal (original summed sine approach)
        vec2 wp = hitXZ;
        float nx = 0.0, nz = 0.0;
        for (float i = 0.0; i < 6.0; i++) {
            float freq = 3.0 + i * 2.5;
            float phase = t * (0.3 + i * 0.1);
            float angle = i * 2.39996; // golden angle
            vec2 dir = vec2(cos(angle), sin(angle));
            float wave = dot(wp, dir) * freq + phase;
            float dw = cos(wave) * freq * 0.003 / (1.0 + i * 0.4);
            nx += dw * dir.x;
            nz += dw * dir.y;
        }
        vec3 N = normalize(vec3(-nx, 1.0, -nz));

        // Fresnel reflection
        float cosA = max(dot(-rd, N), 0.0);
        float fresnel = 0.06 + 0.94 * pow(1.0 - cosA, 5.0);

        // Reflection
        vec3 refl = reflect(rd, N);
        refl.y = abs(refl.y);
        vec3 reflCol = treeline(refl);

        // Dark water underneath
        vec3 waterDeep = vec3(0.03, 0.06, 0.08);

        // Ice-like specular patches
        float ice = lFbm(hitXZ * 3.0) * lFbm(hitXZ * 7.0 + 5.0);
        float icePatch = smoothstep(0.15, 0.35, ice);

        vec3 waterCol = mix(waterDeep, reflCol, fresnel);
        waterCol = mix(waterCol, vec3(0.6, 0.65, 0.7), icePatch * 0.3);

        // Distance fog into the lake
        float fog = 1.0 - exp(-tHit * 0.06);
        vec3 fogCol = treeline(vec3(rd.x, 0.01, rd.z)) * 0.6;
        waterCol = mix(waterCol, fogCol, fog);

        col = waterCol;
    }

    // Gentle vignette
    col *= 0.85 + 0.15 * (1.0 - length(uv * 0.6));
    col = pow(clamp(col, 0.0, 1.0), vec3(0.95));
    outColor = vec4(col, 1.0);
}`
    },
};

// ========================================
// ShaderCanvas コンポーネント
// ========================================
const ShaderCanvas: React.FC<{ fragmentShader: string }> = ({ fragmentShader }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2');
        if (!gl) return;

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShaderObj = createShader(gl.FRAGMENT_SHADER, fragmentShader);
        if (!vertexShader || !fragmentShaderObj) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShaderObj);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'position');
        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        const timeLoc = gl.getUniformLocation(program, 'u_time');

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        let animationFrameId: number;

        const render = (time: number) => {
            time *= 0.001;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
            gl.useProgram(program);
            gl.bindVertexArray(vao);
            gl.uniform2f(resolutionLoc, w, h);
            gl.uniform1f(timeLoc, time);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShaderObj);
            gl.deleteBuffer(positionBuffer);
            gl.deleteVertexArray(vao);
        };
    }, [fragmentShader]);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// ========================================
// 六十花甲子 マッピング
// ========================================

type KanshiEntry = {
    num: number;
    kanshi: string;
    tenkan: string;
    chishi: string;
    tenkanGogyo: string;
    chishiGogyo: string;
    relation: string;
    shaderKey: string;
    description: string;
};

const rokujuKanshi: KanshiEntry[] = [
    { num: 1, kanshi: '甲子', tenkan: '甲', chishi: '子', tenkanGogyo: '木', chishiGogyo: '水', relation: '相生', shaderKey: 'wood', description: '水から芽生える大樹' },
    { num: 2, kanshi: '乙丑', tenkan: '乙', chishi: '丑', tenkanGogyo: '木', chishiGogyo: '土', relation: '相剋', shaderKey: 'bamboo', description: '土を突き破る草花' },
    { num: 3, kanshi: '丙寅', tenkan: '丙', chishi: '寅', tenkanGogyo: '火', chishiGogyo: '木', relation: '相生', shaderKey: 'starship', description: '森林の炎' },
    { num: 4, kanshi: '丁卯', tenkan: '丁', chishi: '卯', tenkanGogyo: '火', chishiGogyo: '木', relation: '相生', shaderKey: 'candle', description: '花畑に射す夕陽' },
    { num: 5, kanshi: '戊辰', tenkan: '戊', chishi: '辰', tenkanGogyo: '土', chishiGogyo: '土', relation: '比和', shaderKey: 'earth', description: '巨大な山岳' },
    { num: 6, kanshi: '己巳', tenkan: '己', chishi: '巳', tenkanGogyo: '土', chishiGogyo: '火', relation: '相生', shaderKey: 'mudwater', description: '火山の溶岩台地' },
    { num: 7, kanshi: '庚午', tenkan: '庚', chishi: '午', tenkanGogyo: '金', chishiGogyo: '火', relation: '相剋', shaderKey: 'metal', description: '鍛冶の炎' },
    { num: 8, kanshi: '辛未', tenkan: '辛', chishi: '未', tenkanGogyo: '金', chishiGogyo: '土', relation: '相生', shaderKey: 'singularity_gold', description: '砂漠の宝石' },
    { num: 9, kanshi: '壬申', tenkan: '壬', chishi: '申', tenkanGogyo: '水', chishiGogyo: '金', relation: '相生', shaderKey: 'falls', description: '金属の滝' },
    { num: 10, kanshi: '癸酉', tenkan: '癸', chishi: '酉', tenkanGogyo: '水', chishiGogyo: '金', relation: '相生', shaderKey: 'cold_lake', description: '朝露に映る月光' },
    { num: 11, kanshi: '甲戌', tenkan: '甲', chishi: '戌', tenkanGogyo: '木', chishiGogyo: '土', relation: '相剋', shaderKey: 'wood', description: '荒野の孤木' },
    { num: 12, kanshi: '乙亥', tenkan: '乙', chishi: '亥', tenkanGogyo: '木', chishiGogyo: '水', relation: '相生', shaderKey: 'bamboo', description: '水辺の柳' },
    { num: 13, kanshi: '丙子', tenkan: '丙', chishi: '子', tenkanGogyo: '火', chishiGogyo: '水', relation: '相剋', shaderKey: 'angel', description: '嵐の中の灯台' },
    { num: 14, kanshi: '丁丑', tenkan: '丁', chishi: '丑', tenkanGogyo: '火', chishiGogyo: '土', relation: '相生', shaderKey: 'lanterns', description: '焚き火の夜' },
    { num: 15, kanshi: '戊寅', tenkan: '戊', chishi: '寅', tenkanGogyo: '土', chishiGogyo: '木', relation: '相剋', shaderKey: 'earth', description: '森の中の断崖' },
    { num: 16, kanshi: '己卯', tenkan: '己', chishi: '卯', tenkanGogyo: '土', chishiGogyo: '木', relation: '相剋', shaderKey: 'mudwater', description: '庭園の石畳' },
    { num: 17, kanshi: '庚辰', tenkan: '庚', chishi: '辰', tenkanGogyo: '金', chishiGogyo: '土', relation: '相生', shaderKey: 'metal', description: '鉱山の洞窟' },
    { num: 18, kanshi: '辛巳', tenkan: '辛', chishi: '巳', tenkanGogyo: '金', chishiGogyo: '火', relation: '相剋', shaderKey: 'singularity_gold', description: '溶鉱炉' },
    { num: 19, kanshi: '壬午', tenkan: '壬', chishi: '午', tenkanGogyo: '水', chishiGogyo: '火', relation: '相剋', shaderKey: 'ocean', description: '蒸気の海' },
    { num: 20, kanshi: '癸未', tenkan: '癸', chishi: '未', tenkanGogyo: '水', chishiGogyo: '土', relation: '相剋', shaderKey: 'ocean_deep', description: '泥水の流れ' },
    { num: 21, kanshi: '甲申', tenkan: '甲', chishi: '申', tenkanGogyo: '木', chishiGogyo: '金', relation: '相剋', shaderKey: 'wood', description: '斧で切られた木' },
    { num: 22, kanshi: '乙酉', tenkan: '乙', chishi: '酉', tenkanGogyo: '木', chishiGogyo: '金', relation: '相剋', shaderKey: 'bamboo', description: '鋏で整えた盆栽' },
    { num: 23, kanshi: '丙戌', tenkan: '丙', chishi: '戌', tenkanGogyo: '火', chishiGogyo: '土', relation: '相生', shaderKey: 'horizon', description: '砂漠の太陽' },
    { num: 24, kanshi: '丁亥', tenkan: '丁', chishi: '亥', tenkanGogyo: '火', chishiGogyo: '水', relation: '相剋', shaderKey: 'fire_candle', description: '深海の熱水噴出孔' },
    { num: 25, kanshi: '戊子', tenkan: '戊', chishi: '子', tenkanGogyo: '土', chishiGogyo: '水', relation: '相剋', shaderKey: 'earth', description: '堤防' },
    { num: 26, kanshi: '己丑', tenkan: '己', chishi: '丑', tenkanGogyo: '土', chishiGogyo: '土', relation: '比和', shaderKey: 'mudwater', description: '広大な平原' },
    { num: 27, kanshi: '庚寅', tenkan: '庚', chishi: '寅', tenkanGogyo: '金', chishiGogyo: '木', relation: '相剋', shaderKey: 'metal', description: '鉄の柵に絡む蔦' },
    { num: 28, kanshi: '辛卯', tenkan: '辛', chishi: '卯', tenkanGogyo: '金', chishiGogyo: '木', relation: '相剋', shaderKey: 'singularity_gold', description: '花瓶の中の花' },
    { num: 29, kanshi: '壬辰', tenkan: '壬', chishi: '辰', tenkanGogyo: '水', chishiGogyo: '土', relation: '相剋', shaderKey: 'ocean', description: 'ダムの貯水' },
    { num: 30, kanshi: '癸巳', tenkan: '癸', chishi: '巳', tenkanGogyo: '水', chishiGogyo: '火', relation: '相剋', shaderKey: 'cold_lake', description: '温泉の湯気' },
    { num: 31, kanshi: '甲午', tenkan: '甲', chishi: '午', tenkanGogyo: '木', chishiGogyo: '火', relation: '相生', shaderKey: 'wood', description: '篝火の周りの森' },
    { num: 32, kanshi: '乙未', tenkan: '乙', chishi: '未', tenkanGogyo: '木', chishiGogyo: '土', relation: '相剋', shaderKey: 'bamboo', description: '畑の苗' },
    { num: 33, kanshi: '丙申', tenkan: '丙', chishi: '申', tenkanGogyo: '火', chishiGogyo: '金', relation: '相剋', shaderKey: 'starship', description: '赤い溶岩と金属鉱石' },
    { num: 34, kanshi: '丁酉', tenkan: '丁', chishi: '酉', tenkanGogyo: '火', chishiGogyo: '金', relation: '相剋', shaderKey: 'candle', description: '燭台の炎' },
    { num: 35, kanshi: '戊戌', tenkan: '戊', chishi: '戌', tenkanGogyo: '土', chishiGogyo: '土', relation: '比和', shaderKey: 'earth', description: '城壁' },
    { num: 36, kanshi: '己亥', tenkan: '己', chishi: '亥', tenkanGogyo: '土', chishiGogyo: '水', relation: '相剋', shaderKey: 'mudwater', description: '雨後の畑' },
    { num: 37, kanshi: '庚子', tenkan: '庚', chishi: '子', tenkanGogyo: '金', chishiGogyo: '水', relation: '相生', shaderKey: 'metal', description: '氷の結晶' },
    { num: 38, kanshi: '辛丑', tenkan: '辛', chishi: '丑', tenkanGogyo: '金', chishiGogyo: '土', relation: '相生', shaderKey: 'singularity_gold', description: '化石' },
    { num: 39, kanshi: '壬寅', tenkan: '壬', chishi: '寅', tenkanGogyo: '水', chishiGogyo: '木', relation: '相生', shaderKey: 'falls', description: '渓流' },
    { num: 40, kanshi: '癸卯', tenkan: '癸', chishi: '卯', tenkanGogyo: '水', chishiGogyo: '木', relation: '相生', shaderKey: 'cold_lake', description: '朝露の草原' },
    { num: 41, kanshi: '甲辰', tenkan: '甲', chishi: '辰', tenkanGogyo: '木', chishiGogyo: '土', relation: '相剋', shaderKey: 'wood', description: '巨木の根が岩を割る' },
    { num: 42, kanshi: '乙巳', tenkan: '乙', chishi: '巳', tenkanGogyo: '木', chishiGogyo: '火', relation: '相生', shaderKey: 'bamboo', description: '蛍の森' },
    { num: 43, kanshi: '丙午', tenkan: '丙', chishi: '午', tenkanGogyo: '火', chishiGogyo: '火', relation: '比和', shaderKey: 'fire', description: '真夏の太陽' },
    { num: 44, kanshi: '丁未', tenkan: '丁', chishi: '未', tenkanGogyo: '火', chishiGogyo: '土', relation: '相生', shaderKey: 'lanterns', description: '夕焼けの丘' },
    { num: 45, kanshi: '戊申', tenkan: '戊', chishi: '申', tenkanGogyo: '土', chishiGogyo: '金', relation: '相生', shaderKey: 'earth', description: '金鉱山' },
    { num: 46, kanshi: '己酉', tenkan: '己', chishi: '酉', tenkanGogyo: '土', chishiGogyo: '金', relation: '相生', shaderKey: 'mudwater', description: '陶器' },
    { num: 47, kanshi: '庚戌', tenkan: '庚', chishi: '戌', tenkanGogyo: '金', chishiGogyo: '土', relation: '相生', shaderKey: 'metal', description: '鎧' },
    { num: 48, kanshi: '辛亥', tenkan: '辛', chishi: '亥', tenkanGogyo: '金', chishiGogyo: '水', relation: '相生', shaderKey: 'singularity_gold', description: '雪の結晶' },
    { num: 49, kanshi: '壬子', tenkan: '壬', chishi: '子', tenkanGogyo: '水', chishiGogyo: '水', relation: '比和', shaderKey: 'ocean', description: '大海原' },
    { num: 50, kanshi: '癸丑', tenkan: '癸', chishi: '丑', tenkanGogyo: '水', chishiGogyo: '土', relation: '相剋', shaderKey: 'ocean_deep', description: '霧の湿原' },
    { num: 51, kanshi: '甲寅', tenkan: '甲', chishi: '寅', tenkanGogyo: '木', chishiGogyo: '木', relation: '比和', shaderKey: 'wood', description: '原生林' },
    { num: 52, kanshi: '乙卯', tenkan: '乙', chishi: '卯', tenkanGogyo: '木', chishiGogyo: '木', relation: '比和', shaderKey: 'bamboo', description: '花園' },
    { num: 53, kanshi: '丙辰', tenkan: '丙', chishi: '辰', tenkanGogyo: '火', chishiGogyo: '土', relation: '相生', shaderKey: 'horizon', description: '火山の噴火' },
    { num: 54, kanshi: '丁巳', tenkan: '丁', chishi: '巳', tenkanGogyo: '火', chishiGogyo: '火', relation: '比和', shaderKey: 'fire_candle', description: '蝋燭の灯が無数に' },
    { num: 55, kanshi: '戊午', tenkan: '戊', chishi: '午', tenkanGogyo: '土', chishiGogyo: '火', relation: '相生', shaderKey: 'earth', description: '溶岩が固まった大地' },
    { num: 56, kanshi: '己未', tenkan: '己', chishi: '未', tenkanGogyo: '土', chishiGogyo: '土', relation: '比和', shaderKey: 'mudwater', description: '田園風景' },
    { num: 57, kanshi: '庚申', tenkan: '庚', chishi: '申', tenkanGogyo: '金', chishiGogyo: '金', relation: '比和', shaderKey: 'metal', description: '鉄壁' },
    { num: 58, kanshi: '辛酉', tenkan: '辛', chishi: '酉', tenkanGogyo: '金', chishiGogyo: '金', relation: '比和', shaderKey: 'singularity_gold', description: 'ダイヤモンド' },
    { num: 59, kanshi: '壬戌', tenkan: '壬', chishi: '戌', tenkanGogyo: '水', chishiGogyo: '土', relation: '相剋', shaderKey: 'ocean', description: '大河の堤' },
    { num: 60, kanshi: '癸亥', tenkan: '癸', chishi: '亥', tenkanGogyo: '水', chishiGogyo: '水', relation: '比和', shaderKey: 'cold_lake', description: '冬の海' },
];

// ========================================
// メインページ
// ========================================
export default function ShaderGallery() {
    const [activeShader, setActiveShader] = useState<string>('water');
    const [viewMode, setViewMode] = useState<'shaders' | 'kanshi'>('shaders');
    const [selectedKanshi, setSelectedKanshi] = useState<KanshiEntry | null>(null);
    const [filterElement, setFilterElement] = useState<string | null>(null);
    const current = shaders[activeShader];

    const elementColors: Record<string, string> = {
        '水': 'bg-blue-600',
        '火': 'bg-red-600',
        '木': 'bg-green-600',
        '土': 'bg-amber-700',
        '金': 'bg-purple-600',
    };

    const elementTextColors: Record<string, string> = {
        '水': 'text-blue-400',
        '火': 'text-red-400',
        '木': 'text-green-400',
        '土': 'text-amber-400',
        '金': 'text-purple-400',
    };

    const elementBorderColors: Record<string, string> = {
        '水': 'border-blue-500/30',
        '火': 'border-red-500/30',
        '木': 'border-green-500/30',
        '土': 'border-amber-500/30',
        '金': 'border-purple-500/30',
    };

    const relationColors: Record<string, string> = {
        '相生': 'text-emerald-400',
        '相剋': 'text-orange-400',
        '比和': 'text-yellow-300',
    };

    const handleKanshiClick = (entry: KanshiEntry) => {
        setSelectedKanshi(entry);
        setActiveShader(entry.shaderKey);
    };

    const filteredKanshi = filterElement
        ? rokujuKanshi.filter(k => k.tenkanGogyo === filterElement)
        : rokujuKanshi;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* シェーダー表示エリア */}
            <div className="relative w-full h-[60vh]">
                <ShaderCanvas fragmentShader={current.code} />

                {/* オーバーレイ情報 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${elementColors[current.element]}`}>
                            {current.element}
                        </span>
                        <h2 className="text-2xl font-light tracking-wider">{current.name}</h2>
                        {selectedKanshi && (
                            <span className="px-3 py-1 rounded-full text-xs border border-white/20 bg-white/5">
                                #{selectedKanshi.num} {selectedKanshi.kanshi}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 text-sm max-w-xl">
                        {selectedKanshi ? `${selectedKanshi.description} — ${current.desc}` : current.desc}
                    </p>
                    {selectedKanshi && (
                        <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className={elementTextColors[selectedKanshi.tenkanGogyo]}>
                                天干: {selectedKanshi.tenkan}({selectedKanshi.tenkanGogyo})
                            </span>
                            <span className={elementTextColors[selectedKanshi.chishiGogyo]}>
                                地支: {selectedKanshi.chishi}({selectedKanshi.chishiGogyo})
                            </span>
                            <span className={relationColors[selectedKanshi.relation]}>
                                {selectedKanshi.relation}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ビュー切替タブ */}
            <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-white/10">
                <button
                    onClick={() => setViewMode('shaders')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'shaders'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    シェーダー一覧
                </button>
                <button
                    onClick={() => setViewMode('kanshi')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'kanshi'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    六十花甲子
                </button>
            </div>

            {viewMode === 'shaders' ? (
                /* シェーダー一覧 */
                <div className="p-6">
                    <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-4">全シェーダー ({Object.keys(shaders).length})</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                        {Object.entries(shaders).map(([key, shader]) => (
                            <button
                                key={key}
                                onClick={() => { setActiveShader(key); setSelectedKanshi(null); }}
                                className={`p-3 rounded-xl border transition-all duration-300 text-left ${activeShader === key
                                    ? `border-white/40 bg-white/10 ring-1 ring-white/20`
                                    : `border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20`
                                    }`}
                            >
                                <span className={`inline-block w-2 h-2 rounded-full mb-2 ${elementColors[shader.element]}`} />
                                <div className="text-sm font-medium">{shader.element}</div>
                                <div className="text-[10px] text-gray-500 mt-1 leading-tight">{shader.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* 六十花甲子 グリッド */
                <div className="p-6">
                    {/* 五行フィルター */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-500 text-xs mr-2">五行:</span>
                        <button
                            onClick={() => setFilterElement(null)}
                            className={`px-3 py-1 rounded-full text-xs border transition-all ${!filterElement
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'border-white/10 text-gray-500 hover:text-white'
                                }`}
                        >
                            全て
                        </button>
                        {['木', '火', '土', '金', '水'].map(el => (
                            <button
                                key={el}
                                onClick={() => setFilterElement(filterElement === el ? null : el)}
                                className={`px-3 py-1 rounded-full text-xs border transition-all ${filterElement === el
                                    ? `${elementColors[el]} border-transparent text-white`
                                    : `border-white/10 ${elementTextColors[el]} hover:border-white/20`
                                    }`}
                            >
                                {el}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                        {filteredKanshi.map(entry => {
                            const isActive = selectedKanshi?.num === entry.num;
                            return (
                                <button
                                    key={entry.num}
                                    onClick={() => handleKanshiClick(entry)}
                                    className={`relative p-2 rounded-lg border transition-all duration-200 text-center ${isActive
                                        ? `${elementBorderColors[entry.tenkanGogyo]} bg-white/10 ring-1 ring-white/20`
                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/15'
                                        }`}
                                >
                                    <div className="text-[10px] text-gray-600 mb-0.5">#{entry.num}</div>
                                    <div className={`text-sm font-medium ${isActive ? elementTextColors[entry.tenkanGogyo] : 'text-gray-300'}`}>
                                        {entry.kanshi}
                                    </div>
                                    <div className="flex justify-center gap-0.5 mt-1">
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${elementColors[entry.tenkanGogyo]}`} />
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${elementColors[entry.chishiGogyo]}`} />
                                    </div>
                                    <div className={`text-[8px] mt-1 ${relationColors[entry.relation]}`}>
                                        {entry.relation}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 凡例 */}
                    <div className="mt-6 flex items-center gap-6 text-[10px] text-gray-500 border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/60" />
                            相生（調和）
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-400/60" />
                            相剋（対比）
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-300/60" />
                            比和（強化）
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

