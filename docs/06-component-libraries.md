# Remotion 组件库调研（2026-10-03）

> 来源：用户分享的"Remotion组件库"视频（李先森AI）。四个库均为 MIT 协议（或等同），
> 可直接搭配 Remotion 使用。它们都是**动效组件库**（文字动效/转场/图表/背景/粒子），
> 与我们的"AI 生图背景 + 程序化运镜"管线是**互补关系**：库负责动效层，我们负责影像层。

## 1. RVE — reactvideoeditor/remotion-templates（81 个）

- 仓库：https://github.com/reactvideoeditor/remotion-templates
- 在线预览：https://www.reactvideoeditor.com/remotion-templates
- 内容：kinetic typography、音频波形可视化、社交媒体弹窗（点赞/关注/聊天气泡）、
  无缝转场（wipe/zoom）、图表动画。每个模板是自包含 React 组件，
  只用 `useCurrentFrame` / `interpolate` / `spring`。
- 用法：直接抄单个文件进 `src/components/` 即可，无需安装整个库。
- 适配我们：转场库（WhipPan/PushThrough/ZoomBlur/GlitchCut 等）可直接替换手写转场；
  数据类视频可用图表组件。

## 2. Scenes — lifeprompt-team/remotion-scenes（201 个）

- 仓库：https://github.com/lifeprompt-team/remotion-scenes
- 在线预览（全部 201 个可试播）：https://lifeprompt-team.github.io/remotion-scenes/
- 内容：16 大类——Text / Shape / Transition / Data / Effect / UI / Logo /
  Background / Particle / Cinematic / Layout / Demo / List / Theme / Roller / Liquid。
- 用法：`npx degit lifeprompt-team/remotion-scenes my-video` 整库克隆，或
  `npx degit lifeprompt-team/remotion-scenes/src/scenes/TextAnimations ./my-text-animations`
  按类只取需要的。
- 适配我们：**最对口的一个**。CinematicAnimations（史诗/恐怖/浪漫/科幻标题）、
  EffectAnimations（film grain、VHS、chromatic aberration）、BackgroundAnimations
  （aurora、mesh、grid）、TransitionAnimations（百叶窗、圆形擦除、液体变形）
  都能直接用。注意部分组件依赖其 `src/common`（colors/easing/fonts），
  拷贝时要连带 `common/` 一起拿。

## 3. Curvable — @curvable/motion（14 个）

- 仓库：https://github.com/Curvable/motion
- 在线预览：https://curvable.ai/library
- 安装：`npm install @curvable/motion remotion react`（npm 包形式，最省事）
- 内容：7 个文字场景 + 4 个背景 + 3 个复合场景（FloatingStack / PromptInput / StatsGrid）。
  设计规范很强：每个组件导出 `Defaults`（可直接 spread 进 inputProps）、`Meta`
  （宽高 fps）、`compute<Name>Duration`（变长场景算时长）；只传一个 `primary` 主色，
  其余配色自动在 HSL 空间推导。
- 适配我们：偏**品牌/产品发布会**风格（Geist 字体、英文语境），电影感中文短片
  直接用的机会较少；但它的"单主色推导全套配色"和"computeDuration"规范值得抄。

## 4. Playground — jessai2026/remotion-playground（24–38 个）

- 仓库：https://github.com/jessai2026/remotion-playground
- 内容：production-ready 动画示例 + 从 0 到 1 的教程。偏**学习向**，
  适合查"某个效果怎么写"时当 cookbook 翻。
- 适配我们：教程价值大于组件价值；遇到不会写的效果先来这里找例子。

## 额外发现：remocn（1551 stars，可重点关注）

- 仓库：https://github.com/Remocn/remocn
- shadcn 风格的 registry：转场/背景/场景/动画，`npx` 式按需安装。
  社区活跃度最高（680 commits），质量可能是四个之外最好的。之前 design-playbook
  里已经收录过它的转场（WhipPan / PushThrough / FocusPull / ZoomBlur / GlitchCut）。

## 使用规范（纳入管线）

1. 优先顺序：**Scenes（抄文件）> RVE（抄文件）> remocn（registry 安装）>
   Curvable（npm 包，品牌风才用）> Playground（查教程）**。
2. 拷贝第三方组件时：连带其依赖的 `common/`、字体、peer deps 一起检查；
   确认只用 Remotion 核心 hooks（`useCurrentFrame`/`interpolate`/`spring`/
   `Sequence`/`staticFile`），避开 `@remotion/media` 新版 API（我们是 4.0.532，
   新版的 `<Audio>` 改名会导致不兼容）。
3. 第三方组件只负责**动效层**（标题/转场/粒子/图表），影像层仍走 AI 生图；
   拿来后按我们的 FilmTreatment（黑边/暗角/颗粒/统一色调）过一遍，保证全片一致。
4. 中文字体：第三方组件多为英文设计，涉及文字的组件要把字体换成
   Noto Sans/Serif CJK SC，并检查 `letter-spacing`（中文设 0 或小值）。
