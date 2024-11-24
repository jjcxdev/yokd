<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<main class="m-auto flex w-fit flex-col rounded-md bg-white p-4">
  <h1 class="font-bold text-pink-700">Login/Register</h1>
  <div class="flex bg-blue-500 p-4 text-red-500">Test</div>
  <form class="flex" method="post" action="?/login" use:enhance>
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
