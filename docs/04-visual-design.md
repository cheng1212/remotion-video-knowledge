# Remotion 视觉设计手册：让画面从"抽象"变"具体"

> 写作日期：2026-10-02。背景：前两版视频是纯代码绘制的几何图形（div 渐变、粒子），
> 用户反馈"太抽象"。本手册研究"代码渲染框架里如何做出具体、可辨识、有质感的画面"。
> 配套规范：本仓库 README.md（制作流程、字幕/运镜/转场规范）。

核心结论一句话：**纯代码的天花板是风格化插画（Kurzgesagt 级），照片级写实必须靠外部图像；
科普视频的现实最优解是混合管线——代码管结构（分镜/运镜/字幕/转场），AI 生图管细节，实拍素材管真实质感。**

---

## 一、三种画面管线对比与选型决策表

| 维度 | A. 纯代码绘制 | B. AI 生图 + 程序化运镜 | C. 真实影像素材 |
|---|---|---|---|
| **做法** | SVG/div/CSS 画几何、剪影、粒子 | Midjourney/Flux/SDXL 生成电影感静态图，Remotion 做 Ken Burns 推拉/视差 | Pexels/Pixabay/Coverr/NASA 免费素材，`<Img>`/`<OffthreadVideo>` 接入 |
| **效果上限** | 风格化插画（Kurzgesagt 级），永远到不了照片级 | 接近电影剧照 + 动态运镜，"AI 纪录片"质感 | 真实纪录片质感（本来就是实拍） |
| **适用场景** | 数据可视化、抽象概念、图表、情绪性剪影空镜 | 历史/自然/科幻场景重现、需要"看见"具体事物但无实拍的题材（恐龙、远古、未来） | 有现成实拍的题材（太空 NASA、自然、城市、显微） |
| **成本** | 时间成本（画得好很费工） | 生图成本（Flux API 约 ¥0.1–0.4/张；MJ 订阅）+ 选图时间 | 选片时间；免费站商用免署名 |
| **一致性** | 最高（全代码控制） | 中（靠 seed/sref/风格后缀控制，见第二章） | 低（不同来源素材色调/画质不一，需后期统一调色） |
| **翻车风险** | 画得丑（几何感、廉价感） | AI 畸形（手/脸/乱码文字）、风格漂移 | 授权风险、素材对不上旁白、画质参差 |
| **与旁白同步** | 天然同步（代码时间轴） | 需人工选图匹配旁白 | 需人工选片匹配旁白 |

### 选型决策表（按镜头做决定，不要全片一刀切）

```
旁白在讲"它长什么样/有什么特征"？
  ├─ 是 → 必须出现可辨认的细节 → 有实拍用 C（真实素材），无实拍用 B（AI 生图）
  └─ 否（讲"发生了什么/什么感觉"）→ 剪影/氛围空镜够用 → A（纯代码）即可

有现成高质量实拍吗？（太空→NASA， 自然/城市→Pexels）
  ├─ 有 → C 优先，真实感拉满
  └─ 无 → B（AI 生图）是唯一能"看见"历史/未来的办法

是抽象概念/数据/图表吗？
  └─ 是 → A 纯代码反而最清晰（Kurzgesagt 式图解）
```

**实战配比建议（中文科普短片）**：B 占 60%（场景重现）+ C 占 20%（有实拍的题材）+ A 占 20%（图表/剪影/转场）。全片统一走 FilmTreatment（letterbox/vignette/grain/统一色调），三种管线的画面会被调色"粘"成同一部片子。

---

## 二、AI 生图做 Remotion 背景：完整 workflow

### 2.1 提示词写法：六维度 film look 公式

只加 `cinematic` 做出来的是"加了滤镜的照片"，不是电影剧照。六个维度同时给足：

```
cinematic film still of [主体] in [场景], [叙事瞬间],
[景别 + 机位/角度], [画幅比],
[lens: 镜头/焦段], [DOF: 景深],
[lighting: 光线方案 + 光源动机], [atmosphere: 体积雾/尘埃],
[color grade: 调色], [film stock/texture: 胶片颗粒],
[mood: 情绪], [风格后缀 + negative]
```

**关键词速查表**（直接复制）：

| 类别 | 关键词 |
|---|---|
| 光线 | `golden hour low sun`, `volumetric lighting with visible light rays`, `rim light separating subject from shadow`, `chiaroscuro`, `single practical light source`, `backlit silhouette`, `moonlight with cool blue fill` |
| 镜头 | `shot on ARRI Alexa 35`, `35mm anamorphic lens`, `shallow depth of field`, `subtle horizontal lens flare`, `35mm film grain` |
| 色调 | `teal and orange color grading`, `muted earthy tones`, `desaturated midtones with warm amber highlights`, `crushed blacks`, `cool blue-grey shadows` |
| 构图 | `extreme wide shot`, `wide establishing shot`, `generous negative space`, `rule of thirds`, `low angle`, `aerial view`, `subject at lower-third intersection` |
| 质感/负面 | `film grain texture`, `not a phone photo`, `not HDR`, `--no text, letters, words, signature, watermark` |

**完整示例**（远古草原开场，通用后缀全片复用）：

```
cinematic film still of a vast prehistoric savanna at dawn, a small herd of early hominids walking
distantly across tall golden grass, birds scattering in the far sky, extreme wide establishing shot,
camera at low angle near ground level, 16:9, 35mm anamorphic lens, deep depth of field,
golden hour low sun backlighting the grass with volumetric light rays and drifting dust particles,
teal and orange color grading, warm amber highlights, 35mm film grain, mood: epic, primordial,
generous negative space in the sky, --ar 16:9 --style raw --v 7
--no text, letters, words, signature, watermark, deformed hands
```

> 用法：每段第一句（主体+场景+叙事瞬间）换成自己的分镜内容，其余光线/镜头/色调/质感段**全片逐字复用**——这是最低成本的一致性手段。

### 2.2 画面一致性：让多张图"同一个世界"

1. **先出 1 张定调图**：选全片最重要的一幕反复抽卡，直到光线/色调/质感完全满意。
2. **风格参考**：Midjourney 用 `--sref <定调图URL> --sw 200` 带上之后每一张；Flux/SDXL 用 seed 锁定 + 同一风格 LoRA。
3. **固定风格后缀模板**：全片共用一段"风格圣经"后缀（镜头/调色/颗粒/negative），只替换主体描述。
4. **光源方向写死**：后缀里固定 `low sun from camera-left` 之类，否则切镜时左右光乱跳。
5. **锁定模型版本**：全片统一版本，中途不升级。
6. **人物一致性**：同一人物多幕出现用 `--cref <人物图URL> --cw 50`（只锁长相不锁服装）。
7. **选图检查清单**：色温一致、颗粒强度一致、光源方向一致、镜头语言统一、无乱入现代元素/错乱文字。

### 2.3 分辨率与构图：为运镜留余量

- **源图分辨率 ≥ 输出分辨率 × 最大推镜倍率**，再留 10% 余量。1080p 成片 + 默认慢推 1.08 → 源图至少 2048×1152（2K）；果断推镜 1.15 → 建议 4K。MJ 出图后务必 upscale。
- **四边各留 10% 安全边距**：主体放在中央 80% 区域；Remotion 里图片先放大到 110% 做"底"再运镜，保证永不露边。
- **16:9 直接出图**（`--ar 16:9`），不要事后裁——AI 按画幅构图。
- **横移需要画幅外的内容**：想做左右揭示式横移，用 MJ `Zoom Out` / SDXL outpainting 扩成 21:9 再横移。
- **letterbox 的影响**：上下各约 12% 高度会被黑边压住，重要元素别放顶部/底部 12%；字幕区（底部 15%）出图时主动要求暗部/负空间：`dark uncluttered lower third, negative space at bottom`。

### 2.4 常见翻车及规避

| 翻车 | 规避 |
|---|---|
| 手/脸畸形 | 根本解：背景图**避免人物特写**，多用远景/剪影/背影；MJ 加 `--no deformed hands, extra fingers`；Flux 不支持 negative prompt，改正面描述 `natural five-fingered hands` |
| 图中乱码文字 | 全片统一 `--no text, letters, words`；需要文字的镜头一律后期用 Remotion 文字层叠加 |
| 风格漂移 | 同一 sref + 同一后缀 + 同一模型版本 + 选图检查清单 |
| AI 塑料味 | 删掉 `perfect/flawless/8K/HDR` 这类词；加方向性描述 `visible skin pores, weathered texture`；后期统一加 film grain + vignette 去味 |
| 推镜穿帮（推到 1.2× 变油画） | 降推镜倍率，或换更近景别重出一张 |

### 2.5 工具选型

- **主力 Flux**（API 或本地）：有 API 可编程批量出图、提示词遵循度最高、写实感强。中文先译英文再喂模型。
- **点缀 Midjourney**：开场定调图/封面等 1–2 张 hero shot，用它的美学天花板。
- **长期降本 SDXL + ComfyUI 本地**：产量稳定后做成 LoRA + 固定工作流，ControlNet 可锁定"同一机位不同年代"的神级一致性。
- 国内备选：即梦/Seedream（中文提示词理解好，电影感调教资料少）。

---

## 三、单图多层视差实战（2.5D Parallax）

### 3.1 思路

一张平面图按离镜头远近拆成前景/中景/背景 2–3 层（透明 PNG），Remotion 里叠放；
镜头推拉/平移时**前景位移速度 > 中景 > 背景**，人眼脑补出景深。每层比可视区大 10–20%（出血），否则平移露边。

### 3.2 三种拆层方法

1. **AI 抠图**（最快）：Photoshop「选择主体」/ remove.bg / SAM 模型 → `fg.png`（透明底主体）+ 背景层（抠掉主体后需 inpaint 补洞，见 3.3）。
2. **Depth map**（最真，适合风景）：MiDaS / DepthAnything 生成深度图 → 按阈值切 2–3 个 mask → 每层 inpaint 补被遮挡区。边缘按真实几何走。
3. **手动遮罩**（最可控）：天空/地平线/地面横向三段切；甚至不用预切图——同一张底图在 Remotion 里放三份，用 `clipPath: inset()` 各取一条带，分别做不同速度位移。

选型：人物/动物/飞船主体 → 方法 1；风景/星云纵深 → 方法 2；简单横向构图 → 方法 3。常混用：AI 抠主体 + 手动切天地。

### 3.3 边缘处理三件套（防"露馅"）

1. **羽化**：抠图边缘 1–2px 柔边（写实风别超过 2px）。
2. **去光晕**：mask 做 1px erode 再抠，宁可少抠 1px 也别留背景边（`cv2.erode` 或 PS「移动边缘」向内缩）。
3. **背景补洞**：抠掉主体后背景层的洞——PS 内容识别填充 / `cv2.inpaint`；取巧方案：背景层用原图放大+高斯模糊垫底，洞被模糊盖住。

### 3.4 Remotion 代码：三层视差

```tsx
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';

// 素材：public/layers/city_bg.jpg, city_mg.png, city_fg.png（每层都要比 1920x1080 大一圈）
export const ParallaxScene: React.FC = () => {
  const frame = useCurrentFrame();
  const camX = interpolate(frame, [0, 150], [0, -120], {extrapolateRight: 'clamp'});
  const zoom = interpolate(frame, [0, 150], [1, 1.08], {extrapolateRight: 'clamp'});

  const LAYERS = [
    {src: 'layers/city_bg.jpg', speed: 0.35, scale: 1.0},  // 远景：慢
    {src: 'layers/city_mg.png', speed: 0.7, scale: 1.02},  // 中景
    {src: 'layers/city_fg.png', speed: 1.15, scale: 1.05}, // 前景：快 + 预放大防露边
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      {LAYERS.map((l) => (
        <AbsoluteFill key={l.src}>
          <Img
            src={staticFile(l.src)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              translate: `${camX * l.speed}px 0px`,
              scale: zoom * l.scale,
            }}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
```

**前景层边缘羽化**（CSS mask 方案，上下柔边融入背景）：

```tsx
<Img
  src={staticFile('layers/city_fg.png')}
  style={{
    width: '100%', height: '100%', objectFit: 'cover',
    translate: `${camX * 1.15}px 0px`,
    maskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)',
  }}
/>
```

**偷懒版**（不预切图，同一张底图三份 `clipPath` 分带，带之间重叠 5% 防缝隙）：

```tsx
const bands = [
  {clip: 'inset(0 0 60% 0)', speed: 0.3},   // 天空：慢
  {clip: 'inset(35% 0 25% 0)', speed: 0.7}, // 远山：中
  {clip: 'inset(70% 0 0 0)', speed: 1.2},   // 地面：快
];
```

**调参经验值**：视差比 0.35 / 0.7 / 1.15 起步；镜头位移总量为画面宽度的 5–10%（1920 → 100–200px）；zoom ≤ 1.1；前景预放大 1.05–1.1。

### 3.5 真实素材接入规范（与视差共用）

- **组件选型**：最终出片一律 `<OffthreadVideo>`（FFmpeg 浏览器外逐帧抽取，帧精确）+ `<Img>`；`<Html5Video>` 仅 Studio 预览；禁用原生 `<img>`/`<video>`/CSS `background-image`（不等待加载 → 黑帧/缺图）。
- **一律预下载到 `public/`**，用 `staticFile()` 引用；禁用远程 URL（网络抖动致缺帧、CORS、不可复现、云渲染不通）。下载脚本 + `ASSET_INVENTORY.md` 台账（文件|来源URL|授权）。
- **素材站**：Pexels 首选（全站统一授权、商用免署名、有 API）、Pixabay 第二、Mixkit（人工精选质量最高）、Coverr（干净背景）、NASA（太空题材公有领域）。避雷 Videvo/Videezy 混合授权。
- **预处理**（正经工序）：`ffmpeg -i in.mp4 -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -vf "scale=1920:-2" -r 30 -fps_mode cfr -c:a aac -movflags +faststart out.mp4`。VFR 必须转 CFR，否则 trim 帧数错位。
- 先 `--frames=0-45` 渲染小样验证管线，再全片渲染。

---

## 四、SVG"画得像"的技巧清单

代码绘制的天花板是风格化插画；以下技巧决定你是在天花板上还是地板上。

### 4.1 让物体可辨识：分层光影

1. **三层渐变模拟体积光**：每个主体拆 3–4 叠层——高光（朝光源，radial 小面积）/ 中间调（基色）/ 暗部（背光，linear 深色）/ 冷色反光。**阴影色要做 hue shift**：暗部偏冷（蓝/紫）、高光偏暖（黄/橙），色彩立刻活起来。
2. **全片光源方向一致**：先定主光源（如左上 45°），所有高光/暗部/投影都指向同一方向。光源混乱是"假"的第一来源。投影用 `feGaussianBlur` 柔和阴影，颜色用背景深色而非纯黑。
3. **参考图描摹工作流**（最稳的"画得像"路径）：找真实照片/AI 生图做底稿 → 钢笔描关键轮廓（只保留识别特征）→ 简化节点 → 换品牌色板 → 做分层光影。形体准确度来自参考图，质感来自后期。
4. **剪影测试**：把物体填纯黑看轮廓能否辨认——辨认不出说明形体本身弱，加细节也救不了。
5. **梯度网格思维**：单个渐变不够时，把大形体拆成多块各带小渐变的面片拼合（如人物面部、动物身体）。

### 4.2 剪影：什么时候够用，什么时候必须上真图

**剪影足够好（甚至更好）的场景**：逆光情绪空镜（日出日落人物剪影）、远景人群（迁徙/战争）、悬念登场（只给轮廓）、表达"人类"整体概念时。红利：绘制要求低、渲染便宜、缩放不糊。

**必须用真实图像/AI 生图的场景**：主体特写（面部表情、动物眼神）、需要辨认细节的科普对象（恐龙牙齿/爪、机械结构、细胞器、地质剖面）、产品展示。

**判断标准**：旁白在讲"它有什么特征"→ 画面必须出现那个特征；旁白在讲"发生了什么/什么感觉" → 剪影往往够用。

### 4.3 去"几何廉价感"：8 条可操作技巧

1. 不用纯色：任何大于指甲盖的色块都给一点明暗变化（哪怕 5% 亮度渐变）。
2. 加噪点纹理：全片叠 `feTurbulence` 胶片颗粒（3–8%），杀掉"过于干净"的塑料感；也可做单个物体表面材质。
3. 边缘不规则化：`feDisplacementMap` 或手抖路径让边缘细微起伏；自然物绝不用完美直线/正圆。
4. 避免完美对称：姿态/构图做不对称处理；对称 = 人造感。
5. 加环境光晕：光源周围 radial gradient bloom，暗场景尤其提质感。
6. 景深虚化：前景模糊暗角、背景轻微失焦（`feGaussianBlur` 分层）——纯代码视频最缺的就是"镜头感"。
7. 暗角：四周压暗 10–20%，收拢视线，电影感最便宜的来源。
8. 全片统一调色：同一套色板 + 同一色温倾向，避免"每个物体从不同图库抠出来"的拼贴感。

> 短期不动管线的"去廉价感手术"：给现有画面加 **全片颗粒 + 暗角 + 统一调色**，再把纯色块换成渐变——性价比最高。

---

## 五、中文科普短片推荐管线 + 每幕 checklist

### 5.1 默认管线：AI 生图背景 + 代码前景

```
分镜 → 风格圣经（定调图+sref+后缀模板）→ 批量生图 → 选图/统一后期
  → Remotion：AI 图做背景层（Ken Burns/视差运镜）
           + 代码层做前景（粒子/尘埃/光斑、图表、字幕、标题）
           + 全局 FilmTreatment（letterbox/vignette/grain/统一色调）
  → TTS 旁白 → still 抽帧 QA → 渲染
```

- 背景层管"具体"（AI 图：草原、洞窟、火车、月面……）
- 代码层管"动"和"信息"（时间线 HUD、数据图表、粒子氛围、字幕、转场）
- 调色层管"统一"（FilmTreatment 把三种来源的画面粘成同一部片子）
- 有现成实拍的镜头（NASA 太空、Pexels 自然）→ 用真实素材替换该幕背景层

### 5.2 每幕画面制作 checklist

**生图/选素材阶段**
- [ ] 视觉描述已按"景别+主体+叙事瞬间"写清，且与旁白文案对应（讲特征→有特征）
- [ ] 提示词套用六维度公式，后半段（光线/镜头/色调/颗粒）与风格圣经逐字一致
- [ ] 每幕出 3–4 张候选，选 1 张：过选图检查清单（色温/颗粒/光源方向/镜头语言/无乱码）
- [ ] 分辨率 ≥ 输出 × 推镜倍率（默认 2K，果断推镜 4K）；四边 10% 安全边距
- [ ] 底部 15% 为暗部/负空间（字幕区）；重要元素避开上下 12%（letterbox 区）
- [ ] 需要视差 → 按第三章拆层并处理边缘；需要横移 → 图已扩成 21:9
- [ ] 真实素材 → 已预下载到 `public/`、已转码 H.264+CFR、已记入 ASSET_INVENTORY

**Remotion 编码阶段**
- [ ] 背景层：`<Img>`/`OffthreadVideo` + `staticFile()`；图片先放大 110% 做底再运镜
- [ ] 运镜：默认慢推 1.0→1.08（easeInOut）；每幕运镜方向与叙事一致（推=深入，拉=揭示）
- [ ] 前景代码层：粒子/图表/字幕；字幕 Noto Sans SC Bold ≥54px，每行 ≤14 字，黑边之上
- [ ] 全局 FilmTreatment 已挂载（letterbox + vignette + 动态 grain + 统一色调）
- [ ] 转场 ≤3 种且语义固定；AI 图之间不用第四种花哨转场

**QA 阶段**
- [ ] `npx remotion still` 抽 5–8 个关键帧：构图（主体不在黑边区）、字幕可读、色调统一、无推镜穿帮/抠图露馅
- [ ] 修完再全量渲染；ffmpeg 抽帧复检后交付

### 5.3 优秀案例速查（画面具体、有电影感）

| # | 案例 | 链接 | 画面管线 |
|---|---|---|---|
| 1 | Fireship "This video was made with code" | https://youtu.be/deg8bOoziaE | 纯代码（Remotion+SVG，高能量 motion graphics 标杆） |
| 2 | GitHub Unwrapped | https://github.com/remotion-dev/github-unwrapped-2023 | 纯代码（数据驱动生成，官方出品） |
| 3 | remotion-showcase-reel（AI 建站产品预告片） | https://github.com/erickcxc/remotion-showcase-reel | 纯代码（重建场景+代码运镜，浅景深/焦点变换） |
| 4 | video-shotcraft "Ink Press" | https://www.youtube.com/watch?v=gcVvRM_P3SM | 混合（真实页面抓取 + 代码运镜/调色） |
| 5 | Parthav "Cinematic Promo Using ONLY Code" | https://www.youtube.com/watch?v=vx5qCAwReRw | 混合（代码骨架 + Gemini AI 生图血肉） |
| 6 | T-cell explainer（T 细胞科普） | https://x.com/DeryaTR_/status/2095659170661904804 | 混合（Remotion 编排 + AI 生图 + AI 配音，直接对标） |
| 7 | Kurzgesagt 级纯代码科普技能 | https://github.com/zhuyansen/awesome-claude-video-skills | 纯代码（风格化扁平插画+强光影+颗粒撑起严肃科普） |
| 8 | FlightGlobe（3D 飞行路线地球仪） | https://github.com/swatimitra88/remotion-usage-in-claude | 纯代码（真实地理数据 + d3-geo，纪录片质感） |

> 启示：纯代码天花板 = 风格化插画/信息设计（1、2、7、8）；混合管线是科普视频的现实最优解（5、6）——**代码管结构，AI 管细节，实拍管质感**。
