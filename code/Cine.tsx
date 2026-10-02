import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

// ---- 主题常量（按需改） ----
const INK = '#f4f6fb';
const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", serif';
const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// ---- 上下黑边（2.35:1 味道） ----
export const Letterbox: React.FC = () => (
	<>
		<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 88, backgroundColor: '#000', zIndex: 40}} />
		<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 88, backgroundColor: '#000', zIndex: 40}} />
	</>
);

// ---- 暗角 ----
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.5}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
			zIndex: 41,
			pointerEvents: 'none',
		}}
	/>
);

// ---- 胶片颗粒（SVG 噪声 data URI，零依赖） ----
const GRAIN_URI =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export const Grain: React.FC = () => (
	<AbsoluteFill
		style={{backgroundImage: GRAIN_URI, opacity: 0.05, zIndex: 42, pointerEvents: 'none'}}
	/>
);

// ---- 全局电影感处理层：黑边 + 暗角 + 颗粒，盖在所有场景最上层 ----
export const FilmTreatment: React.FC = () => (
	<>
		<Letterbox />
		<Vignette />
		<Grain />
	</>
);

export type SubLine = {text: string; from: number; to: number};

// 把若干句子均匀分布到 [start, start+span) 帧区间（有精确时长时请用 TTS 实测替换）
export function distribute(sentences: string[], start: number, span: number): SubLine[] {
	const per = span / sentences.length;
	return sentences.map((text, i) => ({
		text,
		from: Math.round(start + i * per),
		to: Math.round(start + (i + 1) * per),
	}));
}

// ---- 中文字幕：底部居中，黑边之上，8 帧淡入淡出 ----
export const Subtitles: React.FC<{frame: number; lines: SubLine[]}> = ({frame, lines}) => {
	const active = lines.find((l) => frame >= l.from && frame < l.to);
	if (!active) {
		return null;
	}
	const fade = 8;
	const opacity = clamp(Math.min((frame - active.from) / fade, (active.to - frame) / fade));
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 128,
				left: 0,
				right: 0,
				textAlign: 'center',
				zIndex: 50,
				opacity,
				pointerEvents: 'none',
			}}
		>
			<span
				style={{
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 52,
					color: INK,
					letterSpacing: 4,
					textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)',
				}}
			>
				{active.text}
			</span>
		</div>
	);
};

// ---- 大标题卡：入场放大 + 停留 + 淡出 ----
export const TitleCard: React.FC<{
	title: string;
	sub?: string;
	frame: number;
	inAt: number;
	outAt: number;
	size?: number;
}> = ({title, sub, frame, inAt, outAt, size = 130}) => {
	const p = interpolate(frame, [inAt, inAt + 36, outAt - 28, outAt], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const scale = interpolate(frame, [inAt, inAt + 60], [1.1, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 45,
				opacity: p,
				transform: `scale(${scale})`,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					fontFamily: SERIF,
					fontWeight: 700,
					fontSize: size,
					color: INK,
					letterSpacing: size * 0.3,
					textIndent: size * 0.3,
					textShadow: '0 0 48px rgba(240,180,90,0.35), 0 4px 28px rgba(0,0,0,0.85)',
				}}
			>
				{title}
			</div>
			{sub ? (
				<div
					style={{
						marginTop: 30,
						fontFamily: SANS,
						fontSize: 36,
						color: '#e8c98a',
						letterSpacing: 16,
						textIndent: 16,
						textShadow: '0 2px 14px rgba(0,0,0,0.85)',
					}}
				>
					{sub}
				</div>
			) : null}
		</AbsoluteFill>
	);
};
