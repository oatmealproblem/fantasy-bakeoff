<script lang="ts">
	import { get_survey_results } from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const results = $derived(await get_survey_results(params.token));

	const reasons: Record<string, string> = {
		star_baker: 'Star baker',
		star_baker_as_sent_home: 'Star baker guessed as sent home',
		star_baker_discussed: 'Star baker discussed',
		sent_home: 'Sent home',
		sent_home_as_star_baker: 'Sent home guessed as star baker',
		sent_home_discussed: 'Sent home discussed',
		technical_challenge_first: 'Technical challenge first',
		technical_challenge_second: 'Technical challenge second',
		technical_challenge_third: 'Technical challenge third',
		technical_challenge_last: 'Technical challenge last',
		bonus_question_answer: 'Bonus question',
		winner: 'Winner',
		finalist: 'Finalist'
	};

	const reason = (kind: string) => reasons[kind] ?? kind;
	const contestant_name = (id: string) => results.contestants.find((c) => c.id === id)?.name ?? '';
</script>

<main>
	<p><a href="/surveys/{params.token}">← Back to survey</a></p>
	<h1>{results.player_name}'s results</h1>

	<h2>Your score</h2>
	{#if results.scored && results.breakdown}
		<table>
			<caption>
				#{results.round.number}
				{results.round.name} — {results.breakdown.total} points
			</caption>
			<thead>
				<tr>
					<th>Reason</th>
					<th>Points</th>
				</tr>
			</thead>
			<tbody>
				{#each results.breakdown.items as item, i (i)}
					<tr>
						<td>
							{reason(item.kind)}: {contestant_name(item.contestant_id)}
						</td>
						<td>{item.points > 0 ? `+${item.points}` : item.points}</td>
					</tr>
				{:else}
					<tr>
						<td>No points</td>
						<td>0</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>This round hasn't been scored yet.</p>
	{/if}

	<h2>Everyone</h2>
	<table>
		<thead>
			<tr>
				<th>Player</th>
				{#each results.rounds as round (round.id)}
					<th>#{round.number}</th>
				{/each}
				<th>Total</th>
			</tr>
		</thead>
		<tbody>
			{#each results.scores as score (score.player_id)}
				<tr>
					<td>{score.player_name}{score.player_id === results.player_id ? ' (you)' : ''}</td>
					{#each results.rounds as round (round.id)}
						<td>{score.by_round[round.id] ?? 0}</td>
					{/each}
					<td>{score.total}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
