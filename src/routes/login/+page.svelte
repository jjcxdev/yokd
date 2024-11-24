<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<main class="m-auto flex w-96 flex-col gap-2 rounded-md bg-white p-4">
  <h1 class="text-center font-bold">Login/Register</h1>
  <form class="flex flex-col gap-2" method="post" action="?/login" use:enhance>
    <label class="flex justify-between gap-1 px-10">
      Username
      <input class="rounded-sm border" name="username" />
    </label>
    <label class="flex justify-between gap-1 px-10">
      Password
      <input class="rounded-sm border" type="password" name="password" />
    </label>
    <button>Login</button>
    <a href="/login/google">Sign in with Google</a>
    <button formaction="?/register">Register</button>
  </form>
  <p style="color: red">{form?.message ?? ''}</p>
</main>
