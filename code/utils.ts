// 确定性伪随机：渲染铁律 —— 绝不用 Math.random，同一帧每次渲染结果必须一致
export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export const clamp = (v: number, min = 0, max = 1) =>
	Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 画布常量
export const W = 1920;
export const H = 1080;
export const FPS = 30;
