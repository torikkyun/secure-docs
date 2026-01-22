import { useState } from "react";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { downloadApi } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token-manager";
import { decryptMessage, loadIdentity } from "@/lib/crypto/key-manager";

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  /**
   * Downloads and decrypts a file by:
   * 1. Loading user identity
   * 2. Requesting download metadata from backend
   * 3. Fetching encrypted file from Backend
   * 4. Decrypting the file key
   * 5. Decrypting the file content
   * 6. Triggering browser download
   * 7. Completing download in backend
   */
  const downloadFile = async (
    fileId: string,
    onProgress?: (step: string) => void,
  ) => {
    setIsDownloading(true);
    setError(null);
    setProgress("Starting download...");

    try {
      // Step 1: Loading User Identity
      const updateProgress = (msg: string) => {
        setProgress(msg);
        onProgress?.(msg);
      };

      updateProgress("Loading user identity...");
      const identity = await loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // Step 2: Request Download Metadata
      updateProgress("Requesting download metadata...");
      const response = await downloadApi.request(fileId);
      const {
        downloadId,
        encryptedKey,
        ownerPublicKey,
        fileName,
        originalFileName,
        fileType,
      } = response as unknown as {
        downloadId: string;
        encryptedKey: string;
        ownerPublicKey: string;
        fileName: string;
        originalFileName: string;
        fileType: string;
      };

      updateProgress("Metadata received.");

      // Step 3: Fetch Encrypted File from Backend
      updateProgress("Fetching encrypted file from Backend...");
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const fileRes = await fetch(
        `${API_BASE_URL}/api/downloads/${downloadId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!fileRes.ok) {
        throw new Error(`Failed to fetch file: ${fileRes.statusText}`);
      }

      const encryptedFileBuffer = await fileRes.arrayBuffer();
      updateProgress(
        `File fetched. Size: ${encryptedFileBuffer.byteLength} bytes`,
      );

      // Step 4: Decrypt the File Key
      updateProgress("Decrypting file key...");

      // Cleanup strings
      const cleanOwnerPublicKey = ownerPublicKey.trim();
      const cleanEncryptedKey = encryptedKey.trim();

      console.log("[useDownload] Starting key decryption...");

      // Attempt 1: Try decrypting using the provided owner public key
      let decryptedKeyBase64 = decryptMessage(
        cleanEncryptedKey,
        cleanOwnerPublicKey,
        identity.privateKey,
      );

      // Attempt 2: Fallback (Self-Healing)
      if (!decryptedKeyBase64 && cleanOwnerPublicKey !== identity.publicKey) {
        console.warn(
          "Decryption with owner key failed. Retrying with local identity key...",
        );
        decryptedKeyBase64 = decryptMessage(
          cleanEncryptedKey,
          identity.publicKey,
          identity.privateKey,
        );
      }

      if (!decryptedKeyBase64) {
        console.error("[useDownload] Decryption failed.");
        throw new Error(
          "Decryption failed. This file may have been encrypted with a different key pair that is no longer available (e.g., if you re-registered or cleared browser data).",
        );
      }

      const aesKeyRaw = util.decodeBase64(decryptedKeyBase64);
      updateProgress("File key decrypted successfully.");

      // Step 5: Decrypt File Content (AES-GCM)
      updateProgress("Decrypting file content...");

      // Extract IV (first 12 bytes) and Ciphertext
      const iv = encryptedFileBuffer.slice(0, 12);
      const ciphertext = encryptedFileBuffer.slice(12);

      const subtle = window.crypto.subtle;
      const aesKey = await subtle.importKey(
        "raw",
        new Uint8Array(aesKeyRaw),
        { name: "AES-GCM" },
        false,
        ["decrypt"],
      );

      const decryptedBuffer = await subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        ciphertext,
      );

      updateProgress("File content decrypted.");

      // Step 6: Trigger Download
      updateProgress("Preparing download...");
      let finalFileName = originalFileName || fileName;
      if (finalFileName.toLowerCase().endsWith(".enc")) {
        finalFileName = finalFileName.slice(0, -4);
      }

      const blob = new Blob([decryptedBuffer], {
        type: fileType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateProgress("Download triggered.");

      // Step 7: Complete Download API
      updateProgress("Confirming download completion...");
      await downloadApi.complete(downloadId, true);

      updateProgress("Download completed successfully!");
      setIsDownloading(false);
      setProgress("");
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Download failed";
      setError(errorMessage);
      setIsDownloading(false);
      setProgress("");
      throw new Error(errorMessage);
    }
  };

  return { isDownloading, error, progress, downloadFile };
};
