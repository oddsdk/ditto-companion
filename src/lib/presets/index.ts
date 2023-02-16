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

enum Visibility {
  public,
  private,
}

export const AREAS = ['Share', 'Collect'] as const
export type Area = typeof AREAS[number]

export type Presets = {
  presets: Patch[]
  selectedArea: Area
  // selectedPatch: string
}