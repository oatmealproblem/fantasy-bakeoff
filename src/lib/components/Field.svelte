<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { label, ...rest }: { label?: string } & HTMLInputAttributes = $props();
</script>

<label class="field">
	{#if label}{label}{/if}
	<input {...rest} />
</label>

<style>
	.field {
		display: block;
		margin-block: var(--field-margin-block, 0.75rem);
	}

	.field input {
		display: block;
		margin-block-start: 0.25rem;
		background: var(--surface-alt);
		border: 1px solid #ddd;
		border-radius: 0;
		color: var(--ink);
		padding: 0.5rem;
		width: 100%;
		outline: none;
	}

	.field input::placeholder {
		color: #667085;
	}

	.field input:focus {
		border-color: var(--primary-dark);
		box-shadow: 0 0 5px rgba(21, 105, 136, 0.6);
	}
</style>
