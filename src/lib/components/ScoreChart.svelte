<script lang="ts">
	import { score_segments, type ScoreChartRow } from '#lib/score_chart.ts';

	let { rows }: { rows: ScoreChartRow[] } = $props();

	const min = $derived(
		Math.min(0, ...rows.map((row) => Math.min(row.total - row.change, row.total)))
	);
	const max = $derived(
		Math.max(0, ...rows.map((row) => Math.max(row.total - row.change, row.total)))
	);
	const span = $derived(max - min || 1);
	const zero = $derived(((0 - min) / span) * 100);
	const position = (value: number) => ((value - min) / span) * 100;
	const format = (change: number) => (change > 0 ? `+${change}` : `${change}`);
</script>

<ul class="chart" style:--zero="{zero}%">
	<li class="row header" aria-hidden="true">
		<span>Player</span>
		<span class="value">Prev</span>
		<span class="value">Change</span>
		<span class="value">Total</span>
		<span></span>
	</li>
	{#each rows as row, i (i)}
		<li class="row">
			<span class="name">{row.name}</span>
			<span class="value">
				<span class="sr-only">Previous: </span>
				{row.total - row.change}
			</span>
			<span class="value">
				<span class="sr-only">Change this round: </span>
				{format(row.change)}
			</span>
			<span class="value">
				<span class="sr-only">Total: </span>
				{row.total}
			</span>
			<div class="bar" aria-hidden="true">
				{#each score_segments(row.total - row.change, row.total) as segment (segment.start)}
					<span
						class="segment {segment.kind}"
						class:negative={segment.end <= 0}
						style:left="{position(segment.start)}%"
						style:width="{position(segment.end) - position(segment.start)}%"
					></span>
				{/each}
			</div>
		</li>
	{/each}
</ul>

<style>
	.chart {
		display: grid;
		gap: 0.5rem;
		padding: 0;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(4rem, 1fr) 3rem 3rem 3rem minmax(6rem, 2fr);
		align-items: center;
		gap: 0.75rem;
	}

	.header {
		color: var(--primary);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.value {
		font-variant-numeric: tabular-nums;
		text-align: end;
	}

	.bar {
		position: relative;
		height: 1.25rem;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--tertiary) 40%, var(--surface-alt));
		overflow: hidden;
	}

	.bar::before {
		content: '';
		position: absolute;
		inset-block: 0;
		left: var(--zero);
		z-index: 1;
		width: 2px;
		background: var(--tertiary-alt);
	}

	.segment {
		position: absolute;
		inset-block: 0;
		transform-origin: left;
		transition:
			left 250ms ease,
			width 250ms ease;
		animation: grow 350ms ease-out;
	}

	.segment.negative {
		transform-origin: right;
	}

	@keyframes grow {
		from {
			transform: scaleX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.segment {
			transition: none;
			animation: none;
		}
	}

	.kept {
		background: var(--primary);
	}

	.gained {
		background: var(--accent);
	}

	.lost {
		background: repeating-linear-gradient(
			135deg,
			var(--accent) 0 0.25rem,
			transparent 0.25rem 0.5rem
		);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
