export type LoginResult = {
  accessToken: string
  message: string
}

export type RegisterResult = {
  message: string
  accessToken: string
  user: {
    id: string
    email: string
    publicKey: string
  }
}

export type VerifyPasscodeResult = {
  success: boolean
  message: string
}
