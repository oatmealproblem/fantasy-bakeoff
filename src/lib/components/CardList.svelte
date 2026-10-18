<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<ul class="card-list">
	{@render children()}
</ul>

<style>
	.card-list {
		padding: 0;
		list-style: none;
	}
</style>
