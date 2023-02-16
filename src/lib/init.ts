import * as webnative from 'webnative'

import { dev } from '$app/environment'
import { fileSystemStore, presetsStore, sessionStore } from '../stores'
import { webnativeNamespace } from '$lib/app-info'
import { hydratePresetsStore } from '$lib/presets'
import { get } from 'svelte/store'

export const initialize = async (): Promise<void> => {
  try {
    const program: webnative.Program = await webnative.program({
      namespace: webnativeNamespace,
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
      case webnative.ProgramError.InsecureContext:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Insecure Context'
        }))
        break

      case webnative.ProgramError.UnsupportedBrowser:
        sessionStore.update(session => ({
          ...session,
          loading: false,
          error: 'Unsupported Browser'
        }))
        break
    }

  }
}
