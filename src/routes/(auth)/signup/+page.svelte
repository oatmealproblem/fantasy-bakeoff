<script lang="ts">
	import { sign_up } from '#lib/auth.remote.ts';
	import Button from '#lib/components/Button.svelte';
	import Field from '#lib/components/Field.svelte';
	import Page from '#lib/components/Page.svelte';
	import PageTitle from '#lib/components/PageTitle.svelte';
</script>

<Page narrow>
	<PageTitle>Sign up</PageTitle>

	{#each (sign_up.fields.allIssues() ?? []).filter((issue) => issue.path.length === 0) as issue, i (i)}
		<p>{issue.message}</p>
	{/each}

	<form {...sign_up}>
		<Field label="Name" {...sign_up.fields.name.as('text')} autocomplete="name" />
		{#each sign_up.fields.name.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<Field label="Email" {...sign_up.fields.email.as('email')} autocomplete="email" />
		{#each sign_up.fields.email.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<Field
			label="Password"
			{...sign_up.fields._password.as('password')}
			autocomplete="new-password"
		/>
		{#each sign_up.fields._password.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<Button>Create account</Button>
	</form>

	<p>Already have an account? <a href="/login">Log in</a>.</p>
</Page>
