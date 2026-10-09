<script lang="ts">
	import { sign_up } from '#lib/auth.remote.ts';
</script>

<main>
	<h1>Sign up</h1>

	{#each (sign_up.fields.allIssues() ?? []).filter((issue) => issue.path.length === 0) as issue, i (i)}
		<p>{issue.message}</p>
	{/each}

	<form {...sign_up}>
		<label>
			Name
			<input {...sign_up.fields.name.as('text')} autocomplete="name" />
		</label>
		{#each sign_up.fields.name.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<label>
			Email
			<input {...sign_up.fields.email.as('email')} autocomplete="email" />
		</label>
		{#each sign_up.fields.email.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<label>
			Password
			<input {...sign_up.fields._password.as('password')} autocomplete="new-password" />
		</label>
		{#each sign_up.fields._password.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<button>Create account</button>
	</form>

	<p>Already have an account? <a href="/login">Log in</a>.</p>
</main>
