<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardActions from '#lib/components/CardActions.svelte';
	import CardForm from '#lib/components/CardForm.svelte';
	import Field from '#lib/components/Field.svelte';
	import { delete_contestant, update_contestant } from '#lib/game.remote.ts';

	let { contestant }: { contestant: { id: string; name: string; picture_url: string } } = $props();

	const update = $derived(update_contestant.for(contestant.id));
	const del = $derived(delete_contestant.for(contestant.id));
</script>

<Card media={!!contestant.picture_url}>
	{#if contestant.picture_url}
		<img class="photo" src={contestant.picture_url} alt={contestant.name} width="48" height="48" />
	{/if}
	<CardForm id="update-contestant-{contestant.id}" {...update}>
		<input {...update.fields.id.as('hidden', contestant.id)} />
		<Field label="Name" {...update.fields.name.as('text', contestant.name)} required />
		<Field label="Picture URL" {...update.fields.picture_url.as('url', contestant.picture_url)} />
	</CardForm>
	<CardActions>
		<Button form="update-contestant-{contestant.id}" variant="card">Save</Button>
		<form {...del}>
			<input {...del.fields.id.as('hidden', contestant.id)} />
			<Button
				variant="card"
				onclick={(e) => {
					if (!confirm(`Delete contestant ${contestant.name}?`)) e.preventDefault();
				}}>Delete</Button
			>
		</form>
	</CardActions>
</Card>

<style>
	.photo {
		position: absolute;
		inset-block-start: 2.5rem;
		inset-inline-start: 1rem;
		width: 42px;
		height: 42px;
		object-fit: cover;
		border-radius: 50%;
	}
</style>
