# 可复用资产（此前两个项目的沉淀）

两个已交付项目：实战项目（可复用代码见本仓库 `code/` 目录）（三体·二向箔）、实战项目（人类奥德赛）。
技术栈：Remotion **4.0.532** + React 18，每个项目独立 `npm i`（`@remotion/cli`、`remotion`、`react`、`react-dom`），无全局安装。

## 可直接抄的组件

- 本仓库 `code/Cine.tsx`：`Letterbox`（上下黑边）、`Vignette`（暗角）、`Grain`
  （SVG 噪点颗粒，opacity 0.055）、`Fade`（场景淡入淡出）、`Subtitle`（底部字幕，思源黑体、
  强阴影）、`TitleCard`（大标题卡：缩放 1.12→1 + 透明度包络）、`Flash`（全屏闪光）。
  字体常量 `SERIF` / `SANS` 指向 Noto Serif/Sans CJK SC。
- `本仓库 code/ 目录下的Starfield.tsx`：星空背景（确定性随机 + 呼吸闪烁）。
- `本仓库 `code/utils.ts``：`mulberry32(seed)` 确定性伪随机（**渲染铁律：绝不用 Math.random**）、
  `clamp`、`lerp`。
- ``code/theme.ts` 中的尺寸常量`：`W` / `H` 画布尺寸常量。
- 各场景文件是"一幕一组件 + offset 参数"的范式，可照抄骨架。

## 工程结构约定

```
<project>/
  src/index.ts            # 注册 RemotionRoot
  src/Root.tsx            # Composition + Sequence 串联各幕，Audio 挂载旁白/环境音
  src/layout.ts           # W/H、各幕时长（帧数）常量 S1..Sn、TOTAL
  src/utils.ts            # mulberry32 / clamp / lerp
  src/components/*.tsx    # Cine.tsx 等可复用视觉层
  src/scenes/Scene*.tsx   # 每幕一个组件，props 接收 offset
  public/audio/*.mp3      # 旁白 s1..sn.mp3、whoosh/riser/boom 音效、ambient 环境音
  STORYBOARD.md           # 分镜脚本（年代/文案/视觉/时长表）
  out/<name>.mp4          # 成片
```

## 关键实践

- 旁白 mp3 由 TTS 预先生成，放在 `public/audio/`，用 `staticFile('audio/s1.mp3')` 引用；
  每幕时长 = 旁白时长 + 缓冲帧，写在 `layout.ts`。
- 旁白用 `<Audio src={...} startFrom={18}/>` 略延迟入场（18 帧 ≈ 0.6s），避免和转场撞车；
  音效 whoosh 用 `volume={0.4}`。
- 画布 1920×1080 @30fps；每幕开场 16 帧 whip pan（高速横向切入 + 速度线）。
- 渲染：`cd <project> && npx remotion render src/index.ts <CompositionId> out/<name>.mp4`
- **内存坑（2026-10-02《人的一生》）**：AI 生图背景（1920×1280 webp）+ 全局颗粒层时，
  Chrome 内存随帧数累积增长，3391 帧单进程必爆（`Could not take a screenshot`，
  `--concurrency=1` 也只能撑到 ~1800 帧）。**解法：分段渲染再拼接**：
  `npx remotion render ... out/partN.mp4 --concurrency=1 --frames=A-B`，
  然后 `ffmpeg -f concat -safe 0 -i list.txt -c copy out/final.mp4`。
  每段控制在 ~1100 帧以内。
- 验帧：`npx remotion still src/index.ts <CompositionId> --frame=<N> still-<N>.png`
  （便宜的设计 QA，渲染前必看关键帧）。

## 用户偏好（已验证）

- 中文旁白 + 中文字幕；电影感三件套：黑边 / 暗角 / 颗粒。
- 旁白文案要有感染力（用户曾批评第一版"不够有感染力"）：短句、意象、排比，
  避免说明文腔。
- 历史/科普题材：关键里程碑必须按严格正确的时间顺序，年代数字要核对。
