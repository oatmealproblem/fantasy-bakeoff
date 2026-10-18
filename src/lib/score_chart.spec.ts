import { expect, it } from 'vitest';
import { score_segments } from './score_chart.ts';

const segments = (previous: number, total: number) =>
	score_segments(previous, total).map((s) => `${s.start}..${s.end}:${s.kind}`);

it('marks retained score, gains and losses', () => {
	expect(segments(5, 8)).toEqual(['0..5:kept', '5..8:gained']);
	expect(segments(5, 3)).toEqual(['0..3:kept', '3..5:lost']);
	expect(segments(0, 0)).toEqual([]);
});

it('reverses solid and striped on negative scores', () => {
	expect(segments(-5, -3)).toEqual(['-5..-3:lost', '-3..0:kept']);
	expect(segments(-5, -8)).toEqual(['-8..-5:gained', '-5..0:kept']);
});

it('stripes before a zero crossing and keeps solid after it', () => {
	expect(segments(5, -3)).toEqual(['-3..0:gained', '0..5:lost']);
	expect(segments(-5, 3)).toEqual(['-5..0:lost', '0..3:gained']);
});
