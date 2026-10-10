<script lang="ts">
	import { get_user, sign_out } from '#lib/auth.remote.ts';
	import { create_game, get_games } from '#lib/game.remote.ts';

	const user = await get_user();
</script>

<main>
	{#if user}
		<h1>Fantasy Bakeoff</h1>
		<p>Signed in as {user.name}.</p>
		<form {...sign_out}>
			<button>Sign out</button>
		</form>

		<h2>Your games</h2>
		<ul>
			{#each await get_games() as game (game.id)}
				<li><a href="/games/{game.id}">{game.name}</a></li>
			{/each}
		</ul>

		<form {...create_game}>
			<input {...create_game.fields.name.as('text')} placeholder="New game name" required />
			<button>Create game</button>
			{#each create_game.fields.name.issues() ?? [] as issue (issue.message)}
				<p class="issue">{issue.message}</p>
			{/each}
		</form>
	{:else}
		<h1>Fantasy Bakeoff</h1>
		<p><a href="/login">Log in</a> or <a href="/signup">Sign up</a>.</p>
	{/if}
</main>
