import * as odd from '@oddjs/odd'

import { dev } from '$app/environment'
import { fileSystemStore, sessionStore } from '../stores'
import { oddNamespace } from '$lib/app-info'
import { hydratePresetsStore } from '$lib/presets'

export const initialize = async (): Promise<void> => {
  try {
    const program: odd.Program = await odd.program({
      namespace: oddNamespace,
      debug: dev
    })

    if (program.session) {
      const fullUsername = program.session.username

      sessionStore.set({
        username: {
          full: fullUsername,
          display: fullUsername.split('-')[1],
        },
        session: program.session,
        authStrategy: program.auth,
        program,
        loading: false,
      })

      fileSystemStore.set(program.session.fs)

      await hydratePresetsStore()

    } else {
      // Not authed
      sessionStore.set({
        username: null,
        session: null,
        authStrategy: program.auth,
        program,
        loading: false,
      })

    }

  } catch (error) {
    console.error(error)

    switch (error) {
      case odd.ProgramError.InsecureContext:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Insecure Context'
        }))
        break

      case odd.ProgramError.UnsupportedBrowser:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Unsupported Browser'
        }))
        break
    }

  }
}
