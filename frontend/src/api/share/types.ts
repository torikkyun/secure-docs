export type RecipientShare = {
  recipientId: string
  wrappedAesKey: string
}

export type ShareRecipient = {
  id: string
  name: string
  email: string
}

export type CreatedShare = {
  id: string
  recipient: ShareRecipient
  createdAt: string
}

export type CreateShareResult = {
  fileId: string
  shares: CreatedShare[]
  sharedAt: string
  warnings?: string[]
}

export type RevokedUser = {
  id: string
  name: string
  email: string
}

export type RevokeShareResult = {
  message: string
  revokedUser: RevokedUser
}
