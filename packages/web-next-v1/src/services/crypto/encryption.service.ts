import nacl from "tweetnacl";
import util from "tweetnacl-util";

const BASE64_REGEX = /^[A-Za-z0-9+/=]+$/;

/**
 * Encryption Service - Các chức năng encrypt/decrypt messages
 * Sử dụng NaCl Box (X25519 + XSalsa20-Poly1305)
 */
export const encryptionService = {
  /**
   * Encrypt message cho recipient
   * @returns base64 string chứa nonce + ciphertext
   */
  encrypt: (
    message: string,
    recipientPublicKeyBase64: string,
    senderPrivateKey: Uint8Array
  ): string => {
    try {
      if (!recipientPublicKeyBase64) {
        throw new Error("Recipient public key is required");
      }

      if (!BASE64_REGEX.test(recipientPublicKeyBase64)) {
        throw new Error("Invalid base64 format for recipient public key");
      }

      const recipientPublicKey = util.decodeBase64(recipientPublicKeyBase64);

      if (recipientPublicKey.length !== nacl.box.publicKeyLength) {
        throw new Error(
          `Invalid public key length: expected ${nacl.box.publicKeyLength}, got ${recipientPublicKey.length}`
        );
      }

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
    } catch (e) {
      console.error("Encryption failed:", e);
      throw new Error(
        `Failed to encrypt message: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }
  },

  /**
   * Decrypt message từ sender
   * @returns decrypted message hoặc null nếu thất bại
   */
  decrypt: (
    encryptedMessageBase64: string,
    senderPublicKeyBase64: string,
    recipientPrivateKey: Uint8Array
  ): string | null => {
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

      if (!decrypted) {
        return null;
      }

      return util.encodeUTF8(decrypted);
    } catch (e) {
      console.error("Decryption failed:", e);
      return null;
    }
  },
};
