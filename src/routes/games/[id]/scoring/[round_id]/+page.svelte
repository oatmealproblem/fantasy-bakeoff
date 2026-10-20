<script lang="ts">
	import type { RemoteFormField } from '$app/server';
	import Button from '#lib/components/Button.svelte';
	import ContestantOption from '#lib/components/ContestantOption.svelte';
	import Field from '#lib/components/Field.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import ScoreChart from '#lib/components/ScoreChart.svelte';
	import { get_round_scoring, save_round_answers } from '#lib/game.remote.ts';
	import { round_answers, score_game } from '#lib/scoring.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const data = $derived(await get_round_scoring({ game_id: params.id, round_id: params.round_id }));
	const form = $derived(save_round_answers.for(data.round.id));

	function current_fields() {
		const touched = form.fields.value();
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

	const through_round = (score: { by_round: Record<string, number> } | undefined) =>
		data.rounds
			.filter((round) => round.number <= data.round.number)
			.reduce((sum, round) => sum + (score?.by_round[round.id] ?? 0), 0);

	const score_chart_rows = $derived(
		data.players
			.map((player) => {
				const before =
					player.score_adjustment + through_round(previous.find((s) => s.player_id === player.id));
				const after =
					player.score_adjustment + through_round(live.find((s) => s.player_id === player.id));
				return { name: player.name, change: after - before, total: after, before };
			})
			.sort((a, b) => b.before - a.before)
			.map(({ name, change, total }) => ({ name, change, total }))
	);
</script>

{#snippet radios(field: RemoteFormField<string>, selected: string | undefined)}
	{#each data.contestants as c (c.id)}
		<ContestantOption {...field.as('radio', c.id, selected === c.id)} contestant={c} />
	{/each}
{/snippet}

{#snippet checkboxes(field: RemoteFormField<string[]>, selected: string[])}
	{#each data.contestants as c (c.id)}
		<ContestantOption {...field.as('checkbox', c.id, selected.includes(c.id))} contestant={c} />
	{/each}
{/snippet}

<Page wide fill>
	<p><a href="/games/{params.id}">← Back to game</a></p>
	<PageTitle>{data.round.name}</PageTitle>

	<div class="columns">
		<div class="column">
			<SectionHeading>Answers</SectionHeading>
			<form {...form}>
				<input {...form.fields.round_id.as('hidden', data.round.id)} />

				{#if !data.round.is_finale}
					<Fieldset legend="Star baker">
						{@render radios(form.fields.star_baker, data.saved.star_baker)}
					</Fieldset>
					<Fieldset legend="Star baker (discussed)">
						{@render checkboxes(form.fields.star_baker_discussed, data.saved.star_baker_discussed)}
					</Fieldset>
					<Fieldset legend="Sent home">
						{@render checkboxes(form.fields.sent_home, data.saved.sent_home)}
					</Fieldset>
					<Fieldset legend="Sent home (discussed)">
						{@render checkboxes(form.fields.sent_home_discussed, data.saved.sent_home_discussed)}
					</Fieldset>
				{/if}

				<Fieldset legend="Technical challenge 1st">
					{@render radios(
						form.fields.technical_challenge_first,
						data.saved.technical_challenge_first
					)}
				</Fieldset>
				<Fieldset legend="Technical challenge 2nd">
					{@render radios(
						form.fields.technical_challenge_second,
						data.saved.technical_challenge_second
					)}
				</Fieldset>
				<Fieldset legend="Technical challenge 3rd">
					{@render radios(
						form.fields.technical_challenge_third,
						data.saved.technical_challenge_third
					)}
				</Fieldset>
				<Fieldset legend="Technical challenge last">
					{@render radios(
						form.fields.technical_challenge_last,
						data.saved.technical_challenge_last
					)}
				</Fieldset>

				{#if data.round.bonus_question}
					<Fieldset legend={`Bonus: ${data.round.bonus_question}`}>
						{@render checkboxes(
							form.fields.bonus_question_answers,
							data.saved.bonus_question_answers
						)}
					</Fieldset>
				{/if}

				{#if data.round.is_finale}
					<Fieldset legend="Winner">
						{@render radios(form.fields.winner, data.saved.winner)}
					</Fieldset>
					<Fieldset legend="Finalists">
						{@render checkboxes(form.fields.finalist, data.saved.finalist)}
					</Fieldset>
				{/if}

				<Field
					label="Scoring message"
					multiline
					{...form.fields.scoring_message.as('text', data.saved.scoring_message ?? '')}
				/>

				<Button>Save answers</Button>
				{#each form.fields.allIssues() ?? [] as issue (issue.message)}
					<p class="issue">{issue.message}</p>
				{/each}
			</form>
		</div>

		<div class="column">
			<SectionHeading>Scores</SectionHeading>
			<ScoreChart rows={score_chart_rows} />
		</div>
	</div>
</Page>

<style>
	.columns {
		flex: 1;
		display: grid;
		gap: 0 2rem;
		min-height: 0;
		overflow-y: auto;
	}

	.column {
		padding-block-end: 1.5rem;
	}

	@media (min-width: 80rem) and (min-height: 30rem) {
		.columns {
			overflow-y: hidden;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: minmax(0, 1fr);
		}

		.column {
			min-height: 0;
			overflow-y: auto;
		}
	}
</style>
