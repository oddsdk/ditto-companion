import * as odd from '@oddjs/odd'

export enum Visibility {
  public,
  private,
}

export const PRESETS_DIRS = {
  [ Visibility.public ]: odd.path.directory('public', 'presets'),
  [ Visibility.private ]: odd.path.directory('private', 'presets')
}