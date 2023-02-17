import { getSimpleLinks } from 'webnative/fs/protocol/basic'
import { path, CID, Depot, Reference } from 'webnative'
import type { PublicFile } from 'webnative/fs/v1/PublicFile'
import { PublicTree } from 'webnative/fs/v1/PublicTree'

import type { Patch } from '$lib/presets'

export async function lookupFileSystem(username: string, reference: Reference.Implementation): Promise<CID | null> {
  return await reference.dataRoot.lookup(`ditto-${username}`)
}

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

