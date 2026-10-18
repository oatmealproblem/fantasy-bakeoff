<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="card-actions">{@render children()}</div>

<style>
	.card-actions {
		flex: 1 1 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
