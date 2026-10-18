<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { label, ...rest }: { label: string } & HTMLInputAttributes = $props();
</script>

<label class="checkbox">
	<input {...rest} />
	{label}
</label>

<style>
	.checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-block: 0.4rem;
		vertical-align: middle;
	}

	.checkbox input {
		accent-color: var(--primary);
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
	}
</style>
