import * as webnative from 'webnative'
import { get as getStore } from 'svelte/store'

import { fileSystemStore, presetsStore } from '../../stores'
import { PRESETS_DIRS, Visibility } from '$lib/presets/constants'
import { addOrUpdate, savePreset, type Patch } from '$lib/presets'

/**
 * Change the visibility of a preset
 *
 * @param preset Preset to update
 * @param visibility Desired visibility
*/
export const updateVisibility = async (preset: Patch, visibility: Visibility): Promise<void> => {
  const fs = getStore(fileSystemStore)
  const contentPath = webnative.path.combine(PRESETS_DIRS[ preset.visibility ], webnative.path.file(`${preset.id}.json`))

  await fs?.rm(
    contentPath
  )
  await fs.publish()

  preset.visibility = visibility

  await savePreset(preset)

  presetsStore.update((state) => ({
    ...state,
    presets: addOrUpdate(state.presets, preset).sort((a, b) => a.name.localeCompare(b.name, 'en', { 'sensitivity': 'base' })),
  }))
}