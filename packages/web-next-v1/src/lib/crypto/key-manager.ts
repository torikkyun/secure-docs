import * as bip39 from "bip39";
import { Buffer } from "buffer";
import { del, get, set } from "idb-keyval";
import nacl from "tweetnacl";
import util from "tweetnacl-util";

// Ensure Buffer is available globally for bip39 if needed, though we import it.
if (typeof window !== "undefined" && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

const STORAGE_KEYS = {
  DEVICE_KEY: "secure_docs_device_key", // Handle to the Web Crypto key
  WRAPPED_PRIVATE_KEY: "secure_docs_wrapped_priv_key", // Encrypted X25519 private key
  PUBLIC_KEY: "secure_docs_public_key", // X25519 public key (base64)
};

export interface Identity {
  publicKey: string;
  privateKey: Uint8Array;
  mnemonic?: string; // Only present during registration/recovery
}

export class KeyManager {
  /**
   * Generates a new identity (Mnemonic + KeyPair).
   * Returns the identity so the UI can show the Mnemonic to the user.
   */
  static async generateIdentity(): Promise<Identity> {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    // Use the first 32 bytes of the seed for the secret key
    const secretKey = new Uint8Array(seed.slice(0, 32));
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

    return {
      publicKey: util.encodeBase64(keyPair.publicKey),
      privateKey: keyPair.secretKey,
      mnemonic,
    };
  }

  /**
   * Recovers an identity from a Mnemonic.
   */
  static async recoverIdentity(mnemonic: string): Promise<Identity> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const secretKey = new Uint8Array(seed.slice(0, 32));
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

    return {
      publicKey: util.encodeBase64(keyPair.publicKey),
      privateKey: keyPair.secretKey,
      mnemonic,
    };
  }

  /**
   * Saves the identity to IndexedDB, protecting the private key with a non-extractable Web Crypto Device Key.
   */
  static async saveIdentity(identity: Identity): Promise<void> {
    // 1. Generate a non-extractable Device Key
    const deviceKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // extractable: false (Key cannot be exported)
      ["encrypt", "decrypt"]
    );

    // 2. Wrap (Encrypt) the Private Key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const wrappedKeyBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      deviceKey,
      identity.privateKey
    );

    // 3. Store everything
    // We store the IV + Ciphertext together
    const wrappedKeyCombined = new Uint8Array(
      iv.length + wrappedKeyBuffer.byteLength
    );
    wrappedKeyCombined.set(iv);
    wrappedKeyCombined.set(new Uint8Array(wrappedKeyBuffer), iv.length);

    await set(STORAGE_KEYS.DEVICE_KEY, deviceKey);
    await set(STORAGE_KEYS.WRAPPED_PRIVATE_KEY, wrappedKeyCombined);
    await set(STORAGE_KEYS.PUBLIC_KEY, identity.publicKey);
  }

  /**
   * Loads the identity from IndexedDB.
   * Decrypts the private key using the stored Device Key.
   */
  static async loadIdentity(): Promise<Identity | null> {
    try {
      const deviceKey = await get<CryptoKey>(STORAGE_KEYS.DEVICE_KEY);
      const wrappedKeyCombined = await get<Uint8Array>(
        STORAGE_KEYS.WRAPPED_PRIVATE_KEY
      );
      const publicKey = await get<string>(STORAGE_KEYS.PUBLIC_KEY);

      if (!(deviceKey && wrappedKeyCombined && publicKey)) {
        return null;
      }

      // Extract IV and Ciphertext
      const iv = wrappedKeyCombined.slice(0, 12);
      const ciphertext = wrappedKeyCombined.slice(12);

      // Decrypt
      const privateKeyBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        deviceKey,
        ciphertext
      );

      return {
        publicKey,
        privateKey: new Uint8Array(privateKeyBuffer),
      };
    } catch (error) {
      console.error("Failed to load identity:", error);
      return null;
    }
  }

  /**
   * Clears the identity from storage.
   */
  static async clearIdentity(): Promise<void> {
    await del(STORAGE_KEYS.DEVICE_KEY);
    await del(STORAGE_KEYS.WRAPPED_PRIVATE_KEY);
    await del(STORAGE_KEYS.PUBLIC_KEY);
  }

  // --- Encryption / Decryption Helpers ---

  /**
   * Encrypts a message for a recipient's public key.
   * Returns a base64 encoded string containing the nonce and ciphertext.
   */
  static encryptMessage(
    message: string,
    recipientPublicKeyBase64: string,
    senderPrivateKey: Uint8Array
  ): string {
    const recipientPublicKey = util.decodeBase64(recipientPublicKeyBase64);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = util.decodeUTF8(message);

    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPublicKey,
      senderPrivateKey
    );

    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    return util.encodeBase64(fullMessage);
  }

  /**
   * Decrypts a message from a sender.
   */
  static decryptMessage(
    encryptedMessageBase64: string,
    senderPublicKeyBase64: string,
    recipientPrivateKey: Uint8Array
  ): string | null {
    try {
      const fullMessage = util.decodeBase64(encryptedMessageBase64);
      const nonce = fullMessage.slice(0, nacl.box.nonceLength);
      const ciphertext = fullMessage.slice(nacl.box.nonceLength);
      const senderPublicKey = util.decodeBase64(senderPublicKeyBase64);

      const decrypted = nacl.box.open(
        ciphertext,
        nonce,
        senderPublicKey,
        recipientPrivateKey
      );

      if (!decrypted) return null;

      return util.encodeUTF8(decrypted);
    } catch (e) {
      console.error("Decryption failed:", e);
      return null;
    }
  }
}
