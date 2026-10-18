<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<h1 class="page-title">{@render children()}</h1>

<style>
	.page-title {
		background: var(--accent);
		color: var(--surface-alt);
		box-shadow:
			inset 0 0 0 2px var(--accent),
			inset 0 0 0 6px var(--surface);
		padding: 1rem;
		margin-block-end: 1.25rem;
		font-size: 1.375rem;
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: 0.05em;
		text-align: center;
		text-transform: uppercase;
	}
</style>
