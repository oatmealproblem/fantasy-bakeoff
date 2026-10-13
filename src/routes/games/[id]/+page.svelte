<script lang="ts">
	import { onMount } from 'svelte';
	import {
		add_contestant,
		add_player,
		add_round,
		delete_contestant,
		delete_game,
		delete_player,
		delete_round,
		get_game,
		import_contestants,
		release_surveys,
		update_contestant,
		update_game,
		update_player,
		update_round
	} from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const game = $derived(await get_game(params.id));

	let timezone = $state('');
	onMount(() => {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	});

	const local_input = (date: Date) =>
		new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
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
		<label>
			Name
			<input {...add_player.fields.name.as('text')} required />
		</label>
		<label>
			Email
			<input {...add_player.fields.email.as('email')} />
		</label>
		<button>Add player</button>
	</form>

	<ul>
		{#each game.players as player (player.id)}
			{const update = update_player.for(player.id)}
			{const del = delete_player.for(player.id)}
			<li>
				<form id="update-player-{player.id}" {...update}>
					<input {...update.fields.id.as('hidden', player.id)} />
					<label>
						Name
						<input {...update.fields.name.as('text', player.name)} required />
					</label>
					<label>
						Email
						<input {...update.fields.email.as('email', player.email ?? '')} />
					</label>
				</form>
				<button form="update-player-{player.id}">Save</button>
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
		<label>
			Name
			<input {...add_contestant.fields.name.as('text')} required />
		</label>
		<label>
			Picture URL
			<input {...add_contestant.fields.picture_url.as('url')} />
		</label>
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
				<form id="update-contestant-{c.id}" {...update}>
					<input {...update.fields.id.as('hidden', c.id)} />
					<label>
						Name
						<input {...update.fields.name.as('text', c.name)} required />
					</label>
					<label>
						Picture URL
						<input {...update.fields.picture_url.as('url', c.picture_url)} />
					</label>
				</form>
				<button form="update-contestant-{c.id}">Save</button>
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

	<h2>Rounds</h2>
	<form {...add_round}>
		<input {...add_round.fields.game_id.as('hidden', game.id)} />
		<input {...add_round.fields.timezone.as('hidden', timezone)} />
		<label>
			Round name
			<input {...add_round.fields.name.as('text')} required />
		</label>
		<label>
			Bonus question
			<input {...add_round.fields.bonus_question.as('text')} />
		</label>
		<label>
			<input {...add_round.fields.allow_finale_prediction.as('checkbox')} />
			Allow finale prediction
		</label>
		<label>
			<input {...add_round.fields.is_finale.as('checkbox')} />
			Finale
		</label>
		<label>
			Expected number of bakers sent home
			<input {...add_round.fields.expected_number_sent_home.as('number', 1)} min="1" />
		</label>
		<label>
			Response deadline
			<input {...add_round.fields.response_deadline.as('datetime-local')} />
		</label>
		<button class="primary">Add round</button>
		{#each add_round.fields.allIssues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
	</form>

	<ul>
		{#each game.rounds as round (round.id)}
			{const update = update_round.for(round.id)}
			{const del = delete_round.for(round.id)}
			{const release = release_surveys.for(round.id)}
			{const complete = round.surveys.filter((s) => s.status === 'yes').length}
			<li>
				<h3>#{round.number} {round.name}</h3>
				<p><a href="/games/{game.id}/scoring/{round.id}">Enter answers & scores</a></p>
				<form id="update-round-{round.id}" {...update}>
					<input {...update.fields.id.as('hidden', round.id)} />
					<input {...update.fields.timezone.as('hidden', timezone)} />
					<label>
						Round name
						<input {...update.fields.name.as('text', round.name)} required />
					</label>
					<label>
						Bonus question
						<input {...update.fields.bonus_question.as('text', round.bonus_question ?? '')} />
					</label>
					<label>
						<input
							{...update.fields.allow_finale_prediction.as(
								'checkbox',
								round.allow_finale_prediction
							)}
						/>
						Allow finale prediction
					</label>
					<label>
						<input {...update.fields.is_finale.as('checkbox', round.is_finale)} />
						Finale
					</label>
					<label>
						Expected # sent home
						<input
							{...update.fields.expected_number_sent_home.as(
								'number',
								round.expected_number_sent_home ?? 1
							)}
							min="1"
						/>
					</label>
					<label>
						Response deadline
						<input
							{...update.fields.response_deadline.as(
								'datetime-local',
								round.response_deadline ? local_input(round.response_deadline) : ''
							)}
						/>
					</label>
				</form>
				<button form="update-round-{round.id}">Save</button>
				<form {...del}>
					<input {...del.fields.id.as('hidden', round.id)} />
					<button
						onclick={(e) => {
							if (!confirm(`Delete round ${round.name}?`)) e.preventDefault();
						}}>Delete</button
					>
				</form>
				<form {...release}>
					<input {...release.fields.round_id.as('hidden', round.id)} />
					<input {...release.fields.timezone.as('hidden', timezone)} />
					<button>Release surveys</button>
					{#if release.result}
						<p>Released {release.result.released} new survey(s).</p>
						{#if release.result.released > 0 && !release.result.emailed}
							<p>Emails were not sent to players — your account is not enabled to send email.</p>
						{/if}
					{/if}
				</form>
				{#if round.surveys.length > 0}
					<details>
						<summary>Survey links ({complete}/{round.surveys.length} complete)</summary>
						<ul>
							{#each round.surveys as s (s.player_id)}
								<li>
									{#if s.token}
										<a href="/surveys/{s.token}">{s.player_name}</a> — {s.status}
									{:else}
										{s.player_name} — not released
									{/if}
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			</li>
		{/each}
	</ul>
</main>
