<script lang="ts">
	import type { RemoteFormField } from '$app/server';
	import { get_round_scoring, save_round_answers } from '#lib/game.remote.ts';
	import { round_answers, score_game } from '#lib/scoring.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const data = $derived(await get_round_scoring({ game_id: params.id, round_id: params.round_id }));

	function current_fields() {
		const touched = save_round_answers.fields.value();
		return {
			star_baker: touched.star_baker ?? data.saved.star_baker,
			star_baker_discussed: touched.star_baker_discussed ?? data.saved.star_baker_discussed,
			sent_home: touched.sent_home ?? data.saved.sent_home,
			sent_home_discussed: touched.sent_home_discussed ?? data.saved.sent_home_discussed,
			technical_challenge_first:
				touched.technical_challenge_first ?? data.saved.technical_challenge_first,
			technical_challenge_second:
				touched.technical_challenge_second ?? data.saved.technical_challenge_second,
			technical_challenge_third:
				touched.technical_challenge_third ?? data.saved.technical_challenge_third,
			technical_challenge_last:
				touched.technical_challenge_last ?? data.saved.technical_challenge_last,
			bonus_question_answers: touched.bonus_question_answers ?? data.saved.bonus_question_answers,
			winner: touched.winner ?? data.saved.winner,
			finalist: touched.finalist ?? data.saved.finalist
		};
	}

	const player_ids = $derived(data.players.map((p) => p.id));
	const other_answers = $derived(data.answers.filter((a) => a.round_id !== data.round.id));

	const previous = $derived(
		score_game(data.rounds, player_ids, other_answers, data.responses, data.predictions)
	);

	const live = $derived(
		score_game(
			data.rounds,
			player_ids,
			[...other_answers, ...round_answers(data.round, current_fields())],
			data.responses,
			data.predictions
		)
	);
</script>

{#snippet radios(field: RemoteFormField<string>, selected: string | undefined)}
	{#each data.contestants as c (c.id)}
		<label>
			<input {...field.as('radio', c.id, selected === c.id)} />
			{c.name}
		</label>
	{/each}
{/snippet}

{#snippet checkboxes(field: RemoteFormField<string[]>, selected: string[])}
	{#each data.contestants as c (c.id)}
		<label>
			<input {...field.as('checkbox', c.id, selected.includes(c.id))} />
			{c.name}
		</label>
	{/each}
{/snippet}

<main>
	<p><a href="/games/{params.id}">← Back to game</a></p>
	<h1>#{data.round.number} {data.round.name}</h1>

	<h2>Scores</h2>
	<table>
		<thead>
			<tr>
				<th>Player</th>
				<th>Previous</th>
				<th>This round</th>
				<th>Total</th>
			</tr>
		</thead>
		<tbody>
			{#each data.players as player (player.id)}
				{const before = $derived(previous.find((s) => s.player_id === player.id)?.total ?? 0)}
				{const after = $derived(live.find((s) => s.player_id === player.id)?.total ?? 0)}
				<tr>
					<td>{player.name}</td>
					<td>{before}</td>
					<td>{after - before > 0 ? `+${after - before}` : after - before}</td>
					<td>{after}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<h2>Answers</h2>
	<form {...save_round_answers}>
		<input {...save_round_answers.fields.round_id.as('hidden', data.round.id)} />

		{#if !data.round.is_finale}
			<fieldset>
				<legend>Star baker</legend>
				{@render radios(save_round_answers.fields.star_baker, data.saved.star_baker)}
			</fieldset>
			<fieldset>
				<legend>Star baker (discussed)</legend>
				{@render checkboxes(
					save_round_answers.fields.star_baker_discussed,
					data.saved.star_baker_discussed
				)}
			</fieldset>
			<fieldset>
				<legend>Sent home</legend>
				{@render checkboxes(save_round_answers.fields.sent_home, data.saved.sent_home)}
			</fieldset>
			<fieldset>
				<legend>Sent home (discussed)</legend>
				{@render checkboxes(
					save_round_answers.fields.sent_home_discussed,
					data.saved.sent_home_discussed
				)}
			</fieldset>
		{/if}

		<fieldset>
			<legend>Technical challenge 1st</legend>
			{@render radios(
				save_round_answers.fields.technical_challenge_first,
				data.saved.technical_challenge_first
			)}
		</fieldset>
		<fieldset>
			<legend>Technical challenge 2nd</legend>
			{@render radios(
				save_round_answers.fields.technical_challenge_second,
				data.saved.technical_challenge_second
			)}
		</fieldset>
		<fieldset>
			<legend>Technical challenge 3rd</legend>
			{@render radios(
				save_round_answers.fields.technical_challenge_third,
				data.saved.technical_challenge_third
			)}
		</fieldset>
		<fieldset>
			<legend>Technical challenge last</legend>
			{@render radios(
				save_round_answers.fields.technical_challenge_last,
				data.saved.technical_challenge_last
			)}
		</fieldset>

		{#if data.round.bonus_question}
			<fieldset>
				<legend>Bonus: {data.round.bonus_question}</legend>
				{@render checkboxes(
					save_round_answers.fields.bonus_question_answers,
					data.saved.bonus_question_answers
				)}
			</fieldset>
		{/if}

		{#if data.round.is_finale}
			<fieldset>
				<legend>Winner</legend>
				{@render radios(save_round_answers.fields.winner, data.saved.winner)}
			</fieldset>
			<fieldset>
				<legend>Finalists</legend>
				{@render checkboxes(save_round_answers.fields.finalist, data.saved.finalist)}
			</fieldset>
		{/if}

		<button>Save answers</button>
		{#if save_round_answers.result?.saved}
			<p>Answers saved.</p>
		{/if}
		{#each save_round_answers.fields.allIssues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
	</form>
</main>
