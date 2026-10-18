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

	let timezone = $state('');
	onMount(() => {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	});
</script>

<Page>
	<p><a href="/">← All games</a></p>
	<PageTitle>{game.name}</PageTitle>

	<form {...update_game}>
		<input {...update_game.fields.id.as('hidden', game.id)} />
		<Field {...update_game.fields.name.as('text', game.name)} required />
		<Button>Rename</Button>
		{#each update_game.fields.name.issues() ?? [] as issue (issue.message)}
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
			<CardForm id="add-round" {...add_round}>
				<input {...add_round.fields.game_id.as('hidden', game.id)} />
				<input {...add_round.fields.timezone.as('hidden', timezone)} />
				<Field label="Round name" {...add_round.fields.name.as('text')} required />
				<Field label="Bonus question" {...add_round.fields.bonus_question.as('text')} />
				<Checkbox
					label="Allow finale prediction"
					{...add_round.fields.allow_finale_prediction.as('checkbox')}
				/>
				<Checkbox label="Finale" {...add_round.fields.is_finale.as('checkbox')} />
				<Field
					label="Expected number sent home"
					{...add_round.fields.expected_number_sent_home.as('number', 1)}
					min="1"
				/>
				<Field
					label="Response deadline"
					{...add_round.fields.response_deadline.as('datetime-local')}
				/>
			</CardForm>
			{#each add_round.fields.allIssues() ?? [] as issue (issue.message)}
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
			<CardForm id="add-player" {...add_player}>
				<input {...add_player.fields.game_id.as('hidden', game.id)} />
				<Field label="Name" {...add_player.fields.name.as('text')} required />
				<Field label="Email" {...add_player.fields.email.as('email')} />
			</CardForm>
			<CardActions>
				<Button form="add-player" variant="card">Add player</Button>
			</CardActions>
		</Card>
	</CardList>

	<SectionHeading>Contestants</SectionHeading>
	<form {...import_contestants}>
		<input {...import_contestants.fields.game_id.as('hidden', game.id)} />
		<Field
			label="Series"
			{...import_contestants.fields.series.as('number')}
			min="1"
			max="20"
			required
		/>
		<Button>Import from GBBO</Button>
		{#each import_contestants.fields.allIssues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
		{#if import_contestants.result}
			<p>Imported {import_contestants.result.imported} contestants.</p>
		{/if}
	</form>

	<CardList>
		{#each game.contestants as contestant (contestant.id)}
			<ContestantCard {contestant} />
		{/each}
		<Card>
			<CardForm id="add-contestant" {...add_contestant}>
				<input {...add_contestant.fields.game_id.as('hidden', game.id)} />
				<Field label="Name" {...add_contestant.fields.name.as('text')} required />
				<Field label="Picture URL" {...add_contestant.fields.picture_url.as('url')} />
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
