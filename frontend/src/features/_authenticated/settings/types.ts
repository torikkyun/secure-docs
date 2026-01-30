export type UserProfile = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export type KeySyncStatus = {
  isSynced: boolean
  localPublicKey: string | null
  serverPublicKey: string | null
  message?: string
}

export type UpdateProfileData = {
  name?: string
  email?: string
}

export type RecoverKeysData = {
  mnemonic: string
  passcode: string
}
