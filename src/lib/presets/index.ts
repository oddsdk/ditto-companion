import * as webnative from 'webnative'
import { get as getStore } from 'svelte/store'

import { fileSystemStore, presetsStore } from '../../stores'
import { PRESETS_DIRS, Visibility } from '$lib/presets/constants'
import { getSubscriptions } from './collect'

export type Patch = {
  version: string
  id: string
  creator?: string
  favorite: boolean
  params: { [ Property in keyof Params ]: number }
  name: string
  notes: string
  tags: string[]
  visibility: Visibility
}

/** 
 * Params are not used except to derive properties
 * in Patch. We can set the types to never and use 
 * this type as meta information while keeping the Patch
 * type the same as in the Ditto plugin.
*/
type Params = {
  delayTime: never
  feedback: never
  mix: never
}

export const AREAS = [ 'Share', 'Collect' ] as const
export type Area = typeof AREAS[ number ]

export type Presets = {
  collection: {
    subscriptions: string[] // Usernames
    presets: Patch[]
    collected: string[] // Patch ids
  }
  presets: Patch[]
  selectedArea: Area
}


/**
 * Load patches from either a public or private file system
 *
 * @param visibility Visibility
 * @returns Promise<Patch[]>
 */
export const loadFromFilesystem: (visibility: Visibility) => Promise<Patch[]> = async (visibility) => {
  const fs = getStore(fileSystemStore)
  const directoryExists = await fs?.exists(PRESETS_DIRS[ visibility ])
  if (!directoryExists) {
    return []
  }

  const linksObject = await fs?.ls(PRESETS_DIRS[ visibility ])
  if (!linksObject) {
    return []
  }

  // convert links object to a list
  const links = Object.entries(linksObject)

  const data = await Promise.all(links.map(async ([ name, _ ]) =>
    JSON.parse(new TextDecoder().decode(await fs?.read(
      webnative.path.combine(PRESETS_DIRS[ visibility ], webnative.path.file(name))
    ))) as Patch
  ))

  return data
}

/**
 * Do the inital hydration of the presetsStore
 */
export const hydratePresetsStore = async (): Promise<void> => {
  // Merge public and private presets and sort alphabetically by name
  const publicPresets = await loadFromFilesystem(Visibility.public)
  const privatePresets = await loadFromFilesystem(Visibility.private)
  const presets = [ ...publicPresets, ...privatePresets ].sort((a, b) => a.name.localeCompare(b.name, 'en', { 'sensitivity': 'base' }))

  presetsStore.update(store => ({
    ...store,
    presets
  }))
}

/**
 * Replace a patch in an array if it exists, otherwise insert it
 *
 * @param arr Patch[]
 * @param element Patch
 */
export const addOrUpdate = (arr: Patch[], element: Patch): Patch[] => {
  const i = arr.findIndex(_element => _element.id === element.id)

  if (i > -1) {
    arr[ i ] = element
  } else {
    arr.push(element)
  }

  return arr
}

/**
 * Save preset to file system and push it into the presetsStore
 *
 * @param preset Patch
 */
export const savePreset = async (preset: Patch): Promise<void> => {
  const fs = getStore(fileSystemStore)

  const contentPath = webnative.path.combine(PRESETS_DIRS[ preset.visibility ], webnative.path.file(`${preset.id}.json`))

  await fs?.write(
    contentPath,
    new TextEncoder().encode(JSON.stringify(preset))
  )
  await fs?.publish()

  const storedPreset = JSON.parse(new TextDecoder().decode(
    await fs?.read(contentPath)
  )) as Patch

  console.log('saved preset', storedPreset)
}

/**
 * Delete preset from the file system and remove it from the preset list
 *
 * @param preset Patch
 */
export const deletePreset = async (preset: Patch): Promise<void> => {
  const fs = getStore(fileSystemStore)
  const contentPath = webnative.path.combine(PRESETS_DIRS[ preset.visibility ], webnative.path.file(`${preset?.id}.json`))

  await fs?.rm(contentPath)

  await fs?.publish()
}

/**
 * Store patches to either a public or private file system
 *
 * @param presets Presets to store
 * @param visibility Visibility
 * @returns Promise<Patch[]>
 */
export const storeToFilesystem: (presets: Patch[], visibility: Visibility) => Promise<void> = async (presets, visibility) => {
  const fs = getStore(fileSystemStore)

  await Promise.all(presets.map(async preset => {
    await fs?.write(
      webnative.path.combine(PRESETS_DIRS[ visibility ], webnative.path.file(`${preset.id}.json`)),
      new TextEncoder().encode(JSON.stringify(preset))
    )
  }))
  await fs?.publish()
}