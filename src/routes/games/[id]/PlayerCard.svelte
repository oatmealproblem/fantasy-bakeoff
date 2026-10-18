<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardActions from '#lib/components/CardActions.svelte';
	import CardForm from '#lib/components/CardForm.svelte';
	import Field from '#lib/components/Field.svelte';
	import { delete_player, update_player } from '#lib/game.remote.ts';

	let {
		player
	}: { player: { id: string; name: string; email: string | null; score_adjustment: number } } =
		$props();

	const update = $derived(update_player.for(player.id));
	const del = $derived(delete_player.for(player.id));
</script>

<Card>
	<CardForm id="update-player-{player.id}" {...update} style="--card-form-min: 10rem">
		<input {...update.fields.id.as('hidden', player.id)} />
		<Field label="Name" {...update.fields.name.as('text', player.name)} required />
		<Field label="Email" {...update.fields.email.as('email', player.email ?? '')} />
		<Field
			label="Starting score"
			{...update.fields.score_adjustment.as('number', player.score_adjustment)}
		/>
	</CardForm>
	<CardActions>
		<Button form="update-player-{player.id}" variant="card">Save</Button>
		<form {...del}>
			<input {...del.fields.id.as('hidden', player.id)} />
			<Button
				variant="card"
				onclick={(e) => {
					if (!confirm(`Delete player ${player.name}?`)) e.preventDefault();
				}}>Delete</Button
			>
		</form>
	</CardActions>
</Card>
