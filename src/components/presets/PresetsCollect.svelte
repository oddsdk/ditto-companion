<script lang="ts">
  import * as collect from '$lib/presets/collect'
  import { asyncDebounce } from '$lib/utils'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { presetsStore, sessionStore } from '$src/stores'
  import { addNotification } from '$lib/notifications'

  const { depot, reference } = $sessionStore.program.components
  let errorMessage: string | null = null
  let subscriptions: string[] = []
  let username = ''

  const dispatch = createEventDispatcher()

  const debouncedLookupFileSystem = asyncDebounce(collect.lookupFileSystem, 500)

  const unsubscribePresetsStore = presetsStore.subscribe(store => {
    subscriptions = store.collection.subscriptions
  })

  async function handleUsername(event: { currentTarget: HTMLInputElement }) {
    username = event.currentTarget.value
    if (username.length === 0) return

    if (username === $sessionStore.username.display) {
      errorMessage = 'No need to collect presets from yourself'
      return
    }

    errorMessage = null

    if (subscriptions.includes(username)) {
      errorMessage = `You are already collecting presets from ${username}`
      return
    }

    const cid = await debouncedLookupFileSystem(username, reference)

    if (cid) {
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

          addNotification(`Added presets from ${username}`)
          closeModal()
        } else {
          errorMessage = `${username} does not share presets. Tell them they should hop on this Ditto train! 🚂`
        }
      } else {
        errorMessage = `${username} does not share presets. Tell them they should hop on this Ditto train! 🚂`
      }
    } else {
      errorMessage = `Could not find a user named ${username}`
    }
  }

  function closeModal() {
    username = ''
    errorMessage = null

    dispatch('close')
  }

  onDestroy(unsubscribePresetsStore)
</script>

<div class="modal modal-bottom sm:modal-middle">
  <div class="grid grid-flow-row auto-rows modal-box justify-center">
    <h3 class="font-bold text-lg">Find Presets</h3>
    <p class="py-4">Enter a username to start collecting their presets.</p>
    <div class="form-control w-full">
      <label for="" class="label w-full">
        <span class="label-text">Enter a name</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        bind:value={username}
        on:input={handleUsername}
      />
      <label for="" class="label">
        {#if errorMessage}
          <span class="label-text text-error">{errorMessage}</span>
        {/if}
      </label>
    </div>

    <div class="modal-action">
      <button
        class="btn btn-outline btn-md"
        on:click={closeModal}
        on:keypress={closeModal}
      >
        Cancel
      </button>
    </div>
  </div>
</div>
