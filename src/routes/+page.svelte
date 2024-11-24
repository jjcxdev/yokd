<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SessionValidationResult } from '$lib/server/auth';

  let { data }: { data: { user: SessionValidationResult['user'] } } = $props();
</script>

<h1>Hi, {data!.user!.username}!</h1>
<p>Let's get after it.</p>
<form method="post" action="?/logout" use:enhance>
  <button>Sign out</button>
</form>
