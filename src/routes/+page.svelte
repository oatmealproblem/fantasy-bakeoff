<script lang="ts">
	import { get_user, sign_out } from '#lib/auth.remote.ts';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardList from '#lib/components/CardList.svelte';
	import Field from '#lib/components/Field.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import { create_game, get_games } from '#lib/game.remote.ts';

	const user = await get_user();
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
	{/if}
</Page>

<style>
	.game-link {
		flex: 1 1 100%;
	}
</style>
