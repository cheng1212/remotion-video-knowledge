# Remotion 电影感短视频知识库

用 **Remotion（React 程序化渲染视频）** 制作电影感中文短视频（中文旁白 + 中文字幕）的完整知识体系：从"讲什么故事"到"怎么渲染成片"，每一步都有手册、有规范、有能直接抄的代码。

源自 3 部实战短片的沉淀（113 秒、7 幕 12 镜、AI 生图背景 + 程序化运镜 + 中文旁白，已验证走通）。

## 知识地图（按制作流程）

### 1. 讲故事 —— 先有故事，再有镜头

| 手册 | 解决什么 |
|------|----------|
| [01 故事讲述](docs/01-storytelling.md) | "一生"类短片的结构、情感曲线、旁白写作规范、人生切片选择标准 |
| [02 情感镜头](docs/02-emotional-shots.md) | 11 种情感镜头范式、视觉隐喻词典、眼泪开关清单。核心纪律：**克制**（峰值静默、拍余波不拍高潮） |

### 2. 写分镜 —— 把故事翻译成镜头

| 手册 | 解决什么 |
|------|----------|
| [03 镜头语言](docs/03-shot-language.md) | 景别 7 级（配 Remotion 参数）、角度、运镜 10 种（时长+幅度规范）、构图、剪辑语法；每个概念配 Remotion 实现代码 |

### 3. 做画面 —— 从"抽象"到"具体"

| 手册 | 解决什么 |
|------|----------|
| [04 视觉管线](docs/04-visual-design.md) | 三种画面管线选型、AI 生图 workflow、单图多层视差、SVG 去廉价感 |
| [05 电影感设计](docs/05-design-playbook.md) | 运镜铁律、视差三层、转场语义、文字设计、五层调色、节奏卡点、7 条反模式 |

**默认管线**：AI 生图生成 16:9 电影感背景 → `public/img/` → Remotion 里做推/拉/视差运镜；纯代码只画粒子/图表/剪影。

### 4. 拿动效 —— 站在组件库肩膀上

| 手册 | 解决什么 |
|------|----------|
| [06 第三方组件库](docs/06-component-libraries.md) | 4 个社区库 + remocn，负责动效层（标题/转场/粒子/图表） |
| [07 官方扩展包全景](docs/07-ecosystem-components.md) | `@remotion/*` 包全览 + 推荐安装组合 |

### 5. 配声音 —— 旁白是感染力的核心

见 [08 AI 工作流全景](docs/08-ecosystem-ai.md)：中文 TTS 选型（edge-tts 晓伊免费首选 / MiniMax 付费质感）、AI 配乐（Suno 指定 BPM 卡点）、Whisper 自动对轴、免费影像素材。

### 6. 写代码 —— Remotion 工程

| 手册 | 解决什么 |
|------|----------|
| [09 API 速查](docs/09-api-cheatsheet.md) | interpolate/spring/Sequence/TransitionSeries/音频/运镜/渲染 flags/常见坑，每节带可运行代码 |
| [10 工程经验](docs/10-engineering-notes.md) | 目录结构约定、渲染内存坑（图片多时分段渲染 + ffmpeg 拼接） |

`code/` 目录有开箱即用的组件：`Cine.tsx`（黑边/暗角/颗粒/字幕/标题卡）、`CameraShot.tsx`（静帧运镜镜头）、`utils.ts`（确定性随机 mulberry32）。

### 7. 验片交付

`npx remotion still` 抽 5–8 个关键帧看构图/字幕/色调 → 修 → 全量渲染（`--concurrency=1 --frames=A-B` 分段，ffmpeg concat 拼接）→ `out/<name>.mp4`。

## 快速开始

```sh
# 新项目推荐安装组合（Remotion 4.x，注意与主版本对齐）
npm i @remotion/transitions @remotion/google-fonts \
  @remotion/media-utils @remotion/noise \
  @remotion/motion-blur @remotion/captions

# 高质量转场按需取（shadcn 风格 registry）
npx shadcn add https://remocn.vercel.app/r/<component-name>.json
```

## 仓库结构

```
├── README.md          # 你正在读的：总纲
├── docs/              # 10 份手册，按制作流程编号
│   ├── 01-storytelling.md ~ 05-design-playbook.md   # 策划/分镜/画面
│   ├── 06-component-libraries.md ~ 08-ecosystem-ai.md # 生态/AI 工作流
│   └── 09-api-cheatsheet.md ~ 10-engineering-notes.md # 工程
├── code/              # 可复用组件（Cine / CameraShot / utils）
└── LICENSE            # MIT
```

## 说明

- 全部内容为中文，面向"中文旁白 + 中文字幕"的创作场景。
- 第三方库引用处均标注了来源与许可证（多为 MIT），使用前请核对版本兼容性。
- 这是一份持续更新的知识库：生态在变，手册会跟着修订。

MIT License —— 随便用，欢迎提 PR。
