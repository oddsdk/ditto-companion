<script lang="ts">
  import { fly } from 'svelte/transition'

  import { deletePreset, hydratePresetsStore, savePreset, type Area, type Patch } from '$lib/presets'
  import { hyrdratePresetsCollection } from '$lib/presets/collect'
  import { updateVisibility } from '$lib/presets/share'
  import { Visibility } from '$lib/presets/constants'
  import { presetsStore, sessionStore, themeStore } from '$src/stores'
  import PresetsCollect from '$components/presets/PresetsCollect.svelte'
  import Plus from '$components/icons/Plus.svelte'

  const { depot, reference } = $sessionStore.program.components
  const username = $sessionStore.username.display
  let collectModalOpen = false
  let presets: Patch[] = []
  let selectedArea: Area

  presetsStore.subscribe(store => {
    selectedArea = store.selectedArea

    if (selectedArea === 'Share') {
      presets = store.presets.filter(preset => preset.creator === username)
    } else {
      presets = store.collection.presets
    }
  })

  async function handleShare(
    event: { currentTarget: HTMLInputElement },
    preset: Patch
  ) {
    const checked = event.currentTarget.checked

    if (checked) {
      await updateVisibility(preset, Visibility.public)
    } else {
      await updateVisibility(preset, Visibility.private)
    }
  }

  async function handleCollect(
    event: { currentTarget: HTMLInputElement },
    preset: Patch
  ) {
    const checked = event.currentTarget.checked

    if (checked) {
      presetsStore.update(store => ({
        ...store,
        collection: {
          ...store.collection,
          collected: [...store.collection.collected, preset.id]
        }
      }))

      // Unfavorite preset on collection
      preset.favorite = false

      await savePreset(preset)

    } else {
      presetsStore.update(store => ({
        ...store,
        collection: {
          ...store.collection,
          collected: store.collection.collected.filter(id => id !== preset.id)
        }
      }))

      await deletePreset(preset)
    }
  }

  async function init() {
    const userPresets = $presetsStore.presets

    await hydratePresetsStore()
    await hyrdratePresetsCollection(userPresets, depot, reference)
  }

  init()
</script>

<input
  type="checkbox"
  id="collect"
  class="modal-toggle"
  bind:checked={collectModalOpen}
/>
<PresetsCollect on:close={() => (collectModalOpen = false)} on:subscribe />

<section
  class="overflow-hidden {$themeStore.selectedTheme === 'light'
    ? 'text-gray-800'
    : 'text-gray-200'}"
>
  <div class="p-6 md:p-8 pb-6 w-full justify-start">
    <div class="overflow-x-auto w-full">
      <table class="table table-compact w-full">
        <thead>
          <tr>
            <th class="bg-base-content text-base-100">Name</th>
            <th class="bg-base-content text-base-100">Designer</th>
            <th class="bg-base-content text-base-100">Tags</th>
            <th class="bg-base-content text-base-100">Notes</th>
            {#if selectedArea === 'Share'}
              <th class="bg-base-content text-base-100">Share</th>
            {:else}
              <th class="bg-base-content text-base-100">Collect</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#if presets.length > 0}
            {#each presets as preset}
              <tr>
                <td>
                  <div>
                    {preset.name}
                  </div>
                </td>
                <td>
                  <div>
                    {preset.creator}
                  </div>
                </td>
                <td>
                  <div class="grid grid-flow-col auto-cols gap-2 justify-start">
                    {#each preset.tags as tag}
                      <span
                        class="badge badge-tertiary badge-outline badge-sm rounded-full"
                      >
                        {tag}
                      </span>
                    {/each}
                  </div>
                </td>
                <td>
                  {#if preset.notes}
                    <div class="w-96 truncate">
                      {preset.notes}
                    </div>
                  {/if}
                </td>
                <th>
                  {#if selectedArea === 'Share'}
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox"
                        checked={preset.visibility === Visibility.public}
                        on:change={event => handleShare(event, preset)}
                      />
                    </label>
                  {:else}
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox"
                        checked={$presetsStore.collection.collected.includes(
                          preset.id
                        )}
                        on:change={event => handleCollect(event, preset)}
                      />
                    </label>
                  {/if}
                </th>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <button
      on:click={() => (collectModalOpen = true)}
      on:keypress={() => (collectModalOpen = true)}
      in:fly={{ y: 20, duration: 400 }}
      class="btn btn-primary btn-2xl hover:scale-105 duration-250 ease-in-out rounded-lg absolute bottom-20 right-10"
    >
      <Plus />
    </button>
  </div>
</section>
