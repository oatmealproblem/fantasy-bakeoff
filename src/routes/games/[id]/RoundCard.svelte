<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import CardActions from '#lib/components/CardActions.svelte';
	import CardForm from '#lib/components/CardForm.svelte';
	import Checkbox from '#lib/components/Checkbox.svelte';
	import Field from '#lib/components/Field.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import { delete_round, release_surveys, update_round } from '#lib/game.remote.ts';

	interface Round {
		id: string;
		number: number;
		name: string;
		bonus_question: string | null;
		allow_finale_prediction: boolean;
		is_finale: boolean;
		expected_number_sent_home: number | null;
		response_deadline: Date | null;
		surveys: {
			player_id: string;
			token: string | null;
			player_name: string;
			status: string;
		}[];
	}

	let { game_id, round, timezone }: { game_id: string; round: Round; timezone: string } = $props();

	const update = $derived(update_round.for(round.id));
	const del = $derived(delete_round.for(round.id));
	const release = $derived(release_surveys.for(round.id));

	const complete = $derived(round.surveys.filter((s) => s.status === 'yes').length);

	const local_input = (date: Date) =>
		new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
</script>

<Card>
	<SectionHeading level={3} flush>{round.name}</SectionHeading>
	<p class="link"><a href="/games/{game_id}/scoring/{round.id}">Enter answers & scores</a></p>
	<CardForm id="update-round-{round.id}" {...update}>
		<input {...update.fields.id.as('hidden', round.id)} />
		<input {...update.fields.timezone.as('hidden', timezone)} />
		<Field label="Round name" {...update.fields.name.as('text', round.name)} required />
		<Field
			label="Bonus question"
			{...update.fields.bonus_question.as('text', round.bonus_question ?? '')}
		/>
		<Checkbox
			label="Allow finale prediction"
			{...update.fields.allow_finale_prediction.as('checkbox', round.allow_finale_prediction)}
		/>
		<Checkbox label="Finale" {...update.fields.is_finale.as('checkbox', round.is_finale)} />
		<Field
			label="Expected number sent home"
			{...update.fields.expected_number_sent_home.as(
				'number',
				round.expected_number_sent_home ?? 1
			)}
			min="1"
		/>
		<Field
			label="Response deadline"
			{...update.fields.response_deadline.as(
				'datetime-local',
				round.response_deadline ? local_input(round.response_deadline) : ''
			)}
		/>
	</CardForm>
	<CardActions>
		<Button form="update-round-{round.id}" variant="card">Save</Button>
		<form {...del}>
			<input {...del.fields.id.as('hidden', round.id)} />
			<Button
				variant="card"
				onclick={(e) => {
					if (!confirm(`Delete round ${round.name}?`)) e.preventDefault();
				}}>Delete</Button
			>
		</form>
		<form class="release" {...release}>
			<input {...release.fields.round_id.as('hidden', round.id)} />
			<input {...release.fields.timezone.as('hidden', timezone)} />
			<Button variant="card">Release surveys</Button>
		</form>
		{#if release.result}
			<div class="release-feedback">
				<p>Released {release.result.released} new survey(s).</p>
				{#if release.result.released > 0 && !release.result.emailed}
					<p>Emails were not sent to players — your account is not enabled to send email.</p>
				{/if}
			</div>
		{/if}
	</CardActions>
	{#if round.surveys.length > 0}
		<details class="surveys">
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
</Card>

<style>
	.link,
	.surveys {
		flex: 1 1 100%;
	}

	.release {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.release-feedback {
		flex-basis: 100%;
	}

	.surveys {
		margin-block-start: 0.5rem;
	}

	.surveys summary {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.surveys ul {
		padding-inline-start: 0.5rem;
		list-style: none;
	}
</style>
