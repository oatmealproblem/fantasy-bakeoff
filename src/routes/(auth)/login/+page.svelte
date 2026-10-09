<script lang="ts">
	import { sign_in } from '#lib/auth.remote.ts';
</script>

<main>
	<h1>Log in</h1>

	{#each (sign_in.fields.allIssues() ?? []).filter((issue) => issue.path.length === 0) as issue, i (i)}
		<p>{issue.message}</p>
	{/each}

	<form {...sign_in}>
		<label>
			Email
			<input {...sign_in.fields.email.as('email')} autocomplete="email" />
		</label>
		{#each sign_in.fields.email.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<label>
			Password
			<input {...sign_in.fields._password.as('password')} autocomplete="current-password" />
		</label>
		{#each sign_in.fields._password.issues() ?? [] as issue, i (i)}
			<p>{issue.message}</p>
		{/each}

		<button>Log in</button>
	</form>

	<p>No account? <a href="/signup">Sign up</a>.</p>
</main>
