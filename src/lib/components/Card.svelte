<script lang="ts">
	import type { Snippet } from 'svelte';

	let { media = false, children }: { media?: boolean; children: Snippet } = $props();
</script>

<li class="card" class:media>{@render children()}</li>

<style>
	.card {
		background: var(--surface-alt);
		padding: 0.75rem 1rem;
		margin-block-end: 0.75rem;
		display: flex;
		flex-flow: row wrap;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.media {
		position: relative;
		padding-inline-start: 4.5rem;
	}
</style>
