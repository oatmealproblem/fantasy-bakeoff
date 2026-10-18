export type ScoreChartRow = { name: string; change: number; total: number };

// Portion of a bar: retained previous score, change away from zero (solid), or change toward zero (striped).
export type ScoreSegment = { start: number; end: number; kind: 'kept' | 'gained' | 'lost' };

export function score_segments(previous: number, total: number): ScoreSegment[] {
	const points = [...new Set([0, previous, total])].sort((a, b) => a - b);
	const inside = (value: number, a: number, b: number) =>
		value >= Math.min(a, b) && value <= Math.max(a, b);

	return points.slice(1).map((end, i) => {
		const start = points[i];
		const middle = (start + end) / 2;
		const kept = inside(middle, 0, previous) && inside(middle, 0, total);
		return {
			start,
			end,
			kind: kept ? 'kept' : inside(middle, 0, total) ? 'gained' : 'lost'
		};
	});
}
