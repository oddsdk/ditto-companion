import * as webnative from 'webnative'

export enum Visibility {
  public,
  private,
}

export const PRESETS_DIRS = {
  [ Visibility.public ]: webnative.path.directory('public', 'presets'),
  [ Visibility.private ]: webnative.path.directory('private', 'presets')
}