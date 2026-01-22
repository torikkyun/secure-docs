// Custom hooks for file upload functionality
import { useState } from "react";
import util from "tweetnacl-util";
import { encryptMessage, loadIdentity } from "@/lib/crypto/key-manager";
import { fileApi } from "@/lib/api";

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Encrypts a File and uploads it to the Backend.
   * @param file File to upload
   */
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      // 1. Load User Identity (for encrypting the key)
      const identity = await loadIdentity();
      if (!identity) {
        throw new Error(
          "User identity not found. Please register/login first to generate keys.",
        );
      }

      // 2. Prepare upload (Check quota)
      const prepareRes = await fileApi.prepareUpload({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || undefined,
      });

      if (!prepareRes.canUpload) {
        throw new Error(
          prepareRes.message || "Cannot upload file. Check storage quota.",
        );
      }

      // 3. Generate AES-GCM key (File Key)
      const subtle = window.crypto.subtle;
      const aesKey = await subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      // 4. Encrypt File Content
      const fileArrayBuffer = await file.arrayBuffer();

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const cipherBuffer = await subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        fileArrayBuffer,
      );

      // Prepend IV to ciphertext
      const cipherUint8 = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(iv.byteLength + cipherUint8.byteLength);
      combined.set(iv, 0);
      combined.set(cipherUint8, iv.byteLength);

      const encryptedFile = new File([combined], `${file.name}.enc`, {
        type: "application/octet-stream",
      });

      // 5. Encrypt the AES Key for the Owner (Self) using KeyManager
      // We encrypt the symmetric key with the user's asymmetric public key
      // so only they (with their private key) can decrypt it.
      const exportedKey = await subtle.exportKey("raw", aesKey);
      const exportedKeyBase64 = util.encodeBase64(new Uint8Array(exportedKey));

      const encryptedKeyOwner = encryptMessage(
        exportedKeyBase64,
        identity.publicKey,
        identity.privateKey,
      );

      // 6. Upload Encrypted File to Backend
      // The backend will handle IPFS upload or local storage
      const result = await fileApi.upload({
        file: encryptedFile,
        encryptedKeyOwner,
      });

      setIsUploading(false);
      return result;
    } catch (err) {
      setIsUploading(false);
      throw err;
    }
  };

  return { isUploading, uploadFile };
};
