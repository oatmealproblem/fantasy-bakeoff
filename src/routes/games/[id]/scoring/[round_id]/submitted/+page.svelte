<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import ScoreChart from '#lib/components/ScoreChart.svelte';
	import { get_round_scoring } from '#lib/game.remote.ts';
	import { score_game } from '#lib/scoring.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const data = $derived(await get_round_scoring({ game_id: params.id, round_id: params.round_id }));

	const scores = $derived(
		score_game(
			data.rounds,
			data.players.map((player) => player.id),
			data.answers,
			data.responses,
			data.predictions
		)
	);

	const score_chart_rows = $derived(
		data.players
			.map((player) => {
				const score = scores.find((score) => score.player_id === player.id);
				return {
					name: player.name,
					change: score?.by_round[data.round.id] ?? 0,
					total: data.rounds
						.filter((round) => round.number <= data.round.number)
						.reduce((sum, round) => sum + (score?.by_round[round.id] ?? 0), 0)
				};
			})
			.sort((a, b) => b.total - a.total)
	);
</script>

<Page>
	<PageTitle>Scoring saved</PageTitle>
	<p>The answers and scores for this round have been saved.</p>
	<ScoreChart rows={score_chart_rows} />
	<p><a href="/games/{params.id}/scoring/{params.round_id}">View or edit scoring</a></p>
	<p><a href="/games/{params.id}">Back to the game</a></p>
</Page>
