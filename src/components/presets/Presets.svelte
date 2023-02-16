<script lang="ts">
  import { updateVisibility, type Patch } from '$lib/presets'
  import { Visibility } from '$lib/presets/constants'
  import { presetsStore } from '$src/stores'

  let presets: Patch[] = []

  presetsStore.subscribe(store => {
    presets = store.presets
    console.log(store)
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
</script>

<section class="overflow-hidden text-gray-700">
  <div class="pt-8 p-6 md:p-8 w-full justify-start">
    <div class="overflow-x-auto w-full">
      <table class="table table-compact w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tags</th>
            <th>Notes</th>
            <th>Shared</th>
            <th />
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
                  <div class="grid grid-flow-col auto-cols gap-2 justify-start">
                    {#each preset.tags as tag}
                      <span class="badge badge-ghost badge-sm">{tag}</span>
                    {/each}
                  </div>
                </td>
                <td>{preset.notes}</td>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      class="checkbox"
                      checked={preset.visibility === Visibility.public}
                      on:change={event => handleShare(event, preset)}
                    />
                  </label>
                </th>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</section>
