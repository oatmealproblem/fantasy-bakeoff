<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardActions from '#lib/components/CardActions.svelte';
	import CardForm from '#lib/components/CardForm.svelte';
	import CardList from '#lib/components/CardList.svelte';
	import Checkbox from '#lib/components/Checkbox.svelte';
	import Field from '#lib/components/Field.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import {
		add_contestant,
		add_player,
		add_round,
		delete_game,
		get_game,
		import_contestants,
		update_game
	} from '#lib/game.remote.ts';
	import ContestantCard from './ContestantCard.svelte';
	import PlayerCard from './PlayerCard.svelte';
	import RoundCard from './RoundCard.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const game = $derived(await get_game(params.id));
	const update = $derived(update_game.for(params.id));
	const add_round_form = $derived(add_round.for(params.id));
	const add_player_form = $derived(add_player.for(params.id));
	const import_form = $derived(import_contestants.for(params.id));
	const add_contestant_form = $derived(add_contestant.for(params.id));

	let timezone = $state('');
	onMount(() => {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	});
</script>

<Page>
	<p><a href="/">← All games</a></p>
	<PageTitle>{game.name}</PageTitle>

	<form {...update}>
		<input {...update.fields.id.as('hidden', game.id)} />
		<Field {...update.fields.name.as('text', game.name)} required />
		<Button>Rename</Button>
		{#each update.fields.name.issues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
	</form>

	<form {...delete_game}>
		<input {...delete_game.fields.id.as('hidden', game.id)} />
		<Button
			onclick={(e) => {
				if (!confirm(`Delete ${game.name} and everything in it?`)) e.preventDefault();
			}}>Delete game</Button
		>
	</form>

	<CardList>
		{#each game.rounds as round (round.id)}
			<RoundCard game_id={game.id} {round} {timezone} />
		{/each}
		<Card>
			<SectionHeading level={3} flush>New Round</SectionHeading>
			<CardForm id="add-round" {...add_round_form}>
				<input {...add_round_form.fields.game_id.as('hidden', game.id)} />
				<input {...add_round_form.fields.timezone.as('hidden', timezone)} />
				<Field label="Round name" {...add_round_form.fields.name.as('text')} required />
				<Field label="Bonus question" {...add_round_form.fields.bonus_question.as('text')} />
				<Checkbox
					label="Allow finale prediction"
					{...add_round_form.fields.allow_finale_prediction.as('checkbox')}
				/>
				<Checkbox label="Finale" {...add_round_form.fields.is_finale.as('checkbox')} />
				<Field
					label="Expected number sent home"
					{...add_round_form.fields.expected_number_sent_home.as('number', 1)}
					min="1"
				/>
				<Field
					label="Response deadline"
					{...add_round_form.fields.response_deadline.as('datetime-local')}
				/>
				<Field
					label="Survey message"
					multiline
					wide
					{...add_round_form.fields.survey_message.as('text')}
				/>
			</CardForm>
			{#each add_round_form.fields.allIssues() ?? [] as issue (issue.message)}
				<p class="issue">{issue.message}</p>
			{/each}
			<CardActions>
				<Button form="add-round" variant="card">Add round</Button>
			</CardActions>
		</Card>
	</CardList>

	<SectionHeading>Players</SectionHeading>
	<CardList>
		{#each game.players as player (player.id)}
			<PlayerCard {player} />
		{/each}
		<Card>
			<CardForm id="add-player" {...add_player_form} style="--card-form-min: 10rem">
				<input {...add_player_form.fields.game_id.as('hidden', game.id)} />
				<Field label="Name" {...add_player_form.fields.name.as('text')} required />
				<Field label="Email" {...add_player_form.fields.email.as('email')} />
				<Field
					label="Starting score"
					{...add_player_form.fields.score_adjustment.as('number', 0)}
				/>
			</CardForm>
			<CardActions>
				<Button form="add-player" variant="card">Add player</Button>
			</CardActions>
		</Card>
	</CardList>

	<SectionHeading>Contestants</SectionHeading>
	<form {...import_form}>
		<input {...import_form.fields.game_id.as('hidden', game.id)} />
		<Field label="Series" {...import_form.fields.series.as('number')} min="1" max="20" required />
		<Button>Import from GBBO</Button>
		{#each import_form.fields.allIssues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
		{#if import_form.result}
			<p>Imported {import_form.result.imported} contestants.</p>
		{/if}
	</form>

	<CardList>
		{#each game.contestants as contestant (contestant.id)}
			<ContestantCard {contestant} />
		{/each}
		<Card>
			<CardForm id="add-contestant" {...add_contestant_form}>
				<input {...add_contestant_form.fields.game_id.as('hidden', game.id)} />
				<Field label="Name" {...add_contestant_form.fields.name.as('text')} required />
				<Field label="Picture URL" {...add_contestant_form.fields.picture_url.as('url')} />
			</CardForm>
			<CardActions>
				<Button form="add-contestant" variant="card">Add contestant</Button>
			</CardActions>
		</Card>
	</CardList>
</Page>

<style>
	.issue {
		flex: 1 1 100%;
	}
</style>
