import util from "tweetnacl-util";

/**
 * File Encryption Service - Các chức năng encrypt/decrypt files
 * Sử dụng AES-GCM cho files
 */
export const fileEncryptionService = {
  /**
   * Tạo AES key mới
   */
  generateKey: async (): Promise<CryptoKey> =>
    await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    ),

  /**
   * Encrypt file với AES-GCM
   * @returns Uint8Array chứa IV (12 bytes) + ciphertext
   */
  encryptFile: async (
    fileData: ArrayBuffer,
    aesKey: CryptoKey
  ): Promise<Uint8Array> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      fileData
    );

    // Gộp IV + ciphertext
    const cipherUint8 = new Uint8Array(cipherBuffer);
    const combined = new Uint8Array(iv.byteLength + cipherUint8.byteLength);
    combined.set(iv, 0);
    combined.set(cipherUint8, iv.byteLength);

    return combined;
  },

  /**
   * Decrypt file với AES-GCM
   * @param encryptedData Uint8Array chứa IV (12 bytes) + ciphertext
   */
  decryptFile: async (
    encryptedData: Uint8Array,
    aesKey: CryptoKey
  ): Promise<ArrayBuffer> => {
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);

    return await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );
  },

  /**
   * Export AES key thành base64
   */
  exportKey: async (aesKey: CryptoKey): Promise<string> => {
    const exportedKey = await window.crypto.subtle.exportKey("raw", aesKey);
    return util.encodeBase64(new Uint8Array(exportedKey));
  },

  /**
   * Import AES key từ base64
   */
  importKey: async (keyBase64: string): Promise<CryptoKey> => {
    const keyData = util.decodeBase64(keyBase64);
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  },

  /**
   * Tính SHA-256 hash của file
   */
  hashFile: async (fileData: ArrayBuffer): Promise<string> => {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", fileData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return `0x${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  },
};
