<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		contestant,
		...rest
	}: {
		contestant: { name: string; picture_url?: string | null };
	} & HTMLInputAttributes = $props();
</script>

<label class="contestant-option">
	<input {...rest} />
	{#if contestant.picture_url}
		<img src={contestant.picture_url} alt={contestant.name} width="48" height="48" />
	{/if}
	{contestant.name}
</label>

<style>
	.contestant-option {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-block: 0.4rem;
		vertical-align: middle;
		width: 50%;
		padding: 0.25rem;
		cursor: pointer;
	}

	@media (width >= 40rem) {
		.contestant-option {
			width: 25%;
		}
	}

	.contestant-option input {
		accent-color: var(--primary);
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
	}

	.contestant-option img {
		border-radius: 50%;
		object-fit: cover;
	}
</style>
