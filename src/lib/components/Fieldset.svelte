<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		legend,
		disabled = false,
		children
	}: { legend: string; disabled?: boolean; children: Snippet } = $props();
</script>

<fieldset class="fieldset" {disabled}>
	<legend>{legend}</legend>
	{@render children()}
</fieldset>

<style>
	.fieldset {
		border: 0;
		margin-block: 1.5rem;
		padding: 0;
		min-inline-size: 0;
	}

	.fieldset legend {
		color: var(--primary);
		margin-block-end: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.fieldset:disabled {
		opacity: 0.75;
	}
</style>
