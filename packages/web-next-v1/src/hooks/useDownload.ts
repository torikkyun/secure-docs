import { useState } from "react";
import util from "tweetnacl-util";
import { downloadApi } from "@/lib/api";
import { KeyManager } from "@/lib/crypto/key-manager";

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  /**
   * Downloads and decrypts a file by:
   * 1. Loading user identity
   * 2. Requesting download metadata from backend
   * 3. Fetching encrypted file from IPFS
   * 4. Decrypting the file key
   * 5. Decrypting the file content
   * 6. Triggering browser download
   * 7. Completing download in backend
   */
  const downloadFile = async (
    fileId: string,
    onProgress?: (step: string) => void
  ) => {
    setIsDownloading(true);
    setError(null);
    setProgress("Starting download...");

    try {
      // Step 1: Load Identity
      const updateProgress = (msg: string) => {
        setProgress(msg);
        onProgress?.(msg);
      };

      updateProgress("Loading user identity...");
      const identity = await KeyManager.loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // Step 2: Request Download Metadata
      updateProgress("Requesting download metadata...");
      const response = await downloadApi.request(fileId);
      const {
        downloadId,
        cid,
        encryptedKey,
        ownerPublicKey,
        fileName,
        fileType,
      } = response as unknown as {
        downloadId: string;
        cid: string;
        encryptedKey: string;
        ownerPublicKey: string;
        fileName: string;
        fileType: string;
      };

      updateProgress(`Metadata received. CID: ${cid}`);

      // Step 3: Fetch Encrypted File from IPFS
      updateProgress("Fetching encrypted file from IPFS...");
      const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
      const ipfsRes = await fetch(`${gateway}/${cid}`);

      if (!ipfsRes.ok) {
        throw new Error(`Failed to fetch from IPFS: ${ipfsRes.statusText}`);
      }

      const encryptedFileBuffer = await ipfsRes.arrayBuffer();
      updateProgress(
        `File fetched. Size: ${encryptedFileBuffer.byteLength} bytes`
      );

      // Step 4: Decrypt the File Key
      updateProgress("Decrypting file key...");
      const decryptedKeyBase64 = KeyManager.decryptMessage(
        encryptedKey,
        ownerPublicKey, // Sender's public key (owner or grantor)
        identity.privateKey // My private key
      );

      if (!decryptedKeyBase64) {
        throw new Error(
          "Failed to decrypt file key. Permission denied or wrong key."
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
        ["decrypt"]
      );

      const decryptedBuffer = await subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        ciphertext
      );

      updateProgress("File content decrypted.");

      // Step 6: Trigger Download
      updateProgress("Preparing download...");
      const blob = new Blob([decryptedBuffer], {
        type: fileType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
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
