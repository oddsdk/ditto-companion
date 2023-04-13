<script lang="ts">
  import { sessionStore } from '$src/stores'
  import { appName } from '$lib/app-info'
  import Alert from '$components/icons/Alert.svelte'
  import Share from '$components/icons/Share.svelte'
</script>

<div
  class="min-h-[calc(100vh-96px)] flex flex-col items-start justify-center max-w-[700px] m-auto gap-6 pb-5 text-base"
>
  <h1 class="text-xl">Welcome to {appName}</h1>

  <div class="grid grid-flow-row auto-rows max-w-[650px] gap-3">
    <p>Ditto companion is an app for sharing and collecting Ditto presets.</p>

    <p>
      Connect with the Ditto plugin by selecting <Share /> in the plugin interface.
    </p>
    <img src="plugin.png" alt="Ditto plugin" />
    <p>
      <a
        class="link link-tertiary"
        href="https://github.com/oddsdk/ditto"
        target="_blank"
        rel="noreferrer"
      >
        Ditto
      </a>
      and
      <a
        class="link link-tertiary"
        href="https://github.com/oddsdk/ditto-companion"
        target="_blank"
        rel="noreferrer"
      >
        Ditto Companion
      </a>
      are hackathon software created by the ODD SDK team. See the project repositories
      to try them out.
    </p>
  </div>

  {#if $sessionStore.error === 'Unsupported Browser'}
    <div class="p-4 rounded-lg bg-base-content text-neutral-50">
      <h3 class="flex items-center gap-2 text-base">
        <span class="-translate-y-[2px]"><Alert /></span>
        Unsupported device
      </h3>
      <p>
        It appears this device isn’t supported. The ODD SDK requires IndexedDB
        in order to function. This browser doesn’t appear to implement this API.
        Are you in a Firefox private window?
      </p>
    </div>
  {/if}
</div>
