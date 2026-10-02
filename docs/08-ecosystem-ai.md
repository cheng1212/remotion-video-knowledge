# Remotion + AI 工作流全景（2026-10-03）

> 定位：我们的管线（分镜 → AI 生图 → 中文旁白 → Remotion 合成 → 渲染）每个环节
> 有哪些 AI 工具可选、怎么接入、什么成本。

## 一、AI 生图（电影感背景）

| 方案 | 特点 | 接入做法 |
|------|------|----------|
| **Muse 内置生图**（当前在用）★★★★★ | 无需 key，直接出图，16:9 电影感已验证（《人的一生》12 张） | AI 生图工具（如 Muse / Midjourney / Flux API），`output_dir` 指向项目 `public/img/` |
| Flux API（fal.ai / Replicate）★★★★☆ | 可编程、便宜、一致性好（seed/参考图） | 批量生成分镜背景的首选外部方案，需 API key |
| Midjourney ★★★★☆ | 画面质感上限最高，适合 hero 镜头 | 网页端点图，无官方 API（第三方中转），不适合批量 |
| SDXL 本地 ★★★☆☆ | 免费、离线 | 有 GPU 时降本用，质感需调模型 |

一致性技巧（见 visual-design.md）：定调图 → 风格后缀 → 光源写死 → 锁 seed；
构图给运镜留 15–20% 裁剪余量；源图宽度 ≥ 1920 × 最大 zoom。

## 二、AI 视频生成（图生视频/文生视频）

| 方案 | 特点 |
|------|------|
| 可灵 / 即梦（国内）★★★★☆ | 中文提示词友好，图生视频质量高，适合把 AI 背景图"动起来" |
| Runway Gen-4 / Pika / Luma ★★★☆☆ | 国际主流，成本较高 |
| Veo 3 / Seedance ★★★☆☆ | 前沿质量，贵 |

接入：生成的 clip 经 `<OffthreadVideo>` 或转码后进 Remotion 做前景/转场素材。
注意：AI 视频不可控、贵，只用在"值得的 1–2 个高光镜头"，主体仍是静帧运镜。

## 三、中文 TTS（旁白）——重点升级项

| 档 | 引擎 | 音色 | 特点 | 费用 |
|---|------|------|------|------|
| **免费首选** | edge-tts | `zh-CN-XiaoyiNeural`（晓伊）| 口语、亲切不播音腔，`--rate=+5%` | 免费 |
| 付费质感 | MiniMax `speech-2.8-hd` | `Warm_Bestie`（温暖闺蜜）等 | 有气口、有语气起伏 | ~¥3.5/万字符 |
| 便宜自然 | Qwen3-TTS `qwen3-tts-flash`（阿里百炼）| `Cherry`（芊悦） | 中英混读稳 | ~¥0.8/万字符 |
| 当前 | tts CLI（Meta AI 声） | MAI_03 | 可用，中文非母语感略重 | 已有 |

**升级建议**：旁白是感染力的核心，建议切到 **edge-tts 晓伊**（免费）或
**MiniMax**（付费质感）。注意 edge-tts 是微软在线服务，需联网；逐句合成后
用 ffprobe 测时长（现有流程不变）。

## 四、AI 配乐 / 音效

| 方案 | 用法 |
|------|------|
| Suno / Udio ★★★★☆ | 文生音乐。提示词里**指定 BPM**（如 100 BPM），方便 `framesPerBeat = fps*60/bpm` 卡点；要"不廉价"就选 minimalist cinematic / ambient，别选史诗煽情 |
| ElevenLabs 音效 | whoosh/riser/boom 等转场音效 |
| 免费保底 | YouTube 音频库、Pixabay Music（CC0） |

当前管线缺配乐（《人的一生》是纯旁白）。**加上 BGM 是性价比最高的升级**：
音量包络用 `interpolate` 做淡入淡出，情绪峰值前 4–8 秒先收（见 emotional-shots.md）。

## 五、端到端 AI 视频 Agent 管线（抄作业）

| 项目 | 特点 | 能抄什么 |
|------|------|----------|
| **OpenMontage**（calesthio/OpenMontage，AGPL）★★★★★ | 12 条生产管线，100+ 工具；免费栈：Piper TTS + Archive.org/NASA/Wikimedia/Pexels 素材 + Remotion 合成 + FFmpeg 后期；一句 prompt 跑全片 | 它的"免费素材矩阵"和"管线分工"设计；纪录片类题材可直接用它的 real-footage 管线思路 |
| Nova-Motion ★★★★☆ | Next.js + Remotion + TTS，LLM 生成 JSON 分镜自动渲染 | JSON 分镜 → 场景的自动化结构 |
| short-video-maker ★★★☆☆ | 9:16 短视频 + MCP + REST API | 竖屏批量生产 |
| MoneyPrinterTurbo（120K★）★★★☆☆ | 关键词→成品一键，中文教程多 | 批量内容农场思路，不适合我们电影感路线 |
| itzsaurav/free-remotion-pipeline ★★★☆☆ | reel builder skill，Hormozi 字幕 + 组件库 | 竖屏 reel 的组件搭配 |

## 六、自动字幕 / Whisper

- `@remotion/openai-whisper` / `@remotion/install-whisper-cpp`：旁白 mp3 → 词级时间轴 →
  `@remotion/captions` 做 karaoke 字幕，或校准我们手写字幕的对轴。
- 流程位置：TTS 合成后、写 layout 之前跑一遍，输出 JSON 给分镜用。

## 七、免费影像素材（真实质感备选）

| 来源 | 说明 | 接入 |
|------|------|------|
| Pexels / Pixabay / Unsplash | 免费可商用，developer key 免费申请 | 下载到 `public/footage/`，`<OffthreadVideo>` 引用；先 ffmpeg 转 h264/aac |
| Archive.org / NASA / Wikimedia | 历史/科学纪录片质感 | 同上，适合三体、人类史题材 |
| Coverr | 免费视频 | 同上 |

选型原则（见 visual-design.md）：讲"特征"（可辨认细节）→ 真实素材/AI 生图；
讲"感觉" → 剪影/代码。AI 生图 60% + 真实素材 20% + 纯代码 20%。

## 八、管线升级建议（按投入产出比排序）

1. **旁白换 edge-tts 晓伊**（免费）：感染力提升最明显，半天工作量。
2. **加上 BGM**（Suno 定 BPM 生成 / Pixabay Music 免费）：纯旁白→完整声场，一天工作量。
3. **转场换 remocn / @remotion/transitions**：甩镜/zoom blur 质量跃升，几小时。
4. **Whisper 自动对轴**：字幕从"均分估时"→"词级精确"，半天。
5. **可灵图生视频做 1–2 个高光镜头**：成本高，放最后，只在值得的片子用。
