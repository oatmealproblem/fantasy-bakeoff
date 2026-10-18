<script lang="ts">
	import type { Snippet } from 'svelte';

	let { narrow = false, children }: { narrow?: boolean; children: Snippet } = $props();
</script>

<main class="page" class:narrow>
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
</style>
