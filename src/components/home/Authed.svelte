<script lang="ts">
  import { sessionStore } from '../../stores'
</script>

<div
  class="min-h-[calc(100vh-128px)] md:min-h-[calc(100vh-160px)] pt-8 md:pt-16 flex flex-col items-start max-w-[690px] m-auto gap-10 pb-5 text-sm"
>
  <h1 class="text-xl">Welcome, {$sessionStore.username.display}!</h1>

  <div class="flex flex-col items-start justify-center gap-5">
    <h2 class="text-lg">Presets</h2>
    <p>
      Ditto companion lets you share your presets and collect presets from other
      Ditto users.
    </p>
    <a class="btn btn-primary" href="/presets">View Presets</a>
  </div>
</div>
