<script lang="ts">
  import { onDestroy } from 'svelte'
  import { goto } from '$app/navigation'

  import { presetsStore, sessionStore } from '$src/stores'
  import { type Area, AREAS } from '$lib/presets'
  import PresetsContainer from '$components/presets/Container.svelte'
  import Presets from '$components/presets/Presets.svelte'

  /**
   * Tab between the share/collect areas and load associated presets
   * @param area
   */
  const handleChangeTab: (area: Area) => void = area =>
    presetsStore.update(store => ({
      ...store,
      selectedArea: area
    }))

  // If the user is not authed redirect them to the home page
  const unsubscribe = sessionStore.subscribe(newState => {
    if (!newState.loading && !newState.session) {
      goto('/')
    }
  })

  onDestroy(unsubscribe)
</script>

<div class="p-2 mb-14 text-center">
  {#if $sessionStore.session}
    <div class="flex items-center justify-center translate-y-1/2 w-fit m-auto">
      <div class="tabs border-2 overflow-hidden border-base-content rounded-lg">
        {#each AREAS as area}
          <button
            on:click={() => handleChangeTab(area)}
            class="tab h-10 font-bold text-sm ease-in {$presetsStore.selectedArea ===
            area
              ? 'tab-active bg-base-content text-base-100'
              : 'bg-base-100 text-base-content'}"
          >
            {area}
          </button>
        {/each}
      </div>
    </div>

    <PresetsContainer>
      <Presets />
    </PresetsContainer>
  {/if}
</div>
