<script lang="ts">
	import { get_user, sign_out } from '#lib/auth.remote.ts';

	const user = await get_user();
</script>

<main>
	{#if user}
		<h1>Hi, {user.name}!</h1>
		<p>Your user ID is {user.id}.</p>
		<form {...sign_out}>
			<button>Sign out</button>
		</form>
	{:else}
		<h1>Fantasy Bakeoff</h1>
		<p><a href="/login">Log in</a> or <a href="/signup">Sign up</a>.</p>
	{/if}
</main>
