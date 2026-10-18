<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		level = 2,
		flush = false,
		children
	}: { level?: 2 | 3 | 4 | 5 | 6; flush?: boolean; children: Snippet } = $props();
</script>

<svelte:element this={`h${level}`} class="section-heading" class:flush>
	{@render children()}
</svelte:element>

<style>
	.section-heading {
		flex: 1 1 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-block: 2rem 1rem;
		color: var(--primary);
		font-size: 1.125rem;
		font-weight: 500;
		line-height: 1.35;
		letter-spacing: 0.03em;
		text-align: center;
		text-transform: uppercase;
	}

	.section-heading::before,
	.section-heading::after {
		content: '';
		flex: 1;
		height: 2px;
		background: var(--tertiary);
	}

	.flush {
		margin-block-start: 0;
	}
</style>
