<script lang="ts">
	import { get_user, sign_out } from '#lib/auth.remote.ts';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardList from '#lib/components/CardList.svelte';
	import Field from '#lib/components/Field.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Table from '#lib/components/Table.svelte';
	import { create_game, get_games } from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const user = await get_user();
	const recent_surveys = $derived(data.recent_surveys);
</script>

<Page>
	<PageTitle>Fantasy Bake Off</PageTitle>

	{#if user}
		<p>Signed in as {user.name}.</p>
		<form {...sign_out}>
			<Button>Sign out</Button>
		</form>

		<SectionHeading>Your games</SectionHeading>
		<CardList>
			{#each await get_games() as game (game.id)}
				<Card><a class="game-link" href="/games/{game.id}">{game.name}</a></Card>
			{/each}
		</CardList>

		<form {...create_game}>
			<Field {...create_game.fields.name.as('text')} placeholder="New game name" required />
			<Button>Create game</Button>
			{#each create_game.fields.name.issues() ?? [] as issue (issue.message)}
				<p class="issue">{issue.message}</p>
			{/each}
		</form>
	{:else}
		<p><a href="/login">Log in</a> or <a href="/signup">Sign up</a>.</p>
		<p>Accounts are just for game creators — you don't need one to fill out a survey. You'll receive a personal survey link in your email or from the game creator.</p>

		{#if recent_surveys.length > 0}
			<SectionHeading>Recently viewed surveys</SectionHeading>
			<CardList>
				{#each recent_surveys as survey (survey.token)}
					<Card>
						<a class="game-link" href="/surveys/{survey.token}">
							{survey.game_name}: {survey.round_name} ({survey.player_name})
						</a>
					</Card>
				{/each}
			</CardList>
		{/if}
	{/if}

	<SectionHeading level={3}>Scoring</SectionHeading>
	<Table
		columns={['Prediction', 'Points']}
		rows={[
			['Correctly predicted star baker', '+3'],
			['Predicted star baker was discussed as potential', '+1'],
			['Predicted star baker was sent home ', '−1'],
			['',''],
			['Correctly predicted sent home', '+3'],
			['Predicted sent home was discussed as potential', '+1'],
			['Predicted sent home won star baker', '−1'],
			['',''],
			['Correctly predicted technical challenge winner', '+2'],
			['Technical challenge prediction got 2nd or 3rd', '+1'],
			['Technical challenge prediction got last', '−1'],
			['',''],
			['Correct bonus question answer', '+2']
		]}
	/>

	<p>
		Finale predictions: the season winner earns +5 if picked originally, or +3 you changed predictions.
		Each actual finalist earns +3 if you picked them from the start, or +1 if you changed them later.
	</p>
	<p>Points add up across the season, along with each player's starting score adjustment.</p>
</Page>

<style>
	.game-link {
		flex: 1 1 100%;
	}
</style>
