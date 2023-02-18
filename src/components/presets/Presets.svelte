<script lang="ts">
  import { deletePreset, savePreset, type Area, type Patch } from '$lib/presets'
  import { hyrdratePresetsCollection } from '$lib/presets/collect'
  import { updateVisibility } from '$lib/presets/share'
  import { Visibility } from '$lib/presets/constants'
  import { presetsStore, sessionStore, themeStore } from '$src/stores'
  import PresetsCollect from './PresetsCollect.svelte'

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

    await hyrdratePresetsCollection(userPresets, depot, reference)
  }

  init()
</script>

<section
  class="overflow-hidden {$themeStore.selectedTheme === 'light'
    ? 'text-gray-700'
    : 'text-gray-300'}"
>
  <div class="pt-8 p-6 md:p-8 w-full justify-start">
    <div class="overflow-x-auto w-full">
      {#if selectedArea === 'Collect'}
        <button
          class="btn btn-primary w-full mb-4"
          on:click={() => (collectModalOpen = true)}
          on:keypress={() => (collectModalOpen = true)}
        >
          Find Presets
        </button>
        <input
          type="checkbox"
          id="collect"
          class="modal-toggle"
          bind:checked={collectModalOpen}
        />
        <PresetsCollect on:close={() => (collectModalOpen = false)} />
      {/if}
      <table class="table table-compact w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Designer</th>
            <th>Tags</th>
            <th>Notes</th>
            {#if selectedArea === 'Share'}
              <th>Share</th>
            {:else}
              <th>Collect</th>
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
                      <span class="badge badge-ghost badge-sm">{tag}</span>
                    {/each}
                  </div>
                </td>
                <td>
                  {#if preset.notes}
                    {preset.notes}
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
  </div>
</section>
