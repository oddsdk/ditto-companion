import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type FileSystem from '@oddjs/odd/fs/index'

import { loadTheme } from '$lib/theme'
import type { AccountSettings } from '$lib/account-settings'
import type { Notification } from '$lib/notifications'
import type { Presets } from '$lib/presets'
import type { Session } from '$lib/session'
import type { Theme } from '$lib/theme'

export const themeStore: Writable<Theme> = writable(loadTheme())

export const sessionStore: Writable<Session> = writable({
  username: null,
  session: null,
  authStrategy: null,
  program: null,
  loading: true,
})

export const fileSystemStore: Writable<FileSystem | null> = writable(null)

export const notificationStore: Writable<Notification[]> = writable([])

export const accountSettingsStore: Writable<AccountSettings> = writable({
  avatar: null,
  loading: true,
})

export const presetsStore: Writable<Presets> = writable({
  collection: {
    subscriptions: [],
    presets: [],
    collected: [],
  },
  presets: [],
  selectedArea: 'Share'
})