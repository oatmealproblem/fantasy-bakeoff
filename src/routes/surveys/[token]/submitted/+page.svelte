<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
	import { get_survey } from '#lib/game.remote.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const survey = $derived(await get_survey(params.token));
</script>

<Page>
	<PageTitle>Responses saved</PageTitle>
	<p>
		May the odds be ever in your favor&hellip;
	</p>
	<p><a href="/surveys/{params.token}">View or edit your responses</a></p>
	{#if survey.is_creator}
		<p><a href="/games/{survey.game_id}">Back to the game</a></p>
	{/if}
</Page>
