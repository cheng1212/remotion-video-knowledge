import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 一个"镜头" = 一张 AI 静帧 + 取景窗动画（zoom + pan，全部由帧推导，渲染确定性）
// 用法：<CameraShot src="img/scene-01.png" duration={150} zoom={[1.15, 1]} pan={[0, 0, -4, 0]} />
export const CameraShot: React.FC<{
	src: string;
	duration: number;
	zoom?: [number, number];
	pan?: [number, number, number, number]; // x0, y0, x1, y1（百分比）
}> = ({src, duration, zoom = [1, 1], pan = [0, 0, 0, 0]}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, duration], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const scale = lerp(zoom[0], zoom[1], p);
	const x = lerp(pan[0], pan[2], p);
	const y = lerp(pan[1], pan[3], p);
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale}) translate(${x}%, ${y}%)`,
				}}
			/>
		</AbsoluteFill>
	);
};
