<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'default',
		children,
		...rest
	}: {
		variant?: 'default' | 'primary' | 'card';
		children: Snippet;
	} & HTMLButtonAttributes = $props();
</script>

<button class="button {variant}" {...rest}>{@render children()}</button>

<style>
	.button {
		background: var(--tertiary);
		color: var(--ink);
		box-shadow:
			inset 0 0 0 2px var(--tertiary),
			inset 0 0 0 6px var(--surface);
		padding: 0.85rem 1.5rem;
		margin-block: 1rem;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		border: none;
		width: 100%;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.button:hover {
		background: var(--tertiary-alt);
		box-shadow:
			inset 0 0 0 2px var(--tertiary-alt),
			inset 0 0 0 6px var(--surface);
	}

	.primary {
		background: var(--primary);
		color: var(--surface-alt);
		box-shadow:
			inset 0 0 0 2px var(--primary),
			inset 0 0 0 6px var(--surface-alt);
	}

	.primary:hover {
		background: var(--primary-alt);
		box-shadow:
			inset 0 0 0 2px var(--primary-alt),
			inset 0 0 0 6px var(--surface-alt);
	}

	.card {
		flex: 0 0 auto;
		width: auto;
		margin-block: 0;
		padding-block: 0.55rem;
		box-shadow:
			inset 0 0 0 2px var(--tertiary),
			inset 0 0 0 6px var(--surface-alt);
	}

	.card:hover {
		box-shadow:
			inset 0 0 0 2px var(--tertiary-alt),
			inset 0 0 0 6px var(--surface-alt);
	}
</style>
