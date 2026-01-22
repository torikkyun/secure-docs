import * as bip39 from "bip39";
import { Buffer } from "buffer";
import { del, get, set } from "idb-keyval";
import nacl from "tweetnacl";
import util from "tweetnacl-util";

// Ensure Buffer is available globally
if (typeof window !== "undefined" && !window.Buffer) {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

const STORAGE_KEYS = {
  DEVICE_KEY: "secure_docs_device_key",
  WRAPPED_PRIVATE_KEY: "secure_docs_wrapped_priv_key",
  PUBLIC_KEY: "secure_docs_public_key",
};

export type Identity = {
  publicKey: string;
  privateKey: Uint8Array;
  mnemonic?: string;
};

/**
 * Identity Service - Quản lý identity (keypair) của user
 */
export const identityService = {
  /**
   * Tạo identity mới từ mnemonic
   */
  generate: async (): Promise<Identity> => {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const secretKey = new Uint8Array(seed.slice(0, 32));
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

    return {
      publicKey: util.encodeBase64(keyPair.publicKey),
      privateKey: keyPair.secretKey,
      mnemonic,
    };
  },

  /**
   * Khôi phục identity từ mnemonic
   */
  recover: async (mnemonic: string): Promise<Identity> => {
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
  },

  /**
   * Lưu identity vào IndexedDB (encrypt private key bằng device key)
   */
  save: async (identity: Identity): Promise<void> => {
    // Tạo device key không thể export
    const deviceKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    // Encrypt private key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const wrappedKeyBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      deviceKey,
      identity.privateKey as BufferSource
    );

    // Gộp IV + ciphertext
    const wrappedKeyCombined = new Uint8Array(
      iv.length + wrappedKeyBuffer.byteLength
    );
    wrappedKeyCombined.set(iv);
    wrappedKeyCombined.set(new Uint8Array(wrappedKeyBuffer), iv.length);

    // Lưu vào storage
    await set(STORAGE_KEYS.DEVICE_KEY, deviceKey);
    await set(STORAGE_KEYS.WRAPPED_PRIVATE_KEY, wrappedKeyCombined);
    await set(STORAGE_KEYS.PUBLIC_KEY, identity.publicKey);
  },

  /**
   * Load identity từ IndexedDB
   */
  load: async (): Promise<Identity | null> => {
    try {
      const deviceKey = await get<CryptoKey>(STORAGE_KEYS.DEVICE_KEY);
      const wrappedKeyCombined = await get<Uint8Array>(
        STORAGE_KEYS.WRAPPED_PRIVATE_KEY
      );
      const publicKey = await get<string>(STORAGE_KEYS.PUBLIC_KEY);

      if (!(deviceKey && wrappedKeyCombined && publicKey)) {
        return null;
      }

      // Tách IV và ciphertext
      const iv = wrappedKeyCombined.slice(0, 12);
      const ciphertext = wrappedKeyCombined.slice(12);

      // Decrypt private key
      const privateKeyBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
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
  },

  /**
   * Xóa identity khỏi storage
   */
  clear: async (): Promise<void> => {
    await del(STORAGE_KEYS.DEVICE_KEY);
    await del(STORAGE_KEYS.WRAPPED_PRIVATE_KEY);
    await del(STORAGE_KEYS.PUBLIC_KEY);
  },
};
