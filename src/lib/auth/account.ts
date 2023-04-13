import * as uint8arrays from 'uint8arrays'
import { sha256 } from '@oddjs/odd/components/crypto/implementation/browser'
import { publicKeyToDid } from '@oddjs/odd/did/transformers'
import type { Crypto } from '@oddjs/odd'
import { get as getStore } from 'svelte/store'

import { asyncDebounce } from '$lib/utils'
import { fileSystemStore, sessionStore } from '../../stores'

export const USERNAME_STORAGE_KEY = 'fullUsername'

export const isUsernameValid = async (username: string): Promise<boolean> => {
  const session = getStore(sessionStore)
  return session.authStrategy.isUsernameValid(username)
}

const _isUsernameAvailable = async (
  username: string
) => {
  const session = getStore(sessionStore)
  return session.authStrategy.isUsernameAvailable(username)
}

const debouncedIsUsernameAvailable = asyncDebounce(
  _isUsernameAvailable,
  300
)

export const isUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  return debouncedIsUsernameAvailable(username)
}

export const createDID = async (crypto: Crypto.Implementation): Promise<string> => {
  const pubKey = await crypto.keystore.publicExchangeKey()
  const ksAlg = await crypto.keystore.getAlgorithm()

  return publicKeyToDid(crypto, pubKey, ksAlg)
}

export const prepareUsername = async (username: string): Promise<string> => {
  const normalizedUsername = username.normalize('NFD')
  const hashedUsername = await sha256(
    new TextEncoder().encode(normalizedUsername)
  )

  return uint8arrays
    .toString(hashedUsername, 'base32')
    .slice(0, 32)
}

export const loadAccount = async (username: string): Promise<void> => {
  const { authStrategy } = getStore(sessionStore)
  const session = await authStrategy.session()

  fileSystemStore.set(session.fs)

  sessionStore.update(state => ({
    ...state,
    username: {
      full: username,
      display: username.split('-')[ 1 ]
    },
    session
  }))
}
