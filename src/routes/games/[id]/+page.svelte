<script lang="ts">
	import {
		add_contestant,
		add_player,
		delete_contestant,
		delete_game,
		delete_player,
		get_game,
		import_contestants,
		update_contestant,
		update_game,
		update_player
	} from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const game = $derived(await get_game(params.id));
</script>

<main>
	<p><a href="/">← All games</a></p>
	<h1>{game.name}</h1>

	<form {...update_game}>
		<input {...update_game.fields.id.as('hidden', game.id)} />
		<input {...update_game.fields.name.as('text', game.name)} required />
		<button>Rename</button>
		{#each update_game.fields.name.issues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
	</form>

	<form {...delete_game}>
		<input {...delete_game.fields.id.as('hidden', game.id)} />
		<button
			onclick={(e) => {
				if (!confirm(`Delete ${game.name} and everything in it?`)) e.preventDefault();
			}}>Delete game</button
		>
	</form>

	<h2>Players</h2>
	<form {...add_player}>
		<input {...add_player.fields.game_id.as('hidden', game.id)} />
		<input {...add_player.fields.name.as('text')} placeholder="Name" required />
		<input {...add_player.fields.phone.as('tel')} placeholder="Phone" />
		<input {...add_player.fields.email.as('email')} placeholder="Email" />
		<button>Add player</button>
	</form>

	<ul>
		{#each game.players as player (player.id)}
			{const update = update_player.for(player.id)}
			{const del = delete_player.for(player.id)}
			<li>
				<form {...update}>
					<input {...update.fields.id.as('hidden', player.id)} />
					<input {...update.fields.name.as('text', player.name)} required />
					<input {...update.fields.phone.as('tel', player.phone ?? '')} placeholder="Phone" />
					<input {...update.fields.email.as('email', player.email ?? '')} placeholder="Email" />
					<button>Save</button>
				</form>
				<form {...del}>
					<input {...del.fields.id.as('hidden', player.id)} />
					<button
						onclick={(e) => {
							if (!confirm(`Delete player ${player.name}?`)) e.preventDefault();
						}}>Delete</button
					>
				</form>
			</li>
		{/each}
	</ul>

	<h2>Contestants</h2>
	<form {...import_contestants}>
		<input {...import_contestants.fields.game_id.as('hidden', game.id)} />
		<label>
			Series
			<input {...import_contestants.fields.series.as('number')} min="1" max="20" required />
		</label>
		<button>Import from GBBO</button>
		{#each import_contestants.fields.allIssues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
		{#if import_contestants.result}
			<p>Imported {import_contestants.result.imported} contestants.</p>
		{/if}
	</form>

	<form {...add_contestant}>
		<input {...add_contestant.fields.game_id.as('hidden', game.id)} />
		<input {...add_contestant.fields.name.as('text')} placeholder="Name" required />
		<input {...add_contestant.fields.picture_url.as('url')} placeholder="Picture URL" />
		<button>Add contestant</button>
	</form>

	<ul>
		{#each game.contestants as c (c.id)}
			{const update = update_contestant.for(c.id)}
			{const del = delete_contestant.for(c.id)}
			<li>
				{#if c.picture_url}
					<img src={c.picture_url} alt={c.name} width="48" height="48" />
				{/if}
				<form {...update}>
					<input {...update.fields.id.as('hidden', c.id)} />
					<input {...update.fields.name.as('text', c.name)} required />
					<input
						{...update.fields.picture_url.as('url', c.picture_url)}
						placeholder="Picture URL"
					/>
					<button>Save</button>
				</form>
				<form {...del}>
					<input {...del.fields.id.as('hidden', c.id)} />
					<button
						onclick={(e) => {
							if (!confirm(`Delete contestant ${c.name}?`)) e.preventDefault();
						}}>Delete</button
					>
				</form>
			</li>
		{/each}
	</ul>
</main>
