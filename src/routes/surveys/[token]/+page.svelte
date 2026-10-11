<script lang="ts">
	import { get_survey, save_survey } from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const survey = $derived(await get_survey(params.token));
</script>

{#snippet contestant(c: (typeof survey.contestants)[number])}
	{#if c.picture_url}
		<img src={c.picture_url} alt={c.name} width="48" height="48" />
	{/if}
	{c.name}
{/snippet}

<main>
	<h1>{survey.round.name}</h1>
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
			<fieldset disabled={!survey.can_edit}>
				<legend>Star baker</legend>
				{#each survey.contestants as c (c.id)}
					<label>
						<input
							{...save_survey.fields.star_baker.as(
								'radio',
								c.id,
								survey.answers.star_baker === c.id
							)}
						/>
						{@render contestant(c)}
					</label>
				{/each}
			</fieldset>

			{#if survey.round.expected_number_sent_home != null && survey.round.expected_number_sent_home > 0}
				<fieldset disabled={!survey.can_edit}>
					<legend
						>Sent home {#if survey.round.expected_number_sent_home > 1}({survey.round
								.expected_number_sent_home}){/if}</legend
					>
					{#each survey.contestants as c (c.id)}
						<label>
							{#if (survey.round.expected_number_sent_home ?? 1) === 1}
								<input
									{...save_survey.fields.sent_home_single.as(
										'radio',
										c.id,
										survey.answers.sent_home.includes(c.id)
									)}
								/>
							{:else}
								<input
									{...save_survey.fields.sent_home.as(
										'checkbox',
										c.id,
										survey.answers.sent_home.includes(c.id)
									)}
								/>
							{/if}
							{@render contestant(c)}
						</label>
					{/each}
				</fieldset>
			{/if}
		{/if}

		<fieldset disabled={!survey.can_edit}>
			<legend>First in the technical challenge</legend>
			{#each survey.contestants as c (c.id)}
				<label>
					<input
						{...save_survey.fields.technical_challenge_first.as(
							'radio',
							c.id,
							survey.answers.technical_challenge_first === c.id
						)}
					/>
					{@render contestant(c)}
				</label>
			{/each}
		</fieldset>

		{#if survey.round.allow_finale_prediction}
			<fieldset disabled={!survey.can_edit}>
				<legend>Winner</legend>
				{#each survey.contestants as c (c.id)}
					<label>
						<input
							{...save_survey.fields.winner.as('radio', c.id, survey.answers.winner === c.id)}
						/>
						{@render contestant(c)}
					</label>
				{/each}
			</fieldset>

			<fieldset disabled={!survey.can_edit}>
				<legend>Finalists (2)</legend>
				{#each survey.contestants as c (c.id)}
					<label>
						<input
							{...save_survey.fields.finalists.as(
								'checkbox',
								c.id,
								survey.answers.finalists.includes(c.id)
							)}
						/>
						{@render contestant(c)}
					</label>
				{/each}
			</fieldset>
		{/if}

		{#if survey.round.bonus_question}
			<fieldset disabled={!survey.can_edit}>
				<legend>Bonus: {survey.round.bonus_question}</legend>
				{#each survey.contestants as c (c.id)}
					<label>
						<input
							{...save_survey.fields.bonus_question_answer.as(
								'radio',
								c.id,
								survey.answers.bonus_question_answers.includes(c.id)
							)}
						/>
						{@render contestant(c)}
					</label>
				{/each}
			</fieldset>
		{/if}

		{#if survey.can_edit}
			<button>Save responses</button>
		{:else if survey.scored}
			<p>This round has been scored. Only the game creator can still edit responses.</p>
		{:else}
			<p>This survey is closed. Only the game creator can still edit it.</p>
		{/if}
	</form>

	{#if save_survey.result?.saved}
		<p>Responses saved.</p>
	{/if}
</main>
