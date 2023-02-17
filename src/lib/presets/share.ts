import * as webnative from 'webnative'
import { get as getStore } from 'svelte/store'

import { fileSystemStore } from '../../stores'
import { PRESETS_DIRS, Visibility } from '$lib/presets/constants'
import { savePreset, type Patch } from '$lib/presets'

export const updateVisibility = async (preset: Patch, visibility: Visibility): Promise<void> => {
  const fs = getStore(fileSystemStore)
  const contentPath = webnative.path.combine(PRESETS_DIRS[ preset.visibility ], webnative.path.file(`${preset.id}.json`))

  await fs?.rm(
    contentPath
  )
  await fs.publish()

  preset.visibility = visibility

  await savePreset(preset)
}