import * as webnative from 'webnative'
import { get as getStore } from 'svelte/store'
import { getSimpleLinks } from 'webnative/fs/protocol/basic'
import { path, CID, Depot, Reference } from 'webnative'
import type { PublicFile } from 'webnative/fs/v1/PublicFile'
import { PublicTree } from 'webnative/fs/v1/PublicTree'

import type { Patch } from '$lib/presets'
import { fileSystemStore, presetsStore } from '$src/stores'

/**
 * Check filesystem exists for a username
 *
 * @param username Display name
 * @param reference Reference.Implementation
 * @returns CID or null if not found
 */
export async function lookupFileSystem(username: string, reference: Reference.Implementation): Promise<CID | null> {
  return await reference.dataRoot.lookup(`ditto-${username}`)
}

/**
 * Get the presets directory from a filesystem
 *
 * @param cid Data root CID for the filesystem
 * @param depot Depot.Implementation
 * @param reference Reference.Implementation
 * @returns Public tree for presets directory or null if not found
 */
export async function getPresetsDirectory(
  cid: CID,
  depot: Depot.Implementation,
  reference: Reference.Implementation
): Promise<PublicTree | null> {
  const links = await getSimpleLinks(depot, cid)

  if (links.public) {
    const publicCid = links.public.cid as CID
    const publicTree = await PublicTree.fromCID(depot, reference, publicCid)

    const presetsDirectory = (await publicTree.get(
      path.unwrap(path.directory('presets'))
    )) as PublicTree

    return presetsDirectory
  }

  return null
}

/**
 * Gets presets froma preset directory
 *
 * @param presetsDirectory Public tree for presets directory
 * @returns Patch[]
 */
export async function getPresets(presetsDirectory: PublicTree): Promise<Patch[]> {
  const presetsLinks = Object.values(await presetsDirectory.ls([]))

  return await Promise.all(
    presetsLinks.map(async presetLink => {
      const file = (await presetsDirectory.get([
        presetLink.name
      ])) as PublicFile

      const preset = JSON.parse(new TextDecoder().decode(file.content))

      return preset
    })
  )
}

/**
 * Add username to stored list of subscriptions
 *
 * @param username Username to subscribe to
 */
export async function saveSubscription(username: string): Promise<void> {
  const fs = getStore(fileSystemStore)
  const contentPath = webnative.path.file('private', 'subscriptions.json')

  if (await fs.exists(contentPath)) {
    const subscriptions = JSON.parse(
      new TextDecoder().decode(
        await fs?.read(contentPath)
      )
    ) as string[]

    // Already subscribed to user
    if (subscriptions.includes(username)) return

    await fs?.write(contentPath,
      new TextEncoder().encode(
        JSON.stringify([ ...subscriptions, username ])
      )
    )
    await fs?.publish()

  } else {
    await fs?.write(contentPath,
      new TextEncoder().encode(
        JSON.stringify([ username ])
      )
    )
    await fs?.publish()
  }
}

/**
 * Looks up list of subscriptions
 *
 * @returns List of usernames
 */
export async function getSubscriptions(): Promise<string[]> {
  const fs = getStore(fileSystemStore)
  const contentPath = webnative.path.file('private', 'subscriptions.json')

  if (await fs.exists(contentPath)) {
    return JSON.parse(
      new TextDecoder().decode(
        await fs?.read(contentPath)
      )
    ) as string[]
  } else {
    return []
  }
}

/** 
 * Load the presets collection with presets by subscription
 *
 * @param userPresets Presets in the user's filesystem
 * @param depot Depot.Implementation
 * @param reference Reference.Implementation
 *
*/
export async function hyrdratePresetsCollection(
  userPresets: Patch[],
  depot: Depot.Implementation,
  reference: Reference.Implementation
): Promise<void> {
  const subscriptions = await getSubscriptions()

  presetsStore.update(store => ({
    ...store,
    collection: {
      ...store.collection,
      subscriptions
    }
  }))

  const collections = await Promise.all(
    subscriptions.map(async subscription => {
      console.log('subscribed to', subscription)

      // Get presets by subscription
      const cid = await lookupFileSystem(subscription, reference)
      const presetsDirectory = await getPresetsDirectory(cid, depot, reference)
      const collectablePresets = await getPresets(presetsDirectory)

      // Determine ids of collected presets (they are in the user's filesystem)
      const collectablePresetIds = collectablePresets.map(p => p.id)
      const presetIds = userPresets.map(p => p.id)
      const collectedIds = collectablePresetIds.filter(id => presetIds.includes(id))

      return { collectablePresets, collectedIds }
    })
  )

  const collection = collections.reduce((acc, curr) => ({
    collectablePresets: acc.collectablePresets.concat(curr.collectablePresets),
    collectedIds: acc.collectedIds.concat(curr.collectedIds)
  }),
    { collectablePresets: [], collectedIds: [] }
  )

  // Remove duplicate presets and ids
  const collectablePresetIds = collection.collectablePresets.map(p => p.id)
  const presets = collection.collectablePresets.filter(({ id }, index) => !collectablePresetIds.includes(id, index + 1))
  const collected = Array.from(new Set(collection.collectedIds))

  presetsStore.update(store => ({
    ...store,
    collection: {
      ...store.collection,
      presets: presets.sort((a, b) => a.name.localeCompare(b.name, 'en', { 'sensitivity': 'base' })),
      collected
    }
  }))
}
