# Remotion API 中文速查手册

> 研读对象：Remotion 官方文档 https://www.remotion.dev/docs（Remotion 4.x）
> 目标：系统性掌握「如何做出好看的作品」，而非仅会基本 API。
> 每个知识点附最小可运行代码片段 + 文档出处 URL。

---

## 1. 核心动画原语

### 1.1 useCurrentFrame / useVideoConfig

一切动画的唯一时间源。`useCurrentFrame()` 返回当前帧号（在 `<Sequence>` 内会被 time-shift，即子组件看到的是「局部帧」）。`useVideoConfig()` 返回 `fps / durationInFrames / width / height`。

```tsx
import { useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame(); // 当前帧号，整数
const { fps, durationInFrames, width, height} = useVideoConfig();
const progress = frame / durationInFrames; // 0 → 1 进度
```

铁律：**不要用 CSS transitions / keyframes、不要用 `Date.now()`、`Math.random()`**（非确定性渲染会出问题；需要随机数用 `random(seed)`）。
📖 https://www.remotion.dev/docs/sequence

### 1.2 interpolate（含 Easing、extrapolate）

把一段数值映射到另一段数值。签名：`interpolate(input, inputRange, outputRange, options)`。

```tsx
import { interpolate, Easing, useCurrentFrame} from 'remotion';
const frame = useCurrentFrame();

// 淡入：默认习惯——总是写上 clamp！
const opacity = interpolate(frame, [0, 20], [0, 1], {
extrapolateLeft: 'clamp',
extrapolateRight: 'clamp',
});

// 淡入 + 保持 + 淡出（多关键帧一次写完）
const opacityInOut = interpolate(
frame,
[0, 20, durationInFrames - 20, durationInFrames],
[0, 1, 1, 0],
);

// 带缓动的位移动画
const y = interpolate(frame, [0, 30], [120, 0], {
easing: Easing.out(Easing.cubic), // 出场先快后慢
extrapolateRight: 'clamp',
});
```

**extrapolate 四种模式**（默认 `extend`，几乎永远应该改掉）：
- `extend`：超范围继续线性外推（默认，最容易出 bug）
- `clamp`：限制在范围内（**推荐默认写这个**）
- `wrap`：循环
- `identity`：返回输入值本身

**Easing 常用**（出处：官方 Easing 文档）：`Easing.linear`、`Easing.ease`、`Easing.out(Easing.cubic)`（出场）、`Easing.inOut(Easing.cubic)`（往返）、`Easing.bezier(0.8, 0.22, 0.96, 0.65)`（自定义）、`Easing.step1`（逐帧开关切换）、`Easing.spring({ damping: 200})`（v4.0.476+，在插值里直接用弹簧缓动）。

4.x 进阶选项：
- `easing` 可传**数组**（每段一个缓动，长度 = inputRange.length - 1）
- `output: 'perceptual-scale'`（v4.0.490）：scale 插值按视觉面积线性变化，更符合人眼
- `posterize: 3`（v4.0.470）：每 3 帧才采样一次，做逐帧/定格动画风
- outputRange 可直接写 CSS 字符串：`'100px 50px'`、`'90deg'`、`'left top'`，Remotion 自动解析（v4.0.472+）

📖 https://www.remotion.dev/docs/interpolate / https://www.remotion.dev/docs/easing

### 1.3 spring（含 damping / mass / stiffness 调参）

物理弹簧动画，默认从 0 到 1（可 `from/to` 自定）。**必须传 `fps`**。

```tsx
import { spring, useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const { fps} = useVideoConfig();

const s = spring({ frame, fps, config: { damping: 200}}); // 平稳入场，无回弹
const scale = interpolate(s, [0, 1], [0.5, 1]); // spring 结果再映射

// 延迟 20 帧再启动
const late = spring({ frame: frame - 20, fps, config: { damping: 20}});
// 或用 delay 参数（v3.3.90+）
const late2 = spring({ frame, fps, delay: 20});
// 拉长到精确时长（v3.0.27+）
const timed = spring({ frame, fps, durationInFrames: 40, config: { damping: 200}});
```

**调参指南（社区 + 官方文档共识）**：

| 场景 | config | 说明 |
|---|---|---|
| UI 元素平稳入场（推荐默认） | `{ damping: 200}` | 几乎无回弹，最常用，电影感安全牌 |
| 轻微弹性标题 | `{ damping: 20, stiffness: 200}` | 有一点过冲再收回，活泼 |
| 强烈弹跳 | `{ damping: 10}`（默认） | 默认带明显回弹，慎用 |
| 更快完成 | 减小 `mass`（默认 1） | mass 越小越快 |
| 更弹 | 增大 `stiffness`（默认 100） | 影响回弹幅度 |

- `overshootClamping: true`：禁止超过 `to` 值（解决弹簧越过目标的 overshoot 问题）
- `reverse: true`：反向播放弹簧（v3.3.92+）
- `durationRestThreshold`：配合 `durationInFrames` 使用，0.001 表示 30 帧后到达 99.9%

📖 https://www.remotion.dev/docs/spring

### 1.4 measureSpring

根据 spring 配置和 fps，算出弹簧「 settle」需要多少帧。用来**按音频/镜头时长倒推进场时机**。

```ts
import { measureSpring} from 'remotion';

const frames = measureSpring({ fps: 30, config: { damping: 200}}); // => 23
// 用法：scene 长 90 帧，元素要在结束前恰好 settle → from = 90 - 23
```

理论上弹簧永不结束，Remotion 用 `threshold`（默认 0.005，即离终值 0.5% 以内算结束）判定。
📖 https://www.remotion.dev/docs/measure-spring

### 1.5 Sequence / Series / TransitionSeries 的区别

```tsx
import { Sequence, Series, AbsoluteFill} from 'remotion';

// —— Sequence：时间平移。from=子时间轴起点，子组件 useCurrentFrame() 从 0 开始
<Sequence from={30} durationInFrames={60}>
<SceneB /> {/* 全局 30–89 帧可见，内部 frame 为 0–59 */}
</Sequence>

// —— Series：把场景「首尾相接」拼起来，不用自己算 from
<Series>
<Series.Sequence durationInFrames={60}><SceneA /></Series.Sequence>
<Series.Sequence durationInFrames={90} offset={-10}> {/* 负 offset → 与上一个重叠 10 帧 */}
<SceneB />
</Series.Sequence>
</Series>

// —— TransitionSeries：Series + 场景间转场（需装 @remotion/transitions）
// 转场会总时长：总时长 = Σ序列时长 − Σ转场时长
import { TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import { fade} from '@remotion/transitions/fade';
import { slide} from '@remotion/transitions/slide';

<TransitionSeries>
<TransitionSeries.Sequence durationInFrames={90}><SceneA /></TransitionSeries.Sequence>
<TransitionSeries.Transition
presentation={fade()}
timing={linearTiming({ durationInFrames: 15})} // 精确控制
/>
<TransitionSeries.Sequence durationInFrames={90}><SceneB /></TransitionSeries.Sequence>
<TransitionSeries.Transition
presentation={slide({ direction: 'from-left'})}
timing={springTiming({ config: { damping: 200}})} // 物理感
/>
<TransitionSeries.Sequence durationInFrames={90}><SceneC /></TransitionSeries.Sequence>
</TransitionSeries>
// 上例总时长 = 90 + 90 + 90 − 15 − spring时长
```

**规则（官方）**：
- Transition 不能比前后任一序列长；两个 Transition 不能相邻
- `<TransitionSeries.Overlay durationInFrames={20}>`：在切点上叠一层（如 light leak / 闪光），**不缩短总时长**，默认以切点为中心
- 转场也能放首尾来做「入场/退场」动画

**选型建议**：
- `Sequence`：任意时间轴排布、重叠、循环，最灵活
- `Series`：简单首尾相接拼接
- `TransitionSeries`：需要转场效果（溶解/滑动/擦除等）时；否则手动在每个场景首尾做淡入淡出更精确、可预测

📖 https://www.remotion.dev/docs/sequence / https://www.remotion.dev/docs/series / https://www.remotion.dev/docs/transitions/transitionseries / https://www.remotion.dev/docs/transitions

**内置 presentation**（各是单独子模块导入）：`fade`（连续感）、`slide`（方向动量）、`wipe`（硬边缘扫过）、`flip`（3D 翻页）、`clockWipe`（时钟扫过）、`iris`（圆形遮罩）、`zoomInOut`、`dissolve`、`ripple`、`crossZoom`、`blurSlide`（鞭打式侧移+动态模糊，电影感）、`none`（硬切但占节点）。
📖 https://www.remotion.dev/docs/transitions

### 1.6 AbsoluteFill

```tsx
import { AbsoluteFill} from 'remotion';

// = position:absolute; inset:0; display:flex; flexDirection:column 的 div
// 层叠顺序：后渲染的在上。场景默认是它。
<AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}}>
{/* 场景内容 */}
</AbsoluteFill>
```

v4.0.501+ 继承了 Sequence 的 `from / durationInFrames / trimBefore / playbackRate / freeze / hidden / name / showInTimeline` 等 props，可直接当计时层用。
📖 https://www.remotion.dev/docs/absolute-fill

### 1.7 staticFile

```tsx
import { staticFile, Img} from 'remotion';

// public/ 下的资源 → URL（渲染时正确解析，支持部署到子目录）
<Img src={staticFile('images/bg.png')} />
// 注意：v4 起文件名会被 encodeURIComponent，不要自己再 encode
```

📖 https://www.remotion.dev/docs/staticfile

---

## 2. 文本动画技巧（Kinetic Typography）

### 2.1 逐字 / 逐词入场（stagger）

```tsx
import { interpolate, Easing, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const KineticTitle: React.FC<{ text: string}> = ({ text}) => {
const frame = useCurrentFrame();
const { fps} = useVideoConfig();
const words = text.split(' ');
const STAGGER = 4; // 词与词间隔帧数

return (
<div style={{ overflow: 'hidden'}}> {/* mask reveal 用 overflow:hidden */}
{words.map((w, i) => {
const local = frame - i * STAGGER;
const o = interpolate(local, [0, 8], [0, 1], {
extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
const y = interpolate(local, [0, 14], [60, 0], { // 从下方升起
easing: Easing.out(Easing.cubic),
extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
return (
<span key={i} style={{
display: 'inline-block', opacity: o,
transform: `translateY(${y}px)`, marginRight: '0.25em',
}}>
{w}
</span>
);
})}
</div>
);
};
```

**社区总结的高级感做法**：
- **Mask reveal**：父容器 `overflow: hidden`，子元素 `translateY(110%) → 0`——「从线条下升起」，比 fade 更高级
- **Pop-in**：`scale(${interpolate(spring({frame, fps, config:{damping:12, stiffness:200}}), [0,1], [3,1])})`，从大到小砸进来
- **Blur-in**：`filter: blur(${interpolate(frame, [0, 10], [12, 0], { extrapolateRight: 'clamp'})}px)` 配合 opacity
- **Character wave**：每字 `translateY` 用 `Math.sin((frame - i * 2) / 6)` 驱动（sin 是确定性的，允许用）
- 词级用于可读性，字级只用于大标题
- 强调词：scale + 变色；动画字重需预加载对应字重文件（可变字体渲染中途可能 layout shift）

📖 https://www.remotion.dev/docs/interpolate · https://www.remotion.dev/docs/spring（官方 kinetic-typography 无单页，做法来自社区最佳实践与官方原语组合）

### 2.2 数字滚动（count-up）

```tsx
const n = Math.round(interpolate(frame, [0, 45], [0, 1000000], { extrapolateRight: 'clamp'}));
return <div style={{ fontVariantNumeric: 'tabular-nums'}}>{n.toLocaleString()}</div>;
```

### 2.3 字幕同步思路（@remotion/captions）

官方包 `@remotion/captions`：转写（whisper）、`parseSrt` 导入 srt、`createTikTokStyleCaptions` 生成抖音风分页、按 token 高亮当前词。

```tsx
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import { createTikTokStyleCaptions} from '@remotion/captions';
import type { Caption, TikTokPage} from '@remotion/captions';
import { useMemo} from 'react';

// captions: Caption[] = [{ text, startMs, endMs, timestampMs, confidence}]
const { pages} = useMemo(() => createTikTokStyleCaptions({
captions, combineTokensWithinMilliseconds: 1200, // 每页最多 1.2 秒
}), [captions]);

// 每页一个 Sequence，按 startMs 换算成帧
{pages.map((page, i) => {
const startFrame = (page.startMs / 1000) * fps;
const next = pages[i + 1];
const endFrame = Math.min(next? (next.startMs / 1000) * fps: Infinity, startFrame + 1.2 * fps);
return (
<Sequence key={i} from={startFrame} durationInFrames={endFrame - startFrame}>
<CaptionPage page={page} />
</Sequence>
);
})}

// CaptionPage：按时间高亮当前词（卡拉 OK）
const CaptionPage: React.FC<{ page: TikTokPage}> = ({ page}) => {
const frame = useCurrentFrame();
const { fps} = useVideoConfig();
const nowMs = page.startMs + (frame / fps) * 1000;
return (
<div style={{ fontSize: 80, fontWeight: 'bold', whiteSpace: 'pre'}}>
{page.tokens.map((t, k) => {
const active = t.fromMs <= nowMs && t.toMs > nowMs;
return <span key={k} style={{ color: active? '#39E508': 'white'}}>{t.text}</span>;
})}
</div>
);
};
```

要点：caption 文本对空白敏感（词前带空格 + `whiteSpace: 'pre'`）；srt 导入用 `parseSrt`，可先在 node 脚本里转成 `captions.json` 放 public/。

📖 https://www.remotion.dev/docs/captions（Importing / Transcribing / Displaying / Exporting 四节）· https://www.remotion.dev/docs/staticfile

---

## 3. 音频

### 3.1 基础与音量包络

```tsx
import { Audio, Sequence, interpolate, staticFile} from 'remotion';

// 背景音乐，固定音量
<Audio src={staticFile('music/bg.mp3')} volume={0.3} />

// 音量包络：前 30 帧淡入、最后 30 帧淡出
<Audio
src={staticFile('voice.mp3')}
volume={(f) =>
interpolate(f, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
})
}
/>

// 音效在第 90 帧触发
<Sequence from={90}>
<Audio src={staticFile('sounds/whoosh.mp3')} volume={0.5} />
</Sequence>
```

`volume` 接受数字或 `(frame) => number` 回调；`muted`、`loop`、`trimBefore`、`durationInFrames`、`playbackRate` 均可用。新用法优先 `@remotion/media` 的 `<Audio>`（旧 `<Audio>` 已改名 `<Html5Audio>`）。

📖 https://www.remotion.dev/docs/audio

### 3.2 TTS 语音与时长对齐（官方做法）

**核心原则：音频是主时钟，渲染前先把音频时长测出来，再用 `calculateMetadata` 反推 composition 时长。**

```tsx
// Root.tsx
import { getAudioDurationInSeconds} from '@remotion/media-utils';

export const RemotionRoot = () => (
<Composition
id="MyVideo"
component={MyVideo}
durationInFrames={300} // 占位，会被 calculateMetadata 覆盖
fps={30} width={1920} height={1080}
defaultProps={{ audioFile: 'voiceover/intro.mp3'}}
calculateMetadata={async ({ props}) => {
const seconds = await getAudioDurationInSeconds(staticFile(props.audioFile));
return { durationInFrames: Math.ceil(seconds * 30) + 60 /* 尾部留白 */};
}}
/>
);
```

- TTS 选型：Edge-TTS（免费，可直接产出**词级时间戳**，驱动字幕高亮）、Kokoro（免费本地）、ElevenLabs（付费高质量）
- 有词级时间戳 → 直接做卡拉 OK 字幕（第 2.3 节）；没有 → 用 faster-whisper / AssemblyAI 转写
- 旁白音量与背景音乐拉开：音乐音量相对语音 −12 ~ −18 dB
- **J-Cut / L-Cut**：`<Audio>` 用 offset 错开画面切换点，更电影感

📖 https://www.remotion.dev/docs/audio · 社区实践（calculateMetadata 模式）

---

## 4. 相机运镜（Camera Moves）

Remotion 没有内置相机，但所有运镜都是 `scale / translate / rotate` 组合 + `interpolate`。常用套路：

### 4.1 Ken Burns（缓慢推近，最常用）

```tsx
// 全片 1.0 → 1.06，缓慢线性推近；注意 transformOrigin 控制推向哪
const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06], {
extrapolateRight: 'clamp',
});
<AbsoluteFill style={{
transform: `scale(${zoom})`,
transformOrigin: '50% 60%', // 推向画面主体
}}>
<Img src={staticFile('photo.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover'}} />
</AbsoluteFill>
```

### 4.2 Pan（横移）+ Zoom 组合

```tsx
const x = interpolate(frame, [0, dur], [0, -120], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
const zoom = interpolate(frame, [0, dur], [1.15, 1.0], { extrapolateRight: 'clamp'}); // 拉远
<AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${x}px)`}}>…</AbsoluteFill>
```

### 4.3 Punch Zoom（冲击式推近，高潮用）

```tsx
// 最后 10 帧用指数缓动猛推
const punch = interpolate(frame, [dur - 30, dur], [1, 1.35], {
easing: Easing.in(Easing.exp),
extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
```

### 4.4 Dolly Zoom（希区柯克式变焦，滑轨变焦）

思路：**scale 放大的同时 translate 反向补偿**，让主体大小不变、背景被压缩/拉伸。

```tsx
// 模拟：主体保持，背景透视变化
const t = interpolate(frame, [0, dur], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
const bgScale = interpolate(t, [0, 1], [1, 1.5]); // 背景放大
const fgShift = interpolate(t, [0, 1], [0, -80]); // 前景反向位移补偿
```

### 4.5 社区经验

- Ken Burns 贵在克制：全程 8–12% 的 scale 变化；方向要有动机（推向句子的主体）
- 慢速运镜用**线性**（easing 会让照片显得在「表演」）；快速运镜（punch/whip）用 ease in/out
- 图片分辨率要大于输出帧，否则推近会糊
- 电影感转场：`blurSlide`（鞭打+动态模糊）、`zoomBlur`、`filmBurn`（胶片烧蚀）——`@remotion/transitions` 内置

📖 https://www.remotion.dev/docs/interpolate · https://www.remotion.dev/docs/transitions（官方无独立 camera 页，做法为社区共识）

---

## 5. 渲染

### 5.1 npx remotion render 常用参数

```bash
npx remotion render <entry> <comp-id> [output]

# 常用 flags
npx remotion render src/index.ts MyVideo out.mp4 \
--codec=h264 \ # h264(默认通用) | h265(更小,兼容性风险) | vp9 | prores(剪辑母版) | gif | mp3/aac/wav(纯音频)
--crf=18 \ # h264 0-51,默认18;14-18 典藏级,18-22 常规,>24 渐变处易出 banding
--image-format=jpeg \ # jpeg(快,默认) | png(慢,支持透明)
--jpeg-quality=80 \ # 帧捕获质量,颗粒/暗场景调高
--scale=0.5 \ # 按比例缩放输出,快速出预览
--concurrency=4 \ # 并行帧数,默认=CPU核心一半;WebGL/3D 场景降到 2-4
--muted \ # 无音频输出
--frames=0-90 \ # 只渲染片段,快速迭代
--overwrite # 覆盖已存在文件(默认 true)

# 单帧检查(便宜的设计 QA)
npx remotion still src/index.ts MyVideo out.png --frame=30
```

- `--crf` 与 `--video-bitrate` 互斥；`--prores-profile=4444` 可带 alpha 通道
- `--gl=swiftshader`（Linux CI）/ `--gl=angle`（macOS/Windows）：`@remotion/three` 必需
- `@remotion/transitions` 的 HTML-in-canvas 特效（如 bookFlip）在预览时需要 Chrome 开 `chrome://flags/#canvas-draw-element`

📖 https://www.remotion.dev/docs/cli/render（官方 CLI 文档）

### 5.2 渲染性能优化

1. **避免每帧重计算**：把昂贵计算包进 `useMemo`（如 `createTikTokStyleCaptions`、SVG path 生成）
2. **视频用 `<OffthreadVideo>`**：渲染时 FFmpeg 在浏览器外精确抽帧，比 `<Html5Video>` 快且准；`transparent` 只在需要透明时开（慢），`toneMapped={false}` 可再省一点（颜色略差）
3. **CSS 动画禁区**：headless 渲染不跑 CSS keyframes/transition——Studio 里看着动，导出是静帧；一切动画走 `interpolate/spring`
4. **粒子/大列表**：数量控制在 10–15 个以内；能用 `transform` 就别改 layout 属性
5. **多分辨率**：一套 composition + `--scale` 出不同尺寸；只在 4K 需要不同素材时才建平行 Root
6. **字体**：见第 6 节，阻塞式加载一次，避免每帧触发

📖 https://www.remotion.dev/docs/offthreadvideo

---

## 6. 常见坑

### 6.1 字体加载

```tsx
// 推荐：@remotion/google-fonts，类型安全；loadFont 会阻塞渲染直到字体就绪，无 FOUT
import { loadFont} from '@remotion/google-fonts/Inter';
const { fontFamily} = loadFont('normal', { weights: ['400', '700', '900'], subsets: ['latin']});

// 本地字体（public/ 下）：@remotion/fonts（v4.0.164+）
import { loadFont} from '@remotion/fonts';
loadFont({ family: 'MyFont', url: staticFile('MyFont.woff2'), weight: '500'});
```

- 多个字体 → 在一个共享模块里统一 load
- **渲染前先 `npx remotion still` 验证一帧**，确认字体真的生效了再长渲染
- 动画字重要求对应字重文件已预加载；可变字体渲染中途可能 layout shift

📖 https://www.remotion.dev/docs/fonts

### 6.2 音频时长不确定 → 对不齐

不要硬编码旁白时长。渲染前测 `getAudioDurationInSeconds`，用 `calculateMetadata` 动态定 `durationInFrames`（见 3.2）。TTS 换了文案就重新测，不要靠估。

### 6.3 spring overshoot（弹簧冲过头）

- 入场元素：用 `damping: 200` 基本无回弹；或 `overshootClamping: true` 硬截断
- 注意：`spring()` 永远不会**精确**到达目标（渐近），要精确终值用 `interpolate` + `clamp`
- spring 是「感觉」，interpolate 是「精确」——定版位置/透明度用 interpolate

### 6.4 30fps 时长换算

```
帧 = 秒 × fps；秒 = 帧 / fps
1 秒 = 30 帧；常用：淡入 8–15 帧（0.3–0.5s）、转场 12–20 帧、词 stagger 4 帧、行 stagger 8–12 帧
```

### 6.5 其他

- `<Sequence>` 里 `useCurrentFrame()` 是**局部帧**（from 会被减掉），别在父子两层混用同一 frame 算同一动画
- TransitionSeries 会缩短总时长，composition 的 `durationInFrames` 要按「Σ序列 − Σ转场」算
- 远程图片/视频注意 CORS；本地资产一律 `staticFile()`
- 文本安全区：竖屏上下各留 150–170px；标题字号 1080p 下 ≥ 64px，编码后细字会糊

---

## 7. Remotion 4.x 值得注意的新特性

（基于官方文档中各 API 的 AvailableFrom 标注，版本至 4.0.532 附近）

- **`@remotion/media` 新媒体组件**：`<Audio>`/`<Video>` 新实现，旧版改名 `<Html5Audio>`/`<Html5Video>`；新版为推荐用法
- **`interpolate` 大幅增强**：CSS 字符串输出（scale/translate/rotate/transform-origin）、`output: 'perceptual-scale'`、`posterize`、`easing` 数组（逐段缓动）、`Easing.spring()`、`Easing.step1` 布尔/离散值切换、数值元组输出
- **`Sequence` 新 props**：`playbackRate`（变速）、`trimBefore`、`freeze`、`loop`、`cropLeft/Right/Top/Bottom`（可动画裁剪）、`premountFor`/`postmountFor`
- **`TransitionSeries.Overlay`**（v4.0.415）：切点叠层特效（light leak/闪光）不改变总时长
- **`@remotion/transitions` 扩展**：HTML-in-canvas 特效（`zoomBlur`、`dreamyZoom`、`filmBurn`、`dissolve`、`ripple`、`crosswarp`、`crossZoom`、`swap`、`blurSlide`、`bookFlip`…），付费 `cube`
- **`springTiming({ config})`**：转场也可用弹簧物理
- **`measureSpring()`** 仍在，用于精确算弹簧 settle 时长
- **音频**：`toneFrequency`（渲染时变调）、`preservePitch`、`audioStreamIndex`（多音轨）
- **字体**：`@remotion/fonts` 本地字体包（v4.0.164+）
- **性能**：Rust 重构架构、FFmpeg 内置、OffthreadVideo 提速约 2 倍、HDR `toneMapped` 颜色校正
- **`getDurationInFrames()`**：timing 对象可直接算出转场帧数，便于排时间轴
- **v5 预告**：`Sequence premountFor` 默认将变为 1 秒；`TransitionSeries layout="none"` 废弃

📖 总览：https://www.remotion.dev/blog（4.0 发布系列）· https://github.com/remotion-dev/remotion/releases

---

## 附：让作品好看的检查清单（综合官方 + 社区）

- [] 入场一律 spring（`damping: 200`），不用线性
- [] 相关元素 stagger 8–12 帧；词 4 帧
- [] 场景间 12–20 帧 dissolve/slide；少用花哨特效
- [] 每个场景一个清晰视觉隐喻；无大段文字墙
- [] 字幕 ≥ 32px、标题 ≥ 64px（1080p），对比度 ≥ 7:1
- [] 背景缓慢 Ken Burns（1.0 → 1.05），避免全静态画面
- [] 胶片颗粒/暗角/黑边：SVG feTurbulence 噪点层 + vignette，低成本电影感
- [] 音乐 −12~−18dB 低于人声；转场点配 whoosh 音效
- [] 先 `still` 验帧，再 `--frames=0-90` 验片段，最后全量渲染
