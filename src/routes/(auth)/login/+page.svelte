<script lang="ts">
	import { sign_in } from '#lib/auth.remote.ts';
	import Button from '#lib/components/Button.svelte';
	import Field from '#lib/components/Field.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
</script>

<Page narrow>
	<PageTitle>Fantasy Bake Off</PageTitle>

	{#each (sign_in.fields.allIssues() ?? []).filter((issue) => issue.path.length === 0) as issue, i (i)}
		<p>{issue.message}</p>
	{/each}

	<form {...sign_in}>
		<Field label="Email" {...sign_in.fields.email.as('email')} autocomplete="email" />
		{#each sign_in.fields.email.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<Field
			label="Password"
			{...sign_in.fields._password.as('password')}
			autocomplete="current-password"
		/>
		{#each sign_in.fields._password.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<Button>Log in</Button>
	</form>

	<p>No account? <a href="/signup">Sign up</a>.</p>
</Page>
