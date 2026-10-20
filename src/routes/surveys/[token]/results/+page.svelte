<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import ScoreChart from '#lib/components/ScoreChart.svelte';
	import Table from '#lib/components/Table.svelte';
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

	const breakdown_rows = $derived<(string | number)[][]>(
		results.breakdown?.items.length
			? results.breakdown.items.map((item) => [
					`${reason(item.kind)}: ${contestant_name(item.contestant_id)}`,
					item.points > 0 ? `+${item.points}` : item.points
				])
			: [['No points', 0]]
	);

	const score_chart_rows = $derived(
		results.scores
			.map((score) => {
				const change = score.by_round[results.round.id] ?? 0;
				const total = results.rounds
					.filter((round) => round.number <= results.round.number)
					.reduce((sum, round) => sum + (score.by_round[round.id] ?? 0), score.score_adjustment);
				return {
					name: score.player_name + (score.player_id === results.player_id ? ' (you)' : ''),
					change,
					total
				};
			})
			.sort((a, b) => b.total - a.total)
	);
</script>

<Page>
	<p><a href="/surveys/{params.token}">← Back to survey</a></p>
	<PageTitle>{results.player_name}'s results</PageTitle>
	{#if results.round.scoring_message}
		<p class="message">{results.round.scoring_message}</p>
	{/if}

	<SectionHeading>Your score</SectionHeading>
	{#if results.scored && results.breakdown}
		<Table
			caption={`${results.round.name} — ${results.breakdown.total} points`}
			columns={['Reason', 'Points']}
			rows={breakdown_rows}
		/>
	{:else}
		<p>This round hasn't been scored yet.</p>
	{/if}

	<SectionHeading>Everyone</SectionHeading>
	<ScoreChart rows={score_chart_rows} />
</Page>

<style>
	.message {
		white-space: pre-line;
	}
</style>
