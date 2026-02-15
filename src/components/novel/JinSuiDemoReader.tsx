'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* no49.tsx と同一のシェーダー（一字一句） */
const vsSource = `#version 300 es
in vec4 position;
void main() {
    gl_Position = position;
}`;

const fsSource = `#version 300 es
precision highp float;

uniform vec2 r; // Resolution
uniform float t; // Time
out vec4 outColor; // Output

void main() {
    vec4 FC = gl_FragCoord;
    vec4 o = vec4(0.0);
    float z=0., d=0., i=0.;

    // Code Golf Shader Logic
    for(i=0.; i++ < 5e1; z += d, o += (.9 + sin(i * .1 - vec4(6, 1, 2, 0))) / d / d / z + d * z / vec4(4, 2, 1, 0)) {
        vec3 p = z * normalize(FC.rgb * 2. - r.xyx);
        for(d = 0.; d++ < 9.;) {
            p += .4 * sin(p.yzx * d - z + t + i) / d + .5;
        }
        d = length(vec4(abs(p.y + p.z * .5), sin(p - z) / 7.)) / (4. + z * z / 1e2);
    }
    o = tanh(o / 2e3);

    outColor = vec4(o.rgb, 1.0);
}`;

function ShaderBackground() {
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
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'r');
    const timeUniformLocation = gl.getUniformLocation(program, 't');

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    let animationFrameId: number;

    const render = (time: number) => {
      time *= 0.001;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeUniformLocation, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />;
}

/* no49.tsx と同一の本文・レイアウト（フォントのみ Shippori Mincho 継承） */
export function JinSuiDemoReader() {
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const progress = Math.min(scrollTop / Math.max(maxScroll, 1), 1.0);
    const newOpacity = Math.max(0.1, 1.0 - progress * 1.1);
    setOverlayOpacity(newOpacity);
  };

  return (
    <div className="absolute inset-0 w-full h-full min-h-[100dvh]">
      <ShaderBackground />

      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 ease-out z-10"
        style={{ opacity: overlayOpacity }}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full overflow-y-auto scroll-smooth z-20 text-gray-100"
      >
        <div className="px-6 py-16 pb-32">
          <div style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.8)' }}>
            <nav className="mb-8">
              <Link href="/novel" className="text-sm text-gray-400 hover:text-gray-200">
                ← 一覧へ
              </Link>
            </nav>

            <h1 className="text-2xl text-center mb-12 tracking-widest font-light border-b border-white/30 pb-4 inline-block px-4 mx-auto w-full">
              大河の譲歩
            </h1>
            <div className="text-right text-sm opacity-90 mb-16 mr-2">海原洋介</div>

            <div className="space-y-10 text-sm leading-loose text-justify tracking-wide">
              <p>海は、いつも同じだった。<br />波が寄せては返し、空を映して、果てしなく広がる。その絶対的な質量は、人の営みなど歯牙にもかけない。</p>
              <p>海原洋介は、三十七歳。フリージャーナリストとして、十年以上、世界中の海を渡ってきた。</p>
              <p>バンコクの湿り気を帯びた熱風、雑踏の匂い。チャオプラヤ川の濁流を眺めながら、安宿の硬いベッドで原稿を書いた夜があった。あるいは、ケープタウンのテーブルマウンテンから吹き下ろす乾燥した風。インド洋と大西洋が交わる岬で、ただ荒波の音だけを聞いていた朝もあった。</p>
              <p>東南アジアの密林、中東の砂漠、北欧の凍てつく港町。カメラとノートを持って、どこへでも飛んだ。取材対象の懐に飛び込み、地酒を酌み交わし、時には命の危険すら感じながらシャッターを切る。それが生きている証だと信じていた。</p>
              <p>だが、ふとした瞬間に訪れる静寂が怖かった。<br />空港の出発ロビーで、行き交う家族連れや恋人たちを見る時。現像した写真の中に、自分以外の誰かの「生活」が鮮やかに焼き付いているのを見る時。<br />自分だけが、どの風景からも切り離されているように感じた。どこにいても異邦人であり、どこにも根を下ろせない浮草のようだった。</p>
              <p>帰国しても、東京のワンルームマンションはただの荷物置き場でしかなかった。郵便受けに溜まったチラシを捨て、また次のチケットを予約する。その繰り返しだ。</p>
              <p>「居場所が、欲しいのかもしれない」</p>
              <p>柄にもなくそう呟いて、洋介は吸い寄せられるようにその扉を叩いた。東京・下落合。路地裏の古いアパートの一室にある、『九条運命診断室』。</p>
              <p>「生年月日を」</p>
              <p>九条巡が、静かに聞く。窓の外には梅雨の曇り空が広がっていた。雨音が、遠い潮騒のように聞こえる。</p>
              <p>「1989年12月8日です」</p>
              <p>洋介は答えた。パスポートのスタンプだらけのバッグを、足元に置いている。その革は擦り切れ、潮風と砂埃の匂いが染み付いているようだった。</p>
              <p>巡は万年暦を繰る。指先が、紙の上を滑る。<br />己巳（つちのとみ）年、丙子（ひのえね）月、壬子（みずのえね）日。</p>
              <p>──壬子。<br />上下ともに水性。冬の海。汪溢（おういつ）──水が満ちあふれる。</p>
              <p>「海原さん」</p>
              <p>巡は顔を上げた。その瞳は、深海のように静かだった。</p>
              <p>「あなたの日干は『壬（みずのえ）』。陽の水です。大河であり、海です」</p>
              <p>洋介は黙って聞いている。</p>
              <p>「壬子は、十二支の中で最も水の力が強い組み合わせ。冬の海──計り知れない広さと深さを持っています。天将星を所有し、新しい物事を創り上げる力がある。破壊と創造、その両方を内包する激しいエネルギーの持ち主です」</p>
              <p>「それで、居場所がないんですか」</p>
              <p>洋介の声には、諦めにも似た自嘲が混じっていた。</p>
              <p>「世界中を飛び回って、取材して、記事を書いて。でも、どのホテルに泊まっても、『帰る』という感覚がない。友人も恋人も、長くは続かない。土地にも、人にも、馴染めないまま通り過ぎていく。自分はまるで、根なし草みたいだ」</p>
              <p>巡はゆっくりと首を横に振った。否定ではなく、もっと深い理解を示すように。</p>
              <p>「老子という人が、こう言いました。『上善如水。水は万物を潤して争わず、衆人の悪む所に処る。故に道に幾し』──最も優れたあり方は水のようです。争わず、低いところに流れ、すべてを潤す」</p>
              <p>洋介は窓の外を見た。曇り空の向こうに、見えない海を想像しているようだった。</p>
              <p>「壬水であるあなたは、大河です。大河は、一箇所に留まりません。留まることが、海の性質ではないのです。水が留まれば、それは澱み、腐ってしまう」</p>
              <p>「……ということは、根なし草でいい、と？ 一生、漂い続けろと言うんですか」</p>
              <p>「違います」</p>
              <p>巡の声は、柔らかく、しかし岩を穿つ滴のように鋭く響いた。</p>
              <p>「居場所がないのではなく、どこでも居場所になれる。それが壬水の力です。あなたが通った土地、会った人、書いた記事──それらすべてを潤してきたはずです。あなたは、海そのものなのだから。海に『居場所』を求める必要はありません。海が、そのまま世界であり、居場所なのです」</p>
              <p>洋介の喉が、少しだけ震えた。胸の奥で、硬く結ばれていた何かが解けていく音がした。</p>
              <p>「……そう、いう見方もあるのか」</p>
              <p>「根なし草ではなく、大河。あなたの居場所は、あなた自身が流れていく先に、つねにある。あなたが動くこと、流れることこそが、あなたの安住なのです」</p>
              <p>沈黙が落ちた。<br />窓ガラスを伝う雫が、一粒、また一粒と落ちていく。その一滴が世界を潤すのだと、今の洋介には思えた。</p>
              <p>「次の取材は、どこへ？」</p>
              <p>巡が聞いた。</p>
              <p>「アフリカ。西海岸の、小さな漁村の話を追いたいと思っている。地図にも載っていないような場所だ」</p>
              <p>「では、その海も、あなたを待っている」</p>
              <p>洋介は立ち上がった。バッグを肩にかける。その重みが、今は心地よかった。<br />十年分のスタンプが、擦り切れて白くなっている。それは放浪の傷跡ではなく、大河が大地を削り、流れてきた軌跡だった。</p>
              <p>「先生」</p>
              <p>扉の前で、洋介は振り返った。</p>
              <p>「海が、居場所だと言われて、初めて──少し、軽くなった気がする。俺は、俺のままで流れていけばいいんだな」</p>
              <p>巡は微笑んだ。</p>
              <p>「無理に留まろうとしないでください。あなたの水は、まだ、流れるべき場所が残っている」</p>
              <p>扉が閉まる。<br />診察室に、雨の匂いと、潮の香りが少し混じったような、穏やかな空気が残った。</p>

              <hr className="border-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-12" />

              <p className="italic text-gray-300 text-sm leading-relaxed">
                巡はノートに一行、書き加えた。<br /><br />
                ──壬子、汪溢の如し。争わずして、万物を潤す。<br /><br />
                窓の外では、雨が静かに降り続いていた。<br />
                その雨は、やがてアスファルトを濡らし、側溝を流れ、川になり、海に注ぐ。<br />
                海は、どこまでも広がっていく。<br />
                そして、その海の一部として、彼もまた流れ続けるのだろう。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
