# Remotion 生态：官方扩展包与第三方库全景（2026-10-03）

> 定位：我们的"AI 生图影像层 + Remotion 合成"管线里，**动效与能力扩展**从哪里来。
> 版本基线：Remotion 4.0.532。官方包用 `npm i <包名>@4.0.532` 与主版本对齐。

## 一、官方 @remotion/* 扩展包（按对我们的价值排序）

| 包 | 一句话 | 我们的片子用不用得上 |
|---|--------|---------------------|
| `@remotion/transitions` ★★★★★ | 官方转场（fade/slide/wipe/flip/clockWipe）+ `TransitionSeries` | 必装。替代手写转场，API 稳定 |
| `@remotion/captions` ★★★★☆ | SRT/VTT 解析 + 逐词高亮字幕（Hormozi/MrBeast 式 karaoke 字幕） | 旁白字幕想做逐词高亮时用；目前整句字幕够用，可选 |
| `@remotion/google-fonts` ★★★★★ | Google Fonts 的 Remotion 封装（加载即阻塞渲染，保证不闪） | 必装。注意：中文字体用 Noto Sans/Serif SC（Google Fonts 有收录） |
| `@remotion/media-utils` ★★★★☆ | `getAudioDurationInSeconds`、`useAudioData` + `visualizeAudio`（频谱/波形） | 音频时长测量、做音频可视化时用 |
| `@remotion/noise` ★★★★☆ | 确定性 Perlin 噪声（动画背景、相机抖动、粒子） | 替代手写 mulberry32 做有机抖动；背景纹理 |
| `@remotion/shapes` ★★★☆☆ | SVG 图形库（Circle/Star/Heart/Triangle/Pie…） | 信息图、数据可视化时用 |
| `@remotion/paths` ★★★☆☆ | SVG 路径动画（draw-on 描线、路径测量） | 片头 logo 描线、地图路线动画 |
| `@remotion/motion-blur` ★★★★☆ | `CameraMotionBlur`（快门角度）+ `Trail`（拖影） | 甩镜转场、快速运镜时加，电影感直接拉满 |
| `@remotion/gif` ★★☆☆☆ | 时间轴同步的 GIF 播放 | 很少用 |
| `@remotion/lottie` ★★★☆☆ | 播 Lottie 动画 | UI 动效、MG 动画素材复用 |
| `@remotion/rive` ★★☆☆☆ | Rive 高性能矢量动画 | 同上，备选 |
| `@remotion/three` ★★★☆☆ | React Three Fiber 3D 场景 | 片头 3D 标题、粒子星空；成本高，按需 |
| `@remotion/skia` ★★☆☆☆ | GPU 着色器/低级图形 | 发光、复杂着色器；成本高，按需 |
| `@remotion/light-leaks` ★★★☆☆ | WebGL 漏光转场 | 文艺片转场备选 |
| `@remotion/animated-emoji` ★☆☆☆☆ | 411 个 Google 彩色 emoji 动画 | 短视频花字，电影短片基本不用 |
| `@remotion/layout-utils` ★★☆☆☆ | 排版测量 | 复杂排版时用 |
| `@remotion/animation-utils` ★★☆☆☆ | 动画辅助函数 | 按需 |
| `@remotion/tailwind` ★★★☆☆ | Tailwind CSS 支持 | 习惯 Tailwind 的话装 |
| `@remotion/preload` ★★★☆☆ | 预加载图片/视频/音频/字体 | 素材多时防闪烁 |
| `@remotion/lambda` ★★★☆☆ | AWS Lambda 云端渲染 | 量产、多并发时用；平时本地渲 |
| `@remotion/openai-whisper` / `@remotion/install-whisper-cpp` ★★★☆☆ | 语音转字幕（Whisper） | 旁白自动生成字幕时间轴，省人工对轴 |

## 二、第三方组件库（详见 component-libraries.md）

| 库 | 规模 | 一句话 |
|---|------|--------|
| lifeprompt-team/remotion-scenes ★★★★★ | 201 | 最全的场景库，Cinematic/Effect/Background/Transition 直接用 |
| reactvideoeditor/remotion-templates（RVE） ★★★★☆ | 81 | 文字动效、转场、图表、波形，单文件即抄即用 |
| remocn ★★★★★ | registry | shadcn 式按需安装，`npx shadcn add https://remocn.vercel.app/r/[name].json`，社区最活跃，转场质量最高 |
| Curvable/motion ★★★☆☆ | 14 | npm 包，品牌发布会风，规范值得抄 |
| jessai2026/remotion-playground ★★☆☆☆ | 24+ | 教程 cookbook，查写法用 |

## 三、字幕/标题特效方案

- **整句电影字幕**（我们当前方案）：手写 `Subtitles` 组件（Cine.tsx），Noto Sans SC Bold，
  白字强阴影，底部居中。够用，不折腾。
- **逐词 karaoke 字幕**（短视频/预告片风）：`@remotion/captions` 做分词分页 +
  当前词高亮放大。旁白先过 Whisper 拿词级时间轴。
- **Cinematic 标题**：remotion-scenes 的 CinematicAnimations（史诗/浪漫/科幻标题），
  或 RVE 的 kinetic typography。

## 四、粒子 / 着色器 / 3D

- **轻量粒子**（尘埃/星空/bokeh）：手写 div + `random(seed)`，60–150 个以内（现有方案，够用）。
- **有机背景**（aurora/mesh/烟雾）：`@remotion/noise` 或 remotion-scenes BackgroundAnimations。
- **GLSL 着色器**：`@remotion/skia`，或 Curvable 的 GrainientBg（需 `ogl`）。
- **3D**：`@remotion/three`（React Three Fiber）。注意渲染成本和内存（我们本机 7.7G，
  慎用；真要用时分段渲染）。

## 五、推荐组合清单（我们这种片子）

```sh
# 每个新项目都装这套
npm i @remotion/transitions@4.0.532 @remotion/google-fonts@4.0.532 \
  @remotion/media-utils@4.0.532 @remotion/noise@4.0.532 \
  @remotion/motion-blur@4.0.532 @remotion/captions@4.0.532
# 按需：npx shadcn add https://remocn.vercel.app/r/<转场名>.json
# 按需：npx degit lifeprompt-team/remotion-scenes/src/scenes/<分类> ./vendor/<分类>
```

- 转场 → `@remotion/transitions` + remocn
- 标题 → remotion-scenes CinematicAnimations / RVE kinetic typography
- 字幕 → 自研 Subtitles（电影）/ `@remotion/captions`（karaoke）
- 字体 → `@remotion/google-fonts`（Noto CJK）
- 氛围 → `@remotion/noise` + 手写粒子
- 高级动效 → `@remotion/motion-blur`（甩镜）、`@remotion/paths`（描线）
