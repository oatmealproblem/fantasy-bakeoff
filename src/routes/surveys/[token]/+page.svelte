<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import ContestantOption from '#lib/components/ContestantOption.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import { get_survey, save_survey } from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const survey = $derived(await get_survey(params.token));
</script>

<Page>
	<PageTitle>{survey.round.name}</PageTitle>
	<p>{survey.player_name}'s responses</p>
	{#if survey.round.response_deadline}
		<p>
			Responses {survey.deadline_passed ? 'closed' : 'close'}
			{survey.round.response_deadline.toLocaleString()}
		</p>
	{/if}
	{#if survey.scored}
		<p><a href="/surveys/{params.token}/results">View results</a></p>
	{/if}

	<form {...save_survey}>
		<input {...save_survey.fields.token.as('hidden', params.token)} />

		{#if survey.can_edit}
			{#each save_survey.fields.allIssues() ?? [] as issue (issue.message)}
				<p class="issue">{issue.message}</p>
			{/each}
		{/if}

		{#if !survey.round.is_finale}
			<Fieldset legend="Star baker" disabled={!survey.can_edit}>
				{#each survey.contestants as c (c.id)}
					<ContestantOption
						{...save_survey.fields.star_baker.as('radio', c.id, survey.answers.star_baker === c.id)}
						contestant={c}
					/>
				{/each}
			</Fieldset>

			{#if survey.round.expected_number_sent_home != null && survey.round.expected_number_sent_home > 0}
				<Fieldset
					legend={`Sent home${survey.round.expected_number_sent_home > 1 ? ` (${survey.round.expected_number_sent_home})` : ''}`}
					disabled={!survey.can_edit}
				>
					{#each survey.contestants as c (c.id)}
						{#if survey.round.expected_number_sent_home === 1}
							<ContestantOption
								{...save_survey.fields.sent_home_single.as(
									'radio',
									c.id,
									survey.answers.sent_home.includes(c.id)
								)}
								contestant={c}
							/>
						{:else}
							<ContestantOption
								{...save_survey.fields.sent_home.as(
									'checkbox',
									c.id,
									survey.answers.sent_home.includes(c.id)
								)}
								contestant={c}
							/>
						{/if}
					{/each}
				</Fieldset>
			{/if}
		{/if}

		<Fieldset legend="First in the technical challenge" disabled={!survey.can_edit}>
			{#each survey.contestants as c (c.id)}
				<ContestantOption
					{...save_survey.fields.technical_challenge_first.as(
						'radio',
						c.id,
						survey.answers.technical_challenge_first === c.id
					)}
					contestant={c}
				/>
			{/each}
		</Fieldset>

		{#if survey.round.allow_finale_prediction}
			<Fieldset legend="Winner" disabled={!survey.can_edit}>
				{#each survey.contestants as c (c.id)}
					<ContestantOption
						{...save_survey.fields.winner.as('radio', c.id, survey.answers.winner === c.id)}
						contestant={c}
					/>
				{/each}
			</Fieldset>

			<Fieldset legend="Finalists (2)" disabled={!survey.can_edit}>
				{#each survey.contestants as c (c.id)}
					<ContestantOption
						{...save_survey.fields.finalists.as(
							'checkbox',
							c.id,
							survey.answers.finalists.includes(c.id)
						)}
						contestant={c}
					/>
				{/each}
			</Fieldset>
		{/if}

		{#if survey.round.bonus_question}
			<Fieldset legend={`Bonus: ${survey.round.bonus_question}`} disabled={!survey.can_edit}>
				{#each survey.contestants as c (c.id)}
					<ContestantOption
						{...save_survey.fields.bonus_question_answer.as(
							'radio',
							c.id,
							survey.answers.bonus_question_answers.includes(c.id)
						)}
						contestant={c}
					/>
				{/each}
			</Fieldset>
		{/if}

		{#if survey.can_edit}
			<Button>Save responses</Button>
		{:else if survey.scored}
			<p>This round has been scored. Only the game creator can still edit responses.</p>
		{:else}
			<p>This survey is closed. Only the game creator can still edit it.</p>
		{/if}
	</form>
</Page>
