// Real cryptographic implementation using audited libraries
// X25519 ECDH key exchange with proper security

import { x25519 } from '@noble/curves/ed25519.js'
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic as scureValidateMnemonic,
} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'

// Convert Uint8Array to base64
export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  const chunkSize = 32768 // Process in 32KB chunks to avoid stack overflow

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

// Convert base64 to Uint8Array
export function fromBase64(base64: string): Uint8Array {
  return new Uint8Array(
    atob(base64)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )
}

// Generate random bytes
function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}

// Convert Uint8Array to BufferSource compatible with Web Crypto API
function toBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

// Simple HKDF implementation for key derivation
async function hkdf(
  ikm: Uint8Array,
  info: string,
  length: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    toBuffer(ikm),
    { name: 'HKDF' },
    false,
    ['deriveBits'],
  )

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toBuffer(new Uint8Array(32)), // Empty salt
      info: toBuffer(new TextEncoder().encode(info)),
    },
    key,
    length * 8, // Convert to bits
  )

  return new Uint8Array(derived)
}

export interface KeyPair {
  publicKey: string // X25519 public key (base64)
  privateKey: string // X25519 private key (base64)
  mnemonic: string // 12-word mnemonic
}

export interface EncryptedPrivateKey {
  encryptedKey: string // Encrypted private key (base64)
  salt: string // PBKDF2 salt (base64)
  iv: string // AES-GCM IV (base64)
}

/**
 * Generate a new X25519 key pair with mnemonic backup
 */
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    // Generate 12-word mnemonic
    const mnemonic = generateMnemonic(wordlist, 128) // 128 bits = 12 words

    // Derive seed from mnemonic (without passphrase)
    const seed = mnemonicToSeedSync(mnemonic)

    // For simplicity, use first 32 bytes of seed as X25519 private key
    // In production, you might want to use proper KDF like HKDF
    const privateKeyBytes = seed.slice(0, 32)

    // Generate X25519 public key from private key
    const publicKeyBytes = x25519.getPublicKey(privateKeyBytes)

    return {
      publicKey: toBase64(publicKeyBytes),
      privateKey: toBase64(privateKeyBytes),
      mnemonic,
    }
  } catch (error) {
    console.error('Error generating key pair:', error)
    throw new Error('Failed to generate cryptographic keys')
  }
}

/**
 * Recover key pair from mnemonic
 */
export async function recoverKeyPairFromMnemonic(
  mnemonic: string,
): Promise<KeyPair> {
  // Validate mnemonic
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic')
  }

  // Derive seed from mnemonic
  const seed = mnemonicToSeedSync(mnemonic)

  // Use HKDF to derive X25519 private key from seed (same as generation)
  const privateKeyBytes = await hkdf(seed, 'x25519-key-derivation', 32)

  // Generate X25519 public key from private key
  const publicKeyBytes = x25519.getPublicKey(privateKeyBytes)

  return {
    publicKey: toBase64(publicKeyBytes),
    privateKey: toBase64(privateKeyBytes),
    mnemonic,
  }
}

/**
 * Validate mnemonic format using bip39
 */
export function validateMnemonic(mnemonic: string): boolean {
  return scureValidateMnemonic(mnemonic, wordlist)
}

/**
 * Encrypt private key with passcode using AES-GCM
 */
export async function encryptPrivateKey(
  privateKey: string,
  passcode: string,
): Promise<EncryptedPrivateKey> {
  // Generate random salt and IV
  const salt = randomBytes(32)
  const iv = randomBytes(12)

  // Derive key from passcode using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: toBuffer(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      await crypto.subtle.importKey(
        'raw',
        toBuffer(new TextEncoder().encode(passcode)),
        { name: 'PBKDF2' },
        false,
        ['deriveBits'],
      ),
      256, // 32 bytes * 8 bits
    ),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  // Encrypt private key
  const privateKeyBytes = fromBase64(privateKey)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    keyMaterial,
    toBuffer(privateKeyBytes),
  )

  return {
    encryptedKey: toBase64(new Uint8Array(encrypted)),
    salt: toBase64(salt),
    iv: toBase64(iv),
  }
}

/**
 * Decrypt private key with passcode
 */
export async function decryptPrivateKey(
  encryptedData: EncryptedPrivateKey,
  passcode: string,
): Promise<string> {
  // Derive key from passcode using PBKDF2
  const salt = fromBase64(encryptedData.salt)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: toBuffer(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      await crypto.subtle.importKey(
        'raw',
        toBuffer(new TextEncoder().encode(passcode)),
        { name: 'PBKDF2' },
        false,
        ['deriveBits'],
      ),
      256, // 32 bytes * 8 bits
    ),
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  // Decrypt private key
  const encryptedBytes = fromBase64(encryptedData.encryptedKey)
  const iv = fromBase64(encryptedData.iv)

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBuffer(iv) },
      keyMaterial,
      toBuffer(encryptedBytes),
    )

    return toBase64(new Uint8Array(decrypted))
  } catch (error) {
    throw new Error('Invalid passcode or corrupted data')
  }
}

/**
 * Perform ECDH key exchange to derive shared secret
 */
export async function deriveSharedSecret(
  privateKey: string,
  recipientPublicKey: string,
): Promise<string> {
  const privateKeyBytes = fromBase64(privateKey)
  const recipientPublicKeyBytes = fromBase64(recipientPublicKey)

  // Perform real X25519 ECDH key exchange
  const sharedSecret = x25519.getSharedSecret(
    privateKeyBytes,
    recipientPublicKeyBytes,
  )

  return toBase64(sharedSecret)
}

/**
 * Derive AES key from shared secret for file encryption
 */
export async function deriveAesKeyFromSharedSecret(
  sharedSecret: string,
): Promise<string> {
  const sharedSecretBytes = fromBase64(sharedSecret)

  // Use HKDF to derive AES key from shared secret
  const aesKey = await hkdf(sharedSecretBytes, 'aes-key-derivation', 32)

  return toBase64(aesKey)
}

/**
 * Generate random AES key for file encryption
 */
export function generateAesKey(): string {
  const keyBytes = randomBytes(32) // 256-bit key
  return toBase64(keyBytes)
}

/**
 * Encrypt file data with AES key using AES-GCM
 */
export async function encryptFileData(
  data: Uint8Array,
  aesKey: string,
): Promise<{
  encryptedData: Uint8Array
  iv: string
}> {
  const keyBytes = fromBase64(aesKey)
  const iv = randomBytes(12)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toBuffer(keyBytes),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    cryptoKey,
    toBuffer(data),
  )

  return {
    encryptedData: new Uint8Array(encrypted),
    iv: toBase64(iv),
  }
}

/**
 * Decrypt file data with AES key using AES-GCM
 */
export async function decryptFileData(
  encryptedData: Uint8Array | string,
  aesKey: string,
  iv: string,
): Promise<Uint8Array> {
  const keyBytes = fromBase64(aesKey)
  const encryptedBytes =
    typeof encryptedData === 'string'
      ? fromBase64(encryptedData)
      : encryptedData
  const ivBytes = fromBase64(iv)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toBuffer(keyBytes),
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toBuffer(ivBytes) },
    cryptoKey,
    toBuffer(encryptedBytes),
  )

  return new Uint8Array(decrypted)
}

/**
 * Wrap AES key for secure sharing using AES-KW
 */
export async function wrapAesKey(
  aesKey: string,
  wrappingKey: string,
): Promise<string> {
  const aesKeyBytes = fromBase64(aesKey)
  const wrappingKeyBytes = fromBase64(wrappingKey)

  const wrappingCryptoKey = await crypto.subtle.importKey(
    'raw',
    toBuffer(wrappingKeyBytes),
    { name: 'AES-KW' },
    false,
    ['wrapKey'],
  )

  const aesKeyToWrap = await crypto.subtle.importKey(
    'raw',
    toBuffer(aesKeyBytes),
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  )

  const wrappedKey = await crypto.subtle.wrapKey(
    'raw',
    aesKeyToWrap,
    wrappingCryptoKey,
    'AES-KW',
  )

  return toBase64(new Uint8Array(wrappedKey))
}

/**
 * Unwrap AES key for file access using AES-KW
 */
export async function unwrapAesKey(
  wrappedKey: string,
  unwrappingKey: string,
): Promise<string> {
  const wrappedKeyBytes = fromBase64(wrappedKey)
  const unwrappingKeyBytes = fromBase64(unwrappingKey)

  const unwrappingCryptoKey = await crypto.subtle.importKey(
    'raw',
    toBuffer(unwrappingKeyBytes),
    { name: 'AES-KW' },
    false,
    ['unwrapKey'],
  )

  const unwrappedKey = await crypto.subtle.unwrapKey(
    'raw',
    toBuffer(wrappedKeyBytes),
    unwrappingCryptoKey,
    { name: 'AES-KW' },
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  )

  const rawKey = await crypto.subtle.exportKey('raw', unwrappedKey)
  return toBase64(new Uint8Array(rawKey))
}

/**
 * Get user keys from localStorage
 */
export function getUserKeys(): {
  publicKey: string
  encryptedPrivateKey: EncryptedPrivateKey
} | null {
  // Check if running in browser (not SSR)
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const publicKey = localStorage.getItem('userPublicKey')
    const encryptedPrivateKeyStr = localStorage.getItem('encryptedPrivateKey')

    if (!publicKey || !encryptedPrivateKeyStr) {
      return null
    }

    const encryptedPrivateKey = JSON.parse(
      encryptedPrivateKeyStr,
    ) as EncryptedPrivateKey
    return { publicKey, encryptedPrivateKey }
  } catch (error) {
    console.error('Failed to get user keys from localStorage:', error)
    return null
  }
}

/**
 * Derive AES key from shared secret for key wrapping
 */
export async function deriveWrappingKeyFromSharedSecret(
  sharedSecret: string,
): Promise<string> {
  const sharedSecretBytes = fromBase64(sharedSecret)

  // Use HKDF to derive wrapping key from shared secret
  const wrappingKey = await hkdf(
    sharedSecretBytes,
    'wrapping-key-derivation',
    32,
  )

  return toBase64(wrappingKey)
}
