<script lang="ts">
  import * as collect from '$lib/presets/collect'
  import { asyncDebounce } from '$lib/utils'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { presetsStore, sessionStore } from '$src/stores'
  import { addNotification } from '$lib/notifications'
  import LoadingSpinner from '$components/common/LoadingSpinner.svelte'

  type View = 'lookup' | 'scanning' | 'no-presets'

  const { depot, reference } = $sessionStore.program.components
  let view: View = 'lookup'
  let errorMessage: string | null = null
  let subscriptions: string[] = []
  let username = ''

  const debouncedLookupFileSystem = asyncDebounce(collect.lookupFileSystem, 500)
  const dispatch = createEventDispatcher()

  const unsubscribePresetsStore = presetsStore.subscribe(store => {
    subscriptions = store.collection.subscriptions
  })

  async function handleUsername(event: { currentTarget: HTMLInputElement }) {
    errorMessage = null

    username = event.currentTarget.value
    if (username.length === 0) return

    if (username === $sessionStore.username.display) {
      errorMessage = 'No need to collect presets from yourself'
      return
    }

    const cid = await debouncedLookupFileSystem(username, reference)

    if (!cid) {
      errorMessage = `Could not find a user named ${username}`
      return
    }

    if (subscriptions.includes(username)) {
      errorMessage = `You are already collecting presets from ${username}`
      return
    }

    if (cid) {
      view = 'scanning'

      const presetsDirectory = await collect.getPresetsDirectory(
        cid,
        depot,
        reference
      )

      if (presetsDirectory) {
        const presets = await collect.getPresets(presetsDirectory)

        if (presets.length > 0) {
          presetsStore.update(store => ({
            ...store,
            collection: {
              ...store.collection,
              presets: [...store.collection.presets, ...presets],
              subscriptions: [...store.collection.subscriptions, username]
            }
          }))

          await collect.saveSubscription(username)

          dispatch('subscribe')
          addNotification(`Added presets from ${username}`)
          closeModal()
        } else {
          view = 'no-presets'
        }
      } else {
        view = 'no-presets'
      }
    }
  }

  function closeModal() {
    errorMessage = null

    // Not ideal, but delays until modal is not visibile
    setTimeout(() => {
      username = ''
      view = 'lookup'
    }, 200)

    dispatch('close')
  }

  onDestroy(unsubscribePresetsStore)
</script>

<div class="modal modal-bottom sm:modal-middle">
  <div
    class="modal-box grid grid-flow-row auto-rows grid-cols-1 justify-center"
  >
    <h3 class="font-bold text-lg">Find Presets</h3>
    {#if view === 'lookup'}
      <div class="grid form-control justify-items-center">
        <p class="text-base py-4">
          Enter the name of a Ditto user to start collecting their presets.
        </p>
        <div class="grid grid-cols-1 w-5/6 justify-items-center">
          <input
            type="text"
            placeholder="Username"
            class="input input-bordered w-full max-w-xs"
            bind:value={username}
            on:input={handleUsername}
          />
        </div>
        <label for="" class="label">
          {#if errorMessage}
            <span class="label-text">{errorMessage}</span>
          {/if}
        </label>
      </div>
    {:else if view === 'scanning'}
      <p class="py-4 text-base w-full">Searching for {username}'s presets.</p>
      <div class="grid grid-flow-row auto-rows w-full justify-center">
        <LoadingSpinner />
      </div>
    {:else if view === 'no-presets'}
      <p class="py-4 text-base w-full">
        {username} has not shared any presets.
      </p>
    {/if}

    <div class="modal-action">
      <button
        class="btn btn-outline btn-md"
        on:click={closeModal}
        on:keypress={closeModal}
      >
        {#if view === 'no-presets'}
          Close
        {:else}
          Cancel
        {/if}
      </button>
    </div>
  </div>
</div>
