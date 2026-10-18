<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';

	let { children, ...rest }: { children: Snippet } & HTMLFormAttributes = $props();
</script>

<form class="card-form" {...rest}>{@render children()}</form>

<style>
	.card-form {
		--field-margin-block: 0;

		flex: 1 1 100%;
		min-width: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		align-items: end;
		gap: 0.5rem;
	}
</style>
