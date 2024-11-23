<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main>
<h1 class="font-bold text-pink-700">Login/Register</h1>
<form method="post" action="?/login" use:enhance>
	<label>
		Username
		<input name="username" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<button>Login</button>
	<button formaction="?/register">Register</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
</main>

<style>
	main{
		border: 1px solid rebeccapurple;
		padding: 1rem;
		margin: auto;
		width: min-content;
		align-content:space-around;
	}

	h1{
		color: red;
	}
</style>