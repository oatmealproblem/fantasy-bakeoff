<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		narrow = false,
		wide = false,
		fill = false,
		children
	}: { narrow?: boolean; wide?: boolean; fill?: boolean; children: Snippet } = $props();
</script>

<main class="page" class:narrow class:wide class:fill>
	{@render children()}
</main>

<style>
	.page {
		--paragraph-margin: 1rem;

		flex: 1;
		width: 100%;
		max-width: 40rem;
		margin-inline: auto;
		padding: 1.5rem 1rem;
	}

	.narrow {
		flex: 0 0 auto;
		max-width: 24rem;
		margin-block: 4rem auto;
		padding: 2rem;
		background: var(--surface-alt);
	}

	.wide {
		max-width: 80rem;
	}

	.fill {
		display: flex;
		flex: 0 0 auto;
		flex-direction: column;
		height: 100svh;
		overflow: hidden;
	}
</style>
