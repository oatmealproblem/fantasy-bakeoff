<script lang="ts">
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	let {
		label,
		multiline = false,
		wide = false,
		...rest
	}: {
		label?: string;
		multiline?: boolean;
		wide?: boolean;
	} & HTMLInputAttributes &
		HTMLTextareaAttributes = $props();
</script>

<label class={['field', { wide }]}>
	{#if label}{label}{/if}
	{#if multiline}
		<textarea {...rest as HTMLTextareaAttributes}></textarea>
	{:else}
		<input {...rest as HTMLInputAttributes} />
	{/if}
</label>

<style>
	.field {
		display: block;
		margin-block: var(--field-margin-block, 0.75rem);
	}

	.field.wide {
		grid-column: 1 / -1;
	}

	.field input,
	.field textarea {
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

	.field textarea {
		min-height: 4rem;
		resize: vertical;
	}

	.field input::placeholder,
	.field textarea::placeholder {
		color: #667085;
	}

	.field input:focus,
	.field textarea:focus {
		border-color: var(--primary-dark);
		box-shadow: 0 0 5px rgba(21, 105, 136, 0.6);
	}
</style>
